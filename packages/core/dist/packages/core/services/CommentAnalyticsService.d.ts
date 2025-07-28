export interface CommentAnalyticsConfig {
    databaseUrl?: string;
    cacheTTLSeconds?: number;
    enableRealTimeUpdates?: boolean;
    maxAnalyticsPeriodDays?: number;
}
export interface EngagementBreakdown {
    [key: string]: number;
}
export interface TimeSeriesData {
    timestamp: string;
    value: number;
}
export interface CommentMetrics {
    totalComments: number;
    totalReplies: number;
    totalThreads: number;
    uniqueCommenters: number;
    averageRating: number;
    engagementRate: number;
}
export interface SentimentAnalysis {
    positive: number;
    neutral: number;
    negative: number;
    averageScore: number;
    confidence: number;
}
export interface TopicTrend {
    topic: string;
    mentionCount: number;
    sentimentAverage: number;
    growthRate: number;
    peakHour?: number;
}
export interface UserEngagementData {
    userId: string;
    commentsPosted: number;
    likesReceived: number;
    influenceScore: number;
    reputationScore: number;
}
export declare class CommentAnalyticsService {
    private db;
    private config;
    private cache;
    constructor(config?: CommentAnalyticsConfig);
}
//# sourceMappingURL=CommentAnalyticsService.d.ts.map