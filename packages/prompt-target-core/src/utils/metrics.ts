import { MetricsInterface } from '../types/index.js';

/**
 * Simple in-memory metrics implementation
 */
export class MemoryMetrics implements MetricsInterface {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private timers = new Map<string, number>();

  counter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    this.gauges.set(key, value);
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.buildKey(name, tags);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
  }

  timer(name: string): { end(): void } {
    const startTime = Date.now();
    const timerId = `${name}-${Math.random()}`;

    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.histogram(name, duration);
      },
    };
  }

  /**
   * Get all metrics data
   */
  getMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<
      string,
      {
        count: number;
        min: number;
        max: number;
        avg: number;
        p95: number;
        p99: number;
      }
    >;
  } {
    const histogramStats: Record<string, any> = {};

    for (const [key, values] of this.histograms.entries()) {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const count = values.length;
        const min = sorted[0];
        const max = sorted[count - 1];
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;
        const p95Index = Math.floor(count * 0.95);
        const p99Index = Math.floor(count * 0.99);
        const p95 = sorted[p95Index] || max;
        const p99 = sorted[p99Index] || max;

        histogramStats[key] = { count, min, max, avg, p95, p99 };
      }
    }

    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: histogramStats,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }

  private buildKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }

    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    return `${name}{${tagString}}`;
  }
}

/**
 * No-op metrics for testing or when metrics are disabled
 */
export class NoOpMetrics implements MetricsInterface {
  counter(): void {}
  gauge(): void {}
  histogram(): void {}
  timer(): { end(): void } {
    return { end: () => {} };
  }
}
