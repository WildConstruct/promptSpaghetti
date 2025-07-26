import { z } from 'zod';
export declare const BranchTypeSchema: z.ZodEnum<["main", "feature", "hotfix", "release", "experiment"]>;
export declare const BranchStatusSchema: z.ZodEnum<["active", "merged", "abandoned", "archived"]>;
export declare const ProtectionLevelSchema: z.ZodEnum<["none", "protected", "locked"]>;
export declare const MergeRequestStatusSchema: z.ZodEnum<["open", "merged", "closed", "draft"]>;
export declare const ReviewStatusSchema: z.ZodEnum<["pending", "approved", "rejected", "commented"]>;
export declare const ConflictTypeSchema: z.ZodEnum<["merge", "rebase", "cherry_pick"]>;
export declare const ConflictStatusSchema: z.ZodEnum<["unresolved", "resolved", "ignored"]>;
export declare const SyncOperationTypeSchema: z.ZodEnum<["pull", "push", "merge", "rebase", "sync"]>;
export declare const SyncOperationStatusSchema: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
export declare const ProjectBranchSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    name: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentBranchId: z.ZodOptional<z.ZodString>;
    baseSnapshotId: z.ZodString;
    headSnapshotId: z.ZodString;
    branchType: z.ZodEnum<["main", "feature", "hotfix", "release", "experiment"]>;
    status: z.ZodEnum<["active", "merged", "abandoned", "archived"]>;
    protectionLevel: z.ZodEnum<["none", "protected", "locked"]>;
    createdBy: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    mergedAt: z.ZodOptional<z.ZodDate>;
    mergedBy: z.ZodOptional<z.ZodString>;
    mergedIntoBranchId: z.ZodOptional<z.ZodString>;
    autoMergeEnabled: z.ZodDefault<z.ZodBoolean>;
    requiresReview: z.ZodDefault<z.ZodBoolean>;
    allowForcePush: z.ZodDefault<z.ZodBoolean>;
    deleteOnMerge: z.ZodDefault<z.ZodBoolean>;
    commitCount: z.ZodDefault<z.ZodNumber>;
    contributorCount: z.ZodDefault<z.ZodNumber>;
    lastActivityAt: z.ZodDate;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    name?: string;
    description?: string;
    status?: "active" | "archived" | "merged" | "abandoned";
    metadata?: Record<string, unknown>;
    projectId?: string;
    displayName?: string;
    createdBy?: string;
    parentBranchId?: string;
    baseSnapshotId?: string;
    headSnapshotId?: string;
    branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
    protectionLevel?: "none" | "locked" | "protected";
    mergedAt?: Date;
    mergedBy?: string;
    mergedIntoBranchId?: string;
    autoMergeEnabled?: boolean;
    requiresReview?: boolean;
    allowForcePush?: boolean;
    deleteOnMerge?: boolean;
    commitCount?: number;
    contributorCount?: number;
    lastActivityAt?: Date;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    name?: string;
    description?: string;
    status?: "active" | "archived" | "merged" | "abandoned";
    metadata?: Record<string, unknown>;
    projectId?: string;
    displayName?: string;
    createdBy?: string;
    parentBranchId?: string;
    baseSnapshotId?: string;
    headSnapshotId?: string;
    branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
    protectionLevel?: "none" | "locked" | "protected";
    mergedAt?: Date;
    mergedBy?: string;
    mergedIntoBranchId?: string;
    autoMergeEnabled?: boolean;
    requiresReview?: boolean;
    allowForcePush?: boolean;
    deleteOnMerge?: boolean;
    commitCount?: number;
    contributorCount?: number;
    lastActivityAt?: Date;
}>;
export declare const BranchCommitSchema: z.ZodObject<{
    id: z.ZodString;
    branchId: z.ZodString;
    snapshotId: z.ZodString;
    commitOrder: z.ZodNumber;
    commitMessage: z.ZodOptional<z.ZodString>;
    commitAuthor: z.ZodString;
    commitTimestamp: z.ZodDate;
    parentCommitIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    changesCount: z.ZodDefault<z.ZodNumber>;
    additionsCount: z.ZodDefault<z.ZodNumber>;
    deletionsCount: z.ZodDefault<z.ZodNumber>;
    commitMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    snapshotId?: string;
    changesCount?: number;
    branchId?: string;
    commitOrder?: number;
    commitMessage?: string;
    commitAuthor?: string;
    commitTimestamp?: Date;
    parentCommitIds?: string[];
    additionsCount?: number;
    deletionsCount?: number;
    commitMetadata?: Record<string, unknown>;
}, {
    id?: string;
    snapshotId?: string;
    changesCount?: number;
    branchId?: string;
    commitOrder?: number;
    commitMessage?: string;
    commitAuthor?: string;
    commitTimestamp?: Date;
    parentCommitIds?: string[];
    additionsCount?: number;
    deletionsCount?: number;
    commitMetadata?: Record<string, unknown>;
}>;
export declare const BranchMergeRequestSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    sourceBranchId: z.ZodString;
    targetBranchId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["open", "merged", "closed", "draft"]>;
    createdBy: z.ZodString;
    assignedTo: z.ZodOptional<z.ZodString>;
    reviewers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sourceCommitId: z.ZodOptional<z.ZodString>;
    targetCommitId: z.ZodOptional<z.ZodString>;
    mergeCommitId: z.ZodOptional<z.ZodString>;
    allowSquashMerge: z.ZodDefault<z.ZodBoolean>;
    allowMergeCommit: z.ZodDefault<z.ZodBoolean>;
    allowRebaseMerge: z.ZodDefault<z.ZodBoolean>;
    deleteSourceBranch: z.ZodDefault<z.ZodBoolean>;
    commitsCount: z.ZodDefault<z.ZodNumber>;
    filesChanged: z.ZodDefault<z.ZodNumber>;
    additionsCount: z.ZodDefault<z.ZodNumber>;
    deletionsCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    mergedAt: z.ZodOptional<z.ZodDate>;
    closedAt: z.ZodOptional<z.ZodDate>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "closed" | "open" | "draft" | "merged";
    metadata?: Record<string, unknown>;
    title?: string;
    projectId?: string;
    createdBy?: string;
    assignedTo?: string;
    closedAt?: Date;
    mergedAt?: Date;
    additionsCount?: number;
    deletionsCount?: number;
    sourceBranchId?: string;
    targetBranchId?: string;
    reviewers?: string[];
    sourceCommitId?: string;
    targetCommitId?: string;
    mergeCommitId?: string;
    allowSquashMerge?: boolean;
    allowMergeCommit?: boolean;
    allowRebaseMerge?: boolean;
    deleteSourceBranch?: boolean;
    commitsCount?: number;
    filesChanged?: number;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "closed" | "open" | "draft" | "merged";
    metadata?: Record<string, unknown>;
    title?: string;
    projectId?: string;
    createdBy?: string;
    assignedTo?: string;
    closedAt?: Date;
    mergedAt?: Date;
    additionsCount?: number;
    deletionsCount?: number;
    sourceBranchId?: string;
    targetBranchId?: string;
    reviewers?: string[];
    sourceCommitId?: string;
    targetCommitId?: string;
    mergeCommitId?: string;
    allowSquashMerge?: boolean;
    allowMergeCommit?: boolean;
    allowRebaseMerge?: boolean;
    deleteSourceBranch?: boolean;
    commitsCount?: number;
    filesChanged?: number;
}>;
export declare const BranchMergeReviewSchema: z.ZodObject<{
    id: z.ZodString;
    mergeRequestId: z.ZodString;
    reviewerId: z.ZodString;
    status: z.ZodEnum<["pending", "approved", "rejected", "commented"]>;
    reviewMessage: z.ZodOptional<z.ZodString>;
    submittedAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    updatedAt?: Date;
    status?: "pending" | "approved" | "rejected" | "commented";
    submittedAt?: Date;
    mergeRequestId?: string;
    reviewerId?: string;
    reviewMessage?: string;
}, {
    id?: string;
    updatedAt?: Date;
    status?: "pending" | "approved" | "rejected" | "commented";
    submittedAt?: Date;
    mergeRequestId?: string;
    reviewerId?: string;
    reviewMessage?: string;
}>;
export declare const BranchPermissionSchema: z.ZodObject<{
    id: z.ZodString;
    branchId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    roleId: z.ZodOptional<z.ZodString>;
    canRead: z.ZodDefault<z.ZodBoolean>;
    canWrite: z.ZodDefault<z.ZodBoolean>;
    canMerge: z.ZodDefault<z.ZodBoolean>;
    canDelete: z.ZodDefault<z.ZodBoolean>;
    canAdmin: z.ZodDefault<z.ZodBoolean>;
    grantedBy: z.ZodString;
    grantedAt: z.ZodDate;
    expiresAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    userId?: string;
    canDelete?: boolean;
    expiresAt?: Date;
    branchId?: string;
    roleId?: string;
    canRead?: boolean;
    canWrite?: boolean;
    canMerge?: boolean;
    canAdmin?: boolean;
    grantedBy?: string;
    grantedAt?: Date;
}, {
    id?: string;
    userId?: string;
    canDelete?: boolean;
    expiresAt?: Date;
    branchId?: string;
    roleId?: string;
    canRead?: boolean;
    canWrite?: boolean;
    canMerge?: boolean;
    canAdmin?: boolean;
    grantedBy?: string;
    grantedAt?: Date;
}>;
export declare const BranchConflictSchema: z.ZodObject<{
    id: z.ZodString;
    sourceBranchId: z.ZodString;
    targetBranchId: z.ZodString;
    conflictType: z.ZodEnum<["merge", "rebase", "cherry_pick"]>;
    conflictStatus: z.ZodEnum<["unresolved", "resolved", "ignored"]>;
    conflictedResources: z.ZodDefault<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    conflictResolution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    detectedAt: z.ZodDate;
    resolvedAt: z.ZodOptional<z.ZodDate>;
    resolvedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    detectedAt?: Date;
    resolvedAt?: Date;
    sourceBranchId?: string;
    targetBranchId?: string;
    conflictType?: "merge" | "rebase" | "cherry_pick";
    conflictStatus?: "resolved" | "unresolved" | "ignored";
    conflictedResources?: Record<string, unknown>[];
    conflictResolution?: Record<string, unknown>;
    resolvedBy?: string;
}, {
    id?: string;
    detectedAt?: Date;
    resolvedAt?: Date;
    sourceBranchId?: string;
    targetBranchId?: string;
    conflictType?: "merge" | "rebase" | "cherry_pick";
    conflictStatus?: "resolved" | "unresolved" | "ignored";
    conflictedResources?: Record<string, unknown>[];
    conflictResolution?: Record<string, unknown>;
    resolvedBy?: string;
}>;
export declare const BranchSyncOperationSchema: z.ZodObject<{
    id: z.ZodString;
    branchId: z.ZodString;
    operationType: z.ZodEnum<["pull", "push", "merge", "rebase", "sync"]>;
    sourceBranchId: z.ZodOptional<z.ZodString>;
    targetBranchId: z.ZodOptional<z.ZodString>;
    operationStatus: z.ZodEnum<["pending", "in_progress", "completed", "failed", "cancelled"]>;
    initiatedBy: z.ZodString;
    startedAt: z.ZodDate;
    completedAt: z.ZodOptional<z.ZodDate>;
    errorMessage: z.ZodOptional<z.ZodString>;
    commitsProcessed: z.ZodDefault<z.ZodNumber>;
    conflictsDetected: z.ZodDefault<z.ZodNumber>;
    filesChanged: z.ZodDefault<z.ZodNumber>;
    operationMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    errorMessage?: string;
    completedAt?: Date;
    branchId?: string;
    sourceBranchId?: string;
    targetBranchId?: string;
    filesChanged?: number;
    operationType?: "push" | "sync" | "merge" | "rebase" | "pull";
    operationStatus?: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
    initiatedBy?: string;
    startedAt?: Date;
    commitsProcessed?: number;
    conflictsDetected?: number;
    operationMetadata?: Record<string, unknown>;
}, {
    id?: string;
    errorMessage?: string;
    completedAt?: Date;
    branchId?: string;
    sourceBranchId?: string;
    targetBranchId?: string;
    filesChanged?: number;
    operationType?: "push" | "sync" | "merge" | "rebase" | "pull";
    operationStatus?: "pending" | "completed" | "failed" | "cancelled" | "in_progress";
    initiatedBy?: string;
    startedAt?: Date;
    commitsProcessed?: number;
    conflictsDetected?: number;
    operationMetadata?: Record<string, unknown>;
}>;
export type BranchType = z.infer<typeof BranchTypeSchema>;
export type BranchStatus = z.infer<typeof BranchStatusSchema>;
export type ProtectionLevel = z.infer<typeof ProtectionLevelSchema>;
export type MergeRequestStatus = z.infer<typeof MergeRequestStatusSchema>;
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
export type ConflictType = z.infer<typeof ConflictTypeSchema>;
export type ConflictStatus = z.infer<typeof ConflictStatusSchema>;
export type SyncOperationType = z.infer<typeof SyncOperationTypeSchema>;
export type SyncOperationStatus = z.infer<typeof SyncOperationStatusSchema>;
export type ProjectBranch = z.infer<typeof ProjectBranchSchema>;
export type BranchCommit = z.infer<typeof BranchCommitSchema>;
export type BranchMergeRequest = z.infer<typeof BranchMergeRequestSchema>;
export type BranchMergeReview = z.infer<typeof BranchMergeReviewSchema>;
export type BranchPermission = z.infer<typeof BranchPermissionSchema>;
export type BranchConflict = z.infer<typeof BranchConflictSchema>;
export type BranchSyncOperation = z.infer<typeof BranchSyncOperationSchema>;
export declare const CreateBranchRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    parentBranchId: z.ZodOptional<z.ZodString>;
    baseSnapshotId: z.ZodOptional<z.ZodString>;
    branchType: z.ZodDefault<z.ZodEnum<["main", "feature", "hotfix", "release", "experiment"]>>;
    autoMergeEnabled: z.ZodDefault<z.ZodBoolean>;
    requiresReview: z.ZodDefault<z.ZodBoolean>;
    allowForcePush: z.ZodDefault<z.ZodBoolean>;
    deleteOnMerge: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    projectId?: string;
    displayName?: string;
    parentBranchId?: string;
    baseSnapshotId?: string;
    branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
    autoMergeEnabled?: boolean;
    requiresReview?: boolean;
    allowForcePush?: boolean;
    deleteOnMerge?: boolean;
}, {
    name?: string;
    description?: string;
    projectId?: string;
    displayName?: string;
    parentBranchId?: string;
    baseSnapshotId?: string;
    branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
    autoMergeEnabled?: boolean;
    requiresReview?: boolean;
    allowForcePush?: boolean;
    deleteOnMerge?: boolean;
}>;
export declare const UpdateBranchRequestSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    protectionLevel: z.ZodOptional<z.ZodEnum<["none", "protected", "locked"]>>;
    autoMergeEnabled: z.ZodOptional<z.ZodBoolean>;
    requiresReview: z.ZodOptional<z.ZodBoolean>;
    allowForcePush: z.ZodOptional<z.ZodBoolean>;
    deleteOnMerge: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    metadata?: Record<string, unknown>;
    displayName?: string;
    protectionLevel?: "none" | "locked" | "protected";
    autoMergeEnabled?: boolean;
    requiresReview?: boolean;
    allowForcePush?: boolean;
    deleteOnMerge?: boolean;
}, {
    description?: string;
    metadata?: Record<string, unknown>;
    displayName?: string;
    protectionLevel?: "none" | "locked" | "protected";
    autoMergeEnabled?: boolean;
    requiresReview?: boolean;
    allowForcePush?: boolean;
    deleteOnMerge?: boolean;
}>;
export declare const CreateCommitRequestSchema: z.ZodObject<{
    branchId: z.ZodString;
    snapshotId: z.ZodString;
    commitMessage: z.ZodOptional<z.ZodString>;
    parentCommitIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    commitMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    snapshotId?: string;
    branchId?: string;
    commitMessage?: string;
    parentCommitIds?: string[];
    commitMetadata?: Record<string, unknown>;
}, {
    snapshotId?: string;
    branchId?: string;
    commitMessage?: string;
    parentCommitIds?: string[];
    commitMetadata?: Record<string, unknown>;
}>;
export declare const CreateMergeRequestRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    sourceBranchId: z.ZodString;
    targetBranchId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodOptional<z.ZodString>;
    reviewers: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    allowSquashMerge: z.ZodDefault<z.ZodBoolean>;
    allowMergeCommit: z.ZodDefault<z.ZodBoolean>;
    allowRebaseMerge: z.ZodDefault<z.ZodBoolean>;
    deleteSourceBranch: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    title?: string;
    projectId?: string;
    assignedTo?: string;
    sourceBranchId?: string;
    targetBranchId?: string;
    reviewers?: string[];
    allowSquashMerge?: boolean;
    allowMergeCommit?: boolean;
    allowRebaseMerge?: boolean;
    deleteSourceBranch?: boolean;
}, {
    description?: string;
    title?: string;
    projectId?: string;
    assignedTo?: string;
    sourceBranchId?: string;
    targetBranchId?: string;
    reviewers?: string[];
    allowSquashMerge?: boolean;
    allowMergeCommit?: boolean;
    allowRebaseMerge?: boolean;
    deleteSourceBranch?: boolean;
}>;
export declare const UpdateMergeRequestRequestSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodOptional<z.ZodString>;
    reviewers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    allowSquashMerge: z.ZodOptional<z.ZodBoolean>;
    allowMergeCommit: z.ZodOptional<z.ZodBoolean>;
    allowRebaseMerge: z.ZodOptional<z.ZodBoolean>;
    deleteSourceBranch: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    metadata?: Record<string, unknown>;
    title?: string;
    assignedTo?: string;
    reviewers?: string[];
    allowSquashMerge?: boolean;
    allowMergeCommit?: boolean;
    allowRebaseMerge?: boolean;
    deleteSourceBranch?: boolean;
}, {
    description?: string;
    metadata?: Record<string, unknown>;
    title?: string;
    assignedTo?: string;
    reviewers?: string[];
    allowSquashMerge?: boolean;
    allowMergeCommit?: boolean;
    allowRebaseMerge?: boolean;
    deleteSourceBranch?: boolean;
}>;
export declare const CreateReviewRequestSchema: z.ZodObject<{
    mergeRequestId: z.ZodString;
    status: z.ZodEnum<["pending", "approved", "rejected", "commented"]>;
    reviewMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "approved" | "rejected" | "commented";
    mergeRequestId?: string;
    reviewMessage?: string;
}, {
    status?: "pending" | "approved" | "rejected" | "commented";
    mergeRequestId?: string;
    reviewMessage?: string;
}>;
export declare const UpdateReviewRequestSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected", "commented"]>>;
    reviewMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "pending" | "approved" | "rejected" | "commented";
    reviewMessage?: string;
}, {
    status?: "pending" | "approved" | "rejected" | "commented";
    reviewMessage?: string;
}>;
export declare const MergeBranchRequestSchema: z.ZodObject<{
    mergeRequestId: z.ZodString;
    mergeStrategy: z.ZodDefault<z.ZodEnum<["merge", "squash", "rebase"]>>;
    commitMessage: z.ZodOptional<z.ZodString>;
    deleteSourceBranch: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    commitMessage?: string;
    deleteSourceBranch?: boolean;
    mergeRequestId?: string;
    mergeStrategy?: "merge" | "rebase" | "squash";
}, {
    commitMessage?: string;
    deleteSourceBranch?: boolean;
    mergeRequestId?: string;
    mergeStrategy?: "merge" | "rebase" | "squash";
}>;
export declare const SyncBranchRequestSchema: z.ZodObject<{
    branchId: z.ZodString;
    sourceBranchId: z.ZodString;
    operationType: z.ZodEnum<["pull", "push", "merge", "rebase", "sync"]>;
    conflictResolution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    branchId?: string;
    sourceBranchId?: string;
    conflictResolution?: Record<string, unknown>;
    operationType?: "push" | "sync" | "merge" | "rebase" | "pull";
}, {
    branchId?: string;
    sourceBranchId?: string;
    conflictResolution?: Record<string, unknown>;
    operationType?: "push" | "sync" | "merge" | "rebase" | "pull";
}>;
export declare const BranchFilterSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    branchType: z.ZodOptional<z.ZodEnum<["main", "feature", "hotfix", "release", "experiment"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "merged", "abandoned", "archived"]>>;
    protectionLevel: z.ZodOptional<z.ZodEnum<["none", "protected", "locked"]>>;
    createdBy: z.ZodOptional<z.ZodString>;
    parentBranchId: z.ZodOptional<z.ZodString>;
    namePattern: z.ZodOptional<z.ZodString>;
    createdAfter: z.ZodOptional<z.ZodDate>;
    createdBefore: z.ZodOptional<z.ZodDate>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "created_at", "updated_at", "last_activity_at"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "archived" | "merged" | "abandoned";
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "name" | "created_at" | "updated_at" | "last_activity_at";
    sortOrder?: "asc" | "desc";
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    parentBranchId?: string;
    branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
    protectionLevel?: "none" | "locked" | "protected";
    namePattern?: string;
}, {
    status?: "active" | "archived" | "merged" | "abandoned";
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "name" | "created_at" | "updated_at" | "last_activity_at";
    sortOrder?: "asc" | "desc";
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    parentBranchId?: string;
    branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
    protectionLevel?: "none" | "locked" | "protected";
    namePattern?: string;
}>;
export declare const MergeRequestFilterSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    sourceBranchId: z.ZodOptional<z.ZodString>;
    targetBranchId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["open", "merged", "closed", "draft"]>>;
    createdBy: z.ZodOptional<z.ZodString>;
    assignedTo: z.ZodOptional<z.ZodString>;
    reviewerId: z.ZodOptional<z.ZodString>;
    createdAfter: z.ZodOptional<z.ZodDate>;
    createdBefore: z.ZodOptional<z.ZodDate>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["created_at", "updated_at", "title"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "closed" | "open" | "draft" | "merged";
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "title" | "created_at" | "updated_at";
    sortOrder?: "asc" | "desc";
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    assignedTo?: string;
    sourceBranchId?: string;
    targetBranchId?: string;
    reviewerId?: string;
}, {
    status?: "closed" | "open" | "draft" | "merged";
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "title" | "created_at" | "updated_at";
    sortOrder?: "asc" | "desc";
    createdBy?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    assignedTo?: string;
    sourceBranchId?: string;
    targetBranchId?: string;
    reviewerId?: string;
}>;
export type CreateBranchRequest = z.infer<typeof CreateBranchRequestSchema>;
export type UpdateBranchRequest = z.infer<typeof UpdateBranchRequestSchema>;
export type CreateCommitRequest = z.infer<typeof CreateCommitRequestSchema>;
export type CreateMergeRequestRequest = z.infer<typeof CreateMergeRequestRequestSchema>;
export type UpdateMergeRequestRequest = z.infer<typeof UpdateMergeRequestRequestSchema>;
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;
export type UpdateReviewRequest = z.infer<typeof UpdateReviewRequestSchema>;
export type MergeBranchRequest = z.infer<typeof MergeBranchRequestSchema>;
export type SyncBranchRequest = z.infer<typeof SyncBranchRequestSchema>;
export type BranchFilter = z.infer<typeof BranchFilterSchema>;
export type MergeRequestFilter = z.infer<typeof MergeRequestFilterSchema>;
export declare const BranchStatsResponseSchema: z.ZodObject<{
    totalBranches: z.ZodNumber;
    activeBranches: z.ZodNumber;
    mergedBranches: z.ZodNumber;
    abandonedBranches: z.ZodNumber;
    byType: z.ZodRecord<z.ZodString, z.ZodNumber>;
    byStatus: z.ZodRecord<z.ZodString, z.ZodNumber>;
    recentActivity: z.ZodArray<z.ZodObject<{
        branchId: z.ZodString;
        branchName: z.ZodString;
        activityType: z.ZodString;
        activityDate: z.ZodDate;
        userId: z.ZodString;
        userName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        userId?: string;
        branchId?: string;
        branchName?: string;
        activityType?: string;
        activityDate?: Date;
        userName?: string;
    }, {
        userId?: string;
        branchId?: string;
        branchName?: string;
        activityType?: string;
        activityDate?: Date;
        userName?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    recentActivity?: {
        userId?: string;
        branchId?: string;
        branchName?: string;
        activityType?: string;
        activityDate?: Date;
        userName?: string;
    }[];
    totalBranches?: number;
    activeBranches?: number;
    mergedBranches?: number;
    abandonedBranches?: number;
    byType?: Record<string, number>;
    byStatus?: Record<string, number>;
}, {
    recentActivity?: {
        userId?: string;
        branchId?: string;
        branchName?: string;
        activityType?: string;
        activityDate?: Date;
        userName?: string;
    }[];
    totalBranches?: number;
    activeBranches?: number;
    mergedBranches?: number;
    abandonedBranches?: number;
    byType?: Record<string, number>;
    byStatus?: Record<string, number>;
}>;
export declare const BranchTimelineResponseSchema: z.ZodObject<{
    timeline: z.ZodArray<z.ZodObject<{
        date: z.ZodDate;
        events: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            branchId: z.ZodString;
            branchName: z.ZodString;
            userId: z.ZodString;
            userName: z.ZodString;
            description: z.ZodString;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            type?: string;
            metadata?: Record<string, unknown>;
            userId?: string;
            branchId?: string;
            branchName?: string;
            userName?: string;
        }, {
            id?: string;
            description?: string;
            type?: string;
            metadata?: Record<string, unknown>;
            userId?: string;
            branchId?: string;
            branchName?: string;
            userName?: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        date?: Date;
        events?: {
            id?: string;
            description?: string;
            type?: string;
            metadata?: Record<string, unknown>;
            userId?: string;
            branchId?: string;
            branchName?: string;
            userName?: string;
        }[];
    }, {
        date?: Date;
        events?: {
            id?: string;
            description?: string;
            type?: string;
            metadata?: Record<string, unknown>;
            userId?: string;
            branchId?: string;
            branchName?: string;
            userName?: string;
        }[];
    }>, "many">;
    summary: z.ZodObject<{
        totalEvents: z.ZodNumber;
        dateRange: z.ZodObject<{
            start: z.ZodDate;
            end: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            start?: Date;
            end?: Date;
        }, {
            start?: Date;
            end?: Date;
        }>;
        mostActiveBranch: z.ZodOptional<z.ZodObject<{
            branchId: z.ZodString;
            branchName: z.ZodString;
            events: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            events?: number;
            branchId?: string;
            branchName?: string;
        }, {
            events?: number;
            branchId?: string;
            branchName?: string;
        }>>;
        mostActiveUser: z.ZodOptional<z.ZodObject<{
            userId: z.ZodString;
            userName: z.ZodString;
            events: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            userId?: string;
            events?: number;
            userName?: string;
        }, {
            userId?: string;
            events?: number;
            userName?: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        totalEvents?: number;
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        mostActiveBranch?: {
            events?: number;
            branchId?: string;
            branchName?: string;
        };
        mostActiveUser?: {
            userId?: string;
            events?: number;
            userName?: string;
        };
    }, {
        totalEvents?: number;
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        mostActiveBranch?: {
            events?: number;
            branchId?: string;
            branchName?: string;
        };
        mostActiveUser?: {
            userId?: string;
            events?: number;
            userName?: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    summary?: {
        totalEvents?: number;
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        mostActiveBranch?: {
            events?: number;
            branchId?: string;
            branchName?: string;
        };
        mostActiveUser?: {
            userId?: string;
            events?: number;
            userName?: string;
        };
    };
    timeline?: {
        date?: Date;
        events?: {
            id?: string;
            description?: string;
            type?: string;
            metadata?: Record<string, unknown>;
            userId?: string;
            branchId?: string;
            branchName?: string;
            userName?: string;
        }[];
    }[];
}, {
    summary?: {
        totalEvents?: number;
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        mostActiveBranch?: {
            events?: number;
            branchId?: string;
            branchName?: string;
        };
        mostActiveUser?: {
            userId?: string;
            events?: number;
            userName?: string;
        };
    };
    timeline?: {
        date?: Date;
        events?: {
            id?: string;
            description?: string;
            type?: string;
            metadata?: Record<string, unknown>;
            userId?: string;
            branchId?: string;
            branchName?: string;
            userName?: string;
        }[];
    }[];
}>;
export declare const BranchComparisonResponseSchema: z.ZodObject<{
    sourceBranch: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        name: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        parentBranchId: z.ZodOptional<z.ZodString>;
        baseSnapshotId: z.ZodString;
        headSnapshotId: z.ZodString;
        branchType: z.ZodEnum<["main", "feature", "hotfix", "release", "experiment"]>;
        status: z.ZodEnum<["active", "merged", "abandoned", "archived"]>;
        protectionLevel: z.ZodEnum<["none", "protected", "locked"]>;
        createdBy: z.ZodString;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        mergedAt: z.ZodOptional<z.ZodDate>;
        mergedBy: z.ZodOptional<z.ZodString>;
        mergedIntoBranchId: z.ZodOptional<z.ZodString>;
        autoMergeEnabled: z.ZodDefault<z.ZodBoolean>;
        requiresReview: z.ZodDefault<z.ZodBoolean>;
        allowForcePush: z.ZodDefault<z.ZodBoolean>;
        deleteOnMerge: z.ZodDefault<z.ZodBoolean>;
        commitCount: z.ZodDefault<z.ZodNumber>;
        contributorCount: z.ZodDefault<z.ZodNumber>;
        lastActivityAt: z.ZodDate;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    }>;
    targetBranch: z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        name: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        parentBranchId: z.ZodOptional<z.ZodString>;
        baseSnapshotId: z.ZodString;
        headSnapshotId: z.ZodString;
        branchType: z.ZodEnum<["main", "feature", "hotfix", "release", "experiment"]>;
        status: z.ZodEnum<["active", "merged", "abandoned", "archived"]>;
        protectionLevel: z.ZodEnum<["none", "protected", "locked"]>;
        createdBy: z.ZodString;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        mergedAt: z.ZodOptional<z.ZodDate>;
        mergedBy: z.ZodOptional<z.ZodString>;
        mergedIntoBranchId: z.ZodOptional<z.ZodString>;
        autoMergeEnabled: z.ZodDefault<z.ZodBoolean>;
        requiresReview: z.ZodDefault<z.ZodBoolean>;
        allowForcePush: z.ZodDefault<z.ZodBoolean>;
        deleteOnMerge: z.ZodDefault<z.ZodBoolean>;
        commitCount: z.ZodDefault<z.ZodNumber>;
        contributorCount: z.ZodDefault<z.ZodNumber>;
        lastActivityAt: z.ZodDate;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    }>;
    commonAncestor: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        branchId: z.ZodString;
        snapshotId: z.ZodString;
        commitOrder: z.ZodNumber;
        commitMessage: z.ZodOptional<z.ZodString>;
        commitAuthor: z.ZodString;
        commitTimestamp: z.ZodDate;
        parentCommitIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        changesCount: z.ZodDefault<z.ZodNumber>;
        additionsCount: z.ZodDefault<z.ZodNumber>;
        deletionsCount: z.ZodDefault<z.ZodNumber>;
        commitMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        snapshotId?: string;
        changesCount?: number;
        branchId?: string;
        commitOrder?: number;
        commitMessage?: string;
        commitAuthor?: string;
        commitTimestamp?: Date;
        parentCommitIds?: string[];
        additionsCount?: number;
        deletionsCount?: number;
        commitMetadata?: Record<string, unknown>;
    }, {
        id?: string;
        snapshotId?: string;
        changesCount?: number;
        branchId?: string;
        commitOrder?: number;
        commitMessage?: string;
        commitAuthor?: string;
        commitTimestamp?: Date;
        parentCommitIds?: string[];
        additionsCount?: number;
        deletionsCount?: number;
        commitMetadata?: Record<string, unknown>;
    }>>;
    ahead: z.ZodNumber;
    behind: z.ZodNumber;
    conflicts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceBranchId: z.ZodString;
        targetBranchId: z.ZodString;
        conflictType: z.ZodEnum<["merge", "rebase", "cherry_pick"]>;
        conflictStatus: z.ZodEnum<["unresolved", "resolved", "ignored"]>;
        conflictedResources: z.ZodDefault<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
        conflictResolution: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        detectedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
        resolvedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        detectedAt?: Date;
        resolvedAt?: Date;
        sourceBranchId?: string;
        targetBranchId?: string;
        conflictType?: "merge" | "rebase" | "cherry_pick";
        conflictStatus?: "resolved" | "unresolved" | "ignored";
        conflictedResources?: Record<string, unknown>[];
        conflictResolution?: Record<string, unknown>;
        resolvedBy?: string;
    }, {
        id?: string;
        detectedAt?: Date;
        resolvedAt?: Date;
        sourceBranchId?: string;
        targetBranchId?: string;
        conflictType?: "merge" | "rebase" | "cherry_pick";
        conflictStatus?: "resolved" | "unresolved" | "ignored";
        conflictedResources?: Record<string, unknown>[];
        conflictResolution?: Record<string, unknown>;
        resolvedBy?: string;
    }>, "many">;
    canMerge: z.ZodBoolean;
    mergeStrategy: z.ZodOptional<z.ZodEnum<["merge", "squash", "rebase"]>>;
    estimatedMergeTime: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    behind?: number;
    conflicts?: {
        id?: string;
        detectedAt?: Date;
        resolvedAt?: Date;
        sourceBranchId?: string;
        targetBranchId?: string;
        conflictType?: "merge" | "rebase" | "cherry_pick";
        conflictStatus?: "resolved" | "unresolved" | "ignored";
        conflictedResources?: Record<string, unknown>[];
        conflictResolution?: Record<string, unknown>;
        resolvedBy?: string;
    }[];
    canMerge?: boolean;
    mergeStrategy?: "merge" | "rebase" | "squash";
    sourceBranch?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    };
    targetBranch?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    };
    commonAncestor?: {
        id?: string;
        snapshotId?: string;
        changesCount?: number;
        branchId?: string;
        commitOrder?: number;
        commitMessage?: string;
        commitAuthor?: string;
        commitTimestamp?: Date;
        parentCommitIds?: string[];
        additionsCount?: number;
        deletionsCount?: number;
        commitMetadata?: Record<string, unknown>;
    };
    ahead?: number;
    estimatedMergeTime?: number;
}, {
    behind?: number;
    conflicts?: {
        id?: string;
        detectedAt?: Date;
        resolvedAt?: Date;
        sourceBranchId?: string;
        targetBranchId?: string;
        conflictType?: "merge" | "rebase" | "cherry_pick";
        conflictStatus?: "resolved" | "unresolved" | "ignored";
        conflictedResources?: Record<string, unknown>[];
        conflictResolution?: Record<string, unknown>;
        resolvedBy?: string;
    }[];
    canMerge?: boolean;
    mergeStrategy?: "merge" | "rebase" | "squash";
    sourceBranch?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    };
    targetBranch?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        status?: "active" | "archived" | "merged" | "abandoned";
        metadata?: Record<string, unknown>;
        projectId?: string;
        displayName?: string;
        createdBy?: string;
        parentBranchId?: string;
        baseSnapshotId?: string;
        headSnapshotId?: string;
        branchType?: "main" | "release" | "experiment" | "feature" | "hotfix";
        protectionLevel?: "none" | "locked" | "protected";
        mergedAt?: Date;
        mergedBy?: string;
        mergedIntoBranchId?: string;
        autoMergeEnabled?: boolean;
        requiresReview?: boolean;
        allowForcePush?: boolean;
        deleteOnMerge?: boolean;
        commitCount?: number;
        contributorCount?: number;
        lastActivityAt?: Date;
    };
    commonAncestor?: {
        id?: string;
        snapshotId?: string;
        changesCount?: number;
        branchId?: string;
        commitOrder?: number;
        commitMessage?: string;
        commitAuthor?: string;
        commitTimestamp?: Date;
        parentCommitIds?: string[];
        additionsCount?: number;
        deletionsCount?: number;
        commitMetadata?: Record<string, unknown>;
    };
    ahead?: number;
    estimatedMergeTime?: number;
}>;
export type BranchStatsResponse = z.infer<typeof BranchStatsResponseSchema>;
export type BranchTimelineResponse = z.infer<typeof BranchTimelineResponseSchema>;
export type BranchComparisonResponse = z.infer<typeof BranchComparisonResponseSchema>;
export interface BranchContext {
    projectId: string;
    branchId: string;
    userId: string;
    userPermissions: {
        canRead: boolean;
        canWrite: boolean;
        canMerge: boolean;
        canDelete: boolean;
        canAdmin: boolean;
    };
}
export interface MergeContext {
    mergeRequestId: string;
    sourceBranchId: string;
    targetBranchId: string;
    userId: string;
    strategy: 'merge' | 'squash' | 'rebase';
    conflictResolution?: Record<string, any>;
}
export interface BranchHierarchy {
    branch: ProjectBranch;
    children: BranchHierarchy[];
    depth: number;
    path: string[];
}
export interface BranchMetrics {
    commitsPerDay: Record<string, number>;
    contributorsPerDay: Record<string, number>;
    mergeRequestsPerDay: Record<string, number>;
    conflictsPerDay: Record<string, number>;
    averageMergeTime: number;
    mergeSuccessRate: number;
    mostActiveContributor: {
        userId: string;
        userName: string;
        commits: number;
    };
}
export declare export declare export declare export declare export declare export declare export declare const BRANCHING_DEFAULTS: {
    readonly DEFAULT_BRANCH_TYPE: BranchType;
    readonly DEFAULT_PROTECTION_LEVEL: ProtectionLevel;
    readonly DEFAULT_MERGE_STRATEGY: "merge";
    readonly MAX_BRANCH_NAME_LENGTH: 255;
    readonly MAX_COMMIT_MESSAGE_LENGTH: 1000;
    readonly MAX_MERGE_REQUEST_TITLE_LENGTH: 500;
    readonly AUTO_DELETE_MERGED_BRANCHES: false;
    readonly REQUIRE_REVIEW_BY_DEFAULT: false;
    readonly ALLOW_FORCE_PUSH_BY_DEFAULT: false;
    readonly CONFLICT_RESOLUTION_TIMEOUT: 300000;
    readonly MERGE_TIMEOUT: 600000;
};
export declare const BRANCH_TYPE_DESCRIPTIONS: {
    readonly main: "Main development branch";
    readonly feature: "Feature development branch";
    readonly hotfix: "Hotfix branch for urgent fixes";
    readonly release: "Release preparation branch";
    readonly experiment: "Experimental branch for testing";
};
export declare const BRANCH_STATUS_DESCRIPTIONS: {
    readonly active: "Active development branch";
    readonly merged: "Branch has been merged";
    readonly abandoned: "Branch has been abandoned";
    readonly archived: "Branch has been archived";
};
export declare const PROTECTION_LEVEL_DESCRIPTIONS: {
    readonly none: "No protection - anyone can push";
    readonly protected: "Protected - requires review";
    readonly locked: "Locked - only admins can push";
};
export declare const MERGE_STRATEGY_DESCRIPTIONS: {
    readonly merge: "Create a merge commit";
    readonly squash: "Squash commits into one";
    readonly rebase: "Rebase and merge";
};
export interface BranchEvent {
    type: 'branch_created' | 'branch_updated' | 'branch_deleted' | 'branch_merged';
    branchId: string;
    projectId: string;
    userId: string;
    data: any;
    timestamp: Date;
}
export interface MergeRequestEvent {
    type: 'merge_request_created' | 'merge_request_updated' | 'merge_request_merged' | 'merge_request_closed';
    mergeRequestId: string;
    projectId: string;
    userId: string;
    data: any;
    timestamp: Date;
}
export interface BranchNotification {
    type: 'branch_conflict' | 'merge_request_review' | 'branch_merged' | 'branch_updated';
    title: string;
    message: string;
    branchId: string;
    projectId: string;
    userId: string;
    data: any;
    timestamp: Date;
}
//# sourceMappingURL=branching.d.ts.map