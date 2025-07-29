/**
 * Epic 16 Marketplace Attribution System
 * Task: E16-1753114247138-03634F - Add attribution system
 *
 * Enhanced attribution types and schemas for marketplace template creation,
 * ownership tracking, revenue attribution, and creator analytics.
 */
import { z } from 'zod';
import { ResourceTypeSchema, ChangeTypeSchema, AuthorTypeSchema, ChangeAttributionSchema, AttributionFilterSchema } from './attribution';
// =============================================================================
// Marketplace-Specific Attribution Types
// =============================================================================
// Extend resource types for marketplace
export const MarketplaceResourceTypeSchema = z.enum([]);
ResourceTypeSchema.options,
    'template',
    'template_version',
    'template_purchase',
    'template_review',
    'template_collection',
    'creator_profile',
    'revenue_record',
    'attribution_claim';
;
// Extend change types for marketplace operations
export const MarketplaceChangeTypeSchema = z.enum([]);
ChangeTypeSchema.options,
    'template_create',
    'template_publish',
    'template_purchase',
    'template_review',
    'revenue_earned',
    'attribution_assigned',
    'collaboration_joined',
    'template_derived',
    'collection_add',
    'creator_verified';
;
// Marketplace author types
export const MarketplaceAuthorTypeSchema = z.enum([]);
AuthorTypeSchema.options,
    'template_creator',
    'template_collaborator',
    'marketplace_curator',
    'revenue_system',
    'attribution_engine';
;
// =============================================================================
// Template Attribution Schemas
// =============================================================================
export const TemplateAttributionSchema = z.object({
    id: z.string().uuid(),
    templateId: z.string().uuid(),
    templateVersionId: z.string().uuid().optional(),
    // Primary attribution
    primaryCreatorId: z.string().uuid(),
    primaryCreatorName: z.string(),
    primaryCreatorEmail: z.string().email(),
    creationDate: z.date(),
    // Collaboration attribution
    collaborators: z.array(z.object({}), userId, z.string().uuid(), userName, z.string(), userEmail, z.string().email(), contributionType, z.enum(['co-creator', 'contributor', 'reviewer', 'editor', 'advisor']), contributionPercentage, z.number().min(0).max(100), contributionDescription, z.string().optional(), joinedAt, z.date(), verifiedAt, z.date().optional())
});
([]),
    // Source attribution
    derivedFrom;
z.object({});
originalTemplateId: z.string().uuid(),
    originalCreatorId;
z.string().uuid(),
    derivationType;
z.enum(['fork', 'remix', 'inspired', 'adaptation']),
    attributionPercentage;
z.number().min(0).max(100),
    acknowledgment;
z.string().optional(),
;
optional(),
    // Revenue attribution
    revenueSharing;
z.object({});
primaryCreatorShare: z.number().min(0).max(100),
    collaboratorShares;
z.record(z.number().min(0).max(100)),
    originalCreatorShare;
z.number().min(0).max(100).optional(),
    platformFee;
z.number().min(0).max(100),
    totalPercentage;
z.number().min(99.99).max(100.01); // Allow for rounding,
// Verification and claims
attributionClaims: z.array(z.object({}), claimId, z.string().uuid(), claimantId, z.string().uuid(), claimType, z.enum(['ownership', 'collaboration', 'derivation', 'inspiration']), claimDescription, z.string(), evidenceUrls, z.array(z.string().url()).default([]), status, z.enum(['pending', 'approved', 'rejected', 'disputed']), reviewedBy, z.string().uuid().optional(), reviewedAt, z.date().optional(), resolvedAt, z.date().optional());
([]),
    // Metadata
    isVerified;
z.boolean().default(false),
    verifiedBy;
z.string().uuid().optional(),
    verifiedAt;
z.date().optional(),
    confidenceScore;
z.number().min(0).max(1).default(1.0),
    // Attribution metadata
    attributionMethod;
