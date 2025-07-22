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
 * Format keyboard shortcut for display
 */
export declare const isMac: boolean;
export default useKeyboardShortcuts;
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map