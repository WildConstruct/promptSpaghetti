/**
 * Memory Usage Monitoring and Optimization Tests
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562178-E4CD83 - Implement performance tests
 *
 * Comprehensive memory testing including leak detection, GC efficiency,
 * memory scaling analysis, and optimization validation.
 */

import { ExecutionContext } from '../packages/core/runtime/index';
import { AdvancedExecutionContext } from '../packages/core/runtime/advanced';
import { WeightedAdvanced } from '../packages/core/runtime/nodes/WeightedAdvanced';
import { Sequential } from '../packages/core/runtime/nodes/Sequential';
import { Markov } from '../packages/core/runtime/nodes/Markov';

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
}

interface MemoryTestResult {
  testName: string;
  initialMemory: MemorySnapshot;
  peakMemory: MemorySnapshot;
  finalMemory: MemorySnapshot;
  memoryGrowth: number; // MB
  memoryLeakDetected: boolean;
  gcEfficiency: number; // 0-1, higher is better
  memoryPressureEvents: number;
  passed: boolean;
  details: unknown;
}

interface MemoryThresholds {
  maxMemoryGrowth: number; // MB
  maxLeakTolerance: number; // MB
  minGcEfficiency: number; // 0-1
  maxPeakMemory: number; // MB
}

class MemoryOptimizationTester {
  private snapshots: MemorySnapshot[] = [];
  private memoryPressureEvents = 0;
  private gcStats: Array<{ before: number; after: number; reduction: number }> =
    [];

