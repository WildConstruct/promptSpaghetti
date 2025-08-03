import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { SaveIndicator } from './SaveIndicator';
import { useEditTransitions } from '../hooks/useEditTransitions';
import './BaseEditableNode.css';
import './VisualFeedbackEnhancements.css';
import '../animations/EditTransitions.css';
/**
 * Output node for Epic 1 - marks the final output
 * Only has input handle (target) since outputs can't have outputs
 */
export const OutputNode = memo((props) => {
    const { data, selected } = props;
    const [isEditing, setIsEditing] = React.useState(data.isEditing || false);
    const [editBuffer, setEditBuffer] = React.useState(data.editBuffer || data.value || '');
    const [saveTrigger, setSaveTrigger] = React.useState(0);
    const nodeRef = React.useRef(null);
    // Animation state management
    const { transitionState, triggerValueConfirmed, triggerValueCancelled, animationClasses } = useEditTransitions({
        isEditing,
        isFocused: selected,
        hasError: false
    });
    // Update edit buffer when value changes externally
    React.useEffect(() => {
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
    React.useEffect(() => {
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
            e.stopPropagation();
        }
    };
    // Context menu handler
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        data.onContextMenu?.(e);
    };
    return (_jsxs("div", { ref: nodeRef, className: `epic1-editable-node output ${isEditing ? 'editing' : ''} ${selected ? 'selected' : ''} ${animationClasses}`, onClick: !isEditing ? handleNodeClick : undefined, onContextMenu: handleContextMenu, onKeyDown: handleKeyDown, style: {
            minWidth: '120px',
            minHeight: '60px',
        }, children: [_jsx(Handle, { type: "target", position: Position.Left, className: "epic1-handle target" }), _jsx("div", { className: "epic1-node-content", children: isEditing ? (_jsxs("div", { className: "epic1-output-editor", children: [_jsx("div", { className: "epic1-node-type-label", children: "Output" }), _jsx("input", { type: "text", className: "epic1-inline-input", value: editBuffer, onChange: (e) => updateBuffer(e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    confirmEdit();
                                }
                                else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelEdit();
                                }
                                e.stopPropagation();
                            }, onClick: (e) => e.stopPropagation(), placeholder: "Label (optional)", autoFocus: true })] })) : (_jsxs("div", { className: "epic1-output-display", children: [_jsx("div", { className: "epic1-node-type-label", children: "Output" }), _jsx("div", { className: "epic1-output-label", children: data.value || _jsx("span", { className: "epic1-output-icon", children: "\u2192" }) })] })) }), isEditing && _jsx("div", { className: "epic1-edit-indicator" }), selected && !isEditing && _jsx("div", { className: "epic1-selected-indicator" }), _jsx(SaveIndicator, { trigger: saveTrigger })] }));
});
OutputNode.displayName = 'OutputNode';
