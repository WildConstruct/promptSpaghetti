/**
 * Tests for GraphEngine
 */

import { GraphEngine } from '../engine';
import { GraphDocument, GraphNode, GraphEdge } from '../types';

describe('GraphEngine', () => {
  let engine: GraphEngine;
  
  beforeEach(() => {
    engine = new GraphEngine();
  });

  describe('Basic functionality', () => {
    it('should create a GraphEngine instance', () => {
      expect(engine).toBeInstanceOf(GraphEngine);
    });

    it('should execute a simple graph', async () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map(),
        edges: new Map(),
        metadata: {
          version: '0.1.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = await engine.execute(graph, 12345);
      
      expect(result.success).toBe(true);
      expect(result.metadata.seed).toBe(12345);
      expect(result.metadata.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should validate a graph', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map(),
        edges: new Map(),
        metadata: {
          version: '0.1.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const validation = engine.validate(graph);
      expect(validation.valid).toBe(true);
    });
  });

  describe('Graph Execution', () => {
    it('should execute a simple Output node', async () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['output1', {
            id: 'output1',
            type: 'Output',
            data: { text: 'Hello World' }
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = await engine.execute(graph, 'test-seed');
      
      expect(result.success).toBe(true);
      expect(result.outputs).toContain('Hello World');
      expect(result.metadata.seed).toBe('test-seed');
    });

    it('should execute a WeightedChoice node deterministically', async () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['choice1', {
            id: 'choice1',
            type: 'WeightedChoice',
            data: {
              choices: [
                { value: 'Option A', weight: 1 },
                { value: 'Option B', weight: 1 }
              ]
            }
          }],
          ['output1', {
            id: 'output1',
            type: 'Output',
            data: { text: '{{choice1}}' }
          }]
        ]),
        edges: new Map([
          ['edge1', {
            id: 'edge1',
            source: 'choice1',
            target: 'output1'
          }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      // Execute with same seed multiple times
      const result1 = await engine.execute(graph, 123);
      const result2 = await engine.execute(graph, 123);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Same seed should produce same result
      expect(result1.outputs).toEqual(result2.outputs);
      
      // Result should be one of the choices
      expect(['Option A', 'Option B']).toContain(result1.outputs[0]);
    });

    it('should handle Concat nodes with template substitution', async () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['choice1', {
            id: 'choice1',
            type: 'WeightedChoice',
            data: {
              choices: [
                { value: 'Hello', weight: 1 }
              ]
            }
          }],
          ['concat1', {
            id: 'concat1',
            type: 'Concat',
            data: {
              template: '{{choice1}} World!'
            }
          }],
          ['output1', {
            id: 'output1',
            type: 'Output',
            data: { text: '{{concat1}}' }
          }]
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'choice1', target: 'concat1' }],
          ['edge2', { id: 'edge2', source: 'concat1', target: 'output1' }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = await engine.execute(graph, 'test-seed');
      
      expect(result.success).toBe(true);
      expect(result.outputs[0]).toBe('Hello World!');
    });

    it('should handle variable operations', async () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['setVar1', {
            id: 'setVar1',
            type: 'SetVariable',
            data: { key: 'greeting', value: 'Hello' }
          }],
          ['getVar1', {
            id: 'getVar1',
            type: 'GetVariable',
            data: { key: 'greeting' }
          }],
          ['output1', {
            id: 'output1',
            type: 'Output',
            data: { text: '{{getVar1}} World!' }
          }]
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'setVar1', target: 'getVar1' }],
          ['edge2', { id: 'edge2', source: 'getVar1', target: 'output1' }]
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = await engine.execute(graph, 'test-seed');
      
      expect(result.success).toBe(true);
      expect(result.outputs[0]).toBe('Hello World!');
    });

    it('should handle graphs with no Output nodes', async () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['choice1', {
            id: 'choice1',
            type: 'WeightedChoice',
            data: {
              choices: [{ value: 'Hello', weight: 1 }]
            }
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const result = await engine.execute(graph, 'test-seed');
      
      expect(result.success).toBe(true);
      expect(result.outputs).toEqual([]);
    });
  });

  describe('Graph Serialization', () => {
    it('should serialize and deserialize graphs correctly', () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['node1', {
            id: 'node1',
            type: 'Output',
            data: { text: 'Hello World' }
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date('2023-01-01'),
          modified: new Date('2023-01-02')
        }
      };

      const serialized = engine.serialize(graph);
      const deserialized = engine.deserialize(serialized);

      expect(deserialized.id).toBe(graph.id);
      expect(deserialized.nodes.size).toBe(1);
      expect(deserialized.nodes.get('node1')?.type).toBe('Output');
      expect(deserialized.metadata.version).toBe('1.0.0');
    });

    it('should handle empty graphs in serialization', () => {
      const graph: GraphDocument = {
        id: 'empty-graph',
        nodes: new Map(),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const serialized = engine.serialize(graph);
      const deserialized = engine.deserialize(serialized);

      expect(deserialized.id).toBe('empty-graph');
      expect(deserialized.nodes.size).toBe(0);
      expect(deserialized.edges.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed graph data gracefully', () => {
      const malformedGraph = {
        // Missing required fields
        nodes: new Map(),
        edges: new Map()
      } as any;

      expect(() => engine.validate(malformedGraph)).not.toThrow();
      const validation = engine.validate(malformedGraph);
      expect(validation.valid).toBe(false);
    });

    it('should handle execution with various seed types', async () => {
      const graph: GraphDocument = {
        id: 'test-graph',
        nodes: new Map([
          ['output1', {
            id: 'output1',
            type: 'Output',
            data: { text: 'Hello' }
          }]
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      // Should handle different seed types
      const result1 = await engine.execute(graph, 123);
      const result2 = await engine.execute(graph, 'string-seed');
      const result3 = await engine.execute(graph);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle moderately sized graphs efficiently', async () => {
      const nodeCount = 25;
      const nodes = new Map<string, GraphNode>();
      const edges = new Map<string, GraphEdge>();

      // Create a chain of WeightedChoice nodes
      for (let i = 0; i < nodeCount; i++) {
        nodes.set(`node${i}`, {
          id: `node${i}`,
          type: 'WeightedChoice',
          data: {
            choices: [{ value: `Value ${i}`, weight: 1 }]
          }
        });

        if (i > 0) {
          edges.set(`edge${i}`, {
            id: `edge${i}`,
            source: `node${i-1}`,
            target: `node${i}`
          });
        }
      }

      // Add output node
      nodes.set('output', {
        id: 'output',
        type: 'Output',
        data: { text: `{{node${nodeCount-1}}}` }
      });
      edges.set('outputEdge', {
        id: 'outputEdge',
        source: `node${nodeCount-1}`,
        target: 'output'
      });

      const graph: GraphDocument = {
        id: 'large-graph',
        nodes,
        edges,
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date()
        }
      };

      const startTime = performance.now();
      const result = await engine.execute(graph, 'test-seed');
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});