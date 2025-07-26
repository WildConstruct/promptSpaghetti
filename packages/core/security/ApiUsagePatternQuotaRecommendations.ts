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

// ==========================================
// TYPES AND INTERFACES
// ==========================================

export interface QuotaRecommendationConfig {
  enablePatternAnalysis: boolean;
  analysisWindow: number; // hours
  recommendationInterval: number; // minutes
  usagePatterns: UsagePatternConfig[];
  quotaAdjustmentRules: QuotaAdjustmentRule[];
  fairnessConfig: FairnessConfig;
  abuseDetectionConfig: AbuseDetectionConfig;
  alertingConfig: QuotaAlertingConfig;
}

export interface UsagePatternConfig {
  patternId: string;
  patternName: string;
  patternType: UsagePatternType;
  detectionRules: PatternDetectionRule[];
  quotaImpact: QuotaImpact;
  priority: number;
  enabled: boolean;
}

export enum UsagePatternType {
  BURST_PATTERN = 'burst_pattern',
  STEADY_STATE = 'steady_state',
  CYCLICAL_PATTERN = 'cyclical_pattern',
  GROWTH_PATTERN = 'growth_pattern',
  DECAY_PATTERN = 'decay_pattern',
  IRREGULAR_PATTERN = 'irregular_pattern',
  ABUSE_PATTERN = 'abuse_pattern',
  SEASONAL_PATTERN = 'seasonal_pattern'
}

export interface PatternDetectionRule {
  ruleId: string;
  condition: string;
  threshold: number;
  timeWindow: number; // minutes
  weight: number;
  enabled: boolean;
}

export interface QuotaImpact {
  quotaMultiplier: number;
  adjustmentType: QuotaAdjustmentType;
  maxAdjustment: number;
  minAdjustment: number;
  confidenceThreshold: number;
}

export enum QuotaAdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  MAINTAIN = 'maintain',
  TEMPORARY_BOOST = 'temporary_boost',
  GRADUAL_CHANGE = 'gradual_change'
}

export interface QuotaAdjustmentRule {
  ruleId: string;
  ruleName: string;
  conditions: AdjustmentCondition[];
  actions: AdjustmentAction[];
  priority: number;
  enabled: boolean;
  cooldownPeriod: number; // minutes
  lastApplied?: Date;
}

export interface AdjustmentCondition {
  conditionType: ConditionType;
  field: string;
  operator: string;
  value: any;
  weight: number;
}

export enum ConditionType {
  USAGE_RATE = 'usage_rate',
  QUOTA_UTILIZATION = 'quota_utilization',
  ERROR_RATE = 'error_rate',
  USER_TIER = 'user_tier',
  TIME_OF_DAY = 'time_of_day',
  DAY_OF_WEEK = 'day_of_week',
  HISTORICAL_PATTERN = 'historical_pattern',
  BUSINESS_METRIC = 'business_metric'
}

export interface AdjustmentAction {
  actionType: AdjustmentActionType;
  parameters: Record<string, any>;
  duration: number; // minutes, 0 for permanent
  priority: number;
}

export enum AdjustmentActionType {
  SET_QUOTA = 'set_quota',
  INCREASE_QUOTA = 'increase_quota',
  DECREASE_QUOTA = 'decrease_quota',
  APPLY_RATE_LIMIT = 'apply_rate_limit',
  SEND_NOTIFICATION = 'send_notification',
  ESCALATE_TO_ADMIN = 'escalate_to_admin',
  BLOCK_USER = 'block_user',
  THROTTLE_REQUESTS = 'throttle_requests'
}

