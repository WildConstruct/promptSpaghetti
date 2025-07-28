/**
 * Collaborative Graph Store - Epic 9.1.2
 * Extends existing graph store with collaborative editing capabilities
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { GraphCRDTAdapter } from './GraphCRDTAdapter';
export const useCollaborativeGraphStore = create()();
subscribeWithSelector((set, get) => ({})
// Initial state
, 
// Initial state
graph, { nodes: [], edges: [], metadata: { created: Date.now(), lastModified: Date.now() } }, isCollaborative, false, collaborationEnabled, false, connectedUsers, new Map(), isConnected, false, connectionStatus, 'disconnected', 
// Enable collaborative editing
enableCollaboration, async (options) => {
    const currentGraph = get().graph;
    // Create CRDT adapter
    const crdtAdapter = new GraphCRDTAdapter();
});
{
    options,
        onGraphChange;
    (graph) => {
        set({ graph, lastSyncTime: Date.now() });
    },
        onUserPresence;
    (awareness) => {
        const connectedUsers = new Map();
        awareness.forEach((presence, userId) => {
            connectedUsers.set(userId, {});
            userId: presence.userId,
                name;
            presence.name || 'Anonymous',
                color;
            presence.color || '#0066cc',
                cursor;
            presence.cursor,
                selection;
            presence.selection,
                lastSeen;
            presence.timestamp,
            ;
        });
    };
    ;
    set({ connectedUsers });
}
onConnectionStatus: (connected) => {
    set({});
    isConnected: connected,
        connectionStatus;
    connected ? 'connected' : 'disconnected',
    ;
};
;
currentGraph;
;
set({});
crdtAdapter,
    isCollaborative;
true,
    collaborationEnabled;
true,
    documentId;
options.documentId,
    userId;
options.userId,
    connectionStatus;
'connecting',
    localPresence;
{
    userId: options.userId,
        name;
    'You',
        color;
    '#0066cc',
        lastSeen;
    Date.now(),
    ;
}
;
// Disable collaborative editing
disableCollaboration: () => {
    const { crdtAdapter } = get();
    if (crdtAdapter) {
        crdtAdapter.destroy();
        set({});
        crdtAdapter: undefined,
            isCollaborative;
        false,
            collaborationEnabled;
        false,
            documentId;
        undefined,
            userId;
        undefined,
            connectedUsers;
        new Map(),
            localPresence;
        undefined,
            isConnected;
        false,
            connectionStatus;
        'disconnected',
        ;
    }
    ;
};
// Set entire graph (replaces current)
setGraph: (graph) => {
    const { crdtAdapter, isCollaborative } = get();
    if (isCollaborative && crdtAdapter) {
        // For collaborative mode, we don't directly replace the graph
        // Instead, the graph should be updated through collaborative operations
        console.warn('Direct graph replacement not recommended in collaborative mode');
    }
    else {
        set({ graph });
    }
    // Add node (collaborative when enabled)
    addNode: (node, position) => {
        const { crdtAdapter, isCollaborative, graph } = get();
        if (isCollaborative && crdtAdapter) {
            crdtAdapter.addNode(node, position);
        }
        else {
            // Non-collaborative mode
            const newGraph = {
                nodes: [...graph.nodes, node],
                edges: graph.edges,
            };
            set({ graph: newGraph });
        }
        // Update node (collaborative when enabled)
        updateNode: (nodeId, updates) => {
            const { crdtAdapter, isCollaborative, graph } = get();
            if (isCollaborative && crdtAdapter) {
                crdtAdapter.updateNode(nodeId, updates);
            }
            else {
                // Non-collaborative mode
                const newGraph = {
                    ...graph,
                    nodes: graph.nodes.map(node => ),
                    node, : .id === nodeId ? { ...node, ...updates } : node
                };
                set({ graph: newGraph });
            }
            // Delete node (collaborative when enabled)
            deleteNode: (nodeId) => {
                const { crdtAdapter, isCollaborative, graph } = get();
                if (isCollaborative && crdtAdapter) {
                    crdtAdapter.deleteNode(nodeId);
                }
                else {
                    // Non-collaborative mode
                    const newGraph = {
                        nodes: graph.nodes.filter(node => node.id !== nodeId),
                        edges: graph.edges.filter(edge => ),
                        edge, : .source !== nodeId && edge.target !== nodeId
                    };
                    set({ graph: newGraph });
                }
                // Add edge (collaborative when enabled)
                addEdge: (edge) => {
                    const { crdtAdapter, isCollaborative, graph } = get();
                    if (isCollaborative && crdtAdapter) {
                        crdtAdapter.addEdge(edge);
                    }
                    else {
                        // Non-collaborative mode
                        const newGraph = {
                            nodes: graph.nodes,
                            edges: [...graph.edges, edge],
                        };
                        set({ graph: newGraph });
                    }
                    // Delete edge (collaborative when enabled)
                    deleteEdge: (edgeId) => {
                        const { crdtAdapter, isCollaborative, graph } = get();
                        if (isCollaborative && crdtAdapter) {
                            crdtAdapter.deleteEdge(edgeId);
                        }
                        else {
                            // Non-collaborative mode
                            const newGraph = {
                                nodes: graph.nodes,
                                edges: graph.edges.filter(edge => edge.id !== edgeId),
                            };
                            set({ graph: newGraph });
                        }
                        // Update node position (React Flow integration)
                        updateNodePosition: (nodeId, position) => {
                            const { crdtAdapter, isCollaborative } = get();
                            if (isCollaborative && crdtAdapter) {
                                crdtAdapter.updateNodePosition(nodeId, position);
                                // In non-collaborative mode, position updates are handled by React Flow
                            }
                            // Update local user presence
                            updateLocalPresence: (presence) => {
                                const { crdtAdapter, localPresence, userId } = get();
                                if (localPresence && userId) {
                                    const newPresence = { ...localPresence, ...presence, lastSeen: Date.now() };
                                    if (crdtAdapter) {
                                        crdtAdapter.setUserPresence({});
                                        cursor: newPresence.cursor,
                                            selection;
                                        newPresence.selection,
                                            name;
                                        newPresence.name,
                                            color;
                                        newPresence.color,
                                        ;
                                    }
                                    ;
                                    set({ localPresence: newPresence });
                                }
                                // Update user cursor position
                                updateUserCursor: (nodeId, position) => {
                                    const { updateLocalPresence } = get();
                                    updateLocalPresence({});
                                    cursor: {
                                        nodeId, position;
                                    }
                                };
                                ;
                            };
                            // Update user selection
                            updateUserSelection: (nodeIds) => {
                                const { updateLocalPresence } = get();
                                updateLocalPresence({});
                                selection: nodeIds,
                                ;
                            };
                            ;
                        };
                        // Apply remote update
                        applyRemoteUpdate: (update) => {
                            const { crdtAdapter } = get();
                            if (crdtAdapter) {
                                crdtAdapter.applyRemoteUpdate(update);
                            }
                            // Get document state for initial sync
                            getDocumentState: () => {
                                const { crdtAdapter } = get();
                                return crdtAdapter ? crdtAdapter.getDocumentState() : null;
                            };
                            // Create snapshot
                            createSnapshot: () => {
                                const { crdtAdapter } = get();
                                return crdtAdapter ? crdtAdapter.createSnapshot() : null;
                            };
                            // Get metrics
                            getMetrics: () => {
                                const { crdtAdapter } = get();
                                return crdtAdapter ? crdtAdapter.getMetrics() : null;
                            };
                            // Get sync state
                            getSyncState: () => {
                                const { crdtAdapter } = get();
                                return crdtAdapter ? crdtAdapter.getSyncState() : null;
                            };
                            ;
                        };
                        ;
                    };
                };
            };
        };
    };
};
