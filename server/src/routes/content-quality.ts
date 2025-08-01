/**
 * Content Quality Metrics API Routes - Epic 17.5.6
 * 
 * RESTful API endpoints for content quality assessment, metrics retrieval,
 * and quality improvement insights for the marketplace.
 * 
 * Task: E17-1753114397429-A96C99 - Create content quality metrics
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  ContentQualityMetricsService,
  ContentQualityMetrics,
  CreatorQualityDashboard,
  MarketplaceQualityInsights 
 from '../marketplace/ContentQualityMetricsService';
import { AnalyticsService } from '../marketplace/analytics.service';
import { QualityMetricsService } from '../services/QualityMetricsService';
import { TimeRange } from '../marketplace/analytics.types';
import { Database } from '../database';

// Request type definitions



interface AssessQualityRequest {
  Params: {
    templateId: string;



  };
  Querystring: {
    timeRange?: TimeRange;
    forceRefresh?: boolean;
  };




interface CreatorDashboardRequest {
  Params: {
    creatorId: string;



  };
  Querystring: {
    timeRange?: TimeRange;
    includeRecommendations?: boolean;
  };




interface QualityTrendsRequest {
  Params: {
    templateId: string;



  };
  Querystring: {
    timeRange?: TimeRange;
    granularity?: 'daily' | 'weekly' | 'monthly';
  };




interface MarketplaceInsightsRequest {
  Querystring: {
    timeRange?: TimeRange;
    category?: string;
    minQualityScore?: number;



  };




interface QualityBenchmarkRequest {
  Params: {
    templateId: string;



  };
  Body: {
    compareWith?: string[]; // competitor template IDs
    benchmarkType?: 'category' | 'marketplace' | 'custom';
  };




interface QualityRecommendationsRequest {
  Params: {
    templateId: string;



  };
  Querystring: {
    priority?: 'critical' | 'high' | 'medium' | 'low';
    category?: string;
    implementationLevel?: 'quick' | 'moderate' | 'complex';
  };


export async function contentQualityRoutes(fastify: FastifyInstance) {
  // Initialize services (in production, these would be properly dependency-injected)
  const database = new Database(); // Mock database instance
  const analyticsService = new AnalyticsService(database);
  const qualityService = new QualityMetricsService(
    {} as any, {} as any, {} as any, {} as any, {} as any, {} as any
  );
  const contentQualityService = new ContentQualityMetricsService(
    database,
    analyticsService,
    qualityService
  );

  /**
   * Assess content quality for a specific template
   */
  fastify.get<AssessQualityRequest>(
    '/content-quality/templates/:templateId/assess',
    {
      schema: {
        tags: ['Content Quality'],
        summary: 'Assess content quality for a template',
        params: {
          type: 'object',
          required: ['templateId'],
          properties: {
            templateId: { type: 'string', description: 'Template ID to assess' }


        querystring: {
          type: 'object',
          properties: {
            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_30D,
              description: 'Time range for quality assessment'

            forceRefresh: { 
              type: 'boolean', 
              default: false,
              description: 'Force fresh assessment ignoring cache'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              qualityMetrics: { type: 'object' },
              assessmentDuration: { type: 'number' },
              message: { type: 'string' }





    async (request: FastifyRequest<AssessQualityRequest>, reply: FastifyReply) => {
      try {
        const { templateId } = request.params;
        const { timeRange = TimeRange.LAST_30D, forceRefresh = false } = request.query;

        console.log(`🎯 Starting quality assessment for template: ${templateId}`);
        const startTime = Date.now();

        // Check for existing recent assessment unless force refresh
        let qualityMetrics: ContentQualityMetrics;
        
        if (!forceRefresh) {
          const existing = await contentQualityService.getLatestQualityMetrics(templateId);
          const isRecent = existing && 
            (Date.now() - existing.assessmentDate.getTime()) < 24 * 60 * 60 * 1000; // 24 hours
          
          if (isRecent) {
            qualityMetrics = existing;
            console.log(`📋 Using cached quality assessment for template: ${templateId}`);
 else {
            qualityMetrics = await contentQualityService.assessContentQuality(templateId, timeRange);

 else {
          qualityMetrics = await contentQualityService.assessContentQuality(templateId, timeRange);


        const assessmentDuration = Date.now() - startTime;

        reply.code(200).send({
          success: true,
          qualityMetrics,
          assessmentDuration,
          message: `Quality assessment completed: ${qualityMetrics.qualityGrade} (${qualityMetrics.overallQualityScore}%)`
        });
 catch (error) {
        console.error('Quality assessment failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Quality assessment failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get creator quality dashboard
   */
  fastify.get<CreatorDashboardRequest>(
    '/content-quality/creators/:creatorId/dashboard',
    {
      schema: {
        tags: ['Content Quality'],
        summary: 'Get content quality dashboard for a creator',
        params: {
          type: 'object',
          required: ['creatorId'],
          properties: {
            creatorId: { type: 'string', description: 'Creator ID' }


        querystring: {
          type: 'object',
          properties: {
            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_30D

            includeRecommendations: { 
              type: 'boolean', 
              default: true,
              description: 'Include quality improvement recommendations'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              dashboard: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<CreatorDashboardRequest>, reply: FastifyReply) => {
      try {
        const { creatorId } = request.params;
        const { timeRange = TimeRange.LAST_30D } = request.query;

        console.log(`📊 Generating quality dashboard for creator: ${creatorId}`);

        const dashboard = await contentQualityService.getCreatorQualityDashboard(
          creatorId,
          timeRange
        );

        reply.code(200).send({
          success: true,
          dashboard,
          message: 'Creator quality dashboard generated successfully'
        });
 catch (error) {
        console.error('Creator dashboard generation failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Dashboard generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get marketplace quality insights
   */
  fastify.get<MarketplaceInsightsRequest>(
    '/content-quality/marketplace/insights',
    {
      schema: {
        tags: ['Content Quality'],
        summary: 'Get marketplace-wide content quality insights',
        querystring: {
          type: 'object',
          properties: {
            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_30D

            category: { 
              type: 'string',
              description: 'Filter by specific category'

            minQualityScore: { 
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Minimum quality score filter'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              insights: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<MarketplaceInsightsRequest>, reply: FastifyReply) => {
      try {
        const { timeRange = TimeRange.LAST_30D, category, minQualityScore } = request.query;

        console.log('🌐 Generating marketplace quality insights');

        const insights = await contentQualityService.getMarketplaceQualityInsights(timeRange);

        // Apply filters if provided
        const filteredInsights = insights;
        if (category) {
          filteredInsights.categoryBreakdown = insights.categoryBreakdown.filter(
            cb => cb.category === category
          );

        if (minQualityScore !== undefined) {
          filteredInsights.topPerformers = insights.topPerformers.filter(
            tp => tp.qualityScore >= minQualityScore
          );


        reply.code(200).send({
          success: true,
          insights: filteredInsights,
          message: 'Marketplace quality insights generated successfully'
        });
 catch (error) {
        console.error('Marketplace insights generation failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Insights generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get quality trends for a template
   */
  fastify.get<QualityTrendsRequest>(
    '/content-quality/templates/:templateId/trends',
    {
      schema: {
        tags: ['Content Quality'],
        summary: 'Get quality trends for a template',
        params: {
          type: 'object',
          required: ['templateId'],
          properties: {
            templateId: { type: 'string' }


        querystring: {
          type: 'object',
          properties: {
            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_90D

            granularity: { 
              type: 'string',
              enum: ['daily', 'weekly', 'monthly'],
              default: 'weekly',
              description: 'Data point granularity'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              trends: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<QualityTrendsRequest>, reply: FastifyReply) => {
      try {
        const { templateId } = request.params;
        const { timeRange = TimeRange.LAST_90D, granularity = 'weekly' } = request.query;

        console.log(`📈 Generating quality trends for template: ${templateId}`);

        // Get current quality metrics to extract trends
        const currentMetrics = await contentQualityService.assessContentQuality(
          templateId,
          timeRange
        );

        reply.code(200).send({
          success: true,
          trends: currentMetrics.trends,
          message: 'Quality trends retrieved successfully'
        });
 catch (error) {
        console.error('Quality trends retrieval failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Trends retrieval failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get quality benchmarks for a template
   */
  fastify.post<QualityBenchmarkRequest>(
    '/content-quality/templates/:templateId/benchmarks',
    {
      schema: {
        tags: ['Content Quality'],
        summary: 'Get quality benchmarks for a template',
        params: {
          type: 'object',
          required: ['templateId'],
          properties: {
            templateId: { type: 'string' }


        body: {
          type: 'object',
          properties: {
            compareWith: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Specific template IDs to compare with'

            benchmarkType: { 
              type: 'string',
              enum: ['category', 'marketplace', 'custom'],
              default: 'category',
              description: 'Type of benchmark comparison'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              benchmarks: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<QualityBenchmarkRequest>, reply: FastifyReply) => {
      try {
        const { templateId } = request.params;
        const { compareWith, benchmarkType = 'category' } = request.body;

        console.log(`📊 Generating quality benchmarks for template: ${templateId}`);

        // Get current quality metrics to extract benchmarks
        const currentMetrics = await contentQualityService.assessContentQuality(templateId);

        // Enhance benchmarks with custom comparisons if provided
        const enhancedBenchmarks = currentMetrics.benchmarks;
        if (compareWith && compareWith.length > 0) {
          // Would implement custom comparison logic here
          console.log(`Comparing with ${compareWith.length} specific templates`);


        reply.code(200).send({
          success: true,
          benchmarks: enhancedBenchmarks,
          message: `Quality benchmarks generated using ${benchmarkType} comparison`
        });
 catch (error) {
        console.error('Quality benchmarks generation failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Benchmarks generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get quality improvement recommendations
   */
  fastify.get<QualityRecommendationsRequest>(
    '/content-quality/templates/:templateId/recommendations',
    {
      schema: {
        tags: ['Content Quality'],
        summary: 'Get quality improvement recommendations for a template',
        params: {
          type: 'object',
          required: ['templateId'],
          properties: {
            templateId: { type: 'string' }


        querystring: {
          type: 'object',
          properties: {
            priority: { 
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low'],
              description: 'Filter by recommendation priority'

            category: { 
              type: 'string',
              enum: ['effectiveness', 'usability', 'engagement', 'reliability', 'maintainability', 'marketFit'],
              description: 'Filter by quality dimension'

            implementationLevel: { 
              type: 'string',
              enum: ['quick', 'moderate', 'complex'],
              description: 'Filter by implementation complexity'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              recommendations: { type: 'array' },
              prioritizedActions: { type: 'array' },
              estimatedImpact: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<QualityRecommendationsRequest>, reply: FastifyReply) => {
      try {
        const { templateId } = request.params;
        const { priority, category, implementationLevel } = request.query;

        console.log(`💡 Generating quality recommendations for template: ${templateId}`);

        // Get current quality metrics to extract recommendations
        const currentMetrics = await contentQualityService.assessContentQuality(templateId);

        // Filter recommendations based on query parameters
        let filteredRecommendations = currentMetrics.recommendations;
        
        if (priority) {
          filteredRecommendations = filteredRecommendations.filter(
            rec => rec.priority === priority
          );

        
        if (category) {
          filteredRecommendations = filteredRecommendations.filter(
            rec => rec.category === category
          );

        
        if (implementationLevel) {
          filteredRecommendations = filteredRecommendations.filter(
            rec => rec.implementation.complexity === implementationLevel
          );


        // Generate prioritized action plan
        const prioritizedActions = filteredRecommendations
          .sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];

          .slice(0, 10); // Top 10 actions

        // Calculate estimated cumulative impact
        const estimatedImpact = {
          totalQualityImprovement: prioritizedActions.reduce(
            (sum, rec) => sum + rec.impact.projectedImprovement, 0
          ),
          implementationEffort: this.calculateTotalEffort(prioritizedActions),
          estimatedTimeframe: this.calculateTimeframe(prioritizedActions),
          expectedROI: this.calculateExpectedROI(prioritizedActions)
        };

        reply.code(200).send({
          success: true,
          recommendations: filteredRecommendations,
          prioritizedActions,
          estimatedImpact,
          message: `Generated ${filteredRecommendations.length} quality recommendations`
        });
 catch (error) {
        console.error('Quality recommendations generation failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Recommendations generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get quality metrics summary for multiple templates
   */
  fastify.post(
    '/content-quality/templates/bulk-summary',
    {
      schema: {
        tags: ['Content Quality'],
        summary: 'Get quality metrics summary for multiple templates',
        body: {
          type: 'object',
          required: ['templateIds'],
          properties: {
            templateIds: { 
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 50,
              description: 'Template IDs to get quality summary for'

            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_30D

            includeDetails: { 
              type: 'boolean', 
              default: false,
              description: 'Include detailed metrics for each template'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              summaries: { type: 'array' },
              aggregateMetrics: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { templateIds, timeRange = TimeRange.LAST_30D, includeDetails = false } = request.body as any;

        console.log(`📋 Generating bulk quality summary for ${templateIds.length} templates`);

        const summaries = await Promise.all(
          templateIds.map(async (templateId: string) => {
            try {
              const metrics = await contentQualityService.assessContentQuality(templateId, timeRange);
              return {
                templateId,
                qualityScore: metrics.overallQualityScore,
                qualityGrade: metrics.qualityGrade,
                qualityStatus: metrics.qualityStatus,
                ...(includeDetails && { fullMetrics: metrics })
              };
 catch (error) {
              return {
                templateId,
                qualityScore: null,
                error: error instanceof Error ? error.message : 'Assessment failed'
              };

  }
        );

        // Calculate aggregate metrics
        const validSummaries = summaries.filter(s => s.qualityScore !== null);
        const aggregateMetrics = {
          totalTemplates: templateIds.length,
          assessedTemplates: validSummaries.length,
          averageQualityScore: validSummaries.length > 0 
            ? Math.round(validSummaries.reduce((sum, s) => sum + s.qualityScore!, 0) / validSummaries.length)
            : 0,
          qualityDistribution: this.calculateQualityDistribution(validSummaries),
          topPerformer: validSummaries.reduce((best, current) => 
            (current.qualityScore! > (best?.qualityScore || 0)) ? current : best, null)
        };

        reply.code(200).send({
          success: true,
          summaries,
          aggregateMetrics,
          message: `Quality summary generated for ${validSummaries.length}/${templateIds.length} templates`
        });
 catch (error) {
        console.error('Bulk quality summary generation failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Bulk summary generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  // Helper methods for calculations
  function calculateTotalEffort(recommendations: any[]): string {
    const effortCounts = recommendations.reduce((counts, rec) => {
      counts[rec.implementation.effort] = (counts[rec.implementation.effort] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    if (effortCounts.high > effortCounts.medium && effortCounts.high > effortCounts.low) {
      return 'high';
 else if (effortCounts.medium > effortCounts.low) {
      return 'medium';

    return 'low';


  function calculateTimeframe(recommendations: any[]): string {
    // Would implement proper timeframe calculation logic
    return '2-6 months';


  function calculateExpectedROI(recommendations: any[]): number {
    return recommendations.reduce((sum, rec) => {
      const roi = rec.roi?.expectedReturn || 0;
      return sum + roi;
    }, 0);


  function calculateQualityDistribution(summaries: any[]): Record<string, number> {
    return summaries.reduce((dist, summary) => {
      const status = summary.qualityStatus || 'unknown';
      dist[status] = (dist[status] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

