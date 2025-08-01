/**
 * API Management Admin Routes - Epic 17.4.4 API Management System
 * 
 * Comprehensive admin endpoints for the API Management Dashboard,
 * providing enhanced analytics, monitoring, and administrative controls.
 * 
 * Task: E17-1753114397211-324330 - Design API management system
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ApiManagementService } from '../services/ApiManagementService';
import { ApiKeyManagementService } from '../../auth/services/ApiKeyManagementService';
import { DatabaseService } from '../../database/DatabaseService';
import { AuditService } from '../../auth/services/AuditService';

// Validation schemas
const timeRangeSchema = z.enum(['1h', '6h', '24h', '7d', '30d']);

const analyticsRequestSchema = z.object({
  keyId: z.string().uuid().optional(),
  timeRange: timeRangeSchema.default('24h'),
  includeEndpoints: z.boolean().default(true),
  includeTrends: z.boolean().default(true)
});

const reportGenerationSchema = z.object({
  keyId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['json', 'csv', 'excel']).default('json'),
  includeInsights: z.boolean().default(true)
});

const alertConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  enabled: z.boolean(),
  conditions: z.object({
    errorRateThreshold: z.number().min(0).max(1).optional(),
    latencyThreshold: z.number().min(0).optional(),
    usageSpike: z.number().min(0).optional(),
    rateLimitViolations: z.number().min(0).optional(),
    timeWindow: z.number().min(1).max(1440) // 1 minute to 24 hours
  }),
  actions: z.object({
    email: z.array(z.string().email()).optional(),
    webhook: z.string().url().optional(),
    autoSuspend: z.boolean().optional(),
    escalation: z.object({
      afterMinutes: z.number().min(1),
      contacts: z.array(z.string().email())
    }).optional()

});

const exportRequestSchema = z.object({
  format: z.enum(['json', 'csv', 'excel']),
  filters: z.object({
    keyIds: z.array(z.string().uuid()).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    includeErrors: z.boolean().default(true),
    includeSuccessful: z.boolean().default(true)
  }).optional()
});



interface AdminRouteContext {
  databaseService: DatabaseService;
  auditService: AuditService;
  apiKeyService: ApiKeyManagementService;





export async function apiManagementAdminRoutes(
  fastify: FastifyInstance,
  context: AdminRouteContext
) {
  const { databaseService, auditService, apiKeyService } = context;
  
  // Initialize API Management Service
  const apiManagementService = new ApiManagementService(
    databaseService,
    apiKeyService,
    auditService
  );

  // Admin authorization middleware
  const requireAdminAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    await fastify.authenticate(request, reply);
    
    const userRoles = (request.user as any)?.roles || [];
    const hasAdminRole = userRoles.includes('super_admin') || userRoles.includes('admin');
    
    if (!hasAdminRole) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Administrator privileges required'
      });

  };

  /**
   * Get comprehensive dashboard metrics
   */
  fastify.get('/admin/api-management/dashboard', {
    preHandler: [requireAdminAuth],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeRange: { type: 'string', enum: ['1h', '6h', '24h', '7d', '30d'], default: '24h' }


      response: {
        200: {
          type: 'object',
          properties: {
            metrics: { type: 'object' },
            timestamp: { type: 'string' },
            timeRange: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { timeRange } = request.query as { timeRange: '1h' | '6h' | '24h' | '7d' | '30d' };
      
      const metrics = await apiManagementService.getDashboardMetrics(timeRange);
      
      return reply.send({
        metrics,
        timestamp: new Date().toISOString(),
        timeRange
      });
 catch (error) {
      fastify.log.error('Dashboard metrics error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch dashboard metrics'
      });

  });

  /**
   * Get system health metrics
   */
  fastify.get('/admin/api-management/health', {
    preHandler: [requireAdminAuth],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            health: { type: 'object' },
            timestamp: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const health = await apiManagementService.getSystemHealthMetrics();
      
      return reply.send({
        health,
        timestamp: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error('System health error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch system health metrics'
      });

  });

  /**
   * Get detailed analytics for a specific API key
   */
  fastify.get<{
    Params: { keyId: string };
>('/admin/api-management/analytics/:keyId', {
    preHandler: [requireAdminAuth],
    schema: {
      params: {
        type: 'object',
        properties: {
          keyId: { type: 'string', format: 'uuid' }

        required: ['keyId']

      response: {
        200: {
          type: 'object',
          properties: {
            analytics: { type: 'object' },
            timestamp: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { keyId } = request.params as { keyId: string };
      
      const analytics = await apiManagementService.getApiKeyAnalytics(keyId);
      
      return reply.send({
        analytics,
        timestamp: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error('API key analytics error:', error);
      
      if (error instanceof Error && error.message === 'API key not found') {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'API key not found'
        });

      
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch API key analytics'
      });

  });

  /**
   * Generate comprehensive usage report
   */
  fastify.post<{
    Body: z.infer<typeof reportGenerationSchema>;
>('/admin/api-management/reports', {
    preHandler: [requireAdminAuth],
    schema: {
      body: reportGenerationSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            report: { type: 'object' },
            downloadUrl: { type: 'string' },
            timestamp: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { keyId, startDate, endDate, format, includeInsights } = request.body as z.infer<typeof reportGenerationSchema>;
      
      const startDateObj = startDate ? new Date(startDate) : undefined;
      const endDateObj = endDate ? new Date(endDate) : undefined;
      
      const report = await apiManagementService.generateUsageReport(
        keyId,
        startDateObj,
        endDateObj
      );
      
      // Log report generation
      await auditService.logEvent({
        eventType: 'api_usage_report_generated',
        userId: (request.user as any)?.id,
        details: {
          reportId: report.reportId,
          keyId,
          startDate: startDateObj?.toISOString(),
          endDate: endDateObj?.toISOString(),
          format,
          recordCount: report.summary.totalCalls

      });
      
      return reply.send({
        report,
        downloadUrl: `/admin/api-management/reports/${report.reportId}/download`,
        timestamp: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error('Report generation error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate usage report'
      });

  });

  /**
   * Configure monitoring alerts
   */
  fastify.post<{
    Body: z.infer<typeof alertConfigSchema>;
>('/admin/api-management/alerts', {
    preHandler: [requireAdminAuth],
    schema: {
      body: alertConfigSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            alertId: { type: 'string' },
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const alertConfig = request.body as z.infer<typeof alertConfigSchema>;
      
      const success = await apiManagementService.configureAlert(alertConfig);
      
      if (!success) {
        return reply.status(400).send({
          error: 'Configuration Failed',
          message: 'Failed to configure alert'
        });

      
      return reply.send({
        success: true,
        alertId: alertConfig.id,
        message: 'Alert configuration saved successfully'
      });
 catch (error) {
      fastify.log.error('Alert configuration error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to configure alert'
      });

  });

  /**
   * Export API usage data
   */
  fastify.post<{
    Body: z.infer<typeof exportRequestSchema>;
>('/admin/api-management/export', {
    preHandler: [requireAdminAuth],
    schema: {
      body: exportRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            export: { type: 'object' },
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { format, filters } = request.body as z.infer<typeof exportRequestSchema>;
      
      // Convert date strings to Date objects if provided
      const processedFilters = filters ? {
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined
 : {};
      
      const exportData = await apiManagementService.exportUsageData(format, processedFilters);
      
      // Log export request
      await auditService.logEvent({
        eventType: 'api_usage_export_requested',
        userId: (request.user as any)?.id,
        details: {
          format,
          filters: processedFilters,
          recordCount: exportData.recordCount,
          fileSize: exportData.fileSize

      });
      
      return reply.send({
        export: exportData,
        message: 'Export prepared successfully. Download will be available for 24 hours.'
      });
 catch (error) {
      fastify.log.error('Export request error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to prepare export'
      });

  });

  /**
   * Get real-time API statistics
   */
  fastify.get('/admin/api-management/realtime', {
    preHandler: [requireAdminAuth],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            realtime: { type: 'object' },
            timestamp: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get real-time statistics (last 5 minutes)
      const query = `
        SELECT 
          COUNT(*) as current_requests,
          COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*) as error_rate,
          AVG(response_time) as avg_latency,
          COUNT(DISTINCT key_id) as active_keys,
          COUNT(CASE WHEN rate_limited = true THEN 1 END) as rate_limit_hits,
          COUNT(DISTINCT ip_address) as unique_clients
        FROM api_call_logs 
        WHERE created_at >= NOW() - INTERVAL '5 minutes'
      `;
      
      const result = await databaseService.query(query);
      const stats = result.rows[0];
      
      // Calculate requests per second (approximate)
      const requestsLast5Min = parseInt(stats.current_requests) || 0;
      const rps = requestsLast5Min / 300; // 5 minutes = 300 seconds
      
      const realtime = {
        requestsPerSecond: Math.round(rps * 100) / 100, // Round to 2 decimal places
        errorRate: parseFloat(stats.error_rate) || 0,
        averageLatency: parseFloat(stats.avg_latency) || 0,
        activeKeys: parseInt(stats.active_keys) || 0,
        rateLimitHits: parseInt(stats.rate_limit_hits) || 0,
        uniqueClients: parseInt(stats.unique_clients) || 0,
        totalRequests: requestsLast5Min
      };
      
      return reply.send({
        realtime,
        timestamp: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error('Realtime statistics error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch realtime statistics'
      });

  });

  /**
   * Bulk operations on API keys
   */
  fastify.post('/admin/api-management/bulk-operations', {
    preHandler: [requireAdminAuth],
    schema: {
      body: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['revoke', 'suspend', 'update_limits', 'extend_expiry'] },
          keyIds: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 100 },
          parameters: { type: 'object' }, // Operation-specific parameters
          reason: { type: 'string', maxLength: 500 }

        required: ['operation', 'keyIds']

      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            results: { type: 'object' },
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { operation, keyIds, parameters, reason } = request.body as any;
      const adminEmail = (request.user as any)?.email;
      
      // Use the existing bulk operation functionality from ApiKeyManagementService
      const results = await apiKeyService.performBulkOperation(
        operation,
        keyIds,
        parameters || {},
        adminEmail
      );
      
      return reply.send({
        success: true,
        results,
        message: `Bulk ${operation} operation completed. Processed: ${results.processedCount}, Failed: ${results.failedCount}`
      });
 catch (error) {
      fastify.log.error('Bulk operations error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to perform bulk operation'
      });

  });

  /**
   * Get API management system configuration
   */
  fastify.get('/admin/api-management/config', {
    preHandler: [requireAdminAuth],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            config: { type: 'object' },
            timestamp: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Return system configuration for the API management dashboard
      const config = {
        rateLimiting: {
          defaultLimits: {
            requestsPerMinute: 100,
            requestsPerHour: 3000,
            requestsPerDay: 50000

          maxLimits: {
            requestsPerMinute: 10000,
            requestsPerHour: 500000,
            requestsPerDay: 10000000


        security: {
          keyRotationPolicy: {
            warningDays: 30,
            enforceRotation: true,
            maxKeyAge: 365

          alertThresholds: {
            errorRate: 0.05,
            latency: 1000,
            usageSpike: 5.0


        features: {
          ipWhitelisting: true,
          scopeBasedAccess: true,
          usageAnalytics: true,
          realTimeMonitoring: true,
          bulkOperations: true,
          exportCapabilities: ['json', 'csv', 'excel']

        limits: {
          maxKeysPerUser: 10,
          maxBulkOperations: 100,
          exportRetention: 24 // hours

      };
      
      return reply.send({
        config,
        timestamp: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error('Configuration fetch error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch configuration'
      });

  });

  // Health check for the admin API management service
  fastify.get('/admin/api-management/service-health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dbHealthy = await databaseService.healthCheck();
      
      return reply.send({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        service: 'api_management_admin',
        timestamp: new Date().toISOString(),
        components: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          apiKeyService: 'healthy',
          auditService: 'healthy'

        features: [
          'Comprehensive API key management dashboard',
          'Real-time usage monitoring and analytics',
          'Advanced security monitoring and alerting',
          'Bulk operations on API keys',
          'Usage reporting and data export',
          'System health and performance metrics',
          'Alert configuration and management',
          'Administrative oversight and control'
        ]
      });
 catch (error) {
      fastify.log.error('Admin service health check failed:', error);
      return reply.status(503).send({
        status: 'unhealthy',
        service: 'api_management_admin',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

  });
