/**
 * Adaptive navigation patterns for different platforms
 */
import React from 'react';
/**
 * Navigation item definition
 */
export interface NavigationItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    path?: string;
    badge?: number;
    children?: NavigationItem[];
}
/**
 * Adaptive navigation props
 */
export interface AdaptiveNavigationProps {
    title?: string;
    items: NavigationItem[];
    activeItem: string;
    onNavigate: (itemId: string) => void;
    onBack?: () => void;
    actions?: React.ReactNode[];
    showBackButton?: boolean;
    variant?: 'auto' | 'top' | 'bottom' | 'side' | 'rail';
}
/**
 * Main adaptive navigation component
 */
export declare const AdaptiveNavigation: React.FC<AdaptiveNavigationProps>;
/**
 * Breadcrumb navigation for desktop
 */
export interface BreadcrumbItem {
    id: string;
    label: string;
    path?: string;
}
export interface AdaptiveBreadcrumbProps {
    items: BreadcrumbItem[];
    onNavigate: (item: BreadcrumbItem) => void;
}
export declare const AdaptiveBreadcrumb: React.FC<AdaptiveBreadcrumbProps>;
//# sourceMappingURL=AdaptiveNavigation.d.ts.map