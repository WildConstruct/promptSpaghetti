import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
// Sample nodes spread across the canvas to test pan/zoom
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 100 },
        data: {
            value: 'Welcome to Keyboard & Pan/Zoom Demo!\n\nPress ? to see all shortcuts',
            nodeType: 'textBlock',
        },
    },
    {
        id: '2',
        type: 'textBlock',
        position: { x: 500, y: 100 },
        data: {
            value: 'Navigation:\n• Arrow keys to pan\n• Space+drag for pan mode\n• ⌘/Ctrl +/- to zoom\n• ⌘/Ctrl 0 to fit',
            nodeType: 'textBlock',
        },
    },
    {
        id: '3',
        type: 'weightedChoice',
        position: { x: 100, y: 300 },
        data: {
            value: '',
            nodeType: 'weightedChoice',
            options: [
                { text: 'Save with ⌘S', weight: 30 },
                { text: 'Load with ⌘O', weight: 40 },
                { text: 'Export with ⌘E', weight: 30 },
            ],
        },
    },
    {
        id: '4',
        type: 'concat',
        position: { x: 500, y: 300 },
        data: {
            value: ' → ',
            nodeType: 'concat',
        },
    },
    {
        id: '5',
        type: 'textBlock',
        position: { x: 900, y: 100 },
        data: {
            value: 'Selection:\n• ⌘A to select all\n• ⌘D to duplicate\n• Delete to remove',
            nodeType: 'textBlock',
        },
    },
    {
        id: '6',
        type: 'setVariable',
        position: { x: 300, y: 500 },
        data: {
            value: 'demo',
            nodeType: 'variable',
            isGetter: false,
        },
    },
    {
        id: '7',
        type: 'output',
        position: { x: 700, y: 500 },
        data: {
            value: 'Result',
            nodeType: 'output',
        },
    },
    // Nodes spread far apart to demonstrate pan/zoom
    {
        id: '8',
        type: 'textBlock',
        position: { x: -300, y: -200 },
        data: {
            value: 'This node is far to the left and up.\nUse arrow keys or pan controls to navigate!',
            nodeType: 'textBlock',
        },
    },
    {
        id: '9',
        type: 'textBlock',
        position: { x: 1200, y: 700 },
        data: {
            value: 'This node is far to the right and down.\nPress ⌘0 to fit all nodes in view!',
            nodeType: 'textBlock',
        },
    },
];
const initialEdges = [
    { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
    { id: 'e3-6', source: '3', target: '6', type: 'smoothstep' },
    { id: 'e4-7', source: '4', target: '7', type: 'smoothstep' },
    { id: 'e6-7', source: '6', target: '7', type: 'smoothstep' },
];
export const KeyboardPanZoomDemo = () => {
    return (_jsxs("div", { style: { width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }, children: [_jsx("h1", { style: { margin: 0, fontSize: '24px', color: '#333' }, children: "Epic 1 - Keyboard Shortcuts & Pan/Zoom Demo" }), _jsxs("div", { style: { marginTop: '8px', color: '#666', fontSize: '14px' }, children: [_jsx("p", { style: { margin: '4px 0' }, children: "Test the complete keyboard navigation and pan/zoom system:" }), _jsxs("div", { style: { display: 'flex', gap: '32px', marginTop: '8px' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Quick Actions:" }), _jsxs("ul", { style: { margin: '4px 0 0 20px', lineHeight: 1.6 }, children: [_jsxs("li", { children: ["Press ", _jsx("kbd", { children: "?" }), " for help overlay"] }), _jsxs("li", { children: ["Press ", _jsx("kbd", { children: "Tab" }), " to navigate nodes"] }), _jsx("li", { children: "Click any node to edit inline" }), _jsx("li", { children: "Use pan/zoom controls (bottom-right)" })] })] }), _jsxs("div", { children: [_jsx("strong", { children: "Test Features:" }), _jsxs("ul", { style: { margin: '4px 0 0 20px', lineHeight: 1.6 }, children: [_jsx("li", { children: "Save/Load graphs with \u2318S/\u2318O" }), _jsx("li", { children: "Export to JSON with \u2318E" }), _jsx("li", { children: "Duplicate nodes with \u2318D" }), _jsx("li", { children: "Pan with arrows or Space+drag" })] })] })] })] })] }), _jsx("div", { style: { flex: 1 }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, onExecute: (nodes, edges) => {
                        console.log('Executing graph with keyboard/pan-zoom features:', { nodes, edges });
                        alert('Graph executed! Check console for output.');
                    } }) })] }));
};
export default KeyboardPanZoomDemo;
