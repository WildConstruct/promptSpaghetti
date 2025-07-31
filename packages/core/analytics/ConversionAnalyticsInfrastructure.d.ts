/**
 * Conversion Analytics Infrastructure - Story 30.2 Task 4
 *
 * Comprehensive data processing pipeline for conversion funnel analytics
 * built upon Epic 1's analytics infrastructure with advanced aggregation,
 * real-time processing, and data warehouse integration.
 *
 * Features:
 * - Multi-stage data processing pipeline with Epic 1 integration
 * - Real-time metric calculation and aggregation
 * - Data warehouse integration with temporal partitioning
 * - Advanced analytics API with query optimization
 * - Batch and streaming processing capabilities
 */
import { FlexibleConversionEvent } from './ConversionDataModel';
}
interface AnalyticsEvent {
    id: string;
    timestamp: number;
    type: string;
    userId: string;
    sessionId: string;
    properties: Record<string, any>;
}
interface MetricQuery {
    metric: string;
    filters?: Record<string, any>;
    timeRange?: {
        start: number;
        end: number;
}
    };
    groupBy?: string[];
}
interface MetricResult {
    metric: string;
    value: number;
    timestamp: number;
    dimensions?: Record<string, any>;
}
interface AnalyticsInfrastructure {
    processEvent(event: AnalyticsEvent): Promise<void>;
    getMetrics(query: MetricQuery): Promise<MetricResult[]>;
    createDataWarehouseQuery(query: string): Promise<any[]>;

}
export interface ConversionMetricQuery {
    funnelId?: string;
    segmentId?: string;
    cohortId?: string;
    startDate: number;
    endDate: number;
    metrics: ConversionMetricType[];
    groupBy?: ConversionGroupBy[];
    filters?: ConversionFilter[];
    aggregation: {
        interval: 'hour' | 'day' | 'week' | 'month';
        timeZone?: string;
        fillGaps?: boolean;
}
    };
    useCache?: boolean;
    maxResults?: number;
    timeout?: number;

export type ConversionMetricType = 'conversion_rate' | 'drop_off_rate' | 'average_time_to_convert' | 'user_count' | 'session_count' | 'revenue' | 'average_order_value' | 'retention_rate' | 'churn_rate' | 'funnel_completion_rate' | 'step_conversion_rate' | 'attribution_value' | 'cohort_performance' | 'segment_growth' | 'custom';
export type ConversionGroupBy = 'funnel_step' | 'user_segment' | 'cohort' | 'channel' | 'device_type' | 'location' | 'template_category' | 'time_period' | 'attribution_model';

}
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
}
    };
    dimensions: Record<string, any>;
    breakdowns?: MetricBreakdown[];

}
export interface ComparisonData {
    previousPeriod: {
        value: number;
        changePercent: number;
        significance: number;
}
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
    errors?: ProcessingError[];

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
}
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
        customIndices: string[];
    };

}
export interface AnalyticsAPIConfig {
    caching: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
        strategy: 'lru' | 'lfu' | 'ttl'
}
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
        precomputeMetrics: string[];
    };
/**
 * Main Conversion Analytics Infrastructure
 * Coordinates all processing stages and provides unified API
 */
export declare class ConversionAnalyticsInfrastructure {
    private epic1Analytics;
    private config;
    private processingPipeline;
    private metricsCalculator;
    private dataWarehouse;
    private analyticsAPI;
    constructor(epic1Analytics: AnalyticsInfrastructure, config: {)
        dataWarehouse: DataWarehouseConfig;
        api: AnalyticsAPIConfig;
        processing: ProcessingConfig;
    });
    /**
     * Process conversion event through complete pipeline
     */
    processConversionEvent(event: FlexibleConversionEvent): Promise<ProcessingStageResult[]>;
    /**
     * Process batch of conversion events
     */
    processBatch(events: FlexibleConversionEvent[], options?: BatchProcessingOptions): Promise<BatchProcessingResult>;
    /**
     * Query conversion metrics with advanced filtering and aggregation
     */
    queryMetrics(query: ConversionMetricQuery): Promise<ConversionMetricResult[]>;
    /**
     * Get real-time conversion metrics
     */
    getRealTimeMetrics(funnelId: string, timeWindow?: number): Promise<RealTimeMetrics>;
    /**
     * Export analytics data for external systems
     */
    exportData(request: DataExportRequest): Promise<DataExportResult>;
    /**
     * Get infrastructure health status
     */
    getHealthStatus(): Promise<InfrastructureHealthStatus>;
/**
 * Multi-stage processing pipeline for conversion events
 */
