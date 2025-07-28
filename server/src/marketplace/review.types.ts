// Epic 16.1.6 - Rating & Review System Types
import { z } from 'zod';

// Enhanced review-specific enums
export enum ReviewSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  HIGHEST_RATED = 'highest_rated',
  LOWEST_RATED = 'lowest_rated',
  MOST_HELPFUL = 'most_helpful',
  VERIFIED_FIRST = 'verified_first'
}

export enum ReviewFilterBy {
  ALL = 'all',
  VERIFIED_ONLY = 'verified_only',
  FIVE_STAR = 'five_star',
  FOUR_STAR = 'four_star',
  THREE_STAR = 'three_star',
  TWO_STAR = 'two_star',
  ONE_STAR = 'one_star',
  WITH_COMMENTS = 'with_comments',
  FLAGGED = 'flagged'
}

export enum ReviewFlag {
  INAPPROPRIATE = 'inappropriate',
  SPAM = 'spam',
  FAKE = 'fake',
  OFF_TOPIC = 'off_topic',
  HARASSMENT = 'harassment',
  COPYRIGHT = 'copyright',
  OTHER = 'other'
}

export enum ReviewHelpfulness {
  HELPFUL = 'helpful',
  NOT_HELPFUL = 'not_helpful'
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  HIDDEN = 'hidden'
}

export enum SentimentScore {
  VERY_POSITIVE = 'very_positive',
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  VERY_NEGATIVE = 'very_negative'
}

// Enhanced review interfaces
}
export interface ReviewMetrics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
}
  };
  verified_percentage: number;
  response_rate: number; // Creator response rate
  helpfulness_score: number;
}

}
export interface ReviewWithDetails {
  id: string;
  template_id: string;
  buyer_id: string;
  purchase_id?: string;
  stars: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  use_case?: string;
  difficulty_rating?: number; // 1-5 scale
  would_recommend: boolean;
  sentiment_ai?: SentimentScore;
  verified_purchase: boolean;
  status: ReviewStatus;
  moderation_reason?: string;
  created_at: Date;
  updated_at: Date;
  
  // Extended details
  buyer?: {
    id: string;
    name: string;
    avatar_url?: string;
    verified: boolean;
    total_reviews: number;
    average_rating_given: number;
}
  };
  
  // Interaction metrics
  helpfulness_votes: {
    helpful: number;
    not_helpful: number;
    user_vote?: ReviewHelpfulness;
  };
  
  // Moderation data
  flags: ReviewFlag[];
  flag_count: number;
  
  // Creator response
  creator_response?: {
    id: string;
    creator_id: string;
    response: string;
    created_at: Date;
    updated_at: Date;
  };
  
  // Media attachments
  attachments?: {
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    thumbnail_url?: string;
    filename: string;
    file_size: number;
  }[];
}

}
export interface ReviewSubmission {
  template_id: string;
  stars: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  use_case?: string;
  difficulty_rating?: number;
  would_recommend: boolean;
  attachments?: File[];
}
}

}
export interface ReviewFilters {
  rating?: number;
  verified_only?: boolean;
  has_comment?: boolean;
  use_case?: string;
  difficulty_min?: number;
  difficulty_max?: number;
  date_from?: Date;
  date_to?: Date;
  sort_by?: ReviewSortBy;
  filter_by?: ReviewFilterBy;
}
}

}
export interface ReviewHelpfulnessVote {
  id: string;
  review_id: string;
  user_id: string;
  vote: ReviewHelpfulness;
  created_at: Date;
}
}

}
export interface ReviewFlag {
  id: string;
  review_id: string;
  flagger_id: string;
  flag_type: ReviewFlag;
  reason?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
}
}

}
export interface CreatorResponse {
  id: string;
  review_id: string;
  creator_id: string;
  response: string;
  created_at: Date;
  updated_at: Date;
}
}

}
export interface ReviewAnalytics {
  template_id: string;
  period_start: Date;
  period_end: Date;
  metrics: ReviewMetrics;
  trends: {
}
    daily_reviews: Array<{ date: string; count: number; avg_rating: number }>;
    rating_trends: Array<{ date: string; rating: number }>;
    sentiment_trends: Array<{ date: string; sentiment: SentimentScore; count: number }>;
  };
  top_keywords: Array<{ keyword: string; count: number; sentiment: SentimentScore }>;
  common_use_cases: Array<{ use_case: string; count: number; avg_rating: number }>;
  difficulty_distribution: Array<{ difficulty: number; count: number; avg_rating: number }>;
}

}
export interface ReviewModerationQueue {
  pending_reviews: ReviewWithDetails[];
  flagged_reviews: ReviewWithDetails[];
  total_pending: number;
  total_flagged: number;
  average_processing_time: number;
  moderation_stats: {
    approved_today: number;
    rejected_today: number;
    flagged_today: number;
}
  };
}

