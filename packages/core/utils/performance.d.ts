/**
 * Performance measurement utilities for tracking execution metrics
 */
export interface ExecutionMetrics {
    duration: number;
    startTime: number;
    endTime: number;
    memory?: number;
    metadata?: Record<string, any>;
}
/**
 * Measures execution time of a function
 */
export declare function measureExecution<T>(fn: () => T | Promise<T>, metadata?: Record<string, any>): Promise<{
    result: T;
    metrics: ExecutionMetrics;
}>;
/**
 * Simple performance timer
 */
export declare class PerformanceTimer {
    private startTime;
    private endTime?;
    constructor();
    stop(): ExecutionMetrics;
    reset(): void;
}
/**
 * Track performance metrics for multiple operations
 */
export declare class PerformanceTracker {
    private metrics;
    addMetric(operation: string, metric: ExecutionMetrics): void;
    getMetrics(operation: string): ExecutionMetrics[];
    getAverageMetrics(operation: string): ExecutionMetrics | null;
    clear(operation?: string): void;
}
export declare const globalPerformanceTracker: PerformanceTracker;
//# sourceMappingURL=performance.d.ts.map