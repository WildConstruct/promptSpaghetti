/**
 * Epic 31.4.2 - Predictive Security Analytics and Threat Forecasting Models
 *
 * Implements advanced machine learning models for time series security analysis
 * and threat forecasting. Provides predictive capabilities for threat evolution,
 * seasonal patterns, and trend-based risk assessment.
 *
 * Task: E31-1753313263579-E78714
 */
import { EventEmitter } from 'events';
import { SecurityEvent, ThreatType } from './PredictiveSecurityAnalytics';
import { SecurityAnomaly } from './SecurityAnomalyDetector';
export interface ThreatForecast {
    forecastId: string;
    timestamp: Date;
    forecastType: ForecastType;
    threatType: ThreatType;
    timeHorizon: number;
    confidence: number;
    predictedIntensity: number;
    predictedProbability: number;
    seasonalFactors: SeasonalFactor;
    trendComponents: TrendComponent;
    riskMetrics: ForecastRiskMetrics;
    recommendations: ForecastRecommendation;
    modelMetadata: ForecastModelMetadata;
}
export declare enum ForecastType {
    SHORT_TERM = "short_term",// 0-4 hours
    MEDIUM_TERM = "medium_term",// 4-24 hours
    LONG_TERM = "long_term",// 1-7 days
    SEASONAL = "seasonal",// Weekly/monthly patterns
    TREND_BASED = "trend_based",// Trend extrapolation
    SCENARIO_BASED = "scenario_based",// Specific scenario modeling
    export,
    interface,
    SeasonalFactor
}
export declare enum SeasonalPeriod {
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    export,
    interface,
    TrendComponent
}
export declare enum TrendType {
    LINEAR = "linear",
    EXPONENTIAL = "exponential",
    LOGARITHMIC = "logarithmic",
    POLYNOMIAL = "polynomial",
    CYCLICAL = "cyclical",
    VOLATILE = "volatile",
    export,
    interface,
    ChangePoint
}
export interface ForecastRiskMetrics {
    expectedValue: number;
    valueAtRisk: number;
    conditionalValueAtRisk: number;
    volatilityIndex: number;
    uncertaintyRange: [number, number];
    scenarioRisks: ScenarioRisk;
}
export interface ScenarioRisk {
    scenario: string;
    probability: number;
    impact: number;
    description: string;
}
export interface ForecastRecommendation {
    type: RecommendationType;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    description: string;
    expectedBenefit: number;
    implementationCost: number;
    timeframe: string;
    dependencies: string;
}
export declare enum RecommendationType {
    PROACTIVE_DEFENSE = "proactive_defense",
    RESOURCE_SCALING = "resource_scaling",
    ALERT_TUNING = "alert_tuning",
    POLICY_ADJUSTMENT = "policy_adjustment",
    MONITORING_ENHANCEMENT = "monitoring_enhancement",
    TRAINING_RECOMMENDATION = "training_recommendation",
    INFRASTRUCTURE_CHANGE = "infrastructure_change",
    export,
    interface,
    ForecastModelMetadata
}
export declare enum ForecastAlgorithm {
    ARIMA = "arima",
    LSTM = "lstm",
    PROPHET = "prophet",
    SEASONAL_NAIVE = "seasonal_naive",
    EXPONENTIAL_SMOOTHING = "exponential_smoothing",
    RANDOM_FOREST = "random_forest",
    GRADIENT_BOOSTING = "gradient_boosting",
    ENSEMBLE = "ensemble",
    export,
    interface,
    ModelAccuracyMetrics
}
export interface TimeSeriesData {
    timestamp: Date;
    value: number;
    metadata: Record<string, unknown>;
}
export interface ForecastingConfig {
    enableRealTimeForecasting: boolean;
    forecastUpdateInterval: number;
    defaultTimeHorizon: number;
    confidenceThreshold: number;
    enableSeasonalDecomposition: boolean;
    enableTrendAnalysis: boolean;
    enableEnsembleModels: boolean;
    maxHistoryDays: number;
    minDataPointsForForecast: number;
}
export interface ThreatScenario {
    scenarioId: string;
    name: string;
    description: string;
    threatTypes: ThreatType;
    triggers: ScenarioTrigger;
    expectedDuration: number;
    expectedIntensity: number;
    likelihood: number;
    impactAssessment: ScenarioImpact;
}
export interface ScenarioTrigger {
    triggerType: 'metric_threshold' | 'anomaly_count' | 'time_based' | 'external_event';
    condition: string;
    weight: number;
}
export interface ScenarioImpact {
    businessImpact: number;
    technicalImpact: number;
    reputationalImpact: number;
    financialImpact: number;
    complianceImpact: number;
}
export declare class SecurityThreatForecasting extends EventEmitter {
    private config;
    private timeSeriesData;
    private activeForecasts;
    private forecastingModels;
    private threatScenarios;
    private seasonalDecompositions;
    private isForecasting;
    private forecastingInterval?;
    constructor(config?: Partial<ForecastingConfig>);
    /**
    * Process security event for time series analysis
    */
    processSecurityEvent(event: SecurityEvent): Promise<void>;
    /**
     * Process security anomaly for trend analysis
     */
    processSecurityAnomaly(anomaly: SecurityAnomaly): Promise<void>;
    /**
     * Generate comprehensive threat forecast
     */
    generateThreatForecast(): any;
}
//# sourceMappingURL=SecurityThreatForecasting.d.ts.map