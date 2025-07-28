export declare enum RevisionRequestStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    ADDITIONAL_INFO_REQUESTED = "additional_info_requested",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled",
    IMPLEMENTED = "implemented",
    export,
    enum,
    RevisionRequestPriority
}
export interface RevisionRequestInsight {
    type: 'bottleneck' | 'opportunity' | 'risk' | 'trend';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    confidence: number;
    data: Record<string, any>;
    recommendedActions: string;
    relatedRequests?: string;
}
export interface RevisionRequestRecommendation {
    category: 'process_improvement' | 'resource_allocation' | 'automation' | 'training';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementation: {
        complexity: 'low' | 'medium' | 'high';
        timeframe: string;
        requirements: string;
    };
    metrics: string;
}
export interface RevisionRequestExportRequest {
    format: 'csv' | 'json' | 'excel';
    query: RevisionRequestSearchQuery;
    fields?: string;
    includeEvidence?: boolean;
    includeTimeline?: boolean;
    includeComments?: boolean;
}
export interface RevisionRequestConfig {
    enableAutoAssignment: boolean;
    defaultReviewerAssignment: 'round_robin' | 'workload_based' | 'skill_based';
    autoEscalationDays: number;
    enableSLA: boolean;
    slaHours: Record<RevisionRequestPriority, number>;
    requireApprovalFor: RevisionRequestType;
    multipleReviewersFor: RevisionRequestType;
    enableEmailNotifications: boolean;
    enableSlackNotifications: boolean;
    notificationSettings: {
        onAssignment: boolean;
        onStatusChange: boolean;
        onComment: boolean;
        onDueDate: boolean;
        onOverdue: boolean;
    };
    maxEvidenceFiles: number;
    maxFileSizeMB: number;
    allowedFileTypes: string;
    enableAnnotations: boolean;
    enableComplexityScoring: boolean;
    enableImpactScoring: boolean;
    enablePredictiveAnalytics: boolean;
    retentionDays: number;
}
export declare const DEFAULT_REVISION_REQUEST_CONFIG: RevisionRequestConfig;
export interface RevisionRequestFormData {
    title: string;
    description: string;
    requestedChanges: string;
    businessJustification: string;
    contentType: RevisionContentType;
    contentId: string;
    type: RevisionRequestType;
    priority: RevisionRequestPriority;
    dueDate?: Date;
    estimatedHours?: number;
    tags: string;
    evidence: File;
}
export interface RevisionRequestReviewFormData {
    decision: 'approve' | 'reject' | 'request_info';
    reviewNotes: string;
    rejectionReason?: string;
    approvalNotes?: string;
    estimatedImplementationHours?: number;
    implementationPlan?: string;
    additionalRequirements?: string;
}
export type RevisionRequestCreateSchema = {
    title: string;
    description: string;
    requestedChanges: string;
    businessJustification: string;
    contentType: RevisionContentType;
    contentId: string;
    type: RevisionRequestType;
    priority: RevisionRequestPriority;
    dueDate?: string;
    estimatedHours?: number;
    tags?: string;
};
export type RevisionRequestUpdateSchema = Partial<RevisionRequestCreateSchema> & {
    status?: RevisionRequestStatus;
    reviewerId?: string;
    reviewNotes?: string;
    rejectionReason?: string;
    approvalNotes?: string;
    implementationNotes?: string;
};
export type RevisionEvidenceCreateSchema = {
    evidenceType: RevisionEvidenceType;
    title: string;
    description?: string;
    file?: File;
};
export type RevisionCommentCreateSchema = {
    content: string;
    parentCommentId?: string;
    isInternal?: boolean;
    mentions?: string;
};
//# sourceMappingURL=RevisionRequestTypes.d.ts.map