/**
 * Promotion Management Interfaces - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 * 
 * Comprehensive TypeScript interfaces for unified promotion management system
 * including discounts, campaigns, content promotion, and analytics.
 */
import { z } from 'zod';

// =============================================================================
// Core Promotion Types and Enums
// =============================================================================

export enum PromotionType {
  // Price-based promotions
  PERCENTAGE_DISCOUNT = 'percentage_discount',
  FIXED_AMOUNT_DISCOUNT = 'fixed_amount_discount',
  BUY_ONE_GET_ONE = 'buy_one_get_one',
  BULK_DISCOUNT = 'bulk_discount',
  // Content promotions
  FEATURED_CONTENT = 'featured_content',
  CATEGORY_SPOTLIGHT = 'category_spotlight',
  TRENDING_CAROUSEL = 'trending_carousel',
  EDITOR_CHOICE = 'editor_choice',
  NEW_ARRIVALS = 'new_arrivals',
  // User-based promotions
  LOYALTY_REWARD = 'loyalty_reward',
  REFERRAL_BONUS = 'referral_bonus',
  FIRST_TIME_BUYER = 'first_time_buyer',
  VIP_EXCLUSIVE = 'vip_exclusive',
  // Time-based promotions
  SEASONAL_SALE = 'seasonal_sale',
  FLASH_SALE = 'flash_sale',
  EARLY_BIRD = 'early_bird',
  LAST_CHANCE = 'last_chance',
  // Bundle promotions
  CROSS_SELL = 'cross_sell',
  UPSELL = 'upsell',
  BUNDLE_DEAL = 'bundle_deal',
  // Industry-specific
  FILM_INDUSTRY_SPECIAL = 'film_industry_special',
  CREATOR_SPOTLIGHT = 'creator_spotlight'
  export enum PromotionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
  export enum PromotionTargetType {
  ALL_USERS = 'all_users',
  SPECIFIC_USERS = 'specific_users',
  USER_SEGMENT = 'user_segment',
  GEOGRAPHIC = 'geographic',
  BEHAVIORAL = 'behavioral',
  DEMOGRAPHIC = 'demographic'
  export enum PromotionApplicationType {
  AUTOMATIC = 'automatic',
  CODE_REQUIRED = 'code_required',
  LINK_BASED = 'link_based',
  CONDITIONAL = 'conditional'
  export enum DiscountApplicationScope {
  CART_TOTAL = 'cart_total',
  SPECIFIC_ITEMS = 'specific_items',
  CATEGORY = 'category',
  BRAND = 'brand',
  CREATOR = 'creator',
  LICENSE_TYPE = 'license_type'
  export enum PromotionTrigger {
  TIME_BASED = 'time_based',
  USER_ACTION = 'user_action',
  CART_VALUE = 'cart_value',
  ITEM_COUNT = 'item_count',
  PAGE_VIEW = 'page_view',
  REFERRAL = 'referral',
  FIRST_PURCHASE = 'first_purchase',
  REPEAT_PURCHASE = 'repeat_purchase'
  // =============================================================================
  // Core Promotion Interfaces
  // =============================================================================
  /**
  * Base promotion interface - foundation for all promotion types
  */
  export interface BasePromotion {
  readonly id: string;
  readonly type: PromotionType;
  // Basic information
  name: string;
  description: string;
  internal_notes?: string;
  // Status and lifecycle
  status: PromotionStatus;
  enabled: boolean;
  // Timing
  start_date: Date;
  end_date: Date;
  timezone: string;
  // Application
  application_type: PromotionApplicationType;
  promo_code?: string;
  usage_limit?: number;
  usage_count: number;
  user_usage_limit?: number; // Per-user limit,
  // Targeting
  target_type: PromotionTargetType;
  targeting_rules: PromotionTargetingRule;
  // Priority and stacking
  priority: number; // 1-100, higher = more important,
  stackable: boolean;
  exclusive_with?: string; // IDs of mutually exclusive promotions,
  // Analytics and tracking
  performance_metrics: PromotionPerformanceMetrics;
  // Metadata
  metadata: Record<string, any>;
  tags: string;
  // Audit trail
  created_at: Date;
  updated_at: Date;
  created_by: string;
  last_updated_by: string;
  approved_by?: string;
  approved_at?: Date;
  /**
  * Price-based discount promotion
  */
}
}
}
export interface DiscountPromotion extends BasePromotion {
  type: ,
  | PromotionType.PERCENTAGE_DISCOUNT
  | PromotionType.FIXED_AMOUNT_DISCOUNT
  | PromotionType.BULK_DISCOUNT
  | PromotionType.BUY_ONE_GET_ONE;
  // Discount configuration
  discount_config: DiscountConfiguration;
  // Application scope
  application_scope: DiscountApplicationScope;
  applicable_items?: ApplicableItemsFilter;
  // Minimum requirements
  minimum_purchase_amount?: number;
  minimum_item_count?: number;
  required_items?: string; // Item IDs that must be in cart,
  // Maximum discount limits
  max_discount_amount?: number;
  max_discount_per_user?: number;
  /**
  * Content promotion (featured, spotlights, etc.)
  */
  export interface ContentPromotion extends BasePromotion {
  type:,
  | PromotionType.FEATURED_CONTENT
  | PromotionType.CATEGORY_SPOTLIGHT
  | PromotionType.TRENDING_CAROUSEL
  | PromotionType.EDITOR_CHOICE
  | PromotionType.NEW_ARRIVALS
  | PromotionType.CREATOR_SPOTLIGHT;
  // Content selection
  content_selection_strategy: ContentSelectionStrategy;
  content_criteria: ContentSelectionCriteria;
  selected_content_ids: string;
  // Display configuration
  display_config: ContentDisplayConfiguration;
  // Rotation and scheduling
  rotation_config?: ContentRotationConfig;
  // Performance tracking
  content_performance: ContentPromotionMetrics;
  /**
  * Bundle promotion for cross-sell/upsell
  */
  export interface BundlePromotion extends BasePromotion {
  type:,
  | PromotionType.CROSS_SELL
  | PromotionType.UPSELL
  | PromotionType.BUNDLE_DEAL;
  // Bundle configuration
  bundle_config: BundleConfiguration;
  bundle_items: BundleItem;
  // Discount for bundle
  bundle_discount: DiscountConfiguration;
  // Display and recommendations
  recommendation_strategy: BundleRecommendationStrategy;
  display_triggers: BundleTrigger;
  /**
  * Campaign promotion - overarching marketing campaign
  */
  export interface CampaignPromotion extends BasePromotion {
  // Campaign information
  campaign_name: string;
  campaign_theme: string;
  campaign_objectives: string;
  // Associated promotions
  child_promotions: string; // IDs of promotions that are part of this campaign,
  // Multi-channel configuration
  channels: CampaignChannel;
  // Budget and spend tracking
  budget?: CampaignBudget;
  // Campaign-specific metrics
  campaign_metrics: CampaignMetrics;
  // =============================================================================
  // Configuration Interfaces
  // =============================================================================
  export interface DiscountConfiguration {
  // Discount type and amount
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'tiered';
  // Percentage discount (0-100)
  percentage?: number;
  // Fixed amount discount (in cents)
  fixed_amount_cents?: number;
  // BOGO configuration
  buy_quantity?: number;
  get_quantity?: number;
  get_discount_percentage?: number; // If not 100% free,
  // Tiered discount (buy more, save more)
  tiers?: DiscountTier;
  // Currency for fixed amounts
  currency: string;
  // Compound settings
  compound_with_other_discounts: boolean;
  apply_to_sale_items: boolean;
}
}
}
export interface DiscountTier {
  minimum_quantity: number;
  minimum_amount_cents?: number;
  discount_percentage?: number;
  fixed_discount_cents?: number;
}
}
}
export interface ApplicableItemsFilter {
  // Include criteria
  include_categories?: string;
  include_tags?: string;
  include_creators?: string;
  include_license_types?: string;
  include_items?: string;
  // Exclude criteria
  exclude_categories?: string;
  exclude_tags?: string;
  exclude_creators?: string;
  exclude_license_types?: string;
  exclude_items?: string;
  // Price range filters
  min_price_cents?: number;
  max_price_cents?: number;
  // Quality filters
  min_rating?: number;
  min_download_count?: number;
  // Time filters
  created_after?: Date;
  updated_after?: Date;
}
}
}
export interface PromotionTargetingRule {
  type: PromotionTargetType;
  conditions: TargetingCondition;
  operator: 'AND' | 'OR'; // How to combine conditions,
}
}
}
export interface TargetingCondition {
  field: string; // user.tier, user.location.country, user.total_purchases, etc.,
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  weight?: number; // For weighted scoring,
}
}
}
export interface ContentSelectionStrategy {
  method: 'manual' | 'automatic' | 'hybrid';
  automatic_refresh: boolean;
  refresh_interval_hours?: number;
  performance_based_rotation: boolean;
}
}
}
export interface ContentSelectionCriteria {
  // Quality filters
  min_rating?: number;
  min_download_count?: number;
  quality_score_threshold?: number;
  // Category and content filters
  categories?: string;
  tags?: string;
  content_types?: string;
  creators?: string;
  // Performance filters
  min_conversion_rate?: number;
  min_revenue?: number;
  trending_score_threshold?: number;
  // Time-based filters
  published_after?: Date;
  exclude_recently_promoted?: boolean;
  exclude_current_promotions?: boolean;
  // Diversity requirements
  max_per_creator?: number;
  max_per_category?: number;
  diversification_rules?: ContentDiversificationRule;
  // Limits
  max_content_count: number;
}
}
}
export interface ContentDiversificationRule {
  attribute: 'creator' | 'category' | 'content_type' | 'price_range';
  max_percentage: number;
  enforce_minimum_variety: boolean;
}
}
}
export interface ContentDisplayConfiguration {
  // Layout and positioning
  display_location: string; // homepage_hero, category_top, sidebar, etc.,
  layout_type: 'carousel' | 'grid' | 'list' | 'featured_card' | 'banner';
  max_visible_items: number;
  // Visual styling
  theme: string;
  custom_css?: string;
  show_badges: boolean;
  show_pricing: boolean;
  show_creator_info: boolean;
  // Call-to-action
  cta_text?: string;
  cta_style?: string;
  // Responsive behavior
  mobile_layout?: string;
  tablet_layout?: string;
}
}
}
export interface ContentRotationConfig {
  rotation_type: 'fixed_time' | 'performance_based' | 'equal_time' | 'weighted';
  // Fixed time rotation
  rotation_interval_minutes?: number;
  // Performance-based rotation
  performance_thresholds?: {
  min_ctr?: number;
  min_conversions?: number;
  max_time_minutes?: number;
}
};
  // Weighted rotation
  weight_factors?: {
  performance_weight: number;
  recency_weight: number;
  diversity_weight: number;
};
  // General settings
  randomize_order: boolean;
  allow_repeat_within_session: boolean;
}
}
export interface BundleConfiguration {
  bundle_type: 'fixed' | 'flexible' | 'dynamic';
  // Fixed bundles: exact items,
  required_items?: string;
  // Flexible bundles: choose X from category,
  flexible_options?: BundleFlexibleOption;
  // Dynamic bundles: AI-driven recommendations,
  dynamic_strategy?: 'collaborative_filtering' | 'content_similarity' | 'purchase_history';
  // Bundle constraints
  min_items: number;
  max_items: number;
  allow_duplicates: boolean;
}
}
}
export interface BundleFlexibleOption {
  category: string;
  required_count: number;
  available_items?: string;
}
}
}
export interface BundleItem {
  item_id: string;
  required: boolean;
  discount_percentage?: number; // Individual item discount within bundle,
  position?: number; // Display order,
}
}
}
export interface BundleRecommendationStrategy {
  recommendation_engine: 'rule_based' | 'ml_powered' | 'hybrid';
  // Rule-based recommendations
  rules?: BundleRecommendationRule;
  // ML-powered settings
  ml_model_id?: string;
  confidence_threshold?: number;
  // Display settings
  max_recommendations: number;
  personalization_level: 'low' | 'medium' | 'high'
}
  }
}
export interface BundleRecommendationRule {
  trigger_item_id?: string;
  trigger_category?: string;
  recommended_categories?: string;
  recommended_items?: string;
  boost_score: number; // Multiplier for recommendation strength,
}
}
}
export interface BundleTrigger {
  trigger_type: 'cart_add' | 'page_view' | 'checkout_start' | 'time_on_page';
  trigger_conditions: Record<string, any>;
  display_timing: 'immediate' | 'delayed' | 'on_exit_intent';
  delay_seconds?: number;
}
}
}
export interface CampaignChannel {
  channel: 'email' | 'web' | 'mobile_app' | 'social_media' | 'external_ads';
  enabled: boolean;
  channel_config: Record<string, any>;
  // Channel-specific tracking
  channel_metrics: {
  impressions: number;
  clicks: number;
  conversions: number;
  spend?: number;
}
};
}
}
export interface CampaignBudget {
  total_budget_cents: number;
  daily_budget_cents?: number;
  spend_to_date_cents: number;
  budget_allocation: Record<string, number>; // Channel allocations,
  budget_alerts: BudgetAlert;
}
}
}
export interface BudgetAlert {
  threshold_percentage: number; // Alert when X% of budget is spent,
  alert_channels: ('email' | 'dashboard' | 'slack')[];
  recipients: string;
  // =============================================================================
  // Metrics and Analytics Interfaces
  // =============================================================================
}
}
}
export interface PromotionPerformanceMetrics {
  // Usage metrics
  total_uses: number;
  unique_users: number;
  conversion_rate: number;
  // Financial impact
  total_discount_given_cents: number;
  total_revenue_generated_cents: number;
  average_order_value_cents: number;
  roi: number; // Return on Investment,
  // Traffic metrics
  impressions: number;
  clicks: number;
  click_through_rate: number;
  // Time-based metrics
  first_use_date?: Date;
  last_use_date?: Date;
  peak_usage_period?: {
  start: Date;
  end: Date;
  usage_count: number;
}
};
  // User behavior
  repeat_usage_rate: number;
  average_time_to_conversion_minutes?: number;
  bounce_rate?: number;
  // Comparison metrics
  lift_vs_baseline?: number; // Percentage improvement vs. no promotion
  // Last updated
  metrics_updated_at: Date;
}
}
export interface ContentPromotionMetrics {
  content_id: string;
  content_title: string;
  // Display metrics
  impressions: number;
  clicks: number;
  click_through_rate: number;
  // Conversion metrics
  page_views: number;
  conversions: number;
  conversion_rate: number;
  revenue_generated_cents: number;
  // Engagement metrics
  average_time_on_content_seconds: number;
  bounce_rate: number;
  shares: number;
  favorites: number;
  // Position and timing
  average_display_position: number;
  total_display_time_minutes: number;
  performance_score: number; // 0-100,
  // Last updated
  period_start: Date;
  period_end: Date;
}
}
}
export interface CampaignMetrics {
  // Overall campaign performance
  total_reach: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  // Financial metrics
  total_spend_cents: number;
  total_revenue_cents: number;
  cost_per_click_cents: number;
  cost_per_conversion_cents: number;
  return_on_ad_spend: number;
  // Channel breakdown
  channel_performance: Array<{
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend_cents: number;
  roas: number;
}
}>;
  // Promotion breakdown
  promotion_performance: Array<{
  promotion_id: string;
  promotion_name: string;
  contribution_to_revenue: number;
  usage_count: number;
}>;
  // Time series data
  daily_metrics: Array<{
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend_cents: number;
}>;

