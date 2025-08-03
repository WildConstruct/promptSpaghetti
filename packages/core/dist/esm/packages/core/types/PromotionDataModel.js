from;
'./PlacementTypes';
;
export var PromotionType;
(function (PromotionType) {
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
    PromotionType[PromotionType["export"] = void 0] = "export";
    PromotionType[PromotionType["enum"] = void 0] = "enum";
    PromotionType[PromotionType["PromotionStrategy"] = void 0] = "PromotionStrategy";
})(PromotionType || (PromotionType = {}));
{
    // Selection Strategies
    MANUAL_CURATION = 'manual_curation',
        ALGORITHMIC_SELECTION = 'algorithmic_selection',
        PERFORMANCE_DRIVEN = 'performance_driven',
        HYBRID_APPROACH = 'hybrid_approach',
        // Rotation Strategies
        EQUAL_ROTATION = 'equal_rotation',
        WEIGHTED_ROTATION = 'weighted_rotation',
        PERFORMANCE_WEIGHTED = 'performance_weighted',
        TIME_BASED_ROTATION = 'time_based_rotation',
        // Optimization Strategies
        CTR_OPTIMIZATION = 'ctr_optimization',
        CONVERSION_OPTIMIZATION = 'conversion_optimization',
        REVENUE_OPTIMIZATION = 'revenue_optimization',
        ENGAGEMENT_OPTIMIZATION = 'engagement_optimization',
        // Personalization Strategies
        COLLABORATIVE_FILTERING = 'collaborative_filtering',
        CONTENT_BASED_FILTERING = 'content_based_filtering',
        DEMOGRAPHIC_TARGETING = 'demographic_targeting',
        BEHAVIORAL_TARGETING = 'behavioral_targeting';
    export let ContentSelectionMethod;
    (function (ContentSelectionMethod) {
        ContentSelectionMethod["MANUAL_SELECTION"] = "manual_selection";
        ContentSelectionMethod["RULE_BASED"] = "rule_based";
        ContentSelectionMethod["ML_RECOMMENDATIONS"] = "ml_recommendations";
        ContentSelectionMethod["PERFORMANCE_RANKING"] = "performance_ranking";
        ContentSelectionMethod["HYBRID_SCORING"] = "hybrid_scoring";
        ContentSelectionMethod["REAL_TIME_OPTIMIZATION"] = "real_time_optimization";
        // ==========================================
        // PROMOTION CONTENT MANAGEMENT
        // ==========================================
        ContentSelectionMethod[ContentSelectionMethod["export"] = void 0] = "export";
        ContentSelectionMethod[ContentSelectionMethod["interface"] = void 0] = "interface";
        ContentSelectionMethod[ContentSelectionMethod["PromotionContent"] = void 0] = "PromotionContent";
    })(ContentSelectionMethod || (ContentSelectionMethod = {}));
    {
        contentId: string;
        templateId: string;
        // Content Details
        contentInfo: { }
        title: string;
        description: string;
        creatorId: string;
        categoryId: string;
        tags: string;
        thumbnailUrl ?  : string;
        previewUrl ?  : string;
    }
    ;
    // Promotion Configuration
    promotionConfig: {
        priority: number;
        weight ?  : number;
        customMessage ?  : string;
        callToAction ?  : string;
        promotionalBadges ?  : PromotionalBadge;
        customStyling ?  : Partial;
    }
    ;
    // Performance Data
    performanceScore: number;
    metrics: ContentPromotionMetrics;
    // Scheduling
    startTime ?  : Date;
    endTime ?  : Date;
    timezone ?  : string;
    // Targeting Overrides
    targetingOverrides ?  : Partial;
    // Status and Lifecycle
    status: ContentPromotionStatus;
    addedAt: Date;
    lastPromoted ?  : Date;
    promotionCount: number;
    // A/B Testing
    experimentVariant ?  : string;
    controlGroup ?  : boolean;
    export let BadgeType;
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
        BadgeType[BadgeType["export"] = void 0] = "export";
        BadgeType[BadgeType["interface"] = void 0] = "interface";
        BadgeType[BadgeType["BadgeStyle"] = void 0] = "BadgeStyle";
    })(BadgeType || (BadgeType = {}));
    {
        backgroundColor: string;
        textColor: string;
        borderColor ?  : string;
        fontSize ?  : string;
        fontWeight ?  : string;
        borderRadius ?  : number;
        animation ?  : 'pulse' | 'glow' | 'bounce' | 'none';
    }
    export let BadgePosition;
    (function (BadgePosition) {
        BadgePosition["TOP_LEFT"] = "top_left";
        BadgePosition["TOP_RIGHT"] = "top_right";
        BadgePosition["BOTTOM_LEFT"] = "bottom_left";
        BadgePosition["BOTTOM_RIGHT"] = "bottom_right";
        BadgePosition["CENTER"] = "center";
    })(BadgePosition || (BadgePosition = {}));
    OVERLAY = 'overlay';
    ;
    performanceThreshold ?  : { metric: string,
        value: number,
        operator: 'gt' | 'lt' | 'eq' };
}
;
userConditions ?  : { segments: string,
    excludeSegments: string };
