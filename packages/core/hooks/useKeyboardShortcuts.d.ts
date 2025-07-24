/**
 * Keyboard Shortcuts Hook
 * Task T-1752989144320-364: Command palette keyboard integration
 *
 * Professional keyboard shortcut management for Wild Construct
 */
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
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
    preventDefault?: boolean;
}
/**
 * Hook for managing keyboard shortcuts in the graph editor
 */
export declare const useKeyboardShortcuts: ({ shortcuts, enabled, preventDefault }: UseKeyboardShortcutsOptions) => {
    shortcuts: KeyboardShortcut[];
};
/**
 * Hook for command palette specific shortcuts
 */
export declare const useCommandPaletteShortcuts: (shortcuts: KeyboardShortcut[]) => {
    shortcuts: KeyboardShortcut[];
};
/**
 * Default keyboard shortcuts for the graph editor
 */
export declare const createDefaultShortcuts: (actions: {
    onUndo?: () => void;
    onRedo?: () => void;
    onSave?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onDelete?: () => void;
    onSelectAll?: () => void;
    onDuplicate?: () => void;
    onFitView?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onNewNode?: (type: string) => void;
    onExport?: () => void;
}) => KeyboardShortcut[];
/**
 * Format keyboard shortcut for display
 */
export declare const formatKeyCombo: (shortcut: KeyboardShortcut) => string;
/**
 * Check if a keyboard shortcut conflicts with browser shortcuts
 */
export declare const checkBrowserConflicts: (shortcut: KeyboardShortcut) => boolean;
export default useKeyboardShortcuts;
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map