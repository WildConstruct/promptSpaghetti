import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
// Initial demo nodes
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 100 },
        data: {
            value: 'The brave knight',
            text: 'The brave knight',
            nodeType: 'textBlock',
        },
    },
    {
        id: '2',
        type: 'weightedChoice',
        position: { x: 100, y: 200 },
        data: {
            value: JSON.stringify([
                { text: 'charges forward', weight: 40 },
                { text: 'raises his shield', weight: 30 },
                { text: 'calls for backup', weight: 30 },
            ]),
            options: [
                { text: 'charges forward', weight: 40 },
                { text: 'raises his shield', weight: 30 },
                { text: 'calls for backup', weight: 30 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    {
        id: '3',
        type: 'concat',
        position: { x: 400, y: 150 },
        data: {
            value: ' ',
            separator: ' ',
            nodeType: 'concat',
        },
    },
    {
        id: '4',
        type: 'output',
        position: { x: 600, y: 150 },
        data: {
            value: 'Action Sequence',
            label: 'Action Sequence',
            nodeType: 'output',
        },
    },
];
const initialEdges = [
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
];
export const SaveAsPresetDemo = () => {
    return (_jsxs("div", { style: { width: '100vw', height: '100vh' }, children: [_jsxs("div", { style: { padding: 20, background: '#f5f5f5', borderBottom: '1px solid #ddd' }, children: [_jsx("h1", { style: { margin: 0, fontSize: 24 }, children: "Save as Preset Demo" }), _jsx("p", { style: { margin: '10px 0 0 0', color: '#666' }, children: "Right-click any node and select \"Save as Preset\" to create a reusable preset" }), _jsxs("ul", { style: { margin: '10px 0 0 0', paddingLeft: 20, color: '#666' }, children: [_jsx("li", { children: "Right-click on any node to open context menu" }), _jsx("li", { children: "Choose \"Save as Preset\" to save current node configuration" }), _jsx("li", { children: "Give your preset a name, category, and description" }), _jsx("li", { children: "Your custom presets will appear in the Asset Library" })] })] }), _jsx("div", { style: { height: 'calc(100% - 120px)' }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, showAssetLibrary: true, assetLibraryPosition: "left", showPreview: true, previewPosition: "right" }) })] }));
};
