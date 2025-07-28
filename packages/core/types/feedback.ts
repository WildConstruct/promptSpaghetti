/**
 * Epic 16 Feedback System Data Model
 * Task: E16-1753114247084-CE7C08 - Create feedback system
 * 
 * Comprehensive feedback system for all contribution types including
 * ratings, reviews, comments, reports, and moderation workflows.
 */
import { z } from 'zod';

// =============================================================================
// Core Feedback Types
// =============================================================================

export const FeedbackTypeSchema = z.enum([)
  'rating',          // Star rating only
  'review',          // Rating + detailed review
  'comment',         // General comment/discussion
  'report',          // Content report/flag
  'suggestion',      // Improvement suggestion
  'bug_report',      // Bug or issue report
  'feature_request'  // Feature enhancement request
]);

export const FeedbackStatusSchema = z.enum([)
  'pending',         // Awaiting moderation
  'approved',        // Approved and visible
  'rejected',        // Rejected by moderators
  'flagged',         // Flagged for review
  'archived',        // Archived/hidden
  'resolved'         // Resolved (for reports/suggestions)
]);

export const ReportReasonSchema = z.enum([)
  'inappropriate_content',
  'spam',
  'copyright_violation',
  'offensive_language',
  'misleading_information',
  'low_quality',
  'duplicate_content',
  'terms_violation',
  'other'
]);

export const FeedbackCategorySchema = z.enum([)
  'general',
  'usability',
  'performance',
  'documentation',
  'pricing',
  'support',
  'technical',
  'content_quality'
]);

// =============================================================================
// Base Feedback Schema
// =============================================================================

export const BaseFeedbackSchema = z.object({)
  id: z.string().uuid(),
  type: FeedbackTypeSchema,
  category: FeedbackCategorySchema.default('general'),
  // Target Information
  targetType: z.enum(['contribution', 'template', 'user', 'platform']),
  targetId: z.string().uuid(),
  // Author Information
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorVerified: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  // Content
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.object({),
    id: z.string(),
    type: z.enum(['image', 'video', 'document', 'screenshot']),
    url: z.string().url(),
    filename: z.string(),
    size: z.number().positive(),
    mimeType: z.string(),
  })).default([]),
  // Rating (if applicable)
  rating: z.number().min(1).max(5).optional(),
  // Metadata
  status: FeedbackStatusSchema.default('pending'),
  visibility: z.enum(['public', 'private', 'moderated']).default('public'),
  // Engagement
  helpfulVotes: z.number().int().default(0),
  notHelpfulVotes: z.number().int().default(0),
  replies: z.number().int().default(0),
  // Moderation
  moderatedBy: z.string().uuid().optional(),
  moderatedAt: z.date().optional(),
  moderationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().optional(),
  // Additional context
  metadata: z.record(z.unknown()).default({})
});

// =============================================================================
// Specialized Feedback Schemas
// =============================================================================

// Rating/Review Schema
export const ReviewFeedbackSchema = BaseFeedbackSchema.extend({)
  type: z.literal('review'),
  rating: z.number().min(1).max(5),
  // Detailed review fields
  pros: z.array(z.string().max(500)).default([]),
  cons: z.array(z.string().max(500)).default([]),
  useCase: z.string().max(1000).optional(),
  difficultyRating: z.number().min(1).max(5).optional(),
  wouldRecommend: z.boolean().optional(),
  // Purchase verification (for template reviews)
  verifiedPurchase: z.boolean().default(false),
  purchaseDate: z.date().optional(),
  // Template-specific fields
  templateUsage: z.object({),
    timesUsed: z.number().int().min(0).optional(),
    outputQuality: z.number().min(1).max(5).optional(),
    easeOfUse: z.number().min(1).max(5).optional(),
    valueForMoney: z.number().min(1).max(5).optional(),
  }).optional()
});

// Report Schema
export const ReportFeedbackSchema = BaseFeedbackSchema.extend({)
  type: z.literal('report'),
  // Report-specific fields
  reason: ReportReasonSchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  evidence: z.array(z.object({),
    type: z.enum(['screenshot', 'url', 'text', 'video']),
    content: z.string(),
    description: z.string().optional(),
  })).default([]),
  // Investigation fields
  investigatedBy: z.string().uuid().optional(),
  investigatedAt: z.date().optional(),
  investigationNotes: z.string().optional(),
  actionTaken: z.string().optional(),
});

// Bug Report Schema
export const BugReportFeedbackSchema = BaseFeedbackSchema.extend({)
  type: z.literal('bug_report'),
  // Bug-specific fields
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  reproducible: z.boolean().default(false),
  // Technical details
  stepsToReproduce: z.array(z.string()).default([]),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  environment: z.object({),
    browser: z.string().optional(),
    os: z.string().optional(),
    device: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
  // Bug tracking
  assignedTo: z.string().uuid().optional(),
  estimatedEffort: z.number().optional(), // hours
  fixedAt: z.date().optional(),
  fixVersion: z.string().optional(),
});

