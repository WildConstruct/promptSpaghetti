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
// Core Framework
export { SecurityDashboardFramework, DashboardType, DashboardTheme, SecurityRole, WidgetCategory } from './SecurityDashboardFramework';
// Dashboard Registry
export { DashboardRegistry } from './DashboardRegistry';
// Dashboard Implementations
export { ExecutiveSecurityDashboard } from './ExecutiveSecurityDashboard';
export { OperationalSecurityDashboard } from './OperationalSecurityDashboard';
export { ComplianceSecurityDashboard, ComplianceFramework, ComplianceStatus } from './ComplianceSecurityDashboard';
/**
 * Security Dashboard Framework Factory
 *
 * Creates and configures a complete security dashboard framework instance
 * with registry, themes, and default dashboard types.
 */
export class SecurityDashboardFactory {
    framework;
    registry;
    constructor(options = {}) {
        // Initialize framework
        this.framework = new SecurityDashboardFramework(options.frameworkOptions);
        // Initialize registry
        this.registry = new DashboardRegistry(options.registryOptions);
        // Register default dashboard types
        this.registerDefaultDashboards();
    }
    /**
     * Get the framework instance
     */
    getFramework() {
        return this.framework;
    }
    /**
     * Get the registry instance
     */
    getRegistry() {
        return this.registry;
    }
    /**
     * Create a dashboard from template
     */
    createDashboard(templateId, userId, overrides) {
        const config = this.registry.createDashboardFromTemplate(templateId, overrides);
        if (!config) {
            return Promise.resolve(null);
        }
        return this.framework.registerDashboard(config, userId)
            .then(success => success ? config : null);
    }
    /**
     * Create a dashboard from preset
     */
    createDashboardFromPreset(presetId, userId, overrides) {
        const config = this.registry.createDashboardFromPreset(presetId, overrides);
        if (!config) {
            return Promise.resolve(null);
        }
        return this.framework.registerDashboard(config, userId)
            .then(success => success ? config : null);
    }
    /**
     * Get available dashboards for user
     */
    getAvailableDashboards(userId, type) {
        return this.framework.listDashboards(userId, type);
    }
    /**
     * Get dashboard templates
     */
    getTemplates(type, role, category) {
        return this.registry.getDashboardTemplates(type, role, category);
    }
    /**
     * Get dashboard presets
     */
    getPresets(dashboardType, layout) {
        return this.registry.getDashboardPresets(dashboardType, layout);
    }
    /**
     * Register default dashboard types with the framework
     */
    registerDefaultDashboards() {
        const templates = this.registry.getDashboardTemplates();
        for (const template of templates) {
            // Create a default configuration from the template
            const config = this.registry.createDashboardFromTemplate(template.id);
            if (config) {
                // Register with framework (using system user)
                this.framework.registerDashboard(config, 'system');
            }
        }
    }
    /**
     * Get framework statistics
     */
    getStatistics() {
        return {
            framework: {
                dashboardCount: this.framework['dashboards'].size,
                widgetCount: this.framework['widgets'].size,
                themeCount: this.framework['themes'].size
            },
            registry: this.registry.getRegistryStats()
        };
    }
    /**
     * Destroy the factory and cleanup resources
     */
    destroy() {
        this.framework.destroy();
        this.registry.clear();
    }
}
/**
 * Default factory instance for convenience
 */
export const defaultSecurityDashboardFactory = new SecurityDashboardFactory({
    frameworkOptions: {
        enableAuditLogging: true,
        enablePerformanceMonitoring: true,
        enableCaching: true,
        defaultTheme: DashboardTheme.CINEMA,
        complianceMode: true
    },
    registryOptions: {
        enableCache: true,
        validateConfigs: true,
        allowCustomDashboards: true,
        enableAuditLogging: true
    }
});
/**
 * Utility function to create a dashboard factory with custom options
 */
export function createSecurityDashboardFactory(options = {}) {
    return new SecurityDashboardFactory(options);
}
/**
 * Utility function to get supported dashboard types
 */
export function getSupportedDashboardTypes() {
    return [
        {
            type: DashboardType.EXECUTIVE,
            name: 'Executive Security Dashboard',
            description: 'High-level security overview for C-level executives',
            targetRoles: [SecurityRole.EXECUTIVE, SecurityRole.SECURITY_ADMIN]
        },
        {
            type: DashboardType.OPERATIONAL,
            name: 'Security Operations Center',
            description: 'Real-time threat monitoring and incident response',
            targetRoles: [SecurityRole.SOC_ANALYST, SecurityRole.SECURITY_ANALYST, SecurityRole.INCIDENT_RESPONDER]
        },
        {
            type: DashboardType.COMPLIANCE,
            name: 'Compliance Management',
            description: 'Regulatory compliance tracking and audit management',
            targetRoles: [SecurityRole.COMPLIANCE_OFFICER, SecurityRole.AUDITOR]
        },
        {
            type: DashboardType.INCIDENT_RESPONSE,
            name: 'Incident Response',
            description: 'Incident investigation and response coordination',
            targetRoles: [SecurityRole.INCIDENT_RESPONDER, SecurityRole.SECURITY_ANALYST]
        },
        {
            type: DashboardType.THREAT_INTELLIGENCE,
            name: 'Threat Intelligence',
            description: 'Advanced threat analysis and intelligence feeds',
            targetRoles: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
        },
        {
            type: DashboardType.VULNERABILITY,
            name: 'Vulnerability Management',
            description: 'Vulnerability assessment and remediation tracking',
            targetRoles: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
        },
        {
            type: DashboardType.ANALYTICS,
            name: 'Security Analytics',
            description: 'Advanced security data analysis and reporting',
            targetRoles: [SecurityRole.SECURITY_ANALYST, SecurityRole.SECURITY_ADMIN]
        },
        {
            type: DashboardType.AUDIT,
            name: 'Security Audit',
            description: 'Security audit trail and forensic analysis',
            targetRoles: [SecurityRole.AUDITOR, SecurityRole.SECURITY_ADMIN]
        }
    ];
}
export default SecurityDashboardFactory;
