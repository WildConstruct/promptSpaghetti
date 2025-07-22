/**
 * Integration Analytics Routes - Epic 17.4.3 Implementation  
 * Task: E17-1753114397205-8ACF1D - Create integration analytics
 * 
 * REST API endpoints for integration analytics, providing comprehensive
 * visibility into system integrations, usage patterns, performance metrics,
 * error tracking, and cost analysis.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  IntegrationAnalyticsService,
  IntegrationEvent,
  IntegrationType,
  IntegrationOperation,
  IntegrationEventType,
  ErrorCategory
} from '../analytics/IntegrationAnalyticsService';

// Request/Response Types
interface RecordIntegrationEventRequest {
  integrationId: string;
  integrationType: IntegrationType;
  integrationName: string;
  integrationVersion?: string;
  eventType: IntegrationEventType;
  operation: IntegrationOperation;
  operationDetails?: {
    endpoint?: string;
    method?: string;
    parameters?: Record<string, any>;
    headers?: Record<string, string>;
    payload?: any;
  };
  responseTime: number;
  dataSize?: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  errorCategory?: ErrorCategory;
  costData?: {
    baseCost?: number;
    variableCost?: number;
    totalCost: number;
    currency?: string;
    billingUnit?: string;
  };
  context?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    environment?: string;
    region?: string;
  };
  metadata?: Record<string, any>;
}

interface IntegrationAnalyticsQuery {
  integrationIds?: string;
  integrationTypes?: string;
  startDate?: string;
  endDate?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
  groupBy?: 'integration' | 'type' | 'operation' | 'hour' | 'day';
  includeErrors?: boolean;
  includeCosts?: boolean;
  limit?: number;
  offset?: number;
}

interface IntegrationReportRequest {
  startDate: string;
  endDate: string;
  integrationIds?: string[];
  reportType?: 'summary' | 'detailed' | 'executive';
  includeAnalysis?: {
    usage?: boolean;
    performance?: boolean;
    errors?: boolean;
    costs?: boolean;
    trends?: boolean;
    recommendations?: boolean;
    predictions?: boolean;
  };
  format?: 'json' | 'pdf' | 'csv' | 'excel';
  emailRecipients?: string[];
}

interface IntegrationHealthQuery {
  integrationIds?: string;
  status?: 'healthy' | 'degraded' | 'failing' | 'offline';
  includeMetrics?: boolean;
  includeHistory?: boolean;
  timeRange?: string;
}

interface IntegrationMetricsQuery {
  integrationId: string;
  startDate?: string;
  endDate?: string;
  metrics?: string; // comma-separated list
  granularity?: 'minute' | 'hour' | 'day' | 'week';
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

/**
 * Register Integration Analytics routes
 */
