import React, { ComponentType, useEffect, useMemo, useRef } from 'react';

export type PerformanceMetricType =
  | 'component'
  | 'api'
  | 'user_interaction'
  | 'custom';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: PerformanceMetricType;
  metadata?: Record<string, unknown>;
}

export interface PerformanceConfig {
  enableLogging: boolean;
  sampleRate: number;
  bufferSize: number;
  flushInterval: number;
}

const defaultConfig: PerformanceConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  sampleRate: 1,
  bufferSize: 1000,
  flushInterval: 30_000
};

type TimerHandle = ReturnType<typeof setInterval> | null;

class PerformanceMonitor {
  private readonly config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private flushTimer: TimerHandle = null;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.startPeriodicFlush();
  }

  measureExecution<T>(
    name: string,
    fn: () => T | Promise<T>,
    type: PerformanceMetricType = 'custom',
    metadata?: Record<string, unknown>
  ): T | Promise<T> {
    if (!this.shouldSample()) {
      return fn();
    }

    const startTime = this.now();
    const finish = (result: T): T => {
      const duration = this.now() - startTime;
      this.addMetric({ name, duration, timestamp: startTime, type, metadata });
      return result;
    };

    try {
      const result = fn();
      if (result instanceof Promise) {
        return result
          .then(value => finish(value))
          .catch(error => {
            this.addErrorMetric(name, startTime, type, metadata, error);
            throw error;
          });
      }

      return finish(result);
    } catch (error) {
      this.addErrorMetric(name, startTime, type, metadata, error);
      throw error;
    }
  }

  startTiming(name: string, type: PerformanceMetricType = 'custom'): (metadata?: Record<string, unknown>) => void {
    if (!this.shouldSample()) {
      return () => undefined;
    }

    const startTime = this.now();
    return (metadata?: Record<string, unknown>) => {
      const duration = this.now() - startTime;
      this.addMetric({
        name,
        duration,
        timestamp: startTime,
        type,
        metadata
      });
    };
  }

  trackApiCall<T>(
    url: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    return this.measureExecution(
      `api:${method}:${url}`,
      apiCall,
      'api',
      { url, method }
    ) as Promise<T>;
  }

  trackInteraction<T>(
    action: string,
    handler: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): T | Promise<T> {
    return this.measureExecution(
      `interaction:${action}`,
      handler,
      'user_interaction',
      metadata
    );
  }

  addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    if (this.config.enableLogging && metric.duration >= 100) {
      console.log(
        `[Performance] ${metric.name}: ${metric.duration.toFixed(2)}ms`,
        metric.metadata ?? {}
      );
    }

    if (this.metrics.length >= this.config.bufferSize) {
      this.flush();
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getStats(): {
    total: number;
    byType: Record<PerformanceMetricType, number>;
    averages: Record<string, number>;
    slowest?: PerformanceMetric;
  } {
    if (this.metrics.length === 0) {
      return { total: 0, byType: { component: 0, api: 0, user_interaction: 0, custom: 0 }, averages: {} };
    }

    const byType: Record<PerformanceMetricType, number> = {
      component: 0,
      api: 0,
      user_interaction: 0,
      custom: 0
    };
    const durations: Record<string, number[]> = {};
    let slowest = this.metrics[0];

    this.metrics.forEach(metric => {
      byType[metric.type] += 1;
      durations[metric.name] = durations[metric.name] ?? [];
      durations[metric.name].push(metric.duration);
      if (metric.duration > slowest.duration) {
        slowest = metric;
      }
    });

    const averages: Record<string, number> = {};
    Object.entries(durations).forEach(([name, values]) => {
      const total = values.reduce((sum, value) => sum + value, 0);
      averages[name] = total / values.length;
    });

    return {
      total: this.metrics.length,
      byType,
      averages,
      slowest
    };
  }

  flush(): PerformanceMetric[] {
    const flushed = this.metrics;
    this.metrics = [];
    return flushed;
  }

  destroy(): void {
    this.flush();
    this.stopPeriodicFlush();
  }

  private startPeriodicFlush(): void {
    if (this.flushTimer !== null) {
      return;
    }

    this.flushTimer = setInterval(() => {
      if (this.metrics.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private stopPeriodicFlush(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private shouldSample(): boolean {
    if (this.config.sampleRate >= 1) {
      return true;
    }

    return Math.random() < this.config.sampleRate;
  }

  private addErrorMetric(
    name: string,
    startTime: number,
    type: PerformanceMetricType,
    metadata: Record<string, unknown> | undefined,
    error: unknown
  ): void {
    const duration = this.now() - startTime;
    const errorMetadata = {
      ...metadata,
      error: error instanceof Error ? error.message : 'unknown error'
    };

    this.addMetric({
      name: `${name}:error`,
      duration,
      timestamp: startTime,
      type,
      metadata: errorMetadata
    });
  }

  private now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function usePerformanceTracking(
  name: string,
  dependencies: React.DependencyList = []
): void {
  const endRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    endRef.current = performanceMonitor.startTiming(`hook:${name}`, 'component');
    return () => {
      endRef.current?.({ phase: 'cleanup' });
      endRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

export function withPerformanceTracking<P>(
  Component: ComponentType<P>,
  name: string
): ComponentType<P> {
  const TrackedComponent = (props: P) => {
    usePerformanceTracking(`component:${name}`);
    const endTimingRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      endTimingRef.current = performanceMonitor.startTiming(
        `render:${name}`,
        'component'
      );

      return () => {
        endTimingRef.current?.({ phase: 'unmount' });
        endTimingRef.current = null;
      };
    }, []);

    return <Component {...props} />;
  };

  TrackedComponent.displayName = `WithPerformanceTracking(${Component.displayName ?? Component.name ?? 'Component'})`;

  return TrackedComponent;
}

export const performanceUtils = {
  formatDuration(duration: number): string {
    if (duration < 1) {
      return `${(duration * 1000).toFixed(2)}µs`;
    }

    if (duration < 1000) {
      return `${duration.toFixed(2)}ms`;
    }

    return `${(duration / 1000).toFixed(2)}s`;
  },
  percentile(metrics: PerformanceMetric[], percentile: number): number {
    if (metrics.length === 0) {
      return 0;
    }

    const sorted = [...metrics].sort((a, b) => a.duration - b.duration);
    const index = Math.min(
      sorted.length - 1,
      Math.max(0, Math.round((percentile / 100) * sorted.length) - 1)
    );
    return sorted[index].duration;
  },
  summarize(metrics: PerformanceMetric[]): {
    average: number;
    p95: number;
    p99: number;
  } {
    if (metrics.length === 0) {
      return { average: 0, p95: 0, p99: 0 };
    }

    const total = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return {
      average: total / metrics.length,
      p95: performanceUtils.percentile(metrics, 95),
      p99: performanceUtils.percentile(metrics, 99)
    };
  }
};

export function usePerformanceSummary(metrics: PerformanceMetric[]): {
  average: number;
  p95: number;
  p99: number;
} {
  return useMemo(() => performanceUtils.summarize(metrics), [metrics]);
}

