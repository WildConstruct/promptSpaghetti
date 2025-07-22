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
})(PlacementArea || (PlacementArea = {}));
export var PlacementPosition;
(function (PlacementPosition) {
    PlacementPosition["HERO_BANNER"] = "hero_banner";
    PlacementPosition["TOP_CAROUSEL"] = "top_carousel";
    PlacementPosition["SIDEBAR_TOP"] = "sidebar_top";
    PlacementPosition["SIDEBAR_MIDDLE"] = "sidebar_middle";
    PlacementPosition["SIDEBAR_BOTTOM"] = "sidebar_bottom";
    PlacementPosition["CONTENT_TOP"] = "content_top";
    PlacementPosition["CONTENT_MIDDLE"] = "content_middle";
    PlacementPosition["CONTENT_BOTTOM"] = "content_bottom";
    PlacementPosition["FLOATING"] = "floating";
    PlacementPosition["INLINE"] = "inline";
    PlacementPosition["OVERLAY"] = "overlay";
})(PlacementPosition || (PlacementPosition = {}));
export var ContentType;
(function (ContentType) {
    ContentType["TEMPLATE"] = "template";
    ContentType["COLLECTION"] = "collection";
    ContentType["CATEGORY"] = "category";
    ContentType["PROMOTION"] = "promotion";
    ContentType["BANNER"] = "banner";
    ContentType["ANNOUNCEMENT"] = "announcement";
    ContentType["CUSTOM"] = "custom";
})(ContentType || (ContentType = {}));
export var PlacementStatus;
(function (PlacementStatus) {
    PlacementStatus["DRAFT"] = "draft";
    PlacementStatus["SCHEDULED"] = "scheduled";
    PlacementStatus["ACTIVE"] = "active";
    PlacementStatus["PAUSED"] = "paused";
    PlacementStatus["EXPIRED"] = "expired";
    PlacementStatus["ARCHIVED"] = "archived";
})(PlacementStatus || (PlacementStatus = {}));
export var PlacementApprovalStatus;
(function (PlacementApprovalStatus) {
    PlacementApprovalStatus["PENDING"] = "pending";
    PlacementApprovalStatus["APPROVED"] = "approved";
    PlacementApprovalStatus["REJECTED"] = "rejected";
    PlacementApprovalStatus["NEEDS_REVIEW"] = "needs_review";
})(PlacementApprovalStatus || (PlacementApprovalStatus = {}));
export var ScheduleType;
(function (ScheduleType) {
    ScheduleType["ONE_TIME"] = "one_time";
    ScheduleType["RECURRING"] = "recurring";
    ScheduleType["CONDITIONAL"] = "conditional";
    ScheduleType["EVENT_BASED"] = "event_based";
})(ScheduleType || (ScheduleType = {}));
export var CampaignObjective;
(function (CampaignObjective) {
    CampaignObjective["AWARENESS"] = "awareness";
    CampaignObjective["ENGAGEMENT"] = "engagement";
    CampaignObjective["CONVERSIONS"] = "conversions";
    CampaignObjective["REVENUE"] = "revenue";
    CampaignObjective["RETENTION"] = "retention";
})(CampaignObjective || (CampaignObjective = {}));
export var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "draft";
    CampaignStatus["SCHEDULED"] = "scheduled";
    CampaignStatus["RUNNING"] = "running";
    CampaignStatus["PAUSED"] = "paused";
    CampaignStatus["COMPLETED"] = "completed";
    CampaignStatus["CANCELLED"] = "cancelled";
})(CampaignStatus || (CampaignStatus = {}));
