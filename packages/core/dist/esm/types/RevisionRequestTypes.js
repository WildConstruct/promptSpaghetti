// Core revision request status enum
export var RevisionRequestStatus;
(function (RevisionRequestStatus) {
    RevisionRequestStatus["DRAFT"] = "draft";
    RevisionRequestStatus["SUBMITTED"] = "submitted";
    RevisionRequestStatus["UNDER_REVIEW"] = "under_review";
    RevisionRequestStatus["ADDITIONAL_INFO_REQUESTED"] = "additional_info_requested";
    RevisionRequestStatus["APPROVED"] = "approved";
    RevisionRequestStatus["REJECTED"] = "rejected";
    RevisionRequestStatus["CANCELLED"] = "cancelled";
    RevisionRequestStatus["IMPLEMENTED"] = "implemented";
    // Priority levels for revision requests
    RevisionRequestStatus[RevisionRequestStatus["export"] = void 0] = "export";
    RevisionRequestStatus[RevisionRequestStatus["enum"] = void 0] = "enum";
    RevisionRequestStatus[RevisionRequestStatus["RevisionRequestPriority"] = void 0] = "RevisionRequestPriority";
})(RevisionRequestStatus || (RevisionRequestStatus = {}));
{
    LOW = 'low',
        MEDIUM = 'medium',
        HIGH = 'high',
        URGENT = 'urgent',
        CRITICAL = 'critical';
    // Types of content that can have revision requests
    export let RevisionContentType;
    (function (RevisionContentType) {
        RevisionContentType["TEMPLATE"] = "template";
        RevisionContentType["GRAPH"] = "graph";
        RevisionContentType["WORKFLOW"] = "workflow";
        RevisionContentType["POLICY"] = "policy";
        RevisionContentType["DOCUMENTATION"] = "documentation";
        RevisionContentType["CONFIGURATION"] = "configuration";
        RevisionContentType["USER_INTERFACE"] = "user_interface";
        // Types of revision requests
        RevisionContentType[RevisionContentType["export"] = void 0] = "export";
        RevisionContentType[RevisionContentType["enum"] = void 0] = "enum";
        RevisionContentType[RevisionContentType["RevisionRequestType"] = void 0] = "RevisionRequestType";
    })(RevisionContentType || (RevisionContentType = {}));
    {
        CONTENT_UPDATE = 'content_update',
            FEATURE_ENHANCEMENT = 'feature_enhancement',
            BUG_FIX = 'bug_fix',
            PERFORMANCE_IMPROVEMENT = 'performance_improvement',
            ACCESSIBILITY_IMPROVEMENT = 'accessibility_improvement',
            SECURITY_UPDATE = 'security_update',
            COMPLIANCE_UPDATE = 'compliance_update';
        // Evidence/attachment types
        export let RevisionEvidenceType;
        (function (RevisionEvidenceType) {
            RevisionEvidenceType["SCREENSHOT"] = "screenshot";
            RevisionEvidenceType["DOCUMENT"] = "document";
            RevisionEvidenceType["VIDEO"] = "video";
            RevisionEvidenceType["CODE_SAMPLE"] = "code_sample";
            RevisionEvidenceType["MOCKUP"] = "mockup";
            RevisionEvidenceType["REQUIREMENTS_DOC"] = "requirements_doc";
            RevisionEvidenceType["SUPPORTING_DATA"] = "supporting_data";
            // Timeline event types
            RevisionEvidenceType[RevisionEvidenceType["export"] = void 0] = "export";
            RevisionEvidenceType[RevisionEvidenceType["enum"] = void 0] = "enum";
            RevisionEvidenceType[RevisionEvidenceType["RevisionTimelineEventType"] = void 0] = "RevisionTimelineEventType";
        })(RevisionEvidenceType || (RevisionEvidenceType = {}));
        {
            REQUEST_CREATED = 'request_created',
                STATUS_CHANGED = 'status_changed',
                ASSIGNED_TO_REVIEWER = 'assigned_to_reviewer',
                REVIEWER_CHANGED = 'reviewer_changed',
                COMMENT_ADDED = 'comment_added',
                EVIDENCE_UPLOADED = 'evidence_uploaded',
                EVIDENCE_REMOVED = 'evidence_removed',
                APPROVAL_GIVEN = 'approval_given',
                REJECTION_GIVEN = 'rejection_given',
                ADDITIONAL_INFO_REQUESTED = 'additional_info_requested',
                IMPLEMENTATION_STARTED = 'implementation_started',
                IMPLEMENTATION_COMPLETED = 'implementation_completed';
        }
        REQUEST_CANCELLED = 'request_cancelled';
        ;
        content: string;
        createdBy: string;
        createdAt: Date;
        resolved ?  : boolean;
        resolvedBy ?  : string;
        resolvedAt ?  : Date;
        ;
        dueDateRange ?  : { start: Date,
            end: Date };
        // Content filters
        contentId ?  : string;
        tags ?  : string;
        // Text search
        search ?  : string; // Search in title, description, requested changes
        // Complexity and urgency
        minUrgencyScore ?  : number;
        maxUrgencyScore ?  : number;
        minComplexityScore ?  : number;
        maxComplexityScore ?  : number;
        // Pagination and sorting
        page ?  : number;
        pageSize ?  : number;
        sortBy ?  : RevisionRequestSortField;
        sortOrder ?  : 'asc' | 'desc';
        ;
        aggregations: RevisionRequestAggregations;
        filters: AppliedFilters;
        ;
        averageCompletionTime: number; // in hours
        topRequesters: Array < {};
        requesterId: string;
        requesterName: string;
        count: number;
            > ;
        topReviewers: Array < {
            reviewerId: string,
            reviewerName: string,
            count: number,
            averageResponseTime: number } > ;
            > ;
        ;
        ;
            > ;
        completionTrends: Array < {
            date: string,
            completed: number,
            averageTime: number } > ;
        contentTypeTrends: Array < {
            contentType: RevisionContentType,
            trend: 'increasing' | 'decreasing' | 'stable' };
        changePercent: number;
            > ;
        title: string;
        description: string;
        impact: 'low' | 'medium' | 'high';
        confidence: number;
        data: Record;
        recommendedActions: string;
        relatedRequests ?  : string;
        ;
        metrics: string;
        query: RevisionRequestSearchQuery;
        fields ?  : string;
        includeEvidence ?  : boolean;
        includeTimeline ?  : boolean;
        includeComments ?  : boolean;
        ;
        // Evidence settings
        maxEvidenceFiles: number;
        maxFileSizeMB: number;
        allowedFileTypes: string;
        enableAnnotations: boolean;
        // Advanced features
        enableComplexityScoring: boolean;
        enableImpactScoring: boolean;
        enablePredictiveAnalytics: boolean;
        retentionDays: number;
        export const DEFAULT_REVISION_REQUEST_CONFIG = {
            enableAutoAssignment: true,
            defaultReviewerAssignment: 'workload_based',
            autoEscalationDays: 3,
            enableSLA: true,
            slaHours: {
                [RevisionRequestPriority.LOW]: 168, // 7 days
                [RevisionRequestPriority.MEDIUM]: 72, // 3 days
                [RevisionRequestPriority.HIGH]: 24, // 1 day
                [RevisionRequestPriority.URGENT]: 4, // 4 hours
                [RevisionRequestPriority.CRITICAL]: 1 // 1 hour }
                , // 1 hour }
                requireApprovalFor: [
                    RevisionRequestType.SECURITY_UPDATE,
                    RevisionRequestType.COMPLIANCE_UPDATE
                ],
                multipleReviewersFor: [
                    RevisionRequestType.SECURITY_UPDATE,
                    RevisionRequestType.COMPLIANCE_UPDATE
                ],
                enableEmailNotifications: true,
                enableSlackNotifications: true,
                notificationSettings: {
                    onAssignment: true,
                    onStatusChange: true,
                    onComment: true,
                    onDueDate: true,
                    onOverdue: true
                },
                maxEvidenceFiles: 10,
                maxFileSizeMB: 25,
                allowedFileTypes: [
                    'image/jpeg', 'image/png', 'image/gif',
                    'application/pdf',
                    'text/plain', 'text/markdown',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'video/mp4', 'video/quicktime'
                ],
                enableAnnotations: true,
                enableComplexityScoring: true,
                enableImpactScoring: true,
                enablePredictiveAnalytics: false,
                retentionDays: 2555 // ~7 years;
            },
            // Utility types for forms and UI
            interface, RevisionRequestFormData
        }, { title: string };
        description: string;
        requestedChanges: string;
        businessJustification: string;
        contentType: RevisionContentType;
        contentId: string;
        type: RevisionRequestType;
        priority: RevisionRequestPriority;
        dueDate ?  : Date;
        estimatedHours ?  : number;
        tags: string;
        evidence: File;
    }
    reviewNotes: string;
    rejectionReason ?  : string;
    approvalNotes ?  : string;
    estimatedImplementationHours ?  : number;
    implementationPlan ?  : string;
    additionalRequirements ?  : string;
}
