"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCollaborativeReactFlow = useCollaborativeReactFlow;
exports.useNodeCollaborators = useNodeCollaborators;
exports.useCollaborationStatus = useCollaborationStatus;
const react_1 = require("react");
const reactflow_1 = require("reactflow");
const collaborativeGraphStore_1 = require("./collaborativeGraphStore");
function useCollaborativeReactFlow() {
    const reactFlowInstance = (0, reactflow_1.useReactFlow)();
    const { enableCollaboration, disableCollaboration, addNode, updateNode, deleteNode, addEdge, deleteEdge, updateNodePosition, updateUserCursor, updateUserSelection } = (0, collaborativeGraphStore_1.useCollaborativeActions)();
    const { graph, isCollaborative, collaborationEnabled, connectionStatus, localPresence } = (0, collaborativeGraphStore_1.useCollaborativeGraphStore)();
    const connectedUsers = (0, collaborativeGraphStore_1.useConnectedUsers)();
    const flowNodes = (0, react_1.useMemo)(() => {
        return graph.nodes.map(node => ({
            id: node.id,
            type: node.type.toLowerCase(),
            position: { x: 0, y: 0 },
            data: {
                ...node,
                isCollaborative,
                collaborators: isCollaborative ? getNodeCollaborators(node.id, connectedUsers) : []
            }
        }));
    }, [graph.nodes, isCollaborative, connectedUsers]);
    const flowEdges = (0, react_1.useMemo)(() => {
        return graph.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            type: 'step',
            style: {
                stroke: '#666',
                strokeWidth: 2,
                ...(isCollaborative && isEdgeBeingEdited(edge.id, connectedUsers) && {
                    stroke: '#ff6b6b',
                    strokeWidth: 3
                })
            }
        }));
    }, [graph.edges, isCollaborative, connectedUsers]);
    const onNodesChange = (0, react_1.useCallback)((changes) => {
        changes.forEach(change => {
            switch (change.type) {
                case 'position':
                    if (change.position && change.dragging === false) {
                        updateNodePosition(change.id, change.position);
                    }
                    break;
                case 'remove':
                    deleteNode(change.id);
                    break;
            }
        });
    }, [updateNodePosition, deleteNode]);
    const onEdgesChange = (0, react_1.useCallback)((changes) => {
        changes.forEach(change => {
            switch (change.type) {
                case 'remove':
                    deleteEdge(change.id);
                    break;
            }
        });
    }, [deleteEdge]);
    const onConnect = (0, react_1.useCallback)((connection) => {
        if (connection.source && connection.target) {
            const newEdge = {
                id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                source: connection.source,
                target: connection.target,
                sourceHandle: connection.sourceHandle || undefined,
                targetHandle: connection.targetHandle || undefined
            };
            addEdge(newEdge);
        }
    }, [addEdge]);
    const onNodeDrag = (0, react_1.useCallback)((event, node) => {
        if (isCollaborative) {
            updateUserCursor(node.id, node.position);
        }
    }, [isCollaborative, updateUserCursor]);
    const onSelectionChange = (0, react_1.useCallback)((params) => {
        if (isCollaborative) {
            const selectedNodeIds = params.nodes.map(node => node.id);
            updateUserSelection(selectedNodeIds);
        }
    }, [isCollaborative, updateUserSelection]);
    const onPaneClick = (0, react_1.useCallback)(() => {
        if (isCollaborative) {
            updateUserCursor();
            updateUserSelection([]);
        }
    }, [isCollaborative, updateUserCursor, updateUserSelection]);
    const addNodeAtPosition = (0, react_1.useCallback)((node, position) => {
        addNode(node, position);
    }, [addNode]);
    const getUserCursors = (0, react_1.useCallback)(() => {
        if (!isCollaborative)
            return [];
        const cursors = [];
        connectedUsers.forEach((user, userId) => {
            if (user.cursor?.position && userId !== localPresence?.userId) {
                cursors.push({
                    userId,
                    user,
                    position: user.cursor.position,
                    nodeId: user.cursor.nodeId
                });
            }
        });
        return cursors;
    }, [isCollaborative, connectedUsers, localPresence]);
    const getRemoteSelections = (0, react_1.useCallback)(() => {
        if (!isCollaborative)
            return new Map();
        const selections = new Map();
        connectedUsers.forEach((user, userId) => {
            if (user.selection && userId !== localPresence?.userId) {
                user.selection.forEach(nodeId => {
                    if (!selections.has(nodeId)) {
                        selections.set(nodeId, []);
                    }
                    selections.get(nodeId).push(user);
                });
            }
        });
        return selections;
    }, [isCollaborative, connectedUsers, localPresence]);
    (0, react_1.useEffect)(() => {
        if (reactFlowInstance && flowNodes.length > 0) {
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.1 });
            }, 100);
        }
    }, [reactFlowInstance, flowNodes.length]);
    return {
        nodes: flowNodes,
        edges: flowEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeDrag,
        onSelectionChange,
        onPaneClick,
        enableCollaboration,
        disableCollaboration,
        addNodeAtPosition,
        isCollaborative,
        collaborationEnabled,
        connectionStatus,
        connectedUsers,
        getUserCursors,
        getRemoteSelections,
        isConnected: connectionStatus === 'connected'
    };
}
function getNodeCollaborators(nodeId, connectedUsers) {
    const collaborators = [];
    connectedUsers.forEach(user => {
        if (user.cursor?.nodeId === nodeId || user.selection?.includes(nodeId)) {
            collaborators.push(user);
        }
    });
    return collaborators;
}
function isEdgeBeingEdited(edgeId, connectedUsers) {
    return false;
}
function useNodeCollaborators(nodeId) {
    const connectedUsers = (0, collaborativeGraphStore_1.useConnectedUsers)();
    const localPresence = (0, collaborativeGraphStore_1.useCollaborativeGraphStore)(state => state.localPresence);
    return (0, react_1.useMemo)(() => {
        const collaborators = [];
        connectedUsers.forEach((user, userId) => {
            if (userId !== localPresence?.userId) {
                if (user.cursor?.nodeId === nodeId || user.selection?.includes(nodeId)) {
                    collaborators.push(user);
                }
            }
        });
        return collaborators;
    }, [nodeId, connectedUsers, localPresence]);
}
function useCollaborationStatus() {
    return (0, collaborativeGraphStore_1.useCollaborativeGraphStore)(state => ({
        isCollaborative: state.isCollaborative,
        connectionStatus: state.connectionStatus,
        isConnected: state.isConnected,
        connectedUserCount: state.connectedUsers.size,
        lastSyncTime: state.lastSyncTime
    }));
}
//# sourceMappingURL=useCollaborativeReactFlow.js.map