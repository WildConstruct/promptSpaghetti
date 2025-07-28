import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
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
    retentionPeriods: RetentionPeriod;
    segmentation: RetentionSegmentation;
    benchmarks: RetentionBenchmark;
}
export interface ChurnPredictionConfig {
    predictionModels: ChurnPredictionModel;
    riskFactors: ChurnRiskFactor;
    interventionStrategies: ChurnInterventionStrategy;
    evaluationMetrics: ChurnModelMetric;
}
export interface RetentionData {
    cohortId: string;
    cohortName: string;
    cohortSize: number;
    acquisitionDate: number;
    retentionRates: RetentionRateData;
    segments: SegmentRetentionData;
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
    riskFactors: ActiveRiskFactor;
    predictions: ChurnPrediction;
    recommendedActions: ChurnPreventionAction;
}
export type ChurnRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export interface ChurnPrediction {
    timeHorizon: number;
    probability: number;
    confidence: number;
    model: string;
}
//# sourceMappingURL=RetentionChurnAnalysis.d.ts.map