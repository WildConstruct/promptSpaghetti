/**
 * Epic 16 Feedback API Routes
 * Task: E16-1753114247084-CE7C08 - Create feedback system
 * 
 * RESTful API endpoints for feedback management including
 * CRUD operations, voting, moderation, and analytics.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FeedbackService } from '../services/FeedbackService';
import { requireAuth } from '../middleware/auth';
import { 
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackFilter,
  ModerateFeedbackRequest,
  validateCreateFeedbackRequest,
  validateUpdateFeedbackRequest,
  validateFeedbackFilter,
  validateModerateFeedbackRequest
 from '../../../packages/core/types/feedback';



interface FeedbackRouteParams {
  feedbackId: string;
  targetId?: string;







interface FeedbackVoteParams {
  feedbackId: string;
  voteType: 'helpful' | 'not_helpful';







interface FeedbackReplyBody {
  content: string;
  parentReplyId?: string;





export async function feedbackRoutes(fastify: FastifyInstance) {
  const feedbackService = new FeedbackService(fastify.pg);

  // =============================================================================
  // Feedback CRUD Operations
  // =============================================================================

  /**
   * Create new feedback
   * POST /api/feedback
   */
  fastify.post('/feedback', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        required: ['type', 'targetType', 'targetId', 'content'],
        properties: {
          type: { 
            type: 'string', 
            enum: ['rating', 'review', 'comment', 'report', 'suggestion', 'bug_report', 'feature_request'] 

          category: { 
            type: 'string', 
            enum: ['general', 'usability', 'performance', 'documentation', 'pricing', 'support', 'technical', 'content_quality'],
            default: 'general' 

          targetType: { 
            type: 'string', 
            enum: ['contribution', 'template', 'user', 'platform'] 

          targetId: { type: 'string', format: 'uuid' },
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'string', minLength: 1, maxLength: 5000 },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          isAnonymous: { type: 'boolean', default: false },
          
          // Review-specific fields
          pros: { 
            type: 'array', 
            items: { type: 'string', maxLength: 500 },
            maxItems: 10 

          cons: { 
            type: 'array', 
            items: { type: 'string', maxLength: 500 },
            maxItems: 10 

          useCase: { type: 'string', maxLength: 1000 },
          wouldRecommend: { type: 'boolean' },
          
          // Report fields
          reason: {
            type: 'string',
            enum: [
              'inappropriate_content', 'spam', 'copyright_violation',
              'offensive_language', 'misleading_information', 'low_quality',
              'duplicate_content', 'terms_violation', 'other'
            ]

          evidence: { 
            type: 'array', 
            items: { type: 'string' },
            maxItems: 5 

          // Bug report fields
          severity: { 
            type: 'string', 
            enum: ['low', 'medium', 'high', 'critical'] 

          stepsToReproduce: { 
            type: 'array', 
            items: { type: 'string' },
            maxItems: 20 

          expectedBehavior: { type: 'string', maxLength: 2000 },
          actualBehavior: { type: 'string', maxLength: 2000 },
          
          attachments: { 
            type: 'array', 
            items: { type: 'string', format: 'uuid' },
            maxItems: 5 



      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            feedback: { type: 'object' }


        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' }




  }, async (request: FastifyRequest<{ Body: CreateFeedbackRequest }>, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const feedback = await feedbackService.createFeedback(request.body, userId);
      
      reply.code(201).send({
        success: true,
        feedback
      });
 catch (error) {
      fastify.log.error('Failed to create feedback:', error);
      reply.code(400).send({
        error: 'Failed to create feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Get feedback by ID
   * GET /api/feedback/:feedbackId
   */
  fastify.get('/feedback/:feedbackId', {
    schema: {
      params: {
        type: 'object',
        required: ['feedbackId'],
        properties: {
          feedbackId: { type: 'string', format: 'uuid' }



  }, async (request: FastifyRequest<{ Params: FeedbackRouteParams }>, reply: FastifyReply) => {
    try {
      const feedback = await feedbackService.getFeedbackById(request.params.feedbackId);
      reply.send({ success: true, feedback });
 catch (error) {
      fastify.log.error('Failed to get feedback:', error);
      reply.code(404).send({
        error: 'Feedback not found',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Get feedback list with filtering
   * GET /api/feedback
   */
  fastify.get('/feedback', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          targetId: { type: 'string', format: 'uuid' },
          targetType: { 
            type: 'string', 
            enum: ['contribution', 'template', 'user', 'platform'] 

          type: { 
            type: 'string', 
            enum: ['rating', 'review', 'comment', 'report', 'suggestion', 'bug_report', 'feature_request'] 

          category: { 
            type: 'string', 
            enum: ['general', 'usability', 'performance', 'documentation', 'pricing', 'support', 'technical', 'content_quality'] 

          status: { 
            type: 'string', 
            enum: ['pending', 'approved', 'rejected', 'flagged', 'archived', 'resolved'] 

          authorId: { type: 'string', format: 'uuid' },
          verifiedOnly: { type: 'boolean' },
          minRating: { type: 'integer', minimum: 1, maximum: 5 },
          maxRating: { type: 'integer', minimum: 1, maximum: 5 },
          hasAttachments: { type: 'boolean' },
          search: { type: 'string', maxLength: 200 },
          sortBy: { 
            type: 'string', 
            enum: ['created_at', 'rating', 'helpful_votes', 'updated_at'],
            default: 'created_at' 

          sortOrder: { 
            type: 'string', 
            enum: ['asc', 'desc'],
            default: 'desc' 

          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }



  }, async (request: FastifyRequest<{ Querystring: FeedbackFilter }>, reply: FastifyReply) => {
    try {
      const result = await feedbackService.getFeedback(request.query);
      reply.send({
        success: true,
        ...result
      });
 catch (error) {
      fastify.log.error('Failed to get feedback list:', error);
      reply.code(400).send({
        error: 'Failed to get feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Update feedback
   * PUT /api/feedback/:feedbackId
   */
  fastify.put('/feedback/:feedbackId', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['feedbackId'],
        properties: {
          feedbackId: { type: 'string', format: 'uuid' }


      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'string', minLength: 1, maxLength: 5000 },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          pros: { 
            type: 'array', 
            items: { type: 'string', maxLength: 500 },
            maxItems: 10 

          cons: { 
            type: 'array', 
            items: { type: 'string', maxLength: 500 },
            maxItems: 10 

          useCase: { type: 'string', maxLength: 1000 },
          wouldRecommend: { type: 'boolean' }



  }, async (request: FastifyRequest<{ 
    Params: FeedbackRouteParams; 
    Body: UpdateFeedbackRequest 
>, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const feedback = await feedbackService.updateFeedback(
        request.params.feedbackId, 
        request.body, 
        userId
      );
      
      reply.send({ success: true, feedback });
 catch (error) {
      fastify.log.error('Failed to update feedback:', error);
      reply.code(400).send({
        error: 'Failed to update feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Delete feedback
   * DELETE /api/feedback/:feedbackId
   */
  fastify.delete('/feedback/:feedbackId', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['feedbackId'],
        properties: {
          feedbackId: { type: 'string', format: 'uuid' }



  }, async (request: FastifyRequest<{ Params: FeedbackRouteParams }>, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      await feedbackService.deleteFeedback(request.params.feedbackId, userId);
      
      reply.send({ success: true, message: 'Feedback deleted successfully' });
 catch (error) {
      fastify.log.error('Failed to delete feedback:', error);
      reply.code(400).send({
        error: 'Failed to delete feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // =============================================================================
  // Feedback Interaction Endpoints
  // =============================================================================

  /**
   * Vote on feedback helpfulness
   * POST /api/feedback/:feedbackId/vote
   */
  fastify.post('/feedback/:feedbackId/vote', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['feedbackId'],
        properties: {
          feedbackId: { type: 'string', format: 'uuid' }


      body: {
        type: 'object',
        required: ['voteType'],
        properties: {
          voteType: { 
            type: 'string', 
            enum: ['helpful', 'not_helpful'] 




  }, async (request: FastifyRequest<{ 
    Params: FeedbackRouteParams; 
    Body: { voteType: 'helpful' | 'not_helpful' } 
>, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      await feedbackService.voteFeedback(
        request.params.feedbackId, 
        userId, 
        request.body.voteType
      );
      
      reply.send({ success: true, message: 'Vote recorded successfully' });
 catch (error) {
      fastify.log.error('Failed to vote on feedback:', error);
      reply.code(400).send({
        error: 'Failed to vote on feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Reply to feedback
   * POST /api/feedback/:feedbackId/reply
   */
  fastify.post('/feedback/:feedbackId/reply', {
    preHandler: [requireAuth],
    schema: {
      params: {
        type: 'object',
        required: ['feedbackId'],
        properties: {
          feedbackId: { type: 'string', format: 'uuid' }


      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 2000 },
          parentReplyId: { type: 'string', format: 'uuid' }



  }, async (request: FastifyRequest<{ 
    Params: FeedbackRouteParams; 
    Body: FeedbackReplyBody 
>, reply: FastifyReply) => {
    try {
      const userId = request.user.id;
      const feedbackReply = await feedbackService.replyToFeedback(
        request.params.feedbackId,
        userId,
        request.body.content,
        request.body.parentReplyId
      );
      
      reply.code(201).send({ success: true, reply: feedbackReply });
 catch (error) {
      fastify.log.error('Failed to reply to feedback:', error);
      reply.code(400).send({
        error: 'Failed to reply to feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Get feedback replies
   * GET /api/feedback/:feedbackId/replies
   */
  fastify.get('/feedback/:feedbackId/replies', {
    schema: {
      params: {
        type: 'object',
        required: ['feedbackId'],
        properties: {
          feedbackId: { type: 'string', format: 'uuid' }


      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }



  }, async (request: FastifyRequest<{ 
    Params: FeedbackRouteParams;
    Querystring: { limit?: number; offset?: number }
>, reply: FastifyReply) => {
    try {
      // This would be implemented in the service
      const replies = []; // Placeholder
      reply.send({ success: true, replies });
 catch (error) {
      fastify.log.error('Failed to get feedback replies:', error);
      reply.code(400).send({
        error: 'Failed to get feedback replies',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // =============================================================================
  // Feedback Summaries and Analytics
  // =============================================================================

  /**
   * Get feedback summary for a target
   * GET /api/feedback/summary/:targetId
   */
  fastify.get('/feedback/summary/:targetId', {
    schema: {
      params: {
        type: 'object',
        required: ['targetId'],
        properties: {
          targetId: { type: 'string', format: 'uuid' }



  }, async (request: FastifyRequest<{ Params: { targetId: string } }>, reply: FastifyReply) => {
    try {
      const summary = await feedbackService.getFeedbackSummary(request.params.targetId);
      reply.send({ success: true, summary });
 catch (error) {
      fastify.log.error('Failed to get feedback summary:', error);
      reply.code(400).send({
        error: 'Failed to get feedback summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Get feedback analytics
   * GET /api/feedback/analytics
   */
  fastify.get('/feedback/analytics', {
    preHandler: [requireAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          targetId: { type: 'string', format: 'uuid' },
          targetType: { 
            type: 'string', 
            enum: ['contribution', 'template', 'user', 'platform'] 

          dateFrom: { type: 'string', format: 'date' },
          dateTo: { type: 'string', format: 'date' },
          groupBy: { 
            type: 'string', 
            enum: ['day', 'week', 'month'],
            default: 'day' 




  }, async (request: FastifyRequest<{ 
    Querystring: {
      targetId?: string;
      targetType?: string;
      dateFrom?: string;
      dateTo?: string;
      groupBy?: string;

>, reply: FastifyReply) => {
    try {
      // This would be implemented with analytics aggregation
      const analytics = {
        totalFeedback: 0,
        averageRating: 0,
        feedbackTrends: [],
        topCategories: [],
        responseTime: 0
      };
      
      reply.send({ success: true, analytics });
 catch (error) {
      fastify.log.error('Failed to get feedback analytics:', error);
      reply.code(400).send({
        error: 'Failed to get feedback analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // =============================================================================
  // Moderation Endpoints
  // =============================================================================

  /**
   * Moderate feedback (admin/moderator only)
   * POST /api/feedback/:feedbackId/moderate
   */
  fastify.post('/feedback/:feedbackId/moderate', {
    preHandler: [requireAuth], // Would need role-based auth
    schema: {
      params: {
        type: 'object',
        required: ['feedbackId'],
        properties: {
          feedbackId: { type: 'string', format: 'uuid' }


      body: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { 
            type: 'string', 
            enum: ['approve', 'reject', 'flag', 'archive'] 

          notes: { type: 'string', maxLength: 1000 },
          rejectionReason: { type: 'string', maxLength: 500 }



  }, async (request: FastifyRequest<{ 
    Params: FeedbackRouteParams; 
    Body: ModerateFeedbackRequest 
>, reply: FastifyReply) => {
    try {
      // Check if user has moderation permissions
      if (!request.user.roles?.includes('moderator') && !request.user.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Insufficient permissions',
          details: 'Moderation requires moderator or admin role'
        });


      const moderatorId = request.user.id;
      const feedback = await feedbackService.moderateFeedback(
        request.params.feedbackId,
        moderatorId,
        request.body
      );
      
      reply.send({ success: true, feedback });
 catch (error) {
      fastify.log.error('Failed to moderate feedback:', error);
      reply.code(400).send({
        error: 'Failed to moderate feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  /**
   * Get moderation queue
   * GET /api/feedback/moderation/queue
   */
  fastify.get('/feedback/moderation/queue', {
    preHandler: [requireAuth], // Would need role-based auth
    schema: {
      querystring: {
        type: 'object',
        properties: {
          queueType: { type: 'string' },
          priority: { type: 'integer', minimum: 1, maximum: 5 },
          assignedTo: { type: 'string', format: 'uuid' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }



  }, async (request: FastifyRequest<{ 
    Querystring: {
      queueType?: string;
      priority?: number;
      assignedTo?: string;
      limit?: number;
      offset?: number;

>, reply: FastifyReply) => {
    try {
      // Check if user has moderation permissions
      if (!request.user.roles?.includes('moderator') && !request.user.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Insufficient permissions',
          details: 'Viewing moderation queue requires moderator or admin role'
        });


      // This would be implemented in the service
      const queue = [];
      reply.send({ success: true, queue });
 catch (error) {
      fastify.log.error('Failed to get moderation queue:', error);
      reply.code(400).send({
        error: 'Failed to get moderation queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });

  // =============================================================================
  // Bulk Operations
  // =============================================================================

  /**
   * Bulk moderate feedback
   * POST /api/feedback/moderation/bulk
   */
  fastify.post('/feedback/moderation/bulk', {
    preHandler: [requireAuth], // Would need role-based auth
    schema: {
      body: {
        type: 'object',
        required: ['feedbackIds', 'action'],
        properties: {
          feedbackIds: { 
            type: 'array', 
            items: { type: 'string', format: 'uuid' },
            minItems: 1,
            maxItems: 50 

          action: { 
            type: 'string', 
            enum: ['approve', 'reject', 'flag', 'archive'] 

          notes: { type: 'string', maxLength: 1000 },
          rejectionReason: { type: 'string', maxLength: 500 }



  }, async (request: FastifyRequest<{ 
    Body: {
      feedbackIds: string[];
      action: 'approve' | 'reject' | 'flag' | 'archive';
      notes?: string;
      rejectionReason?: string;

>, reply: FastifyReply) => {
    try {
      // Check if user has moderation permissions
      if (!request.user.roles?.includes('moderator') && !request.user.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Insufficient permissions',
          details: 'Bulk moderation requires moderator or admin role'
        });


      const moderatorId = request.user.id;
      const results = [];

      for (const feedbackId of request.body.feedbackIds) {
        try {
          const feedback = await feedbackService.moderateFeedback(
            feedbackId,
            moderatorId,
            {
              action: request.body.action,
              notes: request.body.notes,
              rejectionReason: request.body.rejectionReason
            }
          );
          results.push({ feedbackId, success: true, feedback });
 catch (error) {
          results.push({ 
            feedbackId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });


      
      reply.send({ success: true, results });
 catch (error) {
      fastify.log.error('Failed to bulk moderate feedback:', error);
      reply.code(400).send({
        error: 'Failed to bulk moderate feedback',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

  });
