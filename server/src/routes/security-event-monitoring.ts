/**
 * Security Event Monitoring Routes
 * Provides real-time security monitoring dashboard and alerting endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SecurityEventCoordinator, SecurityEvent, ThreatDetectionRule } from '../services/SecurityEventCoordinator';
import { SecurityEventEnrichmentService } from '../services/SecurityEventEnrichmentService';
import { AuditService } from '../auth/services/AuditService';
import { logger } from '../utils/logger';

interface SecurityDashboardQuery {
  timeRange?: string; // '1h', '24h', '7d', '30d'
  severity?: string; // 'low', 'medium', 'high', 'critical'
  eventType?: string;
  userId?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

interface ThreatRuleRequest {
  rule: ThreatDetectionRule;
}

interface SecurityAlertQuery {
  status?: string; // 'active', 'resolved', 'dismissed'
  priority?: string; // 'low', 'medium', 'high', 'critical'
  limit?: number;
  offset?: number;
}

export async function securityEventMonitoringRoutes(
  fastify: FastifyInstance,
  securityCoordinator: SecurityEventCoordinator,
  enrichmentService: SecurityEventEnrichmentService,
  auditService: AuditService
) {
  // Get security dashboard overview
  fastify.get<{
    Querystring: SecurityDashboardQuery;
  }>('/api/security/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        timeRange = '24h',
        severity,
        eventType,
        userId,
        ipAddress,
        limit = 100,
        offset = 0
      } = request.query as SecurityDashboardQuery;

      // Get overall security statistics
      const stats = securityCoordinator.getStats();
      
      // Get recent security events with filters
      const events = await getFilteredSecurityEvents({
        timeRange,
        severity,
        eventType,
        userId,
        ipAddress,
        limit,
        offset
      });

      // Get active threats and alerts
      const activeThreats = await getActiveThreats();
      const recentAlerts = await getRecentAlerts(10);
      
      // Get top risk indicators
      const riskIndicators = await getRiskIndicators(timeRange);
      
      // Get geographic distribution
      const geoDistribution = await getGeographicDistribution(timeRange);
      
      // Calculate trend data
      const trends = await calculateSecurityTrends(timeRange);

      reply.send({
        success: true,
        data: {
          overview: {
            totalEvents: stats.totalEvents,
            threatsDetected: stats.threatsDetected,
            activeAlerts: stats.activeAlerts,
            averageRiskScore: stats.averageRiskScore
          },
          eventsByType: stats.eventsByType,
          eventsBySeverity: stats.eventsBySeverity,
          topUsers: stats.topUsers,
          topIPs: stats.topIPs,
          recentEvents: events,
          activeThreats,
          recentAlerts,
          riskIndicators,
          geoDistribution,
          trends,
          timeRange,
          filters: {
            severity,
            eventType,
            userId,
            ipAddress
          }
        }
      });
    } catch (error) {
      logger.log(`Security dashboard error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to load security dashboard'
      });
    }
  });

  // Get real-time security events (Server-Sent Events)
  fastify.get('/api/security/events/stream', (request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/event-stream');
    reply.header('Cache-Control', 'no-cache');
    reply.header('Connection', 'keep-alive');
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'Cache-Control');

    // Send initial connection event
    reply.raw.write('data: {"type": "connection", "timestamp": "' + new Date().toISOString() + '"}\n\n');

    // Security event handler
    const handleSecurityEvent = (event: SecurityEvent) => {
      const eventData = {
        type: 'security_event',
        event,
        timestamp: new Date().toISOString()
      };
      reply.raw.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    // Threat alert handler
    const handleThreatAlert = (alertData: any) => {
      const eventData = {
        type: 'threat_alert',
        alert: alertData,
        timestamp: new Date().toISOString()
      };
      reply.raw.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    // Anomaly alert handler
    const handleAnomalyAlert = (alertData: any) => {
      const eventData = {
        type: 'anomaly_alert',
        alert: alertData,
        timestamp: new Date().toISOString()
      };
      reply.raw.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    // Register event listeners
    securityCoordinator.on('securityEvent', handleSecurityEvent);
    securityCoordinator.on('threatAlert', handleThreatAlert);
    securityCoordinator.on('anomalyAlert', handleAnomalyAlert);

    // Send periodic heartbeat
    const heartbeatInterval = setInterval(() => {
      reply.raw.write('data: {"type": "heartbeat", "timestamp": "' + new Date().toISOString() + '"}\n\n');
    }, 30000);

    // Cleanup on connection close
    request.raw.on('close', () => {
      clearInterval(heartbeatInterval);
      securityCoordinator.removeListener('securityEvent', handleSecurityEvent);
      securityCoordinator.removeListener('threatAlert', handleThreatAlert);
      securityCoordinator.removeListener('anomalyAlert', handleAnomalyAlert);
    });
  });

  // Submit a security event for processing
  fastify.post<{
    Body: { event: SecurityEvent };
  }>('/api/security/events', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { event } = request.body as { event: SecurityEvent };
      
      // Validate event structure
      if (!event.type || !event.severity || !event.timestamp) {
        reply.code(400).send({
          success: false,
          error: 'Invalid event structure. Required fields: type, severity, timestamp'
        });
        return;
      }

      // Process the event through the security coordinator
      await securityCoordinator.processEvent(event);
      
      reply.send({
        success: true,
        message: 'Security event processed successfully',
        eventId: event.id
      });
    } catch (error) {
      logger.log(`Security event processing error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to process security event'
      });
    }
  });

  // Get security event details
  fastify.get<{
    Params: { eventId: string };
  }>('/api/security/events/:eventId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { eventId } = request.params as { eventId: string };
      
      // Get event from audit logs
      const eventDetails = await auditService.getEventById(eventId);
      
      if (!eventDetails) {
        reply.code(404).send({
          success: false,
          error: 'Security event not found'
        });
        return;
      }
      
      reply.send({
        success: true,
        data: eventDetails
      });
    } catch (error) {
      logger.log(`Get security event error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve security event'
      });
    }
  });

  // Threat detection rule management
  fastify.get('/api/security/rules', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rules = await getThreatDetectionRules();
      
      reply.send({
        success: true,
        data: rules
      });
    } catch (error) {
      logger.log(`Get threat rules error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve threat detection rules'
      });
    }
  });

  fastify.post<{
    Body: ThreatRuleRequest;
  }>('/api/security/rules', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { rule } = request.body as ThreatRuleRequest;
      
      // Validate rule structure
      if (!rule.id || !rule.name || !rule.conditions || !rule.actions) {
        reply.code(400).send({
          success: false,
          error: 'Invalid rule structure. Required fields: id, name, conditions, actions'
        });
        return;
      }
      
      // Add the rule to the coordinator
      securityCoordinator.addThreatRule(rule);
      
      // Log the rule creation
      await auditService.logEvent(
        'threat_rule_created',
        'system', // or get from request context
        {
          ruleId: rule.id,
          ruleName: rule.name,
          conditions: rule.conditions,
          actions: rule.actions
        }
      );
      
      reply.send({
        success: true,
        message: 'Threat detection rule created successfully',
        ruleId: rule.id
      });
    } catch (error) {
      logger.log(`Create threat rule error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to create threat detection rule'
      });
    }
  });

  fastify.delete<{
    Params: { ruleId: string };
  }>('/api/security/rules/:ruleId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params as { ruleId: string };
      
      // Remove the rule from the coordinator
      securityCoordinator.removeThreatRule(ruleId);
      
      // Log the rule deletion
      await auditService.logEvent(
        'threat_rule_deleted',
        'system', // or get from request context
        {
          ruleId
        }
      );
      
      reply.send({
        success: true,
        message: 'Threat detection rule deleted successfully'
      });
    } catch (error) {
      logger.log(`Delete threat rule error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to delete threat detection rule'
      });
    }
  });

  // Security alerts management
  fastify.get<{
    Querystring: SecurityAlertQuery;
  }>('/api/security/alerts', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        status = 'active',
        priority,
        limit = 50,
        offset = 0
      } = request.query as SecurityAlertQuery;
      
      const alerts = await getSecurityAlerts({
        status,
        priority,
        limit,
        offset
      });
      
      reply.send({
        success: true,
        data: alerts
      });
    } catch (error) {
      logger.log(`Get security alerts error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve security alerts'
      });
    }
  });

  // Acknowledge/resolve security alert
  fastify.patch<{
    Params: { alertId: string };
    Body: { status: string; resolution?: string };
  }>('/api/security/alerts/:alertId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { alertId } = request.params as { alertId: string };
      const { status, resolution } = request.body as { status: string; resolution?: string };
      
      // Update alert status
      await updateAlertStatus(alertId, status, resolution);
      
      // Log the alert update
      await auditService.logEvent(
        'security_alert_updated',
        'system', // or get from request context
        {
          alertId,
          newStatus: status,
          resolution
        }
      );
      
      reply.send({
        success: true,
        message: 'Security alert updated successfully'
      });
    } catch (error) {
      logger.log(`Update security alert error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to update security alert'
      });
    }
  });

  // Get security metrics and analytics
  fastify.get<{
    Querystring: { timeRange?: string; granularity?: string };
  }>('/api/security/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { timeRange = '24h', granularity = 'hour' } = request.query as {
        timeRange?: string;
        granularity?: string;
      };
      
      const metrics = await getSecurityMetrics(timeRange, granularity);
      
      reply.send({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.log(`Get security metrics error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to retrieve security metrics'
      });
    }
  });

  // Export security report
  fastify.get<{
    Querystring: {
      format?: string;
      timeRange?: string;
      includeEvents?: string;
      includeAlerts?: string;
    };
  }>('/api/security/export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        format = 'json',
        timeRange = '7d',
        includeEvents = 'true',
        includeAlerts = 'true'
      } = request.query as {
        format?: string;
        timeRange?: string;
        includeEvents?: string;
        includeAlerts?: string;
      };
      
      const reportData = await generateSecurityReport({
        timeRange,
        includeEvents: includeEvents === 'true',
        includeAlerts: includeAlerts === 'true'
      });
      
      if (format === 'csv') {
        reply.type('text/csv');
        reply.header('Content-Disposition', `attachment; filename="security-report-${Date.now()}.csv"`);
        reply.send(convertToCSV(reportData));
      } else {
        reply.type('application/json');
        reply.header('Content-Disposition', `attachment; filename="security-report-${Date.now()}.json"`);
        reply.send(reportData);
      }
    } catch (error) {
      logger.log(`Export security report error: ${error}`);
      reply.code(500).send({
        success: false,
        error: 'Failed to export security report'
      });
    }
  });
}

// Helper functions (mock implementations - would connect to real data sources)

async function getFilteredSecurityEvents(filters: SecurityDashboardQuery): Promise<any[]> {
  // Mock implementation - would query audit logs with filters
  return [];
}

async function getActiveThreats(): Promise<any[]> {
  // Mock implementation - would get current active threats
  return [];
}

async function getRecentAlerts(limit: number): Promise<any[]> {
  // Mock implementation - would get recent security alerts
  return [];
}

async function getRiskIndicators(timeRange: string): Promise<any> {
  // Mock implementation - would calculate risk indicators
  return {
    highRiskUsers: [],
    suspiciousIPs: [],
    anomalousBehaviors: [],
    threatLevel: 'medium'
  };
}

async function getGeographicDistribution(timeRange: string): Promise<any> {
  // Mock implementation - would analyze geographic event distribution
  return {
    countries: [],
    cities: [],
    suspiciousLocations: []
  };
}

async function calculateSecurityTrends(timeRange: string): Promise<any> {
  // Mock implementation - would calculate security trends
  return {
    eventsOverTime: [],
    threatsOverTime: [],
    riskScoreOverTime: [],
    topEventTypes: []
  };
}

async function getThreatDetectionRules(): Promise<ThreatDetectionRule[]> {
  // Mock implementation - would get rules from database
  return [];
}

async function getSecurityAlerts(query: SecurityAlertQuery): Promise<any[]> {
  // Mock implementation - would get alerts from database
  return [];
}

async function updateAlertStatus(alertId: string, status: string, resolution?: string): Promise<void> {
  // Mock implementation - would update alert in database
}

async function getSecurityMetrics(timeRange: string, granularity: string): Promise<any> {
  // Mock implementation - would calculate detailed metrics
  return {
    eventCounts: {},
    threatCounts: {},
    riskScores: {},
    responseTimes: {}
  };
}

async function generateSecurityReport(options: any): Promise<any> {
  // Mock implementation - would generate comprehensive security report
  return {
    summary: {},
    events: [],
    alerts: [],
    metrics: {},
    recommendations: []
  };
}

function convertToCSV(data: any): string {
  // Mock implementation - would convert data to CSV format
  return 'timestamp,event_type,severity,user_id,details\n';
}
