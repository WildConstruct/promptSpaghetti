import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Sticky Note Component
 * Epic 8.7 Task 1: Draggable collaboration notes with rich text editing
 *
 * Features:
 * - Drag and drop positioning
 * - Rich text editing with markdown support
 * - Color coding and categorization
 * - Resize handles
 * - Professional UI matching Cinema 4D quality standards
 */
import { useState, useRef, useEffect, useCallback } from 'react';
const COLOR_THEMES = {
    yellow: {
        background: '#FEF3C7',
        border: '#F59E0B',
        text: '#92400E',
        shadow: 'rgba(245, 158, 11, 0.2)',
        header: '#F59E0B'
    },
    blue: {
        background: '#DBEAFE',
        border: '#3B82F6',
        text: '#1E40AF',
        shadow: 'rgba(59, 130, 246, 0.2)',
        header: '#3B82F6'
    },
    green: {
        background: '#D1FAE5',
        border: '#10B981',
        text: '#047857',
        shadow: 'rgba(16, 185, 129, 0.2)',
        header: '#10B981'
    },
    red: {
        background: '#FEE2E2',
        border: '#EF4444',
        text: '#DC2626',
        shadow: 'rgba(239, 68, 68, 0.2)',
        header: '#EF4444'
    },
    purple: {
        background: '#EDE9FE',
        border: '#8B5CF6',
        text: '#7C3AED',
        shadow: 'rgba(139, 92, 246, 0.2)',
        header: '#8B5CF6'
    },
    orange: {
        background: '#FED7AA',
        border: '#F97316',
        text: '#C2410C',
        shadow: 'rgba(249, 115, 22, 0.2)',
        header: '#F97316'
    },
    pink: {
        background: '#FCE7F3',
        border: '#EC4899',
        text: '#BE185D',
        shadow: 'rgba(236, 72, 153, 0.2)',
        header: '#EC4899'
    },
    gray: {
        background: '#F3F4F6',
        border: '#6B7280',
        text: '#374151',
        shadow: 'rgba(107, 114, 128, 0.2)',
        header: '#6B7280'
    }
};
const CATEGORY_ICONS = {
    general: '📝',
    technical: '⚙️',
    creative: '💡',
    feedback: '💬',
    question: '❓',
    decision: '✅',
    'action-item': '🎯',
    reference: '📚'
};
export const StickyNote = ({ note, selected, editing, ghostMode, onUpdate, onSelect, onStartEdit, onStopEdit, onDelete, onMove, onResize, onBringToFront, className = '' }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [contentHeight, setContentHeight] = useState(note.size.height - 60); // Account for header
    const noteRef = useRef(null);
    const contentRef = useRef(null);
    const theme = COLOR_THEMES[note.appearance.color];
    // Auto-resize content area
    const adjustContentHeight = useCallback(() => {
        if (contentRef.current && editing) {
            contentRef.current.style.height = 'auto';
            const scrollHeight = contentRef.current.scrollHeight;
            const newHeight = Math.max(40, Math.min(300, scrollHeight));
            contentRef.current.style.height = `${newHeight}px`;
            if (newHeight !== contentHeight) {
                setContentHeight(newHeight);
                onResize({
                    width: note.size.width,
                    height: newHeight + 60 // Add header height
                });
            }
        }
    }, [editing, contentHeight, note.size.width, onResize]);
    // Handle drag start
    const handleMouseDown = (e) => {
        if (!note.behavior.draggable || editing || isResizing)
            return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - note.position.x,
            y: e.clientY - note.position.y
        });
        onBringToFront();
        onSelect(e.ctrlKey || e.metaKey);
    };
    // Handle resize start
    const handleResizeStart = (e, handle) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        setDragStart({
            x: e.clientX,
            y: e.clientY
        });
    };
    // Global mouse move handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && dragStart) {
                const newPosition = {
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                };
                onMove(newPosition);
            }
            else if (isResizing && dragStart && resizeHandle) {
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;
                let newWidth = note.size.width;
                let newHeight = note.size.height;
                if (resizeHandle.includes('right')) {
                    newWidth = Math.max(150, note.size.width + deltaX);
                }
                if (resizeHandle.includes('bottom')) {
                    newHeight = Math.max(100, note.size.height + deltaY);
                }
                if (newWidth !== note.size.width || newHeight !== note.size.height) {
                    onResize({ width: newWidth, height: newHeight });
                    setDragStart({ x: e.clientX, y: e.clientY });
                }
            }
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeHandle(null);
            setDragStart(null);
        };
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, resizeHandle, note.position, note.size, onMove, onResize]);
    // Handle double-click to edit
    const handleDoubleClick = (e) => {
        if (note.behavior.editable) {
            e.preventDefault();
            e.stopPropagation();
            onStartEdit();
        }
    };
    // Handle content change
    const handleContentChange = (e) => {
        const newContent = {
            ...note.content,
            text: e.target.value
        };
        onUpdate({ content: newContent });
        adjustContentHeight();
    };
    // Handle key events
    const handleKeyDown = (e) => {
        if (editing) {
            if (e.key === 'Escape') {
                e.preventDefault();
                onStopEdit();
            }
        }
        else {
            if (e.key === 'Delete' && selected) {
                e.preventDefault();
                onDelete();
            }
            else if (e.key === 'Enter' && selected) {
                e.preventDefault();
                onStartEdit();
            }
        }
    };
    // Auto-adjust content height when editing starts
    useEffect(() => {
        if (editing) {
            adjustContentHeight();
            if (contentRef.current) {
                contentRef.current.focus();
                contentRef.current.setSelectionRange(contentRef.current.value.length, contentRef.current.value.length);
            }
        }
    }, [editing, adjustContentHeight]);
    const stickyNoteStyle = {
        position: 'absolute',
        left: note.position.x,
        top: note.position.y,
        width: note.size.width,
        height: note.size.height,
        zIndex: note.appearance.zIndex,
        opacity: ghostMode && !selected ? 0.7 : note.appearance.opacity,
        cursor: isDragging ? 'grabbing' : (note.behavior.draggable ? 'grab' : 'default'),
        backgroundColor: theme.background,
        border: `2px solid ${selected ? theme.border : 'transparent'}`,
        borderRadius: 8,
        boxShadow: selected
            ? `0 4px 12px ${theme.shadow}, 0 0 0 1px ${theme.border}`
            : `0 2px 8px ${theme.shadow}`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transition: isDragging || isResizing ? 'none' : 'opacity 0.2s ease, box-shadow 0.2s ease',
        userSelect: editing ? 'auto' : 'none',
        overflow: 'hidden'
    };
    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: theme.header,
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 600,
        height: 32,
        cursor: note.behavior.draggable ? 'grab' : 'default'
    };
    const contentStyle = {
        padding: '12px',
        height: note.size.height - 32,
        overflow: 'hidden',
        color: theme.text,
        fontSize: 13,
        lineHeight: 1.4
    };
    const textareaStyle = {
        width: '100%',
        height: '100%',
        border: 'none',
        outline: 'none',
        resize: 'none',
        backgroundColor: 'transparent',
        color: theme.text,
        fontSize: 13,
        lineHeight: 1.4,
        fontFamily: 'inherit'
    };
    return (_jsxs("div", { ref: noteRef, className: `sticky-note ${className}`, style: stickyNoteStyle, onMouseDown: handleMouseDown, onDoubleClick: handleDoubleClick, onKeyDown: handleKeyDown, tabIndex: selected ? 0 : -1, children: [_jsxs("div", { style: headerStyle, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [note.appearance.category && (_jsx("span", { style: { fontSize: 14 }, children: CATEGORY_ICONS[note.appearance.category] })), _jsx("span", { children: note.appearance.category || 'Note' })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4 }, children: [note.collaboration.locked && (_jsx("span", { style: { fontSize: 12, opacity: 0.8 }, children: "\uD83D\uDD12" })), note.collaboration.comments.length > 0 && (_jsxs("span", { style: { fontSize: 12, opacity: 0.8 }, children: ["\uD83D\uDCAC", note.collaboration.comments.length] })), _jsx("button", { onClick: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete();
                                }, style: {
                                    background: 'none',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    fontSize: 14,
                                    padding: 2
                                }, onMouseEnter: (e) => e.currentTarget.style.opacity = '1', onMouseLeave: (e) => e.currentTarget.style.opacity = '0.7', children: "\u00D7" })] })] }), _jsx("div", { style: contentStyle, children: editing ? (_jsx("textarea", { ref: contentRef, value: note.content.text, onChange: handleContentChange, onBlur: onStopEdit, placeholder: "Enter your note...", style: textareaStyle })) : (_jsx("div", { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' }, children: note.content.text || 'Click to edit...' })) }), selected && note.behavior.resizable && (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 12,
                            height: 12,
                            cursor: 'nw-resize',
                            backgroundColor: theme.border,
                            clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)'
                        }, onMouseDown: (e) => handleResizeStart(e, 'bottom-right') }), _jsx("div", { style: {
                            position: 'absolute',
                            top: '50%',
                            right: -2,
                            width: 4,
                            height: 20,
                            cursor: 'ew-resize',
                            backgroundColor: theme.border,
                            borderRadius: 2,
                            transform: 'translateY(-50%)'
                        }, onMouseDown: (e) => handleResizeStart(e, 'right') }), _jsx("div", { style: {
                            position: 'absolute',
                            bottom: -2,
                            left: '50%',
                            width: 20,
                            height: 4,
                            cursor: 'ns-resize',
                            backgroundColor: theme.border,
                            borderRadius: 2,
                            transform: 'translateX(-50%)'
                        }, onMouseDown: (e) => handleResizeStart(e, 'bottom') })] }))] }));
};
export default StickyNote;
