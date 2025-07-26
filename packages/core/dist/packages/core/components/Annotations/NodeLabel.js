import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced Node Label Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 *
 * Advanced node labeling system with inline editing, multiple display modes,
 * positioning options, and professional styling.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { NODE_LABEL_STYLES } from '../../types/CollaborationTypes';
export const NodeLabel = ({ config, nodeId, currentNodeLabel = '', onAction, displayMode, isNodeSelected = false, isNodeHovered = false, isNodeFocused = false, canEdit = true, showTooltip = true }) => {
    const [isEditing, setIsEditing] = useState(config.isEditing || false);
    const [editValue, setEditValue] = useState(config.customLabel);
    const inputRef = useRef(null);
    const labelRef = useRef(null);
    // Determine if label should be visible based on display mode
    const shouldShowLabel = useCallback(() => {
        const mode = displayMode || config.displayMode;
        switch (mode) {
            case 'always':
                return true;
            case 'hover':
                return isNodeHovered;
            case 'focus':
                return isNodeFocused;
            case 'selected':
                return isNodeSelected;
            case 'never':
                return false;
            default:
                return true;
        }
    }, [displayMode, config.displayMode, isNodeHovered, isNodeFocused, isNodeSelected]);
    // Get effective label to display
    const getEffectiveLabel = useCallback(() => {
        const customLabel = config.customLabel?.trim();
        return customLabel || currentNodeLabel || nodeId;
    }, [config.customLabel, currentNodeLabel, nodeId]);
    // Handle double-click to start editing
    const handleDoubleClick = useCallback((e) => {
        if (!canEdit)
            return;
        e.stopPropagation();
        e.preventDefault();
        setIsEditing(true);
        setEditValue(config.customLabel);
        onAction({
            type: 'startEdit',
            nodeId,
            labelId: config.id
        });
    }, [canEdit, config.customLabel, config.id, nodeId, onAction]);
    // Handle input changes
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        const maxLength = config.truncateLength || 50;
        if (value.length <= maxLength) {
            setEditValue(value);
        }
    }, [config.truncateLength]);
    // Save label changes
    const saveLabel = useCallback(() => {
        const newLabel = editValue.trim();
        setIsEditing(false);
        onAction({
            type: 'update',
            nodeId,
            labelId: config.id,
            customLabel: newLabel,
            config: {
                customLabel: newLabel,
                isEditing: false
            }
        });
        onAction({
            type: 'stopEdit',
            nodeId,
            labelId: config.id
        });
    }, [editValue, nodeId, config.id, onAction]);
    // Cancel editing
    const cancelEdit = useCallback(() => {
        setIsEditing(false);
        setEditValue(config.customLabel);
        onAction({
            type: 'stopEdit',
            nodeId,
            labelId: config.id
        });
    }, [config.customLabel, config.id, nodeId, onAction]);
    // Handle key events
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                saveLabel();
                break;
            case 'Escape':
                e.preventDefault();
                cancelEdit();
                break;
        }
    }, [saveLabel, cancelEdit]);
    // Handle blur
    const handleBlur = useCallback(() => {
        saveLabel();
    }, [saveLabel]);
    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    // Get label position styles
    const getPositionStyles = useCallback(() => {
        const position = config.position;
        const baseStyles = {
            position: 'absolute',
            zIndex: 2000,
            pointerEvents: 'all'
        };
        switch (position) {
            case 'top':
                return {
                    ...baseStyles,
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '8px'
                };
            case 'bottom':
                return {
                    ...baseStyles,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px'
                };
            case 'left':
                return {
                    ...baseStyles,
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginRight: '8px'
                };
            case 'right':
                return {
                    ...baseStyles,
                    left: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginLeft: '8px'
                };
            case 'center':
                return {
                    ...baseStyles,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                };
            default:
                return {
                    ...baseStyles,
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px'
                };
        }
    }, [config.position]);
    // Get label styles
    const getLabelStyles = useCallback(() => {
        const baseStyle = NODE_LABEL_STYLES[config.style] || NODE_LABEL_STYLES.default;
        return {
            ...baseStyle,
            ...(config.color && { color: config.color }),
            ...(config.backgroundColor && { background: config.backgroundColor }),
            ...(config.fontSize && { fontSize: config.fontSize }),
            ...(config.fontWeight && { fontWeight: config.fontWeight }),
            cursor: canEdit ? 'pointer' : 'default',
            userSelect: 'none',
            maxWidth: '200px',
            wordBreak: 'break-word',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        };
    }, [config, canEdit]);
    // Don't render if not visible
    if (!shouldShowLabel()) {
        return null;
    }
    const effectiveLabel = getEffectiveLabel();
    const positionStyles = getPositionStyles();
    const labelStyles = getLabelStyles();
    return (_jsxs("div", { ref: labelRef, "data-testid": `node-label-${nodeId}`, style: positionStyles, title: showTooltip ? effectiveLabel : undefined, children: [isEditing ? (_jsx("input", { ref: inputRef, type: "text", value: editValue, onChange: handleInputChange, onKeyDown: handleKeyDown, onBlur: handleBlur, style: {
                    ...labelStyles,
                    outline: 'none',
                    border: '2px solid #3b82f6',
                    cursor: 'text',
                    minWidth: '100px',
                    maxWidth: '200px'
                }, placeholder: "Enter label...", maxLength: config.truncateLength || 50 })) : (_jsxs("div", { style: labelStyles, onDoubleClick: handleDoubleClick, onMouseEnter: (e) => {
                    if (canEdit) {
                        e.currentTarget.style.opacity = '0.8';
                    }
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.opacity = '1';
                }, children: [config.showIcon && (_jsx("span", { style: { marginRight: '4px' }, children: "\uD83C\uDFF7\uFE0F" })), effectiveLabel, canEdit && (_jsx("span", { style: {
                            marginLeft: '6px',
                            fontSize: '10px',
                            opacity: 0.6,
                            fontStyle: 'italic'
                        }, children: "\u270F\uFE0F" }))] })), config.customLabel && canEdit && !isEditing && (_jsx("button", { style: {
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.8,
                    transition: 'opacity 0.2s ease'
                }, onClick: (e) => {
                    e.stopPropagation();
                    onAction({
                        type: 'delete',
                        nodeId,
                        labelId: config.id
                    });
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.opacity = '1';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.opacity = '0.8';
                }, title: "Remove custom label", children: "\u00D7" })), _jsx("style", { children: `
        [data-testid^="node-label-"] {
          animation: nodeLabelFadeIn 0.2s ease-out;
        }
        
        @keyframes nodeLabelFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }
      ` })] }));
};
export default NodeLabel;
