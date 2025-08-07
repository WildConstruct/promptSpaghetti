import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Keyboard Shortcut Manager
 *
 * Centralized management of keyboard shortcuts with conflict detection,
 * customization, and integration with the help system.
 */
import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { KeyboardShortcutReference, useKeyboardShortcuts } from './KeyboardShortcutReference';
const KeyboardShortcutContext = createContext(null);
export const useKeyboardShortcutManager = () => {
    const context = useContext(KeyboardShortcutContext);
    if (!context) {
        throw new Error('useKeyboardShortcutManager must be used within KeyboardShortcutProvider');
    }
    return context;
};
export const KeyboardShortcutProvider = ({ children, disabled = false, }) => {
    const [shortcuts, setShortcuts] = useState(new Map());
    const { isOpen, open, close } = useKeyboardShortcuts();
    // Register a new shortcut
    const registerShortcut = useCallback((shortcut) => {
        setShortcuts(prev => {
            const next = new Map(prev);
            next.set(shortcut.id, { ...shortcut, enabled: shortcut.enabled !== false });
            return next;
        });
    }, []);
    // Unregister a shortcut
    const unregisterShortcut = useCallback((id) => {
        setShortcuts(prev => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    }, []);
    // Enable/disable shortcuts
    const enableShortcut = useCallback((id) => {
        setShortcuts(prev => {
            const next = new Map(prev);
            const shortcut = next.get(id);
            if (shortcut) {
                next.set(id, { ...shortcut, enabled: true });
            }
            return next;
        });
    }, []);
    const disableShortcut = useCallback((id) => {
        setShortcuts(prev => {
            const next = new Map(prev);
            const shortcut = next.get(id);
            if (shortcut) {
                next.set(id, { ...shortcut, enabled: false });
            }
            return next;
        });
    }, []);
    // Check if shortcut is active
    const isShortcutActive = useCallback((id) => {
        const shortcut = shortcuts.get(id);
        return shortcut?.enabled ?? false;
    }, [shortcuts]);
    // Get all shortcuts
    const getShortcuts = useCallback(() => {
        return Array.from(shortcuts.values());
    }, [shortcuts]);
    // Global keyboard event handler
    useEffect(() => {
        if (disabled)
            return;
        const handleKeyDown = (e) => {
            // Skip if user is typing in an input
            const target = e.target;
            if (target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true') {
                return;
            }
            // Check each registered shortcut
            shortcuts.forEach(shortcut => {
                if (!shortcut.enabled)
                    return;
                const matches = checkShortcutMatch(e, shortcut.keys);
                if (matches) {
                    if (shortcut.preventDefault) {
                        e.preventDefault();
                    }
                    shortcut.handler(e);
                }
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, disabled]);
    const value = {
        registerShortcut,
        unregisterShortcut,
        enableShortcut,
        disableShortcut,
        getShortcuts,
        isShortcutActive,
        showHelp: open,
        hideHelp: close,
    };
    return (_jsxs(KeyboardShortcutContext.Provider, { value: value, children: [children, _jsx(KeyboardShortcutReference, { isOpen: isOpen, onClose: close })] }));
};
// Helper function to check if keyboard event matches shortcut
function checkShortcutMatch(event, keys) {
    const modifiers = {
        'Ctrl': event.ctrlKey && !event.metaKey,
        'Cmd': event.metaKey && !event.ctrlKey,
        'Ctrl/Cmd': event.ctrlKey || event.metaKey,
        'Alt': event.altKey,
        'Option': event.altKey,
        'Shift': event.shiftKey,
    };
    const normalizedKeys = keys.map(k => k.toLowerCase());
    const hasModifiers = normalizedKeys.some(k => k in modifiers || k === 'ctrl/cmd');
    if (hasModifiers) {
        // Check modifier keys
        for (const [mod, pressed] of Object.entries(modifiers)) {
            const shouldBePressed = normalizedKeys.includes(mod.toLowerCase());
            if (shouldBePressed !== pressed) {
                return false;
            }
        }
        // Check main key
        const mainKey = normalizedKeys.find(k => !(k in modifiers) && k !== 'ctrl/cmd');
        if (mainKey && event.key.toLowerCase() !== mainKey) {
            return false;
        }
    }
    else {
        // Simple key check
        return normalizedKeys.includes(event.key.toLowerCase());
    }
    return true;
}
// Pre-built shortcut hooks for common operations
export const useCommonShortcuts = () => {
    const manager = useKeyboardShortcutManager();
    const registerCommonShortcuts = useCallback((handlers) => {
        if (handlers.onSave) {
            manager.registerShortcut({
                id: 'save',
                keys: ['Ctrl/Cmd', 'S'],
                handler: handlers.onSave,
                description: 'Save project',
                category: 'file',
                preventDefault: true,
            });
        }
        if (handlers.onUndo) {
            manager.registerShortcut({
                id: 'undo',
                keys: ['Ctrl/Cmd', 'Z'],
                handler: handlers.onUndo,
                description: 'Undo last action',
                category: 'edit',
                preventDefault: true,
            });
        }
        if (handlers.onRedo) {
            manager.registerShortcut({
                id: 'redo',
                keys: ['Ctrl/Cmd', 'Shift', 'Z'],
                handler: handlers.onRedo,
                description: 'Redo last action',
                category: 'edit',
                preventDefault: true,
            });
        }
        if (handlers.onDuplicate) {
            manager.registerShortcut({
                id: 'duplicate',
                keys: ['Ctrl/Cmd', 'D'],
                handler: handlers.onDuplicate,
                description: 'Duplicate selected',
                category: 'edit',
                preventDefault: true,
            });
        }
        if (handlers.onDelete) {
            manager.registerShortcut({
                id: 'delete',
                keys: ['Delete'],
                handler: handlers.onDelete,
                description: 'Delete selected',
                category: 'edit',
            });
        }
        if (handlers.onSelectAll) {
            manager.registerShortcut({
                id: 'select-all',
                keys: ['Ctrl/Cmd', 'A'],
                handler: handlers.onSelectAll,
                description: 'Select all',
                category: 'selection',
                preventDefault: true,
            });
        }
        if (handlers.onPreview) {
            manager.registerShortcut({
                id: 'preview',
                keys: ['Ctrl/Cmd', 'P'],
                handler: handlers.onPreview,
                description: 'Generate preview',
                category: 'view',
                preventDefault: true,
            });
        }
        if (handlers.onExport) {
            manager.registerShortcut({
                id: 'export',
                keys: ['Ctrl/Cmd', 'E'],
                handler: handlers.onExport,
                description: 'Export graph',
                category: 'file',
                preventDefault: true,
            });
        }
        if (handlers.onSearch) {
            manager.registerShortcut({
                id: 'search',
                keys: ['Ctrl/Cmd', 'F'],
                handler: handlers.onSearch,
                description: 'Search',
                category: 'navigation',
                preventDefault: true,
            });
        }
        if (handlers.onCommandPalette) {
            manager.registerShortcut({
                id: 'command-palette',
                keys: ['Ctrl/Cmd', 'K'],
                handler: handlers.onCommandPalette,
                description: 'Open command palette',
                category: 'navigation',
                preventDefault: true,
            });
        }
    }, [manager]);
    return { registerCommonShortcuts };
};
export const ShortcutHint = ({ shortcut, description, style = {}, }) => {
    const isMac = navigator.platform.toLowerCase().includes('mac');
    return (_jsxs("div", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#6b7280',
            ...style,
        }, children: [_jsx("div", { style: { display: 'flex', gap: '2px' }, children: shortcut.map((key, index) => (_jsxs(React.Fragment, { children: [index > 0 && _jsx("span", { children: "+" }), _jsx("kbd", { style: {
                                padding: '2px 6px',
                                backgroundColor: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                borderRadius: '3px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                            }, children: key.replace('Ctrl/Cmd', isMac ? '⌘' : 'Ctrl') })] }, index))) }), description && _jsx("span", { children: description })] }));
};
// Integration component for Epic 1
export const KeyboardShortcutIntegration = ({ children }) => {
    return (_jsxs(KeyboardShortcutProvider, { children: [children, _jsx("div", { style: {
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000,
                }, children: _jsx(ShortcutHint, { shortcut: ['?'], description: "Keyboard shortcuts" }) })] }));
};
