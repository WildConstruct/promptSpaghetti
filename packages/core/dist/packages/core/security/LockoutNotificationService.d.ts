/**
 * Lockout Notification Service
 *
 * Comprehensive notification system for account lockout events with template
 * management, multi-channel delivery, and tracking capabilities.
 *
 * Features:
 * - Multi-channel notification delivery (email, SMS, push)
 * - Template-based message generation
 * - Delivery status tracking and retry logic
 * - User preference management
 * - Administrative notification routing
 * - Localization support
 */
import { EventEmitter } from 'events';
import { NotificationType, AccountLockout, AdminRole } from './AccountLockoutService';
export declare enum NotificationChannel {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    ADMIN_CONSOLE = "admin_console",
    SLACK = "slack",
    TEAMS = "teams"
}
export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    QUEUED = "queued",
    SENDING = "sending",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed",
    RETRYING = "retrying",
    EXPIRED = "expired"
}
export interface TemplateVariables {
    userName: string;
    userEmail: string;
    lockoutReason: string;
    lockoutTime: string;
    unlockTime?: string;
    expiryTime?: string;
    supportEmail: string;
    supportPhone: string;
    lockoutId: string;
    adminName?: string;
    companyName: string;
    appName: string;
    securityTips: string[];
    nextSteps: string[];
    estimatedResolution?: string;
}
export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    channel: NotificationChannel;
    language: string;
    subject?: string;
    bodyText: string;
    bodyHtml?: string;
    variables: string[];
    priority: NotificationPriority;
    retryPolicy: RetryPolicy;
    expiryMinutes: number;
    metadata: Record<string, any>;
}
export interface RetryPolicy {
    maxAttempts: number;
    backoffMultiplier: number;
    baseDelaySeconds: number;
    maxDelaySeconds: number;
    retryOn: string[];
}
export interface UserNotificationPreferences {
    userId: string;
    channels: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    language: string;
    timezone: string;
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
    frequency: {
        immediate: boolean;
        digest: boolean;
        digestFrequency: 'daily' | 'weekly';
    };
    metadata: Record<string, any>;
}
export interface NotificationRequest {
    id: string;
    type: NotificationType;
    recipient: string;
    channels: NotificationChannel[];
    priority: NotificationPriority;
    templateId: string;
    variables: TemplateVariables;
    scheduledAt?: Date;
    expiresAt?: Date;
    metadata: Record<string, any>;
}
export interface NotificationDelivery {
    id: string;
    requestId: string;
    channel: NotificationChannel;
    recipient: string;
    status: NotificationStatus;
    attempts: number;
    content: {
        subject?: string;
        body: string;
        html?: string;
    };
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    failureReason?: string;
    providerResponse?: any;
    metadata: Record<string, any>;
}
export interface AdminNotificationRule {
    id: string;
    trigger: {
        event: string;
        conditions: Record<string, any>;
    };
    recipients: {
        roles: AdminRole[];
        emails: string[];
        slackChannels?: string[];
    };
    template: string;
    priority: NotificationPriority;
    enabled: boolean;
}
/**
 * Comprehensive lockout notification service
 */
export declare class LockoutNotificationService extends EventEmitter {
    private templates;
    private preferences;
    private notifications;
    private deliveries;
    private adminRules;
    constructor();
    /**
     * Send lockout notification to user
     */
    sendLockoutNotification(lockout: AccountLockout, channels?: NotificationChannel[]): Promise<string>;
    /**
     * Send unlock notification to user
     */
    sendUnlockNotification(lockout: AccountLockout, adminName?: string): Promise<string>;
    /**
     * Send security alert notification
     */
    sendSecurityAlert(lockout: AccountLockout, alertDetails: Record<string, any>): Promise<string>;
    /**
     * Send admin notification for approval required
     */
    sendAdminNotification(
      type: NotificationType,
      lockout: AccountLockout,
      adminRoles: AdminRole[],
      details: Record<string,
      any>
    ): Promise<string[]>;
    /**
     * Update user notification preferences
     */
    updateUserPreferences(userId: string, preferences: Partial<UserNotificationPreferences>): void;
    /**
     * Get notification delivery status
     */
    getNotificationStatus(notificationId: string): {
        request: NotificationRequest | null;
        deliveries: NotificationDelivery[];
        summary: {
            totalDeliveries: number;
            successful: number;
            failed: number;
            pending: number;
        };
    };
    /**
     * Get user notification history
     */
    getUserNotificationHistory(userId: string, limit?: number): NotificationRequest[];
    /**
     * Create custom notification template
     */
    createTemplate(template: Omit<NotificationTemplate, 'id'>): string;
    /**
     * Test notification delivery
     */
    testNotification(
      recipient: string,
      channel: NotificationChannel,
      templateId: string,
      variables: TemplateVariables
    ): Promise<string>;
    /**
     * Get notification statistics
     */
    getNotificationStatistics(dateRange?: {
        start: Date;
        end: Date;
    }): {
        totalNotifications: number;
        byType: Record<NotificationType, number>;
        byChannel: Record<NotificationChannel, number>;
        byStatus: Record<NotificationStatus, number>;
        deliveryRate: number;
        averageDeliveryTime: number;
        failureReasons: Array<{
            reason: string;
            count: number;
        }>;
    };
    private queueNotification;
    private processNotification;
    private attemptDelivery;
    private simulateDelivery;
    private scheduleRetry;
    private renderTemplate;
    private buildTemplateVariables;
    private buildAdminTemplateVariables;
    private getLockoutReasonText;
    private getNextSteps;
    private getEstimatedResolution;
    private calculatePriority;
    private getUserPreferences;
    private getPreferredChannels;
    private selectTemplate;
    private getAdminRecipients;
    private initializeDefaultTemplates;
    private initializeAdminRules;
    private startDeliveryProcessor;
}
export declare const lockoutNotificationService: LockoutNotificationService;
export default LockoutNotificationService;
//# sourceMappingURL=LockoutNotificationService.d.ts.map