import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
const GraphNode = memo(({ data, selected }) => {
    return (_jsxs("div", { style: {
            padding: 12,
            border: '1px solid #666',
            borderRadius: 6,
            background: '#3a3a3a',
            color: '#e0e0e0',
            minWidth: 120,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
        }, className: selected ? 'selected' : '', "data-selected": selected ? 'true' : undefined, children: [_jsx("strong", { "data-testid": "node-label", children: data.label }), _jsx(Handle, { type: "target", position: Position.Top, style: {
                    borderRadius: 3,
                    width: 8,
                    height: 8,
                    backgroundColor: '#666',
                    border: '2px solid #e0e0e0'
                } }), _jsx(Handle, { type: "source", position: Position.Bottom, style: {
                    borderRadius: 3,
                    width: 8,
                    height: 8,
                    backgroundColor: '#666',
                    border: '2px solid #e0e0e0'
                } })] }));
});
GraphNode.displayName = 'GraphNode';
export default GraphNode;
