/**
 * Template Performance Indicators - Story 30.2 Task 8
 *
 * Component that adds funnel performance indicators to template analytics,
 * providing visual insights into conversion performance directly within
 * template interfaces and analytics views.
 *
 * Features:
 * - Real-time funnel performance indicators
 * - Template-specific conversion metrics display
 * - Visual performance scoring and trends
 * - Comparative performance analysis
 * - Optimization opportunity highlighting
 * - Mobile-responsive indicator design
 * - Interactive drill-down capabilities
 * - Performance alerting and notifications
 */
import React from 'react';
import { ConversionFunnelDefinition } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';
export interface TemplatePerformanceIndicatorsProps {
    templateId: string;
    templateMetadata: TemplateMetadata;
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange?: {
        start: number;
        end: number;
    };
    displayMode?: IndicatorDisplayMode;
    comparisonEnabled?: boolean;
    alertsEnabled?: boolean;
    onIndicatorClick?: (indicator: PerformanceIndicator) => void;
    onOptimizationAction?: (action: OptimizationAction) => void;
    onExport?: (data: TemplatePerformanceExportData) => void;
}
export interface TemplateMetadata {
    templateId: string;
    templateName: string;
    templateTitle: string;
    category: string;
    subcategory?: string;
    creatorId: string;
    creatorName: string;
    publishDate: number;
    lastModified: number;
    version: string;
    tags: string[];
    description: string;
    pricing: TemplatePricing;
    status: TemplateStatus;
    visibility: TemplateVisibility;
}
export interface TemplatePricing {
    type: 'free' | 'premium' | 'subscription';
    price?: number;
    originalPrice?: number;
    discountPercentage?: number;
    subscriptionTier?: string;
    paymentModel: 'one_time' | 'recurring' | 'usage_based';
}
export type TemplateStatus = 'draft' | 'review' | 'published' | 'archived' | 'suspended';
export type TemplateVisibility = 'public' | 'unlisted' | 'private' | 'premium_only';
export type IndicatorDisplayMode = 'compact' | 'standard' | 'detailed' | 'dashboard' | 'overlay' | 'mobile';
export interface TemplatePerformanceData {
    templateMetrics: TemplateMetrics;
    funnelPerformance: TemplateFunnelPerformance;
    performanceIndicators: PerformanceIndicator[];
    competitivePosition: TemplateCompetitivePosition;
    optimizationOpportunities: TemplateOptimizationOpportunity[];
    performanceAlerts: PerformanceAlert[];
    historicalTrends: PerformanceTrend[];
    benchmarkComparison: BenchmarkComparison;
}
export interface TemplateMetrics {
    views: TemplateViewMetrics;
    engagement: TemplateEngagementMetrics;
    conversion: TemplateConversionMetrics;
    revenue: TemplateRevenueMetrics;
    quality: TemplateQualityMetrics;
    performance: TemplatePerformanceMetrics;
    lastUpdated: number;
}
export interface TemplateViewMetrics {
    totalViews: number;
    uniqueViews: number;
    viewsGrowth: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    averageViewDuration: number;
    bounceRate: number;
    viewSources: ViewSource[];
}
export interface ViewSource {
    source: string;
    views: number;
    percentage: number;
    conversionRate: number;
}
export interface TemplateEngagementMetrics {
    engagementScore: number;
    engagementTrend: number;
    averageTimeOnPage: number;
    interactionRate: number;
    shareCount: number;
    favoriteCount: number;
    commentCount: number;
    previewRate: number;
    downloadAttempts: number;
}
export interface TemplateConversionMetrics {
    overallConversionRate: number;
    conversionTrend: number;
    conversionsByStep: StepConversionData[];
    conversionsBySource: SourceConversionData[];
    conversionsByDevice: DeviceConversionData[];
    conversionsByTime: TimeConversionData[];
    dropoffPoints: DropoffPoint[];
}
export interface StepConversionData {
    stepId: string;
    stepName: string;
    stepOrder: number;
    entries: number;
    conversions: number;
    conversionRate: number;
    dropoffRate: number;
    averageTime: number;
    optimizationScore: number;
}
export interface SourceConversionData {
    source: string;
    visits: number;
    conversions: number;
    conversionRate: number;
    quality: number;
}
export interface DeviceConversionData {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    visits: number;
    conversions: number;
    conversionRate: number;
    averageTime: number;
}
export interface TimeConversionData {
    timeSlot: string;
    conversions: number;
    conversionRate: number;
    volume: number;
}
export interface DropoffPoint {
    stepId: string;
    stepName: string;
    dropoffRate: number;
    dropoffCount: number;
    reasons: DropoffReason[];
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface DropoffReason {
    reason: string;
    frequency: number;
    impact: number;
    actionable: boolean;
}
export interface TemplateRevenueMetrics {
    totalRevenue: number;
    revenueGrowth: number;
    revenuePerView: number;
    revenuePerConversion: number;
    averageOrderValue: number;
    lifetimeValue: number;
    refundRate: number;
    revenueBySource: RevenueBySource[];
    revenueTrend: RevenueTrendData[];
}
export interface RevenueBySource {
    source: string;
    revenue: number;
    percentage: number;
    growth: number;
}
export interface RevenueTrendData {
    date: number;
    revenue: number;
    conversions: number;
    averageValue: number;
}
export interface TemplateQualityMetrics {
    qualityScore: number;
    qualityTrend: number;
    averageRating: number;
    ratingCount: number;
    ratingDistribution: RatingDistribution;
    reviewSentiment: ReviewSentiment;
    qualityFactors: QualityFactor[];
}
export interface RatingDistribution {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
}
export interface ReviewSentiment {
    positive: number;
    neutral: number;
    negative: number;
    sentimentScore: number;
    keyThemes: SentimentTheme[];
}
export interface SentimentTheme {
    theme: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    frequency: number;
    impact: number;
}
export interface QualityFactor {
    factor: string;
    score: number;
    weight: number;
    trend: 'improving' | 'declining' | 'stable';
}
export interface TemplatePerformanceMetrics {
    performanceScore: number;
    performanceTrend: number;
    loadTime: number;
    errorRate: number;
    compatibility: number;
    accessibility: number;
    seoScore: number;
    mobileScore: number;
}
export interface TemplateFunnelPerformance {
    funnelId: string;
    overallPerformance: FunnelOverallPerformance;
    stepPerformance: FunnelStepPerformance[];
    conversionPaths: ConversionPath[];
    optimizationInsights: FunnelOptimizationInsight[];
    performanceComparison: FunnelPerformanceComparison;
}
export interface FunnelOverallPerformance {
    conversionRate: number;
    conversionRateTrend: number;
    totalConversions: number;
    averageTimeToConvert: number;
    conversionValue: number;
    efficiencyScore: number;
    bottleneckStep: string;
    topPerformingStep: string;
}
export interface FunnelStepPerformance {
    stepId: string;
    stepName: string;
    stepType: string;
    position: number;
    entries: number;
    exits: number;
    conversions: number;
    conversionRate: number;
    dropoffRate: number;
    averageTimeSpent: number;
    errorCount: number;
    satisfactionScore: number;
    optimizationPotential: number;
    performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}
export interface ConversionPath {
    pathId: string;
    steps: string[];
    frequency: number;
    conversionRate: number;
    averageValue: number;
    averageTime: number;
    efficiency: number;
}
export interface FunnelOptimizationInsight {
    type: OptimizationInsightType;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    confidence: number;
    expectedImprovement: number;
    affectedSteps: string[];
    actionItems: string[];
}
export type OptimizationInsightType = 'bottleneck_removal' | 'step_optimization' | 'path_simplification' | 'content_improvement' | 'technical_fix' | 'user_experience';
export interface FunnelPerformanceComparison {
    categoryAverage: number;
    creatorAverage: number;
    topPerformer: number;
    industryBenchmark: number;
    percentileRank: number;
    competitivePosition: 'leading' | 'above_average' | 'average' | 'below_average' | 'lagging';
}
export interface PerformanceIndicator {
    indicatorId: string;
    type: IndicatorType;
    name: string;
    value: number | string;
    displayValue: string;
    trend: IndicatorTrend;
    severity: IndicatorSeverity;
    status: IndicatorStatus;
    description: string;
    tooltip: string;
    actionable: boolean;
    actions: IndicatorAction[];
    visualization: IndicatorVisualization;
    thresholds: IndicatorThreshold[];
    lastUpdated: number;
}
export type IndicatorType = 'conversion_rate' | 'revenue_performance' | 'engagement_score' | 'quality_rating' | 'traffic_volume' | 'technical_performance' | 'competitive_position' | 'optimization_opportunity';
export interface IndicatorTrend {
    direction: 'up' | 'down' | 'stable' | 'volatile';
    percentage: number;
    timeframe: string;
    confidence: number;
}
export type IndicatorSeverity = 'critical' | 'warning' | 'info' | 'success';
export type IndicatorStatus = 'healthy' | 'attention_needed' | 'critical' | 'improving' | 'declining';
export interface IndicatorAction {
    actionId: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    expectedImpact: number;
    actionType: 'optimization' | 'fix' | 'enhancement' | 'investigation';
}
export interface IndicatorVisualization {
    type: 'gauge' | 'progress' | 'trend' | 'comparison' | 'heatmap';
    config: VisualizationConfig;
    colorScheme: ColorScheme;
}
export interface VisualizationConfig {
    showTrend: boolean;
    showComparison: boolean;
    timeframe: string;
    granularity: string;
    format: 'percentage' | 'currency' | 'number' | 'time' | 'score';
}
export interface ColorScheme {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
}
export interface IndicatorThreshold {
    level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    minValue: number;
    maxValue: number;
    color: string;
    description: string;
}
export interface TemplateCompetitivePosition {
    categoryRank: number;
    totalInCategory: number;
    percentile: number;
    rankChange: number;
    competitiveScore: number;
    strengthAreas: CompetitiveStrength[];
    weaknessAreas: CompetitiveWeakness[];
    opportunities: CompetitiveOpportunity[];
    threats: CompetitiveThreat[];
}
export interface CompetitiveStrength {
    area: string;
    score: number;
    description: string;
    advantage: string;
}
export interface CompetitiveWeakness {
    area: string;
    score: number;
    description: string;
    impact: string;
    improvement: string;
}
export interface CompetitiveOpportunity {
    opportunity: string;
    description: string;
    potential: number;
    effort: 'low' | 'medium' | 'high';
    timeframe: number;
}
export interface CompetitiveThreat {
    threat: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    probability: number;
    mitigation: string;
}
export interface TemplateOptimizationOpportunity {
    opportunityId: string;
    title: string;
    description: string;
    category: OpportunityCategory;
    impact: OpportunityImpact;
    effort: OpportunityEffort;
    priority: OpportunityPriority;
    timeline: OpportunityTimeline;
    requirements: OpportunityRequirement[];
    successMetrics: OpportunityMetric[];
    relatedIndicators: string[];
}
export type OpportunityCategory = 'conversion_optimization' | 'content_improvement' | 'technical_enhancement' | 'marketing_boost' | 'user_experience' | 'pricing_strategy';
export interface OpportunityImpact {
    revenueIncrease: number;
    conversionImprovement: number;
    trafficIncrease: number;
    ratingImprovement: number;
    confidenceLevel: number;
}
export interface OpportunityEffort {
    estimatedHours: number;
    skillsRequired: string[];
    resourcesNeeded: string[];
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
}
export type OpportunityPriority = 'critical' | 'high' | 'medium' | 'low';
export interface OpportunityTimeline {
    estimatedDuration: number;
    milestones: OpportunityMilestone[];
    dependencies: string[];
    risks: OpportunityRisk[];
}
export interface OpportunityMilestone {
    name: string;
    description: string;
    targetDate: number;
    deliverables: string[];
}
export interface OpportunityRisk {
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
}
export interface OpportunityRequirement {
    requirement: string;
    type: 'skill' | 'tool' | 'resource' | 'approval';
    description: string;
    critical: boolean;
}
export interface OpportunityMetric {
    metric: string;
    currentValue: number;
    targetValue: number;
    measurementMethod: string;
}
export interface PerformanceAlert {
    alertId: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    indicators: string[];
    triggeredAt: number;
    threshold: AlertThreshold;
    status: AlertStatus;
    actions: AlertAction[];
    escalation: AlertEscalation;
}
export type AlertType = 'performance_drop' | 'conversion_decline' | 'revenue_loss' | 'quality_issue' | 'technical_problem' | 'competitive_threat';
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed';
export interface AlertThreshold {
    metric: string;
    condition: 'above' | 'below' | 'equals' | 'change';
    value: number;
    timeframe: number;
}
export interface AlertAction {
    actionId: string;
    title: string;
    description: string;
    actionType: 'investigate' | 'fix' | 'optimize' | 'escalate';
    automated: boolean;
}
export interface AlertEscalation {
    escalationLevel: number;
    escalationTime: number;
    escalationTarget: string;
    maxEscalations: number;
}
export interface PerformanceTrend {
    metric: string;
    timeframe: string;
    dataPoints: TrendDataPoint[];
    trendAnalysis: TrendAnalysis;
    forecast: TrendForecast;
    seasonality: SeasonalityData;
}
export interface TrendDataPoint {
    timestamp: number;
    value: number;
    volume: number;
    context: Record<string, any>;
}
export interface TrendAnalysis {
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    strength: number;
    significance: number;
    acceleration: number;
    inflectionPoints: InflectionPoint[];
}
export interface InflectionPoint {
    timestamp: number;
    type: 'peak' | 'trough' | 'change';
    significance: number;
    context: string;
}
export interface TrendForecast {
    nextPeriod: ForecastPeriod[];
    confidence: number;
    assumptions: string[];
    risks: string[];
}
export interface ForecastPeriod {
    timestamp: number;
    predictedValue: number;
    confidenceInterval: {
        min: number;
        max: number;
    };
}
export interface SeasonalityData {
    detected: boolean;
    patterns: SeasonalPattern[];
    strength: number;
    reliability: number;
}
export interface SeasonalPattern {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    amplitude: number;
    phase: number;
    confidence: number;
}
export interface BenchmarkComparison {
    benchmarks: BenchmarkData[];
    position: BenchmarkPosition;
    gaps: PerformanceGap[];
    opportunities: BenchmarkOpportunity[];
}
export interface BenchmarkData {
    benchmarkType: 'category' | 'creator' | 'industry' | 'top_performer';
    name: string;
    metrics: BenchmarkMetric[];
    lastUpdated: number;
}
export interface BenchmarkMetric {
    metric: string;
    value: number;
    percentile: number;
    trend: 'improving' | 'declining' | 'stable';
}
export interface BenchmarkPosition {
    overallRank: number;
    categoryRank: number;
    percentile: number;
    competitiveAdvantage: string[];
    improvementAreas: string[];
}
export interface PerformanceGap {
    metric: string;
    gap: number;
    gapPercentage: number;
    priority: 'high' | 'medium' | 'low';
    actionItems: string[];
}
export interface BenchmarkOpportunity {
    opportunity: string;
    description: string;
    potentialGain: number;
    effort: 'low' | 'medium' | 'high';
    examples: BenchmarkExample[];
}
export interface BenchmarkExample {
    templateName: string;
    creatorName: string;
    achievement: string;
    strategy: string;
}
export interface OptimizationAction {
    actionType: 'view_details' | 'start_optimization' | 'fix_issue' | 'ignore_alert';
    targetId: string;
    details: Record<string, any>;
    timestamp: number;
}
export interface TemplatePerformanceExportData {
    templateMetadata: TemplateMetadata;
    performanceData: TemplatePerformanceData;
    indicators: PerformanceIndicator[];
    trends: PerformanceTrend[];
    exportTimestamp: number;
    exportConfig: ExportConfig;
}
export interface ExportConfig {
    format: 'json' | 'csv' | 'excel' | 'pdf';
    includeCharts: boolean;
    timeRange: {
        start: number;
        end: number;
    };
    metrics: string[];
}
export declare const TemplatePerformanceIndicators: React.FC<TemplatePerformanceIndicatorsProps>;
//# sourceMappingURL=TemplatePerformanceIndicators.d.ts.map