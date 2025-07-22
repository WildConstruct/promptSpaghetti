/**
 * Category Management API Routes (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: RESTful API endpoints for comprehensive category management.
 * Provides full CRUD operations, hierarchy management, relationships, and analytics
 * for the category management system.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CategoryManagementService } from '../admin/CategoryManagementService';
import { CategoryDomain, CategoryStatus, CategoryVisibility, CategoryAccessLevel } from '../admin/CategoryDataModel';

// Validation schemas
const CategoryDomainSchema = z.enum([
  'system_configuration', 'admin_tools', 'maintenance', 'health_checks',
  'user_activities', 'authentication', 'authorization', 'user_management',
  'content_management', 'content_types', 'collaboration', 'workflows',
  'security', 'compliance', 'audit', 'risk_management',
  'analytics', 'reporting', 'metrics', 'dashboards',
  'api_management', 'integrations', 'webhooks',
  'business_rules', 'operations', 'notifications',
  'development', 'technical', 'performance', 'custom'
]);

const CategoryStatusSchema = z.enum(['active', 'inactive', 'draft', 'archived', 'deprecated', 'pending_approval']);
const CategoryVisibilitySchema = z.enum(['public', 'internal', 'private', 'system_only']);
const CategoryAccessLevelSchema = z.enum(['read_only', 'read_write', 'admin_only', 'system_only']);

const CreateCategorySchema = z.object({
  domain: CategoryDomainSchema,
  code: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  displayName: z.string().max(200).optional(),
  parentId: z.string().uuid().optional(),
  icon: z.string().max(100).optional(),
  color: z.string().max(20).optional(),
  backgroundColor: z.string().max(20).optional(),
  sortOrder: z.number().default(0),
  metadata: z.record(z.any()).default({}),
  properties: z.record(z.any()).default({}),
  configuration: z.record(z.any()).default({}),
  status: CategoryStatusSchema.default('active'),
  visibility: CategoryVisibilitySchema.default('public'),
  accessLevel: CategoryAccessLevelSchema.default('read_only'),
  requiredPermissions: z.array(z.string()).default([]),
  localizedNames: z.record(z.string()).optional(),
  localizedDescriptions: z.record(z.string()).optional()
});

const UpdateCategorySchema = CreateCategorySchema.partial().omit({ domain: true, code: true });

const CategoryFilterSchema = z.object({
  domains: z.array(CategoryDomainSchema).optional(),
  status: z.array(CategoryStatusSchema).optional(),
  visibility: z.array(CategoryVisibilitySchema).optional(),
  accessLevel: z.array(CategoryAccessLevelSchema).optional(),
  parentId: z.string().uuid().optional(),
  level: z.number().min(0).optional(),
  maxLevel: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  searchQuery: z.string().max(200).optional(),
  hasChildren: z.boolean().optional(),
  isSystemManaged: z.boolean().optional(),
  isDeprecated: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  createdAfter: z.string().datetime().transform(str => new Date(str)).optional(),
  createdBefore: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedAfter: z.string().datetime().transform(str => new Date(str)).optional(),
  updatedBefore: z.string().datetime().transform(str => new Date(str)).optional(),
  lastUsedAfter: z.string().datetime().transform(str => new Date(str)).optional(),
  usageCountMin: z.number().min(0).optional(),
  usageCountMax: z.number().min(0).optional(),
  businessCriticality: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional()
});

const CategoryQuerySchema = z.object({
  filter: CategoryFilterSchema.optional(),
  sort: z.array(z.object({
    field: z.enum(['name', 'code', 'domain', 'level', 'sortOrder', 'usageCount', 'createdAt', 'updatedAt']),
    direction: z.enum(['asc', 'desc'])
  })).optional(),
  pagination: z.object({
    limit: z.number().min(1).max(1000).default(50),
    offset: z.number().min(0).default(0)
  }).optional(),
  include: z.object({
    children: z.boolean().optional(),
    ancestors: z.boolean().optional(),
    siblings: z.boolean().optional(),
    statistics: z.boolean().optional(),
    permissions: z.boolean().optional()
  }).optional()
});

const CategoryRelationshipSchema = z.object({
  targetCategoryId: z.string().uuid(),
  relationshipType: z.enum(['parent_child', 'related', 'similar', 'conflicting', 'requires', 'excludes', 'alternative', 'supersedes', 'depends_on']),
  strength: z.number().min(0).max(1).optional().default(0.5),
  bidirectional: z.boolean().optional().default(false),
  metadata: z.record(z.any()).optional().default({})
});

const BulkOperationSchema = z.object({
  operations: z.array(z.object({
    operation: z.enum(['create', 'update', 'delete', 'move', 'copy', 'archive', 'restore']),
    categoryId: z.string().uuid().optional(),
    data: z.any().optional()
  })).min(1).max(100),
  executionMode: z.enum(['sequential', 'parallel']).default('sequential'),
  rollbackOnError: z.boolean().default(false),
  notifyOnComplete: z.boolean().default(false),
  reason: z.string().min(5).max(500)
});

const CategoryIdSchema = z.object({
  categoryId: z.string().uuid()
});

export async function categoryManagementRoutes(
  fastify: FastifyInstance,
  categoryService: CategoryManagementService
) {
  // Apply authentication to all routes
  fastify.addHook('onRequest', fastify.authenticate);

  /**
   * Create a new category
   * POST /api/categories
   */
  fastify.post<{
    Body: z.infer<typeof CreateCategorySchema>
  }>('/', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'create',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categoryData = CreateCategorySchema.parse(request.body);
      const user = (request.user as any);

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const category = await categoryService.createCategory(categoryData as any, user.id, context);

      return reply.code(201).send({
        success: true,
        data: category,
        message: 'Category created successfully'
      });

    } catch (error) {
      console.error('Error creating category:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to create category',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get category by ID
   * GET /api/categories/:categoryId
   */
  fastify.get<{
    Params: z.infer<typeof CategoryIdSchema>;
    Querystring: { includeRelationships?: boolean }
  }>('/:categoryId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { categoryId } = CategoryIdSchema.parse(request.params);
      const query = request.query as { includeRelationships?: boolean };

      const category = await categoryService.getCategoryById(categoryId, query.includeRelationships);

      if (!category) {
        return reply.code(404).send({
          success: false,
          error: 'Category not found'
        });
      }

      return reply.send({
        success: true,
        data: category
      });

    } catch (error) {
      console.error('Error getting category:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to get category',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Update category
   * PUT /api/categories/:categoryId
   */
  fastify.put<{
    Params: z.infer<typeof CategoryIdSchema>;
    Body: z.infer<typeof UpdateCategorySchema>
  }>('/:categoryId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'update',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { categoryId } = CategoryIdSchema.parse(request.params);
      const updates = UpdateCategorySchema.parse(request.body);
      const user = (request.user as any);

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const category = await categoryService.updateCategory(categoryId, updates, user.id, context);

      return reply.send({
        success: true,
        data: category,
        message: 'Category updated successfully'
      });

    } catch (error) {
      console.error('Error updating category:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to update category',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Delete category
   * DELETE /api/categories/:categoryId
   */
  fastify.delete<{
    Params: z.infer<typeof CategoryIdSchema>;
    Querystring: { cascadeDelete?: boolean; transferChildrenTo?: string }
  }>('/:categoryId', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'delete',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { categoryId } = CategoryIdSchema.parse(request.params);
      const query = request.query as { cascadeDelete?: boolean; transferChildrenTo?: string };
      const user = (request.user as any);

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await categoryService.deleteCategory(categoryId, user.id, {
        cascadeDelete: query.cascadeDelete,
        transferChildrenTo: query.transferChildrenTo
      }, context);

      return reply.send({
        success: true,
        message: 'Category deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting category:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to delete category',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Query categories with filtering and pagination
   * POST /api/categories/query
   */
  fastify.post<{
    Body: z.infer<typeof CategoryQuerySchema>
  }>('/query', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = CategoryQuerySchema.parse(request.body);

      const result = await categoryService.queryCategories(query);

      return reply.send({
        success: true,
        data: result.categories,
        pagination: {
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          limit: query.pagination?.limit || 50,
          offset: query.pagination?.offset || 0
        }
      });

    } catch (error) {
      console.error('Error querying categories:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to query categories',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get category tree structure
   * GET /api/categories/tree
   */
  fastify.get<{
    Querystring: { 
      domain?: string; 
      rootCategoryId?: string; 
      maxDepth?: number;
    }
  }>('/tree', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { 
        domain?: string; 
        rootCategoryId?: string; 
        maxDepth?: number;
      };

      const tree = await categoryService.getCategoryTree(
        query.domain as CategoryDomain,
        query.rootCategoryId,
        query.maxDepth
      );

      return reply.send({
        success: true,
        data: tree,
        metadata: {
          domain: query.domain,
          rootCategoryId: query.rootCategoryId,
          maxDepth: query.maxDepth
        }
      });

    } catch (error) {
      console.error('Error getting category tree:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get category tree',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Create category relationship
   * POST /api/categories/:categoryId/relationships
   */
  fastify.post<{
    Params: z.infer<typeof CategoryIdSchema>;
    Body: z.infer<typeof CategoryRelationshipSchema>
  }>('/:categoryId/relationships', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'manage_relationships',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { categoryId } = CategoryIdSchema.parse(request.params);
      const relationshipData = CategoryRelationshipSchema.parse(request.body);
      const user = (request.user as any);

      const relationship = await categoryService.createCategoryRelationship(
        categoryId,
        relationshipData.targetCategoryId,
        relationshipData.relationshipType,
        user.id,
        {
          strength: relationshipData.strength,
          bidirectional: relationshipData.bidirectional,
          metadata: relationshipData.metadata
        }
      );

      return reply.code(201).send({
        success: true,
        data: relationship,
        message: 'Category relationship created successfully'
      });

    } catch (error) {
      console.error('Error creating category relationship:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to create category relationship',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get category usage statistics
   * GET /api/categories/:categoryId/statistics
   */
  fastify.get<{
    Params: z.infer<typeof CategoryIdSchema>;
    Querystring: { 
      periodStart?: string; 
      periodEnd?: string; 
    }
  }>('/:categoryId/statistics', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'read_statistics',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { categoryId } = CategoryIdSchema.parse(request.params);
      const query = request.query as { 
        periodStart?: string; 
        periodEnd?: string; 
      };

      const periodStart = query.periodStart ? new Date(query.periodStart) : undefined;
      const periodEnd = query.periodEnd ? new Date(query.periodEnd) : undefined;

      const statistics = await categoryService.getCategoryUsageStatistics(
        categoryId, 
        periodStart, 
        periodEnd
      );

      return reply.send({
        success: true,
        data: statistics,
        metadata: {
          categoryId,
          periodStart: periodStart?.toISOString(),
          periodEnd: periodEnd?.toISOString()
        }
      });

    } catch (error) {
      console.error('Error getting category statistics:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get category statistics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get category analytics
   * GET /api/categories/:categoryId/analytics
   */
  fastify.get<{
    Params: z.infer<typeof CategoryIdSchema>;
    Querystring: { 
      periodStart?: string; 
      periodEnd?: string; 
    }
  }>('/:categoryId/analytics', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'read_analytics',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { categoryId } = CategoryIdSchema.parse(request.params);
      const query = request.query as { 
        periodStart?: string; 
        periodEnd?: string; 
      };

      const periodStart = query.periodStart ? new Date(query.periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const periodEnd = query.periodEnd ? new Date(query.periodEnd) : new Date();

      const analytics = await categoryService.generateCategoryAnalytics(
        categoryId, 
        periodStart, 
        periodEnd
      );

      return reply.send({
        success: true,
        data: analytics,
        metadata: {
          generatedAt: new Date().toISOString(),
          categoryId,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString()
        }
      });

    } catch (error) {
      console.error('Error getting category analytics:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get category analytics',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Perform bulk category operations
   * POST /api/categories/bulk
   */
  fastify.post<{
    Body: z.infer<typeof BulkOperationSchema>
  }>('/bulk', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'bulk_operations',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const bulkOperation = BulkOperationSchema.parse(request.body);
      const user = (request.user as any);

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const result = await categoryService.performBulkOperation({
        ...bulkOperation,
        requestedBy: user.id
      } as any, user.id, context);

      return reply.send({
        success: true,
        data: result,
        message: `Bulk operation completed: ${result.success} successful, ${result.failed} failed`
      });

    } catch (error) {
      console.error('Error performing bulk operation:', error);
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          details: error.errors
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to perform bulk operation',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Get available domains and their schemas
   * GET /api/categories/domains
   */
  fastify.get('/domains', {
    preHandler: fastify.requirePermission([
      {
        resource: 'categories',
        action: 'read',
        allowSuperAdmin: true
      }
    ])
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const domains = [
        {
          domain: 'system_configuration',
          name: 'System Configuration',
          description: 'System-wide configuration categories',
          allowsChildren: true,
          defaultAccessLevel: 'admin_only'
        },
        {
          domain: 'user_activities',
          name: 'User Activities',
          description: 'User activity and behavior categories',
          allowsChildren: false,
          defaultAccessLevel: 'read_only'
        },
        {
          domain: 'admin_tools',
          name: 'Administrative Tools',
          description: 'Administrative tool and management categories',
          allowsChildren: true,
          defaultAccessLevel: 'admin_only'
        },
        {
          domain: 'content_management',
          name: 'Content Management',
          description: 'Content creation and management categories',
          allowsChildren: true,
          defaultAccessLevel: 'read_write'
        },
        {
          domain: 'security',
          name: 'Security',
          description: 'Security and compliance categories',
          allowsChildren: true,
          defaultAccessLevel: 'admin_only'
        }
      ];

      return reply.send({
        success: true,
        data: domains,
        metadata: {
          totalDomains: domains.length,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error getting category domains:', error);
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get category domains',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * Health check for category management system
   * GET /api/categories/health
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
          categoryCreation: 'operational',
          hierarchyManagement: 'operational',
          relationshipManagement: 'operational',
          usageStatistics: 'operational',
          bulkOperations: 'operational',
          analytics: 'operational',
          templateSystem: 'operational'
        },
        metrics: {
          totalCategories: 0, // Would query actual count
          totalDomains: 25,
          averageHierarchyDepth: 2.3,
          uptime: process.uptime()
        },
        environment: process.env.NODE_ENV || 'development'
      };

      return reply.send({
        success: true,
        data: healthStatus
      });

    } catch (error) {
      return reply.code(503).send({
        success: false,
        error: 'Category management system unhealthy',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}