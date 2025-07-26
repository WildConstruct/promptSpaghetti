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
export declare const MigrationConfigSchema: z.ZodObject<{
    batchSize: z.ZodDefault<z.ZodNumber>;
    concurrency: z.ZodDefault<z.ZodNumber>;
    retryAttempts: z.ZodDefault<z.ZodNumber>;
    retryDelayMs: z.ZodDefault<z.ZodNumber>;
    validationEnabled: z.ZodDefault<z.ZodBoolean>;
    backupEnabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    preserveTimestamps: z.ZodDefault<z.ZodBoolean>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    batchSize: number;
    includeMetadata: boolean;
    concurrency: number;
    retryAttempts: number;
    retryDelayMs: number;
    validationEnabled: boolean;
    backupEnabled: boolean;
    continueOnError: boolean;
    dryRun: boolean;
    preserveTimestamps: boolean;
}, {
    batchSize?: number | undefined;
    includeMetadata?: boolean | undefined;
    concurrency?: number | undefined;
    retryAttempts?: number | undefined;
    retryDelayMs?: number | undefined;
    validationEnabled?: boolean | undefined;
    backupEnabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
    dryRun?: boolean | undefined;
    preserveTimestamps?: boolean | undefined;
}>;
export type MigrationConfig = z.infer<typeof MigrationConfigSchema>;
export declare enum MigrationStatus {
    PENDING = "pending",
    RUNNING = "running",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export interface MigrationResult {
    migrationId: string;
    systemName: string;
    status: MigrationStatus;
    startTime: number;
    endTime?: number;
    duration?: number;
    totalRecords: number;
    processedRecords: number;
    migratedRecords: number;
    failedRecords: number;
    skippedRecords: number;
    validationErrors: ValidationError[];
    performanceMetrics: {
        recordsPerSecond: number;
        averageBatchTime: number;
        peakMemoryUsage: number;
        totalDataSize: number;
    };
    backupLocation?: string;
    rollbackAvailable: boolean;
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
        enum?: any[];
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
/**
 * Analytics Data Migration Service
 *
 * Orchestrates migration of analytics data from legacy systems to unified event bus
 */
export declare class AnalyticsDataMigrationService {
    private eventBus;
    private adapterManager;
    private eventRepository;
    private activeMigrations;
    private transformationRules;
    private migrationResults;
    constructor(eventBus: UnifiedEventBus, adapterManager: AnalyticsAdapterManager, eventRepository: EventRepository);
    /**
     * Initialize data transformation rules for each system
     */
    private initializeTransformationRules;
    /**
     * Start migration for a specific analytics system
     */
    startMigration(systemName: string, sourceData: any[], config?: Partial<MigrationConfig>): Promise<string>;
    /**
     * Perform the actual migration
     */
    private performMigration;
    /**
     * Process a batch of records
     */
    private processBatch;
    /**
     * Process individual record
     */
    private processRecord;
    /**
     * Transform record using transformation rules
     */
    private transformRecord;
    /**
     * Apply individual transformation rule
     */
    private applyTransformationRule;
    /**
     * Evaluate condition expression
     */
    private evaluateCondition;
    /**
     * Validate transformed event
     */
    private validateTransformedEvent;
    /**
     * Perform final validation
     */
    private performFinalValidation;
    /**
     * Create backup of source data
     */
    private createBackup;
    /**
     * Update migration status
     */
    private updateMigrationStatus;
    /**
     * Update current operation
     */
    private updateCurrentOperation;
    /**
     * Update migration progress
     */
    private updateProgress;
    /**
     * Get nested property value
     */
    private getNestedProperty;
    /**
     * Set nested property value
     */
    private setNestedProperty;
    /**
     * Calculate data size
     */
    private calculateDataSize;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Public API Methods
     */
    /**
     * Get migration progress
     */
    getMigrationProgress(migrationId: string): MigrationProgress | null;
    /**
     * Get migration result
     */
    getMigrationResult(migrationId: string): MigrationResult | null;
    /**
     * List all migrations
     */
    listMigrations(): {
        active: MigrationProgress[];
        completed: MigrationResult[];
    };
    /**
     * Cancel migration
     */
    cancelMigration(migrationId: string): boolean;
    /**
     * Pause migration
     */
    pauseMigration(migrationId: string): boolean;
    /**
     * Resume migration
     */
    resumeMigration(migrationId: string): boolean;
    /**
     * Rollback migration
     */
    rollbackMigration(migrationId: string): Promise<boolean>;
    /**
     * Add transformation rule
     */
    addTransformationRule(systemName: string, rule: DataTransformationRule): void;
    /**
     * Get transformation rules for system
     */
    getTransformationRules(systemName: string): DataTransformationRule[];
    /**
     * Migrate all systems
     */
    migrateAllSystems(systemsData: {
        [systemName: string]: any[];
    }, config?: Partial<MigrationConfig>): Promise<{
        [systemName: string]: string;
    }>;
    /**
     * Get migration summary
     */
    getMigrationSummary(): {
        totalMigrations: number;
        activeMigrations: number;
        completedMigrations: number;
        failedMigrations: number;
        totalRecordsMigrated: number;
        totalValidationErrors: number;
    };
}
export default AnalyticsDataMigrationService;
//# sourceMappingURL=AnalyticsDataMigration.d.ts.map