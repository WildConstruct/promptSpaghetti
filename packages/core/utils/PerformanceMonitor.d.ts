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
  memory: { used: number; limit: number; percentage: number };
  fps: { current: number; average: number; drops: number };
  cacheStats: { hitRate: number; size: number };
  workerStats: {
    queueLength: number;
    busyWorkers: number;
    averageTime: number;
  };
}

export declare class PerformanceMonitor {
  static getInstance(): PerformanceMonitor;

  record(name: string, value: number, tags?: Record<string, string>): void;
  recordCacheHit(cacheName: string): void;
  recordCacheMiss(cacheName: string): void;

  measure<T>(operation: string, fn: () => T): T;
  measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T>;

  mark(name: string): void;
  measureMarks(startMark: string, endMark: string, metricName?: string): number;

  setThreshold(threshold: PerformanceThreshold): void;

  getCurrentFPS(): number;
  getAverageFPS(): number;
  getMemoryUsage(): { used: number; limit: number; percentage: number };

  generateReport(cacheStats?: any, workerStats?: any): PerformanceReport;

  subscribe(callback: (report: PerformanceReport) => void): () => void;
  clear(): void;

  getMetrics(name: string): PerformanceMetric[];
  exportMetrics(): Record<string, PerformanceMetric[]>;
  importMetrics(data: Record<string, PerformanceMetric[]>): void;
}

export declare const performanceMonitor: PerformanceMonitor;
export default performanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map
