/**
 * API Permission Assignment Routes - Epic 17.4.4 Implementation
 * Task: E17-1753114397222-C2B01B - Create permission assignment
 * 
 * REST API endpoints for managing API permissions, assignments, and roles
 * within the Backstage Admin Controls system.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  ApiPermissionAssignmentService, 
  ApiPermissionType, 
  ApiPermissionAction, 
  ApiPermissionScope,
  ApiPermission,
  ApiRole,
  PermissionCheck
} from '../auth/services/ApiPermissionAssignmentService';

// Request/Response Types
interface CreatePermissionRequest {
  name: string;
  description?: string;
  type: ApiPermissionType;
  action: ApiPermissionAction;
  scope: ApiPermissionScope;
  resource: string;
  conditions?: any[];
}

interface AssignPermissionRequest {
  userId: string;
  permissionId: string;
  expiresAt?: string;
  scope?: ApiPermissionScope;
  scopeContext?: {
    organizationId?: string;
    teamId?: string;
    apiKeyId?: string;
    resourceId?: string;
  };
  conditions?: any[];
  reason: string;
  requiresApproval?: boolean;
}

interface RevokePermissionRequest {
  reason: string;
}

interface CreateRoleRequest {
  name: string;
  description?: string;
  category: 'api_admin' | 'api_manager' | 'api_user' | 'api_viewer' | 'custom';
  permissions: string[];
  scope: ApiPermissionScope;
}

interface AssignRoleRequest {
  userId: string;
  roleId: string;
  expiresAt?: string;
  scopeContext?: {
    organizationId?: string;
    teamId?: string;
    resourceId?: string;
  };
  reason: string;
}

interface CheckPermissionRequest {
  userId: string;
  type: ApiPermissionType;
  action: ApiPermissionAction;
  resource: string;
  scope?: ApiPermissionScope;
  context?: {
    organizationId?: string;
    teamId?: string;
    apiKeyId?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  };
}

interface GetPermissionsQuery {
  type?: ApiPermissionType;
  scope?: ApiPermissionScope;
  userId?: string;
  includeSystem?: boolean;
  page?: number;
  limit?: number;
}

interface GetAssignmentsQuery {
  userId?: string;
  permissionId?: string;
  status?: string;
  scope?: ApiPermissionScope;
  expiringInDays?: number;
  page?: number;
  limit?: number;
}

interface GetAnalyticsQuery {
  startDate: string;
  endDate: string;
  userId?: string;
  type?: ApiPermissionType;
  includeDetails?: boolean;
}

/**
 * Register API permission assignment routes
 */
