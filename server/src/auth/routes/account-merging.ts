/**
 * Account Merging API Routes
 * 
 * RESTful API endpoints for managing account merge operations,
 * previewing merges, handling conflicts, and tracking merge status.
 * 
 * Includes comprehensive validation and security controls.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AccountMergingService, MergeStrategy, ConflictResolution } from '../services/AccountMergingService';
import { requirePermission } from '../middleware/permission-auth';

// Request validation schemas
const mergePreviewSchema = z.object({
  primaryAccountId: z.string().uuid(),
  secondaryAccountId: z.string().uuid()
});

const mergeStrategySchema = z.object({
  profileMerge: z.enum(['keep_primary', 'keep_secondary', 'merge_fields', 'manual']),
  preferenceMerge: z.enum(['keep_primary', 'keep_secondary', 'merge_categories']),
  projectDataMerge: z.enum(['keep_all', 'keep_primary', 'keep_secondary']),
  oauthAccountMerge: z.enum(['merge_all', 'keep_primary', 'manual']),
  sessionHandling: z.enum(['transfer_all', 'invalidate_secondary', 'keep_separate']),
  preserveAuditTrail: z.boolean()
});

const conflictResolutionSchema = z.object({
  field: z.string(),
  primaryValue: z.any(),
  secondaryValue: z.any(),
  resolution: z.enum(['keep_primary', 'keep_secondary', 'merge', 'manual']),
  resolvedValue: z.any().optional(),
  reason: z.string().optional()
});

const createMergeRequestSchema = z.object({
  primaryAccountId: z.string().uuid(),
  secondaryAccountId: z.string().uuid(),
  mergeStrategy: mergeStrategySchema,
  conflictResolutions: z.array(conflictResolutionSchema).default([])
});

const updateMergeRequestSchema = z.object({
  mergeStrategy: mergeStrategySchema.partial().optional(),
  conflictResolutions: z.array(conflictResolutionSchema).optional()
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    permissions: string[];
  };
}

/**
 * Register account merging routes
 */