// Suggestion Schema
export const SuggestionFeedbackSchema = BaseFeedbackSchema.extend({)
  type: z.literal('suggestion'),
  // Suggestion-specific fields
  impact: z.enum(['low', 'medium', 'high']).default('medium'),
  effort: z.enum(['small', 'medium', 'large']).default('medium'),
  // Feature details
  proposedSolution: z.string().optional(),
  benefits: z.array(z.string()).default([]),
  alternatives: z.array(z.string()).default([]),
  // Implementation tracking
  implementationStatus: z.enum(['pending', 'in_progress', 'completed', 'rejected']).default('pending'),
  implementedBy: z.string().uuid().optional(),
  implementedAt: z.date().optional(),
  implementationNotes: z.string().optional(),
});

// =============================================================================
// Feedback Aggregation Schemas
// =============================================================================

export const FeedbackSummarySchema = z.object({)
  targetId: z.string().uuid(),
  targetType: z.string(),
  // Rating summary
  averageRating: z.number().min(0).max(5).default(0),
  totalRatings: z.number().int().default(0),
  ratingDistribution: z.object({),
    1: z.number().int().default(0),
    2: z.number().int().default(0),
    3: z.number().int().default(0),
    4: z.number().int().default(0),
    5: z.number().int().default(0),
  }),
  // Review summary
  totalReviews: z.number().int().default(0),
  verifiedReviews: z.number().int().default(0),
  averageDifficulty: z.number().min(0).max(5).default(0),
  recommendationRate: z.number().min(0).max(100).default(0),
  // General feedback counts
  totalFeedback: z.number().int().default(0),
  feedbackByType: z.record(z.number().int()).default({}),
  feedbackByCategory: z.record(z.number().int()).default({}),
  // Engagement metrics
  totalHelpfulVotes: z.number().int().default(0),
  totalReplies: z.number().int().default(0),
  // Quality indicators
  qualityScore: z.number().min(0).max(100).default(0),
  moderationRate: z.number().min(0).max(100).default(0),
  // Timestamps
  lastUpdated: z.date(),
  generatedAt: z.date(),
});

// =============================================================================
// Feedback Interaction Schemas
// =============================================================================

export const FeedbackVoteSchema = z.object({)
  id: z.string().uuid(),
  feedbackId: z.string().uuid(),
  userId: z.string().uuid(),
  voteType: z.enum(['helpful', 'not_helpful']),
  createdAt: z.date(),
});

export const FeedbackReplySchema = z.object({)
  id: z.string().uuid(),
  feedbackId: z.string().uuid(),
  parentReplyId: z.string().uuid().optional(),
  // Author information
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorType: z.enum(['user', 'creator', 'moderator', 'admin']),
  // Content
  content: z.string().min(1).max(2000),
  attachments: z.array(z.object({),
    id: z.string(),
    type: z.enum(['image', 'document']),
    url: z.string().url(),
    filename: z.string(),
  })).default([]),
  // Status
  status: z.enum(['visible', 'hidden', 'deleted']).default('visible'),
  // Engagement
  likes: z.number().int().default(0),
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  editedAt: z.date().optional(),
});

// =============================================================================
// Request/Response Schemas
// =============================================================================

export const CreateFeedbackRequestSchema = z.object({)
  type: FeedbackTypeSchema,
  category: FeedbackCategorySchema.default('general'),
  targetType: z.enum(['contribution', 'template', 'user', 'platform']),
  targetId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000),
  rating: z.number().min(1).max(5).optional(),
  isAnonymous: z.boolean().default(false),
  // Type-specific fields
  pros: z.array(z.string().max(500)).optional(),
  cons: z.array(z.string().max(500)).optional(),
  useCase: z.string().max(1000).optional(),
  wouldRecommend: z.boolean().optional(),
  // Report fields
  reason: ReportReasonSchema.optional(),
  evidence: z.array(z.string()).optional(),
  // Bug report fields
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  stepsToReproduce: z.array(z.string()).optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

export const UpdateFeedbackRequestSchema = z.object({)
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  rating: z.number().min(1).max(5).optional(),
  pros: z.array(z.string().max(500)).optional(),
  cons: z.array(z.string().max(500)).optional(),
  useCase: z.string().max(1000).optional(),
  wouldRecommend: z.boolean().optional(),
});

