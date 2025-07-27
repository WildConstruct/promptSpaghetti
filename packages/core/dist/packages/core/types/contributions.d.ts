/**
 * Epic 16 Contribution Data Model
 * Task: E16-1753114247117-36F668 - Create contribution data model
 *
 * Comprehensive data types for all Epic 16 contribution types including
 * templates, knowledge base articles, case studies, and community content.
 */
import { z } from 'zod';
export declare const ContributionTypeSchema: z.ZodEnum<["template", "knowledge_article", "tutorial", "case_study", "pattern_library", "community_post", "documentation", "review"]>;
export declare const ContributionStatusSchema: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
export declare const ContributionQualityRatingSchema: z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>;
export declare const ContributorLevelSchema: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
export declare const BaseContributionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["template", "knowledge_article", "tutorial", "case_study", "pattern_library", "community_post", "documentation", "review"]>;
    contributorId: z.ZodString;
    contributorName: z.ZodString;
    contributorLevel: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    title: z.ZodString;
    description: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    content: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "code", "graph"]>;
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }>, "many">>;
    status: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
    submittedAt: z.ZodDate;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    publishedAt: z.ZodOptional<z.ZodDate>;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moderatorId: z.ZodString;
        moderatorName: z.ZodString;
        reason: z.ZodString;
        details: z.ZodString;
        requestedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }>, "many">>;
    views: z.ZodDefault<z.ZodNumber>;
    downloads: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
    versionHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        changes: z.ZodString;
        changedAt: z.ZodDate;
        changedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "template" | "documentation" | "tutorial" | "review" | "knowledge_article" | "community_post" | "case_study" | "pattern_library";
    category?: string;
    tags?: string[];
    version?: string;
    content?: Record<string, unknown>;
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "template" | "documentation" | "tutorial" | "review" | "knowledge_article" | "community_post" | "case_study" | "pattern_library";
    category?: string;
    tags?: string[];
    version?: string;
    content?: Record<string, unknown>;
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}>;
export declare const TemplateContributionSchema: z.ZodObject<{
    id: z.ZodString;
    contributorId: z.ZodString;
    contributorName: z.ZodString;
    contributorLevel: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    title: z.ZodString;
    description: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "code", "graph"]>;
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }>, "many">>;
    status: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
    submittedAt: z.ZodDate;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    publishedAt: z.ZodOptional<z.ZodDate>;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moderatorId: z.ZodString;
        moderatorName: z.ZodString;
        reason: z.ZodString;
        details: z.ZodString;
        requestedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }>, "many">>;
    views: z.ZodDefault<z.ZodNumber>;
    downloads: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
    versionHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        changes: z.ZodString;
        changedAt: z.ZodDate;
        changedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    type: z.ZodLiteral<"template">;
    content: z.ZodObject<{
        graphJson: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        promptYaml: z.ZodOptional<z.ZodString>;
        claudeModel: z.ZodDefault<z.ZodString>;
        tokenEstimate: z.ZodDefault<z.ZodNumber>;
        safetyScore: z.ZodDefault<z.ZodNumber>;
        testCases: z.ZodDefault<z.ZodArray<z.ZodObject<{
            input: z.ZodString;
            expectedOutput: z.ZodString;
            actualOutput: z.ZodOptional<z.ZodString>;
            passed: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            input?: string;
            passed?: boolean;
            expectedOutput?: string;
            actualOutput?: string;
        }, {
            input?: string;
            passed?: boolean;
            expectedOutput?: string;
            actualOutput?: string;
        }>, "many">>;
        pricing: z.ZodObject<{
            type: z.ZodEnum<["free", "paid"]>;
            priceInCents: z.ZodOptional<z.ZodNumber>;
            currency: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type?: "free" | "paid";
            currency?: string;
            priceInCents?: number;
        }, {
            type?: "free" | "paid";
            currency?: string;
            priceInCents?: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        pricing?: {
            type?: "free" | "paid";
            currency?: string;
            priceInCents?: number;
        };
        safetyScore?: number;
        graphJson?: Record<string, unknown>;
        promptYaml?: string;
        claudeModel?: string;
        tokenEstimate?: number;
        testCases?: {
            input?: string;
            passed?: boolean;
            expectedOutput?: string;
            actualOutput?: string;
        }[];
    }, {
        pricing?: {
            type?: "free" | "paid";
            currency?: string;
            priceInCents?: number;
        };
        safetyScore?: number;
        graphJson?: Record<string, unknown>;
        promptYaml?: string;
        claudeModel?: string;
        tokenEstimate?: number;
        testCases?: {
            input?: string;
            passed?: boolean;
            expectedOutput?: string;
            actualOutput?: string;
        }[];
    }>;
    marketplace: z.ZodOptional<z.ZodObject<{
        isListed: z.ZodDefault<z.ZodBoolean>;
        listedAt: z.ZodOptional<z.ZodDate>;
        salesCount: z.ZodDefault<z.ZodNumber>;
        revenue: z.ZodDefault<z.ZodNumber>;
        avgRating: z.ZodDefault<z.ZodNumber>;
        reviewCount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        avgRating?: number;
        revenue?: number;
        isListed?: boolean;
        listedAt?: Date;
        salesCount?: number;
        reviewCount?: number;
    }, {
        avgRating?: number;
        revenue?: number;
        isListed?: boolean;
        listedAt?: Date;
        salesCount?: number;
        reviewCount?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "template";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        pricing?: {
            type?: "free" | "paid";
            currency?: string;
            priceInCents?: number;
        };
        safetyScore?: number;
        graphJson?: Record<string, unknown>;
        promptYaml?: string;
        claudeModel?: string;
        tokenEstimate?: number;
        testCases?: {
            input?: string;
            passed?: boolean;
            expectedOutput?: string;
            actualOutput?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    marketplace?: {
        avgRating?: number;
        revenue?: number;
        isListed?: boolean;
        listedAt?: Date;
        salesCount?: number;
        reviewCount?: number;
    };
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "template";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        pricing?: {
            type?: "free" | "paid";
            currency?: string;
            priceInCents?: number;
        };
        safetyScore?: number;
        graphJson?: Record<string, unknown>;
        promptYaml?: string;
        claudeModel?: string;
        tokenEstimate?: number;
        testCases?: {
            input?: string;
            passed?: boolean;
            expectedOutput?: string;
            actualOutput?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    marketplace?: {
        avgRating?: number;
        revenue?: number;
        isListed?: boolean;
        listedAt?: Date;
        salesCount?: number;
        reviewCount?: number;
    };
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}>;
export declare const KnowledgeArticleContributionSchema: z.ZodObject<{
    id: z.ZodString;
    contributorId: z.ZodString;
    contributorName: z.ZodString;
    contributorLevel: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    title: z.ZodString;
    description: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "code", "graph"]>;
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }>, "many">>;
    status: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
    submittedAt: z.ZodDate;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    publishedAt: z.ZodOptional<z.ZodDate>;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moderatorId: z.ZodString;
        moderatorName: z.ZodString;
        reason: z.ZodString;
        details: z.ZodString;
        requestedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }>, "many">>;
    views: z.ZodDefault<z.ZodNumber>;
    downloads: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
    versionHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        changes: z.ZodString;
        changedAt: z.ZodDate;
        changedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    type: z.ZodLiteral<"knowledge_article">;
    content: z.ZodObject<{
        articleType: z.ZodEnum<["guide", "tutorial", "reference", "faq", "troubleshooting"]>;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
        estimatedReadTime: z.ZodNumber;
        prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        learningObjectives: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        sections: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            content: z.ZodString;
            order: z.ZodNumber;
            type: z.ZodEnum<["text", "code", "image", "video", "interactive"]>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            type?: "code" | "text" | "video" | "image" | "interactive";
            content?: string;
            title?: string;
            order?: number;
        }, {
            id?: string;
            type?: "code" | "text" | "video" | "image" | "interactive";
            content?: string;
            title?: string;
            order?: number;
        }>, "many">;
        codeExamples: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            language: z.ZodString;
            code: z.ZodString;
            description: z.ZodString;
            runnable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            code?: string;
            language?: string;
            runnable?: boolean;
        }, {
            id?: string;
            description?: string;
            code?: string;
            language?: string;
            runnable?: boolean;
        }>, "many">>;
        keywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        relatedArticles: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        externalLinks: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            url: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            title?: string;
            url?: string;
        }, {
            description?: string;
            title?: string;
            url?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        keywords?: string[];
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        articleType?: "tutorial" | "reference" | "troubleshooting" | "guide" | "faq";
        estimatedReadTime?: number;
        learningObjectives?: string[];
        sections?: {
            id?: string;
            type?: "code" | "text" | "video" | "image" | "interactive";
            content?: string;
            title?: string;
            order?: number;
        }[];
        codeExamples?: {
            id?: string;
            description?: string;
            code?: string;
            language?: string;
            runnable?: boolean;
        }[];
        relatedArticles?: string[];
        externalLinks?: {
            description?: string;
            title?: string;
            url?: string;
        }[];
    }, {
        keywords?: string[];
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        articleType?: "tutorial" | "reference" | "troubleshooting" | "guide" | "faq";
        estimatedReadTime?: number;
        learningObjectives?: string[];
        sections?: {
            id?: string;
            type?: "code" | "text" | "video" | "image" | "interactive";
            content?: string;
            title?: string;
            order?: number;
        }[];
        codeExamples?: {
            id?: string;
            description?: string;
            code?: string;
            language?: string;
            runnable?: boolean;
        }[];
        relatedArticles?: string[];
        externalLinks?: {
            description?: string;
            title?: string;
            url?: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "knowledge_article";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        keywords?: string[];
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        articleType?: "tutorial" | "reference" | "troubleshooting" | "guide" | "faq";
        estimatedReadTime?: number;
        learningObjectives?: string[];
        sections?: {
            id?: string;
            type?: "code" | "text" | "video" | "image" | "interactive";
            content?: string;
            title?: string;
            order?: number;
        }[];
        codeExamples?: {
            id?: string;
            description?: string;
            code?: string;
            language?: string;
            runnable?: boolean;
        }[];
        relatedArticles?: string[];
        externalLinks?: {
            description?: string;
            title?: string;
            url?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "knowledge_article";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        keywords?: string[];
        prerequisites?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        articleType?: "tutorial" | "reference" | "troubleshooting" | "guide" | "faq";
        estimatedReadTime?: number;
        learningObjectives?: string[];
        sections?: {
            id?: string;
            type?: "code" | "text" | "video" | "image" | "interactive";
            content?: string;
            title?: string;
            order?: number;
        }[];
        codeExamples?: {
            id?: string;
            description?: string;
            code?: string;
            language?: string;
            runnable?: boolean;
        }[];
        relatedArticles?: string[];
        externalLinks?: {
            description?: string;
            title?: string;
            url?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}>;
export declare const TutorialContributionSchema: z.ZodObject<{
    id: z.ZodString;
    contributorId: z.ZodString;
    contributorName: z.ZodString;
    contributorLevel: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    title: z.ZodString;
    description: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "code", "graph"]>;
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }>, "many">>;
    status: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
    submittedAt: z.ZodDate;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    publishedAt: z.ZodOptional<z.ZodDate>;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moderatorId: z.ZodString;
        moderatorName: z.ZodString;
        reason: z.ZodString;
        details: z.ZodString;
        requestedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }>, "many">>;
    views: z.ZodDefault<z.ZodNumber>;
    downloads: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
    versionHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        changes: z.ZodString;
        changedAt: z.ZodDate;
        changedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    type: z.ZodLiteral<"tutorial">;
    content: z.ZodObject<{
        tutorialType: z.ZodEnum<["step_by_step", "video", "interactive", "workshop"]>;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
        estimatedDuration: z.ZodNumber;
        prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        steps: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            content: z.ZodString;
            order: z.ZodNumber;
            estimatedTime: z.ZodNumber;
            assets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            checkpoints: z.ZodDefault<z.ZodArray<z.ZodObject<{
                description: z.ZodString;
                validation: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                validation?: string;
            }, {
                description?: string;
                validation?: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            content?: string;
            title?: string;
            order?: number;
            assets?: string[];
            estimatedTime?: number;
            checkpoints?: {
                description?: string;
                validation?: string;
            }[];
        }, {
            id?: string;
            description?: string;
            content?: string;
            title?: string;
            order?: number;
            assets?: string[];
            estimatedTime?: number;
            checkpoints?: {
                description?: string;
                validation?: string;
            }[];
        }>, "many">;
        deliverables: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        skillsLearned: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        downloadableResources: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodString;
            url: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            description?: string;
            type?: string;
            url?: string;
        }, {
            name?: string;
            description?: string;
            type?: string;
            url?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        steps?: {
            id?: string;
            description?: string;
            content?: string;
            title?: string;
            order?: number;
            assets?: string[];
            estimatedTime?: number;
            checkpoints?: {
                description?: string;
                validation?: string;
            }[];
        }[];
        tools?: string[];
        prerequisites?: string[];
        deliverables?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        tutorialType?: "video" | "interactive" | "workshop" | "step_by_step";
        estimatedDuration?: number;
        skillsLearned?: string[];
        downloadableResources?: {
            name?: string;
            description?: string;
            type?: string;
            url?: string;
        }[];
    }, {
        steps?: {
            id?: string;
            description?: string;
            content?: string;
            title?: string;
            order?: number;
            assets?: string[];
            estimatedTime?: number;
            checkpoints?: {
                description?: string;
                validation?: string;
            }[];
        }[];
        tools?: string[];
        prerequisites?: string[];
        deliverables?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        tutorialType?: "video" | "interactive" | "workshop" | "step_by_step";
        estimatedDuration?: number;
        skillsLearned?: string[];
        downloadableResources?: {
            name?: string;
            description?: string;
            type?: string;
            url?: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "tutorial";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        steps?: {
            id?: string;
            description?: string;
            content?: string;
            title?: string;
            order?: number;
            assets?: string[];
            estimatedTime?: number;
            checkpoints?: {
                description?: string;
                validation?: string;
            }[];
        }[];
        tools?: string[];
        prerequisites?: string[];
        deliverables?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        tutorialType?: "video" | "interactive" | "workshop" | "step_by_step";
        estimatedDuration?: number;
        skillsLearned?: string[];
        downloadableResources?: {
            name?: string;
            description?: string;
            type?: string;
            url?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "tutorial";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        steps?: {
            id?: string;
            description?: string;
            content?: string;
            title?: string;
            order?: number;
            assets?: string[];
            estimatedTime?: number;
            checkpoints?: {
                description?: string;
                validation?: string;
            }[];
        }[];
        tools?: string[];
        prerequisites?: string[];
        deliverables?: string[];
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        tutorialType?: "video" | "interactive" | "workshop" | "step_by_step";
        estimatedDuration?: number;
        skillsLearned?: string[];
        downloadableResources?: {
            name?: string;
            description?: string;
            type?: string;
            url?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}>;
export declare const CaseStudyContributionSchema: z.ZodObject<{
    id: z.ZodString;
    contributorId: z.ZodString;
    contributorName: z.ZodString;
    contributorLevel: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    title: z.ZodString;
    description: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "code", "graph"]>;
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }>, "many">>;
    status: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
    submittedAt: z.ZodDate;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    publishedAt: z.ZodOptional<z.ZodDate>;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moderatorId: z.ZodString;
        moderatorName: z.ZodString;
        reason: z.ZodString;
        details: z.ZodString;
        requestedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }>, "many">>;
    views: z.ZodDefault<z.ZodNumber>;
    downloads: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
    versionHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        changes: z.ZodString;
        changedAt: z.ZodDate;
        changedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    type: z.ZodLiteral<"case_study">;
    content: z.ZodObject<{
        caseStudyType: z.ZodEnum<["success_story", "implementation", "roi_analysis", "comparison", "innovation"]>;
        industry: z.ZodString;
        useCase: z.ZodString;
        companySize: z.ZodOptional<z.ZodEnum<["startup", "small", "medium", "large", "enterprise"]>>;
        challenge: z.ZodObject<{
            description: z.ZodString;
            painPoints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            constraints?: string[];
            painPoints?: string[];
        }, {
            description?: string;
            constraints?: string[];
            painPoints?: string[];
        }>;
        solution: z.ZodObject<{
            description: z.ZodString;
            approach: z.ZodString;
            templatesUsed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            implementation: z.ZodString;
            timeline: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            timeline?: string;
            implementation?: string;
            templatesUsed?: string[];
            approach?: string;
        }, {
            description?: string;
            timeline?: string;
            implementation?: string;
            templatesUsed?: string[];
            approach?: string;
        }>;
        results: z.ZodObject<{
            outcomes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            metrics: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                before: z.ZodString;
                after: z.ZodString;
                improvement: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }, {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }>, "many">>;
            roi: z.ZodOptional<z.ZodObject<{
                costSavings: z.ZodOptional<z.ZodNumber>;
                timeReduction: z.ZodOptional<z.ZodString>;
                qualityImprovement: z.ZodOptional<z.ZodString>;
                description: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            }, {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            metrics?: {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }[];
            outcomes?: string[];
            roi?: {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            };
        }, {
            metrics?: {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }[];
            outcomes?: string[];
            roi?: {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            };
        }>;
        testimonials: z.ZodDefault<z.ZodArray<z.ZodObject<{
            author: z.ZodString;
            role: z.ZodString;
            company: z.ZodOptional<z.ZodString>;
            quote: z.ZodString;
            avatar: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            author?: string;
            role?: string;
            company?: string;
            avatar?: string;
            quote?: string;
        }, {
            author?: string;
            role?: string;
            company?: string;
            avatar?: string;
            quote?: string;
        }>, "many">>;
        mediaGallery: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["before_after", "screenshot", "video", "diagram"]>;
            url: z.ZodString;
            caption: z.ZodString;
            order: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type?: "video" | "screenshot" | "before_after" | "diagram";
            caption?: string;
            url?: string;
            order?: number;
        }, {
            type?: "video" | "screenshot" | "before_after" | "diagram";
            caption?: string;
            url?: string;
            order?: number;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        results?: {
            metrics?: {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }[];
            outcomes?: string[];
            roi?: {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            };
        };
        industry?: string;
        challenge?: {
            description?: string;
            constraints?: string[];
            painPoints?: string[];
        };
        solution?: {
            description?: string;
            timeline?: string;
            implementation?: string;
            templatesUsed?: string[];
            approach?: string;
        };
        caseStudyType?: "comparison" | "innovation" | "implementation" | "success_story" | "roi_analysis";
        useCase?: string;
        companySize?: "small" | "medium" | "large" | "enterprise" | "startup";
        testimonials?: {
            author?: string;
            role?: string;
            company?: string;
            avatar?: string;
            quote?: string;
        }[];
        mediaGallery?: {
            type?: "video" | "screenshot" | "before_after" | "diagram";
            caption?: string;
            url?: string;
            order?: number;
        }[];
    }, {
        results?: {
            metrics?: {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }[];
            outcomes?: string[];
            roi?: {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            };
        };
        industry?: string;
        challenge?: {
            description?: string;
            constraints?: string[];
            painPoints?: string[];
        };
        solution?: {
            description?: string;
            timeline?: string;
            implementation?: string;
            templatesUsed?: string[];
            approach?: string;
        };
        caseStudyType?: "comparison" | "innovation" | "implementation" | "success_story" | "roi_analysis";
        useCase?: string;
        companySize?: "small" | "medium" | "large" | "enterprise" | "startup";
        testimonials?: {
            author?: string;
            role?: string;
            company?: string;
            avatar?: string;
            quote?: string;
        }[];
        mediaGallery?: {
            type?: "video" | "screenshot" | "before_after" | "diagram";
            caption?: string;
            url?: string;
            order?: number;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "case_study";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        results?: {
            metrics?: {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }[];
            outcomes?: string[];
            roi?: {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            };
        };
        industry?: string;
        challenge?: {
            description?: string;
            constraints?: string[];
            painPoints?: string[];
        };
        solution?: {
            description?: string;
            timeline?: string;
            implementation?: string;
            templatesUsed?: string[];
            approach?: string;
        };
        caseStudyType?: "comparison" | "innovation" | "implementation" | "success_story" | "roi_analysis";
        useCase?: string;
        companySize?: "small" | "medium" | "large" | "enterprise" | "startup";
        testimonials?: {
            author?: string;
            role?: string;
            company?: string;
            avatar?: string;
            quote?: string;
        }[];
        mediaGallery?: {
            type?: "video" | "screenshot" | "before_after" | "diagram";
            caption?: string;
            url?: string;
            order?: number;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "case_study";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        results?: {
            metrics?: {
                name?: string;
                before?: string;
                after?: string;
                improvement?: string;
            }[];
            outcomes?: string[];
            roi?: {
                description?: string;
                costSavings?: number;
                timeReduction?: string;
                qualityImprovement?: string;
            };
        };
        industry?: string;
        challenge?: {
            description?: string;
            constraints?: string[];
            painPoints?: string[];
        };
        solution?: {
            description?: string;
            timeline?: string;
            implementation?: string;
            templatesUsed?: string[];
            approach?: string;
        };
        caseStudyType?: "comparison" | "innovation" | "implementation" | "success_story" | "roi_analysis";
        useCase?: string;
        companySize?: "small" | "medium" | "large" | "enterprise" | "startup";
        testimonials?: {
            author?: string;
            role?: string;
            company?: string;
            avatar?: string;
            quote?: string;
        }[];
        mediaGallery?: {
            type?: "video" | "screenshot" | "before_after" | "diagram";
            caption?: string;
            url?: string;
            order?: number;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}>;
export declare const PatternLibraryContributionSchema: z.ZodObject<{
    id: z.ZodString;
    contributorId: z.ZodString;
    contributorName: z.ZodString;
    contributorLevel: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    title: z.ZodString;
    description: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "code", "graph"]>;
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }>, "many">>;
    status: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
    submittedAt: z.ZodDate;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    publishedAt: z.ZodOptional<z.ZodDate>;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moderatorId: z.ZodString;
        moderatorName: z.ZodString;
        reason: z.ZodString;
        details: z.ZodString;
        requestedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }>, "many">>;
    views: z.ZodDefault<z.ZodNumber>;
    downloads: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
    versionHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        changes: z.ZodString;
        changedAt: z.ZodDate;
        changedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    type: z.ZodLiteral<"pattern_library">;
    content: z.ZodObject<{
        patternType: z.ZodEnum<["prompt_pattern", "graph_pattern", "workflow_pattern", "integration_pattern"]>;
        domain: z.ZodString;
        complexity: z.ZodEnum<["simple", "moderate", "complex", "advanced"]>;
        pattern: z.ZodObject<{
            name: z.ZodString;
            intent: z.ZodString;
            motivation: z.ZodString;
            applicability: z.ZodString;
            structure: z.ZodString;
            participants: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            collaborations: z.ZodOptional<z.ZodString>;
            consequences: z.ZodString;
            implementation: z.ZodString;
            sampleCode: z.ZodOptional<z.ZodString>;
            knownUses: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            structure?: string;
            implementation?: string;
            intent?: string;
            motivation?: string;
            applicability?: string;
            participants?: string[];
            collaborations?: string;
            consequences?: string;
            sampleCode?: string;
            knownUses?: string[];
        }, {
            name?: string;
            structure?: string;
            implementation?: string;
            intent?: string;
            motivation?: string;
            applicability?: string;
            participants?: string[];
            collaborations?: string;
            consequences?: string;
            sampleCode?: string;
            knownUses?: string[];
        }>;
        examples: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            code: z.ZodString;
            explanation: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            code?: string;
            title?: string;
            explanation?: string;
        }, {
            description?: string;
            code?: string;
            title?: string;
            explanation?: string;
        }>, "many">>;
        variations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            whenToUse: z.ZodString;
            tradeoffs: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            description?: string;
            whenToUse?: string;
            tradeoffs?: string;
        }, {
            name?: string;
            description?: string;
            whenToUse?: string;
            tradeoffs?: string;
        }>, "many">>;
        relatedPatterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
            patternId: z.ZodString;
            relationship: z.ZodEnum<["uses", "used_by", "similar_to", "alternative_to"]>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            relationship?: "uses" | "used_by" | "similar_to" | "alternative_to";
            patternId?: string;
        }, {
            description?: string;
            relationship?: "uses" | "used_by" | "similar_to" | "alternative_to";
            patternId?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        pattern?: {
            name?: string;
            structure?: string;
            implementation?: string;
            intent?: string;
            motivation?: string;
            applicability?: string;
            participants?: string[];
            collaborations?: string;
            consequences?: string;
            sampleCode?: string;
            knownUses?: string[];
        };
        variations?: {
            name?: string;
            description?: string;
            whenToUse?: string;
            tradeoffs?: string;
        }[];
        complexity?: "simple" | "complex" | "advanced" | "moderate";
        examples?: {
            description?: string;
            code?: string;
            title?: string;
            explanation?: string;
        }[];
        patternType?: "prompt_pattern" | "graph_pattern" | "workflow_pattern" | "integration_pattern";
        domain?: string;
        relatedPatterns?: {
            description?: string;
            relationship?: "uses" | "used_by" | "similar_to" | "alternative_to";
            patternId?: string;
        }[];
    }, {
        pattern?: {
            name?: string;
            structure?: string;
            implementation?: string;
            intent?: string;
            motivation?: string;
            applicability?: string;
            participants?: string[];
            collaborations?: string;
            consequences?: string;
            sampleCode?: string;
            knownUses?: string[];
        };
        variations?: {
            name?: string;
            description?: string;
            whenToUse?: string;
            tradeoffs?: string;
        }[];
        complexity?: "simple" | "complex" | "advanced" | "moderate";
        examples?: {
            description?: string;
            code?: string;
            title?: string;
            explanation?: string;
        }[];
        patternType?: "prompt_pattern" | "graph_pattern" | "workflow_pattern" | "integration_pattern";
        domain?: string;
        relatedPatterns?: {
            description?: string;
            relationship?: "uses" | "used_by" | "similar_to" | "alternative_to";
            patternId?: string;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "pattern_library";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        pattern?: {
            name?: string;
            structure?: string;
            implementation?: string;
            intent?: string;
            motivation?: string;
            applicability?: string;
            participants?: string[];
            collaborations?: string;
            consequences?: string;
            sampleCode?: string;
            knownUses?: string[];
        };
        variations?: {
            name?: string;
            description?: string;
            whenToUse?: string;
            tradeoffs?: string;
        }[];
        complexity?: "simple" | "complex" | "advanced" | "moderate";
        examples?: {
            description?: string;
            code?: string;
            title?: string;
            explanation?: string;
        }[];
        patternType?: "prompt_pattern" | "graph_pattern" | "workflow_pattern" | "integration_pattern";
        domain?: string;
        relatedPatterns?: {
            description?: string;
            relationship?: "uses" | "used_by" | "similar_to" | "alternative_to";
            patternId?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "pattern_library";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        pattern?: {
            name?: string;
            structure?: string;
            implementation?: string;
            intent?: string;
            motivation?: string;
            applicability?: string;
            participants?: string[];
            collaborations?: string;
            consequences?: string;
            sampleCode?: string;
            knownUses?: string[];
        };
        variations?: {
            name?: string;
            description?: string;
            whenToUse?: string;
            tradeoffs?: string;
        }[];
        complexity?: "simple" | "complex" | "advanced" | "moderate";
        examples?: {
            description?: string;
            code?: string;
            title?: string;
            explanation?: string;
        }[];
        patternType?: "prompt_pattern" | "graph_pattern" | "workflow_pattern" | "integration_pattern";
        domain?: string;
        relatedPatterns?: {
            description?: string;
            relationship?: "uses" | "used_by" | "similar_to" | "alternative_to";
            patternId?: string;
        }[];
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}>;
export declare const CommunityPostContributionSchema: z.ZodObject<{
    id: z.ZodString;
    contributorId: z.ZodString;
    contributorName: z.ZodString;
    contributorLevel: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    title: z.ZodString;
    description: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    category: z.ZodOptional<z.ZodString>;
    assets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "code", "graph"]>;
        url: z.ZodString;
        filename: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }, {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }>, "many">>;
    status: z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>;
    submittedAt: z.ZodDate;
    reviewedAt: z.ZodOptional<z.ZodDate>;
    publishedAt: z.ZodOptional<z.ZodDate>;
    qualityScore: z.ZodDefault<z.ZodNumber>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moderatorId: z.ZodString;
        moderatorName: z.ZodString;
        reason: z.ZodString;
        details: z.ZodString;
        requestedAt: z.ZodDate;
        resolvedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }, {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }>, "many">>;
    views: z.ZodDefault<z.ZodNumber>;
    downloads: z.ZodDefault<z.ZodNumber>;
    likes: z.ZodDefault<z.ZodNumber>;
    comments: z.ZodDefault<z.ZodNumber>;
    shares: z.ZodDefault<z.ZodNumber>;
    version: z.ZodDefault<z.ZodString>;
    versionHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        version: z.ZodString;
        changes: z.ZodString;
        changedAt: z.ZodDate;
        changedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }, {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }>, "many">>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
} & {
    type: z.ZodLiteral<"community_post">;
    content: z.ZodObject<{
        postType: z.ZodEnum<["discussion", "question", "announcement", "showcase", "feedback"]>;
        forum: z.ZodString;
        isSticky: z.ZodDefault<z.ZodBoolean>;
        isPinned: z.ZodDefault<z.ZodBoolean>;
        body: z.ZodString;
        replies: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            authorId: z.ZodString;
            authorName: z.ZodString;
            content: z.ZodString;
            createdAt: z.ZodDate;
            updatedAt: z.ZodOptional<z.ZodDate>;
            votes: z.ZodDefault<z.ZodNumber>;
            isAcceptedAnswer: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            content?: string;
            authorId?: string;
            authorName?: string;
            votes?: number;
            isAcceptedAnswer?: boolean;
        }, {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            content?: string;
            authorId?: string;
            authorName?: string;
            votes?: number;
            isAcceptedAnswer?: boolean;
        }>, "many">>;
        votes: z.ZodDefault<z.ZodNumber>;
        bookmarks: z.ZodDefault<z.ZodNumber>;
        isResolved: z.ZodDefault<z.ZodBoolean>;
        acceptedAnswerId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        body?: string;
        bookmarks?: number;
        postType?: "feedback" | "question" | "discussion" | "announcement" | "showcase";
        forum?: string;
        isSticky?: boolean;
        isPinned?: boolean;
        votes?: number;
        replies?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            content?: string;
            authorId?: string;
            authorName?: string;
            votes?: number;
            isAcceptedAnswer?: boolean;
        }[];
        isResolved?: boolean;
        acceptedAnswerId?: string;
    }, {
        body?: string;
        bookmarks?: number;
        postType?: "feedback" | "question" | "discussion" | "announcement" | "showcase";
        forum?: string;
        isSticky?: boolean;
        isPinned?: boolean;
        votes?: number;
        replies?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            content?: string;
            authorId?: string;
            authorName?: string;
            votes?: number;
            isAcceptedAnswer?: boolean;
        }[];
        isResolved?: boolean;
        acceptedAnswerId?: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "community_post";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        body?: string;
        bookmarks?: number;
        postType?: "feedback" | "question" | "discussion" | "announcement" | "showcase";
        forum?: string;
        isSticky?: boolean;
        isPinned?: boolean;
        votes?: number;
        replies?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            content?: string;
            authorId?: string;
            authorName?: string;
            votes?: number;
            isAcceptedAnswer?: boolean;
        }[];
        isResolved?: boolean;
        acceptedAnswerId?: string;
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "community_post";
    category?: string;
    tags?: string[];
    version?: string;
    content?: {
        body?: string;
        bookmarks?: number;
        postType?: "feedback" | "question" | "discussion" | "announcement" | "showcase";
        forum?: string;
        isSticky?: boolean;
        isPinned?: boolean;
        votes?: number;
        replies?: {
            id?: string;
            createdAt?: Date;
            updatedAt?: Date;
            content?: string;
            authorId?: string;
            authorName?: string;
            votes?: number;
            isAcceptedAnswer?: boolean;
        }[];
        isResolved?: boolean;
        acceptedAnswerId?: string;
    };
    title?: string;
    comments?: number;
    assets?: {
        id?: string;
        size?: number;
        type?: "code" | "graph" | "video" | "image" | "document";
        url?: string;
        filename?: string;
        mimeType?: string;
    }[];
    views?: number;
    downloads?: number;
    likes?: number;
    qualityScore?: number;
    publishedAt?: Date;
    shares?: number;
    submittedAt?: Date;
    reviewedAt?: Date;
    contributorId?: string;
    contributorName?: string;
    contributorLevel?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        id?: string;
        details?: string;
        requestedAt?: Date;
        reason?: string;
        moderatorId?: string;
        moderatorName?: string;
        resolvedAt?: Date;
    }[];
    versionHistory?: {
        version?: string;
        changes?: string;
        changedAt?: Date;
        changedBy?: string;
    }[];
}>;
export declare const CreateContributionRequestSchema: z.ZodObject<{
    type: z.ZodEnum<["template", "knowledge_article", "tutorial", "case_study", "pattern_library", "community_post", "documentation", "review"]>;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    content: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    assets: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    saveAsDraft: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    type?: "template" | "documentation" | "tutorial" | "review" | "knowledge_article" | "community_post" | "case_study" | "pattern_library";
    category?: string;
    tags?: string[];
    content?: Record<string, unknown>;
    title?: string;
    assets?: string[];
    saveAsDraft?: boolean;
}, {
    description?: string;
    type?: "template" | "documentation" | "tutorial" | "review" | "knowledge_article" | "community_post" | "case_study" | "pattern_library";
    category?: string;
    tags?: string[];
    content?: Record<string, unknown>;
    title?: string;
    assets?: string[];
    saveAsDraft?: boolean;
}>;
export declare const UpdateContributionRequestSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    content: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    assets: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    category?: string;
    tags?: string[];
    content?: Record<string, unknown>;
    title?: string;
    assets?: string[];
}, {
    description?: string;
    category?: string;
    tags?: string[];
    content?: Record<string, unknown>;
    title?: string;
    assets?: string[];
}>;
export declare const ContributionReviewRequestSchema: z.ZodObject<{
    action: z.ZodEnum<["approve", "request_revision", "reject"]>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    moderatorNotes: z.ZodOptional<z.ZodString>;
    revisionRequests: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reason: z.ZodString;
        details: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        details?: string;
        reason?: string;
    }, {
        details?: string;
        reason?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    action?: "approve" | "reject" | "request_revision";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        details?: string;
        reason?: string;
    }[];
}, {
    action?: "approve" | "reject" | "request_revision";
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    moderatorNotes?: string;
    revisionRequests?: {
        details?: string;
        reason?: string;
    }[];
}>;
export declare const ContributionFilterSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["template", "knowledge_article", "tutorial", "case_study", "pattern_library", "community_post", "documentation", "review"]>>;
    status: z.ZodOptional<z.ZodEnum<["draft", "submitted", "under_review", "revision_requested", "approved", "published", "rejected", "archived"]>>;
    contributorId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    qualityRating: z.ZodOptional<z.ZodEnum<["poor", "fair", "good", "excellent", "exceptional"]>>;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["created_at", "updated_at", "views", "likes", "quality_score"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "template" | "documentation" | "tutorial" | "review" | "knowledge_article" | "community_post" | "case_study" | "pattern_library";
    category?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    sortBy?: "created_at" | "updated_at" | "views" | "likes" | "quality_score";
    sortOrder?: "asc" | "desc";
    contributorId?: string;
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    dateFrom?: Date;
    dateTo?: Date;
}, {
    search?: string;
    status?: "draft" | "published" | "approved" | "rejected" | "submitted" | "archived" | "under_review" | "revision_requested";
    type?: "template" | "documentation" | "tutorial" | "review" | "knowledge_article" | "community_post" | "case_study" | "pattern_library";
    category?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    sortBy?: "created_at" | "updated_at" | "views" | "likes" | "quality_score";
    sortOrder?: "asc" | "desc";
    contributorId?: string;
    qualityRating?: "excellent" | "good" | "poor" | "fair" | "exceptional";
    dateFrom?: Date;
    dateTo?: Date;
}>;
export declare const ContributorProfileSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    displayName: z.ZodString;
    bio: z.ZodOptional<z.ZodString>;
    expertise: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    skills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    location: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    social: z.ZodOptional<z.ZodObject<{
        twitter: z.ZodOptional<z.ZodString>;
        linkedin: z.ZodOptional<z.ZodString>;
        github: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        twitter?: string;
        linkedin?: string;
        github?: string;
    }, {
        twitter?: string;
        linkedin?: string;
        github?: string;
    }>>;
    level: z.ZodEnum<["newcomer", "contributor", "regular", "trusted", "expert", "moderator"]>;
    totalContributions: z.ZodDefault<z.ZodNumber>;
    publishedContributions: z.ZodDefault<z.ZodNumber>;
    totalViews: z.ZodDefault<z.ZodNumber>;
    totalLikes: z.ZodDefault<z.ZodNumber>;
    averageQualityScore: z.ZodDefault<z.ZodNumber>;
    badges: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        iconUrl: z.ZodString;
        earnedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        description?: string;
        iconUrl?: string;
        earnedAt?: Date;
    }, {
        id?: string;
        name?: string;
        description?: string;
        iconUrl?: string;
        earnedAt?: Date;
    }>, "many">>;
    achievements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        progress: z.ZodNumber;
        completedAt: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        name?: string;
        description?: string;
        progress?: number;
        completedAt?: Date;
    }, {
        id?: string;
        name?: string;
        description?: string;
        progress?: number;
        completedAt?: Date;
    }>, "many">>;
    notificationPreferences: z.ZodDefault<z.ZodObject<{
        emailOnComment: z.ZodDefault<z.ZodBoolean>;
        emailOnLike: z.ZodDefault<z.ZodBoolean>;
        emailOnFeature: z.ZodDefault<z.ZodBoolean>;
        weeklyDigest: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        emailOnComment?: boolean;
        emailOnLike?: boolean;
        emailOnFeature?: boolean;
        weeklyDigest?: boolean;
    }, {
        emailOnComment?: boolean;
        emailOnLike?: boolean;
        emailOnFeature?: boolean;
        weeklyDigest?: boolean;
    }>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
    level?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    displayName?: string;
    location?: string;
    social?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
    website?: string;
    expertise?: string[];
    bio?: string;
    skills?: string[];
    totalContributions?: number;
    publishedContributions?: number;
    totalViews?: number;
    totalLikes?: number;
    averageQualityScore?: number;
    badges?: {
        id?: string;
        name?: string;
        description?: string;
        iconUrl?: string;
        earnedAt?: Date;
    }[];
    achievements?: {
        id?: string;
        name?: string;
        description?: string;
        progress?: number;
        completedAt?: Date;
    }[];
    notificationPreferences?: {
        emailOnComment?: boolean;
        emailOnLike?: boolean;
        emailOnFeature?: boolean;
        weeklyDigest?: boolean;
    };
}, {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: string;
    level?: "expert" | "contributor" | "regular" | "moderator" | "trusted" | "newcomer";
    displayName?: string;
    location?: string;
    social?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
    website?: string;
    expertise?: string[];
    bio?: string;
    skills?: string[];
    totalContributions?: number;
    publishedContributions?: number;
    totalViews?: number;
    totalLikes?: number;
    averageQualityScore?: number;
    badges?: {
        id?: string;
        name?: string;
        description?: string;
        iconUrl?: string;
        earnedAt?: Date;
    }[];
    achievements?: {
        id?: string;
        name?: string;
        description?: string;
        progress?: number;
        completedAt?: Date;
    }[];
    notificationPreferences?: {
        emailOnComment?: boolean;
        emailOnLike?: boolean;
        emailOnFeature?: boolean;
        weeklyDigest?: boolean;
    };
}>;
export type ContributionType = z.infer<typeof ContributionTypeSchema>;
export type ContributionStatus = z.infer<typeof ContributionStatusSchema>;
export type ContributionQualityRating = z.infer<typeof ContributionQualityRatingSchema>;
export type ContributorLevel = z.infer<typeof ContributorLevelSchema>;
export type BaseContribution = z.infer<typeof BaseContributionSchema>;
export type TemplateContribution = z.infer<typeof TemplateContributionSchema>;
export type KnowledgeArticleContribution = z.infer<typeof KnowledgeArticleContributionSchema>;
export type TutorialContribution = z.infer<typeof TutorialContributionSchema>;
export type CaseStudyContribution = z.infer<typeof CaseStudyContributionSchema>;
export type PatternLibraryContribution = z.infer<typeof PatternLibraryContributionSchema>;
export type CommunityPostContribution = z.infer<typeof CommunityPostContributionSchema>;
export type Contribution = TemplateContribution | KnowledgeArticleContribution | TutorialContribution | CaseStudyContribution | PatternLibraryContribution | CommunityPostContribution;
export type CreateContributionRequest = z.infer<typeof CreateContributionRequestSchema>;
export type UpdateContributionRequest = z.infer<typeof UpdateContributionRequestSchema>;
export type ContributionReviewRequest = z.infer<typeof ContributionReviewRequestSchema>;
export type ContributionFilter = z.infer<typeof ContributionFilterSchema>;
export type ContributorProfile = z.infer<typeof ContributorProfileSchema>;
export declare const validateContribution: (contribution: unknown) => Contribution;
export declare const validateCreateContributionRequest: (request: unknown) => CreateContributionRequest;
export declare const validateUpdateContributionRequest: (request: unknown) => UpdateContributionRequest;
export declare const validateContributionReviewRequest: (request: unknown) => ContributionReviewRequest;
export declare const validateContributionFilter: (filter: unknown) => ContributionFilter;
export declare const validateContributorProfile: (profile: unknown) => ContributorProfile;
export declare const CONTRIBUTION_TYPE_DESCRIPTIONS: {
    readonly template: "Reusable prompt templates for the marketplace";
    readonly knowledge_article: "Educational articles and guides";
    readonly tutorial: "Step-by-step learning content";
    readonly case_study: "Real-world implementation stories";
    readonly pattern_library: "Reusable design and prompt patterns";
    readonly community_post: "Community discussions and questions";
    readonly documentation: "Technical documentation";
    readonly review: "Reviews and feedback on templates";
};
export declare const CONTRIBUTION_STATUS_DESCRIPTIONS: {
    readonly draft: "Work in progress, not yet submitted";
    readonly submitted: "Submitted for review";
    readonly under_review: "Currently being reviewed by moderators";
    readonly revision_requested: "Changes requested before approval";
    readonly approved: "Approved but not yet published";
    readonly published: "Live and publicly available";
    readonly rejected: "Rejected and will not be published";
    readonly archived: "Removed from public view";
};
export declare const CONTRIBUTOR_LEVEL_DESCRIPTIONS: {
    readonly newcomer: "New to the platform";
    readonly contributor: "Has made initial contributions";
    readonly regular: "Regular contributor with good quality";
    readonly trusted: "Trusted contributor with high quality work";
    readonly expert: "Expert contributor with exceptional content";
    readonly moderator: "Community moderator and content reviewer";
};
export declare const CONTRIBUTION_DEFAULTS: {
    readonly QUALITY_THRESHOLD_PUBLISH: 70;
    readonly MIN_TITLE_LENGTH: 5;
    readonly MAX_TITLE_LENGTH: 200;
    readonly MIN_DESCRIPTION_LENGTH: 20;
    readonly MAX_DESCRIPTION_LENGTH: 2000;
    readonly MAX_TAGS: 20;
    readonly MAX_ASSETS_PER_CONTRIBUTION: 50;
    readonly MAX_ASSET_SIZE_MB: 10;
    readonly AUTO_PUBLISH_SCORE_THRESHOLD: 90;
    readonly FEATURED_CONTRIBUTION_THRESHOLD: 95;
};
//# sourceMappingURL=contributions.d.ts.map