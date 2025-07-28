/**
 * Escalation Procedures API Routes - Epic 17 Implementation
 * Task: E17-1753114397261-63A60C - Implement escalation procedures
 * 
 * REST API endpoints for managing escalation rules, cases, and monitoring
 * escalation workflows across all business processes.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EscalationProcedureService, EscalationRule, EscalationCase, EscalationPriority, EscalationCategory, EscalationStatus } from '../services/escalation/EscalationProcedureService';

// Request/Response Types
}
interface CreateRuleRequest {
  name: string;
  description?: string;
  category: EscalationCategory;
  enabled?: boolean;
  triggerType: string;
  conditions: any[];
  escalationPath: any[];
  initialDelay?: number;
  escalationInterval?: number;
  maxEscalationTime?: number;
  businessHoursOnly?: boolean;
  allowWeekends?: boolean;
  timeZone?: string;
}
}

}
interface UpdateRuleRequest {
  name?: string;
  description?: string;
  category?: EscalationCategory;
  enabled?: boolean;
  conditions?: any[];
  escalationPath?: any[];
  initialDelay?: number;
  escalationInterval?: number;
  maxEscalationTime?: number;
  businessHoursOnly?: boolean;
  allowWeekends?: boolean;
  timeZone?: string;
}
}

}
interface CreateCaseRequest {
  sourceType: string;
  sourceId: string;
  sourceData: Record<string, any>;
  ruleId?: string;
  priority?: EscalationPriority;
}
}

}
interface ResolveCaseRequest {
  resolutionType: 'resolved' | 'cancelled' | 'transferred' | 'merged';
  resolutionNotes?: string;
}
}

}
interface EscalateCaseRequest {
  reason?: string;
}
}

}
interface GetCasesQuery {
  status?: EscalationStatus;
  priority?: EscalationPriority;
  category?: EscalationCategory;
  assignee?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
}

}
interface GetRulesQuery {
  category?: EscalationCategory;
  enabled?: boolean;
  page?: number;
  limit?: number;
}
}

/**
 * Register escalation procedure routes
 */
