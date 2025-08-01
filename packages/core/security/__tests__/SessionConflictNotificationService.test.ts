/**
 * Test Suite for Session Conflict Notification Service
 * 
 * Tests comprehensive notification system for session conflicts including
 * multi-channel delivery, user preferences, conflict resolution, and analytics.
 */
import { SessionConflictNotificationService,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  DeliveryStatus,
  NotificationConfig,
  UserNotificationPreferences,
  NotificationMessage }
  ConflictResolutionResponse
 from '../SessionConflictNotificationService';
import { SessionConflict,
  SessionPriority,
  ConflictResolution }
  PriorityFactors
 from '../SessionPriorityManager';
describe('SessionConflictNotificationService', () => { let service: SessionConflictNotificationService;
  beforeEach(() => {
  service = new SessionConflictNotificationService({)
  batchingEnabled: false, // Disable batching for tests,
  retryAttempts: 1,
  retryDelay: 100 }
});
  });
  afterEach(() => { service.destroy() });
  describe('Service Initialization', () => { test('should initialize with default configuration', () => {
      const defaultService = new SessionConflictNotificationService();
      expect(defaultService).toBeDefined();
      defaultService.destroy() });
    test('should initialize with custom configuration', () => { const customConfig: Partial<NotificationConfig> = {
  channels: [NotificationChannel.EMAIL, NotificationChannel.SMS]
  priority: NotificationPriority.HIGH
  retryAttempts: 5
  batchingEnabled: true
  rateLimitCount: 20 }
};
      const customService = new SessionConflictNotificationService(customConfig);
      expect(customService).toBeDefined();
      customService.destroy();
    });
  });
  describe('User Preferences Management', () => { test('should set and get user preferences', () => {
      const userId = 'user-123';
      const preferences: UserNotificationPreferences = {
        userId }
        channels: {
          [NotificationChannel.EMAIL]: { enabled: true, address: 'user@test.com' }
          [NotificationChannel.SMS]: { enabled: false }
          [NotificationChannel.PUSH]: { enabled: true }
          [NotificationChannel.IN_APP]: { enabled: true }
          [NotificationChannel.WEBHOOK]: { enabled: false }
          [NotificationChannel.SLACK]: { enabled: false }
          [NotificationChannel.TEAMS]: { enabled: false }

  conflictResolution: { 
  autoResolve: false
  preferredResolution: ConflictResolution.PROMPT_USER
  requireConfirmation: true
  timeoutMinutes: 10 }

  securityAlerts: { 
  enabledTypes: [NotificationType.SESSION_CONFLICT, NotificationType.SESSION_EVICTED]
  minimumPriority: NotificationPriority.NORMAL }
};
      service.setUserPreferences(preferences);
      const retrievedPreferences = service.getUserPreferences(userId);
      expect(retrievedPreferences.userId).toBe(userId);
      expect(retrievedPreferences.channels[NotificationChannel.EMAIL].enabled).toBe(true);
      expect(retrievedPreferences.channels[NotificationChannel.SMS].enabled).toBe(false);
      expect(retrievedPreferences.conflictResolution.autoResolve).toBe(false);
    });
    test('should emit preferences updated event', (done) => { service.on('preferencesUpdated', (data) => {
        expect(data.userId).toBe('user-event');
        done() });
      const preferences: UserNotificationPreferences = { 
  userId: 'user-event' }
        channels: {
          [NotificationChannel.EMAIL]: { enabled: true }
          [NotificationChannel.SMS]: { enabled: false }
          [NotificationChannel.PUSH]: { enabled: false }
          [NotificationChannel.IN_APP]: { enabled: true }
          [NotificationChannel.WEBHOOK]: { enabled: false }
          [NotificationChannel.SLACK]: { enabled: false }
          [NotificationChannel.TEAMS]: { enabled: false }

  conflictResolution: { 
  autoResolve: true
  preferredResolution: ConflictResolution.EVICT_OLDEST
  requireConfirmation: false
  timeoutMinutes: 5 }

  securityAlerts: { 
  enabledTypes: [NotificationType.SESSION_CONFLICT]
  minimumPriority: NotificationPriority.LOW }
};
      service.setUserPreferences(preferences);
    });
    test('should return default preferences for unknown user', () => { const preferences = service.getUserPreferences('unknown-user');
      expect(preferences.userId).toBe('unknown-user');
      expect(preferences.channels[NotificationChannel.EMAIL].enabled).toBe(true);
      expect(preferences.channels[NotificationChannel.IN_APP].enabled).toBe(true);
      expect(preferences.conflictResolution.autoResolve).toBe(false) });
  });
  describe('Conflict Notifications', () => { test('should send conflict notification to multiple users', async () => {
      const conflict: SessionConflict = {
  id: 'conflict-123'
        type: 'user_limit'
        affectedSessions: ['session-1', 'session-2']
        newSessionRequest: {
  userId: 'user-new'
          deviceId: 'device-1'
          priority: SessionPriority.HIGH }
          factors: {} as PriorityFactors

  resolutionOptions: [ConflictResolution.EVICT_OLDEST, ConflictResolution.PROMPT_USER]
        recommendedResolution: ConflictResolution.EVICT_OLDEST
        severity: 'high'
        autoResolvable: false
        timeoutMinutes: 5;
  };
      const affectedUsers = ['user-1', 'user-2'];
      const result = await service.sendConflictNotification(conflict, affectedUsers);
      expect(result.sent).toContain('user-1');
      expect(result.sent).toContain('user-2');
      expect(result.failed).toHaveLength(0);
    });
    test('should handle notification delivery failures', async () => { // Create a service that simulates failures
  const failingService = new SessionConflictNotificationService({)
  batchingEnabled: false }
});
      // Override the sendNotification method to always fail
      const originalSendNotification = (failingService as any).sendNotification;
      (failingService as any).sendNotification = jest.fn().mockResolvedValue(false);
      const conflict: SessionConflict = { 
  id: 'conflict-fail'
        type: 'device_limit'
        affectedSessions: ['session-1']
        newSessionRequest: {
  userId: 'user-test'
          deviceId: 'device-test'
          priority: SessionPriority.MEDIUM }
          factors: {} as PriorityFactors

  resolutionOptions: [ConflictResolution.REJECT_NEW]
        recommendedResolution: ConflictResolution.REJECT_NEW
        severity: 'medium'
        autoResolvable: true
        timeoutMinutes: 3;
  };
      const result = await failingService.sendConflictNotification(conflict, ['user-fail']);
      expect(result.failed).toContain('user-fail');
      expect(result.sent).toHaveLength(0);
      failingService.destroy();
    });
    test('should emit notification error event on failure', (done) => { service.on('notificationError', (data) => {
        expect(data.userId).toBe('user-error');
        expect(data.error).toBeDefined();
        done() });
      // Force an error by using an invalid conflict object
      const invalidConflict = {} as SessionConflict;
      service.sendConflictNotification(invalidConflict, ['user-error']);
    });
  });
  describe('Session Eviction Notifications', () => { test('should send eviction notification', async () => {
      const result = await service.sendEvictionNotification(;);
        'session-evict'
        'user-evict'
        'session limit exceeded' }
        5
      );
      expect(result).toBe(true);
    });
    test('should send eviction notification without grace period', async () => { const result = await service.sendEvictionNotification(;);
        'session-evict-no-grace'
        'user-evict-no-grace' }
        'security violation'
      );
      expect(result).toBe(true);
    });
    test('should handle eviction notification errors', async () => { // Create service with failing delivery
      const failingService = new SessionConflictNotificationService();
      (failingService as any).sendNotification = jest.fn().mockResolvedValue(false);
      const result = await failingService.sendEvictionNotification(;);
        'session-fail'
        'user-fail' }
        'test failure'
      );
      expect(result).toBe(false);
      failingService.destroy();
    });
  });
  describe('Emergency Override Notifications', () => { test('should send emergency override notification', async () => {
      const result = await service.sendEmergencyOverrideNotification(;);
        'admin-123'
        'user-target' }
        ['session-1', 'session-2']
      );
      expect(result).toBe(true);
    });
    test('should handle emergency notification errors', async () => { const failingService = new SessionConflictNotificationService();
      (failingService as any).sendNotification = jest.fn().mockResolvedValue(false);
      const result = await failingService.sendEmergencyOverrideNotification(;);
        'admin-fail'
        'user-fail' }
        ['session-fail']
      );
      expect(result).toBe(false);
      failingService.destroy();
    });
  });
  describe('Grace Period Warnings', () => { test('should send grace period warning', async () => {
      const result = await service.sendGracePeriodWarning(;);
        'session-grace'
        'user-grace' }
        3
      );
      expect(result).toBe(true);
    });
    test('should handle grace period warning errors', async () => { const failingService = new SessionConflictNotificationService();
      (failingService as any).sendNotification = jest.fn().mockResolvedValue(false);
      const result = await failingService.sendGracePeriodWarning(;);
        'session-fail'
        'user-fail' }
        2
      );
      expect(result).toBe(false);
      failingService.destroy();
    });
  });
  describe('User Choice Prompts', () => { test('should handle auto-resolution for users with preferences', async () => {
      const userId = 'user-auto';
      const preferences: UserNotificationPreferences = {
        userId }
        channels: {
          [NotificationChannel.EMAIL]: { enabled: true }
          [NotificationChannel.SMS]: { enabled: false }
          [NotificationChannel.PUSH]: { enabled: false }
          [NotificationChannel.IN_APP]: { enabled: true }
          [NotificationChannel.WEBHOOK]: { enabled: false }
          [NotificationChannel.SLACK]: { enabled: false }
          [NotificationChannel.TEAMS]: { enabled: false }

  conflictResolution: { 
  autoResolve: true
  preferredResolution: ConflictResolution.EVICT_OLDEST
  requireConfirmation: false
  timeoutMinutes: 5 }

  securityAlerts: { 
  enabledTypes: [NotificationType.SESSION_CONFLICT]
  minimumPriority: NotificationPriority.NORMAL }
};
      service.setUserPreferences(preferences);
      const conflict: SessionConflict = { 
  id: 'conflict-auto'
        type: 'user_limit'
        affectedSessions: ['session-1']
        newSessionRequest: {
          userId
          deviceId: 'device-1'
          priority: SessionPriority.HIGH }
          factors: {} as PriorityFactors

  resolutionOptions: [ConflictResolution.EVICT_OLDEST]
        recommendedResolution: ConflictResolution.EVICT_OLDEST
        severity: 'medium'
        autoResolvable: true
        timeoutMinutes: 5;
  };
      const response = await service.promptUserChoice(conflict, userId, 2);
      expect(response).not.toBeNull();
      expect(response?.conflictId).toBe('conflict-auto');
      expect(response?.resolution).toBe(ConflictResolution.EVICT_OLDEST);
      expect(response?.confirmed).toBe(true);
    });
    test('should handle manual user choice with timeout', async () => { const conflict: SessionConflict = {
  id: 'conflict-manual'
        type: 'device_limit'
        affectedSessions: ['session-1']
        newSessionRequest: {
  userId: 'user-manual'
          deviceId: 'device-1'
          priority: SessionPriority.MEDIUM }
          factors: {} as PriorityFactors

  resolutionOptions: [ConflictResolution.PROMPT_USER]
        recommendedResolution: ConflictResolution.PROMPT_USER
        severity: 'low'
        autoResolvable: false
        timeoutMinutes: 5;
  };
      // Test timeout scenario (should return null after timeout)
      const responsePromise = service.promptUserChoice(conflict, 'user-manual', 0.01); // 0.01 minutes = 0.6 seconds;
      const response = await responsePromise;
      expect(response).toBeNull();
    });
    test('should handle user response to conflict prompt', async () => { const conflict: SessionConflict = {
  id: 'conflict-response'
        type: 'total_limit'
        affectedSessions: ['session-1', 'session-2']
        newSessionRequest: {
  userId: 'user-response'
          deviceId: 'device-1'
          priority: SessionPriority.HIGH }
          factors: {} as PriorityFactors

  resolutionOptions: [ConflictResolution.EVICT_OLDEST, ConflictResolution.PROMPT_USER]
        recommendedResolution: ConflictResolution.PROMPT_USER
        severity: 'high'
        autoResolvable: false
        timeoutMinutes: 5;
  };
      // Start the prompt
      const responsePromise = service.promptUserChoice(conflict, 'user-response', 1);
      // Simulate user response
      setTimeout(() => { const userResponse: ConflictResolutionResponse = {
  conflictId: 'conflict-response'
  userId: 'user-response'
  resolution: ConflictResolution.EVICT_OLDEST
  confirmed: true
  timestamp: new Date() }
};
        service.handleConflictResponse(userResponse);
      }, 100);
      const response = await responsePromise;
      expect(response).not.toBeNull();
      expect(response?.conflictId).toBe('conflict-response');
      expect(response?.resolution).toBe(ConflictResolution.EVICT_OLDEST);
    });
    test('should handle prompt errors', async () => {
      // Create invalid conflict to trigger error
      const invalidConflict = {} as SessionConflict;
      const response = await service.promptUserChoice(invalidConflict, 'user-error', 1);
      expect(response).toBeNull();
    });
  });
  describe('Notification Management', () => { test('should get user notifications', () => {
      const userId = 'user-notifications';
      // No notifications initially
      const emptyNotifications = service.getUserNotifications(userId);
      expect(emptyNotifications).toHaveLength(0) });
    test('should mark notification as read', () => { const notificationId = 'notification-123';
      // Create a mock notification
      const mockNotification: NotificationMessage = {
  id: notificationId
        type: NotificationType.SESSION_CONFLICT
        priority: NotificationPriority.NORMAL
        userId: 'user-read'
        title: 'Test Notification'
        message: 'Test message'
        actionRequired: false }
        data: {}
        channels: [NotificationChannel.EMAIL]
        createdAt: new Date()
        expiresAt: new Date(Date.now() + 60000)
        deliveryStatus: { [NotificationChannel.EMAIL]: {
  status: DeliveryStatus.SENT
  attempts: 1 }

  metadata: {}
      };
      // Add notification to service (using private method access for testing)
      (service as any).notifications.set(notificationId, mockNotification);
      // Mark as read
      service.markAsRead(notificationId, NotificationChannel.EMAIL);
      // Verify it was marked as read
      const notification = (service as any).notifications.get(notificationId);
      expect(notification.deliveryStatus[NotificationChannel.EMAIL].status).toBe(DeliveryStatus.READ);
    });
    test('should handle notification action clicks', () => { const notificationId = 'notification-action';
      const actionId = 'resolve_evict_oldest';
      const userId = 'user-action';
      // Create mock notification with actions
      const mockNotification: NotificationMessage = {
  id: notificationId
        type: NotificationType.SESSION_CONFLICT
        priority: NotificationPriority.HIGH
        userId
        title: 'Session Conflict'
        message: 'Choose resolution'
        actionRequired: true
        actions: [
          {
            id: actionId
            label: 'Evict Oldest'
            type: 'primary'
            action: 'resolve_conflict' }
            data: { resolution: ConflictResolution.EVICT_OLDEST }
        ]
        data: {}
        channels: [NotificationChannel.IN_APP]
        createdAt: new Date()
        expiresAt: new Date(Date.now() + 60000)
        deliveryStatus: { [NotificationChannel.IN_APP]: {
  status: DeliveryStatus.SENT
  attempts: 1 }

  metadata: { conflictId: 'conflict-123' }
      };
      (service as any).notifications.set(notificationId, mockNotification);
      let actionClicked = false;
      service.on('notificationActionClicked', (data) => { expect(data.notificationId).toBe(notificationId);
        expect(data.actionId).toBe(actionId);
        expect(data.userId).toBe(userId);
        actionClicked = true });
      service.handleNotificationAction(notificationId, actionId, userId);
      expect(actionClicked).toBe(true);
    });
  });
  describe('Statistics and Analytics', () => { test('should provide comprehensive notification statistics', () => {
  // Create mock notifications with different statuses
  const notifications = [
  {
  id: 'notif-1'
  type: NotificationType.SESSION_CONFLICT
  channels: [NotificationChannel.EMAIL]
  createdAt: new Date()
  expiresAt: new Date(Date.now() + 60000)
  deliveryStatus: {
  [NotificationChannel.EMAIL]: {
  status: DeliveryStatus.DELIVERED
  deliveredAt: new Date() }

        { id: 'notif-2'
  type: NotificationType.SESSION_EVICTED
  channels: [NotificationChannel.SMS]
  createdAt: new Date()
  expiresAt: new Date(Date.now() + 60000)
  deliveryStatus: {
  [NotificationChannel.SMS]: { }
  status: DeliveryStatus.FAILED];
  // Add notifications to service
  notifications.forEach(notification => { )
  (service as any).notifications.set(notification.id, notification) });
      const stats = service.getStatistics();
      expect(stats.totalSent).toBe(2);
      expect(stats.deliveryRate).toBe(50); // 1 out of 2 delivered
      expect(stats.failureRate).toBe(50); // 1 out of 2 failed
      expect(stats.channelStats[NotificationChannel.EMAIL].delivered).toBe(1);
      expect(stats.channelStats[NotificationChannel.SMS].failed).toBe(1);
    });
    test('should handle empty statistics', () => { const stats = service.getStatistics();
      expect(stats.totalSent).toBe(0);
      expect(stats.deliveryRate).toBe(0);
      expect(stats.failureRate).toBe(0);
      expect(stats.averageDeliveryTime).toBe(0) });
  });
  describe('Rate Limiting', () => { test('should apply rate limiting to prevent spam', async () => {
  const rateLimitedService = new SessionConflictNotificationService({)
  rateLimitCount: 2
  rateLimitWindow: 1000 // 1 second }
});
      const conflict: SessionConflict = { 
  id: 'conflict-rate-limit'
        type: 'user_limit'
        affectedSessions: ['session-1']
        newSessionRequest: {
  userId: 'user-rate-limit'
          deviceId: 'device-1'
          priority: SessionPriority.MEDIUM }
          factors: {} as PriorityFactors

  resolutionOptions: [ConflictResolution.EVICT_OLDEST]
        recommendedResolution: ConflictResolution.EVICT_OLDEST
        severity: 'medium'
        autoResolvable: true
        timeoutMinutes: 5;
  };
      // Send notifications up to the limit
      const result1 = await rateLimitedService.sendConflictNotification(conflict, ['user-rate-limit']);
      const result2 = await rateLimitedService.sendConflictNotification(conflict, ['user-rate-limit']);
      expect(result1.sent).toContain('user-rate-limit');
      expect(result2.sent).toContain('user-rate-limit');
      // Third notification should be rate limited
      const result3 = await rateLimitedService.sendConflictNotification(conflict, ['user-rate-limit']);
      expect(result3.failed).toContain('user-rate-limit');
      rateLimitedService.destroy();
    });
  });
  describe('Event Emission', () => { test('should emit conflict resolved event', (done) => {
      service.on('conflictResolved', (response) => {
        expect(response.conflictId).toBe('conflict-resolved');
        expect(response.userId).toBe('user-resolved');
        expect(response.resolution).toBe(ConflictResolution.EVICT_OLDEST);
        done() });
      const response: ConflictResolutionResponse = { 
  conflictId: 'conflict-resolved'
  userId: 'user-resolved'
  resolution: ConflictResolution.EVICT_OLDEST
  confirmed: true
  timestamp: new Date() }
};
      service.handleConflictResponse(response);
    });
    test('should emit notification read event', (done) => { service.on('notificationRead', (data) => {
        expect(data.notificationId).toBe('notification-read');
        expect(data.channel).toBe(NotificationChannel.EMAIL);
        expect(data.userId).toBe('user-read');
        done() });
      // Create and add mock notification
      const mockNotification: NotificationMessage = { 
  id: 'notification-read'
        type: NotificationType.SESSION_CONFLICT
        priority: NotificationPriority.NORMAL
        userId: 'user-read'
        title: 'Test'
        message: 'Test'
        actionRequired: false }
        data: {}
        channels: [NotificationChannel.EMAIL]
        createdAt: new Date()
        expiresAt: new Date(Date.now() + 60000)
        deliveryStatus: { [NotificationChannel.EMAIL]: {
  status: DeliveryStatus.SENT
  attempts: 1 }

  metadata: {}
      };
      (service as any).notifications.set('notification-read', mockNotification);
      service.markAsRead('notification-read', NotificationChannel.EMAIL);
    });
  });
  describe('Cleanup and Destruction', () => { test('should clean up expired notifications', () => {
      // Create expired notification
      const expiredNotification: NotificationMessage = {
  id: 'expired-notification'
        type: NotificationType.SESSION_CONFLICT
        priority: NotificationPriority.NORMAL
        userId: 'user-expired'
        title: 'Expired'
        message: 'This should be cleaned up'
        actionRequired: false }
        data: {}
        channels: [NotificationChannel.EMAIL]
        createdAt: new Date(Date.now() - 60000)
        expiresAt: new Date(Date.now() - 30000), // Expired 30 seconds ago
        deliveryStatus: {}
        metadata: {}
      };
      (service as any).notifications.set('expired-notification', expiredNotification);
      // Trigger cleanup
      (service as any).cleanupExpiredNotifications();
      // Notification should be removed
      const notification = (service as any).notifications.get('expired-notification');
      expect(notification).toBeUndefined();
    });
    test('should emit cleanup completed event', (done) => { service.on('cleanupCompleted', (data) => {
        expect(data.expiredNotifications).toBeGreaterThanOrEqual(0);
        expect(data.expiredResponses).toBeGreaterThanOrEqual(0);
        done() });
      // Trigger cleanup manually
      (service as any).cleanupExpiredNotifications();
    });
    test('should destroy service and clean up resources', (done) => { service.on('destroyed', () => {
        done() });
      service.destroy();
    });
  });
  describe('Batch Processing', () => { test('should handle batch processing when enabled', () => {
  const batchService = new SessionConflictNotificationService({)
  batchingEnabled: true
  batchSize: 2
  batchDelay: 100 }
});
      expect(batchService).toBeDefined();
      batchService.destroy();
    });
    test('should emit batch processed event', (done) => { const batchService = new SessionConflictNotificationService({)
  batchingEnabled: true
  batchSize: 1
  batchDelay: 50 }
});
      batchService.on('batchProcessed', (data) => { expect(data.batchKey).toBeDefined();
        expect(data.count).toBeGreaterThan(0);
        batchService.destroy();
        done() });
      // Add notification to trigger batch processing
      const mockNotification: NotificationMessage = { 
  id: 'batch-test'
        type: NotificationType.SESSION_CONFLICT
        priority: NotificationPriority.NORMAL
        userId: 'user-batch'
        title: 'Test Batch'
        message: 'Test batch message'
        actionRequired: false }
        data: {}
        channels: [NotificationChannel.EMAIL]
        createdAt: new Date()
        expiresAt: new Date(Date.now() + 60000)
        deliveryStatus: {}
        metadata: {}
      };
      (batchService as any).addToBatch(mockNotification);
    });
  });
  describe('Error Handling', () => { test('should handle notification delivery errors gracefully', async () => {
      let errorEmitted = false;
      service.on('notificationError', () => {
        errorEmitted = true });
      // Force an error by using invalid data
      const result = await service.sendEvictionNotification('', '', '');
      // Should not crash, may emit error
      expect(typeof result).toBe('boolean');
    });
    test('should handle invalid notification IDs in actions', () => { // Should not throw error
      service.handleNotificationAction('invalid-id', 'action-id', 'user-id');
      service.markAsRead('invalid-id', NotificationChannel.EMAIL) });
    test('should handle malformed conflict responses', () => {
      // Should not throw error
      const invalidResponse = {} as ConflictResolutionResponse;
      service.handleConflictResponse(invalidResponse);
    });
  });
});