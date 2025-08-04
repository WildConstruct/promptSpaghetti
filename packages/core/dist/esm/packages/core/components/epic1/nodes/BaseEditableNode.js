import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { SaveIndicator } from './SaveIndicator';
import { useEditTransitions } from '../hooks/useEditTransitions';
import './BaseEditableNode.css';
import './VisualFeedbackEnhancements.css';
import '../animations/EditTransitions.css';
/**
 * Base component for Epic 1 inline-editable React Flow nodes.
 * Provides edit state management and visual feedback.
 */
export const BaseEditableNode = memo(({ data, selected, children, className = '', minWidth = 200, minHeight = 80, style = {}, }) => {
    const [isEditing, setIsEditing] = useState(data.isEditing || false);
    const [editBuffer, setEditBuffer] = useState(data.editBuffer || data.value || '');
    const [saveTrigger, setSaveTrigger] = useState(0);
    const nodeRef = useRef(null);
    // Animation state management
    const { transitionState, triggerValueConfirmed, triggerValueCancelled, animationClasses } = useEditTransitions({
        isEditing,
        isFocused: selected,
        hasError: false
    });
    // Update edit buffer when value changes externally
    useEffect(() => {
        if (!isEditing) {
            setEditBuffer(data.value || '');
        }
    }, [data.value, isEditing]);
    // Start editing mode
    const startEdit = () => {
        if (!isEditing) {
            setIsEditing(true);
            setEditBuffer(data.value || '');
            data.onEditStart?.();
        }
    };
    // Update temporary edit buffer
    const updateBuffer = (value) => {
        setEditBuffer(value);
    };
    // Confirm edits and exit edit mode
    const confirmEdit = () => {
        if (isEditing) {
            data.onEdit?.(editBuffer);
            setIsEditing(false);
            data.onEditEnd?.();
            // Trigger save animation
            setSaveTrigger(prev => prev + 1);
            triggerValueConfirmed();
        }
    };
    // Cancel edits and restore original value
    const cancelEdit = () => {
        if (isEditing) {
            setEditBuffer(data.value || '');
            setIsEditing(false);
            data.onEditEnd?.();
            triggerValueCancelled();
        }
    };
    // Handle click outside to confirm edits
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isEditing && nodeRef.current && !nodeRef.current.contains(event.target)) {
                confirmEdit();
            }
        };
        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isEditing, editBuffer]);
    // Handle keyboard shortcuts
    const handleKeyDown = (e) => {
        if (isEditing) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                confirmEdit();
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        }
    };
    // Node click handler
    const handleNodeClick = (e) => {
        if (!isEditing) {
            e.stopPropagation();
            startEdit();
        }
        else {
            // When in editing mode, stop propagation to allow child elements to handle clicks
            e.stopPropagation();
        }
    };
    // Context menu handler
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        data.onContextMenu?.(e);
    };
    return (_jsxs("div", { ref: nodeRef, className: `epic1-editable-node ${className} ${isEditing ? 'editing' : ''} ${selected ? 'selected' : ''} ${animationClasses}`, onClick: !isEditing ? handleNodeClick : undefined, onContextMenu: handleContextMenu, onKeyDown: handleKeyDown, style: {
            minWidth: `${minWidth}px`,
            minHeight: `${minHeight}px`,
            ...style,
        }, children: [_jsx(Handle, { type: "target", position: Position.Left, className: "epic1-handle target" }), _jsx("div", { className: "epic1-node-content", children: children({
                    isEditing,
                    value: data.value,
                    editBuffer,
                    startEdit,
                    updateBuffer,
                    confirmEdit,
                    cancelEdit,
                }) }), _jsx(Handle, { type: "source", position: Position.Right, className: "epic1-handle source" }), isEditing && _jsx("div", { className: "epic1-edit-indicator" }), selected && !isEditing && _jsx("div", { className: "epic1-selected-indicator" }), _jsx(SaveIndicator, { trigger: saveTrigger })] }));
});
BaseEditableNode.displayName = 'BaseEditableNode';
