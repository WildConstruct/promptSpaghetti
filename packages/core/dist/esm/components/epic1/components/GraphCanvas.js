import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactFlow, { Background, Controls, ConnectionMode, } from 'reactflow';
import { CustomMinimap } from '../CustomMinimap';
import { ConnectionFeedback } from '../ConnectionFeedback';
import { PanZoomControls } from '../PanZoomControls';
import { SafeReactFlowWrapper } from '../SafeReactFlowWrapper';
/**
 * GraphCanvas - Pure presentation component for the ReactFlow canvas
 * Handles only the visual rendering and basic interactions
 */
export const GraphCanvas = ({ nodes, edges, nodeTypes, edgeTypes, onNodesChange, onEdgesChange, onConnect, onPaneClick, onNodeClick, onEdgeClick, onSelectionStart, onSelectionEnd, onInit, isValidConnection, activatedEdges, showMinimap = true, minimapStyle, children, }) => {
    // Process edges to add activation and selection classes
    const processedEdges = edges.map(edge => ({
        ...edge,
        animated: activatedEdges.has(edge.id),
        className: `${activatedEdges.has(edge.id) ? 'activated' : ''} ${edge.selected ? 'selected' : ''}`.trim()
    }));
    return (_jsxs(ReactFlow, { nodes: nodes, edges: processedEdges, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onConnect: onConnect, onPaneClick: onPaneClick, onSelectionStart: onSelectionStart, onSelectionEnd: onSelectionEnd, onNodeClick: onNodeClick, onEdgeClick: onEdgeClick, onInit: onInit, nodeTypes: nodeTypes, edgeTypes: edgeTypes, isValidConnection: isValidConnection, connectionMode: ConnectionMode.Loose, connectionLineType: "smoothstep", defaultEdgeOptions: {
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#9ca3af', strokeWidth: 3 }
        }, fitView: true, fitViewOptions: {
            padding: 0.2,
            includeHiddenNodes: false,
            minZoom: 0.3,
            maxZoom: 2
        }, defaultViewport: { x: 0, y: 0, zoom: 0.8 }, attributionPosition: "bottom-left", panOnScroll: false, zoomOnScroll: true, zoomOnPinch: true, panOnDrag: [1, 2], selectionOnDrag: true, panActivationKeyCode: "Space", selectionMode: "partial", nodesDraggable: true, nodesConnectable: true, elementsSelectable: true, selectNodesOnDrag: true, deleteKeyCode: ['Delete', 'Backspace'], multiSelectionKeyCode: "Shift", nodeDragThreshold: 5, children: [_jsx(Background, { variant: "dots", gap: 16, size: 1, color: "#333333" }), _jsx(Controls, {}), showMinimap && nodes.length > 0 && (_jsx(CustomMinimap, { nodes: nodes, edges: edges, style: minimapStyle })), _jsx(ConnectionFeedback, { nodes: nodes, edges: edges }), _jsx(SafeReactFlowWrapper, { children: _jsx(PanZoomControls, { position: "bottom-right" }) }), children] }));
};
