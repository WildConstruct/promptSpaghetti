/**
 * Epic 16 Marketplace - Template Review Service
 * 
 * Comprehensive review and rating system for marketplace templates.
 * Provides structured review submission, sentiment analysis, moderation,
 * and aggregated rating calculations with fraud detection.
 * 
 * Features:
 * - Multi-criteria rating system (quality, usability, documentation, support)
 * - Sentiment analysis of review text
 * - Automated fraud detection for fake reviews
 * - Moderation queue and approval workflow
 * - Rating aggregation with confidence scores
 * - Historical rating trends and analytics
 */

import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

}
}
export interface ReviewCriteria {
  quality: number;        // 1-5 stars - Code/template quality
  usability: number;      // 1-5 stars - Ease of use
  documentation: number;  // 1-5 stars - Documentation quality
  support: number;        // 1-5 stars - Creator responsiveness
}
}
}

}
}
export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  title: string;
  content: string;
  criteria: ReviewCriteria;
  overallRating: number;
  
  // Review metadata
  timestamp: Date;
  verified: boolean;
  helpful: number;
  reported: number;
  
  // Moderation
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderatorId?: string;
  moderationNotes?: string;
  moderatedAt?: Date;
  
  // Analysis
  sentiment: {
    score: number;      // -1 to 1 (negative to positive)
    confidence: number; // 0 to 1
    aspects: {
      quality: number;
      usability: number;
      support: number;
}
}
    };
  };
  
  // Fraud detection
  fraudScore: number;     // 0 to 1 (higher = more suspicious)
  fraudFlags: string[];
}

}
}
export interface ReviewSubmission {
  templateId: string;
  userId: string;
  title: string;
  content: string;
  criteria: ReviewCriteria;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    purchaseVerified?: boolean;
    usageDuration?: number; // days since purchase
}
}
  };
}

}
}
export interface AggregatedRating {
  templateId: string;
  overall: {
    average: number;
    count: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
    confidence: number;
}
}
  };
  criteria: {
    quality: { average: number; count: number };
    usability: { average: number; count: number };
    documentation: { average: number; count: number };
    support: { average: number; count: number };
  };
  sentiment: {
    averageScore: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
  };
  lastUpdated: Date;
}

}
}
export interface ModerationQueue {
  pending: TemplateReview[];
  flagged: TemplateReview[];
  recentActions: Array<{
    reviewId: string;
    action: string;
    moderatorId: string;
    timestamp: Date;
    reason?: string;
}
}
  }>;
}

@Injectable()
export class TemplateReviewService {
  private redis: Redis;

