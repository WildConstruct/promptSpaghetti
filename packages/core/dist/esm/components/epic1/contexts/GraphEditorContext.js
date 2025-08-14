import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { applyNodeChanges, applyEdgeChanges, MarkerType, } from 'reactflow';
const GraphEditorContext = createContext(undefined);
export const GraphEditorProvider = ({ children, initialNodes = [], initialEdges = [], onNodesChangeProp, onEdgesChangeProp, }) => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [activatedEdges, setActivatedEdges] = useState(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedEdges, setSelectedEdges] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const activatedEdgesRef = useRef(activatedEdges);
    activatedEdgesRef.current = activatedEdges;
    // Notify parent component of changes
    useEffect(() => {
        if (onNodesChangeProp) {
            onNodesChangeProp(nodes);
        }
    }, [nodes, onNodesChangeProp]);
    useEffect(() => {
        if (onEdgesChangeProp) {
            onEdgesChangeProp(edges);
        }
    }, [edges, onEdgesChangeProp]);
    // Handle node changes
    const onNodesChange = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);
    // Handle edge changes
    const onEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);
    // Handle new connections
    const onConnect = useCallback((connection) => {
        if (!connection.source || !connection.target)
            return;
        const newEdge = {
            id: `${connection.source}-${connection.target}`,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'default',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
            },
        };
        setEdges((eds) => [...eds, newEdge]);
        // Briefly highlight the new edge
        setActivatedEdges((prev) => new Set([...prev, newEdge.id]));
        setTimeout(() => {
            setActivatedEdges((prev) => {
                const next = new Set(prev);
                next.delete(newEdge.id);
                return next;
            });
        }, 500);
    }, []);
    // Handle node click
    const handleNodeClick = useCallback((event, node) => {
        event.stopPropagation();
        setSelectedNodes([node.id]);
        setSelectedEdges([]);
    }, []);
    // Handle edge click
    const handleEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        setSelectedEdges([edge.id]);
        setSelectedNodes([]);
    }, []);
    // Handle pane click (deselect all)
    const handlePaneClick = useCallback(() => {
        setSelectedNodes([]);
        setSelectedEdges([]);
    }, []);
    // Handle selection change
    const handleSelectionChange = useCallback((params) => {
        setSelectedNodes(params.nodes.map((n) => n.id));
        setSelectedEdges(params.edges.map((e) => e.id));
    }, []);
    // Delete selected elements
    const deleteSelectedElements = useCallback(() => {
        if (selectedNodes.length > 0) {
            setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));
            setEdges((eds) => eds.filter((edge) => !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)));
        }
        if (selectedEdges.length > 0) {
            setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
        }
        setSelectedNodes([]);
        setSelectedEdges([]);
    }, [selectedNodes, selectedEdges]);
    // Duplicate selected nodes
    const duplicateSelectedNodes = useCallback(() => {
        if (selectedNodes.length === 0)
            return;
        const nodesToDuplicate = nodes.filter((node) => selectedNodes.includes(node.id));
        const duplicatedNodes = nodesToDuplicate.map((node) => ({
            ...node,
            id: `${node.id}_copy_${Date.now()}`,
            position: {
                x: node.position.x + 100,
                y: node.position.y + 100,
            },
            selected: false,
        }));
        setNodes((nds) => [...nds, ...duplicatedNodes]);
        setSelectedNodes(duplicatedNodes.map((n) => n.id));
    }, [nodes, selectedNodes]);
    // Select all nodes
    const selectAllNodes = useCallback(() => {
        setSelectedNodes(nodes.map((n) => n.id));
        setSelectedEdges([]);
    }, [nodes]);
    // Fit view
    const fitView = useCallback(() => {
        if (reactFlowInstance) {
            reactFlowInstance.fitView({
                padding: 0.1,
                includeHiddenNodes: false,
                minZoom: 0.5,
                maxZoom: 1.5,
            });
        }
    }, [reactFlowInstance]);
    const value = {
        // State
        nodes,
        edges,
        activatedEdges,
        isDragging,
        isSelecting,
        selectedNodes,
        selectedEdges,
        // Actions
        setNodes,
        setEdges,
        setIsDragging,
        setIsSelecting,
        onNodesChange,
        onEdgesChange,
        onConnect,
        // Event handlers
        handleNodeClick,
        handleEdgeClick,
        handlePaneClick,
        handleSelectionChange,
        // ReactFlow instance
        reactFlowInstance,
        setReactFlowInstance,
        // Preview state
        showPreview,
        setShowPreview,
        // Utility functions
        deleteSelectedElements,
        duplicateSelectedNodes,
        selectAllNodes,
        fitView,
        // Callbacks
        onNodesChangeProp,
        onEdgesChangeProp,
    };
    return (_jsx(GraphEditorContext.Provider, { value: value, children: children }));
};
export const useGraphEditor = () => {
    const context = useContext(GraphEditorContext);
    if (!context) {
        throw new Error('useGraphEditor must be used within a GraphEditorProvider');
    }
    return context;
};
