/**
 * Epic 20.1 - PerformanceOptimizer Unit Tests
 * 
 * Comprehensive unit tests for PerformanceOptimizer component covering:
 * - Automated optimization strategies
 * - Message batching and response caching
 * - Connection throttling and memory cleanup
 * - Conflict resolution optimization
 * - Performance strategy execution
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  PerformanceOptimizer,
  OptimizationStrategy,
  OptimizationMetrics,
  OptimizationResult,
  PerformanceThresholds
} from '../PerformanceOptimizer';

describe('Epic 20.1 - PerformanceOptimizer Unit Tests', () => {
  let optimizer: PerformanceOptimizer;
  let mockMetrics: OptimizationMetrics;
  let mockThresholds: PerformanceThresholds;

  beforeEach(() => {
    mockThresholds = {
      maxCpuUsage: 80,
      maxMemoryUsage: 85,
      maxMessageLatency: 100,
      maxConflictResolutionTime: 200,
      maxSynchronizationLatency: 150,
      minSuccessRate: 95,
      maxErrorRate: 5
    };

    mockMetrics = {
      timestamp: Date.now(),
      cpuUsage: 75,
      memoryUsage: 70,
      messageLatency: 85,
      messageRate: 150,
      connectionCount: 50,
      errorRate: 2,
      conflictResolutionTime: 120,
      synchronizationLatency: 90,
      operationSuccessRate: 97,
      networkThroughput: 1000,
      responseTime: 45
    };

    optimizer = new PerformanceOptimizer(mockThresholds);
  });

  afterEach(() => {
    optimizer.stop();
    jest.clearAllMocks();
  });

  describe('1. Optimization Strategy Selection', () => {
    it('should select appropriate strategies based on metrics', () => {
      const highCpuMetrics = { ...mockMetrics, cpuUsage: 85 };
      const strategies = optimizer.selectOptimizationStrategies(highCpuMetrics);

      expect(strategies).toBeDefined();
      expect(strategies.length).toBeGreaterThan(0);
      expect(strategies.some(s => s.type === OptimizationStrategy.REDUCE_CPU_LOAD)).toBe(true);
    });

    it('should prioritize strategies by impact and urgency', () => {
      const criticalMetrics = {
        ...mockMetrics,
        cpuUsage: 95,
        memoryUsage: 90,
        messageLatency: 150
      };

      const strategies = optimizer.selectOptimizationStrategies(criticalMetrics);
      const sortedStrategies = strategies.sort((a, b) => b.priority - a.priority);

      expect(sortedStrategies[0].priority).toBeGreaterThanOrEqual(sortedStrategies[1]?.priority || 0);
      expect(sortedStrategies[0].expectedImpact).toBeGreaterThan(0);
    });

    it('should avoid redundant strategies', () => {
      const strategies = optimizer.selectOptimizationStrategies(mockMetrics);
      const strategyTypes = strategies.map(s => s.type);
      const uniqueTypes = new Set(strategyTypes);

      expect(strategyTypes.length).toBe(uniqueTypes.size);
    });

    it('should return empty strategies for optimal performance', () => {
      const optimalMetrics = {
        ...mockMetrics,
        cpuUsage: 20,
        memoryUsage: 30,
        messageLatency: 25,
        errorRate: 0.1
      };

      const strategies = optimizer.selectOptimizationStrategies(optimalMetrics);
      expect(strategies.length).toBe(0);
    });
  });

  describe('2. Message Batching Optimization', () => {
    it('should enable message batching when message rate is high', async () => {
      const highTrafficMetrics = { ...mockMetrics, messageRate: 500 };
      
      const result = await optimizer.executeOptimization(
        OptimizationStrategy.ENABLE_MESSAGE_BATCHING,
        highTrafficMetrics
      );

      expect(result.success).toBe(true);
      expect(result.strategy).toBe(OptimizationStrategy.ENABLE_MESSAGE_BATCHING);
      expect(result.metricsImprovement).toBeDefined();
      expect(result.metricsImprovement.messageLatencyReduction).toBeGreaterThan(0);
    });

    it('should configure optimal batch sizes', () => {
      const batchConfig = optimizer.calculateOptimalBatchSize(mockMetrics);

      expect(batchConfig.batchSize).toBeGreaterThan(1);
      expect(batchConfig.batchSize).toBeLessThanOrEqual(100);
      expect(batchConfig.flushInterval).toBeGreaterThan(0);
      expect(batchConfig.maxWaitTime).toBeGreaterThan(batchConfig.flushInterval);
    });

    it('should adapt batch sizes based on network conditions', () => {
      const lowLatencyMetrics = { ...mockMetrics, messageLatency: 20 };
      const highLatencyMetrics = { ...mockMetrics, messageLatency: 150 };

      const lowLatencyBatch = optimizer.calculateOptimalBatchSize(lowLatencyMetrics);
      const highLatencyBatch = optimizer.calculateOptimalBatchSize(highLatencyMetrics);

      expect(highLatencyBatch.batchSize).toBeGreaterThan(lowLatencyBatch.batchSize);
      expect(highLatencyBatch.flushInterval).toBeGreaterThan(lowLatencyBatch.flushInterval);
    });

    it('should monitor batching effectiveness', async () => {
      const batchingResult = await optimizer.executeOptimization(
        OptimizationStrategy.ENABLE_MESSAGE_BATCHING,
        mockMetrics
      );

      expect(batchingResult.executionTime).toBeGreaterThan(0);
      expect(batchingResult.resourceUsage).toBeDefined();
      expect(batchingResult.metricsImprovement.throughputIncrease).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3. Response Caching Strategy', () => {
    it('should enable caching for repeated queries', async () => {
      const cacheMetrics = { ...mockMetrics, responseTime: 120 };
      
      const result = await optimizer.executeOptimization(
        OptimizationStrategy.ENABLE_RESPONSE_CACHING,
        cacheMetrics
      );

      expect(result.success).toBe(true);
      expect(result.metricsImprovement.responseTimeReduction).toBeGreaterThan(0);
    });

    it('should calculate optimal cache sizes', () => {
      const cacheConfig = optimizer.calculateOptimalCacheConfiguration(mockMetrics);

      expect(cacheConfig.maxCacheSize).toBeGreaterThan(0);
      expect(cacheConfig.ttlSeconds).toBeGreaterThan(0);
      expect(cacheConfig.maxEntrySize).toBeGreaterThan(0);
      expect(cacheConfig.compressionEnabled).toBeDefined();
    });

    it('should implement cache eviction policies', () => {
      const evictionPolicy = optimizer.selectCacheEvictionPolicy(mockMetrics);

      expect(['LRU', 'LFU', 'TTL'].includes(evictionPolicy.type)).toBe(true);
      expect(evictionPolicy.maxSize).toBeGreaterThan(0);
      expect(evictionPolicy.evictionThreshold).toBeGreaterThan(0);
      expect(evictionPolicy.evictionThreshold).toBeLessThanOrEqual(1);
    });

    it('should monitor cache hit rates', () => {
      optimizer.recordCacheMetrics({
        hits: 850,
        misses: 150,
        evictions: 25,
        memoryUsage: 1024 * 1024 * 50, // 50MB
        avgResponseTime: 15
      });

      const cacheStats = optimizer.getCacheStatistics();
      expect(cacheStats.hitRate).toBeCloseTo(0.85); // 850/(850+150)
      expect(cacheStats.effectiveness).toBeGreaterThan(0);
      expect(cacheStats.memoryEfficiency).toBeDefined();
    });
  });

  describe('4. Connection Throttling', () => {
    it('should throttle connections under high load', async () => {
      const highLoadMetrics = {
        ...mockMetrics,
        connectionCount: 200,
        cpuUsage: 88,
        memoryUsage: 85
      };

      const result = await optimizer.executeOptimization(
        OptimizationStrategy.THROTTLE_CONNECTIONS,
        highLoadMetrics
      );

      expect(result.success).toBe(true);
      expect(result.metricsImprovement.cpuUsageReduction).toBeGreaterThan(0);
    });

    it('should calculate optimal connection limits', () => {
      const connectionLimits = optimizer.calculateConnectionLimits(mockMetrics);

      expect(connectionLimits.maxConnections).toBeGreaterThan(0);
      expect(connectionLimits.connectionsPerSecond).toBeGreaterThan(0);
      expect(connectionLimits.maxConnectionsPerIP).toBeGreaterThan(0);
      expect(connectionLimits.queueSize).toBeGreaterThan(0);
    });

    it('should implement graceful connection degradation', () => {
      const degradationStrategy = optimizer.createConnectionDegradationStrategy(mockMetrics);

      expect(degradationStrategy.stages.length).toBeGreaterThan(1);
      expect(degradationStrategy.stages[0].threshold).toBeLessThan(degradationStrategy.stages[1].threshold);
      expect(degradationStrategy.stages.every(stage => 
        stage.actions.length > 0 && stage.threshold > 0
      )).toBe(true);
    });

    it('should prioritize connection types', () => {
      const connectionPriorities = optimizer.getConnectionPriorities();

      expect(connectionPriorities.admin).toBeGreaterThan(connectionPriorities.user);
      expect(connectionPriorities.user).toBeGreaterThan(connectionPriorities.guest);
      expect(connectionPriorities.guest).toBeGreaterThan(0);
    });
  });

  describe('5. Memory Cleanup Optimization', () => {
    it('should trigger memory cleanup when usage is high', async () => {
      const highMemoryMetrics = { ...mockMetrics, memoryUsage: 90 };
      
      const result = await optimizer.executeOptimization(
        OptimizationStrategy.CLEANUP_MEMORY,
        highMemoryMetrics
      );

      expect(result.success).toBe(true);
      expect(result.metricsImprovement.memoryUsageReduction).toBeGreaterThan(0);
    });

    it('should identify memory cleanup opportunities', () => {
      const cleanupOpportunities = optimizer.identifyMemoryCleanupOpportunities(mockMetrics);

      expect(cleanupOpportunities.length).toBeGreaterThanOrEqual(0);
      cleanupOpportunities.forEach(opportunity => {
        expect(opportunity.type).toBeDefined();
        expect(opportunity.estimatedMemorySavings).toBeGreaterThan(0);
        expect(opportunity.priority).toBeGreaterThan(0);
        expect(opportunity.safetyRisk).toBeDefined();
      });
    });

    it('should perform garbage collection optimization', async () => {
      const gcResult = await optimizer.optimizeGarbageCollection(mockMetrics);

      expect(gcResult.executed).toBe(true);
      expect(gcResult.memoryBeforeGC).toBeGreaterThan(0);
      expect(gcResult.memoryAfterGC).toBeLessThanOrEqual(gcResult.memoryBeforeGC);
      expect(gcResult.gcDuration).toBeGreaterThan(0);
    });

    it('should clear expired cached data', async () => {
      optimizer.recordCacheMetrics({
        hits: 100,
        misses: 20,
        evictions: 5,
        memoryUsage: 1024 * 1024 * 100, // 100MB
        avgResponseTime: 25
      });

      const cleanupResult = await optimizer.cleanupExpiredCache();

      expect(cleanupResult.itemsRemoved).toBeGreaterThanOrEqual(0);
      expect(cleanupResult.memoryFreed).toBeGreaterThanOrEqual(0);
      expect(cleanupResult.executionTime).toBeGreaterThan(0);
    });
  });

  describe('6. Conflict Resolution Optimization', () => {
    it('should optimize conflict resolution when resolution time is high', async () => {
      const slowConflictMetrics = { ...mockMetrics, conflictResolutionTime: 250 };
      
      const result = await optimizer.executeOptimization(
        OptimizationStrategy.OPTIMIZE_CONFLICT_RESOLUTION,
        slowConflictMetrics
      );

      expect(result.success).toBe(true);
      expect(result.metricsImprovement.conflictResolutionTimeReduction).toBeGreaterThan(0);
    });

    it('should analyze conflict patterns', () => {
      const conflictData = [
        { type: 'concurrent_edit', frequency: 45, avgResolutionTime: 150 },
        { type: 'structure_change', frequency: 20, avgResolutionTime: 200 },
        { type: 'property_update', frequency: 85, avgResolutionTime: 50 }
      ];

      const analysis = optimizer.analyzeConflictPatterns(conflictData);

      expect(analysis.mostCommonConflict).toBe('property_update');
      expect(analysis.slowestResolutionType).toBe('structure_change');
      expect(analysis.optimizationRecommendations.length).toBeGreaterThan(0);
    });

    it('should implement conflict resolution algorithms', () => {
      const algorithms = optimizer.getConflictResolutionAlgorithms();

      expect(algorithms.length).toBeGreaterThan(0);
      algorithms.forEach(algorithm => {
        expect(algorithm.name).toBeDefined();
        expect(algorithm.complexity).toBeGreaterThan(0);
        expect(algorithm.applicableConflictTypes.length).toBeGreaterThan(0);
        expect(['deterministic', 'probabilistic', 'hybrid'].includes(algorithm.approach)).toBe(true);
      });
    });

    it('should measure conflict resolution performance', () => {
      const performanceData = {
        totalConflicts: 150,
        resolvedConflicts: 148,
        avgResolutionTime: 125,
        maxResolutionTime: 300,
        conflictsByType: {
          concurrent_edit: 80,
          structure_change: 25,
          property_update: 45
        }
      };

      const analysis = optimizer.analyzeConflictResolutionPerformance(performanceData);

      expect(analysis.resolutionRate).toBeCloseTo(0.9867); // 148/150
      expect(analysis.performanceScore).toBeGreaterThan(0);
      expect(analysis.performanceScore).toBeLessThanOrEqual(100);
      expect(analysis.bottlenecks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('7. Strategy Execution and Monitoring', () => {
    it('should execute optimization strategies sequentially', async () => {
      const strategies = [
        OptimizationStrategy.ENABLE_MESSAGE_BATCHING,
        OptimizationStrategy.ENABLE_RESPONSE_CACHING,
        OptimizationStrategy.CLEANUP_MEMORY
      ];

      const results = await optimizer.executeStrategies(strategies, mockMetrics);

      expect(results.length).toBe(strategies.length);
      results.forEach(result => {
        expect(result.success).toBeDefined();
        expect(result.executionTime).toBeGreaterThan(0);
        expect(result.strategy).toBeDefined();
      });
    });

    it('should rollback failed optimizations', async () => {
      const mockFailingStrategy = OptimizationStrategy.THROTTLE_CONNECTIONS;
      
      // Mock a failing optimization
            jest.spyOn(optimizer, 'executeOptimization').mockImplementationOnce(async () => ({
        success: false,
        strategy: mockFailingStrategy,
        executionTime: 100,
        error: 'Optimization failed',
        resourceUsage: { cpu: 0, memory: 0 },
        metricsImprovement: {}
      }));

      const result = await optimizer.executeOptimization(mockFailingStrategy, mockMetrics);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Should trigger rollback
      const rollbackResult = await optimizer.rollbackOptimization(mockFailingStrategy);
      expect(rollbackResult.success).toBe(true);
    });

    it('should monitor optimization effectiveness over time', () => {
      const optimizationHistory = [
        { timestamp: Date.now() - 3600000, strategy: OptimizationStrategy.ENABLE_MESSAGE_BATCHING, improvement: 15 },
        { timestamp: Date.now() - 1800000, strategy: OptimizationStrategy.ENABLE_RESPONSE_CACHING, improvement: 25 },
        { timestamp: Date.now() - 900000, strategy: OptimizationStrategy.CLEANUP_MEMORY, improvement: 10 }
      ];

      const effectiveness = optimizer.calculateOptimizationEffectiveness(optimizationHistory);

      expect(effectiveness.averageImprovement).toBeCloseTo(16.67); // (15+25+10)/3
      expect(effectiveness.mostEffectiveStrategy).toBe(OptimizationStrategy.ENABLE_RESPONSE_CACHING);
      expect(effectiveness.totalImpact).toBe(50);
      expect(effectiveness.trendDirection).toBeDefined();
    });

    it('should provide optimization recommendations', () => {
      const recommendations = optimizer.getOptimizationRecommendations(mockMetrics);

      expect(recommendations.length).toBeGreaterThanOrEqual(0);
      recommendations.forEach(rec => {
        expect(rec.strategy).toBeDefined();
        expect(rec.priority).toBeGreaterThan(0);
        expect(rec.estimatedImpact).toBeGreaterThanOrEqual(0);
        expect(rec.riskLevel).toBeDefined();
        expect(rec.description).toBeDefined();
      });
    });
  });

  describe('8. Performance Impact Analysis', () => {
    it('should measure optimization impact accurately', async () => {
      const beforeMetrics = mockMetrics;
      
      await optimizer.executeOptimization(
        OptimizationStrategy.ENABLE_MESSAGE_BATCHING,
        beforeMetrics
      );

      const afterMetrics = {
        ...mockMetrics,
        messageLatency: mockMetrics.messageLatency * 0.8, // 20% improvement
        networkThroughput: mockMetrics.networkThroughput * 1.2 // 20% increase
      };

      const impact = optimizer.calculateImpactAnalysis(beforeMetrics, afterMetrics);

      expect(impact.messageLatencyImprovement).toBeCloseTo(20);
      expect(impact.throughputImprovement).toBeCloseTo(20);
      expect(impact.overallPerformanceScore).toBeGreaterThan(0);
    });

    it('should detect performance regressions', () => {
      const baselineMetrics = mockMetrics;
      const regressedMetrics = {
        ...mockMetrics,
        messageLatency: mockMetrics.messageLatency * 1.5, // 50% worse
        errorRate: mockMetrics.errorRate * 2 // 100% worse
      };

      const regression = optimizer.detectPerformanceRegression(baselineMetrics, regressedMetrics);

      expect(regression.detected).toBe(true);
      expect(regression.severity).toBeGreaterThan(0);
      expect(regression.affectedMetrics.length).toBeGreaterThan(0);
      expect(regression.affectedMetrics.includes('messageLatency')).toBe(true);
    });

    it('should calculate ROI of optimizations', () => {
      const optimizationCost = {
        cpuOverhead: 5, // 5% CPU overhead
        memoryOverhead: 10, // 10MB memory overhead
        implementationTime: 2 // 2 hours
      };

      const performanceBenefit = {
        responseTimeImprovement: 30, // 30% faster
        throughputIncrease: 25, // 25% more throughput
        errorRateReduction: 50 // 50% fewer errors
      };

      const roi = optimizer.calculateOptimizationROI(optimizationCost, performanceBenefit);

      expect(roi.score).toBeGreaterThan(1); // ROI > 1 means beneficial
      expect(roi.paybackPeriodDays).toBeGreaterThan(0);
      expect(roi.netBenefit).toBeGreaterThan(0);
    });
  });

  describe('9. Error Handling and Edge Cases', () => {
    it('should handle optimization failures gracefully', async () => {
      const invalidMetrics = { ...mockMetrics, cpuUsage: -1 };

      const result = await optimizer.executeOptimization(
        OptimizationStrategy.REDUCE_CPU_LOAD,
        invalidMetrics
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should prevent conflicting optimizations', async () => {
      const conflictingStrategies = [
        OptimizationStrategy.ENABLE_MESSAGE_BATCHING,
        OptimizationStrategy.DISABLE_MESSAGE_BATCHING
      ];

      const conflicts = optimizer.detectStrategyConflicts(conflictingStrategies);
      expect(conflicts.length).toBeGreaterThan(0);

      const resolvedStrategies = optimizer.resolveStrategyConflicts(conflictingStrategies);
      expect(resolvedStrategies.length).toBeLessThan(conflictingStrategies.length);
    });

    it('should handle resource constraints', async () => {
      const constrainedMetrics = {
        ...mockMetrics,
        cpuUsage: 98,
        memoryUsage: 95
      };

      const safeStrategies = optimizer.selectSafeOptimizationStrategies(constrainedMetrics);
      
      // Should only select low-risk optimizations under resource constraints
      expect(safeStrategies.every(strategy => strategy.riskLevel <= 2)).toBe(true);
      expect(safeStrategies.length).toBeLessThanOrEqual(2);
    });

    it('should validate optimization prerequisites', () => {
      const prerequisites = optimizer.validateOptimizationPrerequisites(
        OptimizationStrategy.ENABLE_RESPONSE_CACHING,
        mockMetrics
      );

      expect(prerequisites.canExecute).toBeDefined();
      expect(prerequisites.missingRequirements).toBeDefined();
      expect(prerequisites.warnings).toBeDefined();
      
      if (!prerequisites.canExecute) {
        expect(prerequisites.missingRequirements.length).toBeGreaterThan(0);
      }
    });
  });
});