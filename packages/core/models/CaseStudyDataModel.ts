/**
 * Epic 16 - Case Study Data Model
 * Task: E16-1753114247140-836984 - Create case study data model
 * 
 * Comprehensive data model for marketplace case studies that showcase
 * template success stories, user implementations, and ROI demonstrations.
 * Integrates with Epic 16 marketplace, analytics, and community features.
 */
import { z } from 'zod';

// ====================================
// Core Case Study Types
// ====================================

// Case study types
export type CaseStudyType = 
  | 'template-success'      // Template implementation success story
  | 'user-story'           // Community user story
  | 'roi-analysis'         // ROI and cost savings analysis
  | 'before-after'         // Before/after comparison
  | 'industry-showcase'    // Industry-specific use case
  | 'community-highlight'  // Community member spotlight
  | 'innovation-case';     // Innovative template usage

// Case study status
export type CaseStudyStatus = 
  | 'draft'                // Being created
  | 'submitted'            // Submitted for review
  | 'under-review'         // Being reviewed by moderators
  | 'approved'             // Approved and published
  | 'featured'             // Featured case study
  | 'archived'             // Archived/removed
  | 'rejected';            // Rejected during review

// Industry categories
export type IndustryCategory = 
  | 'film-production'
  | 'advertising'
  | 'gaming'
  | 'publishing'
  | 'education'
  | 'healthcare'
  | 'finance'
  | 'technology'
  | 'legal'
  | 'consulting'
  | 'e-commerce'
  | 'non-profit'
  | 'other';

// Media types for rich content
export type MediaType = 
  | 'image'
  | 'video'
  | 'document'
  | 'screenshot'
  | 'chart'
  | 'infographic'
  | 'audio';

// ====================================
// Media and Rich Content
// ====================================

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
  duration?: number; // For video/audio in seconds
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

// ====================================
// Metrics and ROI Data
// ====================================

export interface ROIMetrics {
  // Time savings
  timeSaved: {,
    hours: number;
    period: 'day' | 'week' | 'month' | 'project';
    description: string;
  };
  // Cost savings
  costSavings: {,
    amount: number;
    currency: string;
    period: 'day' | 'week' | 'month' | 'project';
    calculation: string;
  };
  // Quality improvements
  qualityMetrics: {,
    metric: string;
    before: number | string;
    after: number | string;
    improvement: number; // Percentage
    unit?: string;
  }[];
  // Productivity metrics
  productivityGains: {,
    metric: string;
    value: number;
    unit: string;
    description: string;
  }[];
  // Claude-specific metrics
  claudeMetrics?: {
    tokensSaved: number;
    costPerToken: number;
    totalCostSavings: number;
    responseQualityImprovement: number;
    consistencyImprovement: number;
  };
}

export interface PerformanceMetrics {
  // Usage statistics
  templatesUsed: number;
  implementationTime: number; // Hours
  projectDuration: number; // Days
  teamSize: number;
  // Results achieved
  outputQuality: number; // 1-10 scale
  efficiency: number; // Percentage improvement
  errorReduction: number; // Percentage
  stakeholderSatisfaction: number; // 1-10 scale
  // Comparison metrics
  beforeAfter: {,
    metric: string;
    before: number | string;
    after: number | string;
    unit?: string;
  }[];
}

// ====================================
// Template Integration
// ====================================

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
  customizations: {,
    description: string;
    reasonForChange: string;
    impact: string;
  }[];
  results: {,
    outputExamples: string[];
    performanceMetrics: Record<string, number>;
    userFeedback: string[];
  };
  lessonsLearned: string[];
  recommendations: string[];
}

// ====================================
// Core Case Study Model
// ====================================

