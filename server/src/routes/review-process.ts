/**
 * Review Process Routes - Epic 17.5.1
 * 
 * API endpoints for review process management including process creation,
 * decision processing, escalation handling, and workflow orchestration.
 * 
 * Task: E17-1753114397289-6B012A - Design review process
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ReviewProcessService, ReviewProcessTemplate, ReviewProcess, ReviewProcessStatus } from '../services/ReviewProcessService.js';
import { ReviewItem, ReviewDecision, DecisionType } from '../types/ReviewTools.js';
import { ReviewerAssignmentService, ReviewType } from '../services/ReviewerAssignmentService.js';

// =============================================================================
// Request/Response Schemas
// =============================================================================

const StartReviewProcessSchema = z.object({
  reviewItem: z.object({
    reviewId: z.string(),
    reviewType: z.nativeEnum(ReviewType),
    sourceSystem: z.string(),
    sourceId: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent', 'emergency']),
    title: z.string(),
    description: z.string(),
    data: z.any(),
    metadata: z.object({
      sourceData: z.any().optional(),
      businessContext: z.string(),
      riskLevel: z.string(),
      confidenceScore: z.number().optional(),
      automatedRecommendation: z.string().optional(),
      tags: z.array(z.string()),
      flagged: z.boolean(),
      flagReason: z.string().optional(),
      estimatedReviewTime: z.number(),
      complexity: z.enum(['simple', 'moderate', 'complex', 'expert_required'])
    }),
    assignedBy: z.string().optional(),
    reviewCriteria: z.array(z.any()),
    decisions: z.array(z.any()).default([]),
    notes: z.array(z.any()).default([]),
    evidence: z.array(z.any()).default([]),
    createdAt: z.string().transform(str => new Date(str)),
    updatedAt: z.string().transform(str => new Date(str)),
    dueDate: z.string().transform(str => new Date(str)).optional(),
    completedAt: z.string().transform(str => new Date(str)).optional(),
    parentReviewId: z.string().optional(),
    childReviewIds: z.array(z.string()).default([]),
    relatedReviewIds: z.array(z.string()).default([]),
    dependencies: z.array(z.any()).default([]),
    requiresConsensus: z.boolean(),
    minReviewers: z.number().optional(),
    escalationThreshold: z.number().optional(),
    autoEscalationEnabled: z.boolean()
  }
});

const ProcessReviewDecisionSchema = z.object({
  reviewId: z.string(),
  decision: z.object({
    decisionId: z.string(),
    reviewerId: z.string(),
    decision: z.nativeEnum({
      approve: 'approve',
      approve_with_conditions: 'approve_with_conditions',
      reject: 'reject',
      return_for_revision: 'return_for_revision',
      escalate: 'escalate',
      defer: 'defer',
      request_more_info: 'request_more_info'
    } as const),
    confidence: z.number().min(0).max(100),
    reasoning: z.string(),
    criteriaEvaluations: z.array(z.object({
      criteriaId: z.string(),
      score: z.number(),
      passed: z.boolean(),
      notes: z.string().optional(),
      evidence: z.array(z.string()).optional()
    })),
    recommendedActions: z.array(z.string()),
    timestamp: z.string().transform(str => new Date(str)),
    overridden: z.boolean().optional(),
    overriddenBy: z.string().optional(),
    overrideReason: z.string().optional()
  }
});

const EscalateReviewSchema = z.object({
  reviewId: z.string(),
  reason: z.string(),
  escalatedBy: z.string()
});

const CreateProcessTemplateSchema = z.object({
  name: z.string(),
  reviewType: z.nativeEnum(ReviewType),
  description: z.string(),
  stages: z.array(z.any()),
  requiresConsensus: z.boolean(),
  minReviewers: z.number(),
  maxReviewers: z.number(),
  consensusThreshold: z.number(),
  defaultDuration: z.number(),
  escalationThresholds: z.array(z.any()).default([]),
  slaHours: z.number(),
  preferredAssignmentStrategy: z.string(),
  requiredReviewerRoles: z.array(z.string()),
  excludedReviewerRoles: z.array(z.string()).default([]),
  criteria: z.array(z.any()),
  autoApprovalRules: z.array(z.any()).optional(),
  escalationRules: z.array(z.any()).default([]),
  webhookUrls: z.array(z.string()).default([]),
  notificationSettings: z.object({
    email: z.boolean(),
    slack: z.boolean(),
    webhook: z.boolean(),
    sms: z.boolean(),
    immediate: z.boolean(),
    daily_digest: z.boolean(),
    escalation_only: z.boolean(),
    reviewers: z.boolean(),
    admins: z.boolean(),
    stakeholders: z.array(z.string())
  }),
  created_by: z.string(),
  active: z.boolean()
});

// =============================================================================
// Route Handlers
// =============================================================================

export async function reviewProcessRoutes(fastify: FastifyInstance) {
  const reviewProcessService = new ReviewProcessService(
    fastify.pg.pool,
    fastify.log,
    fastify.reviewerAssignmentService || new ReviewerAssignmentService(fastify.pg.pool)
  );

  await reviewProcessService.initialize();

  // Start a new review process
  fastify.post('/api/admin/review-process/start', {
    schema: {
      body: StartReviewProcessSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          processId: z.string(),
          message: z.string()
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string()
  }
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof StartReviewProcessSchema>
  }>, reply: FastifyReply) => {
    try {
      const { reviewItem } = request.body;
      
      const processId = await reviewProcessService.startReviewProcess(reviewItem);
      
      return reply.code(200).send({
        success: true,
        processId,
        message: `Review process started for ${reviewItem.reviewType}`
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to start review process');
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start review process'
      });
    }
  });

  // Process a review decision
  fastify.post('/api/admin/review-process/decision', {
    schema: {
      body: ProcessReviewDecisionSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string()
  }
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof ProcessReviewDecisionSchema>
  }>, reply: FastifyReply) => {
    try {
      const { reviewId, decision } = request.body;
      
      await reviewProcessService.processReviewDecision(reviewId, decision);
      
      return reply.code(200).send({
        success: true,
        message: `Review decision processed for ${reviewId}`
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to process review decision');
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process review decision'
      });
    }
  });

  // Escalate a review
  fastify.post('/api/admin/review-process/escalate', {
    schema: {
      body: EscalateReviewSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string()
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string()
  }
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof EscalateReviewSchema>
  }>, reply: FastifyReply) => {
    try {
      const { reviewId, reason, escalatedBy } = request.body;
      
      await reviewProcessService.escalateReview(reviewId, reason, escalatedBy);
      
      return reply.code(200).send({
        success: true,
        message: `Review ${reviewId} escalated successfully`
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to escalate review');
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to escalate review'
      });
    }
  });

  // Get review process dashboard
  fastify.get('/api/admin/review-process/dashboard', {
    schema: {
      querystring: z.object({
        status: z.string().optional(),
        reviewType: z.nativeEnum(ReviewType).optional(),
        limit: z.coerce.number().default(50),
        offset: z.coerce.number().default(0)
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            processes: z.array(z.any()),
            totalCount: z.number(),
            summary: z.object({
              pending: z.number(),
              in_progress: z.number(),
              escalated: z.number(),
              completed_today: z.number(),
              overdue: z.number()
  }
  }
  }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      status?: string;
      reviewType?: ReviewType;
      limit: number;
      offset: number;
    }
  }>, reply: FastifyReply) => {
    try {
      const { status, reviewType, limit, offset } = request.query;
      
      // Get processes from dashboard view
      let query = 'SELECT * FROM review_process_dashboard';
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }
      
      if (reviewType) {
        // Note: This would need to be added to the view or joined from templates
        conditions.push(`template_id IN (SELECT id FROM review_process_templates WHERE review_type = $${params.length + 1})`);
        params.push(reviewType);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ` ORDER BY started_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await fastify.pg.pool.query(query, params);
      
      // Get summary counts
      const summaryResult = await fastify.pg.pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'escalated') as escalated,
          COUNT(*) FILTER (WHERE status IN ('approved', 'rejected') AND completed_at::date = CURRENT_DATE) as completed_today,
          COUNT(*) FILTER (WHERE overdue = true) as overdue
        FROM review_process_dashboard
      `);
      
      return reply.code(200).send({
        success: true,
        data: {
          processes: result.rows,
          totalCount: result.rowCount || 0,
          summary: summaryResult.rows[0] || {
            pending: 0,
            in_progress: 0,
            escalated: 0,
            completed_today: 0,
            overdue: 0
          }
        }
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get review process dashboard');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get review process dashboard'
      });
    }
  });

  // Get process templates
  fastify.get('/api/admin/review-process/templates', {
    schema: {
      querystring: z.object({
        reviewType: z.nativeEnum(ReviewType).optional(),
        active: z.boolean().optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(z.any())
  }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      reviewType?: ReviewType;
      active?: boolean;
    }
  }>, reply: FastifyReply) => {
    try {
      const { reviewType, active } = request.query;
      
      let query = 'SELECT * FROM review_process_templates';
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (reviewType) {
        conditions.push(`review_type = $${params.length + 1}`);
        params.push(reviewType);
      }
      
      if (active !== undefined) {
        conditions.push(`active = $${params.length + 1}`);
        params.push(active);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await fastify.pg.pool.query(query, params);
      
      return reply.code(200).send({
        success: true,
        data: result.rows
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get process templates');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get process templates'
      });
    }
  });

  // Create process template
  fastify.post('/api/admin/review-process/templates', {
    schema: {
      body: CreateProcessTemplateSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          templateId: z.string(),
          message: z.string()
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string()
  }
      }
    }
  }, async (request: FastifyRequest<{
    Body: z.infer<typeof CreateProcessTemplateSchema>
  }>, reply: FastifyReply) => {
    try {
      const templateData = request.body;
      
      const templateId = await reviewProcessService.createProcessTemplate(templateData);
      
      return reply.code(200).send({
        success: true,
        templateId,
        message: `Process template created: ${templateData.name}`
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to create process template');
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create process template'
      });
    }
  });

  // Get specific process details
  fastify.get('/api/admin/review-process/:processId', {
    schema: {
      params: z.object({
        processId: z.string()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any()
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string()
  }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { processId: string }
  }>, reply: FastifyReply) => {
    try {
      const { processId } = request.params;
      
      // Get process details with template and events
      const processResult = await fastify.pg.pool.query(`
        SELECT 
          rp.*,
          rpt.name as template_name,
          rpt.description as template_description,
          rpt.stages as template_stages
        FROM review_processes rp
        LEFT JOIN review_process_templates rpt ON rp.template_id = rpt.id
        WHERE rp.id = $1
      `, [processId]);
      
      if (processResult.rows.length === 0) {
        return reply.code(404).send({
          success: false,
          error: `Process ${processId} not found`
        });
      }
      
      // Get process events
      const eventsResult = await fastify.pg.pool.query(`
        SELECT * FROM review_process_events 
        WHERE process_id = $1 
        ORDER BY triggered_at DESC
      `, [processId]);
      
      // Get stage assignments
      const assignmentsResult = await fastify.pg.pool.query(`
        SELECT * FROM review_stage_assignments 
        WHERE process_id = $1 
        ORDER BY assigned_at DESC
      `, [processId]);
      
      const processData = {
        ...processResult.rows[0],
        events: eventsResult.rows,
        assignments: assignmentsResult.rows
      };
      
      return reply.code(200).send({
        success: true,
        data: processData
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get process details');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get process details'
      });
    }
  });

  // Get reviewer workload for assignment planning
  fastify.get('/api/admin/review-process/reviewers/workload', {
    schema: {
      querystring: z.object({
        reviewType: z.nativeEnum(ReviewType).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(z.any())
  }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      reviewType?: ReviewType;
    }
  }>, reply: FastifyReply) => {
    try {
      const { reviewType } = request.query;
      
      const reviewerService = new ReviewerAssignmentService(fastify.pg.pool);
      const workload = await reviewerService.getWorkloadDistribution(reviewType);
      
      return reply.code(200).send({
        success: true,
        data: workload
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get reviewer workload');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get reviewer workload'
      });
    }
  });

  // Analytics endpoint for process performance
  fastify.get('/api/admin/review-process/analytics', {
    schema: {
      querystring: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        reviewType: z.nativeEnum(ReviewType).optional()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            summary: z.any(),
            performance: z.any(),
            trends: z.any()
  }
  }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      startDate?: string;
      endDate?: string;
      reviewType?: ReviewType;
    }
  }>, reply: FastifyReply) => {
    try {
      const { startDate, endDate, reviewType } = request.query;
      
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();
      
      // Get analytics data
      const analyticsQuery = `
        SELECT 
          COUNT(*) as total_processes,
          COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
          COUNT(*) FILTER (WHERE escalation_count > 0) as escalated_count,
          AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) as avg_completion_hours,
          AVG(escalation_count) as avg_escalations,
          COUNT(*) FILTER (WHERE completed_at IS NOT NULL AND completed_at <= due_date) as on_time_count
        FROM review_processes rp
        LEFT JOIN review_process_templates rpt ON rp.template_id = rpt.id
        WHERE rp.started_at BETWEEN $1 AND $2
        ${reviewType ? 'AND rpt.review_type = $3' : ''}
      `;
      
      const params = [start, end];
      if (reviewType) params.push(reviewType);
      
      const analyticsResult = await fastify.pg.pool.query(analyticsQuery, params);
      
      // Get daily trends
      const trendsQuery = `
        SELECT 
          DATE(started_at) as date,
          COUNT(*) as daily_count,
          COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')) as completed_count,
          AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) as avg_hours
        FROM review_processes rp
        LEFT JOIN review_process_templates rpt ON rp.template_id = rpt.id
        WHERE rp.started_at BETWEEN $1 AND $2
        ${reviewType ? 'AND rpt.review_type = $3' : ''}
        GROUP BY DATE(started_at)
        ORDER BY date DESC
        LIMIT 30
      `;
      
      const trendsResult = await fastify.pg.pool.query(trendsQuery, params);
      
      return reply.code(200).send({
        success: true,
        data: {
          summary: analyticsResult.rows[0],
          performance: {
            completion_rate: analyticsResult.rows[0].total_processes > 0 
              ? (analyticsResult.rows[0].on_time_count / analyticsResult.rows[0].total_processes * 100).toFixed(1)
              : 0,
            approval_rate: analyticsResult.rows[0].total_processes > 0
              ? (analyticsResult.rows[0].approved_count / analyticsResult.rows[0].total_processes * 100).toFixed(1)
              : 0
  }
          trends: trendsResult.rows
        }
      });
    } catch (error) {
      request.log.error({ error }, 'Failed to get process analytics');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get process analytics'
      });
    }
  });
}

// Export for registration
export default reviewProcessRoutes;