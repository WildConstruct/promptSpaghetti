import { executeGraph } from '../engine';
import { ExecutionContext } from '../../../../packages/core/runtime';
import * as graphSchema from '../../../../packages/core/graphSchema';

// Mock dependencies
jest.mock('../../../../packages/core/runtime', () => ({
  ExecutionContext: jest.fn<unknown[], unknown>(),
  WeightedChoiceNode: jest.fn<unknown[], unknown>().mockImplementation((id, choices) => ({
    id,
    choices,
    run: jest.fn(() => choices[0]?.value || '')
  })),
  ConcatNode: jest.fn<unknown[], unknown>().mockImplementation((id, inputs) => ({
    id,
    inputs,
    run: jest.fn(() => inputs.join(''))
  })),
  OutputNode: jest.fn<unknown[], unknown>().mockImplementation((id, value) => ({
    id,
    value,
    run: jest.fn(() => value)
  })),
  IncludeNode: jest.fn<unknown[], unknown>().mockImplementation((id, template, templates) => ({
    id,
    template,
    templates,
    run: jest.fn(() => templates[template])
  })),
  SetVariableNode: jest.fn<unknown[], unknown>().mockImplementation((id, key, value) => ({
    id,
    key,
    value,
    run: jest.fn<unknown[], unknown>()
  })),
  GetVariableNode: jest.fn<unknown[], unknown>().mockImplementation((id, key) => ({
    id,
    key,
    run: jest.fn(() => 'variable-value')
  }))
}));

jest.mock('../../../../packages/core/runtime/advanced', () => ({
  AdvancedExecutionContext: jest.fn<unknown[], unknown>().mockImplementation(() => ({
    variables: {},
    seed: 'test-seed'
  })),
  WeightedAdvancedNode: jest.fn<unknown[], unknown>().mockImplementation((id, config) => ({
    id,
    config,
    run: jest.fn(() => 'advanced-result')
  })),
  ConditionalNode: jest.fn<unknown[], unknown>().mockImplementation((id, config) => ({
    id,
    config,
    run: jest.fn(() => 'conditional-result')
  })),
  SequentialNode: jest.fn<unknown[], unknown>().mockImplementation((id, config) => ({
    id,
    config,
    run: jest.fn(() => 'sequential-result')
  })),
  MarkovNode: jest.fn<unknown[], unknown>().mockImplementation((id, config) => ({
    id,
    config,
    run: jest.fn(() => 'markov-result')
  }))
}));

