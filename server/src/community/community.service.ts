// Epic 16 Story 16.3 - Community Service
// Backend service for community posts, discussions, events, and social features

import { Pool, PoolClient } from 'pg';

export interface CommunityUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  creator_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  verification_status: 'verified' | 'unverified';
  followers_count: number;
  following_count: number;
  templates_count: number;
  total_revenue: number;
}

export interface CommunityPost {
  id: string;
  author: CommunityUser;
  content: string;
  images?: string[];
  template_id?: string;
  template_preview?: {
    id: string;
    title: string;
    description: string;
    price_cents: number;
  };
  type: 'text' | 'template_showcase' | 'tutorial' | 'question' | 'announcement';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface CommunityDiscussion {
  id: string;
  title: string;
  content: string;
  author: CommunityUser;
  category: string;
  tags: string[];
  replies_count: number;
  views_count: number;
  last_activity_at: string;
  is_pinned: boolean;
  is_solved: boolean;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'community_call' | 'contest' | 'launch';
  start_date: string;
  end_date: string;
  attendees_count: number;
  max_attendees?: number;
  is_attending: boolean;
  organizer: CommunityUser;
  tags: string[];
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  template_id?: string;
  type: 'text' | 'template_showcase' | 'tutorial' | 'question' | 'announcement';
  tags?: string[];
}

export interface CreateDiscussionRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'community_call' | 'contest' | 'launch';
  start_date: string;
  end_date: string;
  max_attendees?: number;
  tags?: string[];
}

export class CommunityService {
  constructor(private db: Pool) {}

  // Post management
  async createPost(userId: string, postData: CreatePostRequest): Promise<CommunityPost> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Insert post
      const postResult = await client.query(`
        INSERT INTO community_posts (
          author_id, content, images, template_id, type, tags
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at, updated_at
      `, [
        userId,
        postData.content,
        postData.images ? JSON.stringify(postData.images) : null,
        postData.template_id,
        postData.type,
        postData.tags ? JSON.stringify(postData.tags) : null
      ]);

      const postId = postResult.rows[0].id;

      // Get full post with author details
      const post = await this.getPostById(postId, userId);

