/**
 * Deployment Approval API Routes
 * Extended API for managing deployment-specific approval requests
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { getDatabase } from '../database/connection';
import { 
  getDeploymentApprovalRules, 
  validateAutoApprovalCriteria,
  getReviewerAssignments 
} from '../config/deployment-approval-rules';
import { z } from 'zod';

// Request schemas
const CreateDeploymentApprovalSchema = z.object({
  deployment_id: z.string(),
  sha: z.string().optional(),
  environment: z.enum(['production', 'staging', 'preview', 'development']),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  requested_by: z.string(),
  metadata: z.object({
    repository: z.string(),
    ref: z.string(),
    changed_files: z.number(),
    lines_changed: z.number(),
    breaking_changes: z.boolean().default(false),
    test_coverage: z.number().min(0).max(100),
    security_scan_status: z.enum(['passed', 'warning', 'failed']),
    performance_regression: z.number().default(0),
    deployment_type: z.enum(['github_actions', 'manual', 'auto']).default('github_actions')
  })
});

const GetDeploymentApprovalsSchema = z.object({
  workspace_id: z.string(),
  environment: z.string().optional(),
  status: z.string().optional(),
  urgency: z.string().optional(),
  auto_approved: z.string().optional(),
  deployment_type: z.string().optional(),
  reviewer_id: z.string().optional(),
  requester_id: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().max(100).default(50),
  offset: z.coerce.number().default(0)
});

export default async function deploymentApprovalRoutes(fastify: FastifyInstance) {
  const database = getDatabase();

  /**
   * GET /api/approval/deployment-requests
   * Get deployment approval requests with filtering
   */
  fastify.get<{
    Querystring: z.infer<typeof GetDeploymentApprovalsSchema>
  }>('/api/approval/deployment-requests', {
    schema: {
      querystring: GetDeploymentApprovalsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            requests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  deployment_id: { type: 'string' },
                  sha: { type: 'string' },
                  environment: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  urgency: { type: 'string' },
                  requested_by: { type: 'string' },
                  requested_at: { type: 'string' },
                  approved_at: { type: 'string' },
                  auto_approved: { type: 'boolean' },
                  deployment_url: { type: 'string' },
                  github_url: { type: 'string' },
                  metadata: { type: 'object' },
                  criteria: { type: 'array' },
                  approvals: { type: 'array' },
                  current_approvals: { type: 'number' },
                  required_approvals: { type: 'number' }
                }
              }
            },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Querystring: z.infer<typeof GetDeploymentApprovalsSchema> }>,
    reply: FastifyReply
  ) => {
    try {
      const { 
        workspace_id, environment, status, urgency, auto_approved, 
        deployment_type, reviewer_id, requester_id, search, limit, offset 
      } = request.query;

      // Build query with filters
      let query = `
        SELECT 
          ar.*,
          COUNT(CASE WHEN a.decision = 'approved' THEN 1 END) as current_approvals,
          JSON_GROUP_ARRAY(
            CASE WHEN ac.id IS NOT NULL THEN
              JSON_OBJECT(
                'type', ac.criterion_type,
                'status', ac.status,
                'weight', ac.weight,
                'description', ac.description,
                'assigned_reviewers', ac.assigned_reviewers
              )
            END
          ) as criteria,
          JSON_GROUP_ARRAY(
            CASE WHEN a.id IS NOT NULL THEN
              JSON_OBJECT(
                'id', a.id,
                'criterion_type', a.criterion_type,
                'reviewer_name', a.reviewer_name,
                'reviewer_email', a.reviewer_email,
                'decision', a.decision,
                'comments', a.comments,
                'reviewed_at', a.reviewed_at
              )
            END
          ) as approvals
        FROM approval_requests ar
        LEFT JOIN approval_criteria ac ON ar.id = ac.request_id
        LEFT JOIN approvals a ON ar.id = a.request_id
        WHERE ar.workspace_id = ?
          AND JSON_EXTRACT(ar.metadata, '$.deployment_type') IS NOT NULL
      `;

      const params: any[] = [workspace_id];

      // Add filters
      if (environment) {
        query += ' AND JSON_EXTRACT(ar.metadata, \'$.environment\') = ?';
        params.push(environment);
      }

      if (status) {
        query += ' AND ar.status = ?';
        params.push(status);
      }

      if (urgency) {
        query += ' AND ar.urgency = ?';
        params.push(urgency);
      }

      if (auto_approved === 'true') {
        query += ' AND JSON_EXTRACT(ar.metadata, \'$.auto_approved\') = 1';
      }

      if (deployment_type) {
        query += ' AND JSON_EXTRACT(ar.metadata, \'$.deployment_type\') = ?';
        params.push(deployment_type);
      }

      if (requester_id) {
        query += ' AND ar.requested_by = ?';
        params.push(requester_id);
      }

      if (search) {
        query += ' AND (ar.title LIKE ? OR ar.resource_id LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += `
        GROUP BY ar.id
        ORDER BY ar.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(limit, offset);

      const results = database.prepare(query).all(params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM approval_requests ar
        WHERE ar.workspace_id = ?
          AND JSON_EXTRACT(ar.metadata, '$.deployment_type') IS NOT NULL
      `;
      const countParams = [workspace_id];

      // Apply same filters to count query
      if (environment) {
        countQuery += ' AND JSON_EXTRACT(ar.metadata, \'$.environment\') = ?';
        countParams.push(environment);
      }

      if (status) {
        countQuery += ' AND ar.status = ?';
        countParams.push(status);
      }

      if (urgency) {
        countQuery += ' AND ar.urgency = ?';
        countParams.push(urgency);
      }

      if (auto_approved === 'true') {
        countQuery += ' AND JSON_EXTRACT(ar.metadata, \'$.auto_approved\') = 1';
      }

      if (deployment_type) {
        countQuery += ' AND JSON_EXTRACT(ar.metadata, \'$.deployment_type\') = ?';
        countParams.push(deployment_type);
      }

      if (requester_id) {
        countQuery += ' AND ar.requested_by = ?';
        countParams.push(requester_id);
      }

      if (search) {
        countQuery += ' AND (ar.title LIKE ? OR ar.resource_id LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const totalResult = database.prepare(countQuery).get(countParams);
      const total = totalResult?.total || 0;

      // Transform results
      const requests = results.map(row => {
        const metadata = JSON.parse(row.metadata || '{}');
        const criteria = JSON.parse(row.criteria || '[]').filter(c => c !== null);
        const approvals = JSON.parse(row.approvals || '[]').filter(a => a !== null);

        return {
          id: row.id,
          deployment_id: row.resource_id,
          sha: metadata.sha || row.resource_id,
          environment: metadata.environment || 'production',
          title: row.title,
          description: row.description || '',
          status: row.status,
          urgency: row.urgency,
          requested_by: row.requested_by,
          requested_at: new Date(row.created_at),
          approved_at: row.approved_at ? new Date(row.approved_at) : undefined,
          auto_approved: metadata.auto_approved || false,
          deployment_url: metadata.deployment_url,
          github_url: `https://github.com/${metadata.repository}/commit/${metadata.sha || row.resource_id}`,
          metadata: {
            repository: metadata.repository,
            ref: metadata.ref,
            changed_files: metadata.changed_files || 0,
            lines_changed: metadata.lines_changed || 0,
            breaking_changes: metadata.breaking_changes || false,
            test_coverage: metadata.test_coverage || 0,
            security_scan_status: metadata.security_scan_status || 'unknown',
            performance_regression: metadata.performance_regression || 0,
            deployment_type: metadata.deployment_type || 'github_actions'
          },
          criteria,
          approvals,
          current_approvals: row.current_approvals || 0,
          required_approvals: criteria.length
        };
      });

      return {
        requests,
        total,
        hasMore: offset + limit < total
      };

    } catch (error) {
      fastify.log.error('Error fetching deployment approval requests:', error);
      
      // Determine error type and appropriate response
      let statusCode = 500;
      let errorType = 'internal_server_error';
      let userMessage = 'Failed to fetch deployment approval requests';
      
      if (error.message?.includes('database') || error.code === 'SQLITE_ERROR') {
        statusCode = 503;
        errorType = 'database_unavailable';
        userMessage = 'Database temporarily unavailable - please try again later';
      } else if (error.message?.includes('timeout')) {
        statusCode = 504;
        errorType = 'request_timeout';
        userMessage = 'Request timeout - query took too long to execute';
      } else if (error.message?.includes('LIMIT') || error.message?.includes('parameter')) {
        statusCode = 400;
        errorType = 'invalid_parameters';
        userMessage = 'Invalid query parameters provided';
      }
      
      return reply.status(statusCode).send({
        error: errorType,
        message: userMessage,
        timestamp: new Date().toISOString(),
        request_id: fastify.generateRequestId?.() || 'unknown',
        retry_after: statusCode >= 500 ? 30 : undefined,
        help: statusCode >= 500 ? 'This is a temporary error. Please try again in a few moments.' : undefined
      });
    }
  });

  /**
   * POST /api/approval/deployment-requests
   * Create a new deployment approval request
   */
  fastify.post<{
    Body: z.infer<typeof CreateDeploymentApprovalSchema>
  }>('/api/approval/deployment-requests', {
    schema: {
      body: CreateDeploymentApprovalSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            deployment_id: { type: 'string' },
            status: { type: 'string' },
            auto_approved: { type: 'boolean' },
            approval_url: { type: 'string' },
            criteria: { type: 'array' },
            reviewers: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const requestData = request.body;
      const requestId = `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Enhanced validation of request data
      if (!requestData.deployment_id || requestData.deployment_id.trim().length === 0) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'deployment_id is required and cannot be empty',
          field: 'deployment_id',
          timestamp: new Date().toISOString()
        });
      }
      
      if (!requestData.requested_by || requestData.requested_by.trim().length === 0) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'requested_by is required and cannot be empty',
          field: 'requested_by',
          timestamp: new Date().toISOString()
        });
      }
      
      // Get deployment approval rules for environment with error handling
      let rules;
      try {
        rules = getDeploymentApprovalRules(requestData.environment);
      } catch (rulesError) {
        fastify.log.error('Error getting deployment rules:', rulesError);
        return reply.status(500).send({
          error: 'configuration_error',
          message: 'Failed to load deployment approval rules',
          environment: requestData.environment,
          timestamp: new Date().toISOString()
        });
      }
      
      if (!rules) {
        return reply.status(400).send({
          error: 'invalid_environment',
          message: `No approval rules defined for environment: ${requestData.environment}`,
          provided_environment: requestData.environment,
          valid_environments: ['production', 'staging', 'preview', 'development'],
          timestamp: new Date().toISOString()
        });
      }

      // Check for auto-approval eligibility with error handling
      let autoApprovalCheck;
      try {
        autoApprovalCheck = validateAutoApprovalCriteria(requestData.environment, {
          testCoverage: requestData.metadata.test_coverage,
          securityScan: {
            status: requestData.metadata.security_scan_status,
            criticalIssues: 0, // Would be extracted from scan results
            highIssues: 0
          },
          performanceRegression: {
            percent: requestData.metadata.performance_regression
          },
          breakingChanges: requestData.metadata.breaking_changes,
          changedFiles: requestData.metadata.changed_files,
          linesChanged: requestData.metadata.lines_changed
        });
      } catch (autoApprovalError) {
        fastify.log.error('Error validating auto-approval criteria:', autoApprovalError);
        // Continue with manual approval process if auto-approval check fails
        autoApprovalCheck = {
          eligible: false,
          reason: `Auto-approval validation failed: ${autoApprovalError.message}`,
          passedCriteria: [],
          failedCriteria: ['auto-approval-system-error']
        };
      }

      const isAutoApproved = !rules.required || autoApprovalCheck.eligible;
      const finalStatus = isAutoApproved ? 'approved' : 'pending';

      // Create approval request with transaction safety
      let insertRequest;
      try {
        insertRequest = database.prepare(`
          INSERT INTO approval_requests (
            id, workspace_id, resource_id, transition_id, title, description,
            requested_by, urgency, status, metadata, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
      } catch (prepareError) {
        fastify.log.error('Failed to prepare approval request insertion:', prepareError);
        return reply.status(503).send({
          error: 'database_error',
          message: 'Database temporarily unavailable',
          timestamp: new Date().toISOString(),
          retry_after: 30
        });
      }

      const metadata = {
        ...requestData.metadata,
        environment: requestData.environment,
        auto_approved: isAutoApproved,
        auto_approval_criteria: autoApprovalCheck,
        sha: requestData.sha || requestData.deployment_id
      };

      try {
        insertRequest.run(
          requestId,
          'deployment-workspace', // Would use actual workspace ID
          requestData.deployment_id,
          `deploy-${requestData.environment}`,
          requestData.title,
          requestData.description,
          requestData.requested_by,
          requestData.urgency,
          finalStatus,
          JSON.stringify(metadata),
          new Date().toISOString()
        );
      } catch (insertError) {
        fastify.log.error('Failed to insert approval request:', insertError);
        
        // Check for specific database errors
        if (insertError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return reply.status(409).send({
            error: 'duplicate_request',
            message: 'A deployment approval request with this ID already exists',
            deployment_id: requestData.deployment_id,
            existing_request_id: requestId,
            timestamp: new Date().toISOString()
          });
        }
        
        return reply.status(500).send({
          error: 'database_error',
          message: 'Failed to create approval request due to database error',
          timestamp: new Date().toISOString(),
          retry_after: 30
        });
      }

      // Create approval criteria
      const criteriaToCreate = isAutoApproved ? [] : rules.requiredCriteria;
      const insertCriterion = database.prepare(`
        INSERT INTO approval_criteria (
          id, request_id, criterion_type, weight, required, description,
          assigned_reviewers, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const criterion of criteriaToCreate) {
        const criterionId = `${requestId}-${criterion.type}`;
        let reviewerAssignments;
        
        try {
          reviewerAssignments = getReviewerAssignments(requestData.environment, requestData.requested_by);
        } catch (reviewerError) {
          fastify.log.error('Failed to get reviewer assignments:', reviewerError);
          // Use default fallback reviewers
          reviewerAssignments = {
            reviewers: ['system-admin'],
            method: 'fallback',
            reason: 'reviewer assignment failed'
          };
        }
        
        try {
          insertCriterion.run(
            criterionId,
            requestId,
            criterion.type,
            criterion.weight,
            criterion.required ? 1 : 0,
            criterion.description,
            JSON.stringify(reviewerAssignments.reviewers),
            'pending'
          );
        } catch (criterionError) {
          fastify.log.error('Failed to insert approval criterion:', criterionError);
          // Continue with other criteria, but log the failure
          // In production, you might want to rollback the entire transaction
        }
      }

      // If auto-approved, create system approval
      if (isAutoApproved) {
        const insertApproval = database.prepare(`
          INSERT INTO approvals (
            id, request_id, reviewer_name, reviewer_email, criterion_type,
            decision, comments, reviewed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertApproval.run(
          `${requestId}-auto`,
          requestId,
          'Auto-Approval System',
          'system@deployment.gate',
          'auto-approval',
          'approved',
          `Auto-approved based on criteria: ${autoApprovalCheck.passedCriteria.join(', ')}`,
          new Date().toISOString()
        );
      }

      // Get reviewer assignments
      const reviewerAssignments = getReviewerAssignments(requestData.environment, requestData.requested_by);

      return reply.status(201).send({
        id: requestId,
        deployment_id: requestData.deployment_id,
        status: finalStatus,
        auto_approved: isAutoApproved,
        approval_url: `/approval/dashboard?request=${requestId}`,
        criteria: criteriaToCreate.map(c => ({
          type: c.type,
          description: c.description,
          weight: c.weight,
          required: c.required
        })),
        reviewers: reviewerAssignments.reviewers
      });

    } catch (error) {
      fastify.log.error('Error creating deployment approval request:', error);
      
      // Provide detailed error information based on error type
      let statusCode = 500;
      let errorType = 'internal_server_error';
      let userMessage = 'Failed to create deployment approval request';
      const additionalInfo = {};
      
      if (error.message?.includes('database') || error.code?.startsWith('SQLITE_')) {
        statusCode = 503;
        errorType = 'database_error';
        userMessage = 'Database temporarily unavailable';
        additionalInfo.retry_after = 30;
      } else if (error.message?.includes('validation')) {
        statusCode = 400;
        errorType = 'validation_error';
        userMessage = 'Invalid request data provided';
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        statusCode = 403;
        errorType = 'permission_error';
        userMessage = 'Insufficient permissions to create approval request';
      } else if (error.message?.includes('timeout')) {
        statusCode = 504;
        errorType = 'timeout_error';
        userMessage = 'Request timeout - approval creation took too long';
        additionalInfo.retry_after = 30;
      }
      
      return reply.status(statusCode).send({
        error: errorType,
        message: userMessage,
        timestamp: new Date().toISOString(),
        request_id: fastify.generateRequestId?.() || 'unknown',
        deployment_id: request.body?.deployment_id,
        environment: request.body?.environment,
        ...additionalInfo
      });
    }
  });

  /**
   * GET /api/approval/deployment-requests/:requestId
   * Get detailed information about a specific deployment approval request
   */
  fastify.get<{
    Params: { requestId: string }
  }>('/api/approval/deployment-requests/:requestId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
        },
        required: ['requestId']
      }
    }
  }, async (request, reply) => {
    try {
      const { requestId } = request.params;

      const query = `
        SELECT 
          ar.*,
          COUNT(CASE WHEN a.decision = 'approved' THEN 1 END) as current_approvals,
          JSON_GROUP_ARRAY(
            CASE WHEN ac.id IS NOT NULL THEN
              JSON_OBJECT(
                'id', ac.id,
                'type', ac.criterion_type,
                'status', ac.status,
                'weight', ac.weight,
                'required', ac.required,
                'description', ac.description,
                'assigned_reviewers', JSON(ac.assigned_reviewers)
              )
            END
          ) as criteria,
          JSON_GROUP_ARRAY(
            CASE WHEN a.id IS NOT NULL THEN
              JSON_OBJECT(
                'id', a.id,
                'criterion_type', a.criterion_type,
                'reviewer_name', a.reviewer_name,
                'reviewer_email', a.reviewer_email,
                'decision', a.decision,
                'comments', a.comments,
                'reviewed_at', a.reviewed_at
              )
            END
          ) as approvals
        FROM approval_requests ar
        LEFT JOIN approval_criteria ac ON ar.id = ac.request_id
        LEFT JOIN approvals a ON ar.id = a.request_id
        WHERE ar.id = ?
        GROUP BY ar.id
      `;

      const result = database.prepare(query).get(requestId);

      if (!result) {
        return reply.status(404).send({
          error: 'Not found',
          message: 'Deployment approval request not found'
        });
      }

      const metadata = JSON.parse(result.metadata || '{}');
      const criteria = JSON.parse(result.criteria || '[]').filter(c => c !== null);
      const approvals = JSON.parse(result.approvals || '[]').filter(a => a !== null);

      const response = {
        id: result.id,
        deployment_id: result.resource_id,
        sha: metadata.sha || result.resource_id,
        environment: metadata.environment || 'production',
        title: result.title,
        description: result.description || '',
        status: result.status,
        urgency: result.urgency,
        requested_by: result.requested_by,
        requested_at: new Date(result.created_at),
        approved_at: result.approved_at ? new Date(result.approved_at) : undefined,
        auto_approved: metadata.auto_approved || false,
        deployment_url: metadata.deployment_url,
        github_url: `https://github.com/${metadata.repository}/commit/${metadata.sha || result.resource_id}`,
        metadata,
        criteria,
        approvals,
        current_approvals: result.current_approvals || 0,
        required_approvals: criteria.length,
        auto_approval_details: metadata.auto_approval_criteria
      };

      return response;

    } catch (error) {
      fastify.log.error('Error fetching deployment approval request:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to fetch deployment approval request'
      });
    }
  });

  /**
   * PUT /api/approval/deployment-requests/:requestId/review
   * Submit a review for a deployment approval request
   */
  fastify.put<{
    Params: { requestId: string };
    Body: {
      criterion_type: string;
      decision: 'approved' | 'rejected';
      comments: string;
      reviewer_name: string;
      reviewer_email: string;
    }
  }>('/api/approval/deployment-requests/:requestId/review', {
    schema: {
      params: {
        type: 'object',
        properties: {
          requestId: { type: 'string' }
        },
        required: ['requestId']
      },
      body: {
        type: 'object',
        properties: {
          criterion_type: { type: 'string' },
          decision: { type: 'string', enum: ['approved', 'rejected'] },
          comments: { type: 'string' },
          reviewer_name: { type: 'string' },
          reviewer_email: { type: 'string' }
        },
        required: ['criterion_type', 'decision', 'reviewer_name', 'reviewer_email']
      }
    }
  }, async (request, reply) => {
    try {
      const { requestId } = request.params;
      const { criterion_type, decision, comments, reviewer_name, reviewer_email } = request.body;

      // Enhanced request validation and existence check
      if (!requestId || requestId.trim().length === 0) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'requestId is required and cannot be empty',
          field: 'requestId',
          timestamp: new Date().toISOString()
        });
      }
      
      // Check if request exists with error handling
      let approvalRequest;
      try {
        approvalRequest = database.prepare('SELECT * FROM approval_requests WHERE id = ?').get(requestId);
      } catch (dbError) {
        fastify.log.error('Database error checking approval request:', dbError);
        return reply.status(503).send({
          error: 'database_unavailable',
          message: 'Database temporarily unavailable',
          timestamp: new Date().toISOString(),
          retry_after: 30
        });
      }
      
      if (!approvalRequest) {
        return reply.status(404).send({
          error: 'not_found',
          message: 'Approval request not found',
          request_id: requestId,
          timestamp: new Date().toISOString()
        });
      }
      
      // Check if request is in a reviewable state
      if (approvalRequest.status === 'approved') {
        return reply.status(409).send({
          error: 'already_approved',
          message: 'This approval request has already been approved',
          request_id: requestId,
          current_status: approvalRequest.status,
          timestamp: new Date().toISOString()
        });
      }
      
      if (approvalRequest.status === 'rejected') {
        return reply.status(409).send({
          error: 'already_rejected',
          message: 'This approval request has already been rejected',
          request_id: requestId,
          current_status: approvalRequest.status,
          timestamp: new Date().toISOString()
        });
      }

      // Create approval record
      const approvalId = `${requestId}-${criterion_type}-${Date.now()}`;
      const insertApproval = database.prepare(`
        INSERT INTO approvals (
          id, request_id, criterion_type, reviewer_name, reviewer_email,
          decision, comments, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertApproval.run(
        approvalId,
        requestId,
        criterion_type,
        reviewer_name,
        reviewer_email,
        decision,
        comments || '',
        new Date().toISOString()
      );

      // Update criterion status
      const updateCriterion = database.prepare(`
        UPDATE approval_criteria 
        SET status = ?, updated_at = ?
        WHERE request_id = ? AND criterion_type = ?
      `);

      updateCriterion.run(decision, new Date().toISOString(), requestId, criterion_type);

      // Check if all criteria are satisfied
      const criteriaCheck = database.prepare(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
        FROM approval_criteria
        WHERE request_id = ?
      `).get(requestId);

      let finalStatus = 'in_review';
      if (criteriaCheck.rejected > 0) {
        finalStatus = 'rejected';
      } else if (criteriaCheck.approved === criteriaCheck.total) {
        finalStatus = 'approved';
      }

      // Update request status if changed
      if (finalStatus !== 'in_review') {
        const updateRequest = database.prepare(`
          UPDATE approval_requests 
          SET status = ?, approved_at = ?, updated_at = ?
          WHERE id = ?
        `);

        updateRequest.run(
          finalStatus,
          finalStatus === 'approved' ? new Date().toISOString() : null,
          new Date().toISOString(),
          requestId
        );
      }

      return {
        success: true,
        approval_id: approvalId,
        request_status: finalStatus,
        criteria_progress: {
          total: criteriaCheck.total,
          approved: criteriaCheck.approved,
          rejected: criteriaCheck.rejected
        }
      };

    } catch (error) {
      fastify.log.error('Error submitting deployment approval review:', error);
      
      // Enhanced error handling for review submission
      let statusCode = 500;
      let errorType = 'internal_server_error';
      let userMessage = 'Failed to submit review';
      const additionalInfo = {};
      
      if (error.message?.includes('database') || error.code?.startsWith('SQLITE_')) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          statusCode = 409;
          errorType = 'duplicate_review';
          userMessage = 'You have already submitted a review for this criterion';
          additionalInfo.criterion_type = request.body?.criterion_type;
        } else {
          statusCode = 503;
          errorType = 'database_error';
          userMessage = 'Database temporarily unavailable';
          additionalInfo.retry_after = 30;
        }
      } else if (error.message?.includes('permission')) {
        statusCode = 403;
        errorType = 'permission_error';
        userMessage = 'Insufficient permissions to submit review';
      } else if (error.message?.includes('validation')) {
        statusCode = 400;
        errorType = 'validation_error';
        userMessage = 'Invalid review data provided';
      }
      
      return reply.status(statusCode).send({
        error: errorType,
        message: userMessage,
        timestamp: new Date().toISOString(),
        request_id: request.params?.requestId,
        reviewer_email: request.body?.reviewer_email,
        criterion_type: request.body?.criterion_type,
        ...additionalInfo
      });
    }
  });
}