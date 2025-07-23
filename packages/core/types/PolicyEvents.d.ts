/**
 * Policy Events and Notifications - Epic 17 Implementation
 * Task: E17-1753114397367-674DF3 - Design policy interfaces
 *
 * Event-driven policy system interfaces for real-time notifications,
 * workflow automation, and system integration.
 */
import { BasePolicy, PolicyAssignment, PolicyEvaluation, EvaluationContext, ComplianceFramework } from './PolicyInterfaces';
/**
 * Base policy event interface
 */
export interface BasePolicyEvent {
    readonly eventId: string;
    readonly eventType: PolicyEventType;
    readonly timestamp: Date;
    readonly source: EventSource;
    userId?: string;
    organizationId?: string;
    sessionId?: string;
    data: PolicyEventData;
    correlationId?: string;
    causationId?: string;
    version: string;
    processed: boolean;
    processedAt?: Date;
    processingErrors?: EventProcessingError[];
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
}
export type PolicyEventType = 'policy.created' | 'policy.updated' | 'policy.deleted' | 'policy.activated' | 'policy.deactivated' | 'policy.deprecated' | 'policy.archived' | 'policy.version.created' | 'policy.validation.completed' | 'policy.test.completed' | 'assignment.created' | 'assignment.updated' | 'assignment.deleted' | 'assignment.activated' | 'assignment.deactivated' | 'assignment.conflict.detected' | 'assignment.conflict.resolved' | 'evaluation.requested' | 'evaluation.completed' | 'evaluation.failed' | 'evaluation.cached' | 'evaluation.cache.expired' | 'compliance.violation.detected' | 'compliance.violation.resolved' | 'compliance.audit.started' | 'compliance.audit.completed' | 'compliance.report.generated' | 'security.policy.breached' | 'security.unauthorized.access' | 'security.suspicious.activity' | 'security.threat.detected' | 'system.performance.degraded' | 'system.error.occurred' | 'system.maintenance.started' | 'system.maintenance.completed' | 'workflow.started' | 'workflow.completed' | 'workflow.failed' | 'workflow.step.completed' | 'integration.sync.started' | 'integration.sync.completed' | 'integration.sync.failed' | 'integration.webhook.triggered';
export type EventSource = 'policy_service' | 'evaluation_service' | 'assignment_service' | 'analytics_service' | 'compliance_service' | 'template_service' | 'import_export_service' | 'workflow_engine' | 'external_system' | 'user_action' | 'scheduled_task';
export interface PolicyEventData {
    resourceType: 'policy' | 'assignment' | 'evaluation' | 'template' | 'workflow';
    resourceId: string;
    resourceVersion?: string;
    changes?: PolicyEventChange[];
    previousState?: any;
    currentState?: any;
    context?: EvaluationContext;
    metadata?: Record<string, any>;
}
export interface PolicyEventChange {
    field: string;
    oldValue: any;
    newValue: any;
    changeType: 'added' | 'modified' | 'removed';
}
export interface EventProcessingError {
    errorId: string;
    timestamp: Date;
    message: string;
    details?: any;
    retryable: boolean;
}
/**
 * Policy lifecycle event
 */
export interface PolicyLifecycleEvent extends BasePolicyEvent {
    eventType: 'policy.created' | 'policy.updated' | 'policy.deleted' | 'policy.activated' | 'policy.deactivated' | 'policy.deprecated' | 'policy.archived';
    data: PolicyLifecycleEventData;
}
export interface PolicyLifecycleEventData extends PolicyEventData {
    resourceType: 'policy';
    policy: BasePolicy;
    previousPolicy?: BasePolicy;
    reason?: string;
    replacementPolicyId?: string;
}
/**
 * Assignment event
 */
