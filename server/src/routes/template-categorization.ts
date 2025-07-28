/**
 * Epic 16 Marketplace - Template Categorization API Routes
 * 
 * API endpoints for hierarchical categorization, intelligent classification,
 * and tag management for the marketplace knowledge base system.
 * 
 * Routes:
 * - GET /api/categories - Get category tree with statistics
 * - GET /api/categories/:categoryId - Get specific category details
 * - POST /api/categories - Create new category (admin)
 * - PUT /api/categories/:categoryId - Update category (admin)
 * - DELETE /api/categories/:categoryId - Delete category (admin)
 * - GET /api/categories/:categoryId/analytics - Get category analytics
 * - POST /api/classify - Auto-classify template content
 * - GET /api/tags - Get tags with filtering and search
 * - POST /api/tags - Create or get tags
 * - PUT /api/tags/:tagId - Update tag (admin)
 * - DELETE /api/tags/:tagId - Delete tag (admin)
 * - GET /api/optimization/categories - Get category optimization suggestions (admin)
 */

import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { CategorizationService } from '../marketplace/CategorizationService';
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
let categorizationService: CategorizationService;

// Initialize services with pool
const initializeServices = (pool: Pool) => {
  categorizationService = new CategorizationService(pool);
};

/**
 * Middleware to check authentication (optional for read operations)
 */
const optionalAuth = (req: AuthenticatedRequest, res: Response, next: Function) => {
  next();
};

/**
 * Middleware to check admin permissions
 */
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const isAdmin = req.user.roles.includes('admin');
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

/**
 * GET /api/categories
 * Get hierarchical category tree with optional statistics
 */
