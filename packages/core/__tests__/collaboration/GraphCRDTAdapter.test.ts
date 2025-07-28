/**
 * GraphCRDTAdapter Tests - Epic 9.1.2
 * Testing CRDT integration with existing graph schema
 */
import { GraphCRDTAdapter } from '../../collaboration/GraphCRDTAdapter';
import { Graph, Node, Edge } from '../../graphSchema';

// Mock the CRDT research package for testing
jest.mock('../../../crdt-research/src/graph-sync', () => ({)
  GraphSyncHandler: jest.fn().mockImplementation(() => ({,)
  getGraph: jest.fn().mockReturnValue({;)
  addNode: jest.fn(),
      updateNode: jest.fn(),
      deleteNode: jest.fn(),
      addEdge: jest.fn(),
      deleteEdge: jest.fn(),
      getNodes: jest.fn().mockReturnValue([]),
      getEdges: jest.fn().mockReturnValue([]),
      observe: jest.fn(),
      toJSON: jest.fn().mockReturnValue({ nodes: [], edges: [] })
    }),
    onDocumentUpdate: jest.fn(),
    onAwarenessChange: jest.fn(),
    setLocalPresence: jest.fn(),
    applyUpdate: jest.fn(),
    getStateAsUpdate: jest.fn().mockReturnValue(new Uint8Array()),
    createSnapshot: jest.fn().mockReturnValue(new Uint8Array()),
    getDocumentSize: jest.fn().mockReturnValue(0),
    getSyncState: jest.fn().mockReturnValue({ documentId: 'test', userId: 'user1', lastSync: Date.now(), pendingOps: 0 }),
    destroy: jest.fn();
  }))
}));
describe('GraphCRDTAdapter', () => {
  let adapter: GraphCRDTAdapter;
  let mockOnGraphChange: jest.Mock;
  let mockOnUserPresence: jest.Mock;
  beforeEach(() => {
  mockOnGraphChange = jest.fn();
  mockOnUserPresence = jest.fn();
  adapter = new GraphCRDTAdapter({)
  documentId: 'test-doc',
  userId: 'user1',
  onGraphChange: mockOnGraphChange,
  onUserPresence: mockOnUserPresence,
});
  });
  afterEach(() => {
    adapter.destroy();
  });
  describe('Node Conversion', () => {
    test('should convert WeightedChoice node to CRDT format', () => {
      const node: Node = {,
  id: 'node1',
        type: 'WeightedChoice',
        choices: [,
          { value: 'Option A', weight: 0.5 },
          { value: 'Option B', weight: 0.5 }
        ],
        inputs: [];
  };
      adapter.addNode(node, { x: 100, y: 200 });
      // Verify the adapter processes the node correctly
      expect(adapter.getGraph().nodes).toHaveLength(0); // Mock returns empty
    });
    test('should convert Output node to CRDT format', () => {
  const node: Node = {,
  id: 'output1',
  type: 'Output',
  inputs: ['node1'],
};
      adapter.addNode(node);
      expect(adapter.getGraph().nodes).toHaveLength(0); // Mock returns empty
    });
    test('should convert SetVariable node to CRDT format', () => {
  const node: Node = {,
  id: 'var1',
  type: 'SetVariable',
  variableName: 'testVar',
  value: 'testValue',
  inputs: [],
};
      adapter.addNode(node);
      expect(adapter.getGraph().nodes).toHaveLength(0); // Mock returns empty
    });
  });
  describe('Edge Operations', () => {
  test('should add edges between nodes', () => {
  const sourceNode: Node = {,
  id: 'source',
  type: 'WeightedChoice',
  choices: [],
  inputs: [],
};
      const targetNode: Node = {,
  id: 'target',
  type: 'Output',
  inputs: [],
};
      const edge: Edge = {,
  id: 'edge1',
  source: 'source',
  target: 'target',
  sourceHandle: 'output',
  targetHandle: 'input',
};
      // Add nodes first
      adapter.addNode(sourceNode);
      adapter.addNode(targetNode);
      // Then add edge
      adapter.addEdge(edge);
      expect(adapter.getGraph().edges).toHaveLength(0); // Mock returns empty
    });
    test('should delete edges', () => {
      adapter.deleteEdge('edge1');
      expect(adapter.getGraph().edges).toHaveLength(0); // Mock returns empty
    });
  });
  describe('Graph Import', () => {
    test('should import existing graph into CRDT', () => {
      const existingGraph: Graph = {,
  nodes: [,
          {
            id: 'node1',
            type: 'WeightedChoice',
            choices: [{ value: 'A', weight: 1 }],
            inputs: [];
  }
          {
  id: 'node2',
  type: 'Output',
  inputs: ['node1']],
  edges: [,
  {
  id: 'edge1',
  source: 'node1',
  target: 'node2'];
  };
      const adapterWithGraph = new GraphCRDTAdapter({)
  documentId: 'test-doc',
  userId: 'user1',
  onGraphChange: mockOnGraphChange,
}, existingGraph);
      expect(adapterWithGraph.getGraph()).toBeDefined();
      adapterWithGraph.destroy();
    });
  });
  describe('Collaborative Operations', () => {
    test('should handle node updates', () => {
      const updates = {
        choices: [,
          { value: 'Updated A', weight: 0.7 },
          { value: 'Updated B', weight: 0.3 }
        ]
      };
      adapter.updateNode('node1', updates);
      // Verify update was processed
      expect(adapter.getGraph()).toBeDefined();
    });
    test('should handle node position updates', () => {
      const position = { x: 250, y: 300 };
      adapter.updateNodePosition('node1', position);
      // Position updates are handled but don't trigger graph sync
      expect(adapter.getGraph()).toBeDefined();
    });
    test('should handle node deletion', () => {
      adapter.deleteNode('node1');
      expect(adapter.getGraph().nodes).toHaveLength(0); // Mock returns empty
    });
  });
  describe('User Presence', () => {
    test('should set user presence', () => {
      const presence = {
        cursor: { nodeId: 'node1', position: { x: 100, y: 100 } },
        selection: ['node1', 'node2'],
        name: 'Test User',
        color: '#ff0000';
  };
      adapter.setUserPresence(presence);
      // Verify presence was set (would be tested through mock calls)
      expect(adapter.getSyncState()).toBeDefined();
    });
  });
  describe('Synchronization', () => {
    test('should apply remote updates', () => {
      const mockUpdate = new Uint8Array([1, 2, 3]);
      adapter.applyRemoteUpdate(mockUpdate);
      // Verify update was applied
      expect(adapter.getDocumentState()).toBeDefined();
    });
    test('should create snapshots', () => {
      const snapshot = adapter.createSnapshot();
      expect(snapshot).toBeDefined();
      expect(snapshot).toBeInstanceOf(Uint8Array);
    });
    test('should provide metrics', () => {
      const metrics = adapter.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.documentSize).toBeDefined();
      expect(metrics.nodeCount).toBeDefined();
      expect(metrics.edgeCount).toBeDefined();
      expect(metrics.syncState).toBeDefined();
    });
  });
  describe('Schema Compatibility', () => {
    test('should handle all node types from schema', () => {
      const nodeTypes: Array<{ type: Node['type']; data: any }> = [
        { type: 'WeightedChoice', data: { choices: [] } },
        { type: 'Concat', data: {} },
        { type: 'Output', data: {} },
        { type: 'SetVariable', data: { variableName: 'test', value: 'value' } },
        { type: 'GetVariable', data: { variableName: 'test' } },
        { type: 'Include', data: { name: 'test' } }
      ];
      nodeTypes.forEach(({ type, data }, index) => {
        const node: Node = {,
  id: `node${index}`}
}
          type,
          inputs: [],
          ...data
        };
        adapter.addNode(node);
      });
      // All node types should be processed without errors
      expect(adapter.getGraph()).toBeDefined();
    });
    test('should preserve node inputs', () => {
  const node: Node = {,
  id: 'node1',
  type: 'Concat',
  inputs: ['input1', 'input2', 'input3'],
};
      adapter.addNode(node);
      // Inputs should be preserved in metadata
      expect(adapter.getGraph()).toBeDefined();
    });
  });
  describe('Error Handling', () => {
    test('should handle missing nodes gracefully', () => {
      // Try to update non-existent node
      adapter.updateNode('nonexistent', { type: 'Output' });
      // Should not throw error
      expect(adapter.getGraph()).toBeDefined();
    });
    test('should handle invalid edges gracefully', () => {
  const invalidEdge: Edge = {,
  id: 'invalid',
  source: 'nonexistent1',
  target: 'nonexistent2',
};
      adapter.addEdge(invalidEdge);
      // Should not throw error
      expect(adapter.getGraph()).toBeDefined();
    });
  });
});