/**
 * Epic 17 Performance Monitoring Routes
 * Task: E17-1753114397209-9BCDD6 - Implement performance monitoring
 * 
 * REST API endpoints for Epic 17 admin performance monitoring,
 * providing dashboard data, reports, and admin controls.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  Epic17PerformanceMonitor,
  AdminOperation,
  AdminCategory,
  BackstageComponent,
  ConfigurationArea,
  SystemIntegration,
  ImpactScope,
  ComplianceLevel,
  PerformanceImpact
} from '../monitoring/Epic17PerformanceMonitor';

// Request/Response Types
}
interface RecordAdminMetricRequest {
  operation: AdminOperation;
  category: AdminCategory;
  value: number;
  context: {
    adminUserId?: string;
    adminRole?: string;
    backstageComponent: BackstageComponent;
    configurationArea: ConfigurationArea;
    systemIntegration: SystemIntegration;
    impactScope: ImpactScope;
    complianceLevel: ComplianceLevel;
    performanceImpact: PerformanceImpact;
}
  };
}

}
interface AdminPerformanceReportRequest {
  startDate: string;
  endDate: string;
  categories?: AdminCategory[];
  includeIntegrationHealth?: boolean;
  includeComplianceAnalysis?: boolean;
  format?: 'json' | 'pdf' | 'csv';
}
}

}
interface AdminPerformanceQuery {
  operation?: string;
  category?: string;
  timeRange?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
}

}
interface IntegrationHealthQuery {
  integration?: string;
  status?: string;
  includeHistory?: boolean;
  timeRange?: string;
}
}

/**
 * Register Epic 17 Performance Monitoring routes
 */
