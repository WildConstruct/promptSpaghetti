import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Professional Integration Component
 * Phase 2: Complete Professional Features Integration
 *
 * Integrates all professional features into a unified Cinema 4D-inspired interface
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { CommandPalette } from './CommandPalette';
import { UndoRedoManager, UndoRedoSystem } from './UndoRedoManager';
import { MultiSelectionManager } from './MultiSelectionManager';
import { AutosaveManager } from './AutosaveManager';
import { KeyboardShortcutsManager } from './KeyboardShortcutsManager';
export const ProfessionalIntegration = ({ nodes, edges, selectedNodes, selectedEdges, onNodesChange, onEdgesChange, onNodesSelect, onEdgesSelect, onNodeCreate, onNodeDelete, onExport, onSave, onLoad, theme = 'cinema', }) => {
    // Command Palette State
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    // Professional Feature Managers
    const undoRedoRef = useRef();
    const reactFlowInstance = useReactFlow();
    // Initialize undo/redo system
    useEffect(() => {
        if (!undoRedoRef.current) {
            undoRedoRef.current = new UndoRedoSystem(50);
        }
    }, []);
    // Track changes for undo/redo
    useEffect(() => {
        if (undoRedoRef.current && (nodes.length > 0 || edges.length > 0)) {
            undoRedoRef.current.addState(nodes, edges, `Graph updated: ${nodes.length} nodes, ${edges.length} edges`);
        }
    }, [nodes, edges]);
    // Command Palette Actions
    const handleCommandPalette = useCallback(() => {
        setShowCommandPalette(true);
    }, []);
    const handleGenerationStart = useCallback(async (flow, params) => {
        console.log('Starting generation flow:', flow.name, params);
        // Implementation would go here - this is a demo
        // Simulate graph generation
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Example: Create a character generation chain
        if (flow.id === 'character-development') {
            const characterName = params['character-name'] || 'Generated Character';
            const characterRole = params['character-role'] || 'protagonist';
            const viewport = reactFlowInstance?.getViewport();
            const centerX = viewport ? -viewport.x + 400 : 400;
            const centerY = viewport ? -viewport.y + 200 : 200;
            // Create character profile node
            onNodeCreate('text', { x: centerX, y: centerY }, {
                label: `${characterName} Profile`,
                description: `${characterRole} character profile with traits and background`,
                category: 'character',
            });
            // Create traits node
            onNodeCreate('logic', { x: centerX + 300, y: centerY }, {
                label: 'Character Traits',
                description: 'Personality traits and characteristics',
                category: 'character',
                options: [
                    ,
                    { label: 'Brave and determined', value: 'brave', weight: 1 },
                    { label: 'Intelligent and analytical', value: 'intelligent', weight: 1 },
                    { label: 'Compassionate and caring', value: 'compassionate', weight: 1 },
                ],
            });
            // Create dialogue node
            onNodeCreate('output', { x: centerX + 600, y: centerY }, {
                label: 'Character Dialogue',
                description: 'Generated dialogue samples',
                category: 'character',
            });
        }
    }, [onNodeCreate, reactFlowInstance]);
    // Undo/Redo Actions
    const handleUndo = useCallback(() => {
        if (undoRedoRef.current) {
            const state = undoRedoRef.current.undo();
            if (state) {
                onNodesChange(state.nodes);
                onEdgesChange(state.edges);
            }
        }
    }, [onNodesChange, onEdgesChange]);
    const handleRedo = useCallback(() => {
        if (undoRedoRef.current) {
            const state = undoRedoRef.current.redo();
            if (state) {
                onNodesChange(state.nodes);
                onEdgesChange(state.edges);
            }
        }
    }, [onNodesChange, onEdgesChange]);
    // Selection Actions
    const handleSelectAll = useCallback(() => {
        onNodesSelect(nodes);
        onEdgesSelect(edges);
    }, [nodes, edges, onNodesSelect, onEdgesSelect]);
    const handleDelete = useCallback(() => {
        if (selectedNodes.length > 0) {
            onNodeDelete(selectedNodes.map(n => n.id));
        }
    }, [selectedNodes, onNodeDelete]);
    const handleDuplicate = useCallback(() => {
        selectedNodes.forEach(node => {
            const position = { x: node.position.x + 50, y: node.position.y + 50 };
            onNodeCreate(node.type || 'text', position, {
                ...node.data,
                label: `${node.data?.label || 'Node'} (Copy)`,
            });
        });
    }, [selectedNodes, onNodeCreate]);
    // View Actions
    const handleFitView = useCallback(() => {
        reactFlowInstance?.fitView({ padding: 0.1 });
    }, [reactFlowInstance]);
    const handleZoomIn = useCallback(() => {
        reactFlowInstance?.zoomIn();
    }, [reactFlowInstance]);
    const handleZoomOut = useCallback(() => {
        reactFlowInstance?.zoomOut();
    }, [reactFlowInstance]);
    const handleToggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
        else {
            document.exitFullscreen();
        }
    }, []);
    // Generation Actions
    const handleGenerateCharacter = useCallback(() => {
        setShowCommandPalette(true);
        // The command palette will show generation flows
    }, []);
    // Template Actions
    const handleTemplateApply = useCallback((templateId) => {
        console.log('Applying template:', templateId);
        // Template application logic would go here
    }, []);
    // Autosave Restore
    const handleAutosaveRestore = useCallback((autosaveState) => {
        onNodesChange(autosaveState.nodes);
        onEdgesChange(autosaveState.edges);
    }, [onNodesChange, onEdgesChange]);
    // Selection Change Handler
    const handleSelectionChange = useCallback((selection) => {
        onNodesSelect(selection.nodes);
        onEdgesSelect(selection.edges);
    }, [onNodesSelect, onEdgesSelect]);
    return (_jsxs(_Fragment, { children: [_jsx(CommandPalette, { isOpen: showCommandPalette, onClose: () => setShowCommandPalette(false), nodes: nodes, edges: edges, selectedNodes: selectedNodes, onGenerationStart: handleGenerationStart, onNodeCreate: onNodeCreate, onNodeDelete: onNodeDelete, onExport: onExport, onTemplateApply: handleTemplateApply, theme: theme }), _jsx("div", { style: {
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: 1000,
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                }, children: _jsx(UndoRedoManager, { onStateChange: state => {
                        onNodesChange(state.nodes);
                        onEdgesChange(state.edges);
                    }, theme: theme }) }), _jsx(MultiSelectionManager, { nodes: nodes, edges: edges, selectedNodes: selectedNodes, selectedEdges: selectedEdges, onNodesSelect: onNodesSelect, onEdgesSelect: onEdgesSelect, onSelectionChange: handleSelectionChange, theme: theme }), _jsx(AutosaveManager, { nodes: nodes, edges: edges, onRestore: handleAutosaveRestore, theme: theme, interval: 30000, maxVersions: 10 }), _jsx(KeyboardShortcutsManager, { onCommandPalette: handleCommandPalette, onUndo: handleUndo, onRedo: handleRedo, onSave: onSave, onLoad: onLoad, onExport: () => onExport('json'), onSelectAll: handleSelectAll, onDelete: handleDelete, onDuplicate: handleDuplicate, onFitView: handleFitView, onZoomIn: handleZoomIn, onZoomOut: handleZoomOut, onGenerateCharacter: handleGenerateCharacter, onToggleFullscreen: handleToggleFullscreen, theme: theme }), _jsxs("div", { style: {
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    zIndex: 1000,
                    padding: '8px 12px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-ui-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }, children: [_jsx("div", { style: {
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-accent-green)',
                            animation: 'pulse 2s infinite',
                        } }), _jsx("span", { children: "Professional Mode Active" }), _jsx("span", { style: { opacity: 0.7 }, children: "|" }), _jsxs("span", { children: [nodes.length, " nodes"] }), _jsx("span", { style: { opacity: 0.7 }, children: "|" }), _jsxs("span", { children: [selectedNodes.length, " selected"] }), _jsx("span", { style: { opacity: 0.7 }, children: "|" }), _jsx("span", { children: "Press \u2318K for commands" })] }), nodes.length === 0 && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-family-primary)',
                    zIndex: 999,
                }, children: [_jsx("div", { style: { fontSize: '64px', marginBottom: '16px', opacity: 0.5 }, children: "\uD83C\uDFAC" }), _jsx("h2", { style: {
                            fontSize: '24px',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)',
                            marginBottom: '8px',
                        }, children: "Professional Graph Editor" }), _jsx("p", { style: {
                            fontSize: '16px',
                            marginBottom: '20px',
                            maxWidth: '400px',
                            lineHeight: 1.5,
                        }, children: "Create professional prompt generation workflows with Cinema 4D-inspired tools and shortcuts." }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                        }, children: [_jsxs("div", { children: ["Press", ' ', _jsx("kbd", { style: {
                                            background: 'var(--color-bg-primary)',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            border: '1px solid var(--color-ui-border)',
                                            fontFamily: 'monospace',
                                        }, children: "\u2318K" }), ' ', "for commands"] }), _jsx("div", { children: "\u2022" }), _jsx("div", { children: "Drag nodes from the palette" }), _jsx("div", { children: "\u2022" }), _jsxs("div", { children: ["Press", ' ', _jsx("kbd", { style: {
                                            background: 'var(--color-bg-primary)',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            border: '1px solid var(--color-ui-border)',
                                            fontFamily: 'monospace',
                                        }, children: "?" }), ' ', "for help"] })] })] })), _jsx("style", { children: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        /* Smooth node animations */
        .react-flow__node {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .react-flow__node.selected {
          transform: scale(1.02);
        }
        /* Professional edge animations */
        .react-flow__edge {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .react-flow__edge:hover {
          stroke-width: 3px !important;
        }
      ` })] }));
};
export default ProfessionalIntegration;
