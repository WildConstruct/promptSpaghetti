import { useState, useCallback } from 'react';
export const useRestoration = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiCall = useCallback(async());
    ;
    url: string,
        options;
    RequestInit = {};
};
Promise;
{
    try {
        setLoading(true);
        setError(null);
        const response = await fetch(url, {});
        options,
            headers;
        {
            'Content-Type';
            'application/json',
            ;
            options.headers;
        }
        ;
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Request failed');
            return data.data;
        }
        try { }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
        [];
        ;
        const generatePreview = useCallback(async (request) => {
            return apiCall('/api/restoration/preview', {});
            method: 'POST',
                body;
            JSON.stringify(request),
            ;
        });
    }
    finally { }
    [apiCall];
    ;
    const createRestoration = useCallback(async (request) => {
        return apiCall('/api/restoration/attempts', {});
        method: 'POST',
            body;
        JSON.stringify(request),
        ;
    });
}
[apiCall];
;
const getProgress = useCallback(async (restorationAttemptId) => {
    return apiCall(`/api/restoration/attempts/${restorationAttemptId}/progress`);
});
[apiCall];
;
const resolveConflict = useCallback(async (request) => {
    return apiCall('/api/restoration/conflicts/resolve', {});
    method: 'POST',
        body;
    JSON.stringify(request),
    ;
});
[apiCall];
;
const cancelRestoration = useCallback(async (restorationAttemptId) => {
    return apiCall(`/api/restoration/attempts/${restorationAttemptId}/cancel`, {});
});
method: 'POST';
;
[apiCall];
;
const getStats = useCallback(async (projectId) => {
    return apiCall(`/api/restoration/stats/${projectId}`);
});
[apiCall];
;
const createBookmark = useCallback(async (request) => {
    return apiCall('/api/restoration/bookmarks', {});
    method: 'POST',
        body;
    JSON.stringify(request),
    ;
});
[apiCall];
;
const getBookmarks = useCallback(async (projectId) => {
    return apiCall(`/api/restoration/bookmarks/${projectId}`);
});
[apiCall];
;
const deleteBookmark = useCallback(async (bookmarkId) => {
    return apiCall(`/api/restoration/bookmarks/${bookmarkId}`, {});
});
method: 'DELETE';
;
[apiCall];
;
const listRestorations = useCallback(async (filter) => {
    const params = new URLSearchParams();
    if (filter.projectId)
        params.append('projectId', filter.projectId);
    if (filter.initiatedBy)
        params.append('initiatedBy', filter.initiatedBy);
    if (filter.status)
        params.append('status', filter.status);
    if (filter.restorationType)
        params.append('restorationType', filter.restorationType);
    if (filter.dateFrom)
        params.append('dateFrom', filter.dateFrom.toISOString());
    if (filter.dateTo)
        params.append('dateTo', filter.dateTo.toISOString());
    if (filter.limit)
        params.append('limit', filter.limit.toString());
    if (filter.offset)
        params.append('offset', filter.offset.toString());
    return apiCall(`/api/restoration/attempts?${params.toString()}`);
});
[apiCall];
;
const getRestorationDetails = useCallback(async (restorationAttemptId) => {
    return apiCall(`/api/restoration/attempts/${restorationAttemptId}`);
});
[apiCall];
;
const clearError = useCallback(() => {
    setError(null);
}, []);
return {
    loading,
    error,
    generatePreview,
    createRestoration,
    getProgress,
    resolveConflict,
    cancelRestoration,
    getStats,
    createBookmark,
    getBookmarks,
    deleteBookmark,
    listRestorations,
    getRestorationDetails,
    clearError
};
;
