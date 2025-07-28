/**
 * Epic 16 User Flagging Service
 * Task: E16-1753114247010-121CC7 - Create flagging functionality
 *
 * Service that bridges user-initiated flagging with the existing ML flagging
 * infrastructure. Handles user reports, integrates with automated moderation,
 * and provides flagging status tracking.
 */
import { FlagSubmission, FlaggingStatus } from '../components/Flagging/FlaggingButton';
export interface UserFlagReport {
    id: string;
    contentId: string;
    contentType: 'template' | 'comment' | 'review' | 'user' | 'project';
    reporterId: string;
    reasonId: string;
    details?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'content' | 'security' | 'legal' | 'spam' | 'harassment' | 'other';
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    createdAt: Date;
    updatedAt: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    moderatorNote?: string;
    resolution?: FlagResolution;
    metadata: Record<string, unknown>;
}
export interface FlagResolution {
    action: 'approved' | 'removed' | 'edited' | 'warning_issued' | 'user_suspended' | 'no_action';
    reason: string;
    appealable: boolean;
    appealDeadline?: Date;
    notificationSent: boolean;
    precedentCase?: string;
}
export interface ContentFlagSummary {
    contentId: string;
    contentType: string;
    totalFlags: number;
    uniqueReporters: number;
    flagsByReason: Record<string, number>;
    averageSeverity: number;
    firstFlaggedAt: Date;
    lastFlaggedAt: Date;
    status: 'clean' | 'under_review' | 'violations_found' | 'content_removed';
    autoFlagged: boolean;
    mlConfidence?: number;
    moderationPriority: 'low' | 'medium' | 'high' | 'urgent';
}
export interface FlaggingAnalytics {
    timeRange: {,
        start: Date;
        end: Date;
    };
    totalReports: number;
    uniqueReporters: number;
    uniqueContent: number;
    reportsByReason: Record<string, number>;
    reportsBySeverity: Record<string, number>;
    resolutionStats: {,
        resolved: number;
        dismissed: number;
        pending: number;
        avgResolutionTimeHours: number;
    };
    topReporters: Array<{,
        userId: string;
        reportCount: number;
        accuracy: number;
    }>;
    contentTrends: {,
        mostFlaggedContentTypes: Record<string, number>;
        flagVolumeByHour: number[];
        flagVolumeByDay: number[];
    };
    moderationEfficiency: {,
        avgResponseTimeHours: number;
        accuracyRate: number;
        escalationRate: number;
    };
}
export interface FlaggingConfig {
    enableUserFlagging: boolean;
    maxFlagsPerUser24h: number;
    maxFlagsPerContent: number;
    autoEscalationThreshold: number;
    enableDuplicateDetection: boolean;
    requireJustification: string[];
    anonymousReporting: boolean;
    notifyContentOwner: boolean;
    integrationSettings: {,
        mlFlaggingWeight: number;
        userFlaggingWeight: number;
        combineScores: boolean;
        autoModerationThreshold: number;
    };
}
/**
 * User Flagging Service
 *
 * Handles user-initiated content flagging and integrates with the existing
 * ML flagging infrastructure for comprehensive content moderation.
 */
export declare class UserFlaggingService {
    private baseUrl;
    private config;
    private flagReports;
    private contentSummaries;
    constructor(baseUrl?: string, config?: Partial<FlaggingConfig>);
    /**
     * Submit a user flag report
     */
    submitFlag(submission: FlagSubmission): Promise<{
        reportId: string;
        status: 'accepted' | 'rejected' | 'duplicate';
        message: string;
        estimatedResolutionHours?: number;
    }>;
    /**
     * Get flagging status for content
     */
    getFlaggingStatus(contentId: string, userId?: string): Promise<FlaggingStatus>;
    /**
     * Get user's flag reports
     */
    getUserFlagReports(userId: string, options?: {)
        status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
        timeRange?: {
            start: Date;
            end: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        reports: UserFlagReport[];
        totalCount: number;
        stats: {,
            totalReports: number;
            pendingReports: number;
            resolvedReports: number;
            accuracyRate: number;
        };
    }>;
    /**
     * Get flagging analytics
     */
    getFlaggingAnalytics(timeRange?: {)
        start: Date;
        end: Date;
    }): Promise<FlaggingAnalytics>;
    /**
     * Update flag report status (for moderators)
     */
    updateFlagStatus(reportId: string, update: {)
        status: 'investigating' | 'resolved' | 'dismissed';
        moderatorId: string;
        moderatorNote?: string;
        resolution?: FlagResolution;
    }): Promise<void>;
    private validateFlagSubmission;
    private checkRateLimits;
    private checkForDuplicates;
    private createFlagReport;
    private integrateMlFlagging;
    private updateContentSummary;
    private checkAutoEscalation;
    private getContentSummary;
    private hasUserFlagged;
    private mapContentStatusToFlaggingStatus;
    private getLatestResolutionDate;
    private getLatestModeratorNote;
    private getSeverityForReason;
    private getCategoryForReason;
    private calculateEstimatedResolution;
    private determineContentStatus;
    private calculateModerationPriority;
    private calculateUserAccuracy;
    private aggregateByField;
    private calculateResolutionStats;
    private calculateTopReporters;
    private calculateContentTrends;
    private calculateModerationEfficiency;
    private notifyContentOwner;
    private notifyReporter;
}
export default UserFlaggingService;
//# sourceMappingURL=UserFlaggingService.d.ts.map