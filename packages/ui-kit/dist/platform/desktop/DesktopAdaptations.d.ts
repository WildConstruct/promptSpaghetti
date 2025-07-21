/**
 * Desktop-specific UI adaptations and features
 */
import React from 'react';
/**
 * Desktop hover states manager
 */
export declare     hoverPosition: {
        x: number;
        y: number;
    };
    hoverProps: {
        onMouseEnter: (e: React.MouseEvent) => void;
        onMouseLeave: () => void;
        onMouseMove: (e: React.MouseEvent) => void;
    };
};
/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
    id: string;
    key: string;
    modifiers?: ('ctrl' | 'cmd' | 'alt' | 'shift')[];
    description: string;
    handler: () => void;
    category?: string;
    enabled?: boolean;
}
/**
 * Keyboard shortcuts manager
 */
export declare class KeyboardShortcutsManager {
    private shortcuts;
    private listeners;
    constructor();
    register(shortcut: KeyboardShortcut): void;
    unregister(id: string): void;
    getShortcuts(): KeyboardShortcut[];
    getShortcutsByCategory(category: string): KeyboardShortcut[];
    subscribe(callback: (shortcuts: KeyboardShortcut[]) => void): () => void;
    private handleKeyDown;
    private getShortcutKey;
    private getEventKey;
    private notifyListeners;
    destroy(): void;
}
/**
 * React hook for keyboard shortcuts
 */
export declare /**
 * Desktop tooltip component
 */
export interface DesktopTooltipProps {
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    delay?: number;
    children: React.ReactNode;
}
export declare     }>;
    children: React.ReactNode;
}
export declare     onMaximize?: () => void;
    onClose?: () => void;
    platform?: 'windows' | 'mac' | 'linux';
}
export declare const DesktopWindowControls: React.FC<DesktopWindowControlsProps>;
/**
 * Common desktop keyboard shortcuts
 */
export declare const desktopShortcuts: KeyboardShortcut[];
/**
 * Desktop hover effects
 */
export declare const desktopHoverStyles = "\n  /* Desktop hover states */\n  @media (hover: hover) {\n    .desktop-hoverable {\n      transition: all 0.2s ease;\n    }\n    \n    .desktop-hoverable:hover {\n      transform: translateY(-2px);\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n    }\n    \n    .desktop-link {\n      text-decoration: none;\n      color: var(--color-primary);\n      transition: color 0.2s ease;\n    }\n    \n    .desktop-link:hover {\n      color: var(--color-primary-dark);\n      text-decoration: underline;\n    }\n    \n    .desktop-button {\n      transition: all 0.2s ease;\n    }\n    \n    .desktop-button:hover:not(:disabled) {\n      background-color: var(--color-hover);\n      transform: scale(1.02);\n    }\n    \n    .desktop-button:active:not(:disabled) {\n      transform: scale(0.98);\n    }\n  }\n  \n  /* Desktop focus states */\n  .desktop-focusable:focus {\n    outline: 2px solid var(--color-primary);\n    outline-offset: 2px;\n  }\n  \n  .desktop-focusable:focus:not(:focus-visible) {\n    outline: none;\n  }\n  \n  .desktop-focusable:focus-visible {\n    outline: 2px solid var(--color-primary);\n    outline-offset: 2px;\n  }\n  \n  /* Desktop selection */\n  ::selection {\n    background-color: var(--color-primary);\n    color: var(--color-on-primary);\n  }\n  \n  /* Custom scrollbars for desktop */\n  @media (hover: hover) {\n    ::-webkit-scrollbar {\n      width: 12px;\n      height: 12px;\n    }\n    \n    ::-webkit-scrollbar-track {\n      background: var(--color-background);\n    }\n    \n    ::-webkit-scrollbar-thumb {\n      background: var(--color-border);\n      border-radius: 6px;\n      border: 2px solid var(--color-background);\n    }\n    \n    ::-webkit-scrollbar-thumb:hover {\n      background: var(--color-text-secondary);\n    }\n  }\n";
//# sourceMappingURL=DesktopAdaptations.d.ts.map