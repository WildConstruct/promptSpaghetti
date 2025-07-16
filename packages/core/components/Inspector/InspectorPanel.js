import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect } from "react";
import { PropertiesSection } from "./PropertiesSection";
import { PreviewSection } from "./PreviewSection";
export const InspectorPanel = ({ node, schema, onChange, onClose, initialWidth = 320, minWidth = 280, maxWidth = 600, }) => {
    const [width, setWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const resizeRef = useRef(null);
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);
    const handleMouseMove = useCallback((e) => {
        if (!isResizing)
            return;
        const newWidth = window.innerWidth - e.clientX;
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        setWidth(clampedWidth);
    }, [isResizing, minWidth, maxWidth]);
    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }
        else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);
    if (!node || !schema) {
        return (_jsxs("aside", { style: {
                width: collapsed ? 40 : width,
                minWidth: collapsed ? 40 : minWidth,
                borderLeft: "1px solid #4a5568",
                background: "#1a202c",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: collapsed ? "width 0.2s ease" : "none",
            }, onKeyDown: (e) => {
                e.stopPropagation();
            }, onKeyUp: (e) => {
                e.stopPropagation();
            }, onKeyPress: (e) => {
                e.stopPropagation();
            }, children: [_jsxs("div", { style: {
                        padding: "12px 16px",
                        borderBottom: "1px solid #4a5568",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#2d3748",
                    }, children: [!collapsed && (_jsx("h3", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }, children: "Inspector" })), _jsx("button", { onClick: () => setCollapsed(!collapsed), style: {
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 16,
                                color: "#a0aec0",
                                padding: 4,
                            }, title: collapsed ? "Expand Inspector" : "Collapse Inspector", children: collapsed ? "◀" : "▶" })] }), !collapsed && (_jsx("div", { style: {
                        padding: 16,
                        color: "#a0aec0",
                        fontStyle: "italic",
                        textAlign: "center",
                        marginTop: 40
                    }, children: "Select a node to edit its properties" })), _jsx("div", { ref: resizeRef, onMouseDown: handleMouseDown, style: {
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        cursor: "col-resize",
                        background: "transparent",
                        zIndex: 10,
                    } })] }));
    }
    return (_jsxs("aside", { style: {
            width: collapsed ? 40 : width,
            minWidth: collapsed ? 40 : minWidth,
            borderLeft: "1px solid #4a5568",
            background: "#1a202c",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            transition: collapsed ? "width 0.2s ease" : "none",
        }, onKeyDown: (e) => {
            e.stopPropagation();
        }, onKeyUp: (e) => {
            e.stopPropagation();
        }, onKeyPress: (e) => {
            e.stopPropagation();
        }, children: [_jsxs("div", { style: {
                    padding: "12px 16px",
                    borderBottom: "1px solid #4a5568",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#2d3748",
                }, children: [!collapsed && (_jsxs("h3", { style: { margin: 0, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }, children: [_jsx("span", { style: { color: "#4CAF50" }, children: "\uD83D\uDD0D" }), " ", node.data?.label || node.data?.nodeType || node.type, " Properties"] })), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [!collapsed && onClose && (_jsx("button", { onClick: onClose, style: {
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    color: "#a0aec0",
                                    padding: 4,
                                }, title: "Close Inspector", children: "\u2715" })), _jsx("button", { onClick: () => setCollapsed(!collapsed), style: {
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    color: "#a0aec0",
                                    padding: 4,
                                }, title: collapsed ? "Expand Inspector" : "Collapse Inspector", children: collapsed ? "◀" : "▶" })] })] }), !collapsed && (_jsxs("div", { style: { flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }, children: [_jsx(PropertiesSection, { node: node, schema: schema, onChange: onChange }), _jsx(PreviewSection, { node: node })] })), _jsx("div", { ref: resizeRef, onMouseDown: handleMouseDown, style: {
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    cursor: "col-resize",
                    background: "transparent",
                    zIndex: 10,
                } })] }));
};
