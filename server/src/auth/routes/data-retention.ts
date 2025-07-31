/**
 * Data Retention API Routes
 *
 * RESTful API endpoints for managing data retention policies,
 * executing cleanup operations, and handling user data exports.
 *
 * Includes GDPR compliance features and audit logging.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { DataRetentionService, RetentionPolicy } from '../services/DataRetentionService';
import { requirePermission } from '../middleware/permission-auth';

// Request validation schemas
const createRetentionPolicySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  dataTypes: z.array(
    z.object({
      type: z.string(),
      category: z.enum(['user_data', 'session_data', 'audit_log', 'analytics', 'system_data']),
      description: z.string(),
      required: z.boolean(),
      sensitive: z.boolean(),
    })
  ),
  retentionPeriod: z.number().min(1).max(3650), // 1 day to 10 years
  deleteType: z.enum(['soft', 'hard', 'archive']),
  isActive: z.boolean(),
});

const updateRetentionPolicySchema = createRetentionPolicySchema.partial();

const dataExportRequestSchema = z.object({
  userId: z.string().uuid(),
  purpose: z.enum(['user_request', 'legal_hold', 'compliance', 'migration']),
  dataTypes: z.array(z.string()),
  notes: z.string().optional(),
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    permissions: string[];
  };
}

/**
 * Register data retention routes
 */
