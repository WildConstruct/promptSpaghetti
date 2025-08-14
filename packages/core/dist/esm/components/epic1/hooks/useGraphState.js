import { useCallback, useState } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
export function useGraphState({ initialNodes = [], initialEdges = [], onNodesChangeProp, onEdgesChangeProp }) {
    const [nodes, setNodes, onNodesChangeBase] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChangeBase] = useEdgesState(initialEdges);
    const [activatedEdges, setActivatedEdges] = useState(new Set());
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    // Custom node change handler to optimize performance during dragging
    const onNodesChange = useCallback((changes) => {
        const hasDraggingChange = changes.some(change => change.type === 'position' && change.dragging === true);
        const hasStoppedDragging = changes.some(change => change.type === 'position' && change.dragging === false);
        if (hasDraggingChange) {
            setIsDragging(true);
        }
        if (hasStoppedDragging) {
            setIsDragging(false);
        }
        onNodesChangeBase(changes);
    }, [onNodesChangeBase]);
    // Custom edges change handler
    const onEdgesChange = useCallback((changes) => {
        onEdgesChangeBase(changes);
    }, [onEdgesChangeBase]);
    // Handle new connections with replacement for single input nodes
    const onConnect = useCallback((params) => {
        setEdges(eds => {
            // Check if target already has an incoming connection
            const existingIncomingEdge = eds.find(e => e.target === params.target && e.targetHandle === params.targetHandle);
            let newEdges = eds;
            if (existingIncomingEdge) {
                // Replace the existing incoming connection
                newEdges = eds.filter(e => e.id !== existingIncomingEdge.id);
            }
            // Add the new edge
            const edgeParams = {
                ...params,
                id: `${params.source || 'unknown'}-${params.target || 'unknown'}-${Date.now()}`,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#9ca3af', strokeWidth: 3 }
            };
            newEdges = addEdge(edgeParams, newEdges);
            return newEdges;
        });
    }, [setEdges]);
    // Handle node selection
    const handleNodeClick = useCallback((event, node) => {
        if (event.shiftKey) {
            // Multi-select with shift key
            setNodes(nds => nds.map(n => {
                if (n.id === node.id) {
                    return { ...n, selected: !n.selected };
                }
                return n;
            }));
        }
        else {
            // Single select without shift
            setNodes(nds => nds.map(n => ({
                ...n,
                selected: n.id === node.id
            })));
            setSelectedNodeId(node.id);
        }
    }, [setNodes]);
    // Handle edge click to select and activate/deactivate
    const handleEdgeClick = useCallback((event, edge) => {
        event.stopPropagation();
        if (!event.shiftKey) {
            // Single selection - clear other selections first
            setNodes(nds => nds.map(n => ({ ...n, selected: false })));
        }
        // Toggle edge selection
        setEdges(eds => {
            const updatedEdges = eds.map(e => {
                if (e.id === edge.id) {
                    const newSelected = !e.selected;
                    return { ...e, selected: newSelected };
                }
                return event.shiftKey ? e : { ...e, selected: false };
            });
            return updatedEdges;
        });
        // Toggle activation
        setActivatedEdges(prev => {
            const newSet = new Set(prev);
            if (newSet.has(edge.id)) {
                newSet.delete(edge.id);
            }
            else {
                newSet.add(edge.id);
            }
            return newSet;
        });
    }, [setEdges, setNodes]);
    // Handle canvas click to deselect all
    const handlePaneClick = useCallback((event) => {
        if (!isSelecting) {
            setNodes(nds => nds.map(n => ({ ...n, selected: false })));
            setEdges(eds => eds.map(e => ({ ...e, selected: false })));
            setSelectedNodeId(null);
            setActivatedEdges(new Set());
        }
    }, [setNodes, setEdges, isSelecting]);
    return {
        nodes,
        edges,
        activatedEdges,
        selectedNodeId,
        isDragging,
        isSelecting,
        setNodes,
        setEdges,
        setSelectedNodeId,
        setIsSelecting,
        onNodesChange,
        onEdgesChange,
        onConnect,
        handleNodeClick,
        handleEdgeClick,
        handlePaneClick
    };
}
