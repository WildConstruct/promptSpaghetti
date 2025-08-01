/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Cohort and Segment Management System - Story 30.2 Task 3
 *
 * Comprehensive cohort and segment tracking system for conversion funnel
 * analysis with dynamic segmentation, time-based cohort analysis, and
 * advanced behavioral pattern recognition.
 *
 * Features:
 * - Dynamic user segmentation with real-time updates
 * - Time-based cohort analysis with retention tracking
 * - Behavioral pattern recognition and classification
 * - Cross-funnel segment performance analysis
 * - Automated segment lifecycle management
 */
import { ConversionCohort, UserSegment, FlexibleConversionEvent, BehaviorPattern, DropOffPoint, FunnelSegmentMetrics } from './ConversionDataModel';

}
}
export interface CohortAnalysisResult { cohortId: string;
    analysisDate: number;
    metrics: {
        totalUsers: number;
        activeUsers: number;
        retentionRates: Map<number, number>;
        conversionRates: Map<number, number>;
        churnRate: number;
        averageLifetimeValue: number;
        averageTimeToConvert: number }
}
    };
    behavior: { commonPathways: PathwayAnalysis[];
        dropOffAnalysis: DropOffAnalysis;
        engagementPatterns: EngagementPattern[];
        valueSegmentation: ValueSegmentation };
    comparison: { previousPeriod?: CohortComparison;
        benchmarkCohorts?: CohortBenchmark[];
        industryBenchmarks?: IndustryBenchmark };
    predictions: { projectedRetention: Map<number, number>;
        churnRisk: Map<string, number>;
        lifetimeValueForecast: Map<string, number>;
        optimalInterventionPoints: InterventionPoint[] };
    dataQuality: { completeness: number;
        accuracy: number;
        consistency: number;
        confidence: number };

}
}
export interface SegmentAnalysisResult { segmentId: string;
    analysisDate: number;
    composition: {
        currentSize: number;
        growthRate: number;
        demographicBreakdown: DemographicBreakdown;
        behavioralProfile: BehavioralProfile;
        valueDistribution: ValueDistribution }
}
    };
    performance: { conversionMetrics: SegmentConversionMetrics;
        engagementMetrics: SegmentEngagementMetrics;
        revenueMetrics: SegmentRevenueMetrics;
        retentionMetrics: SegmentRetentionMetrics };
    funnelAnalysis: Map<string, FunnelSegmentMetrics>;
    lifecycle: { acquisitionSources: Map<string, number>;
        transitionPatterns: SegmentTransition[];
        exitReasons: Map<string, number>;
        averageLifetime: number };
    recommendations: { optimization: SegmentOptimization[];
        targeting: TargetingRecommendation[];
        personalization: PersonalizationSuggestion[];
        interventions: InterventionRecommendation[] };

}
}
export interface PathwayAnalysis { pathway: string[];
    frequency: number;
    conversionRate: number;
    averageTimeToComplete: number;
    averageValue: number;
    dropOffPoints: string[] }
}
}
export interface DropOffAnalysis { totalDropOffs: number;
    dropOffRate: number;
    topDropOffPoints: DropOffPoint[];
    recoveryOpportunities: RecoveryOpportunity[];
    seasonalPatterns: SeasonalDropOff[] }
}
}
export interface RecoveryOpportunity { dropOffPoint: string;
    potentialRecovery: number;
    recommendedActions: string[];
    estimatedImpact: number;
    implementationComplexity: 'low' | 'medium' | 'high' }
}
}
export interface SeasonalDropOff { period: string;
    dropOffMultiplier: number;
    affectedSegments: string[];
    confidence: number }
}
}
export interface EngagementPattern { patternType: 'temporal' | 'behavioral' | 'contextual' | 'value-based';
    pattern: string;
    frequency: number;
    cohortSize: number;
    conversionImpact: number;
    retentionImpact: number;
    recommendations: string[] }
}
}
export interface ValueSegmentation { segments: Array<{
        name: string;
        range: {
            min: number;
            max: number }
}
        };
        size: number;
        percentage: number;
        characteristics: string[];
    }>;
    distribution: { mean: number;
        median: number;
        standardDeviation: number;
        percentiles: Map<number, number> };

}
}
export interface CohortComparison { cohortId: string;
    comparisonPeriod: string;
    retentionDelta: Map<number, number>;
    conversionDelta: Map<number, number>;
    valueDelta: number;
    significance: number;
    insights: string[] }
}
}
export interface CohortBenchmark { benchmarkCohortId: string;
    benchmarkName: string;
    comparisonMetrics: {
        retentionComparison: Map<number, number>;
        conversionComparison: Map<number, number>;
        valueComparison: number;
        engagementComparison: number }
}
    };
    relativePerformance: number;
    insights: string[];

}
}
export interface IndustryBenchmark { industry: string;
    retentionBenchmarks: Map<number, number>;
    conversionBenchmarks: Map<number, number>;
    valueBenchmarks: {
        averageLTV: number;
        averageOrderValue: number;
        churnRate: number }
}
    };
    dataSource: string;
    lastUpdated: number;

}
}
export interface InterventionPoint { day: number;
    userCount: number;
    riskScore: number;
    recommendedActions: string[];
    expectedImpact: {
        retentionImprovement: number;
        revenueImpact: number;
        costOfIntervention: number;
        roi: number }
}
    };

}
}
export interface DemographicBreakdown { ageGroups: Map<string, number>;
    geoDistribution: Map<string, number>;
    deviceTypes: Map<string, number>;
    acquisitionChannels: Map<string, number>;
    accountTypes: Map<string, number> }
}
}
export interface BehavioralProfile { averageSessionsPerUser: number;
    averageSessionDuration: number;
    averagePageViews: number;
    engagementScore: number;
    activityPatterns: BehaviorPattern[];
    preferredTimes: Map<string, number>;
    contentPreferences: Map<string, number> }
}
}
export interface ValueDistribution { totalValue: number;
    averageValue: number;
    medianValue: number;
    valuePercentiles: Map<number, number>;
    highValueThreshold: number;
    highValueUsers: number;
    valueGrowthRate: number }
}
}
export interface SegmentConversionMetrics { overallConversionRate: number;
    conversionsByFunnel: Map<string, number>;
    averageTimeToConvert: number;
    conversionValueDistribution: ValueDistribution;
    topConversionPaths: PathwayAnalysis[] }
}
}
export interface SegmentEngagementMetrics { averageEngagementScore: number;
    sessionMetrics: {
        averageSessions: number;
        averageDuration: number;
        bounceRate: number;
        returningUserRate: number }
}
    };
    contentEngagement: Map<string, number>;
    featureUsage: Map<string, number>;
    socialEngagement: { shareRate: number;
        likeRate: number;
        commentRate: number };

}
}
export interface SegmentRevenueMetrics { totalRevenue: number;
    averageRevenuePerUser: number;
    revenueGrowthRate: number;
    revenueDistribution: ValueDistribution;
    monthlyRecurringRevenue?: number;
    customerLifetimeValue: number;
    paybackPeriod: number }
}
}
export interface SegmentRetentionMetrics { retentionRates: Map<number, number>;
    churnRate: number;
    averageLifetime: number;
    retentionCohorts: Map<string, number>;
    seasonalRetention: Map<string, number>;
    retentionByChannel: Map<string, number> }
}
}
export interface SegmentTransition { fromSegment: string;
    toSegment: string;
    transitionRate: number;
    averageTimeToTransition: number;
    triggerEvents: string[];
    transitionValue: number }
}
}
export interface SegmentOptimization { area: string;
    currentPerformance: number;
    targetPerformance: number;
    improvementPotential: number;
    recommendedActions: string[];
    estimatedImpact: {
        revenueImpact: number;
        conversionImprovement: number;
        retentionImprovement: number }
}
    };
    implementationEffort: 'low' | 'medium' | 'high';
    priority: 'high' | 'medium' | 'low';

}
}
export interface TargetingRecommendation { channel: string;
    targetingCriteria: string[];
    expectedReach: number;
    expectedConversionRate: number;
    estimatedCost: number;
    estimatedRevenue: number;
    roi: number;
    confidence: number }
}
}
export interface PersonalizationSuggestion { feature: string;
    personalizationType: 'content' | 'ui' | 'messaging' | 'pricing' | 'timing';
    targetSubsegment: string;
    expectedImpact: number;
    implementationComplexity: 'low' | 'medium' | 'high';
    dataRequirements: string[] }
}
}
export interface InterventionRecommendation { triggerCondition: string;
    interventionType: 'email' | 'push' | 'in_app' | 'discount' | 'support';
    timing: string;
    content: string;
    expectedResponse: number;
    cost: number;
    priority: 'high' | 'medium' | 'low';
/**
 * Cohort and Segment Manager
 * Manages the complete lifecycle of cohorts and segments
 */
export declare class CohortSegmentManager {
    private cohorts;
    private segments;
    private userSegmentMembership;
    private userCohortMembership;
    private analysisCache;
    private readonly CACHE_TTL;
    /**
     * Create a new cohort
     */
    createCohort(definition: Partial<ConversionCohort>): ConversionCohort;
    /**
     * Create a new segment
     */
    createSegment(definition: Partial<UserSegment>): UserSegment;
    /**
     * Assign user to cohort
     */
    assignUserToCohort(userId: string, cohortId: string, joinDate?: number): boolean;
    /**
     * Assign user to segment
     */
    assignUserToSegment(userId: string, segmentId: string): boolean;
    /**
     * Process conversion event for cohort/segment analysis
     */
    processConversionEvent(event: FlexibleConversionEvent): void;
    /**
     * Analyze cohort performance
     */
    analyzeCohort(cohortId: string, options?: AnalysisOptions): Promise<CohortAnalysisResult>;
    /**
     * Analyze segment performance
     */
    analyzeSegment(segmentId: string, options?: AnalysisOptions): Promise<SegmentAnalysisResult>;
    /**
     * Get user's cohort memberships
     */
    getUserCohorts(userId: string): string[];
    /**
     * Get user's segment memberships
     */
    getUserSegments(userId: string): string[];
    /**
     * Update segment definitions and reassign users
     */
    updateSegmentDefinition(segmentId: string, newDefinition: Partial<UserSegment>): void;
    /**
     * Archive old cohorts
     */
    archiveCohort(cohortId: string): void;
    /**
     * Generate insights across all cohorts and segments
     */
    generateCrossSegmentInsights(): CrossSegmentInsights;
    private performCohortAnalysis;
    private performSegmentAnalysis;
    private getCohortUsers;
    private getSegmentUsers;
    private calculateCohortMetrics;
    private analyzeCohortBehavior;
    private generateCohortPredictions;
    private generateCohortComparison;
    private evaluateCohortCriteria;
    private evaluateSegmentCriteria;
    private updateCohortMetrics;
    private updateSegmentMetrics;
    private updateCohortPerformanceMetrics;
    private updateSegmentPerformanceMetrics;
    private evaluateNewAssignments;
    private removeUserFromSegment;
    private reassignSegmentUsers;
    private assessDataQuality;
    private analyzeSegmentComposition;
    private calculateSegmentPerformance;
    private analyzeSegmentFunnelPerformance;
    private analyzeSegmentLifecycle;
    private generateSegmentRecommendations;
    private calculateSegmentOverlaps;
    private compareSegmentPerformance;
    private analyzeCohortTrends;
    private identifyOptimizationOpportunities;
    private generateCrossSegmentRecommendations;
    private generateCohortId;
    private generateSegmentId }
}
}
export interface AnalysisOptions { useCache?: boolean;
    includePredictions?: boolean;
    includeComparisons?: boolean;
    timeRange?: {
        start: number;
        end: number }
}
    };
    customMetrics?: string[];

}
}
export interface CrossSegmentInsights { segmentOverlaps: SegmentOverlap[];
    performanceComparisons: PerformanceComparison[];
    cohortTrends: CohortTrend[];
    opportunityAnalysis: OptimizationOpportunity[];
    recommendations: CrossSegmentRecommendation[] }
}
}
export interface SegmentOverlap { segmentIds: string[];
    overlapSize: number;
    overlapPercentage: number;
    characteristics: string[];
    performance: {
        conversionRate: number;
        retentionRate: number;
        averageValue: number }
}
    };

}
}
export interface PerformanceComparison { segmentIds: string[];
    metrics: Record<string, number>;
    significance: number;
    insights: string[] }
}
}
export interface CohortTrend { metric: string;
    trend: 'improving' | 'declining' | 'stable';
    magnitude: number;
    confidence: number;
    affectedCohorts: string[] }
}
}
export interface OptimizationOpportunity { area: string;
    segments: string[];
    currentPerformance: number;
    potentialImprovement: number;
    estimatedImpact: number;
    implementationEffort: 'low' | 'medium' | 'high' }
}
}
export interface CrossSegmentRecommendation {
    type: 'consolidation' | 'split' | 'targeting' | 'optimization';
    description: string;
    affectedSegments: string[];
    expectedImpact: number;
    priority: 'high' | 'medium' | 'low';
/**
 * Factory function to create CohortSegmentManager
 */
export declare const createCohortSegmentManager: () => CohortSegmentManager;
export default CohortSegmentManager;
//# sourceMappingURL=CohortSegmentManager.d.ts.map
}
}