router.get('/',
  optionalAuth,
  [
    query('includeStats').optional().isBoolean().withMessage('Include stats must be boolean'),
    query('depth').optional().isInt({ min: 0, max: 10 }).withMessage('Depth must be 0-10'),
    query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
    query('parentId').optional().isUUID().withMessage('Parent ID must be valid UUID')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        includeStats = true,
        depth,
        featured,
        parentId
      } = req.query;

      const tree = await categorizationService.getCategoryTree(
        includeStats === 'true' || includeStats === true
      );

      // Apply filters if specified
      let filteredCategories = tree.categories;

      if (featured === 'true') {
        filteredCategories = tree.categories.filter(cat => cat.config.featured);
      }

      if (parentId) {
        filteredCategories = tree.categories.filter(cat => cat.parentId === parentId);
      }

      if (depth !== undefined) {
        const maxDepth = parseInt(depth as string);
        filteredCategories = filteredCategories.filter(cat => cat.depth <= maxDepth);
      }

      res.json({
        success: true,
        data: {
          categories: filteredCategories,
          totalCount: filteredCategories.length,
          maxDepth: tree.maxDepth,
          lastUpdated: tree.lastUpdated
        }
      });

    } catch (error) {
      console.error('Failed to get categories:', error);
      res.status(500).json({
        error: 'Failed to retrieve categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/categories/:categoryId
 * Get specific category with detailed information
 */
router.get('/:categoryId',
  optionalAuth,
  [
    param('categoryId').isUUID().withMessage('Category ID must be valid UUID')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { categoryId } = req.params;

      // Get category details from database
      const query = `
        SELECT 
          c.*,
          stats.template_count,
          stats.active_count,
          stats.total_downloads,
          stats.average_rating,
          stats.trending_score,
          parent.name as parent_name,
          u.name as created_by_name
        FROM marketplace_categories c
        LEFT JOIN marketplace_category_stats stats ON c.id = stats.category_id
        LEFT JOIN marketplace_categories parent ON c.parent_id = parent.id
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = $1
      `;

      const result = await categorizationService['pool'].query(query, [categoryId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Category not found'
        });
      }

      const row = result.rows[0];

      // Get child categories
      const childrenQuery = `
        SELECT * FROM marketplace_categories 
        WHERE parent_id = $1 
        ORDER BY sort_order, name
      `;
      const childrenResult = await categorizationService['pool'].query(childrenQuery, [categoryId]);

      // Get recent templates in this category
      const templatesQuery = `
        SELECT id, title, created_at, download_count, view_count
        FROM marketplace_templates 
        WHERE category_id = $1 AND status = 'published'
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      const templatesResult = await categorizationService['pool'].query(templatesQuery, [categoryId]);

      const category = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        parentId: row.parent_id,
        parentName: row.parent_name,
        depth: row.depth,
        path: row.path?.split('.') || [row.name],
        icon: row.icon,
        color: row.color,
        config: {
          featured: row.featured,
          visible: row.visible,
          searchable: row.searchable,
          autoClassification: row.auto_classification,
          requireApproval: row.require_approval
  }
        stats: {
          templateCount: parseInt(row.template_count) || 0,
          activeCount: parseInt(row.active_count) || 0,
          totalDownloads: parseInt(row.total_downloads) || 0,
          averageRating: parseFloat(row.average_rating) || 0,
          trendingScore: parseFloat(row.trending_score) || 0
  }
        metadata: {
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          createdBy: row.created_by,
          createdByName: row.created_by_name,
          sortOrder: row.sort_order,
          keywords: row.keywords || [],
          aliases: row.aliases || []
  }
        children: childrenResult.rows,
        recentTemplates: templatesResult.rows
      };

      res.json({
        success: true,
        data: category
      });

    } catch (error) {
      console.error('Failed to get category:', error);
      res.status(500).json({
        error: 'Failed to retrieve category',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/categories
 * Create new category (admin only)
 */
router.post('/',
  requireAdmin,
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('slug').isString().trim().matches(/^[a-z0-9\-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
    body('parentId').optional().isUUID().withMessage('Parent ID must be valid UUID'),
    body('icon').optional().isString().isLength({ max: 50 }).withMessage('Icon must be max 50 characters'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be valid hex code'),
    body('keywords').optional().isArray().withMessage('Keywords must be array'),
    body('aliases').optional().isArray().withMessage('Aliases must be array'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be non-negative integer')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        name,
        slug,
        description = '',
        parentId,
        icon,
        color,
        keywords = [],
        aliases = [],
        sortOrder = 0
      } = req.body;

      // Check if slug already exists
      const existingQuery = `
        SELECT id FROM marketplace_categories WHERE slug = $1
      `;
      const existingResult = await categorizationService['pool'].query(existingQuery, [slug]);

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          error: 'Category slug already exists'
        });
      }

      // Determine depth based on parent
      let depth = 0;
      if (parentId) {
        const parentQuery = `
          SELECT depth FROM marketplace_categories WHERE id = $1
        `;
        const parentResult = await categorizationService['pool'].query(parentQuery, [parentId]);
        
        if (parentResult.rows.length === 0) {
          return res.status(400).json({
            error: 'Parent category not found'
          });
        }
        
        depth = parentResult.rows[0].depth + 1;
        
        if (depth > 10) {
          return res.status(400).json({
            error: 'Maximum category depth (10) exceeded'
          });
        }
      }

      // Create category
      const insertQuery = `
        INSERT INTO marketplace_categories (
          name, slug, description, parent_id, depth, icon, color,
          keywords, aliases, sort_order, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const result = await categorizationService['pool'].query(insertQuery, [
        name, slug, description, parentId, depth, icon, color,
        keywords, aliases, sortOrder, req.user!.id
      ]);

      const newCategory = result.rows[0];

      // Initialize category statistics
      await categorizationService['pool'].query(`
        INSERT INTO marketplace_category_stats (category_id)
        VALUES ($1)
      `, [newCategory.id]);

      res.status(201).json({
        success: true,
        data: {
          id: newCategory.id,
          name: newCategory.name,
          slug: newCategory.slug,
          message: 'Category created successfully'
        }
      });

    } catch (error) {
      console.error('Failed to create category:', error);
      res.status(500).json({
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/categories/:categoryId/analytics
 * Get comprehensive category analytics
 */
router.get('/:categoryId/analytics',
  requireAdmin,
  [
    param('categoryId').isUUID().withMessage('Category ID must be valid UUID'),
    query('timeframe').optional().isIn(['7d', '30d', '90d']).withMessage('Invalid timeframe')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { categoryId } = req.params;
      const { timeframe = '30d' } = req.query;

      const analytics = await categorizationService.getCategoryAnalytics(
        categoryId,
        timeframe as '7d' | '30d' | '90d'
      );

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Failed to get category analytics:', error);
      res.status(500).json({
        error: 'Failed to retrieve category analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/classify
 * Auto-classify template content using AI
 */
router.post('/classify',
  optionalAuth,
  [
    body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').isString().trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
    body('content').optional().isObject().withMessage('Content must be object'),
    body('existingTags').optional().isArray().withMessage('Existing tags must be array')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { title, description, content, existingTags = [] } = req.body;

      const classification = await categorizationService.classifyTemplate(
        title,
        description,
        content,
        existingTags
      );

      res.json({
        success: true,
        data: classification
      });

    } catch (error) {
      console.error('Template classification failed:', error);
      res.status(500).json({
        error: 'Classification temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/tags
 * Get tags with filtering, search, and pagination
 */
router.get('/tags',
  optionalAuth,
  [
    query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('Search must be max 100 characters'),
    query('type').optional().isIn(['functional', 'topical', 'industry', 'technical', 'style']).withMessage('Invalid tag type'),
    query('category').optional().isUUID().withMessage('Category must be valid UUID'),
    query('approved').optional().isBoolean().withMessage('Approved must be boolean'),
    query('sortBy').optional().isIn(['name', 'usage', 'trending', 'created']).withMessage('Invalid sort option'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        search,
        type,
        category,
        approved = true,
        sortBy = 'usage',
        page = 1,
        limit = 50
      } = req.query;

      let query = `
        SELECT 
          t.*,
          c.name as category_name
        FROM marketplace_tags t
        LEFT JOIN marketplace_categories c ON t.category_id = c.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND (t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (type) {
        query += ` AND t.type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (category) {
        query += ` AND t.category_id = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (approved !== undefined) {
        query += ` AND t.approved = $${paramIndex}`;
        params.push(approved === 'true');
        paramIndex++;
      }

      // Add sorting
      const sortMap = {
        name: 't.name ASC',
        usage: 't.usage_count DESC',
        trending: 't.trending_score DESC',
        created: 't.created_at DESC'
      };
      query += ` ORDER BY ${sortMap[sortBy as keyof typeof sortMap]}`;

      // Add pagination
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit as string), offset);

      // Get tags and total count
      const [tagsResult, countResult] = await Promise.all([
        categorizationService['pool'].query(query, params),
        categorizationService['pool'].query(
          'SELECT COUNT(*) FROM marketplace_tags WHERE approved = $1',
          [approved === 'true']

      ]);

      const tags = tagsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        category: row.category_name,
        usageCount: row.usage_count,
        trendingScore: row.trending_score,
        type: row.type,
        confidence: row.confidence,
        approved: row.approved,
        createdAt: row.created_at
      }));

      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          tags,
          total,
          hasMore: offset + parseInt(limit as string) < total,
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        }
      });

    } catch (error) {
      console.error('Failed to get tags:', error);
      res.status(500).json({
        error: 'Failed to retrieve tags',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/tags
 * Create or get tags with intelligent suggestions
 */
router.post('/tags',
  optionalAuth,
  [
    body('tags').isArray().withMessage('Tags must be array'),
    body('tags.*').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Each tag must be 1-50 characters'),
    body('context').optional().isObject().withMessage('Context must be object')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { tags: tagNames, context = {} } = req.body;

      const tags = await categorizationService.getOrCreateTags(tagNames, context);

      res.json({
        success: true,
        data: {
          tags,
          message: `Processed ${tags.length} tag(s)`
        }
      });

    } catch (error) {
      console.error('Failed to process tags:', error);
      res.status(500).json({
        error: 'Failed to process tags',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/optimization/categories
 * Get category optimization suggestions (admin only)
 */
router.get('/optimization/categories',
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const optimization = await categorizationService.suggestCategoryOptimization();

      res.json({
        success: true,
        data: optimization
      });

    } catch (error) {
      console.error('Failed to get category optimization:', error);
      res.status(500).json({
        error: 'Failed to retrieve optimization suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Export router and initialization function
export { router as templateCategorizationRouter, initializeServices as initializeTemplateCategorizationServices };
export default router;