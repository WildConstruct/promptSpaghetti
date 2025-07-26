// Epic 11 Registration Service Tests
// Comprehensive test suite for registration functionality

import { RegistrationService } from '../services/RegistrationService';
import { UserService } from '../services/UserService';
import { EmailService } from '../services/EmailService';
import { AuditService } from '../services/AuditService';
import { RateLimitService } from '../services/RateLimitService';
import { DatabaseService } from '../database/DatabaseService';
import { buildAuthConfig } from '../config';

// Mock dependencies
jest.mock('../services/UserService');
jest.mock('../services/EmailService');
jest.mock('../services/AuditService');
jest.mock('../services/RateLimitService');
jest.mock('../database/DatabaseService');

describe('RegistrationService', () => {
  let registrationService: RegistrationService;
  let mockUserService: jest.Mocked<UserService>;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockRateLimitService: jest.Mocked<RateLimitService>;
  let mockDbService: jest.Mocked<DatabaseService>;
  let config: unknown;

  beforeEach(() => {
    config = buildAuthConfig();
    
    mockUserService = new UserService(config, {} as any, {} as any) as jest.Mocked<UserService>;
    mockEmailService = new EmailService(config) as jest.Mocked<EmailService>;
    mockAuditService = new AuditService(config, {} as any) as jest.Mocked<AuditService>;
    mockRateLimitService = new RateLimitService({} as any) as jest.Mocked<RateLimitService>;
    mockDbService = new DatabaseService(config) as jest.Mocked<DatabaseService>;

    registrationService = new RegistrationService(
      config,
      mockUserService,
      mockEmailService,
      mockAuditService,
      mockRateLimitService,
      mockDbService
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const validRegistrationRequest = {
      email: 'test@example.com',
      password: 'SecurePassword123!',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe'
    };

    const validContext = {
      ipAddress: '127.0.0.1',
      userAgent: 'Test Browser',
      source: 'organic'
    };

    it('should register a user successfully', async () => {
      // Setup mocks
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: new Date( as unknown),
        totalRequests: 1
      });

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        emailVerificationToken: 'verification-token',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as const,
        hashedPassword: 'hashed-password',
        lastLoginAt: null,
        failedLoginAttempts: 0,
        accountLocked: false,
        deletedAt: null,
        lockedUntil: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      mockUserService.createUser.mockResolvedValue(mockUser as unknown as unknown);
      mockEmailService.sendEmailVerification.mockResolvedValue();
      mockAuditService.logEvent.mockResolvedValue();
      mockDbService.query.mockResolvedValue(
        { rows: [],
        command: '',
        rowCount: 0,
        oid: 0,
        fields: [] } as any as unknown
       as unknown);

      // Mock the trackRegistrationEvent method
      jest.spyOn(registrationService as any, 'trackRegistrationEvent').mockResolvedValue(undefined as unknown as unknown);
      jest.spyOn(registrationService as any, 'toPublicUser').mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt,
        roles: ['user'],
        permissions: ['graphs:create:own']
      } as unknown as unknown);

      // Execute
      const result = await registrationService.registerUser(validRegistrationRequest, validContext);

      // Verify
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          emailVerified: false,
          createdAt: mockUser.createdAt,
          roles: ['user'],
          permissions: ['graphs:create:own']
        },
        emailVerificationRequired: true,
        nextSteps: expect.any(Array)
      });

      expect(mockRateLimitService.checkIPRateLimit).toHaveBeenCalledWith(
        '127.0.0.1',
        'register',
        expect.any(Object)
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith(validRegistrationRequest);
      expect(mockEmailService.sendEmailVerification).toHaveBeenCalled();
    });

    it('should reject registration when rate limited', async () => {
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: new Date( as unknown),
        totalRequests: 6
      });

      mockAuditService.logEvent.mockResolvedValue();
      jest.spyOn(registrationService as any, 'trackRegistrationEvent').mockResolvedValue(undefined as unknown as unknown);

      await expect(
        registrationService.registerUser(validRegistrationRequest, validContext)
      ).rejects.toThrow('Registration rate limit exceeded');

      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });

    it('should handle invitation flow correctly', async () => {
      const requestWithInvitation = {
        ...validRegistrationRequest,
        invitationToken: 'invitation-token-123'
      };

      const mockInvitation = {
        id: 'invitation-123',
        email: 'test@example.com',
        token: 'invitation-token-123',
        roleId: 'role-123',
        organizationId: 'org-123',
        teamId: 'team-123',
        invitedBy: 'user-456',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        acceptedAt: null,
        acceptedBy: null,
        createdAt: new Date(),
        metadata: {}
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        emailVerificationToken: 'verification-token',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as const,
        hashedPassword: 'hashed-password',
        lastLoginAt: null,
        failedLoginAttempts: 0,
        accountLocked: false,
        deletedAt: null,
        lockedUntil: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      // Setup mocks
      mockRateLimitService.checkIPRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: new Date( as unknown),
        totalRequests: 1
      });

      // Mock validateInvitation
      mockDbService.query
        .mockResolvedValueOnce(
          { rows: [mockInvitation],
          command: '',
          rowCount: 1,
          oid: 0,
          fields: [] } as any
        ) // validateInvitation
        .mockResolvedValueOnce(
          { rows: [],
          command: '',
          rowCount: 0,
          oid: 0,
          fields: [] } as any
        ) // acceptInvitation transaction
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] } as any) // other queries
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] } as any);

      mockDbService.transaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn<unknown[], unknown>().mockResolvedValue({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] } as any as unknown as unknown)
        };
        return callback(mockClient as any);
      });

      mockUserService.createUser.mockResolvedValue(mockUser as unknown as unknown);
      mockEmailService.sendEmailVerification.mockResolvedValue();
      mockAuditService.logEvent.mockResolvedValue();

      jest.spyOn(registrationService as any, 'trackRegistrationEvent').mockResolvedValue(undefined as unknown as unknown);
      jest.spyOn(registrationService as any, 'toPublicUser').mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt,
        roles: ['user'],
        permissions: ['graphs:create:own']
      } as unknown as unknown);

      // Execute
      const result = await registrationService.registerUser(requestWithInvitation, validContext);

      // Verify
      expect((result as any).nextSteps).toContain('Complete your organization profile');
      expect(mockDbService.transaction).toHaveBeenCalled();
    });

    it('should handle email validation errors', async () => {
      const invalidEmailRequest = {
        ...validRegistrationRequest,
        email: 'invalid-email'
      };

      mockRateLimitService.checkIPRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: new Date( as unknown),
        totalRequests: 1
      });

      jest.spyOn(registrationService as any, 'trackRegistrationEvent').mockResolvedValue(undefined as unknown as unknown);

      // Mock validateRegistration to return email error
      jest.spyOn(registrationService, 'validateRegistration').mockResolvedValue({
        isValid: false,
        errors: [{
          field: 'email',
          message: 'Please enter a valid email address',
          code: 'INVALID_FORMAT'
        }],
        warnings: [],
        suggestions: []
      } as unknown as unknown);

      await expect(
        registrationService.registerUser(invalidEmailRequest, validContext)
      ).rejects.toThrow('Registration validation failed');
    });
  });

  describe('validateRegistration', () => {
    it('should validate email format correctly', async () => {
      const invalidRequest = {
        email: 'invalid-email',
        password: 'SecurePassword123!'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null as unknown as unknown);

      const result = await registrationService.validateRegistration(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'email',
        message: 'Please enter a valid email address',
        code: 'INVALID_FORMAT'
      });
    });

    it('should detect existing email addresses', async () => {
      const existingUserRequest = {
        email: 'existing@example.com',
        password: 'SecurePassword123!'
      };

      const existingUser = {
        id: 'existing-user',
        email: 'existing@example.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as const,
        hashedPassword: 'hashed-password',
        lastLoginAt: null,
        failedLoginAttempts: 0,
        accountLocked: false,
        deletedAt: null,
        lockedUntil: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerificationToken: null,
        emailVerificationExpires: null
      };

      mockUserService.getUserByEmail.mockResolvedValue(existingUser as unknown as unknown);

      const result = await registrationService.validateRegistration(existingUserRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'email',
        message: 'An account with this email address already exists',
        code: 'EMAIL_EXISTS'
      });
      expect(result.suggestions).toContainEqual({
        field: 'email',
        suggestion: 'Try logging in instead, or use the forgot password feature'
      });
    });

    it('should validate password strength', async () => {
      const weakPasswordRequest = {
        email: 'test@example.com',
        password: 'weak'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null as unknown as unknown);

      const result = await registrationService.validateRegistration(weakPasswordRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.field === 'password')).toBe(true);
    });

    it('should provide email suggestions for typos', async () => {
      const typoRequest = {
        email: 'test@gmial.com', // typo in gmail
        password: 'SecurePassword123!'
      };

      mockUserService.getUserByEmail.mockResolvedValue(null as unknown as unknown);

      const result = await registrationService.validateRegistration(typoRequest);

      expect(result.suggestions.some(s => s.field === 'email')).toBe(true);
    });
  });

  describe('resendEmailVerification', () => {
    it('should resend verification email successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
        emailVerificationToken: 'verification-token',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as const,
        hashedPassword: 'hashed-password',
        lastLoginAt: null,
        failedLoginAttempts: 0,
        accountLocked: false,
        deletedAt: null,
        lockedUntil: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      mockRateLimitService.checkIPRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: new Date( as unknown),
        totalRequests: 1
      });

      mockUserService.getUserByEmail.mockResolvedValue(mockUser as unknown as unknown);
      mockEmailService.sendEmailVerification.mockResolvedValue();
      mockAuditService.logEvent.mockResolvedValue();
      jest.spyOn(registrationService as any, 'sendEmailVerification').mockResolvedValue(undefined as unknown as unknown);
      jest.spyOn(registrationService as any, 'trackRegistrationEvent').mockResolvedValue(undefined as unknown as unknown);

      await registrationService.resendEmailVerification('test@example.com', {
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser'
      });

      expect(mockRateLimitService.checkIPRateLimit).toHaveBeenCalled();
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should reject resend when already verified', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true, // Already verified
        emailVerificationToken: 'verification-token',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as const,
        hashedPassword: 'hashed-password',
        lastLoginAt: null,
        failedLoginAttempts: 0,
        accountLocked: false,
        deletedAt: null,
        lockedUntil: null,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      mockRateLimitService.checkIPRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: new Date( as unknown),
        totalRequests: 1
      });

      mockUserService.getUserByEmail.mockResolvedValue(mockUser as unknown as unknown);

      await expect(
        registrationService.resendEmailVerification('test@example.com', {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser'
        })
      ).rejects.toThrow('Email is already verified');
    });
  });

  describe('getRegistrationAnalytics', () => {
    it('should return comprehensive analytics', async () => {
      // Mock database queries for analytics
      mockDbService.query
        .mockResolvedValueOnce(
          { rows: [{ total: '100' }],
          command: '',
          rowCount: 1,
          oid: 0,
          fields: [] } as any
        ) // Total registrations
        .mockResolvedValueOnce(
          { rows: [{ count: '15' }],
          command: '',
          rowCount: 1,
          oid: 0,
          fields: [] } as any
        ) // Recent registrations
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] } as any) // Daily registrations
        .mockResolvedValueOnce(
          { rows: [],
          command: '',
          rowCount: 0,
          oid: 0,
          fields: [] } as any
        ) // Registration sources
        .mockResolvedValueOnce(
          { rows: [{ started: '50',
          email_verified: '40',
          profile_completed: '35',
          first_login: '30' }],
          command: '',
          rowCount: 1,
          oid: 0,
          fields: [] } as any
        ) // Funnel
        .mockResolvedValueOnce({ rows: [], command: '', rowCount: 0, oid: 0, fields: [] } as any); // Drop-off

      const analytics = await registrationService.getRegistrationAnalytics('week');

      expect(analytics).toHaveProperty('totalRegistrations', 100);
      expect(analytics).toHaveProperty('weeklyRegistrations', 15);
      expect(analytics).toHaveProperty('conversionFunnel');
      expect(analytics.conversionFunnel).toHaveProperty('started', 50);
    });
  });
});

// Helper function to create mock user
function createMockUser(overrides: unknown = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    emailVerified: false,
    hashedPassword: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    failedLoginAttempts: 0,
    accountLocked: false,
    lockedUntil: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    emailVerificationToken: 'verification-token',
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'active' as const,
    deletedAt: null,
    ...overrides
  };
}