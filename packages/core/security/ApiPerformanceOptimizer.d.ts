/**
 * Epic 31.4.1 - API Performance Optimization Automation
 *
 * Automated API performance optimization system for security intelligence APIs.
 * Provides intelligent caching, query optimization, rate limiting, and performance
 * monitoring with automated tuning capabilities.
 *
 * Task: E31-1753313263547-C81BD1
 */
import { EventEmitter } from 'events';
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
    cacheWarmupStrategies: CacheWarmupStrategy[];
    distributedCaching: boolean;
}
export declare enum CacheEvictionPolicy {
    LRU = "lru",
    LFU = "lfu",
    FIFO = "fifo",
    RANDOM = "random",
    TTL_BASED = "ttl_based",
    ADAPTIVE = "adaptive"
}
export interface CacheWarmupStrategy {
    strategyType: WarmupStrategyType;
    schedule: WarmupSchedule;
    priority: number;
    enabled: boolean;
    parameters: Record<string, unknown>;
}
export declare enum WarmupStrategyType {
    POPULAR_QUERIES = "popular_queries",
    SCHEDULED_PRELOAD = "scheduled_preload",
    PREDICTIVE_PRELOAD = "predictive_preload",
    USER_PATTERN_BASED = "user_pattern_based",
    TIME_BASED = "time_based"
}
export interface WarmupSchedule {
    cronExpression?: string;
    intervalMinutes?: number;
    triggerEvents?: string[];
    conditions?: string[];
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
    ADAPTIVE = "adaptive"
}
export interface QueryOptimizationConfig {
    enableQueryOptimization: boolean;
    enableQueryRewriting: boolean;
    enableIndexOptimization: boolean;
    enableQueryPlanCaching: boolean;
    optimizationStrategies: OptimizationStrategy[];
    queryAnalysisConfig: QueryAnalysisConfig;
}
export interface OptimizationStrategy {
    strategyId: string;
    strategyType: OptimizationStrategyType;
    enabled: boolean;
    priority: number;
    conditions: OptimizationCondition[];
    actions: OptimizationAction[];
}
export declare enum OptimizationStrategyType {
    QUERY_REWRITING = "query_rewriting",
    INDEX_SUGGESTION = "index_suggestion",
    RESULT_PAGINATION = "result_pagination",
    FIELD_PROJECTION = "field_projection",
    PREDICATE_PUSHDOWN = "predicate_pushdown",
    JOIN_OPTIMIZATION = "join_optimization",
    AGGREGATION_OPTIMIZATION = "aggregation_optimization"
}
export interface OptimizationCondition {
    conditionType: ConditionType;
    field: string;
    operator: string;
    value: unknown;
    weight: number;
}
export declare enum ConditionType {
    RESPONSE_TIME = "response_time",
    RESULT_SIZE = "result_size",
    QUERY_COMPLEXITY = "query_complexity",
    RESOURCE_USAGE = "resource_usage",
    FREQUENCY = "frequency",
    USER_TIER = "user_tier"
}
export interface OptimizationAction {
    actionType: OptimizationActionType;
    parameters: Record<string, unknown>;
    priority: number;
    enabled: boolean;
}
export declare enum OptimizationActionType {
    REWRITE_QUERY = "rewrite_query",
    ADD_CACHE_HINT = "add_cache_hint",
    LIMIT_RESULTS = "limit_results",
    PROJECT_FIELDS = "project_fields",
    SUGGEST_INDEX = "suggest_index",
    PARTITION_QUERY = "partition_query",
    DEFER_EXPENSIVE_OPERATIONS = "defer_expensive_operations"
}
export interface QueryAnalysisConfig {
    enableStaticAnalysis: boolean;
    enableRuntimeAnalysis: boolean;
    analyzeQueryPatterns: boolean;
    trackQueryPerformance: boolean;
    identifySlowQueries: boolean;
    generateOptimizationSuggestions: boolean;
}
export interface MonitoringConfig {
    enableRealTimeMonitoring: boolean;
    metricsCollectionInterval: number;
    performanceHistoryRetention: number;
    alertingThresholds: AlertingThresholds;
    customMetrics: CustomMetric[];
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
    dimensions: string[];
    enabled: boolean;
}
export declare enum MetricType {
    COUNTER = "counter",
    GAUGE = "gauge",
    HISTOGRAM = "histogram",
    SUMMARY = "summary",
    RATE = "rate"
}
export declare enum AggregationType {
    SUM = "sum",
    AVERAGE = "average",
    MIN = "min",
    MAX = "max",
    PERCENTILE = "percentile",
    COUNT = "count"
}
export interface AlertingConfig {
    enableAlerting: boolean;
    alertChannels: AlertChannel[];
    escalationRules: EscalationRule[];
    suppressionRules: SuppressionRule[];
}
export interface AlertChannel {
    channelId: string;
    channelType: AlertChannelType;
    configuration: Record<string, unknown>;
    enabled: boolean;
}
export declare enum AlertChannelType {
    EMAIL = "email",
    SLACK = "slack",
    WEBHOOK = "webhook",
    SMS = "sms",
    PAGER_DUTY = "pager_duty",
    TEAMS = "teams"
}
export interface EscalationRule {
    ruleId: string;
    severity: AlertSeverity;
    escalationDelay: number;
    escalationTargets: string[];
    maxEscalations: number;
    enabled: boolean;
}
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export interface SuppressionRule {
    ruleId: string;
    suppressionPattern: string;
    suppressionDuration: number;
    conditions: string[];
    enabled: boolean;
}
export interface ApiEndpoint {
    endpointId: string;
    path: string;
    method: string;
    description: string;
    category: EndpointCategory;
    securityLevel: SecurityLevel;
    expectedLatency: number;
    rateLimits: RateLimit;
    cachingRules: CachingRule[];
    optimizationHints: OptimizationHint[];
    metrics: EndpointMetrics;
}
export declare enum EndpointCategory {
    AUTHENTICATION = "authentication",
    THREAT_INTELLIGENCE = "threat_intelligence",
    SECURITY_EVENTS = "security_events",
    ANALYTICS = "analytics",
    REPORTING = "reporting",
    ADMINISTRATION = "administration",
    MONITORING = "monitoring"
}
export declare enum SecurityLevel {
    PUBLIC = "public",
    AUTHENTICATED = "authenticated",
    AUTHORIZED = "authorized",
    PRIVILEGED = "privileged",
    ADMIN_ONLY = "admin_only"
}
export interface CachingRule {
    ruleId: string;
    cachingStrategy: CachingStrategy;
    ttl: number;
    conditions: string[];
    priority: number;
    enabled: boolean;
}
export interface OptimizationHint {
    hintType: OptimizationHintType;
    hintValue: string;
    applicability: string[];
    priority: number;
}
export declare enum OptimizationHintType {
    INDEX_HINT = "index_hint",
    CACHE_HINT = "cache_hint",
    PARTITION_HINT = "partition_hint",
    PROJECTION_HINT = "projection_hint",
    JOIN_HINT = "join_hint"
}
export interface EndpointMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
    cacheHitRate: number;
    lastUpdated: Date;
    trends: MetricTrend[];
}
export interface MetricTrend {
    metricName: string;
    trend: TrendDirection;
    changePercent: number;
    confidence: number;
    timeframe: string;
}
export declare enum TrendDirection {
    INCREASING = "increasing",
    DECREASING = "decreasing",
    STABLE = "stable",
    VOLATILE = "volatile"
}
export interface PerformanceOptimization {
    optimizationId: string;
    timestamp: Date;
    endpointId: string;
    optimizationType: OptimizationType;
    description: string;
    beforeMetrics: PerformanceSnapshot;
    afterMetrics?: PerformanceSnapshot;
    estimatedImpact: OptimizationImpact;
    status: OptimizationStatus;
    appliedActions: OptimizationAction[];
}
export declare enum OptimizationType {
    CACHING_OPTIMIZATION = "caching_optimization",
    QUERY_OPTIMIZATION = "query_optimization",
    RATE_LIMITING_ADJUSTMENT = "rate_limiting_adjustment",
    RESOURCE_SCALING = "resource_scaling",
    INDEX_OPTIMIZATION = "index_optimization",
    CONNECTION_POOLING = "connection_pooling"
}
export interface PerformanceSnapshot {
    timestamp: Date;
    responseTime: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: ResourceUtilization;
    cacheMetrics: CacheMetrics;
}
export interface ResourceUtilization {
    cpuPercent: number;
    memoryPercent: number;
    networkUtilization: number;
    diskUtilization: number;
    connectionCount: number;
}
export interface CacheMetrics {
    hitRate: number;
    missRate: number;
    evictionRate: number;
    cacheSize: number;
    averageKeySize: number;
}
export interface OptimizationImpact {
    expectedResponseTimeImprovement: number;
    expectedThroughputImprovement: number;
    expectedErrorRateReduction: number;
    expectedCostReduction: number;
    confidence: number;
}
export declare enum OptimizationStatus {
    PROPOSED = "proposed",
    APPROVED = "approved",
    APPLIED = "applied",
    VALIDATED = "validated",
    ROLLED_BACK = "rolled_back",
    FAILED = "failed"
}
export interface PerformanceReport {
    reportId: string;
    generatedAt: Date;
    reportPeriod: {,
        start: Date;
        end: Date;
    };
    summary: PerformanceSummary;
    endpointAnalysis: EndpointAnalysis[];
    optimizationRecommendations: OptimizationRecommendation[];
    trends: PerformanceTrend[];
    incidents: PerformanceIncident[];
}
export interface PerformanceSummary {
    totalRequests: number;
    averageResponseTime: number;
    overallThroughput: number;
    errorRate: number;
    availability: number;
    topPerformingEndpoints: string[];
    underperformingEndpoints: string[];
    optimizationsApplied: number;
    performanceImprovement: number;
}
export interface EndpointAnalysis {
    endpointId: string;
    requestVolume: number;
    performanceGrade: PerformanceGrade;
    keyIssues: string[];
    recommendations: string[];
    optimizationPotential: number;
}
export declare enum PerformanceGrade {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    CRITICAL = "critical"
}
export interface OptimizationRecommendation {
    recommendationId: string;
    priority: number;
    title: string;
    description: string;
    expectedBenefit: string;
    implementationEffort: ImplementationEffort;
    riskLevel: RiskLevel;
    actionItems: string[];
}
export declare enum ImplementationEffort {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface PerformanceTrend {
    metricName: string;
    trend: TrendDirection;
    changeRate: number;
    significance: TrendSignificance;
    forecastedValue: number;
    confidence: number;
}
export declare enum TrendSignificance {
    INSIGNIFICANT = "insignificant",
    MINOR = "minor",
    MODERATE = "moderate",
    SIGNIFICANT = "significant",
    CRITICAL = "critical"
}
export interface PerformanceIncident {
    incidentId: string;
    timestamp: Date;
    severity: AlertSeverity;
    description: string;
    affectedEndpoints: string[];
    rootCause: string;
    resolution: string;
    duration: number;
    impact: IncidentImpact;
}
export interface IncidentImpact {
    requestsAffected: number;
    usersAffected: number;
    revenueImpact: number;
    reputationImpact: string;
}
export declare class ApiPerformanceOptimizer extends EventEmitter {
    private config;
    private endpoints;
    private optimizations;
    private performanceHistory;
    private cache;
    private rateLimiters;
    private queryOptimizer;
    private isOptimizing;
    constructor(config: ApiPerformanceConfig);
    registerEndpoint(endpoint: ApiEndpoint): void;
    optimizeEndpoint(endpointId: string): Promise<PerformanceOptimization[]>;
    applyOptimization(optimizationId: string): Promise<boolean>;
    analyzeApiPerformance(): Promise<PerformanceReport>;
    getCachedResponse(key: string): any | null;
    setCachedResponse(key: string, data: any, ttl?: number): void;
    checkRateLimit(clientId: string, endpointId: string): RateLimitResult;
    getEndpointMetrics(endpointId: string): EndpointMetrics | null;
    getPerformanceHistory(hours?: number): PerformanceSnapshot[];
    private initializeOptimizer;
    private startOptimizationLoop;
    private runAutomaticOptimization;
    private initializeEndpointOptimization;
    private collectEndpointMetrics;
    private identifyPerformanceIssues;
    private generateOptimization;
    private determineOptimizationActions;
    private applyOptimizationAction;
    private needsOptimization;
    private isLowRiskOptimization;
    private calculateImprovement;
    private generatePerformanceSummary;
    private analyzeAllEndpoints;
    private generateOptimizationRecommendations;
    private analyzePerformanceTrends;
    private identifyPerformanceIncidents;
    private getRateLimiter;
    private enforceCacheSize;
    private selectEvictionVictim;
    private selectLRUVictim;
    private selectLFUVictim;
    private selectTTLVictim;
    private selectRandomVictim;
    private cleanupExpiredCache;
    private cleanupPerformanceHistory;
    private collectSystemMetrics;
    private calculateAverageResponseTime;
    private calculateOverallThroughput;
    private calculateOverallErrorRate;
    private getCurrentResourceUtilization;
    private getCacheMetrics;
    private calculateAverageCacheKeySize;
    private calculateIssueSeverity;
    private getOptimizationType;
    private estimateOptimizationImpact;
    private applyCachingRule;
    private applyOptimizationHint;
    private getTopPerformingEndpoints;
    private getUnderperformingEndpoints;
    private calculateOverallPerformanceImprovement;
    private calculatePerformanceGrade;
    private generateEndpointRecommendations;
    private calculateOptimizationPotential;
    private sleep;
}
interface RateLimitResult {
    allowed: boolean;
    remainingRequests: number;
    resetTime: Date;
    retryAfter?: number;
}
export declare class ApiPerformanceOptimizerFactory {
    static createDefaultConfig(): ApiPerformanceConfig;
    static createHighPerformanceConfig(): ApiPerformanceConfig;
    static createLowLatencyConfig(): ApiPerformanceConfig;
    static createOptimizer(config?: Partial<ApiPerformanceConfig>): ApiPerformanceOptimizer;
}
export default ApiPerformanceOptimizer;
//# sourceMappingURL=ApiPerformanceOptimizer.d.ts.map