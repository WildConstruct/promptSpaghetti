import { z } from 'zod';
export declare const RestorationTypeSchema: z.ZodEnum<["full", "partial", "selective"]>;
export declare const RestorationStrategySchema: z.ZodEnum<["replace", "merge", "selective"]>;
export declare const RestorationStatusSchema: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
export declare const RestorationAttemptSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type RestorationType = z.infer<typeof RestorationTypeSchema>;
export type RestorationStrategy = z.infer<typeof RestorationStrategySchema>;
export type RestorationStatus = z.infer<typeof RestorationStatusSchema>;
export type RestorationAttempt = z.infer<typeof RestorationAttemptSchema>;
export declare const ConflictTypeSchema: z.ZodEnum<["node_modified", "edge_modified", "node_deleted", "edge_deleted", "position_conflict", "property_conflict"]>;
export declare const ResourceTypeSchema: z.ZodEnum<["node", "edge", "property"]>;
export declare const ResolutionStrategySchema: z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>;
export declare const RestorationConflictSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ConflictType = z.infer<typeof ConflictTypeSchema>;
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type ResolutionStrategy = z.infer<typeof ResolutionStrategySchema>;
export type RestorationConflict = z.infer<typeof RestorationConflictSchema>;
export declare const OperationTypeSchema: z.ZodEnum<["create_node", "update_node", "delete_node", "create_edge", "update_edge", "delete_edge", "update_property"]>;
export declare const OperationStatusSchema: z.ZodEnum<["pending", "executed", "failed", "skipped"]>;
export declare const RestorationOperationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type OperationType = z.infer<typeof OperationTypeSchema>;
export type OperationStatus = z.infer<typeof OperationStatusSchema>;
export type RestorationOperation = z.infer<typeof RestorationOperationSchema>;
export declare const RestorationPreviewSessionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type RestorationPreviewSession = z.infer<typeof RestorationPreviewSessionSchema>;
export declare const RestorationBookmarkSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type RestorationBookmark = z.infer<typeof RestorationBookmarkSchema>;
export declare const RestorationConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type RestorationConfig = z.infer<typeof RestorationConfigSchema>;
export declare const CreateRestorationAttemptRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const RestorationPreviewRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ConflictResolutionRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const RestorationBookmarkRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CreateRestorationAttemptRequest = z.infer<typeof CreateRestorationAttemptRequestSchema>;
export type RestorationPreviewRequest = z.infer<typeof RestorationPreviewRequestSchema>;
export type ConflictResolutionRequest = z.infer<typeof ConflictResolutionRequestSchema>;
export type RestorationBookmarkRequest = z.infer<typeof RestorationBookmarkRequestSchema>;
export declare const RestorationPreviewResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const RestorationProgressResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const RestorationStatsResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type RestorationPreviewResponse = z.infer<typeof RestorationPreviewResponseSchema>;
export type RestorationProgressResponse = z.infer<typeof RestorationProgressResponseSchema>;
export type RestorationStatsResponse = z.infer<typeof RestorationStatsResponseSchema>;
export interface RestorationContext {
    projectId: string;
    userId: string;
    sourceSnapshot: any;
    targetSnapshot?: any;
    currentState: any;
    config: RestorationConfig;
}
export interface ConflictResolutionResult {
    conflictId: string;
    resolved: boolean;
    resolvedValue?: any;
    strategy: ResolutionStrategy;
    errorMessage?: string;
}
export interface RestorationResult {
    success: boolean;
    restorationAttemptId: string;
    operationsExecuted: number;
    conflictsResolved: number;
    errorMessage?: string;
    duration: number;
    backupSnapshotId?: string;
}
export interface RestorationEvent {
    type: 'progress' | 'conflict' | 'completed' | 'failed' | 'cancelled';
    restorationAttemptId: string;
    data: any;
    timestamp: Date;
}
export interface ConflictEvent {
    type: 'conflict_detected' | 'conflict_resolved';
    conflictId: string;
    restorationAttemptId: string;
    data: any;
    timestamp: Date;
}
export declare const RestorationFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type RestorationFilter = z.infer<typeof RestorationFilterSchema>;
export declare const validateRestorationConfig: (config: unknown) => RestorationConfig;
export declare const validateRestorationAttempt: (attempt: unknown) => RestorationAttempt;
export declare const validateConflictResolution: (resolution: unknown) => ConflictResolutionRequest;
export declare const RESTORATION_DEFAULTS: {
    readonly PREVIEW_EXPIRY_MINUTES: 30;
    readonly MAX_OPERATIONS_PER_BATCH: 100;
    readonly MAX_CONFLICTS_PER_SESSION: 1000;
    readonly PROGRESS_UPDATE_INTERVAL: 1000;
    readonly BACKUP_RETENTION_DAYS: 30;
};
export declare const CONFLICT_DESCRIPTIONS: {
    readonly node_modified: "Node properties have been modified in both versions";
    readonly edge_modified: "Edge properties have been modified in both versions";
    readonly node_deleted: "Node was deleted in one version but modified in another";
    readonly edge_deleted: "Edge was deleted in one version but modified in another";
    readonly position_conflict: "Node position differs between versions";
    readonly property_conflict: "Property values conflict between versions";
};
export declare const RESOLUTION_STRATEGY_DESCRIPTIONS: {
    readonly keep_source: "Keep the value from the source snapshot";
    readonly keep_target: "Keep the value from the target snapshot";
    readonly keep_current: "Keep the current value";
    readonly merge: "Attempt to merge the values intelligently";
    readonly skip: "Skip this change and leave current value";
    readonly manual: "Manually resolve this conflict";
};
//# sourceMappingURL=restoration.d.ts.map