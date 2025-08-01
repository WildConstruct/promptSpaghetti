/**
 * Security Intelligence Dashboard API Routes
 * Epic 31.4.1.3 - Create security intelligence dashboard and analysis
 * 
 * Provides REST API endpoints for security intelligence dashboard management,
 * analytics retrieval, and real-time data access.
 */

import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityIntelligenceDashboard,
  SecurityIntelligenceDashboardConfig,
  DashboardWidget,
  DashboardFilter
 from '../services/SecurityIntelligenceDashboard';
import { SecurityIntelligenceDataPipeline } from '../services/SecurityIntelligenceDataPipeline';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../database/analytics-dao';
import { PerformanceMonitoringService } from '../analytics/PerformanceMonitoringService';
import { DiagnosticService } from '../admin/DiagnosticService';
import { HealthCheckFramework } from '../admin/HealthCheckFramework';

// Request/Response Type Definitions



interface CreateDashboardRequest {
  Body: {
    name: string;
    widgets: DashboardWidget[];
    user_id?: string;



  };




interface UpdateDashboardRequest {
  Params: {
    dashboardId: string;



  };
  Body: {
    widgets: DashboardWidget[];
  };




interface GetDashboardRequest {
  Params: {
    dashboardId: string;



  };




interface DeleteDashboardRequest {
  Params: {
    dashboardId: string;



  };




interface GetWidgetDataRequest {
  Params: {
    dashboardId: string;
    widgetId: string;



  };
  Querystring: {
    refresh?: boolean;
    filters?: string; // JSON string of DashboardFilter[]
  };




interface GetSecurityAnalyticsRequest {
  Querystring: {
    start_time?: string;
    end_time?: string;
    include_predictions?: boolean;



  };




interface ExportDashboardRequest {
  Params: {
    dashboardId: string;



  };
  Querystring: {
    format?: 'json' | 'csv' | 'pdf';
  };


// Global dashboard instance
let dashboardInstance: SecurityIntelligenceDashboard | null = null;

const securityIntelligenceDashboardRoutes: FastifyPluginAsync = async (fastify) => {
  // Initialize dashboard instance if not already created
  if (!dashboardInstance) {
    // Configuration for the dashboard
    const dashboardConfig: SecurityIntelligenceDashboardConfig = {
      dashboard: {
        enabled: true,
        refresh_interval_ms: 30000,
        max_dashboard_widgets: 50,
        real_time_updates: true,
        historical_data_retention_days: 365,
        cache_ttl_seconds: 300,
        max_concurrent_dashboards: 1000

      analytics: {
        enabled: true,
        aggregation_intervals: [300, 3600, 86400, 604800],
        trend_analysis_enabled: true,
        anomaly_detection_enabled: true,
        predictive_analytics_enabled: true,
        correlation_analysis_enabled: true,
        risk_scoring_enabled: true

      visualization: {
        enabled: true,
        chart_types: ['line', 'bar', 'pie', 'scatter', 'heatmap', 'geo', 'network', 'sankey', 'treemap', 'radar'],
        color_schemes: ['default', 'dark', 'high_contrast', 'security_focused'],
        interactive_features: true,
        export_formats: ['png', 'pdf', 'svg', 'csv', 'json', 'excel'],
        real_time_charts: true,
        geo_mapping_enabled: true

      alerts: {
        enabled: true,
        threshold_based_alerts: true,
        anomaly_based_alerts: true,
        predictive_alerts: true,
        alert_channels: ['email', 'slack', 'webhook', 'sms'],
        escalation_rules: true,
        auto_acknowledgment: false

      performance: {
        query_timeout_ms: 30000,
        max_data_points: 50000,
        pagination_size: 1000,
        cache_optimization: true,
        lazy_loading: true,
        compression_enabled: true

      epic_integration: {
        epic1_analytics_enabled: true,
        epic17_admin_enabled: true,
        cross_epic_dashboards: true,
        unified_navigation: true,
        shared_authentication: true

    };

    // Mock dependencies for demonstration - in production, these would be injected
    const mockDataPipeline = {} as SecurityIntelligenceDataPipeline;
    const mockAnalyticsCollector = {} as AnalyticsCollector;
    const mockAnalyticsDAO = {} as AnalyticsDAO;
    const mockPerformanceMonitoringService = {} as PerformanceMonitoringService;
    const mockDiagnosticService = {} as DiagnosticService;
    const mockHealthCheckFramework = {} as HealthCheckFramework;

    dashboardInstance = new SecurityIntelligenceDashboard(
      dashboardConfig,
      mockDataPipeline,
      mockAnalyticsCollector,
      mockAnalyticsDAO,
      mockPerformanceMonitoringService,
      mockDiagnosticService,
      mockHealthCheckFramework
    );

    // Initialize the dashboard
    try {
      await dashboardInstance.initialize();
      fastify.log.info('Security Intelligence Dashboard initialized successfully');
 catch (error) {
      fastify.log.error('Failed to initialize Security Intelligence Dashboard:', error);
      throw error;



  // Authentication and authorization middleware
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip authentication for health check endpoints
    if (request.url.includes('/health') || request.url.includes('/status')) {
      return;


    // In production, implement proper authentication/authorization
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Authentication required' });
      return;


    // Mock user context - in production, decode JWT token
    (request as any).user = {
      id: 'user_123',
      roles: ['security_analyst', 'dashboard_user'],
      permissions: ['dashboard:read', 'dashboard:write', 'analytics:read']
    };
  });

  // Rate limiting middleware
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Implement rate limiting logic here
    // For demonstration, we'll allow all requests
  });

  /**
   * Create new security intelligence dashboard
   * POST /api/security-intelligence/dashboards
   */
  fastify.post<CreateDashboardRequest>('/dashboards', {
    schema: {
      description: 'Create a new security intelligence dashboard',
      tags: ['Security Intelligence Dashboard'],
      body: {
        type: 'object',
        required: ['name', 'widgets'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          widgets: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'type', 'title', 'position', 'size'],
              properties: {
                id: { type: 'string' },
                type: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                position: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    z_index: { type: 'number' }


                size: {
                  type: 'object',
                  properties: {
                    width: { type: 'number' },
                    height: { type: 'number' }





          user_id: { type: 'string' }


      response: {
        201: {
          type: 'object',
          properties: {
            dashboard_id: { type: 'string' },
            message: { type: 'string' }


        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }




  }, async (request, reply) => {
    try {
      const { name, widgets, user_id } = request.body;
      const userId = user_id || (request as any).user.id;

      const dashboardId = await dashboardInstance!.createDashboard(userId, name, widgets);

      reply.code(201).send({
        dashboard_id: dashboardId,
        message: 'Dashboard created successfully'
      });
 catch (error) {
      fastify.log.error('Error creating dashboard:', error);
      reply.code(400).send({ error: (error as Error).message });

  });

  /**
   * Get security intelligence dashboard
   * GET /api/security-intelligence/dashboards/:dashboardId
   */
  fastify.get<GetDashboardRequest>('/dashboards/:dashboardId', {
    schema: {
      description: 'Get a security intelligence dashboard by ID',
      tags: ['Security Intelligence Dashboard'],
      params: {
        type: 'object',
        properties: {
          dashboardId: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            dashboard_id: { type: 'string' },
            widgets: { type: 'array' }


        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }




  }, async (request, reply) => {
    try {
      const { dashboardId } = request.params;
      const widgets = await dashboardInstance!.getDashboard(dashboardId);

      reply.send({
        dashboard_id: dashboardId,
        widgets
      });
 catch (error) {
      fastify.log.error('Error retrieving dashboard:', error);
      reply.code(404).send({ error: (error as Error).message });

  });

  /**
   * Update security intelligence dashboard
   * PUT /api/security-intelligence/dashboards/:dashboardId
   */
  fastify.put<UpdateDashboardRequest>('/dashboards/:dashboardId', {
    schema: {
      description: 'Update a security intelligence dashboard',
      tags: ['Security Intelligence Dashboard'],
      params: {
        type: 'object',
        properties: {
          dashboardId: { type: 'string' }


      body: {
        type: 'object',
        required: ['widgets'],
        properties: {
          widgets: { type: 'array' }


      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }


        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }




  }, async (request, reply) => {
    try {
      const { dashboardId } = request.params;
      const { widgets } = request.body;

      await dashboardInstance!.updateDashboard(dashboardId, widgets);

      reply.send({ message: 'Dashboard updated successfully' });
 catch (error) {
      fastify.log.error('Error updating dashboard:', error);
      reply.code(400).send({ error: (error as Error).message });

  });

  /**
   * Delete security intelligence dashboard
   * DELETE /api/security-intelligence/dashboards/:dashboardId
   */
  fastify.delete<DeleteDashboardRequest>('/dashboards/:dashboardId', {
    schema: {
      description: 'Delete a security intelligence dashboard',
      tags: ['Security Intelligence Dashboard'],
      params: {
        type: 'object',
        properties: {
          dashboardId: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }


        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }




  }, async (request, reply) => {
    try {
      const { dashboardId } = request.params;
      await dashboardInstance!.deleteDashboard(dashboardId);

      reply.send({ message: 'Dashboard deleted successfully' });
 catch (error) {
      fastify.log.error('Error deleting dashboard:', error);
      reply.code(404).send({ error: (error as Error).message });

  });

  /**
   * Get widget data for dashboard
   * GET /api/security-intelligence/dashboards/:dashboardId/widgets/:widgetId/data
   */
  fastify.get<GetWidgetDataRequest>('/dashboards/:dashboardId/widgets/:widgetId/data', {
    schema: {
      description: 'Get data for a specific dashboard widget',
      tags: ['Security Intelligence Dashboard'],
      params: {
        type: 'object',
        properties: {
          dashboardId: { type: 'string' },
          widgetId: { type: 'string' }


      querystring: {
        type: 'object',
        properties: {
          refresh: { type: 'boolean' },
          filters: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            widget_id: { type: 'string' },
            data: {},
            timestamp: { type: 'number' },
            cached: { type: 'boolean' }


        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }




  }, async (request, reply) => {
    try {
      const { dashboardId, widgetId } = request.params;
      const { refresh, filters: filtersStr } = request.query;

      // Get dashboard and find widget
      const widgets = await dashboardInstance!.getDashboard(dashboardId);
      const widget = widgets.find(w => w.id === widgetId);

      if (!widget) {
        reply.code(404).send({ error: 'Widget not found' });
        return;


      // Parse filters if provided
      let filters: DashboardFilter[] = [];
      if (filtersStr) {
        try {
          filters = JSON.parse(filtersStr);
 catch (error) {
          reply.code(400).send({ error: 'Invalid filters format' });
          return;



      // Get widget data
      const data = await dashboardInstance!.getWidgetData(widgetId, widget, filters);

      reply.send({
        widget_id: widgetId,
        data,
        timestamp: Date.now(),
        cached: !refresh
      });
 catch (error) {
      fastify.log.error('Error retrieving widget data:', error);
      reply.code(500).send({ error: (error as Error).message });

  });

  /**
   * Get comprehensive security analytics
   * GET /api/security-intelligence/analytics
   */
  fastify.get<GetSecurityAnalyticsRequest>('/analytics', {
    schema: {
      description: 'Get comprehensive security analytics data',
      tags: ['Security Intelligence Dashboard'],
      querystring: {
        type: 'object',
        properties: {
          start_time: { type: 'string', format: 'date-time' },
          end_time: { type: 'string', format: 'date-time' },
          include_predictions: { type: 'boolean' }


      response: {
        200: {
          type: 'object',
          properties: {
            threat_metrics: { type: 'object' },
            security_metrics: { type: 'object' },
            performance_metrics: { type: 'object' },
            compliance_metrics: { type: 'object' },
            risk_metrics: { type: 'object' },
            operational_metrics: { type: 'object' },
            timestamp: { type: 'number' }




  }, async (request, reply) => {
    try {
      const { start_time, end_time, include_predictions } = request.query;

      // Parse time range
      const timeRange = {
        start: start_time ? new Date(start_time).getTime() : Date.now() - 86400000, // Default: last 24 hours
        end: end_time ? new Date(end_time).getTime() : Date.now()
      };

      const analytics = await dashboardInstance!.getSecurityAnalytics(timeRange);

      reply.send({
        ...analytics,
        timestamp: Date.now()
      });
 catch (error) {
      fastify.log.error('Error retrieving security analytics:', error);
      reply.code(500).send({ error: (error as Error).message });

  });

  /**
   * Get dashboard metrics
   * GET /api/security-intelligence/metrics
   */
  fastify.get('/metrics', {
    schema: {
      description: 'Get dashboard performance and usage metrics',
      tags: ['Security Intelligence Dashboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            active_dashboards: { type: 'number' },
            total_widgets: { type: 'number' },
            query_performance: { type: 'object' },
            user_engagement: { type: 'object' },
            system_resource_usage: { type: 'object' },
            timestamp: { type: 'number' }




  }, async (request, reply) => {
    try {
      const metrics = await dashboardInstance!.getDashboardMetrics();

      reply.send({
        ...metrics,
        timestamp: Date.now()
      });
 catch (error) {
      fastify.log.error('Error retrieving dashboard metrics:', error);
      reply.code(500).send({ error: (error as Error).message });

  });

  /**
   * Export dashboard
   * GET /api/security-intelligence/dashboards/:dashboardId/export
   */
  fastify.get<ExportDashboardRequest>('/dashboards/:dashboardId/export', {
    schema: {
      description: 'Export dashboard data in specified format',
      tags: ['Security Intelligence Dashboard'],
      params: {
        type: 'object',
        properties: {
          dashboardId: { type: 'string' }


      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'csv', 'pdf'] }



  }, async (request, reply) => {
    try {
      const { dashboardId } = request.params;
      const { format = 'json' } = request.query;

      const exportData = await dashboardInstance!.exportDashboard(dashboardId, format);

      // Set appropriate content type and headers
      const contentTypes = {
        json: 'application/json',
        csv: 'text/csv',
        pdf: 'application/pdf'
      };

      const filename = `security-dashboard-${dashboardId}-${Date.now()}.${format}`;

      reply
        .header('Content-Type', contentTypes[format])
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .send(exportData);
 catch (error) {
      fastify.log.error('Error exporting dashboard:', error);
      reply.code(500).send({ error: (error as Error).message });

  });

  /**
   * Get dashboard health status
   * GET /api/security-intelligence/health
   */
  fastify.get('/health', {
    schema: {
      description: 'Get dashboard health status',
      tags: ['Security Intelligence Dashboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            health: { type: 'object' },
            timestamp: { type: 'number' }




  }, async (request, reply) => {
    try {
      const health = await dashboardInstance!.getHealthStatus();

      reply.send({
        status: 'healthy',
        health,
        timestamp: Date.now()
      });
 catch (error) {
      fastify.log.error('Error retrieving health status:', error);
      reply.code(500).send({
        status: 'unhealthy',
        error: (error as Error).message,
        timestamp: Date.now()
      });

  });

  /**
   * Get dashboard status
   * GET /api/security-intelligence/status
   */
  fastify.get('/status', {
    schema: {
      description: 'Get dashboard operational status',
      tags: ['Security Intelligence Dashboard'],
      response: {
        200: {
          type: 'object',
          properties: {
            initialized: { type: 'boolean' },
            dashboard_count: { type: 'number' },
            cache_size: { type: 'number' },
            configuration: { type: 'object' },
            timestamp: { type: 'number' }




  }, async (request, reply) => {
    try {
      const status = dashboardInstance!.getStatus();

      reply.send({
        ...status,
        timestamp: Date.now()
      });
 catch (error) {
      fastify.log.error('Error retrieving status:', error);
      reply.code(500).send({ error: (error as Error).message });

  });

  /**
   * WebSocket endpoint for real-time dashboard updates
   * WS /api/security-intelligence/realtime
   */
  fastify.register(async function (fastify) {
    fastify.get('/realtime', { websocket: true }, (connection, request) => {
      fastify.log.info('WebSocket connection established for real-time dashboard updates');

      // Subscribe to real-time events from dashboard
      const handleSecurityEvent = (eventData: any) => {
        connection.socket.send(JSON.stringify({
          type: 'security_event',
          data: eventData,
          timestamp: Date.now()
        }));
      };

      const handleThreatIntelligenceUpdate = (intelligence: any) => {
        connection.socket.send(JSON.stringify({
          type: 'threat_intelligence_update',
          data: intelligence,
          timestamp: Date.now()
        }));
      };

      const handleDashboardMetrics = (metrics: any) => {
        connection.socket.send(JSON.stringify({
          type: 'dashboard_metrics',
          data: metrics,
          timestamp: Date.now()
        }));
      };

      // Register event listeners
      dashboardInstance!.on('real_time_security_event', handleSecurityEvent);
      dashboardInstance!.on('threat_intelligence_update', handleThreatIntelligenceUpdate);
      dashboardInstance!.on('dashboard_metrics_collected', handleDashboardMetrics);

      // Handle WebSocket messages
      connection.socket.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          switch (data.type) {
            case 'subscribe':
              // Handle subscription to specific dashboard updates
              fastify.log.info(`Client subscribed to dashboard: ${data.dashboard_id}`);
              break;
            case 'unsubscribe':
              // Handle unsubscription
              fastify.log.info(`Client unsubscribed from dashboard: ${data.dashboard_id}`);
              break;
            case 'ping':
              // Handle ping for connection keepalive
              connection.socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
              break;
            default:
              fastify.log.warn(`Unknown WebSocket message type: ${data.type}`);

 catch (error) {
          fastify.log.error('Error processing WebSocket message:', error);

      });

      // Handle connection close
      connection.socket.on('close', () => {
        fastify.log.info('WebSocket connection closed');
        
        // Remove event listeners
        dashboardInstance!.off('real_time_security_event', handleSecurityEvent);
        dashboardInstance!.off('threat_intelligence_update', handleThreatIntelligenceUpdate);
        dashboardInstance!.off('dashboard_metrics_collected', handleDashboardMetrics);
      });

      // Send initial connection confirmation
      connection.socket.send(JSON.stringify({
        type: 'connection_established',
        message: 'Real-time dashboard updates active',
        timestamp: Date.now()
      }));
    });
  });

  // Error handling
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);

    if (error.validation) {
      reply.code(400).send({
        error: 'Validation error',
        details: error.validation
      });
      return;


    reply.code(500).send({
      error: 'Internal server error',
      message: error.message
    });
  });

  fastify.log.info('Security Intelligence Dashboard API routes registered');
};

export default securityIntelligenceDashboardRoutes;