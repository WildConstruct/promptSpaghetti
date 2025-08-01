import { z } from 'zod';
// Core attribution types
export const ResourceTypeSchema = z.enum(['node', 'edge', 'property', 'position', 'graph']);
export const ChangeTypeSchema = z.enum(['create', 'update', 'delete', 'move', 'property_change', 'connection_change']);
export const AuthorTypeSchema = z.enum(['user', 'anonymous', 'guest', 'system', 'api']);
export const AggregationPeriodSchema = z.enum(['hour', 'day', 'week', 'month']);
export const CacheTypeSchema = z.enum(['contributor_stats', 'change_heatmap', 'timeline_data', 'collaboration_metrics']);
export const ChangeAttributionSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    resourceType: ResourceTypeSchema,
    resourceId: z.string(),
    changeType: ChangeTypeSchema,
    changeOperation: z.string(),
    // Attribution information
    authorId: z.string().uuid().optional(),
    authorType: AuthorTypeSchema,
    authorName: z.string().optional(),
    authorEmail: z.string().email().optional(),
    sessionId: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    // Change details
    changeData: z.record(z.unknown()).default({}),
    oldValue: z.record(z.unknown()).optional(),
    newValue: z.record(z.unknown()).optional(),
    changeSize: z.number().int().default(0),
    // Context information
    snapshotId: z.string().uuid().optional(),
    operationId: z.string().uuid().optional(),
    batchId: z.string().uuid().optional(),
    parentChangeId: z.string().uuid().optional(),
    // Metadata
    changeReason: z.string().optional(),
    changeDescription: z.string().optional(),
    confidenceScore: z.number().min(0).max(1).default(1.0),
    isCollaborative: z.boolean().default(false),
    collaboratorCount: z.number().int().default(1),
    // Timestamps
    createdAt: z.date(),
    effectiveAt: z.date()
});
export const AttributionAggregationSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    authorId: z.string().uuid().optional(),
    authorType: AuthorTypeSchema,
    aggregationPeriod: AggregationPeriodSchema,
    periodStart: z.date(),
    periodEnd: z.date(),
    // Aggregated metrics
    totalChanges: z.number().int().default(0),
    createsCount: z.number().int().default(0),
    updatesCount: z.number().int().default(0),
    deletesCount: z.number().int().default(0),
    movesCount: z.number().int().default(0),
    // Resource type breakdown
    nodeChanges: z.number().int().default(0),
    edgeChanges: z.number().int().default(0),
    propertyChanges: z.number().int().default(0),
    positionChanges: z.number().int().default(0),
    // Collaboration metrics
    collaborativeChanges: z.number().int().default(0),
    uniqueCollaborators: z.number().int().default(0),
    // Size metrics
    totalChangeSize: z.number().int().default(0),
    averageChangeSize: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const AttributionSessionSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    authorId: z.string().uuid().optional(),
    sessionKey: z.string(),
    // Session metadata
    startTime: z.date(),
    endTime: z.date().optional(),
    lastActivity: z.date(),
    durationSeconds: z.number().int().optional(),
    // Session stats
    changesCount: z.number().int().default(0),
    keystrokesCount: z.number().int().default(0),
    mouseEventsCount: z.number().int().default(0),
    // Environment information
    browserInfo: z.record(z.unknown()).optional(),
    deviceInfo: z.record(z.unknown()).optional(),
    locationInfo: z.record(z.unknown()).optional(),
    // Privacy settings
    isAnonymous: z.boolean().default(false),
    trackingConsent: z.boolean().default(true),
    createdAt: z.date(),
});
export const AttributionPrivacySettingsSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    userId: z.string().uuid(),
    // Privacy preferences
    showInAttribution: z.boolean().default(true),
    showDetailedChanges: z.boolean().default(true),
    showTimingInfo: z.boolean().default(true),
    showLocationInfo: z.boolean().default(false),
    // Granularity settings
    trackPropertyChanges: z.boolean().default(true),
    trackPositionChanges: z.boolean().default(true),
    trackMouseMovements: z.boolean().default(false),
    trackKeystrokes: z.boolean().default(false),
    // Retention settings
    retentionDays: z.number().int().default(365),
    autoAnonymizeAfterDays: z.number().int().default(90),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const AttributionStatsCacheSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    cacheKey: z.string(),
    cacheType: CacheTypeSchema,
    cacheData: z.record(z.unknown()),
    cacheMetadata: z.record(z.unknown()).default({}),
    expiresAt: z.date(),
    createdAt: z.date()
});
// Request/response types
export const CreateAttributionRequestSchema = z.object({
    projectId: z.string().uuid(),
    resourceType: ResourceTypeSchema,
    resourceId: z.string(),
    changeType: ChangeTypeSchema,
    changeOperation: z.string(),
    changeData: z.record(z.unknown()).default({}),
    oldValue: z.record(z.unknown()).optional(),
    newValue: z.record(z.unknown()).optional(),
    changeSize: z.number().int().default(0),
    changeReason: z.string().optional(),
    changeDescription: z.string().optional(),
    isCollaborative: z.boolean().default(false),
    collaboratorCount: z.number().int().default(1),
    sessionId: z.string().optional(),
    batchId: z.string().uuid().optional(),
    parentChangeId: z.string().uuid().optional()
});
export const AttributionFilterSchema = z.object({
    projectId: z.string().uuid().optional(),
    resourceType: ResourceTypeSchema.optional(),
    resourceId: z.string().optional(),
    changeType: ChangeTypeSchema.optional(),
    authorId: z.string().uuid().optional(),
    authorType: AuthorTypeSchema.optional(),
    sessionId: z.string().optional(),
    batchId: z.string().uuid().optional(),
    snapshotId: z.string().uuid().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
    isCollaborative: z.boolean().optional(),
    minConfidenceScore: z.number().min(0).max(1).optional(),
    limit: z.number().int().min(1).max(1000).default(100),
    offset: z.number().int().min(0).default(0),
    sortBy: z.enum(['created_at', 'effective_at', 'change_size', 'confidence_score']).default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export const AttributionStatsRequestSchema = z.object({
    projectId: z.string().uuid(),
    period: AggregationPeriodSchema.optional(),
    authorId: z.string().uuid().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    resourceType: ResourceTypeSchema.optional(),
    changeType: ChangeTypeSchema.optional(),
    includeAggregations: z.boolean().default(true),
    includeTimeline: z.boolean().default(false),
    includeHeatmap: z.boolean().default(false),
    includeCollaborationMetrics: z.boolean().default(false),
});
export const UpdatePrivacySettingsRequestSchema = z.object({
    projectId: z.string().uuid(),
    settings: AttributionPrivacySettingsSchema.omit({ id: true, projectId: true, userId: true, createdAt: true, updatedAt: true })
});
// Response types
export const AttributionStatsResponseSchema = z.object({
    overview: z.object({}),
    totalChanges: z.number().int(),
    uniqueAuthors: z.number().int(),
    activeSessions: z.number().int(),
    averageChangeSize: z.number(),
    collaborativeChanges: z.number().int(),
    anonymousChanges: z.number().int(),
}), byAuthor;
(z.object({}),
    authorId);
z.string().uuid().optional(),
    authorName;
z.string().optional(),
    authorType;
AuthorTypeSchema,
    totalChanges;
z.number().int(),
    lastActivity;
z.date(),
    changeTypes;
z.record(z.number().int()),
    resourceTypes;
z.record(z.number().int()),
    averageChangeSize;
z.number(),
    collaborativeChanges;
z.number().int(),
;
byResourceType: z.record(z.number().int()),
    byChangeType;
z.record(z.number().int()),
    timeline;
z.array(z.object({}), timestamp, z.date(), changes, z.number().int(), authors, z.number().int(), averageChangeSize, z.number());
optional(),
    heatmap;
z.record(z.record(z.number().int())).optional(),
    collaboration;
z.object({});
totalCollaborativeSessions: z.number().int(),
    averageCollaboratorsPerSession;
z.number(),
    mostActiveCollaborations;
z.array(z.object({}), sessionId, z.string(), authors, z.array(z.string()), changes, z.number().int(), duration, z.number().int());
optional();
;
export const AttributionTimelineResponseSchema = z.object({
    timeline: z.array(z.object({}), timestamp, z.date(), changes, z.array(z.object({}), id, z.string().uuid(), resourceType, ResourceTypeSchema, resourceId, z.string(), changeType, ChangeTypeSchema, authorName, z.string().optional(), authorType, AuthorTypeSchema, changeDescription, z.string().optional(), isCollaborative, z.boolean(), collaboratorCount, z.number().int()))
});
summary: z.object({});
totalChanges: z.number().int(),
    dateRange;
z.object({});
start: z.date(),
    end;
z.date(),
;
mostActiveAuthor: z.object({});
authorId: z.string().uuid().optional(),
    authorName;
z.string().optional(),
    changes;
z.number().int(),
;
optional(),
    mostActiveResource;
z.object({});
resourceType: ResourceTypeSchema,
    resourceId;
z.string(),
    changes;
z.number().int(),
;
optional();
;
export const ContributorStatsResponseSchema = z.object({
    contributors: z.array(z.object({}), authorId, z.string().uuid().optional(), authorName, z.string().optional(), authorType, AuthorTypeSchema, totalChanges, z.number().int(), firstContribution, z.date(), lastContribution, z.date(), activePeriods, z.array(z.object({}), period, z.date(), changes, z.number().int()))
}), expertise;
(z.object({}),
    resourceType);
ResourceTypeSchema,
    changes;
z.number().int(),
    percentage;
z.number(),
;
collaborations: z.array(z.object({}), sessionId, z.string(), collaborators, z.array(z.string()), changes, z.number().int(), duration, z.number().int());
summary: z.object({});
totalContributors: z.number().int(),
    activeContributors;
z.number().int(),
    newContributors;
z.number().int(),
    returningContributors;
z.number().int(),
    averageContributionsPerUser;
z.number(),
    mostActiveContributor;
z.object({});
authorId: z.string().uuid().optional(),
    authorName;
z.string().optional(),
    changes;
z.number().int(),
;
optional();
;
;
filters: AttributionFilter;
totalDataPoints: number;
;
 > ;
collaborationPatterns: {
    byTimeOfDay: Record;
    byDayOfWeek: Record;
    byResourceType: Record;
}
;
export const validateCreateAttributionRequest = (request) => {
    return CreateAttributionRequestSchema.parse(request);
};
export const validateAttributionFilter = (filter) => {
    return AttributionFilterSchema.parse(filter);
};
export const validateAttributionStatsRequest = (request) => {
    return AttributionStatsRequestSchema.parse(request);
};
export const validateUpdatePrivacySettingsRequest = (request) => {
    return UpdatePrivacySettingsRequestSchema.parse(request);
};
// Constants
export const ATTRIBUTION_DEFAULTS = {
    DEFAULT_RETENTION_DAYS: 365,
    DEFAULT_ANONYMIZE_AFTER_DAYS: 90,
    MIN_CONFIDENCE_SCORE: 0.5,
    DEFAULT_CHANGE_SIZE: 0,
    MAX_BATCH_SIZE: 1000,
    CACHE_TTL_MINUTES: 60,
    SESSION_TIMEOUT_MINUTES: 30,
    AGGREGATION_INTERVALS: {
        HOUR: 60 * 60 * 1000,
        DAY: 24 * 60 * 60 * 1000,
        WEEK: 7 * 24 * 60 * 60 * 1000,
        MONTH: 30 * 24 * 60 * 60 * 1000,
    },
    const: CHANGE_TYPE_DESCRIPTIONS = {
        create: 'New resource created',
        update: 'Resource properties updated',
        delete: 'Resource deleted',
        move: 'Resource position changed',
        property_change: 'Resource property modified',
        connection_change: 'Resource connections modified',
    },
    const: AUTHOR_TYPE_DESCRIPTIONS = {
        user: 'Authenticated user',
        anonymous: 'Anonymous user',
        guest: 'Guest user',
        system: 'System operation',
        api: 'API operation',
    },
    const: RESOURCE_TYPE_DESCRIPTIONS = {
        node: 'Graph node',
        edge: 'Graph edge',
        property: 'Resource property',
        position: 'Node position',
        graph: 'Graph metadata',
    }
};
