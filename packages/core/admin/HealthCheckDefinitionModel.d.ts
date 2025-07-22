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
    tags: string[];
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
    CUSTOM = "custom"
}
export declare enum HealthCheckPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFORMATIONAL = "informational"
}
export interface HealthCheckConfig {
    type: HealthCheckType;
    endpoint?: EndpointConfig;
    query?: QueryConfig;
    script?: ScriptConfig;
    composite?: CompositeConfig;
    parameters: Record<string, ParameterDefinition>;
    dependencies: string[];
    timeout: number;
    retries: RetryConfig;
}
export declare enum HealthCheckType {
    HTTP_ENDPOINT = "http_endpoint",
    DATABASE_QUERY = "database_query",
    SYSTEM_COMMAND = "system_command",
    JAVASCRIPT_FUNCTION = "javascript_function",
    COMPOSITE_CHECK = "composite_check",
    EXTERNAL_SERVICE = "external_service",
    FILE_SYSTEM = "file_system",
    NETWORK_CONNECTIVITY = "network_connectivity",
    RESOURCE_AVAILABILITY = "resource_availability"
}
export interface EndpointConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
    headers?: Record<string, string>;
    body?: string;
    expectedStatusCodes: number[];
    responseValidation?: ResponseValidation;
    authentication?: AuthenticationConfig;
}
export interface QueryConfig {
    connectionString?: string;
    database: string;
    query: string;
    expectedResults?: QueryExpectation;
    timeout: number;
}
export interface ScriptConfig {
    language: 'javascript' | 'shell' | 'python' | 'powershell';
    script: string;
    environment?: Record<string, string>;
    workingDirectory?: string;
    expectedExitCode: number;
}
export interface CompositeConfig {
    checks: string[];
    logic: CompositeLogic;
    aggregation: AggregationStrategy;
}
export declare enum CompositeLogic {
    ALL_PASS = "all_pass",
    ANY_PASS = "any_pass",
    MAJORITY_PASS = "majority_pass",
    WEIGHTED_AVERAGE = "weighted_average",
    CUSTOM_LOGIC = "custom_logic"
}
export declare enum AggregationStrategy {
    WORST_STATUS = "worst_status",
    BEST_STATUS = "best_status",
    AVERAGE_STATUS = "average_status",
    WEIGHTED_STATUS = "weighted_status"
}
export interface ParameterDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    required: boolean;
    defaultValue?: any;
    validation?: ParameterValidation;
    sensitive?: boolean;
}
export interface ParameterValidation {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enumValues?: string[];
    minValue?: number;
    maxValue?: number;
    customValidator?: string;
}
export interface ValidationRules {
    input: InputValidation;
    output: OutputValidation;
    runtime: RuntimeValidation;
    security: SecurityValidation;
}
export interface InputValidation {
    required: string[];
    schema?: Record<string, any>;
    customValidators: CustomValidator[];
}
export interface OutputValidation {
    expectedFormat: 'json' | 'text' | 'xml' | 'binary';
    schema?: Record<string, any>;
    successConditions: SuccessCondition[];
    warningConditions: WarningCondition[];
    errorConditions: ErrorCondition[];
}
export interface RuntimeValidation {
    maxExecutionTime: number;
    memoryLimit?: number;
    cpuLimit?: number;
    networkAccessRequired: boolean;
    fileSystemAccessRequired: boolean;
    privilegedAccessRequired: boolean;
}
export interface SecurityValidation {
    allowedOrigins?: string[];
    requiresAuthentication: boolean;
    requiredPermissions: string[];
    sensitiveDataHandling: SensitiveDataPolicy;
    auditLevel: AuditLevel;
}
export declare enum SensitiveDataPolicy {
    NONE = "none",
    LOG_SANITIZED = "log_sanitized",
    NO_LOGGING = "no_logging",
    ENCRYPTED_LOGGING = "encrypted_logging"
}
export declare enum AuditLevel {
    NONE = "none",
    BASIC = "basic",
    DETAILED = "detailed",
    FULL = "full"
}
export interface ExecutionConfig {
    schedule?: ScheduleConfig;
    triggers: TriggerConfig[];
    environment: ExecutionEnvironment;
    isolation: IsolationConfig;
    cleanup: CleanupConfig;
}
export interface ScheduleConfig {
    enabled: boolean;
    cronExpression?: string;
    interval?: number;
    timezone: string;
    maxConcurrentExecutions: number;
}
export interface TriggerConfig {
    type: TriggerType;
    condition: string;
    parameters?: Record<string, any>;
}
export declare enum TriggerType {
    ON_DEMAND = "on_demand",
    SCHEDULED = "scheduled",
    EVENT_DRIVEN = "event_driven",
    DEPENDENCY_CHANGE = "dependency_change",
    THRESHOLD_BREACH = "threshold_breach",
    SYSTEM_STARTUP = "system_startup",
    API_REQUEST = "api_request"
}
export interface ExecutionEnvironment {
    runtime: RuntimeEnvironment;
    resources: ResourceLimits;
    network: NetworkConfig;
    storage: StorageConfig;
}
export declare enum RuntimeEnvironment {
    LOCAL = "local",
    CONTAINER = "container",
    ISOLATED_PROCESS = "isolated_process",
    SANDBOX = "sandbox",
    REMOTE = "remote"
}
export interface ResourceLimits {
    maxMemory: number;
    maxCpu: number;
    maxDiskSpace: number;
    maxNetworkBandwidth?: number;
}
export interface AlertingConfig {
    enabled: boolean;
    thresholds: AlertThresholds;
    notifications: NotificationConfig[];
    escalation: EscalationConfig;
    suppression: SuppressionConfig;
}
export interface AlertThresholds {
    responseTime: ThresholdConfig;
    errorRate: ThresholdConfig;
    availability: ThresholdConfig;
    custom: Record<string, ThresholdConfig>;
}
export interface ThresholdConfig {
    warning: number;
    critical: number;
    unit: string;
    evaluationWindow: number;
    evaluationMethod: 'average' | 'max' | 'min' | 'percentile';
}
export interface NotificationConfig {
    channel: NotificationChannel;
    recipients: string[];
    template: string;
    conditions: NotificationCondition[];
    rateLimit?: RateLimitConfig;
}
export declare enum NotificationChannel {
    EMAIL = "email",
    SMS = "sms",
    SLACK = "slack",
    WEBHOOK = "webhook",
    PUSH_NOTIFICATION = "push_notification",
    DASHBOARD = "dashboard",
    LOG = "log"
}
export interface NotificationCondition {
    severity: 'info' | 'warning' | 'error' | 'critical';
    repeatInterval?: number;
    maxRepeats?: number;
}
export interface EscalationConfig {
    enabled: boolean;
    levels: EscalationLevel[];
    autoEscalationDelay: number;
    maxEscalationLevel: number;
}
export interface EscalationLevel {
    level: number;
    recipients: string[];
    notificationChannel: NotificationChannel;
    requiresAcknowledgment: boolean;
    timeout: number;
}
export interface SuppressionConfig {
    enabled: boolean;
    rules: SuppressionRule[];
    maintenanceWindows: MaintenanceWindow[];
}
export interface SuppressionRule {
    condition: string;
    duration: number;
    reason: string;
}
export interface MaintenanceWindow {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    timezone: string;
    suppressAll: boolean;
    suppressedChecks?: string[];
}
export interface HealthCheckResult {
    checkId: string;
    executionId: string;
    timestamp: Date;
    duration: number;
    status: HealthStatus;
    score: number;
    message: string;
    details: ResultDetails;
    metrics: ResultMetrics;
    metadata: ExecutionMetadata;
}
export declare enum HealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy",
    CRITICAL = "critical",
    UNKNOWN = "unknown",
    TIMEOUT = "timeout",
    ERROR = "error"
}
export interface ResultDetails {
    summary: string;
    findings: Finding[];
    recommendations: string[];
    affectedComponents: string[];
    relatedChecks: string[];
}
export interface Finding {
    type: 'info' | 'warning' | 'error' | 'critical';
    category: string;
    description: string;
    impact: string;
    remediation?: string;
    evidence?: Record<string, any>;
}
export interface ResultMetrics {
    responseTime?: number;
    throughput?: number;
    errorCount?: number;
    successRate?: number;
    availability?: number;
    custom: Record<string, number>;
}
export interface ExecutionMetadata {
    hostname: string;
    environment: string;
    version: string;
    userId?: string;
    correlationId?: string;
    parentExecutionId?: string;
    retryAttempt: number;
}
export declare class HealthCheckDefinitionBuilder {
    private definition;
    constructor(id: string, name: string);
    description(desc: string): this;
    category(cat: HealthCheckCategory): this;
    priority(pri: HealthCheckPriority): this;
    tags(...tags: string[]): this;
    httpEndpoint(config: EndpointConfig): this;
    databaseQuery(config: QueryConfig): this;
    schedule(cronExpression: string, timezone?: string): this;
    alerting(config: Partial<AlertingConfig>): this;
    validation(rules: Partial<ValidationRules>): this;
    parameter(name: string, definition: ParameterDefinition): this;
    dependency(...checkIds: string[]): this;
    build(): HealthCheckDefinition;
}
export interface CustomValidator {
    name: string;
    description: string;
    function: string;
    parameters: string[];
}
export interface SuccessCondition {
    field: string;
    operator: ComparisonOperator;
    value: any;
    description: string;
}
export interface WarningCondition extends SuccessCondition {
}
export interface ErrorCondition extends SuccessCondition {
}
export declare enum ComparisonOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    GREATER_THAN = "greater_than",
    GREATER_THAN_OR_EQUAL = "greater_than_or_equal",
    LESS_THAN = "less_than",
    LESS_THAN_OR_EQUAL = "less_than_or_equal",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    MATCHES = "matches",
    NOT_MATCHES = "not_matches",
    IN = "in",
    NOT_IN = "not_in"
}
export interface ResponseValidation {
    contentType?: string[];
    bodyContains?: string[];
    bodyNotContains?: string[];
    headers?: Record<string, string>;
    jsonPath?: JsonPathValidation[];
}
export interface JsonPathValidation {
    path: string;
    expectedValue?: any;
    expectedType?: string;
    required: boolean;
}
export interface QueryExpectation {
    minRows?: number;
    maxRows?: number;
    exactRows?: number;
    columns?: string[];
    constraints?: QueryConstraint[];
}
export interface QueryConstraint {
    column: string;
    operator: ComparisonOperator;
    value: any;
}
export interface AuthenticationConfig {
    type: 'basic' | 'bearer' | 'api_key' | 'oauth2' | 'custom';
    credentials: Record<string, string>;
}
export interface RetryConfig {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    initialDelay: number;
    maxDelay?: number;
    retryConditions?: RetryCondition[];
}
export interface RetryCondition {
    statusCode?: number;
    errorType?: string;
    condition?: string;
}
export interface NetworkConfig {
    allowedHosts?: string[];
    blockedHosts?: string[];
    proxy?: ProxyConfig;
    maxConnections?: number;
}
export interface ProxyConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
}
export interface StorageConfig {
    tempDirectory?: string;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    cleanupAfterExecution: boolean;
}
export interface IsolationConfig {
    sandboxed: boolean;
    allowedSystemCalls?: string[];
    restrictedDirectories?: string[];
    resourceQuota?: ResourceQuota;
}
export interface ResourceQuota {
    maxFileHandles: number;
    maxProcesses: number;
    maxThreads: number;
    maxSocketConnections: number;
}
export interface CleanupConfig {
    enabled: boolean;
    actions: CleanupAction[];
    timeout: number;
}
export interface CleanupAction {
    type: 'delete_files' | 'close_connections' | 'kill_processes' | 'custom';
    target?: string;
    customScript?: string;
}
export interface RateLimitConfig {
    maxNotifications: number;
    timeWindow: number;
    burstAllowed: boolean;
}
export declare class HealthCheckDefinitionValidator {
    static validate(definition: HealthCheckDefinition): ValidationResult;
    private static isValidCronExpression;
    private static calculateValidationScore;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
}
export declare const createExampleHealthChecks: () => HealthCheckDefinition[];
//# sourceMappingURL=HealthCheckDefinitionModel.d.ts.map