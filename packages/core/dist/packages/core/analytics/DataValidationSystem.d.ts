/**
 * Data Validation and Consistency System - Story 1.5 Task 3
 *
 * Implements comprehensive data validation and consistency checking
 * to ensure zero data loss during analytics migration and integration.
 */
import { z } from 'zod';
import { EventRepository } from './EventPersistenceLayer';
export declare const ValidationRuleSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
export interface ValidationResult {
    ruleId: string;
    ruleName: string;
    passed: boolean;
    severity: string;
    message: string;
    affectedRecords: string;
    details: {
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
    summary: {
        totalRecords: number;
        validRecords: number;
        invalidRecords: number;
        warningRecords: number;
        errorRate: number;
    };
    violations: ValidationResult;
    recommendations: string;
    timestamp: number;
}
export interface DataQualityMetrics {
    completeness: {
        score: number;
        missingFields: {
            [field: string]: number;
        };
        requiredFieldsCoverage: number;
    };
    accuracy: {
        score: number;
        invalidValues: number;
        formatErrors: number;
        typeErrors: number;
    };
    consistency: {
        score: number;
        duplicates: number;
        contradictions: number;
        referentialIntegrityErrors: number;
    };
    timeliness: {
        score: number;
        lateArrivals: number;
        futureTimestamps: number;
        timestampGaps: number;
    };
    integrity: {
        score: number;
        corruptedRecords: number;
        checksumFailures: number;
        structuralErrors: number;
    };
    overall: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        issueCount: number;
        recommendation: string;
    };
}
export declare class DataValidationSystem {
    private eventRepository;
    private validationRules;
    private validationHistory;
    constructor(eventRepository: EventRepository);
    /**
     * Initialize default validation rules
     */
    private initializeDefaultRules;
    violationCount: violations.length;
}
//# sourceMappingURL=DataValidationSystem.d.ts.map