/**
 * Creator-Facing Conversion Optimization Dashboard - Story 30.2 Task 8
 *
 * Specialized dashboard for template creators that provides actionable conversion
 * optimization recommendations, performance insights, and growth opportunities.
 *
 * Features:
 * - Creator-specific funnel performance analytics
 * - Personalized optimization recommendations
 * - Template performance comparison and ranking
 * - Revenue optimization insights
 * - Competitive analysis and market positioning
 * - Creator growth trajectory tracking
 * - Automated improvement suggestions
 * - Success story integration and learning resources
 */
import React from 'react';
import { ConversionFunnelDefinition } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
export interface CreatorOptimizationDashboardProps {
    creatorId: string;
    creatorProfile: CreatorProfile;
    funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    timeRange?: {
        start: number;
        end: number;

}
    };
    dashboardMode?: CreatorDashboardMode;
    onActionTaken?: (action: CreatorAction) => void;
    onGoalSet?: (goal: CreatorGoal) => void;
    onExport?: (data: CreatorOptimizationExportData) => void;

}
export interface CreatorProfile {
    creatorId: string;
    displayName: string;
    email: string;
    tier: CreatorTier;
    joinDate: number;
    specializations: string[];
    totalTemplates: number;
    totalRevenue: number;
    averageRating: number;
    followerCount: number;
    badgesEarned: CreatorBadge[];
    preferences: CreatorPreferences;
    goals: CreatorGoal[];

export type CreatorTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

}
export interface CreatorBadge {
    badgeId: string;
    name: string;
    description: string;
    earnedDate: number;
    category: 'quality' | 'popularity' | 'innovation' | 'community' | 'milestone';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';


}
export interface CreatorPreferences {
    notificationSettings: NotificationSettings;
    displaySettings: DisplaySettings;
    privacySettings: PrivacySettings;
    optimizationFocus: OptimizationFocus[];


}
export interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    performanceAlerts: boolean;
    marketingUpdates: boolean;
    communityUpdates: boolean;
    frequency: 'real_time' | 'daily' | 'weekly' | 'monthly';


}
export interface DisplaySettings {
    theme: 'light' | 'dark' | 'auto';
    dashboardLayout: 'compact' | 'standard' | 'detailed';
    defaultTimeRange: 'week' | 'month' | 'quarter' | 'year';
    chartType: 'line' | 'bar' | 'area' | 'mixed';


}
export interface PrivacySettings {
    profileVisibility: 'public' | 'limited' | 'private';
    revenueDataSharing: boolean;
    performanceDataSharing: boolean;
    allowBenchmarking: boolean;

export type OptimizationFocus = 'revenue_growth' | 'conversion_improvement' | 'user_engagement' | 'market_expansion' | 'quality_enhancement' | 'competitive_advantage';
export type CreatorDashboardMode = 'overview' | 'performance' | 'optimization' | 'growth' | 'learning';

}
export interface CreatorOptimizationData {
    overviewMetrics: CreatorOverviewMetrics;
    templatePerformance: CreatorTemplatePerformance[];
    optimizationRecommendations: CreatorOptimizationRecommendation[];
    competitiveInsights: CreatorCompetitiveInsights;
    growthOpportunities: CreatorGrowthOpportunity[];
    learningResources: CreatorLearningResource[];
    successStories: CreatorSuccessStory[];
    automatedSuggestions: AutomatedSuggestion[];
    goalProgress: CreatorGoalProgress[];


}
export interface CreatorOverviewMetrics {
    totalRevenue: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    totalTemplates: number;
    activeTemplates: number;
    averageConversionRate: number;
    conversionTrend: number;
    totalDownloads: number;
    downloadGrowth: number;
    averageRating: number;
    ratingTrend: number;
    marketRank: number;
    rankChange: number;
    followerCount: number;
    followerGrowth: number;
    lastUpdated: number;


}
export interface CreatorTemplatePerformance {
    templateId: string;
    templateName: string;
    category: string;
    publishDate: number;
    lastUpdated: number;
    metrics: TemplateMetrics;
    conversionFunnel: TemplateConversionFunnel;
    optimization: TemplateOptimizationData;
    competitivePosition: TemplateCompetitivePosition;
    recommendations: TemplateRecommendation[];


}
export interface TemplateMetrics {
    views: number;
    downloads: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
    rating: number;
    reviewCount: number;
    favoriteCount: number;
    shareCount: number;
    bounceRate: number;
    timeOnPage: number;


}
export interface TemplateConversionFunnel {
    steps: TemplateConversionStep[];
    overallConversionRate: number;
    biggestDropoff: string;
    biggestOpportunity: string;
    optimizationPotential: number;


}
export interface TemplateConversionStep {
    stepName: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
    dropoffRate: number;
    averageTimeSpent: number;
    optimizationScore: number;


}
export interface TemplateOptimizationData {
    optimizationScore: number;
    optimizationPotential: number;
    keyStrengths: string[];
    improvementAreas: string[];
    quickWins: OptimizationQuickWin[];
    longTermOpportunities: OptimizationOpportunity[];


}
export interface OptimizationQuickWin {
    action: string;
    description: string;
    expectedImpact: number;
    effort: 'minimal' | 'low' | 'medium';
    timeToImplement: number;
    successProbability: number;


}
export interface OptimizationOpportunity {
    opportunity: string;
    description: string;
    expectedImpact: number;
    effort: 'medium' | 'high' | 'significant';
    timeToImplement: number;
    investmentRequired: number;
    expectedROI: number;


}
export interface TemplateCompetitivePosition {
    categoryRank: number;
    totalInCategory: number;
    percentile: number;
    topCompetitors: CompetitorTemplate[];
    competitiveAdvantages: string[];
    vulnerabilities: string[];
    marketTrends: MarketTrend[];


}
export interface CompetitorTemplate {
    templateId: string;
    templateName: string;
    creatorName: string;
    metrics: CompetitorMetrics;
    strengthsVsYours: string[];
    weaknessesVsYours: string[];


}
export interface CompetitorMetrics {
    estimatedRevenue: number;
    estimatedDownloads: number;
    rating: number;
    reviewCount: number;
    pricePoint: number;


}
export interface MarketTrend {
    trend: string;
    direction: 'growing' | 'declining' | 'stable';
    impact: 'high' | 'medium' | 'low';
    opportunity: string;
    threat: string;


}
export interface TemplateRecommendation {
    type: TemplateRecommendationType;
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: RecommendationCategory;
    expectedImpact: RecommendationImpact;
    implementation: RecommendationImplementation;
    successMetrics: string[];

export type TemplateRecommendationType = 'pricing_optimization' | 'content_improvement' | 'marketing_enhancement' | 'user_experience' | 'competitive_positioning' | 'technical_optimization';
export type RecommendationCategory = 'quick_win' | 'strategic_improvement' | 'competitive_advantage' | 'long_term_growth';

}
export interface RecommendationImpact {
    revenueIncrease: number;
    conversionImprovement: number;
    downloadIncrease: number;
    ratingImprovement: number;
    timeToImpact: number;
    confidence: number;


}
export interface RecommendationImplementation {
    steps: string[];
    estimatedTime: number;
    requiredSkills: string[];
    tools: string[];
    cost: number;
    difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';


}
export interface CreatorOptimizationRecommendation {
    recommendationId: string;
    type: CreatorRecommendationType;
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    impact: CreatorRecommendationImpact;
    targetTemplates: string[];
    actionPlan: CreatorActionPlan;
    relatedGoals: string[];

export type CreatorRecommendationType = 'portfolio_optimization' | 'pricing_strategy' | 'marketing_improvement' | 'skill_development' | 'market_expansion' | 'brand_building' | 'community_engagement';

}
export interface CreatorRecommendationImpact {
    portfolioImpact: number;
    revenueImpact: number;
    reachImpact: number;
    brandImpact: number;
    timeframe: number;
    successProbability: number;


}
export interface CreatorActionPlan {
    phases: ActionPhase[];
    totalTimeline: number;
    milestones: ActionMilestone[];
    resources: ActionResource[];
    riskMitigation: RiskMitigation[];


}
export interface ActionPhase {
    phaseName: string;
    description: string;
    duration: number;
    tasks: ActionTask[];
    dependencies: string[];
    successCriteria: string[];


}
export interface ActionTask {
    taskName: string;
    description: string;
    effort: number;
    skills: string[];
    deliverables: string[];


}
export interface ActionMilestone {
    milestoneName: string;
    targetDate: number;
    metrics: MilestoneMetric[];
    reward: string;


}
export interface MilestoneMetric {
    metric: string;
    target: number;
    current: number;
    progress: number;


}
export interface ActionResource {
    resourceType: 'tool' | 'service' | 'education' | 'template' | 'community';
    name: string;
    description: string;
    cost: number;
    link?: string;


}
export interface RiskMitigation {
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
    contingency: string;


}
export interface CreatorCompetitiveInsights {
    marketPosition: MarketPosition;
    competitorAnalysis: CompetitorAnalysis[];
    marketOpportunities: MarketOpportunity[];
    threatAnalysis: ThreatAnalysis[];
    benchmarkData: BenchmarkData;


}
export interface MarketPosition {
    overallRank: number;
    categoryRanks: CategoryRank[];
    marketShare: number;
    brandStrength: number;
    competitiveAdvantages: string[];
    uniqueValueProposition: string;


}
export interface CategoryRank {
    category: string;
    rank: number;
    totalCreators: number;
    marketShare: number;
    growth: number;


}
export interface CompetitorAnalysis {
    competitorId: string;
    competitorName: string;
    competitorTier: CreatorTier;
    strengths: string[];
    weaknesses: string[];
    strategy: string;
    recentMoves: string[];
    threat_level: 'low' | 'medium' | 'high';


}
export interface MarketOpportunity {
    opportunity: string;
    description: string;
    marketSize: number;
    competition: 'low' | 'medium' | 'high';
    barrierToEntry: 'low' | 'medium' | 'high';
    timeToMarket: number;
    investmentRequired: number;
    expectedROI: number;


}
export interface ThreatAnalysis {
    threat: string;
    description: string;
    probability: number;
    impact: number;
    timeframe: number;
    mitigation: string[];
    monitoring: string[];


}
export interface BenchmarkData {
    industryAverages: IndustryAverage[];
    peerComparisons: PeerComparison[];
    bestPractices: BestPractice[];
    performance_gaps: PerformanceGap[];


}
export interface IndustryAverage {
    metric: string;
    industryAverage: number;
    yourValue: number;
    percentile: number;
    trend: 'above' | 'below' | 'at_average';


}
export interface PeerComparison {
    metric: string;
    yourValue: number;
    peerAverage: number;
    topPerformer: number;
    bottomPerformer: number;
    ranking: number;


}
export interface BestPractice {
    practice: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'moderate' | 'challenging';
    impact: 'high' | 'medium' | 'low';
    examples: BestPracticeExample[];


}
export interface BestPracticeExample {
    creatorName: string;
    implementation: string;
    results: string;
    keyTakeaways: string[];


}
export interface PerformanceGap {
    area: string;
    gap: number;
    priority: 'high' | 'medium' | 'low';
    actionItems: string[];
    timeToClose: number;


}
export interface CreatorGrowthOpportunity {
    opportunityId: string;
    title: string;
    description: string;
    category: GrowthOpportunityCategory;
    potential: GrowthPotential;
    requirements: GrowthRequirement[];
    roadmap: GrowthRoadmap;
    risks: GrowthRisk[];

export type GrowthOpportunityCategory = 'new_market' | 'new_product' | 'skill_expansion' | 'partnership' | 'automation' | 'brand_building';

}
export interface GrowthPotential {
    revenueUpside: number;
    marketSize: number;
    timeToValue: number;
    scalability: 'low' | 'medium' | 'high';
    sustainability: 'low' | 'medium' | 'high';
    confidenceLevel: number;


}
export interface GrowthRequirement {
    requirement: string;
    type: 'skill' | 'resource' | 'investment' | 'partnership' | 'technology';
    description: string;
    cost: number;
    timeToAcquire: number;
    alternatives: string[];


}
export interface GrowthRoadmap {
    phases: GrowthPhase[];
    totalTimeline: number;
    keyMilestones: GrowthMilestone[];
    dependencies: GrowthDependency[];


}
export interface GrowthPhase {
    phaseName: string;
    description: string;
    duration: number;
    objectives: string[];
    deliverables: string[];
    success_criteria: string[];


}
export interface GrowthMilestone {
    milestoneName: string;
    description: string;
    targetDate: number;
    metrics: MilestoneMetric[];
    dependencies: string[];


}
export interface GrowthDependency {
    dependency: string;
    type: 'internal' | 'external' | 'market' | 'technology';
    criticality: 'high' | 'medium' | 'low';
    mitigation: string;


}
export interface GrowthRisk {
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
    monitoring: string;


}
export interface CreatorLearningResource {
    resourceId: string;
    title: string;
    description: string;
    type: LearningResourceType;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedTime: number;
    format: ResourceFormat;
    provider: string;
    cost: number;
    rating: number;
    relevanceScore: number;
    relatedSkills: string[];
    prerequisites: string[];

export type LearningResourceType = 'course' | 'tutorial' | 'documentation' | 'video' | 'book' | 'workshop' | 'certification' | 'community';
export type ResourceFormat = 'online' | 'offline' | 'interactive' | 'self_paced' | 'instructor_led';

}
export interface CreatorSuccessStory {
    storyId: string;
    title: string;
    creatorName: string;
    creatorTier: CreatorTier;
    challenge: string;
    solution: string;
    results: SuccessResults;
    timeline: number;
    keyTakeaways: string[];
    applicableStrategies: string[];
    relevanceScore: number;


}
export interface SuccessResults {
    revenueIncrease: number;
    conversionImprovement: number;
    downloadGrowth: number;
    ratingImprovement: number;
    marketShareGain: number;
    timeToResults: number;


}
export interface AutomatedSuggestion {
    suggestionId: string;
    type: SuggestionType;
    title: string;
    description: string;
    confidence: number;
    impact: SuggestionImpact;
    automationLevel: AutomationLevel;
    triggerConditions: TriggerCondition[];
    implementation: SuggestionImplementation;

export type SuggestionType = 'pricing_adjustment' | 'content_update' | 'marketing_action' | 'performance_alert' | 'opportunity_alert' | 'competitive_response';

}
export interface SuggestionImpact {
    primary: string;
    secondary: string[];
    quantifiedImpact: number;
    timeframe: number;
    certainty: number;

export type AutomationLevel = 'manual' | 'semi_automated' | 'fully_automated';

}
export interface TriggerCondition {
    condition: string;
    threshold: number;
    timeframe: number;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';


}
export interface SuggestionImplementation {
    automatable: boolean;
    manualSteps: string[];
    toolsRequired: string[];
    skillsRequired: string[];
    estimatedTime: number;


}
export interface CreatorGoal {
    goalId: string;
    title: string;
    description: string;
    category: GoalCategory;
    target: GoalTarget;
    timeline: GoalTimeline;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: GoalStatus;
    progress: GoalProgress;
    relatedRecommendations: string[];

export type GoalCategory = 'revenue' | 'growth' | 'quality' | 'efficiency' | 'market_position' | 'skill_development';

}
export interface GoalTarget {
    metric: string;
    currentValue: number;
    targetValue: number;
    improvementPercentage: number;
    measurementFrequency: 'daily' | 'weekly' | 'monthly';


}
export interface GoalTimeline {
    startDate: number;
    targetDate: number;
    duration: number;
    milestones: GoalMilestone[];
    checkpoints: GoalCheckpoint[];


}
export interface GoalMilestone {
    name: string;
    description: string;
    date: number;
    metrics: MilestoneMetric[];
    rewards: string[];


}
export interface GoalCheckpoint {
    date: number;
    expectedProgress: number;
    reviewCriteria: string[];
    adjustmentOptions: string[];

export type GoalStatus = 'draft' | 'active' | 'on_track' | 'at_risk' | 'delayed' | 'completed' | 'cancelled';

}
export interface GoalProgress {
    currentProgress: number;
    progressTrend: 'accelerating' | 'on_track' | 'slowing' | 'stalled';
    lastUpdated: number;
    nextMilestone: string;
    daysToGoal: number;
    likelihoodOfSuccess: number;


}
export interface CreatorGoalProgress {
    goal: CreatorGoal;
    progressData: ProgressDataPoint[];
    insights: ProgressInsight[];
    adjustmentRecommendations: AdjustmentRecommendation[];


}
export interface ProgressDataPoint {
    date: number;
    value: number;
    target: number;
    progress: number;


}
export interface ProgressInsight {
    insight: string;
    type: 'positive' | 'concern' | 'opportunity' | 'risk';
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;


}
export interface AdjustmentRecommendation {
    recommendation: string;
    reason: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    urgency: 'immediate' | 'soon' | 'planned';


}
export interface CreatorAction {
    actionType: 'goal_set' | 'recommendation_accepted' | 'template_updated' | 'learning_started';
    details: Record<string, any>;
    timestamp: number;


}
export interface CreatorOptimizationExportData {
    creatorProfile: CreatorProfile;
    overviewMetrics: CreatorOverviewMetrics;
    templatePerformance: CreatorTemplatePerformance[];
    optimizationRecommendations: CreatorOptimizationRecommendation[];
    goalProgress: CreatorGoalProgress[];
    exportTimestamp: number;

export declare const CreatorOptimizationDashboard: React.FC<CreatorOptimizationDashboardProps>;
//# sourceMappingURL=CreatorOptimizationDashboard.d.ts.map
}