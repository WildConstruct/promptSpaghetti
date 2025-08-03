/**
 * Epic 16 Marketplace Trending Comments System - Data Types
 *
 * Comprehensive comment trending functionality for templates, graphs, and marketplace content.
 * Supports comment ranking, engagement tracking, and trend analysis.
 *
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */
import { z } from 'zod';
// Comment engagement and scoring
export const CommentEngagementSchema = z.object({});
engagementId: z.string().uuid(),
    commentId;
z.string().uuid(),
    userId;
z.string().uuid(),
    engagementType;
z.enum(['like', 'dislike', 'reply', 'share', 'helpful', 'report']),
    timestamp;
z.date();
weight: z.number().min(0).max(10).default(1), // Engagement weight for scoring
    contextData;
z.record(z.unknown()).default({});
;
// Comment scoring metrics
export const CommentScoreSchema = z.object({});
commentId: z.string().uuid();
calculatedAt: z.date();
scores: z.object({});
trendingScore: z.number().min(0), // Primary trending algorithm score
    engagementScore;
z.number().min(0), // Total engagement weighted score
    recencyScore;
z.number().min(0), // Time-based decay score
    qualityScore;
z.number().min(0).max(100), // Content quality assessment
    controversyScore;
z.number().min(0), // Like/dislike ratio controversy
    viralityScore;
z.number().min(0), // Share and mention velocity
    helpfulnessScore;
z.number().min(0), // Helpful votes score
    authorityScore;
z.number().min(0); // Author credibility score }
metrics: z.object({});
totalLikes: z.number().default(0);
totalDislikes: z.number().default(0);
totalReplies: z.number().default(0);
totalShares: z.number().default(0);
totalHelpfulVotes: z.number().default(0);
totalReports: z.number().default(0);
replyEngagement: z.number().default(0), // Engagement on reply threads
    viewCount;
z.number().default(0);
uniqueEngagers: z.number().default(0); // Unique users who engaged }
trends: z.object({});
hourlyGrowth: z.number().default(0);
dailyGrowth: z.number().default(0);
weeklyGrowth: z.number().default(0);
peakEngagementHour: z.number().min(0).max(23).optional();
velocityTrend: z.enum(['accelerating', 'steady', 'declining', 'stagnant']).default('steady');
;
// Enhanced comment with trending data
export const TrendingCommentSchema = z.object({});
commentId: z.string().uuid();
resourceId: z.string();
resourceType: z.enum(['template', 'graph', 'collection', 'case_study', 'tutorial', 'marketplace_item']);
parentCommentId: z.string().uuid().optional(), // For reply threading
    authorId;
z.string().uuid();
authorDisplayName: z.string();
authorAvatarUrl: z.string().url().optional();
authorVerified: z.boolean().default(false);
authorReputation: z.number().min(0).default(0);
content: z.string().min(1).max(5000);
contentType: z.enum(['text', 'markdown', 'rich']).default('text');
mentions: z.array(z.string().uuid()).default([]), // Mentioned user IDs
    hashtags;
z.array(z.string()).default([]);
attachments: z.array(z.object({}), attachmentId, z.string().uuid(), type, z.enum(['image', 'video', 'audio', 'document', 'link']), url, z.string().url(), thumbnail, z.string().url().optional(), title, z.string().optional(), description, z.string().optional(), fileSize, z.number().positive().optional(), mimeType, z.string().optional());
([]);
createdAt: z.date();
updatedAt: z.date().optional();
editedAt: z.date().optional();
isEdited: z.boolean().default(false);
isPinned: z.boolean().default(false);
isHighlighted: z.boolean().default(false), // Author or moderator highlight
    moderationStatus;
z.enum(['approved', 'pending', 'flagged', 'removed']).default('approved');
score: CommentScoreSchema;
replyCount: z.number().default(0);
replyTree: z.array(z.lazy(() => TrendingCommentSchema)).default([]), // Nested replies
    visibility;
z.enum(['public', 'subscribers', 'premium', 'private']).default('public');
language: z.string().default('en');
sentiment: z.object({});
overall: z.enum(['positive', 'neutral', 'negative']);
confidence: z.number().min(0).max(1);
emotions: z.record(z.number().min(0).max(1)).default({}), // emotion -> confidence
    toxicity;
z.number().min(0).max(1).default(0);
optional();
;
// Trending algorithm configuration
export const TrendingAlgorithmConfigSchema = z.object({});
algorithmId: z.string();
name: z.string();
description: z.string();
version: z.string().default('1.0.0');
enabled: z.boolean().default(true);
weights: z.object({});
engagementWeight: z.number().min(0).max(1).default(0.4), // Likes, replies, shares
    recencyWeight;
z.number().min(0).max(1).default(0.25), // Time decay factor
    qualityWeight;
z.number().min(0).max(1).default(0.15), // Content quality signals
    authorityWeight;
z.number().min(0).max(1).default(0.1), // Author reputation
    controversyWeight;
z.number().min(0).max(1).default(0.05), // Healthy debate factor
    viralityWeight;
z.number().min(0).max(1).default(0.05); // Share velocity }
parameters: z.object({});
timeDecayHalfLife: z.number().positive().default(24), // Hours for 50% decay
    minEngagementThreshold;
z.number().default(3), // Minimum engagements to rank
    controversyBoostFactor;
z.number().min(1).default(1.2), // Boost for healthy debate
    qualityThreshold;
z.number().min(0).max(100).default(60), // Min quality score
    authorMinReputation;
z.number().default(0), // Min author reputation
    spamPenaltyFactor;
z.number().min(0).max(1).default(0.1), // Penalty for spam-like content
    maxCommentAge;
z.number().default(168), // Max hours to consider (7 days)
    boostNewAuthors;
