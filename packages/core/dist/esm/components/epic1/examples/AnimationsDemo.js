import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo: Smooth Animations for Edit Transitions
 * Shows all animation effects in Epic 1
 */
import { useState } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import { MicroInteraction, useMicroInteractions } from '../animations/MicroInteractions';
// Initial demo nodes to showcase animations
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 100 },
        data: {
            value: 'Double-click to see smooth edit transitions',
            text: 'Double-click to see smooth edit transitions',
            nodeType: 'textBlock',
        },
    },
    {
        id: '2',
        type: 'weightedChoice',
        position: { x: 100, y: 250 },
        data: {
            value: JSON.stringify([
                { text: 'Watch the animation', weight: 50 },
                { text: 'Feel the smoothness', weight: 50 },
            ]),
            options: [
                { text: 'Watch the animation', weight: 50 },
                { text: 'Feel the smoothness', weight: 50 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    {
        id: '3',
        type: 'variable',
        position: { x: 400, y: 100 },
        data: {
            value: 'animationState',
            variableName: 'animationState',
            operation: 'set',
            variableValue: 'smooth',
            nodeType: 'setVariable',
        },
    },
    {
        id: '4',
        type: 'concat',
        position: { x: 400, y: 250 },
        data: {
            value: ' → ',
            separator: ' → ',
            nodeType: 'concat',
        },
    },
    {
        id: '5',
        type: 'output',
        position: { x: 600, y: 175 },
        data: {
            value: 'Animated Output',
            label: 'Animated Output',
            nodeType: 'output',
        },
    },
];
const initialEdges = [
    { id: 'e1-4', source: '1', target: '4' },
    { id: 'e2-4', source: '2', target: '4' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
];
export const AnimationsDemo = () => {
    const [showGuide, setShowGuide] = useState(true);
    const { interactions, trigger } = useMicroInteractions();
    const handleInteraction = (type) => {
        const x = Math.random() * 400 + 100;
        const y = Math.random() * 300 + 100;
        trigger(type, x, y, type === 'error' ? 'Example error' : undefined);
    };
    return (_jsxs("div", { style: { width: '100vw', height: '100vh' }, children: [_jsxs("div", { style: { padding: 20, background: '#f5f5f5', borderBottom: '1px solid #ddd' }, children: [_jsx("h1", { style: { margin: 0, fontSize: 24 }, children: "Epic 1 Animations Demo" }), _jsx("p", { style: { margin: '10px 0 0 0', color: '#666' }, children: "Experience smooth edit transitions and micro-interactions" })] }), showGuide && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: 100,
                    right: 20,
                    width: 300,
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 100
                }, children: [_jsx("h3", { style: { margin: '0 0 15px 0' }, children: "Animation Guide" }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "Edit Transitions:" }), _jsxs("ul", { style: { margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }, children: [_jsx("li", { children: "Double-click any node to edit" }), _jsx("li", { children: "Watch the smooth scale animation" }), _jsx("li", { children: "Notice the focus ring effect" }), _jsx("li", { children: "Press Enter/Escape for confirmation animations" })] })] }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "Micro-interactions:" }), _jsxs("ul", { style: { margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }, children: [_jsx("li", { children: "Hover over nodes for subtle glow" }), _jsx("li", { children: "Click for ripple effects" }), _jsx("li", { children: "Tab navigation shows focus animations" }), _jsx("li", { children: "Save shows success checkmark" })] })] }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "Test Interactions:" }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => handleInteraction('hover'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Hover Effect" }), _jsx("button", { onClick: () => handleInteraction('click'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Click Ripple" }), _jsx("button", { onClick: () => handleInteraction('save'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Save Success" }), _jsx("button", { onClick: () => handleInteraction('error'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Error Shake" })] })] }), _jsx("button", { onClick: () => setShowGuide(false), style: {
                            width: '100%',
                            padding: '8px',
                            background: '#007acc',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 14
                        }, children: "Hide Guide" })] })), _jsxs("div", { style: { height: 'calc(100% - 80px)', position: 'relative' }, children: [_jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, showAssetLibrary: false, showPreview: true, previewPosition: "bottom", previewWidth: "200px" }), interactions.map(({ id, type, x, y, message }) => (_jsx(MicroInteraction, { trigger: type, x: x, y: y, message: message }, id)))] }), !showGuide && (_jsx("button", { onClick: () => setShowGuide(true), style: {
                    position: 'absolute',
                    top: 100,
                    right: 20,
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13
                }, children: "Show Guide" }))] }));
};