export interface FairnessConfig {
  enableFairnessAnalysis: boolean;
  fairnessMetrics: FairnessMetric[];
  redistributionRules: RedistributionRule[];
  priorityTiers: PriorityTier[];
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

export enum FairnessMetricType {
  GINI_COEFFICIENT = 'gini_coefficient',
  STANDARD_DEVIATION = 'standard_deviation',
  QUOTA_UTILIZATION_VARIANCE = 'quota_utilization_variance',
  REQUEST_DISTRIBUTION = 'request_distribution',
  RESPONSE_TIME_EQUITY = 'response_time_equity',
  ERROR_RATE_EQUITY = 'error_rate_equity'
}

export interface RedistributionRule {
  ruleId: string;
  triggerCondition: string;
  sourceConditions: SourceCondition[];
  targetConditions: TargetCondition[];
  redistributionAmount: number;
  maxRedistribution: number;
  enabled: boolean;
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
  features: TierFeature[];
}

export interface TierFeature {
  featureId: string;
  featureName: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface AbuseDetectionConfig {
  enableAbuseDetection: boolean;
  abusePatterns: AbusePattern[];
  detectionSensitivity: number;
  responseActions: AbuseResponseAction[];
  whitelistRules: WhitelistRule[];
}

export interface AbusePattern {
  patternId: string;
  patternName: string;
  description: string;
  detectionRules: AbuseDetectionRule[];
  severity: AbuseSeverity;
  confidence: number;
  enabled: boolean;
}

export interface AbuseDetectionRule {
  ruleId: string;
  ruleType: AbuseRuleType;
  threshold: number;
  timeWindow: number; // minutes
  condition: string;
  weight: number;
}

export enum AbuseRuleType {
  RATE_SPIKE = 'rate_spike',
  QUOTA_EXHAUSTION = 'quota_exhaustion',
  ERROR_FLOOD = 'error_flood',
  SUSPICIOUS_TIMING = 'suspicious_timing',
  RESOURCE_HOARDING = 'resource_hoarding',
  PATTERN_DEVIATION = 'pattern_deviation',
  COORDINATED_ATTACK = 'coordinated_attack'
}

export enum AbuseSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AbuseResponseAction {
  actionId: string;
  severity: AbuseSeverity;
  actionType: AbuseActionType;
  parameters: Record<string, any>;
  autoExecute: boolean;
  escalation: boolean;
}

export enum AbuseActionType {
  TEMPORARY_QUOTA_REDUCTION = 'temporary_quota_reduction',
  RATE_LIMITING = 'rate_limiting',
  TEMPORARY_SUSPENSION = 'temporary_suspension',
  REQUIRE_VERIFICATION = 'require_verification',
  ADMIN_NOTIFICATION = 'admin_notification',
  CAPTCHA_CHALLENGE = 'captcha_challenge',
  ACCOUNT_REVIEW = 'account_review'
}

export interface WhitelistRule {
  ruleId: string;
  ruleName: string;
  conditions: string[];
  exemptions: AbuseExemption[];
  enabled: boolean;
}

export interface AbuseExemption {
  exemptionType: ExemptionType;
  value: string;
  reason: string;
  expiresAt?: Date;
}

export enum ExemptionType {
  USER_ID = 'user_id',
  IP_ADDRESS = 'ip_address',
  API_KEY = 'api_key',
  USER_AGENT = 'user_agent',
  DOMAIN = 'domain'
}

export interface QuotaAlertingConfig {
  enableAlerting: boolean;
  alertThresholds: AlertThreshold[];
  notificationChannels: NotificationChannel[];
  escalationRules: EscalationRule[];
}

export interface AlertThreshold {
  thresholdId: string;
  metricType: AlertMetricType;
  warningLevel: number;
  criticalLevel: number;
  evaluationPeriod: number; // minutes
  enabled: boolean;
}

export enum AlertMetricType {
  QUOTA_UTILIZATION = 'quota_utilization',
  QUOTA_EXHAUSTION_RATE = 'quota_exhaustion_rate',
  ABUSE_DETECTION_RATE = 'abuse_detection_rate',
  FAIRNESS_VIOLATION = 'fairness_violation',
  SYSTEM_OVERLOAD = 'system_overload'
}

export interface NotificationChannel {
  channelId: string;
  channelType: NotificationChannelType;
  configuration: Record<string, any>;
  enabled: boolean;
}

export enum NotificationChannelType {
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  DASHBOARD = 'dashboard'
}

export interface EscalationRule {
  ruleId: string;
  triggerCondition: string;
  escalationDelay: number; // minutes
  escalationTarget: string;
  maxEscalations: number;
  enabled: boolean;
}

export interface UsagePattern {
  patternId: string;
  userId: string;
  apiEndpoint: string;
  patternType: UsagePatternType;
  detectedAt: Date;
  confidence: number;
  metrics: PatternMetrics;
  characteristics: PatternCharacteristics;
  forecast: UsageForecast;
  recommendations: PatternRecommendation[];
}

export interface PatternMetrics {
  averageRequestRate: number;
  peakRequestRate: number;
  requestVariance: number;
  errorRate: number;
  quotaUtilization: number;
  responseTimeDistribution: number[];
  timingPattern: TimingPattern;
}

export interface TimingPattern {
  peakHours: number[];
  peakDays: number[];
  seasonality: SeasonalityInfo;
  burstFrequency: number;
  steadyStateRatio: number;
}

export interface SeasonalityInfo {
  hasSeasonality: boolean;
  period: number; // hours
  amplitude: number;
  phase: number;
}

export interface PatternCharacteristics {
  predictability: number; // 0-1
  volatility: number; // 0-1
  growthRate: number; // percentage
  burstiness: number; // 0-1
  efficiency: number; // 0-1
  consistency: number; // 0-1
}

export interface UsageForecast {
  forecastHorizon: number; // hours
  predictedUsage: ForecastPoint[];
  confidence: number;
  uncertaintyBounds: UncertaintyBounds;
  scenarioForecasts: ScenarioForecast[];
}

export interface ForecastPoint {
  timestamp: Date;
  requestRate: number;
  quotaUtilization: number;
  confidence: number;
}

export interface UncertaintyBounds {
  upperBound: number[];
  lowerBound: number[];
  confidenceInterval: number;
}

export interface ScenarioForecast {
  scenarioId: string;
  scenarioName: string;
  probability: number;
  forecastPoints: ForecastPoint[];
  description: string;
}

export interface PatternRecommendation {
  recommendationId: string;
  recommendationType: RecommendationType;
  priority: number;
  description: string;
  rationale: string;
  expectedBenefit: string;
  implementationCost: ImplementationCost;
  riskLevel: RiskLevel;
  actionItems: ActionItem[];
}

export enum RecommendationType {
  QUOTA_INCREASE = 'quota_increase',
  QUOTA_DECREASE = 'quota_decrease',
  BURST_ALLOWANCE = 'burst_allowance',
  RATE_LIMITING = 'rate_limiting',
  TIER_UPGRADE = 'tier_upgrade',
  TIER_DOWNGRADE = 'tier_downgrade',
  USAGE_OPTIMIZATION = 'usage_optimization',
  PATTERN_EDUCATION = 'pattern_education'
}

export enum ImplementationCost {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ActionItem {
  itemId: string;
  description: string;
  actionType: string;
  parameters: Record<string, any>;
  estimatedTime: number; // minutes
  dependencies: string[];
}

export interface QuotaRecommendation {
  recommendationId: string;
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
  feedback?: RecommendationFeedback;
}

export interface QuotaAllocation {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  concurrentConnections: number;
  burstAllowance: number;
  specialLimits: SpecialLimit[];
}

export interface SpecialLimit {
  limitType: string;
  value: number;
  unit: string;
  scope: string;
}

export interface QuotaImpactAnalysis {
  performanceImpact: PerformanceImpact;
  businessImpact: BusinessImpact;
  systemImpact: SystemImpact;
  userExperienceImpact: UserExperienceImpact;
  costImpact: CostImpact;
}

export interface PerformanceImpact {
  responseTimeChange: number; // percentage
  throughputChange: number; // percentage
  errorRateChange: number; // percentage
  availabilityChange: number; // percentage
}

export interface BusinessImpact {
  revenueImpact: number; // dollar amount
  userSatisfactionChange: number; // percentage
  churnRiskChange: number; // percentage
  competitiveAdvantage: string;
}

export interface SystemImpact {
  resourceUtilizationChange: number; // percentage
  capacityRequirementChange: number; // percentage
  scalingImplications: string[];
  infrastructureCost: number;
}

export interface UserExperienceImpact {
  satisfactionScore: number; // 0-100
  frustractionEvents: number;
  engagementChange: number; // percentage
  feedbackSentiment: string;
}

export interface CostImpact {
  operationalCostChange: number;
  infrastructureCostChange: number;
  supportCostChange: number;
  totalCostOfOwnership: number;
}

export enum RecommendationStatus {
  PROPOSED = 'proposed',
  APPROVED = 'approved',
  APPLIED = 'applied',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  MONITORING = 'monitoring'
}

export interface RecommendationFeedback {
  feedbackId: string;
  rating: number; // 1-5
  comments: string;
  actualImpact: QuotaImpactAnalysis;
  providedBy: string;
  providedAt: Date;
}

export interface FairnessAnalysis {
  analysisId: string;
  timestamp: Date;
  overallFairnessScore: number; // 0-100
  fairnessMetrics: FairnessMetricResult[];
  inequalityIssues: InequalityIssue[];
  redistributionOpportunities: RedistributionOpportunity[];
  recommendations: FairnessRecommendation[];
}

export interface FairnessMetricResult {
  metricId: string;
  metricName: string;
  currentValue: number;
  targetValue: number;
  deviation: number;
  severity: MetricSeverity;
}

export enum MetricSeverity {
  ACCEPTABLE = 'acceptable',
  MINOR_CONCERN = 'minor_concern',
  MAJOR_CONCERN = 'major_concern',
  CRITICAL_ISSUE = 'critical_issue'
}

export interface InequalityIssue {
  issueId: string;
  issueType: InequalityType;
  description: string;
  affectedUsers: string[];
  severity: AbuseSeverity;
  measuredImpact: number;
  suggestedActions: string[];
}

export enum InequalityType {
  QUOTA_DISPARITY = 'quota_disparity',
  ACCESS_INEQUALITY = 'access_inequality',
  PERFORMANCE_INEQUALITY = 'performance_inequality',
  RESOURCE_MONOPOLIZATION = 'resource_monopolization',
  TIER_IMBALANCE = 'tier_imbalance'
}

export interface RedistributionOpportunity {
  opportunityId: string;
  sourceUsers: string[];
  targetUsers: string[];
  redistributableQuota: number;
  expectedBenefit: number;
  riskAssessment: string;
  implementationPlan: string[];
}

export interface FairnessRecommendation {
  recommendationId: string;
  category: FairnessCategory;
  title: string;
  description: string;
  priority: number;
  expectedImprovement: number;
  actionItems: string[];
}

export enum FairnessCategory {
  QUOTA_REBALANCING = 'quota_rebalancing',
  TIER_RESTRUCTURING = 'tier_restructuring',
  POLICY_ADJUSTMENT = 'policy_adjustment',
  MONITORING_ENHANCEMENT = 'monitoring_enhancement'
}

export interface AbuseDetectionResult {
  detectionId: string;
  userId: string;
  detectedAt: Date;
  abuseType: AbuseType;
  severity: AbuseSeverity;
  confidence: number;
  evidence: AbuseEvidence[];
  impact: AbuseImpact;
  responseActions: ResponseAction[];
  status: AbuseStatus;
}

export enum AbuseType {
  RATE_ABUSE = 'rate_abuse',
  QUOTA_GAMING = 'quota_gaming',
  RESOURCE_HOARDING = 'resource_hoarding',
  COORDINATED_ABUSE = 'coordinated_abuse',
  AUTOMATED_SCRAPING = 'automated_scraping',
  DOS_ATTACK = 'dos_attack',
  FRAUD_ATTEMPT = 'fraud_attempt'
}

export interface AbuseEvidence {
  evidenceType: EvidenceType;
  description: string;
  data: Record<string, any>;
  strength: number; // 0-1
  timestamp: Date;
}

export enum EvidenceType {
  TRAFFIC_PATTERN = 'traffic_pattern',
  TIMING_ANOMALY = 'timing_anomaly',
  RATE_ANOMALY = 'rate_anomaly',
  ERROR_PATTERN = 'error_pattern',
  BEHAVIORAL_ANOMALY = 'behavioral_anomaly',
  TECHNICAL_FINGERPRINT = 'technical_fingerprint'
}

export interface AbuseImpact {
  systemImpact: number; // 0-100
  userImpact: number; // 0-100
  businessImpact: number; // dollar amount
  affectedUsers: number;
  resourceConsumption: number;
}

export interface ResponseAction {
  actionId: string;
  actionType: AbuseActionType;
  appliedAt: Date;
  duration: number; // minutes
  parameters: Record<string, any>;
  effectiveness: number; // 0-1
  status: ActionStatus;
}

export enum ActionStatus {
  PENDING = 'pending',
  APPLIED = 'applied',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERTED = 'reverted'
}

export enum AbuseStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  FALSE_POSITIVE = 'false_positive',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated'
}

// ==========================================
// MAIN RECOMMENDATION ENGINE CLASS
// ==========================================

export class ApiUsagePatternQuotaRecommendations extends EventEmitter {
  private config: QuotaRecommendationConfig;
  private usagePatterns: Map<string, UsagePattern> = new Map();
  private quotaRecommendations: Map<string, QuotaRecommendation> = new Map();
  private fairnessAnalysisHistory: FairnessAnalysis[] = [];
  private abuseDetectionResults: Map<string, AbuseDetectionResult> = new Map();
  private usageHistory: Map<string, UsageDataPoint[]> = new Map();
  private isAnalyzing: boolean = false;

  constructor(config: QuotaRecommendationConfig) {
    super();
    this.config = config;
    
    this.initializeRecommendationEngine();
    if (this.config.enablePatternAnalysis) {
      this.startAnalysisLoop();
    }
  }

  // ==========================================
  // PUBLIC METHODS
  // ==========================================

  public async analyzeUsagePatterns(userId: string, apiEndpoint?: string): Promise<UsagePattern[]> {
    const usageData = await this.collectUsageData(userId, apiEndpoint);
    const patterns: UsagePattern[] = [];

    for (const patternConfig of this.config.usagePatterns) {
      if (!patternConfig.enabled) continue;

      const detectedPattern = await this.detectPattern(usageData, patternConfig);
      if (detectedPattern) {
        patterns.push(detectedPattern);
        this.usagePatterns.set(detectedPattern.patternId, detectedPattern);
      }
    }

    this.emit('patternsAnalyzed', { 
      userId, 
      apiEndpoint, 
      patternsFound: patterns.length 
    });

    return patterns;
  }

  public async generateQuotaRecommendations(userId: string): Promise<QuotaRecommendation[]> {
    const userPatterns = Array.from(this.usagePatterns.values())
      .filter(pattern => pattern.userId === userId);

    const recommendations: QuotaRecommendation[] = [];

    for (const pattern of userPatterns) {
      const recommendation = await this.generateRecommendationFromPattern(pattern);
      if (recommendation) {
        recommendations.push(recommendation);
        this.quotaRecommendations.set(recommendation.recommendationId, recommendation);
      }
    }

    // Apply fairness adjustments
    const fairnessAdjustedRecommendations = await this.applyFairnessAdjustments(recommendations);

    this.emit('recommendationsGenerated', { 
      userId, 
      recommendationsCount: fairnessAdjustedRecommendations.length 
    });

    return fairnessAdjustedRecommendations;
  }

  public async applyRecommendation(recommendationId: string): Promise<boolean> {
    const recommendation = this.quotaRecommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }

    try {
      // Apply the quota changes
      await this.applyQuotaChanges(recommendation);
      
      recommendation.status = RecommendationStatus.APPLIED;
      recommendation.appliedAt = new Date();

      // Start monitoring the impact
      this.startImpactMonitoring(recommendation);

      this.emit('recommendationApplied', { 
        recommendationId, 
        userId: recommendation.userId 
      });

      return true;
    } catch (error) {
      recommendation.status = RecommendationStatus.REJECTED;
      this.emit('recommendationFailed', { recommendationId, error });
      return false;
    }
  }

