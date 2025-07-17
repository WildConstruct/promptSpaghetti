"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCollaborativeActions = exports.useCollaborativeGraph = exports.useLocalPresence = exports.useConnectionStatus = exports.useConnectedUsers = exports.useCollaborationEnabled = exports.useCollaborativeGraphStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const GraphCRDTAdapter_1 = require("./GraphCRDTAdapter");
exports.useCollaborativeGraphStore = (0, zustand_1.create)()((0, middleware_1.subscribeWithSelector)((set, get) => ({
    graph: { nodes: [], edges: [] },
    isCollaborative: false,
    collaborationEnabled: false,
    connectedUsers: new Map(),
    isConnected: false,
    connectionStatus: 'disconnected',
    enableCollaboration: async (options) => {
        const currentGraph = get().graph;
        const crdtAdapter = new GraphCRDTAdapter_1.GraphCRDTAdapter({
            ...options,
            onGraphChange: (graph) => {
                set({ graph, lastSyncTime: Date.now() });
            },
            onUserPresence: (awareness) => {
                const connectedUsers = new Map();
                awareness.forEach((presence, userId) => {
                    connectedUsers.set(userId, {
                        userId: presence.userId,
                        name: presence.name || 'Anonymous',
                        color: presence.color || '#0066cc',
                        cursor: presence.cursor,
                        selection: presence.selection,
                        lastSeen: presence.timestamp
                    });
                });
                set({ connectedUsers });
            },
            onConnectionStatus: (connected) => {
                set({
                    isConnected: connected,
                    connectionStatus: connected ? 'connected' : 'disconnected'
                });
            }
        }, currentGraph);
        set({
            crdtAdapter,
            isCollaborative: true,
            collaborationEnabled: true,
            documentId: options.documentId,
            userId: options.userId,
            connectionStatus: 'connecting',
            localPresence: {
                userId: options.userId,
                name: 'You',
                color: '#0066cc',
                lastSeen: Date.now()
            }
        });
    },
    disableCollaboration: () => {
        const { crdtAdapter } = get();
        if (crdtAdapter) {
            crdtAdapter.destroy();
        }
        set({
            crdtAdapter: undefined,
            isCollaborative: false,
            collaborationEnabled: false,
            documentId: undefined,
            userId: undefined,
            connectedUsers: new Map(),
            localPresence: undefined,
            isConnected: false,
            connectionStatus: 'disconnected'
        });
    },
    setGraph: (graph) => {
        const { crdtAdapter, isCollaborative } = get();
        if (isCollaborative && crdtAdapter) {
            console.warn('Direct graph replacement not recommended in collaborative mode');
        }
        else {
            set({ graph });
        }
    },
    addNode: (node, position) => {
        const { crdtAdapter, isCollaborative, graph } = get();
        if (isCollaborative && crdtAdapter) {
            crdtAdapter.addNode(node, position);
        }
        else {
            const newGraph = {
                nodes: [...graph.nodes, node],
                edges: graph.edges
            };
            set({ graph: newGraph });
        }
    },
    updateNode: (nodeId, updates) => {
        const { crdtAdapter, isCollaborative, graph } = get();
        if (isCollaborative && crdtAdapter) {
            crdtAdapter.updateNode(nodeId, updates);
        }
        else {
            const newGraph = {
                ...graph,
                nodes: graph.nodes.map(node => node.id === nodeId ? { ...node, ...updates } : node)
            };
            set({ graph: newGraph });
        }
    },
    deleteNode: (nodeId) => {
        const { crdtAdapter, isCollaborative, graph } = get();
        if (isCollaborative && crdtAdapter) {
            crdtAdapter.deleteNode(nodeId);
        }
        else {
            const newGraph = {
                nodes: graph.nodes.filter(node => node.id !== nodeId),
                edges: graph.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
            };
            set({ graph: newGraph });
        }
    },
    addEdge: (edge) => {
        const { crdtAdapter, isCollaborative, graph } = get();
        if (isCollaborative && crdtAdapter) {
            crdtAdapter.addEdge(edge);
        }
        else {
            const newGraph = {
                nodes: graph.nodes,
                edges: [...graph.edges, edge]
            };
            set({ graph: newGraph });
        }
    },
    deleteEdge: (edgeId) => {
        const { crdtAdapter, isCollaborative, graph } = get();
        if (isCollaborative && crdtAdapter) {
            crdtAdapter.deleteEdge(edgeId);
        }
        else {
            const newGraph = {
                nodes: graph.nodes,
                edges: graph.edges.filter(edge => edge.id !== edgeId)
            };
            set({ graph: newGraph });
        }
    },
    updateNodePosition: (nodeId, position) => {
        const { crdtAdapter, isCollaborative } = get();
        if (isCollaborative && crdtAdapter) {
            crdtAdapter.updateNodePosition(nodeId, position);
        }
    },
    updateLocalPresence: (presence) => {
        const { crdtAdapter, localPresence, userId } = get();
        if (localPresence && userId) {
            const newPresence = { ...localPresence, ...presence, lastSeen: Date.now() };
            if (crdtAdapter) {
                crdtAdapter.setUserPresence({
                    cursor: newPresence.cursor,
                    selection: newPresence.selection,
                    name: newPresence.name,
                    color: newPresence.color
                });
            }
            set({ localPresence: newPresence });
        }
    },
    updateUserCursor: (nodeId, position) => {
        const { updateLocalPresence } = get();
        updateLocalPresence({
            cursor: { nodeId, position }
        });
    },
    updateUserSelection: (nodeIds) => {
        const { updateLocalPresence } = get();
        updateLocalPresence({
            selection: nodeIds
        });
    },
    applyRemoteUpdate: (update) => {
        const { crdtAdapter } = get();
        if (crdtAdapter) {
            crdtAdapter.applyRemoteUpdate(update);
        }
    },
    getDocumentState: () => {
        const { crdtAdapter } = get();
        return crdtAdapter ? crdtAdapter.getDocumentState() : null;
    },
    createSnapshot: () => {
        const { crdtAdapter } = get();
        return crdtAdapter ? crdtAdapter.createSnapshot() : null;
    },
    getMetrics: () => {
        const { crdtAdapter } = get();
        return crdtAdapter ? crdtAdapter.getMetrics() : null;
    },
    getSyncState: () => {
        const { crdtAdapter } = get();
        return crdtAdapter ? crdtAdapter.getSyncState() : null;
    }
})));
const useCollaborationEnabled = () => (0, exports.useCollaborativeGraphStore)(state => state.collaborationEnabled);
exports.useCollaborationEnabled = useCollaborationEnabled;
const useConnectedUsers = () => (0, exports.useCollaborativeGraphStore)(state => state.connectedUsers);
exports.useConnectedUsers = useConnectedUsers;
const useConnectionStatus = () => (0, exports.useCollaborativeGraphStore)(state => state.connectionStatus);
exports.useConnectionStatus = useConnectionStatus;
const useLocalPresence = () => (0, exports.useCollaborativeGraphStore)(state => state.localPresence);
exports.useLocalPresence = useLocalPresence;
const useCollaborativeGraph = () => (0, exports.useCollaborativeGraphStore)(state => state.graph);
exports.useCollaborativeGraph = useCollaborativeGraph;
const useCollaborativeActions = () => (0, exports.useCollaborativeGraphStore)(state => ({
    enableCollaboration: state.enableCollaboration,
    disableCollaboration: state.disableCollaboration,
    addNode: state.addNode,
    updateNode: state.updateNode,
    deleteNode: state.deleteNode,
    addEdge: state.addEdge,
    deleteEdge: state.deleteEdge,
    updateNodePosition: state.updateNodePosition,
    updateLocalPresence: state.updateLocalPresence,
    updateUserCursor: state.updateUserCursor,
    updateUserSelection: state.updateUserSelection
}));
exports.useCollaborativeActions = useCollaborativeActions;
//# sourceMappingURL=collaborativeGraphStore.js.map