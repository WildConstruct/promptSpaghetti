/**
 * Professional Keyboard Shortcuts System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 *
 * Cinema 4D-inspired keyboard shortcuts with customization and help overlay
 */
import React from 'react';
export interface KeyboardShortcut {
    id: string;
    key: string;
    modifiers: ('ctrl' | 'meta' | 'shift' | 'alt')[];
    action: () => void | Promise<void>;
    description: string;
    category: 'editing' | 'navigation' | 'selection' | 'view' | 'file' | 'generation';
    enabled: boolean;
    global?: boolean;
}
export interface KeyboardShortcutsManagerProps {
    onCommandPalette: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onLoad: () => void;
    onExport: () => void;
    onSelectAll: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onFitView: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onGenerateCharacter: () => void;
    onToggleFullscreen: () => void;
    customShortcuts?: KeyboardShortcut[];
    theme?: 'light' | 'dark' | 'cinema';
    disabled?: boolean;
}
export declare const KeyboardShortcutsManager: React.FC<KeyboardShortcutsManagerProps>, shortcuts: any, disabled: any;
export default KeyboardShortcutsManager;
//# sourceMappingURL=KeyboardShortcutsManager.d.ts.map