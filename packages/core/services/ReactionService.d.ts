/**
 * Epic 16 Reaction Service
 * Task: E16-1753114247007-BB2261 - Add reaction system
 *
 * Service for managing emoji reactions on marketplace content. Handles reaction
 * storage, aggregation, analytics, and real-time updates.
 */
import { ReactionData, ReactionSummary } from '../components/Reactions/ReactionButton';
export interface ReactionAnalytics {
    contentId: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    totalReactions: number;
    uniqueReactors: number;
    reactionBreakdown: Record<string, {
        count: number;
        percentage: number;
        trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    sentimentAnalysis: {
        overallScore: number;
        positivePercentage: number;
        neutralPercentage: number;
        negativePercentage: number;
        emotionalDistribution: Record<string, number>;
    };
    engagementMetrics: {
        reactionRate: number;
        velocityScore: number;
        viralityIndicator: number;
        retentionScore: number;
    };
    temporalPatterns: {
        hourlyDistribution: number[];
        dailyDistribution: number[];
        peakActivityHours: number[];
        seasonalTrends?: Array<{
            period: string;
            count: number;
            change: number;
        }>;
    };
    comparativeMetrics: {
        vsAverageContent: number;
        categoryRanking: number;
        similarContentComparison: Array<{
            contentId: string;
            similarity: number;
            reactionPattern: string[];
        }>;
    };
}
export interface ReactionBehaviorInsights {
    userId: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    totalReactions: number;
    favoriteReactions: string[];
    reactionFrequency: Record<string, number>;
    contentAffinity: Array<{
        contentType: string;
        reactionCount: number;
        preferredReactions: string[];
    }>;
    behaviorPatterns: {
        reactsQuickly: boolean;
        consideredReactor: boolean;
        positivityScore: number;
        influencer: boolean;
    };
    engagementTiming: {
        mostActiveHours: number[];
        averageResponseTime: number;
        burstyBehavior: boolean;
    };
}
export interface ReactionTrend {
    reactionType: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    trendData: Array<{
        timestamp: Date;
        count: number;
        cumulativeCount: number;
    }>;
    growthRate: number;
    momentum: 'accelerating' | 'steady' | 'declining' | 'stagnant';
    peakPeriods: Array<{
        start: Date;
        end: Date;
        intensity: number;
    }>;
    seasonality: {
        hasPattern: boolean;
        cycleLength?: number;
        amplitude?: number;
    };
}
export interface BulkReactionOperation {
    operations: Array<{
        contentId: string;
        userId: string;
        action: 'add' | 'remove' | 'change';
        reactionType: string;
        previousReaction?: string;
    }>;
    batchId: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}
export interface ReactionModerationAction {
    actionType: 'hide' | 'remove' | 'flag' | 'approve' | 'escalate';
    reactionIds: string[];
    moderatorId: string;
    reason: string;
    metadata?: Record<string, unknown>;
}
export interface ReactionConfig {
    enabledReactions: string[];
    maxReactionsPerUser: number;
    maxReactionsPerContent?: number;
    enableAnonymousReactions: boolean;
    enableReactionModeration: boolean;
    reactionCooldownMs: number;
    enableRealTimeUpdates: boolean;
    analyticsRetentionDays: number;
    spamDetection: {
        enabled: boolean;
        maxReactionsPerMinute: number;
        suspiciousPatternThreshold: number;
    };
    contentTypeSettings: Record<string, {
        enabledReactions: string[];
        maxReactions?: number;
        requireAuth?: boolean;
    }>;
}
/**
 * Reaction Service
 *
 * Comprehensive service for managing emoji reactions across all marketplace content.
 * Provides reaction tracking, analytics, moderation, and real-time capabilities.
 */
export declare class ReactionService {
    private baseUrl;
    private config;
    private reactions;
    private summaries;
    private realtimeSubscriptions;
    constructor(baseUrl?: string, config?: Partial<ReactionConfig>);
    /**
     * Add or update a reaction
     */
    addReaction(reactionData: Omit<ReactionData, 'reactionId' | 'timestamp'>): Promise<{
        success: boolean;
        reactionId?: string;
        previousReaction?: string;
        summary: ReactionSummary;
        message: string;
    }>;
    /**
     * Remove a reaction
     */
    removeReaction(reactionId: string, userId: string): Promise<{
        success: boolean;
        summary: ReactionSummary;
        message: string;
    }>;
    /**
     * Get reaction summary for content
     */
    getReactionSummary(contentId: string, userId?: string): Promise<ReactionSummary>;
    /**
     * Get comprehensive reaction analytics
     */
    getReactionAnalytics(contentId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<ReactionAnalytics>;
    /**
     * Get user behavior insights
     */
    getUserBehaviorInsights(userId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<ReactionBehaviorInsights>;
    /**
     * Execute bulk reaction operations
     */
    executeBulkOperations(operations: BulkReactionOperation): Promise<{
        successful: number;
        failed: number;
        results: Array<{
            contentId: string;
            success: boolean;
            error?: string;
        }>;
    }>;
    /**
     * Moderate reactions
     */
    moderateReactions(action: ReactionModerationAction): Promise<{
        processed: number;
        errors: string[];
    }>;
    private validateReaction;
    private checkSpamDetection;
    private getUserReaction;
    private updateReactionSummary;
    private broadcastReactionUpdate;
    private logAnalyticsEvent;
    private getReactionEmoji;
    private calculateSentimentScore;
    private calculateEngagementLevel;
    private createEmptySummary;
    private calculateReactionBreakdown;
    private calculateSentimentAnalysis;
    private getReactionSentiment;
    private calculateEngagementMetrics;
    private calculateTemporalPatterns;
    private calculateComparativeMetrics;
    private calculateFavoriteReactions;
    private calculateReactionFrequency;
    private calculateContentAffinity;
    private analyzeBehaviorPatterns;
    private analyzeEngagementTiming;
}
export default ReactionService;
//# sourceMappingURL=ReactionService.d.ts.map