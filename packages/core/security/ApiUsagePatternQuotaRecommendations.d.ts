/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Epic 31.4.1 - API Usage Pattern-Based Quota Recommendations
 *
 * Intelligent quota recommendation system that analyzes API usage patterns
 * to provide optimal quota allocations, prevent abuse, and ensure fair
 * resource distribution across users and applications.
 *
 * Task: E31-1753313263537-6F9DAE
 */
import { EventEmitter } from 'events';

}
}
export interface QuotaRecommendationConfig { enablePatternAnalysis: boolean;
    analysisWindow: number;
    recommendationInterval: number;
    usagePatterns: UsagePatternConfig[];
    quotaAdjustmentRules: QuotaAdjustmentRule[];
    fairnessConfig: FairnessConfig;
    abuseDetectionConfig: AbuseDetectionConfig;
    alertingConfig: QuotaAlertingConfig }
}
}
export interface UsagePatternConfig { patternId: string;
    patternName: string;
    patternType: UsagePatternType;
    detectionRules: PatternDetectionRule[];
    quotaImpact: QuotaImpact;
    priority: number;
    enabled: boolean;

export declare enum UsagePatternType {
    BURST_PATTERN = "burst_pattern";
    STEADY_STATE = "steady_state";
    CYCLICAL_PATTERN = "cyclical_pattern";
    GROWTH_PATTERN = "growth_pattern";
    DECAY_PATTERN = "decay_pattern";
    IRREGULAR_PATTERN = "irregular_pattern";
    ABUSE_PATTERN = "abuse_pattern" }
    SEASONAL_PATTERN = "seasonal_pattern"

}
}
}
export interface PatternDetectionRule { ruleId: string;
    condition: string;
    threshold: number;
    timeWindow: number;
    weight: number;
    enabled: boolean }
}
}
export interface QuotaImpact { quotaMultiplier: number;
    adjustmentType: QuotaAdjustmentType;
    maxAdjustment: number;
    minAdjustment: number;
    confidenceThreshold: number;

export declare enum QuotaAdjustmentType {
    INCREASE = "increase";
    DECREASE = "decrease";
    MAINTAIN = "maintain";
    TEMPORARY_BOOST = "temporary_boost" }
    GRADUAL_CHANGE = "gradual_change"

}
}
}
export interface QuotaAdjustmentRule { ruleId: string;
    ruleName: string;
    conditions: AdjustmentCondition[];
    actions: AdjustmentAction[];
    priority: number;
    enabled: boolean;
    cooldownPeriod: number;
    lastApplied?: Date }
}
}
export interface AdjustmentCondition { conditionType: ConditionType;
    field: string;
    operator: string;
    value: any;
    weight: number;

export declare enum ConditionType {
    USAGE_RATE = "usage_rate";
    QUOTA_UTILIZATION = "quota_utilization";
    ERROR_RATE = "error_rate";
    USER_TIER = "user_tier";
    TIME_OF_DAY = "time_of_day";
    DAY_OF_WEEK = "day_of_week";
    HISTORICAL_PATTERN = "historical_pattern" }
    BUSINESS_METRIC = "business_metric"

}
}
}
export interface AdjustmentAction { actionType: AdjustmentActionType;
    parameters: Record<string, any>;
    duration: number;
    priority: number;

export declare enum AdjustmentActionType {
    SET_QUOTA = "set_quota";
    INCREASE_QUOTA = "increase_quota";
    DECREASE_QUOTA = "decrease_quota";
    APPLY_RATE_LIMIT = "apply_rate_limit";
    SEND_NOTIFICATION = "send_notification";
    ESCALATE_TO_ADMIN = "escalate_to_admin";
    BLOCK_USER = "block_user" }
    THROTTLE_REQUESTS = "throttle_requests"

}
}
}
export interface FairnessConfig { enableFairnessAnalysis: boolean;
    fairnessMetrics: FairnessMetric[];
    redistributionRules: RedistributionRule[];
    priorityTiers: PriorityTier[] }
}
}
export interface FairnessMetric { metricId: string;
    metricName: string;
    metricType: FairnessMetricType;
    targetValue: number;
    tolerance: number;
    weight: number;
    enabled: boolean;

export declare enum FairnessMetricType {
    GINI_COEFFICIENT = "gini_coefficient";
    STANDARD_DEVIATION = "standard_deviation";
    QUOTA_UTILIZATION_VARIANCE = "quota_utilization_variance";
    REQUEST_DISTRIBUTION = "request_distribution";
    RESPONSE_TIME_EQUITY = "response_time_equity" }
    ERROR_RATE_EQUITY = "error_rate_equity"

}
}
}
export interface RedistributionRule { ruleId: string;
    triggerCondition: string;
    sourceConditions: SourceCondition[];
    targetConditions: TargetCondition[];
    redistributionAmount: number;
    maxRedistribution: number;
    enabled: boolean }
}
}
export interface SourceCondition { condition: string;
    minUtilization: number;
    surplusAmount: number }
}
}
export interface TargetCondition { condition: string;
    maxUtilization: number;
    deficitAmount: number }
}
}
export interface PriorityTier { tierId: string;
    tierName: string;
    priority: number;
    quotaMultiplier: number;
    burstAllowance: number;
    guaranteedMinimum: number;
    features: TierFeature[] }
}
}
export interface TierFeature { featureId: string;
    featureName: string;
    enabled: boolean;
    parameters: Record<string, any> }
}
}
export interface AbuseDetectionConfig { enableAbuseDetection: boolean;
    abusePatterns: AbusePattern[];
    detectionSensitivity: number;
    responseActions: AbuseResponseAction[];
    whitelistRules: WhitelistRule[] }
}
}
export interface AbusePattern { patternId: string;
    patternName: string;
    description: string;
    detectionRules: AbuseDetectionRule[];
    severity: AbuseSeverity;
    confidence: number;
    enabled: boolean }
}
}
export interface AbuseDetectionRule { ruleId: string;
    ruleType: AbuseRuleType;
    threshold: number;
    timeWindow: number;
    condition: string;
    weight: number;

export declare enum AbuseRuleType {
    RATE_SPIKE = "rate_spike";
    QUOTA_EXHAUSTION = "quota_exhaustion";
    ERROR_FLOOD = "error_flood";
    SUSPICIOUS_TIMING = "suspicious_timing";
    RESOURCE_HOARDING = "resource_hoarding";
    PATTERN_DEVIATION = "pattern_deviation";
    COORDINATED_ATTACK = "coordinated_attack"

export declare enum AbuseSeverity {
    LOW = "low";
    MEDIUM = "medium";
    HIGH = "high" }
    CRITICAL = "critical"

}
}
}
export interface AbuseResponseAction { actionId: string;
    severity: AbuseSeverity;
    actionType: AbuseActionType;
    parameters: Record<string, any>;
    autoExecute: boolean;
    escalation: boolean;

export declare enum AbuseActionType {
    TEMPORARY_QUOTA_REDUCTION = "temporary_quota_reduction";
    RATE_LIMITING = "rate_limiting";
    TEMPORARY_SUSPENSION = "temporary_suspension";
    REQUIRE_VERIFICATION = "require_verification";
    ADMIN_NOTIFICATION = "admin_notification";
    CAPTCHA_CHALLENGE = "captcha_challenge" }
    ACCOUNT_REVIEW = "account_review"

}
}
}
export interface WhitelistRule { ruleId: string;
    ruleName: string;
    conditions: string[];
    exemptions: AbuseExemption[];
    enabled: boolean }
}
}
export interface AbuseExemption { exemptionType: ExemptionType;
    value: string;
    reason: string;
    expiresAt?: Date;

export declare enum ExemptionType {
    USER_ID = "user_id";
    IP_ADDRESS = "ip_address";
    API_KEY = "api_key";
    USER_AGENT = "user_agent" }
    DOMAIN = "domain"

}
}
}
export interface QuotaAlertingConfig { enableAlerting: boolean;
    alertThresholds: AlertThreshold[];
    notificationChannels: NotificationChannel[];
    escalationRules: EscalationRule[] }
}
}
export interface AlertThreshold { thresholdId: string;
    metricType: AlertMetricType;
    warningLevel: number;
    criticalLevel: number;
    evaluationPeriod: number;
    enabled: boolean;

export declare enum AlertMetricType {
    QUOTA_UTILIZATION = "quota_utilization";
    QUOTA_EXHAUSTION_RATE = "quota_exhaustion_rate";
    ABUSE_DETECTION_RATE = "abuse_detection_rate";
    FAIRNESS_VIOLATION = "fairness_violation" }
    SYSTEM_OVERLOAD = "system_overload"

}
}
}
export interface NotificationChannel { channelId: string;
    channelType: NotificationChannelType;
    configuration: Record<string, any>;
    enabled: boolean;

export declare enum NotificationChannelType {
    EMAIL = "email";
    SLACK = "slack";
    WEBHOOK = "webhook";
    SMS = "sms" }
    DASHBOARD = "dashboard"

}
}
}
export interface EscalationRule { ruleId: string;
    triggerCondition: string;
    escalationDelay: number;
    escalationTarget: string;
    maxEscalations: number;
    enabled: boolean }
}
}
export interface UsagePattern { patternId: string;
    userId: string;
    apiEndpoint: string;
    patternType: UsagePatternType;
    detectedAt: Date;
    confidence: number;
    metrics: PatternMetrics;
    characteristics: PatternCharacteristics;
    forecast: UsageForecast;
    recommendations: PatternRecommendation[] }
}
}
export interface PatternMetrics { averageRequestRate: number;
    peakRequestRate: number;
    requestVariance: number;
    errorRate: number;
    quotaUtilization: number;
    responseTimeDistribution: number[];
    timingPattern: TimingPattern }
}
}
export interface TimingPattern { peakHours: number[];
    peakDays: number[];
    seasonality: SeasonalityInfo;
    burstFrequency: number;
    steadyStateRatio: number }
}
}
export interface SeasonalityInfo { hasSeasonality: boolean;
    period: number;
    amplitude: number;
    phase: number }
}
}
export interface PatternCharacteristics { predictability: number;
    volatility: number;
    growthRate: number;
    burstiness: number;
    efficiency: number;
    consistency: number }
}
}
export interface UsageForecast { forecastHorizon: number;
    predictedUsage: ForecastPoint[];
    confidence: number;
    uncertaintyBounds: UncertaintyBounds;
    scenarioForecasts: ScenarioForecast[] }
}
}
export interface ForecastPoint { timestamp: Date;
    requestRate: number;
    quotaUtilization: number;
    confidence: number }
}
}
export interface UncertaintyBounds { upperBound: number[];
    lowerBound: number[];
    confidenceInterval: number }
}
}
export interface ScenarioForecast { scenarioId: string;
    scenarioName: string;
    probability: number;
    forecastPoints: ForecastPoint[];
    description: string }
}
}
export interface PatternRecommendation { recommendationId: string;
    recommendationType: RecommendationType;
    priority: number;
    description: string;
    rationale: string;
    expectedBenefit: string;
    implementationCost: ImplementationCost;
    riskLevel: RiskLevel;
    actionItems: ActionItem[];

export declare enum RecommendationType {
    QUOTA_INCREASE = "quota_increase";
    QUOTA_DECREASE = "quota_decrease";
    BURST_ALLOWANCE = "burst_allowance";
    RATE_LIMITING = "rate_limiting";
    TIER_UPGRADE = "tier_upgrade";
    TIER_DOWNGRADE = "tier_downgrade";
    USAGE_OPTIMIZATION = "usage_optimization";
    PATTERN_EDUCATION = "pattern_education"

export declare enum ImplementationCost {
    LOW = "low";
    MEDIUM = "medium";
    HIGH = "high"

export declare enum RiskLevel {
    LOW = "low";
    MEDIUM = "medium";
    HIGH = "high" }
    CRITICAL = "critical"

}
}
}
export interface ActionItem { itemId: string;
    description: string;
    actionType: string;
    parameters: Record<string, any>;
    estimatedTime: number;
    dependencies: string[] }
}
}
export interface QuotaRecommendation { recommendationId: string;
    userId: string;
    apiEndpoint: string;
    currentQuota: QuotaAllocation;
    recommendedQuota: QuotaAllocation;
    reason: string;
    confidence: number;
    expectedImpact: QuotaImpactAnalysis;
    validUntil: Date;
    priority: number;
    status: RecommendationStatus;
    appliedAt?: Date;
    feedback?: RecommendationFeedback }
}
}
export interface QuotaAllocation { requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    concurrentConnections: number;
    burstAllowance: number;
    specialLimits: SpecialLimit[] }
}
}
export interface SpecialLimit { limitType: string;
    value: number;
    unit: string;
    scope: string }
}
}
export interface QuotaImpactAnalysis { performanceImpact: PerformanceImpact;
    businessImpact: BusinessImpact;
    systemImpact: SystemImpact;
    userExperienceImpact: UserExperienceImpact;
    costImpact: CostImpact }
}
}
export interface PerformanceImpact { responseTimeChange: number;
    throughputChange: number;
    errorRateChange: number;
    availabilityChange: number }
}
}
export interface BusinessImpact { revenueImpact: number;
    userSatisfactionChange: number;
    churnRiskChange: number;
    competitiveAdvantage: string }
}
}
export interface SystemImpact { resourceUtilizationChange: number;
    capacityRequirementChange: number;
    scalingImplications: string[];
    infrastructureCost: number }
}
}
export interface UserExperienceImpact { satisfactionScore: number;
    frustractionEvents: number;
    engagementChange: number;
    feedbackSentiment: string }
}
}
export interface CostImpact { operationalCostChange: number;
    infrastructureCostChange: number;
    supportCostChange: number;
    totalCostOfOwnership: number;

export declare enum RecommendationStatus {
    PROPOSED = "proposed";
    APPROVED = "approved";
    APPLIED = "applied";
    REJECTED = "rejected";
    EXPIRED = "expired" }
    MONITORING = "monitoring"

}
}
}
export interface RecommendationFeedback { feedbackId: string;
    rating: number;
    comments: string;
    actualImpact: QuotaImpactAnalysis;
    providedBy: string;
    providedAt: Date }
}
}
export interface FairnessAnalysis { analysisId: string;
    timestamp: Date;
    overallFairnessScore: number;
    fairnessMetrics: FairnessMetricResult[];
    inequalityIssues: InequalityIssue[];
    redistributionOpportunities: RedistributionOpportunity[];
    recommendations: FairnessRecommendation[] }
}
}
export interface FairnessMetricResult { metricId: string;
    metricName: string;
    currentValue: number;
    targetValue: number;
    deviation: number;
    severity: MetricSeverity;

export declare enum MetricSeverity {
    ACCEPTABLE = "acceptable";
    MINOR_CONCERN = "minor_concern";
    MAJOR_CONCERN = "major_concern" }
    CRITICAL_ISSUE = "critical_issue"

}
}
}
export interface InequalityIssue { issueId: string;
    issueType: InequalityType;
    description: string;
    affectedUsers: string[];
    severity: AbuseSeverity;
    measuredImpact: number;
    suggestedActions: string[];

export declare enum InequalityType {
    QUOTA_DISPARITY = "quota_disparity";
    ACCESS_INEQUALITY = "access_inequality";
    PERFORMANCE_INEQUALITY = "performance_inequality";
    RESOURCE_MONOPOLIZATION = "resource_monopolization" }
    TIER_IMBALANCE = "tier_imbalance"

}
}
}
export interface RedistributionOpportunity { opportunityId: string;
    sourceUsers: string[];
    targetUsers: string[];
    redistributableQuota: number;
    expectedBenefit: number;
    riskAssessment: string;
    implementationPlan: string[] }
}
}
export interface FairnessRecommendation { recommendationId: string;
    category: FairnessCategory;
    title: string;
    description: string;
    priority: number;
    expectedImprovement: number;
    actionItems: string[];

export declare enum FairnessCategory {
    QUOTA_REBALANCING = "quota_rebalancing";
    TIER_RESTRUCTURING = "tier_restructuring";
    POLICY_ADJUSTMENT = "policy_adjustment" }
    MONITORING_ENHANCEMENT = "monitoring_enhancement"

}
}
}
export interface AbuseDetectionResult { detectionId: string;
    userId: string;
    detectedAt: Date;
    abuseType: AbuseType;
    severity: AbuseSeverity;
    confidence: number;
    evidence: AbuseEvidence[];
    impact: AbuseImpact;
    responseActions: ResponseAction[];
    status: AbuseStatus;

export declare enum AbuseType {
    RATE_ABUSE = "rate_abuse";
    QUOTA_GAMING = "quota_gaming";
    RESOURCE_HOARDING = "resource_hoarding";
    COORDINATED_ABUSE = "coordinated_abuse";
    AUTOMATED_SCRAPING = "automated_scraping";
    DOS_ATTACK = "dos_attack" }
    FRAUD_ATTEMPT = "fraud_attempt"

}
}
}
export interface AbuseEvidence { evidenceType: EvidenceType;
    description: string;
    data: Record<string, any>;
    strength: number;
    timestamp: Date;

export declare enum EvidenceType {
    TRAFFIC_PATTERN = "traffic_pattern";
    TIMING_ANOMALY = "timing_anomaly";
    RATE_ANOMALY = "rate_anomaly";
    ERROR_PATTERN = "error_pattern";
    BEHAVIORAL_ANOMALY = "behavioral_anomaly" }
    TECHNICAL_FINGERPRINT = "technical_fingerprint"

}
}
}
export interface AbuseImpact { systemImpact: number;
    userImpact: number;
    businessImpact: number;
    affectedUsers: number;
    resourceConsumption: number }
}
}
export interface ResponseAction { actionId: string;
    actionType: AbuseActionType;
    appliedAt: Date;
    duration: number;
    parameters: Record<string, any>;
    effectiveness: number;
    status: ActionStatus;

export declare enum ActionStatus {
    PENDING = "pending";
    APPLIED = "applied";
    COMPLETED = "completed";
    FAILED = "failed";
    REVERTED = "reverted"

export declare enum AbuseStatus {
    DETECTED = "detected";
    INVESTIGATING = "investigating";
    CONFIRMED = "confirmed";
    FALSE_POSITIVE = "false_positive";
    RESOLVED = "resolved" }
    ESCALATED = "escalated"

export declare class ApiUsagePatternQuotaRecommendations extends EventEmitter { private config;
    private usagePatterns;
    private quotaRecommendations;
    private fairnessAnalysisHistory;
    private abuseDetectionResults;
    private usageHistory;
    private isAnalyzing;
    constructor(config: QuotaRecommendationConfig);
    analyzeUsagePatterns(userId: string, apiEndpoint?: string): Promise<UsagePattern[]>;
    generateQuotaRecommendations(userId: string): Promise<QuotaRecommendation[]>;
    applyRecommendation(recommendationId: string): Promise<boolean>;
    performFairnessAnalysis(): Promise<FairnessAnalysis>;
    detectAbuse(userId: string): Promise<AbuseDetectionResult[]>;
    getUsagePattern(patternId: string): UsagePattern | null;
    getRecommendation(recommendationId: string): QuotaRecommendation | null;
    getRecommendationsForUser(userId: string): QuotaRecommendation[];
    getFairnessHistory(days?: number): FairnessAnalysis[];
    getAbuseDetections(userId?: string): AbuseDetectionResult[];
    optimizeQuotaDistribution(): Promise<OptimizationResult>;
    private initializeRecommendationEngine;
    private startAnalysisLoop;
    private runPeriodicAnalysis;
    private collectUsageData;
    private detectPattern;
    private calculatePatternMetrics;
    private analyzePatternCharacteristics;
    private evaluatePatternDetectionRules;
    private evaluateDetectionRule;
    private generateRecommendationFromPattern;
    private calculateRecommendedQuota;
    private applyFairnessAdjustments;
    private applyQuotaChanges;
    private startImpactMonitoring;
    private calculateFairnessMetrics;
    private calculateFairnessMetric;
    private detectAbusePattern;
    private evaluateAbuseRule;
    private applyAbuseResponseActions;
    private calculateVariance;
    private analyzeTimingPattern;
    private findPeakHours;
    private findPeakDays;
    private detectSeasonality;
    private calculateSeasonalCorrelation;
    private calculatePearsonCorrelation;
    private calculateSeasonalPhase;
    private calculateBurstFrequency;
    private calculateSteadyStateRatio;
    private calculatePredictability;
    private calculateGrowthRate;
    private calculateBurstiness;
    private calculateEfficiency;
    private calculateConsistency;
    private detectBurstPattern;
    private detectSteadyState;
    private detectGrowthPattern;
    private detectCyclicalPattern;
    private generateUsageForecast;
    private calculateRecentTrend;
    private getSeasonalAdjustment;
    private calculateUncertaintyBounds;
    private generatePatternRecommendations;
    private getAllUsers;
    private getActiveUsers;
    private getCurrentQuota;
    private quotasAreEquivalent;
    private generateRecommendationReason;
    private analyzeQuotaImpact;
    private calculateRecommendationPriority;
    private isLowRiskRecommendation;
    private calculateFairnessImpact;
    private adjustForFairness;
    private calculateOverallFairnessScore;
    private getFairnessMetricWeight;
    private identifyInequalityIssues;
    private findRedistributionOpportunities;
    private generateFairnessRecommendations;
    private collectAndStoreUsageData;
    private cleanupOldData;
    private runAbuseDetectionScan;
    private calculateGiniCoefficient;
    private calculateQuotaUtilizationVariance;
    private calculateRequestDistributionMetric;
    private classifyMetricSeverity;
    private mapMetricToInequalityType;
    private generateInequalityActions;
    private findLowUtilizationUsers;
    private findHighUtilizationUsers;
    private mapRuleToEvidenceType;
    private mapPatternToAbuseType;
    private calculateAbuseImpact;
    private determineResponseActions;
    private evaluateRateSpikeRule;
    private evaluateQuotaExhaustionRule;
    private evaluateErrorFloodRule;
    private executeAbuseResponseAction;
    private calculateActualImpact;
    private compareImpacts;
    private executeRedistribution;
    private executeFairnessRecommendation;
    private calculateFairnessImprovement;
    private getAffectedUsers;
    private calculateOptimizationBenefit }
}
}
interface OptimizationResult {
    optimizationId: string;
    timestamp: Date;
    actionsApplied: number;
    fairnessImprovement: number;
    affectedUsers: string[];
    estimatedBenefit: number;

export declare class ApiUsagePatternQuotaRecommendationsFactory {
    static createDefaultConfig(): QuotaRecommendationConfig;
    static createHighSensitivityConfig(): QuotaRecommendationConfig;
    static createRecommendationEngine(config?: Partial<QuotaRecommendationConfig>): ApiUsagePatternQuotaRecommendations;

export default ApiUsagePatternQuotaRecommendations;
//# sourceMappingURL=ApiUsagePatternQuotaRecommendations.d.ts.map
}
}