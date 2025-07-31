/**
 * Content Quality Metrics Service - Epic 17.5.6
 *
 * Comprehensive content quality assessment system for marketplace templates.
 * Provides quality scoring, effectiveness analysis, and content optimization insights.
 *
 * Task: E17-1753114397429-A96C99 - Create content quality metrics
 * Epic: 17 - Backstage Admin Controls
 */
import { Database } from '../database';
import { AnalyticsService } from './analytics.service';
import { QualityMetricsService } from '../services/QualityMetricsService';
import { TimeRange } from './analytics.types';
}
}
export interface ContentQualityMetrics {
    templateId: string;
    assessmentDate: Date;
    overallQualityScore: number;
    qualityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    qualityStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    effectiveness: EffectivenessMetrics;
    usability: UsabilityMetrics;
    engagement: EngagementMetrics;
    reliability: ReliabilityMetrics;
    maintainability: MaintainabilityMetrics;
    marketFit: MarketFitMetrics;
    benchmarks: QualityBenchmarks;
    trends: QualityTrends;
    recommendations: QualityRecommendation[];
    assessmentVersion: string;
    dataSourcesUsed: string[];
    confidenceLevel: number;
}
}
}
}
}
export interface EffectivenessMetrics {
    score: number;
    successRate: number;
    taskCompletionRate: number;
    outputQuality: {
        averageRating: number;
        ratingDistribution: RatingDistribution;
        satisfactionScore: number;
        qualityConsistency: number;
}
}
    };
    problemSolving: {
        resolutionRate: number;
        timeToResolution: number;
        complexityHandling: number;
    };
    valueDelivery: {
        userValueScore: number;
        businessImpact: number;
        efficiencyGains: number;
    };
}
}
}
export interface UsabilityMetrics {
    score: number;
    easeOfUse: {
        learningCurve: number;
        userFriendliness: number;
        errorRate: number;
        recoverability: number;
}
}
    };
    clarity: {
        instructionClarity: number;
        outputClarity: number;
        documentationQuality: number;
    };
    accessibility: {
        deviceCompatibility: number;
        browserCompatibility: number;
        languageSupport: number;
        disabilityAccessibility: number;
    };
    userExperience: {
        interfaceQuality: number;
        responseTime: number;
        visualDesign: number;
    };
}
}
}
export interface EngagementMetrics {
    score: number;
    usage: {
        adoptionRate: number;
        retentionRate: number;
        frequencyOfUse: number;
        sessionDuration: number;
}
}
    };
    interaction: {
        likeRate: number;
        shareRate: number;
        commentRate: number;
        recommendationRate: number;
    };
    virality: {
        viralCoefficient: number;
        growthRate: number;
        wordOfMouthScore: number;
    };
    community: {
        discussionVolume: number;
        supportQuality: number;
        contributionRate: number;
    };
}
}
}
export interface ReliabilityMetrics {
    score: number;
    stability: {
        errorRate: number;
        crashRate: number;
        uptime: number;
        consistencyScore: number;
}
}
    };
    performance: {
        responseTime: number;
        throughput: number;
        resourceEfficiency: number;
        scalability: number;
    };
    robustness: {
        edgeCaseHandling: number;
        errorHandling: number;
        inputValidation: number;
        faultTolerance: number;
    };
    security: {
        vulnerabilityScore: number;
        dataProtection: number;
        accessControl: number;
        complianceScore: number;
    };
}
}
}
export interface MaintainabilityMetrics {
    score: number;
    updateFrequency: {
        releaseFrequency: number;
        bugFixFrequency: number;
        featureUpdateRate: number;
        maintenanceQuality: number;
}
}
    };
    codeQuality: {
        codeStructure: number;
        documentation: number;
        testCoverage: number;
        technicalDebt: number;
    };
    evolution: {
        adaptability: number;
        extensibility: number;
        backwardsCompatibility: number;
        migrationSupport: number;
    };
    support: {
        issueResolution: number;
        userSupport: number;
        documentationMaintenance: number;
        communitySupport: number;
    };
}
}
}
export interface MarketFitMetrics {
    score: number;
    demand: {
        popularityScore: number;
        searchVolume: number;
        competitorComparison: number;
        marketPenetration: number;
}
}
    };
    satisfaction: {
        npsScore: number;
        customerSatisfaction: number;
        repeatUsage: number;
        loyaltyScore: number;
    };
    business: {
        revenueGeneration: number;
        costEffectiveness: number;
        roi: number;
        marketValue: number;
    };
    strategic: {
        differentiationScore: number;
        competitiveAdvantage: number;
        strategicAlignment: number;
        futureViability: number;
    };
}
}
}
export interface QualityBenchmarks {
    industryAverage: number;
    categoryAverage: number;
    topPerformers: number;
    bottomPerformers: number;
    percentileRank: number;
    competitorComparison: CompetitorBenchmark[];
}
}
}
}
}
export interface CompetitorBenchmark {
    competitorId: string;
    competitorName: string;
    qualityScore: number;
    strengthAreas: string[];
    weaknessAreas: string[];
    marketPosition: number;
}
}
}
}
}
export interface QualityTrends {
    timeframe: string;
    overallTrend: 'improving' | 'stable' | 'declining';
    trendVelocity: number;
    historical: HistoricalQualityData[];
    projections: QualityProjection[];
    seasonality: SeasonalityPattern[];
}
}
}
}
}
export interface HistoricalQualityData {
    date: Date;
    overallScore: number;
    dimensionScores: {
        effectiveness: number;
        usability: number;
        engagement: number;
        reliability: number;
        maintainability: number;
        marketFit: number;
}
}
    };
    events: QualityEvent[];
}
}
}
export interface QualityProjection {
    date: Date;
    projectedScore: number;
    confidence: number;
    factors: string[];
}
}
}
}
}
export interface SeasonalityPattern {
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    pattern: number[];
    impact: number;
}
}
}
}
}
export interface QualityEvent {
    date: Date;
    type: 'update' | 'incident' | 'milestone' | 'external';
    description: string;
    impact: number;
}
}
}
}
}
export interface QualityRecommendation {
    id: string;
    category: 'effectiveness' | 'usability' | 'engagement' | 'reliability' | 'maintainability' | 'marketFit';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: {
        currentScore: number;
        projectedImprovement: number;
        confidenceLevel: number;
        timeToImpact: string;
}
}
    };
    implementation: {
        effort: 'low' | 'medium' | 'high';
        complexity: 'simple' | 'moderate' | 'complex';
        resources: string[];
        timeline: string;
        prerequisites: string[];
    };
    roi: {
        investmentRequired: number;
        expectedReturn: number;
        paybackPeriod: string;
        riskLevel: 'low' | 'medium' | 'high';
    };
    evidence: {
        dataPoints: string[];
        benchmarkComparison: string;
        userFeedback: string[];
        analyticsInsights: string[];
    };
}
}
}
export interface RatingDistribution {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
}
}
}
}
}
export interface ContentQualityConfig {
    weightings: {
        effectiveness: number;
        usability: number;
        engagement: number;
        reliability: number;
        maintainability: number;
        marketFit: number;
}
}
    };
    thresholds: {
        excellent: number;
        good: number;
        fair: number;
        poor: number;
        critical: number;
    };
    benchmarkSources: string[];
    updateFrequency: string;
    minimumDataPoints: number;
}
export declare class ContentQualityMetricsService {
    private db;
    private analyticsService;
    private qualityService;
    private config;
    constructor(database: Database, analyticsService: AnalyticsService, qualityService: QualityMetricsService, config?: ContentQualityConfig);
    /**
     * Assess comprehensive content quality for a template
     */
    assessContentQuality(templateId: string, timeRange?: TimeRange): Promise<ContentQualityMetrics>;
    /**
     * Get content quality dashboard for creator
     */
    getCreatorQualityDashboard(creatorId: string, timeRange?: TimeRange): Promise<CreatorQualityDashboard>;
    /**
     * Generate marketplace-wide quality insights
     */
    getMarketplaceQualityInsights(timeRange?: TimeRange): Promise<MarketplaceQualityInsights>;
    private assessEffectiveness;
    private assessUsability;
    private assessEngagement;
    private assessReliability;
    private assessMaintainability;
    private assessMarketFit;
    private calculateOverallScore;
    private scoreToGrade;
    private scoreToStatus;
    private getDefaultConfig;
    private calculateTaskCompletionRate;
    private calculateRatingDistribution;
    private calculateSatisfactionScore;
    private calculateQualityConsistency;
    private calculateResolutionRate;
    private calculateTimeToResolution;
    private assessComplexityHandling;
    private calculateUserValueScore;
    private calculateBusinessImpact;
    private calculateEfficiencyGains;
    private storeQualityAssessment;
    private getLatestQualityMetrics;
    private calculateConfidenceLevel;
    [key: string]: any;
}
}
}
export interface CreatorQualityDashboard {
    creatorId: string;
    assessmentDate: Date;
    timeRange: TimeRange;
    overview: CreatorQualityOverview;
    templateCount: number;
    categoryPerformance: CategoryPerformance[];
    trends: CreatorQualityTrends;
    benchmarks: CreatorQualityBenchmarks;
    recommendations: QualityRecommendation[];
    topPerformingTemplates: TopPerformingTemplate[];
    improvementOpportunities: ImprovementOpportunity[];
}
}
}
}
}
export interface CreatorQualityOverview {
    averageQualityScore: number;
    qualityGrade: string;
    templatesAboveAverage: number;
    totalQualityPoints: number;
    qualityRanking: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
}
}
}
}
}
export interface CategoryPerformance {
    category: string;
    templateCount: number;
    averageScore: number;
    bestTemplate: string;
    worstTemplate: string;
    categoryRanking: number;
}
}
}
}
}
export interface CreatorQualityTrends {
    monthlyScores: number[];
    dimensionTrends: {
        [key: string]: number[];
}
}
    };
    milestones: QualityEvent[];
    projectedScore: number;
}
}
}
export interface CreatorQualityBenchmarks {
    vsMarketplace: number;
    vsCategory: number;
    vsTopPerformers: number;
    percentileRank: number;
}
}
}
}
}
export interface TopPerformingTemplate {
    templateId: string;
    title: string;
    qualityScore: number;
    standoutDimensions: string[];
}
}
}
}
}
export interface ImprovementOpportunity {
    area: string;
    currentScore: number;
    potentialImprovement: number;
    effort: string;
    impactLevel: string;
}
}
}
}
}
export interface MarketplaceQualityInsights {
    assessmentDate: Date;
    timeRange: TimeRange;
    overallMetrics: MarketplaceOverallMetrics;
    categoryBreakdown: CategoryQualityBreakdown[];
    qualityDistribution: QualityDistribution;
    trends: MarketplaceQualityTrends;
    topPerformers: TopPerformer[];
    qualityFactors: QualityFactor[];
    insights: MarketplaceInsight[];
    recommendations: MarketplaceRecommendation[];
}
}
}
}
}
export interface MarketplaceOverallMetrics {
    averageQualityScore: number;
    totalTemplatesAssessed: number;
    qualityImprovement: number;
    topCategoryScore: number;
    qualityVariance: number;
}
}
}
}
}
export interface CategoryQualityBreakdown {
    category: string;
    averageScore: number;
    templateCount: number;
    topPerformer: string;
    improvement: number;
}
}
}
}
}
export interface QualityDistribution {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    critical: number;
}
}
}
}
}
export interface MarketplaceQualityTrends {
    overallTrend: 'improving' | 'stable' | 'declining';
    monthlyAverages: number[];
    categoryTrends: {
        [key: string]: number[];
}
}
    };
    qualityFactorTrends: {
        [key: string]: number[];
    };
}
}
}
export interface TopPerformer {
    templateId: string;
    creatorId: string;
    qualityScore: number;
    category: string;
    standoutFeatures: string[];
}
}
}
}
}
export interface QualityFactor {
    factor: string;
    importance: number;
    currentState: number;
    trend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
}
}
}
}
}
export interface MarketplaceInsight {
    type: string;
    title: string;
    description: string;
    impact: number;
    confidence: number;
    actionable: boolean;
}
}
}
}
}
export interface MarketplaceRecommendation {
    category: string;
    title: string;
    description: string;
    priority: string;
    effort: string;
    expectedImpact: string;
    timeframe: string;
}
}
}
//# sourceMappingURL=ContentQualityMetricsService.d.ts.map