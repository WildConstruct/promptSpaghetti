/**
 * Epic 16 Comment Analytics Service
 * Task: E16-1753114247014-D03BBE - Create comment analytics
 *
 * Real database-backed analytics service for comment engagement, sentiment,
 * and trending analysis. Replaces mock analytics in TrendingCommentsService.
 */
import { CommentAnalytics, CommentEngagementType, CommentableResourceType } from '../types/TrendingCommentsTypes';

export interface CommentAnalyticsConfig {
    databaseUrl?: string;
    cacheTTLSeconds?: number;
    enableRealTimeUpdates?: boolean;
    maxAnalyticsPeriodDays?: number;


export interface EngagementBreakdown {
    [key: string]: number;


export interface TimeSeriesData {
    timestamp: string;
    value: number;


export interface CommentMetrics {
    totalComments: number;
    totalReplies: number;
    totalThreads: number;
    uniqueCommenters: number;
    averageRating: number;
    engagementRate: number;


export interface SentimentAnalysis {
    positive: number;
    neutral: number;
    negative: number;
    averageScore: number;
    confidence: number;


export interface TopicTrend {
    topic: string;
    mentionCount: number;
    sentimentAverage: number;
    growthRate: number;
    peakHour?: number;


export interface UserEngagementData {
    userId: string;
    commentsPosted: number;
    likesReceived: number;
    influenceScore: number;
    reputationScore: number;

export declare class CommentAnalyticsService {
    private db;
    private config;
    private cache;
    constructor(config?: CommentAnalyticsConfig);
    /**
     * Get comprehensive comment analytics for a resource
     */
    getCommentAnalytics(resourceId: string, resourceType: CommentableResourceType, options?: {)
        startDate?: Date;
        endDate?: Date;
        includeRealTime?: boolean;
        includeSentiment?: boolean;
        includeTopics?: boolean;
    }): Promise<CommentAnalytics>;
    /**
     * Record a comment engagement event
     */
    recordEngagementEvent(commentId: string, userId: string | null, sessionId: string, engagementType: CommentEngagementType, metadata?: Record<string, any>): Promise<void>;
    /**
     * Update daily analytics for a resource
     */
    updateDailyAnalytics(resourceId: string, resourceType: CommentableResourceType, date?: Date): Promise<void>;
    private getCoreMetrics;
    private getEngagementBreakdowns;
    private getTimeSeriesData;
    private getSentimentAnalysis;
    private getTopicTrends;
    private getTotalEngagements;
    private calculateGrowthRate;
    private calculateTrendingScore;
    private calculateEngagementVelocity;
    private getPeakEngagementTime;
    private getAverageCommentLength;
    private getAverageResponseTime;
    private getQualityScore;
    private getLanguageDistribution;
    private getUserTypeBreakdown;
    private getTopContributors;
    private getPreviousPeriodComparison;
    private getBenchmarkComparison;
    private getSimilarResourcesComparison;
    private getCachedData;
    private setCachedData;
    private invalidateAnalyticsCache;
    private invalidateResourceCache;
    /**
     * Clean up resources
     */
    close(): Promise<void>;

export default CommentAnalyticsService;
//# sourceMappingURL=CommentAnalyticsService.d.ts.map