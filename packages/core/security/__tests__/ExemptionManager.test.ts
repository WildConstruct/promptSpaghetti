/**
 * Test Suite for Exemption Manager Service
 * 
 * Tests comprehensive exemption management including request approval workflow,
 * conditions checking, emergency exemptions, and audit trails.
 */
import {
  ExemptionManager,
  ExemptionType,
  ExemptionScope,
  ExemptionStatus,
  ExemptionPriority,
  ExemptionReason,
  ExemptionRequest,
  ExemptionUsageContext
} from '../ExemptionManager';
import { AdminRole } from '../AccountLockoutService';
describe('ExemptionManager', () => {
  let manager: ExemptionManager;
  let mockDate: Date;
  beforeEach(() => {
  mockDate = new Date('2025-01-15T10:00:00Z');
  jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown));
  // Store reference to original Date constructor before mocking
  const OriginalDate = Date;
  // Mock the Date constructor
  const mockDateConstructor = jest.fn<unknown, unknown>().mockImplementation((value?: unknown) => {,
  if (value !== undefined) {
  return new OriginalDate(value);
  return mockDate;
});
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    manager = new ExemptionManager();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Exemption Request Creation', () => {
  test('should create exemption request with approval required', async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.USER,
  target: 'user123',
  reason: ExemptionReason.BUSINESS_CRITICAL,
  description: 'Critical business user needs higher rate limits',
  priority: ExemptionPriority.HIGH,
  requestedDuration: 14,
  businessJustification: 'User is running critical batch operations',
  riskLevel: 'medium',
  mitigations: ['Additional monitoring', 'Time-limited access'],
};
      const exemptionId = await manager.requestExemption(;);
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      );
      expect(exemptionId).toBeTruthy();
      expect(exemptionId).toMatch(/^[0-9a-f-]{36}$/);
      const query = manager.queryExemptions({)
  statuses: [ExemptionStatus.PENDING_APPROVAL],
});
      expect(query.exemptions).toHaveLength(1);
      expect(query.exemptions[0].id).toBe(exemptionId);
      expect(query.exemptions[0].status).toBe(ExemptionStatus.PENDING_APPROVAL);
    });
    test('should auto-approve exemptions when policy allows', async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.API_KEY,
  target: 'api-key-123',
  reason: ExemptionReason.API_INTEGRATION,
  description: 'API integration requires higher limits',
  priority: ExemptionPriority.MEDIUM,
  requestedDuration: 30,
  businessJustification: 'New partner integration',
  riskLevel: 'low',
  mitigations: ['API monitoring'],
};
      const exemptionId = await manager.requestExemption(;);
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      );
      const query = manager.queryExemptions({)
  statuses: [ExemptionStatus.ACTIVE],
});
      expect(query.exemptions).toHaveLength(1);
      expect(query.exemptions[0].id).toBe(exemptionId);
      expect(query.exemptions[0].status).toBe(ExemptionStatus.ACTIVE);
    });
    test('should reject request from unauthorized role', async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.MFA_REQUIREMENT,
  scope: ExemptionScope.USER,
  target: 'user123',
  reason: ExemptionReason.TESTING,
  description: 'Test exemption',
  priority: ExemptionPriority.LOW,
  businessJustification: 'Testing purposes',
  riskLevel: 'low',
  mitigations: [],
};
      await expect(manager.requestExemption()
        request,
        'helpdesk1',
        'helpdesk@company.com',
        AdminRole.HELP_DESK
      )).rejects.toThrow('Role help_desk is not authorized');
    });
    test('should reject request exceeding maximum duration', async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.USER,
  target: 'user123',
  reason: ExemptionReason.BUSINESS_CRITICAL,
  description: 'Long-term exemption',
  priority: ExemptionPriority.HIGH,
  requestedDuration: 365, // Way too long,
  businessJustification: 'Business needs',
  riskLevel: 'high',
  mitigations: [],
};
      await expect(manager.requestExemption()
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      )).rejects.toThrow('Requested duration 365 days exceeds maximum allowed 30 days');
    });
  });
  describe('Exemption Approval Workflow', () => {
  let exemptionId: string;
  beforeEach(async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.ACCOUNT_LOCKOUT,
  scope: ExemptionScope.USER,
  target: 'user456',
  reason: ExemptionReason.BUSINESS_CRITICAL,
  description: 'User needs immediate access',
  priority: ExemptionPriority.HIGH,
  requestedDuration: 7,
  businessJustification: 'Critical business function',
  riskLevel: 'medium',
  mitigations: ['Additional monitoring'],
};
      exemptionId = await manager.requestExemption()
        request,
        'requester1',
        'requester@company.com',
        AdminRole.HELP_DESK
      );
    });
    test('should approve pending exemption', async () => {
  const approved = await manager.approveExemption(;);
  exemptionId,
  'approver1',
  'approver@company.com',
  AdminRole.SECURITY_ADMIN,
  'Approved after review'
  );
  expect(approved).toBe(true);
  const query = manager.queryExemptions({)
  statuses: [ExemptionStatus.ACTIVE],
});
      expect(query.exemptions).toHaveLength(1);
      expect(query.exemptions[0].id).toBe(exemptionId);
      expect(query.exemptions[0].approvedBy?.userId).toBe('approver1');
      expect(query.exemptions[0].approvedBy?.comments).toBe('Approved after review');
    });
    test('should deny pending exemption', async () => {
  const denied = await manager.denyExemption(;);
  exemptionId,
  'approver1',
  'approver@company.com',
  AdminRole.SECURITY_ADMIN,
  'Insufficient justification'
  );
  expect(denied).toBe(true);
  const query = manager.queryExemptions({)
  statuses: [ExemptionStatus.DENIED],
});
      expect(query.exemptions).toHaveLength(1);
      expect(query.exemptions[0].id).toBe(exemptionId);
    });
    test('should reject approval from unauthorized role', async () => {
      await expect(manager.approveExemption()
        exemptionId,
        'unauthorized',
        'unauthorized@company.com',
        AdminRole.HELP_DESK,
        'Unauthorized approval'
      )).rejects.toThrow('Role help_desk is not authorized to approve');
    });
    test('should reject approval of non-pending exemption', async () => {
      // First approve the exemption
      await manager.approveExemption()
        exemptionId,
        'approver1',
        'approver@company.com',
        AdminRole.SECURITY_ADMIN
      );
      // Try to approve again
      await expect(manager.approveExemption()
        exemptionId,
        'approver2',
        'approver2@company.com',
        AdminRole.SECURITY_ADMIN
      )).rejects.toThrow('is not pending approval');
    });
  });
  describe('Exemption Checking and Usage', () => {
  let activeExemptionId: string;
  beforeEach(async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.USER,
  target: 'user789',
  reason: ExemptionReason.BUSINESS_CRITICAL,
  description: 'Test exemption',
  priority: ExemptionPriority.MEDIUM,
  requestedDuration: 7,
  businessJustification: 'Testing',
  riskLevel: 'low',
  mitigations: [],
  conditions: {,
  ipWhitelist: ['192.168.1.100'],
  usageQuota: {,
  maxUsesPerDay: 10,
  maxUsesPerHour: 5,
  currentUsage: 0,
  resetTime: new Date(),
};
      activeExemptionId = await manager.requestExemption()
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      );
      // Auto-approved for API_KEY scope, but we need to approve for USER scope
      await manager.approveExemption()
        activeExemptionId,
        'approver1',
        'approver@company.com',
        AdminRole.SECURITY_ADMIN
      );
    });
    test('should grant exemption when conditions are met', () => {
  const context: ExemptionUsageContext = {,
  ipAddress: '192.168.1.100',
  operation: 'api_call',
  requestId: 'req-123',
};
      const result = manager.checkExemption(;);
        ExemptionType.RATE_LIMITING,
        ExemptionScope.USER,
        'user789',
        context
      );
      expect(result.granted).toBe(true);
      expect(result.exemption?.id).toBe(activeExemptionId);
    });
    test('should deny exemption when IP not whitelisted', () => {
  const context: ExemptionUsageContext = {,
  ipAddress: '203.0.113.1', // Not in whitelist,
  operation: 'api_call',
};
      const result = manager.checkExemption(;);
        ExemptionType.RATE_LIMITING,
        ExemptionScope.USER,
        'user789',
        context
      );
      expect(result.granted).toBe(false);
      expect(result.reason).toBe('IP address not in whitelist');
    });
    test('should deny exemption when no active exemption exists', () => {
      const result = manager.checkExemption(;);
        ExemptionType.RATE_LIMITING,
        ExemptionScope.USER,
        'nonexistent-user'
      );
      expect(result.granted).toBe(false);
      expect(result.reason).toBe('No active exemption found');
    });
    test('should track usage when exemption is used', () => {
  const context: ExemptionUsageContext = {,
  ipAddress: '192.168.1.100',
  operation: 'api_call',
};
      // Use exemption multiple times
      manager.checkExemption(ExemptionType.RATE_LIMITING, ExemptionScope.USER, 'user789', context);
      manager.checkExemption(ExemptionType.RATE_LIMITING, ExemptionScope.USER, 'user789', context);
      const query = manager.queryExemptions({ activeOnly: true });
      const exemption = query.exemptions.find(ex => ex.id === activeExemptionId);
      expect(exemption?.usage.timesUsed).toBe(2);
      expect(exemption?.usage.usageHistory).toHaveLength(2);
      expect(exemption?.conditions.usageQuota?.currentUsage).toBe(2);
    });
    test('should deny exemption when daily quota exceeded', () => {
  const context: ExemptionUsageContext = {,
  ipAddress: '192.168.1.100',
  operation: 'api_call',
};
      // Use exemption up to quota limit
      for (let i = 0; i < 10; i++) {
        manager.checkExemption(ExemptionType.RATE_LIMITING, ExemptionScope.USER, 'user789', context);
      // 11th attempt should be denied
      const result = manager.checkExemption(;);
        ExemptionType.RATE_LIMITING,
        ExemptionScope.USER,
        'user789',
        context
      );
      expect(result.granted).toBe(false);
      expect(result.reason).toBe('Daily usage quota exceeded');
    });
  });
  describe('Emergency Exemptions', () => {
  test('should create emergency exemption with valid code', async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.ACCOUNT_LOCKOUT,
  scope: ExemptionScope.USER,
  target: 'emergency-user',
  reason: ExemptionReason.EMERGENCY_ACCESS,
  description: 'Critical system access needed',
  priority: ExemptionPriority.EMERGENCY,
  businessJustification: 'System outage requires immediate access',
  riskLevel: 'critical',
  mitigations: ['Continuous monitoring'],
  emergencyOverride: true,
};
      const exemptionId = await manager.createEmergencyExemption(;);
        request,
        'emergency-admin',
        'emergency@company.com',
        AdminRole.SUPER_ADMIN,
        'EMERGENCY-SA-ABCD1234',
        'Critical business impact - system down'
      );
      expect(exemptionId).toBeTruthy();
      const query = manager.queryExemptions({)
  priorities: [ExemptionPriority.EMERGENCY],
  activeOnly: true,
});
      expect(query.exemptions).toHaveLength(1);
      expect(query.exemptions[0].priority).toBe(ExemptionPriority.EMERGENCY);
      expect(query.exemptions[0].status).toBe(ExemptionStatus.ACTIVE);
      expect(query.exemptions[0].expiresAt).toBeTruthy(); // Should have 24-hour expiry
    });
    test('should reject emergency exemption with invalid code', async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.ACCOUNT_LOCKOUT,
  scope: ExemptionScope.USER,
  target: 'emergency-user',
  reason: ExemptionReason.EMERGENCY_ACCESS,
  description: 'Test',
  priority: ExemptionPriority.EMERGENCY,
  businessJustification: 'Test',
  riskLevel: 'critical',
  mitigations: [],
};
      await expect(manager.createEmergencyExemption()
        request,
        'admin',
        'admin@company.com',
        AdminRole.SUPER_ADMIN,
        'INVALID-CODE',
        'Emergency'
      )).rejects.toThrow('Invalid emergency override code');
    });
    test('should reject emergency exemption for non-emergency type', async () => {
  const request: ExemptionRequest = {,
  type: ExemptionType.MFA_REQUIREMENT, // Emergency not allowed for MFA,
  scope: ExemptionScope.USER,
  target: 'user',
  reason: ExemptionReason.EMERGENCY_ACCESS,
  description: 'Test',
  priority: ExemptionPriority.EMERGENCY,
  businessJustification: 'Test',
  riskLevel: 'critical',
  mitigations: [],
};
      await expect(manager.createEmergencyExemption()
        request,
        'admin',
        'admin@company.com',
        AdminRole.SUPER_ADMIN,
        'EMERGENCY-SA-ABCD1234',
        'Emergency'
      )).rejects.toThrow('Emergency exemptions not allowed for type mfa_requirement');
    });
  });
  describe('Exemption Revocation', () => {
  let activeExemptionId: string;
  beforeEach(async () => {
  // Create auto-approved exemption
  const request: ExemptionRequest = {,
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.API_KEY,
  target: 'api-key-456',
  reason: ExemptionReason.API_INTEGRATION,
  description: 'Test exemption for revocation',
  priority: ExemptionPriority.LOW,
  businessJustification: 'Testing',
  riskLevel: 'low',
  mitigations: [],
};
      activeExemptionId = await manager.requestExemption()
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      );
    });
    test('should revoke active exemption', () => {
  const revoked = manager.revokeExemption(;);
  activeExemptionId,
  'revoker1',
  'revoker@company.com',
  AdminRole.SECURITY_ADMIN,
  'No longer needed'
  );
  expect(revoked).toBe(true);
  const query = manager.queryExemptions({)
  statuses: [ExemptionStatus.REVOKED],
});
      expect(query.exemptions).toHaveLength(1);
      expect(query.exemptions[0].id).toBe(activeExemptionId);
      expect(query.exemptions[0].revokedBy?.reason).toBe('No longer needed');
    });
    test('should reject revocation of non-active exemption', () => {
  // First revoke the exemption
  manager.revokeExemption()
  activeExemptionId,
  'revoker1',
  'revoker@company.com',
  AdminRole.SECURITY_ADMIN,
  'Test'
  );
  // Try to revoke again
  expect(() => manager.revokeExemption()
  activeExemptionId,
  'revoker2',
  'revoker2@company.com',
  AdminRole.SECURITY_ADMIN,
  'Second revocation'
  )).toThrow('Cannot revoke exemption with status: revoked');
});
  });
  describe('Exemption Querying', () => {
  beforeEach(async () => {
  // Create multiple exemptions for testing
  const requests = [;
  {
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.USER,
  target: 'user1',
  priority: ExemptionPriority.HIGH,
}
        {
  type: ExemptionType.ACCOUNT_LOCKOUT,
  scope: ExemptionScope.USER,
  target: 'user2',
  priority: ExemptionPriority.MEDIUM,
}
        {
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.API_KEY,
  target: 'api1',
  priority: ExemptionPriority.LOW];
  for (const req of requests) {
  const fullRequest: ExemptionRequest = {,
  ...req,
  reason: ExemptionReason.BUSINESS_CRITICAL,
  description: 'Test exemption',
  businessJustification: 'Testing',
  riskLevel: 'low',
  mitigations: [],
};
        await manager.requestExemption()
          fullRequest,
          'admin123',
          'admin@company.com',
          AdminRole.SYSTEM_ADMIN
        );
    });
    test('should query exemptions by type', () => {
  const result = manager.queryExemptions({)
  types: [ExemptionType.RATE_LIMITING],
});
      expect(result.exemptions).toHaveLength(2);
      result.exemptions.forEach(ex => {)
  expect(ex.type).toBe(ExemptionType.RATE_LIMITING);
      });
    });
    test('should query exemptions by scope', () => {
  const result = manager.queryExemptions({)
  scopes: [ExemptionScope.USER],
});
      expect(result.exemptions).toHaveLength(2);
      result.exemptions.forEach(ex => {)
  expect(ex.scope).toBe(ExemptionScope.USER);
      });
    });
    test('should query exemptions by priority', () => {
  const result = manager.queryExemptions({)
  priorities: [ExemptionPriority.HIGH],
});
      expect(result.exemptions).toHaveLength(1);
      expect(result.exemptions[0].priority).toBe(ExemptionPriority.HIGH);
    });
    test('should query active exemptions only', () => {
  const result = manager.queryExemptions({)
  activeOnly: true,
});
      // Only API_KEY exemptions are auto-approved (active)
      expect(result.exemptions.length).toBeGreaterThan(0);
      result.exemptions.forEach(ex => {)
  expect(ex.status).toBe(ExemptionStatus.ACTIVE);
      });
    });
    test('should support pagination', () => {
  const result = manager.queryExemptions({)
  limit: 2,
  offset: 0,
});
      expect(result.exemptions.length).toBeLessThanOrEqual(2);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(true);
    });
  });
  describe('Statistics and Reporting', () => {
    beforeEach(async () => {
      // Create test exemptions
      const requests = [;
        { type: ExemptionType.RATE_LIMITING, scope: ExemptionScope.USER, priority: ExemptionPriority.HIGH },
        { type: ExemptionType.ACCOUNT_LOCKOUT, scope: ExemptionScope.USER, priority: ExemptionPriority.MEDIUM },
        { type: ExemptionType.RATE_LIMITING, scope: ExemptionScope.API_KEY, priority: ExemptionPriority.LOW }
      ];
      for (const req of requests) {
        const fullRequest: ExemptionRequest = {
          ...req,
          target: `target-${req.type}`}
},
  reason: ExemptionReason.BUSINESS_CRITICAL,
          description: 'Test',
          businessJustification: 'Test',
          riskLevel: 'low',
          mitigations: [];
  };
        await manager.requestExemption()
          fullRequest,
          'admin123',
          'admin@company.com',
          AdminRole.SYSTEM_ADMIN
        );
    });
    test('should provide comprehensive statistics', () => {
      const stats = manager.getExemptionStatistics();
      expect(stats.total).toBe(3);
      expect(stats.byType[ExemptionType.RATE_LIMITING]).toBe(2);
      expect(stats.byType[ExemptionType.ACCOUNT_LOCKOUT]).toBe(1);
      expect(stats.byScope[ExemptionScope.USER]).toBe(2);
      expect(stats.byScope[ExemptionScope.API_KEY]).toBe(1);
      expect(stats.byPriority[ExemptionPriority.HIGH]).toBe(1);
      expect(stats.byPriority[ExemptionPriority.MEDIUM]).toBe(1);
      expect(stats.byPriority[ExemptionPriority.LOW]).toBe(1);
    });
    test('should track usage statistics', () => {
      const stats = manager.getExemptionStatistics();
      expect(stats.usageStats).toBeTruthy();
      expect(stats.usageStats.totalUsage).toBe(0); // No usage yet
      expect(stats.usageStats.averageUsagePerExemption).toBe(0);
      expect(stats.usageStats.mostUsedExemptions).toHaveLength(0);
    });
  });
  describe('Event Emission', () => {
    test('should emit exemption requested event', (done) => {
      manager.on('exemptionRequested', (exemption) => {
        expect(exemption.type).toBe(ExemptionType.ACCOUNT_LOCKOUT);
        expect(exemption.status).toBe(ExemptionStatus.PENDING_APPROVAL);
        done();
      });
      const request: ExemptionRequest = {,
  type: ExemptionType.ACCOUNT_LOCKOUT,
  scope: ExemptionScope.USER,
  target: 'user123',
  reason: ExemptionReason.BUSINESS_CRITICAL,
  description: 'Test',
  priority: ExemptionPriority.MEDIUM,
  businessJustification: 'Test',
  riskLevel: 'low',
  mitigations: [],
};
      manager.requestExemption()
        request,
        'admin123',
        'admin@company.com',
        AdminRole.HELP_DESK
      );
    });
    test('should emit exemption granted event for auto-approved', (done) => {
      manager.on('exemptionGranted', (exemption) => {
        expect(exemption.type).toBe(ExemptionType.RATE_LIMITING);
        expect(exemption.status).toBe(ExemptionStatus.ACTIVE);
        done();
      });
      const request: ExemptionRequest = {,
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.API_KEY,
  target: 'api-key-123',
  reason: ExemptionReason.API_INTEGRATION,
  description: 'Test',
  priority: ExemptionPriority.LOW,
  businessJustification: 'Test',
  riskLevel: 'low',
  mitigations: [],
};
      manager.requestExemption()
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      );
    });
    test('should emit exemption used event', (done) => {
      manager.on('exemptionUsed', (data) => {
        expect(data.exemption).toBeTruthy();
        expect(data.context.operation).toBe('test_operation');
        done();
      });
      // First create an auto-approved exemption
      const request: ExemptionRequest = {,
  type: ExemptionType.RATE_LIMITING,
  scope: ExemptionScope.API_KEY,
  target: 'api-used-test',
  reason: ExemptionReason.API_INTEGRATION,
  description: 'Test',
  priority: ExemptionPriority.LOW,
  businessJustification: 'Test',
  riskLevel: 'low',
  mitigations: [],
};
      manager.requestExemption()
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      ).then(() => {
        // Use the exemption
        manager.checkExemption()
          ExemptionType.RATE_LIMITING,
          ExemptionScope.API_KEY,
          'api-used-test',
          { operation: 'test_operation' }
        );
      });
    });
  });
  describe('Error Handling', () => {
  test('should throw error for non-existent exemption', async () => {
  await expect(manager.approveExemption()
  'non-existent-id',
  'approver',
  'approver@company.com',
  AdminRole.SUPER_ADMIN
  )).rejects.toThrow('Exemption not found: non-existent-id');
});
    test('should throw error for non-existent policy', async () => {
  const request: ExemptionRequest = {,
  type: 'invalid_type' as ExemptionType,
  scope: ExemptionScope.USER,
  target: 'user123',
  reason: ExemptionReason.TESTING,
  description: 'Test',
  priority: ExemptionPriority.LOW,
  businessJustification: 'Test',
  riskLevel: 'low',
  mitigations: [],
};
      await expect(manager.requestExemption()
        request,
        'admin123',
        'admin@company.com',
        AdminRole.SYSTEM_ADMIN
      )).rejects.toThrow('No policy found for exemption type invalid_type');
    });
  });
});