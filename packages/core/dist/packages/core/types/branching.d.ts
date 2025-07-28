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
export declare const ProjectBranchSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchCommitSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchMergeRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchMergeReviewSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchPermissionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchConflictSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchSyncOperationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
export declare const CreateBranchRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateBranchRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateCommitRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateMergeRequestRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateMergeRequestRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateReviewRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateReviewRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const MergeBranchRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SyncBranchRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const MergeRequestFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
export declare const BranchStatsResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchTimelineResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const BranchComparisonResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
    children: BranchHierarchy;
    depth: number;
    path: string;
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
export declare const validateCreateBranchRequest: (request: unknown) => CreateBranchRequest;
export declare const validateUpdateBranchRequest: (request: unknown) => UpdateBranchRequest;
export declare const validateCreateMergeRequestRequest: (request: unknown) => CreateMergeRequestRequest;
export declare const validateMergeBranchRequest: (request: unknown) => MergeBranchRequest;
export declare const validateBranchFilter: (filter: unknown) => BranchFilter;
export declare const validateMergeRequestFilter: (filter: unknown) => MergeRequestFilter;
export declare const BRANCHING_DEFAULTS: {
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