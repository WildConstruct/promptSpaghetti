/**
 * Performance measurement utilities for tracking execution metrics
 */
/**
 * Measures execution time of a function
 */
export async function measureExecution(fn, metadata) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage?.()?.heapUsed || 0;
    try {
        const result = await fn();
        const endTime = Date.now();
        const endMemory = process.memoryUsage?.()?.heapUsed || 0;
        const metrics = {
            duration: endTime - startTime,
            startTime,
            endTime,
            memory: endMemory - startMemory,
            metadata
        };
        return { result, metrics };
    }
    catch (error) {
        const endTime = Date.now();
        const endMemory = process.memoryUsage?.()?.heapUsed || 0;
        const metrics = {
            duration: endTime - startTime,
            startTime,
            endTime,
            memory: endMemory - startMemory,
            metadata: { ...metadata, error: error instanceof Error ? error.message : String(error) }
        };
        throw error;
    }
}
/**
 * Simple performance timer
 */
export class PerformanceTimer {
    startTime;
    endTime;
    constructor() {
        this.startTime = Date.now();
    }
    stop() {
        this.endTime = Date.now();
        return {
            duration: this.endTime - this.startTime,
            startTime: this.startTime,
            endTime: this.endTime
        };
    }
    reset() {
        this.startTime = Date.now();
        this.endTime = undefined;
    }
}
/**
 * Track performance metrics for multiple operations
 */
export class PerformanceTracker {
    metrics = new Map();
    addMetric(operation, metric) {
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, []);
        }
        this.metrics.get(operation).push(metric);
    }
    getMetrics(operation) {
        return this.metrics.get(operation) || [];
    }
    getAverageMetrics(operation) {
        const metrics = this.getMetrics(operation);
        if (metrics.length === 0)
            return null;
        return {
            duration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
            startTime: metrics[0].startTime,
            endTime: metrics[metrics.length - 1].endTime,
            memory: metrics.reduce((sum, m) => sum + (m.memory || 0), 0) / metrics.length
        };
    }
    clear(operation) {
        if (operation) {
            this.metrics.delete(operation);
        }
        else {
            this.metrics.clear();
        }
    }
}
export const globalPerformanceTracker = new PerformanceTracker();