z.enum(['manual', 'git_history', 'session_tracking', 'ai_analysis', 'user_declaration']),
    sourceMetadata;
z.record(z.unknown()).default({}),
    createdAt;
z.date(),
    updatedAt;
z.date();
;
// =============================================================================
// Revenue Attribution Schemas
// =============================================================================
export const RevenueAttributionSchema = z.object({
    id: z.string().uuid(),
    templateId: z.string().uuid(),
    purchaseId: z.string().uuid(),
    // Revenue details
    totalRevenue: z.number().min(0),
    currency: z.string().length(3).default('USD'),
    // Attribution breakdown
    attributions: z.array(z.object({}), recipientId, z.string().uuid(), recipientType, z.enum(['creator', 'collaborator', 'original_creator', 'platform']), attribution, z.enum(['primary_creator', 'collaborator', 'derived_from', 'platform_fee']), percentage, z.number().min(0).max(100), amountCents, z.number().int().min(0), status, z.enum(['pending', 'released', 'held', 'disputed', 'refunded']), releasedAt, z.date().optional(), holdReason, z.string().optional())
}), 
// Purchase context
purchaseDate;
(),
    buyerId;
z.string().uuid(),
    templateVersion;
z.string(),
    // Attribution tracking
    attributionCalculatedAt;
z.date(),
    attributionMethod;
z.enum(['automated', 'manual_review', 'dispute_resolution']),
    calculatedBy;
z.string().uuid().optional(),
    // Verification
    isVerified;
z.boolean().default(false),
    verificationRequired;
z.boolean().default(false),
    verifiedAt;
z.date().optional(),
    createdAt;
z.date(),
    updatedAt;
z.date();
;
// =============================================================================
// Creator Attribution Profile Schemas
// =============================================================================
export const CreatorAttributionProfileSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    // Creator identification
    displayName: z.string(),
    profileBio: z.string().optional(),
    profileUrl: z.string().url().optional(),
    verificationBadges: z.array(z.enum(['verified_creator', 'top_seller', 'collaboration_leader', 'innovation_award'])).default([]),
    // Attribution statistics
    createdTemplates: z.number().int().default(0),
    collaboratedTemplates: z.number().int().default(0),
    derivedTemplates: z.number().int().default(0),
    totalRevenue: z.number().default(0),
    totalSales: z.number().int().default(0),
    // Collaboration metrics
    collaborationScore: z.number().min(0).max(100).default(0),
    averageCollaborators: z.number().default(0),
    successfulCollaborations: z.number().int().default(0),
    // Attribution preferences
    attributionSettings: z.object({}),
    showRealName: z.boolean().default(true),
    showRevenue: z.boolean().default(false),
    showCollaborations: z.boolean().default(true),
    allowDerivations: z.boolean().default(true),
    requireAttribution: z.boolean().default(true),
    defaultRevenueShare: z.number().min(0).max(100).default(100),
}), 
// Reputation metrics
attributionReputation;
({
    accuracyScore: z.number().min(0).max(100).default(100),
    responsivenessScore: z.number().min(0).max(100).default(100),
    collaborationScore: z.number().min(0).max(100).default(100),
    overallRating: z.number().min(0).max(5).default(0),
    totalRatings: z.number().int().default(0),
}),
    createdAt;
z.date(),
    updatedAt;
z.date();
;
// =============================================================================
// Attribution Analytics Schemas
// =============================================================================
export const MarketplaceAttributionAnalyticsSchema = z.object({
    id: z.string().uuid(),
    creatorId: z.string().uuid().optional(),
    templateId: z.string().uuid().optional(),
    analysisType: z.enum(['creator_performance', 'template_attribution', 'revenue_distribution', 'collaboration_patterns']),
    // Time period
    periodStart: z.date(),
    periodEnd: z.date(),
    // Analytics data
    metrics: z.object({})
    // Creator metrics
    ,
    // Creator metrics
    templatesCreated: z.number().int().default(0),
    collaborationsInitiated: z.number().int().default(0),
    revenueGenerated: z.number().default(0),
    attributionAccuracy: z.number().min(0).max(100).default(100),
    // Template metrics
    totalViews: z.number().int().default(0),
    totalPurchases: z.number().int().default(0),
    averageRating: z.number().min(0).max(5).default(0),
    derivativesCreated: z.number().int().default(0),
    // Attribution metrics
    attributionClaims: z.number().int().default(0),
    resolvedClaims: z.number().int().default(0),
    disputedAttributions: z.number().int().default(0),
    verificationRate: z.number().min(0).max(100).default(100),
}), 
// Breakdown data
breakdown;
(z.unknown()).default({}),
    // Insights
    insights;
