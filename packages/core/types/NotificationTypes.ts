export type NotificationType = 
  | 'comment'
  | 'mention' 
  | 'approval'
  | 'workflow'
  | 'collaboration'
  | 'system';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationStatus = 'unread' | 'read' | 'archived';

}
export interface Notification {
  id: string;
  user_id: string;
  workspace_id?: string;
  project_id?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url?: string;
  metadata?: {
  actor_id?: string;
  actor_name?: string;
  project_name?: string;
  workspace_name?: string;
  resource_id?: string;
  resource_name?: string;
  [key: string]: any;
}
};
  read_at?: string;
  created_at: string;
  updated_at: string;
}
}
export interface NotificationPreferences {
  user_id: string;
  workspace_id?: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  type_preferences: {
  [key in NotificationType]?: {
  in_app?: boolean;
  email?: boolean;
  push?: boolean;
}
};
  };
  quiet_hours: {
  enabled: boolean;
  start: string; // HH:MM format,
  end: string;   // HH:MM format,
  timezone: string;
};
  digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  created_at?: string;
  updated_at?: string;
}
}
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  name: string;
  title_template: string;
  message_template: string;
  variables: string;
  default_priority: NotificationPriority;
  created_at: string;
  updated_at: string;
}
}
}
export interface NotificationDeliveryLog {
  id: string;
  notification_id: string;
  delivery_method: 'in_app' | 'email' | 'push';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
  delivered_at?: string;
  created_at: string;
}
}
}
export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<NotificationPriority, number>;
  recent_activity: {
  today: number;
  this_week: number;
  this_month: number;
}
};
}
}
export interface RealTimeNotificationConnection {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string;
  // Event types for real-time notifications
}
}
}
export interface NotificationEvent {
  type: 'notification_created' | 'notification_updated' | 'notification_deleted';
  notification: Notification;
  timestamp: string;
  // API response types
}
}
}
export interface NotificationListResponse {
  notifications: Notification;
  total: number;
  unread_count: number;
  has_more: boolean;
  next_cursor?: string;
}
}
}
export interface NotificationCreateRequest {
  user_id: string;
  workspace_id?: string;
  project_id?: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, any>;
  // Hook return types
}
}
}
export interface UseNotificationsReturn {
  notifications: Notification;
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  stats: NotificationStats | null;
  realTimeConnection: RealTimeNotificationConnection | null;
  // Actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loadMore: () => Promise<void>;
  // Filters
  setFilter: (filter: NotificationType | 'all') => void;
  setUnreadOnly: (unreadOnly: boolean) => void;
}
}