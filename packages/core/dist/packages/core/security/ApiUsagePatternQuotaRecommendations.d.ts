export interface QuotaRecommendationConfig {
    enablePatternAnalysis: boolean;
    analysisWindow: number;
    recommendationInterval: number;
    usagePatterns: UsagePatternConfig;
    quotaAdjustmentRules: QuotaAdjustmentRule;
    fairnessConfig: FairnessConfig;
    abuseDetectionConfig: AbuseDetectionConfig;
    alertingConfig: QuotaAlertingConfig;
}
export interface UsagePatternConfig {
    patternId: string;
    patternName: string;
    patternType: UsagePatternType;
    detectionRules: PatternDetectionRule;
    quotaImpact: QuotaImpact;
    priority: number;
    enabled: boolean;
}
export declare enum UsagePatternType {
    BURST_PATTERN = "burst_pattern",
    STEADY_STATE = "steady_state",
    CYCLICAL_PATTERN = "cyclical_pattern",
    GROWTH_PATTERN = "growth_pattern",
    DECAY_PATTERN = "decay_pattern",
    IRREGULAR_PATTERN = "irregular_pattern",
    ABUSE_PATTERN = "abuse_pattern",
    SEASONAL_PATTERN = "seasonal_pattern",
    export,
    interface,
    PatternDetectionRule
}
export interface QuotaImpact {
    quotaMultiplier: number;
    adjustmentType: QuotaAdjustmentType;
    maxAdjustment: number;
    minAdjustment: number;
    confidenceThreshold: number;
}
export declare enum QuotaAdjustmentType {
    INCREASE = "increase",
    DECREASE = "decrease",
    MAINTAIN = "maintain",
    TEMPORARY_BOOST = "temporary_boost",
    GRADUAL_CHANGE = "gradual_change",
    export,
    interface,
    QuotaAdjustmentRule
}
export interface AdjustmentCondition {
    conditionType: ConditionType;
    field: string;
    operator: string;
    value: unknown;
    weight: number;
}
export declare enum ConditionType {
    USAGE_RATE = "usage_rate",
    QUOTA_UTILIZATION = "quota_utilization",
    ERROR_RATE = "error_rate",
    USER_TIER = "user_tier",
    TIME_OF_DAY = "time_of_day",
    DAY_OF_WEEK = "day_of_week",
    HISTORICAL_PATTERN = "historical_pattern",
    BUSINESS_METRIC = "business_metric",
    export,
    interface,
    AdjustmentAction
}
export declare enum AdjustmentActionType {
    SET_QUOTA = "set_quota",
    INCREASE_QUOTA = "increase_quota",
    DECREASE_QUOTA = "decrease_quota",
    APPLY_RATE_LIMIT = "apply_rate_limit",
    SEND_NOTIFICATION = "send_notification",
    ESCALATE_TO_ADMIN = "escalate_to_admin",
    BLOCK_USER = "block_user",
    THROTTLE_REQUESTS = "throttle_requests",
    export,
    interface,
    FairnessConfig
}
export interface FairnessMetric {
    metricId: string;
    metricName: string;
    metricType: FairnessMetricType;
    targetValue: number;
    tolerance: number;
    weight: number;
    enabled: boolean;
}
export declare enum FairnessMetricType {
    GINI_COEFFICIENT = "gini_coefficient",
    STANDARD_DEVIATION = "standard_deviation",
    QUOTA_UTILIZATION_VARIANCE = "quota_utilization_variance",
    REQUEST_DISTRIBUTION = "request_distribution",
    RESPONSE_TIME_EQUITY = "response_time_equity",
    ERROR_RATE_EQUITY = "error_rate_equity",
    export,
    interface,
    RedistributionRule
}
export interface SourceCondition {
    condition: string;
    minUtilization: number;
    surplusAmount: number;
}
export interface TargetCondition {
    condition: string;
    maxUtilization: number;
    deficitAmount: number;
}
export interface PriorityTier {
    tierId: string;
    tierName: string;
    priority: number;
    quotaMultiplier: number;
    burstAllowance: number;
    guaranteedMinimum: number;
    features: TierFeature;
}
export interface TierFeature {
    featureId: string;
    featureName: string;
    enabled: boolean;
    parameters: Record<string, unknown>;
}
export interface AbuseDetectionConfig {
    enableAbuseDetection: boolean;
    abusePatterns: AbusePattern;
    detectionSensitivity: number;
    responseActions: AbuseResponseAction;
    whitelistRules: WhitelistRule;
}
export interface AbusePattern {
    patternId: string;
    patternName: string;
    description: string;
    detectionRules: AbuseDetectionRule;
    severity: AbuseSeverity;
    confidence: number;
    enabled: boolean;
}
export interface AbuseDetectionRule {
    ruleId: string;
    ruleType: AbuseRuleType;
    threshold: number;
    timeWindow: number;
    condition: string;
    weight: number;
}
export declare enum AbuseRuleType {
    RATE_SPIKE = "rate_spike",
    QUOTA_EXHAUSTION = "quota_exhaustion",
    ERROR_FLOOD = "error_flood",
    SUSPICIOUS_TIMING = "suspicious_timing",
    RESOURCE_HOARDING = "resource_hoarding",
    PATTERN_DEVIATION = "pattern_deviation",
    COORDINATED_ATTACK = "coordinated_attack",
    export,
    enum,
    AbuseSeverity
}
//# sourceMappingURL=ApiUsagePatternQuotaRecommendations.d.ts.map