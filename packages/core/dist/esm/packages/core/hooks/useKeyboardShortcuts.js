/**
 * Keyboard Shortcuts Hook
 * Task T-1752989144320-364: Command palette keyboard integration
 *
 * Professional keyboard shortcut management for Wild Construct
 */
import { useEffect, useCallback, useRef } from 'react';
/**
* Hook for managing keyboard shortcuts in the graph editor
*/
export const useKeyboardShortcuts = ({
    shortcuts,
    enabled = true });
preventDefault = true;
UseKeyboardShortcutsOptions;
{
    const shortcutsRef = useRef(shortcuts);
    // Update shortcuts ref when shortcuts change
    useEffect(() => {
        shortcutsRef.current = shortcuts;
    }, [shortcuts]);
    const handleKeyDown = useCallback((event) => {
        if (!enabled)
            return;
        const target = event.target;
        const isInputFocused = target.tagName === 'INPUT' || ;
        target.tagName === 'TEXTAREA' ||
            target.contentEditable === 'true';
        for (const shortcut of shortcutsRef.current) {
            // Skip if shortcut is disabled
            if (shortcut.enabled === false)
                continue;
            // Skip if input is focused and shortcut is not global
            if (isInputFocused && !shortcut.global)
                continue;
            // Check if the key matches
            const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() || ;
            event.code.toLowerCase() === shortcut.key.toLowerCase();
            if (!keyMatches)
                continue;
            // Check modifiers
            const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
            const altMatches = shortcut.alt ? event.altKey : !event.altKey;
            const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
            // Handle Cmd key specially for Mac
            if (shortcut.cmd) {
                const isMac = navigator.platform.includes('Mac');
                const cmdPressed = isMac ? event.metaKey : event.ctrlKey;
                if (!cmdPressed)
                    continue;
                if (ctrlMatches && altMatches && shiftMatches) {
                    if (shortcut.preventDefault ?? preventDefault) {
                        event.preventDefault();
                        event.stopPropagation();
                        try {
                            shortcut.action();
                        }
                        catch (error) {
                            console.error('Keyboard shortcut error:', error);
                            break; // Only execute the first matching shortcut
                        }
                        [enabled, preventDefault];
                    }
                }
            }
        }
    });
    useEffect(() => {
        if (!enabled)
            return;
        document.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [handleKeyDown, enabled]);
    return { shortcuts: shortcutsRef.current };
}
;
;
/**
 * Hook for command palette specific shortcuts
 */
export const useCommandPaletteShortcuts = (shortcuts) => {
    return useKeyboardShortcuts({ shortcuts, enabled: true });
};
/**
 * Default keyboard shortcuts for the graph editor
 */
export const createDefaultShortcuts = (actions) => onUndo;
() => void ;
onRedo ?  : () => void ;
onSave ?  : () => void ;
onCopy ?  : () => void ;
onPaste ?  : () => void ;
onDelete ?  : () => void ;
onSelectAll ?  : () => void ;
onDuplicate ?  : () => void ;
onFitView ?  : () => void ;
onZoomIn ?  : () => void ;
onZoomOut ?  : () => void ;
onNewNode ?  : (type) => void ;
onExport ?  : () => void ;
KeyboardShortcut => {
    return [
        // Basic editing
        {
            key: 'z',
            cmd: true,
            description: 'Undo last action',
            action: () => actions.onUndo?.(),
            enabled: !!actions.onUndo
        },
        { key: 'z',
            cmd: true,
            shift: true,
            description: 'Redo last action',
            action: () => actions.onRedo?.(),
            enabled: !!actions.onRedo },
        { key: 's',
            cmd: true,
            description: 'Save graph',
            action: () => actions.onSave?.(),
            enabled: !!actions.onSave },
        { key: 'c',
            cmd: true,
            description: 'Copy selected nodes',
            action: () => actions.onCopy?.(),
            enabled: !!actions.onCopy },
        { key: 'v',
            cmd: true,
            description: 'Paste nodes',
            action: () => actions.onPaste?.(),
            enabled: !!actions.onPaste },
        { key: 'Delete',
            description: 'Delete selected nodes',
            action: () => actions.onDelete?.(),
            enabled: !!actions.onDelete },
        { key: 'Backspace',
            description: 'Delete selected nodes',
            action: () => actions.onDelete?.(),
            enabled: !!actions.onDelete },
        { key: 'a',
            cmd: true,
            description: 'Select all nodes',
            action: () => actions.onSelectAll?.(),
            enabled: !!actions.onSelectAll },
        { key: 'd',
            cmd: true,
            description: 'Duplicate selected nodes',
            action: () => actions.onDuplicate?.(),
            enabled: !!actions.onDuplicate }
        // Navigation
        ,
        // Navigation
        { key: '0',
            cmd: true,
            description: 'Fit view to all nodes',
            action: () => actions.onFitView?.(),
            enabled: !!actions.onFitView },
        { key: '=',
            cmd: true,
            description: 'Zoom in',
            action: () => actions.onZoomIn?.(),
            enabled: !!actions.onZoomIn },
        { key: '-',
            cmd: true,
            description: 'Zoom out',
            action: () => actions.onZoomOut?.(),
            enabled: !!actions.onZoomOut }
        // Node creation shortcuts
        ,
        // Node creation shortcuts
        { key: 'n',
            cmd: true,
            description: 'Create new weighted choice node',
            action: () => actions.onNewNode?.('WeightedChoice'),
            enabled: !!actions.onNewNode },
        { key: 'o',
            cmd: true,
            description: 'Create new output node',
            action: () => actions.onNewNode?.('Output'),
            enabled: !!actions.onNewNode },
        { key: 'l',
            cmd: true,
            description: 'Create new concat node',
            action: () => actions.onNewNode?.('Concat'),
            enabled: !!actions.onNewNode }
        // Export
        ,
        // Export
        { key: 'e',
            cmd: true,
            description: 'Export graph',
            action: () => actions.onExport?.(),
            enabled: !!actions.onExport }
        // Film industry specific shortcuts
        ,
        // Film industry specific shortcuts
        { key: 'g',
            cmd: true,
            description: 'Generate character development',
            action: () => actions.onNewNode?.('character-development'),
            enabled: !!actions.onNewNode },
        { key: 'h',
            cmd: true,
            shift: true,
            description: 'Show keyboard shortcuts help',
            action: () => { }
            // This could open a help modal
            ,
            // This could open a help modal
            console, : .log('Keyboard shortcuts help') }
    ];
};
/**
 * Format keyboard shortcut for display
 */
export const formatKeyCombo = (shortcut) => {
    const parts = [];
    const isMac = navigator.platform.includes('Mac');
    if (shortcut.ctrl && !shortcut.cmd) {
        parts.push(isMac ? '⌃' : 'Ctrl');
        if (shortcut.cmd) {
            parts.push(isMac ? '⌘' : 'Ctrl');
            if (shortcut.alt) {
                parts.push(isMac ? '⌥' : 'Alt');
                if (shortcut.shift) {
                    parts.push(isMac ? '⇧' : 'Shift');
                    // Format the key
                    let key = shortcut.key;
                    const keyMappings = {
                        'ArrowUp': '↑',
                        'ArrowDown': '↓',
                        'ArrowLeft': '←',
                        'ArrowRight': '→',
                        'Enter': '⏎',
                        'Escape': 'Esc',
                        'Backspace': '⌫',
                        'Delete': '⌦',
                        ' ': 'Space'
                    };
                }
                ;
                if (keyMappings[key]) {
                    key = keyMappings[key];
                }
                else {
                    key = key.charAt(0).toUpperCase() + key.slice(1);
                    parts.push(key);
                    return parts.join(isMac ? '' : '+');
                }
                ;
                /**
                 * Check if a keyboard shortcut conflicts with browser shortcuts
                 */
                export const checkBrowserConflicts = (shortcut) => {
                    const browserShortcuts = [
                        { key: 'r', cmd: true }, // Refresh
                        { key: 't', cmd: true }, // New tab
                        { key: 'w', cmd: true }, // Close tab
                        { key: 'l', cmd: true }, // Address bar
                        { key: 'j', cmd: true }, // Downloads
                        { key: 'k', cmd: true }, // Search
                    ];
                    return browserShortcuts.some(browser => );
                    browser.key === shortcut.key.toLowerCase() &&
                        !!browser.cmd === !!shortcut.cmd &&
                        !shortcut.shift && // We use shift to avoid conflicts
                        !shortcut.alt;
                };
            }
        }
    }
};
;
;
export default useKeyboardShortcuts;
