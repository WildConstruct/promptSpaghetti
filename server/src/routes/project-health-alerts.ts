/**
 * Project Health Alerts API Routes
 * REST API for managing project health monitoring and alerts
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { 
  ProjectHealthAlertService,
  ProjectHealthAlert,
  AlertThresholds
} from '../services/project-health-alert-service';
import { AttributionService } from '../services/attribution-service';
import { AnalyticsDAO } from '../database/analytics-dao';
import { getDatabase } from '../database/connection';
import { z } from 'zod';

// Request/Response schemas
const GetAlertsQuerySchema = z.object({
  workspaceId: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  alertType: z.enum(['STALLED_PROJECT', 'UNEVEN_CONTRIBUTIONS', 'LOW_ENGAGEMENT', 'HIGH_ERROR_RATE']).optional(),
  status: z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED']).optional(),
  limit: z.coerce.number().max(100).default(50),
  offset: z.coerce.number().default(0)
});

const AlertThresholdsSchema = z.object({
  stalledProject: z.object({
    inactivityDays: z.number().min(1).max(90).default(7),
    noExecutionDays: z.number().min(1).max(90).default(14),
    noCollaborationDays: z.number().min(1).max(90).default(21),
    minActivityThreshold: z.number().min(1).max(100).default(5)
  }).optional(),
  unevenContributions: z.object({
    maxContributionRatio: z.number().min(0.1).max(1.0).default(0.75),
    minActiveContributors: z.number().min(1).max(20).default(2),
    contributionImbalanceThreshold: z.number().min(0.1).max(1.0).default(0.6),
    inactiveUserDays: z.number().min(1).max(90).default(14)
  }).optional(),
  engagement: z.object({
    minWeeklyActive: z.number().min(1).max(50).default(2),
    minMonthlyGrowth: z.number().min(-1).max(10).default(0.0),
    maxErrorRate: z.number().min(0).max(1).default(0.1)
  }).optional()
});

const AlertActionSchema = z.object({
  action: z.enum(['acknowledge', 'resolve', 'dismiss']),
  reason: z.string().optional()
});

export default async function projectHealthAlertsRoutes(fastify: FastifyInstance) {
  // Initialize services
  const database = getDatabase();
  const analyticsDAO = new AnalyticsDAO(database);
  const attributionService = new AttributionService(database);
  const alertService = new ProjectHealthAlertService(database, attributionService, analyticsDAO);

  /**
   * GET /api/project-health-alerts
   * Get alerts for a workspace with optional filtering
   */
  fastify.get<{
    Querystring: z.infer<typeof GetAlertsQuerySchema>
  }>('/api/project-health-alerts', {
    schema: {
      querystring: GetAlertsQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  alertType: { type: 'string' },
                  severity: { type: 'string' },
                  projectId: { type: 'string' },
                  workspaceId: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  detectedAt: { type: 'string' },
                  status: { type: 'string' },
                  recommendedActions: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            total: { type: 'number' },
            hasMore: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: z.infer<typeof GetAlertsQuerySchema> }>, reply: FastifyReply) => {
    try {
      const { workspaceId, severity, alertType, status, limit, offset } = request.query;

      // Get all alerts for workspace
      const allAlerts = await alertService.scanProjectsForAlerts(workspaceId);
      
      // Apply filters
      let filteredAlerts = allAlerts;
      
      if (severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
      }
      
      if (alertType) {
        filteredAlerts = filteredAlerts.filter(alert => alert.alertType === alertType);
      }
      
      if (status) {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
      }

      // Sort by severity and detection time
      filteredAlerts.sort((a, b) => {
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      });

      // Apply pagination
      const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);
      const hasMore = filteredAlerts.length > offset + limit;

      return {
        alerts: paginatedAlerts,
        total: filteredAlerts.length,
        hasMore
      };

    } catch (error) {
      fastify.log.error('Error getting project health alerts:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to retrieve project health alerts'
      });
    }
  });

  /**
   * POST /api/project-health-alerts/scan
   * Manually trigger alert scanning with custom thresholds
   */
  fastify.post<{
    Body: { workspaceId: string; thresholds?: z.infer<typeof AlertThresholdsSchema> }
  }>('/api/project-health-alerts/scan', {
    schema: {
      body: {
        type: 'object',
        required: ['workspaceId'],
        properties: {
          workspaceId: { type: 'string' },
          thresholds: AlertThresholdsSchema
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { workspaceId, thresholds = {} } = request.body;

      const alerts = await alertService.scanProjectsForAlerts(workspaceId, thresholds);

      return {
        success: true,
        alertsFound: alerts.length,
        alerts: alerts.slice(0, 10), // Return first 10 for preview
        scanTimestamp: new Date().toISOString()
      };

    } catch (error) {
      fastify.log.error('Error scanning for alerts:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to scan for project health alerts'
      });
    }
  });

  /**
   * PUT /api/project-health-alerts/:alertId/action
   * Take action on an alert (acknowledge, resolve, dismiss)
   */
  fastify.put<{
    Params: { alertId: string };
    Body: z.infer<typeof AlertActionSchema> & { userId?: string }
  }>('/api/project-health-alerts/:alertId/action', {
    schema: {
      params: {
        type: 'object',
        properties: {
          alertId: { type: 'string' }
        },
        required: ['alertId']
      },
      body: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['acknowledge', 'resolve', 'dismiss'] },
          reason: { type: 'string' },
          userId: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { alertId } = request.params;
      const { action, reason, userId = 'unknown' } = request.body;

      switch (action) {
        case 'acknowledge':
          await alertService.acknowledgeAlert(alertId, userId);
          break;
        case 'resolve':
          await alertService.resolveAlert(alertId);
          break;
        case 'dismiss':
          await alertService.dismissAlert(alertId, userId, reason || 'No reason provided');
          break;
      }

      return {
        success: true,
        action,
        alertId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      fastify.log.error(`Error performing action ${request.body.action} on alert:`, error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: `Failed to ${request.body.action} alert`
      });
    }
  });

  /**
   * GET /api/project-health-alerts/project/:projectId
   * Get specific project health details and alerts
   */
  fastify.get<{
    Params: { projectId: string };
    Querystring: { includeMetrics?: boolean }
  }>('/api/project-health-alerts/project/:projectId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          projectId: { type: 'string' }
        },
        required: ['projectId']
      },
      querystring: {
        type: 'object',
        properties: {
          includeMetrics: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { projectId } = request.params;
      const { includeMetrics = false } = request.query;

      // Get project health score and basic metrics
      const healthScore = analyticsDAO.getProjectHealthScore(projectId);
      
      const response: any = {
        projectId,
        healthScore: healthScore.score,
        recommendation: healthScore.recommendation,
        factors: healthScore.factors
      };

      if (includeMetrics) {
        // Get additional detailed metrics
        const executionStats = analyticsDAO.getProjectExecutions(projectId, 30);
        const userActivity = analyticsDAO.getProjectUserActivity(projectId, 30);
        const collaborationStats = analyticsDAO.getProjectCollaborationStats(projectId, 30);
        const activityTimeline = analyticsDAO.getProjectActivityTimeline(projectId, 30);

        response.detailedMetrics = {
          execution: executionStats,
          userActivity,
          collaboration: collaborationStats,
          timeline: activityTimeline
        };
      }

      return response;

    } catch (error) {
      fastify.log.error('Error getting project health details:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get project health details'
      });
    }
  });

  /**
   * GET /api/project-health-alerts/workspace/:workspaceId/summary
   * Get workspace health summary and statistics
   */
  fastify.get<{
    Params: { workspaceId: string }
  }>('/api/project-health-alerts/workspace/:workspaceId/summary', {
    schema: {
      params: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string' }
        },
        required: ['workspaceId']
      }
    }
  }, async (request, reply) => {
    try {
      const { workspaceId } = request.params;

      // Get all alerts for workspace to generate summary
      const alerts = await alertService.scanProjectsForAlerts(workspaceId);

      // Group alerts by severity and type
      const alertsBySeverity = alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertsByType = alerts.reduce((acc, alert) => {
        acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get projects with issues
      const projectsWithIssues = [...new Set(alerts.map(alert => alert.projectId))];

      // Calculate overall workspace health
      const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
      const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;
      const totalAlerts = alerts.length;

      let workspaceHealthStatus = 'HEALTHY';
      if (criticalAlerts > 0) {
        workspaceHealthStatus = 'CRITICAL';
      } else if (highAlerts > 2) {
        workspaceHealthStatus = 'AT_RISK';
      } else if (totalAlerts > 5) {
        workspaceHealthStatus = 'NEEDS_ATTENTION';
      }

      return {
        workspaceId,
        healthStatus: workspaceHealthStatus,
        summary: {
          totalAlerts,
          alertsBySeverity,
          alertsByType,
          projectsWithIssues: projectsWithIssues.length,
          mostCommonIssue: Object.entries(alertsByType).sort(([,a], [,b]) => b - a)[0]?.[0] || null
        },
        recentAlerts: alerts
          .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
          .slice(0, 5), // 5 most recent alerts
        recommendations: generateWorkspaceRecommendations(alerts)
      };

    } catch (error) {
      fastify.log.error('Error getting workspace health summary:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get workspace health summary'
      });
    }
  });
}

