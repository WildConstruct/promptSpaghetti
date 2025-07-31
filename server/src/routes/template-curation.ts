/**
 * Epic 16 Marketplace - Template Curation API Routes
 *
 * RESTful API endpoints for content curation workflow management,
 * curator assignment, and AI-powered quality assessment for the
 * marketplace community system.
 *
 * Routes:
 * - POST /api/curation - Submit template for curation
 * - GET /api/curation/queue - Get curation queue (curator/admin)
 * - GET /api/curation/:curationId - Get specific curation item
 * - PUT /api/curation/:curationId/assign - Assign to curator
 * - PUT /api/curation/:curationId/review - Complete curator review
 * - GET /api/curation/analytics/curator/:curatorId - Curator analytics
 * - GET /api/curation/analytics/trends - Quality trends and insights
 * - POST /api/curation/:curationId/appeal - Appeal curation decision
 */

import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { CurationService } from '../marketplace/CurationService';
import { Pool } from 'pg';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    email: string;
  };
}

const router = Router();

// Initialize services (would be injected in production)
let curationService: CurationService;

// Initialize services with pool
const initializeServices = (pool: Pool) => {
  curationService = new CurationService(pool);
};

/**
 * Middleware to check authentication
 */
const requireAuth = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * Middleware to check curator/admin permissions
 */
const requireCurator = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const hasCurationRole = req.user.roles.some(role => ['admin', 'curator', 'moderator'].includes(role));

  if (!hasCurationRole) {
    return res.status(403).json({ error: 'Curator access required' });
  }

  next();
};

/**
 * POST /api/curation
 * Submit a template for curation
 */
