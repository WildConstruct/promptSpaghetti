/**
 * Epic 16 Comment Moderation Service
 * Task: E16-1753114247008-F23213 - Develop comment moderation
 *
 * Specialized service for comment moderation that integrates with existing
 * moderation infrastructure. Provides comment-specific moderation capabilities,
 * bulk operations, and real-time processing.
 */
import { CommentableResourceType } from '../types/TrendingCommentsTypes';

export interface CommentModerationRequest {
    commentId: string;
    action: CommentModerationAction;
    moderatorId: string;
    reason?: string;
    metadata?: Record<string, unknown>;
    notifyAuthor?: boolean;
    scheduledFor?: Date;

export interface CommentModerationAction {
    type: 'approve' | 'reject' | 'flag' | 'hide' | 'delete' | 'ban_author' | 'require_edit' | 'escalate';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    duration?: number;
    appealable?: boolean;
    escalateTo?: string;

export interface CommentModerationResult {
    commentId: string;
    action: CommentModerationAction;
    status: 'success' | 'failed' | 'pending';
    moderatorId: string;
    timestamp: Date;
    previousState?: string;
    newState: string;
    appealDeadline?: Date;
    notificationSent: boolean;
    workflowId?: string;
    error?: string;

export interface CommentModerationFilters {
    resourceId?: string;
    resourceType?: CommentableResourceType;
    status?: 'pending' | 'approved' | 'rejected' | 'flagged' | 'hidden' | 'deleted';
    moderatorId?: string;
    authorId?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    toxicityRange?: {
        min: number;
        max: number;
    };
    qualityRange?: {
        min: number;
        max: number;
    };
    reportCount?: {
        min: number;
        max?: number;
    };
    sentiment?: 'positive' | 'neutral' | 'negative' | 'very_negative';
    hasReports?: boolean;
    isEscalated?: boolean;
    requiresReview?: boolean;
    sortBy?: 'created_at' | 'updated_at' | 'toxicity' | 'quality' | 'reports' | 'priority';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;

export interface CommentModerationQueue {
    queueId: string;
    name: string;
    description: string;
    filters: CommentModerationFilters;
    priority: number;
    autoAssign: boolean;
    assignedModerators: string[];
    slaMinutes: number;
    enableAutoModeration: boolean;
    escalationRules: EscalationRule[];

export interface EscalationRule {
    condition: 'timeout' | 'toxicity_threshold' | 'report_count' | 'quality_threshold' | 'custom';
    threshold: number;
    action: 'escalate' | 'auto_reject' | 'require_supervisor' | 'flag_urgent';
    escalateTo?: string;
    notifyStakeholders: string[];

export interface CommentModerationStats {
    totalComments: number;
    pendingReview: number;
    approvedToday: number;
    rejectedToday: number;
    flaggedComments: number;
    escalatedComments: number;
    avgProcessingTimeMinutes: number;
    moderatorWorkload: Array<{,
        moderatorId: string;
        assignedComments: number;
        completedToday: number;
        avgTimeMinutes: number;
        accuracy: number;
    }>;
    toxicityDistribution: {,
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    qualityDistribution: {,
        excellent: number;
        good: number;
        fair: number;
        poor: number;
    };
    recentTrends: {,
        volumeChange24h: number;
        toxicityChange24h: number;
        qualityChange24h: number;
    };

export interface BulkModerationRequest {
    commentIds: string[];
    action: CommentModerationAction;
    moderatorId: string;
    reason: string;
    batchSize?: number;
    parallel?: boolean;
    validateBeforeAction?: boolean;

export interface BulkModerationResult {
    batchId: string;
    totalItems: number;
    successful: number;
    failed: number;
    results: CommentModerationResult[];
    errors: Array<{,
        commentId: string;
        error: string;
    }>;
    processingTimeMs: number;
    summary: Record<string, number>;
/**
 * Comment Moderation Service
 *
 * Provides specialized moderation capabilities for comments, integrating
 * with existing moderation infrastructure while adding comment-specific features.
 */
export declare class CommentModerationService {
    private automatedService;
    private workflowService;
    private analyticsService;
    private baseUrl;
    private moderationQueues;
    private realtimeSubscriptions;
    constructor(baseUrl?: string);
    /**
     * Moderate a single comment
     */
    moderateComment(request: CommentModerationRequest): Promise<CommentModerationResult>;
    /**
     * Execute bulk moderation actions
     */
    bulkModerateComments(request: BulkModerationRequest): Promise<BulkModerationResult>;
    /**
     * Get moderation queue with filtering
     */
    getModerationQueue(queueId: string, filters?: CommentModerationFilters): Promise<{
        items: any[];
        totalCount: number;
        queueInfo: CommentModerationQueue;
        stats: Partial<CommentModerationStats>;
    }>;
    /**
     * Get comprehensive moderation statistics
     */
    getModerationStats(timeRange?: {)
        start: Date;
        end: Date;
    }): Promise<CommentModerationStats>;
    /**
     * Create or update moderation queue
     */
    createModerationQueue(queue: CommentModerationQueue): Promise<void>;
    /**
     * Subscribe to real-time moderation updates
     */
    subscribeToModerationUpdates(subscriberId: string, filters: CommentModerationFilters, callback: (update: any) => void): Promise<void>;
    /**
     * Auto-moderate comments based on ML analysis
     */
    autoModerateComments(resourceId: string, resourceType: CommentableResourceType, options?: {)
        toxicityThreshold?: number;
        qualityThreshold?: number;
        spamThreshold?: number;
        enableAutoApproval?: boolean;
        enableAutoRejection?: boolean;
    }): Promise<{
        processed: number;
        autoApproved: number;
        autoRejected: number;
        flaggedForReview: number;
        errors: number;
    }>;
    private initializeDefaultQueues;
    private validateModerationRequest;
    private getCommentData;
    private executeModerationAction;
    private approveComment;
    private rejectComment;
    private flagComment;
    private hideComment;
    private deleteComment;
    private escalateComment;
    private updateModerationAnalytics;
    private sendModerationNotification;
    private chunkArray;
    private processBatchParallel;
    private processBatchSequential;
    private fetchCommentsForModeration;
    private calculateQueueStats;
    private getBasicModerationStats;
    private getModeratorWorkloadStats;
    private getDistributionStats;
    private getTrendStats;
    private validateQueueConfig;
    private setupAutoAssignment;
    private makeAutoModerationDecision;

export default CommentModerationService;
//# sourceMappingURL=CommentModerationService.d.ts.map