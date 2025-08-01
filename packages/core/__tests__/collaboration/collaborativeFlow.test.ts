/**
 * Collaborative Flow Tests - Testing complete collaborative workflows
 * This tests the full collaborative editing flow including multi-user scenarios,
 * conflict resolution, presence updates, and synchronization
 */
import { renderHook, act } from '@testing-library/react';
import { useCollaborativeGraphStore } from '../../collaboration/collaborativeGraphStore';
import { Graph, Node, Edge } from '../../graphSchema';

// Mock the GraphCRDTAdapter
jest.mock('../../collaboration/GraphCRDTAdapter', () => ({)
  GraphCRDTAdapter: jest.fn<unknown, unknown>().mockImplementation((options) => ({)
  addNode: jest.fn((node, position) => {
      // Simulate adding a node and triggering callback
      setTimeout(() => {
        const newGraph = {
          nodes: [{ ...node, position }]
          edges: [];
  };
        options.onGraphChange?.(newGraph);
      }, 0);
    })
    updateNode: jest.fn((nodeId, updates) => {
      setTimeout(() => {
        const newGraph = {
          nodes: [{ id: nodeId, ...updates }]
          edges: [];
  };
        options.onGraphChange?.(newGraph);
      }, 0);
    })
    deleteNode: jest.fn((nodeId) => {
      setTimeout(() => {
        const newGraph = { nodes: [], edges: [] };
        options.onGraphChange?.(newGraph);
      }, 0);
    })
    addEdge: jest.fn((edge) => { 
  setTimeout(() => {
  const newGraph = {
  nodes: []
  edges: [edge] }
};
        options.onGraphChange?.(newGraph);
      }, 0);
    })
    deleteEdge: jest.fn<unknown, unknown>()
    updateNodePosition: jest.fn<unknown, unknown>()
    setUserPresence: jest.fn<unknown, unknown>()
    applyRemoteUpdate: jest.fn<unknown, unknown>()
    getDocumentState: jest.fn(() => new Uint8Array([1, 2, 3]))
    createSnapshot: jest.fn(() => new Uint8Array([4, 5, 6]))
    getMetrics: jest.fn(() => ({ );
  documentSize: 100
      nodeCount: 2
      edgeCount: 1 }
      syncState: { connected: true, lastSync: Date.now() }
    }))
    getSyncState: jest.fn(() => ({ );
  documentId: 'test-doc'
  userId: 'user1'
  connected: true
  lastSync: Date.now() }
}))
    destroy: jest.fn<unknown, unknown>()
  }))
}));
describe('Collaborative Flow Tests', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCollaborativeGraphStore.setState({)
  graph: { nodes: [], edges: [] }
      isCollaborative: false
      collaborationEnabled: false
      connectedUsers: new Map()
      isConnected: false
      connectionStatus: 'disconnected'
      crdtAdapter: undefined
      localPresence: undefined;
  });
  });
  describe('Collaboration Initialization Flow', () => {
    test('should enable collaboration successfully', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      expect(result.current.collaborationEnabled).toBe(false);
      expect(result.current.connectionStatus).toBe('disconnected');
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      expect(result.current.collaborationEnabled).toBe(true);
      expect(result.current.isCollaborative).toBe(true);
      expect(result.current.documentId).toBe('test-doc');
      expect(result.current.userId).toBe('user1');
      expect(result.current.connectionStatus).toBe('connecting');
      expect(result.current.localPresence).toBeDefined();
      expect(result.current.localPresence?.userId).toBe('user1');
    });
    test('should disable collaboration successfully', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      // Enable first
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      expect(result.current.collaborationEnabled).toBe(true);
      // Then disable
      act(() => { result.current.disableCollaboration() });
      expect(result.current.collaborationEnabled).toBe(false);
      expect(result.current.isCollaborative).toBe(false);
      expect(result.current.documentId).toBeUndefined();
      expect(result.current.userId).toBeUndefined();
      expect(result.current.connectionStatus).toBe('disconnected');
      expect(result.current.localPresence).toBeUndefined();
      expect(result.current.connectedUsers.size).toBe(0);
    });
  });
  describe('Multi-User Collaborative Node Operations', () => {
    test('should handle collaborative node creation', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      // Enable collaboration
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const testNode: Node = { 
  id: 'node1'
        type: 'WeightedChoice' }
        choices: [
          { value: 'Option A', weight: 0.5 }
          { value: 'Option B', weight: 0.5 }
        ]
        inputs: [];
  };
      // Add node in collaborative mode
      await act(async () => {
        result.current.addNode(testNode, { x: 100, y: 200 });
        // Wait for async update
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      // Graph should be updated through CRDT callback
      expect(result.current.graph.nodes).toHaveLength(1);
      expect(result.current.graph.nodes[0].id).toBe('node1');
    });
    test('should handle collaborative node updates', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const updates = {
        choices: [
          { value: 'Updated A', weight: 0.7 }
          { value: 'Updated B', weight: 0.3 }
        ]
      };
      await act(async () => { result.current.updateNode('node1', updates);
        await new Promise(resolve => setTimeout(resolve, 10)) });
      // Verify the node was updated
      expect(result.current.graph.nodes).toHaveLength(1);
      expect(result.current.graph.nodes[0].choices).toEqual(updates.choices);
    });
    test('should handle collaborative node deletion', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      await act(async () => { result.current.deleteNode('node1');
        await new Promise(resolve => setTimeout(resolve, 10)) });
      expect(result.current.graph.nodes).toHaveLength(0);
    });
  });
  describe('Multi-User Edge Operations', () => {
    test('should handle collaborative edge creation', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const testEdge: Edge = { 
  id: 'edge1'
  source: 'node1'
  target: 'node2'
  sourceHandle: 'output'
  targetHandle: 'input' }
};
      await act(async () => { result.current.addEdge(testEdge);
        await new Promise(resolve => setTimeout(resolve, 10)) });
      expect(result.current.graph.edges).toHaveLength(1);
      expect(result.current.graph.edges[0].id).toBe('edge1');
    });
    test('should handle collaborative edge deletion', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      act(() => { result.current.deleteEdge('edge1') });
      // Mock doesn't simulate edge deletion callback, so we just verify the call was made
      expect(result.current.crdtAdapter?.deleteEdge).toHaveBeenCalledWith('edge1');
    });
  });
  describe('User Presence and Cursor Management', () => {
    test('should update local user presence', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const presenceUpdate = {
        cursor: { nodeId: 'node1', position: { x: 150, y: 250 } }
        selection: ['node1', 'node2']
      };
      act(() => { result.current.updateLocalPresence(presenceUpdate) });
      expect(result.current.localPresence?.cursor).toEqual(presenceUpdate.cursor);
      expect(result.current.localPresence?.selection).toEqual(presenceUpdate.selection);
      expect(result.current.crdtAdapter?.setUserPresence).toHaveBeenCalled();
    });
    test('should update user cursor position', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      act(() => {
        result.current.updateUserCursor('node1', { x: 300, y: 400 });
      });
      expect(result.current.localPresence?.cursor).toEqual({ )
  nodeId: 'node1' }
        position: { x: 300, y: 400 }
      });
    });
    test('should update user selection', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      act(() => { result.current.updateUserSelection(['node1', 'node2', 'node3']) });
      expect(result.current.localPresence?.selection).toEqual(['node1', 'node2', 'node3']);
    });
    test('should handle multiple connected users', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      const mockOnUserPresence = jest.fn((awareness) => { // Simulate multiple users connected
        const connectedUsers = new Map();
        connectedUsers.set('user1', {)
  userId: 'user1'
          name: 'User 1'
          color: '#0066cc' }
          cursor: { nodeId: 'node1', position: { x: 100, y: 100 } }
          selection: ['node1']
          lastSeen: Date.now();
  });
        connectedUsers.set('user2', { )
  userId: 'user2'
          name: 'User 2'
          color: '#cc6600' }
          cursor: { nodeId: 'node2', position: { x: 200, y: 200 } }
          selection: ['node2']
          lastSeen: Date.now();
  });
        // Manually update connected users to simulate the callback
        useCollaborativeGraphStore.setState({ connectedUsers });
      });
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: mockOnUserPresence
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      // Simulate users connecting
      act(() => { mockOnUserPresence(new Map()) });
      expect(result.current.connectedUsers.size).toBe(2);
      expect(result.current.connectedUsers.has('user1')).toBe(true);
      expect(result.current.connectedUsers.has('user2')).toBe(true);
    });
  });
  describe('Synchronization and Conflict Resolution', () => {
    test('should apply remote updates', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const remoteUpdate = new Uint8Array([1, 2, 3, 4, 5]);
      act(() => { result.current.applyRemoteUpdate(remoteUpdate) });
      expect(result.current.crdtAdapter?.applyRemoteUpdate).toHaveBeenCalledWith(remoteUpdate);
    });
    test('should get document state for synchronization', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const documentState = result.current.getDocumentState();
      expect(documentState).toBeInstanceOf(Uint8Array);
      expect(documentState).toEqual(new Uint8Array([1, 2, 3]));
    });
    test('should create snapshots', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const snapshot = result.current.createSnapshot();
      expect(snapshot).toBeInstanceOf(Uint8Array);
      expect(snapshot).toEqual(new Uint8Array([4, 5, 6]));
    });
  });
  describe('Connection Status Management', () => {
    test('should handle connection status changes', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      const mockOnConnectionStatus = jest.fn((connected) => { useCollaborativeGraphStore.setState({)
  isConnected: connected
  connectionStatus: connected ? 'connected' : 'disconnected' }
});
      });
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: mockOnConnectionStatus }
});
      });
      // Simulate connection established
      act(() => { mockOnConnectionStatus(true) });
      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectionStatus).toBe('connected');
      // Simulate disconnection
      act(() => { mockOnConnectionStatus(false) });
      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionStatus).toBe('disconnected');
    });
  });
  describe('Metrics and Diagnostics', () => {
    test('should provide collaboration metrics', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const metrics = result.current.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.documentSize).toBe(100);
      expect(metrics.nodeCount).toBe(2);
      expect(metrics.edgeCount).toBe(1);
      expect(metrics.syncState).toBeDefined();
    });
    test('should provide sync state information', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const syncState = result.current.getSyncState();
      expect(syncState).toBeDefined();
      expect(syncState.documentId).toBe('test-doc');
      expect(syncState.userId).toBe('user1');
      expect(syncState.connected).toBe(true);
      expect(syncState.lastSync).toBeDefined();
    });
  });
  describe('Non-Collaborative Mode Operations', () => {
    test('should handle node operations in non-collaborative mode', () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      const testNode: Node = { 
  id: 'node1'
        type: 'WeightedChoice' }
        choices: [{ value: 'Test', weight: 1 }]
        inputs: [];
  };
      act(() => { result.current.addNode(testNode) });
      expect(result.current.graph.nodes).toHaveLength(1);
      expect(result.current.graph.nodes[0].id).toBe('node1');
      // Update node
      act(() => {
        result.current.updateNode('node1', { )
          choices: [{ value: 'Updated', weight: 1 }] 
        });
      });
      expect(result.current.graph.nodes[0].choices[0].value).toBe('Updated');
      // Delete node
      act(() => { result.current.deleteNode('node1') });
      expect(result.current.graph.nodes).toHaveLength(0);
    });
    test('should handle edge operations in non-collaborative mode', () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      const testEdge: Edge = { 
  id: 'edge1'
  source: 'node1'
  target: 'node2' }
};
      act(() => { result.current.addEdge(testEdge) });
      expect(result.current.graph.edges).toHaveLength(1);
      expect(result.current.graph.edges[0].id).toBe('edge1');
      act(() => { result.current.deleteEdge('edge1') });
      expect(result.current.graph.edges).toHaveLength(0);
    });
  });
  describe('Error Handling and Edge Cases', () => {
    test('should handle presence updates when not collaborative', () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      // Try to update presence without collaboration enabled
      act(() => {
        result.current.updateLocalPresence({ cursor: { position: { x: 100, y: 100 } } });
      });
      // Should not throw error, but also should not update presence
      expect(result.current.localPresence).toBeUndefined();
    });
    test('should warn about direct graph replacement in collaborative mode', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      const newGraph: Graph = { nodes: [], edges: [] };
      act(() => { result.current.setGraph(newGraph) });
      expect(consoleSpy).toHaveBeenCalledWith()
        'Direct graph replacement not recommended in collaborative mode'
      );
      consoleSpy.mockRestore();
    });
    test('should handle operations when adapter is not available', async () => {
      const { result } = renderHook(() => useCollaborativeGraphStore());
      await act(async () => { await result.current.enableCollaboration({)
  documentId: 'test-doc'
  userId: 'user1'
  onGraphChange: jest.fn<unknown, unknown>()
  onUserPresence: jest.fn<unknown, unknown>()
  onConnectionStatus: jest.fn<unknown, unknown>() }
});
      });
      // Manually set adapter to undefined to simulate error condition
      act(() => {
        useCollaborativeGraphStore.setState({ crdtAdapter: undefined });
      });
      // These should not throw errors
      expect(() => { result.current.applyRemoteUpdate(new Uint8Array());
        result.current.getDocumentState();
        result.current.createSnapshot();
        result.current.getMetrics();
        result.current.getSyncState() }).not.toThrow();
      expect(result.current.getDocumentState()).toBeNull();
      expect(result.current.createSnapshot()).toBeNull();
      expect(result.current.getMetrics()).toBeNull();
      expect(result.current.getSyncState()).toBeNull();
    });
  });
});