/**
 * Performance Profiler Middleware
 * 
 * Integrates performance profiling into the Fastify server to automatically
 * track request metrics and system performance during load testing.
 * 
 * Task: T-1752989144295-168 - Profile server and client performance under load
 */

import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PerformanceProfiler } from '../performance/PerformanceProfiler';

interface PerformanceMiddlewareOptions {
  enabled?: boolean;
  autoStartProfiling?: boolean;
  profileDuration?: number;
  trackAllRequests?: boolean;
  excludeRoutes?: string[];
  alertThresholds?: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
  };
}

/**
 * Performance profiler middleware plugin
 */
export async function performanceProfilerMiddleware(
  fastify: FastifyInstance,
  options: PerformanceMiddlewareOptions
) {
  const opts: PerformanceMiddlewareOptions = {
    enabled: true,
    autoStartProfiling: false,
    profileDuration: 300000, // 5 minutes
    trackAllRequests: true,
    excludeRoutes: ['/health', '/favicon.ico'],
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      responseTime: 2000,
      errorRate: 5
    },
    ...options
  };

  if (!opts.enabled) {
    fastify.log.info('Performance profiler middleware disabled');
    return;
  }

  // Initialize performance profiler
  const profiler = new PerformanceProfiler({
    sampleInterval: 1000,
    databaseEnabled: true,
    systemMetricsEnabled: true,
    gcMetricsEnabled: true,
    outputDirectory: './performance-profiles',
    alertThresholds: opts.alertThresholds
  });

  // Store profiler instance on fastify for access in routes
  fastify.decorate('performanceProfiler', profiler);

  // Request tracking middleware
  if (opts.trackAllRequests) {
    fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip excluded routes
      if (opts.excludeRoutes?.some(route => request.url.includes(route))) {
        return;
      }

      // Add start time to request
      (request as any).startTime = Date.now();
    });

    fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip excluded routes
      if (opts.excludeRoutes?.some(route => request.url.includes(route))) {
        return;
      }

      const startTime = (request as any).startTime;
      if (!startTime) return;

      const responseTime = Date.now() - startTime;
      const isError = reply.statusCode >= 400;

      // Track the request in the profiler
      profiler.trackRequest(responseTime, isError);

      // Add custom metrics for this request
      profiler.addCustomMetric('lastRequestUrl', request.url);
      profiler.addCustomMetric('lastRequestMethod', request.method);
      profiler.addCustomMetric('lastRequestStatusCode', reply.statusCode);
      profiler.addCustomMetric('lastRequestResponseTime', responseTime);
    });
  }

  // Performance alert handler
  profiler.on('performance_alert', (alertData) => {
    fastify.log.warn('Performance Alert:', alertData);
    
    // Could integrate with external alerting systems here
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service, Slack, etc.
    }
  });

  // Auto-start profiling if enabled
  if (opts.autoStartProfiling) {
    fastify.addHook('onReady', async () => {
      fastify.log.info('Auto-starting performance profiling...');
      await profiler.startProfiling();

      // Auto-stop after duration
      setTimeout(async () => {
        fastify.log.info('Auto-stopping performance profiling...');
        await profiler.stopProfiling();
      }, opts.profileDuration);
    });
  }

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    try {
      await profiler.stopProfiling();
      fastify.log.info('Performance profiler stopped on server shutdown');
    } catch (error) {
      fastify.log.error('Error stopping performance profiler:', error);
    }
  });

  // Register performance profiling routes
  await registerPerformanceRoutes(fastify, profiler);

  fastify.log.info('Performance profiler middleware initialized');
}

/**
 * Register performance profiling API routes
 */
async function registerPerformanceRoutes(fastify: FastifyInstance, profiler: PerformanceProfiler) {
  
  // Start profiling
  fastify.post('/api/performance/start', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await profiler.startProfiling();
      
      return reply.code(200).send({
        success: true,
        message: 'Performance profiling started'
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });

  // Stop profiling
  fastify.post('/api/performance/stop', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const snapshots = await profiler.stopProfiling();
      
      return reply.code(200).send({
        success: true,
        message: 'Performance profiling stopped',
        snapshotCount: snapshots.length
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });

  // Get current performance stats
  fastify.get('/api/performance/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = profiler.getCurrentStats();
      
      return reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });

  // Add custom metric
  fastify.post<{
    Body: { key: string; value: unknown }
  }>('/api/performance/metric', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { key, value } = request.body as { key: string; value: unknown };
      
      profiler.addCustomMetric(key, value);
      
      return reply.code(200).send({
        success: true,
        message: `Custom metric '${key}' added`
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });

  // Get profiling status
  fastify.get('/api/performance/status', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const status = {
        isRunning: (profiler as any).isRunning || false,
        snapshotCount: (profiler as any).snapshots?.length || 0,
        startTime: (profiler as any).startTime || null,
        config: (profiler as any).config || null
      };
      
      return reply.code(200).send({
        success: true,
        data: status
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });

  // Client report endpoint
  fastify.post<{
    Body: Record<string, unknown>
  }>('/api/performance/client-report', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const report = request.body;
      
      // Store client report (could save to file or database)
      const timestamp = Date.now();
      const reportPath = `./performance-profiles/client-report-${timestamp}.json`;
      
      const fs = require('fs').promises;
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      fastify.log.info(`Client performance report saved: ${reportPath}`);
      
      return reply.code(200).send({
        success: true,
        message: 'Client performance report received',
        reportPath
      });
    } catch (error) {
      return reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });

  // Health check with performance metrics
  fastify.get('/api/performance/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = profiler.getCurrentStats();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const health = {
        status: 'healthy',
        timestamp: Date.now(),
        performance: stats,
        system: {
          memory: {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: process.uptime(),
          platform: process.platform,
          nodeVersion: process.version
        }
      };

      // Determine health status based on performance
      if (stats) {
        if (stats.cpu > 90 || stats.memory > 90) {
          health.status = 'degraded';
        }
        if (stats.responseTime > 5000 || stats.errorRate > 10) {
          health.status = 'unhealthy';
        }
      }
      
      return reply.code(200).send(health);
    } catch (error) {
      return reply.code(500).send({
        status: 'error',
        error: error.message
      });
    }
  });
}

/**
 * Helper function to create performance middleware with options
 */
export function createPerformanceMiddleware(options: PerformanceMiddlewareOptions = {}) {
  return async function(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    return performanceProfilerMiddleware(fastify, options);
  };
}

/**
 * Performance tracking decorator for route handlers
 */
export function withPerformanceTracking(routeHandler: Function) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    const startTime = Date.now();
    
    try {
      const result = await routeHandler(request, reply);
      
      const responseTime = Date.now() - startTime;
      const profiler = (request.server as any).performanceProfiler;
      
      if (profiler) {
        profiler.trackRequest(responseTime, false);
        profiler.addCustomMetric('lastRouteResponseTime', responseTime);
      }
      
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const profiler = (request.server as any).performanceProfiler;
      
      if (profiler) {
        profiler.trackRequest(responseTime, true);
        profiler.addCustomMetric('lastRouteError', error.message);
      }
      
      throw error;
    }
  };
}

// Types for Fastify augmentation
declare module 'fastify' {
  interface FastifyInstance {
    performanceProfiler: PerformanceProfiler;
  }
}