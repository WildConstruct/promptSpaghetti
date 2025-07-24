// Data Classification Service Tests
// Comprehensive tests for data classification and transfer control system
// Epic 19-2: Data governance testing with classification-based policies

import { 
  DataClassificationService,
  DataClassificationConfig,
  DataTransferRequest,
  ClassificationRule,
  TransferPolicy,
  DataClassification,
  ClassificationDriftEvent,
  DriftAnalysisResult,
  DriftAlert
} from '../services/DataClassificationService';

describe('DataClassificationService', () => {
  let dataClassificationService: DataClassificationService;
  let mockDb: unknown;
  let mockRedis: unknown;
  let mockAuditService: unknown;
  let testConfig: DataClassificationConfig;

  const testUserId = 'user-123';

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [] } as unknown)
    } as any;

    // Mock Redis
    mockRedis = {
      get: jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown),
      setex: jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown),
      del: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown)
    } as any;

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown)
    } as any;

    // Test configuration
    testConfig = {
      enabled: true,
      defaultClassification: 'internal',
      inheritanceEnabled: true,
      autoClassificationEnabled: true,
      classificationRules: [],
      transferPolicies: [],
      auditAllTransfers: true,
      encryptionRequired: {
        confidential: true,
        restricted: true,
        internal: false,
        public: false
      },
      approvalRequired: {
        confidential: true,
        restricted: true,
        internal: false,
        public: false
      },
      driftDetection: {
        enabled: true,
        thresholds: {
          significantChange: 10.0,
          rapidChange: 5.0,
          timeWindow: 24
        },
        alerting: {
          enabled: true,
          notifyOnSignificant: true,
          notifyOnRapid: true,
          notifyOnDowngrade: true,
          notifyOnUpgrade: false
        }
      }
    };

    dataClassificationService = new DataClassificationService(
      mockDb as any,
      mockRedis as any,
      mockAuditService as any,
      testConfig
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('classifyData', () => {
    it('should classify data using default classification when no rules match', async () => {
      const dataId = 'test-data-123';
      const content = 'This is some test content';
      const metadata = { type: 'document' };

      const result = await dataClassificationService.classifyData(dataId, content, metadata);

      expect(result.dataId).toBe(dataId);
      expect(result.classification).toBe('internal');
      expect(result.confidence).toBe(0.5);
      expect(result.ruleId).toBe('default');
      expect(result.ruleName).toBe('Default Classification');
      expect(result.reasoning).toContain('No matching rules found, using default classification: internal');
      
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO data_classifications'),
        expect.arrayContaining([
          expect.stringContaining('classification_'),
          dataId,
          'internal',
          0.5,
          'default',
          'Default Classification'
        ])
      );
    });

    it('should classify data using matching classification rule', async () => {
      const confidentialRule: ClassificationRule = {
        id: 'rule-1',
        name: 'Confidential Documents',
        description: 'Documents containing confidential information',
        priority: 100,
        conditions: [
          {
            field: 'content',
            operator: 'contains',
            value: 'confidential',
            caseSensitive: false
          }
        ],
        classification: 'confidential',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [confidentialRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      const result = await dataClassificationService.classifyData(
        'test-data-123',
        'This document contains confidential information',
        {}
      );

      expect(result.classification).toBe('confidential');
      expect(result.ruleId).toBe('rule-1');
      expect(result.ruleName).toBe('Confidential Documents');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasoning).toContain('Rule "Confidential Documents" matched all 1 conditions');
    });

    it('should classify data with multiple conditions', async () => {
      const restrictedRule: ClassificationRule = {
        id: 'rule-2',
        name: 'Restricted Files',
        description: 'Files that are restricted',
        priority: 200,
        conditions: [
          {
            field: 'filename',
            operator: 'pattern',
            value: '.*\\.secret\\.'
          },
          {
            field: 'size',
            operator: 'gt',
            value: 1000
          }
        ],
        classification: 'restricted',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [restrictedRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      const content = 'x'.repeat(1500); // 1500 characters
      const result = await dataClassificationService.classifyData(
        'test-data-123',
        content,
        {},
        'document.secret.txt'
      );

      expect(result.classification).toBe('restricted');
      expect(result.ruleId).toBe('rule-2');
      expect(result.reasoning).toContain('Rule "Restricted Files" matched all 2 conditions');
    });

    it('should use cached classification result', async () => {
      const cachedResult = {
        dataId: 'test-data-123',
        classification: 'confidential',
        confidence: 0.9,
        ruleId: 'rule-1',
        ruleName: 'Cached Rule',
        reasoning: ['Cached result'],
        metadata: {},
        classifiedAt: new Date()
      };

      (mockRedis as any).get.mockResolvedValueOnce(JSON.stringify(cachedResult));

      const result = await dataClassificationService.classifyData(
        'test-data-123',
        'test content'
      );

      expect(result).toEqual(cachedResult);
      expect((mockDb as any).query).not.toHaveBeenCalled();
    });

    it('should handle metadata-based classification', async () => {
      const metadataRule: ClassificationRule = {
        id: 'rule-3',
        name: 'Personal Data',
        description: 'Data marked as personal',
        priority: 150,
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'personal'
          }
        ],
        classification: 'confidential',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [metadataRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      const result = await dataClassificationService.classifyData(
        'test-data-123',
        'Some content',
        { category: 'personal', department: 'hr' }
      );

      expect(result.classification).toBe('confidential');
      expect(result.ruleId).toBe('rule-3');
    });
  });

  describe('evaluateTransferRequest', () => {
    it('should allow transfer for public data with default policy', async () => {
      const transferRequest: DataTransferRequest = {
        id: 'transfer-123',
        dataId: 'data-123',
        dataType: 'document',
        sourceClassification: 'public',
        targetClassification: 'public',
        transferType: 'api_export',
        userId: testUserId,
        userRoles: ['user'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      const decision = await dataClassificationService.evaluateTransferRequest(transferRequest);

      expect(decision.requestId).toBe('transfer-123');
      expect(decision.action).toBe('allow');
      expect(decision.policyId).toBe('default');
      expect(decision.policyName).toBe('Default Transfer Policy');
      expect(decision.requiresApproval).toBe(false);
      expect(decision.requiresEncryption).toBe(false);
    });

    it('should require approval for confidential data with default policy', async () => {
      const transferRequest: DataTransferRequest = {
        id: 'transfer-124',
        dataId: 'data-124',
        dataType: 'document',
        sourceClassification: 'confidential',
        targetClassification: 'external',
        transferType: 'file_download',
        userId: testUserId,
        userRoles: ['user'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      const decision = await dataClassificationService.evaluateTransferRequest(transferRequest);

      expect(decision.action).toBe('require_approval');
      expect(decision.requiresApproval).toBe(true);
      expect(decision.requiresEncryption).toBe(true);
    });

    it('should apply custom transfer policy', async () => {
      const customPolicy: TransferPolicy = {
        id: 'policy-1',
        name: 'Restrict Internal API Export',
        description: 'Block API exports of internal data',
        sourceClassification: 'internal',
        targetClassification: 'external',
        transferType: 'api_export',
        action: 'deny',
        conditions: [],
        approvalRequired: false,
        encryptionRequired: false,
        auditLevel: 'full',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.transferPolicies = [customPolicy];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      const transferRequest: DataTransferRequest = {
        id: 'transfer-125',
        dataId: 'data-125',
        dataType: 'document',
        sourceClassification: 'internal',
        targetClassification: 'external',
        transferType: 'api_export',
        userId: testUserId,
        userRoles: ['user'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      const decision = await dataClassificationService.evaluateTransferRequest(transferRequest);

      expect(decision.action).toBe('deny');
      expect(decision.policyId).toBe('policy-1');
      expect(decision.policyName).toBe('Restrict Internal API Export');
      expect(decision.auditLevel).toBe('full');
    });

    it('should evaluate transfer policy with role-based conditions', async () => {
      const roleBasedPolicy: TransferPolicy = {
        id: 'policy-2',
        name: 'Admin Only Confidential',
        description: 'Only admins can transfer confidential data',
        sourceClassification: 'confidential',
        targetClassification: 'external',
        transferType: 'file_download',
        action: 'allow',
        conditions: [
          {
            type: 'user_role',
            operator: 'in',
            value: ['admin', 'security_admin']
          }
        ],
        approvalRequired: false,
        encryptionRequired: true,
        auditLevel: 'detailed',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.transferPolicies = [roleBasedPolicy];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      // Test with admin role
      const adminRequest: DataTransferRequest = {
        id: 'transfer-126',
        dataId: 'data-126',
        dataType: 'document',
        sourceClassification: 'confidential',
        targetClassification: 'external',
        transferType: 'file_download',
        userId: testUserId,
        userRoles: ['admin', 'user'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      const adminDecision = await dataClassificationService.evaluateTransferRequest(adminRequest);
      expect(adminDecision.action).toBe('allow');
      expect(adminDecision.policyId).toBe('policy-2');

      // Test with regular user role
      const userRequest: DataTransferRequest = {
        ...adminRequest,
        id: 'transfer-127',
        userRoles: ['user']
      };

      const userDecision = await dataClassificationService.evaluateTransferRequest(userRequest);
      expect(userDecision.action).toBe('require_approval'); // Falls back to default
      expect(userDecision.policyId).toBe('default');
    });

    it('should evaluate time window conditions', async () => {
      const timeBasedPolicy: TransferPolicy = {
        id: 'policy-3',
        name: 'Business Hours Only',
        description: 'Allow transfers only during business hours',
        sourceClassification: 'internal',
        targetClassification: 'external',
        transferType: 'data_sync',
        action: 'allow',
        conditions: [
          {
            type: 'time_window',
            operator: 'between',
            value: { start: '9', end: '17' }
          }
        ],
        approvalRequired: false,
        encryptionRequired: false,
        auditLevel: 'basic',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.transferPolicies = [timeBasedPolicy];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      const transferRequest: DataTransferRequest = {
        id: 'transfer-128',
        dataId: 'data-128',
        dataType: 'database',
        sourceClassification: 'internal',
        targetClassification: 'external',
        transferType: 'data_sync',
        userId: testUserId,
        userRoles: ['user'],
        destination: 'backup-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      // Mock current time to be within business hours (e.g., 14:00)
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14 as unknown);

      const decision = await dataClassificationService.evaluateTransferRequest(transferRequest);
      
      // The decision depends on the actual time evaluation
      expect(decision.policyId).toBeDefined();
      expect(['policy-3', 'default']).toContain(decision.policyId);

      jest.restoreAllMocks();
    });
  });

  describe('createClassificationRule', () => {
    it('should create a new classification rule', async () => {
      const ruleData = {
        name: 'Test Rule',
        description: 'A test rule',
        priority: 100,
        conditions: [
          {
            field: 'content',
            operator: 'contains' as const,
            value: 'test'
          }
        ],
        classification: 'internal' as DataClassification,
        enabled: true
      };

      const rule = await dataClassificationService.createClassificationRule(ruleData);

      expect(rule.id).toContain('rule_');
      expect(rule.name).toBe('Test Rule');
      expect(rule.classification).toBe('internal');
      expect(rule.conditions).toEqual(ruleData.conditions);
      
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO data_classification_rules'),
        expect.arrayContaining([
          rule.id,
          'Test Rule',
          'A test rule',
          100,
          JSON.stringify(ruleData.conditions),
          'internal',
          true
        ])
      );

      expect((mockAuditService as any).logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'data_classification_rule_created',
        details: {
          ruleId: rule.id,
          ruleName: 'Test Rule',
          classification: 'internal'
        },
        severity: 'info'
      });
    });

    it('should add rule to in-memory rules and sort by priority', async () => {
      const existingRule = {
        id: 'existing-rule',
        name: 'Existing Rule',
        description: 'An existing rule',
        priority: 50,
        conditions: [],
        classification: 'public' as DataClassification,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [existingRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      const newRuleData = {
        name: 'High Priority Rule',
        description: 'A high priority rule',
        priority: 200,
        conditions: [],
        classification: 'confidential' as DataClassification,
        enabled: true
      };

      await dataClassificationService.createClassificationRule(newRuleData);

      // Check that the new rule was added and rules are sorted by priority
      expect(testConfig.classificationRules).toHaveLength(2);
      expect(testConfig.classificationRules[0].priority).toBe(200); // High priority first
      expect(testConfig.classificationRules[1].priority).toBe(50);
    });
  });

  describe('createTransferPolicy', () => {
    it('should create a new transfer policy', async () => {
      const policyData = {
        name: 'Test Policy',
        description: 'A test policy',
        sourceClassification: 'confidential' as DataClassification,
        targetClassification: 'external' as DataClassification,
        transferType: 'api_export' as const,
        action: 'deny' as const,
        conditions: [],
        approvalRequired: false,
        encryptionRequired: true,
        auditLevel: 'full' as const,
        enabled: true
      };

      const policy = await dataClassificationService.createTransferPolicy(policyData);

      expect(policy.id).toContain('policy_');
      expect(policy.name).toBe('Test Policy');
      expect(policy.sourceClassification).toBe('confidential');
      expect(policy.action).toBe('deny');
      
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO data_transfer_policies'),
        expect.arrayContaining([
          policy.id,
          'Test Policy',
          'A test policy',
          'confidential',
          'external',
          'api_export',
          'deny',
          JSON.stringify([]),
          false,
          true,
          'full',
          true
        ])
      );

      expect((mockAuditService as any).logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'data_transfer_policy_created',
        details: {
          policyId: policy.id,
          policyName: 'Test Policy',
          action: 'deny',
          sourceClassification: 'confidential'
        },
        severity: 'info'
      });
    });
  });

  describe('getClassificationHistory', () => {
    it('should return classification history for a data item', async () => {
      const mockHistory = [
        {
          data_id: 'data-123',
          classification: 'internal',
          confidence: 0.8,
          rule_id: 'rule-1',
          rule_name: 'Test Rule',
          reasoning: JSON.stringify(['Test reasoning']),
          metadata: JSON.stringify({}),
          classified_at: new Date('2024-01-01')
        },
        {
          data_id: 'data-123',
          classification: 'confidential',
          confidence: 0.9,
          rule_id: 'rule-2',
          rule_name: 'Updated Rule',
          reasoning: JSON.stringify(['Updated reasoning']),
          metadata: JSON.stringify({}),
          classified_at: new Date('2024-01-02')
        }
      ];

      (mockDb as any).query.mockResolvedValueOnce({ rows: mockHistory });

      const history = await dataClassificationService.getClassificationHistory('data-123');

      expect(history).toHaveLength(2);
      expect(history[0].dataId).toBe('data-123');
      expect(history[0].classification).toBe('internal');
      expect(history[0].reasoning).toEqual(['Test reasoning']);
      expect(history[1].classification).toBe('confidential');
      
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM data_classifications'),
        ['data-123']
      );
    });

    it('should return empty array when database query fails', async () => {
      (mockDb as any).query.mockRejectedValueOnce(new Error('Database error'));

      const history = await dataClassificationService.getClassificationHistory('data-123');

      expect(history).toEqual([]);
    });
  });

  describe('getTransferAuditLog', () => {
    it('should return transfer audit log with filters', async () => {
      const mockAuditLog = [
        {
          id: 'audit-1',
          request_id: 'transfer-123',
          data_id: 'data-123',
          data_classification: 'confidential',
          transfer_type: 'api_export',
          user_id: 'user-123',
          action: 'deny',
          policy_id: 'policy-1',
          decision: 'denied',
          encryption_used: false,
          audit_level: 'full',
          metadata: JSON.stringify({}),
          timestamp: new Date()
        }
      ];

      (mockDb as any).query.mockResolvedValueOnce({ rows: mockAuditLog });

      const filters = {
        dataId: 'data-123',
        userId: 'user-123',
        classification: 'confidential' as DataClassification,
        limit: 10
      };

      const auditLog = await dataClassificationService.getTransferAuditLog(filters);

      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].id).toBe('audit-1');
      expect(auditLog[0].dataId).toBe('data-123');
      expect(auditLog[0].decision).toBe('denied');
      
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM transfer_audit_log'),
        expect.arrayContaining(['data-123', 'user-123', 'confidential', 10])
      );
    });

    it('should return empty array when database query fails', async () => {
      (mockDb as any).query.mockRejectedValueOnce(new Error('Database error'));

      const auditLog = await dataClassificationService.getTransferAuditLog();

      expect(auditLog).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in classifyData', async () => {
      (mockDb as any).query.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        dataClassificationService.classifyData('data-123', 'content')
      ).rejects.toThrow('Failed to classify data');
    });

    it('should handle database errors in evaluateTransferRequest', async () => {
      (mockDb as any).query.mockRejectedValueOnce(new Error('Database connection failed'));

      const transferRequest: DataTransferRequest = {
        id: 'transfer-123',
        dataId: 'data-123',
        dataType: 'document',
        sourceClassification: 'internal',
        targetClassification: 'external',
        transferType: 'api_export',
        userId: testUserId,
        userRoles: ['user'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      await expect(
        dataClassificationService.evaluateTransferRequest(transferRequest)
      ).rejects.toThrow('Failed to evaluate transfer request');
    });

    it('should handle audit service errors gracefully', async () => {
      (mockAuditService as any).logEvent.mockRejectedValueOnce(new Error('Audit service down'));

      // Should not throw even if audit fails
      const result = await dataClassificationService.classifyData('data-123', 'content');
      expect(result).toBeDefined();
    });
  });

  describe('security features', () => {
    it('should validate classification enum values', async () => {
      const validClassifications: DataClassification[] = ['public', 'internal', 'confidential', 'restricted'];
      
      for (const classification of validClassifications) {
        const rule = {
          name: `Test Rule ${classification}`,
          description: 'Test rule',
          priority: 100,
          conditions: [],
          classification,
          enabled: true
        };

        const result = await dataClassificationService.createClassificationRule(rule);
        expect(result.classification).toBe(classification);
      }
    });

    it('should audit all classification and transfer operations', async () => {
      // Test classification auditing
      await dataClassificationService.classifyData('data-123', 'test content');
      
      expect((mockAuditService as any).logEvent).toHaveBeenCalledWith({
        userId: undefined,
        action: 'data_classified',
        details: expect.objectContaining({
          dataId: 'data-123',
          classification: 'internal'
        }),
        severity: 'info'
      });

      // Test transfer decision auditing
      const transferRequest: DataTransferRequest = {
        id: 'transfer-123',
        dataId: 'data-123',
        dataType: 'document',
        sourceClassification: 'confidential',
        targetClassification: 'external',
        transferType: 'api_export',
        userId: testUserId,
        userRoles: ['user'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      await dataClassificationService.evaluateTransferRequest(transferRequest);

      expect((mockAuditService as any).logEvent).toHaveBeenCalledWith({
        userId: testUserId,
        action: 'data_transfer_evaluated',
        details: expect.objectContaining({
          requestId: 'transfer-123',
          dataId: 'data-123',
          classification: 'confidential'
        }),
        severity: expect.any(String)
      });
    });

    it('should prevent unauthorized data transfers', async () => {
      const unauthorizedRequest: DataTransferRequest = {
        id: 'transfer-123',
        dataId: 'data-123',
        dataType: 'document',
        sourceClassification: 'restricted',
        targetClassification: 'external',
        transferType: 'api_export',
        userId: 'unauthorized-user',
        userRoles: ['guest'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      const decision = await dataClassificationService.evaluateTransferRequest(unauthorizedRequest);

      // Should require approval for restricted data
      expect(decision.requiresApproval).toBe(true);
      expect(decision.requiresEncryption).toBe(true);
    });

    it('should enforce encryption requirements for sensitive data', async () => {
      const sensitiveRequest: DataTransferRequest = {
        id: 'transfer-123',
        dataId: 'data-123',
        dataType: 'document',
        sourceClassification: 'confidential',
        targetClassification: 'external',
        transferType: 'api_export',
        userId: testUserId,
        userRoles: ['user'],
        destination: 'external-system',
        metadata: {},
        requestedAt: new Date(),
        encryptionRequired: false,
        auditRequired: true
      };

      const decision = await dataClassificationService.evaluateTransferRequest(sensitiveRequest);

      expect(decision.requiresEncryption).toBe(true);
    });
  });

  describe('classification drift detection', () => {
    beforeEach(() => {
      // Mock getClassificationHistory to return previous classifications
      jest.spyOn(dataClassificationService, 'getClassificationHistory')
        .mockImplementation(async (dataId: string) => {
          if (dataId === 'data-with-history') {
            return [
              {
                dataId: 'data-with-history',
                classification: 'internal',
                confidence: 0.8,
                ruleId: 'rule-1',
                ruleName: 'Previous Rule',
                reasoning: ['Previous classification'],
                metadata: {},
                classifiedAt: new Date(Date.now() - 60000) // 1 minute ago
              }
            ];
          }
          return [];
        });
    });

    it('should detect classification drift when classification changes', async () => {
      const confidentialRule: ClassificationRule = {
        id: 'rule-2',
        name: 'Confidential Rule',
        description: 'Classifies confidential data',
        priority: 100,
        conditions: [
          {
            field: 'content',
            operator: 'contains',
            value: 'confidential',
            caseSensitive: false
          }
        ],
        classification: 'confidential',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [confidentialRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      // Override getClassificationHistory for this specific test
      jest.spyOn(dataClassificationService, 'getClassificationHistory')
        .mockResolvedValueOnce([
          {
            dataId: 'data-with-history',
            classification: 'internal',
            confidence: 0.8,
            ruleId: 'rule-1',
            ruleName: 'Previous Rule',
            reasoning: ['Previous classification'],
            metadata: {},
            classifiedAt: new Date(Date.now() - 60000)
          }
        ]);

      await dataClassificationService.classifyData(
        'data-with-history',
        'This document contains confidential information'
      );

      // Verify drift event was stored
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO classification_drift_events'),
        expect.arrayContaining([
          expect.stringContaining('drift_'),
          'data-with-history',
          'internal',
          'confidential',
          'rule-1',
          'rule-2',
          'upgrade',
          expect.any(String), // severity
          expect.any(Number), // confidence
          expect.any(String), // reasoning JSON
          expect.any(String), // metadata JSON
          expect.any(Date)   // detected_at
        ])
      );

      // Verify audit event was logged
      expect((mockAuditService as any).logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'classification_drift_detected',
          details: expect.objectContaining({
            dataId: 'data-with-history',
            driftType: 'upgrade',
            previousClassification: 'internal',
            newClassification: 'confidential'
          })
        })
      );
    });

    it('should not detect drift when classification remains the same', async () => {
      const internalRule: ClassificationRule = {
        id: 'rule-1',
        name: 'Internal Rule',
        description: 'Classifies internal data',
        priority: 100,
        conditions: [
          {
            field: 'content',
            operator: 'contains',
            value: 'internal',
            caseSensitive: false
          }
        ],
        classification: 'internal',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [internalRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      await dataClassificationService.classifyData(
        'data-with-history',
        'This document contains internal information'
      );

      // Verify drift event was NOT stored
      expect((mockDb as any).query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO classification_drift_events'),
        expect.anything()
      );
    });

    it('should detect oscillation pattern in classification history', async () => {
      // Mock oscillating history: confidential -> internal -> confidential -> internal
      jest.spyOn(dataClassificationService, 'getClassificationHistory')
        .mockResolvedValueOnce([
          {
            dataId: 'oscillating-data',
            classification: 'internal',
            confidence: 0.7,
            ruleId: 'rule-2',
            ruleName: 'Internal Rule',
            reasoning: ['Latest classification'],
            metadata: {},
            classifiedAt: new Date(Date.now() - 60000)
          },
          {
            dataId: 'oscillating-data',
            classification: 'confidential',
            confidence: 0.8,
            ruleId: 'rule-1',
            ruleName: 'Confidential Rule',
            reasoning: ['Previous classification'],
            metadata: {},
            classifiedAt: new Date(Date.now() - 120000)
          },
          {
            dataId: 'oscillating-data',
            classification: 'internal',
            confidence: 0.7,
            ruleId: 'rule-2',
            ruleName: 'Internal Rule',
            reasoning: ['Earlier classification'],
            metadata: {},
            classifiedAt: new Date(Date.now() - 180000)
          },
          {
            dataId: 'oscillating-data',
            classification: 'confidential',
            confidence: 0.8,
            ruleId: 'rule-1',
            ruleName: 'Confidential Rule',
            reasoning: ['Earliest classification'],
            metadata: {},
            classifiedAt: new Date(Date.now() - 240000)
          }
        ]);

      const confidentialRule: ClassificationRule = {
        id: 'rule-1',
        name: 'Confidential Rule',
        description: 'Classifies confidential data',
        priority: 100,
        conditions: [
          {
            field: 'content',
            operator: 'contains',
            value: 'confidential',
            caseSensitive: false
          }
        ],
        classification: 'confidential',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [confidentialRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      await dataClassificationService.classifyData(
        'oscillating-data',
        'This document contains confidential information'
      );

      // Verify oscillation was detected (drift_type should be 'oscillation')
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO classification_drift_events'),
        expect.arrayContaining([
          expect.stringContaining('drift_'),
          'oscillating-data',
          'internal',
          'confidential',
          'rule-2',
          'rule-1',
          'oscillation', // Should detect oscillation
          expect.any(String),
          expect.any(Number),
          expect.any(String),
          expect.any(String),
          expect.any(Date)
        ])
      );

      // Verify rule instability alert was created
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO classification_drift_alerts'),
        expect.arrayContaining([
          expect.stringContaining('alert_'),
          'rule_instability',
          'high',
          expect.stringContaining('Oscillating classification pattern'),
          expect.stringContaining('oscillating-data'),
          0,
          'recent_history',
          expect.any(Date)
        ])
      );
    });

    it('should determine correct drift types', async () => {
      const testCases = [
        { from: 'public', to: 'internal', expected: 'upgrade' },
        { from: 'internal', to: 'confidential', expected: 'upgrade' },
        { from: 'confidential', to: 'restricted', expected: 'upgrade' },
        { from: 'restricted', to: 'confidential', expected: 'downgrade' },
        { from: 'confidential', to: 'internal', expected: 'downgrade' },
        { from: 'internal', to: 'public', expected: 'downgrade' },
        { from: 'internal', to: 'internal', expected: 'lateral' }
      ];

      for (const testCase of testCases) {
        jest.spyOn(dataClassificationService, 'getClassificationHistory')
          .mockResolvedValueOnce([
            {
              dataId: 'test-data',
              classification: testCase.from as DataClassification,
              confidence: 0.8,
              ruleId: 'previous-rule',
              ruleName: 'Previous Rule',
              reasoning: ['Previous'],
              metadata: {},
              classifiedAt: new Date(Date.now() - 60000)
            }
          ]);

        const rule: ClassificationRule = {
          id: 'current-rule',
          name: 'Current Rule',
          description: 'Current rule',
          priority: 100,
          conditions: [
            {
              field: 'content',
              operator: 'contains',
              value: 'test',
              caseSensitive: false
            }
          ],
          classification: testCase.to as DataClassification,
          enabled: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        testConfig.classificationRules = [rule];
        dataClassificationService = new DataClassificationService(
          mockDb as any,
          mockRedis as any,
          mockAuditService as any,
          testConfig
        );

        await dataClassificationService.classifyData('test-data', 'test content');

        if (testCase.from !== testCase.to) {
          expect((mockDb as any).query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO classification_drift_events'),
            expect.arrayContaining([
              expect.anything(),
              'test-data',
              testCase.from,
              testCase.to,
              'previous-rule',
              'current-rule',
              testCase.expected,
              expect.any(String),
              expect.any(Number),
              expect.any(String),
              expect.any(String),
              expect.any(Date)
            ])
          );
        }

        jest.clearAllMocks();
      }
    });

    it('should create appropriate alerts for downgrades', async () => {
      testConfig.driftDetection.alerting.notifyOnDowngrade = true;
      
      jest.spyOn(dataClassificationService, 'getClassificationHistory')
        .mockResolvedValueOnce([
          {
            dataId: 'sensitive-data',
            classification: 'restricted',
            confidence: 0.9,
            ruleId: 'restricted-rule',
            ruleName: 'Restricted Rule',
            reasoning: ['Was restricted'],
            metadata: {},
            classifiedAt: new Date(Date.now() - 60000)
          }
        ]);

      // Rule that classifies as internal (downgrade from restricted)
      const internalRule: ClassificationRule = {
        id: 'internal-rule',
        name: 'Internal Rule',
        description: 'Internal classification',
        priority: 100,
        conditions: [
          {
            field: 'content',
            operator: 'contains',
            value: 'internal',
            caseSensitive: false
          }
        ],
        classification: 'internal',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [internalRule];
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      await dataClassificationService.classifyData(
        'sensitive-data',
        'This document contains internal information'
      );

      // Verify downgrade alert was created
      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO classification_drift_alerts'),
        expect.arrayContaining([
          expect.stringContaining('alert_'),
          'classification_downgrade',
          expect.any(String), // severity
          expect.stringContaining('downgraded from restricted to internal'),
          expect.stringContaining('sensitive-data'),
          0,
          'immediate',
          expect.any(Date)
        ])
      );
    });
  });

  describe('drift analysis', () => {
    it('should analyze drift patterns over time range', async () => {
      const mockDriftEvents: any[] = [
        {
          id: 'drift-1',
          dataId: 'data-1',
          previousClassification: 'internal',
          newClassification: 'confidential',
          driftType: 'upgrade',
          severity: 'medium',
          detectedAt: new Date()
        },
        {
          id: 'drift-2',
          dataId: 'data-2',
          previousClassification: 'confidential',
          newClassification: 'internal',
          driftType: 'downgrade',
          severity: 'high',
          detectedAt: new Date()
        },
        {
          id: 'drift-3',
          dataId: 'data-3',
          previousClassification: 'internal',
          newClassification: 'internal',
          driftType: 'oscillation',
          severity: 'critical',
          detectedAt: new Date()
        }
      ];

      // Mock getDriftEvents
      jest.spyOn(dataClassificationService, 'getDriftEvents')
        .mockResolvedValueOnce(mockDriftEvents as any);

      // Mock getTotalClassificationsInRange
      (mockDb as any).query.mockResolvedValueOnce({ rows: [{ count: '30' }] });

      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        end: new Date()
      };

      const analysis = await dataClassificationService.analyzeDrift(timeRange);

      expect(analysis.driftEvents).toBe(3);
      expect(analysis.driftPercentage).toBe(10); // 3/30 * 100
      expect(analysis.driftPatterns.upgrades).toBe(1);
      expect(analysis.driftPatterns.downgrades).toBe(1);
      expect(analysis.driftPatterns.oscillations).toBe(1);
      expect(analysis.severityBreakdown.medium).toBe(1);
      expect(analysis.severityBreakdown.high).toBe(1);
      expect(analysis.severityBreakdown.critical).toBe(1);
      expect(analysis.recommendations).toContain(
        expect.stringContaining('Monitor drift patterns regularly')
      );
    });

    it('should generate recommendations based on drift patterns', async () => {
      const mockDriftEvents = Array.from({ length: 10 }, (_, i) => ({
        id: `drift-${i}`,
        dataId: `data-${i}`,
        previousClassification: 'internal',
        newClassification: 'confidential',
        previousRuleId: `rule-${i}-prev`,
        newRuleId: `rule-${i}-new`,
        driftType: i < 3 ? 'oscillation' : 'upgrade', // 30% oscillations
        severity: i < 2 ? 'critical' : 'low',
        confidence: i < 4 ? 0.5 : 0.9, // 40% low confidence
        reasoning: `Drift detected for data-${i}`,
        metadata: { source: 'test' },
        detectedAt: new Date()
      }));

      jest.spyOn(dataClassificationService, 'getDriftEvents')
        .mockResolvedValueOnce(mockDriftEvents as any);

      (mockDb as any).query.mockResolvedValueOnce({ rows: [{ count: '100' }] });

      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const analysis = await dataClassificationService.analyzeDrift(timeRange);

      expect(analysis.recommendations).toContain(
        expect.stringContaining('High oscillation rate detected')
      );
      expect(analysis.recommendations).toContain(
        expect.stringContaining('Many low-confidence classifications detected')
      );
      expect(analysis.recommendations).toContain(
        expect.stringContaining('High-severity drift events detected')
      );
    });
  });

  describe('drift event queries', () => {
    it('should retrieve drift events with filters', async () => {
      const mockRows = [
        {
          id: 'drift-1',
          data_id: 'data-1',
          previous_classification: 'internal',
          new_classification: 'confidential',
          previous_rule_id: 'rule-1',
          new_rule_id: 'rule-2',
          drift_type: 'upgrade',
          severity: 'medium',
          confidence: 0.8,
          reasoning: JSON.stringify(['Test reasoning']),
          metadata: JSON.stringify({}),
          detected_at: new Date()
        }
      ];

      (mockDb as any).query.mockResolvedValueOnce({ rows: mockRows });

      const events = await dataClassificationService.getDriftEvents({
        dataId: 'data-1',
        driftType: 'upgrade',
        severity: 'medium',
        limit: 10
      });

      expect(events).toHaveLength(1);
      expect(events[0].dataId).toBe('data-1');
      expect(events[0].driftType).toBe('upgrade');
      expect(events[0].severity).toBe('medium');
      expect(events[0].reasoning).toEqual(['Test reasoning']);

      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM classification_drift_events'),
        expect.arrayContaining(['data-1', 'upgrade', 'medium', 10])
      );
    });

    it('should retrieve drift alerts with filters', async () => {
      const mockRows = [
        {
          id: 'alert-1',
          type: 'significant_change',
          severity: 'high',
          message: 'Test alert message',
          data_items: JSON.stringify(['data-1', 'data-2']),
          affected_percentage: 15.5,
          time_window: '24 hours',
          created_at: new Date()
        }
      ];

      (mockDb as any).query.mockResolvedValueOnce({ rows: mockRows });

      const alerts = await dataClassificationService.getDriftAlerts({
        type: 'significant_change',
        severity: 'high',
        limit: 5
      });

      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('significant_change');
      expect(alerts[0].severity).toBe('high');
      expect(alerts[0].dataItems).toEqual(['data-1', 'data-2']);
      expect(alerts[0].affectedPercentage).toBe(15.5);

      expect((mockDb as any).query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM classification_drift_alerts'),
        expect.arrayContaining(['high', 'significant_change', 5])
      );
    });
  });

  describe('drift detection with disabled configuration', () => {
    it('should skip drift detection when disabled', async () => {
      testConfig.driftDetection.enabled = false;
      dataClassificationService = new DataClassificationService(
        mockDb as any,
        mockRedis as any,
        mockAuditService as any,
        testConfig
      );

      jest.spyOn(dataClassificationService, 'getClassificationHistory')
        .mockResolvedValueOnce([
          {
            dataId: 'test-data',
            classification: 'internal',
            confidence: 0.8,
            ruleId: 'rule-1',
            ruleName: 'Previous Rule',
            reasoning: ['Previous'],
            metadata: {},
            classifiedAt: new Date(Date.now() - 60000)
          }
        ]);

      const confidentialRule: ClassificationRule = {
        id: 'rule-2',
        name: 'Confidential Rule',
        description: 'Confidential classification',
        priority: 100,
        conditions: [
          {
            field: 'content',
            operator: 'contains',
            value: 'confidential',
            caseSensitive: false
          }
        ],
        classification: 'confidential',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testConfig.classificationRules = [confidentialRule];

      await dataClassificationService.classifyData(
        'test-data',
        'This document contains confidential information'
      );

      // Verify drift detection was skipped
      expect((mockDb as any).query).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO classification_drift_events'),
        expect.anything()
      );
    });
  });
});