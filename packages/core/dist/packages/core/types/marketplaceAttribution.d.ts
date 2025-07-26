/**
 * Epic 16 Marketplace Attribution System
 * Task: E16-1753114247138-03634F - Add attribution system
 *
 * Enhanced attribution types and schemas for marketplace template creation,
 * ownership tracking, revenue attribution, and creator analytics.
 */
import { z } from 'zod';
export declare const MarketplaceResourceTypeSchema: z.ZodEnum<["node", "edge", "property", "position", "graph", "template", "template_version", "template_purchase", "template_review", "template_collection", "creator_profile", "revenue_record", "attribution_claim"]>;
export declare const MarketplaceChangeTypeSchema: z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change", "template_create", "template_publish", "template_purchase", "template_review", "revenue_earned", "attribution_assigned", "collaboration_joined", "template_derived", "collection_add", "creator_verified"]>;
export declare const MarketplaceAuthorTypeSchema: z.ZodEnum<["user", "anonymous", "guest", "system", "api", "template_creator", "template_collaborator", "marketplace_curator", "revenue_system", "attribution_engine"]>;
export declare const TemplateAttributionSchema: z.ZodObject<{
    id: z.ZodString;
    templateId: z.ZodString;
    templateVersionId: z.ZodOptional<z.ZodString>;
    primaryCreatorId: z.ZodString;
    primaryCreatorName: z.ZodString;
    primaryCreatorEmail: z.ZodString;
    creationDate: z.ZodDate;
    collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        userName: z.ZodString;
        userEmail: z.ZodString;
        contributionType: z.ZodEnum<["co-creator", "contributor", "reviewer", "editor", "advisor"]>;
        contributionPercentage: z.ZodNumber;
        contributionDescription: z.ZodOptional<z.ZodString>;
        joinedAt: z.ZodDate;
        verifiedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        userId?: string;
        verifiedAt?: Date;
        userName?: string;
        userEmail?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
        joinedAt?: Date;
    }, {
        userId?: string;
        verifiedAt?: Date;
        userName?: string;
        userEmail?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
        joinedAt?: Date;
    }>, "many">>;
    derivedFrom: z.ZodOptional<z.ZodObject<{
        originalTemplateId: z.ZodString;
        originalCreatorId: z.ZodString;
        derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
        attributionPercentage: z.ZodNumber;
        acknowledgment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        originalTemplateId?: string;
        originalCreatorId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
        acknowledgment?: string;
    }, {
        originalTemplateId?: string;
        originalCreatorId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
        acknowledgment?: string;
    }>>;
    revenueSharing: z.ZodObject<{
        primaryCreatorShare: z.ZodNumber;
        collaboratorShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
        originalCreatorShare: z.ZodOptional<z.ZodNumber>;
        platformFee: z.ZodNumber;
        totalPercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        primaryCreatorShare?: number;
        collaboratorShares?: Record<string, number>;
        originalCreatorShare?: number;
        platformFee?: number;
        totalPercentage?: number;
    }, {
        primaryCreatorShare?: number;
        collaboratorShares?: Record<string, number>;
        originalCreatorShare?: number;
        platformFee?: number;
        totalPercentage?: number;
    }>;
    attributionClaims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        claimId: z.ZodString;
        claimantId: z.ZodString;
        claimType: z.ZodEnum<["ownership", "collaboration", "derivation", "inspiration"]>;
        claimDescription: z.ZodString;
        evidenceUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodEnum<["pending", "approved", "rejected", "disputed"]>;
        reviewedBy: z.ZodOptional<z.ZodString>;
        reviewedAt: z.ZodOptional<z.ZodDate>;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        status?: "pending" | "approved" | "rejected" | "disputed";
        reviewedAt?: Date;
        reviewedBy?: string;
        resolvedAt?: Date;
        claimId?: string;
        claimantId?: string;
        claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription?: string;
        evidenceUrls?: string[];
    }, {
        status?: "pending" | "approved" | "rejected" | "disputed";
        reviewedAt?: Date;
        reviewedBy?: string;
        resolvedAt?: Date;
        claimId?: string;
        claimantId?: string;
        claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription?: string;
        evidenceUrls?: string[];
    }>, "many">>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    verifiedBy: z.ZodOptional<z.ZodString>;
    verifiedAt: z.ZodOptional<z.ZodDate>;
    confidenceScore: z.ZodDefault<z.ZodNumber>;
    attributionMethod: z.ZodEnum<["manual", "git_history", "session_tracking", "ai_analysis", "user_declaration"]>;
    sourceMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    confidenceScore?: number;
    templateId?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
    collaborators?: {
        userId?: string;
        verifiedAt?: Date;
        userName?: string;
        userEmail?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
        joinedAt?: Date;
    }[];
    derivedFrom?: {
        originalTemplateId?: string;
        originalCreatorId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
        acknowledgment?: string;
    };
    verifiedBy?: string;
    templateVersionId?: string;
    primaryCreatorId?: string;
    primaryCreatorName?: string;
    primaryCreatorEmail?: string;
    creationDate?: Date;
    revenueSharing?: {
        primaryCreatorShare?: number;
        collaboratorShares?: Record<string, number>;
        originalCreatorShare?: number;
        platformFee?: number;
        totalPercentage?: number;
    };
    attributionClaims?: {
        status?: "pending" | "approved" | "rejected" | "disputed";
        reviewedAt?: Date;
        reviewedBy?: string;
        resolvedAt?: Date;
        claimId?: string;
        claimantId?: string;
        claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription?: string;
        evidenceUrls?: string[];
    }[];
    attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
    sourceMetadata?: Record<string, unknown>;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    confidenceScore?: number;
    templateId?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
    collaborators?: {
        userId?: string;
        verifiedAt?: Date;
        userName?: string;
        userEmail?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
        joinedAt?: Date;
    }[];
    derivedFrom?: {
        originalTemplateId?: string;
        originalCreatorId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
        acknowledgment?: string;
    };
    verifiedBy?: string;
    templateVersionId?: string;
    primaryCreatorId?: string;
    primaryCreatorName?: string;
    primaryCreatorEmail?: string;
    creationDate?: Date;
    revenueSharing?: {
        primaryCreatorShare?: number;
        collaboratorShares?: Record<string, number>;
        originalCreatorShare?: number;
        platformFee?: number;
        totalPercentage?: number;
    };
    attributionClaims?: {
        status?: "pending" | "approved" | "rejected" | "disputed";
        reviewedAt?: Date;
        reviewedBy?: string;
        resolvedAt?: Date;
        claimId?: string;
        claimantId?: string;
        claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription?: string;
        evidenceUrls?: string[];
    }[];
    attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
    sourceMetadata?: Record<string, unknown>;
}>;
export declare const RevenueAttributionSchema: z.ZodObject<{
    id: z.ZodString;
    templateId: z.ZodString;
    purchaseId: z.ZodString;
    totalRevenue: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    attributions: z.ZodArray<z.ZodObject<{
        recipientId: z.ZodString;
        recipientType: z.ZodEnum<["creator", "collaborator", "original_creator", "platform"]>;
        attribution: z.ZodEnum<["primary_creator", "collaborator", "derived_from", "platform_fee"]>;
        percentage: z.ZodNumber;
        amountCents: z.ZodNumber;
        status: z.ZodEnum<["pending", "released", "held", "disputed", "refunded"]>;
        releasedAt: z.ZodOptional<z.ZodDate>;
        holdReason: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage?: number;
        attribution?: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId?: string;
        recipientType?: "collaborator" | "platform" | "creator" | "original_creator";
        amountCents?: number;
        releasedAt?: Date;
        holdReason?: string;
    }, {
        status?: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage?: number;
        attribution?: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId?: string;
        recipientType?: "collaborator" | "platform" | "creator" | "original_creator";
        amountCents?: number;
        releasedAt?: Date;
        holdReason?: string;
    }>, "many">;
    purchaseDate: z.ZodDate;
    buyerId: z.ZodString;
    templateVersion: z.ZodString;
    attributionCalculatedAt: z.ZodDate;
    attributionMethod: z.ZodEnum<["automated", "manual_review", "dispute_resolution"]>;
    calculatedBy: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    verificationRequired: z.ZodDefault<z.ZodBoolean>;
    verifiedAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    currency?: string;
    templateId?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
    templateVersion?: string;
    purchaseDate?: Date;
    buyerId?: string;
    purchaseId?: string;
    attributionMethod?: "automated" | "manual_review" | "dispute_resolution";
    totalRevenue?: number;
    attributions?: {
        status?: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage?: number;
        attribution?: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId?: string;
        recipientType?: "collaborator" | "platform" | "creator" | "original_creator";
        amountCents?: number;
        releasedAt?: Date;
        holdReason?: string;
    }[];
    attributionCalculatedAt?: Date;
    calculatedBy?: string;
    verificationRequired?: boolean;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    currency?: string;
    templateId?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
    templateVersion?: string;
    purchaseDate?: Date;
    buyerId?: string;
    purchaseId?: string;
    attributionMethod?: "automated" | "manual_review" | "dispute_resolution";
    totalRevenue?: number;
    attributions?: {
        status?: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage?: number;
        attribution?: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId?: string;
        recipientType?: "collaborator" | "platform" | "creator" | "original_creator";
        amountCents?: number;
        releasedAt?: Date;
        holdReason?: string;
    }[];
    attributionCalculatedAt?: Date;
    calculatedBy?: string;
    verificationRequired?: boolean;
}>;
export declare const CreatorAttributionProfileSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    displayName: z.ZodString;
    profileBio: z.ZodOptional<z.ZodString>;
    profileUrl: z.ZodOptional<z.ZodString>;
    verificationBadges: z.ZodDefault<z.ZodArray<z.ZodEnum<["verified_creator", "top_seller", "collaboration_leader", "innovation_award"]>, "many">>;
    createdTemplates: z.ZodDefault<z.ZodNumber>;
    collaboratedTemplates: z.ZodDefault<z.ZodNumber>;
    derivedTemplates: z.ZodDefault<z.ZodNumber>;
    totalRevenue: z.ZodDefault<z.ZodNumber>;
    totalSales: z.ZodDefault<z.ZodNumber>;
    collaborationScore: z.ZodDefault<z.ZodNumber>;
    averageCollaborators: z.ZodDefault<z.ZodNumber>;
    successfulCollaborations: z.ZodDefault<z.ZodNumber>;
    attributionSettings: z.ZodObject<{
        showRealName: z.ZodDefault<z.ZodBoolean>;
        showRevenue: z.ZodDefault<z.ZodBoolean>;
        showCollaborations: z.ZodDefault<z.ZodBoolean>;
        allowDerivations: z.ZodDefault<z.ZodBoolean>;
        requireAttribution: z.ZodDefault<z.ZodBoolean>;
        defaultRevenueShare: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        showRealName?: boolean;
        showRevenue?: boolean;
        showCollaborations?: boolean;
        allowDerivations?: boolean;
        requireAttribution?: boolean;
        defaultRevenueShare?: number;
    }, {
        showRealName?: boolean;
        showRevenue?: boolean;
        showCollaborations?: boolean;
        allowDerivations?: boolean;
        requireAttribution?: boolean;
        defaultRevenueShare?: number;
    }>;
    attributionReputation: z.ZodObject<{
        accuracyScore: z.ZodDefault<z.ZodNumber>;
        responsivenessScore: z.ZodDefault<z.ZodNumber>;
        collaborationScore: z.ZodDefault<z.ZodNumber>;
        overallRating: z.ZodDefault<z.ZodNumber>;
        totalRatings: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        overallRating?: number;
        totalRatings?: number;
        collaborationScore?: number;
        accuracyScore?: number;
        responsivenessScore?: number;
    }, {
        overallRating?: number;
        totalRatings?: number;
        collaborationScore?: number;
        accuracyScore?: number;
        responsivenessScore?: number;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
    displayName?: string;
    profileUrl?: string;
    totalSales?: number;
    totalRevenue?: number;
    profileBio?: string;
    verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
    createdTemplates?: number;
    collaboratedTemplates?: number;
    derivedTemplates?: number;
    collaborationScore?: number;
    averageCollaborators?: number;
    successfulCollaborations?: number;
    attributionSettings?: {
        showRealName?: boolean;
        showRevenue?: boolean;
        showCollaborations?: boolean;
        allowDerivations?: boolean;
        requireAttribution?: boolean;
        defaultRevenueShare?: number;
    };
    attributionReputation?: {
        overallRating?: number;
        totalRatings?: number;
        collaborationScore?: number;
        accuracyScore?: number;
        responsivenessScore?: number;
    };
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
    displayName?: string;
    profileUrl?: string;
    totalSales?: number;
    totalRevenue?: number;
    profileBio?: string;
    verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
    createdTemplates?: number;
    collaboratedTemplates?: number;
    derivedTemplates?: number;
    collaborationScore?: number;
    averageCollaborators?: number;
    successfulCollaborations?: number;
    attributionSettings?: {
        showRealName?: boolean;
        showRevenue?: boolean;
        showCollaborations?: boolean;
        allowDerivations?: boolean;
        requireAttribution?: boolean;
        defaultRevenueShare?: number;
    };
    attributionReputation?: {
        overallRating?: number;
        totalRatings?: number;
        collaborationScore?: number;
        accuracyScore?: number;
        responsivenessScore?: number;
    };
}>;
export declare const MarketplaceAttributionAnalyticsSchema: z.ZodObject<{
    id: z.ZodString;
    creatorId: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    analysisType: z.ZodEnum<["creator_performance", "template_attribution", "revenue_distribution", "collaboration_patterns"]>;
    periodStart: z.ZodDate;
    periodEnd: z.ZodDate;
    metrics: z.ZodObject<{
        templatesCreated: z.ZodDefault<z.ZodNumber>;
        collaborationsInitiated: z.ZodDefault<z.ZodNumber>;
        revenueGenerated: z.ZodDefault<z.ZodNumber>;
        attributionAccuracy: z.ZodDefault<z.ZodNumber>;
        totalViews: z.ZodDefault<z.ZodNumber>;
        totalPurchases: z.ZodDefault<z.ZodNumber>;
        averageRating: z.ZodDefault<z.ZodNumber>;
        derivativesCreated: z.ZodDefault<z.ZodNumber>;
        attributionClaims: z.ZodDefault<z.ZodNumber>;
        resolvedClaims: z.ZodDefault<z.ZodNumber>;
        disputedAttributions: z.ZodDefault<z.ZodNumber>;
        verificationRate: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        totalViews?: number;
        averageRating?: number;
        templatesCreated?: number;
        totalPurchases?: number;
        attributionClaims?: number;
        collaborationsInitiated?: number;
        revenueGenerated?: number;
        attributionAccuracy?: number;
        derivativesCreated?: number;
        resolvedClaims?: number;
        disputedAttributions?: number;
        verificationRate?: number;
    }, {
        totalViews?: number;
        averageRating?: number;
        templatesCreated?: number;
        totalPurchases?: number;
        attributionClaims?: number;
        collaborationsInitiated?: number;
        revenueGenerated?: number;
        attributionAccuracy?: number;
        derivativesCreated?: number;
        resolvedClaims?: number;
        disputedAttributions?: number;
        verificationRate?: number;
    }>;
    breakdown: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    insights: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["trend", "anomaly", "recommendation", "alert"]>;
        title: z.ZodString;
        description: z.ZodString;
        confidence: z.ZodNumber;
        actionable: z.ZodDefault<z.ZodBoolean>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        type?: "alert" | "recommendation" | "anomaly" | "trend";
        metadata?: Record<string, unknown>;
        title?: string;
        confidence?: number;
        actionable?: boolean;
    }, {
        description?: string;
        type?: "alert" | "recommendation" | "anomaly" | "trend";
        metadata?: Record<string, unknown>;
        title?: string;
        confidence?: number;
        actionable?: boolean;
    }>, "many">>;
    generatedAt: z.ZodDate;
    expiresAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    metrics?: {
        totalViews?: number;
        averageRating?: number;
        templatesCreated?: number;
        totalPurchases?: number;
        attributionClaims?: number;
        collaborationsInitiated?: number;
        revenueGenerated?: number;
        attributionAccuracy?: number;
        derivativesCreated?: number;
        resolvedClaims?: number;
        disputedAttributions?: number;
        verificationRate?: number;
    };
    insights?: {
        description?: string;
        type?: "alert" | "recommendation" | "anomaly" | "trend";
        metadata?: Record<string, unknown>;
        title?: string;
        confidence?: number;
        actionable?: boolean;
    }[];
    expiresAt?: Date;
    breakdown?: Record<string, unknown>;
    generatedAt?: Date;
    templateId?: string;
    creatorId?: string;
    analysisType?: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
    periodStart?: Date;
    periodEnd?: Date;
}, {
    id?: string;
    metrics?: {
        totalViews?: number;
        averageRating?: number;
        templatesCreated?: number;
        totalPurchases?: number;
        attributionClaims?: number;
        collaborationsInitiated?: number;
        revenueGenerated?: number;
        attributionAccuracy?: number;
        derivativesCreated?: number;
        resolvedClaims?: number;
        disputedAttributions?: number;
        verificationRate?: number;
    };
    insights?: {
        description?: string;
        type?: "alert" | "recommendation" | "anomaly" | "trend";
        metadata?: Record<string, unknown>;
        title?: string;
        confidence?: number;
        actionable?: boolean;
    }[];
    expiresAt?: Date;
    breakdown?: Record<string, unknown>;
    generatedAt?: Date;
    templateId?: string;
    creatorId?: string;
    analysisType?: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
    periodStart?: Date;
    periodEnd?: Date;
}>;
export type MarketplaceResourceType = z.infer<typeof MarketplaceResourceTypeSchema>;
export type MarketplaceChangeType = z.infer<typeof MarketplaceChangeTypeSchema>;
export type MarketplaceAuthorType = z.infer<typeof MarketplaceAuthorTypeSchema>;
export type TemplateAttribution = z.infer<typeof TemplateAttributionSchema>;
export type RevenueAttribution = z.infer<typeof RevenueAttributionSchema>;
export type CreatorAttributionProfile = z.infer<typeof CreatorAttributionProfileSchema>;
export type MarketplaceAttributionAnalytics = z.infer<typeof MarketplaceAttributionAnalyticsSchema>;
export declare const MarketplaceChangeAttributionSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    resourceId: z.ZodString;
    changeOperation: z.ZodString;
    authorId: z.ZodOptional<z.ZodString>;
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
} & {
    resourceType: z.ZodEnum<["node", "edge", "property", "position", "graph", "template", "template_version", "template_purchase", "template_review", "template_collection", "creator_profile", "revenue_record", "attribution_claim"]>;
    changeType: z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change", "template_create", "template_publish", "template_purchase", "template_review", "revenue_earned", "attribution_assigned", "collaboration_joined", "template_derived", "collection_add", "creator_verified"]>;
    authorType: z.ZodEnum<["user", "anonymous", "guest", "system", "api", "template_creator", "template_collaborator", "marketplace_curator", "revenue_system", "attribution_engine"]>;
    templateId: z.ZodOptional<z.ZodString>;
    purchaseId: z.ZodOptional<z.ZodString>;
    revenueAmount: z.ZodOptional<z.ZodNumber>;
    attributionClaim: z.ZodOptional<z.ZodString>;
    collaborationContext: z.ZodOptional<z.ZodObject<{
        isCollaborative: z.ZodDefault<z.ZodBoolean>;
        collaborators: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        contributionType: z.ZodOptional<z.ZodEnum<["creation", "editing", "review", "publishing"]>>;
    }, "strip", z.ZodTypeAny, {
        isCollaborative?: boolean;
        collaborators?: string[];
        contributionType?: "editing" | "publishing" | "review" | "creation";
    }, {
        isCollaborative?: boolean;
        collaborators?: string[];
        contributionType?: "editing" | "publishing" | "review" | "creation";
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    sessionId?: string;
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim";
    ipAddress?: string;
    userAgent?: string;
    confidenceScore?: number;
    templateId?: string;
    operationId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine";
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
    purchaseId?: string;
    revenueAmount?: number;
    attributionClaim?: string;
    collaborationContext?: {
        isCollaborative?: boolean;
        collaborators?: string[];
        contributionType?: "editing" | "publishing" | "review" | "creation";
    };
}, {
    id?: string;
    createdAt?: Date;
    projectId?: string;
    sessionId?: string;
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim";
    ipAddress?: string;
    userAgent?: string;
    confidenceScore?: number;
    templateId?: string;
    operationId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine";
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
    purchaseId?: string;
    revenueAmount?: number;
    attributionClaim?: string;
    collaborationContext?: {
        isCollaborative?: boolean;
        collaborators?: string[];
        contributionType?: "editing" | "publishing" | "review" | "creation";
    };
}>;
export declare const MarketplaceAttributionFilterSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    resourceId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
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
} & {
    resourceType: z.ZodOptional<z.ZodEnum<["node", "edge", "property", "position", "graph", "template", "template_version", "template_purchase", "template_review", "template_collection", "creator_profile", "revenue_record", "attribution_claim"]>>;
    changeType: z.ZodOptional<z.ZodEnum<["create", "update", "delete", "move", "property_change", "connection_change", "template_create", "template_publish", "template_purchase", "template_review", "revenue_earned", "attribution_assigned", "collaboration_joined", "template_derived", "collection_add", "creator_verified"]>>;
    authorType: z.ZodOptional<z.ZodEnum<["user", "anonymous", "guest", "system", "api", "template_creator", "template_collaborator", "marketplace_curator", "revenue_system", "attribution_engine"]>>;
    templateId: z.ZodOptional<z.ZodString>;
    creatorId: z.ZodOptional<z.ZodString>;
    revenueRange: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min?: number;
        max?: number;
    }, {
        min?: number;
        max?: number;
    }>>;
    verificationStatus: z.ZodOptional<z.ZodEnum<["verified", "unverified", "disputed"]>>;
    collaborationType: z.ZodOptional<z.ZodEnum<["creation", "editing", "review", "publishing"]>>;
}, "strip", z.ZodTypeAny, {
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "created_at" | "confidence_score" | "effective_at" | "change_size";
    sortOrder?: "asc" | "desc";
    sessionId?: string;
    authorId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim";
    templateId?: string;
    verificationStatus?: "verified" | "disputed" | "unverified";
    dateFrom?: Date;
    dateTo?: Date;
    creatorId?: string;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine";
    batchId?: string;
    snapshotId?: string;
    minConfidenceScore?: number;
    revenueRange?: {
        min?: number;
        max?: number;
    };
    collaborationType?: "editing" | "publishing" | "review" | "creation";
}, {
    projectId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "created_at" | "confidence_score" | "effective_at" | "change_size";
    sortOrder?: "asc" | "desc";
    sessionId?: string;
    authorId?: string;
    changeType?: "delete" | "create" | "update" | "move" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified";
    isCollaborative?: boolean;
    resourceId?: string;
    resourceType?: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim";
    templateId?: string;
    verificationStatus?: "verified" | "disputed" | "unverified";
    dateFrom?: Date;
    dateTo?: Date;
    creatorId?: string;
    authorType?: "system" | "user" | "anonymous" | "api" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine";
    batchId?: string;
    snapshotId?: string;
    minConfidenceScore?: number;
    revenueRange?: {
        min?: number;
        max?: number;
    };
    collaborationType?: "editing" | "publishing" | "review" | "creation";
}>;
export type MarketplaceChangeAttribution = z.infer<typeof MarketplaceChangeAttributionSchema>;
export type MarketplaceAttributionFilter = z.infer<typeof MarketplaceAttributionFilterSchema>;
export declare const CreateTemplateAttributionRequestSchema: z.ZodObject<{
    templateId: z.ZodString;
    templateVersionId: z.ZodOptional<z.ZodString>;
    primaryCreatorId: z.ZodString;
    collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        contributionType: z.ZodEnum<["co-creator", "contributor", "reviewer", "editor", "advisor"]>;
        contributionPercentage: z.ZodNumber;
        contributionDescription: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
    }, {
        userId?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
    }>, "many">>;
    derivedFrom: z.ZodOptional<z.ZodObject<{
        originalTemplateId: z.ZodString;
        derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
        attributionPercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        originalTemplateId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
    }, {
        originalTemplateId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
    }>>;
    attributionMethod: z.ZodDefault<z.ZodEnum<["manual", "git_history", "session_tracking", "ai_analysis", "user_declaration"]>>;
    sourceMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    templateId?: string;
    collaborators?: {
        userId?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
    }[];
    derivedFrom?: {
        originalTemplateId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
    };
    templateVersionId?: string;
    primaryCreatorId?: string;
    attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
    sourceMetadata?: Record<string, unknown>;
}, {
    templateId?: string;
    collaborators?: {
        userId?: string;
        contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage?: number;
        contributionDescription?: string;
    }[];
    derivedFrom?: {
        originalTemplateId?: string;
        derivationType?: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage?: number;
    };
    templateVersionId?: string;
    primaryCreatorId?: string;
    attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
    sourceMetadata?: Record<string, unknown>;
}>;
export declare const CreateAttributionClaimRequestSchema: z.ZodObject<{
    templateId: z.ZodString;
    claimType: z.ZodEnum<["ownership", "collaboration", "derivation", "inspiration"]>;
    claimDescription: z.ZodString;
    evidenceUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, unknown>;
    templateId?: string;
    claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
    claimDescription?: string;
    evidenceUrls?: string[];
}, {
    metadata?: Record<string, unknown>;
    templateId?: string;
    claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
    claimDescription?: string;
    evidenceUrls?: string[];
}>;
export declare const UpdateRevenueAttributionRequestSchema: z.ZodObject<{
    purchaseId: z.ZodString;
    attributionOverrides: z.ZodOptional<z.ZodArray<z.ZodObject<{
        recipientId: z.ZodString;
        newPercentage: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reason?: string;
        recipientId?: string;
        newPercentage?: number;
    }, {
        reason?: string;
        recipientId?: string;
        newPercentage?: number;
    }>, "many">>;
    verificationRequired: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string;
    purchaseId?: string;
    verificationRequired?: boolean;
    attributionOverrides?: {
        reason?: string;
        recipientId?: string;
        newPercentage?: number;
    }[];
}, {
    notes?: string;
    purchaseId?: string;
    verificationRequired?: boolean;
    attributionOverrides?: {
        reason?: string;
        recipientId?: string;
        newPercentage?: number;
    }[];
}>;
export type CreateTemplateAttributionRequest = z.infer<typeof CreateTemplateAttributionRequestSchema>;
export type CreateAttributionClaimRequest = z.infer<typeof CreateAttributionClaimRequestSchema>;
export type UpdateRevenueAttributionRequest = z.infer<typeof UpdateRevenueAttributionRequestSchema>;
export declare const TemplateAttributionResponseSchema: z.ZodObject<{
    attribution: z.ZodObject<{
        id: z.ZodString;
        templateId: z.ZodString;
        templateVersionId: z.ZodOptional<z.ZodString>;
        primaryCreatorId: z.ZodString;
        primaryCreatorName: z.ZodString;
        primaryCreatorEmail: z.ZodString;
        creationDate: z.ZodDate;
        collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            userName: z.ZodString;
            userEmail: z.ZodString;
            contributionType: z.ZodEnum<["co-creator", "contributor", "reviewer", "editor", "advisor"]>;
            contributionPercentage: z.ZodNumber;
            contributionDescription: z.ZodOptional<z.ZodString>;
            joinedAt: z.ZodDate;
            verifiedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            userId?: string;
            verifiedAt?: Date;
            userName?: string;
            userEmail?: string;
            contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage?: number;
            contributionDescription?: string;
            joinedAt?: Date;
        }, {
            userId?: string;
            verifiedAt?: Date;
            userName?: string;
            userEmail?: string;
            contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage?: number;
            contributionDescription?: string;
            joinedAt?: Date;
        }>, "many">>;
        derivedFrom: z.ZodOptional<z.ZodObject<{
            originalTemplateId: z.ZodString;
            originalCreatorId: z.ZodString;
            derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
            attributionPercentage: z.ZodNumber;
            acknowledgment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            originalTemplateId?: string;
            originalCreatorId?: string;
            derivationType?: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage?: number;
            acknowledgment?: string;
        }, {
            originalTemplateId?: string;
            originalCreatorId?: string;
            derivationType?: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage?: number;
            acknowledgment?: string;
        }>>;
        revenueSharing: z.ZodObject<{
            primaryCreatorShare: z.ZodNumber;
            collaboratorShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
            originalCreatorShare: z.ZodOptional<z.ZodNumber>;
            platformFee: z.ZodNumber;
            totalPercentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            primaryCreatorShare?: number;
            collaboratorShares?: Record<string, number>;
            originalCreatorShare?: number;
            platformFee?: number;
            totalPercentage?: number;
        }, {
            primaryCreatorShare?: number;
            collaboratorShares?: Record<string, number>;
            originalCreatorShare?: number;
            platformFee?: number;
            totalPercentage?: number;
        }>;
        attributionClaims: z.ZodDefault<z.ZodArray<z.ZodObject<{
            claimId: z.ZodString;
            claimantId: z.ZodString;
            claimType: z.ZodEnum<["ownership", "collaboration", "derivation", "inspiration"]>;
            claimDescription: z.ZodString;
            evidenceUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            status: z.ZodEnum<["pending", "approved", "rejected", "disputed"]>;
            reviewedBy: z.ZodOptional<z.ZodString>;
            reviewedAt: z.ZodOptional<z.ZodDate>;
            resolvedAt: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            status?: "pending" | "approved" | "rejected" | "disputed";
            reviewedAt?: Date;
            reviewedBy?: string;
            resolvedAt?: Date;
            claimId?: string;
            claimantId?: string;
            claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription?: string;
            evidenceUrls?: string[];
        }, {
            status?: "pending" | "approved" | "rejected" | "disputed";
            reviewedAt?: Date;
            reviewedBy?: string;
            resolvedAt?: Date;
            claimId?: string;
            claimantId?: string;
            claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription?: string;
            evidenceUrls?: string[];
        }>, "many">>;
        isVerified: z.ZodDefault<z.ZodBoolean>;
        verifiedBy: z.ZodOptional<z.ZodString>;
        verifiedAt: z.ZodOptional<z.ZodDate>;
        confidenceScore: z.ZodDefault<z.ZodNumber>;
        attributionMethod: z.ZodEnum<["manual", "git_history", "session_tracking", "ai_analysis", "user_declaration"]>;
        sourceMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        confidenceScore?: number;
        templateId?: string;
        isVerified?: boolean;
        verifiedAt?: Date;
        collaborators?: {
            userId?: string;
            verifiedAt?: Date;
            userName?: string;
            userEmail?: string;
            contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage?: number;
            contributionDescription?: string;
            joinedAt?: Date;
        }[];
        derivedFrom?: {
            originalTemplateId?: string;
            originalCreatorId?: string;
            derivationType?: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage?: number;
            acknowledgment?: string;
        };
        verifiedBy?: string;
        templateVersionId?: string;
        primaryCreatorId?: string;
        primaryCreatorName?: string;
        primaryCreatorEmail?: string;
        creationDate?: Date;
        revenueSharing?: {
            primaryCreatorShare?: number;
            collaboratorShares?: Record<string, number>;
            originalCreatorShare?: number;
            platformFee?: number;
            totalPercentage?: number;
        };
        attributionClaims?: {
            status?: "pending" | "approved" | "rejected" | "disputed";
            reviewedAt?: Date;
            reviewedBy?: string;
            resolvedAt?: Date;
            claimId?: string;
            claimantId?: string;
            claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription?: string;
            evidenceUrls?: string[];
        }[];
        attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        sourceMetadata?: Record<string, unknown>;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        confidenceScore?: number;
        templateId?: string;
        isVerified?: boolean;
        verifiedAt?: Date;
        collaborators?: {
            userId?: string;
            verifiedAt?: Date;
            userName?: string;
            userEmail?: string;
            contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage?: number;
            contributionDescription?: string;
            joinedAt?: Date;
        }[];
        derivedFrom?: {
            originalTemplateId?: string;
            originalCreatorId?: string;
            derivationType?: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage?: number;
            acknowledgment?: string;
        };
        verifiedBy?: string;
        templateVersionId?: string;
        primaryCreatorId?: string;
        primaryCreatorName?: string;
        primaryCreatorEmail?: string;
        creationDate?: Date;
        revenueSharing?: {
            primaryCreatorShare?: number;
            collaboratorShares?: Record<string, number>;
            originalCreatorShare?: number;
            platformFee?: number;
            totalPercentage?: number;
        };
        attributionClaims?: {
            status?: "pending" | "approved" | "rejected" | "disputed";
            reviewedAt?: Date;
            reviewedBy?: string;
            resolvedAt?: Date;
            claimId?: string;
            claimantId?: string;
            claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription?: string;
            evidenceUrls?: string[];
        }[];
        attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        sourceMetadata?: Record<string, unknown>;
    }>;
    relatedTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        templateId: z.ZodString;
        title: z.ZodString;
        relationship: z.ZodEnum<["original", "derivative", "similar"]>;
        attributionScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        title?: string;
        templateId?: string;
        relationship?: "original" | "similar" | "derivative";
        attributionScore?: number;
    }, {
        title?: string;
        templateId?: string;
        relationship?: "original" | "similar" | "derivative";
        attributionScore?: number;
    }>, "many">>;
    revenueStatistics: z.ZodOptional<z.ZodObject<{
        totalRevenue: z.ZodNumber;
        revenueByRecipient: z.ZodRecord<z.ZodString, z.ZodNumber>;
        averageRevenuePerSale: z.ZodNumber;
        totalSales: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalSales?: number;
        totalRevenue?: number;
        revenueByRecipient?: Record<string, number>;
        averageRevenuePerSale?: number;
    }, {
        totalSales?: number;
        totalRevenue?: number;
        revenueByRecipient?: Record<string, number>;
        averageRevenuePerSale?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    attribution?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        confidenceScore?: number;
        templateId?: string;
        isVerified?: boolean;
        verifiedAt?: Date;
        collaborators?: {
            userId?: string;
            verifiedAt?: Date;
            userName?: string;
            userEmail?: string;
            contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage?: number;
            contributionDescription?: string;
            joinedAt?: Date;
        }[];
        derivedFrom?: {
            originalTemplateId?: string;
            originalCreatorId?: string;
            derivationType?: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage?: number;
            acknowledgment?: string;
        };
        verifiedBy?: string;
        templateVersionId?: string;
        primaryCreatorId?: string;
        primaryCreatorName?: string;
        primaryCreatorEmail?: string;
        creationDate?: Date;
        revenueSharing?: {
            primaryCreatorShare?: number;
            collaboratorShares?: Record<string, number>;
            originalCreatorShare?: number;
            platformFee?: number;
            totalPercentage?: number;
        };
        attributionClaims?: {
            status?: "pending" | "approved" | "rejected" | "disputed";
            reviewedAt?: Date;
            reviewedBy?: string;
            resolvedAt?: Date;
            claimId?: string;
            claimantId?: string;
            claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription?: string;
            evidenceUrls?: string[];
        }[];
        attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        sourceMetadata?: Record<string, unknown>;
    };
    relatedTemplates?: {
        title?: string;
        templateId?: string;
        relationship?: "original" | "similar" | "derivative";
        attributionScore?: number;
    }[];
    revenueStatistics?: {
        totalSales?: number;
        totalRevenue?: number;
        revenueByRecipient?: Record<string, number>;
        averageRevenuePerSale?: number;
    };
}, {
    attribution?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        confidenceScore?: number;
        templateId?: string;
        isVerified?: boolean;
        verifiedAt?: Date;
        collaborators?: {
            userId?: string;
            verifiedAt?: Date;
            userName?: string;
            userEmail?: string;
            contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage?: number;
            contributionDescription?: string;
            joinedAt?: Date;
        }[];
        derivedFrom?: {
            originalTemplateId?: string;
            originalCreatorId?: string;
            derivationType?: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage?: number;
            acknowledgment?: string;
        };
        verifiedBy?: string;
        templateVersionId?: string;
        primaryCreatorId?: string;
        primaryCreatorName?: string;
        primaryCreatorEmail?: string;
        creationDate?: Date;
        revenueSharing?: {
            primaryCreatorShare?: number;
            collaboratorShares?: Record<string, number>;
            originalCreatorShare?: number;
            platformFee?: number;
            totalPercentage?: number;
        };
        attributionClaims?: {
            status?: "pending" | "approved" | "rejected" | "disputed";
            reviewedAt?: Date;
            reviewedBy?: string;
            resolvedAt?: Date;
            claimId?: string;
            claimantId?: string;
            claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription?: string;
            evidenceUrls?: string[];
        }[];
        attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        sourceMetadata?: Record<string, unknown>;
    };
    relatedTemplates?: {
        title?: string;
        templateId?: string;
        relationship?: "original" | "similar" | "derivative";
        attributionScore?: number;
    }[];
    revenueStatistics?: {
        totalSales?: number;
        totalRevenue?: number;
        revenueByRecipient?: Record<string, number>;
        averageRevenuePerSale?: number;
    };
}>;
export declare const CreatorDashboardResponseSchema: z.ZodObject<{
    profile: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        displayName: z.ZodString;
        profileBio: z.ZodOptional<z.ZodString>;
        profileUrl: z.ZodOptional<z.ZodString>;
        verificationBadges: z.ZodDefault<z.ZodArray<z.ZodEnum<["verified_creator", "top_seller", "collaboration_leader", "innovation_award"]>, "many">>;
        createdTemplates: z.ZodDefault<z.ZodNumber>;
        collaboratedTemplates: z.ZodDefault<z.ZodNumber>;
        derivedTemplates: z.ZodDefault<z.ZodNumber>;
        totalRevenue: z.ZodDefault<z.ZodNumber>;
        totalSales: z.ZodDefault<z.ZodNumber>;
        collaborationScore: z.ZodDefault<z.ZodNumber>;
        averageCollaborators: z.ZodDefault<z.ZodNumber>;
        successfulCollaborations: z.ZodDefault<z.ZodNumber>;
        attributionSettings: z.ZodObject<{
            showRealName: z.ZodDefault<z.ZodBoolean>;
            showRevenue: z.ZodDefault<z.ZodBoolean>;
            showCollaborations: z.ZodDefault<z.ZodBoolean>;
            allowDerivations: z.ZodDefault<z.ZodBoolean>;
            requireAttribution: z.ZodDefault<z.ZodBoolean>;
            defaultRevenueShare: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            showRealName?: boolean;
            showRevenue?: boolean;
            showCollaborations?: boolean;
            allowDerivations?: boolean;
            requireAttribution?: boolean;
            defaultRevenueShare?: number;
        }, {
            showRealName?: boolean;
            showRevenue?: boolean;
            showCollaborations?: boolean;
            allowDerivations?: boolean;
            requireAttribution?: boolean;
            defaultRevenueShare?: number;
        }>;
        attributionReputation: z.ZodObject<{
            accuracyScore: z.ZodDefault<z.ZodNumber>;
            responsivenessScore: z.ZodDefault<z.ZodNumber>;
            collaborationScore: z.ZodDefault<z.ZodNumber>;
            overallRating: z.ZodDefault<z.ZodNumber>;
            totalRatings: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            overallRating?: number;
            totalRatings?: number;
            collaborationScore?: number;
            accuracyScore?: number;
            responsivenessScore?: number;
        }, {
            overallRating?: number;
            totalRatings?: number;
            collaborationScore?: number;
            accuracyScore?: number;
            responsivenessScore?: number;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        userId?: string;
        displayName?: string;
        profileUrl?: string;
        totalSales?: number;
        totalRevenue?: number;
        profileBio?: string;
        verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
        createdTemplates?: number;
        collaboratedTemplates?: number;
        derivedTemplates?: number;
        collaborationScore?: number;
        averageCollaborators?: number;
        successfulCollaborations?: number;
        attributionSettings?: {
            showRealName?: boolean;
            showRevenue?: boolean;
            showCollaborations?: boolean;
            allowDerivations?: boolean;
            requireAttribution?: boolean;
            defaultRevenueShare?: number;
        };
        attributionReputation?: {
            overallRating?: number;
            totalRatings?: number;
            collaborationScore?: number;
            accuracyScore?: number;
            responsivenessScore?: number;
        };
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        userId?: string;
        displayName?: string;
        profileUrl?: string;
        totalSales?: number;
        totalRevenue?: number;
        profileBio?: string;
        verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
        createdTemplates?: number;
        collaboratedTemplates?: number;
        derivedTemplates?: number;
        collaborationScore?: number;
        averageCollaborators?: number;
        successfulCollaborations?: number;
        attributionSettings?: {
            showRealName?: boolean;
            showRevenue?: boolean;
            showCollaborations?: boolean;
            allowDerivations?: boolean;
            requireAttribution?: boolean;
            defaultRevenueShare?: number;
        };
        attributionReputation?: {
            overallRating?: number;
            totalRatings?: number;
            collaborationScore?: number;
            accuracyScore?: number;
            responsivenessScore?: number;
        };
    }>;
    templates: z.ZodArray<z.ZodObject<{
        templateId: z.ZodString;
        title: z.ZodString;
        attribution: z.ZodObject<{
            id: z.ZodString;
            templateId: z.ZodString;
            templateVersionId: z.ZodOptional<z.ZodString>;
            primaryCreatorId: z.ZodString;
            primaryCreatorName: z.ZodString;
            primaryCreatorEmail: z.ZodString;
            creationDate: z.ZodDate;
            collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
                userId: z.ZodString;
                userName: z.ZodString;
                userEmail: z.ZodString;
                contributionType: z.ZodEnum<["co-creator", "contributor", "reviewer", "editor", "advisor"]>;
                contributionPercentage: z.ZodNumber;
                contributionDescription: z.ZodOptional<z.ZodString>;
                joinedAt: z.ZodDate;
                verifiedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }, {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }>, "many">>;
            derivedFrom: z.ZodOptional<z.ZodObject<{
                originalTemplateId: z.ZodString;
                originalCreatorId: z.ZodString;
                derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
                attributionPercentage: z.ZodNumber;
                acknowledgment: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            }, {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            }>>;
            revenueSharing: z.ZodObject<{
                primaryCreatorShare: z.ZodNumber;
                collaboratorShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
                originalCreatorShare: z.ZodOptional<z.ZodNumber>;
                platformFee: z.ZodNumber;
                totalPercentage: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            }, {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            }>;
            attributionClaims: z.ZodDefault<z.ZodArray<z.ZodObject<{
                claimId: z.ZodString;
                claimantId: z.ZodString;
                claimType: z.ZodEnum<["ownership", "collaboration", "derivation", "inspiration"]>;
                claimDescription: z.ZodString;
                evidenceUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
                status: z.ZodEnum<["pending", "approved", "rejected", "disputed"]>;
                reviewedBy: z.ZodOptional<z.ZodString>;
                reviewedAt: z.ZodOptional<z.ZodDate>;
                resolvedAt: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }, {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }>, "many">>;
            isVerified: z.ZodDefault<z.ZodBoolean>;
            verifiedBy: z.ZodOptional<z.ZodString>;
            verifiedAt: z.ZodOptional<z.ZodDate>;
            confidenceScore: z.ZodDefault<z.ZodNumber>;
            attributionMethod: z.ZodEnum<["manual", "git_history", "session_tracking", "ai_analysis", "user_declaration"]>;
            sourceMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            createdAt: z.ZodDate;
            updatedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            confidenceScore?: number;
            templateId?: string;
            isVerified?: boolean;
            verifiedAt?: Date;
            collaborators?: {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }[];
            derivedFrom?: {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            };
            verifiedBy?: string;
            templateVersionId?: string;
            primaryCreatorId?: string;
            primaryCreatorName?: string;
            primaryCreatorEmail?: string;
            creationDate?: Date;
            revenueSharing?: {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            };
            attributionClaims?: {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }[];
            attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata?: Record<string, unknown>;
        }, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            confidenceScore?: number;
            templateId?: string;
            isVerified?: boolean;
            verifiedAt?: Date;
            collaborators?: {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }[];
            derivedFrom?: {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            };
            verifiedBy?: string;
            templateVersionId?: string;
            primaryCreatorId?: string;
            primaryCreatorName?: string;
            primaryCreatorEmail?: string;
            creationDate?: Date;
            revenueSharing?: {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            };
            attributionClaims?: {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }[];
            attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata?: Record<string, unknown>;
        }>;
        revenue: z.ZodObject<{
            total: z.ZodNumber;
            pending: z.ZodNumber;
            released: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            total?: number;
            pending?: number;
            released?: number;
        }, {
            total?: number;
            pending?: number;
            released?: number;
        }>;
        performance: z.ZodObject<{
            views: z.ZodNumber;
            purchases: z.ZodNumber;
            rating: z.ZodNumber;
            derivatives: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rating?: number;
            views?: number;
            purchases?: number;
            derivatives?: number;
        }, {
            rating?: number;
            views?: number;
            purchases?: number;
            derivatives?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        performance?: {
            rating?: number;
            views?: number;
            purchases?: number;
            derivatives?: number;
        };
        title?: string;
        revenue?: {
            total?: number;
            pending?: number;
            released?: number;
        };
        attribution?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            confidenceScore?: number;
            templateId?: string;
            isVerified?: boolean;
            verifiedAt?: Date;
            collaborators?: {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }[];
            derivedFrom?: {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            };
            verifiedBy?: string;
            templateVersionId?: string;
            primaryCreatorId?: string;
            primaryCreatorName?: string;
            primaryCreatorEmail?: string;
            creationDate?: Date;
            revenueSharing?: {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            };
            attributionClaims?: {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }[];
            attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata?: Record<string, unknown>;
        };
        templateId?: string;
    }, {
        performance?: {
            rating?: number;
            views?: number;
            purchases?: number;
            derivatives?: number;
        };
        title?: string;
        revenue?: {
            total?: number;
            pending?: number;
            released?: number;
        };
        attribution?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            confidenceScore?: number;
            templateId?: string;
            isVerified?: boolean;
            verifiedAt?: Date;
            collaborators?: {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }[];
            derivedFrom?: {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            };
            verifiedBy?: string;
            templateVersionId?: string;
            primaryCreatorId?: string;
            primaryCreatorName?: string;
            primaryCreatorEmail?: string;
            creationDate?: Date;
            revenueSharing?: {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            };
            attributionClaims?: {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }[];
            attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata?: Record<string, unknown>;
        };
        templateId?: string;
    }>, "many">;
    collaborations: z.ZodArray<z.ZodObject<{
        templateId: z.ZodString;
        title: z.ZodString;
        role: z.ZodEnum<["co-creator", "contributor", "reviewer", "editor", "advisor"]>;
        contribution: z.ZodNumber;
        revenue: z.ZodNumber;
        status: z.ZodEnum<["active", "completed", "disputed"]>;
    }, "strip", z.ZodTypeAny, {
        status?: "active" | "completed" | "disputed";
        title?: string;
        role?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        revenue?: number;
        templateId?: string;
        contribution?: number;
    }, {
        status?: "active" | "completed" | "disputed";
        title?: string;
        role?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        revenue?: number;
        templateId?: string;
        contribution?: number;
    }>, "many">;
    analytics: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        creatorId: z.ZodOptional<z.ZodString>;
        templateId: z.ZodOptional<z.ZodString>;
        analysisType: z.ZodEnum<["creator_performance", "template_attribution", "revenue_distribution", "collaboration_patterns"]>;
        periodStart: z.ZodDate;
        periodEnd: z.ZodDate;
        metrics: z.ZodObject<{
            templatesCreated: z.ZodDefault<z.ZodNumber>;
            collaborationsInitiated: z.ZodDefault<z.ZodNumber>;
            revenueGenerated: z.ZodDefault<z.ZodNumber>;
            attributionAccuracy: z.ZodDefault<z.ZodNumber>;
            totalViews: z.ZodDefault<z.ZodNumber>;
            totalPurchases: z.ZodDefault<z.ZodNumber>;
            averageRating: z.ZodDefault<z.ZodNumber>;
            derivativesCreated: z.ZodDefault<z.ZodNumber>;
            attributionClaims: z.ZodDefault<z.ZodNumber>;
            resolvedClaims: z.ZodDefault<z.ZodNumber>;
            disputedAttributions: z.ZodDefault<z.ZodNumber>;
            verificationRate: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            totalViews?: number;
            averageRating?: number;
            templatesCreated?: number;
            totalPurchases?: number;
            attributionClaims?: number;
            collaborationsInitiated?: number;
            revenueGenerated?: number;
            attributionAccuracy?: number;
            derivativesCreated?: number;
            resolvedClaims?: number;
            disputedAttributions?: number;
            verificationRate?: number;
        }, {
            totalViews?: number;
            averageRating?: number;
            templatesCreated?: number;
            totalPurchases?: number;
            attributionClaims?: number;
            collaborationsInitiated?: number;
            revenueGenerated?: number;
            attributionAccuracy?: number;
            derivativesCreated?: number;
            resolvedClaims?: number;
            disputedAttributions?: number;
            verificationRate?: number;
        }>;
        breakdown: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        insights: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["trend", "anomaly", "recommendation", "alert"]>;
            title: z.ZodString;
            description: z.ZodString;
            confidence: z.ZodNumber;
            actionable: z.ZodDefault<z.ZodBoolean>;
            metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            type?: "alert" | "recommendation" | "anomaly" | "trend";
            metadata?: Record<string, unknown>;
            title?: string;
            confidence?: number;
            actionable?: boolean;
        }, {
            description?: string;
            type?: "alert" | "recommendation" | "anomaly" | "trend";
            metadata?: Record<string, unknown>;
            title?: string;
            confidence?: number;
            actionable?: boolean;
        }>, "many">>;
        generatedAt: z.ZodDate;
        expiresAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        metrics?: {
            totalViews?: number;
            averageRating?: number;
            templatesCreated?: number;
            totalPurchases?: number;
            attributionClaims?: number;
            collaborationsInitiated?: number;
            revenueGenerated?: number;
            attributionAccuracy?: number;
            derivativesCreated?: number;
            resolvedClaims?: number;
            disputedAttributions?: number;
            verificationRate?: number;
        };
        insights?: {
            description?: string;
            type?: "alert" | "recommendation" | "anomaly" | "trend";
            metadata?: Record<string, unknown>;
            title?: string;
            confidence?: number;
            actionable?: boolean;
        }[];
        expiresAt?: Date;
        breakdown?: Record<string, unknown>;
        generatedAt?: Date;
        templateId?: string;
        creatorId?: string;
        analysisType?: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart?: Date;
        periodEnd?: Date;
    }, {
        id?: string;
        metrics?: {
            totalViews?: number;
            averageRating?: number;
            templatesCreated?: number;
            totalPurchases?: number;
            attributionClaims?: number;
            collaborationsInitiated?: number;
            revenueGenerated?: number;
            attributionAccuracy?: number;
            derivativesCreated?: number;
            resolvedClaims?: number;
            disputedAttributions?: number;
            verificationRate?: number;
        };
        insights?: {
            description?: string;
            type?: "alert" | "recommendation" | "anomaly" | "trend";
            metadata?: Record<string, unknown>;
            title?: string;
            confidence?: number;
            actionable?: boolean;
        }[];
        expiresAt?: Date;
        breakdown?: Record<string, unknown>;
        generatedAt?: Date;
        templateId?: string;
        creatorId?: string;
        analysisType?: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart?: Date;
        periodEnd?: Date;
    }>>;
}, "strip", z.ZodTypeAny, {
    templates?: {
        performance?: {
            rating?: number;
            views?: number;
            purchases?: number;
            derivatives?: number;
        };
        title?: string;
        revenue?: {
            total?: number;
            pending?: number;
            released?: number;
        };
        attribution?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            confidenceScore?: number;
            templateId?: string;
            isVerified?: boolean;
            verifiedAt?: Date;
            collaborators?: {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }[];
            derivedFrom?: {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            };
            verifiedBy?: string;
            templateVersionId?: string;
            primaryCreatorId?: string;
            primaryCreatorName?: string;
            primaryCreatorEmail?: string;
            creationDate?: Date;
            revenueSharing?: {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            };
            attributionClaims?: {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }[];
            attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata?: Record<string, unknown>;
        };
        templateId?: string;
    }[];
    analytics?: {
        id?: string;
        metrics?: {
            totalViews?: number;
            averageRating?: number;
            templatesCreated?: number;
            totalPurchases?: number;
            attributionClaims?: number;
            collaborationsInitiated?: number;
            revenueGenerated?: number;
            attributionAccuracy?: number;
            derivativesCreated?: number;
            resolvedClaims?: number;
            disputedAttributions?: number;
            verificationRate?: number;
        };
        insights?: {
            description?: string;
            type?: "alert" | "recommendation" | "anomaly" | "trend";
            metadata?: Record<string, unknown>;
            title?: string;
            confidence?: number;
            actionable?: boolean;
        }[];
        expiresAt?: Date;
        breakdown?: Record<string, unknown>;
        generatedAt?: Date;
        templateId?: string;
        creatorId?: string;
        analysisType?: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart?: Date;
        periodEnd?: Date;
    };
    profile?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        userId?: string;
        displayName?: string;
        profileUrl?: string;
        totalSales?: number;
        totalRevenue?: number;
        profileBio?: string;
        verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
        createdTemplates?: number;
        collaboratedTemplates?: number;
        derivedTemplates?: number;
        collaborationScore?: number;
        averageCollaborators?: number;
        successfulCollaborations?: number;
        attributionSettings?: {
            showRealName?: boolean;
            showRevenue?: boolean;
            showCollaborations?: boolean;
            allowDerivations?: boolean;
            requireAttribution?: boolean;
            defaultRevenueShare?: number;
        };
        attributionReputation?: {
            overallRating?: number;
            totalRatings?: number;
            collaborationScore?: number;
            accuracyScore?: number;
            responsivenessScore?: number;
        };
    };
    collaborations?: {
        status?: "active" | "completed" | "disputed";
        title?: string;
        role?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        revenue?: number;
        templateId?: string;
        contribution?: number;
    }[];
}, {
    templates?: {
        performance?: {
            rating?: number;
            views?: number;
            purchases?: number;
            derivatives?: number;
        };
        title?: string;
        revenue?: {
            total?: number;
            pending?: number;
            released?: number;
        };
        attribution?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            confidenceScore?: number;
            templateId?: string;
            isVerified?: boolean;
            verifiedAt?: Date;
            collaborators?: {
                userId?: string;
                verifiedAt?: Date;
                userName?: string;
                userEmail?: string;
                contributionType?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage?: number;
                contributionDescription?: string;
                joinedAt?: Date;
            }[];
            derivedFrom?: {
                originalTemplateId?: string;
                originalCreatorId?: string;
                derivationType?: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage?: number;
                acknowledgment?: string;
            };
            verifiedBy?: string;
            templateVersionId?: string;
            primaryCreatorId?: string;
            primaryCreatorName?: string;
            primaryCreatorEmail?: string;
            creationDate?: Date;
            revenueSharing?: {
                primaryCreatorShare?: number;
                collaboratorShares?: Record<string, number>;
                originalCreatorShare?: number;
                platformFee?: number;
                totalPercentage?: number;
            };
            attributionClaims?: {
                status?: "pending" | "approved" | "rejected" | "disputed";
                reviewedAt?: Date;
                reviewedBy?: string;
                resolvedAt?: Date;
                claimId?: string;
                claimantId?: string;
                claimType?: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription?: string;
                evidenceUrls?: string[];
            }[];
            attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata?: Record<string, unknown>;
        };
        templateId?: string;
    }[];
    analytics?: {
        id?: string;
        metrics?: {
            totalViews?: number;
            averageRating?: number;
            templatesCreated?: number;
            totalPurchases?: number;
            attributionClaims?: number;
            collaborationsInitiated?: number;
            revenueGenerated?: number;
            attributionAccuracy?: number;
            derivativesCreated?: number;
            resolvedClaims?: number;
            disputedAttributions?: number;
            verificationRate?: number;
        };
        insights?: {
            description?: string;
            type?: "alert" | "recommendation" | "anomaly" | "trend";
            metadata?: Record<string, unknown>;
            title?: string;
            confidence?: number;
            actionable?: boolean;
        }[];
        expiresAt?: Date;
        breakdown?: Record<string, unknown>;
        generatedAt?: Date;
        templateId?: string;
        creatorId?: string;
        analysisType?: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart?: Date;
        periodEnd?: Date;
    };
    profile?: {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        userId?: string;
        displayName?: string;
        profileUrl?: string;
        totalSales?: number;
        totalRevenue?: number;
        profileBio?: string;
        verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
        createdTemplates?: number;
        collaboratedTemplates?: number;
        derivedTemplates?: number;
        collaborationScore?: number;
        averageCollaborators?: number;
        successfulCollaborations?: number;
        attributionSettings?: {
            showRealName?: boolean;
            showRevenue?: boolean;
            showCollaborations?: boolean;
            allowDerivations?: boolean;
            requireAttribution?: boolean;
            defaultRevenueShare?: number;
        };
        attributionReputation?: {
            overallRating?: number;
            totalRatings?: number;
            collaborationScore?: number;
            accuracyScore?: number;
            responsivenessScore?: number;
        };
    };
    collaborations?: {
        status?: "active" | "completed" | "disputed";
        title?: string;
        role?: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        revenue?: number;
        templateId?: string;
        contribution?: number;
    }[];
}>;
export type TemplateAttributionResponse = z.infer<typeof TemplateAttributionResponseSchema>;
export type CreatorDashboardResponse = z.infer<typeof CreatorDashboardResponseSchema>;
export declare export declare export declare export declare //# sourceMappingURL=marketplaceAttribution.d.ts.map