// =============================================================================
// Management and Operations Interfaces
// =============================================================================
}
}
export interface PromotionRule {
  id: string;
  name: string;
  description: string;
  // Rule conditions
  conditions: PromotionRuleCondition;
  condition_operator: 'AND' | 'OR';
  // Actions to take
  actions: PromotionRuleAction;
  // Rule metadata
  enabled: boolean;
  priority: number;
  // Effectiveness tracking
  triggered_count: number;
  success_rate: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}
}
}
export interface PromotionRuleCondition {
  field: string; // cart.total, user.purchase_history, item.category, etc.,
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'regex_match';
  value: any;
  negate?: boolean; // NOT condition,
}
}
}
export interface PromotionRuleAction {
  action_type: 'apply_promotion' | 'suggest_promotion' | 'trigger_campaign' | 'send_notification';
  parameters: Record<string, any>;
  delay_seconds?: number;
}
}
}
export interface PromotionTemplate {
  id: string;
  name: string;
  description: string;
  template_type: PromotionType;
  // Template configuration
  default_settings: Partial<BasePromotion>;
  configurable_fields: PromotionTemplateField;
  // Template metadata
  category: string;
  use_case_examples: string;
  created_by: string;
  created_at: Date;
  usage_count: number;
}
}
}
export interface PromotionTemplateField {
  field_name: string;
  display_name: string;
  field_type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select';
  required: boolean;
  default_value?: any;
  validation_rules?: ValidationRule;
}
  options?: { value: any; label: string }[]; // For select fields
}
}
export interface ValidationRule {
  rule_type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  error_message: string;
}
}
}
export interface PromotionAuditLog {
  id: string;
  promotion_id: string;
  // Action details
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted' | 'applied' | 'expired';
  description: string;
  // Context
  user_id?: string; // User who performed action or was affected,
  admin_id?: string; // Admin who made the change,
  ip_address?: string;
  user_agent?: string;
  // Changes
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  // Metadata
  metadata: Record<string, any>;
  timestamp: Date;
  // =============================================================================
  // API and Service Response Types
  // =============================================================================
}
}
}
export interface PromotionServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
  code: string;
  message: string;
  details?: any;
};
  metadata?: {
  request_id: string;
  timestamp: Date;
  execution_time_ms: number;
};

}
export interface PromotionEligibilityCheck {
  promotion_id: string;
  eligible: boolean;
  reasons?: string; // Why eligible/not eligible,
  discount_amount_cents?: number;
  // Requirements not met
  missing_requirements?: {
  minimum_purchase_amount?: number;
  required_items?: string;
  user_criteria?: string;
}
};
  // Stacking information
  conflicts_with?: string; // Other promotion IDs that conflict
  can_stack_with?: string; // Other promotions that can be combined
}
}
export interface PromotionApplicationResult {
  success: boolean;
  promotion_id: string;
  discount_applied_cents: number;
  // Updated cart totals
  original_total_cents: number;
  new_total_cents: number;
  total_savings_cents: number;
  // Application details
  items_affected: Array<{
  item_id: string;
  original_price_cents: number;
  discounted_price_cents: number;
  discount_amount_cents: number;
}
}>;
  // Metadata
  applied_at: Date;
  expires_at?: Date;
  usage_recorded: boolean;
}
}
export interface PromotionSearchCriteria {
  // Basic filters
  status?: PromotionStatus;
  type?: PromotionType;
  enabled?: boolean;
  // Date filters
  active_on?: Date;
  created_after?: Date;
  created_before?: Date;
  expires_after?: Date;
  expires_before?: Date;
  // Text search
  search_query?: string; // Search in name, description, promo_code,
  // Targeting filters
  applicable_to_user?: string; // User ID to check eligibility,
  applicable_to_items?: string; // Item IDs to check applicability,
  // Performance filters
  min_usage_count?: number;
  min_conversion_rate?: number;
  min_roi?: number;
  // Admin filters
  created_by?: string;
  tags?: string;
  // Pagination and sorting
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'start_date' | 'usage_count' | 'roi';
  sort_order?: 'asc' | 'desc'
}
  }
}
export interface PromotionSearchResult {
  promotions: BasePromotion;
  total_count: number;
  has_more: boolean;
  // Aggregates
  aggregates: {
  total_active: number;
  total_scheduled: number;
  total_expired: number;
  total_discount_given_cents: number;
  average_conversion_rate: number;
}
};
  // Facets for filtering
  facets?: {
    types: Array<{ type: PromotionType; count: number }>;
    statuses: Array<{ status: PromotionStatus; count: number }>;
    creators: Array<{ creator: string; count: number }>;
  };

