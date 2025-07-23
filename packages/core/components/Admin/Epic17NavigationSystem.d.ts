/**
 * Epic 17 Dashboard Navigation System
 *
 * Advanced navigation system for Epic 17 Backstage Admin Controls providing:
 * - Hierarchical navigation with breadcrumbs and context switching
 * - Role-based navigation with dynamic menu generation
 * - Smart navigation with recent items, favorites, and quick actions
 * - Responsive design with mobile-first approach
 * - Integration with authorization system for permission-based navigation
 */
import React from 'react';
export interface NavigationItem {
    id: string;
    label: string;
    description?: string;
    icon: React.ComponentType<any>;
    path: string;
    children?: NavigationItem[];
    requiredPermissions?: {
        resource: string;
        actions: string[];
    }[];
    badge?: NavigationBadge;
    metadata: {
        category: string;
        priority: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        epic?: string;
        story?: string;
        tags: string[];
    };
}
export interface NavigationBadge {
    type: 'count' | 'status' | 'alert' | 'info';
    value: string | number;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
    pulse?: boolean;
}
export interface NavigationContext {
    currentPath: string;
    currentSection: string;
    parentSections: string[];
    breadcrumbs: BreadcrumbItem[];
    availableActions: QuickAction[];
}
export interface BreadcrumbItem {
    label: string;
    path: string;
    icon?: React.ComponentType<any>;
    active: boolean;
}
export interface QuickAction {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<any>;
    action: () => void;
    shortcut?: string;
    category: 'primary' | 'secondary' | 'tertiary';
    enabled: boolean;
}
export interface NavigationState {
    expandedSections: Set<string>;
    pinnedItems: Set<string>;
    recentItems: RecentItem[];
    favoriteItems: Set<string>;
    searchQuery: string;
    mobileMenuOpen: boolean;
}
export interface RecentItem {
    id: string;
    label: string;
    path: string;
    timestamp: Date;
    icon: React.ComponentType<any>;
}
interface Epic17NavigationSystemProps {
    currentSection?: string;
    onSectionChange?: (section: string) => void;
    variant?: 'sidebar' | 'top' | 'mobile';
    showBreadcrumbs?: boolean;
    showQuickActions?: boolean;
    enableSearch?: boolean;
}
export declare const Epic17NavigationSystem: React.FC<Epic17NavigationSystemProps>;
export default Epic17NavigationSystem;
//# sourceMappingURL=Epic17NavigationSystem.d.ts.map