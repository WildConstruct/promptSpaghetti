/**
 * Marketplace Funnel Integration - Story 30.2 Task 8
 *
 * Integration component that embeds funnel insights into marketplace optimization tools,
 * providing seamless access to conversion analytics within the marketplace interface.
 *
 * Features:
 * - Embedded funnel widgets for marketplace dashboards
 * - Real-time conversion metrics display
 * - Integration with template performance analytics
 * - Creator-facing optimization recommendations
 * - Automated suggestion system integration
 * - Cross-platform analytics synchronization
 * - Performance impact indicators
 * - Revenue attribution displays
 */
import React from 'react';
import { ConversionFunnelDefinition } from '../../analytics/ConversionDataModel';
import { ConversionAnalyticsInfrastructure } from '../../analytics/ConversionAnalyticsInfrastructure';

}
}
export interface MarketplaceFunnelIntegrationProps { funnelDefinition: ConversionFunnelDefinition;
    analyticsInfrastructure: ConversionAnalyticsInfrastructure;
    marketplaceContext: MarketplaceContext;
    integrationMode?: IntegrationMode;
    widgetConfig?: WidgetConfiguration;
    userRole?: UserRole;
    onOptimizationAction?: (action: OptimizationAction) => void;
    onInsightInteraction?: (insight: InsightInteraction) => void;
    onExport?: (data: MarketplaceIntegrationExportData) => void }
}
}
export interface MarketplaceContext { marketplaceId: string;
    marketplaceName: string;
    templateContext?: TemplateContext;
    creatorContext?: CreatorContext;
    adminContext?: AdminContext;
    environment: 'production' | 'staging' | 'development';
    permissions: MarketplacePermission[] }
}
}
export interface TemplateContext { templateId: string;
    templateName: string;
    templateCategory: string;
    creatorId: string;
    creatorName: string;
    publishDate: number;
    lastModified: number;
    tags: string[];
    pricing: TemplatePricing;
    performance: TemplatePerformance }
}
}
export interface TemplatePricing { priceType: 'free' | 'premium' | 'subscription';
    price?: number;
    subscriptionTier?: string;
    discounts: TemplateDiscount[] }
}
}
export interface TemplateDiscount { type: 'percentage' | 'fixed';
    value: number;
    validUntil: number;
    conditions: string[] }
}
}
export interface TemplatePerformance { downloads: number;
    views: number;
    conversionRate: number;
    revenue: number;
    rating: number;
    reviews: number;
    lastUpdated: number }
}
}
export interface CreatorContext { creatorId: string;
    creatorName: string;
    creatorTier: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalTemplates: number;
    totalRevenue: number;
    averageRating: number;
    joinDate: number;
    specializations: string[];
    achievements: CreatorAchievement[] }
}
}
export interface CreatorAchievement { achievementId: string;
    name: string;
    description: string;
    earnedDate: number;
    badge: string }
}
}
export interface AdminContext { adminId: string;
    adminRole: 'super_admin' | 'marketplace_admin' | 'analytics_admin';
    permissions: AdminPermission[];
    managedCategories: string[];

export type AdminPermission = 'view_all_analytics' | 'modify_funnels' | 'manage_creators' | 'export_data' | 'configure_integrations';
export type MarketplacePermission = 'view_basic_analytics' | 'view_advanced_analytics' | 'receive_recommendations' | 'export_personal_data' | 'configure_alerts';
export type IntegrationMode = 'embedded_widget' | 'full_dashboard' | 'recommendation_panel' | 'alert_center' | 'performance_overlay';
export type UserRole = 'creator' | 'admin' | 'viewer' | 'manager' }
}
}
export interface WidgetConfiguration { widgets: WidgetType[];
    layout: WidgetLayout;
    refreshInterval: number;
    compactMode: boolean;
    theme: 'light' | 'dark' | 'auto';
    customizations: WidgetCustomization[];

export type WidgetType = 'conversion_summary' | 'performance_chart' | 'optimization_recommendations' | 'anomaly_alerts' | 'attribution_insights' | 'predictive_forecast' | 'template_performance' | 'creator_dashboard' }
}
}
export interface WidgetLayout { columns: number;
    rows: number;
    responsive: boolean;
    spacing: number;
    widgetSizes: Record<WidgetType, WidgetSize> }
}
}
export interface WidgetSize { width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    resizable: boolean }
}
}
export interface WidgetCustomization { widgetType: WidgetType;
    title?: string;
    showHeader: boolean;
    showFilters: boolean;
    defaultFilters: Record<string, any>;
    colorScheme?: string;
    displayMode: 'compact' | 'standard' | 'detailed' }
}
}
export interface MarketplaceIntegrationData { funnelSummary: FunnelSummaryData;
    templateInsights: TemplateInsightData[];
    creatorOptimizations: CreatorOptimizationData[];
    marketplaceMetrics: MarketplaceMetricData;
    recommendedActions: RecommendedAction[];
    performanceAlerts: PerformanceAlert[];
    integrationHealth: IntegrationHealthData }
}
}
export interface FunnelSummaryData { overallConversionRate: number;
    totalConversions: number;
    totalRevenue: number;
    averageOrderValue: number;
    topPerformingSteps: StepPerformanceData[];
    bottomleneckSteps: StepPerformanceData[];
    trendDirection: 'improving' | 'declining' | 'stable';
    lastUpdated: number }
}
}
export interface StepPerformanceData { stepId: string;
    stepName: string;
    conversionRate: number;
    dropOffRate: number;
    averageTimeSpent: number;
    performanceRank: number;
    optimizationPotential: number }
}
}
export interface TemplateInsightData { templateId: string;
    templateName: string;
    creatorId: string;
    conversionMetrics: TemplateConversionMetrics;
    performanceInsights: TemplatePerformanceInsight[];
    optimizationOpportunities: TemplateOptimizationOpportunity[];
    competitivePosition: TemplateCompetitivePosition }
}
}
export interface TemplateConversionMetrics { viewToDownloadRate: number;
    downloadToUseRate: number;
    useToSubscribeRate: number;
    overallConversionRate: number;
    revenuePerView: number;
    userRetentionRate: number }
}
}
export interface TemplatePerformanceInsight { insightType: TemplateInsightType;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
    actionable: boolean;
    recommendations: TemplateRecommendation[];

export type TemplateInsightType = 'conversion_opportunity' | 'pricing_optimization' | 'content_improvement' | 'marketing_efficiency' | 'user_experience' | 'competitive_advantage' }
}
}
export interface TemplateRecommendation { action: string;
    expectedImpact: number;
    effort: 'low' | 'medium' | 'high';
    priority: 'critical' | 'high' | 'medium' | 'low';
    timeline: string;
    resources: string[] }
}
}
export interface TemplateOptimizationOpportunity { opportunity: string;
    currentPerformance: number;
    potentialPerformance: number;
    improvementPercentage: number;
    implementationSteps: OptimizationStep[];
    successProbability: number }
}
}
export interface OptimizationStep { step: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    timeline: number;
    dependencies: string[] }
}
}
export interface TemplateCompetitivePosition { categoryRank: number;
    totalInCategory: number;
    competitiveAdvantages: string[];
    competitiveWeaknesses: string[];
    marketShare: number;
    trendDirection: 'gaining' | 'losing' | 'stable' }
}
}
export interface CreatorOptimizationData { creatorId: string;
    creatorName: string;
    portfolioMetrics: CreatorPortfolioMetrics;
    optimizationRecommendations: CreatorOptimizationRecommendation[];
    performanceTrends: CreatorPerformanceTrend[];
    growthOpportunities: CreatorGrowthOpportunity[] }
}
}
export interface CreatorPortfolioMetrics { totalTemplates: number;
    totalRevenue: number;
    averageConversionRate: number;
    averageRating: number;
    topPerformingCategory: string;
    portfolioDiversification: number;
    marketPenetration: number }
}
}
export interface CreatorOptimizationRecommendation { recommendationType: CreatorRecommendationType;
    title: string;
    description: string;
    expectedImpact: CreatorImpactProjection;
    actionItems: CreatorActionItem[];
    priority: 'critical' | 'high' | 'medium' | 'low';

export type CreatorRecommendationType = 'template_optimization' | 'pricing_strategy' | 'portfolio_expansion' | 'marketing_improvement' | 'user_engagement' | 'quality_enhancement' }
}
}
export interface CreatorImpactProjection { revenueIncrease: number;
    conversionImprovement: number;
    userEngagementBoost: number;
    timeToImpact: number;
    confidenceLevel: number }
}
}
export interface CreatorActionItem { action: string;
    instructions: string;
    effort: 'low' | 'medium' | 'high';
    timeline: number;
    tools: string[];
    success_criteria: string[] }
}
}
export interface CreatorPerformanceTrend { metric: string;
    currentValue: number;
    trend: 'improving' | 'declining' | 'stable';
    changePercentage: number;
    projectedValue: number;
    factors: TrendFactor[] }
}
}
export interface TrendFactor { factor: string;
    impact: number;
    controllable: boolean;
    recommendation: string }
}
}
export interface CreatorGrowthOpportunity { opportunity: string;
    description: string;
    marketSize: number;
    competitionLevel: 'low' | 'medium' | 'high';
    skillRequirements: string[];
    investmentRequired: number;
    expectedROI: number }
}
}
export interface MarketplaceMetricData { totalConversions: number;
    totalRevenue: number;
    averageConversionRate: number;
    topPerformingCategories: CategoryPerformance[];
    userAcquisitionMetrics: UserAcquisitionMetrics;
    retentionMetrics: RetentionMetrics;
    healthScore: MarketplaceHealthScore }
}
}
export interface CategoryPerformance { category: string;
    conversionRate: number;
    revenue: number;
    templateCount: number;
    averageRating: number;
    growthRate: number }
}
}
export interface UserAcquisitionMetrics { newUsersLastPeriod: number;
    acquisitionCost: number;
    acquisitionChannels: AcquisitionChannel[];
    conversionByChannel: ChannelConversion[] }
}
}
export interface AcquisitionChannel { channel: string;
    users: number;
    cost: number;
    conversionRate: number;
    quality: number }
}
}
export interface ChannelConversion { channel: string;
    conversionRate: number;
    averageValue: number;
    retentionRate: number }
}
}
export interface RetentionMetrics { overallRetentionRate: number;
    cohortRetention: CohortRetentionData[];
    churnRate: number;
    reactivationRate: number }
}
}
export interface CohortRetentionData { cohort: string;
    retentionRate: number;
    averageLifetime: number;
    totalValue: number }
}
}
export interface MarketplaceHealthScore { overallScore: number;
    components: HealthScoreComponent[];
    trend: 'improving' | 'declining' | 'stable';
    criticalIssues: string[] }
}
}
export interface HealthScoreComponent { component: string;
    score: number;
    weight: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' }
}
}
export interface RecommendedAction { actionId: string;
    type: ActionType;
    title: string;
    description: string;
    targetAudience: UserRole[];
    priority: 'critical' | 'high' | 'medium' | 'low';
    expectedImpact: ActionImpact;
    implementation: ActionImplementation;
    progress: ActionProgress;

export type ActionType = 'optimization' | 'alert_response' | 'strategic_improvement' | 'operational_fix' | 'growth_initiative' }
}
}
export interface ActionImpact { revenueImpact: number;
    conversionImpact: number;
    userImpact: number;
    timeToImpact: number;
    confidenceLevel: number }
}
}
export interface ActionImplementation { steps: ImplementationStep[];
    resources: string[];
    timeline: number;
    cost: number;
    riskLevel: 'low' | 'medium' | 'high' }
}
}
export interface ImplementationStep { step: string;
    description: string;
    owner: string;
    duration: number;
    dependencies: string[] }
}
}
export interface ActionProgress { status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
    completionPercentage: number;
    startDate?: number;
    completedSteps: string[];
    blockers: string[] }
}
}
export interface PerformanceAlert { alertId: string;
    type: AlertType;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedEntities: AffectedEntity[];
    detectedAt: number;
    resolvedAt?: number;
    resolution: AlertResolution;

export type AlertType = 'conversion_drop' | 'revenue_anomaly' | 'template_underperforming' | 'creator_churn_risk' | 'system_issue' | 'market_opportunity' }
}
}
export interface AffectedEntity { entityType: 'template' | 'creator' | 'category' | 'marketplace';
    entityId: string;
    entityName: string;
    impactLevel: number }
}
}
export interface AlertResolution { status: 'open' | 'investigating' | 'resolved' | 'false_positive';
    assignedTo?: string;
    resolutionSteps: ResolutionStep[];
    resolutionTime?: number }
}
}
export interface ResolutionStep { step: string;
    completedAt?: number;
    completedBy?: string;
    notes?: string }
}
}
export interface IntegrationHealthData { connectionStatus: 'connected' | 'degraded' | 'disconnected';
    lastSync: number;
    syncFrequency: number;
    dataQuality: number;
    errors: IntegrationError[];
    performance: IntegrationPerformance }
}
}
export interface IntegrationError { errorId: string;
    errorType: string;
    message: string;
    timestamp: number;
    resolved: boolean;
    impact: 'low' | 'medium' | 'high' }
}
}
export interface IntegrationPerformance { averageResponseTime: number;
    throughput: number;
    errorRate: number;
    availability: number }
}
}
export interface OptimizationAction { actionType: 'implement_recommendation' | 'dismiss_alert' | 'export_data' | 'configure_widget';
    details: Record<string, any>;
    userId: string;
    timestamp: number }
}
}
export interface InsightInteraction { interactionType: 'view' | 'click' | 'share' | 'bookmark';
    insightId: string;
    userId: string;
    timestamp: number;
    context: Record<string, any> }
}
}
export interface MarketplaceIntegrationExportData {
    funnelSummary: FunnelSummaryData;
    templateInsights: TemplateInsightData[];
    creatorOptimizations: CreatorOptimizationData[];
    recommendedActions: RecommendedAction[];
    performanceAlerts: PerformanceAlert[];
    exportTimestamp: number;
    userContext: MarketplaceContext;

export declare const MarketplaceFunnelIntegration: React.FC<MarketplaceFunnelIntegrationProps>;
//# sourceMappingURL=MarketplaceFunnelIntegration.d.ts.map
}
}