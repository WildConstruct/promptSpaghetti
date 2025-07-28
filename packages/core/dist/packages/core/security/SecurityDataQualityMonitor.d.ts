export interface DataQualityConfig {
    enableRealTimeValidation: boolean;
    validationInterval: number;
    qualityThresholds: QualityThresholds;
    enableAutomaticRemediation: boolean;
    retentionPeriodDays: number;
    alertingEnabled: boolean;
    reportingEnabled: boolean;
    validationRules: ValidationRule;
}
export interface QualityThresholds {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
    overall: number;
}
export interface ValidationRule {
    id: string;
    name: string;
    description: string;
    ruleType: ValidationRuleType;
    severity: ValidationSeverity;
    enabled: boolean;
    parameters: Record<string, unknown>;
    lastUpdated: Date;
    executionCount: number;
    violationCount: number;
}
export declare enum ValidationRuleType {
    SCHEMA_VALIDATION = "schema_validation",
    RANGE_CHECK = "range_check",
    FORMAT_VALIDATION = "format_validation",
    REFERENCE_INTEGRITY = "reference_integrity",
    BUSINESS_RULE = "business_rule",
    TEMPORAL_CONSISTENCY = "temporal_consistency",
    CROSS_FIELD_VALIDATION = "cross_field_validation",
    STATISTICAL_OUTLIER = "statistical_outlier",
    DUPLICATE_DETECTION = "duplicate_detection",
    COMPLETENESS_CHECK = "completeness_check",
    export,
    enum,
    ValidationSeverity
}
//# sourceMappingURL=SecurityDataQualityMonitor.d.ts.map