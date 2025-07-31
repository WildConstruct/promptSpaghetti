/**
 * Performance measurement utilities for tracking execution metrics
 */

}
export interface ExecutionMetrics {
  duration: number;
  startTime: number;
  endTime: number;
  memory?: number;
  metadata?: Record<string, any>;
  /**
  * Measures execution time of a function
  */
}
}
export async function measureExecution<T>()
  fn: () => T | Promise<T>,
  metadata?: Record<string, any>
): Promise<{ result: T; metrics: ExecutionMetrics }> {

  const startTime = Date.now();
  const startMemory = process.memoryUsage?.()?.heapUsed || 0;
  try {
  const result = await fn();
  const endTime = Date.now();
  const endMemory = process.memoryUsage?.()?.heapUsed || 0;
  const metrics: ExecutionMetrics = {,
  duration: endTime - startTime,
  startTime,
  endTime,
  memory: endMemory - startMemory,
  metadata
};
    return { result, metrics };
  } catch (error) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage?.()?.heapUsed || 0;
    const metrics: ExecutionMetrics = {,
  duration: endTime - startTime,
      startTime,
      endTime,
      memory: endMemory - startMemory,
      metadata: { ...metadata, error: error instanceof Error ? error.message : String(error) }
    };
    throw error;


/**
 * Simple performance timer
 */
export class PerformanceTimer {
  private startTime: number;
  private endTime?: number;
  constructor() {
  this.startTime = Date.now();
  stop(): ExecutionMetrics {,
  this.endTime = Date.now();
  return {
  duration: this.endTime - this.startTime,
  startTime: this.startTime,
  endTime: this.endTime,
};

  reset(): void {
  this.startTime = Date.now();
  this.endTime = undefined;
  /**
  * Track performance metrics for multiple operations
  */
  export class PerformanceTracker {
  private metrics: Map<string, ExecutionMetrics> = new Map();
  addMetric(operation: string, metric: ExecutionMetrics): void {,
  if (!this.metrics.has(operation)) {
  this.metrics.set(operation, []);
  this.metrics.get(operation)!.push(metric);
  getMetrics(operation: string): ExecutionMetrics {,
  return this.metrics.get(operation) || [];
  getAverageMetrics(operation: string): ExecutionMetrics | null {,
  const metrics = this.getMetrics(operation);
  if (metrics.length === 0) return null;
  return {
  duration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
  startTime: metrics[0].startTime,
  endTime: metrics[metrics.length - 1].endTime,
  memory: metrics.reduce((sum, m) => sum + (m.memory || 0), 0) / metrics.length,
};

  clear(operation?: string): void {
    if (operation) {
      this.metrics.delete(operation);
    } else {
      this.metrics.clear();


export const globalPerformanceTracker = new PerformanceTracker();