export interface CaseStudy {
  // Basic information
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  summary: string; // Short summary for cards/listings
  // Classification
  type: CaseStudyType;
  status: CaseStudyStatus;
  industry: IndustryCategory;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  // Content structure
  content: {,
    challenge: string;         // Problem being solved
    solution: string;          // How templates helped
    implementation: string;    // How it was implemented
    results: string;          // Outcomes achieved
    learnings: string;        // Key takeaways
    nextSteps?: string;       // Future plans
  };
  // Rich media
  media: MediaGallery;
  featuredImage?: CaseStudyMedia;
  // Template integration
  templatesUsed: TemplateReference[];
  templateImplementations: TemplateImplementation[];
  // Metrics and ROI
  roiMetrics: ROIMetrics;
  performanceMetrics: PerformanceMetrics;
  // Attribution and metadata
  author: {,
    userId: string;
    name: string;
    title?: string;
    company?: string;
    profileUrl?: string;
    avatar?: string;
    verified: boolean;
  };
  collaborators: {,
    userId: string;
    name: string;
    role: string;
    contribution: string;
  }[];
  // Engagement metrics
  engagement: {,
    views: number;
    likes: number;
    shares: number;
    bookmarks: number;
    comments: number;
    helpfulVotes: number;
    followUps: number; // People who implemented similar solutions
  };
  // Review and moderation
  moderation: {,
    submittedAt: string;
    submittedBy: string;
    reviewedAt?: string;
    reviewedBy?: string;
    approvalNotes?: string;
    rejectionReason?: string;
    featuredAt?: string;
    featuredBy?: string;
  };
  // SEO and discovery
  seo: {,
    slug: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  // Version control
  version: string;
  previousVersions: string[];
  // Configuration
  config: {,
    allowComments: boolean;
    allowSharing: boolean;
    showAuthor: boolean;
    showMetrics: boolean;
    requireEmailToView: boolean;
    featured: boolean;
    priority: number; // For ordering
  };
}

// ====================================
// Case Study Creation and Updates
// ====================================

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
  // Optional fields
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

// ====================================
// Case Study Queries and Filters
// ====================================

export interface CaseStudyFilter {
  type?: CaseStudyType | CaseStudyType[];
  industry?: IndustryCategory | IndustryCategory[];
  tags?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced' | 'expert')[];
  status?: CaseStudyStatus | CaseStudyStatus[];
  // Template filters
  templateIds?: string[];
  templateCategories?: string[];
  // Metric filters
  minROI?: number;
  minTimeSaved?: number;
  minQualityImprovement?: number;
  // Engagement filters
  minViews?: number;
  minLikes?: number;
  minHelpfulVotes?: number;
  // Date filters
  createdAfter?: string;
  createdBefore?: string;
  publishedAfter?: string;
  publishedBefore?: string;
  // Author filters
  authorId?: string;
  verifiedAuthorsOnly?: boolean;
  // Text search
  search?: string;
  // Featured content
  featuredOnly?: boolean;
}

export interface CaseStudySort {
  field: 'createdAt' | 'publishedAt' | 'updatedAt' | 'views' | 'likes' | ,
         'helpfulVotes' | 'roiValue' | 'timeSaved' | 'title' | 'priority';
  direction: 'asc' | 'desc';
}

export interface CaseStudyQuery {
  filters?: CaseStudyFilter;
  sort?: CaseStudySort;
  pagination: {,
    offset: number;
    limit: number;
  };
  include?: ('media' | 'templates' | 'metrics' | 'author' | 'engagement')[];
}

export interface CaseStudyQueryResponse {
  caseStudies: CaseStudy[];
  pagination: {,
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  aggregations: {,
    totalCaseStudies: number;
    byType: Array<{ type: CaseStudyType; count: number }>;
    byIndustry: Array<{ industry: IndustryCategory; count: number }>;
    byDifficulty: Array<{ difficulty: string; count: number }>;
    featuredCount: number;
  };
}

// ====================================
// Case Study Analytics
// ====================================

export interface CaseStudyAnalytics {
  caseStudyId: string;
  // View analytics
  totalViews: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  // Engagement analytics
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalBookmarks: number;
  helpfulnessRating: number;
  // Template impact
  templatesDiscovered: number;
  templatePurchases: number;
  implementationAttempts: number;
  // Geographic data
  topCountries: Array<{ country: string; views: number }>;
  topCities: Array<{ city: string; views: number }>;
  // Referral data
  topReferrers: Array<{ source: string; visits: number }>;
  searchKeywords: Array<{ keyword: string; frequency: number }>;
  // Temporal data
  viewsByDay: Array<{ date: string; views: number }>;
  engagementByWeek: Array<{ week: string; engagement: number }>;
  // User segments
  viewsByUserType: Array<{ userType: string; count: number }>;
  viewsByIndustry: Array<{ industry: string; count: number }>;
}

// ====================================
// Zod Validation Schemas
// ====================================

// Media schema
export const CaseStudyMediaSchema = z.object({)
  id: z.string().uuid(),
  type: z.enum(['image', 'video', 'document', 'screenshot', 'chart', 'infographic', 'audio']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  altText: z.string().max(500).optional(),
  fileSize: z.number().int().min(0).optional(),
  mimeType: z.string().optional(),
  dimensions: z.object({),
    width: z.number().int().min(1),
    height: z.number().int().min(1),
  }).optional(),
  duration: z.number().min(0).optional(),
  uploadedAt: z.string().datetime(),
  uploadedBy: z.string().uuid(),
});

// ROI metrics schema
export const ROIMetricsSchema = z.object({)
  timeSaved: z.object({),
    hours: z.number().min(0),
    period: z.enum(['day', 'week', 'month', 'project']),
    description: z.string().min(1).max(500),
  }),
  costSavings: z.object({),
    amount: z.number().min(0),
    currency: z.string().length(3),
    period: z.enum(['day', 'week', 'month', 'project']),
    calculation: z.string().min(1).max(1000),
  }),
  qualityMetrics: z.array(z.object({),
    metric: z.string().min(1).max(100),
    before: z.union([z.number(), z.string()]),
    after: z.union([z.number(), z.string()]),
    improvement: z.number().min(-100).max(1000),
    unit: z.string().max(50).optional(),
  })),
  productivityGains: z.array(z.object({),
    metric: z.string().min(1).max(100),
    value: z.number(),
    unit: z.string().max(50),
    description: z.string().min(1).max(500),
  })),
  claudeMetrics: z.object({),
    tokensSaved: z.number().int().min(0),
    costPerToken: z.number().min(0),
    totalCostSavings: z.number().min(0),
    responseQualityImprovement: z.number().min(0).max(100),
    consistencyImprovement: z.number().min(0).max(100),
  }).optional()
});

