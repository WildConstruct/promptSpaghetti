// Epic 16.1.6 - Review System Routes
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ReviewService } from './review.service.js';
import {
  CreateReviewSchema,
  UpdateReviewSchema,
  ReviewFiltersSchema,
  VoteHelpfulnessSchema,
  FlagReviewSchema,
  CreatorResponseSchema,
  ModerationActionSchema,
  ReviewAnalyticsSchema
 from './review.types.js';

export async function reviewRoutes(fastify: FastifyInstance) {
  const reviewService = new ReviewService(fastify);

  // =============================================
  // Review Management Routes
  // =============================================

  // Create a new review
  fastify.post('/reviews', {
    preHandler: [fastify.authenticate],
    schema: {
      body: CreateReviewSchema,
      response: {
        201: z.object({
          review: z.any() // ReviewWithDetails type



  }, async (request, reply) => {
    try {
      const review = await reviewService.createReview(request.user.id, request.body);
      reply.code(201).send({ review });
 catch (error) {
      fastify.log.error('Create review error:', error);
      
      if (error.message.includes('must purchase') || 
          error.message.includes('already reviewed')) {
        reply.code(400).send({ error: error.message });
 else {
        reply.code(500).send({ error: 'Failed to create review' });


  });

  // Update a review
  fastify.put('/reviews/:reviewId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        reviewId: z.string().uuid()
      }),
      body: UpdateReviewSchema,
      response: {
        200: z.object({
          review: z.any() // ReviewWithDetails type



  }, async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const review = await reviewService.updateReview(reviewId, request.user.id, request.body);
      reply.send({ review });
 catch (error) {
      fastify.log.error('Update review error:', error);
      
      if (error.message.includes('not found') || 
          error.message.includes('not owned') ||
          error.message.includes('no longer be edited')) {
        reply.code(400).send({ error: error.message });
 else {
        reply.code(500).send({ error: 'Failed to update review' });


  });

  // Delete a review
  fastify.delete('/reviews/:reviewId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        reviewId: z.string().uuid()
      }),
      response: {
        200: z.object({
          success: z.boolean()



  }, async (request, reply) => {
    try {
      const { reviewId } = request.params;
      await reviewService.deleteReview(reviewId, request.user.id);
      reply.send({ success: true });
 catch (error) {
      fastify.log.error('Delete review error:', error);
      
      if (error.message.includes('not found') || error.message.includes('not owned')) {
        reply.code(400).send({ error: error.message });
 else {
        reply.code(500).send({ error: 'Failed to delete review' });


  });

  // Get a specific review
  fastify.get('/reviews/:reviewId', {
    schema: {
      params: z.object({
        reviewId: z.string().uuid()
      }),
      response: {
        200: z.object({
          review: z.any() // ReviewWithDetails type



  }, async (request, reply) => {
    try {
      const { reviewId } = request.params;
      const review = await reviewService.getReviewById(reviewId);
      
      if (!review) {
        reply.code(404).send({ error: 'Review not found' });
        return;

      
      reply.send({ review });
 catch (error) {
      fastify.log.error('Get review error:', error);
      reply.code(500).send({ error: 'Failed to get review' });

  });

  // =============================================
  // Template Review Routes
  // =============================================

  // Get reviews for a template
  fastify.get('/templates/:templateId/reviews', {
    schema: {
      params: z.object({
        templateId: z.string().uuid()
      }),
      querystring: ReviewFiltersSchema,
      response: {
        200: z.object({
          reviews: z.array(z.any()), // ReviewWithDetails[] type
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          hasMore: z.boolean(),
          metrics: z.any() // ReviewMetrics type



  }, async (request, reply) => {
    try {
      const { templateId } = request.params;
      const { page, limit, ...filters } = request.query;
      
      const result = await reviewService.getReviewsForTemplate(
        templateId,
        filters,
        { page, limit }
      );
      
      reply.send(result);
 catch (error) {
      fastify.log.error('Get template reviews error:', error);
      reply.code(500).send({ error: 'Failed to get template reviews' });

  });

  // Get template review metrics
  fastify.get('/templates/:templateId/reviews/metrics', {
    schema: {
      params: z.object({
        templateId: z.string().uuid()
      }),
      response: {
        200: z.object({
          metrics: z.any() // ReviewMetrics type



  }, async (request, reply) => {
    try {
      const { templateId } = request.params;
      const metrics = await reviewService.getTemplateMetrics(templateId);
      reply.send({ metrics });
 catch (error) {
      fastify.log.error('Get template metrics error:', error);
      reply.code(500).send({ error: 'Failed to get template metrics' });

  });

  // =============================================
  // Review Interaction Routes
  // =============================================

  // Vote on review helpfulness
  fastify.post('/reviews/helpfulness', {
    preHandler: [fastify.authenticate],
    schema: {
      body: VoteHelpfulnessSchema,
      response: {
        200: z.object({
          success: z.boolean()



  }, async (request, reply) => {
    try {
      const { review_id, vote } = request.body;
      await reviewService.voteHelpfulness(review_id, request.user.id, vote);
      reply.send({ success: true });
 catch (error) {
      fastify.log.error('Vote helpfulness error:', error);
      reply.code(500).send({ error: 'Failed to vote on review helpfulness' });

  });

  // Flag a review
  fastify.post('/reviews/flag', {
    preHandler: [fastify.authenticate],
    schema: {
      body: FlagReviewSchema,
      response: {
        200: z.object({
          success: z.boolean()



  }, async (request, reply) => {
    try {
      const { review_id, flag_type, reason } = request.body;
      await reviewService.flagReview(review_id, request.user.id, flag_type, reason);
      reply.send({ success: true });
 catch (error) {
      fastify.log.error('Flag review error:', error);
      
      if (error.message.includes('already flagged')) {
        reply.code(400).send({ error: error.message });
 else {
        reply.code(500).send({ error: 'Failed to flag review' });


  });

  // =============================================
  // Creator Response Routes
  // =============================================

  // Create creator response
  fastify.post('/reviews/response', {
    preHandler: [fastify.authenticate],
    schema: {
      body: CreatorResponseSchema,
      response: {
        201: z.object({
          response: z.any() // CreatorResponse type



  }, async (request, reply) => {
    try {
      const { review_id, response } = request.body;
      const creatorResponse = await reviewService.createCreatorResponse(
        review_id,
        request.user.id,
        response
      );
      reply.code(201).send({ response: creatorResponse });
 catch (error) {
      fastify.log.error('Create creator response error:', error);
      
      if (error.message.includes('not found') || 
          error.message.includes('own templates') ||
          error.message.includes('already responded')) {
        reply.code(400).send({ error: error.message });
 else {
        reply.code(500).send({ error: 'Failed to create creator response' });


  });

  // Update creator response
  fastify.put('/reviews/response/:responseId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        responseId: z.string().uuid()
      }),
      body: z.object({
        response: z.string().min(10).max(1000)
      }),
      response: {
        200: z.object({
          response: z.any() // CreatorResponse type



  }, async (request, reply) => {
    try {
      const { responseId } = request.params;
      const { response } = request.body;
      
      // Check if user owns this response
      const existingResponse = await fastify.db.query(
        'SELECT * FROM creator_responses WHERE id = ? AND creator_id = ?',
        [responseId, request.user.id]
      );
      
      if (existingResponse.length === 0) {
        reply.code(404).send({ error: 'Response not found or not owned by user' });
        return;

      
      await fastify.db.query(
        'UPDATE creator_responses SET response = ?, updated_at = datetime("now") WHERE id = ?',
        [response, responseId]
      );
      
      const updatedResponse = await fastify.db.query(
        'SELECT * FROM creator_responses WHERE id = ?',
        [responseId]
      );
      
      reply.send({ response: updatedResponse[0] });
 catch (error) {
      fastify.log.error('Update creator response error:', error);
      reply.code(500).send({ error: 'Failed to update creator response' });

  });

  // Delete creator response
  fastify.delete('/reviews/response/:responseId', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        responseId: z.string().uuid()
      }),
      response: {
        200: z.object({
          success: z.boolean()



  }, async (request, reply) => {
    try {
      const { responseId } = request.params;
      
      // Check if user owns this response
      const existingResponse = await fastify.db.query(
        'SELECT * FROM creator_responses WHERE id = ? AND creator_id = ?',
        [responseId, request.user.id]
      );
      
      if (existingResponse.length === 0) {
        reply.code(404).send({ error: 'Response not found or not owned by user' });
        return;

      
      await fastify.db.query(
        'DELETE FROM creator_responses WHERE id = ?',
        [responseId]
      );
      
      reply.send({ success: true });
 catch (error) {
      fastify.log.error('Delete creator response error:', error);
      reply.code(500).send({ error: 'Failed to delete creator response' });

  });

  // =============================================
  // Moderation Routes (Admin Only)
  // =============================================

  // Get moderation queue
  fastify.get('/reviews/moderation/queue', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      response: {
        200: z.object({
          moderation_queue: z.any() // ReviewModerationQueue type



  }, async (request, reply) => {
    try {
      const moderationQueue = await reviewService.getModerationQueue();
      reply.send({ moderation_queue: moderationQueue });
 catch (error) {
      fastify.log.error('Get moderation queue error:', error);
      reply.code(500).send({ error: 'Failed to get moderation queue' });

  });

  // Take moderation action
  fastify.post('/reviews/moderation/action', {
    preHandler: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      body: ModerationActionSchema,
      response: {
        200: z.object({
          success: z.boolean()



  }, async (request, reply) => {
    try {
      const { review_id, action, reason } = request.body;
      
      switch (action) {
      case 'approve':
        await reviewService.approveReview(review_id, request.user.id);
        break;
      case 'reject':
        await reviewService.rejectReview(review_id, request.user.id, reason || 'Rejected by moderator');
        break;
      case 'flag':
        await reviewService.flagReview(review_id, request.user.id, 'inappropriate', reason);
        break;
      case 'hide':
        await reviewService.hideReview(review_id, reason || 'Hidden by moderator');
        break;
      default:
        reply.code(400).send({ error: 'Invalid moderation action' });
        return;

      
      // Update moderation queue
      await fastify.db.query(
        'UPDATE review_moderation_queue SET status = ?, completed_at = datetime("now") WHERE review_id = ?',
        ['completed', review_id]
      );
      
      reply.send({ success: true });
 catch (error) {
      fastify.log.error('Moderation action error:', error);
      reply.code(500).send({ error: 'Failed to perform moderation action' });

  });

  // =============================================
  // Analytics Routes
  // =============================================

  // Get review analytics
  fastify.get('/reviews/analytics', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: ReviewAnalyticsSchema,
      response: {
        200: z.object({
          analytics: z.any() // ReviewAnalytics type



  }, async (request, reply) => {
    try {
      const { template_id, period, include_trends, include_keywords, include_sentiment } = request.query;
      
      // Calculate date range
      const periodDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const daysBack = periodDays[period] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      
      let whereClause = 'created_at >= ? AND status = ?';
      const params = [startDate.toISOString(), 'approved'];
      
      if (template_id) {
        whereClause += ' AND template_id = ?';
        params.push(template_id);

      
      // Check if user has permission to view analytics
      if (template_id && !request.user.roles?.includes('admin')) {
        const templateCheck = await fastify.db.query(
          'SELECT owner_id FROM marketplace_templates WHERE id = ?',
          [template_id]
        );
        
        if (templateCheck.length === 0 || templateCheck[0].owner_id !== request.user.id) {
          reply.code(403).send({ error: 'Access denied' });
          return;


      
      // Get basic metrics
      const metricsResult = await fastify.db.query(
        `SELECT 
           COUNT(*) as total_reviews,
           AVG(stars) as average_rating,
           COUNT(CASE WHEN stars = 5 THEN 1 END) as five_star,
           COUNT(CASE WHEN stars = 4 THEN 1 END) as four_star,
           COUNT(CASE WHEN stars = 3 THEN 1 END) as three_star,
           COUNT(CASE WHEN stars = 2 THEN 1 END) as two_star,
           COUNT(CASE WHEN stars = 1 THEN 1 END) as one_star,
           COUNT(CASE WHEN verified_purchase = true THEN 1 END) as verified_count
         FROM template_reviews 
         WHERE ${whereClause}`,
        params
      );
      
      const metrics = metricsResult[0];
      
      const analytics = {
        template_id: template_id || null,
        period_start: startDate,
        period_end: new Date(),
        metrics: {
          total_reviews: metrics.total_reviews || 0,
          average_rating: parseFloat(metrics.average_rating) || 0,
          rating_distribution: {
            five_star: metrics.five_star || 0,
            four_star: metrics.four_star || 0,
            three_star: metrics.three_star || 0,
            two_star: metrics.two_star || 0,
            one_star: metrics.one_star || 0

          verified_percentage: metrics.total_reviews > 0 ? 
            (metrics.verified_count / metrics.total_reviews) * 100 : 0

        trends: {},
        top_keywords: [],
        common_use_cases: [],
        difficulty_distribution: []
      };
      
      // Add trends if requested
      if (include_trends) {
        const trendsResult = await fastify.db.query(
          `SELECT 
             DATE(created_at) as date,
             COUNT(*) as count,
             AVG(stars) as avg_rating
           FROM template_reviews 
           WHERE ${whereClause}
           GROUP BY DATE(created_at)
           ORDER BY date`,
          params
        );
        
        analytics.trends = {
          daily_reviews: trendsResult.map(row => ({
            date: row.date,
            count: row.count,
            avg_rating: parseFloat(row.avg_rating)
          })),
          rating_trends: trendsResult.map(row => ({
            date: row.date,
            rating: parseFloat(row.avg_rating)
          })),
          sentiment_trends: [] // Would implement with sentiment analysis
        };

      
      // Add keyword analysis if requested
      if (include_keywords) {
        const keywordResult = await fastify.db.query(
          `SELECT 
             keyword,
             COUNT(*) as count,
             sentiment
           FROM review_keywords rk
           JOIN template_reviews tr ON rk.review_id = tr.id
           WHERE tr.${whereClause.replace('created_at', 'tr.created_at').replace('status', 'tr.status')}
           GROUP BY keyword, sentiment
           ORDER BY count DESC
           LIMIT 20`,
          params
        );
        
        analytics.top_keywords = keywordResult.map(row => ({
          keyword: row.keyword,
          count: row.count,
          sentiment: row.sentiment
        }));

      
      reply.send({ analytics });
 catch (error) {
      fastify.log.error('Get review analytics error:', error);
      reply.code(500).send({ error: 'Failed to get review analytics' });

  });

  // =============================================
  // User Review Routes
  // =============================================

  // Get user's reviews
  fastify.get('/users/:userId/reviews', {
    preHandler: [fastify.authenticate],
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20)
      }),
      response: {
        200: z.object({
          reviews: z.array(z.any()), // ReviewWithDetails[] type
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          hasMore: z.boolean()



  }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const { page, limit } = request.query;
      
      // Check if user can view these reviews
      if (userId !== request.user.id && !request.user.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Access denied' });
        return;

      
      const offset = (page - 1) * limit;
      
      const reviews = await fastify.db.query(
        'SELECT * FROM template_reviews WHERE buyer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [userId, limit, offset]
      );
      
      const totalResult = await fastify.db.query(
        'SELECT COUNT(*) as count FROM template_reviews WHERE buyer_id = ?',
        [userId]
      );
      
      const total = totalResult[0].count;
      const hasMore = offset + limit < total;
      
      // Enhance reviews with additional data
      const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          // Get template info
          const templateResult = await fastify.db.query(
            'SELECT title FROM marketplace_templates WHERE id = ?',
            [review.template_id]
          );
          
          return {
            ...review,
            template: templateResult[0],
            pros: JSON.parse(review.pros || '[]'),
            cons: JSON.parse(review.cons || '[]'),
            created_at: new Date(review.created_at),
            updated_at: new Date(review.updated_at)
          };

      );
      
      reply.send({
        reviews: enhancedReviews,
        total,
        page,
        limit,
        hasMore
      });
 catch (error) {
      fastify.log.error('Get user reviews error:', error);
      reply.code(500).send({ error: 'Failed to get user reviews' });

  });