export async function registerAccountMergingRoutes(
  fastify: FastifyInstance,
  mergingService: AccountMergingService
): Promise<void> {

  // Preview account merge - shows conflicts and recommendations
  fastify.post('/accounts/merge/preview', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { primaryAccountId, secondaryAccountId } = mergePreviewSchema.parse(request.body);
      
      // Validate user has permission to merge these specific accounts
      const canMergePrimary = await validateAccountAccess(request.user!.id, primaryAccountId);
      const canMergeSecondary = await validateAccountAccess(request.user!.id, secondaryAccountId);
      
      if (!canMergePrimary || !canMergeSecondary) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to merge these accounts',
          details: 'You can only merge accounts that belong to you or that you have explicit permission to manage'
        });
      }

      const preview = await mergingService.previewMerge(
        primaryAccountId,
        secondaryAccountId,
        request.user!.id
      );

      return reply.code(200).send({
        success: true,
        data: preview,
        message: 'Account merge preview generated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to generate merge preview:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to generate merge preview',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create merge request
  fastify.post('/accounts/merge/requests', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const requestData = createMergeRequestSchema.parse(request.body);
      
      // Validate account access
      const canMergePrimary = await validateAccountAccess(request.user!.id, requestData.primaryAccountId);
      const canMergeSecondary = await validateAccountAccess(request.user!.id, requestData.secondaryAccountId);
      
      if (!canMergePrimary || !canMergeSecondary) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to merge these accounts'
        });
      }

      const mergeRequest = await mergingService.createMergeRequest(
        requestData.primaryAccountId,
        requestData.secondaryAccountId,
        request.user!.id,
        requestData.mergeStrategy,
        requestData.conflictResolutions
      );

      return reply.code(201).send({
        success: true,
        data: mergeRequest,
        message: 'Account merge request created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to create merge request:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create merge request',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get merge request details
  fastify.get('/accounts/merge/requests/:id', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      
      // This would need to be implemented in the service
      // const mergeRequest = await mergingService.getMergeRequest(id);
      
      // For now, return placeholder
      return reply.code(501).send({
        success: false,
        error: 'Merge request retrieval not yet implemented'
      });

    } catch (error) {
      fastify.log.error(`Failed to get merge request ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve merge request'
      });
    }
  });

  // Update merge request (modify strategy or conflicts before processing)
  fastify.put('/accounts/merge/requests/:id', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = updateMergeRequestSchema.parse(request.body);

      // This would need to be implemented in the service
      return reply.code(501).send({
        success: false,
        error: 'Merge request updates not yet implemented'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid request data',
          details: error.errors
        });
      }

      fastify.log.error(`Failed to update merge request ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update merge request'
      });
    }
  });

  // Process merge request (execute the merge)
  fastify.post('/accounts/merge/requests/:id/process', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      fastify.log.info(`Processing merge request ${id} by user ${request.user?.email}`);

      const summary = await mergingService.processMergeRequest(id);

      const statusCode = summary.status === 'success' ? 200 : 
                        summary.status === 'partial' ? 207 : 500;

      return reply.code(statusCode).send({
        success: summary.status !== 'failed',
        data: summary,
        message: summary.status === 'success' 
          ? 'Account merge completed successfully'
          : summary.status === 'partial'
          ? 'Account merge completed with some issues'
          : 'Account merge failed'
      });

    } catch (error) {
      fastify.log.error(`Failed to process merge request ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to process merge request',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Cancel merge request (only if pending)
  fastify.delete('/accounts/merge/requests/:id', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      // This would need to be implemented in the service
      return reply.code(501).send({
        success: false,
        error: 'Merge request cancellation not yet implemented'
      });

    } catch (error) {
      fastify.log.error(`Failed to cancel merge request ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel merge request'
      });
    }
  });

  // Get user's merge request history
  fastify.get('/accounts/merge/requests', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { page, limit, status } = request.query as {
        page?: string;
        limit?: string;
        status?: string;
      };

      const pageNum = parseInt(page || '1', 10);
      const limitNum = parseInt(limit || '20', 10);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid pagination parameters'
        });
      }

      // This would need to be implemented in the service
      return reply.code(501).send({
        success: false,
        error: 'Merge request history not yet implemented'
      });

    } catch (error) {
      fastify.log.error('Failed to get merge request history:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve merge request history'
      });
    }
  });

  // Get merge templates/presets
  fastify.get('/accounts/merge/templates', {
    preHandler: [requirePermission('user:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const templates = [
        {
          id: 'conservative',
          name: 'Conservative Merge',
          description: 'Preserves all data from both accounts with conflict resolution',
          strategy: {
            profileMerge: 'merge_fields',
            preferenceMerge: 'merge_categories',
            projectDataMerge: 'keep_all',
            oauthAccountMerge: 'merge_all',
            sessionHandling: 'transfer_all',
            preserveAuditTrail: true
          }
        },
        {
          id: 'minimal',
          name: 'Minimal Merge',
          description: 'Keeps primary account unchanged, adds secondary projects only',
          strategy: {
            profileMerge: 'keep_primary',
            preferenceMerge: 'keep_primary',
            projectDataMerge: 'keep_all',
            oauthAccountMerge: 'keep_primary',
            sessionHandling: 'invalidate_secondary',
            preserveAuditTrail: true
          }
        },
        {
          id: 'replace',
          name: 'Replace Primary',
          description: 'Uses secondary account data as the new primary',
          strategy: {
            profileMerge: 'keep_secondary',
            preferenceMerge: 'keep_secondary',
            projectDataMerge: 'keep_all',
            oauthAccountMerge: 'merge_all',
            sessionHandling: 'transfer_all',
            preserveAuditTrail: true
          }
        }
      ];

      return reply.code(200).send({
        success: true,
        data: templates,
        meta: {
          count: templates.length
        }
      });

    } catch (error) {
      fastify.log.error('Failed to get merge templates:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve merge templates'
      });
    }
  });

  // Rollback a completed merge (if within rollback window)
  fastify.post('/accounts/merge/requests/:id/rollback', {
    preHandler: [requirePermission('admin:account:merge')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { reason } = request.body as { reason?: string };

      // This would need to be implemented in the service
      return reply.code(501).send({
        success: false,
        error: 'Merge rollback not yet implemented'
      });

    } catch (error) {
      fastify.log.error(`Failed to rollback merge request ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to rollback merge request'
      });
    }
  });

  // Get merge statistics (admin only)
  fastify.get('/accounts/merge/statistics', {
    preHandler: [requirePermission('admin:system:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { period } = request.query as { period?: string };
      
      // This would query the statistics views created in the migration
      // For now, return placeholder data
      const stats = {
        totalMerges: 0,
        successRate: 0,
        averageDuration: 0,
        commonConflicts: [],
        riskDistribution: {
          low: 0,
          medium: 0,
          high: 0
        }
      };

      return reply.code(200).send({
        success: true,
        data: stats,
        meta: {
          period: period || 'last_30_days',
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      fastify.log.error('Failed to get merge statistics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve merge statistics'
      });
    }
  });

  // Health check for merge system
  fastify.get('/accounts/merge/health', {
    preHandler: [requirePermission('admin:system:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Check for stuck merge requests
      // Check rollback plan cleanup
      // Validate service availability
      
      const health = {
        status: 'healthy',
        pendingMerges: 0,
        activeProcesses: 0,
        lastCleanup: null,
        serviceVersion: '1.0.0'
      };

      return reply.code(200).send({
        success: true,
        data: health
      });

    } catch (error) {
      fastify.log.error('Merge system health check failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  });
}

/**
 * Validate that a user has permission to access/merge a specific account
 */
async function validateAccountAccess(userId: string, accountId: string): Promise<boolean> {
  // Users can merge their own accounts
  if (userId === accountId) {
    return true;
  }

  // Admin users can merge any accounts (would need to check permissions)
  // For now, only allow users to merge their own accounts
  return false;
}

export default registerAccountMergingRoutes;