/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Time-based Funnel Performance Tracking - Story 30.2 Task 6
 *
 * Advanced time-based analysis of funnel performance with trend detection,
 * seasonal patterns, and real-time monitoring capabilities.
 *
 * Features:
 * - Multi-timeframe performance tracking (hour, day, week, month)
 * - Trend analysis with statistical significance testing
 * - Seasonal pattern detection and forecasting
 * - Real-time performance monitoring with alerts
 * - Comparative period analysis
 * - Performance anomaly detection
 * - Time-to-conversion analysis
 * - Cohort-based temporal analysis
 */
import React from 'react';
import { ConversionFunnelDefinition, UserSegment, ConversionCohort } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
}
export interface FunnelTimeTrackingProps { funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number }
}
    };
    segments?: UserSegment[];
    cohorts?: ConversionCohort[];
    granularity?: TimeGranularity;
    showTrends?: boolean;
    showAnomalies?: boolean;
    realTimeUpdates?: boolean;
    onAnomalyDetected?: (anomaly: PerformanceAnomaly) => void;
    onExport?: (data: TimeTrackingExportData) => void;

export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter';

}
}
export interface TimeTrackingData { performanceTimeline: PerformanceTimelineData[];
    trendAnalysis: TrendAnalysis[];
    seasonalPatterns: SeasonalPattern[];
    anomalies: PerformanceAnomaly[];
    stepTimeAnalysis: StepTimeAnalysis[];
    conversionVelocity: ConversionVelocityData[];
    comparativePeriods: ComparativePeriodAnalysis[];
    realTimeMetrics: RealTimeMetrics }
}
}
export interface PerformanceTimelineData { timestamp: number;
    period: string;
    granularity: TimeGranularity;
    overallMetrics: TimelineMetrics;
    stepMetrics: StepTimelineMetrics[];
    environmentalFactors: EnvironmentalFactor[] }
}
}
export interface TimelineMetrics { totalEntries: number;
    totalConversions: number;
    conversionRate: number;
    averageTimeToConvert: number;
    revenue: number;
    revenuePerEntry: number;
    revenuePerConversion: number;
    dropOffCount: number;
    dropOffRate: number }
}
}
export interface StepTimelineMetrics { stepId: string;
    stepName: string;
    entries: number;
    conversions: number;
    conversionRate: number;
    averageTimeSpent: number;
    dropOffs: number;
    dropOffRate: number;
    revenue: number }
}
}
export interface EnvironmentalFactor { factor: string;
    value: number | string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number }
}
}
export interface TrendAnalysis { stepId?: string;
    stepName?: string;
    metric: 'conversion_rate' | 'drop_off_rate' | 'time_to_convert' | 'revenue';
    trend: TrendDirection;
    trendStrength: 'strong' | 'moderate' | 'weak';
    changeRate: number;
    significance: number;
    confidence: number;
    forecast: ForecastData[];
    insights: TrendInsight[];

export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile' }
}
}
export interface ForecastData { timestamp: number;
    predictedValue: number;
    confidenceInterval: {
        lower: number;
        upper: number }
}
    };
    factors: string[];

}
}
export interface TrendInsight { type: 'opportunity' | 'risk' | 'pattern' | 'recommendation';
    title: string;
    description: string;
    impact: number;
    urgency: 'high' | 'medium' | 'low';
    actionable: boolean;
    recommendedActions: string[] }
}
}
export interface SeasonalPattern { pattern: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    description: string;
    strength: number;
    peaks: SeasonalPeak[];
    troughs: SeasonalTrough[];
    businessImpact: number;
    reliability: number;
    recommendations: SeasonalRecommendation[] }
}
}
export interface SeasonalPeak { period: string;
    value: number;
    consistency: number;
    duration: number;
    contributingFactors: string[] }
}
}
export interface SeasonalTrough { period: string;
    value: number;
    consistency: number;
    duration: number;
    contributingFactors: string[] }
}
}
export interface SeasonalRecommendation { type: 'marketing' | 'operations' | 'product' | 'support';
    title: string;
    description: string;
    timing: string;
    expectedImpact: number;
    implementation: string[] }
}
}
export interface PerformanceAnomaly { id: string;
    timestamp: number;
    stepId?: string;
    stepName?: string;
    metric: string;
    anomalyType: 'spike' | 'drop' | 'outlier' | 'trend_break';
    severity: 'critical' | 'high' | 'medium' | 'low';
    expectedValue: number;
    actualValue: number;
    deviation: number;
    confidence: number;
    possibleCauses: PossibleCause[];
    businessImpact: number;
    autoResolved: boolean;
    investigationStatus: 'pending' | 'investigating' | 'resolved' | 'false_positive' }
}
}
export interface PossibleCause { category: 'technical' | 'external' | 'product' | 'marketing' | 'seasonal';
    description: string;
    likelihood: number;
    evidence: string[];
    investigationSteps: string[] }
}
}
export interface StepTimeAnalysis { stepId: string;
    stepName: string;
    timeToReach: TimeDistribution;
    timeSpentOnStep: TimeDistribution;
    timeToConvert: TimeDistribution;
    abandonmentTiming: AbandonmentTiming;
    temporalPatterns: StepTemporalPattern[] }
}
}
export interface TimeDistribution { mean: number;
    median: number;
    p25: number;
    p75: number;
    p90: number;
    p95: number;
    standardDeviation: number;
    skewness: number }
}
}
export interface AbandonmentTiming { earlyAbandonment: number;
    midAbandonment: number;
    lateAbandonment: number;
    averageTimeBeforeAbandonment: number;
    peakAbandonmentTime: number }
}
}
export interface StepTemporalPattern { pattern: string;
    frequency: number;
    impact: number;
    timeframe: string;
    description: string }
}
}
export interface ConversionVelocityData { timestamp: number;
    period: string;
    averageConversionTime: number;
    conversionVelocity: number;
    velocityTrend: 'accelerating' | 'decelerating' | 'stable';
    stepVelocities: StepVelocityData[];
    bottleneckAnalysis: BottleneckAnalysis[] }
}
}
export interface StepVelocityData { stepId: string;
    stepName: string;
    averageProcessingTime: number;
    throughput: number;
    efficiency: number;
    bottleneckSeverity: 'none' | 'minor' | 'moderate' | 'severe' }
}
}
export interface BottleneckAnalysis { stepId: string;
    stepName: string;
    bottleneckType: 'time' | 'capacity' | 'conversion';
    severity: number;
    impact: number;
    solutions: BottleneckSolution[] }
}
}
export interface BottleneckSolution { title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    expectedImprovement: number;
    implementationTime: number }
}
}
export interface ComparativePeriodAnalysis { baselinePeriod: {
        start: number;
        end: number;
        label: string }
}
    };
    comparisonPeriod: { start: number;
        end: number;
        label: string };
    overallComparison: PeriodComparison;
    stepComparisons: StepPeriodComparison[];
    significantChanges: SignificantChange[];
    insights: PeriodInsight[];

}
}
export interface PeriodComparison { metric: string;
    baselineValue: number;
    comparisonValue: number;
    changeAbsolute: number;
    changeRelative: number;
    significance: number;
    confidence: number;
    direction: 'improvement' | 'decline' | 'no_change' }
}
}
export interface StepPeriodComparison { stepId: string;
    stepName: string;
    comparisons: PeriodComparison[] }
}
}
export interface SignificantChange { stepId?: string;
    stepName?: string;
    metric: string;
    changeType: 'improvement' | 'decline';
    magnitude: 'small' | 'moderate' | 'large';
    significance: number;
    businessImpact: number;
    possibleReasons: string[] }
}
}
export interface PeriodInsight { type: 'performance' | 'trend' | 'anomaly' | 'opportunity';
    title: string;
    description: string;
    evidence: string[];
    recommendations: string[];
    priority: 'high' | 'medium' | 'low' }
}
}
export interface RealTimeMetrics { currentConversionRate: number;
    currentVelocity: number;
    activeUsers: number;
    conversionsLast24Hours: number;
    averageTimeToConvert: number;
    currentBottlenecks: string[];
    alertsActive: number;
    lastUpdated: number }
}
}
export interface TimeTrackingExportData { timeRange: {
        start: number;
        end: number }
}
    };
    granularity: TimeGranularity;
    data: TimeTrackingData;
    charts: { timeline: string;
        trends: string;
        seasonality: string;
        anomalies: string };
    insights: { trends: TrendInsight[];
        seasonal: SeasonalRecommendation[];
        anomalies: PerformanceAnomaly[] };
    metadata: {
        exportedAt: number;
        dataQuality: number;
        analysisDepth: 'basic' | 'standard' | 'comprehensive'
  };
/**
 * Main Funnel Time Tracking Component
 */
export declare const FunnelTimeTracking: React.FC<FunnelTimeTrackingProps>;
export default FunnelTimeTracking;
//# sourceMappingURL=FunnelTimeTracking.d.ts.map