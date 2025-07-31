/**
 * Health Monitoring API Routes - Epic 17.4.5 & 17.4.2
 * 
 * RESTful API endpoints for health check framework and error tracking.
 * Provides comprehensive health monitoring, error management, and
 * system status reporting for Epic 17 admin controls.
 * 
 * Tasks: E17-1753114397238-2ADFE4 & E17-1753114397236-C9648E
 * Epic: 17 - Backstage Admin Controls (Stories 17.4.5 & 17.4.2)
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { HealthCheckFramework, HealthStatus, HealthCheck, HealthCheckSuite } from './HealthCheckFramework';
import { ErrorTrackingService, ErrorSeverity, ErrorStatus, ErrorQuery, ErrorAnalytics } from './ErrorTrackingService';
import { AuthService } from '../auth/services/AuthService';
import { AuditService } from '../auth/services/AuditService';

// ==========================================
// REQUEST/RESPONSE INTERFACES
// ==========================================

}
}
export interface HealthMonitoringResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime: number;
    version: string;
  };
}

}
}
export interface HealthCheckExecutionRequest {
  checkIds?: string[];
  suiteId?: string;
  includeDetails?: boolean;
  timeout?: number;
}
}
}

}
}
export interface ErrorCaptureRequest {
  error: string;
  stackTrace?: string;
  context?: {
    userId?: string;
    component?: string;
    operation?: string;
    url?: string;
    httpMethod?: string;
    httpStatus?: number;
    additionalData?: Record<string, any>;
}
}
  };
  severity?: ErrorSeverity;
  tags?: string[];
}

}
}
export interface HealthDashboardQuery {
  timeRange?: string;
  includeHistory?: boolean;
  groupBy?: string;
  refreshInterval?: number;
}
}
}

}
}
export interface ErrorReportQuery {
  timeRange: {
    start: string;
    end: string;
}
}
  };
  severity?: ErrorSeverity[];
  category?: string[];
  includeAnalytics?: boolean;
  format?: 'json' | 'csv' | 'pdf';
}

// ==========================================
// API PLUGIN IMPLEMENTATION
// ==========================================

export const healthMonitoringAPI: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const healthCheckFramework = new HealthCheckFramework(fastify.database);
  const errorTrackingService = new ErrorTrackingService(fastify.database);
  const authService = new AuthService(fastify.database);
  const auditService = new AuditService(fastify.database);

  // Authentication middleware
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      reply.code(401).send({ error: 'Authorization header required' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const user = await authService.validateToken(token);
      if (!user || !user.permissions.includes('health_monitoring')) {
        reply.code(403).send({ error: 'Insufficient permissions for health monitoring' });
        return;
      }
      request.user = user;
    } catch (error) {
      reply.code(401).send({ error: 'Invalid authentication token' });
      return;
    }
  });

  // ==========================================
  // HEALTH CHECK ENDPOINTS
  // ==========================================

  // Execute health checks
  fastify.post<{ Body: HealthCheckExecutionRequest }>('/health/execute', {
    schema: {
      body: {
        type: 'object',
        properties: {
          checkIds: { type: 'array', items: { type: 'string' } },
          suiteId: { type: 'string' },
          includeDetails: { type: 'boolean', default: false },
          timeout: { type: 'integer', minimum: 1000, maximum: 300000 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();
    const requestId = `health_exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      let results;

      if (request.body.suiteId) {
        // Execute health check suite
        results = await healthCheckFramework.executeSuite(request.body.suiteId);
      } else if (request.body.checkIds?.length) {
        // Execute specific health checks
        results = await Promise.all(
          request.body.checkIds.map(checkId => 
            healthCheckFramework.executeHealthCheck(checkId)

        );
      } else {
        reply.code(400).send({
          success: false,
          error: 'Must specify either suiteId or checkIds'
        });
        return;
      }

      // Calculate overall status
      const overallStatus = results.some(r => r.status === HealthStatus.UNHEALTHY) ? HealthStatus.UNHEALTHY :
        results.some(r => r.status === HealthStatus.DEGRADED) ? HealthStatus.DEGRADED :
          HealthStatus.HEALTHY;

      const response: HealthMonitoringResponse<{
        overallStatus: HealthStatus;
        totalChecks: number;
        results: any[];
        summary: {
          healthy: number;
          degraded: number;
          unhealthy: number;
        };
      }> = {
        success: true,
        data: {
          overallStatus,
          totalChecks: results.length,
          results: request.body.includeDetails ? results : results.map(r => ({
            checkId: r.checkId,
            status: r.status,
            message: r.message,
            timestamp: r.timestamp
          })),
          summary: {
            healthy: results.filter(r => r.status === HealthStatus.HEALTHY).length,
            degraded: results.filter(r => r.status === HealthStatus.DEGRADED).length,
            unhealthy: results.filter(r => r.status === HealthStatus.UNHEALTHY).length
          }
  }
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      };

      await auditService.logAction({
        userId: request.user.userId,
        action: 'health_checks_executed',
        resource: request.body.suiteId ? `health_suite:${request.body.suiteId}` : 'health_checks',
        details: {
          requestId,
          totalChecks: results.length,
          overallStatus,
          timestamp: new Date()
        }
      });

      reply.send(response);

    } catch (error) {
      fastify.log.error(`Health check execution error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: error.message || 'Failed to execute health checks',
        metadata: {
          timestamp: new Date(),
          requestId,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });
    }
  });

  // Get health check definitions
  fastify.get('/health/checks', async (request, reply) => {
    const startTime = Date.now();

    try {
      const healthChecks = await healthCheckFramework.listHealthChecks();
      
      reply.send({
        success: true,
        data: healthChecks,
        metadata: {
          timestamp: new Date(),
          requestId: `list_checks_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Health checks listing error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve health checks'
      });
    }
  });

  // Get health check suites
  fastify.get('/health/suites', async (request, reply) => {
    const startTime = Date.now();

    try {
      const suites = await healthCheckFramework.listHealthCheckSuites();
      
      reply.send({
        success: true,
        data: suites,
        metadata: {
          totalSuites: suites.length,
          timestamp: new Date(),
          requestId: `list_suites_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Health suites listing error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve health check suites'
      });
    }
  });

  // Get health check execution history
  fastify.get<{ Params: { checkId: string }; Querystring: { limit?: number } }>('/health/checks/:checkId/history', {
    schema: {
      params: {
        type: 'object',
        properties: {
          checkId: { type: 'string' }
  }
        required: ['checkId']
  }
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const history = await healthCheckFramework.getExecutionHistory(
        request.params.checkId,
        request.query.limit || 100
      );

      reply.send({
        success: true,
        data: {
          checkId: request.params.checkId,
          history,
          totalRecords: history.length
  }
        metadata: {
          timestamp: new Date(),
          requestId: `history_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Health check history error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve health check history'
      });
    }
  });

  // ==========================================
  // ERROR TRACKING ENDPOINTS
  // ==========================================

  // Capture error
  fastify.post<{ Body: ErrorCaptureRequest }>('/errors/capture', {
    schema: {
      body: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string' },
          stackTrace: { type: 'string' },
          context: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              component: { type: 'string' },
              operation: { type: 'string' },
              url: { type: 'string' },
              httpMethod: { type: 'string' },
              httpStatus: { type: 'integer' },
              additionalData: { type: 'object' }
            }
  }
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const errorId = await errorTrackingService.captureError(
        request.body.error,
        request.body.context || {}
      );

      await auditService.logAction({
        userId: request.user.userId,
        action: 'error_captured_via_api',
        resource: `error:${errorId}`,
        details: {
          errorMessage: request.body.error.substring(0, 200),
          context: request.body.context,
          severity: request.body.severity,
          timestamp: new Date()
        }
      });

      reply.code(201).send({
        success: true,
        data: {
          errorId,
          message: 'Error captured successfully'
  }
        metadata: {
          timestamp: new Date(),
          requestId: `capture_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Error capture failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to capture error'
      });
    }
  });

  // Query errors
  fastify.post<{ Body: ErrorQuery }>('/errors/query', {
    schema: {
      body: {
        type: 'object',
        properties: {
          timeRange: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date-time' },
              end: { type: 'string', format: 'date-time' }
            }
  }
          severity: { type: 'array', items: { type: 'string' } },
          category: { type: 'array', items: { type: 'string' } },
          searchText: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          sortBy: { type: 'string', enum: ['timestamp', 'severity'] },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      // Convert string dates to Date objects if provided
      const query = { ...request.body };
      if (query.timeRange) {
        query.timeRange = {
          start: new Date(query.timeRange.start),
          end: new Date(query.timeRange.end)
        };
      }

      const errors = await errorTrackingService.queryErrors(query);

      reply.send({
        success: true,
        data: {
          errors,
          totalCount: errors.length,
          filters: query
  }
        metadata: {
          timestamp: new Date(),
          requestId: `query_errors_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Error query failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to query errors'
      });
    }
  });

  // Get error analytics
  fastify.post<{ Body: { timeRange: { start: string; end: string } } }>('/errors/analytics', {
    schema: {
      body: {
        type: 'object',
        required: ['timeRange'],
        properties: {
          timeRange: {
            type: 'object',
            required: ['start', 'end'],
            properties: {
              start: { type: 'string', format: 'date-time' },
              end: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      const timeRange = {
        start: new Date(request.body.timeRange.start),
        end: new Date(request.body.timeRange.end)
      };

      const analytics = await errorTrackingService.generateAnalytics(timeRange);

      reply.send({
        success: true,
        data: analytics,
        metadata: {
          timestamp: new Date(),
          requestId: `analytics_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Error analytics failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to generate error analytics'
      });
    }
  });

  // Resolve error group
  fastify.post<{ 
    Params: { groupId: string };
    Body: { resolution: string; actionsTaken?: string[] }
  }>('/errors/groups/:groupId/resolve', {
    schema: {
      params: {
        type: 'object',
        properties: {
          groupId: { type: 'string' }
  }
        required: ['groupId']
  }
      body: {
        type: 'object',
        required: ['resolution'],
        properties: {
          resolution: { type: 'string' },
          actionsTaken: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      await errorTrackingService.resolveErrorGroup(
        request.params.groupId,
        request.user.userId,
        request.body.resolution,
        request.body.actionsTaken || []
      );

      reply.send({
        success: true,
        data: {
          groupId: request.params.groupId,
          resolvedBy: request.user.userId,
          resolution: request.body.resolution,
          resolvedAt: new Date()
  }
        metadata: {
          timestamp: new Date(),
          requestId: `resolve_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Error group resolution failed: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to resolve error group'
      });
    }
  });

  // ==========================================
  // COMBINED DASHBOARD ENDPOINTS
  // ==========================================

  // Get health monitoring dashboard data
  fastify.get<{ Querystring: HealthDashboardQuery }>('/dashboard', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeRange: { type: 'string', default: 'last_hour' },
          includeHistory: { type: 'boolean', default: false },
          groupBy: { type: 'string', default: 'category' },
          refreshInterval: { type: 'integer', default: 30000 }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      // Calculate time range
      const now = new Date();
      const timeRangeMs = request.query.timeRange === 'last_hour' ? 3600000 :
        request.query.timeRange === 'last_day' ? 86400000 : 3600000;
      const timeRange = {
        start: new Date(now.getTime() - timeRangeMs),
        end: now
      };

      // Get health status
      const healthChecks = await healthCheckFramework.listHealthChecks({ enabled: true });
      const healthSummary = {
        totalChecks: healthChecks.length,
        enabledChecks: healthChecks.filter(c => c.enabled).length,
        lastExecuted: new Date(), // Would be actual last execution time
        overallStatus: HealthStatus.HEALTHY // Would be calculated from recent executions
      };

      // Get error analytics
      const errorAnalytics = await errorTrackingService.generateAnalytics(timeRange);

      // Combine dashboard data
      const dashboardData = {
        healthSummary,
        errorAnalytics,
        systemStatus: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date()
  }
        alerts: {
          active: 0, // Would query active alerts
          critical: errorAnalytics.severityBreakdown.critical || 0,
          warnings: errorAnalytics.severityBreakdown.high || 0
  }
        trends: {
          errorRate: errorAnalytics.trendAnalysis.errorRateTrend,
          healthScore: 95, // Would be calculated from health checks
          responseTime: 250 // Would be from performance metrics
        }
      };

      reply.send({
        success: true,
        data: dashboardData,
        metadata: {
          timeRange: request.query.timeRange,
          refreshInterval: request.query.refreshInterval,
          timestamp: new Date(),
          requestId: `dashboard_${Date.now()}`,
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      });

    } catch (error) {
      fastify.log.error(`Dashboard data error: ${error.message}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve dashboard data'
      });
    }
  });

  // ==========================================
  // SYSTEM STATUS ENDPOINTS
  // ==========================================

  // Get service status
  fastify.get('/status', async (request, reply) => {
    try {
      const status = {
        service: 'health-monitoring',
        status: 'healthy',
        timestamp: new Date(),
        version: '1.0.0',
        components: {
          healthCheckFramework: 'operational',
          errorTracking: 'operational',
          database: 'operational',
          apis: 'operational'
  }
        features: {
          healthChecks: true,
          errorTracking: true,
          alerting: true,
          analytics: true,
          dashboards: true
  }
        statistics: {
          registeredHealthChecks: (await healthCheckFramework.listHealthChecks()).length,
          healthCheckSuites: (await healthCheckFramework.listHealthCheckSuites()).length,
          errorsCaptured: 'N/A', // Would be from database
          activeAlerts: 0
        }
      };

      reply.send({
        success: true,
        data: status
      });

    } catch (error) {
      fastify.log.error(`Status check error: ${error.message}`);
      reply.code(503).send({
        success: false,
        error: 'Service status check failed'
      });
    }
  });

  fastify.log.info('Health Monitoring API routes registered successfully');
};

export default healthMonitoringAPI;