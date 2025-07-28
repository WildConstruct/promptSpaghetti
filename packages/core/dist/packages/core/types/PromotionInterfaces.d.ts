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
    CREATOR_SPOTLIGHT = "creator_spotlight",
    export,
    enum,
    PromotionStatus
}
export declare const UpdatePromotionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ApplyPromotionSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const CheckEligibilitySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type { BasePromotion, DiscountPromotion, ContentPromotion, BundlePromotion, CampaignPromotion, DiscountConfiguration, DiscountTier, ApplicableItemsFilter, PromotionTargetingRule, TargetingCondition, ContentSelectionStrategy, ContentSelectionCriteria, ContentDiversificationRule, ContentDisplayConfiguration, ContentRotationConfig, BundleConfiguration, BundleFlexibleOption, BundleItem, BundleRecommendationStrategy, BundleRecommendationRule, BundleTrigger, CampaignChannel, CampaignBudget, BudgetAlert, PromotionPerformanceMetrics, ContentPromotionMetrics, CampaignMetrics, PromotionRule, PromotionRuleCondition, PromotionRuleAction, PromotionTemplate, PromotionTemplateField, ValidationRule, PromotionAuditLog, PromotionServiceResponse, PromotionEligibilityCheck, PromotionApplicationResult, PromotionSearchCriteria, PromotionSearchResult };
export { PromotionType, PromotionStatus, PromotionTargetType, PromotionApplicationType, DiscountApplicationScope, PromotionTrigger, CreatePromotionSchema, UpdatePromotionSchema, ApplyPromotionSchema, CheckEligibilitySchema };
//# sourceMappingURL=PromotionInterfaces.d.ts.map