z.array(z.object({}), type, z.enum(['trend', 'anomaly', 'recommendation', 'alert']), title, z.string(), description, z.string(), confidence, z.number().min(0).max(1), actionable, z.boolean().default(false), metadata, z.record(z.unknown()).default({}));
([]),
    generatedAt;
z.date(),
    expiresAt;
z.date();
;
// =============================================================================
// Extended Attribution Schemas
// =============================================================================
// Extended change attribution for marketplace
export const MarketplaceChangeAttributionSchema = ChangeAttributionSchema.extend({
    resourceType: MarketplaceResourceTypeSchema,
    changeType: MarketplaceChangeTypeSchema,
    authorType: MarketplaceAuthorTypeSchema,
    // Marketplace-specific fields
    templateId: z.string().uuid().optional(),
    purchaseId: z.string().uuid().optional(),
    revenueAmount: z.number().optional(),
    attributionClaim: z.string().uuid().optional(),
    collaborationContext: z.object({}),
    isCollaborative: z.boolean().default(false),
    collaborators: z.array(z.string().uuid()).default([]),
    contributionType: z.enum(['creation', 'editing', 'review', 'publishing']).optional(),
}).optional();
;
// Extended filter for marketplace attribution
export const MarketplaceAttributionFilterSchema = AttributionFilterSchema.extend({
    resourceType: MarketplaceResourceTypeSchema.optional(),
    changeType: MarketplaceChangeTypeSchema.optional(),
    authorType: MarketplaceAuthorTypeSchema.optional(),
    templateId: z.string().uuid().optional(),
    creatorId: z.string().uuid().optional(),
    revenueRange: z.object({}),
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
}).optional(), verificationStatus;
(['verified', 'unverified', 'disputed']).optional(),
    collaborationType;
z.enum(['creation', 'editing', 'review', 'publishing']).optional();
;
// =============================================================================
// Request/Response Schemas
// =============================================================================
export const CreateTemplateAttributionRequestSchema = z.object({
    templateId: z.string().uuid(),
    templateVersionId: z.string().uuid().optional(),
    primaryCreatorId: z.string().uuid(),
    collaborators: z.array(z.object({}), userId, z.string().uuid(), contributionType, z.enum(['co-creator', 'contributor', 'reviewer', 'editor', 'advisor']), contributionPercentage, z.number().min(0).max(100), contributionDescription, z.string().optional())
});
([]),
    derivedFrom;
z.object({});
originalTemplateId: z.string().uuid(),
    derivationType;
z.enum(['fork', 'remix', 'inspired', 'adaptation']),
    attributionPercentage;
z.number().min(0).max(100),
;
optional(),
    attributionMethod;
z.enum(['manual', 'git_history', 'session_tracking', 'ai_analysis', 'user_declaration']).default('manual'),
    sourceMetadata;
z.record(z.unknown()).default({});
;
export const CreateAttributionClaimRequestSchema = z.object({
    templateId: z.string().uuid(),
    claimType: z.enum(['ownership', 'collaboration', 'derivation', 'inspiration']),
    claimDescription: z.string(),
    evidenceUrls: z.array(z.string().url()).default([]),
    metadata: z.record(z.unknown()).default({})
});
export const UpdateRevenueAttributionRequestSchema = z.object({
    purchaseId: z.string().uuid(),
    attributionOverrides: z.array(z.object({}), recipientId, z.string().uuid(), newPercentage, z.number().min(0).max(100), reason, z.string())
}), optional;
(),
    verificationRequired;
