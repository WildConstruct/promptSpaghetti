/**
 * Automated Categorization API Routes
 * Task: E17-1753114396898-873EBB - Implement automated categorization
 * 
 * RESTful API endpoints for automated categorization system including
 * categorization requests, results, rules management, and analytics.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { 
  AutomatedCategorizationService, 
  CategorizationType,
  CategorizationStatus,
  ConfidenceLevel
} from '../AutomatedCategorizationService';
import { requirePermission } from '../../auth/middleware/permission-auth';

// Request validation schemas
const categorizationRequestSchema = z.object({
  itemId: z.string().min(1).max(255),
  itemType: z.nativeEnum(CategorizationType),
  itemData: z.record(z.any()),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  context: z.object({
    organizationId: z.string().optional(),
    userId: z.string().optional(),
    teamId: z.string().optional(),
    departmentId: z.string().optional(),
    projectId: z.string().optional(),
    source: z.string(),
    sourceMetadata: z.record(z.any()).optional(),
    businessContext: z.string().optional(),
    technicalContext: z.string().optional(),
    geographicalContext: z.object({
      region: z.string(),
      country: z.string(),
      timezone: z.string()
    }).optional()
  }).optional(),
  options: z.object({
    enableMLCategorization: z.boolean().optional(),
    enableRuleBasedCategorization: z.boolean().optional(),
    requireHumanReview: z.boolean().optional(),
    autoAssign: z.boolean().optional(),
    confidenceThreshold: z.number().min(0).max(100).optional(),
    maxProcessingTime: z.number().optional(),
    customRules: z.array(z.string()).optional(),
    excludeCategories: z.array(z.string()).optional(),
    priorityCategories: z.array(z.string()).optional()
  }).optional()
});

const categorizationRuleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  itemType: z.nativeEnum(CategorizationType),
  priority: z.number().min(0).max(1000).optional().default(100),
  enabled: z.boolean().optional().default(true),
  triggers: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
    weight: z.number().min(0).max(100)
  })),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
    logicalOperator: z.enum(['AND', 'OR']).optional(),
    negate: z.boolean().optional()
  })),
  actions: z.array(z.object({
    actionType: z.enum(['categorize', 'assign', 'flag', 'escalate', 'notify']),
    parameters: z.record(z.any()),
    conditions: z.record(z.any()).optional()
  })),
  confidenceBoost: z.number().min(-50).max(50).optional().default(0),
  requiresReview: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([])
});

const categoryDefinitionSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.nativeEnum(CategorizationType),
  parentCategory: z.string().optional(),
  defaultRiskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  defaultAssignments: z.array(z.object({
    assignmentType: z.enum(['user', 'team', 'role', 'permission', 'queue', 'workflow']),
    assignmentTarget: z.string(),
    assignmentReason: z.string(),
    confidence: z.number().min(0).max(100)
  })).optional().default([]),
  requiredPermissions: z.array(z.string()).optional().default([]),
  complianceRequirements: z.array(z.string()).optional().default([]),
  autoAssignmentEnabled: z.boolean().optional().default(true),
  confidenceThreshold: z.number().min(0).max(100).optional().default(70),
  reviewRequired: z.boolean().optional().default(false)
});

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    permissions: string[];
  };
}

/**
 * Register automated categorization routes
 */
