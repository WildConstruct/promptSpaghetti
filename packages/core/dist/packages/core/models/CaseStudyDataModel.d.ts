/**
 * Epic 16 - Case Study Data Model
 * Task: E16-1753114247140-836984 - Create case study data model
 *
 * Comprehensive data model for marketplace case studies that showcase
 * template success stories, user implementations, and ROI demonstrations.
 * Integrates with Epic 16 marketplace, analytics, and community features.
 */
import { z } from 'zod';
export type CaseStudyType = 'template-success' | 'user-story' | 'roi-analysis' | 'before-after' | 'industry-showcase' | 'community-highlight' | 'innovation-case';
export type CaseStudyStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'featured' | 'archived' | 'rejected';
export type IndustryCategory = 'film-production' | 'advertising' | 'gaming' | 'publishing' | 'education' | 'healthcare' | 'finance' | 'technology' | 'legal' | 'consulting' | 'e-commerce' | 'non-profit' | 'other';
export type MediaType = 'image' | 'video' | 'document' | 'screenshot' | 'chart' | 'infographic' | 'audio';
export interface CaseStudyMedia {
    id: string;
    type: MediaType;
    url: string;
    thumbnailUrl?: string;
    title: string;
    description?: string;
    altText?: string;
    fileSize?: number;
    mimeType?: string;
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    uploadedAt: string;
    uploadedBy: string;
}
export interface MediaGallery {
    featured: CaseStudyMedia[];
    screenshots: CaseStudyMedia[];
    videos: CaseStudyMedia[];
    documents: CaseStudyMedia[];
    charts: CaseStudyMedia[];
}
export interface ROIMetrics {
    timeSaved: {
        hours: number;
        period: 'day' | 'week' | 'month' | 'project';
        description: string;
    };
    costSavings: {
        amount: number;
        currency: string;
        period: 'day' | 'week' | 'month' | 'project';
        calculation: string;
    };
    qualityMetrics: {
        metric: string;
        before: number | string;
        after: number | string;
        improvement: number;
        unit?: string;
    }[];
    productivityGains: {
        metric: string;
        value: number;
        unit: string;
        description: string;
    }[];
    claudeMetrics?: {
        tokensSaved: number;
        costPerToken: number;
        totalCostSavings: number;
        responseQualityImprovement: number;
        consistencyImprovement: number;
    };
}
export interface PerformanceMetrics {
    templatesUsed: number;
    implementationTime: number;
    projectDuration: number;
    teamSize: number;
    outputQuality: number;
    efficiency: number;
    errorReduction: number;
    stakeholderSatisfaction: number;
    beforeAfter: {
        metric: string;
        before: number | string;
        after: number | string;
        unit?: string;
    }[];
}
export interface TemplateReference {
    templateId: string;
    templateName: string;
    templateVersion: string;
    templateCategory: string;
    usageDescription: string;
    customizations: string[];
    resultsWithTemplate: string;
    licenseType: string;
    purchaseDate?: string;
    cost?: number;
}
export interface TemplateImplementation {
    originalTemplate: TemplateReference;
    customizations: {
        description: string;
        reasonForChange: string;
        impact: string;
    }[];
    results: {
        outputExamples: string[];
        performanceMetrics: Record<string, number>;
        userFeedback: string[];
    };
    lessonsLearned: string[];
    recommendations: string[];
}
export interface CaseStudy {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    summary: string;
    type: CaseStudyType;
    status: CaseStudyStatus;
    industry: IndustryCategory;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    content: {
        challenge: string;
        solution: string;
        implementation: string;
        results: string;
        learnings: string;
        nextSteps?: string;
    };
    media: MediaGallery;
    featuredImage?: CaseStudyMedia;
    templatesUsed: TemplateReference[];
    templateImplementations: TemplateImplementation[];
    roiMetrics: ROIMetrics;
    performanceMetrics: PerformanceMetrics;
    author: {
        userId: string;
        name: string;
        title?: string;
        company?: string;
        profileUrl?: string;
        avatar?: string;
        verified: boolean;
    };
    collaborators: {
        userId: string;
        name: string;
        role: string;
        contribution: string;
    }[];
    engagement: {
        views: number;
        likes: number;
        shares: number;
        bookmarks: number;
        comments: number;
        helpfulVotes: number;
        followUps: number;
    };
    moderation: {
        submittedAt: string;
        submittedBy: string;
        reviewedAt?: string;
        reviewedBy?: string;
        approvalNotes?: string;
        rejectionReason?: string;
        featuredAt?: string;
        featuredBy?: string;
    };
    seo: {
        slug: string;
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        canonicalUrl?: string;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    archivedAt?: string;
    version: string;
    previousVersions: string[];
    config: {
        allowComments: boolean;
        allowSharing: boolean;
        showAuthor: boolean;
        showMetrics: boolean;
        requireEmailToView: boolean;
        featured: boolean;
        priority: number;
    };
}
export interface CreateCaseStudyRequest {
    title: string;
    subtitle?: string;
    description: string;
    type: CaseStudyType;
    industry: IndustryCategory;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    content: CaseStudy['content'];
    templatesUsed: Omit<TemplateReference, 'templateName' | 'templateCategory'>[];
    roiMetrics?: Partial<ROIMetrics>;
    performanceMetrics?: Partial<PerformanceMetrics>;
    collaborators?: CaseStudy['collaborators'];
    config?: Partial<CaseStudy['config']>;
}
export interface UpdateCaseStudyRequest {
    id: string;
    title?: string;
    subtitle?: string;
    description?: string;
    tags?: string[];
    content?: Partial<CaseStudy['content']>;
    templatesUsed?: TemplateReference[];
    templateImplementations?: TemplateImplementation[];
    roiMetrics?: Partial<ROIMetrics>;
    performanceMetrics?: Partial<PerformanceMetrics>;
    collaborators?: CaseStudy['collaborators'];
    config?: Partial<CaseStudy['config']>;
    updateReason: string;
}
export interface CaseStudyFilter {
    type?: CaseStudyType | CaseStudyType[];
    industry?: IndustryCategory | IndustryCategory[];
    tags?: string[];
    difficulty?: ('beginner' | 'intermediate' | 'advanced' | 'expert')[];
    status?: CaseStudyStatus | CaseStudyStatus[];
    templateIds?: string[];
    templateCategories?: string[];
    minROI?: number;
    minTimeSaved?: number;
    minQualityImprovement?: number;
    minViews?: number;
    minLikes?: number;
    minHelpfulVotes?: number;
    createdAfter?: string;
    createdBefore?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    authorId?: string;
    verifiedAuthorsOnly?: boolean;
    search?: string;
    featuredOnly?: boolean;
}
export interface CaseStudySort {
    field: 'createdAt' | 'publishedAt' | 'updatedAt' | 'views' | 'likes' | 'helpfulVotes' | 'roiValue' | 'timeSaved' | 'title' | 'priority';
    direction: 'asc' | 'desc';
}
export interface CaseStudyQuery {
    filters?: CaseStudyFilter;
    sort?: CaseStudySort;
    pagination: {
        offset: number;
        limit: number;
    };
    include?: ('media' | 'templates' | 'metrics' | 'author' | 'engagement')[];
}
export interface CaseStudyQueryResponse {
    caseStudies: CaseStudy[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    };
    aggregations: {
        totalCaseStudies: number;
        byType: Array<{
            type: CaseStudyType;
            count: number;
        }>;
        byIndustry: Array<{
            industry: IndustryCategory;
            count: number;
        }>;
        byDifficulty: Array<{
            difficulty: string;
            count: number;
        }>;
        featuredCount: number;
    };
}
export interface CaseStudyAnalytics {
    caseStudyId: string;
    totalViews: number;
    uniqueViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    totalBookmarks: number;
    helpfulnessRating: number;
    templatesDiscovered: number;
    templatePurchases: number;
    implementationAttempts: number;
    topCountries: Array<{
        country: string;
        views: number;
    }>;
    topCities: Array<{
        city: string;
        views: number;
    }>;
    topReferrers: Array<{
        source: string;
        visits: number;
    }>;
    searchKeywords: Array<{
        keyword: string;
        frequency: number;
    }>;
    viewsByDay: Array<{
        date: string;
        views: number;
    }>;
    engagementByWeek: Array<{
        week: string;
        engagement: number;
    }>;
    viewsByUserType: Array<{
        userType: string;
        count: number;
    }>;
    viewsByIndustry: Array<{
        industry: string;
        count: number;
    }>;
}
export declare const CaseStudyMediaSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
    url: z.ZodString;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    altText: z.ZodOptional<z.ZodString>;
    fileSize: z.ZodOptional<z.ZodNumber>;
    mimeType: z.ZodOptional<z.ZodString>;
    dimensions: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width?: number;
        height?: number;
    }, {
        width?: number;
        height?: number;
    }>>;
    duration: z.ZodOptional<z.ZodNumber>;
    uploadedAt: z.ZodString;
    uploadedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    description?: string;
    type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
    title?: string;
    url?: string;
    duration?: number;
    fileSize?: number;
    mimeType?: string;
    dimensions?: {
        width?: number;
        height?: number;
    };
    thumbnailUrl?: string;
    altText?: string;
    uploadedAt?: string;
    uploadedBy?: string;
}, {
    id?: string;
    description?: string;
    type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
    title?: string;
    url?: string;
    duration?: number;
    fileSize?: number;
    mimeType?: string;
    dimensions?: {
        width?: number;
        height?: number;
    };
    thumbnailUrl?: string;
    altText?: string;
    uploadedAt?: string;
    uploadedBy?: string;
}>;
export declare const ROIMetricsSchema: z.ZodObject<{
    timeSaved: z.ZodObject<{
        hours: z.ZodNumber;
        period: z.ZodEnum<["day", "week", "month", "project"]>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        period?: "project" | "month" | "week" | "day";
        hours?: number;
    }, {
        description?: string;
        period?: "project" | "month" | "week" | "day";
        hours?: number;
    }>;
    costSavings: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
        period: z.ZodEnum<["day", "week", "month", "project"]>;
        calculation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount?: number;
        period?: "project" | "month" | "week" | "day";
        currency?: string;
        calculation?: string;
    }, {
        amount?: number;
        period?: "project" | "month" | "week" | "day";
        currency?: string;
        calculation?: string;
    }>;
    qualityMetrics: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
        after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
        improvement: z.ZodNumber;
        unit: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        before?: string | number;
        after?: string | number;
        metric?: string;
        unit?: string;
        improvement?: number;
    }, {
        before?: string | number;
        after?: string | number;
        metric?: string;
        unit?: string;
        improvement?: number;
    }>, "many">;
    productivityGains: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        value: z.ZodNumber;
        unit: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        value?: number;
        metric?: string;
        unit?: string;
    }, {
        description?: string;
        value?: number;
        metric?: string;
        unit?: string;
    }>, "many">;
    claudeMetrics: z.ZodOptional<z.ZodObject<{
        tokensSaved: z.ZodNumber;
        costPerToken: z.ZodNumber;
        totalCostSavings: z.ZodNumber;
        responseQualityImprovement: z.ZodNumber;
        consistencyImprovement: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        costPerToken?: number;
        tokensSaved?: number;
        totalCostSavings?: number;
        responseQualityImprovement?: number;
        consistencyImprovement?: number;
    }, {
        costPerToken?: number;
        tokensSaved?: number;
        totalCostSavings?: number;
        responseQualityImprovement?: number;
        consistencyImprovement?: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    costSavings?: {
        amount?: number;
        period?: "project" | "month" | "week" | "day";
        currency?: string;
        calculation?: string;
    };
    qualityMetrics?: {
        before?: string | number;
        after?: string | number;
        metric?: string;
        unit?: string;
        improvement?: number;
    }[];
    timeSaved?: {
        description?: string;
        period?: "project" | "month" | "week" | "day";
        hours?: number;
    };
    productivityGains?: {
        description?: string;
        value?: number;
        metric?: string;
        unit?: string;
    }[];
    claudeMetrics?: {
        costPerToken?: number;
        tokensSaved?: number;
        totalCostSavings?: number;
        responseQualityImprovement?: number;
        consistencyImprovement?: number;
    };
}, {
    costSavings?: {
        amount?: number;
        period?: "project" | "month" | "week" | "day";
        currency?: string;
        calculation?: string;
    };
    qualityMetrics?: {
        before?: string | number;
        after?: string | number;
        metric?: string;
        unit?: string;
        improvement?: number;
    }[];
    timeSaved?: {
        description?: string;
        period?: "project" | "month" | "week" | "day";
        hours?: number;
    };
    productivityGains?: {
        description?: string;
        value?: number;
        metric?: string;
        unit?: string;
    }[];
    claudeMetrics?: {
        costPerToken?: number;
        tokensSaved?: number;
        totalCostSavings?: number;
        responseQualityImprovement?: number;
        consistencyImprovement?: number;
    };
}>;
export declare const TemplateReferenceSchema: z.ZodObject<{
    templateId: z.ZodString;
    templateName: z.ZodString;
    templateVersion: z.ZodString;
    templateCategory: z.ZodString;
    usageDescription: z.ZodString;
    customizations: z.ZodArray<z.ZodString, "many">;
    resultsWithTemplate: z.ZodString;
    licenseType: z.ZodString;
    purchaseDate: z.ZodOptional<z.ZodString>;
    cost: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    cost?: number;
    templateId?: string;
    templateName?: string;
    templateCategory?: string;
    templateVersion?: string;
    usageDescription?: string;
    customizations?: string[];
    resultsWithTemplate?: string;
    licenseType?: string;
    purchaseDate?: string;
}, {
    cost?: number;
    templateId?: string;
    templateName?: string;
    templateCategory?: string;
    templateVersion?: string;
    usageDescription?: string;
    customizations?: string[];
    resultsWithTemplate?: string;
    licenseType?: string;
    purchaseDate?: string;
}>;
export declare const CaseStudySchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    summary: z.ZodString;
    type: z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>;
    status: z.ZodEnum<["draft", "submitted", "under-review", "approved", "featured", "archived", "rejected"]>;
    industry: z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>;
    tags: z.ZodArray<z.ZodString, "many">;
    difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    content: z.ZodObject<{
        challenge: z.ZodString;
        solution: z.ZodString;
        implementation: z.ZodString;
        results: z.ZodString;
        learnings: z.ZodString;
        nextSteps: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    }, {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    }>;
    media: z.ZodObject<{
        featured: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
            url: z.ZodString;
            thumbnailUrl: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            altText: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            mimeType: z.ZodOptional<z.ZodString>;
            dimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>>;
            duration: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodString;
            uploadedBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }>, "many">;
        screenshots: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
            url: z.ZodString;
            thumbnailUrl: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            altText: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            mimeType: z.ZodOptional<z.ZodString>;
            dimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>>;
            duration: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodString;
            uploadedBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }>, "many">;
        videos: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
            url: z.ZodString;
            thumbnailUrl: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            altText: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            mimeType: z.ZodOptional<z.ZodString>;
            dimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>>;
            duration: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodString;
            uploadedBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }>, "many">;
        documents: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
            url: z.ZodString;
            thumbnailUrl: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            altText: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            mimeType: z.ZodOptional<z.ZodString>;
            dimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>>;
            duration: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodString;
            uploadedBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }>, "many">;
        charts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
            url: z.ZodString;
            thumbnailUrl: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            altText: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            mimeType: z.ZodOptional<z.ZodString>;
            dimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>>;
            duration: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodString;
            uploadedBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        featured?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        charts?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        documents?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        screenshots?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        videos?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
    }, {
        featured?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        charts?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        documents?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        screenshots?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        videos?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
    }>;
    featuredImage: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
        url: z.ZodString;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        altText: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        mimeType: z.ZodOptional<z.ZodString>;
        dimensions: z.ZodOptional<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width?: number;
            height?: number;
        }, {
            width?: number;
            height?: number;
        }>>;
        duration: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodString;
        uploadedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        description?: string;
        type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
        title?: string;
        url?: string;
        duration?: number;
        fileSize?: number;
        mimeType?: string;
        dimensions?: {
            width?: number;
            height?: number;
        };
        thumbnailUrl?: string;
        altText?: string;
        uploadedAt?: string;
        uploadedBy?: string;
    }, {
        id?: string;
        description?: string;
        type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
        title?: string;
        url?: string;
        duration?: number;
        fileSize?: number;
        mimeType?: string;
        dimensions?: {
            width?: number;
            height?: number;
        };
        thumbnailUrl?: string;
        altText?: string;
        uploadedAt?: string;
        uploadedBy?: string;
    }>>;
    templatesUsed: z.ZodArray<z.ZodObject<{
        templateId: z.ZodString;
        templateName: z.ZodString;
        templateVersion: z.ZodString;
        templateCategory: z.ZodString;
        usageDescription: z.ZodString;
        customizations: z.ZodArray<z.ZodString, "many">;
        resultsWithTemplate: z.ZodString;
        licenseType: z.ZodString;
        purchaseDate: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        cost?: number;
        templateId?: string;
        templateName?: string;
        templateCategory?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }, {
        cost?: number;
        templateId?: string;
        templateName?: string;
        templateCategory?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }>, "many">;
    templateImplementations: z.ZodArray<z.ZodObject<{
        originalTemplate: z.ZodObject<{
            templateId: z.ZodString;
            templateName: z.ZodString;
            templateVersion: z.ZodString;
            templateCategory: z.ZodString;
            usageDescription: z.ZodString;
            customizations: z.ZodArray<z.ZodString, "many">;
            resultsWithTemplate: z.ZodString;
            licenseType: z.ZodString;
            purchaseDate: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }, {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }>;
        customizations: z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            reasonForChange: z.ZodString;
            impact: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            impact?: string;
            reasonForChange?: string;
        }, {
            description?: string;
            impact?: string;
            reasonForChange?: string;
        }>, "many">;
        results: z.ZodObject<{
            outputExamples: z.ZodArray<z.ZodString, "many">;
            performanceMetrics: z.ZodRecord<z.ZodString, z.ZodNumber>;
            userFeedback: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            performanceMetrics?: Record<string, number>;
            outputExamples?: string[];
            userFeedback?: string[];
        }, {
            performanceMetrics?: Record<string, number>;
            outputExamples?: string[];
            userFeedback?: string[];
        }>;
        lessonsLearned: z.ZodArray<z.ZodString, "many">;
        recommendations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        results?: {
            performanceMetrics?: Record<string, number>;
            outputExamples?: string[];
            userFeedback?: string[];
        };
        recommendations?: string[];
        customizations?: {
            description?: string;
            impact?: string;
            reasonForChange?: string;
        }[];
        originalTemplate?: {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        };
        lessonsLearned?: string[];
    }, {
        results?: {
            performanceMetrics?: Record<string, number>;
            outputExamples?: string[];
            userFeedback?: string[];
        };
        recommendations?: string[];
        customizations?: {
            description?: string;
            impact?: string;
            reasonForChange?: string;
        }[];
        originalTemplate?: {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        };
        lessonsLearned?: string[];
    }>, "many">;
    roiMetrics: z.ZodObject<{
        timeSaved: z.ZodObject<{
            hours: z.ZodNumber;
            period: z.ZodEnum<["day", "week", "month", "project"]>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        }, {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        }>;
        costSavings: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
            period: z.ZodEnum<["day", "week", "month", "project"]>;
            calculation: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        }, {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        }>;
        qualityMetrics: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            improvement: z.ZodNumber;
            unit: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }>, "many">;
        productivityGains: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }, {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }>, "many">;
        claudeMetrics: z.ZodOptional<z.ZodObject<{
            tokensSaved: z.ZodNumber;
            costPerToken: z.ZodNumber;
            totalCostSavings: z.ZodNumber;
            responseQualityImprovement: z.ZodNumber;
            consistencyImprovement: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        }, {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    }, {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    }>;
    performanceMetrics: z.ZodObject<{
        templatesUsed: z.ZodNumber;
        implementationTime: z.ZodNumber;
        projectDuration: z.ZodNumber;
        teamSize: z.ZodNumber;
        outputQuality: z.ZodNumber;
        efficiency: z.ZodNumber;
        errorReduction: z.ZodNumber;
        stakeholderSatisfaction: z.ZodNumber;
        beforeAfter: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            unit: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    }, {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    }>;
    author: z.ZodObject<{
        userId: z.ZodString;
        name: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        company: z.ZodOptional<z.ZodString>;
        profileUrl: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        verified: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        title?: string;
        userId?: string;
        company?: string;
        verified?: boolean;
        profileUrl?: string;
        avatar?: string;
    }, {
        name?: string;
        title?: string;
        userId?: string;
        company?: string;
        verified?: boolean;
        profileUrl?: string;
        avatar?: string;
    }>;
    collaborators: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        contribution: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }, {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }>, "many">;
    engagement: z.ZodObject<{
        views: z.ZodNumber;
        likes: z.ZodNumber;
        shares: z.ZodNumber;
        bookmarks: z.ZodNumber;
        comments: z.ZodNumber;
        helpfulVotes: z.ZodNumber;
        followUps: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        bookmarks?: number;
        comments?: number;
        views?: number;
        likes?: number;
        helpfulVotes?: number;
        shares?: number;
        followUps?: number;
    }, {
        bookmarks?: number;
        comments?: number;
        views?: number;
        likes?: number;
        helpfulVotes?: number;
        shares?: number;
        followUps?: number;
    }>;
    moderation: z.ZodObject<{
        submittedAt: z.ZodString;
        submittedBy: z.ZodString;
        reviewedAt: z.ZodOptional<z.ZodString>;
        reviewedBy: z.ZodOptional<z.ZodString>;
        approvalNotes: z.ZodOptional<z.ZodString>;
        rejectionReason: z.ZodOptional<z.ZodString>;
        featuredAt: z.ZodOptional<z.ZodString>;
        featuredBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        submittedAt?: string;
        submittedBy?: string;
        reviewedAt?: string;
        reviewedBy?: string;
        approvalNotes?: string;
        rejectionReason?: string;
        featuredAt?: string;
        featuredBy?: string;
    }, {
        submittedAt?: string;
        submittedBy?: string;
        reviewedAt?: string;
        reviewedBy?: string;
        approvalNotes?: string;
        rejectionReason?: string;
        featuredAt?: string;
        featuredBy?: string;
    }>;
    seo: z.ZodObject<{
        slug: z.ZodString;
        metaTitle: z.ZodString;
        metaDescription: z.ZodString;
        keywords: z.ZodArray<z.ZodString, "many">;
        canonicalUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        keywords?: string[];
        slug?: string;
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
    }, {
        keywords?: string[];
        slug?: string;
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    publishedAt: z.ZodOptional<z.ZodString>;
    archivedAt: z.ZodOptional<z.ZodString>;
    version: z.ZodString;
    previousVersions: z.ZodArray<z.ZodString, "many">;
    config: z.ZodObject<{
        allowComments: z.ZodBoolean;
        allowSharing: z.ZodBoolean;
        showAuthor: z.ZodBoolean;
        showMetrics: z.ZodBoolean;
        requireEmailToView: z.ZodBoolean;
        featured: z.ZodBoolean;
        priority: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    }, {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    description?: string;
    status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review";
    type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
    config?: {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    };
    tags?: string[];
    version?: string;
    author?: {
        name?: string;
        title?: string;
        userId?: string;
        company?: string;
        verified?: boolean;
        profileUrl?: string;
        avatar?: string;
    };
    content?: {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    };
    summary?: string;
    title?: string;
    performanceMetrics?: {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    };
    media?: {
        featured?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        charts?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        documents?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        screenshots?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        videos?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
    };
    engagement?: {
        bookmarks?: number;
        comments?: number;
        views?: number;
        likes?: number;
        helpfulVotes?: number;
        shares?: number;
        followUps?: number;
    };
    seo?: {
        keywords?: string[];
        slug?: string;
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
    };
    industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    moderation?: {
        submittedAt?: string;
        submittedBy?: string;
        reviewedAt?: string;
        reviewedBy?: string;
        approvalNotes?: string;
        rejectionReason?: string;
        featuredAt?: string;
        featuredBy?: string;
    };
    collaborators?: {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }[];
    publishedAt?: string;
    subtitle?: string;
    featuredImage?: {
        id?: string;
        description?: string;
        type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
        title?: string;
        url?: string;
        duration?: number;
        fileSize?: number;
        mimeType?: string;
        dimensions?: {
            width?: number;
            height?: number;
        };
        thumbnailUrl?: string;
        altText?: string;
        uploadedAt?: string;
        uploadedBy?: string;
    };
    templatesUsed?: {
        cost?: number;
        templateId?: string;
        templateName?: string;
        templateCategory?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }[];
    templateImplementations?: {
        results?: {
            performanceMetrics?: Record<string, number>;
            outputExamples?: string[];
            userFeedback?: string[];
        };
        recommendations?: string[];
        customizations?: {
            description?: string;
            impact?: string;
            reasonForChange?: string;
        }[];
        originalTemplate?: {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        };
        lessonsLearned?: string[];
    }[];
    roiMetrics?: {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    };
    archivedAt?: string;
    previousVersions?: string[];
}, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    description?: string;
    status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review";
    type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
    config?: {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    };
    tags?: string[];
    version?: string;
    author?: {
        name?: string;
        title?: string;
        userId?: string;
        company?: string;
        verified?: boolean;
        profileUrl?: string;
        avatar?: string;
    };
    content?: {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    };
    summary?: string;
    title?: string;
    performanceMetrics?: {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    };
    media?: {
        featured?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        charts?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        documents?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        screenshots?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
        videos?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }[];
    };
    engagement?: {
        bookmarks?: number;
        comments?: number;
        views?: number;
        likes?: number;
        helpfulVotes?: number;
        shares?: number;
        followUps?: number;
    };
    seo?: {
        keywords?: string[];
        slug?: string;
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
    };
    industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    moderation?: {
        submittedAt?: string;
        submittedBy?: string;
        reviewedAt?: string;
        reviewedBy?: string;
        approvalNotes?: string;
        rejectionReason?: string;
        featuredAt?: string;
        featuredBy?: string;
    };
    collaborators?: {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }[];
    publishedAt?: string;
    subtitle?: string;
    featuredImage?: {
        id?: string;
        description?: string;
        type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
        title?: string;
        url?: string;
        duration?: number;
        fileSize?: number;
        mimeType?: string;
        dimensions?: {
            width?: number;
            height?: number;
        };
        thumbnailUrl?: string;
        altText?: string;
        uploadedAt?: string;
        uploadedBy?: string;
    };
    templatesUsed?: {
        cost?: number;
        templateId?: string;
        templateName?: string;
        templateCategory?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }[];
    templateImplementations?: {
        results?: {
            performanceMetrics?: Record<string, number>;
            outputExamples?: string[];
            userFeedback?: string[];
        };
        recommendations?: string[];
        customizations?: {
            description?: string;
            impact?: string;
            reasonForChange?: string;
        }[];
        originalTemplate?: {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        };
        lessonsLearned?: string[];
    }[];
    roiMetrics?: {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    };
    archivedAt?: string;
    previousVersions?: string[];
}>;
export declare const CreateCaseStudyRequestSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    type: z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>;
    industry: z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>;
    tags: z.ZodArray<z.ZodString, "many">;
    difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    content: z.ZodObject<{
        challenge: z.ZodString;
        solution: z.ZodString;
        implementation: z.ZodString;
        results: z.ZodString;
        learnings: z.ZodString;
        nextSteps: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    }, {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    }>;
    templatesUsed: z.ZodArray<z.ZodObject<Omit<{
        templateId: z.ZodString;
        templateName: z.ZodString;
        templateVersion: z.ZodString;
        templateCategory: z.ZodString;
        usageDescription: z.ZodString;
        customizations: z.ZodArray<z.ZodString, "many">;
        resultsWithTemplate: z.ZodString;
        licenseType: z.ZodString;
        purchaseDate: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "templateName" | "templateCategory">, "strip", z.ZodTypeAny, {
        cost?: number;
        templateId?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }, {
        cost?: number;
        templateId?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }>, "many">;
    roiMetrics: z.ZodOptional<z.ZodObject<{
        timeSaved: z.ZodOptional<z.ZodObject<{
            hours: z.ZodNumber;
            period: z.ZodEnum<["day", "week", "month", "project"]>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        }, {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        }>>;
        costSavings: z.ZodOptional<z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
            period: z.ZodEnum<["day", "week", "month", "project"]>;
            calculation: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        }, {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        }>>;
        qualityMetrics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            improvement: z.ZodNumber;
            unit: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }>, "many">>;
        productivityGains: z.ZodOptional<z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }, {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }>, "many">>;
        claudeMetrics: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            tokensSaved: z.ZodNumber;
            costPerToken: z.ZodNumber;
            totalCostSavings: z.ZodNumber;
            responseQualityImprovement: z.ZodNumber;
            consistencyImprovement: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        }, {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    }, {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    }>>;
    performanceMetrics: z.ZodOptional<z.ZodObject<{
        templatesUsed: z.ZodOptional<z.ZodNumber>;
        implementationTime: z.ZodOptional<z.ZodNumber>;
        projectDuration: z.ZodOptional<z.ZodNumber>;
        teamSize: z.ZodOptional<z.ZodNumber>;
        outputQuality: z.ZodOptional<z.ZodNumber>;
        efficiency: z.ZodOptional<z.ZodNumber>;
        errorReduction: z.ZodOptional<z.ZodNumber>;
        stakeholderSatisfaction: z.ZodOptional<z.ZodNumber>;
        beforeAfter: z.ZodOptional<z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            unit: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    }, {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    }>>;
    collaborators: z.ZodOptional<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        contribution: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }, {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }>, "many">>;
    config: z.ZodOptional<z.ZodObject<{
        allowComments: z.ZodOptional<z.ZodBoolean>;
        allowSharing: z.ZodOptional<z.ZodBoolean>;
        showAuthor: z.ZodOptional<z.ZodBoolean>;
        showMetrics: z.ZodOptional<z.ZodBoolean>;
        requireEmailToView: z.ZodOptional<z.ZodBoolean>;
        featured: z.ZodOptional<z.ZodBoolean>;
        priority: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    }, {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
    config?: {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    };
    tags?: string[];
    content?: {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    };
    title?: string;
    performanceMetrics?: {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    };
    industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    collaborators?: {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }[];
    subtitle?: string;
    templatesUsed?: {
        cost?: number;
        templateId?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }[];
    roiMetrics?: {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    };
}, {
    description?: string;
    type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
    config?: {
        priority?: number;
        featured?: boolean;
        allowComments?: boolean;
        allowSharing?: boolean;
        showAuthor?: boolean;
        showMetrics?: boolean;
        requireEmailToView?: boolean;
    };
    tags?: string[];
    content?: {
        results?: string;
        implementation?: string;
        nextSteps?: string;
        challenge?: string;
        solution?: string;
        learnings?: string;
    };
    title?: string;
    performanceMetrics?: {
        efficiency?: number;
        templatesUsed?: number;
        implementationTime?: number;
        projectDuration?: number;
        teamSize?: number;
        outputQuality?: number;
        errorReduction?: number;
        stakeholderSatisfaction?: number;
        beforeAfter?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
        }[];
    };
    industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
    difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
    collaborators?: {
        name?: string;
        userId?: string;
        role?: string;
        contribution?: string;
    }[];
    subtitle?: string;
    templatesUsed?: {
        cost?: number;
        templateId?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }[];
    roiMetrics?: {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    };
}>;
export declare const CaseStudyFilterSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>, z.ZodArray<z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>, "many">]>>;
    industry: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>, z.ZodArray<z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>, "many">]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    difficulty: z.ZodOptional<z.ZodArray<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>, "many">>;
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["draft", "submitted", "under-review", "approved", "featured", "archived", "rejected"]>, z.ZodArray<z.ZodEnum<["draft", "submitted", "under-review", "approved", "featured", "archived", "rejected"]>, "many">]>>;
    templateIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    templateCategories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minROI: z.ZodOptional<z.ZodNumber>;
    minTimeSaved: z.ZodOptional<z.ZodNumber>;
    minQualityImprovement: z.ZodOptional<z.ZodNumber>;
    minViews: z.ZodOptional<z.ZodNumber>;
    minLikes: z.ZodOptional<z.ZodNumber>;
    minHelpfulVotes: z.ZodOptional<z.ZodNumber>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    publishedAfter: z.ZodOptional<z.ZodString>;
    publishedBefore: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    verifiedAuthorsOnly: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    featuredOnly: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    search?: string;
    status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review" | ("draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review")[];
    type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case" | ("template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case")[];
    tags?: string[];
    authorId?: string;
    industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit" | ("other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit")[];
    difficulty?: ("advanced" | "expert" | "intermediate" | "beginner")[];
    templateIds?: string[];
    templateCategories?: string[];
    minROI?: number;
    minTimeSaved?: number;
    minQualityImprovement?: number;
    minViews?: number;
    minLikes?: number;
    minHelpfulVotes?: number;
    createdAfter?: string;
    createdBefore?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    verifiedAuthorsOnly?: boolean;
    featuredOnly?: boolean;
}, {
    search?: string;
    status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review" | ("draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review")[];
    type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case" | ("template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case")[];
    tags?: string[];
    authorId?: string;
    industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit" | ("other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit")[];
    difficulty?: ("advanced" | "expert" | "intermediate" | "beginner")[];
    templateIds?: string[];
    templateCategories?: string[];
    minROI?: number;
    minTimeSaved?: number;
    minQualityImprovement?: number;
    minViews?: number;
    minLikes?: number;
    minHelpfulVotes?: number;
    createdAfter?: string;
    createdBefore?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    verifiedAuthorsOnly?: boolean;
    featuredOnly?: boolean;
}>;
export type CaseStudyInput = z.input<typeof CaseStudySchema>;
export type CaseStudyOutput = z.output<typeof CaseStudySchema>;
export type CreateCaseStudyInput = z.input<typeof CreateCaseStudyRequestSchema>;
export type CaseStudyFilterInput = z.input<typeof CaseStudyFilterSchema>;
declare const _default: {
    CaseStudySchema: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        summary: z.ZodString;
        type: z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>;
        status: z.ZodEnum<["draft", "submitted", "under-review", "approved", "featured", "archived", "rejected"]>;
        industry: z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>;
        tags: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
        content: z.ZodObject<{
            challenge: z.ZodString;
            solution: z.ZodString;
            implementation: z.ZodString;
            results: z.ZodString;
            learnings: z.ZodString;
            nextSteps: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        }, {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        }>;
        media: z.ZodObject<{
            featured: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
                url: z.ZodString;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                altText: z.ZodOptional<z.ZodString>;
                fileSize: z.ZodOptional<z.ZodNumber>;
                mimeType: z.ZodOptional<z.ZodString>;
                dimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width?: number;
                    height?: number;
                }, {
                    width?: number;
                    height?: number;
                }>>;
                duration: z.ZodOptional<z.ZodNumber>;
                uploadedAt: z.ZodString;
                uploadedBy: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }>, "many">;
            screenshots: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
                url: z.ZodString;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                altText: z.ZodOptional<z.ZodString>;
                fileSize: z.ZodOptional<z.ZodNumber>;
                mimeType: z.ZodOptional<z.ZodString>;
                dimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width?: number;
                    height?: number;
                }, {
                    width?: number;
                    height?: number;
                }>>;
                duration: z.ZodOptional<z.ZodNumber>;
                uploadedAt: z.ZodString;
                uploadedBy: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }>, "many">;
            videos: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
                url: z.ZodString;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                altText: z.ZodOptional<z.ZodString>;
                fileSize: z.ZodOptional<z.ZodNumber>;
                mimeType: z.ZodOptional<z.ZodString>;
                dimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width?: number;
                    height?: number;
                }, {
                    width?: number;
                    height?: number;
                }>>;
                duration: z.ZodOptional<z.ZodNumber>;
                uploadedAt: z.ZodString;
                uploadedBy: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }>, "many">;
            documents: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
                url: z.ZodString;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                altText: z.ZodOptional<z.ZodString>;
                fileSize: z.ZodOptional<z.ZodNumber>;
                mimeType: z.ZodOptional<z.ZodString>;
                dimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width?: number;
                    height?: number;
                }, {
                    width?: number;
                    height?: number;
                }>>;
                duration: z.ZodOptional<z.ZodNumber>;
                uploadedAt: z.ZodString;
                uploadedBy: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }>, "many">;
            charts: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
                url: z.ZodString;
                thumbnailUrl: z.ZodOptional<z.ZodString>;
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                altText: z.ZodOptional<z.ZodString>;
                fileSize: z.ZodOptional<z.ZodNumber>;
                mimeType: z.ZodOptional<z.ZodString>;
                dimensions: z.ZodOptional<z.ZodObject<{
                    width: z.ZodNumber;
                    height: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    width?: number;
                    height?: number;
                }, {
                    width?: number;
                    height?: number;
                }>>;
                duration: z.ZodOptional<z.ZodNumber>;
                uploadedAt: z.ZodString;
                uploadedBy: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }, {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            featured?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            charts?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            documents?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            screenshots?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            videos?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
        }, {
            featured?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            charts?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            documents?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            screenshots?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            videos?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
        }>;
        featuredImage: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
            url: z.ZodString;
            thumbnailUrl: z.ZodOptional<z.ZodString>;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            altText: z.ZodOptional<z.ZodString>;
            fileSize: z.ZodOptional<z.ZodNumber>;
            mimeType: z.ZodOptional<z.ZodString>;
            dimensions: z.ZodOptional<z.ZodObject<{
                width: z.ZodNumber;
                height: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                width?: number;
                height?: number;
            }, {
                width?: number;
                height?: number;
            }>>;
            duration: z.ZodOptional<z.ZodNumber>;
            uploadedAt: z.ZodString;
            uploadedBy: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }, {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        }>>;
        templatesUsed: z.ZodArray<z.ZodObject<{
            templateId: z.ZodString;
            templateName: z.ZodString;
            templateVersion: z.ZodString;
            templateCategory: z.ZodString;
            usageDescription: z.ZodString;
            customizations: z.ZodArray<z.ZodString, "many">;
            resultsWithTemplate: z.ZodString;
            licenseType: z.ZodString;
            purchaseDate: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }, {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }>, "many">;
        templateImplementations: z.ZodArray<z.ZodObject<{
            originalTemplate: z.ZodObject<{
                templateId: z.ZodString;
                templateName: z.ZodString;
                templateVersion: z.ZodString;
                templateCategory: z.ZodString;
                usageDescription: z.ZodString;
                customizations: z.ZodArray<z.ZodString, "many">;
                resultsWithTemplate: z.ZodString;
                licenseType: z.ZodString;
                purchaseDate: z.ZodOptional<z.ZodString>;
                cost: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                cost?: number;
                templateId?: string;
                templateName?: string;
                templateCategory?: string;
                templateVersion?: string;
                usageDescription?: string;
                customizations?: string[];
                resultsWithTemplate?: string;
                licenseType?: string;
                purchaseDate?: string;
            }, {
                cost?: number;
                templateId?: string;
                templateName?: string;
                templateCategory?: string;
                templateVersion?: string;
                usageDescription?: string;
                customizations?: string[];
                resultsWithTemplate?: string;
                licenseType?: string;
                purchaseDate?: string;
            }>;
            customizations: z.ZodArray<z.ZodObject<{
                description: z.ZodString;
                reasonForChange: z.ZodString;
                impact: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                impact?: string;
                reasonForChange?: string;
            }, {
                description?: string;
                impact?: string;
                reasonForChange?: string;
            }>, "many">;
            results: z.ZodObject<{
                outputExamples: z.ZodArray<z.ZodString, "many">;
                performanceMetrics: z.ZodRecord<z.ZodString, z.ZodNumber>;
                userFeedback: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                performanceMetrics?: Record<string, number>;
                outputExamples?: string[];
                userFeedback?: string[];
            }, {
                performanceMetrics?: Record<string, number>;
                outputExamples?: string[];
                userFeedback?: string[];
            }>;
            lessonsLearned: z.ZodArray<z.ZodString, "many">;
            recommendations: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            results?: {
                performanceMetrics?: Record<string, number>;
                outputExamples?: string[];
                userFeedback?: string[];
            };
            recommendations?: string[];
            customizations?: {
                description?: string;
                impact?: string;
                reasonForChange?: string;
            }[];
            originalTemplate?: {
                cost?: number;
                templateId?: string;
                templateName?: string;
                templateCategory?: string;
                templateVersion?: string;
                usageDescription?: string;
                customizations?: string[];
                resultsWithTemplate?: string;
                licenseType?: string;
                purchaseDate?: string;
            };
            lessonsLearned?: string[];
        }, {
            results?: {
                performanceMetrics?: Record<string, number>;
                outputExamples?: string[];
                userFeedback?: string[];
            };
            recommendations?: string[];
            customizations?: {
                description?: string;
                impact?: string;
                reasonForChange?: string;
            }[];
            originalTemplate?: {
                cost?: number;
                templateId?: string;
                templateName?: string;
                templateCategory?: string;
                templateVersion?: string;
                usageDescription?: string;
                customizations?: string[];
                resultsWithTemplate?: string;
                licenseType?: string;
                purchaseDate?: string;
            };
            lessonsLearned?: string[];
        }>, "many">;
        roiMetrics: z.ZodObject<{
            timeSaved: z.ZodObject<{
                hours: z.ZodNumber;
                period: z.ZodEnum<["day", "week", "month", "project"]>;
                description: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            }, {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            }>;
            costSavings: z.ZodObject<{
                amount: z.ZodNumber;
                currency: z.ZodString;
                period: z.ZodEnum<["day", "week", "month", "project"]>;
                calculation: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            }, {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            }>;
            qualityMetrics: z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                improvement: z.ZodNumber;
                unit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }>, "many">;
            productivityGains: z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                value: z.ZodNumber;
                unit: z.ZodString;
                description: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }, {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }>, "many">;
            claudeMetrics: z.ZodOptional<z.ZodObject<{
                tokensSaved: z.ZodNumber;
                costPerToken: z.ZodNumber;
                totalCostSavings: z.ZodNumber;
                responseQualityImprovement: z.ZodNumber;
                consistencyImprovement: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            }, {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        }, {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        }>;
        performanceMetrics: z.ZodObject<{
            templatesUsed: z.ZodNumber;
            implementationTime: z.ZodNumber;
            projectDuration: z.ZodNumber;
            teamSize: z.ZodNumber;
            outputQuality: z.ZodNumber;
            efficiency: z.ZodNumber;
            errorReduction: z.ZodNumber;
            stakeholderSatisfaction: z.ZodNumber;
            beforeAfter: z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                unit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        }, {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        }>;
        author: z.ZodObject<{
            userId: z.ZodString;
            name: z.ZodString;
            title: z.ZodOptional<z.ZodString>;
            company: z.ZodOptional<z.ZodString>;
            profileUrl: z.ZodOptional<z.ZodString>;
            avatar: z.ZodOptional<z.ZodString>;
            verified: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            title?: string;
            userId?: string;
            company?: string;
            verified?: boolean;
            profileUrl?: string;
            avatar?: string;
        }, {
            name?: string;
            title?: string;
            userId?: string;
            company?: string;
            verified?: boolean;
            profileUrl?: string;
            avatar?: string;
        }>;
        collaborators: z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            contribution: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }, {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }>, "many">;
        engagement: z.ZodObject<{
            views: z.ZodNumber;
            likes: z.ZodNumber;
            shares: z.ZodNumber;
            bookmarks: z.ZodNumber;
            comments: z.ZodNumber;
            helpfulVotes: z.ZodNumber;
            followUps: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            bookmarks?: number;
            comments?: number;
            views?: number;
            likes?: number;
            helpfulVotes?: number;
            shares?: number;
            followUps?: number;
        }, {
            bookmarks?: number;
            comments?: number;
            views?: number;
            likes?: number;
            helpfulVotes?: number;
            shares?: number;
            followUps?: number;
        }>;
        moderation: z.ZodObject<{
            submittedAt: z.ZodString;
            submittedBy: z.ZodString;
            reviewedAt: z.ZodOptional<z.ZodString>;
            reviewedBy: z.ZodOptional<z.ZodString>;
            approvalNotes: z.ZodOptional<z.ZodString>;
            rejectionReason: z.ZodOptional<z.ZodString>;
            featuredAt: z.ZodOptional<z.ZodString>;
            featuredBy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            submittedAt?: string;
            submittedBy?: string;
            reviewedAt?: string;
            reviewedBy?: string;
            approvalNotes?: string;
            rejectionReason?: string;
            featuredAt?: string;
            featuredBy?: string;
        }, {
            submittedAt?: string;
            submittedBy?: string;
            reviewedAt?: string;
            reviewedBy?: string;
            approvalNotes?: string;
            rejectionReason?: string;
            featuredAt?: string;
            featuredBy?: string;
        }>;
        seo: z.ZodObject<{
            slug: z.ZodString;
            metaTitle: z.ZodString;
            metaDescription: z.ZodString;
            keywords: z.ZodArray<z.ZodString, "many">;
            canonicalUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            keywords?: string[];
            slug?: string;
            metaTitle?: string;
            metaDescription?: string;
            canonicalUrl?: string;
        }, {
            keywords?: string[];
            slug?: string;
            metaTitle?: string;
            metaDescription?: string;
            canonicalUrl?: string;
        }>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        publishedAt: z.ZodOptional<z.ZodString>;
        archivedAt: z.ZodOptional<z.ZodString>;
        version: z.ZodString;
        previousVersions: z.ZodArray<z.ZodString, "many">;
        config: z.ZodObject<{
            allowComments: z.ZodBoolean;
            allowSharing: z.ZodBoolean;
            showAuthor: z.ZodBoolean;
            showMetrics: z.ZodBoolean;
            requireEmailToView: z.ZodBoolean;
            featured: z.ZodBoolean;
            priority: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        }, {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        }>;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        createdAt?: string;
        updatedAt?: string;
        description?: string;
        status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review";
        type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
        config?: {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        };
        tags?: string[];
        version?: string;
        author?: {
            name?: string;
            title?: string;
            userId?: string;
            company?: string;
            verified?: boolean;
            profileUrl?: string;
            avatar?: string;
        };
        content?: {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        };
        summary?: string;
        title?: string;
        performanceMetrics?: {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        };
        media?: {
            featured?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            charts?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            documents?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            screenshots?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            videos?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
        };
        engagement?: {
            bookmarks?: number;
            comments?: number;
            views?: number;
            likes?: number;
            helpfulVotes?: number;
            shares?: number;
            followUps?: number;
        };
        seo?: {
            keywords?: string[];
            slug?: string;
            metaTitle?: string;
            metaDescription?: string;
            canonicalUrl?: string;
        };
        industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        moderation?: {
            submittedAt?: string;
            submittedBy?: string;
            reviewedAt?: string;
            reviewedBy?: string;
            approvalNotes?: string;
            rejectionReason?: string;
            featuredAt?: string;
            featuredBy?: string;
        };
        collaborators?: {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }[];
        publishedAt?: string;
        subtitle?: string;
        featuredImage?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        };
        templatesUsed?: {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }[];
        templateImplementations?: {
            results?: {
                performanceMetrics?: Record<string, number>;
                outputExamples?: string[];
                userFeedback?: string[];
            };
            recommendations?: string[];
            customizations?: {
                description?: string;
                impact?: string;
                reasonForChange?: string;
            }[];
            originalTemplate?: {
                cost?: number;
                templateId?: string;
                templateName?: string;
                templateCategory?: string;
                templateVersion?: string;
                usageDescription?: string;
                customizations?: string[];
                resultsWithTemplate?: string;
                licenseType?: string;
                purchaseDate?: string;
            };
            lessonsLearned?: string[];
        }[];
        roiMetrics?: {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        };
        archivedAt?: string;
        previousVersions?: string[];
    }, {
        id?: string;
        createdAt?: string;
        updatedAt?: string;
        description?: string;
        status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review";
        type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
        config?: {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        };
        tags?: string[];
        version?: string;
        author?: {
            name?: string;
            title?: string;
            userId?: string;
            company?: string;
            verified?: boolean;
            profileUrl?: string;
            avatar?: string;
        };
        content?: {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        };
        summary?: string;
        title?: string;
        performanceMetrics?: {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        };
        media?: {
            featured?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            charts?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            documents?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            screenshots?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
            videos?: {
                id?: string;
                description?: string;
                type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
                title?: string;
                url?: string;
                duration?: number;
                fileSize?: number;
                mimeType?: string;
                dimensions?: {
                    width?: number;
                    height?: number;
                };
                thumbnailUrl?: string;
                altText?: string;
                uploadedAt?: string;
                uploadedBy?: string;
            }[];
        };
        engagement?: {
            bookmarks?: number;
            comments?: number;
            views?: number;
            likes?: number;
            helpfulVotes?: number;
            shares?: number;
            followUps?: number;
        };
        seo?: {
            keywords?: string[];
            slug?: string;
            metaTitle?: string;
            metaDescription?: string;
            canonicalUrl?: string;
        };
        industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        moderation?: {
            submittedAt?: string;
            submittedBy?: string;
            reviewedAt?: string;
            reviewedBy?: string;
            approvalNotes?: string;
            rejectionReason?: string;
            featuredAt?: string;
            featuredBy?: string;
        };
        collaborators?: {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }[];
        publishedAt?: string;
        subtitle?: string;
        featuredImage?: {
            id?: string;
            description?: string;
            type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
            title?: string;
            url?: string;
            duration?: number;
            fileSize?: number;
            mimeType?: string;
            dimensions?: {
                width?: number;
                height?: number;
            };
            thumbnailUrl?: string;
            altText?: string;
            uploadedAt?: string;
            uploadedBy?: string;
        };
        templatesUsed?: {
            cost?: number;
            templateId?: string;
            templateName?: string;
            templateCategory?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }[];
        templateImplementations?: {
            results?: {
                performanceMetrics?: Record<string, number>;
                outputExamples?: string[];
                userFeedback?: string[];
            };
            recommendations?: string[];
            customizations?: {
                description?: string;
                impact?: string;
                reasonForChange?: string;
            }[];
            originalTemplate?: {
                cost?: number;
                templateId?: string;
                templateName?: string;
                templateCategory?: string;
                templateVersion?: string;
                usageDescription?: string;
                customizations?: string[];
                resultsWithTemplate?: string;
                licenseType?: string;
                purchaseDate?: string;
            };
            lessonsLearned?: string[];
        }[];
        roiMetrics?: {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        };
        archivedAt?: string;
        previousVersions?: string[];
    }>;
    CreateCaseStudyRequestSchema: z.ZodObject<{
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        type: z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>;
        industry: z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>;
        tags: z.ZodArray<z.ZodString, "many">;
        difficulty: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
        content: z.ZodObject<{
            challenge: z.ZodString;
            solution: z.ZodString;
            implementation: z.ZodString;
            results: z.ZodString;
            learnings: z.ZodString;
            nextSteps: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        }, {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        }>;
        templatesUsed: z.ZodArray<z.ZodObject<Omit<{
            templateId: z.ZodString;
            templateName: z.ZodString;
            templateVersion: z.ZodString;
            templateCategory: z.ZodString;
            usageDescription: z.ZodString;
            customizations: z.ZodArray<z.ZodString, "many">;
            resultsWithTemplate: z.ZodString;
            licenseType: z.ZodString;
            purchaseDate: z.ZodOptional<z.ZodString>;
            cost: z.ZodOptional<z.ZodNumber>;
        }, "templateName" | "templateCategory">, "strip", z.ZodTypeAny, {
            cost?: number;
            templateId?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }, {
            cost?: number;
            templateId?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }>, "many">;
        roiMetrics: z.ZodOptional<z.ZodObject<{
            timeSaved: z.ZodOptional<z.ZodObject<{
                hours: z.ZodNumber;
                period: z.ZodEnum<["day", "week", "month", "project"]>;
                description: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            }, {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            }>>;
            costSavings: z.ZodOptional<z.ZodObject<{
                amount: z.ZodNumber;
                currency: z.ZodString;
                period: z.ZodEnum<["day", "week", "month", "project"]>;
                calculation: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            }, {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            }>>;
            qualityMetrics: z.ZodOptional<z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                improvement: z.ZodNumber;
                unit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }>, "many">>;
            productivityGains: z.ZodOptional<z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                value: z.ZodNumber;
                unit: z.ZodString;
                description: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }, {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }>, "many">>;
            claudeMetrics: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                tokensSaved: z.ZodNumber;
                costPerToken: z.ZodNumber;
                totalCostSavings: z.ZodNumber;
                responseQualityImprovement: z.ZodNumber;
                consistencyImprovement: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            }, {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            }>>>;
        }, "strip", z.ZodTypeAny, {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        }, {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        }>>;
        performanceMetrics: z.ZodOptional<z.ZodObject<{
            templatesUsed: z.ZodOptional<z.ZodNumber>;
            implementationTime: z.ZodOptional<z.ZodNumber>;
            projectDuration: z.ZodOptional<z.ZodNumber>;
            teamSize: z.ZodOptional<z.ZodNumber>;
            outputQuality: z.ZodOptional<z.ZodNumber>;
            efficiency: z.ZodOptional<z.ZodNumber>;
            errorReduction: z.ZodOptional<z.ZodNumber>;
            stakeholderSatisfaction: z.ZodOptional<z.ZodNumber>;
            beforeAfter: z.ZodOptional<z.ZodArray<z.ZodObject<{
                metric: z.ZodString;
                before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
                unit: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }, {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        }, {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        }>>;
        collaborators: z.ZodOptional<z.ZodArray<z.ZodObject<{
            userId: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            contribution: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }, {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }>, "many">>;
        config: z.ZodOptional<z.ZodObject<{
            allowComments: z.ZodOptional<z.ZodBoolean>;
            allowSharing: z.ZodOptional<z.ZodBoolean>;
            showAuthor: z.ZodOptional<z.ZodBoolean>;
            showMetrics: z.ZodOptional<z.ZodBoolean>;
            requireEmailToView: z.ZodOptional<z.ZodBoolean>;
            featured: z.ZodOptional<z.ZodBoolean>;
            priority: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        }, {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
        config?: {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        };
        tags?: string[];
        content?: {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        };
        title?: string;
        performanceMetrics?: {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        };
        industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        collaborators?: {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }[];
        subtitle?: string;
        templatesUsed?: {
            cost?: number;
            templateId?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }[];
        roiMetrics?: {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        };
    }, {
        description?: string;
        type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case";
        config?: {
            priority?: number;
            featured?: boolean;
            allowComments?: boolean;
            allowSharing?: boolean;
            showAuthor?: boolean;
            showMetrics?: boolean;
            requireEmailToView?: boolean;
        };
        tags?: string[];
        content?: {
            results?: string;
            implementation?: string;
            nextSteps?: string;
            challenge?: string;
            solution?: string;
            learnings?: string;
        };
        title?: string;
        performanceMetrics?: {
            efficiency?: number;
            templatesUsed?: number;
            implementationTime?: number;
            projectDuration?: number;
            teamSize?: number;
            outputQuality?: number;
            errorReduction?: number;
            stakeholderSatisfaction?: number;
            beforeAfter?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
            }[];
        };
        industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit";
        difficulty?: "advanced" | "expert" | "intermediate" | "beginner";
        collaborators?: {
            name?: string;
            userId?: string;
            role?: string;
            contribution?: string;
        }[];
        subtitle?: string;
        templatesUsed?: {
            cost?: number;
            templateId?: string;
            templateVersion?: string;
            usageDescription?: string;
            customizations?: string[];
            resultsWithTemplate?: string;
            licenseType?: string;
            purchaseDate?: string;
        }[];
        roiMetrics?: {
            costSavings?: {
                amount?: number;
                period?: "project" | "month" | "week" | "day";
                currency?: string;
                calculation?: string;
            };
            qualityMetrics?: {
                before?: string | number;
                after?: string | number;
                metric?: string;
                unit?: string;
                improvement?: number;
            }[];
            timeSaved?: {
                description?: string;
                period?: "project" | "month" | "week" | "day";
                hours?: number;
            };
            productivityGains?: {
                description?: string;
                value?: number;
                metric?: string;
                unit?: string;
            }[];
            claudeMetrics?: {
                costPerToken?: number;
                tokensSaved?: number;
                totalCostSavings?: number;
                responseQualityImprovement?: number;
                consistencyImprovement?: number;
            };
        };
    }>;
    CaseStudyFilterSchema: z.ZodObject<{
        type: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>, z.ZodArray<z.ZodEnum<["template-success", "user-story", "roi-analysis", "before-after", "industry-showcase", "community-highlight", "innovation-case"]>, "many">]>>;
        industry: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>, z.ZodArray<z.ZodEnum<["film-production", "advertising", "gaming", "publishing", "education", "healthcare", "finance", "technology", "legal", "consulting", "e-commerce", "non-profit", "other"]>, "many">]>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        difficulty: z.ZodOptional<z.ZodArray<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>, "many">>;
        status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["draft", "submitted", "under-review", "approved", "featured", "archived", "rejected"]>, z.ZodArray<z.ZodEnum<["draft", "submitted", "under-review", "approved", "featured", "archived", "rejected"]>, "many">]>>;
        templateIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        templateCategories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        minROI: z.ZodOptional<z.ZodNumber>;
        minTimeSaved: z.ZodOptional<z.ZodNumber>;
        minQualityImprovement: z.ZodOptional<z.ZodNumber>;
        minViews: z.ZodOptional<z.ZodNumber>;
        minLikes: z.ZodOptional<z.ZodNumber>;
        minHelpfulVotes: z.ZodOptional<z.ZodNumber>;
        createdAfter: z.ZodOptional<z.ZodString>;
        createdBefore: z.ZodOptional<z.ZodString>;
        publishedAfter: z.ZodOptional<z.ZodString>;
        publishedBefore: z.ZodOptional<z.ZodString>;
        authorId: z.ZodOptional<z.ZodString>;
        verifiedAuthorsOnly: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodString>;
        featuredOnly: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        search?: string;
        status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review" | ("draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review")[];
        type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case" | ("template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case")[];
        tags?: string[];
        authorId?: string;
        industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit" | ("other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit")[];
        difficulty?: ("advanced" | "expert" | "intermediate" | "beginner")[];
        templateIds?: string[];
        templateCategories?: string[];
        minROI?: number;
        minTimeSaved?: number;
        minQualityImprovement?: number;
        minViews?: number;
        minLikes?: number;
        minHelpfulVotes?: number;
        createdAfter?: string;
        createdBefore?: string;
        publishedAfter?: string;
        publishedBefore?: string;
        verifiedAuthorsOnly?: boolean;
        featuredOnly?: boolean;
    }, {
        search?: string;
        status?: "draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review" | ("draft" | "featured" | "approved" | "rejected" | "submitted" | "archived" | "under-review")[];
        type?: "template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case" | ("template-success" | "user-story" | "roi-analysis" | "before-after" | "industry-showcase" | "community-highlight" | "innovation-case")[];
        tags?: string[];
        authorId?: string;
        industry?: "other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit" | ("other" | "publishing" | "education" | "technology" | "finance" | "legal" | "consulting" | "film-production" | "advertising" | "gaming" | "healthcare" | "e-commerce" | "non-profit")[];
        difficulty?: ("advanced" | "expert" | "intermediate" | "beginner")[];
        templateIds?: string[];
        templateCategories?: string[];
        minROI?: number;
        minTimeSaved?: number;
        minQualityImprovement?: number;
        minViews?: number;
        minLikes?: number;
        minHelpfulVotes?: number;
        createdAfter?: string;
        createdBefore?: string;
        publishedAfter?: string;
        publishedBefore?: string;
        verifiedAuthorsOnly?: boolean;
        featuredOnly?: boolean;
    }>;
    CaseStudyMediaSchema: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["image", "video", "document", "screenshot", "chart", "infographic", "audio"]>;
        url: z.ZodString;
        thumbnailUrl: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        altText: z.ZodOptional<z.ZodString>;
        fileSize: z.ZodOptional<z.ZodNumber>;
        mimeType: z.ZodOptional<z.ZodString>;
        dimensions: z.ZodOptional<z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            width?: number;
            height?: number;
        }, {
            width?: number;
            height?: number;
        }>>;
        duration: z.ZodOptional<z.ZodNumber>;
        uploadedAt: z.ZodString;
        uploadedBy: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        description?: string;
        type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
        title?: string;
        url?: string;
        duration?: number;
        fileSize?: number;
        mimeType?: string;
        dimensions?: {
            width?: number;
            height?: number;
        };
        thumbnailUrl?: string;
        altText?: string;
        uploadedAt?: string;
        uploadedBy?: string;
    }, {
        id?: string;
        description?: string;
        type?: "document" | "audio" | "video" | "image" | "screenshot" | "chart" | "infographic";
        title?: string;
        url?: string;
        duration?: number;
        fileSize?: number;
        mimeType?: string;
        dimensions?: {
            width?: number;
            height?: number;
        };
        thumbnailUrl?: string;
        altText?: string;
        uploadedAt?: string;
        uploadedBy?: string;
    }>;
    ROIMetricsSchema: z.ZodObject<{
        timeSaved: z.ZodObject<{
            hours: z.ZodNumber;
            period: z.ZodEnum<["day", "week", "month", "project"]>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        }, {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        }>;
        costSavings: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
            period: z.ZodEnum<["day", "week", "month", "project"]>;
            calculation: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        }, {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        }>;
        qualityMetrics: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            before: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            after: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
            improvement: z.ZodNumber;
            unit: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }, {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }>, "many">;
        productivityGains: z.ZodArray<z.ZodObject<{
            metric: z.ZodString;
            value: z.ZodNumber;
            unit: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }, {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }>, "many">;
        claudeMetrics: z.ZodOptional<z.ZodObject<{
            tokensSaved: z.ZodNumber;
            costPerToken: z.ZodNumber;
            totalCostSavings: z.ZodNumber;
            responseQualityImprovement: z.ZodNumber;
            consistencyImprovement: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        }, {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    }, {
        costSavings?: {
            amount?: number;
            period?: "project" | "month" | "week" | "day";
            currency?: string;
            calculation?: string;
        };
        qualityMetrics?: {
            before?: string | number;
            after?: string | number;
            metric?: string;
            unit?: string;
            improvement?: number;
        }[];
        timeSaved?: {
            description?: string;
            period?: "project" | "month" | "week" | "day";
            hours?: number;
        };
        productivityGains?: {
            description?: string;
            value?: number;
            metric?: string;
            unit?: string;
        }[];
        claudeMetrics?: {
            costPerToken?: number;
            tokensSaved?: number;
            totalCostSavings?: number;
            responseQualityImprovement?: number;
            consistencyImprovement?: number;
        };
    }>;
    TemplateReferenceSchema: z.ZodObject<{
        templateId: z.ZodString;
        templateName: z.ZodString;
        templateVersion: z.ZodString;
        templateCategory: z.ZodString;
        usageDescription: z.ZodString;
        customizations: z.ZodArray<z.ZodString, "many">;
        resultsWithTemplate: z.ZodString;
        licenseType: z.ZodString;
        purchaseDate: z.ZodOptional<z.ZodString>;
        cost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        cost?: number;
        templateId?: string;
        templateName?: string;
        templateCategory?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }, {
        cost?: number;
        templateId?: string;
        templateName?: string;
        templateCategory?: string;
        templateVersion?: string;
        usageDescription?: string;
        customizations?: string[];
        resultsWithTemplate?: string;
        licenseType?: string;
        purchaseDate?: string;
    }>;
};
export default _default;
//# sourceMappingURL=CaseStudyDataModel.d.ts.map