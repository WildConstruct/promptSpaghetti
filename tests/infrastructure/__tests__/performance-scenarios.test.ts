/**
 * Test Suite for Performance Scenarios
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562467-BDB384 - Create performance scenarios
 *
 * Comprehensive tests for the performance scenarios system
 */

import PerformanceScenarios, {
  PerformanceCategory,
  PerformanceScenario,
  PerformanceResult
} from '../performance-scenarios';

describe('Performance Scenarios System', () => {
  let performanceScenarios: PerformanceScenarios;

  beforeEach(() => {
    performanceScenarios = new PerformanceScenarios('test-seed-123');
  });

  describe('Initialization', () => {
    it('should initialize with all scenario categories', () => {
      const allScenarios = performanceScenarios.getAllScenarios();

      expect(allScenarios.length).toBeGreaterThan(0);

      // Check that all categories are represented
      const categories = new Set(allScenarios.map(s => s.category));
      expect(categories).toContain(PerformanceCategory.GRAPH_EXECUTION);
      expect(categories).toContain(PerformanceCategory.FRONTEND_RENDERING);
      expect(categories).toContain(PerformanceCategory.API_PERFORMANCE);
      expect(categories).toContain(PerformanceCategory.MEMORY_USAGE);
      expect(categories).toContain(PerformanceCategory.USER_WORKFLOW);
      expect(categories).toContain(PerformanceCategory.STRESS_TESTING);
      expect(categories).toContain(PerformanceCategory.SCALABILITY);
    });

    it('should have proper scenario structure', () => {
      const scenarios = performanceScenarios.getAllScenarios();

      scenarios.forEach(scenario => {
        expect(scenario.id).toBeDefined();
        expect(scenario.name).toBeDefined();
        expect(scenario.description).toBeDefined();
        expect(scenario.category).toBeDefined();
        expect(typeof scenario.setup).toBe('function');
        expect(typeof scenario.execute).toBe('function');
        expect(scenario.expectedThresholds).toBeDefined();
        expect(scenario.expectedThresholds.maxExecutionTime).toBeGreaterThan(0);
        expect(scenario.expectedThresholds.maxMemoryUsage).toBeGreaterThan(0);
      });
    });
  });

  describe('Graph Execution Scenarios', () => {
    it('should execute small graph performance scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'graph-small-execution'
      );

      expect(result.scenario).toBeDefined();
      expect(result.result).toBeDefined();
      expect(typeof result.passed).toBe('boolean');

      // Validate result structure
      expect(result.result.executionTime).toBeGreaterThan(0);
      expect(result.result.memoryUsage).toBeDefined();
      expect(result.result.throughput).toBeGreaterThan(0);
      expect(result.result.latency).toBeDefined();
      expect(result.result.resourceUsage).toBeDefined();
    });

    it('should execute medium graph performance scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'graph-medium-execution'
      );

      expect(result.scenario.category).toBe(
        PerformanceCategory.GRAPH_EXECUTION
      );
      expect(result.result.executionTime).toBeGreaterThan(0);
      expect(result.result.memoryUsage.peak).toBeGreaterThan(
        result.result.memoryUsage.baseline
      );
    });

    it('should execute large graph performance scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'graph-large-execution'
      );

      expect(result.scenario.category).toBe(
        PerformanceCategory.GRAPH_EXECUTION
      );
      expect(result.result.executionTime).toBeGreaterThan(0);
      // Large graphs should use more resources
      expect(result.result.memoryUsage.average).toBeGreaterThan(0);
      expect(result.result.resourceUsage.cpu).toBeGreaterThan(0);
    });

    it('should have increasing resource usage with graph size', async () => {
      const smallResult = await performanceScenarios.executeScenario(
        'graph-small-execution'
      );
      const mediumResult = await performanceScenarios.executeScenario(
        'graph-medium-execution'
      );
      const largeResult = await performanceScenarios.executeScenario(
        'graph-large-execution'
      );

      // Generally, larger graphs should take more time and memory
      expect(smallResult.result.executionTime).toBeLessThan(
        largeResult.result.executionTime
      );
      expect(smallResult.result.memoryUsage.average).toBeLessThan(
        largeResult.result.memoryUsage.average
      );
    });
  });

  describe('Frontend Rendering Scenarios', () => {
    it('should execute initial render performance scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'frontend-initial-render'
      );

      expect(result.scenario.category).toBe(
        PerformanceCategory.FRONTEND_RENDERING
      );
      expect(result.result.throughput).toBeGreaterThan(0); // Should target 60 FPS
      expect(result.result.latency.average).toBeLessThan(100); // Should be fast for UI
    });

    it('should execute real-time updates scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'frontend-real-time-updates'
      );

      expect(result.scenario.category).toBe(
        PerformanceCategory.FRONTEND_RENDERING
      );
      expect(result.result.throughput).toBeGreaterThan(0);
      expect(result.result.latency).toBeDefined();
      expect(result.result.latency.min).toBeLessThan(result.result.latency.max);
    });
  });

  describe('API Performance Scenarios', () => {
    it('should execute concurrent API request scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'api-concurrent-requests'
      );

      expect(result.scenario.category).toBe(
        PerformanceCategory.API_PERFORMANCE
      );
      expect(result.result.throughput).toBeGreaterThan(0);
      expect(result.result.resourceUsage.network).toBeGreaterThan(0);
    });

    it('should execute graph API operations scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'api-graph-operations'
      );

      expect(result.scenario.category).toBe(
        PerformanceCategory.API_PERFORMANCE
      );
      expect(result.result.latency.average).toBeGreaterThan(0);
      expect(result.result.latency.p95).toBeGreaterThan(
        result.result.latency.average
      );
    });
  });

  describe('Memory Usage Scenarios', () => {
    it('should execute graph lifecycle memory scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'memory-graph-lifecycle'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.MEMORY_USAGE);
      expect(result.result.memoryUsage.gcCount).toBeGreaterThan(0);
      expect(result.result.memoryUsage.gcTime).toBeGreaterThan(0);
    });

    it('should execute garbage collection scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'memory-garbage-collection'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.MEMORY_USAGE);
      expect(result.result.memoryUsage.gcCount).toBeGreaterThan(5); // Should trigger multiple GC cycles
      expect(result.result.memoryUsage.peak).toBeGreaterThan(
        result.result.memoryUsage.baseline
      );
    });
  });

  describe('User Workflow Scenarios', () => {
    it('should execute user creation workflow scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'user-workflow-creation'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.USER_WORKFLOW);
      expect(result.result.executionTime).toBeGreaterThan(1000); // Should be comprehensive
      expect(result.result.resourceUsage.network).toBeGreaterThan(0);
    });

    it('should execute collaborative workflow scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'user-workflow-collaborative'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.USER_WORKFLOW);
      expect(result.result.throughput).toBeGreaterThan(0);
      expect(result.result.resourceUsage.network).toBeGreaterThan(10); // Collaborative = more network
    });
  });

  describe('Stress Testing Scenarios', () => {
    it('should execute extreme load scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'stress-extreme-load'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.STRESS_TESTING);
      expect(result.result.executionTime).toBeGreaterThan(5000); // Should take significant time
      expect(result.result.resourceUsage.cpu).toBeGreaterThan(50); // High CPU under stress
    });

    it('should execute memory pressure scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'stress-memory-pressure'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.STRESS_TESTING);
      expect(result.result.memoryUsage.peak).toBeGreaterThan(100); // High memory usage
      expect(result.result.memoryUsage.gcCount).toBeGreaterThan(10); // Many GC cycles under pressure
    });
  });

  describe('Scalability Scenarios', () => {
    it('should execute user growth scalability scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'scalability-user-growth'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.SCALABILITY);
      expect(result.result.throughput).toBeGreaterThan(0);
      expect(result.result.resourceUsage.network).toBeGreaterThan(0);
    });

    it('should execute data growth scalability scenario', async () => {
      const result = await performanceScenarios.executeScenario(
        'scalability-data-growth'
      );

      expect(result.scenario.category).toBe(PerformanceCategory.SCALABILITY);
      expect(result.result.memoryUsage.average).toBeGreaterThan(0);
      expect(result.result.resourceUsage.disk).toBeGreaterThan(0);
    });
  });

  describe('Category Execution', () => {
    it('should execute all scenarios in a category', async () => {
      const results = await performanceScenarios.executeCategoryScenarios(
        PerformanceCategory.GRAPH_EXECUTION
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.scenario.category).toBe(
          PerformanceCategory.GRAPH_EXECUTION
        );
        expect(result.result).toBeDefined();
        expect(typeof result.passed).toBe('boolean');
      });
    });

    it('should filter scenarios by category correctly', () => {
      const graphScenarios = performanceScenarios.getScenariosByCategory(
        PerformanceCategory.GRAPH_EXECUTION
      );
      const frontendScenarios = performanceScenarios.getScenariosByCategory(
        PerformanceCategory.FRONTEND_RENDERING
      );

      expect(graphScenarios.length).toBeGreaterThan(0);
      expect(frontendScenarios.length).toBeGreaterThan(0);

      graphScenarios.forEach(scenario => {
        expect(scenario.category).toBe(PerformanceCategory.GRAPH_EXECUTION);
      });

      frontendScenarios.forEach(scenario => {
        expect(scenario.category).toBe(PerformanceCategory.FRONTEND_RENDERING);
      });
    });
  });

  describe('Scenario Registration', () => {
    it('should allow registration of custom scenarios', () => {
      const customScenario: PerformanceScenario = {
        id: 'custom-test-scenario',
        name: 'Custom Test Scenario',
        description: 'A custom scenario for testing',
        category: PerformanceCategory.GRAPH_EXECUTION,
        setup: async () => {},
        execute: async () => ({
          executionTime: 1000,
          memoryUsage: {
            baseline: 50,
            peak: 100,
            average: 75,
            gcCount: 2,
            gcTime: 10
          },
          throughput: 10,
          latency: {
            min: 50,
            max: 200,
            average: 100,
            p95: 180,
            p99: 195
          },
          resourceUsage: {
            cpu: 30,
            network: 15,
            disk: 5
          }
        }),
        expectedThresholds: {
          maxExecutionTime: 2000,
          maxMemoryUsage: 200,
          minThroughput: 5,
          maxLatency: 300,
          maxCpuUsage: 50
        }
      };

      performanceScenarios.registerScenario(customScenario);

      const allScenarios = performanceScenarios.getAllScenarios();
      const customFound = allScenarios.find(
        s => s.id === 'custom-test-scenario'
      );

      expect(customFound).toBeDefined();
      expect(customFound?.name).toBe('Custom Test Scenario');
    });
  });

  describe('Results Summary', () => {
    it('should provide results summary after execution', async () => {
      // Execute a few scenarios
      await performanceScenarios.executeScenario('graph-small-execution');
      await performanceScenarios.executeScenario('frontend-initial-render');

      const summary = performanceScenarios.getResultsSummary();

      expect(summary).toBeDefined();
      expect(summary.totalScenarios).toBe(2);
      expect(summary.averageExecutionTime).toBeGreaterThan(0);
      expect(summary.averageMemoryUsage).toBeGreaterThan(0);
      expect(summary.averageThroughput).toBeGreaterThan(0);
    });

    it('should return null for summary with no results', () => {
      const emptyScenarios = new PerformanceScenarios();
      const summary = emptyScenarios.getResultsSummary();

      expect(summary).toBeNull();
    });
  });

  describe('Performance Result Validation', () => {
    it('should validate performance result structure', async () => {
      const result = await performanceScenarios.executeScenario(
        'graph-small-execution'
      );
      const perfResult = result.result;

      // Validate complete structure
      expect(perfResult.executionTime).toBeGreaterThan(0);

      expect(perfResult.memoryUsage).toBeDefined();
      expect(perfResult.memoryUsage.baseline).toBeGreaterThan(0);
      expect(perfResult.memoryUsage.peak).toBeGreaterThan(0);
      expect(perfResult.memoryUsage.average).toBeGreaterThan(0);
      expect(perfResult.memoryUsage.gcCount).toBeGreaterThanOrEqual(0);
      expect(perfResult.memoryUsage.gcTime).toBeGreaterThanOrEqual(0);

      expect(perfResult.throughput).toBeGreaterThan(0);

      expect(perfResult.latency).toBeDefined();
      expect(perfResult.latency.min).toBeGreaterThan(0);
      expect(perfResult.latency.max).toBeGreaterThanOrEqual(
        perfResult.latency.min
      );
      expect(perfResult.latency.average).toBeGreaterThan(0);
      expect(perfResult.latency.p95).toBeGreaterThanOrEqual(
        perfResult.latency.average
      );
      expect(perfResult.latency.p99).toBeGreaterThanOrEqual(
        perfResult.latency.p95
      );

      expect(perfResult.resourceUsage).toBeDefined();
      expect(perfResult.resourceUsage.cpu).toBeGreaterThanOrEqual(0);
      expect(perfResult.resourceUsage.network).toBeGreaterThanOrEqual(0);
      expect(perfResult.resourceUsage.disk).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Threshold Evaluation', () => {
    it('should evaluate performance against thresholds', async () => {
      const result = await performanceScenarios.executeScenario(
        'graph-small-execution'
      );

      expect(typeof result.passed).toBe('boolean');

      // For small graphs, should generally pass thresholds
      const scenario = result.scenario;
      const perfResult = result.result;

      const shouldPass =
        perfResult.executionTime <=
          scenario.expectedThresholds.maxExecutionTime &&
        perfResult.memoryUsage.peak <=
          scenario.expectedThresholds.maxMemoryUsage &&
        perfResult.throughput >= scenario.expectedThresholds.minThroughput &&
        perfResult.latency.average <= scenario.expectedThresholds.maxLatency &&
        perfResult.resourceUsage.cpu <= scenario.expectedThresholds.maxCpuUsage;

      expect(result.passed).toBe(shouldPass);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent scenario', async () => {
      await expect(
        performanceScenarios.executeScenario('non-existent-scenario')
      ).rejects.toThrow('Scenario not found: non-existent-scenario');
    });
  });

  describe('Deterministic Results', () => {
    it('should produce consistent results with same seed', async () => {
      const scenarios1 = new PerformanceScenarios('deterministic-seed');
      const scenarios2 = new PerformanceScenarios('deterministic-seed');

      const result1 = await scenarios1.executeScenario('graph-small-execution');
      const result2 = await scenarios2.executeScenario('graph-small-execution');

      // Results should be similar (within reasonable variance) for same seed
      expect(
        Math.abs(result1.result.executionTime - result2.result.executionTime)
      ).toBeLessThan(1000); // Allow some variance due to timing

      expect(
        Math.abs(result1.result.throughput - result2.result.throughput)
      ).toBeLessThan(result1.result.throughput * 0.1); // Within 10%
    });
  });

  describe('Performance Categories Coverage', () => {
    it('should have scenarios for all performance categories', () => {
      const allScenarios = performanceScenarios.getAllScenarios();
      const categories = Object.values(PerformanceCategory);

      categories.forEach(category => {
        const categoryScenarios = allScenarios.filter(
          s => s.category === category
        );
        expect(categoryScenarios.length).toBeGreaterThan(0);
      });
    });

    it('should have realistic thresholds for each category', () => {
      const allScenarios = performanceScenarios.getAllScenarios();

      allScenarios.forEach(scenario => {
        const thresholds = scenario.expectedThresholds;

        // All thresholds should be positive and reasonable
        expect(thresholds.maxExecutionTime).toBeGreaterThan(0);
        expect(thresholds.maxExecutionTime).toBeLessThan(120000); // Under 2 minutes

        expect(thresholds.maxMemoryUsage).toBeGreaterThan(0);
        expect(thresholds.maxMemoryUsage).toBeLessThan(2000); // Under 2GB

        expect(thresholds.minThroughput).toBeGreaterThan(0);
        expect(thresholds.maxLatency).toBeGreaterThan(0);
        expect(thresholds.maxCpuUsage).toBeGreaterThan(0);
        expect(thresholds.maxCpuUsage).toBeLessThanOrEqual(100); // Max 100% CPU
      });
    });
  });
});

describe('Performance Scenarios Integration', () => {
  it('should integrate with existing testing infrastructure', async () => {
    const scenarios = new PerformanceScenarios();

    // Should be able to execute scenarios without errors
    const result = await scenarios.executeScenario('graph-small-execution');

    expect(result).toBeDefined();
    expect(result.scenario).toBeDefined();
    expect(result.result).toBeDefined();

    // Should have proper performance data structure
    expect(result.result.executionTime).toBeGreaterThan(0);
    expect(result.result.memoryUsage).toBeDefined();
    expect(result.result.throughput).toBeGreaterThan(0);
  });
});