export async function registerAutomatedCategorizationRoutes(
  fastify: FastifyInstance,
  categorizationService: AutomatedCategorizationService
): Promise<void> {

  // Submit item for categorization
  fastify.post('/categorization/requests', {
    preHandler: [requirePermission('admin:categorization:create')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const requestData = categorizationRequestSchema.parse(request.body);
      
      const requestId = await categorizationService.categorizeItem(
        requestData.itemId,
        requestData.itemType,
        requestData.itemData,
        request.user!.id,
        {
          priority: requestData.priority,
          context: requestData.context,
          categorizationOptions: requestData.options
        }
      );

      return reply.code(202).send({
        success: true,
        data: {
          requestId,
          status: 'submitted',
          message: 'Categorization request submitted for processing'
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid categorization request data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to submit categorization request:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to submit categorization request',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get categorization request status
  fastify.get('/categorization/requests/:requestId', {
    preHandler: [requirePermission('admin:categorization:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { requestId } = request.params as { requestId: string };
      
      const result = await categorizationService.getCategorizationResult(requestId);
      
      if (!result) {
        return reply.code(404).send({
          success: false,
          error: 'Categorization request not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: result
      });

    } catch (error) {
      fastify.log.error(`Failed to get categorization request ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve categorization request'
      });
    }
  });

  // List categorization requests
  fastify.get('/categorization/requests', {
    preHandler: [requirePermission('admin:categorization:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { 
        itemType, 
        status, 
        priority,
        requestedBy,
        limit, 
        offset,
        startDate,
        endDate 
      } = request.query as {
        itemType?: CategorizationType;
        status?: CategorizationStatus;
        priority?: 'low' | 'medium' | 'high' | 'critical';
        requestedBy?: string;
        limit?: string;
        offset?: string;
        startDate?: string;
        endDate?: string;
      };

      // This would implement actual request listing from database
      // For now, return empty array as placeholder
      return reply.code(200).send({
        success: true,
        data: [],
        meta: {
          totalCount: 0,
          limit: parseInt(limit || '20', 10),
          offset: parseInt(offset || '0', 10),
          filters: {
            itemType,
            status,
            priority,
            requestedBy,
            startDate,
            endDate
          }
        }
      });

    } catch (error) {
      fastify.log.error('Failed to list categorization requests:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve categorization requests'
      });
    }
  });

  // Get categorization results
  fastify.get('/categorization/results', {
    preHandler: [requirePermission('admin:categorization:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const {
        itemType,
        category,
        confidenceLevel,
        riskLevel,
        reviewRequired,
        limit,
        offset
      } = request.query as {
        itemType?: CategorizationType;
        category?: string;
        confidenceLevel?: ConfidenceLevel;
        riskLevel?: 'low' | 'medium' | 'high' | 'critical';
        reviewRequired?: string;
        limit?: string;
        offset?: string;
      };

      // This would implement actual results listing from database
      return reply.code(200).send({
        success: true,
        data: [],
        meta: {
          totalCount: 0,
          limit: parseInt(limit || '20', 10),
          offset: parseInt(offset || '0', 10),
          filters: {
            itemType,
            category,
            confidenceLevel,
            riskLevel,
            reviewRequired: reviewRequired === 'true'
          }
        }
      });

    } catch (error) {
      fastify.log.error('Failed to list categorization results:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve categorization results'
      });
    }
  });

  // Create categorization rule
  fastify.post('/categorization/rules', {
    preHandler: [requirePermission('admin:categorization:manage')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const ruleData = categorizationRuleSchema.parse(request.body);
      
      // This would implement actual rule creation
      const ruleId = 'placeholder_rule_id';

      return reply.code(201).send({
        success: true,
        data: {
          ruleId,
          ...ruleData,
          createdBy: request.user!.id,
          createdAt: new Date().toISOString()
  }
        message: 'Categorization rule created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid categorization rule data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to create categorization rule:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create categorization rule',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // List categorization rules
  fastify.get('/categorization/rules', {
    preHandler: [requirePermission('admin:categorization:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const {
        itemType,
        enabled,
        priority,
        limit,
        offset
      } = request.query as {
        itemType?: CategorizationType;
        enabled?: string;
        priority?: string;
        limit?: string;
        offset?: string;
      };

      // This would implement actual rules listing from database
      return reply.code(200).send({
        success: true,
        data: [],
        meta: {
          totalCount: 0,
          limit: parseInt(limit || '20', 10),
          offset: parseInt(offset || '0', 10),
          filters: {
            itemType,
            enabled: enabled === 'true',
            minPriority: priority ? parseInt(priority, 10) : undefined
          }
        }
      });

    } catch (error) {
      fastify.log.error('Failed to list categorization rules:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve categorization rules'
      });
    }
  });

  // Update categorization rule
  fastify.put('/categorization/rules/:ruleId', {
    preHandler: [requirePermission('admin:categorization:manage')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params as { ruleId: string };
      const updates = categorizationRuleSchema.partial().parse(request.body);
      
      // This would implement actual rule updating
      return reply.code(200).send({
        success: true,
        data: {
          ruleId,
          ...updates,
          lastModified: new Date().toISOString()
  }
        message: 'Categorization rule updated successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid rule update data',
          details: error.errors
        });
      }

      fastify.log.error(`Failed to update categorization rule ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to update categorization rule',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Delete categorization rule
  fastify.delete('/categorization/rules/:ruleId', {
    preHandler: [requirePermission('admin:categorization:manage')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const { ruleId } = request.params as { ruleId: string };
      
      // This would implement actual rule deletion
      return reply.code(200).send({
        success: true,
        message: 'Categorization rule deleted successfully'
      });

    } catch (error) {
      fastify.log.error(`Failed to delete categorization rule ${request.params}:`, error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete categorization rule'
      });
    }
  });

  // Create category definition
  fastify.post('/categorization/categories', {
    preHandler: [requirePermission('admin:categorization:manage')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const categoryData = categoryDefinitionSchema.parse(request.body);
      
      // This would implement actual category creation
      const categoryId = 'placeholder_category_id';

      return reply.code(201).send({
        success: true,
        data: {
          categoryId,
          ...categoryData,
          createdBy: request.user!.id,
          createdAt: new Date().toISOString()
  }
        message: 'Category definition created successfully'
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid category definition data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to create category definition:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create category definition',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // List category definitions
  fastify.get('/categorization/categories', {
    preHandler: [requirePermission('admin:categorization:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const {
        type,
        parentCategory,
        riskLevel,
        limit,
        offset
      } = request.query as {
        type?: CategorizationType;
        parentCategory?: string;
        riskLevel?: 'low' | 'medium' | 'high' | 'critical';
        limit?: string;
        offset?: string;
      };

      // This would implement actual categories listing from database
      return reply.code(200).send({
        success: true,
        data: [],
        meta: {
          totalCount: 0,
          limit: parseInt(limit || '20', 10),
          offset: parseInt(offset || '0', 10),
          filters: {
            type,
            parentCategory,
            riskLevel
          }
        }
      });

    } catch (error) {
      fastify.log.error('Failed to list category definitions:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve category definitions'
      });
    }
  });

  // Get categorization analytics
  fastify.get('/categorization/analytics', {
    preHandler: [requirePermission('admin:categorization:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const {
        timeframe,
        itemType,
        breakdown
      } = request.query as {
        timeframe?: 'hour' | 'day' | 'week' | 'month';
        itemType?: CategorizationType;
        breakdown?: 'category' | 'method' | 'confidence' | 'risk';
      };

      const analytics = await categorizationService.getCategorizationStats();

      return reply.code(200).send({
        success: true,
        data: {
          summary: analytics,
          timeframe: timeframe || 'day',
          breakdown: breakdown || 'category',
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      fastify.log.error('Failed to get categorization analytics:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve categorization analytics'
      });
    }
  });

  // Test categorization rules
  fastify.post('/categorization/test', {
    preHandler: [requirePermission('admin:categorization:manage')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const testData = z.object({
        itemData: z.record(z.any()),
        itemType: z.nativeEnum(CategorizationType),
        ruleIds: z.array(z.string()).optional()
      }).parse(request.body);

      // This would implement rule testing functionality
      const testResults = {
        matchingRules: [],
        suggestedCategories: [],
        confidence: 0,
        processingTime: 100
      };

      return reply.code(200).send({
        success: true,
        data: testResults
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid test data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to test categorization rules:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to test categorization rules'
      });
    }
  });

  // Get categorization metadata (for UI forms)
  fastify.get('/categorization/metadata', {
    preHandler: [requirePermission('admin:categorization:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const metadata = {
        itemTypes: Object.values(CategorizationType),
        statuses: Object.values(CategorizationStatus),
        confidenceLevels: Object.values(ConfidenceLevel),
        riskLevels: ['low', 'medium', 'high', 'critical'],
        priorities: ['low', 'medium', 'high', 'critical'],
        assignmentTypes: ['user', 'team', 'role', 'permission', 'queue', 'workflow'],
        actionTypes: ['categorize', 'assign', 'flag', 'escalate', 'notify'],
        operators: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'contains', 'matches'],
        logicalOperators: ['AND', 'OR']
      };

      return reply.code(200).send({
        success: true,
        data: metadata
      });

    } catch (error) {
      fastify.log.error('Failed to get categorization metadata:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve categorization metadata'
      });
    }
  });

  // Health check for categorization system
  fastify.get('/categorization/health', {
    preHandler: [requirePermission('admin:system:read')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const stats = await categorizationService.getCategorizationStats();
      
      const health = {
        status: 'healthy',
        totalRequests: stats.totalRequests,
        pendingRequests: stats.pendingRequests,
        successRate: stats.successRate,
        averageProcessingTime: stats.averageProcessingTime,
        averageConfidence: stats.averageConfidence,
        activeRules: 0, // Would count from database
        activeCategories: 0, // Would count from database
        lastProcessed: new Date().toISOString(),
        systemLoad: 'normal'
      };

      return reply.code(200).send({
        success: true,
        data: health
      });

    } catch (error) {
      fastify.log.error('Categorization system health check failed:', error);
      return reply.code(500).send({
        success: false,
        error: 'Health check failed',
        data: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  });

  // Bulk categorization endpoint
  fastify.post('/categorization/bulk', {
    preHandler: [requirePermission('admin:categorization:create')]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const bulkData = z.object({
        items: z.array(z.object({
          itemId: z.string(),
          itemType: z.nativeEnum(CategorizationType),
          itemData: z.record(z.any())
        })).min(1).max(100), // Limit bulk operations
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
        options: z.object({
          enableMLCategorization: z.boolean().optional(),
          enableRuleBasedCategorization: z.boolean().optional(),
          autoAssign: z.boolean().optional(),
          confidenceThreshold: z.number().min(0).max(100).optional()
        }).optional()
      }).parse(request.body);

      const requestIds: string[] = [];
      
      for (const item of bulkData.items) {
        const requestId = await categorizationService.categorizeItem(
          item.itemId,
          item.itemType,
          item.itemData,
          request.user!.id,
          {
            priority: bulkData.priority,
            categorizationOptions: bulkData.options
          }
        );
        requestIds.push(requestId);
      }

      return reply.code(202).send({
        success: true,
        data: {
          requestIds,
          totalItems: bulkData.items.length,
          status: 'submitted',
          message: 'Bulk categorization requests submitted for processing'
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid bulk categorization data',
          details: error.errors
        });
      }

      fastify.log.error('Failed to submit bulk categorization:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to submit bulk categorization requests'
      });
    }
  });
}

export default registerAutomatedCategorizationRoutes;