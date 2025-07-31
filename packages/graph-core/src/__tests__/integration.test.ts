/**
 * Integration tests for graph-core package
 * Tests the complete workflow from graph creation to execution
 */

import { GraphEngine, GraphCRDT, createGraphCRDT, GraphValidator, GraphDocument, mergeGraphs } from '../index';

describe('Graph-Core Integration', () => {
  describe('Complete workflow', () => {
    it('should handle a complete graph lifecycle', async () => {
      // 1. Create a graph using CRDT
      const crdt = createGraphCRDT();

      // Add nodes
      crdt.addNode({
        id: 'choice1',
        type: 'WeightedChoice',
        data: {
          choices: [
            { value: 'Hello', weight: 0.6 },
            { value: 'Hi', weight: 0.4 },
          ],
        },
      });

      crdt.addNode({
        id: 'output1',
        type: 'Output',
        data: { text: '{{choice1}} World!' },
      });

      // Add edge
      crdt.addEdge({
        id: 'edge1',
        source: 'choice1',
        target: 'output1',
      });

      // 2. Convert to GraphDocument
      const graph = crdt.toGraphDocument();

      // 3. Validate the graph
      const validator = new GraphValidator();
      const validation = validator.validate(graph);
      expect(validation.valid).toBe(true);

      // 4. Execute the graph
      const engine = new GraphEngine();
      const result = await engine.execute(graph, 'test-seed');

      expect(result.success).toBe(true);
      expect(result.outputs.length).toBe(1);
      expect(['Hello World!', 'Hi World!']).toContain(result.outputs[0]);

      // 5. Test deterministic execution
      const result2 = await engine.execute(graph, 'test-seed');
      expect(result.outputs).toEqual(result2.outputs);

      // 6. Test serialization round-trip
      const serialized = engine.serialize(graph);
      const deserialized = engine.deserialize(serialized);
      const result3 = await engine.execute(deserialized, 'test-seed');
      expect(result.outputs).toEqual(result3.outputs);

      // Clean up
      crdt.destroy();
    });

    it('should handle CRDT synchronization workflow', () => {
      const crdt1 = createGraphCRDT();
      const crdt2 = createGraphCRDT();

      // Add different nodes to each CRDT
      crdt1.addNode({
        id: 'node1',
        type: 'WeightedChoice',
        data: { choices: [{ value: 'From CRDT1', weight: 1 }] },
      });

      crdt2.addNode({
        id: 'node2',
        type: 'Output',
        data: { text: 'From CRDT2' },
      });

      // Synchronize via updates
      const update1 = crdt1.exportUpdate();
      const update2 = crdt2.exportUpdate();

      crdt1.applyUpdate(update2);
      crdt2.applyUpdate(update1);

      // Both should now have both nodes
      const graph1 = crdt1.toGraphDocument();
      const graph2 = crdt2.toGraphDocument();

      expect(graph1.nodes.has('node1')).toBe(true);
      expect(graph1.nodes.has('node2')).toBe(true);
      expect(graph2.nodes.has('node1')).toBe(true);
      expect(graph2.nodes.has('node2')).toBe(true);

      // Clean up
      crdt1.destroy();
      crdt2.destroy();
    });

    it('should handle graph merging workflow', () => {
      const graph1: GraphDocument = {
        id: 'graph1',
        nodes: new Map([
          [
            'node1',
            {
              id: 'node1',
              type: 'WeightedChoice',
              data: { choices: [{ value: 'A', weight: 1 }] },
            },
          ],
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date(),
        },
      };

      const graph2: GraphDocument = {
        id: 'graph2',
        nodes: new Map([
          [
            'node2',
            {
              id: 'node2',
              type: 'Output',
              data: { text: 'B' },
            },
          ],
        ]),
        edges: new Map(),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date(),
        },
      };

      const merged = mergeGraphs([graph1, graph2]);

      expect(merged.nodes.has('node1')).toBe(true);
      expect(merged.nodes.has('node2')).toBe(true);
      expect(merged.nodes.size).toBe(2);
    });

    it('should handle complex graph with variables', async () => {
      const engine = new GraphEngine();

      const graph: GraphDocument = {
        id: 'complex-graph',
        nodes: new Map([
          [
            'setVar1',
            {
              id: 'setVar1',
              type: 'SetVariable',
              data: { key: 'greeting', value: 'Hello' },
            },
          ],
          [
            'choice1',
            {
              id: 'choice1',
              type: 'WeightedChoice',
              data: {
                choices: [
                  { value: 'World', weight: 0.7 },
                  { value: 'Universe', weight: 0.3 },
                ],
              },
            },
          ],
          [
            'getVar1',
            {
              id: 'getVar1',
              type: 'GetVariable',
              data: { key: 'greeting' },
            },
          ],
          [
            'concat1',
            {
              id: 'concat1',
              type: 'Concat',
              data: { template: '{{getVar1}} {{choice1}}!' },
            },
          ],
          [
            'output1',
            {
              id: 'output1',
              type: 'Output',
              data: { text: '{{concat1}}' },
            },
          ],
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'setVar1', target: 'getVar1' }],
          ['edge2', { id: 'edge2', source: 'choice1', target: 'concat1' }],
          ['edge3', { id: 'edge3', source: 'getVar1', target: 'concat1' }],
          ['edge4', { id: 'edge4', source: 'concat1', target: 'output1' }],
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date(),
        },
      };

      // Validate the complex graph
      const validator = new GraphValidator();
      const validation = validator.validate(graph);
      expect(validation.valid).toBe(true);

      // Execute the complex graph
      const result = await engine.execute(graph, 42);
      expect(result.success).toBe(true);
      expect(result.outputs.length).toBe(1);
      expect(['Hello World!', 'Hello Universe!']).toContain(result.outputs[0]);

      // Test deterministic execution
      const result2 = await engine.execute(graph, 42);
      expect(result.outputs).toEqual(result2.outputs);
    });

    it('should handle error conditions gracefully', async () => {
      const engine = new GraphEngine();
      const validator = new GraphValidator();

      // Test cycle detection
      const cyclicGraph: GraphDocument = {
        id: 'cyclic',
        nodes: new Map([
          ['node1', { id: 'node1', type: 'Output', data: { text: '{{node2}}' } }],
          ['node2', { id: 'node2', type: 'Concat', data: { template: '{{node1}}' } }],
        ]),
        edges: new Map([
          ['edge1', { id: 'edge1', source: 'node1', target: 'node2' }],
          ['edge2', { id: 'edge2', source: 'node2', target: 'node1' }],
        ]),
        metadata: {
          version: '1.0.0',
          created: new Date(),
          modified: new Date(),
        },
      };

      const validation = validator.validate(cyclicGraph);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.type === 'CYCLE_DETECTED')).toBe(true);

      // Engine should handle validation failures
      const result = await engine.execute(cyclicGraph, 'test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('validation failed');
    });
  });

  describe('Package exports', () => {
    it('should export all necessary components', () => {
      // Verify all main exports are available
      expect(GraphEngine).toBeDefined();
      expect(GraphCRDT).toBeDefined();
      expect(createGraphCRDT).toBeDefined();
      expect(GraphValidator).toBeDefined();
      expect(mergeGraphs).toBeDefined();
    });
  });
});
