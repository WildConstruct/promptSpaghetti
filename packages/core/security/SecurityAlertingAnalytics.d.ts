/**
 * Security Alerting Analytics System
 *
 * Comprehensive analytics and intelligence system for security alerts,
 * providing real-time monitoring, threat detection, pattern analysis,
 * and automated response capabilities.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: T-1752989143998-428 - Complete security validation and documentation
 *
 * SECURITY FEATURES:
 * - Input validation and sanitization for all alert data
 * - Protection against injection attacks (SQL, script, command)
 * - Rate limiting to prevent alert flooding
 * - Secure automated response execution with approval workflows
 * - Comprehensive audit logging for all security operations
 * - Data classification-aware risk scoring and handling
 * - Pattern detection for advanced persistent threats
 * - Threat intelligence correlation with IoC matching
 * - Machine learning models with bias detection and mitigation
 * - Compliance impact assessment (SOC 2, GDPR, etc.)
 *
 * ARCHITECTURE:
 * - Event-driven design with secure event emission
 * - Modular correlation rule engine
 * - Pluggable response template system
 * - Real-time analytics with performance monitoring
 * - Configurable retention and cleanup policies
 * - ML model management with security validation
 *
 * SECURITY CONTROLS:
 * - Configuration validation prevents security misconfigurations
 * - Alert validation blocks malicious content injection
 * - Response action validation ensures safe automated responses
 * - Pattern analysis includes security threat categorization
 * - Threat intelligence feeds are validated and sanitized
 * - All database operations use parameterized queries
 * - Sensitive data is filtered from logs and dashboards
 * - Error handling prevents information disclosure
 *
 * COMPLIANCE:
 * - Supports SOC 2 Type II security monitoring requirements
 * - GDPR breach notification timeline tracking
 * - Audit trail for all security operations
 * - Data retention policies configurable per regulation
 * - Privacy-aware data handling and masking
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-01
 */
import { EventEmitter } from 'events';
import { DataClassificationLevel, DataOperation } from './DataClassificationAccessControl';
import { SecurityAlert } from './CentralizedAccessControlService';

