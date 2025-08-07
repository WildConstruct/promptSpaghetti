import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 1 - Task 28: Medieval Demo Showcase
 *
 * A compelling demo that showcases inline editing capabilities
 * with a medieval theme. Designed for investor demos to complete
 * in under 30 seconds while highlighting all key features.
 */
import { useState, useCallback } from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import { triggerHaptic } from '../animations/MicroInteractions';
// Initial empty state
const emptyNodes = [];
const emptyEdges = [];
// Stage 1: Initial merchant node
const stage1Nodes = [
    {
        id: 'merchant-1',
        type: 'textBlock',
        position: { x: 250, y: 200 },
        data: {
            value: 'A weary merchant in tattered robes',
            text: 'A weary merchant in tattered robes',
            nodeType: 'textBlock',
        },
    },
];
// Stage 2: Edit merchant to knight
const stage2Nodes = [
    {
        id: 'merchant-1',
        type: 'textBlock',
        position: { x: 250, y: 200 },
        data: {
            value: 'A weary knight in tattered robes',
            text: 'A weary knight in tattered robes',
            nodeType: 'textBlock',
            isEditing: true, // Show edit mode
        },
    },
];
// Stage 3: Add occupation choice
const stage3Nodes = [
    {
        id: 'merchant-1',
        type: 'textBlock',
        position: { x: 100, y: 200 },
        data: {
            value: 'A weary',
            text: 'A weary',
            nodeType: 'textBlock',
        },
    },
    {
        id: 'occupation-1',
        type: 'weightedChoice',
        position: { x: 300, y: 200 },
        data: {
            value: JSON.stringify([
                { text: 'knight', weight: 30 },
                { text: 'merchant', weight: 25 },
                { text: 'blacksmith', weight: 20 },
                { text: 'innkeeper', weight: 15 },
                { text: 'minstrel', weight: 10 },
            ]),
            options: [
                { text: 'knight', weight: 30 },
                { text: 'merchant', weight: 25 },
                { text: 'blacksmith', weight: 20 },
                { text: 'innkeeper', weight: 15 },
                { text: 'minstrel', weight: 10 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    {
        id: 'appearance-1',
        type: 'textBlock',
        position: { x: 550, y: 200 },
        data: {
            value: 'in tattered robes',
            text: 'in tattered robes',
            nodeType: 'textBlock',
        },
    },
];
const stage3Edges = [
    { id: 'e1', source: 'merchant-1', target: 'occupation-1' },
    { id: 'e2', source: 'occupation-1', target: 'appearance-1' },
];
// Stage 4: Full medieval graph
const fullDemoNodes = [
    // Character introduction
    {
        id: 'intro-1',
        type: 'textBlock',
        position: { x: 50, y: 100 },
        data: {
            value: 'A weary',
            text: 'A weary',
            nodeType: 'textBlock',
        },
    },
    {
        id: 'occupation-1',
        type: 'weightedChoice',
        position: { x: 200, y: 100 },
        data: {
            value: JSON.stringify([
                { text: 'knight', weight: 30 },
                { text: 'merchant', weight: 25 },
                { text: 'blacksmith', weight: 20 },
                { text: 'innkeeper', weight: 15 },
                { text: 'minstrel', weight: 10 },
            ]),
            options: [
                { text: 'knight', weight: 30 },
                { text: 'merchant', weight: 25 },
                { text: 'blacksmith', weight: 20 },
                { text: 'innkeeper', weight: 15 },
                { text: 'minstrel', weight: 10 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    {
        id: 'appearance-1',
        type: 'concat',
        position: { x: 450, y: 100 },
        data: {
            value: ' in ',
            separator: ' in ',
            nodeType: 'concat',
        },
    },
    {
        id: 'clothing-1',
        type: 'weightedChoice',
        position: { x: 600, y: 100 },
        data: {
            value: JSON.stringify([
                { text: 'tattered robes', weight: 40 },
                { text: 'worn leather armor', weight: 30 },
                { text: 'faded noble garments', weight: 20 },
                { text: 'mysterious dark cloak', weight: 10 },
            ]),
            options: [
                { text: 'tattered robes', weight: 40 },
                { text: 'worn leather armor', weight: 30 },
                { text: 'faded noble garments', weight: 20 },
                { text: 'mysterious dark cloak', weight: 10 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    // Action sequence
    {
        id: 'action-1',
        type: 'textBlock',
        position: { x: 50, y: 250 },
        data: {
            value: 'approaches the',
            text: 'approaches the',
            nodeType: 'textBlock',
        },
    },
    {
        id: 'location-1',
        type: 'weightedChoice',
        position: { x: 250, y: 250 },
        data: {
            value: JSON.stringify([
                { text: 'ancient castle gates', weight: 35 },
                { text: 'bustling market square', weight: 30 },
                { text: 'shadowy tavern', weight: 25 },
                { text: 'mystical forest shrine', weight: 10 },
            ]),
            options: [
                { text: 'ancient castle gates', weight: 35 },
                { text: 'bustling market square', weight: 30 },
                { text: 'shadowy tavern', weight: 25 },
                { text: 'mystical forest shrine', weight: 10 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    // Quest hook
    {
        id: 'quest-intro',
        type: 'textBlock',
        position: { x: 50, y: 400 },
        data: {
            value: 'seeking',
            text: 'seeking',
            nodeType: 'textBlock',
        },
    },
    {
        id: 'quest-1',
        type: 'weightedChoice',
        position: { x: 200, y: 400 },
        data: {
            value: JSON.stringify([
                { text: 'the lost crown of King Aldric', weight: 30 },
                { text: 'revenge for a fallen comrade', weight: 25 },
                { text: 'a cure for the plague', weight: 25 },
                { text: 'ancient magical artifacts', weight: 15 },
                { text: 'redemption for past sins', weight: 5 },
            ]),
            options: [
                { text: 'the lost crown of King Aldric', weight: 30 },
                { text: 'revenge for a fallen comrade', weight: 25 },
                { text: 'a cure for the plague', weight: 25 },
                { text: 'ancient magical artifacts', weight: 15 },
                { text: 'redemption for past sins', weight: 5 },
            ],
            nodeType: 'weightedChoice',
        },
    },
    // Output
    {
        id: 'output-1',
        type: 'output',
        position: { x: 450, y: 500 },
        data: {
            value: 'Medieval Adventure',
            label: 'Medieval Adventure',
            nodeType: 'output',
        },
    },
];
const fullDemoEdges = [
    // Character flow
    { id: 'e1', source: 'intro-1', target: 'occupation-1', animated: true },
    { id: 'e2', source: 'occupation-1', target: 'appearance-1', animated: true },
    { id: 'e3', source: 'appearance-1', target: 'clothing-1', animated: true },
    // Action flow
    { id: 'e4', source: 'clothing-1', target: 'action-1' },
    { id: 'e5', source: 'action-1', target: 'location-1', animated: true },
    // Quest flow
    { id: 'e6', source: 'location-1', target: 'quest-intro' },
    { id: 'e7', source: 'quest-intro', target: 'quest-1', animated: true },
    // Output
    { id: 'e8', source: 'quest-1', target: 'output-1' },
];
export const MedievalDemoShowcase = () => {
    const [currentStage, setCurrentStage] = useState(0);
    const [nodes, setNodes] = useState(emptyNodes);
    const [edges, setEdges] = useState(emptyEdges);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [highlightedNodes, setHighlightedNodes] = useState([]);
    const [completedStages, setCompletedStages] = useState(new Set());
    // Demo stages
    const demoStages = [
        {
            id: 'empty',
            title: 'Empty Canvas',
            description: 'Start with a blank graph',
            action: () => {
                setNodes(emptyNodes);
                setEdges(emptyEdges);
                triggerHaptic('light');
            },
            duration: 2000,
        },
        {
            id: 'paste',
            title: 'Quick Start',
            description: 'Paste text to create instant node',
            action: () => {
                setNodes(stage1Nodes);
                setEdges(emptyEdges);
                setHighlightedNodes(['merchant-1']);
                triggerHaptic('medium');
            },
            duration: 3000,
            highlight: ['merchant-1'],
        },
        {
            id: 'edit',
            title: 'Inline Edit',
            description: 'Click to edit "merchant" → "knight"',
            action: () => {
                setNodes(stage2Nodes);
                setHighlightedNodes(['merchant-1']);
                triggerHaptic('light');
            },
            duration: 4000,
            highlight: ['merchant-1'],
        },
        {
            id: 'expand',
            title: 'Smart Expansion',
            description: 'Add occupation variety',
            action: () => {
                setNodes(stage3Nodes);
                setEdges(stage3Edges);
                setHighlightedNodes(['occupation-1']);
                triggerHaptic('medium');
            },
            duration: 4000,
            highlight: ['occupation-1'],
        },
        {
            id: 'full',
            title: 'Complete Graph',
            description: 'Full medieval adventure generator',
            action: () => {
                setNodes(fullDemoNodes);
                setEdges(fullDemoEdges);
                setHighlightedNodes([]);
                triggerHaptic('heavy');
            },
            duration: 5000,
        },
        {
            id: 'preview',
            title: 'Live Preview',
            description: 'Generate 20 unique adventures',
            action: () => {
                // Preview is handled by the editor
                setHighlightedNodes(['output-1']);
                triggerHaptic('medium');
            },
            duration: 6000,
            highlight: ['output-1'],
        },
    ];
    // Auto-play demo
    const playDemo = useCallback(() => {
        setIsPlaying(true);
        setCurrentStage(0);
        setCompletedStages(new Set());
        let stageIndex = 0;
        const playNextStage = () => {
            if (stageIndex >= demoStages.length) {
                setIsPlaying(false);
                return;
            }
            const stage = demoStages[stageIndex];
            setCurrentStage(stageIndex);
            stage.action();
            setCompletedStages(prev => new Set([...prev, stage.id]));
            stageIndex++;
            setTimeout(playNextStage, stage.duration);
        };
        playNextStage();
    }, []);
    // Jump to specific stage
    const jumpToStage = useCallback((index) => {
        if (index >= 0 && index < demoStages.length) {
            setCurrentStage(index);
            demoStages[index].action();
            setCompletedStages(prev => new Set([...prev, demoStages[index].id]));
        }
    }, []);
    // Reset demo
    const resetDemo = useCallback(() => {
        setCurrentStage(0);
        setNodes(emptyNodes);
        setEdges(emptyEdges);
        setHighlightedNodes([]);
        setCompletedStages(new Set());
        setIsPlaying(false);
    }, []);
    // Calculate total demo time
    const totalDemoTime = demoStages.reduce((sum, stage) => sum + stage.duration, 0) / 1000;
    // Apply highlighting to nodes
    const highlightedNodeSet = new Set(highlightedNodes);
    const enhancedNodes = nodes.map(node => ({
        ...node,
        className: highlightedNodeSet.has(node.id) ? 'highlighted-node' : '',
    }));
    return (_jsxs("div", { style: { width: '100vw', height: '100vh' }, children: [_jsxs("div", { style: {
                    padding: 20,
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    borderBottom: '1px solid #333',
                    color: 'white'
                }, children: [_jsx("h1", { style: { margin: 0, fontSize: 28, fontWeight: 600 }, children: "\uD83C\uDFF0 Medieval Demo Showcase" }), _jsx("p", { style: { margin: '10px 0 0 0', color: '#aaa' }, children: "Experience the magic of inline editing with a medieval adventure generator" })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    top: 100,
                    right: 20,
                    width: 320,
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden',
                    zIndex: 100
                }, children: [_jsxs("div", { style: {
                            padding: 20,
                            background: '#f8f9fa',
                            borderBottom: '1px solid #e9ecef'
                        }, children: [_jsxs("h3", { style: { margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }, children: ["\uD83C\uDFAC Demo Script", _jsx("span", { style: {
                                            fontSize: 12,
                                            padding: '2px 8px',
                                            background: isPlaying ? '#28a745' : '#6c757d',
                                            color: 'white',
                                            borderRadius: 12
                                        }, children: isPlaying ? 'Playing' : 'Ready' })] }), _jsxs("p", { style: { margin: '5px 0 0 0', fontSize: 13, color: '#666' }, children: ["Total time: ", totalDemoTime, "s"] })] }), _jsx("div", { style: { maxHeight: 400, overflowY: 'auto' }, children: demoStages.map((stage, index) => (_jsx("div", { style: {
                                padding: 15,
                                borderBottom: '1px solid #e9ecef',
                                background: index === currentStage ? '#e7f3ff' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }, onClick: () => !isPlaying && jumpToStage(index), children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: {
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            background: completedStages.has(stage.id) ? '#28a745' :
                                                index === currentStage ? '#007bff' : '#e9ecef',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 'bold'
                                        }, children: completedStages.has(stage.id) ? '✓' : index + 1 }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 500, fontSize: 14 }, children: stage.title }), _jsx("div", { style: { fontSize: 12, color: '#666', marginTop: 2 }, children: stage.description })] }), _jsxs("div", { style: { fontSize: 11, color: '#999' }, children: [(stage.duration / 1000).toFixed(1), "s"] })] }) }, stage.id))) }), _jsxs("div", { style: {
                            padding: 15,
                            background: '#f8f9fa',
                            borderTop: '1px solid #e9ecef',
                            display: 'flex',
                            gap: 10
                        }, children: [_jsx("button", { onClick: playDemo, disabled: isPlaying, style: {
                                    flex: 1,
                                    padding: '8px 16px',
                                    background: isPlaying ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                                    fontSize: 14,
                                    fontWeight: 500
                                }, children: isPlaying ? 'Playing...' : '▶ Play Demo' }), _jsx("button", { onClick: resetDemo, style: {
                                    padding: '8px 16px',
                                    background: 'white',
                                    color: '#666',
                                    border: '1px solid #ddd',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 14
                                }, children: "Reset" })] })] }), showInstructions && (_jsxs("div", { style: {
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    zIndex: 50
                }, children: [_jsx("span", { children: "\uD83D\uDCA1 Click nodes to edit inline \u2022 Drag to connect \u2022 Press P for preview" }), _jsx("button", { onClick: () => setShowInstructions(false), style: {
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            opacity: 0.7
                        }, children: "\u2715" })] })), _jsx("div", { style: { height: 'calc(100% - 80px)' }, children: _jsx(Epic1GraphEditorWithProvider, { initialNodes: enhancedNodes, initialEdges: edges, showAssetLibrary: true, showPreview: true, previewSeeds: ['adventure1', 'adventure2', 'adventure3', 'quest1', 'quest2'] }) }), _jsx("style", { children: `
        .highlighted-node {
          animation: highlight-pulse 2s ease-in-out infinite;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4);
        }
        
        @keyframes highlight-pulse {
          0% { box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(0, 123, 255, 0.2); }
          100% { box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.4); }
        }
        
        .react-flow__edge.animated {
          animation: dash 1s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      ` })] }));
};
