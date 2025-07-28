/**
 * Performance Monitor for Epic 18.1.4
 * Real-time performance tracking and metrics collection
 */
export interface PerformanceMetric {
    name: string;
    values: number;
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
    count: number;
    lastUpdated: number;
}
export interface PerformanceAlert {
    metric: string;
    threshold: number;
    currentValue: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
}
export interface PerformanceConfig {
    maxSamples: number;
    alertThresholds: Record<string, number>;
    enableLogging: boolean;
    enableAlerts: boolean;
}
export declare class PerformanceMonitor {
    private metrics;
    private alerts;
    private config;
    private timers;
    constructor(config?: Partial<PerformanceConfig>);
    private initializePerformanceObserver;
    catch(error: any): any;
    /**
     * Check if a metric value exceeds alert thresholds
     */
    private checkAlerts;
    private calculateSeverity;
}
//# sourceMappingURL=monitor.d.ts.map