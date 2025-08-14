import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
// Sample nodes demonstrating all node types
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 100 },
        data: {
            value: 'A brave knight',
            nodeType: 'textBlock',
        },
    },
    {
        id: '2',
        type: 'textBlock',
        position: { x: 100, y: 200 },
        data: {
            value: 'ventures into the',
            nodeType: 'textBlock',
        },
    },
    {
        id: '3',
        type: 'weightedChoice',
        position: { x: 350, y: 150 },
        data: {
            value: '',
            nodeType: 'weightedChoice',
            options: [
                { text: 'dark forest', weight: 60 },
                { text: 'ancient castle', weight: 30 },
                { text: 'mystic cave', weight: 10 },
            ],
        },
    },
    {
        id: '4',
        type: 'concat',
        position: { x: 600, y: 150 },
        data: {
            value: ' ',
            nodeType: 'concat',
        },
    },
    {
        id: '5',
        type: 'setVariable',
        position: { x: 100, y: 300 },
        data: {
            value: 'location',
            nodeType: 'variable',
            isGetter: false,
        },
    },
    {
        id: '6',
        type: 'output',
        position: { x: 850, y: 150 },
        data: {
            value: 'Story',
            nodeType: 'output',
        },
    },
];
const initialEdges = [
    { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep' },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
    { id: 'e3-5', source: '3', target: '5', type: 'smoothstep' },
    { id: 'e4-6', source: '4', target: '6', type: 'smoothstep' },
];
export const CustomNodesDemo = () => {
    const [executionResult, setExecutionResult] = useState('');
    const handleExecute = (nodes, edges) => {
        // Simple execution simulation
        const result = 'Execution result would appear here after implementing execution engine';
        setExecutionResult(result);
        console.log('Executing graph with nodes:', nodes, 'and edges:', edges);
    };
    return (_jsxs("div", { style: { width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }, children: [_jsx("h1", { style: { margin: 0, fontSize: '24px', color: '#333' }, children: "Epic 1 - Custom React Flow Nodes Demo" }), _jsx("p", { style: { margin: '8px 0 0', color: '#666' }, children: "Click any node to edit inline. Use Tab/Shift+Tab to navigate between nodes." })] }), _jsx("div", { style: { flex: 1 }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, onExecute: handleExecute, onNodesChange: (nodes) => console.log('Nodes changed:', nodes), onEdgesChange: (edges) => console.log('Edges changed:', edges) }) }), executionResult && (_jsxs("div", { style: {
                    padding: '16px',
                    background: '#f0f9ff',
                    borderTop: '1px solid #e0e0e0',
                    fontFamily: 'monospace',
                }, children: [_jsx("strong", { children: "Execution Result:" }), " ", executionResult] }))] }));
};
export default CustomNodesDemo;
