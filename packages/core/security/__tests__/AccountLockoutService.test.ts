/**
 * Test Suite for Account Lockout Service
 * 
 * Tests comprehensive account lockout management including administrator unlock
 * capabilities, audit trails, notifications, and emergency procedures.
 */
import {
  AccountLockoutService,
  LockoutStatus,
  LockoutReason,
  UnlockMethod,
  AdminRole,
  NotificationType,
  AccountLockout,
  UnlockRequest
} from '../AccountLockoutService';
describe('AccountLockoutService', () => {
  let service: AccountLockoutService;
  let mockDate: Date;
  beforeEach(() => {
    mockDate = new Date('2025-01-15T10:00:00Z');
    const OriginalDate = Date;
    jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown));
    // Mock the Date constructor
    const mockDateConstructor = jest.fn<unknown[], unknown>().mockImplementation((value?: unknown) => {
      if (value !== undefined) {
        return new OriginalDate(value);
      }
      return mockDate;
    });
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    service = new AccountLockoutService();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Account Lockout Creation', () => {
    test('should create lockout with basic information', async () => {
      const userId = 'user123';
      const userEmail = 'test@example.com';
      const reason = LockoutReason.EXCESSIVE_FAILED_ATTEMPTS;
      const lockoutId = await service.createLockout(userId, userEmail, reason);
      expect(lockoutId).toBeTruthy();
      expect(lockoutId).toMatch(/^LOCK-\d+-[A-F0-9]{8}$/);
      const lockout = service.getLockout(lockoutId);
      expect(lockout).toBeTruthy();
      expect(lockout!.userId).toBe(userId);
      expect(lockout!.userEmail).toBe(userEmail);
      expect(lockout!.reason).toBe(reason);
      expect(lockout!.status).toBe(LockoutStatus.ACTIVE);
    });
    test('should set appropriate expiry times based on reason', async () => {
      const testCases = [;
        { reason: LockoutReason.EXCESSIVE_FAILED_ATTEMPTS, expectedMinutes: 30 },
        { reason: LockoutReason.SUSPICIOUS_ACTIVITY, expectedHours: 24 },
        { reason: LockoutReason.SYSTEM_SECURITY_ALERT, expectedHours: 1 }
      ];
      for (const testCase of testCases) {
        const lockoutId = await service.createLockout('user', 'test@example.com', testCase.reason);
        const lockout = service.getLockout(lockoutId);
        if (testCase.expectedMinutes) {
          const expectedTime = new Date(mockDate.getTime() + testCase.expectedMinutes * 60 * 1000);
          expect(lockout!.expiryTime).toEqual(expectedTime);
        } else if (testCase.expectedHours) {
          const expectedTime = new Date(mockDate.getTime() + testCase.expectedHours * 60 * 60 * 1000);
          expect(lockout!.expiryTime).toEqual(expectedTime);
        }
      }
    });
    test('should not set expiry for manual lockout reasons', async () => {
      const manualReasons = [;
        LockoutReason.SECURITY_POLICY_VIOLATION,
        LockoutReason.ADMIN_MANUAL_LOCK,
        LockoutReason.COMPLIANCE_REQUIREMENT
      ];
      for (const reason of manualReasons) {
        const lockoutId = await service.createLockout('user', 'test@example.com', reason);
        const lockout = service.getLockout(lockoutId);
        expect(lockout!.expiryTime).toBeUndefined();
      }
    });
    test('should create audit trail entry on lockout creation', async () => {
      const lockoutId = await service.createLockout('user123', 'test@example.com', LockoutReason.SUSPICIOUS_ACTIVITY);
      const lockout = service.getLockout(lockoutId);
      expect(lockout!.auditTrail).toHaveLength(1);
      expect(lockout!.auditTrail[0].event).toBe('Account locked');
      expect(lockout!.auditTrail[0].actor).toBe('system');
      expect(lockout!.auditTrail[0].actorType).toBe('system');
    });
  });
  describe('Administrator Unlock Functionality', () => {
    let lockoutId: string;
    beforeEach(async () => {
      lockoutId = await service.createLockout('user123', 'test@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
    });
    test('should allow super admin to unlock without approval', async () => {
      const unlockRequest: UnlockRequest = {
        lockoutId,
        adminId: AdminRole.SUPER_ADMIN,
        reason: 'User verified via phone',
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: 'Legitimate user confirmed identity',
        approvalRequired: false,
      };
      const result = await service.adminUnlock(lockoutId, unlockRequest);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Account successfully unlocked');
      expect(result.requiresApproval).toBeUndefined();
      const lockout = service.getLockout(lockoutId);
      expect(lockout!.status).toBe(LockoutStatus.UNLOCKED);
      expect(lockout!.unlockTime).toEqual(mockDate);
    });
    test('should require approval for security admin unlock', async () => {
      const unlockRequest: UnlockRequest = {
        lockoutId,
        adminId: AdminRole.SECURITY_ADMIN,
        reason: 'User contacted support',
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: 'User provided verification',
        approvalRequired: false,
      };
      const result = await service.adminUnlock(lockoutId, unlockRequest);
      expect(result.success).toBe(true);
      expect(result.requiresApproval).toBe(true);
      expect(result.message).toBe('Unlock request submitted for approval');
      const lockout = service.getLockout(lockoutId);
      expect(lockout!.status).toBe(LockoutStatus.PENDING_REVIEW);
    });
    test('should deny unlock for insufficient permissions', async () => {
      const unlockRequest: UnlockRequest = {
        lockoutId,
        adminId: 'invalid-admin' as AdminRole,
        reason: 'Testing',
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: 'Test',
        approvalRequired: false,
      };
      const result = await service.adminUnlock(lockoutId, unlockRequest);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to unlock account');
    });
    test('should prevent unlock of already unlocked account', async () => {
      // First unlock
      const unlockRequest: UnlockRequest = {
        lockoutId,
        adminId: AdminRole.SUPER_ADMIN,
        reason: 'First unlock',
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: 'Test',
        approvalRequired: false,
      };
      await service.adminUnlock(lockoutId, unlockRequest);
      // Attempt second unlock
      const secondResult = await service.adminUnlock(lockoutId, unlockRequest);
      expect(secondResult.success).toBe(false);
      expect(secondResult.message).toBe('Cannot unlock account with status: unlocked');
    });
  });
  describe('Emergency Unlock Functionality', () => {
    let lockoutId: string;
    beforeEach(async () => {
      lockoutId = await service.createLockout('user123', 'test@example.com', LockoutReason.SECURITY_POLICY_VIOLATION);
    });
    test('should perform emergency unlock with valid code', async () => {
      const adminId = 'emergency-admin';
      const emergencyCode = service.generateEmergencyCode(adminId);
      const justification = 'Critical business impact';
      const result = await service.emergencyUnlock(lockoutId, adminId, emergencyCode, justification);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Account successfully unlocked');
      const lockout = service.getLockout(lockoutId);
      expect(lockout!.status).toBe(LockoutStatus.UNLOCKED);
    });
    test('should reject emergency unlock with invalid code', async () => {
      const result = await service.emergencyUnlock(lockoutId, 'admin', 'INVALID-CODE', 'Test');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid emergency override code');
    });
    test('should consume emergency code after use', async () => {
      const adminId = 'emergency-admin';
      const emergencyCode = service.generateEmergencyCode(adminId);
      // First use should succeed
      const firstResult = await service.emergencyUnlock(lockoutId, adminId, emergencyCode, 'Test');
      expect(firstResult.success).toBe(true);
      // Create another lockout for second test
      const secondLockoutId = await service.createLockout(;);
        'user456',
        'test2@example.com',
        LockoutReason.SUSPICIOUS_ACTIVITY
      );
      // Second use should fail
      const secondResult = await service.emergencyUnlock(secondLockoutId, adminId, emergencyCode, 'Test');
      expect(secondResult.success).toBe(false);
    });
  });
  describe('Approval Workflow', () => {
    let lockoutId: string;
    let adminActionId: string;
    beforeEach(async () => {
      lockoutId = await service.createLockout('user123', 'test@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
      // Create approval request
      const unlockRequest: UnlockRequest = {
        lockoutId,
        adminId: AdminRole.SECURITY_ADMIN,
        reason: 'User verification',
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: 'Verified user identity',
        approvalRequired: false,
      };
      await service.adminUnlock(lockoutId, unlockRequest);
      const lockout = service.getLockout(lockoutId);
      adminActionId = lockout!.adminActions[0].id;
    });
    test('should approve unlock request', async () => {
      const result = await service.approveUnlock(;);
        lockoutId,
        adminActionId,
        'approver-admin',
        true,
        'Approved after review'
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Account successfully unlocked');
      const lockout = service.getLockout(lockoutId);
      expect(lockout!.status).toBe(LockoutStatus.UNLOCKED);
      expect(lockout!.adminActions[0].approvedBy).toBe('approver-admin');
    });
    test('should deny unlock request', async () => {
      const result = await service.approveUnlock(;);
        lockoutId,
        adminActionId,
        'approver-admin',
        false,
        'Insufficient evidence'
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Unlock request denied');
      const lockout = service.getLockout(lockoutId);
      expect(lockout!.status).toBe(LockoutStatus.ACTIVE);
      expect(lockout!.adminActions[0].metadata.approved).toBe(false);
    });
  });
  describe('User and Admin Queries', () => {
    test('should retrieve user lockouts', async () => {
      const userId = 'user123';
      const lockoutId1 = await service.createLockout(;);
        userId,
        'test@example.com',
        LockoutReason.EXCESSIVE_FAILED_ATTEMPTS
      );
      const lockoutId2 = await service.createLockout(userId, 'test@example.com', LockoutReason.SUSPICIOUS_ACTIVITY);
      const userLockouts = service.getUserLockouts(userId);
      expect(userLockouts).toHaveLength(2);
      expect(userLockouts.map(l => l.id)).toContain(lockoutId1);
      expect(userLockouts.map(l => l.id)).toContain(lockoutId2);
    });
    test('should check if user is currently locked out', async () => {
      const userId = 'user123';
      expect(service.isUserLockedOut(userId)).toBe(false);
      await service.createLockout(userId, 'test@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
      expect(service.isUserLockedOut(userId)).toBe(true);
    });
    test('should retrieve pending lockouts', async () => {
      const lockoutId1 = await service.createLockout(;);
        'user1',
        'test1@example.com',
        LockoutReason.EXCESSIVE_FAILED_ATTEMPTS
      );
      const lockoutId2 = await service.createLockout(;);
        'user2',
        'test2@example.com',
        LockoutReason.SECURITY_POLICY_VIOLATION
      );
      // Create pending review for first lockout
      const unlockRequest: UnlockRequest = {
        lockoutId: lockoutId1,
        adminId: AdminRole.HELP_DESK,
        reason: 'User request',
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: 'User contacted support',
        approvalRequired: false,
      };
      await service.adminUnlock(lockoutId1, unlockRequest);
      const pending = service.getPendingLockouts();
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe(lockoutId1);
    });
  });
  describe('Statistics and Reporting', () => {
    test('should provide comprehensive lockout statistics', async () => {
      // Create various lockouts
      await service.createLockout('user1', 'test1@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
      await service.createLockout('user2', 'test2@example.com', LockoutReason.SUSPICIOUS_ACTIVITY);
      await service.createLockout('user1', 'test1@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
      const stats = service.getLockoutStatistics();
      expect(stats.totalLockouts).toBe(3);
      expect(stats.activeLockouts).toBe(3);
      expect(stats.lockoutsByReason[LockoutReason.EXCESSIVE_FAILED_ATTEMPTS]).toBe(2);
      expect(stats.lockoutsByReason[LockoutReason.SUSPICIOUS_ACTIVITY]).toBe(1);
      expect(stats.topAffectedUsers).toContainEqual({ userId: 'user1', count: 2 });
    });
    test('should filter statistics by date range', async () => {
      await service.createLockout('user1', 'test1@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
      const stats = service.getLockoutStatistics({)
        start: new Date(mockDate.getTime() - 24 * 60 * 60 * 1000),
        end: new Date(mockDate.getTime() + 24 * 60 * 60 * 1000),
      });
      expect(stats.totalLockouts).toBe(1);
    });
  });
  describe('Emergency Code Management', () => {
    test('should generate emergency override codes', () => {
      const adminId = 'emergency-admin';
      const code = service.generateEmergencyCode(adminId);
      expect(code).toBeTruthy();
      expect(code).toMatch(/^[A-F0-9]{32}$/);
    });
    test('should expire emergency codes after specified time', (done) => {
      const adminId = 'emergency-admin';
      const code = service.generateEmergencyCode(adminId, 0.001); // 0.001 hours = 3.6 seconds;
      setTimeout(async () => {
        const lockoutId = await service.createLockout('user', 'test@example.com', LockoutReason.SUSPICIOUS_ACTIVITY);
        const result = await service.emergencyUnlock(lockoutId, adminId, code, 'Test');
        expect(result.success).toBe(false);
        done();
      }, 100); // Wait 100ms for expiry
    });
  });
  describe('Event Emission', () => {
    test('should emit accountLocked event', (done) => {
      service.on('accountLocked', (lockout) => {
        expect(lockout.userId).toBe('user123');
        expect(lockout.reason).toBe(LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
        done();
      });
      service.createLockout('user123', 'test@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS);
    });
    test('should emit accountUnlocked event', (done) => {
      service.on('accountUnlocked', (data) => {
        expect(data.lockout.userId).toBe('user123');
        expect(data.unlockRequest.adminId).toBe(AdminRole.SUPER_ADMIN);
        done();
      });
      service.createLockout('user123', 'test@example.com', LockoutReason.EXCESSIVE_FAILED_ATTEMPTS)
        .then(lockoutId => {)
          const unlockRequest: UnlockRequest = {
            lockoutId,
            adminId: AdminRole.SUPER_ADMIN,
            reason: 'Test unlock',
            method: UnlockMethod.ADMIN_OVERRIDE,
            urgency: 'medium',
            justification: 'Testing',
            approvalRequired: false,
          };
          return service.adminUnlock(lockoutId, unlockRequest);
        });
    });
    test('should emit emergencyUnlockUsed event', (done) => {
      service.on('emergencyUnlockUsed', (data) => {
        expect(data.adminId).toBe('emergency-admin');
        expect(data.justification).toBe('Critical issue');
        done();
      });
      service.createLockout('user123', 'test@example.com', LockoutReason.SECURITY_POLICY_VIOLATION)
        .then(lockoutId => {)
          const code = service.generateEmergencyCode('emergency-admin');
          return service.emergencyUnlock(lockoutId, 'emergency-admin', code, 'Critical issue');
        });
    });
  });
  describe('Error Handling', () => {
    test('should throw error for non-existent lockout', async () => {
      const unlockRequest: UnlockRequest = {
        lockoutId: 'non-existent',
        adminId: AdminRole.SUPER_ADMIN,
        reason: 'Test',
        method: UnlockMethod.ADMIN_OVERRIDE,
        urgency: 'medium',
        justification: 'Test',
        approvalRequired: false,
      };
      await expect()
        service.adminUnlock('non-existent',)
        unlockRequest
      )).rejects.toThrow('Lockout not found: non-existent');
    });
    test('should throw error for non-existent admin action', async () => {
      const lockoutId = await service.createLockout(;);
        'user',
        'test@example.com',
        LockoutReason.EXCESSIVE_FAILED_ATTEMPTS
      );
      await expect()
        service.approveUnlock(lockoutId,)
        'non-existent-action',
        'approver',
        true
      )).rejects.toThrow('Admin action not found: non-existent-action');
    });
  });
});