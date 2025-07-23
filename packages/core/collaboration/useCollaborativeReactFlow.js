/**
 * React Flow Collaborative Integration Hook - Epic 9.1.2
 * Integrates CRDT collaborative editing with React Flow editor
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useReactFlow } from 'reactflow';
import { useCollaborativeGraphStore, useCollaborativeActions, useConnectedUsers } from './collaborativeGraphStore';
/**
 * Hook that bridges collaborative graph store with React Flow
 */
export function useCollaborativeReactFlow() {
    const reactFlowInstance = useReactFlow();
    const { enableCollaboration, disableCollaboration, addNode, updateNode, deleteNode, addEdge, deleteEdge, updateNodePosition, updateUserCursor, updateUserSelection } = useCollaborativeActions();
    const { graph, isCollaborative, collaborationEnabled, connectionStatus, localPresence } = useCollaborativeGraphStore();
    const connectedUsers = useConnectedUsers();
    // Convert graph nodes to React Flow nodes
    const flowNodes = useMemo(() => {
        return graph.nodes.map(node => ({
            id: node.id,
            type: node.type.toLowerCase(),
            position: { x: 0, y: 0 }, // Position will be managed by React Flow
            data: {
                ...node,
                isCollaborative,
                // Add collaborative metadata
                collaborators: isCollaborative ? getNodeCollaborators(node.id, connectedUsers) : []
            }
        }));
    }, [graph.nodes, isCollaborative, connectedUsers]);
    // Convert graph edges to React Flow edges
    const flowEdges = useMemo(() => {
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
                // Highlight if being edited by collaborators
                ...(isCollaborative && isEdgeBeingEdited(edge.id, connectedUsers) && {
                    stroke: '#ff6b6b',
                    strokeWidth: 3
                })
            }
        }));
    }, [graph.edges, isCollaborative, connectedUsers]);
    // Handle node changes (position, deletion, etc.)
    const onNodesChange = useCallback((changes) => {
        changes.forEach(change => {
            switch (change.type) {
                case 'position':
                    if (change.position && change.dragging === false) {
                        // Only update position when drag is complete
                        updateNodePosition(change.id, change.position);
                    }
                    break;
                case 'remove':
                    deleteNode(change.id);
                    break;
            }
        });
    }, [updateNodePosition, deleteNode]);
    // Handle edge changes
    const onEdgesChange = useCallback((changes) => {
        changes.forEach(change => {
            switch (change.type) {
                case 'remove':
                    deleteEdge(change.id);
                    break;
            }
        });
    }, [deleteEdge]);
    // Handle new connections
    const onConnect = useCallback((connection) => {
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
    // Handle node drag for presence updates
    const onNodeDrag = useCallback((event, node) => {
        if (isCollaborative) {
            updateUserCursor(node.id, node.position);
        }
    }, [isCollaborative, updateUserCursor]);
    // Handle node selection for presence updates
    const onSelectionChange = useCallback((params) => {
        if (isCollaborative) {
            const selectedNodeIds = params.nodes.map(node => node.id);
            updateUserSelection(selectedNodeIds);
        }
    }, [isCollaborative, updateUserSelection]);
    // Handle pane click to clear selection
    const onPaneClick = useCallback(() => {
        if (isCollaborative) {
            updateUserCursor(); // Clear cursor
            updateUserSelection([]); // Clear selection
        }
    }, [isCollaborative, updateUserCursor, updateUserSelection]);
    // Add new node at specific position
    const addNodeAtPosition = useCallback((node, position) => {
        addNode(node, position);
    }, [addNode]);
    // Get user cursors for rendering
    const getUserCursors = useCallback(() => {
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
    // Get selected nodes by other users
    const getRemoteSelections = useCallback(() => {
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
    // Update React Flow viewport when needed
    useEffect(() => {
        if (reactFlowInstance && flowNodes.length > 0) {
            // Fit view when nodes are first loaded
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.1 });
            }, 100);
        }
    }, [reactFlowInstance, flowNodes.length]);
    return {
        // React Flow props
        nodes: flowNodes,
        edges: flowEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeDrag,
        onSelectionChange,
        onPaneClick,
        // Collaboration-specific actions
        enableCollaboration,
        disableCollaboration,
        addNodeAtPosition,
        // Collaboration state
        isCollaborative,
        collaborationEnabled,
        connectionStatus,
        connectedUsers,
        // Presence and cursors
        getUserCursors,
        getRemoteSelections,
        // Utility
        isConnected: connectionStatus === 'connected'
    };
}
/**
 * Get users who are currently interacting with a specific node
 */
function getNodeCollaborators(nodeId, connectedUsers) {
    const collaborators = [];
    connectedUsers.forEach(user => {
        if (user.cursor?.nodeId === nodeId || user.selection?.includes(nodeId)) {
            collaborators.push(user);
        }
    });
    return collaborators;
}
/**
 * Check if an edge is being edited by any collaborator
 */
function isEdgeBeingEdited(edgeId, connectedUsers) {
    // For now, we don't track edge-specific interactions
    // This could be extended to track edge selection/editing
    return false;
}
/**
 * Hook for collaborative node components to show presence
 */
export function useNodeCollaborators(nodeId) {
    const connectedUsers = useConnectedUsers();
    const localPresence = useCollaborativeGraphStore(state => state.localPresence);
    return useMemo(() => {
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
/**
 * Hook for showing connection status indicator
 */
export function useCollaborationStatus() {
    return useCollaborativeGraphStore(state => ({
        isCollaborative: state.isCollaborative,
        connectionStatus: state.connectionStatus,
        isConnected: state.isConnected,
        connectedUserCount: state.connectedUsers.size,
        lastSyncTime: state.lastSyncTime
    }));
}
