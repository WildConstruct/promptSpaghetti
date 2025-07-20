import { useState, useCallback } from 'react';
export const useAttribution = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiCall = useCallback(async (url, options = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
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
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const recordAttribution = useCallback(async (request) => {
        return apiCall('/api/attribution/record', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }, [apiCall]);
    const getAttributionStats = useCallback(async (request) => {
        const params = new URLSearchParams();
        if (request.period)
            params.append('period', request.period);
        if (request.authorId)
            params.append('authorId', request.authorId);
        if (request.startDate)
            params.append('startDate', request.startDate.toISOString());
        if (request.endDate)
            params.append('endDate', request.endDate.toISOString());
        if (request.resourceType)
            params.append('resourceType', request.resourceType);
        if (request.changeType)
            params.append('changeType', request.changeType);
        if (request.includeAggregations !== undefined)
            params.append('includeAggregations', request.includeAggregations.toString());
        if (request.includeTimeline !== undefined)
            params.append('includeTimeline', request.includeTimeline.toString());
        if (request.includeHeatmap !== undefined)
            params.append('includeHeatmap', request.includeHeatmap.toString());
        if (request.includeCollaborationMetrics !== undefined)
            params.append('includeCollaborationMetrics', request.includeCollaborationMetrics.toString());
        return apiCall(`/api/attribution/stats/${request.projectId}?${params.toString()}`);
    }, [apiCall]);
    const getAttributionTimeline = useCallback(async (projectId, filter) => {
        const params = new URLSearchParams();
        if (filter.resourceType)
            params.append('resourceType', filter.resourceType);
        if (filter.resourceId)
            params.append('resourceId', filter.resourceId);
        if (filter.changeType)
            params.append('changeType', filter.changeType);
        if (filter.authorId)
            params.append('authorId', filter.authorId);
        if (filter.authorType)
            params.append('authorType', filter.authorType);
        if (filter.sessionId)
            params.append('sessionId', filter.sessionId);
        if (filter.dateFrom)
            params.append('dateFrom', filter.dateFrom.toISOString());
        if (filter.dateTo)
            params.append('dateTo', filter.dateTo.toISOString());
        if (filter.limit)
            params.append('limit', filter.limit.toString());
        if (filter.offset)
            params.append('offset', filter.offset.toString());
        return apiCall(`/api/attribution/timeline/${projectId}?${params.toString()}`);
    }, [apiCall]);
    const getContributorStats = useCallback(async (projectId, dateRange) => {
        const params = new URLSearchParams();
        if (dateRange?.start)
            params.append('startDate', dateRange.start.toISOString());
        if (dateRange?.end)
            params.append('endDate', dateRange.end.toISOString());
        return apiCall(`/api/attribution/contributors/${projectId}?${params.toString()}`);
    }, [apiCall]);
    const listAttributions = useCallback(async (filter) => {
        const params = new URLSearchParams();
        if (filter.projectId)
            params.append('projectId', filter.projectId);
        if (filter.resourceType)
            params.append('resourceType', filter.resourceType);
        if (filter.resourceId)
            params.append('resourceId', filter.resourceId);
        if (filter.changeType)
            params.append('changeType', filter.changeType);
        if (filter.authorId)
            params.append('authorId', filter.authorId);
        if (filter.authorType)
            params.append('authorType', filter.authorType);
        if (filter.sessionId)
            params.append('sessionId', filter.sessionId);
        if (filter.batchId)
            params.append('batchId', filter.batchId);
        if (filter.snapshotId)
            params.append('snapshotId', filter.snapshotId);
        if (filter.dateFrom)
            params.append('dateFrom', filter.dateFrom.toISOString());
        if (filter.dateTo)
            params.append('dateTo', filter.dateTo.toISOString());
        if (filter.isCollaborative !== undefined)
            params.append('isCollaborative', filter.isCollaborative.toString());
        if (filter.minConfidenceScore !== undefined)
            params.append('minConfidenceScore', filter.minConfidenceScore.toString());
        if (filter.limit)
            params.append('limit', filter.limit.toString());
        if (filter.offset)
            params.append('offset', filter.offset.toString());
        if (filter.sortBy)
            params.append('sortBy', filter.sortBy);
        if (filter.sortOrder)
            params.append('sortOrder', filter.sortOrder);
        return apiCall(`/api/attribution/list?${params.toString()}`);
    }, [apiCall]);
    const startSession = useCallback(async (projectId, sessionId) => {
        return apiCall('/api/attribution/session/start', {
            method: 'POST',
            body: JSON.stringify({ projectId, sessionId }),
        });
    }, [apiCall]);
    const endSession = useCallback(async (sessionId) => {
        return apiCall('/api/attribution/session/end', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        });
    }, [apiCall]);
    const updatePrivacySettings = useCallback(async (request) => {
        return apiCall(`/api/attribution/privacy/${request.projectId}`, {
            method: 'PUT',
            body: JSON.stringify(request),
        });
    }, [apiCall]);
    const getPrivacySettings = useCallback(async (projectId) => {
        return apiCall(`/api/attribution/privacy/${projectId}`);
    }, [apiCall]);
    const cleanupOldData = useCallback(async (projectId) => {
        return apiCall(`/api/attribution/cleanup/${projectId}`, {
            method: 'POST',
        });
    }, [apiCall]);
    const getResourceAttribution = useCallback(async (projectId, resourceType, resourceId) => {
        return apiCall(`/api/attribution/resource/${projectId}/${resourceType}/${resourceId}`);
    }, [apiCall]);
    const getAuthorAttribution = useCallback(async (projectId, authorId, dateRange) => {
        const params = new URLSearchParams();
        if (dateRange?.start)
            params.append('dateFrom', dateRange.start.toISOString());
        if (dateRange?.end)
            params.append('dateTo', dateRange.end.toISOString());
        return apiCall(`/api/attribution/author/${projectId}/${authorId}?${params.toString()}`);
    }, [apiCall]);
    const recordBatchAttributions = useCallback(async (projectId, attributions, batchId) => {
        return apiCall('/api/attribution/batch', {
            method: 'POST',
            body: JSON.stringify({ projectId, attributions, batchId }),
        });
    }, [apiCall]);
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    return {
        loading,
        error,
        recordAttribution,
        getAttributionStats,
        getAttributionTimeline,
        getContributorStats,
        listAttributions,
        startSession,
        endSession,
        updatePrivacySettings,
        getPrivacySettings,
        cleanupOldData,
        getResourceAttribution,
        getAuthorAttribution,
        recordBatchAttributions,
        clearError,
    };
};
