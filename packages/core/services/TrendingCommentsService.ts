/**
 * Epic 16 Marketplace Trending Comments Service
 * 
 * Core service for calculating comment trends, engagement scoring, and analytics.
 * Implements sophisticated trending algorithms with real-time score calculation.
 * 
 * Task: E16-1753114247017-86B04D - Implement trending comments
 */

import {
  TrendingComment,
  CommentScore,
  CommentEngagement,
  TrendingResults,
  CommentAnalytics,
  TrendingAlgorithmConfig,
  GetTrendingCommentsRequest,
  TrendingCommentsResponse,
  CommentableResourceType,
  TrendingPeriod,
  CommentSortOrder,
  CommentEngagementType,
  validateGetTrendingCommentsRequest,
  validateTrendingComment,
  validateCommentScore
} from '../types/TrendingCommentsTypes';

import { v4 as uuidv4 } from 'uuid';

export class TrendingCommentsService {
  private baseUrl: string;
  private algorithms: Map<string, TrendingAlgorithmConfig>;
  private defaultAlgorithm: string;
  private cacheEnabled: boolean;
  private scoreCache: Map<string, { score: CommentScore; timestamp: number }>;
  private trendingCache: Map<string, { results: TrendingResults; timestamp: number }>;
  
  constructor(config: {
    baseUrl: string;
    algorithms?: TrendingAlgorithmConfig[];
    defaultAlgorithm?: string;
    cacheEnabled?: boolean;
    cacheTTL?: number;
  }) {
    this.baseUrl = config.baseUrl;
    this.algorithms = new Map();
    this.defaultAlgorithm = config.defaultAlgorithm || 'default';
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.scoreCache = new Map();
    this.trendingCache = new Map();
    
    // Initialize with default algorithm if none provided
    if (!config.algorithms?.length) {
      this.algorithms.set('default', this.getDefaultAlgorithmConfig());
    } else {
      config.algorithms.forEach(algorithm => {
        this.algorithms.set(algorithm.algorithmId, algorithm);
      });
    }
  }

  /**
   * Get trending comments for a resource
   */
  async getTrendingComments(request: GetTrendingCommentsRequest): Promise<TrendingCommentsResponse> {
    const validatedRequest = validateGetTrendingCommentsRequest(request);
    const startTime = Date.now();
    const requestId = uuidv4();
    
    // Check cache first
    const cacheKey = this.generateCacheKey(validatedRequest);
    const cachedResults = this.getCachedTrendingResults(cacheKey);
    
    if (cachedResults && this.cacheEnabled) {
      return {
        results: cachedResults,
        pagination: {
          total: cachedResults.trendingComments.length,
          limit: validatedRequest.limit,
          offset: validatedRequest.offset,
          hasMore: cachedResults.trendingComments.length > validatedRequest.offset + validatedRequest.limit
        },
        meta: {
          requestId,
          processingTime: Date.now() - startTime,
          cacheStatus: 'hit',
          algorithm: this.defaultAlgorithm,
          dataFreshness: Math.floor((Date.now() - cachedResults.generatedAt.getTime()) / 60000)
        }
      };
    }

    // Calculate trending results
    const trendingResults = await this.calculateTrendingResults(validatedRequest);
    
    // Cache results
    if (this.cacheEnabled) {
      this.cacheTrendingResults(cacheKey, trendingResults);
    }

    // Apply pagination
    const paginatedComments = trendingResults.trendingComments.slice(
      validatedRequest.offset,
      validatedRequest.offset + validatedRequest.limit
    );

    return {
      results: {
        ...trendingResults,
        trendingComments: paginatedComments
      },
      pagination: {
        total: trendingResults.trendingComments.length,
        limit: validatedRequest.limit,
        offset: validatedRequest.offset,
        hasMore: trendingResults.trendingComments.length > validatedRequest.offset + validatedRequest.limit
      },
      meta: {
        requestId,
        processingTime: Date.now() - startTime,
        cacheStatus: 'miss',
        algorithm: this.defaultAlgorithm,
        dataFreshness: 0
      }
    };
  }

