// Epic 16 Story 16.3 - Community API Routes
// REST API endpoints for community posts, discussions, events, and social features

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Pool } from 'pg';
import { CommunityService, CreatePostRequest, CreateDiscussionRequest, CreateEventRequest } from './community.service';

}
}
interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

}
}
interface PostsQuerystring {
  filter?: 'all' | 'following' | 'trending';
  limit?: number;
  offset?: number;
}
}
}

}
}
interface DiscussionsQuerystring {
  category?: string;
  limit?: number;
  offset?: number;
}
}
}

}
}
interface EventsQuerystring {
  limit?: number;
  upcoming?: boolean;
}
}
}

}
}
interface CreatorsQuerystring {
  limit?: number;
}
}
}

export async function communityRoutes(fastify: FastifyInstance, dbPool: Pool) {
  const communityService = new CommunityService(dbPool);

  // Helper function to check authentication
  const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.auth([fastify.verifyJWT])(request, reply);
    } catch (error) {
      throw fastify.httpErrors.unauthorized('Authentication required');
    }
  };

  // Posts endpoints
  fastify.get<{ Querystring: PostsQuerystring }>('/community/posts', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          filter: { type: 'string', enum: ['all', 'following', 'trending'], default: 'all' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { filter = 'all', limit = 20, offset = 0 } = request.query;
    const userId = request.user.id;

    try {
      const posts = await communityService.getFeedPosts(userId, filter, limit, offset);
      return reply.send({ posts, filter, pagination: { limit, offset, has_more: posts.length === limit } });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch posts' });
    }
  });

  fastify.post<{ Body: CreatePostRequest }>('/community/posts', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['content', 'type'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 5000 },
          images: { type: 'array', items: { type: 'string' }, maxItems: 5 },
          template_id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['text', 'template_showcase', 'tutorial', 'question', 'announcement'] },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 10 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;
    const postData = request.body;

    try {
      const post = await communityService.createPost(userId, postData);
      return reply.status(201).send(post);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to create post' });
    }
  });

  fastify.post<{ Params: { postId: string } }>('/community/posts/:postId/like', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          postId: { type: 'string', format: 'uuid' }
  }
        required: ['postId']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;
    const { postId } = request.params;

    try {
      const result = await communityService.likePost(userId, postId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Failed to like/unlike post' });
    }
  });

  // Discussions endpoints
  fastify.get<{ Querystring: DiscussionsQuerystring }>('/community/discussions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { category, limit = 20, offset = 0 } = request.query;

    try {
      const discussions = await communityService.getDiscussions(category, limit, offset);
      return reply.send({ 
        discussions, 
        category: category || 'all',
        pagination: { limit, offset, has_more: discussions.length === limit } 
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch discussions' });
    }
  });

  fastify.post<{ Body: CreateDiscussionRequest }>('/community/discussions', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['title', 'content', 'category'],
        properties: {
          title: { type: 'string', minLength: 5, maxLength: 500 },
          content: { type: 'string', minLength: 10, maxLength: 10000 },
          category: { type: 'string', minLength: 1, maxLength: 50 },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 10 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;
    const discussionData = request.body;

    try {
      const discussion = await communityService.createDiscussion(userId, discussionData);
      return reply.status(201).send(discussion);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to create discussion' });
    }
  });

  // Events endpoints
  fastify.get<{ Querystring: EventsQuerystring }>('/community/events', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          upcoming: { type: 'boolean', default: true }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { limit = 20, upcoming = true } = request.query;
    const userId = request.user.id;

    try {
      if (upcoming) {
        const events = await communityService.getUpcomingEvents(userId, limit);
        return reply.send({ events, filter: 'upcoming' });
      } else {
        // Could add getAllEvents method for past events
        return reply.send({ events: [], filter: 'all' });
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch events' });
    }
  });

  fastify.post<{ Body: CreateEventRequest }>('/community/events', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['title', 'description', 'type', 'start_date', 'end_date'],
        properties: {
          title: { type: 'string', minLength: 5, maxLength: 500 },
          description: { type: 'string', minLength: 10, maxLength: 5000 },
          type: { type: 'string', enum: ['webinar', 'workshop', 'community_call', 'contest', 'launch'] },
          start_date: { type: 'string', format: 'date-time' },
          end_date: { type: 'string', format: 'date-time' },
          max_attendees: { type: 'integer', minimum: 1 },
          tags: { type: 'array', items: { type: 'string' }, maxItems: 10 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;
    const eventData = request.body;

    try {
      // Validate dates
      const startDate = new Date(eventData.start_date);
      const endDate = new Date(eventData.end_date);
      
      if (startDate >= endDate) {
        return reply.status(400).send({ error: 'End date must be after start date' });
      }
      
      if (startDate <= new Date()) {
        return reply.status(400).send({ error: 'Start date must be in the future' });
      }

      const event = await communityService.createEvent(userId, eventData);
      return reply.status(201).send(event);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to create event' });
    }
  });

  fastify.post<{ Params: { eventId: string } }>('/community/events/:eventId/attend', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          eventId: { type: 'string', format: 'uuid' }
  }
        required: ['eventId']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const userId = request.user.id;
    const { eventId } = request.params;

    try {
      const result = await communityService.attendEvent(userId, eventId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Failed to update event attendance' });
    }
  });

  // User and social endpoints
  fastify.post<{ Params: { userId: string } }>('/community/users/:userId/follow', {
    preHandler: requireAuth,
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
  }
        required: ['userId']
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const followerId = request.user.id;
    const { userId: followingId } = request.params;

    if (followerId === followingId) {
      return reply.status(400).send({ error: 'Cannot follow yourself' });
    }

    try {
      const result = await communityService.followUser(followerId, followingId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({ error: 'Failed to follow/unfollow user' });
    }
  });

  fastify.get<{ Querystring: CreatorsQuerystring }>('/community/creators', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { limit = 10 } = request.query;
    const userId = request.user.id;

    try {
      const creators = await communityService.getTopCreators(userId, limit);
      return reply.send({ creators });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch top creators' });
    }
  });

  // Community stats endpoint
  fastify.get('/community/stats', {
    preHandler: requireAuth
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      // Get basic community statistics
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM community_posts WHERE created_at > NOW() - INTERVAL '7 days') as posts_last_7d,
          (SELECT COUNT(*) FROM community_discussions WHERE created_at > NOW() - INTERVAL '7 days') as discussions_last_7d,
          (SELECT COUNT(*) FROM community_events WHERE start_date > NOW()) as upcoming_events,
          (SELECT COUNT(DISTINCT user_id) FROM community_activity WHERE created_at > NOW() - INTERVAL '7 days') as active_users_7d,
          (SELECT COUNT(*) FROM user_follows) as total_follows,
          (SELECT COUNT(*) FROM post_likes WHERE created_at > NOW() - INTERVAL '7 days') as likes_last_7d
      `;

      const result = await dbPool.query(statsQuery);
      const stats = result.rows[0];

      return reply.send({
        community_stats: {
          posts_last_7d: parseInt(stats.posts_last_7d),
          discussions_last_7d: parseInt(stats.discussions_last_7d),
          upcoming_events: parseInt(stats.upcoming_events),
          active_users_7d: parseInt(stats.active_users_7d),
          total_follows: parseInt(stats.total_follows),
          likes_last_7d: parseInt(stats.likes_last_7d)
        }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch community statistics' });
    }
  });

  // Activity feed endpoint
  fastify.get('/community/activity', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          offset: { type: 'integer', minimum: 0, default: 0 }
        }
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { limit = 20, offset = 0 } = request.query as any;
    const userId = request.user.id;

    try {
      // Get activity feed for users that the current user follows
      const activityQuery = `
        SELECT 
          ca.id, ca.activity_type, ca.entity_type, ca.entity_id, ca.metadata, ca.created_at,
          u.id as user_id, u.display_name, u.avatar_url, u.creator_tier
        FROM community_activity ca
        JOIN users u ON ca.user_id = u.id
        JOIN user_follows uf ON ca.user_id = uf.following_id
        WHERE uf.follower_id = $1
        ORDER BY ca.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await dbPool.query(activityQuery, [userId, limit, offset]);
      
      return reply.send({
        activities: result.rows,
        pagination: { limit, offset, has_more: result.rows.length === limit }
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch activity feed' });
    }
  });
}