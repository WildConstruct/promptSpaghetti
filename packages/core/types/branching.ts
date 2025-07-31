import { z } from 'zod';

// Core branching types
export const BranchTypeSchema = z.enum(['main', 'feature', 'hotfix', 'release', 'experiment']);
export const BranchStatusSchema = z.enum(['active', 'merged', 'abandoned', 'archived']);
export const ProtectionLevelSchema = z.enum(['none', 'protected', 'locked']);
export const MergeRequestStatusSchema = z.enum(['open', 'merged', 'closed', 'draft']);
export const ReviewStatusSchema = z.enum(['pending', 'approved', 'rejected', 'commented']);
export const ConflictTypeSchema = z.enum(['merge', 'rebase', 'cherry_pick']);
export const ConflictStatusSchema = z.enum(['unresolved', 'resolved', 'ignored']);
export const SyncOperationTypeSchema = z.enum(['pull', 'push', 'merge', 'rebase', 'sync']);
export const SyncOperationStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']);

export const ProjectBranchSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  displayName: z.string().max(255).optional(),
  description: z.string().optional(),
  // Branch hierarchy
  parentBranchId: z.string().uuid().optional(),
  baseSnapshotId: z.string().uuid(),
  headSnapshotId: z.string().uuid(),
  // Branch state
  branchType: BranchTypeSchema,
  status: BranchStatusSchema,
  protectionLevel: ProtectionLevelSchema,
  // Branch metadata
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  mergedAt: z.date().optional(),
  mergedBy: z.string().uuid().optional(),
  mergedIntoBranchId: z.string().uuid().optional(),
  // Branch configuration
  autoMergeEnabled: z.boolean().default(false),
  requiresReview: z.boolean().default(false),
  allowForcePush: z.boolean().default(false),
  deleteOnMerge: z.boolean().default(false),
  // Branch statistics
  commitCount: z.number().int().default(0),
  contributorCount: z.number().int().default(0),
  lastActivityAt: z.date(),
  // Branch metadata
  metadata: z.record(z.unknown()).default({})
});

export const BranchCommitSchema = z.object({
  id: z.string().uuid(),
  branchId: z.string().uuid(),
  snapshotId: z.string().uuid(),
  commitOrder: z.number().int(),
  // Commit metadata
  commitMessage: z.string().optional(),
  commitAuthor: z.string().uuid(),
  commitTimestamp: z.date(),
  // Parent commits (for merge commits)
  parentCommitIds: z.array(z.string().uuid()).default([]),
  // Commit statistics
  changesCount: z.number().int().default(0),
  additionsCount: z.number().int().default(0),
  deletionsCount: z.number().int().default(0),
  // Commit metadata
  commitMetadata: z.record(z.unknown()).default({})
});

export const BranchMergeRequestSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  sourceBranchId: z.string().uuid(),
  targetBranchId: z.string().uuid(),
  // Merge request metadata
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: MergeRequestStatusSchema,
  // Request participants
  createdBy: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  reviewers: z.array(z.string().uuid()).default([]),
  // Merge request state
  sourceCommitId: z.string().uuid().optional(),
  targetCommitId: z.string().uuid().optional(),
  mergeCommitId: z.string().uuid().optional(),
  // Merge request configuration
  allowSquashMerge: z.boolean().default(true),
  allowMergeCommit: z.boolean().default(true),
  allowRebaseMerge: z.boolean().default(false),
  deleteSourceBranch: z.boolean().default(false),
  // Merge request metrics
  commitsCount: z.number().int().default(0),
  filesChanged: z.number().int().default(0),
  additionsCount: z.number().int().default(0),
  deletionsCount: z.number().int().default(0),
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  mergedAt: z.date().optional(),
  closedAt: z.date().optional(),
  // Merge request metadata
  metadata: z.record(z.unknown()).default({})
});

export const BranchMergeReviewSchema = z.object({
  id: z.string().uuid(),
  mergeRequestId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  // Review state
  status: ReviewStatusSchema,
  reviewMessage: z.string().optional(),
  // Review metadata
  submittedAt: z.date(),
  updatedAt: z.date(),
});

export const BranchPermissionSchema = z.object({
  id: z.string().uuid(),
  branchId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  roleId: z.string().uuid().optional(),
  // Permission types
  canRead: z.boolean().default(true),
  canWrite: z.boolean().default(false),
  canMerge: z.boolean().default(false),
  canDelete: z.boolean().default(false),
  canAdmin: z.boolean().default(false),
  // Permission metadata
  grantedBy: z.string().uuid(),
  grantedAt: z.date(),
  expiresAt: z.date().optional(),
});

export const BranchConflictSchema = z.object({
  id: z.string().uuid(),
  sourceBranchId: z.string().uuid(),
  targetBranchId: z.string().uuid(),
  // Conflict details
  conflictType: ConflictTypeSchema,
  conflictStatus: ConflictStatusSchema,
  // Conflict data
  conflictedResources: z.array(z.record(z.unknown())).default([]),
  conflictResolution: z.record(z.unknown()).optional(),
  // Conflict metadata
  detectedAt: z.date(),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().uuid().optional(),
});

