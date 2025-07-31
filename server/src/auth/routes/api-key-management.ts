/**
 * API Key Management Routes - Epic 17 Backstage Admin Controls
 * 
 * Comprehensive API key lifecycle management endpoints for Epic 17.4.4 API Management.
 * Provides secure key generation, validation, rotation, and comprehensive audit logging.
 * 
 * Task: E17-1753114397219-575289 - Implement key management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ApiKeyManagementService, CreateApiKeyRequest, ApiKeyValidationResult } from '../services/ApiKeyManagementService';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../services/AuditService';
import { RateLimitService } from '../services/RateLimitService';

// Validation schemas
const createApiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(255),
  description: z.string().optional(),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expirationDays: z.number().min(1).max(3650).optional(), // 1 day to 10 years
  rateLimits: z.object({
    requestsPerMinute: z.number().min(1).max(10000).optional(),
    requestsPerHour: z.number().min(1).max(500000).optional(),
    requestsPerDay: z.number().min(1).max(10000000).optional()
  }).optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
  purpose: z.string().min(1, 'Purpose is required').max(500)
});

const rotateApiKeySchema = z.object({
  keyId: z.string().uuid('Invalid key ID format')
});

const revokeApiKeySchema = z.object({
  keyId: z.string().uuid('Invalid key ID format'),
  reason: z.string().optional()
});

const validateApiKeySchema = z.object({
  requiredScope: z.string().optional(),
  ipAddress: z.string().ip().optional()
});

// Available scopes for API keys
const AVAILABLE_SCOPES = [
  'read:user',
  'write:user',
  'read:graphs',
  'write:graphs',
  'read:analytics',
  'write:analytics',
  'read:organizations',
  'write:organizations',
  'admin:users',
  'admin:system',
  'admin:keys', // For key management operations
  '*' // Full access (super admin only)
];

}
}
interface ApiKeyManagementRouteContext {
  databaseService: DatabaseService;
  auditService: AuditService;
  rateLimitService: RateLimitService;
}
}
}

export async function apiKeyManagementRoutes(
  fastify: FastifyInstance,
  context: ApiKeyManagementRouteContext
) {
  const { databaseService, auditService, rateLimitService } = context;
  
  // Initialize ApiKeyManagementService
  const apiKeyService = new ApiKeyManagementService(
    databaseService,
    auditService,
    rateLimitService
  );

  // Get available scopes for API keys
  fastify.get('/api-keys/scopes', {
    preHandler: [fastify.authenticate],
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
      'read:user': { description: 'Read user profile information', category: 'user' },
      'write:user': { description: 'Modify user profile information', category: 'user' },
      'read:graphs': { description: 'Read access to graphs', category: 'graphs' },
      'write:graphs': { description: 'Create and modify graphs', category: 'graphs' },
      'read:analytics': { description: 'Read analytics data', category: 'analytics' },
      'write:analytics': { description: 'Modify analytics settings', category: 'analytics' },
      'read:organizations': { description: 'Read organization information', category: 'organizations' },
      'write:organizations': { description: 'Modify organization information', category: 'organizations' },
      'admin:users': { description: 'Administrative access to user management', category: 'admin' },
      'admin:system': { description: 'Administrative access to system management', category: 'admin' },
      'admin:keys': { description: 'API key management permissions', category: 'admin' },
      '*': { description: 'Full access to all resources', category: 'admin' }
    };

    const scopes = AVAILABLE_SCOPES.map(scope => ({
      name: scope,
      description: scopeDescriptions[scope]?.description || 'Unknown scope',
      category: scopeDescriptions[scope]?.category || 'other'
    }));

    return reply.send({ scopes });
  });

  // Create new API key
  fastify.post<{
    Body: z.infer<typeof createApiKeySchema>;
  }>('/api-keys', {
    preHandler: [fastify.authenticate],
    schema: {
      body: createApiKeySchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            apiKey: {
              type: 'object',
              properties: {
                keyId: { type: 'string' },
                keyPrefix: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                scopes: { type: 'array', items: { type: 'string' } },
                expiresAt: { type: 'string' },
                createdAt: { type: 'string' },
                rateLimits: { type: 'object' },
                status: { type: 'string' }
              }
  }
            rawKey: { type: 'string' },
            warning: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as z.infer<typeof createApiKeySchema>;
      const userId = (request.user as any)?.id;
      const userRoles = (request.user as any)?.roles || [];
      const createdBy = (request.user as any)?.email || userId;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      // Validate scopes
      const invalidScopes = body.scopes.filter(scope => !AVAILABLE_SCOPES.includes(scope));
      if (invalidScopes.length > 0) {
        return reply.status(400).send({
          error: 'Invalid Scopes',
          message: `Invalid scopes: ${invalidScopes.join(', ')}`,
          availableScopes: AVAILABLE_SCOPES
        });
      }

      // Check permissions for admin scopes
      const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
      const hasWildcardScope = body.scopes.includes('*');
      const hasAdminScopes = body.scopes.some(scope => scope.startsWith('admin:'));

      if ((hasWildcardScope || hasAdminScopes) && !hasAdminRole) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Administrator privileges required for admin scopes'
        });
      }

      // Create API key
      const createRequest: CreateApiKeyRequest = {
        name: body.name,
        description: body.description,
        scopes: body.scopes,
        expirationDays: body.expirationDays,
        rateLimits: body.rateLimits,
        ipWhitelist: body.ipWhitelist,
        purpose: body.purpose
      };

      const { apiKey, rawKey } = await apiKeyService.createApiKey(userId, createRequest, createdBy);

      return reply.status(201).send({
        success: true,
        apiKey: {
          keyId: apiKey.keyId,
          keyPrefix: apiKey.keyPrefix,
          name: apiKey.name,
          description: apiKey.description,
          scopes: apiKey.scopes,
          expiresAt: apiKey.expiresAt?.toISOString(),
          createdAt: apiKey.createdAt.toISOString(),
          rateLimits: apiKey.rateLimits,
          status: apiKey.status
  }
        rawKey,
        warning: 'Store this API key securely. It will not be shown again.'
      });

    } catch (error) {
      fastify.log.error('Create API key error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to create API key'
      });
    }
  });

  // Get user's API keys
  fastify.get('/api-keys', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          includeInactive: { type: 'boolean', default: false }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            apiKeys: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  keyId: { type: 'string' },
                  keyPrefix: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  scopes: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string' },
                  createdAt: { type: 'string' },
                  expiresAt: { type: 'string' },
                  lastUsedAt: { type: 'string' },
                  rateLimits: { type: 'object' },
                  metadata: { type: 'object' }
                }
              }
  }
            count: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { includeInactive } = request.query as any;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      const apiKeys = await apiKeyService.getUserApiKeys(userId, { includeInactive });

      return reply.send({
        apiKeys: apiKeys.map(key => ({
          keyId: key.keyId,
          keyPrefix: key.keyPrefix,
          name: key.name,
          description: key.description,
          scopes: key.scopes,
          status: key.status,
          createdAt: key.createdAt.toISOString(),
          expiresAt: key.expiresAt?.toISOString(),
          lastUsedAt: key.lastUsedAt?.toISOString(),
          rateLimits: key.rateLimits,
          metadata: key.metadata
        })),
        count: apiKeys.length
      });

    } catch (error) {
      fastify.log.error('Get API keys error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve API keys'
      });
    }
  });

  // Validate API key
  fastify.post<{
    Body: { apiKey: string } & z.infer<typeof validateApiKeySchema>;
  }>('/api-keys/validate', {
    schema: {
      body: {
        type: 'object',
        properties: {
          apiKey: { type: 'string' },
          requiredScope: { type: 'string' },
          ipAddress: { type: 'string' }
  }
        required: ['apiKey']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            keyId: { type: 'string' },
            userId: { type: 'string' },
            scopes: { type: 'array', items: { type: 'string' } },
            rateLimitStatus: { type: 'object' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { apiKey, requiredScope, ipAddress } = request.body as any;
      const clientIp = ipAddress || request.ip;

      const validationResult = await apiKeyService.validateApiKey(
        apiKey,
        requiredScope,
        clientIp
      );

      return reply.send(validationResult);

    } catch (error) {
      fastify.log.error('Validate API key error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to validate API key'
      });
    }
  });

  // Rotate API key
  fastify.post<{
    Body: z.infer<typeof rotateApiKeySchema>;
  }>('/api-keys/rotate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: rotateApiKeySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            rotation: {
              type: 'object',
              properties: {
                oldKeyId: { type: 'string' },
                newKeyId: { type: 'string' },
                rotatedAt: { type: 'string' },
                rotationCount: { type: 'number' }
              }
  }
            newApiKey: {
              type: 'object',
              properties: {
                keyId: { type: 'string' },
                keyPrefix: { type: 'string' },
                name: { type: 'string' },
                scopes: { type: 'array', items: { type: 'string' } },
                expiresAt: { type: 'string' },
                createdAt: { type: 'string' }
              }
  }
            rawKey: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { keyId } = request.body as z.infer<typeof rotateApiKeySchema>;
      const userId = (request.user as any)?.id;
      const rotatedBy = (request.user as any)?.email || userId;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      // Verify key ownership
      const userKeys = await apiKeyService.getUserApiKeys(userId);
      const targetKey = userKeys.find(key => key.keyId === keyId);

      if (!targetKey) {
        return reply.status(404).send({
          error: 'API Key Not Found',
          message: 'API key not found or does not belong to user'
        });
      }

      const rotationResult = await apiKeyService.rotateApiKey(keyId, rotatedBy);

      if (!rotationResult) {
        return reply.status(400).send({
          error: 'Rotation Failed',
          message: 'Failed to rotate API key. Key may be inactive or invalid.'
        });
      }

      const { newApiKey, rawKey } = rotationResult;

      return reply.send({
        success: true,
        rotation: {
          oldKeyId: keyId,
          newKeyId: newApiKey.keyId,
          rotatedAt: new Date().toISOString(),
          rotationCount: newApiKey.metadata.rotationCount
  }
        newApiKey: {
          keyId: newApiKey.keyId,
          keyPrefix: newApiKey.keyPrefix,
          name: newApiKey.name,
          scopes: newApiKey.scopes,
          expiresAt: newApiKey.expiresAt?.toISOString(),
          createdAt: newApiKey.createdAt.toISOString()
  }
        rawKey,
        message: 'API key rotated successfully. Old key will be revoked in 24 hours.'
      });

    } catch (error) {
      fastify.log.error('Rotate API key error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to rotate API key'
      });
    }
  });

  // Revoke API key
  fastify.post<{
    Body: z.infer<typeof revokeApiKeySchema>;
  }>('/api-keys/revoke', {
    preHandler: [fastify.authenticate],
    schema: {
      body: revokeApiKeySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            revokedAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { keyId, reason } = request.body as z.infer<typeof revokeApiKeySchema>;
      const userId = (request.user as any)?.id;
      const revokedBy = (request.user as any)?.email || userId;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }

      // Verify key ownership
      const userKeys = await apiKeyService.getUserApiKeys(userId, { includeInactive: true });
      const targetKey = userKeys.find(key => key.keyId === keyId);

      if (!targetKey) {
        return reply.status(404).send({
          error: 'API Key Not Found',
          message: 'API key not found or does not belong to user'
        });
      }

      if (targetKey.status === 'revoked') {
        return reply.status(400).send({
          error: 'Key Already Revoked',
          message: 'API key has already been revoked'
        });
      }

      const success = await apiKeyService.revokeApiKey(keyId, revokedBy, reason);

      if (!success) {
        return reply.status(500).send({
          error: 'Revocation Failed',
          message: 'Failed to revoke API key'
        });
      }

      return reply.send({
        success: true,
        message: 'API key revoked successfully',
        revokedAt: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Revoke API key error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to revoke API key'
      });
    }
  });

  // Get API key statistics
  fastify.get('/api-keys/statistics', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            statistics: {
              type: 'object',
              properties: {
                totalKeys: { type: 'number' },
                activeKeys: { type: 'number' },
                expiredKeys: { type: 'number' },
                revokedKeys: { type: 'number' },
                keysUsedLast24Hours: { type: 'number' },
                topScopes: { type: 'array' },
                averageKeyAge: { type: 'number' }
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

      const statistics = await apiKeyService.getStatistics(userId);

      return reply.send({ statistics });

    } catch (error) {
      fastify.log.error('Get API key statistics error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve API key statistics'
      });
    }
  });

  // Admin: Get global API key statistics (requires admin role)
  fastify.get('/api-keys/admin/statistics', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            globalStatistics: {
              type: 'object',
              properties: {
                totalKeys: { type: 'number' },
                activeKeys: { type: 'number' },
                expiredKeys: { type: 'number' },
                revokedKeys: { type: 'number' },
                keysUsedLast24Hours: { type: 'number' },
                topScopes: { type: 'array' },
                averageKeyAge: { type: 'number' }
              }
  }
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const globalStatistics = await apiKeyService.getStatistics(); // No userId = global stats

      return reply.send({
        globalStatistics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Get global API key statistics error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve global API key statistics'
      });
    }
  });

  // Admin: Get all API keys (requires admin role)
  fastify.get('/api-keys/admin/all', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'revoked', 'expired', 'suspended'] },
          limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'number', minimum: 0, default: 0 },
          sortBy: { type: 'string', enum: ['createdAt', 'lastUsedAt', 'totalCalls'], default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            apiKeys: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                limit: { type: 'number' },
                offset: { type: 'number' },
                hasMore: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status, limit, offset, sortBy, sortOrder } = request.query as any;
      
      const result = await apiKeyService.getAllApiKeys({
        status,
        limit: limit || 100,
        offset: offset || 0,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      });

      return reply.send(result);

    } catch (error) {
      fastify.log.error('Get all API keys error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve all API keys'
      });
    }
  });

  // Admin: Get usage metrics for all keys (requires admin role)
  fastify.get('/api-keys/admin/metrics', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeRange: { type: 'string', enum: ['1h', '24h', '7d', '30d'], default: '24h' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { timeRange } = request.query as any;
      
      const metrics = await apiKeyService.getUsageMetrics(timeRange || '24h');
      
      return reply.send({ metrics });

    } catch (error) {
      fastify.log.error('Get usage metrics error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve usage metrics'
      });
    }
  });

  // Admin: Get real-time security alerts (requires admin role)
  fastify.get('/api-keys/admin/alerts', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const alerts = await apiKeyService.getSecurityAlerts();
      
      return reply.send({ alerts });

    } catch (error) {
      fastify.log.error('Get security alerts error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve security alerts'
      });
    }
  });

  // Admin: Revoke API key with reason (requires admin role)
  fastify.post('/api-keys/admin/revoke', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ],
    schema: {
      body: {
        type: 'object',
        properties: {
          keyId: { type: 'string' },
          reason: { type: 'string' }
  }
        required: ['keyId', 'reason']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { keyId, reason } = request.body as any;
      const adminUserId = (request.user as any)?.id;
      const adminEmail = (request.user as any)?.email || adminUserId;

      const success = await apiKeyService.adminRevokeApiKey(keyId, adminEmail, reason);

      if (!success) {
        return reply.status(400).send({
          error: 'Revocation Failed',
          message: 'Failed to revoke API key'
        });
      }

      return reply.send({
        success: true,
        message: 'API key revoked successfully',
        revokedAt: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Admin revoke API key error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to revoke API key'
      });
    }
  });

  // Admin: Suspend API key (requires admin role)
  fastify.post('/api-keys/admin/suspend', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ],
    schema: {
      body: {
        type: 'object',
        properties: {
          keyId: { type: 'string' },
          reason: { type: 'string' },
          duration: { type: 'string' } // e.g., '24h', '7d', 'permanent'
  }
        required: ['keyId', 'reason']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { keyId, reason, duration } = request.body as any;
      const adminUserId = (request.user as any)?.id;
      const adminEmail = (request.user as any)?.email || adminUserId;

      const success = await apiKeyService.suspendApiKey(keyId, adminEmail, reason, duration);

      if (!success) {
        return reply.status(400).send({
          error: 'Suspension Failed',
          message: 'Failed to suspend API key'
        });
      }

      return reply.send({
        success: true,
        message: 'API key suspended successfully',
        suspendedAt: new Date().toISOString(),
        duration: duration || 'permanent'
      });

    } catch (error) {
      fastify.log.error('Admin suspend API key error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to suspend API key'
      });
    }
  });

  // Admin: Update rate limits for API key (requires admin role)
  fastify.put('/api-keys/admin/rate-limits', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ],
    schema: {
      body: {
        type: 'object',
        properties: {
          keyId: { type: 'string' },
          rateLimits: {
            type: 'object',
            properties: {
              requestsPerMinute: { type: 'number', minimum: 1 },
              requestsPerHour: { type: 'number', minimum: 1 },
              requestsPerDay: { type: 'number', minimum: 1 }
  }
            required: ['requestsPerMinute', 'requestsPerHour', 'requestsPerDay']
          }
  }
        required: ['keyId', 'rateLimits']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { keyId, rateLimits } = request.body as any;
      const adminUserId = (request.user as any)?.id;
      const adminEmail = (request.user as any)?.email || adminUserId;

      const success = await apiKeyService.updateRateLimits(keyId, rateLimits, adminEmail);

      if (!success) {
        return reply.status(400).send({
          error: 'Update Failed',
          message: 'Failed to update rate limits'
        });
      }

      return reply.send({
        success: true,
        message: 'Rate limits updated successfully',
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Admin update rate limits error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update rate limits'
      });
    }
  });

  // Admin: Bulk operations on API keys (requires admin role)
  fastify.post('/api-keys/admin/bulk', {
    preHandler: [
      fastify.authenticate,
      async (request: FastifyRequest, reply: FastifyReply) => {
        const userRoles = (request.user as any)?.roles || [];
        const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
        
        if (!hasAdminRole) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Administrator privileges required'
          });
        }
      }
    ],
    schema: {
      body: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['revoke', 'suspend', 'rate_limit'] },
          keyIds: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 100 },
          parameters: { type: 'object' } // Operation-specific parameters
  }
        required: ['operation', 'keyIds']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { operation, keyIds, parameters } = request.body as any;
      const adminUserId = (request.user as any)?.id;
      const adminEmail = (request.user as any)?.email || adminUserId;

      const result = await apiKeyService.performBulkOperation(
        operation,
        keyIds,
        parameters,
        adminEmail
      );

      return reply.send({
        success: true,
        operation,
        processedCount: result.processedCount,
        failedCount: result.failedCount,
        results: result.results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      fastify.log.error('Admin bulk operation error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to perform bulk operation'
      });
    }
  });

  // Health check for API key management service
  fastify.get('/api-keys/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthCheck = await databaseService.healthCheck();
      
      return reply.send({
        status: healthCheck ? 'healthy' : 'unhealthy',
        service: 'api_key_management',
        timestamp: new Date().toISOString(),
        features: [
          'API key generation with secure random keys',
          'Comprehensive scope-based authorization',
          'Configurable rate limiting per key',
          'IP whitelist support',
          'Automatic key rotation with grace periods',
          'Detailed audit logging and compliance tracking',
          'Key expiration management',
          'Usage statistics and analytics',
          'Admin management interface with bulk operations',
          'Real-time security monitoring and alerts',
          'Advanced usage analytics and reporting'
        ]
      });

    } catch (error) {
      fastify.log.error('API key management health check failed:', error);
      return reply.status(503).send({
        status: 'unhealthy',
        service: 'api_key_management',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });
}