  constructor(private pool: Pool) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      keyPrefix: 'template_reviews:'
    });
  }

  /**
   * Submit a new template review
   */
  async submitReview(submission: ReviewSubmission): Promise<string> {

    try {
      // Calculate overall rating
      const { quality, usability, documentation, support } = submission.criteria;
      const overallRating = (quality + usability + documentation + support) / 4;

      // Perform sentiment analysis
      const sentiment = await this.analyzeSentiment(submission.content);
      
      // Calculate fraud score
      const fraudScore = await this.calculateFraudScore(submission);

      // Generate review ID
      const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Determine initial status based on fraud score
      const status = fraudScore > 0.7 ? 'flagged' : 'pending';

      const review: TemplateReview = {
        id: reviewId,
        templateId: submission.templateId,
        userId: submission.userId,
        title: submission.title,
        content: submission.content,
        criteria: submission.criteria,
        overallRating,
        timestamp: new Date(),
        verified: submission.metadata?.purchaseVerified || false,
        helpful: 0,
        reported: 0,
        status,
        sentiment,
        fraudScore,
        fraudFlags: fraudScore > 0.5 ? await this.generateFraudFlags(submission) : []
      };

      // Store review in database
      await this.storeReview(review);

      // Update aggregated ratings if approved automatically
      if (status === 'pending' && fraudScore < 0.3) {
        await this.approveReview(reviewId, 'system-auto-approve');
      }

      // Cache invalidation for template ratings
      await this.invalidateTemplateCache(submission.templateId);

      return reviewId;
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a template with pagination and filtering
   */
  async getTemplateReviews(
    templateId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating';
      minRating?: number;
      verified?: boolean;
    } = {}
  ): Promise<{
    reviews: TemplateReview[];
    total: number;
    hasMore: boolean;
    aggregated: AggregatedRating;
  }> {

    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'newest',
        minRating,
        verified
      } = options;

      const offset = (page - 1) * limit;

      // Build query with filters
      let query = `
        SELECT * FROM marketplace_template_reviews 
        WHERE template_id = $1 AND status = 'approved'
      `;
      const params: any[] = [templateId];
      let paramIndex = 2;

      if (minRating !== undefined) {
        query += ` AND overall_rating >= $${paramIndex}`;
        params.push(minRating);
        paramIndex++;
      }

      if (verified !== undefined) {
        query += ` AND verified = $${paramIndex}`;
        params.push(verified);
        paramIndex++;
      }

      // Add sorting
      const sortMap = {
        newest: 'timestamp DESC',
        oldest: 'timestamp ASC',
        helpful: 'helpful DESC',
        rating: 'overall_rating DESC'
      };
      query += ` ORDER BY ${sortMap[sortBy]}`;

      // Add pagination
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      // Get reviews and total count
      const [reviewsResult, countResult, aggregated] = await Promise.all([
        this.pool.query(query, params),
        this.pool.query(
          `SELECT COUNT(*) FROM marketplace_template_reviews 
           WHERE template_id = $1 AND status = 'approved'`,
          [templateId]
        ),
        this.getAggregatedRating(templateId)
      ]);

      const reviews = reviewsResult.rows.map(this.mapRowToReview);
      const total = parseInt(countResult.rows[0].count);
      const hasMore = offset + limit < total;

      return { reviews, total, hasMore, aggregated };
    } catch (error) {
      console.error('Failed to get template reviews:', error);
      throw error;
    }
  }

  /**
   * Get aggregated rating for a template
   */
  async getAggregatedRating(templateId: string): Promise<AggregatedRating> {

    try {
      // Check cache first
      const cached = await this.redis.get(`aggregated:${templateId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Calculate aggregated rating
      const query = `
        SELECT 
          COUNT(*) as total_count,
          AVG(overall_rating) as avg_rating,
          AVG(quality_rating) as avg_quality,
          AVG(usability_rating) as avg_usability,
          AVG(documentation_rating) as avg_documentation,
          AVG(support_rating) as avg_support,
          AVG(sentiment_score) as avg_sentiment,
          COUNT(CASE WHEN overall_rating = 1 THEN 1 END) as rating_1,
          COUNT(CASE WHEN overall_rating = 2 THEN 1 END) as rating_2,
          COUNT(CASE WHEN overall_rating = 3 THEN 1 END) as rating_3,
          COUNT(CASE WHEN overall_rating = 4 THEN 1 END) as rating_4,
          COUNT(CASE WHEN overall_rating = 5 THEN 1 END) as rating_5,
          COUNT(CASE WHEN sentiment_score > 0.1 THEN 1 END) as positive_sentiment,
          COUNT(CASE WHEN sentiment_score BETWEEN -0.1 AND 0.1 THEN 1 END) as neutral_sentiment,
          COUNT(CASE WHEN sentiment_score < -0.1 THEN 1 END) as negative_sentiment
        FROM marketplace_template_reviews 
        WHERE template_id = $1 AND status = 'approved'
      `;

      const result = await this.pool.query(query, [templateId]);
      const row = result.rows[0];

      if (!row || row.total_count === 0) {
        return this.getEmptyAggregatedRating(templateId);
      }

      const totalCount = parseInt(row.total_count);
      const confidence = this.calculateConfidenceScore(totalCount, parseFloat(row.avg_rating));

      const aggregated: AggregatedRating = {
        templateId,
        overall: {
          average: parseFloat(row.avg_rating) || 0,
          count: totalCount,
          distribution: {
            1: parseInt(row.rating_1) || 0,
            2: parseInt(row.rating_2) || 0,
            3: parseInt(row.rating_3) || 0,
            4: parseInt(row.rating_4) || 0,
            5: parseInt(row.rating_5) || 0
  }
          confidence
  }
        criteria: {
          quality: { 
            average: parseFloat(row.avg_quality) || 0, 
            count: totalCount 
  }
          usability: { 
            average: parseFloat(row.avg_usability) || 0, 
            count: totalCount 
  }
          documentation: { 
            average: parseFloat(row.avg_documentation) || 0, 
            count: totalCount 
  }
          support: { 
            average: parseFloat(row.avg_support) || 0, 
            count: totalCount 
          }
  }
        sentiment: {
          averageScore: parseFloat(row.avg_sentiment) || 0,
          positiveCount: parseInt(row.positive_sentiment) || 0,
          neutralCount: parseInt(row.neutral_sentiment) || 0,
          negativeCount: parseInt(row.negative_sentiment) || 0
  }
        lastUpdated: new Date()
      };

      // Cache for 5 minutes
      await this.redis.setex(`aggregated:${templateId}`, 300, JSON.stringify(aggregated));

      return aggregated;
    } catch (error) {
      console.error('Failed to get aggregated rating:', error);
      return this.getEmptyAggregatedRating(templateId);
    }
  }

  /**
   * Approve a review (moderation)
   */
  async approveReview(reviewId: string, moderatorId: string): Promise<void> {

    try {
      const query = `
        UPDATE marketplace_template_reviews 
        SET status = 'approved', moderator_id = $1, moderated_at = NOW()
        WHERE id = $2
        RETURNING template_id
      `;

      const result = await this.pool.query(query, [moderatorId, reviewId]);
      
      if (result.rows.length > 0) {
        const templateId = result.rows[0].template_id;
        await this.invalidateTemplateCache(templateId);
        
        // Log moderation action
        await this.logModerationAction(reviewId, 'approved', moderatorId);
      }
    } catch (error) {
      console.error('Failed to approve review:', error);
      throw error;
    }
  }

  /**
   * Reject a review (moderation)
   */
  async rejectReview(reviewId: string, moderatorId: string, reason: string): Promise<void> {

    try {
      const query = `
        UPDATE marketplace_template_reviews 
        SET status = 'rejected', moderator_id = $1, moderated_at = NOW(), 
            moderation_notes = $2
        WHERE id = $3
        RETURNING template_id
      `;

      const result = await this.pool.query(query, [moderatorId, reason, reviewId]);
      
      if (result.rows.length > 0) {
        // Log moderation action
        await this.logModerationAction(reviewId, 'rejected', moderatorId, reason);
      }
    } catch (error) {
      console.error('Failed to reject review:', error);
      throw error;
    }
  }

  /**
   * Get moderation queue
   */
  async getModerationQueue(): Promise<ModerationQueue> {

    try {
      const [pendingResult, flaggedResult, actionsResult] = await Promise.all([
        this.pool.query(`
          SELECT * FROM marketplace_template_reviews 
          WHERE status = 'pending' 
          ORDER BY timestamp ASC
        `),
        this.pool.query(`
          SELECT * FROM marketplace_template_reviews 
          WHERE status = 'flagged' 
          ORDER BY fraud_score DESC, timestamp ASC
        `),
        this.pool.query(`
          SELECT * FROM marketplace_review_moderation_log 
          ORDER BY timestamp DESC 
          LIMIT 50
        `)
      ]);

      return {
        pending: pendingResult.rows.map(this.mapRowToReview),
        flagged: flaggedResult.rows.map(this.mapRowToReview),
        recentActions: actionsResult.rows.map(row => ({
          reviewId: row.review_id,
          action: row.action,
          moderatorId: row.moderator_id,
          timestamp: row.timestamp,
          reason: row.reason
        }))
      };
    } catch (error) {
      console.error('Failed to get moderation queue:', error);
      throw error;
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string, userId: string): Promise<void> {

    try {
      // Check if user already marked this review
      const existingQuery = `
        SELECT id FROM marketplace_review_helpfulness 
        WHERE review_id = $1 AND user_id = $2
      `;
      const existing = await this.pool.query(existingQuery, [reviewId, userId]);

      if (existing.rows.length === 0) {
        // Add helpfulness record and increment counter
        await this.pool.query('BEGIN');
        
        await this.pool.query(`
          INSERT INTO marketplace_review_helpfulness (review_id, user_id, helpful, timestamp)
          VALUES ($1, $2, true, NOW())
        `, [reviewId, userId]);

        await this.pool.query(`
          UPDATE marketplace_template_reviews 
          SET helpful = helpful + 1 
          WHERE id = $1
        `, [reviewId]);

        await this.pool.query('COMMIT');
      }
    } catch (error) {
      await this.pool.query('ROLLBACK');
      console.error('Failed to mark review as helpful:', error);
      throw error;
    }
  }

  // Private helper methods

  private async analyzeSentiment(content: string): Promise<TemplateReview['sentiment']> {

    // Simplified sentiment analysis - in production would use ML service
    const positiveWords = ['great', 'excellent', 'amazing', 'perfect', 'love', 'helpful', 'useful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'useless', 'hate', 'broken', 'poor'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    const total = positiveCount + negativeCount;
    const score = total > 0 ? (positiveCount - negativeCount) / total : 0;
    const confidence = Math.min(total / 10, 1); // Higher confidence with more sentiment words

    return {
      score,
      confidence,
      aspects: {
        quality: score * 0.8, // Simplified aspect analysis
        usability: score * 0.9,
        support: score * 0.7
      }
    };
  }

  private async calculateFraudScore(submission: ReviewSubmission): Promise<number> {

    let fraudScore = 0;

    // Check review length (very short or very long reviews are suspicious)
    const contentLength = submission.content.length;
    if (contentLength < 20 || contentLength > 2000) {
      fraudScore += 0.2;
    }

    // Check for identical ratings across criteria (suspicious)
    const { quality, usability, documentation, support } = submission.criteria;
    if (quality === usability && usability === documentation && documentation === support) {
      fraudScore += 0.3;
    }

    // Check user history (would implement database checks)
    // For now, return calculated score
    return Math.min(fraudScore, 1);
  }

  private async generateFraudFlags(submission: ReviewSubmission): Promise<string[]> {

    const flags: string[] = [];
    
    if (submission.content.length < 20) {
      flags.push('content_too_short');
    }
    
    if (submission.content.length > 2000) {
      flags.push('content_too_long');
    }

    const { quality, usability, documentation, support } = submission.criteria;
    if (quality === usability && usability === documentation && documentation === support) {
      flags.push('identical_ratings');
    }

    return flags;
  }

  private calculateConfidenceScore(reviewCount: number, averageRating: number): number {
    // Confidence increases with review count and decreases with extreme ratings
    const countFactor = Math.min(reviewCount / 50, 1); // Max confidence at 50+ reviews
    const ratingFactor = 1 - Math.abs(averageRating - 3) / 2; // Lower confidence for very high/low ratings
    
    return Math.round((countFactor * ratingFactor) * 100) / 100;
  }

  private getEmptyAggregatedRating(templateId: string): AggregatedRating {
    return {
      templateId,
      overall: {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        confidence: 0
  }
      criteria: {
        quality: { average: 0, count: 0 },
        usability: { average: 0, count: 0 },
        documentation: { average: 0, count: 0 },
        support: { average: 0, count: 0 }
  }
      sentiment: {
        averageScore: 0,
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0
  }
      lastUpdated: new Date(};
  }

  private async storeReview(review: TemplateReview): Promise<void> {

    const query = `
      INSERT INTO marketplace_template_reviews (
        id, template_id, user_id, title, content, 
        quality_rating, usability_rating, documentation_rating, support_rating,
        overall_rating, timestamp, verified, helpful, reported, status,
        sentiment_score, sentiment_confidence, fraud_score, fraud_flags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `;

    await this.pool.query(query, [
      review.id,
      review.templateId,
      review.userId,
      review.title,
      review.content,
      review.criteria.quality,
      review.criteria.usability,
      review.criteria.documentation,
      review.criteria.support,
      review.overallRating,
      review.timestamp,
      review.verified,
      review.helpful,
      review.reported,
      review.status,
      review.sentiment.score,
      review.sentiment.confidence,
      review.fraudScore,
      JSON.stringify(review.fraudFlags)
    ]);
  }

  private mapRowToReview(row: any): TemplateReview {
    return {
      id: row.id,
      templateId: row.template_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      criteria: {
        quality: row.quality_rating,
        usability: row.usability_rating,
        documentation: row.documentation_rating,
        support: row.support_rating
  }
      overallRating: row.overall_rating,
      timestamp: row.timestamp,
      verified: row.verified,
      helpful: row.helpful,
      reported: row.reported,
      status: row.status,
      moderatorId: row.moderator_id,
      moderationNotes: row.moderation_notes,
      moderatedAt: row.moderated_at,
      sentiment: {
        score: row.sentiment_score,
        confidence: row.sentiment_confidence,
        aspects: {
          quality: row.sentiment_score * 0.8,
          usability: row.sentiment_score * 0.9,
          support: row.sentiment_score * 0.7
        }
  }
      fraudScore: row.fraud_score,
      fraudFlags: row.fraud_flags ? JSON.parse(row.fraud_flags) : []
    };
  }

  private async invalidateTemplateCache(templateId: string): Promise<void> {

    await this.redis.del(`aggregated:${templateId}`);
  }

  private async logModerationAction(
    reviewId: string, 
    action: string, 
    moderatorId: string, 
    reason?: string
  ): Promise<void> {

    const query = `
      INSERT INTO marketplace_review_moderation_log (
        review_id, action, moderator_id, reason, timestamp
      ) VALUES ($1, $2, $3, $4, NOW())
    `;

    await this.pool.query(query, [reviewId, action, moderatorId, reason]);
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {

    try {
      await this.redis.quit();
      console.log('TemplateReviewService destroyed successfully');
    } catch (error) {
      console.error('Error during TemplateReviewService destruction:', error);
    }
  }
}