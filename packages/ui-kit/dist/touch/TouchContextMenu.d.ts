/**
 * Touch-optimized context menu with long-press activation
 */
import React from 'react';
export interface ContextMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
    checked?: boolean;
    disabled?: boolean;
    danger?: boolean;
    shortcut?: string;
    submenu?: ContextMenuItem[];
    onSelect?: () => void;
}
export interface TouchContextMenuProps {
    items: ContextMenuItem[];
    onSelect?: (item: ContextMenuItem) => void;
    onDismiss?: () => void;
    position?: {
        x: number;
        y: number;
    };
    anchor?: 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'center';
    showShortcuts?: boolean;
    enableHaptics?: boolean;
}
/**
 * Touch-friendly context menu component
 */
export declare const TouchContextMenu: React.FC<TouchContextMenuProps>;
/**
 * Context menu provider for long-press activation
 */
export interface ContextMenuProviderProps {
    items: ContextMenuItem[] | ((target: HTMLElement) => ContextMenuItem[]);
    longPressDelay?: number;
    enableHaptics?: boolean;
    children: React.ReactNode;
}
export declare     edge: (edgeId: string) => ContextMenuItem[];
    canvas: (position: {
        x: number;
        y: number;
    }) => ContextMenuItem[];
};
//# sourceMappingURL=TouchContextMenu.d.ts.map