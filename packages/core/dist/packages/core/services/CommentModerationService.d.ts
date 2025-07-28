import { CommentableResourceType } from '../types/TrendingCommentsTypes';
export interface CommentModerationRequest {
    commentId: string;
    action: CommentModerationAction;
    moderatorId: string;
    reason?: string;
    metadata?: Record<string, unknown>;
    notifyAuthor?: boolean;
    scheduledFor?: Date;
}
export interface CommentModerationAction {
    type: 'approve' | 'reject' | 'flag' | 'hide' | 'delete' | 'ban_author' | 'require_edit' | 'escalate';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    duration?: number;
    appealable?: boolean;
    escalateTo?: string;
}
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
}
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
}
export interface CommentModerationQueue {
    queueId: string;
    name: string;
    description: string;
    filters: CommentModerationFilters;
    priority: number;
    autoAssign: boolean;
    assignedModerators: string;
    slaMinutes: number;
    enableAutoModeration: boolean;
    escalationRules: EscalationRule;
}
export interface EscalationRule {
    condition: 'timeout' | 'toxicity_threshold' | 'report_count' | 'quality_threshold' | 'custom';
    threshold: number;
    action: 'escalate' | 'auto_reject' | 'require_supervisor' | 'flag_urgent';
    escalateTo?: string;
    notifyStakeholders: string;
}
export interface CommentModerationStats {
    totalComments: number;
    pendingReview: number;
    approvedToday: number;
    rejectedToday: number;
    flaggedComments: number;
    escalatedComments: number;
    avgProcessingTimeMinutes: number;
    moderatorWorkload: Array<{}, moderatorId>;
    string: any;
    assignedComments: number;
    completedToday: number;
    avgTimeMinutes: number;
    accuracy: number;
}
export interface BulkModerationRequest {
    commentIds: string;
    action: CommentModerationAction;
    moderatorId: string;
    reason: string;
    batchSize?: number;
    parallel?: boolean;
    validateBeforeAction?: boolean;
}
export interface BulkModerationResult {
    batchId: string;
    totalItems: number;
    successful: number;
    failed: number;
    results: CommentModerationResult;
    errors: Array<{}, commentId>;
    string: any;
    error: string;
}
export declare class CommentModerationService {
    private automatedService;
    private workflowService;
    private analyticsService;
    private baseUrl;
    private moderationQueues;
    private realtimeSubscriptions;
    constructor(baseUrl?: string);
    catch(error: any): void;
}
//# sourceMappingURL=CommentModerationService.d.ts.map