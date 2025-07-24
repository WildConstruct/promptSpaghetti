/**
 * Performance Monitoring API Routes - Story 1.5 Task 6
 * 
 * Provides REST API endpoints for performance monitoring, metrics collection,
 * alerting, distributed tracing, and observability platform integration.
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import PerformanceMonitoringService, { 
  AlertConfigSchema,
  SystemMetrics,
  BaseMetric,
  GaugeMetric,
  CounterMetric,
  HistogramMetric
} from '../analytics/PerformanceMonitoringService';
import { AnalyticsAuthorizationService } from '../analytics/AnalyticsAuthorization';

// Metric Recording Schema
const MetricRecordingSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['gauge', 'counter', 'histogram']),
  value: z.number(),
  labels: z.record(z.string()).optional().default({}),
  tags: z.array(z.string()).optional().default([])
});

// Trace Context Schema
const TraceContextSchema = z.object({
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  parentSpanId: z.string().optional(),
  baggage: z.record(z.string()).optional().default({}),
  flags: z.number().optional().default(0)
});

// Span Completion Schema
const SpanCompletionSchema = z.object({
  spanId: z.string(),
  tags: z.record(z.string()).optional(),
  error: z.string().optional()
});

// Performance Report Request Schema
const PerformanceReportRequestSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  includeRecommendations: z.boolean().default(true),
  includeBottlenecks: z.boolean().default(true)
});

/**
 * Performance Monitoring API Routes
 */
