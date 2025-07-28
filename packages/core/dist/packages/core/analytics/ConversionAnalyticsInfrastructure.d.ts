export interface ConversionMetricQuery {
    funnelId?: string;
    segmentId?: string;
    cohortId?: string;
    startDate: number;
    endDate: number;
    metrics: ConversionMetricType;
    groupBy?: ConversionGroupBy;
    filters?: ConversionFilter;
    aggregation: {
        interval: 'hour' | 'day' | 'week' | 'month';
        timeZone?: string;
        fillGaps?: boolean;
    };
    useCache?: boolean;
    maxResults?: number;
    timeout?: number;
}
export type ConversionMetricType = 'conversion_rate' | 'drop_off_rate' | 'average_time_to_convert' | 'user_count' | 'session_count' | 'revenue' | 'average_order_value' | 'retention_rate' | 'churn_rate' | 'funnel_completion_rate' | 'step_conversion_rate' | 'attribution_value' | 'cohort_performance' | 'segment_growth' | 'custom';
export type ConversionGroupBy = 'funnel_step' | 'user_segment' | 'cohort' | 'channel' | 'device_type' | 'location' | 'template_category' | 'time_period' | 'attribution_model';
export interface ConversionFilter {
    field: string;
    operator: 'equals' | 'in' | 'between' | 'greater_than' | 'less_than' | 'contains';
    value: any;
    negate?: boolean;
}
export interface ConversionMetricResult {
    metricType: ConversionMetricType;
    value: number;
    timestamp: number;
    metadata: {
        sampleSize: number;
        confidence: number;
        variability: number;
        trend: 'up' | 'down' | 'stable';
        comparison?: ComparisonData;
    };
    dimensions: Record<string, any>;
    breakdowns?: MetricBreakdown;
}
export interface ComparisonData {
    previousPeriod: {
        value: number;
        changePercent: number;
        significance: number;
    };
    benchmark?: {
        value: number;
        source: string;
        lastUpdated: number;
    };
}
export interface MetricBreakdown {
    dimension: string;
    value: any;
    metricValue: number;
    percentage: number;
}
export interface ProcessingStageResult {
    stage: string;
    success: boolean;
    processedCount: number;
    errorCount: number;
    duration: number;
    errors?: ProcessingError;
}
export interface ProcessingError {
    eventId: string;
    stage: string;
    error: string;
    severity: 'warning' | 'error' | 'critical';
    context?: Record<string, any>;
}
export interface DataWarehouseConfig {
    connectionString: string;
    schemaName: string;
    tablePrefix: string;
    partitioning: {
        strategy: 'time' | 'hash' | 'range';
        field: string;
        interval?: string;
    };
    retention: {
        rawEvents: number;
        aggregatedMetrics: number;
        archivedData: number;
    };
    indexing: {
        timeIndex: boolean;
        userIndex: boolean;
        funnelIndex: boolean;
        customIndices: string;
    };
}
export interface AnalyticsAPIConfig {
    caching: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
        strategy: 'lru' | 'lfu' | 'ttl';
    };
    rateLimiting: {
        enabled: boolean;
        requestsPerMinute: number;
        burstLimit: number;
    };
    optimization: {
        queryTimeout: number;
        maxConcurrentQueries: number;
        enableQueryPlanning: boolean;
        precomputeMetrics: string;
    };
}
export declare class ConversionAnalyticsInfrastructure {
    private processingPipeline;
    private metricsCalculator;
    private dataWarehouse;
    private analyticsAPI;
    constructor();
    private epic1Analytics;
    private config;
}
//# sourceMappingURL=ConversionAnalyticsInfrastructure.d.ts.map