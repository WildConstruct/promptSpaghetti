/**
 * Placement Management Types - Epic 17.5.2
 *
 * Type definitions for marketplace content placement and featured content management.
 * Enables admin control over content positioning, scheduling, and performance tracking.
 *
 * Task: E17-1753114397326-68B279 - Develop placement management
 * Epic: 17 - Backstage Admin Controls
 */
export var PlacementArea;
(function (PlacementArea) {
    PlacementArea["HOMEPAGE"] = "homepage";
    PlacementArea["CATEGORY_PAGE"] = "category_page";
    PlacementArea["SEARCH_RESULTS"] = "search_results";
    PlacementArea["TEMPLATE_DETAIL"] = "template_detail";
    PlacementArea["USER_DASHBOARD"] = "user_dashboard";
    PlacementArea["CHECKOUT"] = "checkout";
    PlacementArea["SIDEBAR"] = "sidebar";
    PlacementArea["HEADER"] = "header";
    PlacementArea["FOOTER"] = "footer";
    PlacementArea["MODAL"] = "modal";
    PlacementArea[PlacementArea["export"] = void 0] = "export";
    PlacementArea[PlacementArea["enum"] = void 0] = "enum";
    PlacementArea[PlacementArea["PlacementPosition"] = void 0] = "PlacementPosition";
})(PlacementArea || (PlacementArea = {}));
{
    HERO_BANNER = 'hero_banner',
        TOP_CAROUSEL = 'top_carousel',
        SIDEBAR_TOP = 'sidebar_top',
        SIDEBAR_MIDDLE = 'sidebar_middle',
        SIDEBAR_BOTTOM = 'sidebar_bottom',
        CONTENT_TOP = 'content_top',
        CONTENT_MIDDLE = 'content_middle',
        CONTENT_BOTTOM = 'content_bottom',
        FLOATING = 'floating',
        INLINE = 'inline',
        OVERLAY = 'overlay';
    ;
    ;
    animation ?  : PlacementAnimation;
    customCss ?  : string;
    duration: number;
    delay ?  : number;
    easing ?  : string;
    ;
    deviceTargeting ?  : { deviceTypes: ('desktop' | 'mobile' | 'tablet')[],
        browsers: string,
        operatingSystems: string };
    behaviorTargeting ?  : { previousPurchases: boolean,
        activityLevel: 'low' | 'medium' | 'high',
        interests: string,
        searchHistory: string };
    timeTargeting ?  : { timeZones: string,
        hoursOfDay: number,
        daysOfWeek: number,
        dateRange: {},
        start: Date,
        end: Date
    };
}
;
export var ContentType;
(function (ContentType) {
    ContentType["TEMPLATE"] = "template";
    ContentType["COLLECTION"] = "collection";
    ContentType["CATEGORY"] = "category";
    ContentType["PROMOTION"] = "promotion";
    ContentType["BANNER"] = "banner";
    ContentType["ANNOUNCEMENT"] = "announcement";
    ContentType["CUSTOM"] = "custom";
    ContentType[ContentType["export"] = void 0] = "export";
    ContentType[ContentType["enum"] = void 0] = "enum";
    ContentType[ContentType["PlacementStatus"] = void 0] = "PlacementStatus";
})(ContentType || (ContentType = {}));
{
    DRAFT = 'draft',
        SCHEDULED = 'scheduled',
        ACTIVE = 'active',
        PAUSED = 'paused',
        EXPIRED = 'expired',
        ARCHIVED = 'archived';
    export let PlacementApprovalStatus;
    (function (PlacementApprovalStatus) {
        PlacementApprovalStatus["PENDING"] = "pending";
        PlacementApprovalStatus["APPROVED"] = "approved";
        PlacementApprovalStatus["REJECTED"] = "rejected";
    })(PlacementApprovalStatus || (PlacementApprovalStatus = {}));
    NEEDS_REVIEW = 'needs_review';
    export let ScheduleType;
    (function (ScheduleType) {
        ScheduleType["ONE_TIME"] = "one_time";
        ScheduleType["RECURRING"] = "recurring";
        ScheduleType["CONDITIONAL"] = "conditional";
        ScheduleType["EVENT_BASED"] = "event_based";
        ScheduleType[ScheduleType["export"] = void 0] = "export";
        ScheduleType[ScheduleType["interface"] = void 0] = "interface";
        ScheduleType[ScheduleType["SchedulePattern"] = void 0] = "SchedulePattern";
    })(ScheduleType || (ScheduleType = {}));
    {
        frequency ?  : 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval ?  : number;
        specificTimes ?  : string; // ["09:00", "12:00", "18:00"];
        specificDays ?  : number; // [1, 3, 5] for Mon, Wed, Fri }
        specificDates ?  : Date;
        export let CampaignObjective;
        (function (CampaignObjective) {
            CampaignObjective["AWARENESS"] = "awareness";
            CampaignObjective["ENGAGEMENT"] = "engagement";
            CampaignObjective["CONVERSIONS"] = "conversions";
            CampaignObjective["REVENUE"] = "revenue";
            CampaignObjective["RETENTION"] = "retention";
            CampaignObjective[CampaignObjective["export"] = void 0] = "export";
            CampaignObjective[CampaignObjective["interface"] = void 0] = "interface";
            CampaignObjective[CampaignObjective["CampaignBudget"] = void 0] = "CampaignBudget";
        })(CampaignObjective || (CampaignObjective = {}));
        {
            totalBudget ?  : number;
            dailyBudget ?  : number;
            currency: string;
            spendingPace: 'even' | 'accelerated';
        }
        export let CampaignStatus;
        (function (CampaignStatus) {
            CampaignStatus["DRAFT"] = "draft";
            CampaignStatus["SCHEDULED"] = "scheduled";
            CampaignStatus["RUNNING"] = "running";
            CampaignStatus["PAUSED"] = "paused";
            CampaignStatus["COMPLETED"] = "completed";
            CampaignStatus["CANCELLED"] = "cancelled";
            CampaignStatus[CampaignStatus["export"] = void 0] = "export";
            CampaignStatus[CampaignStatus["interface"] = void 0] = "interface";
            CampaignStatus[CampaignStatus["PlacementSlotMetrics"] = void 0] = "PlacementSlotMetrics";
        })(CampaignStatus || (CampaignStatus = {}));
        {
            slotId: string;
            period: MetricsPeriod;
            // Visibility Metrics
            impressions: number;
            uniqueViews: number;
            viewDuration: number; // seconds;
            viewabilityRate: number; // percentage;
            // Engagement Metrics
            clicks: number;
            clickThroughRate: number;
            interactionRate: number;
            bounceRate: number;
            // Performance Metrics
            conversions: number;
            conversionRate: number;
            revenue: number;
            revenuePerView: number;
            // Quality Metrics
            loadTime: number; // milliseconds;
            errorRate: number;
            // Comparative Metrics
            performanceIndex: number; // vs baseline;
            competitiveIndex ?  : number; // vs other slots }
                > ;
            // Budget Utilization
            budgetSpent ?  : number;
            budgetRemaining ?  : number;
            paceToGoal ?  : number;
            ;
            // Top Performers
            topSlots: PlacementSlotMetrics;
            topPlacements: ContentPlacementMetrics;
            topCampaigns: CampaignMetrics;
            // Insights and Recommendations
            insights: PlacementInsight;
            recommendations: PlacementRecommendation;
            generatedAt: Date;
            ;
            // Rendered Output
            renderedContent: RenderedPlacement;
            // Performance Simulation
            estimatedMetrics ?  : { expectedCTR: number,
                expectedConversions: number,
                expectedRevenue: number,
                confidence: number };
            createdAt: Date;
            expiresAt: Date;
            ;
            styling: PlacementStyling;
            metadata: Record;
            ;
            performanceThreshold ?  : { metric: string,
                operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte',
                value: number };
            createdBy ?  : string;
                > ;
            // Metadata
            createdAt: Date;
            completedAt ?  : Date;
            initiatedBy: string;
            defaultPlacements: Array;
            // Usage and Application
            category: string;
            useCase: string;
            isPublic: boolean;
            // Performance Data
            usageCount: number;
            averagePerformance ?  : PlacementSlotMetrics;
            // Metadata
            createdAt: Date;
            updatedAt: Date;
            createdBy: string;
            version: string;
            tags: string;
                > ;
            // Context
            userId: string;
            userRole: string;
            ipAddress ?  : string;
            userAgent ?  : string;
            // Metadata
            timestamp: Date;
            reason ?  : string;
            additionalData ?  : Record;
        }
    }
}
