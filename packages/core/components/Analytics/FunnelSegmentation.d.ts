/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Funnel Segmentation and Filtering System - Story 30.2 Task 5
 *
 * Advanced segmentation and filtering capabilities for funnel analysis
 * with dynamic segment creation, behavioral pattern analysis, and
 * real-time segment performance tracking.
 *
 * Features:
 * - Dynamic user segmentation with custom rules
 * - Behavioral pattern-based segments
 * - Real-time segment performance analysis
 * - Advanced filtering with multiple criteria
 * - Segment overlap analysis
 * - Cohort-based segmentation
 * - Geographic and demographic segmentation
 * - Custom segment rule builder
 */
import React from 'react';
import { UserSegment, ConversionCohort } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
}
export interface FunnelSegmentationProps { analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    funnelId: string;
    timeRange: {
        start: number;
        end: number }
}
    };
    availableSegments?: UserSegment[];
    availableCohorts?: ConversionCohort[];
    onSegmentCreated?: (segment: UserSegment) => void;
    onFilterChange?: (filters: SegmentFilter[]) => void;
    onSegmentAnalysis?: (analysis: SegmentAnalysisResult) => void;

}
}
export interface SegmentFilter { id: string;
    name: string;
    type: SegmentFilterType;
    conditions: SegmentCondition[];
    operator: 'AND' | 'OR';
    isActive: boolean;
    createdAt: number;
    lastModified: number;

export type SegmentFilterType = 'demographic' | 'behavioral' | 'geographic' | 'device' | 'acquisition' | 'engagement' | 'value' | 'custom' }
}
}
export interface SegmentCondition { id: string;
    field: string;
    operator: SegmentOperator;
    value: Error;
    displayName: string;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';

export type SegmentOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'exists' | 'not_exists' | 'regex_match' }
}
}
export interface SegmentAnalysisResult { segmentId: string;
    segmentName: string;
    totalUsers: number;
    funnelPerformance: SegmentFunnelPerformance;
    behaviorPatterns: BehavioralPattern[];
    demographics: DemographicBreakdown;
    valueMetrics: SegmentValueMetrics;
    comparisons: SegmentComparison[];
    insights: SegmentInsight[] }
}
}
export interface SegmentFunnelPerformance { conversionRate: number;
    averageTimeToConvert: number;
    dropOffPoints: DropOffAnalysis[];
    pathAnalysis: PathAnalysis[];
    stepPerformance: StepSegmentPerformance[] }
}
}
export interface StepSegmentPerformance { stepId: string;
    stepName: string;
    entries: number;
    conversions: number;
    conversionRate: number;
    averageTimeSpent: number;
    exitReasons: ExitReason[] }
}
}
export interface DropOffAnalysis { stepId: string;
    stepName: string;
    dropOffRate: number;
    dropOffCount: number;
    primaryReasons: DropOffReason[];
    recoveryOpportunities: string[] }
}
}
export interface DropOffReason { reason: string;
    percentage: number;
    count: number;
    category: 'technical' | 'user_experience' | 'content' | 'external';
    severity: 'high' | 'medium' | 'low' }
}
}
export interface PathAnalysis { pathId: string;
    pathName: string;
    steps: string[];
    userCount: number;
    conversionRate: number;
    averageTimeToComplete: number;
    isOptimal: boolean }
}
}
export interface BehavioralPattern { id: string;
    name: string;
    description: string;
    pattern: string[];
    frequency: number;
    conversionImpact: number;
    timePattern: TimePattern;
    strength: 'strong' | 'moderate' | 'weak' }
}
}
export interface TimePattern { preferredDays: number[];
    preferredHours: number[];
    sessionDuration: number;
    visitFrequency: number;
    seasonality?: SeasonalityData }
}
}
export interface SeasonalityData { pattern: 'weekly' | 'monthly' | 'quarterly';
    peaks: Array<{
        period: string;
        multiplier: number }
}
    }>;
    confidence: number;

}
}
export interface DemographicBreakdown { geography: GeographicDistribution;
    devices: DeviceDistribution;
    acquisition: AcquisitionChannelDistribution;
    userLifecycle: UserLifecycleDistribution }
}
}
export interface GeographicDistribution { countries: Array<{
        country: string;
        percentage: number;
        conversionRate: number }
}
    }>;
    regions: Array<{ region: string;
        percentage: number;
        conversionRate: number }>;
    cities: Array<{ city: string;
        percentage: number;
        conversionRate: number }>;

}
}
export interface DeviceDistribution { types: Array<{
        type: string;
        percentage: number;
        conversionRate: number }
}
    }>;
    browsers: Array<{ browser: string;
        percentage: number;
        conversionRate: number }>;
    operatingSystems: Array<{ os: string;
        percentage: number;
        conversionRate: number }>;

}
}
export interface AcquisitionChannelDistribution { channels: Array<{
        channel: string;
        percentage: number;
        conversionRate: number;
        cost: number }
}
    }>;
    sources: Array<{ source: string;
        percentage: number;
        conversionRate: number }>;
    campaigns: Array<{ campaign: string;
        percentage: number;
        conversionRate: number;
        roi: number }>;

}
}
export interface UserLifecycleDistribution { stages: Array<{
        stage: string;
        percentage: number;
        conversionRate: number }
}
    }>;
    tenure: Array<{ range: string;
        percentage: number;
        conversionRate: number }>;
    engagementLevel: Array<{ level: string;
        percentage: number;
        conversionRate: number }>;

}
}
export interface SegmentValueMetrics { averageLifetimeValue: number;
    averageOrderValue: number;
    totalRevenue: number;
    costPerAcquisition: number;
    returnOnInvestment: number;
    churnRate: number }
}
}
export interface SegmentComparison { comparedToSegment: string;
    conversionRateDelta: number;
    lifetimeValueDelta: number;
    engagementDelta: number;
    significance: number }
}
}
export interface SegmentInsight { type: 'opportunity' | 'risk' | 'trend' | 'anomaly';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number;
    confidence: number;
    recommendations: string[];
    evidence: Record<string, any> }
}
}
export interface SegmentRuleBuilder { fieldDefinitions: FieldDefinition[];
    operators: OperatorDefinition[];
    templates: SegmentTemplate[] }
}
}
export interface FieldDefinition { path: string;
    displayName: string;
    dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
    category: string;
    description: string;
    possibleValues?: unknown[];
    validation?: FieldValidation }
}
}
export interface OperatorDefinition { operator: SegmentOperator;
    displayName: string;
    supportedTypes: string[];
    description: string;
    requiresValue: boolean;
    multiValue: boolean }
}
}
export interface SegmentTemplate { id: string;
    name: string;
    description: string;
    category: SegmentFilterType;
    conditions: SegmentCondition[];
    operator: 'AND' | 'OR';
    tags: string[] }
}
}
export interface FieldValidation {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: string;
/**
 * Main Funnel Segmentation Component
 */
export declare const FunnelSegmentation: React.FC<FunnelSegmentationProps>;
export default FunnelSegmentation;
//# sourceMappingURL=FunnelSegmentation.d.ts.map
}
}