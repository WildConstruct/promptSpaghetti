import { z } from 'zod';
export declare const ResourceTypeSchema: z.ZodEnum<["node", "edge", "property", "position", "graph"]>;
export declare const ChangeTypeSchema: z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change"]>;
export declare const AuthorTypeSchema: z.ZodEnum<["user", "anonymous", "guest", "system", "api"]>;
export declare const AggregationPeriodSchema: z.ZodEnum<["hour", "day", "week", "month"]>;
export declare const CacheTypeSchema: z.ZodEnum<["contributor_stats", "change_heatmap", "timeline_data", "collaboration_metrics"]>;
export declare const ChangeAttributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AttributionAggregationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AttributionSessionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AttributionPrivacySettingsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AttributionStatsCacheSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
export declare const CreateAttributionRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AttributionFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AttributionStatsRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdatePrivacySettingsRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CreateAttributionRequest = z.infer<typeof CreateAttributionRequestSchema>;
export type AttributionFilter = z.infer<typeof AttributionFilterSchema>;
export type AttributionStatsRequest = z.infer<typeof AttributionStatsRequestSchema>;
export type UpdatePrivacySettingsRequest = z.infer<typeof UpdatePrivacySettingsRequestSchema>;
export declare const AttributionStatsResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AttributionTimelineResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ContributorStatsResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
    mostActiveCollaborations: Array<{}, sessionId>;
    string: any;
    authors: string;
    changes: number;
    duration: number;
    efficiency: number;
}
export declare const validateCreateAttributionRequest: (request: unknown) => CreateAttributionRequest;
export declare const validateAttributionFilter: (filter: unknown) => AttributionFilter;
export declare const validateAttributionStatsRequest: (request: unknown) => AttributionStatsRequest;
export declare const validateUpdatePrivacySettingsRequest: (request: unknown) => UpdatePrivacySettingsRequest;
export declare const ATTRIBUTION_DEFAULTS: {
    DEFAULT_RETENTION_DAYS: number;
    DEFAULT_ANONYMIZE_AFTER_DAYS: number;
    MIN_CONFIDENCE_SCORE: number;
    DEFAULT_CHANGE_SIZE: number;
    MAX_BATCH_SIZE: number;
    CACHE_TTL_MINUTES: number;
    SESSION_TIMEOUT_MINUTES: number;
    AGGREGATION_INTERVALS: {
        readonly HOUR: number;
        readonly DAY: number;
        readonly WEEK: number;
        readonly MONTH: number;
    };
    const: {
        readonly node: "Graph node";
        readonly edge: "Graph edge";
        readonly property: "Resource property";
        readonly position: "Node position";
        readonly graph: "Graph metadata";
    };
    interface: any;
    AttributionEvent: any;
}, : any, : any;
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