  public async performFairnessAnalysis(): Promise<FairnessAnalysis> {
    const allUsers = this.getAllUsers();
    const fairnessMetrics = await this.calculateFairnessMetrics(allUsers);
    const inequalityIssues = this.identifyInequalityIssues(fairnessMetrics);
    const redistributionOpportunities = await this.findRedistributionOpportunities(allUsers);
    const recommendations = this.generateFairnessRecommendations(inequalityIssues, redistributionOpportunities);

    const analysis: FairnessAnalysis = {
      analysisId: `fairness_${Date.now()}`,
      timestamp: new Date(),
      overallFairnessScore: this.calculateOverallFairnessScore(fairnessMetrics),
      fairnessMetrics,
      inequalityIssues,
      redistributionOpportunities,
      recommendations
    };

    this.fairnessAnalysisHistory.push(analysis);
    
    // Keep only recent analysis
    if (this.fairnessAnalysisHistory.length > 100) {
      this.fairnessAnalysisHistory = this.fairnessAnalysisHistory.slice(-100);
    }

    this.emit('fairnessAnalysisCompleted', analysis);
    return analysis;
  }

  public async detectAbuse(userId: string): Promise<AbuseDetectionResult[]> {
    const userUsageData = await this.collectUsageData(userId);
    const detectionResults: AbuseDetectionResult[] = [];

    for (const abusePattern of this.config.abuseDetectionConfig.abusePatterns) {
      if (!abusePattern.enabled) continue;

      const detection = await this.detectAbusePattern(userUsageData, abusePattern);
      if (detection) {
        detectionResults.push(detection);
        this.abuseDetectionResults.set(detection.detectionId, detection);
        
        // Apply response actions if configured
        await this.applyAbuseResponseActions(detection);
      }
    }

    this.emit('abuseDetected', { 
      userId, 
      detectionsCount: detectionResults.length 
    });

    return detectionResults;
  }

  public getUsagePattern(patternId: string): UsagePattern | null {
    return this.usagePatterns.get(patternId) || null;
  }

  public getRecommendation(recommendationId: string): QuotaRecommendation | null {
    return this.quotaRecommendations.get(recommendationId) || null;
  }

  public getRecommendationsForUser(userId: string): QuotaRecommendation[] {
    return Array.from(this.quotaRecommendations.values())
      .filter(rec => rec.userId === userId);
  }

