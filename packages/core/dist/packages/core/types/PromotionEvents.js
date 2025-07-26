/**
 * Promotion Event Interfaces - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Event-driven system interfaces for promotion notifications,
 * workflow automation, and real-time updates.
 */
// =============================================================================
// Core Event Types and Enums
// =============================================================================
export var PromotionEventType;
(function (PromotionEventType) {
    // Lifecycle events
    PromotionEventType["PROMOTION_CREATED"] = "promotion.created";
    PromotionEventType["PROMOTION_UPDATED"] = "promotion.updated";
    PromotionEventType["PROMOTION_ACTIVATED"] = "promotion.activated";
    PromotionEventType["PROMOTION_PAUSED"] = "promotion.paused";
    PromotionEventType["PROMOTION_CANCELLED"] = "promotion.cancelled";
    PromotionEventType["PROMOTION_EXPIRED"] = "promotion.expired";
    PromotionEventType["PROMOTION_DELETED"] = "promotion.deleted";
    // Usage events
    PromotionEventType["PROMOTION_APPLIED"] = "promotion.applied";
    PromotionEventType["PROMOTION_REMOVED"] = "promotion.removed";
    PromotionEventType["PROMOTION_CODE_USED"] = "promotion.code_used";
    PromotionEventType["PROMOTION_USAGE_LIMIT_REACHED"] = "promotion.usage_limit_reached";
    // Performance events
    PromotionEventType["PROMOTION_PERFORMANCE_MILESTONE"] = "promotion.performance_milestone";
    PromotionEventType["PROMOTION_LOW_PERFORMANCE"] = "promotion.low_performance";
    PromotionEventType["PROMOTION_HIGH_PERFORMANCE"] = "promotion.high_performance";
    PromotionEventType["PROMOTION_CONVERSION_SPIKE"] = "promotion.conversion_spike";
    // Content promotion events
    PromotionEventType["CONTENT_PROMOTED"] = "content.promoted";
    PromotionEventType["CONTENT_UNPROMOTED"] = "content.unpromoted";
    PromotionEventType["CONTENT_PROMOTION_ROTATED"] = "content.promotion_rotated";
    PromotionEventType["CONTENT_PERFORMANCE_UPDATED"] = "content.performance_updated";
    // Campaign events
    PromotionEventType["CAMPAIGN_LAUNCHED"] = "campaign.launched";
    PromotionEventType["CAMPAIGN_BUDGET_UPDATED"] = "campaign.budget_updated";
    PromotionEventType["CAMPAIGN_BUDGET_EXHAUSTED"] = "campaign.budget_exhausted";
    PromotionEventType["CAMPAIGN_CHANNEL_PERFORMANCE"] = "campaign.channel_performance";
    // User interaction events
    PromotionEventType["USER_ELIGIBILITY_CHECKED"] = "user.eligibility_checked";
    PromotionEventType["USER_PROMOTION_VIEWED"] = "user.promotion_viewed";
    PromotionEventType["USER_PROMOTION_CLICKED"] = "user.promotion_clicked";
    PromotionEventType["USER_PROMOTION_IGNORED"] = "user.promotion_ignored";
    // System events
    PromotionEventType["BULK_OPERATION_COMPLETED"] = "bulk_operation.completed";
    PromotionEventType["ANALYTICS_REPORT_GENERATED"] = "analytics.report_generated";
    PromotionEventType["RULE_TRIGGERED"] = "rule.triggered";
    PromotionEventType["TEMPLATE_USED"] = "template.used";
    // Alert events
    PromotionEventType["FRAUD_ALERT"] = "alert.fraud";
    PromotionEventType["PERFORMANCE_ALERT"] = "alert.performance";
    PromotionEventType["BUDGET_ALERT"] = "alert.budget";
    PromotionEventType["EXPIRATION_ALERT"] = "alert.expiration";
    // Integration events
    PromotionEventType["EXTERNAL_PROMOTION_SYNC"] = "external.promotion_sync";
    PromotionEventType["WEBHOOK_RECEIVED"] = "webhook.received";
    PromotionEventType["API_RATE_LIMIT_REACHED"] = "api.rate_limit_reached";
})(PromotionEventType || (PromotionEventType = {}));
export var EventPriority;
(function (EventPriority) {
    EventPriority["LOW"] = "low";
    EventPriority["NORMAL"] = "normal";
    EventPriority["HIGH"] = "high";
    EventPriority["CRITICAL"] = "critical";
    EventPriority["URGENT"] = "urgent";
})(EventPriority || (EventPriority = {}));
export var EventDeliveryMethod;
(function (EventDeliveryMethod) {
    EventDeliveryMethod["WEBHOOK"] = "webhook";
    EventDeliveryMethod["EMAIL"] = "email";
    EventDeliveryMethod["PUSH_NOTIFICATION"] = "push_notification";
    EventDeliveryMethod["SMS"] = "sms";
    EventDeliveryMethod["SLACK"] = "slack";
    EventDeliveryMethod["DISCORD"] = "discord";
    EventDeliveryMethod["INTERNAL_QUEUE"] = "internal_queue";
    EventDeliveryMethod["DATABASE"] = "database";
})(EventDeliveryMethod || (EventDeliveryMethod = {}));
