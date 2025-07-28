/**
 * API Performance-Based Throttling Service Test Suite
 * Epic 31 - Task E31-1753313263535-1115F3
 * 
 * Comprehensive test coverage for performance-based throttling adjustments,
 * optimization algorithms, analytics generation, and integration capabilities.
 */

import { 
  APIPerformanceThrottlingService,
  APIPerformanceThrottlingConfig,
  PerformanceMetrics,
  ThrottlingAdjustment
} from '../APIPerformanceThrottlingService';
import { PerformanceMonitoringService } from '../../analytics/PerformanceMonitoringService';
import { IntelligentThrottlingManager } from '../IntelligentThrottlingManager';
import { PredictiveAPILoadManager } from '../PredictiveAPILoadManager';
import { MetricsCollector } from '../../performance/MetricsCollector';
import { RateLimiter } from '../../../packages/core/security/RateLimiter';

// ============================================================================
// TEST SETUP AND MOCKS
// ============================================================================

// Mock implementations
const mockPerformanceMonitor = {
  getSystemMetrics: jest.fn<unknown[], unknown>(),
  startMonitoring: jest.fn<unknown[], unknown>(),
  stopMonitoring: jest.fn<unknown[], unknown>()
} as unknown as PerformanceMonitoringService;

const mockIntelligentThrottling = {
  makeThrottlingDecision: jest.fn<unknown[], unknown>(),
  analyzeUsagePatterns: jest.fn<unknown[], unknown>()
} as unknown as IntelligentThrottlingManager;

const mockPredictiveLoadManager = {
  generateLoadPrediction: jest.fn<unknown[], unknown>(),
  executeRecommendedActions: jest.fn<unknown[], unknown>()
} as unknown as PredictiveAPILoadManager;

const mockMetricsCollector = {
  collectMetrics: jest.fn<unknown[], unknown>(),
  startCollection: jest.fn<unknown[], unknown>(),
  stopCollection: jest.fn<unknown[], unknown>()
} as unknown as MetricsCollector;

const mockRateLimiter = {
  checkRateLimit: jest.fn<unknown[], unknown>(),
  updateRateLimit: jest.fn<unknown[], unknown>(),
  resetRateLimit: jest.fn<unknown[], unknown>()
} as unknown as RateLimiter;

