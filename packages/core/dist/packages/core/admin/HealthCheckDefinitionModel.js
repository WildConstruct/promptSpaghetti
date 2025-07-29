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
    HealthCheckCategory[HealthCheckCategory["export"] = void 0] = "export";
    HealthCheckCategory[HealthCheckCategory["enum"] = void 0] = "enum";
    HealthCheckCategory[HealthCheckCategory["HealthCheckPriority"] = void 0] = "HealthCheckPriority";
})(HealthCheckCategory || (HealthCheckCategory = {}));
{
    CRITICAL = 'critical',
        HIGH = 'high',
        MEDIUM = 'medium',
        LOW = 'low',
        INFORMATIONAL = 'informational';
    export let HealthCheckType;
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
        // ==========================================
        // CONFIGURATION INTERFACES
        // ==========================================
        HealthCheckType[HealthCheckType["export"] = void 0] = "export";
        HealthCheckType[HealthCheckType["interface"] = void 0] = "interface";
        HealthCheckType[HealthCheckType["EndpointConfig"] = void 0] = "EndpointConfig";
    })(HealthCheckType || (HealthCheckType = {}));
    {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
        headers ?  : Record;
        body ?  : string;
        expectedStatusCodes: number;
        responseValidation ?  : ResponseValidation;
        authentication ?  : AuthenticationConfig;
        timeout ?  : number;
    }
    export let CompositeLogic;
    (function (CompositeLogic) {
        CompositeLogic["ALL_PASS"] = "all_pass";
        CompositeLogic["ANY_PASS"] = "any_pass";
        CompositeLogic["MAJORITY_PASS"] = "majority_pass";
        CompositeLogic["WEIGHTED_AVERAGE"] = "weighted_average";
        CompositeLogic["CUSTOM_LOGIC"] = "custom_logic";
        CompositeLogic[CompositeLogic["export"] = void 0] = "export";
        CompositeLogic[CompositeLogic["enum"] = void 0] = "enum";
        CompositeLogic[CompositeLogic["AggregationStrategy"] = void 0] = "AggregationStrategy";
    })(CompositeLogic || (CompositeLogic = {}));
    {
        WORST_STATUS = 'worst_status',
            BEST_STATUS = 'best_status',
            AVERAGE_STATUS = 'average_status',
            WEIGHTED_STATUS = 'weighted_status';
        export let SensitiveDataPolicy;
        (function (SensitiveDataPolicy) {
            SensitiveDataPolicy["NONE"] = "none";
            SensitiveDataPolicy["LOG_SANITIZED"] = "log_sanitized";
            SensitiveDataPolicy["NO_LOGGING"] = "no_logging";
            SensitiveDataPolicy["ENCRYPTED_LOGGING"] = "encrypted_logging";
            SensitiveDataPolicy[SensitiveDataPolicy["export"] = void 0] = "export";
            SensitiveDataPolicy[SensitiveDataPolicy["enum"] = void 0] = "enum";
            SensitiveDataPolicy[SensitiveDataPolicy["AuditLevel"] = void 0] = "AuditLevel";
        })(SensitiveDataPolicy || (SensitiveDataPolicy = {}));
        {
            NONE = 'none',
                BASIC = 'basic',
                DETAILED = 'detailed',
                FULL = 'full';
            export let TriggerType;
            (function (TriggerType) {
                TriggerType["ON_DEMAND"] = "on_demand";
                TriggerType["SCHEDULED"] = "scheduled";
                TriggerType["EVENT_DRIVEN"] = "event_driven";
                TriggerType["DEPENDENCY_CHANGE"] = "dependency_change";
                TriggerType["THRESHOLD_BREACH"] = "threshold_breach";
                TriggerType["SYSTEM_STARTUP"] = "system_startup";
                TriggerType["API_REQUEST"] = "api_request";
                TriggerType[TriggerType["export"] = void 0] = "export";
                TriggerType[TriggerType["interface"] = void 0] = "interface";
                TriggerType[TriggerType["ExecutionEnvironment"] = void 0] = "ExecutionEnvironment";
            })(TriggerType || (TriggerType = {}));
            {
                runtime: RuntimeEnvironment;
                resources: ResourceLimits;
                network: NetworkConfig;
                storage: StorageConfig;
            }
            export let RuntimeEnvironment;
            (function (RuntimeEnvironment) {
                RuntimeEnvironment["LOCAL"] = "local";
                RuntimeEnvironment["CONTAINER"] = "container";
                RuntimeEnvironment["ISOLATED_PROCESS"] = "isolated_process";
                RuntimeEnvironment["SANDBOX"] = "sandbox";
                RuntimeEnvironment["REMOTE"] = "remote";
                RuntimeEnvironment[RuntimeEnvironment["export"] = void 0] = "export";
                RuntimeEnvironment[RuntimeEnvironment["interface"] = void 0] = "interface";
                RuntimeEnvironment[RuntimeEnvironment["ResourceLimits"] = void 0] = "ResourceLimits";
            })(RuntimeEnvironment || (RuntimeEnvironment = {}));
            {
                maxMemory: number; // MB,
                maxCpu: number; // percentage,
                maxDiskSpace: number; // MB,
                maxNetworkBandwidth ?  : number; // Mbps,
                // ==========================================
                // ALERTING AND NOTIFICATIONS
                // ==========================================
            }
            export let NotificationChannel;
            (function (NotificationChannel) {
                NotificationChannel["EMAIL"] = "email";
                NotificationChannel["SMS"] = "sms";
                NotificationChannel["SLACK"] = "slack";
                NotificationChannel["WEBHOOK"] = "webhook";
                NotificationChannel["PUSH_NOTIFICATION"] = "push_notification";
                NotificationChannel["DASHBOARD"] = "dashboard";
                NotificationChannel["LOG"] = "log";
                NotificationChannel[NotificationChannel["export"] = void 0] = "export";
                NotificationChannel[NotificationChannel["interface"] = void 0] = "interface";
                NotificationChannel[NotificationChannel["NotificationCondition"] = void 0] = "NotificationCondition";
            })(NotificationChannel || (NotificationChannel = {}));
            {
                severity: 'info' | 'warning' | 'error' | 'critical';
                repeatInterval ?  : number; // minutes,
                maxRepeats ?  : number;
            }
            export let HealthStatus;
            (function (HealthStatus) {
                HealthStatus["HEALTHY"] = "healthy";
                HealthStatus["DEGRADED"] = "degraded";
                HealthStatus["UNHEALTHY"] = "unhealthy";
                HealthStatus["CRITICAL"] = "critical";
                HealthStatus["UNKNOWN"] = "unknown";
                HealthStatus["TIMEOUT"] = "timeout";
                HealthStatus["ERROR"] = "error";
                HealthStatus[HealthStatus["export"] = void 0] = "export";
                HealthStatus[HealthStatus["interface"] = void 0] = "interface";
                HealthStatus[HealthStatus["ResultDetails"] = void 0] = "ResultDetails";
            })(HealthStatus || (HealthStatus = {}));
            {
                summary: string;
                findings: Finding;
                recommendations: string;
                affectedComponents: string;
                relatedChecks: string;
            }
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
                        updatedAt: new Date(),
                    };
                    description(desc, string);
                    this;
                    {
                        this.definition.description = desc;
                        return this;
                        category(cat, HealthCheckCategory);
                        this;
                        {
                            this.definition.category = cat;
                            return this;
                            priority(pri, HealthCheckPriority);
                            this;
                            {
                                this.definition.priority = pri;
                                return this;
                                tags(...tags, string);
                                this;
                                {
                                    this.definition.tags = [...(this.definition.tags || []), ...tags];
                                    return this;
                                    httpEndpoint(config, EndpointConfig);
                                    this;
                                    {
                                        this.definition.config = {
                                            type: HealthCheckType.HTTP_ENDPOINT,
                                            endpoint: config,
                                            parameters: {},
                                            dependencies: [],
                                            timeout: config.timeout || 30000,
                                            retries: { maxAttempts: 3, backoffStrategy: 'exponential', initialDelay: 1000 }
                                        };
                                        return this;
                                        databaseQuery(config, QueryConfig);
                                        this;
                                        {
                                            this.definition.config = {
                                                type: HealthCheckType.DATABASE_QUERY,
                                                query: config,
                                                parameters: {},
                                                dependencies: [],
                                                timeout: config.timeout,
                                                retries: { maxAttempts: 2, backoffStrategy: 'linear', initialDelay: 500 }
                                            };
                                            return this;
                                            schedule(cronExpression, string, timezone = 'UTC');
                                            this;
                                            {
                                                if (!this.definition.execution) {
                                                    this.definition.execution = {
                                                        triggers: [],
                                                        environment: {
                                                            runtime: RuntimeEnvironment.LOCAL,
                                                            resources: { maxMemory: 256, maxCpu: 50, maxDiskSpace: 100 },
                                                            network: {},
                                                            storage: {
                                                                cleanupAfterExecution: true,
                                                            },
                                                            isolation: {
                                                                sandboxed: false,
                                                            },
                                                            cleanup: {
                                                                enabled: true,
                                                                actions: [],
                                                                timeout: 5000,
                                                            },
                                                            this: .definition.execution.schedule = {
                                                                enabled: true,
                                                                cronExpression,
                                                                timezone,
                                                                maxConcurrentExecutions: 1,
                                                            },
                                                            return: this,
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
                                                                validation(rules, (Partial));
                                                                this;
                                                                {
                                                                    this.definition.validation = {
                                                                        input: { required: [], customValidators: [] },
                                                                        output: { expectedFormat: 'json', successConditions: [], warningConditions: [], errorConditions: [] },
                                                                        runtime: { maxExecutionTime: 30000, networkAccessRequired: false, fileSystemAccessRequired: false, privilegedAccessRequired: false },
                                                                        security: {
                                                                            requiresAuthentication: false,
                                                                            requiredPermissions: [],
                                                                            sensitiveDataHandling: SensitiveDataPolicy.NONE,
                                                                            auditLevel: AuditLevel.BASIC,
                                                                        },
                                                                        ...rules
                                                                    };
                                                                    return this;
                                                                    parameter(name, string, definition, ParameterDefinition);
                                                                    this;
                                                                    {
                                                                        if (!this.definition.config) {
                                                                            throw new Error('Configuration must be set before adding parameters');
                                                                            this.definition.config.parameters[name] = definition;
                                                                            return this;
                                                                            dependency(...checkIds, string);
                                                                            this;
                                                                            {
                                                                                if (!this.definition.config) {
                                                                                    throw new Error('Configuration must be set before adding dependencies');
                                                                                    this.definition.config.dependencies.push(...checkIds);
                                                                                    return this;
                                                                                    build();
                                                                                    HealthCheckDefinition;
                                                                                    {
                                                                                        // Validate required fields
                                                                                        const required = ['id', 'name', 'description', 'category', 'priority', 'config', 'validation'];
                                                                                        for (const field of required) {
                                                                                            if (!this.definition[field]) {
                                                                                                throw new Error(`Required field '${field}' is missing`);
                                                                                            }
                                                                                            return this.definition;
                                                                                            export let ComparisonOperator;
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
                                                                                                ComparisonOperator[ComparisonOperator["export"] = void 0] = "export";
                                                                                                ComparisonOperator[ComparisonOperator["interface"] = void 0] = "interface";
                                                                                                ComparisonOperator[ComparisonOperator["ResponseValidation"] = void 0] = "ResponseValidation";
                                                                                            })(ComparisonOperator || (ComparisonOperator = {}));
                                                                                            {
                                                                                                contentType ?  : string;
                                                                                                bodyContains ?  : string;
                                                                                                bodyNotContains ?  : string;
                                                                                                headers ?  : Record;
                                                                                                jsonPath ?  : JsonPathValidation;
                                                                                            }
                                                                                            export class HealthCheckDefinitionValidator {
                                                                                                static validate(definition) {
                                                                                                    const errors = [];
                                                                                                    const warnings = [];
                                                                                                    // Basic validation
                                                                                                    if (!definition.id || definition.id.length < 3) {
                                                                                                        errors.push('Health check ID must be at least 3 characters long');
                                                                                                        if (!definition.name || definition.name.length < 5) {
                                                                                                            errors.push('Health check name must be at least 5 characters long');
                                                                                                            // Configuration validation
                                                                                                            if (!definition.config) {
                                                                                                                errors.push('Health check configuration is required');
                                                                                                            }
                                                                                                            else {
                                                                                                                if (definition.config.timeout < 1000) {
                                                                                                                    warnings.push('Timeout less than 1 second may cause false negatives');
                                                                                                                    if (definition.config.timeout > 300000) {
                                                                                                                        warnings.push('Timeout greater than 5 minutes may impact system performance');
                                                                                                                        // Validation rules validation
                                                                                                                        if (definition.validation) {
                                                                                                                            if (definition.validation.runtime.maxExecutionTime > definition.config.timeout) {
                                                                                                                                errors.push('Runtime max execution time cannot exceed configuration timeout');
                                                                                                                                // Schedule validation
                                                                                                                                if (definition.execution?.schedule?.cronExpression) {
                                                                                                                                    if (!this.isValidCronExpression(definition.execution.schedule.cronExpression)) {
                                                                                                                                        errors.push('Invalid cron expression format');
                                                                                                                                        return {
                                                                                                                                            isValid: errors.length === 0,
                                                                                                                                            errors,
                                                                                                                                            warnings,
                                                                                                                                            score: this.calculateValidationScore(errors, warnings),
                                                                                                                                        };
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
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
                                                                                                    // ==========================================
                                                                                                    // EXAMPLE DEFINITIONS
                                                                                                    // ==========================================
                                                                                                    // API endpoint check
                                                                                                    const apiCheck = new HealthCheckDefinitionBuilder('api_health', 'API Health Check');
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            : 
                                                                .description('Monitors primary API endpoint availability and performance')
                                                                .category(HealthCheckCategory.INTEGRATION)
                                                                .priority(HealthCheckPriority.HIGH)
                                                                .tags('api', 'endpoint', 'availability')
                                                                .httpEndpoint({}),
                                                            url: '/api/health',
                                                            method: 'GET',
                                                            expectedStatusCodes: [200],
                                                            timeout: 10000,
                                                            responseValidation: {
                                                                contentType: ['application/json'],
                                                                jsonPath: [,
                                                                    { path: '$.status', expectedValue: 'healthy', required: true },
                                                                    { path: '$.timestamp', expectedType: 'string', required: true }
                                                                ]
                                                            }
                                                                .schedule('*/2 * * * *') // Every 2 minutes
                                                                .validation({}),
                                                            output: {
                                                                expectedFormat: 'json',
                                                                successConditions: [,
                                                                    { field: 'status', operator: ComparisonOperator.EQUALS, value: 'healthy', description: 'API reports healthy status' }
                                                                ],
                                                                warningConditions: [],
                                                                errorConditions: []
                                                            },
                                                            runtime: {
                                                                maxExecutionTime: 8000,
                                                                networkAccessRequired: true,
                                                                fileSystemAccessRequired: false,
                                                                privilegedAccessRequired: false,
                                                            }
                                                                .build(),
                                                            return: [dbCheck, apiCheck]
                                                        }
                                                    };
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
