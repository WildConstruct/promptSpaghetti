/**
 * Revision Request Types - E17-1753114397311-674990
 *
 * Comprehensive type definitions for revision request system
 * for Epic 17 - Backstage Admin Controls.
 *
 * Following patterns from AppealProcessService and DocumentReviewInterface.
 */
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
})(RevisionRequestStatus || (RevisionRequestStatus = {}));
// Priority levels for revision requests
export var RevisionRequestPriority;
(function (RevisionRequestPriority) {
    RevisionRequestPriority["LOW"] = "low";
    RevisionRequestPriority["MEDIUM"] = "medium";
    RevisionRequestPriority["HIGH"] = "high";
    RevisionRequestPriority["URGENT"] = "urgent";
    RevisionRequestPriority["CRITICAL"] = "critical";
})(RevisionRequestPriority || (RevisionRequestPriority = {}));
// Types of content that can have revision requests
export var RevisionContentType;
(function (RevisionContentType) {
    RevisionContentType["TEMPLATE"] = "template";
    RevisionContentType["GRAPH"] = "graph";
    RevisionContentType["WORKFLOW"] = "workflow";
    RevisionContentType["POLICY"] = "policy";
    RevisionContentType["DOCUMENTATION"] = "documentation";
    RevisionContentType["CONFIGURATION"] = "configuration";
    RevisionContentType["USER_INTERFACE"] = "user_interface";
})(RevisionContentType || (RevisionContentType = {}));
// Types of revision requests
export var RevisionRequestType;
(function (RevisionRequestType) {
    RevisionRequestType["CONTENT_UPDATE"] = "content_update";
    RevisionRequestType["FEATURE_ENHANCEMENT"] = "feature_enhancement";
    RevisionRequestType["BUG_FIX"] = "bug_fix";
    RevisionRequestType["PERFORMANCE_IMPROVEMENT"] = "performance_improvement";
    RevisionRequestType["ACCESSIBILITY_IMPROVEMENT"] = "accessibility_improvement";
    RevisionRequestType["SECURITY_UPDATE"] = "security_update";
    RevisionRequestType["COMPLIANCE_UPDATE"] = "compliance_update";
})(RevisionRequestType || (RevisionRequestType = {}));
// Evidence/attachment types
export var RevisionEvidenceType;
(function (RevisionEvidenceType) {
    RevisionEvidenceType["SCREENSHOT"] = "screenshot";
    RevisionEvidenceType["DOCUMENT"] = "document";
    RevisionEvidenceType["VIDEO"] = "video";
    RevisionEvidenceType["CODE_SAMPLE"] = "code_sample";
    RevisionEvidenceType["MOCKUP"] = "mockup";
    RevisionEvidenceType["REQUIREMENTS_DOC"] = "requirements_doc";
    RevisionEvidenceType["SUPPORTING_DATA"] = "supporting_data";
})(RevisionEvidenceType || (RevisionEvidenceType = {}));
// Timeline event types
export var RevisionTimelineEventType;
(function (RevisionTimelineEventType) {
    RevisionTimelineEventType["REQUEST_CREATED"] = "request_created";
    RevisionTimelineEventType["STATUS_CHANGED"] = "status_changed";
    RevisionTimelineEventType["ASSIGNED_TO_REVIEWER"] = "assigned_to_reviewer";
    RevisionTimelineEventType["REVIEWER_CHANGED"] = "reviewer_changed";
    RevisionTimelineEventType["COMMENT_ADDED"] = "comment_added";
    RevisionTimelineEventType["EVIDENCE_UPLOADED"] = "evidence_uploaded";
    RevisionTimelineEventType["EVIDENCE_REMOVED"] = "evidence_removed";
    RevisionTimelineEventType["APPROVAL_GIVEN"] = "approval_given";
    RevisionTimelineEventType["REJECTION_GIVEN"] = "rejection_given";
    RevisionTimelineEventType["ADDITIONAL_INFO_REQUESTED"] = "additional_info_requested";
    RevisionTimelineEventType["IMPLEMENTATION_STARTED"] = "implementation_started";
    RevisionTimelineEventType["IMPLEMENTATION_COMPLETED"] = "implementation_completed";
    RevisionTimelineEventType["REQUEST_CANCELLED"] = "request_cancelled";
})(RevisionTimelineEventType || (RevisionTimelineEventType = {}));
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
        [RevisionRequestPriority.CRITICAL]: 1 // 1 hour
    },
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
    retentionDays: 2555 // ~7 years
};
