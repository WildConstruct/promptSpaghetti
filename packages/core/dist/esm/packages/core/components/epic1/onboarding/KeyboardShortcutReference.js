import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 1 - Task 32: Keyboard Shortcut Reference
 *
 * A comprehensive keyboard shortcut help overlay that shows all
 * available shortcuts organized by category with search functionality.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useTutorial } from './TutorialContext';
// Define all keyboard shortcuts
const shortcutCategories = [
    {
        id: 'editing',
        name: 'Editing',
        icon: '✏️',
        shortcuts: [
            {
                id: 'inline-edit',
                keys: ['Double Click'],
                description: 'Edit node text inline',
                category: 'editing',
                available: true,
            },
            {
                id: 'save-edit',
                keys: ['Enter'],
                description: 'Save current edit',
                category: 'editing',
                available: true,
            },
            {
                id: 'cancel-edit',
                keys: ['Escape'],
                description: 'Cancel current edit',
                category: 'editing',
                available: true,
            },
            {
                id: 'next-field',
                keys: ['Tab'],
                description: 'Move to next field',
                category: 'editing',
                available: true,
            },
            {
                id: 'prev-field',
                keys: ['Shift', 'Tab'],
                description: 'Move to previous field',
                category: 'editing',
                available: true,
            },
        ],
    },
    {
        id: 'navigation',
        name: 'Navigation',
        icon: '🧭',
        shortcuts: [
            {
                id: 'pan',
                keys: ['Click + Drag'],
                description: 'Pan around canvas',
                category: 'navigation',
                available: true,
            },
            {
                id: 'zoom-in',
                keys: ['Ctrl/Cmd', '+'],
                description: 'Zoom in',
                category: 'navigation',
                available: true,
            },
            {
                id: 'zoom-out',
                keys: ['Ctrl/Cmd', '-'],
                description: 'Zoom out',
                category: 'navigation',
                available: true,
            },
            {
                id: 'fit-view',
                keys: ['Ctrl/Cmd', '0'],
                description: 'Fit all nodes in view',
                category: 'navigation',
                available: true,
            },
            {
                id: 'focus-search',
                keys: ['Ctrl/Cmd', 'F'],
                description: 'Search nodes',
                category: 'navigation',
                available: true,
            },
        ],
    },
    {
        id: 'selection',
        name: 'Selection',
        icon: '🎯',
        shortcuts: [
            {
                id: 'select-all',
                keys: ['Ctrl/Cmd', 'A'],
                description: 'Select all nodes',
                category: 'selection',
                available: true,
            },
            {
                id: 'multi-select',
                keys: ['Ctrl/Cmd', 'Click'],
                description: 'Add to selection',
                category: 'selection',
                available: true,
            },
            {
                id: 'box-select',
                keys: ['Shift', 'Drag'],
                description: 'Box selection',
                category: 'selection',
                available: true,
            },
            {
                id: 'deselect',
                keys: ['Escape'],
                description: 'Clear selection',
                category: 'selection',
                available: true,
            },
        ],
    },
    {
        id: 'creation',
        name: 'Creation',
        icon: '✨',
        shortcuts: [
            {
                id: 'duplicate',
                keys: ['Ctrl/Cmd', 'D'],
                description: 'Duplicate selected nodes',
                category: 'creation',
                available: true,
            },
            {
                id: 'delete',
                keys: ['Delete', 'Backspace'],
                description: 'Delete selected nodes',
                category: 'creation',
                available: true,
            },
            {
                id: 'undo',
                keys: ['Ctrl/Cmd', 'Z'],
                description: 'Undo last action',
                category: 'creation',
                available: true,
            },
            {
                id: 'redo',
                keys: ['Ctrl/Cmd', 'Shift', 'Z'],
                description: 'Redo last action',
                category: 'creation',
                available: true,
            },
        ],
    },
    {
        id: 'preview',
        name: 'Preview & Export',
        icon: '👁️',
        shortcuts: [
            {
                id: 'preview',
                keys: ['Ctrl/Cmd', 'P'],
                description: 'Generate preview',
                category: 'preview',
                available: true,
            },
            {
                id: 'export',
                keys: ['Ctrl/Cmd', 'E'],
                description: 'Export graph',
                category: 'preview',
                available: true,
            },
            {
                id: 'save',
                keys: ['Ctrl/Cmd', 'S'],
                description: 'Save project',
                category: 'preview',
                available: true,
            },
            {
                id: 'new',
                keys: ['Ctrl/Cmd', 'N'],
                description: 'New project',
                category: 'preview',
                available: true,
            },
        ],
    },
    {
        id: 'help',
        name: 'Help & UI',
        icon: '❓',
        shortcuts: [
            {
                id: 'help',
                keys: ['?'],
                description: 'Show this help',
                category: 'help',
                available: true,
            },
            {
                id: 'command-palette',
                keys: ['Ctrl/Cmd', 'K'],
                description: 'Open command palette',
                category: 'help',
                available: true,
            },
            {
                id: 'toggle-sidebar',
                keys: ['Ctrl/Cmd', 'B'],
                description: 'Toggle sidebar',
                category: 'help',
                available: true,
            },
            {
                id: 'fullscreen',
                keys: ['F11'],
                description: 'Toggle fullscreen',
                category: 'help',
                available: true,
            },
        ],
    },
];
export const KeyboardShortcutReference = ({ isOpen, onClose, }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { state, updatePreferences } = useTutorial();
    // Filter shortcuts based on search and category
    const filteredCategories = useMemo(() => {
        return shortcutCategories.map(category => ({
            ...category,
            shortcuts: category.shortcuts.filter(shortcut => {
                const matchesSearch = searchQuery === '' ||
                    shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesCategory = !selectedCategory || category.id === selectedCategory;
                return matchesSearch && matchesCategory;
            }),
        })).filter(category => category.shortcuts.length > 0);
    }, [searchQuery, selectedCategory]);
    // Keyboard handler for closing overlay
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && (e.key === 'Escape' || (e.key === '?' && !e.shiftKey))) {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    // Track help viewed
    useEffect(() => {
        if (isOpen && state) {
            updatePreferences({
                ...state.preferences,
                keyboardShortcutsOverlay: true
            });
        }
    }, [isOpen, state, updatePreferences]);
    if (!isOpen)
        return null;
    const isMac = navigator.platform.toLowerCase().includes('mac');
    return (_jsx("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
        }, children: _jsxs("div", { style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '800px',
                maxHeight: '90vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }, children: [_jsxs("div", { style: {
                        padding: '24px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }, children: [_jsx("h2", { style: { margin: 0, fontSize: '24px', fontWeight: 600 }, children: "\u2328\uFE0F Keyboard Shortcuts" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#6b7280',
                            }, "aria-label": "Close shortcuts", children: "\u00D7" })] }), _jsx("div", { style: {
                        padding: '16px 24px',
                        borderBottom: '1px solid #e5e7eb',
                    }, children: _jsxs("div", { style: {
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                        }, children: [_jsx("input", { type: "text", placeholder: "Search shortcuts...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), style: {
                                    flex: 1,
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                }, autoFocus: true }), _jsxs("select", { value: selectedCategory || '', onChange: (e) => setSelectedCategory(e.target.value || null), style: {
                                    padding: '8px 12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                }, children: [_jsx("option", { value: "", children: "All Categories" }), shortcutCategories.map(cat => (_jsxs("option", { value: cat.id, children: [cat.icon, " ", cat.name] }, cat.id)))] })] }) }), _jsx("div", { style: {
                        flex: 1,
                        overflow: 'auto',
                        padding: '24px',
                    }, children: filteredCategories.length === 0 ? (_jsx("div", { style: {
                            textAlign: 'center',
                            padding: '40px',
                            color: '#6b7280',
                        }, children: _jsxs("p", { children: ["No shortcuts found matching \"", searchQuery, "\""] }) })) : (filteredCategories.map(category => (_jsxs("div", { style: { marginBottom: '32px' }, children: [_jsxs("h3", { style: {
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    marginBottom: '12px',
                                    color: '#374151',
                                }, children: [category.icon, " ", category.name] }), _jsx("div", { style: {
                                    display: 'grid',
                                    gap: '8px',
                                }, children: category.shortcuts.map(shortcut => (_jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        backgroundColor: '#f9fafb',
                                        opacity: shortcut.available ? 1 : 0.5,
                                    }, children: [_jsx("span", { style: {
                                                fontSize: '14px',
                                                color: '#374151',
                                            }, children: shortcut.description }), _jsx("div", { style: {
                                                display: 'flex',
                                                gap: '4px',
                                            }, children: shortcut.keys.map((key, index) => (_jsxs(React.Fragment, { children: [index > 0 && _jsx("span", { style: { color: '#9ca3af' }, children: "+" }), _jsx("kbd", { style: {
                                                            padding: '2px 8px',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            fontFamily: 'monospace',
                                                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                                        }, children: key.replace('Ctrl/Cmd', isMac ? '⌘' : 'Ctrl') })] }, index))) })] }, shortcut.id))) })] }, category.id)))) }), _jsxs("div", { style: {
                        padding: '16px 24px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f9fafb',
                    }, children: [_jsxs("div", { style: {
                                fontSize: '12px',
                                color: '#6b7280',
                            }, children: ["Press ", _jsx("kbd", { style: {
                                        padding: '2px 6px',
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '3px',
                                        fontSize: '11px',
                                    }, children: "?" }), " to toggle this help"] }), _jsxs("div", { style: {
                                fontSize: '12px',
                                color: '#6b7280',
                            }, children: [filteredCategories.reduce((sum, cat) => sum + cat.shortcuts.length, 0), " shortcuts available"] })] })] }) }));
};
// Hook to manage keyboard shortcut overlay
export const useKeyboardShortcuts = () => {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Show help on "?" key (shift + /)
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev),
    };
};
