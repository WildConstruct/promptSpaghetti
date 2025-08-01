/**
 * Epic 16 - Case Study Data Model
 * Task: E16-1753114247140-836984 - Create case study data model
 *
 * Comprehensive data model for marketplace case studies that showcase
 * template success stories, user implementations, and ROI demonstrations.
 * Integrates with Epic 16 marketplace, analytics, and community features.
 */
import { z } from 'zod';
;
duration ?  : number; // For video/audio in seconds
uploadedAt: string;
uploadedBy: string;
;
// Cost savings
costSavings: {
    amount: number;
    currency: string;
    period: 'day' | 'week' | 'month' | 'project';
    calculation: string;
}
;
// Quality improvements
qualityMetrics: {
    metric: string;
    before: number | string;
    after: number | string;
    improvement: number; // Percentage,
    unit ?  : string;
}
[];
// Productivity metrics
productivityGains: {
    metric: string;
    value: number;
    unit: string;
    description: string;
}
[];
// Claude-specific metrics
claudeMetrics ?  : {
    tokensSaved: number,
    costPerToken: number,
    totalCostSavings: number,
    responseQualityImprovement: number,
    consistencyImprovement: number
};
[];
[];
results: {
    outputExamples: string;
    performanceMetrics: Record;
    userFeedback: string;
}
;
lessonsLearned: string;
recommendations: string;
;
// Rich media
media: MediaGallery;
featuredImage ?  : CaseStudyMedia;
// Template integration
templatesUsed: TemplateReference;
templateImplementations: TemplateImplementation;
// Metrics and ROI
roiMetrics: ROIMetrics;
performanceMetrics: PerformanceMetrics;
// Attribution and metadata
author: {
    userId: string;
    name: string;
    title ?  : string;
    company ?  : string;
    profileUrl ?  : string;
    avatar ?  : string;
    verified: boolean;
}
;
collaborators: {
    userId: string;
    name: string;
    role: string;
    contribution: string;
}
[];
// Engagement metrics
engagement: {
    views: number;
    likes: number;
    shares: number;
    bookmarks: number;
    comments: number;
    helpfulVotes: number;
    followUps: number; // People who implemented similar solutions,
}
;
// Review and moderation
moderation: {
    submittedAt: string;
    submittedBy: string;
    reviewedAt ?  : string;
    reviewedBy ?  : string;
    approvalNotes ?  : string;
    rejectionReason ?  : string;
    featuredAt ?  : string;
    featuredBy ?  : string;
}
;
// SEO and discovery
seo: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    canonicalUrl ?  : string;
}
;
// Timestamps
createdAt: string;
updatedAt: string;
publishedAt ?  : string;
archivedAt ?  : string;
// Version control
version: string;
previousVersions: string;
// Configuration
config: {
    allowComments: boolean;
    allowSharing: boolean;
    showAuthor: boolean;
    showMetrics: boolean;
    requireEmailToView: boolean;
    featured: boolean;
    priority: number; // For ordering,
}
;
'helpfulVotes' | 'roiValue' | 'timeSaved' | 'title' | 'priority';
direction: 'asc' | 'desc',
;
;
include ?  : ('media' | 'templates' | 'metrics' | 'author' | 'engagement')[];
;
aggregations: {
    totalCaseStudies: number;
    byType: Array;
    byIndustry: Array;
    byDifficulty: Array;
    featuredCount: number;
}
;
topCountries: Array;
topCities: Array;
// Referral data
topReferrers: Array;
searchKeywords: Array;
// Temporal data
viewsByDay: Array;
engagementByWeek: Array;
// User segments
viewsByUserType: Array;
viewsByIndustry: Array;
export const CaseStudyMediaSchema = z.object({});
id: z.string().uuid(),
    type;
z.enum(['image', 'video', 'document', 'screenshot', 'chart', 'infographic', 'audio']),
    url;
z.string().url(),
    thumbnailUrl;
z.string().url().optional(),
    title;
z.string().min(1).max(200),
    description;
z.string().max(1000).optional(),
    altText;
z.string().max(500).optional(),
    fileSize;
z.number().int().min(0).optional(),
    mimeType;
z.string().optional(),
    dimensions;
z.object({});
width: z.number().int().min(1),
    height;
z.number().int().min(1),
;
optional(),
    duration;
z.number().min(0).optional(),
    uploadedAt;
z.string().datetime(),
    uploadedBy;
z.string().uuid();
;
// ROI metrics schema
export const ROIMetricsSchema = z.object({});
timeSaved: z.object({});
hours: z.number().min(0),
    period;
