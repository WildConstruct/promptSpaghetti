/**
 * Epic 16 Marketplace Leaderboard API Routes
 * Task: E16-1753114247137-1F7DE2 - Implement leaderboards
 * 
 * RESTful API endpoints for marketplace leaderboards including templates,
 * creators, categories, and user engagement rankings.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MarketplaceLeaderboardService } from '../marketplace/LeaderboardService';
import { BadgeSystem } from '../../../packages/core/gamification/BadgeSystem';
import { Database } from '../database/connection';

interface LeaderboardRouteOptions {
  database: Database;
  badgeSystem: BadgeSystem;
}

// =============================================================================
// Request/Response Schemas for Validation
// =============================================================================

const leaderboardQuerySchema = {
  type: 'object',
  properties: {
    metric: { type: 'string' },
    timeframe: {
      type: 'string',
      enum: ['24h', '7d', '30d', '90d', 'all'],
      default: 'all'
    },
    category: { type: 'string', format: 'uuid' },
    limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
    offset: { type: 'number', minimum: 0, default: 0 },
    includeHistory: { type: 'boolean', default: false }
  }
};

const leaderboardResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    leaderboard: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          rank: { type: 'number' },
          score: { type: 'number' },
          change: { type: 'number' },
          metadata: { type: 'object' },
          lastUpdated: { type: 'string', format: 'date-time' }
        }
      }
    },
    totalEntries: { type: 'number' },
    lastUpdated: { type: 'string', format: 'date-time' },
    timeframe: { type: 'string' },
    metadata: {
      type: 'object',
      properties: {
        averageScore: { type: 'number' },
        topScore: { type: 'number' },
        totalParticipants: { type: 'number' },
        updateFrequency: { type: 'string' }
      }
    }
  }
};

export default async function marketplaceLeaderboardRoutes(
  fastify: FastifyInstance,
  options: LeaderboardRouteOptions
) {
  const leaderboardService = new MarketplaceLeaderboardService(
    options.database,
    options.badgeSystem
  );

  // Middleware for optional authentication
  const optionalAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    // Leaderboards can be viewed by guests, but authenticated users get enhanced features
    // This middleware doesn't block unauthenticated requests
  };

  // =============================================================================
  // Template Leaderboards
  // =============================================================================

  // GET /api/leaderboards/templates/revenue
  // Top revenue generating templates
  fastify.get('/templates/revenue', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, category, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getTemplateLeaderboard(
        'revenue',
        timeframe,
        category,
        limit,
        offset
      );

      const metadata = {
        averageScore: leaderboard.length > 0 ? 
          leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
        topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
        totalParticipants: leaderboard.length,
        updateFrequency: '10 minutes'
      };

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata
      });
    } catch (error) {
      fastify.log.error('Failed to get template revenue leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/templates/purchases
  // Most purchased templates
  fastify.get('/templates/purchases', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, category, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getTemplateLeaderboard(
        'purchases',
        timeframe,
        category,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get template purchases leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/templates/rating
  // Highest rated templates
  fastify.get('/templates/rating', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, category, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getTemplateLeaderboard(
        'rating',
        timeframe,
        category,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get template rating leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/templates/trending
  // Trending templates based on recent activity
  fastify.get('/templates/trending', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { category, limit, offset } = request.query as any;
      // Trending is always based on recent activity, so we override timeframe
      
      const leaderboard = await leaderboardService.getTemplateLeaderboard(
        'trending',
        '7d', // Always use 7-day window for trending
        category,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe: '7d',
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get trending templates leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Creator Leaderboards
  // =============================================================================

  // GET /api/leaderboards/creators/revenue
  // Top earning creators
  fastify.get('/creators/revenue', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getCreatorLeaderboard(
        'revenue',
        timeframe,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get creator revenue leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/creators/templates
  // Most prolific creators by template count
  fastify.get('/creators/templates', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getCreatorLeaderboard(
        'templates',
        timeframe,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get creator templates leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/creators/rating
  // Best rated creators
  fastify.get('/creators/rating', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getCreatorLeaderboard(
        'rating',
        timeframe,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get creator rating leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/creators/badges
  // Top creators by badge achievements
  fastify.get('/creators/badges', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getCreatorLeaderboard(
        'badges',
        'all', // Badges are cumulative over all time
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe: 'all',
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get creator badges leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Category Leaderboards
  // =============================================================================

  // GET /api/leaderboards/categories/revenue
  // Top revenue generating categories
  fastify.get('/categories/revenue', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getCategoryLeaderboard(
        'revenue',
        timeframe,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get category revenue leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/categories/templates
  // Categories with most templates
  fastify.get('/categories/templates', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { timeframe, limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getCategoryLeaderboard(
        'templates',
        timeframe,
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe,
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get category templates leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/categories/growth
  // Fastest growing categories
  fastify.get('/categories/growth', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getCategoryLeaderboard(
        'growth',
        '30d', // Growth is always measured over recent period
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe: '30d',
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get category growth leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // User Engagement Leaderboards
  // =============================================================================

  // GET /api/leaderboards/engagement/points
  // Top users by total points
  fastify.get('/engagement/points', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getUserEngagementLeaderboard(
        'points',
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe: 'all',
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get engagement points leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/leaderboards/engagement/badges
  // Top users by badge count
  fastify.get('/engagement/badges', {
    preHandler: [optionalAuth],
    schema: {
      querystring: leaderboardQuerySchema,
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const { limit, offset } = request.query as any;
      
      const leaderboard = await leaderboardService.getUserEngagementLeaderboard(
        'badges',
        limit,
        offset
      );

      return reply.send({
        success: true,
        leaderboard,
        totalEntries: leaderboard.length,
        lastUpdated: new Date(),
        timeframe: 'all',
        metadata: {
          averageScore: leaderboard.length > 0 ? 
            leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length : 0,
          topScore: leaderboard.length > 0 ? leaderboard[0]?.score || 0 : 0,
          totalParticipants: leaderboard.length,
          updateFrequency: '10 minutes'
        }
      });
    } catch (error) {
      fastify.log.error('Failed to get engagement badges leaderboard:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // General Leaderboard Query Endpoint
  // =============================================================================

  // POST /api/leaderboards/query
  // General purpose leaderboard query endpoint
  fastify.post('/query', {
    preHandler: [optionalAuth],
    schema: {
      body: {
        type: 'object',
        required: ['type', 'metric'],
        properties: {
          type: {
            type: 'string',
            enum: ['templates', 'creators', 'categories', 'engagement']
          },
          metric: { type: 'string' },
          timeframe: {
            type: 'string',
            enum: ['24h', '7d', '30d', '90d', 'all'],
            default: 'all'
          },
          category: { type: 'string', format: 'uuid' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 },
          includeHistory: { type: 'boolean', default: false }
        }
      },
      response: {
        200: leaderboardResponseSchema
      }
    }
  }, async (request, reply) => {
    try {
      const query = request.body as any;
      
      const response = await leaderboardService.queryLeaderboard(query);
      
      return reply.send(response);
    } catch (error) {
      fastify.log.error('Failed to process leaderboard query:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // =============================================================================
  // Admin and Utility Endpoints
  // =============================================================================

  // GET /api/leaderboards/health
  // Health check for leaderboard service
  fastify.get('/health', async (request, reply) => {
    try {
      const cacheStats = leaderboardService.getCacheStats();
      
      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'marketplace-leaderboards',
        version: '1.0.0',
        cache: {
          size: cacheStats.size,
          entries: cacheStats.entries.length
        }
      });
    } catch (error) {
      return reply.code(500).send({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE /api/leaderboards/cache (Admin only)
  // Clear leaderboard cache
  fastify.delete('/cache', {
    preHandler: [async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user;
      if (!user || !user.permissions?.includes('admin')) {
        return reply.code(403).send({ error: 'Admin access required' });
      }
    }]
  }, async (request, reply) => {
    try {
      await leaderboardService.clearCache();
      
      return reply.send({
        success: true,
        message: 'Leaderboard cache cleared successfully'
      });
    } catch (error) {
      fastify.log.error('Failed to clear leaderboard cache:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to clear cache'
      });
    }
  });
}

export { marketplaceLeaderboardRoutes };