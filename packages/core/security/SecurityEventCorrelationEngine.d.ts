/**
 * Epic 31.4.1 - Security Event Correlation and Analysis Processes
 *
 * Advanced correlation engine for security event analysis, pattern recognition,
 * and threat intelligence. Provides real-time correlation, historical analysis,
 * and automated threat grouping capabilities.
 *
 * Task: E31-1753313263559-7F47D4
 */
import { EventEmitter } from 'events';
import { SecurityEvent, ThreatType } from './PredictiveSecurityAnalytics';
import { AnomalySeverity } from './SecurityAnomalyDetector';

export interface CorrelationConfig {
    enableRealTimeCorrelation: boolean;
    correlationTimeWindow: number;
    similarityThreshold: number;
    enableAdvancedPatternRecognition: boolean;
    maxCorrelationDepth: number;
    enableCrossSystemCorrelation: boolean;
    retentionPeriodDays: number;
    enableMachineLearning: boolean;
    correlationRules: CorrelationRule[];

export interface CorrelationRule {
    id: string;
    name: string;
    description: string;
    ruleType: CorrelationRuleType;
    enabled: boolean;
    priority: number;
    conditions: CorrelationCondition[];
    actions: CorrelationAction[];
    timeWindow: number;
    threshold: number;
    lastUpdated: Date;
    triggeredCount: number;

export declare enum CorrelationRuleType {
    TEMPORAL_SEQUENCE = "temporal_sequence",
    SPATIAL_CLUSTERING = "spatial_clustering",
    FREQUENCY_PATTERN = "frequency_pattern",
    ATTRIBUTE_SIMILARITY = "attribute_similarity",
    BEHAVIORAL_PATTERN = "behavioral_pattern",
    CAUSAL_RELATIONSHIP = "causal_relationship",
    ANOMALY_CLUSTERING = "anomaly_clustering",
    THREAT_CHAIN = "threat_chain"

export interface CorrelationCondition {
    field: string;
    operator: CorrelationOperator;
    value: unknown;
    weight: number;
    required: boolean;

export declare enum CorrelationOperator {
    EQUALS = "equals",
    CONTAINS = "contains",
    MATCHES_REGEX = "matches_regex",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    IN_RANGE = "in_range",
    TIME_WITHIN = "time_within",
    GEO_WITHIN = "geo_within",
    SIMILAR_TO = "similar_to",
    PATTERN_MATCH = "pattern_match"

export interface CorrelationAction {
    actionType: CorrelationActionType;
    parameters: Record<string, unknown>;
    priority: number;
    enabled: boolean;

export declare enum CorrelationActionType {
    CREATE_INCIDENT = "create_incident",
    MERGE_EVENTS = "merge_events",
    ESCALATE_THREAT = "escalate_threat",
    TRIGGER_ALERT = "trigger_alert",
    UPDATE_RISK_SCORE = "update_risk_score",
    ADD_TO_WATCHLIST = "add_to_watchlist",
    TRIGGER_AUTOMATION = "trigger_automation",
    NOTIFY_STAKEHOLDERS = "notify_stakeholders"

export interface CorrelatedEventGroup {
    groupId: string;
    createdAt: Date;
    lastUpdated: Date;
    groupType: EventGroupType;
    severity: AnomalySeverity;
    confidence: number;
    riskScore: number;
    events: SecurityEvent[];
    correlationEvidence: CorrelationEvidence[];
    timeline: EventTimeline[];
    affectedSystems: string[];
    affectedUsers: string[];
    threatIndicators: ThreatIndicator[];
    recommendations: GroupRecommendation[];
    status: GroupStatus;

export declare enum EventGroupType {
    ATTACK_CAMPAIGN = "attack_campaign",
    SECURITY_INCIDENT = "security_incident",
    ANOMALY_CLUSTER = "anomaly_cluster",
    THREAT_PATTERN = "threat_pattern",
    OPERATIONAL_ISSUE = "operational_issue",
    COMPLIANCE_VIOLATION = "compliance_violation",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    COORDINATED_ATTACK = "coordinated_attack"

export interface CorrelationEvidence {
    evidenceType: EvidenceType;
    strength: number;
    description: string;
    sources: string[];
    confidence: number;
    supportingData: Record<string, unknown>;

export declare enum EvidenceType {
    TEMPORAL_PROXIMITY = "temporal_proximity",
    GEOGRAPHIC_PROXIMITY = "geographic_proximity",
    COMMON_ATTRIBUTES = "common_attributes",
    PATTERN_SIMILARITY = "pattern_similarity",
    CAUSAL_RELATIONSHIP = "causal_relationship",
    SHARED_INFRASTRUCTURE = "shared_infrastructure",
    BEHAVIORAL_CORRELATION = "behavioral_correlation",
    STATISTICAL_CORRELATION = "statistical_correlation"

export interface EventTimeline {
    timestamp: Date;
    eventId: string;
    eventType: string;
    description: string;
    impact: number;
    source: string;

export interface ThreatIndicator {
    indicator: string;
    indicatorType: IndicatorType;
    confidence: number;
    severity: AnomalySeverity;
    firstSeen: Date;
    lastSeen: Date;
    frequency: number;
    associatedThreats: ThreatType[];

export declare enum IndicatorType {
    IP_ADDRESS = "ip_address",
    DOMAIN_NAME = "domain_name",
    URL_PATTERN = "url_pattern",
    FILE_HASH = "file_hash",
    USER_AGENT = "user_agent",
    BEHAVIORAL_PATTERN = "behavioral_pattern",
    ATTACK_SIGNATURE = "attack_signature",
    GEOLOCATION = "geolocation"

export interface GroupRecommendation {
    recommendationType: RecommendationType;
    priority: number;
    description: string;
    actionItems: string[];
    estimatedEffort: number;
    riskReduction: number;

export declare enum RecommendationType {
    IMMEDIATE_ACTION = "immediate_action",
    INVESTIGATION = "investigation",
    PREVENTIVE_MEASURE = "preventive_measure",
    POLICY_UPDATE = "policy_update",
    MONITORING_ENHANCEMENT = "monitoring_enhancement",
    USER_TRAINING = "user_training",
    INFRASTRUCTURE_CHANGE = "infrastructure_change",
    SECURITY_TOOL_DEPLOYMENT = "security_tool_deployment"

export declare enum GroupStatus {
    ACTIVE = "active",
    INVESTIGATING = "investigating",
    RESOLVED = "resolved",
    FALSE_POSITIVE = "false_positive",
    ARCHIVED = "archived"

export interface CorrelationAnalytics {
    totalEventsProcessed: number;
    correlatedEventsCount: number;
    activeGroupsCount: number;
    averageGroupSize: number;
    correlationAccuracy: number;
    falsePositiveRate: number;
    processingLatency: number;
    ruleEffectiveness: Map<string, RuleEffectiveness>;
    threatPatternStats: Map<ThreatType, PatternStats>;

export interface RuleEffectiveness {
    ruleId: string;
    triggeredCount: number;
    accuracyRate: number;
    falsePositiveRate: number;
    averageConfidence: number;
    lastTriggered: Date;

export interface PatternStats {
    threatType: ThreatType;
    detectionCount: number;
    averageSeverity: number;
    averageConfidence: number;
    commonAttributes: string[];
    firstDetected: Date;
    lastDetected: Date;

export interface CorrelationReport {
    reportId: string;
    generatedAt: Date;
    timeRange: {
        start: Date;
        end: Date;
    };
    summary: CorrelationSummary;
    topThreats: ThreatSummary[];
    correlationTrends: CorrelationTrend[];
    rulePerformance: RulePerformanceMetrics[];
    recommendations: SystemRecommendation[];

export interface CorrelationSummary {
    totalEvents: number;
    correlatedEvents: number;
    activeGroups: number;
    resolvedGroups: number;
    highSeverityGroups: number;
    averageCorrelationTime: number;
    correlationEfficiency: number;

export interface ThreatSummary {
    threatType: ThreatType;
    eventCount: number;
    groupCount: number;
    averageSeverity: number;
    trendDirection: 'increasing' | 'decreasing' | 'stable';
    keyIndicators: string[];

export interface CorrelationTrend {
    timeframe: string;
    metric: string;
    value: number;
    changePercent: number;
    significance: 'high' | 'medium' | 'low';

export interface RulePerformanceMetrics {
    ruleId: string;
    ruleName: string;
    executionCount: number;
    successRate: number;
    averageExecutionTime: number;
    impactScore: number;

export interface SystemRecommendation {
    category: 'rules' | 'performance' | 'coverage' | 'accuracy';
    priority: number;
    title: string;
    description: string;
    expectedBenefit: string;
    implementationEffort: 'low' | 'medium' | 'high';

export declare class SecurityEventCorrelationEngine extends EventEmitter {
    private config;
    private eventBuffer;
    private correlatedGroups;
    private correlationRules;
    private analytics;
    private threatIndicators;
    private processingQueue;
    private isProcessing;
    constructor(config: CorrelationConfig);
    processEvent(event: SecurityEvent): Promise<void>;
    processEvents(events: SecurityEvent[]): Promise<void>;
    correlateEvents(timeWindow?: number): Promise<CorrelatedEventGroup[]>;
    getCorrelatedGroup(groupId: string): CorrelatedEventGroup | undefined;
    getActiveGroups(): CorrelatedEventGroup[];
    updateGroupStatus(groupId: string, status: GroupStatus, notes?: string): Promise<void>;
    addCorrelationRule(rule: Omit<CorrelationRule, 'id' | 'lastUpdated' | 'triggeredCount'>): string;
    updateCorrelationRule(ruleId: string, updates: Partial<CorrelationRule>): void;
    deleteCorrelationRule(ruleId: string): void;
    getAnalytics(): CorrelationAnalytics;
    generateReport(timeRange: {)
        start: Date;
        end: Date;
    }): Promise<CorrelationReport>;
    private initializeCorrelationRules;
    private startRealTimeProcessing;
    private processEventQueue;
    private cleanupEventBuffer;
    private performCorrelation;
    private evaluateRule;
    private evaluateCondition;
    private getFieldValue;
    private calculateSimilarity;
    private createCorrelatedGroup;
    private calculateGroupSeverity;
    private calculateGroupConfidence;
    private calculateGroupRiskScore;
    private generateCorrelationEvidence;
    private findCommonAttributes;
    private generateEventTimeline;
    private calculateEventImpact;
    private extractGroupThreatIndicators;
    private inferThreatType;
    private generateGroupRecommendations;
    private determineGroupType;
    private extractThreatIndicators;
    private updateAnalytics;
    private updateRuleEffectiveness;
    private calculateCorrelationSummary;
    private analyzeTopThreats;
    private severityToNumber;
    private analyzeCorrelationTrends;
    private analyzeRulePerformance;
    private generateSystemRecommendations;

export declare class SecurityEventCorrelationFactory {
    static createDefaultConfig(): CorrelationConfig;
    static createHighSensitivityConfig(): CorrelationConfig;
    static createPerformanceOptimizedConfig(): CorrelationConfig;
    static createEngine(config?: Partial<CorrelationConfig>): SecurityEventCorrelationEngine;

export default SecurityEventCorrelationEngine;
//# sourceMappingURL=SecurityEventCorrelationEngine.d.ts.map