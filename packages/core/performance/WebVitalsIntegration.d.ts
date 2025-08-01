/**
 * Enhanced Web Vitals Integration for Epic 18
 * Standardized Web Vitals measurement using official web-vitals package
 */
import { Metric } from 'web-vitals';
import { EventEmitter } from 'events';

}
}
export interface WebVitalsConfig { enabled: boolean;
    reportAllChanges: boolean;
    samplingRate: number;
    thresholds: {
        fcp: {
            good: number;
            poor: number }
}
        };
        lcp: { good: number;
            poor: number };
        fid: { good: number;
            poor: number };
        cls: { good: number;
            poor: number };
        tti: { good: number;
            poor: number };
    };
    enableConsoleLogging: boolean;
    enableAnalytics: boolean;
    analyticsEndpoint?: string;

}
}
export interface EnhancedMetric extends Metric { rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
    url: string;
    userAgent: string;
    connectionType?: string;
    deviceMemory?: number;
    effectiveType?: string }
}
export interface WebVitalsAnalytics { sessionId: string;
    timestamp: number;
    metrics: EnhancedMetric[];
    summary: {
        fcp: {
            value: number;
            rating: string }
}
        };
        lcp: { value: number;
            rating: string };
        fid: { value: number;
            rating: string };
        cls: { value: number;
            rating: string };
        tti: { value: number;
            rating: string };
    };
    deviceInfo: { userAgent: string;
        viewport: {
            width: number;
            height: number };
        devicePixelRatio: number;
        connectionType?: string;
        deviceMemory?: number;
        hardwareConcurrency: number;
    };
    pageInfo: { url: string;
        referrer: string;
        title: string;
        loadTime: number };
/**
 * Enhanced Web Vitals Integration Manager
 * Provides standardized Web Vitals measurement with analytics and reporting
 */
export declare class WebVitalsIntegration extends EventEmitter { private config;
    private metrics;
    private sessionId;
    private startTime;
    private isInitialized;
    constructor(config?: Partial<WebVitalsConfig>);
    /**
     * Initialize Web Vitals tracking
     */
    initialize(): void;
    /**
     * Get current Web Vitals snapshot
     */
    getCurrentVitals(): Promise<WebVitalsAnalytics>;
    /**
     * Get metric by name
     */
    getMetric(name: string): EnhancedMetric | undefined;
    /**
     * Get all metrics
     */
    getAllMetrics(): EnhancedMetric[];
    /**
     * Clear collected metrics
     */
    clearMetrics(): void;
    /**
     * Send analytics data to endpoint
     */
    sendAnalytics(data?: WebVitalsAnalytics): Promise<boolean>;
    private handleMetric;
    private enhanceMetric;
    private calculateRating;
    private getConnectionInfo;
    private generateSessionId;
    private generateAnalytics;
    private createEmptyAnalytics;
    private getMetricSummary;
    private getDeviceInfo;
    private getPageInfo;
    private handleVisibilityChange;
    private handleBeforeUnload;
    private sendFinalReport;
    /**
     * Create a performance observer for custom metrics
     */
    createPerformanceObserver();
      entryTypes: string[]
      callback: (entries: PerformanceEntry[]) }
    ) => void): PerformanceObserver | null;
    /**
     * Get Web Vitals configuration
     */
    getConfig(): WebVitalsConfig;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<WebVitalsConfig>): void;

export declare const webVitals: WebVitalsIntegration;
export default WebVitalsIntegration;
//# sourceMappingURL=WebVitalsIntegration.d.ts.map