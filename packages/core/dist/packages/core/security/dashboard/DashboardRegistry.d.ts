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
import { DashboardConfig, DashboardType, SecurityRole, WidgetDefinition, DashboardTheme, DashboardPermissions } from './SecurityDashboardFramework';
export interface DashboardTemplate {
    id: string;
    type: DashboardType;
    name: string;
    description: string;
    category: 'executive' | 'operational' | 'compliance' | 'analytics' | 'custom';
    targetRoles: SecurityRole[];
    previewImage?: string;
    config: Partial<DashboardConfig>;
    requiredWidgets: string[];
    optionalWidgets: string[];
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
        tags: string[];
        industryFocus?: string[];
        complianceFrameworks?: string[];
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
/**
 * Dashboard Registry Class
 *
 * Manages the registration, discovery, and instantiation of security dashboards.
 */
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
    /**
     * Initialize default dashboard presets
     */
    private initializeDefaultPresets;
    /**
     * Initialize built-in widget definitions
     */
    private initializeBuiltInWidgets;
    /**
     * Register a new dashboard template
     */
    registerDashboard(template: DashboardTemplate): boolean;
    /**
     * Register a new dashboard preset
     */
    registerPreset(preset: DashboardPreset): boolean;
    /**
     * Register a new widget definition
     */
    registerWidget(widget: WidgetDefinition): boolean;
    /**
     * Get dashboard templates by type or role
     */
    getDashboardTemplates(type?: DashboardType, role?: SecurityRole, category?: string): DashboardTemplate[];
    /**
     * Get dashboard presets
     */
    getDashboardPresets(dashboardType?: DashboardType, layout?: string): DashboardPreset[];
    /**
     * Get widget definitions
     */
    getWidgetDefinitions(category?: string, tags?: string[]): WidgetDefinition[];
    /**
     * Create dashboard from template
     */
    createDashboardFromTemplate(templateId: string, overrides?: Partial<DashboardConfig>): DashboardConfig | null;
    /**
     * Create dashboard from preset
     */
    createDashboardFromPreset(presetId: string, overrides?: Partial<DashboardConfig>): DashboardConfig | null;
    /**
     * Validate dashboard template
     */
    private validateDashboardTemplate;
    /**
     * Get registry statistics
     */
    getRegistryStats(): {
        dashboardCount: number;
        presetCount: number;
        widgetCount: number;
        categoriesByType: Record<DashboardType, number>;
    };
    /**
     * Clear registry (for testing)
     */
    clear(): void;
}
export default DashboardRegistry;
//# sourceMappingURL=DashboardRegistry.d.ts.map