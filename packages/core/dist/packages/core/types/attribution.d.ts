import { z } from 'zod';
export declare const ResourceTypeSchema: z.ZodEnum<["node", "edge", "property", "position", "graph"]>;
export declare const ChangeTypeSchema: z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change"]>;
export declare const AuthorTypeSchema: z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>;
export declare const AggregationPeriodSchema: z.ZodEnum<["hour", "day", "week", "month"]>;
export declare const CacheTypeSchema: z.ZodEnum<["contributor_stats", "change_heatmap", "timeline_data", "collaboration_metrics"]>;
export declare const ChangeAttributionSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    resourceType: z.ZodEnum<["node", "edge", "property", "position", "graph"]>;
    resourceId: z.ZodString;
    changeType: z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change"]>;
    changeOperation: z.ZodString;
    authorId: z.ZodOptional<z.ZodString>;
    authorType: z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>;
    authorName: z.ZodOptional<z.ZodString>;
    authorEmail: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    changeData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    oldValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    newValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    changeSize: z.ZodDefault<z.ZodNumber>;
    snapshotId: z.ZodOptional<z.ZodString>;
    operationId: z.ZodOptional<z.ZodString>;
    batchId: z.ZodOptional<z.ZodString>;
    parentChangeId: z.ZodOptional<z.ZodString>;
    changeReason: z.ZodOptional<z.ZodString>;
    changeDescription: z.ZodOptional<z.ZodString>;
    confidenceScore: z.ZodDefault<z.ZodNumber>;
    isCollaborative: z.ZodDefault<z.ZodBoolean>;
    collaboratorCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    effectiveAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    sessionId?: string;
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    ipAddress?: string;
    userAgent?: string;
    confidenceScore?: number;
    operationId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest";
    batchId?: string;
    changeOperation?: string;
    changeData?: Record<string, unknown>;
    changeSize?: number;
    snapshotId?: string;
    parentChangeId?: string;
    changeReason?: string;
    changeDescription?: string;
    collaboratorCount?: number;
    effectiveAt?: Date;
}, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    sessionId?: string;
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    ipAddress?: string;
    userAgent?: string;
    confidenceScore?: number;
    operationId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest";
    batchId?: string;
    changeOperation?: string;
    changeData?: Record<string, unknown>;
    changeSize?: number;
    snapshotId?: string;
    parentChangeId?: string;
    changeReason?: string;
    changeDescription?: string;
    collaboratorCount?: number;
    effectiveAt?: Date;
}>;
export declare const AttributionAggregationSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    authorId: z.ZodOptional<z.ZodString>;
    authorType: z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>;
    aggregationPeriod: z.ZodEnum<["hour", "day", "week", "month"]>;
    periodStart: z.ZodDate;
    periodEnd: z.ZodDate;
    totalChanges: z.ZodDefault<z.ZodNumber>;
    createsCount: z.ZodDefault<z.ZodNumber>;
    updatesCount: z.ZodDefault<z.ZodNumber>;
    deletesCount: z.ZodDefault<z.ZodNumber>;
    movesCount: z.ZodDefault<z.ZodNumber>;
    nodeChanges: z.ZodDefault<z.ZodNumber>;
    edgeChanges: z.ZodDefault<z.ZodNumber>;
    propertyChanges: z.ZodDefault<z.ZodNumber>;
    positionChanges: z.ZodDefault<z.ZodNumber>;
    collaborativeChanges: z.ZodDefault<z.ZodNumber>;
    uniqueCollaborators: z.ZodDefault<z.ZodNumber>;
    totalChangeSize: z.ZodDefault<z.ZodNumber>;
    averageChangeSize: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    projectId?: string;
    authorId?: string;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest";
    aggregationPeriod?: "month" | "week" | "day" | "hour";
    periodStart?: Date;
    periodEnd?: Date;
    totalChanges?: number;
    createsCount?: number;
    updatesCount?: number;
    deletesCount?: number;
    movesCount?: number;
    nodeChanges?: number;
    edgeChanges?: number;
    propertyChanges?: number;
    positionChanges?: number;
    collaborativeChanges?: number;
    uniqueCollaborators?: number;
    totalChangeSize?: number;
    averageChangeSize?: number;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    projectId?: string;
    authorId?: string;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest";
    aggregationPeriod?: "month" | "week" | "day" | "hour";
    periodStart?: Date;
    periodEnd?: Date;
    totalChanges?: number;
    createsCount?: number;
    updatesCount?: number;
    deletesCount?: number;
    movesCount?: number;
    nodeChanges?: number;
    edgeChanges?: number;
    propertyChanges?: number;
    positionChanges?: number;
    collaborativeChanges?: number;
    uniqueCollaborators?: number;
    totalChangeSize?: number;
    averageChangeSize?: number;
}>;
export declare const AttributionSessionSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    authorId: z.ZodOptional<z.ZodString>;
    sessionKey: z.ZodString;
    startTime: z.ZodDate;
    endTime: z.ZodOptional<z.ZodDate>;
    lastActivity: z.ZodDate;
    durationSeconds: z.ZodOptional<z.ZodNumber>;
    changesCount: z.ZodDefault<z.ZodNumber>;
    keystrokesCount: z.ZodDefault<z.ZodNumber>;
    mouseEventsCount: z.ZodDefault<z.ZodNumber>;
    browserInfo: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    deviceInfo: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    locationInfo: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    trackingConsent: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    authorId?: string;
    startTime?: Date;
    endTime?: Date;
    deviceInfo?: Record<string, unknown>;
    sessionKey?: string;
    lastActivity?: Date;
    durationSeconds?: number;
    changesCount?: number;
    keystrokesCount?: number;
    mouseEventsCount?: number;
    browserInfo?: Record<string, unknown>;
    locationInfo?: Record<string, unknown>;
    isAnonymous?: boolean;
    trackingConsent?: boolean;
}, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    authorId?: string;
    startTime?: Date;
    endTime?: Date;
    deviceInfo?: Record<string, unknown>;
    sessionKey?: string;
    lastActivity?: Date;
    durationSeconds?: number;
    changesCount?: number;
    keystrokesCount?: number;
    mouseEventsCount?: number;
    browserInfo?: Record<string, unknown>;
    locationInfo?: Record<string, unknown>;
    isAnonymous?: boolean;
    trackingConsent?: boolean;
}>;
export declare const AttributionPrivacySettingsSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    userId: z.ZodString;
    showInAttribution: z.ZodDefault<z.ZodBoolean>;
    showDetailedChanges: z.ZodDefault<z.ZodBoolean>;
    showTimingInfo: z.ZodDefault<z.ZodBoolean>;
    showLocationInfo: z.ZodDefault<z.ZodBoolean>;
    trackPropertyChanges: z.ZodDefault<z.ZodBoolean>;
    trackPositionChanges: z.ZodDefault<z.ZodBoolean>;
    trackMouseMovements: z.ZodDefault<z.ZodBoolean>;
    trackKeystrokes: z.ZodDefault<z.ZodBoolean>;
    retentionDays: z.ZodDefault<z.ZodNumber>;
    autoAnonymizeAfterDays: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
    projectId?: string;
    retentionDays?: number;
    showInAttribution?: boolean;
    showDetailedChanges?: boolean;
    showTimingInfo?: boolean;
    showLocationInfo?: boolean;
    trackPropertyChanges?: boolean;
    trackPositionChanges?: boolean;
    trackMouseMovements?: boolean;
    trackKeystrokes?: boolean;
    autoAnonymizeAfterDays?: number;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
    projectId?: string;
    retentionDays?: number;
    showInAttribution?: boolean;
    showDetailedChanges?: boolean;
    showTimingInfo?: boolean;
    showLocationInfo?: boolean;
    trackPropertyChanges?: boolean;
    trackPositionChanges?: boolean;
    trackMouseMovements?: boolean;
    trackKeystrokes?: boolean;
    autoAnonymizeAfterDays?: number;
}>;
export declare const AttributionStatsCacheSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    cacheKey: z.ZodString;
    cacheType: z.ZodEnum<["contributor_stats", "change_heatmap", "timeline_data", "collaboration_metrics"]>;
    cacheData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    cacheMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    expiresAt: z.ZodDate;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    expiresAt?: Date;
    cacheKey?: string;
    cacheType?: "contributor_stats" | "change_heatmap" | "timeline_data" | "collaboration_metrics";
    cacheData?: Record<string, unknown>;
    cacheMetadata?: Record<string, unknown>;
}, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    expiresAt?: Date;
    cacheKey?: string;
    cacheType?: "contributor_stats" | "change_heatmap" | "timeline_data" | "collaboration_metrics";
    cacheData?: Record<string, unknown>;
    cacheMetadata?: Record<string, unknown>;
}>;
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type ChangeType = z.infer<typeof ChangeTypeSchema>;
export type AuthorType = z.infer<typeof AuthorTypeSchema>;
export type AggregationPeriod = z.infer<typeof AggregationPeriodSchema>;
export type CacheType = z.infer<typeof CacheTypeSchema>;
export type ChangeAttribution = z.infer<typeof ChangeAttributionSchema>;
export type AttributionAggregation = z.infer<typeof AttributionAggregationSchema>;
export type AttributionSession = z.infer<typeof AttributionSessionSchema>;
export type AttributionPrivacySettings = z.infer<typeof AttributionPrivacySettingsSchema>;
export type AttributionStatsCache = z.infer<typeof AttributionStatsCacheSchema>;
export declare const CreateAttributionRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    resourceType: z.ZodEnum<["node", "edge", "property", "position", "graph"]>;
    resourceId: z.ZodString;
    changeType: z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change"]>;
    changeOperation: z.ZodString;
    changeData: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    oldValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    newValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    changeSize: z.ZodDefault<z.ZodNumber>;
    changeReason: z.ZodOptional<z.ZodString>;
    changeDescription: z.ZodOptional<z.ZodString>;
    isCollaborative: z.ZodDefault<z.ZodBoolean>;
    collaboratorCount: z.ZodDefault<z.ZodNumber>;
    sessionId: z.ZodOptional<z.ZodString>;
    batchId: z.ZodOptional<z.ZodString>;
    parentChangeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectId?: string;
    sessionId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    batchId?: string;
    changeOperation?: string;
    changeData?: Record<string, unknown>;
    changeSize?: number;
    parentChangeId?: string;
    changeReason?: string;
    changeDescription?: string;
    collaboratorCount?: number;
}, {
    projectId?: string;
    sessionId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    batchId?: string;
    changeOperation?: string;
    changeData?: Record<string, unknown>;
    changeSize?: number;
    parentChangeId?: string;
    changeReason?: string;
    changeDescription?: string;
    collaboratorCount?: number;
}>;
export declare const AttributionFilterSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    resourceType: z.ZodOptional<z.ZodEnum<["node", "edge", "property", "position", "graph"]>>;
    resourceId: z.ZodOptional<z.ZodString>;
    changeType: z.ZodOptional<z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change"]>>;
    authorId: z.ZodOptional<z.ZodString>;
    authorType: z.ZodOptional<z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>>;
    sessionId: z.ZodOptional<z.ZodString>;
    batchId: z.ZodOptional<z.ZodString>;
    snapshotId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    isCollaborative: z.ZodOptional<z.ZodBoolean>;
    minConfidenceScore: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["created_at", "effective_at", "change_size", "confidence_score"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "created_at" | "confidence_score" | "effective_at" | "change_size";
    sortOrder?: "asc" | "desc";
    sessionId?: string;
    authorId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    dateFrom?: Date;
    dateTo?: Date;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest";
    batchId?: string;
    snapshotId?: string;
    minConfidenceScore?: number;
}, {
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "created_at" | "confidence_score" | "effective_at" | "change_size";
    sortOrder?: "asc" | "desc";
    sessionId?: string;
    authorId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    dateFrom?: Date;
    dateTo?: Date;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest";
    batchId?: string;
    snapshotId?: string;
    minConfidenceScore?: number;
}>;
export declare const AttributionStatsRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    period: z.ZodOptional<z.ZodEnum<["hour", "day", "week", "month"]>>;
    authorId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    resourceType: z.ZodOptional<z.ZodEnum<["node", "edge", "property", "position", "graph"]>>;
    changeType: z.ZodOptional<z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change"]>>;
    includeAggregations: z.ZodDefault<z.ZodBoolean>;
    includeTimeline: z.ZodDefault<z.ZodBoolean>;
    includeHeatmap: z.ZodDefault<z.ZodBoolean>;
    includeCollaborationMetrics: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    projectId?: string;
    authorId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    period?: "month" | "week" | "day" | "hour";
    startDate?: Date;
    endDate?: Date;
    includeAggregations?: boolean;
    includeTimeline?: boolean;
    includeHeatmap?: boolean;
    includeCollaborationMetrics?: boolean;
}, {
    projectId?: string;
    authorId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
    resourceType?: "position" | "graph" | "node" | "property" | "edge";
    period?: "month" | "week" | "day" | "hour";
    startDate?: Date;
    endDate?: Date;
    includeAggregations?: boolean;
    includeTimeline?: boolean;
    includeHeatmap?: boolean;
    includeCollaborationMetrics?: boolean;
}>;
export declare const UpdatePrivacySettingsRequestSchema: z.ZodObject<{
    projectId: z.ZodString;
    settings: z.ZodObject<Omit<{
        id: z.ZodString;
        projectId: z.ZodString;
        userId: z.ZodString;
        showInAttribution: z.ZodDefault<z.ZodBoolean>;
        showDetailedChanges: z.ZodDefault<z.ZodBoolean>;
        showTimingInfo: z.ZodDefault<z.ZodBoolean>;
        showLocationInfo: z.ZodDefault<z.ZodBoolean>;
        trackPropertyChanges: z.ZodDefault<z.ZodBoolean>;
        trackPositionChanges: z.ZodDefault<z.ZodBoolean>;
        trackMouseMovements: z.ZodDefault<z.ZodBoolean>;
        trackKeystrokes: z.ZodDefault<z.ZodBoolean>;
        retentionDays: z.ZodDefault<z.ZodNumber>;
        autoAnonymizeAfterDays: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "id" | "createdAt" | "updatedAt" | "userId" | "projectId">, "strip", z.ZodTypeAny, {
        retentionDays?: number;
        showInAttribution?: boolean;
        showDetailedChanges?: boolean;
        showTimingInfo?: boolean;
        showLocationInfo?: boolean;
        trackPropertyChanges?: boolean;
        trackPositionChanges?: boolean;
        trackMouseMovements?: boolean;
        trackKeystrokes?: boolean;
        autoAnonymizeAfterDays?: number;
    }, {
        retentionDays?: number;
        showInAttribution?: boolean;
        showDetailedChanges?: boolean;
        showTimingInfo?: boolean;
        showLocationInfo?: boolean;
        trackPropertyChanges?: boolean;
        trackPositionChanges?: boolean;
        trackMouseMovements?: boolean;
        trackKeystrokes?: boolean;
        autoAnonymizeAfterDays?: number;
    }>;
}, "strip", z.ZodTypeAny, {
    settings?: {
        retentionDays?: number;
        showInAttribution?: boolean;
        showDetailedChanges?: boolean;
        showTimingInfo?: boolean;
        showLocationInfo?: boolean;
        trackPropertyChanges?: boolean;
        trackPositionChanges?: boolean;
        trackMouseMovements?: boolean;
        trackKeystrokes?: boolean;
        autoAnonymizeAfterDays?: number;
    };
    projectId?: string;
}, {
    settings?: {
        retentionDays?: number;
        showInAttribution?: boolean;
        showDetailedChanges?: boolean;
        showTimingInfo?: boolean;
        showLocationInfo?: boolean;
        trackPropertyChanges?: boolean;
        trackPositionChanges?: boolean;
        trackMouseMovements?: boolean;
        trackKeystrokes?: boolean;
        autoAnonymizeAfterDays?: number;
    };
    projectId?: string;
}>;
export type CreateAttributionRequest = z.infer<typeof CreateAttributionRequestSchema>;
export type AttributionFilter = z.infer<typeof AttributionFilterSchema>;
export type AttributionStatsRequest = z.infer<typeof AttributionStatsRequestSchema>;
export type UpdatePrivacySettingsRequest = z.infer<typeof UpdatePrivacySettingsRequestSchema>;
export declare const AttributionStatsResponseSchema: z.ZodObject<{
    overview: z.ZodObject<{
        totalChanges: z.ZodNumber;
        uniqueAuthors: z.ZodNumber;
        activeSessions: z.ZodNumber;
        averageChangeSize: z.ZodNumber;
        collaborativeChanges: z.ZodNumber;
        anonymousChanges: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        activeSessions?: number;
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        uniqueAuthors?: number;
        anonymousChanges?: number;
    }, {
        activeSessions?: number;
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        uniqueAuthors?: number;
        anonymousChanges?: number;
    }>;
    byAuthor: z.ZodArray<z.ZodObject<{
        authorId: z.ZodOptional<z.ZodString>;
        authorName: z.ZodOptional<z.ZodString>;
        authorType: z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>;
        totalChanges: z.ZodNumber;
        lastActivity: z.ZodDate;
        changeTypes: z.ZodRecord<z.ZodString, z.ZodNumber>;
        resourceTypes: z.ZodRecord<z.ZodString, z.ZodNumber>;
        averageChangeSize: z.ZodNumber;
        collaborativeChanges: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        authorId?: string;
        authorName?: string;
        resourceTypes?: Record<string, number>;
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        lastActivity?: Date;
        changeTypes?: Record<string, number>;
    }, {
        authorId?: string;
        authorName?: string;
        resourceTypes?: Record<string, number>;
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        lastActivity?: Date;
        changeTypes?: Record<string, number>;
    }>, "many">;
    byResourceType: z.ZodRecord<z.ZodString, z.ZodNumber>;
    byChangeType: z.ZodRecord<z.ZodString, z.ZodNumber>;
    timeline: z.ZodOptional<z.ZodArray<z.ZodObject<{
        timestamp: z.ZodDate;
        changes: z.ZodNumber;
        authors: z.ZodNumber;
        averageChangeSize: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timestamp?: Date;
        changes?: number;
        averageChangeSize?: number;
        authors?: number;
    }, {
        timestamp?: Date;
        changes?: number;
        averageChangeSize?: number;
        authors?: number;
    }>, "many">>;
    heatmap: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>>;
    collaboration: z.ZodOptional<z.ZodObject<{
        totalCollaborativeSessions: z.ZodNumber;
        averageCollaboratorsPerSession: z.ZodNumber;
        mostActiveCollaborations: z.ZodArray<z.ZodObject<{
            sessionId: z.ZodString;
            authors: z.ZodArray<z.ZodString, "many">;
            changes: z.ZodNumber;
            duration: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            duration?: number;
            sessionId?: string;
            changes?: number;
            authors?: string[];
        }, {
            duration?: number;
            sessionId?: string;
            changes?: number;
            authors?: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        totalCollaborativeSessions?: number;
        averageCollaboratorsPerSession?: number;
        mostActiveCollaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            authors?: string[];
        }[];
    }, {
        totalCollaborativeSessions?: number;
        averageCollaboratorsPerSession?: number;
        mostActiveCollaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            authors?: string[];
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    collaboration?: {
        totalCollaborativeSessions?: number;
        averageCollaboratorsPerSession?: number;
        mostActiveCollaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            authors?: string[];
        }[];
    };
    timeline?: {
        timestamp?: Date;
        changes?: number;
        averageChangeSize?: number;
        authors?: number;
    }[];
    overview?: {
        activeSessions?: number;
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        uniqueAuthors?: number;
        anonymousChanges?: number;
    };
    byAuthor?: {
        authorId?: string;
        authorName?: string;
        resourceTypes?: Record<string, number>;
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        lastActivity?: Date;
        changeTypes?: Record<string, number>;
    }[];
    byResourceType?: Record<string, number>;
    byChangeType?: Record<string, number>;
    heatmap?: Record<string, Record<string, number>>;
}, {
    collaboration?: {
        totalCollaborativeSessions?: number;
        averageCollaboratorsPerSession?: number;
        mostActiveCollaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            authors?: string[];
        }[];
    };
    timeline?: {
        timestamp?: Date;
        changes?: number;
        averageChangeSize?: number;
        authors?: number;
    }[];
    overview?: {
        activeSessions?: number;
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        uniqueAuthors?: number;
        anonymousChanges?: number;
    };
    byAuthor?: {
        authorId?: string;
        authorName?: string;
        resourceTypes?: Record<string, number>;
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        collaborativeChanges?: number;
        averageChangeSize?: number;
        lastActivity?: Date;
        changeTypes?: Record<string, number>;
    }[];
    byResourceType?: Record<string, number>;
    byChangeType?: Record<string, number>;
    heatmap?: Record<string, Record<string, number>>;
}>;
export declare const AttributionTimelineResponseSchema: z.ZodObject<{
    timeline: z.ZodArray<z.ZodObject<{
        timestamp: z.ZodDate;
        changes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            resourceType: z.ZodEnum<["node", "edge", "property", "position", "graph"]>;
            resourceId: z.ZodString;
            changeType: z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change"]>;
            authorName: z.ZodOptional<z.ZodString>;
            authorType: z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>;
            changeDescription: z.ZodOptional<z.ZodString>;
            isCollaborative: z.ZodBoolean;
            collaboratorCount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            authorName?: string;
            changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
            isCollaborative?: boolean;
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            authorType?: "system" | "user" | "anonymous" | "api" | "guest";
            changeDescription?: string;
            collaboratorCount?: number;
        }, {
            id?: string;
            authorName?: string;
            changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
            isCollaborative?: boolean;
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            authorType?: "system" | "user" | "anonymous" | "api" | "guest";
            changeDescription?: string;
            collaboratorCount?: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        timestamp?: Date;
        changes?: {
            id?: string;
            authorName?: string;
            changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
            isCollaborative?: boolean;
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            authorType?: "system" | "user" | "anonymous" | "api" | "guest";
            changeDescription?: string;
            collaboratorCount?: number;
        }[];
    }, {
        timestamp?: Date;
        changes?: {
            id?: string;
            authorName?: string;
            changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
            isCollaborative?: boolean;
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            authorType?: "system" | "user" | "anonymous" | "api" | "guest";
            changeDescription?: string;
            collaboratorCount?: number;
        }[];
    }>, "many">;
    summary: z.ZodObject<{
        totalChanges: z.ZodNumber;
        dateRange: z.ZodObject<{
            start: z.ZodDate;
            end: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            start?: Date;
            end?: Date;
        }, {
            start?: Date;
            end?: Date;
        }>;
        mostActiveAuthor: z.ZodOptional<z.ZodObject<{
            authorId: z.ZodOptional<z.ZodString>;
            authorName: z.ZodOptional<z.ZodString>;
            changes: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            authorId?: string;
            authorName?: string;
            changes?: number;
        }, {
            authorId?: string;
            authorName?: string;
            changes?: number;
        }>>;
        mostActiveResource: z.ZodOptional<z.ZodObject<{
            resourceType: z.ZodEnum<["node", "edge", "property", "position", "graph"]>;
            resourceId: z.ZodString;
            changes: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }, {
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        totalChanges?: number;
        mostActiveAuthor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
        mostActiveResource?: {
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        };
    }, {
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        totalChanges?: number;
        mostActiveAuthor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
        mostActiveResource?: {
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    summary?: {
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        totalChanges?: number;
        mostActiveAuthor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
        mostActiveResource?: {
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        };
    };
    timeline?: {
        timestamp?: Date;
        changes?: {
            id?: string;
            authorName?: string;
            changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
            isCollaborative?: boolean;
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            authorType?: "system" | "user" | "anonymous" | "api" | "guest";
            changeDescription?: string;
            collaboratorCount?: number;
        }[];
    }[];
}, {
    summary?: {
        dateRange?: {
            start?: Date;
            end?: Date;
        };
        totalChanges?: number;
        mostActiveAuthor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
        mostActiveResource?: {
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        };
    };
    timeline?: {
        timestamp?: Date;
        changes?: {
            id?: string;
            authorName?: string;
            changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change";
            isCollaborative?: boolean;
            resourceId?: string;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            authorType?: "system" | "user" | "anonymous" | "api" | "guest";
            changeDescription?: string;
            collaboratorCount?: number;
        }[];
    }[];
}>;
export declare const ContributorStatsResponseSchema: z.ZodObject<{
    contributors: z.ZodArray<z.ZodObject<{
        authorId: z.ZodOptional<z.ZodString>;
        authorName: z.ZodOptional<z.ZodString>;
        authorType: z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>;
        totalChanges: z.ZodNumber;
        firstContribution: z.ZodDate;
        lastContribution: z.ZodDate;
        activePeriods: z.ZodArray<z.ZodObject<{
            period: z.ZodDate;
            changes: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            period?: Date;
            changes?: number;
        }, {
            period?: Date;
            changes?: number;
        }>, "many">;
        expertise: z.ZodArray<z.ZodObject<{
            resourceType: z.ZodEnum<["node", "edge", "property", "position", "graph"]>;
            changes: z.ZodNumber;
            percentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            percentage?: number;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }, {
            percentage?: number;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }>, "many">;
        collaborations: z.ZodArray<z.ZodObject<{
            sessionId: z.ZodString;
            collaborators: z.ZodArray<z.ZodString, "many">;
            changes: z.ZodNumber;
            duration: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            duration?: number;
            sessionId?: string;
            changes?: number;
            collaborators?: string[];
        }, {
            duration?: number;
            sessionId?: string;
            changes?: number;
            collaborators?: string[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        authorId?: string;
        authorName?: string;
        expertise?: {
            percentage?: number;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }[];
        collaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            collaborators?: string[];
        }[];
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        firstContribution?: Date;
        lastContribution?: Date;
        activePeriods?: {
            period?: Date;
            changes?: number;
        }[];
    }, {
        authorId?: string;
        authorName?: string;
        expertise?: {
            percentage?: number;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }[];
        collaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            collaborators?: string[];
        }[];
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        firstContribution?: Date;
        lastContribution?: Date;
        activePeriods?: {
            period?: Date;
            changes?: number;
        }[];
    }>, "many">;
    summary: z.ZodObject<{
        totalContributors: z.ZodNumber;
        activeContributors: z.ZodNumber;
        newContributors: z.ZodNumber;
        returningContributors: z.ZodNumber;
        averageContributionsPerUser: z.ZodNumber;
        mostActiveContributor: z.ZodOptional<z.ZodObject<{
            authorId: z.ZodOptional<z.ZodString>;
            authorName: z.ZodOptional<z.ZodString>;
            changes: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            authorId?: string;
            authorName?: string;
            changes?: number;
        }, {
            authorId?: string;
            authorName?: string;
            changes?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        totalContributors?: number;
        activeContributors?: number;
        newContributors?: number;
        returningContributors?: number;
        averageContributionsPerUser?: number;
        mostActiveContributor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
    }, {
        totalContributors?: number;
        activeContributors?: number;
        newContributors?: number;
        returningContributors?: number;
        averageContributionsPerUser?: number;
        mostActiveContributor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    summary?: {
        totalContributors?: number;
        activeContributors?: number;
        newContributors?: number;
        returningContributors?: number;
        averageContributionsPerUser?: number;
        mostActiveContributor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
    };
    contributors?: {
        authorId?: string;
        authorName?: string;
        expertise?: {
            percentage?: number;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }[];
        collaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            collaborators?: string[];
        }[];
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        firstContribution?: Date;
        lastContribution?: Date;
        activePeriods?: {
            period?: Date;
            changes?: number;
        }[];
    }[];
}, {
    summary?: {
        totalContributors?: number;
        activeContributors?: number;
        newContributors?: number;
        returningContributors?: number;
        averageContributionsPerUser?: number;
        mostActiveContributor?: {
            authorId?: string;
            authorName?: string;
            changes?: number;
        };
    };
    contributors?: {
        authorId?: string;
        authorName?: string;
        expertise?: {
            percentage?: number;
            resourceType?: "position" | "graph" | "node" | "property" | "edge";
            changes?: number;
        }[];
        collaborations?: {
            duration?: number;
            sessionId?: string;
            changes?: number;
            collaborators?: string[];
        }[];
        authorType?: "system" | "user" | "anonymous" | "api" | "guest";
        totalChanges?: number;
        firstContribution?: Date;
        lastContribution?: Date;
        activePeriods?: {
            period?: Date;
            changes?: number;
        }[];
    }[];
}>;
export type AttributionStatsResponse = z.infer<typeof AttributionStatsResponseSchema>;
export type AttributionTimelineResponse = z.infer<typeof AttributionTimelineResponseSchema>;
export type ContributorStatsResponse = z.infer<typeof ContributorStatsResponseSchema>;
export interface AttributionContext {
    projectId: string;
    userId?: string;
    sessionId?: string;
    batchId?: string;
    ipAddress?: string;
    userAgent?: string;
    isAnonymous?: boolean;
    trackingConsent?: boolean;
}
export interface ChangeEvent {
    resourceType: ResourceType;
    resourceId: string;
    changeType: ChangeType;
    changeOperation: string;
    oldValue?: any;
    newValue?: any;
    changeSize?: number;
    changeReason?: string;
    changeDescription?: string;
    isCollaborative?: boolean;
    collaboratorCount?: number;
    parentChangeId?: string;
}
export interface AttributionVisualization {
    type: 'timeline' | 'heatmap' | 'contributor_chart' | 'collaboration_graph';
    data: any;
    metadata: {
        generatedAt: Date;
        dateRange: {
            start: Date;
            end: Date;
        };
        filters: AttributionFilter;
        totalDataPoints: number;
    };
}
export interface CollaborationMetrics {
    totalSessions: number;
    averageSessionDuration: number;
    averageCollaboratorsPerSession: number;
    mostActiveCollaborations: Array<{
        sessionId: string;
        authors: string[];
        changes: number;
        duration: number;
        efficiency: number;
    }>;
    collaborationPatterns: {
        byTimeOfDay: Record<string, number>;
        byDayOfWeek: Record<string, number>;
        byResourceType: Record<string, number>;
    };
}
export declare const validateCreateAttributionRequest: (request: unknown) => CreateAttributionRequest;
export declare const validateAttributionFilter: (filter: unknown) => AttributionFilter;
export declare const validateAttributionStatsRequest: (request: unknown) => AttributionStatsRequest;
export declare const validateUpdatePrivacySettingsRequest: (request: unknown) => UpdatePrivacySettingsRequest;
export declare const ATTRIBUTION_DEFAULTS: {
    readonly DEFAULT_RETENTION_DAYS: 365;
    readonly DEFAULT_ANONYMIZE_AFTER_DAYS: 90;
    readonly MIN_CONFIDENCE_SCORE: 0.5;
    readonly DEFAULT_CHANGE_SIZE: 0;
    readonly MAX_BATCH_SIZE: 1000;
    readonly CACHE_TTL_MINUTES: 60;
    readonly SESSION_TIMEOUT_MINUTES: 30;
    readonly AGGREGATION_INTERVALS: {
        readonly HOUR: number;
        readonly DAY: number;
        readonly WEEK: number;
        readonly MONTH: number;
    };
};
export declare const CHANGE_TYPE_DESCRIPTIONS: {
    readonly create: "New resource created";
    readonly update: "Resource properties updated";
    readonly delete: "Resource deleted";
    readonly move: "Resource position changed";
    readonly property_change: "Resource property modified";
    readonly connection_change: "Resource connections modified";
};
export declare const AUTHOR_TYPE_DESCRIPTIONS: {
    readonly user: "Authenticated user";
    readonly anonymous: "Anonymous user";
    readonly guest: "Guest user";
    readonly system: "System operation";
    readonly api: "API operation";
};
export declare const RESOURCE_TYPE_DESCRIPTIONS: {
    readonly node: "Graph node";
    readonly edge: "Graph edge";
    readonly property: "Resource property";
    readonly position: "Node position";
    readonly graph: "Graph metadata";
};
export interface AttributionEvent {
    type: 'attribution_created' | 'attribution_updated' | 'session_started' | 'session_ended';
    data: ChangeAttribution | AttributionSession;
    timestamp: Date;
    projectId: string;
    sessionId?: string;
}
export interface AttributionNotification {
    type: 'contributor_milestone' | 'collaboration_started' | 'significant_change';
    title: string;
    message: string;
    data: any;
    timestamp: Date;
    projectId: string;
    authorId?: string;
}
//# sourceMappingURL=attribution.d.ts.map