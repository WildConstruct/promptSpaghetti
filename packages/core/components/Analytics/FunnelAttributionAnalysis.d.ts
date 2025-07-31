/**
 * Funnel Attribution Analysis for Marketing Channels - Story 30.2 Task 7
 *
 * Advanced attribution analysis system that tracks and analyzes the contribution
 * of different marketing channels to funnel conversion performance.
 *
 * Features:
 * - Multi-touch attribution modeling (first-touch, last-touch, linear, time-decay, position-based)
 * - Cross-channel journey analysis and visualization
 * - Channel performance comparison and optimization insights
 * - Attribution model comparison and validation
 * - ROI and ROAS calculation per channel
 * - Customer journey mapping with channel touchpoints
 * - Attribution data-driven budget allocation recommendations
 * - Cross-device attribution tracking
 */
import React from 'react';
import { ConversionFunnelDefinition, ConversionStep, UserSegment, ConversionCohort } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
export interface FunnelAttributionAnalysisProps {
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange: {
        start: number;
        end: number;
}
    };
    attributionConfig?: AttributionConfiguration;
    channels?: MarketingChannel[];
    segments?: UserSegment[];
    cohorts?: ConversionCohort[];
    comparisonMode?: AttributionComparisonMode;
    onInsightGenerated?: (insight: AttributionInsight) => void;
    onExport?: (data: AttributionAnalysisExportData) => void;

}
export interface AttributionConfiguration {
    models: AttributionModel[];
    touchpointWindow: number;
    conversionWindow: number;
    crossDeviceTracking: boolean;
    excludeDirectTraffic: boolean;
    minimumEngagement: number;
    customAttribution?: CustomAttributionRule[];

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' | 'data_driven' | 'custom';
export type AttributionComparisonMode = 'model_comparison' | 'channel_comparison' | 'temporal_analysis';

}
export interface AttributionAnalysisData {
    channelAttribution: ChannelAttributionData[];
    journeyAnalysis: CustomerJourneyData[];
    modelComparison: AttributionModelComparison[];
    touchpointAnalysis: TouchpointAnalysisData[];
    crossChannelInsights: CrossChannelInsight[];
    budgetRecommendations: BudgetAllocationRecommendation[];
    roiAnalysis: ChannelROIAnalysis[];
    conversionPaths: ConversionPathData[];
    attributionTrends: AttributionTrendData[];

}
export interface MarketingChannel {
    id: string;
    name: string;
    category: ChannelCategory;
    cost: number;
    budget: number;
    trackingParameters: Record<string, string>;
    metadata: ChannelMetadata;

export type ChannelCategory = 'paid_search' | 'organic_search' | 'social_media' | 'display' | 'email' | 'direct' | 'referral' | 'affiliate' | 'content_marketing' | 'video' | 'mobile_app' | 'offline';

}
export interface ChannelMetadata {
    platform?: string;
    campaign?: string;
    adGroup?: string;
    creative?: string;
    placement?: string;
    audience?: string;

}
export interface ChannelAttributionData {
    channelId: string;
    channelName: string;
    category: ChannelCategory;
    attributionByModel: Record<AttributionModel, ChannelAttribution>;
    performance: ChannelPerformance;
    touchpointMetrics: TouchpointMetrics;
    conversionContribution: ConversionContribution;
    journeyRole: JourneyRole;
    efficiency: ChannelEfficiency;

}
export interface ChannelAttribution {
    conversions: number;
    attributedRevenue: number;
    attributionWeight: number;
    confidence: number;
    incrementality: number;

}
export interface ChannelPerformance {
    impressions: number;
    clicks: number;
    sessions: number;
    bounceRate: number;
    averageSessionDuration: number;
    pagesPerSession: number;
    goalCompletions: number;

}
export interface TouchpointMetrics {
    totalTouchpoints: number;
    uniqueUsers: number;
    averageTouchpointsPerUser: number;
    firstTouchPercent: number;
    lastTouchPercent: number;
    middleTouchPercent: number;
    assistedConversions: number;

}
export interface ConversionContribution {
    directConversions: number;
    assistedConversions: number;
    totalConversions: number;
    conversionRate: number;
    averageTimeToConversion: number;
    conversionValue: number;

}
export interface JourneyRole {
    primaryRole: 'discovery' | 'consideration' | 'conversion' | 'retention';
    roleDistribution: Record<string, number>;
    synergisticChannels: string[];
    competingChannels: string[];

}
export interface ChannelEfficiency {
    costPerConversion: number;
    returnOnAdSpend: number;
    costPerClick: number;
    costPerAcquisition: number;
    lifetimeValue: number;
    efficiencyScore: number;

}
export interface CustomerJourneyData {
    journeyId: string;
    userId: string;
    startTimestamp: number;
    conversionTimestamp?: number;
    totalTouchpoints: number;
    journeyDuration: number;
    touchpoints: JourneyTouchpoint[];
    conversionValue: number;
    journeyType: JourneyType;
    complexity: JourneyComplexity;
    patterns: JourneyPattern[];

export type JourneyType = 'converted' | 'abandoned' | 'ongoing';
export type JourneyComplexity = 'simple' | 'moderate' | 'complex' | 'very_complex';

}
export interface JourneyTouchpoint {
    timestamp: number;
    channelId: string;
    channelName: string;
    category: ChannelCategory;
    touchpointType: TouchpointType;
    engagementScore: number;
    sessionDuration: number;
    pageViews: number;
    events: TouchpointEvent[];
    attribution: TouchpointAttribution;
    position: TouchpointPosition;

export type TouchpointType = 'awareness' | 'consideration' | 'intent' | 'conversion' | 'retention';
export type TouchpointPosition = 'first' | 'middle' | 'last' | 'only';

}
export interface TouchpointEvent {
    eventType: string;
    eventValue?: number;
    metadata: Record<string, any>;

}
export interface TouchpointAttribution {
    weight: number;
    influence: number;
    incrementalValue: number;
    modelAttributions: Record<AttributionModel, number>;

}
export interface JourneyPattern {
    patternType: string;
    frequency: number;
    effectiveness: number;
    avgConversionRate: number;
    avgJourneyLength: number;

}
export interface AttributionModelComparison {
    modelA: AttributionModel;
    modelB: AttributionModel;
    conversionDifference: number;
    revenueDifference: number;
    channelRankingChanges: ChannelRankingChange[];
    correlationScore: number;
    modelAccuracy: ModelAccuracy;
    recommendations: ModelRecommendation[];

}
export interface ChannelRankingChange {
    channelId: string;
    channelName: string;
    rankingChangeA: number;
    rankingChangeB: number;
    rankingDifference: number;
    impactSignificance: 'high' | 'medium' | 'low';

}
export interface ModelAccuracy {
    model: AttributionModel;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    incrementalityScore: number;

}
export interface ModelRecommendation {
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    implementation: string;

}
export interface TouchpointAnalysisData {
    step: ConversionStep;
    channelContributions: StepChannelContribution[];
    dropoffAnalysis: StepDropoffAnalysis;
    optimizationOpportunities: StepOptimizationOpportunity[];

}
export interface StepChannelContribution {
    channelId: string;
    channelName: string;
    contribution: number;
    effectiveness: number;
    userFlow: number;
    conversionImpact: number;

}
export interface StepDropoffAnalysis {
    totalDropoffs: number;
    channelDropoffs: ChannelDropoffData[];
    dropoffReasons: DropoffReason[];
    recoveryOpportunities: RecoveryOpportunity[];

}
export interface ChannelDropoffData {
    channelId: string;
    channelName: string;
    dropoffRate: number;
    dropoffCount: number;
    reasons: string[];

}
export interface DropoffReason {
    reason: string;
    frequency: number;
    affectedChannels: string[];
    impact: 'high' | 'medium' | 'low';

}
export interface RecoveryOpportunity {
    opportunity: string;
    potentialRecovery: number;
    effort: 'low' | 'medium' | 'high';
    expectedImpact: number;

}
export interface StepOptimizationOpportunity {
    opportunity: string;
    affectedChannels: string[];
    potentialLift: number;
    implementation: string;
    priority: 'high' | 'medium' | 'low';

}
export interface CrossChannelInsight {
    insightType: CrossChannelInsightType;
    channels: string[];
    description: string;
    impact: number;
    confidence: number;
    actionable: boolean;
    recommendations: string[];

export type CrossChannelInsightType = 'synergy' | 'cannibalization' | 'sequence_optimization' | 'budget_reallocation' | 'creative_optimization' | 'timing_optimization';

}
export interface BudgetAllocationRecommendation {
    channelId: string;
    channelName: string;
    currentBudget: number;
    recommendedBudget: number;
    budgetChange: number;
    budgetChangePercent: number;
    expectedImpact: BudgetImpactProjection;
    justification: string;
    confidence: number;
    priority: 'immediate' | 'high' | 'medium' | 'low';

}
export interface BudgetImpactProjection {
    conversionIncrease: number;
    revenueIncrease: number;
    roiImprovement: number;
    timeToImpact: number;
    riskAssessment: 'low' | 'medium' | 'high';

}
export interface ChannelROIAnalysis {
    channelId: string;
    channelName: string;
    cost: number;
    revenue: number;
    roi: number;
    roas: number;
    incrementalROI: number;
    marginalROI: number;
    saturationPoint: number;
    optimalSpend: number;
    roiTrend: ROITrendData[];

}
export interface ROITrendData {
    period: string;
    spend: number;
    revenue: number;
    roi: number;
    incrementalROI: number;

}
export interface ConversionPathData {
    pathId: string;
    path: string[];
    frequency: number;
    conversionRate: number;
    averageValue: number;
    totalValue: number;
    pathLength: number;
    pathDuration: number;
    efficiency: number;
    optimization: PathOptimization;

}
export interface PathOptimization {
    bottlenecks: string[];
    opportunities: string[];
    alternativePaths: string[];
    expectedImprovement: number;

}
export interface AttributionTrendData {
    period: string;
    channelTrends: ChannelTrendData[];
    modelStability: ModelStabilityData[];
    seasonalityFactors: SeasonalityFactor[];

}
export interface ChannelTrendData {
    channelId: string;
    channelName: string;
    trendDirection: 'increasing' | 'decreasing' | 'stable';
    trendStrength: number;
    attribution: number;
    confidence: number;

}
export interface ModelStabilityData {
    model: AttributionModel;
    stability: number;
    variance: number;
    reliability: number;

}
export interface SeasonalityFactor {
    factor: string;
    impact: number;
    confidence: number;
    affectedChannels: string[];

}
export interface AttributionInsight {
    type: AttributionInsightType;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    affectedChannels: string[];
    actionable: boolean;
    recommendations: InsightRecommendation[];
    data: Record<string, any>;

export type AttributionInsightType = 'channel_performance' | 'attribution_shift' | 'journey_optimization' | 'budget_opportunity' | 'model_accuracy' | 'cross_channel_effect';

}
export interface InsightRecommendation {
    action: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    resources: string[];

}
export interface CustomAttributionRule {
    id: string;
    name: string;
    description: string;
    condition: string;
    weight: number;
    priority: number;
    enabled: boolean;

}
export interface AttributionAnalysisExportData {
    channelAttribution: ChannelAttributionData[];
    journeyAnalysis: CustomerJourneyData[];
    modelComparison: AttributionModelComparison[];
    budgetRecommendations: BudgetAllocationRecommendation[];
    roiAnalysis: ChannelROIAnalysis[];
    conversionPaths: ConversionPathData[];
    exportTimestamp: number;
    configuration: AttributionConfiguration;
    insights: AttributionInsight[];

export declare const FunnelAttributionAnalysis: React.FC<FunnelAttributionAnalysisProps>;
//# sourceMappingURL=FunnelAttributionAnalysis.d.ts.map
}