/**
 * Epic 16 Contribution Data Model
 * Task: E16-1753114247117-36F668 - Create contribution data model
 * 
 * Comprehensive data types for all Epic 16 contribution types including
 * templates, knowledge base articles, case studies, and community content.
 */
import { z } from 'zod';

// =============================================================================
// Core Contribution Types
// =============================================================================

export const ContributionTypeSchema = z.enum([)
  'template',
  'knowledge_article',
  'tutorial',
  'case_study',
  'pattern_library',
  'community_post',
  'documentation',
  'review'
]);

export const ContributionStatusSchema = z.enum([)
  'draft',
  'submitted',
  'under_review',
  'revision_requested',
  'approved',
  'published',
  'rejected',
  'archived'
]);

export const ContributionQualityRatingSchema = z.enum([)
  'poor',
  'fair',
  'good',
  'excellent',
  'exceptional'
]);

export const ContributorLevelSchema = z.enum([)
  'newcomer',
  'contributor',
  'regular',
  'trusted',
  'expert',
  'moderator'
]);

// =============================================================================
// Base Contribution Schema
// =============================================================================

export const BaseContributionSchema = z.object({)
  id: z.string().uuid(),
  type: ContributionTypeSchema,
  contributorId: z.string().uuid(),
  contributorName: z.string(),
  contributorLevel: ContributorLevelSchema,
  // Basic Information
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  tags: z.array(z.string()).max(20).default([]),
  category: z.string().optional(),
  // Content
  content: z.record(z.unknown()).default({}),
  assets: z.array(z.object({,)
  id: z.string(),
  type: z.enum(['image', 'video', 'document', 'code', 'graph']),
  url: z.string().url(),
  filename: z.string(),
  size: z.number().positive(),
  mimeType: z.string(),
})).default([]),
  // Workflow Status
  status: ContributionStatusSchema,
  submittedAt: z.date(),
  reviewedAt: z.date().optional(),
  publishedAt: z.date().optional(),
  // Quality and Moderation
  qualityScore: z.number().min(0).max(100).default(0),
  qualityRating: ContributionQualityRatingSchema.optional(),
  moderatorNotes: z.string().optional(),
  revisionRequests: z.array(z.object({,)
  id: z.string(),
  moderatorId: z.string(),
  moderatorName: z.string(),
  reason: z.string(),
  details: z.string(),
  requestedAt: z.date(),
  resolvedAt: z.date().optional(),
})).default([]),
  // Metrics
  views: z.number().int().default(0),
  downloads: z.number().int().default(0),
  likes: z.number().int().default(0),
  comments: z.number().int().default(0),
  shares: z.number().int().default(0),
  // Metadata
  version: z.string().default('1.0.0'),
  versionHistory: z.array(z.object({,)
  version: z.string(),
  changes: z.string(),
  changedAt: z.date(),
  changedBy: z.string(),
})).default([]),
  createdAt: z.date(),
  updatedAt: z.date();
  });

// =============================================================================
// Template Contribution Schema
// =============================================================================

export const TemplateContributionSchema = BaseContributionSchema.extend({)
  type: z.literal('template'),
  content: z.object({,)
  graphJson: z.record(z.unknown()),
  promptYaml: z.string().optional(),
  claudeModel: z.string().default('claude-3-sonnet'),
  tokenEstimate: z.number().int().default(0),
  safetyScore: z.number().min(0).max(1).default(1.0),
  testCases: z.array(z.object({,)
  input: z.string(),
  expectedOutput: z.string(),
  actualOutput: z.string().optional(),
  passed: z.boolean().optional(),
})).default([]),
    pricing: z.object({,)
  type: z.enum(['free', 'paid']),
  priceInCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).default('USD'),
}
  }),
  marketplace: z.object({,)
  isListed: z.boolean().default(false),
  listedAt: z.date().optional(),
  salesCount: z.number().int().default(0),
  revenue: z.number().default(0),
  avgRating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().default(0),
}).optional()
});

// =============================================================================
// Knowledge Article Contribution Schema
// =============================================================================

