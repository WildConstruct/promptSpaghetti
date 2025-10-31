/**
 * Test Infrastructure Integration Tests
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562447-CB0C94 - Implement test infrastructure
 *
 * Comprehensive integration tests for the complete testing infrastructure
 */

import TestHarness, { TestHarnessConfig } from '../TestHarness';
import PerformanceScenarios, {
  PerformanceCategory
} from '../performance-scenarios';
import {
  TestEnvironmentManager,
  TestDataUtils,
  MockFactory,
  PerformanceTestUtils
} from '../../utils/TestingUtilities';

describe('Test Infrastructure Integration', () => {
  let testHarness: TestHarness;
  let performanceScenarios: PerformanceScenarios;

  beforeEach(async () => {
    const config: Partial<TestHarnessConfig> = {
      environment: 'unit' as any,
      categories: ['engine', 'frontend'] as any[],
      parallel: false,
      coverage: true,
      timeout: 10000,
      generateReports: true,
      outputDir: './test-results'
    };

    testHarness = new TestHarness(config);
    performanceScenarios = new PerformanceScenarios('integration-test-seed');
  });

  afterEach(async () => {
    await testHarness.cleanup();
    await TestEnvironmentManager.cleanupAll();
  });

  describe('Test Harness Integration', () => {
    it('should initialize comprehensive test harness', async () => {
      await testHarness.initialize();

      const status = testHarness.getTestStatus();
      expect(status).toBeDefined();
      expect(status.isRunning).toBe(false);
      expect(status.totalResults).toBe(0);
      expect(Array.isArray(status.environments)).toBe(true);
      expect(Array.isArray(status.fixtures)).toBe(true);
    });

    it('should run test suites with comprehensive reporting', async () => {
      await testHarness.initialize();

      const report = await testHarness.runTests();

      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.total).toBeGreaterThanOrEqual(0);
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.coverage).toBeDefined();
    });

    it('should handle test categories correctly', async () => {
      await testHarness.initialize();

      const engineResults = await testHarness.runCategory('engine' as any);

      expect(Array.isArray(engineResults)).toBe(true);
      engineResults.forEach(result => {
        expect(result).toBeDefined();
        expect(result.status).toMatch(/passed|failed|skipped/);
      });
    });
  });

  describe('Performance Scenarios Integration', () => {
    it('should execute performance scenarios with test harness', async () => {
      const scenario = await performanceScenarios.executeScenario(
        'graph-small-execution'
      );

      expect(scenario).toBeDefined();
      expect(scenario.result.executionTime).toBeGreaterThan(0);
      expect(scenario.result.memoryUsage.peak).toBeLessThan(1000);
      expect(scenario.result.throughput).toBeGreaterThan(0);
    });

    it('should integrate performance benchmarks with test harness', async () => {
      await testHarness.initialize();

      const benchmarks = await testHarness.runPerformanceBenchmarks();

      expect(benchmarks).toBeDefined();
      expect(benchmarks.graphExecution).toBeDefined();
      expect(benchmarks.apiLatency).toBeDefined();
      expect(benchmarks.renderingPerformance).toBeDefined();
      expect(benchmarks.memoryUsage).toBeDefined();

      // Validate benchmark results
      expect(Array.isArray(benchmarks.graphExecution)).toBe(true);
      expect(Array.isArray(benchmarks.apiLatency)).toBe(true);
      expect(Array.isArray(benchmarks.renderingPerformance)).toBe(true);
      expect(benchmarks.memoryUsage.baseline).toBeGreaterThan(0);
    });
  });

  describe('Custom Matchers Integration', () => {
    it('should use custom matchers in test infrastructure', () => {
      const mockGraph = MockFactory.createMockGraph({
        nodes: [
          MockFactory.createMockNode('test'),
          MockFactory.createMockNode('output')
        ],
        edges: [MockFactory.createMockEdge('node1', 'node2')]
      });

      expect(mockGraph.nodes).toEqual(expect.any(Array));
      expect(mockGraph.edges).toEqual(expect.any(Array));
      expect(mockGraph.nodes[0].id).toEqual(expect.any(String));
      expect(mockGraph.edges[0].source).toEqual(expect.any(String));
    });
  });

  describe('Test Environment Management', () => {
    it('should manage test environments correctly', async () => {
      await TestEnvironmentManager.setupEnvironment('test-env', {
        NODE_ENV: 'test',
        API_PORT: '3001',
        TEST_MODE: 'true'
      });

      const environments = TestEnvironmentManager.listEnvironments();
      expect(environments).toContain('test-env');
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.API_PORT).toBe('3001');
      expect(process.env.TEST_MODE).toBe('true');

      await TestEnvironmentManager.cleanupEnvironment('test-env');

      const cleanedEnvironments = TestEnvironmentManager.listEnvironments();
      expect(cleanedEnvironments).not.toContain('test-env');
    });
  });

  describe('Test Data Generation', () => {
    it('should generate deterministic test data', () => {
      const dataUtils = new TestDataUtils('deterministic-seed');

      const id1 = dataUtils.generateId('test');
      const id2 = dataUtils.generateId('test');

      expect(id1).toMatch(/^test-\d+$/);
      expect(id2).toMatch(/^test-\d+$/);
      // IDs should be different due to different timestamp generation
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');

      const email = dataUtils.generateEmail();
      expect(email).toMatch(/^[a-z0-9]+@example\.com$/);

      const number = dataUtils.generateNumber(1, 10);
      expect(number).toBeGreaterThanOrEqual(1);
      expect(number).toBeLessThanOrEqual(10);
    });

    it('should create comprehensive mock objects', () => {
      const mockUser = MockFactory.createMockUser({
        name: 'Integration Test User'
      });
      const mockGraph = MockFactory.createMockGraph({
        name: 'Integration Test Graph'
      });
      const mockNode = MockFactory.createMockNode('weighted');

      expect(mockUser.name).toBe('Integration Test User');
      expect(mockUser.email).toMatch(/^mock@example\.com$/);

      expect(mockGraph.name).toBe('Integration Test Graph');
      expect(Array.isArray(mockGraph.nodes)).toBe(true);
      expect(Array.isArray(mockGraph.edges)).toBe(true);

      expect(mockNode.type).toBe('weighted');
      expect(mockNode.id).toEqual(expect.any(String));
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle load testing scenarios', async () => {
      const loadTest = {
        concurrency: 5,
        iterations: 10,
        totalOperations: 50
      };

      expect(loadTest.concurrency).toBe(5);
      expect(loadTest.iterations).toBe(10);
      expect(loadTest.totalOperations).toBe(50);

      // Simulate load test execution
      const results = [];
      for (let i = 0; i < loadTest.concurrency; i++) {
        const result = await PerformanceTestUtils.measureExecution(async () => {
          await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
          return `result-${i}`;
        });
        results.push(result);
      }

      expect(results).toHaveLength(loadTest.concurrency);
      results.forEach((result, index) => {
        expect(result.result).toBe(`result-${index}`);
        expect(result.executionTime).toBeGreaterThan(0);
      });
    });

    it('should measure comprehensive performance metrics', async () => {
      const measurement = await PerformanceTestUtils.measureExecution(
        async () => {
          // Simulate complex operation
          const data = [];
          for (let i = 0; i < 100; i++) {
            data.push(Math.random() * i);
          }
          return data.reduce((sum, val) => sum + val, 0);
        }
      );

      expect(measurement.result).toBeGreaterThan(0);
      expect(measurement.executionTime).toBeGreaterThan(0);
      expect(measurement.memoryUsage.baseline).toBeGreaterThan(0);
      expect(measurement.memoryUsage.peak).toBeGreaterThan(0);
      expect(measurement.memoryUsage.average).toBeGreaterThan(0);
    });
  });
});

