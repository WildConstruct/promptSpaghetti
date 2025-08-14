import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo for Auto-Layout functionality
 * Story 1.32: Auto-Layout and Node Positioning System
 */
import { useCallback } from 'react';
import { Epic1GraphEditor } from '../Epic1GraphEditor';
const initialNodes = [
    {
        id: '1',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
            nodeType: 'textBlock',
            value: 'Node 1',
            label: 'Node 1'
        }
    },
    {
        id: '2',
        type: 'default',
        position: { x: 100, y: 150 },
        data: {
            nodeType: 'textBlock',
            value: 'Node 2',
            label: 'Node 2'
        }
    },
    {
        id: '3',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
            nodeType: 'textBlock',
            value: 'Node 3',
            label: 'Node 3'
        }
    },
    {
        id: '4',
        type: 'default',
        position: { x: 100, y: 250 },
        data: {
            nodeType: 'textBlock',
            value: 'Node 4',
            label: 'Node 4'
        }
    }
];
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' }
];
export const AutoLayoutDemo = () => {
    const handleExecute = useCallback((nodes, edges) => {
        console.log('Executing graph with', nodes.length, 'nodes');
    }, []);
    return (_jsxs("div", { style: { width: '100vw', height: '100vh' }, children: [_jsxs("div", { style: {
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    zIndex: 1000,
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }, children: [_jsx("h2", { children: "Auto-Layout Demo" }), _jsx("p", { children: "Test the auto-layout functionality:" }), _jsxs("ul", { children: [_jsxs("li", { children: ["Press ", _jsx("strong", { children: "Cmd+Shift+L" }), " to clean up all nodes"] }), _jsxs("li", { children: ["Select nodes and press ", _jsx("strong", { children: "Cmd+Shift+L" }), " to clean up selection"] }), _jsx("li", { children: "Right-click canvas for \"Clean Up Layout\" option" }), _jsx("li", { children: "Drag assets from browser - multiple nodes auto-arrange" })] }), _jsx("p", { children: "Notice how stacked nodes (initial state) get properly arranged!" })] }), _jsx(Epic1GraphEditor, { initialNodes: initialNodes, initialEdges: initialEdges, onExecute: handleExecute, showAssetLibrary: true, showPreview: true })] }));
};
export default AutoLayoutDemo;
