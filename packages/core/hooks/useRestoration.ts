import { useState, useCallback } from 'react';
import { CreateRestorationAttemptRequest,
  RestorationPreviewRequest,
  ConflictResolutionRequest,
  RestorationBookmarkRequest,
  RestorationAttempt,
  RestorationPreviewResponse,
  RestorationProgressResponse,
  RestorationStatsResponse,
  RestorationBookmark,
  ConflictResolutionResult }
  RestorationFilter
 from '../types/restoration';


interface UseRestorationReturn { // State
  loading: boolean;
  error: string | null;
  // Actions
  generatePreview: (request: RestorationPreviewRequest) => Promise<RestorationPreviewResponse>
  createRestoration: (request: CreateRestorationAttemptRequest) => Promise<RestorationAttempt>
  getProgress: (restorationAttemptId: string) => Promise<RestorationProgressResponse>
  resolveConflict: (request: ConflictResolutionRequest) => Promise<ConflictResolutionResult>
  cancelRestoration: (restorationAttemptId: string) => Promise<void>
  getStats: (projectId: string) => Promise<RestorationStatsResponse>
  createBookmark: (request: RestorationBookmarkRequest) => Promise<RestorationBookmark>
  getBookmarks: (projectId: string) => Promise<RestorationBookmark>
  deleteBookmark: (bookmarkId: string) => Promise<void>
  listRestorations: (filter: RestorationFilter) => Promise<RestorationAttempt>
  getRestorationDetails: (restorationAttemptId: string) => Promise<any>;
  // Utility
  clearError: () => void;
  export const useRestoration = (): UseRestorationReturn => {;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiCall = useCallback(async <T>(;);
  url: string }


  options: RequestInit = {}
  ): Promise<T> => { try {
  setLoading(true);
  setError(null);
  const response = await fetch(url, {)
  ...options
  headers: {
  'Content-Type': 'application/json' }
  ...options.headers
});
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);}
      const data = await response.json();
      if (!data.success) { throw new Error(data.error || 'Request failed');
      return data.data } catch (err) { const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
  setError(errorMessage);
  throw err } finally { setLoading(false) }, []);
  const generatePreview = useCallback(async (request: RestorationPreviewRequest): Promise<RestorationPreviewResponse> => { return apiCall<RestorationPreviewResponse>('/api/restoration/preview', {)
  method: 'POST'
  body: JSON.stringify(request) }
});
  }, [apiCall]);
  const createRestoration = useCallback(async (request: CreateRestorationAttemptRequest): Promise<RestorationAttempt> => { return apiCall<RestorationAttempt>('/api/restoration/attempts', {)
  method: 'POST'
  body: JSON.stringify(request) }
});
  }, [apiCall]);
  const getProgress = useCallback(async (restorationAttemptId: string): Promise<RestorationProgressResponse> => {
    return apiCall<RestorationProgressResponse>(`/api/restoration/attempts/${restorationAttemptId}/progress`);}
  }, [apiCall]);
  const resolveConflict = useCallback(async (request: ConflictResolutionRequest): Promise<ConflictResolutionResult> => { return apiCall<ConflictResolutionResult>('/api/restoration/conflicts/resolve', {)
  method: 'POST'
  body: JSON.stringify(request) }
});
  }, [apiCall]);
  const cancelRestoration = useCallback(async (restorationAttemptId: string): Promise<void> => {
    return apiCall<void>(`/api/restoration/attempts/${restorationAttemptId}/cancel`, {)}

  method: 'POST';
  });
  }, [apiCall]);
  const getStats = useCallback(async (projectId: string): Promise<RestorationStatsResponse> => {
    return apiCall<RestorationStatsResponse>(`/api/restoration/stats/${projectId}`);}
  }, [apiCall]);
  const createBookmark = useCallback(async (request: RestorationBookmarkRequest): Promise<RestorationBookmark> => { return apiCall<RestorationBookmark>('/api/restoration/bookmarks', {)
  method: 'POST'
  body: JSON.stringify(request) }
});
  }, [apiCall]);
  const getBookmarks = useCallback(async (projectId: string): Promise<RestorationBookmark> => {
    return apiCall<RestorationBookmark>(`/api/restoration/bookmarks/${projectId}`);}
  }, [apiCall]);
  const deleteBookmark = useCallback(async (bookmarkId: string): Promise<void> => {
    return apiCall<void>(`/api/restoration/bookmarks/${bookmarkId}`, {)}

  method: 'DELETE';
  });
  }, [apiCall]);
  const listRestorations = useCallback(async (filter: RestorationFilter): Promise<RestorationAttempt> => {
    const params = new URLSearchParams();
    if (filter.projectId) params.append('projectId', filter.projectId);
    if (filter.initiatedBy) params.append('initiatedBy', filter.initiatedBy);
    if (filter.status) params.append('status', filter.status);
    if (filter.restorationType) params.append('restorationType', filter.restorationType);
    if (filter.dateFrom) params.append('dateFrom', filter.dateFrom.toISOString());
    if (filter.dateTo) params.append('dateTo', filter.dateTo.toISOString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());
    return apiCall<RestorationAttempt>(`/api/restoration/attempts?${params.toString()}`);}
  }, [apiCall]);
  const getRestorationDetails = useCallback(async (restorationAttemptId: string): Promise<any> => {
    return apiCall<any>(`/api/restoration/attempts/${restorationAttemptId}`);}
  }, [apiCall]);
  const clearError = useCallback(() => { setError(null) }, []);
  return { loading
    error
    generatePreview
    createRestoration
    getProgress
    resolveConflict
    cancelRestoration
    getStats
    createBookmark
    getBookmarks
    deleteBookmark
    listRestorations
    getRestorationDetails }
    clearError
  };
};