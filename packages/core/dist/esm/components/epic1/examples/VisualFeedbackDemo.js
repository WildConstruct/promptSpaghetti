import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
// Sample nodes to demonstrate visual feedback
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 50 },
        data: {
            value: 'Welcome to the Visual Feedback Demo!\n\n🎯 Try these interactions:',
            nodeType: 'textBlock',
        },
    },
    {
        id: '2',
        type: 'weightedChoice',
        position: { x: 100, y: 200 },
        data: {
            value: '',
            nodeType: 'weightedChoice',
            options: [
                { text: 'Hover over nodes', weight: 40 },
                { text: 'Click to edit', weight: 35 },
                { text: 'Drag the sliders', weight: 25 },
            ],
        },
    },
    {
        id: '3',
        type: 'concat',
        position: { x: 400, y: 125 },
        data: {
            value: ' → ',
            nodeType: 'concat',
        },
    },
    {
        id: '4',
        type: 'textBlock',
        position: { x: 600, y: 50 },
        data: {
            value: 'Visual feedback features:\n✨ Edit mode glow\n📌 Connection point hover\n✅ Save animation\n🎨 Type-specific colors',
            nodeType: 'textBlock',
        },
    },
    {
        id: '5',
        type: 'setVariable',
        position: { x: 400, y: 250 },
        data: {
            value: 'userChoice',
            nodeType: 'variable',
            isGetter: false,
        },
    },
    {
        id: '6',
        type: 'output',
        position: { x: 600, y: 250 },
        data: {
            value: 'Result',
            nodeType: 'output',
        },
    },
];
const initialEdges = [
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
    { id: 'e2-5', source: '2', target: '5', type: 'smoothstep' },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
    { id: 'e5-6', source: '5', target: '6', type: 'smoothstep' },
];
export const VisualFeedbackDemo = () => {
    return (_jsxs("div", { style: { width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }, children: [_jsx("h1", { style: { margin: 0, fontSize: '24px', color: '#333' }, children: "Epic 1 - Visual Feedback Demo" }), _jsxs("div", { style: { marginTop: '8px', color: '#666', fontSize: '14px' }, children: [_jsx("p", { style: { margin: '4px 0' }, children: "Experience the enhanced visual feedback system:" }), _jsxs("ul", { style: { margin: '4px 0 0 20px', lineHeight: 1.6 }, children: [_jsxs("li", { children: ["\u2728 ", _jsx("strong", { children: "Edit Mode Glow:" }), " Click any node to see the animated glow effect"] }), _jsxs("li", { children: ["\uD83C\uDFAF ", _jsx("strong", { children: "Hover States:" }), " Smooth transitions on node and handle hover"] }), _jsxs("li", { children: ["\u2705 ", _jsx("strong", { children: "Save Animation:" }), " Confirm edits to see the checkmark animation"] }), _jsxs("li", { children: ["\uD83C\uDFA8 ", _jsx("strong", { children: "Type-Specific Colors:" }), " Each node type has unique visual styling"] }), _jsxs("li", { children: ["\uD83D\uDCCA ", _jsx("strong", { children: "Dynamic Sliders:" }), " WeightedChoice sliders show live value updates"] }), _jsxs("li", { children: ["\uD83D\uDD17 ", _jsx("strong", { children: "Connection Feedback:" }), " Handle hover effects for better targeting"] })] })] })] }), _jsx("div", { style: { flex: 1 }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, onExecute: (nodes, edges) => {
                        console.log('Executing graph with enhanced visual feedback:', { nodes, edges });
                    } }) })] }));
};
export default VisualFeedbackDemo;
