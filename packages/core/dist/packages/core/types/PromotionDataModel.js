/**
 * Promotion Data Model - Epic 17.5
 *
 * Comprehensive data model for marketplace template promotion system,
 * enabling featured content management, campaign orchestration, and
 * performance-driven content placement with advanced targeting capabilities.
 *
 * Task: E17-1753114397315-003606 - Create promotion data model
 * Epic: 17 - Backstage Admin Controls
 */
export var PromotionType;
(function (PromotionType) {
    // Content-Based Promotions
    PromotionType["FEATURED_TEMPLATES"] = "featured_templates";
    PromotionType["NEW_RELEASES"] = "new_releases";
    PromotionType["TRENDING_NOW"] = "trending_now";
    PromotionType["EDITORS_CHOICE"] = "editors_choice";
    PromotionType["SEASONAL_HIGHLIGHTS"] = "seasonal_highlights";
    // User-Based Promotions
    PromotionType["PERSONALIZED_RECOMMENDATIONS"] = "personalized_recommendations";
    PromotionType["BASED_ON_HISTORY"] = "based_on_history";
    PromotionType["COLLABORATIVE_FILTERING"] = "collaborative_filtering";
    // Category-Based Promotions
    PromotionType["CATEGORY_SPOTLIGHT"] = "category_spotlight";
    PromotionType["CROSS_CATEGORY"] = "cross_category";
    PromotionType["NICHE_DISCOVERY"] = "niche_discovery";
    // Performance-Based Promotions
    PromotionType["TOP_RATED"] = "top_rated";
    PromotionType["BEST_SELLERS"] = "best_sellers";
    PromotionType["HIGH_ENGAGEMENT"] = "high_engagement";
    PromotionType["RISING_STARS"] = "rising_stars";
    // Event-Based Promotions
    PromotionType["LIMITED_TIME_OFFERS"] = "limited_time_offers";
    PromotionType["FLASH_PROMOTIONS"] = "flash_promotions";
    PromotionType["EXCLUSIVE_ACCESS"] = "exclusive_access";
    PromotionType["EARLY_BIRD"] = "early_bird";
    // Campaign-Based Promotions
    PromotionType["BRAND_PARTNERSHIPS"] = "brand_partnerships";
    PromotionType["CREATOR_SPOTLIGHTS"] = "creator_spotlights";
    PromotionType["THEMED_COLLECTIONS"] = "themed_collections";
    PromotionType["EDUCATIONAL_SERIES"] = "educational_series";
})(PromotionType || (PromotionType = {}));
export var PromotionStrategy;
(function (PromotionStrategy) {
    // Selection Strategies
    PromotionStrategy["MANUAL_CURATION"] = "manual_curation";
    PromotionStrategy["ALGORITHMIC_SELECTION"] = "algorithmic_selection";
    PromotionStrategy["PERFORMANCE_DRIVEN"] = "performance_driven";
    PromotionStrategy["HYBRID_APPROACH"] = "hybrid_approach";
    // Rotation Strategies
    PromotionStrategy["EQUAL_ROTATION"] = "equal_rotation";
    PromotionStrategy["WEIGHTED_ROTATION"] = "weighted_rotation";
    PromotionStrategy["PERFORMANCE_WEIGHTED"] = "performance_weighted";
    PromotionStrategy["TIME_BASED_ROTATION"] = "time_based_rotation";
    // Optimization Strategies
    PromotionStrategy["CTR_OPTIMIZATION"] = "ctr_optimization";
    PromotionStrategy["CONVERSION_OPTIMIZATION"] = "conversion_optimization";
    PromotionStrategy["REVENUE_OPTIMIZATION"] = "revenue_optimization";
    PromotionStrategy["ENGAGEMENT_OPTIMIZATION"] = "engagement_optimization";
    // Personalization Strategies
    PromotionStrategy["COLLABORATIVE_FILTERING"] = "collaborative_filtering";
    PromotionStrategy["CONTENT_BASED_FILTERING"] = "content_based_filtering";
    PromotionStrategy["DEMOGRAPHIC_TARGETING"] = "demographic_targeting";
    PromotionStrategy["BEHAVIORAL_TARGETING"] = "behavioral_targeting";
})(PromotionStrategy || (PromotionStrategy = {}));
export var ContentSelectionMethod;
(function (ContentSelectionMethod) {
    ContentSelectionMethod["MANUAL_SELECTION"] = "manual_selection";
    ContentSelectionMethod["RULE_BASED"] = "rule_based";
    ContentSelectionMethod["ML_RECOMMENDATIONS"] = "ml_recommendations";
    ContentSelectionMethod["PERFORMANCE_RANKING"] = "performance_ranking";
    ContentSelectionMethod["HYBRID_SCORING"] = "hybrid_scoring";
    ContentSelectionMethod["REAL_TIME_OPTIMIZATION"] = "real_time_optimization";
})(ContentSelectionMethod || (ContentSelectionMethod = {}));
export var BadgeType;
(function (BadgeType) {
    BadgeType["NEW"] = "new";
    BadgeType["FEATURED"] = "featured";
    BadgeType["TRENDING"] = "trending";
    BadgeType["BESTSELLER"] = "bestseller";
    BadgeType["EDITOR_CHOICE"] = "editor_choice";
    BadgeType["LIMITED_TIME"] = "limited_time";
    BadgeType["EXCLUSIVE"] = "exclusive";
    BadgeType["PREMIUM"] = "premium";
    BadgeType["DISCOUNT"] = "discount";
    BadgeType["CUSTOM"] = "custom";
})(BadgeType || (BadgeType = {}));
export var BadgePosition;
(function (BadgePosition) {
    BadgePosition["TOP_LEFT"] = "top_left";
    BadgePosition["TOP_RIGHT"] = "top_right";
    BadgePosition["BOTTOM_LEFT"] = "bottom_left";
    BadgePosition["BOTTOM_RIGHT"] = "bottom_right";
    BadgePosition["CENTER"] = "center";
    BadgePosition["OVERLAY"] = "overlay";
})(BadgePosition || (BadgePosition = {}));
export var ContentPromotionStatus;
(function (ContentPromotionStatus) {
    ContentPromotionStatus["ELIGIBLE"] = "eligible";
    ContentPromotionStatus["ACTIVE"] = "active";
    ContentPromotionStatus["PAUSED"] = "paused";
    ContentPromotionStatus["EXPIRED"] = "expired";
    ContentPromotionStatus["UNDERPERFORMING"] = "underperforming";
    ContentPromotionStatus["EXCLUDED"] = "excluded";
})(ContentPromotionStatus || (ContentPromotionStatus = {}));
export var ScheduleType;
(function (ScheduleType) {
    ScheduleType["FIXED_DURATION"] = "fixed_duration";
    ScheduleType["PERFORMANCE_BASED"] = "performance_based";
    ScheduleType["DYNAMIC_ROTATION"] = "dynamic_rotation";
    ScheduleType["EVENT_TRIGGERED"] = "event_triggered";
    ScheduleType["CONTINUOUS"] = "continuous";
})(ScheduleType || (ScheduleType = {}));
export var RotationStrategy;
(function (RotationStrategy) {
    RotationStrategy["ROUND_ROBIN"] = "round_robin";
    RotationStrategy["WEIGHTED_RANDOM"] = "weighted_random";
    RotationStrategy["PERFORMANCE_OPTIMIZED"] = "performance_optimized";
    RotationStrategy["TIME_BASED"] = "time_based";
    RotationStrategy["USER_BEHAVIOR_DRIVEN"] = "user_behavior_driven";
    RotationStrategy["MACHINE_LEARNING"] = "machine_learning";
})(RotationStrategy || (RotationStrategy = {}));
export var UserLifeCycleStage;
(function (UserLifeCycleStage) {
    UserLifeCycleStage["NEW_VISITOR"] = "new_visitor";
    UserLifeCycleStage["FIRST_PURCHASE"] = "first_purchase";
    UserLifeCycleStage["REPEAT_CUSTOMER"] = "repeat_customer";
    UserLifeCycleStage["VIP_CUSTOMER"] = "vip_customer";
    UserLifeCycleStage["DORMANT_USER"] = "dormant_user";
    UserLifeCycleStage["CHURNED_USER"] = "churned_user";
})(UserLifeCycleStage || (UserLifeCycleStage = {}));
export var UserValueTier;
(function (UserValueTier) {
    UserValueTier["LOW_VALUE"] = "low_value";
    UserValueTier["MEDIUM_VALUE"] = "medium_value";
    UserValueTier["HIGH_VALUE"] = "high_value";
    UserValueTier["VIP_VALUE"] = "vip_value";
})(UserValueTier || (UserValueTier = {}));
export var UserEngagementLevel;
(function (UserEngagementLevel) {
    UserEngagementLevel["PASSIVE"] = "passive";
    UserEngagementLevel["CASUAL"] = "casual";
    UserEngagementLevel["ENGAGED"] = "engaged";
    UserEngagementLevel["HIGHLY_ENGAGED"] = "highly_engaged";
    UserEngagementLevel["POWER_USER"] = "power_user";
})(UserEngagementLevel || (UserEngagementLevel = {}));
export var UserIntent;
(function (UserIntent) {
    UserIntent["BROWSING"] = "browsing";
    UserIntent["RESEARCHING"] = "researching";
    UserIntent["COMPARING"] = "comparing";
    UserIntent["PURCHASING"] = "purchasing";
    UserIntent["LEARNING"] = "learning";
    UserIntent["EXPLORING"] = "exploring";
})(UserIntent || (UserIntent = {}));
export var SessionStage;
(function (SessionStage) {
    SessionStage["ENTRY"] = "entry";
    SessionStage["EXPLORATION"] = "exploration";
    SessionStage["CONSIDERATION"] = "consideration";
    SessionStage["DECISION"] = "decision";
    SessionStage["CHECKOUT"] = "checkout";
    SessionStage["POST_PURCHASE"] = "post_purchase";
})(SessionStage || (SessionStage = {}));
export var PersonalizationRuleType;
(function (PersonalizationRuleType) {
    PersonalizationRuleType["CONTENT_BOOST"] = "content_boost";
    PersonalizationRuleType["CONTENT_SUPPRESS"] = "content_suppress";
    PersonalizationRuleType["LAYOUT_MODIFICATION"] = "layout_modification";
    PersonalizationRuleType["TIMING_ADJUSTMENT"] = "timing_adjustment";
    PersonalizationRuleType["MESSAGING_CUSTOMIZATION"] = "messaging_customization";
    PersonalizationRuleType["TARGETING_REFINEMENT"] = "targeting_refinement";
})(PersonalizationRuleType || (PersonalizationRuleType = {}));
export var GoalType;
(function (GoalType) {
    GoalType["VISIBILITY"] = "visibility";
    GoalType["ENGAGEMENT"] = "engagement";
    GoalType["CONVERSION"] = "conversion";
    GoalType["REVENUE"] = "revenue";
    GoalType["RETENTION"] = "retention";
    GoalType["BRAND_AWARENESS"] = "brand_awareness";
})(GoalType || (GoalType = {}));
export var GoalPriority;
(function (GoalPriority) {
    GoalPriority["LOW"] = "low";
    GoalPriority["MEDIUM"] = "medium";
    GoalPriority["HIGH"] = "high";
    GoalPriority["CRITICAL"] = "critical";
})(GoalPriority || (GoalPriority = {}));
export var GoalStatus;
(function (GoalStatus) {
    GoalStatus["ACTIVE"] = "active";
    GoalStatus["ACHIEVED"] = "achieved";
    GoalStatus["PAUSED"] = "paused";
    GoalStatus["FAILED"] = "failed";
    GoalStatus["ARCHIVED"] = "archived";
})(GoalStatus || (GoalStatus = {}));
export var OptimizationStrategy;
(function (OptimizationStrategy) {
    OptimizationStrategy["MANUAL_CONTROL"] = "manual_control";
    OptimizationStrategy["RULE_BASED"] = "rule_based";
    OptimizationStrategy["MACHINE_LEARNING"] = "machine_learning";
    OptimizationStrategy["HYBRID_APPROACH"] = "hybrid_approach";
    OptimizationStrategy["MULTI_ARMED_BANDIT"] = "multi_armed_bandit";
    OptimizationStrategy["BAYESIAN_OPTIMIZATION"] = "bayesian_optimization";
})(OptimizationStrategy || (OptimizationStrategy = {}));
export var ABTestType;
(function (ABTestType) {
    ABTestType["SIMPLE_AB"] = "simple_ab";
    ABTestType["MULTIVARIATE"] = "multivariate";
    ABTestType["MULTI_ARMED_BANDIT"] = "multi_armed_bandit";
    ABTestType["SEQUENTIAL"] = "sequential";
})(ABTestType || (ABTestType = {}));
export var ABTestStatus;
(function (ABTestStatus) {
    ABTestStatus["DRAFT"] = "draft";
    ABTestStatus["SCHEDULED"] = "scheduled";
    ABTestStatus["RUNNING"] = "running";
    ABTestStatus["PAUSED"] = "paused";
    ABTestStatus["COMPLETED"] = "completed";
    ABTestStatus["FAILED"] = "failed";
})(ABTestStatus || (ABTestStatus = {}));
export var BudgetType;
(function (BudgetType) {
    BudgetType["LIFETIME"] = "lifetime";
    BudgetType["DAILY"] = "daily";
    BudgetType["WEEKLY"] = "weekly";
    BudgetType["MONTHLY"] = "monthly";
    BudgetType["CAMPAIGN_DURATION"] = "campaign_duration";
})(BudgetType || (BudgetType = {}));
export var SpendingPace;
(function (SpendingPace) {
    SpendingPace["EVEN"] = "even";
    SpendingPace["ACCELERATED"] = "accelerated";
    SpendingPace["FRONT_LOADED"] = "front_loaded";
    SpendingPace["BACK_LOADED"] = "back_loaded";
})(SpendingPace || (SpendingPace = {}));
export var InsightCategory;
(function (InsightCategory) {
    InsightCategory["PERFORMANCE"] = "performance";
    InsightCategory["AUDIENCE"] = "audience";
    InsightCategory["CONTENT"] = "content";
    InsightCategory["TIMING"] = "timing";
    InsightCategory["BUDGET"] = "budget";
    InsightCategory["COMPETITION"] = "competition";
    InsightCategory["TECHNICAL"] = "technical";
    InsightCategory["CREATIVE"] = "creative";
})(InsightCategory || (InsightCategory = {}));
export var InsightType;
(function (InsightType) {
    InsightType["ANOMALY"] = "anomaly";
    InsightType["TREND"] = "trend";
    InsightType["PATTERN"] = "pattern";
    InsightType["OPPORTUNITY"] = "opportunity";
    InsightType["RISK"] = "risk";
    InsightType["OPTIMIZATION"] = "optimization";
    InsightType["ALERT"] = "alert";
})(InsightType || (InsightType = {}));
export var InsightPriority;
(function (InsightPriority) {
    InsightPriority["LOW"] = "low";
    InsightPriority["MEDIUM"] = "medium";
    InsightPriority["HIGH"] = "high";
    InsightPriority["CRITICAL"] = "critical";
})(InsightPriority || (InsightPriority = {}));
export var ImpactLevel;
(function (ImpactLevel) {
    ImpactLevel["LOW"] = "low";
    ImpactLevel["MEDIUM"] = "medium";
    ImpactLevel["HIGH"] = "high";
    ImpactLevel["CRITICAL"] = "critical";
})(ImpactLevel || (ImpactLevel = {}));
// ==========================================
// STATUS AND LIFECYCLE MANAGEMENT
// ==========================================
export var PromotionStatus;
(function (PromotionStatus) {
    PromotionStatus["DRAFT"] = "draft";
    PromotionStatus["PENDING_APPROVAL"] = "pending_approval";
    PromotionStatus["APPROVED"] = "approved";
    PromotionStatus["SCHEDULED"] = "scheduled";
    PromotionStatus["ACTIVE"] = "active";
    PromotionStatus["PAUSED"] = "paused";
    PromotionStatus["COMPLETED"] = "completed";
    PromotionStatus["CANCELLED"] = "cancelled";
    PromotionStatus["ARCHIVED"] = "archived";
})(PromotionStatus || (PromotionStatus = {}));
export var LifecycleStage;
(function (LifecycleStage) {
    LifecycleStage["PLANNING"] = "planning";
    LifecycleStage["APPROVAL"] = "approval";
    LifecycleStage["SETUP"] = "setup";
    LifecycleStage["LAUNCH"] = "launch";
    LifecycleStage["OPTIMIZATION"] = "optimization";
    LifecycleStage["MONITORING"] = "monitoring";
    LifecycleStage["COMPLETION"] = "completion";
    LifecycleStage["ANALYSIS"] = "analysis";
    LifecycleStage["ARCHIVAL"] = "archival";
})(LifecycleStage || (LifecycleStage = {}));
