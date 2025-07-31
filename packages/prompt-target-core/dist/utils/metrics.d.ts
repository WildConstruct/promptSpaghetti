import { MetricsInterface } from '../types/index.js';
/**
 * Simple in-memory metrics implementation
 */
export declare class MemoryMetrics implements MetricsInterface {
  private counters;
  private gauges;
  private histograms;
  private timers;
  counter(name: string, value?: number, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  histogram(name: string, value: number, tags?: Record<string, string>): void;
  timer(name: string): {
    end(): void;
  };
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
  };
  /**
   * Reset all metrics
   */
  reset(): void;
  private buildKey;
}
/**
 * No-op metrics for testing or when metrics are disabled
 */
export declare class NoOpMetrics implements MetricsInterface {
  counter(): void;
  gauge(): void;
  histogram(): void;
  timer(): {
    end(): void;
  };
}
