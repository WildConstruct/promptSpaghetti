/**
 * Core Engine Performance Tests
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562178-E4CD83 - Implement performance tests
 *
 * Comprehensive performance testing for the core execution engine,
 * focusing on runtime execution, memory usage, and scalability.
 */

import { ExecutionContext, RuntimeNode } from '../../packages/core/runtime/index';
import { AdvancedExecutionContext, AdvancedRuntimeNode } from '../../packages/core/runtime/advanced';
import { WeightedAdvanced } from '../../packages/core/runtime/nodes/WeightedAdvanced';
import { Conditional } from '../../packages/core/runtime/nodes/Conditional';
import { Sequential } from '../../packages/core/runtime/nodes/Sequential';
import { Markov } from '../../packages/core/runtime/nodes/Markov';

interface PerformanceMetrics {
  executionTime: number;
  memoryUsed: number;
  operationsPerSecond: number;
  averageNodeExecutionTime: number;
  maxNodeExecutionTime: number;
  minNodeExecutionTime: number;
  totalNodes: number;
  totalExecutions: number;
}

interface BenchmarkResult {
  testName: string;
  metrics: PerformanceMetrics;
  passed: boolean;
  details: any;
}

class CoreEnginePerformanceTester {
  private memoryBaseline: number = 0;

  /**
   * Record memory baseline before tests
   */
  recordMemoryBaseline(): void {
    if (global.gc) {
      global.gc();
    }
    this.memoryBaseline = process.memoryUsage().heapUsed;
  }

  /**
   * Get current memory usage relative to baseline
   */
  getCurrentMemoryUsage(): number {
    if (global.gc) {
      global.gc();
    }
    return (process.memoryUsage().heapUsed - this.memoryBaseline) / 1024 / 1024; // MB
  }

  /**
   * Measure execution time for a function
   */
  async measureExecution<T>(fn: () => Promise<T> | T): Promise<{ result: T; time: number }> {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const time = Number(end - start) / 1_000_000; // Convert to milliseconds
    return { result, time };
  }

  /**
   * Create a simple weighted choice node for testing
   */
  createWeightedChoiceNode(id: string, choices: string[], weights?: number[]): RuntimeNode {
    return new (class extends RuntimeNode {
      async execute(context: ExecutionContext): Promise<string> {
        const effectiveWeights = weights || choices.map(() => 1 / choices.length);
        const random = context.random();
        let sum = 0;
        for (let i = 0; i < effectiveWeights.length; i++) {
          sum += effectiveWeights[i];
          if (random <= sum) {
            return choices[i];
          }
        }
        return choices[choices.length - 1];
      }
    })(id);
  }

  /**
   * Create a complex graph with multiple node types
   */
  createComplexGraph(nodeCount: number): RuntimeNode[] {
    const nodes: RuntimeNode[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 4;
      const nodeId = `node-${i}`;
      
      switch (nodeType) {
        case 0:
          nodes.push(this.createWeightedChoiceNode(
            nodeId,
            [`choice-${i}-1`, `choice-${i}-2`, `choice-${i}-3`],
            [0.5, 0.3, 0.2]
          ));
          break;
        case 1:
          nodes.push(new (class extends RuntimeNode {
            async execute(context: ExecutionContext): Promise<string> {
              return `concat-${i}-${context.getVariable('counter') || 0}`;
            }
          })(nodeId));
          break;
        case 2:
          nodes.push(new (class extends RuntimeNode {
            async execute(context: ExecutionContext): Promise<string> {
              const counter = (context.getVariable('counter') as number) || 0;
              context.setVariable('counter', counter + 1);
              return `variable-${counter}`;
            }
          })(nodeId));
          break;
        case 3:
          nodes.push(new (class extends RuntimeNode {
            async execute(context: ExecutionContext): Promise<string> {
              return `output-${i}-${Date.now()}`;
            }
          })(nodeId));
          break;
      }
    }
    
    return nodes;
  }

  /**
   * Benchmark simple node execution
   */
  async benchmarkSimpleExecution(iterations: number = 1000): Promise<BenchmarkResult> {
    this.recordMemoryBaseline();
    
    const node = this.createWeightedChoiceNode('test-node', ['A', 'B', 'C'], [0.4, 0.4, 0.2]);
    const context = new ExecutionContext(12345);
    
    const executionTimes: number[] = [];
    let totalTime = 0;
    
    const { result, time: setupTime } = await this.measureExecution(async () => {
      for (let i = 0; i < iterations; i++) {
        const { time } = await this.measureExecution(() => node.execute(context));
        executionTimes.push(time);
        totalTime += time;
      }
      return 'completed';
    });
    
    const memoryUsed = this.getCurrentMemoryUsage();
    const operationsPerSecond = iterations / (totalTime / 1000);
    
    const metrics: PerformanceMetrics = {
      executionTime: totalTime,
      memoryUsed,
      operationsPerSecond,
      averageNodeExecutionTime: totalTime / iterations,
      maxNodeExecutionTime: Math.max(...executionTimes),
      minNodeExecutionTime: Math.min(...executionTimes),
      totalNodes: 1,
      totalExecutions: iterations
    };
    
    return {
      testName: 'Simple Node Execution',
      metrics,
      passed: operationsPerSecond > 1000 && memoryUsed < 50, // Should handle 1000+ ops/sec with <50MB
      details: { executionTimes: executionTimes.slice(0, 10) } // Sample of first 10
    };
  }

