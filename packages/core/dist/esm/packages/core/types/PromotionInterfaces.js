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
export var PromotionType;
(function (PromotionType) {
    // Price-based promotions
    PromotionType["PERCENTAGE_DISCOUNT"] = "percentage_discount";
    PromotionType["FIXED_AMOUNT_DISCOUNT"] = "fixed_amount_discount";
    PromotionType["BUY_ONE_GET_ONE"] = "buy_one_get_one";
    PromotionType["BULK_DISCOUNT"] = "bulk_discount";
    // Content promotions
    PromotionType["FEATURED_CONTENT"] = "featured_content";
    PromotionType["CATEGORY_SPOTLIGHT"] = "category_spotlight";
    PromotionType["TRENDING_CAROUSEL"] = "trending_carousel";
    PromotionType["EDITOR_CHOICE"] = "editor_choice";
    PromotionType["NEW_ARRIVALS"] = "new_arrivals";
    // User-based promotions
    PromotionType["LOYALTY_REWARD"] = "loyalty_reward";
    PromotionType["REFERRAL_BONUS"] = "referral_bonus";
    PromotionType["FIRST_TIME_BUYER"] = "first_time_buyer";
    PromotionType["VIP_EXCLUSIVE"] = "vip_exclusive";
    // Time-based promotions
    PromotionType["SEASONAL_SALE"] = "seasonal_sale";
    PromotionType["FLASH_SALE"] = "flash_sale";
    PromotionType["EARLY_BIRD"] = "early_bird";
    PromotionType["LAST_CHANCE"] = "last_chance";
    // Bundle promotions
    PromotionType["CROSS_SELL"] = "cross_sell";
    PromotionType["UPSELL"] = "upsell";
    PromotionType["BUNDLE_DEAL"] = "bundle_deal";
    // Industry-specific
    PromotionType["FILM_INDUSTRY_SPECIAL"] = "film_industry_special";
    PromotionType["CREATOR_SPOTLIGHT"] = "creator_spotlight";
    PromotionType[PromotionType["export"] = void 0] = "export";
    PromotionType[PromotionType["enum"] = void 0] = "enum";
    PromotionType[PromotionType["PromotionStatus"] = void 0] = "PromotionStatus";
})(PromotionType || (PromotionType = {}));
{
    DRAFT = 'draft',
        SCHEDULED = 'scheduled',
        ACTIVE = 'active',
        PAUSED = 'paused',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
        EXPIRED = 'expired';
    export let PromotionTargetType;
    (function (PromotionTargetType) {
        PromotionTargetType["ALL_USERS"] = "all_users";
        PromotionTargetType["SPECIFIC_USERS"] = "specific_users";
        PromotionTargetType["USER_SEGMENT"] = "user_segment";
        PromotionTargetType["GEOGRAPHIC"] = "geographic";
        PromotionTargetType["BEHAVIORAL"] = "behavioral";
        PromotionTargetType["DEMOGRAPHIC"] = "demographic";
        PromotionTargetType[PromotionTargetType["export"] = void 0] = "export";
        PromotionTargetType[PromotionTargetType["enum"] = void 0] = "enum";
        PromotionTargetType[PromotionTargetType["PromotionApplicationType"] = void 0] = "PromotionApplicationType";
    })(PromotionTargetType || (PromotionTargetType = {}));
    {
        AUTOMATIC = 'automatic',
            CODE_REQUIRED = 'code_required',
            LINK_BASED = 'link_based',
            CONDITIONAL = 'conditional';
        export let DiscountApplicationScope;
        (function (DiscountApplicationScope) {
            DiscountApplicationScope["CART_TOTAL"] = "cart_total";
            DiscountApplicationScope["SPECIFIC_ITEMS"] = "specific_items";
            DiscountApplicationScope["CATEGORY"] = "category";
            DiscountApplicationScope["BRAND"] = "brand";
            DiscountApplicationScope["CREATOR"] = "creator";
            DiscountApplicationScope["LICENSE_TYPE"] = "license_type";
            DiscountApplicationScope[DiscountApplicationScope["export"] = void 0] = "export";
            DiscountApplicationScope[DiscountApplicationScope["enum"] = void 0] = "enum";
            DiscountApplicationScope[DiscountApplicationScope["PromotionTrigger"] = void 0] = "PromotionTrigger";
        })(DiscountApplicationScope || (DiscountApplicationScope = {}));
        {
            TIME_BASED = 'time_based',
                USER_ACTION = 'user_action',
                CART_VALUE = 'cart_value',
                ITEM_COUNT = 'item_count',
                PAGE_VIEW = 'page_view',
                REFERRAL = 'referral',
                FIRST_PURCHASE = 'first_purchase',
                REPEAT_PURCHASE = 'repeat_purchase';
        }
    }
}
    | PromotionType.PERCENTAGE_DISCOUNT
    | PromotionType.FIXED_AMOUNT_DISCOUNT
    | PromotionType.BULK_DISCOUNT
    | PromotionType.BUY_ONE_GET_ONE;
