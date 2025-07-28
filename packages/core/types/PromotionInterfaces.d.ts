/**
 * Promotion Management Interfaces - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Comprehensive TypeScript interfaces for unified promotion management system
 * including discounts, campaigns, content promotion, and analytics.
 */
import { z } from 'zod';
export declare enum PromotionType {
    PERCENTAGE_DISCOUNT = "percentage_discount",
    FIXED_AMOUNT_DISCOUNT = "fixed_amount_discount",
    BUY_ONE_GET_ONE = "buy_one_get_one",
    BULK_DISCOUNT = "bulk_discount",
    FEATURED_CONTENT = "featured_content",
    CATEGORY_SPOTLIGHT = "category_spotlight",
    TRENDING_CAROUSEL = "trending_carousel",
    EDITOR_CHOICE = "editor_choice",
    NEW_ARRIVALS = "new_arrivals",
    LOYALTY_REWARD = "loyalty_reward",
    REFERRAL_BONUS = "referral_bonus",
    FIRST_TIME_BUYER = "first_time_buyer",
    VIP_EXCLUSIVE = "vip_exclusive",
    SEASONAL_SALE = "seasonal_sale",
    FLASH_SALE = "flash_sale",
    EARLY_BIRD = "early_bird",
    LAST_CHANCE = "last_chance",
    CROSS_SELL = "cross_sell",
    UPSELL = "upsell",
    BUNDLE_DEAL = "bundle_deal",
    FILM_INDUSTRY_SPECIAL = "film_industry_special",
    CREATOR_SPOTLIGHT = "creator_spotlight"

export declare enum PromotionStatus {
    DRAFT = "draft",
    SCHEDULED = "scheduled",
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPIRED = "expired"

export declare enum PromotionTargetType {
    ALL_USERS = "all_users",
    SPECIFIC_USERS = "specific_users",
    USER_SEGMENT = "user_segment",
    GEOGRAPHIC = "geographic",
    BEHAVIORAL = "behavioral",
    DEMOGRAPHIC = "demographic"

export declare enum PromotionApplicationType {
    AUTOMATIC = "automatic",
    CODE_REQUIRED = "code_required",
    LINK_BASED = "link_based",
    CONDITIONAL = "conditional"

export declare enum DiscountApplicationScope {
    CART_TOTAL = "cart_total",
    SPECIFIC_ITEMS = "specific_items",
    CATEGORY = "category",
    BRAND = "brand",
    CREATOR = "creator",
    LICENSE_TYPE = "license_type"

export declare enum PromotionTrigger {
    TIME_BASED = "time_based",
    USER_ACTION = "user_action",
    CART_VALUE = "cart_value",
    ITEM_COUNT = "item_count",
    PAGE_VIEW = "page_view",
    REFERRAL = "referral",
    FIRST_PURCHASE = "first_purchase",
    REPEAT_PURCHASE = "repeat_purchase"
/**
 * Base promotion interface - foundation for all promotion types
 */

export interface BasePromotion {
    readonly id: string;
    readonly type: PromotionType;
    name: string;
    description: string;
    internal_notes?: string;
    status: PromotionStatus;
    enabled: boolean;
    start_date: Date;
    end_date: Date;
    timezone: string;
    application_type: PromotionApplicationType;
    promo_code?: string;
    usage_limit?: number;
    usage_count: number;
    user_usage_limit?: number;
    target_type: PromotionTargetType;
    targeting_rules: PromotionTargetingRule[];
    priority: number;
    stackable: boolean;
    exclusive_with?: string[];
    performance_metrics: PromotionPerformanceMetrics;
    metadata: Record<string, any>;
    tags: string[];
    created_at: Date;
    updated_at: Date;
    created_by: string;
    last_updated_by: string;
    approved_by?: string;
    approved_at?: Date;
/**
 * Price-based discount promotion
 */

export interface DiscountPromotion extends BasePromotion {
    type: PromotionType.PERCENTAGE_DISCOUNT | PromotionType.FIXED_AMOUNT_DISCOUNT | PromotionType.BULK_DISCOUNT | PromotionType.BUY_ONE_GET_ONE;
    discount_config: DiscountConfiguration;
    application_scope: DiscountApplicationScope;
    applicable_items?: ApplicableItemsFilter;
    minimum_purchase_amount?: number;
    minimum_item_count?: number;
    required_items?: string[];
    max_discount_amount?: number;
    max_discount_per_user?: number;
/**
 * Content promotion (featured, spotlights, etc.)
 */

export interface ContentPromotion extends BasePromotion {
    type: PromotionType.FEATURED_CONTENT | PromotionType.CATEGORY_SPOTLIGHT | PromotionType.TRENDING_CAROUSEL | PromotionType.EDITOR_CHOICE | PromotionType.NEW_ARRIVALS | PromotionType.CREATOR_SPOTLIGHT;
    content_selection_strategy: ContentSelectionStrategy;
    content_criteria: ContentSelectionCriteria;
    selected_content_ids: string[];
    display_config: ContentDisplayConfiguration;
    rotation_config?: ContentRotationConfig;
    content_performance: ContentPromotionMetrics[];
/**
 * Bundle promotion for cross-sell/upsell
 */

export interface BundlePromotion extends BasePromotion {
    type: PromotionType.CROSS_SELL | PromotionType.UPSELL | PromotionType.BUNDLE_DEAL;
    bundle_config: BundleConfiguration;
    bundle_items: BundleItem[];
    bundle_discount: DiscountConfiguration;
    recommendation_strategy: BundleRecommendationStrategy;
    display_triggers: BundleTrigger[];
/**
 * Campaign promotion - overarching marketing campaign
 */

export interface CampaignPromotion extends BasePromotion {
    campaign_name: string;
    campaign_theme: string;
    campaign_objectives: string[];
    child_promotions: string[];
    channels: CampaignChannel[];
    budget?: CampaignBudget;
    campaign_metrics: CampaignMetrics;

export interface DiscountConfiguration {
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'tiered';
    percentage?: number;
    fixed_amount_cents?: number;
    buy_quantity?: number;
    get_quantity?: number;
    get_discount_percentage?: number;
    tiers?: DiscountTier[];
    currency: string;
    compound_with_other_discounts: boolean;
    apply_to_sale_items: boolean;

export interface DiscountTier {
    minimum_quantity: number;
    minimum_amount_cents?: number;
    discount_percentage?: number;
    fixed_discount_cents?: number;

export interface ApplicableItemsFilter {
    include_categories?: string[];
    include_tags?: string[];
    include_creators?: string[];
    include_license_types?: string[];
    include_items?: string[];
    exclude_categories?: string[];
    exclude_tags?: string[];
    exclude_creators?: string[];
    exclude_license_types?: string[];
    exclude_items?: string[];
    min_price_cents?: number;
    max_price_cents?: number;
    min_rating?: number;
    min_download_count?: number;
    created_after?: Date;
    updated_after?: Date;

export interface PromotionTargetingRule {
    type: PromotionTargetType;
    conditions: TargetingCondition[];
    operator: 'AND' | 'OR';

export interface TargetingCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
    value: any;
    weight?: number;

export interface ContentSelectionStrategy {
    method: 'manual' | 'automatic' | 'hybrid';
    automatic_refresh: boolean;
    refresh_interval_hours?: number;
    performance_based_rotation: boolean;

export interface ContentSelectionCriteria {
    min_rating?: number;
    min_download_count?: number;
    quality_score_threshold?: number;
    categories?: string[];
    tags?: string[];
    content_types?: string[];
    creators?: string[];
    min_conversion_rate?: number;
    min_revenue?: number;
    trending_score_threshold?: number;
    published_after?: Date;
    exclude_recently_promoted?: boolean;
    exclude_current_promotions?: boolean;
    max_per_creator?: number;
    max_per_category?: number;
    diversification_rules?: ContentDiversificationRule[];
    max_content_count: number;

export interface ContentDiversificationRule {
    attribute: 'creator' | 'category' | 'content_type' | 'price_range';
    max_percentage: number;
    enforce_minimum_variety: boolean;

export interface ContentDisplayConfiguration {
    display_location: string;
    layout_type: 'carousel' | 'grid' | 'list' | 'featured_card' | 'banner';
    max_visible_items: number;
    theme: string;
    custom_css?: string;
    show_badges: boolean;
    show_pricing: boolean;
    show_creator_info: boolean;
    cta_text?: string;
    cta_style?: string;
    mobile_layout?: string;
    tablet_layout?: string;

export interface ContentRotationConfig {
    rotation_type: 'fixed_time' | 'performance_based' | 'equal_time' | 'weighted';
    rotation_interval_minutes?: number;
    performance_thresholds?: {
        min_ctr?: number;
        min_conversions?: number;
        max_time_minutes?: number;
    };
    weight_factors?: {
        performance_weight: number;
        recency_weight: number;
        diversity_weight: number;
    };
    randomize_order: boolean;
    allow_repeat_within_session: boolean;

export interface BundleConfiguration {
    bundle_type: 'fixed' | 'flexible' | 'dynamic';
    required_items?: string[];
    flexible_options?: BundleFlexibleOption[];
    dynamic_strategy?: 'collaborative_filtering' | 'content_similarity' | 'purchase_history';
    min_items: number;
    max_items: number;
    allow_duplicates: boolean;

export interface BundleFlexibleOption {
    category: string;
    required_count: number;
    available_items?: string[];

export interface BundleItem {
    item_id: string;
    required: boolean;
    discount_percentage?: number;
    position?: number;

export interface BundleRecommendationStrategy {
    recommendation_engine: 'rule_based' | 'ml_powered' | 'hybrid';
    rules?: BundleRecommendationRule[];
    ml_model_id?: string;
    confidence_threshold?: number;
    max_recommendations: number;
    personalization_level: 'low' | 'medium' | 'high';

export interface BundleRecommendationRule {
    trigger_item_id?: string;
    trigger_category?: string;
    recommended_categories?: string[];
    recommended_items?: string[];
    boost_score: number;

export interface BundleTrigger {
    trigger_type: 'cart_add' | 'page_view' | 'checkout_start' | 'time_on_page';
    trigger_conditions: Record<string, any>;
    display_timing: 'immediate' | 'delayed' | 'on_exit_intent';
    delay_seconds?: number;

export interface CampaignChannel {
    channel: 'email' | 'web' | 'mobile_app' | 'social_media' | 'external_ads';
    enabled: boolean;
    channel_config: Record<string, any>;
    channel_metrics: {,
        impressions: number;
        clicks: number;
        conversions: number;
        spend?: number;
    };

export interface CampaignBudget {
    total_budget_cents: number;
    daily_budget_cents?: number;
    spend_to_date_cents: number;
    budget_allocation: Record<string, number>;
    budget_alerts: BudgetAlert[];

export interface BudgetAlert {
    threshold_percentage: number;
    alert_channels: ('email' | 'dashboard' | 'slack')[];
    recipients: string[];

export interface PromotionPerformanceMetrics {
    total_uses: number;
    unique_users: number;
    conversion_rate: number;
    total_discount_given_cents: number;
    total_revenue_generated_cents: number;
    average_order_value_cents: number;
    roi: number;
    impressions: number;
    clicks: number;
    click_through_rate: number;
    first_use_date?: Date;
    last_use_date?: Date;
    peak_usage_period?: {
        start: Date;
        end: Date;
        usage_count: number;
    };
    repeat_usage_rate: number;
    average_time_to_conversion_minutes?: number;
    bounce_rate?: number;
    lift_vs_baseline?: number;
    metrics_updated_at: Date;

export interface ContentPromotionMetrics {
    content_id: string;
    content_title: string;
    impressions: number;
    clicks: number;
    click_through_rate: number;
    page_views: number;
    conversions: number;
    conversion_rate: number;
    revenue_generated_cents: number;
    average_time_on_content_seconds: number;
    bounce_rate: number;
    shares: number;
    favorites: number;
    average_display_position: number;
    total_display_time_minutes: number;
    performance_score: number;
    period_start: Date;
    period_end: Date;

export interface CampaignMetrics {
    total_reach: number;
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_spend_cents: number;
    total_revenue_cents: number;
    cost_per_click_cents: number;
    cost_per_conversion_cents: number;
    return_on_ad_spend: number;
    channel_performance: Array<{,
        channel: string;
        impressions: number;
        clicks: number;
        conversions: number;
        spend_cents: number;
        roas: number;
    }>;
    promotion_performance: Array<{,
        promotion_id: string;
        promotion_name: string;
        contribution_to_revenue: number;
        usage_count: number;
    }>;
    daily_metrics: Array<{,
        date: string;
        impressions: number;
        clicks: number;
        conversions: number;
        spend_cents: number;
    }>;

export interface PromotionRule {
    id: string;
    name: string;
    description: string;
    conditions: PromotionRuleCondition[];
    condition_operator: 'AND' | 'OR';
    actions: PromotionRuleAction[];
    enabled: boolean;
    priority: number;
    triggered_count: number;
    success_rate: number;
    created_at: Date;
    updated_at: Date;
    created_by: string;

export interface PromotionRuleCondition {
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'regex_match';
    value: any;
    negate?: boolean;

export interface PromotionRuleAction {
    action_type: 'apply_promotion' | 'suggest_promotion' | 'trigger_campaign' | 'send_notification';
    parameters: Record<string, any>;
    delay_seconds?: number;

export interface PromotionTemplate {
    id: string;
    name: string;
    description: string;
    template_type: PromotionType;
    default_settings: Partial<BasePromotion>;
    configurable_fields: PromotionTemplateField[];
    category: string;
    use_case_examples: string[];
    created_by: string;
    created_at: Date;
    usage_count: number;

export interface PromotionTemplateField {
    field_name: string;
    display_name: string;
    field_type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select';
    required: boolean;
    default_value?: any;
    validation_rules?: ValidationRule[];
    options?: {
        value: any;
        label: string;
    }[];

export interface ValidationRule {
    rule_type: 'min' | 'max' | 'pattern' | 'custom';
    value: any;
    error_message: string;

export interface PromotionAuditLog {
    id: string;
    promotion_id: string;
    action: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted' | 'applied' | 'expired';
    description: string;
    user_id?: string;
    admin_id?: string;
    ip_address?: string;
    user_agent?: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    metadata: Record<string, any>;
    timestamp: Date;

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

export interface PromotionEligibilityCheck {
    promotion_id: string;
    eligible: boolean;
    reasons?: string[];
    discount_amount_cents?: number;
    missing_requirements?: {
        minimum_purchase_amount?: number;
        required_items?: string[];
        user_criteria?: string[];
    };
    conflicts_with?: string[];
    can_stack_with?: string[];

export interface PromotionApplicationResult {
    success: boolean;
    promotion_id: string;
    discount_applied_cents: number;
    original_total_cents: number;
    new_total_cents: number;
    total_savings_cents: number;
    items_affected: Array<{,
        item_id: string;
        original_price_cents: number;
        discounted_price_cents: number;
        discount_amount_cents: number;
    }>;
    applied_at: Date;
    expires_at?: Date;
    usage_recorded: boolean;

export interface PromotionSearchCriteria {
    status?: PromotionStatus[];
    type?: PromotionType[];
    enabled?: boolean;
    active_on?: Date;
    created_after?: Date;
    created_before?: Date;
    expires_after?: Date;
    expires_before?: Date;
    search_query?: string;
    applicable_to_user?: string;
    applicable_to_items?: string[];
    min_usage_count?: number;
    min_conversion_rate?: number;
    min_roi?: number;
    created_by?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sort_by?: 'name' | 'created_at' | 'start_date' | 'usage_count' | 'roi';
    sort_order?: 'asc' | 'desc';

export interface PromotionSearchResult {
    promotions: BasePromotion[];
    total_count: number;
    has_more: boolean;
    aggregates: {,
        total_active: number;
        total_scheduled: number;
        total_expired: number;
        total_discount_given_cents: number;
        average_conversion_rate: number;
    };
    facets?: {
        types: Array<{,
            type: PromotionType;
            count: number;
        }>;
        statuses: Array<{,
            status: PromotionStatus;
            count: number;
        }>;
        creators: Array<{,
            creator: string;
            count: number;
        }>;
    };

export declare const CreatePromotionSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof PromotionType>;
    name: z.ZodString;
    description: z.ZodString;
    start_date: z.ZodDate;
    end_date: z.ZodDate;
    timezone: z.ZodString;
    application_type: z.ZodNativeEnum<typeof PromotionApplicationType>;
    promo_code: z.ZodOptional<z.ZodString>;
    usage_limit: z.ZodOptional<z.ZodNumber>;
    user_usage_limit: z.ZodOptional<z.ZodNumber>;
    target_type: z.ZodNativeEnum<typeof PromotionTargetType>;
    targeting_rules: z.ZodArray<z.ZodObject<{,
        type: z.ZodNativeEnum<typeof PromotionTargetType>;
        conditions: z.ZodArray<z.ZodAny, "many">;
        operator: z.ZodEnum<["AND", "OR"]>;
    }, "strip", z.ZodTypeAny, {
        type: PromotionTargetType;
        operator: "AND" | "OR";
        conditions: any[];
    }, {
        type: PromotionTargetType;
        operator: "AND" | "OR";
        conditions: any[];
    }>, "many">;
    priority: z.ZodDefault<z.ZodNumber>;
    stackable: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    priority: number;
    type: PromotionType;
    metadata: Record<string, any>;
    target_type: PromotionTargetType;
    start_date: Date;
    end_date: Date;
    timezone: string;
    application_type: PromotionApplicationType;
    targeting_rules: {,
        type: PromotionTargetType;
        operator: "AND" | "OR";
        conditions: any[];
    }[];
    stackable: boolean;
    promo_code?: string | undefined;
    usage_limit?: number | undefined;
    user_usage_limit?: number | undefined;
}, {
    name: string;
    description: string;
    type: PromotionType;
    target_type: PromotionTargetType;
    start_date: Date;
    end_date: Date;
    timezone: string;
    application_type: PromotionApplicationType;
    targeting_rules: {,
        type: PromotionTargetType;
        operator: "AND" | "OR";
        conditions: any[];
    }[];
    priority?: number | undefined;
    metadata?: Record<string, any> | undefined;
    promo_code?: string | undefined;
    usage_limit?: number | undefined;
    user_usage_limit?: number | undefined;
    stackable?: boolean | undefined;
}>;
export declare const UpdatePromotionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PromotionStatus>>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    start_date: z.ZodOptional<z.ZodDate>;
    end_date: z.ZodOptional<z.ZodDate>;
    usage_limit: z.ZodOptional<z.ZodNumber>;
    priority: z.ZodOptional<z.ZodNumber>;
    targeting_rules: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    priority?: number | undefined;
    status?: PromotionStatus | undefined;
    metadata?: Record<string, any> | undefined;
    enabled?: boolean | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    usage_limit?: number | undefined;
    targeting_rules?: any[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    priority?: number | undefined;
    status?: PromotionStatus | undefined;
    metadata?: Record<string, any> | undefined;
    enabled?: boolean | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    usage_limit?: number | undefined;
    targeting_rules?: any[] | undefined;
}>;
export declare const ApplyPromotionSchema: z.ZodObject<{
    promotion_id: z.ZodString;
    user_id: z.ZodString;
    cart_id: z.ZodOptional<z.ZodString>;
    promo_code: z.ZodOptional<z.ZodString>;
    force_apply: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    promotion_id: string;
    force_apply: boolean;
    promo_code?: string | undefined;
    cart_id?: string | undefined;
}, {
    user_id: string;
    promotion_id: string;
    promo_code?: string | undefined;
    cart_id?: string | undefined;
    force_apply?: boolean | undefined;
}>;
export declare const CheckEligibilitySchema: z.ZodObject<{
    promotion_id: z.ZodString;
    user_id: z.ZodString;
    cart_id: z.ZodOptional<z.ZodString>;
    item_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    promotion_id: string;
    cart_id?: string | undefined;
    item_ids?: string[] | undefined;
}, {
    user_id: string;
    promotion_id: string;
    cart_id?: string | undefined;
    item_ids?: string[] | undefined;
}>;
export type { BasePromotion, DiscountPromotion, ContentPromotion, BundlePromotion, CampaignPromotion, DiscountConfiguration, DiscountTier, ApplicableItemsFilter, PromotionTargetingRule, TargetingCondition, ContentSelectionStrategy, ContentSelectionCriteria, ContentDiversificationRule, ContentDisplayConfiguration, ContentRotationConfig, BundleConfiguration, BundleFlexibleOption, BundleItem, BundleRecommendationStrategy, BundleRecommendationRule, BundleTrigger, CampaignChannel, CampaignBudget, BudgetAlert, PromotionPerformanceMetrics, ContentPromotionMetrics, CampaignMetrics, PromotionRule, PromotionRuleCondition, PromotionRuleAction, PromotionTemplate, PromotionTemplateField, ValidationRule, PromotionAuditLog, PromotionServiceResponse, PromotionEligibilityCheck, PromotionApplicationResult, PromotionSearchCriteria, PromotionSearchResult };
export { PromotionType, PromotionStatus, PromotionTargetType, PromotionApplicationType, DiscountApplicationScope, PromotionTrigger, CreatePromotionSchema, UpdatePromotionSchema, ApplyPromotionSchema, CheckEligibilitySchema };
//# sourceMappingURL=PromotionInterfaces.d.ts.map