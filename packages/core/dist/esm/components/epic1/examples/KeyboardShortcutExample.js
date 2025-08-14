import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Example: Keyboard Shortcut Reference Implementation
 *
 * Demonstrates how to use the keyboard shortcut system
 * with Epic 1's help functionality.
 */
import React, { useState } from 'react';
import { KeyboardShortcutProvider, KeyboardShortcutIntegration, useKeyboardShortcutManager, useCommonShortcuts, ShortcutHint, } from '../onboarding/KeyboardShortcutManager';
import { VisualKeyboardMap, CompactKeyboardView } from '../onboarding/VisualKeyboardMap';
import { TutorialProvider } from '../onboarding/TutorialContext';
// Example: Basic keyboard shortcut integration
export const BasicKeyboardExample = () => {
    const [message, setMessage] = useState('Press keyboard shortcuts to see actions');
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const EditorComponent = () => {
        const { registerCommonShortcuts } = useCommonShortcuts();
        const manager = useKeyboardShortcutManager();
        React.useEffect(() => {
            // Register common shortcuts
            registerCommonShortcuts({
                onSave: () => {
                    setMessage('💾 Saved!');
                    setTimeout(() => setMessage(''), 2000);
                },
                onUndo: () => {
                    if (undoStack.length > 0) {
                        const [last, ...rest] = undoStack;
                        setUndoStack(rest);
                        setRedoStack([last, ...redoStack]);
                        setMessage(`↩️ Undid: ${last}`);
                    }
                },
                onRedo: () => {
                    if (redoStack.length > 0) {
                        const [last, ...rest] = redoStack;
                        setRedoStack(rest);
                        setUndoStack([last, ...undoStack]);
                        setMessage(`↪️ Redid: ${last}`);
                    }
                },
                onDuplicate: () => setMessage('📋 Duplicated selection'),
                onSelectAll: () => setMessage('🎯 Selected all'),
                onPreview: () => setMessage('👁️ Generating preview...'),
                onExport: () => setMessage('📤 Exporting...'),
            });
            // Register custom shortcuts
            manager.registerShortcut({
                id: 'custom-action',
                keys: ['G'],
                handler: () => setMessage('🎮 Custom action triggered!'),
                description: 'Custom game action',
                category: 'custom',
                preventDefault: true,
            });
            manager.registerShortcut({
                id: 'toggle-theme',
                keys: ['Ctrl/Cmd', 'T'],
                handler: () => setMessage('🎨 Theme toggled'),
                description: 'Toggle theme',
                category: 'ui',
                preventDefault: true,
            });
        }, [registerCommonShortcuts, manager]);
        return (_jsxs("div", { style: { textAlign: 'center', padding: '20px' }, children: [_jsx("h3", { children: "Try these shortcuts:" }), _jsx(CompactKeyboardView, {}), _jsx("div", { style: {
                        marginTop: '20px',
                        padding: '20px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                    }, children: message || 'Press a shortcut key...' }), _jsx("button", { onClick: () => {
                        const action = `Action ${undoStack.length + 1}`;
                        setUndoStack([action, ...undoStack]);
                        setMessage(`✅ Performed: ${action}`);
                    }, style: {
                        marginTop: '20px',
                        padding: '8px 16px',
                        fontSize: '14px',
                    }, children: "Perform Action (to test undo/redo)" }), _jsxs("div", { style: { marginTop: '10px', fontSize: '12px', color: '#6b7280' }, children: ["Undo stack: ", undoStack.length, " | Redo stack: ", redoStack.length] })] }));
    };
    return (_jsx(TutorialProvider, { children: _jsx(KeyboardShortcutProvider, { children: _jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Basic Keyboard Shortcuts Example" }), _jsx(EditorComponent, {}), _jsx("div", { style: { marginTop: '20px' }, children: _jsx(ShortcutHint, { shortcut: ['?'], description: "Press to see all shortcuts" }) })] }) }) }));
};
// Example: Visual keyboard map
export const VisualKeyboardExample = () => {
    const [activeKeys, setActiveKeys] = useState(new Set());
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            setActiveKeys(prev => new Set(prev).add(e.key));
        };
        const handleKeyUp = (e) => {
            setActiveKeys(prev => {
                const next = new Set(prev);
                next.delete(e.key);
                return next;
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    return (_jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Visual Keyboard Map" }), _jsx("p", { style: { marginBottom: '20px', color: '#6b7280' }, children: "Press keys on your keyboard to see them highlighted" }), _jsx("div", { style: { display: 'flex', justifyContent: 'center' }, children: _jsx(VisualKeyboardMap, { activeKeys: activeKeys }) })] }));
};
// Example: Context-aware shortcuts
export const ContextAwareExample = () => {
    const [mode, setMode] = useState('view');
    const [content, setContent] = useState('Click to edit this text');
    const [selected, setSelected] = useState(false);
    const ContentEditor = () => {
        const manager = useKeyboardShortcutManager();
        React.useEffect(() => {
            // Mode-specific shortcuts
            if (mode === 'edit') {
                manager.registerShortcut({
                    id: 'save-edit',
                    keys: ['Enter'],
                    handler: () => {
                        setMode('view');
                        setSelected(false);
                    },
                    description: 'Save and exit edit mode',
                    category: 'edit',
                });
                manager.registerShortcut({
                    id: 'cancel-edit',
                    keys: ['Escape'],
                    handler: () => {
                        setMode('view');
                        setContent('Click to edit this text');
                        setSelected(false);
                    },
                    description: 'Cancel edit',
                    category: 'edit',
                });
            }
            else {
                manager.unregisterShortcut('save-edit');
                manager.unregisterShortcut('cancel-edit');
                manager.registerShortcut({
                    id: 'enter-edit',
                    keys: ['E'],
                    handler: () => {
                        if (selected) {
                            setMode('edit');
                        }
                    },
                    description: 'Enter edit mode',
                    category: 'edit',
                    enabled: selected,
                });
            }
            // Always-available shortcuts
            manager.registerShortcut({
                id: 'toggle-select',
                keys: ['Space'],
                handler: () => {
                    if (mode === 'view') {
                        setSelected(!selected);
                    }
                },
                description: 'Toggle selection',
                category: 'selection',
                preventDefault: true,
            });
            return () => {
                manager.unregisterShortcut('save-edit');
                manager.unregisterShortcut('cancel-edit');
                manager.unregisterShortcut('enter-edit');
                manager.unregisterShortcut('toggle-select');
            };
        }, [mode, selected, manager]);
        return (_jsxs("div", { style: { padding: '20px' }, children: [_jsxs("div", { style: {
                        marginBottom: '16px',
                        padding: '8px 12px',
                        backgroundColor: mode === 'edit' ? '#fef3c7' : '#e0e7ff',
                        borderRadius: '6px',
                        fontSize: '14px',
                    }, children: ["Mode: ", _jsx("strong", { children: mode === 'edit' ? '✏️ Edit' : '👁️ View' })] }), mode === 'edit' ? (_jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), style: {
                        width: '100%',
                        minHeight: '100px',
                        padding: '12px',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '14px',
                    }, autoFocus: true })) : (_jsx("div", { onClick: () => setSelected(true), style: {
                        padding: '12px',
                        border: `2px ${selected ? 'solid' : 'dashed'} ${selected ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        backgroundColor: selected ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        minHeight: '100px',
                    }, children: content })), _jsxs("div", { style: { marginTop: '16px' }, children: [_jsxs("h4", { children: ["Available shortcuts in ", mode, " mode:"] }), mode === 'edit' ? (_jsxs("div", { children: [_jsx(ShortcutHint, { shortcut: ['Enter'], description: "Save changes" }), _jsx("br", {}), _jsx(ShortcutHint, { shortcut: ['Escape'], description: "Cancel edit" })] })) : (_jsxs("div", { children: [_jsx(ShortcutHint, { shortcut: ['Space'], description: "Select/deselect" }), _jsx("br", {}), selected && _jsx(ShortcutHint, { shortcut: ['E'], description: "Edit selected" })] }))] })] }));
    };
    return (_jsx(TutorialProvider, { children: _jsx(KeyboardShortcutProvider, { children: _jsxs("div", { style: { padding: '40px', maxWidth: '600px', margin: '0 auto' }, children: [_jsx("h2", { children: "Context-Aware Shortcuts" }), _jsx("p", { style: { marginBottom: '20px', color: '#6b7280' }, children: "Shortcuts change based on the current mode and selection" }), _jsx(ContentEditor, {})] }) }) }));
};
// Example: Full integration
export const FullIntegrationExample = () => {
    return (_jsx(TutorialProvider, { children: _jsx(KeyboardShortcutIntegration, { children: _jsxs("div", { style: { padding: '40px' }, children: [_jsx("h2", { children: "Full Keyboard Shortcut Integration" }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            marginTop: '20px',
                        }, children: [_jsxs("div", { style: {
                                    padding: '20px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                }, children: [_jsx("h3", { children: "Canvas Area" }), _jsx("p", { children: "Simulated graph editor area" }), _jsx("div", { style: {
                                            height: '200px',
                                            backgroundColor: 'white',
                                            border: '2px dashed #e5e7eb',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#9ca3af',
                                        }, children: "Graph nodes would appear here" })] }), _jsxs("div", { style: {
                                    padding: '20px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '8px',
                                }, children: [_jsx("h3", { children: "Inspector Panel" }), _jsx("p", { children: "Node properties and settings" }), _jsx(CompactKeyboardView, {})] })] }), _jsx("div", { style: {
                            marginTop: '20px',
                            padding: '16px',
                            backgroundColor: '#eff6ff',
                            borderRadius: '8px',
                            textAlign: 'center',
                        }, children: _jsx("p", { style: { margin: 0, fontSize: '14px' }, children: "The keyboard shortcut help (?) is always available in the bottom right corner" }) })] }) }) }));
};
