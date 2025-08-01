/**
 * File Browser Analytics API Routes
 * 
 * REST API endpoints for accessing file browser usage analytics,
 * download statistics, and developer insights.
 * 
 * Task: T-1752989144373-75 - Integrate usage analytics & download stats for developers
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { FileBrowserAnalytics, DeveloperInsights, UsageAnalytics } from '../analytics/FileBrowserAnalytics';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

// Request/Response type definitions



interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  userId?: string;
  fileType?: string;
  operation?: string;
  limit?: number;
  offset?: number;







interface TrackOperationBody {
  operationType: string;
  fileName: string;
  filePath: string;
  success?: boolean;
  metadata?: Record<string, any>;







interface TrackSearchBody {
  searchTerm: string;
  resultsCount: number;
  clickedResults?: number;
  metadata?: Record<string, any>;







interface TrackPerformanceBody {
  operationType: string;
  duration: number;
  success?: boolean;
  metadata?: Record<string, any>;





// Initialize analytics services (these would typically be dependency injected)
const analyticsCollector = new AnalyticsCollector({
  enabled: true,
  sampleRate: 1.0,
  bufferSize: 50,
  flushInterval: 30000 // 30 seconds
});

const fileBrowserAnalytics = new FileBrowserAnalytics(analyticsCollector, {
  enabled: true,
  trackDownloads: true,
  trackSearches: true,
  trackPerformance: true,
  generateInsights: true
});

/**
 * Register file browser analytics routes
 */
