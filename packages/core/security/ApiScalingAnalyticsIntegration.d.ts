/**
 * Epic 31.4.1 - API Scaling and Load Balancing Analytics Integration
 *
 * Advanced analytics integration for API scaling decisions and load balancing
 * optimization. Provides intelligent scaling recommendations, load distribution
 * analysis, and performance-driven infrastructure optimization.
 *
 * Task: E31-1753313263538-31154A
 */
import { EventEmitter } from 'events';

export interface ScalingAnalyticsConfig {
    enableRealTimeAnalytics: boolean;
    analysisInterval: number;
    scalingThresholds: ScalingThresholds;
    loadBalancingConfig: LoadBalancingConfig;
    predictiveScalingConfig: PredictiveScalingConfig;
    performanceTargets: PerformanceTargets;
    costOptimizationConfig: CostOptimizationConfig;
    alertingConfig: ScalingAlertingConfig;

export interface ScalingThresholds {
    cpuUtilizationPercent: {,
        scaleUp: number;
        scaleDown: number;
    };
    memoryUtilizationPercent: {,
        scaleUp: number;
        scaleDown: number;
    };
    responseTimeMs: {,
        scaleUp: number;
        scaleDown: number;
    };
    throughputRps: {,
        scaleUp: number;
        scaleDown: number;
    };
    errorRatePercent: {,
        scaleUp: number;
        scaleDown: number;
    };
    queueDepth: {,
        scaleUp: number;
        scaleDown: number;
    };
    connectionCount: {,
        scaleUp: number;
        scaleDown: number;
    };

export interface LoadBalancingConfig {
    enableIntelligentRouting: boolean;
    routingAlgorithm: LoadBalancingAlgorithm;
    healthCheckConfig: HealthCheckConfig;
    stickySessionConfig: StickySessionConfig;
    circuitBreakerConfig: CircuitBreakerConfig;
    trafficShaping: TrafficShapingConfig;

export declare enum LoadBalancingAlgorithm {
    ROUND_ROBIN = "round_robin",
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin",
    LEAST_CONNECTIONS = "least_connections",
    WEIGHTED_LEAST_CONNECTIONS = "weighted_least_connections",
    RESOURCE_BASED = "resource_based",
    RESPONSE_TIME_BASED = "response_time_based",
    GEOGRAPHIC = "geographic",
    ADAPTIVE = "adaptive",
    ML_OPTIMIZED = "ml_optimized"

export interface HealthCheckConfig {
    enableHealthChecks: boolean;
    healthCheckInterval: number;
    healthCheckTimeout: number;
    healthCheckPath: string;
    unhealthyThreshold: number;
    healthyThreshold: number;
    customHealthChecks: CustomHealthCheck[];

export interface CustomHealthCheck {
    checkId: string;
    checkName: string;
    checkType: HealthCheckType;
    endpoint: string;
    expectedResponse: unknown;
    weight: number;
    enabled: boolean;

export declare enum HealthCheckType {
    HTTP_GET = "http_get",
    HTTP_POST = "http_post",
    TCP_CONNECT = "tcp_connect",
    DATABASE_QUERY = "database_query",
    CUSTOM_SCRIPT = "custom_script",
    DEPENDENCY_CHECK = "dependency_check"

export interface StickySessionConfig {
    enableStickySession: boolean;
    sessionAffinityType: SessionAffinityType;
    sessionTimeout: number;
    fallbackBehavior: FallbackBehavior;

export declare enum SessionAffinityType {
    COOKIE_BASED = "cookie_based",
    IP_HASH = "ip_hash",
    HEADER_BASED = "header_based",
    CUSTOM = "custom"

export declare enum FallbackBehavior {
    LEAST_LOADED = "least_loaded",
    RANDOM = "random",
    FAIL_REQUEST = "fail_request",
    REMOVE_AFFINITY = "remove_affinity"

export interface CircuitBreakerConfig {
    enableCircuitBreaker: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenMaxCalls: number;
    slowCallThreshold: number;
    slowCallDurationThreshold: number;

export interface TrafficShapingConfig {
    enableTrafficShaping: boolean;
    rateLimitingRules: TrafficRule[];
    priorityRouting: PriorityRoutingRule[];
    trafficMirroring: TrafficMirroringConfig[];

export interface TrafficRule {
    ruleId: string;
    ruleName: string;
    conditions: TrafficCondition[];
    actions: TrafficAction[];
    priority: number;
    enabled: boolean;

export interface TrafficCondition {
    conditionType: TrafficConditionType;
    field: string;
    operator: string;
    value: unknown;
    weight: number;

export declare enum TrafficConditionType {
    SOURCE_IP = "source_ip",
    USER_AGENT = "user_agent",
    REQUEST_PATH = "request_path",
    REQUEST_METHOD = "request_method",
    HEADER_VALUE = "header_value",
    QUERY_PARAMETER = "query_parameter",
    REQUEST_SIZE = "request_size",
    USER_TIER = "user_tier"

export interface TrafficAction {
    actionType: TrafficActionType;
    parameters: Record<string, any>;
    weight: number;

export declare enum TrafficActionType {
    ROUTE_TO_POOL = "route_to_pool",
    APPLY_RATE_LIMIT = "apply_rate_limit",
    ADD_HEADER = "add_header",
    BLOCK_REQUEST = "block_request",
    CACHE_RESPONSE = "cache_response",
    MIRROR_TRAFFIC = "mirror_traffic"

export interface PriorityRoutingRule {
    ruleId: string;
    priority: number;
    userTiers: string[];
    serverPools: string[];
    routingWeight: number;
    enabled: boolean;

export interface TrafficMirroringConfig {
    mirrorId: string;
    sourcePool: string;
    targetPool: string;
    mirrorPercentage: number;
    conditions: TrafficCondition[];
    enabled: boolean;

export interface PredictiveScalingConfig {
    enablePredictiveScaling: boolean;
    forecastingHorizon: number;
    scalingLookahead: number;
    confidenceThreshold: number;
    models: PredictiveScalingModel[];
    seasonalityConfig: SeasonalityConfig;

export interface PredictiveScalingModel {
    modelId: string;
    modelType: PredictiveModelType;
    trainingDataPeriod: number;
    retrainingInterval: number;
    accuracy: number;
    enabled: boolean;
    parameters: Record<string, any>;

export declare enum PredictiveModelType {
    LINEAR_REGRESSION = "linear_regression",
    ARIMA = "arima",
    LSTM = "lstm",
    PROPHET = "prophet",
    ENSEMBLE = "ensemble",
    CUSTOM = "custom"

export interface SeasonalityConfig {
    enableSeasonalityDetection: boolean;
    seasonalPatterns: SeasonalPattern[];
    timeZone: string;
    businessHours: BusinessHours;
    holidays: Holiday[];

export interface SeasonalPattern {
    patternId: string;
    patternType: SeasonalPatternType;
    multiplier: number;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    enabled: boolean;

export declare enum SeasonalPatternType {
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly",
    CUSTOM = "custom"

export interface BusinessHours {
    startHour: number;
    endHour: number;
    timeZone: string;
    weekdays: number[];

export interface Holiday {
    name: string;
    date: Date;
    impactMultiplier: number;
    region: string;

export interface PerformanceTargets {
    responseTimeP95Ms: number;
    responseTimeP99Ms: number;
    throughputRps: number;
    availabilityPercent: number;
    errorRatePercent: number;
    resourceUtilizationPercent: number;
    costPerRequest: number;

export interface CostOptimizationConfig {
    enableCostOptimization: boolean;
    costTargets: CostTargets;
    instanceTypes: InstanceTypeConfig[];
    spotInstanceConfig: SpotInstanceConfig;
    reservedInstanceConfig: ReservedInstanceConfig;
    autoShutdownConfig: AutoShutdownConfig;

export interface CostTargets {
    maxMonthlyCost: number;
    costPerRequestTarget: number;
    utilizationTarget: number;
    costEfficiencyScore: number;

export interface InstanceTypeConfig {
    instanceType: string;
    costPerHour: number;
    cpuCores: number;
    memoryGb: number;
    networkPerformance: string;
    suitableWorkloads: string[];
    enabled: boolean;

export interface SpotInstanceConfig {
    enableSpotInstances: boolean;
    maxSpotPrice: number;
    spotInstancePercentage: number;
    diversificationStrategy: SpotDiversificationStrategy;
    interruptionHandling: SpotInterruptionHandling;

export declare enum SpotDiversificationStrategy {
    ACROSS_POOLS = "across_pools",
    ACROSS_AZ = "across_az",
    ACROSS_INSTANCE_TYPES = "across_instance_types",
    PRICE_CAPACITY_OPTIMIZED = "price_capacity_optimized"

export interface SpotInterruptionHandling {
    drainTimeout: number;
    replacementStrategy: ReplacementStrategy;
    notificationEnabled: boolean;

export declare enum ReplacementStrategy {
    IMMEDIATE = "immediate",
    GRADUAL = "gradual",
    QUEUE_BASED = "queue_based"

export interface ReservedInstanceConfig {
    enableReservedInstances: boolean;
    reservationStrategy: ReservationStrategy;
    commitmentLevel: number;
    termLength: ReservationTerm;
    paymentOption: PaymentOption;

export declare enum ReservationStrategy {
    USAGE_BASED = "usage_based",
    COST_OPTIMIZED = "cost_optimized",
    BALANCED = "balanced"

export declare enum ReservationTerm {
    ONE_YEAR = "one_year",
    THREE_YEARS = "three_years"

export declare enum PaymentOption {
    NO_UPFRONT = "no_upfront",
    PARTIAL_UPFRONT = "partial_upfront",
    ALL_UPFRONT = "all_upfront"

export interface AutoShutdownConfig {
    enableAutoShutdown: boolean;
    idleThreshold: number;
    scheduleBasedShutdown: ScheduleBasedShutdown[];
    excludeFromShutdown: string[];

export interface ScheduleBasedShutdown {
    scheduleId: string;
    name: string;
    shutdownTime: string;
    startupTime: string;
    daysOfWeek: number[];
    enabled: boolean;

export interface ScalingAlertingConfig {
    enableAlerting: boolean;
    alertChannels: AlertChannel[];
    scalingEvents: ScalingEventAlert[];
    performanceAlerts: PerformanceAlert[];
    costAlerts: CostAlert[];

export interface AlertChannel {
    channelId: string;
    channelType: AlertChannelType;
    configuration: Record<string, any>;
    enabled: boolean;

export declare enum AlertChannelType {
    EMAIL = "email",
    SLACK = "slack",
    WEBHOOK = "webhook",
    SMS = "sms",
    PAGER_DUTY = "pager_duty"

export interface ScalingEventAlert {
    alertId: string;
    eventType: ScalingEventType;
    severity: AlertSeverity;
    threshold: number;
    enabled: boolean;

export declare enum ScalingEventType {
    SCALE_UP = "scale_up",
    SCALE_DOWN = "scale_down",
    SCALE_OUT = "scale_out",
    SCALE_IN = "scale_in",
    FAILED_SCALING = "failed_scaling",
    CAPACITY_LIMIT = "capacity_limit"

export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"

export interface PerformanceAlert {
    alertId: string;
    metricName: string;
    threshold: number;
    comparison: ComparisonOperator;
    duration: number;
    severity: AlertSeverity;
    enabled: boolean;

export declare enum ComparisonOperator {
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    EQUALS = "equals",
    NOT_EQUALS = "not_equals"

export interface CostAlert {
    alertId: string;
    costType: CostType;
    threshold: number;
    period: CostPeriod;
    severity: AlertSeverity;
    enabled: boolean;

export declare enum CostType {
    TOTAL_COST = "total_cost",
    COST_PER_REQUEST = "cost_per_request",
    DAILY_COST = "daily_cost",
    MONTHLY_COST = "monthly_cost"

export declare enum CostPeriod {
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly"

export interface ScalingDecision {
    decisionId: string;
    timestamp: Date;
    decisionType: ScalingDecisionType;
    reason: string;
    currentMetrics: ScalingMetrics;
    targetMetrics: ScalingMetrics;
    scalingAction: ScalingAction;
    confidence: number;
    estimatedImpact: ScalingImpact;
    executionStatus: ExecutionStatus;

export declare enum ScalingDecisionType {
    REACTIVE_SCALING = "reactive_scaling",
    PREDICTIVE_SCALING = "predictive_scaling",
    SCHEDULED_SCALING = "scheduled_scaling",
    COST_OPTIMIZATION = "cost_optimization",
    MANUAL_OVERRIDE = "manual_override"

export interface ScalingMetrics {
    timestamp: Date;
    instanceCount: number;
    cpuUtilization: number;
    memoryUtilization: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
    queueDepth: number;
    connectionCount: number;
    cost: number;

export interface ScalingAction {
    actionType: ScalingActionType;
    instanceChanges: InstanceChange[];
    loadBalancerChanges: LoadBalancerChange[];
    configurationChanges: ConfigurationChange[];
    expectedDuration: number;

export declare enum ScalingActionType {
    SCALE_OUT = "scale_out",
    SCALE_IN = "scale_in",
    SCALE_UP = "scale_up",
    SCALE_DOWN = "scale_down",
    REBALANCE = "rebalance",
    MIGRATE = "migrate"

export interface InstanceChange {
    instanceId?: string;
    instanceType: string;
    action: InstanceAction;
    availabilityZone: string;
    expectedStartTime: Date;

export declare enum InstanceAction {
    LAUNCH = "launch",
    TERMINATE = "terminate",
    STOP = "stop",
    START = "start",
    RESIZE = "resize"

export interface LoadBalancerChange {
    targetGroupId: string;
    action: LoadBalancerAction;
    weight: number;
    healthCheckChanges?: HealthCheckConfig;

export declare enum LoadBalancerAction {
    ADD_TARGET = "add_target",
    REMOVE_TARGET = "remove_target",
    UPDATE_WEIGHT = "update_weight",
    UPDATE_HEALTH_CHECK = "update_health_check"

export interface ConfigurationChange {
    configType: ConfigurationType;
    parameter: string;
    oldValue: unknown;
    newValue: unknown;
    reason: string;

export declare enum ConfigurationType {
    LOAD_BALANCER = "load_balancer",
    AUTO_SCALING = "auto_scaling",
    INSTANCE = "instance",
    APPLICATION = "application"

export interface ScalingImpact {
    expectedPerformanceChange: PerformanceChange;
    expectedCostChange: CostChange;
    riskAssessment: RiskAssessment;
    rollbackPlan: RollbackPlan;

export interface PerformanceChange {
    responseTimeChange: number;
    throughputChange: number;
    availabilityChange: number;
    resourceUtilizationChange: number;

export interface CostChange {
    hourlyCostChange: number;
    dailyCostChange: number;
    monthlyCostChange: number;
    costPerRequestChange: number;

export interface RiskAssessment {
    overallRisk: RiskLevel;
    risks: Risk[];
    mitigations: Mitigation[];

export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export interface Risk {
    riskId: string;
    description: string;
    likelihood: number;
    impact: number;
    riskLevel: RiskLevel;

export interface Mitigation {
    mitigationId: string;
    description: string;
    effectiveness: number;
    implementationCost: number;

export interface RollbackPlan {
    rollbackActions: ScalingAction[];
    rollbackTriggers: RollbackTrigger[];
    maxRollbackTime: number;
    successCriteria: SuccessCriteria[];

export interface RollbackTrigger {
    triggerId: string;
    condition: string;
    threshold: number;
    evaluationPeriod: number;

export interface SuccessCriteria {
    criteriaId: string;
    metric: string;
    targetValue: number;
    evaluationPeriod: number;

export declare enum ExecutionStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    ROLLED_BACK = "rolled_back",
    CANCELLED = "cancelled"

export interface LoadBalancingAnalytics {
    analyticsId: string;
    timestamp: Date;
    serverPools: ServerPoolAnalytics[];
    routingAnalytics: RoutingAnalytics;
    performanceAnalytics: LoadBalancerPerformanceAnalytics;
    recommendations: LoadBalancingRecommendation[];

export interface ServerPoolAnalytics {
    poolId: string;
    poolName: string;
    serverCount: number;
    activeConnections: number;
    requestRate: number;
    responseTime: number;
    errorRate: number;
    healthScore: number;
    utilization: ResourceUtilization;
    capacity: PoolCapacity;

export interface ResourceUtilization {
    cpu: number;
    memory: number;
    network: number;
    disk: number;

export interface PoolCapacity {
    maxConnections: number;
    maxRequestsPerSecond: number;
    currentLoad: number;
    availableCapacity: number;

export interface RoutingAnalytics {
    totalRequests: number;
    routingDistribution: RoutingDistribution[];
    stickySessions: StickySessionAnalytics;
    failoverEvents: FailoverEvent[];
    circuitBreakerEvents: CircuitBreakerEvent[];

export interface RoutingDistribution {
    serverId: string;
    requestCount: number;
    requestPercentage: number;
    responseTime: number;
    errorCount: number;

export interface StickySessionAnalytics {
    totalSessions: number;
    activeSessionsByServer: Map<string, number>;
    sessionDuration: number;
    sessionDistribution: number[];

export interface FailoverEvent {
    eventId: string;
    timestamp: Date;
    sourceServer: string;
    targetServer: string;
    reason: string;
    duration: number;
    requestsAffected: number;

export interface CircuitBreakerEvent {
    eventId: string;
    timestamp: Date;
    serverId: string;
    state: CircuitBreakerState;
    reason: string;
    duration: number;

export declare enum CircuitBreakerState {
    CLOSED = "closed",
    OPEN = "open",
    HALF_OPEN = "half_open"

export interface LoadBalancerPerformanceAnalytics {
    overallResponseTime: number;
    overallThroughput: number;
    overallErrorRate: number;
    overallAvailability: number;
    performanceTrends: PerformanceTrend[];
    bottlenecks: Bottleneck[];

export interface PerformanceTrend {
    metric: string;
    trend: TrendDirection;
    changeRate: number;
    significance: TrendSignificance;

export declare enum TrendDirection {
    IMPROVING = "improving",
    DEGRADING = "degrading",
    STABLE = "stable",
    VOLATILE = "volatile"

export declare enum TrendSignificance {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export interface Bottleneck {
    bottleneckId: string;
    location: BottleneckLocation;
    severity: BottleneckSeverity;
    description: string;
    impact: number;
    suggestions: string[];

export declare enum BottleneckLocation {
    LOAD_BALANCER = "load_balancer",
    SERVER_POOL = "server_pool",
    INDIVIDUAL_SERVER = "individual_server",
    NETWORK = "network",
    DATABASE = "database"

export declare enum BottleneckSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export interface LoadBalancingRecommendation {
    recommendationId: string;
    priority: number;
    category: RecommendationCategory;
    title: string;
    description: string;
    expectedBenefit: string;
    implementationEffort: ImplementationEffort;
    riskLevel: RiskLevel;
    actionItems: string[];

export declare enum RecommendationCategory {
    SCALING = "scaling",
    LOAD_BALANCING = "load_balancing",
    PERFORMANCE = "performance",
    COST_OPTIMIZATION = "cost_optimization",
    RELIABILITY = "reliability"

export declare enum ImplementationEffort {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"

export declare class ApiScalingAnalyticsIntegration extends EventEmitter {
    private config;
    private scalingDecisions;
    private loadBalancingAnalytics;
    private performanceHistory;
    private predictiveModels;
    private isAnalyzing;
    constructor(config: ScalingAnalyticsConfig);
    analyzeScalingNeeds(): Promise<ScalingDecision[]>;
    analyzeLoadBalancing(): Promise<LoadBalancingAnalytics>;
    executeScalingDecision(decisionId: string): Promise<boolean>;
    optimizeLoadBalancing(): Promise<LoadBalancingRecommendation[]>;
    getPredictiveScalingForecast(hours: number): Promise<ScalingForecast[]>;
    getScalingHistory(days?: number): ScalingDecision[];
    getLoadBalancingHistory(days?: number): LoadBalancingAnalytics[];
    getCostOptimizationReport(): Promise<CostOptimizationReport>;
    private initializeAnalytics;
    private startAnalyticsLoop;
    private runPeriodicAnalysis;
    private collectCurrentMetrics;
    private analyzeReactiveScaling;
    private analyzePredictiveScaling;
    private analyzeCostOptimization;
    private collectServerPoolAnalytics;
    private analyzeRouting;
    private analyzeLoadBalancerPerformance;
    private generateLoadBalancingRecommendations;
    private analyzeServerPoolImbalances;
    private analyzeRoutingEfficiency;
    private analyzePerformanceBottlenecks;
    private executeScalingActions;
    private executeInstanceChange;
    private executeLoadBalancerChange;
    private executeConfigurationChange;
    private monitorScalingExecution;
    private evaluateScalingSuccess;
    private executeAutomaticOptimizations;
    private isLowRiskDecision;
    private updatePredictiveModels;
    private shouldRetrainModel;
    private retrainModel;
    private generateScalingForecast;
    private getSeasonalMultiplier;
    private calculateCurrentCapacity;
    private calculateTargetMetrics;
    private calculateTargetMetricsForCapacity;
    private calculateCostOptimizedMetrics;
    private generateScalingAction;
    private analyzeCostOptimizationAction;
    private estimateScalingImpact;
    private estimateCostOptimizationImpact;
    private calculateUtilizationVariance;
    private generateCostOptimizationReport;
    private identifyCostOptimizations;
    private collectAndStoreMetrics;
    private cleanupOldData;
    private sleep;
interface ScalingForecast {
    timestamp: Date;
    expectedLoad: number;
    confidence: number;
    factors: {,
        seasonal: number;
        trend: number;
        events: string[];
    };
interface CostOptimizationReport {
    reportId: string;
    generatedAt: Date;
    currentCost: number;
    optimizedCost: number;
    potentialSavings: number;
    optimizationOpportunities: CostOptimizationOpportunity[];
    recommendations: string[];
interface CostOptimizationOpportunity {
    opportunityId: string;
    description: string;
    estimatedSavings: number;
    riskLevel: RiskLevel;
    recommendation: string;

export declare class ApiScalingAnalyticsFactory {
    static createDefaultConfig(): ScalingAnalyticsConfig;
    static createHighPerformanceConfig(): ScalingAnalyticsConfig;
    static createCostOptimizedConfig(): ScalingAnalyticsConfig;
    static createAnalytics(config?: Partial<ScalingAnalyticsConfig>): ApiScalingAnalyticsIntegration;

export default ApiScalingAnalyticsIntegration;
//# sourceMappingURL=ApiScalingAnalyticsIntegration.d.ts.map