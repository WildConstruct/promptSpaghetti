/**
 * Dashboard Registry
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * Centralized registry for managing security dashboard types, configurations,
 * and instantiation. Provides a unified interface for dashboard discovery,
 * validation, and lifecycle management.
 *
 * Features:
 * - Dashboard type registration and discovery
 * - Configuration validation and defaults
 * - Role-based access control integration
 * - Dashboard lifecycle management
 * - Widget library management
 * - Template and preset management
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import { DashboardConfig, DashboardType, SecurityRole, DashboardTheme, DashboardPermissions } from './SecurityDashboardFramework';
export interface DashboardTemplate {
    id: string;
    type: DashboardType;
    name: string;
    description: string;
    category: 'executive' | 'operational' | 'compliance' | 'analytics' | 'custom';
    targetRoles: SecurityRole;
    previewImage?: string;
    config: Partial<DashboardConfig>;
    requiredWidgets: string;
    optionalWidgets: string;
    customization: {
        allowLayoutChange: boolean;
        allowWidgetAdd: boolean;
        allowWidgetRemove: boolean;
        allowThemeChange: boolean;
    };
    metadata: {
        version: string;
        author: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string;
        industryFocus?: string;
        complianceFrameworks?: string;
    };
}
export interface DashboardPreset {
    id: string;
    name: string;
    description: string;
    dashboardType: DashboardType;
    theme: DashboardTheme;
    layout: 'compact' | 'standard' | 'detailed';
    widgets: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
        };
        size: {
            width: number;
            height: number;
        };
        config: Record<string, any>;
    }[];
    permissions: DashboardPermissions;
}
export interface RegistryOptions {
    enableCache: boolean;
    cacheTimeout: number;
    validateConfigs: boolean;
    allowCustomDashboards: boolean;
    maxCustomDashboards: number;
    enableAuditLogging: boolean;
}
export declare class DashboardRegistry {
    private dashboards;
    private presets;
    private widgets;
    private themes;
    private options;
    constructor(options?: Partial<RegistryOptions>);
    /**
     * Initialize default dashboard templates
     */
    private initializeDefaultDashboards;
    export: [SecurityRole.EXECUTIVE, SecurityRole.SECURITY_ADMIN];
    share: [SecurityRole.EXECUTIVE];
    adminOnly: false;
}
//# sourceMappingURL=DashboardRegistry.d.ts.map