export async function registerFileBrowserAnalyticsRoutes(fastify: FastifyInstance) {
  
  // Track file operation
  fastify.post<{
    Body: TrackOperationBody;
>('/api/file-browser/analytics/track-operation', {
    schema: {
      body: {
        type: 'object',
        required: ['operationType', 'fileName', 'filePath'],
        properties: {
          operationType: { type: 'string' },
          fileName: { type: 'string' },
          filePath: { type: 'string' },
          success: { type: 'boolean' },
          metadata: { type: 'object' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            eventId: { type: 'string' },
            timestamp: { type: 'number' }




  }, async (request: FastifyRequest<{ Body: TrackOperationBody }>, reply: FastifyReply) => {
    try {
      const { operationType, fileName, filePath, success = true, metadata = {} } = request.body;
      
      // Add request metadata
      const enrichedMetadata = {
        ...metadata,
        sessionId: request.session?.sessionId || 'anonymous',
        userId: request.user?.id || 'anonymous',
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        timestamp: Date.now()
      };

      fileBrowserAnalytics.trackFileOperation(
        operationType,
        fileName,
        filePath,
        success,
        enrichedMetadata
      );

      return reply.code(200).send({
        success: true,
        eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      });
 catch (error) {
      fastify.log.error('Error tracking file operation:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to track file operation'
      });

  });

  // Track search operation
  fastify.post<{
    Body: TrackSearchBody;
>('/api/file-browser/analytics/track-search', {
    schema: {
      body: {
        type: 'object',
        required: ['searchTerm', 'resultsCount'],
        properties: {
          searchTerm: { type: 'string' },
          resultsCount: { type: 'number' },
          clickedResults: { type: 'number' },
          metadata: { type: 'object' }



  }, async (request: FastifyRequest<{ Body: TrackSearchBody }>, reply: FastifyReply) => {
    try {
      const { searchTerm, resultsCount, clickedResults = 0, metadata = {} } = request.body;
      
      const enrichedMetadata = {
        ...metadata,
        sessionId: request.session?.sessionId || 'anonymous',
        userId: request.user?.id || 'anonymous',
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip
      };

      fileBrowserAnalytics.trackSearch(
        searchTerm,
        resultsCount,
        clickedResults,
        enrichedMetadata
      );

      return reply.code(200).send({
        success: true,
        eventId: `search-${Date.now()}`,
        timestamp: Date.now()
      });
 catch (error) {
      fastify.log.error('Error tracking search:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to track search operation'
      });

  });

  // Track performance metric
  fastify.post<{
    Body: TrackPerformanceBody;
>('/api/file-browser/analytics/track-performance', {
    schema: {
      body: {
        type: 'object',
        required: ['operationType', 'duration'],
        properties: {
          operationType: { type: 'string' },
          duration: { type: 'number' },
          success: { type: 'boolean' },
          metadata: { type: 'object' }



  }, async (request: FastifyRequest<{ Body: TrackPerformanceBody }>, reply: FastifyReply) => {
    try {
      const { operationType, duration, success = true, metadata = {} } = request.body;
      
      const enrichedMetadata = {
        ...metadata,
        sessionId: request.session?.sessionId || 'anonymous',
        userId: request.user?.id || 'anonymous',
        userAgent: request.headers['user-agent']
      };

      fileBrowserAnalytics.trackPerformance(
        operationType,
        duration,
        success,
        enrichedMetadata
      );

      return reply.code(200).send({
        success: true,
        timestamp: Date.now()
      });
 catch (error) {
      fastify.log.error('Error tracking performance:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to track performance metric'
      });

  });

  // Get download statistics for a specific file
  fastify.get<{
    Params: { filePath: string };
>('/api/file-browser/analytics/download-stats/:filePath', {
    schema: {
      params: {
        type: 'object',
        properties: {
          filePath: { type: 'string' }



  }, async (request: FastifyRequest<{ Params: { filePath: string } }>, reply: FastifyReply) => {
    try {
      const { filePath } = request.params;
      const decodedFilePath = decodeURIComponent(filePath);
      
      const stats = fileBrowserAnalytics.getFileDownloadStats(decodedFilePath);
      
      if (!stats) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'No download statistics found for this file'
        });


      // Convert Maps to objects for JSON serialization
      const serializedStats = {
        ...stats,
        downloadsByTimeframe: {
          hourly: Object.fromEntries(stats.downloadsByTimeframe.hourly),
          daily: Object.fromEntries(stats.downloadsByTimeframe.daily),
          weekly: Object.fromEntries(stats.downloadsByTimeframe.weekly),
          monthly: Object.fromEntries(stats.downloadsByTimeframe.monthly)

        downloadsByUserAgent: Object.fromEntries(stats.downloadsByUserAgent),
        downloadsByLocation: Object.fromEntries(stats.downloadsByLocation)
      };

      return reply.code(200).send({
        success: true,
        data: serializedStats
      });
 catch (error) {
      fastify.log.error('Error retrieving download stats:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve download statistics'
      });

  });

  // Get usage analytics for a date range
  fastify.get<{
    Querystring: AnalyticsQuery;
>('/api/file-browser/analytics/usage', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          userId: { type: 'string' },
          fileType: { type: 'string' },
          operation: { type: 'string' },
          limit: { type: 'number' },
          offset: { type: 'number' }



  }, async (request: FastifyRequest<{ Querystring: AnalyticsQuery }>, reply: FastifyReply) => {
    try {
      const { 
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        endDate = new Date().toISOString() 
 = request.query;

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      if (start >= end) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Start date must be before end date'
        });


      // Limit date range to prevent excessive queries
      const maxDays = 90;
      if ((end.getTime() - start.getTime()) > (maxDays * 24 * 60 * 60 * 1000)) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: `Date range cannot exceed ${maxDays} days`
        });


      const analytics = await fileBrowserAnalytics.getUsageAnalytics(start, end);

      // Convert Maps to objects for JSON serialization
      const serializedAnalytics = {
        ...analytics,
        operationBreakdown: Object.fromEntries(analytics.operationBreakdown),
        fileTypePopularity: Object.fromEntries(analytics.fileTypePopularity)
      };

      return reply.code(200).send({
        success: true,
        data: serializedAnalytics
      });
 catch (error) {
      fastify.log.error('Error retrieving usage analytics:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve usage analytics'
      });

  });

  // Get developer insights
  fastify.get('/api/file-browser/analytics/insights', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check if user has admin/developer privileges
      if (!request.user || !request.user.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Developer insights require admin privileges'
        });


      const insights = await fileBrowserAnalytics.generateInsights();

      return reply.code(200).send({
        success: true,
        data: insights,
        generatedAt: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error('Error generating insights:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate developer insights'
      });

  });

  // Get analytics summary dashboard data
  fastify.get('/api/file-browser/analytics/dashboard', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get summary data from different time periods
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [todayAnalytics, weekAnalytics, monthAnalytics] = await Promise.all([
        fileBrowserAnalytics.getUsageAnalytics(today, now),
        fileBrowserAnalytics.getUsageAnalytics(weekAgo, now),
        fileBrowserAnalytics.getUsageAnalytics(monthAgo, now)
      ]);

      const dashboard = {
        summary: {
          today: {
            operations: todayAnalytics.overview.totalOperations,
            users: todayAnalytics.overview.uniqueUsers,
            downloads: todayAnalytics.overview.totalDownloads,
            errorRate: todayAnalytics.overview.errorRate

          thisWeek: {
            operations: weekAnalytics.overview.totalOperations,
            users: weekAnalytics.overview.uniqueUsers,
            downloads: weekAnalytics.overview.totalDownloads,
            errorRate: weekAnalytics.overview.errorRate

          thisMonth: {
            operations: monthAnalytics.overview.totalOperations,
            users: monthAnalytics.overview.uniqueUsers,
            downloads: monthAnalytics.overview.totalDownloads,
            errorRate: monthAnalytics.overview.errorRate


        topOperations: Object.fromEntries(
          Array.from(weekAnalytics.operationBreakdown.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
        ),
        topFileTypes: Object.fromEntries(
          Array.from(weekAnalytics.fileTypePopularity.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
        ),
        performanceMetrics: {
          averageLoadTime: weekAnalytics.performanceMetrics.averageLoadTime,
          averageOperationTime: weekAnalytics.performanceMetrics.averageOperationTime

        searchMetrics: weekAnalytics.searchMetrics,
        generatedAt: new Date().toISOString()
      };

      return reply.code(200).send({
        success: true,
        data: dashboard
      });
 catch (error) {
      fastify.log.error('Error generating dashboard data:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to generate dashboard data'
      });

  });

  // Export analytics data
  fastify.get<{
    Querystring: { format?: 'json' | 'csv' };
>('/api/file-browser/analytics/export', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['json', 'csv'] }



  }, async (request: FastifyRequest<{ Querystring: { format?: 'json' | 'csv' } }>, reply: FastifyReply) => {
    try {
      // Check if user has admin/developer privileges
      if (!request.user || !request.user.roles?.includes('admin')) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Data export requires admin privileges'
        });


      const { format = 'json' } = request.query;
      const exportData = fileBrowserAnalytics.exportAnalyticsData(format);

      const filename = `file-browser-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      
      reply.header('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      
      return reply.send(exportData);
 catch (error) {
      fastify.log.error('Error exporting analytics data:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to export analytics data'
      });

  });

  // Health check endpoint for analytics service
  fastify.get('/api/file-browser/analytics/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const analyticsStatus = analyticsCollector.getCurrentSummary();
      
      return reply.code(200).send({
        success: true,
        status: 'healthy',
        analytics: {
          isCollectionActive: analyticsStatus.isCollectionActive,
          totalEventsRecorded: analyticsStatus.totalEventsRecorded,
          bufferSize: analyticsStatus.bufferSize,
          sessionDuration: analyticsStatus.sessionDuration,
          lastHourMetrics: analyticsStatus.lastHour

        timestamp: new Date().toISOString()
      });
 catch (error) {
      fastify.log.error('Error checking analytics health:', error);
      return reply.code(500).send({
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });

  });

  fastify.log.info('File browser analytics routes registered successfully');


// Export the analytics instances for use in other parts of the application
export { fileBrowserAnalytics, analyticsCollector };