export const KnowledgeArticleContributionSchema = BaseContributionSchema.extend({)
  type: z.literal('knowledge_article'),
  content: z.object({,)
  articleType: z.enum(['guide', 'tutorial', 'reference', 'faq', 'troubleshooting']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  estimatedReadTime: z.number().int().positive(),
  prerequisites: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  // Content Structure
  sections: z.array(z.object({,)
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number().int(),
  type: z.enum(['text', 'code', 'image', 'video', 'interactive']),
})),
    // Interactive Elements
    codeExamples: z.array(z.object({,)
  id: z.string(),
  language: z.string(),
  code: z.string(),
  description: z.string(),
  runnable: z.boolean().default(false),
})).default([]),
    // SEO and Discovery
    keywords: z.array(z.string()).default([]),
    relatedArticles: z.array(z.string()).default([]),
    externalLinks: z.array(z.object({,)
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
})).default([])
  }
});

// =============================================================================
// Tutorial Contribution Schema
// =============================================================================

export const TutorialContributionSchema = BaseContributionSchema.extend({)
  type: z.literal('tutorial'),
  content: z.object({,)
  tutorialType: z.enum(['step_by_step', 'video', 'interactive', 'workshop']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  estimatedDuration: z.number().int().positive(), // minutes,
  prerequisites: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  // Tutorial Structure
  steps: z.array(z.object({,)
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  order: z.number().int(),
  estimatedTime: z.number().int(),
  assets: z.array(z.string()).default([]),
  checkpoints: z.array(z.object({,)
  description: z.string(),
  validation: z.string().optional(),
})).default([])
    })),
    // Expected Outcomes
    deliverables: z.array(z.string()).default([]),
    skillsLearned: z.array(z.string()).default([]),
    // Support Materials
    downloadableResources: z.array(z.object({,)
  name: z.string(),
  type: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
})).default([])
  }
});

// =============================================================================
// Case Study Contribution Schema
// =============================================================================

export const CaseStudyContributionSchema = BaseContributionSchema.extend({)
  type: z.literal('case_study'),
  content: z.object({,)
  caseStudyType: z.enum(['success_story', 'implementation', 'roi_analysis', 'comparison', 'innovation']),
  industry: z.string(),
  useCase: z.string(),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  // Story Structure
  challenge: z.object({,)
  description: z.string(),
  painPoints: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
}),
    solution: z.object({,)
  description: z.string(),
  approach: z.string(),
  templatesUsed: z.array(z.string()).default([]),
  implementation: z.string(),
  timeline: z.string().optional(),
}),
    results: z.object({,)
  outcomes: z.array(z.string()).default([]),
  metrics: z.array(z.object({,)
  name: z.string(),
  before: z.string(),
  after: z.string(),
  improvement: z.string().optional(),
})).default([]),
      roi: z.object({,)
  costSavings: z.number().optional(),
  timeReduction: z.string().optional(),
  qualityImprovement: z.string().optional(),
  description: z.string().optional(),
}).optional()
    }),
    // Supporting Materials
    testimonials: z.array(z.object({,)
  author: z.string(),
  role: z.string(),
  company: z.string().optional(),
  quote: z.string(),
  avatar: z.string().url().optional(),
})).default([]),
    mediaGallery: z.array(z.object({,)
  type: z.enum(['before_after', 'screenshot', 'video', 'diagram']),
  url: z.string().url(),
  caption: z.string(),
  order: z.number().int(),
})).default([])
  }
});

// =============================================================================
// Pattern Library Contribution Schema
// =============================================================================

