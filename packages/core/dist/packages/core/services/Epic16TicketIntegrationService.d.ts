/**
 * Epic 16 Ticket Integration Service
 *
 * Comprehensive ticket integration system for Epic 16 Marketplace & Community Features.
 * Provides seamless integration between community support, marketplace issues,
 * template submissions, and internal ticketing systems.
 */
import { EventEmitter } from 'events';
export interface MarketplaceTicket {
    id: string;
    type: MarketplaceTicketType;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    templateId?: string;
    sellerId?: string;
    buyerId?: string;
    transactionId?: string;
    communityUserId?: string;
    threadId?: string;
    topicCategory?: string;
    assignedTo?: string;
    assignedTeam?: string;
    labels: string[];
    tags: string[];
    metadata: TicketMetadata;
    attachments: TicketAttachment[];
    comments: TicketComment[];
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    closedAt?: Date;
    sla: SLATracking;
    externalIntegrations: ExternalIntegration[];
}
export declare enum MarketplaceTicketType {
    TEMPLATE_SUBMISSION = "template_submission",
    TEMPLATE_ISSUE = "template_issue",
    BILLING_DISPUTE = "billing_dispute",
    REFUND_REQUEST = "refund_request",
    CONTENT_MODERATION = "content_moderation",
    COMMUNITY_SUPPORT = "community_support",
    FEATURE_REQUEST = "feature_request",
    BUG_REPORT = "bug_report",
    ACCOUNT_ISSUE = "account_issue",
    POLICY_VIOLATION = "policy_violation",
    PARTNERSHIP_INQUIRY = "partnership_inquiry",
    TECHNICAL_SUPPORT = "technical_support"
}
export declare enum TicketStatus {
    NEW = "new",
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    PENDING_USER = "pending_user",
    PENDING_REVIEW = "pending_review",
    PENDING_APPROVAL = "pending_approval",
    RESOLVED = "resolved",
    CLOSED = "closed",
    REOPENED = "reopened",
    ESCALATED = "escalated",
    ON_HOLD = "on_hold"
}
export declare enum TicketPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
export declare enum TicketCategory {
    MARKETPLACE = "marketplace",
    COMMUNITY = "community",
    TECHNICAL = "technical",
    BILLING = "billing",
    CONTENT = "content",
    ACCOUNT = "account",
    POLICY = "policy",
    PARTNERSHIP = "partnership"
}
export interface TicketMetadata {
    source: 'web' | 'api' | 'email' | 'chat' | 'phone' | 'community';
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    environment: 'production' | 'staging' | 'development';
    version: string;
    locale: string;
    timezone: string;
    deviceInfo?: DeviceInfo;
    sessionId?: string;
    userId?: string;
    customFields: Record<string, any>;
}
export interface DeviceInfo {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    version: string;
    screenResolution?: string;
}
export interface TicketAttachment {
    id: string;
    filename: string;
    contentType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    uploadedBy: string;
    uploadedAt: Date;
    scanResults?: SecurityScanResult[];
}
export interface SecurityScanResult {
    scanner: string;
    result: 'clean' | 'suspicious' | 'malicious';
    confidence: number;
    details: string[];
    scannedAt: Date;
}
export interface TicketComment {
    id: string;
    content: string;
    author: string;
    authorType: 'user' | 'agent' | 'system';
    visibility: 'public' | 'internal' | 'private';
    createdAt: Date;
    updatedAt?: Date;
    attachments: string[];
    mentions: string[];
    reactions: CommentReaction[];
}
export interface CommentReaction {
    emoji: string;
    userId: string;
    timestamp: Date;
}
export interface SLATracking {
    responseTime: SLAMetric;
    resolutionTime: SLAMetric;
    escalationTime: SLAMetric;
    breached: boolean;
    breachReason?: string;
}
export interface SLAMetric {
    target: number;
    actual?: number;
    deadline: Date;
    breached: boolean;
    warningThreshold: number;
}
export interface ExternalIntegration {
    system: string;
    externalId: string;
    url?: string;
    status: 'synced' | 'pending' | 'failed' | 'disabled';
    lastSync: Date;
    syncData: Record<string, any>;
}
export interface TicketWorkflow {
    id: string;
    name: string;
    description: string;
    ticketTypes: MarketplaceTicketType[];
    steps: WorkflowStep[];
    triggers: WorkflowTrigger[];
    conditions: WorkflowCondition[];
    active: boolean;
    version: string;
}
export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    type: 'manual' | 'automated' | 'approval';
    assignmentRules: AssignmentRule[];
    actions: WorkflowAction[];
    notifications: NotificationRule[];
    slaRules: SLARule[];
    nextSteps: string[];
}
export interface WorkflowTrigger {
    type: 'status_change' | 'time_based' | 'field_change' | 'comment_added' | 'escalation';
    condition: string;
    parameters: Record<string, any>;
}
export interface WorkflowCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
    logic: 'AND' | 'OR';
}
export interface AssignmentRule {
    type: 'round_robin' | 'skill_based' | 'workload_based' | 'availability_based';
    criteria: AssignmentCriteria;
    fallbackAssignee?: string;
}
export interface AssignmentCriteria {
    skills?: string[];
    teams?: string[];
    maxWorkload?: number;
    availabilityHours?: string[];
    language?: string[];
}
export interface WorkflowAction {
    type: 'set_field' | 'send_email' | 'create_task' | 'call_webhook' | 'update_status';
    parameters: Record<string, any>;
    condition?: string;
}
export interface NotificationRule {
    type: 'email' | 'sms' | 'push' | 'slack' | 'webhook';
    recipients: NotificationRecipient[];
    template: string;
    trigger: string;
    delay?: number;
}
export interface NotificationRecipient {
    type: 'user' | 'role' | 'team' | 'custom';
    identifier: string;
    fallbacks?: string[];
}
export interface SLARule {
    metric: 'response_time' | 'resolution_time' | 'escalation_time';
    target: number;
    businessHoursOnly: boolean;
    escalationActions: EscalationAction[];
}
export interface EscalationAction {
    trigger: 'warning' | 'breach' | 'severe_breach';
    delay: number;
    actions: WorkflowAction[];
    notifications: NotificationRule[];
}
export interface IntegrationConfig {
    github: GitHubIntegration;
    jira: JiraIntegration;
    zendesk: ZendeskIntegration;
    slack: SlackIntegration;
    discord: DiscordIntegration;
    email: EmailIntegration;
    webhook: WebhookIntegration;
}
export interface GitHubIntegration {
    enabled: boolean;
    repository: string;
    token: string;
    labelMapping: Record<string, string>;
    autoCreateIssues: boolean;
    syncComments: boolean;
}
export interface JiraIntegration {
    enabled: boolean;
    url: string;
    username: string;
    token: string;
    project: string;
    issueTypeMapping: Record<MarketplaceTicketType, string>;
    fieldMapping: Record<string, string>;
}
export interface ZendeskIntegration {
    enabled: boolean;
    domain: string;
    email: string;
    token: string;
    ticketFormId?: string;
    customFields: Record<string, number>;
}
export interface SlackIntegration {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
    botToken?: string;
    mentionRoles: string[];
}
export interface DiscordIntegration {
    enabled: boolean;
    webhookUrl: string;
    serverId: string;
    channelId: string;
    roleMapping: Record<TicketPriority, string>;
}
export interface EmailIntegration {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    fromAddress: string;
    templates: Record<string, EmailTemplate>;
}
export interface EmailTemplate {
    subject: string;
    htmlBody: string;
    textBody: string;
    attachments?: string[];
}
export interface WebhookIntegration {
    enabled: boolean;
    endpoints: WebhookEndpoint[];
    retryPolicy: RetryPolicy;
}
export interface WebhookEndpoint {
    url: string;
    events: string[];
    headers: Record<string, string>;
    authentication?: WebhookAuth;
}
export interface WebhookAuth {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials: Record<string, string>;
}
export interface RetryPolicy {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    baseDelay: number;
    maxDelay: number;
}
export interface TicketIntegrationConfig {
    defaultWorkflow: string;
    autoAssignment: boolean;
    slaEnabled: boolean;
    integrations: IntegrationConfig;
    notifications: {
        enabled: boolean;
        channels: string[];
        templates: Record<string, string>;
    };
    security: {
        encryptAttachments: boolean;
        scanUploads: boolean;
        retentionPeriod: number;
    };
    analytics: {
        trackMetrics: boolean;
        dashboardEnabled: boolean;
        reportingEnabled: boolean;
    };
}
/**
 * Epic 16 Ticket Integration Service
 *
 * Core service for managing marketplace and community tickets with
 * comprehensive integration capabilities.
 */