export async function escalationProceduresRoutes(fastify: FastifyInstance) {
  const escalationService = fastify.escalationService as EscalationProcedureService;

  if (!escalationService) {
    throw new Error('EscalationProcedureService not registered with Fastify instance');
  }

  // =============================================================================
  // Rule Management Routes
  // =============================================================================

  /**
   * Get all escalation rules
   */
  fastify.get('/escalation/rules', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          enabled: { type: 'boolean' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: GetRulesQuery }>, reply: FastifyReply) => {
    try {
      const { category, enabled, page = 1, limit = 20 } = request.query;
      
      // Get rules (simplified - in practice would implement pagination)
      const rules = await escalationService.getEscalationRules({
        category,
        enabled,
        offset: (page - 1) * limit,
        limit
      });

      const totalCount = await escalationService.getEscalationRulesCount({ category, enabled });

      return {
        success: true,
        data: {
          rules,
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit)
          }
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escalation rules'
      };
    }
  });

  /**
   * Get escalation rule by ID
   */
  fastify.get('/escalation/rules/:ruleId', {
    schema: {
      params: {
        type: 'object',
        required: ['ruleId'],
        properties: {
          ruleId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { ruleId: string } }>, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params;
      const rule = await escalationService.getEscalationRule(ruleId);
      
      if (!rule) {
        reply.status(404);
        return {
          success: false,
          error: `Escalation rule ${ruleId} not found`
        };
      }

      return {
        success: true,
        data: rule
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escalation rule'
      };
    }
  });

  /**
   * Create new escalation rule
   */
  fastify.post('/escalation/rules', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'category', 'triggerType', 'escalationPath'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', maxLength: 1000 },
          category: { type: 'string' },
          enabled: { type: 'boolean', default: true },
          triggerType: { type: 'string' },
          conditions: { type: 'array' },
          escalationPath: { type: 'array', minItems: 1 },
          initialDelay: { type: 'number', minimum: 1 },
          escalationInterval: { type: 'number', minimum: 1 },
          maxEscalationTime: { type: 'number', minimum: 1 },
          businessHoursOnly: { type: 'boolean' },
          allowWeekends: { type: 'boolean' },
          timeZone: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateRuleRequest }>, reply: FastifyReply) => {
    try {
      // Get user info from request context
      const userId = request.user?.id || 'system';
      
      const rule = await escalationService.createEscalationRule(request.body, userId);
      
      reply.status(201);
      return {
        success: true,
        data: rule,
        message: 'Escalation rule created successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escalation rule'
      };
    }
  });

  /**
   * Update escalation rule
   */
  fastify.put('/escalation/rules/:ruleId', {
    schema: {
      params: {
        type: 'object',
        required: ['ruleId'],
        properties: {
          ruleId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', maxLength: 1000 },
          category: { type: 'string' },
          enabled: { type: 'boolean' },
          conditions: { type: 'array' },
          escalationPath: { type: 'array' },
          initialDelay: { type: 'number', minimum: 1 },
          escalationInterval: { type: 'number', minimum: 1 },
          maxEscalationTime: { type: 'number', minimum: 1 },
          businessHoursOnly: { type: 'boolean' },
          allowWeekends: { type: 'boolean' },
          timeZone: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { ruleId: string }; Body: UpdateRuleRequest }>, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params;
      const userId = request.user?.id || 'system';
      
      const updatedRule = await escalationService.updateEscalationRule(ruleId, request.body, userId);
      
      return {
        success: true,
        data: updatedRule,
        message: 'Escalation rule updated successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update escalation rule'
      };
    }
  });

  /**
   * Delete escalation rule
   */
  fastify.delete('/escalation/rules/:ruleId', {
    schema: {
      params: {
        type: 'object',
        required: ['ruleId'],
        properties: {
          ruleId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { ruleId: string } }>, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params;
      const userId = request.user?.id || 'system';
      
      await escalationService.deleteEscalationRule(ruleId, userId);
      
      return {
        success: true,
        message: 'Escalation rule deleted successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete escalation rule'
      };
    }
  });

  // =============================================================================
  // Case Management Routes
  // =============================================================================

  /**
   * Get all escalation cases
   */
  fastify.get('/escalation/cases', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          priority: { type: 'string' },
          category: { type: 'string' },
          assignee: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 },
          sortBy: { type: 'string', default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: GetCasesQuery }>, reply: FastifyReply) => {
    try {
      const {
        status,
        priority,
        category,
        assignee,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = request.query;

      const cases = await escalationService.getEscalationCases({
        status,
        priority,
        category,
        assignee,
        offset: (page - 1) * limit,
        limit,
        sortBy,
        sortOrder
      });

      const totalCount = await escalationService.getEscalationCasesCount({
        status,
        priority,
        category,
        assignee
      });

      return {
        success: true,
        data: {
          cases,
          pagination: {
            page,
            limit,
            total: totalCount,
            pages: Math.ceil(totalCount / limit)
          }
        }
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escalation cases'
      };
    }
  });

  /**
   * Get escalation case by ID
   */
  fastify.get('/escalation/cases/:caseId', {
    schema: {
      params: {
        type: 'object',
        required: ['caseId'],
        properties: {
          caseId: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { caseId: string } }>, reply: FastifyReply) => {
    try {
      const { caseId } = request.params;
      const escalationCase = await escalationService.getEscalationCase(caseId);
      
      if (!escalationCase) {
        reply.status(404);
        return {
          success: false,
          error: `Escalation case ${caseId} not found`
        };
      }

      return {
        success: true,
        data: escalationCase
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escalation case'
      };
    }
  });

  /**
   * Create new escalation case
   */
  fastify.post('/escalation/cases', {
    schema: {
      body: {
        type: 'object',
        required: ['sourceType', 'sourceId', 'sourceData'],
        properties: {
          sourceType: { type: 'string', minLength: 1 },
          sourceId: { type: 'string', minLength: 1 },
          sourceData: { type: 'object' },
          ruleId: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateCaseRequest }>, reply: FastifyReply) => {
    try {
      const { sourceType, sourceId, sourceData, ruleId, priority } = request.body;
      
      const escalationCase = await escalationService.createEscalationCase(
        sourceType,
        sourceId,
        sourceData,
        ruleId,
        priority
      );
      
      reply.status(201);
      return {
        success: true,
        data: escalationCase,
        message: 'Escalation case created successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escalation case'
      };
    }
  });

  /**
   * Escalate case to next level
   */
  fastify.post('/escalation/cases/:caseId/escalate', {
    schema: {
      params: {
        type: 'object',
        required: ['caseId'],
        properties: {
          caseId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        properties: {
          reason: { type: 'string', maxLength: 1000 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { caseId: string }; Body: EscalateCaseRequest }>, reply: FastifyReply) => {
    try {
      const { caseId } = request.params;
      const { reason } = request.body;
      
      const escalationCase = await escalationService.escalateCase(caseId, reason);
      
      return {
        success: true,
        data: escalationCase,
        message: `Case escalated to level ${escalationCase.currentLevel}`
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to escalate case'
      };
    }
  });

  /**
   * Resolve escalation case
   */
  fastify.post('/escalation/cases/:caseId/resolve', {
    schema: {
      params: {
        type: 'object',
        required: ['caseId'],
        properties: {
          caseId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        required: ['resolutionType'],
        properties: {
          resolutionType: {
            type: 'string',
            enum: ['resolved', 'cancelled', 'transferred', 'merged']
  }
          resolutionNotes: { type: 'string', maxLength: 2000 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Params: { caseId: string }; Body: ResolveCaseRequest }>, reply: FastifyReply) => {
    try {
      const { caseId } = request.params;
      const { resolutionType, resolutionNotes } = request.body;
      const userId = request.user?.id || 'system';
      
      const resolvedCase = await escalationService.resolveCase(
        caseId,
        userId,
        resolutionType,
        resolutionNotes
      );
      
      return {
        success: true,
        data: resolvedCase,
        message: 'Escalation case resolved successfully'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve escalation case'
      };
    }
  });

  // =============================================================================
  // Monitoring and Dashboard Routes
  // =============================================================================

  /**
   * Get escalation dashboard
   */
  fastify.get('/escalation/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const dashboard = await escalationService.getEscalationDashboard();
      
      return {
        success: true,
        data: dashboard
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escalation dashboard'
      };
    }
  });

  /**
   * Get escalation metrics
   */
  fastify.get('/escalation/metrics', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['hourly', 'daily', 'weekly', 'monthly'],
            default: 'daily'
  }
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          category: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      period?: string;
      startDate?: string;
      endDate?: string;
      category?: EscalationCategory;
    }
  }>, reply: FastifyReply) => {
    try {
      const { period = 'daily', startDate, endDate, category } = request.query;
      
      const metrics = await escalationService.getEscalationMetrics({
        period,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        category
      });
      
      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escalation metrics'
      };
    }
  });

  /**
   * Get escalation analytics
   */
  fastify.get('/escalation/analytics', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'], default: 'month' },
          groupBy: { type: 'string', enum: ['category', 'priority', 'assignee', 'level'], default: 'category' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      period?: string;
      groupBy?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { period = 'month', groupBy = 'category' } = request.query;
      
      const analytics = await escalationService.getEscalationAnalytics({
        period,
        groupBy
      });
      
      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch escalation analytics'
      };
    }
  });

  // =============================================================================
  // Admin Routes
  // =============================================================================

  /**
   * Test escalation rule
   */
  fastify.post('/escalation/rules/:ruleId/test', {
    schema: {
      params: {
        type: 'object',
        required: ['ruleId'],
        properties: {
          ruleId: { type: 'string' }
        }
  }
      body: {
        type: 'object',
        required: ['testData'],
        properties: {
          testData: { type: 'object' },
          dryRun: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Params: { ruleId: string };
    Body: { testData: Record<string, any>; dryRun?: boolean };
  }>, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params;
      const { testData, dryRun = true } = request.body;
      
      const testResult = await escalationService.testEscalationRule(ruleId, testData, dryRun);
      
      return {
        success: true,
        data: testResult,
        message: 'Escalation rule test completed'
      };
    } catch (error) {
      reply.status(400);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test escalation rule'
      };
    }
  });

  /**
   * Get escalation performance by assignee
   */
  fastify.get('/escalation/performance/assignees', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          assignee: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      startDate?: string;
      endDate?: string;
      assignee?: string;
    }
  }>, reply: FastifyReply) => {
    try {
      const { startDate, endDate, assignee } = request.query;
      
      const performance = await escalationService.getAssigneePerformance({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        assignee
      });
      
      return {
        success: true,
        data: performance
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assignee performance'
      };
    }
  });

  /**
   * Export escalation data
   */
  fastify.get('/escalation/export', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'csv', 'xlsx'], default: 'json' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          category: { type: 'string' },
          includeResolved: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request: FastifyRequest<{
    Querystring: {
      format?: string;
      startDate?: string;
      endDate?: string;
      category?: EscalationCategory;
      includeResolved?: boolean;
    }
  }>, reply: FastifyReply) => {
    try {
      const {
        format = 'json',
        startDate,
        endDate,
        category,
        includeResolved = true
      } = request.query;
      
      const exportData = await escalationService.exportEscalationData({
        format,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        category,
        includeResolved
      });
      
      // Set appropriate content type
      switch (format) {
      case 'csv':
        reply.header('content-type', 'text/csv');
        reply.header('content-disposition', 'attachment; filename="escalations.csv"');
        break;
      case 'xlsx':
        reply.header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        reply.header('content-disposition', 'attachment; filename="escalations.xlsx"');
        break;
      default:
        reply.header('content-type', 'application/json');
        break;
      }
      
      return exportData;
      
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export escalation data'
      };
    }
  });

  console.log('📈 Escalation Procedures API routes registered successfully');
}

export default escalationProceduresRoutes;