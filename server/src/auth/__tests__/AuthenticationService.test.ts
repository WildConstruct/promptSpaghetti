// Epic 11 Authentication Service Tests
// Comprehensive test suite for authentication functionality

import { AuthenticationService } from '../AuthenticationService';
import { buildAuthConfig } from '../config';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing-very-long-and-secure';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test_promptscape';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.REDIS_HOST = 'localhost';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let config: any;

  beforeAll(async () => {
    config = buildAuthConfig();
    authService = new AuthenticationService(config);
    
    // Mock database and Redis connections for testing
    jest.spyOn(authService, 'initialize').mockResolvedValue();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('Registration', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        createdAt: new Date(),
        lastLoginAt: undefined,
        failedLoginAttempts: 0,
        accountLocked: false,
        status: 'active' as const,
      };

      // Mock user service methods
      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        createUser: jest.fn().mockResolvedValue(mockUser),
      });

      jest.spyOn(authService as any, 'rateLimitService', 'get').mockReturnValue({
        checkIPRateLimit: jest.fn().mockResolvedValue({
          allowed: true,
          remaining: 4,
          resetTime: new Date(),
          totalRequests: 1,
        }),
      });

      jest.spyOn(authService as any, 'auditService', 'get').mockReturnValue({
        logEvent: jest.fn().mockResolvedValue(undefined),
      });

      const request = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        displayName: 'Test User',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock toPublicUser method
      jest.spyOn(authService as any, 'toPublicUser').mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt,
        roles: [],
        permissions: [],
      });

      const result = await authService.register(request, context);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('emailVerificationRequired', true);
      expect(result.user.email).toBe('test@example.com');
    });

    it('should reject registration with weak password', async () => {
      const request = {
        email: 'test@example.com',
        password: 'weak',
        displayName: 'Test User',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock rate limiting to pass
      jest.spyOn(authService as any, 'rateLimitService', 'get').mockReturnValue({
        checkIPRateLimit: jest.fn().mockResolvedValue({
          allowed: true,
          remaining: 4,
          resetTime: new Date(),
          totalRequests: 1,
        }),
      });

      // Mock user service to throw password validation error
      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        createUser: jest.fn().mockRejectedValue(new Error('Password must be at least 12 characters long')),
      });

      await expect(authService.register(request, context))
        .rejects.toThrow('Password must be at least 12 characters long');
    });

    it('should reject registration when rate limited', async () => {
      const request = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        displayName: 'Test User',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock rate limiting to fail
      jest.spyOn(authService as any, 'rateLimitService', 'get').mockReturnValue({
        checkIPRateLimit: jest.fn().mockResolvedValue({
          allowed: false,
          remaining: 0,
          resetTime: new Date(),
          totalRequests: 6,
        }),
      });

      jest.spyOn(authService as any, 'auditService', 'get').mockReturnValue({
        logEvent: jest.fn().mockResolvedValue(undefined),
      });

      await expect(authService.register(request, context))
        .rejects.toThrow('Rate limit exceeded. Please try again later.');
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        hashedPassword: 'hashed-password',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        accountLocked: false,
        status: 'active' as const,
      };

      const request = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock services
      jest.spyOn(authService as any, 'rateLimitService', 'get').mockReturnValue({
        checkIPRateLimit: jest.fn().mockResolvedValue({
          allowed: true,
          remaining: 4,
          resetTime: new Date(),
          totalRequests: 1,
        }),
      });

      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        getUserByEmail: jest.fn().mockResolvedValue(mockUser),
        verifyPassword: jest.fn().mockResolvedValue(true),
        updateUser: jest.fn().mockResolvedValue(mockUser),
      });

      jest.spyOn(authService as any, 'tokenService', 'get').mockReturnValue({
        generateAccessToken: jest.fn().mockResolvedValue('access-token'),
        generateRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
      });

      jest.spyOn(authService as any, 'auditService', 'get').mockReturnValue({
        logEvent: jest.fn().mockResolvedValue(undefined),
      });

      jest.spyOn(authService as any, 'createSession').mockResolvedValue('session-123');
      jest.spyOn(authService as any, 'toPublicUser').mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt,
        roles: [],
        permissions: [],
      });

      const result = await authService.login(request, context);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('expiresAt');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should reject login with invalid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        hashedPassword: 'hashed-password',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        accountLocked: false,
        status: 'active' as const,
      };

      const request = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock services
      jest.spyOn(authService as any, 'rateLimitService', 'get').mockReturnValue({
        checkIPRateLimit: jest.fn().mockResolvedValue({
          allowed: true,
          remaining: 4,
          resetTime: new Date(),
          totalRequests: 1,
        }),
      });

      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        getUserByEmail: jest.fn().mockResolvedValue(mockUser),
        verifyPassword: jest.fn().mockResolvedValue(false),
      });

      jest.spyOn(authService as any, 'auditService', 'get').mockReturnValue({
        logEvent: jest.fn().mockResolvedValue(undefined),
      });

      await expect(authService.login(request, context))
        .rejects.toThrow('Invalid email or password');
    });

    it('should reject login for locked account', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        hashedPassword: 'hashed-password',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        failedLoginAttempts: 5,
        accountLocked: true,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        status: 'active' as const,
      };

      const request = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock services
      jest.spyOn(authService as any, 'rateLimitService', 'get').mockReturnValue({
        checkIPRateLimit: jest.fn().mockResolvedValue({
          allowed: true,
          remaining: 4,
          resetTime: new Date(),
          totalRequests: 1,
        }),
      });

      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        getUserByEmail: jest.fn().mockResolvedValue(mockUser),
      });

      jest.spyOn(authService as any, 'auditService', 'get').mockReturnValue({
        logEvent: jest.fn().mockResolvedValue(undefined),
      });

      await expect(authService.login(request, context))
        .rejects.toThrow('Account is locked. Please try again later or reset your password.');
    });
  });

  describe('Token Validation', () => {
    it('should validate a valid JWT token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date(),
        roles: [],
        permissions: [],
      };

      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        roles: [],
        permissions: [],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
        iss: 'promptscape-auth',
        aud: 'promptscape-api',
      };

      // Mock token service
      jest.spyOn(authService as any, 'tokenService', 'get').mockReturnValue({
        verifyAccessToken: jest.fn().mockResolvedValue(mockPayload),
      });

      // Mock user service
      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        getUserById: jest.fn().mockResolvedValue({
          id: 'user-123',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          status: 'active',
        }),
      });

      jest.spyOn(authService as any, 'toPublicUser').mockResolvedValue(mockUser);

      const result = await authService.validateToken('valid-jwt-token');

      expect(result).toEqual(mockUser);
    });

    it('should reject an invalid JWT token', async () => {
      // Mock token service to throw error
      jest.spyOn(authService as any, 'tokenService', 'get').mockReturnValue({
        verifyAccessToken: jest.fn().mockRejectedValue(new Error('Invalid token')),
      });

      await expect(authService.validateToken('invalid-jwt-token'))
        .rejects.toThrow('Invalid token');
    });
  });

  describe('Password Reset', () => {
    it('should initiate password reset for valid email', async () => {
      const request = {
        email: 'test@example.com',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock services
      jest.spyOn(authService as any, 'rateLimitService', 'get').mockReturnValue({
        checkIPRateLimit: jest.fn().mockResolvedValue({
          allowed: true,
          remaining: 2,
          resetTime: new Date(),
          totalRequests: 1,
        }),
      });

      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        requestPasswordReset: jest.fn().mockResolvedValue('reset-token-123'),
      });

      jest.spyOn(authService as any, 'auditService', 'get').mockReturnValue({
        logEvent: jest.fn().mockResolvedValue(undefined),
      });

      // Should not throw any error
      await expect(authService.requestPasswordReset(request, context))
        .resolves.not.toThrow();
    });

    it('should complete password reset with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date(),
        status: 'active' as const,
      };

      const request = {
        token: 'valid-reset-token',
        newPassword: 'NewSecurePassword123!',
      };

      const context = {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      };

      // Mock services
      jest.spyOn(authService as any, 'userService', 'get').mockReturnValue({
        resetPassword: jest.fn().mockResolvedValue(mockUser),
      });

      jest.spyOn(authService as any, 'tokenService', 'get').mockReturnValue({
        revokeAllUserTokens: jest.fn().mockResolvedValue(undefined),
      });

      jest.spyOn(authService as any, 'auditService', 'get').mockReturnValue({
        logEvent: jest.fn().mockResolvedValue(undefined),
      });

      // Should not throw any error
      await expect(authService.resetPassword(request, context))
        .resolves.not.toThrow();
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when all services are healthy', async () => {
      // Mock database service
      jest.spyOn(authService as any, 'dbService', 'get').mockReturnValue({
        healthCheck: jest.fn().mockResolvedValue(true),
      });

      // Mock Redis service
      jest.spyOn(authService as any, 'redisService', 'get').mockReturnValue({
        healthCheck: jest.fn().mockResolvedValue(true),
      });

      const result = await authService.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.checks.database).toBe(true);
      expect(result.checks.redis).toBe(true);
    });

    it('should return unhealthy status when database is down', async () => {
      // Mock database service
      jest.spyOn(authService as any, 'dbService', 'get').mockReturnValue({
        healthCheck: jest.fn().mockResolvedValue(false),
      });

      // Mock Redis service
      jest.spyOn(authService as any, 'redisService', 'get').mockReturnValue({
        healthCheck: jest.fn().mockResolvedValue(true),
      });

      const result = await authService.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.checks.database).toBe(false);
      expect(result.checks.redis).toBe(true);
    });
  });
});

// Mock crypto.randomUUID for consistent testing
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => 'test-uuid-123'),
}));