export declare class ConversionProcessingPipeline {
    private epic1Analytics;
    private config;
    private stages;
    constructor(epic1Analytics: AnalyticsInfrastructure, config: ProcessingConfig);
    private initializeStages;
    processEvent(event: FlexibleConversionEvent): Promise<ProcessingStageResult[]>;
    processBatch(events: FlexibleConversionEvent[], options: BatchProcessingOptions): Promise<BatchProcessingResult>;
    private chunkArray;
    getHealthStatus(): Promise<ComponentHealthStatus>;
/**
 * Advanced metrics calculator with real-time and historical analysis
 */
export declare class ConversionMetricsCalculator {
    private config;
    private metricCache;
    constructor(config: MetricCalculationConfig);
    calculateMetrics();
      query: ConversionMetricQuery,
      events: FlexibleConversionEvent[],
    ): Promise<ConversionMetricResult[]>;
    private calculateSingleMetric;
    private getMetricCalculator;
    private applyFilters;
    private getFieldValue;
    private evaluateFilter;
    private calculateMetadata;
    private calculateConfidence;
    private calculateVariability;
    private calculateTrend;
    private calculateComparison;
    private calculateBreakdowns;
    private groupEventsByDimension;
    private extractDimensionValue;
    private extractDimensions;
    getHealthStatus(): Promise<ComponentHealthStatus>;

}
export interface ProcessingConfig {
    validation: ValidationConfig;
    enrichment: EnrichmentConfig;
    transformation: TransformationConfig;
    aggregation: AggregationConfig;
    storage: StorageConfig;
    calculations: any;
    batchSize: number;
    continueOnError: boolean;
    forwardToEpic1: boolean;

}
export interface ValidationConfig {
    strict: boolean;
    requiredFields: string[];
    customRules: string[];

}
export interface EnrichmentConfig {
    enableUserEnrichment: boolean;
    enableTemplateEnrichment: boolean;
    enableLocationEnrichment: boolean;

}
export interface TransformationConfig {
    normalizeTimestamps: boolean;
    calculateDerivedFields: boolean;
    applyPrivacyFilters: boolean;

}
export interface AggregationConfig {
    enableRealTimeAggregation: boolean;
    aggregationWindows: string[];
    customAggregations: string[];

}
export interface StorageConfig {
    primaryStorage: string;
    archiveStorage: string;
    retentionPeriod: number;

}
export interface MetricCalculationConfig {
    enableCaching: boolean;
    cacheTimeout: number;
    parallelCalculations: boolean;
    customMetrics: Record<string, string>;

}
export interface BatchProcessingOptions {
    batchSize?: number;
    parallel?: boolean;
    continueOnError?: boolean;

}
export interface BatchProcessingResult {
    totalEvents: number;
    processedCount: number;
    errorCount: number;
    duration: number;
    stageResults: ProcessingStageResult[];

}
export interface RealTimeMetrics {
    funnelId: string;
    timestamp: number;
    metrics: {
        activeUsers: number;
        conversionsLastHour: number;
        conversionRate: number;
        averageTimeToConvert: number;
        topDropOffStep: string;
}
    };

}
export interface DataExportRequest {
    format: 'csv' | 'json' | 'parquet';
    query: ConversionMetricQuery;
    compression?: 'gzip' | 'zip';
    destination?: 'download' | 's3' | 'api';

}
export interface DataExportResult {
    exportId: string;
    status: 'pending' | 'completed' | 'failed';
    downloadUrl?: string;
    fileSize?: number;
    recordCount?: number;

}
export interface InfrastructureHealthStatus {
    processing: ComponentHealthStatus;
    metrics: ComponentHealthStatus;
    dataWarehouse: ComponentHealthStatus;
    api: ComponentHealthStatus;

}
export interface ComponentHealthStatus {
    healthy: boolean;
    uptime: number;
    metrics: {
        totalProcessed?: number;
        totalCalculations?: number;
        errorRate: number;
        averageLatency: number;
}
    };
    details?: any;

}
export interface CachedMetric {
    value: ConversionMetricResult;
    timestamp: number;
    ttl: number;

}
export interface ProcessingStage {
    getName(): string;
    process(event: FlexibleConversionEvent): Promise<StageProcessingResult>;
    getHealthStatus(): Promise<ComponentHealthStatus>;

}
export interface StageProcessingResult {
    success: boolean;
    transformedEvent?: FlexibleConversionEvent;
    errors?: ProcessingError[];

}
export interface MetricCalculator {
    calculate(events: FlexibleConversionEvent[], query: ConversionMetricQuery): Promise<number>;

export declare export default ConversionAnalyticsInfrastructure;
//# sourceMappingURL=ConversionAnalyticsInfrastructure.d.ts.map
}