/**
 * Epic 16 Marketplace Sharing System - Data Types
 *
 * Comprehensive sharing functionality for templates, graphs, and marketplace content.
 * Supports direct links, social integration, embeds, and analytics tracking.
 *
 * Task: E16-1753114247020-65B7A3 - Design sharing system
 */
import { z } from 'zod';
export type ShareableResourceType = 'template' | 'graph' | 'collection' | 'case_study' | 'tutorial' | 'marketplace_item';
export type ShareTarget = 'public' | 'workspace' | 'organization' | 'private' | 'unlisted';
export type ShareFormat = 'link' | 'embed' | 'export' | 'clone';
export type SocialPlatform = 'twitter' | 'linkedin' | 'discord' | 'slack' | 'teams' | 'email' | 'github';
export declare const SharePermissionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SharePermission = z.infer<typeof SharePermissionSchema>;
export declare const ShareConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ShareConfig = z.infer<typeof ShareConfigSchema>;
export declare const ShareLinkSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ShareLink = z.infer<typeof ShareLinkSchema>;
export declare const ShareAnalyticsEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ShareAnalyticsEvent = z.infer<typeof ShareAnalyticsEventSchema>;
export declare const ShareMetricsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ShareMetrics = z.infer<typeof ShareMetricsSchema>;
export declare const SocialIntegrationSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SocialIntegration = z.infer<typeof SocialIntegrationSchema>;
export declare const ShareCollectionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type ShareCollection = z.infer<typeof ShareCollectionSchema>;
export declare const CreateShareRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ShareResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CreateShareRequest = z.infer<typeof CreateShareRequestSchema>;
export type ShareResponse = z.infer<typeof ShareResponseSchema>;
export declare const validateCreateShareRequest: (data: unknown) => CreateShareRequest;
export declare const validateShareConfig: (data: unknown) => ShareConfig;
export declare const validateShareAnalyticsEvent: (data: unknown) => ShareAnalyticsEvent;
declare const ShareableResourceTypeSchema: z.ZodEnum<["template", "graph", "collection", "case_study", "tutorial", "marketplace_item"]>;
declare const ShareTargetSchema: any;
declare const ShareFormatSchema: any;
declare const SocialPlatformSchema: any;
export interface ShareSystemConfig {
    enabledPlatforms: SocialPlatform;
    defaultPermissions: SharePermission;
    analyticsRetentionDays: number;
    maxSharesPerUser: number;
    rateLimiting: {
        sharesPerHour: number;
        embedsPerHour: number;
    };
    customization: {
        allowCustomBranding: boolean;
        allowCustomDomains: boolean;
        maxEmbedSize: {
            width: number;
            height: number;
        };
    };
}
export { SharePermissionSchema, ShareConfigSchema, ShareLinkSchema, ShareAnalyticsEventSchema, ShareMetricsSchema, SocialIntegrationSchema, ShareCollectionSchema, CreateShareRequestSchema, ShareResponseSchema, ShareableResourceTypeSchema, ShareTargetSchema, ShareFormatSchema, SocialPlatformSchema };
//# sourceMappingURL=sharingTypes.d.ts.map