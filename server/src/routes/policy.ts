/**
 * Policy Management API Routes - E17-1753114397370-5ABAA8
 * 
 * RESTful API endpoints for the unified policy management system.
 * Provides CRUD operations, policy evaluation, and compliance reporting.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  PolicyManagement,
  UnifiedPolicy,
  PolicyDomain,
  PolicyType,
  PolicyStatus,
  PolicyEvaluationContext,
  ComplianceFramework
} from '../../packages/core/services/PolicyManagement';

// Request/Response Types
interface CreatePolicyRequest {
  Body: Omit<UnifiedPolicy, 'id' | 'metadata'>;
}

interface UpdatePolicyRequest {
  Params: { policyId: string };
  Body: Partial<UnifiedPolicy>;
}

interface DeletePolicyRequest {
  Params: { policyId: string };
}

interface GetPoliciesRequest {
  Querystring: {
    domain?: PolicyDomain;
    type?: PolicyType;
    status?: PolicyStatus;
    enabled?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  };
}

interface EvaluatePolicyRequest {
  Body: {
    entityType: 'USER' | 'TEMPLATE' | 'PROJECT' | 'TRANSACTION' | 'CONTENT';
    entityId: string;
    userId?: string;
    operation: {
      type: string;
      parameters: Record<string, any>;
      riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
    contentContext?: {
      historicalPeriod?: string;
      culturalContext?: string;
      accuracyLevel?: 'STRICT' | 'MODERATE' | 'FLEXIBLE';
      expertReviewed?: boolean;
    };
    additionalContext?: Record<string, any>;
  };
}

interface ComplianceReportRequest {
  Params: { framework: ComplianceFramework };
}

/**
 * Register policy management routes
 */
