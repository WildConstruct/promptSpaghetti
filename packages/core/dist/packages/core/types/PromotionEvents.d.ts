/**
 * Promotion Event Interfaces - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Event-driven system interfaces for promotion notifications,
 * workflow automation, and real-time updates.
 */
import { PromotionPerformanceMetrics } from './PromotionInterfaces';
export declare enum PromotionEventType {
    PROMOTION_CREATED = "promotion.created",
    PROMOTION_UPDATED = "promotion.updated",
    PROMOTION_ACTIVATED = "promotion.activated",
    PROMOTION_PAUSED = "promotion.paused",
    PROMOTION_CANCELLED = "promotion.cancelled",
    PROMOTION_EXPIRED = "promotion.expired",
    PROMOTION_DELETED = "promotion.deleted",
    PROMOTION_APPLIED = "promotion.applied",
    PROMOTION_REMOVED = "promotion.removed",
    PROMOTION_CODE_USED = "promotion.code_used",
    PROMOTION_USAGE_LIMIT_REACHED = "promotion.usage_limit_reached",
    PROMOTION_PERFORMANCE_MILESTONE = "promotion.performance_milestone",
    PROMOTION_LOW_PERFORMANCE = "promotion.low_performance",
    PROMOTION_HIGH_PERFORMANCE = "promotion.high_performance",
    PROMOTION_CONVERSION_SPIKE = "promotion.conversion_spike",
    CONTENT_PROMOTED = "content.promoted",
    CONTENT_UNPROMOTED = "content.unpromoted",
    CONTENT_PROMOTION_ROTATED = "content.promotion_rotated",
    CONTENT_PERFORMANCE_UPDATED = "content.performance_updated",
    CAMPAIGN_LAUNCHED = "campaign.launched",
    CAMPAIGN_BUDGET_UPDATED = "campaign.budget_updated",
    CAMPAIGN_BUDGET_EXHAUSTED = "campaign.budget_exhausted",
    CAMPAIGN_CHANNEL_PERFORMANCE = "campaign.channel_performance",
    USER_ELIGIBILITY_CHECKED = "user.eligibility_checked",
    USER_PROMOTION_VIEWED = "user.promotion_viewed",
    USER_PROMOTION_CLICKED = "user.promotion_clicked",
    USER_PROMOTION_IGNORED = "user.promotion_ignored",
    BULK_OPERATION_COMPLETED = "bulk_operation.completed",
    ANALYTICS_REPORT_GENERATED = "analytics.report_generated",
    RULE_TRIGGERED = "rule.triggered",
    TEMPLATE_USED = "template.used",
    FRAUD_ALERT = "alert.fraud",
    PERFORMANCE_ALERT = "alert.performance",
    BUDGET_ALERT = "alert.budget",
    EXPIRATION_ALERT = "alert.expiration",
    EXTERNAL_PROMOTION_SYNC = "external.promotion_sync",
    WEBHOOK_RECEIVED = "webhook.received",
    API_RATE_LIMIT_REACHED = "api.rate_limit_reached",
    export,
    enum,
    EventPriority
}
export interface PromotionPerformanceEventData {
    promotion_id: string;
    promotion_name: string;
    current_metrics: PromotionPerformanceMetrics;
    previous_metrics?: PromotionPerformanceMetrics;
    milestone_type?: 'usage_count' | 'revenue' | 'conversion_rate' | 'time_based';
    milestone_value?: number;
    milestone_threshold?: number;
    trend_direction: 'improving' | 'declining' | 'stable';
    trend_confidence: number;
    vs_previous_period?: PerformanceComparison;
    vs_similar_promotions?: PerformanceComparison;
    vs_target?: PerformanceComparison;
    alert_triggers?: string;
    recommendation_generated?: boolean;
}
export interface ContentPromotionEventData {
    promotion_id: string;
    content_id: string;
    content_title: string;
    placement_location: string;
    placement_position: number;
    display_start_time: Date;
    display_end_time?: Date;
    impressions: number;
    clicks: number;
    conversions: number;
    click_through_rate: number;
    rotation_reason?: 'scheduled' | 'performance' | 'manual';
    next_content_id?: string;
    ab_test_id?: string;
    variant_id?: string;
    test_group?: string;
}
export interface CampaignEventData {
    campaign_id: string;
    campaign_name: string;
    campaign_type: string;
    campaign_status: string;
    associated_promotions: string;
    total_budget_cents?: number;
    spent_to_date_cents?: number;
    daily_budget_cents?: number;
    budget_utilization_percentage?: number;
    channels_active?: string;
    channel_performance?: Array<{}, channel>;
    string: any;
    spend_cents: number;
    impressions: number;
    clicks: number;
    conversions: number;
}
export interface UserInteractionEventData {
    user_id: string;
    promotion_id: string;
    interaction_type: 'view' | 'click' | 'apply' | 'ignore' | 'share';
    interaction_location: string;
    interaction_context: string;
    device_type: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    session_id?: string;
    time_spent_seconds?: number;
    page_load_time_ms?: number;
    interaction_sequence?: number;
    was_eligible: boolean;
    eligibility_reasons?: string;
    qualification_score?: number;
    previous_interactions?: string;
    conversion_probability?: number;
    personalization_score?: number;
}
export interface SystemEventData {
    operation_type: string;
    bulk_operation_id?: string;
    items_processed?: number;
    items_successful?: number;
    items_failed?: number;
    processing_time_ms?: number;
    report_type?: string;
    report_id?: string;
    report_parameters?: Record<string, any>;
    generation_time_ms?: number;
    rule_id?: string;
    rule_name?: string;
    rule_conditions?: Record<string, any>;
    rule_actions?: Record<string, any>;
    execution_result?: 'success' | 'failure' | 'partial';
    template_id?: string;
    template_name?: string;
    customizations_applied?: Record<string, any>;
    system_component?: string;
    health_status?: 'healthy' | 'warning' | 'error';
    error_details?: Record<string, any>;
}
export interface AlertEventData {
    alert_type: 'fraud' | 'performance' | 'budget' | 'expiration' | 'system';
    alert_severity: 'info' | 'warning' | 'error' | 'critical';
    alert_title: string;
    alert_description: string;
    threshold_value?: number;
    current_value?: number;
    threshold_type?: 'absolute' | 'percentage' | 'rate';
    affected_promotions?: string;
    affected_users?: string;
    affected_campaigns?: string;
    recommended_actions?: AlertAction;
    auto_actions_taken?: AlertAction;
    alert_routing_rules?: string;
    notification_channels?: EventDeliveryMethod;
    alert_status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
    acknowledged_by?: string;
    acknowledged_at?: Date;
    resolution_details?: string;
}
export interface AlertAction {
    action_type: string;
    action_description: string;
    action_parameters: Record<string, any>;
    auto_executable: boolean;
    priority: number;
}
export interface PerformanceComparison {
    metric_name: string;
    current_value: number;
    comparison_value: number;
    percentage_change: number;
    is_improvement: boolean;
    statistical_significance?: number;
}
export interface ValidationResult {
    field: string;
    is_valid: boolean;
    error_message?: string;
    warning_message?: string;
}
export interface IPromotionEventHandler {
    /**
    * Handle a promotion event
    */
    handleEvent(event: BasePromotionEvent): Promise<EventHandlingResult>;
    /**
    * Get supported event types
    */
    getSupportedEventTypes(): PromotionEventType;
    /**
    * Get handler configuration
    */
    getHandlerConfig(): EventHandlerConfig;
}
export interface EventHandlingResult {
    success: boolean;
    processing_time_ms: number;
    actions_taken?: string;
    errors?: string;
    retry_recommended?: boolean;
    next_retry_delay_ms?: number;
}
export interface EventHandlerConfig {
    handler_id: string;
    handler_name: string;
    description: string;
    supported_events: PromotionEventType;
    retry_policy: EventRetryPolicy;
    timeout_ms: number;
    batch_processing_enabled: boolean;
    max_batch_size?: number;
}
export interface EventRetryPolicy {
    max_retries: number;
    base_delay_ms: number;
    exponential_backoff: boolean;
    jitter_enabled: boolean;
    circuit_breaker_enabled: boolean;
}
export interface IPromotionEventBus {
    /**
    * Publish an event to the event bus
    */
    publishEvent(event: BasePromotionEvent): Promise<PublishResult>;
    /**
    * Publish multiple events in batch
    */
    publishBatch(events: BasePromotionEvent): Promise<BatchPublishResult>;
    /**
    * Subscribe to events
    */
    subscribe(subscription: PromotionEventSubscription): Promise<SubscriptionResult>;
    /**
    * Unsubscribe from events
    */
    unsubscribe(subscriptionId: string): Promise<void>;
    /**
    * Get event history
    */
    getEventHistory(criteria: EventHistoryCriteria): Promise<EventHistoryResult>;
}
export interface PublishResult {
    success: boolean;
    event_id: string;
    publish_timestamp: Date;
    delivery_promises: DeliveryPromise;
    error?: string;
}
export interface BatchPublishResult {
    total_events: number;
    successful_events: number;
    failed_events: number;
    results: PublishResult;
    batch_id: string;
}
export interface PromotionEventSubscription {
    subscription_id: string;
    subscriber_id: string;
    subscriber_name: string;
    event_types: PromotionEventType;
    filters: EventFilter;
    delivery_method: EventDeliveryMethod;
    delivery_config: EventDeliveryConfig;
    enabled: boolean;
    priority: EventPriority;
    batch_delivery: boolean;
    batch_size?: number;
    batch_timeout_ms?: number;
    delivery_guarantee: 'at_least_once' | 'at_most_once' | 'exactly_once';
    ordering_guarantee: boolean;
    created_at: Date;
    created_by: string;
    last_activity_at?: Date;
    expires_at?: Date;
}
export interface EventFilter {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'exists';
    value: any;
    case_sensitive?: boolean;
}
export interface EventDeliveryConfig {
    webhook_url?: string;
    webhook_headers?: Record<string, string>;
    webhook_authentication?: WebhookAuth;
    email_addresses?: string;
    email_template?: string;
    push_tokens?: string;
    push_payload_template?: Record<string, any>;
    slack_webhook_url?: string;
    slack_channel?: string;
    slack_message_template?: string;
    phone_numbers?: string;
    sms_template?: string;
    queue_name?: string;
    queue_partition_key?: string;
    table_name?: string;
    storage_format?: 'json' | 'avro' | 'parquet';
}
export interface WebhookAuth {
    type: 'none' | 'bearer_token' | 'api_key' | 'basic_auth' | 'oauth2';
    credentials: Record<string, string>;
}
export interface SubscriptionResult {
    success: boolean;
    subscription_id: string;
    active: boolean;
    error?: string;
}
export interface DeliveryPromise {
    delivery_method: EventDeliveryMethod;
    estimated_delivery_time: Date;
    tracking_id: string;
}
export interface EventHistoryCriteria {
    start_date?: Date;
    end_date?: Date;
    event_types?: PromotionEventType;
    event_categories?: EventCategory;
    priorities?: EventPriority;
    promotion_ids?: string;
    user_ids?: string;
    campaign_ids?: string;
    correlation_ids?: string;
    source_services?: string;
    limit?: number;
    offset?: number;
    sort_by?: 'timestamp' | 'priority' | 'event_type';
    sort_order?: 'asc' | 'desc';
    include_event_data?: boolean;
    include_context?: boolean;
    include_metadata?: boolean;
}
export interface EventHistoryResult {
    events: BasePromotionEvent;
    total_count: number;
    has_more: boolean;
    aggregations: EventAggregation;
}
export interface EventAggregation {
    field: string;
    buckets: Array<{}, key>;
    string: any;
    count: number;
}
export interface IPromotionNotificationService {
    /**
    * Send notification based on event
    */
    sendNotification(event: BasePromotionEvent, recipients: NotificationRecipient): Promise<NotificationResult>;
    /**
    * Send batch notifications
    */
    sendBatchNotifications(notifications: NotificationRequest): Promise<BatchNotificationResult>;
    /**
    * Get notification templates
    */
    getNotificationTemplates(eventType: PromotionEventType): Promise<NotificationTemplate>;
    /**
    * Create custom notification template
    */
    createNotificationTemplate(template: CreateNotificationTemplateRequest): Promise<NotificationTemplate>;
    /**
    * Get notification history
    */
    getNotificationHistory(criteria: NotificationHistoryCriteria): Promise<NotificationHistoryResult>;
}
export interface NotificationRecipient {
    type: 'user' | 'admin' | 'role' | 'team' | 'external';
    identifier: string;
    delivery_preferences: NotificationDeliveryPreference;
    personalization_data?: Record<string, any>;
}
export interface NotificationDeliveryPreference {
    method: EventDeliveryMethod;
    enabled: boolean;
    priority_threshold?: EventPriority;
    quiet_hours?: QuietHours;
    frequency_limit?: FrequencyLimit;
}
export interface QuietHours {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
    days_of_week?: number;
}
export interface FrequencyLimit {
    max_notifications_per_hour?: number;
    max_notifications_per_day?: number;
    cooldown_minutes?: number;
}
export interface NotificationRequest {
    event: BasePromotionEvent;
    recipients: NotificationRecipient;
    template_id?: string;
    custom_content?: NotificationContent;
    delivery_options?: NotificationDeliveryOptions;
}
export interface NotificationContent {
    subject: string;
    body: string;
    html_body?: string;
    action_buttons?: ActionButton;
    attachments?: NotificationAttachment;
}
export interface ActionButton {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'danger';
    track_clicks: boolean;
}
export interface NotificationAttachment {
    filename: string;
    content_type: string;
    content: string;
    size_bytes: number;
}
export interface NotificationDeliveryOptions {
    priority: EventPriority;
    send_immediately: boolean;
    scheduled_send_time?: Date;
    expiry_time?: Date;
    track_opens: boolean;
    track_clicks: boolean;
}
export interface NotificationResult {
    success: boolean;
    notification_id: string;
    delivery_results: Array<{}, recipient>;
    NotificationRecipient: any;
    method: EventDeliveryMethod;
    success: boolean;
    error?: string;
    delivered_at?: Date;
}
export interface BatchNotificationResult {
    total_notifications: number;
    successful_notifications: number;
    failed_notifications: number;
    results: NotificationResult;
    batch_id: string;
}
export interface NotificationTemplate {
    id: string;
    name: string;
    description: string;
    event_type: PromotionEventType;
    subject_template: string;
    body_template: string;
    html_template?: string;
    supported_methods: EventDeliveryMethod;
    personalization_fields: string;
    localization_supported: boolean;
    created_at: Date;
    created_by: string;
    version: string;
    usage_count: number;
}
export interface CreateNotificationTemplateRequest {
    name: string;
    description: string;
    event_type: PromotionEventType;
    subject_template: string;
    body_template: string;
    html_template?: string;
    supported_methods: EventDeliveryMethod;
    created_by: string;
}
export interface NotificationHistoryCriteria {
    start_date?: Date;
    end_date?: Date;
    recipient_id?: string;
    event_types?: PromotionEventType;
    delivery_methods?: EventDeliveryMethod;
    success_status?: boolean;
    limit?: number;
    offset?: number;
}
export interface NotificationHistoryResult {
    notifications: Array<{}, notification_id>;
    string: any;
    event_id: string;
    event_type: PromotionEventType;
    recipient: NotificationRecipient;
    delivery_method: EventDeliveryMethod;
    success: boolean;
    sent_at: Date;
    delivered_at?: Date;
    opened_at?: Date;
    clicked_at?: Date;
    error?: string;
}
export type { BasePromotionEvent, EventSource, EventContext, PromotionEventData, PromotionLifecycleEventData, PromotionUsageEventData, PromotionPerformanceEventData, ContentPromotionEventData, CampaignEventData, UserInteractionEventData, SystemEventData, AlertEventData, IPromotionEventHandler, IPromotionEventBus, IPromotionNotificationService, PromotionEventSubscription, NotificationRecipient, NotificationTemplate };
export { PromotionEventType, EventPriority, EventDeliveryMethod };
//# sourceMappingURL=PromotionEvents.d.ts.map