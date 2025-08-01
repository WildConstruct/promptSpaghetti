/**
 * Timeout Management Routes
 * 
 * Provides REST API endpoints for monitoring and managing
 * timeout configurations, metrics, and alerts.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getTimeoutManager, TimeoutConfig } from '../services/TimeoutManager';
import { TimeoutMonitoringService, AlertConfig, AlertChannel } from '../services/timeout-monitoring';

// Request/Response schemas
const TimeoutConfigUpdateSchema = z.object({
  database: z.object({
    connect: z.number().min(1000).max(300000).optional(),
    query: z.number().min(1000).max(300000).optional(),
    transaction: z.number().min(1000).max(600000).optional(),
    migration: z.number().min(10000).max(3600000).optional()
  }).optional(),
  redis: z.object({
    connect: z.number().min(1000).max(60000).optional(),
    operation: z.number().min(1000).max(60000).optional(),
    pipeline: z.number().min(1000).max(120000).optional(),
    publish: z.number().min(1000).max(30000).optional()
  }).optional(),
  api: z.object({
    authentication: z.number().min(1000).max(120000).optional(),
    webhook: z.number().min(1000).max(300000).optional(),
    notification: z.number().min(1000).max(60000).optional(),
    export: z.number().min(1000).max(600000).optional()
  }).optional(),
  auth: z.object({
    login: z.number().min(1000).max(60000).optional(),
    register: z.number().min(1000).max(120000).optional(),
    passwordReset: z.number().min(1000).max(300000).optional(),
    tokenRefresh: z.number().min(1000).max(30000).optional(),
    captcha: z.number().min(1000).max(60000).optional(),
    twoFactor: z.number().min(1000).max(300000).optional()
  }).optional(),
  file: z.object({
    upload: z.number().min(10000).max(1800000).optional(),
    download: z.number().min(5000).max(600000).optional(),
    processing: z.number().min(10000).max(3600000).optional(),
    validation: z.number().min(1000).max(300000).optional()
  }).optional(),
  email: z.object({
    send: z.number().min(1000).max(120000).optional(),
    verify: z.number().min(1000).max(60000).optional(),
    template: z.number().min(1000).max(30000).optional()
  }).optional()
});

const AlertConfigUpdateSchema = z.object({
  timeoutThreshold: z.number().min(1).max(100).optional(),
  circuitBreakerThreshold: z.number().min(1).max(50).optional(),
  errorRateThreshold: z.number().min(0.01).max(1).optional(),
  alertCooldown: z.number().min(60000).max(3600000).optional(),
  enableEmailAlerts: z.boolean().optional(),
  enableSlackAlerts: z.boolean().optional(),
  enableWebhookAlerts: z.boolean().optional()
});

const AlertChannelSchema = z.object({
  type: z.enum(['email', 'slack', 'webhook']),
  config: z.record(z.any())
});

const OperationCancelSchema = z.object({
  operationIds: z.array(z.string()).optional(),
  cancelAll: z.boolean().optional()
});

export async function timeoutManagementRoutes(
  fastify: FastifyInstance,
  monitoringService?: TimeoutMonitoringService
) {
  const timeoutManager = getTimeoutManager();

  // Get current timeout configuration
  fastify.get('/timeout/config', {
    schema: {
      description: 'Get current timeout configuration',
      tags: ['timeout-management'],
      response: {
        200: {
          type: 'object',
          properties: {
            config: { type: 'object' },
            lastUpdated: { type: 'string', format: 'date-time' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      config: timeoutManager.getConfig(),
      lastUpdated: new Date().toISOString()
    };
  });

  // Update timeout configuration
  fastify.put('/timeout/config', {
    schema: {
      description: 'Update timeout configuration',
      tags: ['timeout-management'],
      body: TimeoutConfigUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            config: { type: 'object' },
            message: { type: 'string' }




  }, async (request: FastifyRequest<{ Body: z.infer<typeof TimeoutConfigUpdateSchema> }>, reply: FastifyReply) => {
    try {
      timeoutManager.updateConfig(request.body);
      
      return {
        success: true,
        config: timeoutManager.getConfig(),
        message: 'Timeout configuration updated successfully'
      };
 catch (error) {
      reply.status(400).send({
        success: false,
        message: `Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

  });

  // Get timeout metrics
  fastify.get('/timeout/metrics', {
    schema: {
      description: 'Get timeout metrics for all operations',
      tags: ['timeout-management'],
      querystring: {
        type: 'object',
        properties: {
          operation: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            metrics: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }




  }, async (request: FastifyRequest<{ Querystring: { operation?: string } }>, reply: FastifyReply) => {
    const { operation } = request.query;
    
    let metrics;
    if (operation) {
      metrics = timeoutManager.getMetrics(operation);
      if (!metrics) {
        reply.status(404).send({
          message: `No metrics found for operation: ${operation}`
        });
        return;

 else {
      metrics = Object.fromEntries(timeoutManager.getMetrics() as Map<string, any>);


    return {
      metrics,
      timestamp: new Date().toISOString()
    };
  });

  // Get circuit breaker states
  fastify.get('/timeout/circuit-breakers', {
    schema: {
      description: 'Get current circuit breaker states',
      tags: ['timeout-management'],
      response: {
        200: {
          type: 'object',
          properties: {
            circuitBreakers: { type: 'object' },
            summary: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                open: { type: 'number' },
                halfOpen: { type: 'number' },
                closed: { type: 'number' }


            timestamp: { type: 'string', format: 'date-time' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const circuitBreakers = Object.fromEntries(timeoutManager.getCircuitBreakerStates());
    
    const summary = {
      total: Object.keys(circuitBreakers).length,
      open: Object.values(circuitBreakers).filter(cb => cb.state === 'open').length,
      halfOpen: Object.values(circuitBreakers).filter(cb => cb.state === 'half_open').length,
      closed: Object.values(circuitBreakers).filter(cb => cb.state === 'closed').length
    };

    return {
      circuitBreakers,
      summary,
      timestamp: new Date().toISOString()
    };
  });

  // Get health status
  fastify.get('/timeout/health', {
    schema: {
      description: 'Get timeout manager health status',
      tags: ['timeout-management'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            health: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const health = timeoutManager.getHealthStatus();
    const status = health.openCircuitBreakers === 0 && health.activeOperations < 100 ? 'healthy' : 'degraded';

    return {
      status,
      health,
      timestamp: new Date().toISOString()
    };
  });

  // Cancel operations
  fastify.post('/timeout/cancel', {
    schema: {
      description: 'Cancel active operations',
      tags: ['timeout-management'],
      body: OperationCancelSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            cancelledCount: { type: 'number' },
            message: { type: 'string' }




  }, async (request: FastifyRequest<{ Body: z.infer<typeof OperationCancelSchema> }>, reply: FastifyReply) => {
    const { operationIds, cancelAll } = request.body;
    
    let cancelledCount = 0;
    
    if (cancelAll) {
      cancelledCount = timeoutManager.cancelAllOperations();
 else if (operationIds) {
      for (const operationId of operationIds) {
        if (timeoutManager.cancelOperation(operationId)) {
          cancelledCount++;




    return {
      success: true,
      cancelledCount,
      message: `Cancelled ${cancelledCount} operation(s)`
    };
  });

  // Reset metrics and circuit breakers
  fastify.post('/timeout/reset', {
    schema: {
      description: 'Reset all timeout metrics and circuit breakers',
      tags: ['timeout-management'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    timeoutManager.reset();
    
    return {
      success: true,
      message: 'All timeout metrics and circuit breakers have been reset',
      timestamp: new Date().toISOString()
    };
  });

  // Monitoring service routes (if available)
  if (monitoringService) {
    // Get monitoring dashboard
    fastify.get('/timeout/dashboard', {
      schema: {
        description: 'Get monitoring dashboard data',
        tags: ['timeout-monitoring'],
        response: {
          200: {
            type: 'object',
            properties: {
              dashboard: { type: 'object' },
              timestamp: { type: 'string', format: 'date-time' }




    }, async (request: FastifyRequest, reply: FastifyReply) => {
      return {
        dashboard: monitoringService.getDashboardData(),
        timestamp: new Date().toISOString()
      };
    });

    // Get performance metrics
    fastify.get('/timeout/performance', {
      schema: {
        description: 'Get performance metrics',
        tags: ['timeout-monitoring'],
        querystring: {
          type: 'object',
          properties: {
            operation: { type: 'string' }


        response: {
          200: {
            type: 'object',
            properties: {
              metrics: { type: 'array' },
              timestamp: { type: 'string', format: 'date-time' }




    }, async (request: FastifyRequest<{ Querystring: { operation?: string } }>, reply: FastifyReply) => {
      const { operation } = request.query;
      
      let metrics;
      if (operation) {
        const metric = monitoringService.getPerformanceMetrics(operation);
        metrics = metric ? [metric] : [];
 else {
        metrics = monitoringService.getAllPerformanceMetrics();


      return {
        metrics,
        timestamp: new Date().toISOString()
      };
    });

    // Get alerts
    fastify.get('/timeout/alerts', {
      schema: {
        description: 'Get timeout alerts',
        tags: ['timeout-monitoring'],
        querystring: {
          type: 'object',
          properties: {
            active: { type: 'boolean' }


        response: {
          200: {
            type: 'object',
            properties: {
              alerts: { type: 'array' },
              count: { type: 'number' },
              timestamp: { type: 'string', format: 'date-time' }




    }, async (request: FastifyRequest<{ Querystring: { active?: boolean } }>, reply: FastifyReply) => {
      const { active } = request.query;
      
      const alerts = active !== false ? monitoringService.getActiveAlerts() : monitoringService.getAllAlerts();

      return {
        alerts,
        count: alerts.length,
        timestamp: new Date().toISOString()
      };
    });

    // Resolve alert
    fastify.post('/timeout/alerts/:alertId/resolve', {
      schema: {
        description: 'Manually resolve an alert',
        tags: ['timeout-monitoring'],
        params: {
          type: 'object',
          properties: {
            alertId: { type: 'string' }

          required: ['alertId']

        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }




    }, async (request: FastifyRequest<{ Params: { alertId: string } }>, reply: FastifyReply) => {
      const { alertId } = request.params;
      
      const resolved = monitoringService.resolveAlert(alertId);
      
      if (resolved) {
        return {
          success: true,
          message: 'Alert resolved successfully'
        };
 else {
        reply.status(404).send({
          success: false,
          message: 'Alert not found or already resolved'
        });

    });

    // Update alert configuration
    fastify.put('/timeout/alerts/config', {
      schema: {
        description: 'Update alert configuration',
        tags: ['timeout-monitoring'],
        body: AlertConfigUpdateSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }




    }, async (request: FastifyRequest<{ Body: z.infer<typeof AlertConfigUpdateSchema> }>, reply: FastifyReply) => {
      try {
        monitoringService.updateAlertConfig(request.body);
        
        return {
          success: true,
          message: 'Alert configuration updated successfully'
        };
 catch (error) {
        reply.status(400).send({
          success: false,
          message: `Failed to update alert configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
        });

    });

    // Add alert channel
    fastify.post('/timeout/alerts/channels', {
      schema: {
        description: 'Add alert channel',
        tags: ['timeout-monitoring'],
        body: AlertChannelSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }




    }, async (request: FastifyRequest<{ Body: z.infer<typeof AlertChannelSchema> }>, reply: FastifyReply) => {
      try {
        monitoringService.addAlertChannel(request.body);
        
        return {
          success: true,
          message: 'Alert channel added successfully'
        };
 catch (error) {
        reply.status(400).send({
          success: false,
          message: `Failed to add alert channel: ${error instanceof Error ? error.message : 'Unknown error'}`
        });

    });

    // Remove alert channel
    fastify.delete('/timeout/alerts/channels/:type', {
      schema: {
        description: 'Remove alert channel',
        tags: ['timeout-monitoring'],
        params: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['email', 'slack', 'webhook'] }

          required: ['type']

        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }




    }, async (request: FastifyRequest<{ Params: { type: string } }>, reply: FastifyReply) => {
      const { type } = request.params;
      
      monitoringService.removeAlertChannel(type);
      
      return {
        success: true,
        message: `Alert channel ${type} removed successfully`
      };
    });

    // Cleanup old data
    fastify.post('/timeout/cleanup', {
      schema: {
        description: 'Clean up old alerts and performance data',
        tags: ['timeout-monitoring'],
        body: {
          type: 'object',
          properties: {
            maxAge: { type: 'number', minimum: 3600000 } // Minimum 1 hour


        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }




    }, async (request: FastifyRequest<{ Body: { maxAge?: number } }>, reply: FastifyReply) => {
      const { maxAge } = request.body;
      
      monitoringService.cleanup(maxAge);
      
      return {
        success: true,
        message: 'Cleanup completed successfully'
      };
    });

