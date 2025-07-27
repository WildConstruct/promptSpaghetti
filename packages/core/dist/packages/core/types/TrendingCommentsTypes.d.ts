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
export declare const CommentEngagementSchema: z.ZodObject<{
    engagementId: z.ZodString;
    commentId: z.ZodString;
    userId: z.ZodString;
    engagementType: z.ZodEnum<["like", "dislike", "reply", "share", "helpful", "report"]>;
    timestamp: z.ZodDate;
    weight: z.ZodDefault<z.ZodNumber>;
    contextData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    weight?: number;
    timestamp?: Date;
    userId?: string;
    contextData?: Record<string, unknown>;
    engagementId?: string;
    commentId?: string;
    engagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
}, {
    weight?: number;
    timestamp?: Date;
    userId?: string;
    contextData?: Record<string, unknown>;
    engagementId?: string;
    commentId?: string;
    engagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
}>;
export type CommentEngagement = z.infer<typeof CommentEngagementSchema>;
export declare const CommentScoreSchema: z.ZodObject<{
    commentId: z.ZodString;
    calculatedAt: z.ZodDate;
    scores: z.ZodObject<{
        trendingScore: z.ZodNumber;
        engagementScore: z.ZodNumber;
        recencyScore: z.ZodNumber;
        qualityScore: z.ZodNumber;
        controversyScore: z.ZodNumber;
        viralityScore: z.ZodNumber;
        helpfulnessScore: z.ZodNumber;
        authorityScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        qualityScore?: number;
        engagementScore?: number;
        trendingScore?: number;
        recencyScore?: number;
        controversyScore?: number;
        viralityScore?: number;
        helpfulnessScore?: number;
        authorityScore?: number;
    }, {
        qualityScore?: number;
        engagementScore?: number;
        trendingScore?: number;
        recencyScore?: number;
        controversyScore?: number;
        viralityScore?: number;
        helpfulnessScore?: number;
        authorityScore?: number;
    }>;
    metrics: z.ZodObject<{
        totalLikes: z.ZodDefault<z.ZodNumber>;
        totalDislikes: z.ZodDefault<z.ZodNumber>;
        totalReplies: z.ZodDefault<z.ZodNumber>;
        totalShares: z.ZodDefault<z.ZodNumber>;
        totalHelpfulVotes: z.ZodDefault<z.ZodNumber>;
        totalReports: z.ZodDefault<z.ZodNumber>;
        replyEngagement: z.ZodDefault<z.ZodNumber>;
        viewCount: z.ZodDefault<z.ZodNumber>;
        uniqueEngagers: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        totalLikes?: number;
        viewCount?: number;
        totalShares?: number;
        totalDislikes?: number;
        totalReplies?: number;
        totalHelpfulVotes?: number;
        totalReports?: number;
        replyEngagement?: number;
        uniqueEngagers?: number;
    }, {
        totalLikes?: number;
        viewCount?: number;
        totalShares?: number;
        totalDislikes?: number;
        totalReplies?: number;
        totalHelpfulVotes?: number;
        totalReports?: number;
        replyEngagement?: number;
        uniqueEngagers?: number;
    }>;
    trends: z.ZodObject<{
        hourlyGrowth: z.ZodDefault<z.ZodNumber>;
        dailyGrowth: z.ZodDefault<z.ZodNumber>;
        weeklyGrowth: z.ZodDefault<z.ZodNumber>;
        peakEngagementHour: z.ZodOptional<z.ZodNumber>;
        velocityTrend: z.ZodDefault<z.ZodEnum<["accelerating", "steady", "declining", "stagnant"]>>;
    }, "strip", z.ZodTypeAny, {
        hourlyGrowth?: number;
        dailyGrowth?: number;
        weeklyGrowth?: number;
        peakEngagementHour?: number;
        velocityTrend?: "declining" | "accelerating" | "steady" | "stagnant";
    }, {
        hourlyGrowth?: number;
        dailyGrowth?: number;
        weeklyGrowth?: number;
        peakEngagementHour?: number;
        velocityTrend?: "declining" | "accelerating" | "steady" | "stagnant";
    }>;
}, "strip", z.ZodTypeAny, {
    metrics?: {
        totalLikes?: number;
        viewCount?: number;
        totalShares?: number;
        totalDislikes?: number;
        totalReplies?: number;
        totalHelpfulVotes?: number;
        totalReports?: number;
        replyEngagement?: number;
        uniqueEngagers?: number;
    };
    trends?: {
        hourlyGrowth?: number;
        dailyGrowth?: number;
        weeklyGrowth?: number;
        peakEngagementHour?: number;
        velocityTrend?: "declining" | "accelerating" | "steady" | "stagnant";
    };
    scores?: {
        qualityScore?: number;
        engagementScore?: number;
        trendingScore?: number;
        recencyScore?: number;
        controversyScore?: number;
        viralityScore?: number;
        helpfulnessScore?: number;
        authorityScore?: number;
    };
    commentId?: string;
    calculatedAt?: Date;
}, {
    metrics?: {
        totalLikes?: number;
        viewCount?: number;
        totalShares?: number;
        totalDislikes?: number;
        totalReplies?: number;
        totalHelpfulVotes?: number;
        totalReports?: number;
        replyEngagement?: number;
        uniqueEngagers?: number;
    };
    trends?: {
        hourlyGrowth?: number;
        dailyGrowth?: number;
        weeklyGrowth?: number;
        peakEngagementHour?: number;
        velocityTrend?: "declining" | "accelerating" | "steady" | "stagnant";
    };
    scores?: {
        qualityScore?: number;
        engagementScore?: number;
        trendingScore?: number;
        recencyScore?: number;
        controversyScore?: number;
        viralityScore?: number;
        helpfulnessScore?: number;
        authorityScore?: number;
    };
    commentId?: string;
    calculatedAt?: Date;
}>;
export type CommentScore = z.infer<typeof CommentScoreSchema>;
export declare const TrendingCommentSchema: any;
export type TrendingComment = z.infer<typeof TrendingCommentSchema>;
export declare const TrendingAlgorithmConfigSchema: z.ZodObject<{
    algorithmId: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    weights: z.ZodObject<{
        engagementWeight: z.ZodDefault<z.ZodNumber>;
        recencyWeight: z.ZodDefault<z.ZodNumber>;
        qualityWeight: z.ZodDefault<z.ZodNumber>;
        authorityWeight: z.ZodDefault<z.ZodNumber>;
        controversyWeight: z.ZodDefault<z.ZodNumber>;
        viralityWeight: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        engagementWeight?: number;
        recencyWeight?: number;
        qualityWeight?: number;
        authorityWeight?: number;
        controversyWeight?: number;
        viralityWeight?: number;
    }, {
        engagementWeight?: number;
        recencyWeight?: number;
        qualityWeight?: number;
        authorityWeight?: number;
        controversyWeight?: number;
        viralityWeight?: number;
    }>;
    parameters: z.ZodObject<{
        timeDecayHalfLife: z.ZodDefault<z.ZodNumber>;
        minEngagementThreshold: z.ZodDefault<z.ZodNumber>;
        controversyBoostFactor: z.ZodDefault<z.ZodNumber>;
        qualityThreshold: z.ZodDefault<z.ZodNumber>;
        authorMinReputation: z.ZodDefault<z.ZodNumber>;
        spamPenaltyFactor: z.ZodDefault<z.ZodNumber>;
        maxCommentAge: z.ZodDefault<z.ZodNumber>;
        boostNewAuthors: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        timeDecayHalfLife?: number;
        minEngagementThreshold?: number;
        controversyBoostFactor?: number;
        qualityThreshold?: number;
        authorMinReputation?: number;
        spamPenaltyFactor?: number;
        maxCommentAge?: number;
        boostNewAuthors?: boolean;
    }, {
        timeDecayHalfLife?: number;
        minEngagementThreshold?: number;
        controversyBoostFactor?: number;
        qualityThreshold?: number;
        authorMinReputation?: number;
        spamPenaltyFactor?: number;
        maxCommentAge?: number;
        boostNewAuthors?: boolean;
    }>;
    moderationRules: z.ZodObject<{
        autoFlag: z.ZodObject<{
            toxicityThreshold: z.ZodDefault<z.ZodNumber>;
            spamThreshold: z.ZodDefault<z.ZodNumber>;
            offTopicThreshold: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            toxicityThreshold?: number;
            spamThreshold?: number;
            offTopicThreshold?: number;
        }, {
            toxicityThreshold?: number;
            spamThreshold?: number;
            offTopicThreshold?: number;
        }>;
        autoPromote: z.ZodObject<{
            qualityThreshold: z.ZodDefault<z.ZodNumber>;
            engagementThreshold: z.ZodDefault<z.ZodNumber>;
            authorReputationThreshold: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            qualityThreshold?: number;
            engagementThreshold?: number;
            authorReputationThreshold?: number;
        }, {
            qualityThreshold?: number;
            engagementThreshold?: number;
            authorReputationThreshold?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        autoFlag?: {
            toxicityThreshold?: number;
            spamThreshold?: number;
            offTopicThreshold?: number;
        };
        autoPromote?: {
            qualityThreshold?: number;
            engagementThreshold?: number;
            authorReputationThreshold?: number;
        };
    }, {
        autoFlag?: {
            toxicityThreshold?: number;
            spamThreshold?: number;
            offTopicThreshold?: number;
        };
        autoPromote?: {
            qualityThreshold?: number;
            engagementThreshold?: number;
            authorReputationThreshold?: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    parameters?: {
        timeDecayHalfLife?: number;
        minEngagementThreshold?: number;
        controversyBoostFactor?: number;
        qualityThreshold?: number;
        authorMinReputation?: number;
        spamPenaltyFactor?: number;
        maxCommentAge?: number;
        boostNewAuthors?: boolean;
    };
    weights?: {
        engagementWeight?: number;
        recencyWeight?: number;
        qualityWeight?: number;
        authorityWeight?: number;
        controversyWeight?: number;
        viralityWeight?: number;
    };
    version?: string;
    enabled?: boolean;
    algorithmId?: string;
    moderationRules?: {
        autoFlag?: {
            toxicityThreshold?: number;
            spamThreshold?: number;
            offTopicThreshold?: number;
        };
        autoPromote?: {
            qualityThreshold?: number;
            engagementThreshold?: number;
            authorReputationThreshold?: number;
        };
    };
}, {
    name?: string;
    description?: string;
    parameters?: {
        timeDecayHalfLife?: number;
        minEngagementThreshold?: number;
        controversyBoostFactor?: number;
        qualityThreshold?: number;
        authorMinReputation?: number;
        spamPenaltyFactor?: number;
        maxCommentAge?: number;
        boostNewAuthors?: boolean;
    };
    weights?: {
        engagementWeight?: number;
        recencyWeight?: number;
        qualityWeight?: number;
        authorityWeight?: number;
        controversyWeight?: number;
        viralityWeight?: number;
    };
    version?: string;
    enabled?: boolean;
    algorithmId?: string;
    moderationRules?: {
        autoFlag?: {
            toxicityThreshold?: number;
            spamThreshold?: number;
            offTopicThreshold?: number;
        };
        autoPromote?: {
            qualityThreshold?: number;
            engagementThreshold?: number;
            authorReputationThreshold?: number;
        };
    };
}>;
export type TrendingAlgorithmConfig = z.infer<typeof TrendingAlgorithmConfigSchema>;
export declare const TrendingResultsSchema: z.ZodObject<{
    resourceId: z.ZodString;
    resourceType: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
    period: z.ZodEnum<["1h", "6h", "24h", "7d", "30d", "all_time"]>;
    algorithmUsed: z.ZodString;
    generatedAt: z.ZodDate;
    totalComments: z.ZodDefault<z.ZodNumber>;
    qualifiedComments: z.ZodDefault<z.ZodNumber>;
    trendingComments: z.ZodArray<any, "many">;
    summary: z.ZodObject<{
        topEngagementType: z.ZodOptional<z.ZodEnum<["like", "dislike", "reply", "share", "helpful", "report"]>>;
        averageScore: z.ZodDefault<z.ZodNumber>;
        totalEngagements: z.ZodDefault<z.ZodNumber>;
        uniqueParticipants: z.ZodDefault<z.ZodNumber>;
        conversationHealth: z.ZodDefault<z.ZodEnum<["excellent", "good", "fair", "poor"]>>;
        sentimentDistribution: z.ZodObject<{
            positive: z.ZodDefault<z.ZodNumber>;
            neutral: z.ZodDefault<z.ZodNumber>;
            negative: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            positive?: number;
            neutral?: number;
            negative?: number;
        }, {
            positive?: number;
            neutral?: number;
            negative?: number;
        }>;
        topHashtags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        emergingTopics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        controversyLevel: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        averageScore?: number;
        sentimentDistribution?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
        emergingTopics?: string[];
        topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
        totalEngagements?: number;
        uniqueParticipants?: number;
        conversationHealth?: "excellent" | "good" | "poor" | "fair";
        topHashtags?: string[];
        controversyLevel?: "low" | "medium" | "high";
    }, {
        averageScore?: number;
        sentimentDistribution?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
        emergingTopics?: string[];
        topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
        totalEngagements?: number;
        uniqueParticipants?: number;
        conversationHealth?: "excellent" | "good" | "poor" | "fair";
        topHashtags?: string[];
        controversyLevel?: "low" | "medium" | "high";
    }>;
    metadata: z.ZodObject<{
        calculationTimeMs: z.ZodDefault<z.ZodNumber>;
        cacheHit: z.ZodDefault<z.ZodBoolean>;
        dataFreshness: z.ZodDefault<z.ZodNumber>;
        algorithmVersion: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        calculationTimeMs?: number;
        cacheHit?: boolean;
        dataFreshness?: number;
        algorithmVersion?: string;
    }, {
        calculationTimeMs?: number;
        cacheHit?: boolean;
        dataFreshness?: number;
        algorithmVersion?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    metadata?: {
        calculationTimeMs?: number;
        cacheHit?: boolean;
        dataFreshness?: number;
        algorithmVersion?: string;
    };
    summary?: {
        averageScore?: number;
        sentimentDistribution?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
        emergingTopics?: string[];
        topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
        totalEngagements?: number;
        uniqueParticipants?: number;
        conversationHealth?: "excellent" | "good" | "poor" | "fair";
        topHashtags?: string[];
        controversyLevel?: "low" | "medium" | "high";
    };
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
    generatedAt?: Date;
    totalComments?: number;
    algorithmUsed?: string;
    qualifiedComments?: number;
    trendingComments?: any[];
}, {
    metadata?: {
        calculationTimeMs?: number;
        cacheHit?: boolean;
        dataFreshness?: number;
        algorithmVersion?: string;
    };
    summary?: {
        averageScore?: number;
        sentimentDistribution?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
        emergingTopics?: string[];
        topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
        totalEngagements?: number;
        uniqueParticipants?: number;
        conversationHealth?: "excellent" | "good" | "poor" | "fair";
        topHashtags?: string[];
        controversyLevel?: "low" | "medium" | "high";
    };
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
    generatedAt?: Date;
    totalComments?: number;
    algorithmUsed?: string;
    qualifiedComments?: number;
    trendingComments?: any[];
}>;
export type TrendingResults = z.infer<typeof TrendingResultsSchema>;
export declare const CommentAnalyticsSchema: z.ZodObject<{
    resourceId: z.ZodString;
    timeRange: z.ZodObject<{
        start: z.ZodDate;
        end: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        start?: Date;
        end?: Date;
    }, {
        start?: Date;
        end?: Date;
    }>;
    metrics: z.ZodObject<{
        totalComments: z.ZodDefault<z.ZodNumber>;
        totalEngagements: z.ZodDefault<z.ZodNumber>;
        uniqueCommenters: z.ZodDefault<z.ZodNumber>;
        averageCommentsPerUser: z.ZodDefault<z.ZodNumber>;
        commentsGrowthRate: z.ZodDefault<z.ZodNumber>;
        engagementRate: z.ZodDefault<z.ZodNumber>;
        responseRate: z.ZodDefault<z.ZodNumber>;
        moderationRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        totalComments?: number;
        totalEngagements?: number;
        uniqueCommenters?: number;
        averageCommentsPerUser?: number;
        commentsGrowthRate?: number;
        engagementRate?: number;
        responseRate?: number;
        moderationRate?: number;
    }, {
        totalComments?: number;
        totalEngagements?: number;
        uniqueCommenters?: number;
        averageCommentsPerUser?: number;
        commentsGrowthRate?: number;
        engagementRate?: number;
        responseRate?: number;
        moderationRate?: number;
    }>;
    trends: z.ZodObject<{
        commentVelocity: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp?: Date;
            count?: number;
        }, {
            timestamp?: Date;
            count?: number;
        }>, "many">>;
        engagementTrends: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            likes: z.ZodNumber;
            replies: z.ZodNumber;
            shares: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp?: Date;
            likes?: number;
            shares?: number;
            replies?: number;
        }, {
            timestamp?: Date;
            likes?: number;
            shares?: number;
            replies?: number;
        }>, "many">>;
        sentimentTrends: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            positive: z.ZodNumber;
            neutral: z.ZodNumber;
            negative: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
        }, {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
        }>, "many">>;
        topicEvolution: z.ZodDefault<z.ZodArray<z.ZodObject<{
            topic: z.ZodString;
            mentions: z.ZodNumber;
            sentiment: z.ZodNumber;
            period: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            period?: string;
            sentiment?: number;
            topic?: string;
            mentions?: number;
        }, {
            period?: string;
            sentiment?: number;
            topic?: string;
            mentions?: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        commentVelocity?: {
            timestamp?: Date;
            count?: number;
        }[];
        engagementTrends?: {
            timestamp?: Date;
            likes?: number;
            shares?: number;
            replies?: number;
        }[];
        sentimentTrends?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
        }[];
        topicEvolution?: {
            period?: string;
            sentiment?: number;
            topic?: string;
            mentions?: number;
        }[];
    }, {
        commentVelocity?: {
            timestamp?: Date;
            count?: number;
        }[];
        engagementTrends?: {
            timestamp?: Date;
            likes?: number;
            shares?: number;
            replies?: number;
        }[];
        sentimentTrends?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
        }[];
        topicEvolution?: {
            period?: string;
            sentiment?: number;
            topic?: string;
            mentions?: number;
        }[];
    }>;
    breakdowns: z.ZodObject<{
        byEngagementType: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        byUserType: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        byTimeOfDay: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
        byDayOfWeek: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
        byLanguage: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        bySentiment: z.ZodObject<{
            positive: z.ZodDefault<z.ZodNumber>;
            neutral: z.ZodDefault<z.ZodNumber>;
            negative: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            positive?: number;
            neutral?: number;
            negative?: number;
        }, {
            positive?: number;
            neutral?: number;
            negative?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byEngagementType?: Record<string, number>;
        byUserType?: Record<string, number>;
        byLanguage?: Record<string, number>;
        bySentiment?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
    }, {
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byEngagementType?: Record<string, number>;
        byUserType?: Record<string, number>;
        byLanguage?: Record<string, number>;
        bySentiment?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
    }>;
    insights: z.ZodObject<{
        mostEngagedTopics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        influentialCommenters: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        emergingTrends: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        contentRecommendations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        moderationAlerts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
            message: z.ZodString;
            commentIds: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            message?: string;
            type?: string;
            severity?: "low" | "medium" | "high" | "critical";
            commentIds?: string[];
        }, {
            message?: string;
            type?: string;
            severity?: "low" | "medium" | "high" | "critical";
            commentIds?: string[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        mostEngagedTopics?: string[];
        influentialCommenters?: string[];
        emergingTrends?: string[];
        contentRecommendations?: string[];
        moderationAlerts?: {
            message?: string;
            type?: string;
            severity?: "low" | "medium" | "high" | "critical";
            commentIds?: string[];
        }[];
    }, {
        mostEngagedTopics?: string[];
        influentialCommenters?: string[];
        emergingTrends?: string[];
        contentRecommendations?: string[];
        moderationAlerts?: {
            message?: string;
            type?: string;
            severity?: "low" | "medium" | "high" | "critical";
            commentIds?: string[];
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    metrics?: {
        totalComments?: number;
        totalEngagements?: number;
        uniqueCommenters?: number;
        averageCommentsPerUser?: number;
        commentsGrowthRate?: number;
        engagementRate?: number;
        responseRate?: number;
        moderationRate?: number;
    };
    trends?: {
        commentVelocity?: {
            timestamp?: Date;
            count?: number;
        }[];
        engagementTrends?: {
            timestamp?: Date;
            likes?: number;
            shares?: number;
            replies?: number;
        }[];
        sentimentTrends?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
        }[];
        topicEvolution?: {
            period?: string;
            sentiment?: number;
            topic?: string;
            mentions?: number;
        }[];
    };
    insights?: {
        mostEngagedTopics?: string[];
        influentialCommenters?: string[];
        emergingTrends?: string[];
        contentRecommendations?: string[];
        moderationAlerts?: {
            message?: string;
            type?: string;
            severity?: "low" | "medium" | "high" | "critical";
            commentIds?: string[];
        }[];
    };
    resourceId?: string;
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    breakdowns?: {
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byEngagementType?: Record<string, number>;
        byUserType?: Record<string, number>;
        byLanguage?: Record<string, number>;
        bySentiment?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
    };
}, {
    metrics?: {
        totalComments?: number;
        totalEngagements?: number;
        uniqueCommenters?: number;
        averageCommentsPerUser?: number;
        commentsGrowthRate?: number;
        engagementRate?: number;
        responseRate?: number;
        moderationRate?: number;
    };
    trends?: {
        commentVelocity?: {
            timestamp?: Date;
            count?: number;
        }[];
        engagementTrends?: {
            timestamp?: Date;
            likes?: number;
            shares?: number;
            replies?: number;
        }[];
        sentimentTrends?: {
            timestamp?: Date;
            positive?: number;
            neutral?: number;
            negative?: number;
        }[];
        topicEvolution?: {
            period?: string;
            sentiment?: number;
            topic?: string;
            mentions?: number;
        }[];
    };
    insights?: {
        mostEngagedTopics?: string[];
        influentialCommenters?: string[];
        emergingTrends?: string[];
        contentRecommendations?: string[];
        moderationAlerts?: {
            message?: string;
            type?: string;
            severity?: "low" | "medium" | "high" | "critical";
            commentIds?: string[];
        }[];
    };
    resourceId?: string;
    timeRange?: {
        start?: Date;
        end?: Date;
    };
    breakdowns?: {
        byTimeOfDay?: number[];
        byDayOfWeek?: number[];
        byEngagementType?: Record<string, number>;
        byUserType?: Record<string, number>;
        byLanguage?: Record<string, number>;
        bySentiment?: {
            positive?: number;
            neutral?: number;
            negative?: number;
        };
    };
}>;
export type CommentAnalytics = z.infer<typeof CommentAnalyticsSchema>;
export declare const GetTrendingCommentsRequestSchema: z.ZodObject<{
    resourceId: z.ZodString;
    resourceType: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
    period: z.ZodDefault<z.ZodEnum<["1h", "6h", "24h", "7d", "30d", "all_time"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["trending", "recent", "top_rated", "controversial", "oldest"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    includeReplies: z.ZodDefault<z.ZodBoolean>;
    minScore: z.ZodOptional<z.ZodNumber>;
    language: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId?: string;
    limit?: number;
    offset?: number;
    sortOrder?: "oldest" | "recent" | "trending" | "top_rated" | "controversial";
    language?: string;
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
    includeReplies?: boolean;
    minScore?: number;
}, {
    userId?: string;
    limit?: number;
    offset?: number;
    sortOrder?: "oldest" | "recent" | "trending" | "top_rated" | "controversial";
    language?: string;
    resourceId?: string;
    resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
    period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
    includeReplies?: boolean;
    minScore?: number;
}>;
export declare const TrendingCommentsResponseSchema: z.ZodObject<{
    results: z.ZodObject<{
        resourceId: z.ZodString;
        resourceType: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
        period: z.ZodEnum<["1h", "6h", "24h", "7d", "30d", "all_time"]>;
        algorithmUsed: z.ZodString;
        generatedAt: z.ZodDate;
        totalComments: z.ZodDefault<z.ZodNumber>;
        qualifiedComments: z.ZodDefault<z.ZodNumber>;
        trendingComments: z.ZodArray<any, "many">;
        summary: z.ZodObject<{
            topEngagementType: z.ZodOptional<z.ZodEnum<["like", "dislike", "reply", "share", "helpful", "report"]>>;
            averageScore: z.ZodDefault<z.ZodNumber>;
            totalEngagements: z.ZodDefault<z.ZodNumber>;
            uniqueParticipants: z.ZodDefault<z.ZodNumber>;
            conversationHealth: z.ZodDefault<z.ZodEnum<["excellent", "good", "fair", "poor"]>>;
            sentimentDistribution: z.ZodObject<{
                positive: z.ZodDefault<z.ZodNumber>;
                neutral: z.ZodDefault<z.ZodNumber>;
                negative: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                positive?: number;
                neutral?: number;
                negative?: number;
            }, {
                positive?: number;
                neutral?: number;
                negative?: number;
            }>;
            topHashtags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            emergingTopics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            controversyLevel: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
        }, "strip", z.ZodTypeAny, {
            averageScore?: number;
            sentimentDistribution?: {
                positive?: number;
                neutral?: number;
                negative?: number;
            };
            emergingTopics?: string[];
            topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
            totalEngagements?: number;
            uniqueParticipants?: number;
            conversationHealth?: "excellent" | "good" | "poor" | "fair";
            topHashtags?: string[];
            controversyLevel?: "low" | "medium" | "high";
        }, {
            averageScore?: number;
            sentimentDistribution?: {
                positive?: number;
                neutral?: number;
                negative?: number;
            };
            emergingTopics?: string[];
            topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
            totalEngagements?: number;
            uniqueParticipants?: number;
            conversationHealth?: "excellent" | "good" | "poor" | "fair";
            topHashtags?: string[];
            controversyLevel?: "low" | "medium" | "high";
        }>;
        metadata: z.ZodObject<{
            calculationTimeMs: z.ZodDefault<z.ZodNumber>;
            cacheHit: z.ZodDefault<z.ZodBoolean>;
            dataFreshness: z.ZodDefault<z.ZodNumber>;
            algorithmVersion: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            calculationTimeMs?: number;
            cacheHit?: boolean;
            dataFreshness?: number;
            algorithmVersion?: string;
        }, {
            calculationTimeMs?: number;
            cacheHit?: boolean;
            dataFreshness?: number;
            algorithmVersion?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        metadata?: {
            calculationTimeMs?: number;
            cacheHit?: boolean;
            dataFreshness?: number;
            algorithmVersion?: string;
        };
        summary?: {
            averageScore?: number;
            sentimentDistribution?: {
                positive?: number;
                neutral?: number;
                negative?: number;
            };
            emergingTopics?: string[];
            topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
            totalEngagements?: number;
            uniqueParticipants?: number;
            conversationHealth?: "excellent" | "good" | "poor" | "fair";
            topHashtags?: string[];
            controversyLevel?: "low" | "medium" | "high";
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
        generatedAt?: Date;
        totalComments?: number;
        algorithmUsed?: string;
        qualifiedComments?: number;
        trendingComments?: any[];
    }, {
        metadata?: {
            calculationTimeMs?: number;
            cacheHit?: boolean;
            dataFreshness?: number;
            algorithmVersion?: string;
        };
        summary?: {
            averageScore?: number;
            sentimentDistribution?: {
                positive?: number;
                neutral?: number;
                negative?: number;
            };
            emergingTopics?: string[];
            topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
            totalEngagements?: number;
            uniqueParticipants?: number;
            conversationHealth?: "excellent" | "good" | "poor" | "fair";
            topHashtags?: string[];
            controversyLevel?: "low" | "medium" | "high";
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
        generatedAt?: Date;
        totalComments?: number;
        algorithmUsed?: string;
        qualifiedComments?: number;
        trendingComments?: any[];
    }>;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        limit: z.ZodNumber;
        offset: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        limit?: number;
        offset?: number;
        total?: number;
        hasMore?: boolean;
    }, {
        limit?: number;
        offset?: number;
        total?: number;
        hasMore?: boolean;
    }>;
    meta: z.ZodObject<{
        requestId: z.ZodString;
        processingTime: z.ZodNumber;
        cacheStatus: z.ZodEnum<["hit", "miss", "stale"]>;
        algorithm: z.ZodString;
        dataFreshness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        requestId?: string;
        algorithm?: string;
        processingTime?: number;
        dataFreshness?: number;
        cacheStatus?: "hit" | "miss" | "stale";
    }, {
        requestId?: string;
        algorithm?: string;
        processingTime?: number;
        dataFreshness?: number;
        cacheStatus?: "hit" | "miss" | "stale";
    }>;
}, "strip", z.ZodTypeAny, {
    meta?: {
        requestId?: string;
        algorithm?: string;
        processingTime?: number;
        dataFreshness?: number;
        cacheStatus?: "hit" | "miss" | "stale";
    };
    results?: {
        metadata?: {
            calculationTimeMs?: number;
            cacheHit?: boolean;
            dataFreshness?: number;
            algorithmVersion?: string;
        };
        summary?: {
            averageScore?: number;
            sentimentDistribution?: {
                positive?: number;
                neutral?: number;
                negative?: number;
            };
            emergingTopics?: string[];
            topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
            totalEngagements?: number;
            uniqueParticipants?: number;
            conversationHealth?: "excellent" | "good" | "poor" | "fair";
            topHashtags?: string[];
            controversyLevel?: "low" | "medium" | "high";
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
        generatedAt?: Date;
        totalComments?: number;
        algorithmUsed?: string;
        qualifiedComments?: number;
        trendingComments?: any[];
    };
    pagination?: {
        limit?: number;
        offset?: number;
        total?: number;
        hasMore?: boolean;
    };
}, {
    meta?: {
        requestId?: string;
        algorithm?: string;
        processingTime?: number;
        dataFreshness?: number;
        cacheStatus?: "hit" | "miss" | "stale";
    };
    results?: {
        metadata?: {
            calculationTimeMs?: number;
            cacheHit?: boolean;
            dataFreshness?: number;
            algorithmVersion?: string;
        };
        summary?: {
            averageScore?: number;
            sentimentDistribution?: {
                positive?: number;
                neutral?: number;
                negative?: number;
            };
            emergingTopics?: string[];
            topEngagementType?: "helpful" | "like" | "reply" | "share" | "report" | "dislike";
            totalEngagements?: number;
            uniqueParticipants?: number;
            conversationHealth?: "excellent" | "good" | "poor" | "fair";
            topHashtags?: string[];
            controversyLevel?: "low" | "medium" | "high";
        };
        resourceId?: string;
        resourceType?: "template" | "graph" | "tutorial" | "collection" | "case_study" | "marketplace_item";
        period?: "30d" | "all_time" | "7d" | "1h" | "6h" | "24h";
        generatedAt?: Date;
        totalComments?: number;
        algorithmUsed?: string;
        qualifiedComments?: number;
        trendingComments?: any[];
    };
    pagination?: {
        limit?: number;
        offset?: number;
        total?: number;
        hasMore?: boolean;
    };
}>;
export type GetTrendingCommentsRequest = z.infer<typeof GetTrendingCommentsRequestSchema>;
export type TrendingCommentsResponse = z.infer<typeof TrendingCommentsResponseSchema>;
export declare const validateGetTrendingCommentsRequest: (data: unknown) => GetTrendingCommentsRequest;
export declare const validateTrendingComment: (data: unknown) => TrendingComment;
export declare const validateCommentScore: (data: unknown) => CommentScore;
export interface TrendingSystemConfig {
    enabledAlgorithms: string[];
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