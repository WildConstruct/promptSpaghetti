import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Context Menu for Node Operations
 * Provides right-click menu for node actions including Save as Preset
 */
import { useCallback, useEffect, useRef } from 'react';
import './NodeContextMenu.css';
export const NodeContextMenu = ({ nodeId, nodeType, position, onClose, onSaveAsPreset, onDuplicate, onDelete }) => {
    const menuRef = useRef(null);
    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (position) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [position, onClose]);
    const handleAction = useCallback((action) => {
        action();
        onClose();
    }, [onClose]);
    if (!position)
        return null;
    // Adjust position to ensure menu stays within viewport
    const menuStyle = {
        position: 'fixed',
        top: Math.min(position.y, window.innerHeight - 200),
        left: Math.min(position.x, window.innerWidth - 200),
        zIndex: 1000
    };
    return (_jsxs("div", { ref: menuRef, className: "node-context-menu", style: menuStyle, children: [_jsx("div", { className: "context-menu-header", children: _jsx("span", { className: "node-type-badge", children: nodeType }) }), _jsxs("div", { className: "context-menu-items", children: [_jsxs("button", { className: "context-menu-item", onClick: () => handleAction(onSaveAsPreset), children: [_jsx("span", { className: "icon", children: "\uD83D\uDCBE" }), "Save as Preset"] }), onDuplicate && (_jsxs("button", { className: "context-menu-item", onClick: () => handleAction(onDuplicate), children: [_jsx("span", { className: "icon", children: "\uD83D\uDCCB" }), "Duplicate"] })), onDelete && (_jsxs(_Fragment, { children: [_jsx("div", { className: "context-menu-separator" }), _jsxs("button", { className: "context-menu-item danger", onClick: () => handleAction(onDelete), children: [_jsx("span", { className: "icon", children: "\uD83D\uDDD1\uFE0F" }), "Delete"] })] }))] })] }));
};
