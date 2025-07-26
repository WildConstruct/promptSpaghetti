/**
 * Core Sharing Data Model - Epic 16 Implementation
 * Comprehensive TypeScript interfaces for sharing functionality
 */
// Error types
export class ShareError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ShareError';
    }
}
export var ShareErrorCode;
(function (ShareErrorCode) {
    ShareErrorCode["SHARE_NOT_FOUND"] = "SHARE_NOT_FOUND";
    ShareErrorCode["SHARE_EXPIRED"] = "SHARE_EXPIRED";
    ShareErrorCode["SHARE_REVOKED"] = "SHARE_REVOKED";
    ShareErrorCode["INVALID_PASSWORD"] = "INVALID_PASSWORD";
    ShareErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ShareErrorCode["CONTENT_NOT_FOUND"] = "CONTENT_NOT_FOUND";
    ShareErrorCode["INVALID_SHARE_TOKEN"] = "INVALID_SHARE_TOKEN";
    ShareErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    ShareErrorCode["SECURITY_VIOLATION"] = "SECURITY_VIOLATION";
})(ShareErrorCode || (ShareErrorCode = {}));
export var ShareEventType;
(function (ShareEventType) {
    ShareEventType["SHARE_CREATED"] = "share_created";
    ShareEventType["SHARE_ACCESSED"] = "share_accessed";
    ShareEventType["SHARE_DOWNLOADED"] = "share_downloaded";
    ShareEventType["SHARE_EXPIRED"] = "share_expired";
    ShareEventType["SHARE_REVOKED"] = "share_revoked";
    ShareEventType["COLLABORATOR_ADDED"] = "collaborator_added";
    ShareEventType["COLLABORATOR_REMOVED"] = "collaborator_removed";
    ShareEventType["PERMISSION_CHANGED"] = "permission_changed";
    ShareEventType["COMMENT_ADDED"] = "comment_added";
    ShareEventType["CONTENT_UPDATED"] = "content_updated";
    ShareEventType["ANNOTATION_ADDED"] = "annotation_added";
})(ShareEventType || (ShareEventType = {}));
