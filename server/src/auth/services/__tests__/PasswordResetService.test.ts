// Epic 11 PasswordResetService Tests
// Comprehensive test suite for password reset functionality

import { PasswordResetService } from '../PasswordResetService';
import { DatabaseService } from '../../database/DatabaseService';
import { EmailService } from '../EmailService';
import { AuditService } from '../AuditService';
import { RateLimitService } from '../RateLimitService';
import { PasswordResetRequest, PasswordResetConfirmation } from '../../types';

// Mock dependencies
jest.mock('../../database/DatabaseService');
jest.mock('../EmailService');
jest.mock('../AuditService');
jest.mock('../RateLimitService');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: () => 'mock-token-hex' })),
  createHash: jest.fn(() => ({ update: jest.fn().mockReturnThis(), digest: () => 'mock-hash' }))
}));

describe('PasswordResetService', () => {
  let passwordResetService: PasswordResetService;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockEmail: jest.Mocked<EmailService>;
  let mockAudit: jest.Mocked<AuditService>;
  let mockRateLimit: jest.Mocked<RateLimitService>;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    first_name: 'John',
    status: 'active',
    hashed_password: 'hashed-password'
  };

  const mockClientInfo = {
    userAgent: 'Mozilla/5.0 Test',
    ipAddress: '192.168.1.1',
    fingerprint: 'test-fingerprint'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockEmail = new EmailService({} as any) as jest.Mocked<EmailService>;
    mockAudit = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;
    mockRateLimit = new RateLimitService({} as any) as jest.Mocked<RateLimitService>;

    passwordResetService = new PasswordResetService(
      mockDb,
      mockEmail,
      mockAudit,
      mockRateLimit
    );

    // Setup default mock implementations
    mockRateLimit.checkLimit = jest.fn().mockResolvedValue(undefined);
    mockAudit.logSecurityEvent = jest.fn().mockResolvedValue(undefined);
    mockEmail.sendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
    mockEmail.sendPasswordResetConfirmationEmail = jest.fn().mockResolvedValue(undefined);
  });

  describe('requestPasswordReset', () => {
    const validRequest: PasswordResetRequest = {
      email: 'user@example.com',
      clientInfo: mockClientInfo
    };

    it('should successfully process password reset request for valid user', async () => {
      // Setup mocks
      mockDb.findUserByEmail = jest.fn().mockResolvedValue(mockUser);
      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] }) // cleanup expired tokens
        .mockResolvedValueOnce({ rows: [] }) // get active tokens
        .mockResolvedValueOnce({ rowCount: 1 }); // store token

      const result = await passwordResetService.requestPasswordReset(validRequest);

      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account with that email exists');
      expect(mockEmail.sendPasswordResetEmail).toHaveBeenCalledWith({
        to: mockUser.email,
        firstName: mockUser.first_name,
        resetUrl: expect.stringContaining('token='),
        expiresAt: expect.any(Date),
        ipAddress: mockClientInfo.ipAddress,
        userAgent: mockClientInfo.userAgent
      });
      expect(mockAudit.logSecurityEvent).toHaveBeenCalledWith({
        type: 'PASSWORD_RESET_REQUESTED',
        userId: mockUser.id,
        email: mockUser.email,
        ipAddress: mockClientInfo.ipAddress,
        userAgent: mockClientInfo.userAgent,
        success: true,
        metadata: expect.any(Object)
      });
    });

    it('should return success response even for non-existent user (prevent email enumeration)', async () => {
      mockDb.findUserByEmail = jest.fn().mockResolvedValue(null);

      const result = await passwordResetService.requestPasswordReset(validRequest);

      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account with that email exists');
      expect(mockEmail.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(mockAudit.logSecurityEvent).toHaveBeenCalledWith({
        type: 'PASSWORD_RESET_INVALID_EMAIL',
        userId: undefined,
        email: validRequest.email,
        ipAddress: mockClientInfo.ipAddress,
        userAgent: mockClientInfo.userAgent,
        success: false,
        metadata: { reason: 'User not found' }
      });
    });

    it('should handle suspended account', async () => {
      const suspendedUser = { ...mockUser, status: 'suspended' };
      mockDb.findUserByEmail = jest.fn().mockResolvedValue(suspendedUser);

      const result = await passwordResetService.requestPasswordReset(validRequest);

      expect(result.success).toBe(true);
      expect(mockEmail.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(mockAudit.logSecurityEvent).toHaveBeenCalledWith({
        type: 'PASSWORD_RESET_BLOCKED_ACCOUNT',
        userId: suspendedUser.id,
        email: validRequest.email,
        ipAddress: mockClientInfo.ipAddress,
        userAgent: mockClientInfo.userAgent,
        success: false,
        metadata: { accountStatus: 'suspended' }
      });
    });

    it('should enforce rate limiting', async () => {
      mockRateLimit.checkLimit = jest.fn().mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(passwordResetService.requestPasswordReset(validRequest))
        .rejects.toThrow('Rate limit exceeded');

      expect(mockDb.findUserByEmail).not.toHaveBeenCalled();
    });

    it('should revoke oldest token when max tokens reached', async () => {
      const activeTokens = Array(5).fill(null).map((_, i) => ({
        token: `token-${i}`,
        created_at: new Date(Date.now() - i * 1000)
      }));

      mockDb.findUserByEmail = jest.fn().mockResolvedValue(mockUser);
      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] }) // cleanup expired tokens
        .mockResolvedValueOnce({ rows: activeTokens }) // get active tokens
        .mockResolvedValueOnce({ rowCount: 1 }) // revoke oldest token
        .mockResolvedValueOnce({ rowCount: 1 }); // store new token

      const result = await passwordResetService.requestPasswordReset(validRequest);

      expect(result.success).toBe(true);
      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE password_reset_tokens SET revoked_at = NOW() WHERE hashed_token = $1',
        ['mock-hash']
      );
    });

    it('should validate input data', async () => {
      const invalidRequest = {
        email: 'invalid-email',
        clientInfo: mockClientInfo
      };

      await expect(passwordResetService.requestPasswordReset(invalidRequest as any))
        .rejects.toThrow();
    });
  });

  describe('validatePasswordResetToken', () => {
    const validToken = 'valid-token';

    it('should validate a valid token', async () => {
      const tokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        used_at: null,
        revoked_at: null,
        created_at: new Date()
      };

      mockDb.query = jest.fn().mockResolvedValue({ rows: [tokenRecord] });
      mockDb.findUserById = jest.fn().mockResolvedValue(mockUser);

      const result = await passwordResetService.validatePasswordResetToken(validToken);

      expect(result.valid).toBe(true);
      expect(result.userId).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should reject invalid token', async () => {
      mockDb.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await passwordResetService.validatePasswordResetToken('invalid-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired reset token');
      expect(result.canRetry).toBe(false);
    });

    it('should reject expired token', async () => {
      const expiredTokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        used_at: null,
        revoked_at: null,
        created_at: new Date()
      };

      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [expiredTokenRecord] }) // get token
        .mockResolvedValueOnce({ rowCount: 1 }); // revoke token

      const result = await passwordResetService.validatePasswordResetToken(validToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Reset token has expired');
      expect(result.canRetry).toBe(true);
    });

    it('should reject used token', async () => {
      const usedTokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: new Date(),
        revoked_at: null,
        created_at: new Date()
      };

      mockDb.query = jest.fn().mockResolvedValue({ rows: [usedTokenRecord] });

      const result = await passwordResetService.validatePasswordResetToken(validToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid or expired reset token');
      expect(result.canRetry).toBe(false);
    });

    it('should reject token for inactive user', async () => {
      const tokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: null,
        revoked_at: null,
        created_at: new Date()
      };

      const inactiveUser = { ...mockUser, status: 'suspended' };

      mockDb.query = jest.fn().mockResolvedValue({ rows: [tokenRecord] });
      mockDb.findUserById = jest.fn().mockResolvedValue(inactiveUser);

      const result = await passwordResetService.validatePasswordResetToken(validToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Account is not available for password reset');
      expect(result.canRetry).toBe(false);
    });
  });

  describe('confirmPasswordReset', () => {
    const validConfirmation: PasswordResetConfirmation = {
      token: 'valid-token',
      newPassword: 'NewSecurePassword123!',
      confirmPassword: 'NewSecurePassword123!',
      clientInfo: mockClientInfo
    };

    beforeEach(() => {
      // Mock argon2 module
      jest.doMock('argon2', () => ({
        hash: jest.fn().mockResolvedValue('hashed-new-password'),
        argon2id: 'argon2id'
      }), { virtual: true });
    });

    it('should successfully confirm password reset', async () => {
      // Mock token validation
      const tokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: null,
        revoked_at: null,
        created_at: new Date()
      };

      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [tokenRecord] }) // validate token
        .mockResolvedValueOnce({ rows: [] }); // invalidate sessions

      mockDb.findUserById = jest.fn().mockResolvedValue(mockUser);
      mockDb.getClient = jest.fn().mockResolvedValue({
        query: jest.fn().mockResolvedValue({ rowCount: 1 }),
        release: jest.fn()
      });

      const result = await passwordResetService.confirmPasswordReset(validConfirmation);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Password has been reset successfully');
      expect(mockEmail.sendPasswordResetConfirmationEmail).toHaveBeenCalled();
      expect(mockAudit.logSecurityEvent).toHaveBeenCalledWith({
        type: 'PASSWORD_RESET_COMPLETED',
        userId: mockUser.id,
        email: mockUser.email,
        ipAddress: mockClientInfo.ipAddress,
        userAgent: mockClientInfo.userAgent,
        success: true,
        metadata: expect.objectContaining({
          sessionsInvalidated: true,
          passwordStrengthScore: expect.any(Number)

      });
    });

    it('should reject weak passwords', async () => {
      const weakConfirmation = {
        ...validConfirmation,
        newPassword: 'weak',
        confirmPassword: 'weak'
      };

      await expect(passwordResetService.confirmPasswordReset(weakConfirmation))
        .rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should reject mismatched passwords', async () => {
      const mismatchedConfirmation = {
        ...validConfirmation,
        confirmPassword: 'DifferentPassword123!'
      };

      await expect(passwordResetService.confirmPasswordReset(mismatchedConfirmation))
        .rejects.toThrow('Passwords don\'t match');
    });

    it('should reject common passwords', async () => {
      const commonPasswordConfirmation = {
        ...validConfirmation,
        newPassword: 'password123',
        confirmPassword: 'password123'
      };

      // Mock token validation
      const tokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: null,
        revoked_at: null,
        created_at: new Date()
      };

      mockDb.query = jest.fn().mockResolvedValueOnce({ rows: [tokenRecord] });
      mockDb.findUserById = jest.fn().mockResolvedValue(mockUser);

      await expect(passwordResetService.confirmPasswordReset(commonPasswordConfirmation))
        .rejects.toThrow('Password is too common');
    });

    it('should reject password containing user email', async () => {
      const emailPasswordConfirmation = {
        ...validConfirmation,
        newPassword: 'user@example.com123!',
        confirmPassword: 'user@example.com123!'
      };

      // Mock token validation
      const tokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: null,
        revoked_at: null,
        created_at: new Date()
      };

      mockDb.query = jest.fn().mockResolvedValueOnce({ rows: [tokenRecord] });
      mockDb.findUserById = jest.fn().mockResolvedValue(mockUser);

      await expect(passwordResetService.confirmPasswordReset(emailPasswordConfirmation))
        .rejects.toThrow('Password cannot contain your email address');
    });

    it('should enforce rate limiting for confirmation attempts', async () => {
      // Mock token validation
      const tokenRecord = {
        user_id: mockUser.id,
        hashed_token: 'mock-hash',
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
        used_at: null,
        revoked_at: null,
        created_at: new Date()
      };

      mockDb.query = jest.fn().mockResolvedValueOnce({ rows: [tokenRecord] });
      mockDb.findUserById = jest.fn().mockResolvedValue(mockUser);
      mockDb.getClient = jest.fn().mockResolvedValue({
        query: jest.fn(),
        release: jest.fn()
      });
      mockRateLimit.checkLimit = jest.fn()
        .mockRejectedValue(new Error('Rate limit exceeded')); // fail confirmation rate limit

      await expect(passwordResetService.confirmPasswordReset(validConfirmation))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should handle invalid token during confirmation', async () => {
      mockDb.query = jest.fn().mockResolvedValue({ rows: [] }); // no token found

      await expect(passwordResetService.confirmPasswordReset(validConfirmation))
        .rejects.toThrow('Invalid or expired reset token');

      expect(mockAudit.logSecurityEvent).toHaveBeenCalledWith({
        type: 'PASSWORD_RESET_INVALID_TOKEN',
        userId: undefined,
        email: undefined,
        ipAddress: mockClientInfo.ipAddress,
        userAgent: mockClientInfo.userAgent,
        success: false,
        metadata: { error: 'Invalid or expired reset token' }
      });
    });
  });

  describe('getPasswordResetAttempts', () => {
    it('should return password reset attempts for user', async () => {
      const mockAttempts = [
        {
          created_at: new Date(),
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          completed: true,
          revoked: false

        {
          created_at: new Date(Date.now() - 60 * 60 * 1000),
          ip_address: '192.168.1.2',
          user_agent: 'Chrome/90.0',
          completed: false,
          revoked: true

      ];

      mockDb.query = jest.fn().mockResolvedValue({ rows: mockAttempts });

      const result = await passwordResetService.getPasswordResetAttempts('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        timestamp: expect.any(Date),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        completed: true,
        revoked: false
      });
    });
  });

  describe('Security Features', () => {
    it('should hash tokens before storage', async () => {
      const mockCrypto = require('crypto');
      
      mockDb.findUserByEmail = jest.fn().mockResolvedValue(mockUser);
      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 1 });

      await passwordResetService.requestPasswordReset({
        email: 'user@example.com',
        clientInfo: mockClientInfo
      });

      expect(mockCrypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO password_reset_tokens'),
        expect.arrayContaining(['mock-hash'])
      );
    });

    it('should generate secure random tokens', async () => {
      const mockCrypto = require('crypto');
      
      mockDb.findUserByEmail = jest.fn().mockResolvedValue(mockUser);
      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 1 });

      await passwordResetService.requestPasswordReset({
        email: 'user@example.com',
        clientInfo: mockClientInfo
      });

      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32);
    });

    it('should clean up expired tokens', async () => {
      mockDb.findUserByEmail = jest.fn().mockResolvedValue(mockUser);
      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] }) // cleanup call
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 1 });

      await passwordResetService.requestPasswordReset({
        email: 'user@example.com',
        clientInfo: mockClientInfo
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM password_reset_tokens'),
        expect.arrayContaining([mockUser.id])
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockDb.findUserByEmail = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(passwordResetService.requestPasswordReset({
        email: 'user@example.com',
        clientInfo: mockClientInfo
      })).rejects.toThrow('Database error');

      expect(mockAudit.logSecurityEvent).toHaveBeenCalledWith({
        type: 'PASSWORD_RESET_ERROR',
        userId: undefined,
        email: 'user@example.com',
        ipAddress: mockClientInfo.ipAddress,
        userAgent: mockClientInfo.userAgent,
        success: false,
        metadata: { error: 'Database error' }
      });
    });

    it('should handle email service errors', async () => {
      mockDb.findUserByEmail = jest.fn().mockResolvedValue(mockUser);
      mockDb.query = jest.fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 1 });
      mockEmail.sendPasswordResetEmail = jest.fn().mockRejectedValue(new Error('Email service error'));

      await expect(passwordResetService.requestPasswordReset({
        email: 'user@example.com',
        clientInfo: mockClientInfo
      })).rejects.toThrow('Email service error');
    });
  });
});