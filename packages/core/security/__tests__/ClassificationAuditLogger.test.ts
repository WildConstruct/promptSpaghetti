/**
 * Test Suite for Classification Audit Logger
 * 
 * Tests the audit logging system for data classification operations,
 * including integrity verification, compliance reporting, and export capabilities.
 */
import {
  ClassificationAuditLogger,
  AuditLoggerConfig,
  AuditEventType,
  AuditQueryFilter,
  ExportFormat,
  RetentionPolicy,
  ComplianceReport
} from '../ClassificationAuditLogger';
import {
  ClassificationLevel,
  DataCategory,
  ComplianceFramework,
  ClassificationResult,
  DataElement
} from '../DataClassifier';
import { AlertSeverity } from '../ClassificationMonitor';
import { randomBytes } from 'crypto';
describe('ClassificationAuditLogger', () => {
  let auditLogger: ClassificationAuditLogger;
  let testConfig: AuditLoggerConfig;
  const createTestActor = () => ({)
    userId: 'user-123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    sessionId: 'session-456',
  });
  const createTestDataElement = (overrides?: Partial<DataElement>): DataElement => ({)
    id: 'data-123',
    fieldName: 'email',
    value: 'test@example.com',
    dataType: 'string',
    context: { userId: 'user-456' },
    source: 'api',
    timestamp: new Date(),
    ...overrides
  });
  const createTestClassificationResult = (;)
    overrides?: Partial<ClassificationResult>
  ): ClassificationResult => ({)
    level: ClassificationLevel.CONFIDENTIAL,
    category: DataCategory.PII,
    confidence: 95,
    matchedRules: ['pii-email'],
    complianceRequirements: [ComplianceFramework.GDPR],
    encryptionRequired: true,
    retentionPeriod: '7 years',
    accessControls: ['mfa-required', 'role-based-access'],
    reasoning: ['Email address detected'],
    ...overrides
  });
  beforeEach(() => {
    jest.useFakeTimers();
    const retentionPolicies: RetentionPolicy[] = [
      {
        framework: ComplianceFramework.GDPR,
        eventType: AuditEventType.CLASSIFICATION_PERFORMED,
        retentionDays: 30,
        deleteAfterDays: 90,
        requiresApproval: false,
      },
      {
        framework: ComplianceFramework.HIPAA,
        eventType: AuditEventType.ACCESS_GRANTED,
        retentionDays: 180,
        deleteAfterDays: 2555, // 7 years
        requiresApproval: true,
      }
    ];
    testConfig = {
      enableRealTimeLogging: true,
      enableCompression: false,
      enableEncryption: false,
      signatureKey: randomBytes(32),
      retentionPolicies,
      logRotationSizeMB: 10,
      logRotationIntervalHours: 24,
      archiveLocation: '/archive',
      performanceMode: 'balanced',
    };
    auditLogger = new ClassificationAuditLogger(testConfig);
  });
  afterEach(() => {
    auditLogger.destroy();
    jest.useRealTimers();
  });
  describe('Classification Logging', () => {
    test('should log classification events', async () => {
      const dataElement = createTestDataElement();
      const result = createTestClassificationResult();
      const actor = createTestActor();
      const logId = await auditLogger.logClassification(;)
        dataElement,
        result,
        actor,
        25
      );
      expect(logId).toMatch(/^log_\d+_[a-f0-9]{16}$/);
      const logs = await auditLogger.queryLogs({ limit: 1 });
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({)
        id: logId,
        eventType: AuditEventType.CLASSIFICATION_PERFORMED,
        actor,
        target: {,
          dataId: dataElement.id,
          resourceType: 'data_element',
          classification: result,
        },
        action: {,
          operation: 'classify',
          result: 'success',
          duration: 25,
        },
        compliance: {,
          frameworks: [ComplianceFramework.GDPR],
          dataCategory: DataCategory.PII,
          retentionRequired: true,
          encryptionApplied: true,
        }
      });
    });
    test('should log classification updates', async () => {
      const actor = createTestActor();
      const logId = await auditLogger.logClassificationUpdate(;)
        'data-123',
        ClassificationLevel.INTERNAL,
        ClassificationLevel.CONFIDENTIAL,
        'Reclassified after review',
        actor
      );
      const logs = await auditLogger.queryLogs({ eventTypes: [AuditEventType.CLASSIFICATION_UPDATED] });
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({)
        eventType: AuditEventType.CLASSIFICATION_UPDATED,
        action: {,
          operation: 'update_classification',
          result: 'success',
          reason: 'Reclassified after review'
        },
        context: {,
          metadata: {,
            oldLevel: ClassificationLevel.INTERNAL,
            newLevel: ClassificationLevel.CONFIDENTIAL,
          }
        }
      });
    });
  });
  describe('Policy Violation Logging', () => {
    test('should log policy violations', async () => {
      const actor = createTestActor();
      const logId = await auditLogger.logPolicyViolation(;)
        {
          dataId: 'data-123',
          policyId: 'policy-456',
          description: 'Unencrypted PII data',
          severity: AlertSeverity.WARNING,
          framework: ComplianceFramework.GDPR,
        },
        actor
      );
      const logs = await auditLogger.queryLogs({ eventTypes: [AuditEventType.POLICY_VIOLATION] });
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({)
        eventType: AuditEventType.POLICY_VIOLATION,
        action: {,
          operation: 'policy_check',
          result: 'failure',
          reason: 'Unencrypted PII data'
        },
        compliance: {,
          frameworks: [ComplianceFramework.GDPR],
        }
      });
    });
    test('should emit alert for critical violations', async () => {
      const alertHandler = jest.fn<unknown[], unknown>();
      auditLogger.on('criticalViolation', alertHandler);
      const actor = createTestActor();
      await auditLogger.logPolicyViolation()
        {
          dataId: 'data-123',
          policyId: 'policy-456',
          description: 'Exposed credit card data',
          severity: AlertSeverity.CRITICAL,
          framework: ComplianceFramework.PCI_DSS,
        },
        actor
      );
      expect(alertHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
          violation: expect.objectContaining({),
            severity: AlertSeverity.CRITICAL,
            framework: ComplianceFramework.PCI_DSS,
          })
        })
      );
    });
  });
  describe('Access Logging', () => {
    test('should log access granted events', async () => {
      const actor = createTestActor();
      const classification = createTestClassificationResult();
      await auditLogger.logDataAccess()
        'data-123',
        true,
        'User has required permissions',
        actor,
        classification
      );
      const logs = await auditLogger.queryLogs({ eventTypes: [AuditEventType.ACCESS_GRANTED] });
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({)
        eventType: AuditEventType.ACCESS_GRANTED,
        action: {,
          operation: 'access_request',
          result: 'success',
          reason: 'User has required permissions'
        },
        target: {,
          classification
        }
      });
    });
    test('should log access denied events', async () => {
      const actor = createTestActor();
      await auditLogger.logDataAccess()
        'data-123',
        false,
        'Insufficient permissions',
        actor
      );
      const logs = await auditLogger.queryLogs({ eventTypes: [AuditEventType.ACCESS_DENIED] });
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({)
        eventType: AuditEventType.ACCESS_DENIED,
        action: {,
          operation: 'access_request',
          result: 'failure',
          reason: 'Insufficient permissions'
        }
      });
    });
  });
  describe('Query Functionality', () => {
    beforeEach(async () => {
      // Populate with diverse logs
      const actor = createTestActor();
      // Classification events
      for (let i = 0; i < 5; i++) {
        await auditLogger.logClassification()
          createTestDataElement({ id: `data-${i}` }),}
          createTestClassificationResult(),
          actor,
          20 + i
        );
      }
      // Access events
      await auditLogger.logDataAccess('data-1', true, 'Granted', actor);
      await auditLogger.logDataAccess('data-2', false, 'Denied', actor);
      // Policy violations
      await auditLogger.logPolicyViolation()
        {
          dataId: 'data-3',
          policyId: 'policy-1',
          description: 'Violation',
          severity: AlertSeverity.WARNING,
          framework: ComplianceFramework.GDPR,
        },
        actor
      );
    });
    test('should filter by event type', async () => {
      const classificationLogs = await auditLogger.queryLogs({)
        eventTypes: [AuditEventType.CLASSIFICATION_PERFORMED],
      });
      expect(classificationLogs).toHaveLength(5);
      const accessLogs = await auditLogger.queryLogs({)
        eventTypes: [AuditEventType.ACCESS_GRANTED, AuditEventType.ACCESS_DENIED]
      });
      expect(accessLogs).toHaveLength(2);
    });
    test('should filter by date range', async () => {
      // Advance time
      jest.advanceTimersByTime(3600000); // 1 hour
      // Add new log
      await auditLogger.logClassification()
        createTestDataElement({ id: 'data-new' }),
        createTestClassificationResult(),
        createTestActor(),
        30
      );
      const recentLogs = await auditLogger.queryLogs({)
        startDate: new Date(Date.now() - 1800000) // Last 30 minutes
      });
      expect(recentLogs).toHaveLength(1);
      expect(recentLogs[0].target.dataId).toBe('data-new');
    });
    test('should filter by user ID', async () => {
      const differentActor = {
        ...createTestActor(),
        userId: 'user-999',
      };
      await auditLogger.logClassification()
        createTestDataElement({ id: 'data-different' }),
        createTestClassificationResult(),
        differentActor,
        25
      );
      const userLogs = await auditLogger.queryLogs({)
        userIds: ['user-999'],
      });
      expect(userLogs).toHaveLength(1);
      expect(userLogs[0].actor.userId).toBe('user-999');
    });
    test('should support text search', async () => {
      const logs = await auditLogger.queryLogs({)
        searchText: 'Violation',
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].eventType).toBe(AuditEventType.POLICY_VIOLATION);
    });
    test('should support pagination', async () => {
      const page1 = await auditLogger.queryLogs({)
        limit: 3,
        offset: 0,
      });
      expect(page1).toHaveLength(3);
      const page2 = await auditLogger.queryLogs({)
        limit: 3,
        offset: 3,
      });
      expect(page2).toHaveLength(3);
      // Ensure different logs
      const page1Ids = page1.map(log => log.id);
      const page2Ids = page2.map(log => log.id);
      expect(page1Ids).not.toEqual(expect.arrayContaining(page2Ids));
    });
  });
  describe('Integrity Verification', () => {
    test('should maintain hash chain integrity', async () => {
      const actor = createTestActor();
      // Create multiple logs
      for (let i = 0; i < 5; i++) {
        await auditLogger.logClassification()
          createTestDataElement({ id: `data-${i}` }),}
          createTestClassificationResult(),
          actor,
          20
        );
      }
      const verification = await auditLogger.verifyIntegrity();
      expect(verification.valid).toBe(true);
      expect(verification.errors).toHaveLength(0);
    });
    test('should detect hash chain tampering', async () => {
      const actor = createTestActor();
      // Create logs
      await auditLogger.logClassification()
        createTestDataElement(),
        createTestClassificationResult(),
        actor,
        20
      );
      // Tamper with logs (access private property for testing)
      const logs = (auditLogger as any).logs;
      if (logs[0]) {
        logs[0].action.duration = 999; // Modify content
      }
      const verification = await auditLogger.verifyIntegrity();
      expect(verification.valid).toBe(false);
      expect(verification.errors).toHaveLength(1);
      expect(verification.errors[0].error).toBe('Log hash mismatch');
    });
    test('should verify signatures in high security mode', async () => {
      const secureConfig: AuditLoggerConfig = {
        ...testConfig,
        performanceMode: 'high_security',
      };
      const secureLogger = new ClassificationAuditLogger(secureConfig);
      const actor = createTestActor();
      await secureLogger.logClassification()
        createTestDataElement(),
        createTestClassificationResult(),
        actor,
        20
      );
      const logs = await secureLogger.queryLogs({ limit: 1 });
      expect(logs[0].integrity.signature).toBeDefined();
      const verification = await secureLogger.verifyIntegrity();
      expect(verification.valid).toBe(true);
      secureLogger.destroy();
    });
  });
  describe('Compliance Reporting', () => {
    beforeEach(async () => {
      const actor = createTestActor();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago;
      // Create various events
      for (let i = 0; i < 10; i++) {
        await auditLogger.logClassification()
          createTestDataElement({ id: `data-${i}` }),}
          createTestClassificationResult({)
            complianceRequirements: [ComplianceFramework.GDPR],
          }),
          actor,
          20
        );
      }
      // Add violations
      await auditLogger.logPolicyViolation()
        {
          dataId: 'data-1',
          policyId: 'gdpr-policy',
          description: 'Missing consent',
          severity: AlertSeverity.WARNING,
          framework: ComplianceFramework.GDPR,
        },
        actor
      );
      await auditLogger.logPolicyViolation()
        {
          dataId: 'data-2',
          policyId: 'gdpr-policy',
          description: 'Data retention exceeded',
          severity: AlertSeverity.ERROR,
          framework: ComplianceFramework.GDPR,
        },
        actor
      );
    });
    test('should generate compliance report', async () => {
      const report = await auditLogger.generateComplianceReport(;)
        ComplianceFramework.GDPR,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        new Date()
      );
      expect(report).toMatchObject({)
        framework: ComplianceFramework.GDPR,
        summary: {,
          totalEvents: 12, // 10 classifications + 2 violations
          compliantEvents: 10,
          violations: 2,
          complianceRate: expect.closeTo(83.33, 1)
        },
        dataProcessing: {,
          classified: 10,
          accessed: 0,
          exported: 0,
          deleted: 0,
        },
        violationDetails: expect.arrayContaining([),
          expect.objectContaining({)
            description: 'Missing consent',
            severity: 'medium',
          }),
          expect.objectContaining({)
            description: 'Data retention exceeded',
            severity: 'high',
          })
        ])
      });
      expect(report.recommendations).toContain()
        'Ensure data minimization principles are followed'
      );
    });
    test('should include recommendations based on violations', async () => {
      // Add more violations to trigger recommendations
      const actor = createTestActor();
      for (let i = 0; i < 10; i++) {
        await auditLogger.logPolicyViolation()
          {
            dataId: `data-${i}`,}
            policyId: 'gdpr-policy',
            description: `Violation ${i}`,}
            severity: AlertSeverity.WARNING,
            framework: ComplianceFramework.GDPR,
          },
          actor
        );
      }
      const report = await auditLogger.generateComplianceReport(;)
        ComplianceFramework.GDPR,
        new Date(Date.now() - 1000),
        new Date()
      );
      expect(report.recommendations).toContain()
        'Review and update classification rules to reduce false positives'
      );
    });
  });
  describe('Export Functionality', () => {
    beforeEach(async () => {
      const actor = createTestActor();
      await auditLogger.logClassification()
        createTestDataElement(),
        createTestClassificationResult(),
        actor,
        25
      );
      await auditLogger.logPolicyViolation()
        {
          dataId: 'data-123',
          policyId: 'policy-456',
          description: 'Test violation',
          severity: AlertSeverity.WARNING,
          framework: ComplianceFramework.GDPR,
        },
        actor
      );
    });
    test('should export logs as JSON', async () => {
      const exported = await auditLogger.exportLogs({}, ExportFormat.JSON);
      const parsed = JSON.parse(exported);
      expect(parsed).toMatchObject({)
        exportedAt: expect.any(String),
        logCount: 2,
        logs: expect.arrayContaining([),
          expect.objectContaining({)
            eventType: AuditEventType.CLASSIFICATION_PERFORMED,
          }),
          expect.objectContaining({)
            eventType: AuditEventType.POLICY_VIOLATION,
          })
        ])
      });
    });
    test('should export logs as CSV', async () => {
      const csv = await auditLogger.exportLogs({}, ExportFormat.CSV);
      const lines = csv.split('\n');
      expect(lines[0]).toBe()
        'id,timestamp,eventType,userId,ipAddress,resourceType,resourceId,operation,result,classificationLevel,framework,hash'
      );
      expect(lines).toHaveLength(3); // Header + 2 logs
      expect(lines[1]).toContain('classification_performed');
      expect(lines[2]).toContain('policy_violation');
    });
    test('should export logs as Syslog', async () => {
      const syslog = await auditLogger.exportLogs({}, ExportFormat.SYSLOG);
      const lines = syslog.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatch(/^<134>\d{4}-\d{2}-\d{2}T/);
      expect(lines[0]).toContain('classification_performed');
    });
    test('should export logs as CEF', async () => {
      const cef = await auditLogger.exportLogs({}, ExportFormat.CEF);
      const lines = cef.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatch(/^CEF:0\|SecurityAudit\|ClassificationSystem/);
      expect(lines[0]).toContain('classification_performed');
    });
    test('should export logs as LEEF', async () => {
      const leef = await auditLogger.exportLogs({}, ExportFormat.LEEF);
      const lines = leef.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatch(/^LEEF:2.0\|SecurityAudit\|ClassificationSystem/);
      expect(lines[0]).toContain('classification_performed');
    });
  });
  describe('Log Rotation', () => {
    test.skip('should rotate logs based on size', async () => {
      // Create a smaller audit logger with 1MB rotation for faster testing
      const smallConfig = {
        ...testConfig,
        logRotationSizeMB: 1 // 1MB instead of 10MB
      };
      const smallAuditLogger = new ClassificationAuditLogger(smallConfig);
      const rotationHandler = jest.fn<unknown[], unknown>();
      smallAuditLogger.on('logsRotated', rotationHandler);
      const actor = createTestActor();
      const largeData = 'x'.repeat(10000); // Create large log entries (~10KB each);
      // Generate logs until rotation threshold (need ~100 entries for 1MB)
      for (let i = 0; i < 150; i++) {
        await smallAuditLogger.logClassification()
          createTestDataElement({ )
            id: `data-${i}`,}
            value: largeData ,
          }),
          createTestClassificationResult(),
          actor,
          20
        );
        // Check if rotation occurred after brief delay
        await new Promise(resolve => setTimeout(resolve, 1));
        if (rotationHandler.mock.calls.length > 0) break;
      }
      // Force final processing check
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(rotationHandler).toHaveBeenCalled();
      expect(rotationHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
          rotationId: expect.stringMatching(/^rotation_\d+$/),
          logCount: expect.any(Number),
          size: expect.any(Number),
        })
      );
      smallAuditLogger.destroy();
    });
    test('should rotate logs based on time interval', async () => {
      const rotationHandler = jest.fn<unknown[], unknown>();
      auditLogger.on('logsRotated', rotationHandler);
      // Advance time past rotation interval
      jest.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours
      expect(rotationHandler).toHaveBeenCalled();
    });
  });
  describe('Retention Policies', () => {
    test.skip('should enforce retention policies', async () => {
      const archiveHandler = jest.fn<unknown[], unknown>();
      auditLogger.on('logsArchived', archiveHandler);
      const actor = createTestActor();
      // Create old logs
      await auditLogger.logClassification()
        createTestDataElement(),
        createTestClassificationResult({)
          complianceRequirements: [ComplianceFramework.GDPR],
        }),
        actor,
        20
      );
      // Wait a brief moment for logs to be processed
      await new Promise(resolve => setTimeout(resolve, 10));
      // Advance time past retention period
      jest.advanceTimersByTime(31 * 24 * 60 * 60 * 1000); // 31 days
      // Trigger retention enforcement
      jest.advanceTimersByTime(24 * 60 * 60 * 1000); // 1 day to trigger daily check
      expect(archiveHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
          policy: expect.objectContaining({),
            framework: ComplianceFramework.GDPR,
            retentionDays: 30,
          }),
          logCount: 1,
        })
      );
    });
  });
  describe('Performance Modes', () => {
    test.skip('should batch logs in high performance mode', async () => {
      const performanceConfig: AuditLoggerConfig = {
        ...testConfig,
        performanceMode: 'high_performance',
      };
      const performanceLogger = new ClassificationAuditLogger(performanceConfig);
      const storeHandler = jest.fn<unknown[], unknown>();
      performanceLogger.on('logStored', storeHandler);
      const actor = createTestActor();
      // Log multiple events
      for (let i = 0; i < 5; i++) {
        await performanceLogger.logClassification()
          createTestDataElement({ id: `data-${i}` }),}
          createTestClassificationResult(),
          actor,
          20
        );
      }
      // Wait for batch processing
      await new Promise(resolve => setTimeout(resolve, 10));
      // Should not store immediately
      expect(storeHandler).not.toHaveBeenCalled();
      // Advance time to trigger batch flush
      jest.advanceTimersByTime(1100);
      // Should flush all at once
      expect(storeHandler).toHaveBeenCalledTimes(5);
      performanceLogger.destroy();
    });
  });
  describe('Real-time Streaming', () => {
    test('should stream logs to configured endpoints', async () => {
      const streamConfig: AuditLoggerConfig = {
        ...testConfig,
        streamEndpoints: [,
          {
            url: 'https://siem.example.com/logs',
            format: ExportFormat.JSON,
            headers: { 'Authorization': 'Bearer token' }
          }
        ]
      };
      const streamLogger = new ClassificationAuditLogger(streamConfig);
      const streamHandler = jest.fn<unknown[], unknown>();
      streamLogger.on('logStreamed', streamHandler);
      const actor = createTestActor();
      await streamLogger.logClassification()
        createTestDataElement(),
        createTestClassificationResult(),
        actor,
        20
      );
      expect(streamHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
          endpoint: 'https://siem.example.com/logs',
          format: ExportFormat.JSON,
        })
      );
      streamLogger.destroy();
    });
  });
});