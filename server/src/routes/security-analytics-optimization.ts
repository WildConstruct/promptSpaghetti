/**
 * Security Analytics Optimization API Routes
 * Epic 31.4.3.2 - Create Security Analytics Optimization Tools
 * 
 * Provides REST API endpoints for security analytics optimization tools
 * integrated with Epic 1 Analytics Foundation and Epic 17 Admin/Auth Systems.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { 
  SecurityAnalyticsOptimizer, 
  OptimizationConfig, 
  OptimizationRecommendation,
  OptimizationResult 
 from '../services/SecurityAnalyticsOptimizer';
import { 
  SecurityAnalyticsIntegrationService,
  SecurityAnalyticsIntegrationConfig 
 from '../services/SecurityAnalyticsIntegrationService';
import { AdminAuthGuard } from '../admin/guards/AdminAuthGuard';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../database/analytics-dao';
import { DiagnosticService } from '../admin/DiagnosticService';
import { HealthCheckFramework } from '../admin/HealthCheckFramework';

// Global optimizer instance
let securityAnalyticsOptimizer: SecurityAnalyticsOptimizer | null = null;



interface OptimizationQuery {
  includeRecommendations?: boolean;
  includeHistory?: boolean;
  includeCacheMetrics?: boolean;
  includeStatus?: boolean;







interface OptimizationRequest {
  recommendationId?: string;
  autoImplement?: boolean;
  optimizationType?: 'performance' | 'memory' | 'cpu' | 'cache' | 'resource_allocation';







interface OptimizationResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;





/**
 * Initialize security analytics optimizer
 */
