/**
 * Policy Events and Notifications - Epic 17 Implementation
 * Task: E17-1753114397367-674DF3 - Design policy interfaces
 * 
 * Event-driven policy system interfaces for real-time notifications,
 * workflow automation, and system integration.
 */
import {
  BasePolicy,
  PolicyType,
  PolicyStatus,
  PolicyAssignment,
  PolicyEvaluation,
  EvaluationContext,
  ComplianceFramework
} from './PolicyInterfaces';

// =============================================================================
// Core Event System Interfaces
// =============================================================================
/**
 * Base policy event interface
 */

export interface BasePolicyEvent {
  readonly eventId: string;
  readonly eventType: PolicyEventType;
  readonly timestamp: Date;
  readonly source: EventSource;
  // Event context
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  // Event data
  data: PolicyEventData;
  // Event metadata
  correlationId?: string;
  causationId?: string; // ID of event that caused this event,
  version: string;
  // Processing information
  processed: boolean;
  processedAt?: Date;
  processingErrors?: EventProcessingError;
  // Retry information
  retryCount: number;,
  maxRetries: number;
  nextRetryAt?: Date;
}
export type PolicyEventType =
  // Policy lifecycle events
  | 'policy.created'
  | 'policy.updated'
  | 'policy.deleted'
  | 'policy.activated'
  | 'policy.deactivated'
  | 'policy.deprecated'
  | 'policy.archived'
  | 'policy.version.created'
  | 'policy.validation.completed'
  | 'policy.test.completed'
  // Assignment events
  | 'assignment.created'
  | 'assignment.updated'
  | 'assignment.deleted'
  | 'assignment.activated'
  | 'assignment.deactivated'
  | 'assignment.conflict.detected'
  | 'assignment.conflict.resolved'
  // Evaluation events
  | 'evaluation.requested'
  | 'evaluation.completed'
  | 'evaluation.failed'
  | 'evaluation.cached'
  | 'evaluation.cache.expired'
  // Compliance events
  | 'compliance.violation.detected'
  | 'compliance.violation.resolved'
  | 'compliance.audit.started'
  | 'compliance.audit.completed'
  | 'compliance.report.generated'
  // Security events
  | 'security.policy.breached'
  | 'security.unauthorized.access'
  | 'security.suspicious.activity'
  | 'security.threat.detected'
  // System events
  | 'system.performance.degraded'
  | 'system.error.occurred'
  | 'system.maintenance.started'
  | 'system.maintenance.completed'
  // Workflow events
  | 'workflow.started'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.step.completed'
  // Integration events
  | 'integration.sync.started'
  | 'integration.sync.completed'
  | 'integration.sync.failed'
  | 'integration.webhook.triggered';

export type EventSource = 
  | 'policy_service'
  | 'evaluation_service'
  | 'assignment_service'
  | 'analytics_service'
  | 'compliance_service'
  | 'template_service'
  | 'import_export_service'
  | 'workflow_engine'
  | 'external_system'
  | 'user_action'
  | 'scheduled_task';

