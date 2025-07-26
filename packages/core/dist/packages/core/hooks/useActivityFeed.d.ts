/**
 * Epic 9.2.3 - useActivityFeed Hook
 * React hook for activity feed management
 */
import { ActivityEventWithActorInfo, ActivityEventFilter } from '../types/workspace';
interface UseActivityFeedOptions {
    limit?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
interface ActivityStatsData {
    total_events: number;
    events_by_type: Record<string, number>;
    events_by_day: Array<{
        date: string;
        count: number;
    }>;
    most_active_users: Array<{
        user_id: string;
        count: number;
    }>;
}
export declare function useActivityFeed(
  workspaceId: string,
  userId: string,
  filters?: ActivityEventFilter,
  options?: UseActivityFeedOptions
): {
    activities: ActivityEventWithActorInfo[];
    loading: boolean;
    loadingMore: boolean;
    error: string;
    hasMore: boolean;
    page: number;
    stats: ActivityStatsData;
    eventTypes: string[];
    loadMore: () => void;
    refresh: () => void;
    fetchActivityEvent: (eventId: string) => Promise<ActivityEventWithActorInfo | null>;
};
export declare function useProjectActivityFeed(projectId: string, userId: string, options?: UseActivityFeedOptions): {
    activities: ActivityEventWithActorInfo[];
    loading: boolean;
    loadingMore: boolean;
    error: string;
    hasMore: boolean;
    page: number;
    loadMore: () => void;
    refresh: () => void;
};
export {};
//# sourceMappingURL=useActivityFeed.d.ts.map