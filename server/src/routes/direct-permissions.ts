/**
 * Direct Permissions API Routes (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: RESTful API endpoints for immediate permission assignment system.
 * Supports direct permission grants that bypass traditional role-based assignments.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { DirectPermissionService, DirectPermissionGrant, BulkPermissionGrant, PermissionQuery } from '../auth/services/DirectPermissionService';

// Validation schemas
const DirectPermissionGrantSchema = z.object({
  userId: z.string().uuid(),
  resource: z.string().min(1).max(100),
  action: z.string().min(1).max(100),
  scope: z.enum(['global', 'organization', 'team', 'own']),
  conditions: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().transform(str => new Date(str)).optional(),
  scopeContext: z.record(z.any()).optional(),
  permanent: z.boolean().optional().default(true),
  reason: z.string().min(10).max(500)
});

const BulkPermissionGrantSchema = z.object({
  userId: z.string().uuid(),
  permissions: z.array(z.object({
    resource: z.string().min(1).max(100),
    action: z.string().min(1).max(100),
    scope: z.enum(['global', 'organization', 'team', 'own']),
    conditions: z.record(z.any()).optional(),
    expiresAt: z.string().datetime().transform(str => new Date(str)).optional(),
    scopeContext: z.record(z.any()).optional(),
    permanent: z.boolean().optional().default(true)
  })).min(1).max(50),
  reason: z.string().min(10).max(500)
});

const RevokePermissionSchema = z.object({
  reason: z.string().min(5).max(200)
});

const PermissionQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  scope: z.enum(['global', 'organization', 'team', 'own']).optional(),
  status: z.enum(['active', 'expired', 'revoked']).optional(),
  permanent: z.boolean().optional(),
  grantedBy: z.string().uuid().optional(),
  expiringWithinHours: z.number().min(1).max(8760).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20)
});

const UserParamsSchema = z.object({
  userId: z.string().uuid()
});

const PermissionParamsSchema = z.object({
  permissionId: z.string().uuid()
});

const CheckPermissionSchema = z.object({
  userId: z.string().uuid(),
  resource: z.string().min(1).max(100),
  action: z.string().min(1).max(100),
  scopeContext: z.record(z.any()).optional()
});

export async function directPermissionsRoutes(
  fastify: FastifyInstance,
  directPermissionService: DirectPermissionService
) {
  // Apply authentication to all routes
  fastify.addHook('onRequest', fastify.authenticate);

  /**
   * Grant a direct permission
   * POST /api/direct-permissions/grant
   */
  fastify.post<{
    Body: z.infer<typeof DirectPermissionGrantSchema>
  }>('/grant', {
    preHandler: fastify.requirePermission([
      {
        resource: 'users',
        action: 'manage_permissions',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const grant = DirectPermissionGrantSchema.parse(request.body);
      const user = (request.user as any);

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: user.sessionId
      };

      const permission = await directPermissionService.grantDirectPermission(grant, user.id, context);

      return reply.code(201).send({
        success: true,
        data: permission,
        message: 'Direct permission granted successfully'
      });

    } catch (error) {
      console.error('Error granting direct permission:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to grant direct permission',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Grant multiple direct permissions in bulk
   * POST /api/direct-permissions/bulk-grant
   */
  fastify.post<{
    Body: z.infer<typeof BulkPermissionGrantSchema>
  }>('/bulk-grant', {
    preHandler: fastify.requirePermission([
      {
        resource: 'users',
        action: 'manage_permissions',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bulkGrant = BulkPermissionGrantSchema.parse(request.body);
      const user = (request.user as any);

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: user.sessionId
      };

      const permissions = await directPermissionService.grantBulkPermissions(bulkGrant, user.id, context);

      return reply.code(201).send({
        success: true,
        data: permissions,
        message: `${permissions.length} direct permissions granted successfully`
      });

    } catch (error) {
      console.error('Error granting bulk permissions:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to grant bulk permissions',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Revoke a direct permission
   * POST /api/direct-permissions/:permissionId/revoke
   */
  fastify.post<{
    Params: z.infer<typeof PermissionParamsSchema>;
    Body: z.infer<typeof RevokePermissionSchema>
  }>('/:permissionId/revoke', {
    preHandler: fastify.requirePermission([
      {
        resource: 'users',
        action: 'manage_permissions',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { permissionId } = PermissionParamsSchema.parse(request.params);
      const { reason } = RevokePermissionSchema.parse(request.body);
      const user = (request.user as any);

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: user.sessionId
      };

      await directPermissionService.revokeDirectPermission(permissionId, user.id, reason, context);

      return reply.send({
        success: true,
        message: 'Direct permission revoked successfully'
      });

    } catch (error) {
      console.error('Error revoking direct permission:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to revoke direct permission',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get user's direct permissions
   * GET /api/direct-permissions/users/:userId
   */
  fastify.get<{
    Params: z.infer<typeof UserParamsSchema>;
    Querystring: { activeOnly?: boolean }
  }>('/users/:userId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'users',
        action: 'read_permissions',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = UserParamsSchema.parse(request.params);
      const query = request.query as { activeOnly?: boolean };
      const activeOnly = query.activeOnly !== false;

      const permissions = await directPermissionService.getUserDirectPermissions(userId, activeOnly);

      return reply.send({
        success: true,
        data: permissions,
        metadata: {
          userId,
          activeOnly,
          totalPermissions: permissions.length,
          permanentCount: permissions.filter(p => p.permanent).length,
          temporaryCount: permissions.filter(p => !p.permanent).length,
          expiringWithin24Hours: permissions.filter(p => 
            p.expiresAt && new Date(p.expiresAt) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
          ).length
        }
      });

    } catch (error) {
      console.error('Error getting user direct permissions:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to get user direct permissions',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Check if user has specific direct permission
   * POST /api/direct-permissions/check
   */
  fastify.post<{
    Body: z.infer<typeof CheckPermissionSchema>
  }>('/check', {
    preHandler: fastify.requirePermission([
      {
        resource: 'users',
        action: 'read_permissions',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const checkData = CheckPermissionSchema.parse(request.body);

      const hasPermission = await directPermissionService.hasDirectPermission(
        checkData.userId,
        checkData.resource,
        checkData.action,
        checkData.scopeContext
      );

      return reply.send({
        success: true,
        data: {
          hasPermission,
          permission: `${checkData.resource}:${checkData.action}`,
          userId: checkData.userId,
          checkedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error checking direct permission:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to check direct permission',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Search and filter direct permissions
   * GET /api/direct-permissions/search
   */
  fastify.get<{
    Querystring: z.infer<typeof PermissionQuerySchema>
  }>('/search', {
    preHandler: fastify.requirePermission([
      {
        resource: 'system',
        action: 'view_permissions',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = PermissionQuerySchema.parse(request.query);
      const { page, limit, ...searchQuery } = query;

      const offset = (page - 1) * limit;
      const { permissions, totalCount } = await directPermissionService.queryDirectPermissions(
        searchQuery as PermissionQuery,
        limit,
        offset
      );

      const totalPages = Math.ceil(totalCount / limit);

      return reply.send({
        success: true,
        data: permissions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
  }
        metadata: {
          searchCriteria: searchQuery,
          resultsFound: permissions.length
        }
      });

    } catch (error) {
      console.error('Error searching direct permissions:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to search direct permissions',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get permissions expiring soon
   * GET /api/direct-permissions/expiring
   */
  fastify.get<{
    Querystring: { withinHours?: number }
  }>('/expiring', {
    preHandler: fastify.requirePermission([
      {
        resource: 'system',
        action: 'view_permissions',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { withinHours?: number };
      const withinHours = query.withinHours || 24;

      if (withinHours < 1 || withinHours > 8760) { // Max 1 year
        return reply.code(400).send({
          success: false,
          error: 'Invalid withinHours parameter',
          message: 'withinHours must be between 1 and 8760'
        });
      }

      const expiringPermissions = await directPermissionService.getExpiringPermissions(withinHours);

      return reply.send({
        success: true,
        data: expiringPermissions,
        metadata: {
          withinHours,
          expiringCount: expiringPermissions.length,
          timeframe: `${withinHours} hour${withinHours !== 1 ? 's' : ''}`,
          checkTime: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error getting expiring permissions:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get expiring permissions',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Manual cleanup of expired permissions
   * POST /api/direct-permissions/cleanup
   */
  fastify.post('/cleanup', {
    preHandler: fastify.requirePermission([
      {
        resource: 'system',
        action: 'admin',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const expiredCount = await directPermissionService.cleanupExpiredPermissions();

      return reply.send({
        success: true,
        data: {
          expiredCount,
          cleanupAt: new Date().toISOString()
  }
        message: `Cleaned up ${expiredCount} expired permission${expiredCount !== 1 ? 's' : ''}`
      });

    } catch (error) {
      console.error('Error cleaning up expired permissions:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to cleanup expired permissions',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get permission statistics
   * GET /api/direct-permissions/stats
   */
  fastify.get('/stats', {
    preHandler: fastify.requirePermission([
      {
        resource: 'system',
        action: 'view_analytics',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await directPermissionService.getPermissionStatistics();

      return reply.send({
        success: true,
        data: stats,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      });

    } catch (error) {
      console.error('Error getting permission statistics:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get permission statistics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Health check endpoint for direct permissions system
   * GET /api/direct-permissions/health
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
          directPermissionGrants: 'available',
          bulkPermissionGrants: 'available',
          permissionRevocation: 'available',
          permissionSearch: 'available',
          automaticExpiration: 'operational',
          auditLogging: 'operational'
  }
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };

      return reply.send({
        success: true,
        data: healthStatus
      });

    } catch (error) {
      return reply.code(503).send({
        success: false,
        error: 'Service unhealthy',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}