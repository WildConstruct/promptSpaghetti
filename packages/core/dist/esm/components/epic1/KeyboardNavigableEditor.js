import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Keyboard-navigable editor component for Epic 1
 * Provides Tab/Shift+Tab navigation and auto-focus for inline editable nodes
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, ReactFlowProvider, Controls, Background, useReactFlow } from 'reactflow';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { VisualRangeIndicator } from './VisualRangeIndicator';
import 'reactflow/dist/style.css';
function KeyboardNavigableEditorInternal({ promptAnalysis, initialNodes = [], initialEdges = [], onNodesChange, onEdgesChange, onCanvasClick, onEscapePress, className = '', showVisualIndicators = true }) {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [hoveredTextRange, setHoveredTextRange] = useState(null);
    const canvasRef = useRef(null);
    const { getNodes, setNodes: setFlowNodes } = useReactFlow();
    // Handle node selection
    const handleNodeSelect = useCallback((nodeId) => {
        setSelectedNodeId(nodeId);
        // Update node selection state
        setNodes(currentNodes => currentNodes.map(node => ({
            ...node,
            selected: node.id === nodeId
        })));
    }, []);
    // Handle escape key - cancel current edit
    const handleEditCancel = useCallback((nodeId) => {
        setNodes(currentNodes => currentNodes.map(node => {
            if (node.id === nodeId) {
                // Restore original value and exit edit mode
                return {
                    ...node,
                    data: {
                        ...node.data,
                        isEditing: false,
                        // Restore from backup if available
                        value: node.data.originalValue || node.data.value
                    }
                };
            }
            return node;
        }));
        setSelectedNodeId(null);
    }, []);
    // Handle escape press at editor level
    const handleEscapePress = useCallback(() => {
        // Exit all edit modes
        setNodes(currentNodes => currentNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                isEditing: false
            }
        })));
        setSelectedNodeId(null);
        if (onEscapePress) {
            onEscapePress();
        }
    }, [onEscapePress]);
    // Set up keyboard navigation
    const { autoFocusFirstNode } = useKeyboardNavigation({
        nodes,
        selectedNodeId,
        onNodeSelect: handleNodeSelect,
        onEscapePress: handleEscapePress,
        onEditCancel: handleEditCancel,
        enabled: true
    });
    // Handle canvas click - confirm all edits
    const handleCanvasClick = useCallback((event) => {
        // Check if click is on empty canvas area
        const target = event.target;
        if (target.classList.contains('react-flow__pane') ||
            target.classList.contains('react-flow__background')) {
            // Confirm all edits
            setNodes(currentNodes => currentNodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    isEditing: false,
                    originalValue: undefined // Clear backup
                }
            })));
            setSelectedNodeId(null);
            if (onCanvasClick) {
                onCanvasClick();
            }
        }
    }, [onCanvasClick]);
    // Handle node changes from React Flow
    const handleNodesChange = useCallback((changes) => {
        setNodes(currentNodes => {
            let updatedNodes = [...currentNodes];
            changes.forEach(change => {
                if (change.type === 'position') {
                    const nodeIndex = updatedNodes.findIndex(n => n.id === change.id);
                    if (nodeIndex !== -1) {
                        updatedNodes[nodeIndex] = {
                            ...updatedNodes[nodeIndex],
                            position: change.position
                        };
                    }
                }
                // Handle other change types as needed
            });
            return updatedNodes;
        });
    }, []);
    // Handle edge changes from React Flow
    const handleEdgesChange = useCallback((changes) => {
        setEdges(currentEdges => {
            let updatedEdges = [...currentEdges];
            // Handle edge changes
            return updatedEdges;
        });
    }, []);
    // Update parent when nodes change
    useEffect(() => {
        if (onNodesChange) {
            onNodesChange(nodes);
        }
    }, [nodes, onNodesChange]);
    // Update parent when edges change  
    useEffect(() => {
        if (onEdgesChange) {
            onEdgesChange(edges);
        }
    }, [edges, onEdgesChange]);
    // Generate nodes from prompt analysis if provided
    useEffect(() => {
        if (promptAnalysis && promptAnalysis.nodes.length > 0) {
            const generatedNodes = promptAnalysis.nodes.map((genNode, index) => {
                const node = genNode.node;
                const mapping = promptAnalysis.mappings.find(m => m.nodeId === node.serialize().id);
                return {
                    id: node.serialize().id,
                    type: 'default',
                    position: {
                        x: 100 + (index % 3) * 250,
                        y: 100 + Math.floor(index / 3) * 150
                    },
                    data: {
                        ...node.serialize(),
                        isEditing: true, // Start in edit mode
                        originalValue: node.serialize().value, // Backup for cancel
                        label: node.getNodeType(),
                        sourceRange: mapping ? { start: mapping.startIndex, end: mapping.endIndex } : undefined
                    }
                };
            });
            setNodes(generatedNodes);
            // Auto-connect nodes in sequence
            const generatedEdges = generatedNodes.slice(0, -1).map((node, index) => ({
                id: `e${node.id}-${generatedNodes[index + 1].id}`,
                source: node.id,
                target: generatedNodes[index + 1].id,
                type: 'default'
            }));
            setEdges(generatedEdges);
        }
    }, [promptAnalysis]);
    // Custom node component with edit support
    const nodeTypes = React.useMemo(() => ({
        default: (props) => {
            const { data, selected } = props;
            const isHovered = hoveredNodeId === props.id;
            return (_jsxs("div", { "data-node-id": props.id, className: `
            border-2 rounded-lg p-4 bg-white shadow-lg transition-all
            ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}
            ${isHovered ? 'scale-105 shadow-xl' : ''}
            ${data.isEditing ? 'ring-2 ring-green-400' : ''}
          `, onMouseEnter: () => setHoveredNodeId(props.id), onMouseLeave: () => setHoveredNodeId(null), children: [_jsx("div", { className: "font-semibold text-sm text-gray-600 mb-2", children: data.label || data.type }), data.isEditing ? (_jsxs("div", { className: "space-y-2", children: [data.type === 'TextBlock' && (_jsx("textarea", { className: "w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400", value: data.value || '', onChange: (e) => {
                                    setNodes(nodes => nodes.map(node => node.id === props.id
                                        ? { ...node, data: { ...node.data, value: e.target.value } }
                                        : node));
                                }, autoFocus: selected, placeholder: "Enter text...", rows: 2 })), data.type === 'WeightedChoice' && (_jsx("div", { className: "space-y-1", children: (data.value || []).map((choice, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "text", className: "flex-1 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400", value: choice.text || '', onChange: (e) => {
                                                const newChoices = [...(data.value || [])];
                                                newChoices[index] = { ...newChoices[index], text: e.target.value };
                                                setNodes(nodes => nodes.map(node => node.id === props.id
                                                    ? { ...node, data: { ...node.data, value: newChoices } }
                                                    : node));
                                            }, placeholder: `Option ${index + 1}` }), _jsx("input", { type: "number", className: "w-16 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400", value: choice.weight || 0, onChange: (e) => {
                                                const newChoices = [...(data.value || [])];
                                                newChoices[index] = { ...newChoices[index], weight: parseInt(e.target.value) || 0 };
                                                setNodes(nodes => nodes.map(node => node.id === props.id
                                                    ? { ...node, data: { ...node.data, value: newChoices } }
                                                    : node));
                                            }, min: "0", max: "100" }), _jsx("span", { className: "text-xs text-gray-500", children: "%" })] }, index))) }))] })) : (_jsxs("div", { className: "text-sm", children: [data.type === 'TextBlock' && _jsx("div", { className: "text-gray-700", children: data.value }), data.type === 'WeightedChoice' && (_jsx("div", { className: "space-y-1", children: (data.value || []).map((choice, index) => (_jsxs("div", { className: "text-xs text-gray-600", children: ["\u2022 ", choice.text, " (", choice.weight, "%)"] }, index))) }))] })), data.sourceRange && (_jsxs("div", { className: "text-xs text-gray-400 mt-2", children: ["[", data.sourceRange.start, "-", data.sourceRange.end, "]"] }))] }));
        }
    }), [nodes, hoveredNodeId]);
    return (_jsxs("div", { className: `relative h-full ${className}`, children: [showVisualIndicators && promptAnalysis && (_jsx("div", { className: "absolute top-0 left-0 right-0 z-10 p-4 bg-white/90 backdrop-blur border-b", children: _jsx(VisualRangeIndicator, { promptAnalysis: promptAnalysis, onNodeHover: setHoveredNodeId, onTextHover: setHoveredTextRange, hoveredNodeId: hoveredNodeId, showConnectionLines: true }) })), _jsx("div", { ref: canvasRef, className: "h-full", onClick: handleCanvasClick, children: _jsxs(ReactFlow, { nodes: nodes, edges: edges, onNodesChange: handleNodesChange, onEdgesChange: handleEdgesChange, nodeTypes: nodeTypes, fitView: true, className: "bg-gray-50", children: [_jsx(Background, {}), _jsx(Controls, {})] }) }), _jsxs("div", { className: "absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg text-sm", children: [_jsx("div", { className: "font-semibold mb-1", children: "Keyboard Shortcuts" }), _jsxs("div", { className: "space-y-1 text-xs text-gray-600", children: [_jsxs("div", { children: [_jsx("kbd", { className: "px-1 py-0.5 bg-gray-100 rounded", children: "Tab" }), " / ", _jsx("kbd", { className: "px-1 py-0.5 bg-gray-100 rounded", children: "Shift+Tab" }), " - Navigate between nodes"] }), _jsxs("div", { children: [_jsx("kbd", { className: "px-1 py-0.5 bg-gray-100 rounded", children: "Enter" }), " - Confirm & next"] }), _jsxs("div", { children: [_jsx("kbd", { className: "px-1 py-0.5 bg-gray-100 rounded", children: "Escape" }), " - Cancel edit"] }), _jsx("div", { children: "Click canvas - Confirm all edits" })] })] })] }));
}
// Export wrapped component
export function KeyboardNavigableEditor(props) {
    return (_jsx(ReactFlowProvider, { children: _jsx(KeyboardNavigableEditorInternal, { ...props }) }));
}
