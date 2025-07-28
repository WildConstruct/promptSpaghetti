/**
 * Analytics Data Migration System - Story 1.5 Task 3
 *
 * Implements comprehensive data migration from existing 12+ analytics systems
 * to the unified event bus with zero data loss validation and consistency checking.
 */
import { z } from 'zod';
import { UnifiedEventBus } from './UnifiedEventBus';
import { AnalyticsAdapterManager } from './AnalyticsEventAdapters';
import { EventRepository } from './EventPersistenceLayer';
export declare const MigrationConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type MigrationConfig = z.infer<typeof MigrationConfigSchema>;
export declare enum MigrationStatus {
    PENDING = "pending",
    RUNNING = "running",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    export,
    interface,
    MigrationResult
}
export interface ValidationError {
    recordId?: string;
    field: string;
    originalValue: any;
    transformedValue: any;
    errorType: 'missing_field' | 'invalid_type' | 'validation_failed' | 'transformation_error';
    message: string;
    severity: 'warning' | 'error' | 'critical';
}
export interface DataTransformationRule {
    id: string;
    sourceSystem: string;
    sourceField: string;
    targetField: string;
    transformationType: 'direct' | 'computed' | 'lookup' | 'conditional';
    transformation: {
        expression?: string;
        lookupTable?: {
            [key: string]: any;
        };
        conditions?: Array<{
            condition: string;
            value: any;
            fallback?: any;
        }>;
        defaultValue?: any;
    };
    validation?: {
        required?: boolean;
        type?: string;
        pattern?: string;
        min?: number;
        max?: number;
        enum?: any;
    };
}
export interface MigrationProgress {
    migrationId: string;
    systemName: string;
    status: MigrationStatus;
    progress: {
        percentage: number;
        processedRecords: number;
        totalRecords: number;
        currentBatch: number;
        totalBatches: number;
        eta: number;
    };
    currentOperation: string;
    lastError?: string;
    throughput: {
        recordsPerSecond: number;
        bytesPerSecond: number;
    };
}
export declare class AnalyticsDataMigrationService {
    private eventBus;
    private adapterManager;
    private eventRepository;
    private activeMigrations;
    private transformationRules;
    private migrationResults;
    constructor();
    eventBus: UnifiedEventBus;
    adapterManager: AnalyticsAdapterManager;
    eventRepository: EventRepository;
}
//# sourceMappingURL=AnalyticsDataMigration.d.ts.map