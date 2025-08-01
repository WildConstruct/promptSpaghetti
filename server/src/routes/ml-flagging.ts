/**
 * ML Flagging API Routes
 * 
 * Provides REST endpoints for machine learning-based content flagging:
 * - Flag content using ML models and rule-based fallbacks
 * - Get flagging statistics and reports
 * - Manage flagging events and reviews
 * - Configure ML models and policies
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MLFlaggingService, FlaggingRequest, FlaggingCategory } from '../ml/MLFlaggingService';
import { DatabaseConnection } from '../database/connection';
import { AuditService } from '../auth/services/AuditService';
import { requirePermission } from '../middleware/auth';



interface FlagContentBody {
  content: string;
  contentType: 'text' | 'json' | 'graph' | 'prompt' | 'code';
  categories: FlaggingCategory[];
  context?: {
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;



  };




interface FlaggingStatsQuery {
  organizationId?: string;
  startDate?: string;
  endDate?: string;







interface RecentEventsQuery {
  limit?: string;
  organizationId?: string;
  flaggedOnly?: string;







interface UpdateReviewBody {
  status: 'approved' | 'rejected' | 'escalated';
  notes?: string;







interface UpdateReviewParams {
  eventId: string;





export async function mlFlaggingRoutes(fastify: FastifyInstance) {
  const db = fastify.db as DatabaseConnection;
  const auditService = new AuditService(db);
  const mlFlaggingService = MLFlaggingService.getInstance(db, auditService, {
    enableContentModeration: process.env.ENABLE_CONTENT_MODERATION === 'true',
    enableSecurityThreatDetection: process.env.ENABLE_SECURITY_DETECTION === 'true',
    enableComplianceChecking: process.env.ENABLE_COMPLIANCE_CHECKING === 'true',
    enablePromptInjectionDetection: process.env.ENABLE_PROMPT_INJECTION_DETECTION === 'true',
    confidenceThreshold: parseFloat(process.env.ML_CONFIDENCE_THRESHOLD || '0.7'),
    autoActionThreshold: parseFloat(process.env.ML_AUTO_ACTION_THRESHOLD || '0.9'),
    modelEndpoints: {
      contentModeration: process.env.CONTENT_MODERATION_API_URL,
      securityThreat: process.env.SECURITY_THREAT_API_URL,
      compliance: process.env.COMPLIANCE_API_URL,
      promptInjection: process.env.PROMPT_INJECTION_API_URL

  });

  // Initialize the service
  fastify.addHook('onReady', async () => {
    await mlFlaggingService.initialize();
  });

  /**
   * POST /api/ml-flagging/flag
   * Flag content using ML models and rule-based detection
   */
  fastify.post<{
    Body: FlagContentBody;
>('/flag', {
    preHandler: requirePermission('perm_use_ml_flagging'),
    schema: {
      body: {
        type: 'object',
        required: ['content', 'contentType', 'categories'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 50000 },
          contentType: { 
            type: 'string', 
            enum: ['text', 'json', 'graph', 'prompt', 'code'] 

          categories: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'content_moderation', 'security_threat', 'compliance_violation',
                'anomaly_detection', 'prompt_injection', 'data_leak', 'malware', 'phishing'
              ]

            minItems: 1

          context: {
            type: 'object',
            properties: {
              userAgent: { type: 'string' },
              ipAddress: { type: 'string' },
              sessionId: { type: 'string' },
              requestId: { type: 'string' },
              metadata: { type: 'object' }




      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            result: {
              type: 'object',
              properties: {
                flagged: { type: 'boolean' },
                confidence: { type: 'number' },
                riskLevel: { 
                  type: 'string', 
                  enum: ['low', 'medium', 'high', 'critical'] 

                recommendedAction: { 
                  type: 'string', 
                  enum: ['allow', 'warn', 'block', 'review', 'quarantine'] 

                explanation: { type: 'string' },
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string' },
                      confidence: { type: 'number' },
                      details: { type: 'string' },
                      severity: { type: 'string' }



                processingTime: { type: 'number' },
                fallbackUsed: { type: 'boolean' }






  }, async (request: FastifyRequest<{ Body: FlagContentBody }>, reply: FastifyReply) => {
    try {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ success: false, error: 'User not authenticated' });


      const flaggingRequest: FlaggingRequest = {
        content: request.body.content,
        contentType: request.body.contentType,
        userId: user.id,
        organizationId: user.organizationId,
        context: {
          ...request.body.context,
          userAgent: request.headers['user-agent'],
          ipAddress: request.ip,
          timestamp: new Date()

        categories: request.body.categories
      };

      const result = await mlFlaggingService.flagContent(flaggingRequest);

      return reply.code(200).send({
        success: true,
        result
      });
 catch (error) {
      request.log.error({ error }, 'Content flagging failed');
      return reply.code(500).send({
        success: false,
        error: 'Content flagging failed'
      });

  });

  /**
   * GET /api/ml-flagging/stats
   * Get flagging statistics and metrics
   */
  fastify.get<{
    Querystring: FlaggingStatsQuery;
>('/stats', {
    preHandler: requirePermission('perm_view_ml_flagging'),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          organizationId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            stats: {
              type: 'object',
              properties: {
                totalRequests: { type: 'number' },
                flaggedRequests: { type: 'number' },
                flaggedRate: { type: 'number' },
                categoryCounts: { type: 'object' },
                riskLevelCounts: { type: 'object' },
                actionCounts: { type: 'object' },
                averageConfidence: { type: 'number' },
                averageProcessingTime: { type: 'number' },
                modelAccuracy: { type: 'object' }






  }, async (request: FastifyRequest<{ Querystring: FlaggingStatsQuery }>, reply: FastifyReply) => {
    try {
      const { organizationId, startDate, endDate } = request.query;

      const stats = await mlFlaggingService.getFlaggingStats(
        organizationId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return reply.code(200).send({
        success: true,
        stats
      });
 catch (error) {
      request.log.error({ error }, 'Failed to get flagging statistics');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get flagging statistics'
      });

  });

  /**
   * GET /api/ml-flagging/events
   * Get recent flagging events
   */
  fastify.get<{
    Querystring: RecentEventsQuery;
>('/events', {
    preHandler: requirePermission('perm_view_ml_flagging'),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string', pattern: '^[0-9]+$' },
          organizationId: { type: 'string' },
          flaggedOnly: { type: 'string', enum: ['true', 'false'] }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  requestId: { type: 'string' },
                  content: { type: 'string' },
                  contentType: { type: 'string' },
                  userId: { type: 'string' },
                  organizationId: { type: 'string' },
                  result: { type: 'object' },
                  timestamp: { type: 'string' },
                  processed: { type: 'boolean' },
                  reviewStatus: { type: 'string' }







  }, async (request: FastifyRequest<{ Querystring: RecentEventsQuery }>, reply: FastifyReply) => {
    try {
      const limit = request.query.limit ? parseInt(request.query.limit, 10) : 100;
      const flaggedOnly = request.query.flaggedOnly === 'true';

      const events = await mlFlaggingService.getRecentEvents(
        Math.min(limit, 1000), // Cap at 1000 events
        request.query.organizationId,
        flaggedOnly
      );

      return reply.code(200).send({
        success: true,
        events: events.map(event => ({
          ...event,
          // Truncate content for API response
          content: event.content.length > 500 
            ? event.content.substring(0, 500) + '...' 
            : event.content
        }))
      });
 catch (error) {
      request.log.error({ error }, 'Failed to get flagging events');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get flagging events'
      });

  });

  /**
   * PUT /api/ml-flagging/events/:eventId/review
   * Update review status of a flagging event
   */
  fastify.put<{
    Params: UpdateReviewParams;
    Body: UpdateReviewBody;
>('/events/:eventId/review', {
    preHandler: requirePermission('perm_review_ml_flagging'),
    schema: {
      params: {
        type: 'object',
        required: ['eventId'],
        properties: {
          eventId: { type: 'string' }


      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { 
            type: 'string', 
            enum: ['approved', 'rejected', 'escalated'] 

          notes: { type: 'string', maxLength: 1000 }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }




  }, async (request: FastifyRequest<{ 
    Params: UpdateReviewParams; 
    Body: UpdateReviewBody; 
>, reply: FastifyReply) => {
    try {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ success: false, error: 'User not authenticated' });


      const { eventId } = request.params;
      const { status, notes } = request.body;

      const success = await mlFlaggingService.updateReviewStatus(
        eventId,
        status,
        user.id,
        notes
      );

      if (success) {
        return reply.code(200).send({
          success: true,
          message: 'Review status updated successfully'
        });
 else {
        return reply.code(404).send({
          success: false,
          error: 'Flagging event not found'
        });

 catch (error) {
      request.log.error({ error }, 'Failed to update review status');
      return reply.code(500).send({
        success: false,
        error: 'Failed to update review status'
      });

  });

  /**
   * GET /api/ml-flagging/models
   * Get available ML models and their status
   */
  fastify.get('/models', {
    preHandler: requirePermission('perm_manage_ml_flagging'),
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            models: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  version: { type: 'string' },
                  category: { type: 'string' },
                  isActive: { type: 'boolean' },
                  accuracy: { type: 'number' },
                  lastUpdated: { type: 'string' }







  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const models = await db.query(`
        SELECT id, name, version, category, is_active, accuracy, last_updated
        FROM ml_models 
        ORDER BY category, name
      `);

      return reply.code(200).send({
        success: true,
        models: models.map((model: any) => ({
          id: model.id,
          name: model.name,
          version: model.version,
          category: model.category,
          isActive: Boolean(model.is_active),
          accuracy: model.accuracy,
          lastUpdated: model.last_updated?.toISOString()
        }))
      });
 catch (error) {
      request.log.error({ error }, 'Failed to get ML models');
      return reply.code(500).send({
        success: false,
        error: 'Failed to get ML models'
      });

  });

  /**
   * POST /api/ml-flagging/test
   * Test endpoint for ML flagging (development/debugging)
   */
  if (process.env.NODE_ENV === 'development') {
    fastify.post('/test', {
      schema: {
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            categories: {
              type: 'array',
              items: { type: 'string' }




    }, async (request: FastifyRequest<{
      Body: { content: string; categories?: string[] };
>, reply: FastifyReply) => {
      try {
        const flaggingRequest: FlaggingRequest = {
          content: request.body.content,
          contentType: 'text',
          categories: (request.body.categories as FlaggingCategory[]) || ['content_moderation', 'security_threat', 'prompt_injection']
        };

        const result = await mlFlaggingService.flagContent(flaggingRequest);

        return reply.code(200).send({
          success: true,
          result,
          debug: {
            environment: 'development',
            timestamp: new Date().toISOString()

        });
 catch (error) {
        request.log.error({ error }, 'Test flagging failed');
        return reply.code(500).send({
          success: false,
          error: 'Test flagging failed'
        });

    });


  /**
   * GET /api/ml-flagging/health
   * Health check for ML flagging system
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Basic health checks
      const stats = await mlFlaggingService.getFlaggingStats();
      const recentEvents = await mlFlaggingService.getRecentEvents(10);
      
      const isHealthy = true; // Could add more sophisticated health checks

      return reply.code(200).send({
        success: true,
        healthy: isHealthy,
        stats: {
          totalRequests: stats.totalRequests,
          flaggedRate: stats.flaggedRate,
          averageProcessingTime: stats.averageProcessingTime,
          recentEvents: recentEvents.length

        timestamp: new Date().toISOString()
      });
 catch (error) {
      request.log.error({ error }, 'ML flagging health check failed');
      return reply.code(503).send({
        success: false,
        healthy: false,
        error: 'Health check failed'
      });

  });

  /**
   * POST /api/ml-flagging/bulk-flag
   * Bulk flag multiple pieces of content
   */
  fastify.post('/bulk-flag', {
    preHandler: requirePermission('perm_use_ml_flagging'),
    schema: {
      body: {
        type: 'object',
        required: ['requests'],
        properties: {
          requests: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'content', 'contentType', 'categories'],
              properties: {
                id: { type: 'string' },
                content: { type: 'string', maxLength: 10000 },
                contentType: { type: 'string' },
                categories: {
                  type: 'array',
                  items: { type: 'string' }



            maxItems: 100




  }, async (request: FastifyRequest<{
    Body: { 
      requests: Array<{
        id: string;
        content: string;
        contentType: string;
        categories: string[];
>; 
    };
>, reply: FastifyReply) => {
    try {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ success: false, error: 'User not authenticated' });


      const results = await Promise.all(
        request.body.requests.map(async (req) => {
          try {
            const flaggingRequest: FlaggingRequest = {
              content: req.content,
              contentType: req.contentType as any,
              userId: user.id,
              organizationId: user.organizationId,
              categories: req.categories as FlaggingCategory[]
            };

            const result = await mlFlaggingService.flagContent(flaggingRequest);
            return { id: req.id, success: true, result };
 catch (error) {
            return { 
              id: req.id, 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            };

      );

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;

      return reply.code(200).send({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: errorCount

      });
 catch (error) {
      request.log.error({ error }, 'Bulk flagging failed');
      return reply.code(500).send({
        success: false,
        error: 'Bulk flagging failed'
      });

  });


export default mlFlaggingRoutes;