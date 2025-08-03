import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Node Palette for Epic 1 Editor
 * Simple draggable palette for creating new nodes
 */
import React from 'react';
import './NodePalette.css';
const nodeTypes = [
    { type: 'textBlock', label: 'Text Block', icon: '📝', category: 'Basic' },
    { type: 'weightedChoice', label: 'Weighted Choice', icon: '⚖️', category: 'Logic' },
    { type: 'concat', label: 'Concatenate', icon: '🔗', category: 'Text' },
    { type: 'setVariable', label: 'Set Variable', icon: '💾', category: 'Variables' },
    { type: 'getVariable', label: 'Get Variable', icon: '📥', category: 'Variables' },
    { type: 'output', label: 'Output', icon: '📤', category: 'Output' },
];
export const NodePalette = ({ position = 'left', defaultCollapsed = false, }) => {
    const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
    React.useEffect(() => {
        console.log('[NodePalette] Mounted, position:', position, 'collapsed:', collapsed);
    }, [position, collapsed]);
    const onDragStart = (event, nodeType) => {
        console.log('[NodePalette] Drag started for node type:', nodeType);
        // Use text/plain as primary for better compatibility
        event.dataTransfer.setData('text/plain', nodeType);
        event.dataTransfer.setData('application/node-type', nodeType);
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'copy';
    };
    return (_jsxs("div", { className: `node-palette ${position} ${collapsed ? 'collapsed' : ''}`, children: [_jsxs("div", { className: "palette-header", children: [_jsx("button", { className: "collapse-button", onClick: () => setCollapsed(!collapsed), title: collapsed ? 'Expand' : 'Collapse', children: collapsed ? '▶' : '◀' }), !collapsed && _jsx("span", { className: "palette-title", children: "Nodes" })] }), !collapsed && (_jsx("div", { className: "node-list", children: nodeTypes.map((node) => (_jsxs("div", { className: "node-item", draggable: "true", onDragStart: (e) => onDragStart(e, node.type), onDragEnd: () => console.log('[NodePalette] Drag ended for', node.type), title: node.label, children: [_jsx("span", { className: "node-icon", children: node.icon }), _jsx("span", { className: "node-label", children: node.label })] }, node.type))) }))] }));
};
export default NodePalette;