// Template reference schema
export const TemplateReferenceSchema = z.object({)
  templateId: z.string().uuid(),
  templateName: z.string().min(1).max(200),
  templateVersion: z.string().min(1).max(50),
  templateCategory: z.string().min(1).max(100),
  usageDescription: z.string().min(1).max(1000),
  customizations: z.array(z.string().max(500)),
  resultsWithTemplate: z.string().min(1).max(2000),
  licenseType: z.string().min(1).max(100),
  purchaseDate: z.string().datetime().optional(),
  cost: z.number().min(0).optional(),
});

// Main case study schema
export const CaseStudySchema = z.object({)
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(1).max(2000),
  summary: z.string().min(1).max(500),
  type: z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']),
  status: z.enum(['draft', 'submitted', 'under-review', 'approved', 'featured', 'archived', 'rejected']),
  industry: z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']),
  tags: z.array(z.string().min(1).max(50)).max(20),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  content: z.object({),
    challenge: z.string().min(1).max(5000),
    solution: z.string().min(1).max(5000),
    implementation: z.string().min(1).max(5000),
    results: z.string().min(1).max(5000),
    learnings: z.string().min(1).max(5000),
    nextSteps: z.string().max(2000).optional(),
  }),
  media: z.object({),
    featured: z.array(CaseStudyMediaSchema),
    screenshots: z.array(CaseStudyMediaSchema),
    videos: z.array(CaseStudyMediaSchema),
    documents: z.array(CaseStudyMediaSchema),
    charts: z.array(CaseStudyMediaSchema),
  }),
  featuredImage: CaseStudyMediaSchema.optional(),
  templatesUsed: z.array(TemplateReferenceSchema),
  templateImplementations: z.array(z.object({),
    originalTemplate: TemplateReferenceSchema,
    customizations: z.array(z.object({),
      description: z.string().min(1).max(1000),
      reasonForChange: z.string().min(1).max(1000),
      impact: z.string().min(1).max(1000),
    })),
    results: z.object({),
      outputExamples: z.array(z.string().max(2000)),
      performanceMetrics: z.record(z.number()),
      userFeedback: z.array(z.string().max(1000)),
    }),
    lessonsLearned: z.array(z.string().max(1000)),
    recommendations: z.array(z.string().max(1000)),
  })),
  roiMetrics: ROIMetricsSchema,
  performanceMetrics: z.object({),
    templatesUsed: z.number().int().min(0),
    implementationTime: z.number().min(0),
    projectDuration: z.number().min(0),
    teamSize: z.number().int().min(1),
    outputQuality: z.number().min(1).max(10),
    efficiency: z.number().min(0),
    errorReduction: z.number().min(0).max(100),
    stakeholderSatisfaction: z.number().min(1).max(10),
    beforeAfter: z.array(z.object({),
      metric: z.string().min(1).max(100),
      before: z.union([z.number(), z.string()]),
      after: z.union([z.number(), z.string()]),
      unit: z.string().max(50).optional(),
    }))
  }),
  author: z.object({),
    userId: z.string().uuid(),
    name: z.string().min(1).max(100),
    title: z.string().max(100).optional(),
    company: z.string().max(100).optional(),
    profileUrl: z.string().url().optional(),
    avatar: z.string().url().optional(),
    verified: z.boolean(),
  }),
  collaborators: z.array(z.object({),
    userId: z.string().uuid(),
    name: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
    contribution: z.string().min(1).max(500),
  })),
  engagement: z.object({),
    views: z.number().int().min(0),
    likes: z.number().int().min(0),
    shares: z.number().int().min(0),
    bookmarks: z.number().int().min(0),
    comments: z.number().int().min(0),
    helpfulVotes: z.number().int().min(0),
    followUps: z.number().int().min(0),
  }),
  moderation: z.object({),
    submittedAt: z.string().datetime(),
    submittedBy: z.string().uuid(),
    reviewedAt: z.string().datetime().optional(),
    reviewedBy: z.string().uuid().optional(),
    approvalNotes: z.string().max(1000).optional(),
    rejectionReason: z.string().max(1000).optional(),
    featuredAt: z.string().datetime().optional(),
    featuredBy: z.string().uuid().optional(),
  }),
  seo: z.object({),
    slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
    metaTitle: z.string().min(1).max(60),
    metaDescription: z.string().min(1).max(160),
    keywords: z.array(z.string().min(1).max(50)).max(20),
    canonicalUrl: z.string().url().optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  archivedAt: z.string().datetime().optional(),
  version: z.string().min(1).max(20),
  previousVersions: z.array(z.string()),
  config: z.object({),
    allowComments: z.boolean(),
    allowSharing: z.boolean(),
    showAuthor: z.boolean(),
    showMetrics: z.boolean(),
    requireEmailToView: z.boolean(),
    featured: z.boolean(),
    priority: z.number().int().min(0).max(100),
  })
});

