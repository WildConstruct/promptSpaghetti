/**
 * Epic 9.2.3 - useActivityFeed Hook
 * React hook for activity feed management
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ActivityEventWithActorInfo, 
  ActivityEventFilter, 
  PaginatedResponse 
} from '../types/workspace';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

interface UseActivityFeedOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ActivityStatsData {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_day: Array<{ date: string; count: number }>;
  most_active_users: Array<{ user_id: string; count: number }>;
}

export function useActivityFeed(
  workspaceId: string,
  userId: string,
  filters: ActivityEventFilter = {},
  options: UseActivityFeedOptions = {}
) {
  const { limit = 20, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [activities, setActivities] = useState<ActivityEventWithActorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<ActivityStatsData | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  // Build query string from filters
  const buildQueryString = useCallback((filters: ActivityEventFilter, page: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.project_id) params.append('project_id', filters.project_id);
    if (filters.actor_id) params.append('actor_id', filters.actor_id);
    if (filters.event_types?.length) params.append('event_types', filters.event_types.join(','));
    if (filters.from_date) params.append('from_date', filters.from_date.toISOString());
    if (filters.to_date) params.append('to_date', filters.to_date.toISOString());

    return params.toString();
  }, [limit]);

  // Fetch activity feed
  const fetchActivities = useCallback(async (
    filters: ActivityEventFilter,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const queryString = buildQueryString(filters, page);
      const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/activity?${queryString}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.statusText}`);
      }

      const data: PaginatedResponse<ActivityEventWithActorInfo> = await response.json();
      
      if (append) {
        setActivities(prev => [...prev, ...data.data]);
      } else {
        setActivities(data.data);
      }
      
      setHasMore(data.pagination.has_next);
      setPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [workspaceId, userId, buildQueryString]);

  // Fetch activity statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/activity/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const statsData: ActivityStatsData = await response.json();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch activity stats:', err);
    }
  }, [workspaceId, userId]);

  // Fetch event types
  const fetchEventTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/activity/types`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch event types: ${response.statusText}`);
      }

      const types: string[] = await response.json();
      setEventTypes(types);
    } catch (err) {
      console.error('Failed to fetch event types:', err);
    }
  }, [workspaceId, userId]);

  // Load more activities (pagination)
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchActivities(filters, page + 1, true);
  }, [filters, page, hasMore, loadingMore, fetchActivities]);

  // Refresh activities (reset to first page)
  const refresh = useCallback(() => {
    setPage(1);
    fetchActivities(filters, 1, false);
  }, [filters, fetchActivities]);

  // Fetch single activity event
  const fetchActivityEvent = useCallback(async (eventId: string): Promise<ActivityEventWithActorInfo | null> => {
    try {
      const response = await fetch(`${API_BASE}/activity/${eventId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch activity event: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to fetch activity event:', err);
      return null;
    }
  }, [userId]);

  // Initial fetch and setup
  useEffect(() => {
    fetchActivities(filters, 1, false);
    fetchStats();
    fetchEventTypes();
  }, [fetchActivities, fetchStats, fetchEventTypes, filters]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  // Real-time updates (placeholder for WebSocket integration)
  useEffect(() => {
    // TODO: Integrate with WebSocket for real-time activity updates
    // This would listen for workspace activity events and update the feed accordingly
    
    const handleVisibilityChange = () => {
      if (!document.hidden && autoRefresh) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefresh, refresh]);

  return {
    activities,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    stats,
    eventTypes,
    loadMore,
    refresh,
    fetchActivityEvent,
  };
}

// Hook for project-specific activity feed
export function useProjectActivityFeed(
  projectId: string,
  userId: string,
  options: UseActivityFeedOptions = {}
) {
  const { limit = 20, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [activities, setActivities] = useState<ActivityEventWithActorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchProjectActivities = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE}/projects/${projectId}/activity?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project activity: ${response.statusText}`);
      }

      const data: PaginatedResponse<ActivityEventWithActorInfo> = await response.json();
      
      if (append) {
        setActivities(prev => [...prev, ...data.data]);
      } else {
        setActivities(data.data);
      }
      
      setHasMore(data.pagination.has_next);
      setPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch project activities:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [projectId, userId, limit]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchProjectActivities(page + 1, true);
  }, [page, hasMore, loadingMore, fetchProjectActivities]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchProjectActivities(1, false);
  }, [fetchProjectActivities]);

  useEffect(() => {
    fetchProjectActivities(1, false);
  }, [fetchProjectActivities]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    activities,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
  };
}