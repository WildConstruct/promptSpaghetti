/**
 * Core Sharing Data Model - Epic 16 Implementation
 * Comprehensive TypeScript interfaces for sharing functionality
 */
export type ShareAccessLevel = 'public' | 'restricted' | 'private';
export type SharePermission = 'view' | 'comment' | 'edit' | 'admin';
export type ShareStatus = 'active' | 'expired' | 'revoked' | 'pending';
export interface UserInfo {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}
export interface Collaborator extends UserInfo {
    role: SharePermission;
    addedAt: Date;
    permissions: string[];
    invitedBy: string;
    acceptedAt?: Date;
}
export interface SharingConfig {
    accessLevel: ShareAccessLevel;
    permissions: SharePermission;
    collaborators: Collaborator[];
    shareUrl: string;
    shareToken: string;
    expiresAt?: Date;
    passwordProtected: boolean;
    allowDownload: boolean;
    allowCopy: boolean;
    trackAnalytics: boolean;
    notifyOnAccess: boolean;
}
export interface ShareSecurityConfig {
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    encryptionRequired: boolean;
    auditingEnabled: boolean;
    retentionPolicy: {,
        maxShareDuration: number;
        autoExpire: boolean;
        dataRetentionDays: number;
    };
    accessControls: {,
        ipWhitelist: string[];
        geoRestrictions: string[];
        requireAuthentication: boolean;
        maxConcurrentUsers?: number;
        sessionTimeout?: number;
    };
}
export interface SharedContent {
    id: string;
    type: 'graph' | 'template' | 'bundle' | 'dataset';
    title: string;
    description?: string;
    content: any;
    metadata: SharedContentMetadata;
    sharing: SharingConfig;
    security: ShareSecurityConfig;
    analytics: ShareAnalytics;
    createdAt: Date;
    updatedAt: Date;
    status: ShareStatus;
}
export interface SharedContentMetadata {
    exportId: string;
    version: string;
    author: UserInfo;
    tags: string[];
    category?: string;
    language?: string;
    contentSize: number;
    checksumMd5: string;
    versionControl: VersionControl;
    annotations: ContentAnnotations;
}
export interface VersionControl {
    currentVersion: string;
    versions: ContentVersion[];
    isLatest: boolean;
    changesFromPrevious?: string[];
    mergeConflicts?: MergeConflict[];
}
export interface ContentVersion {
    version: string;
    timestamp: Date;
    author: UserInfo;
    changes: string[];
    size: number;
    checksum: string;
}
export interface MergeConflict {
    path: string;
    type: 'content' | 'metadata' | 'permissions';
    conflictingVersions: string[];
    resolution?: 'auto' | 'manual';
}
export interface ContentAnnotations {
    connectionLabels: ConnectionLabel[];
    stickyNotes: StickyNote[];
    regions: AnnotationRegion[];
    comments: ShareComment[];
}
export interface ConnectionLabel {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    label: string;
    color?: string;
    author: UserInfo;
    createdAt: Date;
}
export interface StickyNote {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string;
    color: string;
    author: UserInfo;
    createdAt: Date;
    updatedAt: Date;
}
export interface AnnotationRegion {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    description?: string;
    color: string;
    author: UserInfo;
    createdAt: Date;
}
export interface ShareComment {
    id: string;
    content: string;
    author: UserInfo;
    createdAt: Date;
    updatedAt?: Date;
    parentId?: string;
    position?: {
        x: number;
        y: number;
    };
    resolved: boolean;
    resolvedBy?: UserInfo;
    resolvedAt?: Date;
}
export interface ShareAnalytics {
    views: ShareView[];
    downloads: ShareDownload[];
    collaborations: CollaborationEvent[];
    totalViews: number;
    uniqueViewers: number;
    averageViewDuration: number;
    peakConcurrentUsers: number;
    geographicDistribution: GeographicStats[];
    deviceStats: DeviceStats[];
    conversionMetrics: ConversionMetrics;
}
export interface ShareView {
    id: string;
    viewerInfo: ViewerInfo;
    timestamp: Date;
    duration: number;
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    geolocation?: GeoLocation;
}
export interface ShareDownload {
    id: string;
    downloadedBy: ViewerInfo;
    timestamp: Date;
    format: string;
    size: number;
    ipAddress: string;
    success: boolean;
    errorReason?: string;
}
export interface CollaborationEvent {
    id: string;
    type: 'comment' | 'edit' | 'annotation' | 'permission_change';
    user: UserInfo;
    timestamp: Date;
    details: any;
    impact: 'minor' | 'major' | 'breaking';
}
export interface ViewerInfo {
    id?: string;
    email?: string;
    name?: string;
    isAuthenticated: boolean;
    sessionId: string;
}
export interface GeoLocation {
    country: string;
    region: string;
    city: string;
    coordinates: {,
        lat: number;
        lng: number;
    };
}
export interface GeographicStats {
    country: string;
    views: number;
    uniqueViewers: number;
}
export interface DeviceStats {
    deviceType: 'desktop' | 'tablet' | 'mobile';
    operatingSystem: string;
    browser: string;
    views: number;
}
export interface ConversionMetrics {
    viewToDownload: number;
    viewToCollaboration: number;
    viewToSignup: number;
    averageTimeToAction: number;
}
export interface CreateShareRequest {
    contentId: string;
    contentType: SharedContent['type'];
    title: string;
    description?: string;
    sharing: Partial<SharingConfig>;
    security?: Partial<ShareSecurityConfig>;
    collaborators?: string[];
}
export interface CreateShareResponse {
    success: boolean;
    shareId: string;
    shareUrl: string;
    shareToken: string;
    expiresAt?: Date;
    error?: string;
}
export interface UpdateShareRequest {
    title?: string;
    description?: string;
    sharing?: Partial<SharingConfig>;
    security?: Partial<ShareSecurityConfig>;
}
export interface ShareAccessRequest {
    shareToken: string;
    password?: string;
    userAgent: string;
    ipAddress: string;
}
export interface ShareAccessResponse {
    success: boolean;
    content?: SharedContent;
    permissions: SharePermission[];
    requiresPassword: boolean;
    error?: string;
    analytics?: {
        viewCount: number;
        lastAccessed: Date;
    };
}
export interface SharePermissionRequest {
    shareId: string;
    userId: string;
    permission: SharePermission;
    message?: string;
}
export interface ShareAnalyticsRequest {
    shareId: string;
    timeRange?: {
        start: Date;
        end: Date;
    };
    metrics?: ('views' | 'downloads' | 'collaborations')[];
}
export interface ShareAnalyticsResponse {
    success: boolean;
    analytics: ShareAnalytics;
    error?: string;
}
export declare class ShareError extends Error {
    code: ShareErrorCode;
    details?: any | undefined;
    constructor(message: string, code: ShareErrorCode, details?: any | undefined);
}
export declare enum ShareErrorCode {
    SHARE_NOT_FOUND = "SHARE_NOT_FOUND",
    SHARE_EXPIRED = "SHARE_EXPIRED",
    SHARE_REVOKED = "SHARE_REVOKED",
    INVALID_PASSWORD = "INVALID_PASSWORD",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    CONTENT_NOT_FOUND = "CONTENT_NOT_FOUND",
    INVALID_SHARE_TOKEN = "INVALID_SHARE_TOKEN",
    RATE_LIMITED = "RATE_LIMITED",
    SECURITY_VIOLATION = "SECURITY_VIOLATION"
}
export interface SharingSystemConfig {
    maxShareDuration: number;
    defaultAccessLevel: ShareAccessLevel;
    allowAnonymousSharing: boolean;
    requireEmailVerification: boolean;
    maxCollaborators: number;
    allowPasswordProtection: boolean;
    trackAnalyticsByDefault: boolean;
    defaultRetentionDays: number;
    maxFileSizeForSharing: number;
    supportedFormats: string[];
    encryptionRequired: boolean;
}
export interface ShareEvent {
    type: ShareEventType;
    shareId: string;
    timestamp: Date;
    user?: UserInfo;
    data: any;
}
export declare enum ShareEventType {
    SHARE_CREATED = "share_created",
    SHARE_ACCESSED = "share_accessed",
    SHARE_DOWNLOADED = "share_downloaded",
    SHARE_EXPIRED = "share_expired",
    SHARE_REVOKED = "share_revoked",
    COLLABORATOR_ADDED = "collaborator_added",
    COLLABORATOR_REMOVED = "collaborator_removed",
    PERMISSION_CHANGED = "permission_changed",
    COMMENT_ADDED = "comment_added",
    CONTENT_UPDATED = "content_updated",
    ANNOTATION_ADDED = "annotation_added"
}
//# sourceMappingURL=sharing.d.ts.map