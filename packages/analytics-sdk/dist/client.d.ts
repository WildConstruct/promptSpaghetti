/**
 * Cross-platform analytics client
 */
import { AnalyticsConfig, AnalyticsEvent, PerformanceMetric } from './types';
export declare class AnalyticsClient {
    private config;
    private eventQueue;
    private metricsQueue;
    constructor(config: AnalyticsConfig);
    track(event: Omit<AnalyticsEvent, 'timestamp' | 'platform'>): void;
    trackPerformance(metric: Omit<PerformanceMetric, 'timestamp' | 'platform'>): void;
    flush(): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map