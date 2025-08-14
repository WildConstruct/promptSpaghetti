import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
// Sample nodes to demonstrate connection validation
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 50 },
        data: {
            value: 'Story beginning',
            nodeType: 'textBlock',
        },
    },
    {
        id: '2',
        type: 'getVariable',
        position: { x: 100, y: 150 },
        data: {
            value: 'characterName',
            nodeType: 'variable',
            isGetter: true,
        },
    },
    {
        id: '3',
        type: 'weightedChoice',
        position: { x: 350, y: 100 },
        data: {
            value: '',
            nodeType: 'weightedChoice',
            options: [
                { text: 'brave', weight: 50 },
                { text: 'cautious', weight: 30 },
                { text: 'curious', weight: 20 },
            ],
        },
    },
    {
        id: '4',
        type: 'concat',
        position: { x: 600, y: 100 },
        data: {
            value: ' ',
            nodeType: 'concat',
        },
    },
    {
        id: '5',
        type: 'setVariable',
        position: { x: 350, y: 250 },
        data: {
            value: 'mood',
            nodeType: 'variable',
            isGetter: false,
        },
    },
    {
        id: '6',
        type: 'output',
        position: { x: 850, y: 100 },
        data: {
            value: 'Result',
            nodeType: 'output',
        },
    },
    {
        id: '7',
        type: 'output',
        position: { x: 850, y: 250 },
        data: {
            value: 'Debug',
            nodeType: 'output',
        },
    },
    {
        id: '8',
        type: 'textBlock',
        position: { x: 100, y: 350 },
        data: {
            value: 'Another path',
            nodeType: 'textBlock',
        },
    },
];
const initialEdges = [
    { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
    { id: 'e3-5', source: '3', target: '5', type: 'smoothstep' },
];
export const ConnectionValidationDemo = () => {
    return (_jsxs("div", { style: { width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }, children: [_jsx("h1", { style: { margin: 0, fontSize: '24px', color: '#333' }, children: "Epic 1 - Connection Validation Demo" }), _jsxs("div", { style: { marginTop: '8px', color: '#666', fontSize: '14px' }, children: [_jsx("p", { style: { margin: '4px 0' }, children: "Try these connections to see validation in action:" }), _jsxs("ul", { style: { margin: '4px 0 0 20px', lineHeight: 1.6 }, children: [_jsxs("li", { children: ["\u2705 ", _jsx("strong", { children: "Valid:" }), " Text Block \u2192 Concat, Variable Getter \u2192 Output"] }), _jsxs("li", { children: ["\u274C ", _jsx("strong", { children: "Invalid:" }), " Output \u2192 Any Node (outputs can't be sources)"] }), _jsxs("li", { children: ["\u274C ", _jsx("strong", { children: "Invalid:" }), " Any Node \u2192 Itself (no self-connections)"] }), _jsxs("li", { children: ["\u274C ", _jsx("strong", { children: "Invalid:" }), " Creating cycles (e.g., A \u2192 B \u2192 C \u2192 A)"] }), _jsxs("li", { children: ["\u2705 ", _jsx("strong", { children: "Valid targets highlight in green" }), " while dragging"] }), _jsxs("li", { children: ["\u274C ", _jsx("strong", { children: "Invalid targets fade out" }), " to show they can't be connected"] })] })] })] }), _jsx("div", { style: { flex: 1 }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, onExecute: (nodes, edges) => {
                        console.log('Executing validated graph:', { nodes, edges });
                    } }) })] }));
};
export default ConnectionValidationDemo;
