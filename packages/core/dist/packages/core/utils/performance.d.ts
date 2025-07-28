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
export declare function measureExecution<T>(): any;
//# sourceMappingURL=performance.d.ts.map