/**
 * Performance Monitor for Epic 18.1.4
 * Real-time performance tracking and metrics collection
 */

}
}
export interface PerformanceMetric { name: string;
    values: number[];
    average: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
    count: number;
    lastUpdated: number }
}
}
export interface PerformanceAlert { metric: string;
    threshold: number;
    currentValue: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number }
}
}
export interface PerformanceConfig { maxSamples: number;
    alertThresholds: Record<string, number>;
    enableLogging: boolean;
    enableAlerts: boolean;

export declare class PerformanceMonitor {
    private metrics;
    private alerts;
    private config;
    private timers;
    constructor(config?: Partial<PerformanceConfig>);
    private initializePerformanceObserver;
    /**
     * Start timing a performance metric
     */
    startTiming(name: string): void;
    /**
     * End timing and record the performance metric
     */
    endTiming(name: string): number;
    /**
     * Record a performance metric value
     */
    recordMetric(name: string, value: number): void;
    /**
     * Check if a metric value exceeds alert thresholds
     */
    private checkAlerts;
    private calculateSeverity;
    /**
     * Get all performance metrics
     */
    getMetrics(): PerformanceMetric[];
    /**
     * Get a specific performance metric
     */
    getMetric(name: string): PerformanceMetric | undefined;
    /**
     * Get recent performance alerts
     */
    getAlerts(limit?: number): PerformanceAlert[];
    /**
     * Clear all metrics and alerts
     */
    clear(): void;
    /**
     * Get performance summary
     */
    getSummary(): Record<string, any>;
    /**
     * Export metrics to JSON
     */
    exportMetrics(): string;
    /**
     * Measure memory usage
     */
    measureMemory(name: string): void;
    /**
     * Measure function execution time
     */
    measure<T>(name: string, fn: () => T): T;
    /**
     * Measure async function execution time
     */
    measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Create a performance decorator
     */
    createDecorator(metricName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

export declare export declare function measurePerformance<T>(name: string, fn: () => T): T;
export declare function measurePerformanceAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
export declare function usePerformanceMonitor(): {
    startTiming: (name: string) => void;
    endTiming: (name: string) => number;
    recordMetric: (name: string, value: number) => void;
    getMetrics: () => PerformanceMetric[];
    getSummary: () => Record<string, any>;
    measureMemory: (name: string) => void }
}
};
//# sourceMappingURL=monitor.d.ts.map