export async function policyRoutes(fastify: FastifyInstance) {
  // Initialize policy management system
  const policyManager = new PolicyManagement();

  // Add authentication hook
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for health check
    if (request.routerPath === '/health') return;
    
    // In production, implement proper authentication
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ error: 'Authorization header required' });
    }
    
    // Mock user extraction - in production, decode JWT token
    (request as any).user = {
      id: 'user-123',
      roles: ['admin'],
      permissions: ['policy:read', 'policy:write', 'policy:delete']
    };
  });

  /**
   * Health check endpoint
   */
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', service: 'policy-management' };
  });

  /**
   * Get all policies with filtering
   */
  fastify.get<GetPoliciesRequest>('/policies', async (request, reply) => {
    try {
      const { 
        domain, 
        type, 
        status, 
        enabled, 
        limit = 50, 
        offset = 0, 
        search 
      } = request.query;

      let policies = policyManager.getPolicies({
        domain,
        type,
        status,
        enabled
      });

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        policies = policies.filter(policy =>
          policy.name.toLowerCase().includes(searchLower) ||
          policy.description.toLowerCase().includes(searchLower) ||
          policy.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply pagination
      const total = policies.length;
      const paginatedPolicies = policies.slice(offset, offset + limit);

      return {
        policies: paginatedPolicies,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get policies:', error);
      return reply.code(500).send({ 
        error: 'Failed to retrieve policies',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get specific policy by ID
   */
  fastify.get<{ Params: { policyId: string } }>('/policies/:policyId', async (request, reply) => {
    try {
      const { policyId } = request.params;
      const policy = policyManager.getPolicy(policyId);
      
      if (!policy) {
        return reply.code(404).send({ error: 'Policy not found' });
      }

      return { policy };
    } catch (error) {
      fastify.log.error('Failed to get policy:', error);
      return reply.code(500).send({ 
        error: 'Failed to retrieve policy',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Create new policy
   */
  fastify.post<CreatePolicyRequest>('/policies', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // Check permissions
      if (!user.permissions.includes('policy:write')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }

      const policyData = request.body;
      
      // Basic validation
      if (!policyData.name || !policyData.domain || !policyData.type) {
        return reply.code(400).send({ 
          error: 'Missing required fields: name, domain, type' 
        });
      }

      const policy = await policyManager.createPolicy(policyData, user.id);

      fastify.log.info('Policy created:', { 
        policyId: policy.id, 
        name: policy.name, 
        createdBy: user.id 
      });

      return reply.code(201).send({ policy });
    } catch (error) {
      fastify.log.error('Failed to create policy:', error);
      return reply.code(500).send({ 
        error: 'Failed to create policy',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Update existing policy
   */
  fastify.put<UpdatePolicyRequest>('/policies/:policyId', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // Check permissions
      if (!user.permissions.includes('policy:write')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }

      const { policyId } = request.params;
      const updates = request.body;

      const policy = await policyManager.updatePolicy(policyId, updates, user.id);

      fastify.log.info('Policy updated:', { 
        policyId: policy.id, 
        name: policy.name, 
        updatedBy: user.id,
        version: policy.metadata.version
      });

      return { policy };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({ error: 'Policy not found' });
      }
      
      fastify.log.error('Failed to update policy:', error);
      return reply.code(500).send({ 
        error: 'Failed to update policy',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Delete policy
   */
  fastify.delete<DeletePolicyRequest>('/policies/:policyId', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // Check permissions
      if (!user.permissions.includes('policy:delete')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }

      const { policyId } = request.params;
      
      await policyManager.deletePolicy(policyId, user.id);

      fastify.log.info('Policy deleted:', { 
        policyId, 
        deletedBy: user.id 
      });

      return reply.code(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.code(404).send({ error: 'Policy not found' });
      }
      
      fastify.log.error('Failed to delete policy:', error);
      return reply.code(500).send({ 
        error: 'Failed to delete policy',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Evaluate policies for a given context
   */
  fastify.post<EvaluatePolicyRequest>('/policies/evaluate', async (request, reply) => {
    try {
      const user = (request as any).user;
      const { 
        entityType, 
        entityId, 
        userId, 
        operation, 
        contentContext, 
        additionalContext 
      } = request.body;

      // Build evaluation context
      const context: PolicyEvaluationContext = {
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        userId: userId || user.id,
        entityType,
        entityId,
        sessionData: {
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          geolocation: undefined,
          authenticationMethod: 'jwt'
        },
        operation: {
          type: operation.type,
          parameters: operation.parameters,
          riskLevel: operation.riskLevel || 'MEDIUM'
        },
        contentContext,
        additionalContext: additionalContext || {}
      };

      const results = await policyManager.evaluatePolicies(context);

      // Log evaluation for audit trail
      fastify.log.info('Policy evaluation completed:', {
        requestId: context.requestId,
        entityType,
        entityId,
        resultsCount: results.length,
        userId: context.userId
      });

      return { 
        evaluationId: context.requestId,
        results,
        summary: {
          totalPolicies: results.length,
          allowed: results.filter(r => r.result === 'ALLOW').length,
          denied: results.filter(r => r.result === 'DENY').length,
          restricted: results.filter(r => r.result === 'RESTRICT').length,
          escalated: results.filter(r => r.result === 'ESCALATE').length,
          reviewRequired: results.filter(r => r.metadata.reviewRequired).length
        }
      };
    } catch (error) {
      fastify.log.error('Policy evaluation failed:', error);
      return reply.code(500).send({ 
        error: 'Policy evaluation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get policy evaluation history
   */
  fastify.get<{ 
    Querystring: { 
      entityId?: string; 
      entityType?: string; 
      limit?: number; 
      offset?: number;
    } 
  }>('/policies/evaluations', async (request, reply) => {
    try {
      const { entityId, entityType, limit = 50, offset = 0 } = request.query;

      // This would typically query a database of evaluation history
      // For now, return a mock response
      const evaluations = []; // Would fetch from persistent storage

      return {
        evaluations,
        pagination: {
          total: evaluations.length,
          limit,
          offset,
          hasMore: false
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get evaluation history:', error);
      return reply.code(500).send({ 
        error: 'Failed to retrieve evaluation history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get policy violations
   */
  fastify.get<{ 
    Querystring: { 
      resolved?: boolean; 
      severity?: string; 
      entityType?: string;
      limit?: number; 
      offset?: number;
    } 
  }>('/policies/violations', async (request, reply) => {
    try {
      const { resolved, severity, entityType, limit = 50, offset = 0 } = request.query;

      // This would typically query a database of violations
      // For now, return a mock response
      const violations = []; // Would fetch from persistent storage

      return {
        violations,
        pagination: {
          total: violations.length,
          limit,
          offset,
          hasMore: false
        }
      };
    } catch (error) {
      fastify.log.error('Failed to get violations:', error);
      return reply.code(500).send({ 
        error: 'Failed to retrieve violations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Generate compliance report
   */
  fastify.get<ComplianceReportRequest>('/policies/compliance/:framework', async (request, reply) => {
    try {
      const user = (request as any).user;
      const { framework } = request.params;

      // Check permissions
      if (!user.permissions.includes('policy:read')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }

      const report = await policyManager.generateComplianceReport(framework);

      fastify.log.info('Compliance report generated:', {
        framework,
        generatedBy: user.id,
        policyCount: report.totalPolicies
      });

      return { report };
    } catch (error) {
      fastify.log.error('Failed to generate compliance report:', error);
      return reply.code(500).send({ 
        error: 'Failed to generate compliance report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get policy statistics and metrics
   */
  fastify.get('/policies/statistics', async (request, reply) => {
    try {
      const policies = policyManager.getPolicies();
      
      const statistics = {
        totalPolicies: policies.length,
        activePolicies: policies.filter(p => p.status === PolicyStatus.ACTIVE).length,
        byDomain: policies.reduce((acc, policy) => {
          acc[policy.domain] = (acc[policy.domain] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byType: policies.reduce((acc, policy) => {
          acc[policy.type] = (acc[policy.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStatus: policies.reduce((acc, policy) => {
          acc[policy.status] = (acc[policy.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        complianceFrameworks: policies.reduce((acc, policy) => {
          policy.compliance.frameworks.forEach(framework => {
            acc[framework] = (acc[framework] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>),
        recentActivity: {
          createdThisWeek: policies.filter(p => 
            Date.now() - p.metadata.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
          ).length,
          updatedThisWeek: policies.filter(p => 
            Date.now() - p.metadata.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000
          ).length
        }
      };

      return { statistics };
    } catch (error) {
      fastify.log.error('Failed to get statistics:', error);
      return reply.code(500).send({ 
        error: 'Failed to retrieve statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * VFX-specific: Validate historical accuracy
   */
  fastify.post<{
    Body: {
      templateId: string;
      historicalPeriod: string;
      culturalContext: string;
      contentMetadata: Record<string, any>;
    }
  }>('/policies/vfx/historical-accuracy', async (request, reply) => {
    try {
      const { templateId, historicalPeriod, culturalContext, contentMetadata } = request.body;
      
      const results = await policyManager.evaluatePolicies({
        requestId: `vfx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        entityType: 'TEMPLATE',
        entityId: templateId,
        sessionData: {
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'] || 'Unknown',
          authenticationMethod: 'jwt'
        },
        operation: {
          type: 'historical_accuracy_validation',
          parameters: contentMetadata,
          riskLevel: 'HIGH'
        },
        contentContext: {
          historicalPeriod,
          culturalContext,
          accuracyLevel: 'STRICT',
          expertReviewed: false
        },
        additionalContext: {}
      });

      const validation = {
        templateId,
        historicalPeriod,
        culturalContext,
        valid: results.every(r => r.result === 'ALLOW'),
        requiresExpertReview: results.some(r => r.metadata.reviewRequired),
        violations: results.filter(r => r.result === 'DENY').map(r => ({
          policy: r.policyName,
          reason: r.ruleResults.filter(rr => rr.result === 'FAIL').map(rr => rr.ruleName)
        })),
        recommendations: results.filter(r => r.result === 'RESTRICT').map(r => ({
          policy: r.policyName,
          actions: r.triggeredActions.map(a => a.actionType)
        }))
      };

      return { validation };
    } catch (error) {
      fastify.log.error('VFX historical accuracy validation failed:', error);
      return reply.code(500).send({ 
        error: 'Historical accuracy validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Export policies in various formats
   */
  fastify.get<{ 
    Querystring: { 
      format: 'json' | 'yaml' | 'csv';
      domain?: PolicyDomain;
      status?: PolicyStatus;
    } 
  }>('/policies/export', async (request, reply) => {
    try {
      const user = (request as any).user;
      
      // Check permissions
      if (!user.permissions.includes('policy:read')) {
        return reply.code(403).send({ error: 'Insufficient permissions' });
      }

      const { format = 'json', domain, status } = request.query;
      
      const policies = policyManager.getPolicies({ domain, status });

      switch (format) {
      case 'json':
        reply.type('application/json');
        return { policies };
          
      case 'yaml':
        // Would implement YAML conversion
        reply.type('text/yaml');
        return 'policies: []'; // Placeholder
          
      case 'csv':
        // Would implement CSV conversion
        reply.type('text/csv');
        return 'id,name,domain,status\n'; // Placeholder
          
      default:
        return reply.code(400).send({ error: 'Invalid format specified' });
      }
    } catch (error) {
      fastify.log.error('Failed to export policies:', error);
      return reply.code(500).send({ 
        error: 'Failed to export policies',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Register error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    // Don't leak internal errors to client
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;
    
    reply.status(statusCode).send({
      error: message,
      statusCode
    });
  });

  fastify.log.info('Policy management routes registered');
}

export default policyRoutes;