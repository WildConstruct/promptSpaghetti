/**
 * Core Funnel Chart Visualization - Story 30.2 Task 6
 *
 * Step-by-step conversion rate visualization with interactive funnel charts,
 * drop-off analysis, and multiple visualization modes.
 *
 * Features:
 * - Interactive step-by-step funnel visualization
 * - Multiple chart modes (standard, sankey, waterfall)
 * - Real-time conversion rate updates
 * - Drop-off point highlighting
 * - Hover interactions with detailed metrics
 * - Responsive design with mobile support
 * - Export capabilities for charts
 * - Accessibility compliance
 */
import React from 'react';
import { 
  ConversionFunnelDefinition,
  ConversionStep,
  UserSegment,
  ConversionCohort
} from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
export interface FunnelChartProps {
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number;
}
    };
    segments?: UserSegment[];
    cohorts?: ConversionCohort[];
    chartMode?: FunnelChartMode;
    showDropoffAnalysis?: boolean;
    realTimeUpdates?: boolean;
    onStepClick?: (step: ConversionStep, metrics: StepMetrics) => void;
    onExport?: (chartData: ChartExportData) => void;

export type FunnelChartMode = 'standard' | 'horizontal' | 'sankey' | 'waterfall' | 'heatmap';

}
export interface StepMetrics {
    stepId: string;
    stepName: string;
    order: number;
    totalEntries: number;
    totalConversions: number;
    conversionRate: number;
    dropOffCount: number;
    dropOffRate: number;
    averageTimeSpent: number;
    revenue: number;
    revenuePerConversion: number;
    previousStepConversionRate?: number;
    comparisonData?: StepComparisonMetrics;

}
export interface StepComparisonMetrics {
    previousPeriod: {
        conversionRate: number;
        change: number;
        direction: 'improvement' | 'decline' | 'no_change'
}
  };
    benchmark: {
        conversionRate: number;
        percentile: number;
        industry: string;
    };
    segments: Array<{
        segmentId: string;
        segmentName: string;
        conversionRate: number;
        performance: 'above_average' | 'below_average' | 'average'
  }>;

}
export interface FunnelChartData {
    steps: StepMetrics[];
    overallMetrics: OverallFunnelMetrics;
    dropoffAnalysis: DropoffAnalysis[];
    trends: FunnelTrend[];
    segmentComparisons: SegmentFunnelComparison[];

}
export interface OverallFunnelMetrics {
    totalEntries: number;
    totalConversions: number;
    overallConversionRate: number;
    averageTimeToConvert: number;
    totalRevenue: number;
    revenuePerEntry: number;
    revenuePerConversion: number;
    totalDropoffs: number;
    biggestDropoffStep: string;
    mostEfficientStep: string;

}
export interface DropoffAnalysis {
    stepId: string;
    stepName: string;
    dropOffCount: number;
    dropOffRate: number;
    dropOffReasons: DropoffReason[];
    recoveryOpportunity: number;
    recommendedActions: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';

}
export interface DropoffReason {
    reason: string;
    category: 'technical' | 'user_experience' | 'content' | 'external';
    percentage: number;
    count: number;
    confidence: number;

}
export interface FunnelTrend {
    period: string;
    conversionRate: number;
    entries: number;
    conversions: number;
    revenue: number;

}
export interface SegmentFunnelComparison {
    segmentId: string;
    segmentName: string;
    overallConversionRate: number;
    stepPerformance: Array<{
        stepId: string;
        conversionRate: number;
        relativePerformance: number;
}
    }>;
    insights: string[];

}
export interface ChartExportData {
    chartMode: FunnelChartMode;
    data: FunnelChartData;
    visualization: {
        svg: string;
        png?: string;
        pdf?: string;
}
    };
    metadata: {
        exportedAt: number;
        timeRange: {
            start: number;
            end: number;
        };
        filters: unknown[];
    };

}
export interface InteractionState {
    hoveredStep: string | null;
    selectedStep: string | null;
    tooltipPosition: {
        x: number;
        y: number;
}
    } | null;
    tooltipContent: StepTooltipContent | null;

}
export interface StepTooltipContent {
    stepName: string;
    metrics: StepMetrics;
    comparisonData?: StepComparisonMetrics;
    insights: string[];
/**
 * Main Funnel Chart Component
 */
export declare const FunnelChart: React.FC<FunnelChartProps>;
export default FunnelChart;
//# sourceMappingURL=FunnelChart.d.ts.map
}