// Validation Schemas
export const CreateReviewSchema = z.object({
  template_id: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200).optional(),
  comment: z.string().min(10).max(2000).optional(),
  pros: z.array(z.string().max(100)).max(10).optional(),
  cons: z.array(z.string().max(100)).max(10).optional(),
  use_case: z.string().max(500).optional(),
  difficulty_rating: z.number().int().min(1).max(5).optional(),
  would_recommend: z.boolean().default(true)
});

export const UpdateReviewSchema = z.object({
  stars: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(200).optional(),
  comment: z.string().min(10).max(2000).optional(),
  pros: z.array(z.string().max(100)).max(10).optional(),
  cons: z.array(z.string().max(100)).max(10).optional(),
  use_case: z.string().max(500).optional(),
  difficulty_rating: z.number().int().min(1).max(5).optional(),
  would_recommend: z.boolean().optional()
});

export const ReviewFiltersSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  verified_only: z.boolean().optional(),
  has_comment: z.boolean().optional(),
  use_case: z.string().optional(),
  difficulty_min: z.number().int().min(1).max(5).optional(),
  difficulty_max: z.number().int().min(1).max(5).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  sort_by: z.nativeEnum(ReviewSortBy).default(ReviewSortBy.NEWEST),
  filter_by: z.nativeEnum(ReviewFilterBy).default(ReviewFilterBy.ALL),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

export const VoteHelpfulnessSchema = z.object({
  review_id: z.string().uuid(),
  vote: z.nativeEnum(ReviewHelpfulness)
});

export const FlagReviewSchema = z.object({
  review_id: z.string().uuid(),
  flag_type: z.nativeEnum(ReviewFlag),
  reason: z.string().min(10).max(500).optional()
});

export const CreatorResponseSchema = z.object({
  review_id: z.string().uuid(),
  response: z.string().min(10).max(1000)
});

export const ModerationActionSchema = z.object({
  review_id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'flag', 'hide']),
  reason: z.string().max(500).optional(),
  send_notification: z.boolean().default(true)
});

// Advanced analytics schemas
export const ReviewAnalyticsSchema = z.object({
  template_id: z.string().uuid().optional(),
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  include_trends: z.boolean().default(true),
  include_keywords: z.boolean().default(true),
  include_sentiment: z.boolean().default(true)
});

// Export all types
export type {
  ReviewMetrics,
  ReviewWithDetails,
  ReviewSubmission,
  ReviewFilters,
  ReviewHelpfulnessVote,
  ReviewFlag,
  CreatorResponse,
  ReviewAnalytics,
  ReviewModerationQueue
};

export {
  ReviewSortBy,
  ReviewFilterBy,
  ReviewHelpfulness,
  ReviewStatus,
  SentimentScore,
  CreateReviewSchema,
  UpdateReviewSchema,
  ReviewFiltersSchema,
  VoteHelpfulnessSchema,
  FlagReviewSchema,
  CreatorResponseSchema,
  ModerationActionSchema,
  ReviewAnalyticsSchema
};