z.boolean().default(true); // Give new authors a small boost }
moderationRules: z.object({});
autoFlag: z.object({});
toxicityThreshold: z.number().min(0).max(1).default(0.8);
spamThreshold: z.number().min(0).max(1).default(0.7);
offTopicThreshold: z.number().min(0).max(1).default(0.8);
autoPromote: z.object({});
qualityThreshold: z.number().min(0).max(100).default(90);
engagementThreshold: z.number().default(20);
authorReputationThreshold: z.number().default(500);
;
// Trending results and analytics
export const TrendingResultsSchema = z.object({});
resourceId: z.string();
resourceType: z.enum(['template', 'graph', 'collection', 'case_study', 'tutorial', 'marketplace_item']);
period: z.enum(['1h', '6h', '24h', '7d', '30d', 'all_time']);
algorithmUsed: z.string();
generatedAt: z.date();
totalComments: z.number().default(0);
qualifiedComments: z.number().default(0), // Comments meeting trending criteria
    trendingComments;
z.array(TrendingCommentSchema);
summary: z.object({});
topEngagementType: z.enum(['like', 'dislike', 'reply', 'share', 'helpful', 'report']).optional();
averageScore: z.number().default(0);
totalEngagements: z.number().default(0);
uniqueParticipants: z.number().default(0);
conversationHealth: z.enum(['excellent', 'good', 'fair', 'poor']).default('fair');
sentimentDistribution: z.object({});
positive: z.number().min(0).max(1).default(0);
neutral: z.number().min(0).max(1).default(0);
negative: z.number().min(0).max(1).default(0);
topHashtags: z.array(z.string()).default([]);
emergingTopics: z.array(z.string()).default([]);
controversyLevel: z.enum(['low', 'medium', 'high']).default('low');
metadata: z.object({});
calculationTimeMs: z.number().default(0);
cacheHit: z.boolean().default(false);
dataFreshness: z.number().default(0), // Minutes since last update
    algorithmVersion;
z.string().default('1.0.0');
;
// Comment analytics and insights
export const CommentAnalyticsSchema = z.object({});
resourceId: z.string();
timeRange: z.object({});
start: z.date();
end: z.date();
metrics: z.object({});
totalComments: z.number().default(0);
totalEngagements: z.number().default(0);
uniqueCommenters: z.number().default(0);
averageCommentsPerUser: z.number().default(0);
commentsGrowthRate: z.number().default(0), // Percentage growth
    engagementRate;
z.number().min(0).max(1).default(0), // Engagements per comment
    responseRate;
z.number().min(0).max(1).default(0), // Comments with replies
    moderationRate;
z.number().min(0).max(1).default(0); // Flagged/removed percentage }
trends: z.object({});
commentVelocity: z.array(z.object({}), timestamp, z.date(), count, z.number());
([]);
engagementTrends: z.array(z.object({}), timestamp, z.date(), likes, z.number(), replies, z.number(), shares, z.number());
([]);
sentimentTrends: z.array(z.object({}), timestamp, z.date(), positive, z.number(), neutral, z.number(), negative, z.number());
([]);
topicEvolution: z.array(z.object({}), topic, z.string(), mentions, z.number(), sentiment, z.number(), period, z.string());
([]);
breakdowns: z.object({});
byEngagementType: z.record(z.number()).default({});
byUserType: z.record(z.number()).default({}), // verified, new, regular, etc.
    byTimeOfDay;
z.array(z.number()).default([]), // 24 hour breakdown
    byDayOfWeek;
z.array(z.number()).default([]), // 7 day breakdown
    byLanguage;
z.record(z.number()).default({});
bySentiment: z.object({});
positive: z.number().default(0);
neutral: z.number().default(0);
negative: z.number().default(0);
insights: z.object({});
mostEngagedTopics: z.array(z.string()).default([]);
influentialCommenters: z.array(z.string()).default([]), // User IDs
    emergingTrends;
z.array(z.string()).default([]);
contentRecommendations: z.array(z.string()).default([]);
moderationAlerts: z.array(z.object({}), type, z.string(), severity, z.enum(['low', 'medium', 'high', 'critical']), message, z.string(), commentIds, z.array(z.string()));
([]);
;
// API request/response types
export const GetTrendingCommentsRequestSchema = z.object({});
resourceId: z.string();
resourceType: z.enum(['template', 'graph', 'collection', 'case_study', 'tutorial', 'marketplace_item']);
period: z.enum(['1h', '6h', '24h', '7d', '30d', 'all_time']).default('24h');
sortOrder: z.enum(['trending', 'recent', 'top_rated', 'controversial', 'oldest']).default('trending');
limit: z.number().min(1).max(100).default(20);
offset: z.number().min(0).default(0);
includeReplies: z.boolean().default(true);
minScore: z.number().min(0).optional();
language: z.string().optional();
userId: z.string().uuid().optional(); // For personalized results }
;
export const TrendingCommentsResponseSchema = z.object({});
results: TrendingResultsSchema;
pagination: z.object({});
total: z.number();
limit: z.number();
offset: z.number();
hasMore: z.boolean();
meta: z.object({});
requestId: z.string().uuid();
processingTime: z.number(), // milliseconds
    cacheStatus;
z.enum(['hit', 'miss', 'stale']);
algorithm: z.string();
dataFreshness: z.number(); // minutes }
;
// Validation functions
export const validateGetTrendingCommentsRequest = (data) => { return GetTrendingCommentsRequestSchema.parse(data); };
export const validateTrendingComment = (data) => { return TrendingCommentSchema.parse(data); };
export const validateCommentScore = (data) => { return CommentScoreSchema.parse(data); };
TrendingCommentsResponseSchema;
;
