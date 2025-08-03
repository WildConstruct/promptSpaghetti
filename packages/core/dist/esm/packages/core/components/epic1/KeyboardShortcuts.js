import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback, useState } from 'react';
import { useReactFlow, useStore } from 'reactflow';
/**
 * Epic 1 Keyboard Shortcuts
 * Provides comprehensive keyboard navigation and control
 */
export const KeyboardShortcuts = ({ onSave, onLoad, onExport, onDelete, onDuplicate, onSelectAll, additionalHandlers = {}, }) => {
    const reactFlowInstance = useReactFlow();
    const [showHelp, setShowHelp] = useState(false);
    // Get selected nodes from store with safety check
    const selectedNodes = useStore((state) => state?.nodes?.filter(node => node.selected) || []);
    // Pan shortcuts (Arrow keys)
    const handlePan = useCallback((direction) => {
        const viewport = reactFlowInstance.getViewport();
        const panDistance = 50;
        switch (direction) {
            case 'up':
                reactFlowInstance.setViewport({
                    x: viewport.x,
                    y: viewport.y + panDistance,
                    zoom: viewport.zoom
                });
                break;
            case 'down':
                reactFlowInstance.setViewport({
                    x: viewport.x,
                    y: viewport.y - panDistance,
                    zoom: viewport.zoom
                });
                break;
            case 'left':
                reactFlowInstance.setViewport({
                    x: viewport.x + panDistance,
                    y: viewport.y,
                    zoom: viewport.zoom
                });
                break;
            case 'right':
                reactFlowInstance.setViewport({
                    x: viewport.x - panDistance,
                    y: viewport.y,
                    zoom: viewport.zoom
                });
                break;
        }
    }, [reactFlowInstance]);
    // Zoom shortcuts
    const handleZoom = useCallback((zoomIn) => {
        const viewport = reactFlowInstance.getViewport();
        const zoomStep = 0.1;
        const newZoom = zoomIn
            ? Math.min(viewport.zoom + zoomStep, 2)
            : Math.max(viewport.zoom - zoomStep, 0.1);
        reactFlowInstance.setViewport({
            x: viewport.x,
            y: viewport.y,
            zoom: newZoom
        });
    }, [reactFlowInstance]);
    // Fit view shortcut
    const handleFitView = useCallback(() => {
        reactFlowInstance.fitView({
            padding: 0.2,
            duration: 300
        });
    }, [reactFlowInstance]);
    // Node navigation (Tab/Shift+Tab)
    const handleNodeNavigation = useCallback((forward) => {
        const nodes = reactFlowInstance.getNodes();
        const selectedNode = nodes.find(n => n.selected);
        if (!selectedNode && forward) {
            // Select first node
            if (nodes.length > 0) {
                reactFlowInstance.setNodes(nodes.map((n, i) => ({
                    ...n,
                    selected: i === 0
                })));
            }
        }
        else if (selectedNode) {
            const currentIndex = nodes.findIndex(n => n.id === selectedNode.id);
            const nextIndex = forward
                ? (currentIndex + 1) % nodes.length
                : (currentIndex - 1 + nodes.length) % nodes.length;
            reactFlowInstance.setNodes(nodes.map((n, i) => ({
                ...n,
                selected: i === nextIndex
            })));
        }
    }, [reactFlowInstance]);
    // Delete selected nodes
    const handleDelete = useCallback(() => {
        if (selectedNodes.length > 0 && onDelete) {
            onDelete(selectedNodes);
        }
    }, [selectedNodes, onDelete]);
    // Duplicate selected nodes
    const handleDuplicate = useCallback(() => {
        if (selectedNodes.length > 0 && onDuplicate) {
            onDuplicate(selectedNodes);
        }
    }, [selectedNodes, onDuplicate]);
    // Select all nodes
    const handleSelectAll = useCallback(() => {
        if (onSelectAll) {
            onSelectAll();
        }
        else {
            const nodes = reactFlowInstance.getNodes();
            reactFlowInstance.setNodes(nodes.map(n => ({ ...n, selected: true })));
        }
    }, [reactFlowInstance, onSelectAll]);
    // Main keyboard event handler
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check if we're in an input field
            const target = event.target;
            const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName);
            // Don't handle shortcuts when typing in input fields
            if (isInputField && !event.metaKey && !event.ctrlKey) {
                return;
            }
            const key = event.key.toLowerCase();
            const hasCmd = event.metaKey || event.ctrlKey;
            const hasShift = event.shiftKey;
            const hasAlt = event.altKey;
            // Help menu
            if (key === '?' || (hasCmd && key === '/')) {
                event.preventDefault();
                setShowHelp(prev => !prev);
                return;
            }
            // File operations
            if (hasCmd && !hasShift && !hasAlt) {
                switch (key) {
                    case 's':
                        event.preventDefault();
                        onSave?.();
                        break;
                    case 'o':
                        event.preventDefault();
                        onLoad?.();
                        break;
                    case 'e':
                        event.preventDefault();
                        onExport?.();
                        break;
                    case 'a':
                        event.preventDefault();
                        handleSelectAll();
                        break;
                    case 'd':
                        event.preventDefault();
                        handleDuplicate();
                        break;
                }
            }
            // Zoom controls
            if (hasCmd) {
                switch (key) {
                    case '=':
                    case '+':
                        event.preventDefault();
                        handleZoom(true);
                        break;
                    case '-':
                    case '_':
                        event.preventDefault();
                        handleZoom(false);
                        break;
                    case '0':
                        event.preventDefault();
                        handleFitView();
                        break;
                }
            }
            // Pan controls (arrow keys, no modifiers)
            if (!hasCmd && !hasShift && !hasAlt && !isInputField) {
                switch (key) {
                    case 'arrowup':
                        event.preventDefault();
                        handlePan('up');
                        break;
                    case 'arrowdown':
                        event.preventDefault();
                        handlePan('down');
                        break;
                    case 'arrowleft':
                        event.preventDefault();
                        handlePan('left');
                        break;
                    case 'arrowright':
                        event.preventDefault();
                        handlePan('right');
                        break;
                }
            }
            // Node navigation
            if (key === 'tab' && !hasCmd && !hasAlt) {
                event.preventDefault();
                handleNodeNavigation(!hasShift);
            }
            // Delete
            if ((key === 'delete' || key === 'backspace') && !isInputField) {
                event.preventDefault();
                handleDelete();
            }
            // Space for hand tool (pan mode)
            if (key === ' ' && !isInputField) {
                event.preventDefault();
                // React Flow handles space for pan mode automatically
            }
            // Check additional handlers
            if (additionalHandlers[key] && !isInputField) {
                event.preventDefault();
                additionalHandlers[key]();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        onSave,
        onLoad,
        onExport,
        handlePan,
        handleZoom,
        handleFitView,
        handleNodeNavigation,
        handleDelete,
        handleDuplicate,
        handleSelectAll,
        additionalHandlers,
    ]);
    // Help overlay
    if (showHelp) {
        return (_jsx("div", { className: "epic1-keyboard-help-overlay", onClick: () => setShowHelp(false), children: _jsxs("div", { className: "epic1-keyboard-help-content", onClick: e => e.stopPropagation(), children: [_jsx("h2", { children: "Keyboard Shortcuts" }), _jsxs("div", { className: "epic1-shortcuts-section", children: [_jsx("h3", { children: "Navigation" }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "Arrow Keys" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Pan canvas" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "Space + Drag" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Pan mode" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "Tab / Shift+Tab" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Navigate between nodes" })] })] }), _jsxs("div", { className: "epic1-shortcuts-section", children: [_jsx("h3", { children: "Zoom" }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + Plus" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Zoom in" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + Minus" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Zoom out" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + 0" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Fit to view" })] })] }), _jsxs("div", { className: "epic1-shortcuts-section", children: [_jsx("h3", { children: "Editing" }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "Click" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Edit node" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "Enter" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Confirm edit" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "Escape" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Cancel edit" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "Delete/Backspace" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Delete selected" })] })] }), _jsxs("div", { className: "epic1-shortcuts-section", children: [_jsx("h3", { children: "Selection" }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + A" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Select all" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + D" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Duplicate selected" })] })] }), _jsxs("div", { className: "epic1-shortcuts-section", children: [_jsx("h3", { children: "File Operations" }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + S" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Save" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + O" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Load/Open" })] }), _jsxs("div", { className: "epic1-shortcut-row", children: [_jsx("span", { className: "epic1-shortcut-keys", children: "\u2318/Ctrl + E" }), _jsx("span", { className: "epic1-shortcut-desc", children: "Export" })] })] }), _jsx("button", { className: "epic1-help-close", onClick: () => setShowHelp(false), children: "Close (Esc)" })] }) }));
    }
    return null;
};
export default KeyboardShortcuts;