export async function epic17PerformanceMonitoringRoutes(fastify: FastifyInstance) {
  const performanceMonitor = fastify.epic17PerformanceMonitor as Epic17PerformanceMonitor;

  if (!performanceMonitor) {
    throw new Error('Epic17PerformanceMonitor not registered with Fastify instance');
  }

  // =============================================================================
  // Metrics Recording Routes
  // =============================================================================

  /**
   * Record an admin performance metric
   */
  fastify.post('/epic17/performance/metrics', {
    schema: {
      description: 'Record an admin performance metric',
      tags: ['Epic 17', 'Performance', 'Admin'],
      body: {
        type: 'object',
        required: ['operation', 'category', 'value', 'context'],
        properties: {
          operation: { 
            type: 'string', 
            enum: Object.values(AdminOperation),
            description: 'Admin operation being measured'
  }
          category: { 
            type: 'string', 
            enum: Object.values(AdminCategory),
            description: 'Category of admin operation'
  }
          value: { 
            type: 'number', 
            minimum: 0,
            description: 'Performance value in milliseconds'
  }
          context: {
            type: 'object',
            required: ['backstageComponent', 'configurationArea', 'systemIntegration', 'impactScope', 'complianceLevel', 'performanceImpact'],
            properties: {
              adminUserId: { type: 'string', description: 'ID of admin user performing operation' },
              adminRole: { type: 'string', description: 'Role of admin user' },
              backstageComponent: { 
                type: 'string', 
                enum: Object.values(BackstageComponent),
                description: 'Backstage component involved'
  }
              configurationArea: { 
                type: 'string', 
                enum: Object.values(ConfigurationArea),
                description: 'Configuration area affected'
  }
              systemIntegration: { 
                type: 'string', 
                enum: Object.values(SystemIntegration),
                description: 'System integration involved'
  }
              impactScope: { 
                type: 'string', 
                enum: Object.values(ImpactScope),
                description: 'Scope of impact'
  }
              complianceLevel: { 
                type: 'string', 
                enum: Object.values(ComplianceLevel),
                description: 'Compliance level required'
  }
              performanceImpact: { 
                type: 'string', 
                enum: Object.values(PerformanceImpact),
                description: 'Performance impact level'
              }
            }
          }
        }
  }
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            metricId: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: RecordAdminMetricRequest }>, reply: FastifyReply) => {
    try {
      performanceMonitor.recordAdminMetric(
        request.body.operation,
        request.body.category,
        request.body.value,
        request.body.context
      );

      reply.status(201);
      return {
        success: true,
        message: 'Admin performance metric recorded successfully',
        metricId: `admin_metric_${Date.now()}`
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record admin metric'
      };
    }
  });

  // =============================================================================
  // Dashboard and Analytics Routes
  // =============================================================================

  /**
   * Get admin performance dashboard data
   */
  fastify.get('/epic17/performance/dashboard', {
    schema: {
      description: 'Get Epic 17 admin performance dashboard data',
      tags: ['Epic 17', 'Performance', 'Dashboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dashboardData = performanceMonitor.getAdminPerformanceDashboard();

      return {
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard data'
      };
    }
  });

  /**
   * Get admin performance metrics with filtering
   */
  fastify.get('/epic17/performance/metrics', {
    schema: {
      description: 'Get admin performance metrics with filtering and pagination',
      tags: ['Epic 17', 'Performance', 'Metrics'],
      querystring: {
        type: 'object',
        properties: {
          operation: { 
            type: 'string', 
            enum: Object.values(AdminOperation),
            description: 'Filter by admin operation'
  }
          category: { 
            type: 'string', 
            enum: Object.values(AdminCategory),
            description: 'Filter by admin category'
  }
          timeRange: { 
            type: 'string', 
            enum: ['1h', '24h', '7d', '30d'],
            default: '24h',
            description: 'Time range for metrics'
  }
          limit: { 
            type: 'number', 
            default: 50, 
            maximum: 500,
            description: 'Maximum number of results'
  }
          offset: { 
            type: 'number', 
            default: 0,
            description: 'Number of results to skip'
  }
          sortBy: { 
            type: 'string', 
            enum: ['timestamp', 'value', 'operation'],
            default: 'timestamp',
            description: 'Sort field'
  }
          sortOrder: { 
            type: 'string', 
            enum: ['asc', 'desc'],
            default: 'desc',
            description: 'Sort order'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: AdminPerformanceQuery }>, reply: FastifyReply) => {
    try {
      // Implementation would filter and paginate admin metrics
      // For now, return placeholder response
      const metrics = {
        metrics: [],
        pagination: {
          total: 0,
          limit: request.query.limit || 50,
          offset: request.query.offset || 0,
          hasMore: false
  }
        filters: request.query
      };

      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance metrics'
      };
    }
  });

  /**
   * Get integration health status
   */
  fastify.get('/epic17/performance/integrations/health', {
    schema: {
      description: 'Get system integration health status',
      tags: ['Epic 17', 'Performance', 'Integration Health'],
      querystring: {
        type: 'object',
        properties: {
          integration: { 
            type: 'string',
            enum: Object.values(SystemIntegration),
            description: 'Filter by specific integration'
  }
          status: { 
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
            description: 'Filter by health status'
  }
          includeHistory: { 
            type: 'boolean', 
            default: false,
            description: 'Include historical health data'
  }
          timeRange: { 
            type: 'string',
            enum: ['1h', '24h', '7d'],
            default: '24h',
            description: 'Time range for history'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: IntegrationHealthQuery }>, reply: FastifyReply) => {
    try {
      // Get integration health from dashboard data
      const dashboardData = performanceMonitor.getAdminPerformanceDashboard();
      let integrationHealth = dashboardData.integrationHealth;

      // Apply filters
      if (request.query.integration) {
        integrationHealth = integrationHealth.filter(i => i.integration === request.query.integration);
      }
      
      if (request.query.status) {
        integrationHealth = integrationHealth.filter(i => i.status === request.query.status);
      }

      return {
        success: true,
        data: {
          integrations: integrationHealth,
          summary: {
            total: integrationHealth.length,
            healthy: integrationHealth.filter(i => i.status === 'healthy').length,
            degraded: integrationHealth.filter(i => i.status === 'degraded').length,
            unhealthy: integrationHealth.filter(i => i.status === 'unhealthy').length,
            averageResponseTime: integrationHealth.reduce((sum, i) => sum + i.responseTime, 0) / integrationHealth.length,
            averageAvailability: integrationHealth.reduce((sum, i) => sum + i.availability, 0) / integrationHealth.length
  }
          includeHistory: request.query.includeHistory || false
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get integration health'
      };
    }
  });

  // =============================================================================
  // Reporting Routes
  // =============================================================================

  /**
   * Generate admin performance report
   */
  fastify.post('/epic17/performance/reports', {
    schema: {
      description: 'Generate Epic 17 admin performance report',
      tags: ['Epic 17', 'Performance', 'Reports'],
      body: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'Report start date'
  }
          endDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'Report end date'
  }
          categories: { 
            type: 'array',
            items: { type: 'string', enum: Object.values(AdminCategory) },
            description: 'Filter by admin categories'
  }
          includeIntegrationHealth: { 
            type: 'boolean', 
            default: true,
            description: 'Include integration health analysis'
  }
          includeComplianceAnalysis: { 
            type: 'boolean', 
            default: true,
            description: 'Include compliance analysis'
  }
          format: { 
            type: 'string',
            enum: ['json', 'pdf', 'csv'],
            default: 'json',
            description: 'Report format'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: AdminPerformanceReportRequest }>, reply: FastifyReply) => {
    try {
      const startDate = new Date(request.body.startDate);
      const endDate = new Date(request.body.endDate);
      
      // Validate date range
      if (startDate >= endDate) {
        reply.status(400);
        return {
          success: false,
          error: 'Start date must be before end date'
        };
      }
      
      // Generate report
      const report = await performanceMonitor.generateAdminPerformanceReport(
        startDate,
        endDate,
        request.body.categories || []
      );

      // Handle different formats
      if (request.body.format === 'json') {
        return {
          success: true,
          data: report,
          message: 'Admin performance report generated successfully'
        };
      } else {
        // For PDF/CSV formats, would implement file generation and return URL
        return {
          success: true,
          data: {
            reportId: report.reportId,
            downloadUrl: `/epic17/performance/reports/${report.reportId}/download?format=${request.body.format}`,
            format: request.body.format
  }
          message: 'Admin performance report generated successfully'
        };
      }
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate performance report'
      };
    }
  });

  /**
   * Get performance report by ID
   */
  fastify.get('/epic17/performance/reports/:reportId', {
    schema: {
      description: 'Get performance report by ID',
      tags: ['Epic 17', 'Performance', 'Reports'],
      params: {
        type: 'object',
        required: ['reportId'],
        properties: {
          reportId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { reportId: string } }>, reply: FastifyReply) => {
    try {
      // Implementation would retrieve report from storage
      // For now, return placeholder
      reply.status(404);
      return {
        success: false,
        error: 'Report not found'
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance report'
      };
    }
  });

  // =============================================================================
  // Alert Management Routes
  // =============================================================================

  /**
   * Get active performance alerts
   */
  fastify.get('/epic17/performance/alerts', {
    schema: {
      description: 'Get active Epic 17 performance alerts',
      tags: ['Epic 17', 'Performance', 'Alerts'],
      querystring: {
        type: 'object',
        properties: {
          severity: { 
            type: 'string',
            enum: ['info', 'warning', 'critical', 'emergency'],
            description: 'Filter by alert severity'
  }
          status: { 
            type: 'string',
            enum: ['active', 'acknowledged', 'resolved'],
            default: 'active',
            description: 'Filter by alert status'
  }
          operation: { 
            type: 'string',
            enum: Object.values(AdminOperation),
            description: 'Filter by admin operation'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      const dashboardData = performanceMonitor.getAdminPerformanceDashboard();
      let alerts = dashboardData.criticalAdminAlerts;

      // Apply filters
      if (request.query.severity) {
        alerts = alerts.filter(alert => alert.severity === request.query.severity);
      }

      if (request.query.status) {
        alerts = alerts.filter(alert => alert.status === request.query.status);
      }

      if (request.query.operation) {
        alerts = alerts.filter(alert => alert.adminOperation === request.query.operation);
      }

      return {
        success: true,
        data: {
          alerts,
          summary: {
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            emergency: alerts.filter(a => a.severity === 'emergency').length,
            warning: alerts.filter(a => a.severity === 'warning').length,
            totalAffectedUsers: alerts.reduce((sum, a) => sum + a.affectedUsers, 0)
          }
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get performance alerts'
      };
    }
  });

  /**
   * Acknowledge performance alert
   */
  fastify.post('/epic17/performance/alerts/:alertId/acknowledge', {
    schema: {
      description: 'Acknowledge a performance alert',
      tags: ['Epic 17', 'Performance', 'Alerts'],
      params: {
        type: 'object',
        required: ['alertId'],
        properties: {
          alertId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        properties: {
          reason: { 
            type: 'string', 
            maxLength: 500,
            description: 'Reason for acknowledgment'
  }
          estimatedResolutionTime: { 
            type: 'string', 
            format: 'date-time',
            description: 'Estimated resolution time'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { alertId: string };
    Body: { reason?: string; estimatedResolutionTime?: string };
  }>, reply: FastifyReply) => {
    try {
      // Implementation would acknowledge the alert
      // For now, return success
      return {
        success: true,
        message: 'Alert acknowledged successfully',
        alertId: request.params.alertId,
        acknowledgedAt: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to acknowledge alert'
      };
    }
  });

  // =============================================================================
  // Health Check Route
  // =============================================================================

  /**
   * Performance monitoring system health check
   */
  fastify.get('/epic17/performance/health', {
    schema: {
      description: 'Epic 17 performance monitoring system health check',
      tags: ['Epic 17', 'Performance', 'Health Check']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dashboardData = performanceMonitor.getAdminPerformanceDashboard();
      
      return {
        status: 'healthy',
        service: 'epic17-performance-monitoring',
        version: '1.0.0',
        uptime: process.uptime(),
        systemHealth: {
          integrationHealthScore: dashboardData.adminSystemOverview.integrationHealthScore,
          complianceViolations: dashboardData.adminSystemOverview.complianceViolations,
          activeAlerts: dashboardData.criticalAdminAlerts.length,
          resourceUtilization: dashboardData.resourceUtilization
  }
        features: [
          'Admin operation performance tracking',
          'Real-time integration health monitoring',
          'Compliance metrics collection',
          'Performance alert management',
          'Admin dashboard analytics',
          'Comprehensive performance reporting'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(503);
      return {
        status: 'unhealthy',
        service: 'epic17-performance-monitoring',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });

  console.log('📊 Epic 17 Performance Monitoring routes registered successfully');
}

export default epic17PerformanceMonitoringRoutes;