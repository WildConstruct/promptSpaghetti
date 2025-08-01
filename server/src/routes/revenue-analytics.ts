/**
 * Revenue Analytics API Routes - Epic 17.5.6
 * 
 * RESTful API endpoints for advanced revenue analytics, forecasting,
 * attribution modeling, and optimization insights for the marketplace.
 * 
 * Task: E17-1753114397424-B51C48 - Implement revenue analytics
 * Epic: 17 - Backstage Admin Controls
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  RevenueAnalyticsService,
  RevenueAnalytics,
  RevenueOptimizationInsights,
  RevenueAttributionAnalysis 
 from '../marketplace/RevenueAnalyticsService';
import { AnalyticsService } from '../marketplace/analytics.service';
import { TimeRange } from '../marketplace/analytics.types';
import { Database } from '../database';

// Request type definitions



interface GenerateAnalyticsRequest {
  Querystring: {
    timeRange?: TimeRange;
    startDate?: string;
    endDate?: string;
    includeForecasting?: boolean;
    includeOptimization?: boolean;
    granularity?: 'daily' | 'weekly' | 'monthly';



  };




interface CreatorRevenueRequest {
  Params: {
    creatorId: string;



  };
  Querystring: {
    timeRange?: TimeRange;
    includeAttribution?: boolean;
    includeForecasting?: boolean;
  };




interface TemplateRevenueRequest {
  Params: {
    templateId: string;



  };
  Querystring: {
    timeRange?: TimeRange;
    compareWith?: string; // comma-separated template IDs
    includeOptimization?: boolean;
  };




interface RevenueComparisonRequest {
  Body: {
    templateIds: string[];
    creatorIds?: string[];
    timeRange?: TimeRange;
    comparisonType: 'templates' | 'creators' | 'categories';
    metrics?: string[]; // specific metrics to compare



  };




interface RevenueForecastRequest {
  Querystring: {
    horizon?: number; // days to forecast
    confidence?: number; // confidence level (0.8, 0.9, 0.95)
    includeSeasonality?: boolean;
    includeEvents?: boolean;



  };




interface RevenueOptimizationRequest {
  Params: {
    templateId?: string;
    creatorId?: string;



  };
  Querystring: {
    optimizationType?: 'pricing' | 'marketing' | 'content' | 'all';
    timeframe?: 'short' | 'medium' | 'long';
  };


export async function revenueAnalyticsRoutes(fastify: FastifyInstance) {
  // Initialize services (in production, these would be properly dependency-injected)
  const database = new Database();
  const analyticsService = new AnalyticsService(database);
  const revenueService = new RevenueAnalyticsService(
    database,
    analyticsService
  );

  /**
   * Generate comprehensive revenue analytics
   */
  fastify.get<GenerateAnalyticsRequest>(
    '/revenue-analytics/generate',
    {
      schema: {
        tags: ['Revenue Analytics'],
        summary: 'Generate comprehensive revenue analytics',
        querystring: {
          type: 'object',
          properties: {
            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_30D,
              description: 'Time range for revenue analysis'

            startDate: { 
              type: 'string',
              format: 'date',
              description: 'Custom start date (YYYY-MM-DD)'

            endDate: { 
              type: 'string',
              format: 'date',
              description: 'Custom end date (YYYY-MM-DD)'

            includeForecasting: { 
              type: 'boolean', 
              default: true,
              description: 'Include revenue forecasting analysis'

            includeOptimization: { 
              type: 'boolean', 
              default: true,
              description: 'Include revenue optimization insights'

            granularity: { 
              type: 'string',
              enum: ['daily', 'weekly', 'monthly'],
              default: 'weekly',
              description: 'Data granularity for analysis'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              analytics: { type: 'object' },
              analysisMetadata: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<GenerateAnalyticsRequest>, reply: FastifyReply) => {
      try {
        const { 
          timeRange = TimeRange.LAST_30D,
          startDate,
          endDate,
          includeForecasting = true,
          includeOptimization = true
 = request.query;

        console.log(`💰 Generating revenue analytics for timeRange: ${timeRange}`);
        const startTime = Date.now();

        const customStartDate = startDate ? new Date(startDate) : undefined;
        const customEndDate = endDate ? new Date(endDate) : undefined;

        const analytics = await revenueService.generateRevenueAnalytics(
          timeRange,
          customStartDate,
          customEndDate,
          includeForecasting,
          includeOptimization
        );

        const analysisTime = Date.now() - startTime;
        const analysisMetadata = {
          generationTime: analysisTime,
          dataPoints: analytics.breakdown.byTemplate.length,
          forecastingEnabled: includeForecasting,
          optimizationEnabled: includeOptimization,
          confidenceLevel: 85 // Example confidence level
        };

        reply.code(200).send({
          success: true,
          analytics,
          analysisMetadata,
          message: `Revenue analytics generated successfully (${analysisTime}ms)`
        });
 catch (error) {
        console.error('Revenue analytics generation failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Revenue analytics generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get revenue analytics for a specific creator
   */
  fastify.get<CreatorRevenueRequest>(
    '/revenue-analytics/creators/:creatorId',
    {
      schema: {
        tags: ['Revenue Analytics'],
        summary: 'Get revenue analytics for a specific creator',
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

            includeAttribution: { 
              type: 'boolean', 
              default: true,
              description: 'Include revenue attribution analysis'

            includeForecasting: { 
              type: 'boolean', 
              default: true,
              description: 'Include revenue forecasting'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              creatorAnalytics: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<CreatorRevenueRequest>, reply: FastifyReply) => {
      try {
        const { creatorId } = request.params;
        const { timeRange = TimeRange.LAST_30D } = request.query;

        console.log(`👤 Generating creator revenue analytics for: ${creatorId}`);

        const creatorAnalytics = await revenueService.getCreatorRevenueAnalytics(
          creatorId,
          timeRange
        );

        reply.code(200).send({
          success: true,
          creatorAnalytics,
          message: 'Creator revenue analytics generated successfully'
        });
 catch (error) {
        console.error('Creator revenue analytics failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Creator analytics generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get revenue analytics for a specific template
   */
  fastify.get<TemplateRevenueRequest>(
    '/revenue-analytics/templates/:templateId',
    {
      schema: {
        tags: ['Revenue Analytics'],
        summary: 'Get revenue analytics for a specific template',
        params: {
          type: 'object',
          required: ['templateId'],
          properties: {
            templateId: { type: 'string', description: 'Template ID' }


        querystring: {
          type: 'object',
          properties: {
            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_30D

            compareWith: { 
              type: 'string',
              description: 'Comma-separated template IDs to compare with'

            includeOptimization: { 
              type: 'boolean', 
              default: true,
              description: 'Include optimization recommendations'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              templateAnalytics: { type: 'object' },
              comparison: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<TemplateRevenueRequest>, reply: FastifyReply) => {
      try {
        const { templateId } = request.params;
        const { timeRange = TimeRange.LAST_30D, compareWith } = request.query;

        console.log(`📄 Generating template revenue analytics for: ${templateId}`);

        const templateAnalytics = await revenueService.getTemplateRevenueAnalytics(
          templateId,
          timeRange
        );

        let comparison = null;
        if (compareWith) {
          const compareTemplateIds = compareWith.split(',');
          comparison = await revenueService.compareTemplateRevenue(
            templateId,
            compareTemplateIds,
            timeRange
          );


        reply.code(200).send({
          success: true,
          templateAnalytics,
          comparison,
          message: 'Template revenue analytics generated successfully'
        });
 catch (error) {
        console.error('Template revenue analytics failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Template analytics generation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Generate revenue forecasting
   */
  fastify.get<RevenueForecastRequest>(
    '/revenue-analytics/forecast',
    {
      schema: {
        tags: ['Revenue Analytics'],
        summary: 'Generate revenue forecasting analysis',
        querystring: {
          type: 'object',
          properties: {
            horizon: { 
              type: 'number',
              minimum: 7,
              maximum: 365,
              default: 90,
              description: 'Number of days to forecast'

            confidence: { 
              type: 'number',
              minimum: 0.8,
              maximum: 0.99,
              default: 0.9,
              description: 'Confidence level for forecasting'

            includeSeasonality: { 
              type: 'boolean', 
              default: true,
              description: 'Include seasonal patterns in forecast'

            includeEvents: { 
              type: 'boolean', 
              default: true,
              description: 'Include known events in forecast'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              forecast: { type: 'object' },
              forecastMetadata: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<RevenueForecastRequest>, reply: FastifyReply) => {
      try {
        const { 
          horizon = 90,
          confidence = 0.9,
          includeSeasonality = true,
          includeEvents = true 
 = request.query;

        console.log(`🔮 Generating revenue forecast for ${horizon} days`);

        const forecast = await revenueService.generateRevenueForecast({
          horizon,
          confidence,
          includeSeasonality,
          includeEvents
        });

        const forecastMetadata = {
          horizonDays: horizon,
          confidenceLevel: confidence,
          seasonalityIncluded: includeSeasonality,
          eventsIncluded: includeEvents,
          forecastAccuracy: forecast.metadata?.accuracy || 'N/A',
          lastUpdated: new Date()
        };

        reply.code(200).send({
          success: true,
          forecast,
          forecastMetadata,
          message: `Revenue forecast generated for ${horizon} days with ${confidence * 100}% confidence`
        });
 catch (error) {
        console.error('Revenue forecasting failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Revenue forecasting failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get revenue optimization insights
   */
  fastify.get<RevenueOptimizationRequest>(
    '/revenue-analytics/optimization/:templateId?/:creatorId?',
    {
      schema: {
        tags: ['Revenue Analytics'],
        summary: 'Get revenue optimization insights',
        params: {
          type: 'object',
          properties: {
            templateId: { 
              type: 'string',
              description: 'Template ID for template-specific optimization'

            creatorId: { 
              type: 'string',
              description: 'Creator ID for creator-specific optimization'



        querystring: {
          type: 'object',
          properties: {
            optimizationType: { 
              type: 'string',
              enum: ['pricing', 'marketing', 'content', 'all'],
              default: 'all',
              description: 'Type of optimization insights'

            timeframe: { 
              type: 'string',
              enum: ['short', 'medium', 'long'],
              default: 'medium',
              description: 'Optimization timeframe'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              optimization: { type: 'object' },
              recommendations: { type: 'array' },
              projectedImpact: { type: 'object' },
              message: { type: 'string' }





    async (request: FastifyRequest<RevenueOptimizationRequest>, reply: FastifyReply) => {
      try {
        const { templateId, creatorId } = request.params;
        const { optimizationType = 'all', timeframe = 'medium' } = request.query;

        console.log('⚡ Generating revenue optimization insights');

        let optimization;
        if (templateId) {
          optimization = await revenueService.getTemplateOptimizationInsights(
            templateId,
            { type: optimizationType, timeframe }
          );
 else if (creatorId) {
          optimization = await revenueService.getCreatorOptimizationInsights(
            creatorId,
            { type: optimizationType, timeframe }
          );
 else {
          optimization = await revenueService.getMarketplaceOptimizationInsights(
            { type: optimizationType, timeframe }
          );


        reply.code(200).send({
          success: true,
          optimization: optimization.insights,
          recommendations: optimization.recommendations,
          projectedImpact: optimization.projectedImpact,
          message: 'Revenue optimization insights generated successfully'
        });
 catch (error) {
        console.error('Revenue optimization failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Revenue optimization failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Compare revenue performance across templates/creators
   */
  fastify.post<RevenueComparisonRequest>(
    '/revenue-analytics/compare',
    {
      schema: {
        tags: ['Revenue Analytics'],
        summary: 'Compare revenue performance across templates or creators',
        body: {
          type: 'object',
          required: ['comparisonType'],
          properties: {
            templateIds: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Template IDs to compare'

            creatorIds: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Creator IDs to compare'

            timeRange: { 
              type: 'string',
              enum: Object.values(TimeRange),
              default: TimeRange.LAST_30D

            comparisonType: { 
              type: 'string',
              enum: ['templates', 'creators', 'categories'],
              description: 'Type of comparison to perform'

            metrics: { 
              type: 'array',
              items: { type: 'string' },
              description: 'Specific metrics to compare'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              comparison: { type: 'object' },
              insights: { type: 'array' },
              message: { type: 'string' }





    async (request: FastifyRequest<RevenueComparisonRequest>, reply: FastifyReply) => {
      try {
        const { 
          templateIds = [],
          creatorIds = [],
          timeRange = TimeRange.LAST_30D,
          comparisonType,
          metrics
 = request.body;

        console.log(`📊 Performing ${comparisonType} revenue comparison`);

        let comparison;
        switch (comparisonType) {
        case 'templates':
          comparison = await revenueService.compareTemplatesRevenue(
            templateIds,
            timeRange,
            metrics
          );
          break;
        case 'creators':
          comparison = await revenueService.compareCreatorsRevenue(
            creatorIds,
            timeRange,
            metrics
          );
          break;
        case 'categories':
          comparison = await revenueService.compareCategoriesRevenue(
            timeRange,
            metrics
          );
          break;
        default:
          throw new Error(`Unsupported comparison type: ${comparisonType}`);


        // Generate insights based on comparison
        const insights = await revenueService.generateComparisonInsights(comparison);

        reply.code(200).send({
          success: true,
          comparison,
          insights,
          message: `${comparisonType} revenue comparison completed successfully`
        });
 catch (error) {
        console.error('Revenue comparison failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Revenue comparison failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );

  /**
   * Get real-time revenue metrics
   */
  fastify.get(
    '/revenue-analytics/realtime',
    {
      schema: {
        tags: ['Revenue Analytics'],
        summary: 'Get real-time revenue metrics',
        querystring: {
          type: 'object',
          properties: {
            window: { 
              type: 'string',
              enum: ['1h', '6h', '24h'],
              default: '24h',
              description: 'Time window for real-time metrics'



        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              realtimeMetrics: { type: 'object' },
              lastUpdated: { type: 'string' },
              message: { type: 'string' }





    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { window = '24h' } = request.query as any;

        console.log(`⚡ Getting real-time revenue metrics for window: ${window}`);

        const realtimeMetrics = await revenueService.getRealtimeRevenueMetrics(window);

        reply.code(200).send({
          success: true,
          realtimeMetrics,
          lastUpdated: new Date().toISOString(),
          message: `Real-time revenue metrics retrieved for ${window} window`
        });
 catch (error) {
        console.error('Real-time revenue metrics failed:', error);
        reply.code(500).send({
          success: false,
          error: 'Real-time metrics retrieval failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });

  );
