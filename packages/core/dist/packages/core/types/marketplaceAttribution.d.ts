/**
 * Epic 16 Marketplace Attribution System
 * Task: E16-1753114247138-03634F - Add attribution system
 *
 * Enhanced attribution types and schemas for marketplace template creation,
 * ownership tracking, revenue attribution, and creator analytics.
 */
import { z } from 'zod';
export declare const MarketplaceResourceTypeSchema: z.ZodEnum<[string, ...string[]]>;
export declare const MarketplaceChangeTypeSchema: z.ZodEnum<[string, ...string[]]>;
export declare const MarketplaceAuthorTypeSchema: z.ZodEnum<[string, ...string[]]>;
export declare const TemplateAttributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const RevenueAttributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreatorAttributionProfileSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const MarketplaceAttributionAnalyticsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type MarketplaceResourceType = z.infer<typeof MarketplaceResourceTypeSchema>;
export type MarketplaceChangeType = z.infer<typeof MarketplaceChangeTypeSchema>;
export type MarketplaceAuthorType = z.infer<typeof MarketplaceAuthorTypeSchema>;
export type TemplateAttribution = z.infer<typeof TemplateAttributionSchema>;
export type RevenueAttribution = z.infer<typeof RevenueAttributionSchema>;
export type CreatorAttributionProfile = z.infer<typeof CreatorAttributionProfileSchema>;
export type MarketplaceAttributionAnalytics = z.infer<typeof MarketplaceAttributionAnalyticsSchema>;
export declare const MarketplaceChangeAttributionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const MarketplaceAttributionFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type MarketplaceChangeAttribution = z.infer<typeof MarketplaceChangeAttributionSchema>;
export type MarketplaceAttributionFilter = z.infer<typeof MarketplaceAttributionFilterSchema>;
export declare const CreateTemplateAttributionRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateAttributionClaimRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateRevenueAttributionRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CreateTemplateAttributionRequest = z.infer<typeof CreateTemplateAttributionRequestSchema>;
export type CreateAttributionClaimRequest = z.infer<typeof CreateAttributionClaimRequestSchema>;
export type UpdateRevenueAttributionRequest = z.infer<typeof UpdateRevenueAttributionRequestSchema>;
export declare const TemplateAttributionResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreatorDashboardResponseSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type TemplateAttributionResponse = z.infer<typeof TemplateAttributionResponseSchema>;
export type CreatorDashboardResponse = z.infer<typeof CreatorDashboardResponseSchema>;
export declare const MARKETPLACE_RESOURCE_TYPE_DESCRIPTIONS: {
    readonly template: "Marketplace template";
    readonly template_version: "Template version";
    readonly template_purchase: "Template purchase";
    readonly template_review: "Template review";
    readonly template_collection: "Template collection";
    readonly creator_profile: "Creator profile";
    readonly revenue_record: "Revenue record";
    readonly attribution_claim: "Attribution claim";
};
export declare const MARKETPLACE_CHANGE_TYPE_DESCRIPTIONS: {
    readonly template_create: "Template created";
    readonly template_publish: "Template published";
    readonly template_purchase: "Template purchased";
    readonly template_review: "Template reviewed";
    readonly revenue_earned: "Revenue earned";
    readonly attribution_assigned: "Attribution assigned";
    readonly collaboration_joined: "Collaboration joined";
    readonly template_derived: "Template derived";
    readonly collection_add: "Added to collection";
    readonly creator_verified: "Creator verified";
};
export declare const MARKETPLACE_ATTRIBUTION_DEFAULTS: {
    readonly DEFAULT_CREATOR_SHARE: 85;
    readonly DEFAULT_PLATFORM_FEE: 15;
    readonly DEFAULT_COLLABORATION_THRESHOLD: 10;
    readonly VERIFICATION_REQUIRED_THRESHOLD: 1000;
    readonly CLAIM_RESOLUTION_DAYS: 14;
    readonly REVENUE_HOLD_DAYS: 7;
    readonly MIN_CONFIDENCE_SCORE: 0.8;
};
export declare const validateCreateTemplateAttributionRequest: (request: unknown) => CreateTemplateAttributionRequest;
export declare const validateCreateAttributionClaimRequest: (request: unknown) => CreateAttributionClaimRequest;
export declare const validateUpdateRevenueAttributionRequest: (request: unknown) => UpdateRevenueAttributionRequest;
export declare const validateMarketplaceAttributionFilter: (filter: unknown) => MarketplaceAttributionFilter;
//# sourceMappingURL=marketplaceAttribution.d.ts.map