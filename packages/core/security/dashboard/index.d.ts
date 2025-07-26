/**
 * Security Dashboard Framework - Main Export
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * Main entry point for the security dashboard framework, providing
 * comprehensive dashboard capabilities for security monitoring,
 * compliance tracking, and executive reporting.
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
export { SecurityDashboardFramework, DashboardType, DashboardTheme, SecurityRole, WidgetCategory, type DashboardConfig, type DashboardLayout, type WidgetConfiguration, type WidgetDefinition, type DashboardPermissions, type WidgetPermissions, type ThemeConfig, type SecurityDashboardFrameworkOptions } from './SecurityDashboardFramework';
import { SecurityRole, DashboardType } from './SecurityDashboardFramework';
export { DashboardRegistry, type DashboardTemplate, type DashboardPreset, type RegistryOptions } from './DashboardRegistry';
export { ExecutiveSecurityDashboard, type ExecutiveMetrics, type ExecutiveInsight, type ExecutiveSecurityDashboardProps } from './ExecutiveSecurityDashboard';
export { OperationalSecurityDashboard, type SecurityAlert, type ResponseAction, type SystemStatus, type ThreatIntelligence, type OperationalMetrics, type OperationalSecurityDashboardProps } from './OperationalSecurityDashboard';
export { ComplianceSecurityDashboard, ComplianceFramework, ComplianceStatus, type ComplianceRequirement, type Evidence, type Finding, type AuditCycle, type ComplianceMetrics, type ComplianceSecurityDashboardProps } from './ComplianceSecurityDashboard';
/**
 * Security Dashboard Framework Factory
 *
 * Creates and configures a complete security dashboard framework instance
 * with registry, themes, and default dashboard types.
 */
export declare class SecurityDashboardFactory {
    private framework;
    private registry;
    constructor(options?: {
        frameworkOptions?: Partial<SecurityDashboardFrameworkOptions>;
        registryOptions?: Partial<RegistryOptions>;
    });
    /**
     * Get the framework instance
     */
    getFramework(): SecurityDashboardFramework;
    /**
     * Get the registry instance
     */
    getRegistry(): DashboardRegistry;
    /**
     * Create a dashboard from template
     */
    createDashboard(
      templateId: string,
      userId: string,
      overrides?: Partial<DashboardConfig>
    ): Promise<DashboardConfig | null>;
    /**
     * Create a dashboard from preset
     */
    createDashboardFromPreset(
      presetId: string,
      userId: string,
      overrides?: Partial<DashboardConfig>
    ): Promise<DashboardConfig | null>;
    /**
     * Get available dashboards for user
     */
    getAvailableDashboards(userId: string, type?: DashboardType): DashboardConfig[];
    /**
     * Get dashboard templates
     */
    getTemplates(type?: DashboardType, role?: SecurityRole, category?: string): DashboardTemplate[];
    /**
     * Get dashboard presets
     */
    getPresets(dashboardType?: DashboardType, layout?: string): DashboardPreset[];
    /**
     * Register default dashboard types with the framework
     */
    private registerDefaultDashboards;
    /**
     * Get framework statistics
     */
    getStatistics(): {
        framework: {
            dashboardCount: number;
            widgetCount: number;
            themeCount: number;
        };
        registry: {
            dashboardCount: number;
            presetCount: number;
            widgetCount: number;
            categoriesByType: Record<DashboardType, number>;
        };
    };
    /**
     * Destroy the factory and cleanup resources
     */
    destroy(): void;
}
/**
 * Default factory instance for convenience
 */
export declare const defaultSecurityDashboardFactory: SecurityDashboardFactory;
/**
 * Utility function to create a dashboard factory with custom options
 */
export declare function createSecurityDashboardFactory(options?: {
    frameworkOptions?: Partial<SecurityDashboardFrameworkOptions>;
    registryOptions?: Partial<RegistryOptions>;
}): SecurityDashboardFactory;
/**
 * Utility function to get supported dashboard types
 */
export declare function getSupportedDashboardTypes(): {
    type: DashboardType;
    name: string;
    description: string;
    targetRoles: SecurityRole[];
}[];
export default SecurityDashboardFactory;
//# sourceMappingURL=index.d.ts.map