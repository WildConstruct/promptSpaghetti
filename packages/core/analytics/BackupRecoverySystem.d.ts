/**
 * Backup and Recovery System - Story 1.5 Task 3
 *
 * Implements comprehensive backup and recovery procedures for analytics data
 * to ensure zero data loss during migration and system operations.
 */
import { z } from 'zod';
import { EventFilter } from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';
export declare const BackupConfigSchema: z.ZodObject<{
    backupLocation: z.ZodDefault<z.ZodString>;
    compressionEnabled: z.ZodDefault<z.ZodBoolean>;
    encryptionEnabled: z.ZodDefault<z.ZodBoolean>;
    encryptionKey: z.ZodOptional<z.ZodString>;
    retentionDays: z.ZodDefault<z.ZodNumber>;
    batchSize: z.ZodDefault<z.ZodNumber>;
    includeMetadata: z.ZodDefault<z.ZodBoolean>;
    verifyBackup: z.ZodDefault<z.ZodBoolean>;
    maxBackupSize: z.ZodDefault<z.ZodNumber>;
    format: z.ZodDefault<z.ZodEnum<["json", "jsonl", "csv", "parquet"]>>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "csv" | "parquet" | "jsonl";
    includeMetadata: boolean;
    batchSize: number;
    retentionDays: number;
    compressionEnabled: boolean;
    backupLocation: string;
    encryptionEnabled: boolean;
    verifyBackup: boolean;
    maxBackupSize: number;
    encryptionKey?: string | undefined;
}, {
    format?: "json" | "csv" | "parquet" | "jsonl" | undefined;
    includeMetadata?: boolean | undefined;
    batchSize?: number | undefined;
    encryptionKey?: string | undefined;
    retentionDays?: number | undefined;
    compressionEnabled?: boolean | undefined;
    backupLocation?: string | undefined;
    encryptionEnabled?: boolean | undefined;
    verifyBackup?: boolean | undefined;
    maxBackupSize?: number | undefined;
}>;
export type BackupConfig = z.infer<typeof BackupConfigSchema>;
export declare enum BackupStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    VERIFYING = "verifying",
    VERIFIED = "verified",
    CORRUPTED = "corrupted"
}
export declare enum RecoveryStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    VALIDATING = "validating",
    VALIDATED = "validated"
}
export interface BackupMetadata {
    backupId: string;
    backupName: string;
    description?: string;
    status: BackupStatus;
    createdAt: number;
    completedAt?: number;
    size: number;
    eventCount: number;
    systemSources: string[];
    timeRange: {,
        start: number;
        end: number;
    };
    config: BackupConfig;
    filePath: string;
    checksum?: string;
    version: string;
    format: string;
    compressed: boolean;
    encrypted: boolean;
}
export interface RecoveryMetadata {
    recoveryId: string;
    backupId: string;
    status: RecoveryStatus;
    startedAt: number;
    completedAt?: number;
    targetSystem: string;
    recoveredEventCount: number;
    failedEventCount: number;
    validationResults?: {
        passed: boolean;
        issues: string[];
    };
}
export interface BackupProgress {
    backupId: string;
    status: BackupStatus;
    progress: {,
        percentage: number;
        processedEvents: number;
        totalEvents: number;
        currentBatch: number;
        totalBatches: number;
        bytesWritten: number;
        estimatedTimeRemaining: number;
    };
    currentOperation: string;
    throughput: {,
        eventsPerSecond: number;
        bytesPerSecond: number;
    };
}
/**
 * Backup and Recovery System
 *
 * Provides comprehensive backup and recovery capabilities for analytics data
 */
export declare class BackupRecoverySystem {
    private eventRepository;
    private backupMetadata;
    private recoveryMetadata;
    private activeBackups;
    private activeRecoveries;
    constructor(eventRepository: EventRepository);
    /**
     * Create backup of analytics data
     */
    createBackup();
      backupName: string,
      filter?: EventFilter,
      config?: Partial<BackupConfig>,
      description?: string
    ): Promise<string>;
    /**
     * Perform the actual backup operation
     */
    private performBackup;
    /**
     * Restore data from backup
     */
    restoreFromBackup(backupId: string, targetFilter?: EventFilter, validateBeforeRestore?: boolean): Promise<string>;
    /**
     * Perform the actual recovery operation
     */
    private performRecovery;
    /**
     * Verify backup integrity
     */
    verifyBackup(backupId: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    /**
     * List all backups
     */
    listBackups(filter?: {)
        status?: BackupStatus;
        systemSource?: string;
    }): BackupMetadata[];
    /**
     * Get backup details
     */
    getBackup(backupId: string): BackupMetadata | null;
    /**
     * Get backup progress
     */
    getBackupProgress(backupId: string): BackupProgress | null;
    /**
     * Get recovery details
     */
    getRecovery(recoveryId: string): RecoveryMetadata | null;
    /**
     * Delete backup
     */
    deleteBackup(backupId: string): Promise<boolean>;
    /**
     * Cleanup old backups based on retention policy
     */
    cleanupOldBackups(retentionDays?: number): Promise<number>;
    /**
     * Helper Methods
     */
    /**
     * Format batch data for different formats
     */
    private formatBatchData;
    /**
     * Generate CSV headers
     */
    private generateCSVHeaders;
    /**
     * Convert event to CSV row
     */
    private eventToCSV;
    /**
     * Read backup data
     */
    private readBackupData;
    /**
     * Calculate file checksum
     */
    private calculateFileChecksum;
    /**
     * Compress file (placeholder implementation)
     */
    private compressFile;
    /**
     * Encrypt file (placeholder implementation)
     */
    private encryptFile;
    /**
     * Validate recovery
     */
    private validateRecovery;
    /**
     * Check if event matches filter
     */
    private matchesFilter;
    /**
     * Load existing backups from metadata
     */
    private loadExistingBackups;
    /**
     * Update backup status
     */
    private updateBackupStatus;
    /**
     * Update current operation
     */
    private updateCurrentOperation;
    /**
     * Update backup progress
     */
    private updateBackupProgress;
    /**
     * Update recovery status
     */
    private updateRecoveryStatus;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Get backup summary
     */
    getBackupSummary(): {
        totalBackups: number;
        completedBackups: number;
        totalSize: number;
        totalEvents: number;
        oldestBackup?: number;
        newestBackup?: number;
    };
}
export default BackupRecoverySystem;
//# sourceMappingURL=BackupRecoverySystem.d.ts.map