// =============================================================================
// Validation Schemas
// =============================================================================
}
export const CreatePromotionSchema = z.object({)
  type: z.nativeEnum(PromotionType),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  start_date: z.date(),
  end_date: z.date(),
  timezone: z.string(),
  application_type: z.nativeEnum(PromotionApplicationType),
  promo_code: z.string().max(50).optional(),
  usage_limit: z.number().int().min(1).optional(),
  user_usage_limit: z.number().int().min(1).optional(),
  target_type: z.nativeEnum(PromotionTargetType),
  targeting_rules: z.array(z.object({)
  type: z.nativeEnum(PromotionTargetType),
  conditions: z.array(z.any()),
  operator: z.enum(['AND', 'OR']),
})),
  priority: z.number().int().min(1).max(100).default(50),
  stackable: z.boolean().default(false),
  metadata: z.record(z.any()).default({})
});

export const UpdatePromotionSchema = z.object({)
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(PromotionStatus).optional(),
  enabled: z.boolean().optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  usage_limit: z.number().int().min(1).optional(),
  priority: z.number().int().min(1).max(100).optional(),
  targeting_rules: z.array(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const ApplyPromotionSchema = z.object({)
  promotion_id: z.string().uuid(),
  user_id: z.string().uuid(),
  cart_id: z.string().uuid().optional(),
  promo_code: z.string().optional(),
  force_apply: z.boolean().default(false),
});

export const CheckEligibilitySchema = z.object({)
  promotion_id: z.string().uuid(),
  user_id: z.string().uuid(),
  cart_id: z.string().uuid().optional(),
  item_ids: z.array(z.string().uuid()).optional(),
});

