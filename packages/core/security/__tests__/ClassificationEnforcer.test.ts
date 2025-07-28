/**
 * Classification Enforcer Tests
 * 
 * Comprehensive test suite for the classification enforcement system
 * Epic 19 Task T-1752989143998-694: Build classification enforcement
 */
import {
  ClassificationEnforcer,
  createClassificationEnforcer,
  type ClassificationEnforcementConfig
} from '../ClassificationEnforcer';
import {
  type OperationContext
} from '../../types/DataClassification';
describe('ClassificationEnforcer', () => {
  let enforcer: ClassificationEnforcer;
  const mockDate = new Date('2025-01-21T12:00:00.000Z');
  beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
  enforcer = new ClassificationEnforcer();
});
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('Constructor and Configuration', () => {
    it('should create enforcer with default configuration', () => {
      const enforcer = new ClassificationEnforcer();
      expect(enforcer).toBeInstanceOf(ClassificationEnforcer);
    });
    it('should create enforcer with custom configuration', () => {
  const config: Partial<ClassificationEnforcementConfig> = {,
  strictMode: true,
  blockViolations: true,
  gracePeriodDays: 0,
};
      const enforcer = new ClassificationEnforcer(config);
      expect(enforcer).toBeInstanceOf(ClassificationEnforcer);
    });
    it('should create enforcers with different presets', () => {
      const devEnforcer = createClassificationEnforcer('development');
      const stagingEnforcer = createClassificationEnforcer('staging');
      const prodEnforcer = createClassificationEnforcer('production');
      expect(devEnforcer).toBeInstanceOf(ClassificationEnforcer);
      expect(stagingEnforcer).toBeInstanceOf(ClassificationEnforcer);
      expect(prodEnforcer).toBeInstanceOf(ClassificationEnforcer);
    });
  });
  describe('enforceClassification', () => {
  const baseOperation: OperationContext = {,
  operation: 'read',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business-analytics',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req789',
};
    it('should allow PUBLIC data access with minimal controls', async () => {
      const result = await enforcer.enforceClassification(;);
        'PUBLIC',
        baseOperation,
        ['auth-standard', 'audit-standard']
      );
      expect(result.allowed).toBe(true);
      expect(result.classification).toBe('PUBLIC');
      expect(result.violations).toHaveLength(0);
      expect(result.riskScore).toBeLessThan(30);
    });
    it('should enforce INTERNAL data requirements', async () => {
      const result = await enforcer.enforceClassification(;);
        'INTERNAL',
        baseOperation,
        ['auth-standard']
      );
      expect(result.allowed).toBe(true);
      expect(result.classification).toBe('INTERNAL');
      expect(result.violations).toHaveLength(0);
    });
    it('should enforce CONFIDENTIAL data requirements', async () => {
      const result = await enforcer.enforceClassification(;);
        'CONFIDENTIAL',
        baseOperation,
        ['auth-mfa']
      );
      expect(result.classification).toBe('CONFIDENTIAL');
      expect(result.violations).toContain('Authorization required but not present');
    });
    it('should enforce RESTRICTED data requirements strictly', async () => {
  const result = await enforcer.enforceClassification(;);
  'RESTRICTED',
  baseOperation,
  ['auth-standard']
  );
  expect(result.classification).toBe('RESTRICTED');
  expect(result.violations).toContain('Required authentication level: STRONG_MFA');
  expect(result.riskScore).toBeGreaterThan(70);
});
    it('should validate write operations require encryption', async () => {
  const writeOperation: OperationContext = {,
  ...baseOperation,
  operation: 'write',
};
      const result = await enforcer.enforceClassification(;);
        'CONFIDENTIAL',
        writeOperation,
        ['auth-mfa']
      );
      expect(result.violations).toContain('Encryption required for storage');
    });
    it('should validate export operations', async () => {
  const exportOperation: OperationContext = {,
  ...baseOperation,
  operation: 'export',
};
      const result = await enforcer.enforceClassification(;);
        'RESTRICTED',
        exportOperation,
        ['auth-strong_mfa']
      );
      expect(result.violations).toContain('Export restrictions apply to this classification');
      expect(result.requiredControls).toContain('export-control');
      expect(result.requiredControls).toContain('end-to-end-encryption');
    });
    it('should validate share operations', async () => {
  const shareOperation: OperationContext = {,
  ...baseOperation,
  operation: 'share',
};
      const result = await enforcer.enforceClassification(;);
        'CONFIDENTIAL',
        shareOperation,
        ['auth-mfa']
      );
      expect(result.violations).toContain('Approval workflow required for sharing');
      expect(result.requiredControls).toContain('approval-workflow');
    });
    it('should check environment restrictions', async () => {
  const devOperation: OperationContext = {,
  ...baseOperation,
  environment: 'development',
};
      const result = await enforcer.enforceClassification(;);
        'RESTRICTED',
        devOperation,
        ['auth-strong_mfa']
      );
      expect(result.violations).toContain('Storage location \'development\' not approved');
    });
    it('should allow operations in grace period', async () => {
  const gracePeriodEnforcer = new ClassificationEnforcer({)
  gracePeriodDays: 30,
  blockViolations: true,
});
      const result = await gracePeriodEnforcer.enforceClassification(;);
        'RESTRICTED',
        baseOperation,
        []
      );
      // Should allow despite violations due to grace period
      expect(result.allowed).toBe(true);
    });
    it('should block operations in strict mode', async () => {
  const strictEnforcer = new ClassificationEnforcer({)
  strictMode: true,
});
      const result = await strictEnforcer.enforceClassification(;);
        'CONFIDENTIAL',
        baseOperation,
        []
      );
      expect(result.allowed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });
    it('should handle exempted users', async () => {
  const exemptedEnforcer = new ClassificationEnforcer({)
  exemptions: {,
  users: ['user123'],
});
      const result = await exemptedEnforcer.enforceClassification(;);
        'RESTRICTED',
        baseOperation,
        []
      );
      expect(result.allowed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
    it('should apply policy overrides', async () => {
  const overrideEnforcer = new ClassificationEnforcer({)
  policyOverrides: new Map([),
  ['CONFIDENTIAL', {
  access: {,
  authenticationLevel: 'STANDARD',
  authorizationRequired: false,
  approvalWorkflow: false,
  timeRestrictions: false,
  purposeLimitation: false,
  auditLogging: 'STANDARD',
  exportRestrictions: false,
}]
        ])
      });
      const result = await overrideEnforcer.enforceClassification(;);
        'CONFIDENTIAL',
        baseOperation,
        ['auth-standard']
      );
      expect(result.allowed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
    it('should calculate risk scores appropriately', async () => {
      const publicResult = await enforcer.enforceClassification(;);
        'PUBLIC',
        baseOperation,
        ['auth-standard', 'audit-standard']
      );
      const restrictedResult = await enforcer.enforceClassification(;);
        'RESTRICTED',
        baseOperation,
        []
      );
      expect(publicResult.riskScore).toBeLessThan(30);
      expect(restrictedResult.riskScore).toBeGreaterThan(80);
    });
    it('should generate audit IDs', async () => {
      const result1 = await enforcer.enforceClassification(;);
        'INTERNAL',
        baseOperation,
        []
      );
      const result2 = await enforcer.enforceClassification(;);
        'INTERNAL',
        baseOperation,
        []
      );
      expect(result1.auditId).toBeTruthy();
      expect(result2.auditId).toBeTruthy();
      expect(result1.auditId).not.toBe(result2.auditId);
    });
    it('should provide recommendations for violations', async () => {
      const result = await enforcer.enforceClassification(;);
        'CONFIDENTIAL',
        baseOperation,
        []
      );
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations!.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain('Implement role-based access control');
    });
    it('should handle enforcement errors gracefully', async () => {
  // Create operation that might cause internal errors
  const badOperation: OperationContext = {,
  ...baseOperation,
  operation: 'invalid-op' as OperationContext['operation'],
};
      const result = await enforcer.enforceClassification(;);
        'CONFIDENTIAL',
        badOperation,
        []
      );
      // In non-strict mode, should allow with high risk
      expect(result.allowed).toBe(true);
      expect(result.riskScore).toBeGreaterThan(50);
    });
  });
  describe('makeAccessDecision', () => {
  it('should grant access for properly authenticated users', async () => {
  const decision = await enforcer.makeAccessDecision(;);
  'user123',
  'data456',
  'PUBLIC',
  'read',
  {
  sessionId: 'session789',
  purpose: 'business-analytics');
  expect(decision.granted).toBe(true);
  expect(decision.reason).toBe('All access requirements met');
  expect(decision.conditions).toBeDefined();
  expect(decision.expiresAt).toBeDefined();
});
    it('should deny access for insufficient authentication', async () => {
      const decision = await enforcer.makeAccessDecision(;);
        'user123',
        'data456',
        'RESTRICTED',
        'read');
      expect(decision.granted).toBe(false);
      expect(decision.reason).toBe('Insufficient authentication level');
      expect(decision.requiredAuthentication).toBe('STRONG_MFA');
    });
    it('should check time restrictions for sensitive operations', async () => {
  // Set time to outside business hours
  jest.setSystemTime(new Date('2025-01-21T22:00:00.000Z'));
  const decision = await enforcer.makeAccessDecision(;);
  'user123',
  'data456',
  'CONFIDENTIAL',
  'export');
  expect(decision.granted).toBe(false);
  expect(decision.reason).toBe('Operation not allowed outside business hours');
});
    it('should check weekend restrictions', async () => {
  // Set time to Saturday
  jest.setSystemTime(new Date('2025-01-25T12:00:00.000Z'));
  const decision = await enforcer.makeAccessDecision(;);
  'user123',
  'data456',
  'CONFIDENTIAL',
  'share');
  expect(decision.granted).toBe(false);
  expect(decision.reason).toBe('Operation not allowed on weekends');
});
    it('should check purpose limitations', async () => {
  const decision = await enforcer.makeAccessDecision(;);
  'user123',
  'data456',
  'RESTRICTED',
  'read',
  {
  purpose: 'marketing');
  expect(decision.granted).toBe(false);
  expect(decision.reason).toBe('Purpose not allowed for this classification');
});
    it('should set appropriate access expiration', async () => {
  const publicDecision = await enforcer.makeAccessDecision(;);
  'user123',
  'data456',
  'PUBLIC',
  'read');
  const restrictedDecision = await enforcer.makeAccessDecision(;);
  'user123',
  'data456',
  'RESTRICTED',
  'read',
  {
  purpose: 'security-incident');
  const publicExpiration = publicDecision.expiresAt!.getTime() - mockDate.getTime();
  const restrictedExpiration = restrictedDecision.expiresAt!.getTime() - mockDate.getTime();
  // PUBLIC data expires in 30 days
  expect(publicExpiration).toBe(30 * 24 * 60 * 60 * 1000);
  // RESTRICTED data expires in 4 hours
  expect(restrictedExpiration).toBe(4 * 60 * 60 * 1000);
});
    it('should include appropriate access conditions', async () => {
  const decision = await enforcer.makeAccessDecision(;);
  'user123',
  'data456',
  'RESTRICTED',
  'read',
  {
  purpose: 'critical-operations');
  expect(decision.conditions).toContain('No unauthorized sharing');
  expect(decision.conditions).toContain('Must not be cached locally');
  expect(decision.conditions).toContain('Access monitored in real-time');
});
  });
  describe('validateOperation', () => {
  const baseOperation: OperationContext = {,
  operation: 'read',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req789',
};
    it('should validate read operations', async () => {
      const result = await enforcer.validateOperation(;);
        baseOperation,
        'CONFIDENTIAL',
        { id: 'data123' }
      );
      expect(result.valid).toBe(true);
      expect(result.controls).toContain('enhanced-audit-logging');
    });
    it('should validate write operations require encryption', async () => {
  const writeOp: OperationContext = {,
  ...baseOperation,
  operation: 'write',
};
      const result = await enforcer.validateOperation(;);
        writeOp,
        'CONFIDENTIAL',
        { id: 'data123' }
      );
      expect(result.valid).toBe(true);
      expect(result.controls).toContain('encryption-at-rest');
      expect(result.controls).toContain('audit-trail');
    });
    it('should validate delete operations', async () => {
  const deleteOp: OperationContext = {,
  ...baseOperation,
  operation: 'delete',
};
      const result = await enforcer.validateOperation(;);
        deleteOp,
        'CONFIDENTIAL',
        { id: 'data123' }
      );
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Data must be retained for 90 days');
      expect(result.controls).toContain('deletion-audit');
    });
    it('should validate export operations', async () => {
  const exportOp: OperationContext = {,
  ...baseOperation,
  operation: 'export',
};
      const result = await enforcer.validateOperation(;);
        exportOp,
        'RESTRICTED',
        { id: 'data123' }
      );
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Export restrictions apply to this classification');
      expect(result.controls).toContain('export-control');
      expect(result.controls).toContain('end-to-end-encryption');
    });
    it('should validate share operations', async () => {
  const shareOp: OperationContext = {,
  ...baseOperation,
  operation: 'share',
};
      const result = await enforcer.validateOperation(;);
        shareOp,
        'CONFIDENTIAL',
        { id: 'data123' }
      );
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Approval workflow required for sharing');
      expect(result.controls).toContain('approval-workflow');
      expect(result.controls).toContain('certificate-pinning');
    });
    it('should check environment restrictions', async () => {
  const devOp: OperationContext = {,
  ...baseOperation,
  operation: 'write',
  environment: 'development',
};
      const result = await enforcer.validateOperation(;);
        devOp,
        'RESTRICTED',
        { id: 'data123' }
      );
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Environment \'development\' not approved for this classification');
    });
    it('should check third-party processing restrictions', async () => {
  const thirdPartyOp: OperationContext = {,
  ...baseOperation,
  source: 'third-party',
};
      const result = await enforcer.validateOperation(;);
        thirdPartyOp,
        'RESTRICTED',
        { id: 'data123' }
      );
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Third-party processing not allowed for this classification');
    });
  });
  describe('Audit Logging', () => {
  it('should log enforcement decisions', async () => {
  const auditingEnforcer = new ClassificationEnforcer({)
  auditLogging: true,
});
      await auditingEnforcer.enforceClassification()
        'CONFIDENTIAL',
        {
  operation: 'read',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req789',
}
        ['auth-mfa', 'authorization']
      );
      const auditLog = auditingEnforcer.getAuditLog();
      expect(auditLog.length).toBe(1);
      expect(auditLog[0].eventType).toBe('ACCESS_GRANTED');
      expect(auditLog[0].classification).toBe('CONFIDENTIAL');
    });
    it('should log access denials', async () => {
  const strictEnforcer = new ClassificationEnforcer({)
  strictMode: true,
  auditLogging: true,
});
      await strictEnforcer.enforceClassification()
        'RESTRICTED',
        {
  operation: 'export',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req789',
}
        []
      );
      const auditLog = strictEnforcer.getAuditLog();
      expect(auditLog.length).toBe(1);
      expect(auditLog[0].eventType).toBe('ACCESS_DENIED');
      expect(auditLog[0].result).toBe('FAILURE');
    });
    it('should include violation details in audit', async () => {
  await enforcer.enforceClassification()
  'CONFIDENTIAL',
  {
  operation: 'write',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req789',
}
        []
      );
      const auditLog = enforcer.getAuditLog();
      expect(auditLog[0].details.violations).toContain('Encryption required for storage');
      expect(auditLog[0].details.riskScore).toBeGreaterThan(50);
    });
    it('should clear audit log', () => {
      enforcer.clearAuditLog();
      const auditLog = enforcer.getAuditLog();
      expect(auditLog).toHaveLength(0);
    });
  });
  describe('Integration Scenarios', () => {
  it('should handle complete authentication flow', async () => {
  // Start with basic auth
  let result = await enforcer.enforceClassification(;);
  'INTERNAL',
  {
  operation: 'read',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req789',
}
        ['auth-standard']
      );
      expect(result.allowed).toBe(true);
      // Try to access confidential data - should require MFA
      result = await enforcer.enforceClassification()
        'CONFIDENTIAL',
        {
  operation: 'read',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req790',
}
        ['auth-standard']
      );
      expect(result.violations).toContain('Required authentication level: MFA');
      // Add MFA and retry
      result = await enforcer.enforceClassification()
        'CONFIDENTIAL',
        {
  operation: 'read',
  userId: 'user123',
  sessionId: 'session456',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'req791',
}
        ['auth-mfa', 'authorization']
      );
      expect(result.allowed).toBe(true);
    });
    it('should handle data lifecycle operations', async () => {
  const dataId = 'data123';
  const userId = 'user456';
  // Create - should require encryption
  let result = await enforcer.validateOperation(;);
  {
  operation: 'write',
  userId,
  sessionId: 'session789',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'create-req',
}
        'CONFIDENTIAL',
        { id: dataId }
      );
      expect(result.controls).toContain('encryption-at-rest');
      // Read - should require enhanced audit
      result = await enforcer.validateOperation()
        {
  operation: 'read',
  userId,
  sessionId: 'session789',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'read-req',
}
        'CONFIDENTIAL',
        { id: dataId }
      );
      expect(result.controls).toContain('enhanced-audit-logging');
      // Export - should be restricted
      result = await enforcer.validateOperation()
        {
  operation: 'export',
  userId,
  sessionId: 'session789',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'export-req',
}
        'CONFIDENTIAL',
        { id: dataId }
      );
      expect(result.issues).toContain('Export restrictions apply to this classification');
      // Delete - should check retention
      result = await enforcer.validateOperation()
        {
  operation: 'delete',
  userId,
  sessionId: 'session789',
  purpose: 'business',
  environment: 'production',
  timestamp: new Date(),
  source: 'api',
  requestId: 'delete-req',
}
        'CONFIDENTIAL',
        { id: dataId }
      );
      expect(result.issues).toContain('Data must be retained for 90 days');
    });
  });
});