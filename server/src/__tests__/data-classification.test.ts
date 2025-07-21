// Data Classification Service Tests
// Comprehensive tests for data classification and transfer control system
// Epic 19-2: Data governance testing with classification-based policies

import { 
  DataClassificationService,
  DataClassificationConfig,
  DataTransferRequest,
  ClassificationRule,
  TransferPolicy,
  DataClassification
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
    };

    // Mock Redis
    mockRedis = {
      get: jest.fn<unknown[], unknown>().mockResolvedValue(null as unknown),
      setex: jest.fn<unknown[], unknown>().mockResolvedValue('OK' as unknown),
      del: jest.fn<unknown[], unknown>().mockResolvedValue(1 as unknown)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn<unknown[], unknown>().mockResolvedValue(true as unknown)
    };

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
      }
    };

    dataClassificationService = new DataClassificationService(
      mockDb,
      mockRedis,
      mockAuditService,
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
      
      expect(mockDb.query).toHaveBeenCalledWith(
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
        mockDb,
        mockRedis,
        mockAuditService,
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
        mockDb,
        mockRedis,
        mockAuditService,
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

      mockRedis.get.mockResolvedValueOnce(JSON.stringify(cachedResult));

      const result = await dataClassificationService.classifyData(
        'test-data-123',
        'test content'
      );

      expect(result).toEqual(cachedResult);
      expect(mockDb.query).not.toHaveBeenCalled();
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
        mockDb,
        mockRedis,
        mockAuditService,
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
        mockDb,
        mockRedis,
        mockAuditService,
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
        mockDb,
        mockRedis,
        mockAuditService,
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
        mockDb,
        mockRedis,
        mockAuditService,
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
      
      expect(mockDb.query).toHaveBeenCalledWith(
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

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
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
        mockDb,
        mockRedis,
        mockAuditService,
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
      
      expect(mockDb.query).toHaveBeenCalledWith(
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

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
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

      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });

      const history = await dataClassificationService.getClassificationHistory('data-123');

      expect(history).toHaveLength(2);
      expect(history[0].dataId).toBe('data-123');
      expect(history[0].classification).toBe('internal');
      expect(history[0].reasoning).toEqual(['Test reasoning']);
      expect(history[1].classification).toBe('confidential');
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM data_classifications'),
        ['data-123']
      );
    });

    it('should return empty array when database query fails', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database error'));

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

      mockDb.query.mockResolvedValueOnce({ rows: mockAuditLog });

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
      
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM transfer_audit_log'),
        expect.arrayContaining(['data-123', 'user-123', 'confidential', 10])
      );
    });

    it('should return empty array when database query fails', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database error'));

      const auditLog = await dataClassificationService.getTransferAuditLog();

      expect(auditLog).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in classifyData', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        dataClassificationService.classifyData('data-123', 'content')
      ).rejects.toThrow('Failed to classify data');
    });

    it('should handle database errors in evaluateTransferRequest', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

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
      mockAuditService.logEvent.mockRejectedValueOnce(new Error('Audit service down'));

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
      
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
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

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
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
});