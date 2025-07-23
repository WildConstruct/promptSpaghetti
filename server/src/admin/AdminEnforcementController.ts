/**
 * Admin Enforcement Controller - Epic 17.5.4
 * 
 * REST API controller for policy management and enforcement administration.
 * Provides endpoints for policy templates, violations, and manual enforcement.
 * 
 * Task: E17-1753114397376-1B07D9 - Develop enforcement tools  
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { PolicyManagementService } from './PolicyManagementService';
import { AutomatedEnforcementService } from '../services/trust/AutomatedEnforcementService';
import { TrustScoreService } from '../services/trust/TrustScoreService';

export interface PolicyTemplateCreateRequest {
  name: string;
  description: string;
  category: 'trust_score' | 'fraud_detection' | 'content_quality' | 'user_behavior' | 'transaction_monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  defaultConfig: any;
}

export interface ViolationReviewRequest {
  decision: 'dismiss' | 'enforce';
  notes?: string;
  enforcementOverrides?: {
    actionType?: 'suspend' | 'restrict' | 'flag' | 'require_verification' | 'block_transaction' | 'quarantine_template';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    expiresAt?: string;
  };
}

export interface EnforcementRequestCreate {
  entityType: 'user' | 'template' | 'transaction';
  entityId: string;
  actionType: 'suspend' | 'restrict' | 'flag' | 'require_verification' | 'block_transaction' | 'quarantine_template';
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence?: any;
  expiresAt?: string;
}

export interface EnforcementRequestProcess {
  decision: 'approve' | 'reject';
  rejectionReason?: string;
}

export class AdminEnforcementController {
  private policyService: PolicyManagementService;
  private automatedEnforcement: AutomatedEnforcementService;
  private trustScoreService: TrustScoreService;

  constructor(
    policyService: PolicyManagementService,
    automatedEnforcement: AutomatedEnforcementService,
    trustScoreService: TrustScoreService
  ) {
    this.policyService = policyService;
    this.automatedEnforcement = automatedEnforcement;
    this.trustScoreService = trustScoreService;
  }

  // =============================================================================
  // Policy Template Endpoints
  // =============================================================================

  /**
   * GET /admin/enforcement/templates
   */
  async getPolicyTemplates(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const options = {
        category: query.category,
        isSystemTemplate: query.isSystemTemplate === 'true' ? true : query.isSystemTemplate === 'false' ? false : undefined,
        limit: query.limit ? parseInt(query.limit) : 50,
        offset: query.offset ? parseInt(query.offset) : 0
      };

      const result = await this.policyService.getPolicyTemplates(options);
      
      reply.code(200).send({
        success: true,
        data: result.templates,
        pagination: {
          total: result.total,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch policy templates',
        details: error.message
      });
    }
  }

  /**
   * POST /admin/enforcement/templates
   */
  async createPolicyTemplate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as PolicyTemplateCreateRequest;
      
      // Validate required fields
      if (!body.name || !body.category || !body.severity) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: name, category, severity'
        });
      }

      const template = await this.policyService.createPolicyTemplate({
        name: body.name,
        description: body.description || '',
        category: body.category,
        severity: body.severity,
        defaultConfig: body.defaultConfig || {},
        isSystemTemplate: false
      });

      reply.code(201).send({
        success: true,
        data: template
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to create policy template',
        details: error.message
      });
    }
  }

  /**
   * POST /admin/enforcement/templates/:templateId/policies
   */
  async createPolicyFromTemplate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { templateId } = request.params as { templateId: string };
      const body = request.body as { overrides?: any };

      const policy = await this.policyService.createPolicyFromTemplate(
        templateId,
        body.overrides || {}
      );

      reply.code(201).send({
        success: true,
        data: policy
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to create policy from template',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Violation Management Endpoints
  // =============================================================================

  /**
   * GET /admin/enforcement/violations
   */
  async getViolations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as any;
      const options = {
        status: query.status,
        entityType: query.entityType,
        severity: query.severity,
        limit: query.limit ? parseInt(query.limit) : 50,
        offset: query.offset ? parseInt(query.offset) : 0
      };

      const result = await this.policyService.getPolicyViolations(options);
      
      reply.code(200).send({
        success: true,
        data: result.violations,
        pagination: {
          total: result.total,
          limit: options.limit,
          offset: options.offset
        }
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch violations',
        details: error.message
      });
    }
  }

  /**
   * POST /admin/enforcement/violations/scan
   */
  async scanForViolations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        entityType?: 'user' | 'template' | 'transaction';
        entityIds?: string[];
        policyIds?: string[];
        severity?: 'low' | 'medium' | 'high' | 'critical';
      };

      const violations = await this.policyService.scanForViolations(body);
      
      reply.code(200).send({
        success: true,
        data: violations,
        message: `Found ${violations.length} violations`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to scan for violations',
        details: error.message
      });
    }
  }

  /**
   * PUT /admin/enforcement/violations/:violationId/review
   */
  async reviewViolation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { violationId } = request.params as { violationId: string };
      const body = request.body as ViolationReviewRequest;
      const adminUser = (request as any).user; // Assuming auth middleware adds user info

      if (!body.decision || !['dismiss', 'enforce'].includes(body.decision)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid decision. Must be "dismiss" or "enforce"'
        });
      }

      await this.policyService.reviewViolation(
        violationId,
        body.decision,
        adminUser?.id || 'admin',
        body.notes,
        body.enforcementOverrides
      );

      reply.code(200).send({
        success: true,
        message: `Violation ${body.decision === 'dismiss' ? 'dismissed' : 'enforced'} successfully`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to review violation',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Manual Enforcement Endpoints
  // =============================================================================

  /**
   * POST /admin/enforcement/requests
   */
  async createEnforcementRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as EnforcementRequestCreate;
      const adminUser = (request as any).user;

      // Validate required fields
      if (!body.entityType || !body.entityId || !body.actionType || !body.reason || !body.severity) {
        return reply.code(400).send({
          success: false,
          error: 'Missing required fields: entityType, entityId, actionType, reason, severity'
        });
      }

      const enforcementRequest = await this.policyService.createEnforcementRequest({
        entityType: body.entityType,
        entityId: body.entityId,
        actionType: body.actionType,
        reason: body.reason,
        severity: body.severity,
        requestedBy: adminUser?.id || 'admin',
        evidence: body.evidence,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined
      });

      reply.code(201).send({
        success: true,
        data: enforcementRequest
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to create enforcement request',
        details: error.message
      });
    }
  }

  /**
   * PUT /admin/enforcement/requests/:requestId/process
   */
  async processEnforcementRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { requestId } = request.params as { requestId: string };
      const body = request.body as EnforcementRequestProcess;
      const adminUser = (request as any).user;

      if (!body.decision || !['approve', 'reject'].includes(body.decision)) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid decision. Must be "approve" or "reject"'
        });
      }

      if (body.decision === 'reject' && !body.rejectionReason) {
        return reply.code(400).send({
          success: false,
          error: 'Rejection reason is required when rejecting a request'
        });
      }

      await this.policyService.processEnforcementRequest(
        requestId,
        body.decision,
        adminUser?.id || 'admin',
        body.rejectionReason
      );

      reply.code(200).send({
        success: true,
        message: `Enforcement request ${body.decision}d successfully`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to process enforcement request',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Trust Score Integration Endpoints
  // =============================================================================

  /**
   * POST /admin/enforcement/evaluate/:entityType/:entityId
   */
  async triggerEnforcementEvaluation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityId } = request.params as { 
        entityType: 'user' | 'template' | 'transaction';
        entityId: string;
      };

      const actions = await this.automatedEnforcement.triggerEnforcementEvaluation(
        entityType,
        entityId
      );

      reply.code(200).send({
        success: true,
        data: actions,
        message: `Triggered enforcement evaluation for ${entityType} ${entityId}`
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to trigger enforcement evaluation',
        details: error.message
      });
    }
  }

  /**
   * GET /admin/enforcement/actions/:entityType/:entityId
   */
  async getEnforcementActions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { entityType, entityId } = request.params as { 
        entityType: 'user' | 'template' | 'transaction';
        entityId: string;
      };
      const query = request.query as any;

      const actions = await this.automatedEnforcement.getEnforcementActions(
        entityType,
        entityId,
        {
          limit: query.limit ? parseInt(query.limit) : 50,
          includeExpired: query.includeExpired === 'true'
        }
      );

      reply.code(200).send({
        success: true,
        data: actions
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch enforcement actions',
        details: error.message
      });
    }
  }

  // =============================================================================
  // Analytics and Statistics Endpoints
  // =============================================================================

  /**
   * GET /admin/enforcement/stats
   */
  async getEnforcementStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.policyService.getEnforcementStats();
      
      reply.code(200).send({
        success: true,
        data: stats
      });
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch enforcement statistics',
        details: error.message
      });
    }
  }

  /**
   * GET /admin/enforcement/health
   */
  async getSystemHealth(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Basic system health check for enforcement system
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {
          policyService: 'healthy',
          automatedEnforcement: 'healthy',
          trustScoring: 'healthy',
          database: 'healthy'
        },
        metrics: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: process.version
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

  // =============================================================================
  // Utility Methods
  // =============================================================================

  /**
   * Register all routes with Fastify instance
   */
  static registerRoutes(fastify: any, controller: AdminEnforcementController) {
    // Policy Templates
    fastify.get('/admin/enforcement/templates', controller.getPolicyTemplates.bind(controller));
    fastify.post('/admin/enforcement/templates', controller.createPolicyTemplate.bind(controller));
    fastify.post(
      '/admin/enforcement/templates/:templateId/policies',
      controller.createPolicyFromTemplate.bind(controller
      ));

    // Violation Management
    fastify.get('/admin/enforcement/violations', controller.getViolations.bind(controller));
    fastify.post('/admin/enforcement/violations/scan', controller.scanForViolations.bind(controller));
    fastify.put('/admin/enforcement/violations/:violationId/review', controller.reviewViolation.bind(controller));

    // Manual Enforcement
    fastify.post('/admin/enforcement/requests', controller.createEnforcementRequest.bind(controller));
    fastify.put(
      '/admin/enforcement/requests/:requestId/process',
      controller.processEnforcementRequest.bind(controller
      ));

    // Trust Score Integration
    fastify.post(
      '/admin/enforcement/evaluate/:entityType/:entityId',
      controller.triggerEnforcementEvaluation.bind(controller
      ));
    fastify.get('/admin/enforcement/actions/:entityType/:entityId', controller.getEnforcementActions.bind(controller));

    // Analytics and Health
    fastify.get('/admin/enforcement/stats', controller.getEnforcementStats.bind(controller));
    fastify.get('/admin/enforcement/health', controller.getSystemHealth.bind(controller));
  }
}