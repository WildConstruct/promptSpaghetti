/**
 * Revenue Analytics Hook
 * Story 30.1.2 - Revenue Dashboard Implementation
 * 
 * Custom React hook for fetching and managing revenue analytics data
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  RevenueDashboardData, 
  RevenueMetrics, 
  RevenueTimeRange,
  RevenueFilters,
  RevenueExportOptions,
  RevenueAPIResponse,
  RevenueError 
} from '../types/revenue';
import { revenueService } from '../services/revenueService';

export interface UseRevenueAnalyticsParams {
  scope: 'global' | 'creator' | 'template';
  entityId?: string;
  timeRange: RevenueTimeRange;
  customDateRange?: {
    start: Date | null;
    end: Date | null;
  };
  filters: RevenueFilters;
  refreshInterval?: number; // milliseconds, 0 to disable
  autoRefresh?: boolean;
  cacheEnabled?: boolean;
}

export interface UseRevenueAnalyticsReturn {
  // Data
  dashboardData: RevenueDashboardData | null;
  metrics: RevenueMetrics | null;
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  // Error handling
  error: string | null;
  lastError: RevenueError | null;
  // Actions
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'xlsx' | 'pdf', options?: Partial<RevenueExportOptions>) => Promise<void>;
  clearError: () => void;
  // Metadata
  lastUpdated: Date | null;
  cacheHit: boolean;
  executionTime: number | null;
}

export const useRevenueAnalytics = (params: UseRevenueAnalyticsParams): UseRevenueAnalyticsReturn => {
  // State
  const [dashboardData, setDashboardData] = useState<RevenueDashboardData | null>(null);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<RevenueError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cacheHit, setCacheHit] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      if (!isRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      setLastError(null);
      // Prepare request parameters
      const requestParams = {
        scope: params.scope,
        entityId: params.entityId,
        timeRange: params.timeRange,
        customDateRange: params.customDateRange,
        filters: params.filters,
        cacheEnabled: params.cacheEnabled !== false,
      };
      // Fetch data from service
      const startTime = performance.now();
      const response: RevenueAPIResponse<RevenueDashboardData> = await revenueService.getDashboardData()
        requestParams,
        { signal: abortControllerRef.current.signal }
      );
      const endTime = performance.now();
      // Only update state if component is still mounted
      if (!mountedRef.current) return;
      if (response.success && response.data) {
        setDashboardData(response.data);
        setMetrics(response.data.metrics);
        setLastUpdated(new Date());
        setCacheHit(response.metadata?.cacheHit || false);
        setExecutionTime(endTime - startTime);
        // Track analytics event
        await revenueService.trackEvent({)
          eventType: 'view_dashboard',
          timestamp: new Date(),
          userId: 'current-user', // Would come from auth context
          dashboardScope: params.scope,
          entityId: params.entityId,
          metadata: {,
            timeRange: params.timeRange,
            filtersApplied: Object.keys(params.filters).length > 0,
            cacheHit: response.metadata?.cacheHit,
            executionTime: endTime - startTime,
          }
        });
      } else {
        throw new Error(response.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return; // Request was cancelled, don't treat as error
        }
        setError(err.message);
        setLastError({)
          code: 'FETCH_DASHBOARD_ERROR',
          message: err.message,
          timestamp: new Date(),
          retryable: true,
        });
      } else {
        setError('An unexpected error occurred');
        setLastError({)
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          timestamp: new Date(),
          retryable: true,
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [
    params.scope,
    params.entityId,
    params.timeRange,
    params.customDateRange,
    params.filters,
    params.cacheEnabled
  ]);
  // Refresh data manually
  const refreshData = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);
  // Export data
  const exportData = useCallback(async (;)
    format: 'csv' | 'xlsx' | 'pdf', 
    options: Partial<RevenueExportOptions> = {}
  ) => {
    try {
      setIsExporting(true);
      setError(null);
      const exportOptions: RevenueExportOptions = {
        format,
        scope: params.scope,
        entityId: params.entityId,
        timeRange: params.timeRange,
        customDateRange: params.customDateRange,
        filters: params.filters,
        includeForecast: false,
        includeCharts: false,
        includeRawData: false,
        ...options
      };
      await revenueService.exportData(exportOptions);
      // Track export event
      await revenueService.trackEvent({)
        eventType: 'export_data',
        timestamp: new Date(),
        userId: 'current-user',
        dashboardScope: params.scope,
        entityId: params.entityId,
        metadata: {,
          format,
          timeRange: params.timeRange,
          filtersApplied: Object.keys(params.filters).length > 0,
        }
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(`Export failed: ${err.message}`);}
        setLastError({)
          code: 'EXPORT_ERROR',
          message: err.message,
          timestamp: new Date(),
          retryable: true,
        });
      }
    } finally {
      setIsExporting(false);
    }
  }, [
    params.scope,
    params.entityId,
    params.timeRange,
    params.customDateRange,
    params.filters
  ]);
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setLastError(null);
  }, []);
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);
  // Set up automatic refresh
  useEffect(() => {
    if (params.refreshInterval && params.refreshInterval > 0 && params.autoRefresh !== false) {
      refreshIntervalRef.current = setInterval(() => {
        fetchDashboardData(true);
      }, params.refreshInterval);
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [params.refreshInterval, params.autoRefresh, fetchDashboardData]);
  return {
    // Data
    dashboardData,
    metrics,
    // Loading states
    isLoading,
    isRefreshing,
    isExporting,
    // Error handling
    error,
    lastError,
    // Actions
    refreshData,
    exportData,
    clearError,
    // Metadata
    lastUpdated,
    cacheHit,
    executionTime
  };
};

// Specialized hook for template revenue analytics
export const useTemplateRevenueAnalytics = (templateId: string, timeRange: RevenueTimeRange = RevenueTimeRange.LAST_30D) => {
  return useRevenueAnalytics({)
    scope: 'template',
    entityId: templateId,
    timeRange,
    filters: {},
    refreshInterval: 60000, // 1 minute
    autoRefresh: true,
  });
};

// Specialized hook for creator revenue analytics
export const useCreatorRevenueAnalytics = (creatorId: string, timeRange: RevenueTimeRange = RevenueTimeRange.LAST_30D) => {
  return useRevenueAnalytics({)
    scope: 'creator',
    entityId: creatorId,
    timeRange,
    filters: {},
    refreshInterval: 60000, // 1 minute
    autoRefresh: true,
  });
};

// Specialized hook for global revenue analytics
export const useGlobalRevenueAnalytics = (timeRange: RevenueTimeRange = RevenueTimeRange.LAST_30D) => {
  return useRevenueAnalytics({)
    scope: 'global',
    timeRange,
    filters: {},
    refreshInterval: 30000, // 30 seconds for global dashboard
    autoRefresh: true,
  });
};

// Hook for revenue metrics comparison
export const useRevenueComparison = ()
  primaryParams: UseRevenueAnalyticsParams,
  comparisonParams: UseRevenueAnalyticsParams,
) => {
  const primary = useRevenueAnalytics(primaryParams);
  const comparison = useRevenueAnalytics(comparisonParams);
  const percentageChange = useCallback((current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);
  const comparison_metrics = {
    revenueChange: primary.metrics && comparison.metrics ,
      ? percentageChange(primary.metrics.totalRevenue, comparison.metrics.totalRevenue)
      : null,
    transactionChange: primary.metrics && comparison.metrics,
      ? percentageChange(primary.metrics.transactionCount, comparison.metrics.transactionCount)
      : null,
    customerChange: primary.metrics && comparison.metrics,
      ? percentageChange(primary.metrics.uniqueCustomers, comparison.metrics.uniqueCustomers)
      : null,
    aovChange: primary.metrics && comparison.metrics,
      ? percentageChange(primary.metrics.averageOrderValue, comparison.metrics.averageOrderValue)
      : null
  };
  return {
    primary,
    comparison,
    comparison_metrics,
    isLoading: primary.isLoading || comparison.isLoading,
    error: primary.error || comparison.error,
  };
};