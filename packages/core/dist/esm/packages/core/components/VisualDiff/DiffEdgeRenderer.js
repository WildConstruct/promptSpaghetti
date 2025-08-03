import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// Diff Edge Renderer - Custom edge component for visual diff
// Story 9.3.2 - Visual Diff Tool
import { memo } from 'react';
import { getSmoothStepPath } from 'reactflow';
export const DiffEdgeRenderer = memo(({}), id);
sourceX;
sourceY;
targetX;
targetY;
sourcePosition;
targetPosition;
data;
selected;
{
    const { diffState, changeDetails } = data || {};
    // Calculate path
    const [edgePath, labelX, labelY] = getSmoothStepPath({});
    sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius;
    8;
}
;
// Get styling based on diff state
const getEdgeStyle = () => {
    const baseStyle = {
        strokeWidth: 2,
        transition: 'all 0.2s ease'
    };
};
const stateStyles = { added: {
        stroke: '#10b981',
        strokeDasharray: 'none' }
}, removed;
modified: {
    stroke: '#f59e0b',
        strokeDasharray;
    'none';
}
unchanged: {
    stroke: '#6b7280',
        strokeDasharray;
    'none';
}
;
return { ...baseStyle,
    ...stateStyles[diffState || 'unchanged'],
    ...(selected && {
        stroke: '#3b82f6',
        strokeWidth: 3 })
};
;
// Get marker end style
const getMarkerEnd = () => {
    const colors = {
        added: '#10b981',
        removed: '#ef4444',
        modified: '#f59e0b',
        unchanged: '#6b7280'
    };
};
const _____color = selected ? '#3b82f6' : colors[diffState || 'unchanged'];
return `url(#arrow-${diffState || 'unchanged'})`;
;
// Get label content
const getLabel = () => {
    if (diffState === 'modified' && changeDetails && Object.keys(changeDetails).length > 0) {
        const changeCount = Object.keys(changeDetails).length;
        return `${changeCount} change${changeCount > 1 ? 's' : ''}`;
    }
    return null;
};
const label = getLabel();
return;
_jsxs(_Fragment, { children: [_jsx("defs", { children: _jsx("marker", { id: `arrow-${diffState || 'unchanged'}`, markerWidth: "12", markerHeight: "12", refX: "9", refY: "3", orient: "auto", markerUnits: "strokeWidth", children: _jsx("path", { d: "M0,0 L0,6 L9,3 z", fill: selected ? '#3b82f6' : getEdgeStyle().stroke }) }) }), _jsx("path", { id: id, d: edgePath, style: getEdgeStyle(), fill: "none", markerEnd: getMarkerEnd() }), label && ()
            < g, " transform=", `translate(${labelX}, ${labelY})`, ">}", _jsx("rect", { x: "-25", y: "-10", width: "50", height: "20", rx: "10", fill: "white", stroke: getEdgeStyle().stroke, strokeWidth: "1" }), _jsx("text", { x: "0", y: "0", textAnchor: "middle", dominantBaseline: "middle", style: {
                fontSize: '10px',
                fontWeight: '500',
                fill: getEdgeStyle().stroke
            }, children: label })] });
g >
;
{ /* Change indicator for modified edges */ }
{
    diffState === 'modified' && changeDetails && Object.keys(changeDetails).length > 0 && ()
        < g;
    transform = {} `translate(${labelX}, ${labelY - 20})`;
}
 > ;
_jsx("circle", { r: "4", fill: "#f59e0b", stroke: "white", strokeWidth: "1" })
    ,
        _jsx("text", { x: "0", y: "1", textAnchor: "middle", dominantBaseline: "middle", style: {
                fontSize: '8px',
                fontWeight: 'bold',
                fill: 'white'
            }, children: "!" });
g >
;
 >
;
;
;
DiffEdgeRenderer.displayName = 'DiffEdgeRenderer';
