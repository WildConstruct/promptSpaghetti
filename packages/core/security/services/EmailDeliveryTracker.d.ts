/**
 * Email Delivery Tracker Service
 *
 * Comprehensive service for tracking email delivery status for verification emails.
 * Provides real-time status updates, delivery analytics, bounce handling, and
 * integration with multiple email service providers.
 *
 * Features:
 * - Real-time delivery status tracking
 * - Multi-provider support (SendGrid, AWS SES, Mailgun, etc.)
 * - Bounce and complaint handling
 * - Delivery analytics and reporting
 * - Retry mechanisms for failed deliveries
 * - Webhook integration for status updates
 * - Email template management and tracking
 */
import { EventEmitter } from 'events';
export declare enum DeliveryStatus {
    PENDING = "pending",
    QUEUED = "queued",
    PROCESSING = "processing",
    SENT = "sent",
    DELIVERED = "delivered",
    OPENED = "opened",
    CLICKED = "clicked",
    BOUNCED = "bounced",
    REJECTED = "rejected",
    SPAM = "spam",
    FAILED = "failed",
    UNSUBSCRIBED = "unsubscribed"
}
export declare enum EmailType {
    ACCOUNT_VERIFICATION = "account_verification",
    PASSWORD_RESET = "password_reset",
    MFA_CODE = "mfa_code",
    LOGIN_NOTIFICATION = "login_notification",
    SECURITY_ALERT = "security_alert",
    DEVICE_VERIFICATION = "device_verification",
    BACKUP_CODE_DELIVERY = "backup_code_delivery"
}
export declare enum EmailProvider {
    SENDGRID = "sendgrid",
    AWS_SES = "aws_ses",
    MAILGUN = "mailgun",
    POSTMARK = "postmark",
    SMTP = "smtp",
    CUSTOM = "custom"
}
export declare enum BounceType {
    HARD = "hard",
    SOFT = "soft",
    UNDETERMINED = "undetermined"
}
export declare enum BounceSubType {
    GENERAL = "general",
    NO_EMAIL = "no_email",
    SUPPRESSED = "suppressed",
    MAILBOX_FULL = "mailbox_full",
    MESSAGE_TOO_LARGE = "message_too_large",
    CONTENT_REJECTED = "content_rejected",
    ATTACHMENT_REJECTED = "attachment_rejected"
}
export interface EmailMetadata {
    userId: string;
    sessionId?: string;
    templateId?: string;
    templateVersion?: string;
    personalizations?: Record<string, any>;
    tags?: string[];
    categories?: string[];
    customData?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    sendAt?: Date;
    batchId?: string;
    trackingSettings?: {
        clickTracking?: boolean;
        openTracking?: boolean;
        subscriptionTracking?: boolean;
        ganalytics?: boolean;
    };
}
export interface EmailDeliveryRecord {
    id: string;
    messageId: string;
    provider: EmailProvider;
    type: EmailType;
    status: DeliveryStatus;
    recipient: string;
    sender: string;
    subject: string;
    createdAt: Date;
    sentAt?: Date;
    deliveredAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
    bouncedAt?: Date;
    failedAt?: Date;
    metadata: EmailMetadata;
    attempts: EmailDeliveryAttempt[];
    bounceInfo?: {
        type: BounceType;
        subType: BounceSubType;
        reason: string;
        diagnosticCode?: string;
        remoteMta?: string;
    };
    tracking: {,
        opens: EmailOpenEvent[];
        clicks: EmailClickEvent[];
        unsubscribes: EmailUnsubscribeEvent[];
    };
    providerData: Record<string, any>;
}
export interface EmailDeliveryAttempt {
    attemptNumber: number;
    timestamp: Date;
    status: DeliveryStatus;
    providerResponse?: string;
    error?: string;
    retryAfter?: Date;
}
export interface EmailOpenEvent {
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    location?: string;
    deviceType?: string;
}
export interface EmailClickEvent {
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    url: string;
    linkId?: string;
    location?: string;
    deviceType?: string;
}
export interface EmailUnsubscribeEvent {
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    reason?: string;
}
export interface DeliveryStatistics {
    totalEmails: number;
    sentEmails: number;
    deliveredEmails: number;
    openedEmails: number;
    clickedEmails: number;
    bouncedEmails: number;
    rejectedEmails: number;
    spamEmails: number;
    failedEmails: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    spamRate: number;
    statisticsByType: {,
        [key in EmailType]: {
            count: number;
            deliveryRate: number;
            openRate: number;
            bounceRate: number;
        };
    };
    statisticsByProvider: {,
        [key in EmailProvider]: {
            count: number;
            deliveryRate: number;
            averageDeliveryTime: number;
        };
    };
    averageDeliveryTime: number;
    averageOpenTime: number;
    peakSendTimes: Array<{,
        hour: number;
        count: number;
        deliveryRate: number;
    }>;
}
export interface EmailDeliveryConfig {
    defaultProvider: EmailProvider;
    retryAttempts: number;
    retryDelayMs: number;
    trackingEnabled: boolean;
    enableBounceHandling: boolean;
    enableAnalytics: boolean;
    webhookEndpoint?: string;
    webhookSecret?: string;
    providerConfigs: {,
        [key in EmailProvider]?: {
            apiKey?: string;
            endpoint?: string;
            customSettings?: Record<string, any>;
        };
    };
}
export interface EmailSendRequest {
    type: EmailType;
    recipient: string;
    subject: string;
    content: {,
        text?: string;
        html?: string;
        templateId?: string;
        templateData?: Record<string, any>;
    };
    metadata: EmailMetadata;
    provider?: EmailProvider;
    sendAt?: Date;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}
/**
 * Email Delivery Tracker Service
 */
export declare class EmailDeliveryTracker extends EventEmitter {
    private config;
    private deliveryRecords;
    private statistics;
    constructor(config?: Partial<EmailDeliveryConfig>);
    /**
     * Send an email and start tracking delivery
     */
    sendEmail(request: EmailSendRequest): Promise<string>;
    /**
     * Update email delivery status
     */
    updateStatus(emailId: string, status: DeliveryStatus, additionalData?: any): void;
    /**
     * Add delivery tracking event
     */
    addTrackingEvent(emailId: string, eventType: 'open' | 'click' | 'unsubscribe', eventData: any): void;
    /**
     * Handle webhook notifications from email providers
     */
    handleWebhook(provider: EmailProvider, payload: any): Promise<void>;
    /**
     * Get delivery record by email ID
     */
    getDeliveryRecord(emailId: string): EmailDeliveryRecord | null;
    /**
     * Get delivery records by user ID
     */
    getUserDeliveryRecords(userId: string): EmailDeliveryRecord[];
    /**
     * Get delivery statistics
     */
    getStatistics(): DeliveryStatistics;
    /**
     * Get email delivery status for a specific email
     */
    getEmailStatus(emailId: string): DeliveryStatus | null;
    /**
     * Retry failed email delivery
     */
    retryDelivery(emailId: string): Promise<boolean>;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<EmailDeliveryConfig>): void;
    private sendEmailViaProvider;
    private addDeliveryAttempt;
    private handleStatusChange;
    private handleBounce;
    private handleSpamReport;
    private parseWebhookPayload;
    private findEmailByMessageId;
    private processWebhookEvent;
    private updateStatistics;
    private recalculateStatistics;
    private generateEmailId;
    private generateMessageId;
    private getSenderAddress;
    private delay;
    private mergeConfig;
    private initializeStatistics;
}
export default EmailDeliveryTracker;
//# sourceMappingURL=EmailDeliveryTracker.d.ts.map