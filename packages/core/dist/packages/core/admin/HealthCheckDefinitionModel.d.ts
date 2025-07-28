/**
 * Health Check Definition Model - Epic 17.4.5
 *
 * Comprehensive framework for defining, validating, and managing health check
 * configurations. Provides a flexible system for creating custom health checks
 * with advanced validation, scheduling, and alerting capabilities.
 *
 * Task: E17-1753114397253-2E1DFD - Build system diagnostics
 * Epic: 17 - Backstage Admin Controls (Story 17.4.5 - Health Check System)
 */
export interface HealthCheckDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    category: HealthCheckCategory;
    priority: HealthCheckPriority;
    tags: string;
    config: HealthCheckConfig;
    validation: ValidationRules;
    execution: ExecutionConfig;
    alerting: AlertingConfig;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    deprecated?: boolean;
    replacedBy?: string;
}
export declare enum HealthCheckCategory {
    SYSTEM = "system",
    DATABASE = "database",
    NETWORK = "network",
    STORAGE = "storage",
    MEMORY = "memory",
    SECURITY = "security",
    PERFORMANCE = "performance",
    INTEGRATION = "integration",
    BACKUP = "backup",
    CONFIGURATION = "configuration",
    BUSINESS = "business",
    CUSTOM = "custom",
    export,
    enum,
    HealthCheckPriority
}
//# sourceMappingURL=HealthCheckDefinitionModel.d.ts.map