z.boolean().optional(),
    notes;
z.string().optional();
;
// =============================================================================
// Response Schemas
// =============================================================================
export const TemplateAttributionResponseSchema = z.object({
    attribution: TemplateAttributionSchema,
    relatedTemplates: z.array(z.object({}), templateId, z.string().uuid(), title, z.string(), relationship, z.enum(['original', 'derivative', 'similar']), attributionScore, z.number().min(0).max(1))
});
([]),
    revenueStatistics;
z.object({});
totalRevenue: z.number(),
    revenueByRecipient;
z.record(z.number()),
    averageRevenuePerSale;
z.number(),
    totalSales;
z.number().int(),
;
optional();
;
export const CreatorDashboardResponseSchema = z.object({
    profile: CreatorAttributionProfileSchema,
    templates: z.array(z.object({}), templateId, z.string().uuid(), title, z.string(), attribution, TemplateAttributionSchema, revenue, z.object({}), total, z.number(), pending, z.number(), released, z.number())
}), performance;
({
    views: z.number().int(),
    purchases: z.number().int(),
    rating: z.number().min(0).max(5),
    derivatives: z.number().int(),
});
collaborations: z.array(z.object({}), templateId, z.string().uuid(), title, z.string(), role, z.enum(['co-creator', 'contributor', 'reviewer', 'editor', 'advisor']), contribution, z.number().min(0).max(100), revenue, z.number(), status, z.enum(['active', 'completed', 'disputed']));
analytics: MarketplaceAttributionAnalyticsSchema.optional();
;
// =============================================================================
// Constants and Descriptions
// =============================================================================
export const MARKETPLACE_RESOURCE_TYPE_DESCRIPTIONS = {
    template: 'Marketplace template',
    template_version: 'Template version',
    template_purchase: 'Template purchase',
    template_review: 'Template review',
    template_collection: 'Template collection',
    creator_profile: 'Creator profile',
    revenue_record: 'Revenue record',
    attribution_claim: 'Attribution claim',
};
export const MARKETPLACE_CHANGE_TYPE_DESCRIPTIONS = {
    template_create: 'Template created',
    template_publish: 'Template published',
    template_purchase: 'Template purchased',
    template_review: 'Template reviewed',
    revenue_earned: 'Revenue earned',
    attribution_assigned: 'Attribution assigned',
    collaboration_joined: 'Collaboration joined',
    template_derived: 'Template derived',
    collection_add: 'Added to collection',
    creator_verified: 'Creator verified',
};
export const MARKETPLACE_ATTRIBUTION_DEFAULTS = {
    DEFAULT_CREATOR_SHARE: 85, // 85% to creator,
    DEFAULT_PLATFORM_FEE: 15, // 15% platform fee,
    DEFAULT_COLLABORATION_THRESHOLD: 10, // 10% minimum for collaborator,
    VERIFICATION_REQUIRED_THRESHOLD: 1000, // $10.00 in cents,
    CLAIM_RESOLUTION_DAYS: 14,
    REVENUE_HOLD_DAYS: 7,
    MIN_CONFIDENCE_SCORE: 0.8,
};
// =============================================================================
// Validation Helpers
// =============================================================================
export const validateCreateTemplateAttributionRequest = (request) => {
    return CreateTemplateAttributionRequestSchema.parse(request);
};
export const validateCreateAttributionClaimRequest = (request) => {
    return CreateAttributionClaimRequestSchema.parse(request);
};
export const validateUpdateRevenueAttributionRequest = (request) => {
    return UpdateRevenueAttributionRequestSchema.parse(request);
};
export const validateMarketplaceAttributionFilter = (filter) => {
    return MarketplaceAttributionFilterSchema.parse(filter);
};
