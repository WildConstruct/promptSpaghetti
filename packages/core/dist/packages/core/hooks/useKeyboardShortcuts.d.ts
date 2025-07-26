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
export declare };
/**
 * Default keyboard shortcuts for the graph editor
 */
export declare     onRedo?: () => void;
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
export declare /**
 * Check if a keyboard shortcut conflicts with browser shortcuts
 */
export declare export default useKeyboardShortcuts;
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map