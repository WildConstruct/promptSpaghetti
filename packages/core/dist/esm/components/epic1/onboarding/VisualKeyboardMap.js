import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Visual Keyboard Map Component
 *
 * Displays an interactive visual representation of keyboard shortcuts
 * with highlighting for active shortcuts.
 */
import React, { useState } from 'react';
const Key = ({ label, width = 40, shortcuts = [], active = false, modifier = false, }) => {
    const [hover, setHover] = useState(false);
    return (_jsxs("div", { style: {
            position: 'relative',
            width: `${width}px`,
            height: '40px',
            backgroundColor: active ? '#3b82f6' : modifier ? '#e5e7eb' : 'white',
            border: `2px solid ${active ? '#2563eb' : '#d1d5db'}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: modifier ? 600 : 400,
            color: active ? 'white' : '#374151',
            cursor: shortcuts.length > 0 ? 'pointer' : 'default',
            transition: 'all 0.2s',
            boxShadow: active ? '0 2px 4px rgba(59, 130, 246, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
            transform: hover && shortcuts.length > 0 ? 'translateY(-2px)' : 'none',
        }, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), children: [label, hover && shortcuts.length > 0 && (_jsxs("div", { style: {
                    position: 'absolute',
                    bottom: '48px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1f2937',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }, children: [shortcuts.join(', '), _jsx("div", { style: {
                            position: 'absolute',
                            bottom: '-4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: '4px solid #1f2937',
                        } })] }))] }));
};
export const VisualKeyboardMap = ({ activeKeys = new Set(), highlightedCategory, }) => {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    // Define keyboard layout
    const keyboardRows = [
        // Function row
        [
            { label: 'Esc', shortcuts: ['Cancel edit', 'Clear selection'] },
            { label: 'F1' },
            { label: 'F2' },
            { label: 'F3' },
            { label: 'F4' },
            { label: 'F5' },
            { label: 'F6' },
            { label: 'F7' },
            { label: 'F8' },
            { label: 'F9' },
            { label: 'F10' },
            { label: 'F11', shortcuts: ['Toggle fullscreen'] },
            { label: 'F12' },
        ],
        // Number row
        [
            { label: '`' },
            { label: '1' },
            { label: '2' },
            { label: '3' },
            { label: '4' },
            { label: '5' },
            { label: '6' },
            { label: '7' },
            { label: '8' },
            { label: '9' },
            { label: '0', shortcuts: ['Fit view (with Cmd/Ctrl)'] },
            { label: '-', shortcuts: ['Zoom out (with Cmd/Ctrl)'] },
            { label: '+', shortcuts: ['Zoom in (with Cmd/Ctrl)'] },
            { label: 'Delete', width: 80, shortcuts: ['Delete nodes'] },
        ],
        // QWERTY row
        [
            { label: 'Tab', width: 60, shortcuts: ['Next field'] },
            { label: 'Q' },
            { label: 'W' },
            { label: 'E', shortcuts: ['Export (with Cmd/Ctrl)'] },
            { label: 'R' },
            { label: 'T' },
            { label: 'Y' },
            { label: 'U' },
            { label: 'I' },
            { label: 'O' },
            { label: 'P', shortcuts: ['Preview (with Cmd/Ctrl)'] },
            { label: '[' },
            { label: ']' },
            { label: '\\', width: 60 },
        ],
        // ASDF row
        [
            { label: 'Caps', width: 80 },
            { label: 'A', shortcuts: ['Select all (with Cmd/Ctrl)'] },
            { label: 'S', shortcuts: ['Save (with Cmd/Ctrl)'] },
            { label: 'D', shortcuts: ['Duplicate (with Cmd/Ctrl)'] },
            { label: 'F', shortcuts: ['Search (with Cmd/Ctrl)'] },
            { label: 'G' },
            { label: 'H' },
            { label: 'J' },
            { label: 'K', shortcuts: ['Command palette (with Cmd/Ctrl)'] },
            { label: 'L' },
            { label: ';' },
            { label: "'" },
            { label: 'Enter', width: 80, shortcuts: ['Save edit'] },
        ],
        // ZXCV row
        [
            { label: 'Shift', width: 100, modifier: true, shortcuts: ['Multi-select', 'Box select'] },
            { label: 'Z', shortcuts: ['Undo (with Cmd/Ctrl)'] },
            { label: 'X' },
            { label: 'C' },
            { label: 'V' },
            { label: 'B', shortcuts: ['Toggle sidebar (with Cmd/Ctrl)'] },
            { label: 'N', shortcuts: ['New project (with Cmd/Ctrl)'] },
            { label: 'M' },
            { label: ',' },
            { label: '.' },
            { label: '/', shortcuts: ['Show help (with Shift as ?)'] },
            { label: 'Shift', width: 100, modifier: true },
        ],
        // Bottom row
        [
            { label: isMac ? 'Fn' : 'Ctrl', width: 60, modifier: true },
            { label: isMac ? 'Control' : 'Win', width: 60, modifier: true },
            { label: isMac ? 'Option' : 'Alt', width: 60, modifier: true },
            { label: isMac ? '⌘' : 'Ctrl', width: 60, modifier: true, shortcuts: ['See shortcuts above'] },
            { label: 'Space', width: 240 },
            { label: isMac ? '⌘' : 'Ctrl', width: 60, modifier: true },
            { label: isMac ? 'Option' : 'Alt', width: 60, modifier: true },
            { label: '←' },
            { label: '↓' },
            { label: '→' },
        ],
    ];
    return (_jsxs("div", { style: {
            backgroundColor: '#f3f4f6',
            padding: '20px',
            borderRadius: '12px',
            display: 'inline-block',
        }, children: [_jsx("div", { style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }, children: keyboardRows.map((row, rowIndex) => (_jsx("div", { style: {
                        display: 'flex',
                        gap: '6px',
                        justifyContent: rowIndex === 5 ? 'center' : 'flex-start',
                    }, children: row.map((key, keyIndex) => (_jsx(Key, { label: key.label, width: key.width, shortcuts: key.shortcuts, active: activeKeys.has(key.label), modifier: key.modifier }, `${rowIndex}-${keyIndex}`))) }, rowIndex))) }), _jsxs("div", { style: {
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    textAlign: 'center',
                }, children: [_jsxs("p", { style: { margin: '0 0 8px 0' }, children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " Hover over highlighted keys to see their functions"] }), _jsxs("p", { style: { margin: 0 }, children: ["Press ", _jsx("kbd", { style: {
                                    padding: '2px 6px',
                                    backgroundColor: '#f3f4f6',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                }, children: "?" }), " to see all shortcuts or ", _jsxs("kbd", { style: {
                                    padding: '2px 6px',
                                    backgroundColor: '#f3f4f6',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                }, children: [isMac ? '⌘' : 'Ctrl', " K"] }), " for command palette"] })] })] }));
};
// Compact keyboard view for integration
export const CompactKeyboardView = () => {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const essentialShortcuts = [
        { keys: ['Double Click'], desc: 'Edit inline' },
        { keys: [isMac ? '⌘' : 'Ctrl', 'S'], desc: 'Save' },
        { keys: [isMac ? '⌘' : 'Ctrl', 'Z'], desc: 'Undo' },
        { keys: [isMac ? '⌘' : 'Ctrl', 'D'], desc: 'Duplicate' },
        { keys: [isMac ? '⌘' : 'Ctrl', 'P'], desc: 'Preview' },
        { keys: ['?'], desc: 'Help' },
    ];
    return (_jsx("div", { style: {
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            fontSize: '12px',
        }, children: essentialShortcuts.map((shortcut, index) => (_jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }, children: [_jsx("div", { style: { display: 'flex', gap: '2px' }, children: shortcut.keys.map((key, keyIndex) => (_jsxs(React.Fragment, { children: [keyIndex > 0 && _jsx("span", { style: { color: '#9ca3af' }, children: "+" }), _jsx("kbd", { style: {
                                    padding: '2px 6px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                }, children: key })] }, keyIndex))) }), _jsx("span", { style: { color: '#6b7280' }, children: shortcut.desc })] }, index))) }));
};
