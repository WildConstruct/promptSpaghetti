/**
 * Epic 16 Marketplace - Template Search API Routes
 * 
 * Advanced search API endpoints for template discovery with faceted search,
 * autocomplete, trending queries, and comprehensive filtering capabilities
 * for the knowledge base system.
 * 
 * Routes:
 * - GET /api/search/templates - Advanced template search
 * - GET /api/search/suggest - Real-time autocomplete suggestions
 * - GET /api/search/trending - Trending searches and popular queries
 * - GET /api/search/analytics - Search analytics and insights (admin)
 * - POST /api/search/click - Track search result clicks
 * - GET /api/search/saved - Get user's saved searches
 * - POST /api/search/save - Save a search query
 * - DELETE /api/search/saved/:searchId - Delete saved search
 */

import { Router, Request, Response } from 'express';
import { query, body, param, validationResult } from 'express-validator';
import { TemplateSearchService } from '../marketplace/TemplateSearchService';
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
let searchService: TemplateSearchService;

// Initialize services with pool
const initializeServices = (pool: Pool) => {
  searchService = new TemplateSearchService(pool);
};

/**
 * Middleware to check authentication (optional for search)
 */
const optionalAuth = (req: AuthenticatedRequest, res: Response, next: Function) => {
  // Search works for both authenticated and anonymous users
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
 * GET /api/search/templates
 * Advanced template search with faceted filtering
 */
router.get('/templates',
  optionalAuth,
  [
    query('q').optional().isString().trim().isLength({ max: 200 }).withMessage('Query must be max 200 characters'),
    query('categories').optional().custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value) && value.every(item => typeof item === 'string')) return true;
      throw new Error('Categories must be string or array of strings');
    }),
    query('tags').optional().custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value) && value.every(item => typeof item === 'string')) return true;
      throw new Error('Tags must be string or array of strings');
    }),
    query('complexity').optional().custom((value) => {
      const validComplexity = ['beginner', 'intermediate', 'advanced'];
      if (typeof value === 'string') return validComplexity.includes(value);
      if (Array.isArray(value)) return value.every(item => validComplexity.includes(item));
      throw new Error('Complexity must be beginner, intermediate, or advanced');
    }),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Min rating must be 0-5'),
    query('verified').optional().isBoolean().withMessage('Verified must be boolean'),
    query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
    query('author').optional().isUUID().withMessage('Author must be valid UUID'),
    query('dateStart').optional().isISO8601().withMessage('Date start must be valid ISO date'),
    query('dateEnd').optional().isISO8601().withMessage('Date end must be valid ISO date'),
    query('priceMin').optional().isFloat({ min: 0 }).withMessage('Price min must be non-negative'),
    query('priceMax').optional().isFloat({ min: 0 }).withMessage('Price max must be non-negative'),
    query('sortBy').optional().isIn(['relevance', 'newest', 'oldest', 'rating', 'popular', 'trending']).withMessage('Invalid sort option'),
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
        q: queryText,
        categories,
        tags,
        complexity,
        minRating,
        verified,
        featured,
        author,
        dateStart,
        dateEnd,
        priceMin,
        priceMax,
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = req.query;

      // Normalize arrays from query parameters
      const normalizeArray = (value: any): string[] | undefined => {
        if (!value) return undefined;
        return Array.isArray(value) ? value : [value];
      };

      const searchQuery = {
        query: queryText as string,
        categories: normalizeArray(categories),
        tags: normalizeArray(tags),
        complexity: normalizeArray(complexity) as ('beginner' | 'intermediate' | 'advanced')[] | undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        verified: verified ? verified === 'true' : undefined,
        featured: featured ? featured === 'true' : undefined,
        author: author as string,
        dateRange: (dateStart || dateEnd) ? {
          start: dateStart ? new Date(dateStart as string) : undefined,
          end: dateEnd ? new Date(dateEnd as string) : undefined
        } : undefined,
        priceRange: (priceMin || priceMax) ? {
          min: priceMin ? parseFloat(priceMin as string) : undefined,
          max: priceMax ? parseFloat(priceMax as string) : undefined
        } : undefined,
        sortBy: sortBy as 'relevance' | 'newest' | 'oldest' | 'rating' | 'popular' | 'trending',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const results = await searchService.search(searchQuery, req.user?.id);

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Template search failed:', error);
      res.status(500).json({
        error: 'Search temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/search/suggest
 * Real-time autocomplete suggestions
 */
router.get('/suggest',
  optionalAuth,
  [
    query('q').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Query must be 1-100 characters'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be 1-20')
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

      const { q: partial, limit = 10 } = req.query;

      const suggestions = await searchService.getAutocompleteSuggestions(
        partial as string,
        req.user?.id,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: {
          query: partial,
          suggestions
        }
      });

    } catch (error) {
      console.error('Autocomplete suggestions failed:', error);
      res.status(500).json({
        error: 'Suggestions temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/search/trending
 * Get trending searches and popular queries
 */
router.get('/trending',
  optionalAuth,
  [
    query('timeframe').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid timeframe'),
    query('category').optional().isString().trim().isLength({ max: 50 }).withMessage('Category must be max 50 characters'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
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
        timeframe = '24h',
        category,
        limit = 10
      } = req.query;

      const trending = await searchService.getTrendingSearches(
        timeframe as '1h' | '24h' | '7d' | '30d',
        category as string,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: {
          timeframe,
          category: category || null,
          trending
        }
      });

    } catch (error) {
      console.error('Trending searches failed:', error);
      res.status(500).json({
        error: 'Trending searches temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/search/analytics
 * Get comprehensive search analytics (admin only)
 */
router.get('/analytics',
  requireAdmin,
  [
    query('timeframe').optional().isIn(['24h', '7d', '30d']).withMessage('Invalid timeframe')
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

      const { timeframe = '7d' } = req.query;

      const analytics = await searchService.getSearchAnalytics(
        timeframe as '24h' | '7d' | '30d'
      );

      res.json({
        success: true,
        data: {
          timeframe,
          analytics
        }
      });

    } catch (error) {
      console.error('Search analytics failed:', error);
      res.status(500).json({
        error: 'Analytics temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/search/click
 * Track when users click on search results for analytics
 */
router.post('/click',
  optionalAuth,
  [
    body('templateId').isUUID().withMessage('Template ID must be valid UUID'),
    body('query').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Query must be 1-200 characters'),
    body('position').isInt({ min: 1 }).withMessage('Position must be positive integer'),
    body('searchId').optional().isUUID().withMessage('Search ID must be valid UUID')
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

      const { templateId, query, position, searchId } = req.body;

      // Log click event for analytics
      await searchService['pool'].query(`
        INSERT INTO marketplace_search_click_events (
          user_id, template_id, query, position, search_id, timestamp
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [req.user?.id, templateId, query, position, searchId]);

      // Update template view count
      await searchService['pool'].query(`
        UPDATE marketplace_templates 
        SET view_count = view_count + 1 
        WHERE id = $1
      `, [templateId]);

      res.json({
        success: true,
        message: 'Click tracked successfully'
      });

    } catch (error) {
      console.error('Click tracking failed:', error);
      res.status(500).json({
        error: 'Click tracking failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/search/saved
 * Get user's saved searches
 */
router.get('/saved',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const savedSearches = await searchService['pool'].query(`
        SELECT 
          id,
          name,
          search_query,
          created_at,
          last_used,
          use_count
        FROM marketplace_saved_searches 
        WHERE user_id = $1
        ORDER BY last_used DESC, created_at DESC
      `, [req.user.id]);

      res.json({
        success: true,
        data: {
          savedSearches: savedSearches.rows.map(row => ({
            id: row.id,
            name: row.name,
            searchQuery: JSON.parse(row.search_query),
            createdAt: row.created_at,
            lastUsed: row.last_used,
            useCount: row.use_count
          }))
        }
      });

    } catch (error) {
      console.error('Failed to get saved searches:', error);
      res.status(500).json({
        error: 'Failed to retrieve saved searches',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/search/save
 * Save a search query for quick access
 */
router.post('/save',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('searchQuery').isObject().withMessage('Search query must be an object')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, searchQuery } = req.body;

      // Check for duplicate names
      const existing = await searchService['pool'].query(`
        SELECT id FROM marketplace_saved_searches 
        WHERE user_id = $1 AND name = $2
      `, [req.user.id, name]);

      if (existing.rows.length > 0) {
        return res.status(409).json({
          error: 'A saved search with this name already exists'
        });
      }

      // Save the search
      const result = await searchService['pool'].query(`
        INSERT INTO marketplace_saved_searches (
          user_id, name, search_query, created_at, last_used, use_count
        ) VALUES ($1, $2, $3, NOW(), NOW(), 1)
        RETURNING id
      `, [req.user.id, name, JSON.stringify(searchQuery)]);

      res.status(201).json({
        success: true,
        data: {
          id: result.rows[0].id,
          name,
          message: 'Search saved successfully'
        }
      });

    } catch (error) {
      console.error('Failed to save search:', error);
      res.status(500).json({
        error: 'Failed to save search',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * DELETE /api/search/saved/:searchId
 * Delete a saved search
 */
router.delete('/saved/:searchId',
  [
    param('searchId').isUUID().withMessage('Search ID must be valid UUID')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { searchId } = req.params;

      const result = await searchService['pool'].query(`
        DELETE FROM marketplace_saved_searches 
        WHERE id = $1 AND user_id = $2
        RETURNING name
      `, [searchId, req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Saved search not found'
        });
      }

      res.json({
        success: true,
        message: `Saved search "${result.rows[0].name}" deleted successfully`
      });

    } catch (error) {
      console.error('Failed to delete saved search:', error);
      res.status(500).json({
        error: 'Failed to delete saved search',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Export router and initialization function
export { router as templateSearchRouter, initializeServices as initializeTemplateSearchServices };
export default router;