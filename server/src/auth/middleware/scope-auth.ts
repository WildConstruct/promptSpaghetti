// Epic 11 Scope-Based Authorization Middleware
// Fastify middleware for API token scope validation

import { FastifyRequest, FastifyReply } from 'fastify';
import { TokenService } from '../services/TokenService';

}
}
export interface ScopeAuthOptions {
  requiredScopes: string[];
  requireAll?: boolean; // If true, user must have ALL scopes. If false, user must have AT LEAST ONE scope
  allowUser?: boolean; // If true, allow regular user tokens (not just API tokens)
}
}
}

export function createScopeAuthMiddleware(tokenService: TokenService) {
  return function scopeAuth(options: ScopeAuthOptions) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const authHeader = request.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Bearer token required'
          });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify token
        const payload = await tokenService.verifyAccessToken(token);
        const tokenType = (payload as any).type;
        const tokenScopes = (payload as any).scopes || [];

        // Check if it's an API token or regular user token
        const isApiToken = tokenType === 'api';
        const isUserToken = !tokenType || tokenType === 'user';

        // If API token, validate it's still active
        if (isApiToken) {
          const isValid = await tokenService.validateApiToken(token);
          if (!isValid) {
            return reply.status(401).send({
              error: 'Unauthorized',
              message: 'API token is invalid or revoked'
            });
          }
        }

        // Check if user tokens are allowed
        if (isUserToken && !options.allowUser) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'API token required for this endpoint'
          });
        }

        // Check scopes
        const hasRequiredScopes = checkScopes(tokenScopes, options.requiredScopes, options.requireAll);
        
        if (!hasRequiredScopes) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: `Insufficient scopes. Required: ${options.requiredScopes.join(', ')}`
          });
        }

        // Add token info to request
        (request as any).tokenInfo = {
          type: tokenType,
          scopes: tokenScopes,
          payload
        };

        // Continue to next handler
      } catch (error) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid token'
        });
      }
    };
  };
}

function checkScopes(tokenScopes: string[], requiredScopes: string[], requireAll: boolean = false): boolean {
  // If token has wildcard scope, allow everything
  if (tokenScopes.includes('*')) {
    return true;
  }

  if (requireAll) {
    // User must have ALL required scopes
    return requiredScopes.every(scope => tokenScopes.includes(scope));
  } else {
    // User must have AT LEAST ONE required scope
    return requiredScopes.some(scope => tokenScopes.includes(scope));
  }
}

// Common scope configurations
export const ScopeConfigs = {
  GRAPHS_READ: {
    requiredScopes: ['graphs:read'],
    allowUser: true
  }
  GRAPHS_WRITE: {
    requiredScopes: ['graphs:write'],
    allowUser: true
  }
  GRAPHS_EXECUTE: {
    requiredScopes: ['graphs:execute'],
    allowUser: true
  }
  GRAPHS_DELETE: {
    requiredScopes: ['graphs:delete'],
    allowUser: true
  }
  USER_READ: {
    requiredScopes: ['user:read'],
    allowUser: true
  }
  USER_WRITE: {
    requiredScopes: ['user:write'],
    allowUser: true
  }
  ADMIN_USERS: {
    requiredScopes: ['admin:users'],
    allowUser: false
  }
  ADMIN_SYSTEM: {
    requiredScopes: ['admin:system'],
    allowUser: false
  }
  ORGANIZATIONS_READ: {
    requiredScopes: ['organizations:read'],
    allowUser: true
  }
  ORGANIZATIONS_WRITE: {
    requiredScopes: ['organizations:write'],
    allowUser: true
  }
  TEAMS_READ: {
    requiredScopes: ['teams:read'],
    allowUser: true
  }
  TEAMS_WRITE: {
    requiredScopes: ['teams:write'],
    allowUser: true
  }
} as const;

// Helper function to create scope auth plugin for Fastify
export function createScopeAuthPlugin(tokenService: TokenService) {
  return function scopeAuthPlugin(fastify: any, options: any, done: any) {
    const scopeAuth = createScopeAuthMiddleware(tokenService);
    
    fastify.decorate('scopeAuth', scopeAuth);
    
    done();
  };
}

// Type augmentation for Fastify to include scopeAuth
declare module 'fastify' {
  interface FastifyInstance {
    scopeAuth: ReturnType<typeof createScopeAuthMiddleware>;
}
}
  }
}