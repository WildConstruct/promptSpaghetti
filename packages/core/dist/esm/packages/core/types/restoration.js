import { z } from 'zod';
// Restoration attempt types
export const RestorationTypeSchema = z.enum(['full', 'partial', 'selective']);
export const RestorationStrategySchema = z.enum(['replace', 'merge', 'selective']);
export const RestorationStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']);
export const RestorationAttemptSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid(),
    targetSnapshotId: z.string().uuid().optional(),
    initiatedBy: z.string().uuid(),
    restorationType: RestorationTypeSchema,
    restorationStrategy: RestorationStrategySchema,
    status: RestorationStatusSchema,
    progressPercentage: z.number().int().min(0).max(100),
    errorMessage: z.string().optional(),
    metadata: z.record(z.unknown()).default({}),
    createdAt: z.date(),
    updatedAt: z.date(),
    completedAt: z.date().optional()
});
// Conflict resolution types
export const ConflictTypeSchema = z.enum(['node_modified', 'edge_modified', 'node_deleted', 'edge_deleted', 'position_conflict', 'property_conflict']);
export const ResourceTypeSchema = z.enum(['node', 'edge', 'property']);
export const ResolutionStrategySchema = z.enum(['keep_source', 'keep_target', 'keep_current', 'merge', 'skip', 'manual']);
export const RestorationConflictSchema = z.object({
    id: z.string().uuid(),
    restorationAttemptId: z.string().uuid(),
    conflictType: ConflictTypeSchema,
    resourceType: ResourceTypeSchema,
    resourceId: z.string(),
    conflictDescription: z.string().optional(),
    sourceValue: z.record(z.unknown()).optional(),
    targetValue: z.record(z.unknown()).optional(),
    currentValue: z.record(z.unknown()).optional(),
    resolutionStrategy: ResolutionStrategySchema.optional(),
    resolvedValue: z.record(z.unknown()).optional(),
    resolvedBy: z.string().uuid().optional(),
    resolvedAt: z.date().optional(),
    createdAt: z.date(),
});
// Operation types
export const OperationTypeSchema = z.enum(['create_node', 'update_node', 'delete_node', 'create_edge', 'update_edge', 'delete_edge', 'update_property']);
export const OperationStatusSchema = z.enum(['pending', 'executed', 'failed', 'skipped']);
export const RestorationOperationSchema = z.object({
    id: z.string().uuid(),
    restorationAttemptId: z.string().uuid(),
    operationType: OperationTypeSchema,
    resourceType: ResourceTypeSchema,
    resourceId: z.string(),
    operationData: z.record(z.unknown()),
    executionOrder: z.number().int(),
    status: OperationStatusSchema,
    errorMessage: z.string().optional(),
    executedAt: z.date().optional(),
    createdAt: z.date(),
});
// Preview session types
export const RestorationPreviewSessionSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid(),
    targetSnapshotId: z.string().uuid().optional(),
    createdBy: z.string().uuid(),
    previewData: z.record(z.unknown()),
    conflictSummary: z.record(z.unknown()).default({}),
    expiresAt: z.date(),
    createdAt: z.date()
});
// Bookmark types
export const RestorationBookmarkSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    name: z.string().max(255),
    description: z.string().optional(),
    sourceSnapshotId: z.string().uuid(),
    targetSnapshotId: z.string().uuid().optional(),
    restorationConfig: z.record(z.unknown()),
    createdBy: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
