/**
 * Epic 16 Marketplace Trending Comments Service
 *
 * Core service for calculating comment trends, engagement scoring, and analytics.
 * Implements sophisticated trending algorithms with real-time score calculation.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import { TrendingComment, CommentScore, CommentEngagement, CommentAnalytics, TrendingAlgorithmConfig, GetTrendingCommentsRequest, TrendingCommentsResponse, CommentEngagementType } from '../types/TrendingCommentsTypes';
export declare class TrendingCommentsService {
    private baseUrl;
    private algorithms;
    private defaultAlgorithm;
    private cacheEnabled;
    private scoreCache;
    private trendingCache;
    constructor(config: {)
        baseUrl: string;
        algorithms?: TrendingAlgorithmConfig[];
        defaultAlgorithm?: string;
        cacheEnabled?: boolean;
        cacheTTL?: number;
    });
    /**
     * Get trending comments for a resource
     */
    getTrendingComments(request: GetTrendingCommentsRequest): Promise<TrendingCommentsResponse>;
    /**
     * Calculate trending score for a single comment
     */
    calculateCommentScore(comment: TrendingComment, engagements: CommentEngagement[], algorithmId?: string): Promise<CommentScore>;
    /**
     * Track comment engagement event
     */
    trackEngagement(commentId: string, userId: string, engagementType: CommentEngagementType, contextData?: Record<string, unknown>): Promise<CommentEngagement>;
    /**
     * Get comment analytics for a resource
     */
    getCommentAnalytics(resourceId: string, timeRange: {)
        start: Date;
        end: Date;
    }): Promise<CommentAnalytics>;
    /**
     * Infer resource type from resource ID context
     */
    private inferResourceType;
    /**
     * Fallback analytics data when service fails
     */
    private getFallbackAnalytics;
    /**
     * Update trending algorithm configuration
     */
    updateAlgorithm(config: TrendingAlgorithmConfig): void;
    /**
     * Get available algorithms
     */
    getAlgorithms(): TrendingAlgorithmConfig[];
    private calculateTrendingResults;
    private calculateEngagementMetrics;
    private calculateEngagementScore;
    private calculateRecencyScore;
    private calculateQualityScore;
    private calculateControversyScore;
    private calculateViralityScore;
    private calculateHelpfulnessScore;
    private calculateAuthorityScore;
    private calculateTrendingScore;
    private calculateScoreTrends;
    private findPeakEngagementHour;
    private determineVelocityTrend;
    private sortComments;
    private generateSummary;
    private assessConversationHealth;
    private calculateSentimentDistribution;
    private extractTopHashtags;
    private identifyEmergingTopics;
    private getEngagementWeight;
    private generateCacheKey;
    private getCachedTrendingResults;
    private cacheTrendingResults;
    private getCachedScore;
    private cacheScore;
    private invalidateCommentCaches;
    private clearAllCaches;
    private getDefaultAlgorithmConfig;
    private generateMockComments;
    private generateMockCommentContent;
    private generateMockHashtags;
    private generateMockEngagements;

//# sourceMappingURL=TrendingCommentsService.d.ts.map