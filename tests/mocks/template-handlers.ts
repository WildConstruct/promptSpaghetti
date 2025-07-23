/**
 * MSW Template API Handlers
 * 
 * Mock handlers for all template-related API endpoints.
 * Provides realistic responses for template CRUD operations, search, and analytics.
 */

import { rest } from 'msw';
import { templateDb } from './data/template-db';
import { validateTemplateData } from './validators/template-validator';

export     const query = url.searchParams.get('query') || '';
    const categoryId = url.searchParams.get('category_id');
    const tags = url.searchParams.getAll('tags');
    const authorId = url.searchParams.get('author_id');
    const sortBy = url.searchParams.get('sort_by') || 'created_at';
    const sortOrder = url.searchParams.get('sort_order') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    try {
      const results = templateDb.searchTemplates({
        query,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        tags,
        authorId: authorId ? parseInt(authorId) : undefined,
        sortBy,
        sortOrder,
        limit,
        offset
      });

      return res(
        ctx.status(200),
        ctx.json({
          templates: results.templates,
          total: results.total,
          page: Math.floor(offset / limit) + 1,
          pageSize: limit,
          totalPages: Math.ceil(results.total / limit)
        })
      );
    } catch {
      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to search templates'
        })
      );
    }
  }),

  // GET /api/templates/:id - Get specific template
  rest.get('/api/templates/:id', (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    const template = templateDb.getTemplate(templateId);
    
    if (!template) {
      return res(
        ctx.status(404),
        ctx.json({ 
          error: 'Not Found',
          message: 'Template not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json(template)
    );
  }),

  // POST /api/templates - Create new template
  rest.post('/api/templates', async (req, res, ctx) => {
    try {
      const templateData = await req.json();
      const userId = req.headers.get('user-id');

      if (!userId) {
        return res(
          ctx.status(401),
          ctx.json({ 
            error: 'Unauthorized',
            message: 'User ID required'
          })
        );
      }

      // Validate template data
      const validation = validateTemplateData(templateData);
      if (!validation.isValid) {
        return res(
          ctx.status(400),
          ctx.json({ 
            error: 'Validation Error',
            message: validation.message,
            details: validation.errors
          })
        );
      }

      const template = templateDb.createTemplate(templateData, parseInt(userId));
      
      return res(
        ctx.status(201),
        ctx.json(template)
      );
    } catch {
      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to create template'
        })
      );
    }
  }),

  // PUT /api/templates/:id - Update template
  rest.put('/api/templates/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);
    const userId = req.headers.get('user-id');

    if (!userId) {
      return res(
        ctx.status(401),
        ctx.json({ 
          error: 'Unauthorized',
          message: 'User ID required'
        })
      );
    }

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const updates = await req.json();
      const validation = validateTemplateData(updates);
      
      if (!validation.isValid) {
        return res(
          ctx.status(400),
          ctx.json({ 
            error: 'Validation Error',
            message: validation.message,
            details: validation.errors
          })
        );
      }

      const template = templateDb.updateTemplate(templateId, updates, parseInt(userId));
      
      if (!template) {
        return res(
          ctx.status(404),
          ctx.json({ 
            error: 'Not Found',
            message: 'Template not found'
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json(template)
      );
    } catch {
      if (error.message.includes('Permission denied')) {
        return res(
          ctx.status(403),
          ctx.json({ 
            error: 'Forbidden',
            message: 'You do not have permission to update this template'
          })
        );
      }

      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to update template'
        })
      );
    }
  }),

  // DELETE /api/templates/:id - Delete template
  rest.delete('/api/templates/:id', (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);
    const userId = req.headers.get('user-id');

    if (!userId) {
      return res(
        ctx.status(401),
        ctx.json({ 
          error: 'Unauthorized',
          message: 'User ID required'
        })
      );
    }

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const deleted = templateDb.deleteTemplate(templateId, parseInt(userId));
      
      if (!deleted) {
        return res(
          ctx.status(404),
          ctx.json({ 
            error: 'Not Found',
            message: 'Template not found'
          })
        );
      }

      return res(ctx.status(204));
    } catch {
      if (error.message.includes('Permission denied')) {
        return res(
          ctx.status(403),
          ctx.json({ 
            error: 'Forbidden',
            message: 'You do not have permission to delete this template'
          })
        );
      }

      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to delete template'
        })
      );
    }
  }),

  // POST /api/templates/:id/customize - Customize template
  rest.post('/api/templates/:id/customize', async (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const customizations = await req.json();
      const customizedTemplate = templateDb.customizeTemplate(templateId, customizations);
      
      if (!customizedTemplate) {
        return res(
          ctx.status(404),
          ctx.json({ 
            error: 'Not Found',
            message: 'Template not found'
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json(customizedTemplate)
      );
    } catch {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Customization Error',
          message: error.message
        })
      );
    }
  }),

  // POST /api/templates/:id/usage - Record template usage
  rest.post('/api/templates/:id/usage', async (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);
    const userId = req.headers.get('user-id');

    if (!userId) {
      return res(
        ctx.status(401),
        ctx.json({ 
          error: 'Unauthorized',
          message: 'User ID required'
        })
      );
    }

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const usageData = await req.json();
      const usage = templateDb.recordUsage(
        templateId, 
        parseInt(userId),
        usageData.project_id,
        usageData.customizations || {},
        true
      );

      return res(
        ctx.status(201),
        ctx.json(usage)
      );
    } catch {
      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to record template usage'
        })
      );
    }
  }),

  // GET /api/templates/:id/analytics - Get template analytics
  rest.get('/api/templates/:id/analytics', (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const analytics = templateDb.getAnalytics(templateId);
      
      if (!analytics) {
        return res(
          ctx.status(404),
          ctx.json({ 
            error: 'Not Found',
            message: 'Template not found'
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json(analytics)
      );
    } catch {
      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to retrieve template analytics'
        })
      );
    }
  }),

  // GET /api/templates/:id/export - Export template
  rest.get('/api/templates/:id/export', (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);
    const format = new URL(req.url).searchParams.get('format') || 'json';

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const exportData = templateDb.exportTemplate(templateId, format);
      
      if (!exportData) {
        return res(
          ctx.status(404),
          ctx.json({ 
            error: 'Not Found',
            message: 'Template not found'
          })
        );
      }

      // Set appropriate headers based on format
      const headers = {
        'Content-Disposition': `attachment; filename="${exportData.filename}"`,
        'Content-Type': format === 'json' ? 'application/json' : 'application/octet-stream'
      };

      return res(
        ctx.status(200),
        ctx.set(headers),
        ctx.text(exportData.content)
      );
    } catch {
      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Export Error',
          message: error.message
        })
      );
    }
  }),

  // POST /api/templates/:id/reviews - Add review
  rest.post('/api/templates/:id/reviews', async (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);
    const userId = req.headers.get('user-id');

    if (!userId) {
      return res(
        ctx.status(401),
        ctx.json({ 
          error: 'Unauthorized',
          message: 'User ID required'
        })
      );
    }

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const reviewData = await req.json();
      const review = templateDb.addReview(templateId, parseInt(userId), reviewData);

      return res(
        ctx.status(201),
        ctx.json(review)
      );
    } catch {
      if (error.message.includes('duplicate')) {
        return res(
          ctx.status(409),
          ctx.json({ 
            error: 'Conflict',
            message: 'User has already reviewed this template'
          })
        );
      }

      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to add review'
        })
      );
    }
  }),

  // GET /api/templates/:id/reviews - Get template reviews
  rest.get('/api/templates/:id/reviews', (req, res, ctx) => {
    const { id } = req.params;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      return res(
        ctx.status(400),
        ctx.json({ 
          error: 'Bad Request',
          message: 'Invalid template ID'
        })
      );
    }

    try {
      const reviews = templateDb.getReviews(templateId);
      
      return res(
        ctx.status(200),
        ctx.json(reviews)
      );
    } catch {
      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to retrieve reviews'
        })
      );
    }
  }),

  // POST /api/templates/validate-name - Validate template name
  rest.post('/api/templates/validate-name', async (req, res, ctx) => {
    try {
      const { name } = await req.json();
      
      if (!name || typeof name !== 'string') {
        return res(
          ctx.status(400),
          ctx.json({ 
            error: 'Bad Request',
            message: 'Template name is required'
          })
        );
      }

      const isValid = templateDb.validateTemplateName(name);
      
      return res(
        ctx.status(200),
        ctx.json({
          isValid,
          message: isValid ? 'Template name is available' : 'Template name already exists'
        })
      );
    } catch {
      return res(
        ctx.status(500),
        ctx.json({ 
          error: 'Internal Server Error',
          message: 'Failed to validate template name'
        })
      );
    }
  })
];