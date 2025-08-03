import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Connection Label Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 4
 *
 * Advanced connection labeling component with inline editing, positioning
 * along connection paths, and professional styling for annotating relationships.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { CONNECTION_LABEL_STYLES } from '../../types/CollaborationTypes';
export const ConnectionLabel = ({ label, onAction, canEdit = true, showTooltip = true, isHighlighted = false, connectionPath }) => {
    const [isEditing, setIsEditing] = useState(label.isEditing || false);
    const [editValue, setEditValue] = useState(label.content);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const labelRef = useRef(null);
    const inputRef = useRef(null);
    // Get label styles
    const getLabelStyles = useCallback(() => {
        const baseStyle = CONNECTION_LABEL_STYLES[label.style] || CONNECTION_LABEL_STYLES.default;
        return {
            ...baseStyle,
            ...(label.color && { color: label.color }),
            ...(label.backgroundColor && { background: label.backgroundColor }),
            ...(label.fontSize && { fontSize: label.fontSize }),
            ...(label.fontWeight && { fontWeight: label.fontWeight }),
            cursor: canEdit ? 'pointer' : 'default',
            userSelect: 'none',
            maxWidth: '200px',
            wordBreak: 'break-word',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            pointerEvents: 'all',
            ...(isHighlighted && {
                transform: 'scale(1.1)',
                boxShadow: `0 4px 12px ${baseStyle.color}40`,
                zIndex: 1000
            })
        };
    }, [label, canEdit, isHighlighted]);
    // Handle double-click to start editing
    const handleDoubleClick = useCallback((e) => {
        if (!canEdit)
            return;
        e.stopPropagation();
        e.preventDefault();
        setIsEditing(true);
        setEditValue(label.content);
        onAction({
            type: 'startEdit',
            labelId: label.id,
            connectionId: label.connectionId
        });
    }, [canEdit, label.content, label.id, label.connectionId, onAction]);
    // Handle input changes
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        const maxLength = 100; // Could be configurable
        if (value.length <= maxLength) {
            setEditValue(value);
        }
    }, []);
    // Save label changes
    const saveLabel = useCallback(() => {
        const newContent = editValue.trim();
        setIsEditing(false);
        onAction({
            type: 'update',
            labelId: label.id,
            connectionId: label.connectionId,
            content: newContent || 'Untitled',
            label: {
                ...label,
                content: newContent || 'Untitled',
                isEditing: false,
                lastModified: new Date().toISOString()
            }
        });
        onAction({
            type: 'stopEdit',
            labelId: label.id,
            connectionId: label.connectionId
        });
    }, [editValue, label, onAction]);
    // Cancel editing
    const cancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditValue(label.content);
        onAction({
            type: 'stopEdit',
            labelId: label.id,
            connectionId: label.connectionId
        });
    }, [label.content, label.id, label.connectionId, onAction]);
    // Handle key events
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            saveLabel();
        }
        else if (e.key === 'Escape') {
            cancelEdit();
        }
    }, [saveLabel, cancelEdit]);
    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    // Calculate position along connection path
    const getPositionAlongPath = useCallback(() => {
        if (!connectionPath) {
            return { x: label.position.x, y: label.position.y };
        }
        // Simple positioning - could be enhanced with path calculations
        const position = label.position.pathOffset || 0.5;
        return {
            x: label.position.x,
            y: label.position.y
        };
    }, [connectionPath, label.position]);
    const position = getPositionAlongPath();
    return (_jsx("div", { ref: labelRef, className: "connection-label", style: {
            position: 'absolute',
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
            zIndex: isHighlighted ? 1000 : 999
        }, children: isEditing ? (_jsx("input", { ref: inputRef, type: "text", value: editValue, onChange: handleInputChange, onKeyDown: handleKeyDown, onBlur: saveLabel, className: "connection-label__input", style: {
                ...getLabelStyles(),
                background: 'white',
                border: '2px solid #3b82f6',
                padding: '4px 8px',
                borderRadius: '4px',
                outline: 'none',
                width: 'auto',
                minWidth: '100px'
            } })) : (_jsx("div", { className: "connection-label__content", style: getLabelStyles(), onDoubleClick: handleDoubleClick, title: showTooltip ? label.content : undefined, children: label.content })) }));
};
