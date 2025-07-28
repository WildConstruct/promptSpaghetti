export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    cmd?: boolean;
    alt?: boolean;
    shift?: boolean;
    description: string;
    action: () => void;
    preventDefault?: boolean;
    enabled?: boolean;
    global?: boolean;
}
export interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut;
    enabled?: boolean;
    preventDefault?: boolean;
}
export declare const useKeyboardShortcuts: {
    shortcuts: any;
    enabled: boolean;
    preventDefault: boolean;
}, UseKeyboardShortcutsOptions: any;
/**
 * Hook for command palette specific shortcuts
 */
export declare const useCommandPaletteShortcuts: (shortcuts: KeyboardShortcut) => any;
/**
 * Default keyboard shortcuts for the graph editor
 */
export declare const createDefaultShortcuts: (actions: {}) => any;
/**
 * Format keyboard shortcut for display
 */
export declare const formatKeyCombo: (shortcut: KeyboardShortcut) => string;
export default useKeyboardShortcuts;
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map