  /**
   * Calculate trending score for a single comment
   */
  async calculateCommentScore(
    comment: TrendingComment,
    engagements: CommentEngagement[],
    algorithmId?: string
  ): Promise<CommentScore> {
    const algorithm = this.algorithms.get(algorithmId || this.defaultAlgorithm);
    if (!algorithm) {
      throw new Error(`Algorithm not found: ${algorithmId}`);
    }

    // Check cache first
    const cacheKey = `score:${comment.commentId}:${algorithmId || this.defaultAlgorithm}`;
    const cachedScore = this.getCachedScore(cacheKey);
    if (cachedScore && this.cacheEnabled) {
      return cachedScore;
    }

    // Calculate engagement metrics
    const metrics = this.calculateEngagementMetrics(engagements);
    
    // Calculate individual score components
    const scores = {
      engagementScore: this.calculateEngagementScore(metrics, algorithm),
      recencyScore: this.calculateRecencyScore(comment.createdAt, algorithm),
      qualityScore: this.calculateQualityScore(comment, algorithm),
      controversyScore: this.calculateControversyScore(metrics, algorithm),
      viralityScore: this.calculateViralityScore(engagements, algorithm),
      helpfulnessScore: this.calculateHelpfulnessScore(metrics, algorithm),
      authorityScore: this.calculateAuthorityScore(comment, algorithm),
      trendingScore: 0 // Will be calculated from other scores
    };

    // Calculate composite trending score
    scores.trendingScore = this.calculateTrendingScore(scores, algorithm);

    // Calculate trends
    const trends = this.calculateScoreTrends(engagements, comment.createdAt);

    const commentScore: CommentScore = {
      commentId: comment.commentId,
      calculatedAt: new Date(),
      scores,
      metrics,
      trends
    };

    // Validate and cache
    const validatedScore = validateCommentScore(commentScore);
    if (this.cacheEnabled) {
      this.cacheScore(cacheKey, validatedScore);
    }

    return validatedScore;
  }

  /**
   * Track comment engagement event
   */
  async trackEngagement(
    commentId: string,
    userId: string,
    engagementType: CommentEngagementType,
    contextData?: Record<string, unknown>
  ): Promise<CommentEngagement> {
    const engagement: CommentEngagement = {
      engagementId: uuidv4(),
      commentId,
      userId,
      engagementType,
      timestamp: new Date(),
      weight: this.getEngagementWeight(engagementType),
      contextData: contextData || {}
    };

    // TODO: Store in database
    console.log('Engagement tracked:', engagement);

    // Invalidate related caches
    this.invalidateCommentCaches(commentId);

    return engagement;
  }