  /**
   * Benchmark complex graph execution
   */
  async benchmarkComplexGraphExecution(nodeCount: number = 100, iterations: number = 100): Promise<BenchmarkResult> {
    this.recordMemoryBaseline();
    
    const nodes = this.createComplexGraph(nodeCount);
    const context = new ExecutionContext(12345);
    
    const executionTimes: number[] = [];
    let totalTime = 0;
    
    const { result, time: setupTime } = await this.measureExecution(async () => {
      for (let i = 0; i < iterations; i++) {
        const { time } = await this.measureExecution(async () => {
          // Execute all nodes in sequence to simulate graph execution
          for (const node of nodes) {
            await node.execute(context);
          }
        });
        executionTimes.push(time);
        totalTime += time;
      }
      return 'completed';
    });
    
    const memoryUsed = this.getCurrentMemoryUsage();
    const operationsPerSecond = (iterations * nodeCount) / (totalTime / 1000);
    
    const metrics: PerformanceMetrics = {
      executionTime: totalTime,
      memoryUsed,
      operationsPerSecond,
      averageNodeExecutionTime: totalTime / (iterations * nodeCount),
      maxNodeExecutionTime: Math.max(...executionTimes),
      minNodeExecutionTime: Math.min(...executionTimes),
      totalNodes: nodeCount,
      totalExecutions: iterations
    };
    
    return {
      testName: `Complex Graph Execution (${nodeCount} nodes)`,
      metrics,
      passed: operationsPerSecond > 100 && memoryUsed < 100, // Should handle 100+ node ops/sec with <100MB
      details: { nodeCount, iterations }
    };
  }

  /**
   * Benchmark advanced node performance
   */
  async benchmarkAdvancedNodes(iterations: number = 500): Promise<BenchmarkResult> {
    this.recordMemoryBaseline();
    
    const context = new AdvancedExecutionContext(12345);
    
    // Create advanced nodes
    const weightedAdvanced = new WeightedAdvanced('weighted-adv', {
      choices: ['choice1', 'choice2', 'choice3'],
      weights: [1, 2, 3],
      algorithm: 'exponential',
      parameters: { base: 2, scale: 1.5 }
    });
    
    const conditional = new Conditional('conditional', {
      condition: 'getValue("test") > 5',
      trueBranch: 'true-result',
      falseBranch: 'false-result'
    });
    
    const sequential = new Sequential('sequential', {
      pattern: 'linear',
      items: ['seq1', 'seq2', 'seq3', 'seq4']
    });
    
    const markov = new Markov('markov', {
      states: ['state1', 'state2', 'state3'],
      transitions: {
        state1: { state2: 0.7, state3: 0.3 },
        state2: { state1: 0.4, state3: 0.6 },
        state3: { state1: 0.5, state2: 0.5 }
      },
      initialState: 'state1'
    });
    
    const nodes = [weightedAdvanced, conditional, sequential, markov];
    const executionTimes: number[] = [];
    let totalTime = 0;
    
    const { result, time: setupTime } = await this.measureExecution(async () => {
      for (let i = 0; i < iterations; i++) {
        context.setVariable('test', Math.random() * 10);
        
        const { time } = await this.measureExecution(async () => {
          for (const node of nodes) {
            await node.execute(context);
          }
        });
        executionTimes.push(time);
        totalTime += time;
      }
      return 'completed';
    });
    
    const memoryUsed = this.getCurrentMemoryUsage();
    const operationsPerSecond = (iterations * nodes.length) / (totalTime / 1000);
    
    const metrics: PerformanceMetrics = {
      executionTime: totalTime,
      memoryUsed,
      operationsPerSecond,
      averageNodeExecutionTime: totalTime / (iterations * nodes.length),
      maxNodeExecutionTime: Math.max(...executionTimes),
      minNodeExecutionTime: Math.min(...executionTimes),
      totalNodes: nodes.length,
      totalExecutions: iterations
    };
    
    return {
      testName: 'Advanced Nodes Execution',
      metrics,
      passed: operationsPerSecond > 50 && memoryUsed < 150, // Advanced nodes are more complex
      details: { nodeTypes: ['WeightedAdvanced', 'Conditional', 'Sequential', 'Markov'] }
    };
  }

