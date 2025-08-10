/**
 * Performance Monitor for tracking and analyzing application performance
 * Part of Story 0.1: Performance Infrastructure
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceThreshold {
  metric: string;
  maxValue: number;
  action: 'warn' | 'error' | 'alert';
  callback?: (metric: PerformanceMetric) => void;
}

export interface PerformanceReport {
  metrics: Record<
    string,
    {
      count: number;
      total: number;
      average: number;
      min: number;
      max: number;
      p50: number;
      p95: number;
      p99: number;
    }
  >;
  memory: {
    used: number;
    limit: number;
    percentage: number;
  };
  fps: {
    current: number;
    average: number;
    drops: number;
  };
  cacheStats: {
    hitRate: number;
    size: number;
  };
  workerStats: {
    queueLength: number;
    busyWorkers: number;
    averageTime: number;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private observers: Array<(report: PerformanceReport) => void> = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private frameDrops = 0;
  private fpsHistory: number[] = [];
  private isMonitoring = false;
  private rafId: number | null = null;

  private constructor() {
    // Start FPS monitoring if in browser
    if (typeof window !== 'undefined') {
      this.startFPSMonitoring();
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);

    // Keep only last 1000 measurements per metric
    if (metricArray.length > 1000) {
      metricArray.shift();
    }

    // Check thresholds
    this.checkThresholds(metric);
  }

  /**
   * Record a cache hit or miss
   */
  recordCacheHit(cacheName: string): void {
    this.record(`cache:${cacheName}:hit`, 1);
  }

  recordCacheMiss(cacheName: string): void {
    this.record(`cache:${cacheName}:miss`, 1);
  }

  /**
   * Measure the execution time of a function
   */
  measure<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.record(operation, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${operation}:error`, duration);
      throw error;
    }
  }

  /**
   * Measure the execution time of an async function
   */
  async measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(operation, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${operation}:error`, duration);
      throw error;
    }
  }

  /**
   * Mark the start of an operation
   */
  mark(name: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   */
  measureMarks(
    startMark: string,
    endMark: string,
    metricName?: string
  ): number {
    if (typeof performance === 'undefined' || !performance.measure) {
      return 0;
    }

    const measureName = metricName || `${startMark}-${endMark}`;

    try {
      performance.measure(measureName, startMark, endMark);
      const entries = performance.getEntriesByName(measureName);

      if (entries.length > 0) {
        const duration = entries[entries.length - 1].duration;
        this.record(measureName, duration);

        // Clean up
        performance.clearMeasures(measureName);

        return duration;
      }
    } catch (error) {
      console.error('Failed to measure marks:', error);
    }

    return 0;
  }

  /**
   * Set a performance threshold
   */
  setThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.set(threshold.metric, threshold);
  }

  /**
   * Check if a metric exceeds its threshold
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);

    if (threshold && metric.value > threshold.maxValue) {
      switch (threshold.action) {
        case 'warn':
          console.warn(
            `Performance warning: ${metric.name} = ${metric.value}ms (threshold: ${threshold.maxValue}ms)`
          );
          break;
        case 'error':
          console.error(
            `Performance error: ${metric.name} = ${metric.value}ms (threshold: ${threshold.maxValue}ms)`
          );
          break;
        case 'alert':
          this.notifyObservers();
          break;
      }

      if (threshold.callback) {
        threshold.callback(metric);
      }
    }
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastFrameTime = performance.now();

    const measureFPS = (currentTime: number) => {
      if (!this.isMonitoring) return;

      const delta = currentTime - this.lastFrameTime;
      const fps = 1000 / delta;

      // Detect frame drops (less than 30 FPS)
      if (fps < 30 && this.frameCount > 10) {
        this.frameDrops++;
      }

      this.fpsHistory.push(fps);

      // Keep only last 60 measurements (1 second at 60fps)
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      this.lastFrameTime = currentTime;
      this.frameCount++;

      this.rafId = requestAnimationFrame(measureFPS);
    };

    this.rafId = requestAnimationFrame(measureFPS);
  }

  /**
   * Stop FPS monitoring
   */
  stopFPSMonitoring(): void {
    this.isMonitoring = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    return this.fpsHistory[this.fpsHistory.length - 1];
  }

  /**
   * Get average FPS
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;

    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): { used: number; limit: number; percentage: number } {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return { used: 0, limit: 0, percentage: 0 };
    }

    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    const limit = memory.jsHeapSizeLimit / (1024 * 1024); // Convert to MB
    const percentage = (used / limit) * 100;

    return { used, limit, percentage };
  }

  /**
   * Generate performance report
   */
  generateReport(cacheStats?: any, workerStats?: any): PerformanceReport {
    const report: PerformanceReport = {
      metrics: {},
      memory: this.getMemoryUsage(),
      fps: {
        current: this.getCurrentFPS(),
        average: this.getAverageFPS(),
        drops: this.frameDrops
      },
      cacheStats: cacheStats || { hitRate: 0, size: 0 },
      workerStats: workerStats || {
        queueLength: 0,
        busyWorkers: 0,
        averageTime: 0
      }
    };

    // Calculate statistics for each metric
    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;

      const sorted = values.map(v => v.value).sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);

      report.metrics[name] = {
        count: values.length,
        total: sum,
        average: sum / values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: this.percentile(sorted, 0.5),
        p95: this.percentile(sorted, 0.95),
        p99: this.percentile(sorted, 0.99)
      };
    }

    return report;
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;

    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * Subscribe to performance reports
   */
  subscribe(callback: (report: PerformanceReport) => void): () => void {
    this.observers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all observers
   */
  private notifyObservers(): void {
    const report = this.generateReport();
    this.observers.forEach(callback => callback(report));
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.frameCount = 0;
    this.frameDrops = 0;
    this.fpsHistory = [];
  }

  /**
   * Get raw metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): Record<string, PerformanceMetric[]> {
    const exported: Record<string, PerformanceMetric[]> = {};

    for (const [name, values] of this.metrics.entries()) {
      exported[name] = [...values];
    }

    return exported;
  }

  /**
   * Import metrics for analysis
   */
  importMetrics(data: Record<string, PerformanceMetric[]>): void {
    for (const [name, values] of Object.entries(data)) {
      this.metrics.set(name, values);
    }
  }
}
