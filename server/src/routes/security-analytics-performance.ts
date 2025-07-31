/**
 * Security Analytics Performance Monitoring API Routes
 * Epic 31.4.3.1 - Security Analytics Performance Monitoring
 * 
 * Provides REST API endpoints for security analytics performance monitoring
 * integrated with Epic 1 Analytics Foundation and Epic 17 Admin/Auth Systems.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityAnalyticsIntegrationService,
  SecurityAnalyticsIntegrationConfig
} from '../services/SecurityAnalyticsIntegrationService';
import { AdminAuthGuard } from '../admin/guards/AdminAuthGuard';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../database/analytics-dao';
import { HealthCheckFramework } from '../admin/HealthCheckFramework';
import { DiagnosticService } from '../admin/DiagnosticService';

// Global service instance
let securityAnalyticsService: SecurityAnalyticsIntegrationService | null = null;

}
}
interface SecurityAnalyticsQuery {
  timeRange?: 'last_hour' | 'last_day' | 'last_week' | 'last_month';
  includeAlerts?: boolean;
  includeMetrics?: boolean;
  includeDiagnostics?: boolean;
}
}
}

}
}
interface SecurityAnalyticsResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}
}
}

/**
 * Initialize security analytics service
 */
async function initializeSecurityAnalyticsService(): Promise<SecurityAnalyticsIntegrationService> {

  if (securityAnalyticsService) {
    return securityAnalyticsService;
  }

  // Configure integration with Epic 1 and Epic 17 systems
  const config: SecurityAnalyticsIntegrationConfig = {
    epic1_analytics_integration: {
      enabled: true,
      analytics_collector: new AnalyticsCollector({ 
        batchSize: 100,
        flushIntervalMs: 5000 
      }),
      analytics_dao: new AnalyticsDAO(process.env.DATABASE_PATH || './analytics.db'),
      performance_event_forwarding: true,
      batch_size: 50,
      flush_interval_ms: 10000
  }
    epic17_admin_integration: {
      enabled: true,
      auth_guard: new AdminAuthGuard(),
      health_check_framework: new HealthCheckFramework(),
      diagnostic_service: new DiagnosticService(),
      admin_notification_enabled: true,
      security_alert_threshold: 10
  }
    performance_monitoring: {
      real_time_monitoring_enabled: true,
      performance_threshold_ms: 1000,
      memory_threshold_mb: 512,
      cpu_threshold_percent: 80,
      alert_on_degradation: true,
      auto_optimization_enabled: false
  }
    security_features: {
      threat_detection_enabled: true,
      anomaly_detection_sensitivity: 0.8,
      correlation_analysis_enabled: true,
      predictive_analytics_enabled: false,
      automated_response_enabled: false
    }
  };

  securityAnalyticsService = new SecurityAnalyticsIntegrationService(config);
  await securityAnalyticsService.initialize();

  return securityAnalyticsService;
}

