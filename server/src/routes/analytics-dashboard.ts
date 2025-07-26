/**
 * Analytics Dashboard API Routes - Story 1.5 Task 4
 * 
 * Provides API endpoints for the consolidated real-time analytics dashboard
 * integrating all 12+ analytics systems through the unified event bus.
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UnifiedEventBus } from '../analytics/UnifiedEventBus';
import { EventRepository } from '../analytics/EventPersistenceLayer';
import { AnalyticsAuthorizationService } from '../analytics/AnalyticsAuthorization';
import { WebSocketStreamingServer } from '../analytics/WebSocketStreaming';

// Dashboard Configuration Schema
const DashboardConfigSchema = z.object({
  timeRange: z.number().min(1).max(168).default(24), // hours
  refreshInterval: z.number().min(1000).max(300000).default(5000), // milliseconds
  maxEvents: z.number().min(10).max(1000).default(100),
  enableRealTime: z.boolean().default(true),
  widgetFilters: z.record(z.unknown()).optional()
});

// Dashboard Query Schema
const DashboardQuerySchema = z.object({
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  sources: z.array(z.string()).optional(),
  types: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  severities: z.array(z.string()).optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional()
});

// Widget Configuration Schema
const WidgetConfigSchema = z.object({
  id: z.string(),
  type: z.enum([
    'event_stream', 'metrics_summary', 'time_series_chart', 'heat_map',
    'top_sources', 'error_rate', 'performance_metrics', 'user_activity',
    'system_health', 'cost_tracking', 'integration_status', 'security_events'
  ]),
  title: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(), 
    width: z.number(),
    height: z.number()
  }),
  filter: DashboardQuerySchema.optional(),
  refreshRate: z.number().min(1000).max(60000).optional(),
  chartType: z.enum(['line', 'bar', 'pie', 'area']).optional(),
  aggregation: z.enum(['count', 'sum', 'avg', 'max', 'min']).optional(),
  timeGranularity: z.enum(['minute', 'hour', 'day']).optional(),
  enabled: z.boolean().default(true),
  collapsed: z.boolean().default(false)
});

/**
 * Analytics Dashboard API Routes
 */
