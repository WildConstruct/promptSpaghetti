/**
 * OAuth Security Enhancements Tests
 * 
 * Comprehensive test suite for OAuth 2.1 security best practices implementation
 * covering enhanced redirect URI validation, PKCE downgrade protection, and
 * security improvements.
 * 
 * Task: T-1752989143998-989 - Add OAuth best practices
 */

import { OAuthService } from '../OAuthService';
import { AuditService } from '../AuditService';
import { UserService } from '../UserService';
import { TokenService } from '../TokenService';
import { DatabaseService } from '../../database/DatabaseService';
import { AuthConfig, OAuthProvider } from '../../types';

// Mock dependencies
jest.mock('../AuditService');
jest.mock('../UserService'); 
jest.mock('../TokenService');
jest.mock('../../database/DatabaseService');
// Mock global fetch for testing environment
global.fetch = jest.fn<unknown[], unknown>();

jest.mock('../../../security/tls-config', () => ({
  CertificatePinningManager: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    createPinnedFetch: jest.fn<unknown[], unknown>().mockReturnValue(global.fetch as unknown as unknown as unknown)
  })),
  loadPinConfigFromEnv: jest.fn<unknown[], unknown>().mockReturnValue({} as unknown as unknown as unknown)
}));

describe('OAuth Security Enhancements', () => {
  let oauthService: OAuthService;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockDbService: jest.Mocked<DatabaseService>;
  let mockConfig: AuthConfig;

  beforeEach(() => {
    // Mock configuration
    mockConfig = {
      jwtSecret: 'test-secret',
      jwtIssuer: 'test-issuer',
      jwtAudience: 'test-audience',
      database: {} as any,
      redis: {} as any,
      security: {} as any,
      oauth: {
        google: {
          clientId: 'google-client-id',
          clientSecret: 'google-client-secret',
          redirectUri: 'https://example.com/auth/google/callback',
          scopes: ['openid', 'email', 'profile'],
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
        },
        github: {
          clientId: 'github-client-id',
          clientSecret: 'github-client-secret',
          redirectUri: 'https://example.com/auth/github/callback',
          scopes: ['user:email', 'read:user'],
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          userInfoUrl: 'https://api.github.com/user'
        },
        microsoft: {
          clientId: 'microsoft-client-id',
          clientSecret: 'microsoft-client-secret',
          redirectUri: 'https://example.com/auth/microsoft/callback',
          scopes: ['https://graph.microsoft.com/user.read'],
          authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
        }
      }
    };

    // Create mocked services
    mockAuditService = new AuditService({} as any, {} as any) as jest.Mocked<AuditService>;
    mockUserService = new UserService({} as any, {} as any) as jest.Mocked<UserService>;
    mockTokenService = new TokenService({} as any, {} as any, {} as any) as jest.Mocked<TokenService>;
    mockDbService = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;

    mockAuditService.logEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown);

    // Create OAuth service
    oauthService = new OAuthService(
      mockConfig,
      mockUserService,
      mockTokenService,
      mockAuditService,
      mockDbService
    );

    jest.clearAllMocks();
  });

  describe('Enhanced Redirect URI Validation', () => {
    test('should allow exact redirect URI match', () => {
      const registeredUris = ['https://example.com/auth/callback'];
      const requestedUri = 'https://example.com/auth/callback';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(true);
    });

    test('should reject partial redirect URI matches', () => {
      const registeredUris = ['https://example.com/auth/callback'];
      const requestedUri = 'https://example.com/auth/callback/malicious';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(false);
    });

    test('should enforce HTTPS in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const registeredUris = ['http://example.com/auth/callback'];
      const requestedUri = 'http://example.com/auth/callback';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(false);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_HTTP_REDIRECT_BLOCKED',
        details: { requestedUri, environment: 'production' },
        severity: 'MEDIUM'
      });

      process.env.NODE_ENV = originalEnv;
    });

    test('should allow HTTP in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const registeredUris = ['http://localhost:3000/auth/callback'];
      const requestedUri = 'http://localhost:3000/auth/callback';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    test('should detect and block path traversal attacks', () => {
      const registeredUris = ['https://example.com/auth/callback'];
      const requestedUri = 'https://example.com/auth/callback/../admin';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(false);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_PATH_TRAVERSAL_ATTEMPT',
        details: { requestedUri },
        severity: 'HIGH'
      });
    });

    test('should detect and block relative path attacks', () => {
      const registeredUris = ['https://example.com/auth/callback'];
      const requestedUri = 'https://example.com/auth/callback/./secret';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(false);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_PATH_TRAVERSAL_ATTEMPT',
        details: { requestedUri },
        severity: 'HIGH'
      });
    });

    test('should detect suspicious schemes in redirect URI', () => {
      const registeredUris = ['javascript:alert(1)'];
      const requestedUri = 'javascript:alert(1)';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(false);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_SUSPICIOUS_REDIRECT_URI',
        details: { requestedUri, reason: 'suspicious_scheme' },
        severity: 'HIGH'
      });
    });

    test('should handle malformed URLs gracefully', () => {
      const registeredUris = ['not-a-valid-url'];
      const requestedUri = 'not-a-valid-url';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(false);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'OAUTH_INVALID_REDIRECT_URI',
          severity: 'MEDIUM'
        })
      );
    });
  });

  describe('PKCE Downgrade Protection', () => {
    test('should require PKCE for public clients', () => {
      const clientId = 'public-client-123';
      const clientType = 'public';

      expect(() => {
        (oauthService as any).validatePkceRequirement(clientId, undefined, clientType);
      }).toThrow('PKCE is required for public clients (OAuth 2.1 compliance)');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_PKCE_REQUIRED_VIOLATION',
        details: { clientId, clientType },
        severity: 'HIGH'
      });
    });

    test('should allow PKCE for public clients', () => {
      const clientId = 'public-client-123';
      const codeChallenge = 'test-challenge';
      const clientType = 'public';

      expect(() => {
        (oauthService as any).validatePkceRequirement(clientId, codeChallenge, clientType);
      }).not.toThrow();
    });

    test('should allow confidential clients without PKCE (legacy support)', () => {
      const clientId = 'confidential-client-123';
      const clientType = 'confidential';

      expect(() => {
        (oauthService as any).validatePkceRequirement(clientId, undefined, clientType);
      }).not.toThrow();
    });

    test('should detect PKCE downgrade attempts for clients that support PKCE', () => {
      const clientId = 'pkce-enabled-client-123';
      const clientType = 'public';

      // Mock the client PKCE capability check to return true
      jest.spyOn(oauthService as any, 'checkClientPkceCapability').mockReturnValue(true as unknown as unknown as unknown);

      expect(() => {
        (oauthService as any).validatePkceRequirement(clientId, undefined, clientType);
      }).toThrow('PKCE is required for public clients (OAuth 2.1 compliance)');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_PKCE_REQUIRED_VIOLATION',
        details: { clientId, clientType },
        severity: 'HIGH'
      });
    });

    test('should check client PKCE capability correctly', () => {
      const clientId = 'test-client-123';

      // Test the PKCE capability check (currently returns true for all clients)
      const result = (oauthService as any).checkClientPkceCapability(clientId);

      expect(result).toBe(true);
    });
  });

  describe('Secure Authorization URL Generation', () => {
    test('should generate secure authorization URL with PKCE', async () => {
      const provider: OAuthProvider = 'google';
      const state = 'secure-state-123';
      const codeChallenge = 'test-challenge';
      const clientId = 'test-client';

      // Mock PKCE capability check
      jest.spyOn(oauthService as any, 'checkClientPkceCapability').mockReturnValue(true as unknown as unknown as unknown);

      const result = await (oauthService as any).generateSecureAuthorizationUrl(
        provider,
        state,
        codeChallenge,
        clientId
      );

      expect(result).toContain('code_challenge=test-challenge');
      expect(result).toContain('code_challenge_method=S256');
      expect(result).toContain('state=secure-state-123');

      expect(mockAuditService.logEvent).toHaveBeenCalledWith({
        eventType: 'OAUTH_AUTHORIZATION_URL_GENERATED',
        details: {
          provider,
          clientId: mockConfig.oauth.google.clientId,
          scopes: mockConfig.oauth.google.scopes,
          pkceUsed: true
        },
        severity: 'LOW'
      });
    });

    test('should validate redirect URI during authorization URL generation', async () => {
      const provider: OAuthProvider = 'google';
      const state = 'secure-state-123';
      const clientId = 'test-client';
      const clientType = 'confidential';

      // Mock redirect URI validation to fail
      jest.spyOn(oauthService as any, 'validateRedirectUriStrict').mockReturnValue(false as unknown as unknown as unknown);

      await expect(
        (oauthService as any).generateSecureAuthorizationUrl(provider, state, undefined, clientId)
      ).rejects.toThrow('Invalid redirect URI configuration');
    });

    test('should throw error for unconfigured providers', async () => {
      const invalidProvider = 'invalid' as OAuthProvider;
      const state = 'secure-state-123';

      await expect(
        (oauthService as any).generateSecureAuthorizationUrl(invalidProvider, state)
      ).rejects.toThrow('OAuth provider not configured: invalid');
    });

    test('should validate PKCE requirements during URL generation', async () => {
      const provider: OAuthProvider = 'github';
      const state = 'secure-state-123';
      const clientId = 'public-client';

      // Mock PKCE validation to throw error
      jest.spyOn(oauthService as any, 'validatePkceRequirement').mockImplementation(() => {
        throw new Error('PKCE is required for public clients');
      });

      await expect(
        (oauthService as any).generateSecureAuthorizationUrl(provider, state, undefined, clientId)
      ).rejects.toThrow('PKCE is required for public clients');
    });
  });

  describe('Security Event Logging', () => {
    test('should log all security-relevant OAuth events', async () => {
      const provider: OAuthProvider = 'microsoft';
      const state = 'secure-state-123';
      const codeChallenge = 'valid-challenge';
      const clientId = 'test-client';

      await (oauthService as any).generateSecureAuthorizationUrl(
        provider,
        state,
        codeChallenge,
        clientId
      );

      // Verify audit logging occurred
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'OAUTH_AUTHORIZATION_URL_GENERATED',
          details: expect.objectContaining({
            provider,
            pkceUsed: true
          }),
          severity: 'LOW'
        })
      );
    });

    test('should log security violations with appropriate severity levels', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const registeredUris = ['http://example.com/callback'];
      const httpUri = 'http://example.com/callback';

      (oauthService as any).validateRedirectUriStrict(registeredUris, httpUri);

      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'OAUTH_HTTP_REDIRECT_BLOCKED',
          severity: 'MEDIUM'
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('OAuth 2.1 Compliance', () => {
    test('should enforce OAuth 2.1 security requirements', async () => {
      // Test that the implementation follows OAuth 2.1 requirements:
      // 1. PKCE is mandatory for public clients
      // 2. Exact redirect URI matching
      // 3. Strong cryptographic state parameters
      // 4. Security event logging

      const provider: OAuthProvider = 'google';
      const state = 'cryptographically-secure-state-parameter';
      const codeChallenge = 'oauth21-compliant-challenge';
      const publicClientId = 'public-client';

      // Mock PKCE capability to simulate OAuth 2.1 compliant client
      jest.spyOn(oauthService as any, 'checkClientPkceCapability').mockReturnValue(true as unknown as unknown as unknown);

      const authUrl = await (oauthService as any).generateSecureAuthorizationUrl(
        provider,
        state,
        codeChallenge,
        publicClientId
      );

      // Verify OAuth 2.1 compliance features
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('code_challenge=');
      expect(authUrl).toContain('code_challenge_method=S256');
      expect(authUrl).toContain('state=');

      // Verify audit trail
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'OAUTH_AUTHORIZATION_URL_GENERATED',
          details: expect.objectContaining({
            pkceUsed: true
          })
        })
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle undefined redirect URI gracefully', () => {
      const registeredUris: string[] = [];
      const requestedUri = 'https://example.com/callback';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      expect(result).toBe(false);
    });

    test('should handle empty strings in redirect URI validation', () => {
      const registeredUris = [''];
      const requestedUri = '';

      const result = (oauthService as any).validateRedirectUriStrict(registeredUris, requestedUri);

      // Empty strings should not be considered valid redirect URIs
      expect(result).toBe(false);
    });

    test('should handle null and undefined values safely', () => {
      expect(() => {
        (oauthService as any).validatePkceRequirement(null, undefined, 'confidential');
      }).not.toThrow();

      expect(() => {
        (oauthService as any).validateRedirectUriStrict([], undefined);
      }).not.toThrow();
    });

    test('should maintain security even with malformed inputs', () => {
      const malformedInputs = [
        'javascript:alert("XSS")',
        'data:text/html,<script>alert("XSS")</script>',
        'vbscript:msgbox("XSS")',
        'file:///etc/passwd'
      ];

      malformedInputs.forEach(input => {
        const result = (oauthService as any).validateRedirectUriStrict([input], input);
        expect(result).toBe(false);
      });
    });
  });
});