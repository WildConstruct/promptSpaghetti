// Epic 11 API Token Routes
// HTTP routes for managing API tokens with scope-based authorization

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticationService } from '../AuthenticationService';
import { TokenService } from '../services/TokenService';

// API token creation schema
const createApiTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required').max(255),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresIn: z.string().optional().default('90d')
});

// API token revocation schema
const revokeApiTokenSchema = z.object({
  tokenId: z.string().uuid()
});

// Available scopes for API tokens
const AVAILABLE_SCOPES = [
  'graphs:read',
  'graphs:write',
  'graphs:execute',
  'graphs:delete',
  'user:read',
  'user:write',
  'organizations:read',
  'organizations:write',
  'teams:read',
  'teams:write',
  'admin:users',
  'admin:system',
  '*' // Full access (admin only)
];

interface ApiTokenRouteContext {
  authService: AuthenticationService;
  tokenService: TokenService;
}

export async function apiTokenRoutes(fastify: FastifyInstance, context: ApiTokenRouteContext) {
  const { authService, tokenService } = context;

  // Get available scopes
  fastify.get('/api-tokens/scopes', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            scopes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const scopeDescriptions = {
      'graphs:read': { description: 'Read access to graphs', category: 'graphs' },
      'graphs:write': { description: 'Create and modify graphs', category: 'graphs' },
      'graphs:execute': { description: 'Execute graphs', category: 'graphs' },
      'graphs:delete': { description: 'Delete graphs', category: 'graphs' },
      'user:read': { description: 'Read user profile information', category: 'user' },
      'user:write': { description: 'Modify user profile information', category: 'user' },
      'organizations:read': { description: 'Read organization information', category: 'organizations' },
      'organizations:write': { description: 'Modify organization information', category: 'organizations' },
      'teams:read': { description: 'Read team information', category: 'teams' },
      'teams:write': { description: 'Modify team information', category: 'teams' },
      'admin:users': { description: 'Administrative access to user management', category: 'admin' },
      'admin:system': { description: 'Administrative access to system management', category: 'admin' },
      '*': { description: 'Full access to all resources', category: 'admin' }
    };

    const scopes = AVAILABLE_SCOPES.map(scope => ({
      name: scope,
      description: scopeDescriptions[scope]?.description || 'Unknown scope',
      category: scopeDescriptions[scope]?.category || 'other'
    }));

    return reply.send({ scopes });
  });

  // Create API token
  fastify.post<{
    Body: z.infer<typeof createApiTokenSchema>;
  }>('/api-tokens', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      body: createApiTokenSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            tokenId: { type: 'string' },
            name: { type: 'string' },
            scopes: { type: 'array', items: { type: 'string' } },
            expiresAt: { type: 'string' },
            warning: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, scopes, expiresIn } = request.body as z.infer<typeof createApiTokenSchema>;
      const userId = (request.user as any)?.id;
      const userRoles = (request.user as any)?.roles || [];

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      // Validate scopes
      const invalidScopes = scopes.filter(scope => !AVAILABLE_SCOPES.includes(scope));
      if (invalidScopes.length > 0) {
        return reply.status(400).send({
          error: 'Invalid Scopes',
          message: `Invalid scopes: ${invalidScopes.join(', ')}`
        });
      }

      // Check if user has permission to create tokens with these scopes
      const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
      const hasWildcardScope = scopes.includes('*');
      const hasAdminScopes = scopes.some(scope => scope.startsWith('admin:'));

      if ((hasWildcardScope || hasAdminScopes) && !hasAdminRole) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Administrator privileges required for admin scopes'
        });
      }

      // Get user data
      const userService = authService.getService('user');
      const user = await userService.getUserById(userId);

      if (!user) {
        return reply.status(404).send({
          error: 'User Not Found',
          message: 'User not found'
        });
      }

      // Generate API token
      const { token, tokenId } = await tokenService.generateApiToken(
        user,
        scopes,
        expiresIn,
        name
      );

      // Calculate expiration date
      const decoded = require('jsonwebtoken').decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      // Log token creation
      const auditService = authService.getService('audit');
      await auditService.logEvent({
        userId,
        action: 'api_token_created',
        details: {
          tokenId,
          name,
          scopes,
          expiresAt
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        severity: 'info'
      });

      return reply.status(201).send({
        token,
        tokenId,
        name,
        scopes,
        expiresAt: expiresAt.toISOString(),
        warning: 'Store this token securely. It will not be shown again.'
      });
    } catch (error) {
      fastify.log.error('Create API token error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to create API token'
      });
    }
  });

  // Get user's API tokens
  fastify.get('/api-tokens', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            tokens: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  scopes: { type: 'array', items: { type: 'string' } },
                  expiresAt: { type: 'string' },
                  createdAt: { type: 'string' },
                  lastUsedAt: { type: 'string' },
                  revoked: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const tokens = await tokenService.getUserApiTokens(userId);

      return reply.send({
        tokens: tokens.map(token => ({
          id: token.id,
          name: token.name,
          scopes: typeof token.scopes === 'string' ? JSON.parse(token.scopes) : token.scopes,
          expiresAt: token.expiresAt?.toISOString(),
          createdAt: token.createdAt.toISOString(),
          lastUsedAt: token.lastUsedAt?.toISOString(),
          revoked: token.revoked
        }))
      });
    } catch (error) {
      fastify.log.error('Get API tokens error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve API tokens'
      });
    }
  });

  // Revoke API token
  fastify.post<{
    Body: z.infer<typeof revokeApiTokenSchema>;
  }>('/api-tokens/revoke', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      body: revokeApiTokenSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tokenId } = request.body as z.infer<typeof revokeApiTokenSchema>;
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      // Verify token belongs to user
      const userTokens = await tokenService.getUserApiTokens(userId);
      const targetToken = userTokens.find(t => t.id === tokenId);

      if (!targetToken) {
        return reply.status(404).send({
          error: 'Token Not Found',
          message: 'API token not found or does not belong to user'
        });
      }

      if (targetToken.revoked) {
        return reply.status(400).send({
          error: 'Token Already Revoked',
          message: 'API token has already been revoked'
        });
      }

      // Revoke the token
      await tokenService.revokeApiToken(tokenId);

      // Log token revocation
      const auditService = authService.getService('audit');
      await auditService.logEvent({
        userId,
        action: 'api_token_revoked',
        details: {
          tokenId,
          name: targetToken.name,
          scopes: targetToken.scopes
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        severity: 'info'
      });

      return reply.send({
        success: true,
        message: 'API token revoked successfully'
      });
    } catch (error) {
      fastify.log.error('Revoke API token error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to revoke API token'
      });
    }
  });

  // Test API token endpoint
  fastify.get('/api-tokens/test', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            tokenType: { type: 'string' },
            scopes: { type: 'array', items: { type: 'string' } },
            user: { type: 'object' },
            expiresAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const authHeader = request.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'No token provided'
        });
      }

      const payload = await tokenService.verifyAccessToken(token);
      const isApiToken = (payload as any).type === 'api';

      return reply.send({
        valid: true,
        tokenType: isApiToken ? 'api' : 'access',
        scopes: (payload as any).scopes || [],
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles
        },
        expiresAt: new Date(payload.exp * 1000).toISOString()
      });
    } catch (error) {
      fastify.log.error('Test API token error:', error);
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
  });

  // API token usage statistics
  fastify.get('/api-tokens/stats', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            totalTokens: { type: 'number' },
            activeTokens: { type: 'number' },
            revokedTokens: { type: 'number' },
            expiredTokens: { type: 'number' },
            recentlyUsed: { type: 'array' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const dbService = authService.getService('database');
      const result = await dbService.query(`
        SELECT 
          COUNT(*) as total_tokens,
          COUNT(CASE WHEN NOT revoked AND expires_at > NOW() THEN 1 END) as active_tokens,
          COUNT(CASE WHEN revoked THEN 1 END) as revoked_tokens,
          COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_tokens
        FROM api_tokens
        WHERE user_id = $1
      `, [userId]);

      const stats = result.rows[0];

      // Get recently used tokens
      const recentResult = await dbService.query(`
        SELECT name, last_used_at, scopes
        FROM api_tokens
        WHERE user_id = $1 AND last_used_at IS NOT NULL
        ORDER BY last_used_at DESC
        LIMIT 5
      `, [userId]);

      const recentlyUsed = recentResult.rows.map(row => ({
        name: row.name,
        lastUsedAt: row.last_used_at,
        scopes: typeof row.scopes === 'string' ? JSON.parse(row.scopes) : row.scopes
      }));

      return reply.send({
        totalTokens: parseInt(stats.total_tokens),
        activeTokens: parseInt(stats.active_tokens),
        revokedTokens: parseInt(stats.revoked_tokens),
        expiredTokens: parseInt(stats.expired_tokens),
        recentlyUsed
      });
    } catch (error) {
      fastify.log.error('Get API token stats error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve token statistics'
      });
    }
  });
}