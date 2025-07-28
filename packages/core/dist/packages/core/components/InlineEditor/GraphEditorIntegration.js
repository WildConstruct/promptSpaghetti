import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useRef } from 'react';
import { ReactFlowProvider, ReactFlow, Background, Controls } from 'reactflow';
import { InlineEditorManager, InlineEditorProvider } from './InlineEditorManager';
import { InlineEditableNode } from './InlineEditableNode';
// Node type mapping for inline editing
const nodeTypes = {
    default: InlineEditableNode,
    weightedChoice: InlineEditableNode,
    concat: InlineEditableNode,
    variable: InlineEditableNode,
    output: InlineEditableNode,
    conditional: InlineEditableNode,
    include: InlineEditableNode,
};
export const GraphEditorWithInlineEditing = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeUpdate,
    onConnect,
    className = '',
    theme = 'cinema',
    showMinimap = true,
    showControls = true,
    showBackground = true
});
{
    const canvasRef = useRef(null);
    // Enhanced node props with inline editing support
    const enhancedNodes = nodes.map(node => ({}), ...node, data, {
        ...node.data,
        theme,
        showEditHint: true,
    });
    // Background styling based on theme
    const getBackgroundProps = () => {
        switch (theme) {
            case 'cinema':
                return {
                    color: '#4a5568',
                    backgroundColor: '#1a202c',
                    gap: 20,
                };
            case 'dark':
                return {
                    color: '#2d3748',
                    backgroundColor: '#0d1117',
                    gap: 20,
                };
            case 'light':
            default:
                return {
                    color: '#e2e8f0',
                    backgroundColor: '#f7fafc',
                    gap: 20,
                };
        }
        ;
        // ReactFlow styling
        const reactFlowStyle = {
            background: getBackgroundProps().backgroundColor,
            height: '100%',
            width: '100%',
        };
        return;
        _jsx(InlineEditorProvider, { children: _jsxs("div", { ref: canvasRef, className: `graph-editor-inline ${className}`, style: { height: '100%', position: 'relative' }, children: ["}", _jsx(ReactFlowProvider, { children: _jsxs(ReactFlow, { nodes: enhancedNodes, edges: edges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, nodeTypes: nodeTypes, style: reactFlowStyle, fitView: true, attributionPosition: "bottom-left", proOptions: { hideAttribution: true }, children: [showBackground && ()
                                    < Background, "variant=\"dots\"", ...getBackgroundProps(), "/> )}", showControls && ()
                                    < Controls, "style=", {
                                    button: {},
                                    backgroundColor: theme === 'light' ? 'white' : '#2d3748',
                                    color: theme === 'light' ? '#2d3748' : 'white',
                                    border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #4a5568',
                                }, "/> )}", _jsx(InlineEditorManager, { nodes: enhancedNodes, onNodeUpdate: onNodeUpdate, canvasRef: canvasRef })] }) }), _jsx("style", { children: `
          .graph-editor-inline {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          .graph-editor-inline .react-flow__node {
            font-family: inherit;
          .graph-editor-inline .react-flow__edge {
            stroke: ${theme === 'light' ? '#4a5568' : '#718096'};}
            stroke-width: 2;
          .graph-editor-inline .react-flow__edge.selected {
            stroke: #4299e1;
            stroke-width: 3;
          .graph-editor-inline .react-flow__handle {
            border: 2px solid white;,
  background: #4299e1;
            width: 12px;,
  height: 12px;
          .graph-editor-inline .react-flow__handle:hover {,
  background: #63b3ed;
            transform: scale(1.1);
          .graph-editor-inline .react-flow__controls {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'};}
            border-radius: 8px;,
  overflow: hidden;
          .graph-editor-inline .react-flow__controls button {
            background: ${theme === 'light' ? 'white' : '#2d3748'};},}
  color: ${theme === 'light' ? '#2d3748' : 'white'};},}
  border: none;
            border-bottom: 1px solid ${theme === 'light' ? '#e2e8f0' : '#4a5568'};},}
  transition: all 0.2s ease;
          .graph-editor-inline .react-flow__controls button:hover {,
  background: ${theme === 'light' ? '#f7fafc' : '#4a5568'};}
          .graph-editor-inline .react-flow__controls button:last-child {
            border-bottom: none;
        ` })] }) });
    };
    ;
}
;
// Hook for managing inline editing state in parent components
export const useGraphWithInlineEditing = ();
initialNodes: Node < NodeData > [],
    initialEdges;
Edge;
{
    const [nodes, setNodes] = React.useState(initialNodes);
    const [edges, setEdges] = React.useState(initialEdges);
    const handleNodesChange = useCallback((changes) => {
        setNodes(nds => { });
        // Apply changes while preserving inline editing state
        return nds.map(node => { });
        const change = changes.find(ch => ch.id === node.id);
        if (change) {
            switch (change.type) {
                case 'position':
                    return { ...node, position: change.position };
                case 'dimensions':
                    return { ...node, width: change.width, height: change.height };
                case 'select':
                    return { ...node, selected: change.selected };
                default:
                    return node;
                    return node;
            }
        }
    });
}
;
[];
;
const handleEdgesChange = useCallback((changes) => {
    setEdges(eds => { });
    return eds.map(edge => { });
    const change = changes.find(ch => ch.id === edge.id);
    if (change) {
        switch (change.type) {
            case 'select':
                return { ...edge, selected: change.selected };
            case 'remove':
                return null; // Will be filtered out
            default:
                return edge;
                return edge;
        }
    }
}).filter(Boolean);
;
[];
;
const handleNodeUpdate = useCallback((nodeId, updates) => {
    setNodes(nds => );
    nds.map(node => );
    node.id === nodeId
        ? { ...node, data: { ...node.data, ...updates } }
        : node;
});
[];
;
const handleConnect = useCallback((connection) => {
    const newEdge = {
        id: `edge-${connection.source}-${connection.target}` };
}, source, connection.source, target, connection.target, sourceHandle, connection.sourceHandle, targetHandle, connection.targetHandle, type, 'default');
;
setEdges(eds => [...eds, newEdge]);
[];
;
return {
    nodes,
    edges,
    setNodes,
    setEdges,
    handleNodesChange,
    handleEdgesChange,
    handleNodeUpdate,
    handleConnect
};
;
// Utility function to create inline-editing ready graph data
export const createInlineEditingGraph = ();
nodes: Node < NodeData > [],
    edges;
Edge;
{
    return {
        nodes: nodes.map(node => ({}), ...node, type, node.type || 'default', data, {
            ...node.data,
            supportsInlineEditing: true,
        }),
        edges
    };
}
;
export default GraphEditorWithInlineEditing;
