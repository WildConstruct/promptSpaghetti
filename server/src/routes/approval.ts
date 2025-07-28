// Epic 9.4.2 - Enhanced Approval API Routes
// REST API endpoints for advanced approval workflows

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApprovalService } from '../services/approval-service';
import { getDatabase } from '../database/connection';

export async function approvalRoutes(fastify: FastifyInstance) {
  const approvalService = new ApprovalService(getDatabase());

  // =============================================================================
  // APPROVAL CRITERIA ENDPOINTS
  // =============================================================================

  // GET /api/approval/criteria/:workspaceId - Get approval criteria
  fastify.get<{
    Params: { workspaceId: string };
  }>('/criteria/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
  }
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const criteria = await approvalService.getApprovalCriteria(workspaceId);
      reply.send(criteria);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch approval criteria' });
    }
  });

  // POST /api/approval/criteria - Create approval criteria
  fastify.post<{
    Body: {
      workspace_id: string;
      name: string;
      description?: string;
      conditions: Record<string, any>;
      weight: number;
      is_required: boolean;
    };
  }>('/criteria', {
    schema: {
      body: z.object({
        workspace_id: z.string().uuid(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        conditions: z.record(z.any()).default({}),
        weight: z.number().int().min(1).default(1),
        is_required: z.boolean().default(false)
  }
    }
  }, async (request, reply) => {
    try {
      const criteria = await approvalService.createApprovalCriteria(request.body);
      reply.status(201).send(criteria);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create approval criteria' });
    }
  });

  // PUT /api/approval/criteria/:id - Update approval criteria
  fastify.put<{
    Params: { id: string };
    Body: {
      name?: string;
      description?: string;
      conditions?: Record<string, any>;
      weight?: number;
      is_required?: boolean;
    };
  }>('/criteria/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        conditions: z.record(z.any()).optional(),
        weight: z.number().int().min(1).optional(),
        is_required: z.boolean().optional()
  }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const criteria = await approvalService.updateApprovalCriteria(id, request.body);
      
      if (!criteria) {
        return reply.status(404).send({ error: 'Approval criteria not found' });
      }
      
      reply.send(criteria);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update approval criteria' });
    }
  });

  // DELETE /api/approval/criteria/:id - Delete approval criteria
  fastify.delete<{
    Params: { id: string };
  }>('/criteria/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
  }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = await approvalService.deleteApprovalCriteria(id);
      
      if (!deleted) {
        return reply.status(404).send({ error: 'Approval criteria not found' });
      }
      
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete approval criteria' });
    }
  });

  // =============================================================================
  // APPROVAL RULES ENDPOINTS
  // =============================================================================

  // GET /api/approval/rules/:workspaceId - Get approval rules
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: { transition_id?: string };
  }>('/rules/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        transition_id: z.string().uuid().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const { transition_id } = request.query || {};
      
      const rules = await approvalService.getApprovalRules(workspaceId, transition_id);
      reply.send(rules);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch approval rules' });
    }
  });

  // POST /api/approval/rules - Create approval rule
  fastify.post<{
    Body: {
      workspace_id: string;
      transition_id: string;
      name: string;
      description?: string;
      reviewer_assignment_type: 'manual' | 'automatic' | 'role_based' | 'round_robin';
      required_reviewers: number;
      minimum_approvals: number;
      allow_self_approval: boolean;
      criteria_ids: string[];
      require_all_criteria: boolean;
      approval_timeout_hours: number;
      escalation_enabled: boolean;
      escalation_after_hours: number;
      escalation_reviewers: string[];
      auto_approval_enabled: boolean;
      auto_approval_conditions: Record<string, any>;
    };
  }>('/rules', {
    schema: {
      body: z.object({
        workspace_id: z.string().uuid(),
        transition_id: z.string().uuid(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        reviewer_assignment_type: z.enum(['manual', 'automatic', 'role_based', 'round_robin']).default('manual'),
        required_reviewers: z.number().int().min(1).default(1),
        minimum_approvals: z.number().int().min(1).default(1),
        allow_self_approval: z.boolean().default(false),
        criteria_ids: z.array(z.string().uuid()).default([]),
        require_all_criteria: z.boolean().default(true),
        approval_timeout_hours: z.number().int().min(1).default(72),
        escalation_enabled: z.boolean().default(false),
        escalation_after_hours: z.number().int().min(1).default(24),
        escalation_reviewers: z.array(z.string()).default([]),
        auto_approval_enabled: z.boolean().default(false),
        auto_approval_conditions: z.record(z.any()).default({})
  }
    }
  }, async (request, reply) => {
    try {
      const rule = await approvalService.createApprovalRule(request.body);
      reply.status(201).send(rule);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create approval rule' });
    }
  });

  // =============================================================================
  // APPROVAL REQUEST ENDPOINTS
  // =============================================================================

  // GET /api/approval/requests/:workspaceId - Get approval requests
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: {
      status?: string;
      requester_id?: string;
      reviewer_id?: string;
      resource_id?: string;
      overdue?: boolean;
      urgency?: string;
      limit?: number;
      offset?: number;
    };
  }>('/requests/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        status: z.string().optional(),
        requester_id: z.string().optional(),
        reviewer_id: z.string().optional(),
        resource_id: z.string().uuid().optional(),
        overdue: z.boolean().optional(),
        urgency: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0)
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const filters = request.query || {};
      
      const requests = await approvalService.getApprovalRequests(workspaceId, filters);
      reply.send(requests);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch approval requests' });
    }
  });

  // POST /api/approval/requests - Create approval request
  fastify.post<{
    Body: {
      workspace_id: string;
      resource_id: string;
      transition_id: string;
      title: string;
      description?: string;
      urgency?: 'low' | 'medium' | 'high' | 'critical';
      business_justification?: string;
      due_date?: string;
    };
    Headers: { 'x-user-id': string };
  }>('/requests', {
    schema: {
      body: z.object({
        workspace_id: z.string().uuid(),
        resource_id: z.string().uuid(),
        transition_id: z.string().uuid(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        business_justification: z.string().optional(),
        due_date: z.string().optional()
      }),
      headers: z.object({
        'x-user-id': z.string()
  }
    }
  }, async (request, reply) => {
    try {
      const { workspace_id, resource_id, transition_id, title, description, urgency, business_justification, due_date } = request.body;
      const requesterId = request.headers['x-user-id'];
      
      const approvalRequest = await approvalService.createApprovalRequest(
        workspace_id,
        resource_id,
        transition_id,
        requesterId,
        {
          title,
          description,
          urgency,
          business_justification,
          due_date: due_date ? new Date(due_date) : undefined
        }
      );
      
      reply.status(201).send(approvalRequest);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create approval request' });
    }
  });

  // GET /api/approval/requests/:id/reviewers - Get reviewers for approval request
  fastify.get<{
    Params: { id: string };
  }>('/requests/:id/reviewers', {
    schema: {
      params: z.object({
        id: z.string().uuid()
  }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const reviewers = await approvalService.getReviewerAssignments(id);
      reply.send(reviewers);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch reviewer assignments' });
    }
  });

  // =============================================================================
  // REVIEW SUBMISSION ENDPOINTS
  // =============================================================================

  // POST /api/approval/requests/:id/review - Submit review
  fastify.post<{
    Params: { id: string };
    Body: {
      decision: 'approve' | 'reject' | 'abstain';
      comment?: string;
      criteria_evaluations?: Record<string, any>;
    };
    Headers: { 'x-user-id': string };
  }>('/requests/:id/review', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        decision: z.enum(['approve', 'reject', 'abstain']),
        comment: z.string().optional(),
        criteria_evaluations: z.record(z.any()).optional()
      }),
      headers: z.object({
        'x-user-id': z.string()
  }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { decision, comment, criteria_evaluations } = request.body;
      const reviewerId = request.headers['x-user-id'];
      
      const result = await approvalService.submitReview(id, reviewerId, {
        decision,
        comment,
        criteria_evaluations
      });
      
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to submit review' });
    }
  });

  // POST /api/approval/requests/:id/reviewers - Manually assign reviewers
  fastify.post<{
    Params: { id: string };
    Body: {
      reviewer_ids: string[];
      assignment_reason?: string;
    };
    Headers: { 'x-user-id': string };
  }>('/requests/:id/reviewers', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        reviewer_ids: z.array(z.string()).min(1),
        assignment_reason: z.string().optional()
      }),
      headers: z.object({
        'x-user-id': z.string()
  }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { reviewer_ids, assignment_reason } = request.body;
      
      // This would be implemented as a method in ApprovalService
      const assignments = [];
      for (const reviewerId of reviewer_ids) {
        // Implementation would go here
      }
      
      reply.send(assignments);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to assign reviewers' });
    }
  });

  // =============================================================================
  // APPROVAL TEMPLATES ENDPOINTS
  // =============================================================================

  // GET /api/approval/templates/:workspaceId - Get approval templates
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: { category?: string; active?: boolean };
  }>('/templates/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        category: z.string().optional(),
        active: z.boolean().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const { category, active } = request.query || {};
      
      let query = `
        SELECT * FROM approval_templates 
        WHERE workspace_id = $1
      `;
      const params = [workspaceId];
      let paramIndex = 2;

      if (category) {
        query += ` AND category = $${paramIndex++}`;
        params.push(category);
      }

      if (active !== undefined) {
        query += ` AND is_active = $${paramIndex++}`;
        params.push(active ? 1 : 0);
      }

      query += ' ORDER BY usage_count DESC, name';

      const db = getDatabase();
      const stmt = db.prepare(query);
      const result = stmt.all(...params);
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch approval templates' });
    }
  });

  // POST /api/approval/templates - Create approval template
  fastify.post<{
    Body: {
      workspace_id: string;
      name: string;
      description?: string;
      category?: string;
      template_config: Record<string, any>;
    };
    Headers: { 'x-user-id': string };
  }>('/templates', {
    schema: {
      body: z.object({
        workspace_id: z.string().uuid(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        template_config: z.record(z.any())
      }),
      headers: z.object({
        'x-user-id': z.string()
  }
    }
  }, async (request, reply) => {
    try {
      const { workspace_id, name, description, category, template_config } = request.body;
      const createdBy = request.headers['x-user-id'];
      
      const result = await database.query(`
        INSERT INTO approval_templates (
          workspace_id, name, description, category, template_config, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [workspace_id, name, description, category, JSON.stringify(template_config), createdBy]);
      
      reply.status(201).send(result.rows[0]);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create approval template' });
    }
  });

  // =============================================================================
  // APPROVAL STATISTICS ENDPOINTS
  // =============================================================================

  // GET /api/approval/statistics/:workspaceId - Get approval statistics
  fastify.get<{
    Params: { workspaceId: string };
  }>('/statistics/:workspaceId', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
  }
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const statistics = await approvalService.getApprovalStatistics(workspaceId);
      reply.send(statistics);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch approval statistics' });
    }
  });

  // GET /api/approval/statistics/:workspaceId/performance - Get performance metrics
  fastify.get<{
    Params: { workspaceId: string };
    Querystring: { 
      period?: '7d' | '30d' | '90d' | '1y';
      reviewer_id?: string;
    };
  }>('/statistics/:workspaceId/performance', {
    schema: {
      params: z.object({
        workspaceId: z.string().uuid()
      }),
      querystring: z.object({
        period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
        reviewer_id: z.string().optional()
      }).optional()
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;
      const { period, reviewer_id } = request.query || {};
      
      const periodMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const days = periodMap[period || '30d'];
      
      let query = `
        SELECT 
          AVG(am.time_to_completion_hours) as avg_completion_time,
          AVG(am.time_to_first_review_hours) as avg_first_review_time,
          AVG(am.criteria_pass_rate) as avg_criteria_pass_rate,
          AVG(am.reviewer_satisfaction_score) as avg_satisfaction_score,
          COUNT(am.id) as total_approvals,
          COUNT(CASE WHEN ar.status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN ar.status = 'rejected' THEN 1 END) as rejected_count,
          COUNT(CASE WHEN am.escalation_count > 0 THEN 1 END) as escalated_count
        FROM approval_metrics am
        JOIN approval_requests ar ON am.approval_request_id = ar.id
        WHERE ar.workspace_id = $1
        AND am.created_at >= NOW() - INTERVAL '${days} days'
      `;
      
      const params = [workspaceId];
      
      if (reviewer_id) {
        query += ` AND EXISTS (
          SELECT 1 FROM reviewer_assignments ra 
          WHERE ra.approval_request_id = ar.id 
          AND ra.reviewer_id = $2
        )`;
        params.push(reviewer_id);
      }
      
      const result = await database.query(query, params);
      reply.send(result.rows[0]);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch performance metrics' });
    }
  });

  // =============================================================================
  // MAINTENANCE ENDPOINTS
  // =============================================================================

  // POST /api/approval/maintenance/escalations - Process escalations
  fastify.post('/maintenance/escalations', async (request, reply) => {
    try {
      await approvalService.processEscalations();
      reply.send({ success: true });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to process escalations' });
    }
  });

  // POST /api/approval/maintenance/expire-overdue - Expire overdue approvals
  fastify.post('/maintenance/expire-overdue', async (request, reply) => {
    try {
      const result = await database.query('SELECT expire_overdue_approvals() as expired_count');
      reply.send({ expired_count: result.rows[0].expired_count });
    } catch (error) {
      reply.status(500).send({ error: 'Failed to expire overdue approvals' });
    }
  });

  // GET /api/approval/health - Health check for approval system
  fastify.get('/health', async (request, reply) => {
    try {
      const healthChecks = await Promise.all([
        database.query('SELECT COUNT(*) as pending_count FROM approval_requests WHERE status = \'pending\''),
        database.query('SELECT COUNT(*) as overdue_count FROM approval_requests WHERE status IN (\'pending\', \'in_review\') AND due_date < NOW()'),
        database.query('SELECT COUNT(*) as active_rules FROM approval_rules WHERE created_at > NOW() - INTERVAL \'1 day\'')
      ]);
      
      reply.send({
        status: 'healthy',
        pending_approvals: parseInt(healthChecks[0].rows[0].pending_count),
        overdue_approvals: parseInt(healthChecks[1].rows[0].overdue_count),
        active_rules: parseInt(healthChecks[2].rows[0].active_rules),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      reply.status(500).send({ error: 'Health check failed' });
    }
  });
}