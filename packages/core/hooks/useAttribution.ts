import { useState, useCallback } from 'react';
import { CreateAttributionRequest,
  AttributionFilter,
  AttributionStatsRequest,
  UpdatePrivacySettingsRequest,
  ChangeAttribution,
  AttributionStatsResponse,
  AttributionTimelineResponse,
  ContributorStatsResponse,
  AttributionPrivacySettings,
  AttributionSession }
  AttributionContext
 from '../types/attribution';


interface UseAttributionReturn { // State
  loading: boolean;
  error: string | null;
  // Actions
  recordAttribution: (request: CreateAttributionRequest) => Promise<ChangeAttribution>
  getAttributionStats: (request: AttributionStatsRequest) => Promise<AttributionStatsResponse> }
  getAttributionTimeline: (projectId: string, filter: AttributionFilter) => Promise<AttributionTimelineResponse>;


  getContributorStats: (projectId: string, dateRange?: { start: Date; end: Date }) => Promise<ContributorStatsResponse>;
  listAttributions: (filter: AttributionFilter) => Promise<ChangeAttribution>
  startSession: (projectId: string, sessionId?: string) => Promise<AttributionSession>;
  endSession: (sessionId: string) => Promise<void>
  updatePrivacySettings: (request: UpdatePrivacySettingsRequest) => Promise<AttributionPrivacySettings>
  getPrivacySettings: (projectId: string) => Promise<AttributionPrivacySettings | null>
  cleanupOldData: (projectId: string) => Promise<void>
  getResourceAttribution: (projectId: string, resourceType: string, resourceId: string) => Promise<ChangeAttribution>
  getAuthorAttribution: (projectId: string, authorId: string, dateRange?: { start: Date; end: Date }) => Promise<ChangeAttribution>;
  recordBatchAttributions: (projectId: string, attributions: any, batchId?: string) => Promise<ChangeAttribution>;
  // Utility
  clearError: () => void;