// Discount configuration
discount_config: DiscountConfiguration;
// Application scope
application_scope: DiscountApplicationScope;
applicable_items ?  : ApplicableItemsFilter;
// Minimum requirements
minimum_purchase_amount ?  : number;
minimum_item_count ?  : number;
required_items ?  : string; // Item IDs that must be in cart,
// Maximum discount limits
max_discount_amount ?  : number;
max_discount_per_user ?  : number;
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
rotation_config ?  : ContentRotationConfig;
// Performance tracking
content_performance: ContentPromotionMetrics;
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
;
// Weighted rotation
weight_factors ?  : {
    performance_weight: number,
    recency_weight: number,
    diversity_weight: number
};
// General settings
randomize_order: boolean;
allow_repeat_within_session: boolean;
;
;
// User behavior
repeat_usage_rate: number;
average_time_to_conversion_minutes ?  : number;
bounce_rate ?  : number;
// Comparison metrics
lift_vs_baseline ?  : number; // Percentage improvement vs. no promotion
// Last updated
metrics_updated_at: Date;
 > ;
// Promotion breakdown
promotion_performance: Array < {
    promotion_id: string,
    promotion_name: string,
    contribution_to_revenue: number,
    usage_count: number
} > ;
// Time series data
daily_metrics: Array < {
    date: string,
    impressions: number,
    clicks: number,
    conversions: number,
    spend_cents: number
} > ;
options ?  : { value: any, label: string }[]; // For select fields
;
// Stacking information
conflicts_with ?  : string; // Other promotion IDs that conflict
can_stack_with ?  : string; // Other promotions that can be combined
 > ;
// Metadata
applied_at: Date;
expires_at ?  : Date;
usage_recorded: boolean;
;
// Facets for filtering
facets ?  : {
    types: (Array),
    statuses: (Array),
    creators: (Array)
};
export const CreatePromotionSchema = z.object({});
type: z.nativeEnum(PromotionType),
    name;
z.string().min(1).max(200),
    description;
z.string().max(1000),
    start_date;
z.date(),
    end_date;
z.date(),
    timezone;
z.string(),
    application_type;
z.nativeEnum(PromotionApplicationType),
    promo_code;
z.string().max(50).optional(),
    usage_limit;
z.number().int().min(1).optional(),
    user_usage_limit;
z.number().int().min(1).optional(),
    target_type;
z.nativeEnum(PromotionTargetType),
    targeting_rules;
z.array(z.object({}), type, z.nativeEnum(PromotionTargetType), conditions, z.array(z.any()), operator, z.enum(['AND', 'OR']));
priority: z.number().int().min(1).max(100).default(50),
    stackable;
z.boolean().default(false),
    metadata;
z.record(z.any()).default({});
;
export const UpdatePromotionSchema = z.object({});
name: z.string().min(1).max(200).optional(),
    description;
z.string().max(1000).optional(),
    status;
z.nativeEnum(PromotionStatus).optional(),
    enabled;
z.boolean().optional(),
    start_date;
z.date().optional(),
    end_date;
z.date().optional(),
    usage_limit;
z.number().int().min(1).optional(),
    priority;
z.number().int().min(1).max(100).optional(),
    targeting_rules;
z.array(z.any()).optional(),
    metadata;
z.record(z.any()).optional(),
;
;
export const ApplyPromotionSchema = z.object({});
promotion_id: z.string().uuid(),
    user_id;
z.string().uuid(),
    cart_id;
z.string().uuid().optional(),
    promo_code;
z.string().optional(),
    force_apply;
z.boolean().default(false),
;
;
export const CheckEligibilitySchema = z.object({});
promotion_id: z.string().uuid(),
    user_id;
z.string().uuid(),
    cart_id;
z.string().uuid().optional(),
    item_ids;
z.array(z.string().uuid()).optional(),
;
;
export { PromotionStatus, PromotionTargetType, PromotionApplicationType, DiscountApplicationScope, PromotionTrigger };
