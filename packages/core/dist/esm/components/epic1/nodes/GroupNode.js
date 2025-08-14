import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * GroupNode component for collapsed group visualization
 * Story 1.27: Node Grouping Hierarchy
 */
import { useState, useCallback, memo } from 'react';
import { Handle, Position } from 'reactflow';
import './GroupNode.css';
/**
 * GroupNode component with performance optimization
 */
const GroupNode = memo(({ data, selected, id }) => {
    const { group, nodeCount, onToggle, onEdit, performanceMetrics } = data;
    const [isEditing, setIsEditing] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const handleToggle = useCallback(async () => {
        if (!onToggle)
            return;
        setIsCalculating(true);
        onToggle(group.id);
        setIsCalculating(false);
    }, [group.id, onToggle]);
    const handleNameEdit = useCallback((e) => {
        if (!onEdit)
            return;
        const newName = e.target.value.trim();
        if (newName && newName !== group.name) {
            onEdit(group.id, { name: newName });
        }
        setIsEditing(false);
    }, [group.id, group.name, onEdit]);
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
        else if (e.key === 'Escape') {
            e.currentTarget.value = group.name;
            setIsEditing(false);
        }
    }, [group.name]);
    // Determine visual style based on state
    const getGroupStyle = () => {
        const baseStyle = {
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: group.metadata?.color || '#f0f0f0',
            border: `2px ${selected ? 'solid' : 'dashed'} ${selected ? '#1a73e8' : '#ccc'}`,
            minWidth: '200px',
            minHeight: '60px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        };
        if (selected) {
            baseStyle.boxShadow = '0 4px 12px rgba(26, 115, 232, 0.3)';
        }
        return baseStyle;
    };
    return (_jsxs("div", { className: "group-node", style: getGroupStyle(), onContextMenu: e => {
            e.preventDefault();
            setShowMenu(!showMenu);
        }, children: [_jsx(Handle, { type: "target", position: Position.Top, style: { background: '#555' } }), _jsx(Handle, { type: "source", position: Position.Bottom, style: { background: '#555' } }), isCalculating && (_jsx("div", { style: {
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#ffaa00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    animation: 'spin 1s linear infinite'
                }, children: "\u27F3" })), nodeCount > 50 && (_jsx("div", { style: {
                    position: 'absolute',
                    top: '-8px',
                    left: '-8px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                }, title: "Optimized with workers", children: "\u26A1" })), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    paddingBottom: '4px'
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("span", { style: { fontSize: '16px' }, children: group.collapsed ? '📁' : '📂' }), isEditing ? (_jsx("input", { defaultValue: group.name, onBlur: handleNameEdit, onKeyDown: handleKeyDown, autoFocus: true, style: {
                                    background: 'white',
                                    border: '1px solid #1a73e8',
                                    borderRadius: '4px',
                                    padding: '2px 4px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    outline: 'none'
                                }, onClick: e => e.stopPropagation() })) : (_jsx("div", { onDoubleClick: () => setIsEditing(true), style: {
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'text'
                                }, children: group.name }))] }), _jsx("button", { onClick: handleToggle, style: {
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            transition: 'background 0.2s'
                        }, onMouseEnter: e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)'), onMouseLeave: e => (e.currentTarget.style.background = 'none'), children: group.collapsed ? '▶' : '▼' })] }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#666'
                }, children: [_jsxs("span", { children: [nodeCount, " nodes"] }), group.parentId && (_jsx("span", { style: {
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px'
                        }, children: "nested" })), performanceMetrics?.lastOperationTime && (_jsxs("span", { style: {
                            fontSize: '10px',
                            color: performanceMetrics.lastOperationTime > 50
                                ? '#ff6b6b'
                                : '#51cf66'
                        }, children: [performanceMetrics.lastOperationTime.toFixed(0), "ms"] }))] }), showMenu && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '150px'
                }, onMouseLeave: () => setShowMenu(false), children: [_jsx("button", { onClick: () => {
                            onEdit?.(group.id, { collapsed: !group.collapsed });
                            setShowMenu(false);
                        }, style: {
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }, onMouseEnter: e => (e.currentTarget.style.background = '#f0f0f0'), onMouseLeave: e => (e.currentTarget.style.background = 'none'), children: group.collapsed ? 'Expand' : 'Collapse' }), _jsx("button", { onClick: () => setIsEditing(true), style: {
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }, onMouseEnter: e => (e.currentTarget.style.background = '#f0f0f0'), onMouseLeave: e => (e.currentTarget.style.background = 'none'), children: "Rename" }), _jsx("div", { style: { borderTop: '1px solid #eee', margin: '4px 0' } }), _jsx("button", { onClick: () => {
                            if (window.confirm('Delete group and ungroup nodes?')) {
                                data.onDelete?.(group.id, false);
                            }
                            setShowMenu(false);
                        }, style: {
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#ff6b6b'
                        }, onMouseEnter: e => (e.currentTarget.style.background = '#fff5f5'), onMouseLeave: e => (e.currentTarget.style.background = 'none'), children: "Ungroup" }), _jsx("button", { onClick: () => {
                            if (window.confirm('Delete group and all its nodes?')) {
                                data.onDelete?.(group.id, true);
                            }
                            setShowMenu(false);
                        }, style: {
                            display: 'block',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#ff6b6b'
                        }, onMouseEnter: e => (e.currentTarget.style.background = '#fff5f5'), onMouseLeave: e => (e.currentTarget.style.background = 'none'), children: "Delete with contents" })] })), _jsx("style", { jsx: true, children: `
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        ` })] }));
});
GroupNode.displayName = 'GroupNode';
export default GroupNode;
