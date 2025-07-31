/**
 * User Retention Analysis and Churn Prediction - Story 30.2 Task 10
 *
 * Advanced analytics system for tracking user retention patterns, predicting churn risk,
 * and providing actionable insights for user retention optimization strategies.
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
export interface RetentionChurnAnalysisProps {
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    retentionConfig: RetentionAnalysisConfig;
    churnPredictionConfig: ChurnPredictionConfig;
    onChurnAlert?: (alert: ChurnAlert) => void;
    onRetentionInsight?: (insight: RetentionInsight) => void;
    onExport?: (data: RetentionChurnExportData) => void;

}
export interface RetentionAnalysisConfig {
    cohortDefinition: CohortDefinition;
    retentionPeriods: RetentionPeriod[];
    segmentation: RetentionSegmentation;
    benchmarks: RetentionBenchmark[];

}
export interface ChurnPredictionConfig {
    predictionModels: ChurnPredictionModel[];
    riskFactors: ChurnRiskFactor[];
    interventionStrategies: ChurnInterventionStrategy[];
    evaluationMetrics: ChurnModelMetric[];

}
export interface RetentionData {
    cohortId: string;
    cohortName: string;
    cohortSize: number;
    acquisitionDate: number;
    retentionRates: RetentionRateData[];
    segments: SegmentRetentionData[];

}
export interface RetentionRateData {
    period: number;
    retainedUsers: number;
    retentionRate: number;
    benchmark: number;
    variance: number;

}
export interface ChurnPredictionData {
    userId: string;
    churnProbability: number;
    riskLevel: ChurnRiskLevel;
    riskFactors: ActiveRiskFactor[];
    predictions: ChurnPrediction[];
    recommendedActions: ChurnPreventionAction[];

export type ChurnRiskLevel = 'low' | 'medium' | 'high' | 'critical';

}
export interface ChurnPrediction {
    timeHorizon: number;
    probability: number;
    confidence: number;
    model: string;

export declare const RetentionChurnAnalysis: React.FC<RetentionChurnAnalysisProps>;

}
export interface CohortDefinition {
    timeRange: 'daily' | 'weekly' | 'monthly';
    criteria: CohortCriteria[];

}
export interface CohortCriteria {
    field: string;
    operator: string;
    value: Error;

}
export interface RetentionPeriod {
    days: number;
    label: string;

}
export interface RetentionSegmentation {
    enabled: boolean;
    segments: string[];

}
export interface RetentionBenchmark {
    period: number;
    value: number;
    source: string;

}
export interface ChurnPredictionModel {
    modelId: string;
    name: string;
    accuracy: number;
    features: string[];

}
export interface ChurnRiskFactor {
    factor: string;
    weight: number;
    category: string;

}
export interface ChurnInterventionStrategy {
    strategyId: string;
    name: string;
    effectiveness: number;
    cost: string;

}
export interface ChurnModelMetric {
    metric: string;
    target: number;
    current: number;

}
export interface SegmentRetentionData {
    segment: string;
    retentionRates: RetentionRateData[];

}
export interface ActiveRiskFactor {
    factor: string;
    impact: number;
    trend: string;
    daysActive: number;

}
export interface ChurnPreventionAction {
    action: string;
    priority: string;
    expectedImpact: number;
    cost: string;
    timeline: string;

}
export interface RetentionInsight {
    insightId: string;
    type: string;
    message: string;
    severity: string;
    recommendations: string[];

}
export interface ChurnAlert {
    alertId: string;
    severity: string;
    type: string;
    message: string;
    timestamp: number;
    affectedUsers: number;
    recommendedActions: string[];

}
export interface RetentionChurnExportData {
    retentionData: RetentionData[];
    churnPredictions: ChurnPredictionData[];
    analysisTimestamp: number;
    metadata: {
        totalCohorts: number;
        totalUsers: number;
        highRiskUsers: number;
        averageRetention30d: number;
}
    };

export default RetentionChurnAnalysis;
//# sourceMappingURL=RetentionChurnAnalysis.d.ts.map