      await client.query('COMMIT');
      return post;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getFeedPosts(
    userId: string,
    filter: 'all' | 'following' | 'trending' = 'all',
    limit = 20,
    offset = 0
  ): Promise<CommunityPost[]> {
    let query = `
      SELECT 
        p.id, p.content, p.images, p.template_id, p.type, p.tags,
        p.likes_count, p.comments_count, p.shares_count,
        p.created_at, p.updated_at,
        u.id as author_id, u.display_name, u.avatar_url, 
        u.creator_tier, u.verification_status,
        u.followers_count, u.following_count, u.templates_count, u.total_revenue,
        COALESCE(l.user_id IS NOT NULL, false) as is_liked,
        COALESCE(b.user_id IS NOT NULL, false) as is_bookmarked,
        t.title as template_title, t.description as template_description, t.price_cents as template_price
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes l ON p.id = l.post_id AND l.user_id = $1
      LEFT JOIN post_bookmarks b ON p.id = b.post_id AND b.user_id = $1
      LEFT JOIN templates t ON p.template_id = t.id
    `;

    const params: (string | number | boolean | null)[] = [userId];

    if (filter === 'following') {
      query += ` JOIN user_follows f ON p.author_id = f.following_id AND f.follower_id = $1`;
    } else if (filter === 'trending') {
      query += ` WHERE p.created_at > NOW() - INTERVAL '7 days'`;
    }

    query += ` ORDER BY `;
    if (filter === 'trending') {
      query += `(p.likes_count * 2 + p.comments_count * 3 + p.shares_count * 5) DESC, `;
    }
    query += `p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(limit, offset);

    const result = await this.db.query(query, params);
    return result.rows.map(this.mapRowToPost);
  }

  async likePost(userId: string, postId: string): Promise<{ success: boolean; likes_count: number }> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check if already liked
      const existingLike = await client.query(
        'SELECT id FROM post_likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );

      if (existingLike.rows.length > 0) {
        // Unlike
        await client.query(
          'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
          [userId, postId]
        );
        await client.query(
          'UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = $1',
          [postId]
        );
      } else {
        // Like
        await client.query(
          'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
          [userId, postId]
        );
        await client.query(
          'UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = $1',
          [postId]
        );
      }

      // Get updated like count
      const countResult = await client.query(
        'SELECT likes_count FROM community_posts WHERE id = $1',
        [postId]
      );

      await client.query('COMMIT');
      return {
        success: true,
        likes_count: countResult.rows[0].likes_count
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Discussion management
  async createDiscussion(userId: string, discussionData: CreateDiscussionRequest): Promise<CommunityDiscussion> {
    const result = await this.db.query(`
      INSERT INTO community_discussions (
        author_id, title, content, category, tags
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `, [
      userId,
      discussionData.title,
      discussionData.content,
      discussionData.category,
      discussionData.tags ? JSON.stringify(discussionData.tags) : null
    ]);

    const discussionId = result.rows[0].id;
    return this.getDiscussionById(discussionId);
  }

  async getDiscussions(category?: string, limit = 20, offset = 0): Promise<CommunityDiscussion[]> {
    let query = `
      SELECT 
        d.id, d.title, d.content, d.category, d.tags,
        d.replies_count, d.views_count, d.last_activity_at,
        d.is_pinned, d.is_solved, d.created_at,
        u.id as author_id, u.display_name, u.avatar_url,
        u.creator_tier, u.verification_status,
        u.followers_count, u.following_count, u.templates_count, u.total_revenue
      FROM community_discussions d
      JOIN users u ON d.author_id = u.id
    `;

    const params: (string | number | boolean | null)[] = [];

    if (category) {
      query += ` WHERE d.category = $1`;
      params.push(category);
    }

    query += ` ORDER BY d.is_pinned DESC, d.last_activity_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.db.query(query, params);
    return result.rows.map(this.mapRowToDiscussion);
  }

  // Event management
  async createEvent(userId: string, eventData: CreateEventRequest): Promise<CommunityEvent> {
    const result = await this.db.query(`
      INSERT INTO community_events (
        organizer_id, title, description, type, start_date, end_date, max_attendees, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      userId,
      eventData.title,
      eventData.description,
      eventData.type,
      eventData.start_date,
      eventData.end_date,
      eventData.max_attendees,
      eventData.tags ? JSON.stringify(eventData.tags) : null
    ]);

    const eventId = result.rows[0].id;
    return this.getEventById(eventId, userId);
  }

  async getUpcomingEvents(userId: string, limit = 20): Promise<CommunityEvent[]> {
    const query = `
      SELECT 
        e.id, e.title, e.description, e.type, e.start_date, e.end_date,
        e.attendees_count, e.max_attendees, e.tags,
        u.id as organizer_id, u.display_name, u.avatar_url,
        u.creator_tier, u.verification_status,
        u.followers_count, u.following_count, u.templates_count, u.total_revenue,
        COALESCE(a.user_id IS NOT NULL, false) as is_attending
      FROM community_events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN event_attendees a ON e.id = a.event_id AND a.user_id = $1
      WHERE e.start_date > NOW()
      ORDER BY e.start_date ASC
      LIMIT $2
    `;

    const result = await this.db.query(query, [userId, limit]);
    return result.rows.map(this.mapRowToEvent);
  }

  async attendEvent(userId: string, eventId: string): Promise<{ success: boolean; attendees_count: number }> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check if already attending
      const existingAttendance = await client.query(
        'SELECT id FROM event_attendees WHERE user_id = $1 AND event_id = $2',
        [userId, eventId]
      );

      if (existingAttendance.rows.length > 0) {
        // Remove attendance
        await client.query(
          'DELETE FROM event_attendees WHERE user_id = $1 AND event_id = $2',
          [userId, eventId]
        );
        await client.query(
          'UPDATE community_events SET attendees_count = attendees_count - 1 WHERE id = $1',
          [eventId]
        );
      } else {
        // Add attendance
        await client.query(
          'INSERT INTO event_attendees (user_id, event_id) VALUES ($1, $2)',
          [userId, eventId]
        );
        await client.query(
          'UPDATE community_events SET attendees_count = attendees_count + 1 WHERE id = $1',
          [eventId]
        );
      }

      // Get updated attendee count
      const countResult = await client.query(
        'SELECT attendees_count FROM community_events WHERE id = $1',
        [eventId]
      );

      await client.query('COMMIT');
      return {
        success: true,
        attendees_count: countResult.rows[0].attendees_count
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User management
  async followUser(followerId: string, followingId: string): Promise<{ success: boolean }> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check if already following
      const existingFollow = await client.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      if (existingFollow.rows.length > 0) {
        // Unfollow
        await client.query(
          'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
          [followerId, followingId]
        );
        await client.query(
          'UPDATE users SET followers_count = followers_count - 1 WHERE id = $1',
          [followingId]
        );
        await client.query(
          'UPDATE users SET following_count = following_count - 1 WHERE id = $1',
          [followerId]
        );
      } else {
        // Follow
        await client.query(
          'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2)',
          [followerId, followingId]
        );
        await client.query(
          'UPDATE users SET followers_count = followers_count + 1 WHERE id = $1',
          [followingId]
        );
        await client.query(
          'UPDATE users SET following_count = following_count + 1 WHERE id = $1',
          [followerId]
        );
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTopCreators(userId: string, limit = 10): Promise<CommunityUser[]> {
    const query = `
      SELECT 
        u.id, u.display_name, u.avatar_url, u.creator_tier, u.verification_status,
        u.followers_count, u.following_count, u.templates_count, u.total_revenue,
        COALESCE(f.follower_id IS NOT NULL, false) as is_following
      FROM users u
      LEFT JOIN user_follows f ON u.id = f.following_id AND f.follower_id = $1
      WHERE u.creator_tier IN ('silver', 'gold', 'platinum')
      ORDER BY 
        CASE u.creator_tier 
          WHEN 'platinum' THEN 4
          WHEN 'gold' THEN 3
          WHEN 'silver' THEN 2
          ELSE 1
        END DESC,
        u.followers_count DESC,
        u.total_revenue DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [userId, limit]);
    return result.rows.map(row => ({
      id: row.id,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      creator_tier: row.creator_tier,
      verification_status: row.verification_status,
      followers_count: row.followers_count,
      following_count: row.following_count,
      templates_count: row.templates_count,
      total_revenue: row.total_revenue
    }));
  }

  // Private helper methods
  private async getPostById(postId: string, userId?: string): Promise<CommunityPost> {
    const result = await this.db.query(`
      SELECT 
        p.id, p.content, p.images, p.template_id, p.type, p.tags,
        p.likes_count, p.comments_count, p.shares_count,
        p.created_at, p.updated_at,
        u.id as author_id, u.display_name, u.avatar_url,
        u.creator_tier, u.verification_status,
        u.followers_count, u.following_count, u.templates_count, u.total_revenue,
        COALESCE(l.user_id IS NOT NULL, false) as is_liked,
        COALESCE(b.user_id IS NOT NULL, false) as is_bookmarked,
        t.title as template_title, t.description as template_description, t.price_cents as template_price
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN post_likes l ON p.id = l.post_id AND l.user_id = $2
      LEFT JOIN post_bookmarks b ON p.id = b.post_id AND b.user_id = $2
      LEFT JOIN templates t ON p.template_id = t.id
      WHERE p.id = $1
    `, [postId, userId]);

    return this.mapRowToPost(result.rows[0]);
  }

  private async getDiscussionById(discussionId: string): Promise<CommunityDiscussion> {
    const result = await this.db.query(`
      SELECT 
        d.id, d.title, d.content, d.category, d.tags,
        d.replies_count, d.views_count, d.last_activity_at,
        d.is_pinned, d.is_solved, d.created_at,
        u.id as author_id, u.display_name, u.avatar_url,
        u.creator_tier, u.verification_status,
        u.followers_count, u.following_count, u.templates_count, u.total_revenue
      FROM community_discussions d
      JOIN users u ON d.author_id = u.id
      WHERE d.id = $1
    `, [discussionId]);

    return this.mapRowToDiscussion(result.rows[0]);
  }

  private async getEventById(eventId: string, userId?: string): Promise<CommunityEvent> {
    const result = await this.db.query(`
      SELECT 
        e.id, e.title, e.description, e.type, e.start_date, e.end_date,
        e.attendees_count, e.max_attendees, e.tags,
        u.id as organizer_id, u.display_name, u.avatar_url,
        u.creator_tier, u.verification_status,
        u.followers_count, u.following_count, u.templates_count, u.total_revenue,
        COALESCE(a.user_id IS NOT NULL, false) as is_attending
      FROM community_events e
      JOIN users u ON e.organizer_id = u.id
      LEFT JOIN event_attendees a ON e.id = a.event_id AND a.user_id = $2
      WHERE e.id = $1
    `, [eventId, userId]);

    return this.mapRowToEvent(result.rows[0]);
  }

  private mapRowToPost(row: Record<string, unknown>): CommunityPost {
    return {
      id: row.id,
      author: {
        id: row.author_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        creator_tier: row.creator_tier,
        verification_status: row.verification_status,
        followers_count: row.followers_count,
        following_count: row.following_count,
        templates_count: row.templates_count,
        total_revenue: row.total_revenue
      },
      content: row.content,
      images: row.images ? JSON.parse(row.images) : undefined,
      template_id: row.template_id,
      template_preview: row.template_title ? {
        id: row.template_id,
        title: row.template_title,
        description: row.template_description,
        price_cents: row.template_price
      } : undefined,
      type: row.type,
      likes_count: row.likes_count,
      comments_count: row.comments_count,
      shares_count: row.shares_count,
      is_liked: row.is_liked,
      is_bookmarked: row.is_bookmarked,
      created_at: row.created_at,
      updated_at: row.updated_at,
      tags: row.tags ? JSON.parse(row.tags) : []
    };
  }

  private mapRowToDiscussion(row: Record<string, unknown>): CommunityDiscussion {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      author: {
        id: row.author_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        creator_tier: row.creator_tier,
        verification_status: row.verification_status,
        followers_count: row.followers_count,
        following_count: row.following_count,
        templates_count: row.templates_count,
        total_revenue: row.total_revenue
      },
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      replies_count: row.replies_count,
      views_count: row.views_count,
      last_activity_at: row.last_activity_at,
      is_pinned: row.is_pinned,
      is_solved: row.is_solved,
      created_at: row.created_at
    };
  }

  private mapRowToEvent(row: Record<string, unknown>): CommunityEvent {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      start_date: row.start_date,
      end_date: row.end_date,
      attendees_count: row.attendees_count,
      max_attendees: row.max_attendees,
      is_attending: row.is_attending,
      organizer: {
        id: row.organizer_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        creator_tier: row.creator_tier,
        verification_status: row.verification_status,
        followers_count: row.followers_count,
        following_count: row.following_count,
        templates_count: row.templates_count,
        total_revenue: row.total_revenue
      },
      tags: row.tags ? JSON.parse(row.tags) : []
    };
  }
}