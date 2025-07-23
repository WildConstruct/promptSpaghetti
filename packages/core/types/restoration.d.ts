import { z } from 'zod';
export declare const RestorationTypeSchema: z.ZodEnum<["full", "partial", "selective"]>;
export declare const RestorationStrategySchema: z.ZodEnum<["replace", "merge", "selective"]>;
export declare const RestorationStatusSchema: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
export declare const RestorationAttemptSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    sourceSnapshotId: z.ZodString;
    targetSnapshotId: z.ZodOptional<z.ZodString>;
    initiatedBy: z.ZodString;
    restorationType: z.ZodEnum<["full", "partial", "selective"]>;
    restorationStrategy: z.ZodEnum<["replace", "merge", "selective"]>;
    status: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
    progressPercentage: z.ZodNumber;
    errorMessage: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    completedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
    metadata: Record<string, unknown>;
    projectId: string;
    initiatedBy: string;
    sourceSnapshotId: string;
    restorationType: "full" | "partial" | "selective";
    restorationStrategy: "replace" | "merge" | "selective";
    progressPercentage: number;
    errorMessage?: string | undefined;
    completedAt?: Date | undefined;
    targetSnapshotId?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
    projectId: string;
    initiatedBy: string;
    sourceSnapshotId: string;
    restorationType: "full" | "partial" | "selective";
    restorationStrategy: "replace" | "merge" | "selective";
    progressPercentage: number;
    metadata?: Record<string, unknown> | undefined;
    errorMessage?: string | undefined;
    completedAt?: Date | undefined;
    targetSnapshotId?: string | undefined;
}>;
export type RestorationType = z.infer<typeof RestorationTypeSchema>;
export type RestorationStrategy = z.infer<typeof RestorationStrategySchema>;
export type RestorationStatus = z.infer<typeof RestorationStatusSchema>;
export type RestorationAttempt = z.infer<typeof RestorationAttemptSchema>;
export declare const ConflictTypeSchema: z.ZodEnum<["node_modified", "edge_modified", "node_deleted", "edge_deleted", "position_conflict", "property_conflict"]>;
export declare const ResourceTypeSchema: z.ZodEnum<["node", "edge", "property"]>;
export declare const ResolutionStrategySchema: z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>;
export declare const RestorationConflictSchema: z.ZodObject<{
    id: z.ZodString;
    restorationAttemptId: z.ZodString;
    conflictType: z.ZodEnum<["node_modified", "edge_modified", "node_deleted", "edge_deleted", "position_conflict", "property_conflict"]>;
    resourceType: z.ZodEnum<["node", "edge", "property"]>;
    resourceId: z.ZodString;
    conflictDescription: z.ZodOptional<z.ZodString>;
    sourceValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    targetValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    currentValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    resolutionStrategy: z.ZodOptional<z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>>;
    resolvedValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    resolvedBy: z.ZodOptional<z.ZodString>;
    resolvedAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    resourceId: string;
    resourceType: "node" | "property" | "edge";
    conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
    restorationAttemptId: string;
    targetValue?: Record<string, unknown> | undefined;
    resolvedAt?: Date | undefined;
    currentValue?: Record<string, unknown> | undefined;
    resolutionStrategy?: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current" | undefined;
    resolvedBy?: string | undefined;
    conflictDescription?: string | undefined;
    sourceValue?: Record<string, unknown> | undefined;
    resolvedValue?: Record<string, unknown> | undefined;
}, {
    id: string;
    createdAt: Date;
    resourceId: string;
    resourceType: "node" | "property" | "edge";
    conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
    restorationAttemptId: string;
    targetValue?: Record<string, unknown> | undefined;
    resolvedAt?: Date | undefined;
    currentValue?: Record<string, unknown> | undefined;
    resolutionStrategy?: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current" | undefined;
    resolvedBy?: string | undefined;
    conflictDescription?: string | undefined;
    sourceValue?: Record<string, unknown> | undefined;
    resolvedValue?: Record<string, unknown> | undefined;
}>;
export type ConflictType = z.infer<typeof ConflictTypeSchema>;
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type ResolutionStrategy = z.infer<typeof ResolutionStrategySchema>;
export type RestorationConflict = z.infer<typeof RestorationConflictSchema>;
export declare const OperationTypeSchema: z.ZodEnum<["create_node", "update_node", "delete_node", "create_edge", "update_edge", "delete_edge", "update_property"]>;
export declare const OperationStatusSchema: z.ZodEnum<["pending", "executed", "failed", "skipped"]>;
export declare const RestorationOperationSchema: z.ZodObject<{
    id: z.ZodString;
    restorationAttemptId: z.ZodString;
    operationType: z.ZodEnum<["create_node", "update_node", "delete_node", "create_edge", "update_edge", "delete_edge", "update_property"]>;
    resourceType: z.ZodEnum<["node", "edge", "property"]>;
    resourceId: z.ZodString;
    operationData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    executionOrder: z.ZodNumber;
    status: z.ZodEnum<["pending", "executed", "failed", "skipped"]>;
    errorMessage: z.ZodOptional<z.ZodString>;
    executedAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    status: "pending" | "failed" | "skipped" | "executed";
    resourceId: string;
    resourceType: "node" | "property" | "edge";
    operationType: "create_node" | "update_node" | "delete_node" | "create_edge" | "update_edge" | "delete_edge" | "update_property";
    restorationAttemptId: string;
    operationData: Record<string, unknown>;
    executionOrder: number;
    errorMessage?: string | undefined;
    executedAt?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    status: "pending" | "failed" | "skipped" | "executed";
    resourceId: string;
    resourceType: "node" | "property" | "edge";
    operationType: "create_node" | "update_node" | "delete_node" | "create_edge" | "update_edge" | "delete_edge" | "update_property";
    restorationAttemptId: string;
    operationData: Record<string, unknown>;
    executionOrder: number;
    errorMessage?: string | undefined;
    executedAt?: Date | undefined;
}>;
export type OperationType = z.infer<typeof OperationTypeSchema>;
export type OperationStatus = z.infer<typeof OperationStatusSchema>;
export type RestorationOperation = z.infer<typeof RestorationOperationSchema>;
export declare const RestorationPreviewSessionSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    sourceSnapshotId: z.ZodString;
    targetSnapshotId: z.ZodOptional<z.ZodString>;
    createdBy: z.ZodString;
    previewData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    conflictSummary: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    expiresAt: z.ZodDate;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    projectId: string;
    expiresAt: Date;
    previewData: Record<string, unknown>;
    createdBy: string;
    sourceSnapshotId: string;
    conflictSummary: Record<string, unknown>;
    targetSnapshotId?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    projectId: string;
    expiresAt: Date;
    previewData: Record<string, unknown>;
    createdBy: string;
    sourceSnapshotId: string;
    targetSnapshotId?: string | undefined;
    conflictSummary?: Record<string, unknown> | undefined;
}>;
export type RestorationPreviewSession = z.infer<typeof RestorationPreviewSessionSchema>;
export declare const RestorationBookmarkSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sourceSnapshotId: z.ZodString;
    targetSnapshotId: z.ZodOptional<z.ZodString>;
    restorationConfig: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    projectId: string;
    createdBy: string;
    sourceSnapshotId: string;
    restorationConfig: Record<string, unknown>;
    description?: string | undefined;
    targetSnapshotId?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    projectId: string;
    createdBy: string;
    sourceSnapshotId: string;
    restorationConfig: Record<string, unknown>;
    description?: string | undefined;
    targetSnapshotId?: string | undefined;
}>;
export type RestorationBookmark = z.infer<typeof RestorationBookmarkSchema>;
export declare const RestorationConfigSchema: z.ZodObject<{
    restorationType: z.ZodEnum<["full", "partial", "selective"]>;
    restorationStrategy: z.ZodEnum<["replace", "merge", "selective"]>;
    selectedNodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    selectedEdges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    conflictResolution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>>>;
    preserveCurrentChanges: z.ZodDefault<z.ZodBoolean>;
    createBackup: z.ZodDefault<z.ZodBoolean>;
    notifyOnCompletion: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    createBackup: boolean;
    restorationType: "full" | "partial" | "selective";
    restorationStrategy: "replace" | "merge" | "selective";
    preserveCurrentChanges: boolean;
    notifyOnCompletion: boolean;
    conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
    selectedNodes?: string[] | undefined;
    selectedEdges?: string[] | undefined;
}, {
    restorationType: "full" | "partial" | "selective";
    restorationStrategy: "replace" | "merge" | "selective";
    createBackup?: boolean | undefined;
    conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
    selectedNodes?: string[] | undefined;
    selectedEdges?: string[] | undefined;
    preserveCurrentChanges?: boolean | undefined;
    notifyOnCompletion?: boolean | undefined;
}>;
export type RestorationConfig = z.infer<typeof RestorationConfigSchema>;
export declare const CreateRestorationAttemptRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    sourceSnapshotId: z.ZodString;
    targetSnapshotId: z.ZodOptional<z.ZodString>;
    config: z.ZodObject<{
        restorationType: z.ZodEnum<["full", "partial", "selective"]>;
        restorationStrategy: z.ZodEnum<["replace", "merge", "selective"]>;
        selectedNodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        selectedEdges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        conflictResolution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>>>;
        preserveCurrentChanges: z.ZodDefault<z.ZodBoolean>;
        createBackup: z.ZodDefault<z.ZodBoolean>;
        notifyOnCompletion: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        createBackup: boolean;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        preserveCurrentChanges: boolean;
        notifyOnCompletion: boolean;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
    }, {
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        createBackup?: boolean | undefined;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
        preserveCurrentChanges?: boolean | undefined;
        notifyOnCompletion?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    config: {
        createBackup: boolean;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        preserveCurrentChanges: boolean;
        notifyOnCompletion: boolean;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
    };
    projectId: string;
    sourceSnapshotId: string;
    targetSnapshotId?: string | undefined;
}, {
    config: {
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        createBackup?: boolean | undefined;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
        preserveCurrentChanges?: boolean | undefined;
        notifyOnCompletion?: boolean | undefined;
    };
    projectId: string;
    sourceSnapshotId: string;
    targetSnapshotId?: string | undefined;
}>;
export declare const RestorationPreviewRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    sourceSnapshotId: z.ZodString;
    targetSnapshotId: z.ZodOptional<z.ZodString>;
    config: z.ZodObject<{
        restorationType: z.ZodEnum<["full", "partial", "selective"]>;
        restorationStrategy: z.ZodEnum<["replace", "merge", "selective"]>;
        selectedNodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        selectedEdges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        conflictResolution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>>>;
        preserveCurrentChanges: z.ZodDefault<z.ZodBoolean>;
        createBackup: z.ZodDefault<z.ZodBoolean>;
        notifyOnCompletion: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        createBackup: boolean;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        preserveCurrentChanges: boolean;
        notifyOnCompletion: boolean;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
    }, {
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        createBackup?: boolean | undefined;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
        preserveCurrentChanges?: boolean | undefined;
        notifyOnCompletion?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    config: {
        createBackup: boolean;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        preserveCurrentChanges: boolean;
        notifyOnCompletion: boolean;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
    };
    projectId: string;
    sourceSnapshotId: string;
    targetSnapshotId?: string | undefined;
}, {
    config: {
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        createBackup?: boolean | undefined;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
        preserveCurrentChanges?: boolean | undefined;
        notifyOnCompletion?: boolean | undefined;
    };
    projectId: string;
    sourceSnapshotId: string;
    targetSnapshotId?: string | undefined;
}>;
export declare const ConflictResolutionRequestSchema: z.ZodObject<{
    restorationAttemptId: z.ZodString;
    conflictId: z.ZodString;
    resolutionStrategy: z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>;
    resolvedValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    resolutionStrategy: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current";
    restorationAttemptId: string;
    conflictId: string;
    resolvedValue?: Record<string, unknown> | undefined;
}, {
    resolutionStrategy: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current";
    restorationAttemptId: string;
    conflictId: string;
    resolvedValue?: Record<string, unknown> | undefined;
}>;
export declare const RestorationBookmarkRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sourceSnapshotId: z.ZodString;
    targetSnapshotId: z.ZodOptional<z.ZodString>;
    restorationConfig: z.ZodObject<{
        restorationType: z.ZodEnum<["full", "partial", "selective"]>;
        restorationStrategy: z.ZodEnum<["replace", "merge", "selective"]>;
        selectedNodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        selectedEdges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        conflictResolution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>>>;
        preserveCurrentChanges: z.ZodDefault<z.ZodBoolean>;
        createBackup: z.ZodDefault<z.ZodBoolean>;
        notifyOnCompletion: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        createBackup: boolean;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        preserveCurrentChanges: boolean;
        notifyOnCompletion: boolean;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
    }, {
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        createBackup?: boolean | undefined;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
        preserveCurrentChanges?: boolean | undefined;
        notifyOnCompletion?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    projectId: string;
    sourceSnapshotId: string;
    restorationConfig: {
        createBackup: boolean;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        preserveCurrentChanges: boolean;
        notifyOnCompletion: boolean;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
    };
    description?: string | undefined;
    targetSnapshotId?: string | undefined;
}, {
    name: string;
    projectId: string;
    sourceSnapshotId: string;
    restorationConfig: {
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        createBackup?: boolean | undefined;
        conflictResolution?: Record<string, "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current"> | undefined;
        selectedNodes?: string[] | undefined;
        selectedEdges?: string[] | undefined;
        preserveCurrentChanges?: boolean | undefined;
        notifyOnCompletion?: boolean | undefined;
    };
    description?: string | undefined;
    targetSnapshotId?: string | undefined;
}>;
export type CreateRestorationAttemptRequest = z.infer<typeof CreateRestorationAttemptRequestSchema>;
export type RestorationPreviewRequest = z.infer<typeof RestorationPreviewRequestSchema>;
export type ConflictResolutionRequest = z.infer<typeof ConflictResolutionRequestSchema>;
export type RestorationBookmarkRequest = z.infer<typeof RestorationBookmarkRequestSchema>;
export declare const RestorationPreviewResponseSchema: z.ZodObject<{
    sessionId: z.ZodString;
    preview: z.ZodObject<{
        nodesToAdd: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
        nodesToUpdate: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
        nodesToDelete: z.ZodArray<z.ZodString, "many">;
        edgesToAdd: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
        edgesToUpdate: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
        edgesToDelete: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        nodesToAdd: Record<string, unknown>[];
        nodesToUpdate: Record<string, unknown>[];
        nodesToDelete: string[];
        edgesToAdd: Record<string, unknown>[];
        edgesToUpdate: Record<string, unknown>[];
        edgesToDelete: string[];
    }, {
        nodesToAdd: Record<string, unknown>[];
        nodesToUpdate: Record<string, unknown>[];
        nodesToDelete: string[];
        edgesToAdd: Record<string, unknown>[];
        edgesToUpdate: Record<string, unknown>[];
        edgesToDelete: string[];
    }>;
    conflicts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        restorationAttemptId: z.ZodString;
        conflictType: z.ZodEnum<["node_modified", "edge_modified", "node_deleted", "edge_deleted", "position_conflict", "property_conflict"]>;
        resourceType: z.ZodEnum<["node", "edge", "property"]>;
        resourceId: z.ZodString;
        conflictDescription: z.ZodOptional<z.ZodString>;
        sourceValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        targetValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        currentValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        resolutionStrategy: z.ZodOptional<z.ZodEnum<["keep_source", "keep_target", "keep_current", "merge", "skip", "manual"]>>;
        resolvedValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        resolvedBy: z.ZodOptional<z.ZodString>;
        resolvedAt: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        resourceId: string;
        resourceType: "node" | "property" | "edge";
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
        restorationAttemptId: string;
        targetValue?: Record<string, unknown> | undefined;
        resolvedAt?: Date | undefined;
        currentValue?: Record<string, unknown> | undefined;
        resolutionStrategy?: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current" | undefined;
        resolvedBy?: string | undefined;
        conflictDescription?: string | undefined;
        sourceValue?: Record<string, unknown> | undefined;
        resolvedValue?: Record<string, unknown> | undefined;
    }, {
        id: string;
        createdAt: Date;
        resourceId: string;
        resourceType: "node" | "property" | "edge";
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
        restorationAttemptId: string;
        targetValue?: Record<string, unknown> | undefined;
        resolvedAt?: Date | undefined;
        currentValue?: Record<string, unknown> | undefined;
        resolutionStrategy?: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current" | undefined;
        resolvedBy?: string | undefined;
        conflictDescription?: string | undefined;
        sourceValue?: Record<string, unknown> | undefined;
        resolvedValue?: Record<string, unknown> | undefined;
    }>, "many">;
    summary: z.ZodObject<{
        totalChanges: z.ZodNumber;
        totalConflicts: z.ZodNumber;
        estimatedDuration: z.ZodNumber;
        riskLevel: z.ZodEnum<["low", "medium", "high"]>;
    }, "strip", z.ZodTypeAny, {
        estimatedDuration: number;
        riskLevel: "low" | "medium" | "high";
        totalChanges: number;
        totalConflicts: number;
    }, {
        estimatedDuration: number;
        riskLevel: "low" | "medium" | "high";
        totalChanges: number;
        totalConflicts: number;
    }>;
    expiresAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    summary: {
        estimatedDuration: number;
        riskLevel: "low" | "medium" | "high";
        totalChanges: number;
        totalConflicts: number;
    };
    preview: {
        nodesToAdd: Record<string, unknown>[];
        nodesToUpdate: Record<string, unknown>[];
        nodesToDelete: string[];
        edgesToAdd: Record<string, unknown>[];
        edgesToUpdate: Record<string, unknown>[];
        edgesToDelete: string[];
    };
    sessionId: string;
    expiresAt: Date;
    conflicts: {
        id: string;
        createdAt: Date;
        resourceId: string;
        resourceType: "node" | "property" | "edge";
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
        restorationAttemptId: string;
        targetValue?: Record<string, unknown> | undefined;
        resolvedAt?: Date | undefined;
        currentValue?: Record<string, unknown> | undefined;
        resolutionStrategy?: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current" | undefined;
        resolvedBy?: string | undefined;
        conflictDescription?: string | undefined;
        sourceValue?: Record<string, unknown> | undefined;
        resolvedValue?: Record<string, unknown> | undefined;
    }[];
}, {
    summary: {
        estimatedDuration: number;
        riskLevel: "low" | "medium" | "high";
        totalChanges: number;
        totalConflicts: number;
    };
    preview: {
        nodesToAdd: Record<string, unknown>[];
        nodesToUpdate: Record<string, unknown>[];
        nodesToDelete: string[];
        edgesToAdd: Record<string, unknown>[];
        edgesToUpdate: Record<string, unknown>[];
        edgesToDelete: string[];
    };
    sessionId: string;
    expiresAt: Date;
    conflicts: {
        id: string;
        createdAt: Date;
        resourceId: string;
        resourceType: "node" | "property" | "edge";
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
        restorationAttemptId: string;
        targetValue?: Record<string, unknown> | undefined;
        resolvedAt?: Date | undefined;
        currentValue?: Record<string, unknown> | undefined;
        resolutionStrategy?: "skip" | "manual" | "merge" | "keep_source" | "keep_target" | "keep_current" | undefined;
        resolvedBy?: string | undefined;
        conflictDescription?: string | undefined;
        sourceValue?: Record<string, unknown> | undefined;
        resolvedValue?: Record<string, unknown> | undefined;
    }[];
}>;
export declare const RestorationProgressResponseSchema: z.ZodObject<{
    restorationAttemptId: z.ZodString;
    status: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
    progressPercentage: z.ZodNumber;
    currentOperation: z.ZodOptional<z.ZodString>;
    operationsCompleted: z.ZodNumber;
    totalOperations: z.ZodNumber;
    conflictsResolved: z.ZodNumber;
    totalConflicts: z.ZodNumber;
    errorMessage: z.ZodOptional<z.ZodString>;
    estimatedTimeRemaining: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
    totalOperations: number;
    progressPercentage: number;
    restorationAttemptId: string;
    totalConflicts: number;
    operationsCompleted: number;
    conflictsResolved: number;
    errorMessage?: string | undefined;
    currentOperation?: string | undefined;
    estimatedTimeRemaining?: number | undefined;
}, {
    status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
    totalOperations: number;
    progressPercentage: number;
    restorationAttemptId: string;
    totalConflicts: number;
    operationsCompleted: number;
    conflictsResolved: number;
    errorMessage?: string | undefined;
    currentOperation?: string | undefined;
    estimatedTimeRemaining?: number | undefined;
}>;
export declare const RestorationStatsResponseSchema: z.ZodObject<{
    totalAttempts: z.ZodNumber;
    successfulAttempts: z.ZodNumber;
    failedAttempts: z.ZodNumber;
    averageDuration: z.ZodNumber;
    mostCommonConflicts: z.ZodArray<z.ZodObject<{
        conflictType: z.ZodEnum<["node_modified", "edge_modified", "node_deleted", "edge_deleted", "position_conflict", "property_conflict"]>;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        count: number;
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
    }, {
        count: number;
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
    }>, "many">;
    recentAttempts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        sourceSnapshotId: z.ZodString;
        targetSnapshotId: z.ZodOptional<z.ZodString>;
        initiatedBy: z.ZodString;
        restorationType: z.ZodEnum<["full", "partial", "selective"]>;
        restorationStrategy: z.ZodEnum<["replace", "merge", "selective"]>;
        status: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
        progressPercentage: z.ZodNumber;
        errorMessage: z.ZodOptional<z.ZodString>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        completedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
        metadata: Record<string, unknown>;
        projectId: string;
        initiatedBy: string;
        sourceSnapshotId: string;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        progressPercentage: number;
        errorMessage?: string | undefined;
        completedAt?: Date | undefined;
        targetSnapshotId?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
        projectId: string;
        initiatedBy: string;
        sourceSnapshotId: string;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        progressPercentage: number;
        metadata?: Record<string, unknown> | undefined;
        errorMessage?: string | undefined;
        completedAt?: Date | undefined;
        targetSnapshotId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    failedAttempts: number;
    totalAttempts: number;
    successfulAttempts: number;
    averageDuration: number;
    mostCommonConflicts: {
        count: number;
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
    }[];
    recentAttempts: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
        metadata: Record<string, unknown>;
        projectId: string;
        initiatedBy: string;
        sourceSnapshotId: string;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        progressPercentage: number;
        errorMessage?: string | undefined;
        completedAt?: Date | undefined;
        targetSnapshotId?: string | undefined;
    }[];
}, {
    failedAttempts: number;
    totalAttempts: number;
    successfulAttempts: number;
    averageDuration: number;
    mostCommonConflicts: {
        count: number;
        conflictType: "node_modified" | "node_deleted" | "edge_deleted" | "edge_modified" | "position_conflict" | "property_conflict";
    }[];
    recentAttempts: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
        projectId: string;
        initiatedBy: string;
        sourceSnapshotId: string;
        restorationType: "full" | "partial" | "selective";
        restorationStrategy: "replace" | "merge" | "selective";
        progressPercentage: number;
        metadata?: Record<string, unknown> | undefined;
        errorMessage?: string | undefined;
        completedAt?: Date | undefined;
        targetSnapshotId?: string | undefined;
    }[];
}>;
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
export declare const RestorationFilterSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    initiatedBy: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>>;
    restorationType: z.ZodOptional<z.ZodEnum<["full", "partial", "selective"]>>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "pending" | "completed" | "failed" | "cancelled" | "in_progress" | undefined;
    projectId?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    initiatedBy?: string | undefined;
    restorationType?: "full" | "partial" | "selective" | undefined;
}, {
    status?: "pending" | "completed" | "failed" | "cancelled" | "in_progress" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    projectId?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    initiatedBy?: string | undefined;
    restorationType?: "full" | "partial" | "selective" | undefined;
}>;
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