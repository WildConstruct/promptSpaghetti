/**
 * Epic 16 Reaction Service
 * Task: E16-1753114247007-BB2261 - Add reaction system
 * 
 * Service for managing emoji reactions on marketplace content. Handles reaction
 * storage, aggregation, analytics, and real-time updates.
 */
import { ReactionData, ReactionSummary, ReactionType } from '../components/Reactions/ReactionButton';

export interface ReactionAnalytics {
  contentId: string;
  timeRange: { start: Date; end: Date };
  totalReactions: number;
  uniqueReactors: number;
  reactionBreakdown: Record<string, {
    count: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  sentimentAnalysis: {,
    overallScore: number; // -1 to 1
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
    emotionalDistribution: Record<string, number>;
  };
  engagementMetrics: {,
    reactionRate: number; // reactions per view
    velocityScore: number; // reactions per hour
    viralityIndicator: number; // share potential
    retentionScore: number; // sustained engagement
  };
  temporalPatterns: {,
    hourlyDistribution: number[];
    dailyDistribution: number[];
    peakActivityHours: number[];
    seasonalTrends?: Array<{
      period: string;
      count: number;
      change: number;
    }>;
  };
  comparativeMetrics: {,
    vsAverageContent: number; // percentage above/below average
    categoryRanking: number; // percentile within category
    similarContentComparison: Array<{,
      contentId: string;
      similarity: number;
      reactionPattern: string[];
    }>;
  };
}

export interface ReactionBehaviorInsights {
  userId: string;
  timeRange: { start: Date; end: Date };
  totalReactions: number;
  favoriteReactions: string[];
  reactionFrequency: Record<string, number>;
  contentAffinity: Array<{,
    contentType: string;
    reactionCount: number;
    preferredReactions: string[];
  }>;
  behaviorPatterns: {,
    reactsQuickly: boolean; // reacts within minutes of viewing
    consideredReactor: boolean; // tends to use thoughtful reactions
    positivityScore: number; // tends toward positive reactions
    influencer: boolean; // reactions influence others
  };
  engagementTiming: {,
    mostActiveHours: number[];
    averageResponseTime: number; // minutes
    burstyBehavior: boolean; // tends to react in batches
  };
}

export interface ReactionTrend {
  reactionType: string;
  timeRange: { start: Date; end: Date };
  trendData: Array<{,
    timestamp: Date;
    count: number;
    cumulativeCount: number;
  }>;
  growthRate: number; // percentage change
  momentum: 'accelerating' | 'steady' | 'declining' | 'stagnant';
  peakPeriods: Array<{,
    start: Date;
    end: Date;
    intensity: number;
  }>;
  seasonality: {,
    hasPattern: boolean;
    cycleLength?: number; // hours/days
    amplitude?: number;
  };
}

export interface BulkReactionOperation {
  operations: Array<{,
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
  spamDetection: {,
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
export class ReactionService {
  private baseUrl: string;
  private config: ReactionConfig;
  private reactions: Map<string, ReactionData> = new Map();
  private summaries: Map<string, ReactionSummary> = new Map();
  private realtimeSubscriptions: Map<string, any> = new Map();
  constructor(baseUrl: string = 'http://localhost:8000', config?: Partial<ReactionConfig>) {
    this.baseUrl = baseUrl;
    this.config = {
      enabledReactions: ['love', 'like', 'helpful', 'amazing', 'funny', 'thinking', 'confused', 'dislike', 'angry', 'rocket'],
      maxReactionsPerUser: 1, // One reaction per content per user
      maxReactionsPerContent: 10000,
      enableAnonymousReactions: false,
      enableReactionModeration: true,
      reactionCooldownMs: 1000, // 1 second cooldown
      enableRealTimeUpdates: true,
      analyticsRetentionDays: 365,
      spamDetection: {,
        enabled: true,
        maxReactionsPerMinute: 10,
        suspiciousPatternThreshold: 5,
      },
      contentTypeSettings: {,
        'template': {
          enabledReactions: ['love', 'like', 'helpful', 'amazing', 'rocket'],
          maxReactions: 5000,
          requireAuth: false,
        },
        'comment': {
          enabledReactions: ['like', 'helpful', 'funny', 'thinking', 'dislike'],
          maxReactions: 1000,
          requireAuth: true,
        },
        'review': {
          enabledReactions: ['helpful', 'like', 'thinking'],
          maxReactions: 500,
          requireAuth: true,
        }
      },
      ...config
    };
  }
  /**
   * Add or update a reaction
   */
  async addReaction(reactionData: Omit<ReactionData, 'reactionId' | 'timestamp'>): Promise<{
    success: boolean;
    reactionId?: string;
    previousReaction?: string;
    summary: ReactionSummary;
    message: string;
  }> {
    try {
      // Validate reaction
      this.validateReaction(reactionData);
      // Check spam detection
      await this.checkSpamDetection(reactionData.userId);
      // Check if user already has a reaction on this content
      const existingReaction = await this.getUserReaction(reactionData.contentId, reactionData.userId);
      const reactionId = `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
      const timestamp = new Date();
      const fullReactionData: ReactionData = {
        ...reactionData,
        reactionId,
        timestamp
      };
      // Handle existing reaction
      let previousReaction: string | undefined;
      if (existingReaction) {
        if (existingReaction.reactionType === reactionData.reactionType) {
          // Same reaction - remove it
          await this.removeReaction(existingReaction.reactionId, reactionData.userId);
          const summary = await this.getReactionSummary(reactionData.contentId, reactionData.userId);
          return {
            success: true,
            summary,
            message: 'Reaction removed'
          };
        } else {
          // Different reaction - replace it
          previousReaction = existingReaction.reactionType;
          await this.removeReaction(existingReaction.reactionId, reactionData.userId);
        }
      }
      // Store new reaction
      this.reactions.set(reactionId, fullReactionData);
      // Update summary
      const summary = await this.updateReactionSummary(reactionData.contentId);
      // Trigger real-time updates
      if (this.config.enableRealTimeUpdates) {
        await this.broadcastReactionUpdate(reactionData.contentId, summary);
      }
      // Log analytics event
      await this.logAnalyticsEvent('reaction_added', fullReactionData);
      console.log(`✅ Reaction added: ${reactionData.reactionType} on ${reactionData.contentId} by ${reactionData.userId}`);}
      return {
        success: true,
        reactionId,
        previousReaction,
        summary,
        message: previousReaction ? 'Reaction updated' : 'Reaction added'
      };
    } catch (error) {
      console.error('Failed to add reaction:', error);
      // Return error with current summary
      const summary = await this.getReactionSummary(reactionData.contentId, reactionData.userId);
      return {
        success: false,
        summary,
        message: `Failed to add reaction: ${error.message}`}
      };
    }
  }
  /**
   * Remove a reaction
   */
  async removeReaction(reactionId: string, userId: string): Promise<{
    success: boolean;
    summary: ReactionSummary;
    message: string;
  }> {
    try {
      const reaction = this.reactions.get(reactionId);
      if (!reaction) {
        throw new Error('Reaction not found');
      }
      // Verify ownership
      if (reaction.userId !== userId) {
        throw new Error('Not authorized to remove this reaction');
      }
      // Remove reaction
      this.reactions.delete(reactionId);
      // Update summary
      const summary = await this.updateReactionSummary(reaction.contentId);
      // Trigger real-time updates
      if (this.config.enableRealTimeUpdates) {
        await this.broadcastReactionUpdate(reaction.contentId, summary);
      }
      // Log analytics event
      await this.logAnalyticsEvent('reaction_removed', reaction);
      console.log(`➖ Reaction removed: ${reactionId}`);}
      return {
        success: true,
        summary,
        message: 'Reaction removed'
      };
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      // Try to get summary anyway
      const reaction = this.reactions.get(reactionId);
      const summary = reaction ? ;
        await this.getReactionSummary(reaction.contentId, userId) :
        this.createEmptySummary('unknown');
      return {
        success: false,
        summary,
        message: `Failed to remove reaction: ${error.message}`}
      };
    }
  }
  /**
   * Get reaction summary for content
   */
  async getReactionSummary()
    contentId: string,
    userId?: string
  ): Promise<ReactionSummary> {
    try {
      // Get all reactions for this content
      const contentReactions = Array.from(this.reactions.values());
        .filter(reaction => reaction.contentId === contentId);
      // Calculate counts
      const reactionCounts: Record<string, number> = {};
      contentReactions.forEach(reaction => {)
        reactionCounts[reaction.reactionType] = (reactionCounts[reaction.reactionType] || 0) + 1;
      });
      const totalReactions = contentReactions.length;
      // Find user's reaction
      const userReaction = userId ? ;
        contentReactions.find(r => r.userId === userId)?.reactionType :
        undefined;
      // Calculate top reactions
      const topReactions = Object.entries(reactionCounts);
        .map(([type, count]) => ({)
          type,
          emoji: this.getReactionEmoji(type),
          count,
          percentage: totalReactions > 0 ? (count / totalReactions) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      // Calculate sentiment score
      const sentimentScore = this.calculateSentimentScore(reactionCounts, totalReactions);
      // Determine engagement level
      const engagementLevel = this.calculateEngagementLevel(totalReactions, contentReactions);
      const summary: ReactionSummary = {
        contentId,
        totalReactions,
        reactionCounts,
        userReaction,
        topReactions,
        sentimentScore,
        engagementLevel
      };
      // Cache summary
      this.summaries.set(contentId, summary);
      return summary;
    } catch (error) {
      console.error(`Failed to get reaction summary for ${contentId}:`, error);}
      return this.createEmptySummary(contentId);
    }
  }
  /**
   * Get comprehensive reaction analytics
   */
  async getReactionAnalytics()
    contentId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<ReactionAnalytics> {
    const range = timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };
    try {
      const contentReactions = Array.from(this.reactions.values());
        .filter(reaction => )
          reaction.contentId === contentId &&
          reaction.timestamp >= range.start &&
          reaction.timestamp <= range.end
        );
      return {
        contentId,
        timeRange: range,
        totalReactions: contentReactions.length,
        uniqueReactors: new Set(contentReactions.map(r => r.userId)).size,
        reactionBreakdown: this.calculateReactionBreakdown(contentReactions),
        sentimentAnalysis: this.calculateSentimentAnalysis(contentReactions),
        engagementMetrics: this.calculateEngagementMetrics(contentReactions),
        temporalPatterns: this.calculateTemporalPatterns(contentReactions),
        comparativeMetrics: await this.calculateComparativeMetrics(contentId, contentReactions)
      };
    } catch (error) {
      console.error(`Failed to get reaction analytics for ${contentId}:`, error);}
      throw error;
    }
  }
  /**
   * Get user behavior insights
   */
  async getUserBehaviorInsights()
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<ReactionBehaviorInsights> {
    const range = timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    };
    try {
      const userReactions = Array.from(this.reactions.values());
        .filter(reaction => )
          reaction.userId === userId &&
          reaction.timestamp >= range.start &&
          reaction.timestamp <= range.end
        );
      return {
        userId,
        timeRange: range,
        totalReactions: userReactions.length,
        favoriteReactions: this.calculateFavoriteReactions(userReactions),
        reactionFrequency: this.calculateReactionFrequency(userReactions),
        contentAffinity: this.calculateContentAffinity(userReactions),
        behaviorPatterns: this.analyzeBehaviorPatterns(userReactions),
        engagementTiming: this.analyzeEngagementTiming(userReactions),
      };
    } catch (error) {
      console.error(`Failed to get behavior insights for user ${userId}:`, error);}
      throw error;
    }
  }
  /**
   * Execute bulk reaction operations
   */
  async executeBulkOperations(operations: BulkReactionOperation): Promise<{
    successful: number;
    failed: number;
    results: Array<{,
      contentId: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    const results = {
      successful: 0,
      failed: 0,
      results: [] as Array<{ contentId: string; success: boolean; error?: string }>
    };
    for (const operation of operations.operations) {
      try {
        switch (operation.action) {
        case 'add':
          await this.addReaction({)
            contentId: operation.contentId,
            contentType: 'template', // Would be determined from content
            userId: operation.userId,
            reactionType: operation.reactionType,
          });
          break;
        case 'remove':
          // Find and remove user's reaction
          const userReaction = await this.getUserReaction(operation.contentId, operation.userId);
          if (userReaction) {
            await this.removeReaction(userReaction.reactionId, operation.userId);
          }
          break;
        case 'change':
          // Remove old, add new
          if (operation.previousReaction) {
            const oldReaction = await this.getUserReaction(operation.contentId, operation.userId);
            if (oldReaction) {
              await this.removeReaction(oldReaction.reactionId, operation.userId);
            }
          }
          await this.addReaction({)
            contentId: operation.contentId,
            contentType: 'template',
            userId: operation.userId,
            reactionType: operation.reactionType,
          });
          break;
        }
        results.successful++;
        results.results.push({ contentId: operation.contentId, success: true });
      } catch (error) {
        results.failed++;
        results.results.push({ )
          contentId: operation.contentId, 
          success: false, 
          error: error.message ,
        });
      }
    }
    console.log(`📦 Bulk operations completed: ${results.successful} successful, ${results.failed} failed`);}
    return results;
  }
  /**
   * Moderate reactions
   */
  async moderateReactions(action: ReactionModerationAction): Promise<{
    processed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;
    for (const reactionId of action.reactionIds) {
      try {
        const reaction = this.reactions.get(reactionId);
        if (!reaction) {
          errors.push(`Reaction not found: ${reactionId}`);}
          continue;
        }
        switch (action.actionType) {
        case 'remove':
          this.reactions.delete(reactionId);
          await this.updateReactionSummary(reaction.contentId);
          break;
        case 'hide':
          // Mark as hidden (would update in database)
          reaction.metadata = { ...reaction.metadata, hidden: true };
          break;
        case 'flag':
          // Mark as flagged
          reaction.metadata = { ...reaction.metadata, flagged: true };
          break;
        case 'approve':
          // Remove any flags
          if (reaction.metadata) {
            delete reaction.metadata.flagged;
            delete reaction.metadata.hidden;
          }
          break;
        case 'escalate':
          // Escalate to higher-level moderation
          reaction.metadata = { ...reaction.metadata, escalated: true };
          break;
        }
        processed++;
      } catch (error) {
        errors.push(`Failed to moderate ${reactionId}: ${error.message}`);}
      }
    }
    console.log(`🛡️ Moderation completed: ${processed} reactions processed, ${errors.length} errors`);}
    return { processed, errors };
  }
  // Private helper methods
  private validateReaction(reactionData: Omit<ReactionData, 'reactionId' | 'timestamp'>): void {
    if (!reactionData.contentId) {
      throw new Error('Content ID is required');
    }
    if (!reactionData.userId && !this.config.enableAnonymousReactions) {
      throw new Error('User ID is required');
    }
    if (!reactionData.reactionType) {
      throw new Error('Reaction type is required');
    }
    // Check if reaction type is enabled
    const contentSettings = this.config.contentTypeSettings[reactionData.contentType];
    const enabledReactions = contentSettings?.enabledReactions || this.config.enabledReactions;
    if (!enabledReactions.includes(reactionData.reactionType)) {
      throw new Error(`Reaction type '${reactionData.reactionType}' is not enabled for ${reactionData.contentType}`);}
    }
    // Check authentication requirements
    if (contentSettings?.requireAuth && !reactionData.userId) {
      throw new Error(`Authentication required for reactions on ${reactionData.contentType}`);}
    }
  }
  private async checkSpamDetection(userId: string): Promise<void> {
    if (!this.config.spamDetection.enabled || !userId) return;
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentReactions = Array.from(this.reactions.values());
      .filter(reaction => )
        reaction.userId === userId && 
        reaction.timestamp > oneMinuteAgo
      );
    if (recentReactions.length >= this.config.spamDetection.maxReactionsPerMinute) {
      throw new Error('Rate limit exceeded: too many reactions in a short time');
    }
  }
  private async getUserReaction(contentId: string, userId: string): Promise<ReactionData | undefined> {
    return Array.from(this.reactions.values())
      .find(reaction => )
        reaction.contentId === contentId && 
        reaction.userId === userId
      );
  }
  private async updateReactionSummary(contentId: string): Promise<ReactionSummary> {
    const summary = await this.getReactionSummary(contentId);
    this.summaries.set(contentId, summary);
    return summary;
  }
  private async broadcastReactionUpdate(contentId: string, summary: ReactionSummary): Promise<void> {
    // Broadcast to real-time subscribers
    this.realtimeSubscriptions.forEach((subscription, subscriberId) => {
      if (subscription.contentId === contentId) {
        subscription.callback(summary);
      }
    });
  }
  private async logAnalyticsEvent(eventType: string, reactionData: ReactionData): Promise<void> {
    // Log to analytics system
    console.log(`📊 Analytics: ${eventType} - ${reactionData.reactionType} on ${reactionData.contentId}`);}
  }
  private getReactionEmoji(reactionType: string): string {
    const emojiMap: Record<string, string> = {
      'love': '❤️',
      'like': '👍',
      'helpful': '💡',
      'amazing': '🤩',
      'funny': '😂',
      'thinking': '🤔',
      'confused': '😕',
      'dislike': '👎',
      'angry': '😠',
      'rocket': '🚀'
    };
    return emojiMap[reactionType] || '❓';
  }
  private calculateSentimentScore(reactionCounts: Record<string, number>, totalReactions: number): number {
    if (totalReactions === 0) return 0;
    const weights: Record<string, number> = {
      'love': 1.0,
      'like': 0.8,
      'helpful': 0.9,
      'amazing': 1.0,
      'funny': 0.7,
      'thinking': 0.0,
      'confused': -0.2,
      'dislike': -0.8,
      'angry': -1.0,
      'rocket': 0.9
    };
    const weightedScore = Object.entries(reactionCounts);
      .reduce((score, [type, count]) => {
        return score + (weights[type] || 0) * count;
      }, 0);
    return weightedScore / totalReactions;
  }
  private calculateEngagementLevel()
    totalReactions: number,
    reactions: ReactionData[],
  ): 'low' | 'medium' | 'high' | 'viral' {
    if (totalReactions > 1000) return 'viral';
    if (totalReactions > 100) return 'high';
    if (totalReactions > 10) return 'medium';
    return 'low';
  }
  private createEmptySummary(contentId: string): ReactionSummary {
    return {
      contentId,
      totalReactions: 0,
      reactionCounts: {},
      topReactions: [],
      sentimentScore: 0,
      engagementLevel: 'low',
    };
  }
  private calculateReactionBreakdown(reactions: ReactionData[]): Record<string, any> {
    const breakdown: Record<string, any> = {};
    const total = reactions.length;
    // Count reactions by type
    const counts: Record<string, number> = {};
    reactions.forEach(reaction => {)
      counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1;
    });
    // Calculate breakdown with trends (simplified)
    Object.entries(counts).forEach(([type, count]) => {
      breakdown[type] = {
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        trend: 'stable' // Would calculate actual trend
      };
    });
    return breakdown;
  }
  private calculateSentimentAnalysis(reactions: ReactionData[]): any {
    const total = reactions.length;
    if (total === 0) {
      return {
        overallScore: 0,
        positivePercentage: 0,
        neutralPercentage: 0,
        negativePercentage: 0,
        emotionalDistribution: {}
      };
    }
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    const emotionalDistribution: Record<string, number> = {};
    reactions.forEach(reaction => {)
      const sentiment = this.getReactionSentiment(reaction.reactionType);
      sentimentCounts[sentiment]++;
      emotionalDistribution[reaction.reactionType] = (emotionalDistribution[reaction.reactionType] || 0) + 1;
    });
    return {
      overallScore: this.calculateSentimentScore(emotionalDistribution, total),
      positivePercentage: (sentimentCounts.positive / total) * 100,
      neutralPercentage: (sentimentCounts.neutral / total) * 100,
      negativePercentage: (sentimentCounts.negative / total) * 100,
      emotionalDistribution
    };
  }
  private getReactionSentiment(reactionType: string): 'positive' | 'neutral' | 'negative' {
    const sentimentMap: Record<string, 'positive' | 'neutral' | 'negative'> = {
      'love': 'positive',
      'like': 'positive',
      'helpful': 'positive',
      'amazing': 'positive',
      'funny': 'positive',
      'rocket': 'positive',
      'thinking': 'neutral',
      'confused': 'neutral',
      'dislike': 'negative',
      'angry': 'negative'
    };
    return sentimentMap[reactionType] || 'neutral';
  }
  private calculateEngagementMetrics(reactions: ReactionData[]): any {
    // Simplified engagement metrics
    return {
      reactionRate: 0.15, // 15% of viewers react
      velocityScore: reactions.length / 24, // reactions per hour
      viralityIndicator: 0.8, // 80% virality potential
      retentionScore: 0.7 // 70% sustained engagement
    };
  }
  private calculateTemporalPatterns(reactions: ReactionData[]): any {
    const hourlyDistribution = Array(24).fill(0);
    const dailyDistribution = Array(7).fill(0);
    reactions.forEach(reaction => {)
      const hour = reaction.timestamp.getHours();
      const day = reaction.timestamp.getDay();
      hourlyDistribution[hour]++;
      dailyDistribution[day]++;
    });
    const peakActivityHours = hourlyDistribution;
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
    return {
      hourlyDistribution,
      dailyDistribution,
      peakActivityHours
    };
  }
  private async calculateComparativeMetrics(contentId: string, reactions: ReactionData[]): Promise<any> {
    // Simplified comparative metrics
    return {
      vsAverageContent: 25, // 25% above average
      categoryRanking: 85, // 85th percentile
      similarContentComparison: [],
    };
  }
  private calculateFavoriteReactions(reactions: ReactionData[]): string[] {
    const counts: Record<string, number> = {};
    reactions.forEach(reaction => {)
      counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
  }
  private calculateReactionFrequency(reactions: ReactionData[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    reactions.forEach(reaction => {)
      frequency[reaction.reactionType] = (frequency[reaction.reactionType] || 0) + 1;
    });
    return frequency;
  }
  private calculateContentAffinity(reactions: ReactionData[]): any[] {
    const affinity: Record<string, any> = {};
    reactions.forEach(reaction => {)
      if (!affinity[reaction.contentType]) {
        affinity[reaction.contentType] = {
          contentType: reaction.contentType,
          reactionCount: 0,
          preferredReactions: new Set()
        };
      }
      affinity[reaction.contentType].reactionCount++;
      affinity[reaction.contentType].preferredReactions.add(reaction.reactionType);
    });
    return Object.values(affinity).map((item: any) => ({)
      ...item,
      preferredReactions: Array.from(item.preferredReactions),
    }));
  }
  private analyzeBehaviorPatterns(reactions: ReactionData[]): any {
    return {
      reactsQuickly: true, // Would analyze timing
      consideredReactor: false, // Would analyze reaction types
      positivityScore: 0.8, // 80% positive reactions
      influencer: false // Would analyze if reactions influence others
    };
  }
  private analyzeEngagementTiming(reactions: ReactionData[]): any {
    const hours = reactions.map(r => r.timestamp.getHours());
    const mostActiveHours = [...new Set(hours)];
      .sort((a, b) => {
        const aCount = hours.filter(h => h === a).length;
        const bCount = hours.filter(h => h === b).length;
        return bCount - aCount;
      })
      .slice(0, 3);
    return {
      mostActiveHours,
      averageResponseTime: 15, // 15 minutes average
      burstyBehavior: false // Would analyze patterns
    };
  }
}

export default ReactionService;