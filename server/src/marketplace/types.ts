// Epic 16 Marketplace TypeScript Types
import { z } from 'zod';

// Enums
export enum TemplateStatus {
  DRAFT = 'draft',
  LISTED = 'listed',
  BLOCKED = 'blocked',
  ARCHIVED = 'archived'
}

export enum PurchaseStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum RefundReason {
  NOT_AS_DESCRIBED = 'not_as_described',
  CLAUDE_INCOMPAT = 'claude_incompat',
  CLAUDE_HALLUCINATION = 'claude_hallucination',
  OTHER = 'other'
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export enum EventType {
  VIEW = 'view',
  PREVIEW = 'preview',
  PURCHASE = 'purchase',
  DOWNLOAD = 'download',
  SHARE = 'share',
  RATING = 'rating',
  COMMENT = 'comment'
}

export enum SentimentType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral'
}

// Base interfaces
export interface MarketplaceTemplate {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  tags: string[];
  price_cents: number;
  is_ai_generated: boolean;
  claude_compat: string[];
  status: TemplateStatus;
  stats: Record<string, any>;
  current_version_id?: string;
  featured_at?: Date;
  created_at: Date;
  updated_at: Date;
  search_vector?: string;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version_number: number;
  claude_model: string;
  graph_json: Record<string, any>;
  prompt_yaml?: string;
  changelog_md?: string;
  hash: string;
  token_per_run_estimate: number;
  safety_score: number;
  s3_asset_key?: string;
  created_at: Date;
}

export interface MarketplacePurchase {
  id: string;
  buyer_id: string;
  template_id: string;
  version_id: string;
  stripe_payment_intent_id?: string;
  amount_cents: number;
  status: PurchaseStatus;
  refund_reason?: RefundReason;
  refund_amount_cents: number;
  escrow_released_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateReview {
  id: string;
  template_id: string;
  buyer_id: string;
  purchase_id?: string;
  stars: number;
  comment?: string;
  sentiment_ai?: SentimentType;
  verified_purchase: boolean;
  moderation_status: ModerationStatus;
  moderation_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
}

export interface MarketplaceEvent {
  id: string;
  event_type: EventType;
  user_id?: string;
  template_id: string;
  version_id?: string;
  session_id?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface TemplateCollection {
  id: string;
  name: string;
  description?: string;
  curator_id: string;
  is_featured: boolean;
  is_public: boolean;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

// Extended interfaces with relations
export interface TemplateWithStats extends MarketplaceTemplate {
  total_purchases: number;
  total_reviews: number;
  avg_rating: number;
  total_revenue: number;
  last_purchase_at?: Date;
  total_views: number;
  total_previews: number;
  categories?: string[];
  current_version?: TemplateVersion;
  owner?: {
    id: string;
    name: string;
    email?: string;
    verified: boolean;
  };
}

export interface PurchaseWithDetails extends MarketplacePurchase {
  template?: MarketplaceTemplate;
  version?: TemplateVersion;
  buyer?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface ReviewWithDetails extends TemplateReview {
  template?: MarketplaceTemplate;
  buyer?: {
    id: string;
    name: string;
    verified: boolean;
  };
  purchase?: MarketplacePurchase;
}

// Search and filter interfaces
export interface SearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  claude_models?: string[];
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest' | 'oldest';
  is_free?: boolean;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchResult {
  templates: TemplateWithStats[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  aggregations?: {
    categories: Array<{ name: string; count: number }>;
    price_ranges: Array<{ min: number; max: number; count: number }>;
    avg_ratings: Array<{ rating: number; count: number }>;
  };
}

// API request/response schemas using Zod
export const CreateTemplateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  price_cents: z.number().int().min(0).default(0),
  is_ai_generated: z.boolean().default(false),
  claude_compat: z.array(z.string()).default(['claude-3-sonnet']),
  categories: z.array(z.string().uuid()).optional(),
});

export const UpdateTemplateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  price_cents: z.number().int().min(0).optional(),
  is_ai_generated: z.boolean().optional(),
  claude_compat: z.array(z.string()).optional(),
  status: z.nativeEnum(TemplateStatus).optional(),
  categories: z.array(z.string().uuid()).optional(),
});

export const CreateVersionSchema = z.object({
  claude_model: z.string().default('claude-3-sonnet'),
  graph_json: z.record(z.any()),
  prompt_yaml: z.string().optional(),
  changelog_md: z.string().optional(),
  token_per_run_estimate: z.number().int().min(0).default(0),
});

export const SearchSchema = z.object({
  query: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  price_min: z.number().int().min(0).optional(),
  price_max: z.number().int().min(0).optional(),
  rating_min: z.number().min(0).max(5).optional(),
  claude_models: z.array(z.string()).optional(),
  sort_by: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'popularity', 'newest', 'oldest']).default('relevance'),
  is_free: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const CreateReviewSchema = z.object({
  template_id: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const CreatePurchaseSchema = z.object({
  template_id: z.string().uuid(),
  version_id: z.string().uuid().optional(), // If not provided, use current version
  payment_method_id: z.string(), // Stripe payment method ID
});

// Analytics interfaces
export interface TemplateAnalytics {
  template_id: string;
  period_start: Date;
  period_end: Date;
  metrics: {
    views: number;
    previews: number;
    purchases: number;
    revenue_cents: number;
    conversion_rate: number;
    avg_rating: number;
    total_reviews: number;
    refund_rate: number;
  };
  demographics?: {
    countries: Array<{ country: string; count: number }>;
    user_types: Array<{ type: string; count: number }>;
  };
  trends?: {
    daily_views: Array<{ date: string; count: number }>;
    daily_purchases: Array<{ date: string; count: number }>;
  };
}

export interface CreatorAnalytics {
  creator_id: string;
  period_start: Date;
  period_end: Date;
  summary: {
    total_templates: number;
    active_templates: number;
    total_revenue_cents: number;
    total_purchases: number;
    avg_rating: number;
    total_reviews: number;
  };
  top_templates: Array<{
    template_id: string;
    title: string;
    revenue_cents: number;
    purchases: number;
  }>;
  performance_trends: {
    monthly_revenue: Array<{ month: string; revenue_cents: number }>;
    monthly_purchases: Array<{ month: string; purchases: number }>;
  };
}

// Preview system interfaces
export interface PreviewRequest {
  template_id: string;
  version_id?: string;
  user_input?: Record<string, any>;
  claude_model_override?: string;
}

export interface PreviewResponse {
  output: string;
  cost_estimate: number;
  quality_score: number;
  token_usage: {
    input_tokens: number;
    output_tokens: number;
  };
  cached: boolean;
  redacted_sections: string[];
}

// Export all types
export type {
  MarketplaceTemplate,
  TemplateVersion,
  MarketplacePurchase,
  TemplateReview,
  TemplateCategory,
  MarketplaceEvent,
  TemplateCollection,
  TemplateWithStats,
  PurchaseWithDetails,
  ReviewWithDetails,
  SearchFilters,
  SearchResult,
  TemplateAnalytics,
  CreatorAnalytics,
  PreviewRequest,
  PreviewResponse,
};

export {
  CreateTemplateSchema,
  UpdateTemplateSchema,
  CreateVersionSchema,
  SearchSchema,
  CreateReviewSchema,
  CreatePurchaseSchema,
};