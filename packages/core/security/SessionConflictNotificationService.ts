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

// Notification Types
export enum NotificationType {
  SESSION_CONFLICT = 'session_conflict',
  SESSION_EVICTED = 'session_evicted',
  EMERGENCY_OVERRIDE = 'emergency_override',
  GRACE_PERIOD_OFFERED = 'grace_period_offered',
  GRACE_PERIOD_EXPIRING = 'grace_period_expiring',
  MULTIPLE_LOGINS = 'multiple_logins',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_ALERT = 'security_alert',
  DEVICE_CONFLICT = 'device_conflict',
  LOCATION_CONFLICT = 'location_conflict'
  export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  TEAMS = 'teams'
  export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
  export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  READ = 'read',
  CLICKED = 'clicked',
  EXPIRED = 'expired'
  // Notification Configuration
  export interface NotificationConfig {
  channels: NotificationChannel;
  priority: NotificationPriority;
  retryAttempts: number;
  retryDelay: number; // milliseconds,
  expirationTime: number; // milliseconds,
  batchingEnabled: boolean;
  batchSize: number;
  batchDelay: number; // milliseconds,
  rateLimitWindow: number; // milliseconds,
  rateLimitCount: number;
  templateCustomization: boolean;
  // User Notification Preferences
}
export interface UserNotificationPreferences {
  userId: string;
  channels: {
  [key in NotificationChannel]: {
  enabled: boolean;
  address?: string; // email, phone, device token,
  quietHours?: {
  start: string; // HH:MM format,
  end: string;
  timezone: string;
};
    };
  };
  conflictResolution: {
  autoResolve: boolean;
  preferredResolution: ConflictResolution;
  requireConfirmation: boolean;
  timeoutMinutes: number;
};
  securityAlerts: {
  enabledTypes: NotificationType;
  minimumPriority: NotificationPriority;
};

// Notification Message
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
  actions?: NotificationAction;
  data: Record<string, any>;
  channels: NotificationChannel;
  createdAt: Date;
  expiresAt: Date;
  deliveryStatus: {
  [key in NotificationChannel]?: {
  status: DeliveryStatus;
  attempts: number;
  lastAttempt?: Date;
  deliveredAt?: Date;
  error?: string;
};
  };
  metadata: {
  conflictId?: string;
  sessionPriority?: SessionPriority;
  deviceInfo?: any;
  locationInfo?: any;
};

// Notification Action
}
export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: string;
  data?: Record<string, any>;
  requiresConfirmation?: boolean;
  timeout?: number; // seconds,
  // Notification Template
}
export interface NotificationTemplate {
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  variables: string;
  actionTemplates?: {
  [actionId: string]: {
  label: string;
  type: NotificationAction['type'];
};
  };

// Conflict Resolution Response
}
export interface ConflictResolutionResponse {
  conflictId: string;
  userId: string;
  resolution: ConflictResolution;
  selectedSessionId?: string;
  confirmed: boolean;
  timestamp: Date;
  // Notification Statistics
}
export interface NotificationStats {
  totalSent: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  failureRate: number;
  channelStats: {
  [key in NotificationChannel]: {
  sent: number;
  delivered: number;
  failed: number;
  avgDeliveryTime: number;
};
  };
  typeStats: {
  [key in NotificationType]: {
  sent: number;
  actionTaken: number;
  ignored: number;
  expired: number;
};
  };
/**
 * Comprehensive session conflict notification service
 */
}
export class SessionConflictNotificationService extends EventEmitter {
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private notifications: Map<string, NotificationMessage> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private conflictResponses: Map<string, ConflictResolutionResponse> = new Map();
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private config: NotificationConfig;
  private batchQueue: Map<string, NotificationMessage> = new Map();
  private batchTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  constructor(config: Partial<NotificationConfig> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.initializeTemplates();
    this.startBatchProcessor();
    this.startCleanupTimer();
  /**
   * Send session conflict notification
   */
  public async sendConflictNotification(()
    conflict: SessionConflict,
    affectedUserIds: string,
  ): Promise<{ sent: string; failed: string }> {
  const sent: string = [];
  const failed: string = [];
  for (const userId of affectedUserIds) {
  try {
  const preferences = this.getUserPreferences(userId);
  // Create notification message
  const notification = this.createConflictNotification(conflict, userId, preferences);
  // Check rate limiting
  if (this.isRateLimited(userId)) {
  failed.push(userId);
  continue;
  // Send notification
  const success = await this.sendNotification(notification);
  if (success) {
  sent.push(userId);
} else {
          failed.push(userId);
        this.updateRateLimit(userId);
      } catch (error) {
        failed.push(userId);
        this.emit('notificationError', { userId, error: error instanceof Error ? error.message : 'Unknown error' });
    return { sent, failed };
  /**
   * Send session eviction notification
   */
  public async sendEvictionNotification()
    sessionId: string,
    userId: string,
    reason: string,
    gracePeriodMinutes?: number
  ): Promise<boolean> {
    try {
      const preferences = this.getUserPreferences(userId);
      const notification = this.createEvictionNotification(;);
        sessionId,
        userId,
        reason,
        gracePeriodMinutes,
        preferences
      );
      return await this.sendNotification(notification);
    } catch (error) {
  this.emit('notificationError', { )
  userId,
  sessionId,
  error: error instanceof Error ? error.message : 'Unknown error',
});
      return false;
  /**
   * Send emergency override notification
   */
  public async sendEmergencyOverrideNotification()
    adminUserId: string,
    targetUserId: string,
    evictedSessions: string): Promise<boolean> {,
    try {
      const preferences = this.getUserPreferences(targetUserId);
      const notification = this.createEmergencyOverrideNotification(;);
        adminUserId,
        targetUserId,
        evictedSessions,
        preferences
      );
      return await this.sendNotification(notification);
    } catch (error) {
  this.emit('notificationError', { )
  adminUserId,
  targetUserId,
  error: error instanceof Error ? error.message : 'Unknown error',
});
      return false;
  /**
   * Prompt user for conflict resolution choice
   */
  public async promptUserChoice()
    conflict: SessionConflict,
    userId: string,
    timeoutMinutes: number = 5): Promise<ConflictResolutionResponse | null> {,
  try {
  const preferences = this.getUserPreferences(userId);
  // Check if user has auto-resolution enabled
  if (preferences.conflictResolution.autoResolve) {
  return {
  conflictId: conflict.id,
  userId,
  resolution: preferences.conflictResolution.preferredResolution,
  confirmed: true,
  timestamp: new Date(),
};
      // Create interactive notification
      const notification = this.createChoicePromptNotification(;);
        conflict,
        userId,
        timeoutMinutes,
        preferences
      );
      await this.sendNotification(notification);
      // Wait for user response or timeout
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(null);
        }, timeoutMinutes * 60 * 1000);
        this.once(`conflictResponse:${conflict.id}`, (response: ConflictResolutionResponse) => {}
          clearTimeout(timeout);
          resolve(response);
        });
      });
    } catch (error) {
  this.emit('notificationError', { )
  userId,
  conflictId: conflict.id,
  error: error instanceof Error ? error.message : 'Unknown error',
});
      return null;
  /**
   * Handle user response to conflict notification
   */
  public handleConflictResponse(response: ConflictResolutionResponse): void {
    this.conflictResponses.set(response.conflictId, response);
    this.emit(`conflictResponse:${response.conflictId}`, response);}
    this.emit('conflictResolved', response);
  /**
   * Set user notification preferences
   */
  public setUserPreferences(preferences: UserNotificationPreferences): void {
    this.userPreferences.set(preferences.userId, preferences);
    this.emit('preferencesUpdated', { userId: preferences.userId });
  /**
   * Get user notification preferences
   */
  public getUserPreferences(userId: string): UserNotificationPreferences {
  return this.userPreferences.get(userId) || this.getDefaultPreferences(userId);
  /**
  * Send grace period expiration warning
  */
  public async sendGracePeriodWarning()
  sessionId: string,
  userId: string,
  minutesRemaining: number): Promise<boolean> {,
  try {
  const preferences = this.getUserPreferences(userId);
  const notification = this.createGracePeriodWarningNotification(;);
  sessionId,
  userId,
  minutesRemaining,
  preferences
  );
  return await this.sendNotification(notification);
} catch (error) {
  this.emit('notificationError', { )
  userId,
  sessionId,
  error: error instanceof Error ? error.message : 'Unknown error',
});
      return false;
  /**
   * Get notification statistics
   */
  public getStatistics(): NotificationStats {
    const notifications = Array.from(this.notifications.values());
    const stats: NotificationStats = {,
  totalSent: notifications.length,
      deliveryRate: 0,
      averageDeliveryTime: 0,
      failureRate: 0,
      channelStats: {} as any,
      typeStats: {} as any
    };
    // Initialize channel stats
    Object.values(NotificationChannel).forEach(channel => {)
  stats.channelStats[channel] = {
  sent: 0,
  delivered: 0,
  failed: 0,
  avgDeliveryTime: 0,
};
    });
    // Initialize type stats
    Object.values(NotificationType).forEach(type => {)
  stats.typeStats[type] = {
  sent: 0,
  actionTaken: 0,
  ignored: 0,
  expired: 0,
};
    });
    let totalDeliveryTime = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    // Calculate statistics
    notifications.forEach(notification => {)
  stats.typeStats[notification.type].sent++;
  Object.entries(notification.deliveryStatus).forEach(([channel, status]) => {
  const channelName = channel as NotificationChannel;
  stats.channelStats[channelName].sent++;
  switch (status.status) {
  case DeliveryStatus.DELIVERED:,
  case DeliveryStatus.READ:,
  case DeliveryStatus.CLICKED:,
  stats.channelStats[channelName].delivered++;
  deliveredCount++;
  if (status.deliveredAt) {
  const deliveryTime = status.deliveredAt.getTime() - notification.createdAt.getTime();
  totalDeliveryTime += deliveryTime;
  break;
  case DeliveryStatus.FAILED:,
  case DeliveryStatus.BOUNCED:,
  stats.channelStats[channelName].failed++;
  failedCount++;
  break;
});
      // Check if notification expired
      if (notification.expiresAt < new Date()) {
        stats.typeStats[notification.type].expired++;
    });
    stats.deliveryRate = notifications.length > 0 ? (deliveredCount / notifications.length) * 100 : 0;
    stats.failureRate = notifications.length > 0 ? (failedCount / notifications.length) * 100 : 0;
    stats.averageDeliveryTime = deliveredCount > 0 ? totalDeliveryTime / deliveredCount : 0;
    return stats;
  /**
   * Get pending notifications for a user
   */
  public getUserNotifications(userId: string): NotificationMessage {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.expiresAt > new Date())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string, channel: NotificationChannel): void {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.deliveryStatus[channel]) {
      notification.deliveryStatus[channel]!.status = DeliveryStatus.READ;
      notification.deliveryStatus[channel]!.deliveredAt = new Date();
      this.emit('notificationRead', { notificationId, channel, userId: notification.userId });
  /**
   * Handle notification action click
   */
  public handleNotificationAction(notificationId: string)
    actionId: string,
    userId: string,
    data?: Record<string, any>
  ): void {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return;
    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) {
      return;
    // Mark as clicked
    Object.keys(notification.deliveryStatus).forEach(channel => {)
  if (notification.deliveryStatus[channel as NotificationChannel]) {
        notification.deliveryStatus[channel as NotificationChannel]!.status = DeliveryStatus.CLICKED;
    });
    this.emit('notificationActionClicked', {)
  notificationId,
      actionId,
      userId,
      action,
      data: { ...action.data, ...data }
    });
    // Handle conflict resolution actions
    if (notification.type === NotificationType.SESSION_CONFLICT && notification.metadata.conflictId) {
  this.handleConflictAction(notification.metadata.conflictId, actionId, userId, data);
  // Private helper methods
  private mergeConfig(config: Partial<NotificationConfig>): NotificationConfig {,
  return {
  channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  priority: NotificationPriority.NORMAL,
  retryAttempts: 3,
  retryDelay: 30000, // 30 seconds,
  expirationTime: 24 * 60 * 60 * 1000, // 24 hours,
  batchingEnabled: true,
  batchSize: 10,
  batchDelay: 5000, // 5 seconds,
  rateLimitWindow: 60 * 1000, // 1 minute,
  rateLimitCount: 10,
  templateCustomization: true,
  ...config
};
  private initializeTemplates(): void {
    // Session conflict template
    this.templates.set(`${NotificationType.SESSION_CONFLICT}_${NotificationChannel.EMAIL}`, {)}
  },
  type: NotificationType.SESSION_CONFLICT,
      channel: NotificationChannel.EMAIL,
      title: 'Session Conflict Detected',
      body: 'A session conflict has been detected for your account. {{conflictDetails}}',
      variables: ['conflictDetails', 'resolutionOptions'],
      actionTemplates: {
        'resolve_keep_current': { label: 'Keep Current Session', type: 'primary' },
        'resolve_keep_new': { label: 'Use New Session', type: 'secondary' },
        'resolve_keep_all': { label: 'Allow Both Sessions', type: 'secondary' }
    });
    // Session eviction template
    this.templates.set(`${NotificationType.SESSION_EVICTED}_${NotificationChannel.IN_APP}`, {)}
  },
  type: NotificationType.SESSION_EVICTED,
      channel: NotificationChannel.IN_APP,
      title: 'Session Ended',
      body: 'Your session has been ended due to {{reason}}. {{gracePeriodInfo}}',
      variables: ['reason', 'gracePeriodInfo'],
      actionTemplates: {
        'extend_session': { label: 'Extend Session', type: 'primary' },
        'login_again': { label: 'Login Again', type: 'secondary' }
    });
    // Add more templates...
  private async sendNotification(notification: NotificationMessage): Promise<boolean> {
    this.notifications.set(notification.id, notification);
    if (this.config.batchingEnabled) {
      return this.addToBatch(notification);
    } else {
      return this.deliverNotification(notification);
  private addToBatch(notification: NotificationMessage): boolean {
    const batchKey = `${notification.userId}_${notification.priority}`;}
    if (!this.batchQueue.has(batchKey)) {
  this.batchQueue.set(batchKey, []);
  this.batchQueue.get(batchKey)!.push(notification);
  // Process batch if it reaches the size limit
  if (this.batchQueue.get(batchKey)!.length >= this.config.batchSize) {
  this.processBatch(batchKey);
  return true;
  private async deliverNotification(notification: NotificationMessage): Promise<boolean> {,
  let allSuccessful = true;
  for (const channel of notification.channels) {
  try {
  notification.deliveryStatus[channel] = {
  status: DeliveryStatus.PENDING,
  attempts: 0,
};
        const success = await this.deliverToChannel(notification, channel);
        notification.deliveryStatus[channel]!.status = success ? DeliveryStatus.SENT : DeliveryStatus.FAILED;
        notification.deliveryStatus[channel]!.attempts = 1;
        notification.deliveryStatus[channel]!.lastAttempt = new Date();
        if (success) {
          notification.deliveryStatus[channel]!.deliveredAt = new Date();
        } else {
          allSuccessful = false;
      } catch (error) {
  notification.deliveryStatus[channel]!.status = DeliveryStatus.FAILED;
  notification.deliveryStatus[channel]!.error = error instanceof Error ? error.message : 'Unknown error';
  allSuccessful = false;
  this.emit('notificationDelivered', { )
  notificationId: notification.id,
  success: allSuccessful,
  channels: notification.channels,
});
    return allSuccessful;
  private async deliverToChannel(notification: NotificationMessage, channel: NotificationChannel): Promise<boolean> {
  // In a real implementation, this would integrate with actual delivery services
  switch (channel) {
  case NotificationChannel.EMAIL:,
  return this.sendEmail(notification);
  case NotificationChannel.SMS:,
  return this.sendSMS(notification);
  case NotificationChannel.PUSH:,
  return this.sendPush(notification);
  case NotificationChannel.IN_APP:,
  return this.sendInApp(notification);
  case NotificationChannel.WEBHOOK:,
  return this.sendWebhook(notification);
  case NotificationChannel.SLACK:,
  return this.sendSlack(notification);
  case NotificationChannel.TEAMS:,
  return this.sendTeams(notification);
  default:,
  return false;
  private async sendEmail(notification: NotificationMessage): Promise<boolean> {,
  // Mock email delivery
  this.emit('emailSent', { )
  to: 'user@example.com',
  subject: notification.title,
  body: notification.message,
});
    return true;
  private async sendSMS(notification: NotificationMessage): Promise<boolean> {
    // Mock SMS delivery
    this.emit('smsSent', { )
      to: '+1234567890', 
      message: `${notification.title}: ${notification.message}` }
    });
    return true;
  private async sendPush(notification: NotificationMessage): Promise<boolean> {
  // Mock push notification delivery
  this.emit('pushSent', { )
  deviceToken: 'device_token',
  title: notification.title,
  body: notification.message,
});
    return true;
  private async sendInApp(notification: NotificationMessage): Promise<boolean> {
  // In-app notifications are handled by the UI
  this.emit('inAppNotification', notification);
  return true;
  private async sendWebhook(notification: NotificationMessage): Promise<boolean> {,
  // Mock webhook delivery
  this.emit('webhookSent', { )
  url: 'https://webhook.example.com',
  payload: notification,
});
    return true;
  private async sendSlack(notification: NotificationMessage): Promise<boolean> {
    // Mock Slack delivery
    this.emit('slackSent', { )
      channel: '#alerts', 
      message: `${notification.title}: ${notification.message}` }
    });
    return true;
  private async sendTeams(notification: NotificationMessage): Promise<boolean> {
    // Mock Teams delivery
    this.emit('teamsSent', { )
      channel: 'Security Alerts', 
      message: `${notification.title}: ${notification.message}` }
    });
    return true;
  private createConflictNotification(conflict: SessionConflict)
    userId: string,
    preferences: UserNotificationPreferences): NotificationMessage {,
    const actions: NotificationAction = [];
    conflict.resolutionOptions.forEach((option, index) => {
      actions.push({)
  id: `resolve_${option}`}
},
  label: this.getResolutionLabel(option),
        type: index === 0 ? 'primary' : 'secondary',
        action: 'resolve_conflict',
        data: { resolution: option, conflictId: conflict.id }
      });
    });
    return {
      id: `conflict_${conflict.id}_${Date.now()}`}
},
  type: NotificationType.SESSION_CONFLICT,
      priority: this.mapSeverityToPriority(conflict.severity),
      userId,
      title: 'Session Conflict Detected',
      message: `A ${conflict.type.replace('_', ' ')} conflict has been detected. Please choose how to resolve it.`}
},
  actionRequired: true,
      actions,
      data: { conflict },
      channels: this.getEnabledChannels(preferences),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + conflict.timeoutMinutes * 60 * 1000),
      deliveryStatus: {},
      metadata: {
  conflictId: conflict.id,
  sessionPriority: conflict.newSessionRequest.priority,
};
  private createEvictionNotification(sessionId: string)
    userId: string,
    reason: string,
    gracePeriodMinutes: number | undefined,
    preferences: UserNotificationPreferences): NotificationMessage {,
    const actions: NotificationAction = [];
    if (gracePeriodMinutes) {
      actions.push({)
  id: 'extend_session',
        label: 'Extend Session',
        type: 'primary',
        action: 'extend_session',
        data: { sessionId },
        timeout: gracePeriodMinutes * 60;
  });
    actions.push({)
  id: 'login_again',
      label: 'Login Again',
      type: 'secondary',
      action: 'redirect_login',
      data: {}
    });
    return {
      id: `eviction_${sessionId}_${Date.now()}`}
},
  type: NotificationType.SESSION_EVICTED,
      priority: NotificationPriority.HIGH,
      userId,
      sessionId,
      title: 'Session Ended',
      message: `Your session has been ended due to ${reason}.${gracePeriodMinutes ? ` You have ${gracePeriodMinutes} minutes to extend it.` : ''}`}
},
  actionRequired: !!gracePeriodMinutes,
      actions,
      data: { reason, gracePeriodMinutes },
      channels: this.getEnabledChannels(preferences),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (gracePeriodMinutes ? gracePeriodMinutes * 60 * 1000 : this.config.expirationTime)),
      deliveryStatus: {},
      metadata: {}
    };
  private createEmergencyOverrideNotification(adminUserId: string)
    targetUserId: string,
    evictedSessions: string,
    preferences: UserNotificationPreferences): NotificationMessage {,
    return {
      id: `emergency_${targetUserId}_${Date.now()}`}
},
  type: NotificationType.EMERGENCY_OVERRIDE,
      priority: NotificationPriority.EMERGENCY,
      userId: targetUserId,
      title: 'Emergency Session Override',
      message: `An administrator has initiated an emergency session override. ${evictedSessions.length} of your sessions have been terminated.`}
},
  actionRequired: false,
      data: { adminUserId, evictedSessions },
      channels: this.getEnabledChannels(preferences),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.expirationTime),
      deliveryStatus: {},
      metadata: {}
    };
  private createChoicePromptNotification(conflict: SessionConflict)
    userId: string,
    timeoutMinutes: number,
    preferences: UserNotificationPreferences): NotificationMessage {,
    const actions: NotificationAction = conflict.resolutionOptions.map((option, index) => ({)
  id: `choice_${option}`}
},
  label: this.getResolutionLabel(option),
      type: index === 0 ? 'primary' : 'secondary',
      action: 'user_choice',
      data: { resolution: option, conflictId: conflict.id },
      requiresConfirmation: preferences.conflictResolution.requireConfirmation,
      timeout: timeoutMinutes * 60;
  }));
    return {
      id: `choice_${conflict.id}_${Date.now()}`}
},
  type: NotificationType.SESSION_CONFLICT,
      priority: NotificationPriority.HIGH,
      userId,
      title: 'Session Conflict - Your Choice Required',
      message: `A session conflict requires your decision. You have ${timeoutMinutes} minutes to choose.`}
},
  actionRequired: true,
      actions,
      data: { conflict, timeoutMinutes },
      channels: this.getEnabledChannels(preferences),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + timeoutMinutes * 60 * 1000),
      deliveryStatus: {},
      metadata: {
  conflictId: conflict.id,
};
  private createGracePeriodWarningNotification(sessionId: string)
    userId: string,
    minutesRemaining: number,
    preferences: UserNotificationPreferences): NotificationMessage {,
    return {
      id: `grace_warning_${sessionId}_${Date.now()}`}
},
  type: NotificationType.GRACE_PERIOD_EXPIRING,
      priority: NotificationPriority.HIGH,
      userId,
      sessionId,
      title: 'Session Grace Period Expiring',
      message: `Your session grace period expires in ${minutesRemaining} minutes. Take action to keep your session active.`}
},
  actionRequired: true,
      actions: [,
        {
          id: 'extend_session',
          label: 'Extend Session',
          type: 'primary',
          action: 'extend_session',
          data: { sessionId }
      ],
      data: { minutesRemaining },
      channels: this.getEnabledChannels(preferences),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + minutesRemaining * 60 * 1000),
      deliveryStatus: {},
      metadata: {}
    };
  private getDefaultPreferences(userId: string): UserNotificationPreferences {
    return {
      userId,
      channels: {
        [NotificationChannel.EMAIL]: { enabled: true },
        [NotificationChannel.SMS]: { enabled: false },
        [NotificationChannel.PUSH]: { enabled: true },
        [NotificationChannel.IN_APP]: { enabled: true },
        [NotificationChannel.WEBHOOK]: { enabled: false },
        [NotificationChannel.SLACK]: { enabled: false },
        [NotificationChannel.TEAMS]: { enabled: false }
  },
  conflictResolution: {
  autoResolve: false,
  preferredResolution: ConflictResolution.PROMPT_USER,
  requireConfirmation: true,
  timeoutMinutes: 5,
},
  securityAlerts: {
  enabledTypes: [,
  NotificationType.SESSION_CONFLICT,
  NotificationType.SESSION_EVICTED,
  NotificationType.EMERGENCY_OVERRIDE,
  NotificationType.SUSPICIOUS_ACTIVITY
  ],
  minimumPriority: NotificationPriority.NORMAL,
};
  private getEnabledChannels(preferences: UserNotificationPreferences): NotificationChannel {
  return Object.entries(preferences.channels)
  .filter(([_, config]) => config.enabled)
  .map(([channel]) => channel as NotificationChannel);
  private mapSeverityToPriority(severity: string): NotificationPriority {,
  switch (severity) {
  case 'critical': return NotificationPriority.CRITICAL;
  case 'high': return NotificationPriority.HIGH;
  case 'medium': return NotificationPriority.NORMAL;
  case 'low': return NotificationPriority.LOW;
  default: return NotificationPriority.NORMAL;
  private getResolutionLabel(resolution: ConflictResolution): string {,
  switch (resolution) {
  case ConflictResolution.REJECT_NEW: return 'Keep Current Session';
  case ConflictResolution.EVICT_OLDEST: return 'Use Newest Session';
  case ConflictResolution.EVICT_LOWEST_PRIORITY: return 'Use Highest Priority';
  case ConflictResolution.PROMPT_USER: return 'Let Me Choose';
  case ConflictResolution.MERGE_SESSIONS: return 'Merge Sessions';
  default: return 'Resolve Automatically';
  private isRateLimited(userId: string): boolean {,
  const now = Date.now();
  const userLimit = this.rateLimits.get(userId);
  if (!userLimit) {
  return false;
  if (now > userLimit.resetTime) {
  this.rateLimits.delete(userId);
  return false;
  return userLimit.count >= this.config.rateLimitCount;
  private updateRateLimit(userId: string): void {,
  const now = Date.now();
  const userLimit = this.rateLimits.get(userId);
  if (!userLimit || now > userLimit.resetTime) {
  this.rateLimits.set(userId, {)
  count: 1,
  resetTime: now + this.config.rateLimitWindow,
});
    } else {
  userLimit.count++;
  private handleConflictAction(conflictId: string)
  actionId: string,
  userId: string,
  data?: Record<string, any>): void {,
  if (actionId.startsWith('resolve_') || actionId.startsWith('choice_')) {
  const resolution = data?.resolution as ConflictResolution;
  if (resolution) {
  const response: ConflictResolutionResponse = {,
  conflictId,
  userId,
  resolution,
  selectedSessionId: data?.sessionId,
  confirmed: true,
  timestamp: new Date(),
};
        this.handleConflictResponse(response);
  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      for (const [batchKey] of this.batchQueue) {
        this.processBatch(batchKey);
    }, this.config.batchDelay);
  private processBatch(batchKey: string): void {
    const notifications = this.batchQueue.get(batchKey);
    if (!notifications || notifications.length === 0) {
      return;
    this.batchQueue.delete(batchKey);
    // Process each notification in the batch
    notifications.forEach(notification => {)
  this.deliverNotification(notification);
    });
    this.emit('batchProcessed', { batchKey, count: notifications.length });
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 60 * 60 * 1000); // Run every hour
  private cleanupExpiredNotifications(): void {
  const now = new Date();
  const expiredIds: string = [];
  for (const [id, notification] of this.notifications) {
  if (notification.expiresAt < now) {
  expiredIds.push(id);
  expiredIds.forEach(id => {)
  this.notifications.delete(id);
});
    // Clean up old conflict responses (keep for 24 hours)
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const expiredResponses: string = [];
    for (const [id, response] of this.conflictResponses) {
      if (response.timestamp < dayAgo) {
        expiredResponses.push(id);
    expiredResponses.forEach(id => {)
  this.conflictResponses.delete(id);
    });
    this.emit('cleanupCompleted', {)
  expiredNotifications: expiredIds.length,
  expiredResponses: expiredResponses.length,
});
  /**
   * Destroy the notification service and clean up resources
   */
  public destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    this.notifications.clear();
    this.userPreferences.clear();
    this.templates.clear();
    this.conflictResponses.clear();
    this.rateLimits.clear();
    this.batchQueue.clear();
    this.emit('destroyed');

// Export default instance
export const sessionConflictNotificationService = new SessionConflictNotificationService();

export default SessionConflictNotificationService;