export interface SecurityAlertingConfig {
    enableRealTimeAnalytics: boolean;
    enablePatternAnalysis: boolean;
    enableThreatIntelligence: boolean;
    enableAutomatedResponse: boolean;
    alertRetentionDays: number;
    patternAnalysisWindow: number;
    threatIntelligenceUpdate: number;
    escalationThresholds: EscalationThresholds;
    machinelearningEnabled: boolean;
    correlationRules: CorrelationRule[];
    responseAutomation: ResponseAutomation;

export interface EscalationThresholds {
    criticalAlertCount: number;
    highAlertCount: number;
    correlatedAlertCount: number;
    timeWindowMinutes: number;
    failedAccessAttempts: number;
    dataExfiltrationThreshold: number;
    anomalyScoreThreshold: number;

export interface AlertMetrics {
    totalAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    alertsByClassification: Record<DataClassificationLevel, number>;
    alertsByOperation: Record<DataOperation, number>;
    averageResponseTime: number;
    falsePositiveRate: number;
    correlatedAlerts: number;
    escalatedAlerts: number;
    automatedResponses: number;
    manualInterventions: number;
    threatIntelligenceMatches: number;
    trendsAnalysis: TrendAnalysis;

export interface TrendAnalysis {
    alertVolumeGrowth: number;
    topThreats: ThreatSummary[];
    topTargets: TargetSummary[];
    timePatterns: TimePattern[];
    geographicDistribution: GeographicPattern[];
    userBehaviorTrends: UserBehaviorTrend[];
    systemPerformanceImpact: PerformanceImpact;

export interface ThreatSummary {
    threatType: string;
    count: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    firstSeen: Date;
    lastSeen: Date;
    affectedSystems: string[];
    mitigationStatus: 'NONE' | 'PARTIAL' | 'COMPLETE';

export interface TargetSummary {
    targetId: string;
    targetType: 'USER' | 'SYSTEM' | 'DATA' | 'NETWORK';
    alertCount: number;
    riskScore: number;
    classification: DataClassificationLevel;
    lastAlert: Date;
    threatTypes: string[];
    protectionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';

export interface TimePattern {
    timeOfDay: number;
    dayOfWeek: number;
    alertCount: number;
    avgSeverity: number;
    commonThreats: string[];
    anomalyScore: number;

export interface GeographicPattern {
    country: string;
    region: string;
    alertCount: number;
    threatTypes: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    isKnownThreatRegion: boolean;

export interface UserBehaviorTrend {
    userId: string;
    normalBehaviorScore: number;
    currentBehaviorScore: number;
    anomalySeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    behaviorChanges: BehaviorChange[];
    riskFactors: RiskFactor[];
    recommendedActions: string[];

export interface BehaviorChange {
    aspect: 'ACCESS_PATTERN' | 'TIME_PATTERN' | 'LOCATION' | 'OPERATION_TYPE' | 'DATA_ACCESS';
    previousValue: any;
    currentValue: any;
    changeSignificance: number;
    changeDate: Date;
    contextualFactors: string[];

export interface RiskFactor {
    factor: string;
    weight: number;
    contribution: number;
    evidence: string[];
    mitigationSuggestions: string[];

export interface PerformanceImpact {
    systemLatency: number;
    processingOverhead: number;
    storageUtilization: number;
    networkImpact: number;
    alertProcessingTime: number;
    falsePositiveRatio: number;

export interface CorrelationRule {
    id: string;
    name: string;
    description: string;
    conditions: CorrelationCondition[];
    timeWindow: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    responseActions: ResponseAction[];
    enabled: boolean;
    priority: number;

export interface CorrelationCondition {
    field: string;
    operator: 'EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'MATCHES' | 'EXISTS';
    value: any;
    weight: number;
    required: boolean;

export interface ResponseAction {
    type: 'ALERT' | 'BLOCK' | 'QUARANTINE' | 'ESCALATE' | 'INVESTIGATE' | 'AUTOFIX';
    parameters: Record<string, any>;
    conditions: ResponseCondition[];
    automation: AutomationLevel;
    approval: ApprovalRequirement;

export interface ResponseCondition {
    condition: string;
    value: any;
    operator: string;

export interface AutomationLevel {
    level: 'MANUAL' | 'SEMI_AUTOMATIC' | 'AUTOMATIC';
    confidence: number;
    humanOverride: boolean;
    rollback: boolean;

export interface ApprovalRequirement {
    required: boolean;
    approvers: string[];
    timeout: number;
    fallbackAction: string;

export interface ResponseAutomation {
    enabled: boolean;
    confidenceThreshold: number;
    maxAutomaticActions: number;
    cooldownPeriod: number;
    approvalBypass: ApprovalBypass;
    responseTemplates: ResponseTemplate[];

export interface ApprovalBypass {
    emergencyConditions: string[];
    bypassApprovers: string[];
    auditRequired: boolean;
    timeLimit: number;

export interface ResponseTemplate {
    id: string;
    name: string;
    description: string;
    triggerConditions: string[];
    actions: ResponseAction[];
    effectiveness: number;
    lastUsed: Date;
    successRate: number;

export interface AlertPattern {
    patternId: string;
    patternType: 'TEMPORAL' | 'BEHAVIORAL' | 'VOLUMETRIC' | 'GEOGRAPHIC' | 'CONTEXTUAL';
    description: string;
    alerts: SecurityAlert[];
    confidence: number;
    riskScore: number;
    firstDetected: Date;
    lastUpdated: Date;
    frequency: number;
    prediction: PatternPrediction;
    mitigation: MitigationRecommendation;

export interface PatternPrediction {
    nextOccurrence: Date;
    confidence: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    impactAssessment: ImpactAssessment;
    preventionRecommendations: string[];

export interface ImpactAssessment {
    affectedSystems: string[];
    dataAtRisk: DataRiskAssessment[];
    businessImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    financialImpact: number;
    reputationalImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    complianceImpact: ComplianceImpact[];

export interface DataRiskAssessment {
    dataId: string;
    classification: DataClassificationLevel;
    exposureRisk: number;
    sensitivityScore: number;
    complianceRequirements: string[];
    protectionLevel: string;

export interface ComplianceImpact {
    framework: string;
    violationType: string;
    severity: string;
    potentialPenalties: string[];
    reportingRequired: boolean;
    timelineRequirements: string[];

export interface MitigationRecommendation {
    immediate: ImmediateAction[];
    shortTerm: ShortTermAction[];
    longTerm: LongTermAction[];
    preventive: PreventiveAction[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    estimatedCost: number;
    estimatedEffectiveness: number;

export interface ImmediateAction {
    action: string;
    description: string;
    automatable: boolean;
    riskReduction: number;
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    dependencies: string[];

export interface ShortTermAction {
    action: string;
    description: string;
    timeline: string;
    resources: string[];
    expectedOutcome: string;
    successMetrics: string[];

export interface LongTermAction {
    action: string;
    description: string;
    strategicGoal: string;
    investmentRequired: string;
    expectedROI: number;
    riskMitigation: number;

export interface PreventiveAction {
    action: string;
    description: string;
    preventionScope: string[];
    implementation: string;
    maintenanceRequired: boolean;
    effectiveness: number;

export interface ThreatIntelligence {
    threatFeeds: ThreatFeed[];
    indicators: ThreatIndicator[];
    campaigns: ThreatCampaign[];
    attribution: ThreatAttribution[];
    predictions: ThreatPrediction[];
    contextualData: ContextualThreatData;

export interface ThreatFeed {
    feedId: string;
    source: string;
    reliability: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERIFIED';
    updateFrequency: string;
    lastUpdate: Date;
    indicators: number;
    relevanceScore: number;
    coverage: string[];

export interface ThreatIndicator {
    indicatorId: string;
    type: 'IP' | 'DOMAIN' | 'HASH' | 'URL' | 'EMAIL' | 'BEHAVIOR';
    value: string;
    confidence: number;
    firstSeen: Date;
    lastSeen: Date;
    sources: string[];
    context: ThreatContext;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThreatContext {
    campaign: string;
    malwareFamily: string;
    attackVector: string;
    targetProfile: string[];
    geolocation: string[];
    additionalMetadata: Record<string, any>;

export interface ThreatCampaign {
    campaignId: string;
    name: string;
    description: string;
    actor: string;
    firstSeen: Date;
    lastSeen: Date;
    active: boolean;
    confidence: number;
    indicators: string[];
    techniques: string[];
    targets: string[];
    attribution: AttributionData;

export interface AttributionData {
    actor: string;
    confidence: number;
    evidence: string[];
    geolocation: string;
    motivation: string[];
    capability: 'LOW' | 'MEDIUM' | 'HIGH' | 'ADVANCED';
    resources: string[];

export interface ThreatAttribution {
    actorId: string;
    actorName: string;
    aliases: string[];
    confidence: number;
    firstSeen: Date;
    lastActivity: Date;
    capabilities: string[];
    techniques: string[];
    targets: string[];
    motivation: string[];
    geolocation: string[];
    associatedCampaigns: string[];

export interface ThreatPrediction {
    predictionId: string;
    threatType: string;
    likelihood: number;
    timeframe: string;
    confidence: number;
    basedOn: string[];
    indicators: string[];
    recommendations: string[];
    impactAssessment: PredictedImpact;

export interface PredictedImpact {
    scope: string[];
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    affectedAssets: string[];
    businessImpact: string;
    preventionCost: number;
    mitigationCost: number;

export interface ContextualThreatData {
    industryThrends: IndustryThrend[];
    geopoliticalFactors: GeopoliticalFactor[];
    vulnerabilityCorrelations: VulnerabilityCorrelation[];
    seasonalPatterns: SeasonalPattern[];
    emergingThreats: EmergingThreat[];

export interface IndustryThrend {
    industry: string;
    threatTypes: string[];
    frequency: number;
    impact: string;
    trends: string[];
    predictions: string[];

export interface GeopoliticalFactor {
    region: string;
    factor: string;
    impact: string;
    threatTypes: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timeline: string;

export interface VulnerabilityCorrelation {
    vulnerabilityId: string;
    cve: string;
    exploitProbability: number;
    threatActors: string[];
    campaigns: string[];
    mitigationStatus: string;

export interface SeasonalPattern {
    pattern: string;
    timeframe: string;
    threatTypes: string[];
    frequency: number;
    preparation: string[];
    indicators: string[];

export interface EmergingThreat {
    threatId: string;
    description: string;
    maturity: 'EMERGING' | 'DEVELOPING' | 'MATURE';
    confidence: number;
    firstSeen: Date;
    techniques: string[];
    indicators: string[];
    countermeasures: string[];

export interface MLModel {
    modelId: string;
    name: string;
    type: 'ANOMALY_DETECTION' | 'PATTERN_RECOGNITION' | 'THREAT_CLASSIFICATION' | 'BEHAVIOR_ANALYSIS';
    version: string;
    trainedOn: Date;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastRetrained: Date;
    trainingData: TrainingDataInfo;
    features: ModelFeature[];
    hyperparameters: Record<string, any>;
    status: 'TRAINING' | 'ACTIVE' | 'DEPRECATED' | 'FAILED';

export interface TrainingDataInfo {
    size: number;
    timeRange: {,
        start: Date;
        end: Date;
    };
    sources: string[];
    quality: number;
    bias: BiasMetrics;
    distribution: DataDistribution;

export interface BiasMetrics {
    overallBias: number;
    demographicBias: Record<string, number>;
    temporalBias: number;
    systemBias: number;
    mitigationApplied: string[];

export interface DataDistribution {
    classes: Record<string, number>;
    features: Record<string, FeatureDistribution>;
    outliers: number;
    missing: number;
    duplicates: number;

export interface FeatureDistribution {
    mean: number;
    std: number;
    min: number;
    max: number;
    skewness: number;
    kurtosis: number;

export interface ModelFeature {
    name: string;
    type: 'NUMERIC' | 'CATEGORICAL' | 'BINARY' | 'TEXT' | 'TEMPORAL';
    importance: number;
    correlation: number;
    transformation: string;
    source: string;
/**
 * Main Security Alerting Analytics Service
 */
export declare class SecurityAlertingAnalytics extends EventEmitter {
    private config;
    private alerts;
    private patterns;
    private correlationRules;
    private threatIntelligence;
    private mlModels;
    private metrics;
    private responseTemplates;
    constructor(config: SecurityAlertingConfig);
    /**
     * Process incoming security alert
     */
    processAlert(alert: SecurityAlert): Promise<void>;
    /**
     * Get comprehensive analytics dashboard
     */
    getAnalyticsDashboard(): {
        metrics: AlertMetrics;
        activePatterns: AlertPattern[];
        threatSummary: ThreatSummary[];
        recommendations: MitigationRecommendation[];
        performance: PerformanceImpact;
    };
    /**
     * Get real-time threat intelligence
     */
    getThreatIntelligence(): ThreatIntelligence;
    /**
     * Get alert patterns
     */
    getAlertPatterns(limit?: number, patternType?: AlertPattern['patternType']): AlertPattern[];
    /**
     * Perform correlation analysis
     */
    performCorrelationAnalysis(timeWindow?: number): Promise<AlertPattern[]>;
    /**
     * Generate threat assessment report
     */
    generateThreatAssessment(): {
        overallRiskScore: number;
        topThreats: ThreatSummary[];
        riskByClassification: Record<DataClassificationLevel, number>;
        recommendations: string[];
        trends: TrendAnalysis;
        compliance: ComplianceImpact[];
    };
    /**
     * Update ML models with new data
     */
    updateMLModels(): Promise<void>;
    /**
     * Get performance metrics
     */
    getMetrics(): AlertMetrics;
    /**
     * Add correlation rule
     */
    addCorrelationRule(rule: CorrelationRule): void;
    /**
     * Remove correlation rule
     */
    removeCorrelationRule(ruleId: string): boolean;
    private performRealTimeAnalysis;
    private analyzePatterns;
    private correlateThreatIntelligence;
    private triggerAutomatedResponse;
    private initializeMetrics;
    private initializeThreatIntelligence;
    private loadCorrelationRules;
    private loadResponseTemplates;
    private initializeMLModels;
    private startPeriodicTasks;
    private updateMetrics;
    private getAlertAnalysis;
    private getActivePatterns;
    private getTopThreats;
    private getRecommendations;
    private getPerformanceMetrics;
    private getRecentAlerts;
    private findMatchingAlerts;
    private createCorrelatedPattern;
    private calculateOverallRiskScore;
    private calculateRiskByClassification;
    private generateRecommendations;
    private analyzeTrends;
    private assessComplianceImpact;
    private retrainModel;
    private calculateAlertRiskScore;
    private classifyThreatType;
    private calculateUrgency;
    private findRelatedAlerts;
    private findMatchingPatterns;
    private createNewPattern;
    private updatePatternMetrics;
    private matchesIndicator;
    private findApplicableResponseTemplates;
    private executeResponseTemplate;
    private updateThreatIntelligence;
    private cleanupOldAlerts;
    private createDefaultMLModels;
    /**
     * Cleanup resources and stop service
     */
    destroy(): void;

export default SecurityAlertingAnalytics;
//# sourceMappingURL=SecurityAlertingAnalytics.d.ts.map