// =============================================================================
// Export all types for convenience
// =============================================================================

export type {
  BasePromotion,
  DiscountPromotion,
  ContentPromotion,
  BundlePromotion,
  CampaignPromotion,
  DiscountConfiguration,
  DiscountTier,
  ApplicableItemsFilter,
  PromotionTargetingRule,
  TargetingCondition,
  ContentSelectionStrategy,
  ContentSelectionCriteria,
  ContentDiversificationRule,
  ContentDisplayConfiguration,
  ContentRotationConfig,
  BundleConfiguration,
  BundleFlexibleOption,
  BundleItem,
  BundleRecommendationStrategy,
  BundleRecommendationRule,
  BundleTrigger,
  CampaignChannel,
  CampaignBudget,
  BudgetAlert,
  PromotionPerformanceMetrics,
  ContentPromotionMetrics,
  CampaignMetrics,
  PromotionRule,
  PromotionRuleCondition,
  PromotionRuleAction,
  PromotionTemplate,
  PromotionTemplateField,
  ValidationRule,
  PromotionAuditLog,
  PromotionServiceResponse,
  PromotionEligibilityCheck,
  PromotionApplicationResult,
  PromotionSearchCriteria,
  PromotionSearchResult
};

export {
  PromotionType,
  PromotionStatus,
  PromotionTargetType,
  PromotionApplicationType,
  DiscountApplicationScope,
  PromotionTrigger,
  CreatePromotionSchema,
  UpdatePromotionSchema,
  ApplyPromotionSchema,
  CheckEligibilitySchema
};