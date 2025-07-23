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
})(PromotionType || (PromotionType = {}));
export var PromotionStatus;
(function (PromotionStatus) {
    PromotionStatus["DRAFT"] = "draft";
    PromotionStatus["SCHEDULED"] = "scheduled";
    PromotionStatus["ACTIVE"] = "active";
    PromotionStatus["PAUSED"] = "paused";
    PromotionStatus["COMPLETED"] = "completed";
    PromotionStatus["CANCELLED"] = "cancelled";
    PromotionStatus["EXPIRED"] = "expired";
})(PromotionStatus || (PromotionStatus = {}));
export var PromotionTargetType;
(function (PromotionTargetType) {
    PromotionTargetType["ALL_USERS"] = "all_users";
    PromotionTargetType["SPECIFIC_USERS"] = "specific_users";
    PromotionTargetType["USER_SEGMENT"] = "user_segment";
    PromotionTargetType["GEOGRAPHIC"] = "geographic";
    PromotionTargetType["BEHAVIORAL"] = "behavioral";
    PromotionTargetType["DEMOGRAPHIC"] = "demographic";
})(PromotionTargetType || (PromotionTargetType = {}));
export var PromotionApplicationType;
(function (PromotionApplicationType) {
    PromotionApplicationType["AUTOMATIC"] = "automatic";
    PromotionApplicationType["CODE_REQUIRED"] = "code_required";
    PromotionApplicationType["LINK_BASED"] = "link_based";
    PromotionApplicationType["CONDITIONAL"] = "conditional";
})(PromotionApplicationType || (PromotionApplicationType = {}));
export var DiscountApplicationScope;
(function (DiscountApplicationScope) {
    DiscountApplicationScope["CART_TOTAL"] = "cart_total";
    DiscountApplicationScope["SPECIFIC_ITEMS"] = "specific_items";
    DiscountApplicationScope["CATEGORY"] = "category";
    DiscountApplicationScope["BRAND"] = "brand";
    DiscountApplicationScope["CREATOR"] = "creator";
    DiscountApplicationScope["LICENSE_TYPE"] = "license_type";
})(DiscountApplicationScope || (DiscountApplicationScope = {}));
export var PromotionTrigger;
(function (PromotionTrigger) {
    PromotionTrigger["TIME_BASED"] = "time_based";
    PromotionTrigger["USER_ACTION"] = "user_action";
    PromotionTrigger["CART_VALUE"] = "cart_value";
    PromotionTrigger["ITEM_COUNT"] = "item_count";
    PromotionTrigger["PAGE_VIEW"] = "page_view";
    PromotionTrigger["REFERRAL"] = "referral";
    PromotionTrigger["FIRST_PURCHASE"] = "first_purchase";
    PromotionTrigger["REPEAT_PURCHASE"] = "repeat_purchase";
})(PromotionTrigger || (PromotionTrigger = {}));
// =============================================================================
// Validation Schemas
// =============================================================================
export const CreatePromotionSchema = z.object({
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
    targeting_rules: z.array(z.object({
        type: z.nativeEnum(PromotionTargetType),
        conditions: z.array(z.any()),
        operator: z.enum(['AND', 'OR'])
    })),
    priority: z.number().int().min(1).max(100).default(50),
    stackable: z.boolean().default(false),
    metadata: z.record(z.any()).default({})
});
export const UpdatePromotionSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    status: z.nativeEnum(PromotionStatus).optional(),
    enabled: z.boolean().optional(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    usage_limit: z.number().int().min(1).optional(),
    priority: z.number().int().min(1).max(100).optional(),
    targeting_rules: z.array(z.any()).optional(),
    metadata: z.record(z.any()).optional()
});
export const ApplyPromotionSchema = z.object({
    promotion_id: z.string().uuid(),
    user_id: z.string().uuid(),
    cart_id: z.string().uuid().optional(),
    promo_code: z.string().optional(),
    force_apply: z.boolean().default(false)
});
export const CheckEligibilitySchema = z.object({
    promotion_id: z.string().uuid(),
    user_id: z.string().uuid(),
    cart_id: z.string().uuid().optional(),
    item_ids: z.array(z.string().uuid()).optional()
});
//# sourceMappingURL=PromotionInterfaces.js.map