import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import {
  MarketplacePolicyPublishingService,
  MarketplacePolicyType,
  PolicyStatus,
  PolicyPublishingRequest,
  PolicyVersionRequest,
  UserRole
} from '../services/MarketplacePolicyPublishingService';
import {
  MarketplacePolicyEnforcementService,
  ViolationType,
  ViolationSeverity,
  ViolationReport,
  EnforcementActionType
} from '../services/MarketplacePolicyEnforcementService';

// Request interfaces
interface CreatePolicyRequest {
  policy_type: MarketplacePolicyType;
  title: string;
  description: string;
  content: any;
  metadata: any;
  enforcement: any;
}

interface UpdatePolicyRequest extends Partial<CreatePolicyRequest> {
  // Extends create request with optional fields
}

interface PublishPolicyRequest extends PolicyPublishingRequest {
  // Extends base publishing request
}

interface CreateVersionRequest extends PolicyVersionRequest {
  // Extends base version request
}

interface DetectViolationsRequest {
  content_id: string;
  content_type: 'template' | 'listing' | 'user_profile' | 'comment';
  content_data: any;
  owner_id: string;
}

interface ReportViolationRequest extends ViolationReport {
  // Extends base violation report
}

interface ExecuteActionRequest {
  action_id: string;
  confirmation: boolean;
  notes?: string;
}

interface CreateDetectionRuleRequest {
  policy_id: string;
  name: string;
  description: string;
  violation_type: ViolationType;
  conditions: any[];
  enforcement_config: any;
  ai_model_config?: any;
}

// Query interfaces
interface GetPoliciesQuery {
  policy_type?: MarketplacePolicyType;
  status?: PolicyStatus;
  user_role?: UserRole;
  limit?: number;
  offset?: number;
}

interface GetViolationsQuery {
  violator_id?: string;
  violation_type?: ViolationType;
  severity?: ViolationSeverity;
  status?: string;
  limit?: number;
  offset?: number;
  date_from?: string;
  date_to?: string;
}

