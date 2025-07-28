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
    outputFormats: OutputFormat;
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
    DATABASE = "database",
    export,
    interface,
    PipelineStage
}
export declare enum StageType {
    INGESTION = "ingestion",
    VALIDATION = "validation",
    ENRICHMENT = "enrichment",
    TRANSFORMATION = "transformation",
    CORRELATION = "correlation",
    ANALYSIS = "analysis",
    OUTPUT = "output",
    ARCHIVAL = "archival",
    export,
    interface,
    DataSchema
}
export interface SchemaField {
    name: string;
    type: FieldType;
    required: boolean;
    nullable: boolean;
    defaultValue?: unknown;
    description?: string;
    validationRules?: string;
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
    EMAIL = "email",
    export,
    interface,
    SchemaConstraint
}
export declare enum ConstraintType {
    MIN_LENGTH = "min_length",
    MAX_LENGTH = "max_length",
    PATTERN = "pattern",
    RANGE = "range",
    UNIQUE = "unique",
    FOREIGN_KEY = "foreign_key",
    NOT_NULL = "not_null",
    CUSTOM = "custom",
    export,
    interface,
    DataTransformation
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
    CLASSIFY = "classify",
    export,
    interface,
    ValidationRule
}
export declare enum ValidationRuleType {
    REQUIRED_FIELD = "required_field",
    DATA_TYPE = "data_type",
    RANGE_CHECK = "range_check",
    FORMAT_VALIDATION = "format_validation",
    BUSINESS_RULE = "business_rule",
    CROSS_FIELD = "cross_field",
    REFERENCE_CHECK = "reference_check",
    UNIQUENESS = "uniqueness",
    export,
    enum,
    ValidationSeverity
}
//# sourceMappingURL=SecurityIntelligenceDataPipeline.d.ts.map