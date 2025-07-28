/**
 * Sharing Data Validation Schemas - Epic 16 Implementation
 * Comprehensive Zod schemas for runtime validation of sharing data
 */
import { z } from 'zod';
export declare const ShareAccessLevelSchema: z.ZodEnum<["public", "restricted", "private"]>;
export declare const SharePermissionSchema: z.ZodEnum<["view", "comment", "edit", "admin"]>;
export declare const ShareStatusSchema: z.ZodEnum<["active", "expired", "revoked", "pending"]>;
export declare const ContentTypeSchema: z.ZodEnum<["graph", "template", "bundle", "dataset"]>;
export declare const UserInfoSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CollaboratorSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareSecurityConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SharingConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ContentVersionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const MergeConflictSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const VersionControlSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ConnectionLabelSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const StickyNoteSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AnnotationRegionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareCommentSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ContentAnnotationsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SharedContentMetadataSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const GeoLocationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ViewerInfoSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareViewSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareDownloadSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CollaborationEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const GeographicStatsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const DeviceStatsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ConversionMetricsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareAnalyticsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SharedContentSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateShareRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateShareResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateShareRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareAccessRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareAccessResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SharePermissionRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareAnalyticsRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareAnalyticsResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SharingSystemConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare function validateShareContent(content: unknown, type: string): boolean;
//# sourceMappingURL=sharing-schemas.d.ts.map