export async function performanceMonitoringRoutes(fastify: FastifyInstance) {
  const performanceService = fastify.performanceMonitoringService as PerformanceMonitoringService;
  const authService = fastify.authService as AnalyticsAuthorizationService;

  /**
   * Record performance metric
   */
  fastify.post('/performance/metrics', {
    schema: {
      description: 'Record performance metric for monitoring and alerting',
      tags: ['performance', 'metrics'],
      body: MetricRecordingSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            recorded: { type: 'boolean' },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const metricData = request.body as z.infer<typeof MetricRecordingSchema>;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only authenticated users can record metrics
      if (!authContext.userId) {
        return reply.code(401).send({
          error: 'Authentication required for metric recording'
        });
      }

      const metric: BaseMetric = {
        ...metricData,
        timestamp: Date.now(),
        labels: {
          ...metricData.labels,
          userId: authContext.userId,
          source: 'api'
        }
      };

      await performanceService.recordMetric(metric);

      return reply.code(201).send({
        recorded: true,
        timestamp: metric.timestamp
      });

    } catch (error) {
      console.error('Metric recording error:', error);
      return reply.code(500).send({
        error: 'Failed to record metric',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get system metrics following target architecture
   */
  fastify.get('/performance/system-metrics', {
    schema: {
      description: 'Get comprehensive system metrics following target architecture patterns',
      tags: ['performance', 'metrics', 'system'],
      response: {
        200: {
          type: 'object',
          properties: {
            performance: { type: 'object' },
            business: { type: 'object' },
            infrastructure: { type: 'object' },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can view system metrics
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for system metrics'
        });
      }

      const systemMetrics = await performanceService.getSystemMetrics();

      return reply.send({
        ...systemMetrics,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('System metrics error:', error);
      return reply.code(500).send({
        error: 'Failed to retrieve system metrics',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Start distributed trace
   */
  fastify.post('/performance/trace/start', {
    schema: {
      description: 'Start distributed trace for performance monitoring',
      tags: ['performance', 'tracing'],
      body: z.object({
        operationName: z.string(),
        parentContext: TraceContextSchema.optional()
      }),
      response: {
        201: {
          type: 'object',
          properties: {
            traceId: { type: 'string' },
            spanId: { type: 'string' },
            parentSpanId: { type: 'string' },
            baggage: { type: 'object' },
            flags: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { operationName, parentContext } = request.body as any;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only authenticated users can start traces
      if (!authContext.userId) {
        return reply.code(401).send({
          error: 'Authentication required for distributed tracing'
        });
      }

      const traceContext = performanceService.startTrace(operationName, parentContext);

      return reply.code(201).send(traceContext);

    } catch (error) {
      console.error('Trace start error:', error);
      return reply.code(500).send({
        error: 'Failed to start trace',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Finish distributed trace span
   */
  fastify.post('/performance/trace/finish', {
    schema: {
      description: 'Finish distributed trace span',
      tags: ['performance', 'tracing'],
      body: SpanCompletionSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            finished: { type: 'boolean' },
            spanId: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { spanId, tags, error } = request.body as z.infer<typeof SpanCompletionSchema>;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      if (!authContext.userId) {
        return reply.code(401).send({
          error: 'Authentication required for distributed tracing'
        });
      }

      await performanceService.finishSpan(spanId, tags, error);

      return reply.send({
        finished: true,
        spanId
      });

    } catch (error) {
      console.error('Trace finish error:', error);
      return reply.code(500).send({
        error: 'Failed to finish trace span',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Create alert configuration
   */
  fastify.post('/performance/alerts', {
    schema: {
      description: 'Create performance alert configuration',
      tags: ['performance', 'alerts'],
      body: AlertConfigSchema.omit({ id: true }),
      response: {
        201: {
          type: 'object',
          properties: {
            alertId: { type: 'string' },
            created: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const alertConfig = request.body as any;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can create alerts
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for alert management'
        });
      }

      const alertId = await performanceService.createAlert(alertConfig);

      return reply.code(201).send({
        alertId,
        created: true
      });

    } catch (error) {
      console.error('Alert creation error:', error);
      return reply.code(500).send({
        error: 'Failed to create alert',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get active alerts
   */
  fastify.get('/performance/alerts/active', {
    schema: {
      description: 'Get all active performance alerts',
      tags: ['performance', 'alerts'],
      response: {
        200: {
          type: 'object',
          properties: {
            alerts: { type: 'array' },
            count: { type: 'number' },
            severityCounts: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can view alerts
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for alert viewing'
        });
      }

      const alerts = performanceService.getActiveAlerts();
      
      const severityCounts = alerts.reduce((counts, alert) => {
        counts[alert.severity] = (counts[alert.severity] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      return reply.send({
        alerts,
        count: alerts.length,
        severityCounts
      });

    } catch (error) {
      console.error('Active alerts error:', error);
      return reply.code(500).send({
        error: 'Failed to retrieve active alerts',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Generate comprehensive performance report
   */
  fastify.post('/performance/reports', {
    schema: {
      description: 'Generate comprehensive performance report with analytics and recommendations',
      tags: ['performance', 'reports', 'analytics'],
      body: PerformanceReportRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            timeRange: { type: 'object' },
            summary: { type: 'object' },
            trends: { type: 'object' },
            recommendations: { type: 'array' },
            bottlenecks: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { startTime, endTime } = request.body as z.infer<typeof PerformanceReportRequestSchema>;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Only admin users can generate performance reports
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for performance reports'
        });
      }

      const report = await performanceService.generatePerformanceReport(startTime, endTime);

      return reply.send(report);

    } catch (error) {
      console.error('Performance report error:', error);
      return reply.code(500).send({
        error: 'Failed to generate performance report',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get observability metrics for unified dashboard
   */
  fastify.get('/performance/observability', {
    schema: {
      description: 'Get observability metrics for unified monitoring dashboard',
      tags: ['performance', 'observability', 'dashboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            uptime: { type: 'number' },
            responseTime: { type: 'object' },
            errorRate: { type: 'number' },
            throughput: { type: 'number' },
            alertsActive: { type: 'number' },
            tracesActive: { type: 'number' },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Admin users get full metrics, regular users get limited view
      if (authContext.role !== 'admin' && authContext.role !== 'user') {
        return reply.code(403).send({
          error: 'Authentication required for observability metrics'
        });
      }

      const observabilityMetrics = await performanceService.getObservabilityMetrics();

      // Filter sensitive metrics for non-admin users
      if (authContext.role !== 'admin') {
        return reply.send({
          uptime: observabilityMetrics.uptime,
          responseTime: observabilityMetrics.responseTime,
          timestamp: Date.now()
        });
      }

      return reply.send({
        ...observabilityMetrics,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Observability metrics error:', error);
      return reply.code(500).send({
        error: 'Failed to retrieve observability metrics',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Health check for performance monitoring system
   */
  fastify.get('/performance/health', {
    schema: {
      description: 'Health check for performance monitoring and observability platform',
      tags: ['performance', 'health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            components: { type: 'object' },
            uptime: { type: 'number' },
            metrics: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const observabilityMetrics = await performanceService.getObservabilityMetrics();
      const activeAlerts = performanceService.getActiveAlerts();
      
      // Determine overall health status
      const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
      const status = criticalAlerts > 0 ? 'degraded' : 
                   observabilityMetrics.errorRate > 5 ? 'warning' : 'healthy';

      return reply.send({
        status,
        components: {
          metricsCollection: 'healthy',
          alerting: criticalAlerts > 0 ? 'degraded' : 'healthy',
          tracing: observabilityMetrics.tracesActive > 0 ? 'healthy' : 'unknown',
          observability: status
        },
        uptime: observabilityMetrics.uptime,
        metrics: {
          errorRate: observabilityMetrics.errorRate,
          responseTime: observabilityMetrics.responseTime.avg,
          throughput: observabilityMetrics.throughput,
          activeAlerts: observabilityMetrics.alertsActive
        }
      });

    } catch (error) {
      console.error('Performance health check error:', error);
      return reply.code(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get performance optimization recommendations
   */
  fastify.get('/performance/recommendations', {
    schema: {
      description: 'Get AI-powered performance optimization recommendations',
      tags: ['performance', 'optimization', 'recommendations'],
      querystring: z.object({
        timeRange: z.enum(['1h', '6h', '24h', '7d']).default('24h')
      }),
      response: {
        200: {
          type: 'object',
          properties: {
            recommendations: { type: 'array' },
            bottlenecks: { type: 'array' },
            optimizationScore: { type: 'number' },
            prioritizedActions: { type: 'array' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { timeRange } = request.query as any;
      
      const authContext = await authService.createAuthContextFromRequest(request);
      
      if (authContext.role !== 'admin') {
        return reply.code(403).send({
          error: 'Admin access required for optimization recommendations'
        });
      }

      // Calculate time range
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      }[timeRange];

      const endTime = Date.now();
      const startTime = endTime - timeRangeMs;

      const report = await performanceService.generatePerformanceReport(startTime, endTime);

      // Calculate optimization score (0-100)
      const optimizationScore = Math.max(0, 100 - (
        (report.summary.errorRate * 10) +
        (report.summary.averageResponseTime > 1000 ? 20 : 0) +
        (report.bottlenecks.length * 15)
      ));

      // Prioritize actions based on severity
      const prioritizedActions = [
        ...report.bottlenecks
          .filter(b => b.severity === 'high')
          .map(b => ({ action: b.solution, priority: 'high', component: b.component })),
        ...report.recommendations.slice(0, 3)
          .map(r => ({ action: r, priority: 'medium', component: 'general' })),
        ...report.bottlenecks
          .filter(b => b.severity === 'medium')
          .map(b => ({ action: b.solution, priority: 'low', component: b.component }))
      ];

      return reply.send({
        recommendations: report.recommendations,
        bottlenecks: report.bottlenecks,
        optimizationScore,
        prioritizedActions
      });

    } catch (error) {
      console.error('Performance recommendations error:', error);
      return reply.code(500).send({
        error: 'Failed to generate performance recommendations',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

export default performanceMonitoringRoutes;