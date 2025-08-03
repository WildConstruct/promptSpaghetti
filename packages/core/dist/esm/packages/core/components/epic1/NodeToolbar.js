import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Node Toolbar for Epic 1
 * Draggable node palette using native HTML5 drag-and-drop
 */
import React from 'react';
import './NodeToolbar.css';
const nodeTypes = [
    { type: 'textBlock', label: 'Text', icon: 'T', color: '#7c7ff2' },
    { type: 'weightedChoice', label: 'Choice', icon: '⚖️', color: '#f6a723' },
    { type: 'concat', label: 'Concat', icon: '🔗', color: '#22c493' },
    { type: 'variable', label: 'Variable', icon: '📦', color: '#9d70f7' },
    { type: 'output', label: 'Output', icon: '📤', color: '#f15656' }
];
// Draggable node button using native HTML5 drag-and-drop
const NodeButton = ({ nodeInfo }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const handleDragStart = (e) => {
        console.log('[NodeToolbar] Drag started for:', nodeInfo.type);
        setIsDragging(true);
        // Set multiple data formats for compatibility
        e.dataTransfer.setData('text/plain', nodeInfo.type);
        e.dataTransfer.setData('application/node-type', nodeInfo.type);
        e.dataTransfer.setData('application/reactflow', nodeInfo.type);
        e.dataTransfer.effectAllowed = 'copy';
    };
    const handleDragEnd = () => {
        console.log('[NodeToolbar] Drag ended for:', nodeInfo.type);
        setIsDragging(false);
    };
    return (_jsxs("button", { draggable: "true", onDragStart: handleDragStart, onDragEnd: handleDragEnd, className: `node-button ${isDragging ? 'dragging' : ''}`, style: {
            '--node-color': nodeInfo.color,
            opacity: isDragging ? 0.5 : 1,
            cursor: isDragging ? 'grabbing' : 'grab'
        }, title: `Drag to add ${nodeInfo.label} node`, children: [_jsx("span", { className: "node-icon", children: nodeInfo.icon }), _jsx("span", { className: "node-label", children: nodeInfo.label })] }));
};
export const NodeToolbar = ({ position = 'top' }) => {
    return (_jsxs("div", { className: `node-toolbar ${position}`, children: [_jsx("div", { className: "toolbar-title", children: "Nodes" }), _jsx("div", { className: "toolbar-buttons", children: nodeTypes.map(nodeInfo => (_jsx(NodeButton, { nodeInfo: nodeInfo }, nodeInfo.type))) })] }));
};
export default NodeToolbar;