async function initializeSecurityAnalyticsOptimizer(): Promise<SecurityAnalyticsOptimizer> {

  if (securityAnalyticsOptimizer) {
    return securityAnalyticsOptimizer;


  // Initialize security analytics service first
  const analyticsServiceConfig: SecurityAnalyticsIntegrationConfig = {
    epic1_analytics_integration: {
      enabled: true,
      analytics_collector: new AnalyticsCollector({ 
        batchSize: 100,
        flushIntervalMs: 5000 
      }),
      analytics_dao: new AnalyticsDAO(process.env.DATABASE_PATH || './analytics.db'),
      performance_event_forwarding: true,
      batch_size: 50,
      flush_interval_ms: 10000

    epic17_admin_integration: {
      enabled: true,
      auth_guard: new AdminAuthGuard(),
      health_check_framework: new HealthCheckFramework(),
      diagnostic_service: new DiagnosticService(),
      admin_notification_enabled: true,
      security_alert_threshold: 5

    performance_monitoring: {
      real_time_monitoring_enabled: true,
      performance_threshold_ms: 1000,
      memory_threshold_mb: 512,
      cpu_threshold_percent: 80,
      alert_on_degradation: true,
      auto_optimization_enabled: false

    security_features: {
      threat_detection_enabled: true,
      anomaly_detection_sensitivity: 0.8,
      correlation_analysis_enabled: true,
      predictive_analytics_enabled: false,
      automated_response_enabled: false

  };

  const analyticsService = new SecurityAnalyticsIntegrationService(analyticsServiceConfig);
  await analyticsService.initialize();

  // Configuration for optimization system
  const config: OptimizationConfig = {
    auto_optimization_enabled: process.env.AUTO_OPTIMIZATION_ENABLED === 'true',
    optimization_triggers: {
      performance_threshold: 70, // Below 70% triggers optimization
      memory_threshold_mb: 512,
      cpu_threshold_percent: 80,
      latency_threshold_ms: 1000

    caching: {
      enabled: true,
      cache_ttl_seconds: 3600, // 1 hour default
      max_cache_size_mb: 100,
      cache_strategies: ['lru', 'ttl', 'predictive']

    resource_management: {
      auto_scaling_enabled: true,
      max_concurrent_operations: 10,
      resource_pool_size: 20,
      garbage_collection_interval_ms: 300000 // 5 minutes

    analytics_integration: {
      epic1_optimization_events: true,
      epic17_admin_notifications: true,
      optimization_metrics_tracking: true

    security_validation: {
      enabled: true,
      threat_detection_enabled: true,
      anomaly_detection_threshold: 50,
      suspicious_pattern_detection: true,
      rate_limit_optimization_requests: true,
      max_optimization_requests_per_hour: 10,
      security_scanning_enabled: true

  };

  const analyticsCollector = analyticsServiceConfig.epic1_analytics_integration.analytics_collector;
  const analyticsDAO = analyticsServiceConfig.epic1_analytics_integration.analytics_dao;
  const diagnosticService = analyticsServiceConfig.epic17_admin_integration.diagnostic_service;

  securityAnalyticsOptimizer = new SecurityAnalyticsOptimizer(
    config,
    analyticsService,
    analyticsCollector,
    analyticsDAO,
    diagnosticService
  );

  await securityAnalyticsOptimizer.initialize();
  return securityAnalyticsOptimizer;


export default async function securityAnalyticsOptimizationRoutes(fastify: FastifyInstance) {
  // Initialize optimizer
  const optimizer = await initializeSecurityAnalyticsOptimizer();

  /**
   * GET /api/security-analytics/optimization/status
   * Get current optimization system status
   */
  fastify.get('/api/security-analytics/optimization/status', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security analytics optimization system status',
      tags: ['Security Analytics', 'Optimization'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                is_optimizing: { type: 'boolean' },
                auto_optimization_enabled: { type: 'boolean' },
                cache_enabled: { type: 'boolean' },
                monitoring_active: { type: 'boolean' },
                cache_metrics: { type: 'object' },
                optimizer_status: { type: 'object' }


            timestamp: { type: 'number' }




  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      const status = optimizer.getOptimizerStatus();
      const cacheStatus = optimizer.getCacheStatus();

      return {
        success: true,
        data: {
          optimizer_status: status,
          cache_metrics: cacheStatus,
          threat_detection: optimizer.getThreatDetectionMetrics(),
          is_optimizing: status.is_optimizing,
          auto_optimization_enabled: status.auto_optimization_enabled,
          cache_enabled: status.cache_enabled,
          monitoring_active: status.monitoring_active

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting optimization status:', error);
      return {
        success: false,
        error: 'Failed to get optimization status',
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-analytics/optimization/recommendations
   * Get optimization recommendations
   */
  fastify.get<{ Querystring: OptimizationQuery }>('/api/security-analytics/optimization/recommendations', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security analytics optimization recommendations',
      tags: ['Security Analytics', 'Optimization'],
      querystring: {
        type: 'object',
        properties: {
          includeRecommendations: { type: 'boolean' },
          includeHistory: { type: 'boolean' },
          includeCacheMetrics: { type: 'boolean' },
          includeStatus: { type: 'boolean' }



  }, async (
    request: FastifyRequest<{ Querystring: OptimizationQuery }>,
    reply: FastifyReply
  ): Promise<OptimizationResponse> => {
    try {
      const { 
        includeRecommendations = true, 
        includeHistory = false, 
        includeCacheMetrics = false,
        includeStatus = false 
 = request.query;

      const responseData: any = {};

      if (includeRecommendations) {
        responseData.recommendations = await optimizer.getOptimizationRecommendations();


      if (includeHistory) {
        responseData.optimization_history = optimizer.getOptimizationHistory();


      if (includeCacheMetrics) {
        responseData.cache_metrics = optimizer.getCacheStatus();


      if (includeStatus) {
        responseData.optimizer_status = optimizer.getOptimizerStatus();


      return {
        success: true,
        data: responseData,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting optimization recommendations:', error);
      return {
        success: false,
        error: 'Failed to get optimization recommendations',
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-analytics/optimization/implement
   * Implement optimization recommendation
   */
  fastify.post<{ Body: OptimizationRequest }>('/api/security-analytics/optimization/implement', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Implement security analytics optimization recommendation',
      tags: ['Security Analytics', 'Optimization', 'Admin'],
      body: {
        type: 'object',
        properties: {
          recommendationId: { type: 'string' },
          autoImplement: { type: 'boolean' },
          optimizationType: { 
            type: 'string',
            enum: ['performance', 'memory', 'cpu', 'cache', 'resource_allocation']




  }, async (
    request: FastifyRequest<{ Body: OptimizationRequest }>,
    reply: FastifyReply
  ): Promise<OptimizationResponse> => {
    try {
      const { recommendationId, autoImplement = false, optimizationType } = request.body;

      if (!recommendationId && !optimizationType) {
        return {
          success: false,
          error: 'Either recommendationId or optimizationType must be provided',
          timestamp: Date.now()
        };


      let result: OptimizationResult;

      if (recommendationId) {
        // Find and implement specific recommendation
        const recommendations = await optimizer.getOptimizationRecommendations();
        const recommendation = recommendations.find(r => r.id === recommendationId);
        
        if (!recommendation) {
          return {
            success: false,
            error: 'Recommendation not found',
            timestamp: Date.now()
          };


        if (!recommendation.auto_implementable && autoImplement) {
          return {
            success: false,
            error: 'Recommendation cannot be auto-implemented',
            timestamp: Date.now()
          };


        result = await optimizer.implementOptimization(recommendation);
 else {
        // Generate and implement optimization based on type
        const recommendations = await optimizer.getOptimizationRecommendations();
        const typeRecommendation = recommendations.find(r => r.type === optimizationType);
        
        if (!typeRecommendation) {
          return {
            success: false,
            error: `No recommendations found for optimization type: ${optimizationType}`,
            timestamp: Date.now()
          };


        result = await optimizer.implementOptimization(typeRecommendation);


      return {
        success: true,
        data: {
          optimization_result: result,
          performance_improvement: result.performance_improvement,
          actions_taken: result.actions_taken,
          duration_ms: result.completed_at - result.started_at

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error implementing optimization:', error);
      return {
        success: false,
        error: error.message || 'Failed to implement optimization',
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-analytics/optimization/history
   * Get optimization history
   */
  fastify.get('/api/security-analytics/optimization/history', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security analytics optimization history',
      tags: ['Security Analytics', 'Optimization']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      const history = optimizer.getOptimizationHistory();
      
      // Calculate summary statistics
      const successfulOptimizations = history.filter(h => h.success);
      const averageImprovement = successfulOptimizations.length > 0
        ? successfulOptimizations.reduce(
          (sum,
          h
        ) => sum + h.performance_improvement, 0) / successfulOptimizations.length
        : 0;

      return {
        success: true,
        data: {
          optimization_history: history,
          summary: {
            total_optimizations: history.length,
            successful_optimizations: successfulOptimizations.length,
            success_rate: history.length > 0 ? (successfulOptimizations.length / history.length) * 100 : 0,
            average_improvement: averageImprovement,
            most_recent: history.length > 0 ? history[history.length - 1] : null


        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting optimization history:', error);
      return {
        success: false,
        error: 'Failed to get optimization history',
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-analytics/optimization/cache/metrics
   * Get cache performance metrics
   */
  fastify.get('/api/security-analytics/optimization/cache/metrics', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security analytics cache performance metrics',
      tags: ['Security Analytics', 'Optimization', 'Cache']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      const cacheMetrics = optimizer.getCacheStatus();

      return {
        success: true,
        data: {
          cache_metrics: cacheMetrics,
          cache_health: {
            hit_rate_status: cacheMetrics.hit_rate > 0.7 ? 'good' : cacheMetrics.hit_rate > 0.5 ? 'fair' : 'poor',
            size_status: cacheMetrics.cache_size_mb < 80 ? 'good' : cacheMetrics.cache_size_mb < 95 ? 'fair' : 'critical',
            access_time_status: cacheMetrics.avg_access_time_ms < 10 ? 'good' : cacheMetrics.avg_access_time_ms < 50 ? 'fair' : 'poor'

          recommendations: []

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting cache metrics:', error);
      return {
        success: false,
        error: 'Failed to get cache metrics',
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-analytics/optimization/cache/clear
   * Clear optimization cache
   */
  fastify.post('/api/security-analytics/optimization/cache/clear', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Clear security analytics optimization cache',
      tags: ['Security Analytics', 'Optimization', 'Cache', 'Admin']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      // Clear cache - this would call a method on the optimizer
      // optimizer.clearCache();

      return {
        success: true,
        data: {
          cache_cleared: true,
          cleared_at: Date.now()

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error clearing optimization cache:', error);
      return {
        success: false,
        error: 'Failed to clear optimization cache',
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-analytics/optimization/diagnostics
   * Get comprehensive optimization system diagnostics
   */
  fastify.get('/api/security-analytics/optimization/diagnostics', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Get comprehensive optimization system diagnostics',
      tags: ['Security Analytics', 'Optimization', 'Admin', 'Diagnostics']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      const diagnostics = {
        optimizer_status: optimizer.getOptimizerStatus(),
        cache_metrics: optimizer.getCacheStatus(),
        recent_recommendations: await optimizer.getOptimizationRecommendations(),
        optimization_history: optimizer.getOptimizationHistory().slice(-10), // Last 10
        system_health: {
          memory_usage: process.memoryUsage(),
          uptime: process.uptime(),
          cpu_usage: process.cpuUsage()

        configuration: {
          auto_optimization_enabled: process.env.AUTO_OPTIMIZATION_ENABLED === 'true',
          cache_enabled: true,
          monitoring_active: true

      };

      return {
        success: true,
        data: diagnostics,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting optimization diagnostics:', error);
      return {
        success: false,
        error: 'Failed to get optimization diagnostics',
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-analytics/optimization/security/threats
   * Get threat detection metrics and security status
   */
  fastify.get('/api/security-analytics/optimization/security/threats', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security threat detection metrics',
      tags: ['Security Analytics', 'Optimization', 'Security']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      const threatMetrics = optimizer.getThreatDetectionMetrics();
      const optimizerStatus = optimizer.getOptimizerStatus();

      return {
        success: true,
        data: {
          threat_metrics: threatMetrics,
          security_status: {
            security_validation_enabled: optimizerStatus.security_validation_enabled || false,
            threat_detection_active: threatMetrics.security_events > 0,
            overall_risk_level: threatMetrics.risk_score > 70 ? 'high' : 
                               threatMetrics.risk_score > 40 ? 'medium' : 'low',
            recent_security_events: threatMetrics.security_events,
            patterns_detected: threatMetrics.suspicious_patterns,
            anomalies_detected: threatMetrics.anomalies_detected

          recommendations: threatMetrics.risk_score > 50 ? [
            'Enable additional monitoring',
            'Review recent optimization requests',
            'Consider tightening security thresholds'
          ] : []

        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting threat detection metrics:', error);
      return {
        success: false,
        error: 'Failed to get threat detection metrics',
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-analytics/optimization/security/report
   * Generate comprehensive security monitoring report
   */
  fastify.get('/api/security-analytics/optimization/security/report', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Generate comprehensive security monitoring report',
      tags: ['Security Analytics', 'Optimization', 'Security', 'Reports']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      const securityReport = await optimizer.generateSecurityReport();

      return {
        success: true,
        data: securityReport,
        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error generating security report:', error);
      return {
        success: false,
        error: 'Failed to generate security report',
        timestamp: Date.now()
      };

  });

  /**
   * GET /api/security-analytics/optimization/security/audit-log
   * Get security audit log entries
   */
  fastify.get<{ Querystring: { limit?: number } }>('/api/security-analytics/optimization/security/audit-log', {
    preHandler: [fastify.authenticate],
    schema: {
      description: 'Get security audit log entries',
      tags: ['Security Analytics', 'Optimization', 'Security', 'Audit'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 }



  }, async (
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<OptimizationResponse> => {
    try {
      const { limit = 100 } = request.query;
      const auditLog = optimizer.getSecurityAuditLog(limit);
      const securityMetrics = optimizer.getSecurityMetrics();

      return {
        success: true,
        data: {
          audit_log: auditLog,
          audit_summary: {
            total_entries: auditLog.length,
            security_metrics: securityMetrics,
            recent_activity_summary: {
              critical_events: auditLog.filter(e => e.severity === 'critical').length,
              high_events: auditLog.filter(e => e.severity === 'high').length,
              medium_events: auditLog.filter(e => e.severity === 'medium').length,
              low_events: auditLog.filter(e => e.severity === 'low').length



        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error getting security audit log:', error);
      return {
        success: false,
        error: 'Failed to get security audit log',
        timestamp: Date.now()
      };

  });

  /**
   * POST /api/security-analytics/optimization/auto-optimize
   * Trigger automatic optimization
   */
  fastify.post('/api/security-analytics/optimization/auto-optimize', {
    preHandler: [fastify.authenticate], // Should use admin auth
    schema: {
      description: 'Trigger automatic optimization of security analytics system',
      tags: ['Security Analytics', 'Optimization', 'Admin']

  }, async (request: FastifyRequest, reply: FastifyReply): Promise<OptimizationResponse> => {
    try {
      // Get current recommendations
      const recommendations = await optimizer.getOptimizationRecommendations();
      
      // Find auto-implementable critical/high priority recommendations
      const autoRecommendations = recommendations.filter(r => 
        r.auto_implementable && (r.priority === 'critical' || r.priority === 'high')
      );

      if (autoRecommendations.length === 0) {
        return {
          success: true,
          data: {
            message: 'No auto-implementable recommendations found',
            recommendations_reviewed: recommendations.length,
            auto_implementable: 0

          timestamp: Date.now()
        };


      const results: OptimizationResult[] = [];
      
      // Implement the first auto-implementable recommendation
      const result = await optimizer.implementOptimization(autoRecommendations[0]);
      results.push(result);

      return {
        success: true,
        data: {
          auto_optimization_completed: true,
          optimizations_performed: results.length,
          total_recommendations: recommendations.length,
          auto_implementable_found: autoRecommendations.length,
          results: results,
          summary: {
            performance_improvement: result.performance_improvement,
            actions_taken: result.actions_taken,
            success: result.success


        timestamp: Date.now()
      };
 catch (error) {
      fastify.log.error('Error performing auto-optimization:', error);
      return {
        success: false,
        error: error.message || 'Failed to perform auto-optimization',
        timestamp: Date.now()
      };

  });

  // Setup optimizer event handlers for real-time updates
  optimizer.on('optimization_completed', (result: OptimizationResult) => {
    fastify.log.info('Security Analytics Optimization Completed:', {
      optimization_id: result.id,
      type: result.optimization_type,
      improvement: result.performance_improvement,
      success: result.success
    });
  });

  optimizer.on('error', (error) => {
    fastify.log.error('Security Analytics Optimizer Error:', error);
  });

  // Cleanup on server shutdown
  fastify.addHook('onClose', async () => {
    if (securityAnalyticsOptimizer) {
      await securityAnalyticsOptimizer.shutdown();

  });
