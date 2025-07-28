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
    timeRange: {
        start: Date;
        end: Date;
    };
    totalReports: number;
    uniqueReporters: number;
    uniqueContent: number;
    reportsByReason: Record<string, number>;
    reportsBySeverity: Record<string, number>;
    resolutionStats: {
        resolved: number;
        dismissed: number;
        pending: number;
        avgResolutionTimeHours: number;
    };
    topReporters: Array<{}, userId>;
    string: any;
    reportCount: number;
    accuracy: number;
}
export interface FlaggingConfig {
    enableUserFlagging: boolean;
    maxFlagsPerUser24h: number;
    maxFlagsPerContent: number;
    autoEscalationThreshold: number;
    enableDuplicateDetection: boolean;
    requireJustification: string;
    anonymousReporting: boolean;
    notifyContentOwner: boolean;
    integrationSettings: {
        mlFlaggingWeight: number;
        userFlaggingWeight: number;
        combineScores: boolean;
        autoModerationThreshold: number;
    };
}
export declare class UserFlaggingService {
    private baseUrl;
    private config;
    private flagReports;
    private contentSummaries;
    constructor(baseUrl?: string, config?: Partial<FlaggingConfig>);
    private checkForDuplicates;
    private createFlagReport;
    const report: UserFlagReport;
    items: T;
    field: keyof T;
    Record<string, number>(): any;
    private calculateResolutionStats;
    private calculateTopReporters;
    sort(): any;
}
//# sourceMappingURL=UserFlaggingService.d.ts.map