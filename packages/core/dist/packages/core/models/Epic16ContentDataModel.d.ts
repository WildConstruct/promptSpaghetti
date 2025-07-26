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
        emailNotifications?: boolean;
        marketingEmails?: boolean;
        publicProfile?: boolean;
        showPurchases?: boolean;
    }, {
        emailNotifications?: boolean;
        marketingEmails?: boolean;
        publicProfile?: boolean;
        showPurchases?: boolean;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    lastActive: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    location?: string;
    userId?: string;
    displayName?: string;
    preferences?: {
        emailNotifications?: boolean;
        marketingEmails?: boolean;
        publicProfile?: boolean;
        showPurchases?: boolean;
    };
    website?: string;
    helpfulVotes?: number;
    avatar?: string;
    bio?: string;
    badges?: string[];
    isCreator?: boolean;
    averageRating?: number;
    socialLinks?: Record<string, string>;
    templatesCreated?: number;
    forumPosts?: number;
    creatorTier?: "expert" | "pro" | "starter";
    verifiedCreator?: boolean;
    totalSales?: number;
    totalReviews?: number;
    reputation?: number;
    lastActive?: Date;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    location?: string;
    userId?: string;
    displayName?: string;
    preferences?: {
        emailNotifications?: boolean;
        marketingEmails?: boolean;
        publicProfile?: boolean;
        showPurchases?: boolean;
    };
    website?: string;
    helpfulVotes?: number;
    avatar?: string;
    bio?: string;
    badges?: string[];
    isCreator?: boolean;
    averageRating?: number;
    socialLinks?: Record<string, string>;
    templatesCreated?: number;
    forumPosts?: number;
    creatorTier?: "expert" | "pro" | "starter";
    verifiedCreator?: boolean;
    totalSales?: number;
    totalReviews?: number;
    reputation?: number;
    lastActive?: Date;
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
        avgRating?: number;
        views?: number;
        downloads?: number;
        likes?: number;
        purchases?: number;
        forks?: number;
        ratingCount?: number;
    }, {
        avgRating?: number;
        views?: number;
        downloads?: number;
        likes?: number;
        purchases?: number;
        forks?: number;
        ratingCount?: number;
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
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: TemplateStatus;
    category?: string;
    tags?: string[];
    title?: string;
    complexity?: "advanced" | "intermediate" | "beginner";
    featured?: boolean;
    stats?: {
        avgRating?: number;
        views?: number;
        downloads?: number;
        likes?: number;
        purchases?: number;
        forks?: number;
        ratingCount?: number;
    };
    currency?: string;
    subcategory?: string;
    publishedAt?: Date;
    thumbnailUrl?: string;
    featuredAt?: Date;
    metaDescription?: string;
    currentVersionId?: string;
    isAiGenerated?: boolean;
    ownerId?: string;
    shortDescription?: string;
    priceCents?: number;
    claudeCompatibility?: string[];
    estimatedTokens?: number;
    previewImages?: string[];
    demoVideo?: string;
    promoted?: boolean;
    seoKeywords?: string[];
    versionCount?: number;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: TemplateStatus;
    category?: string;
    tags?: string[];
    title?: string;
    complexity?: "advanced" | "intermediate" | "beginner";
    featured?: boolean;
    stats?: {
        avgRating?: number;
        views?: number;
        downloads?: number;
        likes?: number;
        purchases?: number;
        forks?: number;
        ratingCount?: number;
    };
    currency?: string;
    subcategory?: string;
    publishedAt?: Date;
    thumbnailUrl?: string;
    featuredAt?: Date;
    metaDescription?: string;
    currentVersionId?: string;
    isAiGenerated?: boolean;
    ownerId?: string;
    shortDescription?: string;
    priceCents?: number;
    claudeCompatibility?: string[];
    estimatedTokens?: number;
    previewImages?: string[];
    demoVideo?: string;
    promoted?: boolean;
    seoKeywords?: string[];
    versionCount?: number;
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
        input?: string;
        title?: string;
        expectedOutput?: string;
    }, {
        input?: string;
        title?: string;
        expectedOutput?: string;
    }>, "many">>;
    hash: z.ZodString;
    tokenPerRunEstimate: z.ZodNumber;
    safetyScore: z.ZodNumber;
    testResults: z.ZodOptional<z.ZodObject<{
        passed: z.ZodNumber;
        failed: z.ZodNumber;
        coverage: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        failed?: number;
        passed?: number;
        coverage?: number;
    }, {
        failed?: number;
        passed?: number;
        coverage?: number;
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
        name?: string;
        size?: number;
        type?: string;
        url?: string;
    }, {
        name?: string;
        size?: number;
        type?: string;
        url?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    publishedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    hash?: string;
    successRate?: number;
    examples?: {
        input?: string;
        title?: string;
        expectedOutput?: string;
    }[];
    documentation?: string;
    assets?: {
        name?: string;
        size?: number;
        type?: string;
        url?: string;
    }[];
    changelog?: string;
    isPublic?: boolean;
    testResults?: {
        failed?: number;
        passed?: number;
        coverage?: number;
    };
    templateId?: string;
    safetyScore?: number;
    publishedAt?: Date;
    graphJson?: string;
    promptYaml?: string;
    claudeModel?: string;
    versionNumber?: string;
    versionName?: string;
    tokenPerRunEstimate?: number;
    avgExecutionTime?: number;
    releaseNotes?: string;
}, {
    id?: string;
    createdAt?: Date;
    hash?: string;
    successRate?: number;
    examples?: {
        input?: string;
        title?: string;
        expectedOutput?: string;
    }[];
    documentation?: string;
    assets?: {
        name?: string;
        size?: number;
        type?: string;
        url?: string;
    }[];
    changelog?: string;
    isPublic?: boolean;
    testResults?: {
        failed?: number;
        passed?: number;
        coverage?: number;
    };
    templateId?: string;
    safetyScore?: number;
    publishedAt?: Date;
    graphJson?: string;
    promptYaml?: string;
    claudeModel?: string;
    versionNumber?: string;
    versionName?: string;
    tokenPerRunEstimate?: number;
    avgExecutionTime?: number;
    releaseNotes?: string;
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
    id?: string;
    createdAt?: Date;
    status?: PurchaseStatus;
    amount?: number;
    currency?: string;
    transactionId?: string;
    paymentMethod?: string;
    templateId?: string;
    licenseType?: "personal" | "enterprise" | "commercial";
    versionId?: string;
    completedAt?: Date;
    buyerId?: string;
    downloadCount?: number;
    stripePaymentIntentId?: string;
    refundReason?: RefundReason;
    refundAmount?: number;
    licenseTerms?: string;
    lastDownloaded?: Date;
    supportTicketId?: string;
    satisfactionRating?: number;
    satisfactionFeedback?: string;
    refundedAt?: Date;
}, {
    id?: string;
    createdAt?: Date;
    status?: PurchaseStatus;
    amount?: number;
    currency?: string;
    transactionId?: string;
    paymentMethod?: string;
    templateId?: string;
    licenseType?: "personal" | "enterprise" | "commercial";
    versionId?: string;
    completedAt?: Date;
    buyerId?: string;
    downloadCount?: number;
    stripePaymentIntentId?: string;
    refundReason?: RefundReason;
    refundAmount?: number;
    licenseTerms?: string;
    lastDownloaded?: Date;
    supportTicketId?: string;
    satisfactionRating?: number;
    satisfactionFeedback?: string;
    refundedAt?: Date;
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
        performance?: number;
        documentation?: number;
        support?: number;
        easeOfUse?: number;
        valueForMoney?: number;
    }, {
        performance?: number;
        documentation?: number;
        support?: number;
        easeOfUse?: number;
        valueForMoney?: number;
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
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    title?: string;
    rating?: number;
    comment?: string;
    templateId?: string;
    flagged?: boolean;
    helpfulVotes?: number;
    buyerId?: string;
    helpfulnessScore?: number;
    purchaseId?: string;
    aspects?: {
        performance?: number;
        documentation?: number;
        support?: number;
        easeOfUse?: number;
        valueForMoney?: number;
    };
    sentimentAi?: "positive" | "neutral" | "negative";
    verifiedPurchase?: boolean;
    unhelpfulVotes?: number;
    creatorResponse?: string;
    creatorResponseAt?: Date;
    flagReason?: string;
    moderatedBy?: string;
    moderatedAt?: Date;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    title?: string;
    rating?: number;
    comment?: string;
    templateId?: string;
    flagged?: boolean;
    helpfulVotes?: number;
    buyerId?: string;
    helpfulnessScore?: number;
    purchaseId?: string;
    aspects?: {
        performance?: number;
        documentation?: number;
        support?: number;
        easeOfUse?: number;
        valueForMoney?: number;
    };
    sentimentAi?: "positive" | "neutral" | "negative";
    verifiedPurchase?: boolean;
    unhelpfulVotes?: number;
    creatorResponse?: string;
    creatorResponseAt?: Date;
    flagReason?: string;
    moderatedBy?: string;
    moderatedAt?: Date;
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
        id?: string;
        name?: string;
        size?: number;
        url?: string;
        mimeType?: string;
    }, {
        id?: string;
        name?: string;
        size?: number;
        url?: string;
        mimeType?: string;
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
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: PostStatus;
    type?: ForumPostType;
    category?: string;
    tags?: string[];
    content?: string;
    title?: string;
    parentId?: string;
    bookmarks?: number;
    authorId?: string;
    isLocked?: boolean;
    views?: number;
    likes?: number;
    shares?: number;
    slug?: string;
    allowComments?: boolean;
    isPinned?: boolean;
    replies?: number;
    threadId?: string;
    attachments?: {
        id?: string;
        name?: string;
        size?: number;
        url?: string;
        mimeType?: string;
    }[];
    excerpt?: string;
    replyCount?: number;
    lastActivity?: Date;
    moderatedBy?: string;
    moderatedAt?: Date;
    contentHtml?: string;
    isFeatured?: boolean;
    moderationReason?: string;
    dislikes?: number;
    relatedTemplateIds?: string[];
    relatedPostIds?: string[];
    lastReplyAt?: Date;
    lastReplyBy?: string;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: PostStatus;
    type?: ForumPostType;
    category?: string;
    tags?: string[];
    content?: string;
    title?: string;
    parentId?: string;
    bookmarks?: number;
    authorId?: string;
    isLocked?: boolean;
    views?: number;
    likes?: number;
    shares?: number;
    slug?: string;
    allowComments?: boolean;
    isPinned?: boolean;
    replies?: number;
    threadId?: string;
    attachments?: {
        id?: string;
        name?: string;
        size?: number;
        url?: string;
        mimeType?: string;
    }[];
    excerpt?: string;
    replyCount?: number;
    lastActivity?: Date;
    moderatedBy?: string;
    moderatedAt?: Date;
    contentHtml?: string;
    isFeatured?: boolean;
    moderationReason?: string;
    dislikes?: number;
    relatedTemplateIds?: string[];
    relatedPostIds?: string[];
    lastReplyAt?: Date;
    lastReplyBy?: string;
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
        id?: string;
        anchor?: string;
        title?: string;
        level?: number;
    }, {
        id?: string;
        anchor?: string;
        title?: string;
        level?: number;
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
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: "draft" | "published" | "archived" | "under_review";
    category?: string;
    tags?: string[];
    version?: string;
    content?: string;
    title?: string;
    bookmarks?: number;
    authorId?: string;
    keywords?: string[];
    featured?: boolean;
    views?: number;
    likes?: number;
    subcategory?: string;
    difficulty?: "advanced" | "intermediate" | "beginner";
    publishedAt?: Date;
    helpfulVotes?: number;
    slug?: string;
    metaDescription?: string;
    excerpt?: string;
    contentHtml?: string;
    relatedTemplateIds?: string[];
    tableOfContents?: {
        id?: string;
        anchor?: string;
        title?: string;
        level?: number;
    }[];
    previousVersionId?: string;
    relatedArticleIds?: string[];
    lastReviewed?: Date;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status?: "draft" | "published" | "archived" | "under_review";
    category?: string;
    tags?: string[];
    version?: string;
    content?: string;
    title?: string;
    bookmarks?: number;
    authorId?: string;
    keywords?: string[];
    featured?: boolean;
    views?: number;
    likes?: number;
    subcategory?: string;
    difficulty?: "advanced" | "intermediate" | "beginner";
    publishedAt?: Date;
    helpfulVotes?: number;
    slug?: string;
    metaDescription?: string;
    excerpt?: string;
    contentHtml?: string;
    relatedTemplateIds?: string[];
    tableOfContents?: {
        id?: string;
        anchor?: string;
        title?: string;
        level?: number;
    }[];
    previousVersionId?: string;
    relatedArticleIds?: string[];
    lastReviewed?: Date;
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
            name?: string;
            type?: "external" | "template" | "article" | "video" | "download";
            url?: string;
        }, {
            name?: string;
            type?: "external" | "template" | "article" | "video" | "download";
            url?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        content?: string;
        title?: string;
        resources?: {
            name?: string;
            type?: "external" | "template" | "article" | "video" | "download";
            url?: string;
        }[];
        order?: number;
        estimatedDuration?: number;
    }, {
        id?: string;
        content?: string;
        title?: string;
        resources?: {
            name?: string;
            type?: "external" | "template" | "article" | "video" | "download";
            url?: string;
        }[];
        order?: number;
        estimatedDuration?: number;
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
        name?: string;
        description?: string;
        url?: string;
    }, {
        name?: string;
        description?: string;
        url?: string;
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
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "archived";
    category?: string;
    title?: string;
    steps?: {
        id?: string;
        content?: string;
        title?: string;
        resources?: {
            name?: string;
            type?: "external" | "template" | "article" | "video" | "download";
            url?: string;
        }[];
        order?: number;
        estimatedDuration?: number;
    }[];
    authorId?: string;
    assets?: {
        name?: string;
        description?: string;
        url?: string;
    }[];
    featured?: boolean;
    views?: number;
    videoUrl?: string;
    prerequisites?: string[];
    difficulty?: "advanced" | "intermediate" | "beginner";
    publishedAt?: Date;
    thumbnailUrl?: string;
    estimatedDuration?: number;
    averageRating?: number;
    shortDescription?: string;
    ratingCount?: number;
    learningOutcomes?: string[];
    hasQuiz?: boolean;
    hasExercises?: boolean;
    hasCertificate?: boolean;
    completions?: number;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "archived";
    category?: string;
    title?: string;
    steps?: {
        id?: string;
        content?: string;
        title?: string;
        resources?: {
            name?: string;
            type?: "external" | "template" | "article" | "video" | "download";
            url?: string;
        }[];
        order?: number;
        estimatedDuration?: number;
    }[];
    authorId?: string;
    assets?: {
        name?: string;
        description?: string;
        url?: string;
    }[];
    featured?: boolean;
    views?: number;
    videoUrl?: string;
    prerequisites?: string[];
    difficulty?: "advanced" | "intermediate" | "beginner";
    publishedAt?: Date;
    thumbnailUrl?: string;
    estimatedDuration?: number;
    averageRating?: number;
    shortDescription?: string;
    ratingCount?: number;
    learningOutcomes?: string[];
    hasQuiz?: boolean;
    hasExercises?: boolean;
    hasCertificate?: boolean;
    completions?: number;
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
    id?: string;
    date?: Date;
    userId?: string;
    pageViews?: number;
    templatesViewed?: number;
    templatesCreated?: number;
    templatesDownloaded?: number;
    sessionsCount?: number;
    totalDuration?: number;
    templatesLiked?: number;
    templatesPurchased?: number;
    postsCreated?: number;
    postsViewed?: number;
    commentsPosted?: number;
    votesGiven?: number;
    tutorialsStarted?: number;
    tutorialsCompleted?: number;
    articlesRead?: number;
    templatesUpdated?: number;
    salesGenerated?: number;
    reviewsReceived?: number;
}, {
    id?: string;
    date?: Date;
    userId?: string;
    pageViews?: number;
    templatesViewed?: number;
    templatesCreated?: number;
    templatesDownloaded?: number;
    sessionsCount?: number;
    totalDuration?: number;
    templatesLiked?: number;
    templatesPurchased?: number;
    postsCreated?: number;
    postsViewed?: number;
    commentsPosted?: number;
    votesGiven?: number;
    tutorialsStarted?: number;
    tutorialsCompleted?: number;
    articlesRead?: number;
    templatesUpdated?: number;
    salesGenerated?: number;
    reviewsReceived?: number;
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
    id?: string;
    date?: Date;
    bookmarks?: number;
    comments?: number;
    contentType?: ContentType;
    bounceRate?: number;
    views?: number;
    previews?: number;
    conversionRate?: number;
    likes?: number;
    shares?: number;
    contentId?: string;
    uniqueViews?: number;
    purchases?: number;
    dislikes?: number;
    averageViewDuration?: number;
    topCountries?: Record<string, number>;
    topCities?: Record<string, number>;
    deviceTypes?: Record<string, number>;
    referralSources?: Record<string, number>;
    searchKeywords?: Record<string, number>;
}, {
    id?: string;
    date?: Date;
    bookmarks?: number;
    comments?: number;
    contentType?: ContentType;
    bounceRate?: number;
    views?: number;
    previews?: number;
    conversionRate?: number;
    likes?: number;
    shares?: number;
    contentId?: string;
    uniqueViews?: number;
    purchases?: number;
    dislikes?: number;
    averageViewDuration?: number;
    topCountries?: Record<string, number>;
    topCities?: Record<string, number>;
    deviceTypes?: Record<string, number>;
    referralSources?: Record<string, number>;
    searchKeywords?: Record<string, number>;
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
        position?: number;
        contentType?: ContentType;
        contentId?: string;
        clickedAt?: Date;
    }, {
        position?: number;
        contentType?: ContentType;
        contentId?: string;
        clickedAt?: Date;
    }>, "many">>;
    sessionId: z.ZodOptional<z.ZodString>;
    referrer: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    responseTime: z.ZodOptional<z.ZodNumber>;
    source: z.ZodDefault<z.ZodEnum<["web", "mobile", "api"]>>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    source?: "mobile" | "web" | "api";
    userId?: string;
    sessionId?: string;
    filters?: Record<string, any>;
    userAgent?: string;
    query?: string;
    responseTime?: number;
    referrer?: string;
    normalizedQuery?: string;
    resultsCount?: number;
    clickedResults?: {
        position?: number;
        contentType?: ContentType;
        contentId?: string;
        clickedAt?: Date;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    source?: "mobile" | "web" | "api";
    userId?: string;
    sessionId?: string;
    filters?: Record<string, any>;
    userAgent?: string;
    query?: string;
    responseTime?: number;
    referrer?: string;
    normalizedQuery?: string;
    resultsCount?: number;
    clickedResults?: {
        position?: number;
        contentType?: ContentType;
        contentId?: string;
        clickedAt?: Date;
    }[];
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
        note?: string;
        order?: number;
        contentType?: ContentType;
        contentId?: string;
        addedAt?: Date;
    }, {
        note?: string;
        order?: number;
        contentType?: ContentType;
        contentId?: string;
        addedAt?: Date;
    }>, "many">>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodEnum<["viewer", "editor", "admin"]>;
        addedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        userId?: string;
        role?: "admin" | "editor" | "viewer";
        addedAt?: Date;
    }, {
        userId?: string;
        role?: "admin" | "editor" | "viewer";
        addedAt?: Date;
    }>, "many">>;
    followers: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    views: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    items?: {
        note?: string;
        order?: number;
        contentType?: ContentType;
        contentId?: string;
        addedAt?: Date;
    }[];
    isPublic?: boolean;
    views?: number;
    likes?: number;
    collaborators?: {
        userId?: string;
        role?: "admin" | "editor" | "viewer";
        addedAt?: Date;
    }[];
    thumbnailUrl?: string;
    ownerId?: string;
    isFeatured?: boolean;
    allowCollaborators?: boolean;
    followers?: number;
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    items?: {
        note?: string;
        order?: number;
        contentType?: ContentType;
        contentId?: string;
        addedAt?: Date;
    }[];
    isPublic?: boolean;
    views?: number;
    likes?: number;
    collaborators?: {
        userId?: string;
        role?: "admin" | "editor" | "viewer";
        addedAt?: Date;
    }[];
    thumbnailUrl?: string;
    ownerId?: string;
    isFeatured?: boolean;
    allowCollaborators?: boolean;
    followers?: number;
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
    id?: string;
    createdAt?: Date;
    priority?: "low" | "high" | "normal" | "urgent";
    data?: Record<string, any>;
    message?: string;
    type?: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
    title?: string;
    userId?: string;
    read?: boolean;
    channels?: ("push" | "email" | "sms" | "in_app")[];
    sentAt?: Date;
    readAt?: Date;
    actionUrl?: string;
    deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered">;
    scheduledFor?: Date;
}, {
    id?: string;
    createdAt?: Date;
    priority?: "low" | "high" | "normal" | "urgent";
    data?: Record<string, any>;
    message?: string;
    type?: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
    title?: string;
    userId?: string;
    read?: boolean;
    channels?: ("push" | "email" | "sms" | "in_app")[];
    sentAt?: Date;
    readAt?: Date;
    actionUrl?: string;
    deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered">;
    scheduledFor?: Date;
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
            emailNotifications?: boolean;
            marketingEmails?: boolean;
            publicProfile?: boolean;
            showPurchases?: boolean;
        }, {
            emailNotifications?: boolean;
            marketingEmails?: boolean;
            publicProfile?: boolean;
            showPurchases?: boolean;
        }>>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
        lastActive: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        location?: string;
        userId?: string;
        displayName?: string;
        preferences?: {
            emailNotifications?: boolean;
            marketingEmails?: boolean;
            publicProfile?: boolean;
            showPurchases?: boolean;
        };
        website?: string;
        helpfulVotes?: number;
        avatar?: string;
        bio?: string;
        badges?: string[];
        isCreator?: boolean;
        averageRating?: number;
        socialLinks?: Record<string, string>;
        templatesCreated?: number;
        forumPosts?: number;
        creatorTier?: "expert" | "pro" | "starter";
        verifiedCreator?: boolean;
        totalSales?: number;
        totalReviews?: number;
        reputation?: number;
        lastActive?: Date;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        location?: string;
        userId?: string;
        displayName?: string;
        preferences?: {
            emailNotifications?: boolean;
            marketingEmails?: boolean;
            publicProfile?: boolean;
            showPurchases?: boolean;
        };
        website?: string;
        helpfulVotes?: number;
        avatar?: string;
        bio?: string;
        badges?: string[];
        isCreator?: boolean;
        averageRating?: number;
        socialLinks?: Record<string, string>;
        templatesCreated?: number;
        forumPosts?: number;
        creatorTier?: "expert" | "pro" | "starter";
        verifiedCreator?: boolean;
        totalSales?: number;
        totalReviews?: number;
        reputation?: number;
        lastActive?: Date;
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
            avgRating?: number;
            views?: number;
            downloads?: number;
            likes?: number;
            purchases?: number;
            forks?: number;
            ratingCount?: number;
        }, {
            avgRating?: number;
            views?: number;
            downloads?: number;
            likes?: number;
            purchases?: number;
            forks?: number;
            ratingCount?: number;
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
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: TemplateStatus;
        category?: string;
        tags?: string[];
        title?: string;
        complexity?: "advanced" | "intermediate" | "beginner";
        featured?: boolean;
        stats?: {
            avgRating?: number;
            views?: number;
            downloads?: number;
            likes?: number;
            purchases?: number;
            forks?: number;
            ratingCount?: number;
        };
        currency?: string;
        subcategory?: string;
        publishedAt?: Date;
        thumbnailUrl?: string;
        featuredAt?: Date;
        metaDescription?: string;
        currentVersionId?: string;
        isAiGenerated?: boolean;
        ownerId?: string;
        shortDescription?: string;
        priceCents?: number;
        claudeCompatibility?: string[];
        estimatedTokens?: number;
        previewImages?: string[];
        demoVideo?: string;
        promoted?: boolean;
        seoKeywords?: string[];
        versionCount?: number;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: TemplateStatus;
        category?: string;
        tags?: string[];
        title?: string;
        complexity?: "advanced" | "intermediate" | "beginner";
        featured?: boolean;
        stats?: {
            avgRating?: number;
            views?: number;
            downloads?: number;
            likes?: number;
            purchases?: number;
            forks?: number;
            ratingCount?: number;
        };
        currency?: string;
        subcategory?: string;
        publishedAt?: Date;
        thumbnailUrl?: string;
        featuredAt?: Date;
        metaDescription?: string;
        currentVersionId?: string;
        isAiGenerated?: boolean;
        ownerId?: string;
        shortDescription?: string;
        priceCents?: number;
        claudeCompatibility?: string[];
        estimatedTokens?: number;
        previewImages?: string[];
        demoVideo?: string;
        promoted?: boolean;
        seoKeywords?: string[];
        versionCount?: number;
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
            input?: string;
            title?: string;
            expectedOutput?: string;
        }, {
            input?: string;
            title?: string;
            expectedOutput?: string;
        }>, "many">>;
        hash: z.ZodString;
        tokenPerRunEstimate: z.ZodNumber;
        safetyScore: z.ZodNumber;
        testResults: z.ZodOptional<z.ZodObject<{
            passed: z.ZodNumber;
            failed: z.ZodNumber;
            coverage: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            failed?: number;
            passed?: number;
            coverage?: number;
        }, {
            failed?: number;
            passed?: number;
            coverage?: number;
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
            name?: string;
            size?: number;
            type?: string;
            url?: string;
        }, {
            name?: string;
            size?: number;
            type?: string;
            url?: string;
        }>, "many">>;
        createdAt: z.ZodDate;
        publishedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        hash?: string;
        successRate?: number;
        examples?: {
            input?: string;
            title?: string;
            expectedOutput?: string;
        }[];
        documentation?: string;
        assets?: {
            name?: string;
            size?: number;
            type?: string;
            url?: string;
        }[];
        changelog?: string;
        isPublic?: boolean;
        testResults?: {
            failed?: number;
            passed?: number;
            coverage?: number;
        };
        templateId?: string;
        safetyScore?: number;
        publishedAt?: Date;
        graphJson?: string;
        promptYaml?: string;
        claudeModel?: string;
        versionNumber?: string;
        versionName?: string;
        tokenPerRunEstimate?: number;
        avgExecutionTime?: number;
        releaseNotes?: string;
    }, {
        id?: string;
        createdAt?: Date;
        hash?: string;
        successRate?: number;
        examples?: {
            input?: string;
            title?: string;
            expectedOutput?: string;
        }[];
        documentation?: string;
        assets?: {
            name?: string;
            size?: number;
            type?: string;
            url?: string;
        }[];
        changelog?: string;
        isPublic?: boolean;
        testResults?: {
            failed?: number;
            passed?: number;
            coverage?: number;
        };
        templateId?: string;
        safetyScore?: number;
        publishedAt?: Date;
        graphJson?: string;
        promptYaml?: string;
        claudeModel?: string;
        versionNumber?: string;
        versionName?: string;
        tokenPerRunEstimate?: number;
        avgExecutionTime?: number;
        releaseNotes?: string;
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
        id?: string;
        createdAt?: Date;
        status?: PurchaseStatus;
        amount?: number;
        currency?: string;
        transactionId?: string;
        paymentMethod?: string;
        templateId?: string;
        licenseType?: "personal" | "enterprise" | "commercial";
        versionId?: string;
        completedAt?: Date;
        buyerId?: string;
        downloadCount?: number;
        stripePaymentIntentId?: string;
        refundReason?: RefundReason;
        refundAmount?: number;
        licenseTerms?: string;
        lastDownloaded?: Date;
        supportTicketId?: string;
        satisfactionRating?: number;
        satisfactionFeedback?: string;
        refundedAt?: Date;
    }, {
        id?: string;
        createdAt?: Date;
        status?: PurchaseStatus;
        amount?: number;
        currency?: string;
        transactionId?: string;
        paymentMethod?: string;
        templateId?: string;
        licenseType?: "personal" | "enterprise" | "commercial";
        versionId?: string;
        completedAt?: Date;
        buyerId?: string;
        downloadCount?: number;
        stripePaymentIntentId?: string;
        refundReason?: RefundReason;
        refundAmount?: number;
        licenseTerms?: string;
        lastDownloaded?: Date;
        supportTicketId?: string;
        satisfactionRating?: number;
        satisfactionFeedback?: string;
        refundedAt?: Date;
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
            performance?: number;
            documentation?: number;
            support?: number;
            easeOfUse?: number;
            valueForMoney?: number;
        }, {
            performance?: number;
            documentation?: number;
            support?: number;
            easeOfUse?: number;
            valueForMoney?: number;
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
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        title?: string;
        rating?: number;
        comment?: string;
        templateId?: string;
        flagged?: boolean;
        helpfulVotes?: number;
        buyerId?: string;
        helpfulnessScore?: number;
        purchaseId?: string;
        aspects?: {
            performance?: number;
            documentation?: number;
            support?: number;
            easeOfUse?: number;
            valueForMoney?: number;
        };
        sentimentAi?: "positive" | "neutral" | "negative";
        verifiedPurchase?: boolean;
        unhelpfulVotes?: number;
        creatorResponse?: string;
        creatorResponseAt?: Date;
        flagReason?: string;
        moderatedBy?: string;
        moderatedAt?: Date;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        title?: string;
        rating?: number;
        comment?: string;
        templateId?: string;
        flagged?: boolean;
        helpfulVotes?: number;
        buyerId?: string;
        helpfulnessScore?: number;
        purchaseId?: string;
        aspects?: {
            performance?: number;
            documentation?: number;
            support?: number;
            easeOfUse?: number;
            valueForMoney?: number;
        };
        sentimentAi?: "positive" | "neutral" | "negative";
        verifiedPurchase?: boolean;
        unhelpfulVotes?: number;
        creatorResponse?: string;
        creatorResponseAt?: Date;
        flagReason?: string;
        moderatedBy?: string;
        moderatedAt?: Date;
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
            id?: string;
            name?: string;
            size?: number;
            url?: string;
            mimeType?: string;
        }, {
            id?: string;
            name?: string;
            size?: number;
            url?: string;
            mimeType?: string;
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
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        status?: PostStatus;
        type?: ForumPostType;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        parentId?: string;
        bookmarks?: number;
        authorId?: string;
        isLocked?: boolean;
        views?: number;
        likes?: number;
        shares?: number;
        slug?: string;
        allowComments?: boolean;
        isPinned?: boolean;
        replies?: number;
        threadId?: string;
        attachments?: {
            id?: string;
            name?: string;
            size?: number;
            url?: string;
            mimeType?: string;
        }[];
        excerpt?: string;
        replyCount?: number;
        lastActivity?: Date;
        moderatedBy?: string;
        moderatedAt?: Date;
        contentHtml?: string;
        isFeatured?: boolean;
        moderationReason?: string;
        dislikes?: number;
        relatedTemplateIds?: string[];
        relatedPostIds?: string[];
        lastReplyAt?: Date;
        lastReplyBy?: string;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        status?: PostStatus;
        type?: ForumPostType;
        category?: string;
        tags?: string[];
        content?: string;
        title?: string;
        parentId?: string;
        bookmarks?: number;
        authorId?: string;
        isLocked?: boolean;
        views?: number;
        likes?: number;
        shares?: number;
        slug?: string;
        allowComments?: boolean;
        isPinned?: boolean;
        replies?: number;
        threadId?: string;
        attachments?: {
            id?: string;
            name?: string;
            size?: number;
            url?: string;
            mimeType?: string;
        }[];
        excerpt?: string;
        replyCount?: number;
        lastActivity?: Date;
        moderatedBy?: string;
        moderatedAt?: Date;
        contentHtml?: string;
        isFeatured?: boolean;
        moderationReason?: string;
        dislikes?: number;
        relatedTemplateIds?: string[];
        relatedPostIds?: string[];
        lastReplyAt?: Date;
        lastReplyBy?: string;
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
            id?: string;
            anchor?: string;
            title?: string;
            level?: number;
        }, {
            id?: string;
            anchor?: string;
            title?: string;
            level?: number;
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
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        status?: "draft" | "published" | "archived" | "under_review";
        category?: string;
        tags?: string[];
        version?: string;
        content?: string;
        title?: string;
        bookmarks?: number;
        authorId?: string;
        keywords?: string[];
        featured?: boolean;
        views?: number;
        likes?: number;
        subcategory?: string;
        difficulty?: "advanced" | "intermediate" | "beginner";
        publishedAt?: Date;
        helpfulVotes?: number;
        slug?: string;
        metaDescription?: string;
        excerpt?: string;
        contentHtml?: string;
        relatedTemplateIds?: string[];
        tableOfContents?: {
            id?: string;
            anchor?: string;
            title?: string;
            level?: number;
        }[];
        previousVersionId?: string;
        relatedArticleIds?: string[];
        lastReviewed?: Date;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        status?: "draft" | "published" | "archived" | "under_review";
        category?: string;
        tags?: string[];
        version?: string;
        content?: string;
        title?: string;
        bookmarks?: number;
        authorId?: string;
        keywords?: string[];
        featured?: boolean;
        views?: number;
        likes?: number;
        subcategory?: string;
        difficulty?: "advanced" | "intermediate" | "beginner";
        publishedAt?: Date;
        helpfulVotes?: number;
        slug?: string;
        metaDescription?: string;
        excerpt?: string;
        contentHtml?: string;
        relatedTemplateIds?: string[];
        tableOfContents?: {
            id?: string;
            anchor?: string;
            title?: string;
            level?: number;
        }[];
        previousVersionId?: string;
        relatedArticleIds?: string[];
        lastReviewed?: Date;
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
                name?: string;
                type?: "external" | "template" | "article" | "video" | "download";
                url?: string;
            }, {
                name?: string;
                type?: "external" | "template" | "article" | "video" | "download";
                url?: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            content?: string;
            title?: string;
            resources?: {
                name?: string;
                type?: "external" | "template" | "article" | "video" | "download";
                url?: string;
            }[];
            order?: number;
            estimatedDuration?: number;
        }, {
            id?: string;
            content?: string;
            title?: string;
            resources?: {
                name?: string;
                type?: "external" | "template" | "article" | "video" | "download";
                url?: string;
            }[];
            order?: number;
            estimatedDuration?: number;
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
            name?: string;
            description?: string;
            url?: string;
        }, {
            name?: string;
            description?: string;
            url?: string;
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
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "draft" | "published" | "archived";
        category?: string;
        title?: string;
        steps?: {
            id?: string;
            content?: string;
            title?: string;
            resources?: {
                name?: string;
                type?: "external" | "template" | "article" | "video" | "download";
                url?: string;
            }[];
            order?: number;
            estimatedDuration?: number;
        }[];
        authorId?: string;
        assets?: {
            name?: string;
            description?: string;
            url?: string;
        }[];
        featured?: boolean;
        views?: number;
        videoUrl?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "intermediate" | "beginner";
        publishedAt?: Date;
        thumbnailUrl?: string;
        estimatedDuration?: number;
        averageRating?: number;
        shortDescription?: string;
        ratingCount?: number;
        learningOutcomes?: string[];
        hasQuiz?: boolean;
        hasExercises?: boolean;
        hasCertificate?: boolean;
        completions?: number;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        description?: string;
        status?: "draft" | "published" | "archived";
        category?: string;
        title?: string;
        steps?: {
            id?: string;
            content?: string;
            title?: string;
            resources?: {
                name?: string;
                type?: "external" | "template" | "article" | "video" | "download";
                url?: string;
            }[];
            order?: number;
            estimatedDuration?: number;
        }[];
        authorId?: string;
        assets?: {
            name?: string;
            description?: string;
            url?: string;
        }[];
        featured?: boolean;
        views?: number;
        videoUrl?: string;
        prerequisites?: string[];
        difficulty?: "advanced" | "intermediate" | "beginner";
        publishedAt?: Date;
        thumbnailUrl?: string;
        estimatedDuration?: number;
        averageRating?: number;
        shortDescription?: string;
        ratingCount?: number;
        learningOutcomes?: string[];
        hasQuiz?: boolean;
        hasExercises?: boolean;
        hasCertificate?: boolean;
        completions?: number;
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
        id?: string;
        date?: Date;
        userId?: string;
        pageViews?: number;
        templatesViewed?: number;
        templatesCreated?: number;
        templatesDownloaded?: number;
        sessionsCount?: number;
        totalDuration?: number;
        templatesLiked?: number;
        templatesPurchased?: number;
        postsCreated?: number;
        postsViewed?: number;
        commentsPosted?: number;
        votesGiven?: number;
        tutorialsStarted?: number;
        tutorialsCompleted?: number;
        articlesRead?: number;
        templatesUpdated?: number;
        salesGenerated?: number;
        reviewsReceived?: number;
    }, {
        id?: string;
        date?: Date;
        userId?: string;
        pageViews?: number;
        templatesViewed?: number;
        templatesCreated?: number;
        templatesDownloaded?: number;
        sessionsCount?: number;
        totalDuration?: number;
        templatesLiked?: number;
        templatesPurchased?: number;
        postsCreated?: number;
        postsViewed?: number;
        commentsPosted?: number;
        votesGiven?: number;
        tutorialsStarted?: number;
        tutorialsCompleted?: number;
        articlesRead?: number;
        templatesUpdated?: number;
        salesGenerated?: number;
        reviewsReceived?: number;
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
        id?: string;
        date?: Date;
        bookmarks?: number;
        comments?: number;
        contentType?: ContentType;
        bounceRate?: number;
        views?: number;
        previews?: number;
        conversionRate?: number;
        likes?: number;
        shares?: number;
        contentId?: string;
        uniqueViews?: number;
        purchases?: number;
        dislikes?: number;
        averageViewDuration?: number;
        topCountries?: Record<string, number>;
        topCities?: Record<string, number>;
        deviceTypes?: Record<string, number>;
        referralSources?: Record<string, number>;
        searchKeywords?: Record<string, number>;
    }, {
        id?: string;
        date?: Date;
        bookmarks?: number;
        comments?: number;
        contentType?: ContentType;
        bounceRate?: number;
        views?: number;
        previews?: number;
        conversionRate?: number;
        likes?: number;
        shares?: number;
        contentId?: string;
        uniqueViews?: number;
        purchases?: number;
        dislikes?: number;
        averageViewDuration?: number;
        topCountries?: Record<string, number>;
        topCities?: Record<string, number>;
        deviceTypes?: Record<string, number>;
        referralSources?: Record<string, number>;
        searchKeywords?: Record<string, number>;
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
            position?: number;
            contentType?: ContentType;
            contentId?: string;
            clickedAt?: Date;
        }, {
            position?: number;
            contentType?: ContentType;
            contentId?: string;
            clickedAt?: Date;
        }>, "many">>;
        sessionId: z.ZodOptional<z.ZodString>;
        referrer: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        responseTime: z.ZodOptional<z.ZodNumber>;
        source: z.ZodDefault<z.ZodEnum<["web", "mobile", "api"]>>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        source?: "mobile" | "web" | "api";
        userId?: string;
        sessionId?: string;
        filters?: Record<string, any>;
        userAgent?: string;
        query?: string;
        responseTime?: number;
        referrer?: string;
        normalizedQuery?: string;
        resultsCount?: number;
        clickedResults?: {
            position?: number;
            contentType?: ContentType;
            contentId?: string;
            clickedAt?: Date;
        }[];
    }, {
        id?: string;
        createdAt?: Date;
        source?: "mobile" | "web" | "api";
        userId?: string;
        sessionId?: string;
        filters?: Record<string, any>;
        userAgent?: string;
        query?: string;
        responseTime?: number;
        referrer?: string;
        normalizedQuery?: string;
        resultsCount?: number;
        clickedResults?: {
            position?: number;
            contentType?: ContentType;
            contentId?: string;
            clickedAt?: Date;
        }[];
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
            note?: string;
            order?: number;
            contentType?: ContentType;
            contentId?: string;
            addedAt?: Date;
        }, {
            note?: string;
            order?: number;
            contentType?: ContentType;
            contentId?: string;
            addedAt?: Date;
        }>, "many">>;
        category: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        collaborators: z.ZodDefault<z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            role: z.ZodEnum<["viewer", "editor", "admin"]>;
            addedAt: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            userId?: string;
            role?: "admin" | "editor" | "viewer";
            addedAt?: Date;
        }, {
            userId?: string;
            role?: "admin" | "editor" | "viewer";
            addedAt?: Date;
        }>, "many">>;
        followers: z.ZodDefault<z.ZodNumber>;
        likes: z.ZodDefault<z.ZodNumber>;
        views: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        category?: string;
        tags?: string[];
        items?: {
            note?: string;
            order?: number;
            contentType?: ContentType;
            contentId?: string;
            addedAt?: Date;
        }[];
        isPublic?: boolean;
        views?: number;
        likes?: number;
        collaborators?: {
            userId?: string;
            role?: "admin" | "editor" | "viewer";
            addedAt?: Date;
        }[];
        thumbnailUrl?: string;
        ownerId?: string;
        isFeatured?: boolean;
        allowCollaborators?: boolean;
        followers?: number;
    }, {
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        name?: string;
        description?: string;
        category?: string;
        tags?: string[];
        items?: {
            note?: string;
            order?: number;
            contentType?: ContentType;
            contentId?: string;
            addedAt?: Date;
        }[];
        isPublic?: boolean;
        views?: number;
        likes?: number;
        collaborators?: {
            userId?: string;
            role?: "admin" | "editor" | "viewer";
            addedAt?: Date;
        }[];
        thumbnailUrl?: string;
        ownerId?: string;
        isFeatured?: boolean;
        allowCollaborators?: boolean;
        followers?: number;
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
        id?: string;
        createdAt?: Date;
        priority?: "low" | "high" | "normal" | "urgent";
        data?: Record<string, any>;
        message?: string;
        type?: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
        title?: string;
        userId?: string;
        read?: boolean;
        channels?: ("push" | "email" | "sms" | "in_app")[];
        sentAt?: Date;
        readAt?: Date;
        actionUrl?: string;
        deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered">;
        scheduledFor?: Date;
    }, {
        id?: string;
        createdAt?: Date;
        priority?: "low" | "high" | "normal" | "urgent";
        data?: Record<string, any>;
        message?: string;
        type?: "template_purchased" | "template_published" | "template_reviewed" | "post_replied" | "post_liked" | "comment_replied" | "follower_added" | "collection_shared" | "system_announcement" | "moderation_action";
        title?: string;
        userId?: string;
        read?: boolean;
        channels?: ("push" | "email" | "sms" | "in_app")[];
        sentAt?: Date;
        readAt?: Date;
        actionUrl?: string;
        deliveryStatus?: Record<string, "pending" | "failed" | "sent" | "delivered">;
        scheduledFor?: Date;
    }>;
};
export declare function validateContentModel<T extends keyof Epic16ContentModel>(
  type: T,
  data: unknown
): Epic16ContentModel[T];
export declare function isValidContentModel<T extends keyof Epic16ContentModel>(
  type: T,
  data: unknown
): data is Epic16ContentModel[T];
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