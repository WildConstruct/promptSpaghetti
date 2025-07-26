/**
 * Epic 31.4.1 - Security Intelligence Data Pipeline
 *
 * Comprehensive data pipeline for security intelligence processing, transformation,
 * and distribution. Integrates with Epic 1 analytics infrastructure and Epic 17
 * security systems to provide unified security data processing capabilities.
 *
 * Task: E31-1753313263557-8B72ED
 */
import { EventEmitter } from 'events';
export interface DataPipelineConfig {
    enableRealTimeProcessing: boolean;
    batchProcessingInterval: number;
    maxBatchSize: number;
    enableDataValidation: boolean;
    enableDataEnrichment: boolean;
    enableDataTransformation: boolean;
    retentionPeriodDays: number;
    enableErrorRecovery: boolean;
    parallelProcessingThreads: number;
    dataQualityThresholds: DataQualityThresholds;
    outputFormats: OutputFormat[];
}
export interface DataQualityThresholds {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
}
export declare enum OutputFormat {
    JSON = "json",
    AVRO = "avro",
    PARQUET = "parquet",
    CSV = "csv",
    ELASTIC_SEARCH = "elasticsearch",
    KAFKA = "kafka",
    DATABASE = "database"
}
export interface PipelineStage {
    stageId: string;
    stageName: string;
    stageType: StageType;
    enabled: boolean;
    priority: number;
    configuration: Record<string, unknown>;
    inputSchema: DataSchema;
    outputSchema: DataSchema;
    transformations: DataTransformation[];
    validationRules: ValidationRule[];
    errorHandling: ErrorHandlingStrategy;
    performanceMetrics: StageMetrics;
}
export declare enum StageType {
    INGESTION = "ingestion",
    VALIDATION = "validation",
    ENRICHMENT = "enrichment",
    TRANSFORMATION = "transformation",
    CORRELATION = "correlation",
    ANALYSIS = "analysis",
    OUTPUT = "output",
    ARCHIVAL = "archival"
}
export interface DataSchema {
    schemaId: string;
    version: string;
    fields: SchemaField[];
    constraints: SchemaConstraint[];
}
export interface SchemaField {
    name: string;
    type: FieldType;
    required: boolean;
    nullable: boolean;
    defaultValue?: unknown;
    description?: string;
    validationRules?: string[];
}
export declare enum FieldType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    DATE = "date",
    ARRAY = "array",
    OBJECT = "object",
    ENUM = "enum",
    UUID = "uuid",
    IP_ADDRESS = "ip_address",
    EMAIL = "email"
}
export interface SchemaConstraint {
    constraintType: ConstraintType;
    field: string;
    value: unknown;
    errorMessage: string;
}
export declare enum ConstraintType {
    MIN_LENGTH = "min_length",
    MAX_LENGTH = "max_length",
    PATTERN = "pattern",
    RANGE = "range",
    UNIQUE = "unique",
    FOREIGN_KEY = "foreign_key",
    NOT_NULL = "not_null",
    CUSTOM = "custom"
}
export interface DataTransformation {
    transformationId: string;
    transformationType: TransformationType;
    inputFields: string[];
    outputFields: string[];
    parameters: Record<string, unknown>;
    condition?: string;
    enabled: boolean;
}
export declare enum TransformationType {
    MAP = "map",
    FILTER = "filter",
    AGGREGATE = "aggregate",
    JOIN = "join",
    SPLIT = "split",
    MERGE = "merge",
    NORMALIZE = "normalize",
    ENRICH = "enrich",
    DECODE = "decode",
    ENCRYPT = "encrypt",
    HASH = "hash",
    CLASSIFY = "classify"
}
export interface ValidationRule {
    ruleId: string;
    ruleName: string;
    ruleType: ValidationRuleType;
    field: string;
    condition: string;
    errorMessage: string;
    severity: ValidationSeverity;
    enabled: boolean;
}
export declare enum ValidationRuleType {
    REQUIRED_FIELD = "required_field",
    DATA_TYPE = "data_type",
    RANGE_CHECK = "range_check",
    FORMAT_VALIDATION = "format_validation",
    BUSINESS_RULE = "business_rule",
    CROSS_FIELD = "cross_field",
    REFERENCE_CHECK = "reference_check",
    UNIQUENESS = "uniqueness"
}
export declare enum ValidationSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export interface ErrorHandlingStrategy {
    onValidationError: ErrorAction;
    onTransformationError: ErrorAction;
    onOutputError: ErrorAction;
    maxRetryAttempts: number;
    retryDelayMs: number;
    deadLetterQueue: boolean;
    alertOnError: boolean;
}
export declare enum ErrorAction {
    SKIP = "skip",
    RETRY = "retry",
    REDIRECT_TO_DLQ = "redirect_to_dlq",
    HALT_PIPELINE = "halt_pipeline",
    LOG_AND_CONTINUE = "log_and_continue",
    APPLY_DEFAULT = "apply_default"
}
export interface StageMetrics {
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    averageProcessingTime: number;
    throughputPerSecond: number;
    errorRate: number;
    lastProcessedAt?: Date;
    performanceTrends: PerformanceTrend[];
}
export interface PerformanceTrend {
    timestamp: Date;
    metric: string;
    value: number;
    trend: 'increasing' | 'decreasing' | 'stable';
}
export interface PipelineExecution {
    executionId: string;
    pipelineId: string;
    startTime: Date;
    endTime?: Date;
    status: ExecutionStatus;
    inputRecordCount: number;
    outputRecordCount: number;
    stageExecutions: StageExecution[];
    errors: ExecutionError[];
    metrics: ExecutionMetrics;
}
export declare enum ExecutionStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    RETRYING = "retrying"
}
export interface StageExecution {
    stageId: string;
    stageName: string;
    startTime: Date;
    endTime?: Date;
    status: ExecutionStatus;
    inputCount: number;
    outputCount: number;
    duration: number;
    memoryUsage: number;
    cpuUsage: number;
    errors: string[];
}
export interface ExecutionError {
    errorId: string;
    timestamp: Date;
    stageId: string;
    errorType: ErrorType;
    errorMessage: string;
    recordId?: string;
    stackTrace?: string;
    retryCount: number;
    resolved: boolean;
}
export declare enum ErrorType {
    VALIDATION_ERROR = "validation_error",
    TRANSFORMATION_ERROR = "transformation_error",
    SCHEMA_ERROR = "schema_error",
    NETWORK_ERROR = "network_error",
    PERMISSION_ERROR = "permission_error",
    RESOURCE_ERROR = "resource_error",
    TIMEOUT_ERROR = "timeout_error",
    UNKNOWN_ERROR = "unknown_error"
}
export interface ExecutionMetrics {
    totalDuration: number;
    recordThroughput: number;
    averageRecordSize: number;
    peakMemoryUsage: number;
    totalCpuTime: number;
    networkBytesTransferred: number;
    diskBytesWritten: number;
}
export interface DataSource {
    sourceId: string;
    sourceName: string;
    sourceType: SourceType;
    connectionConfig: ConnectionConfig;
    schema: DataSchema;
    enabled: boolean;
    schedule?: ProcessingSchedule;
    lastProcessed?: Date;
    metrics: SourceMetrics;
}
export declare enum SourceType {
    FILE_SYSTEM = "file_system",
    DATABASE = "database",
    API_ENDPOINT = "api_endpoint",
    MESSAGE_QUEUE = "message_queue",
    STREAM = "stream",
    WEBHOOK = "webhook",
    EMAIL = "email",
    SYSLOG = "syslog",
    SNMP = "snmp",
    WMI = "wmi"
}
export interface ConnectionConfig {
    endpoint?: string;
    credentials?: {
        username?: string;
        password?: string;
        apiKey?: string;
        certificate?: string;
    };
    timeout?: number;
    maxConnections?: number;
    retryConfig?: {
        maxRetries: number;
        backoffMs: number;
    };
    ssl?: {
        enabled: boolean;
        verifyHostname: boolean;
        certificatePath?: string;
    };
}
export interface ProcessingSchedule {
    scheduleType: ScheduleType;
    cronExpression?: string;
    intervalMinutes?: number;
    startTime?: Date;
    endTime?: Date;
    enabled: boolean;
}
export declare enum ScheduleType {
    REALTIME = "realtime",
    BATCH = "batch",
    CRON = "cron",
    INTERVAL = "interval",
    EVENT_DRIVEN = "event_driven"
}
export interface SourceMetrics {
    recordsIngested: number;
    bytesIngested: number;
    lastIngestedAt?: Date;
    ingestRate: number;
    errorCount: number;
    averageLatency: number;
}
export interface DataDestination {
    destinationId: string;
    destinationName: string;
    destinationType: DestinationType;
    connectionConfig: ConnectionConfig;
    outputFormat: OutputFormat;
    schema: DataSchema;
    enabled: boolean;
    metrics: DestinationMetrics;
}
export declare enum DestinationType {
    FILE_SYSTEM = "file_system",
    DATABASE = "database",
    DATA_WAREHOUSE = "data_warehouse",
    MESSAGE_QUEUE = "message_queue",
    API_ENDPOINT = "api_endpoint",
    EMAIL = "email",
    WEBHOOK = "webhook",
    CLOUD_STORAGE = "cloud_storage",
    SEARCH_INDEX = "search_index"
}
export interface DestinationMetrics {
    recordsWritten: number;
    bytesWritten: number;
    lastWrittenAt?: Date;
    writeRate: number;
    errorCount: number;
    averageLatency: number;
}
export interface PipelineAlert {
    alertId: string;
    timestamp: Date;
    alertType: PipelineAlertType;
    severity: ValidationSeverity;
    pipelineId: string;
    stageId?: string;
    message: string;
    details: Record<string, unknown>;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
}
export declare enum PipelineAlertType {
    PERFORMANCE_DEGRADATION = "performance_degradation",
    ERROR_RATE_HIGH = "error_rate_high",
    DATA_QUALITY_ISSUE = "data_quality_issue",
    PIPELINE_FAILURE = "pipeline_failure",
    RESOURCE_EXHAUSTION = "resource_exhaustion",
    SCHEMA_VIOLATION = "schema_violation",
    SLA_BREACH = "sla_breach",
    SECURITY_ISSUE = "security_issue"
}
export declare class SecurityIntelligenceDataPipeline extends EventEmitter {
    private config;
    private stages;
    private dataSources;
    private dataDestinations;
    private executionHistory;
    private currentExecution?;
    private processingQueue;
    private isProcessing;
    private alerts;
    constructor(config: DataPipelineConfig);
    ingestData(sourceId: string, data: any[]): Promise<string>;
    processDataBatch(data: any[]): Promise<PipelineExecution>;
    addDataSource(source: Omit<DataSource, 'metrics'>): void;
    addDataDestination(destination: Omit<DataDestination, 'metrics'>): void;
    addPipelineStage(stage: PipelineStage): void;
    updateStageConfiguration(stageId: string, configuration: Record<string, unknown>): void;
    enableStage(stageId: string): void;
    disableStage(stageId: string): void;
    getExecutionHistory(limit?: number): PipelineExecution[];
    getExecution(executionId: string): PipelineExecution | undefined;
    getPipelineMetrics(): PipelineMetrics;
    acknowledgeAlert(alertId: string, acknowledgedBy: string): void;
    getActiveAlerts(): PipelineAlert[];
    private initializeDefaultStages;
    private createDefaultSchema;
    private createDefaultValidationRules;
    private createDefaultTransformations;
    private createDefaultErrorHandling;
    private createDefaultMetrics;
    private startProcessingLoop;
    private processQueueBatch;
    private createExecution;
    private createStageExecution;
    private processStage;
    private validateData;
    private transformData;
    private applyTransformation;
    private mapRecord;
    private normalizeRecord;
    private normalizeValue;
    private enrichRecords;
    private classifyRecords;
    private enrichData;
    private analyzeData;
    private outputData;
    private writeToDestination;
    private evaluateValidationCondition;
    private evaluateCondition;
    private getFieldValue;
    private completeStageExecution;
    private failStageExecution;
    private handleExecutionError;
    private createAlert;
    private calculateExecutionMetrics;
    private calculateAverageExecutionTime;
    private calculateThroughput;
    private calculateErrorRate;
    private getStageMetrics;
}
export interface PipelineMetrics {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    throughputPerHour: number;
    errorRate: number;
    queueSize: number;
    activeExecutions: number;
    stageMetrics: Map<string, StageMetrics>;
}
export declare class SecurityIntelligenceDataPipelineFactory {
    static createDefaultConfig(): DataPipelineConfig;
    static createHighThroughputConfig(): DataPipelineConfig;
    static createHighQualityConfig(): DataPipelineConfig;
    static createPipeline(config?: Partial<DataPipelineConfig>): SecurityIntelligenceDataPipeline;
}
export default SecurityIntelligenceDataPipeline;
//# sourceMappingURL=SecurityIntelligenceDataPipeline.d.ts.map