export const PatternLibraryContributionSchema = BaseContributionSchema.extend({)
  type: z.literal('pattern_library'),
  content: z.object({,)
  patternType: z.enum(['prompt_pattern', 'graph_pattern', 'workflow_pattern', 'integration_pattern']),
  domain: z.string(),
  complexity: z.enum(['simple', 'moderate', 'complex', 'advanced']),
  // Pattern Definition
  pattern: z.object({,)
  name: z.string(),
  intent: z.string(),
  motivation: z.string(),
  applicability: z.string(),
  structure: z.string(),
  participants: z.array(z.string()).default([]),
  collaborations: z.string().optional(),
  consequences: z.string(),
  implementation: z.string(),
  sampleCode: z.string().optional(),
  knownUses: z.array(z.string()).default([]),
}),
    // Examples and Variations
    examples: z.array(z.object({,)
  title: z.string(),
  description: z.string(),
  code: z.string(),
  explanation: z.string(),
})).default([]),
    variations: z.array(z.object({,)
  name: z.string(),
  description: z.string(),
  whenToUse: z.string(),
  tradeoffs: z.string(),
})).default([]),
    // Related Patterns
    relatedPatterns: z.array(z.object({,)
  patternId: z.string(),
  relationship: z.enum(['uses', 'used_by', 'similar_to', 'alternative_to']),
  description: z.string(),
})).default([])
  }
});

// =============================================================================
// Community Post Contribution Schema
// =============================================================================

export const CommunityPostContributionSchema = BaseContributionSchema.extend({)
  type: z.literal('community_post'),
  content: z.object({,)
  postType: z.enum(['discussion', 'question', 'announcement', 'showcase', 'feedback']),
  forum: z.string(),
  isSticky: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  // Discussion Structure
  body: z.string(),
  replies: z.array(z.object({,)
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  votes: z.number().int().default(0),
  isAcceptedAnswer: z.boolean().default(false),
})).default([]),
    // Engagement
    votes: z.number().int().default(0),
    bookmarks: z.number().int().default(0),
    isResolved: z.boolean().default(false),
    acceptedAnswerId: z.string().optional();
  }
});

// =============================================================================
// Contribution Request/Response Schemas
// =============================================================================

export const CreateContributionRequestSchema = z.object({)
  type: ContributionTypeSchema,
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  category: z.string().optional(),
  tags: z.array(z.string()).max(20).default([]),
  content: z.record(z.unknown()),
  assets: z.array(z.string()).default([]),
  saveAsDraft: z.boolean().default(false),
});

export const UpdateContributionRequestSchema = z.object({)
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(2000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).max(20).optional(),
  content: z.record(z.unknown()).optional(),
  assets: z.array(z.string()).optional(),
});

export const ContributionReviewRequestSchema = z.object({)
  action: z.enum(['approve', 'request_revision', 'reject']),
  qualityRating: ContributionQualityRatingSchema.optional(),
  moderatorNotes: z.string().optional(),
  revisionRequests: z.array(z.object({,)
  reason: z.string(),
  details: z.string(),
})).optional()
});

export const ContributionFilterSchema = z.object({)
  type: ContributionTypeSchema.optional(),
  status: ContributionStatusSchema.optional(),
  contributorId: z.string().uuid().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  qualityRating: ContributionQualityRatingSchema.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'views', 'likes', 'quality_score']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// =============================================================================
// Contributor Profile Schema
// =============================================================================

export const ContributorProfileSchema = z.object({)
  id: z.string().uuid(),
  userId: z.string().uuid(),
  // Profile Information
  displayName: z.string(),
  bio: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  location: z.string().optional(),
  website: z.string().url().optional(),
  social: z.object({,)
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
}).optional(),
  // Contribution Stats
  level: ContributorLevelSchema,
  totalContributions: z.number().int().default(0),
  publishedContributions: z.number().int().default(0),
  totalViews: z.number().int().default(0),
  totalLikes: z.number().int().default(0),
  averageQualityScore: z.number().min(0).max(100).default(0),
  // Recognition
  badges: z.array(z.object({,)
  id: z.string(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().url(),
  earnedAt: z.date(),
})).default([]),
  achievements: z.array(z.object({,)
  id: z.string(),
  name: z.string(),
  description: z.string(),
  progress: z.number().min(0).max(100),
  completedAt: z.date().optional(),
})).default([]),
  // Preferences
  notificationPreferences: z.object({,)
  emailOnComment: z.boolean().default(true),
  emailOnLike: z.boolean().default(false),
  emailOnFeature: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
}).default({}),
  createdAt: z.date(),
  updatedAt: z.date();
  });