z.enum(['day', 'week', 'month', 'project']),
    description;
z.string().min(1).max(500),
;
costSavings: z.object({});
amount: z.number().min(0),
    currency;
z.string().length(3),
    period;
z.enum(['day', 'week', 'month', 'project']),
    calculation;
z.string().min(1).max(1000),
;
qualityMetrics: z.array(z.object({}), metric, z.string().min(1).max(100), before, z.union([z.number(), z.string()]), after, z.union([z.number(), z.string()]), improvement, z.number().min(-100).max(1000), unit, z.string().max(50).optional());
productivityGains: z.array(z.object({}), metric, z.string().min(1).max(100), value, z.number(), unit, z.string().max(50), description, z.string().min(1).max(500));
claudeMetrics: z.object({});
tokensSaved: z.number().int().min(0),
    costPerToken;
z.number().min(0),
    totalCostSavings;
z.number().min(0),
    responseQualityImprovement;
z.number().min(0).max(100),
    consistencyImprovement;
z.number().min(0).max(100),
;
optional();
;
// Template reference schema
export const TemplateReferenceSchema = z.object({});
templateId: z.string().uuid(),
    templateName;
z.string().min(1).max(200),
    templateVersion;
z.string().min(1).max(50),
    templateCategory;
z.string().min(1).max(100),
    usageDescription;
z.string().min(1).max(1000),
    customizations;
z.array(z.string().max(500)),
    resultsWithTemplate;
z.string().min(1).max(2000),
    licenseType;
z.string().min(1).max(100),
    purchaseDate;
z.string().datetime().optional(),
    cost;
z.number().min(0).optional(),
;
;
// Main case study schema
export const CaseStudySchema = z.object({});
id: z.string().uuid(),
    title;
z.string().min(1).max(200),
    subtitle;
z.string().max(300).optional(),
    description;
z.string().min(1).max(2000),
    summary;
z.string().min(1).max(500),
    type;
z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']),
    status;
z.enum(['draft', 'submitted', 'under-review', 'approved', 'featured', 'archived', 'rejected']),
    industry;
z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']),
    tags;
z.array(z.string().min(1).max(50)).max(20),
    difficulty;
z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    content;
z.object({});
challenge: z.string().min(1).max(5000),
    solution;
z.string().min(1).max(5000),
    implementation;
z.string().min(1).max(5000),
    results;
z.string().min(1).max(5000),
    learnings;
z.string().min(1).max(5000),
    nextSteps;
z.string().max(2000).optional(),
;
media: z.object({});
featured: z.array(CaseStudyMediaSchema),
    screenshots;
z.array(CaseStudyMediaSchema),
    videos;
z.array(CaseStudyMediaSchema),
    documents;
z.array(CaseStudyMediaSchema),
    charts;
z.array(CaseStudyMediaSchema),
;
featuredImage: CaseStudyMediaSchema.optional(),
    templatesUsed;
z.array(TemplateReferenceSchema),
    templateImplementations;
z.array(z.object({}), originalTemplate, TemplateReferenceSchema, customizations, z.array(z.object({}), description, z.string().min(1).max(1000), reasonForChange, z.string().min(1).max(1000), impact, z.string().min(1).max(1000))),
    results;
z.object({});
outputExamples: z.array(z.string().max(2000)),
    performanceMetrics;
z.record(z.number()),
    userFeedback;
z.array(z.string().max(1000)),
;
lessonsLearned: z.array(z.string().max(1000)),
    recommendations;
z.array(z.string().max(1000));
roiMetrics: ROIMetricsSchema,
    performanceMetrics;
z.object({});
templatesUsed: z.number().int().min(0),
    implementationTime;
z.number().min(0),
    projectDuration;
z.number().min(0),
    teamSize;
z.number().int().min(1),
    outputQuality;
z.number().min(1).max(10),
    efficiency;
z.number().min(0),
    errorReduction;
z.number().min(0).max(100),
    stakeholderSatisfaction;
z.number().min(1).max(10),
    beforeAfter;
z.array(z.object({}), metric, z.string().min(1).max(100), before, z.union([z.number(), z.string()]), after, z.union([z.number(), z.string()]), unit, z.string().max(50).optional());
author: z.object({});
userId: z.string().uuid(),
    name;
z.string().min(1).max(100),
    title;
z.string().max(100).optional(),
    company;
z.string().max(100).optional(),
    profileUrl;
z.string().url().optional(),
    avatar;
