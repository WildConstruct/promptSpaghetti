/**
 * Cohort-based Funnel Analysis - Story 30.2 Task 6
 *
 * Advanced cohort analysis for funnel performance with comparative analysis,
 * retention tracking, and lifecycle progression monitoring.
 *
 * Features:
 * - Multi-cohort funnel performance comparison
 * - Cohort retention and progression analysis
 * - Lifecycle stage funnel analysis
 * - Cohort behavior pattern detection
 * - Value-based cohort segmentation
 * - Predictive cohort modeling
 * - Cross-cohort insights and recommendations
 * - Cohort health scoring
 */
import React from 'react';
import { ConversionFunnelDefinition, ConversionCohort } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface CohortFunnelAnalysisProps {
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number;
    };
    selectedCohorts?: ConversionCohort;
    analysisMode?: CohortAnalysisMode;
    showRetention?: boolean;
    showPredictions?: boolean;
    onCohortInsight?: (insight: CohortInsight) => void;
    onExport?: (data: CohortAnalysisExportData) => void;
}
export type CohortAnalysisMode = 'comparative' | 'progression' | 'retention' | 'value_based' | 'lifecycle';
export interface CohortAnalysisData {
    cohortPerformance: CohortPerformanceData;
    comparativeAnalysis: CohortComparativeAnalysis;
    retentionAnalysis: CohortRetentionAnalysis;
    lifecycleAnalysis: CohortLifecycleAnalysis;
    behaviorPatterns: CohortBehaviorPattern;
    valueAnalysis: CohortValueAnalysis;
    predictiveModels: CohortPredictiveModel;
    insights: CohortInsight;
    healthScores: CohortHealthScore;
}
export interface CohortPerformanceData {
    cohortId: string;
    cohortName: string;
    cohortDefinition: CohortDefinitionSummary;
    funnelMetrics: CohortFunnelMetrics;
    stepPerformance: CohortStepPerformance;
    temporalPerformance: CohortTemporalPerformance;
    progressionMetrics: CohortProgressionMetrics;
    valueMetrics: CohortValueMetrics;
    benchmarkComparison: CohortBenchmarkComparison;
}
export interface CohortDefinitionSummary {
    criteriaEvent: string;
    timeWindow: number;
    size: number;
    creationDate: number;
    maturity: 'new' | 'growing' | 'mature' | 'declining';
    characteristics: string;
}
export interface CohortFunnelMetrics {
    totalEntries: number;
    totalConversions: number;
    overallConversionRate: number;
    averageTimeToConvert: number;
    completionRate: number;
    dropOffRate: number;
    retentionRate: number;
    reactivationRate: number;
}
export interface CohortStepPerformance {
    stepId: string;
    stepName: string;
    stepOrder: number;
    entries: number;
    conversions: number;
    conversionRate: number;
    averageTimeSpent: number;
    dropOffCount: number;
    dropOffRate: number;
    retentionToNextStep: number;
    stepEfficiency: number;
    cohortSpecificBehaviors: CohortBehaviorMetric;
}
export interface CohortBehaviorMetric {
    behavior: string;
    frequency: number;
    impact: number;
    uniqueness: number;
    description: string;
}
export interface CohortTemporalPerformance {
    period: number;
    periodLabel: string;
    entries: number;
    conversions: number;
    conversionRate: number;
    retentionRate: number;
    reactivationCount: number;
    valueGenerated: number;
    trendDirection: 'improving' | 'declining' | 'stable';
}
export interface CohortProgressionMetrics {
    progressionRate: number;
    averageProgressionTime: number;
    progressionStages: ProgressionStage;
    stagnationPoints: StagnationPoint;
    accelerationFactors: AccelerationFactor;
}
export interface ProgressionStage {
    stageId: string;
    stageName: string;
    entry: number;
    exit: number;
    averageTimeInStage: number;
    progressionRate: number;
    commonExitReasons: string;
}
export interface StagnationPoint {
    stepId: string;
    stepName: string;
    stagnationRate: number;
    averageStagnationTime: number;
    recoveryRate: number;
    interventionOpportunities: string;
}
export interface AccelerationFactor {
    factor: string;
    impact: number;
    frequency: number;
    conditions: string;
    replicability: 'high' | 'medium' | 'low';
}
export interface CohortValueMetrics {
    totalValue: number;
    valuePerUser: number;
    valuePerConversion: number;
    lifetimeValue: number;
    valueTrajectory: ValueTrajectoryPoint;
    valueDistribution: ValueDistribution;
    moneyGenerationPattern: MoneyGenerationPattern;
}
export interface ValueTrajectoryPoint {
    period: number;
    periodLabel: string;
    cumulativeValue: number;
    periodValue: number;
    valueVelocity: number;
    projectedValue: number;
}
export interface ValueDistribution {
    lowValue: {
        threshold: number;
        percentage: number;
        totalValue: number;
    };
    mediumValue: {
        threshold: number;
        percentage: number;
        totalValue: number;
    };
    highValue: {
        threshold: number;
        percentage: number;
        totalValue: number;
    };
    topPercentile: {
        threshold: number;
        percentage: number;
        totalValue: number;
    };
}
export interface MoneyGenerationPattern {
    pattern: 'front_loaded' | 'gradual' | 'back_loaded' | 'sporadic';
    consistency: number;
    predictability: number;
    seasonality: SeasonalityInfo;
}
export interface SeasonalityInfo {
    hasSeasonality: boolean;
    pattern?: 'weekly' | 'monthly' | 'quarterly';
    peaks?: string;
    troughs?: string;
}
export interface CohortBenchmarkComparison {
    overallPerformance: BenchmarkMetric;
    stepComparisons: StepBenchmarkMetric;
    peerCohorts: PeerCohortComparison;
    industryBenchmarks: IndustryBenchmarkMetric;
}
export interface BenchmarkMetric {
    metric: string;
    cohortValue: number;
    benchmarkValue: number;
    percentile: number;
    performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
    improvementPotential: number;
}
export interface StepBenchmarkMetric extends BenchmarkMetric {
    stepId: string;
    stepName: string;
}
export interface PeerCohortComparison {
    peerCohortId: string;
    peerCohortName: string;
    similarity: number;
    performanceComparison: 'better' | 'similar' | 'worse';
    keyDifferences: string;
    learnings: string;
}
export interface IndustryBenchmarkMetric {
    metric: string;
    industryAverage: number;
    topQuartile: number;
    cohortValue: number;
    industryRanking: number;
    competitivePosition: 'leader' | 'challenger' | 'follower' | 'niche';
}
export interface CohortComparativeAnalysis {
    crossCohortMetrics: CrossCohortMetric;
    performanceRankings: CohortRanking;
    significantDifferences: CohortDifference;
    convergenceAnalysis: ConvergenceAnalysis;
    outlierAnalysis: CohortOutlierAnalysis;
}
export interface CrossCohortMetric {
    metric: string;
    values: Array<{
        cohortId: string;
        cohortName: string;
        value: number;
    }>;
    variance: number;
    coefficient: number;
    trend: 'converging' | 'diverging' | 'stable';
    insights: string;
}
export interface CohortRanking {
    metric: string;
    rankings: Array<{}, rank>;
    number: any;
    cohortId: string;
    cohortName: string;
    value: number;
    score: number;
}
export interface CohortDifference {
    metric: string;
    cohortA: {
        id: string;
        name: string;
        value: number;
    };
    cohortB: {
        id: string;
        name: string;
        value: number;
    };
    difference: number;
    significance: number;
    possibleReasons: string;
    actionableInsights: string;
}
export interface ConvergenceAnalysis {
    cohortIds: string;
    cohortNames: string;
    metric: string;
    convergenceRate: number;
    timeToConvergence: number;
    convergencePoint: number;
    factors: string;
}
export interface CohortOutlierAnalysis {
    cohortId: string;
    cohortName: string;
    outlierMetrics: string;
    deviationSeverity: 'extreme' | 'significant' | 'moderate';
    possibleCauses: string;
    investigationPriority: 'high' | 'medium' | 'low';
}
export interface CohortRetentionAnalysis {
    cohortId: string;
    cohortName: string;
    retentionCurve: RetentionPoint;
    retentionMetrics: RetentionMetrics;
    retentionFactors: RetentionFactor;
    churnAnalysis: ChurnAnalysis;
    reactivationAnalysis: ReactivationAnalysis;
}
export interface RetentionPoint {
    period: number;
    periodLabel: string;
    retainedUsers: number;
    retentionRate: number;
    churnedUsers: number;
    churnRate: number;
    reactivatedUsers: number;
    netRetention: number;
}
export interface RetentionMetrics {
    dayOneRetention: number;
    daySevenRetention: number;
    dayThirtyRetention: number;
    dayNinetyRetention: number;
    halfLife: number;
    retentionStability: number;
    retentionTrend: 'improving' | 'declining' | 'stable';
}
export interface RetentionFactor {
    factor: string;
    impact: number;
    correlation: number;
    actionability: 'high' | 'medium' | 'low';
    description: string;
}
export interface ChurnAnalysis {
    overallChurnRate: number;
    churnPredictors: ChurnPredictor;
    churnSegments: ChurnSegment;
    preventableChurn: number;
    churnValue: number;
}
export interface ChurnPredictor {
    predictor: string;
    accuracy: number;
    leadTime: number;
    actionWindow: number;
    interventions: string;
}
export interface ChurnSegment {
    segment: string;
    size: number;
    churnRate: number;
    reasons: string;
    preventionStrategies: string;
}
export interface ReactivationAnalysis {
    reactivationRate: number;
    averageTimeToReactivation: number;
    reactivationTriggers: ReactivationTrigger;
    reactivationValue: number;
    reactivationROI: number;
}
export interface ReactivationTrigger {
    trigger: string;
    effectiveness: number;
    cost: number;
    timeToAction: number;
    suitableCohorts: string;
}
export interface CohortLifecycleAnalysis {
    cohortId: string;
    cohortName: string;
    lifecycleStages: LifecycleStage;
    stageTransitions: StageTransition;
    maturityMetrics: MaturityMetrics;
    lifecycleHealth: LifecycleHealthMetrics;
}
export interface LifecycleStage {
    stage: 'onboarding' | 'activation' | 'engagement' | 'retention' | 'expansion' | 'advocacy';
    userCount: number;
    percentage: number;
    averageTimeInStage: number;
    conversionToNext: number;
    valueGenerated: number;
    stageCharacteristics: string;
}
export interface StageTransition {
    fromStage: string;
    toStage: string;
    transitionRate: number;
    averageTransitionTime: number;
    transitionFactors: string;
    optimizationOpportunities: string;
}
export interface MaturityMetrics {
    overallMaturity: number;
    maturityFactors: MaturityFactor;
    maturityTrajectory: 'accelerating' | 'steady' | 'plateauing' | 'declining';
    expectedPeakValue: number;
    timeToMaturity: number;
}
export interface MaturityFactor {
    factor: string;
    weight: number;
    currentScore: number;
    targetScore: number;
    improvementActions: string;
}
export interface LifecycleHealthMetrics {
    healthScore: number;
    healthFactors: HealthFactor;
    riskIndicators: RiskIndicator;
    opportunityAreas: OpportunityArea;
}
export interface HealthFactor {
    factor: string;
    score: number;
    weight: number;
    trend: 'improving' | 'stable' | 'declining';
    impact: string;
}
export interface RiskIndicator {
    risk: string;
    severity: 'high' | 'medium' | 'low';
    probability: number;
    impact: number;
    mitigationActions: string;
}
export interface OpportunityArea {
    opportunity: string;
    potential: number;
    effort: 'low' | 'medium' | 'high';
    timeframe: 'immediate' | 'short_term' | 'long_term';
    actions: string;
}
export interface CohortBehaviorPattern {
    cohortId: string;
    cohortName: string;
    patterns: BehaviorPattern;
    uniqueBehaviors: UniqueBehavior;
    behaviorEvolution: BehaviorEvolution;
    crossCohortComparison: BehaviorComparison;
}
export interface BehaviorPattern {
    pattern: string;
    frequency: number;
    conversionImpact: number;
    valueImpact: number;
    temporalPattern: string;
    predictability: number;
    description: string;
}
export interface UniqueBehavior {
    behavior: string;
    uniquenessScore: number;
    cohortSpecific: boolean;
    competitiveAdvantage: boolean;
    replicability: string;
    description: string;
}
export interface BehaviorEvolution {
    period: number;
    periodLabel: string;
    behaviorChanges: BehaviorChange;
    adaptationRate: number;
    stabilityScore: number;
}
export interface BehaviorChange {
    behavior: string;
    changeType: 'emerged' | 'strengthened' | 'weakened' | 'disappeared';
    changeIntensity: number;
    drivers: string;
}
export interface BehaviorComparison {
    behavior: string;
    cohortFrequency: number;
    otherCohortsAverage: number;
    relativeStrength: number;
    significance: number;
}
export interface CohortPredictiveModel {
    cohortId: string;
    cohortName: string;
    modelType: 'conversion' | 'value' | 'retention' | 'lifecycle';
    predictions: PredictionResult;
    modelAccuracy: number;
    confidenceInterval: number;
    keyPredictors: ModelPredictor;
    scenarioAnalysis: ScenarioAnalysis;
}
export interface PredictionResult {
    timeframe: number;
    timeframeLabel: string;
    predictedValue: number;
    confidence: number;
    factors: string;
    assumptions: string;
}
export interface ModelPredictor {
    predictor: string;
    importance: number;
    direction: 'positive' | 'negative';
    stability: number;
    actionability: string;
}
export interface ScenarioAnalysis {
    scenario: string;
    probability: number;
    predictedOutcome: number;
    impactFactors: string;
    preparationActions: string;
}
export interface CohortInsight {
    type: 'performance' | 'behavior' | 'opportunity' | 'risk' | 'comparison';
    cohortIds: string;
    cohortNames: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    confidence: number;
    businessImpact: number;
    timeframe: 'immediate' | 'short_term' | 'long_term';
    actionability: 'high' | 'medium' | 'low';
    recommendations: string;
    evidence: string;
    relatedInsights: string;
}
export interface CohortHealthScore {
    cohortId: string;
    cohortName: string;
    overallScore: number;
    scoreComponents: HealthScoreComponent;
    scoreHistory: HealthScoreHistory;
    scoreTrend: 'improving' | 'stable' | 'declining';
    riskLevel: 'low' | 'medium' | 'high';
    interventionRecommendations: InterventionRecommendation;
}
export interface HealthScoreComponent {
    component: string;
    score: number;
    weight: number;
    trend: 'improving' | 'stable' | 'declining';
    benchmark: number;
    contributingFactors: string;
}
export interface HealthScoreHistory {
    timestamp: number;
    score: number;
    changes: ScoreChange;
}
export interface ScoreChange {
    component: string;
    change: number;
    reason: string;
}
export interface InterventionRecommendation {
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: number;
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
    successMetrics: string;
}
export interface CohortAnalysisExportData {
    analysisMode: CohortAnalysisMode;
    timeRange: {
        start: number;
        end: number;
    };
    cohorts: string;
    data: CohortAnalysisData;
    visualizations: {
        comparative: string;
        retention: string;
        lifecycle: string;
        behavior: string;
    };
    insights: CohortInsight;
    recommendations: InterventionRecommendation;
    metadata: {
        exportedAt: number;
        analysisDepth: 'basic' | 'standard' | 'comprehensive';
        dataQuality: number;
    };
}
export declare const CohortFunnelAnalysis: React.FC<CohortFunnelAnalysisProps>;
export default CohortFunnelAnalysis;
//# sourceMappingURL=CohortFunnelAnalysis.d.ts.map