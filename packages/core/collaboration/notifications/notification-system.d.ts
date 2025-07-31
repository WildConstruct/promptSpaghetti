import { EventEmitter } from 'events';
import { WorkspaceId, ProjectId, UserId, ResourceId, NotificationType, Notification } from '../types/workspace';
import { WorkspaceDAO } from '../dao/workspace-dao';

}
export interface NotificationChannel {
    type: 'in_app' | 'email' | 'slack' | 'webhook';
    enabled: boolean;
    config: Record<string, unknown>;

}
export interface NotificationPreferences {
    userId: UserId;
    channels: NotificationChannel[];
    filters: NotificationFilter[];
    digest: {
        enabled: boolean;
        frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
        time?: string;
}
    };

}
export interface NotificationFilter {
    type: 'workspace' | 'project' | 'activity_type' | 'user';
    value: string;
    action: 'include' | 'exclude';

}
export interface NotificationTemplate {
    type: NotificationType;
    channels: {
        [channel: string]: {
            subject: string;
            body: string;
            metadata?: Record<string, unknown>;
}
        };
    };

}
export interface NotificationContext {
    workspaceId: WorkspaceId;
    projectId?: ProjectId;
    resourceId?: ResourceId;
    actorUserId: UserId;
    targetUserIds: UserId[];
    data: Record<string, unknown>;

}
export interface NotificationDelivery {
    id: string;
    notificationId: string;
    userId: UserId;
    channel: string;
    status: 'pending' | 'sent' | 'failed' | 'read';
    sentAt?: Date;
    readAt?: Date;
    error?: string;
    retryCount: number;

export declare class WorkspaceNotificationSystem extends EventEmitter {
    private dao;
    private preferences;
    private templates;
    private deliveryQueue;
    private digestQueue;
    private isProcessing;
    constructor(dao: WorkspaceDAO);
    private initializeTemplates;
    setUserPreferences(preferences: NotificationPreferences): Promise<void>;
    getUserPreferences(userId: UserId): NotificationPreferences;
    private getDefaultPreferences;
    notifyWorkspaceInvite(context: NotificationContext): Promise<void>;
    notifyProjectInvite(context: NotificationContext): Promise<void>;
    notifyCommentMention(context: NotificationContext): Promise<void>;
    notifyCommentReply(context: NotificationContext): Promise<void>;
    notifyResourceShared(context: NotificationContext): Promise<void>;
    notifyRoleChanged(context: NotificationContext): Promise<void>;
    sendActivityDigest(userId: UserId, workspaceId: WorkspaceId): Promise<void>;
    private sendNotification;
    private shouldSendNotification;
    private evaluateFilter;
    private shouldAddToDigest;
    private addToDigest;
    private queueDelivery;
    private processDeliveryQueue;
    private deliverNotification;
    private deliverEmail;
    private deliverSlack;
    private deliverWebhook;
    private renderTemplate;
    processDigests(): Promise<void>;
    private shouldSendDigest;
    private sendDigestForWorkspace;
    private getTimeAgo;
    markAsRead(notificationId: string): Promise<void>;
    getUnreadNotifications(userId: UserId): Promise<Notification[]>;
    private startDeliveryProcessor;
    shutdown(): Promise<void>;

//# sourceMappingURL=notification-system.d.ts.map
}