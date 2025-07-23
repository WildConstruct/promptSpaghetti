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
        userId: string;
        userName: string;
        userEmail: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        joinedAt: Date;
        verifiedAt?: Date | undefined;
        contributionDescription?: string | undefined;
    }, {
        userId: string;
        userName: string;
        userEmail: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        joinedAt: Date;
        verifiedAt?: Date | undefined;
        contributionDescription?: string | undefined;
    }>, "many">>;
    derivedFrom: z.ZodOptional<z.ZodObject<{
        originalTemplateId: z.ZodString;
        originalCreatorId: z.ZodString;
        derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
        attributionPercentage: z.ZodNumber;
        acknowledgment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        originalTemplateId: string;
        originalCreatorId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
        acknowledgment?: string | undefined;
    }, {
        originalTemplateId: string;
        originalCreatorId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
        acknowledgment?: string | undefined;
    }>>;
    revenueSharing: z.ZodObject<{
        primaryCreatorShare: z.ZodNumber;
        collaboratorShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
        originalCreatorShare: z.ZodOptional<z.ZodNumber>;
        platformFee: z.ZodNumber;
        totalPercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        primaryCreatorShare: number;
        collaboratorShares: Record<string, number>;
        platformFee: number;
        totalPercentage: number;
        originalCreatorShare?: number | undefined;
    }, {
        primaryCreatorShare: number;
        collaboratorShares: Record<string, number>;
        platformFee: number;
        totalPercentage: number;
        originalCreatorShare?: number | undefined;
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
        status: "pending" | "approved" | "rejected" | "disputed";
        claimId: string;
        claimantId: string;
        claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription: string;
        evidenceUrls: string[];
        resolvedAt?: Date | undefined;
        reviewedAt?: Date | undefined;
        reviewedBy?: string | undefined;
    }, {
        status: "pending" | "approved" | "rejected" | "disputed";
        claimId: string;
        claimantId: string;
        claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription: string;
        resolvedAt?: Date | undefined;
        reviewedAt?: Date | undefined;
        reviewedBy?: string | undefined;
        evidenceUrls?: string[] | undefined;
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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    confidenceScore: number;
    isVerified: boolean;
    templateId: string;
    collaborators: {
        userId: string;
        userName: string;
        userEmail: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        joinedAt: Date;
        verifiedAt?: Date | undefined;
        contributionDescription?: string | undefined;
    }[];
    primaryCreatorId: string;
    primaryCreatorName: string;
    primaryCreatorEmail: string;
    creationDate: Date;
    revenueSharing: {
        primaryCreatorShare: number;
        collaboratorShares: Record<string, number>;
        platformFee: number;
        totalPercentage: number;
        originalCreatorShare?: number | undefined;
    };
    attributionClaims: {
        status: "pending" | "approved" | "rejected" | "disputed";
        claimId: string;
        claimantId: string;
        claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription: string;
        evidenceUrls: string[];
        resolvedAt?: Date | undefined;
        reviewedAt?: Date | undefined;
        reviewedBy?: string | undefined;
    }[];
    attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
    sourceMetadata: Record<string, unknown>;
    verifiedBy?: string | undefined;
    verifiedAt?: Date | undefined;
    derivedFrom?: {
        originalTemplateId: string;
        originalCreatorId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
        acknowledgment?: string | undefined;
    } | undefined;
    templateVersionId?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    templateId: string;
    primaryCreatorId: string;
    primaryCreatorName: string;
    primaryCreatorEmail: string;
    creationDate: Date;
    revenueSharing: {
        primaryCreatorShare: number;
        collaboratorShares: Record<string, number>;
        platformFee: number;
        totalPercentage: number;
        originalCreatorShare?: number | undefined;
    };
    attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
    confidenceScore?: number | undefined;
    isVerified?: boolean | undefined;
    verifiedBy?: string | undefined;
    collaborators?: {
        userId: string;
        userName: string;
        userEmail: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        joinedAt: Date;
        verifiedAt?: Date | undefined;
        contributionDescription?: string | undefined;
    }[] | undefined;
    verifiedAt?: Date | undefined;
    derivedFrom?: {
        originalTemplateId: string;
        originalCreatorId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
        acknowledgment?: string | undefined;
    } | undefined;
    templateVersionId?: string | undefined;
    attributionClaims?: {
        status: "pending" | "approved" | "rejected" | "disputed";
        claimId: string;
        claimantId: string;
        claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
        claimDescription: string;
        resolvedAt?: Date | undefined;
        reviewedAt?: Date | undefined;
        reviewedBy?: string | undefined;
        evidenceUrls?: string[] | undefined;
    }[] | undefined;
    sourceMetadata?: Record<string, unknown> | undefined;
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
        status: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage: number;
        attribution: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId: string;
        recipientType: "platform" | "creator" | "collaborator" | "original_creator";
        amountCents: number;
        releasedAt?: Date | undefined;
        holdReason?: string | undefined;
    }, {
        status: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage: number;
        attribution: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId: string;
        recipientType: "platform" | "creator" | "collaborator" | "original_creator";
        amountCents: number;
        releasedAt?: Date | undefined;
        holdReason?: string | undefined;
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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
    templateId: string;
    currency: string;
    buyerId: string;
    templateVersion: string;
    purchaseDate: Date;
    purchaseId: string;
    totalRevenue: number;
    attributionMethod: "automated" | "manual_review" | "dispute_resolution";
    attributions: {
        status: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage: number;
        attribution: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId: string;
        recipientType: "platform" | "creator" | "collaborator" | "original_creator";
        amountCents: number;
        releasedAt?: Date | undefined;
        holdReason?: string | undefined;
    }[];
    attributionCalculatedAt: Date;
    verificationRequired: boolean;
    verifiedAt?: Date | undefined;
    calculatedBy?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    templateId: string;
    buyerId: string;
    templateVersion: string;
    purchaseDate: Date;
    purchaseId: string;
    totalRevenue: number;
    attributionMethod: "automated" | "manual_review" | "dispute_resolution";
    attributions: {
        status: "pending" | "disputed" | "refunded" | "released" | "held";
        percentage: number;
        attribution: "collaborator" | "primary_creator" | "derived_from" | "platform_fee";
        recipientId: string;
        recipientType: "platform" | "creator" | "collaborator" | "original_creator";
        amountCents: number;
        releasedAt?: Date | undefined;
        holdReason?: string | undefined;
    }[];
    attributionCalculatedAt: Date;
    isVerified?: boolean | undefined;
    currency?: string | undefined;
    verifiedAt?: Date | undefined;
    calculatedBy?: string | undefined;
    verificationRequired?: boolean | undefined;
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
        showRealName: boolean;
        showRevenue: boolean;
        showCollaborations: boolean;
        allowDerivations: boolean;
        requireAttribution: boolean;
        defaultRevenueShare: number;
    }, {
        showRealName?: boolean | undefined;
        showRevenue?: boolean | undefined;
        showCollaborations?: boolean | undefined;
        allowDerivations?: boolean | undefined;
        requireAttribution?: boolean | undefined;
        defaultRevenueShare?: number | undefined;
    }>;
    attributionReputation: z.ZodObject<{
        accuracyScore: z.ZodDefault<z.ZodNumber>;
        responsivenessScore: z.ZodDefault<z.ZodNumber>;
        collaborationScore: z.ZodDefault<z.ZodNumber>;
        overallRating: z.ZodDefault<z.ZodNumber>;
        totalRatings: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        overallRating: number;
        totalRatings: number;
        collaborationScore: number;
        accuracyScore: number;
        responsivenessScore: number;
    }, {
        overallRating?: number | undefined;
        totalRatings?: number | undefined;
        collaborationScore?: number | undefined;
        accuracyScore?: number | undefined;
        responsivenessScore?: number | undefined;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    displayName: string;
    totalSales: number;
    totalRevenue: number;
    verificationBadges: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
    createdTemplates: number;
    collaboratedTemplates: number;
    derivedTemplates: number;
    collaborationScore: number;
    averageCollaborators: number;
    successfulCollaborations: number;
    attributionSettings: {
        showRealName: boolean;
        showRevenue: boolean;
        showCollaborations: boolean;
        allowDerivations: boolean;
        requireAttribution: boolean;
        defaultRevenueShare: number;
    };
    attributionReputation: {
        overallRating: number;
        totalRatings: number;
        collaborationScore: number;
        accuracyScore: number;
        responsivenessScore: number;
    };
    profileUrl?: string | undefined;
    profileBio?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    displayName: string;
    attributionSettings: {
        showRealName?: boolean | undefined;
        showRevenue?: boolean | undefined;
        showCollaborations?: boolean | undefined;
        allowDerivations?: boolean | undefined;
        requireAttribution?: boolean | undefined;
        defaultRevenueShare?: number | undefined;
    };
    attributionReputation: {
        overallRating?: number | undefined;
        totalRatings?: number | undefined;
        collaborationScore?: number | undefined;
        accuracyScore?: number | undefined;
        responsivenessScore?: number | undefined;
    };
    profileUrl?: string | undefined;
    totalSales?: number | undefined;
    totalRevenue?: number | undefined;
    profileBio?: string | undefined;
    verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[] | undefined;
    createdTemplates?: number | undefined;
    collaboratedTemplates?: number | undefined;
    derivedTemplates?: number | undefined;
    collaborationScore?: number | undefined;
    averageCollaborators?: number | undefined;
    successfulCollaborations?: number | undefined;
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
        averageRating: number;
        templatesCreated: number;
        totalViews: number;
        attributionClaims: number;
        collaborationsInitiated: number;
        revenueGenerated: number;
        attributionAccuracy: number;
        totalPurchases: number;
        derivativesCreated: number;
        resolvedClaims: number;
        disputedAttributions: number;
        verificationRate: number;
    }, {
        averageRating?: number | undefined;
        templatesCreated?: number | undefined;
        totalViews?: number | undefined;
        attributionClaims?: number | undefined;
        collaborationsInitiated?: number | undefined;
        revenueGenerated?: number | undefined;
        attributionAccuracy?: number | undefined;
        totalPurchases?: number | undefined;
        derivativesCreated?: number | undefined;
        resolvedClaims?: number | undefined;
        disputedAttributions?: number | undefined;
        verificationRate?: number | undefined;
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
        description: string;
        type: "alert" | "recommendation" | "anomaly" | "trend";
        metadata: Record<string, unknown>;
        title: string;
        confidence: number;
        actionable: boolean;
    }, {
        description: string;
        type: "alert" | "recommendation" | "anomaly" | "trend";
        title: string;
        confidence: number;
        metadata?: Record<string, unknown> | undefined;
        actionable?: boolean | undefined;
    }>, "many">>;
    generatedAt: z.ZodDate;
    expiresAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    expiresAt: Date;
    metrics: {
        averageRating: number;
        templatesCreated: number;
        totalViews: number;
        attributionClaims: number;
        collaborationsInitiated: number;
        revenueGenerated: number;
        attributionAccuracy: number;
        totalPurchases: number;
        derivativesCreated: number;
        resolvedClaims: number;
        disputedAttributions: number;
        verificationRate: number;
    };
    insights: {
        description: string;
        type: "alert" | "recommendation" | "anomaly" | "trend";
        metadata: Record<string, unknown>;
        title: string;
        confidence: number;
        actionable: boolean;
    }[];
    generatedAt: Date;
    analysisType: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
    periodStart: Date;
    periodEnd: Date;
    breakdown: Record<string, unknown>;
    templateId?: string | undefined;
    creatorId?: string | undefined;
}, {
    id: string;
    expiresAt: Date;
    metrics: {
        averageRating?: number | undefined;
        templatesCreated?: number | undefined;
        totalViews?: number | undefined;
        attributionClaims?: number | undefined;
        collaborationsInitiated?: number | undefined;
        revenueGenerated?: number | undefined;
        attributionAccuracy?: number | undefined;
        totalPurchases?: number | undefined;
        derivativesCreated?: number | undefined;
        resolvedClaims?: number | undefined;
        disputedAttributions?: number | undefined;
        verificationRate?: number | undefined;
    };
    generatedAt: Date;
    analysisType: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
    periodStart: Date;
    periodEnd: Date;
    insights?: {
        description: string;
        type: "alert" | "recommendation" | "anomaly" | "trend";
        title: string;
        confidence: number;
        metadata?: Record<string, unknown> | undefined;
        actionable?: boolean | undefined;
    }[] | undefined;
    templateId?: string | undefined;
    creatorId?: string | undefined;
    breakdown?: Record<string, unknown> | undefined;
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
        isCollaborative: boolean;
        collaborators: string[];
        contributionType?: "publishing" | "editing" | "review" | "creation" | undefined;
    }, {
        isCollaborative?: boolean | undefined;
        collaborators?: string[] | undefined;
        contributionType?: "publishing" | "editing" | "review" | "creation" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    projectId: string;
    isCollaborative: boolean;
    resourceId: string;
    resourceType: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim";
    confidenceScore: number;
    authorType: "system" | "anonymous" | "api" | "user" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine";
    changeType: "move" | "delete" | "update" | "create" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified";
    changeOperation: string;
    changeData: Record<string, unknown>;
    changeSize: number;
    collaboratorCount: number;
    effectiveAt: Date;
    sessionId?: string | undefined;
    snapshotId?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    templateId?: string | undefined;
    operationId?: string | undefined;
    oldValue?: Record<string, unknown> | undefined;
    newValue?: Record<string, unknown> | undefined;
    authorId?: string | undefined;
    authorName?: string | undefined;
    authorEmail?: string | undefined;
    batchId?: string | undefined;
    parentChangeId?: string | undefined;
    changeReason?: string | undefined;
    changeDescription?: string | undefined;
    purchaseId?: string | undefined;
    revenueAmount?: number | undefined;
    attributionClaim?: string | undefined;
    collaborationContext?: {
        isCollaborative: boolean;
        collaborators: string[];
        contributionType?: "publishing" | "editing" | "review" | "creation" | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: Date;
    projectId: string;
    resourceId: string;
    resourceType: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim";
    authorType: "system" | "anonymous" | "api" | "user" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine";
    changeType: "move" | "delete" | "update" | "create" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified";
    changeOperation: string;
    effectiveAt: Date;
    sessionId?: string | undefined;
    snapshotId?: string | undefined;
    isCollaborative?: boolean | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    confidenceScore?: number | undefined;
    templateId?: string | undefined;
    operationId?: string | undefined;
    oldValue?: Record<string, unknown> | undefined;
    newValue?: Record<string, unknown> | undefined;
    authorId?: string | undefined;
    authorName?: string | undefined;
    authorEmail?: string | undefined;
    changeData?: Record<string, unknown> | undefined;
    changeSize?: number | undefined;
    batchId?: string | undefined;
    parentChangeId?: string | undefined;
    changeReason?: string | undefined;
    changeDescription?: string | undefined;
    collaboratorCount?: number | undefined;
    purchaseId?: string | undefined;
    revenueAmount?: number | undefined;
    attributionClaim?: string | undefined;
    collaborationContext?: {
        isCollaborative?: boolean | undefined;
        collaborators?: string[] | undefined;
        contributionType?: "publishing" | "editing" | "review" | "creation" | undefined;
    } | undefined;
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
        min?: number | undefined;
        max?: number | undefined;
    }, {
        min?: number | undefined;
        max?: number | undefined;
    }>>;
    verificationStatus: z.ZodOptional<z.ZodEnum<["verified", "unverified", "disputed"]>>;
    collaborationType: z.ZodOptional<z.ZodEnum<["creation", "editing", "review", "publishing"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    sortBy: "created_at" | "confidence_score" | "effective_at" | "change_size";
    sortOrder: "asc" | "desc";
    projectId?: string | undefined;
    sessionId?: string | undefined;
    snapshotId?: string | undefined;
    isCollaborative?: boolean | undefined;
    resourceId?: string | undefined;
    resourceType?: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim" | undefined;
    templateId?: string | undefined;
    creatorId?: string | undefined;
    authorType?: "system" | "anonymous" | "api" | "user" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine" | undefined;
    authorId?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    changeType?: "move" | "delete" | "update" | "create" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified" | undefined;
    batchId?: string | undefined;
    minConfidenceScore?: number | undefined;
    verificationStatus?: "verified" | "disputed" | "unverified" | undefined;
    revenueRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    collaborationType?: "publishing" | "editing" | "review" | "creation" | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    sortBy?: "created_at" | "confidence_score" | "effective_at" | "change_size" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    projectId?: string | undefined;
    sessionId?: string | undefined;
    snapshotId?: string | undefined;
    isCollaborative?: boolean | undefined;
    resourceId?: string | undefined;
    resourceType?: "template" | "position" | "graph" | "node" | "property" | "edge" | "creator_profile" | "template_version" | "template_purchase" | "template_review" | "template_collection" | "revenue_record" | "attribution_claim" | undefined;
    templateId?: string | undefined;
    creatorId?: string | undefined;
    authorType?: "system" | "anonymous" | "api" | "user" | "guest" | "template_creator" | "template_collaborator" | "marketplace_curator" | "revenue_system" | "attribution_engine" | undefined;
    authorId?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
    changeType?: "move" | "delete" | "update" | "create" | "property_change" | "connection_change" | "template_purchase" | "template_review" | "template_create" | "template_publish" | "revenue_earned" | "attribution_assigned" | "collaboration_joined" | "template_derived" | "collection_add" | "creator_verified" | undefined;
    batchId?: string | undefined;
    minConfidenceScore?: number | undefined;
    verificationStatus?: "verified" | "disputed" | "unverified" | undefined;
    revenueRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    collaborationType?: "publishing" | "editing" | "review" | "creation" | undefined;
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
        userId: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        contributionDescription?: string | undefined;
    }, {
        userId: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        contributionDescription?: string | undefined;
    }>, "many">>;
    derivedFrom: z.ZodOptional<z.ZodObject<{
        originalTemplateId: z.ZodString;
        derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
        attributionPercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        originalTemplateId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
    }, {
        originalTemplateId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
    }>>;
    attributionMethod: z.ZodDefault<z.ZodEnum<["manual", "git_history", "session_tracking", "ai_analysis", "user_declaration"]>>;
    sourceMetadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    templateId: string;
    collaborators: {
        userId: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        contributionDescription?: string | undefined;
    }[];
    primaryCreatorId: string;
    attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
    sourceMetadata: Record<string, unknown>;
    derivedFrom?: {
        originalTemplateId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
    } | undefined;
    templateVersionId?: string | undefined;
}, {
    templateId: string;
    primaryCreatorId: string;
    collaborators?: {
        userId: string;
        contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        contributionPercentage: number;
        contributionDescription?: string | undefined;
    }[] | undefined;
    derivedFrom?: {
        originalTemplateId: string;
        derivationType: "fork" | "remix" | "inspired" | "adaptation";
        attributionPercentage: number;
    } | undefined;
    templateVersionId?: string | undefined;
    attributionMethod?: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration" | undefined;
    sourceMetadata?: Record<string, unknown> | undefined;
}>;
export declare const CreateAttributionClaimRequestSchema: z.ZodObject<{
    templateId: z.ZodString;
    claimType: z.ZodEnum<["ownership", "collaboration", "derivation", "inspiration"]>;
    claimDescription: z.ZodString;
    evidenceUrls: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    metadata: Record<string, unknown>;
    templateId: string;
    claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
    claimDescription: string;
    evidenceUrls: string[];
}, {
    templateId: string;
    claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
    claimDescription: string;
    metadata?: Record<string, unknown> | undefined;
    evidenceUrls?: string[] | undefined;
}>;
export declare const UpdateRevenueAttributionRequestSchema: z.ZodObject<{
    purchaseId: z.ZodString;
    attributionOverrides: z.ZodOptional<z.ZodArray<z.ZodObject<{
        recipientId: z.ZodString;
        newPercentage: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        recipientId: string;
        newPercentage: number;
    }, {
        reason: string;
        recipientId: string;
        newPercentage: number;
    }>, "many">>;
    verificationRequired: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    purchaseId: string;
    notes?: string | undefined;
    verificationRequired?: boolean | undefined;
    attributionOverrides?: {
        reason: string;
        recipientId: string;
        newPercentage: number;
    }[] | undefined;
}, {
    purchaseId: string;
    notes?: string | undefined;
    verificationRequired?: boolean | undefined;
    attributionOverrides?: {
        reason: string;
        recipientId: string;
        newPercentage: number;
    }[] | undefined;
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
            userId: string;
            userName: string;
            userEmail: string;
            contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage: number;
            joinedAt: Date;
            verifiedAt?: Date | undefined;
            contributionDescription?: string | undefined;
        }, {
            userId: string;
            userName: string;
            userEmail: string;
            contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage: number;
            joinedAt: Date;
            verifiedAt?: Date | undefined;
            contributionDescription?: string | undefined;
        }>, "many">>;
        derivedFrom: z.ZodOptional<z.ZodObject<{
            originalTemplateId: z.ZodString;
            originalCreatorId: z.ZodString;
            derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
            attributionPercentage: z.ZodNumber;
            acknowledgment: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            originalTemplateId: string;
            originalCreatorId: string;
            derivationType: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage: number;
            acknowledgment?: string | undefined;
        }, {
            originalTemplateId: string;
            originalCreatorId: string;
            derivationType: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage: number;
            acknowledgment?: string | undefined;
        }>>;
        revenueSharing: z.ZodObject<{
            primaryCreatorShare: z.ZodNumber;
            collaboratorShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
            originalCreatorShare: z.ZodOptional<z.ZodNumber>;
            platformFee: z.ZodNumber;
            totalPercentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            primaryCreatorShare: number;
            collaboratorShares: Record<string, number>;
            platformFee: number;
            totalPercentage: number;
            originalCreatorShare?: number | undefined;
        }, {
            primaryCreatorShare: number;
            collaboratorShares: Record<string, number>;
            platformFee: number;
            totalPercentage: number;
            originalCreatorShare?: number | undefined;
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
            status: "pending" | "approved" | "rejected" | "disputed";
            claimId: string;
            claimantId: string;
            claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription: string;
            evidenceUrls: string[];
            resolvedAt?: Date | undefined;
            reviewedAt?: Date | undefined;
            reviewedBy?: string | undefined;
        }, {
            status: "pending" | "approved" | "rejected" | "disputed";
            claimId: string;
            claimantId: string;
            claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription: string;
            resolvedAt?: Date | undefined;
            reviewedAt?: Date | undefined;
            reviewedBy?: string | undefined;
            evidenceUrls?: string[] | undefined;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        confidenceScore: number;
        isVerified: boolean;
        templateId: string;
        collaborators: {
            userId: string;
            userName: string;
            userEmail: string;
            contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage: number;
            joinedAt: Date;
            verifiedAt?: Date | undefined;
            contributionDescription?: string | undefined;
        }[];
        primaryCreatorId: string;
        primaryCreatorName: string;
        primaryCreatorEmail: string;
        creationDate: Date;
        revenueSharing: {
            primaryCreatorShare: number;
            collaboratorShares: Record<string, number>;
            platformFee: number;
            totalPercentage: number;
            originalCreatorShare?: number | undefined;
        };
        attributionClaims: {
            status: "pending" | "approved" | "rejected" | "disputed";
            claimId: string;
            claimantId: string;
            claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription: string;
            evidenceUrls: string[];
            resolvedAt?: Date | undefined;
            reviewedAt?: Date | undefined;
            reviewedBy?: string | undefined;
        }[];
        attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        sourceMetadata: Record<string, unknown>;
        verifiedBy?: string | undefined;
        verifiedAt?: Date | undefined;
        derivedFrom?: {
            originalTemplateId: string;
            originalCreatorId: string;
            derivationType: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage: number;
            acknowledgment?: string | undefined;
        } | undefined;
        templateVersionId?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        primaryCreatorId: string;
        primaryCreatorName: string;
        primaryCreatorEmail: string;
        creationDate: Date;
        revenueSharing: {
            primaryCreatorShare: number;
            collaboratorShares: Record<string, number>;
            platformFee: number;
            totalPercentage: number;
            originalCreatorShare?: number | undefined;
        };
        attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        confidenceScore?: number | undefined;
        isVerified?: boolean | undefined;
        verifiedBy?: string | undefined;
        collaborators?: {
            userId: string;
            userName: string;
            userEmail: string;
            contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage: number;
            joinedAt: Date;
            verifiedAt?: Date | undefined;
            contributionDescription?: string | undefined;
        }[] | undefined;
        verifiedAt?: Date | undefined;
        derivedFrom?: {
            originalTemplateId: string;
            originalCreatorId: string;
            derivationType: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage: number;
            acknowledgment?: string | undefined;
        } | undefined;
        templateVersionId?: string | undefined;
        attributionClaims?: {
            status: "pending" | "approved" | "rejected" | "disputed";
            claimId: string;
            claimantId: string;
            claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription: string;
            resolvedAt?: Date | undefined;
            reviewedAt?: Date | undefined;
            reviewedBy?: string | undefined;
            evidenceUrls?: string[] | undefined;
        }[] | undefined;
        sourceMetadata?: Record<string, unknown> | undefined;
    }>;
    relatedTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        templateId: z.ZodString;
        title: z.ZodString;
        relationship: z.ZodEnum<["original", "derivative", "similar"]>;
        attributionScore: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        title: string;
        templateId: string;
        relationship: "similar" | "original" | "derivative";
        attributionScore: number;
    }, {
        title: string;
        templateId: string;
        relationship: "similar" | "original" | "derivative";
        attributionScore: number;
    }>, "many">>;
    revenueStatistics: z.ZodOptional<z.ZodObject<{
        totalRevenue: z.ZodNumber;
        revenueByRecipient: z.ZodRecord<z.ZodString, z.ZodNumber>;
        averageRevenuePerSale: z.ZodNumber;
        totalSales: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalSales: number;
        totalRevenue: number;
        revenueByRecipient: Record<string, number>;
        averageRevenuePerSale: number;
    }, {
        totalSales: number;
        totalRevenue: number;
        revenueByRecipient: Record<string, number>;
        averageRevenuePerSale: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    attribution: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        confidenceScore: number;
        isVerified: boolean;
        templateId: string;
        collaborators: {
            userId: string;
            userName: string;
            userEmail: string;
            contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage: number;
            joinedAt: Date;
            verifiedAt?: Date | undefined;
            contributionDescription?: string | undefined;
        }[];
        primaryCreatorId: string;
        primaryCreatorName: string;
        primaryCreatorEmail: string;
        creationDate: Date;
        revenueSharing: {
            primaryCreatorShare: number;
            collaboratorShares: Record<string, number>;
            platformFee: number;
            totalPercentage: number;
            originalCreatorShare?: number | undefined;
        };
        attributionClaims: {
            status: "pending" | "approved" | "rejected" | "disputed";
            claimId: string;
            claimantId: string;
            claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription: string;
            evidenceUrls: string[];
            resolvedAt?: Date | undefined;
            reviewedAt?: Date | undefined;
            reviewedBy?: string | undefined;
        }[];
        attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        sourceMetadata: Record<string, unknown>;
        verifiedBy?: string | undefined;
        verifiedAt?: Date | undefined;
        derivedFrom?: {
            originalTemplateId: string;
            originalCreatorId: string;
            derivationType: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage: number;
            acknowledgment?: string | undefined;
        } | undefined;
        templateVersionId?: string | undefined;
    };
    relatedTemplates: {
        title: string;
        templateId: string;
        relationship: "similar" | "original" | "derivative";
        attributionScore: number;
    }[];
    revenueStatistics?: {
        totalSales: number;
        totalRevenue: number;
        revenueByRecipient: Record<string, number>;
        averageRevenuePerSale: number;
    } | undefined;
}, {
    attribution: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        templateId: string;
        primaryCreatorId: string;
        primaryCreatorName: string;
        primaryCreatorEmail: string;
        creationDate: Date;
        revenueSharing: {
            primaryCreatorShare: number;
            collaboratorShares: Record<string, number>;
            platformFee: number;
            totalPercentage: number;
            originalCreatorShare?: number | undefined;
        };
        attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
        confidenceScore?: number | undefined;
        isVerified?: boolean | undefined;
        verifiedBy?: string | undefined;
        collaborators?: {
            userId: string;
            userName: string;
            userEmail: string;
            contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
            contributionPercentage: number;
            joinedAt: Date;
            verifiedAt?: Date | undefined;
            contributionDescription?: string | undefined;
        }[] | undefined;
        verifiedAt?: Date | undefined;
        derivedFrom?: {
            originalTemplateId: string;
            originalCreatorId: string;
            derivationType: "fork" | "remix" | "inspired" | "adaptation";
            attributionPercentage: number;
            acknowledgment?: string | undefined;
        } | undefined;
        templateVersionId?: string | undefined;
        attributionClaims?: {
            status: "pending" | "approved" | "rejected" | "disputed";
            claimId: string;
            claimantId: string;
            claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
            claimDescription: string;
            resolvedAt?: Date | undefined;
            reviewedAt?: Date | undefined;
            reviewedBy?: string | undefined;
            evidenceUrls?: string[] | undefined;
        }[] | undefined;
        sourceMetadata?: Record<string, unknown> | undefined;
    };
    relatedTemplates?: {
        title: string;
        templateId: string;
        relationship: "similar" | "original" | "derivative";
        attributionScore: number;
    }[] | undefined;
    revenueStatistics?: {
        totalSales: number;
        totalRevenue: number;
        revenueByRecipient: Record<string, number>;
        averageRevenuePerSale: number;
    } | undefined;
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
            showRealName: boolean;
            showRevenue: boolean;
            showCollaborations: boolean;
            allowDerivations: boolean;
            requireAttribution: boolean;
            defaultRevenueShare: number;
        }, {
            showRealName?: boolean | undefined;
            showRevenue?: boolean | undefined;
            showCollaborations?: boolean | undefined;
            allowDerivations?: boolean | undefined;
            requireAttribution?: boolean | undefined;
            defaultRevenueShare?: number | undefined;
        }>;
        attributionReputation: z.ZodObject<{
            accuracyScore: z.ZodDefault<z.ZodNumber>;
            responsivenessScore: z.ZodDefault<z.ZodNumber>;
            collaborationScore: z.ZodDefault<z.ZodNumber>;
            overallRating: z.ZodDefault<z.ZodNumber>;
            totalRatings: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            overallRating: number;
            totalRatings: number;
            collaborationScore: number;
            accuracyScore: number;
            responsivenessScore: number;
        }, {
            overallRating?: number | undefined;
            totalRatings?: number | undefined;
            collaborationScore?: number | undefined;
            accuracyScore?: number | undefined;
            responsivenessScore?: number | undefined;
        }>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        totalSales: number;
        totalRevenue: number;
        verificationBadges: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
        createdTemplates: number;
        collaboratedTemplates: number;
        derivedTemplates: number;
        collaborationScore: number;
        averageCollaborators: number;
        successfulCollaborations: number;
        attributionSettings: {
            showRealName: boolean;
            showRevenue: boolean;
            showCollaborations: boolean;
            allowDerivations: boolean;
            requireAttribution: boolean;
            defaultRevenueShare: number;
        };
        attributionReputation: {
            overallRating: number;
            totalRatings: number;
            collaborationScore: number;
            accuracyScore: number;
            responsivenessScore: number;
        };
        profileUrl?: string | undefined;
        profileBio?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        attributionSettings: {
            showRealName?: boolean | undefined;
            showRevenue?: boolean | undefined;
            showCollaborations?: boolean | undefined;
            allowDerivations?: boolean | undefined;
            requireAttribution?: boolean | undefined;
            defaultRevenueShare?: number | undefined;
        };
        attributionReputation: {
            overallRating?: number | undefined;
            totalRatings?: number | undefined;
            collaborationScore?: number | undefined;
            accuracyScore?: number | undefined;
            responsivenessScore?: number | undefined;
        };
        profileUrl?: string | undefined;
        totalSales?: number | undefined;
        totalRevenue?: number | undefined;
        profileBio?: string | undefined;
        verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[] | undefined;
        createdTemplates?: number | undefined;
        collaboratedTemplates?: number | undefined;
        derivedTemplates?: number | undefined;
        collaborationScore?: number | undefined;
        averageCollaborators?: number | undefined;
        successfulCollaborations?: number | undefined;
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
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }, {
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }>, "many">>;
            derivedFrom: z.ZodOptional<z.ZodObject<{
                originalTemplateId: z.ZodString;
                originalCreatorId: z.ZodString;
                derivationType: z.ZodEnum<["fork", "remix", "inspired", "adaptation"]>;
                attributionPercentage: z.ZodNumber;
                acknowledgment: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            }, {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            }>>;
            revenueSharing: z.ZodObject<{
                primaryCreatorShare: z.ZodNumber;
                collaboratorShares: z.ZodRecord<z.ZodString, z.ZodNumber>;
                originalCreatorShare: z.ZodOptional<z.ZodNumber>;
                platformFee: z.ZodNumber;
                totalPercentage: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
            }, {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
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
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                evidenceUrls: string[];
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
            }, {
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
                evidenceUrls?: string[] | undefined;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            confidenceScore: number;
            isVerified: boolean;
            templateId: string;
            collaborators: {
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }[];
            primaryCreatorId: string;
            primaryCreatorName: string;
            primaryCreatorEmail: string;
            creationDate: Date;
            revenueSharing: {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
            };
            attributionClaims: {
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                evidenceUrls: string[];
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
            }[];
            attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata: Record<string, unknown>;
            verifiedBy?: string | undefined;
            verifiedAt?: Date | undefined;
            derivedFrom?: {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            } | undefined;
            templateVersionId?: string | undefined;
        }, {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            primaryCreatorId: string;
            primaryCreatorName: string;
            primaryCreatorEmail: string;
            creationDate: Date;
            revenueSharing: {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
            };
            attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            confidenceScore?: number | undefined;
            isVerified?: boolean | undefined;
            verifiedBy?: string | undefined;
            collaborators?: {
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }[] | undefined;
            verifiedAt?: Date | undefined;
            derivedFrom?: {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            } | undefined;
            templateVersionId?: string | undefined;
            attributionClaims?: {
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
                evidenceUrls?: string[] | undefined;
            }[] | undefined;
            sourceMetadata?: Record<string, unknown> | undefined;
        }>;
        revenue: z.ZodObject<{
            total: z.ZodNumber;
            pending: z.ZodNumber;
            released: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            total: number;
            pending: number;
            released: number;
        }, {
            total: number;
            pending: number;
            released: number;
        }>;
        performance: z.ZodObject<{
            views: z.ZodNumber;
            purchases: z.ZodNumber;
            rating: z.ZodNumber;
            derivatives: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            rating: number;
            views: number;
            purchases: number;
            derivatives: number;
        }, {
            rating: number;
            views: number;
            purchases: number;
            derivatives: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        performance: {
            rating: number;
            views: number;
            purchases: number;
            derivatives: number;
        };
        title: string;
        templateId: string;
        revenue: {
            total: number;
            pending: number;
            released: number;
        };
        attribution: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            confidenceScore: number;
            isVerified: boolean;
            templateId: string;
            collaborators: {
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }[];
            primaryCreatorId: string;
            primaryCreatorName: string;
            primaryCreatorEmail: string;
            creationDate: Date;
            revenueSharing: {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
            };
            attributionClaims: {
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                evidenceUrls: string[];
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
            }[];
            attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata: Record<string, unknown>;
            verifiedBy?: string | undefined;
            verifiedAt?: Date | undefined;
            derivedFrom?: {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            } | undefined;
            templateVersionId?: string | undefined;
        };
    }, {
        performance: {
            rating: number;
            views: number;
            purchases: number;
            derivatives: number;
        };
        title: string;
        templateId: string;
        revenue: {
            total: number;
            pending: number;
            released: number;
        };
        attribution: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            primaryCreatorId: string;
            primaryCreatorName: string;
            primaryCreatorEmail: string;
            creationDate: Date;
            revenueSharing: {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
            };
            attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            confidenceScore?: number | undefined;
            isVerified?: boolean | undefined;
            verifiedBy?: string | undefined;
            collaborators?: {
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }[] | undefined;
            verifiedAt?: Date | undefined;
            derivedFrom?: {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            } | undefined;
            templateVersionId?: string | undefined;
            attributionClaims?: {
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
                evidenceUrls?: string[] | undefined;
            }[] | undefined;
            sourceMetadata?: Record<string, unknown> | undefined;
        };
    }>, "many">;
    collaborations: z.ZodArray<z.ZodObject<{
        templateId: z.ZodString;
        title: z.ZodString;
        role: z.ZodEnum<["co-creator", "contributor", "reviewer", "editor", "advisor"]>;
        contribution: z.ZodNumber;
        revenue: z.ZodNumber;
        status: z.ZodEnum<["active", "completed", "disputed"]>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "completed" | "disputed";
        title: string;
        role: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        templateId: string;
        revenue: number;
        contribution: number;
    }, {
        status: "active" | "completed" | "disputed";
        title: string;
        role: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        templateId: string;
        revenue: number;
        contribution: number;
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
            averageRating: number;
            templatesCreated: number;
            totalViews: number;
            attributionClaims: number;
            collaborationsInitiated: number;
            revenueGenerated: number;
            attributionAccuracy: number;
            totalPurchases: number;
            derivativesCreated: number;
            resolvedClaims: number;
            disputedAttributions: number;
            verificationRate: number;
        }, {
            averageRating?: number | undefined;
            templatesCreated?: number | undefined;
            totalViews?: number | undefined;
            attributionClaims?: number | undefined;
            collaborationsInitiated?: number | undefined;
            revenueGenerated?: number | undefined;
            attributionAccuracy?: number | undefined;
            totalPurchases?: number | undefined;
            derivativesCreated?: number | undefined;
            resolvedClaims?: number | undefined;
            disputedAttributions?: number | undefined;
            verificationRate?: number | undefined;
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
            description: string;
            type: "alert" | "recommendation" | "anomaly" | "trend";
            metadata: Record<string, unknown>;
            title: string;
            confidence: number;
            actionable: boolean;
        }, {
            description: string;
            type: "alert" | "recommendation" | "anomaly" | "trend";
            title: string;
            confidence: number;
            metadata?: Record<string, unknown> | undefined;
            actionable?: boolean | undefined;
        }>, "many">>;
        generatedAt: z.ZodDate;
        expiresAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        expiresAt: Date;
        metrics: {
            averageRating: number;
            templatesCreated: number;
            totalViews: number;
            attributionClaims: number;
            collaborationsInitiated: number;
            revenueGenerated: number;
            attributionAccuracy: number;
            totalPurchases: number;
            derivativesCreated: number;
            resolvedClaims: number;
            disputedAttributions: number;
            verificationRate: number;
        };
        insights: {
            description: string;
            type: "alert" | "recommendation" | "anomaly" | "trend";
            metadata: Record<string, unknown>;
            title: string;
            confidence: number;
            actionable: boolean;
        }[];
        generatedAt: Date;
        analysisType: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart: Date;
        periodEnd: Date;
        breakdown: Record<string, unknown>;
        templateId?: string | undefined;
        creatorId?: string | undefined;
    }, {
        id: string;
        expiresAt: Date;
        metrics: {
            averageRating?: number | undefined;
            templatesCreated?: number | undefined;
            totalViews?: number | undefined;
            attributionClaims?: number | undefined;
            collaborationsInitiated?: number | undefined;
            revenueGenerated?: number | undefined;
            attributionAccuracy?: number | undefined;
            totalPurchases?: number | undefined;
            derivativesCreated?: number | undefined;
            resolvedClaims?: number | undefined;
            disputedAttributions?: number | undefined;
            verificationRate?: number | undefined;
        };
        generatedAt: Date;
        analysisType: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart: Date;
        periodEnd: Date;
        insights?: {
            description: string;
            type: "alert" | "recommendation" | "anomaly" | "trend";
            title: string;
            confidence: number;
            metadata?: Record<string, unknown> | undefined;
            actionable?: boolean | undefined;
        }[] | undefined;
        templateId?: string | undefined;
        creatorId?: string | undefined;
        breakdown?: Record<string, unknown> | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    templates: {
        performance: {
            rating: number;
            views: number;
            purchases: number;
            derivatives: number;
        };
        title: string;
        templateId: string;
        revenue: {
            total: number;
            pending: number;
            released: number;
        };
        attribution: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            confidenceScore: number;
            isVerified: boolean;
            templateId: string;
            collaborators: {
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }[];
            primaryCreatorId: string;
            primaryCreatorName: string;
            primaryCreatorEmail: string;
            creationDate: Date;
            revenueSharing: {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
            };
            attributionClaims: {
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                evidenceUrls: string[];
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
            }[];
            attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            sourceMetadata: Record<string, unknown>;
            verifiedBy?: string | undefined;
            verifiedAt?: Date | undefined;
            derivedFrom?: {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            } | undefined;
            templateVersionId?: string | undefined;
        };
    }[];
    profile: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        totalSales: number;
        totalRevenue: number;
        verificationBadges: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[];
        createdTemplates: number;
        collaboratedTemplates: number;
        derivedTemplates: number;
        collaborationScore: number;
        averageCollaborators: number;
        successfulCollaborations: number;
        attributionSettings: {
            showRealName: boolean;
            showRevenue: boolean;
            showCollaborations: boolean;
            allowDerivations: boolean;
            requireAttribution: boolean;
            defaultRevenueShare: number;
        };
        attributionReputation: {
            overallRating: number;
            totalRatings: number;
            collaborationScore: number;
            accuracyScore: number;
            responsivenessScore: number;
        };
        profileUrl?: string | undefined;
        profileBio?: string | undefined;
    };
    collaborations: {
        status: "active" | "completed" | "disputed";
        title: string;
        role: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        templateId: string;
        revenue: number;
        contribution: number;
    }[];
    analytics?: {
        id: string;
        expiresAt: Date;
        metrics: {
            averageRating: number;
            templatesCreated: number;
            totalViews: number;
            attributionClaims: number;
            collaborationsInitiated: number;
            revenueGenerated: number;
            attributionAccuracy: number;
            totalPurchases: number;
            derivativesCreated: number;
            resolvedClaims: number;
            disputedAttributions: number;
            verificationRate: number;
        };
        insights: {
            description: string;
            type: "alert" | "recommendation" | "anomaly" | "trend";
            metadata: Record<string, unknown>;
            title: string;
            confidence: number;
            actionable: boolean;
        }[];
        generatedAt: Date;
        analysisType: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart: Date;
        periodEnd: Date;
        breakdown: Record<string, unknown>;
        templateId?: string | undefined;
        creatorId?: string | undefined;
    } | undefined;
}, {
    templates: {
        performance: {
            rating: number;
            views: number;
            purchases: number;
            derivatives: number;
        };
        title: string;
        templateId: string;
        revenue: {
            total: number;
            pending: number;
            released: number;
        };
        attribution: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            templateId: string;
            primaryCreatorId: string;
            primaryCreatorName: string;
            primaryCreatorEmail: string;
            creationDate: Date;
            revenueSharing: {
                primaryCreatorShare: number;
                collaboratorShares: Record<string, number>;
                platformFee: number;
                totalPercentage: number;
                originalCreatorShare?: number | undefined;
            };
            attributionMethod: "manual" | "ai_analysis" | "git_history" | "session_tracking" | "user_declaration";
            confidenceScore?: number | undefined;
            isVerified?: boolean | undefined;
            verifiedBy?: string | undefined;
            collaborators?: {
                userId: string;
                userName: string;
                userEmail: string;
                contributionType: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
                contributionPercentage: number;
                joinedAt: Date;
                verifiedAt?: Date | undefined;
                contributionDescription?: string | undefined;
            }[] | undefined;
            verifiedAt?: Date | undefined;
            derivedFrom?: {
                originalTemplateId: string;
                originalCreatorId: string;
                derivationType: "fork" | "remix" | "inspired" | "adaptation";
                attributionPercentage: number;
                acknowledgment?: string | undefined;
            } | undefined;
            templateVersionId?: string | undefined;
            attributionClaims?: {
                status: "pending" | "approved" | "rejected" | "disputed";
                claimId: string;
                claimantId: string;
                claimType: "collaboration" | "derivation" | "ownership" | "inspiration";
                claimDescription: string;
                resolvedAt?: Date | undefined;
                reviewedAt?: Date | undefined;
                reviewedBy?: string | undefined;
                evidenceUrls?: string[] | undefined;
            }[] | undefined;
            sourceMetadata?: Record<string, unknown> | undefined;
        };
    }[];
    profile: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        attributionSettings: {
            showRealName?: boolean | undefined;
            showRevenue?: boolean | undefined;
            showCollaborations?: boolean | undefined;
            allowDerivations?: boolean | undefined;
            requireAttribution?: boolean | undefined;
            defaultRevenueShare?: number | undefined;
        };
        attributionReputation: {
            overallRating?: number | undefined;
            totalRatings?: number | undefined;
            collaborationScore?: number | undefined;
            accuracyScore?: number | undefined;
            responsivenessScore?: number | undefined;
        };
        profileUrl?: string | undefined;
        totalSales?: number | undefined;
        totalRevenue?: number | undefined;
        profileBio?: string | undefined;
        verificationBadges?: ("verified_creator" | "top_seller" | "collaboration_leader" | "innovation_award")[] | undefined;
        createdTemplates?: number | undefined;
        collaboratedTemplates?: number | undefined;
        derivedTemplates?: number | undefined;
        collaborationScore?: number | undefined;
        averageCollaborators?: number | undefined;
        successfulCollaborations?: number | undefined;
    };
    collaborations: {
        status: "active" | "completed" | "disputed";
        title: string;
        role: "editor" | "reviewer" | "contributor" | "co-creator" | "advisor";
        templateId: string;
        revenue: number;
        contribution: number;
    }[];
    analytics?: {
        id: string;
        expiresAt: Date;
        metrics: {
            averageRating?: number | undefined;
            templatesCreated?: number | undefined;
            totalViews?: number | undefined;
            attributionClaims?: number | undefined;
            collaborationsInitiated?: number | undefined;
            revenueGenerated?: number | undefined;
            attributionAccuracy?: number | undefined;
            totalPurchases?: number | undefined;
            derivativesCreated?: number | undefined;
            resolvedClaims?: number | undefined;
            disputedAttributions?: number | undefined;
            verificationRate?: number | undefined;
        };
        generatedAt: Date;
        analysisType: "creator_performance" | "template_attribution" | "revenue_distribution" | "collaboration_patterns";
        periodStart: Date;
        periodEnd: Date;
        insights?: {
            description: string;
            type: "alert" | "recommendation" | "anomaly" | "trend";
            title: string;
            confidence: number;
            metadata?: Record<string, unknown> | undefined;
            actionable?: boolean | undefined;
        }[] | undefined;
        templateId?: string | undefined;
        creatorId?: string | undefined;
        breakdown?: Record<string, unknown> | undefined;
    } | undefined;
}>;
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