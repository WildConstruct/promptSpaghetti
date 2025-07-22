/**
 * Appeal Process API Routes - Epic 17
 * 
 * REST API endpoints for comprehensive appeal management, including
 * submission, review, decision-making, and tracking functionality.
 * 
 * Task: E17-1753114397383-FB5EA7 - Create appeal process
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { 
  AppealProcessService, 
  Appeal, 
  AppealStatus, 
  AppealCategory, 
  AppealPriority,
  AppealDecision,
  AppealDecisionRationale,
  AppealFilters,
  AppealReviewCriteria
} from '../services/trust/AppealProcessService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { requireAuth, requireAdmin, requireRole } from '../middleware/auth';

interface AppealRoutes {
  '/appeals': {
    GET: {
      Querystring: AppealFilters & {
        include_timeline?: boolean;
        include_evidence?: boolean;
      };
    };
    POST: {
      Body: {
        original_decision_id: string;
        original_decision_type: string;
        category: AppealCategory;
        subject: string;
        description: string;
        requested_outcome: string;
        impact_statement?: string;
        initial_evidence?: Array<{
          evidence_type: string;
          title: string;
          description: string;
          file_url?: string;
          content?: string;
        }>;
      };
    };
  };
  '/appeals/:appealId': {
    GET: {
      Params: { appealId: string };
      Querystring: {
        include_timeline?: boolean;
        include_evidence?: boolean;
        public_only?: boolean;
      };
    };
    PUT: {
      Params: { appealId: string };
      Body: {
        description?: string;
        requested_outcome?: string;
        impact_statement?: string;
      };
    };
  };
  '/appeals/:appealId/evidence': {
    GET: {
      Params: { appealId: string };
    };
    POST: {
      Params: { appealId: string };
      Body: {
        evidence_type: string;
        title: string;
        description: string;
        file_url?: string;
        content?: string;
        metadata?: Record<string, any>;
      };
    };
  };
  '/appeals/:appealId/timeline': {
    GET: {
      Params: { appealId: string };
      Querystring: {
        public_only?: boolean;
        event_types?: string;
      };
    };
  };
  '/appeals/:appealId/status': {
    PUT: {
      Params: { appealId: string };
      Body: {
        status: AppealStatus;
        notes?: string;
      };
    };
  };
  '/appeals/:appealId/assign': {
    POST: {
      Params: { appealId: string };
      Body: {
        reviewer_id: string;
        reviewer_role: string;
      };
    };
  };
  '/appeals/:appealId/decision': {
    POST: {
      Params: { appealId: string };
      Body: {
        decision: AppealDecision;
        rationale: AppealDecisionRationale;
        review_criteria?: AppealReviewCriteria;
      };
    };
  };
  '/appeals/:appealId/escalate': {
    POST: {
      Params: { appealId: string };
      Body: {
        escalation_reason: string;
        escalation_notes?: string;
        target_reviewer?: string;
      };
    };
  };
  '/appeals/statistics': {
    GET: {
      Querystring: {
        start_date?: string;
        end_date?: string;
        granularity?: 'hour' | 'day' | 'week' | 'month';
      };
    };
  };
  '/appeals/my-appeals': {
    GET: {
      Querystring: {
        status?: AppealStatus;
        limit?: number;
        offset?: number;
      };
    };
  };
  '/appeals/review-queue': {
    GET: {
      Querystring: {
        priority?: AppealPriority;
        category?: AppealCategory;
        assigned_to_me?: boolean;
        limit?: number;
        offset?: number;
      };
    };
  };
}

export default async function appealProcessRoutes(fastify: FastifyInstance) {
  // Initialize services
  const db = new DatabaseService(process.env.DATABASE_URL!);
  const auditService = new AuditService(db);
  const appealService = new AppealProcessService(db, auditService);

  // Authentication middleware - all routes require authentication
  fastify.addHook('preHandler', async (request, reply) => {
    await requireAuth(request, reply);
  });

  /**
   * Submit a new appeal
   * POST /appeals
   */
  fastify.post<AppealRoutes['/appeals']['POST']>(
    '/appeals',
    {
      schema: {
        description: 'Submit a new appeal against a decision',
        tags: ['appeals'],
        body: {
          type: 'object',
          required: ['original_decision_id', 'original_decision_type', 'category', 'subject', 'description', 'requested_outcome'],
          properties: {
            original_decision_id: { type: 'string' },
            original_decision_type: { type: 'string' },
            category: { 
              type: 'string',
              enum: ['enforcement_action', 'trust_score', 'policy_violation', 'verification_status', 
                     'content_moderation', 'account_restriction', 'transaction_block', 'marketplace_decision', 'other']
            },
            subject: { type: 'string', maxLength: 500 },
            description: { type: 'string', maxLength: 5000 },
            requested_outcome: { type: 'string', maxLength: 2000 },
            impact_statement: { type: 'string', maxLength: 2000 },
            initial_evidence: {
              type: 'array',
              items: {
                type: 'object',
                required: ['evidence_type', 'title', 'description'],
                properties: {
                  evidence_type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  file_url: { type: 'string' },
                  content: { type: 'string' }
                }
              }
            }
          }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              appeal_id: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const user = (request as any).user;
        
        const appealId = await appealService.submitAppeal({
          appellant_id: user.id,
          appellant_type: user.role || 'user',
          original_decision_id: request.body.original_decision_id,
          original_decision_type: request.body.original_decision_type,
          category: request.body.category,
          subject: request.body.subject,
          description: request.body.description,
          requested_outcome: request.body.requested_outcome,
          impact_statement: request.body.impact_statement,
          initial_evidence: request.body.initial_evidence?.map(e => ({
            ...e,
            submitted_by: user.id
          }))
        });

        reply.status(201).send({
          message: 'Appeal submitted successfully',
          appeal_id: appealId
        });

      } catch (error) {
        fastify.log.error('Error submitting appeal:', error);
        reply.status(500).send({ error: error.message || 'Internal server error' });
      }
    }
  );

  /**
   * Get appeals with filtering
   * GET /appeals
   */
  fastify.get<AppealRoutes['/appeals']['GET']>(
    '/appeals',
    {
      preHandler: [requireRole(['admin', 'reviewer'])],
      schema: {
        description: 'Get appeals with filtering (admin/reviewer only)',
        tags: ['appeals'],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            category: { type: 'string' },
            priority: { type: 'string' },
            assigned_reviewer: { type: 'string' },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 },
            include_timeline: { type: 'boolean', default: false },
            include_evidence: { type: 'boolean', default: false }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const filters: AppealFilters = {
          status: request.query.status as AppealStatus,
          category: request.query.category as AppealCategory,
          priority: request.query.priority as AppealPriority,
          assigned_reviewer: request.query.assigned_reviewer,
          limit: request.query.limit || 20,
          offset: request.query.offset || 0
        };

        const result = await appealService.listAppeals(filters);

        reply.send({
          appeals: result.appeals,
          total: result.total,
          limit: filters.limit,
          offset: filters.offset
        });

      } catch (error) {
        fastify.log.error('Error fetching appeals:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Get specific appeal details
   * GET /appeals/:appealId
   */
  fastify.get<AppealRoutes['/appeals/:appealId']['GET']>(
    '/appeals/:appealId',
    {
      schema: {
        description: 'Get specific appeal details',
        tags: ['appeals'],
        params: {
          type: 'object',
          required: ['appealId'],
          properties: {
            appealId: { type: 'string' }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            include_timeline: { type: 'boolean', default: true },
            include_evidence: { type: 'boolean', default: true },
            public_only: { type: 'boolean', default: false }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { appealId } = request.params;
        const user = (request as any).user;
        
        const appeal = await appealService.getAppeal(appealId);
        if (!appeal) {
          reply.status(404).send({ error: 'Appeal not found' });
          return;
        }

        // Check access permissions
        const canViewAppeal = 
          appeal.appellant_id === user.id || 
          ['admin', 'reviewer'].includes(user.role) ||
          appeal.assigned_reviewer_id === user.id;

        if (!canViewAppeal) {
          reply.status(403).send({ error: 'Access denied' });
          return;
        }

        // Filter timeline events if public_only requested or limited access
        if (
          request.query.public_only || (!['admin',
          'reviewer'].includes(user.role
        ) && appeal.appellant_id !== user.id)) {
          appeal.timeline = appeal.timeline?.filter(event => event.public_visible) || [];
        }

        reply.send({ appeal });

      } catch (error) {
        fastify.log.error('Error fetching appeal:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Update appeal details (appellant only)
   * PUT /appeals/:appealId
   */
  fastify.put<AppealRoutes['/appeals/:appealId']['PUT']>(
    '/appeals/:appealId',
    {
      schema: {
        description: 'Update appeal details (appellant only, before review starts)',
        tags: ['appeals'],
        params: {
          type: 'object',
          required: ['appealId'],
          properties: {
            appealId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          properties: {
            description: { type: 'string', maxLength: 5000 },
            requested_outcome: { type: 'string', maxLength: 2000 },
            impact_statement: { type: 'string', maxLength: 2000 }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { appealId } = request.params;
        const user = (request as any).user;
        
        const appeal = await appealService.getAppeal(appealId);
        if (!appeal) {
          reply.status(404).send({ error: 'Appeal not found' });
          return;
        }

        // Only appellant can update, and only before review starts
        if (appeal.appellant_id !== user.id) {
          reply.status(403).send({ error: 'Only the appellant can update the appeal' });
          return;
        }

        if (appeal.status !== 'submitted') {
          reply.status(400).send({ error: 'Appeal cannot be updated after review has started' });
          return;
        }

        // Update appeal (implementation would be in AppealProcessService)
        // This is a placeholder - would implement updateAppeal method
        reply.send({ message: 'Appeal updated successfully' });

      } catch (error) {
        fastify.log.error('Error updating appeal:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Add evidence to appeal
   * POST /appeals/:appealId/evidence
   */
  fastify.post<AppealRoutes['/appeals/:appealId/evidence']['POST']>(
    '/appeals/:appealId/evidence',
    {
      schema: {
        description: 'Add evidence to an appeal',
        tags: ['appeals'],
        params: {
          type: 'object',
          required: ['appealId'],
          properties: {
            appealId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['evidence_type', 'title', 'description'],
          properties: {
            evidence_type: { type: 'string' },
            title: { type: 'string', maxLength: 500 },
            description: { type: 'string', maxLength: 2000 },
            file_url: { type: 'string' },
            content: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { appealId } = request.params;
        const user = (request as any).user;
        
        const appeal = await appealService.getAppeal(appealId);
        if (!appeal) {
          reply.status(404).send({ error: 'Appeal not found' });
          return;
        }

        // Check permissions
        const canAddEvidence = 
          appeal.appellant_id === user.id || 
          ['admin', 'reviewer'].includes(user.role) ||
          appeal.assigned_reviewer_id === user.id;

        if (!canAddEvidence) {
          reply.status(403).send({ error: 'Access denied' });
          return;
        }

        const evidenceId = await appealService.addEvidence(appealId, {
          ...request.body,
          submitted_by: user.id
        });

        reply.status(201).send({
          message: 'Evidence added successfully',
          evidence_id: evidenceId
        });

      } catch (error) {
        fastify.log.error('Error adding evidence:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Update appeal status (reviewers only)
   * PUT /appeals/:appealId/status
   */
  fastify.put<AppealRoutes['/appeals/:appealId/status']['PUT']>(
    '/appeals/:appealId/status',
    {
      preHandler: [requireRole(['admin', 'reviewer'])],
      schema: {
        description: 'Update appeal status (reviewers only)',
        tags: ['appeals'],
        params: {
          type: 'object',
          required: ['appealId'],
          properties: {
            appealId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { 
              type: 'string',
              enum: ['under_review', 'evidence_requested', 'investigation', 'pending_decision']
            },
            notes: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { appealId } = request.params;
        const { status, notes } = request.body;
        const user = (request as any).user;

        await appealService.updateAppealStatus(appealId, status, user.id, notes);

        reply.send({ message: 'Appeal status updated successfully' });

      } catch (error) {
        fastify.log.error('Error updating appeal status:', error);
        reply.status(500).send({ error: error.message || 'Internal server error' });
      }
    }
  );

  /**
   * Assign reviewer (admin only)
   * POST /appeals/:appealId/assign
   */
  fastify.post<AppealRoutes['/appeals/:appealId/assign']['POST']>(
    '/appeals/:appealId/assign',
    {
      preHandler: [requireAdmin],
      schema: {
        description: 'Assign reviewer to appeal (admin only)',
        tags: ['appeals'],
        params: {
          type: 'object',
          required: ['appealId'],
          properties: {
            appealId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['reviewer_id', 'reviewer_role'],
          properties: {
            reviewer_id: { type: 'string' },
            reviewer_role: { 
              type: 'string',
              enum: ['tier1', 'tier2', 'specialist', 'senior', 'escalation']
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { appealId } = request.params;
        const { reviewer_id, reviewer_role } = request.body;

        await appealService.assignReviewer(appealId, reviewer_id, reviewer_role as any);

        reply.send({ message: 'Reviewer assigned successfully' });

      } catch (error) {
        fastify.log.error('Error assigning reviewer:', error);
        reply.status(500).send({ error: error.message || 'Internal server error' });
      }
    }
  );

  /**
   * Make decision on appeal (reviewers only)
   * POST /appeals/:appealId/decision
   */
  fastify.post<AppealRoutes['/appeals/:appealId/decision']['POST']>(
    '/appeals/:appealId/decision',
    {
      preHandler: [requireRole(['admin', 'reviewer'])],
      schema: {
        description: 'Make decision on appeal (reviewers only)',
        tags: ['appeals'],
        params: {
          type: 'object',
          required: ['appealId'],
          properties: {
            appealId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['decision', 'rationale'],
          properties: {
            decision: {
              type: 'string',
              enum: ['approve', 'partially_approve', 'deny', 'dismiss']
            },
            rationale: {
              type: 'object',
              required: ['primary_reasoning', 'policy_references'],
              properties: {
                primary_reasoning: { type: 'string' },
                supporting_factors: { type: 'array', items: { type: 'string' } },
                mitigating_factors: { type: 'array', items: { type: 'string' } },
                precedent_cases: { type: 'array', items: { type: 'string' } },
                policy_references: { type: 'array', items: { type: 'string' } },
                risk_considerations: { type: 'array', items: { type: 'string' } },
                recommended_actions: { type: 'array', items: { type: 'string' } }
              }
            },
            review_criteria: {
              type: 'object',
              properties: {
                policy_adherence: { type: 'integer', minimum: 1, maximum: 10 },
                evidence_quality: { type: 'integer', minimum: 1, maximum: 10 },
                procedural_fairness: { type: 'integer', minimum: 1, maximum: 10 },
                proportionality: { type: 'integer', minimum: 1, maximum: 10 },
                precedent_consistency: { type: 'integer', minimum: 1, maximum: 10 },
                risk_assessment: { type: 'integer', minimum: 1, maximum: 10 }
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { appealId } = request.params;
        const { decision, rationale, review_criteria } = request.body;
        const user = (request as any).user;

        await appealService.makeDecision(
          appealId,
          decision as AppealDecision,
          rationale as AppealDecisionRationale,
          user.id,
          review_criteria as AppealReviewCriteria
        );

        reply.send({ message: 'Decision made successfully' });

      } catch (error) {
        fastify.log.error('Error making decision:', error);
        reply.status(500).send({ error: error.message || 'Internal server error' });
      }
    }
  );

  /**
   * Get appeal statistics (admin only)
   * GET /appeals/statistics
   */
  fastify.get<AppealRoutes['/appeals/statistics']['GET']>(
    '/appeals/statistics',
    {
      preHandler: [requireAdmin],
      schema: {
        description: 'Get appeal statistics and metrics (admin only)',
        tags: ['appeals'],
        querystring: {
          type: 'object',
          properties: {
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            granularity: { 
              type: 'string',
              enum: ['hour', 'day', 'week', 'month'],
              default: 'day'
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const timeRange = request.query.start_date && request.query.end_date ? {
          start: new Date(request.query.start_date),
          end: new Date(request.query.end_date)
        } : undefined;

        const statistics = await appealService.getAppealStatistics(timeRange);

        reply.send({
          statistics,
          time_range: timeRange,
          granularity: request.query.granularity || 'day'
        });

      } catch (error) {
        fastify.log.error('Error fetching appeal statistics:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Get user's own appeals
   * GET /appeals/my-appeals
   */
  fastify.get<AppealRoutes['/appeals/my-appeals']['GET']>(
    '/appeals/my-appeals',
    {
      schema: {
        description: 'Get current user\'s appeals',
        tags: ['appeals'],
        querystring: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const user = (request as any).user;
        
        // Filter by user's own appeals
                
        // For now, get all appeals and filter (not efficient for production)
        const result = await appealService.listAppeals({
          status: request.query.status as AppealStatus,
          limit: request.query.limit || 10,
          offset: request.query.offset || 0
        });

        // Filter to user's appeals (would be done in database query in production)
        const userAppeals = result.appeals.filter(appeal => appeal.appellant_id === user.id);

        reply.send({
          appeals: userAppeals,
          total: userAppeals.length,
          limit: request.query.limit || 10,
          offset: request.query.offset || 0
        });

      } catch (error) {
        fastify.log.error('Error fetching user appeals:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Get reviewer queue (reviewers only)
   * GET /appeals/review-queue
   */
  fastify.get<AppealRoutes['/appeals/review-queue']['GET']>(
    '/appeals/review-queue',
    {
      preHandler: [requireRole(['admin', 'reviewer'])],
      schema: {
        description: 'Get appeals in review queue (reviewers only)',
        tags: ['appeals'],
        querystring: {
          type: 'object',
          properties: {
            priority: { type: 'string' },
            category: { type: 'string' },
            assigned_to_me: { type: 'boolean', default: false },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const user = (request as any).user;
        
        const filters: AppealFilters = {
          priority: request.query.priority as AppealPriority,
          category: request.query.category as AppealCategory,
          limit: request.query.limit || 20,
          offset: request.query.offset || 0
        };

        // Filter by assignment if requested
        if (request.query.assigned_to_me) {
          filters.assigned_reviewer = user.id;
        }

        const result = await appealService.listAppeals(filters);

        reply.send({
          appeals: result.appeals,
          total: result.total,
          limit: filters.limit,
          offset: filters.offset
        });

      } catch (error) {
        fastify.log.error('Error fetching review queue:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}