// Create case study request schema
export const CreateCaseStudyRequestSchema = z.object({)
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(1).max(2000),
  type: z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']),
  industry: z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']),
  tags: z.array(z.string().min(1).max(50)).max(20),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  content: CaseStudySchema.shape.content,
  templatesUsed: z.array(TemplateReferenceSchema.omit({ templateName: true, templateCategory: true })),
  roiMetrics: ROIMetricsSchema.partial().optional(),
  performanceMetrics: CaseStudySchema.shape.performanceMetrics.partial().optional(),
  collaborators: z.array(CaseStudySchema.shape.collaborators.element).optional(),
  config: CaseStudySchema.shape.config.partial().optional(),
});

// Case study filter schema
export const CaseStudyFilterSchema = z.object({)
  type: z.union([),
    z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']),
    z.array(z.enum(['template-success', 'user-story', 'roi-analysis', 'before-after', 'industry-showcase', 'community-highlight', 'innovation-case']))
  ]).optional(),
  industry: z.union([),
    z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']),
    z.array(z.enum(['film-production', 'advertising', 'gaming', 'publishing', 'education', 'healthcare', 'finance', 'technology', 'legal', 'consulting', 'e-commerce', 'non-profit', 'other']))
  ]).optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.array(z.enum(['beginner', 'intermediate', 'advanced', 'expert'])).optional(),
  status: z.union([),
    z.enum(['draft', 'submitted', 'under-review', 'approved', 'featured', 'archived', 'rejected']),
    z.array(z.enum(['draft', 'submitted', 'under-review', 'approved', 'featured', 'archived', 'rejected']))
  ]).optional(),
  templateIds: z.array(z.string().uuid()).optional(),
  templateCategories: z.array(z.string()).optional(),
  minROI: z.number().min(0).optional(),
  minTimeSaved: z.number().min(0).optional(),
  minQualityImprovement: z.number().min(0).optional(),
  minViews: z.number().int().min(0).optional(),
  minLikes: z.number().int().min(0).optional(),
  minHelpfulVotes: z.number().int().min(0).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  publishedAfter: z.string().datetime().optional(),
  publishedBefore: z.string().datetime().optional(),
  authorId: z.string().uuid().optional(),
  verifiedAuthorsOnly: z.boolean().optional(),
  search: z.string().max(200).optional(),
  featuredOnly: z.boolean().optional(),
}).strict();

// Export types for external use
export type CaseStudyInput = z.input<typeof CaseStudySchema>;
export type CaseStudyOutput = z.output<typeof CaseStudySchema>;
export type CreateCaseStudyInput = z.input<typeof CreateCaseStudyRequestSchema>;
export type CaseStudyFilterInput = z.input<typeof CaseStudyFilterSchema>;

export default {
  CaseStudySchema,
  CreateCaseStudyRequestSchema,
  CaseStudyFilterSchema,
  CaseStudyMediaSchema,
  ROIMetricsSchema,
  TemplateReferenceSchema
};