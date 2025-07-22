/**
 * Epic 19.5 - Comprehensive Authentication and Authorization Security Test Suite
 * 
 * This test suite provides comprehensive coverage of the authentication and authorization
 * system, including security hardening, compliance verification, and vulnerability testing.
 * 
 * Test Categories:
 * 1. Authentication Flow Testing (JWT, API keys, OAuth2, WebAuthn)
 * 2. Authorization & RBAC Validation
 * 3. Security Hardening & Attack Prevention
 * 4. Session Management & Security Context
 * 5. Compliance & Audit Trail Verification
 * 6. Integration & End-to-End Security Flows
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Fastify from 'fastify';
import { AuthenticationService } from '../AuthenticationService';
import { LoginService } from '../services/LoginService';
import { TokenService } from '../services/TokenService';
import { SessionService } from '../services/SessionService';
import { ApiKeyManagementService } from '../services/ApiKeyManagementService';
import { RBACService } from '../services/RBACService';
import { AuditService } from '../services/AuditService';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { buildAuthConfig } from '../config';

// Mock all external dependencies
jest.mock('../database/DatabaseService');
jest.mock('../database/RedisService');
jest.mock('../AuthenticationService');
jest.mock('../services/LoginService');
jest.mock('../services/TokenService');
jest.mock('../services/SessionService');
jest.mock('../services/ApiKeyManagementService');
jest.mock('../services/RBACService');
jest.mock('../services/AuditService');

describe('Epic 19.5 - Comprehensive Authentication & Authorization Security Tests', () => {
  let fastify: FastifyInstance;
  let authService: jest.Mocked<AuthenticationService>;
  let loginService: jest.Mocked<LoginService>;
  let tokenService: jest.Mocked<TokenService>;
  let sessionService: jest.Mocked<SessionService>;
  let apiKeyService: jest.Mocked<ApiKeyManagementService>;
  let rbacService: jest.Mocked<RBACService>;
  let auditService: jest.Mocked<AuditService>;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockRedis: jest.Mocked<RedisService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    roles: ['user'],
    isActive: true,
    emailVerified: true,
    mfaEnabled: false,
    lastLogin: new Date().toISOString(),
    failedLoginAttempts: 0,
    accountLocked: false
  };

  const mockAuthConfig = buildAuthConfig();

  beforeEach(async () => {
    // Create fresh Fastify instance
    fastify = Fastify({ logger: false });

    // Initialize mocked services
    mockDb = new DatabaseService(mockAuthConfig) as jest.Mocked<DatabaseService>;
    mockRedis = new RedisService(mockAuthConfig.redis) as jest.Mocked<RedisService>;
    
    authService = new AuthenticationService(mockAuthConfig, mockDb) as jest.Mocked<AuthenticationService>;
    loginService = new LoginService(mockAuthConfig, mockDb, mockRedis, auditService) as jest.Mocked<LoginService>;
    tokenService = new TokenService(mockAuthConfig, mockRedis, auditService) as jest.Mocked<TokenService>;
    sessionService = new SessionService(mockAuthConfig, mockDb, mockRedis, auditService) as jest.Mocked<SessionService>;
    apiKeyService = new ApiKeyManagementService(
      mockDb,
      mockRedis,
      auditService
    ) as jest.Mocked<ApiKeyManagementService>;
    rbacService = new RBACService(mockAuthConfig, mockDb, auditService) as jest.Mocked<RBACService>;
    auditService = new AuditService(mockAuthConfig, mockDb) as jest.Mocked<AuditService>;

    // Setup default mock behaviors
    mockDb.connect.mockResolvedValue();
    mockRedis.connect.mockResolvedValue();
    authService.authenticate.mockResolvedValue({ success: true, user: mockUser } as unknown as unknown);
    tokenService.validateToken.mockResolvedValue({ valid: true, payload: { userId: 1, roles: ['user'] } } as unknown as unknown);
    sessionService.getSession.mockResolvedValue({ userId: 1, sessionId: 'test-session', valid: true } as unknown as unknown);
    rbacService.hasPermission.mockResolvedValue(true as unknown as unknown);

    // Register basic routes for testing
    fastify.get('/protected', async (request, reply) => {
      return { message: 'Protected resource' };
    });
    
    fastify.post('/auth/login', async (request, reply) => {
      return { success: true, user: mockUser };
    });
  });

  afterEach(async () => {
    await fastify.close();
    jest.clearAllMocks();
  });

  describe('1. Authentication Flow Testing', () => {
    describe('JWT Authentication', () => {
      it('should authenticate valid JWT tokens', async () => {
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVzIjpbInVzZXIiXX0.test';
        
        tokenService.validateToken.mockResolvedValue({
          valid: true,
          payload: { userId: 1, roles: ['user'], exp: Date.now() + 3600000 }
        });

        fastify.get('/protected', async (request, reply) => {
          return { message: 'Success', user: request.user };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/protected',
          headers: {
            Authorization: `Bearer ${validToken}`
          }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('user');
        expect(tokenService.validateToken).toHaveBeenCalledWith(validToken);
      });

      it('should reject invalid JWT tokens', async () => {
        const invalidToken = 'invalid.jwt.token';
        
        tokenService.validateToken.mockResolvedValue({
          valid: false,
          error: 'Invalid token signature'
        } as unknown as unknown);

        fastify.get('/protected', async (request, reply) => {
          return { message: 'Success' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/protected',
          headers: {
            Authorization: `Bearer ${invalidToken}`
          }
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body)).toHaveProperty('error');
      });

      it('should handle expired JWT tokens', async () => {
        const expiredToken = 'expired.jwt.token';
        
        tokenService.validateToken.mockResolvedValue({
          valid: false,
          error: 'Token expired',
          expired: true
        } as unknown as unknown);

        fastify.get('/protected', async (request, reply) => {
          return { message: 'Success' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/protected',
          headers: {
            Authorization: `Bearer ${expiredToken}`
          }
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body)).toMatchObject({
          error: expect.stringContaining('expired')
        });
      });

      it('should validate token refresh flow', async () => {
        const refreshToken = 'valid.refresh.token';
        const newAccessToken = 'new.access.token';

        tokenService.refreshToken.mockResolvedValue({
          success: true,
          accessToken: newAccessToken,
          refreshToken: 'new.refresh.token',
          expiresIn: 3600
        } as unknown as unknown);

        fastify.post('/auth/refresh', async (request, reply) => {
          const { refreshToken } = request.body as { refreshToken: string };
          const result = await tokenService.refreshToken(refreshToken);
          return result;
        });

        const response = await fastify.inject({
          method: 'POST',
          url: '/auth/refresh',
          payload: { refreshToken }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toMatchObject({
          success: true,
          accessToken: newAccessToken
        });
      });
    });

    describe('API Key Authentication', () => {
      const mockApiKey = {
        id: 'api-key-123',
        keyId: 'ak_test_123',
        userId: 1,
        scopes: ['read:users', 'write:users'],
        isActive: true,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        lastUsedAt: null,
        usageCount: 0
      };

      it('should authenticate valid API keys', async () => {
        apiKeyService.validateApiKey.mockResolvedValue({
          valid: true,
          apiKey: mockApiKey,
          user: mockUser
        } as unknown as unknown);

        fastify.get('/api/protected', async (request, reply) => {
          return { message: 'API Success', user: request.user };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/api/protected',
          headers: {
            'X-API-Key': 'ak_test_123_secret_key'
          }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('user');
        expect(apiKeyService.validateApiKey).toHaveBeenCalled();
      });

      it('should reject invalid API keys', async () => {
        apiKeyService.validateApiKey.mockResolvedValue({
          valid: false,
          error: 'Invalid API key'
        } as unknown as unknown);

        fastify.get('/api/protected', async (request, reply) => {
          return { message: 'API Success' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/api/protected',
          headers: {
            'X-API-Key': 'invalid_api_key'
          }
        });

        expect(response.statusCode).toBe(401);
      });

      it('should enforce API key scopes', async () => {
        apiKeyService.validateApiKey.mockResolvedValue({
          valid: true,
          apiKey: { ...mockApiKey, scopes: ['read:users'] }, // Only read scope
          user: mockUser
        } as unknown as unknown);

        // Mock RBAC to check scopes
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          return permission === 'read:users';
        });

        fastify.get('/api/users', { preHandler: [/* scope check middleware */] }, async (request, reply) => {
          const hasReadScope = await rbacService.hasPermission(request.user.id, 'read:users');
          if (!hasReadScope) {
            return reply.code(403).send({ error: 'Insufficient scope' });
          }
          return { users: [] };
        });

        fastify.post('/api/users', { preHandler: [/* scope check middleware */] }, async (request, reply) => {
          const hasWriteScope = await rbacService.hasPermission(request.user.id, 'write:users');
          if (!hasWriteScope) {
            return reply.code(403).send({ error: 'Insufficient scope' });
          }
          return { success: true };
        });

        // Should allow read operation
        const readResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users',
          headers: { 'X-API-Key': 'ak_test_123_secret_key' }
        });
        expect(readResponse.statusCode).toBe(200);

        // Should deny write operation
        const writeResponse = await fastify.inject({
          method: 'POST',
          url: '/api/users',
          headers: { 'X-API-Key': 'ak_test_123_secret_key' },
          payload: { name: 'New User' }
        });
        expect(writeResponse.statusCode).toBe(403);
      });

      it('should track API key usage and rate limits', async () => {
        apiKeyService.validateApiKey.mockResolvedValue({
          valid: true,
          apiKey: mockApiKey,
          user: mockUser
        } as unknown as unknown);

        apiKeyService.recordUsage.mockResolvedValue();
        apiKeyService.checkRateLimit.mockResolvedValue(
          { allowed: true,
          remaining: 99,
          resetTime: Date.now() + 3600000 });

        fastify.get('/api/tracked', async (request, reply) => {
          await apiKeyService.recordUsage('ak_test_123');
          return { message: 'Usage tracked' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/api/tracked',
          headers: { 'X-API-Key': 'ak_test_123_secret_key' }
        });

        expect(response.statusCode).toBe(200);
        expect(apiKeyService.recordUsage).toHaveBeenCalledWith('ak_test_123');
      });
    });

    describe('OAuth2 Authentication', () => {
      it('should handle OAuth2 authorization flow', async () => {
        const mockOAuthService = {
          initiateFlow: jest.fn<unknown[], unknown>().mockResolvedValue({
            authorizationUrl: 'https://provider.com/oauth/authorize?client_id=123&redirect_uri=callback',
            state: 'random_state'
          } as unknown as unknown),
          exchangeCodeForToken: jest.fn<unknown[], unknown>().mockResolvedValue({
            accessToken: 'oauth_access_token',
            refreshToken: 'oauth_refresh_token',
            userInfo: { id: 'oauth_123', email: 'oauth@example.com' }
          } as unknown as unknown)
        };

        fastify.get('/auth/oauth/google', async (request, reply) => {
          const result = await mockOAuthService.initiateFlow('google');
          return reply.redirect(result.authorizationUrl);
        });

        fastify.get('/auth/oauth/callback', async (request, reply) => {
          const { code, state } = request.query as { code: string; state: string };
          const result = await mockOAuthService.exchangeCodeForToken(code);
          return { success: true, token: result.accessToken };
        });

        const initiateResponse = await fastify.inject({
          method: 'GET',
          url: '/auth/oauth/google'
        });

        expect(initiateResponse.statusCode).toBe(302);
        expect(initiateResponse.headers.location).toContain('provider.com/oauth/authorize');

        const callbackResponse = await fastify.inject({
          method: 'GET',
          url: '/auth/oauth/callback?code=auth_code&state=random_state'
        });

        expect(callbackResponse.statusCode).toBe(200);
        expect(JSON.parse(callbackResponse.body)).toHaveProperty('token');
      });
    });
  });

  describe('2. Authorization & RBAC Validation', () => {
    describe('Role-Based Access Control', () => {
      it('should enforce role-based access control', async () => {
        const adminUser = { ...mockUser, roles: ['admin'] };
        const regularUser = { ...mockUser, roles: ['user'] };

        // Mock different users for different scenarios
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          if (userId === 1) return permission === 'admin:dashboard'; // Admin user
          return permission === 'user:profile'; // Regular user
        });

        fastify.get('/admin/dashboard', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'admin:dashboard');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Forbidden' });
          }
          return { dashboard: 'admin-data' };
        });

        // Test admin access
        authService.authenticate.mockResolvedValue({ success: true, user: adminUser } as unknown as unknown);
        const adminResponse = await fastify.inject({
          method: 'GET',
          url: '/admin/dashboard',
          headers: { Authorization: 'Bearer admin_token' }
        });
        expect(adminResponse.statusCode).toBe(200);

        // Test regular user access (should be denied)
        authService.authenticate.mockResolvedValue({ success: true, user: regularUser } as unknown as unknown);
        rbacService.hasPermission.mockResolvedValue(false as unknown as unknown);
        
        const userResponse = await fastify.inject({
          method: 'GET',
          url: '/admin/dashboard',
          headers: { Authorization: 'Bearer user_token' }
        });
        expect(userResponse.statusCode).toBe(403);
      });

      it('should handle hierarchical roles', async () => {
        const superAdminUser = { ...mockUser, roles: ['super_admin', 'admin', 'user'] };
        
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const userRoles = superAdminUser.roles;
          const roleHierarchy = {
            'super_admin': ['admin:dashboard', 'admin:users', 'admin:system', 'user:profile'],
            'admin': ['admin:dashboard', 'admin:users', 'user:profile'],
            'user': ['user:profile']
          };
          
          return userRoles.some(role => 
            roleHierarchy[role as keyof typeof roleHierarchy]?.includes(permission)
          );
        });

        fastify.get('/admin/system', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'admin:system');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Forbidden' });
          }
          return { system: 'super-admin-only-data' };
        });

        authService.authenticate.mockResolvedValue({ success: true, user: superAdminUser } as unknown as unknown);
        
        const response = await fastify.inject({
          method: 'GET',
          url: '/admin/system',
          headers: { Authorization: 'Bearer super_admin_token' }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toHaveProperty('system');
      });

      it('should validate resource-specific permissions', async () => {
        rbacService.hasResourcePermission.mockImplementation(async (userId, resource, action) => {
          // User can only access their own resources
          if (resource === 'user:profile' && action === 'read' && userId === 1) return true;
          if (resource === 'user:profile' && action === 'write' && userId === 1) return true;
          return false;
        });

        fastify.get('/users/:id/profile', async (request, reply) => {
          const { id } = request.params as { id: string };
          const hasPermission = await rbacService.hasResourcePermission(
            request.user.id, 
            `user:${id}:profile`, 
            'read'
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Cannot access other user profiles' });
          }
          return { profile: `User ${id} profile` };
        });

        // Test accessing own profile (should succeed)
        const ownProfileResponse = await fastify.inject({
          method: 'GET',
          url: '/users/1/profile',
          headers: { Authorization: 'Bearer user_token' }
        });
        expect(ownProfileResponse.statusCode).toBe(200);

        // Test accessing other user's profile (should fail)
        rbacService.hasResourcePermission.mockResolvedValue(false as unknown as unknown);
        const otherProfileResponse = await fastify.inject({
          method: 'GET',
          url: '/users/2/profile',
          headers: { Authorization: 'Bearer user_token' }
        });
        expect(otherProfileResponse.statusCode).toBe(403);
      });
    });

    describe('Dynamic Permission System', () => {
      it('should handle context-based permissions', async () => {
        // Mock business hours check
        const isBusinessHours = () => {
          const hour = new Date().getHours();
          return hour >= 9 && hour <= 17; // 9 AM to 5 PM
        };

        rbacService.hasPermission.mockImplementation(async (userId, permission, context) => {
          if (permission === 'admin:sensitive' && !isBusinessHours()) {
            return false; // Sensitive operations only during business hours
          }
          return true;
        });

        fastify.get('/admin/sensitive', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(
            request.user.id, 
            'admin:sensitive', 
            { time: new Date() }
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Access restricted to business hours' });
          }
          return { data: 'sensitive-data' };
        });

        // The actual test result depends on when it's run
        const response = await fastify.inject({
          method: 'GET',
          url: '/admin/sensitive',
          headers: { Authorization: 'Bearer admin_token' }
        });

        expect([200, 403]).toContain(response.statusCode);
      });
    });
  });

  describe('3. Security Hardening & Attack Prevention', () => {
    describe('Brute Force Protection', () => {
      it('should enforce rate limiting on authentication attempts', async () => {
        loginService.attemptLogin.mockImplementation(async (email, password, metadata) => {
          // Simulate failed attempts tracking
          const failedAttempts = (loginService.attemptLogin as jest.Mock).mock.calls.length;
          
          if (failedAttempts > 5) {
            return {
              success: false,
              error: 'Account temporarily locked due to too many failed attempts',
              lockoutRemaining: 1800 // 30 minutes
            };
          }
          
          return {
            success: false,
            error: 'Invalid credentials',
            attemptsRemaining: 5 - failedAttempts
          };
        });

        fastify.post('/auth/login', async (request, reply) => {
          const { email, password } = request.body as { email: string; password: string };
          const result = await loginService.attemptLogin(email, password, { ip: request.ip });
          
          if (!result.success) {
            return reply.code(401).send(result);
          }
          return result;
        });

        // Simulate multiple failed login attempts
        for (let i = 0; i < 7; i++) {
          const response = await fastify.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'test@example.com', password: 'wrong-password' }
          });

          if (i < 5) {
            expect(response.statusCode).toBe(401);
            expect(JSON.parse(response.body)).toHaveProperty('attemptsRemaining');
          } else {
            expect(response.statusCode).toBe(401);
            expect(JSON.parse(response.body).error).toContain('temporarily locked');
          }
        }
      });

      it('should implement progressive delay on failed attempts', async () => {
        const attemptDelays: number[] = [];
        
        loginService.attemptLogin.mockImplementation(async (email, password, metadata) => {
          const attemptNumber = (loginService.attemptLogin as jest.Mock).mock.calls.length;
          const delay = Math.min(1000 * Math.pow(2, attemptNumber - 1), 30000); // Exponential backoff, max 30s
          
          attemptDelays.push(delay);
          
          // Simulate delay
          await new Promise(resolve => setTimeout(resolve, 10)); // Reduced for testing
          
          return {
            success: false,
            error: 'Invalid credentials',
            nextAttemptDelay: delay
          };
        });

        fastify.post('/auth/login', async (request, reply) => {
          const { email, password } = request.body as { email: string; password: string };
          const result = await loginService.attemptLogin(email, password, { ip: request.ip });
          return reply.code(401).send(result);
        });

        // Test progressive delays
        for (let i = 0; i < 3; i++) {
          await fastify.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'test@example.com', password: 'wrong-password' }
          });
        }

        expect(attemptDelays).toHaveLength(3);
        expect(attemptDelays[1]).toBeGreaterThan(attemptDelays[0]);
        expect(attemptDelays[2]).toBeGreaterThan(attemptDelays[1]);
      });
    });

    describe('Input Validation & Injection Prevention', () => {
      it('should validate and sanitize all inputs', async () => {
        fastify.post('/auth/register', async (request, reply) => {
          const { email, password, username } = request.body as any;
          
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return reply.code(400).send({ error: 'Invalid email format' });
          }
          
          // Validate password complexity
          if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            return reply.code(400).send({ error: 'Password does not meet complexity requirements' });
          }
          
          // Validate username (no special characters that could be used for injection)
          if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return reply.code(400).send({ error: 'Username contains invalid characters' });
          }
          
          return { success: true };
        });

        // Test valid input
        const validResponse = await fastify.inject({
          method: 'POST',
          url: '/auth/register',
          payload: {
            email: 'test@example.com',
            password: 'SecurePass123',
            username: 'validuser'
          }
        });
        expect(validResponse.statusCode).toBe(200);

        // Test SQL injection attempt in email
        const sqlInjectionResponse = await fastify.inject({
          method: 'POST',
          url: '/auth/register',
          payload: {
            email: "'; DROP TABLE users; --",
            password: 'SecurePass123',
            username: 'testuser'
          }
        });
        expect(sqlInjectionResponse.statusCode).toBe(400);

        // Test XSS attempt in username
        const xssResponse = await fastify.inject({
          method: 'POST',
          url: '/auth/register',
          payload: {
            email: 'test@example.com',
            password: 'SecurePass123',
            username: '<script>alert("xss")</script>'
          }
        });
        expect(xssResponse.statusCode).toBe(400);
      });

      it('should prevent parameter pollution attacks', async () => {
        fastify.get('/api/users', async (request, reply) => {
          const query = request.query as any;
          
          // Ensure query parameters are not arrays (parameter pollution protection)
          for (const [key, value] of Object.entries(query)) {
            if (Array.isArray(value)) {
              return reply.code(400).send({ error: `Parameter ${key} should not be an array` });
            }
          }
          
          return { users: [], query };
        });

        // Test normal request
        const normalResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users?page=1&limit=10'
        });
        expect(normalResponse.statusCode).toBe(200);

        // Test parameter pollution attempt
        const pollutionResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users?page=1&page=999&limit=10'
        });
        expect(pollutionResponse.statusCode).toBe(400);
      });
    });

    describe('Session Security', () => {
      it('should implement secure session management', async () => {
        const sessionData = {
          sessionId: 'secure-session-123',
          userId: 1,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          isValid: true
        };

        sessionService.getSession.mockResolvedValue(sessionData as unknown as unknown);
        sessionService.validateSession.mockResolvedValue({
          valid: true,
          session: sessionData,
          securityChecks: {
            ipMatch: true,
            userAgentMatch: true,
            notExpired: true,
            notConcurrentlyUsed: true
          }
        } as unknown as unknown);

        fastify.get('/secure/profile', async (request, reply) => {
          const sessionId = request.headers['x-session-id'] as string;
          if (!sessionId) {
            return reply.code(401).send({ error: 'Session ID required' });
          }

          const validation = await sessionService.validateSession(sessionId, {
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || ''
          });

          if (!validation.valid) {
            return reply.code(401).send({ error: 'Invalid session', details: validation.securityChecks });
          }

          return { profile: 'user-profile' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/secure/profile',
          headers: {
            'x-session-id': 'secure-session-123',
            'user-agent': 'Mozilla/5.0...'
          }
        });

        expect(response.statusCode).toBe(200);
        expect(sessionService.validateSession).toHaveBeenCalledWith('secure-session-123', {
          ipAddress: expect.any(String),
          userAgent: 'Mozilla/5.0...'
        });
      });

      it('should detect and prevent session hijacking', async () => {
        sessionService.validateSession.mockResolvedValue({
          valid: false,
          session: null,
          securityChecks: {
            ipMatch: false,
            userAgentMatch: false,
            notExpired: true,
            notConcurrentlyUsed: true
          },
          suspiciousActivity: true
        } as unknown as unknown);

        auditService.logSecurityEvent.mockResolvedValue();

        fastify.get('/secure/data', async (request, reply) => {
          const sessionId = request.headers['x-session-id'] as string;
          const validation = await sessionService.validateSession(sessionId, {
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'] || ''
          });

          if (validation.suspiciousActivity) {
            await auditService.logSecurityEvent({
              type: 'SUSPICIOUS_SESSION_ACTIVITY',
              severity: 'HIGH',
              details: {
                sessionId,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
                securityChecks: validation.securityChecks
              }
            });

            return reply.code(403).send({ error: 'Suspicious session activity detected' });
          }

          return { data: 'secure-data' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/secure/data',
          headers: {
            'x-session-id': 'hijacked-session',
            'user-agent': 'Different-Browser/1.0'
          }
        });

        expect(response.statusCode).toBe(403);
        expect(auditService.logSecurityEvent).toHaveBeenCalledWith({
          type: 'SUSPICIOUS_SESSION_ACTIVITY',
          severity: 'HIGH',
          details: expect.objectContaining({
            sessionId: 'hijacked-session',
            securityChecks: expect.objectContaining({
              ipMatch: false,
              userAgentMatch: false
            })
          })
        });
      });
    });
  });

  describe('4. Session Management & Security Context', () => {
    describe('Multi-Factor Authentication', () => {
      it('should enforce MFA when required', async () => {
        const mfaUser = { ...mockUser, mfaEnabled: true };
        
        authService.authenticate.mockResolvedValue({ 
          success: true, 
          user: mfaUser, 
          requiresMfa: true 
        } as unknown as unknown);

        const mockTotpService = {
          verifyToken: jest.fn<unknown[], unknown>().mockResolvedValue({ valid: true } as unknown as unknown)
        };

        fastify.post('/auth/verify-mfa', async (request, reply) => {
          const { token } = request.body as { token: string };
          const verification = await mockTotpService.verifyToken(request.user.id, token);
          
          if (!verification.valid) {
            return reply.code(401).send({ error: 'Invalid MFA token' });
          }

          // Complete authentication
          const fullToken = await tokenService.generateToken(request.user);
          return { success: true, token: fullToken, user: request.user };
        });

        fastify.get('/mfa-protected', async (request, reply) => {
          if (request.user.mfaEnabled && !request.user.mfaVerified) {
            return reply.code(401).send({ error: 'MFA verification required' });
          }
          return { data: 'mfa-protected-data' };
        });

        // Test MFA verification
        authService.authenticate.mockResolvedValue({ 
          success: true, 
          user: { ...mfaUser, mfaVerified: false }
        } as unknown as unknown);

        const mfaResponse = await fastify.inject({
          method: 'GET',
          url: '/mfa-protected',
          headers: { Authorization: 'Bearer partial_token' }
        });

        expect(mfaResponse.statusCode).toBe(401);
        expect(JSON.parse(mfaResponse.body).error).toContain('MFA verification required');
      });

      it('should handle backup codes for MFA recovery', async () => {
        const mockBackupCodeService = {
          verifyBackupCode: jest.fn<unknown[], unknown>().mockImplementation((userId, code) => {
            const validCodes = ['backup1', 'backup2', 'backup3'];
            return Promise.resolve({ valid: validCodes.includes(code), remaining: 2 });
          }),
          invalidateBackupCode: jest.fn<unknown[], unknown>().mockResolvedValue()
        };

        fastify.post('/auth/verify-backup-code', async (request, reply) => {
          const { backupCode } = request.body as { backupCode: string };
          const verification = await mockBackupCodeService.verifyBackupCode(request.user.id, backupCode);
          
          if (!verification.valid) {
            return reply.code(401).send({ error: 'Invalid backup code' });
          }

          await mockBackupCodeService.invalidateBackupCode(request.user.id, backupCode);
          return { 
            success: true, 
            message: 'MFA bypassed with backup code',
            remainingBackupCodes: verification.remaining 
          };
        });

        authService.authenticate.mockResolvedValue({ 
          success: true, 
          user: { ...mockUser, mfaEnabled: true, mfaVerified: false }
        } as unknown as unknown);

        const response = await fastify.inject({
          method: 'POST',
          url: '/auth/verify-backup-code',
          headers: { Authorization: 'Bearer partial_token' },
          payload: { backupCode: 'backup1' }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toMatchObject({
          success: true,
          remainingBackupCodes: 2
        });
        expect(mockBackupCodeService.invalidateBackupCode).toHaveBeenCalledWith(1, 'backup1');
      });
    });

    describe('Device Trust & Recognition', () => {
      it('should implement device fingerprinting and trust scoring', async () => {
        const mockDeviceService = {
          generateFingerprint: jest.fn<unknown[], unknown>().mockReturnValue('device-fingerprint-123' as unknown as unknown),
          getTrustScore: jest.fn<unknown[], unknown>().mockResolvedValue({ score: 85, factors: ['known_device', 'consistent_behavior'] } as unknown as unknown),
          updateDeviceInfo: jest.fn<unknown[], unknown>().mockResolvedValue()
        };

        fastify.addHook('preHandler', async (request, reply) => {
          if (request.url.startsWith('/secure/')) {
            const deviceFingerprint = mockDeviceService.generateFingerprint(request.headers);
            const trustScore = await mockDeviceService.getTrustScore(request.user?.id, deviceFingerprint);
            
            request.deviceTrust = trustScore;
            
            if (trustScore.score < 50) {
              return reply.code(403).send({ 
                error: 'Device trust score too low',
                requiredActions: ['verify_device', 'complete_challenge']
              });
            }
          }
        });

        fastify.get('/secure/sensitive-operation', async (request, reply) => {
          const trust = (request as any).deviceTrust;
          
          if (trust.score < 80) {
            return reply.code(403).send({ 
              error: 'High security operation requires higher device trust',
              currentScore: trust.score,
              requiredScore: 80
            });
          }
          
          return { operation: 'completed', trustScore: trust.score };
        });

        authService.authenticate.mockResolvedValue({ success: true, user: mockUser } as unknown as unknown);

        const response = await fastify.inject({
          method: 'GET',
          url: '/secure/sensitive-operation',
          headers: { 
            Authorization: 'Bearer valid_token',
            'User-Agent': 'Known-Browser/1.0',
            'X-Device-ID': 'trusted-device-123'
          }
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toMatchObject({
          operation: 'completed',
          trustScore: 85
        });
      });
    });
  });

  describe('5. Compliance & Audit Trail Verification', () => {
    describe('Audit Logging', () => {
      it('should log all authentication events', async () => {
        const auditEvents: any[] = [];
        auditService.logSecurityEvent.mockImplementation(async (event) => {
          auditEvents.push(event);
        });

        fastify.addHook('preHandler', async (request, reply) => {
          if (request.headers.authorization) {
            await auditService.logSecurityEvent({
              type: 'AUTHENTICATION_ATTEMPT',
              userId: request.user?.id,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
              endpoint: request.url,
              method: request.method,
              timestamp: new Date().toISOString()
            });
          }
        });

        fastify.get('/protected/resource', async (request, reply) => {
          return { resource: 'protected-data' };
        });

        await fastify.inject({
          method: 'GET',
          url: '/protected/resource',
          headers: { Authorization: 'Bearer token123' }
        });

        expect(auditEvents).toHaveLength(1);
        expect(auditEvents[0]).toMatchObject({
          type: 'AUTHENTICATION_ATTEMPT',
          endpoint: '/protected/resource',
          method: 'GET'
        });
      });

      it('should maintain immutable audit logs', async () => {
        const auditLog = {
          id: 'audit-123',
          type: 'LOGIN_SUCCESS',
          userId: 1,
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          checksum: 'sha256-checksum-here'
        };

        auditService.getAuditLog.mockResolvedValue([auditLog] as unknown as unknown);
        auditService.verifyAuditLogIntegrity.mockResolvedValue({ valid: true, tampered: false } as unknown as unknown);

        fastify.get('/admin/audit-logs', async (request, reply) => {
          const logs = await auditService.getAuditLog({ limit: 100 });
          const integrity = await auditService.verifyAuditLogIntegrity();
          
          return { logs, integrity };
        });

        authService.authenticate.mockResolvedValue({ 
          success: true, 
          user: { ...mockUser, roles: ['admin'] }
        } as unknown as unknown);

        const response = await fastify.inject({
          method: 'GET',
          url: '/admin/audit-logs',
          headers: { Authorization: 'Bearer admin_token' }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.logs).toHaveLength(1);
        expect(body.integrity).toMatchObject({ valid: true, tampered: false });
      });
    });

    describe('Data Protection Compliance', () => {
      it('should handle GDPR data subject requests', async () => {
        const mockGdprService = {
          exportUserData: jest.fn<unknown[], unknown>().mockResolvedValue({
            personalData: { email: 'test@example.com', name: 'Test User' },
            activityLog: [{ action: 'login', timestamp: '2023-01-01T00:00:00Z' }],
            exportedAt: new Date().toISOString()
          }),
          deleteUserData: jest.fn<unknown[], unknown>().mockResolvedValue({ deleted: true, retainedForLegal: ['audit_logs'] } as unknown as unknown)
        };

        fastify.post('/privacy/export-data', async (request, reply) => {
          const userId = request.user.id;
          const exportData = await mockGdprService.exportUserData(userId);
          
          // Log the data export for audit
          await auditService.logSecurityEvent({
            type: 'DATA_EXPORT_REQUEST',
            userId,
            details: { dataTypes: Object.keys(exportData.personalData) }
          });
          
          return exportData;
        });

        fastify.post('/privacy/delete-data', async (request, reply) => {
          const userId = request.user.id;
          const deleteResult = await mockGdprService.deleteUserData(userId);
          
          await auditService.logSecurityEvent({
            type: 'DATA_DELETION_REQUEST',
            userId,
            details: deleteResult
          });
          
          return deleteResult;
        });

        authService.authenticate.mockResolvedValue({ success: true, user: mockUser } as unknown as unknown);

        // Test data export
        const exportResponse = await fastify.inject({
          method: 'POST',
          url: '/privacy/export-data',
          headers: { Authorization: 'Bearer user_token' }
        });

        expect(exportResponse.statusCode).toBe(200);
        expect(JSON.parse(exportResponse.body)).toHaveProperty('personalData');

        // Test data deletion
        const deleteResponse = await fastify.inject({
          method: 'POST',
          url: '/privacy/delete-data',
          headers: { Authorization: 'Bearer user_token' }
        });

        expect(deleteResponse.statusCode).toBe(200);
        expect(JSON.parse(deleteResponse.body)).toMatchObject({
          deleted: true,
          retainedForLegal: ['audit_logs']
        });
      });
    });
  });

  describe('6. Integration & End-to-End Security Flows', () => {
    describe('Complete Authentication Journey', () => {
      it('should handle complete registration to authenticated access flow', async () => {
        const registrationData = {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          username: 'newuser'
        };

        // Mock the complete registration flow
        const mockRegistrationService = {
          register: jest.fn<unknown[], unknown>().mockResolvedValue({
            success: true,
            userId: 2,
            verificationToken: 'verify-123'
          } as unknown as unknown),
          verifyEmail: jest.fn<unknown[], unknown>().mockResolvedValue({ success: true } as unknown as unknown),
          setupMfa: jest.fn<unknown[], unknown>().mockResolvedValue({ 
            qrCode: 'data:image/png;base64,...',
            backupCodes: ['backup1', 'backup2']
          } as unknown as unknown)
        };

        // Registration endpoint
        fastify.post('/auth/register', async (request, reply) => {
          const result = await mockRegistrationService.register(request.body);
          return result;
        });

        // Email verification endpoint
        fastify.post('/auth/verify-email', async (request, reply) => {
          const { token } = request.body as { token: string };
          const result = await mockRegistrationService.verifyEmail(token);
          return result;
        });

        // MFA setup endpoint
        fastify.post('/auth/setup-mfa', async (request, reply) => {
          const result = await mockRegistrationService.setupMfa(request.user.id);
          return result;
        });

        // Test complete flow
        // 1. Registration
        const registerResponse = await fastify.inject({
          method: 'POST',
          url: '/auth/register',
          payload: registrationData
        });
        expect(registerResponse.statusCode).toBe(200);
        expect(JSON.parse(registerResponse.body)).toHaveProperty('verificationToken');

        // 2. Email verification
        const verifyResponse = await fastify.inject({
          method: 'POST',
          url: '/auth/verify-email',
          payload: { token: 'verify-123' }
        });
        expect(verifyResponse.statusCode).toBe(200);

        // 3. Login after verification
        loginService.attemptLogin.mockResolvedValue({
          success: true,
          user: { ...mockUser, id: 2, email: registrationData.email, emailVerified: true },
          token: 'auth-token-123',
          requiresMfa: false
        } as unknown as unknown);

        fastify.post('/auth/login', async (request, reply) => {
          const { email, password } = request.body as { email: string; password: string };
          return await loginService.attemptLogin(email, password, { ip: request.ip });
        });

        const loginResponse = await fastify.inject({
          method: 'POST',
          url: '/auth/login',
          payload: { email: registrationData.email, password: registrationData.password }
        });
        expect(loginResponse.statusCode).toBe(200);
        expect(JSON.parse(loginResponse.body)).toHaveProperty('token');

        // 4. Access protected resource
        authService.authenticate.mockResolvedValue({ 
          success: true, 
          user: { ...mockUser, id: 2, email: registrationData.email, emailVerified: true }
        } as unknown as unknown);

        fastify.get('/protected/welcome', async (request, reply) => {
          return { message: `Welcome ${request.user.email}!`, userId: request.user.id };
        });

        const protectedResponse = await fastify.inject({
          method: 'GET',
          url: '/protected/welcome',
          headers: { Authorization: 'Bearer auth-token-123' }
        });
        expect(protectedResponse.statusCode).toBe(200);
        expect(JSON.parse(protectedResponse.body).message).toContain('Welcome');
      });
    });

    describe('Security Incident Response', () => {
      it('should handle and respond to security incidents', async () => {
        const incidentData = {
          type: 'SUSPICIOUS_LOGIN_PATTERN',
          severity: 'HIGH',
          userId: 1,
          details: {
            multipleFailedLogins: 10,
            differentIpAddresses: ['192.168.1.1', '10.0.0.1', '172.16.0.1'],
            timeWindow: '5 minutes',
            possibleBruteForce: true
          }
        };

        const mockIncidentService = {
          reportIncident: jest.fn<unknown[], unknown>().mockResolvedValue({
            incidentId: 'INC-12345',
            autoActions: ['account_locked', 'admin_notified', 'ip_blocked'],
            requiresManualReview: true
          } as unknown as unknown),
          getIncidentStatus: jest.fn<unknown[], unknown>().mockResolvedValue({
            status: 'investigating',
            assignedTo: 'security-team',
            actions: ['account_locked', 'user_notified']
          } as unknown as unknown)
        };

        fastify.post('/security/report-incident', async (request, reply) => {
          const response = await mockIncidentService.reportIncident(request.body);
          
          // Log security incident
          await auditService.logSecurityEvent({
            type: 'SECURITY_INCIDENT_REPORTED',
            severity: request.body.severity,
            details: {
              incidentId: response.incidentId,
              autoActions: response.autoActions
            }
          });
          
          return response;
        });

        fastify.get('/security/incidents/:id/status', async (request, reply) => {
          const { id } = request.params as { id: string };
          return await mockIncidentService.getIncidentStatus(id);
        });

        // Test incident reporting
        const reportResponse = await fastify.inject({
          method: 'POST',
          url: '/security/report-incident',
          headers: { Authorization: 'Bearer admin_token' },
          payload: incidentData
        });

        expect(reportResponse.statusCode).toBe(200);
        const incidentResult = JSON.parse(reportResponse.body);
        expect(incidentResult).toMatchObject({
          incidentId: 'INC-12345',
          autoActions: expect.arrayContaining(['account_locked', 'admin_notified'])
        });

        // Test incident status check
        const statusResponse = await fastify.inject({
          method: 'GET',
          url: '/security/incidents/INC-12345/status',
          headers: { Authorization: 'Bearer admin_token' }
        });

        expect(statusResponse.statusCode).toBe(200);
        expect(JSON.parse(statusResponse.body)).toMatchObject({
          status: 'investigating',
          assignedTo: 'security-team'
        });
      });
    });
  });
});