export const useAttribution = (): UseAttributionReturn => { const [loading, setLoading] = useState(false);
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
  const recordAttribution = useCallback(async (request: CreateAttributionRequest): Promise<ChangeAttribution> => { return apiCall<ChangeAttribution>('/api/attribution/record', {)
  method: 'POST'
  body: JSON.stringify(request) }
});
  }, [apiCall]);
  const getAttributionStats = useCallback(async (request: AttributionStatsRequest): Promise<AttributionStatsResponse> => {
    const params = new URLSearchParams();
    if (request.period) params.append('period', request.period);
    if (request.authorId) params.append('authorId', request.authorId);
    if (request.startDate) params.append('startDate', request.startDate.toISOString());
    if (request.endDate) params.append('endDate', request.endDate.toISOString());
    if (request.resourceType) params.append('resourceType', request.resourceType);
    if (request.changeType) params.append('changeType', request.changeType);
    if (request.includeAggregations !== undefined) params.append('includeAggregations', request.includeAggregations.toString());
    if (request.includeTimeline !== undefined) params.append('includeTimeline', request.includeTimeline.toString());
    if (request.includeHeatmap !== undefined) params.append('includeHeatmap', request.includeHeatmap.toString());
    if (request.includeCollaborationMetrics !== undefined) params.append('includeCollaborationMetrics', request.includeCollaborationMetrics.toString());
    return apiCall<AttributionStatsResponse>(`/api/attribution/stats/${request.projectId}?${params.toString()}`);}
  }, [apiCall]);
  const getAttributionTimeline = useCallback(async (projectId: string, filter: AttributionFilter): Promise<AttributionTimelineResponse> => {
    const params = new URLSearchParams();
    if (filter.resourceType) params.append('resourceType', filter.resourceType);
    if (filter.resourceId) params.append('resourceId', filter.resourceId);
    if (filter.changeType) params.append('changeType', filter.changeType);
    if (filter.authorId) params.append('authorId', filter.authorId);
    if (filter.authorType) params.append('authorType', filter.authorType);
    if (filter.sessionId) params.append('sessionId', filter.sessionId);
    if (filter.dateFrom) params.append('dateFrom', filter.dateFrom.toISOString());
    if (filter.dateTo) params.append('dateTo', filter.dateTo.toISOString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());
    return apiCall<AttributionTimelineResponse>(`/api/attribution/timeline/${projectId}?${params.toString()}`);}
  }, [apiCall]);
  const getContributorStats = useCallback(async (projectId: string, dateRange?: { start: Date; end: Date }): Promise<ContributorStatsResponse> => {
    const params = new URLSearchParams();
    if (dateRange?.start) params.append('startDate', dateRange.start.toISOString());
    if (dateRange?.end) params.append('endDate', dateRange.end.toISOString());
    return apiCall<ContributorStatsResponse>(`/api/attribution/contributors/${projectId}?${params.toString()}`);}
  }, [apiCall]);
  const listAttributions = useCallback(async (filter: AttributionFilter): Promise<ChangeAttribution> => {
    const params = new URLSearchParams();
    if (filter.projectId) params.append('projectId', filter.projectId);
    if (filter.resourceType) params.append('resourceType', filter.resourceType);
    if (filter.resourceId) params.append('resourceId', filter.resourceId);
    if (filter.changeType) params.append('changeType', filter.changeType);
    if (filter.authorId) params.append('authorId', filter.authorId);
    if (filter.authorType) params.append('authorType', filter.authorType);
    if (filter.sessionId) params.append('sessionId', filter.sessionId);
    if (filter.batchId) params.append('batchId', filter.batchId);
    if (filter.snapshotId) params.append('snapshotId', filter.snapshotId);
    if (filter.dateFrom) params.append('dateFrom', filter.dateFrom.toISOString());
    if (filter.dateTo) params.append('dateTo', filter.dateTo.toISOString());
    if (filter.isCollaborative !== undefined) params.append('isCollaborative', filter.isCollaborative.toString());
    if (filter.minConfidenceScore !== undefined) params.append('minConfidenceScore', filter.minConfidenceScore.toString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    return apiCall<ChangeAttribution>(`/api/attribution/list?${params.toString()}`);}
  }, [apiCall]);
  const startSession = useCallback(async (projectId: string, sessionId?: string): Promise<AttributionSession> => { return apiCall<AttributionSession>('/api/attribution/session/start', {)
  method: 'POST' }
      body: JSON.stringify({ projectId, sessionId })
    });
  }, [apiCall]);
  const endSession = useCallback(async (sessionId: string): Promise<void> => { return apiCall<void>('/api/attribution/session/end', {)
  method: 'POST' }
      body: JSON.stringify({ sessionId })
    });
  }, [apiCall]);
  const updatePrivacySettings = useCallback(async (request: UpdatePrivacySettingsRequest): Promise<AttributionPrivacySettings> => {
    return apiCall<AttributionPrivacySettings>(`/api/attribution/privacy/${request.projectId}`, {)}

  method: 'PUT'
      body: JSON.stringify(request);
  });
  }, [apiCall]);
  const getPrivacySettings = useCallback(async (projectId: string): Promise<AttributionPrivacySettings | null> => {
    return apiCall<AttributionPrivacySettings | null>(`/api/attribution/privacy/${projectId}`);}
  }, [apiCall]);
  const cleanupOldData = useCallback(async (projectId: string): Promise<void> => {
    return apiCall<void>(`/api/attribution/cleanup/${projectId}`, {)}

  method: 'POST';
  });
  }, [apiCall]);
  const getResourceAttribution = useCallback(async (projectId: string, resourceType: string, resourceId: string): Promise<ChangeAttribution> => {
    return apiCall<ChangeAttribution>(`/api/attribution/resource/${projectId}/${resourceType}/${resourceId}`);}
  }, [apiCall]);
  const getAuthorAttribution = useCallback(async (projectId: string, authorId: string, dateRange?: { start: Date; end: Date }): Promise<ChangeAttribution> => {
    const params = new URLSearchParams();
    if (dateRange?.start) params.append('dateFrom', dateRange.start.toISOString());
    if (dateRange?.end) params.append('dateTo', dateRange.end.toISOString());
    return apiCall<ChangeAttribution>(`/api/attribution/author/${projectId}/${authorId}?${params.toString()}`);}
  }, [apiCall]);
  const recordBatchAttributions = useCallback(async (projectId: string, attributions: any, batchId?: string): Promise<ChangeAttribution> => { return apiCall<ChangeAttribution>('/api/attribution/batch', {)
  method: 'POST' }
      body: JSON.stringify({ projectId, attributions, batchId })
    });
  }, [apiCall]);
  const clearError = useCallback(() => { setError(null) }, []);
  return { loading
    error
    recordAttribution
    getAttributionStats
    getAttributionTimeline
    getContributorStats
    listAttributions
    startSession
    endSession
    updatePrivacySettings
    getPrivacySettings
    cleanupOldData
    getResourceAttribution
    getAuthorAttribution
    recordBatchAttributions }
    clearError
  };
};