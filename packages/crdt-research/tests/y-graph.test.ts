/**
 * YGraph Tests - CRDT Implementation Validation
 * Epic 9.1.1 - Testing concurrent graph editing scenarios
 */

import * as Y from 'yjs';
import { YGraph, registerYGraphType } from '../src/y-graph';
import { CRDTNode, CRDTEdge } from '../src/types';

// Register the custom type before tests
registerYGraphType();

describe('YGraph CRDT Implementation', () => {
  let doc1: Y.Doc;
  let doc2: Y.Doc;
  let graph1: YGraph;
  let graph2: YGraph;

  beforeEach(() => {
    // Create two documents to simulate concurrent editing
    doc1 = new Y.Doc();
    doc2 = new Y.Doc();

    graph1 = new YGraph();
    graph2 = new YGraph();

    doc1.getMap('graph').set('root', graph1);
    doc2.getMap('graph').set('root', graph2);
  });

  afterEach(() => {
    doc1.destroy();
    doc2.destroy();
  });

  /**
   * Helper to sync two documents
   */
  function syncDocs(doc1: Y.Doc, doc2: Y.Doc) {
    const state1 = Y.encodeStateAsUpdate(doc1);
    const state2 = Y.encodeStateAsUpdate(doc2);
    Y.applyUpdate(doc1, state2);
    Y.applyUpdate(doc2, state1);
  }

  describe('Basic Node Operations', () => {
    test('should add nodes to the graph', () => {
      const node: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: { choices: [] },
        metadata: {},
      };

      graph1.addNode(node);

      expect(graph1.getNode('node1')).toEqual(node);
      expect(graph1.getNodes()).toHaveLength(1);
    });

    test('should update node properties', () => {
      const node: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: { choices: [] },
        metadata: {},
      };

      graph1.addNode(node);
      graph1.updateNode('node1', { position: { x: 200, y: 200 } });

      const updated = graph1.getNode('node1');
      expect(updated?.position).toEqual({ x: 200, y: 200 });
    });

    test('should delete nodes and connected edges', () => {
      const node1: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: {},
        metadata: {},
      };

      const node2: CRDTNode = {
        id: 'node2',
        type: 'Output',
        position: { x: 200, y: 200 },
        data: {},
        metadata: {},
      };

      const edge: CRDTEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input',
        metadata: {},
      };

      graph1.addNode(node1);
      graph1.addNode(node2);
      graph1.addEdge(edge);

      expect(graph1.getNodes()).toHaveLength(2);
      expect(graph1.getEdges()).toHaveLength(1);

      graph1.deleteNode('node1');

      expect(graph1.getNodes()).toHaveLength(1);
      expect(graph1.getEdges()).toHaveLength(0); // Edge should be deleted
    });
  });

  describe('Edge Operations', () => {
    test('should add edges between existing nodes', () => {
      const node1: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: {},
        metadata: {},
      };

      const node2: CRDTNode = {
        id: 'node2',
        type: 'Output',
        position: { x: 200, y: 200 },
        data: {},
        metadata: {},
      };

      const edge: CRDTEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input',
        metadata: {},
      };

      graph1.addNode(node1);
      graph1.addNode(node2);
      graph1.addEdge(edge);

      expect(graph1.getEdge('edge1')).toEqual(edge);
    });

    test('should not add edges to non-existent nodes', () => {
      const edge: CRDTEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input',
        metadata: {},
      };

      graph1.addEdge(edge);
      expect(graph1.getEdges()).toHaveLength(0);
    });

    test('should update edge properties', () => {
      const node1: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: {},
        metadata: {},
      };

      const node2: CRDTNode = {
        id: 'node2',
        type: 'Output',
        position: { x: 200, y: 200 },
        data: {},
        metadata: {},
      };

      const edge: CRDTEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input',
        metadata: { label: 'Initial' },
      };

      graph1.addNode(node1);
      graph1.addNode(node2);
      graph1.addEdge(edge);
      graph1.updateEdge('edge1', { metadata: { label: 'Updated' } });

      const updated = graph1.getEdge('edge1');
      expect(updated?.metadata.label).toBe('Updated');
    });
  });

  describe('Concurrent Editing and Conflict Resolution', () => {
    test('should merge concurrent node additions', () => {
      const node1: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: {},
        metadata: {},
      };

      const node2: CRDTNode = {
        id: 'node2',
        type: 'Output',
        position: { x: 200, y: 200 },
        data: {},
        metadata: {},
      };

      // User 1 adds node1
      graph1.addNode(node1);

      // User 2 adds node2
      graph2.addNode(node2);

      // Sync the documents
      syncDocs(doc1, doc2);

      // Both graphs should have both nodes
      expect(graph1.getNodes()).toHaveLength(2);
      expect(graph2.getNodes()).toHaveLength(2);
      expect(graph1.getNode('node1')).toBeTruthy();
      expect(graph1.getNode('node2')).toBeTruthy();
      expect(graph2.getNode('node1')).toBeTruthy();
      expect(graph2.getNode('node2')).toBeTruthy();
    });

    test('should resolve concurrent updates to same node', () => {
      const node: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: { label: 'Initial' },
        metadata: {},
      };

      // Both users start with the same node
      graph1.addNode(node);
      syncDocs(doc1, doc2);

      // User 1 updates position
      graph1.updateNode('node1', { position: { x: 150, y: 150 } });

      // User 2 updates data
      graph2.updateNode('node1', { data: { label: 'Updated' } });

      // Sync the documents
      syncDocs(doc1, doc2);

      // Both updates should be applied
      const result1 = graph1.getNode('node1');
      const result2 = graph2.getNode('node1');

      expect(result1?.position).toEqual({ x: 150, y: 150 });
      expect(result1?.data.label).toBe('Updated');
      expect(result2?.position).toEqual({ x: 150, y: 150 });
      expect(result2?.data.label).toBe('Updated');
    });

    test('should handle concurrent edge creation and node deletion', () => {
      const node1: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: {},
        metadata: {},
      };

      const node2: CRDTNode = {
        id: 'node2',
        type: 'Output',
        position: { x: 200, y: 200 },
        data: {},
        metadata: {},
      };

      // Both users start with the same nodes
      graph1.addNode(node1);
      graph1.addNode(node2);
      syncDocs(doc1, doc2);

      // User 1 creates an edge
      const edge: CRDTEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input',
        metadata: {},
      };
      graph1.addEdge(edge);

      // User 2 deletes node1 (which should also delete the edge)
      graph2.deleteNode('node1');

      // Sync the documents
      syncDocs(doc1, doc2);

      // Node1 should be deleted in both graphs
      expect(graph1.getNode('node1')).toBeUndefined();
      expect(graph2.getNode('node1')).toBeUndefined();

      // Edge should also be deleted
      expect(graph1.getEdge('edge1')).toBeUndefined();
      expect(graph2.getEdge('edge1')).toBeUndefined();

      // Node2 should still exist
      expect(graph1.getNode('node2')).toBeTruthy();
      expect(graph2.getNode('node2')).toBeTruthy();
    });
  });

  describe('Serialization and Deserialization', () => {
    test('should serialize and deserialize graph state', () => {
      const node1: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: { choices: ['A', 'B', 'C'] },
        metadata: {},
      };

      const node2: CRDTNode = {
        id: 'node2',
        type: 'Output',
        position: { x: 200, y: 200 },
        data: {},
        metadata: {},
      };

      const edge: CRDTEdge = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input',
        metadata: {},
      };

      graph1.addNode(node1);
      graph1.addNode(node2);
      graph1.addEdge(edge);

      const json = graph1.toJSON();

      expect(json.nodes).toHaveLength(2);
      expect(json.edges).toHaveLength(1);

      // Load into a new graph
      const newGraph = new YGraph();
      const newDoc = new Y.Doc();
      newDoc.getMap('graph').set('root', newGraph);

      newGraph.fromJSON(json);

      expect(newGraph.getNodes()).toHaveLength(2);
      expect(newGraph.getEdges()).toHaveLength(1);
      expect(newGraph.getNode('node1')).toEqual(node1);
    });
  });

  describe('Operation Application', () => {
    test('should apply node operations', () => {
      const createOp = {
        type: 'node' as const,
        action: 'create' as const,
        targetId: 'node1',
        data: {
          id: 'node1',
          type: 'WeightedChoice' as const,
          position: { x: 100, y: 100 },
          data: {},
          metadata: {},
        },
        timestamp: Date.now(),
        userId: 'user1',
      };

      graph1.applyOperation(createOp);
      expect(graph1.getNode('node1')).toBeTruthy();

      const updateOp = {
        type: 'node' as const,
        action: 'update' as const,
        targetId: 'node1',
        data: { position: { x: 200, y: 200 } },
        timestamp: Date.now(),
        userId: 'user1',
      };

      graph1.applyOperation(updateOp);
      expect(graph1.getNode('node1')?.position).toEqual({ x: 200, y: 200 });

      const deleteOp = {
        type: 'node' as const,
        action: 'delete' as const,
        targetId: 'node1',
        timestamp: Date.now(),
        userId: 'user1',
      };

      graph1.applyOperation(deleteOp);
      expect(graph1.getNode('node1')).toBeUndefined();
    });
  });

  describe('Observer Pattern', () => {
    test('should notify observers of changes', done => {
      let changeCount = 0;

      const observer = (event: Y.YEvent<any>) => {
        changeCount++;
        if (changeCount === 2) {
          graph1.unobserve(observer);
          done();
        }
      };

      graph1.observe(observer);

      const node: CRDTNode = {
        id: 'node1',
        type: 'WeightedChoice',
        position: { x: 100, y: 100 },
        data: {},
        metadata: {},
      };

      graph1.addNode(node);
      graph1.updateNode('node1', { position: { x: 200, y: 200 } });
    });
  });
});
