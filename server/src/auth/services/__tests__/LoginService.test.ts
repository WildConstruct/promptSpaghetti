// Epic 11 Login Service Tests
// Comprehensive test suite for LoginService security measures and functionality

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { LoginService } from '../LoginService';
import { UserService } from '../UserService';
import { TokenService } from '../TokenService';
import { AuditService } from '../AuditService';
import { RateLimitService } from '../RateLimitService';
import { EmailService } from '../EmailService';
import { DatabaseService } from '../../database/DatabaseService';
import { RedisService } from '../../database/RedisService';
import { AuthConfig } from '../../types';
import { buildAuthConfig } from '../../config';

// Mock dependencies
const mockUserService = {
  getUserByEmail: jest.fn(),
  verifyPassword: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn()
 as jest.Mocked<UserService>;

const mockTokenService = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  refreshAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  revokeAllUserTokens: jest.fn()
 as jest.Mocked<TokenService>;

const mockAuditService = {
  logEvent: jest.fn()
 as jest.Mocked<AuditService>;

const mockRateLimitService = {
  checkIPRateLimit: jest.fn()
 as jest.Mocked<RateLimitService>;

const mockEmailService = {
  sendLoginAlert: jest.fn(),
  sendAccountUnlocked: jest.fn(),
  sendAccountUnlockRequest: jest.fn()
 as jest.Mocked<EmailService>;

const mockDatabaseService = {
  query: jest.fn()
 as jest.Mocked<DatabaseService>;

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn()
 as jest.Mocked<RedisService>;

const mockConfig: AuthConfig = buildAuthConfig({
  JWT_SECRET: 'test-secret',
  REDIS_URL: 'redis://localhost:6379',
  DATABASE_URL: 'postgresql://localhost:5432/test'
});

describe('LoginService', () => {
  let loginService: LoginService;
  
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    hashedPassword: 'hashed-password',
    displayName: 'Test User',
    status: 'active' as const,
    accountLocked: false,
    lockedUntil: undefined,
    failedLoginAttempts: 0,
    emailVerified: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };

  const mockLoginRequest = {
    email: 'test@example.com',
    password: 'password123',
    rememberMe: false
  };

  const mockContext = {
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    deviceFingerprint: 'device-fingerprint-123',
    geoLocation: {
      country: 'US',
      city: 'New York',
      timezone: 'America/New_York'

  };

  beforeEach(() => {
    loginService = new LoginService(
      mockConfig,
      mockUserService,
      mockTokenService,
      mockAuditService,
      mockRateLimitService,
      mockEmailService,
      mockDatabaseService,
      mockRedisService
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');
      mockDatabaseService.query.mockResolvedValue({ rows: [{ id: 'session-123' }] });
      mockRedisService.get.mockResolvedValue(null);

      // Act
      const result = await loginService.login(mockLoginRequest, mockContext);

      // Assert
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email
        }),
        expiresAt: expect.any(Date),
        sessionId: 'session-123'
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          action: 'login_success',
          severity: 'info'

      );
    });

    it('should reject login when rate limit is exceeded', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: false, remainingAttempts: 0 });

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow('Too many login attempts. Please try again later.');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'brute_force_attempt',
          severity: 'warning'
  }
      );
    });

    it('should reject login with invalid email', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow('Invalid email or password');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'login_failed',
          severity: 'warning'
  }
      );
    });

    it('should reject login with invalid password', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow('Invalid email or password');
    });

    it('should reject login for inactive account', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: 'inactive' as const };
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(inactiveUser);
      mockUserService.verifyPassword.mockResolvedValue(true);

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow('Account is not active. Please contact support.');
    });

    it('should reject login for locked account', async () => {
      // Arrange
      const lockedUser = {
        ...mockUser,
        accountLocked: true,
        lockedUntil: new Date(Date.now() + 3600000) // 1 hour from now
      };
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(lockedUser);
      mockUserService.verifyPassword.mockResolvedValue(true);

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow(/Account is locked until/);
    });

    it('should reject login for unverified email when required', async () => {
      // Arrange
      const unverifiedUser = { ...mockUser, emailVerified: false };
      const configWithEmailVerification = { ...mockConfig, security: { ...mockConfig.security, requireEmailVerification: true } };
      const loginServiceWithVerification = new LoginService(
        configWithEmailVerification,
        mockUserService,
        mockTokenService,
        mockAuditService,
        mockRateLimitService,
        mockEmailService,
        mockDatabaseService,
        mockRedisService
      );

      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(unverifiedUser);
      mockUserService.verifyPassword.mockResolvedValue(true);

      // Act & Assert
      await expect(loginServiceWithVerification.login(mockLoginRequest, mockContext))
        .rejects.toThrow('Please verify your email address before logging in.');
    });

    it('should send security alert for new device login', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');
      mockDatabaseService.query
        .mockResolvedValueOnce({ rows: [{ id: 'session-123' }] }) // Create session
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }); // New device check

      mockRedisService.get.mockResolvedValue(null);

      // Act
      await loginService.login(mockLoginRequest, mockContext);

      // Assert
      expect(mockEmailService.sendLoginAlert).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          displayName: mockUser.displayName,
          ipAddress: mockContext.ipAddress,
          userAgent: mockContext.userAgent
  }
      );

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          action: 'suspicious_login',
          details: expect.objectContaining({
            reason: 'new_device'

  }
      );
    });

    it('should detect rapid successive login attempts', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockRedisService.get.mockResolvedValue('15'); // More than 10 attempts

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow(); // Should fail during security checks

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'suspicious_activity_detected',
          details: expect.objectContaining({
            type: 'rapid_attempts'

  }
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Arrange
      const userId = 'user-123';
      const sessionId = 'session-123';

      // Act
      await loginService.logout(userId, sessionId, mockContext);

      // Assert
      expect(mockTokenService.revokeAllUserTokens).toHaveBeenCalledWith(userId);
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_sessions'),
        [sessionId]
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          action: 'logout',
          severity: 'info'
  }
      );
    });

    it('should handle logout errors gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      mockTokenService.revokeAllUserTokens.mockRejectedValue(new Error('Token revocation failed'));

      // Act & Assert - Should not throw
      await expect(loginService.logout(userId)).resolves.toBeUndefined();
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh access token', async () => {
      // Arrange
      const refreshToken = 'refresh-token';
      const newTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };
      const tokenPayload = { sub: 'user-123' };

      mockTokenService.refreshAccessToken.mockResolvedValue(newTokens);
      mockTokenService.verifyRefreshToken.mockResolvedValue(tokenPayload);

      // Act
      const result = await loginService.refreshSession(refreshToken, mockContext);

      // Assert
      expect(result).toEqual(newTokens);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: tokenPayload.sub,
          action: 'token_refreshed',
          severity: 'info'
  }
      );
    });

    it('should handle refresh token failure', async () => {
      // Arrange
      const refreshToken = 'invalid-token';
      mockTokenService.refreshAccessToken.mockRejectedValue(new Error('Invalid refresh token'));

      // Act & Assert
      await expect(loginService.refreshSession(refreshToken, mockContext))
        .rejects.toThrow();

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'token_refresh_failed',
          severity: 'warning'
  }
      );
    });
  });

  describe('unlockAccount', () => {
    it('should successfully unlock account with valid token', async () => {
      // Arrange
      const email = 'test@example.com';
      const unlockToken = `unlock_${mockUser.id}_${mockUser.email}`;

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);

      // Act
      await loginService.unlockAccount(email, unlockToken, mockContext);

      // Assert
      expect(mockUserService.updateUser).toHaveBeenCalledWith(mockUser.id, {
        accountLocked: false,
        lockedUntil: undefined,
        failedLoginAttempts: 0
      });

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          action: 'account_unlocked',
          severity: 'info'

      );

      expect(mockEmailService.sendAccountUnlocked).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          displayName: mockUser.displayName

      );
    });

    it('should reject unlock for non-existent user', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const unlockToken = 'invalid-token';

      mockUserService.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginService.unlockAccount(email, unlockToken, mockContext))
        .rejects.toThrow('Invalid unlock request');
    });

    it('should reject unlock with invalid token', async () => {
      // Arrange
      const email = 'test@example.com';
      const invalidToken = 'invalid-token';

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(loginService.unlockAccount(email, invalidToken, mockContext))
        .rejects.toThrow('Invalid or expired unlock token');
    });
  });

  describe('getLoginAnalytics', () => {
    it('should return comprehensive analytics data', async () => {
      // Arrange
      const mockAnalyticsData = {
        total_attempts: '100',
        successful_logins: '85',
        failed_attempts: '15'
      };

      const mockFailureReasons = [
        { reason: 'Invalid password', count: '10' },
        { reason: 'Account locked', count: '5' }
      ];

      const mockSuspiciousActivity = [
        { type: 'brute_force_attempt', count: '3', severity: 'high' }
      ];

      const mockDeviceAnalysis = [
        { new_devices: '20', returning_devices: '80', suspicious_devices: '2' }
      ];

      mockDatabaseService.query
        .mockResolvedValueOnce({ rows: [mockAnalyticsData] })
        .mockResolvedValueOnce({ rows: mockFailureReasons })
        .mockResolvedValueOnce({ rows: mockSuspiciousActivity })
        .mockResolvedValueOnce({ rows: mockDeviceAnalysis });

      // Act
      const result = await loginService.getLoginAnalytics('week');

      // Assert
      expect(result).toEqual({
        totalAttempts: 100,
        successfulLogins: 85,
        failedAttempts: 15,
        successRate: 0.85,
        topFailureReasons: [
          { reason: 'Invalid password', count: 10, percentage: 10 },
          { reason: 'Account locked', count: 5, percentage: 5 }
        ],
        suspiciousActivity: [
          {
            type: 'brute_force_attempt',
            description: 'Multiple failed login attempts detected',
            count: 3,
            severity: 'high'

        ],
        deviceAnalysis: {
          newDevices: 20,
          returningDevices: 80,
          suspiciousDevices: 2

      });
    });

    it('should handle analytics query errors', async () => {
      // Arrange
      mockDatabaseService.query.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(loginService.getLoginAnalytics('week'))
        .rejects.toThrow('Database error');
    });
  });

  describe('security checks', () => {
    it('should detect multiple email attempts from same IP', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockRedisService.get
        .mockResolvedValueOnce(null) // login attempts
        .mockResolvedValueOnce('10'); // email attempts (> 5)

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow(); // Should fail during security checks

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'suspicious_activity_detected',
          details: expect.objectContaining({
            type: 'multiple_emails'

  }
      );
    });

    it('should track login metrics for successful login', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');
      mockDatabaseService.query.mockResolvedValue({ rows: [{ id: 'session-123' }] });
      mockRedisService.get.mockResolvedValue(null);

      // Act
      await loginService.login(mockLoginRequest, mockContext);

      // Assert
      expect(mockRedisService.setex).toHaveBeenCalledWith(
        expect.stringMatching(/login_metrics:/),
        86400,
        expect.stringContaining('"success":1')
      );
    });

    it('should track login metrics for failed login', async () => {
      // Arrange
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(loginService.login(mockLoginRequest, mockContext))
        .rejects.toThrow();

      expect(mockRedisService.setex).toHaveBeenCalledWith(
        expect.stringMatching(/login_metrics:/),
        86400,
        expect.stringContaining('"failure":1')
      );
    });
  });

  describe('device detection', () => {
    it('should parse user agent correctly', async () => {
      // Arrange
      const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const contextWithChrome = { ...mockContext, userAgent: chromeUserAgent };

      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');
      mockDatabaseService.query.mockResolvedValue({ rows: [{ id: 'session-123' }] });
      mockRedisService.get.mockResolvedValue(null);

      // Act
      await loginService.login(mockLoginRequest, contextWithChrome);

      // Assert
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_sessions'),
        expect.arrayContaining([
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          chromeUserAgent,
          expect.stringContaining('"browser":"Chrome"'),
          expect.anything()
        ])
      );
    });

    it('should handle missing user agent gracefully', async () => {
      // Arrange
      const contextWithoutUserAgent = { ...mockContext, userAgent: undefined };

      mockRateLimitService.checkIPRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh-token');
      mockDatabaseService.query.mockResolvedValue({ rows: [{ id: 'session-123' }] });
      mockRedisService.get.mockResolvedValue(null);

      // Act & Assert - Should not throw
      await expect(loginService.login(mockLoginRequest, contextWithoutUserAgent))
        .resolves.toBeDefined();
    });
  });
});

describe('LoginService Integration Tests', () => {
  // These would be integration tests that test with real database/redis
  // For now, we'll skip them but they would be important for full testing
  
  it.skip('should perform end-to-end login flow with real dependencies', async () => {
    // Would test with real database and redis instances
  });

  it.skip('should handle concurrent login attempts correctly', async () => {
    // Would test race conditions and concurrent access
  });

  it.skip('should clean up expired sessions automatically', async () => {
    // Would test session cleanup mechanisms
  });
});