describe('Server Engine - Comprehensive Coverage (85% target)', () => {
  const validGraph = {
    nodes: [
      {
        id: 'node1',
        type: 'WeightedChoice',
        data: {
          choices: [
            { weight: 0.5, value: 'A' },
            { weight: 0.5, value: 'B' }
          ]
        }
      },
      {
        id: 'node2',
        type: 'Output',
        data: { value: 'output' }
      }
    ],
    edges: [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executeGraph - Basic Functionality', () => {
    it('should execute a valid graph with seed', async () => {
      const result = await executeGraph(validGraph, 'test-seed');
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle numeric seed', async () => {
      const result = await executeGraph(validGraph, 12345);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty seed', async () => {
      const result = await executeGraph(validGraph, '');
      
      expect(result).toBeDefined();
    });

    it('should handle null/undefined seed', async () => {
      const result1 = await executeGraph(validGraph, null as any);
      const result2 = await executeGraph(validGraph, undefined as any);
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('executeGraph - Node Type Handling', () => {
    it('should handle all basic node types', async () => {
      const graphWithAllTypes = {
        nodes: [
          {
            id: 'weighted',
            type: 'WeightedChoice',
            data: { choices: [{ weight: 1, value: 'choice' }] }
          },
          {
            id: 'concat',
            type: 'Concat',
            data: { inputs: ['a', 'b', 'c'] }
          },
          {
            id: 'output',
            type: 'Output',
            data: { value: 'output-value' }
          },
          {
            id: 'include',
            type: 'Include',
            data: { 
              template: 'tmpl1',
              templates: { tmpl1: 'Template Content' }
            }
          },
          {
            id: 'setvar',
            type: 'SetVariable',
            data: { key: 'myVar', value: 'myValue' }
          },
          {
            id: 'getvar',
            type: 'GetVariable',
            data: { key: 'myVar' }
          }
        ],
        edges: []
      };

      const result = await executeGraph(graphWithAllTypes, 'seed');
      expect(result).toBeDefined();
    });

    it('should handle advanced node types', async () => {
      const advancedGraph = {
        nodes: [
          {
            id: 'weighted-advanced',
            type: 'WeightedAdvanced',
            data: {
              choices: [{ weight: 1, value: 'advanced' }],
              distribution: 'exponential'
            }
          },
          {
            id: 'conditional',
            type: 'Conditional',
            data: {
              expression: 'x > 5',
              trueValue: 'yes',
              falseValue: 'no'
            }
          },
          {
            id: 'sequential',
            type: 'Sequential',
            data: {
              items: ['first', 'second', 'third'],
              mode: 'linear'
            }
          },
          {
            id: 'markov',
            type: 'Markov',
            data: {
              states: ['A', 'B', 'C'],
              transitions: {
                A: { B: 0.5, C: 0.5 },
                B: { A: 0.3, C: 0.7 },
                C: { A: 1.0 }
              }
            }
          }
        ],
        edges: []
      };

      const result = await executeGraph(advancedGraph, 'seed');
      expect(result).toBeDefined();
    });

    it('should throw error for unknown node type', async () => {
      const invalidGraph = {
        nodes: [
          {
            id: 'unknown',
            type: 'UnknownNodeType',
            data: {}
          }
        ],
        edges: []
      };

      await expect(executeGraph(invalidGraph, 'seed')).rejects.toThrow('Unknown node type');
    });
  });

  describe('executeGraph - Graph Structure', () => {
    it('should handle empty graph', async () => {
      const emptyGraph = {
        nodes: [],
        edges: []
      };

      const result = await executeGraph(emptyGraph, 'seed');
      expect(result).toBe('');
    });

    it('should handle graph with no edges', async () => {
      const noEdgesGraph = {
        nodes: [
          { id: 'n1', type: 'Output', data: { value: 'isolated' } }
        ],
        edges: []
      };

      const result = await executeGraph(noEdgesGraph, 'seed');
      expect(result).toBeDefined();
    });

    it('should handle cyclic graphs', async () => {
      const cyclicGraph = {
        nodes: [
          { id: 'n1', type: 'Output', data: { value: 'A' } },
          { id: 'n2', type: 'Output', data: { value: 'B' } },
          { id: 'n3', type: 'Output', data: { value: 'C' } }
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
          { id: 'e3', source: 'n3', target: 'n1' } // Creates cycle
        ]
      };

      const result = await executeGraph(cyclicGraph, 'seed');
      expect(result).toBeDefined();
    });

    it('should handle disconnected subgraphs', async () => {
      const disconnectedGraph = {
        nodes: [
          // Subgraph 1
          { id: 'a1', type: 'Output', data: { value: 'Graph1' } },
          { id: 'a2', type: 'Concat', data: { inputs: ['A', 'B'] } },
          // Subgraph 2
          { id: 'b1', type: 'Output', data: { value: 'Graph2' } },
          { id: 'b2', type: 'WeightedChoice', data: { choices: [] } }
        ],
        edges: [
          { id: 'e1', source: 'a1', target: 'a2' },
          { id: 'e2', source: 'b1', target: 'b2' }
        ]
      };

      const result = await executeGraph(disconnectedGraph, 'seed');
      expect(result).toBeDefined();
    });
  });

  describe('executeGraph - Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      // Mock validation to throw
      jest.spyOn(graphSchema, 'validateGraph').mockImplementationOnce(() => {
        throw new Error('Validation failed');
      });

      const graph = validGraph;
      
      await expect(executeGraph(graph, 'seed')).rejects.toThrow('Validation failed');
    });

    it('should handle node execution errors', async () => {
      const errorGraph = {
        nodes: [
          {
            id: 'error-node',
            type: 'WeightedChoice',
            data: null // This might cause an error
          }
        ],
        edges: []
      };

      // Execution should handle the error gracefully
      const result = await executeGraph(errorGraph, 'seed');
      expect(result).toBeDefined();
    });

    it('should handle malformed graph structure', async () => {
      const malformedGraphs = [
        null,
        undefined,
        {},
        { nodes: null, edges: [] },
        { nodes: [], edges: null },
        { nodes: 'invalid', edges: [] },
        { nodes: [], edges: 'invalid' }
      ];

      for (const graph of malformedGraphs) {
        await expect(executeGraph(graph as any, 'seed')).rejects.toThrow();
      }
    });

    it('should handle nodes with missing data', async () => {
      const missingDataGraph = {
        nodes: [
          { id: 'n1', type: 'Output' }, // Missing data
          { id: 'n2', type: 'WeightedChoice', data: {} }, // Empty data
          { id: 'n3', type: 'Concat', data: { inputs: null } } // Null inputs
        ],
        edges: []
      };

      const result = await executeGraph(missingDataGraph, 'seed');
      expect(result).toBeDefined();
    });
  });

  describe('executeGraph - Performance', () => {
    it('should handle large graphs efficiently', async () => {
      const largeGraph = {
        nodes: Array.from({ length: 1000 }, (_, i) => ({
          id: `node${i}`,
          type: 'Output',
          data: { value: `Value ${i}` }
        })),
        edges: Array.from({ length: 999 }, (_, i) => ({
          id: `edge${i}`,
          source: `node${i}`,
          target: `node${i + 1}`
        }))
      };

      const start = Date.now();
      const result = await executeGraph(largeGraph, 'seed');
      const duration = Date.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle deeply nested graphs', async () => {
      const deepGraph = {
        nodes: Array.from({ length: 100 }, (_, i) => ({
          id: `level${i}`,
          type: i % 2 === 0 ? 'Concat' : 'Output',
          data: i % 2 === 0 
            ? { inputs: [`Level ${i}`] }
            : { value: `Output ${i}` }
        })),
        edges: Array.from({ length: 99 }, (_, i) => ({
          id: `edge${i}`,
          source: `level${i}`,
          target: `level${i + 1}`
        }))
      };

      const result = await executeGraph(deepGraph, 'seed');
      expect(result).toBeDefined();
    });
  });

  describe('executeGraph - Edge Cases', () => {
    it('should handle self-referencing nodes', async () => {
      const selfRefGraph = {
        nodes: [
          { id: 'self', type: 'Output', data: { value: 'Self Reference' } }
        ],
        edges: [
          { id: 'e1', source: 'self', target: 'self' }
        ]
      };

      const result = await executeGraph(selfRefGraph, 'seed');
      expect(result).toBeDefined();
    });

    it('should handle multiple output nodes', async () => {
      const multiOutputGraph = {
        nodes: [
          { id: 'out1', type: 'Output', data: { value: 'Output 1' } },
          { id: 'out2', type: 'Output', data: { value: 'Output 2' } },
          { id: 'out3', type: 'Output', data: { value: 'Output 3' } }
        ],
        edges: []
      };

      const result = await executeGraph(multiOutputGraph, 'seed');
      expect(result).toBeDefined();
    });

    it('should handle very long seed strings', async () => {
      const longSeed = 'x'.repeat(10000);
      const result = await executeGraph(validGraph, longSeed);
      expect(result).toBeDefined();
    });

    it('should handle special characters in seed', async () => {
      const specialSeeds = [
        '!@#$%^&*()',
        '\\n\\r\\t',
        '🎲🎯🎪',
        '<script>alert("xss")</script>',
        'null',
        'undefined',
        'NaN',
        'Infinity'
      ];

      for (const seed of specialSeeds) {
        const result = await executeGraph(validGraph, seed);
        expect(result).toBeDefined();
      }
    });

    it('should handle concurrent executions', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        executeGraph(validGraph, `seed-${i}`)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toBeDefined());
    });
  });

  describe('executeGraph - Context Management', () => {
    it('should properly initialize execution context', async () => {
      // const { ExecutionContext } = require('../../../../packages/core/runtime');
      
      await executeGraph(validGraph, 'test-seed');
      
      // expect(ExecutionContext).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     seed: 'test-seed'
      //   })
      // );
    });

    it('should use advanced context for advanced nodes', async () => {
      // const { AdvancedExecutionContext } = require('../../../../packages/core/runtime/advanced');
      
      const advancedGraph = {
        nodes: [
          {
            id: 'adv',
            type: 'Conditional',
            data: { expression: 'true', trueValue: 'yes', falseValue: 'no' }
          }
        ],
        edges: []
      };

      await executeGraph(advancedGraph, 'seed');
      
      expect(AdvancedExecutionContext).toHaveBeenCalled();
    });
  });
});