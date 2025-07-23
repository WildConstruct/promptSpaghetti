/**
 * Epic 16 Content Data Model
 *
 * Comprehensive data models for Epic 16 marketplace and community content
 * including templates, versions, purchases, reviews, forum posts, and analytics.
 */
import { z } from 'zod';
export declare enum TemplateStatus {
    DRAFT = "draft",
    LISTED = "listed",
    BLOCKED = "blocked",
    ARCHIVED = "archived",
    UNDER_REVIEW = "under_review",
    REJECTED = "rejected"
}
export declare enum PurchaseStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    DISPUTED = "disputed",
    CANCELLED = "cancelled"
}
export declare enum RefundReason {
    NOT_AS_DESCRIBED = "not_as_described",
    CLAUDE_INCOMPATIBLE = "claude_incompat",
    CLAUDE_HALLUCINATION = "claude_hallucination",
    TECHNICAL_ISSUE = "technical_issue",
    DUPLICATE_PURCHASE = "duplicate_purchase",
    OTHER = "other"
}
export declare enum ContentType {
    TEMPLATE = "template",
    TUTORIAL = "tutorial",
    CASE_STUDY = "case_study",
    KNOWLEDGE_ARTICLE = "knowledge_article",
    COMMUNITY_POST = "community_post",
    DOCUMENTATION = "documentation"
}
export declare enum UserRole {
    BUYER = "buyer",
    CREATOR = "creator",
    ADMIN = "admin",
    MODERATOR = "moderator",
    REVIEWER = "reviewer"
}
export declare enum ForumPostType {
    DISCUSSION = "discussion",
    QUESTION = "question",
    ANNOUNCEMENT = "announcement",
    TUTORIAL = "tutorial",
    SHOWCASE = "showcase",
    FEEDBACK = "feedback"
}
export declare enum PostStatus {
    ACTIVE = "active",
    HIDDEN = "hidden",
    DELETED = "deleted",
    PENDING_MODERATION = "pending_moderation",
    LOCKED = "locked"
}
export declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    displayName: z.ZodString;
    bio: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    socialLinks: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    isCreator: z.ZodDefault<z.ZodBoolean>;
    creatorTier: z.ZodOptional<z.ZodEnum<["starter", "pro", "expert"]>>;
    verifiedCreator: z.ZodDefault<z.ZodBoolean>;
    templatesCreated: z.ZodDefault<z.ZodNumber>;
    totalSales: z.ZodDefault<z.ZodNumber>;
    averageRating: z.ZodOptional<z.ZodNumber>;
    totalReviews: z.ZodDefault<z.ZodNumber>;
    forumPosts: z.ZodDefault<z.ZodNumber>;
    helpfulVotes: z.ZodDefault<z.ZodNumber>;
    reputation: z.ZodDefault<z.ZodNumber>;
    badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodOptional<z.ZodObject<{
        emailNotifications: z.ZodDefault<z.ZodBoolean>;
        marketingEmails: z.ZodDefault<z.ZodBoolean>;
        publicProfile: z.ZodDefault<z.ZodBoolean>;
        showPurchases: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        emailNotifications: boolean;
        marketingEmails: boolean;
        publicProfile: boolean;
        showPurchases: boolean;
    }, {
        emailNotifications?: boolean | undefined;
        marketingEmails?: boolean | undefined;
        publicProfile?: boolean | undefined;
        showPurchases?: boolean | undefined;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastActive: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    displayName: string;
    templatesCreated: number;
    helpfulVotes: number;
    badges: string[];
    isCreator: boolean;
    forumPosts: number;
    verifiedCreator: boolean;
    totalSales: number;
    totalReviews: number;
    reputation: number;
    location?: string | undefined;
    averageRating?: number | undefined;
    preferences?: {
        emailNotifications: boolean;
        marketingEmails: boolean;
        publicProfile: boolean;
        showPurchases: boolean;
    } | undefined;
    website?: string | undefined;
    avatar?: string | undefined;
    bio?: string | undefined;
    socialLinks?: Record<string, string> | undefined;
    creatorTier?: "expert" | "pro" | "starter" | undefined;
    lastActive?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    displayName: string;
    location?: string | undefined;
    averageRating?: number | undefined;
    preferences?: {
        emailNotifications?: boolean | undefined;
        marketingEmails?: boolean | undefined;
        publicProfile?: boolean | undefined;
        showPurchases?: boolean | undefined;
    } | undefined;
    website?: string | undefined;
    templatesCreated?: number | undefined;
    avatar?: string | undefined;
    helpfulVotes?: number | undefined;
    bio?: string | undefined;
    badges?: string[] | undefined;
    isCreator?: boolean | undefined;
    forumPosts?: number | undefined;
    socialLinks?: Record<string, string> | undefined;
    creatorTier?: "expert" | "pro" | "starter" | undefined;
    verifiedCreator?: boolean | undefined;
    totalSales?: number | undefined;
    totalReviews?: number | undefined;
    reputation?: number | undefined;
    lastActive?: Date | undefined;
}>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export declare const TemplateSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    shortDescription: z.ZodOptional<z.ZodString>;
    tags: z.ZodArray<z.ZodString, "many">;
    category: z.ZodString;
    subcategory: z.ZodOptional<z.ZodString>;
    priceCents: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    claudeCompatibility: z.ZodArray<z.ZodString, "many">;
    isAiGenerated: z.ZodDefault<z.ZodBoolean>;
    complexity: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    estimatedTokens: z.ZodOptional<z.ZodNumber>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    previewImages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    demoVideo: z.ZodOptional<z.ZodString>;
    status: z.ZodNativeEnum<typeof TemplateStatus>;
    featured: z.ZodDefault<z.ZodBoolean>;
    promoted: z.ZodDefault<z.ZodBoolean>;
    stats: z.ZodObject<{
        views: z.ZodDefault<z.ZodNumber>;
        downloads: z.ZodDefault<z.ZodNumber>;
        purchases: z.ZodDefault<z.ZodNumber>;
        likes: z.ZodDefault<z.ZodNumber>;
        forks: z.ZodDefault<z.ZodNumber>;
        avgRating: z.ZodOptional<z.ZodNumber>;
        ratingCount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        downloads: number;
        views: number;
        likes: number;
        purchases: number;
        forks: number;
        ratingCount: number;
        avgRating?: number | undefined;
    }, {
        downloads?: number | undefined;
        views?: number | undefined;
        likes?: number | undefined;
        avgRating?: number | undefined;
        purchases?: number | undefined;
        forks?: number | undefined;
        ratingCount?: number | undefined;
    }>;
    seoKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metaDescription: z.ZodOptional<z.ZodString>;
    currentVersionId: z.ZodOptional<z.ZodString>;
    versionCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    publishedAt: z.ZodOptional<z.ZodDate>;
    featuredAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    status: TemplateStatus;
    category: string;
    tags: string[];
    complexity: "advanced" | "intermediate" | "beginner";
    title: string;
    featured: boolean;
    stats: {
        downloads: number;
        views: number;
        likes: number;
        purchases: number;
        forks: number;
        ratingCount: number;
        avgRating?: number | undefined;
    };
    currency: string;
    isAiGenerated: boolean;
    ownerId: string;
    priceCents: number;
    claudeCompatibility: string[];
    previewImages: string[];
    promoted: boolean;
    seoKeywords: string[];
    versionCount: number;
    publishedAt?: Date | undefined;
    subcategory?: string | undefined;
    thumbnailUrl?: string | undefined;
    featuredAt?: Date | undefined;
    metaDescription?: string | undefined;
    currentVersionId?: string | undefined;
    shortDescription?: string | undefined;
    estimatedTokens?: number | undefined;
    demoVideo?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    status: TemplateStatus;
    category: string;
    tags: string[];
    complexity: "advanced" | "intermediate" | "beginner";
    title: string;
    stats: {
        downloads?: number | undefined;
        views?: number | undefined;
        likes?: number | undefined;
        avgRating?: number | undefined;
        purchases?: number | undefined;
        forks?: number | undefined;
        ratingCount?: number | undefined;
    };
    ownerId: string;
    priceCents: number;
    claudeCompatibility: string[];
    featured?: boolean | undefined;
    currency?: string | undefined;
    isAiGenerated?: boolean | undefined;
    publishedAt?: Date | undefined;
    subcategory?: string | undefined;
    thumbnailUrl?: string | undefined;
    featuredAt?: Date | undefined;
    metaDescription?: string | undefined;
    currentVersionId?: string | undefined;
    shortDescription?: string | undefined;
    estimatedTokens?: number | undefined;
    previewImages?: string[] | undefined;
    demoVideo?: string | undefined;
    promoted?: boolean | undefined;
    seoKeywords?: string[] | undefined;
    versionCount?: number | undefined;
}>;
export type Template = z.infer<typeof TemplateSchema>;
export declare const TemplateVersionSchema: z.ZodObject<{
    id: z.ZodString;
    templateId: z.ZodString;
    versionNumber: z.ZodString;
    versionName: z.ZodOptional<z.ZodString>;
    claudeModel: z.ZodString;
    graphJson: z.ZodString;
    promptYaml: z.ZodOptional<z.ZodString>;
    changelog: z.ZodOptional<z.ZodString>;
    documentation: z.ZodOptional<z.ZodString>;
    examples: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        input: z.ZodString;
        expectedOutput: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        input: string;
        title: string;
        expectedOutput: string;
    }, {
        input: string;
        title: string;
        expectedOutput: string;
    }>, "many">>;
    hash: z.ZodString;
    tokenPerRunEstimate: z.ZodNumber;
    safetyScore: z.ZodNumber;
    testResults: z.ZodOptional<z.ZodObject<{
        passed: z.ZodNumber;
        failed: z.ZodNumber;
        coverage: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        failed: number;
        passed: number;
        coverage?: number | undefined;
    }, {
        failed: number;
        passed: number;
        coverage?: number | undefined;
    }>>;
    avgExecutionTime: z.ZodOptional<z.ZodNumber>;
    successRate: z.ZodOptional<z.ZodNumber>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    releaseNotes: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        size: z.ZodNumber;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: string;
        url: string;
        size: number;
    }, {
        name: string;
        type: string;
        url: string;
        size: number;
    }>, "many">>;
    createdAt: z.ZodDate;
    publishedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    examples: {
        input: string;
        title: string;
        expectedOutput: string;
    }[];
    assets: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[];
    isPublic: boolean;
    hash: string;
    templateId: string;
    safetyScore: number;
    graphJson: string;
    claudeModel: string;
    versionNumber: string;
    tokenPerRunEstimate: number;
    successRate?: number | undefined;
    documentation?: string | undefined;
    changelog?: string | undefined;
    testResults?: {
        failed: number;
        passed: number;
        coverage?: number | undefined;
    } | undefined;
    publishedAt?: Date | undefined;
    promptYaml?: string | undefined;
    versionName?: string | undefined;
    avgExecutionTime?: number | undefined;
    releaseNotes?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    hash: string;
    templateId: string;
    safetyScore: number;
    graphJson: string;
    claudeModel: string;
    versionNumber: string;
    tokenPerRunEstimate: number;
    successRate?: number | undefined;
    examples?: {
        input: string;
        title: string;
        expectedOutput: string;
    }[] | undefined;
    documentation?: string | undefined;
    assets?: {
        name: string;
        type: string;
        url: string;
        size: number;
    }[] | undefined;
    changelog?: string | undefined;
    isPublic?: boolean | undefined;
    testResults?: {
        failed: number;
        passed: number;
        coverage?: number | undefined;
    } | undefined;
    publishedAt?: Date | undefined;
    promptYaml?: string | undefined;
    versionName?: string | undefined;
    avgExecutionTime?: number | undefined;
    releaseNotes?: string | undefined;
}>;
export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;
export declare const PurchaseSchema: z.ZodObject<{
    id: z.ZodString;
    buyerId: z.ZodString;
    templateId: z.ZodString;
    versionId: z.ZodString;
    stripePaymentIntentId: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    status: z.ZodNativeEnum<typeof PurchaseStatus>;
    refundReason: z.ZodOptional<z.ZodNativeEnum<typeof RefundReason>>;
    refundAmount: z.ZodOptional<z.ZodNumber>;
    transactionId: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodOptional<z.ZodString>;
    licenseType: z.ZodDefault<z.ZodEnum<["personal", "commercial", "enterprise"]>>;
    licenseTerms: z.ZodOptional<z.ZodString>;
    downloadCount: z.ZodDefault<z.ZodNumber>;
    lastDownloaded: z.ZodOptional<z.ZodDate>;
    supportTicketId: z.ZodOptional<z.ZodString>;
    satisfactionRating: z.ZodOptional<z.ZodNumber>;
    satisfactionFeedback: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    completedAt: z.ZodOptional<z.ZodDate>;
    refundedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    status: PurchaseStatus;
    amount: number;
    templateId: string;
    currency: string;
    buyerId: string;
    licenseType: "personal" | "enterprise" | "commercial";
    versionId: string;
    downloadCount: number;
    completedAt?: Date | undefined;
    transactionId?: string | undefined;
    paymentMethod?: string | undefined;
    stripePaymentIntentId?: string | undefined;
    refundReason?: RefundReason | undefined;
    refundAmount?: number | undefined;
    licenseTerms?: string | undefined;
    lastDownloaded?: Date | undefined;
    supportTicketId?: string | undefined;
    satisfactionRating?: number | undefined;
    satisfactionFeedback?: string | undefined;
    refundedAt?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    status: PurchaseStatus;
    amount: number;
    templateId: string;
    buyerId: string;
    versionId: string;
    completedAt?: Date | undefined;
    currency?: string | undefined;
    transactionId?: string | undefined;
    paymentMethod?: string | undefined;
    licenseType?: "personal" | "enterprise" | "commercial" | undefined;
    stripePaymentIntentId?: string | undefined;
    refundReason?: RefundReason | undefined;
    refundAmount?: number | undefined;
    licenseTerms?: string | undefined;
    downloadCount?: number | undefined;
    lastDownloaded?: Date | undefined;
    supportTicketId?: string | undefined;
    satisfactionRating?: number | undefined;
    satisfactionFeedback?: string | undefined;
    refundedAt?: Date | undefined;
}>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export declare const ReviewSchema: z.ZodObject<{
    id: z.ZodString;
    templateId: z.ZodString;
    buyerId: z.ZodString;
    purchaseId: z.ZodOptional<z.ZodString>;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    comment: z.ZodString;
    aspects: z.ZodOptional<z.ZodObject<{
        easeOfUse: z.ZodOptional<z.ZodNumber>;
        documentation: z.ZodOptional<z.ZodNumber>;
        valueForMoney: z.ZodOptional<z.ZodNumber>;
        performance: z.ZodOptional<z.ZodNumber>;
        support: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        performance?: number | undefined;
        documentation?: number | undefined;
        easeOfUse?: number | undefined;
        support?: number | undefined;
        valueForMoney?: number | undefined;
    }, {
        performance?: number | undefined;
        documentation?: number | undefined;
        easeOfUse?: number | undefined;
        support?: number | undefined;
        valueForMoney?: number | undefined;
    }>>;
    sentimentAi: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative"]>>;
    helpfulnessScore: z.ZodOptional<z.ZodNumber>;
    verifiedPurchase: z.ZodDefault<z.ZodBoolean>;
    helpfulVotes: z.ZodDefault<z.ZodNumber>;
    unhelpfulVotes: z.ZodDefault<z.ZodNumber>;
    creatorResponse: z.ZodOptional<z.ZodString>;
    creatorResponseAt: z.ZodOptional<z.ZodDate>;
    flagged: z.ZodDefault<z.ZodBoolean>;
    flagReason: z.ZodOptional<z.ZodString>;
    moderatedBy: z.ZodOptional<z.ZodString>;
    moderatedAt: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    comment: string;
    templateId: string;
    buyerId: string;
    flagged: boolean;
    helpfulVotes: number;
    verifiedPurchase: boolean;
    unhelpfulVotes: number;
    title?: string | undefined;
    purchaseId?: string | undefined;
    aspects?: {
        performance?: number | undefined;
        documentation?: number | undefined;
        easeOfUse?: number | undefined;
        support?: number | undefined;
        valueForMoney?: number | undefined;
    } | undefined;
    sentimentAi?: "positive" | "neutral" | "negative" | undefined;
    helpfulnessScore?: number | undefined;
    creatorResponse?: string | undefined;
    creatorResponseAt?: Date | undefined;
    flagReason?: string | undefined;
    moderatedBy?: string | undefined;
    moderatedAt?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    comment: string;
    templateId: string;
    buyerId: string;
    title?: string | undefined;
    flagged?: boolean | undefined;
    helpfulVotes?: number | undefined;
    purchaseId?: string | undefined;
    aspects?: {
        performance?: number | undefined;
        documentation?: number | undefined;
        easeOfUse?: number | undefined;
        support?: number | undefined;
        valueForMoney?: number | undefined;
    } | undefined;
    sentimentAi?: "positive" | "neutral" | "negative" | undefined;
    helpfulnessScore?: number | undefined;
    verifiedPurchase?: boolean | undefined;
    unhelpfulVotes?: number | undefined;
    creatorResponse?: string | undefined;
    creatorResponseAt?: Date | undefined;
    flagReason?: string | undefined;
    moderatedBy?: string | undefined;
    moderatedAt?: Date | undefined;
}>;
export type Review = z.infer<typeof ReviewSchema>;
export declare const ForumPostSchema: z.ZodObject<{
    id: z.ZodString;
    authorId: z.ZodString;
    type: z.ZodNativeEnum<typeof ForumPostType>;
    title: z.ZodString;
    content: z.ZodString;
    contentHtml: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    tags: z.ZodArray<z.ZodString, "many">;
    isPinned: z.ZodDefault<z.ZodBoolean>;
    isLocked: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    allowComments: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodNativeEnum<typeof PostStatus>;
    moderationReason: z.ZodOptional<z.ZodString>;
    moderatedBy: z.ZodOptional<z.ZodString>;
    moderatedAt: z.ZodOptional<z.ZodDate>;
    views: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    dislikes: z.ZodDefault<z.ZodNumber>;
    replies: z.ZodDefault<z.ZodNumber>;
    bookmarks: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    slug: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    relatedTemplateIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    relatedPostIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        url: string;
        size: number;
        mimeType: string;
    }, {
        id: string;
        name: string;
        url: string;
        size: number;
        mimeType: string;
    }>, "many">>;
    parentId: z.ZodOptional<z.ZodString>;
    threadId: z.ZodOptional<z.ZodString>;
    replyCount: z.ZodDefault<z.ZodNumber>;
    lastReplyAt: z.ZodOptional<z.ZodDate>;
    lastReplyBy: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastActivity: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: PostStatus;
    type: ForumPostType;
    category: string;
    tags: string[];
    title: string;
    content: string;
    isLocked: boolean;
    attachments: {
        id: string;
        name: string;
        url: string;
        size: number;
        mimeType: string;
    }[];
    slug: string;
    views: number;
    likes: number;
    shares: number;
    bookmarks: number;
    allowComments: boolean;
    authorId: string;
    isPinned: boolean;
    replies: number;
    lastActivity: Date;
    isFeatured: boolean;
    dislikes: number;
    relatedTemplateIds: string[];
    relatedPostIds: string[];
    replyCount: number;
    parentId?: string | undefined;
    threadId?: string | undefined;
    excerpt?: string | undefined;
    moderatedBy?: string | undefined;
    moderatedAt?: Date | undefined;
    contentHtml?: string | undefined;
    moderationReason?: string | undefined;
    lastReplyAt?: Date | undefined;
    lastReplyBy?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: PostStatus;
    type: ForumPostType;
    category: string;
    tags: string[];
    title: string;
    content: string;
    slug: string;
    authorId: string;
    lastActivity: Date;
    parentId?: string | undefined;
    isLocked?: boolean | undefined;
    threadId?: string | undefined;
    attachments?: {
        id: string;
        name: string;
        url: string;
        size: number;
        mimeType: string;
    }[] | undefined;
    excerpt?: string | undefined;
    views?: number | undefined;
    likes?: number | undefined;
    shares?: number | undefined;
    bookmarks?: number | undefined;
    allowComments?: boolean | undefined;
    isPinned?: boolean | undefined;
    replies?: number | undefined;
    moderatedBy?: string | undefined;
    moderatedAt?: Date | undefined;
    contentHtml?: string | undefined;
    isFeatured?: boolean | undefined;
    moderationReason?: string | undefined;
    dislikes?: number | undefined;
    relatedTemplateIds?: string[] | undefined;
    relatedPostIds?: string[] | undefined;
    replyCount?: number | undefined;
    lastReplyAt?: Date | undefined;
    lastReplyBy?: string | undefined;
}>;
export type ForumPost = z.infer<typeof ForumPostSchema>;
export declare const KnowledgeArticleSchema: z.ZodObject<{
    id: z.ZodString;
    authorId: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    contentHtml: z.ZodOptional<z.ZodString>;
    excerpt: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    subcategory: z.ZodOptional<z.ZodString>;
    tags: z.ZodArray<z.ZodString, "many">;
    difficulty: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    tableOfContents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        level: z.ZodNumber;
        anchor: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        anchor: string;
        id: string;
        title: string;
        level: number;
    }, {
        anchor: string;
        id: string;
        title: string;
        level: number;
    }>, "many">>;
    slug: z.ZodString;
    metaDescription: z.ZodOptional<z.ZodString>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodEnum<["draft", "published", "archived", "under_review"]>;
    featured: z.ZodDefault<z.ZodBoolean>;
    version: z.ZodDefault<z.ZodString>;
    previousVersionId: z.ZodOptional<z.ZodString>;
    views: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    bookmarks: z.ZodDefault<z.ZodNumber>;
    helpfulVotes: z.ZodDefault<z.ZodNumber>;
    relatedArticleIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    relatedTemplateIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    publishedAt: z.ZodOptional<z.ZodDate>;
    lastReviewed: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "draft" | "published" | "archived" | "under_review";
    category: string;
    tags: string[];
    version: string;
    title: string;
    content: string;
    keywords: string[];
    featured: boolean;
    difficulty: "advanced" | "intermediate" | "beginner";
    slug: string;
    views: number;
    likes: number;
    bookmarks: number;
    helpfulVotes: number;
    authorId: string;
    relatedTemplateIds: string[];
    relatedArticleIds: string[];
    publishedAt?: Date | undefined;
    excerpt?: string | undefined;
    subcategory?: string | undefined;
    metaDescription?: string | undefined;
    contentHtml?: string | undefined;
    tableOfContents?: {
        anchor: string;
        id: string;
        title: string;
        level: number;
    }[] | undefined;
    previousVersionId?: string | undefined;
    lastReviewed?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: "draft" | "published" | "archived" | "under_review";
    category: string;
    tags: string[];
    title: string;
    content: string;
    difficulty: "advanced" | "intermediate" | "beginner";
    slug: string;
    authorId: string;
    version?: string | undefined;
    keywords?: string[] | undefined;
    featured?: boolean | undefined;
    publishedAt?: Date | undefined;
    excerpt?: string | undefined;
    views?: number | undefined;
    subcategory?: string | undefined;
    likes?: number | undefined;
    bookmarks?: number | undefined;
    helpfulVotes?: number | undefined;
    metaDescription?: string | undefined;
    contentHtml?: string | undefined;
    relatedTemplateIds?: string[] | undefined;
    tableOfContents?: {
        anchor: string;
        id: string;
        title: string;
        level: number;
    }[] | undefined;
    previousVersionId?: string | undefined;
    relatedArticleIds?: string[] | undefined;
    lastReviewed?: Date | undefined;
}>;
export type KnowledgeArticle = z.infer<typeof KnowledgeArticleSchema>;
export declare const TutorialSchema: z.ZodObject<{
    id: z.ZodString;
    authorId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    shortDescription: z.ZodOptional<z.ZodString>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        order: z.ZodNumber;
        estimatedDuration: z.ZodOptional<z.ZodNumber>;
        resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            type: z.ZodEnum<["video", "article", "template", "download", "external"]>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            type: "external" | "template" | "article" | "video" | "download";
            url: string;
        }, {
            name: string;
            type: "external" | "template" | "article" | "video" | "download";
            url: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        content: string;
        resources: {
            name: string;
            type: "external" | "template" | "article" | "video" | "download";
            url: string;
        }[];
        order: number;
        estimatedDuration?: number | undefined;
    }, {
        id: string;
        title: string;
        content: string;
        order: number;
        resources?: {
            name: string;
            type: "external" | "template" | "article" | "video" | "download";
            url: string;
        }[] | undefined;
        estimatedDuration?: number | undefined;
    }>, "many">;
    category: z.ZodString;
    difficulty: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    estimatedDuration: z.ZodNumber;
    prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    learningOutcomes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    videoUrl: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        url: string;
        description?: string | undefined;
    }, {
        name: string;
        url: string;
        description?: string | undefined;
    }>, "many">>;
    hasQuiz: z.ZodDefault<z.ZodBoolean>;
    hasExercises: z.ZodDefault<z.ZodBoolean>;
    hasCertificate: z.ZodDefault<z.ZodBoolean>;
    status: z.ZodEnum<["draft", "published", "archived"]>;
    featured: z.ZodDefault<z.ZodBoolean>;
    views: z.ZodDefault<z.ZodNumber>;
    completions: z.ZodDefault<z.ZodNumber>;
    averageRating: z.ZodOptional<z.ZodNumber>;
    ratingCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    publishedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    status: "draft" | "published" | "archived";
    category: string;
    title: string;
    assets: {
        name: string;
        url: string;
        description?: string | undefined;
    }[];
    featured: boolean;
    prerequisites: string[];
    steps: {
        id: string;
        title: string;
        content: string;
        resources: {
            name: string;
            type: "external" | "template" | "article" | "video" | "download";
            url: string;
        }[];
        order: number;
        estimatedDuration?: number | undefined;
    }[];
    difficulty: "advanced" | "intermediate" | "beginner";
    views: number;
    authorId: string;
    estimatedDuration: number;
    ratingCount: number;
    learningOutcomes: string[];
    hasQuiz: boolean;
    hasExercises: boolean;
    hasCertificate: boolean;
    completions: number;
    averageRating?: number | undefined;
    publishedAt?: Date | undefined;
    videoUrl?: string | undefined;
    thumbnailUrl?: string | undefined;
    shortDescription?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    status: "draft" | "published" | "archived";
    category: string;
    title: string;
    steps: {
        id: string;
        title: string;
        content: string;
        order: number;
        resources?: {
            name: string;
            type: "external" | "template" | "article" | "video" | "download";
            url: string;
        }[] | undefined;
        estimatedDuration?: number | undefined;
    }[];
    difficulty: "advanced" | "intermediate" | "beginner";
    authorId: string;
    estimatedDuration: number;
    assets?: {
        name: string;
        url: string;
        description?: string | undefined;
    }[] | undefined;
    featured?: boolean | undefined;
    averageRating?: number | undefined;
    prerequisites?: string[] | undefined;
    publishedAt?: Date | undefined;
    videoUrl?: string | undefined;
    views?: number | undefined;
    thumbnailUrl?: string | undefined;
    shortDescription?: string | undefined;
    ratingCount?: number | undefined;
    learningOutcomes?: string[] | undefined;
    hasQuiz?: boolean | undefined;
    hasExercises?: boolean | undefined;
    hasCertificate?: boolean | undefined;
    completions?: number | undefined;
}>;
export type Tutorial = z.infer<typeof TutorialSchema>;
export declare const UserAnalyticsSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    date: z.ZodDate;
    sessionsCount: z.ZodDefault<z.ZodNumber>;
    totalDuration: z.ZodDefault<z.ZodNumber>;
    pageViews: z.ZodDefault<z.ZodNumber>;
    templatesViewed: z.ZodDefault<z.ZodNumber>;
    templatesLiked: z.ZodDefault<z.ZodNumber>;
    templatesPurchased: z.ZodDefault<z.ZodNumber>;
    templatesDownloaded: z.ZodDefault<z.ZodNumber>;
    postsCreated: z.ZodDefault<z.ZodNumber>;
    postsViewed: z.ZodDefault<z.ZodNumber>;
    commentsPosted: z.ZodDefault<z.ZodNumber>;
    votesGiven: z.ZodDefault<z.ZodNumber>;
    tutorialsStarted: z.ZodDefault<z.ZodNumber>;
    tutorialsCompleted: z.ZodDefault<z.ZodNumber>;
    articlesRead: z.ZodDefault<z.ZodNumber>;
    templatesCreated: z.ZodDefault<z.ZodNumber>;
    templatesUpdated: z.ZodDefault<z.ZodNumber>;
    salesGenerated: z.ZodDefault<z.ZodNumber>;
    reviewsReceived: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: Date;
    userId: string;
    templatesViewed: number;
    templatesDownloaded: number;
    templatesPurchased: number;
    templatesCreated: number;
    tutorialsCompleted: number;
    sessionsCount: number;
    totalDuration: number;
    pageViews: number;
    templatesLiked: number;
    postsCreated: number;
    postsViewed: number;
    commentsPosted: number;
    votesGiven: number;
    tutorialsStarted: number;
    articlesRead: number;
    templatesUpdated: number;
    salesGenerated: number;
    reviewsReceived: number;
}, {
    id: string;
    date: Date;
    userId: string;
    templatesViewed?: number | undefined;
    templatesDownloaded?: number | undefined;
    templatesPurchased?: number | undefined;
    templatesCreated?: number | undefined;
    tutorialsCompleted?: number | undefined;
    sessionsCount?: number | undefined;
    totalDuration?: number | undefined;
    pageViews?: number | undefined;
    templatesLiked?: number | undefined;
    postsCreated?: number | undefined;
    postsViewed?: number | undefined;
    commentsPosted?: number | undefined;
    votesGiven?: number | undefined;
    tutorialsStarted?: number | undefined;
    articlesRead?: number | undefined;
    templatesUpdated?: number | undefined;
    salesGenerated?: number | undefined;
    reviewsReceived?: number | undefined;
}>;
export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;
export declare const ContentAnalyticsSchema: z.ZodObject<{
    id: z.ZodString;
    contentId: z.ZodString;
    contentType: z.ZodNativeEnum<typeof ContentType>;
    date: z.ZodDate;
    views: z.ZodDefault<z.ZodNumber>;
    uniqueViews: z.ZodDefault<z.ZodNumber>;
    averageViewDuration: z.ZodDefault<z.ZodNumber>;
    bounceRate: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    dislikes: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    bookmarks: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    previews: z.ZodDefault<z.ZodNumber>;
    purchases: z.ZodDefault<z.ZodNumber>;
    conversionRate: z.ZodDefault<z.ZodNumber>;
    topCountries: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    topCities: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    deviceTypes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    referralSources: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    searchKeywords: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    date: Date;
    comments: number;
    contentType: ContentType;
    views: number;
    previews: number;
    likes: number;
    shares: number;
    bookmarks: number;
    contentId: string;
    conversionRate: number;
    purchases: number;
    dislikes: number;
    uniqueViews: number;
    averageViewDuration: number;
    bounceRate: number;
    topCountries?: Record<string, number> | undefined;
    topCities?: Record<string, number> | undefined;
    deviceTypes?: Record<string, number> | undefined;
    referralSources?: Record<string, number> | undefined;
    searchKeywords?: Record<string, number> | undefined;
}, {
    id: string;
    date: Date;
    contentType: ContentType;
    contentId: string;
    comments?: number | undefined;
    views?: number | undefined;
    previews?: number | undefined;
    likes?: number | undefined;
    shares?: number | undefined;
    bookmarks?: number | undefined;
    conversionRate?: number | undefined;
    purchases?: number | undefined;
    dislikes?: number | undefined;
    uniqueViews?: number | undefined;
    averageViewDuration?: number | undefined;
    bounceRate?: number | undefined;
    topCountries?: Record<string, number> | undefined;
    topCities?: Record<string, number> | undefined;
    deviceTypes?: Record<string, number> | undefined;
    referralSources?: Record<string, number> | undefined;
    searchKeywords?: Record<string, number> | undefined;
}>;
export type ContentAnalytics = z.infer<typeof ContentAnalyticsSchema>;
export declare const SearchQuerySchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    query: z.ZodString;
    normalizedQuery: z.ZodString;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    resultsCount: z.ZodNumber;
    clickedResults: z.ZodDefault<z.ZodArray<z.ZodObject<{
        contentId: z.ZodString;
        contentType: z.ZodNativeEnum<typeof ContentType>;
        position: z.ZodNumber;
        clickedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        position: number;
        contentType: ContentType;
        contentId: string;
        clickedAt: Date;
    }, {
        position: number;
        contentType: ContentType;
        contentId: string;
        clickedAt: Date;
    }>, "many">>;
    sessionId: z.ZodOptional<z.ZodString>;
    referrer: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    responseTime: z.ZodOptional<z.ZodNumber>;
    source: z.ZodDefault<z.ZodEnum<["web", "mobile", "api"]>>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    source: "web" | "api" | "mobile";
    query: string;
    normalizedQuery: string;
    resultsCount: number;
    clickedResults: {
        position: number;
        contentType: ContentType;
        contentId: string;
        clickedAt: Date;
    }[];
    userId?: string | undefined;
    sessionId?: string | undefined;
    filters?: Record<string, any> | undefined;
    userAgent?: string | undefined;
    referrer?: string | undefined;
    responseTime?: number | undefined;
}, {
    id: string;
    createdAt: Date;
    query: string;
    normalizedQuery: string;
    resultsCount: number;
    userId?: string | undefined;
    source?: "web" | "api" | "mobile" | undefined;
    sessionId?: string | undefined;
    filters?: Record<string, any> | undefined;
    userAgent?: string | undefined;
    referrer?: string | undefined;
    responseTime?: number | undefined;
    clickedResults?: {
        position: number;
        contentType: ContentType;
        contentId: string;
        clickedAt: Date;
    }[] | undefined;
}>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export declare const CollectionSchema: z.ZodObject<{
    id: z.ZodString;
    ownerId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    allowCollaborators: z.ZodDefault<z.ZodBoolean>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        contentId: z.ZodString;
        contentType: z.ZodNativeEnum<typeof ContentType>;
        addedAt: z.ZodDate;
        order: z.ZodNumber;
        note: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        order: number;
        contentType: ContentType;
        contentId: string;
        addedAt: Date;
        note?: string | undefined;
    }, {
        order: number;
        contentType: ContentType;
        contentId: string;
        addedAt: Date;
        note?: string | undefined;
    }>, "many">>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodEnum<["viewer", "editor", "admin"]>;
        addedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        role: "admin" | "editor" | "viewer";
        addedAt: Date;
    }, {
        userId: string;
        role: "admin" | "editor" | "viewer";
        addedAt: Date;
    }>, "many">>;
    followers: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    views: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    tags: string[];
    items: {
        order: number;
        contentType: ContentType;
        contentId: string;
        addedAt: Date;
        note?: string | undefined;
    }[];
    isPublic: boolean;
    collaborators: {
        userId: string;
        role: "admin" | "editor" | "viewer";
        addedAt: Date;
    }[];
    views: number;
    likes: number;
    ownerId: string;
    isFeatured: boolean;
    allowCollaborators: boolean;
    followers: number;
    description?: string | undefined;
    category?: string | undefined;
    thumbnailUrl?: string | undefined;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    ownerId: string;
    description?: string | undefined;
    category?: string | undefined;
    tags?: string[] | undefined;
    items?: {
        order: number;
        contentType: ContentType;
        contentId: string;
        addedAt: Date;
        note?: string | undefined;
    }[] | undefined;
    isPublic?: boolean | undefined;
    collaborators?: {
        userId: string;
        role: "admin" | "editor" | "viewer";
        addedAt: Date;
    }[] | undefined;
    views?: number | undefined;
    thumbnailUrl?: string | undefined;
    likes?: number | undefined;
    isFeatured?: boolean | undefined;
    allowCollaborators?: boolean | undefined;
    followers?: number | undefined;
}>;
export type Collection = z.infer<typeof CollectionSchema>;
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<["template_published", "template_purchased", "template_reviewed", "post_replied", "post_liked", "comment_replied", "follower_added", "collection_shared", "system_announcement", "moderation_action"]>;
    title: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    actionUrl: z.ZodOptional<z.ZodString>;
    read: z.ZodDefault<z.ZodBoolean>;
    readAt: z.ZodOptional<z.ZodDate>;
    channels: z.ZodDefault<z.ZodArray<z.ZodEnum<["in_app", "email", "push", "sms"]>, "many">>;
    deliveryStatus: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<["pending", "sent", "delivered", "failed"]>>>;
    priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
    scheduledFor: z.ZodOptional<z.ZodDate>;
    createdAt: z.ZodDate;
    sentAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    priority: "low" | "high" | "normal" | "urgent";
    message: string;
    type: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
    userId: string;
    title: string;
    read: boolean;
    channels: ("push" | "email" | "sms" | "in_app")[];
    data?: Record<string, any> | undefined;
    sentAt?: Date | undefined;
    readAt?: Date | undefined;
    actionUrl?: string | undefined;
    deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered"> | undefined;
    scheduledFor?: Date | undefined;
}, {
    id: string;
    createdAt: Date;
    message: string;
    type: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
    userId: string;
    title: string;
    priority?: "low" | "high" | "normal" | "urgent" | undefined;
    data?: Record<string, any> | undefined;
    read?: boolean | undefined;
    channels?: ("push" | "email" | "sms" | "in_app")[] | undefined;
    sentAt?: Date | undefined;
    readAt?: Date | undefined;
    actionUrl?: string | undefined;
    deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered"> | undefined;
    scheduledFor?: Date | undefined;
}>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Epic16ContentModel = {
    UserProfile: UserProfile;
    Template: Template;
    TemplateVersion: TemplateVersion;
    Purchase: Purchase;
    Review: Review;
    ForumPost: ForumPost;
    KnowledgeArticle: KnowledgeArticle;
    Tutorial: Tutorial;
    UserAnalytics: UserAnalytics;
    ContentAnalytics: ContentAnalytics;
    SearchQuery: SearchQuery;
    Collection: Collection;
    Notification: Notification;
};
export declare const Epic16ContentSchemas: {
    UserProfile: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        displayName: z.ZodString;
        bio: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        socialLinks: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        isCreator: z.ZodDefault<z.ZodBoolean>;
        creatorTier: z.ZodOptional<z.ZodEnum<["starter", "pro", "expert"]>>;
        verifiedCreator: z.ZodDefault<z.ZodBoolean>;
        templatesCreated: z.ZodDefault<z.ZodNumber>;
        totalSales: z.ZodDefault<z.ZodNumber>;
        averageRating: z.ZodOptional<z.ZodNumber>;
        totalReviews: z.ZodDefault<z.ZodNumber>;
        forumPosts: z.ZodDefault<z.ZodNumber>;
        helpfulVotes: z.ZodDefault<z.ZodNumber>;
        reputation: z.ZodDefault<z.ZodNumber>;
        badges: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        preferences: z.ZodOptional<z.ZodObject<{
            emailNotifications: z.ZodDefault<z.ZodBoolean>;
            marketingEmails: z.ZodDefault<z.ZodBoolean>;
            publicProfile: z.ZodDefault<z.ZodBoolean>;
            showPurchases: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            emailNotifications: boolean;
            marketingEmails: boolean;
            publicProfile: boolean;
            showPurchases: boolean;
        }, {
            emailNotifications?: boolean | undefined;
            marketingEmails?: boolean | undefined;
            publicProfile?: boolean | undefined;
            showPurchases?: boolean | undefined;
        }>>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        lastActive: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        templatesCreated: number;
        helpfulVotes: number;
        badges: string[];
        isCreator: boolean;
        forumPosts: number;
        verifiedCreator: boolean;
        totalSales: number;
        totalReviews: number;
        reputation: number;
        location?: string | undefined;
        averageRating?: number | undefined;
        preferences?: {
            emailNotifications: boolean;
            marketingEmails: boolean;
            publicProfile: boolean;
            showPurchases: boolean;
        } | undefined;
        website?: string | undefined;
        avatar?: string | undefined;
        bio?: string | undefined;
        socialLinks?: Record<string, string> | undefined;
        creatorTier?: "expert" | "pro" | "starter" | undefined;
        lastActive?: Date | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        displayName: string;
        location?: string | undefined;
        averageRating?: number | undefined;
        preferences?: {
            emailNotifications?: boolean | undefined;
            marketingEmails?: boolean | undefined;
            publicProfile?: boolean | undefined;
            showPurchases?: boolean | undefined;
        } | undefined;
        website?: string | undefined;
        templatesCreated?: number | undefined;
        avatar?: string | undefined;
        helpfulVotes?: number | undefined;
        bio?: string | undefined;
        badges?: string[] | undefined;
        isCreator?: boolean | undefined;
        forumPosts?: number | undefined;
        socialLinks?: Record<string, string> | undefined;
        creatorTier?: "expert" | "pro" | "starter" | undefined;
        verifiedCreator?: boolean | undefined;
        totalSales?: number | undefined;
        totalReviews?: number | undefined;
        reputation?: number | undefined;
        lastActive?: Date | undefined;
    }>;
    Template: z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        shortDescription: z.ZodOptional<z.ZodString>;
        tags: z.ZodArray<z.ZodString, "many">;
        category: z.ZodString;
        subcategory: z.ZodOptional<z.ZodString>;
        priceCents: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        claudeCompatibility: z.ZodArray<z.ZodString, "many">;
        isAiGenerated: z.ZodDefault<z.ZodBoolean>;
        complexity: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        estimatedTokens: z.ZodOptional<z.ZodNumber>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        previewImages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        demoVideo: z.ZodOptional<z.ZodString>;
        status: z.ZodNativeEnum<typeof TemplateStatus>;
        featured: z.ZodDefault<z.ZodBoolean>;
        promoted: z.ZodDefault<z.ZodBoolean>;
        stats: z.ZodObject<{
            views: z.ZodDefault<z.ZodNumber>;
            downloads: z.ZodDefault<z.ZodNumber>;
            purchases: z.ZodDefault<z.ZodNumber>;
            likes: z.ZodDefault<z.ZodNumber>;
            forks: z.ZodDefault<z.ZodNumber>;
            avgRating: z.ZodOptional<z.ZodNumber>;
            ratingCount: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            downloads: number;
            views: number;
            likes: number;
            purchases: number;
            forks: number;
            ratingCount: number;
            avgRating?: number | undefined;
        }, {
            downloads?: number | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            avgRating?: number | undefined;
            purchases?: number | undefined;
            forks?: number | undefined;
            ratingCount?: number | undefined;
        }>;
        seoKeywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        metaDescription: z.ZodOptional<z.ZodString>;
        currentVersionId: z.ZodOptional<z.ZodString>;
        versionCount: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        publishedAt: z.ZodOptional<z.ZodDate>;
        featuredAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: TemplateStatus;
        category: string;
        tags: string[];
        complexity: "advanced" | "intermediate" | "beginner";
        title: string;
        featured: boolean;
        stats: {
            downloads: number;
            views: number;
            likes: number;
            purchases: number;
            forks: number;
            ratingCount: number;
            avgRating?: number | undefined;
        };
        currency: string;
        isAiGenerated: boolean;
        ownerId: string;
        priceCents: number;
        claudeCompatibility: string[];
        previewImages: string[];
        promoted: boolean;
        seoKeywords: string[];
        versionCount: number;
        publishedAt?: Date | undefined;
        subcategory?: string | undefined;
        thumbnailUrl?: string | undefined;
        featuredAt?: Date | undefined;
        metaDescription?: string | undefined;
        currentVersionId?: string | undefined;
        shortDescription?: string | undefined;
        estimatedTokens?: number | undefined;
        demoVideo?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: TemplateStatus;
        category: string;
        tags: string[];
        complexity: "advanced" | "intermediate" | "beginner";
        title: string;
        stats: {
            downloads?: number | undefined;
            views?: number | undefined;
            likes?: number | undefined;
            avgRating?: number | undefined;
            purchases?: number | undefined;
            forks?: number | undefined;
            ratingCount?: number | undefined;
        };
        ownerId: string;
        priceCents: number;
        claudeCompatibility: string[];
        featured?: boolean | undefined;
        currency?: string | undefined;
        isAiGenerated?: boolean | undefined;
        publishedAt?: Date | undefined;
        subcategory?: string | undefined;
        thumbnailUrl?: string | undefined;
        featuredAt?: Date | undefined;
        metaDescription?: string | undefined;
        currentVersionId?: string | undefined;
        shortDescription?: string | undefined;
        estimatedTokens?: number | undefined;
        previewImages?: string[] | undefined;
        demoVideo?: string | undefined;
        promoted?: boolean | undefined;
        seoKeywords?: string[] | undefined;
        versionCount?: number | undefined;
    }>;
    TemplateVersion: z.ZodObject<{
        id: z.ZodString;
        templateId: z.ZodString;
        versionNumber: z.ZodString;
        versionName: z.ZodOptional<z.ZodString>;
        claudeModel: z.ZodString;
        graphJson: z.ZodString;
        promptYaml: z.ZodOptional<z.ZodString>;
        changelog: z.ZodOptional<z.ZodString>;
        documentation: z.ZodOptional<z.ZodString>;
        examples: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            input: z.ZodString;
            expectedOutput: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            input: string;
            title: string;
            expectedOutput: string;
        }, {
            input: string;
            title: string;
            expectedOutput: string;
        }>, "many">>;
        hash: z.ZodString;
        tokenPerRunEstimate: z.ZodNumber;
        safetyScore: z.ZodNumber;
        testResults: z.ZodOptional<z.ZodObject<{
            passed: z.ZodNumber;
            failed: z.ZodNumber;
            coverage: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            failed: number;
            passed: number;
            coverage?: number | undefined;
        }, {
            failed: number;
            passed: number;
            coverage?: number | undefined;
        }>>;
        avgExecutionTime: z.ZodOptional<z.ZodNumber>;
        successRate: z.ZodOptional<z.ZodNumber>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
        releaseNotes: z.ZodOptional<z.ZodString>;
        assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            size: z.ZodNumber;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            type: string;
            url: string;
            size: number;
        }, {
            name: string;
            type: string;
            url: string;
            size: number;
        }>, "many">>;
        createdAt: z.ZodDate;
        publishedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        examples: {
            input: string;
            title: string;
            expectedOutput: string;
        }[];
        assets: {
            name: string;
            type: string;
            url: string;
            size: number;
        }[];
        isPublic: boolean;
        hash: string;
        templateId: string;
        safetyScore: number;
        graphJson: string;
        claudeModel: string;
        versionNumber: string;
        tokenPerRunEstimate: number;
        successRate?: number | undefined;
        documentation?: string | undefined;
        changelog?: string | undefined;
        testResults?: {
            failed: number;
            passed: number;
            coverage?: number | undefined;
        } | undefined;
        publishedAt?: Date | undefined;
        promptYaml?: string | undefined;
        versionName?: string | undefined;
        avgExecutionTime?: number | undefined;
        releaseNotes?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        hash: string;
        templateId: string;
        safetyScore: number;
        graphJson: string;
        claudeModel: string;
        versionNumber: string;
        tokenPerRunEstimate: number;
        successRate?: number | undefined;
        examples?: {
            input: string;
            title: string;
            expectedOutput: string;
        }[] | undefined;
        documentation?: string | undefined;
        assets?: {
            name: string;
            type: string;
            url: string;
            size: number;
        }[] | undefined;
        changelog?: string | undefined;
        isPublic?: boolean | undefined;
        testResults?: {
            failed: number;
            passed: number;
            coverage?: number | undefined;
        } | undefined;
        publishedAt?: Date | undefined;
        promptYaml?: string | undefined;
        versionName?: string | undefined;
        avgExecutionTime?: number | undefined;
        releaseNotes?: string | undefined;
    }>;
    Purchase: z.ZodObject<{
        id: z.ZodString;
        buyerId: z.ZodString;
        templateId: z.ZodString;
        versionId: z.ZodString;
        stripePaymentIntentId: z.ZodOptional<z.ZodString>;
        amount: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        status: z.ZodNativeEnum<typeof PurchaseStatus>;
        refundReason: z.ZodOptional<z.ZodNativeEnum<typeof RefundReason>>;
        refundAmount: z.ZodOptional<z.ZodNumber>;
        transactionId: z.ZodOptional<z.ZodString>;
        paymentMethod: z.ZodOptional<z.ZodString>;
        licenseType: z.ZodDefault<z.ZodEnum<["personal", "commercial", "enterprise"]>>;
        licenseTerms: z.ZodOptional<z.ZodString>;
        downloadCount: z.ZodDefault<z.ZodNumber>;
        lastDownloaded: z.ZodOptional<z.ZodDate>;
        supportTicketId: z.ZodOptional<z.ZodString>;
        satisfactionRating: z.ZodOptional<z.ZodNumber>;
        satisfactionFeedback: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDate;
        completedAt: z.ZodOptional<z.ZodDate>;
        refundedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        status: PurchaseStatus;
        amount: number;
        templateId: string;
        currency: string;
        buyerId: string;
        licenseType: "personal" | "enterprise" | "commercial";
        versionId: string;
        downloadCount: number;
        completedAt?: Date | undefined;
        transactionId?: string | undefined;
        paymentMethod?: string | undefined;
        stripePaymentIntentId?: string | undefined;
        refundReason?: RefundReason | undefined;
        refundAmount?: number | undefined;
        licenseTerms?: string | undefined;
        lastDownloaded?: Date | undefined;
        supportTicketId?: string | undefined;
        satisfactionRating?: number | undefined;
        satisfactionFeedback?: string | undefined;
        refundedAt?: Date | undefined;
    }, {
        id: string;
        createdAt: Date;
        status: PurchaseStatus;
        amount: number;
        templateId: string;
        buyerId: string;
        versionId: string;
        completedAt?: Date | undefined;
        currency?: string | undefined;
        transactionId?: string | undefined;
        paymentMethod?: string | undefined;
        licenseType?: "personal" | "enterprise" | "commercial" | undefined;
        stripePaymentIntentId?: string | undefined;
        refundReason?: RefundReason | undefined;
        refundAmount?: number | undefined;
        licenseTerms?: string | undefined;
        downloadCount?: number | undefined;
        lastDownloaded?: Date | undefined;
        supportTicketId?: string | undefined;
        satisfactionRating?: number | undefined;
        satisfactionFeedback?: string | undefined;
        refundedAt?: Date | undefined;
    }>;
    Review: z.ZodObject<{
        id: z.ZodString;
        templateId: z.ZodString;
        buyerId: z.ZodString;
        purchaseId: z.ZodOptional<z.ZodString>;
        rating: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
        comment: z.ZodString;
        aspects: z.ZodOptional<z.ZodObject<{
            easeOfUse: z.ZodOptional<z.ZodNumber>;
            documentation: z.ZodOptional<z.ZodNumber>;
            valueForMoney: z.ZodOptional<z.ZodNumber>;
            performance: z.ZodOptional<z.ZodNumber>;
            support: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            performance?: number | undefined;
            documentation?: number | undefined;
            easeOfUse?: number | undefined;
            support?: number | undefined;
            valueForMoney?: number | undefined;
        }, {
            performance?: number | undefined;
            documentation?: number | undefined;
            easeOfUse?: number | undefined;
            support?: number | undefined;
            valueForMoney?: number | undefined;
        }>>;
        sentimentAi: z.ZodOptional<z.ZodEnum<["positive", "neutral", "negative"]>>;
        helpfulnessScore: z.ZodOptional<z.ZodNumber>;
        verifiedPurchase: z.ZodDefault<z.ZodBoolean>;
        helpfulVotes: z.ZodDefault<z.ZodNumber>;
        unhelpfulVotes: z.ZodDefault<z.ZodNumber>;
        creatorResponse: z.ZodOptional<z.ZodString>;
        creatorResponseAt: z.ZodOptional<z.ZodDate>;
        flagged: z.ZodDefault<z.ZodBoolean>;
        flagReason: z.ZodOptional<z.ZodString>;
        moderatedBy: z.ZodOptional<z.ZodString>;
        moderatedAt: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        comment: string;
        templateId: string;
        buyerId: string;
        flagged: boolean;
        helpfulVotes: number;
        verifiedPurchase: boolean;
        unhelpfulVotes: number;
        title?: string | undefined;
        purchaseId?: string | undefined;
        aspects?: {
            performance?: number | undefined;
            documentation?: number | undefined;
            easeOfUse?: number | undefined;
            support?: number | undefined;
            valueForMoney?: number | undefined;
        } | undefined;
        sentimentAi?: "positive" | "neutral" | "negative" | undefined;
        helpfulnessScore?: number | undefined;
        creatorResponse?: string | undefined;
        creatorResponseAt?: Date | undefined;
        flagReason?: string | undefined;
        moderatedBy?: string | undefined;
        moderatedAt?: Date | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rating: number;
        comment: string;
        templateId: string;
        buyerId: string;
        title?: string | undefined;
        flagged?: boolean | undefined;
        helpfulVotes?: number | undefined;
        purchaseId?: string | undefined;
        aspects?: {
            performance?: number | undefined;
            documentation?: number | undefined;
            easeOfUse?: number | undefined;
            support?: number | undefined;
            valueForMoney?: number | undefined;
        } | undefined;
        sentimentAi?: "positive" | "neutral" | "negative" | undefined;
        helpfulnessScore?: number | undefined;
        verifiedPurchase?: boolean | undefined;
        unhelpfulVotes?: number | undefined;
        creatorResponse?: string | undefined;
        creatorResponseAt?: Date | undefined;
        flagReason?: string | undefined;
        moderatedBy?: string | undefined;
        moderatedAt?: Date | undefined;
    }>;
    ForumPost: z.ZodObject<{
        id: z.ZodString;
        authorId: z.ZodString;
        type: z.ZodNativeEnum<typeof ForumPostType>;
        title: z.ZodString;
        content: z.ZodString;
        contentHtml: z.ZodOptional<z.ZodString>;
        category: z.ZodString;
        tags: z.ZodArray<z.ZodString, "many">;
        isPinned: z.ZodDefault<z.ZodBoolean>;
        isLocked: z.ZodDefault<z.ZodBoolean>;
        isFeatured: z.ZodDefault<z.ZodBoolean>;
        allowComments: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodNativeEnum<typeof PostStatus>;
        moderationReason: z.ZodOptional<z.ZodString>;
        moderatedBy: z.ZodOptional<z.ZodString>;
        moderatedAt: z.ZodOptional<z.ZodDate>;
        views: z.ZodDefault<z.ZodNumber>;
        likes: z.ZodDefault<z.ZodNumber>;
        dislikes: z.ZodDefault<z.ZodNumber>;
        replies: z.ZodDefault<z.ZodNumber>;
        bookmarks: z.ZodDefault<z.ZodNumber>;
        shares: z.ZodDefault<z.ZodNumber>;
        slug: z.ZodString;
        excerpt: z.ZodOptional<z.ZodString>;
        relatedTemplateIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        relatedPostIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        attachments: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            size: z.ZodNumber;
            mimeType: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            url: string;
            size: number;
            mimeType: string;
        }, {
            id: string;
            name: string;
            url: string;
            size: number;
            mimeType: string;
        }>, "many">>;
        parentId: z.ZodOptional<z.ZodString>;
        threadId: z.ZodOptional<z.ZodString>;
        replyCount: z.ZodDefault<z.ZodNumber>;
        lastReplyAt: z.ZodOptional<z.ZodDate>;
        lastReplyBy: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        lastActivity: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: PostStatus;
        type: ForumPostType;
        category: string;
        tags: string[];
        title: string;
        content: string;
        isLocked: boolean;
        attachments: {
            id: string;
            name: string;
            url: string;
            size: number;
            mimeType: string;
        }[];
        slug: string;
        views: number;
        likes: number;
        shares: number;
        bookmarks: number;
        allowComments: boolean;
        authorId: string;
        isPinned: boolean;
        replies: number;
        lastActivity: Date;
        isFeatured: boolean;
        dislikes: number;
        relatedTemplateIds: string[];
        relatedPostIds: string[];
        replyCount: number;
        parentId?: string | undefined;
        threadId?: string | undefined;
        excerpt?: string | undefined;
        moderatedBy?: string | undefined;
        moderatedAt?: Date | undefined;
        contentHtml?: string | undefined;
        moderationReason?: string | undefined;
        lastReplyAt?: Date | undefined;
        lastReplyBy?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: PostStatus;
        type: ForumPostType;
        category: string;
        tags: string[];
        title: string;
        content: string;
        slug: string;
        authorId: string;
        lastActivity: Date;
        parentId?: string | undefined;
        isLocked?: boolean | undefined;
        threadId?: string | undefined;
        attachments?: {
            id: string;
            name: string;
            url: string;
            size: number;
            mimeType: string;
        }[] | undefined;
        excerpt?: string | undefined;
        views?: number | undefined;
        likes?: number | undefined;
        shares?: number | undefined;
        bookmarks?: number | undefined;
        allowComments?: boolean | undefined;
        isPinned?: boolean | undefined;
        replies?: number | undefined;
        moderatedBy?: string | undefined;
        moderatedAt?: Date | undefined;
        contentHtml?: string | undefined;
        isFeatured?: boolean | undefined;
        moderationReason?: string | undefined;
        dislikes?: number | undefined;
        relatedTemplateIds?: string[] | undefined;
        relatedPostIds?: string[] | undefined;
        replyCount?: number | undefined;
        lastReplyAt?: Date | undefined;
        lastReplyBy?: string | undefined;
    }>;
    KnowledgeArticle: z.ZodObject<{
        id: z.ZodString;
        authorId: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        contentHtml: z.ZodOptional<z.ZodString>;
        excerpt: z.ZodOptional<z.ZodString>;
        category: z.ZodString;
        subcategory: z.ZodOptional<z.ZodString>;
        tags: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        tableOfContents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            level: z.ZodNumber;
            anchor: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            anchor: string;
            id: string;
            title: string;
            level: number;
        }, {
            anchor: string;
            id: string;
            title: string;
            level: number;
        }>, "many">>;
        slug: z.ZodString;
        metaDescription: z.ZodOptional<z.ZodString>;
        keywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodEnum<["draft", "published", "archived", "under_review"]>;
        featured: z.ZodDefault<z.ZodBoolean>;
        version: z.ZodDefault<z.ZodString>;
        previousVersionId: z.ZodOptional<z.ZodString>;
        views: z.ZodDefault<z.ZodNumber>;
        likes: z.ZodDefault<z.ZodNumber>;
        bookmarks: z.ZodDefault<z.ZodNumber>;
        helpfulVotes: z.ZodDefault<z.ZodNumber>;
        relatedArticleIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        relatedTemplateIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        publishedAt: z.ZodOptional<z.ZodDate>;
        lastReviewed: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "draft" | "published" | "archived" | "under_review";
        category: string;
        tags: string[];
        version: string;
        title: string;
        content: string;
        keywords: string[];
        featured: boolean;
        difficulty: "advanced" | "intermediate" | "beginner";
        slug: string;
        views: number;
        likes: number;
        bookmarks: number;
        helpfulVotes: number;
        authorId: string;
        relatedTemplateIds: string[];
        relatedArticleIds: string[];
        publishedAt?: Date | undefined;
        excerpt?: string | undefined;
        subcategory?: string | undefined;
        metaDescription?: string | undefined;
        contentHtml?: string | undefined;
        tableOfContents?: {
            anchor: string;
            id: string;
            title: string;
            level: number;
        }[] | undefined;
        previousVersionId?: string | undefined;
        lastReviewed?: Date | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: "draft" | "published" | "archived" | "under_review";
        category: string;
        tags: string[];
        title: string;
        content: string;
        difficulty: "advanced" | "intermediate" | "beginner";
        slug: string;
        authorId: string;
        version?: string | undefined;
        keywords?: string[] | undefined;
        featured?: boolean | undefined;
        publishedAt?: Date | undefined;
        excerpt?: string | undefined;
        views?: number | undefined;
        subcategory?: string | undefined;
        likes?: number | undefined;
        bookmarks?: number | undefined;
        helpfulVotes?: number | undefined;
        metaDescription?: string | undefined;
        contentHtml?: string | undefined;
        relatedTemplateIds?: string[] | undefined;
        tableOfContents?: {
            anchor: string;
            id: string;
            title: string;
            level: number;
        }[] | undefined;
        previousVersionId?: string | undefined;
        relatedArticleIds?: string[] | undefined;
        lastReviewed?: Date | undefined;
    }>;
    Tutorial: z.ZodObject<{
        id: z.ZodString;
        authorId: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        shortDescription: z.ZodOptional<z.ZodString>;
        steps: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            content: z.ZodString;
            order: z.ZodNumber;
            estimatedDuration: z.ZodOptional<z.ZodNumber>;
            resources: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                type: z.ZodEnum<["video", "article", "template", "download", "external"]>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                type: "external" | "template" | "article" | "video" | "download";
                url: string;
            }, {
                name: string;
                type: "external" | "template" | "article" | "video" | "download";
                url: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            content: string;
            resources: {
                name: string;
                type: "external" | "template" | "article" | "video" | "download";
                url: string;
            }[];
            order: number;
            estimatedDuration?: number | undefined;
        }, {
            id: string;
            title: string;
            content: string;
            order: number;
            resources?: {
                name: string;
                type: "external" | "template" | "article" | "video" | "download";
                url: string;
            }[] | undefined;
            estimatedDuration?: number | undefined;
        }>, "many">;
        category: z.ZodString;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
        estimatedDuration: z.ZodNumber;
        prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        learningOutcomes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        videoUrl: z.ZodOptional<z.ZodString>;
        assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            url: string;
            description?: string | undefined;
        }, {
            name: string;
            url: string;
            description?: string | undefined;
        }>, "many">>;
        hasQuiz: z.ZodDefault<z.ZodBoolean>;
        hasExercises: z.ZodDefault<z.ZodBoolean>;
        hasCertificate: z.ZodDefault<z.ZodBoolean>;
        status: z.ZodEnum<["draft", "published", "archived"]>;
        featured: z.ZodDefault<z.ZodBoolean>;
        views: z.ZodDefault<z.ZodNumber>;
        completions: z.ZodDefault<z.ZodNumber>;
        averageRating: z.ZodOptional<z.ZodNumber>;
        ratingCount: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        publishedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: "draft" | "published" | "archived";
        category: string;
        title: string;
        assets: {
            name: string;
            url: string;
            description?: string | undefined;
        }[];
        featured: boolean;
        prerequisites: string[];
        steps: {
            id: string;
            title: string;
            content: string;
            resources: {
                name: string;
                type: "external" | "template" | "article" | "video" | "download";
                url: string;
            }[];
            order: number;
            estimatedDuration?: number | undefined;
        }[];
        difficulty: "advanced" | "intermediate" | "beginner";
        views: number;
        authorId: string;
        estimatedDuration: number;
        ratingCount: number;
        learningOutcomes: string[];
        hasQuiz: boolean;
        hasExercises: boolean;
        hasCertificate: boolean;
        completions: number;
        averageRating?: number | undefined;
        publishedAt?: Date | undefined;
        videoUrl?: string | undefined;
        thumbnailUrl?: string | undefined;
        shortDescription?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        status: "draft" | "published" | "archived";
        category: string;
        title: string;
        steps: {
            id: string;
            title: string;
            content: string;
            order: number;
            resources?: {
                name: string;
                type: "external" | "template" | "article" | "video" | "download";
                url: string;
            }[] | undefined;
            estimatedDuration?: number | undefined;
        }[];
        difficulty: "advanced" | "intermediate" | "beginner";
        authorId: string;
        estimatedDuration: number;
        assets?: {
            name: string;
            url: string;
            description?: string | undefined;
        }[] | undefined;
        featured?: boolean | undefined;
        averageRating?: number | undefined;
        prerequisites?: string[] | undefined;
        publishedAt?: Date | undefined;
        videoUrl?: string | undefined;
        views?: number | undefined;
        thumbnailUrl?: string | undefined;
        shortDescription?: string | undefined;
        ratingCount?: number | undefined;
        learningOutcomes?: string[] | undefined;
        hasQuiz?: boolean | undefined;
        hasExercises?: boolean | undefined;
        hasCertificate?: boolean | undefined;
        completions?: number | undefined;
    }>;
    UserAnalytics: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        date: z.ZodDate;
        sessionsCount: z.ZodDefault<z.ZodNumber>;
        totalDuration: z.ZodDefault<z.ZodNumber>;
        pageViews: z.ZodDefault<z.ZodNumber>;
        templatesViewed: z.ZodDefault<z.ZodNumber>;
        templatesLiked: z.ZodDefault<z.ZodNumber>;
        templatesPurchased: z.ZodDefault<z.ZodNumber>;
        templatesDownloaded: z.ZodDefault<z.ZodNumber>;
        postsCreated: z.ZodDefault<z.ZodNumber>;
        postsViewed: z.ZodDefault<z.ZodNumber>;
        commentsPosted: z.ZodDefault<z.ZodNumber>;
        votesGiven: z.ZodDefault<z.ZodNumber>;
        tutorialsStarted: z.ZodDefault<z.ZodNumber>;
        tutorialsCompleted: z.ZodDefault<z.ZodNumber>;
        articlesRead: z.ZodDefault<z.ZodNumber>;
        templatesCreated: z.ZodDefault<z.ZodNumber>;
        templatesUpdated: z.ZodDefault<z.ZodNumber>;
        salesGenerated: z.ZodDefault<z.ZodNumber>;
        reviewsReceived: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        date: Date;
        userId: string;
        templatesViewed: number;
        templatesDownloaded: number;
        templatesPurchased: number;
        templatesCreated: number;
        tutorialsCompleted: number;
        sessionsCount: number;
        totalDuration: number;
        pageViews: number;
        templatesLiked: number;
        postsCreated: number;
        postsViewed: number;
        commentsPosted: number;
        votesGiven: number;
        tutorialsStarted: number;
        articlesRead: number;
        templatesUpdated: number;
        salesGenerated: number;
        reviewsReceived: number;
    }, {
        id: string;
        date: Date;
        userId: string;
        templatesViewed?: number | undefined;
        templatesDownloaded?: number | undefined;
        templatesPurchased?: number | undefined;
        templatesCreated?: number | undefined;
        tutorialsCompleted?: number | undefined;
        sessionsCount?: number | undefined;
        totalDuration?: number | undefined;
        pageViews?: number | undefined;
        templatesLiked?: number | undefined;
        postsCreated?: number | undefined;
        postsViewed?: number | undefined;
        commentsPosted?: number | undefined;
        votesGiven?: number | undefined;
        tutorialsStarted?: number | undefined;
        articlesRead?: number | undefined;
        templatesUpdated?: number | undefined;
        salesGenerated?: number | undefined;
        reviewsReceived?: number | undefined;
    }>;
    ContentAnalytics: z.ZodObject<{
        id: z.ZodString;
        contentId: z.ZodString;
        contentType: z.ZodNativeEnum<typeof ContentType>;
        date: z.ZodDate;
        views: z.ZodDefault<z.ZodNumber>;
        uniqueViews: z.ZodDefault<z.ZodNumber>;
        averageViewDuration: z.ZodDefault<z.ZodNumber>;
        bounceRate: z.ZodDefault<z.ZodNumber>;
        likes: z.ZodDefault<z.ZodNumber>;
        dislikes: z.ZodDefault<z.ZodNumber>;
        shares: z.ZodDefault<z.ZodNumber>;
        bookmarks: z.ZodDefault<z.ZodNumber>;
        comments: z.ZodDefault<z.ZodNumber>;
        previews: z.ZodDefault<z.ZodNumber>;
        purchases: z.ZodDefault<z.ZodNumber>;
        conversionRate: z.ZodDefault<z.ZodNumber>;
        topCountries: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        topCities: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        deviceTypes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        referralSources: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        searchKeywords: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        date: Date;
        comments: number;
        contentType: ContentType;
        views: number;
        previews: number;
        likes: number;
        shares: number;
        bookmarks: number;
        contentId: string;
        conversionRate: number;
        purchases: number;
        dislikes: number;
        uniqueViews: number;
        averageViewDuration: number;
        bounceRate: number;
        topCountries?: Record<string, number> | undefined;
        topCities?: Record<string, number> | undefined;
        deviceTypes?: Record<string, number> | undefined;
        referralSources?: Record<string, number> | undefined;
        searchKeywords?: Record<string, number> | undefined;
    }, {
        id: string;
        date: Date;
        contentType: ContentType;
        contentId: string;
        comments?: number | undefined;
        views?: number | undefined;
        previews?: number | undefined;
        likes?: number | undefined;
        shares?: number | undefined;
        bookmarks?: number | undefined;
        conversionRate?: number | undefined;
        purchases?: number | undefined;
        dislikes?: number | undefined;
        uniqueViews?: number | undefined;
        averageViewDuration?: number | undefined;
        bounceRate?: number | undefined;
        topCountries?: Record<string, number> | undefined;
        topCities?: Record<string, number> | undefined;
        deviceTypes?: Record<string, number> | undefined;
        referralSources?: Record<string, number> | undefined;
        searchKeywords?: Record<string, number> | undefined;
    }>;
    SearchQuery: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        query: z.ZodString;
        normalizedQuery: z.ZodString;
        filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        resultsCount: z.ZodNumber;
        clickedResults: z.ZodDefault<z.ZodArray<z.ZodObject<{
            contentId: z.ZodString;
            contentType: z.ZodNativeEnum<typeof ContentType>;
            position: z.ZodNumber;
            clickedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            position: number;
            contentType: ContentType;
            contentId: string;
            clickedAt: Date;
        }, {
            position: number;
            contentType: ContentType;
            contentId: string;
            clickedAt: Date;
        }>, "many">>;
        sessionId: z.ZodOptional<z.ZodString>;
        referrer: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        responseTime: z.ZodOptional<z.ZodNumber>;
        source: z.ZodDefault<z.ZodEnum<["web", "mobile", "api"]>>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        source: "web" | "api" | "mobile";
        query: string;
        normalizedQuery: string;
        resultsCount: number;
        clickedResults: {
            position: number;
            contentType: ContentType;
            contentId: string;
            clickedAt: Date;
        }[];
        userId?: string | undefined;
        sessionId?: string | undefined;
        filters?: Record<string, any> | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
        responseTime?: number | undefined;
    }, {
        id: string;
        createdAt: Date;
        query: string;
        normalizedQuery: string;
        resultsCount: number;
        userId?: string | undefined;
        source?: "web" | "api" | "mobile" | undefined;
        sessionId?: string | undefined;
        filters?: Record<string, any> | undefined;
        userAgent?: string | undefined;
        referrer?: string | undefined;
        responseTime?: number | undefined;
        clickedResults?: {
            position: number;
            contentType: ContentType;
            contentId: string;
            clickedAt: Date;
        }[] | undefined;
    }>;
    Collection: z.ZodObject<{
        id: z.ZodString;
        ownerId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
        isFeatured: z.ZodDefault<z.ZodBoolean>;
        allowCollaborators: z.ZodDefault<z.ZodBoolean>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            contentId: z.ZodString;
            contentType: z.ZodNativeEnum<typeof ContentType>;
            addedAt: z.ZodDate;
            order: z.ZodNumber;
            note: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            order: number;
            contentType: ContentType;
            contentId: string;
            addedAt: Date;
            note?: string | undefined;
        }, {
            order: number;
            contentType: ContentType;
            contentId: string;
            addedAt: Date;
            note?: string | undefined;
        }>, "many">>;
        category: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            role: z.ZodEnum<["viewer", "editor", "admin"]>;
            addedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            role: "admin" | "editor" | "viewer";
            addedAt: Date;
        }, {
            userId: string;
            role: "admin" | "editor" | "viewer";
            addedAt: Date;
        }>, "many">>;
        followers: z.ZodDefault<z.ZodNumber>;
        likes: z.ZodDefault<z.ZodNumber>;
        views: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        tags: string[];
        items: {
            order: number;
            contentType: ContentType;
            contentId: string;
            addedAt: Date;
            note?: string | undefined;
        }[];
        isPublic: boolean;
        collaborators: {
            userId: string;
            role: "admin" | "editor" | "viewer";
            addedAt: Date;
        }[];
        views: number;
        likes: number;
        ownerId: string;
        isFeatured: boolean;
        allowCollaborators: boolean;
        followers: number;
        description?: string | undefined;
        category?: string | undefined;
        thumbnailUrl?: string | undefined;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
        description?: string | undefined;
        category?: string | undefined;
        tags?: string[] | undefined;
        items?: {
            order: number;
            contentType: ContentType;
            contentId: string;
            addedAt: Date;
            note?: string | undefined;
        }[] | undefined;
        isPublic?: boolean | undefined;
        collaborators?: {
            userId: string;
            role: "admin" | "editor" | "viewer";
            addedAt: Date;
        }[] | undefined;
        views?: number | undefined;
        thumbnailUrl?: string | undefined;
        likes?: number | undefined;
        isFeatured?: boolean | undefined;
        allowCollaborators?: boolean | undefined;
        followers?: number | undefined;
    }>;
    Notification: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        type: z.ZodEnum<["template_published", "template_purchased", "template_reviewed", "post_replied", "post_liked", "comment_replied", "follower_added", "collection_shared", "system_announcement", "moderation_action"]>;
        title: z.ZodString;
        message: z.ZodString;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        actionUrl: z.ZodOptional<z.ZodString>;
        read: z.ZodDefault<z.ZodBoolean>;
        readAt: z.ZodOptional<z.ZodDate>;
        channels: z.ZodDefault<z.ZodArray<z.ZodEnum<["in_app", "email", "push", "sms"]>, "many">>;
        deliveryStatus: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodEnum<["pending", "sent", "delivered", "failed"]>>>;
        priority: z.ZodDefault<z.ZodEnum<["low", "normal", "high", "urgent"]>>;
        scheduledFor: z.ZodOptional<z.ZodDate>;
        createdAt: z.ZodDate;
        sentAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        priority: "low" | "high" | "normal" | "urgent";
        message: string;
        type: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
        userId: string;
        title: string;
        read: boolean;
        channels: ("push" | "email" | "sms" | "in_app")[];
        data?: Record<string, any> | undefined;
        sentAt?: Date | undefined;
        readAt?: Date | undefined;
        actionUrl?: string | undefined;
        deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered"> | undefined;
        scheduledFor?: Date | undefined;
    }, {
        id: string;
        createdAt: Date;
        message: string;
        type: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
        userId: string;
        title: string;
        priority?: "low" | "high" | "normal" | "urgent" | undefined;
        data?: Record<string, any> | undefined;
        read?: boolean | undefined;
        channels?: ("push" | "email" | "sms" | "in_app")[] | undefined;
        sentAt?: Date | undefined;
        readAt?: Date | undefined;
        actionUrl?: string | undefined;
        deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered"> | undefined;
        scheduledFor?: Date | undefined;
    }>;
};
export declare function validateContentModel<T extends keyof Epic16ContentModel>(type: T, data: unknown): Epic16ContentModel[T];
export declare function isValidContentModel<T extends keyof Epic16ContentModel>(type: T, data: unknown): data is Epic16ContentModel[T];
export declare const Epic16Relationships: {
    readonly userToTemplates: "one-to-many";
    readonly templateToVersions: "one-to-many";
    readonly templateToPurchases: "one-to-many";
    readonly templateToReviews: "one-to-many";
    readonly userToPurchases: "one-to-many";
    readonly userToReviews: "one-to-many";
    readonly userToForumPosts: "one-to-many";
    readonly userToCollections: "one-to-many";
    readonly userToNotifications: "one-to-many";
    readonly forumPostToReplies: "one-to-many";
    readonly templateToAnalytics: "one-to-many";
    readonly userToAnalytics: "one-to-many";
};
export default Epic16ContentModel;
//# sourceMappingURL=Epic16ContentDataModel.d.ts.map