/**
 * Generate workspace-level recommendations based on alert patterns
 */
function generateWorkspaceRecommendations(alerts: ProjectHealthAlert[]): string[] {
  const recommendations: string[] = [];
  
  const alertsByType = alerts.reduce((acc, alert) => {
    acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalAlerts = alerts.length;
  
  if (alertsByType['STALLED_PROJECT'] > totalAlerts * 0.4) {
    recommendations.push('Multiple projects appear stalled - consider team capacity review');
  }
  
  if (alertsByType['UNEVEN_CONTRIBUTIONS'] > totalAlerts * 0.3) {
    recommendations.push('Contribution imbalance detected - review task distribution and mentoring');
  }
  
  if (alertsByType['LOW_ENGAGEMENT'] > totalAlerts * 0.3) {
    recommendations.push('Low engagement across workspace - consider team sync and goal alignment');
  }
  
  if (alertsByType['HIGH_ERROR_RATE'] > 2) {
    recommendations.push('Multiple projects with high error rates - technical review recommended');
  }

  if (alerts.filter(a => a.severity === 'CRITICAL').length > 0) {
    recommendations.push('Critical issues require immediate attention');
  }

  if (recommendations.length === 0) {
    recommendations.push('Workspace health is good - maintain current practices');
  }

  return recommendations;
}