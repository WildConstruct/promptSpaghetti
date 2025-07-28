/**
 * Data Validation and Consistency System - Story 1.5 Task 3
 *
 * Implements comprehensive data validation and consistency checking
 * to ensure zero data loss during analytics migration and integration.
 */
import { z } from 'zod';
import { UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';
export declare const ValidationRuleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["integrity", "consistency", "completeness", "accuracy", "timeliness"]>;
    severity: z.ZodEnum<["critical", "high", "medium", "low"]>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    conditions: z.ZodObject<{,
        eventTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        timeRange: z.ZodOptional<z.ZodObject<{,
            start: z.ZodOptional<z.ZodNumber>;
            end: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            start?: number | undefined;
            end?: number | undefined;
        }, {
            start?: number | undefined;
            end?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        sources?: string[] | undefined;
        timeRange?: {
            start?: number | undefined;
            end?: number | undefined;
        } | undefined;
        eventTypes?: string[] | undefined;
    }, {
        sources?: string[] | undefined;
        timeRange?: {
            start?: number | undefined;
            end?: number | undefined;
        } | undefined;
        eventTypes?: string[] | undefined;
    }>;
    validation: z.ZodObject<{,
        rules: z.ZodArray<z.ZodObject<{,
            field: z.ZodString;
            operator: z.ZodEnum<["exists", "not_exists", "equals", "not_equals", "greater_than", "less_than", "matches", "in_range", "custom"]>;
            value: z.ZodOptional<z.ZodUnknown>;
            customFunction: z.ZodOptional<z.ZodString>;
            required: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            required: boolean;
            operator: "custom" | "matches" | "equals" | "exists" | "not_equals" | "greater_than" | "less_than" | "not_exists" | "in_range";
            field: string;
            value?: unknown;
            customFunction?: string | undefined;
        }, {
            operator: "custom" | "matches" | "equals" | "exists" | "not_equals" | "greater_than" | "less_than" | "not_exists" | "in_range";
            field: string;
            value?: unknown;
            required?: boolean | undefined;
            customFunction?: string | undefined;
        }>, "many">;
        crossFieldValidation: z.ZodOptional<z.ZodArray<z.ZodObject<{,
            fields: z.ZodArray<z.ZodString, "many">;
            relationship: z.ZodEnum<["sum_equals", "all_or_none", "mutually_exclusive", "sequential", "custom"]>;
            expectedValue: z.ZodOptional<z.ZodUnknown>;
            customFunction: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            fields: string[];
            relationship: "custom" | "sequential" | "sum_equals" | "all_or_none" | "mutually_exclusive";
            expectedValue?: unknown;
            customFunction?: string | undefined;
        }, {
            fields: string[];
            relationship: "custom" | "sequential" | "sum_equals" | "all_or_none" | "mutually_exclusive";
            expectedValue?: unknown;
            customFunction?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        rules: {,
            required: boolean;
            operator: "custom" | "matches" | "equals" | "exists" | "not_equals" | "greater_than" | "less_than" | "not_exists" | "in_range";
            field: string;
            value?: unknown;
            customFunction?: string | undefined;
        }[];
        crossFieldValidation?: {
            fields: string[];
            relationship: "custom" | "sequential" | "sum_equals" | "all_or_none" | "mutually_exclusive";
            expectedValue?: unknown;
            customFunction?: string | undefined;
        }[] | undefined;
    }, {
        rules: {,
            operator: "custom" | "matches" | "equals" | "exists" | "not_equals" | "greater_than" | "less_than" | "not_exists" | "in_range";
            field: string;
            value?: unknown;
            required?: boolean | undefined;
            customFunction?: string | undefined;
        }[];
        crossFieldValidation?: {
            fields: string[];
            relationship: "custom" | "sequential" | "sum_equals" | "all_or_none" | "mutually_exclusive";
            expectedValue?: unknown;
            customFunction?: string | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    validation: {,
        rules: {,
            required: boolean;
            operator: "custom" | "matches" | "equals" | "exists" | "not_equals" | "greater_than" | "less_than" | "not_exists" | "in_range";
            field: string;
            value?: unknown;
            customFunction?: string | undefined;
        }[];
        crossFieldValidation?: {
            fields: string[];
            relationship: "custom" | "sequential" | "sum_equals" | "all_or_none" | "mutually_exclusive";
            expectedValue?: unknown;
            customFunction?: string | undefined;
        }[] | undefined;
    };
    category: "accuracy" | "integrity" | "consistency" | "completeness" | "timeliness";
    enabled: boolean;
    severity: "low" | "medium" | "high" | "critical";
    conditions: {,
        sources?: string[] | undefined;
        timeRange?: {
            start?: number | undefined;
            end?: number | undefined;
        } | undefined;
        eventTypes?: string[] | undefined;
    };
}, {
    id: string;
    name: string;
    description: string;
    validation: {,
        rules: {,
            operator: "custom" | "matches" | "equals" | "exists" | "not_equals" | "greater_than" | "less_than" | "not_exists" | "in_range";
            field: string;
            value?: unknown;
            required?: boolean | undefined;
            customFunction?: string | undefined;
        }[];
        crossFieldValidation?: {
            fields: string[];
            relationship: "custom" | "sequential" | "sum_equals" | "all_or_none" | "mutually_exclusive";
            expectedValue?: unknown;
            customFunction?: string | undefined;
        }[] | undefined;
    };
    category: "accuracy" | "integrity" | "consistency" | "completeness" | "timeliness";
    severity: "low" | "medium" | "high" | "critical";
    conditions: {,
        sources?: string[] | undefined;
        timeRange?: {
            start?: number | undefined;
            end?: number | undefined;
        } | undefined;
        eventTypes?: string[] | undefined;
    };
    enabled?: boolean | undefined;
}>;
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
export interface ValidationResult {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    severity: string;
    message: string;
    affectedRecords: string[];
    details: {,
        expectedValue?: unknown;
        actualValue?: unknown;
        field?: string;
        operator?: string;
        duplicateCount?: number;
        totalDuplicateEvents?: number;
        inconsistentEventCount?: number;
        orphanedEventCount?: number;
        [key: string]: unknown;
    };
    timestamp: number;
}
export interface ConsistencyCheckResult {
    checkId: string;
    checkName: string;
    category: string;
    passed: boolean;
    severity: string;
    summary: {,
        totalRecords: number;
        validRecords: number;
        invalidRecords: number;
        warningRecords: number;
        errorRate: number;
    };
    violations: ValidationResult[];
    recommendations: string[];
    timestamp: number;
}
export interface DataQualityMetrics {
    completeness: {,
        score: number;
        missingFields: {,
            [field: string]: number;
        };
        requiredFieldsCoverage: number;
    };
    accuracy: {,
        score: number;
        invalidValues: number;
        formatErrors: number;
        typeErrors: number;
    };
    consistency: {,
        score: number;
        duplicates: number;
        contradictions: number;
        referentialIntegrityErrors: number;
    };
    timeliness: {,
        score: number;
        lateArrivals: number;
        futureTimestamps: number;
        timestampGaps: number;
    };
    integrity: {,
        score: number;
        corruptedRecords: number;
        checksumFailures: number;
        structuralErrors: number;
    };
    overall: {,
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        issueCount: number;
        recommendation: string;
    };
}
/**
 * Data Validation System
 *
 * Provides comprehensive data validation and quality assurance for analytics data
 */
export declare class DataValidationSystem {
    private eventRepository;
    private validationRules;
    private validationHistory;
    constructor(eventRepository: EventRepository);
    /**
     * Initialize default validation rules
     */
    private initializeDefaultRules;
    /**
     * Validate single event
     */
    validateEvent(event: UnifiedAnalyticsEvent): Promise<ValidationResult[]>;
    /**
     * Validate batch of events
     */
    validateEventBatch(events: UnifiedAnalyticsEvent[]): Promise<ValidationResult[]>;
    /**
     * Perform comprehensive consistency check
     */
    performConsistencyCheck(filter?: EventFilter, timeRange?: {)
        start: number;
        end: number;
    }): Promise<ConsistencyCheckResult>;
    /**
     * Calculate data quality metrics
     */
    calculateDataQualityMetrics(filter?: EventFilter, timeRange?: {)
        start: number;
        end: number;
    }): Promise<DataQualityMetrics>;
    /**
     * Get applicable validation rules for event
     */
    private getApplicableRules;
    /**
     * Execute validation rule on event
     */
    private executeValidationRule;
    /**
     * Validate individual field
     */
    private validateField;
    /**
     * Validate cross-field relationships
     */
    private validateCrossFields;
    /**
     * Perform cross-event validation
     */
    private performCrossEventValidation;
    /**
     * Check for duplicate events
     */
    private checkForDuplicates;
    /**
     * Check temporal consistency
     */
    private checkTemporalConsistency;
    /**
     * Check referential integrity
     */
    private checkReferentialIntegrity;
    /**
     * Execute custom validation function
     */
    private executeCustomValidation;
    /**
     * Execute custom cross-field validation
     */
    private executeCustomCrossFieldValidation;
    /**
     * Calculate completeness metrics
     */
    private calculateCompletenessMetrics;
    /**
     * Calculate accuracy metrics
     */
    private calculateAccuracyMetrics;
    /**
     * Calculate consistency metrics
     */
    private calculateConsistencyMetrics;
    /**
     * Calculate timeliness metrics
     */
    private calculateTimelinessMetrics;
    /**
     * Calculate integrity metrics
     */
    private calculateIntegrityMetrics;
    /**
     * Calculate simple event checksum
     */
    private calculateEventChecksum;
    /**
     * Calculate overall grade
     */
    private calculateGrade;
    /**
     * Get overall recommendation
     */
    private getOverallRecommendation;
    /**
     * Generate validation message
     */
    private generateValidationMessage;
    /**
     * Generate recommendations based on violations
     */
    private generateRecommendations;
    /**
     * Get empty quality metrics
     */
    private getEmptyQualityMetrics;
    /**
     * Get nested property value
     */
    private getNestedProperty;
    /**
     * Public API Methods
     */
    /**
     * Add validation rule
     */
    addValidationRule(rule: ValidationRule): void;
    /**
     * Remove validation rule
     */
    removeValidationRule(ruleId: string): boolean;
    /**
     * Get validation rule
     */
    getValidationRule(ruleId: string): ValidationRule | undefined;
    /**
     * List all validation rules
     */
    listValidationRules(): ValidationRule[];
    /**
     * Get validation history
     */
    getValidationHistory(limit?: number): ValidationResult[];
    /**
     * Clear validation history
     */
    clearValidationHistory(): void;
    /**
     * Enable/disable validation rule
     */
    setValidationRuleEnabled(ruleId: string, enabled: boolean): boolean;
    /**
     * Get validation summary
     */
    getValidationSummary(): {
        totalRules: number;
        enabledRules: number;
        recentValidations: number;
        recentFailures: number;
        failureRate: number;
    };
}
export default DataValidationSystem;
//# sourceMappingURL=DataValidationSystem.d.ts.map