router.post(
  '/',
  requireAuth,
  [
    body('templateId').isUUID().withMessage('Template ID must be a valid UUID'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { templateId, metadata = {} } = req.body;

      // Check if template already in curation queue
      const existingQuery = `
        SELECT id FROM marketplace_curation_queue 
        WHERE template_id = $1 AND status NOT IN ('approved', 'rejected')
      `;
      const existingResult = await curationService['pool'].query(existingQuery, [templateId]);

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          error: 'Template is already in curation queue',
          curationId: existingResult.rows[0].id,
        });
      }

      const curationId = await curationService.submitForCuration(templateId, req.user!.id, {
        ...metadata,
        submissionSource: 'api',
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        data: {
          curationId,
          status: 'submitted',
          message: 'Template submitted for curation successfully',
        },
      });
    } catch (error) {
      console.error('Failed to submit for curation:', error);
      res.status(500).json({
        error: 'Failed to submit template for curation',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/curation/queue
 * Get curation queue with filtering and pagination
 */
router.get(
  '/queue',
  requireCurator,
  [
    query('curatorId').optional().isUUID().withMessage('Curator ID must be a valid UUID'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    query('status')
      .optional()
      .isIn(['pending_ai', 'pending_curator', 'approved', 'rejected', 'revision_needed'])
      .withMessage('Invalid status'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { curatorId, category, priority, status, limit = 50 } = req.query;

      const queue = await curationService.getCurationQueue({
        curatorId: curatorId as string,
        category: category as string,
        priority: priority as string,
        status: status as string,
        limit: parseInt(limit as string),
      });

      res.json({
        success: true,
        data: queue,
      });
    } catch (error) {
      console.error('Failed to get curation queue:', error);
      res.status(500).json({
        error: 'Failed to retrieve curation queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/curation/:curationId
 * Get specific curation item details
 */
router.get(
  '/:curationId',
  requireCurator,
  [param('curationId').isUUID().withMessage('Curation ID must be a valid UUID')],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { curationId } = req.params;

      const query = `
        SELECT 
          c.*,
          t.title as template_title,
          t.description as template_description,
          u.email as submitter_email,
          curator.email as curator_email
        FROM marketplace_curation_queue c
        JOIN marketplace_templates t ON c.template_id = t.id
        JOIN users u ON c.submitted_by = u.id
        LEFT JOIN marketplace_curators mc ON c.curator_id = mc.id
        LEFT JOIN users curator ON mc.user_id = curator.id
        WHERE c.id = $1
      `;

      const result = await curationService['pool'].query(query, [curationId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Curation item not found',
        });
      }

      const item = result.rows[0];

      res.json({
        success: true,
        data: {
          id: item.id,
          templateId: item.template_id,
          templateTitle: item.template_title,
          templateDescription: item.template_description,
          submittedBy: item.submitted_by,
          submitterEmail: item.submitter_email,
          submittedAt: item.submitted_at,
          content: JSON.parse(item.content),
          aiAssessment: JSON.parse(item.ai_assessment),
          curatorReview: item.curator_review ? JSON.parse(item.curator_review) : null,
          curatorId: item.curator_id,
          curatorEmail: item.curator_email,
          assignedAt: item.assigned_at,
          reviewedAt: item.reviewed_at,
          status: item.status,
          priority: item.priority,
          metrics: JSON.parse(item.metrics || '{}'),
          appealCount: item.appeal_count,
          revisionCount: item.revision_count,
        },
      });
    } catch (error) {
      console.error('Failed to get curation item:', error);
      res.status(500).json({
        error: 'Failed to retrieve curation item',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * PUT /api/curation/:curationId/assign
 * Assign curation item to curator
 */
router.put(
  '/:curationId/assign',
  requireCurator,
  [
    param('curationId').isUUID().withMessage('Curation ID must be a valid UUID'),
    body('curatorId').optional().isUUID().withMessage('Curator ID must be a valid UUID'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { curationId } = req.params;
      const { curatorId } = req.body;

      // If no curator specified, auto-assign optimal curator
      await curationService.assignToCurator(curationId, curatorId);

      res.json({
        success: true,
        message: 'Curation item assigned successfully',
      });
    } catch (error) {
      console.error('Failed to assign curation item:', error);
      res.status(500).json({
        error: 'Failed to assign curation item',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * PUT /api/curation/:curationId/review
 * Complete curator review of curation item
 */
router.put(
  '/:curationId/review',
  requireCurator,
  [
    param('curationId').isUUID().withMessage('Curation ID must be a valid UUID'),
    body('decision')
      .isIn(['approved', 'rejected', 'needs_revision'])
      .withMessage('Decision must be approved, rejected, or needs_revision'),
    body('feedback').isString().isLength({ min: 20, max: 1000 }).withMessage('Feedback must be 20-1000 characters'),
    body('qualityScore').isFloat({ min: 0, max: 1 }).withMessage('Quality score must be 0-1'),
    body('modifications').optional().isArray().withMessage('Modifications must be an array'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { curationId } = req.params;
      const { decision, feedback, qualityScore, modifications = [] } = req.body;

      // Verify curator is assigned to this item or is admin
      const verifyQuery = `
        SELECT curator_id FROM marketplace_curation_queue WHERE id = $1
      `;
      const verifyResult = await curationService['pool'].query(verifyQuery, [curationId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Curation item not found' });
      }

      const assignedCuratorId = verifyResult.rows[0].curator_id;
      const isAdmin = req.user!.roles.includes('admin');

      // Check if user is the assigned curator or find curator profile
      let curatorId = null;
      if (assignedCuratorId) {
        const curatorQuery = `
          SELECT c.id FROM marketplace_curators c 
          WHERE c.id = $1 AND c.user_id = $2
        `;
        const curatorResult = await curationService['pool'].query(curatorQuery, [assignedCuratorId, req.user!.id]);
        if (curatorResult.rows.length > 0) {
          curatorId = assignedCuratorId;
        }
      }

      if (!curatorId && !isAdmin) {
        return res.status(403).json({
          error: 'You are not assigned to review this curation item',
        });
      }

      // If admin and no curator assigned, find/create curator profile
      if (!curatorId && isAdmin) {
        const adminCuratorQuery = `
          SELECT id FROM marketplace_curators WHERE user_id = $1
        `;
        const adminCuratorResult = await curationService['pool'].query(adminCuratorQuery, [req.user!.id]);
        curatorId = adminCuratorResult.rows[0]?.id;
      }

      if (!curatorId) {
        return res.status(400).json({
          error: 'Curator profile not found',
        });
      }

      await curationService.completeCuratorReview(
        curationId,
        curatorId,
        decision,
        feedback,
        qualityScore,
        modifications
      );

      res.json({
        success: true,
        message: `Curation review completed: ${decision}`,
      });
    } catch (error) {
      console.error('Failed to complete curator review:', error);
      res.status(500).json({
        error: 'Failed to complete curator review',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/curation/analytics/curator/:curatorId
 * Get comprehensive curator performance analytics
 */
router.get(
  '/analytics/curator/:curatorId',
  requireCurator,
  [param('curatorId').isUUID().withMessage('Curator ID must be a valid UUID')],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { curatorId } = req.params;

      // Verify access (curator can only view own analytics unless admin)
      const isAdmin = req.user!.roles.includes('admin');
      if (!isAdmin) {
        const curatorQuery = `
          SELECT id FROM marketplace_curators WHERE id = $1 AND user_id = $2
        `;
        const curatorResult = await curationService['pool'].query(curatorQuery, [curatorId, req.user!.id]);

        if (curatorResult.rows.length === 0) {
          return res.status(403).json({
            error: 'Access denied to curator analytics',
          });
        }
      }

      const analytics = await curationService.getCuratorAnalytics(curatorId);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error('Failed to get curator analytics:', error);
      res.status(500).json({
        error: 'Failed to retrieve curator analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/curation/analytics/trends
 * Get quality trends and curation insights
 */
router.get(
  '/analytics/trends',
  requireCurator,
  [query('period').optional().isIn(['day', 'week', 'month']).withMessage('Period must be day, week, or month')],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { period = 'week' } = req.query;

      const trends = await curationService.getQualityTrends(period as 'day' | 'week' | 'month');

      // Get additional insights
      const insightsQuery = `
        SELECT 
          COUNT(*) as total_submissions,
          COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
          COUNT(*) FILTER (WHERE status = 'revision_needed') as revision_count,
          COUNT(*) FILTER (WHERE status IN ('pending_ai', 'pending_curator')) as pending_count,
          AVG((ai_assessment->>'overallScore')::float) as avg_ai_score,
          COUNT(DISTINCT curator_id) FILTER (WHERE curator_id IS NOT NULL) as active_curators,
          AVG(EXTRACT(EPOCH FROM (reviewed_at - assigned_at))/3600) as avg_review_hours
        FROM marketplace_curation_queue
        WHERE submitted_at >= NOW() - INTERVAL '30 days'
      `;

      const insightsResult = await curationService['pool'].query(insightsQuery);
      const insights = insightsResult.rows[0];

      res.json({
        success: true,
        data: {
          trends,
          summary: {
            totalSubmissions: parseInt(insights.total_submissions) || 0,
            approvedCount: parseInt(insights.approved_count) || 0,
            rejectedCount: parseInt(insights.rejected_count) || 0,
            revisionCount: parseInt(insights.revision_count) || 0,
            pendingCount: parseInt(insights.pending_count) || 0,
            averageAIScore: parseFloat(insights.avg_ai_score) || 0,
            activeCurators: parseInt(insights.active_curators) || 0,
            averageReviewHours: parseFloat(insights.avg_review_hours) || 0,
            approvalRate:
              insights.total_submissions > 0
                ? (parseInt(insights.approved_count) / parseInt(insights.total_submissions)) * 100
                : 0,
          },
        },
      });
    } catch (error) {
      console.error('Failed to get curation trends:', error);
      res.status(500).json({
        error: 'Failed to retrieve curation trends',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * POST /api/curation/:curationId/appeal
 * Appeal a curation decision
 */
router.post(
  '/:curationId/appeal',
  requireAuth,
  [
    param('curationId').isUUID().withMessage('Curation ID must be a valid UUID'),
    body('reason').isString().isLength({ min: 50, max: 1000 }).withMessage('Appeal reason must be 50-1000 characters'),
    body('additionalEvidence')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Additional evidence must be max 2000 characters'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { curationId } = req.params;
      const { reason, additionalEvidence = '' } = req.body;

      // Verify user submitted this template for curation
      const verifyQuery = `
        SELECT submitted_by, status, appeal_count FROM marketplace_curation_queue 
        WHERE id = $1
      `;
      const verifyResult = await curationService['pool'].query(verifyQuery, [curationId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Curation item not found' });
      }

      const { submitted_by, status, appeal_count } = verifyResult.rows[0];

      if (submitted_by !== req.user!.id) {
        return res.status(403).json({
          error: 'You can only appeal your own curation submissions',
        });
      }

      if (status !== 'rejected') {
        return res.status(400).json({
          error: 'You can only appeal rejected curation decisions',
        });
      }

      if (appeal_count >= 3) {
        return res.status(400).json({
          error: 'Maximum number of appeals (3) reached for this item',
        });
      }

      // Update appeal count and reset status for re-review
      const appealQuery = `
        UPDATE marketplace_curation_queue 
        SET appeal_count = appeal_count + 1, 
            status = 'pending_curator',
            curator_id = NULL,
            assigned_at = NULL,
            reviewed_at = NULL,
            priority = 'high'
        WHERE id = $1
      `;

      await curationService['pool'].query(appealQuery, [curationId]);

      // Log the appeal
      await curationService['pool'].query(
        `
        INSERT INTO marketplace_curation_log (curation_id, action, user_id, details, timestamp)
        VALUES ($1, 'appeal_submitted', $2, $3, NOW())
      `,
        [curationId, req.user!.id, JSON.stringify({ reason, additionalEvidence, appealNumber: appeal_count + 1 })]
      );

      res.json({
        success: true,
        message: 'Appeal submitted successfully. Item has been queued for re-review.',
        data: {
          appealNumber: appeal_count + 1,
          newStatus: 'pending_curator',
          priority: 'high',
        },
      });
    } catch (error) {
      console.error('Failed to submit appeal:', error);
      res.status(500).json({
        error: 'Failed to submit appeal',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Export router and initialization function
export { router as templateCurationRouter, initializeServices as initializeTemplateCurationServices };
export default router;
