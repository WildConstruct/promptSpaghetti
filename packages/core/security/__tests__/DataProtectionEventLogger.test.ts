/**
 * Tests for DataProtectionEventLogger
 * Epic 19 - Security & Compliance Framework
 */
import {
  DataProtectionEventLogger,
  DataProtectionEvent,
  DataDeletionEvent,
  PrivacyRequestEvent,
  PolicyViolationEvent,
  DataProtectionEventType,
  DataSensitivityLevel,
  ComplianceFramework
} from '../DataProtectionEventLogger';
import { SecurityLogger, SecurityEvent, SecurityEventLevel } from '../SecurityLogger';
import { AuditLogger } from '../AuditLogger';

// Mock the dependencies
jest.mock('../SecurityLogger');
jest.mock('../AuditLogger');
describe('DataProtectionEventLogger', () => {
  let logger: DataProtectionEventLogger;
  let mockSecurityLogger: jest.Mocked<SecurityLogger>;
  let mockAuditLogger: jest.Mocked<AuditLogger>;
  const mockDataProtectionEvent: DataProtectionEvent = {
    eventType: DataProtectionEventType.DATA_SUBJECT_ACCESS,
    timestamp: new Date('2024-01-01T10:00:00Z'),
    correlationId: 'corr-123',
    userId: 'user-456',
    dataSubject: 'subject-789',
    resourceType: 'user_profile',
    resourceId: 'profile-123',
    dataClassification: DataSensitivityLevel.PII,
    operation: 'read',
    legalBasis: 'consent',
    consentId: 'consent-123',
    automatedDecision: false,
    complianceFrameworks: [ComplianceFramework.GDPR],
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecurityLogger = new SecurityLogger() as jest.Mocked<SecurityLogger>;
    mockAuditLogger = new AuditLogger() as jest.Mocked<AuditLogger>;
    mockSecurityLogger.log = jest.fn().mockResolvedValue(undefined);
    mockAuditLogger.logEvent = jest.fn().mockResolvedValue(undefined);
    mockAuditLogger.getEventsByDateRange = jest.fn().mockResolvedValue([]);
    logger = new DataProtectionEventLogger(mockSecurityLogger, mockAuditLogger, {)
      complianceMode: true,
    });
  });
  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const defaultLogger = new DataProtectionEventLogger();
      expect(defaultLogger).toBeInstanceOf(DataProtectionEventLogger);
    });
    it('should initialize with custom options', () => {
      const retentionPolicies = new Map([[ComplianceFramework.GDPR, 2000]]);
      const customLogger = new DataProtectionEventLogger(undefined, undefined, {)
        complianceMode: false,
        retentionPolicies
      });
      expect(customLogger).toBeInstanceOf(DataProtectionEventLogger);
    });
  });
  describe('logDataProtectionEvent', () => {
    it('should log a data protection event successfully', async () => {
      await logger.logDataProtectionEvent(mockDataProtectionEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          level: SecurityEventLevel.MEDIUM,
          category: 'data_protection',
          action: DataProtectionEventType.DATA_SUBJECT_ACCESS,
          userId: 'user-456',
          resourceId: 'profile-123',
          details: expect.objectContaining({),
            eventType: DataProtectionEventType.DATA_SUBJECT_ACCESS,
            dataClassification: DataSensitivityLevel.PII,
            operation: 'read',
            complianceFrameworks: [ComplianceFramework.GDPR],
          })
        })
      );
      expect(mockAuditLogger.logEvent).toHaveBeenCalledWith()
        expect.objectContaining({)
          userId: 'user-456',
          action: DataProtectionEventType.DATA_SUBJECT_ACCESS,
          resourceType: 'user_profile',
          resourceId: 'profile-123',
          details: expect.objectContaining({),
            dataSubject: 'subject-789',
            legalBasis: 'consent',
            consentId: 'consent-123',
          })
        })
      );
    });
    it('should determine correct event levels', async () => {
      const criticalEvent: DataProtectionEvent = {
        ...mockDataProtectionEvent,
        eventType: DataProtectionEventType.POLICY_VIOLATION_DETECTED,
      };
      await logger.logDataProtectionEvent(criticalEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          level: SecurityEventLevel.CRITICAL,
        })
      );
    });
    it('should handle high-priority events', async () => {
      const highPriorityEvent: DataProtectionEvent = {
        ...mockDataProtectionEvent,
        eventType: DataProtectionEventType.CONSENT_WITHDRAWN,
      };
      await logger.logDataProtectionEvent(highPriorityEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          level: SecurityEventLevel.HIGH,
        })
      );
    });
    it('should validate required event fields', async () => {
      const invalidEvent: Partial<DataProtectionEvent> = {
        eventType: DataProtectionEventType.DATA_SUBJECT_ACCESS,
        timestamp: new Date(),
        // Missing required fields
      };
      await expect(logger.logDataProtectionEvent(invalidEvent as DataProtectionEvent))
        .rejects.toThrow('User ID is required');
    });
    it('should validate compliance frameworks', async () => {
      const invalidEvent: DataProtectionEvent = {
        ...mockDataProtectionEvent,
        complianceFrameworks: [],
      };
      await expect(logger.logDataProtectionEvent(invalidEvent))
        .rejects.toThrow('At least one compliance framework must be specified');
    });
    it('should handle logging failures gracefully', async () => {
      mockSecurityLogger.log.mockRejectedValue(new Error('Logging failed'));
      await expect(logger.logDataProtectionEvent(mockDataProtectionEvent))
        .rejects.toThrow('Data protection event logging failed: Logging failed');
    });
    it('should skip audit logging when compliance mode is disabled', async () => {
      const nonComplianceLogger = new DataProtectionEventLogger(mockSecurityLogger, mockAuditLogger, {)
        complianceMode: false,
      });
      await nonComplianceLogger.logDataProtectionEvent(mockDataProtectionEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalled();
      expect(mockAuditLogger.logEvent).not.toHaveBeenCalled();
    });
  });
  describe('logDataDeletionEvent', () => {
    const mockDeletionEvent: DataDeletionEvent = {
      ...mockDataProtectionEvent,
      eventType: DataProtectionEventType.DATA_DELETION_EXECUTED,
      deletionJobId: 'job-123',
      scheduledTime: new Date('2024-01-01T08:00:00Z'),
      executionTime: new Date('2024-01-01T10:00:00Z'),
      deletionRule: 'auto-delete-gdpr',
      affectedRecords: {,
        expected: 100,
        processed: 95,
        successful: 90,
        failed: 5,
      }
    };
    it('should log deletion event with extended metadata', async () => {
      await logger.logDataDeletionEvent(mockDeletionEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          details: expect.objectContaining({),
            deletionJobId: 'job-123',
            scheduledTime: '2024-01-01T08:00:00.000Z',
            executionTime: '2024-01-01T10:00:00.000Z',
            deletionRule: 'auto-delete-gdpr',
            affectedRecords: {,
              expected: 100,
              processed: 95,
              successful: 90,
              failed: 5,
            }
          })
        })
      );
    });
    it('should trigger alert for failed deletions', async () => {
      const failedDeletionEvent: DataDeletionEvent = {
        ...mockDeletionEvent,
        eventType: DataProtectionEventType.DATA_DELETION_FAILED,
        failureReasons: ['Database timeout', 'Constraint violation']
      };
      await logger.logDataDeletionEvent(failedDeletionEvent);
      // Should log the main event plus the alert
      expect(mockSecurityLogger.log).toHaveBeenCalledTimes(2);
      // Check that alert was logged
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          level: SecurityEventLevel.HIGH,
          category: 'data_protection_alert',
          action: 'deletion_failure_alert',
        })
      );
    });
  });
  describe('logPrivacyRequestEvent', () => {
    const mockPrivacyRequestEvent: PrivacyRequestEvent = {
      ...mockDataProtectionEvent,
      eventType: DataProtectionEventType.PRIVACY_REQUEST_RECEIVED,
      requestType: 'access',
      requestId: 'req-123',
      requestDate: new Date('2024-01-01T09:00:00Z'),
      responseDeadline: new Date('2024-01-31T23:59:59Z'),
      status: 'processing',
      dataCategories: ['personal_data', 'contact_info'],
      processingPurposes: ['service_delivery', 'analytics']
    };
    it('should log privacy request with extended metadata', async () => {
      await logger.logPrivacyRequestEvent(mockPrivacyRequestEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          details: expect.objectContaining({),
            requestType: 'access',
            requestId: 'req-123',
            status: 'processing',
            dataCategories: ['personal_data', 'contact_info'],
            processingPurposes: ['service_delivery', 'analytics']
          })
        })
      );
    });
    it('should trigger alert for overdue requests', async () => {
      const overdueRequestEvent: PrivacyRequestEvent = {
        ...mockPrivacyRequestEvent,
        status: 'overdue',
      };
      await logger.logPrivacyRequestEvent(overdueRequestEvent);
      // Should log the main event plus the alert
      expect(mockSecurityLogger.log).toHaveBeenCalledTimes(2);
      // Check that alert was logged
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          level: SecurityEventLevel.HIGH,
          category: 'privacy_request_alert',
          action: 'privacy_request_overdue',
        })
      );
    });
    it('should trigger alert for requests past deadline', async () => {
      const pastDeadlineEvent: PrivacyRequestEvent = {
        ...mockPrivacyRequestEvent,
        responseDeadline: new Date('2023-12-01T23:59:59Z'), // Past deadline
        status: 'processing',
      };
      await logger.logPrivacyRequestEvent(pastDeadlineEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalledTimes(2);
    });
  });
  describe('logPolicyViolationEvent', () => {
    const mockViolationEvent: PolicyViolationEvent = {
      ...mockDataProtectionEvent,
      eventType: DataProtectionEventType.POLICY_VIOLATION_DETECTED,
      violationType: 'unauthorized_access',
      policyId: 'pol-123',
      policyVersion: '1.2.0',
      severity: 'high',
      riskScore: 85,
      mitigationActions: ['revoke_access', 'notify_admin'],
      requiresNotification: true,
      notificationDeadline: new Date('2024-01-02T10:00:00Z'),
    };
    it('should log policy violation with extended metadata', async () => {
      await logger.logPolicyViolationEvent(mockViolationEvent);
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          details: expect.objectContaining({),
            violationType: 'unauthorized_access',
            policyId: 'pol-123',
            policyVersion: '1.2.0',
            severity: 'high',
            riskScore: 85,
            requiresNotification: true,
          })
        })
      );
    });
    it('should trigger immediate alert for critical violations', async () => {
      const criticalViolationEvent: PolicyViolationEvent = {
        ...mockViolationEvent,
        severity: 'critical',
      };
      await logger.logPolicyViolationEvent(criticalViolationEvent);
      // Should log the main event plus the alert
      expect(mockSecurityLogger.log).toHaveBeenCalledTimes(2);
      // Check that alert was logged
      expect(mockSecurityLogger.log).toHaveBeenCalledWith()
        expect.objectContaining({)
          level: SecurityEventLevel.CRITICAL,
          category: 'policy_violation_alert',
          action: 'critical_violation_detected',
        })
      );
    });
    it('should trigger immediate alert for high-severity violations', async () => {
      await logger.logPolicyViolationEvent(mockViolationEvent); // severity: 'high'
      expect(mockSecurityLogger.log).toHaveBeenCalledTimes(2);
    });
    it('should not trigger alert for low-severity violations', async () => {
      const lowSeverityEvent: PolicyViolationEvent = {
        ...mockViolationEvent,
        severity: 'low',
      };
      await logger.logPolicyViolationEvent(lowSeverityEvent);
      // Should only log the main event, no alert
      expect(mockSecurityLogger.log).toHaveBeenCalledTimes(1);
    });
  });
  describe('generateComplianceReport', () => {
    const mockEvents = [;
      {
        timestamp: '2024-01-01T10:00:00Z',
        action: DataProtectionEventType.DATA_SUBJECT_ACCESS,
        details: {,
          complianceFrameworks: [ComplianceFramework.GDPR],
          dataSubject: 'subject-1',
        }
      },
      {
        timestamp: '2024-01-02T10:00:00Z',
        action: DataProtectionEventType.POLICY_VIOLATION_DETECTED,
        details: {,
          complianceFrameworks: [ComplianceFramework.GDPR],
          dataSubject: 'subject-2',
        }
      },
      {
        timestamp: '2024-01-03T10:00:00Z',
        action: DataProtectionEventType.CONSENT_GRANTED,
        details: {,
          complianceFrameworks: [ComplianceFramework.CCPA],
          dataSubject: 'subject-3',
        }
      }
    ];
    beforeEach(() => {
      mockAuditLogger.getEventsByDateRange.mockResolvedValue(mockEvents);
    });
    it('should generate GDPR compliance report', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const report = await logger.generateComplianceReport(;);
        ComplianceFramework.GDPR,
        startDate,
        endDate
      );
      expect(report).toEqual({)
        framework: ComplianceFramework.GDPR,
        reportPeriod: { start: startDate, end: endDate },
        eventCount: 2, // Only GDPR events
        eventTypes: {,
          [DataProtectionEventType.DATA_SUBJECT_ACCESS]: 1,
          [DataProtectionEventType.POLICY_VIOLATION_DETECTED]: 1
        },
        dataSubjects: {,
          'subject-1': 1,
          'subject-2': 1
        },
        violations: [mockEvents[1]], // Only violation events
        privacyRequests: [mockEvents[0]], // Only privacy request events
        retentionCompliance: expect.objectContaining({),
          compliancePercentage: expect.any(Number),
        }),
        generatedAt: expect.any(Date),
      });
      expect(mockAuditLogger.getEventsByDateRange).toHaveBeenCalledWith(startDate, endDate);
    });
    it('should generate CCPA compliance report', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const report = await logger.generateComplianceReport(;);
        ComplianceFramework.CCPA,
        startDate,
        endDate
      );
      expect(report.eventCount).toBe(1); // Only CCPA events
      expect(report.framework).toBe(ComplianceFramework.CCPA);
    });
    it('should calculate retention compliance metrics', async () => {
      const oldEvents = [;
        {
          timestamp: '2020-01-01T10:00:00Z', // Very old event
          action: DataProtectionEventType.DATA_SUBJECT_ACCESS,
          details: {,
            complianceFrameworks: [ComplianceFramework.GDPR],
            dataSubject: 'subject-old',
          }
        }
      ];
      mockAuditLogger.getEventsByDateRange.mockResolvedValue(oldEvents);
      const report = await logger.generateComplianceReport(;);
        ComplianceFramework.GDPR,
        new Date('2020-01-01'),
        new Date('2024-01-31')
      );
      expect(report.retentionCompliance).toEqual({)
        totalEvents: 1,
        pastRetentionEvents: 1,
        improperllyRetainedEvents: 1,
        compliancePercentage: 0,
      });
    });
  });
  describe('Event Validation', () => {
    it('should validate missing event type', async () => {
      const invalidEvent = { ...mockDataProtectionEvent };
      delete (invalidEvent as any).eventType;
      await expect(logger.logDataProtectionEvent(invalidEvent))
        .rejects.toThrow('Event type is required');
    });
    it('should validate missing resource information', async () => {
      const invalidEvent = { ...mockDataProtectionEvent };
      delete (invalidEvent as any).resourceType;
      await expect(logger.logDataProtectionEvent(invalidEvent))
        .rejects.toThrow('Resource type and ID are required');
    });
    it('should validate event with all required fields', async () => {
      const minimalEvent: DataProtectionEvent = {
        eventType: DataProtectionEventType.DATA_SUBJECT_ACCESS,
        timestamp: new Date(),
        correlationId: 'corr-123',
        userId: 'user-456',
        resourceType: 'user_data',
        resourceId: 'data-123',
        dataClassification: DataSensitivityLevel.PII,
        operation: 'read',
        automatedDecision: false,
        complianceFrameworks: [ComplianceFramework.GDPR],
      };
      await expect(logger.logDataProtectionEvent(minimalEvent))
        .resolves.not.toThrow();
    });
  });
  describe('Error Handling', () => {
    it('should handle security logger failures', async () => {
      mockSecurityLogger.log.mockRejectedValue(new Error('Security logging failed'));
      await expect(logger.logDataProtectionEvent(mockDataProtectionEvent))
        .rejects.toThrow('Data protection event logging failed: Security logging failed');
    });
    it('should handle audit logger failures', async () => {
      mockAuditLogger.logEvent.mockRejectedValue(new Error('Audit logging failed'));
      await expect(logger.logDataProtectionEvent(mockDataProtectionEvent))
        .rejects.toThrow('Data protection event logging failed: Audit logging failed');
    });
    it('should continue when audit logger is unavailable', async () => {
      const loggerWithoutAudit = new DataProtectionEventLogger(mockSecurityLogger, undefined);
      // Should not throw even without audit logger
      await expect(loggerWithoutAudit.logDataProtectionEvent(mockDataProtectionEvent))
        .resolves.not.toThrow();
    });
  });
});