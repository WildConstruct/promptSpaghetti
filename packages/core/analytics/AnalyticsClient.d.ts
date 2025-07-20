import { EventEmitter } from 'events';
/**
 * Analytics API response wrapper
 */
export interface AnalyticsResponse<T = any> {
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
/**
 * Time range parameters
 */
export interface TimeRange {
    startTime: number;
    endTime: number;
    granularity?: 'hour' | 'day';
}
/**
 * Budget configuration
 */
export interface BudgetConfig {
    name: string;
    description?: string;
    amount: number;
    currency?: string;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    alertThresholds?: number[];
    userId?: number;
    organizationId?: number;
}
/**
 * Report configuration
 */
export interface ReportConfig {
    startTime: number;
    endTime: number;
    format?: 'json' | 'csv' | 'html' | 'pdf';
    includeHeatMap?: boolean;
    includeCostAnalysis?: boolean;
    includePatterns?: boolean;
}
/**
 * Analytics client configuration
 */
export interface AnalyticsClientConfig {
    baseUrl: string;
    apiKey?: string;
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
    enableCaching?: boolean;
    cacheTimeout?: number;
}
/**
 * Analytics API client
 */
export declare class AnalyticsClient extends EventEmitter {
    private config;
    private cache;
    private requestQueue;
    constructor(config: AnalyticsClientConfig);
    /**
     * Get analytics summary
     */
    getSummary(query?: AnalyticsQuery): Promise<AnalyticsResponse>;
    /**
     * Get time series data
     */
    getTimeSeries(metric: 'executions' | 'tokens' | 'cost' | 'errors', timeRange: TimeRange): Promise<AnalyticsResponse>;
    /**
     * Get heat map data
     */
    getHeatMap(timeRange: TimeRange): Promise<AnalyticsResponse>;
    /**
     * Get usage patterns
     */
    getUsagePatterns(type: 'hourly' | 'daily' | 'weekly'): Promise<AnalyticsResponse>;
    /**
     * Get dashboard data
     */
    getDashboardData(): Promise<AnalyticsResponse>;
    /**
     * Get dashboard HTML
     */
    getDashboardHTML(): Promise<string>;
    /**
     * Get cost summary
     */
    getCostSummary(timeRange: TimeRange, userId?: number, organizationId?: number): Promise<AnalyticsResponse>;
    /**
     * Get cost forecast
     */
    getCostForecast(days: number, userId?: number, organizationId?: number): Promise<AnalyticsResponse>;
    /**
     * Create budget
     */
    createBudget(config: BudgetConfig): Promise<AnalyticsResponse>;
    /**
     * Get budgets
     */
    getBudgets(userId?: number, organizationId?: number): Promise<AnalyticsResponse>;
    /**
     * Update budget
     */
    updateBudget(budgetId: string, updates: Partial<BudgetConfig>): Promise<AnalyticsResponse>;
    /**
     * Get budget usage
     */
    getBudgetUsage(budgetId: string): Promise<AnalyticsResponse>;
    /**
     * Get active alerts
     */
    getAlerts(): Promise<AnalyticsResponse>;
    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string): Promise<AnalyticsResponse>;
    /**
     * Get efficiency recommendations
     */
    getRecommendations(userId?: number, organizationId?: number): Promise<AnalyticsResponse>;
    /**
     * Generate analytics report
     */
    generateReport(config: ReportConfig): Promise<string>;
    /**
     * Export analytics data
     */
    exportData(timeRange: TimeRange, format?: 'json' | 'csv'): Promise<string>;
    /**
     * Subscribe to real-time analytics updates
     */
    subscribeToUpdates(callback: (data: any) => void): () => void;
    /**
     * Clear analytics cache
     */
    clearCache(): void;
    /**
     * Make HTTP request with caching and retry logic
     */
    private makeRequest;
    /**
     * Execute HTTP request with retry logic
     */
    private executeRequest;
    /**
     * Setup periodic cache cleanup
     */
    private setupCacheCleanup;
}
/**
 * Default analytics client instance
 */
export declare const createAnalyticsClient: (config: AnalyticsClientConfig) => AnalyticsClient;
//# sourceMappingURL=AnalyticsClient.d.ts.map