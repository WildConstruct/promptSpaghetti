export interface NotificationPreferences {
    in_app_enabled: boolean;
    email_enabled: boolean;
    push_enabled: boolean;
    comments: {
        enabled: boolean;
        channels: ('in_app' | 'email' | 'push')[];
        mentions_only: boolean;
    };
    collaboration: {
        enabled: boolean;
        channels: ('in_app' | 'email' | 'push')[];
        presence_updates: boolean;
    };
    workspace: {
        enabled: boolean;
        channels: ('in_app' | 'email' | 'push')[];
        member_changes: boolean;
    };
    approvals: {
        enabled: boolean;
        channels: ('in_app' | 'email' | 'push')[];
    };
    system: {
        enabled: boolean;
        channels: ('in_app' | 'email' | 'push')[];
        maintenance_only: boolean;
    };
    quiet_hours: {
        enabled: boolean;
        start_time: string;
        end_time: string;
        timezone: string;
    };
    digest: {
        enabled: boolean;
        frequency: 'hourly' | 'daily' | 'weekly';
        time: string;
    };
}
export interface NotificationFilter {
    filter: 'all' | 'unread' | 'mentions' | 'workspace';
    sort_by: 'newest' | 'priority' | 'type';
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
}
export interface NotificationStats {
    total: number;
    unread: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
    by_day: {
        date: string;
        count: number;
    }[];
}
export declare class NotificationManager {
    private apiClient;
    private userId;
    private notifications;
    private preferences;
    private wsConnection;
    private listeners;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor(apiClient: unknown, userId: string);
    private initializeWebSocket;
    private attemptReconnect;
    private handleIncomingNotification;
    private shouldShowNotification;
    private isInQuietHours;
    private getTypePreferences;
    private showBrowserNotification;
}
//# sourceMappingURL=NotificationManager.d.ts.map