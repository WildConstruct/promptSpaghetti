/**
 * Performance Regression Tests - Execution Benchmarks
 * 
 * These tests ensure performance improvements are maintained and detect
 * performance regressions in critical execution paths.
 * 
 * CRITICAL: Performance degradation affects user experience and scalability.
 */

import { executeGraph } from '../../../server/src/engine';
import { Graph } from '../../../packages/core/graphSchema';

interface PerformanceBenchmark {
  name: string;
  graph: Graph;
  expectedMaxTimeMs: number;
  expectedMaxMemoryMB: number;
  description: string;
}

// Performance test cases with defined thresholds
const PERFORMANCE_BENCHMARKS: PerformanceBenchmark[] = [
  {
    name: 'small-graph-execution',
    description: 'Small graph (5 nodes) - basic responsiveness',
    expectedMaxTimeMs: 50,
    expectedMaxMemoryMB: 10,
    graph: {
      id: 'small-perf-test',
      seed: 12345,
      nodes: [
        {
          id: 'choice1',
          type: 'WeightedChoice',
          choices: [
            { text: 'Fast', weight: 1 },
            { text: 'Quick', weight: 1 }
          ]
        },
        {
          id: 'choice2',
          type: 'WeightedChoice',
          choices: [
            { text: 'execution', weight: 1 },
            { text: 'processing', weight: 1 }
          ]
        },
        {
          id: 'concat1',
          type: 'Concat',
          inputs: ['choice1', 'choice2']
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['concat1']
        }
      ],
      edges: [
        { id: 'e1', source: 'choice1', target: 'concat1' },
        { id: 'e2', source: 'choice2', target: 'concat1' },
        { id: 'e3', source: 'concat1', target: 'output1' }
      ]
    }
  },

  {
    name: 'medium-graph-execution',
    description: 'Medium graph (20 nodes) - typical user workflow',
    expectedMaxTimeMs: 200,
    expectedMaxMemoryMB: 25,
    graph: {
      id: 'medium-perf-test',
      seed: 54321,
      nodes: [
        // Create 15 weighted choice nodes
        ...Array.from({ length: 15 }, (_, i) => ({
          id: `choice${i + 1}`,
          type: 'WeightedChoice' as const,
          choices: [
            { text: `Option ${i + 1}A`, weight: 1 },
            { text: `Option ${i + 1}B`, weight: 1 }
          ]
        })),
        // Create 3 concat nodes
        {
          id: 'concat1',
          type: 'Concat' as const,
          inputs: ['choice1', 'choice2', 'choice3', 'choice4', 'choice5']
        },
        {
          id: 'concat2',
          type: 'Concat' as const,
          inputs: ['choice6', 'choice7', 'choice8', 'choice9', 'choice10']
        },
        {
          id: 'concat3',
          type: 'Concat' as const,
          inputs: ['choice11', 'choice12', 'choice13', 'choice14', 'choice15']
        },
        // Final output
        {
          id: 'finalConcat',
          type: 'Concat' as const,
          inputs: ['concat1', 'concat2', 'concat3']
        },
        {
          id: 'output1',
          type: 'Output' as const,
          inputs: ['finalConcat']
        }
      ],
      edges: [
        // Connect choices to concat nodes
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `e${i + 1}`,
          source: `choice${i + 1}`,
          target: 'concat1'
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `e${i + 6}`,
          source: `choice${i + 6}`,
          target: 'concat2'
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `e${i + 11}`,
          source: `choice${i + 11}`,
          target: 'concat3'
        })),
        // Connect concat nodes to final concat
        { id: 'e16', source: 'concat1', target: 'finalConcat' },
        { id: 'e17', source: 'concat2', target: 'finalConcat' },
        { id: 'e18', source: 'concat3', target: 'finalConcat' },
        // Connect to output
        { id: 'e19', source: 'finalConcat', target: 'output1' }
      ]
    }
  },

  {
    name: 'complex-advanced-nodes',
    description: 'Complex graph with advanced nodes - feature completeness',
    expectedMaxTimeMs: 500,
    expectedMaxMemoryMB: 50,
    graph: {
      id: 'complex-perf-test',
      seed: 99999,
      nodes: [
        {
          id: 'weightedAdv1',
          type: 'WeightedAdvanced',
          choices: Array.from({ length: 20 }, (_, i) => ({
            text: `Advanced option ${i + 1}`,
            weight: Math.random() * 10
          })),
          distributionConfig: {
            type: 'exponential',
            normalize: true,
            temperature: 2.0
          }
        },
        {
          id: 'sequential1',
          type: 'Sequential',
          sequence: Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`),
          pattern: {
            type: 'weighted',
            config: {
              weights: Array.from({ length: 50 }, () => Math.random())
            }
          }
        },
        {
          id: 'markov1',
          type: 'Markov',
          states: ['state1', 'state2', 'state3', 'state4', 'state5'],
          transitions: {
            state1: { state2: 0.4, state3: 0.3, state4: 0.2, state5: 0.1 },
            state2: { state1: 0.2, state3: 0.3, state4: 0.3, state5: 0.2 },
            state3: { state1: 0.1, state2: 0.2, state4: 0.4, state5: 0.3 },
            state4: { state1: 0.3, state2: 0.2, state3: 0.2, state5: 0.3 },
            state5: { state1: 0.4, state2: 0.3, state3: 0.2, state4: 0.1 }
          },
          initialState: 'state1',
          markovConfig: {
            maxSteps: 20,
            terminationConditions: ['state5']
          }
        },
        {
          id: 'conditional1',
          type: 'Conditional',
          branches: [
            { condition: 'true', output: 'Condition A' },
            { condition: 'false', output: 'Condition B' }
          ],
          defaultOutput: 'Default condition'
        },
        {
          id: 'output1',
          type: 'Output',
          inputs: ['weightedAdv1']
        },
        {
          id: 'output2',
          type: 'Output',
          inputs: ['sequential1']
        },
        {
          id: 'output3',
          type: 'Output',
          inputs: ['markov1']
        },
        {
          id: 'output4',
          type: 'Output',
          inputs: ['conditional1']
        }
      ],
      edges: [
        { id: 'e1', source: 'weightedAdv1', target: 'output1' },
        { id: 'e2', source: 'sequential1', target: 'output2' },
        { id: 'e3', source: 'markov1', target: 'output3' },
        { id: 'e4', source: 'conditional1', target: 'output4' }
      ]
    }
  }
];

describe('Performance Regression Tests - Execution Benchmarks', () => {

  beforeAll(() => {
    // Warm up V8 JIT compiler
    const warmupGraph = PERFORMANCE_BENCHMARKS[0].graph;
    return Promise.all([
      executeGraph(warmupGraph),
      executeGraph(warmupGraph),
      executeGraph(warmupGraph)
    ]);
  });

  describe('Individual Benchmark Tests', () => {
    for (const benchmark of PERFORMANCE_BENCHMARKS) {
      describe(`${benchmark.name}: ${benchmark.description}`, () => {

        it(`should complete within ${benchmark.expectedMaxTimeMs}ms`, async () => {
          const startTime = performance.now();
          
          await executeGraph(benchmark.graph);
          
          const executionTime = performance.now() - startTime;
          
          expect(executionTime).toBeLessThan(benchmark.expectedMaxTimeMs);
        });

        it('should have consistent performance across multiple runs', async () => {
          const executionTimes: number[] = [];
          
          for (let i = 0; i < 5; i++) {
            const startTime = performance.now();
            await executeGraph(benchmark.graph);
            const executionTime = performance.now() - startTime;
            executionTimes.push(executionTime);
          }
          
          const averageTime = executionTimes.reduce((a, b) => a + b) / executionTimes.length;
          const maxVariation = Math.max(...executionTimes) - Math.min(...executionTimes);
          
          // Variation should be less than 50% of average time
          expect(maxVariation).toBeLessThan(averageTime * 0.5);
        });

        it('should not leak memory during execution', async () => {
          const initialMemory = process.memoryUsage().heapUsed;
          
          // Execute multiple times
          for (let i = 0; i < 10; i++) {
            await executeGraph(benchmark.graph);
          }
          
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
          }
          
          const finalMemory = process.memoryUsage().heapUsed;
          const memoryGrowthMB = (finalMemory - initialMemory) / (1024 * 1024);
          
          expect(memoryGrowthMB).toBeLessThan(benchmark.expectedMaxMemoryMB);
        });

      });
    }
  });

  describe('Concurrent Execution Performance', () => {
    it('should handle multiple concurrent executions efficiently', async () => {
      const simpleGraph = PERFORMANCE_BENCHMARKS[0].graph;
      const concurrentExecutions = 10;
      
      const startTime = performance.now();
      
      const promises = Array.from({ length: concurrentExecutions }, () =>
        executeGraph(simpleGraph)
      );
      
      const results = await Promise.all(promises);
      
      const totalTime = performance.now() - startTime;
      const averageTimePerExecution = totalTime / concurrentExecutions;
      
      // Concurrent execution should not be much slower than sequential
      expect(averageTimePerExecution).toBeLessThan(100); // 100ms per execution
      expect(results).toHaveLength(concurrentExecutions);
    });

    it('should maintain performance under load', async () => {
      const mediumGraph = PERFORMANCE_BENCHMARKS[1].graph;
      const loadTestDuration = 2000; // 2 seconds
      const executions: Promise<string[]>[] = [];
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < loadTestDuration) {
        executions.push(executeGraph(mediumGraph));
        
        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const results = await Promise.all(executions);
      const executionCount = results.length;
      
      // Should complete at least 10 executions in 2 seconds
      expect(executionCount).toBeGreaterThan(10);
    });
  });

  describe('Memory Efficiency Tests', () => {
    it('should handle large graphs without excessive memory usage', async () => {
      const largeGraph: Graph = {
        id: 'large-memory-test',
        seed: 12345,
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `node${i}`,
          type: 'WeightedChoice' as const,
          choices: [
            { text: `Choice ${i}A`, weight: 1 },
            { text: `Choice ${i}B`, weight: 1 }
          ]
        })).concat([
          {
            id: 'output1',
            type: 'Output' as const,
            inputs: ['node0'] // Just connect to first node for simplicity
          }
        ]),
        edges: [
          { id: 'e1', source: 'node0', target: 'output1' }
        ]
      };
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      await executeGraph(largeGraph);
      
      const peakMemory = process.memoryUsage().heapUsed;
      const memoryUsageMB = (peakMemory - initialMemory) / (1024 * 1024);
      
      // Should not use more than 100MB for 100 nodes
      expect(memoryUsageMB).toBeLessThan(100);
    });
  });

  describe('Performance Tracking and Reporting', () => {
    it('should generate performance report', async () => {
      const performanceResults: Record<string, number> = {};
      
      for (const benchmark of PERFORMANCE_BENCHMARKS) {
        const startTime = performance.now();
        await executeGraph(benchmark.graph);
        const executionTime = performance.now() - startTime;
        
        performanceResults[benchmark.name] = executionTime;
      }
      
      // Log performance results for monitoring
      console.log('Performance Benchmark Results:', performanceResults);
      
      // All benchmarks should complete
      expect(Object.keys(performanceResults)).toHaveLength(PERFORMANCE_BENCHMARKS.length);
    });
  });

});

// Export benchmark data for external performance monitoring
export { PERFORMANCE_BENCHMARKS };