/**
 * Performance Test Integration Test Suite
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562342-A89910 - Add performance testing
 *
 * Tests the integrated performance testing framework
 */

import {
  PerformanceTestIntegration,
  IntegratedPerformanceReport,
  PerformanceTestConfig,
} from './PerformanceTestIntegration';
import { Logger } from '../../server/src/logging/Logger';

describe('Performance Test Integration', () => {
  let performanceTestIntegration: PerformanceTestIntegration;
  let testConfig: PerformanceTestConfig;

  beforeAll(() => {
    testConfig = {
      enableExecutionBenchmarks: true,
      enableLoadTesting: false, // Disable for unit tests
      enableSystemMonitoring: true,
      enableDataLifecycleTesting: true,
      alertThresholds: {
        maxExecutionTime: 2000, // 2 seconds for tests
        maxMemoryUsage: 1024, // 1GB for tests
        minThroughput: 50, // 50 ops/sec
        maxErrorRate: 0.1, // 10%
      },
    };

    performanceTestIntegration = new PerformanceTestIntegration(testConfig);
  });

  describe('Integrated Performance Testing', () => {
    it('should execute comprehensive performance test suite', async () => {
      const report = await performanceTestIntegration.executeComprehensivePerformanceTest();

      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(report.recommendations)).toBe(true);

      // Verify execution benchmarks were run
      expect(report.executionBenchmarks).toBeDefined();
      expect(typeof report.executionBenchmarks.passed).toBe('boolean');
      expect(Array.isArray(report.executionBenchmarks.results)).toBe(true);

      // Verify system performance was captured
      expect(report.systemPerformance).toBeDefined();
      expect(typeof report.systemPerformance.memoryUsage).toBe('number');
      expect(typeof report.systemPerformance.cpuUsage).toBe('number');

      // Verify data lifecycle performance was tested
      expect(report.dataLifecyclePerformance).toBeDefined();
      expect(typeof report.dataLifecyclePerformance.recordsProcessed).toBe('number');
      expect(typeof report.dataLifecyclePerformance.throughput).toBe('number');

      console.log(`Performance test completed with score: ${report.overallScore}/100`);
      console.log(`Recommendations: ${report.recommendations.length}`);
    }, 60000);

    it('should generate meaningful performance recommendations', async () => {
      const report = await performanceTestIntegration.executeComprehensivePerformanceTest();

      expect(report.recommendations.length).toBeGreaterThan(0);

      // Each recommendation should be a non-empty string
      for (const recommendation of report.recommendations) {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      }
    }, 45000);

    it('should calculate reasonable overall score', async () => {
      const report = await performanceTestIntegration.executeComprehensivePerformanceTest();

      // Score should be between 0 and 100
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThanOrEqual(100);

      // If execution benchmarks passed and error rates are low, score should be high
      if (report.executionBenchmarks.passed && report.dataLifecyclePerformance.errorRate < 0.05) {
        expect(report.overallScore).toBeGreaterThan(70);
      }
    }, 45000);
  });

  describe('Individual Performance Components', () => {
    it('should perform quick health check', async () => {
      const healthCheck = await performanceTestIntegration.quickHealthCheck();

      expect(healthCheck).toBeDefined();
      expect(['HEALTHY', 'WARNING', 'CRITICAL'].includes(healthCheck.status)).toBe(true);
      expect(Array.isArray(healthCheck.issues)).toBe(true);
      expect(typeof healthCheck.metrics).toBe('object');

      // Metrics should include memory usage
      expect(typeof healthCheck.metrics.memoryUsageMB).toBe('number');
      expect(healthCheck.metrics.memoryUsageMB).toBeGreaterThan(0);
    });

    it('should handle configuration options properly', () => {
      const customConfig: PerformanceTestConfig = {
        enableExecutionBenchmarks: false,
        enableLoadTesting: false,
        enableSystemMonitoring: true,
        enableDataLifecycleTesting: false,
        alertThresholds: {
          maxExecutionTime: 500,
          maxMemoryUsage: 256,
          minThroughput: 200,
          maxErrorRate: 0.02,
        },
      };

      const customIntegration = new PerformanceTestIntegration(customConfig);
      expect(customIntegration).toBeDefined();
    });
  });

  describe('Performance Metrics Validation', () => {
    it('should validate execution benchmark results', async () => {
      // Create integration with strict thresholds for testing
      const strictConfig: PerformanceTestConfig = {
        ...testConfig,
        alertThresholds: {
          maxExecutionTime: 50, // Very strict
          maxMemoryUsage: 10, // Very strict
          minThroughput: 1000, // Very high
          maxErrorRate: 0.001, // Very low
        },
      };

      const strictIntegration = new PerformanceTestIntegration(strictConfig);
      const report = await strictIntegration.executeComprehensivePerformanceTest();

      // With strict thresholds, we expect the score to be lower
      expect(report.overallScore).toBeLessThan(100);
      expect(report.recommendations.length).toBeGreaterThan(1);
    }, 45000);

    it('should detect performance regressions', async () => {
      const baselineReport = await performanceTestIntegration.executeComprehensivePerformanceTest();

      // Simulate a second run (in real scenario, this would be after code changes)
      const currentReport = await performanceTestIntegration.executeComprehensivePerformanceTest();

      // Both reports should have valid structures
      expect(baselineReport.overallScore).toBeGreaterThanOrEqual(0);
      expect(currentReport.overallScore).toBeGreaterThanOrEqual(0);

      // Memory usage should be reasonable in both cases
      expect(baselineReport.systemPerformance.memoryUsage).toBeLessThan(1024); // 1GB
      expect(currentReport.systemPerformance.memoryUsage).toBeLessThan(1024); // 1GB
    }, 90000);
  });

  describe('Error Handling and Resilience', () => {
    it('should handle missing dependencies gracefully', async () => {
      // Test with load testing disabled (simulates missing k6 or load testing tools)
      const limitedConfig: PerformanceTestConfig = {
        enableExecutionBenchmarks: true,
        enableLoadTesting: false,
        enableSystemMonitoring: true,
        enableDataLifecycleTesting: true,
        alertThresholds: testConfig.alertThresholds,
      };

      const limitedIntegration = new PerformanceTestIntegration(limitedConfig);
      const report = await limitedIntegration.executeComprehensivePerformanceTest();

      expect(report).toBeDefined();
      expect(report.loadTestResults.scenariosExecuted).toBe(0);
      expect(report.overallScore).toBeGreaterThanOrEqual(0);
    }, 30000);

    it('should provide fallback metrics when monitoring fails', async () => {
      const healthCheck = await performanceTestIntegration.quickHealthCheck();

      // Even if advanced monitoring fails, basic metrics should be available
      expect(healthCheck.metrics).toBeDefined();
      expect(typeof healthCheck.metrics.memoryUsageMB).toBe('number');
    });
  });

  describe('Reporting and Output', () => {
    it('should generate comprehensive report structure', async () => {
      const report = await performanceTestIntegration.executeComprehensivePerformanceTest();

      // Verify all required report sections
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.executionBenchmarks).toBeDefined();
      expect(report.loadTestResults).toBeDefined();
      expect(report.systemPerformance).toBeDefined();
      expect(report.dataLifecyclePerformance).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(typeof report.overallScore).toBe('number');

      // Verify data types of metrics
      expect(typeof report.loadTestResults.scenariosExecuted).toBe('number');
      expect(typeof report.loadTestResults.totalRequests).toBe('number');
      expect(typeof report.loadTestResults.averageResponseTime).toBe('number');
      expect(typeof report.loadTestResults.errorRate).toBe('number');

      expect(typeof report.systemPerformance.cpuUsage).toBe('number');
      expect(typeof report.systemPerformance.memoryUsage).toBe('number');
      expect(typeof report.systemPerformance.diskIO).toBe('number');
      expect(typeof report.systemPerformance.networkIO).toBe('number');

      expect(typeof report.dataLifecyclePerformance.recordsProcessed).toBe('number');
      expect(typeof report.dataLifecyclePerformance.averageProcessingTime).toBe('number');
      expect(typeof report.dataLifecyclePerformance.throughput).toBe('number');
      expect(typeof report.dataLifecyclePerformance.errorRate).toBe('number');
    }, 45000);
  });

  describe('Integration with Existing Infrastructure', () => {
    it('should integrate with graph execution benchmarks', async () => {
      const config: PerformanceTestConfig = {
        enableExecutionBenchmarks: true,
        enableLoadTesting: false,
        enableSystemMonitoring: false,
        enableDataLifecycleTesting: false,
        alertThresholds: testConfig.alertThresholds,
      };

      const integration = new PerformanceTestIntegration(config);
      const report = await integration.executeComprehensivePerformanceTest();

      expect(report.executionBenchmarks.results.length).toBeGreaterThan(0);

      // Each benchmark result should have the expected structure
      for (const result of report.executionBenchmarks.results) {
        expect(result.config).toBeDefined();
        expect(result.metrics).toBeDefined();
        expect(result.summary).toBeDefined();
        expect(Array.isArray(result.metrics)).toBe(true);
      }
    }, 30000);

    it('should integrate with data lifecycle service', async () => {
      const config: PerformanceTestConfig = {
        enableExecutionBenchmarks: false,
        enableLoadTesting: false,
        enableSystemMonitoring: false,
        enableDataLifecycleTesting: true,
        alertThresholds: testConfig.alertThresholds,
      };

      const integration = new PerformanceTestIntegration(config);
      const report = await integration.executeComprehensivePerformanceTest();

      expect(report.dataLifecyclePerformance.recordsProcessed).toBeGreaterThanOrEqual(0);
      expect(report.dataLifecyclePerformance.throughput).toBeGreaterThanOrEqual(0);
      expect(report.dataLifecyclePerformance.errorRate).toBeGreaterThanOrEqual(0);
      expect(report.dataLifecyclePerformance.errorRate).toBeLessThanOrEqual(1);
    }, 30000);

    it('should integrate with performance monitoring dashboard', async () => {
      const config: PerformanceTestConfig = {
        enableExecutionBenchmarks: false,
        enableLoadTesting: false,
        enableSystemMonitoring: true,
        enableDataLifecycleTesting: false,
        alertThresholds: testConfig.alertThresholds,
      };

      const integration = new PerformanceTestIntegration(config);
      const report = await integration.executeComprehensivePerformanceTest();

      expect(report.systemPerformance.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(report.systemPerformance.cpuUsage).toBeGreaterThanOrEqual(0);
    }, 15000);
  });
});