export var ContentPromotionStatus;
(function (ContentPromotionStatus) {
    ContentPromotionStatus["ELIGIBLE"] = "eligible";
    ContentPromotionStatus["ACTIVE"] = "active";
    ContentPromotionStatus["PAUSED"] = "paused";
    ContentPromotionStatus["EXPIRED"] = "expired";
    ContentPromotionStatus["UNDERPERFORMING"] = "underperforming";
    ContentPromotionStatus["EXCLUDED"] = "excluded";
    // ==========================================
    // CONTENT SELECTION AND CRITERIA
    // ==========================================
    ContentPromotionStatus[ContentPromotionStatus["export"] = void 0] = "export";
    ContentPromotionStatus[ContentPromotionStatus["interface"] = void 0] = "interface";
    ContentPromotionStatus[ContentPromotionStatus["ContentSelectionCriteria"] = void 0] = "ContentSelectionCriteria";
})(ContentPromotionStatus || (ContentPromotionStatus = {}));
{
    // Template Attributes
    templateCriteria: {
        ;
        categories ?  : string;
        excludeCategories ?  : string;
        tags ?  : string;
        excludeTags ?  : string;
        createdAfter ?  : Date;
        createdBefore ?  : Date;
        creatorIds ?  : string;
        excludeCreatorIds ?  : string;
        priceRange ?  : {};
        min: number;
        max: number;
    }
    ;
}
;
// Performance Requirements
performanceCriteria: {
    minRating ?  : number;
    minPurchases ?  : number;
    minRevenue ?  : number;
    maxAge ?  : number; // days,
    performancePercentile ?  : number; // top X%,
    engagementScore ?  : {};
    min: number;
    max ?  : number;
}
;
;
// Quality Standards
qualityCriteria: {
    hasPreview ?  : boolean;
    hasDocumentation ?  : boolean;
    isVerified ?  : boolean;
    moderationStatus ?  : 'approved' | 'pending' | 'rejected';
    qualityScore ?  : {};
    min: number;
    max ?  : number;
}
;
;
// Content Freshness
freshnessCriteria: {
    preferNew ?  : boolean;
    newThresholdDays ?  : number;
    updateRecency ?  : number; // days }
    trendingWeight ?  : number;
    seasonalRelevance ?  : string;
}
;
// Diversity Requirements
diversityCriteria: {
    maxPerCreator ?  : number;
    maxPerCategory ?  : number;
    ensureVariety ?  : boolean;
    balancePopularAndNiche ?  : number; // ratio }
}
;
// Exclusion Rules
exclusionRules: {
    recentlyPromoted ?  : number; // days }
    currentlyPromoted ?  : boolean;
    userPurchaseHistory ?  : boolean;
    competitorTemplates ?  : boolean;
    lowPerformers ?  : boolean;
}
;
export var ScheduleType;
(function (ScheduleType) {
    ScheduleType["FIXED_DURATION"] = "fixed_duration";
    ScheduleType["PERFORMANCE_BASED"] = "performance_based";
    ScheduleType["DYNAMIC_ROTATION"] = "dynamic_rotation";
    ScheduleType["EVENT_TRIGGERED"] = "event_triggered";
    ScheduleType["CONTINUOUS"] = "continuous";
    ScheduleType[ScheduleType["export"] = void 0] = "export";
    ScheduleType[ScheduleType["interface"] = void 0] = "interface";
    ScheduleType[ScheduleType["TimeBasedRules"] = void 0] = "TimeBasedRules";
})(ScheduleType || (ScheduleType = {}));
{
    // Daily Patterns
    hoursOfDay ?  : number;
    excludeHours ?  : number;
    // Weekly Patterns
    daysOfWeek ?  : number;
    excludeDays ?  : number;
    // Special Time Periods
    peakHours ?  : {
        start: string, // "09:00";
        end: string, // "17:00" }
        multiplier: number
    };
    // Geographic Time Zones
    primaryTimezones ?  : string;
    followUserTimezone ?  : boolean;
    // Seasonal Adjustments
    seasonalPatterns ?  : SeasonalPattern;
    adjustmentFactor: number;
    specificDates ?  : Date;
    geographicRegions ?  : string;
    endValue: Date | number;
    exceptions ?  : Date;
    export let RotationStrategy;
    (function (RotationStrategy) {
        RotationStrategy["ROUND_ROBIN"] = "round_robin";
        RotationStrategy["WEIGHTED_RANDOM"] = "weighted_random";
        RotationStrategy["PERFORMANCE_OPTIMIZED"] = "performance_optimized";
        RotationStrategy["TIME_BASED"] = "time_based";
        RotationStrategy["USER_BEHAVIOR_DRIVEN"] = "user_behavior_driven";
        RotationStrategy["MACHINE_LEARNING"] = "machine_learning";
        RotationStrategy[RotationStrategy["export"] = void 0] = "export";
        RotationStrategy[RotationStrategy["interface"] = void 0] = "interface";
        RotationStrategy[RotationStrategy["RotationFrequency"] = void 0] = "RotationFrequency";
    })(RotationStrategy || (RotationStrategy = {}));
    {
        type: 'fixed_interval' | 'performance_based' | 'traffic_based' | 'hybrid';
        interval ?  : number; // minutes }
        minInterval ?  : number;
        maxInterval ?  : number;
        conditions ?  : RotationCondition;
        ;
        priority: number;
        isActive: boolean;
        lastTriggered ?  : Date;
        value: number;
        timeWindow: number;
        ;
        // Contextual Targeting
        contextualTargeting: {
            currentPage ?  : string;
            referrerSource ?  : string;
            searchQuery ?  : string;
            userIntent ?  : UserIntent;
            sessionStage ?  : SessionStage;
            deviceCapabilities ?  : DeviceCapability;
        }
        ;
        // Behavioral Targeting
        behavioralTargeting: {
            browsingPatterns: BrowsingPattern;
            interactionHistory: InteractionPattern;
            purchasePatterns: PurchasePattern;
            contentPreferences: ContentPreference;
            temporalPatterns: TemporalPattern;
        }
        ;
        // Performance-Based Targeting
        performanceTargeting: {
            highValueUsers ?  : boolean;
            likelyConverters ?  : boolean;
            activeEngagers ?  : boolean;
            newUserFocus ?  : boolean;
            retentionRisk ?  : boolean;
        }
        ;
        // Social and Network Targeting
        socialTargeting ?  : { socialConnections: string,
            communityMembership: string,
            influencerFollowers: string,
            viralContent: boolean };
        export let UserLifeCycleStage;
        (function (UserLifeCycleStage) {
            UserLifeCycleStage["NEW_VISITOR"] = "new_visitor";
            UserLifeCycleStage["FIRST_PURCHASE"] = "first_purchase";
            UserLifeCycleStage["REPEAT_CUSTOMER"] = "repeat_customer";
            UserLifeCycleStage["VIP_CUSTOMER"] = "vip_customer";
            UserLifeCycleStage["DORMANT_USER"] = "dormant_user";
            UserLifeCycleStage["CHURNED_USER"] = "churned_user";
            UserLifeCycleStage[UserLifeCycleStage["export"] = void 0] = "export";
            UserLifeCycleStage[UserLifeCycleStage["enum"] = void 0] = "enum";
            UserLifeCycleStage[UserLifeCycleStage["UserValueTier"] = void 0] = "UserValueTier";
        })(UserLifeCycleStage || (UserLifeCycleStage = {}));
        {
            LOW_VALUE = 'low_value',
                MEDIUM_VALUE = 'medium_value',
                HIGH_VALUE = 'high_value',
                VIP_VALUE = 'vip_value';
            export let UserEngagementLevel;
            (function (UserEngagementLevel) {
                UserEngagementLevel["PASSIVE"] = "passive";
                UserEngagementLevel["CASUAL"] = "casual";
                UserEngagementLevel["ENGAGED"] = "engaged";
                UserEngagementLevel["HIGHLY_ENGAGED"] = "highly_engaged";
                UserEngagementLevel["POWER_USER"] = "power_user";
                UserEngagementLevel[UserEngagementLevel["export"] = void 0] = "export";
                UserEngagementLevel[UserEngagementLevel["interface"] = void 0] = "interface";
                UserEngagementLevel[UserEngagementLevel["PurchaseHistoryTargeting"] = void 0] = "PurchaseHistoryTargeting";
            })(UserEngagementLevel || (UserEngagementLevel = {}));
            {
                totalPurchases ?  : {};
                min: number;
                max ?  : number;
            }
            ;
            recentPurchases ?  : { days: number,
                count: number };
            categoryPurchases ?  : string;
            avgOrderValue ?  : { min: number,
                max: number };
            purchaseFrequency ?  : { min: number, // purchases per month }
                max: number
            };
            export let UserIntent;
            (function (UserIntent) {
                UserIntent["BROWSING"] = "browsing";
                UserIntent["RESEARCHING"] = "researching";
                UserIntent["COMPARING"] = "comparing";
                UserIntent["PURCHASING"] = "purchasing";
                UserIntent["LEARNING"] = "learning";
                UserIntent["EXPLORING"] = "exploring";
                UserIntent[UserIntent["export"] = void 0] = "export";
                UserIntent[UserIntent["enum"] = void 0] = "enum";
                UserIntent[UserIntent["SessionStage"] = void 0] = "SessionStage";
            })(UserIntent || (UserIntent = {}));
            {
                ENTRY = 'entry',
                    EXPLORATION = 'exploration',
                    CONSIDERATION = 'consideration',
                    DECISION = 'decision',
                    CHECKOUT = 'checkout',
                    POST_PURCHASE = 'post_purchase';
                categoryDepth: number;
                sessionDuration: number;
                pageViews: number;
                bounceRate: number;
                ;
                export let PersonalizationRuleType;
                (function (PersonalizationRuleType) {
                    PersonalizationRuleType["CONTENT_BOOST"] = "content_boost";
                    PersonalizationRuleType["CONTENT_SUPPRESS"] = "content_suppress";
                    PersonalizationRuleType["LAYOUT_MODIFICATION"] = "layout_modification";
                    PersonalizationRuleType["TIMING_ADJUSTMENT"] = "timing_adjustment";
                    PersonalizationRuleType["MESSAGING_CUSTOMIZATION"] = "messaging_customization";
                })(PersonalizationRuleType || (PersonalizationRuleType = {}));
                TARGETING_REFINEMENT = 'targeting_refinement';
                export let GoalType;
                (function (GoalType) {
                    GoalType["VISIBILITY"] = "visibility";
                    GoalType["ENGAGEMENT"] = "engagement";
                    GoalType["CONVERSION"] = "conversion";
                    GoalType["REVENUE"] = "revenue";
                    GoalType["RETENTION"] = "retention";
                })(GoalType || (GoalType = {}));
                BRAND_AWARENESS = 'brand_awareness';
                export let GoalPriority;
                (function (GoalPriority) {
                    GoalPriority["LOW"] = "low";
                    GoalPriority["MEDIUM"] = "medium";
                    GoalPriority["HIGH"] = "high";
                    GoalPriority["CRITICAL"] = "critical";
                    GoalPriority[GoalPriority["export"] = void 0] = "export";
                    GoalPriority[GoalPriority["enum"] = void 0] = "enum";
                    GoalPriority[GoalPriority["GoalStatus"] = void 0] = "GoalStatus";
                })(GoalPriority || (GoalPriority = {}));
                {
                    ACTIVE = 'active',
                        ACHIEVED = 'achieved',
                        PAUSED = 'paused',
                        FAILED = 'failed',
                        ARCHIVED = 'archived';
                    export let OptimizationStrategy;
                    (function (OptimizationStrategy) {
                        OptimizationStrategy["MANUAL_CONTROL"] = "manual_control";
                        OptimizationStrategy["RULE_BASED"] = "rule_based";
                        OptimizationStrategy["MACHINE_LEARNING"] = "machine_learning";
                        OptimizationStrategy["HYBRID_APPROACH"] = "hybrid_approach";
                        OptimizationStrategy["MULTI_ARMED_BANDIT"] = "multi_armed_bandit";
                        OptimizationStrategy["BAYESIAN_OPTIMIZATION"] = "bayesian_optimization";
                        OptimizationStrategy[OptimizationStrategy["export"] = void 0] = "export";
                        OptimizationStrategy[OptimizationStrategy["interface"] = void 0] = "interface";
                        OptimizationStrategy[OptimizationStrategy["MachineLearningConfig"] = void 0] = "MachineLearningConfig";
                    })(OptimizationStrategy || (OptimizationStrategy = {}));
                    {
                        algorithm: 'collaborative_filtering' | 'content_based' | 'deep_learning' | 'ensemble';
                    }
                    features: MLFeature;
                    trainingData: MLTrainingConfig;
                    modelUpdate: MLModelUpdateConfig;
                    explainability: boolean;
                    performanceDrift: number;
                    retrainingTrigger: number;
                    modelVersion: boolean;
                    export let ABTestType;
                    (function (ABTestType) {
                        ABTestType["SIMPLE_AB"] = "simple_ab";
                        ABTestType["MULTIVARIATE"] = "multivariate";
                        ABTestType["MULTI_ARMED_BANDIT"] = "multi_armed_bandit";
                    })(ABTestType || (ABTestType = {}));
                    SEQUENTIAL = 'sequential';
                    totalTrafficPercentage: number;
                    segments ?  : string;
                    exclusionRules ?  : string;
                    export let ABTestStatus;
                    (function (ABTestStatus) {
                        ABTestStatus["DRAFT"] = "draft";
                        ABTestStatus["SCHEDULED"] = "scheduled";
                        ABTestStatus["RUNNING"] = "running";
                        ABTestStatus["PAUSED"] = "paused";
                        ABTestStatus["COMPLETED"] = "completed";
                        ABTestStatus["FAILED"] = "failed";
                        ABTestStatus[ABTestStatus["export"] = void 0] = "export";
                        ABTestStatus[ABTestStatus["interface"] = void 0] = "interface";
                        ABTestStatus[ABTestStatus["ABTestResult"] = void 0] = "ABTestResult";
                    })(ABTestStatus || (ABTestStatus = {}));
                    {
                        variantId: string;
                        metric: string;
                        value: number;
                        sampleSize: number;
                        confidenceInterval: { }
                        lower: number;
                        upper: number;
                    }
                    ;
                    pValue: number;
                    effect: number;
                    significance: boolean;
                    status: 'pass' | 'fail' | 'warning';
                    details: string;
                    export let BudgetType;
                    (function (BudgetType) {
                        BudgetType["LIFETIME"] = "lifetime";
                        BudgetType["DAILY"] = "daily";
                        BudgetType["WEEKLY"] = "weekly";
                        BudgetType["MONTHLY"] = "monthly";
                        BudgetType["CAMPAIGN_DURATION"] = "campaign_duration";
                        BudgetType[BudgetType["export"] = void 0] = "export";
                        BudgetType[BudgetType["enum"] = void 0] = "enum";
                        BudgetType[BudgetType["SpendingPace"] = void 0] = "SpendingPace";
                    })(BudgetType || (BudgetType = {}));
                    {
                        EVEN = 'even';
                        ACCELERATED = 'accelerated';
                        FRONT_LOADED = 'front_loaded';
                        BACK_LOADED = 'back_loaded';
                        baseRate: number;
                        multipliers ?  : CostMultiplier;
                        value: number;
                        conditions ?  : Record;
                        alertType: 'email' | 'dashboard' | 'webhook';
                        recipients: string;
                        isActive: boolean;
                        triggered ?  : boolean;
                        lastTriggered ?  : Date;
                        ranking: number;
                        seasonality: number;
                        export let InsightCategory;
                        (function (InsightCategory) {
                            InsightCategory["PERFORMANCE"] = "performance";
                            InsightCategory["AUDIENCE"] = "audience";
                            InsightCategory["CONTENT"] = "content";
                            InsightCategory["TIMING"] = "timing";
                            InsightCategory["BUDGET"] = "budget";
                            InsightCategory["COMPETITION"] = "competition";
                            InsightCategory["TECHNICAL"] = "technical";
                            InsightCategory["CREATIVE"] = "creative";
                            InsightCategory[InsightCategory["export"] = void 0] = "export";
                            InsightCategory[InsightCategory["enum"] = void 0] = "enum";
                            InsightCategory[InsightCategory["InsightType"] = void 0] = "InsightType";
                        })(InsightCategory || (InsightCategory = {}));
                        {
                            ANOMALY = 'anomaly';
                            TREND = 'trend';
                            PATTERN = 'pattern';
                            OPPORTUNITY = 'opportunity';
                            RISK = 'risk';
                            OPTIMIZATION = 'optimization';
                            ALERT = 'alert';
                            export let InsightPriority;
                            (function (InsightPriority) {
                                InsightPriority["LOW"] = "low";
                                InsightPriority["MEDIUM"] = "medium";
                                InsightPriority["HIGH"] = "high";
                            })(InsightPriority || (InsightPriority = {}));
                            CRITICAL = 'critical';
                            data: any;
                            description: string;
                            export let ImpactLevel;
                            (function (ImpactLevel) {
                                ImpactLevel["LOW"] = "low";
                                ImpactLevel["MEDIUM"] = "medium";
                                ImpactLevel["HIGH"] = "high";
                                ImpactLevel["CRITICAL"] = "critical";
                                ImpactLevel[ImpactLevel["export"] = void 0] = "export";
                                ImpactLevel[ImpactLevel["interface"] = void 0] = "interface";
                                ImpactLevel[ImpactLevel["InsightRecommendation"] = void 0] = "InsightRecommendation";
                            })(ImpactLevel || (ImpactLevel = {}));
                            {
                                recommendationId: string;
                                action: string;
                                description: string;
                                expectedImpact: string;
                                effort: 'low' | 'medium' | 'high';
                            }
                            timeframe: string;
                            priority: number;
                            impactMeasured: number;
                            notes: string;
                            // ==========================================
                            // STATUS AND LIFECYCLE MANAGEMENT
                            // ==========================================
                            export let PromotionStatus;
                            (function (PromotionStatus) {
                                PromotionStatus["DRAFT"] = "draft";
                                PromotionStatus["PENDING_APPROVAL"] = "pending_approval";
                                PromotionStatus["APPROVED"] = "approved";
                                PromotionStatus["SCHEDULED"] = "scheduled";
                                PromotionStatus["ACTIVE"] = "active";
                                PromotionStatus["PAUSED"] = "paused";
                                PromotionStatus["COMPLETED"] = "completed";
                                PromotionStatus["CANCELLED"] = "cancelled";
                            })(PromotionStatus || (PromotionStatus = {}));
                            ARCHIVED = 'archived';
                            export let LifecycleStage;
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
                                LifecycleStage[LifecycleStage["export"] = void 0] = "export";
                                LifecycleStage[LifecycleStage["interface"] = void 0] = "interface";
                                LifecycleStage[LifecycleStage["LifecycleStageHistory"] = void 0] = "LifecycleStageHistory";
                            })(LifecycleStage || (LifecycleStage = {}));
                            {
                                stage: LifecycleStage;
                                enteredAt: Date;
                                exitedAt ?  : Date;
                                duration ?  : number; // minutes }
                                status: 'completed' | 'in_progress' | 'failed' | 'skipped';
                                notes ?  : string;
                                performedBy: string;
                                condition: string;
                                value ?  : any;
                                isMet: boolean;
                                timestamp: Date;
                                comments ?  : string;
                                conditions ?  : string;
                                accountId: string;
                                campaignSync: boolean;
                                bidSync: boolean;
                                audienceSync: boolean;
                                conversionSync: boolean;
                                apiCredentials: Record;
                                parameters: Record;
                                frequency: 'once' | 'session' | 'always';
                                conditions ?  : Record;
                                ;
                                performance ?  : { metric: string,
                                    threshold: number,
                                    operator: 'gt' | 'lt' | 'eq' };
                            }
                            ;
                            tags ?  : string;
                            createdBy ?  : string;
                            approvalStatus ?  : string;
                            direction: 'asc' | 'desc';
                            secondarySort ?  : PromotionSortOptions;
                            campaignIds: string;
                            parameters ?  : Record;
                            dryRun ?  : boolean;
                            usageCount: number;
                            averagePerformance: Record;
                            isPublic: boolean;
                            createdBy: string;
                            createdAt: Date;
                            // ==========================================
                            // DATA MODEL EXPORTS
                            // ==========================================
                            export type { // Core Entities
                            PromotionCampaign, PromotionContent, PromotionSchedule, RotationConfiguration, PromotionTargeting, PersonalizationRule, PromotionGoal, OptimizationSettings, ABTestConfiguration, PromotionBudget, ResourceAllocation, PromotionMetrics, ContentPromotionMetrics, PromotionInsight, PromotionLifecycle
                            // Configuration Objects
                            , 
                            // Configuration Objects
                            ContentSelectionCriteria, PromotionalBadge, TimeBasedRules, RecurrenceConfig, DynamicSchedulingRule, RotationTrigger, PerformanceThreshold, WeightingFactor, MachineLearningConfig, ABTestVariant, TrafficAllocation, CostModel, BidStrategy
                            // Analytics and Performance
                            , 
                            // Analytics and Performance
                            PerformanceComparison, GoalComparison, CompetitiveBenchmark, SegmentPerformance, SlotPerformance, TimePerformance, InsightFinding, InsightEvidence, InsightRecommendation
                            // Utility Types
                            , 
                            // Utility Types
                            PromotionFilterCriteria, PromotionSortOptions, PromotionBulkOperation, PromotionValidationError };
                            PromotionTemplate;
                        }
                        ;
                    }
                }
            }
        }
    }
}