  /**
   * Benchmark memory scaling with graph size
   */
  async benchmarkMemoryScaling(): Promise<BenchmarkResult> {
    const results: any[] = [];
    
    for (const nodeCount of [10, 50, 100, 500, 1000]) {
      this.recordMemoryBaseline();
      
      const nodes = this.createComplexGraph(nodeCount);
      const context = new ExecutionContext(12345);
      
      // Execute the graph once to measure memory usage
      const { time } = await this.measureExecution(async () => {
        for (const node of nodes) {
          await node.execute(context);
        }
      });
      
      const memoryUsed = this.getCurrentMemoryUsage();
      
      results.push({
        nodeCount,
        memoryUsed,
        executionTime: time,
        memoryPerNode: memoryUsed / nodeCount
      });
    }
    
    // Check if memory scaling is reasonable (should be roughly linear)
    const memoryGrowthRate = results[results.length - 1].memoryUsed / results[0].memoryUsed;
    const nodeGrowthRate = results[results.length - 1].nodeCount / results[0].nodeCount;
    const scalingRatio = memoryGrowthRate / nodeGrowthRate;
    
    const metrics: PerformanceMetrics = {
      executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
      memoryUsed: results[results.length - 1].memoryUsed,
      operationsPerSecond: 0, // Not applicable for this test
      averageNodeExecutionTime: 0, // Not applicable
      maxNodeExecutionTime: Math.max(...results.map(r => r.executionTime)),
      minNodeExecutionTime: Math.min(...results.map(r => r.executionTime)),
      totalNodes: results.reduce((sum, r) => sum + r.nodeCount, 0),
      totalExecutions: results.length
    };
    
    return {
      testName: 'Memory Scaling Analysis',
      metrics,
      passed: scalingRatio < 3.0 && results[results.length - 1].memoryUsed < 500, // Memory growth should be reasonable
      details: { results, scalingRatio, memoryGrowthRate, nodeGrowthRate }
    };
  }

  /**
   * Benchmark deterministic execution consistency
   */
  async benchmarkDeterministicConsistency(iterations: number = 100): Promise<BenchmarkResult> {
    this.recordMemoryBaseline();
    
    const nodes = this.createComplexGraph(20);
    const seed = 12345;
    const results: string[] = [];
    
    const { result, time } = await this.measureExecution(async () => {
      for (let i = 0; i < iterations; i++) {
        const context = new ExecutionContext(seed); // Same seed every time
        let output = '';
        
        for (const node of nodes) {
          const nodeResult = await node.execute(context);
          output += nodeResult;
        }
        
        results.push(output);
      }
      return 'completed';
    });
    
    // Check that all results are identical (deterministic)
    const allIdentical = results.every(result => result === results[0]);
    const memoryUsed = this.getCurrentMemoryUsage();
    const operationsPerSecond = (iterations * nodes.length) / (time / 1000);
    
    const metrics: PerformanceMetrics = {
      executionTime: time,
      memoryUsed,
      operationsPerSecond,
      averageNodeExecutionTime: time / (iterations * nodes.length),
      maxNodeExecutionTime: 0, // Not measured individually
      minNodeExecutionTime: 0, // Not measured individually
      totalNodes: nodes.length,
      totalExecutions: iterations
    };
    
    return {
      testName: 'Deterministic Execution Consistency',
      metrics,
      passed: allIdentical && operationsPerSecond > 200,
      details: { 
        allIdentical, 
        uniqueResults: new Set(results).size,
        sampleResult: results[0].substring(0, 100) 
      }
    };
  }

  /**
   * Run comprehensive performance test suite
   */
  async runPerformanceTestSuite(): Promise<BenchmarkResult[]> {
    console.log('🚀 Starting Core Engine Performance Test Suite');
    console.log('=' .repeat(60));
    
    const results: BenchmarkResult[] = [];
    
    // Test 1: Simple execution performance
    console.log('📊 Running simple execution benchmark...');
    results.push(await this.benchmarkSimpleExecution());
    
    // Test 2: Complex graph execution
    console.log('📊 Running complex graph benchmark...');
    results.push(await this.benchmarkComplexGraphExecution());
    
    // Test 3: Advanced nodes performance
    console.log('📊 Running advanced nodes benchmark...');
    results.push(await this.benchmarkAdvancedNodes());
    
    // Test 4: Memory scaling analysis
    console.log('📊 Running memory scaling analysis...');
    results.push(await this.benchmarkMemoryScaling());
    
    // Test 5: Deterministic consistency
    console.log('📊 Running deterministic consistency test...');
    results.push(await this.benchmarkDeterministicConsistency());
    
    return results;
  }

