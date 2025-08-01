// Session Monitoring API Routes
// Real-time monitoring and analytics for user sessions

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SessionMonitoringService } from '../auth/services/SessionMonitoringService';
import { requireAuth } from '../auth/middleware/requireAuth';
import { requirePermission } from '../auth/middleware/requirePermission';



export interface SessionAnalyticsQuery {
  Querystring: {
    startDate?: string;
    endDate?: string;
    userId?: string;



  };




export interface AlertsQuery {
  Querystring: {
    userId?: string;
    type?: string;
    severity?: string;
    resolved?: string;
    limit?: string;
    offset?: string;



  };




export interface ResolveAlertBody {
  Body: {
    alertId: string;



  };




export interface UpdateRuleBody {
  Body: {
    ruleId: string;
    updates: {
      name?: string;
      enabled?: boolean;
      threshold?: number;
      parameters?: Record<string, any>;
      action?: 'alert' | 'block' | 'require_2fa' | 'notify_user';



    };
  };


export async function sessionMonitoringRoutes(
  server: FastifyInstance,
  sessionMonitoringService: SessionMonitoringService
): Promise<void> {

  // Get current session metrics
  server.get('/auth/sessions/metrics', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_monitoring', action: 'read' })
    ],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Try cached metrics first for performance
        let metrics = await sessionMonitoringService.getCachedMetrics();
        
        if (!metrics) {
          // Collect fresh metrics if cache miss
          metrics = await sessionMonitoringService.collectMetrics();


        return reply.send(metrics);
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve session metrics'
        });


  });

