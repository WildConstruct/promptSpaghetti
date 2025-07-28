import { PerformanceMetrics, MetricsVisualizationData, AlertCondition, DashboardWidget } from '../RateLimitingPerformanceMetrics';
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
    activeAlerts: AlertCondition;
    widgets: DashboardWidget;
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
export declare const useRateLimitingMetrics: {
    rateLimitingService: any;
    throttlingEngine: any;
    options: {};
}, MetricsServiceConfig: any, MetricsHookReturn: any;
export declare function useRateLimitingMetricsWidget(widgetId: string, metricsHook: unknown): {
    data: unknown;
    isLoading: boolean;
};
export default useRateLimitingMetrics;
//# sourceMappingURL=useRateLimitingMetrics.d.ts.map