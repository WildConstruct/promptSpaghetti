import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './NodePalette.css';
const NODE_TYPES = [
    'WeightedChoice',
    'Concat',
    'Output',
    'Include',
    'SetVariable',
    'GetVariable',
];
function onDragStart(event, nodeType) {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
}
export default function NodePalette() {
    return (_jsxs("aside", { className: "node-palette", children: [_jsx("h4", { children: "Node Library" }), NODE_TYPES.map((type) => (_jsx("button", { className: "palette-item", onDragStart: (event) => onDragStart(event, type), draggable: true, title: type, role: "button", tabIndex: 0, "aria-label": `Add ${type} node`, style: { width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0 }, children: type }, type)))] }));
}
