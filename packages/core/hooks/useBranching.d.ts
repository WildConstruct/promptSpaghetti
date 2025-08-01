import { ProjectBranch,
  BranchCommit,
  BranchMergeRequest,
  BranchMergeReview,
  BranchHierarchy,
  BranchStatsResponse,
  BranchTimelineResponse,
  BranchComparisonResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
  CreateCommitRequest,
  CreateMergeRequestRequest,
  UpdateMergeRequestRequest,
  CreateReviewRequest,
  UpdateReviewRequest,
  MergeBranchRequest,
  SyncBranchRequest,
  BranchFilter }
  MergeRequestFilter
} from '../types/branching';

}
}
interface UseBranchingReturn { loading: boolean;
    error: string | null;
    createBranch: (request: CreateBranchRequest) => Promise<ProjectBranch>;
    updateBranch: (branchId: string, request: UpdateBranchRequest) => Promise<ProjectBranch>;
    deleteBranch: (branchId: string) => Promise<void>;
    getBranchById: (branchId: string) => Promise<ProjectBranch>;
    listBranches: (filter: BranchFilter) => Promise<ProjectBranch[]>;
    createCommit: (request: CreateCommitRequest) => Promise<BranchCommit>;
    getBranchCommits: (branchId: string, limit?: number, offset?: number) => Promise<BranchCommit[]>;
    createMergeRequest: (request: CreateMergeRequestRequest) => Promise<BranchMergeRequest>;
    updateMergeRequest: (mergeRequestId: string, request: UpdateMergeRequestRequest) => Promise<BranchMergeRequest>;
    getMergeRequestById: (mergeRequestId: string) => Promise<BranchMergeRequest>;
    listMergeRequests: (filter: MergeRequestFilter) => Promise<BranchMergeRequest[]>;
    closeMergeRequest: (mergeRequestId: string) => Promise<BranchMergeRequest>;
    mergeBranch: (request: MergeBranchRequest) => Promise<BranchMergeRequest>;
    createReview: (request: CreateReviewRequest) => Promise<BranchMergeReview>;
    updateReview: (reviewId: string, request: UpdateReviewRequest) => Promise<BranchMergeReview>;
    getMergeRequestReviews: (mergeRequestId: string) => Promise<BranchMergeReview[]>;
    getBranchStats: (projectId: string) => Promise<BranchStatsResponse>;
    getBranchTimeline: (projectId: string, dateRange?: {)
        start: Date;
        end: Date }
}
    }) => Promise<BranchTimelineResponse>;
    getBranchHierarchy: (projectId: string) => Promise<BranchHierarchy[]>;
    compareBranches: (sourceBranchId: string, targetBranchId: string) => Promise<BranchComparisonResponse>;
    syncBranch: (request: SyncBranchRequest) => Promise<void>;
    clearError: () => void;

export declare const useBranching: () => UseBranchingReturn;
export {};
//# sourceMappingURL=useBranching.d.ts.map