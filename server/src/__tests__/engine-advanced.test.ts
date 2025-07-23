// server/src/__tests__/engine-advanced.test.ts
// Tests for Epic 7 advanced node integration in the execution engine

import { executeGraph } from '../engine';
import { Graph } from '../../../packages/core/graphSchema';

describe('Engine Advanced Node Integration', () => {
  describe('WeightedAdvanced Node', () => {
    test('should execute WeightedAdvanced node with linear distribution', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'weighted-1',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'apple', weight: 3 },
              { value: 'banana', weight: 2 },
              { value: 'cherry', weight: 1 }
            ],
            distributionConfig: {
              type: 'linear',
              normalize: true
            }
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['weighted-1']
          }
        ],
        seed: 12345
      };

      const result = await executeGraph(graph);
      
      expect(result.outputs).toHaveLength(1);
      expect(['apple', 'banana', 'cherry']).toContain(result.outputs[0]);
    });

    test('should execute WeightedAdvanced node with exponential distribution', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'weighted-exp',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'common', weight: 4 },
              { value: 'rare', weight: 1 }
            ],
            distributionConfig: {
              type: 'exponential',
              parameters: { factor: 2 },
              normalize: true
            }
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['weighted-exp']
          }
        ],
        seed: 54321
      };

      const result = await executeGraph(graph);
      
      expect(result.outputs).toHaveLength(1);
      expect(['common', 'rare']).toContain(result.outputs[0]);
    });

    test('should execute WeightedAdvanced node with gaussian distribution', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'weighted-gauss',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'first', weight: 2 },
              { value: 'second', weight: 3 },
              { value: 'third', weight: 1 }
            ],
            distributionConfig: {
              type: 'gaussian',
              parameters: { mean: 0.5, std: 0.2 },
              normalize: true
            }
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['weighted-gauss']
          }
        ],
        seed: 9999
      };

      const result = await executeGraph(graph);
      
      expect(result.outputs).toHaveLength(1);
      expect(['first', 'second', 'third']).toContain(result.outputs[0]);
    });

    test('should handle WeightedAdvanced node with default configuration', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'weighted-default',
            type: 'WeightedAdvanced'
            // No choices or distributionConfig - should use defaults
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['weighted-default']
          }
        ],
        seed: 1111
      };

      const result = await executeGraph(graph);
      
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0]).toBe(''); // Empty choices should return empty string
    });

    test('should be deterministic with same seed', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'weighted-det',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'A', weight: 2 },
              { value: 'B', weight: 2 },
              { value: 'C', weight: 2 }
            ]
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['weighted-det']
          }
        ],
        seed: 42
      };

      const result1 = await executeGraph(graph);
      const result2 = await executeGraph(graph);
      
      expect(result1.outputs).toEqual(result2.outputs);
    });

    test('should produce different results with different seeds', async () => {
      const graph1: Graph = {
        nodes: [
          {
            id: 'weighted-diff',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'X', weight: 1 },
              { value: 'Y', weight: 1 },
              { value: 'Z', weight: 1 }
            ]
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['weighted-diff']
          }
        ],
        seed: 100
      };

      // With 3 equal-weight choices, there's a good chance they'll be different
      // But we'll run multiple times to increase confidence
      const allResults1: string[] = [];
      const allResults2: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        const g1 = { ...graph1, seed: 100 + i };
        const g2 = { ...graph1, seed: 500 + i };
        allResults1.push((await executeGraph(g1)).outputs[0]);
        allResults2.push((await executeGraph(g2)).outputs[0]);
      }
      
      // At least some results should be different
      expect(allResults1).not.toEqual(allResults2);
    });
  });

  describe('Mixed Node Types', () => {
    test('should execute graph with both basic and advanced nodes', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'basic-weighted',
            type: 'WeightedChoice',
            choices: [
              { value: 'basic1', weight: 1 },
              { value: 'basic2', weight: 1 }
            ]
          },
          {
            id: 'advanced-weighted',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'advanced1', weight: 2 },
              { value: 'advanced2', weight: 1 }
            ],
            distributionConfig: {
              type: 'exponential',
              parameters: { factor: 1.5 }
            }
          },
          {
            id: 'concat-1',
            type: 'Concat',
            inputs: ['basic-weighted', 'advanced-weighted']
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['concat-1']
          }
        ],
        seed: 7777
      };

      const result = await executeGraph(graph);
      
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0]).toMatch(/^(basic1|basic2)(advanced1|advanced2)$/);
    });

    test('should handle complex graph with variables and advanced nodes', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'set-var',
            type: 'SetVariable',
            key: 'mood',
            value: 'happy'
          },
          {
            id: 'get-var',
            type: 'GetVariable',
            key: 'mood',
            inputs: ['set-var'] // Ensure variable is set first
          },
          {
            id: 'weighted-adv',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'smile', weight: 5 },
              { value: 'laugh', weight: 3 },
              { value: 'grin', weight: 2 }
            ],
            distributionConfig: {
              type: 'linear',
              minWeight: 1
            }
          },
          {
            id: 'final-concat',
            type: 'Concat',
            inputs: ['get-var', 'weighted-adv']
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['final-concat']
          }
        ],
        seed: 3333
      };

      const result = await executeGraph(graph);
      
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0]).toMatch(/^happy(smile|laugh|grin)$/);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid WeightedAdvanced configuration gracefully', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'invalid-weighted',
            type: 'WeightedAdvanced',
            choices: [
              { value: 'test', weight: -1 } // Invalid negative weight
            ]
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['invalid-weighted']
          }
        ],
        seed: 8888
      };

      // Should not throw, but handle gracefully
      const result = await executeGraph(graph);
      expect(result.outputs).toHaveLength(1);
      // Should still return a result (the node handles negative weights)
      expect(result.outputs[0]).toBe('test');
    });
  });

  describe('Performance', () => {
    test('should execute large graph with advanced nodes efficiently', async () => {
      // Create a graph with multiple advanced nodes
      const nodes = [];
      
      // Create 10 WeightedAdvanced nodes
      for (let i = 0; i < 10; i++) {
        nodes.push({
          id: `weighted-${i}`,
          type: 'WeightedAdvanced' as const,
          choices: [
            { value: `option-${i}-a`, weight: 3 },
            { value: `option-${i}-b`, weight: 2 },
            { value: `option-${i}-c`, weight: 1 }
          ],
          distributionConfig: {
            type: 'exponential' as const,
            parameters: { factor: 1.2 }
          }
        });
      }
      
      // Add output node
      nodes.push({
        id: 'output-1',
        type: 'Output' as const,
        inputs: ['weighted-0'] // Just output from first node
      });

      const graph: Graph = {
        nodes,
        seed: 4444
      };

      const startTime = performance.now();
      const result = await executeGraph(graph);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0]).toMatch(/^option-0-[abc]$/);
      expect(executionTime).toBeLessThan(100); // Should complete in <100ms
    });
  });

  describe('Context Detection', () => {
    test('should use basic context for graphs with only basic nodes', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'basic-weighted',
            type: 'WeightedChoice',
            choices: [{ value: 'basic', weight: 1 }]
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['basic-weighted']
          }
        ],
        seed: 5555
      };

      const result = await executeGraph(graph);
      expect(result.outputs).toEqual(['basic']);
    });

    test('should use advanced context for graphs with advanced nodes', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'advanced-weighted',
            type: 'WeightedAdvanced',
            choices: [{ value: 'advanced', weight: 1 }]
          },
          {
            id: 'output-1',
            type: 'Output',
            inputs: ['advanced-weighted']
          }
        ],
        seed: 6666
      };

      const result = await executeGraph(graph);
      expect(result.outputs).toEqual(['advanced']);
    });
  });
});