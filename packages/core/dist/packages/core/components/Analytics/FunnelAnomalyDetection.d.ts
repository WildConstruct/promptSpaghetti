/**
 * Funnel Anomaly Detection and Alerting System - Story 30.2 Task 7
 *
 * Advanced anomaly detection system that monitors funnel performance in real-time,
 * identifies unusual patterns, and triggers appropriate alerts and notifications.
 *
 * Features:
 * - Multi-dimensional anomaly detection (statistical, ML-based, rule-based)
 * - Real-time monitoring with configurable alert thresholds
 * - Anomaly classification and severity scoring
 * - Root cause analysis and impact assessment
 * - Automated alert routing and escalation
 * - Historical anomaly tracking and pattern analysis
 * - Predictive anomaly forecasting
 * - Integration with external monitoring systems
 */
import React from 'react';
import { ConversionFunnelDefinition, UserSegment, ConversionCohort } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface FunnelAnomalyDetectionProps {
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number;
    };
    detectionConfig?: AnomalyDetectionConfig;
    alertConfig?: AlertConfiguration;
    segments?: UserSegment[];
    cohorts?: ConversionCohort[];
    realTimeMonitoring?: boolean;
    onAnomalyDetected?: (anomaly: DetectedAnomaly) => void;
    onAlertTriggered?: (alert: AnomalyAlert) => void;
    onExport?: (data: AnomalyDetectionExportData) => void;
}
export interface AnomalyDetectionConfig {
    algorithms: AnomalyAlgorithm[];
    sensitivityLevel: 'low' | 'medium' | 'high' | 'adaptive';
    minimumConfidence: number;
    lookbackPeriods: number;
    seasonalityDetection: boolean;
    trendAnalysis: boolean;
    segmentAnalysis: boolean;
    cohortAnalysis: boolean;
    customRules: CustomAnomalyRule[];
}
export interface AlertConfiguration {
    channels: AlertChannel[];
    escalationRules: EscalationRule[];
    suppressionRules: SuppressionRule[];
    throttling: AlertThrottling;
    severity: AlertSeverityConfig;
    recipients: AlertRecipient[];
}
export type AnomalyAlgorithm = 'statistical_zscore' | 'statistical_iqr' | 'isolation_forest' | 'local_outlier_factor' | 'prophet_decomposition' | 'lstm_autoencoder' | 'seasonal_hybrid_esd' | 'changepoint_detection';
export interface AnomalyDetectionData {
    currentAnomalies: DetectedAnomaly[];
    historicalAnomalies: DetectedAnomaly[];
    anomalyTrends: AnomalyTrend[];
    predictedAnomalies: PredictedAnomaly[];
    rootCauseAnalysis: RootCauseAnalysis[];
    impactAssessment: AnomalyImpactAssessment[];
    alertHistory: AnomalyAlert[];
    systemHealth: SystemHealthMetrics;
    detectionPerformance: DetectionPerformanceMetrics;
}
export interface DetectedAnomaly {
    id: string;
    timestamp: number;
    type: AnomalyType;
    severity: AnomalySeverity;
    confidence: number;
    affectedStep?: string;
    affectedSegment?: string;
    affectedCohort?: string;
    metric: string;
    expectedValue: number;
    actualValue: number;
    deviation: number;
    deviationPercentage: number;
    algorithm: AnomalyAlgorithm;
    description: string;
    context: AnomalyContext;
    rootCauses: PotentialRootCause[];
    impact: AnomalyImpact;
    recommendations: AnomalyRecommendation[];
    status: AnomalyStatus;
    acknowledgedBy?: string;
    acknowledgedAt?: number;
    resolvedAt?: number;
    falsePositive?: boolean;
}
export type AnomalyType = 'performance_drop' | 'performance_spike' | 'traffic_anomaly' | 'conversion_anomaly' | 'revenue_anomaly' | 'temporal_anomaly' | 'segment_anomaly' | 'cohort_anomaly' | 'technical_anomaly';
export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AnomalyStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
export interface AnomalyContext {
    timeOfDay: number;
    dayOfWeek: number;
    seasonality: string;
    environmentalFactors: EnvironmentalFactor[];
    concurrentEvents: ConcurrentEvent[];
    marketConditions: MarketCondition[];
    systemMetrics: SystemMetric[];
}
export interface EnvironmentalFactor {
    factor: string;
    value: string | number;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
}
export interface ConcurrentEvent {
    eventType: string;
    eventName: string;
    timestamp: number;
    impact: string;
    correlation: number;
}
export interface MarketCondition {
    indicator: string;
    value: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    volatility: number;
}
export interface SystemMetric {
    metric: string;
    value: number;
    threshold: number;
    status: 'normal' | 'warning' | 'critical';
}
export interface PotentialRootCause {
    category: RootCauseCategory;
    description: string;
    probability: number;
    evidence: Evidence[];
    investigationSteps: string[];
}
export type RootCauseCategory = 'technical' | 'user_behavior' | 'external_factors' | 'business_changes' | 'seasonal' | 'competitive' | 'system_performance';
export interface Evidence {
    type: string;
    description: string;
    strength: 'weak' | 'moderate' | 'strong';
    timestamp: number;
    source: string;
}
export interface AnomalyImpact {
    revenueImpact: number;
    userImpact: number;
    conversionImpact: number;
    scopeOfImpact: 'localized' | 'widespread' | 'system_wide';
    durationEstimate: number;
    recoveryEstimate: number;
    businessCritical: boolean;
}
export interface AnomalyRecommendation {
    action: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    expectedImpact: 'low' | 'medium' | 'high';
    timeline: string;
    owner: string;
    dependencies: string[];
}
export interface AnomalyTrend {
    period: string;
    anomalyCount: number;
    severityDistribution: Record<AnomalySeverity, number>;
    typeDistribution: Record<AnomalyType, number>;
    falsePositiveRate: number;
    averageDetectionTime: number;
    averageResolutionTime: number;
}
export interface PredictedAnomaly {
    predictedTimestamp: number;
    type: AnomalyType;
    probability: number;
    expectedSeverity: AnomalySeverity;
    affectedMetric: string;
    preventiveActions: PreventiveAction[];
    monitoringPlan: MonitoringPlan;
}
export interface PreventiveAction {
    action: string;
    effectiveness: number;
    cost: number;
    timeline: string;
    dependencies: string[];
}
export interface MonitoringPlan {
    metrics: string[];
    frequency: number;
    alertThresholds: Record<string, number>;
    escalationPlan: string[];
}
export interface RootCauseAnalysis {
    anomalyId: string;
    analysisTimestamp: number;
    primaryCause: PotentialRootCause;
    contributingFactors: PotentialRootCause[];
    correlatedAnomalies: string[];
    timeline: CausalTimeline[];
    confidence: number;
    validationStatus: 'pending' | 'confirmed' | 'rejected';
}
export interface CausalTimeline {
    timestamp: number;
    event: string;
    impact: string;
    correlation: number;
}
export interface AnomalyImpactAssessment {
    anomalyId: string;
    assessmentTimestamp: number;
    directImpact: DirectImpact;
    indirectImpact: IndirectImpact;
    totalImpact: TotalImpact;
    affectedUserSegments: AffectedSegment[];
    businessImplications: BusinessImplication[];
    recoveryProjection: RecoveryProjection;
}
export interface DirectImpact {
    revenueloss: number;
    userLoss: number;
    conversionLoss: number;
    engagementLoss: number;
}
export interface IndirectImpact {
    brandReputation: number;
    customerSatisfaction: number;
    futureImpact: number;
    competitiveDisadvantage: number;
}
export interface TotalImpact {
    monetaryValue: number;
    userValue: number;
    strategicValue: number;
    severity: AnomalySeverity;
}
export interface AffectedSegment {
    segmentId: string;
    segmentName: string;
    impactPercentage: number;
    recoveryTime: number;
}
export interface BusinessImplication {
    area: string;
    impact: string;
    severity: 'low' | 'medium' | 'high';
    mitigation: string;
}
export interface RecoveryProjection {
    estimatedRecoveryTime: number;
    recoveryStages: RecoveryStage[];
    successProbability: number;
    resourceRequirements: ResourceRequirement[];
}
export interface RecoveryStage {
    stage: string;
    duration: number;
    expectedImprovement: number;
    dependencies: string[];
}
export interface ResourceRequirement {
    resource: string;
    amount: number;
    duration: number;
    criticality: 'essential' | 'important' | 'nice_to_have';
}
export interface AnomalyAlert {
    id: string;
    anomalyId: string;
    timestamp: number;
    severity: AnomalySeverity;
    channel: AlertChannel;
    recipient: string;
    status: AlertStatus;
    message: string;
    escalationLevel: number;
    acknowledgedBy?: string;
    acknowledgedAt?: number;
    resolvedAt?: number;
}
export type AlertChannel = 'email' | 'sms' | 'slack' | 'webhook' | 'pagerduty' | 'dashboard';
export type AlertStatus = 'sent' | 'delivered' | 'acknowledged' | 'escalated' | 'resolved';
export interface EscalationRule {
    severity: AnomalySeverity;
    escalationDelay: number;
    escalationChain: string[];
    maxEscalations: number;
}
export interface SuppressionRule {
    anomalyType: AnomalyType;
    suppressionDuration: number;
    conditions: SuppressionCondition[];
}
export interface SuppressionCondition {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | [number, number];
}
export interface AlertThrottling {
    enabled: boolean;
    maxAlertsPerHour: number;
    maxAlertsPerDay: number;
    cooldownPeriod: number;
}
export interface AlertSeverityConfig {
    critical: AlertSeveritySettings;
    high: AlertSeveritySettings;
    medium: AlertSeveritySettings;
    low: AlertSeveritySettings;
    info: AlertSeveritySettings;
}
export interface AlertSeveritySettings {
    enabled: boolean;
    channels: AlertChannel[];
    immediateAlert: boolean;
    escalationEnabled: boolean;
}
export interface AlertRecipient {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    slackId?: string;
    roles: string[];
    severity: AnomalySeverity[];
    availability: AvailabilitySchedule;
}
export interface AvailabilitySchedule {
    timezone: string;
    schedule: DaySchedule[];
    holidays: string[];
    onCall: boolean;
}
export interface DaySchedule {
    day: number;
    startTime: string;
    endTime: string;
    available: boolean;
}
export interface CustomAnomalyRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    severity: AnomalySeverity;
    enabled: boolean;
    metrics: string[];
    thresholds: Record<string, number>;
}
export interface SystemHealthMetrics {
    detectionLatency: number;
    alertLatency: number;
    processingThroughput: number;
    falsePositiveRate: number;
    falseNegativeRate: number;
    systemAvailability: number;
    dataQuality: number;
}
export interface DetectionPerformanceMetrics {
    algorithm: AnomalyAlgorithm;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    avgDetectionTime: number;
    resourceUsage: number;
    confidence: number;
}
export interface AnomalyDetectionExportData {
    anomalies: DetectedAnomaly[];
    alerts: AnomalyAlert[];
    impactAssessments: AnomalyImpactAssessment[];
    rootCauseAnalyses: RootCauseAnalysis[];
    performanceMetrics: DetectionPerformanceMetrics[];
    exportTimestamp: number;
    configuration: AnomalyDetectionConfig;
}
export declare const error: string, setError: React.Dispatch<React.SetStateAction<string>>;
//# sourceMappingURL=FunnelAnomalyDetection.d.ts.map