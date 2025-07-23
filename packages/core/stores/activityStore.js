/**
 * Activity Store
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 *
 * Zustand store for managing activity data state in the frontend.
 * Provides reactive state management for activity tracking and monitoring.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
// Initial State
const initialState = {
    // Data State
    activities: [],
    currentActivity: null,
    metrics: null,
    // UI State
    isLoading: false,
    error: null,
    selectedActivityIds: [],
    // Query State
    currentQuery: {
        limit: 50,
        offset: 0,
        sortBy: 'timestamp',
        sortOrder: 'desc'
    },
    queryResult: null,
    lastQueryTime: null,
    // Real-time State
    isStreamConnected: false,
    streamSubscriptionId: null,
    recentActivities: [],
    // Filters and Preferences
    activeFilters: {},
    viewMode: 'list',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    groupBy: 'none',
    // Pagination
    currentPage: 1,
    pageSize: 50,
    hasNextPage: false,
    hasPreviousPage: false
};
// API Service Mock (replace with actual API integration)
const activityApi = {
    async queryActivities(query) {
        // Mock implementation - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockActivities = [];
        for (let i = 0; i < (query.limit || 10); i++) {
            mockActivities.push({
                id: `activity_${Date.now()}_${i}`,
                timestamp: new Date(Date.now() - i * 60000).toISOString(),
                type: ['user_action', 'system_event', 'security_event'][i % 3],
                severity: ['info', 'medium', 'high'][i % 3],
                status: 'completed',
                action: `Action ${i + 1}`,
                description: `Description for activity ${i + 1}`,
                category: 'general',
                source: `source_${i % 3}`,
                environment: 'development',
                metadata: {},
                tags: [],
                createdAt: new Date().toISOString(),
                version: 1
            });
        }
        return {
            activities: mockActivities,
            totalCount: 100,
            executionTime: 150
        };
    },
    async getMetrics(query) {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            totalActivities: 1000,
            activitiesByType: {
                user_action: 400,
                system_event: 300,
                admin_action: 100,
                security_event: 50,
                api_call: 100,
                data_change: 30,
                error_event: 10,
                performance_event: 5,
                authentication: 2,
                authorization: 1,
                file_operation: 1,
                workflow_event: 0
            },
            activitiesBySeverity: {
                critical: 5,
                high: 20,
                medium: 100,
                low: 375,
                info: 500
            },
            activitiesByStatus: {
                pending: 10,
                in_progress: 5,
                completed: 950,
                failed: 30,
                cancelled: 5
            },
            activitiesOverTime: [],
            topSources: [
                { source: 'user-interface', count: 400, percentage: 40 },
                { source: 'api-gateway', count: 300, percentage: 30 },
                { source: 'background-service', count: 200, percentage: 20 }
            ],
            topActions: [
                { action: 'view_page', count: 200, percentage: 20 },
                { action: 'api_request', count: 150, percentage: 15 },
                { action: 'login', count: 100, percentage: 10 }
            ],
            topUsers: [
                { userId: 'user1', userEmail: 'user1@example.com', count: 100, percentage: 10 },
                { userId: 'user2', userEmail: 'user2@example.com', count: 80, percentage: 8 }
            ],
            errorRate: 3.5,
            averageDuration: 250,
            performanceMetrics: {
                p50: 100,
                p95: 500,
                p99: 1000
            }
        };
    }
};
// Create the Zustand store
export const useActivityStore = create()(subscribeWithSelector((set, get) => ({
    ...initialState,
    // Data Actions
    setActivities: (activities) => set({ activities }),
    addActivity: (activity) => set((state) => ({
        activities: [activity, ...state.activities],
        recentActivities: [activity, ...state.recentActivities.slice(0, 19)] // Keep last 20
    })),
    updateActivity: (id, updates) => set((state) => ({
        activities: state.activities.map(activity => activity.id === id ? { ...activity, ...updates } : activity),
        currentActivity: state.currentActivity?.id === id
            ? { ...state.currentActivity, ...updates }
            : state.currentActivity
    })),
    removeActivity: (id) => set((state) => ({
        activities: state.activities.filter(activity => activity.id !== id),
        selectedActivityIds: state.selectedActivityIds.filter(selectedId => selectedId !== id),
        currentActivity: state.currentActivity?.id === id ? null : state.currentActivity
    })),
    setCurrentActivity: (activity) => set({ currentActivity: activity }),
    setMetrics: (metrics) => set({ metrics }),
    // Query Actions
    setQuery: (query) => set({ currentQuery: query }),
    updateQuery: (updates) => set((state) => ({
        currentQuery: { ...state.currentQuery, ...updates }
    })),
    setQueryResult: (result) => set({ queryResult: result }),
    clearQuery: () => set({ currentQuery: initialState.currentQuery }),
    // Filter Actions
    setActiveFilters: (filters) => set({ activeFilters: filters }),
    addFilter: (key, value) => set((state) => ({
        activeFilters: { ...state.activeFilters, [key]: value }
    })),
    removeFilter: (key) => set((state) => {
        const newFilters = { ...state.activeFilters };
        delete newFilters[key];
        return { activeFilters: newFilters };
    }),
    clearFilters: () => set({ activeFilters: {} }),
    // Selection Actions
    selectActivity: (id) => set((state) => ({
        selectedActivityIds: state.selectedActivityIds.includes(id)
            ? state.selectedActivityIds
            : [...state.selectedActivityIds, id]
    })),
    deselectActivity: (id) => set((state) => ({
        selectedActivityIds: state.selectedActivityIds.filter(selectedId => selectedId !== id)
    })),
    selectAllActivities: () => set((state) => ({
        selectedActivityIds: state.activities.map(activity => activity.id)
    })),
    clearSelection: () => set({ selectedActivityIds: [] }),
    toggleActivitySelection: (id) => set((state) => ({
        selectedActivityIds: state.selectedActivityIds.includes(id)
            ? state.selectedActivityIds.filter(selectedId => selectedId !== id)
            : [...state.selectedActivityIds, id]
    })),
    // View Actions
    setViewMode: (mode) => set({ viewMode: mode }),
    setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    setGroupBy: (groupBy) => set({ groupBy }),
    // Pagination Actions
    setPage: (page) => set({ currentPage: page }),
    setPageSize: (size) => set({ pageSize: size }),
    nextPage: () => set((state) => ({
        currentPage: state.hasNextPage ? state.currentPage + 1 : state.currentPage
    })),
    previousPage: () => set((state) => ({
        currentPage: state.hasPreviousPage ? state.currentPage - 1 : state.currentPage
    })),
    // Real-time Actions
    setStreamConnected: (connected) => set({ isStreamConnected: connected }),
    setStreamSubscriptionId: (id) => set({ streamSubscriptionId: id }),
    addRecentActivity: (activity) => set((state) => ({
        recentActivities: [activity, ...state.recentActivities.slice(0, 19)]
    })),
    clearRecentActivities: () => set({ recentActivities: [] }),
    // Async Actions
    loadActivities: async (query) => {
        const state = get();
        const queryToUse = query || { ...state.currentQuery, ...state.activeFilters };
        set({ isLoading: true, error: null });
        try {
            const result = await activityApi.queryActivities(queryToUse);
            set({
                activities: result.activities,
                queryResult: result,
                lastQueryTime: new Date().toISOString(),
                isLoading: false,
                hasNextPage: (queryToUse.offset || 0) + result.activities.length < result.totalCount,
                hasPreviousPage: (queryToUse.offset || 0) > 0
            });
        }
        catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load activities',
                isLoading: false
            });
        }
    },
    loadMetrics: async (query) => {
        const state = get();
        const queryToUse = query || { ...state.currentQuery, ...state.activeFilters };
        try {
            const metrics = await activityApi.getMetrics(queryToUse);
            set({ metrics });
        }
        catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to load metrics' });
        }
    },
    refreshData: async () => {
        const { loadActivities, loadMetrics } = get();
        await Promise.all([loadActivities(), loadMetrics()]);
    },
    // Utility Actions
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    reset: () => set(initialState)
})));
// Selectors for computed values
export const activitySelectors = {
    // Get filtered activities based on current filters
    getFilteredActivities: (state) => {
        return state.activities; // Filtering is done server-side
    },
    // Get activities grouped by the specified field
    getGroupedActivities: (state) => {
        const activities = state.activities;
        if (state.groupBy === 'none') {
            return { 'All Activities': activities };
        }
        const grouped = activities.reduce((groups, activity) => {
            const key = state.groupBy === 'type' ? activity.type :
                state.groupBy === 'severity' ? activity.severity :
                    state.groupBy === 'user' ? (activity.userId || 'System') :
                        state.groupBy === 'source' ? activity.source :
                            'Other';
            if (!groups[key])
                groups[key] = [];
            groups[key].push(activity);
            return groups;
        }, {});
        return grouped;
    },
    // Get selected activities
    getSelectedActivities: (state) => {
        return state.activities.filter(activity => state.selectedActivityIds.includes(activity.id));
    },
    // Check if there are any active filters
    hasActiveFilters: (state) => {
        return Object.keys(state.activeFilters).length > 0;
    },
    // Get summary statistics
    getSummaryStats: (state) => {
        const activities = state.activities;
        return {
            total: activities.length,
            byType: activities.reduce((acc, activity) => {
                acc[activity.type] = (acc[activity.type] || 0) + 1;
                return acc;
            }, {}),
            bySeverity: activities.reduce((acc, activity) => {
                acc[activity.severity] = (acc[activity.severity] || 0) + 1;
                return acc;
            }, {}),
            errors: activities.filter(a => a.status === 'failed').length,
            recent: activities.filter(a => new Date(a.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length
        };
    }
};
// Hook for real-time activity streaming
export const useActivityStream = () => {
    const store = useActivityStore();
    const startStream = React.useCallback(async (filters) => {
        // Mock WebSocket connection
        store.setStreamConnected(true);
        store.setStreamSubscriptionId('mock-subscription');
        // Simulate real-time activities
        const interval = setInterval(() => {
            const mockActivity = {
                id: `live_${Date.now()}`,
                timestamp: new Date().toISOString(),
                type: 'system_event',
                severity: 'info',
                status: 'completed',
                action: 'health_check',
                description: 'System health check completed',
                category: 'monitoring',
                source: 'health-service',
                environment: 'development',
                metadata: {},
                tags: [],
                createdAt: new Date().toISOString(),
                version: 1
            };
            store.addRecentActivity(mockActivity);
        }, 10000);
        // Store interval for cleanup
        globalThis.__activityStreamInterval = interval;
    }, [store]);
    const stopStream = React.useCallback(() => {
        store.setStreamConnected(false);
        store.setStreamSubscriptionId(null);
        if (globalThis.__activityStreamInterval) {
            clearInterval(globalThis.__activityStreamInterval);
            delete globalThis.__activityStreamInterval;
        }
    }, [store]);
    return {
        startStream,
        stopStream,
        isConnected: store.isStreamConnected,
        subscriptionId: store.streamSubscriptionId
    };
};
export default useActivityStore;
