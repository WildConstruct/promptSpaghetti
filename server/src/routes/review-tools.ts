/**
 * Review Tools API Routes - Epic 17
 * 
 * RESTful API endpoints for unified review tools system including review
 * management, reviewer assignment, workflow orchestration, and analytics.
 * 
 * Task: E17-1753114397301-5C1461 - Develop review tools
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ReviewOrchestrationService } from '../services/review/ReviewOrchestrationService';
import { ReviewerAssignmentService } from '../services/review/ReviewerAssignmentService';
import { TrustScoreService } from '../services/trust/TrustScoreService';
import { FraudMonitoringService } from '../services/fraud/FraudMonitoringService';
import { EnforcementActionService } from '../services/enforcement/EnforcementActionService';
import { AuditService } from '../auth/services/AuditService';
import { Database } from '../database';

// Request/Response type definitions



interface CreateReviewRequest {
  Body: {
    reviewType: string;
    sourceSystem: string;
    sourceId: string;
    title: string;
    description: string;
    data: any;
    priority?: string;
    dueDate?: string;
    assignToReviewer?: string;
    metadata?: any;



  };




interface AssignReviewRequest {
  Body: {
    reviewerId: string;
    assignmentType?: 'manual' | 'automatic';



  };




interface SubmitDecisionRequest {
  Body: {
    decision: 'approve' | 'approve_with_conditions' | 'reject' | 'return_for_revision' | 'escalate' | 'defer' | 'request_more_info';
    confidence: number;
    reasoning: string;
    criteriaEvaluations: Array<{
      criteriaId: string;
      score: number;
      passed: boolean;
      notes?: string;



>;
    recommendedActions?: string[];
  };




interface AddNoteRequest {
  Body: {
    noteType: 'observation' | 'question' | 'concern' | 'recommendation' | 'clarification';
    content: string;
    visibility: 'reviewers_only' | 'internal' | 'public' | 'submitter_visible';
    replyTo?: string;



  };




interface EscalateReviewRequest {
  Body: {
    reason: string;



  };




interface GetReviewsRequest {
  Querystring: {
    status?: string;
    reviewType?: string;
    priority?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;



  };




interface GetAnalyticsRequest {
  Querystring: {
    startDate: string;
    endDate: string;
    reviewType?: string;
    granularity?: 'day' | 'week' | 'month';



  };




interface ReassignReviewRequest {
  Body: {
    newReviewerId: string;
    reason: string;



  };




interface RebalanceWorkloadRequest {
  Body: {
    reviewType?: string;
    targetUtilization?: number;



  };


export default async function reviewToolsRoutes(fastify: FastifyInstance) {
  // Initialize services
  const database = fastify.db as Database;
  const auditService = new AuditService(database);
  const trustScoreService = new TrustScoreService(database);
  const fraudService = new FraudMonitoringService(
    database,
    {} as any, // fraudEngine placeholder
    trustScoreService,
    {} as any, // enforcementService placeholder
    auditService
  );
  const enforcementService = new EnforcementActionService(
    database,
    trustScoreService,
    {} as any, // automatedEnforcement placeholder
    auditService
  );
  
  const orchestrationService = new ReviewOrchestrationService(
    database,
    auditService,
    fraudService,
    enforcementService,
    trustScoreService
  );
  
  const assignmentService = new ReviewerAssignmentService(database, auditService);

  // =============================================================================
  // Review Management Endpoints
  // =============================================================================

  /**
   * Create a new review
   */
  fastify.post<CreateReviewRequest>(
    '/reviews',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Create new review',
        description: 'Creates a new review item and initiates the review process',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['reviewType', 'sourceSystem', 'sourceId', 'title', 'description', 'data'],
          properties: {
            reviewType: {
              type: 'string',
              enum: [
                'template_submission', 'content_moderation', 'policy_violation', 'marketplace_listing',
                'access_request', 'account_action', 'identity_verification', 'privilege_escalation',
                'feature_toggle', 'configuration_change', 'security_alert', 'fraud_case',
                'enforcement_appeal', 'bulk_operation', 'emergency_action', 'compliance_audit'
              ],
              description: 'Type of review to create'

            sourceSystem: {
              type: 'string',
              enum: [
                'marketplace', 'fraud_monitoring', 'enforcement_actions', 'identity_verification',
                'feature_management', 'user_management', 'security_monitoring', 'content_management',
                'compliance_system'
              ],
              description: 'Source system that triggered the review'

            sourceId: { type: 'string', description: 'ID of the item being reviewed in the source system' },
            title: { type: 'string', description: 'Review title' },
            description: { type: 'string', description: 'Review description' },
            data: { type: 'object', description: 'Review data and context' },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent', 'emergency'],
              description: 'Review priority level'

            dueDate: { type: 'string', format: 'date-time', description: 'Review due date' },
            assignToReviewer: { type: 'string', description: 'Specific reviewer to assign to' },
            metadata: { type: 'object', description: 'Additional review metadata' }


        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              reviewId: { type: 'string' },
              review: { type: 'object' }


          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              details: { type: 'string' }





    async (request: FastifyRequest<CreateReviewRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const review = await orchestrationService.createReview(
          request.body.reviewType as any,
          request.body.sourceSystem as any,
          request.body.sourceId,
          request.body.data,
          {
            title: request.body.title,
            description: request.body.description,
            priority: request.body.priority as any,
            dueDate: request.body.dueDate ? new Date(request.body.dueDate) : undefined,
            assignToReviewer: request.body.assignToReviewer,
            metadata: request.body.metadata

        );

        reply.status(201).send({
          success: true,
          reviewId: review.reviewId,
          review
        });
 catch (error: any) {
        reply.status(400).send({
          error: 'Failed to create review',
          details: error.message
        });

  );

  /**
   * Get reviews with filtering and pagination
   */
  fastify.get<GetReviewsRequest>(
    '/reviews',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Get reviews',
        description: 'Retrieves reviews with filtering, sorting, and pagination',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string', description: 'Filter by review status' },
            reviewType: { type: 'string', description: 'Filter by review type' },
            priority: { type: 'string', description: 'Filter by priority' },
            assignedTo: { type: 'string', description: 'Filter by assigned reviewer' },
            startDate: { type: 'string', format: 'date', description: 'Filter from date' },
            endDate: { type: 'string', format: 'date', description: 'Filter to date' },
            page: { type: 'number', minimum: 1, default: 1, description: 'Page number' },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20, description: 'Items per page' },
            search: { type: 'string', description: 'Search query' }


        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              reviews: { type: 'array', items: { type: 'object' } },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  pages: { type: 'number' }







    async (request: FastifyRequest<GetReviewsRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        // Build filters from query parameters
        const filters = {
          status: request.query.status,
          reviewType: request.query.reviewType,
          priority: request.query.priority,
          assignedTo: request.query.assignedTo,
          dateRange: (request.query.startDate && request.query.endDate) ? {
            startDate: new Date(request.query.startDate),
            endDate: new Date(request.query.endDate)
 : undefined,
          search: request.query.search
        };

        const pagination = {
          page: request.query.page || 1,
          limit: request.query.limit || 20
        };

        // Get reviews (placeholder implementation)
        const result = {
          reviews: [],
          total: 0
        };

        reply.send({
          success: true,
          reviews: result.reviews,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: result.total,
            pages: Math.ceil(result.total / pagination.limit)

        });
 catch (error: any) {
        reply.status(500).send({
          error: 'Failed to retrieve reviews',
          details: error.message
        });

  );

  /**
   * Get specific review
   */
  fastify.get<{ Params: { reviewId: string } }>(
    '/reviews/:reviewId',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Get review details',
        description: 'Retrieves detailed information about a specific review',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['reviewId'],
          properties: {
            reviewId: { type: 'string', description: 'Review ID' }


        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              review: { type: 'object' }


          404: {
            type: 'object',
            properties: {
              error: { type: 'string' }





    async (request: FastifyRequest<{ Params: { reviewId: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        // Get review details (placeholder implementation)
        const review = null; // await orchestrationService.getReview(request.params.reviewId);

        if (!review) {
          return reply.status(404).send({
            error: 'Review not found'
          });


        reply.send({
          success: true,
          review
        });
 catch (error: any) {
        reply.status(500).send({
          error: 'Failed to retrieve review',
          details: error.message
        });

  );

  // =============================================================================
  // Review Assignment Endpoints
  // =============================================================================

  /**
   * Assign review to reviewer
   */
  fastify.post<AssignReviewRequest & { Params: { reviewId: string } }>(
    '/reviews/:reviewId/assign',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Assign review',
        description: 'Assigns a review to a specific reviewer',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['reviewId'],
          properties: {
            reviewId: { type: 'string', description: 'Review ID' }


        body: {
          type: 'object',
          required: ['reviewerId'],
          properties: {
            reviewerId: { type: 'string', description: 'ID of reviewer to assign to' },
            assignmentType: {
              type: 'string',
              enum: ['manual', 'automatic'],
              default: 'manual',
              description: 'Type of assignment'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              assignment: { type: 'object' }


          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              details: { type: 'string' }





    async (request: FastifyRequest<AssignReviewRequest & { Params: { reviewId: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const assignment = await orchestrationService.assignReview(
          request.params.reviewId,
          request.body.reviewerId,
          request.body.assignmentType || 'manual',
          userId
        );

        reply.send({
          success: true,
          assignment
        });
 catch (error: any) {
        reply.status(400).send({
          error: 'Failed to assign review',
          details: error.message
        });

  );

  /**
   * Get assignment recommendations
   */
  fastify.get<{ Params: { reviewId: string }; Querystring: { excludeReviewers?: string } }>(
    '/reviews/:reviewId/recommendations',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Get assignment recommendations',
        description: 'Gets intelligent reviewer assignment recommendations for a review',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['reviewId'],
          properties: {
            reviewId: { type: 'string', description: 'Review ID' }


        querystring: {
          type: 'object',
          properties: {
            excludeReviewers: { type: 'string', description: 'Comma-separated list of reviewer IDs to exclude' }


        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              recommendation: { type: 'object' }





    async (request: FastifyRequest<{ Params: { reviewId: string }; Querystring: { excludeReviewers?: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const excludeReviewers = request.query.excludeReviewers 
          ? request.query.excludeReviewers.split(',') 
          : [];

        // Get review and find best assignment
        const review = null; // await orchestrationService.getReview(request.params.reviewId);
        if (!review) {
          return reply.status(404).send({ error: 'Review not found' });


        const recommendation = await assignmentService.findBestReviewer(review, excludeReviewers);

        reply.send({
          success: true,
          recommendation
        });
 catch (error: any) {
        reply.status(500).send({
          error: 'Failed to get recommendations',
          details: error.message
        });

  );

  // =============================================================================
  // Review Decision Endpoints
  // =============================================================================

  /**
   * Submit review decision
   */
  fastify.post<SubmitDecisionRequest & { Params: { reviewId: string } }>(
    '/reviews/:reviewId/decision',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Submit review decision',
        description: 'Submits a reviewer decision for a review',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['reviewId'],
          properties: {
            reviewId: { type: 'string', description: 'Review ID' }


        body: {
          type: 'object',
          required: ['decision', 'confidence', 'reasoning', 'criteriaEvaluations'],
          properties: {
            decision: {
              type: 'string',
              enum: ['approve', 'approve_with_conditions', 'reject', 'return_for_revision', 'escalate', 'defer', 'request_more_info'],
              description: 'Review decision'

            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Confidence in decision (0-100)'

            reasoning: { type: 'string', description: 'Reasoning for the decision' },
            criteriaEvaluations: {
              type: 'array',
              items: {
                type: 'object',
                required: ['criteriaId', 'score', 'passed'],
                properties: {
                  criteriaId: { type: 'string' },
                  score: { type: 'number' },
                  passed: { type: 'boolean' },
                  notes: { type: 'string' }


              description: 'Evaluation of review criteria'

            recommendedActions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Recommended actions to take'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              decision: { type: 'object' }





    async (request: FastifyRequest<SubmitDecisionRequest & { Params: { reviewId: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const decision = await orchestrationService.submitDecision(
          request.params.reviewId,
          userId,
          request.body
        );

        reply.send({
          success: true,
          decision
        });
 catch (error: any) {
        reply.status(400).send({
          error: 'Failed to submit decision',
          details: error.message
        });

  );

  /**
   * Add review note
   */
  fastify.post<AddNoteRequest & { Params: { reviewId: string } }>(
    '/reviews/:reviewId/notes',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Add review note',
        description: 'Adds a note to a review',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['reviewId'],
          properties: {
            reviewId: { type: 'string', description: 'Review ID' }


        body: {
          type: 'object',
          required: ['noteType', 'content', 'visibility'],
          properties: {
            noteType: {
              type: 'string',
              enum: ['observation', 'question', 'concern', 'recommendation', 'clarification'],
              description: 'Type of note'

            content: { type: 'string', description: 'Note content' },
            visibility: {
              type: 'string',
              enum: ['reviewers_only', 'internal', 'public', 'submitter_visible'],
              description: 'Note visibility level'

            replyTo: { type: 'string', description: 'ID of note being replied to' }


        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              note: { type: 'object' }





    async (request: FastifyRequest<AddNoteRequest & { Params: { reviewId: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const note = await orchestrationService.addReviewNote(
          request.params.reviewId,
          userId,
          request.body
        );

        reply.status(201).send({
          success: true,
          note
        });
 catch (error: any) {
        reply.status(400).send({
          error: 'Failed to add note',
          details: error.message
        });

    }
  );

  /**
   * Escalate review
   */
  fastify.post<EscalateReviewRequest & { Params: { reviewId: string } }>(
    '/reviews/:reviewId/escalate',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Escalate review',
        description: 'Escalates a review to higher level reviewers',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['reviewId'],
          properties: {
            reviewId: { type: 'string', description: 'Review ID' }


        body: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: { type: 'string', description: 'Reason for escalation' }


        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }





    async (request: FastifyRequest<EscalateReviewRequest & { Params: { reviewId: string } }>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        await orchestrationService.escalateReview(
          request.params.reviewId,
          request.body.reason,
          userId
        );

        reply.send({
          success: true,
          message: 'Review escalated successfully'
        });
 catch (error: any) {
        reply.status(400).send({
          error: 'Failed to escalate review',
          details: error.message
        });

  );

  // =============================================================================
  // Analytics and Reporting Endpoints
  // =============================================================================

  /**
   * Get review analytics
   */
  fastify.get<GetAnalyticsRequest>(
    '/analytics',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Get review analytics',
        description: 'Generates comprehensive review analytics and metrics',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { type: 'string', format: 'date', description: 'Analytics start date' },
            endDate: { type: 'string', format: 'date', description: 'Analytics end date' },
            reviewType: { type: 'string', description: 'Filter by review type' },
            granularity: {
              type: 'string',
              enum: ['day', 'week', 'month'],
              default: 'day',
              description: 'Data granularity'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              analytics: { type: 'object' }





    async (request: FastifyRequest<GetAnalyticsRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const analytics = await orchestrationService.generateAnalytics({
          startDate: new Date(request.query.startDate),
          endDate: new Date(request.query.endDate)
        });

        reply.send({
          success: true,
          analytics
        });
 catch (error: any) {
        reply.status(500).send({
          error: 'Failed to generate analytics',
          details: error.message
        });

  );

  /**
   * Get dashboard summary
   */
  fastify.get(
    '/dashboard',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Get dashboard data',
        description: 'Retrieves real-time dashboard summary and key metrics',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              dashboard: { type: 'object' }





    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const dashboard = await orchestrationService.getReviewDashboard();

        reply.send({
          success: true,
          dashboard
        });
 catch (error: any) {
        reply.status(500).send({
          error: 'Failed to load dashboard',
          details: error.message
        });

  );

  // =============================================================================
  // Workload Management Endpoints
  // =============================================================================

  /**
   * Rebalance reviewer workload
   */
  fastify.post<RebalanceWorkloadRequest>(
    '/workload/rebalance',
    {
      schema: {
        tags: ['Review Tools'],
        summary: 'Rebalance workload',
        description: 'Rebalances reviewer workload across the team',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            reviewType: { type: 'string', description: 'Specific review type to rebalance' },
            targetUtilization: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 80,
              description: 'Target utilization percentage'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              result: { type: 'object' }





    async (request: FastifyRequest<RebalanceWorkloadRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.userId;
        if (!userId) {
          return reply.status(401).send({ error: 'Authentication required' });


        const result = await assignmentService.rebalanceWorkload(
          request.body.reviewType as any,
          request.body.targetUtilization
        );

        reply.send({
          success: true,
          result
        });
 catch (error: any) {
        reply.status(500).send({
          error: 'Failed to rebalance workload',
          details: error.message
        });

  );

  console.log('✅ Review Tools API routes registered');