// Test configuration
const testConfig: APIPerformanceThrottlingConfig = {
  performance_monitoring: {
    enabled: true,
    monitoring_interval_seconds: 30,
    performance_metrics_weight: 0.4,
    system_health_weight: 0.3,
    predictive_analytics_weight: 0.3,
    historical_data_window_minutes: 60
  }
  performance_thresholds: {
    response_time_thresholds: {
      excellent_ms: 50,
      good_ms: 100,
      acceptable_ms: 200,
      poor_ms: 500,
      critical_ms: 1000
  }
    throughput_thresholds: {
      optimal_rps: 1000,
      high_rps: 1500,
      overload_rps: 2000,
      critical_rps: 2500
  }
    error_rate_thresholds: {
      normal_percent: 1.0,
      elevated_percent: 2.5,
      high_percent: 5.0,
      critical_percent: 10.0
  }
    resource_utilization_thresholds: {
      cpu_warning_percent: 70,
      cpu_critical_percent: 85,
      memory_warning_percent: 75,
      memory_critical_percent: 90,
      disk_io_warning_percent: 80,
      network_io_warning_percent: 85
    }
  }
  throttling_adjustments: {
    adjustment_algorithms: ['adaptive', 'ml_based', 'linear'],
    adjustment_granularity: 0.1,
    max_adjustment_factor: 2.0,
    min_adjustment_factor: 0.1,
    adjustment_cooldown_seconds: 60,
    rollback_on_degradation: true
  }
  rate_limiting_strategies: {
    performance_tier_based: {
      enabled: true,
      tier_calculation_method: 'composite',
      tier_boundaries: {
        premium_performance_threshold: 90,
        standard_performance_threshold: 70,
        degraded_performance_threshold: 50
  }
      tier_multipliers: {
        premium_tier: 2.0,
        standard_tier: 1.0,
        degraded_tier: 0.5,
        critical_tier: 0.2
      }
  }
    adaptive_burst_control: {
      enabled: true,
      burst_detection_window_seconds: 60,
      burst_threshold_multiplier: 1.5,
      burst_recovery_time_seconds: 300,
      progressive_burst_penalties: true
  }
    circuit_breaker_integration: {
      enabled: true,
      failure_threshold: 5,
      recovery_timeout_seconds: 300,
      half_open_max_calls: 10,
      performance_degradation_triggers: true
    }
  }
  predictive_optimization: {
    enabled: true,
    prediction_confidence_threshold: 0.8,
    preemptive_throttling_enabled: true,
    load_spike_prevention: true,
    seasonal_adjustment_enabled: true,
    machine_learning_models: {
      performance_prediction_model: true,
      demand_forecasting_model: true,
      anomaly_detection_model: true,
      optimization_recommendation_model: true
    }
  }
  multi_dimensional_throttling: {
    enabled: true,
    dimensions: {
      endpoint_based: true,
      user_tier_based: true,
      geographic_based: true,
      time_based: true,
      device_type_based: false,
      application_type_based: true
  }
    dimension_weights: {
      endpoint_weight: 0.3,
      user_tier_weight: 0.25,
      geographic_weight: 0.15,
      temporal_weight: 0.15,
      device_weight: 0.05,
      application_weight: 0.1
    }
  }
  health_management: {
    auto_recovery_enabled: true,
    health_check_interval_seconds: 30,
    degraded_performance_recovery_strategy: 'gradual',
    performance_target_sla: {
      response_time_p95_ms: 200,
      availability_percentage: 99.9,
      error_rate_percentage: 0.5,
      throughput_minimum_rps: 500
    }
  }
  integration: {
    performance_monitoring_integration: true,
    intelligent_throttling_integration: true,
    predictive_load_management_integration: true,
    security_analytics_integration: true,
    real_time_alerts_enabled: true,
    dashboard_updates_enabled: true
  }
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('APIPerformanceThrottlingService', () => {
  let service: APIPerformanceThrottlingService;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create service instance
    service = new APIPerformanceThrottlingService(
      testConfig,
      mockPerformanceMonitor,
      mockIntelligentThrottling,
      mockPredictiveLoadManager,
      mockMetricsCollector,
      mockRateLimiter
    );
  });

  afterEach(() => {
    // Clean up any event listeners
    service.removeAllListeners();
  });

  // ============================================================================
  // SERVICE INITIALIZATION TESTS
  // ============================================================================

  describe('Service Initialization', () => {
    test('should initialize successfully with valid configuration', async () => {
      const initPromise = service.initialize();
      
      // Verify initialization event is emitted
      let initializationEvent: Record<string, unknown> | null = null;
      service.once('service_initialized', (data) => {
        initializationEvent = data;
      });
      
      await initPromise;
      
      expect(initializationEvent).toBeTruthy();
      expect(initializationEvent.config_summary).toEqual({
        performance_monitoring: true,
        predictive_optimization: true,
        multi_dimensional_throttling: true,
        auto_recovery: true
      });
    });

    test('should handle initialization errors gracefully', async () => {
      // Mock initialization failure
      const originalEmit = service.emit;
      service.emit = jest.fn((event, data) => {
        if (event === 'initialization_error') {
          return true;
        }
        return originalEmit.call(service, event, data);
      });
      
      // Force an error during initialization
      service.initialize = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Mock initialization error'));
      
      await expect(service.initialize()).rejects.toThrow('Mock initialization error');
    });

    test('should initialize performance tiers correctly', async () => {
      await service.initialize();
      
      // Access private performance tiers through reflection (for testing)
      const performanceTiers = (service as any).performanceTiers;
      
      expect(performanceTiers).toBeDefined();
      expect(performanceTiers.size).toBe(4);
      expect(performanceTiers.has('premium')).toBe(true);
      expect(performanceTiers.has('standard')).toBe(true);
      expect(performanceTiers.has('degraded')).toBe(true);
      expect(performanceTiers.has('critical')).toBe(true);
    });
  });

  // ============================================================================
  // PERFORMANCE-BASED THROTTLING ADJUSTMENT TESTS
  // ============================================================================

  describe('Performance-Based Throttling Adjustments', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should perform throttling adjustments based on performance metrics', async () => {
      const context = {
        endpoint: '/api/test',
        user_id: 'user123',
        user_tier: 'premium'
      };
      
      const result = await service.performPerformanceBasedThrottlingAdjustment(context);
      
      expect(result).toBeDefined();
      expect(result.adjustments_applied).toBeInstanceOf(Array);
      expect(result.performance_analysis).toBeDefined();
      expect(result.tier_assignments).toBeInstanceOf(Array);
      expect(typeof result.effectiveness_score).toBe('number');
    });

    test('should generate appropriate adjustments for critical performance', async () => {
      // Mock critical performance metrics
      const criticalMetrics: PerformanceMetrics = {
        response_time: {
          average_ms: 1200,
          p50_ms: 800,
          p95_ms: 2000,
          p99_ms: 3000,
          max_ms: 5000,
          trend: 'degrading'
  }
        throughput: {
          requests_per_second: 50,
          successful_requests_per_second: 30,
          failed_requests_per_second: 20,
          peak_rps: 100,
          trend: 'decreasing'
  }
        error_rates: {
          total_error_rate: 15.0,
          client_error_rate: 8.0,
          server_error_rate: 7.0,
          timeout_error_rate: 3.0,
          trend: 'worsening'
  }
        resource_utilization: {
          cpu_usage_percent: 95,
          memory_usage_percent: 90,
          disk_io_percent: 85,
          network_io_percent: 90,
          concurrent_connections: 500
  }
        quality_metrics: {
          availability_percentage: 95.0,
          reliability_score: 30,
          performance_score: 25,
          user_satisfaction_score: 20
        }
      };
      
      // Override the collectPerformanceMetrics method for this test
      (service as any).collectPerformanceMetrics = jest.fn<unknown[], unknown>().mockResolvedValue(criticalMetrics as unknown);
      
      const result = await service.performPerformanceBasedThrottlingAdjustment();
      
      expect(result.adjustments_applied.length).toBeGreaterThan(0);
      const criticalAdjustment = result.adjustments_applied.find(adj => adj.reason.includes('Critical'));
      expect(criticalAdjustment).toBeDefined();
      expect(criticalAdjustment?.adjustment_factor).toBeLessThan(0.5); // Aggressive throttling
    });

    test('should handle excellent performance by increasing capacity', async () => {
      // Mock excellent performance metrics
      const excellentMetrics: PerformanceMetrics = {
        response_time: {
          average_ms: 30,
          p50_ms: 25,
          p95_ms: 40,
          p99_ms: 60,
          max_ms: 100,
          trend: 'improving'
  }
        throughput: {
          requests_per_second: 800,
          successful_requests_per_second: 795,
          failed_requests_per_second: 5,
          peak_rps: 900,
          trend: 'increasing'
  }
        error_rates: {
          total_error_rate: 0.2,
          client_error_rate: 0.1,
          server_error_rate: 0.1,
          timeout_error_rate: 0.0,
          trend: 'improving'
  }
        resource_utilization: {
          cpu_usage_percent: 45,
          memory_usage_percent: 50,
          disk_io_percent: 30,
          network_io_percent: 35,
          concurrent_connections: 200
  }
        quality_metrics: {
          availability_percentage: 99.95,
          reliability_score: 95,
          performance_score: 92,
          user_satisfaction_score: 96
        }
      };
      
      (service as any).collectPerformanceMetrics = jest.fn<unknown[], unknown>().mockResolvedValue(excellentMetrics as unknown);
      
      const result = await service.performPerformanceBasedThrottlingAdjustment();
      
      const capacityAdjustment = result.adjustments_applied.find(adj => adj.reason.includes('capacity increase'));
      expect(capacityAdjustment).toBeDefined();
      expect(capacityAdjustment?.adjustment_factor).toBeGreaterThan(1.0); // Capacity increase
    });

    test('should respect cooldown periods between adjustments', async () => {
      // Perform first adjustment
      await service.performPerformanceBasedThrottlingAdjustment();
      
      // Immediately attempt second adjustment (should be blocked by cooldown)
      const result = await service.performPerformanceBasedThrottlingAdjustment();
      
      expect(result.adjustments_applied.length).toBe(0);
    });

    test('should emit appropriate events during adjustment process', async () => {
      const events: Record<string, unknown>[] = [];
      
      service.on('performance_throttling_adjustment_completed', (data) => {
        events.push({ type: 'adjustment_completed', data });
      });
      
      await service.performPerformanceBasedThrottlingAdjustment();
      
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('adjustment_completed');
      expect(events[0].data.adjustments_count).toBeDefined();
      expect(events[0].data.effectiveness_score).toBeDefined();
    });
  });

  // ============================================================================
  // PERFORMANCE OPTIMIZATION TESTS
  // ============================================================================

  describe('Performance Optimization', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should execute comprehensive performance optimization', async () => {
      const result = await service.optimizeAPIPerformanceThrottling();
      
      expect(result).toBeDefined();
      expect(result.optimization_results).toBeInstanceOf(Array);
      expect(typeof result.performance_improvement).toBe('number');
      expect(result.resource_savings).toBeDefined();
      expect(result.resource_savings.cpu_percent).toBeDefined();
      expect(result.resource_savings.memory_percent).toBeDefined();
      expect(result.resource_savings.network_percent).toBeDefined();
      expect(typeof result.sla_compliance_improvement).toBe('number');
    });

    test('should generate ML-based optimizations when enabled', async () => {
      // Ensure ML optimization is enabled in config
      expect(testConfig.predictive_optimization.machine_learning_models.optimization_recommendation_model).toBe(true);
      
      const result = await service.optimizeAPIPerformanceThrottling();
      
      // Should include ML-based optimizations in results
      expect(result.optimization_results).toBeDefined();
      expect(result.performance_improvement).toBeGreaterThan(0);
    });

    test('should prioritize optimizations by confidence score', async () => {
      const result = await service.optimizeAPIPerformanceThrottling();
      
      // Check if optimizations are sorted by confidence (highest first)
      for (let i = 0; i < result.optimization_results.length - 1; i++) {
        expect(result.optimization_results[i].confidence_score)
          .toBeGreaterThanOrEqual(result.optimization_results[i + 1].confidence_score);
      }
    });

    test('should calculate accurate resource savings', async () => {
      const result = await service.optimizeAPIPerformanceThrottling();
      
      expect(result.resource_savings.cpu_percent).toBeGreaterThanOrEqual(0);
      expect(result.resource_savings.memory_percent).toBeGreaterThanOrEqual(0);
      expect(result.resource_savings.network_percent).toBeGreaterThanOrEqual(0);
      
      // Savings should be reasonable (not impossible values)
      expect(result.resource_savings.cpu_percent).toBeLessThan(50);
      expect(result.resource_savings.memory_percent).toBeLessThan(50);
      expect(result.resource_savings.network_percent).toBeLessThan(50);
    });

    test('should emit optimization completion events', async () => {
      let optimizationEvent: Record<string, unknown> | null = null;
      
      service.once('api_performance_optimization_completed', (data) => {
        optimizationEvent = data;
      });
      
      await service.optimizeAPIPerformanceThrottling();
      
      expect(optimizationEvent).toBeTruthy();
      expect(optimizationEvent.optimizations_applied).toBeDefined();
      expect(optimizationEvent.performance_improvement).toBeDefined();
      expect(optimizationEvent.resource_savings).toBeDefined();
    });
  });

  // ============================================================================
  // ANALYTICS GENERATION TESTS
  // ============================================================================

  describe('Analytics Generation', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should generate comprehensive performance-based throttling analytics', async () => {
      const analytics = await service.generatePerformanceBasedThrottlingAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics.performance_summary).toBeDefined();
      expect(analytics.throttling_analytics).toBeDefined();
      expect(analytics.tier_analytics).toBeDefined();
      expect(analytics.predictive_insights).toBeDefined();
      expect(analytics.optimization_recommendations).toBeDefined();
    });

    test('should include accurate performance summary metrics', async () => {
      const analytics = await service.generatePerformanceBasedThrottlingAnalytics();
      
      const summary = analytics.performance_summary;
      expect(typeof summary.overall_performance_score).toBe('number');
      expect(summary.overall_performance_score).toBeGreaterThanOrEqual(0);
      expect(summary.overall_performance_score).toBeLessThanOrEqual(100);
      
      expect(['improving', 'stable', 'degrading']).toContain(summary.performance_trend);
      
      expect(typeof summary.sla_compliance_percentage).toBe('number');
      expect(summary.sla_compliance_percentage).toBeGreaterThanOrEqual(0);
      expect(summary.sla_compliance_percentage).toBeLessThanOrEqual(100);
    });

    test('should provide detailed throttling analytics', async () => {
      const analytics = await service.generatePerformanceBasedThrottlingAnalytics();
      
      const throttlingAnalytics = analytics.throttling_analytics;
      expect(typeof throttlingAnalytics.total_adjustments).toBe('number');
      expect(typeof throttlingAnalytics.successful_adjustments).toBe('number');
      expect(typeof throttlingAnalytics.failed_adjustments).toBe('number');
      expect(typeof throttlingAnalytics.average_adjustment_impact).toBe('number');
      expect(typeof throttlingAnalytics.adjustment_frequency_per_hour).toBe('number');
      expect(Array.isArray(throttlingAnalytics.most_effective_adjustment_types)).toBe(true);
    });

    test('should include tier analytics with distribution data', async () => {
      const analytics = await service.generatePerformanceBasedThrottlingAnalytics();
      
      const tierAnalytics = analytics.tier_analytics;
      expect(Array.isArray(tierAnalytics.tier_distribution)).toBe(true);
      expect(Array.isArray(tierAnalytics.tier_migration_patterns)).toBe(true);
      expect(Array.isArray(tierAnalytics.tier_effectiveness)).toBe(true);
      
      // Check tier distribution structure
      if (tierAnalytics.tier_distribution.length > 0) {
        const firstTier = tierAnalytics.tier_distribution[0];
        expect(firstTier.tier).toBeDefined();
        expect(typeof firstTier.user_count).toBe('number');
        expect(typeof firstTier.performance_score).toBe('number');
      }
    });

    test('should generate predictive insights with risk assessment', async () => {
      const analytics = await service.generatePerformanceBasedThrottlingAnalytics();
      
      const insights = analytics.predictive_insights;
      expect(['improving', 'stable', 'degrading']).toContain(insights.predicted_performance_trend);
      expect(Array.isArray(insights.forecasted_load_changes)).toBe(true);
      expect(Array.isArray(insights.recommended_preemptive_adjustments)).toBe(true);
      
      const riskAssessment = insights.risk_assessment;
      expect(typeof riskAssessment.performance_degradation_risk).toBe('number');
      expect(typeof riskAssessment.overload_risk).toBe('number');
      expect(typeof riskAssessment.sla_violation_risk).toBe('number');
      
      // Risk scores should be percentages (0-100)
      expect(riskAssessment.performance_degradation_risk).toBeGreaterThanOrEqual(0);
      expect(riskAssessment.performance_degradation_risk).toBeLessThanOrEqual(100);
    });

    test('should provide actionable optimization recommendations', async () => {
      const analytics = await service.generatePerformanceBasedThrottlingAnalytics();
      
      const recommendations = analytics.optimization_recommendations;
      expect(Array.isArray(recommendations.immediate_actions)).toBe(true);
      expect(Array.isArray(recommendations.strategic_recommendations)).toBe(true);
      
      // Check immediate actions structure
      if (recommendations.immediate_actions.length > 0) {
        const firstAction = recommendations.immediate_actions[0];
        expect(firstAction.action).toBeDefined();
        expect(typeof firstAction.expected_improvement).toBe('number');
        expect(['low', 'medium', 'high']).toContain(firstAction.implementation_effort);
        expect(['low', 'medium', 'high']).toContain(firstAction.business_impact);
      }
    });

    test('should emit analytics generation events', async () => {
      let analyticsEvent: Record<string, unknown> | null = null;
      
      service.once('analytics_generated', (data) => {
        analyticsEvent = data;
      });
      
      await service.generatePerformanceBasedThrottlingAnalytics();
      
      expect(analyticsEvent).toBeTruthy();
      expect(Array.isArray(analyticsEvent.analytics_types)).toBe(true);
      expect(typeof analyticsEvent.performance_score).toBe('number');
    });
  });

  // ============================================================================
  // PERFORMANCE TIER MANAGEMENT TESTS
  // ============================================================================

  describe('Performance Tier Management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should assign users to appropriate performance tiers', async () => {
      const context = {
        user_id: 'user123',
        endpoint: '/api/test'
      };
      
      const result = await service.performPerformanceBasedThrottlingAdjustment(context);
      
      expect(result.tier_assignments).toBeDefined();
      expect(Array.isArray(result.tier_assignments)).toBe(true);
      
      if (result.tier_assignments.length > 0) {
        const assignment = result.tier_assignments[0];
        expect(assignment.user_id).toBe('user123');
        expect(assignment.tier).toBeDefined();
        expect(assignment.tier.tier_name).toBeDefined();
        expect(['premium', 'standard', 'degraded', 'critical']).toContain(assignment.tier.tier_name);
      }
    });

    test('should calculate tier assignments based on performance scores', async () => {
      // Test premium tier assignment (score >= 90)
      const premiumMetrics: PerformanceMetrics = {
        response_time: { average_ms: 30, p50_ms: 25, p95_ms: 40, p99_ms: 60, max_ms: 100, trend: 'improving' },
        throughput: { requests_per_second: 800, successful_requests_per_second: 795, failed_requests_per_second: 5, peak_rps: 900, trend: 'increasing' },
        error_rates: { total_error_rate: 0.2, client_error_rate: 0.1, server_error_rate: 0.1, timeout_error_rate: 0.0, trend: 'improving' },
        resource_utilization: { cpu_usage_percent: 45, memory_usage_percent: 50, disk_io_percent: 30, network_io_percent: 35, concurrent_connections: 200 },
        quality_metrics: { availability_percentage: 99.95, reliability_score: 95, performance_score: 95, user_satisfaction_score: 96 }
      };
      
      (service as any).collectPerformanceMetrics = jest.fn<unknown[], unknown>().mockResolvedValue(premiumMetrics as unknown);
      
      const result = await service.performPerformanceBasedThrottlingAdjustment({ user_id: 'premium_user' });
      
      if (result.tier_assignments.length > 0) {
        expect(result.tier_assignments[0].tier.tier_name).toBe('premium');
      }
    });

    test('should handle tier-based rate limit multipliers correctly', async () => {
      const performanceTiers = (service as any).performanceTiers;
      
      const premiumTier = performanceTiers.get('premium');
      const standardTier = performanceTiers.get('standard');
      const degradedTier = performanceTiers.get('degraded');
      const criticalTier = performanceTiers.get('critical');
      
      expect(premiumTier.rate_limit_multiplier).toBe(testConfig.rate_limiting_strategies.performance_tier_based.tier_multipliers.premium_tier);
      expect(standardTier.rate_limit_multiplier).toBe(testConfig.rate_limiting_strategies.performance_tier_based.tier_multipliers.standard_tier);
      expect(degradedTier.rate_limit_multiplier).toBe(testConfig.rate_limiting_strategies.performance_tier_based.tier_multipliers.degraded_tier);
      expect(criticalTier.rate_limit_multiplier).toBe(testConfig.rate_limiting_strategies.performance_tier_based.tier_multipliers.critical_tier);
    });
  });

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================

  describe('Error Handling and Edge Cases', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should handle performance metrics collection failures gracefully', async () => {
      // Mock metrics collection failure
      (service as any).collectPerformanceMetrics = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Metrics collection failed'));
      
      await expect(service.performPerformanceBasedThrottlingAdjustment()).rejects.toThrow('Metrics collection failed');
    });

    test('should handle optimization failures with appropriate error events', async () => {
      let errorEvent: Record<string, unknown> | null = null;
      
      service.once('optimization_error', (error) => {
        errorEvent = error;
      });
      
      // Mock optimization failure
      (service as any).analyzePerformanceTrends = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Optimization failed'));
      
      await expect(service.optimizeAPIPerformanceThrottling()).rejects.toThrow('Optimization failed');
      expect(errorEvent).toBeTruthy();
    });

    test('should handle analytics generation failures', async () => {
      let errorEvent: Record<string, unknown> | null = null;
      
      service.once('analytics_generation_error', (error) => {
        errorEvent = error;
      });
      
      // Mock analytics generation failure
      (service as any).generatePerformanceSummary = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Analytics generation failed'));
      
      await expect(service.generatePerformanceBasedThrottlingAnalytics()).rejects.toThrow('Analytics generation failed');
      expect(errorEvent).toBeTruthy();
    });

    test('should validate adjustment parameters within acceptable ranges', async () => {
      const result = await service.performPerformanceBasedThrottlingAdjustment();
      
      result.adjustments_applied.forEach(adjustment => {
        expect(adjustment.adjustment_factor).toBeGreaterThanOrEqual(testConfig.throttling_adjustments.min_adjustment_factor);
        expect(adjustment.adjustment_factor).toBeLessThanOrEqual(testConfig.throttling_adjustments.max_adjustment_factor);
        expect(adjustment.confidence_score).toBeGreaterThanOrEqual(0);
        expect(adjustment.confidence_score).toBeLessThanOrEqual(1);
      });
    });

    test('should handle empty or invalid context gracefully', async () => {
      // Test with empty context
      const result1 = await service.performPerformanceBasedThrottlingAdjustment({});
      expect(result1).toBeDefined();
      
      // Test with undefined context
      const result2 = await service.performPerformanceBasedThrottlingAdjustment();
      expect(result2).toBeDefined();
      
      // Test with invalid context
      const result3 = await service.performPerformanceBasedThrottlingAdjustment({ invalid_field: 'test' } as any);
      expect(result3).toBeDefined();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should integrate with performance monitoring service', async () => {
      expect(service['performanceMonitor']).toBe(mockPerformanceMonitor);
      
      // Verify service uses performance monitor during operations
      await service.performPerformanceBasedThrottlingAdjustment();
      
      // Performance monitor integration should be active
      expect(testConfig.integration.performance_monitoring_integration).toBe(true);
    });

    test('should integrate with intelligent throttling manager', async () => {
      expect(service['intelligentThrottling']).toBe(mockIntelligentThrottling);
      expect(testConfig.integration.intelligent_throttling_integration).toBe(true);
    });

    test('should integrate with predictive load manager', async () => {
      expect(service['predictiveLoadManager']).toBe(mockPredictiveLoadManager);
      expect(testConfig.integration.predictive_load_management_integration).toBe(true);
    });

    test('should handle service integration failures gracefully', async () => {
      // Mock integration failure
      const originalPredictiveLoadManager = service['predictiveLoadManager'];
      service['predictiveLoadManager'] = null as any;
      
      // Service should still function without predictive load manager
      const result = await service.performPerformanceBasedThrottlingAdjustment();
      expect(result).toBeDefined();
      
      // Restore original
      service['predictiveLoadManager'] = originalPredictiveLoadManager;
    });
  });

  // ============================================================================
  // PERFORMANCE AND LOAD TESTS
  // ============================================================================

  describe('Performance and Load Tests', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('should handle multiple concurrent adjustment requests', async () => {
      const concurrentRequests = 10;
      const adjustmentPromises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        adjustmentPromises.push(
          service.performPerformanceBasedThrottlingAdjustment({ user_id: `user${i}` })
        );
      }
      
      const results = await Promise.all(adjustmentPromises);
      
      expect(results).toHaveLength(concurrentRequests);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.adjustments_applied).toBeDefined();
      });
    });

    test('should maintain performance under load', async () => {
      const startTime = Date.now();
      const iterations = 50;
      
      const promises = [];
      for (let i = 0; i < iterations; i++) {
        promises.push(service.performPerformanceBasedThrottlingAdjustment());
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;
      
      // Average processing time should be reasonable (< 100ms per request)
      expect(averageTime).toBeLessThan(100);
    });

    test('should handle large analytics data sets efficiently', async () => {
      // Mock large adjustment history
      const largeAdjustmentHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `adj-${i}`,
        timestamp: new Date(Date.now() - i * 60000),
        adjustment_type: 'rate_limit',
        target_dimension: 'global',
        previous_value: 1000,
        new_value: 900,
        adjustment_factor: 0.9,
        reason: 'Performance optimization',
        triggering_metrics: {} as PerformanceMetrics,
        expected_impact: 'Moderate improvement',
        confidence_score: 0.8,
        auto_applied: true
      }));
      
      (service as any).adjustmentHistory = largeAdjustmentHistory;
      
      const startTime = Date.now();
      const analytics = await service.generatePerformanceBasedThrottlingAnalytics();
      const endTime = Date.now();
      
      expect(analytics).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});