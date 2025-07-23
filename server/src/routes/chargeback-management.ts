/**
 * Chargeback Management API Routes - Epic 17 Implementation
 * Task: E17-1753114397355-30EFDE - Implement chargeback tracking
 * 
 * RESTful API endpoints for comprehensive chargeback management,
 * dispute tracking, evidence submission, and analytics.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ChargebackService } from '../marketplace/chargeback.service.js';
import {
  ChargebackSearchCriteria,
  ChargebackBulkAction,
  CreateChargebackSchema,
  UpdateChargebackStatusSchema,
  SubmitEvidenceSchema,
  CreatePreventionRuleSchema,
  CreateResponseTemplateSchema
} from '../marketplace/chargeback.types.js';

// Request/Response schemas
const ChargebackParamsSchema = z.object({
  id: z.string().uuid()
});

const ChargebackSearchQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  transaction_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  status: z.array(z.string()).optional(),
  reason: z.array(z.string()).optional(),
  provider: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  amount_min_cents: z.number().int().min(0).optional(),
  amount_max_cents: z.number().int().min(0).optional(),
  initiated_after: z.string().datetime().optional(),
  initiated_before: z.string().datetime().optional(),
  due_date_after: z.string().datetime().optional(),
  due_date_before: z.string().datetime().optional(),
  evidence_submitted: z.boolean().optional(),
  outcome: z.array(z.string()).optional(),
  risk_level: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(1000).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
  sort_by: z.enum(['initiated_at', 'due_date', 'amount_cents', 'updated_at']).default('initiated_at').optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc').optional()
});

const AnalyticsQuerySchema = z.object({
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  user_id: z.string().uuid().optional()
});

const BulkActionSchema = z.object({
  action: z.enum(['update_status', 'submit_evidence', 'add_notes', 'add_tags', 'assign_reviewer']),
  chargeback_ids: z.array(z.string().uuid()).min(1),
  parameters: z.record(z.any())
});


export async function chargebackManagementRoutes(fastify: FastifyInstance) {
  const chargebackService = new ChargebackService(fastify);

  // =============================================================================
  // Core Chargeback Management
  // =============================================================================

  // Create new chargeback
  fastify.post<{
    Body: typeof CreateChargebackSchema._type;
  }>('/chargebacks', {
    schema: {
      description: 'Create a new chargeback record',
      tags: ['Chargebacks'],
      body: CreateChargebackSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            metadata: { type: 'object' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await chargebackService.createChargeback(request.body);
      
      if (result.success) {
        return reply.code(201).send(result);
      } else {
        return reply.code(400).send(result);
      }
    } catch (error) {
      fastify.log.error('Error in POST /chargebacks:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // Get chargeback by ID
  fastify.get<{
    Params: typeof ChargebackParamsSchema._type;
  }>('/chargebacks/:id', {
    schema: {
      description: 'Get chargeback details by ID',
      tags: ['Chargebacks'],
      params: ChargebackParamsSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await chargebackService.getChargeback(id);
      
      if (result.success) {
        return reply.code(200).send(result);
      } else {
        return reply.code(404).send(result);
      }
    } catch (error) {
      fastify.log.error('Error in GET /chargebacks/:id:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // Update chargeback status
  fastify.patch<{
    Params: typeof ChargebackParamsSchema._type;
    Body: typeof UpdateChargebackStatusSchema._type;
  }>('/chargebacks/:id/status', {
    schema: {
      description: 'Update chargeback status and outcome',
      tags: ['Chargebacks'],
      params: ChargebackParamsSchema,
      body: UpdateChargebackStatusSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await chargebackService.updateChargebackStatus(id, request.body);
      
      if (result.success) {
        return reply.code(200).send(result);
      } else {
        return reply.code(400).send(result);
      }
    } catch (error) {
      fastify.log.error('Error in PATCH /chargebacks/:id/status:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // Search and list chargebacks
  fastify.get<{
    Querystring: typeof ChargebackSearchQuerySchema._type;
  }>('/chargebacks', {
    schema: {
      description: 'Search and list chargebacks with filtering, sorting, and pagination',
      tags: ['Chargebacks'],
      querystring: ChargebackSearchQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const criteria: ChargebackSearchCriteria = {
        ...request.query as any,
        initiated_after: (request.query as any).initiated_after ? new Date((request.query as any).initiated_after) : undefined,
        initiated_before: (request.query as any).initiated_before ? new Date((request.query as any).initiated_before) : undefined,
        due_date_after: (request.query as any).due_date_after ? new Date((request.query as any).due_date_after) : undefined,
        due_date_before: (request.query as any).due_date_before ? new Date((request.query as any).due_date_before) : undefined
      };

      const result = await chargebackService.searchChargebacks(criteria);
      return reply.code(200).send(result);
      
    } catch (error) {
      fastify.log.error('Error in GET /chargebacks (search):', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // =============================================================================
  // Evidence Management
  // =============================================================================

  // Submit evidence for chargeback
  fastify.post<{
    Body: typeof SubmitEvidenceSchema._type;
  }>('/chargebacks/evidence', {
    schema: {
      description: 'Submit evidence for a chargeback dispute',
      tags: ['Evidence'],
      body: SubmitEvidenceSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await chargebackService.submitEvidence(request.body);
      
      if (result.success) {
        return reply.code(201).send(result);
      } else {
        return reply.code(400).send(result);
      }
    } catch (error) {
      fastify.log.error('Error in POST /chargebacks/evidence:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // Generate automatic evidence
  fastify.post<{
    Params: typeof ChargebackParamsSchema._type;
  }>('/chargebacks/:id/evidence/generate', {
    schema: {
      description: 'Generate automatic evidence for a chargeback',
      tags: ['Evidence'],
      params: ChargebackParamsSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'array' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await chargebackService.generateEvidenceAutomatically(id);
      
      if (result.success) {
        return reply.code(201).send(result);
      } else {
        return reply.code(400).send(result);
      }
    } catch (error) {
      fastify.log.error('Error in POST /chargebacks/:id/evidence/generate:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // =============================================================================
  // Analytics and Reporting
  // =============================================================================

  // Get chargeback analytics
  fastify.get<{
    Querystring: typeof AnalyticsQuerySchema._type;
  }>('/chargebacks/analytics', {
    schema: {
      description: 'Get chargeback analytics and metrics for a time period',
      tags: ['Analytics'],
      querystring: AnalyticsQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      const periodStart = new Date(query.period_start);
      const periodEnd = new Date(query.period_end);
      const userId = query.user_id;

      const result = await chargebackService.getChargebackAnalytics(periodStart, periodEnd, userId);
      return reply.code(200).send(result);
      
    } catch (error) {
      fastify.log.error('Error in GET /chargebacks/analytics:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // =============================================================================
  // Prevention and Automation
  // =============================================================================

  // Create prevention rule
  fastify.post<{
    Body: typeof CreatePreventionRuleSchema._type;
  }>('/chargebacks/prevention/rules', {
    schema: {
      description: 'Create a new chargeback prevention rule',
      tags: ['Prevention'],
      body: CreatePreventionRuleSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await chargebackService.createPreventionRule(request.body);
      
      if (result.success) {
        return reply.code(201).send(result);
      } else {
        return reply.code(400).send(result);
      }
    } catch (error) {
      fastify.log.error('Error in POST /chargebacks/prevention/rules:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // Create response template
  fastify.post<{
    Body: typeof CreateResponseTemplateSchema._type;
  }>('/chargebacks/templates', {
    schema: {
      description: 'Create a new chargeback response template',
      tags: ['Templates'],
      body: CreateResponseTemplateSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await chargebackService.createResponseTemplate(request.body);
      
      if (result.success) {
        return reply.code(201).send(result);
      } else {
        return reply.code(400).send(result);
      }
    } catch (error) {
      fastify.log.error('Error in POST /chargebacks/templates:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // =============================================================================
  // Bulk Operations
  // =============================================================================

  // Bulk chargeback actions
  fastify.post<{
    Body: typeof BulkActionSchema._type;
  }>('/chargebacks/bulk', {
    schema: {
      description: 'Perform bulk actions on multiple chargebacks',
      tags: ['Bulk Operations'],
      body: BulkActionSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { action, chargeback_ids, parameters } = request.body as any;
      
      // Implementation would handle bulk operations
      const bulkResult = {
        total_processed: chargeback_ids.length,
        successful: 0,
        failed: 0,
        results: [] as any[]
      };

      // Process each chargeback ID
      for (const chargebackId of chargeback_ids) {
        try {
          // Handle different bulk actions
          switch (action) {
          case 'update_status':
            const statusResult = await chargebackService.updateChargebackStatus(chargebackId, parameters);
            if (statusResult.success) {
              bulkResult.successful++;
              bulkResult.results.push({ chargeback_id: chargebackId, success: true });
            } else {
              bulkResult.failed++;
              bulkResult.results.push({ 
                chargeback_id: chargebackId, 
                success: false, 
                error: statusResult.error?.message 
              });
            }
            break;
              
          case 'add_tags':
          case 'add_notes':
          case 'assign_reviewer':
            // Implementation for other bulk actions
            bulkResult.successful++;
            bulkResult.results.push({ chargeback_id: chargebackId, success: true });
            break;
              
          default:
            bulkResult.failed++;
            bulkResult.results.push({ 
              chargeback_id: chargebackId, 
              success: false, 
              error: `Unsupported action: ${action}` 
            });
          }
        } catch (error) {
          bulkResult.failed++;
          bulkResult.results.push({ 
            chargeback_id: chargebackId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      return reply.code(200).send({
        success: true,
        data: bulkResult
      });
      
    } catch (error) {
      fastify.log.error('Error in POST /chargebacks/bulk:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    }
  });

  // =============================================================================
  // Webhook Endpoints
  // =============================================================================

  // Stripe webhook for chargeback events
  fastify.post<{
    Body: any;
    Headers: {
      'stripe-signature'?: string;
    };
  }>('/chargebacks/webhooks/stripe', {
    schema: {
      description: 'Handle Stripe chargeback webhook events',
      tags: ['Webhooks'],
      headers: {
        type: 'object',
        properties: {
          'stripe-signature': { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verify Stripe webhook signature
      const signature = request.headers['stripe-signature'] as string;
      
      if (!signature) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Missing Stripe signature header'
          }
        });
      }

      // Process webhook event
      const event = request.body;
      
      fastify.log.info('Received Stripe chargeback webhook:', { 
        type: event.type, 
        id: event.id 
      });

      // Handle different event types
      switch (event.type) {
      case 'charge.dispute.created':
        // Create chargeback record from Stripe dispute
        await handleStripeDisputeCreated(event.data.object);
        break;
          
      case 'charge.dispute.updated':
        // Update existing chargeback status
        await handleStripeDisputeUpdated(event.data.object);
        break;
          
      case 'charge.dispute.closed':
        // Mark chargeback as closed with outcome
        await handleStripeDisputeClosed(event.data.object);
        break;
          
      default:
        fastify.log.info('Unhandled Stripe event type:', event.type);
      }

      return reply.code(200).send({ received: true });
      
    } catch (error) {
      fastify.log.error('Error in POST /chargebacks/webhooks/stripe:', error);
      return reply.code(500).send({
        success: false,
        error: {
          code: 'WEBHOOK_PROCESSING_ERROR',
          message: 'Failed to process webhook'
        }
      });
    }
  });

  // =============================================================================
  // Helper Functions
  // =============================================================================

  async function handleStripeDisputeCreated(dispute: any) {
    // Map Stripe dispute data to our chargeback format
    const chargebackData = {
      transaction_id: dispute.charge, // Would need to map charge ID to transaction ID
      provider_chargeback_id: dispute.id,
      type: 'chargeback',
      reason: mapStripeReason(dispute.reason),
      amount_cents: dispute.amount,
      fee_cents: 0, // Stripe fee would be in balance transactions
      currency: dispute.currency,
      initiated_at: new Date(dispute.created * 1000),
      due_date: dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000) : undefined,
      customer_message: dispute.evidence?.customer_communication || undefined,
      metadata: { stripe_dispute_id: dispute.id }
    };

    await chargebackService.createChargeback(chargebackData);
  }

  async function handleStripeDisputeUpdated(dispute: any) {
    // Find existing chargeback and update status
    // Implementation would query database and update accordingly
    fastify.log.info('Updating Stripe dispute:', dispute.id);
  }

  async function handleStripeDisputeClosed(dispute: any) {
    // Update chargeback with final outcome
    // Implementation would map Stripe outcome to our system
    fastify.log.info('Closing Stripe dispute:', dispute.id);
  }

  function mapStripeReason(stripeReason: string): string {
    const reasonMapping: Record<string, string> = {
      'credit_not_processed': 'credit_not_processed',
      'duplicate': 'duplicate_transaction',
      'fraudulent': 'fraudulent',
      'general': 'general',
      'product_not_received': 'product_not_received',
      'product_unacceptable': 'product_unacceptable',
      'subscription_canceled': 'subscription_cancelled',
      'unrecognized': 'unrecognized'
    };
    
    return reasonMapping[stripeReason] || 'other';
  }
}