z.string().url().optional(),
    verified;
z.boolean(),
;
collaborators: z.array(z.object({}), userId, z.string().uuid(), name, z.string().min(1).max(100), role, z.string().min(1).max(100), contribution, z.string().min(1).max(500));
engagement: z.object({});
views: z.number().int().min(0),
    likes;
z.number().int().min(0),
    shares;
z.number().int().min(0),
    bookmarks;
z.number().int().min(0),
    comments;
z.number().int().min(0),
    helpfulVotes;
z.number().int().min(0),
    followUps;
z.number().int().min(0),
;
moderation: z.object({});
submittedAt: z.string().datetime(),
    submittedBy;
z.string().uuid(),
    reviewedAt;
z.string().datetime().optional(),
    reviewedBy;
z.string().uuid().optional(),
    approvalNotes;
z.string().max(1000).optional(),
    rejectionReason;
z.string().max(1000).optional(),
    featuredAt;
z.string().datetime().optional(),
    featuredBy;
z.string().uuid().optional(),
;
seo: z.object({});
slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
    metaTitle;
z.string().min(1).max(60),
    metaDescription;
z.string().min(1).max(160),
    keywords;
z.array(z.string().min(1).max(50)).max(20),
    canonicalUrl;
z.string().url().optional(),
;
createdAt: z.string().datetime(),
    updatedAt;
z.string().datetime(),
    publishedAt;
z.string().datetime().optional(),
    archivedAt;
z.string().datetime().optional(),
    version;
z.string().min(1).max(20),
    previousVersions;
z.array(z.string()),
    config;
z.object({});
allowComments: z.boolean(),
    allowSharing;
z.boolean(),
    showAuthor;
z.boolean(),
    showMetrics;
z.boolean(),
    requireEmailToView;
z.boolean(),
    featured;
z.boolean(),
    priority;
z.number().int().min(0).max(100),
;
;
// Create case study request schema
export const CreateCaseStudyRequestSchema = z.object({});
title: z.string().min(1).max(200),
    subtitle;
z.string().max(300).optional(),
    description;
z.string().min(1).max(2000),
    type;
z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']),
    industry;
z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']),
    tags;
z.array(z.string().min(1).max(50)).max(20),
    difficulty;
z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    content;
CaseStudySchema.shape.content,
    templatesUsed;
z.array(TemplateReferenceSchema.omit({ templateName: true, templateCategory: true })),
    roiMetrics;
ROIMetricsSchema.partial().optional(),
    performanceMetrics;
CaseStudySchema.shape.performanceMetrics.partial().optional(),
    collaborators;
z.array(CaseStudySchema.shape.collaborators.element).optional(),
    config;
CaseStudySchema.shape.config.partial().optional();
;
// Case study filter schema
export const CaseStudyFilterSchema = z.object({});
type: z.union([]),
    z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']),
    z.array(z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']));
optional(),
    industry;
z.union([]),
    z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']),
    z.array(z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']));
optional(),
    tags;
z.array(z.string()).optional(),
    difficulty;
z.array(z.enum(['beginner', 'intermediate', 'advanced', 'expert'])).optional(),
    status;
z.union([]),
    z.enum(['draft', 'submitted', 'under-review', 'approved', 'featured', 'archived', 'rejected']),
    z.array(z.enum(['draft', 'submitted', 'under-review', 'approved', 'featured', 'archived', 'rejected']));
optional(),
    templateIds;
z.array(z.string().uuid()).optional(),
    templateCategories;
z.array(z.string()).optional(),
    minROI;
z.number().min(0).optional(),
    minTimeSaved;
z.number().min(0).optional(),
    minQualityImprovement;
z.number().min(0).optional(),
    minViews;
z.number().int().min(0).optional(),
    minLikes;
z.number().int().min(0).optional(),
    minHelpfulVotes;
z.number().int().min(0).optional(),
    createdAfter;
z.string().datetime().optional(),
    createdBefore;
z.string().datetime().optional(),
    publishedAfter;
z.string().datetime().optional(),
    publishedBefore;
z.string().datetime().optional(),
    authorId;
z.string().uuid().optional(),
    verifiedAuthorsOnly;
z.boolean().optional(),
    search;
z.string().max(200).optional(),
    featuredOnly;
z.boolean().optional(),
;
strict();
export default {
    CaseStudySchema,
    CreateCaseStudyRequestSchema,
    CaseStudyFilterSchema,
    CaseStudyMediaSchema,
    ROIMetricsSchema,
    TemplateReferenceSchema
};
