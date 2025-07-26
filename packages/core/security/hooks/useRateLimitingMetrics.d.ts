/**
 * React Hook for Rate Limiting Performance Metrics
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 *
 * Custom React hook for managing rate limiting performance metrics,
 * providing real-time data updates and dashboard state management.
 */
import { 
  PerformanceMetrics,
  MetricsVisualizationData,
  AlertCondition,
  DashboardWidget
} from '../RateLimitingPerformanceMetrics';
import { RateLimitingService } from '../RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from '../AdaptiveThrottlingRules';
export interface UseRateLimitingMetricsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    timeRange?: string;
    enableAlerts?: boolean;
    retainHistoryHours?: number;
}
export interface MetricsHookReturn {
    currentMetrics: PerformanceMetrics | null;
    visualizationData: MetricsVisualizationData | null;
    activeAlerts: AlertCondition[];
    widgets: DashboardWidget[];
    isLoading: boolean;
    isConnected: boolean;
    lastUpdate: Date | null;
    systemStatus: 'healthy' | 'warning' | 'critical';
    refreshMetrics: () => Promise<void>;
    exportMetrics: (format: 'json' | 'csv') => string;
    acknowledgeAlert: (alertId: string) => void;
    addWidget: (widget: DashboardWidget) => void;
    removeWidget: (widgetId: string) => void;
    updateTimeRange: (range: string) => void;
    startMonitoring: () => void;
    stopMonitoring: () => void;
    error: string | null;
    clearError: () => void;
}
export interface MetricsServiceConfig {
    rateLimitingService: RateLimitingService;
    throttlingEngine?: AdaptiveThrottlingRulesEngine;
    options?: UseRateLimitingMetricsOptions;
}
export declare const useRateLimitingMetrics: (
  { rateLimitingService,
  throttlingEngine,
  options }: MetricsServiceConfig
) => MetricsHookReturn;
export declare const isLoading: boolean, setIsLoading: import("react").Dispatch<import("react").SetStateAction<boolean>>;
export default useRateLimitingMetrics;
//# sourceMappingURL=useRateLimitingMetrics.d.ts.map