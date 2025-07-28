export interface PromotionCampaign {
    campaignId: string;
    name: string;
    displayName: string;
    description: string;
    promotionType: PromotionType;
    promotionStrategy: PromotionStrategy;
    contentSelectionMethod: ContentSelectionMethod;
    promotedContent: PromotionContent;
    contentCriteria?: ContentSelectionCriteria;
    schedule: PromotionSchedule;
    rotationConfig: RotationConfiguration;
    performanceGoals: PromotionGoal;
    optimizationSettings: OptimizationSettings;
    abTestConfig?: ABTestConfiguration;
    targeting: PromotionTargeting;
    personalizationRules?: PersonalizationRule;
    budget?: PromotionBudget;
    resourceAllocation: ResourceAllocation;
    status: PromotionStatus;
    lifecycle: PromotionLifecycle;
    performanceMetrics?: PromotionMetrics;
    insights?: PromotionInsight;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy?: string;
    approvalHistory: ApprovalRecord;
    tags: string;
    categories: string;
    integrationConfig?: {
        analyticsTracking: AnalyticsTrackingConfig;
        externalPlatforms?: ExternalPlatformConfig;
        customEventTracking?: CustomEventConfig;
    };
}
export declare enum PromotionType {
    FEATURED_TEMPLATES = "featured_templates",
    NEW_RELEASES = "new_releases",
    TRENDING_NOW = "trending_now",
    EDITORS_CHOICE = "editors_choice",
    SEASONAL_HIGHLIGHTS = "seasonal_highlights",
    PERSONALIZED_RECOMMENDATIONS = "personalized_recommendations",
    BASED_ON_HISTORY = "based_on_history",
    COLLABORATIVE_FILTERING = "collaborative_filtering",
    CATEGORY_SPOTLIGHT = "category_spotlight",
    CROSS_CATEGORY = "cross_category",
    NICHE_DISCOVERY = "niche_discovery",
    TOP_RATED = "top_rated",
    BEST_SELLERS = "best_sellers",
    HIGH_ENGAGEMENT = "high_engagement",
    RISING_STARS = "rising_stars",
    LIMITED_TIME_OFFERS = "limited_time_offers",
    FLASH_PROMOTIONS = "flash_promotions",
    EXCLUSIVE_ACCESS = "exclusive_access",
    EARLY_BIRD = "early_bird",
    BRAND_PARTNERSHIPS = "brand_partnerships",
    CREATOR_SPOTLIGHTS = "creator_spotlights",
    THEMED_COLLECTIONS = "themed_collections",
    EDUCATIONAL_SERIES = "educational_series",
    export,
    enum,
    PromotionStrategy
}
//# sourceMappingURL=PromotionDataModel.d.ts.map