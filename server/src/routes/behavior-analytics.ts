/**
 * Behavior Analytics Routes - Epic 19 Security Implementation
 * API endpoints for user behavior analysis and anomaly detection
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BehaviorAnalyticsService, SessionBehaviorData } from '../auth/services/BehaviorAnalyticsService';
import { requireAuth } from '../middleware/auth';

interface AnalyzeBehaviorRequest {
  Body: {
    sessionData: SessionBehaviorData;
    userId?: string; // Optional, defaults to authenticated user
  };
}

interface GetProfileRequest {
  Params: {
    userId: string;
  };
}

interface UpdateProfileRequest {
  Params: {
    userId: string;
  };
  Body: {
    updateType: 'reset' | 'recalibrate' | 'suspend';
    reason?: string;
  };
}

interface GetAnomaliesRequest {
  Querystring: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
    severity?: string;
    resolved?: boolean;
    limit?: number;
    offset?: number;
  };
}

interface ResolveAnomalyRequest {
  Params: {
    anomalyId: string;
  };
  Body: {
    resolution: 'false_positive' | 'confirmed' | 'mitigated';
    notes?: string;
  };
}

interface GetRiskScoreRequest {
  Params: {
    userId: string;
  };
}

interface GetPatternsRequest {
  Params: {
    userId: string;
  };
  Querystring: {
    type?: string;
    limit?: number;
  };
}

export async function behaviorAnalyticsRoutes(
  fastify: FastifyInstance,
  behaviorAnalyticsService: BehaviorAnalyticsService
) {
  /**
   * Analyze behavior for current session
   */
  fastify.post<AnalyzeBehaviorRequest>('/behavior/analyze', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['sessionData'],
        properties: {
          sessionData: {
            type: 'object',
            required: ['sessionId', 'userId', 'startTime', 'actions', 'resources', 'interactions', 'errors'],
            properties: {
              sessionId: { type: 'string' },
              userId: { type: 'string' },
              startTime: { type: 'string', format: 'date-time' },
              endTime: { type: ['string', 'null'], format: 'date-time' },
              actions: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['timestamp', 'action', 'category', 'success'],
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    action: { type: 'string' },
                    category: { type: 'string' },
                    metadata: { type: 'object' },
                    duration: { type: 'number' },
                    success: { type: 'boolean' }
                  }
                }
              },
              resources: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['timestamp', 'resourceType', 'resourceId', 'action', 'duration'],
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    resourceType: { type: 'string' },
                    resourceId: { type: 'string' },
                    action: { type: 'string', enum: ['view', 'edit', 'delete', 'create'] },
                    duration: { type: 'number' }
                  }
                }
              },
              interactions: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['timestamp', 'type'],
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    type: { type: 'string', enum: ['click', 'scroll', 'keypress', 'focus', 'blur'] },
                    target: { type: 'string' },
                    metadata: { type: 'object' }
                  }
                }
              },
              errors: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['timestamp', 'errorType', 'errorMessage', 'context', 'resolved'],
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    errorType: { type: 'string' },
                    errorMessage: { type: 'string' },
                    context: { type: 'string' },
                    resolved: { type: 'boolean' }
                  }
                }
              }
            }
          },
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            riskScore: { type: 'number' },
            riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            anomalies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  type: { type: 'string' },
                  severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                  description: { type: 'string' },
                  deviationScore: { type: 'number' },
                  affectedMetrics: { type: 'array', items: { type: 'string' } },
                  resolved: { type: 'boolean' }
                }
              }
            },
            recommendation: { type: 'string', enum: ['allow', 'monitor', 'challenge', 'block'] },
            confidence: { type: 'number' },
            reasoning: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  }, async (request: FastifyRequest<AnalyzeBehaviorRequest>, reply: FastifyReply) => {
    try {
      const { sessionData, userId } = request.body;
      const targetUserId = userId || (request.user as Record<string, unknown> & { id: string }).id;

      // Convert date strings to Date objects
      const processedSessionData = {
        ...sessionData,
        startTime: new Date(sessionData.startTime),
        endTime: sessionData.endTime ? new Date(sessionData.endTime) : undefined,
        actions: sessionData.actions.map(a => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })),
        resources: sessionData.resources.map(r => ({
          ...r,
          timestamp: new Date(r.timestamp)
        })),
        interactions: sessionData.interactions.map(i => ({
          ...i,
          timestamp: new Date(i.timestamp)
        })),
        errors: sessionData.errors.map(e => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }))
      };

      const result = await behaviorAnalyticsService.analyzeBehavior(targetUserId, processedSessionData);

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to analyze behavior',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get user behavior profile
   */
  fastify.get<GetProfileRequest>('/behavior/profile/:userId', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            status: { type: 'string', enum: ['learning', 'established', 'suspicious', 'blocked'] },
            profileConfidence: { type: 'number' },
            dataPoints: { type: 'number' },
            riskScore: { type: 'number' },
            lastUpdated: { type: 'string', format: 'date-time' },
            baseline: {
              type: 'object',
              properties: {
                typicalLoginTimes: { type: 'array' },
                typicalSessionDuration: { type: 'object' },
                typicalActivityHours: { type: 'array', items: { type: 'number' } },
                weekdayVsWeekendRatio: { type: 'number' },
                typicalActionsPerSession: { type: 'object' },
                errorRate: { type: 'number' }
              }
            },
            patterns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { type: 'string' },
                  description: { type: 'string' },
                  frequency: { type: 'number' },
                  lastOccurrence: { type: 'string', format: 'date-time' },
                  confidence: { type: 'number' }
                }
              }
            },
            recentAnomalies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  resolved: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest<GetProfileRequest>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const user = request.user as Record<string, unknown> & { id: string; roles?: string[] };

      // Check permissions - users can only view their own profile unless admin
      if (userId !== user.id && !user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const profile = await (behaviorAnalyticsService as unknown as { getUserBehaviorProfile: (userId: string) => Promise<unknown> }).getUserBehaviorProfile(userId);

      // Sanitize sensitive data for response
      const sanitizedProfile = {
        userId: profile.userId,
        status: profile.status,
        profileConfidence: profile.profileConfidence,
        dataPoints: profile.dataPoints,
        riskScore: profile.riskScore,
        lastUpdated: profile.lastUpdated,
        baseline: {
          typicalLoginTimes: profile.baseline.typicalLoginTimes,
          typicalSessionDuration: profile.baseline.typicalSessionDuration,
          typicalActivityHours: profile.baseline.typicalActivityHours,
          weekdayVsWeekendRatio: profile.baseline.weekdayVsWeekendRatio,
          typicalActionsPerSession: profile.baseline.typicalActionsPerSession,
          errorRate: profile.baseline.errorRate
        },
        patterns: profile.patterns.map((p: Record<string, unknown>) => ({
          id: p.id,
          type: p.type,
          description: p.description,
          frequency: p.frequency,
          lastOccurrence: p.lastOccurrence,
          confidence: p.confidence
        })),
        recentAnomalies: profile.anomalies.slice(-10).map((a: Record<string, unknown>) => ({
          id: a.id,
          timestamp: a.timestamp,
          type: a.type,
          severity: a.severity,
          resolved: a.resolved
        }))
      };

      return reply.status(200).send(sanitizedProfile);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to get behavior profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Update user profile (admin only)
   */
  fastify.put<UpdateProfileRequest>('/behavior/profile/:userId', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['updateType'],
        properties: {
          updateType: { type: 'string', enum: ['reset', 'recalibrate', 'suspend'] },
          reason: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<UpdateProfileRequest>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const { updateType, reason } = request.body;
      const user = request.user as Record<string, unknown> & { id: string; roles?: string[] };

      // Admin only
      if (!user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Forbidden - Admin access required' });
      }

      // Handle different update types
      switch (updateType) {
      case 'reset':
        // Reset profile to learning mode
        await (
          behaviorAnalyticsService as unknown as { resetUserProfile: (userId: string,
          reason?: string
        ) => Promise<void> }).resetUserProfile(userId, reason);
        break;
      case 'recalibrate':
        // Force recalibration of baseline
        await (
          behaviorAnalyticsService as unknown as { recalibrateUserProfile: (userId: string,
          reason?: string
        ) => Promise<void> }).recalibrateUserProfile(userId, reason);
        break;
      case 'suspend':
        // Suspend profile monitoring
        await (
          behaviorAnalyticsService as unknown as { suspendUserProfile: (userId: string,
          reason?: string
        ) => Promise<void> }).suspendUserProfile(userId, reason);
        break;
      }

      return reply.status(200).send({ 
        success: true,
        message: `Profile ${updateType} completed for user ${userId}`
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get anomalies (admin only)
   */
  fastify.get<GetAnomaliesRequest>('/behavior/anomalies', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          type: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          resolved: { type: 'boolean' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest<GetAnomaliesRequest>, reply: FastifyReply) => {
    try {
      const user = request.user as Record<string, unknown> & { id: string; roles?: string[] };
      const { userId, startDate, endDate, type, severity, resolved, limit = 50, offset = 0 } = request.query;

      // Users can only view their own anomalies unless admin
      if (userId && userId !== user.id && !user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const targetUserId = userId || (user.roles?.includes('admin') ? undefined : user.id);

      const anomalies = await (behaviorAnalyticsService as unknown as { getAnomalies: (params: unknown) => Promise<unknown> }).getAnomalies({
        userId: targetUserId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type,
        severity,
        resolved,
        limit,
        offset
      });

      return reply.status(200).send(anomalies);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to get anomalies',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Resolve anomaly (admin only)
   */
  fastify.post<ResolveAnomalyRequest>('/behavior/anomalies/:anomalyId/resolve', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        required: ['anomalyId'],
        properties: {
          anomalyId: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['resolution'],
        properties: {
          resolution: { type: 'string', enum: ['false_positive', 'confirmed', 'mitigated'] },
          notes: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<ResolveAnomalyRequest>, reply: FastifyReply) => {
    try {
      const { anomalyId } = request.params;
      const { resolution, notes } = request.body;
      const user = request.user as Record<string, unknown> & { id: string; roles?: string[] };

      // Admin only
      if (!user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Forbidden - Admin access required' });
      }

      await (
        behaviorAnalyticsService as unknown as { resolveAnomaly: (anomalyId: string,
        resolution: string,
        userId: string,
        notes?: string
      ) => Promise<void> }).resolveAnomaly(anomalyId, resolution, user.id, notes);

      return reply.status(200).send({ 
        success: true,
        message: `Anomaly ${anomalyId} resolved as ${resolution}`
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to resolve anomaly',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get current risk score
   */
  fastify.get<GetRiskScoreRequest>('/behavior/risk/:userId', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<GetRiskScoreRequest>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const user = request.user as Record<string, unknown> & { id: string; roles?: string[] };

      // Check permissions
      if (userId !== user.id && !user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const profile = await (behaviorAnalyticsService as unknown as { getUserBehaviorProfile: (userId: string) => Promise<unknown> }).getUserBehaviorProfile(userId);

      return reply.status(200).send({
        userId,
        riskScore: profile.riskScore,
        riskLevel: profile.riskScore >= 80 ? 'critical' : 
          profile.riskScore >= 60 ? 'high' :
            profile.riskScore >= 40 ? 'medium' : 'low',
        profileStatus: profile.status,
        lastUpdated: profile.lastUpdated
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to get risk score',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get behavior patterns
   */
  fastify.get<GetPatternsRequest>('/behavior/patterns/:userId', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request: FastifyRequest<GetPatternsRequest>, reply: FastifyReply) => {
    try {
      const { userId } = request.params;
      const { type, limit = 10 } = request.query;
      const user = request.user as Record<string, unknown> & { id: string; roles?: string[] };

      // Check permissions
      if (userId !== user.id && !user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const profile = await (behaviorAnalyticsService as unknown as { getUserBehaviorProfile: (userId: string) => Promise<unknown> }).getUserBehaviorProfile(userId);
      
      let patterns = profile.patterns;
      if (type) {
        patterns = patterns.filter((p: unknown) => (p as { type: string }).type === type);
      }
      
      patterns = patterns.slice(0, limit);

      return reply.status(200).send({
        userId,
        patterns,
        totalPatterns: profile.patterns.length,
        profileConfidence: profile.profileConfidence
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to get patterns',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Health check endpoint
   */
  fastify.get('/behavior/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Simple health check
      return reply.status(200).send({
        status: 'healthy',
        service: 'behavior-analytics',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        service: 'behavior-analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get behavior analytics statistics (admin only)
   */
  fastify.get('/behavior/stats', {
    preHandler: requireAuth,
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            totalProfiles: { type: 'number' },
            profilesByStatus: {
              type: 'object',
              properties: {
                learning: { type: 'number' },
                established: { type: 'number' },
                suspicious: { type: 'number' },
                blocked: { type: 'number' }
              }
            },
            totalAnomalies: { type: 'number' },
            unresolvedAnomalies: { type: 'number' },
            anomaliesBySeverity: {
              type: 'object',
              properties: {
                low: { type: 'number' },
                medium: { type: 'number' },
                high: { type: 'number' },
                critical: { type: 'number' }
              }
            },
            averageRiskScore: { type: 'number' },
            highRiskUsers: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as Record<string, unknown> & { id: string; roles?: string[] };

      // Admin only
      if (!user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Forbidden - Admin access required' });
      }

      const stats = await (behaviorAnalyticsService as unknown as { getStatistics: () => Promise<unknown> }).getStatistics();

      return reply.status(200).send(stats);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ 
        error: 'Failed to get statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}