  // Get session analytics
  server.get('/auth/sessions/analytics', {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest<SessionAnalyticsQuery>, reply: FastifyReply) => {
      try {
        const user = request.user!;
        const { startDate, endDate, userId } = request.query;

        // Regular users can only see their own analytics
        const targetUserId = user.roles?.includes('admin') && userId ? userId : user.id;

        const timeRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate)
 : undefined;

        const analytics = await sessionMonitoringService.getSessionAnalytics(
          targetUserId,
          timeRange
        );

        return reply.send(analytics);
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve session analytics'
        });


  });

  // Get active alerts
  server.get('/auth/sessions/alerts', {
    preHandler: [requireAuth],
    handler: async (request: FastifyRequest<AlertsQuery>, reply: FastifyReply) => {
      try {
        const user = request.user!;
        const { userId, type, severity, resolved, limit = '50', offset = '0' } = request.query;

        // Regular users can only see their own alerts
        const filters: any = {};
        
        if (user.roles?.includes('admin')) {
          if (userId) filters.userId = userId;
 else {
          filters.userId = user.id;


        if (type) filters.type = type;
        if (severity) filters.severity = severity;
        if (resolved !== undefined) filters.resolved = resolved === 'true';

        const alerts = await sessionMonitoringService.getActiveAlerts(filters);

        // Apply pagination
        const startIndex = parseInt(offset);
        const endIndex = startIndex + parseInt(limit);
        const paginatedAlerts = alerts.slice(startIndex, endIndex);

        return reply.send({
          alerts: paginatedAlerts,
          pagination: {
            total: alerts.length,
            limit: parseInt(limit),
            offset: parseInt(offset)

        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve alerts'
        });


  });

  // Resolve an alert
  server.post('/auth/sessions/alerts/resolve', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_monitoring', action: 'resolve_alerts' })
    ],
    handler: async (request: FastifyRequest<ResolveAlertBody>, reply: FastifyReply) => {
      try {
        const { alertId } = request.body;
        const resolvedBy = request.user!.id;

        if (!alertId) {
          return reply.status(400).send({
            error: 'alertId is required'
          });


        await sessionMonitoringService.resolveAlert(alertId, resolvedBy);

        return reply.send({
          success: true,
          message: 'Alert resolved successfully'
        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to resolve alert'
        });


  });

  // Get monitoring rules
  server.get('/auth/sessions/monitoring-rules', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_monitoring', action: 'read_rules' })
    ],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const rules = await sessionMonitoringService.getMonitoringRules();
        return reply.send(rules);
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve monitoring rules'
        });


  });

  // Update monitoring rule
  server.put('/auth/sessions/monitoring-rules', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_monitoring', action: 'update_rules' })
    ],
    handler: async (request: FastifyRequest<UpdateRuleBody>, reply: FastifyReply) => {
      try {
        const { ruleId, updates } = request.body;

        if (!ruleId || !updates) {
          return reply.status(400).send({
            error: 'ruleId and updates are required'
          });


        await sessionMonitoringService.updateMonitoringRule(ruleId, updates);

        // Log the update
        await server.auditService.logEvent({
          userId: request.user!.id,
          action: 'monitoring_rule_updated',
          details: {
            ruleId,
            updates

          sessionId: request.sessionId,
          severity: 'info'
        });

        return reply.send({
          success: true,
          message: 'Monitoring rule updated successfully'
        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to update monitoring rule'
        });


  });

  // Start/stop monitoring (admin only)
  server.post('/auth/sessions/monitoring/:action', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_monitoring', action: 'control' })
    ],
    handler: async (request: FastifyRequest<{ Params: { action: string } }>, reply: FastifyReply) => {
      try {
        const { action } = request.params;

        if (action === 'start') {
          sessionMonitoringService.startMonitoring();
          
          await server.auditService.logEvent({
            userId: request.user!.id,
            action: 'session_monitoring_started',
            sessionId: request.sessionId,
            severity: 'info'
          });

          return reply.send({
            success: true,
            message: 'Session monitoring started'
          });
 else if (action === 'stop') {
          sessionMonitoringService.stopMonitoring();
          
          await server.auditService.logEvent({
            userId: request.user!.id,
            action: 'session_monitoring_stopped',
            sessionId: request.sessionId,
            severity: 'info'
          });

          return reply.send({
            success: true,
            message: 'Session monitoring stopped'
          });
 else {
          return reply.status(400).send({
            error: 'Invalid action. Use "start" or "stop"'
          });

 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to control monitoring'
        });


  });

  // Real-time session monitoring dashboard data
  server.get('/auth/sessions/dashboard', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_monitoring', action: 'read_dashboard' })
    ],
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get various dashboard metrics
        const [
          currentMetrics,
          recentAlerts,
          analytics
        ] = await Promise.all([
          sessionMonitoringService.collectMetrics(),
          sessionMonitoringService.getActiveAlerts({ 
            severity: 'high' // Only high and critical alerts for dashboard
          }),
          sessionMonitoringService.getSessionAnalytics()
        ]);

        // Get monitoring status from materialized view
        const dashboardResult = await server.db.query(`
          SELECT * FROM session_monitoring_dashboard
          ORDER BY hour DESC
          LIMIT 24
        `);

        return reply.send({
          currentMetrics,
          recentAlerts: recentAlerts.slice(0, 10), // Top 10 recent alerts
          hourlyTrends: dashboardResult.rows,
          analytics: {
            dailyPatterns: analytics.patterns,
            topMetrics: analytics.metrics

        });
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to retrieve dashboard data'
        });


  });

  // Export session data for compliance/audit
  server.get('/auth/sessions/export', {
    preHandler: [
      requireAuth,
      requirePermission({ resource: 'session_monitoring', action: 'export' })
    ],
    handler: async (request: FastifyRequest<SessionAnalyticsQuery>, reply: FastifyReply) => {
      try {
        const { startDate, endDate, userId } = request.query;

        if (!startDate || !endDate) {
          return reply.status(400).send({
            error: 'startDate and endDate are required'
          });


        const timeRange = {
          start: new Date(startDate),
          end: new Date(endDate)
        };

        // Generate comprehensive report
        const analytics = await sessionMonitoringService.getSessionAnalytics(userId, timeRange);
        
        // Get all alerts in the time range
        const alertsResult = await server.db.query(`
          SELECT * FROM session_alerts
          WHERE created_at BETWEEN $1 AND $2
          ${userId ? 'AND user_id = $3' : ''}
          ORDER BY created_at DESC
        `, userId ? [timeRange.start, timeRange.end, userId] : [timeRange.start, timeRange.end]);

        // Get all sessions in the time range
        const sessionsResult = await server.db.query(`
          SELECT * FROM user_sessions
          WHERE created_at BETWEEN $1 AND $2
          ${userId ? 'AND user_id = $3' : ''}
          ORDER BY created_at DESC
        `, userId ? [timeRange.start, timeRange.end, userId] : [timeRange.start, timeRange.end]);

        const exportData = {
          exportedAt: new Date(),
          exportedBy: request.user!.id,
          timeRange,
          userId,
          analytics,
          alerts: alertsResult.rows,
          sessions: sessionsResult.rows.map(s => ({
            ...s,
            // Sanitize sensitive data
            session_token: '***',
            refresh_token: '***'
          }))
        };

        // Log the export
        await server.auditService.logEvent({
          userId: request.user!.id,
          action: 'session_data_exported',
          details: {
            timeRange,
            targetUserId: userId,
            recordCount: {
              alerts: alertsResult.rows.length,
              sessions: sessionsResult.rows.length


          sessionId: request.sessionId,
          severity: 'info'
        });

        // Set appropriate headers for download
        reply.header('Content-Type', 'application/json');
        reply.header(
          'Content-Disposition',
          `attachment; filename="session-export-${new Date().toISOString()}.json"`
        );

        return reply.send(exportData);
 catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Failed to export session data'
        });


  });