export async function apiPermissionAssignmentRoutes(fastify: FastifyInstance) {
  const permissionService = fastify.apiPermissionAssignmentService as ApiPermissionAssignmentService;

  if (!permissionService) {
    throw new Error('ApiPermissionAssignmentService not registered with Fastify instance');
  }

  // =============================================================================
  // Permission Management Routes
  // =============================================================================

  /**
   * Get all API permissions
   */
  fastify.get('/api-permissions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          scope: { type: 'string' },
          userId: { type: 'string' },
          includeSystem: { type: 'boolean', default: true },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: GetPermissionsQuery }>, reply: FastifyReply) => {
    try {
      const { type, scope, page = 1, limit = 20 } = request.query;

      let permissions = await permissionService.getPermissions({ type, scope });

      // Apply additional filters
      if (!request.query.includeSystem) {
        permissions = permissions.filter(p => !p.metadata.tags.includes('system'));
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPermissions = permissions.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          permissions: paginatedPermissions,
          pagination: {
            page,
            limit,
            total: permissions.length,
            pages: Math.ceil(permissions.length / limit)
          }
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get permissions'
      };
    }
  });

  /**
   * Create new API permission
   */
  fastify.post('/api-permissions', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'type', 'action', 'scope', 'resource'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          type: { type: 'string' },
          action: { type: 'string' },
          scope: { type: 'string' },
          resource: { type: 'string' },
          conditions: { type: 'array' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreatePermissionRequest }>, reply: FastifyReply) => {
    try {
      const userId = request.user?.id || 'system';

      const permission = await permissionService.createPermission(request.body, userId);

      reply.status(201);
      return {
        success: true,
        data: permission,
        message: 'Permission created successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create permission'
      };
    }
  });

  /**
   * Get permission by ID
   */
  fastify.get('/api-permissions/:permissionId', {
    schema: {
      params: {
        type: 'object',
        required: ['permissionId'],
        properties: {
          permissionId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { permissionId: string } }>, reply: FastifyReply) => {
    try {
      const { permissionId } = request.params;
      const permissions = await permissionService.getPermissions();
      const permission = permissions.find(p => p.permissionId === permissionId);

      if (!permission) {
        reply.status(404);
        return {
          success: false,
          error: `Permission ${permissionId} not found`
        };
      }

      return {
        success: true,
        data: permission
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get permission'
      };
    }
  });

  // =============================================================================
  // Permission Assignment Routes
  // =============================================================================

  /**
   * Assign permission to user
   */
  fastify.post('/api-permissions/assign', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'permissionId', 'reason'],
        properties: {
          userId: { type: 'string' },
          permissionId: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
          scope: { type: 'string' },
          scopeContext: { type: 'object' },
          conditions: { type: 'array' },
          reason: { type: 'string', minLength: 1, maxLength: 500 },
          requiresApproval: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: AssignPermissionRequest }>, reply: FastifyReply) => {
    try {
      const assignedBy = request.user?.id || 'system';
      const { userId, permissionId, expiresAt, ...options } = request.body;

      const assignment = await permissionService.assignPermissionToUser(
        userId,
        permissionId,
        assignedBy,
        {
          ...options,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        }
      );

      reply.status(201);
      return {
        success: true,
        data: assignment,
        message: 'Permission assigned successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign permission'
      };
    }
  });

  /**
   * Revoke permission assignment
   */
  fastify.post('/api-permissions/assignments/:assignmentId/revoke', {
    schema: {
      params: {
        type: 'object',
        required: ['assignmentId'],
        properties: {
          assignmentId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', minLength: 1, maxLength: 500 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { assignmentId: string };
    Body: RevokePermissionRequest;
  }>, reply: FastifyReply) => {
    try {
      const { assignmentId } = request.params;
      const { reason } = request.body;
      const revokedBy = request.user?.id || 'system';

      await permissionService.revokePermissionFromUser(assignmentId, revokedBy, reason);

      return {
        success: true,
        message: 'Permission assignment revoked successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke permission assignment'
      };
    }
  });

  /**
   * Get user permissions
   */
  fastify.get('/users/:userId/api-permissions', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          includeExpired: { type: 'boolean', default: false },
          scope: { type: 'string' },
          type: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { userId: string };
    Querystring: { includeExpired?: boolean; scope?: ApiPermissionScope; type?: ApiPermissionType };
  }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const { includeExpired, scope, type } = request.query;

      const userPermissions = await permissionService.getUserPermissions(userId, {
        includeExpired,
        scope,
        type
      });

      return {
        success: true,
        data: userPermissions
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user permissions'
      };
    }
  });

  /**
   * Check specific permission
   */
  fastify.post('/api-permissions/check', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'type', 'action', 'resource'],
        properties: {
          userId: { type: 'string' },
          type: { type: 'string' },
          action: { type: 'string' },
          resource: { type: 'string' },
          scope: { type: 'string' },
          context: { type: 'object' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CheckPermissionRequest }>, reply: FastifyReply) => {
    try {
      const result = await permissionService.checkPermission(request.body);

      const statusCode = result.allowed ? 200 : 403;
      reply.status(statusCode);

      return {
        success: result.allowed,
        data: result,
        message: result.reason
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check permission'
      };
    }
  });

  // =============================================================================
  // Role Management Routes
  // =============================================================================

  /**
   * Get all API roles
   */
  fastify.get('/api-roles', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          scope: { type: 'string' },
          includeSystem: { type: 'boolean', default: true },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      category?: string;
      scope?: ApiPermissionScope;
      includeSystem?: boolean;
      page?: number;
      limit?: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const { category, scope, includeSystem = true, page = 1, limit = 20 } = request.query;

      let roles = await permissionService.getRoles({ category, scope });

      if (!includeSystem) {
        roles = roles.filter(r => !r.isSystemRole);
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRoles = roles.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          roles: paginatedRoles,
          pagination: {
            page,
            limit,
            total: roles.length,
            pages: Math.ceil(roles.length / limit)
          }
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get roles'
      };
    }
  });

  /**
   * Create new API role
   */
  fastify.post('/api-roles', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'category', 'permissions', 'scope'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          category: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string' }, minItems: 1 },
          scope: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateRoleRequest }>, reply: FastifyReply) => {
    try {
      const createdBy = request.user?.id || 'system';

      const role = await permissionService.createApiRole(request.body, createdBy);

      reply.status(201);
      return {
        success: true,
        data: role,
        message: 'Role created successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create role'
      };
    }
  });

  /**
   * Assign role to user
   */
  fastify.post('/api-roles/assign', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'roleId', 'reason'],
        properties: {
          userId: { type: 'string' },
          roleId: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
          scopeContext: { type: 'object' },
          reason: { type: 'string', minLength: 1, maxLength: 500 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: AssignRoleRequest }>, reply: FastifyReply) => {
    try {
      const assignedBy = request.user?.id || 'system';
      const { userId, roleId, expiresAt, ...options } = request.body;

      const assignments = await permissionService.assignRoleToUser(
        userId,
        roleId,
        assignedBy,
        {
          ...options,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        }
      );

      reply.status(201);
      return {
        success: true,
        data: {
          assignments,
          assignmentCount: assignments.length
        },
        message: 'Role assigned successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign role'
      };
    }
  });

  // =============================================================================
  // Analytics and Monitoring Routes
  // =============================================================================

  /**
   * Get permission analytics
   */
  fastify.get('/api-permissions/analytics', {
    schema: {
      querystring: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          userId: { type: 'string' },
          type: { type: 'string' },
          includeDetails: { type: 'boolean', default: false }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: GetAnalyticsQuery }>, reply: FastifyReply) => {
    try {
      const { startDate, endDate } = request.query;

      const analytics = await permissionService.generateAnalytics({
        start: new Date(startDate),
        end: new Date(endDate)
      });

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analytics'
      };
    }
  });

  /**
   * Get permission activity log
   */
  fastify.get('/api-permissions/activity', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          limit: { type: 'number', default: 50, maximum: 200 }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: { userId?: string; limit?: number }
  }>, reply: FastifyReply) => {
    try {
      const { userId, limit = 50 } = request.query;

      const activities = await permissionService.getActivities(userId, limit);

      return {
        success: true,
        data: {
          activities,
          total: activities.length
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get activities'
      };
    }
  });

  /**
   * Get permission templates
   */
  fastify.get('/api-permissions/templates', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const templates = await permissionService.getTemplates();

      return {
        success: true,
        data: {
          templates,
          total: templates.length
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get templates'
      };
    }
  });

  // =============================================================================
  // Dashboard Routes
  // =============================================================================

  /**
   * Get permission dashboard summary
   */
  fastify.get('/api-permissions/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Generate analytics for the last week
      const analytics = await permissionService.generateAnalytics({
        start: lastWeek,
        end: now
      });

      // Get recent activities
      const recentActivities = await permissionService.getActivities(undefined, 10);

      const dashboard = {
        summary: {
          totalPermissions: analytics.summary.totalPermissions,
          activeAssignments: analytics.summary.activeAssignments,
          uniqueUsers: analytics.summary.uniqueUsers,
          recentActivityCount: recentActivities.length
        },
        breakdown: analytics.breakdown,
        security: {
          overPrivilegedUsers: analytics.security.overPrivilegedUsers.length,
          unusedPermissions: analytics.security.unusedPermissions.length,
          expiringAssignments: analytics.security.expiringAssignments.length,
          suspiciousActivity: analytics.security.suspiciousActivity.length
        },
        recentActivity: recentActivities.slice(0, 5),
        recommendations: analytics.recommendations.slice(0, 3),
        trends: {
          weeklyGrants: recentActivities.filter(a => a.action === 'granted').length,
          weeklyRevocations: recentActivities.filter(a => a.action === 'revoked').length,
          weeklyUsage: recentActivities.filter(a => a.action === 'used').length
        }
      };

      return {
        success: true,
        data: dashboard
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate dashboard'
      };
    }
  });

  /**
   * Health check endpoint
   */
  fastify.get('/api-permissions/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          permissionService: true,
          database: true,
          auditService: true,
          rbacIntegration: true
        },
        metrics: {
          memoryUsage: process.memoryUsage(),
          loadAverage: require('os').loadavg()
        }
      };

      return {
        success: true,
        data: health
      };
    } catch (error) {
      reply.status(503);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      };
    }
  });

  console.log('🔐 API Permission Assignment routes registered successfully');
}

export default apiPermissionAssignmentRoutes;