import { useState, useCallback } from 'react';
import { 
  ProjectBranch,
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
  BranchFilter,
  MergeRequestFilter
} from '../types/branching';

interface UseBranchingReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Branch operations
  createBranch: (request: CreateBranchRequest) => Promise<ProjectBranch>;
  updateBranch: (branchId: string, request: UpdateBranchRequest) => Promise<ProjectBranch>;
  deleteBranch: (branchId: string) => Promise<void>;
  getBranchById: (branchId: string) => Promise<ProjectBranch>;
  listBranches: (filter: BranchFilter) => Promise<ProjectBranch[]>;
  
  // Commit operations
  createCommit: (request: CreateCommitRequest) => Promise<BranchCommit>;
  getBranchCommits: (branchId: string, limit?: number, offset?: number) => Promise<BranchCommit[]>;
  
  // Merge request operations
  createMergeRequest: (request: CreateMergeRequestRequest) => Promise<BranchMergeRequest>;
  updateMergeRequest: (mergeRequestId: string, request: UpdateMergeRequestRequest) => Promise<BranchMergeRequest>;
  getMergeRequestById: (mergeRequestId: string) => Promise<BranchMergeRequest>;
  listMergeRequests: (filter: MergeRequestFilter) => Promise<BranchMergeRequest[]>;
  closeMergeRequest: (mergeRequestId: string) => Promise<BranchMergeRequest>;
  mergeBranch: (request: MergeBranchRequest) => Promise<BranchMergeRequest>;
  
  // Review operations
  createReview: (request: CreateReviewRequest) => Promise<BranchMergeReview>;
  updateReview: (reviewId: string, request: UpdateReviewRequest) => Promise<BranchMergeReview>;
  getMergeRequestReviews: (mergeRequestId: string) => Promise<BranchMergeReview[]>;
  
  // Analytics and insights
  getBranchStats: (projectId: string) => Promise<BranchStatsResponse>;
  getBranchTimeline: (projectId: string, dateRange?: { start: Date; end: Date }) => Promise<BranchTimelineResponse>;
  getBranchHierarchy: (projectId: string) => Promise<BranchHierarchy[]>;
  compareBranches: (sourceBranchId: string, targetBranchId: string) => Promise<BranchComparisonResponse>;
  
  // Synchronization
  syncBranch: (request: SyncBranchRequest) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useBranching = (): UseBranchingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Branch operations
  const createBranch = useCallback(async (request: CreateBranchRequest): Promise<ProjectBranch> => {
    return apiCall<ProjectBranch>('/api/branches', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }, [apiCall]);

  const updateBranch = useCallback(async (branchId: string, request: UpdateBranchRequest): Promise<ProjectBranch> => {
    return apiCall<ProjectBranch>(`/api/branches/${branchId}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }, [apiCall]);

  const deleteBranch = useCallback(async (branchId: string): Promise<void> => {
    return apiCall<void>(`/api/branches/${branchId}`, {
      method: 'DELETE'
    });
  }, [apiCall]);

  const getBranchById = useCallback(async (branchId: string): Promise<ProjectBranch> => {
    return apiCall<ProjectBranch>(`/api/branches/${branchId}`);
  }, [apiCall]);

  const listBranches = useCallback(async (filter: BranchFilter): Promise<ProjectBranch[]> => {
    const params = new URLSearchParams();
    
    if (filter.projectId) params.append('projectId', filter.projectId);
    if (filter.branchType) params.append('branchType', filter.branchType);
    if (filter.status) params.append('status', filter.status);
    if (filter.protectionLevel) params.append('protectionLevel', filter.protectionLevel);
    if (filter.createdBy) params.append('createdBy', filter.createdBy);
    if (filter.parentBranchId) params.append('parentBranchId', filter.parentBranchId);
    if (filter.namePattern) params.append('namePattern', filter.namePattern);
    if (filter.createdAfter) params.append('createdAfter', filter.createdAfter.toISOString());
    if (filter.createdBefore) params.append('createdBefore', filter.createdBefore.toISOString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

    return apiCall<ProjectBranch[]>(`/api/branches?${params.toString()}`);
  }, [apiCall]);

  // Commit operations
  const createCommit = useCallback(async (request: CreateCommitRequest): Promise<BranchCommit> => {
    return apiCall<BranchCommit>(`/api/branches/${request.branchId}/commits`, {
      method: 'POST',
      body: JSON.stringify({
        snapshotId: request.snapshotId,
        commitMessage: request.commitMessage,
        parentCommitIds: request.parentCommitIds,
        commitMetadata: request.commitMetadata
      })
    });
  }, [apiCall]);

  const getBranchCommits = useCallback(async (branchId: string, limit = 20, offset = 0): Promise<BranchCommit[]> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return apiCall<BranchCommit[]>(`/api/branches/${branchId}/commits?${params.toString()}`);
  }, [apiCall]);

  // Merge request operations
  const createMergeRequest = useCallback(async (request: CreateMergeRequestRequest): Promise<BranchMergeRequest> => {
    return apiCall<BranchMergeRequest>('/api/merge-requests', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }, [apiCall]);

  const updateMergeRequest = useCallback(async (mergeRequestId: string, request: UpdateMergeRequestRequest): Promise<BranchMergeRequest> => {
    return apiCall<BranchMergeRequest>(`/api/merge-requests/${mergeRequestId}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }, [apiCall]);

  const getMergeRequestById = useCallback(async (mergeRequestId: string): Promise<BranchMergeRequest> => {
    return apiCall<BranchMergeRequest>(`/api/merge-requests/${mergeRequestId}`);
  }, [apiCall]);

  const listMergeRequests = useCallback(async (filter: MergeRequestFilter): Promise<BranchMergeRequest[]> => {
    const params = new URLSearchParams();
    
    if (filter.projectId) params.append('projectId', filter.projectId);
    if (filter.sourceBranchId) params.append('sourceBranchId', filter.sourceBranchId);
    if (filter.targetBranchId) params.append('targetBranchId', filter.targetBranchId);
    if (filter.status) params.append('status', filter.status);
    if (filter.createdBy) params.append('createdBy', filter.createdBy);
    if (filter.assignedTo) params.append('assignedTo', filter.assignedTo);
    if (filter.reviewerId) params.append('reviewerId', filter.reviewerId);
    if (filter.createdAfter) params.append('createdAfter', filter.createdAfter.toISOString());
    if (filter.createdBefore) params.append('createdBefore', filter.createdBefore.toISOString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);

    return apiCall<BranchMergeRequest[]>(`/api/merge-requests?${params.toString()}`);
  }, [apiCall]);

  const closeMergeRequest = useCallback(async (mergeRequestId: string): Promise<BranchMergeRequest> => {
    return apiCall<BranchMergeRequest>(`/api/merge-requests/${mergeRequestId}/close`, {
      method: 'POST'
    });
  }, [apiCall]);

  const mergeBranch = useCallback(async (request: MergeBranchRequest): Promise<BranchMergeRequest> => {
    return apiCall<BranchMergeRequest>(`/api/merge-requests/${request.mergeRequestId}/merge`, {
      method: 'POST',
      body: JSON.stringify({
        mergeStrategy: request.mergeStrategy,
        commitMessage: request.commitMessage,
        deleteSourceBranch: request.deleteSourceBranch
      })
    });
  }, [apiCall]);

  // Review operations
  const createReview = useCallback(async (request: CreateReviewRequest): Promise<BranchMergeReview> => {
    return apiCall<BranchMergeReview>(`/api/merge-requests/${request.mergeRequestId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        status: request.status,
        reviewMessage: request.reviewMessage
      })
    });
  }, [apiCall]);

  const updateReview = useCallback(async (reviewId: string, request: UpdateReviewRequest): Promise<BranchMergeReview> => {
    // Would implement update review endpoint
    throw new Error('Update review not implemented yet');
  }, [apiCall]);

  const getMergeRequestReviews = useCallback(async (mergeRequestId: string): Promise<BranchMergeReview[]> => {
    return apiCall<BranchMergeReview[]>(`/api/merge-requests/${mergeRequestId}/reviews`);
  }, [apiCall]);

  // Analytics and insights
  const getBranchStats = useCallback(async (projectId: string): Promise<BranchStatsResponse> => {
    return apiCall<BranchStatsResponse>(`/api/branches/stats/${projectId}`);
  }, [apiCall]);

  const getBranchTimeline = useCallback(async (projectId: string, dateRange?: { start: Date; end: Date }): Promise<BranchTimelineResponse> => {
    const params = new URLSearchParams();
    
    if (dateRange?.start) params.append('startDate', dateRange.start.toISOString());
    if (dateRange?.end) params.append('endDate', dateRange.end.toISOString());

    return apiCall<BranchTimelineResponse>(`/api/branches/timeline/${projectId}?${params.toString()}`);
  }, [apiCall]);

  const getBranchHierarchy = useCallback(async (projectId: string): Promise<BranchHierarchy[]> => {
    return apiCall<BranchHierarchy[]>(`/api/branches/hierarchy/${projectId}`);
  }, [apiCall]);

  const compareBranches = useCallback(async (sourceBranchId: string, targetBranchId: string): Promise<BranchComparisonResponse> => {
    return apiCall<BranchComparisonResponse>(`/api/branches/${sourceBranchId}/compare/${targetBranchId}`);
  }, [apiCall]);

  // Synchronization
  const syncBranch = useCallback(async (request: SyncBranchRequest): Promise<void> => {
    return apiCall<void>(`/api/branches/${request.branchId}/sync`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }, [apiCall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchById,
    listBranches,
    createCommit,
    getBranchCommits,
    createMergeRequest,
    updateMergeRequest,
    getMergeRequestById,
    listMergeRequests,
    closeMergeRequest,
    mergeBranch,
    createReview,
    updateReview,
    getMergeRequestReviews,
    getBranchStats,
    getBranchTimeline,
    getBranchHierarchy,
    compareBranches,
    syncBranch,
    clearError
  };
};