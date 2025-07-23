/**
 * Automated Enforcement API Routes - Epic 17
 * 
 * REST API endpoints for the automated enforcement system, providing
 * administrative access to enforcement actions, policy management,
 * and manual enforcement triggers.
 * 
 * Task: E17-1753114397380-E8827E - Implement automated enforcement
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AutomatedEnforcementService } from '../services/trust/AutomatedEnforcementService';
import { TrustScoreService } from '../services/trust/TrustScoreService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { requireAuth, requireAdmin } from '../middleware/auth';

interface EnforcementRoutes {
  '/enforcement/actions': {
    GET: {
      Querystring: {
        entity_type?: 'user' | 'template' | 'transaction';
        entity_id?: string;
        action_type?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        limit?: number;
        offset?: number;
        include_expired?: boolean;
      };
    };
  };
  '/enforcement/trigger': {
    POST: {
      Body: {
        entity_type: 'user' | 'template' | 'transaction';
        entity_id: string;
        reason?: string;
      };
    };
  };
  '/enforcement/suspicious-activity': {
    POST: {
      Body: {
        type: 'fraud' | 'abuse' | 'violation' | 'security' | 'quality';
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        evidence: string[];
        user_id?: string;
        template_id?: string;
        transaction_id?: string;
      };
    };
  };
  '/enforcement/policies': {
    GET: {};
    POST: {
      Body: {
        policy_id: string;
        name: string;
        description?: string;
        enabled: boolean;
        policy_config: any;
      };
    };
  };
  '/enforcement/policies/:policyId': {
    PUT: {
      Params: { policyId: string };
      Body: {
        name?: string;
        description?: string;
        enabled?: boolean;
        policy_config?: any;
      };
    };
    DELETE: {
      Params: { policyId: string };
    };
  };
  '/enforcement/actions/:actionId/review': {
    POST: {
      Params: { actionId: string };
      Body: {
        action: 'approve' | 'reject' | 'modify';
        admin_notes?: string;
        modifications?: any;
      };
    };
  };
  '/enforcement/actions/:actionId/reverse': {
    POST: {
      Params: { actionId: string };
      Body: {
        reason: string;
        admin_notes?: string;
      };
    };
  };
}

export default async function automatedEnforcementRoutes(fastify: FastifyInstance) {
  // Initialize services
  const db = new DatabaseService(process.env.DATABASE_URL!);
  const auditService = new AuditService(db);
  const trustScoreService = new TrustScoreService(
    db,
    {} as any, // analyticsService placeholder
    {} as any, // contentQualityService placeholder
    {} as any  // qualityService placeholder
  );
  const enforcementService = new AutomatedEnforcementService(
    db,
    trustScoreService,
    auditService
  );

  // Middleware for admin-only routes
  fastify.addHook('preHandler', async (request, reply) => {
    if (request.url.startsWith('/enforcement/')) {
      await requireAuth(request, reply);
      
      // Most enforcement routes require admin access
      if (!request.url.includes('/actions') || 
          request.method !== 'GET' ||
          request.url.includes('/trigger') ||
          request.url.includes('/policies') ||
          request.url.includes('/review') ||
          request.url.includes('/reverse')) {
        await requireAdmin(request, reply);
      }
    }
  });

  /**
   * Get enforcement actions
   * GET /enforcement/actions
   */
  fastify.get<EnforcementRoutes['/enforcement/actions']['GET']>(
    '/enforcement/actions',
    {
      schema: {
        description: 'Get enforcement actions with filtering options',
        tags: ['enforcement'],
        querystring: {
          type: 'object',
          properties: {
            entity_type: { type: 'string', enum: ['user', 'template', 'transaction'] },
            entity_id: { type: 'string' },
            action_type: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'integer', minimum: 0, default: 0 },
            include_expired: { type: 'boolean', default: false }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              actions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    actionId: { type: 'string' },
                    entityType: { type: 'string' },
                    entityId: { type: 'string' },
                    actionType: { type: 'string' },
                    severity: { type: 'string' },
                    reason: { type: 'string' },
                    triggeredBy: { type: 'string' },
                    autoApplied: { type: 'boolean' },
                    actionTaken: { type: 'boolean' },
                    actionTimestamp: { type: 'string', format: 'date-time' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    reviewRequired: { type: 'boolean' }
                  }
                }
              },
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const {
          entity_type,
          entity_id,
          action_type,
          severity,
          limit = 20,
          offset = 0,
          include_expired = false
        } = request.query;

        // Build query conditions
        let whereClause = '';
        const params: any[] = [];
        const conditions: string[] = [];

        if (entity_type) {
          conditions.push(`entity_type = $${params.length + 1}`);
          params.push(entity_type);
        }

        if (entity_id) {
          conditions.push(`entity_id = $${params.length + 1}`);
          params.push(entity_id);
        }

        if (action_type) {
          conditions.push(`action_type = $${params.length + 1}`);
          params.push(action_type);
        }

        if (severity) {
          conditions.push(`severity = $${params.length + 1}`);
          params.push(severity);
        }

        if (!include_expired) {
          conditions.push('(expires_at IS NULL OR expires_at > NOW())');
        }

        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }

        // Get actions with total count
        const actionsResult = await db.query(`
          SELECT *, COUNT(*) OVER() AS total_count
          FROM enforcement_actions
          ${whereClause}
          ORDER BY created_at DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `, [...params, limit, offset]);

        const actions = actionsResult.rows.map(row => ({
          actionId: row.action_id,
          entityType: row.entity_type,
          entityId: row.entity_id,
          actionType: row.action_type,
          severity: row.severity,
          reason: row.reason,
          triggeredBy: row.triggered_by,
          triggerDetails: JSON.parse(row.trigger_details || '{}'),
          autoApplied: row.auto_applied,
          actionTaken: row.action_taken,
          actionTimestamp: row.action_timestamp,
          expiresAt: row.expires_at,
          reviewRequired: row.review_required,
          adminNotes: row.admin_notes
        }));

        const total = actionsResult.rows.length > 0 ? parseInt(actionsResult.rows[0].total_count) : 0;

        reply.send({
          actions,
          total,
          limit,
          offset
        });

      } catch (error) {
        fastify.log.error('Error fetching enforcement actions:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Trigger manual enforcement evaluation
   * POST /enforcement/trigger
   */
  fastify.post<EnforcementRoutes['/enforcement/trigger']['POST']>(
    '/enforcement/trigger',
    {
      schema: {
        description: 'Manually trigger enforcement evaluation for an entity',
        tags: ['enforcement'],
        body: {
          type: 'object',
          required: ['entity_type', 'entity_id'],
          properties: {
            entity_type: { type: 'string', enum: ['user', 'template', 'transaction'] },
            entity_id: { type: 'string' },
            reason: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              actions: {
                type: 'array',
                items: { type: 'object' }
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { entity_type, entity_id, reason } = request.body;
        const userId = (request as any).user.id;

        // Trigger enforcement evaluation
        const actions = await enforcementService.triggerEnforcementEvaluation(
          entity_type,
          entity_id
        );

        // Log the manual trigger
        await auditService.logEvent({
          userId,
          action: 'manual_enforcement_trigger',
          details: {
            entity_type,
            entity_id,
            reason,
            actions_generated: actions.length
          },
          severity: 'info'
        });

        reply.send({
          message: `Enforcement evaluation triggered for ${entity_type} ${entity_id}`,
          actions
        });

      } catch (error) {
        fastify.log.error('Error triggering enforcement evaluation:', error);
        reply.status(500).send({ error: error.message || 'Internal server error' });
      }
    }
  );

  /**
   * Report suspicious activity
   * POST /enforcement/suspicious-activity
   */
  fastify.post<EnforcementRoutes['/enforcement/suspicious-activity']['POST']>(
    '/enforcement/suspicious-activity',
    {
      schema: {
        description: 'Report suspicious activity for automated enforcement processing',
        tags: ['enforcement'],
        body: {
          type: 'object',
          required: ['type', 'severity', 'description', 'evidence'],
          properties: {
            type: { type: 'string', enum: ['fraud', 'abuse', 'violation', 'security', 'quality'] },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            description: { type: 'string', minLength: 10 },
            evidence: { type: 'array', items: { type: 'string' } },
            user_id: { type: 'string' },
            template_id: { type: 'string' },
            transaction_id: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const report = request.body;
        const userId = (request as any).user.id;

        // Process suspicious activity
        const actions = await enforcementService.processSuspiciousActivity(report);

        // Log the report
        await auditService.logEvent({
          userId,
          action: 'suspicious_activity_reported',
          details: {
            report_type: report.type,
            severity: report.severity,
            entities: {
              user_id: report.user_id,
              template_id: report.template_id,
              transaction_id: report.transaction_id
            },
            actions_generated: actions.length
          },
          severity: report.severity === 'critical' ? 'error' : 'warning'
        });

        reply.send({
          message: 'Suspicious activity report processed',
          actions
        });

      } catch (error) {
        fastify.log.error('Error processing suspicious activity report:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Get enforcement policies
   * GET /enforcement/policies
   */
  fastify.get<EnforcementRoutes['/enforcement/policies']['GET']>(
    '/enforcement/policies',
    {
      schema: {
        description: 'Get all enforcement policies',
        tags: ['enforcement'],
        response: {
          200: {
            type: 'object',
            properties: {
              policies: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    policy_id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    enabled: { type: 'boolean' },
                    policy_config: { type: 'object' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const result = await db.query(`
          SELECT * FROM enforcement_policies 
          ORDER BY created_at DESC
        `);

        reply.send({
          policies: result.rows
        });

      } catch (error) {
        fastify.log.error('Error fetching enforcement policies:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Create enforcement policy
   * POST /enforcement/policies
   */
  fastify.post<EnforcementRoutes['/enforcement/policies']['POST']>(
    '/enforcement/policies',
    {
      schema: {
        description: 'Create a new enforcement policy',
        tags: ['enforcement'],
        body: {
          type: 'object',
          required: ['policy_id', 'name', 'enabled', 'policy_config'],
          properties: {
            policy_id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            enabled: { type: 'boolean' },
            policy_config: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { policy_id, name, description, enabled, policy_config } = request.body;
        const userId = (request as any).user.id;

        const result = await db.query(`
          INSERT INTO enforcement_policies (policy_id, name, description, enabled, policy_config)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [policy_id, name, description, enabled, JSON.stringify(policy_config)]);

        // Log policy creation
        await auditService.logEvent({
          userId,
          action: 'enforcement_policy_created',
          details: {
            policy_id,
            name,
            enabled
          },
          severity: 'info'
        });

        reply.status(201).send({
          message: 'Enforcement policy created',
          policy: result.rows[0]
        });

      } catch (error) {
        if (error.code === '23505') { // Unique violation
          reply.status(409).send({ error: 'Policy ID already exists' });
        } else {
          fastify.log.error('Error creating enforcement policy:', error);
          reply.status(500).send({ error: 'Internal server error' });
        }
      }
    }
  );

  /**
   * Update enforcement policy
   * PUT /enforcement/policies/:policyId
   */
  fastify.put<EnforcementRoutes['/enforcement/policies/:policyId']['PUT']>(
    '/enforcement/policies/:policyId',
    {
      schema: {
        description: 'Update an enforcement policy',
        tags: ['enforcement'],
        params: {
          type: 'object',
          required: ['policyId'],
          properties: {
            policyId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            enabled: { type: 'boolean' },
            policy_config: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { policyId } = request.params;
        const updates = request.body;
        const userId = (request as any).user.id;

        // Build update query
        const updateFields: string[] = [];
        const params: any[] = [];
        
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined) {
            params.push(key === 'policy_config' ? JSON.stringify(value) : value);
            updateFields.push(`${key} = $${params.length}`);
          }
        });

        if (updateFields.length === 0) {
          reply.status(400).send({ error: 'No valid update fields provided' });
          return;
        }

        updateFields.push('updated_at = NOW()');
        params.push(policyId);

        const result = await db.query(`
          UPDATE enforcement_policies 
          SET ${updateFields.join(', ')}
          WHERE policy_id = $${params.length}
          RETURNING *
        `, params);

        if (result.rows.length === 0) {
          reply.status(404).send({ error: 'Policy not found' });
          return;
        }

        // Log policy update
        await auditService.logEvent({
          userId,
          action: 'enforcement_policy_updated',
          details: {
            policy_id: policyId,
            updates: Object.keys(updates)
          },
          severity: 'info'
        });

        reply.send({
          message: 'Enforcement policy updated',
          policy: result.rows[0]
        });

      } catch (error) {
        fastify.log.error('Error updating enforcement policy:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );

  /**
   * Delete enforcement policy
   * DELETE /enforcement/policies/:policyId
   */
  fastify.delete<EnforcementRoutes['/enforcement/policies/:policyId']['DELETE']>(
    '/enforcement/policies/:policyId',
    {
      schema: {
        description: 'Delete an enforcement policy',
        tags: ['enforcement'],
        params: {
          type: 'object',
          required: ['policyId'],
          properties: {
            policyId: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { policyId } = request.params;
        const userId = (request as any).user.id;

        const result = await db.query(`
          DELETE FROM enforcement_policies 
          WHERE policy_id = $1
          RETURNING *
        `, [policyId]);

        if (result.rows.length === 0) {
          reply.status(404).send({ error: 'Policy not found' });
          return;
        }

        // Log policy deletion
        await auditService.logEvent({
          userId,
          action: 'enforcement_policy_deleted',
          details: {
            policy_id: policyId,
            name: result.rows[0].name
          },
          severity: 'warning'
        });

        reply.send({
          message: 'Enforcement policy deleted'
        });

      } catch (error) {
        fastify.log.error('Error deleting enforcement policy:', error);
        reply.status(500).send({ error: 'Internal server error' });
      }
    }
  );
}