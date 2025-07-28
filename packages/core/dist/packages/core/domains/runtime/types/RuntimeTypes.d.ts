/**
 * Runtime Domain Types
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Type definitions for the runtime execution domain
 */
export * from '../../../runtime';
export * from '../../../runtime/advanced';
export interface RuntimeDomainState {
    executionQueue: ExecutionTask;
    activeExecutions: Map<string, ExecutionInstance>;
    nodeRegistry: Map<string, NodeDefinition>;
    executionHistory: ExecutionRecord;
    performanceMetrics: RuntimeMetrics;
    config: RuntimeConfig;
    error: string | null;
    loading: boolean;
}
export interface ExecutionTask {
    id: string;
    graphId: string;
    graph: Graph;
    seeds: number;
    priority: ExecutionPriority;
    context: ExecutionContext;
    options: ExecutionOptions;
    status: TaskStatus;
    createdAt: Date;
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    userId?: string;
}
export type ExecutionPriority = 'low' | 'normal' | 'high' | 'critical';
export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface ExecutionInstance {
    taskId: string;
    executionId: string;
    currentNode: string | null;
    processedNodes: Set<string>;
    results: Map<string, any>;
    errors: ExecutionError;
    warnings: ExecutionWarning;
    startTime: number;
    metrics: ExecutionMetrics;
    cancellationToken: AbortController;
}
export interface ExecutionOptions {
    maxExecutionTime?: number;
    enableProfiling?: boolean;
    enableCaching?: boolean;
    debugMode?: boolean;
    parallelExecution?: boolean;
    validateInputs?: boolean;
    validateOutputs?: boolean;
    logLevel?: LogLevel;
}
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
export interface ExecutionError {
    nodeId: string;
    type: ErrorType;
    message: string;
    details?: any;
    timestamp: Date;
    stackTrace?: string;
}
export interface ExecutionWarning {
    nodeId: string;
    type: WarningType;
    message: string;
    details?: any;
    timestamp: Date;
}
export type ErrorType = 'validation_error' | 'runtime_error' | 'timeout_error' | 'memory_error' | 'network_error' | 'security_error' | 'configuration_error';
export type WarningType = 'performance_warning' | 'deprecation_warning' | 'validation_warning' | 'resource_warning' | 'security_warning';
export interface ExecutionMetrics {
    totalTime: number;
    nodeExecutionTimes: Map<string, number>;
    memoryUsage: number;
    peakMemoryUsage: number;
    cacheHits: number;
    cacheMisses: number;
    validationTime: number;
    serializationTime: number;
}
export interface ExecutionRecord {
    id: string;
    taskId: string;
    graphId: string;
    seed: number;
    result: any;
    metrics: ExecutionMetrics;
    errors: ExecutionError;
    warnings: ExecutionWarning;
    executedAt: Date;
    duration: number;
    success: boolean;
}
export interface RuntimeMetrics {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
    memoryUsage: MemoryMetrics;
    performance: PerformanceMetrics;
    nodeMetrics: Map<string, NodeMetrics>;
    errorRates: Map<ErrorType, number>;
}
export interface MemoryMetrics {
    currentUsage: number;
    peakUsage: number;
    averageUsage: number;
    gcCollections: number;
    gcTime: number;
}
export interface PerformanceMetrics {
    executionsPerSecond: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    cpuUsage: number;
    threadPoolUtilization: number;
}
export interface NodeMetrics {
    nodeType: string;
    executionCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    errorCount: number;
    errorRate: number;
    lastExecuted: Date;
}
export interface NodeDefinition {
    type: string;
    category: NodeCategory;
    version: string;
    description: string;
    inputs: IOSpecification;
    outputs: IOSpecification;
    properties: PropertySpecification;
    implementation: NodeImplementation;
    validation: ValidationSpecification;
    performance: PerformanceSpecification;
    security: SecuritySpecification;
    metadata: NodeMetadata;
}
export type NodeCategory = 'basic' | 'advanced' | 'utility' | 'integration' | 'custom';
export interface IOSpecification {
    name: string;
    type: IOType;
    description: string;
    required: boolean;
    defaultValue?: any;
    validation?: ValidationRule;
    metadata?: Record<string, any>;
}
export type IOType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any';
export interface PropertySpecification {
    name: string;
    type: PropertyType;
    description: string;
    required: boolean;
    defaultValue?: any;
    options?: PropertyOption;
    validation?: ValidationRule;
    ui?: UISpecification;
}
export type PropertyType = 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'code';
export interface PropertyOption {
    value: any;
    label: string;
    description?: string;
    disabled?: boolean;
}
export interface UISpecification {
    component?: string;
    props?: Record<string, any>;
    layout?: LayoutSpec;
    conditional?: ConditionalSpec;
}
export interface LayoutSpec {
    width?: number | string;
    height?: number | string;
    order?: number;
    group?: string;
}
export interface ConditionalSpec {
    property: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in';
    value: any;
}
export interface NodeImplementation {
    execute: (inputs: any, context: ExecutionContext, node: Node) => Promise<any>;
    validate?: (inputs: any, properties: any) => ValidationResult;
    initialize?: (properties: any) => Promise<void>;
    dispose?: () => Promise<void>;
    getOutputSchema?: (inputs: any, properties: any) => IOSpecification;
}
export interface ValidationSpecification {
    inputValidation: ValidationRule;
    outputValidation: ValidationRule;
    propertyValidation: ValidationRule;
    crossValidation?: CrossValidationRule;
}
export interface ValidationRule {
    type: ValidationType;
    parameters: Record<string, any>;
    message: string;
    severity: 'error' | 'warning' | 'info';
}
export type ValidationType = 'required' | 'type' | 'range' | 'length' | 'pattern' | 'enum' | 'custom' | 'dependency' | 'format' | 'unique';
export interface CrossValidationRule {
    name: string;
    inputs: string;
    validator: (values: any) => ValidationResult;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError;
    warnings: ValidationWarning;
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
    constraint?: any;
}
export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}
export interface PerformanceSpecification {
    expectedExecutionTime: number;
    memoryUsage: number;
    cpuIntensive: boolean;
    ioIntensive: boolean;
    cacheable: boolean;
    parallelizable: boolean;
}
export interface SecuritySpecification {
    requiresElevatedPermissions: boolean;
    accessesExternalResources: boolean;
    processesPersonalData: boolean;
    generatesAuditLogs: boolean;
    requiredPermissions: string;
    dataClassification: string;
}
export interface NodeMetadata {
    author: string;
    version: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string;
    documentation: string;
    examples: NodeExample;
    changelog: ChangelogEntry;
}
export interface NodeExample {
    name: string;
    description: string;
    inputs: Record<string, any>;
    properties: Record<string, any>;
    expectedOutput: any;
}
export interface ChangelogEntry {
    version: string;
    date: Date;
    changes: string;
    breaking: boolean;
}
export interface RuntimeConfig {
    execution: ExecutionConfig;
    performance: PerformanceConfig;
    security: RuntimeSecurityConfig;
    logging: LoggingConfig;
    caching: CachingConfig;
    monitoring: MonitoringConfig;
}
export interface ExecutionConfig {
    maxConcurrentExecutions: number;
    defaultTimeout: number;
    maxTimeout: number;
    enableProfiling: boolean;
    enableValidation: boolean;
    parallelExecution: boolean;
}
export interface PerformanceConfig {
    enableCaching: boolean;
    cacheSize: number;
    cacheTTL: number;
    enableOptimizations: boolean;
    memoryLimit: number;
    gcThreshold: number;
}
export interface RuntimeSecurityConfig {
    sandboxExecution: boolean;
    allowExternalRequests: boolean;
    allowFileSystem: boolean;
    allowNetworking: boolean;
    maxMemoryUsage: number;
    maxExecutionTime: number;
}
export interface LoggingConfig {
    enabled: boolean;
    level: LogLevel;
    includeStackTraces: boolean;
    logToFile: boolean;
    logToConsole: boolean;
    maxLogSize: number;
}
export interface CachingConfig {
    enabled: boolean;
    strategy: CacheStrategy;
    maxSize: number;
    ttl: number;
    persistToDisk: boolean;
    compression: boolean;
}
export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'random';
export interface MonitoringConfig {
    enabled: boolean;
    metricsRetention: number;
    performanceThresholds: PerformanceThresholds;
    alerting: AlertingConfig;
    reportingInterval: number;
}
export interface PerformanceThresholds {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    maxErrorRate: number;
    minSuccessRate: number;
}
export interface AlertingConfig {
    enabled: boolean;
    webhookUrl?: string;
    emailAlerts?: string;
    slackChannel?: string;
    thresholds: AlertThresholds;
}
export interface AlertThresholds {
    executionTime: number;
    errorRate: number;
    memoryUsage: number;
    queueSize: number;
}
export interface RuntimeDomainEvents {
    onExecutionStarted: (task: ExecutionTask) => void;
    onExecutionCompleted: (result: ExecutionRecord) => void;
    onExecutionFailed: (task: ExecutionTask, error: ExecutionError) => void;
    onNodeExecuted: (nodeId: string, result: any, metrics: NodeMetrics) => void;
    onValidationError: (nodeId: string, errors: ValidationError) => void;
    onPerformanceThresholdExceeded: (metric: string, value: number, threshold: number) => void;
    onMemoryThresholdExceeded: (usage: number, limit: number) => void;
    onQueueOverflow: (queueSize: number, maxSize: number) => void;
    onNodeRegistered: (nodeDefinition: NodeDefinition) => void;
    onNodeUnregistered: (nodeType: string) => void;
    onMetricsUpdated: (metrics: RuntimeMetrics) => void;
}
export interface RuntimeDashboardProps {
    showMetrics?: boolean;
    showQueue?: boolean;
    showHistory?: boolean;
    refreshInterval?: number;
    className?: string;
}
export interface ExecutionQueueProps {
    maxItems?: number;
    showCompleted?: boolean;
    onTaskSelect?: (task: ExecutionTask) => void;
    onTaskCancel?: (taskId: string) => void;
    className?: string;
}
export interface NodeRegistryProps {
    categories?: NodeCategory;
    searchable?: boolean;
    onNodeSelect?: (nodeDefinition: NodeDefinition) => void;
    className?: string;
}
export type { Graph, Node, Edge } from '../../../graphSchema';
export type { ExecutionContext, RuntimeNode, NodeInput, NodeOutput } from '../../../runtime';
export type { AdvancedRuntimeNode, AdvancedExecutionContext, IOHandler, ValidationHelpers, SerializationHelpers } from '../../../runtime/advanced';
//# sourceMappingURL=RuntimeTypes.d.ts.map