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
export var HealthCheckCategory;
(function (HealthCheckCategory) {
    HealthCheckCategory["SYSTEM"] = "system";
    HealthCheckCategory["DATABASE"] = "database";
    HealthCheckCategory["NETWORK"] = "network";
    HealthCheckCategory["STORAGE"] = "storage";
    HealthCheckCategory["MEMORY"] = "memory";
    HealthCheckCategory["SECURITY"] = "security";
    HealthCheckCategory["PERFORMANCE"] = "performance";
    HealthCheckCategory["INTEGRATION"] = "integration";
    HealthCheckCategory["BACKUP"] = "backup";
    HealthCheckCategory["CONFIGURATION"] = "configuration";
    HealthCheckCategory["BUSINESS"] = "business";
    HealthCheckCategory["CUSTOM"] = "custom";
})(HealthCheckCategory || (HealthCheckCategory = {}));
export var HealthCheckPriority;
(function (HealthCheckPriority) {
    HealthCheckPriority["CRITICAL"] = "critical";
    HealthCheckPriority["HIGH"] = "high";
    HealthCheckPriority["MEDIUM"] = "medium";
    HealthCheckPriority["LOW"] = "low";
    HealthCheckPriority["INFORMATIONAL"] = "informational";
})(HealthCheckPriority || (HealthCheckPriority = {}));
export var HealthCheckType;
(function (HealthCheckType) {
    HealthCheckType["HTTP_ENDPOINT"] = "http_endpoint";
    HealthCheckType["DATABASE_QUERY"] = "database_query";
    HealthCheckType["SYSTEM_COMMAND"] = "system_command";
    HealthCheckType["JAVASCRIPT_FUNCTION"] = "javascript_function";
    HealthCheckType["COMPOSITE_CHECK"] = "composite_check";
    HealthCheckType["EXTERNAL_SERVICE"] = "external_service";
    HealthCheckType["FILE_SYSTEM"] = "file_system";
    HealthCheckType["NETWORK_CONNECTIVITY"] = "network_connectivity";
    HealthCheckType["RESOURCE_AVAILABILITY"] = "resource_availability";
})(HealthCheckType || (HealthCheckType = {}));
export var CompositeLogic;
(function (CompositeLogic) {
    CompositeLogic["ALL_PASS"] = "all_pass";
    CompositeLogic["ANY_PASS"] = "any_pass";
    CompositeLogic["MAJORITY_PASS"] = "majority_pass";
    CompositeLogic["WEIGHTED_AVERAGE"] = "weighted_average";
    CompositeLogic["CUSTOM_LOGIC"] = "custom_logic";
})(CompositeLogic || (CompositeLogic = {}));
export var AggregationStrategy;
(function (AggregationStrategy) {
    AggregationStrategy["WORST_STATUS"] = "worst_status";
    AggregationStrategy["BEST_STATUS"] = "best_status";
    AggregationStrategy["AVERAGE_STATUS"] = "average_status";
    AggregationStrategy["WEIGHTED_STATUS"] = "weighted_status";
})(AggregationStrategy || (AggregationStrategy = {}));
export var SensitiveDataPolicy;
(function (SensitiveDataPolicy) {
    SensitiveDataPolicy["NONE"] = "none";
    SensitiveDataPolicy["LOG_SANITIZED"] = "log_sanitized";
    SensitiveDataPolicy["NO_LOGGING"] = "no_logging";
    SensitiveDataPolicy["ENCRYPTED_LOGGING"] = "encrypted_logging";
})(SensitiveDataPolicy || (SensitiveDataPolicy = {}));
export var AuditLevel;
(function (AuditLevel) {
    AuditLevel["NONE"] = "none";
    AuditLevel["BASIC"] = "basic";
    AuditLevel["DETAILED"] = "detailed";
    AuditLevel["FULL"] = "full";
})(AuditLevel || (AuditLevel = {}));
export var TriggerType;
(function (TriggerType) {
    TriggerType["ON_DEMAND"] = "on_demand";
    TriggerType["SCHEDULED"] = "scheduled";
    TriggerType["EVENT_DRIVEN"] = "event_driven";
    TriggerType["DEPENDENCY_CHANGE"] = "dependency_change";
    TriggerType["THRESHOLD_BREACH"] = "threshold_breach";
    TriggerType["SYSTEM_STARTUP"] = "system_startup";
    TriggerType["API_REQUEST"] = "api_request";
})(TriggerType || (TriggerType = {}));
export var RuntimeEnvironment;
(function (RuntimeEnvironment) {
    RuntimeEnvironment["LOCAL"] = "local";
    RuntimeEnvironment["CONTAINER"] = "container";
    RuntimeEnvironment["ISOLATED_PROCESS"] = "isolated_process";
    RuntimeEnvironment["SANDBOX"] = "sandbox";
    RuntimeEnvironment["REMOTE"] = "remote";
})(RuntimeEnvironment || (RuntimeEnvironment = {}));
export var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["SLACK"] = "slack";
    NotificationChannel["WEBHOOK"] = "webhook";
    NotificationChannel["PUSH_NOTIFICATION"] = "push_notification";
    NotificationChannel["DASHBOARD"] = "dashboard";
    NotificationChannel["LOG"] = "log";
})(NotificationChannel || (NotificationChannel = {}));
export var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["DEGRADED"] = "degraded";
    HealthStatus["UNHEALTHY"] = "unhealthy";
    HealthStatus["CRITICAL"] = "critical";
    HealthStatus["UNKNOWN"] = "unknown";
    HealthStatus["TIMEOUT"] = "timeout";
    HealthStatus["ERROR"] = "error";
})(HealthStatus || (HealthStatus = {}));
// ==========================================
// HEALTH CHECK DEFINITION BUILDER
// ==========================================
export class HealthCheckDefinitionBuilder {
    definition = {};
    constructor(id, name) {
        this.definition = {
            id,
            name,
            version: '1.0.0',
            tags: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    description(desc) {
        this.definition.description = desc;
        return this;
    }
    category(cat) {
        this.definition.category = cat;
        return this;
    }
    priority(pri) {
        this.definition.priority = pri;
        return this;
    }
    tags(...tags) {
        this.definition.tags = [...(this.definition.tags || []), ...tags];
        return this;
    }
    httpEndpoint(config) {
        this.definition.config = {
            type: HealthCheckType.HTTP_ENDPOINT,
            endpoint: config,
            parameters: {},
            dependencies: [],
            timeout: config.timeout || 30000,
            retries: { maxAttempts: 3, backoffStrategy: 'exponential', initialDelay: 1000 }
        };
        return this;
    }
    databaseQuery(config) {
        this.definition.config = {
            type: HealthCheckType.DATABASE_QUERY,
            query: config,
            parameters: {},
            dependencies: [],
            timeout: config.timeout,
            retries: { maxAttempts: 2, backoffStrategy: 'linear', initialDelay: 500 }
        };
        return this;
    }
    schedule(cronExpression, timezone = 'UTC') {
        if (!this.definition.execution) {
            this.definition.execution = {
                triggers: [],
                environment: {
                    runtime: RuntimeEnvironment.LOCAL,
                    resources: { maxMemory: 256, maxCpu: 50, maxDiskSpace: 100 },
                    network: {},
                    storage: {}
                },
                isolation: {},
                cleanup: {}
            };
        }
        this.definition.execution.schedule = {
            enabled: true,
            cronExpression,
            timezone,
            maxConcurrentExecutions: 1
        };
        return this;
    }
    alerting(config) {
        this.definition.alerting = {
            enabled: true,
            thresholds: {
                responseTime: { warning: 5000, critical: 10000, unit: 'ms', evaluationWindow: 300, evaluationMethod: 'average' },
                errorRate: { warning: 5, critical: 10, unit: '%', evaluationWindow: 300, evaluationMethod: 'average' },
                availability: { warning: 95, critical: 90, unit: '%', evaluationWindow: 300, evaluationMethod: 'average' },
                custom: {}
            },
            notifications: [],
            escalation: { enabled: false, levels: [], autoEscalationDelay: 30, maxEscalationLevel: 3 },
            suppression: { enabled: false, rules: [], maintenanceWindows: [] },
            ...config
        };
        return this;
    }
    validation(rules) {
        this.definition.validation = {
            input: { required: [], customValidators: [] },
            output: { expectedFormat: 'json', successConditions: [], warningConditions: [], errorConditions: [] },
            runtime: { maxExecutionTime: 30000, networkAccessRequired: false, fileSystemAccessRequired: false, privilegedAccessRequired: false },
            security: {
                requiresAuthentication: false,
                requiredPermissions: [],
                sensitiveDataHandling: SensitiveDataPolicy.NONE,
                auditLevel: AuditLevel.BASIC
            },
            ...rules
        };
        return this;
    }
    parameter(name, definition) {
        if (!this.definition.config) {
            throw new Error('Configuration must be set before adding parameters');
        }
        this.definition.config.parameters[name] = definition;
        return this;
    }
    dependency(...checkIds) {
        if (!this.definition.config) {
            throw new Error('Configuration must be set before adding dependencies');
        }
        this.definition.config.dependencies.push(...checkIds);
        return this;
    }
    build() {
        // Validate required fields
        const required = ['id', 'name', 'description', 'category', 'priority', 'config', 'validation'];
        for (const field of required) {
            if (!this.definition[field]) {
                throw new Error(`Required field '${field}' is missing`);
            }
        }
        return this.definition;
    }
}
export var ComparisonOperator;
(function (ComparisonOperator) {
    ComparisonOperator["EQUALS"] = "equals";
    ComparisonOperator["NOT_EQUALS"] = "not_equals";
    ComparisonOperator["GREATER_THAN"] = "greater_than";
    ComparisonOperator["GREATER_THAN_OR_EQUAL"] = "greater_than_or_equal";
    ComparisonOperator["LESS_THAN"] = "less_than";
    ComparisonOperator["LESS_THAN_OR_EQUAL"] = "less_than_or_equal";
    ComparisonOperator["CONTAINS"] = "contains";
    ComparisonOperator["NOT_CONTAINS"] = "not_contains";
    ComparisonOperator["MATCHES"] = "matches";
    ComparisonOperator["NOT_MATCHES"] = "not_matches";
    ComparisonOperator["IN"] = "in";
    ComparisonOperator["NOT_IN"] = "not_in";
})(ComparisonOperator || (ComparisonOperator = {}));
// ==========================================
// UTILITY FUNCTIONS
// ==========================================
export class HealthCheckDefinitionValidator {
    static validate(definition) {
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!definition.id || definition.id.length < 3) {
            errors.push('Health check ID must be at least 3 characters long');
        }
        if (!definition.name || definition.name.length < 5) {
            errors.push('Health check name must be at least 5 characters long');
        }
        // Configuration validation
        if (!definition.config) {
            errors.push('Health check configuration is required');
        }
        else {
            if (definition.config.timeout < 1000) {
                warnings.push('Timeout less than 1 second may cause false negatives');
            }
            if (definition.config.timeout > 300000) {
                warnings.push('Timeout greater than 5 minutes may impact system performance');
            }
        }
        // Validation rules validation
        if (definition.validation) {
            if (definition.validation.runtime.maxExecutionTime > definition.config.timeout) {
                errors.push('Runtime max execution time cannot exceed configuration timeout');
            }
        }
        // Schedule validation
        if (definition.execution?.schedule?.cronExpression) {
            if (!this.isValidCronExpression(definition.execution.schedule.cronExpression)) {
                errors.push('Invalid cron expression format');
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: this.calculateValidationScore(errors, warnings)
        };
    }
    static isValidCronExpression(expression) {
        // Basic cron expression validation (simplified)
        const parts = expression.trim().split(/\s+/);
        return parts.length === 5 || parts.length === 6;
    }
    static calculateValidationScore(errors, warnings) {
        const baseScore = 100;
        const errorDeduction = errors.length * 20;
        const warningDeduction = warnings.length * 5;
        return Math.max(0, baseScore - errorDeduction - warningDeduction);
    }
}
// ==========================================
// EXAMPLE DEFINITIONS
// ==========================================
export const createExampleHealthChecks = () => {
    // Database connectivity check
    const dbCheck = new HealthCheckDefinitionBuilder('db_connectivity', 'Database Connectivity Check')
        .description('Monitors database connection health and response time')
        .category(HealthCheckCategory.DATABASE)
        .priority(HealthCheckPriority.CRITICAL)
        .tags('database', 'connectivity', 'performance')
        .databaseQuery({
        database: 'primary',
        query: 'SELECT 1 as health_check',
        timeout: 5000,
        expectedResults: { exactRows: 1, columns: ['health_check'] }
    })
        .schedule('*/5 * * * *') // Every 5 minutes
        .alerting({
        enabled: true,
        thresholds: {
            responseTime: { warning: 2000, critical: 5000, unit: 'ms', evaluationWindow: 300, evaluationMethod: 'average' },
            errorRate: { warning: 1, critical: 5, unit: '%', evaluationWindow: 300, evaluationMethod: 'average' },
            availability: { warning: 99, critical: 95, unit: '%', evaluationWindow: 300, evaluationMethod: 'average' },
            custom: {}
        }
    })
        .build();
    // API endpoint check
    const apiCheck = new HealthCheckDefinitionBuilder('api_health', 'API Health Check')
        .description('Monitors primary API endpoint availability and performance')
        .category(HealthCheckCategory.INTEGRATION)
        .priority(HealthCheckPriority.HIGH)
        .tags('api', 'endpoint', 'availability')
        .httpEndpoint({
        url: '/api/health',
        method: 'GET',
        expectedStatusCodes: [200],
        timeout: 10000,
        responseValidation: {
            contentType: ['application/json'],
            jsonPath: [
                { path: '$.status', expectedValue: 'healthy', required: true },
                { path: '$.timestamp', expectedType: 'string', required: true }
            ]
        }
    })
        .schedule('*/2 * * * *') // Every 2 minutes
        .validation({
        output: {
            expectedFormat: 'json',
            successConditions: [
                { field: 'status', operator: ComparisonOperator.EQUALS, value: 'healthy', description: 'API reports healthy status' }
            ]
        }
    })
        .build();
    return [dbCheck, apiCheck];
};
