export interface ApiPerformanceConfig {
    enableAutomaticOptimization: boolean;
    optimizationInterval: number;
    performanceThresholds: PerformanceThresholds;
    cachingStrategy: CachingStrategy;
    rateLimitingConfig: RateLimitingConfig;
    queryOptimizationConfig: QueryOptimizationConfig;
    monitoringConfig: MonitoringConfig;
    alertingConfig: AlertingConfig;
}
export interface PerformanceThresholds {
    responseTimeMs: number;
    throughputRps: number;
    errorRatePercent: number;
    cpuUtilizationPercent: number;
    memoryUtilizationPercent: number;
    cacheHitRatePercent: number;
    queueDepth: number;
}
export interface CachingStrategy {
    enableQueryCaching: boolean;
    enableResultCaching: boolean;
    enableMetadataCaching: boolean;
    defaultTtlSeconds: number;
    maxCacheSize: number;
    cacheEvictionPolicy: CacheEvictionPolicy;
    cacheWarmupStrategies: CacheWarmupStrategy;
    distributedCaching: boolean;
}
export declare enum CacheEvictionPolicy {
    LRU = "lru",
    LFU = "lfu",
    FIFO = "fifo",
    RANDOM = "random",
    TTL_BASED = "ttl_based",
    ADAPTIVE = "adaptive",
    export,
    interface,
    CacheWarmupStrategy
}
export declare enum WarmupStrategyType {
    POPULAR_QUERIES = "popular_queries",
    SCHEDULED_PRELOAD = "scheduled_preload",
    PREDICTIVE_PRELOAD = "predictive_preload",
    USER_PATTERN_BASED = "user_pattern_based",
    TIME_BASED = "time_based",
    export,
    interface,
    WarmupSchedule
}
export interface RateLimitingConfig {
    enableRateLimiting: boolean;
    enableAdaptiveRateLimiting: boolean;
    defaultRateLimit: RateLimit;
    userTierLimits: Map<string, RateLimit>;
    endpointSpecificLimits: Map<string, RateLimit>;
    burstAllowance: number;
    rateLimitingAlgorithm: RateLimitingAlgorithm;
}
export interface RateLimit {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    concurrentConnections: number;
    bandwidthLimitMbps?: number;
}
export declare enum RateLimitingAlgorithm {
    TOKEN_BUCKET = "token_bucket",
    LEAKY_BUCKET = "leaky_bucket",
    FIXED_WINDOW = "fixed_window",
    SLIDING_WINDOW = "sliding_window",
    ADAPTIVE = "adaptive",
    export,
    interface,
    QueryOptimizationConfig
}
export interface OptimizationStrategy {
    strategyId: string;
    strategyType: OptimizationStrategyType;
    enabled: boolean;
    priority: number;
    conditions: OptimizationCondition;
    actions: OptimizationAction;
}
export declare enum OptimizationStrategyType {
    QUERY_REWRITING = "query_rewriting",
    INDEX_SUGGESTION = "index_suggestion",
    RESULT_PAGINATION = "result_pagination",
    FIELD_PROJECTION = "field_projection",
    PREDICATE_PUSHDOWN = "predicate_pushdown",
    JOIN_OPTIMIZATION = "join_optimization",
    AGGREGATION_OPTIMIZATION = "aggregation_optimization",
    export,
    interface,
    OptimizationCondition
}
export declare enum ConditionType {
    RESPONSE_TIME = "response_time",
    RESULT_SIZE = "result_size",
    QUERY_COMPLEXITY = "query_complexity",
    RESOURCE_USAGE = "resource_usage",
    FREQUENCY = "frequency",
    USER_TIER = "user_tier",
    export,
    interface,
    OptimizationAction
}
export declare enum OptimizationActionType {
    REWRITE_QUERY = "rewrite_query",
    ADD_CACHE_HINT = "add_cache_hint",
    LIMIT_RESULTS = "limit_results",
    PROJECT_FIELDS = "project_fields",
    SUGGEST_INDEX = "suggest_index",
    PARTITION_QUERY = "partition_query",
    DEFER_EXPENSIVE_OPERATIONS = "defer_expensive_operations",
    export,
    interface,
    QueryAnalysisConfig
}
export interface MonitoringConfig {
    enableRealTimeMonitoring: boolean;
    metricsCollectionInterval: number;
    performanceHistoryRetention: number;
    alertingThresholds: AlertingThresholds;
    customMetrics: CustomMetric;
}
export interface AlertingThresholds {
    responseTimeDegradation: number;
    errorRateIncrease: number;
    throughputDecrease: number;
    resourceUtilizationHigh: number;
    cacheHitRateDecrease: number;
}
export interface CustomMetric {
    metricName: string;
    metricType: MetricType;
    calculation: string;
    aggregation: AggregationType;
    dimensions: string;
    enabled: boolean;
}
export declare enum MetricType {
    COUNTER = "counter",
    GAUGE = "gauge",
    HISTOGRAM = "histogram",
    SUMMARY = "summary",
    RATE = "rate",
    export,
    enum,
    AggregationType
}
//# sourceMappingURL=ApiPerformanceOptimizer.d.ts.map