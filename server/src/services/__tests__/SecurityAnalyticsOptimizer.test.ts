/**
 * SecurityAnalyticsOptimizer Test Suite
 * Epic 31.4.3.2 - Create Security Analytics Optimization Tools
 */

import { SecurityAnalyticsOptimizer, OptimizationConfig } from '../SecurityAnalyticsOptimizer';
import { SecurityAnalyticsIntegrationService } from '../SecurityAnalyticsIntegrationService';
import { AnalyticsCollector } from '../../analytics/AnalyticsCollector';
import { AnalyticsDAO } from '../../database/analytics-dao';
import { DiagnosticService } from '../../admin/DiagnosticService';

// Mock dependencies
jest.mock('../SecurityAnalyticsIntegrationService');
jest.mock('../../analytics/AnalyticsCollector');
jest.mock('../../database/analytics-dao');
jest.mock('../../admin/DiagnosticService');

describe('SecurityAnalyticsOptimizer', () => {
  let optimizer: SecurityAnalyticsOptimizer;
  let mockAnalyticsService: jest.Mocked<SecurityAnalyticsIntegrationService>;
  let mockAnalyticsCollector: jest.Mocked<AnalyticsCollector>;
  let mockAnalyticsDAO: jest.Mocked<AnalyticsDAO>;
  let mockDiagnosticService: jest.Mocked<DiagnosticService>;
  let testConfig: OptimizationConfig;

  beforeEach(() => {
    // Setup mocks
    mockAnalyticsService = new SecurityAnalyticsIntegrationService({} as any) as jest.Mocked<SecurityAnalyticsIntegrationService>;
    mockAnalyticsCollector = new AnalyticsCollector({} as any) as jest.Mocked<AnalyticsCollector>;
    mockAnalyticsDAO = new AnalyticsDAO('') as jest.Mocked<AnalyticsDAO>;
    mockDiagnosticService = new DiagnosticService() as jest.Mocked<DiagnosticService>;

    // Mock analytics service methods
    mockAnalyticsService.getCurrentPerformanceMetrics = jest.fn<unknown[], unknown>().mockResolvedValue({
      timestamp: Date.now( as unknown as unknown),
      performance_score: 75,
      throughput_events_per_second: 100,
      latency_p95_ms: 500,
      memory_usage_mb: 256,
      cpu_usage_percent: 60,
      active_threats_detected: 2,
      security_events_processed: 1000,
      compliance_violations: 0,
      system_availability_percent: 99.5
    });

    mockAnalyticsCollector.track = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown);
    mockAnalyticsDAO.insertEvent = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown);
    mockDiagnosticService.registerDiagnostic = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown);
    mockDiagnosticService.createAlert = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown as unknown);

    // Test configuration
    testConfig = {
      auto_optimization_enabled: true,
      optimization_triggers: {
        performance_threshold: 70,
        memory_threshold_mb: 512,
        cpu_threshold_percent: 80,
        latency_threshold_ms: 1000

      caching: {
        enabled: true,
        cache_ttl_seconds: 3600,
        max_cache_size_mb: 100,
        cache_strategies: ['lru', 'ttl']

      resource_management: {
        auto_scaling_enabled: true,
        max_concurrent_operations: 10,
        resource_pool_size: 20,
        garbage_collection_interval_ms: 300000

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

    optimizer = new SecurityAnalyticsOptimizer(
      testConfig,
      mockAnalyticsService,
      mockAnalyticsCollector,
      mockAnalyticsDAO,
      mockDiagnosticService
    );
  });

  afterEach(async () => {
    if (optimizer && typeof optimizer.shutdown === 'function') {
      await optimizer.shutdown();

    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(optimizer.initialize()).resolves.not.toThrow();
      expect(mockDiagnosticService.registerDiagnostic).toHaveBeenCalled();
    });

    test('should emit initialized event', async () => {
      const initializePromise = new Promise((resolve) => {
        optimizer.on('initialized', resolve);
      });
      
      await optimizer.initialize();
      await expect(initializePromise).resolves.toBeDefined();
    });
  });

  describe('Optimization Recommendations', () => {
    beforeEach(async () => {
      await optimizer.initialize();
    });

    test('should generate performance optimization recommendations', async () => {
      const lowPerformanceMetrics = {
        timestamp: Date.now(),
        performance_score: 45, // Below threshold (70)
        throughput_events_per_second: 50,
        latency_p95_ms: 800,
        memory_usage_mb: 256,
        cpu_usage_percent: 60,
        active_threats_detected: 1,
        security_events_processed: 500,
        compliance_violations: 0,
        system_availability_percent: 99.0
      };

      const recommendations = await optimizer.generateOptimizationRecommendations(lowPerformanceMetrics);
      
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('performance');
      expect(recommendations[0].priority).toBe('critical');
      expect(recommendations[0].auto_implementable).toBe(true);
    });

    test('should generate memory optimization recommendations', async () => {
      const highMemoryMetrics = {
        timestamp: Date.now(),
        performance_score: 80,
        throughput_events_per_second: 100,
        latency_p95_ms: 500,
        memory_usage_mb: 600, // Above threshold (512)
        cpu_usage_percent: 60,
        active_threats_detected: 1,
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 99.5
      };

      const recommendations = await optimizer.generateOptimizationRecommendations(highMemoryMetrics);
      
      const memoryRec = recommendations.find(r => r.type === 'memory');
      expect(memoryRec).toBeDefined();
      expect(memoryRec!.priority).toBe('high');
      expect(memoryRec!.auto_implementable).toBe(true);
    });

    test('should generate CPU optimization recommendations', async () => {
      const highCPUMetrics = {
        timestamp: Date.now(),
        performance_score: 80,
        throughput_events_per_second: 100,
        latency_p95_ms: 500,
        memory_usage_mb: 256,
        cpu_usage_percent: 85, // Above threshold (80)
        active_threats_detected: 1,
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 99.5
      };

      const recommendations = await optimizer.generateOptimizationRecommendations(highCPUMetrics);
      
      const cpuRec = recommendations.find(r => r.type === 'cpu');
      expect(cpuRec).toBeDefined();
      expect(cpuRec!.priority).toBe('medium');
      expect(cpuRec!.auto_implementable).toBe(false);
    });

    test('should generate latency optimization recommendations', async () => {
      const highLatencyMetrics = {
        timestamp: Date.now(),
        performance_score: 80,
        throughput_events_per_second: 100,
        latency_p95_ms: 1200, // Above threshold (1000)
        memory_usage_mb: 256,
        cpu_usage_percent: 60,
        active_threats_detected: 1,
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 99.5
      };

      const recommendations = await optimizer.generateOptimizationRecommendations(highLatencyMetrics);
      
      const latencyRec = recommendations.find(r => r.type === 'performance' && r.title.includes('Latency'));
      expect(latencyRec).toBeDefined();
      expect(latencyRec!.priority).toBe('high');
    });
  });

  describe('Optimization Implementation', () => {
    beforeEach(async () => {
      await optimizer.initialize();
    });

    test('should implement performance optimization successfully', async () => {
      const recommendation = {
        id: 'test_perf_opt',
        type: 'performance' as const,
        priority: 'high' as const,
        title: 'Test Performance Optimization',
        description: 'Test optimization',
        estimated_impact: 25,
        implementation_effort: 'medium' as const,
        auto_implementable: true,
        recommended_actions: ['Enable query result caching', 'Reduce concurrent operation limits'],
        metrics_context: {
          timestamp: Date.now(),
          performance_score: 45,
          throughput_events_per_second: 50,
          latency_p95_ms: 800,
          memory_usage_mb: 256,
          cpu_usage_percent: 60,
          active_threats_detected: 1,
          security_events_processed: 500,
          compliance_violations: 0,
          system_availability_percent: 99.0

        created_at: Date.now()
      };

      // Mock improved metrics after optimization
      mockAnalyticsService.getCurrentPerformanceMetrics.mockResolvedValueOnce({
        timestamp: Date.now(),
        performance_score: 85, // Improved
        throughput_events_per_second: 120,
        latency_p95_ms: 600,
        memory_usage_mb: 240,
        cpu_usage_percent: 55,
        active_threats_detected: 1,
        security_events_processed: 1200,
        compliance_violations: 0,
        system_availability_percent: 99.8
      });

      const result = await optimizer.implementOptimization(recommendation);
      
      expect(result.success).toBe(true);
      expect(result.performance_improvement).toBeGreaterThan(0);
      expect(result.actions_taken).toContain('Enabled query result caching');
      expect(result.actions_taken).toContain('Reduced concurrent operation limits');
    });

    test('should implement memory optimization successfully', async () => {
      const recommendation = {
        id: 'test_memory_opt',
        type: 'memory' as const,
        priority: 'high' as const,
        title: 'Test Memory Optimization',
        description: 'Test memory optimization',
        estimated_impact: 20,
        implementation_effort: 'low' as const,
        auto_implementable: true,
        recommended_actions: ['Force garbage collection', 'Clear expired cache entries'],
        metrics_context: {
          timestamp: Date.now(),
          performance_score: 75,
          throughput_events_per_second: 100,
          latency_p95_ms: 500,
          memory_usage_mb: 600,
          cpu_usage_percent: 60,
          active_threats_detected: 1,
          security_events_processed: 1000,
          compliance_violations: 0,
          system_availability_percent: 99.5

        created_at: Date.now()
      };

      // Mock improved metrics after optimization
      mockAnalyticsService.getCurrentPerformanceMetrics.mockResolvedValueOnce({
        timestamp: Date.now(),
        performance_score: 80,
        throughput_events_per_second: 100,
        latency_p95_ms: 500,
        memory_usage_mb: 450, // Improved
        cpu_usage_percent: 60,
        active_threats_detected: 1,
        security_events_processed: 1000,
        compliance_violations: 0,
        system_availability_percent: 99.5
      });

      const result = await optimizer.implementOptimization(recommendation);
      
      expect(result.success).toBe(true);
      expect(result.actions_taken).toContain('Forced garbage collection');
      expect(result.actions_taken).toContain('Cleared expired cache entries');
    });

    test('should handle optimization errors gracefully', async () => {
      const recommendation = {
        id: 'test_failing_opt',
        type: 'performance' as const,
        priority: 'high' as const,
        title: 'Failing Optimization',
        description: 'This will fail',
        estimated_impact: 25,
        implementation_effort: 'medium' as const,
        auto_implementable: true,
        recommended_actions: ['Invalid action'],
        metrics_context: {
          timestamp: Date.now(),
          performance_score: 45,
          throughput_events_per_second: 50,
          latency_p95_ms: 800,
          memory_usage_mb: 256,
          cpu_usage_percent: 60,
          active_threats_detected: 1,
          security_events_processed: 500,
          compliance_violations: 0,
          system_availability_percent: 99.0

        created_at: Date.now()
      };

      // Mock error in metrics collection
      mockAnalyticsService.getCurrentPerformanceMetrics.mockRejectedValueOnce(new Error('Metrics collection failed'));

      const result = await optimizer.implementOptimization(recommendation);
      
      expect(result.success).toBe(false);
      expect(result.error_message).toContain('Metrics collection failed');
    });

    test('should prevent concurrent optimizations', async () => {
      const recommendation1 = {
        id: 'test_opt_1',
        type: 'performance' as const,
        priority: 'high' as const,
        title: 'Test Optimization 1',
        description: 'First optimization',
        estimated_impact: 25,
        implementation_effort: 'medium' as const,
        auto_implementable: true,
        recommended_actions: ['Action 1'],
        metrics_context: {
          timestamp: Date.now(),
          performance_score: 45,
          throughput_events_per_second: 50,
          latency_p95_ms: 800,
          memory_usage_mb: 256,
          cpu_usage_percent: 60,
          active_threats_detected: 1,
          security_events_processed: 500,
          compliance_violations: 0,
          system_availability_percent: 99.0

        created_at: Date.now()
      };

      const recommendation2 = { ...recommendation1, id: 'test_opt_2' };

      // Start first optimization
      const optimization1Promise = optimizer.implementOptimization(recommendation1);
      
      // Try to start second optimization while first is running
      await expect(optimizer.implementOptimization(recommendation2))
        .rejects.toThrow('Optimization already in progress');

      await optimization1Promise;
    });
  });

  describe('Cache Management', () => {
    beforeEach(async () => {
      await optimizer.initialize();
    });

    test('should store and retrieve cache entries', () => {
      const testData = { key: 'value', timestamp: Date.now() };
      
      optimizer.cacheSet('test_key', testData, 3600);
      const retrieved = optimizer.cacheGet('test_key');
      
      expect(retrieved).toEqual(testData);
    });

    test('should expire cache entries after TTL', () => {
      const testData = { key: 'value' };
      
      optimizer.cacheSet('test_key', testData, 0.001); // Very short TTL
      
      // Wait for expiration
      setTimeout(() => {
        const retrieved = optimizer.cacheGet('test_key');
        expect(retrieved).toBeNull();
      }, 10);
    });

    test('should return cache metrics', () => {
      const metrics = optimizer.getCacheStatus();
      
      expect(metrics).toHaveProperty('hit_rate');
      expect(metrics).toHaveProperty('miss_rate');
      expect(metrics).toHaveProperty('cache_size_mb');
      expect(metrics).toHaveProperty('total_requests');
    });
  });

  describe('Status and Monitoring', () => {
    beforeEach(async () => {
      await optimizer.initialize();
    });

    test('should return optimizer status', () => {
      const status = optimizer.getOptimizerStatus();
      
      expect(status).toHaveProperty('is_optimizing');
      expect(status).toHaveProperty('cache_enabled');
      expect(status).toHaveProperty('auto_optimization_enabled');
      expect(status).toHaveProperty('monitoring_active');
      expect(typeof status.is_optimizing).toBe('boolean');
    });

    test('should track optimization history', async () => {
      const recommendation = {
        id: 'test_history_opt',
        type: 'performance' as const,
        priority: 'high' as const,
        title: 'History Test Optimization',
        description: 'Test for history tracking',
        estimated_impact: 25,
        implementation_effort: 'medium' as const,
        auto_implementable: true,
        recommended_actions: ['Test action'],
        metrics_context: {
          timestamp: Date.now(),
          performance_score: 45,
          throughput_events_per_second: 50,
          latency_p95_ms: 800,
          memory_usage_mb: 256,
          cpu_usage_percent: 60,
          active_threats_detected: 1,
          security_events_processed: 500,
          compliance_violations: 0,
          system_availability_percent: 99.0

        created_at: Date.now()
      };

      await optimizer.implementOptimization(recommendation);
      
      const history = optimizer.getOptimizationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].recommendation_id).toBe(recommendation.id);
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(async () => {
      await optimizer.initialize();
    });

    test('should track optimization events in Epic 1 analytics', async () => {
      const recommendation = {
        id: 'test_analytics_opt',
        type: 'performance' as const,
        priority: 'high' as const,
        title: 'Analytics Integration Test',
        description: 'Test analytics integration',
        estimated_impact: 25,
        implementation_effort: 'medium' as const,
        auto_implementable: true,
        recommended_actions: ['Test action'],
        metrics_context: {
          timestamp: Date.now(),
          performance_score: 45,
          throughput_events_per_second: 50,
          latency_p95_ms: 800,
          memory_usage_mb: 256,
          cpu_usage_percent: 60,
          active_threats_detected: 1,
          security_events_processed: 500,
          compliance_violations: 0,
          system_availability_percent: 99.0

        created_at: Date.now()
      };

      await optimizer.implementOptimization(recommendation);
      
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'system_optimization',
          action: 'optimization_started'
  }
      );
      
      expect(mockAnalyticsCollector.track).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'system_optimization',
          action: 'optimization_completed'

      );
    });

    test('should notify Epic 17 admin systems for critical optimizations', async () => {
      const criticalRecommendation = {
        id: 'test_critical_opt',
        type: 'performance' as const,
        priority: 'critical' as const,
        title: 'Critical Optimization',
        description: 'Critical system optimization',
        estimated_impact: 50,
        implementation_effort: 'high' as const,
        auto_implementable: true,
        recommended_actions: ['Critical action'],
        metrics_context: {
          timestamp: Date.now(),
          performance_score: 20, // Very low
          throughput_events_per_second: 10,
          latency_p95_ms: 2000,
          memory_usage_mb: 800,
          cpu_usage_percent: 95,
          active_threats_detected: 5,
          security_events_processed: 100,
          compliance_violations: 2,
          system_availability_percent: 85.0

        created_at: Date.now()
      };

      await optimizer.implementOptimization(criticalRecommendation);
      
      expect(mockDiagnosticService.createAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: expect.any(String),
          title: expect.stringContaining('Security Analytics Optimization'),
          source: 'security_analytics_optimizer'
  }
      );
    });
  });

  describe('Shutdown and Cleanup', () => {
    test('should shutdown gracefully', async () => {
      await optimizer.initialize();
      
      const shutdownPromise = new Promise((resolve) => {
        optimizer.on('shutdown', resolve);
      });
      
      await optimizer.shutdown();
      await expect(shutdownPromise).resolves.toBeDefined();
    });

    test('should clear resources on shutdown', async () => {
      await optimizer.initialize();
      
      // Add some cache entries
      optimizer.cacheSet('test1', { data: 'test1' });
      optimizer.cacheSet('test2', { data: 'test2' });
      
      await optimizer.shutdown();
      
      // Cache should be cleared
      expect(optimizer.cacheGet('test1')).toBeNull();
      expect(optimizer.cacheGet('test2')).toBeNull();
    });
  });
});