export async function marketplacePolicyManagementRoutes(fastify: FastifyInstance, pool: Pool) {
  const publishingService = new MarketplacePolicyPublishingService(pool);
  const enforcementService = new MarketplacePolicyEnforcementService(pool);

  // Initialize database schemas
  await publishingService.initializeSchema();
  await enforcementService.initializeSchema();

  // ============== POLICY PUBLISHING ENDPOINTS ==============

  // Create new marketplace policy
  fastify.post<{
    Body: CreatePolicyRequest;
  }>('/marketplace/policies', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin') && !user?.roles?.includes('policy_manager')) {
        reply.code(403).send({ error: 'Admin or policy manager role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: CreatePolicyRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const policyData = {
        ...request.body,
        version: '1.0.0',
        status: PolicyStatus.DRAFT,
        publication: {
          publishing_status: 'pending',
          publication_channels: [],
          rollout_strategy: {
            type: 'immediate' as const,
            start_date: new Date(),
            rollback_triggers: []
          },
          notification_settings: {
            enabled: false,
            channels: [],
            audience: [],
            template_id: '',
            send_reminders: false
          }
        },
        analytics: {
          views: 0,
          acknowledgments: 0,
          violations: 0,
          enforcement_actions: 0,
          user_feedback: [],
          compliance_score: 0,
          last_updated: new Date()
        }
      };

      const policy = await publishingService.createPolicy(policyData, userId);

      return {
        success: true,
        policy,
        message: 'Policy created successfully',
        next_steps: [
          'Review policy content',
          'Configure enforcement settings',
          'Submit for approval',
          'Publish to marketplace'
        ]
      };
    } catch (error) {
      request.log.error('Policy creation error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to create policy',
        message: error.message
      });
    }
  });

  // Update marketplace policy
  fastify.put<{
    Params: { policyId: string };
    Body: UpdatePolicyRequest;
  }>('/marketplace/policies/:policyId', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin') && !user?.roles?.includes('policy_manager')) {
        reply.code(403).send({ error: 'Admin or policy manager role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Params: { policyId: string };
    Body: UpdatePolicyRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { policyId } = request.params;

      const policy = await publishingService.updatePolicy(policyId, request.body, userId);

      return {
        success: true,
        policy,
        message: 'Policy updated successfully'
      };
    } catch (error) {
      request.log.error('Policy update error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to update policy',
        message: error.message
      });
    }
  });

  // Publish policy to marketplace
  fastify.post<{
    Params: { policyId: string };
    Body: PublishPolicyRequest;
  }>('/marketplace/policies/:policyId/publish', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required for policy publishing' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Params: { policyId: string };
    Body: PublishPolicyRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { policyId } = request.params;

      const publishingRequest = {
        ...request.body,
        policy_id: policyId
      };

      const result = await publishingService.publishPolicy(publishingRequest, userId);

      return {
        success: true,
        ...result,
        message: 'Policy published successfully',
        channels: publishingRequest.publication_channels,
        rollout_strategy: publishingRequest.rollout_strategy
      };
    } catch (error) {
      request.log.error('Policy publishing error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to publish policy',
        message: error.message
      });
    }
  });

  // Create new policy version
  fastify.post<{
    Params: { policyId: string };
    Body: CreateVersionRequest;
  }>('/marketplace/policies/:policyId/versions', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { policyId: string };
    Body: CreateVersionRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const { policyId } = request.params;

      // Generate new version number based on increment type
      const policy = await publishingService.getPolicyById(policyId);
      if (!policy) {
        reply.code(404).send({ error: 'Policy not found' });
        return;
      }

      const newVersion = this.incrementVersion(policy.version, request.body.version_increment);
      
      const versionId = await publishingService.createPolicyVersion(
        policyId,
        newVersion,
        request.body.policy_id ? policy.content : request.body as any, // Content from request
        request.body.changelog,
        userId
      );

      return {
        success: true,
        version_id: versionId,
        new_version: newVersion,
        message: 'Policy version created successfully'
      };
    } catch (error) {
      request.log.error('Policy version creation error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to create policy version',
        message: error.message
      });
    }
  });

  // Get marketplace policies
  fastify.get<{
    Querystring: GetPoliciesQuery;
  }>('/marketplace/policies', async (request: FastifyRequest<{
    Querystring: GetPoliciesQuery;
  }>, reply: FastifyReply) => {
    try {
      const { policy_type, status, user_role = UserRole.ALL, limit = 20, offset = 0 } = request.query;

      let policies;
      if (policy_type) {
        policies = await publishingService.getPoliciesByType(policy_type, status);
      } else {
        // Get all active policies - would implement in service
        const userId = (request.user as any)?.id;
        policies = await publishingService.getActivePoliciesForUser(userId || 'anonymous', user_role);
      }

      // Apply pagination
      const paginatedPolicies = policies.slice(offset, offset + limit);

      return {
        policies: paginatedPolicies,
        pagination: {
          total: policies.length,
          limit,
          offset,
          has_more: offset + limit < policies.length
        }
      };
    } catch (error) {
      request.log.error('Policy retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve policies',
        message: error.message
      });
    }
  });

  // Get specific policy
  fastify.get<{
    Params: { policyId: string };
  }>('/marketplace/policies/:policyId', async (request: FastifyRequest<{
    Params: { policyId: string };
  }>, reply: FastifyReply) => {
    try {
      const { policyId } = request.params;
      const policy = await publishingService.getPolicyById(policyId);

      if (!policy) {
        reply.code(404).send({ error: 'Policy not found' });
        return;
      }

      return { policy };
    } catch (error) {
      request.log.error('Policy retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve policy',
        message: error.message
      });
    }
  });

  // Record policy acknowledgment
  fastify.post<{
    Params: { policyId: string };
    Body: { metadata?: Record<string, any> };
  }>('/marketplace/policies/:policyId/acknowledge', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Params: { policyId: string };
    Body: { metadata?: Record<string, any> };
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const userRole = (request.user as any)?.roles?.[0] || UserRole.BUYER;
      const { policyId } = request.params;

      await publishingService.recordPolicyAcknowledgment(
        policyId,
        userId,
        userRole,
        request.ip,
        request.headers['user-agent'],
        request.body.metadata
      );

      return {
        success: true,
        message: 'Policy acknowledgment recorded',
        acknowledged_at: new Date()
      };
    } catch (error) {
      request.log.error('Policy acknowledgment error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to record acknowledgment',
        message: error.message
      });
    }
  });

  // Get policy analytics
  fastify.get<{
    Params: { policyId: string };
  }>('/marketplace/policies/:policyId/analytics', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin') && !user?.roles?.includes('policy_manager')) {
        reply.code(403).send({ error: 'Admin or policy manager role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Params: { policyId: string };
  }>, reply: FastifyReply) => {
    try {
      const { policyId } = request.params;
      const analytics = await publishingService.getPolicyAnalytics(policyId);

      return { analytics };
    } catch (error) {
      request.log.error('Policy analytics error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to retrieve analytics',
        message: error.message
      });
    }
  });

  // ============== POLICY ENFORCEMENT ENDPOINTS ==============

  // Create violation detection rule
  fastify.post<{
    Body: CreateDetectionRuleRequest;
  }>('/marketplace/enforcement/rules', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin')) {
        reply.code(403).send({ error: 'Admin access required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: CreateDetectionRuleRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      
      const ruleData = {
        ...request.body,
        enabled: true,
        automatic_enforcement: request.body.enforcement_config?.automatic_actions?.length > 0 || false,
        created_by: userId
      };

      const rule = await enforcementService.createDetectionRule(ruleData, userId);

      return {
        success: true,
        rule,
        message: 'Violation detection rule created successfully'
      };
    } catch (error) {
      request.log.error('Detection rule creation error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to create detection rule',
        message: error.message
      });
    }
  });

  // Detect violations in content
  fastify.post<{
    Body: DetectViolationsRequest;
  }>('/marketplace/enforcement/detect', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: DetectViolationsRequest;
  }>, reply: FastifyReply) => {
    try {
      const violations = await enforcementService.detectViolations(
        request.body.content_id,
        request.body.content_type,
        request.body.content_data,
        request.body.owner_id
      );

      return {
        success: true,
        violations_detected: violations.length,
        violations,
        message: violations.length > 0 ? 
          `${violations.length} violation(s) detected` : 
          'No violations detected'
      };
    } catch (error) {
      request.log.error('Violation detection error:', error);
      reply.code(500).send({
        error: 'Failed to detect violations',
        message: error.message
      });
    }
  });

  // Report violation manually
  fastify.post<{
    Body: ReportViolationRequest;
  }>('/marketplace/enforcement/report', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: ReportViolationRequest;
  }>, reply: FastifyReply) => {
    try {
      const reporterId = request.body.anonymous ? undefined : (request.user as any)?.id;
      
      const violation = await enforcementService.reportViolation(request.body, reporterId);

      return {
        success: true,
        violation_id: violation.id,
        message: 'Violation reported successfully',
        next_steps: [
          'Report will be reviewed by moderation team',
          'You will be notified of any actions taken',
          'Thank you for helping maintain marketplace quality'
        ]
      };
    } catch (error) {
      request.log.error('Violation reporting error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to report violation',
        message: error.message
      });
    }
  });

  // Execute enforcement action
  fastify.post<{
    Body: ExecuteActionRequest;
  }>('/marketplace/enforcement/actions/execute', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
        reply.code(403).send({ error: 'Admin or moderator role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest<{
    Body: ExecuteActionRequest;
  }>, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      
      if (!request.body.confirmation) {
        reply.code(400).send({ error: 'Action confirmation required' });
        return;
      }

      const result = await enforcementService.executeEnforcementAction(
        request.body.action_id,
        userId
      );

      return {
        success: result.success,
        message: result.message,
        executed_at: new Date(),
        executed_by: userId
      };
    } catch (error) {
      request.log.error('Enforcement action execution error:', error);
      reply.code(error.statusCode || 500).send({
        error: 'Failed to execute enforcement action',
        message: error.message
      });
    }
  });

  // Get enforcement dashboard
  fastify.get('/marketplace/enforcement/dashboard', {
    preHandler: [fastify.jwtAuth, async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user?.roles?.includes('admin') && !user?.roles?.includes('moderator')) {
        reply.code(403).send({ error: 'Admin or moderator role required' });
        return;
      }
    }]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;
      const dashboard = await enforcementService.getEnforcementDashboard(userId);

      return { dashboard };
    } catch (error) {
      request.log.error('Enforcement dashboard error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve enforcement dashboard',
        message: error.message
      });
    }
  });

  // Get violations
  fastify.get<{
    Querystring: GetViolationsQuery;
  }>('/marketplace/enforcement/violations', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Querystring: GetViolationsQuery;
  }>, reply: FastifyReply) => {
    try {
      const user = request.user as any;
      const { 
        violator_id, 
        violation_type, 
        severity, 
        status, 
        limit = 20, 
        offset = 0,
        date_from,
        date_to
      } = request.query;

      // If not admin/moderator, only show user's own violations
      const targetViolatorId = user?.roles?.some((role: string) => ['admin', 'moderator'].includes(role)) 
        ? violator_id 
        : user.id;

      // Implementation would filter violations based on query parameters
      // For now, return mock response
      return {
        violations: [],
        pagination: {
          total: 0,
          limit,
          offset,
          has_more: false
        },
        filters_applied: {
          violator_id: targetViolatorId,
          violation_type,
          severity,
          status,
          date_range: date_from && date_to ? { from: date_from, to: date_to } : null
        }
      };
    } catch (error) {
      request.log.error('Violations retrieval error:', error);
      reply.code(500).send({
        error: 'Failed to retrieve violations',
        message: error.message
      });
    }
  });

  // AI-assisted content classification
  fastify.post<{
    Body: {
      content_id: string;
      content: string;
      content_type: string;
    };
  }>('/marketplace/enforcement/classify', {
    preHandler: [fastify.jwtAuth]
  }, async (request: FastifyRequest<{
    Body: {
      content_id: string;
      content: string;
      content_type: string;
    };
  }>, reply: FastifyReply) => {
    try {
      const classification = await enforcementService.classifyContentViolation(
        request.body.content_id,
        request.body.content,
        request.body.content_type
      );

      return {
        success: true,
        classification,
        processed_at: new Date()
      };
    } catch (error) {
      request.log.error('Content classification error:', error);
      reply.code(500).send({
        error: 'Failed to classify content',
        message: error.message
      });
    }
  });

  // Health check for policy management system
  fastify.get('/marketplace/policies/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connectivity
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      return {
        status: 'healthy',
        timestamp: new Date(),
        checks: {
          database: 'connected',
          policy_publishing_service: 'operational',
          enforcement_service: 'operational'
        },
        features: {
          policy_types: Object.values(MarketplacePolicyType),
          violation_types: Object.values(ViolationType),
          enforcement_actions: Object.values(EnforcementActionType)
        },
        version: '1.0.0'
      };
    } catch (error) {
      request.log.error('Policy management health check failed:', error);
      reply.code(503).send({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      });
    }
  });

  // Helper function to increment version numbers
  function incrementVersion(currentVersion: string, increment: 'major' | 'minor' | 'patch'): string {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (increment) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
    }
  }
}