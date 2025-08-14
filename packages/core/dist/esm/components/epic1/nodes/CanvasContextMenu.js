import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import './NodeContextMenu.css';
/**
 * Context menu for canvas right-click
 */
export const CanvasContextMenu = ({ position, onAddNote, onAddBoundingBox, onLayoutCleanup, onClose }) => {
    const handleAddNote = () => {
        // Get the graph position from the click position
        const graphPosition = {
            x: position.x - 100, // Offset to center the note
            y: position.y - 75
        };
        onAddNote(graphPosition);
        onClose();
    };
    const handleAddBoundingBox = () => {
        // Get the graph position from the click position
        const graphPosition = {
            x: position.x - 200, // Offset to center the box
            y: position.y - 150
        };
        if (onAddBoundingBox) {
            onAddBoundingBox(graphPosition);
        }
        onClose();
    };
    return (_jsx("div", { className: "node-context-menu", style: {
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 10000
        }, onMouseLeave: onClose, children: _jsxs("div", { className: "context-menu-items", children: [_jsxs("button", { className: "context-menu-item", onClick: handleAddNote, children: [_jsx("span", { className: "icon", children: "\uD83D\uDCDD" }), "Add Post-it Note"] }), onAddBoundingBox && (_jsxs("button", { className: "context-menu-item", onClick: handleAddBoundingBox, children: [_jsx("span", { className: "icon", children: "\uD83D\uDCE6" }), "Add Region Box"] })), onLayoutCleanup && (_jsxs(_Fragment, { children: [_jsx("div", { className: "context-menu-separator" }), _jsxs("button", { className: "context-menu-item", onClick: () => { onLayoutCleanup(); onClose(); }, children: [_jsx("span", { className: "icon", children: "\uD83E\uDDF9" }), "Clean Up Layout", _jsx("span", { className: "context-menu-shortcut", children: "\u2318\u21E7L" })] })] })), _jsx("div", { className: "context-menu-separator" }), _jsxs("button", { className: "context-menu-item", onClick: onClose, children: [_jsx("span", { className: "icon", children: "\u2715" }), "Cancel"] })] }) }));
};