export const BranchSyncOperationSchema = z.object({
  id: z.string().uuid(),
  branchId: z.string().uuid(),
  operationType: SyncOperationTypeSchema,
  // Operation details
  sourceBranchId: z.string().uuid().optional(),
  targetBranchId: z.string().uuid().optional(),
  operationStatus: SyncOperationStatusSchema,
  // Operation metadata
  initiatedBy: z.string().uuid(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  // Operation results
  commitsProcessed: z.number().int().default(0),
  conflictsDetected: z.number().int().default(0),
  filesChanged: z.number().int().default(0),
  // Operation metadata
  operationMetadata: z.record(z.unknown()).default({})
});

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

// Request/response types
export const CreateBranchRequestSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  displayName: z.string().max(255).optional(),
  description: z.string().optional(),
  parentBranchId: z.string().uuid().optional(),
  baseSnapshotId: z.string().uuid().optional(),
  branchType: BranchTypeSchema.default('feature'),
  autoMergeEnabled: z.boolean().default(false),
  requiresReview: z.boolean().default(false),
  allowForcePush: z.boolean().default(false),
  deleteOnMerge: z.boolean().default(false),
});

export const UpdateBranchRequestSchema = z.object({
  displayName: z.string().max(255).optional(),
  description: z.string().optional(),
  protectionLevel: ProtectionLevelSchema.optional(),
  autoMergeEnabled: z.boolean().optional(),
  requiresReview: z.boolean().optional(),
  allowForcePush: z.boolean().optional(),
  deleteOnMerge: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateCommitRequestSchema = z.object({
  branchId: z.string().uuid(),
  snapshotId: z.string().uuid(),
  commitMessage: z.string().optional(),
  parentCommitIds: z.array(z.string().uuid()).default([]),
  commitMetadata: z.record(z.unknown()).default({})
});

export const CreateMergeRequestRequestSchema = z.object({
  projectId: z.string().uuid(),
  sourceBranchId: z.string().uuid(),
  targetBranchId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  reviewers: z.array(z.string().uuid()).default([]),
  allowSquashMerge: z.boolean().default(true),
  allowMergeCommit: z.boolean().default(true),
  allowRebaseMerge: z.boolean().default(false),
  deleteSourceBranch: z.boolean().default(false),
});

export const UpdateMergeRequestRequestSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  reviewers: z.array(z.string().uuid()).optional(),
  allowSquashMerge: z.boolean().optional(),
  allowMergeCommit: z.boolean().optional(),
  allowRebaseMerge: z.boolean().optional(),
  deleteSourceBranch: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateReviewRequestSchema = z.object({
  mergeRequestId: z.string().uuid(),
  status: ReviewStatusSchema,
  reviewMessage: z.string().optional(),
});

export const UpdateReviewRequestSchema = z.object({
  status: ReviewStatusSchema.optional(),
  reviewMessage: z.string().optional(),
});

export const MergeBranchRequestSchema = z.object({
  mergeRequestId: z.string().uuid(),
  mergeStrategy: z.enum(['merge', 'squash', 'rebase']).default('merge'),
  commitMessage: z.string().optional(),
  deleteSourceBranch: z.boolean().default(false),
});

export const SyncBranchRequestSchema = z.object({
  branchId: z.string().uuid(),
  sourceBranchId: z.string().uuid(),
  operationType: SyncOperationTypeSchema,
  conflictResolution: z.record(z.unknown()).optional(),
});

export const BranchFilterSchema = z.object({
  projectId: z.string().uuid().optional(),
  branchType: BranchTypeSchema.optional(),
  status: BranchStatusSchema.optional(),
  protectionLevel: ProtectionLevelSchema.optional(),
  createdBy: z.string().uuid().optional(),
  parentBranchId: z.string().uuid().optional(),
  namePattern: z.string().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'last_activity_at']).default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const MergeRequestFilterSchema = z.object({
  projectId: z.string().uuid().optional(),
  sourceBranchId: z.string().uuid().optional(),
  targetBranchId: z.string().uuid().optional(),
  status: MergeRequestStatusSchema.optional(),
  createdBy: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  reviewerId: z.string().uuid().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['created_at', 'updated_at', 'title']).default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

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

// Response types
export const BranchStatsResponseSchema = z.object({
  totalBranches: z.number().int(),
  activeBranches: z.number().int(),
  mergedBranches: z.number().int(),
  abandonedBranches: z.number().int(),
  byType: z.record(z.number().int()),
  byStatus: z.record(z.number().int()),
  recentActivity: z.array(z.object({)
  branchId: z.string().uuid(),
  branchName: z.string(),
  activityType: z.string(),
  activityDate: z.date(),
  userId: z.string().uuid(),
  userName: z.string(),
}))
});

export const BranchTimelineResponseSchema = z.object({
  timeline: z.array(z.object({)
  date: z.date(),
  events: z.array(z.object({)
  id: z.string().uuid(),
  type: z.string(),
  branchId: z.string().uuid(),
  branchName: z.string(),
  userId: z.string().uuid(),
  userName: z.string(),
  description: z.string(),
  metadata: z.record(z.unknown()).optional(),
}))
  })),
  summary: z.object({,)
  totalEvents: z.number().int(),
  dateRange: z.object({,)
  start: z.date(),
  end: z.date(),
}),
    mostActiveBranch: z.object({,)
  branchId: z.string().uuid(),
  branchName: z.string(),
  events: z.number().int(),
}).optional(),
    mostActiveUser: z.object({,)
  userId: z.string().uuid(),
  userName: z.string(),
  events: z.number().int(),
}).optional()
  }
});

