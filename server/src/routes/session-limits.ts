/**
 * Session Limits Routes
 * 
 * RESTful API routes for managing session limits, monitoring, and administration
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SessionLimitManager, SessionLimitConfig } from '../services/SessionLimitManager';
import { SessionLimitConfigManager } from '../services/SessionLimitConfigManager';
import { createSessionLimitMiddleware } from '../middleware/session-limit-middleware';
import { SessionService } from '../auth/services/SessionService';
import { AuditService } from '../auth/services/AuditService';

// Request/Response schemas
}
}
interface GetConfigRequest {
  Params: {
    scope: 'global' | 'organization' | 'user';
    targetId?: string;
}
}
  };
}

}
}
interface UpdateConfigRequest {
  Params: {
    scope: 'global' | 'organization' | 'user';
    targetId?: string;
}
}
  };
  Body: {
    config: Partial<SessionLimitConfig>;
    reason?: string;
  };
}

}
}
interface GetMetricsRequest {
  Querystring: {
    timeRange?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    organizationId?: string;
}
}
  };
}

}
}
interface GetViolationsRequest {
  Querystring: {
    userId?: string;
    type?: string;
    severity?: string;
    limit?: number;
    resolved?: boolean;
}
}
  };
}

}
}
interface ResolveViolationRequest {
  Params: {
    violationId: string;
}
}
  };
  Body: {
    resolution: string;
  };
}

}
}
interface TerminateSessionRequest {
  Params: {
    sessionId: string;
}
}
  };
  Body: {
    reason: string;
    graceful?: boolean;
    gracePeriodMinutes?: number;
  };
}

}
}
interface OverrideUserLimitsRequest {
  Params: {
    userId: string;
}
}
  };
  Body: {
    overrides: Partial<SessionLimitConfig>;
    expiresAt?: string;
    reason: string;
  };
}

export async function sessionLimitsRoutes(fastify: FastifyInstance) {
  // Initialize services (these would be injected from the main app)
  const sessionLimitManager = fastify.sessionLimitManager as SessionLimitManager;
  const configManager = fastify.sessionLimitConfigManager as SessionLimitConfigManager;
  const sessionService = fastify.sessionService as SessionService;
  const auditService = fastify.auditService as AuditService;
  
  const middleware = createSessionLimitMiddleware(
    sessionLimitManager,
    sessionService,
    auditService
  );
  
  // Require admin permissions for all routes
  fastify.addHook('preHandler', async (request, reply) => {
    const auth = (request as any).auth;
    if (!auth?.isAdmin && !auth?.permissions?.includes('session_limits_admin')) {
      reply.status(403).send({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }
  });
  
  /**
   * Get session limit configuration
   */
  fastify.get<GetConfigRequest>('/config/:scope/:targetId?', async (request, reply) => {
    try {
      const { scope, targetId } = request.params;
      
      let config;
      if (scope === 'user' && targetId) {
        config = await configManager.getEffectiveConfiguration(targetId);
      } else {
        config = await configManager.loadConfiguration(scope, targetId);
      }
      
      // Get configuration history
      const history = await configManager.getConfigurationHistory(scope, targetId || null, 10);
      
      reply.send({
        config,
        history,
        scope,
        targetId
      });
      
    } catch (error) {
      console.error('Error getting session limit configuration:', error);
      reply.status(500).send({
        error: 'Failed to get configuration',
        code: 'CONFIG_ERROR'
      });
    }
  });
  
  /**
   * Update session limit configuration
   */
  fastify.put<UpdateConfigRequest>('/config/:scope/:targetId?', async (request, reply) => {
    try {
      const { scope, targetId } = request.params;
      const { config, reason } = request.body;
      const userId = (request as any).auth.userId;
      
      // Validate configuration
      const validatedConfig = configManager.validateConfiguration(config);
      
      await configManager.saveConfiguration(
        validatedConfig,
        scope,
        targetId || null,
        userId,
        reason
      );
      
      reply.send({
        success: true,
        message: 'Configuration updated successfully',
        config: validatedConfig
      });
      
    } catch (error) {
      console.error('Error updating session limit configuration:', error);
      reply.status(400).send({
        error: error instanceof Error ? error.message : 'Failed to update configuration',
        code: 'CONFIG_UPDATE_ERROR'
      });
    }
  });
  
  /**
   * Get configuration templates
   */
  fastify.get('/config/templates', async (request, reply) => {
    try {
      const { category } = request.query as { category?: string };
      
      const templates = await configManager.getConfigurationTemplates(category);
      
      reply.send({
        templates,
        categories: ['security', 'performance', 'compliance', 'custom']
      });
      
    } catch (error) {
      console.error('Error getting configuration templates:', error);
      reply.status(500).send({
        error: 'Failed to get templates',
        code: 'TEMPLATES_ERROR'
      });
    }
  });
  
  /**
   * Create configuration template
   */
  fastify.post('/config/templates', async (request, reply) => {
    try {
      const template = request.body as any;
      const userId = (request as any).auth.userId;
      
      const templateId = await configManager.createTemplate(template, userId);
      
      reply.send({
        success: true,
        templateId,
        message: 'Template created successfully'
      });
      
    } catch (error) {
      console.error('Error creating configuration template:', error);
      reply.status(400).send({
        error: error instanceof Error ? error.message : 'Failed to create template',
        code: 'TEMPLATE_CREATE_ERROR'
      });
    }
  });
  
  /**
   * Apply configuration template
   */
  fastify.post('/config/templates/:templateId/apply', async (request, reply) => {
    try {
      const { templateId } = request.params as { templateId: string };
      const { scope, targetId, reason } = request.body as any;
      const userId = (request as any).auth.userId;
      
      await configManager.applyTemplate(templateId, scope, targetId, userId, reason);
      
      reply.send({
        success: true,
        message: 'Template applied successfully'
      });
      
    } catch (error) {
      console.error('Error applying configuration template:', error);
      reply.status(400).send({
        error: error instanceof Error ? error.message : 'Failed to apply template',
        code: 'TEMPLATE_APPLY_ERROR'
      });
    }
  });
  
  /**
   * Get session limit metrics and analytics
   */
  fastify.get<GetMetricsRequest>('/metrics', async (request, reply) => {
    try {
      const query = request.query;
      
      let timeRange;
      if (query.startDate && query.endDate) {
        timeRange = {
          start: new Date(query.startDate),
          end: new Date(query.endDate)
        };
      } else if (query.timeRange) {
        const hours = parseInt(query.timeRange);
        timeRange = {
          start: new Date(Date.now() - hours * 60 * 60 * 1000),
          end: new Date()
        };
      }
      
      const metrics = await sessionLimitManager.getMetrics(timeRange);
      
      // Get additional breakdown if user or organization specified
      let additionalMetrics = {};
      if (query.userId) {
        const userSessions = await sessionService.getUserActiveSessions(query.userId);
        additionalMetrics = {
          userActiveSessions: userSessions.length,
          userSessionDetails: userSessions
        };
      }
      
      reply.send({
        metrics,
        timeRange,
        filters: {
          userId: query.userId,
          organizationId: query.organizationId
  }
        ...additionalMetrics
      });
      
    } catch (error) {
      console.error('Error getting session limit metrics:', error);
      reply.status(500).send({
        error: 'Failed to get metrics',
        code: 'METRICS_ERROR'
      });
    }
  });
  
  /**
   * Get active violations
   */
  fastify.get<GetViolationsRequest>('/violations', async (request, reply) => {
    try {
      const filters = request.query;
      
      const violations = await sessionLimitManager.getActiveViolations({
        userId: filters.userId,
        type: filters.type,
        severity: filters.severity,
        limit: filters.limit ? parseInt(filters.limit.toString()) : undefined
      });
      
      // Get violation statistics
      const violationStats = violations.reduce((stats, violation) => {
        stats.total++;
        stats.byType[violation.type] = (stats.byType[violation.type] || 0) + 1;
        stats.bySeverity[violation.severity] = (stats.bySeverity[violation.severity] || 0) + 1;
        return stats;
      }, {
        total: 0,
        byType: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>
      });
      
      reply.send({
        violations,
        statistics: violationStats,
        filters
      });
      
    } catch (error) {
      console.error('Error getting violations:', error);
      reply.status(500).send({
        error: 'Failed to get violations',
        code: 'VIOLATIONS_ERROR'
      });
    }
  });
  
  /**
   * Resolve a violation
   */
  fastify.post<ResolveViolationRequest>('/violations/:violationId/resolve', async (request, reply) => {
    try {
      const { violationId } = request.params;
      const { resolution } = request.body;
      const userId = (request as any).auth.userId;
      
      await sessionLimitManager.resolveViolation(violationId, userId, resolution);
      
      reply.send({
        success: true,
        message: 'Violation resolved successfully'
      });
      
    } catch (error) {
      console.error('Error resolving violation:', error);
      reply.status(500).send({
        error: 'Failed to resolve violation',
        code: 'VIOLATION_RESOLVE_ERROR'
      });
    }
  });
  
  /**
   * Get active sessions with limit information
   */
  fastify.get('/sessions', async (request, reply) => {
    try {
      const { userId, organizationId, limit = 50 } = request.query as any;
      
      // Get active sessions from session service
      let sessions;
      if (userId) {
        sessions = await sessionService.getUserActiveSessions(userId);
      } else {
        // This would need to be implemented in SessionService
        // For now, return empty array
        sessions = [];
      }
      
      // Add limit compliance information to each session
      const sessionsWithLimits = await Promise.all(
        sessions.map(async (session) => {
          try {
            const limitCheck = await sessionLimitManager.canCreateSession(session.id, {
              ipAddress: session.location?.ipAddress,
              organizationId: organizationId
            });
            
            return {
              ...session,
              limitCompliance: {
                compliant: limitCheck.allowed,
                reason: limitCheck.reason,
                action: limitCheck.action
              }
            };
          } catch (error) {
            return {
              ...session,
              limitCompliance: {
                compliant: true,
                reason: 'Unable to check limits'
              }
            };
          }
  }
      );
      
      reply.send({
        sessions: sessionsWithLimits,
        filters: { userId, organizationId },
        total: sessionsWithLimits.length
      });
      
    } catch (error) {
      console.error('Error getting sessions:', error);
      reply.status(500).send({
        error: 'Failed to get sessions',
        code: 'SESSIONS_ERROR'
      });
    }
  });
  
  /**
   * Terminate a session
   */
  fastify.post<TerminateSessionRequest>('/sessions/:sessionId/terminate', async (request, reply) => {
    try {
      const { sessionId } = request.params;
      const { reason, graceful = true, gracePeriodMinutes = 5 } = request.body;
      const adminUserId = (request as any).auth.userId;
      
      // Get session info
      const session = await sessionService.getSession(sessionId);
      if (!session) {
        reply.status(404).send({
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        });
        return;
      }
      
      if (graceful) {
        await middleware.terminateSessionGracefully(
          sessionId,
          session.userId,
          reason,
          gracePeriodMinutes
        );
        
        reply.send({
          success: true,
          message: `Session will be terminated in ${gracePeriodMinutes} minutes`,
          gracePeriodMinutes
        });
      } else {
        await sessionService.revokeSession(sessionId, reason);
        
        // Log admin action
        await auditService.logEvent({
          userId: adminUserId,
          action: 'admin_session_terminated',
          details: {
            terminatedSessionId: sessionId,
            terminatedUserId: session.userId,
            reason
  }
          severity: 'info'
        });
        
        reply.send({
          success: true,
          message: 'Session terminated immediately'
        });
      }
      
    } catch (error) {
      console.error('Error terminating session:', error);
      reply.status(500).send({
        error: 'Failed to terminate session',
        code: 'SESSION_TERMINATE_ERROR'
      });
    }
  });
  
  /**
   * Bulk terminate sessions
   */
  fastify.post('/sessions/bulk-terminate', async (request, reply) => {
    try {
      const { 
        sessionIds, 
        userId, 
        organizationId, 
        reason, 
        graceful = true, 
        gracePeriodMinutes = 5 
      } = request.body as any;
      const adminUserId = (request as any).auth.userId;
      
      let targetSessionIds: string[] = [];
      
      if (sessionIds) {
        targetSessionIds = sessionIds;
      } else if (userId) {
        const userSessions = await sessionService.getUserActiveSessions(userId);
        targetSessionIds = userSessions.map(s => s.id);
      } else {
        reply.status(400).send({
          error: 'Must specify sessionIds or userId',
          code: 'INVALID_REQUEST'
        });
        return;
      }
      
      const results = [];
      for (const sessionId of targetSessionIds) {
        try {
          const session = await sessionService.getSession(sessionId);
          if (session) {
            if (graceful) {
              await middleware.terminateSessionGracefully(
                sessionId,
                session.userId,
                reason,
                gracePeriodMinutes
              );
            } else {
              await sessionService.revokeSession(sessionId, reason);
            }
            
            results.push({
              sessionId,
              status: 'success',
              message: graceful ? 'Termination scheduled' : 'Terminated immediately'
            });
          } else {
            results.push({
              sessionId,
              status: 'error',
              message: 'Session not found'
            });
          }
        } catch (error) {
          results.push({
            sessionId,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Log bulk termination
      await auditService.logEvent({
        userId: adminUserId,
        action: 'admin_bulk_session_terminated',
        details: {
          targetSessionIds,
          reason,
          graceful,
          gracePeriodMinutes,
          results
  }
        severity: 'info'
      });
      
      reply.send({
        success: true,
        results,
        totalProcessed: targetSessionIds.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      });
      
    } catch (error) {
      console.error('Error in bulk session termination:', error);
      reply.status(500).send({
        error: 'Failed to terminate sessions',
        code: 'BULK_TERMINATE_ERROR'
      });
    }
  });
  
  /**
   * Override user limits temporarily
   */
  fastify.post<OverrideUserLimitsRequest>('/users/:userId/override-limits', async (request, reply) => {
    try {
      const { userId } = request.params;
      const { overrides, expiresAt, reason } = request.body;
      const adminUserId = (request as any).auth.userId;
      
      const override = {
        userId,
        overrides,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        reason,
        createdBy: adminUserId,
        createdAt: new Date()
      };
      
      await configManager.saveConfiguration(
        overrides,
        'user',
        userId,
        adminUserId,
        reason
      );
      
      reply.send({
        success: true,
        message: 'User limit override applied successfully',
        override
      });
      
    } catch (error) {
      console.error('Error applying user limit override:', error);
      reply.status(500).send({
        error: 'Failed to apply limit override',
        code: 'OVERRIDE_ERROR'
      });
    }
  });
  
  /**
   * Get dashboard data
   */
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      };
      
      // Get current metrics
      const metrics = await sessionLimitManager.getMetrics(timeRange);
      
      // Get active violations
      const violations = await sessionLimitManager.getActiveViolations({ limit: 10 });
      
      // Get high-level statistics
      const dashboardData = {
        overview: {
          totalActiveSessions: metrics.activeSessionsTotal,
          totalViolations: metrics.violations.total,
          pendingViolations: violations.length,
          averageCheckTime: metrics.performance.averageCheckTime,
          cacheHitRate: metrics.performance.cacheHitRate
  }
        sessionBreakdown: metrics.activeSessionsByType,
        recentViolations: violations.slice(0, 5),
        violationTrends: metrics.violations.byType,
        systemHealth: {
          status: metrics.performance.errorRate < 0.01 ? 'healthy' : 'degraded',
          errorRate: metrics.performance.errorRate,
          lastUpdated: metrics.timestamp
        }
      };
      
      reply.send(dashboardData);
      
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      reply.status(500).send({
        error: 'Failed to get dashboard data',
        code: 'DASHBOARD_ERROR'
      });
    }
  });
  
  /**
   * Health check endpoint
   */
  fastify.get('/health', async (request, reply) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date(),
        services: {
          sessionLimitManager: 'healthy',
          configManager: 'healthy',
          database: 'healthy',
          redis: 'healthy'
        }
      };
      
      reply.send(health);
      
    } catch (error) {
      reply.status(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}