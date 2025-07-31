import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { InlineNodeEditor } from './InlineNodeEditor';
position: {
    x: number;
    y: number;
}
;
isActive: boolean;
export const InlineEditorManager = ({ nodes, onNodeUpdate, canvasRef }) => {
    const [editorState, setEditorState] = useState({
        nodeId: null,
        position: { x: 0, y: 0 },
        isActive: false
    });
    const { getNode, project, getViewport } = useReactFlow();
    const activationTimeoutRef = useRef(null);
    const lastClickTimeRef = useRef(0);
    const lastClickNodeRef = useRef(null);
    // Handle double-click detection
    const handleNodeClick = useCallback((event, nodeId) => {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTimeRef.current;
        const isSameNode = lastClickNodeRef.current === nodeId;
        lastClickTimeRef.current = now;
        lastClickNodeRef.current = nodeId;
        // Double-click detection (within 300ms on same node)
        if (timeSinceLastClick < 300 && isSameNode) {
            event.preventDefault();
            event.stopPropagation();
            activateEditor(nodeId, event);
        }
    }, []);
    const activateEditor = useCallback((nodeId, event) => {
        const node = getNode(nodeId);
        if (!node)
            return;
        // Calculate editor position
        let editorPosition;
        if (event && canvasRef?.current) {
            // Position relative to click if event provided
            const canvasRect = canvasRef.current.getBoundingClientRect();
            editorPosition = {
                x: event.clientX - canvasRect.left + 20,
                y: event.clientY - canvasRect.top + 20,
            };
        }
        else {
            // Position relative to node center
            const viewport = getViewport();
            const nodeScreenPos = project({
                x: node.position.x + (node.width || 200) / 2,
                y: node.position.y + (node.height || 100) / 2,
            });
            editorPosition = {
                x: nodeScreenPos.x + 20,
                y: nodeScreenPos.y + 20,
            };
            // Ensure editor stays within viewport bounds
            if (canvasRef?.current) {
                const canvasRect = canvasRef.current.getBoundingClientRect();
                const maxWidth = 400;
                const maxHeight = 300;
                if (editorPosition.x + maxWidth > canvasRect.width) {
                    editorPosition.x = canvasRect.width - maxWidth - 20;
                }
                if (editorPosition.y + maxHeight > canvasRect.height) {
                    editorPosition.y = canvasRect.height - maxHeight - 20;
                }
                editorPosition.x = Math.max(20, editorPosition.x);
                editorPosition.y = Math.max(20, editorPosition.y);
            }
            setEditorState({
                nodeId,
                position: editorPosition,
                isActive: true,
            });
        }
        [getNode, project, getViewport, canvasRef];
    });
    const closeEditor = useCallback(() => {
        setEditorState({
            nodeId: null,
            position: { x: 0, y: 0 },
            isActive: false
        });
    }, []);
    const handleEditorSubmit = useCallback(() => {
        closeEditor();
    }, [closeEditor]);
    // Handle node updates from editor
    const handleNodeUpdate = useCallback((nodeId, updates) => {
        onNodeUpdate(nodeId, updates);
    }, [onNodeUpdate]);
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (activationTimeoutRef.current) {
                clearTimeout(activationTimeoutRef.current);
            }
        };
    }, []);
    // Get active node
    const activeNode = editorState.nodeId ? nodes.find(n => n.id === editorState.nodeId) : null;
    return (_jsxs(_Fragment, { children: [editorState.isActive && activeNode && (_jsx(InlineNodeEditor, { node: activeNode, isActive: editorState.isActive, onUpdate: handleNodeUpdate, onClose: closeEditor, onSubmit: handleEditorSubmit, position: editorState.position })), nodes.map((node) => (_jsx(NodeClickHandler, { node: node, onClick: handleNodeClick, isEditorActive: editorState.isActive && editorState.nodeId === node.id }, node.id)))] }));
};
const NodeClickHandler = ({ node, onClick, isEditorActive }) => {
    const { project, getViewport } = useReactFlow();
    // Get node position in screen coordinates
    const viewport = getViewport();
    const screenPosition = project(node.position);
    if (isEditorActive)
        return null; // Don't render handler when editor is active
    return (_jsx("div", { style: {
            position: 'absolute',
            left: screenPosition.x,
            top: screenPosition.y,
            width: node.width || 200,
            height: node.height || 100,
            pointerEvents: 'auto',
            cursor: 'text',
            zIndex: 10,
        }, onClick: (e) => onClick(e, node.id), onDoubleClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(e, node.id);
        } }));
};
// Hook for integrating inline editor with existing components
export const useInlineEditor = () => {
    const [activeNodeId, setActiveNodeId] = useState(null);
    const activateEditor = useCallback((nodeId) => {
        setActiveNodeId(nodeId);
    }, []);
    const deactivateEditor = useCallback(() => {
        setActiveNodeId(null);
    }, []);
    const isNodeBeingEdited = useCallback((nodeId) => {
        return activeNodeId === nodeId;
    }, [activeNodeId]);
    return {
        activeNodeId,
        activateEditor,
        deactivateEditor,
        isNodeBeingEdited
    };
};
// Context for sharing editor state across components
export const InlineEditorContext = React.createContext(null);
export const InlineEditorProvider = ({ children }) => {
    const editorState = useInlineEditor();
    return (_jsx(InlineEditorContext.Provider, { value: editorState, children: children }));
};
export const useInlineEditorContext = () => {
    const context = React.useContext(InlineEditorContext);
    if (!context) {
        throw new Error('useInlineEditorContext must be used within InlineEditorProvider');
    }
    return context;
};
export default InlineEditorManager;
