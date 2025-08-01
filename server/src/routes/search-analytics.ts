/**
 * Epic 16 Marketplace - Search Analytics API Routes
 * 
 * RESTful API endpoints for search analytics, performance monitoring,
 * and optimization recommendations for the marketplace search system.
 * 
 * Routes:
 * - GET /api/search-analytics/metrics - Get search performance metrics
 * - GET /api/search-analytics/alerts - Get active performance alerts
 * - GET /api/search-analytics/health - Get search infrastructure health
 * - GET /api/search-analytics/recommendations - Get optimization recommendations
 * - POST /api/search-analytics/events - Track search events
 * - POST /api/search-analytics/ab-test - Create A/B test
 */

import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { SearchAnalyticsService } from '../marketplace/SearchAnalyticsService';
import { SearchPerformanceMonitor } from '../marketplace/SearchPerformanceMonitor';
import { SearchIndexManager } from '../marketplace/SearchIndexManager';
import { SearchCacheService } from '../marketplace/SearchCacheService';
import { Pool } from 'pg';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    email: string;
  };


const router = Router();

// Initialize services (would be injected in production)
let searchAnalytics: SearchAnalyticsService;
let performanceMonitor: SearchPerformanceMonitor;
let indexManager: SearchIndexManager;
let cacheService: SearchCacheService;

// Initialize services with pool
const initializeServices = (pool: Pool) => {
  searchAnalytics = new SearchAnalyticsService(pool);
  performanceMonitor = new SearchPerformanceMonitor(pool, searchAnalytics);
  indexManager = new SearchIndexManager(pool);
  cacheService = new SearchCacheService(pool);
};

/**
 * Middleware to check admin permissions
 */
const requireAdminRole = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });


  const hasAdminRole = req.user.roles.some(role => 
    ['admin', 'administrator', 'search-admin'].includes(role)
  );

  if (!hasAdminRole) {
    return res.status(403).json({ error: 'Admin access required' });


  next();
};

/**
 * GET /api/search-analytics/metrics
 * Get comprehensive search performance metrics
 */
