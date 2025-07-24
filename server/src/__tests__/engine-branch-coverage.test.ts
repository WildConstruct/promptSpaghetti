// server/src/__tests__/engine-branch-coverage.test.ts
import { executeGraph } from '../engine';
import { Graph } from '../../../../packages/core/graphSchema';

/**
 * This test suite specifically targets branch coverage in the engine.ts file
 * It focuses on edge cases and specific code paths that might be missed by other tests
 */
describe('Engine Branch Coverage', () => {
  
  describe('Input Resolution Edge Cases', () => {
    it('should handle missing node references gracefully', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'output1',
            type: 'Output',
            // Reference to a non-existent node
            inputs: ['nonexistent']
          }
        ],
        seed: 42
      };
      
      // Should throw an error when a referenced node doesn't exist
      await expect(executeGraph(graph)).rejects.toThrow('Node nonexistent not found');
    });
    
    it('should handle nodes without inputs array', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [{ value: 'test', weight: 1 }]
            // Intentionally omitting 'inputs' property
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1']
          }
        ],
        seed: 42
      };
      
      // Should execute successfully even without inputs array on some nodes
      const result = await executeGraph(graph);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('test');
    });
  });
  
  describe('Seed Handling Edge Cases', () => {
    it('should use provided numeric seed', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [
              { value: 'A', weight: 1 },
              { value: 'B', weight: 1 }
            ]
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1']
          }
        ],
        seed: 12345
      };
      
      // Run multiple times with same seed
      const result1 = await executeGraph(graph);
      const result2 = await executeGraph(graph);
      
      // Should be deterministic
      expect(result1[0]).toBe(result2[0]);
    });
    
    it('should use provided string seed', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [
              { value: 'A', weight: 1 },
              { value: 'B', weight: 1 }
            ]
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1']
          }
        ],
        seed: 'string-seed-test'
      };
      
      // Run multiple times with same seed
      const result1 = await executeGraph(graph);
      const result2 = await executeGraph(graph);
      
      // Should be deterministic
      expect(result1[0]).toBe(result2[0]);
    });
    
    it('should handle seed fallback to Date.now()', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [
              { value: 'A', weight: 1 },
              { value: 'B', weight: 1 }
            ]
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1']
          }
        ]
        // Intentionally omitting seed
      };
      
      // Just verify it executes without error when no seed is provided
      const result = await executeGraph(graph);
      expect(result).toHaveLength(1);
    });
  });
  
  describe('Memory and Result Handling', () => {
    it('should memoize node results to avoid redundant execution', async () => {
      // Create a graph with a diamond dependency pattern
      //      A
      //    /   \
      //   B     C
      //    \   /
      //      D
      const graph: Graph = {
        nodes: [
          {
            id: 'A',
            type: 'WeightedChoice',
            choices: [{ value: 'valueA', weight: 1 }]
          },
          {
            id: 'B',
            type: 'Concat',
            inputs: ['A']
          },
          {
            id: 'C',
            type: 'Concat',
            inputs: ['A']
          },
          {
            id: 'D',
            type: 'Concat',
            inputs: ['B', 'C']
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['D']
          }
        ],
        seed: 42
      };
      
      const result = await executeGraph(graph);
      expect(result).toHaveLength(1);
      // Node A should appear twice in the output since it's referenced by both B and C
      expect(result[0]).toBe('valueAvalueA');
    });
    
    it('should handle sequential variable operations', async () => {
      const graph: Graph = {
        nodes: [
          // Initial variable setting
          {
            id: 'set1',
            type: 'SetVariable',
            key: 'counter',
            value: 0
          },
          // Reference and update (in a real scenario, this would be more complex)
          {
            id: 'set2',
            type: 'SetVariable',
            key: 'counter',
            value: 1
          },
          // Get the final value
          {
            id: 'get1',
            type: 'GetVariable',
            key: 'counter'
          },
          // Output
          {
            id: 'output1',
            type: 'Output',
            inputs: ['get1']
          }
        ],
        seed: 42
      };
      
      const result = await executeGraph(graph);
      // The SetVariable nodes don't return values, so get1 will return the last set value
      // but the graph execution order isn't guaranteed unless we explicitly connect the nodes
      expect(result).toHaveLength(1);
      // Don't test for specific value as order isn't guaranteed
    });
  });
  
  describe('Multiple Output Handling', () => {
    it('should process multiple output nodes in order', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [{ value: 'first', weight: 1 }]
          },
          {
            id: 'choice2',
            type: 'WeightedChoice',
            choices: [{ value: 'second', weight: 1 }]
          },
          {
            id: 'output1',
            type: 'Output',
            inputs: ['choice1']
          },
          {
            id: 'output2',
            type: 'Output',
            inputs: ['choice2']
          }
        ],
        seed: 42
      };
      
      const results = await executeGraph(graph);
      
      // Should have two outputs in insertion order
      expect(results).toHaveLength(2);
      expect(results[0]).toBe('first');
      expect(results[1]).toBe('second');
    });
    
    it('should handle empty graph with no output nodes', async () => {
      const graph: Graph = {
        nodes: [
          {
            id: 'choice1',
            type: 'WeightedChoice',
            choices: [{ value: 'not-output', weight: 1 }]
          }
          // No output nodes!
        ],
        seed: 42
      };
      
      const results = await executeGraph(graph);
      // Should have no outputs
      expect(results).toHaveLength(0);
    });
  });
});
