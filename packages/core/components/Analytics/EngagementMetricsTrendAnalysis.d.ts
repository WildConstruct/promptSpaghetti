/**
 * User Engagement Metrics and Trend Analysis - Story 30.2 Task 10
 *
 * Comprehensive analytics dashboard for tracking, analyzing, and visualizing
 * user engagement metrics with advanced trend analysis and forecasting capabilities.
 */
import React from 'react';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
export interface EngagementMetricsTrendAnalysisProps {
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    metricsConfig: EngagementMetricsConfig;
    trendAnalysisConfig: TrendAnalysisConfig;
    onTrendAlert?: (alert: TrendAlert) => void;
    onMetricThreshold?: (threshold: MetricThreshold) => void;
    onExport?: (data: EngagementMetricsExportData) => void;

}
export interface EngagementMetricsConfig {
    metrics: EngagementMetric[];
    timeRanges: TimeRange[];
    segmentation: SegmentationConfig;
    benchmarks: BenchmarkConfig;
    alerting: AlertingConfig;

}
export interface EngagementMetric {
    metricId: string;
    name: string;
    type: MetricType;
    calculation: MetricCalculation;
    visualization: VisualizationConfig;
    thresholds: MetricThreshold[];

export type MetricType = 'count' | 'rate' | 'duration' | 'score' | 'percentage' | 'ratio';

}
export interface TrendAnalysisConfig {
    algorithms: TrendAlgorithm[];
    forecasting: ForecastingConfig;
    seasonality: SeasonalityConfig;
    anomalyDetection: AnomalyDetectionConfig;
    reporting: TrendReportingConfig;

}
export interface EngagementMetricsData {
    timestamp: number;
    metrics: MetricValue[];
    segmentData: SegmentMetrics[];
    metadata: MetricsMetadata;

}
export interface MetricValue {
    metricId: string;
    value: number;
    change: number;
    trend: TrendDirection;
    confidence: number;

}
export interface TrendAnalysis {
    metric: string;
    trend: TrendData;
    forecast: ForecastData;
    insights: TrendInsight[];
    anomalies: TrendAnomaly[];

}
export interface TrendData {
    direction: TrendDirection;
    strength: number;
    duration: number;
    significance: number;
    changeRate: number;

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'seasonal';
export declare const EngagementMetricsTrendAnalysis: React.FC<EngagementMetricsTrendAnalysisProps>;

}
export interface TimeRange {
    id: string;
    label: string;
    days: number;

}
export interface SegmentationConfig {
    enabled: boolean;
    segments: string[];

}
export interface BenchmarkConfig {
    enabled: boolean;
    benchmarks: Benchmark[];

}
export interface Benchmark {
    name: string;
    value: number;
    type: 'industry' | 'internal' | 'target';

}
export interface AlertingConfig {
    enabled: boolean;
    thresholds: AlertThreshold[];

}
export interface AlertThreshold {
    metricId: string;
    condition: 'above' | 'below' | 'change';
    value: number;
    severity: 'low' | 'medium' | 'high';

}
export interface MetricCalculation {
    formula: string;
    aggregation: 'sum' | 'average' | 'count';
    timeWindow: number;

}
export interface VisualizationConfig {
    chartType: 'line' | 'bar' | 'area';
    showTrendline: boolean;
    showForecast: boolean;

}
export interface MetricThreshold {
    level: 'warning' | 'critical';
    value: number;
    operator: 'gt' | 'lt' | 'eq';

}
export interface TrendAlgorithm {
    name: string;
    enabled: boolean;
    parameters: Record<string, any>;

}
export interface ForecastingConfig {
    enabled: boolean;
    horizon: number;
    models: string[];

}
export interface SeasonalityConfig {
    enabled: boolean;
    periods: number[];

}
export interface AnomalyDetectionConfig {
    enabled: boolean;
    sensitivity: number;
    methods: string[];

}
export interface TrendReportingConfig {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];

}
export interface SegmentMetrics {
    segment: string;
    metrics: MetricValue[];

}
export interface MetricsMetadata {
    lastUpdated: number;
    dataQuality: number;
    sampleSize: number;

}
export interface ForecastData {
    predictions: ForecastPrediction[];
    accuracy: number;
    model: string;
    factors: ForecastFactor[];

}
export interface ForecastPrediction {
    timestamp: number;
    predictedValue: number;
    confidence: number;
    range: {
        lower: number;
        upper: number;
}
    };

}
export interface ForecastFactor {
    factor: string;
    influence: number;

}
export interface TrendInsight {
    type: string;
    message: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;

}
export interface TrendAnomaly {
    timestamp: number;
    expectedValue: number;
    actualValue: number;
    severity: number;
    explanation: string;

}
export interface TrendAlert {
    alertId: string;
    metricId: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: number;
    threshold: number;
    actualValue: number;
    recommendations: string[];

}
export interface EngagementMetricsExportData {
    metricsData: EngagementMetricsData[];
    trendAnalyses: TrendAnalysis[];
    timeRange: {
        start: number;
        end: number;
}
    };
    metadata: {
        exportTimestamp: number;
        version: string;
        totalDataPoints: number;
        metricsIncluded: string[];
    };

export default EngagementMetricsTrendAnalysis;
//# sourceMappingURL=EngagementMetricsTrendAnalysis.d.ts.map