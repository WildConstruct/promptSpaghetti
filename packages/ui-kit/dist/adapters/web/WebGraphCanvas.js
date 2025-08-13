import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Web-specific GraphCanvas implementation with enhanced features
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { GraphCanvas } from '../../components/GraphCanvas';
import { usePlatformAdapter } from '../usePlatformAdapter';
export const WebGraphCanvas = ({ enableKeyboardShortcuts = true, enableContextMenu = true, enableDragAndDrop = true, enableClipboard = true, enableUndo = true, maxUndoSteps = 50, onNodeSelect, onNodeMove, onEdgeCreate, onEdgeDelete, ...props }) => {
    const adapter = usePlatformAdapter();
    const canvasRef = useRef(null);
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    // Keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if (!enableKeyboardShortcuts)
            return;
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                // Delete selected node
                if (props.selectedNodeId && !props.readOnly) {
                    e.preventDefault();
                    // onNodeDelete could be called here
                }
                break;
            case 'z':
                if (isCtrlOrCmd && enableUndo) {
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Redo
                        handleRedo();
                    }
                    else {
                        // Undo
                        handleUndo();
                    }
                }
                break;
            case 'c':
                if (isCtrlOrCmd && enableClipboard && props.selectedNodeId) {
                    e.preventDefault();
                    handleCopyNode();
                }
                break;
            case 'v':
                if (isCtrlOrCmd && enableClipboard) {
                    e.preventDefault();
                    handlePasteNode();
                }
                break;
            case 'a':
                if (isCtrlOrCmd) {
                    e.preventDefault();
                    // Select all nodes
                    handleSelectAll();
                }
                break;
            case 'Escape':
                // Deselect all
                onNodeSelect?.(null);
                break;
        }
    }, [enableKeyboardShortcuts, enableUndo, enableClipboard, props.selectedNodeId, props.readOnly, onNodeSelect]);
    // Undo/Redo functionality
    const handleUndo = () => {
        if (undoStack.length > 0) {
            const lastState = undoStack[undoStack.length - 1];
            setRedoStack(prev => [props.graph, ...prev.slice(0, maxUndoSteps - 1)]);
            setUndoStack(prev => prev.slice(0, -1));
            // Apply the undo state
            // This would need to be connected to parent state management
        }
    };
    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack[0];
            setUndoStack(prev => [...prev, props.graph].slice(-maxUndoSteps));
            setRedoStack(prev => prev.slice(1));
            // Apply the redo state
        }
    };
    // Clipboard functionality
    const handleCopyNode = async () => {
        if (props.selectedNodeId) {
            const selectedNode = props.graph.nodes.find(n => n.id === props.selectedNodeId);
            if (selectedNode) {
                try {
                    await adapter.copyToClipboard(JSON.stringify(selectedNode, null, 2));
                }
                catch (error) {
                    console.warn('Failed to copy node:', error);
                }
            }
        }
    };
    const handlePasteNode = async () => {
        try {
            // This would need to be implemented with clipboard API
            // For now, just a placeholder
        }
        catch (error) {
            console.warn('Failed to paste node:', error);
        }
    };
    const handleSelectAll = () => {
        // Implementation for selecting all nodes
        // This would need to be connected to parent state
    };
    // Context menu
    const handleContextMenu = useCallback((e) => {
        if (!enableContextMenu)
            return;
        e.preventDefault();
        // Show custom context menu
        const contextMenu = [
            { label: 'Copy', action: handleCopyNode, shortcut: 'Ctrl+C' },
            { label: 'Paste', action: handlePasteNode, shortcut: 'Ctrl+V' },
            { separator: true },
            { label: 'Delete', action: () => { }, shortcut: 'Delete' },
            { separator: true },
            { label: 'Select All', action: handleSelectAll, shortcut: 'Ctrl+A' },
        ];
        // This would need to show an actual context menu component
        console.log('Context menu:', contextMenu);
    }, [enableContextMenu]);
    // Drag and drop for files
    const handleDragOver = useCallback((e) => {
        if (!enableDragAndDrop)
            return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, [enableDragAndDrop]);
    const handleDrop = useCallback(async (e) => {
        if (!enableDragAndDrop)
            return;
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            if (file.type === 'application/json') {
                try {
                    const content = await adapter.readFile(file);
                    const data = JSON.parse(content);
                    // Handle imported graph data
                    console.log('Imported data:', data);
                }
                catch (error) {
                    console.warn('Failed to import file:', error);
                }
            }
        }
    }, [enableDragAndDrop, adapter]);
    // Enhanced mouse handling
    const handleMouseDown = useCallback((e) => {
        // Focus the canvas for keyboard events
        if (canvasRef.current) {
            canvasRef.current.focus();
        }
    }, []);
    // Event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        canvas.addEventListener('keydown', handleKeyDown);
        return () => {
            canvas.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    // Save state for undo/redo when graph changes
    useEffect(() => {
        if (enableUndo) {
            setUndoStack(prev => [...prev, props.graph].slice(-maxUndoSteps));
            setRedoStack([]); // Clear redo stack when new changes are made
        }
    }, [props.graph, enableUndo, maxUndoSteps]);
    return (_jsxs("div", { ref: canvasRef, tabIndex: 0, style: {
            outline: 'none', // Remove focus outline
            position: 'relative',
            width: '100%',
            height: '100%',
        }, onContextMenu: handleContextMenu, onDragOver: handleDragOver, onDrop: handleDrop, onMouseDown: handleMouseDown, children: [_jsx(GraphCanvas, { ...props, onNodeSelect: onNodeSelect, onNodeMove: onNodeMove, onEdgeCreate: onEdgeCreate, onEdgeDelete: onEdgeDelete }), enableKeyboardShortcuts && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none',
                }, className: "keyboard-shortcuts-help", children: [_jsx("div", { children: "Ctrl+Z: Undo" }), _jsx("div", { children: "Ctrl+Shift+Z: Redo" }), _jsx("div", { children: "Ctrl+C: Copy" }), _jsx("div", { children: "Ctrl+V: Paste" }), _jsx("div", { children: "Delete: Remove" }), _jsx("div", { children: "Ctrl+A: Select All" })] }))] }));
};
//# sourceMappingURL=WebGraphCanvas.js.map