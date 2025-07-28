/**
 * Epic 16 Marketplace Trending Comments System - Data Types
 *
 * Comprehensive comment trending functionality for templates, graphs, and marketplace content.
 * Supports comment ranking, engagement tracking, and trend analysis.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import { z } from 'zod';
export type CommentableResourceType = 'template' | 'graph' | 'collection' | 'case_study' | 'tutorial' | 'marketplace_item';
export type CommentSortOrder = 'trending' | 'recent' | 'top_rated' | 'controversial' | 'oldest';
export type CommentEngagementType = 'like' | 'dislike' | 'reply' | 'share' | 'helpful' | 'report';
export type TrendingPeriod = '1h' | '6h' | '24h' | '7d' | '30d' | 'all_time';
export declare const CommentEngagementSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CommentEngagement = z.infer<typeof CommentEngagementSchema>;
export declare const CommentScoreSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CommentScore = z.infer<typeof CommentScoreSchema>;
export declare const TrendingCommentSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type TrendingComment = z.infer<typeof TrendingCommentSchema>;
export declare const TrendingAlgorithmConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type TrendingAlgorithmConfig = z.infer<typeof TrendingAlgorithmConfigSchema>;
export declare const TrendingResultsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type TrendingResults = z.infer<typeof TrendingResultsSchema>;
export declare const CommentAnalyticsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CommentAnalytics = z.infer<typeof CommentAnalyticsSchema>;
export declare const GetTrendingCommentsRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const TrendingCommentsResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type GetTrendingCommentsRequest = z.infer<typeof GetTrendingCommentsRequestSchema>;
export type TrendingCommentsResponse = z.infer<typeof TrendingCommentsResponseSchema>;
export declare const validateGetTrendingCommentsRequest: (data: unknown) => GetTrendingCommentsRequest;
export declare const validateTrendingComment: (data: unknown) => TrendingComment;
export declare const validateCommentScore: (data: unknown) => CommentScore;
export interface TrendingSystemConfig {
    enabledAlgorithms: string;
    defaultAlgorithm: string;
    cacheSettings: {
        trendingCacheTTL: number;
        scoreCacheTTL: number;
        analyticsCacheTTL: number;
    };
    moderationSettings: {
        autoModerationEnabled: boolean;
        humanReviewThreshold: number;
        quarantineThreshold: number;
    };
    performanceSettings: {
        maxCommentsToAnalyze: number;
        batchSize: number;
        maxConcurrentCalculations: number;
    };
}
export { CommentEngagementSchema, CommentScoreSchema, TrendingCommentSchema, TrendingAlgorithmConfigSchema, TrendingResultsSchema, CommentAnalyticsSchema, GetTrendingCommentsRequestSchema, TrendingCommentsResponseSchema };
//# sourceMappingURL=TrendingCommentsTypes.d.ts.map