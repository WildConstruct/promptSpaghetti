import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import ReactMarkdown from 'react-markdown';
import './PostItNote.css';
const colorMap = {
    yellow: '#fff740',
    blue: '#40d9ff',
    green: '#40ff90',
    pink: '#ff40a0',
    orange: '#ff9940',
    purple: '#a040ff'
};
/**
 * Post-it Note component for annotations
 * Story 1.25: Post-it Notes/Comments
 */
export const PostItNote = ({ data, selected, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(data.text || '');
    const [isResizing, setIsResizing] = useState(false);
    const [size, setSize] = useState({
        width: data.width || 200,
        height: data.height || 150
    });
    const [isCollapsed, setIsCollapsed] = useState(data.collapsed || false);
    const sizeRef = useRef(size);
    const nodeRef = useRef(null);
    const textareaRef = useRef(null);
    const { setNodes, getNode, getNodes } = useReactFlow();
    useEffect(() => {
        sizeRef.current = size;
    }, [size]);
    // Get attached node position for visual connection
    const attachedNode = data.attachedTo ? getNode(data.attachedTo) : null;
    // Handle drag end to check for nearby nodes to attach to
    const handleDragEnd = useCallback(() => {
        const allNodes = getNodes();
        const thisNode = allNodes.find(n => n.id === id);
        if (!thisNode)
            return;
        // Find nearest node within attachment distance (100px)
        let nearestNode = null;
        let nearestDistance = Infinity;
        allNodes.forEach((node) => {
            if (node.id === id || node.type === 'postItNote')
                return; // Don't attach to self or other notes
            const distance = Math.sqrt(Math.pow(node.position.x - thisNode.position.x, 2) +
                Math.pow(node.position.y - thisNode.position.y, 2));
            if (distance < 100 && distance < nearestDistance) {
                nearestDistance = distance;
                nearestNode = node;
            }
        });
        // Update attachment if near a node
        if (nearestNode) {
            setNodes((nodes) => nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            attachedTo: nearestNode.id,
                            attachmentOffset: {
                                x: thisNode.position.x - nearestNode.position.x,
                                y: thisNode.position.y - nearestNode.position.y
                            }
                        }
                    };
                }
                return node;
            }));
        }
        else if (data.attachedTo) {
            // Clear attachment if moved away
            setNodes((nodes) => nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            attachedTo: undefined,
                            attachmentOffset: undefined
                        }
                    };
                }
                return node;
            }));
        }
    }, [id, data.attachedTo, getNodes, setNodes]);
    // Handle double-click to edit
    const handleDoubleClick = useCallback((e) => {
        e.stopPropagation();
        setIsEditing(true);
    }, []);
    // Save changes
    const handleSave = useCallback(() => {
        setIsEditing(false);
        // Update node data through React Flow
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        text: text
                    }
                };
            }
            return node;
        }));
    }, [id, text, setNodes]);
    // Cancel editing
    const handleCancel = useCallback(() => {
        setText(data.text || '');
        setIsEditing(false);
    }, [data.text]);
    // Toggle collapse state
    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed(!isCollapsed);
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        collapsed: !isCollapsed
                    }
                };
            }
            return node;
        }));
    }, [id, isCollapsed, setNodes]);
    // Handle delete
    const handleDelete = useCallback(() => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }, [id, setNodes]);
    // Handle resize
    const handleResizeStart = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;
        const handleMouseMove = (ev) => {
            ev.preventDefault();
            const newWidth = Math.max(150, startWidth + ev.clientX - startX);
            const newHeight = Math.max(100, startHeight + ev.clientY - startY);
            setSize({ width: newWidth, height: newHeight });
        };
        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // Persist final size to node data
            const finalSize = sizeRef.current;
            setNodes((nodes) => nodes.map((node) => node.id === id
                ? {
                    ...node,
                    data: {
                        ...node.data,
                        width: finalSize.width,
                        height: finalSize.height,
                    },
                }
                : node));
        };
        document.addEventListener('mousemove', handleMouseMove, { passive: false });
        document.addEventListener('mouseup', handleMouseUp);
    }, [id, setNodes, size]);
    // Focus textarea when entering edit mode
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);
    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && e.metaKey) {
            handleSave();
        }
        else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);
    const backgroundColor = colorMap[data.color || 'yellow'];
    return (_jsxs("div", { ref: nodeRef, className: `post-it-note ${selected ? 'selected' : ''} ${isCollapsed ? 'collapsed' : ''}`, style: {
            backgroundColor,
            width: isCollapsed ? 200 : size.width,
            height: isCollapsed ? 40 : size.height,
            boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
            cursor: isEditing ? 'text' : 'move'
        }, onDoubleClick: handleDoubleClick, onMouseUp: () => {
            if (!isResizing) {
                handleDragEnd();
            }
        }, "data-attached": !!data.attachedTo, "data-color": data.color || 'yellow', children: [_jsx("button", { className: "post-it-delete", onClick: (e) => {
                    e.stopPropagation();
                    handleDelete();
                }, title: "Delete note", children: "\u00D7" }), _jsx("button", { className: "post-it-collapse", onClick: (e) => {
                    e.stopPropagation();
                    handleToggleCollapse();
                }, title: isCollapsed ? "Expand" : "Collapse", children: isCollapsed ? '▶' : '▼' }), !isCollapsed && (_jsx("div", { className: "post-it-content", children: isEditing ? (_jsx("textarea", { ref: textareaRef, value: text, onChange: (e) => setText(e.target.value), onBlur: handleSave, onKeyDown: handleKeyDown, className: "post-it-editor", placeholder: "Type your note here... (Markdown supported)", style: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'transparent'
                    } })) : (_jsx("div", { className: "post-it-markdown", children: text ? (_jsx(ReactMarkdown, { children: text })) : (_jsx("div", { className: "post-it-placeholder", children: "Double-click to add note..." })) })) })), !isCollapsed && !isEditing && (_jsx("div", { className: "post-it-resize nodrag nopan nowheel", onMouseDown: handleResizeStart, onPointerDown: handleResizeStart, onClick: (e) => e.stopPropagation(), onDoubleClick: (e) => e.stopPropagation(), style: {
                    cursor: isResizing ? 'nwse-resize' : 'nwse-resize'
                } })), data.attachedTo && (_jsx(Handle, { type: "target", position: Position.Left, id: "attach", className: "post-it-handle", style: {
                    background: 'transparent',
                    border: 'none',
                    visibility: 'hidden' // Hide the handle visually
                } }))] }));
};
PostItNote.displayName = 'PostItNote';
