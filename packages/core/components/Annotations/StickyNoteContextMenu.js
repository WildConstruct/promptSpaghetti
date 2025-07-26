import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Sticky Note Context Menu Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 *
 * Context menu for sticky note operations like edit, delete,
 * change color, and duplicate.
 */
import { useEffect, useRef } from 'react';
import { STICKY_NOTE_COLORS } from '../../types/CollaborationTypes';
export const StickyNoteContextMenu = ({ x, y, noteId, canEdit, canDelete, onEdit, onDelete, onChangeColor, onDuplicate, onClose }) => {
    const menuRef = useRef(null);
    // Position menu and handle screen bounds
    useEffect(() => {
        if (menuRef.current) {
            const menu = menuRef.current;
            const rect = menu.getBoundingClientRect();
            // Adjust position if menu would go off-screen
            let adjustedX = x;
            let adjustedY = y;
            if (x + rect.width > window.innerWidth) {
                adjustedX = window.innerWidth - rect.width - 10;
            }
            if (y + rect.height > window.innerHeight) {
                adjustedY = window.innerHeight - rect.height - 10;
            }
            menu.style.left = `${Math.max(10, adjustedX)}px`;
            menu.style.top = `${Math.max(10, adjustedY)}px`;
        }
    }, [x, y]);
    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);
    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    const MenuItem = ({ onClick, disabled = false, children, icon, shortcut }) => (_jsxs("div", { onClick: disabled ? undefined : onClick, style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            fontSize: 13,
            color: disabled ? '#9ca3af' : '#374151',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: 'transparent',
            border: 'none',
            borderRadius: 4,
            transition: 'background-color 0.15s ease',
            opacity: disabled ? 0.5 : 1
        }, onMouseEnter: (e) => {
            if (!disabled) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
        }, onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [icon && _jsx("span", { style: { fontSize: 14 }, children: icon }), children] }), shortcut && (_jsx("span", { style: {
                    fontSize: 11,
                    color: '#6b7280',
                    fontFamily: 'Monaco, monospace'
                }, children: shortcut }))] }));
    return (_jsxs("div", { ref: menuRef, style: {
            position: 'fixed',
            zIndex: 10000,
            minWidth: 180,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '4px 0',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }, children: [_jsx(MenuItem, { onClick: () => onEdit?.(), disabled: !canEdit, icon: "\u270F\uFE0F", shortcut: "Double-click", children: "Edit Note" }), _jsx(MenuItem, { onClick: () => onDuplicate?.(), icon: "\uD83D\uDCCB", shortcut: "Ctrl+D", children: "Duplicate" }), _jsx("div", { style: {
                    height: 1,
                    background: '#e5e7eb',
                    margin: '4px 0'
                } }), _jsxs("div", { style: { padding: '8px 12px' }, children: [_jsx("div", { style: {
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#6b7280',
                            marginBottom: 6,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }, children: "Change Color" }), _jsx("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8
                        }, children: Object.entries(STICKY_NOTE_COLORS).map(([color, info]) => (_jsxs("button", { onClick: () => onChangeColor?.(color), style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 8px',
                                background: info.background,
                                border: `1px solid ${info.border}`,
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 10,
                                color: info.text,
                                fontWeight: 500,
                                transition: 'all 0.15s ease',
                                textAlign: 'left'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = `0 2px 8px ${info.shadow}`;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }, title: info.description, children: [_jsx("div", { style: {
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: info.border
                                    } }), info.category] }, color))) })] }), _jsx("div", { style: {
                    height: 1,
                    background: '#e5e7eb',
                    margin: '4px 0'
                } }), _jsx(MenuItem, { onClick: () => onDelete?.(), disabled: !canDelete, icon: "\uD83D\uDDD1\uFE0F", shortcut: "Delete", children: _jsx("span", { style: { color: canDelete ? '#dc2626' : '#9ca3af' }, children: "Delete Note" }) })] }));
};
