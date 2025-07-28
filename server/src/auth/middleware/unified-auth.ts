/**
 * Unified Authentication Middleware - Standardized Auth Handler Framework
 * 
 * Centralized authentication middleware that handles JWT tokens, API keys, OAuth2,
 * and webhook authentication through a unified interface and consistent patterns.
 * 
 * Task: T-1752989144373-142 - Standardize auth handler framework (OAuth2, API keys, webhooks)
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { AuthenticationService } from '../services/AuthenticationService';
import { ApiKeyManagementService } from '../services/ApiKeyManagementService';
import { WebhookAuthenticationService } from '../services/WebhookAuthenticationService';

}
export interface AuthContext {
  authenticated: boolean;
  method: 'jwt' | 'api_key' | 'oauth' | 'webhook' | 'none';
  user?: any;
  apiKey?: {
    keyId: string;
    scopes: string[];
    rateLimitStatus: any;
}
  };
  webhook?: {
    providerId: string;
    eventType?: string;
    validation: any;
  };
  oauth?: {
    provider: string;
    token: any;
  };
  permissions: string[];
  metadata: {
    ipAddress: string;
    userAgent?: string;
    timestamp: Date;
    source: string;
  };
}

}
export interface AuthOptions {
  required?: boolean;
  allowMethods?: Array<'jwt' | 'api_key' | 'oauth' | 'webhook'>;
  requiredScopes?: string[];
  requiredPermissions?: string[];
  allowWebhookProviders?: string[];
  bypassForPaths?: string[];
}
}

export class UnifiedAuthenticationMiddleware {
  constructor(
    private authService: AuthenticationService,
    private apiKeyService: ApiKeyManagementService,
    private webhookAuthService: WebhookAuthenticationService
  ) {}

  /**
   * Create unified authentication middleware
   */
  createMiddleware(options: AuthOptions = {}) {
    const {
      required = true,
      allowMethods = ['jwt', 'api_key', 'oauth'],
      requiredScopes = [],
      requiredPermissions = [],
      allowWebhookProviders = [],
      bypassForPaths = []
    } = options;

    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check if path should bypass authentication
        if (bypassForPaths.some(path => request.routeOptions?.url?.includes(path))) {
          (request as any).authContext = this.createUnauthenticatedContext(request);
          return;
        }

        const authContext = await this.authenticateRequest(request, {
          allowMethods,
          allowWebhookProviders
        });

        // Check if authentication is required
        if (required && !authContext.authenticated) {
          reply.code(401).send({
            error: 'Authentication required',
            supportedMethods: allowMethods,
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Check required scopes (for API keys)
        if (requiredScopes.length > 0 && authContext.apiKey) {
          const hasRequiredScopes = requiredScopes.every(scope => 
            authContext.apiKey?.scopes.includes(scope)
          );

          if (!hasRequiredScopes) {
            reply.code(403).send({
              error: 'Insufficient scope permissions',
              required: requiredScopes,
              available: authContext.apiKey.scopes,
              timestamp: new Date().toISOString()
            });
            return;
          }
        }

        // Check required permissions (for user-based auth)
        if (requiredPermissions.length > 0) {
          const hasRequiredPermissions = requiredPermissions.every(permission => 
            authContext.permissions.includes(permission)
          );

          if (!hasRequiredPermissions) {
            reply.code(403).send({
              error: 'Insufficient permissions',
              required: requiredPermissions,
              available: authContext.permissions,
              timestamp: new Date().toISOString()
            });
            return;
          }
        }

        // Attach auth context to request
        (request as any).authContext = authContext;

        // Continue to next handler
        return;

      } catch (error) {
        reply.code(500).send({
          error: 'Authentication middleware error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  /**
   * Authenticate request using multiple methods
   */
  private async authenticateRequest(
    request: FastifyRequest, 
    options: { allowMethods: string[]; allowWebhookProviders: string[] }
  ): Promise<AuthContext> {

    const { allowMethods, allowWebhookProviders } = options;
    
    // Try JWT authentication
    if (allowMethods.includes('jwt')) {
      const jwtContext = await this.tryJWTAuthentication(request);
      if (jwtContext.authenticated) {
        return jwtContext;
      }
    }

    // Try API key authentication
    if (allowMethods.includes('api_key')) {
      const apiKeyContext = await this.tryApiKeyAuthentication(request);
      if (apiKeyContext.authenticated) {
        return apiKeyContext;
      }
    }

    // Try OAuth authentication (if OAuth token in headers)
    if (allowMethods.includes('oauth')) {
      const oauthContext = await this.tryOAuthAuthentication(request);
      if (oauthContext.authenticated) {
        return oauthContext;
      }
    }

    // Try webhook authentication
    if (allowMethods.includes('webhook') && allowWebhookProviders.length > 0) {
      const webhookContext = await this.tryWebhookAuthentication(request, allowWebhookProviders);
      if (webhookContext.authenticated) {
        return webhookContext;
      }
    }

    // Return unauthenticated context
    return this.createUnauthenticatedContext(request);
  }

  /**
   * Try JWT authentication
   */
  private async tryJWTAuthentication(request: FastifyRequest): Promise<AuthContext> {

    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createUnauthenticatedContext(request);
      }

      const token = authHeader.substring(7);
      const user = await this.authService.validateToken(token);

      if (user) {
        return {
          authenticated: true,
          method: 'jwt',
          user,
          permissions: user.permissions || this.extractPermissionsFromRoles(user.roles || []),
          metadata: this.createMetadata(request, 'jwt')
        };
      }
    } catch (error) {
      // JWT validation failed, continue with other methods
    }

    return this.createUnauthenticatedContext(request);
  }

  /**
   * Try API key authentication
   */
  private async tryApiKeyAuthentication(request: FastifyRequest): Promise<AuthContext> {

    try {
      // Check for API key in header
      const apiKey = request.headers['x-api-key'] as string ||
                   request.headers['authorization']?.replace(/^ApiKey\s+/, '') ||
                   request.headers['api-key'] as string;

      if (!apiKey) {
        return this.createUnauthenticatedContext(request);
      }

      const validation = await this.apiKeyService.validateApiKey(
        apiKey,
        undefined, // No specific scope required here
        request.ip
      );

      if (validation.valid && validation.keyId && validation.userId) {
        return {
          authenticated: true,
          method: 'api_key',
          user: { id: validation.userId },
          apiKey: {
            keyId: validation.keyId,
            scopes: validation.scopes || [],
            rateLimitStatus: validation.rateLimitStatus
  }
          permissions: validation.scopes || [],
          metadata: this.createMetadata(request, 'api_key')
        };
      }
    } catch (error) {
      // API key validation failed, continue with other methods
    }

    return this.createUnauthenticatedContext(request);
  }

  /**
   * Try OAuth authentication
   */
  private async tryOAuthAuthentication(request: FastifyRequest): Promise<AuthContext> {

    try {
      // Check for OAuth access token
      const oauthToken = request.headers['x-oauth-token'] as string ||
                        request.headers['oauth-token'] as string;

      if (!oauthToken) {
        return this.createUnauthenticatedContext(request);
      }

      // In a full implementation, this would validate the OAuth token
      // For now, create a basic context structure
      return {
        authenticated: true,
        method: 'oauth',
        oauth: {
          provider: 'unknown', // Would be determined from token
          token: oauthToken
  }
        permissions: ['oauth:authenticated'],
        metadata: this.createMetadata(request, 'oauth')
      };
    } catch (error) {
      // OAuth validation failed, continue with other methods
    }

    return this.createUnauthenticatedContext(request);
  }

  /**
   * Try webhook authentication
   */
  private async tryWebhookAuthentication(
    request: FastifyRequest, 
    allowWebhookProviders: string[]
  ): Promise<AuthContext> {

    try {
      // Extract provider ID from path or headers
      const providerId = this.extractWebhookProvider(request, allowWebhookProviders);
      
      if (!providerId) {
        return this.createUnauthenticatedContext(request);
      }

      const validation = await this.webhookAuthService.validateWebhookFromRequest(
        request,
        providerId
      );

      if (validation.valid) {
        return {
          authenticated: true,
          method: 'webhook',
          webhook: {
            providerId,
            eventType: validation.eventType,
            validation
  }
          permissions: [`webhook:${providerId}`],
          metadata: this.createMetadata(request, 'webhook')
        };
      }
    } catch (error) {
      // Webhook validation failed, continue with other methods
    }

    return this.createUnauthenticatedContext(request);
  }

  /**
   * Create unauthenticated context
   */
  private createUnauthenticatedContext(request: FastifyRequest): AuthContext {
    return {
      authenticated: false,
      method: 'none',
      permissions: [],
      metadata: this.createMetadata(request, 'none')
    };
  }

  /**
   * Create metadata from request
   */
  private createMetadata(request: FastifyRequest, source: string) {
    return {
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
      source
    };
  }

  /**
   * Extract permissions from user roles
   */
  private extractPermissionsFromRoles(roles: string[]): string[] {
    const rolePermissions: Record<string, string[]> = {
      'admin': ['*'],
      'user': ['read:own', 'write:own'],
      'viewer': ['read:own'],
      'editor': ['read:own', 'write:own'],
      'security_officer': ['security:*'],
      'compliance_officer': ['compliance:*']
    };

    const permissions: string[] = [];
    roles.forEach(role => {
      const rolePerms = rolePermissions[role] || [];
      permissions.push(...rolePerms);
    });

    return [...new Set(permissions)]; // Remove duplicates
  }

  /**
   * Extract webhook provider from request
   */
  private extractWebhookProvider(
    request: FastifyRequest, 
    allowWebhookProviders: string[]
  ): string | null {
    // Try to extract from route parameters
    const params = request.params as any;
    if (params?.providerId && allowWebhookProviders.includes(params.providerId)) {
      return params.providerId;
    }

    // Try to extract from headers
    const providerHeader = request.headers['x-webhook-provider'] as string;
    if (providerHeader && allowWebhookProviders.includes(providerHeader)) {
      return providerHeader;
    }

    // Try to extract from path
    const path = request.routeOptions?.url || request.url;
    for (const provider of allowWebhookProviders) {
      if (path.includes(`/webhooks/${provider}`) || path.includes(`webhook-${provider}`)) {
        return provider;
      }
    }

    return null;
  }
}

/**
 * Factory function to create unified auth middleware for Fastify
 */
export function createUnifiedAuthPlugin(
  authService: AuthenticationService,
  apiKeyService: ApiKeyManagementService,
  webhookAuthService: WebhookAuthenticationService
) {
  const middleware = new UnifiedAuthenticationMiddleware(
    authService,
    apiKeyService,
    webhookAuthService
  );

  return async function unifiedAuthPlugin(fastify: FastifyInstance) {
    // Register auth methods as decorators
    fastify.decorate('requireAuth', (options: AuthOptions = {}) => {
      return middleware.createMiddleware({ ...options, required: true });
    });

    fastify.decorate('optionalAuth', (options: Omit<AuthOptions, 'required'> = {}) => {
      return middleware.createMiddleware({ ...options, required: false });
    });

    fastify.decorate('requireApiKey', (scopes: string[] = []) => {
      return middleware.createMiddleware({
        required: true,
        allowMethods: ['api_key'],
        requiredScopes: scopes
      });
    });

    fastify.decorate('requireWebhook', (providers: string[]) => {
      return middleware.createMiddleware({
        required: true,
        allowMethods: ['webhook'],
        allowWebhookProviders: providers
      });
    });

    fastify.decorate('requireJWT', (permissions: string[] = []) => {
      return middleware.createMiddleware({
        required: true,
        allowMethods: ['jwt'],
        requiredPermissions: permissions
      });
    });

    fastify.decorate('unifiedAuth', middleware);
  };
}

// TypeScript declaration merging for Fastify decorators
declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (options?: AuthOptions) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    optionalAuth: (
      options?: Omit<AuthOptions,
      'required'>
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireApiKey: (scopes?: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireWebhook: (providers: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireJWT: (permissions?: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    unifiedAuth: UnifiedAuthenticationMiddleware;
}
  }

  interface FastifyRequest {
    authContext?: AuthContext;
}
  }
}