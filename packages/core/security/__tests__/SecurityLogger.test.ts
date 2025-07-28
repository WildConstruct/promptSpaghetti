/**
 * Test Suite for Security Logger Service
 * 
 * Tests comprehensive security logging including structured logging,
 * audit trails, compliance features, and metrics collection.
 */
import {
  SecurityLogger,
  LogLevel,
  SecurityEventType,
  ComplianceFramework,
  LogQuery
} from '../SecurityLogger';
import {
  LockoutReason,
  LockoutStatus,
  AdminRole,
  UnlockMethod,
  AccountLockout
} from '../AccountLockoutService';
describe('SecurityLogger', () => {
  let logger: SecurityLogger;
  let mockLockout: AccountLockout;
  let mockDate: Date;
  beforeEach(() => {
  mockDate = new Date('2025-01-15T10:00:00Z');
  const OriginalDate = Date;
  jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown));
  // Mock the Date constructor
  const mockDateConstructor = jest.fn<unknown, unknown>().mockImplementation((value?: unknown) => {,
  if (value !== undefined) {
  return new OriginalDate(value);
  return mockDate;
});
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    logger = new SecurityLogger();
    mockLockout = {
  id: 'LOCK-1234567890-ABCD1234',
  userId: 'user123',
  userEmail: 'test@example.com',
  status: LockoutStatus.ACTIVE,
  reason: LockoutReason.EXCESSIVE_FAILED_ATTEMPTS,
  lockoutTime: mockDate,
  expiryTime: new Date(mockDate.getTime() + 30 * 60 * 1000),
  unlockTime: undefined,
  failedAttempts: 5,
  securityEvents: ['failed_login', 'suspicious_ip'],
  metadata: {,
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  riskScore: 75,
  threatLevel: 'medium',
},
  adminActions: [],
      notifications: [],
      auditTrail: [];
  };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Account Lockout Logging', () => {
  test('should log account lockout with proper structure', () => {
  const context = {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  requestId: 'req-123',
};
      const logId = logger.logAccountLocked(mockLockout, context);
      expect(logId).toBeTruthy();
      expect(logId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      const query: LogQuery = {,
  eventTypes: [SecurityEventType.ACCOUNT_LOCKED],
};
      const result = logger.queryLogs(query);
      expect(result.logs).toHaveLength(1);
      const logEntry = result.logs[0];
      expect(logEntry.eventType).toBe(SecurityEventType.ACCOUNT_LOCKED);
      expect(logEntry.level).toBe(LogLevel.WARN);
      expect(logEntry.severity).toBe('medium');
      expect(logEntry.actor.type).toBe('system');
      expect(logEntry.target?.id).toBe('user123');
      expect(logEntry.context.lockoutId).toBe(mockLockout.id);
    });
    test('should use appropriate log levels for different lockout reasons', () => {
      const testCases = [;
        { reason: LockoutReason.EXCESSIVE_FAILED_ATTEMPTS, expectedLevel: LogLevel.WARN },
        { reason: LockoutReason.SUSPICIOUS_ACTIVITY, expectedLevel: LogLevel.ERROR },
        { reason: LockoutReason.SYSTEM_SECURITY_ALERT, expectedLevel: LogLevel.CRITICAL },
        { reason: LockoutReason.ADMIN_MANUAL_LOCK, expectedLevel: LogLevel.INFO }
      ];
      testCases.forEach(({ reason, expectedLevel }) => {
        const testLockout = { ...mockLockout, reason };
        const logId = logger.logAccountLocked(testLockout);
        const query: LogQuery = {,
  eventTypes: [SecurityEventType.ACCOUNT_LOCKED],
};
        const result = logger.queryLogs(query);
        const logEntry = result.logs.find(log => ;);
          log.details.reason === reason
        );
        expect(logEntry?.level).toBe(expectedLevel);
      });
    });
    test('should include compliance frameworks based on lockout reason', () => {
  const suspiciousLockout = {
  ...mockLockout,
  reason: LockoutReason.SUSPICIOUS_ACTIVITY,
};
      logger.logAccountLocked(suspiciousLockout);
      const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.ACCOUNT_LOCKED],
});
      const logEntry = result.logs[0];
      expect(logEntry.compliance.frameworks).toContain(ComplianceFramework.GDPR);
      expect(logEntry.compliance.frameworks).toContain(ComplianceFramework.ISO_27001);
    });
  });
  describe('Account Unlock Logging', () => {
  test('should log account unlock with admin details', () => {
  const unlockedLockout = {
  ...mockLockout,
  status: LockoutStatus.UNLOCKED,
  unlockTime: new Date(mockDate.getTime() + 60 * 60 * 1000),
};
      const context = {
  ipAddress: '10.0.0.1',
  requestId: 'req-unlock-123',
};
      const logId = logger.logAccountUnlocked(;);
        unlockedLockout,
        UnlockMethod.ADMIN_OVERRIDE,
        'admin123',
        context
      );
      expect(logId).toBeTruthy();
      const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.ACCOUNT_UNLOCKED],
});
      const logEntry = result.logs[0];
      expect(logEntry.eventType).toBe(SecurityEventType.ACCOUNT_UNLOCKED);
      expect(logEntry.level).toBe(LogLevel.INFO);
      expect(logEntry.actor.type).toBe('admin');
      expect(logEntry.actor.id).toBe('admin123');
      expect(logEntry.details.method).toBe(UnlockMethod.ADMIN_OVERRIDE);
    });
    test('should log system unlock without admin details', () => {
  const unlockedLockout = {
  ...mockLockout,
  status: LockoutStatus.UNLOCKED,
  unlockTime: new Date(mockDate.getTime() + 30 * 60 * 1000),
};
      logger.logAccountUnlocked()
        unlockedLockout,
        UnlockMethod.AUTOMATIC_EXPIRY
      );
      const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.ACCOUNT_UNLOCKED],
});
      const logEntry = result.logs[0];
      expect(logEntry.actor.type).toBe('system');
      expect(logEntry.actor.id).toBe('lockout-service');
      expect(logEntry.details.method).toBe(UnlockMethod.AUTOMATIC_EXPIRY);
    });
  });
  describe('Unlock Attempt Logging', () => {
    test('should log successful unlock attempt', () => {
      logger.logUnlockAttempt()
        'lockout-123',
        'admin456',
        'User verification completed',
        'success',
        { ipAddress: '192.168.1.100' }
      );
      const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.UNLOCK_ATTEMPT],
});
      const logEntry = result.logs[0];
      expect(logEntry.eventType).toBe(SecurityEventType.UNLOCK_ATTEMPT);
      expect(logEntry.level).toBe(LogLevel.INFO);
      expect(logEntry.outcome).toBe('success');
      expect(logEntry.severity).toBe('low');
    });
    test('should log failed unlock attempt with warning level', () => {
  logger.logUnlockAttempt()
  'lockout-123',
  'admin456',
  'Insufficient permissions',
  'failure'
  );
  const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.UNLOCK_ATTEMPT],
});
      const logEntry = result.logs[0];
      expect(logEntry.level).toBe(LogLevel.WARN);
      expect(logEntry.outcome).toBe('failure');
      expect(logEntry.severity).toBe('medium');
    });
  });
  describe('Emergency Unlock Logging', () => {
  test('should log emergency unlock with critical level', () => {
  logger.logEmergencyUnlock()
  'lockout-critical',
  'emergency-admin',
  'EMERGENCY-CODE-123456',
  'Critical business impact - user locked out of essential systems'
  );
  const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.EMERGENCY_UNLOCK],
});
      const logEntry = result.logs[0];
      expect(logEntry.eventType).toBe(SecurityEventType.EMERGENCY_UNLOCK);
      expect(logEntry.level).toBe(LogLevel.CRITICAL);
      expect(logEntry.severity).toBe('critical');
      expect(logEntry.details.emergencyCode).toContain('*'); // Should be masked
      expect(logEntry.details.fullEmergencyCodeHash).toBeTruthy();
    });
    test('should include multiple compliance frameworks for emergency unlock', () => {
  logger.logEmergencyUnlock()
  'lockout-emergency',
  'super-admin',
  'EMERGENCY-ABC123',
  'System outage requiring immediate access'
  );
  const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.EMERGENCY_UNLOCK],
});
      const logEntry = result.logs[0];
      expect(logEntry.compliance.frameworks).toContain(ComplianceFramework.SOX);
      expect(logEntry.compliance.frameworks).toContain(ComplianceFramework.ISO_27001);
      expect(logEntry.compliance.frameworks).toContain(ComplianceFramework.NIST);
      expect(logEntry.compliance.retention).toBe(2555); // 7 years
    });
  });
  describe('Security Alert Logging', () => {
  test('should log security alerts with appropriate severity', () => {
  const details = {
  source: 'intrusion_detection',
  attackVector: 'brute_force',
  indicators: ['multiple_failed_attempts', 'suspicious_ip'],
};
      logger.logSecurityAlert()
        'Multiple Failed Login Attempts Detected',
        'high',
        details,
        { ipAddress: '203.0.113.1' }
      );
      const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.SECURITY_ALERT],
});
      const logEntry = result.logs[0];
      expect(logEntry.eventType).toBe(SecurityEventType.SECURITY_ALERT);
      expect(logEntry.level).toBe(LogLevel.ERROR);
      expect(logEntry.severity).toBe('high');
      expect(logEntry.details.source).toBe('intrusion_detection');
    });
    test('should map severity levels to log levels correctly', () => {
      const severityMappings = [;
        { severity: 'low' as const, expectedLevel: LogLevel.INFO },
        { severity: 'medium' as const, expectedLevel: LogLevel.WARN },
        { severity: 'high' as const, expectedLevel: LogLevel.ERROR },
        { severity: 'critical' as const, expectedLevel: LogLevel.CRITICAL }
      ];
      severityMappings.forEach(({ severity, expectedLevel }, index) => {
        logger.logSecurityAlert()
          `Test Alert ${index}`}
}
          severity,
          { testIndex: index }
        );
      });
      const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.SECURITY_ALERT],
});
      severityMappings.forEach(({ expectedLevel }, index) => {
        const logEntry = result.logs.find(log => ;);
          log.details.testIndex === index
        );
        expect(logEntry?.level).toBe(expectedLevel);
      });
    });
  });
  describe('Audit Trail Creation', () => {
    test('should create audit trail entry', () => {
      const auditId = logger.createAuditTrail(;);
        'UPDATE',
        'lockout',
        'lockout-123',
        'admin',
        'admin789',
        {
          before: { status: 'active' },
          after: { status: 'unlocked' },
          fields: ['status'];
  }
        'User verification completed',
        { ipAddress: '10.0.0.5' }
      );
      expect(auditId).toBeTruthy();
      expect(auditId).toMatch(/^[0-9a-f-]{36}$/);
    });
    test('should emit audit trail created event', (done) => {
      logger.on('auditTrailCreated', (auditEntry) => {
        expect(auditEntry.operation).toBe('DELETE');
        expect(auditEntry.resource).toBe('lockout');
        expect(auditEntry.actor.type).toBe('system');
        done();
      });
      logger.createAuditTrail()
        'DELETE',
        'lockout',
        'old-lockout-456',
        'system',
        'cleanup-service',
        {
          before: { status: 'expired' },
          fields: ['deleted'];
  }
        'Automatic cleanup of expired lockout'
      );
    });
  });
  describe('Log Querying', () => {
    beforeEach(() => {
      // Create test data
      logger.logAccountLocked(mockLockout);
      logger.logAccountUnlocked(mockLockout, UnlockMethod.ADMIN_OVERRIDE, 'admin123');
      logger.logSecurityAlert('Test Alert', 'medium', {});
    });
    test('should query logs by event type', () => {
  const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.ACCOUNT_LOCKED],
});
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].eventType).toBe(SecurityEventType.ACCOUNT_LOCKED);
      expect(result.total).toBe(1);
    });
    test('should query logs by date range', () => {
      const startTime = new Date(mockDate.getTime() - 60 * 1000); // 1 minute before;
      const endTime = new Date(mockDate.getTime() + 60 * 1000);   // 1 minute after;
      const result = logger.queryLogs({)
  startTime,
        endTime
      });
      expect(result.logs.length).toBeGreaterThan(0);
      result.logs.forEach(log => {)
  expect(log.timestamp.getTime()).toBeGreaterThanOrEqual(startTime.getTime());
        expect(log.timestamp.getTime()).toBeLessThanOrEqual(endTime.getTime());
      });
    });
    test('should query logs by severity', () => {
  const result = logger.queryLogs({)
  severity: ['medium'],
});
      expect(result.logs.length).toBeGreaterThan(0);
      result.logs.forEach(log => {)
  expect(log.severity).toBe('medium');
      });
    });
    test('should query logs by actor', () => {
  const result = logger.queryLogs({)
  actors: ['admin123'],
});
      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].actor.id).toBe('admin123');
    });
    test('should support pagination', () => {
  const result = logger.queryLogs({)
  limit: 2,
  offset: 0,
});
      expect(result.logs.length).toBeLessThanOrEqual(2);
      expect(result.hasMore).toBe(result.total > 2);
    });
    test('should support search functionality', () => {
  const result = logger.queryLogs({)
  search: 'admin123',
});
      expect(result.logs.length).toBeGreaterThan(0);
      result.logs.forEach(log => {)
  const searchableText = `${log.message} ${log.actor.id} ${log.target?.id || ''}`.toLowerCase();}
        expect(searchableText).toContain('admin123');
      });
    });
    test('should sort logs correctly', () => {
  const resultDesc = logger.queryLogs({)
  sortBy: 'timestamp',
  sortOrder: 'desc',
});
      for (let i = 1; i < resultDesc.logs.length; i++) {
  expect(resultDesc.logs[i-1].timestamp.getTime())
  .toBeGreaterThanOrEqual(resultDesc.logs[i].timestamp.getTime());
  const resultAsc = logger.queryLogs({)
  sortBy: 'timestamp',
  sortOrder: 'asc',
});
      for (let i = 1; i < resultAsc.logs.length; i++) {
        expect(resultAsc.logs[i-1].timestamp.getTime())
          .toBeLessThanOrEqual(resultAsc.logs[i].timestamp.getTime());
    });
  });
  describe('Security Metrics', () => {
    beforeEach(() => {
      // Create test data for metrics
      logger.logAccountLocked(mockLockout);
      logger.logAccountLocked({ ...mockLockout, reason: LockoutReason.SUSPICIOUS_ACTIVITY });
      logger.logAccountUnlocked(mockLockout, UnlockMethod.ADMIN_OVERRIDE, 'admin123');
      logger.logSecurityAlert('Test Alert', 'high', {});
    });
    test('should generate comprehensive security metrics', () => {
      const metrics = logger.getSecurityMetrics();
      expect(metrics).toBeTruthy();
      expect(metrics.period).toBeTruthy();
      expect(metrics.lockoutEvents.total).toBeGreaterThanOrEqual(2);
      expect(metrics.unlockEvents.total).toBeGreaterThanOrEqual(1);
      expect(metrics.securityAlerts.total).toBeGreaterThanOrEqual(1);
    });
    test('should calculate lockout metrics by reason', () => {
      const metrics = logger.getSecurityMetrics();
      expect(metrics.lockoutEvents.byReason[LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]).toBe(1);
      expect(metrics.lockoutEvents.byReason[LockoutReason.SUSPICIOUS_ACTIVITY]).toBe(1);
    });
    test('should calculate unlock metrics by method', () => {
      const metrics = logger.getSecurityMetrics();
      expect(metrics.unlockEvents.byMethod[UnlockMethod.ADMIN_OVERRIDE]).toBe(1);
      expect(metrics.unlockEvents.adminUnlocks).toBe(1);
    });
  });
  describe('Compliance Export', () => {
    beforeEach(() => {
      logger.logAccountLocked(mockLockout);
      logger.logAccountUnlocked(mockLockout, UnlockMethod.ADMIN_OVERRIDE, 'admin123');
    });
    test('should export logs for SOX compliance in JSON format', () => {
      const startTime = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000);
      const endTime = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000);
      const exportData = logger.exportLogsForCompliance(;);
        ComplianceFramework.SOX,
        startTime,
        endTime,
        'json'
      );
      expect(exportData.data).toBeTruthy();
      expect(exportData.metadata.framework).toBe(ComplianceFramework.SOX);
      expect(exportData.metadata.recordCount).toBeGreaterThan(0);
      expect(exportData.metadata.signature).toBeTruthy();
      const parsed = JSON.parse(exportData.data);
      expect(parsed.framework).toBe(ComplianceFramework.SOX);
      expect(parsed.logs).toBeInstanceOf(Array);
    });
    test('should export logs in CSV format', () => {
      const startTime = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000);
      const endTime = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000);
      const exportData = logger.exportLogsForCompliance(;);
        ComplianceFramework.GDPR,
        startTime,
        endTime,
        'csv'
      );
      expect(exportData.data).toContain('ID,Timestamp,Level,Event Type');
      expect(exportData.data.split('\n').length).toBeGreaterThan(1);
    });
    test('should export logs in XML format', () => {
      const startTime = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000);
      const endTime = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000);
      const exportData = logger.exportLogsForCompliance(;);
        ComplianceFramework.ISO_27001,
        startTime,
        endTime,
        'xml'
      );
      expect(exportData.data).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(exportData.data).toContain('<SecurityLogExport>');
    });
  });
  describe('Event Emission', () => {
    test('should emit security log created events', (done) => {
      logger.on('securityLogCreated', (logEntry) => {
        expect(logEntry.eventType).toBe(SecurityEventType.ACCOUNT_LOCKED);
        expect(logEntry.message).toContain('test@example.com');
        done();
      });
      logger.logAccountLocked(mockLockout);
    });
    test('should emit critical security events', (done) => {
      logger.on('criticalSecurityEvent', (logEntry) => {
        expect(logEntry.severity).toBe('critical');
        expect(logEntry.level).toBe(LogLevel.CRITICAL);
        done();
      });
      logger.logSecurityAlert('Critical Security Breach', 'critical', {});
    });
  });
  describe('Data Protection and Security', () => {
  test('should mask sensitive data appropriately', () => {
  logger.logEmergencyUnlock()
  'lockout-test',
  'admin-test',
  'EMERGENCY123456789',
  'Test emergency unlock'
  );
  const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.EMERGENCY_UNLOCK],
});
      const logEntry = result.logs[0];
      expect(logEntry.details.emergencyCode).toContain('*');
      expect(logEntry.details.emergencyCode).not.toBe('EMERGENCY123456789');
      expect(logEntry.details.fullEmergencyCodeHash).toBeTruthy();
    });
    test('should generate checksums for log integrity', () => {
  logger.logAccountLocked(mockLockout);
  const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.ACCOUNT_LOCKED],
});
      const logEntry = result.logs[0];
      expect(logEntry.metadata.checksum).toBeTruthy();
      expect(logEntry.metadata.checksum).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
    });
    test('should set appropriate retention periods', () => {
      const testCases = [;
        { reason: LockoutReason.EXCESSIVE_FAILED_ATTEMPTS, expectedRetention: 1095 },
        { reason: LockoutReason.SUSPICIOUS_ACTIVITY, expectedRetention: 2555 },
        { reason: LockoutReason.SYSTEM_SECURITY_ALERT, expectedRetention: 2555 }
      ];
      testCases.forEach(({ reason, expectedRetention }) => {
        const testLockout = { ...mockLockout, reason };
        logger.logAccountLocked(testLockout);
        const result = logger.queryLogs({)
  eventTypes: [SecurityEventType.ACCOUNT_LOCKED],
});
        const logEntry = result.logs.find(log => ;);
          log.details.reason === reason
        );
        expect(logEntry?.compliance.retention).toBe(expectedRetention);
      });
    });
  });
});