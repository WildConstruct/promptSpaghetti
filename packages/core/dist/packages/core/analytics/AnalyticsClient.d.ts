import { EventEmitter } from 'events';
/**
 * Analytics API response wrapper
 */
export interface AnalyticsResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    details?: string;
    meta?: {
        period?: {
            startTime: number;
            endTime: number;
        };
        generatedAt?: number;
        totalDataPoints?: number;
        [key: string]: any;
    };
}
/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
    startTime?: number;
    endTime?: number;
    userId?: number;
    organizationId?: number;
    limit?: number;
    offset?: number;
}
export interface TimeRange {
    startTime: number;
    endTime: number;
    granularity?: 'hour' | 'day';
}
export interface BudgetConfig {
    name: string;
    description?: string;
    amount: number;
    currency?: string;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    alertThresholds?: number;
    userId?: number;
    organizationId?: number;
}
export interface ReportConfig {
    startTime: number;
    endTime: number;
    format?: 'json' | 'csv' | 'html' | 'pdf';
    includeHeatMap?: boolean;
    includeCostAnalysis?: boolean;
    includePatterns?: boolean;
}
export interface AnalyticsClientConfig {
    baseUrl: string;
    apiKey?: string;
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
    enableCaching?: boolean;
    cacheTimeout?: number;
}
export declare class AnalyticsClient extends EventEmitter {
    private config;
    private cache;
    private requestQueue;
    constructor(config: AnalyticsClientConfig);
    /**
     * Get heat map data
     */
    getHeatMap(timeRange: TimeRange): Promise<AnalyticsResponse>;
}
//# sourceMappingURL=AnalyticsClient.d.ts.map