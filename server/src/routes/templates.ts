/**
 * Epic 9.2.6 - Template API Routes
 * REST API endpoints for project template functionality
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TemplateService } from '../services/template-service';
import { TemplateDAO } from '../database/template-dao';
import { WorkspaceDAO } from '../database/workspace-dao';
import {
  CreateProjectTemplateSchema,
  UpdateProjectTemplateSchema,
  CreateTemplateReviewSchema,
  UpdateTemplateReviewSchema,
  CreateTemplateUsageSchema,
  UpdateTemplateUsageSchema
} from '../database/template-models';

// Request schemas
const GetTemplatesQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  sort_by: z.enum(['name', 'created_at', 'updated_at', 'rating_average', 'usage_count', 'relevance']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated string
  difficulty_level: z.string().optional(), // Comma-separated string
  visibility: z.string().optional(), // Comma-separated string
  min_rating: z.coerce.number().min(1).max(5).optional(),
  is_featured: z.coerce.boolean().optional(),
  created_by: z.string().optional(),
  workspace_id: z.string().uuid().optional()
});

const UseTemplateSchema = z.object({
  customizations: z.record(z.unknown()).default({}),
  project_name: z.string().min(1),
  project_description: z.string().optional(),
  workspace_id: z.string().uuid()
});

const CompleteUsageSchema = z.object({
  completion_status: z.enum(['completed', 'abandoned']),
  time_to_complete_minutes: z.number().int().positive().optional(),
  user_rating: z.number().int().min(1).max(5).optional(),
  user_feedback: z.string().optional()
});

const ExportTemplateQuerySchema = z.object({
  format: z.enum(['json', 'yaml', 'zip']).optional().default('json'),
  include_analytics: z.coerce.boolean().optional().default(false)
});

const UUIDParamSchema = z.object({
  id: z.string().uuid()
});

// Mock user authentication - in real implementation, this would extract from JWT
function getCurrentUser(request: FastifyRequest): string {
  return request.headers['x-user-id'] as string || 'dev-user-123';
}

export async function templateRoutes(fastify: FastifyInstance) {
  // Initialize services
  const templateDAO = new TemplateDAO(fastify.db);
  const workspaceDAO = new WorkspaceDAO(fastify.db);
  const templateService = new TemplateService(templateDAO, workspaceDAO, {
    getUserInfo: async (userId: string) => {
      return { name: `User ${userId}`, avatar: undefined };
    },
    checkWorkspaceAccess: async (workspaceId: string, userId: string, permission: number) => {
      // Simplified permission check - in real app, this would check ACL
      return true;
    },
    generateThumbnail: async (templateData: Record<string, any>) => {
      // Mock thumbnail generation - in real app, this would generate actual thumbnails
      return `https://api.placeholder.com/300x200?text=${encodeURIComponent('Template')}`;
    },
    sendNotification: async (userId: string, notification: any) => {
      fastify.log.info('Notification sent:', notification);
    }
  });

  // ====== TEMPLATE ENDPOINTS ======

  // GET /api/templates - List templates with filtering and sorting
  fastify.get<{
    Querystring: z.infer<typeof GetTemplatesQuerySchema>;
  }>('/templates', {
    schema: {
      querystring: GetTemplatesQuerySchema,
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const {
        search, category, tags, difficulty_level, visibility, min_rating,
        is_featured, created_by, workspace_id, ...pagination
      } = request.query;

      // Parse comma-separated arrays
      const filter: any = {
        search,
        category,
        min_rating,
        is_featured,
        created_by,
        workspace_id
      };

      if (tags) {
        filter.tags = tags.split(',').map(tag => tag.trim());
      }
      if (difficulty_level) {
        filter.difficulty_level = difficulty_level.split(',').map(level => level.trim());
      }
      if (visibility) {
        filter.visibility = visibility.split(',').map(vis => vis.trim());
      }

      const sort = {
        sort_by: request.query.sort_by,
        sort_order: request.query.sort_order
      };

      const result = await templateService.getTemplates(filter, sort, pagination, userId);
      return result;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch templates', message: error.message });
    }
  });

  // POST /api/templates - Create new template
  fastify.post<{
    Body: z.infer<typeof CreateProjectTemplateSchema>;
  }>('/templates', {
    schema: {
      body: CreateProjectTemplateSchema,
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const template = await templateService.createTemplate(request.body, userId);
      
      reply.code(201).send(template);
    } catch (error) {
      const statusCode = error.message.includes('Access denied') ? 403 : 400;
      reply.code(statusCode).send({ error: 'Failed to create template', message: error.message });
    }
  });

  // GET /api/templates/:id - Get template by ID with stats
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/templates/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const template = await templateService.getTemplate(request.params.id, userId);
      
      if (!template) {
        return reply.code(404).send({ error: 'Template not found' });
      }
      
      return template;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch template', message: error.message });
      }
    }
  });

  // PUT /api/templates/:id - Update template
  fastify.put<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: z.infer<typeof UpdateProjectTemplateSchema>;
  }>('/templates/:id', {
    schema: {
      params: UUIDParamSchema,
      body: UpdateProjectTemplateSchema,
      response: {
        200: z.any(),
        404: z.object({ error: z.string() })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const template = await templateService.updateTemplate(
        request.params.id,
        request.body,
        userId
      );
      
      if (!template) {
        return reply.code(404).send({ error: 'Template not found' });
      }
      
      return template;
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update template', message: error.message });
      }
    }
  });

  // DELETE /api/templates/:id - Archive template
  fastify.delete<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/templates/:id', {
    schema: {
      params: UUIDParamSchema,
      response: {
        204: z.null(),
        404: z.object({ error: z.string() })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const success = await templateService.archiveTemplate(request.params.id, userId);
      
      if (!success) {
        return reply.code(404).send({ error: 'Template not found' });
      }
      
      reply.code(204).send();
    } catch (error) {
      if (error.message.includes('Insufficient permissions')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to archive template', message: error.message });
      }
    }
  });

  // POST /api/templates/:id/publish - Publish template
  fastify.post<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/templates/:id/publish', {
    schema: {
      params: UUIDParamSchema,
      response: {
        200: z.object({ message: z.string() })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const success = await templateService.publishTemplate(request.params.id, userId);
      
      if (!success) {
        return reply.code(404).send({ error: 'Template not found' });
      }
      
      return { message: 'Template published successfully' };
    } catch (error) {
      if (error.message.includes('Only the template creator')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else if (error.message.includes('validation failed')) {
        reply.code(400).send({ error: 'Validation failed', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to publish template', message: error.message });
      }
    }
  });

  // POST /api/templates/:id/use - Use template to create project
  fastify.post<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: z.infer<typeof UseTemplateSchema>;
  }>('/templates/:id/use', {
    schema: {
      params: UUIDParamSchema,
      body: UseTemplateSchema,
      response: {
        201: z.object({
          project: z.any(),
          usage: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { customizations, project_name, project_description, workspace_id } = request.body;
      
      const result = await templateService.useTemplate(
        request.params.id,
        customizations,
        {
          name: project_name,
          description: project_description,
          workspace_id
        },
        userId
      );
      
      reply.code(201).send(result);
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else if (error.message.includes('validation failed')) {
        reply.code(400).send({ error: 'Validation failed', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to use template', message: error.message });
      }
    }
  });

  // GET /api/templates/:id/export - Export template
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
    Querystring: z.infer<typeof ExportTemplateQuerySchema>;
  }>('/templates/:id/export', {
    schema: {
      params: UUIDParamSchema,
      querystring: ExportTemplateQuerySchema,
      response: {
        200: z.any()
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const { format, include_analytics } = request.query;
      
      const exportData = await templateService.exportTemplate(
        request.params.id,
        userId,
        format,
        include_analytics
      );
      
      // Set appropriate content type and filename
      const filename = `${exportData.template.name.replace(/[^a-zA-Z0-9]/g, '_')}_v${exportData.template.version}.${format}`;
      
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (format === 'json') {
        reply.type('application/json');
        return exportData;
      } else if (format === 'yaml') {
        reply.type('application/x-yaml');
        // In real implementation, convert to YAML format
        return exportData;
      } else if (format === 'zip') {
        reply.type('application/zip');
        // In real implementation, create ZIP archive
        return exportData;
      }
      
      return exportData;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to export template', message: error.message });
      }
    }
  });

  // ====== TEMPLATE REVIEWS ENDPOINTS ======

  // GET /api/templates/:id/reviews - Get template reviews
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
    Querystring: {
      page?: number;
      limit?: number;
      min_rating?: number;
      max_rating?: number;
      has_text?: boolean;
    };
  }>('/templates/:id/reviews', {
    schema: {
      params: UUIDParamSchema,
      querystring: z.object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(100).optional().default(20),
        min_rating: z.coerce.number().min(1).max(5).optional(),
        max_rating: z.coerce.number().min(1).max(5).optional(),
        has_text: z.coerce.boolean().optional()
      }),
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { min_rating, max_rating, has_text, ...pagination } = request.query;
      const filter = { min_rating, max_rating, has_text };
      
      const result = await templateService.getTemplateReviews(
        request.params.id,
        filter,
        pagination
      );
      
      return result;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch reviews', message: error.message });
    }
  });

  // POST /api/templates/:id/reviews - Create template review
  fastify.post<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: Omit<z.infer<typeof CreateTemplateReviewSchema>, 'template_id'>;
  }>('/templates/:id/reviews', {
    schema: {
      params: UUIDParamSchema,
      body: CreateTemplateReviewSchema.omit({ template_id: true }),
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const reviewData = {
        ...request.body,
        template_id: request.params.id
      };
      
      const review = await templateService.createTemplateReview(reviewData, userId);
      
      reply.code(201).send(review);
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(400).send({ error: 'Failed to create review', message: error.message });
      }
    }
  });

  // ====== TEMPLATE FAVORITES ENDPOINTS ======

  // POST /api/templates/:id/favorite - Add template to favorites
  fastify.post<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/templates/:id/favorite', {
    schema: {
      params: UUIDParamSchema,
      response: {
        201: z.any()
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const favorite = await templateService.addTemplateFavorite(request.params.id, userId);
      
      reply.code(201).send(favorite);
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(400).send({ error: 'Failed to add favorite', message: error.message });
      }
    }
  });

  // DELETE /api/templates/:id/favorite - Remove template from favorites
  fastify.delete<{
    Params: z.infer<typeof UUIDParamSchema>;
  }>('/templates/:id/favorite', {
    schema: {
      params: UUIDParamSchema,
      response: {
        204: z.null()
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const success = await templateService.removeTemplateFavorite(request.params.id, userId);
      
      if (!success) {
        return reply.code(404).send({ error: 'Favorite not found' });
      }
      
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: 'Failed to remove favorite', message: error.message });
    }
  });

  // GET /api/user/templates/favorites - Get user's favorite templates
  fastify.get<{
    Querystring: {
      page?: number;
      limit?: number;
    };
  }>('/user/templates/favorites', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).max(100).optional().default(20)
      }),
      response: {
        200: z.object({
          data: z.array(z.any()),
          pagination: z.any()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const result = await templateService.getUserFavoriteTemplates(userId, request.query);
      
      return result;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch favorite templates', message: error.message });
    }
  });

  // ====== TEMPLATE ANALYTICS ENDPOINTS ======

  // GET /api/templates/:id/analytics - Get template analytics
  fastify.get<{
    Params: z.infer<typeof UUIDParamSchema>;
    Querystring: {
      days?: number;
    };
  }>('/templates/:id/analytics', {
    schema: {
      params: UUIDParamSchema,
      querystring: z.object({
        days: z.coerce.number().min(1).max(365).optional().default(30)
      }),
      response: {
        200: z.any()
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const analytics = await templateService.getTemplateAnalytics(
        request.params.id,
        userId,
        request.query.days
      );
      
      return analytics;
    } catch (error) {
      if (error.message.includes('Access denied')) {
        reply.code(403).send({ error: 'Access denied', message: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to fetch analytics', message: error.message });
      }
    }
  });

  // ====== TEMPLATE CATEGORIES ENDPOINTS ======

  // GET /api/template-categories - Get all template categories
  fastify.get('/template-categories', {
    schema: {
      response: {
        200: z.array(z.any())
      }
    }
  }, async (request, reply) => {
    try {
      const categories = await templateService.getTemplateCategories();
      return categories;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch categories', message: error.message });
    }
  });

  // ====== TEMPLATE USAGE ENDPOINTS ======

  // PUT /api/template-usages/:id/complete - Complete template usage
  fastify.put<{
    Params: z.infer<typeof UUIDParamSchema>;
    Body: z.infer<typeof CompleteUsageSchema>;
  }>('/template-usages/:id/complete', {
    schema: {
      params: UUIDParamSchema,
      body: CompleteUsageSchema,
      response: {
        200: z.any()
      }
    }
  }, async (request, reply) => {
    try {
      const userId = getCurrentUser(request);
      const usage = await templateService.completeTemplateUsage(
        request.params.id,
        request.body,
        userId
      );
      
      if (!usage) {
        return reply.code(404).send({ error: 'Template usage not found' });
      }
      
      return usage;
    } catch (error) {
      reply.code(500).send({ error: 'Failed to complete template usage', message: error.message });
    }
  });
}