export interface PolicyEventData {
  // Primary resource information
  resourceType: 'policy' | 'assignment' | 'evaluation' | 'template' | 'workflow';,
  resourceId: string;
  resourceVersion?: string;
  // Change information (for update events)
  changes?: PolicyEventChange;
  previousState?: any;
  currentState?: any;
  // Context information
  context?: EvaluationContext;
  // Additional event-specific data
  metadata?: Record<string, any>;
}
export interface PolicyEventChange {
  field: string;,
  oldValue: any;
  newValue: any;,
  changeType: 'added' | 'modified' | 'removed';
}
export interface EventProcessingError {
  errorId: string;,
  timestamp: Date;
  message: string;
  details?: any;
  retryable: boolean;
  // =============================================================================
  // Specific Event Type Interfaces
  // =============================================================================
  /**
  * Policy lifecycle event
  */
}
export interface PolicyLifecycleEvent extends BasePolicyEvent {
  eventType: 'policy.created' | 'policy.updated' | 'policy.deleted' | ,
  'policy.activated' | 'policy.deactivated' | 'policy.deprecated' | 'policy.archived';
  data: PolicyLifecycleEventData;
  export interface PolicyLifecycleEventData extends PolicyEventData {
  resourceType: 'policy';,
  policy: BasePolicy;
  previousPolicy?: BasePolicy; // For update events,
  reason?: string;
  replacementPolicyId?: string; // For deprecation,
  /**
  * Assignment event
  */
  export interface PolicyAssignmentEvent extends BasePolicyEvent {
  eventType: 'assignment.created' | 'assignment.updated' | 'assignment.deleted' |,
  'assignment.activated' | 'assignment.deactivated' |
  'assignment.conflict.detected' | 'assignment.conflict.resolved';
  data: PolicyAssignmentEventData;
  export interface PolicyAssignmentEventData extends PolicyEventData {
  resourceType: 'assignment';,
  assignment: PolicyAssignment;
  previousAssignment?: PolicyAssignment; // For update events,
  conflicts?: AssignmentConflict;
  resolution?: ConflictResolution;
  export interface AssignmentConflict {
  conflictType: 'priority' | 'contradiction' | 'circular_dependency';,
  conflictingAssignments: string;
  description: string;,
  severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface ConflictResolution {
  strategy: string;,
  resolvedBy: string;
  resolvedAt: Date;,
  resultingAssignments: string;
  notes?: string;
  /**
  * Evaluation event
  */
}
export interface PolicyEvaluationEvent extends BasePolicyEvent {
  eventType: 'evaluation.requested' | 'evaluation.completed' | 'evaluation.failed' |,
  'evaluation.cached' | 'evaluation.cache.expired';
  data: PolicyEvaluationEventData;
  export interface PolicyEvaluationEventData extends PolicyEventData {
  resourceType: 'evaluation';,
  evaluation: PolicyEvaluation;
  requestContext: EvaluationContext;,
  performance: EvaluationPerformance;
  cacheInfo?: CacheInfo;
  export interface EvaluationPerformance {
  evaluationTime: number; // milliseconds,
  policiesEvaluated: number;,
  cacheHits: number;
  cacheMisses: number;,
  rulesProcessed: number;
}
export interface CacheInfo {
  cacheKey: string;,
  cacheHit: boolean;
  cacheExpiration?: Date;
  cacheSize?: number;
  /**
  * Compliance event
  */
}
export interface ComplianceEvent extends BasePolicyEvent {
  eventType: 'compliance.violation.detected' | 'compliance.violation.resolved' |,
  'compliance.audit.started' | 'compliance.audit.completed' |
  'compliance.report.generated';
  data: ComplianceEventData;
  export interface ComplianceEventData extends PolicyEventData {
  framework: ComplianceFramework;
  violationType?: string;
  violationSeverity?: 'low' | 'medium' | 'high' | 'critical';
  affectedPolicies: string;
  remediationRequired?: boolean;
  auditId?: string;
  reportId?: string;
  /**
  * Security event
  */
  export interface SecurityEvent extends BasePolicyEvent {
  eventType: 'security.policy.breached' | 'security.unauthorized.access' |,
  'security.suspicious.activity' | 'security.threat.detected';
  data: SecurityEventData;
  export interface SecurityEventData extends PolicyEventData {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';,
  threatType: string;
  sourceIp?: string;
  userAgent?: string;
  affectedResources: string;
  mitigationActions?: string;
  investigationRequired: boolean;
  // =============================================================================
  // Event Processing and Subscription Interfaces
  // =============================================================================
  /**
  * Event handler interface
  */
  export interface IPolicyEventHandler {
  readonly handlerId: string;
  readonly name: string;
  readonly eventTypes: PolicyEventType;
  readonly priority: number; // Higher numbers = higher priority,
  canHandle(event: BasePolicyEvent): boolean;
  handle(event: BasePolicyEvent): Promise<EventHandlerResult>;
  onError(event: BasePolicyEvent, error: Error): Promise<void>;
}
export interface EventHandlerResult {
  success: boolean;,
  executionTime: number; // milliseconds,
  processedData?: any;
  generatedEvents?: BasePolicyEvent;
  errors?: EventProcessingError;
  metadata?: Record<string, any>;
  /**
  * Event subscription interface
  */
}
export interface PolicyEventSubscription {
  subscriptionId: string;,
  subscriberId: string;
  subscriberName: string;
  // Subscription configuration
  eventTypes: PolicyEventType;,
  filters: EventFilter;
  // Delivery configuration
  deliveryMethod: DeliveryMethod;,
  deliveryConfig: DeliveryConfiguration;
  // Processing options
  batchSize: number;,
  batchTimeout: number; // milliseconds,
  retryPolicy: RetryPolicy;
  // Status and metadata
  active: boolean;,
  createdAt: Date;
  lastDeliveryAt?: Date;
  deliveryStats: DeliveryStats;
}
export interface EventFilter {
  field: string;,
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'regex';
  value: any;
  caseSensitive?: boolean;
}
export type DeliveryMethod = 'webhook' | 'queue' | 'email' | 'sms' | 'push' | 'database' | 'log';

export interface DeliveryConfiguration {
  // Webhook configuration
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  webhookTimeout?: number; // milliseconds,
  // Queue configuration
  queueName?: string;
  queuePriority?: number;
  // Email configuration
  emailAddresses?: string;
  emailTemplate?: string;
  // SMS configuration
  phoneNumbers?: string;
  smsTemplate?: string;
  // Push notification configuration
  pushTokens?: string;
  pushTemplate?: string;
  // Database configuration
  databaseTable?: string;
  databaseFields?: Record<string, string>;
}
export interface RetryPolicy {
  maxRetries: number;,
  backoffMultiplier: number;
  initialDelay: number; // milliseconds,
  maxDelay: number; // milliseconds,
  retryConditions: RetryCondition;
}
export interface RetryCondition {
  errorType: string;
  errorPattern?: string;
  shouldRetry: boolean;
}
export interface DeliveryStats {
  totalEvents: number;,
  successfulDeliveries: number;
  failedDeliveries: number;,
  averageDeliveryTime: number; // milliseconds,
  lastError?: EventProcessingError;
  // =============================================================================
  // Event Publishing and Bus Interfaces
  // =============================================================================
  /**
  * Event publisher interface
  */
}
export interface IPolicyEventPublisher {
  publish(event: BasePolicyEvent): Promise<PublishResult>;
  publishBatch(events: BasePolicyEvent): Promise<BatchPublishResult>;
  // Scheduled publishing
  scheduleEvent(event: BasePolicyEvent, scheduledTime: Date): Promise<ScheduledEventResult>;
  cancelScheduledEvent(eventId: string): Promise<void>;
  // Event validation
  validateEvent(event: BasePolicyEvent): Promise<EventValidationResult>;
}
export interface PublishResult {
  success: boolean;,
  eventId: string;
  publishedAt: Date;,
  deliveryCount: number;
  errors?: PublishError;
}
export interface BatchPublishResult {
  totalEvents: number;,
  successfulEvents: number;
  failedEvents: number;,
  results: PublishResult;
}
export interface ScheduledEventResult {
  scheduleId: string;,
  eventId: string;
  scheduledTime: Date;,
  status: 'scheduled' | 'cancelled' | 'executed';
}
export interface PublishError {
  subscriberId: string;,
  error: string;
  retryable: boolean;
}
export interface EventValidationResult {
  valid: boolean;,
  errors: EventValidationError;
  warnings: EventValidationWarning;
}
export interface EventValidationError {
  field: string;,
  message: string;
  code: string;
}
export interface EventValidationWarning {
  field: string;,
  message: string;
  code: string;
  /**
  * Event bus interface
  */
}
export interface IPolicyEventBus {
  // Event publishing
  emit(event: BasePolicyEvent): Promise<void>;
  emitBatch(events: BasePolicyEvent): Promise<void>;
  // Subscription management
  subscribe(subscription: PolicyEventSubscription): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;
  updateSubscription(subscriptionId: string, updates: Partial<PolicyEventSubscription>): Promise<void>;
  getSubscriptions(subscriberId?: string): Promise<PolicyEventSubscription>;
  // Event history and replay
  getEventHistory(criteria: EventHistoryCriteria): Promise<EventHistoryResult>;
  replayEvents(criteria: EventReplayCriteria): Promise<EventReplayResult>;
  // System management
  getStats(): Promise<EventBusStats>;
  health(): Promise<EventBusHealth>;
}
export interface EventHistoryCriteria {
  eventTypes?: PolicyEventType;
  resourceTypes?: string;
  resourceIds?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  organizationId?: string;
  limit?: number;
  offset?: number;
}
export interface EventHistoryResult {
  events: BasePolicyEvent;,
  totalCount: number;
  hasMore: boolean;
}
export interface EventReplayCriteria {
  eventIds?: string;
  criteria?: EventHistoryCriteria;
  subscriptionIds?: string;
  dryRun?: boolean;
}
export interface EventReplayResult {
  replayId: string;,
  totalEvents: number;
  replayedEvents: number;,
  failedEvents: number;
  startedAt: Date;
  completedAt?: Date;
  errors?: EventProcessingError;
}
export interface EventBusStats {
  eventsPublished: number;,
  eventsDelivered: number;
  activeSubscriptions: number;,
  averageDeliveryTime: number; // milliseconds,
  errorRate: number; // percentage,
  throughput: number; // events per second,
}
export interface EventBusHealth {
  status: 'healthy' | 'degraded' | 'critical';,
  components: ComponentStatus;
  lastCheck: Date;
}
export interface ComponentStatus {
  component: string;,
  status: 'healthy' | 'degraded' | 'critical';
  message?: string;
  lastCheck: Date;
  // =============================================================================
  // Notification System Interfaces
  // =============================================================================
  /**
  * Notification interface
  */
}
export interface PolicyNotification {
  notificationId: string;,
  type: NotificationType;
  priority: NotificationPriority;
  // Notification content
  title: string;,
  message: string;
  details?: string;
  actionUrl?: string;
  actionLabel?: string;
  // Recipients
  recipients: NotificationRecipient;
  // Categorization
  category: NotificationCategory;,
  tags: string;
  // Source information
  sourceEvent?: BasePolicyEvent;
  sourceSystem: string;
  // Delivery configuration
  channels: NotificationChannel;,
  deliverySettings: NotificationDeliverySettings;
  // Status and tracking
  status: NotificationStatus;,
  createdAt: Date;
  scheduledFor?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  // Expiration
  expiresAt?: Date;
  // Metadata
  metadata?: Record<string, any>;
}
export type NotificationType = 
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'alert'
  | 'reminder'
  | 'approval_request'
  | 'system_message';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationRecipient {
  recipientId: string;,
  recipientType: 'user' | 'group' | 'role' | 'system';
  name: string;,
  contactInfo: ContactInfo;
  preferences?: NotificationPreferences;
}
export interface ContactInfo {
  email?: string;
  phone?: string;
  pushTokens?: string;
  slackUserId?: string;
  teamsUserId?: string;
}
export interface NotificationPreferences {
  channels: NotificationChannel;
  quietHours?: QuietHours;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';,
  categories: NotificationCategory;
}
export interface QuietHours {
  enabled: boolean;,
  startTime: string; // HH:MM format,
  endTime: string; // HH:MM format,
  timezone: string;,
  days: number; // 0-6, Sunday=0,
}
export type NotificationCategory = 
  | 'policy_changes'
  | 'compliance_alerts'
  | 'security_incidents'
  | 'system_maintenance'
  | 'performance_issues'
  | 'workflow_updates'
  | 'audit_reports'
  | 'assignment_changes';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'slack' | 'teams' | 'webhook';

export interface NotificationDeliverySettings {
  channels: NotificationChannelSettings;,
  retryPolicy: NotificationRetryPolicy;
  batchingEnabled: boolean;
  maxBatchSize?: number;
  batchTimeout?: number; // milliseconds,
}
export interface NotificationChannelSettings {
  channel: NotificationChannel;
  template?: string;
  customSettings?: Record<string, any>;
}
export interface NotificationRetryPolicy {
  maxRetries: number;,
  retryDelay: number; // milliseconds,
  backoffMultiplier: number;,
  retryChannels: NotificationChannel;
}
export type NotificationStatus = 
  | 'pending'
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled'
  | 'expired';
/**
 * Notification service interface
 */

export interface IPolicyNotificationService {
  // Notification creation and management
  createNotification(notification: CreateNotificationRequest): Promise<PolicyNotification>;
  updateNotification(id: string, updates: UpdateNotificationRequest): Promise<PolicyNotification>;
  getNotification(id: string): Promise<PolicyNotification>;
  getNotifications(criteria: NotificationSearchCriteria): Promise<NotificationSearchResult>;
  deleteNotification(id: string): Promise<void>;
  // Delivery management
  sendNotification(id: string, options?: SendOptions): Promise<NotificationDeliveryResult>;
  sendBulkNotifications(ids: string, options?: SendOptions): Promise<BulkNotificationResult>;
  scheduleNotification(id: string, scheduledTime: Date): Promise<void>;
  cancelScheduledNotification(id: string): Promise<void>;
  // Template management
  createTemplate(template: NotificationTemplate): Promise<NotificationTemplate>;
  updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate>;
  getTemplates(category?: NotificationCategory): Promise<NotificationTemplate>;
  // Preference management
  updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void>;
  getPreferences(userId: string): Promise<NotificationPreferences>;
  // Analytics and reporting
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
  recipientIds?: string;
  types?: NotificationType;
  categories?: NotificationCategory;
  statuses?: NotificationStatus;
  priorities?: NotificationPriority;
  createdAfter?: Date;
  createdBefore?: Date;
  tags?: string;
  limit?: number;
  offset?: number;
}
export interface NotificationSearchResult {
  notifications: PolicyNotification;,
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
  notificationId: string;,
  success: boolean;
  deliveredChannels: NotificationChannel;,
  failedChannels: NotificationChannelFailure;
  deliveryTime: number; // milliseconds,
}
export interface NotificationChannelFailure {
  channel: NotificationChannel;,
  error: string;
  retryable: boolean;
}
export interface BulkNotificationResult {
  totalNotifications: number;,
  successfulDeliveries: number;
  failedDeliveries: number;,
  results: NotificationDeliveryResult;
}
export interface NotificationTemplate {
  templateId: string;,
  name: string;
  category: NotificationCategory;,
  type: NotificationType;
  // Template content
  titleTemplate: string;,
  messageTemplate: string;
  detailsTemplate?: string;
  // Channel-specific templates
  channelTemplates: ChannelTemplate;
  // Template configuration
  variables: TemplateVariable;
  defaultValues?: Record<string, any>;
  // Metadata
  createdAt: Date;,
  updatedAt: Date;
  version: string;,
  active: boolean;
}
export interface ChannelTemplate {
  channel: NotificationChannel;,
  template: string;
  subject?: string; // For email,
  customSettings?: Record<string, any>;
}
export interface TemplateVariable {
  name: string;,
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  required: boolean;,
  description: string;
  defaultValue?: any;
}
export interface DeliveryStatsCriteria {
  startDate: Date;,
  endDate: Date;
  channels?: NotificationChannel;
  categories?: NotificationCategory;
  recipientIds?: string;
}
export interface NotificationDeliveryStats {
  totalNotifications: number;,
  deliveredNotifications: number;
  failedNotifications: number;,
  deliveryRate: number; // percentage,
  // By channel
  channelStats: ChannelDeliveryStats;
  // By category
  categoryStats: CategoryDeliveryStats;
  // Performance metrics
  averageDeliveryTime: number; // milliseconds,
  p95DeliveryTime: number; // milliseconds,
}
export interface ChannelDeliveryStats {
  channel: NotificationChannel;,
  sent: number;
  delivered: number;,
  failed: number;
  deliveryRate: number; // percentage,
  averageDeliveryTime: number; // milliseconds,
}
export interface CategoryDeliveryStats {
  category: NotificationCategory;,
  sent: number;
  delivered: number;,
  failed: number;
  deliveryRate: number; // percentage,
}
export interface EngagementMetricsCriteria {
  startDate: Date;,
  endDate: Date;
  categories?: NotificationCategory;
  recipientIds?: string;
}
export interface NotificationEngagementMetrics {
  totalNotifications: number;,
  openedNotifications: number;
  clickedNotifications: number;
  // Rates
  openRate: number; // percentage,
  clickRate: number; // percentage,
  // By category
  categoryEngagement: CategoryEngagementMetrics;
  // Time-based metrics
  averageTimeToOpen: number; // milliseconds,
  averageTimeToClick: number; // milliseconds,
}
export interface CategoryEngagementMetrics {
  category: NotificationCategory;,
  sent: number;
  opened: number;,
  clicked: number;
  openRate: number; // percentage,
  clickRate: number; // percentage,
}