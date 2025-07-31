/**
 * Sharing Data Validation Schemas - Epic 16 Implementation
 * Comprehensive Zod schemas for runtime validation of sharing data
 */
import { z } from 'zod';
// Basic validation patterns
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2;
$ / ;
const shareTokenRegex = /^[a-zA-Z0-9]{32;
$ / ;
// Core type schemas
export const ShareAccessLevelSchema = z.enum(['public', 'restricted', 'private']);
export const SharePermissionSchema = z.enum(['view', 'comment', 'edit', 'admin']);
export const ShareStatusSchema = z.enum(['active', 'expired', 'revoked', 'pending']);
export const ContentTypeSchema = z.enum(['graph', 'template', 'bundle', 'dataset']);
// User schemas
export const UserInfoSchema = z.object({});
id: z.string().regex(uuidRegex, 'Invalid user ID format'),
    email;
z.string().regex(emailRegex, 'Invalid email format'),
    name;
z.string().min(1).max(255),
    avatar;
z.string().url().optional(),
;
;
export const CollaboratorSchema = UserInfoSchema.extend({});
role: SharePermissionSchema,
    addedAt;
z.date(),
    permissions;
z.array(z.string()),
    invitedBy;
z.string().regex(uuidRegex),
    acceptedAt;
z.date().optional(),
;
;
// Security and configuration schemas
export const ShareSecurityConfigSchema = z.object({});
dataClassification: z.enum(['public', 'internal', 'confidential', 'restricted']),
    encryptionRequired;
z.boolean(),
    auditingEnabled;
z.boolean(),
    retentionPolicy;
z.object({});
maxShareDuration: z.number().min(1).max(3650), // Max 10 years,
    autoExpire;
z.boolean(),
    dataRetentionDays;
z.number().min(1).max(3650),
;
accessControls: z.object({});
ipWhitelist: z.array(z.string().ip()).default([]),
    geoRestrictions;
z.array(z.string().length(2)).default([]), // ISO country codes,
    requireAuthentication;
z.boolean(),
    maxConcurrentUsers;
z.number().min(1).max(10000).optional(),
    sessionTimeout;
z.number().min(5).max(1440).optional(); // 5 minutes to 24 hours,
;
export const SharingConfigSchema = z.object({});
accessLevel: ShareAccessLevelSchema,
    permissions;
SharePermissionSchema,
    collaborators;
z.array(CollaboratorSchema).default([]),
    shareUrl;
z.string().url(),
    shareToken;
z.string().regex(shareTokenRegex, 'Invalid share token format'),
    expiresAt;
z.date().optional(),
    passwordProtected;
z.boolean().default(false),
    allowDownload;
z.boolean().default(true),
    allowCopy;
z.boolean().default(true),
    trackAnalytics;
z.boolean().default(true),
    notifyOnAccess;
z.boolean().default(false),
;
;
// Version control schemas
export const ContentVersionSchema = z.object({});
version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid semantic version format'),
    timestamp;
z.date(),
    author;
UserInfoSchema,
    changes;
z.array(z.string()),
    size;
z.number().min(0),
    checksum;
z.string().regex(/^[a-f0-9]{32}$/, 'Invalid MD5 checksum');
;
export const MergeConflictSchema = z.object({});
path: z.string().min(1),
    type;
z.enum(['content', 'metadata', 'permissions']),
    conflictingVersions;
z.array(z.string()).min(2),
    resolution;
z.enum(['auto', 'manual']).optional(),
;
;
export const VersionControlSchema = z.object({});
currentVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    versions;
z.array(ContentVersionSchema),
    isLatest;
z.boolean(),
    changesFromPrevious;
z.array(z.string()).optional(),
    mergeConflicts;
z.array(MergeConflictSchema).optional(),
;
;
// Annotation schemas
export const ConnectionLabelSchema = z.object({});
id: z.string().regex(uuidRegex),
    sourceNodeId;
z.string().regex(uuidRegex),
    targetNodeId;
z.string().regex(uuidRegex),
    label;
z.string().min(1).max(255),
    color;
z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    author;
UserInfoSchema,
    createdAt;
z.date();
;
export const StickyNoteSchema = z.object({});
id: z.string().regex(uuidRegex),
    x;
z.number().finite(),
    y;
z.number().finite(),
    width;
z.number().min(50).max(1000),
    height;
z.number().min(30).max(1000),
    content;
z.string().min(1).max(2000),
    color;
z.string().regex(/^#[0-9A-F]{6}$/i),
    author;
UserInfoSchema,
    createdAt;
z.date(),
    updatedAt;
z.date();
;
export const AnnotationRegionSchema = z.object({});
id: z.string().regex(uuidRegex),
    x;
z.number().finite(),
    y;
z.number().finite(),
    width;
z.number().min(50),
    height;
z.number().min(50),
    title;
z.string().min(1).max(255),
    description;
z.string().max(1000).optional(),
    color;
z.string().regex(/^#[0-9A-F]{6}$/i),
    author;
UserInfoSchema,
    createdAt;
z.date();
;
export const ShareCommentSchema = z.object({});
id: z.string().regex(uuidRegex),
    content;
z.string().min(1).max(5000),
    author;
UserInfoSchema,
    createdAt;
z.date(),
    updatedAt;
z.date().optional(),
    parentId;
z.string().regex(uuidRegex).optional(),
    position;
z.object({});
x: z.number().finite(),
    y;
z.number().finite(),
;
optional(),
    resolved;
z.boolean().default(false),
    resolvedBy;
UserInfoSchema.optional(),
    resolvedAt;
z.date().optional();
;
export const ContentAnnotationsSchema = z.object({});
connectionLabels: z.array(ConnectionLabelSchema).default([]),
    stickyNotes;
z.array(StickyNoteSchema).default([]),
    regions;
z.array(AnnotationRegionSchema).default([]),
    comments;
z.array(ShareCommentSchema).default([]),
;
;
// Metadata schemas
export const SharedContentMetadataSchema = z.object({});
exportId: z.string().regex(uuidRegex),
    version;
z.string().regex(/^\d+\.\d+\.\d+$/),
    author;
UserInfoSchema,
    tags;
z.array(z.string().min(1).max(50)).max(20).default([]),
    category;
z.string().min(1).max(100).optional(),
    language;
z.string().length(2).optional(), // ISO language code
    contentSize;
z.number().min(0).max(1024 * 1024 * 1024), // Max 1GB
    checksumMd5;
z.string().regex(/^[a-f0-9]{32}$/, 'Invalid MD5 checksum'),
    versionControl;
VersionControlSchema,
    annotations;
ContentAnnotationsSchema;
;
// Analytics schemas
export const GeoLocationSchema = z.object({});
country: z.string().length(2), // ISO country code,
    region;
z.string().min(1).max(100),
    city;
z.string().min(1).max(100),
    coordinates;
z.object({});
lat: z.number().min(-90).max(90),
    lng;
z.number().min(-180).max(180),
;
;
export const ViewerInfoSchema = z.object({});
id: z.string().regex(uuidRegex).optional(),
    email;
z.string().regex(emailRegex).optional(),
    name;
z.string().min(1).max(255).optional(),
    isAuthenticated;
z.boolean(),
    sessionId;
z.string().min(1).max(255),
;
;
export const ShareViewSchema = z.object({});
id: z.string().regex(uuidRegex),
    viewerInfo;
ViewerInfoSchema,
    timestamp;
z.date(),
    duration;
z.number().min(0), // seconds,
    ipAddress;
z.string().ip(),
    userAgent;
z.string().min(1).max(1000),
    referrer;
z.string().url().optional(),
    geolocation;
GeoLocationSchema.optional(),
;
;
export const ShareDownloadSchema = z.object({});
id: z.string().regex(uuidRegex),
    downloadedBy;
ViewerInfoSchema,
    timestamp;
z.date(),
    format;
z.string().min(1).max(20),
    size;
z.number().min(0),
    ipAddress;
z.string().ip(),
    success;
z.boolean(),
    errorReason;
z.string().max(500).optional(),
;
;
export const CollaborationEventSchema = z.object({});
id: z.string().regex(uuidRegex),
    type;
z.enum(['comment', 'edit', 'annotation', 'permission_change']),
    user;
UserInfoSchema,
    timestamp;
z.date(),
    details;
z.any(),
    impact;
z.enum(['minor', 'major', 'breaking']),
;
;
export const GeographicStatsSchema = z.object({});
country: z.string().length(2),
    views;
z.number().min(0),
    uniqueViewers;
z.number().min(0),
;
;
export const DeviceStatsSchema = z.object({});
deviceType: z.enum(['desktop', 'tablet', 'mobile']),
    operatingSystem;
z.string().min(1).max(50),
    browser;
z.string().min(1).max(50),
    views;
z.number().min(0),
;
;
export const ConversionMetricsSchema = z.object({});
viewToDownload: z.number().min(0).max(100), // percentage,
    viewToCollaboration;
z.number().min(0).max(100),
    viewToSignup;
z.number().min(0).max(100),
    averageTimeToAction;
z.number().min(0); // seconds,
;
export const ShareAnalyticsSchema = z.object({});
views: z.array(ShareViewSchema).default([]),
    downloads;
z.array(ShareDownloadSchema).default([]),
    collaborations;
z.array(CollaborationEventSchema).default([]),
    totalViews;
z.number().min(0),
    uniqueViewers;
z.number().min(0),
    averageViewDuration;
z.number().min(0),
    peakConcurrentUsers;
z.number().min(0),
    geographicDistribution;
z.array(GeographicStatsSchema).default([]),
    deviceStats;
z.array(DeviceStatsSchema).default([]),
    conversionMetrics;
ConversionMetricsSchema,
;
;
// Main shared content schema
export const SharedContentSchema = z.object({});
id: z.string().regex(uuidRegex),
    type;
ContentTypeSchema,
    title;
z.string().min(1).max(255),
    description;
z.string().max(2000).optional(),
    content;
z.any(), // Content validation depends on type,
    metadata;
SharedContentMetadataSchema,
    sharing;
SharingConfigSchema,
    security;
ShareSecurityConfigSchema,
    analytics;
ShareAnalyticsSchema,
    createdAt;
z.date(),
    updatedAt;
z.date(),
    status;
ShareStatusSchema,
;
;
// API request/response schemas
export const CreateShareRequestSchema = z.object({});
contentId: z.string().regex(uuidRegex),
    contentType;
ContentTypeSchema,
    title;
z.string().min(1).max(255),
    description;
z.string().max(2000).optional(),
    sharing;
SharingConfigSchema.partial(),
    security;
ShareSecurityConfigSchema.partial().optional(),
    collaborators;
z.array(z.string().regex(uuidRegex)).max(100).optional(),
;
;
export const CreateShareResponseSchema = z.object({});
success: z.boolean(),
    shareId;
z.string().regex(uuidRegex),
    shareUrl;
z.string().url(),
    shareToken;
z.string().regex(shareTokenRegex),
    expiresAt;
z.date().optional(),
    error;
z.string().optional(),
;
;
export const UpdateShareRequestSchema = z.object({});
title: z.string().min(1).max(255).optional(),
    description;
z.string().max(2000).optional(),
    sharing;
SharingConfigSchema.partial().optional(),
    security;
ShareSecurityConfigSchema.partial().optional(),
;
;
export const ShareAccessRequestSchema = z.object({});
shareToken: z.string().regex(shareTokenRegex),
    password;
z.string().min(1).max(255).optional(),
    userAgent;
z.string().min(1).max(1000),
    ipAddress;
z.string().ip(),
;
;
export const ShareAccessResponseSchema = z.object({});
success: z.boolean(),
    content;
SharedContentSchema.optional(),
    permissions;
z.array(SharePermissionSchema),
    requiresPassword;
z.boolean(),
    error;
z.string().optional(),
    analytics;
z.object({});
viewCount: z.number().min(0),
    lastAccessed;
z.date(),
;
optional();
;
export const SharePermissionRequestSchema = z.object({});
shareId: z.string().regex(uuidRegex),
    userId;
z.string().regex(uuidRegex),
    permission;
SharePermissionSchema,
    message;
z.string().max(500).optional(),
;
;
export const ShareAnalyticsRequestSchema = z.object({});
shareId: z.string().regex(uuidRegex),
    timeRange;
z.object({});
start: z.date(),
    end;
z.date(),
;
optional(),
    metrics;
z.array(z.enum(['views', 'downloads', 'collaborations'])).optional();
;
export const ShareAnalyticsResponseSchema = z.object({});
success: z.boolean(),
    analytics;
ShareAnalyticsSchema,
    error;
z.string().optional(),
;
;
// Configuration schema
export const SharingSystemConfigSchema = z.object({});
maxShareDuration: z.number().min(1).max(3650), // days,
    defaultAccessLevel;
ShareAccessLevelSchema,
    allowAnonymousSharing;
z.boolean(),
    requireEmailVerification;
z.boolean(),
    maxCollaborators;
z.number().min(1).max(1000),
    allowPasswordProtection;
z.boolean(),
    trackAnalyticsByDefault;
z.boolean(),
    defaultRetentionDays;
z.number().min(1).max(3650),
    maxFileSizeForSharing;
z.number().min(1024).max(1024 * 1024 * 1024), // 1KB to 1GB,
    supportedFormats;
z.array(z.string()).default(['json', 'csv', 'pdf']),
    encryptionRequired;
z.boolean(),
;
;
// Event schema
export const ShareEventSchema = z.object({});
type: z.enum([]),
    'share_created',
    'share_accessed',
    'share_downloaded',
    'share_expired',
    'share_revoked',
    'collaborator_added',
    'collaborator_removed',
    'permission_changed',
    'comment_added',
    'content_updated',
    'annotation_added';
shareId: z.string().regex(uuidRegex),
    timestamp;
z.date(),
    user;
UserInfoSchema.optional(),
    data;
z.any(),
;
;
// Validation helper functions
export function validateShareContent(content, type) {
    try {
        switch (type) {
            case 'graph':
                return z.object({});
                nodes: z.array(z.any()),
                    edges;
                z.array(z.any()),
                ;
        }
        parse(content) !== null;
        'template';
        return z.object({});
        template: z.string(),
            variables;
        z.record(z.any()),
        ;
    }
    finally { }
    parse(content) !== null;
    'bundle';
    return z.object({});
    version: z.string(),
        generators;
    z.array(z.any()),
    ;
}
parse(content) !== null;
'dataset';
return z.object({});
format: z.string(),
    data;
z.any(),
;
parse(content) !== null;
return false;
try { }
catch {
    return false;
    export function validateShareToken(token) {
        return shareTokenRegex.test(token);
        export function validatePassword(password) {
            if (password.length < 8) {
                return { valid: false, strength: 'weak' };
                const hasUpper = /[A-Z]/.test(password);
                const hasLower = /[a-z]/.test(password);
                const hasNumber = /\d/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
                if (score < 3) {
                    return { valid: false, strength: 'weak' };
                }
                else if (score === 3) {
                    return { valid: true, strength: 'medium' };
                }
                else {
                    return { valid: true, strength: 'strong' };
                    // Export all schemas as a single object for convenience
                    export const SharingSchemas = {
                        // Core types
                        ShareAccessLevel: ShareAccessLevelSchema,
                        SharePermission: SharePermissionSchema,
                        ShareStatus: ShareStatusSchema,
                        ContentType: ContentTypeSchema,
                        // User and collaboration
                        UserInfo: UserInfoSchema,
                        Collaborator: CollaboratorSchema,
                        // Configuration
                        SharingConfig: SharingConfigSchema,
                        ShareSecurityConfig: ShareSecurityConfigSchema,
                        SharingSystemConfig: SharingSystemConfigSchema,
                        // Content and metadata
                        SharedContent: SharedContentSchema,
                        SharedContentMetadata: SharedContentMetadataSchema,
                        VersionControl: VersionControlSchema,
                        ContentAnnotations: ContentAnnotationsSchema,
                        // Analytics
                        ShareAnalytics: ShareAnalyticsSchema,
                        ShareView: ShareViewSchema,
                        ShareDownload: ShareDownloadSchema,
                        CollaborationEvent: CollaborationEventSchema,
                        // API
                        CreateShareRequest: CreateShareRequestSchema,
                        CreateShareResponse: CreateShareResponseSchema,
                        UpdateShareRequest: UpdateShareRequestSchema,
                        ShareAccessRequest: ShareAccessRequestSchema,
                        ShareAccessResponse: ShareAccessResponseSchema,
                        SharePermissionRequest: SharePermissionRequestSchema,
                        ShareAnalyticsRequest: ShareAnalyticsRequestSchema,
                        ShareAnalyticsResponse: ShareAnalyticsResponseSchema,
                        // Events
                        ShareEvent: ShareEventSchema,
                    };
                }
            }
        }
    }
}