export const FeedbackFilterSchema = z.object({)
  targetId: z.string().uuid().optional(),
  targetType: z.enum(['contribution', 'template', 'user', 'platform']).optional(),
  type: FeedbackTypeSchema.optional(),
  category: FeedbackCategorySchema.optional(),
  status: FeedbackStatusSchema.optional(),
  authorId: z.string().uuid().optional(),
  verifiedOnly: z.boolean().optional(),
  minRating: z.number().min(1).max(5).optional(),
  maxRating: z.number().min(1).max(5).optional(),
  hasAttachments: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'rating', 'helpful_votes', 'updated_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const ModerateFeedbackRequestSchema = z.object({)
  action: z.enum(['approve', 'reject', 'flag', 'archive']),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;
export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>;
export type ReportReason = z.infer<typeof ReportReasonSchema>;
export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;

export type BaseFeedback = z.infer<typeof BaseFeedbackSchema>;
export type ReviewFeedback = z.infer<typeof ReviewFeedbackSchema>;
export type ReportFeedback = z.infer<typeof ReportFeedbackSchema>;
export type BugReportFeedback = z.infer<typeof BugReportFeedbackSchema>;
export type SuggestionFeedback = z.infer<typeof SuggestionFeedbackSchema>;

export type Feedback = 
  | BaseFeedback 
  | ReviewFeedback 
  | ReportFeedback 
  | BugReportFeedback 
  | SuggestionFeedback;

export type FeedbackSummary = z.infer<typeof FeedbackSummarySchema>;
export type FeedbackVote = z.infer<typeof FeedbackVoteSchema>;
export type FeedbackReply = z.infer<typeof FeedbackReplySchema>;

export type CreateFeedbackRequest = z.infer<typeof CreateFeedbackRequestSchema>;
export type UpdateFeedbackRequest = z.infer<typeof UpdateFeedbackRequestSchema>;
export type FeedbackFilter = z.infer<typeof FeedbackFilterSchema>;
export type ModerateFeedbackRequest = z.infer<typeof ModerateFeedbackRequestSchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

export const validateFeedback = (feedback: unknown): Feedback => {
  const base = BaseFeedbackSchema.parse(feedback);
  switch (base.type) {
  case 'review':
    return ReviewFeedbackSchema.parse(feedback);
  case 'report':
    return ReportFeedbackSchema.parse(feedback);
  case 'bug_report':
    return BugReportFeedbackSchema.parse(feedback);
  case 'suggestion':
    return SuggestionFeedbackSchema.parse(feedback);
  default:
    return BaseFeedbackSchema.parse(feedback);
  }
};

export const validateCreateFeedbackRequest = (request: unknown): CreateFeedbackRequest => {
  return CreateFeedbackRequestSchema.parse(request);
};

export const validateUpdateFeedbackRequest = (request: unknown): UpdateFeedbackRequest => {
  return UpdateFeedbackRequestSchema.parse(request);
};

export const validateFeedbackFilter = (filter: unknown): FeedbackFilter => {
  return FeedbackFilterSchema.parse(filter);
};

export const validateModerateFeedbackRequest = (request: unknown): ModerateFeedbackRequest => {
  return ModerateFeedbackRequestSchema.parse(request);
};

// =============================================================================
// Constants and Descriptions
// =============================================================================

export const FEEDBACK_TYPE_DESCRIPTIONS = {
  rating: 'Simple star rating',
  review: 'Detailed review with rating',
  comment: 'General comment or discussion',
  report: 'Report inappropriate content',
  suggestion: 'Improvement suggestion',
  bug_report: 'Bug or technical issue',
  feature_request: 'Request for new features'
} as const;

export const FEEDBACK_CATEGORY_DESCRIPTIONS = {
  general: 'General feedback',
  usability: 'User experience and interface',
  performance: 'Speed and performance issues',
  documentation: 'Documentation and help content',
  pricing: 'Pricing and billing',
  support: 'Customer support experience',
  technical: 'Technical issues and bugs',
  content_quality: 'Quality of content and templates'
} as const;

export const REPORT_REASON_DESCRIPTIONS = {
  inappropriate_content: 'Content is inappropriate or offensive',
  spam: 'Spam or promotional content',
  copyright_violation: 'Copyright or intellectual property violation',
  offensive_language: 'Contains offensive or abusive language',
  misleading_information: 'Contains false or misleading information',
  low_quality: 'Low quality or poorly written content',
  duplicate_content: 'Duplicate or copied content',
  terms_violation: 'Violates terms of service',
  other: 'Other reason (specify in description)'
} as const;

export const FEEDBACK_DEFAULTS = {
  RATING_REQUIRED_TYPES: ['rating', 'review'],
  MAX_ATTACHMENTS: 5,
  MAX_ATTACHMENT_SIZE_MB: 10,
  AUTO_APPROVE_THRESHOLD: 80, // Quality score
  FLAGGED_THRESHOLD: 3, // Number of reports
  MODERATION_QUEUE_PRIORITY: {,
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  }
} as const;