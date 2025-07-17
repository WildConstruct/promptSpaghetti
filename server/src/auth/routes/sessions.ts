// Epic 11 Session Management Routes
// HTTP routes for session management and monitoring

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticationService } from '../AuthenticationService';
import { SessionService } from '../services/SessionService';

// Session revocation schema
const revokeSessionSchema = z.object({
  sessionId: z.string().uuid(),
  reason: z.string().optional(),
});

// Bulk session revocation schema
const revokeBulkSessionsSchema = z.object({
  exceptCurrent: z.boolean().default(true),
  reason: z.string().optional(),
});

interface SessionRouteContext {
  authService: AuthenticationService;
  sessionService: SessionService;
}

export async function sessionRoutes(fastify: FastifyInstance, context: SessionRouteContext) {
  const { authService, sessionService } = context;

  // Get current user's active sessions
  fastify.get('/sessions', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            sessions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  deviceInfo: { type: 'object' },
                  location: { type: 'object' },
                  lastAccessedAt: { type: 'string' },
                  createdAt: { type: 'string' },
                  current: { type: 'boolean' },
                },
              },
            },
            stats: {
              type: 'object',
              properties: {
                totalSessions: { type: 'number' },
                activeSessions: { type: 'number' },
                expiredSessions: { type: 'number' },
                revokedSessions: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const currentSessionId = (request.user as any)?.sessionId;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
      }

      // Get active sessions
      const sessions = await sessionService.getUserActiveSessions(userId);
      
      // Mark current session
      const sessionsWithCurrent = sessions.map(session => ({
        ...session,
        current: session.id === currentSessionId,
      }));

      // Get session statistics
      const stats = await sessionService.getSessionStats(userId);

      return reply.send({
        sessions: sessionsWithCurrent,
        stats,
      });
    } catch (error) {
      fastify.log.error('Get sessions error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve sessions',
      });
    }
  });

  // Revoke a specific session
  fastify.post<{
    Body: z.infer<typeof revokeSessionSchema>;
  }>('/sessions/revoke', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      body: revokeSessionSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sessionId, reason } = request.body as z.infer<typeof revokeSessionSchema>;
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
      }

      // Verify the session belongs to the user
      const sessions = await sessionService.getUserActiveSessions(userId);
      const targetSession = sessions.find(s => s.id === sessionId);

      if (!targetSession) {
        return reply.status(404).send({
          error: 'Session Not Found',
          message: 'Session not found or does not belong to user',
        });
      }

      // Find session token to revoke
      const sessionResult = await sessionService.getSession(sessionId);
      if (sessionResult) {
        await sessionService.revokeSession(sessionResult.sessionToken, reason);
      }

      return reply.send({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      fastify.log.error('Revoke session error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to revoke session',
      });
    }
  });

  // Revoke all sessions except current (bulk revocation)
  fastify.post<{
    Body: z.infer<typeof revokeBulkSessionsSchema>;
  }>('/sessions/revoke-all', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      body: revokeBulkSessionsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            revokedCount: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { exceptCurrent, reason } = request.body as z.infer<typeof revokeBulkSessionsSchema>;
      const userId = (request.user as any)?.id;
      const currentSessionId = (request.user as any)?.sessionId;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
      }

      const exceptSessionId = exceptCurrent ? currentSessionId : undefined;
      const revokedCount = await sessionService.revokeAllUserSessions(userId, exceptSessionId);

      return reply.send({
        success: true,
        message: `Successfully revoked ${revokedCount} session(s)`,
        revokedCount,
      });
    } catch (error) {
      fastify.log.error('Revoke all sessions error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to revoke sessions',
      });
    }
  });

  // Renew current session
  fastify.post('/sessions/renew', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            newExpiresAt: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sessionToken = (request.user as any)?.sessionToken;

      if (!sessionToken) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Session token required',
        });
      }

      const renewedSession = await sessionService.renewSession(sessionToken);
      
      if (!renewedSession) {
        return reply.status(404).send({
          error: 'Session Not Found',
          message: 'Session not found or already expired',
        });
      }

      return reply.send({
        success: true,
        message: 'Session renewed successfully',
        newExpiresAt: renewedSession.expiresAt.toISOString(),
      });
    } catch (error) {
      fastify.log.error('Renew session error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to renew session',
      });
    }
  });

  // Get session security insights
  fastify.get('/sessions/security', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            suspiciousActivity: {
              type: 'object',
              properties: {
                multipleLocations: { type: 'boolean' },
                unusualDevices: { type: 'boolean' },
                suspiciousLocations: { type: 'array', items: { type: 'string' } },
                newDevices: { type: 'array' },
              },
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
      }

      const suspiciousActivity = await sessionService.detectSuspiciousActivity(userId);
      
      // Generate security recommendations
      const recommendations: string[] = [];
      
      if (suspiciousActivity.multipleLocations) {
        recommendations.push('Multiple login locations detected. Consider enabling two-factor authentication.');
      }
      
      if (suspiciousActivity.unusualDevices) {
        recommendations.push('Unusual devices detected. Review your active sessions.');
      }
      
      if (suspiciousActivity.suspiciousLocations.length > 0) {
        recommendations.push('New login locations detected. Revoke sessions from unrecognized locations.');
      }
      
      if (suspiciousActivity.newDevices.length > 0) {
        recommendations.push('New devices detected. Verify these devices are yours.');
      }

      // Get session stats for additional insights
      const stats = await sessionService.getSessionStats(userId);
      
      if (stats.activeSessions > 10) {
        recommendations.push('You have many active sessions. Consider revoking old sessions.');
      }

      return reply.send({
        suspiciousActivity,
        recommendations,
      });
    } catch (error) {
      fastify.log.error('Get security insights error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve security insights',
      });
    }
  });

  // Session activity endpoint (for real-time monitoring)
  fastify.get('/sessions/activity', {
    preHandler: [fastify.authenticate], // JWT authentication middleware
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            activities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: { type: 'string' },
                  action: { type: 'string' },
                  sessionId: { type: 'string' },
                  deviceInfo: { type: 'object' },
                  location: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { limit = 50, offset = 0 } = request.query as any;

      if (!userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'User authentication required',
        });
      }

      // Get session-related audit logs
      const auditService = authService.getService('audit');
      const activities = await auditService.getAuditLogs({
        userId,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        limit,
        offset,
      });

      // Filter for session-related activities
      const sessionActivities = activities.filter(activity => 
        activity.action.includes('session')
      );

      return reply.send({
        activities: sessionActivities.map(activity => ({
          timestamp: activity.createdAt.toISOString(),
          action: activity.action,
          sessionId: activity.sessionId,
          deviceInfo: activity.details?.deviceInfo || {},
          location: activity.details?.location || { ipAddress: activity.ipAddress },
        })),
      });
    } catch (error) {
      fastify.log.error('Get session activity error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve session activity',
      });
    }
  });

  // Health check for session service
  fastify.get('/sessions/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            metrics: {
              type: 'object',
              properties: {
                totalActiveSessions: { type: 'number' },
                expiredSessionsLastHour: { type: 'number' },
                averageSessionDuration: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get system-wide session metrics
      const dbService = authService.getService('database');
      
      const metricsResult = await dbService.query(`
        SELECT 
          COUNT(CASE WHEN NOT revoked AND expires_at > NOW() THEN 1 END) as active_sessions,
          COUNT(CASE WHEN expires_at < NOW() AND expires_at > NOW() - INTERVAL '1 hour' THEN 1 END) as expired_last_hour,
          AVG(EXTRACT(EPOCH FROM (last_accessed_at - created_at))) as avg_duration
        FROM user_sessions
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      const metrics = metricsResult.rows[0];

      return reply.send({
        status: 'healthy',
        metrics: {
          totalActiveSessions: parseInt(metrics.active_sessions) || 0,
          expiredSessionsLastHour: parseInt(metrics.expired_last_hour) || 0,
          averageSessionDuration: parseFloat(metrics.avg_duration) || 0,
        },
      });
    } catch (error) {
      fastify.log.error('Session health check error:', error);
      return reply.status(500).send({
        status: 'unhealthy',
        error: error.message,
      });
    }
  });
}