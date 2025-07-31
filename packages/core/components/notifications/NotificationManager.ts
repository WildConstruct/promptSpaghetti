/**
 * Epic 9.2.5 - Notification Manager
 * Manages notification delivery, preferences, and real-time updates
 */
import { Notification } from './NotificationCenter';

}
export interface NotificationPreferences {
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  // Event type preferences
  comments: {
  enabled: boolean;
  channels: ('in_app' | 'email' | 'push')[];
  mentions_only: boolean;
}
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
  // Timing preferences
  quiet_hours: {
  enabled: boolean;
  start_time: string; // HH:MM format,
  end_time: string;
  timezone: string;
};
  digest: {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  time: string; // HH:MM format,
};
}
}
export interface NotificationFilter {
  filter: 'all' | 'unread' | 'mentions' | 'workspace';
  sort_by: 'newest' | 'priority' | 'type';
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}
}
}
export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}
  by_day: { date: string; count: number }[];
}
export class NotificationManager {
  private notifications = new Map<string, Notification>();
  private preferences: NotificationPreferences | null = null;
  private wsConnection: WebSocket | null = null;
  private listeners = new Set<(notification: Notification) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  constructor(private apiClient: unknown, private userId: string) {
    this.initializeWebSocket();
    this.loadPreferences();
  // Real-time notification handling
  private initializeWebSocket() {
    try {
      const wsUrl = `ws://localhost:8000/ws/notifications/${this.userId}`;}
      this.wsConnection = new WebSocket(wsUrl);
      this.wsConnection.onopen = () => {
        console.log('Notification WebSocket connected');
        this.reconnectAttempts = 0;
      };
      this.wsConnection.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          this.handleIncomingNotification(notification);
        } catch (error) {
  console.error('Failed to parse notification:', error);
};
      this.wsConnection.onclose = () => {
        console.log('Notification WebSocket disconnected');
        this.attemptReconnect();
      };
      this.wsConnection.onerror = (error) => {
  console.error('Notification WebSocket error:', error);
};
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => {
        console.log(`Attempting notification WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);}
        this.initializeWebSocket();
      }, delay);
  private handleIncomingNotification(notification: Notification) {
  // Store notification
  this.notifications.set(notification.id, notification);
  // Check if notification should be shown based on preferences
  if (this.shouldShowNotification(notification)) {
  // Show browser notification if supported and enabled
  this.showBrowserNotification(notification);
  // Notify listeners
  this.listeners.forEach(listener => listener(notification));
  private shouldShowNotification(notification: Notification): boolean {,
  if (!this.preferences) return true;
  // Check global preferences
  if (!this.preferences.in_app_enabled && notification.delivery_channel === 'in_app') {
  return false;
  // Check quiet hours
  if (this.preferences.quiet_hours.enabled && this.isInQuietHours()) {
  // Only show urgent notifications during quiet hours
  return notification.priority === 'urgent';
  // Check type-specific preferences
  const typePrefs = this.getTypePreferences(notification.notification_type);
  if (!typePrefs?.enabled) {
  return false;
  return true;
  private isInQuietHours(): boolean {,
  if (!this.preferences?.quiet_hours.enabled) return false;
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format;
  const startTime = this.preferences.quiet_hours.start_time;
  const endTime = this.preferences.quiet_hours.end_time;
  // Handle overnight quiet hours (e.g., 22:00 to 08:00),
  if (startTime > endTime) {
  return currentTime >= startTime || currentTime <= endTime;
} else {
  return currentTime >= startTime && currentTime <= endTime;
  private getTypePreferences(notificationType: string) {,
  if (!this.preferences) return null;
  switch (notificationType) {
  case 'comment':,
  case 'mention':,
  return this.preferences.comments;
  case 'collaboration':,
  return this.preferences.collaboration;
  case 'workspace':,
  return this.preferences.workspace;
  case 'approval':,
  case 'rejection':,
  return this.preferences.approvals;
  case 'system':,
  return this.preferences.system;
  default:,
  return null;
  private showBrowserNotification(notification: Notification) {,
  if (!('Notification' in window) || Notification.permission !== 'granted') {
  return;
  const browserNotification = new Notification(notification.title, {)
  body: notification.message,
  icon: '/favicon.ico',
  tag: notification.id,
  requireInteraction: notification.priority === 'urgent',
});
    browserNotification.onclick = () => {
      window.focus();
      if (notification.action_url) {
        window.location.href = notification.action_url;
      browserNotification.close();
    };
    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      setTimeout(() => browserNotification.close(), 5000);
  // Public API methods
  async getNotifications(filter: NotificationFilter): Promise<{ notifications: Notification; total: number; unread_count: number }> {

    try {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
      });
      const response = await this.apiClient.get(`/api/notifications?${params}`);}
      const result = response.data;
      // Update local cache
      result.notifications.forEach((notification: Notification) => {
        this.notifications.set(notification.id, notification);
      });
      return result;
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error;
  async markAsRead(notificationId: string): Promise<void> {

    try {
      await this.apiClient.put(`/api/notifications/${notificationId}/read`);}
      // Update local cache
      const notification = this.notifications.get(notificationId);
      if (notification) {
        notification.read_at = new Date().toISOString();
        this.notifications.set(notificationId, notification);
    } catch (error) {
  console.error('Failed to mark notification as read:', error);
  throw error;
  async markAllAsRead(notificationIds: string): Promise<void> {,
  try {
  await this.apiClient.put('/api/notifications/read-all', {)
  notification_ids: notificationIds,
});
      // Update local cache
      const now = new Date().toISOString();
      notificationIds.forEach(id => {)
  const notification = this.notifications.get(id);
        if (notification) {
          notification.read_at = now;
          this.notifications.set(id, notification);
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
  async deleteNotification(notificationId: string): Promise<void> {

    try {
      await this.apiClient.delete(`/api/notifications/${notificationId}`);}
      this.notifications.delete(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
  async getStats(days: number = 30): Promise<NotificationStats> {

    try {
      const response = await this.apiClient.get(`/api/notifications/stats?days=${days}`);}
      return response.data;
    } catch (error) {
  console.error('Failed to get notification stats:', error);
  throw error;
  // Preference management
  async getPreferences(): Promise<NotificationPreferences> {,
  try {
  const response = await this.apiClient.get('/api/notification-preferences');
  this.preferences = response.data;
  return this.preferences;
} catch (error) {
  console.error('Failed to get notification preferences:', error);
  throw error;
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {,
  try {
  const response = await this.apiClient.put('/api/notification-preferences', preferences);
  this.preferences = response.data;
  return this.preferences;
} catch (error) {
  console.error('Failed to update notification preferences:', error);
  throw error;
  private async loadPreferences() {
  try {
  await this.getPreferences();
} catch (error) {
  // Use default preferences if loading fails
  this.preferences = this.getDefaultPreferences();
  private getDefaultPreferences(): NotificationPreferences {,
  return {
  in_app_enabled: true,
  email_enabled: true,
  push_enabled: false,
  comments: {
  enabled: true,
  channels: ['in_app', 'email'],
  mentions_only: false,
},
  collaboration: {
  enabled: true,
  channels: ['in_app'],
  presence_updates: false,
},
  workspace: {
  enabled: true,
  channels: ['in_app', 'email'],
  member_changes: true,
},
  approvals: {
  enabled: true,
  channels: ['in_app', 'email'],
},
  system: {
  enabled: true,
  channels: ['in_app'],
  maintenance_only: true,
},
  quiet_hours: {
  enabled: false,
  start_time: '22:00',
  end_time: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
},
  digest: {
  enabled: false,
  frequency: 'daily',
  time: '09:00',
};
  // Event listeners
  onNotificationReceived(callback: (notification: Notification) => void): () => void {
  this.listeners.add(callback);
  return () => this.listeners.delete(callback);
  // Utility methods
  async requestPermission(): Promise<NotificationPermission> {,
  if (!('Notification' in window)) {
  return 'denied';
  if (Notification.permission === 'default') {
  return await Notification.requestPermission();
  return Notification.permission;
  getUnreadCount(): number {,
  return Array.from(this.notifications.values()).filter(n => !n.read_at).length;
  // Send notification (for testing/admin purposes)
  async sendNotification(notification: Omit<Notification, 'id' | 'user_id' | 'delivered_at'>): Promise<void> {,
  try {
  await this.apiClient.post('/api/notifications', notification);
} catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
  // Cleanup
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    this.listeners.clear();