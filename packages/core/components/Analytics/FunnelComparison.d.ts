/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Funnel Comparison and A/B Testing Integration - Story 30.2 Task 5
 *
 * Advanced funnel comparison system with A/B testing integration,
 * statistical significance testing, and automated insights generation.
 *
 * Features:
 * - Side-by-side funnel comparison
 * - Time period comparison analysis
 * - A/B test experiment tracking
 * - Statistical significance testing
 * - Automated insights and recommendations
 * - Cohort-based comparison
 * - Segment-based comparison
 * - Export and reporting capabilities
 */
import React from 'react';
import { ConversionFunnelDefinition, FlexibleConversionEvent } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
}
export interface FunnelComparisonProps { analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    primaryFunnel: ConversionFunnelDefinition;
    comparisonMode: ComparisonMode;
    comparisonConfig: ComparisonConfiguration;
    onInsightGenerated?: (insights: ComparisonInsight[]) => void;
    onExportRequest?: (data: ComparisonExportData) => void;

export type ComparisonMode = 'time_period' | 'funnel_variant' | 'segment' | 'cohort' | 'ab_test' | 'geographic' | 'device_type' }
}
}
export interface ComparisonConfiguration { mode: ComparisonMode;
    baseline: ComparisonTarget;
    comparison: ComparisonTarget;
    timeRange: {
        start: number;
        end: number }
}
    };
    significanceLevel: number;
    minimumSampleSize: number;
    includeStatisticalTests: boolean;
    autoGenerateInsights: boolean;

}
}
export interface ComparisonTarget { id: string;
    name: string;
    description?: string;
    filters?: ComparisonFilter[];
    funnelDefinition?: ConversionFunnelDefinition;
    metadata?: Record<string, any> }
}
}
export interface ComparisonFilter { type: 'segment' | 'cohort' | 'timeRange' | 'geography' | 'device' | 'custom';
    field: string;
    operator: string;
    value: Error;
    description?: string }
}
}
export interface ComparisonResult { baseline: FunnelPerformanceData;
    comparison: FunnelPerformanceData;
    delta: PerformanceDelta;
    statisticalTests: StatisticalTestResult[];
    insights: ComparisonInsight[];
    metadata: ComparisonMetadata }
}
}
export interface FunnelPerformanceData { targetId: string;
    totalEntries: number;
    totalConversions: number;
    overallConversionRate: number;
    averageTimeToConvert: number;
    totalValue: number;
    stepPerformance: StepPerformanceData[];
    additionalMetrics: Record<string, number> }
}
}
export interface StepPerformanceData { stepId: string;
    stepName: string;
    order: number;
    entries: number;
    conversions: number;
    conversionRate: number;
    dropOffCount: number;
    dropOffRate: number;
    averageTimeSpent: number;
    value: number }
}
}
export interface PerformanceDelta {
    overallConversionRate: {
        absolute: number;
        relative: number;
        direction: 'improvement' | 'decline' | 'no_change'
}
}
  };
    totalConversions: {
        absolute: number;
        relative: number;
        direction: 'improvement' | 'decline' | 'no_change'
  };
    averageTimeToConvert: {
        absolute: number;
        relative: number;
        direction: 'improvement' | 'decline' | 'no_change'
  };
    totalValue: {
        absolute: number;
        relative: number;
        direction: 'improvement' | 'decline' | 'no_change'
  };
    stepDeltas: StepDelta[];

}
}
export interface StepDelta {
    stepId: string;
    conversionRate: {
        absolute: number;
        relative: number;
        direction: 'improvement' | 'decline' | 'no_change'
}
}
  };
    dropOffRate: {
        absolute: number;
        relative: number;
        direction: 'improvement' | 'decline' | 'no_change'
  };

}
}
export interface StatisticalTestResult { testType: 'chi_square' | 'z_test' | 'fishers_exact' | 't_test';
    metric: string;
    stepId?: string;
    pValue: number;
    statisticValue: number;
    isSignificant: boolean;
    confidenceInterval: [number, number];
    effectSize: number;
    powerAnalysis?: PowerAnalysisResult }
}
}
export interface PowerAnalysisResult { currentPower: number;
    requiredSampleSize: number;
    detectedEffectSize: number;
    recommendations: string[] }
}
}
export interface ComparisonInsight { type: 'significant_improvement' | 'significant_decline' | 'no_significant_difference' | 'sample_size_warning' | 'recommendation';
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    metric?: string;
    stepId?: string;
    evidence: InsightEvidence;
    recommendations?: string[];
    priority: number }
}
}
export interface InsightEvidence { statisticalTest?: StatisticalTestResult;
    sampleSizes: {
        baseline: number;
        comparison: number }
}
    };
    effectSize: number;
    confidenceLevel: number;
    additionalContext?: Record<string, any>;

}
}
export interface ComparisonMetadata { comparisonId: string;
    generatedAt: number;
    configuration: ComparisonConfiguration;
    dataQuality: {
        baselineSampleSize: number;
        comparisonSampleSize: number;
        dataCompleteness: number;
        outlierCount: number;
        confidenceLevel: number }
}
    };
    executionTime: number;
    cacheHit: boolean;

}
}
export interface ComparisonExportData { comparison: ComparisonResult;
    rawData: {
        baselineEvents: FlexibleConversionEvent[];
        comparisonEvents: FlexibleConversionEvent[] }
}
    };
    visualizations: ComparisonVisualization[];
    reportSummary: string;

}
}
export interface ComparisonVisualization { type: 'funnel_chart' | 'delta_chart' | 'significance_heatmap' | 'timeline_chart';
    title: string;
    data: Record<string, unknown>;
    configuration: unknown }
}
}
export interface ABTestIntegration { experimentId: string;
    experimentName: string;
    variants: ABTestVariant[];
    trafficAllocation: Record<string, number>;
    status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
    startDate: number;
    endDate?: number;
    primaryMetric: string;
    secondaryMetrics: string[];
    hypothesis: string;
    successCriteria: ABTestSuccessCriteria }
}
}
export interface ABTestVariant { id: string;
    name: string;
    description: string;
    funnelDefinition: ConversionFunnelDefinition;
    trafficPercentage: number;
    isControl: boolean }
}
}
export interface ABTestSuccessCriteria {
    minimumDetectableEffect: number;
    significanceLevel: number;
    power: number;
    minimumRunTime: number;
    minimumSampleSize: number;
/**
 * Main Funnel Comparison Component
 */
export declare const FunnelComparison: React.FC<FunnelComparisonProps>;
export default FunnelComparison;
//# sourceMappingURL=FunnelComparison.d.ts.map
}
}