  /**
   * Take a memory snapshot
   */
  takeMemorySnapshot(): MemorySnapshot {
    const usage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed / 1024 / 1024, // Convert to MB
      heapTotal: usage.heapTotal / 1024 / 1024,
      external: usage.external / 1024 / 1024,
      arrayBuffers: usage.arrayBuffers / 1024 / 1024,
      rss: usage.rss / 1024 / 1024
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  /**
   * Force garbage collection and measure effectiveness
   */
  async forceGarbageCollection(): Promise<{
    before: number;
    after: number;
    reduction: number;
  }> {
    const beforeGC = process.memoryUsage().heapUsed / 1024 / 1024;

    if (global.gc) {
      global.gc();
    } else {
      // Try to trigger GC indirectly
      const largeArray = new Array(1000000).fill(Math.random());
      const _temp = largeArray.map(x => x * 2);
      // Let _temp go out of scope
    }

    // Wait a bit for GC to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const afterGC = process.memoryUsage().heapUsed / 1024 / 1024;
    const reduction = beforeGC - afterGC;

    const gcStat = { before: beforeGC, after: afterGC, reduction };
    this.gcStats.push(gcStat);

    return gcStat;
  }

  /**
   * Monitor memory pressure events
   */
  startMemoryPressureMonitoring(): void {
    this.memoryPressureEvents = 0;

    // Monitor for sudden memory increases
    const memoryCheckInterval = setInterval(() => {
      const current = process.memoryUsage().heapUsed / 1024 / 1024;
      const previous =
        this.snapshots.length > 0
          ? this.snapshots[this.snapshots.length - 1].heapUsed
          : current;

      if (current - previous > 50) {
        // 50MB sudden increase
        this.memoryPressureEvents++;
      }
    }, 1000);

    // Clear after test
    setTimeout(() => clearInterval(memoryCheckInterval), 30000);
  }

  /**
   * Create memory-intensive execution contexts
   */
  createMemoryIntensiveContext(
    seed: number,
    variableCount: number = 1000
  ): ExecutionContext {
    const context = new ExecutionContext(seed);

    // Pre-populate with many variables to test memory usage
    for (let i = 0; i < variableCount; i++) {
      context.setVariable(`var_${i}`, `value_${i}_${Math.random()}`);
    }

    return context;
  }

  /**
   * Test memory usage with repeated executions
   */
  async testRepeatedExecutions(
    iterations: number = 1000
  ): Promise<MemoryTestResult> {
    console.log(`🧪 Testing repeated executions (${iterations} iterations)`);

    this.startMemoryPressureMonitoring();
    const initialMemory = this.takeMemorySnapshot();

    // Force initial GC to establish baseline
    await this.forceGarbageCollection();
    const baselineMemory = this.takeMemorySnapshot();

    let peakMemory = baselineMemory;

    // Perform repeated executions
    for (let i = 0; i < iterations; i++) {
      const context = new ExecutionContext(i);

      // Execute various operations
      context.setVariable('counter', i);
      context.setVariable('data', `iteration_${i}_${Math.random()}`);
      context.random(); // Generate some random numbers

      // Create and execute a node
      const node = new WeightedAdvanced('test-node', {
        choices: [`choice_${i}_A`, `choice_${i}_B`],
        weights: [Math.random(), Math.random()],
        algorithm: 'exponential'
      });

      const advancedContext = new AdvancedExecutionContext(i);
      await node.execute(advancedContext);

      // Take periodic snapshots
      if (i % 100 === 0) {
        const snapshot = this.takeMemorySnapshot();
        if (snapshot.heapUsed > peakMemory.heapUsed) {
          peakMemory = snapshot;
        }
      }

      // Force GC periodically
      if (i % 250 === 0 && i > 0) {
        await this.forceGarbageCollection();
      }
    }

    // Final GC and memory measurement
    await this.forceGarbageCollection();
    const finalMemory = this.takeMemorySnapshot();

    // Calculate metrics
    const memoryGrowth = finalMemory.heapUsed - baselineMemory.heapUsed;
    const memoryLeakDetected = memoryGrowth > 50; // More than 50MB growth indicates potential leak

    const avgGcReduction =
      this.gcStats.length > 0
        ? this.gcStats.reduce((sum, stat) => sum + stat.reduction, 0) /
          this.gcStats.length
        : 0;
    const gcEfficiency = Math.max(0, Math.min(1, avgGcReduction / 20)); // Normalize to 0-1

    const thresholds: MemoryThresholds = {
      maxMemoryGrowth: 30,
      maxLeakTolerance: 50,
      minGcEfficiency: 0.3,
      maxPeakMemory: 200
    };

    const passed =
      memoryGrowth <= thresholds.maxMemoryGrowth &&
      !memoryLeakDetected &&
      gcEfficiency >= thresholds.minGcEfficiency &&
      peakMemory.heapUsed <= thresholds.maxPeakMemory;

    return {
      testName: 'Repeated Executions Memory Test',
      initialMemory,
      peakMemory,
      finalMemory,
      memoryGrowth,
      memoryLeakDetected,
      gcEfficiency,
      memoryPressureEvents: this.memoryPressureEvents,
      passed,
      details: {
        iterations,
        avgGcReduction,
        gcStats: this.gcStats.slice(-5), // Last 5 GC stats
        thresholds
      }
    };
  }

  /**
   * Test memory scaling with context size
   */
  async testContextScaling(): Promise<MemoryTestResult> {
    console.log('📊 Testing memory scaling with context size');

    const initialMemory = this.takeMemorySnapshot();
    await this.forceGarbageCollection();
    const baselineMemory = this.takeMemorySnapshot();

    let peakMemory = baselineMemory;
    const scalingData: Array<{ contextSize: number; memoryUsage: number }> = [];

    // Test different context sizes
    for (const contextSize of [100, 500, 1000, 2000, 5000]) {
      const context = this.createMemoryIntensiveContext(12345, contextSize);

      // Execute some operations
      for (let i = 0; i < 50; i++) {
        context.setVariable(`runtime_${i}`, `value_${i}`);
        context.random();
      }

      const snapshot = this.takeMemorySnapshot();
      if (snapshot.heapUsed > peakMemory.heapUsed) {
        peakMemory = snapshot;
      }

      scalingData.push({
        contextSize,
        memoryUsage: snapshot.heapUsed - baselineMemory.heapUsed
      });

      // Clean up
      await this.forceGarbageCollection();
    }

    const finalMemory = this.takeMemorySnapshot();

    // Analyze scaling characteristics
    const firstPoint = scalingData[0];
    const lastPoint = scalingData[scalingData.length - 1];
    const memoryScalingRatio = lastPoint.memoryUsage / firstPoint.memoryUsage;
    const contextScalingRatio = lastPoint.contextSize / firstPoint.contextSize;
    const scalingEfficiency = memoryScalingRatio / contextScalingRatio;

    const memoryGrowth = finalMemory.heapUsed - baselineMemory.heapUsed;
    const memoryLeakDetected = memoryGrowth > 20; // Should clean up well

    const gcEfficiency =
      this.gcStats.length > 0
        ? Math.max(...this.gcStats.map(stat => stat.reduction)) / 50
        : 0;

    const passed =
      scalingEfficiency < 2.0 && // Memory should scale roughly linearly
      memoryGrowth < 20 && // Should clean up to within 20MB
      !memoryLeakDetected;

    return {
      testName: 'Context Scaling Memory Test',
      initialMemory,
      peakMemory,
      finalMemory,
      memoryGrowth,
      memoryLeakDetected,
      gcEfficiency,
      memoryPressureEvents: this.memoryPressureEvents,
      passed,
      details: {
        scalingData,
        scalingEfficiency,
        memoryScalingRatio,
        contextScalingRatio
      }
    };
  }

  /**
   * Test advanced node memory management
   */
  async testAdvancedNodeMemory(): Promise<MemoryTestResult> {
    console.log('🔬 Testing advanced node memory management');

    const initialMemory = this.takeMemorySnapshot();
    await this.forceGarbageCollection();
    const baselineMemory = this.takeMemorySnapshot();

    let peakMemory = baselineMemory;

    // Create multiple advanced nodes with stateful behavior
    const nodes = [
      new Sequential('seq1', {
        pattern: 'cyclical',
        items: Array.from({ length: 1000 }, (_, i) => `item_${i}`)
      }),
      new Markov('markov1', {
        states: Array.from({ length: 50 }, (_, i) => `state_${i}`),
        transitions: {
          state_0: Object.fromEntries(
            Array.from({ length: 10 }, (_, i) => [`state_${i + 1}`, 0.1])
          )
        },
        initialState: 'state_0'
      }),
      new WeightedAdvanced('weighted1', {
        choices: Array.from({ length: 500 }, (_, i) => `choice_${i}`),
        weights: Array.from({ length: 500 }, () => Math.random()),
        algorithm: 'gaussian',
        parameters: { mean: 250, stdDev: 100 }
      })
    ];

    // Execute nodes multiple times to test state management
    for (let iteration = 0; iteration < 200; iteration++) {
      const context = new AdvancedExecutionContext(iteration);

      for (const node of nodes) {
        await node.execute(context);

        // Add some variables to the context
        context.setVariable(`iteration_${iteration}`, `value_${iteration}`);
      }

      // Periodic memory checks
      if (iteration % 50 === 0) {
        const snapshot = this.takeMemorySnapshot();
        if (snapshot.heapUsed > peakMemory.heapUsed) {
          peakMemory = snapshot;
        }
      }

      // Periodic cleanup
      if (iteration % 100 === 0 && iteration > 0) {
        await this.forceGarbageCollection();
      }
    }

    // Final cleanup and measurement
    await this.forceGarbageCollection();
    const finalMemory = this.takeMemorySnapshot();

    const memoryGrowth = finalMemory.heapUsed - baselineMemory.heapUsed;
    const memoryLeakDetected = memoryGrowth > 100; // Advanced nodes may use more memory

    const avgGcReduction =
      this.gcStats.length > 0
        ? this.gcStats.reduce((sum, stat) => sum + stat.reduction, 0) /
          this.gcStats.length
        : 0;
    const gcEfficiency = Math.max(0, Math.min(1, avgGcReduction / 30));

    const passed =
      memoryGrowth < 100 && // Should stay under 100MB growth
      !memoryLeakDetected &&
      gcEfficiency > 0.2 && // GC should be somewhat effective
      peakMemory.heapUsed < 300; // Peak should be reasonable

    return {
      testName: 'Advanced Node Memory Management',
      initialMemory,
      peakMemory,
      finalMemory,
      memoryGrowth,
      memoryLeakDetected,
      gcEfficiency,
      memoryPressureEvents: this.memoryPressureEvents,
      passed,
      details: {
        nodeTypes: nodes.map(n => n.constructor.name),
        avgGcReduction,
        executionCycles: 200
      }
    };
  }

  /**
   * Test for memory leaks in long-running scenarios
   */
  async testLongRunningMemoryLeaks(): Promise<MemoryTestResult> {
    console.log('⏱️ Testing long-running memory leak detection');

    const initialMemory = this.takeMemorySnapshot();
    await this.forceGarbageCollection();
    const baselineMemory = this.takeMemorySnapshot();

    let peakMemory = baselineMemory;
    const memoryHistory: number[] = [];

    // Simulate long-running execution
    const duration = 10000; // 10 seconds
    const startTime = Date.now();
    let iterations = 0;

    while (Date.now() - startTime < duration) {
      iterations++;

      // Create and destroy contexts rapidly
      const context = new AdvancedExecutionContext(iterations);

      // Add substantial data
      for (let i = 0; i < 100; i++) {
        context.setVariable(
          `temp_${i}`,
          `data_${iterations}_${i}_${Math.random()}`
        );
      }

      // Execute some operations
      const node = new WeightedAdvanced(`node_${iterations}`, {
        choices: ['A', 'B', 'C'],
        weights: [1, 1, 1],
        algorithm: 'linear'
      });

      await node.execute(context);

      // Take memory samples
      if (iterations % 100 === 0) {
        const snapshot = this.takeMemorySnapshot();
        memoryHistory.push(snapshot.heapUsed);

        if (snapshot.heapUsed > peakMemory.heapUsed) {
          peakMemory = snapshot;
        }
      }

      // Periodic GC
      if (iterations % 500 === 0) {
        await this.forceGarbageCollection();
      }
    }

    // Final cleanup
    await this.forceGarbageCollection();
    const finalMemory = this.takeMemorySnapshot();

    // Analyze memory trend
    const memoryTrend = this.calculateMemoryTrend(memoryHistory);
    const memoryGrowth = finalMemory.heapUsed - baselineMemory.heapUsed;

    // A positive trend indicates a potential memory leak
    const memoryLeakDetected = memoryTrend > 0.5 || memoryGrowth > 50;

    const avgGcReduction =
      this.gcStats.length > 0
        ? this.gcStats.reduce((sum, stat) => sum + stat.reduction, 0) /
          this.gcStats.length
        : 0;
    const gcEfficiency = Math.max(0, Math.min(1, avgGcReduction / 25));

    const passed =
      !memoryLeakDetected &&
      memoryGrowth < 30 && // Should stabilize within 30MB
      gcEfficiency > 0.25 &&
      memoryTrend < 0.3; // Memory trend should be minimal

    return {
      testName: 'Long-Running Memory Leak Detection',
      initialMemory,
      peakMemory,
      finalMemory,
      memoryGrowth,
      memoryLeakDetected,
      gcEfficiency,
      memoryPressureEvents: this.memoryPressureEvents,
      passed,
      details: {
        duration,
        iterations,
        memoryTrend,
        memoryHistory: memoryHistory.slice(-10), // Last 10 samples
        avgGcReduction
      }
    };
  }

  /**
   * Calculate memory trend (positive = growing, negative = decreasing)
   */
  private calculateMemoryTrend(memoryHistory: number[]): number {
    if (memoryHistory.length < 2) {return 0;}

    // Simple linear regression to find trend
    const n = memoryHistory.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = memoryHistory;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Generate comprehensive memory report
   */
  generateMemoryReport(results: MemoryTestResult[]): string {
    let report = '\\n🧠 MEMORY OPTIMIZATION TEST REPORT\\n';
    report += '='.repeat(70) + '\\n\\n';

    const overallPassed = results.every(r => r.passed);
    report += `Overall Status: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}\\n\\n`;

    for (const result of results) {
      report += `${result.passed ? '✅' : '❌'} ${result.testName}\\n`;
      report += `   Initial Memory: ${result.initialMemory.heapUsed.toFixed(2)}MB\\n`;
      report += `   Peak Memory: ${result.peakMemory.heapUsed.toFixed(2)}MB\\n`;
      report += `   Final Memory: ${result.finalMemory.heapUsed.toFixed(2)}MB\\n`;
      report += `   Memory Growth: ${result.memoryGrowth.toFixed(2)}MB\\n`;
      report += `   Memory Leak: ${result.memoryLeakDetected ? '⚠️ DETECTED' : '✅ NONE'}\\n`;
      report += `   GC Efficiency: ${(result.gcEfficiency * 100).toFixed(1)}%\\n`;
      report += `   Pressure Events: ${result.memoryPressureEvents}\\n`;
      report += '\\n';
    }

    // Overall memory statistics
    const totalGrowth = results.reduce(
      (sum, r) => sum + Math.max(0, r.memoryGrowth),
      0
    );
    const avgGcEfficiency =
      results.reduce((sum, r) => sum + r.gcEfficiency, 0) / results.length;
    const leakCount = results.filter(r => r.memoryLeakDetected).length;
    const maxPeakMemory = Math.max(...results.map(r => r.peakMemory.heapUsed));

    report += 'Memory Performance Summary:\\n';
    report += `   Total Memory Growth: ${totalGrowth.toFixed(2)}MB\\n`;
    report += `   Average GC Efficiency: ${(avgGcEfficiency * 100).toFixed(1)}%\\n`;
    report += `   Memory Leaks Detected: ${leakCount}\\n`;
    report += `   Peak Memory Usage: ${maxPeakMemory.toFixed(2)}MB\\n`;
    report += `   Tests Passed: ${results.filter(r => r.passed).length}/${results.length}\\n`;

    return report;
  }
}

// Jest test suite
describe('Memory Optimization Tests', () => {
  let tester: MemoryOptimizationTester;

  beforeAll(() => {
    tester = new MemoryOptimizationTester();

    // Enable GC if available
    if (global.gc) {
      console.log('✅ Garbage collection enabled for memory tests');
    } else {
      console.warn(
        '⚠️ Garbage collection not available - some tests may be less accurate'
      );
    }
  });

  test('Repeated executions memory management', async () => {
    const result = await tester.testRepeatedExecutions(500);

    expect(result.passed).toBe(true);
    expect(result.memoryLeakDetected).toBe(false);
    expect(result.memoryGrowth).toBeLessThan(30);
    expect(result.gcEfficiency).toBeGreaterThan(0.3);

    console.log(
      `Repeated executions: ${result.memoryGrowth.toFixed(2)}MB growth, ${(result.gcEfficiency * 100).toFixed(1)}% GC efficiency`
    );
  }, 60000);

  test('Context scaling memory efficiency', async () => {
    const result = await tester.testContextScaling();

    expect(result.passed).toBe(true);
    expect(result.memoryLeakDetected).toBe(false);
    expect(result.details.scalingEfficiency).toBeLessThan(2.0);

    console.log(
      `Context scaling: ${result.details.scalingEfficiency.toFixed(2)}x scaling efficiency`
    );
  }, 45000);

  test('Advanced node memory management', async () => {
    const result = await tester.testAdvancedNodeMemory();

    expect(result.passed).toBe(true);
    expect(result.memoryLeakDetected).toBe(false);
    expect(result.memoryGrowth).toBeLessThan(100);
    expect(result.peakMemory.heapUsed).toBeLessThan(300);

    console.log(
      `Advanced nodes: ${result.memoryGrowth.toFixed(2)}MB growth, peak ${result.peakMemory.heapUsed.toFixed(2)}MB`
    );
  }, 60000);

  test('Long-running memory leak detection', async () => {
    const result = await tester.testLongRunningMemoryLeaks();

    expect(result.passed).toBe(true);
    expect(result.memoryLeakDetected).toBe(false);
    expect(result.details.memoryTrend).toBeLessThan(0.3);
    expect(result.memoryGrowth).toBeLessThan(30);

    console.log(
      `Long-running: ${result.details.memoryTrend.toFixed(3)} trend, ${result.details.iterations} iterations`
    );
  }, 75000);

  test('Memory stress test', async () => {
    console.log('🔥 Running memory stress test');

    const initialSnapshot = tester.takeMemorySnapshot();

    // Create a large number of contexts and nodes simultaneously
    const contexts: AdvancedExecutionContext[] = [];
    const nodes: WeightedAdvanced[] = [];

    for (let i = 0; i < 100; i++) {
      const context = new AdvancedExecutionContext(i);

      // Load context with data
      for (let j = 0; j < 50; j++) {
        context.setVariable(`stress_${i}_${j}`, `data_${Math.random()}`);
      }

      contexts.push(context);

      // Create memory-intensive node
      const node = new WeightedAdvanced(`stress_node_${i}`, {
        choices: Array.from({ length: 20 }, (_, k) => `choice_${i}_${k}`),
        weights: Array.from({ length: 20 }, () => Math.random()),
        algorithm: 'gaussian'
      });

      nodes.push(node);
    }

    const peakSnapshot = tester.takeMemorySnapshot();

    // Execute all nodes
    for (let i = 0; i < nodes.length; i++) {
      await nodes[i].execute(contexts[i]);
    }

    // Clean up
    contexts.length = 0;
    nodes.length = 0;

    await tester.forceGarbageCollection();
    const finalSnapshot = tester.takeMemorySnapshot();

    const memoryGrowth = finalSnapshot.heapUsed - initialSnapshot.heapUsed;
    const peakMemoryUsage = peakSnapshot.heapUsed - initialSnapshot.heapUsed;

    // Should handle stress test without excessive memory usage
    expect(memoryGrowth).toBeLessThan(50); // Should clean up well
    expect(peakMemoryUsage).toBeLessThan(200); // Peak should be reasonable

    console.log(
      `Memory stress: ${peakMemoryUsage.toFixed(2)}MB peak, ${memoryGrowth.toFixed(2)}MB final growth`
    );
  }, 45000);

  test('Complete memory optimization suite', async () => {
    const results = [
      await tester.testRepeatedExecutions(300),
      await tester.testContextScaling(),
      await tester.testAdvancedNodeMemory(),
      await tester.testLongRunningMemoryLeaks()
    ];

    const report = tester.generateMemoryReport(results);
    console.log(report);

    // All memory tests should pass
    expect(results.every(r => r.passed)).toBe(true);

    // No memory leaks should be detected
    expect(results.every(r => !r.memoryLeakDetected)).toBe(true);

    // Generate performance metrics
    const metricsData = {
      timestamp: new Date().toISOString(),
      overallPassed: results.every(r => r.passed),
      memoryTests: results.map(r => ({
        testName: r.testName,
        passed: r.passed,
        memoryGrowth: r.memoryGrowth,
        memoryLeakDetected: r.memoryLeakDetected,
        gcEfficiency: r.gcEfficiency,
        peakMemoryUsage: r.peakMemory.heapUsed
      })),
      summary: {
        totalTests: results.length,
        passedTests: results.filter(r => r.passed).length,
        leakCount: results.filter(r => r.memoryLeakDetected).length,
        avgGcEfficiency:
          results.reduce((sum, r) => sum + r.gcEfficiency, 0) / results.length,
        maxPeakMemory: Math.max(...results.map(r => r.peakMemory.heapUsed))
      }
    };

    expect(metricsData.overallPassed).toBe(true);
    expect(metricsData.summary.leakCount).toBe(0);
    expect(metricsData.summary.avgGcEfficiency).toBeGreaterThan(0.2);
  }, 180000);
});

export {
  MemoryOptimizationTester,
  MemorySnapshot,
  MemoryTestResult,
  MemoryThresholds
};
