/**
 * Policy Preview and Staging API Routes
 * 
 * RESTful API endpoints for policy preview, staging, and validation functionality.
 * Provides comprehensive policy testing and deployment capabilities.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-98 - Implement policy preview and staging
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import {
  PolicyPreviewStagingService,
  PolicyPreviewConfig,
  EnvironmentType,
  PreviewStatus,
  StagingDeploymentStatus,
  ValidationType,
  FeedbackType,
  FeedbackCategory,
  PreviewChange
} from '../../../packages/core/security/PolicyPreviewStagingService';

// Request schemas
const CreatePreviewSchema = z.object({
  policyId: z.string().min(1),
  baseVersion: z.string().min(1),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  changes: z.array(z.object({
    section: z.string().min(1),
    type: z.enum(['addition', 'modification', 'deletion', 'reorder']),
    before: z.string().optional(),
    after: z.string().optional(),
    reasoning: z.string().min(10),
    impactLevel: z.enum(['low', 'medium', 'high', 'critical']),
    userVisible: z.boolean(),
    requiresConsent: z.boolean()
  })).min(1),
  expirationDays: z.number().min(1).max(90).optional(),
  enableSimulation: z.boolean().optional(),
  targetEnvironments: z.array(z.string()).optional()
});

const DeployToStagingSchema = z.object({
  environmentId: z.string().min(1),
  targetUserGroups: z.array(z.string()).optional(),
  autoRollbackEnabled: z.boolean().optional(),
  monitoringDuration: z.number().min(1).max(168).optional() // max 1 week
});

const ValidationRequestSchema = z.object({
  validationTypes: z.array(z.enum(['SYNTAX', 'LEGAL', 'COMPLIANCE', 'ACCESSIBILITY', 'INTEGRATION'])).min(1)
});

const UserFeedbackSchema = z.object({
  feedbackType: z.enum(['USABILITY', 'CLARITY', 'COMPLETENESS', 'ACCESSIBILITY', 'TRUST', 'GENERAL']),
  rating: z.number().min(1).max(5),
  comments: z.string().min(5).max(1000),
  categories: z.array(z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'SUGGESTION', 'BUG_REPORT', 'QUESTION']))
});

const ComparisonRequestSchema = z.object({
  baseVersion: z.string().min(1),
  compareVersion: z.string().min(1),
  policyId: z.string().min(1)
});

const PromoteToProductionSchema = z.object({
  effectiveDate: z.string().datetime(),
  rolloutStrategy: z.string().optional()
});

const RollbackRequestSchema = z.object({
  reason: z.string().min(10).max(500)
});

// Type definitions for requests
interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface CreatePreviewRequest extends AuthenticatedRequest {
  Body: z.infer<typeof CreatePreviewSchema>;
}

interface DeployToStagingRequest extends AuthenticatedRequest {
  Body: z.infer<typeof DeployToStagingSchema>;
  Params: { previewId: string };
}

interface ValidationRequest extends AuthenticatedRequest {
  Body: z.infer<typeof ValidationRequestSchema>;
  Params: { previewId: string };
}

interface UserFeedbackRequest extends AuthenticatedRequest {
  Body: z.infer<typeof UserFeedbackSchema>;
  Params: { previewId: string };
}

interface ComparisonRequest extends AuthenticatedRequest {
  Body: z.infer<typeof ComparisonRequestSchema>;
}

interface PromoteRequest extends AuthenticatedRequest {
  Body: z.infer<typeof PromoteToProductionSchema>;
  Params: { previewId: string };
}

interface RollbackRequest extends AuthenticatedRequest {
  Body: z.infer<typeof RollbackRequestSchema>;
  Params: { deploymentId: string };
}

interface PreviewParamsRequest extends AuthenticatedRequest {
  Params: { previewId: string };
}

interface DeploymentParamsRequest extends AuthenticatedRequest {
  Params: { deploymentId: string };
}

export async function policyPreviewRoutes(fastify: FastifyInstance) {
  // Initialize policy preview service
  const previewConfig: PolicyPreviewConfig = {
    enableStagingEnvironments: true,
    enableImpactSimulation: true,
    enableUserTestingGroups: true,
    enableAutomaticRollback: true,
    previewRetentionDays: 30,
    maxConcurrentPreviews: 10,
    stagingEnvironments: [
      {
        environmentId: 'staging-1',
        name: 'General Staging',
        description: 'Primary staging environment for general testing',
        type: EnvironmentType.STAGING,
        isolated: true,
        userGroups: ['beta-testers', 'internal-staff'],
        maxActiveDeployments: 3,
        autoCleanupHours: 72,
        monitoringEnabled: true,
        features: [
          { feature: 'real-time-monitoring', enabled: true, configuration: {} },
          { feature: 'user-feedback', enabled: true, configuration: {} }
        ]
  }
      {
        environmentId: 'canary-1',
        name: 'Canary Environment',
        description: 'Limited canary testing with 5% of users',
        type: EnvironmentType.CANARY,
        isolated: false,
        userGroups: ['canary-group'],
        maxActiveDeployments: 1,
        autoCleanupHours: 24,
        monitoringEnabled: true,
        features: [
          { feature: 'auto-rollback', enabled: true, configuration: { threshold: 0.05 } }
        ]
      }
    ],
    defaultValidations: [ValidationType.SYNTAX, ValidationType.LEGAL, ValidationType.COMPLIANCE]
  };

  const previewService = new PolicyPreviewStagingService(previewConfig);

  // Middleware to verify authentication
  const authenticate = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Valid authentication token required'
        });
      }

      const token = authHeader.slice(7);
      const user = await fastify.jwt.verify(token) as any;
      
      if (!user?.id) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid authentication token'
        });
      }

      request.user = user;
    } catch (error) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication failed'
      });
    }
  };

  // Middleware to check admin permissions
  const requireAdmin = async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user?.roles.includes('admin') && !request.user?.roles.includes('policy-manager')) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Administrative privileges required'
      });
    }
  };

  /**
   * Create new policy preview
   * POST /api/policy-preview/previews
   */
  fastify.post('/previews', {
    preHandler: [authenticate, requireAdmin],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      body: {
        type: 'object',
        properties: {
          policyId: { type: 'string', minLength: 1 },
          baseVersion: { type: 'string', minLength: 1 },
          title: { type: 'string', minLength: 5, maxLength: 200 },
          description: { type: 'string', minLength: 10, maxLength: 2000 },
          changes: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                section: { type: 'string' },
                type: { type: 'string', enum: ['addition', 'modification', 'deletion', 'reorder'] },
                before: { type: 'string' },
                after: { type: 'string' },
                reasoning: { type: 'string', minLength: 10 },
                impactLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                userVisible: { type: 'boolean' },
                requiresConsent: { type: 'boolean' }
  }
              required: ['section', 'type', 'reasoning', 'impactLevel', 'userVisible', 'requiresConsent']
            }
          }
  }
        required: ['policyId', 'baseVersion', 'title', 'description', 'changes']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            previewId: { type: 'string' },
            status: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
            validationResults: { type: 'array' }
          }
        }
      }
    }
  }, async (request: CreatePreviewRequest, reply: FastifyReply) => {
    try {
      const requestData = CreatePreviewSchema.parse(request.body);
      const userId = request.user!.id;

      const changes: PreviewChange[] = requestData.changes.map((change, index) => ({
        changeId: `change-${index + 1}`,
        section: change.section,
        type: change.type,
        before: change.before,
        after: change.after,
        reasoning: change.reasoning,
        impactLevel: change.impactLevel,
        userVisible: change.userVisible,
        requiresConsent: change.requiresConsent
      }));

      const preview = await previewService.createPolicyPreview(
        requestData.policyId,
        requestData.baseVersion,
        changes,
        {
          title: requestData.title,
          description: requestData.description,
          createdBy: userId,
          expirationDays: requestData.expirationDays,
          enableSimulation: requestData.enableSimulation,
          targetEnvironments: requestData.targetEnvironments
        }
      );

      reply.send({
        previewId: preview.previewId,
        status: preview.status,
        expiresAt: preview.expiresAt.toISOString(),
        validationResults: preview.validationResults.map(vr => ({
          validationType: vr.validationType,
          status: vr.status,
          score: vr.score,
          findings: vr.findings.length,
          blockers: vr.blockers.length,
          warnings: vr.warnings.length
        }))
      });
    } catch (error) {
      fastify.log.error('Error creating policy preview:', error);
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors
        });
      } else {
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to create policy preview'
        });
      }
    }
  });

  /**
   * Deploy preview to staging
   * POST /api/policy-preview/previews/:previewId/deploy
   */
  fastify.post('/previews/:previewId/deploy', {
    preHandler: [authenticate, requireAdmin],
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          previewId: { type: 'string' }
  }
        required: ['previewId']
  }
      body: {
        type: 'object',
        properties: {
          environmentId: { type: 'string', minLength: 1 },
          targetUserGroups: { type: 'array', items: { type: 'string' } },
          autoRollbackEnabled: { type: 'boolean' },
          monitoringDuration: { type: 'number', minimum: 1, maximum: 168 }
  }
        required: ['environmentId']
  }
      response: {
        200: {
          type: 'object',
          properties: {
            deploymentId: { type: 'string' },
            status: { type: 'string' },
            environmentId: { type: 'string' },
            deployedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request: DeployToStagingRequest, reply: FastifyReply) => {
    try {
      const { previewId } = request.params;
      const deployData = DeployToStagingSchema.parse(request.body);

      const deployment = await previewService.deployToStaging(
        previewId,
        deployData.environmentId,
        {
          targetUserGroups: deployData.targetUserGroups,
          autoRollbackEnabled: deployData.autoRollbackEnabled,
          monitoringDuration: deployData.monitoringDuration
        }
      );

      reply.send({
        deploymentId: deployment.deploymentId,
        status: deployment.status,
        environmentId: deployment.environmentId,
        deployedAt: deployment.deployedAt.toISOString()
      });
    } catch (error) {
      fastify.log.error('Error deploying to staging:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to deploy to staging'
      });
    }
  });

  /**
   * Run validation on preview
   * POST /api/policy-preview/previews/:previewId/validate
   */
  fastify.post('/previews/:previewId/validate', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          previewId: { type: 'string' }
  }
        required: ['previewId']
  }
      body: {
        type: 'object',
        properties: {
          validationTypes: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', enum: ['SYNTAX', 'LEGAL', 'COMPLIANCE', 'ACCESSIBILITY', 'INTEGRATION'] }
          }
  }
        required: ['validationTypes']
      }
    }
  }, async (request: ValidationRequest, reply: FastifyReply) => {
    try {
      const { previewId } = request.params;
      const { validationTypes } = ValidationRequestSchema.parse(request.body);

      // Get preview first
      const preview = previewService['activePreviews'].get(previewId);
      if (!preview) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Policy preview not found'
        });
      }

      const results = await previewService.runValidations(preview, validationTypes);

      reply.send({
        previewId,
        validationResults: results.map(result => ({
          validationId: result.validationId,
          validationType: result.validationType,
          status: result.status,
          score: result.score,
          findings: result.findings.length,
          recommendations: result.recommendations,
          blockers: result.blockers,
          warnings: result.warnings,
          validatedAt: result.validatedAt.toISOString()
        }))
      });
    } catch (error) {
      fastify.log.error('Error running validation:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to run validation'
      });
    }
  });

  /**
   * Submit user feedback for preview
   * POST /api/policy-preview/previews/:previewId/feedback
   */
  fastify.post('/previews/:previewId/feedback', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 20, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          previewId: { type: 'string' }
  }
        required: ['previewId']
  }
      body: {
        type: 'object',
        properties: {
          feedbackType: { type: 'string', enum: ['USABILITY', 'CLARITY', 'COMPLETENESS', 'ACCESSIBILITY', 'TRUST', 'GENERAL'] },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          comments: { type: 'string', minLength: 5, maxLength: 1000 },
          categories: {
            type: 'array',
            items: { type: 'string', enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'SUGGESTION', 'BUG_REPORT', 'QUESTION'] }
          }
  }
        required: ['feedbackType', 'rating', 'comments', 'categories']
      }
    }
  }, async (request: UserFeedbackRequest, reply: FastifyReply) => {
    try {
      const { previewId } = request.params;
      const feedbackData = UserFeedbackSchema.parse(request.body);
      const userId = request.user!.id;

      const feedback = await previewService.collectUserFeedback(
        previewId,
        userId,
        {
          feedbackType: feedbackData.feedbackType as FeedbackType,
          rating: feedbackData.rating,
          comments: feedbackData.comments,
          categories: feedbackData.categories as FeedbackCategory[]
        }
      );

      reply.send({
        feedbackId: feedback.feedbackId,
        submitted: true,
        actionRequired: feedback.actionRequired
      });
    } catch (error) {
      fastify.log.error('Error submitting feedback:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to submit feedback'
      });
    }
  });

  /**
   * Generate policy comparison report
   * POST /api/policy-preview/compare
   */
  fastify.post('/compare', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
    schema: {
      body: {
        type: 'object',
        properties: {
          baseVersion: { type: 'string', minLength: 1 },
          compareVersion: { type: 'string', minLength: 1 },
          policyId: { type: 'string', minLength: 1 }
  }
        required: ['baseVersion', 'compareVersion', 'policyId']
      }
    }
  }, async (request: ComparisonRequest, reply: FastifyReply) => {
    try {
      const { baseVersion, compareVersion, policyId } = ComparisonRequestSchema.parse(request.body);

      const report = await previewService.generateComparisonReport(
        baseVersion,
        compareVersion,
        policyId
      );

      reply.send({
        comparisonId: report.comparisonId,
        differences: report.differences.length,
        overallRisk: report.impactAnalysis.overallRisk,
        affectedUsers: report.userImpactAssessment.totalAffectedUsers,
        complianceChange: report.complianceComparison.overallComplianceChange,
        generatedAt: report.generatedAt.toISOString(),
        downloadUrl: `/api/policy-preview/reports/${report.comparisonId}`
      });
    } catch (error) {
      fastify.log.error('Error generating comparison:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate comparison report'
      });
    }
  });

  /**
   * Get preview analytics
   * GET /api/policy-preview/previews/:previewId/analytics
   */
  fastify.get('/previews/:previewId/analytics', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          previewId: { type: 'string' }
  }
        required: ['previewId']
      }
    }
  }, async (request: PreviewParamsRequest, reply: FastifyReply) => {
    try {
      const { previewId } = request.params;

      const analytics = await previewService.getPreviewAnalytics(previewId);

      reply.send(analytics);
    } catch (error) {
      fastify.log.error('Error fetching analytics:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch analytics'
      });
    }
  });

  /**
   * Promote preview to production
   * POST /api/policy-preview/previews/:previewId/promote
   */
  fastify.post('/previews/:previewId/promote', {
    preHandler: [authenticate, requireAdmin],
    config: { rateLimit: { max: 3, timeWindow: '1 day' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          previewId: { type: 'string' }
  }
        required: ['previewId']
  }
      body: {
        type: 'object',
        properties: {
          effectiveDate: { type: 'string', format: 'date-time' },
          rolloutStrategy: { type: 'string' }
  }
        required: ['effectiveDate']
      }
    }
  }, async (request: PromoteRequest, reply: FastifyReply) => {
    try {
      const { previewId } = request.params;
      const promoteData = PromoteToProductionSchema.parse(request.body);
      const userId = request.user!.id;

      const result = await previewService.promoteToProduction(
        previewId,
        {
          approvedBy: userId,
          effectiveDate: new Date(promoteData.effectiveDate),
          rolloutStrategy: promoteData.rolloutStrategy
        }
      );

      reply.send({
        promoted: result.promoted,
        productionVersion: result.productionVersion,
        effectiveDate: promoteData.effectiveDate
      });
    } catch (error) {
      fastify.log.error('Error promoting preview:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to promote preview'
      });
    }
  });

  /**
   * Rollback staging deployment
   * POST /api/policy-preview/deployments/:deploymentId/rollback
   */
  fastify.post('/deployments/:deploymentId/rollback', {
    preHandler: [authenticate, requireAdmin],
    config: { rateLimit: { max: 10, timeWindow: '1 hour' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          deploymentId: { type: 'string' }
  }
        required: ['deploymentId']
  }
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', minLength: 10, maxLength: 500 }
  }
        required: ['reason']
      }
    }
  }, async (request: RollbackRequest, reply: FastifyReply) => {
    try {
      const { deploymentId } = request.params;
      const { reason } = RollbackRequestSchema.parse(request.body);
      const userId = request.user!.id;

      const result = await previewService.rollbackStagingDeployment(
        deploymentId,
        reason,
        userId
      );

      reply.send({
        success: result.success,
        rolledBack: true,
        reason,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error('Error rolling back deployment:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to rollback deployment'
      });
    }
  });

  /**
   * Get deployment status
   * GET /api/policy-preview/deployments/:deploymentId/status
   */
  fastify.get('/deployments/:deploymentId/status', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    schema: {
      params: {
        type: 'object',
        properties: {
          deploymentId: { type: 'string' }
  }
        required: ['deploymentId']
      }
    }
  }, async (request: DeploymentParamsRequest, reply: FastifyReply) => {
    try {
      const { deploymentId } = request.params;

      const deployment = previewService['stagingDeployments'].get(deploymentId);
      if (!deployment) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Deployment not found'
        });
      }

      reply.send({
        deploymentId: deployment.deploymentId,
        status: deployment.status,
        environmentId: deployment.environmentId,
        deployedAt: deployment.deployedAt.toISOString(),
        metrics: deployment.metrics,
        issues: deployment.issues.map(issue => ({
          issueId: issue.issueId,
          severity: issue.severity,
          category: issue.category,
          description: issue.description,
          detectedAt: issue.detectedAt.toISOString(),
          status: issue.status
        }))
      });
    } catch (error) {
      fastify.log.error('Error fetching deployment status:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch deployment status'
      });
    }
  });

  /**
   * List all previews
   * GET /api/policy-preview/previews
   */
  fastify.get('/previews', {
    preHandler: [authenticate],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['DRAFT', 'VALIDATING', 'STAGED', 'TESTING', 'APPROVED', 'REJECTED', 'EXPIRED'] },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { status, limit = 20, offset = 0 } = request.query as any;
      const userId = request.user!.id;

      // Get all previews (in real implementation, this would query database)
      const allPreviews = Array.from(previewService['activePreviews'].values());
      
      let filteredPreviews = allPreviews;
      if (status) {
        filteredPreviews = allPreviews.filter(p => p.status === status);
      }

      // Apply pagination
      const paginatedPreviews = filteredPreviews.slice(offset, offset + limit);

      reply.send({
        previews: paginatedPreviews.map(preview => ({
          previewId: preview.previewId,
          policyId: preview.policyId,
          title: preview.title,
          status: preview.status,
          createdAt: preview.createdAt.toISOString(),
          expiresAt: preview.expiresAt.toISOString(),
          changes: preview.changes.length,
          stagingDeployments: preview.stagingDeployments.length,
          validationResults: preview.validationResults.length
        })),
        pagination: {
          limit,
          offset,
          total: filteredPreviews.length,
          hasMore: offset + limit < filteredPreviews.length
        }
      });
    } catch (error) {
      fastify.log.error('Error listing previews:', error);
      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to list previews'
      });
    }
  });
}

// Register the plugin
export default async function (fastify: FastifyInstance) {
  await fastify.register(policyPreviewRoutes, { prefix: '/api/policy-preview' });
}