router.get('/metrics', 
  requireAdminRole,
  [
    query('start_date').optional().isISO8601().withMessage('Invalid start date format'),
    query('end_date').optional().isISO8601().withMessage('Invalid end date format'),
    query('granularity').optional().isIn(['hour', 'day', 'week']).withMessage('Invalid granularity'),
    query('realtime').optional().isBoolean().withMessage('Invalid realtime flag')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });


      const { start_date, end_date, granularity = 'day', realtime } = req.query;

      // Get real-time metrics if requested
      if (realtime === 'true') {
        const realtimeMetrics = await searchAnalytics.getRealTimeMetrics();
        const currentMetrics = await performanceMonitor.getCurrentMetrics();
        
        return res.json({
          timestamp: new Date(),
          realtime: realtimeMetrics,
          current: currentMetrics
        });


      // Get historical metrics
      const startDate = start_date ? new Date(start_date as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = end_date ? new Date(end_date as string) : new Date();

      const metrics = await searchAnalytics.getSearchMetrics(
        startDate,
        endDate,
        granularity as 'hour' | 'day' | 'week'
      );

      res.json({
        success: true,
        data: metrics,
        meta: {
          start_date: startDate,
          end_date: endDate,
          granularity

      });
 catch (error) {
      console.error('Failed to get search metrics:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve search metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/alerts
 * Get active performance alerts and alert history
 */
router.get('/alerts',
  requireAdminRole,
  [
    query('active_only').optional().isBoolean().withMessage('Invalid active_only flag'),
    query('severity').optional().isIn(['info', 'warning', 'critical']).withMessage('Invalid severity'),
    query('type').optional().isIn(['performance', 'availability', 'error_rate', 'user_experience']).withMessage('Invalid alert type'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid limit')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });


      const { active_only = 'true', severity, type, limit = '50' } = req.query;

      if (active_only === 'true') {
        const activeAlerts = await performanceMonitor.getActiveAlerts();
        
        // Filter by severity and type if specified
        let filteredAlerts = activeAlerts;
        if (severity) {
          filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);

        if (type) {
          filteredAlerts = filteredAlerts.filter(alert => alert.type === type);


        return res.json({
          success: true,
          data: {
            alerts: filteredAlerts.slice(0, parseInt(limit as string)),
            total: filteredAlerts.length,
            active_count: filteredAlerts.length,
            critical_count: filteredAlerts.filter(a => a.severity === 'critical').length,
            warning_count: filteredAlerts.filter(a => a.severity === 'warning').length

        });


      // Get alert history from database
      // This would include resolved alerts and historical data
      res.json({
        success: true,
        data: {
          alerts: [],
          total: 0,
          message: 'Alert history not yet implemented'

      });
 catch (error) {
      console.error('Failed to get alerts:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/health
 * Get search infrastructure health status
 */
router.get('/health',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const healthChecks = await performanceMonitor.performHealthChecks();
      const currentMetrics = await performanceMonitor.getCurrentMetrics();

      const overallHealth = healthChecks.every(check => check.status === 'healthy') ? 'healthy' :
        healthChecks.some(check => check.status === 'unhealthy') ? 'unhealthy' : 'degraded';

      res.json({
        success: true,
        data: {
          overall_status: overallHealth,
          timestamp: new Date(),
          services: healthChecks,
          performance_summary: {
            avg_latency: currentMetrics.searchLatency.avg,
            p95_latency: currentMetrics.searchLatency.p95,
            error_rate: currentMetrics.errorRate.rate,
            throughput: currentMetrics.throughput.requestsPerSecond,
            cache_hit_rate: currentMetrics.infrastructure.cacheHitRate


      });
 catch (error) {
      console.error('Failed to get health status:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve health status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/recommendations
 * Get optimization recommendations based on performance analysis
 */
router.get('/recommendations',
  requireAdminRole,
  [
    query('days').optional().isInt({ min: 1, max: 30 }).withMessage('Invalid days parameter'),
    query('category').optional().isIn(['index', 'query', 'cache', 'infrastructure']).withMessage('Invalid category')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });


      const { days = '7', category } = req.query;

      const recommendations = await performanceMonitor.getOptimizationRecommendations(
        parseInt(days as string)
      );

      // Filter by category if specified
      const filteredRecommendations = category ? 
        recommendations.filter(rec => rec.category === category) : 
        recommendations;

      res.json({
        success: true,
        data: {
          recommendations: filteredRecommendations,
          total: filteredRecommendations.length,
          analysis_period_days: parseInt(days as string),
          generated_at: new Date()

      });
 catch (error) {
      console.error('Failed to get recommendations:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve optimization recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/events
 * Track search events (called by search API)
 */
router.post('/events',
  [
    body('session_id').isString().notEmpty().withMessage('Session ID is required'),
    body('query').isString().withMessage('Query must be a string'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('result_count').isInt({ min: 0 }).withMessage('Result count must be a non-negative integer'),
    body('response_time_ms').isInt({ min: 0 }).withMessage('Response time must be a non-negative integer'),
    body('source').isIn(['elasticsearch', 'postgresql']).withMessage('Invalid source'),
    body('user_agent').optional().isString().withMessage('User agent must be a string'),
    body('ip_address').optional().isIP().withMessage('Invalid IP address')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });


      const {
        session_id,
        query,
        filters = {},
        result_count,
        response_time_ms,
        source,
        user_agent,
        ip_address
 = req.body;

      const searchEvent = {
        sessionId: session_id,
        userId: req.user?.id,
        query,
        filters,
        timestamp: new Date(),
        resultCount: result_count,
        responseTimeMs: response_time_ms,
        source,
        userAgent: user_agent,
        ipAddress: ip_address
      };

      await searchAnalytics.trackSearchEvent(searchEvent);

      res.status(201).json({
        success: true,
        message: 'Search event tracked successfully'
      });
 catch (error) {
      console.error('Failed to track search event:', error);
      res.status(500).json({ 
        error: 'Failed to track search event',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/events/click
 * Track search result click events
 */
router.post('/events/click',
  [
    body('session_id').isString().notEmpty().withMessage('Session ID is required'),
    body('query').isString().notEmpty().withMessage('Query is required'),
    body('template_id').isUUID().withMessage('Template ID must be a valid UUID'),
    body('position').isInt({ min: 1 }).withMessage('Position must be a positive integer'),
    body('clicked_from_search').optional().isBoolean().withMessage('Invalid clicked_from_search flag')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });


      const {
        session_id,
        query,
        template_id,
        position,
        clicked_from_search = true
 = req.body;

      const clickEvent = {
        sessionId: session_id,
        userId: req.user?.id,
        query,
        templateId: template_id,
        position,
        timestamp: new Date(),
        clickedFromSearch: clicked_from_search
      };

      await searchAnalytics.trackClickEvent(clickEvent);

      res.status(201).json({
        success: true,
        message: 'Click event tracked successfully'
      });
 catch (error) {
      console.error('Failed to track click event:', error);
      res.status(500).json({ 
        error: 'Failed to track click event',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/ab-test
 * Create A/B test for search optimization
 */
router.post('/ab-test',
  requireAdminRole,
  [
    body('name').isString().notEmpty().withMessage('Test name is required'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('variant_a').isObject().withMessage('Variant A configuration is required'),
    body('variant_b').isObject().withMessage('Variant B configuration is required'),
    body('traffic_split').optional().isFloat({ min: 0, max: 1 }).withMessage('Traffic split must be between 0 and 1')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });


      const {
        name,
        description,
        variant_a,
        variant_b,
        traffic_split = 0.5
 = req.body;

      const testId = await searchAnalytics.createSearchABTest(
        name,
        description,
        variant_a,
        variant_b,
        traffic_split
      );

      res.status(201).json({
        success: true,
        data: {
          test_id: testId,
          name,
          description,
          traffic_split,
          status: 'active'

      });
 catch (error) {
      console.error('Failed to create A/B test:', error);
      res.status(500).json({ 
        error: 'Failed to create A/B test',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/ab-test/:sessionId/variant
 * Get A/B test variant assignment for a session
 */
router.get('/ab-test/:sessionId/variant',
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });


      const variant = await searchAnalytics.getABTestVariant(sessionId);

      res.json({
        success: true,
        data: {
          session_id: sessionId,
          variant: variant,
          timestamp: new Date()

      });
 catch (error) {
      console.error('Failed to get A/B test variant:', error);
      res.status(500).json({ 
        error: 'Failed to get A/B test variant',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/dashboard
 * Get comprehensive dashboard data for search analytics
 */
router.get('/dashboard',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [
        currentMetrics,
        activeAlerts,
        healthStatus,
        recommendations
      ] = await Promise.all([
        performanceMonitor.getCurrentMetrics(),
        performanceMonitor.getActiveAlerts(),
        performanceMonitor.performHealthChecks(),
        performanceMonitor.getOptimizationRecommendations(7)
      ]);

      const overallHealth = healthStatus.every(check => check.status === 'healthy') ? 'healthy' :
        healthStatus.some(check => check.status === 'unhealthy') ? 'unhealthy' : 'degraded';

      res.json({
        success: true,
        data: {
          timestamp: new Date(),
          health: {
            overall_status: overallHealth,
            services: healthStatus

          performance: currentMetrics,
          alerts: {
            active: activeAlerts,
            total: activeAlerts.length,
            critical: activeAlerts.filter(a => a.severity === 'critical').length,
            warning: activeAlerts.filter(a => a.severity === 'warning').length

          recommendations: {
            items: recommendations.slice(0, 5), // Top 5 recommendations
            total: recommendations.length,
            high_priority: recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').length


      });
 catch (error) {
      console.error('Failed to get dashboard data:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/index/health
 * Get search index health information
 */
router.get('/index/health',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const health = await indexManager.getIndexHealth();
      res.json({
        success: true,
        data: health
      });
 catch (error) {
      console.error('Failed to get index health:', error);
      res.status(500).json({
        error: 'Failed to retrieve index health',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/index/recommendations
 * Get index optimization recommendations
 */
router.get('/index/recommendations',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const recommendations = await indexManager.getOptimizationRecommendations();
      res.json({
        success: true,
        data: {
          recommendations,
          total: recommendations.length,
          generated_at: new Date()

      });
 catch (error) {
      console.error('Failed to get index recommendations:', error);
      res.status(500).json({
        error: 'Failed to retrieve index recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/index/rebuild
 * Start index rebuild operation
 */
router.post('/index/rebuild',
  requireAdminRole,
  [
    body('batch_size').optional().isInt({ min: 100, max: 10000 }).withMessage('Batch size must be between 100 and 10000'),
    body('enable_optimization').optional().isBoolean().withMessage('Enable optimization must be boolean')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { batch_size = 1000, enable_optimization = true } = req.body;
      const operationId = await indexManager.rebuildIndex(batch_size, enable_optimization);

      res.status(202).json({
        success: true,
        data: {
          operation_id: operationId,
          status: 'started',
          message: 'Index rebuild operation started'

      });
 catch (error) {
      console.error('Failed to start index rebuild:', error);
      res.status(500).json({
        error: 'Failed to start index rebuild',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/index/optimize
 * Optimize search index
 */
router.post('/index/optimize',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const operationId = await indexManager.optimizeIndex();
      res.status(202).json({
        success: true,
        data: {
          operation_id: operationId,
          status: 'started',
          message: 'Index optimization started'

      });
 catch (error) {
      console.error('Failed to start index optimization:', error);
      res.status(500).json({
        error: 'Failed to start index optimization',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/index/operations/:operationId
 * Get operation status
 */
router.get('/index/operations/:operationId',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { operationId } = req.params;
      const operation = await indexManager.getOperationStatus(operationId);

      if (!operation) {
        return res.status(404).json({
          error: 'Operation not found'
        });


      res.json({
        success: true,
        data: operation
      });
 catch (error) {
      console.error('Failed to get operation status:', error);
      res.status(500).json({
        error: 'Failed to retrieve operation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * DELETE /api/search-analytics/index/operations/:operationId
 * Cancel operation
 */
router.delete('/index/operations/:operationId',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { operationId } = req.params;
      const cancelled = await indexManager.cancelOperation(operationId);

      if (!cancelled) {
        return res.status(404).json({
          error: 'Operation not found or cannot be cancelled'
        });


      res.json({
        success: true,
        message: 'Operation cancelled successfully'
      });
 catch (error) {
      console.error('Failed to cancel operation:', error);
      res.status(500).json({
        error: 'Failed to cancel operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/index/warmup
 * Warm up index for better performance
 */
router.post('/index/warmup',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await indexManager.warmupIndex();
      res.json({
        success: true,
        message: 'Index warmup completed'
      });
 catch (error) {
      console.error('Failed to warm up index:', error);
      res.status(500).json({
        error: 'Failed to warm up index',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/index/diagnostics
 * Get detailed index diagnostics
 */
router.get('/index/diagnostics',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const diagnostics = await indexManager.getIndexDiagnostics();
      res.json({
        success: true,
        data: diagnostics
      });
 catch (error) {
      console.error('Failed to get index diagnostics:', error);
      res.status(500).json({
        error: 'Failed to retrieve index diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/cache/metrics
 * Get cache performance metrics
 */
router.get('/cache/metrics',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const metrics = await cacheService.getMetrics();
      res.json({
        success: true,
        data: metrics
      });
 catch (error) {
      console.error('Failed to get cache metrics:', error);
      res.status(500).json({
        error: 'Failed to retrieve cache metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * GET /api/search-analytics/cache/health
 * Get cache health status
 */
router.get('/cache/health',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const health = await cacheService.getHealthStatus();
      res.json({
        success: true,
        data: health
      });
 catch (error) {
      console.error('Failed to get cache health:', error);
      res.status(500).json({
        error: 'Failed to retrieve cache health',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/cache/invalidate
 * Invalidate cache entries by pattern or tags
 */
router.post('/cache/invalidate',
  requireAdminRole,
  [
    body('pattern').optional().isString().withMessage('Pattern must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*').optional().isString().withMessage('Each tag must be a string')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { pattern, tags } = req.body;
      
      if (!pattern && (!tags || tags.length === 0)) {
        return res.status(400).json({
          error: 'Either pattern or tags must be provided'
        });


      const deletedCount = await cacheService.invalidate(pattern, tags);
      
      res.json({
        success: true,
        data: {
          deleted_entries: deletedCount,
          pattern,
          tags

      });
 catch (error) {
      console.error('Failed to invalidate cache:', error);
      res.status(500).json({
        error: 'Failed to invalidate cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/cache/warmup
 * Warm up cache with popular queries
 */
router.post('/cache/warmup',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await cacheService.warmupCache();
      res.json({
        success: true,
        message: 'Cache warmup initiated'
      });
 catch (error) {
      console.error('Failed to warm up cache:', error);
      res.status(500).json({
        error: 'Failed to warm up cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/cache/preload
 * Preload cache with specific queries
 */
router.post('/cache/preload',
  requireAdminRole,
  [
    body('queries').isArray().withMessage('Queries must be an array'),
    body('queries.*.query').isString().notEmpty().withMessage('Query is required'),
    body('queries.*.filters').optional().isObject().withMessage('Filters must be an object'),
    body('queries.*.priority').optional().isInt({ min: 1, max: 10 }).withMessage('Priority must be between 1 and 10')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { queries } = req.body;
      
      await cacheService.preload(queries);
      
      res.json({
        success: true,
        data: {
          preloaded_queries: queries.length,
          message: 'Cache preload initiated'

      });
 catch (error) {
      console.error('Failed to preload cache:', error);
      res.status(500).json({
        error: 'Failed to preload cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * DELETE /api/search-analytics/cache/clear
 * Clear all cache entries
 */
router.delete('/cache/clear',
  requireAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      await cacheService.clear();
      res.json({
        success: true,
        message: 'Cache cleared successfully'
      });
 catch (error) {
      console.error('Failed to clear cache:', error);
      res.status(500).json({
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

/**
 * POST /api/search-analytics/cache/generate-key
 * Generate cache key for testing purposes
 */
router.post('/cache/generate-key',
  requireAdminRole,
  [
    body('query').isString().notEmpty().withMessage('Query is required'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });


      const { query, filters = {}, options = {} } = req.body;
      const cacheKey = cacheService.generateCacheKey(query, filters, options);
      
      res.json({
        success: true,
        data: {
          cache_key: cacheKey,
          query,
          filters,
          options

      });
 catch (error) {
      console.error('Failed to generate cache key:', error);
      res.status(500).json({
        error: 'Failed to generate cache key',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

);

// Export router and initialization function
export { router as searchAnalyticsRouter, initializeServices as initializeSearchAnalyticsServices };
export default router;