  /**
   * Generate performance report
   */
  generateReport(results: BenchmarkResult[]): string {
    let report = '\\n📈 CORE ENGINE PERFORMANCE REPORT\\n';
    report += '=' .repeat(60) + '\\n\\n';
    
    const overallPassed = results.every(r => r.passed);
    report += `Overall Status: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}\\n\\n`;
    
    for (const result of results) {
      report += `${result.passed ? '✅' : '❌'} ${result.testName}\\n`;
      report += `   Execution Time: ${result.metrics.executionTime.toFixed(2)}ms\\n`;
      report += `   Memory Used: ${result.metrics.memoryUsed.toFixed(2)}MB\\n`;
      report += `   Operations/sec: ${result.metrics.operationsPerSecond.toFixed(0)}\\n`;
      
      if (result.metrics.averageNodeExecutionTime > 0) {
        report += `   Avg Node Time: ${result.metrics.averageNodeExecutionTime.toFixed(3)}ms\\n`;
      }
      
      report += '\\n';
    }
    
    // Performance summary
    const totalOperations = results.reduce((sum, r) => sum + r.metrics.operationsPerSecond, 0);
    const maxMemory = Math.max(...results.map(r => r.metrics.memoryUsed));
    const totalTime = results.reduce((sum, r) => sum + r.metrics.executionTime, 0);
    
    report += 'Performance Summary:\\n';
    report += `   Total Operations/sec: ${totalOperations.toFixed(0)}\\n`;
    report += `   Peak Memory Usage: ${maxMemory.toFixed(2)}MB\\n`;
    report += `   Total Test Time: ${totalTime.toFixed(2)}ms\\n`;
    
    return report;
  }
}

// Jest test suite
describe('Core Engine Performance Tests', () => {
  let tester: CoreEnginePerformanceTester;
  
  beforeAll(() => {
    tester = new CoreEnginePerformanceTester();
  });

  test('Simple node execution performance', async () => {
    const result = await tester.benchmarkSimpleExecution(1000);
    
    expect(result.passed).toBe(true);
    expect(result.metrics.operationsPerSecond).toBeGreaterThan(1000);
    expect(result.metrics.memoryUsed).toBeLessThan(50);
    
    console.log(`Simple execution: ${result.metrics.operationsPerSecond.toFixed(0)} ops/sec, ${result.metrics.memoryUsed.toFixed(2)}MB`);
  }, 30000);

  test('Complex graph execution performance', async () => {
    const result = await tester.benchmarkComplexGraphExecution(100, 50);
    
    expect(result.passed).toBe(true);
    expect(result.metrics.operationsPerSecond).toBeGreaterThan(100);
    expect(result.metrics.memoryUsed).toBeLessThan(100);
    
    console.log(`Complex graph: ${result.metrics.operationsPerSecond.toFixed(0)} ops/sec, ${result.metrics.memoryUsed.toFixed(2)}MB`);
  }, 30000);

  test('Advanced nodes performance', async () => {
    const result = await tester.benchmarkAdvancedNodes(250);
    
    expect(result.passed).toBe(true);
    expect(result.metrics.operationsPerSecond).toBeGreaterThan(50);
    expect(result.metrics.memoryUsed).toBeLessThan(150);
    
    console.log(`Advanced nodes: ${result.metrics.operationsPerSecond.toFixed(0)} ops/sec, ${result.metrics.memoryUsed.toFixed(2)}MB`);
  }, 30000);

  test('Memory scaling analysis', async () => {
    const result = await tester.benchmarkMemoryScaling();
    
    expect(result.passed).toBe(true);
    expect(result.details.scalingRatio).toBeLessThan(3.0);
    
    console.log(`Memory scaling ratio: ${result.details.scalingRatio.toFixed(2)}`);
  }, 60000);

  test('Deterministic execution consistency', async () => {
    const result = await tester.benchmarkDeterministicConsistency(50);
    
    expect(result.passed).toBe(true);
    expect(result.details.allIdentical).toBe(true);
    expect(result.details.uniqueResults).toBe(1);
    
    console.log(`Deterministic consistency: ${result.details.allIdentical ? 'PASS' : 'FAIL'}`);
  }, 30000);

  test('Full performance test suite', async () => {
    const results = await tester.runPerformanceTestSuite();
    const report = tester.generateReport(results);
    
    console.log(report);
    
    // All tests should pass
    expect(results.every(r => r.passed)).toBe(true);
    
    // Generate performance metrics file
    const metricsData = {
      timestamp: new Date().toISOString(),
      results: results.map(r => ({
        testName: r.testName,
        passed: r.passed,
        metrics: r.metrics
      }))
    };
    
    // This would normally save to a file in CI/CD pipeline
    expect(metricsData.results.length).toBe(5);
  }, 120000);
});

export { CoreEnginePerformanceTester, PerformanceMetrics, BenchmarkResult };