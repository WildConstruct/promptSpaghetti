/**
 * Activity Store
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 *
 * Zustand store for managing activity data state in the frontend.
 * Provides reactive state management for activity tracking and monitoring.
 */
import { Activity, ActivityQuery, ActivityQueryResult, ActivityMetrics } from '../types/ActivityDataModel';
interface ActivityState {
    activities: Activity[];
    currentActivity: Activity | null;
    metrics: ActivityMetrics | null;
    isLoading: boolean;
    error: string | null;
    selectedActivityIds: string[];
    currentQuery: ActivityQuery;
    queryResult: ActivityQueryResult | null;
    lastQueryTime: string | null;
    isStreamConnected: boolean;
    streamSubscriptionId: string | null;
    recentActivities: Activity[];
    activeFilters: Partial<ActivityQuery>;
    viewMode: 'list' | 'timeline' | 'analytics';
    sortBy: 'timestamp' | 'severity' | 'type' | 'user';
    sortOrder: 'asc' | 'desc';
    groupBy: 'none' | 'type' | 'severity' | 'user' | 'source';
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
interface ActivityActions {
    setActivities: (activities: Activity[]) => void;
    addActivity: (activity: Activity) => void;
    updateActivity: (id: string, updates: Partial<Activity>) => void;
    removeActivity: (id: string) => void;
    setCurrentActivity: (activity: Activity | null) => void;
    setMetrics: (metrics: ActivityMetrics | null) => void;
    setQuery: (query: ActivityQuery) => void;
    updateQuery: (updates: Partial<ActivityQuery>) => void;
    setQueryResult: (result: ActivityQueryResult | null) => void;
    clearQuery: () => void;
    setActiveFilters: (filters: Partial<ActivityQuery>) => void;
    addFilter: (key: keyof ActivityQuery, value: any) => void;
    removeFilter: (key: keyof ActivityQuery) => void;
    clearFilters: () => void;
    selectActivity: (id: string) => void;
    deselectActivity: (id: string) => void;
    selectAllActivities: () => void;
    clearSelection: () => void;
    toggleActivitySelection: (id: string) => void;
    setViewMode: (mode: 'list' | 'timeline' | 'analytics') => void;
    setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    setGroupBy: (groupBy: string) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    setStreamConnected: (connected: boolean) => void;
    setStreamSubscriptionId: (id: string | null) => void;
    addRecentActivity: (activity: Activity) => void;
    clearRecentActivities: () => void;
    loadActivities: (query?: ActivityQuery) => Promise<void>;
    loadMetrics: (query?: ActivityQuery) => Promise<void>;
    refreshData: () => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
type ActivityStore = ActivityState & ActivityActions;
export declare const useActivityStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<ActivityStore>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: ActivityStore, previousSelectedState: ActivityStore) => void): () => void;
        <U>(selector: (state: ActivityStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export declare const activitySelectors: {
    getFilteredActivities: (state: ActivityStore) => Activity[];
    getGroupedActivities: (state: ActivityStore) => Record<string, Activity[]>;
    getSelectedActivities: (state: ActivityStore) => Activity[];
    hasActiveFilters: (state: ActivityStore) => boolean;
    getSummaryStats: (state: ActivityStore) => {,
        total: number;
        byType: Record<string, number>;
        bySeverity: Record<string, number>;
        errors: number;
        recent: number;
    };
};
export declare const useActivityStream: () => {
    startStream: (filters: ActivityQuery) => Promise<void>;
    stopStream: () => void;
    isConnected: boolean;
    subscriptionId: string | null;
};
export default useActivityStore;
//# sourceMappingURL=activityStore.d.ts.map