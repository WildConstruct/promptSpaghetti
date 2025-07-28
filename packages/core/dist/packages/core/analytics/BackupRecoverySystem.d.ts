/**
 * Backup and Recovery System - Story 1.5 Task 3
 *
 * Implements comprehensive backup and recovery procedures for analytics data
 * to ensure zero data loss during migration and system operations.
 */
import { z } from 'zod';
export declare const BackupConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type BackupConfig = z.infer<typeof BackupConfigSchema>;
export declare enum BackupStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    VERIFYING = "verifying",
    VERIFIED = "verified",
    CORRUPTED = "corrupted",
    export,
    enum,
    RecoveryStatus
}
//# sourceMappingURL=BackupRecoverySystem.d.ts.map