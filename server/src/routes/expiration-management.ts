/**
 * Expiration Management API Routes
 * 
 * Provides REST endpoints for managing authentication resource expiration:
 * - Create and manage expiration policies
 * - Check expiration status of resources
 * - Renew expiring resources
 * - Get expiration statistics and warnings
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ExpirationManagementService, ExpirationPolicy, RenewalRequest } from '../auth/services/ExpirationManagementService';
import { DatabaseConnection } from '../database/connection';
import { AuditService } from '../auth/services/AuditService';
import { RedisService } from '../auth/database/RedisService';
import { requirePermission } from '../middleware/auth';

}
}
interface CreatePolicyBody {
  name: string;
  resourceType: 'jwt_token' | 'api_key' | 'session' | 'reset_token' | 'verification_code' | 'backup_code' | 'refresh_token';
  defaultTtl: number;
  maxTtl?: number;
  minTtl?: number;
  gracePeriod?: number;
  warningThreshold: number;
  autoRenewal: boolean;
  renewalWindow: number;
  organizationId?: string;
}
}
}

}
}
interface CreateExpirationRuleBody {
  resourceId: string;
  resourceType: string;
  policyId: string;
  customTtl?: number;
  metadata?: Record<string, unknown>;
}
}
}

}
}
interface ExpirationStatusParams {
  resourceType: string;
  resourceId: string;
}
}
}

}
}
interface RenewResourceBody {
  requestedTtl?: number;
  reason?: string;
}
}
}

}
}
interface RenewResourceParams {
  resourceType: string;
  resourceId: string;
}
}
}

}
}
interface RevokeResourceBody {
  reason?: string;
}
}
}

}
}
interface ExpirationStatsQuery {
  organizationId?: string;
}
}
}

}
}
interface UpcomingWarningsQuery {
  organizationId?: string;
  limit?: string;
}
}
}

export async function expirationManagementRoutes(fastify: FastifyInstance) {
  const db = fastify.db as DatabaseConnection;
  const auditService = new AuditService(db);
  
  let redisService: RedisService | undefined;
  try {
    redisService = RedisService.getInstance();
  } catch (error) {
    fastify.log.warn('Redis not available for expiration management');
  }

  const expirationService = ExpirationManagementService.getInstance(db, auditService, redisService);

  // Initialize the service
  fastify.addHook('onReady', async () => {
    await expirationService.initialize();
  });

  // Shutdown hook
  fastify.addHook('onClose', async () => {
    await expirationService.shutdown();
  });

  /**
   * POST /api/expiration/policies
   * Create a new expiration policy
   */
  fastify.post<{
    Body: CreatePolicyBody;
  }>('/policies', {
    preHandler: requirePermission('perm_manage_expiration'),
    schema: {
      body: {
        type: 'object',
        required: ['name', 'resourceType', 'defaultTtl', 'warningThreshold', 'autoRenewal', 'renewalWindow'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          resourceType: {
            type: 'string',
            enum: ['jwt_token', 'api_key', 'session', 'reset_token', 'verification_code', 'backup_code', 'refresh_token']
  }
          defaultTtl: { type: 'number', minimum: 60 }, // At least 1 minute
          maxTtl: { type: 'number', minimum: 60 },
          minTtl: { type: 'number', minimum: 30 },
          gracePeriod: { type: 'number', minimum: 0 },
          warningThreshold: { type: 'number', minimum: 60 },
          autoRenewal: { type: 'boolean' },
          renewalWindow: { type: 'number', minimum: 60 },
          organizationId: { type: 'string' }
        }
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            policy: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                resourceType: { type: 'string' },
                defaultTtl: { type: 'number' },
                warningThreshold: { type: 'number' },
                autoRenewal: { type: 'boolean' },
                createdAt: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreatePolicyBody }>, reply: FastifyReply) => {
    try {
      const policy = await expirationService.createPolicy({
        ...request.body,
        isActive: true
      });

      return reply.code(201).send({
        success: true,
        policy
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to create expiration policy');
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create policy'
      });
    }
  });

  /**
   * POST /api/expiration/rules
   * Create an expiration rule for a resource
   */
  fastify.post<{
    Body: CreateExpirationRuleBody;
  }>('/rules', {
    preHandler: requirePermission('perm_manage_expiration'),
    schema: {
      body: {
        type: 'object',
        required: ['resourceId', 'resourceType', 'policyId'],
        properties: {
          resourceId: { type: 'string' },
          resourceType: { type: 'string' },
          policyId: { type: 'string' },
          customTtl: { type: 'number', minimum: 60 },
          metadata: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateExpirationRuleBody }>, reply: FastifyReply) => {
    try {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ success: false, error: 'User not authenticated' });
      }

      const rule = await expirationService.createExpirationRule(
        request.body.resourceId,
        request.body.resourceType,
        request.body.policyId,
        request.body.customTtl,
        user.id,
        request.body.metadata
      );

      return reply.code(201).send({
        success: true,
        rule
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to create expiration rule');
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create expiration rule'
      });
    }
  });

  /**
   * GET /api/expiration/status/:resourceType/:resourceId
   * Check expiration status of a resource
   */
  fastify.get<{
    Params: ExpirationStatusParams;
  }>('/status/:resourceType/:resourceId', {
    preHandler: requirePermission('perm_view_expiration'),
    schema: {
      params: {
        type: 'object',
        required: ['resourceType', 'resourceId'],
        properties: {
          resourceType: { type: 'string' },
          resourceId: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: {
              type: 'object',
              properties: {
                isExpired: { type: 'boolean' },
                expiresAt: { type: 'string', format: 'date-time' },
                timeRemaining: { type: 'number' },
                status: { type: 'string' },
                canRenew: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: ExpirationStatusParams }>, reply: FastifyReply) => {
    try {
      const { resourceType, resourceId } = request.params;
      const status = await expirationService.getExpirationInfo(resourceId, resourceType);

      return reply.code(200).send({
        success: true,
        status: {
          isExpired: status.isExpired,
          expiresAt: status.expiresAt?.toISOString() || null,
          timeRemaining: status.timeRemaining,
          status: status.status,
          canRenew: status.canRenew
        }
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get expiration status');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get expiration status'
      });
    }
  });

  /**
   * POST /api/expiration/renew/:resourceType/:resourceId
   * Renew a resource's expiration
   */
  fastify.post<{
    Params: RenewResourceParams;
    Body: RenewResourceBody;
  }>('/renew/:resourceType/:resourceId', {
    preHandler: requirePermission('perm_renew_expiration'),
    schema: {
      params: {
        type: 'object',
        required: ['resourceType', 'resourceId'],
        properties: {
          resourceType: { type: 'string' },
          resourceId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        properties: {
          requestedTtl: { type: 'number', minimum: 60 },
          reason: { type: 'string', maxLength: 500 }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            result: {
              type: 'object',
              properties: {
                newExpiresAt: { type: 'string' },
                newTtl: { type: 'number' },
                renewalCount: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: RenewResourceParams; Body: RenewResourceBody }>, reply: FastifyReply) => {
    try {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ success: false, error: 'User not authenticated' });
      }

      const { resourceType, resourceId } = request.params;
      const renewalRequest: RenewalRequest = {
        resourceId,
        resourceType,
        requestedTtl: request.body.requestedTtl,
        reason: request.body.reason,
        requestedBy: user.id,
        organizationId: user.organizationId
      };

      const result = await expirationService.renewResource(renewalRequest);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          result: {
            newExpiresAt: result.newExpiresAt?.toISOString(),
            newTtl: result.newTtl,
            renewalCount: result.renewalCount
          }
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error,
          warningMessage: result.warningMessage
        });
      }
    } catch (error) {
      request.log.error({ error }, 'Failed to renew resource');
      return reply.code(500).send({
        success: false,
        error: 'Failed to renew resource'
      });
    }
  });

  /**
   * POST /api/expiration/revoke/:resourceType/:resourceId
   * Revoke a resource (mark as expired immediately)
   */
  fastify.post<{
    Params: RenewResourceParams;
    Body: RevokeResourceBody;
  }>('/revoke/:resourceType/:resourceId', {
    preHandler: requirePermission('perm_revoke_expiration'),
    schema: {
      params: {
        type: 'object',
        required: ['resourceType', 'resourceId'],
        properties: {
          resourceType: { type: 'string' },
          resourceId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 500 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: RenewResourceParams; Body: RevokeResourceBody }>, reply: FastifyReply) => {
    try {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ success: false, error: 'User not authenticated' });
      }

      const { resourceType, resourceId } = request.params;
      const success = await expirationService.revokeResource(
        resourceId,
        resourceType,
        user.id,
        request.body.reason
      );

      if (success) {
        return reply.code(200).send({
          success: true,
          message: 'Resource revoked successfully'
        });
      } else {
        return reply.code(404).send({
          success: false,
          error: 'Resource not found or already expired'
        });
      }
    } catch (error) {
      request.log.error({ error }, 'Failed to revoke resource');
      return reply.code(500).send({
        success: false,
        error: 'Failed to revoke resource'
      });
    }
  });

  /**
   * GET /api/expiration/stats
   * Get expiration statistics
   */
  fastify.get<{
    Querystring: ExpirationStatsQuery;
  }>('/stats', {
    preHandler: requirePermission('perm_view_expiration'),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          organizationId: { type: 'string' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            stats: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                warning: { type: 'number' },
                expired: { type: 'number' },
                gracePeriod: { type: 'number' },
                renewed: { type: 'number' },
                revoked: { type: 'number' },
                byResourceType: { type: 'object' },
                upcomingExpirations: {
                  type: 'object',
                  properties: {
                    next24Hours: { type: 'number' },
                    next7Days: { type: 'number' },
                    next30Days: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: ExpirationStatsQuery }>, reply: FastifyReply) => {
    try {
      const stats = await expirationService.getExpirationStats(request.query.organizationId);

      return reply.code(200).send({
        success: true,
        stats
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get expiration statistics');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get expiration statistics'
      });
    }
  });

  /**
   * GET /api/expiration/warnings
   * Get upcoming expiration warnings
   */
  fastify.get<{
    Querystring: UpcomingWarningsQuery;
  }>('/warnings', {
    preHandler: requirePermission('perm_view_expiration'),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          organizationId: { type: 'string' },
          limit: { type: 'string', pattern: '^[0-9]+$' }
        }
  }
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            warnings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  resourceId: { type: 'string' },
                  resourceType: { type: 'string' },
                  expiresAt: { type: 'string' },
                  timeRemaining: { type: 'number' },
                  warningLevel: { type: 'string', enum: ['info', 'warning', 'critical'] },
                  canRenew: { type: 'boolean' },
                  renewalUrl: { type: 'string' },
                  userId: { type: 'string' },
                  organizationId: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: UpcomingWarningsQuery }>, reply: FastifyReply) => {
    try {
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 100;
      const warnings = await expirationService.getUpcomingWarnings(request.query.organizationId, limit);

      return reply.code(200).send({
        success: true,
        warnings: warnings.map(w => ({
          resourceId: w.resourceId,
          resourceType: w.resourceType,
          expiresAt: w.expiresAt.toISOString(),
          timeRemaining: w.timeRemaining,
          warningLevel: w.warningLevel,
          canRenew: w.canRenew,
          renewalUrl: w.renewalUrl,
          userId: w.userId,
          organizationId: w.organizationId
        }))
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get expiration warnings');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get expiration warnings'
      });
    }
  });

  /**
   * POST /api/expiration/cleanup
   * Manually trigger cleanup of expired resources (admin only)
   */
  fastify.post('/cleanup', {
    preHandler: requirePermission('perm_manage_expiration'),
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            result: {
              type: 'object',
              properties: {
                cleaned: { type: 'number' },
                errors: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await expirationService.cleanupExpiredResources();

      return reply.code(200).send({
        success: true,
        result
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to cleanup expired resources');
      return reply.code(500).send({
        success: false,
        error: 'Failed to cleanup expired resources'
      });
    }
  });

  /**
   * GET /api/expiration/health
   * Health check for expiration management system
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Basic health checks
      const stats = await expirationService.getExpirationStats();
      const isHealthy = true; // Could add more sophisticated checks

      return reply.code(200).send({
        success: true,
        healthy: isHealthy,
        stats: {
          totalRules: stats.total,
          activeRules: stats.active,
          upcomingExpirations: stats.upcomingExpirations
  }
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      request.log.error({ error }, 'Expiration management health check failed');
      return reply.code(503).send({
        success: false,
        healthy: false,
        error: 'Health check failed'
      });
    }
  });
}

export default expirationManagementRoutes;