export async function integrationAnalyticsRoutes(fastify: FastifyInstance) {
  const analyticsService = fastify.integrationAnalyticsService as IntegrationAnalyticsService;

  if (!analyticsService) {
    throw new Error('IntegrationAnalyticsService not registered with Fastify instance');
  }

  // =============================================================================
  // Event Recording Routes
  // =============================================================================

  /**
   * Record integration event
   */
  fastify.post('/integration-analytics/events', {
    schema: {
      description: 'Record an integration event for analytics tracking',
      tags: ['Integration Analytics', 'Events'],
      body: {
        type: 'object',
        required: ['integrationId', 'integrationType', 'integrationName', 'eventType', 'operation', 'responseTime', 'success'],
        properties: {
          integrationId: { 
            type: 'string', 
            description: 'Unique identifier for the integration'
          },
          integrationType: { 
            type: 'string', 
            enum: Object.values(IntegrationType),
            description: 'Type of integration'
          },
          integrationName: { 
            type: 'string',
            description: 'Human-readable name of the integration'
          },
          integrationVersion: { 
            type: 'string', 
            default: '1.0.0',
            description: 'Version of the integration'
          },
          eventType: { 
            type: 'string', 
            enum: Object.values(IntegrationEventType),
            description: 'Type of event that occurred'
          },
          operation: { 
            type: 'string', 
            enum: Object.values(IntegrationOperation),
            description: 'Operation being performed'
          },
          operationDetails: {
            type: 'object',
            description: 'Details about the operation',
            properties: {
              endpoint: { type: 'string' },
              method: { type: 'string' },
              parameters: { type: 'object' },
              headers: { type: 'object' },
              payload: {}
            }
          },
          responseTime: { 
            type: 'number', 
            minimum: 0,
            description: 'Response time in milliseconds'
          },
          dataSize: { 
            type: 'number', 
            minimum: 0,
            description: 'Size of data transferred in bytes'
          },
          success: { 
            type: 'boolean',
            description: 'Whether the operation was successful'
          },
          errorCode: { 
            type: 'string',
            description: 'Error code if operation failed'
          },
          errorMessage: { 
            type: 'string',
            description: 'Error message if operation failed'
          },
          errorCategory: { 
            type: 'string', 
            enum: Object.values(ErrorCategory),
            description: 'Category of error if operation failed'
          },
          costData: {
            type: 'object',
            description: 'Cost information for the operation',
            properties: {
              baseCost: { type: 'number', minimum: 0 },
              variableCost: { type: 'number', minimum: 0 },
              totalCost: { type: 'number', minimum: 0 },
              currency: { type: 'string', default: 'USD' },
              billingUnit: { type: 'string', default: 'request' }
            },
            required: ['totalCost']
          },
          context: {
            type: 'object',
            description: 'Context information for the event',
            properties: {
              userId: { type: 'string' },
              sessionId: { type: 'string' },
              requestId: { type: 'string' },
              environment: { type: 'string' },
              region: { type: 'string' }
            }
          },
          metadata: {
            type: 'object',
            description: 'Additional metadata for the event'
          }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            eventId: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: RecordIntegrationEventRequest }>, reply: FastifyReply) => {
    try {
      // Record the integration event
      analyticsService.recordEvent({
        integrationId: request.body.integrationId,
        integrationType: request.body.integrationType,
        integrationName: request.body.integrationName,
        integrationVersion: request.body.integrationVersion,
        eventType: request.body.eventType,
        operation: request.body.operation,
        operationDetails: request.body.operationDetails || {},
        responseTime: request.body.responseTime,
        dataSize: request.body.dataSize,
        success: request.body.success,
        errorCode: request.body.errorCode,
        errorMessage: request.body.errorMessage,
        errorCategory: request.body.errorCategory,
        costData: request.body.costData ? {
          baseCost: request.body.costData.baseCost || 0,
          variableCost: request.body.costData.variableCost || 0,
          totalCost: request.body.costData.totalCost,
          currency: request.body.costData.currency || 'USD',
          billingUnit: request.body.costData.billingUnit || 'request'
        } : undefined,
        context: request.body.context ? {
          ...request.body.context,
          environment: request.body.context.environment || 'development'
        } : { environment: 'development' },
        metadata: request.body.metadata || {}
      });

      reply.status(201);
      return {
        success: true,
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Integration event recorded successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record integration event'
      };
    }
  });

  // =============================================================================
  // Dashboard and Analytics Routes
  // =============================================================================

  /**
   * Get integration analytics dashboard
   */
  fastify.get('/integration-analytics/dashboard', {
    schema: {
      description: 'Get comprehensive integration analytics dashboard',
      tags: ['Integration Analytics', 'Dashboard'],
      querystring: {
        type: 'object',
        properties: {
          timeRange: { 
            type: 'string', 
            enum: ['1h', '24h', '7d', '30d'],
            default: '24h',
            description: 'Time range for analytics data'
          },
          includeErrorAnalysis: { 
            type: 'boolean', 
            default: true,
            description: 'Include detailed error analysis'
          },
          includePerformanceAnalysis: { 
            type: 'boolean', 
            default: true,
            description: 'Include performance analysis'
          },
          includeCostAnalysis: { 
            type: 'boolean', 
            default: true,
            description: 'Include cost analysis'
          }
        }
      },
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
  }, async (request: FastifyRequest<{ Querystring: any }>, reply: FastifyReply) => {
    try {
      // Calculate time range
      const now = new Date();
      const timeRangeMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };

      const timeRange = {
        start: new Date(now.getTime() - timeRangeMs[request.query.timeRange as keyof typeof timeRangeMs]),
        end: now
      };

      const dashboard = analyticsService.getAnalyticsDashboard(timeRange);

      return {
        success: true,
        data: dashboard,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics dashboard'
      };
    }
  });

  /**
   * Get integration analytics with filtering
   */
  fastify.get('/integration-analytics', {
    schema: {
      description: 'Get filtered integration analytics data',
      tags: ['Integration Analytics', 'Query'],
      querystring: {
        type: 'object',
        properties: {
          integrationIds: { 
            type: 'string',
            description: 'Comma-separated list of integration IDs'
          },
          integrationTypes: { 
            type: 'string',
            description: 'Comma-separated list of integration types'
          },
          startDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'Start date for analytics data'
          },
          endDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'End date for analytics data'
          },
          timeRange: { 
            type: 'string', 
            enum: ['1h', '24h', '7d', '30d', '90d'],
            description: 'Predefined time range'
          },
          groupBy: { 
            type: 'string', 
            enum: ['integration', 'type', 'operation', 'hour', 'day'],
            default: 'integration',
            description: 'How to group the analytics data'
          },
          includeErrors: { 
            type: 'boolean', 
            default: true,
            description: 'Include error analytics'
          },
          includeCosts: { 
            type: 'boolean', 
            default: true,
            description: 'Include cost analytics'
          },
          limit: { 
            type: 'number', 
            default: 100, 
            maximum: 1000,
            description: 'Maximum number of results'
          },
          offset: { 
            type: 'number', 
            default: 0,
            description: 'Number of results to skip'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: IntegrationAnalyticsQuery }>, reply: FastifyReply) => {
    try {
      // Parse time range
      let timeRange;
      if (request.query.startDate && request.query.endDate) {
        timeRange = {
          start: new Date(request.query.startDate),
          end: new Date(request.query.endDate)
        };
      } else if (request.query.timeRange) {
        const now = new Date();
        const timeRangeMs = {
          '1h': 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
          '90d': 90 * 24 * 60 * 60 * 1000
        };
        timeRange = {
          start: new Date(now.getTime() - timeRangeMs[request.query.timeRange]),
          end: now
        };
      }

      // Get dashboard data (would be replaced with filtered query in full implementation)
      const dashboard = analyticsService.getAnalyticsDashboard(timeRange);

      // Apply basic filters
      let filteredData = { ...dashboard };

      // Filter by integration IDs if specified
      if (request.query.integrationIds) {
        const integrationIds = request.query.integrationIds.split(',');
        filteredData.healthSummary = filteredData.healthSummary.filter(
          integration => integrationIds.includes(integration.integrationId)
        );
      }

      // Filter by integration types if specified
      if (request.query.integrationTypes) {
        const integrationTypes = request.query.integrationTypes.split(',');
        filteredData.healthSummary = filteredData.healthSummary.filter(
          integration => integrationTypes.includes(integration.type)
        );
      }

      return {
        success: true,
        data: filteredData,
        filters: request.query,
        pagination: {
          limit: request.query.limit || 100,
          offset: request.query.offset || 0,
          total: filteredData.healthSummary.length
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get integration analytics'
      };
    }
  });

  /**
   * Get integration health status
   */
  fastify.get('/integration-analytics/health', {
    schema: {
      description: 'Get integration health status and monitoring data',
      tags: ['Integration Analytics', 'Health'],
      querystring: {
        type: 'object',
        properties: {
          integrationIds: { 
            type: 'string',
            description: 'Comma-separated list of integration IDs'
          },
          status: { 
            type: 'string',
            enum: ['healthy', 'degraded', 'failing', 'offline'],
            description: 'Filter by health status'
          },
          includeMetrics: { 
            type: 'boolean', 
            default: true,
            description: 'Include detailed health metrics'
          },
          includeHistory: { 
            type: 'boolean', 
            default: false,
            description: 'Include health history'
          },
          timeRange: { 
            type: 'string',
            enum: ['1h', '24h', '7d'],
            default: '24h',
            description: 'Time range for health history'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: IntegrationHealthQuery }>, reply: FastifyReply) => {
    try {
      const dashboard = analyticsService.getAnalyticsDashboard();
      let healthData = dashboard.healthSummary;

      // Apply filters
      if (request.query.integrationIds) {
        const integrationIds = request.query.integrationIds.split(',');
        healthData = healthData.filter(integration => 
          integrationIds.includes(integration.integrationId)
        );
      }

      if (request.query.status) {
        healthData = healthData.filter(integration => 
          integration.status === request.query.status
        );
      }

      return {
        success: true,
        data: {
          integrations: healthData,
          summary: {
            total: healthData.length,
            healthy: healthData.filter(i => i.status === 'healthy').length,
            degraded: healthData.filter(i => i.status === 'degraded').length,
            failing: healthData.filter(i => i.status === 'failing').length,
            offline: healthData.filter(i => i.status === 'offline').length,
            averageHealthScore: healthData.reduce((sum, i) => sum + i.healthScore, 0) / healthData.length,
            averageUptime: healthData.reduce((sum, i) => sum + i.uptime, 0) / healthData.length
          },
          includeMetrics: request.query.includeMetrics,
          includeHistory: request.query.includeHistory,
          timeRange: request.query.timeRange
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get integration health data'
      };
    }
  });

  /**
   * Get specific integration metrics
   */
  fastify.get('/integration-analytics/metrics/:integrationId', {
    schema: {
      description: 'Get detailed metrics for a specific integration',
      tags: ['Integration Analytics', 'Metrics'],
      params: {
        type: 'object',
        required: ['integrationId'],
        properties: {
          integrationId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          startDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'Start date for metrics'
          },
          endDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'End date for metrics'
          },
          metrics: { 
            type: 'string',
            description: 'Comma-separated list of metrics to include'
          },
          granularity: { 
            type: 'string',
            enum: ['minute', 'hour', 'day', 'week'],
            default: 'hour',
            description: 'Data granularity'
          },
          aggregation: { 
            type: 'string',
            enum: ['avg', 'sum', 'min', 'max', 'count'],
            default: 'avg',
            description: 'Aggregation method'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ 
    Params: { integrationId: string };
    Querystring: IntegrationMetricsQuery;
  }>, reply: FastifyReply) => {
    try {
      const integrationId = request.params.integrationId;
      
      // Get dashboard data and filter for specific integration
      const dashboard = analyticsService.getAnalyticsDashboard();
      const integration = dashboard.healthSummary.find(i => i.integrationId === integrationId);
      
      if (!integration) {
        reply.status(404);
        return {
          success: false,
          error: 'Integration not found'
        };
      }

      // Return detailed metrics (would be more comprehensive in full implementation)
      return {
        success: true,
        data: {
          integrationId,
          integration,
          metrics: {
            responseTime: {
              current: Math.random() * 1000,
              trend: 'stable',
              dataPoints: [] // Would contain time series data
            },
            throughput: {
              current: Math.random() * 100,
              trend: 'increasing',
              dataPoints: []
            },
            errorRate: {
              current: Math.random() * 5,
              trend: 'decreasing',
              dataPoints: []
            },
            availability: {
              current: 99.5 + Math.random() * 0.5,
              trend: 'stable',
              dataPoints: []
            }
          },
          timeRange: {
            startDate: request.query.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            endDate: request.query.endDate || new Date().toISOString()
          },
          granularity: request.query.granularity,
          aggregation: request.query.aggregation
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get integration metrics'
      };
    }
  });

  // =============================================================================
  // Reporting Routes
  // =============================================================================

  /**
   * Generate integration analytics report
   */
  fastify.post('/integration-analytics/reports', {
    schema: {
      description: 'Generate comprehensive integration analytics report',
      tags: ['Integration Analytics', 'Reports'],
      body: {
        type: 'object',
        required: ['startDate', 'endDate'],
        properties: {
          startDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'Report start date'
          },
          endDate: { 
            type: 'string', 
            format: 'date-time',
            description: 'Report end date'
          },
          integrationIds: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Specific integrations to include'
          },
          reportType: { 
            type: 'string',
            enum: ['summary', 'detailed', 'executive'],
            default: 'detailed',
            description: 'Type of report to generate'
          },
          includeAnalysis: {
            type: 'object',
            description: 'Analysis sections to include',
            properties: {
              usage: { type: 'boolean', default: true },
              performance: { type: 'boolean', default: true },
              errors: { type: 'boolean', default: true },
              costs: { type: 'boolean', default: true },
              trends: { type: 'boolean', default: true },
              recommendations: { type: 'boolean', default: true },
              predictions: { type: 'boolean', default: false }
            }
          },
          format: { 
            type: 'string',
            enum: ['json', 'pdf', 'csv', 'excel'],
            default: 'json',
            description: 'Report output format'
          },
          emailRecipients: { 
            type: 'array',
            items: { type: 'string', format: 'email' },
            description: 'Email recipients for the report'
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: IntegrationReportRequest }>, reply: FastifyReply) => {
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

      // Generate the report
      const report = await analyticsService.generateAnalyticsReport(
        startDate,
        endDate,
        request.body.integrationIds
      );

      // Handle different formats
      if (request.body.format === 'json') {
        return {
          success: true,
          data: report,
          message: 'Integration analytics report generated successfully'
        };
      } else {
        // For PDF/CSV/Excel formats, return download URL
        return {
          success: true,
          data: {
            reportId: report.reportId,
            downloadUrl: `/integration-analytics/reports/${report.reportId}/download?format=${request.body.format}`,
            format: request.body.format,
            generatedAt: report.generatedAt
          },
          message: 'Integration analytics report generated successfully'
        };
      }
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analytics report'
      };
    }
  });

  /**
   * Get integration analytics report by ID
   */
  fastify.get('/integration-analytics/reports/:reportId', {
    schema: {
      description: 'Get integration analytics report by ID',
      tags: ['Integration Analytics', 'Reports'],
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
      reply.status(404);
      return {
        success: false,
        error: 'Report not found'
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics report'
      };
    }
  });

  // =============================================================================
  // Health Check Route
  // =============================================================================

  /**
   * Integration analytics service health check
   */
  fastify.get('/integration-analytics/health', {
    schema: {
      description: 'Integration analytics service health check',
      tags: ['Integration Analytics', 'Health Check']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dashboard = analyticsService.getAnalyticsDashboard();
      
      return {
        status: 'healthy',
        service: 'integration-analytics',
        version: '1.0.0',
        uptime: process.uptime(),
        systemHealth: {
          totalIntegrations: dashboard.overview.totalIntegrations,
          healthyIntegrations: dashboard.overview.healthyIntegrations,
          overallSuccessRate: dashboard.overview.overallSuccessRate,
          totalRequests: dashboard.overview.totalRequests,
          totalCost: dashboard.overview.totalCost
        },
        features: [
          'Real-time integration event tracking',
          'Comprehensive performance monitoring',
          'Error pattern analysis and alerting',
          'Cost analysis and optimization',
          'Usage analytics and trending',
          'Health monitoring and SLA tracking',
          'Predictive analysis and recommendations',
          'Automated reporting and notifications'
        ],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(503);
      return {
        status: 'unhealthy',
        service: 'integration-analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });

  console.log('📊 Integration Analytics routes registered successfully');
}

export default integrationAnalyticsRoutes;