export const BranchComparisonResponseSchema = z.object({
  sourceBranch: ProjectBranchSchema,
  targetBranch: ProjectBranchSchema,
  commonAncestor: BranchCommitSchema.optional(),
  ahead: z.number().int(),
  behind: z.number().int(),
  conflicts: z.array(BranchConflictSchema),
  canMerge: z.boolean(),
  mergeStrategy: z.enum(['merge', 'squash', 'rebase']).optional(),
  estimatedMergeTime: z.number().int().optional(),
});

export type BranchStatsResponse = z.infer<typeof BranchStatsResponseSchema>;
export type BranchTimelineResponse = z.infer<typeof BranchTimelineResponseSchema>;
export type BranchComparisonResponse = z.infer<typeof BranchComparisonResponseSchema>;

// Utility types

}
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
}
};
}
}
export interface MergeContext {
  mergeRequestId: string;
  sourceBranchId: string;
  targetBranchId: string;
  userId: string;
  strategy: 'merge' | 'squash' | 'rebase';
  conflictResolution?: Record<string, any>;
}
}
}
export interface BranchHierarchy {
  branch: ProjectBranch;
  children: BranchHierarchy;
  depth: number;
  path: string;
}
}
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
}
};

// Validation helpers
}
export const validateCreateBranchRequest = (request: unknown): CreateBranchRequest => {
  return CreateBranchRequestSchema.parse(request);
};

export const validateUpdateBranchRequest = (request: unknown): UpdateBranchRequest => {
  return UpdateBranchRequestSchema.parse(request);
};

export const validateCreateMergeRequestRequest = (request: unknown): CreateMergeRequestRequest => {
  return CreateMergeRequestRequestSchema.parse(request);
};

export const validateMergeBranchRequest = (request: unknown): MergeBranchRequest => {
  return MergeBranchRequestSchema.parse(request);
};

export const validateBranchFilter = (filter: unknown): BranchFilter => {
  return BranchFilterSchema.parse(filter);
};

export const validateMergeRequestFilter = (filter: unknown): MergeRequestFilter => {
  return MergeRequestFilterSchema.parse(filter);
};

// Constants
export const BRANCHING_DEFAULTS = {
  DEFAULT_BRANCH_TYPE: 'feature' as BranchType,
  DEFAULT_PROTECTION_LEVEL: 'none' as ProtectionLevel,
  DEFAULT_MERGE_STRATEGY: 'merge' as const,
  MAX_BRANCH_NAME_LENGTH: 255,
  MAX_COMMIT_MESSAGE_LENGTH: 1000,
  MAX_MERGE_REQUEST_TITLE_LENGTH: 500,
  AUTO_DELETE_MERGED_BRANCHES: false,
  REQUIRE_REVIEW_BY_DEFAULT: false,
  ALLOW_FORCE_PUSH_BY_DEFAULT: false,
  CONFLICT_RESOLUTION_TIMEOUT: 300000, // 5 minutes,
  MERGE_TIMEOUT: 600000 // 10 minutes,
} as const;

export const BRANCH_TYPE_DESCRIPTIONS = {
  main: 'Main development branch',
  feature: 'Feature development branch',
  hotfix: 'Hotfix branch for urgent fixes',
  release: 'Release preparation branch',
  experiment: 'Experimental branch for testing',
} as const;

export const BRANCH_STATUS_DESCRIPTIONS = {
  active: 'Active development branch',
  merged: 'Branch has been merged',
  abandoned: 'Branch has been abandoned',
  archived: 'Branch has been archived',
} as const;

export const PROTECTION_LEVEL_DESCRIPTIONS = {
  none: 'No protection - anyone can push',
  protected: 'Protected - requires review',
  locked: 'Locked - only admins can push',
} as const;

export const MERGE_STRATEGY_DESCRIPTIONS = {
  merge: 'Create a merge commit',
  squash: 'Squash commits into one',
  rebase: 'Rebase and merge',
} as const;

// Event types for real-time updates

}
export interface BranchEvent {
  type: 'branch_created' | 'branch_updated' | 'branch_deleted' | 'branch_merged';
  branchId: string;
  projectId: string;
  userId: string;
  data: any;
  timestamp: Date;
}
}
}
export interface MergeRequestEvent {
  type: 'merge_request_created' | 'merge_request_updated' | 'merge_request_merged' | 'merge_request_closed';
  mergeRequestId: string;
  projectId: string;
  userId: string;
  data: any;
  timestamp: Date;
}
}
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
}