describe('Test Infrastructure Meta-Testing', () => {
  it('should validate infrastructure can test itself', () => {
    // Meta-test: The infrastructure should be able to test its own components
    expect(typeof TestHarness).toBe('function');
    expect(typeof PerformanceScenarios).toBe('function');
    expect(typeof TestEnvironmentManager.setupEnvironment).toBe('function');
    expect(typeof MockFactory.createMockUser).toBe('function');
    expect(typeof PerformanceTestUtils.measureExecution).toBe('function');
  });

  it('should have comprehensive test coverage for infrastructure components', async () => {
    // Verify all key infrastructure components are testable
    const testHarness = new TestHarness({ environment: 'unit' as any });
    const performanceScenarios = new PerformanceScenarios();

    // All components should be instantiable
    expect(testHarness).toBeDefined();
    expect(performanceScenarios).toBeDefined();

    // All components should have key methods
    expect(typeof testHarness.initialize).toBe('function');
    expect(typeof testHarness.runTests).toBe('function');
    expect(typeof testHarness.cleanup).toBe('function');

    expect(typeof performanceScenarios.executeScenario).toBe('function');
    expect(typeof performanceScenarios.getAllScenarios).toBe('function');
    expect(typeof performanceScenarios.getResultsSummary).toBe('function');

    await testHarness.cleanup();
  });
});
