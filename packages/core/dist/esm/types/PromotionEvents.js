from;
'./PromotionInterfaces';
// =============================================================================
// Core Event Types and Enums
// =============================================================================
export var PromotionEventType;
(function (PromotionEventType) {
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
    PromotionEventType[PromotionEventType["export"] = void 0] = "export";
    PromotionEventType[PromotionEventType["enum"] = void 0] = "enum";
    PromotionEventType[PromotionEventType["EventPriority"] = void 0] = "EventPriority";
})(PromotionEventType || (PromotionEventType = {}));
{
    LOW = 'low',
        NORMAL = 'normal',
        HIGH = 'high',
        CRITICAL = 'critical',
        URGENT = 'urgent';
    export let EventDeliveryMethod;
    (function (EventDeliveryMethod) {
        EventDeliveryMethod["WEBHOOK"] = "webhook";
        EventDeliveryMethod["EMAIL"] = "email";
        EventDeliveryMethod["PUSH_NOTIFICATION"] = "push_notification";
        EventDeliveryMethod["SMS"] = "sms";
        EventDeliveryMethod["SLACK"] = "slack";
        EventDeliveryMethod["DISCORD"] = "discord";
        EventDeliveryMethod["INTERNAL_QUEUE"] = "internal_queue";
        EventDeliveryMethod["DATABASE"] = "database";
        // =============================================================================
        // Core Event Interfaces
        // =============================================================================
        /**
        * Base event structure for all promotion-related events
        */
        EventDeliveryMethod[EventDeliveryMethod["export"] = void 0] = "export";
        EventDeliveryMethod[EventDeliveryMethod["interface"] = void 0] = "interface";
        EventDeliveryMethod[EventDeliveryMethod["BasePromotionEvent"] = void 0] = "BasePromotionEvent";
    })(EventDeliveryMethod || (EventDeliveryMethod = {}));
    {
        event_id: string;
        event_type: PromotionEventType;
        timestamp: Date;
        source: EventSource;
        // Event data
        data: PromotionEventData;
        // Context information
        context: EventContext;
        // Event metadata
        priority: EventPriority;
        category: EventCategory;
        tags: string;
        // Delivery tracking
        delivery_attempts: number;
        last_delivery_attempt ?  : Date;
        successfully_delivered: boolean;
        // Event relationships
        correlation_id ?  : string; // Links related events;
        parent_event_id ?  : string; // For event chains;
        causation_id ?  : string; // What caused this event;
        // TTL and retention
        expires_at ?  : Date;
        retention_policy ?  : RetentionPolicy;
        // Metadata
        metadata: Record;
        version: string; // Event schema version }
            > ;
        // Usage tracking
        user_usage_count: number;
        total_promotion_usage: number;
        // Application method
        application_method: 'automatic' | 'code' | 'manual' | 'rule_triggered';
        // Success/failure information
        success: boolean;
        failure_reason ?  : string;
        validation_errors ?  : string;
            > ;
        // Launch/update specific data
        launch_configuration ?  : Record;
        configuration_changes ?  : Record;
        alert_severity: 'info' | 'warning' | 'error' | 'critical';
        alert_title: string;
        alert_description: string;
        // Alert specifics
        threshold_value ?  : number;
        current_value ?  : number;
        threshold_type ?  : 'absolute' | 'percentage' | 'rate';
        // Affected entities
        affected_promotions ?  : string;
        affected_users ?  : string;
        affected_campaigns ?  : string;
        // Recommended actions
        recommended_actions ?  : AlertAction;
        auto_actions_taken ?  : AlertAction;
        // Alert routing
        alert_routing_rules ?  : string;
        notification_channels ?  : EventDeliveryMethod;
        // Alert lifecycle
        alert_status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
        acknowledged_by ?  : string;
        acknowledged_at ?  : Date;
        resolution_details ?  : string;
        ordering_guarantee: boolean;
        // Subscription lifecycle
        created_at: Date;
        created_by: string;
        last_activity_at ?  : Date;
        expires_at ?  : Date;
        value: any;
        case_sensitive ?  : boolean;
        credentials: Record;
            > ;
        track_clicks: boolean;
            > ;
            > ;
        total_count: number;
        has_more: boolean;
        // =============================================================================
        // Export all event interfaces
        // =============================================================================
        export type { BasePromotionEvent, EventSource, EventContext, PromotionEventData, PromotionLifecycleEventData, PromotionUsageEventData, PromotionPerformanceEventData, ContentPromotionEventData, CampaignEventData, UserInteractionEventData, SystemEventData, AlertEventData, IPromotionEventHandler, IPromotionEventBus, IPromotionNotificationService, PromotionEventSubscription, NotificationRecipient };
        NotificationTemplate;
    }
    ;
    export { PromotionEventType, EventPriority };
    EventDeliveryMethod;
}
;
