/**
 * API Routes for System Monitoring and Error Handling & Resilience
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { errorHandlerService } from '../middleware/error-handler';
import { circuitBreakerService } from '../services/CircuitBreakerService';
import { retryService } from '../services/RetryService';
import { healthMonitoringService } from '../services/HealthMonitoringService';
import { operationalMetricsService } from '../services/OperationalMetricsService';
import { ErrorFactory } from '../types/errors';

interface SystemStatusQuery {
  detailed?: boolean;
  include?: string; // comma-separated: 'metrics,health,circuits,retries,alerts'
}

interface MetricsQuery {
  minutes?: number;
  limit?: number;
}

interface AlertRuleBody {
  name: string;
  condition: string; // JavaScript expression
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  enabled?: boolean;
  cooldownMs?: number;
}

export async function systemMonitoringRoutes(fastify: FastifyInstance) {
  // System status overview
  fastify.get<{ Querystring: SystemStatusQuery }>(
    '/system/status',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            detailed: { type: 'boolean', default: false },
            include: { type: 'string' }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Querystring: SystemStatusQuery }>, reply: FastifyReply) => {
      const { detailed = false, include } = request.query;
      const includeItems = include ? include.split(',') : ['health'];

      const response: any = {
        timestamp: Date.now(),
        uptime: process.uptime() * 1000,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      };

      // Health monitoring
      if (includeItems.includes('health')) {
        try {
          const healthSummary = await healthMonitoringService.checkHealth();
          response.health = detailed ? healthSummary : {
            overall: healthSummary.overall,
            score: healthSummary.score,
            issueCount: healthSummary.issues.length
          };
        } catch (error) {
          response.health = { error: 'Failed to collect health metrics' };
        }
      }

      // Operational metrics
      if (includeItems.includes('metrics')) {
        try {
          const metrics = await operationalMetricsService.collectMetrics();
          response.metrics = detailed ? metrics : {
            errorRate: metrics.errorRate.perMinute,
            requestsPerSecond: metrics.requestMetrics.requestsPerSecond,
            averageResponseTime: metrics.requestMetrics.averageResponseTime,
            memoryUsage: Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024), // MB
            cpuUsage: metrics.cpuUsage
          };
        } catch (error) {
          response.metrics = { error: 'Failed to collect operational metrics' };
        }
      }

      // Circuit breaker status
      if (includeItems.includes('circuits')) {
        const circuitMetrics = circuitBreakerService.getAllMetrics();
        response.circuitBreakers = detailed ? circuitMetrics : 
          Object.entries(circuitMetrics).reduce((acc, [name, metrics]) => ({
            ...acc,
            [name]: {
              state: metrics.state,
              failureRate: metrics.failureRate
            }
          }), {});
      }

      // Retry service metrics
      if (includeItems.includes('retries')) {
        const retryMetrics = retryService.getAllMetrics();
        response.retryStrategies = detailed ? retryMetrics :
          Object.entries(retryMetrics).reduce((acc, [name, metrics]) => ({
            ...acc,
            [name]: {
              successRate: metrics.successRate,
              averageAttempts: metrics.averageAttempts
            }
          }), {});
      }

      // Active alerts
      if (includeItems.includes('alerts')) {
        const alerts = operationalMetricsService.getActiveAlerts();
        response.alerts = detailed ? alerts : {
          count: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length
        };
      }

      reply.send(response);
    }
  );

  // Error metrics
  fastify.get('/system/error-metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = errorHandlerService.getMetrics();
    reply.send(metrics);
  });

  // Reset error metrics (development only)
  if (process.env.NODE_ENV !== 'production') {
    fastify.post('/system/error-metrics/reset', async (request: FastifyRequest, reply: FastifyReply) => {
      errorHandlerService.resetMetrics();
      reply.send({ message: 'Error metrics reset successfully' });
    });
  }

  // Health check endpoint with dependency details
  fastify.get('/system/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthSummary = await healthMonitoringService.checkHealth();
      
      // Set appropriate HTTP status based on health
      let statusCode = 200;
      switch (healthSummary.overall) {
      case 'healthy':
        statusCode = 200;
        break;
      case 'degraded':
        statusCode = 200; // Still operational
        break;
      case 'unhealthy':
        statusCode = 503;
        break;
      case 'critical':
        statusCode = 503;
        break;
      default:
        statusCode = 503;
      }

      reply.status(statusCode).send(healthSummary);
    } catch (error) {
      reply.status(503).send({
        overall: 'critical',
        error: 'Health check system failure',
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
    }
  });

  // Health monitoring metrics
  fastify.get('/system/health/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = healthMonitoringService.getMetrics();
    reply.send(metrics);
  });

  // Circuit breaker metrics
  fastify.get('/system/circuit-breakers', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = circuitBreakerService.getAllMetrics();
    reply.send(metrics);
  });

  // Circuit breaker control endpoints (development only)
  if (process.env.NODE_ENV !== 'production') {
    fastify.post<{ Params: { name: string }; Body: { action: 'open' | 'close' | 'half-open' } }>(
      '/system/circuit-breakers/:name/control',
      {
        schema: {
          params: {
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name']
          },
          body: {
            type: 'object',
            properties: { action: { type: 'string', enum: ['open', 'close', 'half-open'] } },
            required: ['action']
          }
        }
      },
      async (request, reply) => {
        const { name } = request.params;
        const { action } = request.body;

        const breaker = circuitBreakerService.getCircuitBreaker(name);
        if (!breaker) {
          throw ErrorFactory.notFound(`Circuit breaker '${name}'`);
        }

        switch (action) {
        case 'open':
          breaker.forceOpen();
          break;
        case 'close':
          breaker.forceClosed();
          break;
        case 'half-open':
          breaker.forceHalfOpen();
          break;
        }

        reply.send({ message: `Circuit breaker '${name}' ${action}ed successfully` });
      }
    );
  }

  // Retry strategy metrics
  fastify.get('/system/retry-strategies', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = retryService.getAllMetrics();
    reply.send(metrics);
  });

  // Operational metrics
  fastify.get<{ Querystring: MetricsQuery }>(
    '/system/metrics',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            minutes: { type: 'number', minimum: 1, maximum: 1440 },
            limit: { type: 'number', minimum: 1, maximum: 1000 }
          }
        }
      }
    },
    async (request: FastifyRequest<{ Querystring: MetricsQuery }>, reply: FastifyReply) => {
      const { minutes, limit } = request.query;

      if (minutes) {
        const summary = operationalMetricsService.getMetricsSummary(minutes);
        reply.send(summary);
      } else {
        const history = operationalMetricsService.getMetricsHistory(limit);
        reply.send(history);
      }
    }
  );

  // Current system metrics
  fastify.get('/system/metrics/current', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = await operationalMetricsService.collectMetrics();
    reply.send(metrics);
  });

  // Alert management
  fastify.get('/system/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    const activeAlerts = operationalMetricsService.getActiveAlerts();
    reply.send(activeAlerts);
  });

  fastify.get('/system/alerts/all', async (request: FastifyRequest, reply: FastifyReply) => {
    const allAlerts = operationalMetricsService.getAllAlerts();
    reply.send(allAlerts);
  });

  fastify.get('/system/alert-rules', async (request: FastifyRequest, reply: FastifyReply) => {
    const rules = operationalMetricsService.getAlertRules();
    reply.send(rules);
  });

  // Performance testing endpoint (development only)
  if (process.env.NODE_ENV !== 'production') {
    fastify.post<{ Body: { errorType?: string; delay?: number } }>(
      '/system/test/error',
      {
        schema: {
          body: {
            type: 'object',
            properties: {
              errorType: { type: 'string', enum: ['validation', 'timeout', 'external', 'database', 'internal'] },
              delay: { type: 'number', minimum: 0, maximum: 10000 }
            }
          }
        }
      },
      async (request, reply) => {
        const { errorType = 'internal', delay = 0 } = request.body;

        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        switch (errorType) {
        case 'validation':
          throw ErrorFactory.validation('Test validation error', [
            { field: 'testField', code: 'invalid', message: 'Test field is invalid' }
          ]);
        case 'timeout':
          throw ErrorFactory.timeout('test-operation', 5000);
        case 'external':
          throw ErrorFactory.externalService('test-service', 'Test external service error', 503);
        case 'database':
          throw ErrorFactory.database('Test database error', 'SELECT', 'test_table');
        default:
          throw ErrorFactory.internal('Test internal server error');
        }
      }
    );

    fastify.post<{ Body: { count?: number; intervalMs?: number } }>(
      '/system/test/load',
      {
        schema: {
          body: {
            type: 'object',
            properties: {
              count: { type: 'number', minimum: 1, maximum: 1000 },
              intervalMs: { type: 'number', minimum: 0, maximum: 5000 }
            }
          }
        }
      },
      async (request, reply) => {
        const { count = 10, intervalMs = 100 } = request.body;

        const results: any[] = [];

        for (let i = 0; i < count; i++) {
          const start = Date.now();
          
          // Simulate some work
          await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
          
          const responseTime = Date.now() - start;
          results.push({ request: i + 1, responseTime });

          // Record metrics
          operationalMetricsService.recordRequest(responseTime, true);

          if (intervalMs > 0 && i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
          }
        }

        reply.send({
          message: `Generated ${count} test requests`,
          results,
          averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
        });
      }
    );
  }

  // System resource usage
  fastify.get('/system/resources', async (request: FastifyRequest, reply: FastifyReply) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    reply.send({
      timestamp: Date.now(),
      uptime: process.uptime() * 1000,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user / 1000, // ms
        system: cpuUsage.system / 1000 // ms
      },
      nodejs: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  });
}

export default systemMonitoringRoutes;