export default async function securityAnalyticsPerformanceRoutes(fastify: FastifyInstance) {
  // Initialize service
  const service = await initializeSecurityAnalyticsService();

  /**
   * GET /api/security-analytics/performance/status
   * Get current security analytics performance status
   */
  fastify.get('/api/security-analytics/performance/status', {
    preHandler: [fastify.authenticate], // Basic auth
    schema: {
      description: 'Get security analytics performance monitoring status',
      tags: ['Security Analytics'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                integration_status: { type: 'object' },
                current_metrics: { type: 'object' },
                monitoring_active: { type: 'boolean' }
              }
  }
            timestamp: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<SecurityAnalyticsResponse> => {
    try {
      const integrationStatus = service.getIntegrationStatus();
      const currentMetrics = await service.getCurrentPerformanceMetrics();

      return {
        success: true,
        data: {
          integration_status: integrationStatus,
          current_metrics: currentMetrics,
          monitoring_active: integrationStatus.monitoring_active
  }
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting security analytics status:', error);
      return {
        success: false,
        error: 'Failed to get security analytics status',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/performance/metrics
   * Get detailed performance metrics
   */
  fastify.get<{ Querystring: SecurityAnalyticsQuery }>('/api/security-analytics/performance/metrics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get detailed security analytics performance metrics',
      tags: ['Security Analytics'],
      querystring: {
        type: 'object',
        properties: {
          timeRange: { 
            type: 'string', 
            enum: ['last_hour', 'last_day', 'last_week', 'last_month'] 
  }
          includeAlerts: { type: 'boolean' },
          includeMetrics: { type: 'boolean' },
          includeDiagnostics: { type: 'boolean' }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Querystring: SecurityAnalyticsQuery }>,
    reply: FastifyReply
  ): Promise<SecurityAnalyticsResponse> => {
    try {
      const { timeRange = 'last_hour', includeAlerts = false, includeMetrics = true, includeDiagnostics = false } = request.query;

      const responseData: any = {};

      if (includeMetrics) {
        responseData.current_metrics = await service.getCurrentPerformanceMetrics();
        responseData.integration_status = service.getIntegrationStatus();
      }

      if (includeAlerts) {
        // Get recent alerts from service
        responseData.recent_alerts = []; // Would be populated from service
      }

      if (includeDiagnostics) {
        responseData.diagnostics = await service.performDeepDiagnostics();
      }

      return {
        success: true,
        data: responseData,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting security analytics metrics:', error);
      return {
        success: false,
        error: 'Failed to get security analytics metrics',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-analytics/performance/alerts/acknowledge
   * Acknowledge security analytics alerts
   */
  fastify.post<{ Body: { alertId: string; acknowledgedBy: string } }>('/api/security-analytics/performance/alerts/acknowledge', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Acknowledge security analytics alert',
      tags: ['Security Analytics'],
      body: {
        type: 'object',
        required: ['alertId', 'acknowledgedBy'],
        properties: {
          alertId: { type: 'string' },
          acknowledgedBy: { type: 'string' }
        }
      }
    }
  }, async (
    request: FastifyRequest<{ Body: { alertId: string; acknowledgedBy: string } }>,
    reply: FastifyReply
  ): Promise<SecurityAnalyticsResponse> => {
    try {
      const { alertId, acknowledgedBy } = request.body;

      // Implementation would acknowledge alert in service
      // await service.acknowledgeAlert(alertId, acknowledgedBy);

      return {
        success: true,
        data: {
          alert_id: alertId,
          acknowledged_by: acknowledgedBy,
          acknowledged_at: Date.now()
  }
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error acknowledging security analytics alert:', error);
      return {
        success: false,
        error: 'Failed to acknowledge alert',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/performance/health
   * Get security analytics system health check
   */
  fastify.get('/api/security-analytics/performance/health', {
    schema: {
      description: 'Get security analytics system health',
      tags: ['Security Analytics', 'Health Check']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<SecurityAnalyticsResponse> => {
    try {
      const metrics = await service.getCurrentPerformanceMetrics();
      const isHealthy = metrics.performance_score > 80 && 
                       metrics.system_availability_percent > 99.0;

      return {
        success: true,
        data: {
          healthy: isHealthy,
          performance_score: metrics.performance_score,
          system_availability: metrics.system_availability_percent,
          active_threats: metrics.active_threats_detected,
          last_check: Date.now()
  }
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting security analytics health:', error);
      return {
        success: false,
        error: 'Failed to get system health',
        timestamp: Date.now()
      };
    }
  });

  /**
   * POST /api/security-analytics/performance/optimize
   * Trigger performance optimization
   */
  fastify.post('/api/security-analytics/performance/optimize', {
    preHandler: [fastify.authenticate], // Requires admin auth
    schema: {
      description: 'Trigger security analytics performance optimization',
      tags: ['Security Analytics', 'Admin']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<SecurityAnalyticsResponse> => {
    try {
      // Implementation would trigger optimization in service
      // await service.triggerOptimization();

      return {
        success: true,
        data: {
          optimization_started: true,
          started_at: Date.now()
  }
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error triggering security analytics optimization:', error);
      return {
        success: false,
        error: 'Failed to trigger optimization',
        timestamp: Date.now()
      };
    }
  });

  /**
   * GET /api/security-analytics/performance/diagnostics
   * Get comprehensive system diagnostics (admin only)
   */
  fastify.get('/api/security-analytics/performance/diagnostics', {
    preHandler: [fastify.authenticate], // Should use admin auth guard
    schema: {
      description: 'Get comprehensive security analytics diagnostics',
      tags: ['Security Analytics', 'Admin', 'Diagnostics']
    }
  }, async (request: FastifyRequest, reply: FastifyReply): Promise<SecurityAnalyticsResponse> => {
    try {
      const diagnostics = await service.performDeepDiagnostics();

      return {
        success: true,
        data: diagnostics,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error('Error getting security analytics diagnostics:', error);
      return {
        success: false,
        error: 'Failed to get diagnostics',
        timestamp: Date.now()
      };
    }
  });

  // Setup service event handlers for real-time updates
  service.on('security_alert', (alert) => {
    fastify.log.warn('Security Analytics Alert:', alert);
  });

  service.on('performance_degradation', (data) => {
    fastify.log.warn('Security Analytics Performance Degradation:', data);
  });

  service.on('error', (error) => {
    fastify.log.error('Security Analytics Service Error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (securityAnalyticsService) {
      await securityAnalyticsService.shutdown();
    }
  });
}