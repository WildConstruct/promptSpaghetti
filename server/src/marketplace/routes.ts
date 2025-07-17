// Epic 16 Marketplace Fastify Routes
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MarketplaceService } from './marketplace.service';
import { RecommendationService } from './recommendation.service';
import { Pool } from 'pg';
import { 
  SearchFilters,
  CreateTemplateSchema,
  UpdateTemplateSchema,
  CreateVersionSchema,
  CreateReviewSchema,
  CreatePurchaseSchema,
  PreviewRequest
} from './types';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export async function marketplaceRoutes(fastify: FastifyInstance, dbPool: Pool) {
  const marketplaceService = new MarketplaceService(dbPool);
  const recommendationService = new RecommendationService(dbPool);

  // Helper function to check if user has required role
  const hasRole = (user: any, requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => user.roles?.includes(role));
  };

  // Template endpoints
  fastify.post('/templates', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          price_cents: { type: 'integer', minimum: 0 },
          is_ai_generated: { type: 'boolean' },
          claude_compat: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = request.user;
    
    if (!hasRole(user, ['creator', 'admin'])) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }

    try {
      const template = await marketplaceService.createTemplate(user.id, request.body);
      return reply.status(201).send(template);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Search suggestions endpoint
  fastify.get('/search/suggestions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 20, default: 10 }
        },
        required: ['q']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit = 10 } = request.query as any;

    try {
      const suggestions = await marketplaceService.getSearchSuggestions(q, limit);
      return reply.send({ suggestions });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch search suggestions' });
    }
  });

  fastify.get('/templates/search', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          categories: { type: 'string' },
          tags: { type: 'string' },
          price_min: { type: 'integer', minimum: 0 },
          price_max: { type: 'integer', minimum: 0 },
          rating_min: { type: 'number', minimum: 0, maximum: 5 },
          sort_by: { type: 'string', enum: ['relevance', 'price_asc', 'price_desc', 'rating', 'popularity', 'newest', 'oldest'] },
          is_free: { type: 'boolean' },
          is_featured: { type: 'boolean' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as any;
    
    const filters: SearchFilters = {
      query: query.query,
      categories: query.categories ? query.categories.split(',').map((c: string) => c.trim()) : undefined,
      tags: query.tags ? query.tags.split(',').map((t: string) => t.trim()) : undefined,
      price_min: query.price_min,
      price_max: query.price_max,
      rating_min: query.rating_min,
      sort_by: query.sort_by || 'relevance',
      is_free: query.is_free,
      is_featured: query.is_featured,
      page: query.page || 1,
      limit: Math.min(query.limit || 20, 100)
    };

    try {
      const userId = (request as any).user?.id;
      const results = await marketplaceService.searchTemplates(filters, userId);
      return reply.send(results);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Search failed' });
    }
  });

  fastify.get('/templates/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    try {
      const userId = (request as any).user?.id;
      const template = await marketplaceService.getTemplate(id, userId);
      
      if (!template) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      
      return reply.send(template);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not accessible')) {
        return reply.status(403).send({ error: 'Template not accessible' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch template' });
    }
  });

  fastify.put('/templates/:id', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          price_cents: { type: 'integer', minimum: 0 },
          is_ai_generated: { type: 'boolean' },
          claude_compat: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['draft', 'listed', 'blocked', 'archived'] },
          categories: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user;

    try {
      const template = await marketplaceService.updateTemplate(id, user.id, request.body);
      return reply.send(template);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('not authorized')) {
        return reply.status(403).send({ error: 'Not authorized to update this template' });
      }
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Update failed' });
    }
  });

  fastify.delete('/templates/:id', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user;

    try {
      await marketplaceService.deleteTemplate(id, user.id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('not authorized')) {
        return reply.status(403).send({ error: 'Not authorized to delete this template' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Delete failed' });
    }
  });

  // Version endpoints
  fastify.post('/templates/:id/versions', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        required: ['graph_json'],
        properties: {
          claude_model: { type: 'string' },
          graph_json: { type: 'object' },
          prompt_yaml: { type: 'string' },
          changelog_md: { type: 'string' },
          token_per_run_estimate: { type: 'integer', minimum: 0 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user;

    try {
      const version = await marketplaceService.createVersion(id, user.id, request.body);
      return reply.status(201).send(version);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('not authorized')) {
        return reply.status(403).send({ error: 'Not authorized to create versions for this template' });
      }
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Version creation failed' });
    }
  });

  fastify.get('/templates/:id/versions', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user;

    try {
      const versions = await marketplaceService.getTemplateVersions(id, user.id);
      return reply.send(versions);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('not authorized')) {
        return reply.status(403).send({ error: 'Not authorized to view template versions' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch versions' });
    }
  });

  // Purchase endpoints
  fastify.post('/purchases', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      body: {
        type: 'object',
        required: ['template_id'],
        properties: {
          template_id: { type: 'string', format: 'uuid' },
          version_id: { type: 'string', format: 'uuid' },
          payment_method_id: { type: 'string' }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = request.user;

    try {
      const purchase = await marketplaceService.createPurchase(user.id, request.body);
      return reply.status(201).send(purchase);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('already own')) {
        return reply.status(400).send({ error: 'You already own this template' });
      }
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Purchase failed' });
    }
  });

  fastify.get('/purchases/my', {
    preHandler: fastify.auth([fastify.verifyJWT])
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = request.user;

    try {
      const purchases = await marketplaceService.getUserPurchases(user.id);
      return reply.send(purchases);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch purchases' });
    }
  });

  // Review endpoints
  fastify.post('/reviews', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      body: {
        type: 'object',
        required: ['template_id', 'stars'],
        properties: {
          template_id: { type: 'string', format: 'uuid' },
          stars: { type: 'integer', minimum: 1, maximum: 5 },
          comment: { type: 'string', maxLength: 2000 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = request.user;

    try {
      const review = await marketplaceService.createReview(user.id, request.body);
      return reply.status(201).send(review);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('must purchase')) {
        return reply.status(400).send({ error: 'You must purchase the template before reviewing' });
      }
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Review creation failed' });
    }
  });

  fastify.get('/templates/:id/reviews', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const reviews = await marketplaceService.getTemplateReviews(id);
      return reply.send(reviews);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch reviews' });
    }
  });

  // Preview metadata endpoint
  fastify.get('/templates/:id/preview-metadata', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          version_id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { version_id } = request.query as any;

    try {
      const metadata = await marketplaceService.getPreviewMetadata(id, version_id);
      return reply.send(metadata);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch preview metadata' });
    }
  });

  // Preview endpoint
  fastify.post('/templates/:id/preview', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          version_id: { type: 'string', format: 'uuid' },
          user_input: { type: 'object' },
          claude_model_override: { type: 'string' }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user;

    const previewRequest: PreviewRequest = {
      template_id: id,
      version_id: (request.body as any)?.version_id,
      user_input: (request.body as any)?.user_input,
      claude_model_override: (request.body as any)?.claude_model_override
    };

    try {
      const preview = await marketplaceService.previewTemplate(user.id, previewRequest);
      return reply.send(preview);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('not available')) {
        return reply.status(400).send({ error: 'Template preview not available' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Preview generation failed' });
    }
  });

  // Categories
  fastify.get('/categories', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const categories = await marketplaceService.getCategories();
      return reply.send(categories);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch categories' });
    }
  });

  // Analytics endpoints (for creators)
  fastify.get('/templates/:id/analytics', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = request.user;

    if (!hasRole(user, ['creator', 'admin'])) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }

    try {
      const analytics = await marketplaceService.getTemplateAnalytics(id, user.id);
      return reply.send(analytics);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({ error: 'Template not found' });
      }
      if (error instanceof Error && error.message.includes('not authorized')) {
        return reply.status(403).send({ error: 'Not authorized to view analytics for this template' });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch analytics' });
    }
  });

  // Recommendation endpoints
  fastify.get('/recommendations/personalized', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          exclude_owned: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = request.user;
    const { limit = 10, exclude_owned = true } = request.query as any;

    try {
      const recommendations = await recommendationService.getPersonalizedRecommendations(
        user.id, 
        limit, 
        exclude_owned
      );
      return reply.send({ templates: recommendations });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch personalized recommendations' });
    }
  });

  fastify.get('/templates/:id/similar', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { limit = 5 } = request.query as any;

    try {
      const similarTemplates = await recommendationService.getSimilarTemplates(id, limit);
      return reply.send({ templates: similarTemplates });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch similar templates' });
    }
  });

  fastify.get('/recommendations/trending', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          timeWindow: { type: 'integer', minimum: 1, maximum: 30, default: 7 },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { timeWindow = 7, limit = 10 } = request.query as any;

    try {
      const trendingTemplates = await recommendationService.getTrendingTemplates(timeWindow, limit);
      return reply.send({ templates: trendingTemplates });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch trending templates' });
    }
  });

  fastify.get('/recommendations/new-user', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit = 10 } = request.query as any;

    try {
      const recommendations = await recommendationService.getNewUserRecommendations(limit);
      return reply.send({ templates: recommendations });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch new user recommendations' });
    }
  });

  fastify.get('/categories/:id/recommendations', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          exclude: { type: 'string' } // comma-separated template IDs
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { limit = 10, exclude } = request.query as any;
    
    const excludeTemplateIds = exclude ? exclude.split(',').map((id: string) => id.trim()) : [];

    try {
      const recommendations = await recommendationService.getCategoryRecommendations(
        id, 
        limit, 
        excludeTemplateIds
      );
      return reply.send({ templates: recommendations });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch category recommendations' });
    }
  });

  fastify.get('/recommendations/search-based', {
    preHandler: fastify.auth([fastify.verifyJWT]),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = request.user;
    const { limit = 10 } = request.query as any;

    try {
      const recommendations = await recommendationService.getSearchBasedRecommendations(user.id, limit);
      return reply.send({ templates: recommendations });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch search-based recommendations' });
    }
  });

  // Admin endpoints
  fastify.post('/search/refresh', {
    preHandler: fastify.auth([fastify.verifyJWT])
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const user = request.user;

    if (!hasRole(user, ['admin'])) {
      return reply.status(403).send({ error: 'Admin access required' });
    }

    try {
      await marketplaceService.refreshSearchIndex();
      return reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to refresh search index' });
    }
  });
}