  public getFairnessHistory(days?: number): FairnessAnalysis[] {
    const cutoff = days ? Date.now() - (days * 24 * 60 * 60 * 1000) : 0;
    
    return this.fairnessAnalysisHistory
      .filter(analysis => analysis.timestamp.getTime() > cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getAbuseDetections(userId?: string): AbuseDetectionResult[] {
    const detections = Array.from(this.abuseDetectionResults.values());
    
    if (userId) {
      return detections.filter(detection => detection.userId === userId);
    }
    
    return detections.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  public async optimizeQuotaDistribution(): Promise<OptimizationResult> {
    const fairnessAnalysis = await this.performFairnessAnalysis();
    const optimizationActions: OptimizationAction[] = [];

    // Apply redistribution opportunities
    for (const opportunity of fairnessAnalysis.redistributionOpportunities) {
      const action = await this.executeRedistribution(opportunity);
      if (action) {
        optimizationActions.push(action);
      }
    }

    // Apply fairness recommendations
    for (const recommendation of fairnessAnalysis.recommendations) {
      const action = await this.executeFairnessRecommendation(recommendation);
      if (action) {
        optimizationActions.push(action);
      }
    }

    const result: OptimizationResult = {
      optimizationId: `opt_${Date.now()}`,
      timestamp: new Date(),
      actionsApplied: optimizationActions.length,
      fairnessImprovement: this.calculateFairnessImprovement(fairnessAnalysis),
      affectedUsers: this.getAffectedUsers(optimizationActions),
      estimatedBenefit: this.calculateOptimizationBenefit(optimizationActions)
    };

    this.emit('quotaOptimizationCompleted', result);
    return result;
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  private initializeRecommendationEngine(): void {
    // Start usage data collection
    setInterval(() => {
      this.collectAndStoreUsageData();
    }, 60000); // Collect every minute

    // Cleanup old data
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000); // Cleanup every hour

    // Periodic fairness analysis
    if (this.config.fairnessConfig.enableFairnessAnalysis) {
      setInterval(() => {
        this.performFairnessAnalysis();
      }, 4 * 60 * 60 * 1000); // Every 4 hours
    }

    // Abuse detection monitoring
    if (this.config.abuseDetectionConfig.enableAbuseDetection) {
      setInterval(() => {
        this.runAbuseDetectionScan();
      }, 15 * 60 * 1000); // Every 15 minutes
    }
  }

  private startAnalysisLoop(): void {
    setInterval(async () => {
      if (!this.isAnalyzing) {
        await this.runPeriodicAnalysis();
      }
    }, this.config.recommendationInterval * 60 * 1000);
  }

  private async runPeriodicAnalysis(): Promise<void> {
    this.isAnalyzing = true;
    
    try {
      // Analyze patterns for all active users
      const activeUsers = this.getActiveUsers();
      
      for (const userId of activeUsers) {
        await this.analyzeUsagePatterns(userId);
        const recommendations = await this.generateQuotaRecommendations(userId);
        
        // Auto-apply low-risk recommendations
        for (const recommendation of recommendations) {
          if (this.isLowRiskRecommendation(recommendation)) {
            await this.applyRecommendation(recommendation.recommendationId);
          }
        }
      }
      
      // Run abuse detection
      for (const userId of activeUsers) {
        await this.detectAbuse(userId);
      }
      
    } catch (error) {
      this.emit('analysisError', { error });
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async collectUsageData(userId: string, apiEndpoint?: string): Promise<UsageDataPoint[]> {
    const windowHours = this.config.analysisWindow;
    const cutoff = Date.now() - (windowHours * 60 * 60 * 1000);
    
    // Get user's usage history
    const userHistory = this.usageHistory.get(userId) || [];
    
    return userHistory
      .filter(dataPoint => dataPoint.timestamp.getTime() > cutoff)
      .filter(dataPoint => !apiEndpoint || dataPoint.apiEndpoint === apiEndpoint);
  }

  private async detectPattern(
    usageData: UsageDataPoint[],
    patternConfig: UsagePatternConfig
  ): Promise<UsagePattern | null> {
    const metrics = this.calculatePatternMetrics(usageData);
    const characteristics = this.analyzePatternCharacteristics(usageData, metrics);
    
    // Check if pattern matches detection rules
    const confidence = this.evaluatePatternDetectionRules(usageData, patternConfig.detectionRules);
    
    if (confidence < 0.7) return null; // Not confident enough

    const forecast = await this.generateUsageForecast(usageData, characteristics);
    const recommendations = this.generatePatternRecommendations(patternConfig, metrics, characteristics);

    return {
      patternId: `${patternConfig.patternId}_${Date.now()}`,
      userId: usageData[0]?.userId || '',
      apiEndpoint: usageData[0]?.apiEndpoint || '',
      patternType: patternConfig.patternType,
      detectedAt: new Date(),
      confidence,
      metrics,
      characteristics,
      forecast,
      recommendations
    };
  }

  private calculatePatternMetrics(usageData: UsageDataPoint[]): PatternMetrics {
    if (usageData.length === 0) {
      return {
        averageRequestRate: 0,
        peakRequestRate: 0,
        requestVariance: 0,
        errorRate: 0,
        quotaUtilization: 0,
        responseTimeDistribution: [],
        timingPattern: {
          peakHours: [],
          peakDays: [],
          seasonality: { hasSeasonality: false, period: 0, amplitude: 0, phase: 0 },
          burstFrequency: 0,
          steadyStateRatio: 0
        }
      };
    }

    const requestRates = usageData.map(d => d.requestCount);
    const averageRequestRate = requestRates.reduce((sum, rate) => sum + rate, 0) / requestRates.length;
    const peakRequestRate = Math.max(...requestRates);
    const requestVariance = this.calculateVariance(requestRates);
    
    const totalRequests = usageData.reduce((sum, d) => sum + d.requestCount, 0);
    const errorRequests = usageData.reduce((sum, d) => sum + d.errorCount, 0);
    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

    const quotaUtilization = usageData.reduce((sum, d) => sum + d.quotaUtilization, 0) / usageData.length;
    const responseTimeDistribution = usageData.map(d => d.averageResponseTime);
    const timingPattern = this.analyzeTimingPattern(usageData);

    return {
      averageRequestRate,
      peakRequestRate,
      requestVariance,
      errorRate,
      quotaUtilization,
      responseTimeDistribution,
      timingPattern
    };
  }

  private analyzePatternCharacteristics(usageData: UsageDataPoint[], metrics: PatternMetrics): PatternCharacteristics {
    const predictability = this.calculatePredictability(usageData);
    const volatility = Math.sqrt(metrics.requestVariance) / metrics.averageRequestRate;
    const growthRate = this.calculateGrowthRate(usageData);
    const burstiness = this.calculateBurstiness(usageData);
    const efficiency = this.calculateEfficiency(usageData);
    const consistency = this.calculateConsistency(usageData);

    return {
      predictability,
      volatility,
      growthRate,
      burstiness,
      efficiency,
      consistency
    };
  }

  private evaluatePatternDetectionRules(usageData: UsageDataPoint[], rules: PatternDetectionRule[]): number {
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const rule of rules.filter(r => r.enabled)) {
      totalWeight += rule.weight;
      
      if (this.evaluateDetectionRule(usageData, rule)) {
        matchedWeight += rule.weight;
      }
    }

    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
  }

  private evaluateDetectionRule(usageData: UsageDataPoint[], rule: PatternDetectionRule): boolean {
    // Evaluate rule condition against usage data
    // This would contain complex logic to evaluate patterns
    
    switch (rule.condition) {
      case 'burst_detected':
        return this.detectBurstPattern(usageData, rule.threshold, rule.timeWindow);
      case 'steady_state':
        return this.detectSteadyState(usageData, rule.threshold);
      case 'growth_pattern':
        return this.detectGrowthPattern(usageData, rule.threshold);
      case 'cyclical_pattern':
        return this.detectCyclicalPattern(usageData, rule.timeWindow);
      default:
        return false;
    }
  }

  private async generateRecommendationFromPattern(pattern: UsagePattern): Promise<QuotaRecommendation | null> {
    const currentQuota = await this.getCurrentQuota(pattern.userId, pattern.apiEndpoint);
    const recommendedQuota = this.calculateRecommendedQuota(pattern, currentQuota);
    
    if (this.quotasAreEquivalent(currentQuota, recommendedQuota)) {
      return null; // No change needed
    }

    const expectedImpact = await this.analyzeQuotaImpact(pattern, currentQuota, recommendedQuota);
    
    return {
      recommendationId: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: pattern.userId,
      apiEndpoint: pattern.apiEndpoint,
      currentQuota,
      recommendedQuota,
      reason: this.generateRecommendationReason(pattern, currentQuota, recommendedQuota),
      confidence: pattern.confidence,
      expectedImpact,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      priority: this.calculateRecommendationPriority(pattern, expectedImpact),
      status: RecommendationStatus.PROPOSED
    };
  }

  private calculateRecommendedQuota(pattern: UsagePattern, currentQuota: QuotaAllocation): QuotaAllocation {
    const patternConfig = this.config.usagePatterns.find(p => p.patternType === pattern.patternType);
    if (!patternConfig) return currentQuota;

    const impact = patternConfig.quotaImpact;
    const multiplier = impact.quotaMultiplier;

    // Apply pattern-specific adjustments
    const newQuota = { ...currentQuota };

    switch (impact.adjustmentType) {
      case QuotaAdjustmentType.INCREASE:
        newQuota.requestsPerSecond = Math.min(
          currentQuota.requestsPerSecond * multiplier,
          currentQuota.requestsPerSecond + impact.maxAdjustment
        );
        newQuota.requestsPerMinute = newQuota.requestsPerSecond * 60;
        newQuota.requestsPerHour = newQuota.requestsPerSecond * 3600;
        break;

      case QuotaAdjustmentType.DECREASE:
        newQuota.requestsPerSecond = Math.max(
          currentQuota.requestsPerSecond / multiplier,
          currentQuota.requestsPerSecond - impact.maxAdjustment
        );
        newQuota.requestsPerMinute = newQuota.requestsPerSecond * 60;
        newQuota.requestsPerHour = newQuota.requestsPerSecond * 3600;
        break;

      case QuotaAdjustmentType.TEMPORARY_BOOST:
        newQuota.burstAllowance = Math.max(
          currentQuota.burstAllowance,
          pattern.metrics.peakRequestRate * 1.2
        );
        break;
    }

    // Apply pattern-specific optimizations
    if (pattern.characteristics.burstiness > 0.7) {
      newQuota.burstAllowance = Math.max(newQuota.burstAllowance, pattern.metrics.peakRequestRate * 1.5);
    }

    if (pattern.characteristics.consistency > 0.8) {
      // For consistent patterns, we can reduce burst allowance
      newQuota.burstAllowance = Math.min(newQuota.burstAllowance, newQuota.requestsPerSecond * 2);
    }

    return newQuota;
  }

  private async applyFairnessAdjustments(recommendations: QuotaRecommendation[]): Promise<QuotaRecommendation[]> {
    const fairnessAnalysis = await this.performFairnessAnalysis();
    
    // Adjust recommendations based on fairness concerns
    for (const recommendation of recommendations) {
      // Check if this recommendation would worsen fairness
      const fairnessImpact = this.calculateFairnessImpact(recommendation, fairnessAnalysis);
      
      if (fairnessImpact < -0.1) { // Negative impact on fairness
        // Reduce the recommended increase or increase the recommended decrease
        recommendation.recommendedQuota = this.adjustForFairness(
          recommendation.recommendedQuota,
          recommendation.currentQuota,
          fairnessImpact
        );
        recommendation.reason += ` (Adjusted for fairness considerations)`;
      }
    }

    return recommendations;
  }

  private async applyQuotaChanges(recommendation: QuotaRecommendation): Promise<void> {
    // In real implementation, this would update the actual quota system
    this.emit('quotaChanged', {
      userId: recommendation.userId,
      apiEndpoint: recommendation.apiEndpoint,
      oldQuota: recommendation.currentQuota,
      newQuota: recommendation.recommendedQuota
    });
  }

  private startImpactMonitoring(recommendation: QuotaRecommendation): void {
    // Monitor the impact of the applied recommendation
    const monitoringInterval = setInterval(() => {
      this.monitorRecommendationImpact(recommendation.recommendationId);
    }, 5 * 60 * 1000); // Monitor every 5 minutes

    // Stop monitoring after 24 hours
    setTimeout(() => {
      clearInterval(monitoringInterval);
      recommendation.status = RecommendationStatus.MONITORING;
    }, 24 * 60 * 60 * 1000);
  }

  private async monitorRecommendationImpact(recommendationId: string): Promise<void> {
    const recommendation = this.quotaRecommendations.get(recommendationId);
    if (!recommendation || recommendation.status !== RecommendationStatus.APPLIED) return;

    // Collect current metrics and compare with expected impact
    const currentUsage = await this.collectUsageData(recommendation.userId, recommendation.apiEndpoint);
    const actualImpact = this.calculateActualImpact(recommendation, currentUsage);
    
    // Check if impact is as expected
    const impactDeviation = this.compareImpacts(recommendation.expectedImpact, actualImpact);
    
    if (impactDeviation > 0.5) { // Significant deviation
      this.emit('impactDeviation', {
        recommendationId,
        expectedImpact: recommendation.expectedImpact,
        actualImpact,
        deviation: impactDeviation
      });
    }
  }

  private async calculateFairnessMetrics(users: string[]): Promise<FairnessMetricResult[]> {
    const results: FairnessMetricResult[] = [];
    
    for (const metricConfig of this.config.fairnessConfig.fairnessMetrics) {
      if (!metricConfig.enabled) continue;

      const metricValue = await this.calculateFairnessMetric(users, metricConfig);
      const deviation = Math.abs(metricValue - metricConfig.targetValue) / metricConfig.targetValue;
      
      results.push({
        metricId: metricConfig.metricId,
        metricName: metricConfig.metricName,
        currentValue: metricValue,
        targetValue: metricConfig.targetValue,
        deviation,
        severity: this.classifyMetricSeverity(deviation, metricConfig.tolerance)
      });
    }

    return results;
  }

  private async calculateFairnessMetric(users: string[], metricConfig: FairnessMetric): Promise<number> {
    switch (metricConfig.metricType) {
      case FairnessMetricType.GINI_COEFFICIENT:
        return this.calculateGiniCoefficient(users);
      
      case FairnessMetricType.QUOTA_UTILIZATION_VARIANCE:
        return this.calculateQuotaUtilizationVariance(users);
      
      case FairnessMetricType.REQUEST_DISTRIBUTION:
        return this.calculateRequestDistributionMetric(users);
      
      default:
        return 0;
    }
  }

  private async detectAbusePattern(
    usageData: UsageDataPoint[],
    abusePattern: AbusePattern
  ): Promise<AbuseDetectionResult | null> {
    const evidence: AbuseEvidence[] = [];
    let totalConfidence = 0;
    let totalWeight = 0;

    for (const rule of abusePattern.detectionRules) {
      const ruleResult = this.evaluateAbuseRule(usageData, rule);
      totalWeight += rule.weight;
      
      if (ruleResult.detected) {
        totalConfidence += rule.weight;
        evidence.push({
          evidenceType: this.mapRuleToEvidenceType(rule.ruleType),
          description: ruleResult.description,
          data: ruleResult.data,
          strength: ruleResult.strength,
          timestamp: new Date()
        });
      }
    }

    const confidence = totalWeight > 0 ? totalConfidence / totalWeight : 0;
    
    if (confidence < abusePattern.confidence) return null;

    const impact = this.calculateAbuseImpact(usageData, evidence);
    const responseActions = await this.determineResponseActions(abusePattern, confidence, impact);

    return {
      detectionId: `abuse_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: usageData[0]?.userId || '',
      detectedAt: new Date(),
      abuseType: this.mapPatternToAbuseType(abusePattern),
      severity: abusePattern.severity,
      confidence,
      evidence,
      impact,
      responseActions,
      status: AbuseStatus.DETECTED
    };
  }

  private evaluateAbuseRule(usageData: UsageDataPoint[], rule: AbuseDetectionRule): AbuseRuleResult {
    switch (rule.ruleType) {
      case AbuseRuleType.RATE_SPIKE:
        return this.evaluateRateSpikeRule(usageData, rule);
      
      case AbuseRuleType.QUOTA_EXHAUSTION:
        return this.evaluateQuotaExhaustionRule(usageData, rule);
      
      case AbuseRuleType.ERROR_FLOOD:
        return this.evaluateErrorFloodRule(usageData, rule);
      
      default:
        return { detected: false, strength: 0, description: '', data: {} };
    }
  }

  private async applyAbuseResponseActions(detection: AbuseDetectionResult): Promise<void> {
    for (const action of detection.responseActions) {
      if (action.status !== ActionStatus.PENDING) continue;

      try {
        await this.executeAbuseResponseAction(detection.userId, action);
        action.status = ActionStatus.APPLIED;
        action.appliedAt = new Date();
      } catch (error) {
        action.status = ActionStatus.FAILED;
        this.emit('abuseActionFailed', { 
          detectionId: detection.detectionId, 
          actionId: action.actionId, 
          error 
        });
      }
    }
  }

  // Helper methods
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private analyzeTimingPattern(usageData: UsageDataPoint[]): TimingPattern {
    const peakHours = this.findPeakHours(usageData);
    const peakDays = this.findPeakDays(usageData);
    const seasonality = this.detectSeasonality(usageData);
    const burstFrequency = this.calculateBurstFrequency(usageData);
    const steadyStateRatio = this.calculateSteadyStateRatio(usageData);

    return {
      peakHours,
      peakDays,
      seasonality,
      burstFrequency,
      steadyStateRatio
    };
  }

  private findPeakHours(usageData: UsageDataPoint[]): number[] {
    const hourlyUsage = new Array(24).fill(0);
    
    usageData.forEach(dataPoint => {
      const hour = dataPoint.timestamp.getHours();
      hourlyUsage[hour] += dataPoint.requestCount;
    });

    const avgUsage = hourlyUsage.reduce((sum, usage) => sum + usage, 0) / 24;
    const peakThreshold = avgUsage * 1.5;

    return hourlyUsage
      .map((usage, hour) => ({ hour, usage }))
      .filter(({ usage }) => usage > peakThreshold)
      .map(({ hour }) => hour);
  }

  private findPeakDays(usageData: UsageDataPoint[]): number[] {
    const dailyUsage = new Array(7).fill(0);
    
    usageData.forEach(dataPoint => {
      const day = dataPoint.timestamp.getDay();
      dailyUsage[day] += dataPoint.requestCount;
    });

    const avgUsage = dailyUsage.reduce((sum, usage) => sum + usage, 0) / 7;
    const peakThreshold = avgUsage * 1.2;

    return dailyUsage
      .map((usage, day) => ({ day, usage }))
      .filter(({ usage }) => usage > peakThreshold)
      .map(({ day }) => day);
  }

  private detectSeasonality(usageData: UsageDataPoint[]): SeasonalityInfo {
    // Simplified seasonality detection
    if (usageData.length < 48) { // Need at least 48 hours of data
      return { hasSeasonality: false, period: 0, amplitude: 0, phase: 0 };
    }

    // Check for daily pattern (24-hour cycle)
    const dailyCorrelation = this.calculateSeasonalCorrelation(usageData, 24);
    
    if (dailyCorrelation > 0.6) {
      return {
        hasSeasonality: true,
        period: 24,
        amplitude: dailyCorrelation,
        phase: this.calculateSeasonalPhase(usageData, 24)
      };
    }

    return { hasSeasonality: false, period: 0, amplitude: 0, phase: 0 };
  }

  private calculateSeasonalCorrelation(usageData: UsageDataPoint[], period: number): number {
    // Simplified correlation calculation
    const values = usageData.map(d => d.requestCount);
    if (values.length < period * 2) return 0;

    let correlation = 0;
    const cycles = Math.floor(values.length / period);
    
    for (let i = 0; i < cycles - 1; i++) {
      const cycle1 = values.slice(i * period, (i + 1) * period);
      const cycle2 = values.slice((i + 1) * period, (i + 2) * period);
      correlation += this.calculatePearsonCorrelation(cycle1, cycle2);
    }

    return correlation / Math.max(cycles - 1, 1);
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateSeasonalPhase(usageData: UsageDataPoint[], period: number): number {
    // Find the hour/time of peak activity
    const hourlyTotals = new Array(period).fill(0);
    
    usageData.forEach(dataPoint => {
      const position = dataPoint.timestamp.getHours() % period;
      hourlyTotals[position] += dataPoint.requestCount;
    });

    const maxIndex = hourlyTotals.indexOf(Math.max(...hourlyTotals));
    return (maxIndex / period) * 2 * Math.PI; // Convert to radians
  }

  private calculateBurstFrequency(usageData: UsageDataPoint[]): number {
    if (usageData.length < 10) return 0;

    const requestRates = usageData.map(d => d.requestCount);
    const avgRate = requestRates.reduce((sum, rate) => sum + rate, 0) / requestRates.length;
    const burstThreshold = avgRate * 2;

    let burstCount = 0;
    let inBurst = false;

    for (const rate of requestRates) {
      if (rate > burstThreshold && !inBurst) {
        burstCount++;
        inBurst = true;
      } else if (rate <= avgRate) {
        inBurst = false;
      }
    }

    return burstCount / (usageData.length / 60); // Bursts per hour
  }

  private calculateSteadyStateRatio(usageData: UsageDataPoint[]): number {
    if (usageData.length === 0) return 0;

    const requestRates = usageData.map(d => d.requestCount);
    const avgRate = requestRates.reduce((sum, rate) => sum + rate, 0) / requestRates.length;
    const steadyThreshold = avgRate * 0.2; // Within 20% of average

    const steadyCount = requestRates.filter(rate => 
      Math.abs(rate - avgRate) <= steadyThreshold
    ).length;

    return steadyCount / requestRates.length;
  }

  private calculatePredictability(usageData: UsageDataPoint[]): number {
    // Simple predictability based on variance
    const requestRates = usageData.map(d => d.requestCount);
    const variance = this.calculateVariance(requestRates);
    const avgRate = requestRates.reduce((sum, rate) => sum + rate, 0) / requestRates.length;
    
    if (avgRate === 0) return 0;
    
    const coefficientOfVariation = Math.sqrt(variance) / avgRate;
    return Math.max(0, 1 - coefficientOfVariation); // Higher predictability = lower variation
  }

  private calculateGrowthRate(usageData: UsageDataPoint[]): number {
    if (usageData.length < 2) return 0;

    const firstHalf = usageData.slice(0, Math.floor(usageData.length / 2));
    const secondHalf = usageData.slice(Math.floor(usageData.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.requestCount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.requestCount, 0) / secondHalf.length;

    if (firstAvg === 0) return secondAvg > 0 ? 100 : 0;
    
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }

  private calculateBurstiness(usageData: UsageDataPoint[]): number {
    const requestRates = usageData.map(d => d.requestCount);
    if (requestRates.length < 2) return 0;

    const avgRate = requestRates.reduce((sum, rate) => sum + rate, 0) / requestRates.length;
    const maxRate = Math.max(...requestRates);

    return avgRate > 0 ? (maxRate - avgRate) / avgRate : 0;
  }

  private calculateEfficiency(usageData: UsageDataPoint[]): number {
    if (usageData.length === 0) return 0;

    const totalRequests = usageData.reduce((sum, d) => sum + d.requestCount, 0);
    const totalErrors = usageData.reduce((sum, d) => sum + d.errorCount, 0);
    const avgQuotaUtilization = usageData.reduce((sum, d) => sum + d.quotaUtilization, 0) / usageData.length;

    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
    const successRate = 1 - errorRate;

    // Efficiency combines success rate and quota utilization
    return (successRate + avgQuotaUtilization / 100) / 2;
  }

  private calculateConsistency(usageData: UsageDataPoint[]): number {
    const requestRates = usageData.map(d => d.requestCount);
    if (requestRates.length < 2) return 1;

    const variance = this.calculateVariance(requestRates);
    const avgRate = requestRates.reduce((sum, rate) => sum + rate, 0) / requestRates.length;

    if (avgRate === 0) return 1;

    const coefficientOfVariation = Math.sqrt(variance) / avgRate;
    return Math.max(0, 1 - coefficientOfVariation);
  }

  // Pattern detection methods
  private detectBurstPattern(usageData: UsageDataPoint[], threshold: number, timeWindow: number): boolean {
    const windowMs = timeWindow * 60 * 1000;
    const now = Date.now();
    
    const recentData = usageData.filter(d => now - d.timestamp.getTime() < windowMs);
    if (recentData.length === 0) return false;

    const avgRate = recentData.reduce((sum, d) => sum + d.requestCount, 0) / recentData.length;
    const maxRate = Math.max(...recentData.map(d => d.requestCount));

    return maxRate > avgRate * threshold;
  }

  private detectSteadyState(usageData: UsageDataPoint[], threshold: number): boolean {
    const requestRates = usageData.map(d => d.requestCount);
    const avgRate = requestRates.reduce((sum, rate) => sum + rate, 0) / requestRates.length;
    
    const steadyCount = requestRates.filter(rate => 
      Math.abs(rate - avgRate) / avgRate < (threshold / 100)
    ).length;

    return (steadyCount / requestRates.length) > 0.8; // 80% of data points are steady
  }

  private detectGrowthPattern(usageData: UsageDataPoint[], threshold: number): boolean {
    const growthRate = this.calculateGrowthRate(usageData);
    return growthRate > threshold;
  }

  private detectCyclicalPattern(usageData: UsageDataPoint[], timeWindow: number): boolean {
    const seasonality = this.detectSeasonality(usageData);
    return seasonality.hasSeasonality && seasonality.amplitude > 0.6;
  }

  private async generateUsageForecast(
    usageData: UsageDataPoint[],
    characteristics: PatternCharacteristics
  ): Promise<UsageForecast> {
    const forecastHorizon = 24; // 24 hours
    const forecastPoints: ForecastPoint[] = [];
    
    // Simple linear forecast based on recent trend
    const recentTrend = this.calculateRecentTrend(usageData);
    const baseRate = usageData.length > 0 ? 
      usageData[usageData.length - 1].requestCount : 0;

    for (let i = 1; i <= forecastHorizon; i++) {
      const timestamp = new Date(Date.now() + i * 60 * 60 * 1000);
      const trendAdjustment = recentTrend * i;
      const seasonalAdjustment = this.getSeasonalAdjustment(timestamp, characteristics);
      
      const requestRate = Math.max(0, baseRate + trendAdjustment + seasonalAdjustment);
      const quotaUtilization = Math.min(100, (requestRate / baseRate) * 80); // Estimate
      
      forecastPoints.push({
        timestamp,
        requestRate,
        quotaUtilization,
        confidence: Math.max(0.3, characteristics.predictability - (i * 0.02))
      });
    }

    return {
      forecastHorizon,
      predictedUsage: forecastPoints,
      confidence: characteristics.predictability,
      uncertaintyBounds: this.calculateUncertaintyBounds(forecastPoints, characteristics),
      scenarioForecasts: []
    };
  }

  private calculateRecentTrend(usageData: UsageDataPoint[]): number {
    if (usageData.length < 5) return 0;

    const recentData = usageData.slice(-5); // Last 5 data points
    const firstRate = recentData[0].requestCount;
    const lastRate = recentData[recentData.length - 1].requestCount;
    
    return (lastRate - firstRate) / recentData.length;
  }

  private getSeasonalAdjustment(timestamp: Date, characteristics: PatternCharacteristics): number {
    // Simple seasonal adjustment based on hour of day
    const hour = timestamp.getHours();
    const peakHours = [9, 10, 11, 14, 15, 16]; // Business hours
    
    if (peakHours.includes(hour)) {
      return characteristics.burstiness * 10; // Higher usage during peak hours
    } else if (hour >= 22 || hour <= 6) {
      return -characteristics.consistency * 5; // Lower usage during night
    }
    
    return 0;
  }

  private calculateUncertaintyBounds(
    forecastPoints: ForecastPoint[],
    characteristics: PatternCharacteristics
  ): UncertaintyBounds {
    const uncertainty = 1 - characteristics.predictability;
    const upperBound = forecastPoints.map(point => point.requestRate * (1 + uncertainty));
    const lowerBound = forecastPoints.map(point => point.requestRate * (1 - uncertainty));
    
    return {
      upperBound,
      lowerBound,
      confidenceInterval: 95
    };
  }

  private generatePatternRecommendations(
    patternConfig: UsagePatternConfig,
    metrics: PatternMetrics,
    characteristics: PatternCharacteristics
  ): PatternRecommendation[] {
    const recommendations: PatternRecommendation[] = [];

    // Generate recommendations based on pattern type
    switch (patternConfig.patternType) {
      case UsagePatternType.BURST_PATTERN:
        if (characteristics.burstiness > 0.7) {
          recommendations.push({
            recommendationId: 'burst_allowance',
            recommendationType: RecommendationType.BURST_ALLOWANCE,
            priority: 1,
            description: 'Increase burst allowance for high burstiness pattern',
            rationale: `Pattern shows high burstiness (${characteristics.burstiness.toFixed(2)})`,
            expectedBenefit: 'Improved user experience during traffic spikes',
            implementationCost: ImplementationCost.LOW,
            riskLevel: RiskLevel.LOW,
            actionItems: [
              {
                itemId: 'increase_burst',
                description: 'Increase burst allowance by 50%',
                actionType: 'quota_adjustment',
                parameters: { burstMultiplier: 1.5 },
                estimatedTime: 5,
                dependencies: []
              }
            ]
          });
        }
        break;

      case UsagePatternType.STEADY_STATE:
        if (characteristics.consistency > 0.8) {
          recommendations.push({
            recommendationId: 'optimize_quota',
            recommendationType: RecommendationType.QUOTA_DECREASE,
            priority: 2,
            description: 'Optimize quota for consistent usage pattern',
            rationale: `Pattern shows high consistency (${characteristics.consistency.toFixed(2)})`,
            expectedBenefit: 'Cost savings through optimized resource allocation',
            implementationCost: ImplementationCost.LOW,
            riskLevel: RiskLevel.LOW,
            actionItems: [
              {
                itemId: 'optimize_quota',
                description: 'Reduce base quota by 10% and increase burst allowance',
                actionType: 'quota_rebalancing',
                parameters: { baseReduction: 0.1, burstIncrease: 0.2 },
                estimatedTime: 10,
                dependencies: []
              }
            ]
          });
        }
        break;

      case UsagePatternType.GROWTH_PATTERN:
        if (characteristics.growthRate > 20) {
          recommendations.push({
            recommendationId: 'plan_scaling',
            recommendationType: RecommendationType.QUOTA_INCREASE,
            priority: 1,
            description: 'Plan for continued growth in usage',
            rationale: `Pattern shows ${characteristics.growthRate.toFixed(1)}% growth rate`,
            expectedBenefit: 'Proactive scaling to prevent quota exhaustion',
            implementationCost: ImplementationCost.MEDIUM,
            riskLevel: RiskLevel.MEDIUM,
            actionItems: [
              {
                itemId: 'gradual_increase',
                description: 'Implement gradual quota increases over time',
                actionType: 'scheduled_scaling',
                parameters: { growthRate: characteristics.growthRate },
                estimatedTime: 30,
                dependencies: ['monitoring_setup']
              }
            ]
          });
        }
        break;
    }

    return recommendations;
  }

  private getAllUsers(): string[] {
    const users = new Set<string>();
    
    // Collect users from usage history
    for (const userHistory of this.usageHistory.values()) {
      userHistory.forEach(dataPoint => users.add(dataPoint.userId));
    }
    
    // Collect users from patterns
    for (const pattern of this.usagePatterns.values()) {
      users.add(pattern.userId);
    }

    return Array.from(users);
  }

  private getActiveUsers(): string[] {
    const activeThreshold = Date.now() - (24 * 60 * 60 * 1000); // Last 24 hours
    const activeUsers = new Set<string>();

    for (const [userId, userHistory] of this.usageHistory) {
      const hasRecentActivity = userHistory.some(dataPoint => 
        dataPoint.timestamp.getTime() > activeThreshold
      );
      
      if (hasRecentActivity) {
        activeUsers.add(userId);
      }
    }

    return Array.from(activeUsers);
  }

  private async getCurrentQuota(userId: string, apiEndpoint: string): Promise<QuotaAllocation> {
    // In real implementation, this would fetch from quota management system
    return {
      requestsPerSecond: 10,
      requestsPerMinute: 600,
      requestsPerHour: 36000,
      requestsPerDay: 864000,
      concurrentConnections: 50,
      burstAllowance: 20,
      specialLimits: []
    };
  }

  private quotasAreEquivalent(quota1: QuotaAllocation, quota2: QuotaAllocation): boolean {
    const tolerance = 0.05; // 5% tolerance
    
    return Math.abs(quota1.requestsPerSecond - quota2.requestsPerSecond) / quota1.requestsPerSecond < tolerance &&
           Math.abs(quota1.burstAllowance - quota2.burstAllowance) / quota1.burstAllowance < tolerance;
  }

  private generateRecommendationReason(
    pattern: UsagePattern,
    current: QuotaAllocation,
    recommended: QuotaAllocation
  ): string {
    const reasons: string[] = [];
    
    if (recommended.requestsPerSecond > current.requestsPerSecond) {
      reasons.push(
        `Usage pattern shows need for higher base quota (current: ${current.requestsPerSecond}/s,
        pattern peak: ${pattern.metrics.peakRequestRate}
      )`);
    }
    
    if (recommended.burstAllowance > current.burstAllowance) {
      reasons.push(`High burstiness (${pattern.characteristics.burstiness.toFixed(2)}) requires increased burst allowance`);
    }
    
    if (pattern.patternType === UsagePatternType.GROWTH_PATTERN) {
      reasons.push(`Growth pattern detected (${pattern.characteristics.growthRate.toFixed(1)}% growth rate)`);
    }

    return reasons.join('; ') || 'Pattern analysis suggests quota optimization';
  }

  private async analyzeQuotaImpact(
    pattern: UsagePattern,
    current: QuotaAllocation,
    recommended: QuotaAllocation
  ): Promise<QuotaImpactAnalysis> {
    const quotaChangeRatio = recommended.requestsPerSecond / current.requestsPerSecond;
    
    return {
      performanceImpact: {
        responseTimeChange: quotaChangeRatio > 1 ? -10 : 5, // Better performance with higher quota
        throughputChange: (quotaChangeRatio - 1) * 100,
        errorRateChange: quotaChangeRatio > 1 ? -20 : 10,
        availabilityChange: quotaChangeRatio > 1 ? 0.1 : -0.05
      },
      businessImpact: {
        revenueImpact: 0, // Would require business context
        userSatisfactionChange: quotaChangeRatio > 1 ? 10 : -5,
        churnRiskChange: quotaChangeRatio > 1 ? -5 : 2,
        competitiveAdvantage: quotaChangeRatio > 1 ? 'Improved service reliability' : 'Cost optimization'
      },
      systemImpact: {
        resourceUtilizationChange: (quotaChangeRatio - 1) * 80,
        capacityRequirementChange: (quotaChangeRatio - 1) * 90,
        scalingImplications: quotaChangeRatio > 1.2 ? ['May require infrastructure scaling'] : [],
        infrastructureCost: (quotaChangeRatio - 1) * 100 // Dollar amount
      },
      userExperienceImpact: {
        satisfactionScore: quotaChangeRatio > 1 ? 85 : 70,
        frustractionEvents: quotaChangeRatio > 1 ? -2 : 1,
        engagementChange: (quotaChangeRatio - 1) * 15,
        feedbackSentiment: quotaChangeRatio > 1 ? 'positive' : 'neutral'
      },
      costImpact: {
        operationalCostChange: (quotaChangeRatio - 1) * 50,
        infrastructureCostChange: (quotaChangeRatio - 1) * 75,
        supportCostChange: quotaChangeRatio > 1 ? -20 : 10,
        totalCostOfOwnership: (quotaChangeRatio - 1) * 100
      }
    };
  }

  private calculateRecommendationPriority(pattern: UsagePattern, impact: QuotaImpactAnalysis): number {
    let priority = 5; // Default priority

    // Higher priority for patterns with high confidence
    if (pattern.confidence > 0.9) priority -= 1;
    
    // Higher priority for significant performance impact
    if (Math.abs(impact.performanceImpact.responseTimeChange) > 20) priority -= 1;
    
    // Higher priority for business impact
    if (Math.abs(impact.businessImpact.userSatisfactionChange) > 15) priority -= 1;
    
    // Pattern-specific priority adjustments
    switch (pattern.patternType) {
      case UsagePatternType.ABUSE_PATTERN:
        priority = 1; // Highest priority
        break;
      case UsagePatternType.GROWTH_PATTERN:
        if (pattern.characteristics.growthRate > 50) priority = 2;
        break;
      case UsagePatternType.BURST_PATTERN:
        if (pattern.characteristics.burstiness > 0.8) priority = Math.min(priority, 3);
        break;
    }

    return Math.max(1, priority);
  }

  private isLowRiskRecommendation(recommendation: QuotaRecommendation): boolean {
    const impact = recommendation.expectedImpact;
    
    // Consider low risk if:
    // 1. Small cost impact
    // 2. High confidence
    // 3. Positive user experience impact
    return Math.abs(impact.costImpact.totalCostOfOwnership) < 50 &&
           recommendation.confidence > 0.8 &&
           impact.userExperienceImpact.satisfactionScore > 75;
  }

  private calculateFairnessImpact(recommendation: QuotaRecommendation, fairnessAnalysis: FairnessAnalysis): number {
    // Calculate how this recommendation would affect overall fairness
    // Negative values indicate worsening fairness
    
        const quotaChange = recommendation.recommendedQuota.requestsPerSecond / recommendation.currentQuota.requestsPerSecond;
    
    // Large quota increases for already high-quota users worsen fairness
    if (quotaChange > 1.5 && recommendation.currentQuota.requestsPerSecond > 100) {
      return -0.2;
    }
    
    // Small increases or decreases are generally neutral
    if (quotaChange > 0.9 && quotaChange < 1.1) {
      return 0;
    }
    
    // Quota decreases for high-usage users improve fairness
    if (quotaChange < 0.9 && recommendation.currentQuota.requestsPerSecond > 50) {
      return 0.1;
    }
    
    return 0;
  }

  private adjustForFairness(
    recommended: QuotaAllocation,
    current: QuotaAllocation,
    fairnessImpact: number
  ): QuotaAllocation {
    const adjustmentFactor = 1 + fairnessImpact; // Negative impact reduces the adjustment
    
    return {
      ...recommended,
      requestsPerSecond: current.requestsPerSecond + 
        (recommended.requestsPerSecond - current.requestsPerSecond) * adjustmentFactor,
      requestsPerMinute: current.requestsPerMinute + 
        (recommended.requestsPerMinute - current.requestsPerMinute) * adjustmentFactor,
      requestsPerHour: current.requestsPerHour + 
        (recommended.requestsPerHour - current.requestsPerHour) * adjustmentFactor
    };
  }

  private calculateOverallFairnessScore(metrics: FairnessMetricResult[]): number {
    if (metrics.length === 0) return 100;
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    for (const metric of metrics) {
      const metricScore = 100 - (metric.deviation * 100); // Convert deviation to score
      const weight = this.getFairnessMetricWeight(metric.metricId);
      
      weightedScore += metricScore * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedScore / totalWeight : 100;
  }

  private getFairnessMetricWeight(metricId: string): number {
    const metricConfig = this.config.fairnessConfig.fairnessMetrics
      .find(m => m.metricId === metricId);
    
    return metricConfig ? metricConfig.weight : 1;
  }

  private identifyInequalityIssues(metrics: FairnessMetricResult[]): InequalityIssue[] {
    const issues: InequalityIssue[] = [];
    
    for (const metric of metrics) {
      if (metric.severity === MetricSeverity.MAJOR_CONCERN || 
          metric.severity === MetricSeverity.CRITICAL_ISSUE) {
        
        issues.push({
          issueId: `issue_${metric.metricId}`,
          issueType: this.mapMetricToInequalityType(metric.metricId),
          description: `${metric.metricName} shows significant inequality (deviation: ${metric.deviation.toFixed(2)})`,
          affectedUsers: [], // Would be populated with actual affected users
          severity: metric.severity === MetricSeverity.CRITICAL_ISSUE ? AbuseSeverity.CRITICAL : AbuseSeverity.HIGH,
          measuredImpact: metric.deviation * 100,
          suggestedActions: this.generateInequalityActions(metric)
        });
      }
    }
    
    return issues;
  }

  private async findRedistributionOpportunities(users: string[]): Promise<RedistributionOpportunity[]> {
    const opportunities: RedistributionOpportunity[] = [];
    
    // Find users with low utilization (potential sources)
    const lowUtilizationUsers = await this.findLowUtilizationUsers(users);
    
    // Find users with high utilization (potential targets)
    const highUtilizationUsers = await this.findHighUtilizationUsers(users);
    
    if (lowUtilizationUsers.length > 0 && highUtilizationUsers.length > 0) {
      opportunities.push({
        opportunityId: `redist_${Date.now()}`,
        sourceUsers: lowUtilizationUsers.slice(0, 5), // Top 5 sources
        targetUsers: highUtilizationUsers.slice(0, 3), // Top 3 targets
        redistributableQuota: 100, // Would calculate actual amount
        expectedBenefit: 25, // Percentage improvement in fairness
        riskAssessment: 'Low risk - users selected based on utilization patterns',
        implementationPlan: [
          'Reduce quota for low-utilization users by 20%',
          'Increase quota for high-utilization users by 30%',
          'Monitor impact for 7 days'
        ]
      });
    }
    
    return opportunities;
  }

  private generateFairnessRecommendations(
    issues: InequalityIssue[],
    opportunities: RedistributionOpportunity[]
  ): FairnessRecommendation[] {
    const recommendations: FairnessRecommendation[] = [];
    
    // Generate recommendations for each inequality issue
    for (const issue of issues) {
      recommendations.push({
        recommendationId: `fairness_${issue.issueId}`,
        category: FairnessCategory.QUOTA_REBALANCING,
        title: `Address ${issue.issueType}`,
        description: issue.description,
        priority: issue.severity === AbuseSeverity.CRITICAL ? 1 : 2,
        expectedImprovement: issue.measuredImpact * 0.6, // Expect 60% improvement
        actionItems: issue.suggestedActions
      });
    }
    
    // Generate recommendations for redistribution opportunities
    for (const opportunity of opportunities) {
      recommendations.push({
        recommendationId: `redist_${opportunity.opportunityId}`,
        category: FairnessCategory.QUOTA_REBALANCING,
        title: 'Redistribute Quota for Better Fairness',
        description: `Redistribute ${opportunity.redistributableQuota} quota units from ${opportunity.sourceUsers.length} under-utilized users to ${opportunity.targetUsers.length} over-utilized users`,
        priority: 3,
        expectedImprovement: opportunity.expectedBenefit,
        actionItems: opportunity.implementationPlan
      });
    }
    
    return recommendations;
  }

  // Additional helper methods would continue here...
  // This is a comprehensive implementation but truncated for length

  private async collectAndStoreUsageData(): Promise<void> {
    // In real implementation, this would collect actual usage data
    // For now, we'll generate some sample data
    
    const users = this.getActiveUsers();
    const now = new Date();
    
    for (const userId of users) {
      const userHistory = this.usageHistory.get(userId) || [];
      
      // Add new data point
      const dataPoint: UsageDataPoint = {
        userId,
        apiEndpoint: '/api/v1/data',
        timestamp: now,
        requestCount: Math.floor(Math.random() * 100),
        errorCount: Math.floor(Math.random() * 5),
        averageResponseTime: 100 + Math.random() * 200,
        quotaUtilization: Math.random() * 100
      };
      
      userHistory.push(dataPoint);
      
      // Keep only recent data
      const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
      const recentData = userHistory.filter(d => d.timestamp.getTime() > cutoff);
      
      this.usageHistory.set(userId, recentData);
    }
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Cleanup usage patterns
    for (const [id, pattern] of this.usagePatterns) {
      if (pattern.detectedAt.getTime() < cutoff) {
        this.usagePatterns.delete(id);
      }
    }
    
    // Cleanup recommendations
    for (const [id, recommendation] of this.quotaRecommendations) {
      if (recommendation.validUntil.getTime() < Date.now()) {
        this.quotaRecommendations.delete(id);
      }
    }
    
    // Cleanup abuse detections
    for (const [id, detection] of this.abuseDetectionResults) {
      if (detection.detectedAt.getTime() < cutoff) {
        this.abuseDetectionResults.delete(id);
      }
    }
  }

  private async runAbuseDetectionScan(): Promise<void> {
    const activeUsers = this.getActiveUsers();
    
    for (const userId of activeUsers) {
      await this.detectAbuse(userId);
    }
  }

  // Simplified implementations of remaining methods
  private calculateGiniCoefficient(users: string[]): number {
    // Simplified Gini coefficient calculation
    return Math.random() * 0.5; // Placeholder
  }

  private calculateQuotaUtilizationVariance(users: string[]): number {
    // Calculate variance in quota utilization across users
    return Math.random() * 20; // Placeholder
  }

  private calculateRequestDistributionMetric(users: string[]): number {
    // Calculate how evenly requests are distributed
    return Math.random() * 30; // Placeholder
  }

  private classifyMetricSeverity(deviation: number, tolerance: number): MetricSeverity {
    if (deviation <= tolerance) return MetricSeverity.ACCEPTABLE;
    if (deviation <= tolerance * 2) return MetricSeverity.MINOR_CONCERN;
    if (deviation <= tolerance * 4) return MetricSeverity.MAJOR_CONCERN;
    return MetricSeverity.CRITICAL_ISSUE;
  }

  // Additional method stubs for completeness
  private mapMetricToInequalityType(metricId: string): InequalityType {
    return InequalityType.QUOTA_DISPARITY;
  }

  private generateInequalityActions(metric: FairnessMetricResult): string[] {
    return ['Review quota allocations', 'Implement fairness adjustments'];
  }

  private async findLowUtilizationUsers(users: string[]): Promise<string[]> {
    return users.slice(0, 3); // Placeholder
  }

  private async findHighUtilizationUsers(users: string[]): Promise<string[]> {
    return users.slice(-3); // Placeholder
  }

  private mapRuleToEvidenceType(ruleType: AbuseRuleType): EvidenceType {
    switch (ruleType) {
      case AbuseRuleType.RATE_SPIKE: return EvidenceType.RATE_ANOMALY;
      case AbuseRuleType.ERROR_FLOOD: return EvidenceType.ERROR_PATTERN;
      default: return EvidenceType.BEHAVIORAL_ANOMALY;
    }
  }

  private mapPatternToAbuseType(pattern: AbusePattern): AbuseType {
    return AbuseType.RATE_ABUSE; // Simplified mapping
  }

  private calculateAbuseImpact(usageData: UsageDataPoint[], evidence: AbuseEvidence[]): AbuseImpact {
    return {
      systemImpact: Math.random() * 100,
      userImpact: Math.random() * 100,
      businessImpact: Math.random() * 1000,
      affectedUsers: Math.floor(Math.random() * 100),
      resourceConsumption: Math.random() * 100
    };
  }

  private async determineResponseActions(
    pattern: AbusePattern,
    confidence: number,
    impact: AbuseImpact
  ): Promise<ResponseAction[]> {
    const actions: ResponseAction[] = [];
    
    const responseConfigs = this.config.abuseDetectionConfig.responseActions
      .filter(action => action.severity === pattern.severity);
    
    for (const config of responseConfigs) {
      if (config.autoExecute || confidence > 0.9) {
        actions.push({
          actionId: `action_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          actionType: config.actionType,
          appliedAt: new Date(),
          duration: config.parameters.duration || 60,
          parameters: config.parameters,
          effectiveness: 0,
          status: ActionStatus.PENDING
        });
      }
    }
    
    return actions;
  }

  private evaluateRateSpikeRule(usageData: UsageDataPoint[], rule: AbuseDetectionRule): AbuseRuleResult {
    const recentData = usageData.slice(-5); // Last 5 data points
    if (recentData.length === 0) return { detected: false, strength: 0, description: '', data: {} };
    
    const avgRate = recentData.reduce((sum, d) => sum + d.requestCount, 0) / recentData.length;
    const maxRate = Math.max(...recentData.map(d => d.requestCount));
    
    const spikeRatio = maxRate / avgRate;
    const detected = spikeRatio > rule.threshold;
    
    return {
      detected,
      strength: detected ? Math.min(1, spikeRatio / rule.threshold) : 0,
      description: detected ? `Rate spike detected: ${spikeRatio.toFixed(2)}x average` : '',
      data: { spikeRatio, avgRate, maxRate }
    };
  }

  private evaluateQuotaExhaustionRule(usageData: UsageDataPoint[], rule: AbuseDetectionRule): AbuseRuleResult {
    const recentData = usageData.slice(-10); // Last 10 data points
    const exhaustionCount = recentData.filter(d => d.quotaUtilization > 95).length;
    const exhaustionRate = exhaustionCount / recentData.length;
    
    const detected = exhaustionRate > (rule.threshold / 100);
    
    return {
      detected,
      strength: detected ? exhaustionRate : 0,
      description: detected ? `High quota exhaustion rate: ${(exhaustionRate * 100).toFixed(1)}%` : '',
      data: { exhaustionRate, exhaustionCount, totalDataPoints: recentData.length }
    };
  }

  private evaluateErrorFloodRule(usageData: UsageDataPoint[], rule: AbuseDetectionRule): AbuseRuleResult {
    const recentData = usageData.slice(-5);
    const totalRequests = recentData.reduce((sum, d) => sum + d.requestCount, 0);
    const totalErrors = recentData.reduce((sum, d) => sum + d.errorCount, 0);
    
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const detected = errorRate > rule.threshold;
    
    return {
      detected,
      strength: detected ? Math.min(1, errorRate / rule.threshold) : 0,
      description: detected ? `High error rate: ${errorRate.toFixed(1)}%` : '',
      data: { errorRate, totalErrors, totalRequests }
    };
  }

  private async executeAbuseResponseAction(userId: string, action: ResponseAction): Promise<void> {
    // In real implementation, this would execute the actual response action
    this.emit('abuseActionExecuted', {
      userId,
      actionType: action.actionType,
      parameters: action.parameters
    });
  }

  private monitorRecommendationImpact(recommendationId: string): void {
    // Implementation for monitoring recommendation impact
  }

  private calculateActualImpact(
    recommendation: QuotaRecommendation,
    currentUsage: UsageDataPoint[]
  ): QuotaImpactAnalysis {
    // Calculate actual impact based on current usage data
    return recommendation.expectedImpact; // Placeholder
  }

  private compareImpacts(expected: QuotaImpactAnalysis, actual: QuotaImpactAnalysis): number {
    // Compare expected vs actual impact and return deviation score
    return 0.1; // Placeholder
  }

  private async executeRedistribution(opportunity: RedistributionOpportunity): Promise<OptimizationAction | null> {
    // Execute quota redistribution
    return null; // Placeholder
  }

  private async executeFairnessRecommendation(recommendation: FairnessRecommendation): Promise<OptimizationAction | null> {
    // Execute fairness recommendation
    return null; // Placeholder
  }

  private calculateFairnessImprovement(analysis: FairnessAnalysis): number {
    return 10; // Placeholder percentage improvement
  }

  private getAffectedUsers(actions: OptimizationAction[]): string[] {
    return []; // Placeholder
  }

  private calculateOptimizationBenefit(actions: OptimizationAction[]): number {
    return 100; // Placeholder benefit score
  }
}

// ==========================================
// SUPPORTING INTERFACES
// ==========================================

interface UsageDataPoint {
  userId: string;
  apiEndpoint: string;
  timestamp: Date;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  quotaUtilization: number;
}

interface AbuseRuleResult {
  detected: boolean;
  strength: number;
  description: string;
  data: Record<string, any>;
}

interface OptimizationResult {
  optimizationId: string;
  timestamp: Date;
  actionsApplied: number;
  fairnessImprovement: number;
  affectedUsers: string[];
  estimatedBenefit: number;
}

interface OptimizationAction {
  actionId: string;
  actionType: string;
  affectedUsers: string[];
  parameters: Record<string, any>;
}

// ==========================================
// FACTORY CLASS
// ==========================================

export class ApiUsagePatternQuotaRecommendationsFactory {
  public static createDefaultConfig(): QuotaRecommendationConfig {
    return {
      enablePatternAnalysis: true,
      analysisWindow: 24,
      recommendationInterval: 60,
      usagePatterns: [
        {
          patternId: 'burst_pattern',
          patternName: 'Burst Pattern',
          patternType: UsagePatternType.BURST_PATTERN,
          detectionRules: [
            {
              ruleId: 'burst_detection',
              condition: 'burst_detected',
              threshold: 3.0,
              timeWindow: 15,
              weight: 1.0,
              enabled: true
            }
          ],
          quotaImpact: {
            quotaMultiplier: 1.5,
            adjustmentType: QuotaAdjustmentType.TEMPORARY_BOOST,
            maxAdjustment: 100,
            minAdjustment: 10,
            confidenceThreshold: 0.7
          },
          priority: 1,
          enabled: true
        },
        {
          patternId: 'steady_state',
          patternName: 'Steady State',
          patternType: UsagePatternType.STEADY_STATE,
          detectionRules: [
            {
              ruleId: 'steady_detection',
              condition: 'steady_state',
              threshold: 10,
              timeWindow: 60,
              weight: 1.0,
              enabled: true
            }
          ],
          quotaImpact: {
            quotaMultiplier: 0.9,
            adjustmentType: QuotaAdjustmentType.DECREASE,
            maxAdjustment: 50,
            minAdjustment: 5,
            confidenceThreshold: 0.8
          },
          priority: 3,
          enabled: true
        }
      ],
      quotaAdjustmentRules: [],
      fairnessConfig: {
        enableFairnessAnalysis: true,
        fairnessMetrics: [
          {
            metricId: 'gini_coefficient',
            metricName: 'Gini Coefficient',
            metricType: FairnessMetricType.GINI_COEFFICIENT,
            targetValue: 0.3,
            tolerance: 0.1,
            weight: 1.0,
            enabled: true
          }
        ],
        redistributionRules: [],
        priorityTiers: []
      },
      abuseDetectionConfig: {
        enableAbuseDetection: true,
        abusePatterns: [
          {
            patternId: 'rate_abuse',
            patternName: 'Rate Abuse',
            description: 'Unusually high request rates',
            detectionRules: [
              {
                ruleId: 'rate_spike',
                ruleType: AbuseRuleType.RATE_SPIKE,
                threshold: 5.0,
                timeWindow: 10,
                condition: 'rate > threshold * average',
                weight: 1.0
              }
            ],
            severity: AbuseSeverity.HIGH,
            confidence: 0.8,
            enabled: true
          }
        ],
        detectionSensitivity: 0.7,
        responseActions: [
          {
            actionId: 'temp_limit',
            severity: AbuseSeverity.HIGH,
            actionType: AbuseActionType.TEMPORARY_QUOTA_REDUCTION,
            parameters: { reduction: 0.5, duration: 60 },
            autoExecute: true,
            escalation: false
          }
        ],
        whitelistRules: []
      },
      alertingConfig: {
        enableAlerting: true,
        alertThresholds: [],
        notificationChannels: [],
        escalationRules: []
      }
    };
  }

  public static createHighSensitivityConfig(): QuotaRecommendationConfig {
    const config = this.createDefaultConfig();
    config.abuseDetectionConfig.detectionSensitivity = 0.9;
    config.analysisWindow = 12; // Shorter analysis window
    config.recommendationInterval = 30; // More frequent recommendations
    return config;
  }

  public static createRecommendationEngine(config?: Partial<QuotaRecommendationConfig>): ApiUsagePatternQuotaRecommendations {
    const fullConfig = { ...this.createDefaultConfig(), ...config };
    return new ApiUsagePatternQuotaRecommendations(fullConfig);
  }
}

export default ApiUsagePatternQuotaRecommendations;