export async function registerDataRetentionRoutes(
  fastify: FastifyInstance,
  retentionService: DataRetentionService
): Promise<void> {
  // Get all retention policies
  fastify.get(
    '/retention/policies',
    {
      preHandler: [requirePermission('admin:retention:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { active } = request.query as { active?: string };
        const activeOnly = active === 'true';

        const policies = await retentionService.getRetentionPolicies(activeOnly);

        return reply.code(200).send({
          success: true,
          data: policies,
          meta: {
            count: policies.length,
            activeOnly,
          },
        });
      } catch (error) {
        fastify.log.error('Failed to get retention policies:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve retention policies',
        });
      }
    }
  );

  // Create new retention policy
  fastify.post(
    '/retention/policies',
    {
      preHandler: [requirePermission('admin:retention:write')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const policyData = createRetentionPolicySchema.parse(request.body);

        const policy = await retentionService.createRetentionPolicy(policyData);

        return reply.code(201).send({
          success: true,
          data: policy,
          message: 'Retention policy created successfully',
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
            details: error.errors,
          });
        }

        fastify.log.error('Failed to create retention policy:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to create retention policy',
        });
      }
    }
  );

  // Update retention policy
  fastify.put(
    '/retention/policies/:id',
    {
      preHandler: [requirePermission('admin:retention:write')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const updates = updateRetentionPolicySchema.parse(request.body);

        const policy = await retentionService.updateRetentionPolicy(id, updates);

        return reply.code(200).send({
          success: true,
          data: policy,
          message: 'Retention policy updated successfully',
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
            details: error.errors,
          });
        }

        fastify.log.error(`Failed to update retention policy ${request.params}:`, error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to update retention policy',
        });
      }
    }
  );

  // Execute retention policies manually
  fastify.post(
    '/retention/execute',
    {
      preHandler: [requirePermission('admin:retention:execute')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        fastify.log.info(`Manual retention execution requested by user ${request.user?.email}`);

        const report = await retentionService.executeRetentionPolicies();

        const hasErrors = report.errors.length > 0;

        return reply.code(hasErrors ? 207 : 200).send({
          success: !hasErrors,
          data: report,
          message: hasErrors
            ? 'Retention execution completed with errors'
            : 'Retention execution completed successfully',
        });
      } catch (error) {
        fastify.log.error('Failed to execute retention policies:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to execute retention policies',
        });
      }
    }
  );

  // Get retention execution history
  fastify.get(
    '/retention/history',
    {
      preHandler: [requirePermission('admin:retention:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { limit } = request.query as { limit?: string };
        const historyLimit = limit ? parseInt(limit, 10) : 50;

        if (isNaN(historyLimit) || historyLimit < 1 || historyLimit > 1000) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid limit parameter (must be between 1 and 1000)',
          });
        }

        const history = await retentionService.getRetentionHistory(historyLimit);

        return reply.code(200).send({
          success: true,
          data: history,
          meta: {
            count: history.length,
            limit: historyLimit,
          },
        });
      } catch (error) {
        fastify.log.error('Failed to get retention history:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve retention history',
        });
      }
    }
  );

  // Request user data export
  fastify.post(
    '/retention/export',
    {
      preHandler: [requirePermission('user:data:export')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const requestData = dataExportRequestSchema.parse(request.body);
        const requestedBy = request.user!.id;

        // Users can only export their own data unless they have admin permissions
        if (requestData.userId !== requestedBy && !request.user?.permissions.includes('admin:data:export')) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions to export data for other users',
          });
        }

        const exportRequest = await retentionService.requestDataExport(
          requestData.userId,
          requestedBy,
          requestData.purpose,
          requestData.dataTypes
        );

        return reply.code(202).send({
          success: true,
          data: exportRequest,
          message: 'Data export request created. You will be notified when ready.',
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
            details: error.errors,
          });
        }

        fastify.log.error('Failed to create data export request:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to create data export request',
        });
      }
    }
  );

  // Get user's data export requests
  fastify.get(
    '/retention/exports',
    {
      preHandler: [requirePermission('user:data:export')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { userId } = request.query as { userId?: string };
        const targetUserId = userId || request.user!.id;

        // Users can only see their own exports unless they have admin permissions
        if (targetUserId !== request.user!.id && !request.user?.permissions.includes('admin:data:export')) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions to view exports for other users',
          });
        }

        // This would need to be implemented in the service
        // For now, return placeholder
        return reply.code(200).send({
          success: true,
          data: [],
          message: 'Export history retrieval not yet implemented',
        });
      } catch (error) {
        fastify.log.error('Failed to get export requests:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve export requests',
        });
      }
    }
  );

  // Get available data types for export
  fastify.get(
    '/retention/data-types',
    {
      preHandler: [requirePermission('user:data:export')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { DEFAULT_DATA_TYPES } = await import('../services/DataRetentionService');

        // Filter sensitive data types for non-admin users
        const dataTypes = request.user?.permissions.includes('admin:data:export')
          ? DEFAULT_DATA_TYPES
          : DEFAULT_DATA_TYPES.filter(dt => !dt.sensitive || dt.type === 'user_account');

        return reply.code(200).send({
          success: true,
          data: dataTypes,
          meta: {
            count: dataTypes.length,
            adminAccess: request.user?.permissions.includes('admin:data:export'),
          },
        });
      } catch (error) {
        fastify.log.error('Failed to get data types:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to retrieve data types',
        });
      }
    }
  );

  // Health check endpoint for retention system
  fastify.get(
    '/retention/health',
    {
      preHandler: [requirePermission('admin:system:read')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const policies = await retentionService.getRetentionPolicies(true);
        const recentHistory = await retentionService.getRetentionHistory(5);

        const health = {
          status: 'healthy',
          activePolicies: policies.length,
          lastExecution: recentHistory.length > 0 ? recentHistory[0].executedAt : null,
          recentErrors: recentHistory.filter(h => h.errors && h.errors.length > 0).length,
        };

        return reply.code(200).send({
          success: true,
          data: health,
        });
      } catch (error) {
        fastify.log.error('Retention system health check failed:', error);
        return reply.code(500).send({
          success: false,
          error: 'Health check failed',
          data: {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }
  );

  // Initialize default retention policies (admin only)
  fastify.post(
    '/retention/initialize',
    {
      preHandler: [requirePermission('admin:system:write')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        await retentionService.initializeDefaultPolicies();

        return reply.code(200).send({
          success: true,
          message: 'Default retention policies initialized successfully',
        });
      } catch (error) {
        fastify.log.error('Failed to initialize retention policies:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to initialize retention policies',
        });
      }
    }
  );

  // Schedule automatic retention (admin only)
  fastify.post(
    '/retention/schedule',
    {
      preHandler: [requirePermission('admin:system:write')],
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        await retentionService.scheduleAutomaticRetention();

        return reply.code(200).send({
          success: true,
          message: 'Automatic retention scheduling configured',
        });
      } catch (error) {
        fastify.log.error('Failed to schedule retention:', error);
        return reply.code(500).send({
          success: false,
          error: 'Failed to configure retention scheduling',
        });
      }
    }
  );
}

export default registerDataRetentionRoutes;
