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
    constructor(options: {});
    frameworkOptions?: Partial<SecurityDashboardFrameworkOptions>;
    registryOptions?: Partial<RegistryOptions>;
}
//# sourceMappingURL=index.d.ts.map