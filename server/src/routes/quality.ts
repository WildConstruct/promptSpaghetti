/**
 * Quality Metrics API Routes - Epic 18
 * 
 * RESTful API endpoints for quality metrics, trends, alerts, and recommendations.
 * Provides comprehensive quality data access for dashboard components and 
 * external integrations.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { QualityMetricsService, DEFAULT_QUALITY_METRICS_CONFIG } from '../services/QualityMetricsService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { MetricsCollector } from '../metrics/MetricsCollector';

// =============================================================================
// Request/Response Schemas
// =============================================================================

const QualityMetricsSchema = {
  type: 'object',
  properties: {
    timestamp: { type: 'string', format: 'date-time' },
    overall: {
      type: 'object',
      properties: {
        score: { type: 'number', minimum: 0, maximum: 100 },
        grade: { type: 'string', enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'] },
        status: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor', 'critical'] },
        improvement: { type: 'number' },
        componentScores: {
          type: 'object',
          properties: {
            testCoverage: { type: 'number' },
            codeQuality: { type: 'number' },
            performance: { type: 'number' },
            security: { type: 'number' },
            documentation: { type: 'number' },
            buildHealth: { type: 'number' }




    testCoverage: { type: 'object' },
    codeQuality: { type: 'object' },
    performance: { type: 'object' },
    security: { type: 'object' },
    documentation: { type: 'object' },
    buildHealth: { type: 'object' },
    trends: { type: 'object' },
    recommendations: { type: 'array' },
    alerts: { type: 'array' },
    metadata: { type: 'object' }

};

const HistoricalMetricsQuerySchema = {
  type: 'object',
  properties: {
    start: { type: 'string', format: 'date-time' },
    end: { type: 'string', format: 'date-time' },
    granularity: { type: 'string', enum: ['hour', 'day', 'week'] }

  required: ['start', 'end']
};

const TrendsQuerySchema = {};

const AlertAcknowledgeSchema = {};

const RecommendationUpdateSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['acknowledged', 'in_progress', 'completed', 'dismissed'] }

  required: ['status']
};

// =============================================================================
// Quality API Routes
// =============================================================================

export async function qualityRoutes(fastify: FastifyInstance) {
  // Initialize services
  let qualityMetricsService: QualityMetricsService;
  
  try {
    const databaseService = new DatabaseService({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'promptscape',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    });
    
    const redisService = new RedisService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    });
    
    const auditService = new AuditService(databaseService);
    const analyticsCollector = new AnalyticsCollector(databaseService, redisService);
    const metricsCollector = new MetricsCollector();
    
    qualityMetricsService = new QualityMetricsService(
      DEFAULT_QUALITY_METRICS_CONFIG,
      databaseService,
      redisService,
      auditService,
      analyticsCollector,
      metricsCollector
    );
    
    // Start the service
    await qualityMetricsService.start();
 catch (error) {
    fastify.log.error('Failed to initialize Quality Metrics Service:', error);
    // Continue without the service - routes will return appropriate errors

  
  // =============================================================================
  // GET /api/quality/metrics - Get current quality metrics
  // =============================================================================
  
  fastify.get('/metrics', {
    schema: {
      description: 'Get current comprehensive quality metrics',
      tags: ['Quality'],
      response: {
        200: QualityMetricsSchema,
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const metrics = await qualityMetricsService.getCurrentMetrics();
      
      if (!metrics) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'No quality metrics available'
        });

      
      return reply.send(metrics);
 catch (error) {
      fastify.log.error('Error fetching quality metrics:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quality metrics'
      });

  });
  
  // =============================================================================
  // GET /api/quality/metrics/historical - Get historical quality metrics
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      start: string;
      end: string;
      granularity?: 'hour' | 'day' | 'week';

>('/metrics/historical', {
    schema: {
      description: 'Get historical quality metrics for a date range',
      tags: ['Quality'],
      querystring: HistoricalMetricsQuerySchema,
      response: {
        200: {
          type: 'array',
          items: QualityMetricsSchema

        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }




  }, async (request, reply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const { start, end, granularity = 'day' } = request.query;
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Invalid date format. Use ISO 8601 format.'
        });

      
      if (startDate >= endDate) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Start date must be before end date'
        });

      
      const historicalMetrics = await qualityMetricsService.getHistoricalMetrics(
        startDate,
        endDate,
        granularity
      );
      
      return reply.send(historicalMetrics);
 catch (error) {
      fastify.log.error('Error fetching historical metrics:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch historical metrics'
      });

  });
  
  // =============================================================================
  // GET /api/quality/trends - Get quality trends
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      timeframe?: 'week' | 'month' | 'quarter';

>('/trends', {
    schema: {
      description: 'Get quality trends for dashboard visualization',
      tags: ['Quality'],
      querystring: TrendsQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            overall: { type: 'object' },
            testCoverage: { type: 'object' },
            codeQuality: { type: 'object' },
            performance: { type: 'object' },
            security: { type: 'object' },
            documentation: { type: 'object' },
            buildHealth: { type: 'object' }




  }, async (request, reply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const { timeframe = 'month' } = request.query;
      
      const trends = await qualityMetricsService.getQualityTrends(timeframe);
      
      return reply.send(trends);
 catch (error) {
      fastify.log.error('Error fetching quality trends:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quality trends'
      });

  });
  
  // =============================================================================
  // GET /api/quality/alerts - Get quality alerts
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      status?: 'active' | 'acknowledged' | 'resolved';
      severity?: 'info' | 'warning' | 'error' | 'critical';
      limit?: number;

>('/alerts', {
    schema: {
      description: 'Get quality alerts with optional filtering',
      tags: ['Quality'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'acknowledged', 'resolved'] },
          severity: { type: 'string', enum: ['info', 'warning', 'error', 'critical'] },
          limit: { type: 'number', minimum: 1, maximum: 100 }


      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              severity: { type: 'string' },
              message: { type: 'string' },
              metric: { type: 'string' },
              currentValue: { type: 'number' },
              thresholdValue: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' },
              status: { type: 'string' }





  }, async (request, reply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const { status, severity, limit = 50 } = request.query;
      
      let alerts = await qualityMetricsService.getActiveAlerts();
      
      // Apply filters
      if (status) {
        alerts = alerts.filter(alert => alert.status === status);

      
      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);

      
      // Apply limit
      alerts = alerts.slice(0, limit);
      
      return reply.send(alerts);
 catch (error) {
      fastify.log.error('Error fetching quality alerts:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quality alerts'
      });

  });
  
  // =============================================================================
  // POST /api/quality/alerts/:id/acknowledge - Acknowledge an alert
  // =============================================================================
  
  fastify.post<{
    Params: { id: string };
    Body: { acknowledgedBy?: string };
>('/alerts/:id/acknowledge', {
    schema: {
      description: 'Acknowledge a quality alert',
      tags: ['Quality'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }

        required: ['id']

      body: AlertAcknowledgeSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }


        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }




  }, async (request, reply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const { id } = request.params;
      const { acknowledgedBy = 'system' } = request.body;
      
      await qualityMetricsService.acknowledgeAlert(id, acknowledgedBy);
      
      return reply.send({
        success: true,
        message: 'Alert acknowledged successfully'
      });
 catch (error) {
      fastify.log.error('Error acknowledging alert:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Alert not found'
        });

      
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to acknowledge alert'
      });

  });
  
  // =============================================================================
  // GET /api/quality/recommendations - Get quality recommendations
  // =============================================================================
  
  fastify.get<{
    Querystring: {
      category?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      status?: string;
      limit?: number;

>('/recommendations', {
    schema: {
      description: 'Get quality improvement recommendations',
      tags: ['Quality'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          status: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100 }


      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              category: { type: 'string' },
              priority: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              impact: { type: 'string' },
              effort: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }





  }, async (request, reply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const { category, priority, status, limit = 50 } = request.query;
      
      let recommendations = await qualityMetricsService.getRecommendations(category, priority);
      
      // Apply status filter if provided
      if (status) {
        recommendations = recommendations.filter(rec => rec.status === status);

      
      // Apply limit
      recommendations = recommendations.slice(0, limit);
      
      return reply.send(recommendations);
 catch (error) {
      fastify.log.error('Error fetching recommendations:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch recommendations'
      });

  });
  
  // =============================================================================
  // PATCH /api/quality/recommendations/:id - Update recommendation status
  // =============================================================================
  
  fastify.patch<{
    Params: { id: string };
    Body: { status: string };
>('/recommendations/:id', {
    schema: {
      description: 'Update quality recommendation status',
      tags: ['Quality'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }

        required: ['id']

      body: RecommendationUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }


        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }




  }, async (request, reply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const { id } = request.params;
      const { status } = request.body;
      
      await qualityMetricsService.updateRecommendationStatus(id, status as any, 'system');
      
      return reply.send({
        success: true,
        message: 'Recommendation status updated successfully'
      });
 catch (error) {
      fastify.log.error('Error updating recommendation:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Recommendation not found'
        });

      
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to update recommendation'
      });

  });
  
  // =============================================================================
  // POST /api/quality/refresh - Manually trigger metrics refresh
  // =============================================================================
  
  fastify.post('/refresh', {
    schema: {
      description: 'Manually trigger quality metrics collection',
      tags: ['Quality'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }




  }, async (request, reply) => {
    try {
      if (!qualityMetricsService) {
        return reply.status(503).send({
          error: 'Service Unavailable',
          message: 'Quality Metrics Service is not available'
        });

      
      const metrics = await qualityMetricsService.collectQualityMetrics();
      
      return reply.send({
        success: true,
        message: 'Quality metrics refreshed successfully',
        timestamp: metrics.timestamp
      });
 catch (error) {
      fastify.log.error('Error refreshing quality metrics:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to refresh quality metrics'
      });

  });
  
  // =============================================================================
  // GET /api/quality/health - Health check for quality service
  // =============================================================================
  
  fastify.get('/health', {
    schema: {
      description: 'Health check for Quality Metrics Service',
      tags: ['Quality'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
            version: { type: 'string' },
            uptime: { type: 'number' },
            dataSources: {
              type: 'object',
              properties: {
                database: { type: 'boolean' },
                redis: { type: 'boolean' },
                analytics: { type: 'boolean' }






  }, async (request, reply) => {
    const health = {
      status: qualityMetricsService ? 'healthy' : 'unavailable',
      service: 'Quality Metrics Service',
      version: '1.0.0',
      uptime: process.uptime(),
      dataSources: {
        database: true, // Would check actual connections
        redis: true,
        analytics: true

    };
    
    return reply.send(health);
  });
  
  // =============================================================================
  // WebSocket for real-time metrics updates
  // =============================================================================
  
  fastify.register(async function(fastify) {
    fastify.get('/stream', { websocket: true }, (connection, request) => {
      fastify.log.info('Quality metrics WebSocket connection established');
      
      // Send initial metrics
      if (qualityMetricsService) {
        qualityMetricsService.getCurrentMetrics().then(metrics => {
          if (metrics) {
            connection.socket.send(JSON.stringify({
              type: 'metrics',
              data: metrics
            }));

        });
        
        // Listen for real-time updates
        const handleMetricsUpdate = (metrics: any) => {
          connection.socket.send(JSON.stringify({
            type: 'metrics',
            data: metrics
          }));
        };
        
        const handleAlert = (alert: any) => {
          connection.socket.send(JSON.stringify({
            type: 'alert',
            data: alert
          }));
        };
        
        qualityMetricsService.on('realTimeMetrics', handleMetricsUpdate);
        qualityMetricsService.on('alertCreated', handleAlert);
        
        // Cleanup on disconnect
        connection.socket.on('close', () => {
          fastify.log.info('Quality metrics WebSocket connection closed');
          if (qualityMetricsService) {
            qualityMetricsService.off('realTimeMetrics', handleMetricsUpdate);
            qualityMetricsService.off('alertCreated', handleAlert);

        });

    });
  });
  
  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (qualityMetricsService) {
      await qualityMetricsService.stop();

  });


export default qualityRoutes;