export declare class Epic16TicketIntegrationService extends EventEmitter {
    private tickets;
    private workflows;
    private integrations;
    private config;
    private metrics;
    constructor(config?: Partial<TicketIntegrationConfig>);
    /**
     * Create a new marketplace/community ticket
     */
    createTicket(
      ticketData: Omit<MarketplaceTicket,
      'id' | 'createdAt' | 'updatedAt' | 'sla'>
    ): Promise<MarketplaceTicket>;
    /**
     * Update ticket status
     */
    updateTicketStatus(
      ticketId: string,
      newStatus: TicketStatus,
      userId: string,
      comment?: string
    ): Promise<MarketplaceTicket | null>;
    /**
     * Add comment to ticket
     */
    addComment(
      ticketId: string,
      commentData: Omit<TicketComment,
      'id' | 'createdAt' | 'reactions'>
    ): Promise<TicketComment | null>;
    /**
     * Assign ticket to user or team
     */
    assignTicket(ticketId: string, assigneeId: string, assignerId: string): Promise<MarketplaceTicket | null>;
    /**
     * Escalate ticket
     */
    escalateTicket(ticketId: string, reason: string, escalatedBy: string): Promise<MarketplaceTicket | null>;
    /**
     * Get tickets with filtering and pagination
     */
    getTickets(filters?: {
        status?: TicketStatus[];
        type?: MarketplaceTicketType[];
        priority?: TicketPriority[];
        assignedTo?: string;
        category?: TicketCategory;
        dateRange?: {
            start: Date;
            end: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        tickets: MarketplaceTicket[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Get ticket metrics and analytics
     */
    getTicketMetrics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        totalTickets: number;
        ticketsByStatus: Record<TicketStatus, number>;
        ticketsByType: Record<MarketplaceTicketType, number>;
        ticketsByPriority: Record<TicketPriority, number>;
        averageResponseTime: number;
        averageResolutionTime: number;
        slaBreachRate: number;
        escalationRate: number;
        customerSatisfaction: number;
    }>;
    private generateTicketId;
    private generateCommentId;
    private calculateSLA;
    private updateSLATracking;
    private autoAssignTicket;
    private executeWorkflow;
    private executeWorkflowStep;
    private executeWorkflowAction;
    private sendNotifications;
    private sendNotificationByChannel;
    private syncWithIntegrations;
    private increasePriority;
    private calculateAverageResponseTime;
    private calculateAverageResolutionTime;
    private initializeDefaultWorkflows;
    private sendEmailNotification;
    private sendSlackNotification;
    private sendDiscordNotification;
    private sendWorkflowNotification;
    private callWebhook;
    private syncWithGitHub;
    private syncWithJira;
    private syncWithZendesk;
}
export default Epic16TicketIntegrationService;
//# sourceMappingURL=Epic16TicketIntegrationService.d.ts.map