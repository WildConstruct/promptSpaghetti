/**
 * Predictive Funnel Performance Modeling - Story 30.2 Task 7
 *
 * Advanced predictive modeling system that forecasts funnel performance,
 * predicts user behavior, and provides proactive optimization recommendations.
 *
 * Features:
 * - Machine learning-based performance forecasting
 * - User behavior prediction and churn modeling
 * - Seasonal trend analysis and forecasting
 * - Scenario planning and what-if analysis
 * - Predictive cohort analysis and lifetime value modeling
 * - Real-time model updating and drift detection
 * - Multi-horizon forecasting (short, medium, long-term)
 * - Confidence intervals and prediction uncertainty quantification
 */
import React from 'react';
import { ConversionFunnelDefinition, UserSegment, ConversionCohort } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface FunnelPredictiveModelingProps {
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number;
    };
    modelConfig?: PredictiveModelConfiguration;
    segments?: UserSegment[];
    cohorts?: ConversionCohort[];
    forecastHorizon?: ForecastHorizon;
    onPredictionUpdate?: (prediction: PredictionUpdate) => void;
    onModelAlert?: (alert: ModelAlert) => void;
    onExport?: (data: PredictiveModelingExportData) => void;
}
export interface PredictiveModelConfiguration {
    models: PredictiveModelType[];
    updateFrequency: ModelUpdateFrequency;
    confidenceLevel: number;
    seasonalityDetection: boolean;
    trendAnalysis: boolean;
    externalFactors: ExternalFactor[];
    modelValidation: ModelValidationConfig;
    ensemble: EnsembleConfig;
}
export type PredictiveModelType = 'linear_regression' | 'random_forest' | 'gradient_boosting' | 'neural_network' | 'arima' | 'prophet' | 'lstm' | 'transformer' | 'ensemble';
export type ModelUpdateFrequency = 'real_time' | 'hourly' | 'daily' | 'weekly';
export type ForecastHorizon = 'short' | 'medium' | 'long' | 'custom';
export interface PredictiveModelingData {
    performanceForecasts: PerformanceForecast[];
    userBehaviorPredictions: UserBehaviorPrediction[];
    churnPredictions: ChurnPrediction[];
    seasonalAnalysis: SeasonalAnalysis[];
    scenarioAnalysis: ScenarioAnalysis[];
    cohortPredictions: CohortPrediction[];
    modelPerformance: ModelPerformanceMetrics[];
    predictionHistory: PredictionHistoryEntry[];
    uncertaintyAnalysis: UncertaintyAnalysis[];
    featureImportance: FeatureImportanceData[];
}
export interface PerformanceForecast {
    forecastId: string;
    model: PredictiveModelType;
    horizon: ForecastHorizon;
    timePoints: ForecastTimePoint[];
    metrics: ForecastMetrics;
    confidence: ConfidenceInterval;
    factors: ForecastFactor[];
    scenarios: ForecastScenario[];
    accuracy: ForecastAccuracy;
    lastUpdated: number;
}
export interface ForecastTimePoint {
    timestamp: number;
    period: string;
    predictions: MetricPrediction[];
    confidence: number;
    uncertainty: number;
    contributingFactors: ContributingFactor[];
}
export interface MetricPrediction {
    metric: string;
    predictedValue: number;
    actualValue?: number;
    prediction_error?: number;
    confidence: ConfidenceInterval;
    trend: TrendDirection;
    volatility: number;
}
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'cyclical' | 'volatile';
export interface ConfidenceInterval {
    lower: number;
    upper: number;
    level: number;
}
export interface ForecastMetrics {
    conversionRate: MetricForecast;
    revenue: MetricForecast;
    userAcquisition: MetricForecast;
    churnRate: MetricForecast;
    lifetimeValue: MetricForecast;
    engagementScore: MetricForecast;
}
export interface MetricForecast {
    metric: string;
    currentValue: number;
    forecastedValue: number;
    changePercent: number;
    trend: TrendDirection;
    confidence: ConfidenceInterval;
    seasonality: SeasonalityPattern;
}
export interface SeasonalityPattern {
    detected: boolean;
    period: number;
    amplitude: number;
    phase: number;
    strength: number;
}
export interface ForecastFactor {
    factor: string;
    impact: number;
    confidence: number;
    description: string;
    source: 'historical' | 'external' | 'model_derived';
}
export interface ForecastScenario {
    scenarioId: string;
    name: string;
    description: string;
    assumptions: ScenarioAssumption[];
    outcomes: ScenarioOutcome[];
    probability: number;
}
export interface ScenarioAssumption {
    parameter: string;
    value: number;
    description: string;
}
export interface ScenarioOutcome {
    metric: string;
    predictedValue: number;
    impact: number;
    confidence: number;
}
export interface ForecastAccuracy {
    mae: number;
    mape: number;
    rmse: number;
    r2: number;
    accuracy: number;
    lastValidation: number;
}
export interface UserBehaviorPrediction {
    userId: string;
    segment: string;
    cohort?: string;
    behaviorPredictions: BehaviorPrediction[];
    nextActions: PredictedAction[];
    engagement: EngagementPrediction;
    conversionProbability: ConversionProbability;
    churnRisk: ChurnRisk;
    recommendedInterventions: Intervention[];
}
export interface BehaviorPrediction {
    behavior: string;
    probability: number;
    confidence: number;
    timeframe: number;
    factors: PredictionFactor[];
}
export interface PredictedAction {
    action: string;
    probability: number;
    expectedTimestamp: number;
    value: number;
    confidence: number;
}
export interface EngagementPrediction {
    currentScore: number;
    predictedScore: number;
    trend: TrendDirection;
    riskLevel: 'low' | 'medium' | 'high';
    drivers: EngagementDriver[];
}
export interface EngagementDriver {
    factor: string;
    impact: number;
    controllable: boolean;
    recommendation: string;
}
export interface ConversionProbability {
    probability: number;
    confidence: number;
    timeToConversion: number;
    conversionValue: number;
    steps: StepConversionProbability[];
    factors: ConversionFactor[];
}
export interface StepConversionProbability {
    stepId: string;
    stepName: string;
    probability: number;
    bottleneck: boolean;
    optimizationPotential: number;
}
export interface ConversionFactor {
    factor: string;
    weight: number;
    direction: 'positive' | 'negative';
    controllable: boolean;
}
export interface ChurnRisk {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    timeToChurn: number;
    churnProbability: number;
    preventionRecommendations: ChurnPreventionRecommendation[];
}
export interface ChurnPreventionRecommendation {
    intervention: string;
    effectiveness: number;
    cost: number;
    urgency: 'immediate' | 'high' | 'medium' | 'low';
    implementation: string;
}
export interface Intervention {
    type: InterventionType;
    description: string;
    timing: number;
    expectedImpact: number;
    cost: number;
    success_probability: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
}
export type InterventionType = 'personalized_offer' | 'content_recommendation' | 'email_campaign' | 'push_notification' | 'chat_support' | 'product_recommendation' | 'pricing_adjustment' | 'feature_highlight';
export interface ChurnPrediction {
    segmentId?: string;
    cohortId?: string;
    timeHorizon: number;
    churnRate: ChurnRatePrediction;
    riskSegments: RiskSegment[];
    preventionStrategies: PreventionStrategy[];
    impactAnalysis: ChurnImpactAnalysis;
}
export interface ChurnRatePrediction {
    currentRate: number;
    predictedRate: number;
    confidence: ConfidenceInterval;
    factors: ChurnFactor[];
    seasonality: SeasonalityPattern;
}
export interface ChurnFactor {
    factor: string;
    impact: number;
    trend: TrendDirection;
    controllable: boolean;
    prevention: PreventionAction[];
}
export interface PreventionAction {
    action: string;
    effectiveness: number;
    cost: number;
    feasibility: 'high' | 'medium' | 'low';
}
export interface RiskSegment {
    segmentId: string;
    segmentName: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    churnProbability: number;
    size: number;
    value: number;
    characteristics: SegmentCharacteristic[];
}
export interface SegmentCharacteristic {
    characteristic: string;
    value: string | number;
    importance: number;
}
export interface PreventionStrategy {
    strategyId: string;
    name: string;
    description: string;
    targetSegments: string[];
    effectiveness: number;
    cost: number;
    timeline: number;
    kpis: PreventionKPI[];
}
export interface PreventionKPI {
    metric: string;
    target: number;
    current: number;
    improvement: number;
}
export interface ChurnImpactAnalysis {
    revenueImpact: number;
    userImpact: number;
    retentionCost: number;
    acquisitionCost: number;
    netImpact: number;
    timeSensitivity: 'critical' | 'high' | 'medium' | 'low';
}
export interface SeasonalAnalysis {
    pattern: SeasonalPattern;
    forecast: SeasonalForecast[];
    anomalies: SeasonalAnomaly[];
    recommendations: SeasonalRecommendation[];
}
export interface SeasonalPattern {
    type: 'yearly' | 'monthly' | 'weekly' | 'daily';
    strength: number;
    peaks: SeasonalPeak[];
    troughs: SeasonalTrough[];
    stability: number;
}
export interface SeasonalPeak {
    period: string;
    amplitude: number;
    reliability: number;
    duration: number;
}
export interface SeasonalTrough {
    period: string;
    amplitude: number;
    reliability: number;
    duration: number;
}
export interface SeasonalForecast {
    period: string;
    expectedValue: number;
    confidence: ConfidenceInterval;
    preparation: SeasonalPrepartion[];
}
export interface SeasonalPrepartion {
    action: string;
    timing: number;
    impact: number;
    resources: string[];
}
export interface SeasonalAnomaly {
    period: string;
    expectedValue: number;
    actualValue: number;
    deviation: number;
    significance: 'high' | 'medium' | 'low';
    explanation: string;
}
export interface SeasonalRecommendation {
    recommendation: string;
    seasonality: string;
    impact: number;
    implementation: string;
    timing: SeasonalTiming;
}
export interface SeasonalTiming {
    startDate: number;
    endDate: number;
    preparation: number;
    duration: number;
}
export interface ScenarioAnalysis {
    scenarioId: string;
    name: string;
    description: string;
    parameters: ScenarioParameter[];
    outcomes: ScenarioOutcome[];
    probability: number;
    impactAnalysis: ScenarioImpactAnalysis;
    recommendations: ScenarioRecommendation[];
}
export interface ScenarioParameter {
    parameter: string;
    baseValue: number;
    scenarioValue: number;
    impact: number;
    controllable: boolean;
}
export interface ScenarioImpactAnalysis {
    revenueImpact: number;
    conversionImpact: number;
    userImpact: number;
    costImpact: number;
    timeframe: number;
    confidence: number;
}
export interface ScenarioRecommendation {
    action: string;
    preparationTime: number;
    resources: string[];
    expectedBenefit: number;
    riskMitigation: string;
}
export interface CohortPrediction {
    cohortId: string;
    cohortName: string;
    lifecycle: CohortLifecyclePrediction;
    valueProjection: CohortValueProjection;
    behaviorEvolution: CohortBehaviorEvolution;
    optimizationOpportunities: CohortOptimizationOpportunity[];
}
export interface CohortLifecyclePrediction {
    currentStage: LifecycleStage;
    predictedStage: LifecycleStage;
    transitionProbability: number;
    timeToTransition: number;
    stageMetrics: StageMetrics[];
}
export interface LifecycleStage {
    stage: 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral' | 'churn';
    probability: number;
    characteristics: StageCharacteristic[];
}
export interface StageCharacteristic {
    characteristic: string;
    value: number;
    trend: TrendDirection;
}
export interface StageMetrics {
    stage: string;
    duration: number;
    conversionRate: number;
    dropoffRate: number;
    value: number;
}
export interface CohortValueProjection {
    currentValue: number;
    projectedValue: number;
    valueTrajectory: ValuePoint[];
    peakValue: number;
    peakTime: number;
    factors: ValueFactor[];
}
export interface ValuePoint {
    timestamp: number;
    value: number;
    confidence: ConfidenceInterval;
}
export interface ValueFactor {
    factor: string;
    contribution: number;
    trend: TrendDirection;
    controllable: boolean;
}
export interface CohortBehaviorEvolution {
    currentBehavior: BehaviorProfile;
    predictedBehavior: BehaviorProfile;
    behaviorTrajectory: BehaviorPoint[];
    keyChanges: BehaviorChange[];
}
export interface BehaviorProfile {
    engagementLevel: number;
    activityFrequency: number;
    preferences: Preference[];
    riskFactors: RiskFactor[];
}
export interface Preference {
    category: string;
    weight: number;
    stability: number;
}
export interface RiskFactor {
    factor: string;
    severity: number;
    trend: TrendDirection;
}
export interface BehaviorPoint {
    timestamp: number;
    profile: BehaviorProfile;
    confidence: number;
}
export interface BehaviorChange {
    change: string;
    impact: number;
    probability: number;
    timeframe: number;
    intervention: string;
}
export interface CohortOptimizationOpportunity {
    opportunity: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
    timeframe: number;
    resources: string[];
    kpis: OptimizationKPI[];
}
export interface OptimizationKPI {
    metric: string;
    current: number;
    target: number;
    improvement: number;
}
export interface ModelPerformanceMetrics {
    model: PredictiveModelType;
    accuracy: ModelAccuracy;
    performance: PerformanceMetric[];
    training: TrainingMetrics;
    drift: ModelDrift;
    lastUpdate: number;
}
export interface ModelAccuracy {
    overall: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    calibration: number;
}
export interface PerformanceMetric {
    metric: string;
    value: number;
    benchmark: number;
    percentile: number;
}
export interface TrainingMetrics {
    trainingSize: number;
    validationSize: number;
    testSize: number;
    features: number;
    trainingTime: number;
    convergence: number;
}
export interface ModelDrift {
    detected: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    features: DriftingFeature[];
    recommendation: string;
    lastCheck: number;
}
export interface DriftingFeature {
    feature: string;
    driftScore: number;
    impact: number;
    action: 'monitor' | 'retrain' | 'replace';
}
export interface PredictionHistoryEntry {
    timestamp: number;
    prediction: any;
    actual?: any;
    accuracy: number;
    model: PredictiveModelType;
}
export interface UncertaintyAnalysis {
    source: UncertaintySource;
    impact: number;
    mitigation: UncertaintyMitigation[];
    confidence: number;
}
export interface UncertaintySource {
    type: 'data_quality' | 'model_limitation' | 'external_factor' | 'measurement_error';
    description: string;
    quantification: number;
}
export interface UncertaintyMitigation {
    strategy: string;
    effectiveness: number;
    cost: number;
    timeline: number;
}
export interface FeatureImportanceData {
    feature: string;
    importance: number;
    stability: number;
    interpretation: string;
    actionability: 'high' | 'medium' | 'low';
}
export interface ExternalFactor {
    factor: string;
    impact: number;
    reliability: number;
    source: string;
    updateFrequency: string;
}
export interface ModelValidationConfig {
    crossValidation: boolean;
    holdoutPercentage: number;
    timeBasedSplit: boolean;
    validationMetrics: string[];
}
export interface EnsembleConfig {
    enabled: boolean;
    models: PredictiveModelType[];
    weightingStrategy: 'equal' | 'performance' | 'dynamic';
    combinationMethod: 'average' | 'weighted' | 'voting' | 'stacking';
}
export interface PredictionUpdate {
    type: 'forecast' | 'behavior' | 'churn' | 'seasonal';
    update: any;
    confidence: number;
    impact: 'high' | 'medium' | 'low';
    timestamp: number;
}
export interface ModelAlert {
    alertType: 'drift' | 'accuracy_drop' | 'data_quality' | 'anomaly';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    affectedModels: PredictiveModelType[];
    recommendation: string;
    timestamp: number;
}
export interface ContributingFactor {
    factor: string;
    contribution: number;
    confidence: number;
}
export interface PredictionFactor {
    factor: string;
    weight: number;
    direction: 'positive' | 'negative';
    confidence: number;
}
export interface PredictiveModelingExportData {
    performanceForecasts: PerformanceForecast[];
    userBehaviorPredictions: UserBehaviorPrediction[];
    churnPredictions: ChurnPrediction[];
    scenarioAnalysis: ScenarioAnalysis[];
    modelPerformance: ModelPerformanceMetrics[];
    exportTimestamp: number;
    configuration: PredictiveModelConfiguration;
}
export declare const FunnelPredictiveModeling: React.FC<FunnelPredictiveModelingProps>;
//# sourceMappingURL=FunnelPredictiveModeling.d.ts.map