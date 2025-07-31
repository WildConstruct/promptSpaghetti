/**
 * Performance Monitor Utility - E18-1753114561904
 *
 * Real-time performance monitoring system for Wild Construct platform
 * tracking director-friendly interface responsiveness and graph execution performance.
 */

}
export interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    context?: Record<string, any>;
    threshold?: {
        warning: number;
        critical: number;
}
    };

}
export interface PerformanceReport {
    period: {
        start: number;
        end: number;
        duration: number;
}
    };
    metrics: {
        [key: string]: {
            count: number;
            average: number;
            min: number;
            max: number;
            p95: number;
            p99: number;
            values: number[];
        };
    };
    alerts: PerformanceAlert[];

}
export interface PerformanceAlert {
    metric: string;
    level: 'warning' | 'critical';
    value: number;
    threshold: number;
    timestamp: number;
    context?: Record<string, any>;

export declare class PerformanceMonitor {
    private metrics;
    private thresholds;
    private alerts;
    private listeners;
    private reportingInterval;
    private maxMetricHistory;
    constructor();
    private setupDefaultThresholds;
    /**
     * Record a performance metric
     */
    recordMetric(name: string, value: number, context?: Record<string, any>): void;
    /**
     * Start a performance measurement
     */
    startMeasurement(name: string): () => void;
    /**
     * Measure function execution time
     */
    measureExecution<T>(name: string, fn: () => T, context?: Record<string, any>): T;
    /**
     * Measure async function execution time
     */
    measureAsyncExecution<T>(name: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T>;
    /**
     * Get performance statistics for a metric
     */
    getMetricStats(name: string): {
        count: number;
        average: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
        recent: number[];
}
    } | null;
    /**
     * Generate comprehensive performance report
     */
    generateReport(periodMinutes?: number): PerformanceReport;
    /**
     * Monitor UI performance specifically
     */
    monitorUIPerformance(): void;
    /**
     * Monitor memory usage
     */
    monitorMemoryUsage(): void;
    /**
     * Monitor network performance
     */
    monitorNetworkPerformance(): void;
    /**
     * Add performance alert listener
     */
    onAlert(metricName: string, callback: (alert: PerformanceAlert) => void): void;
    /**
     * Remove performance alert listener
     */
    offAlert(metricName: string, callback: (alert: PerformanceAlert) => void): void;
    private checkThresholds;
    private reportToExternalSystems;
    private startReporting;
    /**
     * Initialize all performance monitoring
     */
    initializeAllMonitoring(): void;
    /**
     * Get current performance dashboard data
     */
    getDashboardData(): {
        overview: {
            totalMetrics: number;
            activeAlerts: number;
            healthScore: number;
        };
        keyMetrics: {
            name: string;
            current: number;
            average: number;
            trend: 'improving' | 'stable' | 'degrading'
  }[];
        recentAlerts: PerformanceAlert[];
    };

export declare const performanceMonitor: PerformanceMonitor;
export default performanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map