// =============================================================================
// Type Exports
// =============================================================================

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

export type Contribution = 
  | TemplateContribution 
  | KnowledgeArticleContribution 
  | TutorialContribution 
  | CaseStudyContribution 
  | PatternLibraryContribution 
  | CommunityPostContribution;

export type CreateContributionRequest = z.infer<typeof CreateContributionRequestSchema>;
export type UpdateContributionRequest = z.infer<typeof UpdateContributionRequestSchema>;
export type ContributionReviewRequest = z.infer<typeof ContributionReviewRequestSchema>;
export type ContributionFilter = z.infer<typeof ContributionFilterSchema>;
export type ContributorProfile = z.infer<typeof ContributorProfileSchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

export const validateContribution = (contribution: unknown): Contribution => {
  const base = BaseContributionSchema.parse(contribution);
  switch (base.type) {
  case 'template':
    return TemplateContributionSchema.parse(contribution);
  case 'knowledge_article':
    return KnowledgeArticleContributionSchema.parse(contribution);
  case 'tutorial':
    return TutorialContributionSchema.parse(contribution);
  case 'case_study':
    return CaseStudyContributionSchema.parse(contribution);
  case 'pattern_library':
    return PatternLibraryContributionSchema.parse(contribution);
  case 'community_post':
    return CommunityPostContributionSchema.parse(contribution);
  default:
    throw new Error(`Unknown contribution type: ${base.type}`);}
};

export const validateCreateContributionRequest = (request: unknown): CreateContributionRequest => {
  return CreateContributionRequestSchema.parse(request);
};

export const validateUpdateContributionRequest = (request: unknown): UpdateContributionRequest => {
  return UpdateContributionRequestSchema.parse(request);
};

export const validateContributionReviewRequest = (request: unknown): ContributionReviewRequest => {
  return ContributionReviewRequestSchema.parse(request);
};

export const validateContributionFilter = (filter: unknown): ContributionFilter => {
  return ContributionFilterSchema.parse(filter);
};

export const validateContributorProfile = (profile: unknown): ContributorProfile => {
  return ContributorProfileSchema.parse(profile);
};

// =============================================================================
// Constants and Descriptions
// =============================================================================

export const CONTRIBUTION_TYPE_DESCRIPTIONS = {
  template: 'Reusable prompt templates for the marketplace',
  knowledge_article: 'Educational articles and guides',
  tutorial: 'Step-by-step learning content',
  case_study: 'Real-world implementation stories',
  pattern_library: 'Reusable design and prompt patterns',
  community_post: 'Community discussions and questions',
  documentation: 'Technical documentation',
  review: 'Reviews and feedback on templates',
} as const;

export const CONTRIBUTION_STATUS_DESCRIPTIONS = {
  draft: 'Work in progress, not yet submitted',
  submitted: 'Submitted for review',
  under_review: 'Currently being reviewed by moderators',
  revision_requested: 'Changes requested before approval',
  approved: 'Approved but not yet published',
  published: 'Live and publicly available',
  rejected: 'Rejected and will not be published',
  archived: 'Removed from public view',
} as const;

export const CONTRIBUTOR_LEVEL_DESCRIPTIONS = {
  newcomer: 'New to the platform',
  contributor: 'Has made initial contributions',
  regular: 'Regular contributor with good quality',
  trusted: 'Trusted contributor with high quality work',
  expert: 'Expert contributor with exceptional content',
  moderator: 'Community moderator and content reviewer',
} as const;

export const CONTRIBUTION_DEFAULTS = {
  QUALITY_THRESHOLD_PUBLISH: 70,
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_TAGS: 20,
  MAX_ASSETS_PER_CONTRIBUTION: 50,
  MAX_ASSET_SIZE_MB: 10,
  AUTO_PUBLISH_SCORE_THRESHOLD: 90,
  FEATURED_CONTRIBUTION_THRESHOLD: 95,
} as const;