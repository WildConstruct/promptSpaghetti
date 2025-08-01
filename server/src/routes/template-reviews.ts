/**
 * Epic 16 Marketplace - Template Reviews API Routes
 * 
 * RESTful API endpoints for template review submission, moderation,
 * and review management for the marketplace community system.
 * 
 * Routes:
 * - POST /api/reviews - Submit a new review
 * - GET /api/reviews/template/:templateId - Get reviews for template
 * - GET /api/reviews/:reviewId - Get specific review
 * - PUT /api/reviews/:reviewId/helpful - Mark review as helpful
 * - PUT /api/reviews/:reviewId/report - Report review
 * - GET /api/reviews/moderation/queue - Get moderation queue (admin)
 * - PUT /api/reviews/:reviewId/moderate - Moderate review (admin)
 */

import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { TemplateReviewService } from '../marketplace/TemplateReviewService';
import { Pool } from 'pg';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    email: string;
  };


const router = Router();

// Initialize services (would be injected in production)
let reviewService: TemplateReviewService;

// Initialize services with pool
const initializeServices = (pool: Pool) => {
  reviewService = new TemplateReviewService(pool);
};

/**
 * Middleware to check authentication
 */
const requireAuth = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });

  next();
};

/**
 * Middleware to check admin/moderator permissions
 */
const requireModerator = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });


  const hasModerationRole = req.user.roles.some(role => 
    ['admin', 'moderator', 'curator'].includes(role)
  );

  if (!hasModerationRole) {
    return res.status(403).json({ error: 'Moderator access required' });


  next();
};

/**
 * POST /api/reviews
 * Submit a new template review
 */
