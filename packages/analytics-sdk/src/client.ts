/**
 * Cross-platform analytics client
 */

import { AnalyticsConfig, AnalyticsEvent, PerformanceMetric } from './types';

export class AnalyticsClient {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private metricsQueue: PerformanceMetric[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  track(event: Omit<AnalyticsEvent, 'timestamp' | 'platform'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
      platform: this.config.platform,
    };

    this.eventQueue.push(fullEvent);

    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      this.flush();
    }
  }

  trackPerformance(metric: Omit<PerformanceMetric, 'timestamp' | 'platform'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
      platform: this.config.platform,
    };

    this.metricsQueue.push(fullMetric);
  }

  async flush(): Promise<void> {
    // TODO: Implement actual data sending to Epic 13 ClickHouse
    if (this.eventQueue.length > 0) {
      console.log(`Flushing ${this.eventQueue.length} events`, this.eventQueue);
      this.eventQueue = [];
    }

    if (this.metricsQueue.length > 0) {
      console.log(`Flushing ${this.metricsQueue.length} metrics`, this.metricsQueue);
      this.metricsQueue = [];
    }
  }
}