export async function analyticsDashboardRoutes(fastify: FastifyInstance) {
  const eventBus = fastify.eventBus as UnifiedEventBus;
  const eventRepository = fastify.eventRepository as EventRepository;
  const authService = fastify.authService as AnalyticsAuthorizationService;
  const wsServer = fastify.wsServer as WebSocketStreamingServer;

  /**
   * Get dashboard configuration
   */
  fastify.get('/dashboard/config', {
    schema: {
      description: 'Get dashboard configuration and available widgets',
      tags: ['analytics', 'dashboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            config: { type: 'object' },
            availableWidgets: { type: 'array' },
            systemSources: { type: 'array' },
            eventTypes: { type: 'array' },
            userPermissions: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);
      
      // Check dashboard access authorization
      const dashboardAuth = await authService.authorizeDashboardAccess('user', authContext);
      if (!dashboardAuth.allowed) {
        return reply.code(403).send({ 
          error: 'Dashboard access denied',
          reason: dashboardAuth.reason 
        });
      }

      // Get user authorization capabilities
      const authSummary = authService.getAuthorizationSummary(authContext);

      // Get system sources and event types
      const statistics = await eventRepository.getStatistics({});
      const systemSources = Object.keys(statistics.eventsBySource);
      const eventTypes = Object.keys(statistics.eventsByType);

      // Default dashboard configuration
      const config = {
        timeRange: 24,
        refreshInterval: 5000,
        maxEvents: 100,
        enableRealTime: true,
        theme: 'light',
        widgetLayout: 'grid'
      };

      // Available widget types based on user permissions
      const availableWidgets = [];
      
      if (authSummary.capabilities.canViewEvents) {
        availableWidgets.push(
          { type: 'event_stream', name: 'Event Stream', category: 'monitoring' },
          { type: 'security_events', name: 'Security Events', category: 'security' }
        );
      }

      if (authSummary.capabilities.canViewAnalytics) {
        availableWidgets.push(
          { type: 'metrics_summary', name: 'Metrics Summary', category: 'analytics' },
          { type: 'time_series_chart', name: 'Time Series Chart', category: 'analytics' },
          { type: 'top_sources', name: 'Top Sources', category: 'analytics' },
          { type: 'error_rate', name: 'Error Rate', category: 'monitoring' },
          { type: 'performance_metrics', name: 'Performance Metrics', category: 'performance' },
          { type: 'user_activity', name: 'User Activity', category: 'business' },
          { type: 'integration_status', name: 'Integration Status', category: 'integration' }
        );
      }

      if (authSummary.capabilities.canViewAdminDashboard) {
        availableWidgets.push(
          { type: 'system_health', name: 'System Health', category: 'admin' },
          { type: 'cost_tracking', name: 'Cost Tracking', category: 'admin' }
        );
      }

      return reply.send({
        config,
        availableWidgets,
        systemSources,
        eventTypes,
        userPermissions: authSummary.capabilities
      });

    } catch (error) {
      console.error('Dashboard config error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get dashboard configuration',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get dashboard data
   */
  fastify.post('/dashboard/data', {
    schema: {
      description: 'Get consolidated dashboard data from all analytics systems',
      tags: ['analytics', 'dashboard'],
      body: {
        type: 'object',
        properties: {
          config: DashboardConfigSchema,
          query: DashboardQuerySchema.optional()
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            metrics: { type: 'object' },
            events: { type: 'array' },
            timeSeriesData: { type: 'object' },
            statistics: { type: 'object' },
            lastUpdate: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { config, query } = request.body as {
        config: z.infer<typeof DashboardConfigSchema>;
        query?: z.infer<typeof DashboardQuerySchema>;
      };

      const authContext = await authService.createAuthContextFromRequest(request);

      // Check dashboard access authorization
      const dashboardAuth = await authService.authorizeDashboardAccess('user', authContext);
      if (!dashboardAuth.allowed) {
        return reply.code(403).send({ 
          error: 'Dashboard access denied',
          reason: dashboardAuth.reason 
        });
      }

      // Build query filter
      const now = Date.now();
      const timeRange = config.timeRange * 60 * 60 * 1000; // Convert hours to milliseconds
      const filter = {
        startTime: query?.startTime || (now - timeRange),
        endTime: query?.endTime || now,
        sources: query?.sources,
        types: query?.types,
        categories: query?.categories,
        severities: query?.severities,
        userId: query?.userId,
        organizationId: query?.organizationId
      };

      // Authorize query filter
      const queryAuth = await authService.authorizeAnalyticsQuery(filter, authContext);
      if (!queryAuth.allowed) {
        return reply.code(403).send({ 
          error: 'Query access denied',
          reason: queryAuth.reason 
        });
      }

      const authorizedFilter = queryAuth.filteredQuery!;

      // Get dashboard data
      const [events, statistics] = await Promise.all([
        eventRepository.findMany({
          filter: authorizedFilter,
          limit: config.maxEvents,
          sortBy: 'timestamp',
          sortOrder: 'desc'
        }),
        eventRepository.getStatistics(authorizedFilter)
      ]);

      // Calculate dashboard metrics
      const eventsPerSecond = statistics.totalEvents / (timeRange / 1000);
      const errorEvents = events.filter(e => e.severity === 'error' || e.severity === 'critical');
      const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;
      
      const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean)).size;
      const uniqueSessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;

      // Calculate top sources
      const sourceCounts = statistics.eventsBySource;
      const totalSourceEvents = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
      const topSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source,
          count,
          percentage: totalSourceEvents > 0 ? (count / totalSourceEvents) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate integration status
      const integrationEvents = events.filter(e => e.category === 'integration');
      const integrationStatus: { [key: string]: 'healthy' | 'degraded' | 'failing' } = {};
      
      const integrationSources = new Set(integrationEvents.map(e => e.source));
      integrationSources.forEach(source => {
        const sourceEvents = integrationEvents.filter(e => e.source === source);
        const errorCount = sourceEvents.filter(e => e.severity === 'error' || e.severity === 'critical').length;
        const sourceErrorRate = sourceEvents.length > 0 ? (errorCount / sourceEvents.length) * 100 : 0;
        
        if (sourceErrorRate < 1) integrationStatus[source] = 'healthy';
        else if (sourceErrorRate < 10) integrationStatus[source] = 'degraded';
        else integrationStatus[source] = 'failing';
      });

      // Calculate system health score
      const systemHealth = Math.max(0, 100 - errorRate - (eventsPerSecond > 1000 ? 10 : 0));

      // Get time series data
      const timeSeriesData = await eventRepository.getTimeSeriesData(
        'count',
        'hour',
        authorizedFilter
      );

      const dashboardMetrics = {
        totalEvents: statistics.totalEvents,
        eventsPerSecond: Math.round(eventsPerSecond * 100) / 100,
        activeUsers: uniqueUsers,
        activeSessions: uniqueSessions,
        errorRate: Math.round(errorRate * 100) / 100,
        systemHealth: Math.round(systemHealth),
        integrationStatus,
        topSources
      };

      return reply.send({
        metrics: dashboardMetrics,
        events: events,
        timeSeriesData: timeSeriesData.map(point => ({
          timestamp: point.timestamp,
          value: point.value,
          label: 'Events'
        })),
        statistics,
        lastUpdate: now
      });

    } catch (error) {
      console.error('Dashboard data error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get dashboard data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get widget-specific data
   */
  fastify.post('/dashboard/widget/:widgetId/data', {
    schema: {
      description: 'Get data for a specific dashboard widget',
      tags: ['analytics', 'dashboard', 'widgets'],
      params: {
        type: 'object',
        properties: {
          widgetId: { type: 'string' }
        },
        required: ['widgetId']
      },
      body: {
        type: 'object',
        properties: {
          widgetConfig: WidgetConfigSchema,
          query: DashboardQuerySchema.optional()
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { widgetId } = request.params as { widgetId: string };
      const { widgetConfig, query } = request.body as {
        widgetConfig: z.infer<typeof WidgetConfigSchema>;
        query?: z.infer<typeof DashboardQuerySchema>;
      };

      const authContext = await authService.createAuthContextFromRequest(request);

      // Build widget-specific filter
      const filter = {
        ...query,
        ...widgetConfig.filter
      };

      // Authorize query filter
      const queryAuth = await authService.authorizeAnalyticsQuery(filter, authContext);
      if (!queryAuth.allowed) {
        return reply.code(403).send({ 
          error: 'Widget data access denied',
          reason: queryAuth.reason 
        });
      }

      const authorizedFilter = queryAuth.filteredQuery!;

      // Get widget-specific data based on widget type
      let widgetData: Record<string, unknown> = {};
      
      switch (widgetConfig.type) {
        case 'event_stream':
          const events = await eventRepository.findMany({
            filter: authorizedFilter,
            limit: 50,
            sortBy: 'timestamp',
            sortOrder: 'desc'
          });
          widgetData = { events };
          break;

        case 'time_series_chart':
        case 'performance_metrics':
        case 'error_rate':
          const timeSeriesData = await eventRepository.getTimeSeriesData(
            widgetConfig.aggregation || 'count',
            widgetConfig.timeGranularity || 'hour',
            authorizedFilter
          );
          widgetData = { 
            timeSeries: timeSeriesData.map(point => ({
              timestamp: point.timestamp,
              value: point.value,
              label: widgetConfig.title
            }))
          };
          break;

        case 'metrics_summary':
          const statistics = await eventRepository.getStatistics(authorizedFilter);
          const summaryEvents = await eventRepository.findMany({
            filter: authorizedFilter,
            limit: 1000
          });
          
          const errorEvents = summaryEvents.filter(e => e.severity === 'error' || e.severity === 'critical');
          const errorRate = summaryEvents.length > 0 ? (errorEvents.length / summaryEvents.length) * 100 : 0;
          const uniqueUsers = new Set(summaryEvents.map(e => e.userId).filter(Boolean)).size;
          const uniqueSessions = new Set(summaryEvents.map(e => e.sessionId).filter(Boolean)).size;
          
          widgetData = {
            totalEvents: statistics.totalEvents,
            errorRate: Math.round(errorRate * 100) / 100,
            activeUsers: uniqueUsers,
            activeSessions: uniqueSessions,
            eventsPerSecond: statistics.totalEvents / ((filter.endTime || Date.now()) - (filter.startTime || Date.now() - 86400000)) * 1000
          };
          break;

        case 'top_sources':
          const sourceStats = await eventRepository.getStatistics(authorizedFilter);
          const sourceCounts = sourceStats.eventsBySource;
          const totalEvents = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
          
          widgetData = {
            sources: Object.entries(sourceCounts)
              .map(([source, count]) => ({
                source,
                count,
                percentage: totalEvents > 0 ? (count / totalEvents) * 100 : 0
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
          };
          break;

        case 'integration_status':
          const integrationEvents = await eventRepository.findMany({
            filter: { ...authorizedFilter, categories: ['integration'] },
            limit: 1000
          });
          
          const integrationStatus: { [key: string]: 'healthy' | 'degraded' | 'failing' } = {};
          const integrationSources = new Set(integrationEvents.map(e => e.source));
          
          integrationSources.forEach(source => {
            const sourceEvents = integrationEvents.filter(e => e.source === source);
            const errorCount = sourceEvents.filter(e => e.severity === 'error' || e.severity === 'critical').length;
            const sourceErrorRate = sourceEvents.length > 0 ? (errorCount / sourceEvents.length) * 100 : 0;
            
            if (sourceErrorRate < 1) integrationStatus[source] = 'healthy';
            else if (sourceErrorRate < 10) integrationStatus[source] = 'degraded';
            else integrationStatus[source] = 'failing';
          });
          
          widgetData = { integrationStatus };
          break;

        case 'system_health':
          const healthStats = await eventRepository.getStatistics(authorizedFilter);
          const healthEvents = await eventRepository.findMany({
            filter: authorizedFilter,
            limit: 1000
          });
          
          const healthErrorEvents = healthEvents.filter(e => e.severity === 'error' || e.severity === 'critical');
          const healthErrorRate = healthEvents.length > 0 ? (healthErrorEvents.length / healthEvents.length) * 100 : 0;
          const systemHealthScore = Math.max(0, 100 - healthErrorRate);
          
          widgetData = { 
            systemHealth: Math.round(systemHealthScore),
            errorRate: Math.round(healthErrorRate * 100) / 100,
            totalEvents: healthStats.totalEvents
          };
          break;

        case 'user_activity':
          const activityEvents = await eventRepository.findMany({
            filter: { ...authorizedFilter, categories: ['user'] },
            limit: 1000
          });
          
          const activeUsers = new Set(activityEvents.map(e => e.userId).filter(Boolean)).size;
          const activeSessions = new Set(activityEvents.map(e => e.sessionId).filter(Boolean)).size;
          
          widgetData = { 
            activeUsers,
            activeSessions,
            sessionsPerUser: activeUsers > 0 ? activeSessions / activeUsers : 0
          };
          break;

        case 'security_events':
          const securityEvents = await eventRepository.findMany({
            filter: { 
              ...authorizedFilter, 
              categories: ['security'],
              types: ['SECURITY_EVENT', 'FRAUD_DETECTION']
            },
            limit: 20,
            sortBy: 'timestamp',
            sortOrder: 'desc'
          });
          
          widgetData = { events: securityEvents };
          break;

        default:
          widgetData = { message: 'Widget type not implemented' };
      }

      return reply.send({
        widgetId,
        type: widgetConfig.type,
        data: widgetData,
        lastUpdate: Date.now()
      });

    } catch (error) {
      console.error('Widget data error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get widget data',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get real-time dashboard connection info
   */
  fastify.get('/dashboard/realtime/info', {
    schema: {
      description: 'Get real-time WebSocket connection information',
      tags: ['analytics', 'dashboard', 'websocket'],
      response: {
        200: {
          type: 'object',
          properties: {
            wsEndpoint: { type: 'string' },
            connectionStats: { type: 'object' },
            subscriptionOptions: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);

      // Check dashboard access authorization
      const dashboardAuth = await authService.authorizeDashboardAccess('user', authContext);
      if (!dashboardAuth.allowed) {
        return reply.code(403).send({ 
          error: 'Real-time dashboard access denied',
          reason: dashboardAuth.reason 
        });
      }

      // Get WebSocket server stats
      const connectionStats = wsServer.getStats();
      
      // Get user's authorized query capabilities
      const queryAuth = await authService.authorizeAnalyticsQuery({}, authContext);

      return reply.send({
        wsEndpoint: `ws://localhost:8080/analytics-stream`,
        connectionStats,
        subscriptionOptions: {
          maxSubscriptions: 10,
          batchSizes: [1, 5, 10, 25, 50, 100],
          timeoutOptions: [1000, 2000, 5000, 10000],
          availableFilters: queryAuth.allowed ? {
            types: true,
            categories: true,
            sources: true,
            severities: true,
            userId: queryAuth.filteredQuery?.userId ? false : true,
            organizationId: queryAuth.filteredQuery?.organizationId ? false : true
          } : {}
        }
      });

    } catch (error) {
      console.error('Real-time info error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get real-time connection info',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Save dashboard layout
   */
  fastify.post('/dashboard/layout', {
    schema: {
      description: 'Save dashboard widget layout configuration',
      tags: ['analytics', 'dashboard', 'layout'],
      body: {
        type: 'object',
        properties: {
          layoutId: { type: 'string' },
          name: { type: 'string' },
          widgets: {
            type: 'array',
            items: WidgetConfigSchema
          },
          config: DashboardConfigSchema
        },
        required: ['layoutId', 'name', 'widgets']
      }
    }
  }, async (request, reply) => {
    try {
      const { layoutId, name, widgets, config } = request.body as {
        layoutId: string;
        name: string;
        widgets: z.infer<typeof WidgetConfigSchema>[];
        config?: z.infer<typeof DashboardConfigSchema>;
      };

      const authContext = await authService.createAuthContextFromRequest(request);

      // Check dashboard access authorization
      const dashboardAuth = await authService.authorizeDashboardAccess('user', authContext);
      if (!dashboardAuth.allowed) {
        return reply.code(403).send({ 
          error: 'Dashboard layout save access denied',
          reason: dashboardAuth.reason 
        });
      }

      // Validate widget configurations
      const validatedWidgets = widgets.map(widget => WidgetConfigSchema.parse(widget));

      // In production, this would save to persistent storage
      console.log(`Saving dashboard layout ${layoutId} for user ${authContext.userId}:`, {
        name,
        widgetCount: validatedWidgets.length,
        config
      });

      return reply.send({
        layoutId,
        saved: true,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Dashboard layout save error:', error);
      return reply.code(500).send({ 
        error: 'Failed to save dashboard layout',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get saved dashboard layouts
   */
  fastify.get('/dashboard/layouts', {
    schema: {
      description: 'Get saved dashboard layouts for the user',
      tags: ['analytics', 'dashboard', 'layout'],
      response: {
        200: {
          type: 'object',
          properties: {
            layouts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  layoutId: { type: 'string' },
                  name: { type: 'string' },
                  widgets: { type: 'array' },
                  config: { type: 'object' },
                  createdAt: { type: 'number' },
                  updatedAt: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const authContext = await authService.createAuthContextFromRequest(request);

      // Check dashboard access authorization
      const dashboardAuth = await authService.authorizeDashboardAccess('user', authContext);
      if (!dashboardAuth.allowed) {
        return reply.code(403).send({ 
          error: 'Dashboard layouts access denied',
          reason: dashboardAuth.reason 
        });
      }

      // In production, this would load from persistent storage
      const layouts = [
        {
          layoutId: 'default',
          name: 'Default Dashboard',
          widgets: [],
          config: {
            timeRange: 24,
            refreshInterval: 5000,
            maxEvents: 100,
            enableRealTime: true
          },
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 86400000
        }
      ];

      return reply.send({ layouts });

    } catch (error) {
      console.error('Dashboard layouts error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get dashboard layouts',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}

export default analyticsDashboardRoutes;