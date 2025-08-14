import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getSmoothStepPath } from 'reactflow';
import { AttachmentEdge } from './edges/AttachmentEdge';
import EdgeRouter from './edges/EdgeRouter';
// Default edge component that forces rendering
export const DefaultEdge = (props) => {
    // Log edge state for debugging
    if (props.selected) {
        console.log('[DefaultEdge] Selected edge:', props.id, 'className:', props.className);
    }
    // Use smoothstep path since that's what the edges are configured to use
    const [edgePath] = getSmoothStepPath({
        sourceX: props.sourceX,
        sourceY: props.sourceY,
        sourcePosition: props.sourcePosition,
        targetX: props.targetX,
        targetY: props.targetY,
        targetPosition: props.targetPosition,
        borderRadius: 10,
    });
    return (_jsxs("g", { className: `react-flow__edge ${props.selected ? 'selected' : ''} ${props.className || ''}`, children: [_jsx("path", { className: "react-flow__edge-interaction", d: edgePath, fill: "none", stroke: "transparent", strokeWidth: 30, style: {
                    pointerEvents: 'stroke',
                    cursor: 'pointer',
                    opacity: 0
                } }), _jsx("path", { id: props.id, style: {
                    ...props.style,
                    pointerEvents: 'none', // Let the interaction path handle clicks
                    cursor: 'pointer'
                }, className: "react-flow__edge-path", d: edgePath, markerEnd: props.markerEnd, fill: "none", strokeWidth: props.style?.strokeWidth || 3 })] }));
};
// Edge types configuration
export const edgeTypes = {
    default: DefaultEdge,
    smoothstep: DefaultEdge,
    straight: DefaultEdge,
    step: DefaultEdge,
    attachment: AttachmentEdge,
    bezier: EdgeRouter,
    advanced: EdgeRouter,
};
// Helper to check if edges are rendering
export const checkEdgeRendering = () => {
    const edges = document.querySelector('.react-flow__edges');
    const svg = document.querySelector('.react-flow__edges svg');
    const paths = document.querySelectorAll('.react-flow__edges path');
    console.log('Edge Rendering Check:', {
        edgesContainer: !!edges,
        svgElement: !!svg,
        pathElements: paths.length,
        containerHTML: edges?.innerHTML || 'No edges container'
    });
    return { edges, svg, paths };
};
