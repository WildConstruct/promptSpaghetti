/**
 * Epic 31.4.1 - Security Intelligence Data Quality Monitoring and Validation
 *
 * Comprehensive data quality monitoring system for security intelligence pipelines.
 * Provides real-time validation, quality metrics, anomaly detection for data quality,
 * and automated remediation capabilities.
 *
 * Task: E31-1753313263565-A273CD
 */
import { EventEmitter } from 'events';
import { SecurityIntelligence } from './MLSecurityAnalyticsFramework';
import { SecurityAnomaly } from './SecurityAnomalyDetector';

}
}
export interface DataQualityConfig { enableRealTimeValidation: boolean;
    validationInterval: number;
    qualityThresholds: QualityThresholds;
    enableAutomaticRemediation: boolean;
    retentionPeriodDays: number;
    alertingEnabled: boolean;
    reportingEnabled: boolean;
    validationRules: ValidationRule[] }
}
}
export interface QualityThresholds { completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    uniqueness: number;
    overall: number }
}
}
export interface ValidationRule { id: string;
    name: string;
    description: string;
    ruleType: ValidationRuleType;
    severity: ValidationSeverity;
    enabled: boolean;
    parameters: Record<string, unknown>;
    lastUpdated: Date;
    executionCount: number;
    violationCount: number;

export declare enum ValidationRuleType {
    SCHEMA_VALIDATION = "schema_validation";
    RANGE_CHECK = "range_check";
    FORMAT_VALIDATION = "format_validation";
    REFERENCE_INTEGRITY = "reference_integrity";
    BUSINESS_RULE = "business_rule";
    TEMPORAL_CONSISTENCY = "temporal_consistency";
    CROSS_FIELD_VALIDATION = "cross_field_validation";
    STATISTICAL_OUTLIER = "statistical_outlier";
    DUPLICATE_DETECTION = "duplicate_detection";
    COMPLETENESS_CHECK = "completeness_check"

export declare enum ValidationSeverity {
    INFO = "info";
    WARNING = "warning";
    ERROR = "error" }
    CRITICAL = "critical"

}
}
}
export interface DataQualityReport { reportId: string;
    generatedAt: Date;
    period: {
        start: Date;
        end: Date }
}
    };
    overallScore: number;
    qualityDimensions: QualityDimensionScore[];
    violations: DataQualityViolation[];
    trends: QualityTrend[];
    recommendations: QualityRecommendation[];
    dataSourceMetrics: DataSourceQuality[];

}
}
export interface QualityDimensionScore { dimension: QualityDimension;
    score: number;
    trend: 'improving' | 'declining' | 'stable';
    violationCount: number;
    issuesSummary: string[];

export declare enum QualityDimension {
    COMPLETENESS = "completeness";
    ACCURACY = "accuracy";
    CONSISTENCY = "consistency";
    TIMELINESS = "timeliness";
    VALIDITY = "validity" }
    UNIQUENESS = "uniqueness"

}
}
}
export interface DataQualityViolation { violationId: string;
    timestamp: Date;
    ruleId: string;
    ruleName: string;
    severity: ValidationSeverity;
    dimension: QualityDimension;
    dataSource: string;
    recordId?: string;
    fieldName?: string;
    expectedValue?: unknown;
    actualValue?: unknown;
    description: string;
    context: Record<string, unknown>;
    isResolved: boolean;
    resolvedAt?: Date;
    remediation?: RemediationAction }
}
}
export interface RemediationAction { actionType: RemediationActionType;
    description: string;
    executedAt: Date;
    result: 'success' | 'failure' | 'partial';
    details: string;

export declare enum RemediationActionType {
    DATA_CORRECTION = "data_correction";
    RECORD_FLAGGING = "record_flagging";
    SOURCE_NOTIFICATION = "source_notification";
    AUTOMATIC_REPAIR = "automatic_repair";
    QUARANTINE = "quarantine";
    ENRICHMENT = "enrichment" }
    TRANSFORMATION = "transformation"

}
}
}
export interface QualityTrend { dimension: QualityDimension;
    timeframe: string;
    direction: 'improving' | 'declining' | 'stable';
    changePercent: number;
    significance: 'high' | 'medium' | 'low';
    driverFactors: string[] }
}
}
export interface QualityRecommendation { id: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    expectedImpact: string;
    estimatedEffort: string;
    targetDimensions: QualityDimension[];
    implementationSteps: string[] }
}
}
export interface DataSourceQuality { sourceName: string;
    sourceType: string;
    overallScore: number;
    recordCount: number;
    qualityIssues: number;
    lastValidated: Date;
    dimensions: Record<QualityDimension, number>;
    commonIssues: string[] }
}
}
export interface DataQualityMetrics { totalRecordsProcessed: number;
    totalViolations: number;
    criticalViolations: number;
    averageQualityScore: number;
    dataSourceCount: number;
    automatedRemediations: number;
    manualInterventions: number;
    qualityTrend: 'improving' | 'declining' | 'stable' }
}
}
export interface ValidationContext { recordId: string;
    dataSource: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
    relatedRecords?: unknown[] }
}
}
export interface QualityProfile { dataSourceName: string;
    expectedSchema: Record<string, FieldExpectation>;
    statisticalBaseline: StatisticalBaseline;
    businessRules: BusinessRule[];
    lastUpdated: Date;
    validationHistory: ValidationHistoryEntry[] }
}
}
export interface FieldExpectation { fieldName: string;
    dataType: string;
    required: boolean;
    format?: string;
    minValue?: number;
    maxValue?: number;
    allowedValues?: unknown[];
    nullablePercent: number;
    uniquenessRequired: boolean }
}
}
export interface StatisticalBaseline { recordCount: {
        mean: number;
        standardDeviation: number;
        min: number;
        max: number }
}
    };
    fieldStatistics: Record<string, FieldStatistics>;
    temporalPatterns: TemporalPattern[];

}
}
export interface FieldStatistics { fieldName: string;
    dataType: string;
    nullPercent: number;
    uniquePercent: number;
    averageLength?: number;
    commonValues: Array<{
        value: unknown;
        frequency: number }
}
    }>;
    outlierThreshold: number;

}
}
export interface TemporalPattern { pattern: 'hourly' | 'daily' | 'weekly' | 'monthly';
    expectedVolume: number[];
    variationThreshold: number }
}
}
export interface BusinessRule { ruleId: string;
    name: string;
    description: string;
    expression: string;
    severity: ValidationSeverity;
    enabled: boolean }
}
}
export interface ValidationHistoryEntry { timestamp: Date;
    overallScore: number;
    violationCount: number;
    processingTime: number;
    recordsValidated: number;

export declare class SecurityDataQualityMonitor extends EventEmitter {
    private config;
    private validationRules;
    private qualityViolations;
    private qualityProfiles;
    private metrics;
    private validationInterval?;
    private isValidating;
    constructor(config?: Partial<DataQualityConfig>);
    private initializeDefaultRules;
    /**
     * Validate security intelligence data
     */
    validateSecurityIntelligence(intelligence: SecurityIntelligence[]): Promise<DataQualityViolation[]>;
    /**
     * Validate security anomalies data
     */
    validateSecurityAnomalies(anomalies: SecurityAnomaly[]): Promise<DataQualityViolation[]>;
    /**
     * Validate individual record against all applicable rules
     */
    private validateRecord;
    /**
     * Execute specific validation rule
     */
    private executeValidationRule;
    private validateCompleteness;
    private validateFormat;
    private validateRange;
    private validateDuplicates;
    private validateStatisticalOutliers;
    private validateTemporalConsistency;
    private validateCrossField;
    private processViolations;
    private attemptRemediation;
    private remediateCompleteness;
    private remediateValidity;
    private remediateConsistency;
    private remediateGeneric;
    /**
     * Generate comprehensive data quality report
     */
    generateQualityReport(period: {)
        start: Date;
        end: Date }
}
    }): Promise<DataQualityReport>;
    private calculateQualityDimensions;
    private calculateQualityTrends;
    private generateRecommendations;
    private calculateDataSourceMetrics;
    private createViolation;
    private updateQualityMetrics;
    private startRealTimeValidation;
    private performScheduledValidation;
    private generateViolationId;
    private generateReportId;
    getQualityMetrics(): DataQualityMetrics;
    getViolations(): DataQualityViolation[];
    getActiveViolations(): DataQualityViolation[];
    getValidationRules(): ValidationRule[];
    addValidationRule(rule: ValidationRule): void;
    updateValidationRule(ruleId: string, updates: Partial<ValidationRule>): boolean;
    removeValidationRule(ruleId: string): boolean;
    resolveViolation(violationId: string, resolvedBy: string): boolean;
    updateConfiguration(newConfig: Partial<DataQualityConfig>): void;
    destroy(): void;

export default SecurityDataQualityMonitor;
//# sourceMappingURL=SecurityDataQualityMonitor.d.ts.map