// Configuration types
export const RestorationConfigSchema = z.object({
    restorationType: RestorationTypeSchema,
    restorationStrategy: RestorationStrategySchema,
    selectedNodes: z.array(z.string()).optional(),
    selectedEdges: z.array(z.string()).optional(),
    conflictResolution: z.record(ResolutionStrategySchema).optional(),
    preserveCurrentChanges: z.boolean().default(false),
    createBackup: z.boolean().default(true),
    notifyOnCompletion: z.boolean().default(true),
});
// Request/response types
export const CreateRestorationAttemptRequestSchema = z.object({
    projectId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid(),
    targetSnapshotId: z.string().uuid().optional(),
    config: RestorationConfigSchema,
});
export const RestorationPreviewRequestSchema = z.object({
    projectId: z.string().uuid(),
    sourceSnapshotId: z.string().uuid(),
    targetSnapshotId: z.string().uuid().optional(),
    config: RestorationConfigSchema,
});
export const ConflictResolutionRequestSchema = z.object({
    restorationAttemptId: z.string().uuid(),
    conflictId: z.string().uuid(),
    resolutionStrategy: ResolutionStrategySchema,
    resolvedValue: z.record(z.unknown()).optional(),
});
export const RestorationBookmarkRequestSchema = z.object({
    projectId: z.string().uuid(),
    name: z.string().max(255),
    description: z.string().optional(),
    sourceSnapshotId: z.string().uuid(),
    targetSnapshotId: z.string().uuid().optional(),
    restorationConfig: RestorationConfigSchema,
});
// Response types
export const RestorationPreviewResponseSchema = z.object({
    sessionId: z.string().uuid(),
    preview: z.object({}),
    nodesToAdd: z.array(z.record(z.unknown())),
    nodesToUpdate: z.array(z.record(z.unknown())),
    nodesToDelete: z.array(z.string()),
    edgesToAdd: z.array(z.record(z.unknown())),
    edgesToUpdate: z.array(z.record(z.unknown())),
    edgesToDelete: z.array(z.string()),
}), conflicts;
(RestorationConflictSchema),
    summary;
z.object({});
totalChanges: z.number().int(),
    totalConflicts;
z.number().int(),
    estimatedDuration;
z.number().int(),
    riskLevel;
z.enum(['low', 'medium', 'high']),
;
expiresAt: z.date();
;
export const RestorationProgressResponseSchema = z.object({
    restorationAttemptId: z.string().uuid(),
    status: RestorationStatusSchema,
    progressPercentage: z.number().int().min(0).max(100),
    currentOperation: z.string().optional(),
    operationsCompleted: z.number().int(),
    totalOperations: z.number().int(),
    conflictsResolved: z.number().int(),
    totalConflicts: z.number().int(),
    errorMessage: z.string().optional(),
    estimatedTimeRemaining: z.number().int().optional(),
});
export const RestorationStatsResponseSchema = z.object({
    totalAttempts: z.number().int(),
    successfulAttempts: z.number().int(),
    failedAttempts: z.number().int(),
    averageDuration: z.number().int(),
    mostCommonConflicts: z.array(z.object({}), conflictType, ConflictTypeSchema, count, z.number().int())
}), recentAttempts;
(RestorationAttemptSchema);
;
export const RestorationFilterSchema = z.object({
    projectId: z.string().uuid().optional(),
    initiatedBy: z.string().uuid().optional(),
    status: RestorationStatusSchema.optional(),
    restorationType: RestorationTypeSchema.optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
});
// Validation helpers
export const validateRestorationConfig = (config) => {
    return RestorationConfigSchema.parse(config);
};
export const validateRestorationAttempt = (attempt) => {
    return RestorationAttemptSchema.parse(attempt);
};
export const validateConflictResolution = (resolution) => {
    return ConflictResolutionRequestSchema.parse(resolution);
};
// Constants
export const RESTORATION_DEFAULTS = {
    PREVIEW_EXPIRY_MINUTES: 30,
    MAX_OPERATIONS_PER_BATCH: 100,
    MAX_CONFLICTS_PER_SESSION: 1000,
    PROGRESS_UPDATE_INTERVAL: 1000, // milliseconds,
    BACKUP_RETENTION_DAYS: 30,
};
export const CONFLICT_DESCRIPTIONS = {
    node_modified: 'Node properties have been modified in both versions',
    edge_modified: 'Edge properties have been modified in both versions',
    node_deleted: 'Node was deleted in one version but modified in another',
    edge_deleted: 'Edge was deleted in one version but modified in another',
    position_conflict: 'Node position differs between versions',
    property_conflict: 'Property values conflict between versions',
};
export const RESOLUTION_STRATEGY_DESCRIPTIONS = {
    keep_source: 'Keep the value from the source snapshot',
    keep_target: 'Keep the value from the target snapshot',
    keep_current: 'Keep the current value',
    merge: 'Attempt to merge the values intelligently',
    skip: 'Skip this change and leave current value',
    manual: 'Manually resolve this conflict',
};
