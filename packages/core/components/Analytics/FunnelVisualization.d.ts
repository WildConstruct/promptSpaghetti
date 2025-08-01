/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Funnel Visualization Components - Story 30.2 Task 5
 *
 * Interactive funnel visualization system with real-time updates,
 * customizable configurations, and advanced analytics capabilities.
 *
 * Features:
 * - Interactive multi-step funnel visualization
 * - Real-time conversion rate updates
 * - Drag-and-drop funnel configuration
 * - Advanced filtering and segmentation
 * - A/B testing comparison views
 * - Export and sharing capabilities
 */
import React from 'react';
import { ConversionFunnelDefinition,
  ConversionStep,
  UserSegment }
  ConversionCohort
} from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
}
export interface FunnelVisualizationProps { funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number }
}
    };
    segments?: UserSegment[];
    cohorts?: ConversionCohort[];
    comparisonMode?: 'none' | 'time_period' | 'segment' | 'ab_test';
    realTimeUpdates?: boolean;
    onStepClick?: (step: ConversionStep, metrics: StepMetrics) => void;
    onConfigChange?: (config: FunnelConfiguration) => void;

}
}
export interface StepMetrics { stepId: string;
    name: string;
    order: number;
    totalUsers: number;
    convertedUsers: number;
    conversionRate: number;
    dropOffRate: number;
    averageTimeSpent: number;
    previousStepConversionRate?: number;
    valueGenerated: number;
    topExitReasons: ExitReason[] }
}
}
export interface ExitReason { reason: string;
    percentage: number;
    count: number;
    category: 'user_action' | 'technical_issue' | 'design_friction' | 'external_factor' }
}
}
export interface FunnelConfiguration { displayMode: 'standard' | 'horizontal' | 'sankey' | 'waterfall';
    colorScheme: 'default' | 'conversion_focused' | 'drop_off_focused' | 'value_focused';
    showMetrics: MetricDisplay[];
    filterCriteria: FunnelFilter[];
    grouping: FunnelGrouping;
    refreshInterval: number;
    animations: boolean;

export type MetricDisplay = 'conversion_rate' | 'drop_off_rate' | 'user_count' | 'value_generated' | 'time_spent' | 'exit_reasons' }
}
}
export interface FunnelFilter { type: 'segment' | 'cohort' | 'time_range' | 'device' | 'location' | 'source';
    value: string | number;
    operator: 'equals' | 'in' | 'between' | 'greater_than' | 'less_than' }
}
}
export interface FunnelGrouping { dimension: 'none' | 'segment' | 'cohort' | 'device' | 'source' | 'time_period';
    interval?: 'hour' | 'day' | 'week' | 'month' }
}
}
export interface FunnelComparisonData { baseline: FunnelMetrics;
    comparison: FunnelMetrics;
    type: 'time_period' | 'segment' | 'ab_test';
    significance: number;
    insights: ComparisonInsight[] }
}
}
export interface FunnelMetrics { funnelId: string;
    totalEntries: number;
    totalConversions: number;
    overallConversionRate: number;
    averageTimeToConvert: number;
    totalValue: number;
    stepMetrics: StepMetrics[] }
}
}
export interface ComparisonInsight {
    type: 'improvement' | 'decline' | 'neutral';
    stepId?: string;
    metric: string;
    change: number;
    significance: number;
    description: string;
    recommendation?: string;
/**
 * Main Funnel Visualization Component
 */
export declare const FunnelVisualization: React.FC<FunnelVisualizationProps>;
export default FunnelVisualization;
//# sourceMappingURL=FunnelVisualization.d.ts.map
}
}