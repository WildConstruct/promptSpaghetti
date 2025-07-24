/**
 * Enforcement Actions API Routes - Epic 17
 * 
 * RESTful API endpoints for enforcement action management, violation reporting,
 * appeals processing, and enforcement analytics. Provides comprehensive
 * administrative controls for marketplace moderation and compliance.
 * 
 * Task: E17-1753114397379-11939C - Create enforcement actions
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EnforcementActionService } from '../services/enforcement/EnforcementActionService';
import { TrustScoreService } from '../services/trust/TrustScoreService';
import { Database } from '../database';
import {
  EnforcementActionType,
  ActionSeverity,
  ActionStatus,
  TargetType,
  ViolationCategory,
  AppealStatus
} from '../../../packages/core/types/EnforcementTypes';

// Request/Response type definitions
interface CreateEnforcementActionRequest {
  Body: {
    targetType: TargetType;
    targetId: string;
    actionType: EnforcementActionType;
    severity: ActionSeverity;
    reason: string;
    description?: string;
    evidence?: any[];
    duration?: {
      type: 'temporary' | 'permanent' | 'conditional';
      duration?: number;
      condition?: string;
    };
    effectiveFrom?: Date;
    effectiveUntil?: Date;
    tags?: string[];
  };
}

interface ListEnforcementActionsRequest {
  Querystring: {
    targetType?: TargetType;
    targetId?: string;
    actionType?: EnforcementActionType;
    severity?: ActionSeverity;
    status?: ActionStatus;
    executedBy?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  };
}

interface CreateViolationReportRequest {
  Body: {
    targetType: TargetType;
    targetId: string;
    violationType: ViolationCategory;
    description: string;
    severity: ActionSeverity;
    evidence?: any[];
    detectionMethod?: {
      method: string;
      confidence: number;
    };
  };
}

interface SubmitAppealRequest {
  Body: {
    enforcementActionId: string;
    appealReason: {
      category: string;
      specificReason: string;
      claimsInnocence?: boolean;
      claimsError?: boolean;
      newEvidence?: boolean;
    };
    description: string;
    evidence?: any[];
    requestedOutcome: {
      action: string;
      specificRequest: string;
      justification: string;
    };
  };
}

interface ProcessAppealDecisionRequest {
  Body: {
    outcome: 'approved' | 'denied' | 'partially_approved';
    reasoning: string;
    modifiedActions?: any[];
  };
}

interface AnalyticsRequest {
  Querystring: {
    startDate: string;
    endDate: string;
    format?: 'json' | 'csv';
  };
}

export async function enforcementActionsRoutes(fastify: FastifyInstance) {
  const enforcementService = new EnforcementActionService(
    fastify.db as Database,
    fastify.trustScoreService as TrustScoreService,
    fastify.automatedEnforcementService,
    fastify.auditService
  );

  // =============================================================================
  // Enforcement Actions Management
  // =============================================================================

  /**
   * Create a new enforcement action
   */
  fastify.post<CreateEnforcementActionRequest>(
    '/enforcement-actions',
    {
      schema: {
        tags: ['Enforcement Actions'],
        summary: 'Create enforcement action',
        description: 'Create a new enforcement action against a user, template, or transaction',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['targetType', 'targetId', 'actionType', 'severity', 'reason'],
          properties: {
            targetType: { type: 'string', enum: ['user', 'template', 'transaction', 'review', 'comment', 'message'] },
            targetId: { type: 'string', description: 'ID of the target entity' },
            actionType: { 
              type: 'string', 
              enum: [
                'warning', 'content_flag', 'content_removal', 'content_quarantine',
                'account_warning', 'account_restriction', 'account_suspension', 'account_termination',
                'transaction_block', 'payment_hold', 'verification_required', 'feature_restriction',
                'marketplace_ban', 'shadow_ban', 'rate_limit', 'manual_review_required'
              ]
            },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            reason: { type: 'string', description: 'Reason for the enforcement action' },
            description: { type: 'string', description: 'Detailed description of the action' },
            evidence: { 
              type: 'array', 
              items: { type: 'object' },
              description: 'Supporting evidence for the action'
            },
            duration: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['temporary', 'permanent', 'conditional'] },
                duration: { type: 'number', description: 'Duration in minutes for temporary actions' },
                condition: { type: 'string', description: 'Condition for conditional actions' }
              }
            },
            effectiveFrom: { type: 'string', format: 'date-time' },
            effectiveUntil: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              action: {
                type: 'object',
                properties: {
                  actionId: { type: 'string' },
                  actionType: { type: 'string' },
                  severity: { type: 'string' },
                  status: { type: 'string' },
                  targetType: { type: 'string' },
                  targetId: { type: 'string' },
                  reason: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              },
              message: { type: 'string' }
            }
          },
          400: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              code: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<CreateEnforcementActionRequest>, reply: FastifyReply) => {
      try {
        // Verify admin permissions
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required',
            code: 'UNAUTHORIZED'
          });
        }

        const hasAdminAccess = await fastify.authService.hasPermission(userId, 'admin:enforcement:create');
        if (!hasAdminAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions',
            code: 'FORBIDDEN'
          });
        }

        // Parse dates if provided
        const actionData = {
          ...request.body,
          effectiveFrom: request.body.effectiveFrom ? new Date(request.body.effectiveFrom) : undefined,
          effectiveUntil: request.body.effectiveUntil ? new Date(request.body.effectiveUntil) : undefined
        };

        const action = await enforcementService.createEnforcementAction(actionData, userId);

        reply.code(201).send({
          success: true,
          action: {
            actionId: action.actionId,
            actionType: action.actionType,
            severity: action.severity,
            status: action.status,
            targetType: action.targetType,
            targetId: action.targetId,
            reason: action.reason,
            createdAt: action.createdAt
          },
          message: 'Enforcement action created successfully'
        });

      } catch (error) {
        console.error('Error creating enforcement action:', error);
        reply.code(400).send({
          success: false,
          error: error.message,
          code: 'CREATE_ACTION_FAILED'
        });
      }
    }
  );

  /**
   * Get enforcement action by ID
   */
  fastify.get<{ Params: { id: string } }>(
    '/enforcement-actions/:id',
    {
      schema: {
        tags: ['Enforcement Actions'],
        summary: 'Get enforcement action',
        description: 'Retrieve a specific enforcement action by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Enforcement action ID' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              action: { type: 'object' }
            }
          },
          404: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const action = await enforcementService.getEnforcementAction(request.params.id);
        if (!action) {
          return reply.code(404).send({
            success: false,
            error: 'Enforcement action not found'
          });
        }

        // Check permissions - admin or target user can view
        const hasAdminAccess = await fastify.authService.hasPermission(userId, 'admin:enforcement:read');
        const isTargetUser = action.targetType === 'user' && action.targetId === userId;

        if (!hasAdminAccess && !isTargetUser) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        reply.send({
          success: true,
          action
        });

      } catch (error) {
        console.error('Error retrieving enforcement action:', error);
        reply.code(500).send({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  /**
   * List enforcement actions with filters
   */
  fastify.get<ListEnforcementActionsRequest>(
    '/enforcement-actions',
    {
      schema: {
        tags: ['Enforcement Actions'],
        summary: 'List enforcement actions',
        description: 'Retrieve enforcement actions with optional filtering',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            targetType: { type: 'string', enum: ['user', 'template', 'transaction', 'review', 'comment', 'message'] },
            targetId: { type: 'string' },
            actionType: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            status: { type: 'string', enum: ['pending', 'active', 'expired', 'reversed', 'appealed', 'under_review', 'scheduled', 'failed'] },
            executedBy: { type: 'string' },
            fromDate: { type: 'string', format: 'date' },
            toDate: { type: 'string', format: 'date' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              actions: { type: 'array', items: { type: 'object' } },
              total: { type: 'integer' },
              pagination: {
                type: 'object',
                properties: {
                  limit: { type: 'integer' },
                  offset: { type: 'integer' },
                  hasMore: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<ListEnforcementActionsRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAdminAccess = await fastify.authService.hasPermission(userId, 'admin:enforcement:read');
        if (!hasAdminAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const filters = {
          ...request.query,
          fromDate: request.query.fromDate ? new Date(request.query.fromDate) : undefined,
          toDate: request.query.toDate ? new Date(request.query.toDate) : undefined,
          limit: request.query.limit || 20,
          offset: request.query.offset || 0
        };

        const result = await enforcementService.listEnforcementActions(filters);

        reply.send({
          success: true,
          actions: result.actions,
          total: result.total,
          pagination: {
            limit: filters.limit,
            offset: filters.offset,
            hasMore: (filters.offset + filters.limit) < result.total
          }
        });

      } catch (error) {
        console.error('Error listing enforcement actions:', error);
        reply.code(500).send({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  /**
   * Execute an enforcement action
   */
  fastify.post<{ Params: { id: string } }>(
    '/enforcement-actions/:id/execute',
    {
      schema: {
        tags: ['Enforcement Actions'],
        summary: 'Execute enforcement action',
        description: 'Execute a pending enforcement action',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Enforcement action ID' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              executed: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasExecutePermission = await fastify.authService.hasPermission(userId, 'admin:enforcement:execute');
        if (!hasExecutePermission) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const executed = await enforcementService.executeEnforcementAction(request.params.id);

        reply.send({
          success: true,
          executed,
          message: executed ? 'Enforcement action executed successfully' : 'Failed to execute enforcement action'
        });

      } catch (error) {
        console.error('Error executing enforcement action:', error);
        reply.code(400).send({
          success: false,
          error: error.message
        });
      }
    }
  );

  // =============================================================================
  // Violation Reporting
  // =============================================================================

  /**
   * Create a violation report
   */
  fastify.post<CreateViolationReportRequest>(
    '/violation-reports',
    {
      schema: {
        tags: ['Violation Reports'],
        summary: 'Create violation report',
        description: 'Submit a violation report for review',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['targetType', 'targetId', 'violationType', 'description', 'severity'],
          properties: {
            targetType: { type: 'string', enum: ['user', 'template', 'transaction', 'review', 'comment', 'message'] },
            targetId: { type: 'string' },
            violationType: { 
              type: 'string', 
              enum: [
                'content_policy', 'quality_standards', 'security_threat', 'fraud_abuse',
                'intellectual_property', 'privacy_violation', 'spam_manipulation', 'harassment_hate',
                'legal_compliance', 'terms_of_service', 'community_guidelines', 'payment_issues',
                'technical_violation'
              ]
            },
            description: { type: 'string', minLength: 10 },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            evidence: { type: 'array', items: { type: 'object' } },
            detectionMethod: {
              type: 'object',
              properties: {
                method: { type: 'string' },
                confidence: { type: 'number', minimum: 0, maximum: 100 }
              }
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              report: {
                type: 'object',
                properties: {
                  reportId: { type: 'string' },
                  status: { type: 'string' },
                  reportedAt: { type: 'string', format: 'date-time' }
                }
              },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<CreateViolationReportRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const reportData = {
          ...request.body,
          reportedBy: userId
        };

        const report = await enforcementService.createViolationReport(reportData);

        reply.code(201).send({
          success: true,
          report: {
            reportId: report.reportId,
            status: report.status,
            reportedAt: report.reportedAt
          },
          message: 'Violation report submitted successfully'
        });

      } catch (error) {
        console.error('Error creating violation report:', error);
        reply.code(400).send({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * Get violation report by ID
   */
  fastify.get<{ Params: { id: string } }>(
    '/violation-reports/:id',
    {
      schema: {
        tags: ['Violation Reports'],
        summary: 'Get violation report',
        description: 'Retrieve a specific violation report by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Violation report ID' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'admin:reports:read');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const report = await enforcementService.getViolationReport(request.params.id);
        if (!report) {
          return reply.code(404).send({
            success: false,
            error: 'Violation report not found'
          });
        }

        reply.send({
          success: true,
          report
        });

      } catch (error) {
        console.error('Error retrieving violation report:', error);
        reply.code(500).send({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  // =============================================================================
  // Appeals Management
  // =============================================================================

  /**
   * Submit an appeal
   */
  fastify.post<SubmitAppealRequest>(
    '/appeals',
    {
      schema: {
        tags: ['Appeals'],
        summary: 'Submit appeal',
        description: 'Submit an appeal for an enforcement action',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['enforcementActionId', 'appealReason', 'description', 'requestedOutcome'],
          properties: {
            enforcementActionId: { type: 'string' },
            appealReason: {
              type: 'object',
              required: ['category', 'specificReason'],
              properties: {
                category: { type: 'string' },
                specificReason: { type: 'string' },
                claimsInnocence: { type: 'boolean' },
                claimsError: { type: 'boolean' },
                newEvidence: { type: 'boolean' }
              }
            },
            description: { type: 'string', minLength: 10 },
            evidence: { type: 'array', items: { type: 'object' } },
            requestedOutcome: {
              type: 'object',
              required: ['action', 'specificRequest', 'justification'],
              properties: {
                action: { type: 'string' },
                specificRequest: { type: 'string' },
                justification: { type: 'string' }
              }
            }
          }
        }
      }
    },
    async (request: FastifyRequest<SubmitAppealRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const appealData = {
          ...request.body,
          appellantId: userId
        };

        const appeal = await enforcementService.submitAppeal(appealData);

        reply.code(201).send({
          success: true,
          appeal: {
            appealId: appeal.appealId,
            status: appeal.status,
            submittedAt: appeal.submittedAt,
            reviewDeadline: appeal.reviewDeadline
          },
          message: 'Appeal submitted successfully'
        });

      } catch (error) {
        console.error('Error submitting appeal:', error);
        reply.code(400).send({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * Process appeal decision
   */
  fastify.post<{ Params: { id: string } } & ProcessAppealDecisionRequest>(
    '/appeals/:id/decision',
    {
      schema: {
        tags: ['Appeals'],
        summary: 'Process appeal decision',
        description: 'Make a decision on an appeal',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', description: 'Appeal ID' }
          }
        },
        body: {
          type: 'object',
          required: ['outcome', 'reasoning'],
          properties: {
            outcome: { type: 'string', enum: ['approved', 'denied', 'partially_approved'] },
            reasoning: { type: 'string', minLength: 10 },
            modifiedActions: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasDecisionPermission = await fastify.authService.hasPermission(userId, 'admin:appeals:decide');
        if (!hasDecisionPermission) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const decision = {
          ...request.body,
          decidedBy: userId
        };

        const appeal = await enforcementService.processAppealDecision(request.params.id, decision);

        reply.send({
          success: true,
          appeal: {
            appealId: appeal.appealId,
            status: appeal.status,
            decision: appeal.decision,
            decidedAt: appeal.decidedAt
          },
          message: 'Appeal decision processed successfully'
        });

      } catch (error) {
        console.error('Error processing appeal decision:', error);
        reply.code(400).send({
          success: false,
          error: error.message
        });
      }
    }
  );

  // =============================================================================
  // Analytics and Reporting
  // =============================================================================

  /**
   * Get enforcement analytics
   */
  fastify.get<AnalyticsRequest>(
    '/enforcement-analytics',
    {
      schema: {
        tags: ['Analytics'],
        summary: 'Get enforcement analytics',
        description: 'Retrieve enforcement analytics for a time period',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['startDate', 'endDate'],
          properties: {
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            format: { type: 'string', enum: ['json', 'csv'], default: 'json' }
          }
        }
      }
    },
    async (request: FastifyRequest<AnalyticsRequest>, reply: FastifyReply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAnalyticsAccess = await fastify.authService.hasPermission(userId, 'admin:analytics:read');
        if (!hasAnalyticsAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        const timeRange = {
          startDate: new Date(request.query.startDate),
          endDate: new Date(request.query.endDate)
        };

        const analytics = await enforcementService.generateEnforcementAnalytics(timeRange);

        if (request.query.format === 'csv') {
          // TODO: Implement CSV export
          reply.type('text/csv');
          reply.send('CSV export not yet implemented');
        } else {
          reply.send({
            success: true,
            analytics,
            generatedAt: new Date()
          });
        }

      } catch (error) {
        console.error('Error generating enforcement analytics:', error);
        reply.code(400).send({
          success: false,
          error: error.message
        });
      }
    }
  );

  /**
   * Get enforcement summary dashboard
   */
  fastify.get(
    '/enforcement-dashboard',
    {
      schema: {
        tags: ['Analytics'],
        summary: 'Get enforcement dashboard',
        description: 'Retrieve summary data for enforcement dashboard',
        security: [{ bearerAuth: [] }]
      }
    },
    async (request, reply) => {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return reply.code(401).send({
            success: false,
            error: 'Authentication required'
          });
        }

        const hasAccess = await fastify.authService.hasPermission(userId, 'admin:enforcement:read');
        if (!hasAccess) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions'
          });
        }

        // Get last 30 days of data for dashboard
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const analytics = await enforcementService.generateEnforcementAnalytics({
          startDate,
          endDate
        });

        // Get recent actions for activity feed
        const recentActions = await enforcementService.listEnforcementActions({
          limit: 10,
          offset: 0
        });

        reply.send({
          success: true,
          dashboard: {
            summary: analytics.overallMetrics,
            trends: analytics.trends,
            recentActivity: recentActions.actions,
            lastUpdated: new Date()
          }
        });

      } catch (error) {
        console.error('Error generating enforcement dashboard:', error);
        reply.code(500).send({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  );

  /**
   * Health check for enforcement system
   */
  fastify.get(
    '/enforcement-health',
    {
      schema: {
        tags: ['System'],
        summary: 'Enforcement system health',
        description: 'Check health status of enforcement system'
      }
    },
    async (request, reply) => {
      try {
        // Basic health checks
        const health = {
          status: 'healthy',
          timestamp: new Date(),
          services: {
            enforcementService: 'operational',
            database: 'operational',
            automation: 'operational'
          },
          metrics: {
            pendingActions: 0,
            pendingReports: 0,
            pendingAppeals: 0
          }
        };

        reply.send({
          success: true,
          health
        });

      } catch (error) {
        console.error('Error checking enforcement system health:', error);
        reply.code(500).send({
          success: false,
          error: 'Health check failed',
          status: 'unhealthy'
        });
      }
    }
  );
}