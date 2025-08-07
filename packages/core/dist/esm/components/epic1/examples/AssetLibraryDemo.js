import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo of the Asset Library and Drag-Drop Preset System
 */
import { useState } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
// Initial demo nodes
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 100 },
        data: {
            value: 'A',
            text: 'A',
            nodeType: 'textBlock',
            isEditing: false
        }
    },
    {
        id: '2',
        type: 'weightedChoice',
        position: { x: 400, y: 100 },
        data: {
            value: JSON.stringify([
                { text: 'option1', weight: 50 },
                { text: 'option2', weight: 50 }
            ]),
            options: [
                { text: 'option1', weight: 50 },
                { text: 'option2', weight: 50 }
            ],
            nodeType: 'weightedChoice',
            isEditing: false
        }
    },
    {
        id: '3',
        type: 'concat',
        position: { x: 250, y: 250 },
        data: {
            value: ' ',
            separator: ' ',
            nodeType: 'concat',
            isEditing: false
        }
    },
    {
        id: '4',
        type: 'output',
        position: { x: 250, y: 400 },
        data: {
            value: 'Result',
            label: 'Result',
            nodeType: 'output',
            isEditing: false
        }
    }
];
const initialEdges = [
    { id: 'e1-3', source: '1', target: '3', sourceHandle: 'output', targetHandle: 'input' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: 'output', targetHandle: 'input' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: 'output', targetHandle: 'input' }
];
export const AssetLibraryDemo = () => {
    const [showLibrary, setShowLibrary] = useState(true);
    const [libraryPosition, setLibraryPosition] = useState('left');
    return (_jsxs("div", { style: { width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: {
                    padding: '10px',
                    background: '#f5f5f5',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                }, children: [_jsx("h2", { style: { margin: 0, fontSize: '18px' }, children: "Epic 1 Asset Library Demo" }), _jsxs("button", { onClick: () => setShowLibrary(!showLibrary), children: [showLibrary ? 'Hide' : 'Show', " Asset Library"] }), _jsxs("button", { onClick: () => setLibraryPosition(pos => pos === 'left' ? 'right' : 'left'), children: ["Library Position: ", libraryPosition] }), _jsx("span", { style: { marginLeft: 'auto', fontSize: '14px', color: '#666' }, children: "Drag presets from the library onto nodes to apply them" })] }), _jsx("div", { style: { flex: 1 }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, showAssetLibrary: showLibrary, assetLibraryPosition: libraryPosition, showPreview: true, onNodesChange: (nodes) => {
                        console.log('Nodes changed:', nodes);
                    }, onEdgesChange: (edges) => {
                        console.log('Edges changed:', edges);
                    } }) })] }));
};