router.post('/',
  requireAuth,
  [
    body('templateId').isUUID().withMessage('Template ID must be a valid UUID'),
    body('title').isString().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
    body('content').isString().isLength({ min: 20, max: 2000 }).withMessage('Content must be 20-2000 characters'),
    body('criteria.quality').isInt({ min: 1, max: 5 }).withMessage('Quality rating must be 1-5'),
    body('criteria.usability').isInt({ min: 1, max: 5 }).withMessage('Usability rating must be 1-5'),
    body('criteria.documentation').isInt({ min: 1, max: 5 }).withMessage('Documentation rating must be 1-5'),
    body('criteria.support').isInt({ min: 1, max: 5 }).withMessage('Support rating must be 1-5'),
    body('metadata.purchaseVerified').optional().isBoolean().withMessage('Purchase verified must be boolean'),
    body('metadata.usageDuration').optional().isInt({ min: 0 }).withMessage('Usage duration must be non-negative')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { templateId, title, content, criteria, metadata = {} } = req.body;

      // Check if user has already reviewed this template
      const existingReviewQuery = `
        SELECT id FROM marketplace_template_reviews 
        WHERE template_id = $1 AND user_id = $2
      `;
      const existingReview = await reviewService['pool'].query(existingReviewQuery, [templateId, req.user!.id]);

      if (existingReview.rows.length > 0) {
        return res.status(409).json({
          error: 'You have already reviewed this template'
        });


      const reviewId = await reviewService.submitReview({
        templateId,
        userId: req.user!.id,
        title,
        content,
        criteria,
        metadata: {
          ...metadata,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip

      });

      res.status(201).json({
        success: true,
        data: {
          reviewId,
          status: 'submitted',
          message: 'Review submitted successfully and is pending moderation'

      });
 catch (error) {
      console.error('Failed to submit review:', error);
      res.status(500).json({
        error: 'Failed to submit review',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/reviews/template/:templateId
 * Get reviews for a specific template
 */
router.get('/template/:templateId',
  [
    param('templateId').isUUID().withMessage('Template ID must be a valid UUID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    query('sortBy').optional().isIn(['newest', 'oldest', 'helpful', 'rating']).withMessage('Invalid sort option'),
    query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Min rating must be 1-5'),
    query('verified').optional().isBoolean().withMessage('Verified must be boolean')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { templateId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'newest',
        minRating,
        verified
 = req.query;

      const result = await reviewService.getTemplateReviews(templateId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as 'newest' | 'oldest' | 'helpful' | 'rating',
        minRating: minRating ? parseInt(minRating as string) : undefined,
        verified: verified ? verified === 'true' : undefined
      });

      res.json({
        success: true,
        data: result
      });
 catch (error) {
      console.error('Failed to get template reviews:', error);
      res.status(500).json({
        error: 'Failed to retrieve template reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/reviews/:reviewId
 * Get a specific review by ID
 */
router.get('/:reviewId',
  [
    param('reviewId').isUUID().withMessage('Review ID must be a valid UUID')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { reviewId } = req.params;

      const query = `
        SELECT r.*, u.email as reviewer_email, t.title as template_title
        FROM marketplace_template_reviews r
        JOIN users u ON r.user_id = u.id
        JOIN marketplace_templates t ON r.template_id = t.id
        WHERE r.id = $1 AND r.status = 'approved'
      `;

      const result = await reviewService['pool'].query(query, [reviewId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Review not found'
        });


      const review = result.rows[0];
      
      res.json({
        success: true,
        data: {
          id: review.id,
          templateId: review.template_id,
          templateTitle: review.template_title,
          reviewerEmail: review.reviewer_email,
          title: review.title,
          content: review.content,
          criteria: {
            quality: review.quality_rating,
            usability: review.usability_rating,
            documentation: review.documentation_rating,
            support: review.support_rating

          overallRating: review.overall_rating,
          timestamp: review.timestamp,
          verified: review.verified,
          helpful: review.helpful,
          sentiment: {
            score: review.sentiment_score,
            confidence: review.sentiment_confidence


      });
 catch (error) {
      console.error('Failed to get review:', error);
      res.status(500).json({
        error: 'Failed to retrieve review',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * PUT /api/reviews/:reviewId/helpful
 * Mark a review as helpful
 */
router.put('/:reviewId/helpful',
  requireAuth,
  [
    param('reviewId').isUUID().withMessage('Review ID must be a valid UUID')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { reviewId } = req.params;

      await reviewService.markHelpful(reviewId, req.user!.id);

      res.json({
        success: true,
        message: 'Review marked as helpful'
      });
 catch (error) {
      console.error('Failed to mark review as helpful:', error);
      res.status(500).json({
        error: 'Failed to mark review as helpful',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * PUT /api/reviews/:reviewId/report
 * Report a review as inappropriate
 */
router.put('/:reviewId/report',
  requireAuth,
  [
    param('reviewId').isUUID().withMessage('Review ID must be a valid UUID'),
    body('reason').isString().isLength({ min: 10, max: 500 }).withMessage('Reason must be 10-500 characters')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { reviewId } = req.params;
      const { reason } = req.body;

      // Update reported count and create report record
      const updateQuery = `
        UPDATE marketplace_template_reviews 
        SET reported = reported + 1 
        WHERE id = $1
      `;

      const reportQuery = `
        INSERT INTO marketplace_review_reports (review_id, reporter_id, reason, timestamp)
        VALUES ($1, $2, $3, NOW())
      `;

      await reviewService['pool'].query('BEGIN');
      await reviewService['pool'].query(updateQuery, [reviewId]);
      await reviewService['pool'].query(reportQuery, [reviewId, req.user!.id, reason]);
      await reviewService['pool'].query('COMMIT');

      res.json({
        success: true,
        message: 'Review reported successfully'
      });
 catch (error) {
      await reviewService['pool'].query('ROLLBACK');
      console.error('Failed to report review:', error);
      res.status(500).json({
        error: 'Failed to report review',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/reviews/moderation/queue
 * Get moderation queue (admin/moderator only)
 */
router.get('/moderation/queue',
  requireModerator,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const queue = await reviewService.getModerationQueue();

      res.json({
        success: true,
        data: queue
      });
 catch (error) {
      console.error('Failed to get moderation queue:', error);
      res.status(500).json({
        error: 'Failed to retrieve moderation queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * PUT /api/reviews/:reviewId/moderate
 * Moderate a review (approve/reject)
 */
router.put('/:reviewId/moderate',
  requireModerator,
  [
    param('reviewId').isUUID().withMessage('Review ID must be a valid UUID'),
    body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
    body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be max 500 characters')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { reviewId } = req.params;
      const { action, reason = '' } = req.body;

      if (action === 'approve') {
        await reviewService.approveReview(reviewId, req.user!.id);
 else {
        await reviewService.rejectReview(reviewId, req.user!.id, reason);


      res.json({
        success: true,
        message: `Review ${action}d successfully`
      });
 catch (error) {
      console.error('Failed to moderate review:', error);
      res.status(500).json({
        error: 'Failed to moderate review',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/reviews/analytics/template/:templateId
 * Get detailed analytics for a template's reviews
 */
router.get('/analytics/template/:templateId',
  [
    param('templateId').isUUID().withMessage('Template ID must be a valid UUID')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { templateId } = req.params;

      const aggregated = await reviewService.getAggregatedRating(templateId);

      // Get additional analytics
      const analyticsQuery = `
        SELECT 
          DATE_TRUNC('week', timestamp) as week,
          COUNT(*) as review_count,
          AVG(overall_rating) as avg_rating,
          AVG(sentiment_score) as avg_sentiment
        FROM marketplace_template_reviews
        WHERE template_id = $1 AND status = 'approved'
        GROUP BY DATE_TRUNC('week', timestamp)
        ORDER BY week DESC
        LIMIT 12
      `;

      const trendsResult = await reviewService['pool'].query(analyticsQuery, [templateId]);

      res.json({
        success: true,
        data: {
          aggregated,
          trends: trendsResult.rows.map(row => ({
            week: row.week,
            reviewCount: parseInt(row.review_count),
            averageRating: parseFloat(row.avg_rating),
            averageSentiment: parseFloat(row.avg_sentiment) || 0
          }))

      });
 catch (error) {
      console.error('Failed to get review analytics:', error);
      res.status(500).json({
        error: 'Failed to retrieve review analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

// Export router and initialization function
export { router as templateReviewsRouter, initializeServices as initializeTemplateReviewsServices };
export default router;