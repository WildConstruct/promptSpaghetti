// Epic 16 Story 16.4 - Knowledge Base API Routes
// REST API endpoints for articles, tutorials, case studies, and learning resources

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import { 
  KnowledgeBaseService, 
  CreateArticleRequest,
  CreateTutorialRequest,
  CreateCaseStudyRequest,
  SearchFilters
} from './knowledge-base.service';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface ContentQuerystring {
  category?: string;
  difficulty_level?: string;
  content_type?: string;
  tags?: string;
  author_id?: string;
  is_featured?: boolean;
  is_community_contributed?: boolean;
  limit?: number;
  offset?: number;
}

interface SearchQuerystring {
  q: string;
  category?: string;
  difficulty_level?: string;
  content_type?: string;
  limit?: number;
}

export async function knowledgeBaseRoutes(fastify: FastifyInstance, dbPool: Pool) {
  const knowledgeBaseService = new KnowledgeBaseService(dbPool);

  // Helper function to check authentication
  const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.auth([fastify.verifyJWT])(request, reply);
    } catch (error) {
      throw fastify.httpErrors.unauthorized('Authentication required');
    }
  };

  // Helper function to check if user can create content
  const canCreateContent = (user: any): boolean => {
    return user.roles?.includes('creator') || user.roles?.includes('admin');
  };

  // Article endpoints
  fastify.get<{ Querystring: ContentQuerystring }>('/knowledge/articles', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
          tags: { type: 'string' }, // comma-separated
          author_id: { type: 'string', format: 'uuid' },
          is_featured: { type: 'boolean' },
          is_community_contributed: { type: 'boolean' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tags, limit = 20, offset = 0, ...filters } = request.query;

    try {
      const searchFilters: SearchFilters = {
        ...filters,
        tags: tags ? tags.split(',') : undefined
      };

      const articles = await knowledgeBaseService.getArticles(searchFilters, limit, offset);
      return reply.send({ 
        articles, 
        pagination: { limit, offset, has_more: articles.length === limit } 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch articles' });
    }
  });

  fastify.get<{ Params: { id: string } }>('/knowledge/articles/:id', {
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
    const { id } = request.params;
    const userId = (request as any).user?.id;

    try {
      const article = await knowledgeBaseService.getArticleById(id);
      
      // Record view
      await knowledgeBaseService.recordView('article', id, userId);

      return reply.send(article);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(404).send({ error: 'Article not found' });
    }
  });

  fastify.post<{ Body: CreateArticleRequest }>('/knowledge/articles', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['title', 'content', 'category'],
        properties: {
          title: { type: 'string', minLength: 5, maxLength: 500 },
          content: { type: 'string', minLength: 100 },
          summary: { type: 'string', maxLength: 1000 },
          category: { type: 'string', minLength: 1, maxLength: 100 },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
          estimated_read_time: { type: 'integer', minimum: 1, maximum: 120 },
          related_articles: { type: 'array', items: { type: 'string', format: 'uuid' } },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type', 'url', 'title'],
              properties: {
                type: { type: 'string', enum: ['image', 'video', 'document', 'template'] },
                url: { type: 'string', format: 'uri' },
                title: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;

    if (!canCreateContent(request.user)) {
      return reply.status(403).send({ error: 'Insufficient permissions to create content' });
    }

    try {
      const article = await knowledgeBaseService.createArticle(userId, request.body);
      return reply.status(201).send(article);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to create article' });
    }
  });

  // Tutorial endpoints
  fastify.get<{ Querystring: ContentQuerystring }>('/knowledge/tutorials', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
          tags: { type: 'string' },
          author_id: { type: 'string', format: 'uuid' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tags, limit = 20, offset = 0, ...filters } = request.query;

    try {
      const searchFilters: SearchFilters = {
        ...filters,
        tags: tags ? tags.split(',') : undefined
      };

      const tutorials = await knowledgeBaseService.getTutorials(searchFilters, limit, offset);
      return reply.send({ 
        tutorials, 
        pagination: { limit, offset, has_more: tutorials.length === limit } 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch tutorials' });
    }
  });

  fastify.get<{ Params: { id: string } }>('/knowledge/tutorials/:id', {
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
    const { id } = request.params;
    const userId = (request as any).user?.id;

    try {
      const tutorial = await knowledgeBaseService.getTutorialById(id);
      
      // Record view
      await knowledgeBaseService.recordView('tutorial', id, userId);

      return reply.send(tutorial);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(404).send({ error: 'Tutorial not found' });
    }
  });

  fastify.post<{ Body: CreateTutorialRequest }>('/knowledge/tutorials', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['title', 'description', 'category', 'estimated_duration', 'steps', 'learning_objectives'],
        properties: {
          title: { type: 'string', minLength: 5, maxLength: 500 },
          description: { type: 'string', minLength: 50 },
          category: { type: 'string', minLength: 1, maxLength: 100 },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
          estimated_duration: { type: 'integer', minimum: 5, maximum: 300 },
          prerequisites: { type: 'array', items: { type: 'string' } },
          learning_objectives: { type: 'array', items: { type: 'string' }, minItems: 1 },
          is_interactive: { type: 'boolean' },
          steps: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['order', 'title', 'content', 'step_type', 'estimated_duration'],
              properties: {
                order: { type: 'integer', minimum: 1 },
                title: { type: 'string', minLength: 1, maxLength: 300 },
                content: { type: 'string', minLength: 10 },
                step_type: { type: 'string', enum: ['instruction', 'example', 'exercise', 'quiz', 'checkpoint'] },
                estimated_duration: { type: 'integer', minimum: 1, maximum: 60 },
                media: { type: 'array', items: { type: 'object' } },
                interactive_elements: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;

    if (!canCreateContent(request.user)) {
      return reply.status(403).send({ error: 'Insufficient permissions to create content' });
    }

    try {
      const tutorial = await knowledgeBaseService.createTutorial(userId, request.body);
      return reply.status(201).send(tutorial);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to create tutorial' });
    }
  });

  // Case Study endpoints
  fastify.get<{ Querystring: ContentQuerystring }>('/knowledge/case-studies', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          tags: { type: 'string' },
          author_id: { type: 'string', format: 'uuid' },
          is_featured: { type: 'boolean' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { tags, limit = 20, offset = 0, ...filters } = request.query;

    try {
      const searchFilters: SearchFilters = {
        ...filters,
        tags: tags ? tags.split(',') : undefined
      };

      const caseStudies = await knowledgeBaseService.getCaseStudies(searchFilters, limit, offset);
      return reply.send({ 
        case_studies: caseStudies, 
        pagination: { limit, offset, has_more: caseStudies.length === limit } 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch case studies' });
    }
  });

  fastify.get<{ Params: { id: string } }>('/knowledge/case-studies/:id', {
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
    const { id } = request.params;
    const userId = (request as any).user?.id;

    try {
      const caseStudy = await knowledgeBaseService.getCaseStudyById(id);
      
      // Record view
      await knowledgeBaseService.recordView('case_study', id, userId);

      return reply.send(caseStudy);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(404).send({ error: 'Case study not found' });
    }
  });

  fastify.post<{ Body: CreateCaseStudyRequest }>('/knowledge/case-studies', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['title', 'description', 'category', 'industry', 'use_case', 'challenge', 'solution', 'results'],
        properties: {
          title: { type: 'string', minLength: 5, maxLength: 500 },
          description: { type: 'string', minLength: 50 },
          category: { type: 'string', minLength: 1, maxLength: 100 },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          industry: { type: 'string', minLength: 1, maxLength: 100 },
          use_case: { type: 'string', minLength: 1, maxLength: 200 },
          challenge: { type: 'string', minLength: 50 },
          solution: { type: 'string', minLength: 50 },
          results: { type: 'string', minLength: 50 },
          metrics: {
            type: 'array',
            items: {
              type: 'object',
              required: ['label', 'value'],
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
                description: { type: 'string' }
              }
            }
          },
          templates_used: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'title', 'url'],
              properties: {
                id: { type: 'string', format: 'uuid' },
                title: { type: 'string' },
                url: { type: 'string', format: 'uri' }
              }
            }
          },
          screenshots: { type: 'array', items: { type: 'string', format: 'uri' } }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;

    if (!canCreateContent(request.user)) {
      return reply.status(403).send({ error: 'Insufficient permissions to create content' });
    }

    try {
      const caseStudy = await knowledgeBaseService.createCaseStudy(userId, request.body);
      return reply.status(201).send(caseStudy);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to create case study' });
    }
  });

  // Search endpoint
  fastify.get<{ Querystring: SearchQuerystring }>('/knowledge/search', {
    schema: {
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 2 },
          category: { type: 'string' },
          difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
          content_type: { type: 'string', enum: ['article', 'tutorial', 'case_study'] },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { q, limit = 20, ...filters } = request.query;

    try {
      const searchFilters: SearchFilters = filters;
      const results = await knowledgeBaseService.searchArticles(q, searchFilters, limit);
      
      return reply.send({ 
        results, 
        query: q,
        filters: searchFilters,
        total_results: results.length
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Search failed' });
    }
  });

  // Rating endpoint
  fastify.post<{ 
    Params: { type: string; id: string };
    Body: { is_helpful: boolean; rating?: number; feedback?: string } 
  }>('/knowledge/:type/:id/rate', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['articles', 'tutorials', 'case-studies'] },
          id: { type: 'string', format: 'uuid' }
        },
        required: ['type', 'id']
      },
      body: {
        type: 'object',
        required: ['is_helpful'],
        properties: {
          is_helpful: { type: 'boolean' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          feedback: { type: 'string', maxLength: 1000 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { type, id } = request.params;
    const { is_helpful } = request.body;
    const userId = request.user.id;

    try {
      // Convert URL type to internal type
      const contentType = type === 'case-studies' ? 'case_study' : type.slice(0, -1) as 'article' | 'tutorial';
      
      await knowledgeBaseService.rateContent(contentType, id, userId, is_helpful);
      
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Failed to rate content' });
    }
  });

  // Analytics endpoint
  fastify.get('/knowledge/analytics', {
    preHandler: requireAuth
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const user = request.user;
      
      if (!user.roles?.includes('admin')) {
        return reply.status(403).send({ error: 'Admin access required' });
      }

      // Get knowledge base statistics
      const analyticsQuery = `
        SELECT 
          content_type,
          total_count,
          last_30d,
          featured_count,
          community_count,
          avg_views,
          total_views
        FROM knowledge_analytics
        ORDER BY total_count DESC
      `;

      const result = await dbPool.query(analyticsQuery);
      
      return reply.send({
        analytics: result.rows,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch analytics' });
    }
  });

  // Popular content endpoint
  fastify.get('/knowledge/popular', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          content_type: { type: 'string', enum: ['article', 'tutorial', 'case_study'] },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { content_type, limit = 10 } = request.query as any;

    try {
      let query = 'SELECT * FROM knowledge_popular_content';
      const params: any[] = [];

      if (content_type) {
        query += ' WHERE content_type = $1';
        params.push(content_type);
      }

      query += ` ORDER BY engagement_score DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await dbPool.query(query, params);
      
      return reply.send({
        popular_content: result.rows,
        content_type: content_type || 'all',
        limit
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch popular content' });
    }
  });
}