export interface PolicyAssignmentEvent extends BasePolicyEvent {
    eventType: 'assignment.created' | 'assignment.updated' | 'assignment.deleted' | 'assignment.activated' | 'assignment.deactivated' | 'assignment.conflict.detected' | 'assignment.conflict.resolved';
    data: PolicyAssignmentEventData;
}
export interface PolicyAssignmentEventData extends PolicyEventData {
    resourceType: 'assignment';
    assignment: PolicyAssignment;
    previousAssignment?: PolicyAssignment;
    conflicts?: AssignmentConflict[];
    resolution?: ConflictResolution;
}
export interface AssignmentConflict {
    conflictType: 'priority' | 'contradiction' | 'circular_dependency';
    conflictingAssignments: string[];
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface ConflictResolution {
    strategy: string;
    resolvedBy: string;
    resolvedAt: Date;
    resultingAssignments: string[];
    notes?: string;
}
/**
 * Evaluation event
 */
export interface PolicyEvaluationEvent extends BasePolicyEvent {
    eventType: 'evaluation.requested' | 'evaluation.completed' | 'evaluation.failed' | 'evaluation.cached' | 'evaluation.cache.expired';
    data: PolicyEvaluationEventData;
}
export interface PolicyEvaluationEventData extends PolicyEventData {
    resourceType: 'evaluation';
    evaluation: PolicyEvaluation;
    requestContext: EvaluationContext;
    performance: EvaluationPerformance;
    cacheInfo?: CacheInfo;
}
export interface EvaluationPerformance {
    evaluationTime: number;
    policiesEvaluated: number;
    cacheHits: number;
    cacheMisses: number;
    rulesProcessed: number;
}
export interface CacheInfo {
    cacheKey: string;
    cacheHit: boolean;
    cacheExpiration?: Date;
    cacheSize?: number;
}
/**
 * Compliance event
 */
export interface ComplianceEvent extends BasePolicyEvent {
    eventType: 'compliance.violation.detected' | 'compliance.violation.resolved' | 'compliance.audit.started' | 'compliance.audit.completed' | 'compliance.report.generated';
    data: ComplianceEventData;
}
export interface ComplianceEventData extends PolicyEventData {
    framework: ComplianceFramework;
    violationType?: string;
    violationSeverity?: 'low' | 'medium' | 'high' | 'critical';
    affectedPolicies: string[];
    remediationRequired?: boolean;
    auditId?: string;
    reportId?: string;
}
/**
 * Security event
 */
export interface SecurityEvent extends BasePolicyEvent {
    eventType: 'security.policy.breached' | 'security.unauthorized.access' | 'security.suspicious.activity' | 'security.threat.detected';
    data: SecurityEventData;
}
export interface SecurityEventData extends PolicyEventData {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    threatType: string;
    sourceIp?: string;
    userAgent?: string;
    affectedResources: string[];
    mitigationActions?: string[];
    investigationRequired: boolean;
}
/**
 * Event handler interface
 */
export interface IPolicyEventHandler {
    readonly handlerId: string;
    readonly name: string;
    readonly eventTypes: PolicyEventType[];
    readonly priority: number;
    canHandle(event: BasePolicyEvent): boolean;
    handle(event: BasePolicyEvent): Promise<EventHandlerResult>;
    onError(event: BasePolicyEvent, error: Error): Promise<void>;
}
export interface EventHandlerResult {
    success: boolean;
    executionTime: number;
    processedData?: any;
    generatedEvents?: BasePolicyEvent[];
    errors?: EventProcessingError[];
    metadata?: Record<string, any>;
}
/**
 * Event subscription interface
 */
export interface PolicyEventSubscription {
    subscriptionId: string;
    subscriberId: string;
    subscriberName: string;
    eventTypes: PolicyEventType[];
    filters: EventFilter[];
    deliveryMethod: DeliveryMethod;
    deliveryConfig: DeliveryConfiguration;
    batchSize: number;
    batchTimeout: number;
    retryPolicy: RetryPolicy;
    active: boolean;
    createdAt: Date;
    lastDeliveryAt?: Date;
    deliveryStats: DeliveryStats;
}
export interface EventFilter {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'regex';
    value: any;
    caseSensitive?: boolean;
}
export type DeliveryMethod = 'webhook' | 'queue' | 'email' | 'sms' | 'push' | 'database' | 'log';
export interface DeliveryConfiguration {
    webhookUrl?: string;
    webhookHeaders?: Record<string, string>;
    webhookTimeout?: number;
    queueName?: string;
    queuePriority?: number;
    emailAddresses?: string[];
    emailTemplate?: string;
    phoneNumbers?: string[];
    smsTemplate?: string;
    pushTokens?: string[];
    pushTemplate?: string;
    databaseTable?: string;
    databaseFields?: Record<string, string>;
}
export interface RetryPolicy {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
    maxDelay: number;
    retryConditions: RetryCondition[];
}
export interface RetryCondition {
    errorType: string;
    errorPattern?: string;
    shouldRetry: boolean;
}
export interface DeliveryStats {
    totalEvents: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageDeliveryTime: number;
    lastError?: EventProcessingError;
}
/**
 * Event publisher interface
 */
export interface IPolicyEventPublisher {
    publish(event: BasePolicyEvent): Promise<PublishResult>;
    publishBatch(events: BasePolicyEvent[]): Promise<BatchPublishResult>;
    scheduleEvent(event: BasePolicyEvent, scheduledTime: Date): Promise<ScheduledEventResult>;
    cancelScheduledEvent(eventId: string): Promise<void>;
    validateEvent(event: BasePolicyEvent): Promise<EventValidationResult>;
}
export interface PublishResult {
    success: boolean;
    eventId: string;
    publishedAt: Date;
    deliveryCount: number;
    errors?: PublishError[];
}
export interface BatchPublishResult {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    results: PublishResult[];
}
export interface ScheduledEventResult {
    scheduleId: string;
    eventId: string;
    scheduledTime: Date;
    status: 'scheduled' | 'cancelled' | 'executed';
}
export interface PublishError {
    subscriberId: string;
    error: string;
    retryable: boolean;
}
export interface EventValidationResult {
    valid: boolean;
    errors: EventValidationError[];
    warnings: EventValidationWarning[];
}
export interface EventValidationError {
    field: string;
    message: string;
    code: string;
}
export interface EventValidationWarning {
    field: string;
    message: string;
    code: string;
}
/**
 * Event bus interface
 */
export interface IPolicyEventBus {
    emit(event: BasePolicyEvent): Promise<void>;
    emitBatch(events: BasePolicyEvent[]): Promise<void>;
    subscribe(subscription: PolicyEventSubscription): Promise<string>;
    unsubscribe(subscriptionId: string): Promise<void>;
    updateSubscription(subscriptionId: string, updates: Partial<PolicyEventSubscription>): Promise<void>;
    getSubscriptions(subscriberId?: string): Promise<PolicyEventSubscription[]>;
    getEventHistory(criteria: EventHistoryCriteria): Promise<EventHistoryResult>;
    replayEvents(criteria: EventReplayCriteria): Promise<EventReplayResult>;
    getStats(): Promise<EventBusStats>;
    health(): Promise<EventBusHealth>;
}
export interface EventHistoryCriteria {
    eventTypes?: PolicyEventType[];
    resourceTypes?: string[];
    resourceIds?: string[];
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
}
export interface EventHistoryResult {
    events: BasePolicyEvent[];
    totalCount: number;
    hasMore: boolean;
}
export interface EventReplayCriteria {
    eventIds?: string[];
    criteria?: EventHistoryCriteria;
    subscriptionIds?: string[];
    dryRun?: boolean;
}
export interface EventReplayResult {
    replayId: string;
    totalEvents: number;
    replayedEvents: number;
    failedEvents: number;
    startedAt: Date;
    completedAt?: Date;
    errors?: EventProcessingError[];
}
export interface EventBusStats {
    eventsPublished: number;
    eventsDelivered: number;
    activeSubscriptions: number;
    averageDeliveryTime: number;
    errorRate: number;
    throughput: number;
}
export interface EventBusHealth {
    status: 'healthy' | 'degraded' | 'critical';
    components: ComponentStatus[];
    lastCheck: Date;
}
export interface ComponentStatus {
    component: string;
    status: 'healthy' | 'degraded' | 'critical';
    message?: string;
    lastCheck: Date;
}
/**
 * Notification interface
 */
export interface PolicyNotification {
    notificationId: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    details?: string;
    actionUrl?: string;
    actionLabel?: string;
    recipients: NotificationRecipient[];
    category: NotificationCategory;
    tags: string[];
    sourceEvent?: BasePolicyEvent;
    sourceSystem: string;
    channels: NotificationChannel[];
    deliverySettings: NotificationDeliverySettings;
    status: NotificationStatus;
    createdAt: Date;
    scheduledFor?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    expiresAt?: Date;
    metadata?: Record<string, any>;
}
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'alert' | 'reminder' | 'approval_request' | 'system_message';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export interface NotificationRecipient {
    recipientId: string;
    recipientType: 'user' | 'group' | 'role' | 'system';
    name: string;
    contactInfo: ContactInfo;
    preferences?: NotificationPreferences;
}
export interface ContactInfo {
    email?: string;
    phone?: string;
    pushTokens?: string[];
    slackUserId?: string;
    teamsUserId?: string;
}
export interface NotificationPreferences {
    channels: NotificationChannel[];
    quietHours?: QuietHours;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    categories: NotificationCategory[];
}
export interface QuietHours {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
    days: number[];
}
export type NotificationCategory = 'policy_changes' | 'compliance_alerts' | 'security_incidents' | 'system_maintenance' | 'performance_issues' | 'workflow_updates' | 'audit_reports' | 'assignment_changes';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'slack' | 'teams' | 'webhook';
export interface NotificationDeliverySettings {
    channels: NotificationChannelSettings[];
    retryPolicy: NotificationRetryPolicy;
    batchingEnabled: boolean;
    maxBatchSize?: number;
    batchTimeout?: number;
}
export interface NotificationChannelSettings {
    channel: NotificationChannel;
    template?: string;
    customSettings?: Record<string, any>;
}
export interface NotificationRetryPolicy {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
    retryChannels: NotificationChannel[];
}
export type NotificationStatus = 'pending' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled' | 'expired';
/**
 * Notification service interface
 */
export interface IPolicyNotificationService {
    createNotification(notification: CreateNotificationRequest): Promise<PolicyNotification>;
    updateNotification(id: string, updates: UpdateNotificationRequest): Promise<PolicyNotification>;
    getNotification(id: string): Promise<PolicyNotification>;
    getNotifications(criteria: NotificationSearchCriteria): Promise<NotificationSearchResult>;
    deleteNotification(id: string): Promise<void>;
    sendNotification(id: string, options?: SendOptions): Promise<NotificationDeliveryResult>;
    sendBulkNotifications(ids: string[], options?: SendOptions): Promise<BulkNotificationResult>;
    scheduleNotification(id: string, scheduledTime: Date): Promise<void>;
    cancelScheduledNotification(id: string): Promise<void>;
    createTemplate(template: NotificationTemplate): Promise<NotificationTemplate>;
    updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
    getTemplates(category?: NotificationCategory): Promise<NotificationTemplate[]>;
    updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void>;
    getPreferences(userId: string): Promise<NotificationPreferences>;
    getDeliveryStats(criteria: DeliveryStatsCriteria): Promise<NotificationDeliveryStats>;
    getEngagementMetrics(criteria: EngagementMetricsCriteria): Promise<NotificationEngagementMetrics>;
}
export interface CreateNotificationRequest {
    notification: Omit<PolicyNotification, 'notificationId' | 'status' | 'createdAt'>;
}
export interface UpdateNotificationRequest {
    notification: Partial<PolicyNotification>;
}
export interface NotificationSearchCriteria {
    recipientIds?: string[];
    types?: NotificationType[];
    categories?: NotificationCategory[];
    statuses?: NotificationStatus[];
    priorities?: NotificationPriority[];
    createdAfter?: Date;
    createdBefore?: Date;
    tags?: string[];
    limit?: number;
    offset?: number;
}
export interface NotificationSearchResult {
    notifications: PolicyNotification[];
    totalCount: number;
    hasMore: boolean;
}
export interface SendOptions {
    forceDelivery?: boolean;
    skipPreferences?: boolean;
    customTemplate?: string;
    deliveryTime?: Date;
}
export interface NotificationDeliveryResult {
    notificationId: string;
    success: boolean;
    deliveredChannels: NotificationChannel[];
    failedChannels: NotificationChannelFailure[];
    deliveryTime: number;
}
export interface NotificationChannelFailure {
    channel: NotificationChannel;
    error: string;
    retryable: boolean;
}
export interface BulkNotificationResult {
    totalNotifications: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    results: NotificationDeliveryResult[];
}
export interface NotificationTemplate {
    templateId: string;
    name: string;
    category: NotificationCategory;
    type: NotificationType;
    titleTemplate: string;
    messageTemplate: string;
    detailsTemplate?: string;
    channelTemplates: ChannelTemplate[];
    variables: TemplateVariable[];
    defaultValues?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    active: boolean;
}
export interface ChannelTemplate {
    channel: NotificationChannel;
    template: string;
    subject?: string;
    customSettings?: Record<string, any>;
}
export interface TemplateVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object';
    required: boolean;
    description: string;
    defaultValue?: any;
}
export interface DeliveryStatsCriteria {
    startDate: Date;
    endDate: Date;
    channels?: NotificationChannel[];
    categories?: NotificationCategory[];
    recipientIds?: string[];
}
export interface NotificationDeliveryStats {
    totalNotifications: number;
    deliveredNotifications: number;
    failedNotifications: number;
    deliveryRate: number;
    channelStats: ChannelDeliveryStats[];
    categoryStats: CategoryDeliveryStats[];
    averageDeliveryTime: number;
    p95DeliveryTime: number;
}
export interface ChannelDeliveryStats {
    channel: NotificationChannel;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
    averageDeliveryTime: number;
}
export interface CategoryDeliveryStats {
    category: NotificationCategory;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
}
export interface EngagementMetricsCriteria {
    startDate: Date;
    endDate: Date;
    categories?: NotificationCategory[];
    recipientIds?: string[];
}
export interface NotificationEngagementMetrics {
    totalNotifications: number;
    openedNotifications: number;
    clickedNotifications: number;
    openRate: number;
    clickRate: number;
    categoryEngagement: CategoryEngagementMetrics[];
    averageTimeToOpen: number;
    averageTimeToClick: number;
}
export interface CategoryEngagementMetrics {
    category: NotificationCategory;
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
}
//# sourceMappingURL=PolicyEvents.d.ts.map