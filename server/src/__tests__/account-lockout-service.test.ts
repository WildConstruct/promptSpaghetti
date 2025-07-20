// Epic 17 - Account Lockout Service Tests
// Comprehensive tests for account lockout functionality

import { AccountLockoutService, LockoutConfig } from '../auth/services/AccountLockoutService';

describe('AccountLockoutService', () => {
  let lockoutService: AccountLockoutService;
  let mockDb: any;
  let mockRedis: any;
  let mockAuditService: any;
  let mockEmailService: any;
  let mockConfig: LockoutConfig;

  beforeEach(() => {
    // Mock database
    mockDb = {
      query: jest.fn().mockResolvedValue({ rows: [] })
    };

    // Mock Redis
    mockRedis = {
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue(true)
    };

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn().mockResolvedValue(true)
    };

    // Mock email service
    mockEmailService = {
      sendAccountLocked: jest.fn().mockResolvedValue(true),
      sendAdminLockoutAlert: jest.fn().mockResolvedValue(true),
      sendAccountUnlocked: jest.fn().mockResolvedValue(true)
    };

    // Mock configuration
    mockConfig = {
      maxFailedAttempts: 3,
      lockoutDurationMinutes: 15,
      progressiveLockout: true,
      progressiveMultipliers: [1, 2, 4],
      resetWindowHours: 24,
      notifyUser: true,
      notifyAdmins: false,
      adminEmails: [],
      allowSelfUnlock: true,
      captchaThreshold: 2
    };

    lockoutService = new AccountLockoutService(
      mockDb,
      mockRedis,
      mockAuditService,
      mockEmailService,
      mockConfig
    );
  });

  describe('getLockoutStatus', () => {
    it('should return default status for non-existent user', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const status = await lockoutService.getLockoutStatus('test@example.com');

      expect(status.isLocked).toBe(false);
      expect(status.failedAttempts).toBe(0);
      expect(status.lockCount).toBe(0);
    });

    it('should return locked status for locked account', async () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          account_locked: true,
          locked_until: futureDate,
          failed_login_attempts: 3,
          lockout_count: 1,
          last_failed_at: new Date()
        }]
      });

      const status = await lockoutService.getLockoutStatus('test@example.com');

      expect(status.isLocked).toBe(true);
      expect(status.failedAttempts).toBe(3);
      expect(status.lockCount).toBe(1);
      expect(status.lockedUntil).toEqual(futureDate);
    });

    it('should return unlocked status for expired lockout', async () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute ago
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          account_locked: true,
          locked_until: pastDate,
          failed_login_attempts: 3,
          lockout_count: 1,
          last_failed_at: new Date()
        }]
      });

      const status = await lockoutService.getLockoutStatus('test@example.com');

      expect(status.isLocked).toBe(false);
    });

    it('should indicate CAPTCHA requirement when threshold reached', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          account_locked: false,
          locked_until: null,
          failed_login_attempts: 2,
          lockout_count: 0,
          last_failed_at: new Date()
        }]
      });

      const status = await lockoutService.getLockoutStatus('test@example.com');

      expect(status.requiresCaptcha).toBe(true);
    });
  });

  describe('recordLoginAttempt', () => {
    it('should reset failed attempts on successful login', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          account_locked: false,
          locked_until: null,
          failed_login_attempts: 2,
          lockout_count: 0
        }]
      });

      await lockoutService.recordLoginAttempt({
        email: 'test@example.com',
        success: true,
        ipAddress: '127.0.0.1',
        timestamp: new Date()
      });

      expect(mockRedis.del).toHaveBeenCalledWith('failed_attempts:test@example.com');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('failed_login_attempts = 0'),
        expect.arrayContaining(['test@example.com'])
      );
    });

    it('should increment failed attempts on failed login', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          account_locked: false,
          locked_until: null,
          failed_login_attempts: 1,
          lockout_count: 0
        }]
      });
      mockRedis.incr.mockResolvedValueOnce(2);

      await lockoutService.recordLoginAttempt({
        email: 'test@example.com',
        success: false,
        ipAddress: '127.0.0.1',
        timestamp: new Date(),
        failureReason: 'Invalid password'
      });

      expect(mockRedis.incr).toHaveBeenCalledWith('failed_attempts:test@example.com');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1'),
        expect.arrayContaining(['test@example.com'])
      );
    });

    it('should lock account when max attempts reached', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            account_locked: false,
            locked_until: null,
            failed_login_attempts: 2,
            lockout_count: 0
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            lockout_count: 0,
            user_id: 'user-123'
          }]
        })
        .mockResolvedValueOnce({ rows: [] }); // Update query

      mockRedis.incr.mockResolvedValueOnce(3);

      const status = await lockoutService.recordLoginAttempt({
        email: 'test@example.com',
        success: false,
        ipAddress: '127.0.0.1',
        timestamp: new Date(),
        failureReason: 'Invalid password'
      });

      expect(status.isLocked).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('account_locked = true'),
        expect.any(Array)
      );
    });
  });

  describe('progressive lockout', () => {
    it('should calculate progressive lockout duration', async () => {
      // Mock first lockout
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            account_locked: false,
            locked_until: null,
            failed_login_attempts: 2,
            lockout_count: 2 // This would be the 3rd lockout
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            lockout_count: 2,
            user_id: 'user-123'
          }]
        })
        .mockResolvedValueOnce({ rows: [] });

      mockRedis.incr.mockResolvedValueOnce(3);

      await lockoutService.recordLoginAttempt({
        email: 'test@example.com',
        success: false,
        ipAddress: '127.0.0.1',
        timestamp: new Date()
      });

      // Should use multiplier [2] = 4, so 15 * 4 = 60 minutes
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('locked_until = $1'),
        expect.arrayContaining([expect.any(Date), 3, 3, 'test@example.com'])
      );
    });
  });

  describe('generateUnlockToken', () => {
    it('should generate token for locked account', async () => {
      mockConfig.allowSelfUnlock = true;
      mockDb.query.mockResolvedValueOnce({
        rows: [{ user_id: 'user-123' }]
      });

      const token = await lockoutService.generateUnlockToken('test@example.com');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'unlock_token:test@example.com',
        900,
        expect.stringContaining('"token"')
      );
    });

    it('should throw error when self-unlock disabled', async () => {
      mockConfig.allowSelfUnlock = false;

      await expect(
        lockoutService.generateUnlockToken('test@example.com')
      ).rejects.toThrow('Self-unlock is not allowed');
    });

    it('should throw error for non-locked account', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        lockoutService.generateUnlockToken('test@example.com')
      ).rejects.toThrow('Account not found or not locked');
    });
  });

  describe('verifyUnlockToken', () => {
    it('should unlock account with valid token', async () => {
      const tokenData = {
        token: 'valid-token',
        email: 'test@example.com',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 60000).toISOString()
      };
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(tokenData));

      const result = await lockoutService.verifyUnlockToken('test@example.com', 'valid-token');

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('unlock_token:test@example.com');
    });

    it('should reject invalid token', async () => {
      const tokenData = {
        token: 'different-token',
        email: 'test@example.com',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 60000).toISOString()
      };
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(tokenData));

      const result = await lockoutService.verifyUnlockToken('test@example.com', 'invalid-token');

      expect(result).toBe(false);
    });

    it('should reject expired token', async () => {
      const tokenData = {
        token: 'valid-token',
        email: 'test@example.com',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 60000).toISOString() // Expired
      };
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(tokenData));

      const result = await lockoutService.verifyUnlockToken('test@example.com', 'valid-token');

      expect(result).toBe(false);
    });

    it('should reject when no token found', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const result = await lockoutService.verifyUnlockToken('test@example.com', 'any-token');

      expect(result).toBe(false);
    });
  });

  describe('unlockAccount', () => {
    it('should unlock account and clear attempts', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ user_id: 'user-123', lockout_count: 1 }]
        })
        .mockResolvedValueOnce({ rows: [] });

      await lockoutService.unlockAccount('test@example.com', 'admin', 'admin-123');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('account_locked = false'),
        expect.arrayContaining(['test@example.com'])
      );
      expect(mockRedis.del).toHaveBeenCalledWith('failed_attempts:test@example.com');
    });

    it('should log unlock event', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ user_id: 'user-123', lockout_count: 1 }]
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      await lockoutService.unlockAccount('test@example.com', 'admin', 'admin-123');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO lockout_events'),
        expect.arrayContaining([
          'user-123',
          'test@example.com',
          'unlocked',
          1,
          undefined,
          undefined,
          undefined,
          expect.any(Date),
          true,
          'admin'
        ])
      );
    });
  });

  describe('getLockoutStatistics', () => {
    it('should return lockout statistics', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ total_lockouts: '10', avg_duration_minutes: '30' }]
        })
        .mockResolvedValueOnce({
          rows: [{ active_lockouts: '2' }]
        })
        .mockResolvedValueOnce({
          rows: [
            { reason: 'invalid_password', count: '5' },
            { reason: 'account_not_found', count: '3' }
          ]
        })
        .mockResolvedValueOnce({
          rows: [
            { level: 1, count: '7' },
            { level: 2, count: '2' },
            { level: 3, count: '1' }
          ]
        })
        .mockResolvedValueOnce({
          rows: [
            { method: 'time', count: '8' },
            { method: 'admin', count: '2' }
          ]
        });

      const stats = await lockoutService.getLockoutStatistics('week');

      expect(stats.totalLockouts).toBe(10);
      expect(stats.activeLockouts).toBe(2);
      expect(stats.averageLockoutDuration).toBe(30);
      expect(stats.topLockoutReasons).toHaveLength(2);
      expect(stats.lockoutsByLevel).toHaveLength(3);
      expect(stats.unlockMethods).toHaveLength(2);
    });
  });

  describe('email notifications', () => {
    it('should send user notification when account is locked', async () => {
      mockConfig.notifyUser = true;
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            account_locked: false,
            failed_login_attempts: 2,
            lockout_count: 0
          }]
        })
        .mockResolvedValueOnce({
          rows: [{ lockout_count: 0, user_id: 'user-123' }]
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      mockRedis.incr.mockResolvedValueOnce(3);

      await lockoutService.recordLoginAttempt({
        email: 'test@example.com',
        success: false,
        ipAddress: '127.0.0.1',
        timestamp: new Date()
      });

      expect(mockEmailService.sendAccountLocked).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          lockCount: 1,
          duration: 15
        })
      );
    });

    it('should send admin notification for repeated lockouts', async () => {
      mockConfig.notifyAdmins = true;
      mockConfig.adminEmails = ['admin@example.com'];
      
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            account_locked: false,
            failed_login_attempts: 2,
            lockout_count: 2 // This will be 3rd lockout
          }]
        })
        .mockResolvedValueOnce({
          rows: [{ lockout_count: 2, user_id: 'user-123' }]
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      mockRedis.incr.mockResolvedValueOnce(3);

      await lockoutService.recordLoginAttempt({
        email: 'test@example.com',
        success: false,
        ipAddress: '127.0.0.1',
        timestamp: new Date()
      });

      expect(mockEmailService.sendAdminLockoutAlert).toHaveBeenCalledWith(
        'admin@example.com',
        expect.objectContaining({
          userEmail: 'test@example.com',
          lockCount: 3
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database error'));

      const status = await lockoutService.getLockoutStatus('test@example.com');

      expect(status.isLocked).toBe(false);
      expect(status.failedAttempts).toBe(0);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.incr.mockRejectedValueOnce(new Error('Redis error'));
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          account_locked: false,
          failed_login_attempts: 1,
          lockout_count: 0
        }]
      });

      await expect(
        lockoutService.recordLoginAttempt({
          email: 'test@example.com',
          success: false,
          ipAddress: '127.0.0.1',
          timestamp: new Date()
        })
      ).rejects.toThrow('Redis error');
    });
  });
});