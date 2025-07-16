import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { jest } from '@jest/globals';
export const ReactFlow = ({ nodes, edges, onNodeClick, onDrop, onDragOver, onPaneClick, children, style, className, ...props }) => {
    const handleDrop = (e) => {
        // Ensure clientX and clientY are available for tests
        if (!e.clientX && !e.clientY) {
            Object.defineProperty(e, 'clientX', { value: 100, writable: true });
            Object.defineProperty(e, 'clientY', { value: 100, writable: true });
        }
        onDrop?.(e);
    };
    return (_jsx("div", { "data-testid": "rf__wrapper", className: className, style: style, children: _jsxs("div", { className: "react-flow__renderer", children: [_jsxs("div", { className: "react-flow__pane", "data-testid": "react-flow-pane", style: { width: '100%', height: '100%', cursor: 'default' }, onDrop: handleDrop, onDragOver: onDragOver ?? ((e) => e.preventDefault()), onClick: onPaneClick, children: [_jsx("div", { "data-testid": "node-container", children: nodes.map((node) => (_jsxs("div", { "data-testid": `node-${node.id}`, "data-selected": node.selected, className: `react-flow__node ${node.selected ? 'selected' : ''}`, onClick: (e) => {
                                    e.stopPropagation();
                                    onNodeClick && onNodeClick(e, node);
                                }, style: {
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    left: node.position.x,
                                    top: node.position.y
                                }, children: [node.data?.label || node.id, node.data?.nodeType && (_jsx("div", { "data-testid": `node-type-${node.id}`, children: node.data.nodeType }))] }, node.id))) }), _jsx("div", { "data-testid": "edge-container", children: edges.map((edge) => (_jsx("div", { "data-testid": `edge-${edge.id}`, children: edge.id }, edge.id))) })] }), children] }) }));
};
export const Background = () => _jsx("div", { "data-testid": "reactflow-background", children: "Background" });
export const MiniMap = () => _jsx("div", { "data-testid": "reactflow-minimap", children: "MiniMap" });
export const Controls = () => _jsx("div", { "data-testid": "reactflow-controls", children: "Controls" });
export const ReactFlowProvider = ({ children }) => (_jsx("div", { "data-testid": "reactflow-provider", children: children }));
export const useReactFlow = () => ({
    project: (pos) => pos,
    screenToFlowPosition: (pos) => pos,
    getNodes: () => [],
    getEdges: () => [],
    getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
    setNodes: () => { },
    setEdges: () => { },
    addNodes: () => { },
    addEdges: () => { },
    fitView: () => { },
    zoomTo: () => { },
    zoomIn: () => { },
    zoomOut: () => { },
});
export const Position = {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom'
};
export const Handle = ({ children, type, position, style }) => (_jsx("div", { "data-testid": `handle-${type}-${position}`, className: `react-flow__handle-${position} react-flow__handle nodrag nopan ${type} connectable connectablestart connectableend connectionindicator`, "data-handlepos": position, "data-id": `null-null-${type}`, style: style, children: children }));
// Add missing enum exports
export const ConnectionMode = {
    Strict: 'strict',
    Loose: 'loose'
};
// Add utility functions
export const addEdge = jest.fn((connection, edges) => [...edges, { ...connection, id: `e-${Date.now()}` }]);
export const useNodesState = jest.fn((initialNodes) => [initialNodes, jest.fn()]);
export const useEdgesState = jest.fn((initialEdges) => [initialEdges, jest.fn()]);
// Default export fallback
export default {
    __esModule: true,
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    Handle,
    useReactFlow,
    Position,
    ConnectionMode,
    addEdge,
    useNodesState,
    useEdgesState,
};
