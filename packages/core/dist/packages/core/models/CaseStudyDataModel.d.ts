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
    featured: CaseStudyMedia;
    screenshots: CaseStudyMedia;
    videos: CaseStudyMedia;
    documents: CaseStudyMedia;
    charts: CaseStudyMedia;
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
    customizations: string;
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
        outputExamples: string;
        performanceMetrics: Record<string, number>;
        userFeedback: string;
    };
    lessonsLearned: string;
    recommendations: string;
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
    tags: string;
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
    templatesUsed: TemplateReference;
    templateImplementations: TemplateImplementation;
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
        keywords: string;
        canonicalUrl?: string;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    archivedAt?: string;
    version: string;
    previousVersions: string;
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
    tags: string;
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
    tags?: string;
    content?: Partial<CaseStudy['content']>;
    templatesUsed?: TemplateReference;
    templateImplementations?: TemplateImplementation;
    roiMetrics?: Partial<ROIMetrics>;
    performanceMetrics?: Partial<PerformanceMetrics>;
    collaborators?: CaseStudy['collaborators'];
    config?: Partial<CaseStudy['config']>;
    updateReason: string;
}
export interface CaseStudyFilter {
    type?: CaseStudyType | CaseStudyType;
    industry?: IndustryCategory | IndustryCategory;
    tags?: string;
    difficulty?: ('beginner' | 'intermediate' | 'advanced' | 'expert')[];
    status?: CaseStudyStatus | CaseStudyStatus;
    templateIds?: string;
    templateCategories?: string;
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
    field: 'createdAt' | 'publishedAt' | 'updatedAt' | 'views' | 'likes' | ;
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
    caseStudies: CaseStudy;
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
export declare const CaseStudyMediaSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ROIMetricsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const TemplateReferenceSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CaseStudySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CreateCaseStudyRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CaseStudyFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CaseStudyInput = z.input<typeof CaseStudySchema>;
export type CaseStudyOutput = z.output<typeof CaseStudySchema>;
export type CreateCaseStudyInput = z.input<typeof CreateCaseStudyRequestSchema>;
export type CaseStudyFilterInput = z.input<typeof CaseStudyFilterSchema>;
declare const _default: {
    CaseStudySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    CreateCaseStudyRequestSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    CaseStudyFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    CaseStudyMediaSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    ROIMetricsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    TemplateReferenceSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
};
export default _default;
//# sourceMappingURL=CaseStudyDataModel.d.ts.map