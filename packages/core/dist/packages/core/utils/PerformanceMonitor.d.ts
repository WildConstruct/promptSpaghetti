/**
 * Performance Monitor Utility - E18-1753114561904
 *
 * Real-time performance monitoring system for Wild Construct platform
 * tracking director-friendly interface responsiveness and graph execution performance.
 */
export interface PerformanceMetric {
    name: string;
    value: number;
    timestamp: number;
    context?: Record<string, any>;
    threshold?: {
        warning: number;
        critical: number;
    };
}
export interface PerformanceReport {
    period: {
        start: number;
        end: number;
        duration: number;
    };
    metrics: {
        [key: string]: {
            count: number;
            average: number;
            min: number;
            max: number;
            p95: number;
            p99: number;
            values: number;
        };
    };
    alerts: PerformanceAlert;
}
export interface PerformanceAlert {
    metric: string;
    level: 'warning' | 'critical';
    value: number;
    threshold: number;
    timestamp: number;
    context?: Record<string, any>;
}
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
    recordMetric(name: string): any;
    value: number;
    context?: Record<string, any>;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map