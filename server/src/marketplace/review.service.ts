// Epic 16.1.6 - Review Service
import { FastifyInstance } from 'fastify';
import {
  ReviewWithDetails,
  ReviewSubmission,
  ReviewFilters,
  ReviewMetrics,
  ReviewAnalytics,
  ReviewModerationQueue,
  CreatorResponse,
  ReviewHelpfulnessVote,
  ReviewFlag,
  ReviewSortBy,
  ReviewFilterBy,
  ReviewHelpfulness,
  ReviewStatus,
  SentimentScore,
  CreateReviewSchema,
  UpdateReviewSchema
} from './review.types.js';
import { DatabaseService } from '../database/database.service.js';

export class ReviewService {
  private db: DatabaseService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.db = fastify.db;
  }

  // =============================================
  // Review Management
  // =============================================

  async createReview(
    userId: string,
    reviewData: ReviewSubmission
  ): Promise<ReviewWithDetails> {
    const validated = CreateReviewSchema.parse(reviewData);
    
    // Verify user has purchased the template
    const purchaseCheck = await this.db.query(
      `SELECT o.id as order_id, o.created_at as purchase_date
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.template_id = ? AND o.status = 'completed'`,
      [userId, validated.template_id]
    );

    if (purchaseCheck.length === 0) {
      throw new Error('You must purchase this template before reviewing it');
    }

    // Check if user has already reviewed this template
    const existingReview = await this.db.query(
      'SELECT id FROM template_reviews WHERE buyer_id = ? AND template_id = ?',
      [userId, validated.template_id]
    );

    if (existingReview.length > 0) {
      throw new Error('You have already reviewed this template');
    }

    const reviewId = crypto.randomUUID();
    const purchaseId = purchaseCheck[0].order_id;
    const verified = purchaseCheck.length > 0;

    // Analyze sentiment if comment provided
    let sentiment: SentimentScore | undefined;
    if (validated.comment) {
      sentiment = await this.analyzeSentiment(validated.comment);
    }

    const review: ReviewWithDetails = {
      id: reviewId,
      template_id: validated.template_id,
      buyer_id: userId,
      purchase_id: purchaseId,
      stars: validated.stars,
      title: validated.title,
      comment: validated.comment,
      pros: validated.pros || [],
      cons: validated.cons || [],
      use_case: validated.use_case,
      difficulty_rating: validated.difficulty_rating,
      would_recommend: validated.would_recommend,
      sentiment_ai: sentiment,
      verified_purchase: verified,
      status: ReviewStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date(),
      helpfulness_votes: {
        helpful: 0,
        not_helpful: 0
      },
      flags: [],
      flag_count: 0
    };

    // Save review to database
    await this.db.query(
      `INSERT INTO template_reviews 
       (id, template_id, buyer_id, purchase_id, stars, title, comment, pros, cons, use_case, 
        difficulty_rating, would_recommend, sentiment_ai, verified_purchase, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reviewId, validated.template_id, userId, purchaseId, validated.stars,
        validated.title, validated.comment, JSON.stringify(validated.pros || []),
        JSON.stringify(validated.cons || []), validated.use_case, validated.difficulty_rating,
        validated.would_recommend, sentiment, verified, ReviewStatus.PENDING,
        review.created_at, review.updated_at
      ]
    );

    // Auto-approve if from verified purchaser with no concerning content
    if (verified && !this.hasProblematicContent(validated.comment || '')) {
      await this.approveReview(reviewId, 'system-auto-approval');
      review.status = ReviewStatus.APPROVED;
    }

    // Update template rating statistics
    await this.updateTemplateRatingStats(validated.template_id);

    return review;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateData: Partial<ReviewSubmission>
  ): Promise<ReviewWithDetails> {
    const validated = UpdateReviewSchema.parse(updateData);

    // Verify review ownership
    const review = await this.getReviewById(reviewId);
    if (!review || review.buyer_id !== userId) {
      throw new Error('Review not found or not owned by user');
    }

    // Check if review is still editable (within 24 hours)
    const editWindow = 24 * 60 * 60 * 1000; // 24 hours
    const now = new Date().getTime();
    const createdAt = new Date(review.created_at).getTime();
    
    if (now - createdAt > editWindow) {
      throw new Error('Review can no longer be edited');
    }

    // Analyze sentiment if comment was updated
    let sentiment = review.sentiment_ai;
    if (validated.comment && validated.comment !== review.comment) {
      sentiment = await this.analyzeSentiment(validated.comment);
    }

    // Update review
    const updateFields = [];
    const updateValues = [];

    if (validated.stars !== undefined) {
      updateFields.push('stars = ?');
      updateValues.push(validated.stars);
    }
    if (validated.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(validated.title);
    }
    if (validated.comment !== undefined) {
      updateFields.push('comment = ?');
      updateValues.push(validated.comment);
    }
    if (validated.pros !== undefined) {
      updateFields.push('pros = ?');
      updateValues.push(JSON.stringify(validated.pros));
    }
    if (validated.cons !== undefined) {
      updateFields.push('cons = ?');
      updateValues.push(JSON.stringify(validated.cons));
    }
    if (validated.use_case !== undefined) {
      updateFields.push('use_case = ?');
      updateValues.push(validated.use_case);
    }
    if (validated.difficulty_rating !== undefined) {
      updateFields.push('difficulty_rating = ?');
      updateValues.push(validated.difficulty_rating);
    }
    if (validated.would_recommend !== undefined) {
      updateFields.push('would_recommend = ?');
      updateValues.push(validated.would_recommend);
    }
    if (sentiment !== review.sentiment_ai) {
      updateFields.push('sentiment_ai = ?');
      updateValues.push(sentiment);
    }

    updateFields.push('updated_at = datetime("now")');
    updateFields.push('status = ?');
    updateValues.push(ReviewStatus.PENDING); // Re-moderate after edit

    updateValues.push(reviewId);

    await this.db.query(
      `UPDATE template_reviews SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Update template rating statistics
    await this.updateTemplateRatingStats(review.template_id);

    return await this.getReviewById(reviewId) as ReviewWithDetails;
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    // Verify review ownership
    const review = await this.getReviewById(reviewId);
    if (!review || review.buyer_id !== userId) {
      throw new Error('Review not found or not owned by user');
    }

    // Soft delete - change status to hidden
    await this.db.query(
      'UPDATE template_reviews SET status = ?, updated_at = datetime("now") WHERE id = ?',
      [ReviewStatus.HIDDEN, reviewId]
    );

    // Update template rating statistics
    await this.updateTemplateRatingStats(review.template_id);
  }

  // =============================================
  // Review Retrieval and Filtering
  // =============================================

  async getReviewsForTemplate(
    templateId: string,
    filters: ReviewFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{
    reviews: ReviewWithDetails[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    metrics: ReviewMetrics;
  }> {
    const offset = (pagination.page - 1) * pagination.limit;
    
    // Build WHERE clause
    let whereClause = 'template_id = ? AND status = ?';
    const params = [templateId, ReviewStatus.APPROVED];

    if (filters.rating) {
      whereClause += ' AND stars = ?';
      params.push(filters.rating);
    }

    if (filters.verified_only) {
      whereClause += ' AND verified_purchase = true';
    }

    if (filters.has_comment) {
      whereClause += ' AND comment IS NOT NULL AND comment != ""';
    }

    if (filters.use_case) {
      whereClause += ' AND use_case = ?';
      params.push(filters.use_case);
    }

    if (filters.difficulty_min) {
      whereClause += ' AND difficulty_rating >= ?';
      params.push(filters.difficulty_min);
    }

    if (filters.difficulty_max) {
      whereClause += ' AND difficulty_rating <= ?';
      params.push(filters.difficulty_max);
    }

    if (filters.date_from) {
      whereClause += ' AND created_at >= ?';
      params.push(filters.date_from.toISOString());
    }

    if (filters.date_to) {
      whereClause += ' AND created_at <= ?';
      params.push(filters.date_to.toISOString());
    }

    // Build ORDER BY clause
    let orderClause = 'created_at DESC';
    switch (filters.sort_by) {
      case ReviewSortBy.OLDEST:
        orderClause = 'created_at ASC';
        break;
      case ReviewSortBy.HIGHEST_RATED:
        orderClause = 'stars DESC, created_at DESC';
        break;
      case ReviewSortBy.LOWEST_RATED:
        orderClause = 'stars ASC, created_at DESC';
        break;
      case ReviewSortBy.MOST_HELPFUL:
        orderClause = '(helpful_votes - not_helpful_votes) DESC, created_at DESC';
        break;
      case ReviewSortBy.VERIFIED_FIRST:
        orderClause = 'verified_purchase DESC, created_at DESC';
        break;
    }

    // Get reviews
    const reviews = await this.db.query(
      `SELECT * FROM template_reviews 
       WHERE ${whereClause} 
       ORDER BY ${orderClause} 
       LIMIT ? OFFSET ?`,
      [...params, pagination.limit, offset]
    );

    // Get total count
    const totalResult = await this.db.query(
      `SELECT COUNT(*) as count FROM template_reviews WHERE ${whereClause}`,
      params
    );

    const total = totalResult[0].count;
    const hasMore = offset + pagination.limit < total;

    // Enhance reviews with additional data
    const enhancedReviews = await Promise.all(
      reviews.map(review => this.enhanceReview(review))
    );

    // Get metrics
    const metrics = await this.getTemplateMetrics(templateId);

    return {
      reviews: enhancedReviews,
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore,
      metrics
    };
  }

  async getReviewById(reviewId: string): Promise<ReviewWithDetails | null> {
    const result = await this.db.query(
      'SELECT * FROM template_reviews WHERE id = ?',
      [reviewId]
    );

    if (result.length === 0) return null;

    return await this.enhanceReview(result[0]);
  }

  // =============================================
  // Review Interactions
  // =============================================

  async voteHelpfulness(
    reviewId: string,
    userId: string,
    vote: ReviewHelpfulness
  ): Promise<void> {
    // Check if user has already voted
    const existingVote = await this.db.query(
      'SELECT * FROM review_helpfulness_votes WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await this.db.query(
        'UPDATE review_helpfulness_votes SET vote = ?, updated_at = datetime("now") WHERE id = ?',
        [vote, existingVote[0].id]
      );
    } else {
      // Create new vote
      const voteId = crypto.randomUUID();
      await this.db.query(
        'INSERT INTO review_helpfulness_votes (id, review_id, user_id, vote, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [voteId, reviewId, userId, vote]
      );
    }

    // Update helpfulness counts on review
    await this.updateReviewHelpfulnessStats(reviewId);
  }

  async flagReview(
    reviewId: string,
    userId: string,
    flagType: string,
    reason?: string
  ): Promise<void> {
    // Check if user has already flagged this review
    const existingFlag = await this.db.query(
      'SELECT id FROM review_flags WHERE review_id = ? AND flagger_id = ?',
      [reviewId, userId]
    );

    if (existingFlag.length > 0) {
      throw new Error('You have already flagged this review');
    }

    const flagId = crypto.randomUUID();
    await this.db.query(
      'INSERT INTO review_flags (id, review_id, flagger_id, flag_type, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
      [flagId, reviewId, userId, flagType, reason, 'pending']
    );

    // Update flag count on review
    await this.updateReviewFlagStats(reviewId);

    // Auto-hide review if it reaches flag threshold
    const flagCount = await this.getReviewFlagCount(reviewId);
    if (flagCount >= 3) {
      await this.hideReview(reviewId, 'auto-flag-threshold');
    }
  }

  // =============================================
  // Creator Responses
  // =============================================

  async createCreatorResponse(
    reviewId: string,
    creatorId: string,
    response: string
  ): Promise<CreatorResponse> {
    // Verify creator owns the template
    const review = await this.getReviewById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    const templateCheck = await this.db.query(
      'SELECT owner_id FROM marketplace_templates WHERE id = ?',
      [review.template_id]
    );

    if (templateCheck.length === 0 || templateCheck[0].owner_id !== creatorId) {
      throw new Error('You can only respond to reviews of your own templates');
    }

    // Check if creator has already responded
    const existingResponse = await this.db.query(
      'SELECT id FROM creator_responses WHERE review_id = ?',
      [reviewId]
    );

    if (existingResponse.length > 0) {
      throw new Error('You have already responded to this review');
    }

    const responseId = crypto.randomUUID();
    const creatorResponse: CreatorResponse = {
      id: responseId,
      review_id: reviewId,
      creator_id: creatorId,
      response: response,
      created_at: new Date(),
      updated_at: new Date()
    };

    await this.db.query(
      'INSERT INTO creator_responses (id, review_id, creator_id, response, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [responseId, reviewId, creatorId, response, creatorResponse.created_at, creatorResponse.updated_at]
    );

    return creatorResponse;
  }

  // =============================================
  // Review Moderation
  // =============================================

  async approveReview(reviewId: string, moderatorId: string): Promise<void> {
    await this.db.query(
      'UPDATE template_reviews SET status = ?, moderation_reason = ?, updated_at = datetime("now") WHERE id = ?',
      [ReviewStatus.APPROVED, `Approved by ${moderatorId}`, reviewId]
    );
  }

  async rejectReview(reviewId: string, moderatorId: string, reason: string): Promise<void> {
    await this.db.query(
      'UPDATE template_reviews SET status = ?, moderation_reason = ?, updated_at = datetime("now") WHERE id = ?',
      [ReviewStatus.REJECTED, reason, reviewId]
    );
  }

  async hideReview(reviewId: string, reason: string): Promise<void> {
    await this.db.query(
      'UPDATE template_reviews SET status = ?, moderation_reason = ?, updated_at = datetime("now") WHERE id = ?',
      [ReviewStatus.HIDDEN, reason, reviewId]
    );
  }

  async getModerationQueue(): Promise<ReviewModerationQueue> {
    const pendingReviews = await this.db.query(
      'SELECT * FROM template_reviews WHERE status = ? ORDER BY created_at ASC',
      [ReviewStatus.PENDING]
    );

    const flaggedReviews = await this.db.query(
      'SELECT * FROM template_reviews WHERE status = ? ORDER BY created_at ASC',
      [ReviewStatus.FLAGGED]
    );

    const enhancedPending = await Promise.all(
      pendingReviews.map(review => this.enhanceReview(review))
    );

    const enhancedFlagged = await Promise.all(
      flaggedReviews.map(review => this.enhanceReview(review))
    );

    // Get moderation stats
    const stats = await this.db.query(
      `SELECT 
         COUNT(CASE WHEN status = 'approved' AND DATE(updated_at) = DATE('now') THEN 1 END) as approved_today,
         COUNT(CASE WHEN status = 'rejected' AND DATE(updated_at) = DATE('now') THEN 1 END) as rejected_today,
         COUNT(CASE WHEN status = 'flagged' AND DATE(updated_at) = DATE('now') THEN 1 END) as flagged_today
       FROM template_reviews`
    );

    return {
      pending_reviews: enhancedPending,
      flagged_reviews: enhancedFlagged,
      total_pending: pendingReviews.length,
      total_flagged: flaggedReviews.length,
      average_processing_time: 2.5, // hours - would calculate from actual data
      moderation_stats: {
        approved_today: stats[0]?.approved_today || 0,
        rejected_today: stats[0]?.rejected_today || 0,
        flagged_today: stats[0]?.flagged_today || 0
      }
    };
  }

  // =============================================
  // Analytics and Metrics
  // =============================================

  async getTemplateMetrics(templateId: string): Promise<ReviewMetrics> {
    const metrics = await this.db.query(
      `SELECT 
         COUNT(*) as total_reviews,
         AVG(stars) as average_rating,
         COUNT(CASE WHEN stars = 5 THEN 1 END) as five_star,
         COUNT(CASE WHEN stars = 4 THEN 1 END) as four_star,
         COUNT(CASE WHEN stars = 3 THEN 1 END) as three_star,
         COUNT(CASE WHEN stars = 2 THEN 1 END) as two_star,
         COUNT(CASE WHEN stars = 1 THEN 1 END) as one_star,
         COUNT(CASE WHEN verified_purchase = true THEN 1 END) as verified_count,
         AVG(CASE WHEN helpful_votes > 0 THEN helpful_votes::float / (helpful_votes + not_helpful_votes) END) as helpfulness_score
       FROM template_reviews 
       WHERE template_id = ? AND status = ?`,
      [templateId, ReviewStatus.APPROVED]
    );

    const result = metrics[0];
    const total = result.total_reviews || 0;

    return {
      total_reviews: total,
      average_rating: parseFloat(result.average_rating) || 0,
      rating_distribution: {
        five_star: result.five_star || 0,
        four_star: result.four_star || 0,
        three_star: result.three_star || 0,
        two_star: result.two_star || 0,
        one_star: result.one_star || 0
      },
      verified_percentage: total > 0 ? (result.verified_count / total) * 100 : 0,
      response_rate: 0, // Would calculate from creator responses
      helpfulness_score: parseFloat(result.helpfulness_score) || 0
    };
  }

  // =============================================
  // Helper Methods
  // =============================================

  private async enhanceReview(review: any): Promise<ReviewWithDetails> {
    // Get buyer info
    const buyerInfo = await this.db.query(
      'SELECT id, name, avatar_url FROM users WHERE id = ?',
      [review.buyer_id]
    );

    // Get helpfulness votes
    const helpfulnessVotes = await this.db.query(
      `SELECT 
         COUNT(CASE WHEN vote = 'helpful' THEN 1 END) as helpful,
         COUNT(CASE WHEN vote = 'not_helpful' THEN 1 END) as not_helpful
       FROM review_helpfulness_votes 
       WHERE review_id = ?`,
      [review.id]
    );

    // Get creator response
    const creatorResponse = await this.db.query(
      'SELECT * FROM creator_responses WHERE review_id = ?',
      [review.id]
    );

    // Get flags
    const flags = await this.db.query(
      'SELECT flag_type FROM review_flags WHERE review_id = ? AND status = ?',
      [review.id, 'pending']
    );

    return {
      ...review,
      pros: JSON.parse(review.pros || '[]'),
      cons: JSON.parse(review.cons || '[]'),
      created_at: new Date(review.created_at),
      updated_at: new Date(review.updated_at),
      buyer: buyerInfo[0] ? {
        id: buyerInfo[0].id,
        name: buyerInfo[0].name,
        avatar_url: buyerInfo[0].avatar_url,
        verified: true, // Would check verification status
        total_reviews: 0, // Would count user's total reviews
        average_rating_given: 0 // Would calculate average rating given
      } : undefined,
      helpfulness_votes: {
        helpful: helpfulnessVotes[0]?.helpful || 0,
        not_helpful: helpfulnessVotes[0]?.not_helpful || 0
      },
      flags: flags.map(f => f.flag_type),
      flag_count: flags.length,
      creator_response: creatorResponse[0] ? {
        ...creatorResponse[0],
        created_at: new Date(creatorResponse[0].created_at),
        updated_at: new Date(creatorResponse[0].updated_at)
      } : undefined
    };
  }

  private async updateTemplateRatingStats(templateId: string): Promise<void> {
    const metrics = await this.getTemplateMetrics(templateId);
    
    await this.db.query(
      'UPDATE marketplace_templates SET stats = ? WHERE id = ?',
      [JSON.stringify(metrics), templateId]
    );
  }

  private async updateReviewHelpfulnessStats(reviewId: string): Promise<void> {
    const stats = await this.db.query(
      `SELECT 
         COUNT(CASE WHEN vote = 'helpful' THEN 1 END) as helpful,
         COUNT(CASE WHEN vote = 'not_helpful' THEN 1 END) as not_helpful
       FROM review_helpfulness_votes 
       WHERE review_id = ?`,
      [reviewId]
    );

    await this.db.query(
      'UPDATE template_reviews SET helpful_votes = ?, not_helpful_votes = ? WHERE id = ?',
      [stats[0].helpful, stats[0].not_helpful, reviewId]
    );
  }

  private async updateReviewFlagStats(reviewId: string): Promise<void> {
    const flagCount = await this.getReviewFlagCount(reviewId);
    
    await this.db.query(
      'UPDATE template_reviews SET flag_count = ? WHERE id = ?',
      [flagCount, reviewId]
    );
  }

  private async getReviewFlagCount(reviewId: string): Promise<number> {
    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM review_flags WHERE review_id = ? AND status = ?',
      [reviewId, 'pending']
    );
    return result[0].count;
  }

  private async analyzeSentiment(text: string): Promise<SentimentScore> {
    // Simple sentiment analysis - in production, use a proper NLP service
    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'best'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'worst', 'hate', 'bad', 'disappointing'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    if (score >= 2) return SentimentScore.VERY_POSITIVE;
    if (score >= 1) return SentimentScore.POSITIVE;
    if (score <= -2) return SentimentScore.VERY_NEGATIVE;
    if (score <= -1) return SentimentScore.NEGATIVE;
    return SentimentScore.NEUTRAL;
  }

  private hasProblematicContent(text: string): boolean {
    // Simple content filtering - in production, use a proper moderation service
    const problematicWords = ['spam', 'fake', 'scam', 'virus', 'malware'];
    const lowerText = text.toLowerCase();
    
    return problematicWords.some(word => lowerText.includes(word));
  }
}