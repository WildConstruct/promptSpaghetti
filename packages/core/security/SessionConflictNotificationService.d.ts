/**
 * Session Conflict Notification Service
 *
 * Comprehensive notification system for session conflicts, providing real-time
 * alerts, user notifications, and administrative alerts for session management
 * conflicts and security events.
 *
 * Features:
 * - Real-time session conflict notifications
 * - Multiple notification channels (email, SMS, push, in-app)
 * - Priority-based notification routing
 * - User choice prompts for conflict resolution
 * - Administrative alerts for security events
 * - Notification templates and customization
 * - Delivery tracking and retry mechanisms
 * - Rate limiting and notification batching
 */
import { EventEmitter } from 'events';
import { SessionConflict, SessionPriority, ConflictResolution } from './SessionPriorityManager';
export declare enum NotificationType {
    SESSION_CONFLICT = "session_conflict",
    SESSION_EVICTED = "session_evicted",
    EMERGENCY_OVERRIDE = "emergency_override",
    GRACE_PERIOD_OFFERED = "grace_period_offered",
    GRACE_PERIOD_EXPIRING = "grace_period_expiring",
    MULTIPLE_LOGINS = "multiple_logins",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    SECURITY_ALERT = "security_alert",
    DEVICE_CONFLICT = "device_conflict",
    LOCATION_CONFLICT = "location_conflict"
}
export declare enum NotificationChannel {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app",
    WEBHOOK = "webhook",
    SLACK = "slack",
    TEAMS = "teams"
}
export declare enum NotificationPriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    CRITICAL = "critical",
    EMERGENCY = "emergency"
}
export declare enum DeliveryStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    BOUNCED = "bounced",
    READ = "read",
    CLICKED = "clicked",
    EXPIRED = "expired"
}
export interface NotificationConfig {
    channels: NotificationChannel[];
    priority: NotificationPriority;
    retryAttempts: number;
    retryDelay: number;
    expirationTime: number;
    batchingEnabled: boolean;
    batchSize: number;
    batchDelay: number;
    rateLimitWindow: number;
    rateLimitCount: number;
    templateCustomization: boolean;
}
export interface UserNotificationPreferences {
    userId: string;
    channels: {,
        [key in NotificationChannel]: {
            enabled: boolean;
            address?: string;
            quietHours?: {
                start: string;
                end: string;
                timezone: string;
            };
        };
    };
    conflictResolution: {,
        autoResolve: boolean;
        preferredResolution: ConflictResolution;
        requireConfirmation: boolean;
        timeoutMinutes: number;
    };
    securityAlerts: {,
        enabledTypes: NotificationType[];
        minimumPriority: NotificationPriority;
    };
}
export interface NotificationMessage {
    id: string;
    type: NotificationType;
    priority: NotificationPriority;
    userId: string;
    sessionId?: string;
    title: string;
    message: string;
    actionRequired: boolean;
    actions?: NotificationAction[];
    data: Record<string, any>;
    channels: NotificationChannel[];
    createdAt: Date;
    expiresAt: Date;
    deliveryStatus: {,
        [key in NotificationChannel]?: {
            status: DeliveryStatus;
            attempts: number;
            lastAttempt?: Date;
            deliveredAt?: Date;
            error?: string;
        };
    };
    metadata: {,
        conflictId?: string;
        sessionPriority?: SessionPriority;
        deviceInfo?: any;
        locationInfo?: any;
    };
}
export interface NotificationAction {
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    action: string;
    data?: Record<string, any>;
    requiresConfirmation?: boolean;
    timeout?: number;
}
export interface NotificationTemplate {
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    body: string;
    variables: string[];
    actionTemplates?: {
        [actionId: string]: {
            label: string;
            type: NotificationAction['type'];
        };
    };
}
export interface ConflictResolutionResponse {
    conflictId: string;
    userId: string;
    resolution: ConflictResolution;
    selectedSessionId?: string;
    confirmed: boolean;
    timestamp: Date;
}
export interface NotificationStats {
    totalSent: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    failureRate: number;
    channelStats: {,
        [key in NotificationChannel]: {
            sent: number;
            delivered: number;
            failed: number;
            avgDeliveryTime: number;
        };
    };
    typeStats: {,
        [key in NotificationType]: {
            sent: number;
            actionTaken: number;
            ignored: number;
            expired: number;
        };
    };
}
/**
 * Comprehensive session conflict notification service
 */
export declare class SessionConflictNotificationService extends EventEmitter {
    private userPreferences;
    private notifications;
    private templates;
    private conflictResponses;
    private rateLimits;
    private config;
    private batchQueue;
    private batchTimer?;
    private cleanupTimer?;
    constructor(config?: Partial<NotificationConfig>);
    /**
     * Send session conflict notification
     */
    sendConflictNotification(conflict: SessionConflict, affectedUserIds: string[]): Promise<{
        sent: string[];
        failed: string[];
    }>;
    /**
     * Send session eviction notification
     */
    sendEvictionNotification()
      sessionId: string,
      userId: string,
      reason: string,
      gracePeriodMinutes?: number
    ): Promise<boolean>;
    /**
     * Send emergency override notification
     */
    sendEmergencyOverrideNotification()
      adminUserId: string,
      targetUserId: string,
      evictedSessions: string[],
    ): Promise<boolean>;
    /**
     * Prompt user for conflict resolution choice
     */
    promptUserChoice()
      conflict: SessionConflict,
      userId: string,
      timeoutMinutes?: number
    ): Promise<ConflictResolutionResponse | null>;
    /**
     * Handle user response to conflict notification
     */
    handleConflictResponse(response: ConflictResolutionResponse): void;
    /**
     * Set user notification preferences
     */
    setUserPreferences(preferences: UserNotificationPreferences): void;
    /**
     * Get user notification preferences
     */
    getUserPreferences(userId: string): UserNotificationPreferences;
    /**
     * Send grace period expiration warning
     */
    sendGracePeriodWarning(sessionId: string, userId: string, minutesRemaining: number): Promise<boolean>;
    /**
     * Get notification statistics
     */
    getStatistics(): NotificationStats;
    /**
     * Get pending notifications for a user
     */
    getUserNotifications(userId: string): NotificationMessage[];
    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string, channel: NotificationChannel): void;
    /**
     * Handle notification action click
     */
    handleNotificationAction()
      notificationId: string,
      actionId: string,
      userId: string,
      data?: Record<string,
      any>
    ): void;
    private mergeConfig;
    private initializeTemplates;
    private sendNotification;
    private addToBatch;
    private deliverNotification;
    private deliverToChannel;
    private sendEmail;
    private sendSMS;
    private sendPush;
    private sendInApp;
    private sendWebhook;
    private sendSlack;
    private sendTeams;
    private createConflictNotification;
    private createEvictionNotification;
    private createEmergencyOverrideNotification;
    private createChoicePromptNotification;
    private createGracePeriodWarningNotification;
    private getDefaultPreferences;
    private getEnabledChannels;
    private mapSeverityToPriority;
    private getResolutionLabel;
    private isRateLimited;
    private updateRateLimit;
    private handleConflictAction;
    private startBatchProcessor;
    private processBatch;
    private startCleanupTimer;
    private cleanupExpiredNotifications;
    /**
     * Destroy the notification service and clean up resources
     */
    destroy(): void;
}
export declare const sessionConflictNotificationService: SessionConflictNotificationService;
export default SessionConflictNotificationService;
//# sourceMappingURL=SessionConflictNotificationService.d.ts.map