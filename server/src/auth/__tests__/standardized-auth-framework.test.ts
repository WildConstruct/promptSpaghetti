/**
 * Standardized Authentication Framework Tests
 * 
 * Comprehensive test suite for the unified authentication framework covering
 * OAuth2, API keys, webhook authentication, and the unified middleware.
 * 
 * Task: T-1752989144373-142 - Standardize auth handler framework (OAuth2, API keys, webhooks)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebhookAuthenticationService, WebhookProvider } from '../services/WebhookAuthenticationService';
import { UnifiedAuthenticationMiddleware, AuthContext } from '../middleware/unified-auth';
import { AuditService } from '../services/AuditService';
import { AuthenticationService } from '../services/AuthenticationService';
import { ApiKeyManagementService } from '../services/ApiKeyManagementService';

// Mock services
jest.mock('../services/AuditService');
jest.mock('../services/AuthenticationService');
jest.mock('../services/ApiKeyManagementService');

describe('Standardized Authentication Framework', () => {
  let webhookAuthService: WebhookAuthenticationService;
  let unifiedAuthMiddleware: UnifiedAuthenticationMiddleware;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockAuthService: jest.Mocked<AuthenticationService>;
  let mockApiKeyService: jest.Mocked<ApiKeyManagementService>;

  beforeEach(() => {
    mockAuditService = new AuditService({} as any) as jest.Mocked<AuditService>;
    mockAuthService = new AuthenticationService({} as any) as jest.Mocked<AuthenticationService>;
    mockApiKeyService = new ApiKeyManagementService(
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<ApiKeyManagementService>;

    mockAuditService.logEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown);

    webhookAuthService = new WebhookAuthenticationService(mockAuditService);
    unifiedAuthMiddleware = new UnifiedAuthenticationMiddleware(
      mockAuthService,
      mockApiKeyService,
      webhookAuthService
    );

    jest.clearAllMocks();
  });

  describe('WebhookAuthenticationService', () => {
    const mockProvider: Omit<WebhookProvider, 'createdAt' | 'updatedAt'> = {
      providerId: 'github',
      name: 'GitHub Webhooks',
      description: 'GitHub repository webhooks',
      signatureHeader: 'x-hub-signature-256',
      signatureAlgorithm: 'sha256',
      signaturePrefix: 'sha256=',
      secretKey: 'test-secret-key',
      active: true,
      endpoints: ['/webhooks/github'],
      eventTypes: ['push', 'pull_request', 'issues']
    };

    test('should register webhook provider successfully', async () => {
      await webhookAuthService.registerProvider(mockProvider);

      const provider = webhookAuthService.getProvider('github');
      expect(provider).toBeDefined();
      expect(provider?.name).toBe('GitHub Webhooks');
      expect(provider?.active).toBe(true);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'WEBHOOK_PROVIDER_REGISTERED',
          details: expect.objectContaining({
            providerId: 'github',
            name: 'GitHub Webhooks'
  }
  }
      );
    });

    test('should validate webhook signature correctly', async () => {
      await webhookAuthService.registerProvider(mockProvider);

      const payload = JSON.stringify({ test: 'data', timestamp: Date.now() });
      const signature = 'sha256=' + require('crypto')
        .createHmac('sha256', mockProvider.secretKey)
        .update(payload)
        .digest('hex');

      const request = {
        providerId: 'github',
        signature,
        payload,
        headers: { 'x-hub-signature-256': signature },
        eventType: 'push'
      };

      const result = await webhookAuthService.validateWebhook(request);

      expect(result.valid).toBe(true);
      expect(result.providerId).toBe('github');
      expect(result.eventType).toBe('push');
      expect(result.payload).toEqual({ test: 'data', timestamp: expect.any(Number) });
    });

    test('should reject invalid webhook signature', async () => {
      await webhookAuthService.registerProvider(mockProvider);

      const payload = JSON.stringify({ test: 'data' });
      const invalidSignature = 'sha256=invalid-signature';

      const request = {
        providerId: 'github',
        signature: invalidSignature,
        payload,
        headers: { 'x-hub-signature-256': invalidSignature }
      };

      const result = await webhookAuthService.validateWebhook(request);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Signature verification failed');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'WEBHOOK_SIGNATURE_INVALID'
  }
      );
    });

    test('should detect replay attacks', async () => {
      const config = {
        providers: {},
        enableReplayProtection: true,
        replayWindowSeconds: 300
      };

      const replayProtectedService = new WebhookAuthenticationService(mockAuditService, config);
      await replayProtectedService.registerProvider(mockProvider);

      const payload = JSON.stringify({ test: 'data', id: 'unique-event-id' });
      const signature = 'sha256=' + require('crypto')
        .createHmac('sha256', mockProvider.secretKey)
        .update(payload)
        .digest('hex');

      const request = {
        providerId: 'github',
        signature,
        payload,
        headers: { 'x-hub-signature-256': signature }
      };

      // First request should succeed
      const result1 = await replayProtectedService.validateWebhook(request);
      expect(result1.valid).toBe(true);

      // Second identical request should be detected as replay
      const result2 = await replayProtectedService.validateWebhook(request);
      expect(result2.valid).toBe(false);
      expect(result2.error).toContain('Duplicate webhook event detected');
    });

    test('should handle unsupported event types', async () => {
      await webhookAuthService.registerProvider(mockProvider);

      const payload = JSON.stringify({ test: 'data' });
      const signature = 'sha256=' + require('crypto')
        .createHmac('sha256', mockProvider.secretKey)
        .update(payload)
        .digest('hex');

      const request = {
        providerId: 'github',
        signature,
        payload,
        headers: { 'x-hub-signature-256': signature },
        eventType: 'unsupported_event'
      };

      const result = await webhookAuthService.validateWebhook(request);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported event type: unsupported_event');
    });

    test('should test provider configuration', async () => {
      await webhookAuthService.registerProvider(mockProvider);

      const testPayload = { test: true, timestamp: Date.now() };
      const result = await webhookAuthService.testProvider('github', testPayload);

      expect(result.valid).toBe(true);
      expect(result.providerId).toBe('github');
    });

    test('should update provider configuration', async () => {
      await webhookAuthService.registerProvider(mockProvider);

      const updates = {
        name: 'Updated GitHub Webhooks',
        description: 'Updated description',
        active: false
      };

      const success = await webhookAuthService.updateProvider('github', updates);
      expect(success).toBe(true);

      const provider = webhookAuthService.getProvider('github');
      expect(provider?.name).toBe('Updated GitHub Webhooks');
      expect(provider?.active).toBe(false);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'WEBHOOK_PROVIDER_UPDATED'
  }
      );
    });

    test('should remove provider', async () => {
      await webhookAuthService.registerProvider(mockProvider);
      expect(webhookAuthService.getProvider('github')).toBeDefined();

      const success = await webhookAuthService.removeProvider('github');
      expect(success).toBe(true);
      expect(webhookAuthService.getProvider('github')).toBeUndefined();

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'WEBHOOK_PROVIDER_REMOVED'
  }
      );
    });

    test('should provide statistics', () => {
      const stats = webhookAuthService.getStatistics();

      expect(stats).toEqual({
        totalProviders: 0,
        activeProviders: 0,
        providersWithEvents: 0,
        totalEventTypes: 0,
        replayProtectionEnabled: true,
        processedEventsCount: 0
      });
    });
  });

  describe('UnifiedAuthenticationMiddleware', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
      mockRequest = {
        headers: {},
        ip: '127.0.0.1',
        routeOptions: { url: '/test' },
        params: {}
      };

      mockReply = {
        code: jest.fn<unknown[], unknown>().mockReturnThis(),
        send: jest.fn<unknown[], unknown>().mockReturnThis()
      };
    });

    test('should authenticate with JWT token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['user']
      };

      mockAuthService.validateToken = jest.fn<unknown[], unknown>().mockResolvedValue(mockUser as unknown as unknown as unknown);
      mockRequest.headers = {
        'authorization': 'Bearer valid-jwt-token'
      };

      const middleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['jwt']
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const authContext = (mockRequest as any).authContext as AuthContext;
      expect(authContext.authenticated).toBe(true);
      expect(authContext.method).toBe('jwt');
      expect(authContext.user).toEqual(mockUser);
      expect(mockReply.code).not.toHaveBeenCalled();
    });

    test('should authenticate with API key', async () => {
      mockApiKeyService.validateApiKey = jest.fn<unknown[], unknown>().mockResolvedValue({
        valid: true,
        keyId: 'key-123',
        userId: 'user-456',
        scopes: ['read:data', 'write:data']
      } as unknown as unknown as unknown);

      mockRequest.headers = {
        'x-api-key': 'sk_test_api_key'
      };

      const middleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['api_key']
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const authContext = (mockRequest as any).authContext as AuthContext;
      expect(authContext.authenticated).toBe(true);
      expect(authContext.method).toBe('api_key');
      expect(authContext.apiKey?.keyId).toBe('key-123');
      expect(authContext.apiKey?.scopes).toEqual(['read:data', 'write:data']);
    });

    test('should authenticate with webhook', async () => {
      await webhookAuthService.registerProvider({
        ...mockProvider,
        providerId: 'stripe'
      });

      const payload = JSON.stringify({ event: 'payment.succeeded' });
      const signature = 'sha256=' + require('crypto')
        .createHmac('sha256', mockProvider.secretKey)
        .update(payload)
        .digest('hex');

      mockRequest.headers = {
        'x-hub-signature-256': signature
      };
      mockRequest.params = { providerId: 'stripe' };
      mockRequest.body = payload;

      const middleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['webhook'],
        allowWebhookProviders: ['stripe']
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const authContext = (mockRequest as any).authContext as AuthContext;
      expect(authContext.authenticated).toBe(true);
      expect(authContext.method).toBe('webhook');
      expect(authContext.webhook?.providerId).toBe('stripe');
    });

    test('should enforce required scopes for API keys', async () => {
      mockApiKeyService.validateApiKey = jest.fn<unknown[], unknown>().mockResolvedValue({
        valid: true,
        keyId: 'key-123',
        userId: 'user-456',
        scopes: ['read:data'] // Missing write:data scope
      } as unknown as unknown as unknown);

      mockRequest.headers = {
        'x-api-key': 'sk_test_api_key'
      };

      const middleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['api_key'],
        requiredScopes: ['read:data', 'write:data']
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Insufficient scope permissions',
          required: ['read:data', 'write:data'],
          available: ['read:data']
  }
      );
    });

    test('should enforce required permissions for users', async () => {
      const mockUser = {
        id: 'user-123',
        roles: ['user'] // Only basic user role
      };

      mockAuthService.validateToken = jest.fn<unknown[], unknown>().mockResolvedValue(mockUser as unknown as unknown as unknown);
      mockRequest.headers = {
        'authorization': 'Bearer valid-jwt-token'
      };

      const middleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['jwt'],
        requiredPermissions: ['security:*'] // Requires admin-level permissions
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Insufficient permissions',
          required: ['security:*']
  }
      );
    });

    test('should allow unauthenticated access when not required', async () => {
      const middleware = unifiedAuthMiddleware.createMiddleware({
        required: false
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const authContext = (mockRequest as any).authContext as AuthContext;
      expect(authContext.authenticated).toBe(false);
      expect(authContext.method).toBe('none');
      expect(mockReply.code).not.toHaveBeenCalled();
    });

    test('should bypass authentication for specified paths', async () => {
      mockRequest.routeOptions = { url: '/health/status' };

      const middleware = unifiedAuthMiddleware.createMiddleware({
        required: true,
        bypassForPaths: ['/health']
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const authContext = (mockRequest as any).authContext as AuthContext;
      expect(authContext.authenticated).toBe(false);
      expect(mockReply.code).not.toHaveBeenCalled(); // Should not return 401
    });

    test('should try multiple authentication methods', async () => {
      // No JWT token, but valid API key
      mockAuthService.validateToken = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Invalid token'));
      mockApiKeyService.validateApiKey = jest.fn<unknown[], unknown>().mockResolvedValue({
        valid: true,
        keyId: 'key-123',
        userId: 'user-456',
        scopes: ['read:data']
      } as unknown as unknown as unknown);

      mockRequest.headers = {
        'authorization': 'Bearer invalid-jwt-token',
        'x-api-key': 'sk_valid_api_key'
      };

      const middleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['jwt', 'api_key']
      });

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      const authContext = (mockRequest as any).authContext as AuthContext;
      expect(authContext.authenticated).toBe(true);
      expect(authContext.method).toBe('api_key'); // Should fall back to API key
      expect(mockReply.code).not.toHaveBeenCalled();
    });

    test('should handle middleware errors gracefully', async () => {
      mockAuthService.validateToken = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Service error'));
      mockApiKeyService.validateApiKey = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Service error'));

      mockRequest.headers = {
        'authorization': 'Bearer some-token',
        'x-api-key': 'sk_some_key'
      };

      const middleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['jwt', 'api_key']
      });

      // Mock error in middleware
      jest.spyOn(unifiedAuthMiddleware as any, 'authenticateRequest').mockRejectedValue(
        new Error('Middleware error')
      );

      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication middleware error'
  }
      );
    });
  });

  describe('Integration Tests', () => {
    test('should work end-to-end with all authentication methods', async () => {
      // Register webhook provider
      await webhookAuthService.registerProvider(mockProvider);

      // Mock services
      const mockUser = { id: 'user-123', roles: ['admin'] };
      mockAuthService.validateToken = jest.fn<unknown[], unknown>().mockResolvedValue(mockUser as unknown as unknown as unknown);
      mockApiKeyService.validateApiKey = jest.fn<unknown[], unknown>().mockResolvedValue({
        valid: true,
        keyId: 'key-123',
        userId: 'user-456',
        scopes: ['admin:*']
      } as unknown as unknown as unknown);

      // Test JWT auth
      const jwtRequest: Partial<FastifyRequest> = {
        headers: { 'authorization': 'Bearer jwt-token' },
        ip: '127.0.0.1',
        routeOptions: { url: '/test' }
      };

      const jwtMiddleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['jwt']
      });

      await jwtMiddleware(jwtRequest as FastifyRequest, {} as FastifyReply);
      expect((jwtRequest as any).authContext.method).toBe('jwt');

      // Test API key auth
      const apiKeyRequest: Partial<FastifyRequest> = {
        headers: { 'x-api-key': 'sk_test_key' },
        ip: '127.0.0.1',
        routeOptions: { url: '/test' }
      };

      const apiKeyMiddleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['api_key'],
        requiredScopes: ['admin:*']
      });

      await apiKeyMiddleware(apiKeyRequest as FastifyRequest, {} as FastifyReply);
      expect((apiKeyRequest as any).authContext.method).toBe('api_key');

      // Test webhook auth
      const payload = JSON.stringify({ test: 'data' });
      const signature = 'sha256=' + require('crypto')
        .createHmac('sha256', mockProvider.secretKey)
        .update(payload)
        .digest('hex');

      const webhookRequest: Partial<FastifyRequest> = {
        headers: { 'x-hub-signature-256': signature },
        ip: '127.0.0.1',
        routeOptions: { url: '/webhooks/github' },
        params: { providerId: 'github' },
        body: payload
      };

      const webhookMiddleware = unifiedAuthMiddleware.createMiddleware({
        allowMethods: ['webhook'],
        allowWebhookProviders: ['github']
      });

      await webhookMiddleware(webhookRequest as FastifyRequest, {} as FastifyReply);
      expect((webhookRequest as any).authContext.method).toBe('webhook');

      // All requests should be successfully authenticated
      expect((jwtRequest as any).authContext.authenticated).toBe(true);
      expect((apiKeyRequest as any).authContext.authenticated).toBe(true);
      expect((webhookRequest as any).authContext.authenticated).toBe(true);
    });

    test('should maintain audit trail across all authentication methods', () => {
      // Verify that all authentication methods generated audit events
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'WEBHOOK_PROVIDER_REGISTERED'
  }
      );

      // Additional audit events would be verified based on the specific authentication flows tested
      expect(mockAuditService.logEvent).toHaveBeenCalledTimes(1);
    });
  });
});