import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Demo: Micro-interactions and Haptic Feedback
 * Shows all the new micro-interactions from Task 27
 */
import { useState } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import { triggerHaptic } from '../animations/MicroInteractions';
// Initial demo nodes
const initialNodes = [
    {
        id: '1',
        type: 'textBlock',
        position: { x: 100, y: 100 },
        data: {
            value: 'Drag me closer to another node to feel magnetic snap!',
            text: 'Drag me closer to another node to feel magnetic snap!',
            nodeType: 'textBlock',
        },
    },
    {
        id: '2',
        type: 'weightedChoice',
        position: { x: 400, y: 100 },
        data: {
            value: JSON.stringify([
                { text: 'Feel the snap', weight: 50 },
                { text: 'Magnetic connection', weight: 50 },
            ]),
            options: [
                { text: 'Feel the snap', weight: 50 },
                { text: 'Magnetic connection', weight: 50 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    {
        id: '3',
        type: 'variable',
        position: { x: 250, y: 250 },
        data: {
            value: 'hapticState',
            variableName: 'hapticState',
            operation: 'set',
            variableValue: 'active',
            nodeType: 'setVariable',
        },
    },
];
const initialEdges = [];
export const MicroInteractionsDemo = () => {
    const [hapticEnabled, setHapticEnabled] = useState(true);
    const [showGuide, setShowGuide] = useState(true);
    const testHaptic = (type) => {
        triggerHaptic(type);
    };
    return (_jsxs("div", { style: { width: '100vw', height: '100vh' }, children: [_jsxs("div", { style: { padding: 20, background: '#f5f5f5', borderBottom: '1px solid #ddd' }, children: [_jsx("h1", { style: { margin: 0, fontSize: 24 }, children: "Epic 1 Micro-interactions Demo" }), _jsx("p", { style: { margin: '10px 0 0 0', color: '#666' }, children: "Experience magnetic snap, node bounce, and haptic feedback" })] }), showGuide && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: 100,
                    right: 20,
                    width: 320,
                    background: 'white',
                    padding: 20,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 100
                }, children: [_jsx("h3", { style: { margin: '0 0 15px 0' }, children: "Micro-interactions Guide" }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "\uD83E\uDDF2 Magnetic Snap:" }), _jsx("p", { style: { margin: 0, fontSize: 13, color: '#666' }, children: "Drag nodes close to each other to feel the magnetic attraction. Connections will snap when within 30px." })] }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "\uD83C\uDFBE Node Bounce:" }), _jsx("p", { style: { margin: 0, fontSize: 13, color: '#666' }, children: "Duplicate a node (Cmd+D) to see the bounce animation. New nodes appear with a satisfying bounce effect." })] }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "\u2728 Hover Effects:" }), _jsx("p", { style: { margin: 0, fontSize: 13, color: '#666' }, children: "Hover over nodes to see subtle glow effects. Click for ripple animations and haptic feedback." })] }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "\uD83D\uDCF3 Haptic Feedback:" }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }, children: [_jsx("button", { onClick: () => testHaptic('light'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Light Tap" }), _jsx("button", { onClick: () => testHaptic('medium'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Medium Tap" }), _jsx("button", { onClick: () => testHaptic('heavy'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Heavy Tap" }), _jsx("button", { onClick: () => testHaptic('error'), style: {
                                            padding: '6px 12px',
                                            fontSize: 12,
                                            border: '1px solid #ddd',
                                            borderRadius: 4,
                                            background: 'white',
                                            cursor: 'pointer'
                                        }, children: "Error Buzz" })] }), _jsxs("p", { style: { margin: '8px 0 0 0', fontSize: 11, color: '#999' }, children: [hapticEnabled ? '✅ Haptic feedback enabled' : '❌ Haptic feedback disabled', !('vibrate' in navigator) && ' (Not supported on this device)'] })] }), _jsxs("div", { style: { marginBottom: 15 }, children: [_jsx("h4", { style: { margin: '0 0 5px 0', fontSize: 14 }, children: "\uD83C\uDFAF Try These Actions:" }), _jsxs("ul", { style: { margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }, children: [_jsx("li", { children: "Create a connection - feel the snap" }), _jsx("li", { children: "Duplicate nodes - see the bounce" }), _jsx("li", { children: "Hover and click - subtle feedback" }), _jsx("li", { children: "Multi-select - combined haptics" }), _jsx("li", { children: "Drag nodes - see trail effects" })] })] }), _jsx("button", { onClick: () => setShowGuide(false), style: {
                            width: '100%',
                            padding: '8px',
                            background: '#007acc',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 14
                        }, children: "Hide Guide" })] })), _jsx("div", { style: { height: 'calc(100% - 80px)' }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: initialNodes, initialEdges: initialEdges, showAssetLibrary: true, showPreview: false }) }), !showGuide && (_jsx("button", { onClick: () => setShowGuide(true), style: {
                    position: 'absolute',
                    top: 100,
                    right: 20,
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13
                }, children: "Show Guide" })), _jsx("div", { style: {
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    display: 'flex',
                    gap: 10
                }, children: _jsxs("label", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'white',
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: '1px solid #ddd',
                        fontSize: 13
                    }, children: [_jsx("input", { type: "checkbox", checked: hapticEnabled, onChange: (e) => setHapticEnabled(e.target.checked) }), "Haptic Feedback"] }) })] }));
};
