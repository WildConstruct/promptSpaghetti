/**
 * Dispute Admin Controller - Epic 17.5.3
 * 
 * REST API controller for dispute management dashboard and administration.
 * Provides endpoints for dispute handling, evidence management, and analytics.
 * 
 * Task: E17-1753114397361-D755AD - Implement dispute handling
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { 
  DisputeManagementService,
  DisputeCreationRequest,
  DisputeUpdateRequest
} from '../services/dispute/DisputeManagementService';
import {
  DisputeType,
  DisputeCategory,
  DisputeStatus,
  DisputeOutcome,
  DisputeSearchCriteria,
  DisputeEvidence
} from '../../packages/core/types/DisputeTypes';

export interface CreateDisputeRequest {
  transactionId: string;
  type: DisputeType;
  category: DisputeCategory;
  reason: string;
  amount: number;
  description: string;
  customerClaim: string;
  source: string;
  paymentProvider?: string;
  providerDisputeId?: string;
  dueDate?: string;
  initialEvidence?: Array<{
    type: string;
    title: string;
    description: string;
    content: string;
    category?: string;
  }>;
}

export interface UpdateDisputeRequest {
  status?: DisputeStatus;
  assignedTo?: string;
  merchantResponse?: string;
  notes?: string;
  evidence?: Array<{
    type: string;
    title: string;
    description: string;
    content: string;
    category?: string;
  }>;
}

export interface ResolveDisputeRequest {
  outcome: DisputeOutcome;
  finalAmount: number;
  reason: string;
  notes?: string;
}

export interface AddEvidenceRequest {
  evidence: Array<{
    type: string;
    title: string;
    description: string;
    content: string;
    attachments?: string[];
    category?: string;
  }>;
}

export interface CreateResponseRequest {
  responseType: 'accept' | 'contest' | 'partial_accept';
  argument: string;
  evidence?: Array<{
    type: string;
    title: string;
    description: string;
    content: string;
    category?: string;
  }>;
}

export class DisputeAdminController {
  private disputeService: DisputeManagementService;

  constructor(disputeService: DisputeManagementService) {
    this.disputeService = disputeService;
  }

  // =============================================================================
  // Dispute Management Endpoints
  // =============================================================================

  /**
   * GET /admin/disputes
   */
  async getDisputes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      
      const criteria: DisputeSearchCriteria = {
        status: query.status ? (Array.isArray(query.status) ? query.status : [query.status]) : undefined,
        type: query.type ? (Array.isArray(query.type) ? query.type : [query.type]) : undefined,
        category: query.category ? (Array.isArray(query.category) ? query.category : [query.category]) : undefined,
        severity: query.severity ? (Array.isArray(query.severity) ? query.severity : [query.severity]) : undefined,
        assignedTo: query.assignedTo,
        query: query.search,
        dateRange: query.fromDate && query.toDate ? {
          from: new Date(query.fromDate),
          to: new Date(query.toDate)
        } : undefined,
        amountRange: query.minAmount && query.maxAmount ? {
          min: parseFloat(query.minAmount),
          max: parseFloat(query.maxAmount)
        } : undefined,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
        limit: query.limit ? parseInt(query.limit) : 50,
        offset: query.offset ? parseInt(query.offset) : 0
      };

      const result = await this.disputeService.searchDisputes(criteria);
      
      reply.code(200).send({
        success: true,
        data: result.disputes,
        pagination: {
          total: result.total,
          limit: criteria.limit || 50,
          offset: criteria.offset || 0,
          pages: Math.ceil(result.total / (criteria.limit || 50))
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch disputes',
        details: error.message
      });
    }
  }

  /**
   * GET /admin/disputes/:disputeId
   */
  async getDispute(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { disputeId } = request.params as { disputeId: string };
      
      const dispute = await this.disputeService.getDispute(disputeId);
      if (!dispute) {
        return reply.code(404).send({
          success: false,
          error: 'Dispute not found'
        });
      }

      reply.code(200).send({
        success: true,
        data: dispute
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch dispute',
        details: error.message
      });
    }
  }

  /**
   * POST /admin/disputes
   */
  async createDispute(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as CreateDisputeRequest;
      const adminUser = (request as any).user;

      // Validate required fields
      if (!body.transactionId || !body.type || !body.category || !body.amount || !body.description) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: transactionId, type, category, amount, description'
        });
      }

      const disputeRequest: DisputeCreationRequest = {
        transactionId: body.transactionId,
        type: body.type,
        category: body.category,
        reason: body.reason,
        amount: body.amount,
        description: body.description,
        customerClaim: body.customerClaim,
        source: body.source,
        paymentProvider: body.paymentProvider,
        providerDisputeId: body.providerDisputeId,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        evidence: body.initialEvidence || []
      };

      const dispute = await this.disputeService.createDispute(disputeRequest, adminUser?.id || 'admin');

      reply.code(201).send({
        success: true,
        data: dispute,
        message: 'Dispute created successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to create dispute',
        details: error.message
      });
    }
  }

  /**
   * PUT /admin/disputes/:disputeId
   */
  async updateDispute(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { disputeId } = request.params as { disputeId: string };
      const body = request.body as UpdateDisputeRequest;
      const adminUser = (request as any).user;

      const updateRequest: DisputeUpdateRequest = {
        status: body.status,
        assignedTo: body.assignedTo,
        merchantResponse: body.merchantResponse,
        notes: body.notes,
        evidence: body.evidence
      };

      const updatedDispute = await this.disputeService.updateDispute(
        disputeId,
        updateRequest,
        adminUser?.id || 'admin'
      );

      reply.code(200).send({
        success: true,
        data: updatedDispute,
        message: 'Dispute updated successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to update dispute',
        details: error.message
      });
    }
  }

  /**
   * POST /admin/disputes/:disputeId/resolve
   */
  async resolveDispute(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { disputeId } = request.params as { disputeId: string };
      const body = request.body as ResolveDisputeRequest;
      const adminUser = (request as any).user;

      // Validate required fields
      if (!body.outcome || body.finalAmount === undefined || !body.reason) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: outcome, finalAmount, reason'
        });
      }

      const resolution = await this.disputeService.resolveDispute(
        disputeId,
        body.outcome,
        body.finalAmount,
        body.reason,
        adminUser?.id || 'admin'
      );

      reply.code(200).send({
        success: true,
        data: resolution,
        message: 'Dispute resolved successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to resolve dispute',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Evidence Management Endpoints
  // =============================================================================

  /**
   * POST /admin/disputes/:disputeId/evidence
   */
  async addEvidence(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { disputeId } = request.params as { disputeId: string };
      const body = request.body as AddEvidenceRequest;
      const adminUser = (request as any).user;

      if (!body.evidence || body.evidence.length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'No evidence provided'
        });
      }

      const evidence = await this.disputeService.addEvidence(
        disputeId,
        body.evidence,
        adminUser?.id || 'admin'
      );

      reply.code(201).send({
        success: true,
        data: evidence,
        message: 'Evidence added successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to add evidence',
        details: error.message
      });
    }
  }

  /**
   * PUT /admin/disputes/:disputeId/evidence/:evidenceId/verify
   */
  async verifyEvidence(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { disputeId, evidenceId } = request.params as { disputeId: string; evidenceId: string };
      const { verified } = request.body as { verified: boolean };
      const adminUser = (request as any).user;

      await this.disputeService.verifyEvidence(
        disputeId,
        evidenceId,
        verified,
        adminUser?.id || 'admin'
      );

      reply.code(200).send({
        success: true,
        message: `Evidence ${verified ? 'verified' : 'rejected'} successfully`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to verify evidence',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Response Management Endpoints
  // =============================================================================

  /**
   * POST /admin/disputes/:disputeId/response
   */
  async createResponse(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { disputeId } = request.params as { disputeId: string };
      const body = request.body as CreateResponseRequest;
      const adminUser = (request as any).user;

      // Validate required fields
      if (!body.responseType || !body.argument) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: responseType, argument'
        });
      }

      const response = await this.disputeService.createDisputeResponse(
        disputeId,
        body.responseType,
        body.argument,
        body.evidence || [],
        adminUser?.id || 'admin'
      );

      reply.code(201).send({
        success: true,
        data: response,
        message: 'Response created successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to create response',
        details: error.message
      });
    }
  }

  /**
   * POST /admin/disputes/responses/:responseId/submit
   */
  async submitResponse(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { responseId } = request.params as { responseId: string };
      const adminUser = (request as any).user;

      await this.disputeService.submitDisputeResponse(responseId, adminUser?.id || 'admin');

      reply.code(200).send({
        success: true,
        message: 'Response submitted successfully'
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to submit response',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Analytics and Metrics Endpoints
  // =============================================================================

  /**
   * GET /admin/disputes/metrics
   */
  async getDisputeMetrics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const period = query.fromDate && query.toDate ? {
        startDate: new Date(query.fromDate),
        endDate: new Date(query.toDate)
      } : undefined;

      const metrics = await this.disputeService.getDisputeMetrics(period);
      
      reply.code(200).send({
        success: true,
        data: metrics
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch dispute metrics',
        details: error.message
      });
    }
  }

  /**
   * GET /admin/disputes/analytics
   */
  async getDisputeAnalytics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      
      if (!query.fromDate || !query.toDate) {
        return reply.code(400).send({
          success: false,
          error: 'Date range is required: fromDate and toDate'
        });
      }

      const period = {
        startDate: new Date(query.fromDate),
        endDate: new Date(query.toDate)
      };

      const analytics = await this.disputeService.generateDisputeAnalytics(period);
      
      reply.code(200).send({
        success: true,
        data: analytics
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to generate dispute analytics',
        details: error.message
      });
    }
  }

  /**
   * GET /admin/disputes/dashboard
   */
  async getDashboardData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const period = query.period || '30d';
      
      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
      }

      const [
        metrics,
        recentDisputes,
        activeDisputes,
        urgentDisputes
      ] = await Promise.all([
        this.disputeService.getDisputeMetrics({ startDate, endDate }),
        this.disputeService.searchDisputes({
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 10
        }),
        this.disputeService.searchDisputes({
          status: [DisputeStatus.INVESTIGATING, DisputeStatus.AWAITING_RESPONSE, DisputeStatus.UNDER_REVIEW],
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 20
        }),
        this.disputeService.searchDisputes({
          severity: ['high', 'critical'],
          status: [DisputeStatus.RECEIVED, DisputeStatus.INVESTIGATING, DisputeStatus.AWAITING_RESPONSE],
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 10
        })
      ]);

      reply.code(200).send({
        success: true,
        data: {
          metrics,
          recentDisputes: recentDisputes.disputes,
          activeDisputes: activeDisputes.disputes,
          urgentDisputes: urgentDisputes.disputes,
          period: { startDate, endDate }
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch dashboard data',
        details: error.message
      });
    }
  }

  // =============================================================================
  // System Status and Health Endpoints
  // =============================================================================

  /**
   * GET /admin/disputes/health
   */
  async getSystemHealth(request: FastifyRequest, reply: FastifyReply) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {
          disputeService: 'healthy',
          database: 'healthy',
          trustScoring: 'healthy',
          enforcement: 'healthy'
        },
        metrics: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: process.version
        },
        disputeSystemStatus: {
          processingQueue: 'normal',
          responseTime: 'good',
          errorRate: 'low'
        }
      };

      reply.code(200).send({
        success: true,
        data: health
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch system health',
        details: error.message
      });
    }
  }

  /**
   * GET /admin/disputes/enums
   */
  async getDisputeEnums(request: FastifyRequest, reply: FastifyReply) {
    try {
      const enums = {
        disputeTypes: Object.values(DisputeType),
        disputeCategories: Object.values(DisputeCategory),
        disputeStatuses: Object.values(DisputeStatus),
        disputeOutcomes: Object.values(DisputeOutcome),
        severityLevels: ['low', 'medium', 'high', 'critical'],
        evidenceTypes: [
          'transaction_receipt',
          'authorization_proof', 
          'delivery_confirmation',
          'communication_log',
          'refund_proof',
          'product_description',
          'customer_communication',
          'technical_analysis',
          'usage_logs',
          'quality_assessment',
          'policy_documentation',
          'other'
        ],
        evidenceCategories: [
          'transaction',
          'communication',
          'delivery',
          'quality',
          'authorization',
          'other'
        ]
      };

      reply.code(200).send({
        success: true,
        data: enums
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch enums',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  /**
   * Register all routes with Fastify instance
   */
  static registerRoutes(fastify: any, controller: DisputeAdminController) {
    // Dispute Management
    fastify.get('/admin/disputes', controller.getDisputes.bind(controller));
    fastify.get('/admin/disputes/:disputeId', controller.getDispute.bind(controller));
    fastify.post('/admin/disputes', controller.createDispute.bind(controller));
    fastify.put('/admin/disputes/:disputeId', controller.updateDispute.bind(controller));
    fastify.post('/admin/disputes/:disputeId/resolve', controller.resolveDispute.bind(controller));

    // Evidence Management
    fastify.post('/admin/disputes/:disputeId/evidence', controller.addEvidence.bind(controller));
    fastify.put('/admin/disputes/:disputeId/evidence/:evidenceId/verify', controller.verifyEvidence.bind(controller));

    // Response Management
    fastify.post('/admin/disputes/:disputeId/response', controller.createResponse.bind(controller));
    fastify.post('/admin/disputes/responses/:responseId/submit', controller.submitResponse.bind(controller));

    // Analytics and Metrics
    fastify.get('/admin/disputes/metrics', controller.getDisputeMetrics.bind(controller));
    fastify.get('/admin/disputes/analytics', controller.getDisputeAnalytics.bind(controller));
    fastify.get('/admin/disputes/dashboard', controller.getDashboardData.bind(controller));

    // System and Health
    fastify.get('/admin/disputes/health', controller.getSystemHealth.bind(controller));
    fastify.get('/admin/disputes/enums', controller.getDisputeEnums.bind(controller));
  }
}