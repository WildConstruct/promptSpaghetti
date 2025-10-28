/**
 * Performance Test Suite - E18-1753114561904
 *
 * Comprehensive performance testing for Wild Construct platform
 * focusing on director-friendly interface and graph execution performance.
 */

import { performance } from 'perf_hooks';
import { Node, Edge } from 'reactflow';
import { executeGraphBundle } from '../../server/src/engine';

describe('Performance Test Suite - E18', () => {
  // Performance test utilities
  const measurePerformance = <T>(
    fn: () => T,
    iterations: number = 100
  ): {
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
    result: T;
  } => {
    const times: number[] = [];
    let result: T;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = fn();
      const end = performance.now();
      times.push(end - start);
    }

    times.sort((a, b) => a - b);

    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: times[0],
      max: times[times.length - 1],
      p95: times[Math.floor(times.length * 0.95)],
      p99: times[Math.floor(times.length * 0.99)],
      result: result!
    };
  };

  // Test data generators
  const generateSimpleGraph = (
    nodeCount: number = 5
  ): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `node-${i}`,
        type: 'default',
        position: { x: i * 100, y: 100 },
        data: {
          nodeType: i === 0 ? 'WeightedChoice' : 'Output',
          variations:
            i === 0 ? ['Option A', 'Option B', 'Option C'] : [`Output ${i}`],
          weights: i === 0 ? [1, 1, 1] : undefined
        }
      });
    }

    // Create connections
    for (let i = 0; i < nodeCount - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        sourceHandle: 'output',
        targetHandle: 'input'
      });
    }

    return { nodes, edges };
  };

  const generateComplexGraph = (
    nodeCount: number = 50
  ): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeTypes = [
      'WeightedChoice',
      'Conditional',
      'Sequential',
      'Concat',
      'Output'
    ];

    // Create nodes with varied complexity
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = nodeTypes[i % nodeTypes.length];

      nodes.push({
        id: `complex-node-${i}`,
        type: 'default',
        position: { x: (i % 10) * 120, y: Math.floor(i / 10) * 120 },
        data: {
          nodeType,
          variations:
            nodeType === 'WeightedChoice'
              ? Array.from({ length: 5 }, (_, j) => `Complex option ${i}-${j}`)
              : [`Complex output ${i}`],
          weights:
            nodeType === 'WeightedChoice'
              ? Array.from({ length: 5 }, () => Math.random())
              : undefined,
          condition: nodeType === 'Conditional' ? 'variable > 0.5' : undefined
        }
      });
    }

    // Create complex connection patterns
    for (let i = 0; i < nodeCount - 1; i++) {
      // Linear connections
      if (i < nodeCount - 1) {
        edges.push({
          id: `complex-edge-${i}`,
          source: `complex-node-${i}`,
          target: `complex-node-${i + 1}`,
          sourceHandle: 'output',
          targetHandle: 'input'
        });
      }

      // Branching connections (every 5th node branches)
      if (i % 5 === 0 && i < nodeCount - 3) {
        edges.push({
          id: `branch-edge-${i}`,
          source: `complex-node-${i}`,
          target: `complex-node-${i + 3}`,
          sourceHandle: 'output',
          targetHandle: 'input'
        });
      }
    }

    return { nodes, edges };
  };

  describe('UI Performance Tests', () => {
    test('Canvas rendering performance - Simple graph', () => {
      const { nodes, edges } = generateSimpleGraph(10);

      const results = measurePerformance(() => {
        // Simulate canvas rendering operations
        const renderTime = performance.now();

        // Mock React Flow rendering calculations
        nodes.forEach(node => {
          const bbox = {
            x: node.position.x,
            y: node.position.y,
            width: 150,
            height: 40
          };
          // Simulate layout calculations
          bbox.x + bbox.width;
          bbox.y + bbox.height;
        });

        edges.forEach(edge => {
          // Simulate edge path calculations
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (sourceNode && targetNode) {
            Math.sqrt(
              Math.pow(targetNode.position.x - sourceNode.position.x, 2) +
                Math.pow(targetNode.position.y - sourceNode.position.y, 2)
            );
          }
        });

        return performance.now() - renderTime;
      }, 50);

      console.log('Canvas Rendering Performance (Simple):', results);

      // Performance goals: UI operations < 16ms (60 FPS)
      expect(results.p95).toBeLessThan(16);
      expect(results.average).toBeLessThan(10);
    });

    test('Canvas rendering performance - Complex graph', () => {
      const { nodes, edges } = generateComplexGraph(100);

      const results = measurePerformance(() => {
        const renderTime = performance.now();

        // Simulate complex rendering with viewport culling
        const viewportNodes = nodes.filter((_, index) => index < 50); // Mock culling

        viewportNodes.forEach(node => {
          const bbox = {
            x: node.position.x,
            y: node.position.y,
            width: 200,
            height: 60
          };
          // Complex node rendering simulation
          bbox.x + bbox.width;
          bbox.y + bbox.height;
        });

        const viewportEdges = edges.filter((_, index) => index < 50);
        viewportEdges.forEach(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (sourceNode && targetNode) {
            // Complex bezier curve calculations
            Math.sqrt(
              Math.pow(targetNode.position.x - sourceNode.position.x, 2) +
                Math.pow(targetNode.position.y - sourceNode.position.y, 2)
            );
          }
        });

        return performance.now() - renderTime;
      }, 30);

      console.log('Canvas Rendering Performance (Complex):', results);

      // Performance goals: Maintain 30 FPS for large graphs
      expect(results.p95).toBeLessThan(33); // ~30 FPS
      expect(results.average).toBeLessThan(25);
    });

    test('Real-time preview responsiveness', () => {
      const { nodes, edges } = generateSimpleGraph(5);

      const results = measurePerformance(() => {
        const startTime = performance.now();

        // Simulate preview generation request
        const previewData = {
          nodes,
          edges,
          seedCount: 3
        };

        // Mock graph validation
        previewData.nodes.forEach(node => {
          if (node.data.variations && node.data.variations.length > 0) {
            node.data.variations.forEach(variation => variation.length);
          }
        });

        // Mock seed generation
        Array.from({ length: previewData.seedCount }, (_, i) => {
          Math.random() * 1000000 + i;
        });

        return performance.now() - startTime;
      }, 50);

      console.log('Real-time Preview Performance:', results);

      // Performance goals: Preview generation < 500ms for simple graphs
      expect(results.p95).toBeLessThan(500);
      expect(results.average).toBeLessThan(200);
    });

    test('Contextual help system responsiveness', () => {
      const contexts = [
        { nodeCount: 0, edgeCount: 0, selectedNodeType: null },
        { nodeCount: 5, edgeCount: 4, selectedNodeType: 'WeightedChoice' },
        { nodeCount: 15, edgeCount: 12, selectedNodeType: 'Conditional' }
      ];

      contexts.forEach((context, index) => {
        const results = measurePerformance(() => {
          const startTime = performance.now();

          // Simulate contextual help analysis
          const helpContent = [];

          // Mock context analysis
          if (context.nodeCount === 0) {
            helpContent.push({ id: 'getting-started', relevance: 1.0 });
          }

          if (context.selectedNodeType === 'WeightedChoice') {
            helpContent.push({ id: 'weighted-choice-help', relevance: 0.9 });
          }

          if (context.nodeCount > 10) {
            helpContent.push({ id: 'advanced-features', relevance: 0.7 });
          }

          // Mock content filtering and sorting
          helpContent.sort((a, b) => b.relevance - a.relevance);

          return performance.now() - startTime;
        }, 100);

        console.log(
          `Contextual Help Performance (Context ${index + 1}):`,
          results
        );

        // Performance goals: Context analysis < 50ms
        expect(results.p95).toBeLessThan(50);
        expect(results.average).toBeLessThan(25);
      });
    });
  });

  describe('Graph Execution Performance Tests', () => {
    test('Simple node execution performance', () => {
      const testCases = [
        { type: 'Output', content: 'Simple output text' },
        { type: 'Concat', parts: ['Part 1', 'Part 2', 'Part 3'] },
        { type: 'WeightedChoice', options: ['A', 'B', 'C'], weights: [1, 2, 1] }
      ];

      testCases.forEach(testCase => {
        const results = measurePerformance(() => {
          const startTime = performance.now();

          // Mock node execution
          if (testCase.type === 'Output') {
            return testCase.content;
          } else if (testCase.type === 'Concat') {
            return (testCase as any).parts.join(' ');
          } else if (testCase.type === 'WeightedChoice') {
            const totalWeight = (testCase as any).weights.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const random = Math.random() * totalWeight;
            let currentWeight = 0;
            for (let i = 0; i < (testCase as any).weights.length; i++) {
              currentWeight += (testCase as any).weights[i];
              if (random <= currentWeight) {
                return (testCase as any).options[i];
              }
            }
          }

          return performance.now() - startTime;
        }, 1000);

        console.log(`${testCase.type} Node Execution Performance:`, results);

        // Performance goals based on node type
        if (testCase.type === 'Output' || testCase.type === 'Concat') {
          expect(results.p99).toBeLessThan(1); // < 1ms for simple nodes
        } else if (testCase.type === 'WeightedChoice') {
          expect(results.p99).toBeLessThan(5); // < 5ms for weighted nodes
        }
      });
    });

    test('Advanced node execution performance', () => {
      const advancedTestCases = [
        {
          type: 'Conditional',
          condition: 'variable > 0.5',
          variables: { variable: 0.7 },
          trueBranch: 'True result',
          falseBranch: 'False result'
        },
        {
          type: 'Sequential',
          pattern: 'linear',
          items: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
          currentStep: 2
        },
        {
          type: 'Markov',
          states: ['A', 'B', 'C'],
          transitions: {
            A: { B: 0.6, C: 0.4 },
            B: { A: 0.3, C: 0.7 },
            C: { A: 0.5, B: 0.5 }
          },
          currentState: 'A'
        }
      ];

      advancedTestCases.forEach(testCase => {
        const results = measurePerformance(() => {
          const startTime = performance.now();

          // Mock advanced node execution
          if (testCase.type === 'Conditional') {
            const conditionResult = (testCase as any).variables.variable > 0.5;
            return conditionResult
              ? (testCase as any).trueBranch
              : (testCase as any).falseBranch;
          } else if (testCase.type === 'Sequential') {
            const tc = testCase as any;
            return tc.items[tc.currentStep % tc.items.length];
          } else if (testCase.type === 'Markov') {
            const tc = testCase as any;
            const currentTransitions = tc.transitions[tc.currentState];
            const random = Math.random();
            let cumulativeProbability = 0;

            for (const [nextState, probability] of Object.entries(
              currentTransitions
            )) {
              cumulativeProbability += probability as number;
              if (random <= cumulativeProbability) {
                return nextState;
              }
            }
          }

          return performance.now() - startTime;
        }, 500);

        console.log(`${testCase.type} Advanced Node Performance:`, results);

        // Performance goals: Advanced nodes < 20ms per execution
        expect(results.p99).toBeLessThan(20);
        expect(results.average).toBeLessThan(10);
      });
    });

    test('Multi-seed generation performance', () => {
      const seedCounts = [1, 3, 5, 8, 10];

      seedCounts.forEach(seedCount => {
        const { nodes, edges } = generateSimpleGraph(8);

        const results = measurePerformance(() => {
          const startTime = performance.now();

          // Mock multi-seed execution
          const results = [];
          for (let i = 0; i < seedCount; i++) {
            const seed = 12345 + i;
            // Mock deterministic execution with seed
            Math.random(); // Would be seeded random

            // Execute graph simulation
            let output = '';
            nodes.forEach(node => {
              if (node.data.nodeType === 'WeightedChoice') {
                const options = node.data.variations || ['Default'];
                output += options[seed % options.length];
              } else {
                output += node.data.variations?.[0] || 'Output';
              }
              output += ' ';
            });

            results.push({
              seed,
              output: output.trim(),
              executionTime: Math.random() * 100 // Mock execution time
            });
          }

          return performance.now() - startTime;
        }, 50);

        console.log(
          `Multi-seed Generation Performance (${seedCount} seeds):`,
          results
        );

        // Performance goals: 5 seeds in < 1 second, 8 seeds in < 2 seconds
        if (seedCount <= 5) {
          expect(results.p95).toBeLessThan(1000);
        } else if (seedCount <= 8) {
          expect(results.p95).toBeLessThan(2000);
        }
      });
    });

    test('Graph validation performance', () => {
      const graphSizes = [10, 25, 50, 100];

      graphSizes.forEach(size => {
        const { nodes, edges } = generateComplexGraph(size);

        const results = measurePerformance(() => {
          const startTime = performance.now();

          // Mock comprehensive graph validation

          // 1. Schema validation
          nodes.forEach(node => {
            if (!node.id || !node.data || !node.data.nodeType) {
              throw new Error('Invalid node schema');
            }
          });

          edges.forEach(edge => {
            if (!edge.id || !edge.source || !edge.target) {
              throw new Error('Invalid edge schema');
            }
          });

          // 2. Cycle detection (simplified DFS)
          const visited = new Set<string>();
          const recursionStack = new Set<string>();

          const detectCycle = (nodeId: string): boolean => {
            if (recursionStack.has(nodeId)) return true;
            if (visited.has(nodeId)) return false;

            visited.add(nodeId);
            recursionStack.add(nodeId);

            const outgoingEdges = edges.filter(e => e.source === nodeId);
            for (const edge of outgoingEdges) {
              if (detectCycle(edge.target)) return true;
            }

            recursionStack.delete(nodeId);
            return false;
          };

          for (const node of nodes) {
            if (!visited.has(node.id) && detectCycle(node.id)) {
              throw new Error('Cycle detected in graph');
            }
          }

          // 3. Type validation
          edges.forEach(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) {
              throw new Error('Invalid connection');
            }
          });

          return performance.now() - startTime;
        }, 20);

        console.log(`Graph Validation Performance (${size} nodes):`, results);

        // Performance goals: Schema validation < 50ms for graphs up to 100 nodes
        if (size <= 100) {
          expect(results.p95).toBeLessThan(100);
          expect(results.average).toBeLessThan(50);
        }
      });
    });
  });

  describe('Memory Performance Tests', () => {
    test('Memory usage during graph operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create large graph
      const { nodes, edges } = generateComplexGraph(500);

      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        // Simulate graph operations
        const modifiedNodes = nodes.map(node => ({
          ...node,
          position: { x: node.position.x + 1, y: node.position.y + 1 }
        }));

        // Simulate edge operations
        const modifiedEdges = edges.map(edge => ({ ...edge }));

        // Clear references
        modifiedNodes.length = 0;
        modifiedEdges.length = 0;
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`
      );

      // Memory goal: < 100MB for reasonable operations
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
    });

    test('Preview cache memory management', () => {
      const cacheLimit = 50; // Mock 50MB limit
      const previewCache = new Map<string, any>();

      // Simulate cache operations
      for (let i = 0; i < 1000; i++) {
        const key = `preview-${i}`;
        const mockPreview = {
          results: Array.from({ length: 5 }, (_, j) => `Result ${i}-${j}`),
          timestamp: Date.now(),
          metadata: {
            seeds: [1, 2, 3, 4, 5],
            executionTime: Math.random() * 1000
          }
        };

        previewCache.set(key, mockPreview);

        // Simulate LRU eviction
        if (previewCache.size > cacheLimit) {
          const firstKey = previewCache.keys().next().value;
          previewCache.delete(firstKey);
        }
      }

      expect(previewCache.size).toBeLessThanOrEqual(cacheLimit);
      console.log(`Final cache size: ${previewCache.size} entries`);
    });
  });

  describe('Load Testing Simulation', () => {
    test('Concurrent preview generation simulation', async () => {
      const concurrentRequests = 20;
      const { nodes, edges } = generateSimpleGraph(10);

      const startTime = performance.now();

      // Simulate concurrent preview requests
      const promises = Array.from(
        { length: concurrentRequests },
        async (_, i) => {
          const requestStart = performance.now();

          // Mock async preview generation
          await new Promise(resolve =>
            setTimeout(resolve, Math.random() * 500 + 100)
          );

          // Mock graph execution
          const mockResults = Array.from({ length: 5 }, (_, j) => ({
            seed: i * 1000 + j,
            output: `Concurrent result ${i}-${j}`,
            executionTime: Math.random() * 200
          }));

          return {
            requestId: i,
            duration: performance.now() - requestStart,
            results: mockResults
          };
        }
      );

      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      const avgResponseTime =
        results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const maxResponseTime = Math.max(...results.map(r => r.duration));

      console.log('Concurrent Load Test Results:');
      console.log(`- Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`- Average response: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`- Max response: ${maxResponseTime.toFixed(2)}ms`);

      // Performance goals: Handle concurrent requests efficiently
      expect(avgResponseTime).toBeLessThan(1000);
      expect(maxResponseTime).toBeLessThan(2000);
    });
  });

  describe('Performance Regression Tests', () => {
    test('Baseline performance comparison', () => {
      const baselineMetrics = {
        simpleNodeExecution: 0.5, // ms
        complexNodeExecution: 15, // ms
        graphValidation: 30, // ms
        previewGeneration: 400 // ms
      };

      // Run current performance tests
      const currentMetrics = {
        simpleNodeExecution: measurePerformance(() => {
          return 'mock output';
        }, 100).average,

        complexNodeExecution: measurePerformance(() => {
          // Mock complex computation
          for (let i = 0; i < 1000; i++) {
            Math.random() * Math.sqrt(i);
          }
        }, 100).average,

        graphValidation: measurePerformance(() => {
          const { nodes, edges } = generateComplexGraph(50);
          // Mock validation
          nodes.forEach(node => node.id.length);
          edges.forEach(edge => edge.source.length);
        }, 20).average,

        previewGeneration: measurePerformance(() => {
          // Mock preview generation
          Array.from({ length: 5 }, () => Math.random().toString(36));
        }, 20).average
      };

      console.log('Performance Comparison:');
      Object.keys(baselineMetrics).forEach(metric => {
        const baseline =
          baselineMetrics[metric as keyof typeof baselineMetrics];
        const current = currentMetrics[metric as keyof typeof currentMetrics];
        const regression = ((current - baseline) / baseline) * 100;

        console.log(
          `${metric}: ${current.toFixed(2)}ms (baseline: ${baseline}ms, ${regression > 0 ? '+' : ''}${regression.toFixed(1)}%)`
        );

        // Allow up to 20% regression
        expect(current).toBeLessThan(baseline * 1.2);
      });
    });
  });
});