  /**
   * Get comment analytics for a resource
   */
  async getCommentAnalytics(
    resourceId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<CommentAnalytics> {
    // TODO: Implement actual analytics aggregation from database
    
    const mockAnalytics: CommentAnalytics = {
      resourceId,
      timeRange,
      metrics: {
        totalComments: 342,
        totalEngagements: 1876,
        uniqueCommenters: 127,
        averageCommentsPerUser: 2.7,
        commentsGrowthRate: 15.3,
        engagementRate: 0.548,
        responseRate: 0.423,
        moderationRate: 0.018
      },
      trends: {
        commentVelocity: [],
        engagementTrends: [],
        sentimentTrends: [],
        topicEvolution: []
      },
      breakdowns: {
        byEngagementType: {
          'like': 756,
          'reply': 445,
          'share': 234,
          'helpful': 189,
          'dislike': 67,
          'report': 12
        },
        byUserType: {
          'verified': 89,
          'regular': 198,
          'new': 55
        },
        byTimeOfDay: Array(24).fill(0).map((_, i) => Math.floor(Math.random() * 50)),
        byDayOfWeek: Array(7).fill(0).map((_, i) => Math.floor(Math.random() * 100)),
        byLanguage: {
          'en': 298,
          'es': 24,
          'fr': 13,
          'de': 7
        },
        bySentiment: {
          positive: 234,
          neutral: 89,
          negative: 19
        }
      },
      insights: {
        mostEngagedTopics: ['performance', 'user experience', 'customization', 'integration'],
        influentialCommenters: ['user-123', 'user-456', 'user-789'],
        emergingTrends: ['mobile optimization', 'AI integration', 'accessibility'],
        contentRecommendations: ['Add mobile examples', 'Include accessibility guide'],
        moderationAlerts: [
          {
            type: 'spam_detection',
            severity: 'medium',
            message: '3 comments flagged as potential spam',
            commentIds: ['comment-1', 'comment-2', 'comment-3']
          }
        ]
      }
    };

    return mockAnalytics;
  }

  /**
   * Update trending algorithm configuration
   */
  updateAlgorithm(config: TrendingAlgorithmConfig): void {
    this.algorithms.set(config.algorithmId, config);
    
    // Clear related caches when algorithm changes
    this.clearAllCaches();
  }

  /**
   * Get available algorithms
   */
  getAlgorithms(): TrendingAlgorithmConfig[] {
    return Array.from(this.algorithms.values());
  }

  // Private helper methods

  private async calculateTrendingResults(request: GetTrendingCommentsRequest): Promise<TrendingResults> {
    // TODO: Fetch actual comments from database
    const mockComments = this.generateMockComments(request.resourceId, request.resourceType);
    
    // Calculate scores for all comments
    const scoredComments = await Promise.all(
      mockComments.map(async (comment) => {
        const mockEngagements = this.generateMockEngagements(comment.commentId);
        const score = await this.calculateCommentScore(comment, mockEngagements);
        return { ...comment, score };
      })
    );

    // Filter by minimum score if specified
    const qualifiedComments = request.minScore 
      ? scoredComments.filter(c => c.score.scores.trendingScore >= request.minScore!)
      : scoredComments;

    // Sort by requested order
    const sortedComments = this.sortComments(qualifiedComments, request.sortOrder);

    // Generate summary
    const summary = this.generateSummary(sortedComments);

    return {
      resourceId: request.resourceId,
      resourceType: request.resourceType,
      period: request.period,
      algorithmUsed: this.defaultAlgorithm,
      generatedAt: new Date(),
      totalComments: mockComments.length,
      qualifiedComments: qualifiedComments.length,
      trendingComments: sortedComments,
      summary,
      metadata: {
        calculationTimeMs: 0,
        cacheHit: false,
        dataFreshness: 0,
        algorithmVersion: '1.0.0'
      }
    };
  }

  private calculateEngagementMetrics(engagements: CommentEngagement[]) {
    const metrics = {
      totalLikes: 0,
      totalDislikes: 0,
      totalReplies: 0,
      totalShares: 0,
      totalHelpfulVotes: 0,
      totalReports: 0,
      replyEngagement: 0,
      viewCount: 0,
      uniqueEngagers: new Set<string>()
    };

    engagements.forEach(engagement => {
      metrics.uniqueEngagers.add(engagement.userId);
      
      switch (engagement.engagementType) {
        case 'like':
          metrics.totalLikes++;
          break;
        case 'dislike':
          metrics.totalDislikes++;
          break;
        case 'reply':
          metrics.totalReplies++;
          break;
        case 'share':
          metrics.totalShares++;
          break;
        case 'helpful':
          metrics.totalHelpfulVotes++;
          break;
        case 'report':
          metrics.totalReports++;
          break;
      }
    });

    return {
      totalLikes: metrics.totalLikes,
      totalDislikes: metrics.totalDislikes,
      totalReplies: metrics.totalReplies,
      totalShares: metrics.totalShares,
      totalHelpfulVotes: metrics.totalHelpfulVotes,
      totalReports: metrics.totalReports,
      replyEngagement: metrics.replyEngagement,
      viewCount: metrics.viewCount,
      uniqueEngagers: metrics.uniqueEngagers.size
    };
  }

  private calculateEngagementScore(metrics: any, algorithm: TrendingAlgorithmConfig): number {
    const weights = {
      like: 1,
      reply: 2,
      share: 3,
      helpful: 2.5,
      dislike: -0.5
    };

    const score = (
      metrics.totalLikes * weights.like +
      metrics.totalReplies * weights.reply +
      metrics.totalShares * weights.share +
      metrics.totalHelpfulVotes * weights.helpful +
      metrics.totalDislikes * weights.dislike
    );

    return Math.max(0, score);
  }

  private calculateRecencyScore(createdAt: Date, algorithm: TrendingAlgorithmConfig): number {
    const hoursAge = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    const halfLife = algorithm.parameters.timeDecayHalfLife;
    
    // Exponential decay: score = 100 * (0.5)^(age/halfLife)
    return 100 * Math.pow(0.5, hoursAge / halfLife);
  }

  private calculateQualityScore(comment: TrendingComment, algorithm: TrendingAlgorithmConfig): number {
    let score = 50; // Base score

    // Length factor (sweet spot around 100-300 characters)
    const length = comment.content.length;
    if (length >= 50 && length <= 500) {
      score += 20;
    } else if (length < 20 || length > 1000) {
      score -= 10;
    }

    // Has attachments
    if (comment.attachments.length > 0) {
      score += 15;
    }

    // Author reputation boost
    if (comment.authorReputation > 100) {
      score += Math.min(20, comment.authorReputation / 50);
    }

    // Verified author
    if (comment.authorVerified) {
      score += 10;
    }

    // Content type considerations
    if (comment.contentType === 'rich' || comment.contentType === 'markdown') {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateControversyScore(metrics: any, algorithm: TrendingAlgorithmConfig): number {
    const totalVotes = metrics.totalLikes + metrics.totalDislikes;
    if (totalVotes < 5) return 0;

    const ratio = Math.min(metrics.totalLikes, metrics.totalDislikes) / totalVotes;
    return ratio * 100; // Higher score for more balanced like/dislike ratio
  }

  private calculateViralityScore(engagements: CommentEngagement[], algorithm: TrendingAlgorithmConfig): number {
    // Calculate share velocity (shares in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentShares = engagements.filter(
      e => e.engagementType === 'share' && e.timestamp > oneHourAgo
    ).length;

    return Math.min(100, recentShares * 10);
  }

  private calculateHelpfulnessScore(metrics: any, algorithm: TrendingAlgorithmConfig): number {
    if (metrics.totalHelpfulVotes === 0) return 0;
    
    const totalEngagements = metrics.totalLikes + metrics.totalDislikes + metrics.totalReplies;
    if (totalEngagements === 0) return 0;

    return (metrics.totalHelpfulVotes / totalEngagements) * 100;
  }

  private calculateAuthorityScore(comment: TrendingComment, algorithm: TrendingAlgorithmConfig): number {
    let score = 0;

    // Base reputation score (capped at 50)
    score += Math.min(50, comment.authorReputation / 20);

    // Verified author bonus
    if (comment.authorVerified) {
      score += 25;
    }

    // Account age would be factored in here if we had that data
    // New account penalty/boost based on algorithm settings
    if (algorithm.parameters.boostNewAuthors) {
      score += 10; // Small boost for new authors
    }

    return Math.min(100, score);
  }

  private calculateTrendingScore(scores: any, algorithm: TrendingAlgorithmConfig): number {
    const weights = algorithm.weights;
    
    return (
      scores.engagementScore * weights.engagementWeight +
      scores.recencyScore * weights.recencyWeight +
      scores.qualityScore * weights.qualityWeight +
      scores.authorityScore * weights.authorityWeight +
      scores.controversyScore * weights.controversyWeight +
      scores.viralityScore * weights.viralityWeight
    );
  }

  private calculateScoreTrends(engagements: CommentEngagement[], createdAt: Date) {
    // Calculate hourly/daily growth rates
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentEngagements = engagements.filter(e => e.timestamp > oneHourAgo).length;
    const dailyEngagements = engagements.filter(e => e.timestamp > oneDayAgo).length;
    const weeklyEngagements = engagements.filter(e => e.timestamp > oneWeekAgo).length;

    return {
      hourlyGrowth: recentEngagements,
      dailyGrowth: dailyEngagements,
      weeklyGrowth: weeklyEngagements,
      peakEngagementHour: this.findPeakEngagementHour(engagements),
      velocityTrend: this.determineVelocityTrend(engagements)
    };
  }

  private findPeakEngagementHour(engagements: CommentEngagement[]): number {
    const hourCounts = Array(24).fill(0);
    
    engagements.forEach(engagement => {
      const hour = engagement.timestamp.getHours();
      hourCounts[hour]++;
    });

    return hourCounts.indexOf(Math.max(...hourCounts));
  }

  private determineVelocityTrend(engagements: CommentEngagement[]): 'accelerating' | 'steady' | 'declining' | 'stagnant' {
    if (engagements.length < 6) return 'stagnant';

    // Simple trend calculation based on recent vs older engagements
    const recent = engagements.filter(e => e.timestamp.getTime() > Date.now() - 2 * 60 * 60 * 1000).length;
    const older = engagements.filter(e => 
      e.timestamp.getTime() <= Date.now() - 2 * 60 * 60 * 1000 && 
      e.timestamp.getTime() > Date.now() - 4 * 60 * 60 * 1000
    ).length;

    if (recent > older * 1.5) return 'accelerating';
    if (recent < older * 0.5) return 'declining';
    return 'steady';
  }

  private sortComments(comments: TrendingComment[], sortOrder: CommentSortOrder): TrendingComment[] {
    switch (sortOrder) {
      case 'trending':
        return comments.sort((a, b) => b.score.scores.trendingScore - a.score.scores.trendingScore);
      case 'recent':
        return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'top_rated':
        return comments.sort((a, b) => b.score.scores.engagementScore - a.score.scores.engagementScore);
      case 'controversial':
        return comments.sort((a, b) => b.score.scores.controversyScore - a.score.scores.controversyScore);
      case 'oldest':
        return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      default:
        return comments;
    }
  }

  private generateSummary(comments: TrendingComment[]) {
    if (comments.length === 0) {
      return {
        averageScore: 0,
        totalEngagements: 0,
        uniqueParticipants: 0,
        conversationHealth: 'fair' as const,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
        topHashtags: [],
        emergingTopics: [],
        controversyLevel: 'low' as const
      };
    }

    const totalScore = comments.reduce((sum, c) => sum + c.score.scores.trendingScore, 0);
    const totalEngagements = comments.reduce((sum, c) => 
      sum + c.score.metrics.totalLikes + c.score.metrics.totalReplies + c.score.metrics.totalShares, 0
    );
    
    const uniqueAuthors = new Set(comments.map(c => c.authorId)).size;
    const avgControversy = comments.reduce((sum, c) => sum + c.score.scores.controversyScore, 0) / comments.length;

    return {
      averageScore: totalScore / comments.length,
      totalEngagements,
      uniqueParticipants: uniqueAuthors,
      conversationHealth: this.assessConversationHealth(comments),
      sentimentDistribution: this.calculateSentimentDistribution(comments),
      topHashtags: this.extractTopHashtags(comments),
      emergingTopics: this.identifyEmergingTopics(comments),
      controversyLevel: avgControversy > 30 ? 'high' : avgControversy > 15 ? 'medium' : 'low'
    };
  }

  private assessConversationHealth(comments: TrendingComment[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgQuality = comments.reduce((sum, c) => sum + c.score.scores.qualityScore, 0) / comments.length;
    const reportRate = comments.reduce((sum, c) => sum + c.score.metrics.totalReports, 0) / comments.length;
    
    if (avgQuality > 80 && reportRate < 0.1) return 'excellent';
    if (avgQuality > 65 && reportRate < 0.2) return 'good';
    if (avgQuality > 50 && reportRate < 0.5) return 'fair';
    return 'poor';
  }

  private calculateSentimentDistribution(comments: TrendingComment[]) {
    // Mock sentiment calculation - in real implementation would use NLP
    const total = comments.length;
    if (total === 0) return { positive: 0, neutral: 0, negative: 0 };

    return {
      positive: 0.65,
      neutral: 0.25,
      negative: 0.10
    };
  }

  private extractTopHashtags(comments: TrendingComment[]): string[] {
    const hashtagCounts = new Map<string, number>();
    
    comments.forEach(comment => {
      comment.hashtags.forEach(hashtag => {
        hashtagCounts.set(hashtag, (hashtagCounts.get(hashtag) || 0) + 1);
      });
    });

    return Array.from(hashtagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hashtag]) => hashtag);
  }

  private identifyEmergingTopics(comments: TrendingComment[]): string[] {
    // Mock topic identification - would use NLP/ML in real implementation
    return ['performance optimization', 'user experience', 'mobile support', 'accessibility'];
  }

  private getEngagementWeight(engagementType: CommentEngagementType): number {
    const weights = {
      'like': 1,
      'dislike': 1,
      'reply': 2,
      'share': 3,
      'helpful': 2.5,
      'report': 1
    };
    return weights[engagementType] || 1;
  }

  private generateCacheKey(request: GetTrendingCommentsRequest): string {
    return `trending:${request.resourceId}:${request.resourceType}:${request.period}:${request.sortOrder}:${this.defaultAlgorithm}`;
  }

  private getCachedTrendingResults(cacheKey: string): TrendingResults | null {
    const cached = this.trendingCache.get(cacheKey);
    if (!cached) return null;
    
    // Check if cache is stale (15 minutes TTL)
    const isStale = Date.now() - cached.timestamp > 15 * 60 * 1000;
    if (isStale) {
      this.trendingCache.delete(cacheKey);
      return null;
    }
    
    return cached.results;
  }

  private cacheTrendingResults(cacheKey: string, results: TrendingResults): void {
    this.trendingCache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });
  }

  private getCachedScore(cacheKey: string): CommentScore | null {
    const cached = this.scoreCache.get(cacheKey);
    if (!cached) return null;
    
    // Check if cache is stale (5 minutes TTL)
    const isStale = Date.now() - cached.timestamp > 5 * 60 * 1000;
    if (isStale) {
      this.scoreCache.delete(cacheKey);
      return null;
    }
    
    return cached.score;
  }

  private cacheScore(cacheKey: string, score: CommentScore): void {
    this.scoreCache.set(cacheKey, {
      score,
      timestamp: Date.now()
    });
  }

  private invalidateCommentCaches(commentId: string): void {
    // Remove all cache entries related to this comment
    for (const [key] of this.scoreCache) {
      if (key.includes(commentId)) {
        this.scoreCache.delete(key);
      }
    }
  }

  private clearAllCaches(): void {
    this.scoreCache.clear();
    this.trendingCache.clear();
  }

  private getDefaultAlgorithmConfig(): TrendingAlgorithmConfig {
    return {
      algorithmId: 'default',
      name: 'Default Trending Algorithm',
      description: 'Balanced algorithm considering engagement, recency, and quality',
      version: '1.0.0',
      enabled: true,
      weights: {
        engagementWeight: 0.4,
        recencyWeight: 0.25,
        qualityWeight: 0.15,
        authorityWeight: 0.1,
        controversyWeight: 0.05,
        viralityWeight: 0.05
      },
      parameters: {
        timeDecayHalfLife: 24,
        minEngagementThreshold: 3,
        controversyBoostFactor: 1.2,
        qualityThreshold: 60,
        authorMinReputation: 0,
        spamPenaltyFactor: 0.1,
        maxCommentAge: 168,
        boostNewAuthors: true
      },
      moderationRules: {
        autoFlag: {
          toxicityThreshold: 0.8,
          spamThreshold: 0.7,
          offTopicThreshold: 0.8
        },
        autoPromote: {
          qualityThreshold: 90,
          engagementThreshold: 20,
          authorReputationThreshold: 500
        }
      }
    };
  }

  // Mock data generators for development
  private generateMockComments(resourceId: string, resourceType: CommentableResourceType): TrendingComment[] {
    const comments: TrendingComment[] = [];
    const commentCount = Math.floor(Math.random() * 20) + 5;

    for (let i = 0; i < commentCount; i++) {
      comments.push({
        commentId: uuidv4(),
        resourceId,
        resourceType,
        authorId: uuidv4(),
        authorDisplayName: `User${i + 1}`,
        authorVerified: Math.random() > 0.8,
        authorReputation: Math.floor(Math.random() * 1000),
        content: this.generateMockCommentContent(),
        contentType: 'text',
        mentions: [],
        hashtags: this.generateMockHashtags(),
        attachments: [],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        isEdited: false,
        isPinned: false,
        isHighlighted: false,
        moderationStatus: 'approved',
        score: {} as CommentScore, // Will be populated later
        replyCount: Math.floor(Math.random() * 5),
        replyTree: [],
        visibility: 'public',
        language: 'en'
      });
    }

    return comments;
  }

  private generateMockCommentContent(): string {
    const contents = [
      "This template is incredibly useful! I've been looking for something like this for weeks.",
      "Great work on the design. The user experience is smooth and intuitive.",
      "Has anyone tried implementing this with the new API changes?",
      "I found a small bug in the validation logic. Should we open an issue?",
      "Perfect timing! This solves exactly the problem I was working on.",
      "The documentation could be improved, but the core functionality is solid.",
      "This is a game-changer for our workflow. Thank you for sharing!",
      "I made some modifications for our use case. Happy to share if interested."
    ];
    
    return contents[Math.floor(Math.random() * contents.length)];
  }

  private generateMockHashtags(): string[] {
    const allHashtags = ['ui', 'ux', 'design', 'frontend', 'react', 'performance', 'mobile', 'accessibility'];
    const count = Math.floor(Math.random() * 3);
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const hashtag = allHashtags[Math.floor(Math.random() * allHashtags.length)];
      if (!selected.includes(hashtag)) {
        selected.push(hashtag);
      }
    }
    
    return selected;
  }

  private generateMockEngagements(commentId: string): CommentEngagement[] {
    const engagements: CommentEngagement[] = [];
    const engagementCount = Math.floor(Math.random() * 20) + 1;
    
    const types: CommentEngagementType[] = ['like', 'dislike', 'reply', 'share', 'helpful', 'report'];
    
    for (let i = 0; i < engagementCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      engagements.push({
        engagementId: uuidv4(),
        commentId,
        userId: uuidv4(),
        engagementType: type,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        weight: this.getEngagementWeight(type),
        contextData: {}
      });
    }
    
    return engagements;
  }
}