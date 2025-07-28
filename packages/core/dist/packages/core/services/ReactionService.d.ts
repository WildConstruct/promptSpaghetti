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
    }, percentage>;
    number: any;
    trend: 'increasing' | 'decreasing' | 'stable';
}
export interface ReactionBehaviorInsights {
    userId: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    totalReactions: number;
    favoriteReactions: string;
    reactionFrequency: Record<string, number>;
    contentAffinity: Array<{}, contentType>;
    string: any;
    reactionCount: number;
    preferredReactions: string;
}
export interface ReactionTrend {
    reactionType: string;
    timeRange: {
        start: Date;
        end: Date;
    };
    trendData: Array<{}, timestamp>;
    Date: any;
    count: number;
    cumulativeCount: number;
}
export interface BulkReactionOperation {
    operations: Array<{}, contentId>;
    string: any;
    userId: string;
    action: 'add' | 'remove' | 'change';
    reactionType: string;
    previousReaction?: string;
}
export interface ReactionModerationAction {
    actionType: 'hide' | 'remove' | 'flag' | 'approve' | 'escalate';
    reactionIds: string;
    moderatorId: string;
    reason: string;
    metadata?: Record<string, unknown>;
}
export interface ReactionConfig {
    enabledReactions: string;
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
        enabledReactions: string;
        maxReactions?: number;
        requireAuth?: boolean;
    }>;
}
export declare class ReactionService {
    private baseUrl;
    private config;
    private reactions;
    private summaries;
    private realtimeSubscriptions;
    constructor(baseUrl?: string, config?: Partial<ReactionConfig>);
}
//# sourceMappingURL=ReactionService.d.ts.map