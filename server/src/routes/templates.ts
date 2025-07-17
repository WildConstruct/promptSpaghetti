/**
 * Epic 9.2.6 - Template Management API Routes
 * RESTful API for project template CRUD operations, search, and analytics
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Template validation schemas
const TemplateVariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  type: z.enum(['text', 'number', 'boolean', 'select', 'textarea']),
  description: z.string(),
  default_value: z.any(),
  required: z.boolean(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    options: z.array(z.string()).optional()
  }).optional()
});

const CustomizationPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['node_properties', 'graph_structure', 'styling', 'behavior']),
  target_nodes: z.array(z.string()),
  properties: z.array(z.string()),
  description: z.string(),
  ui_component: z.enum(['input', 'select', 'color_picker', 'slider', 'toggle'])
});

const ProjectTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  version: z.string(),
  preview_image: z.string().optional(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional()
  }),
  graph_data: z.any(),
  variables: z.array(TemplateVariableSchema),
  customization_points: z.array(CustomizationPointSchema),
  complexity_level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_time: z.number().positive(),
  prerequisites: z.array(z.string()),
  learning_objectives: z.array(z.string()),
  is_public: z.boolean(),
  is_featured: z.boolean()
});

const TemplateCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  parent_id: z.string().optional()
});

export default async function templateRoutes(fastify: FastifyInstance) {
  // Template CRUD Operations
  
  // Create template
  fastify.post('/api/templates', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const templateData = ProjectTemplateSchema.parse(request.body);
      
      // Validate user permissions
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' });
      }

      const templateId = crypto.randomUUID();
      const now = new Date().toISOString();

      const template = {
        ...templateData,
        id: templateId,
        author: {
          id: userId,
          name: request.user.name,
          avatar: request.user.avatar
        },
        created_at: now,
        updated_at: now,
        usage_count: 0,
        rating: 0
      };

      // Store in database
      await fastify.db.query(`
        INSERT INTO resources (
          id, project_id, name, type, content_type, json_meta, 
          content_data, created_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, 'template', 'application/json', $4, $5, $6, $7, $8
        )
      `, [
        templateId,
        request.body.project_id || null, // Templates can be global or project-specific
        template.name,
        JSON.stringify({
          category: template.category,
          tags: template.tags,
          complexity_level: template.complexity_level,
          estimated_time: template.estimated_time,
          is_public: template.is_public,
          is_featured: template.is_featured
        }),
        JSON.stringify(template),
        userId,
        now,
        now
      ]);

      // Log activity
      await fastify.db.query(`
        INSERT INTO activity_events (workspace_id, actor_id, event_type, event_data)
        VALUES ($1, $2, 'template_created', $3)
      `, [
        request.body.workspace_id,
        userId,
        JSON.stringify({ template_id: templateId, template_name: template.name })
      ]);

      reply.status(201).send(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      
      fastify.log.error('Failed to create template:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get template by ID
  fastify.get('/api/templates/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const templateId = request.params.id;
      
      const result = await fastify.db.query(`
        SELECT content_data, json_meta, created_by, created_at, updated_at
        FROM resources
        WHERE id = $1 AND type = 'template'
      `, [templateId]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      const template = result.rows[0].content_data;
      reply.send(template);
    } catch (error) {
      fastify.log.error('Failed to get template:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update template
  fastify.put('/api/templates/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const templateId = request.params.id;
      const updates = ProjectTemplateSchema.partial().parse(request.body);
      
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' });
      }

      // Check if template exists and user has permission
      const existing = await fastify.db.query(`
        SELECT content_data, created_by FROM resources
        WHERE id = $1 AND type = 'template'
      `, [templateId]);

      if (existing.rows.length === 0) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      const existingTemplate = existing.rows[0].content_data;
      if (existingTemplate.author.id !== userId) {
        return reply.status(403).send({ error: 'Permission denied' });
      }

      const updatedTemplate = {
        ...existingTemplate,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await fastify.db.query(`
        UPDATE resources
        SET content_data = $1, json_meta = $2, updated_at = $3
        WHERE id = $4
      `, [
        JSON.stringify(updatedTemplate),
        JSON.stringify({
          category: updatedTemplate.category,
          tags: updatedTemplate.tags,
          complexity_level: updatedTemplate.complexity_level,
          estimated_time: updatedTemplate.estimated_time,
          is_public: updatedTemplate.is_public,
          is_featured: updatedTemplate.is_featured
        }),
        updatedTemplate.updated_at,
        templateId
      ]);

      reply.send(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      
      fastify.log.error('Failed to update template:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Delete template
  fastify.delete('/api/templates/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const templateId = request.params.id;
      const userId = request.user?.id;
      
      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' });
      }

      // Check ownership
      const existing = await fastify.db.query(`
        SELECT content_data FROM resources
        WHERE id = $1 AND type = 'template'
      `, [templateId]);

      if (existing.rows.length === 0) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      const template = existing.rows[0].content_data;
      if (template.author.id !== userId) {
        return reply.status(403).send({ error: 'Permission denied' });
      }

      await fastify.db.query('DELETE FROM resources WHERE id = $1', [templateId]);
      
      reply.status(204).send();
    } catch (error) {
      fastify.log.error('Failed to delete template:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Search templates
  fastify.get('/api/templates', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as any;
      
      let sql = `
        SELECT content_data, json_meta, created_at
        FROM resources
        WHERE type = 'template'
      `;
      const params: any[] = [];
      let paramIndex = 1;

      // Add filters
      if (query.category) {
        sql += ` AND json_meta->>'category' = $${paramIndex}`;
        params.push(query.category);
        paramIndex++;
      }

      if (query.complexity) {
        sql += ` AND json_meta->>'complexity_level' = $${paramIndex}`;
        params.push(query.complexity);
        paramIndex++;
      }

      if (query.is_public !== undefined) {
        sql += ` AND (json_meta->>'is_public')::boolean = $${paramIndex}`;
        params.push(query.is_public === 'true');
        paramIndex++;
      }

      if (query.is_featured !== undefined) {
        sql += ` AND (json_meta->>'is_featured')::boolean = $${paramIndex}`;
        params.push(query.is_featured === 'true');
        paramIndex++;
      }

      if (query.tags) {
        const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
        sql += ` AND json_meta->'tags' ?| $${paramIndex}`;
        params.push(tags);
        paramIndex++;
      }

      if (query.search) {
        sql += ` AND (
          name ILIKE $${paramIndex} OR 
          (content_data->>'description') ILIKE $${paramIndex}
        )`;
        params.push(`%${query.search}%`);
        paramIndex++;
      }

      // Add sorting
      const sortBy = query.sort_by || 'created_at';
      switch (sortBy) {
        case 'popularity':
          sql += ` ORDER BY (content_data->>'usage_count')::int DESC`;
          break;
        case 'rating':
          sql += ` ORDER BY (content_data->>'rating')::float DESC`;
          break;
        case 'newest':
          sql += ` ORDER BY created_at DESC`;
          break;
        case 'name':
          sql += ` ORDER BY name ASC`;
          break;
        default:
          sql += ` ORDER BY created_at DESC`;
      }

      // Add pagination
      const limit = Math.min(parseInt(query.limit) || 20, 100);
      const offset = parseInt(query.offset) || 0;
      
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await fastify.db.query(sql, params);
      
      // Get total count
      let countSql = `
        SELECT COUNT(*) as total
        FROM resources
        WHERE type = 'template'
      `;
      const countResult = await fastify.db.query(countSql, params.slice(0, -2)); // Remove limit/offset

      const templates = result.rows.map(row => row.content_data);
      const total = parseInt(countResult.rows[0].total);

      reply.send({
        templates,
        total,
        limit,
        offset
      });
    } catch (error) {
      fastify.log.error('Failed to search templates:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get featured templates
  fastify.get('/api/templates/featured', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await fastify.db.query(`
        SELECT content_data
        FROM resources
        WHERE type = 'template' 
          AND (json_meta->>'is_featured')::boolean = true
          AND (json_meta->>'is_public')::boolean = true
        ORDER BY (content_data->>'rating')::float DESC
        LIMIT 10
      `);

      const templates = result.rows.map(row => row.content_data);
      reply.send(templates);
    } catch (error) {
      fastify.log.error('Failed to get featured templates:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Record template usage
  fastify.post('/api/templates/:id/usage', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const templateId = request.params.id;
      const userId = request.user?.id;

      // Update usage count
      await fastify.db.query(`
        UPDATE resources
        SET content_data = jsonb_set(
          content_data,
          '{usage_count}',
          ((content_data->>'usage_count')::int + 1)::text::jsonb
        )
        WHERE id = $1 AND type = 'template'
      `, [templateId]);

      // Log usage event
      if (userId) {
        await fastify.db.query(`
          INSERT INTO activity_events (actor_id, event_type, event_data)
          VALUES ($1, 'template_used', $2)
        `, [userId, JSON.stringify({ template_id: templateId })]);
      }

      reply.status(200).send({ success: true });
    } catch (error) {
      fastify.log.error('Failed to record template usage:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Rate template
  fastify.post('/api/templates/:id/ratings', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const templateId = request.params.id;
      const { rating, review } = request.body as { rating: number; review?: string };
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' });
      }

      if (rating < 1 || rating > 5) {
        return reply.status(400).send({ error: 'Rating must be between 1 and 5' });
      }

      // Store rating (you'd need a ratings table for this)
      // For now, we'll just update the average rating in the template
      
      // This is a simplified implementation - in production you'd want proper rating storage
      const result = await fastify.db.query(`
        SELECT content_data FROM resources
        WHERE id = $1 AND type = 'template'
      `, [templateId]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      // In a real implementation, you'd calculate the actual average from a ratings table
      const currentRating = result.rows[0].content_data.rating || 0;
      const newRating = (currentRating + rating) / 2; // Simplified calculation

      await fastify.db.query(`
        UPDATE resources
        SET content_data = jsonb_set(
          content_data,
          '{rating}',
          $2::text::jsonb
        )
        WHERE id = $1
      `, [templateId, newRating.toFixed(1)]);

      reply.send({ success: true, new_rating: newRating });
    } catch (error) {
      fastify.log.error('Failed to rate template:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Template Categories
  
  // Create category
  fastify.post('/api/template-categories', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categoryData = TemplateCategorySchema.parse(request.body);
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: 'Authentication required' });
      }

      const categoryId = crypto.randomUUID();
      const category = {
        ...categoryData,
        id: categoryId
      };

      // Store category metadata (could be in a separate table or in resources)
      // For simplicity, storing in a metadata table or as a special resource type
      
      reply.status(201).send(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.errors });
      }
      
      fastify.log.error('Failed to create category:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get categories
  fastify.get('/api/template-categories', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Return default categories for now
      const defaultCategories = [
        {
          id: 'workflow',
          name: 'Workflow Templates',
          description: 'Pre-built workflow patterns and processes',
          icon: 'workflow',
          color: '#3B82F6'
        },
        {
          id: 'data-processing',
          name: 'Data Processing',
          description: 'Templates for data transformation and analysis',
          icon: 'database',
          color: '#10B981'
        },
        {
          id: 'automation',
          name: 'Automation',
          description: 'Automated task and process templates',
          icon: 'robot',
          color: '#F59E0B'
        },
        {
          id: 'content',
          name: 'Content Generation',
          description: 'Templates for content creation and management',
          icon: 'document',
          color: '#8B5CF6'
        },
        {
          id: 'analysis',
          name: 'Analysis & Reporting',
          description: 'Templates for analysis and reporting workflows',
          icon: 'chart',
          color: '#EF4444'
        }
      ];

      reply.send(defaultCategories);
    } catch (error) {
      fastify.log.error('Failed to get categories:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get template analytics
  fastify.get('/api/templates/:id/analytics', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const templateId = request.params.id;

      // This would query actual analytics data
      // For now, return mock data
      const analytics = {
        template_id: templateId,
        total_uses: 42,
        unique_users: 15,
        success_rate: 0.85,
        average_rating: 4.2,
        completion_rate: 0.78,
        most_used_customizations: ['color_scheme', 'node_size', 'layout_type'],
        trend_data: [
          { date: '2024-01-01', uses: 5 },
          { date: '2024-01-02', uses: 8 },
          { date: '2024-01-03', uses: 12 },
          { date: '2024-01-04', uses: 7 },
          { date: '2024-01-05', uses: 10 }
        ]
      };

      reply.send(analytics);
    } catch (error) {
      fastify.log.error('Failed to get template analytics:', error);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
}