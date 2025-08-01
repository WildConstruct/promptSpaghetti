/**
 * Epic 16 Feedback Service
 * Task: E16-1753114247084-CE7C08 - Create feedback system
 * 
 * Comprehensive service for managing feedback, reviews, ratings,
 * reports, and moderation workflows.
 */

import { Pool } from 'pg';
import { 
  Feedback,
  FeedbackSummary,
  FeedbackVote,
  FeedbackReply,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackFilter,
  ModerateFeedbackRequest,
  FeedbackType,
  FeedbackStatus,
  validateCreateFeedbackRequest,
  validateUpdateFeedbackRequest,
  validateFeedbackFilter,
  validateModerateFeedbackRequest,
  FEEDBACK_DEFAULTS
 from '../../../packages/core/types/feedback';

export class FeedbackService {
  private db: Pool;

  constructor(database: Pool) {
    this.db = database;


  // =============================================================================
  // Core Feedback Operations
  // =============================================================================

  /**
   * Create new feedback
   */
  async createFeedback(data: CreateFeedbackRequest, authorId: string): Promise<Feedback> {

    const validatedData = validateCreateFeedbackRequest(data);
    
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check if user can provide feedback for this target
      await this.validateFeedbackPermissions(
        validatedData.targetType,
        validatedData.targetId,
        authorId,
        validatedData.type
      );

      // Insert feedback
      const feedbackId = crypto.randomUUID();
      const now = new Date();

      
      // Handle attachments if provided
      if (validatedData.attachments && validatedData.attachments.length > 0) {
        await this.attachFiles(feedbackId, validatedData.attachments, client);


      // Update target summary if this is a rating/review
      if (['rating', 'review'].includes(validatedData.type) && validatedData.rating) {
        await this.updateFeedbackSummary(validatedData.targetId, client);


      // Log feedback creation
      await this.logFeedbackActivity(feedbackId, 'created', authorId, null, client);

      await client.query('COMMIT');
      
      return this.getFeedbackById(feedbackId);
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  /**
   * Get feedback by ID
   */
  async getFeedbackById(feedbackId: string): Promise<Feedback> {

    const result = await this.db.query(`
      SELECT 
        f.*,
        u.name as author_name,
        u.verified as author_verified,
        (SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = f.id AND vote_type = 'helpful') as helpful_votes,
        (SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = f.id AND vote_type = 'not_helpful') as not_helpful_votes,
        (SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id AND status = 'visible') as replies_count,
        COALESCE(a.attachments, '[]'::json) as attachments
      FROM feedback f
      LEFT JOIN users u ON f.author_id = u.id
      LEFT JOIN (
        SELECT feedback_id, json_agg(json_build_object(
          'id', id, 'type', type, 'url', url, 'filename', filename, 'size', size, 'mime_type', mime_type
        )) as attachments
        FROM feedback_attachments
        WHERE feedback_id = $1
        GROUP BY feedback_id
      ) a ON f.id = a.feedback_id
      WHERE f.id = $1
    `, [feedbackId]);

    if (result.rows.length === 0) {
      throw new Error('Feedback not found');


    return this.mapFeedbackRow(result.rows[0]);


  /**
   * Get feedback list with filtering and pagination
   */
  async getFeedback(filter: FeedbackFilter): Promise<{
    feedback: Feedback[];
    total: number;
    hasMore: boolean;
> {

    const validatedFilter = validateFeedbackFilter(filter);
    
    // Build WHERE clause
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (validatedFilter.targetId) {
      conditions.push(`f.target_id = $${paramIndex++}`);
      params.push(validatedFilter.targetId);


    if (validatedFilter.targetType) {
      conditions.push(`f.target_type = $${paramIndex++}`);
      params.push(validatedFilter.targetType);


    if (validatedFilter.type) {
      conditions.push(`f.type = $${paramIndex++}`);
      params.push(validatedFilter.type);


    if (validatedFilter.category) {
      conditions.push(`f.category = $${paramIndex++}`);
      params.push(validatedFilter.category);


    if (validatedFilter.status) {
      conditions.push(`f.status = $${paramIndex++}`);
      params.push(validatedFilter.status);


    if (validatedFilter.authorId) {
      conditions.push(`f.author_id = $${paramIndex++}`);
      params.push(validatedFilter.authorId);


    if (validatedFilter.verifiedOnly) {
      conditions.push('u.verified = true');


    if (validatedFilter.minRating) {
      conditions.push(`f.rating >= $${paramIndex++}`);
      params.push(validatedFilter.minRating);


    if (validatedFilter.maxRating) {
      conditions.push(`f.rating <= $${paramIndex++}`);
      params.push(validatedFilter.maxRating);


    if (validatedFilter.hasAttachments !== undefined) {
      if (validatedFilter.hasAttachments) {
        conditions.push('EXISTS (SELECT 1 FROM feedback_attachments WHERE feedback_id = f.id)');
 else {
        conditions.push('NOT EXISTS (SELECT 1 FROM feedback_attachments WHERE feedback_id = f.id)');



    if (validatedFilter.createdAfter) {
      conditions.push(`f.created_at >= $${paramIndex++}`);
      params.push(validatedFilter.createdAfter);


    if (validatedFilter.createdBefore) {
      conditions.push(`f.created_at <= $${paramIndex++}`);
      params.push(validatedFilter.createdBefore);


    if (validatedFilter.search) {
      conditions.push(`(
        f.title ILIKE $${paramIndex} OR 
        f.content ILIKE $${paramIndex} OR
        u.name ILIKE $${paramIndex}
      )`);
      params.push(`%${validatedFilter.search}%`);
      paramIndex++;


    // Ensure only visible feedback is shown (unless specifically filtering by status)
    if (!validatedFilter.status) {
      conditions.push('f.status IN (\'approved\', \'pending\') AND f.visibility = \'public\'');


    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const orderBy = `ORDER BY f.${validatedFilter.sortBy} ${validatedFilter.sortOrder.toUpperCase()}`;

    // Get total count
    const countResult = await this.db.query(`
      SELECT COUNT(*) as total
      FROM feedback f
      LEFT JOIN users u ON f.author_id = u.id
      ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].total);

    // Get feedback with pagination
    const feedbackResult = await this.db.query(`
      SELECT 
        f.*,
        u.name as author_name,
        u.verified as author_verified,
        (SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = f.id AND vote_type = 'helpful') as helpful_votes,
        (SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = f.id AND vote_type = 'not_helpful') as not_helpful_votes,
        (SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id AND status = 'visible') as replies_count,
        COALESCE(a.attachments, '[]'::json) as attachments
      FROM feedback f
      LEFT JOIN users u ON f.author_id = u.id
      LEFT JOIN (
        SELECT feedback_id, json_agg(json_build_object(
          'id', id, 'type', type, 'url', url, 'filename', filename, 'size', size, 'mime_type', mime_type
        )) as attachments
        FROM feedback_attachments
        GROUP BY feedback_id
      ) a ON f.id = a.feedback_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, [...params, validatedFilter.limit, validatedFilter.offset]);

    const feedback = feedbackResult.rows.map(row => this.mapFeedbackRow(row));
    const hasMore = validatedFilter.offset + validatedFilter.limit < total;

    return { feedback, total, hasMore };


  /**
   * Update feedback
   */
  async updateFeedback(
    feedbackId: string, 
    data: UpdateFeedbackRequest, 
    userId: string
  ): Promise<Feedback> {

    const validatedData = validateUpdateFeedbackRequest(data);
    
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check permissions
      const feedbackResult = await client.query(
        'SELECT author_id, target_id, target_type, rating FROM feedback WHERE id = $1',
        [feedbackId]
      );

      if (feedbackResult.rows.length === 0) {
        throw new Error('Feedback not found');


      const feedback = feedbackResult.rows[0];
      if (feedback.author_id !== userId) {
        throw new Error('Unauthorized to update this feedback');


      // Build update query
      const updateFields: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      if (validatedData.title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        params.push(validatedData.title);


      if (validatedData.content !== undefined) {
        updateFields.push(`content = $${paramIndex++}`);
        params.push(validatedData.content);


      if (validatedData.rating !== undefined) {
        updateFields.push(`rating = $${paramIndex++}`);
        params.push(validatedData.rating);


      if (validatedData.pros !== undefined) {
        updateFields.push(`pros = $${paramIndex++}`);
        params.push(JSON.stringify(validatedData.pros));


      if (validatedData.cons !== undefined) {
        updateFields.push(`cons = $${paramIndex++}`);
        params.push(JSON.stringify(validatedData.cons));


      if (validatedData.useCase !== undefined) {
        updateFields.push(`use_case = $${paramIndex++}`);
        params.push(validatedData.useCase);


      if (validatedData.wouldRecommend !== undefined) {
        updateFields.push(`would_recommend = $${paramIndex++}`);
        params.push(validatedData.wouldRecommend);


      updateFields.push(`updated_at = $${paramIndex++}`);
      params.push(new Date());

      params.push(feedbackId);

      await client.query(`
        UPDATE feedback 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `, params);

      // Update summary if rating changed
      if (validatedData.rating !== undefined && validatedData.rating !== feedback.rating) {
        await this.updateFeedbackSummary(feedback.target_id, client);


      // Log activity
      await this.logFeedbackActivity(feedbackId, 'updated', userId, null, client);

      await client.query('COMMIT');
      
      return this.getFeedbackById(feedbackId);
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string, userId: string): Promise<void> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check permissions
      const feedbackResult = await client.query(
        'SELECT author_id, target_id, rating FROM feedback WHERE id = $1',
        [feedbackId]
      );

      if (feedbackResult.rows.length === 0) {
        throw new Error('Feedback not found');


      const feedback = feedbackResult.rows[0];
      if (feedback.author_id !== userId) {
        throw new Error('Unauthorized to delete this feedback');


      // Soft delete by updating status
      await client.query(
        'UPDATE feedback SET status = $1, updated_at = $2 WHERE id = $3',
        ['archived', new Date(), feedbackId]
      );

      // Update summary if this was a rating
      if (feedback.rating) {
        await this.updateFeedbackSummary(feedback.target_id, client);


      // Log activity
      await this.logFeedbackActivity(feedbackId, 'deleted', userId, null, client);

      await client.query('COMMIT');
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // =============================================================================
  // Voting and Interaction
  // =============================================================================

  /**
   * Vote on feedback helpfulness
   */
  async voteFeedback(
    feedbackId: string, 
    userId: string, 
    voteType: 'helpful' | 'not_helpful'
  ): Promise<void> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check if user already voted
      const existingVote = await client.query(
        'SELECT vote_type FROM feedback_votes WHERE feedback_id = $1 AND user_id = $2',
        [feedbackId, userId]
      );

      if (existingVote.rows.length > 0) {
        if (existingVote.rows[0].vote_type === voteType) {
          // Remove vote if same type
          await client.query(
            'DELETE FROM feedback_votes WHERE feedback_id = $1 AND user_id = $2',
            [feedbackId, userId]
          );
 else {
          // Update vote type
          await client.query(
            'UPDATE feedback_votes SET vote_type = $1, created_at = $2 WHERE feedback_id = $3 AND user_id = $4',
            [voteType, new Date(), feedbackId, userId]
          );

 else {
        // Insert new vote
        await client.query(
          'INSERT INTO feedback_votes (id, feedback_id, user_id, vote_type, created_at) VALUES ($1, $2, $3, $4, $5)',
          [crypto.randomUUID(), feedbackId, userId, voteType, new Date()]
        );


      await client.query('COMMIT');
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  /**
   * Reply to feedback
   */
  async replyToFeedback(
    feedbackId: string,
    userId: string,
    content: string,
    parentReplyId?: string
  ): Promise<FeedbackReply> {

    const replyId = crypto.randomUUID();
    const now = new Date();

    const result = await this.db.query(`
      INSERT INTO feedback_replies (
        id, feedback_id, parent_reply_id, author_id, content, status, created_at, updated_at

      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [replyId, feedbackId, parentReplyId || null, userId, content, 'visible', now, now]);

    // Update reply count
    await this.db.query(
      'UPDATE feedback SET replies = replies + 1 WHERE id = $1',
      [feedbackId]
    );

    return this.mapReplyRow(result.rows[0]);


  // =============================================================================
  // Moderation
  // =============================================================================

  /**
   * Moderate feedback
   */
  async moderateFeedback(
    feedbackId: string,
    moderatorId: string,
    request: ModerateFeedbackRequest
  ): Promise<Feedback> {

    const validatedRequest = validateModerateFeedbackRequest(request);
    
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const now = new Date();
      let newStatus: FeedbackStatus;

      switch (validatedRequest.action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'flag':
        newStatus = 'flagged';
        break;
      case 'archive':
        newStatus = 'archived';
        break;


      await client.query(`
        UPDATE feedback 
        SET 
          status = $1,
          moderated_by = $2,
          moderated_at = $3,
          moderation_notes = $4,
          rejection_reason = $5,
          updated_at = $6
        WHERE id = $7
      `, [
        newStatus,
        moderatorId,
        now,
        validatedRequest.notes || null,
        validatedRequest.rejectionReason || null,
        now,
        feedbackId
      ]);

      // Log moderation activity
      await this.logFeedbackActivity(feedbackId, 'moderated', moderatorId, {
        action: validatedRequest.action,
        notes: validatedRequest.notes
      }, client);

      await client.query('COMMIT');
      
      return this.getFeedbackById(feedbackId);
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // =============================================================================
  // Aggregation and Analytics
  // =============================================================================

  /**
   * Get feedback summary for a target
   */
  async getFeedbackSummary(targetId: string): Promise<FeedbackSummary> {

    const result = await this.db.query(`
      SELECT * FROM feedback_summaries WHERE target_id = $1
    `, [targetId]);

    if (result.rows.length === 0) {
      // Generate summary if it doesn't exist
      return this.generateFeedbackSummary(targetId);


    return this.mapSummaryRow(result.rows[0]);


  /**
   * Generate and cache feedback summary
   */
  private async generateFeedbackSummary(targetId: string): Promise<FeedbackSummary> {

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Get rating statistics
      const ratingStats = await client.query(`
        SELECT 
          COUNT(*) as total_ratings,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5
        FROM feedback 
        WHERE target_id = $1 AND rating IS NOT NULL AND status = 'approved'
      `, [targetId]);

      // Get general feedback statistics
      const feedbackStats = await client.query(`
        SELECT 
          COUNT(*) as total_feedback,
          type,
          category,
          COUNT(CASE WHEN author_verified = true THEN 1 END) as verified_count
        FROM feedback f
        LEFT JOIN users u ON f.author_id = u.id
        WHERE f.target_id = $1 AND f.status = 'approved'
        GROUP BY type, category
      `, [targetId]);

      // Get engagement metrics
      const engagementStats = await client.query(`
        SELECT 
          SUM((SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = f.id AND vote_type = 'helpful')) as total_helpful_votes,
          SUM((SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id AND status = 'visible')) as total_replies
        FROM feedback f
        WHERE f.target_id = $1 AND f.status = 'approved'
      `, [targetId]);

      const rating = ratingStats.rows[0];
      const engagement = engagementStats.rows[0];

      const summary: FeedbackSummary = {
        targetId,
        targetType: 'contribution', // Would be determined by context
        averageRating: parseFloat(rating.average_rating) || 0,
        totalRatings: parseInt(rating.total_ratings) || 0,
        ratingDistribution: {
          1: parseInt(rating.rating_1) || 0,
          2: parseInt(rating.rating_2) || 0,
          3: parseInt(rating.rating_3) || 0,
          4: parseInt(rating.rating_4) || 0,
          5: parseInt(rating.rating_5) || 0

        totalReviews: 0, // Would be calculated from feedback stats
        verifiedReviews: 0,
        averageDifficulty: 0,
        recommendationRate: 0,
        totalFeedback: feedbackStats.rows.reduce((sum, row) => sum + parseInt(row.total_feedback), 0),
        feedbackByType: {},
        feedbackByCategory: {},
        totalHelpfulVotes: parseInt(engagement.total_helpful_votes) || 0,
        totalReplies: parseInt(engagement.total_replies) || 0,
        qualityScore: this.calculateQualityScore(rating, engagement),
        moderationRate: 0,
        lastUpdated: new Date(),
        generatedAt: new Date()
      };

      // Cache the summary
      await client.query(`
        INSERT INTO feedback_summaries (target_id, summary_data, last_updated, generated_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (target_id) 
        DO UPDATE SET 
          summary_data = EXCLUDED.summary_data,
          last_updated = EXCLUDED.last_updated,
          generated_at = EXCLUDED.generated_at
      `, [targetId, JSON.stringify(summary), summary.lastUpdated, summary.generatedAt]);

      await client.query('COMMIT');
      return summary;
 catch (error) {
      await client.query('ROLLBACK');
      throw error;
 finally {
      client.release();



  // =============================================================================
  // Helper Methods
  // =============================================================================

  private async validateFeedbackPermissions(
    targetType: string,
    targetId: string,
    userId: string,
    feedbackType: FeedbackType
  ): Promise<void> {

    // Check if user has already provided feedback of this type for this target
    if (['rating', 'review'].includes(feedbackType)) {
      const existingFeedback = await this.db.query(
        'SELECT id FROM feedback WHERE target_id = $1 AND author_id = $2 AND type IN ($3, $4) AND status != $5',
        [targetId, userId, 'rating', 'review', 'archived']
      );

      if (existingFeedback.rows.length > 0) {
        throw new Error('You have already provided a rating/review for this item');



    // Additional permission checks could be added here
    // e.g., checking if user has purchased a template before reviewing


  private getInitialStatus(feedbackType: FeedbackType): FeedbackStatus {
    // Auto-approve certain types of feedback, require moderation for others
    if (['rating', 'comment'].includes(feedbackType)) {
      return 'approved';

    return 'pending';


  private async attachFiles(
    feedbackId: string,
    attachmentIds: string[],
    client: unknown
  ): Promise<void> {

    for (const attachmentId of attachmentIds) {
      await client.query(
        'UPDATE feedback_attachments SET feedback_id = $1 WHERE id = $2',
        [feedbackId, attachmentId]
      );



  private async updateFeedbackSummary(targetId: string, client: unknown): Promise<void> {

    // Invalidate cached summary to force regeneration
    await client.query(
      'DELETE FROM feedback_summaries WHERE target_id = $1',
      [targetId]
    );


  private async logFeedbackActivity(
    feedbackId: string,
    action: string,
    userId: string,
    metadata: Record<string, unknown>,
    client: unknown
  ): Promise<void> {

    await client.query(`
      INSERT INTO feedback_activity_log (
        id, feedback_id, action, user_id, metadata, created_at

      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      crypto.randomUUID(),
      feedbackId,
      action,
      userId,
      JSON.stringify(metadata || {}),
      new Date()
    ]);


  private calculateQualityScore(ratingStats: unknown, engagementStats: unknown): number {
    // Simple quality score calculation
    const avgRating = parseFloat(ratingStats.average_rating) || 0;
    const totalRatings = parseInt(ratingStats.total_ratings) || 0;
    const helpfulVotes = parseInt(engagementStats.total_helpful_votes) || 0;

    if (totalRatings === 0) return 0;

    // Weight: 70% rating, 30% engagement
    const ratingScore = (avgRating / 5) * 70;
    const engagementScore = Math.min(helpfulVotes / Math.max(totalRatings, 1) * 30, 30);

    return Math.round(ratingScore + engagementScore);


  private mapFeedbackRow(row: unknown): Feedback {
    return {
      id: row.id,
      type: row.type,
      category: row.category,
      targetType: row.target_type,
      targetId: row.target_id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorVerified: row.author_verified,
      isAnonymous: row.is_anonymous,
      title: row.title,
      content: row.content,
      attachments: JSON.parse(row.attachments || '[]'),
      rating: row.rating,
      status: row.status,
      visibility: row.visibility,
      helpfulVotes: parseInt(row.helpful_votes) || 0,
      notHelpfulVotes: parseInt(row.not_helpful_votes) || 0,
      replies: parseInt(row.replies_count) || 0,
      moderatedBy: row.moderated_by,
      moderatedAt: row.moderated_at,
      moderationNotes: row.moderation_notes,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at,
      metadata: JSON.parse(row.metadata || '{}')
 as Feedback;


  private mapSummaryRow(row: unknown): FeedbackSummary {
    return JSON.parse(row.summary_data);


  private mapReplyRow(row: unknown): FeedbackReply {
    return {
      id: row.id,
      feedbackId: row.feedback_id,
      parentReplyId: row.parent_reply_id,
      authorId: row.author_id,
      authorName: row.author_name || 'Unknown',
      authorType: 'user', // Would be determined from user roles
      content: row.content,
      attachments: [],
      status: row.status,
      likes: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      editedAt: row.edited_at
    };

