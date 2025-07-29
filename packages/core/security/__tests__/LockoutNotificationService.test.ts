/**
 * Test Suite for Lockout Notification Service
 * 
 * Tests comprehensive notification system including template management,
 * multi-channel delivery, user preferences, and delivery tracking.
 */
import {
  LockoutNotificationService,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
  UserNotificationPreferences
} from '../LockoutNotificationService';
import {
  LockoutReason,
  LockoutStatus,
  AdminRole,
  AccountLockout
} from '../AccountLockoutService';
describe('LockoutNotificationService', () => {
  let service: LockoutNotificationService;
  let mockLockout: AccountLockout;
  let mockDate: Date;
  beforeEach(() => {
  mockDate = new Date('2025-01-15T10:00:00Z');
  const OriginalDate = Date;
  jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime( as unknown));
  // Mock the Date constructor
  const mockDateConstructor = jest.fn<unknown, unknown>().mockImplementation((value?: unknown) => {,
  if (value !== undefined) {
  return new OriginalDate(value);
  return mockDate;
});
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    service = new LockoutNotificationService();
    mockLockout = {
  id: 'LOCK-1234567890-ABCD1234',
  userId: 'user123',
  userEmail: 'test@example.com',
  status: LockoutStatus.ACTIVE,
  reason: LockoutReason.EXCESSIVE_FAILED_ATTEMPTS,
  lockoutTime: mockDate,
  expiryTime: new Date(mockDate.getTime() + 30 * 60 * 1000), // 30 minutes,
  failedAttempts: 5,
  securityEvents: [],
  metadata: {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  riskScore: 75,
  threatLevel: 'medium',
},
  adminActions: [],
      notifications: [],
      auditTrail: [];
  };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('Lockout Notifications', () => {
    test('should send lockout notification with default channels', async () => {
      const notificationId = await service.sendLockoutNotification(mockLockout);
      expect(notificationId).toBeTruthy();
      const status = service.getNotificationStatus(notificationId);
      expect(status.request).toBeTruthy();
      expect(status.request!.type).toBe(NotificationType.LOCKOUT_NOTIFICATION);
      expect(status.request!.recipient).toBe('test@example.com');
      expect(status.request!.priority).toBe(NotificationPriority.MEDIUM);
    });
    test('should send lockout notification with specified channels', async () => {
      const channels = [NotificationChannel.EMAIL, NotificationChannel.SMS];
      const notificationId = await service.sendLockoutNotification(mockLockout, channels);
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.channels).toEqual(channels);
      expect(status.deliveries).toHaveLength(2);
    });
    test('should use high priority for suspicious activity', async () => {
  const suspiciousLockout = {
  ...mockLockout,
  reason: LockoutReason.SUSPICIOUS_ACTIVITY,
};
      const notificationId = await service.sendLockoutNotification(suspiciousLockout);
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.priority).toBe(NotificationPriority.HIGH);
    });
    test('should use urgent priority for system security alerts', async () => {
  const alertLockout = {
  ...mockLockout,
  reason: LockoutReason.SYSTEM_SECURITY_ALERT,
};
      const notificationId = await service.sendLockoutNotification(alertLockout);
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.priority).toBe(NotificationPriority.URGENT);
    });
  });
  describe('Unlock Notifications', () => {
  test('should send unlock notification', async () => {
  const unlockedLockout = {
  ...mockLockout,
  status: LockoutStatus.UNLOCKED,
  unlockTime: new Date(mockDate.getTime() + 60 * 60 * 1000),
};
      const notificationId = await service.sendUnlockNotification(unlockedLockout, 'Admin User');
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.type).toBe(NotificationType.UNLOCK_NOTIFICATION);
      expect(status.request!.priority).toBe(NotificationPriority.HIGH);
      expect(status.request!.metadata.adminName).toBe('Admin User');
    });
    test('should send unlock notification without admin name', async () => {
  const unlockedLockout = {
  ...mockLockout,
  status: LockoutStatus.UNLOCKED,
  unlockTime: new Date(),
};
      const notificationId = await service.sendUnlockNotification(unlockedLockout);
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.metadata.adminName).toBeUndefined();
    });
  });
  describe('Security Alert Notifications', () => {
  test('should send security alert with urgent priority', async () => {
  const alertDetails = {
  source: 'intrusion_detection',
  severity: 'high',
  details: 'Multiple failed attempts from suspicious IP',
};
      const notificationId = await service.sendSecurityAlert(mockLockout, alertDetails);
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.type).toBe(NotificationType.SECURITY_ALERT);
      expect(status.request!.priority).toBe(NotificationPriority.URGENT);
      expect(status.request!.channels).toContain(NotificationChannel.EMAIL);
      expect(status.request!.channels).toContain(NotificationChannel.PUSH);
    });
  });
  describe('Admin Notifications', () => {
    test('should send admin notifications to specified roles', async () => {
      const adminRoles = [AdminRole.SECURITY_ADMIN, AdminRole.SUPER_ADMIN];
      const details = { urgency: 'high', context: 'approval_required' };
      const notificationIds = await service.sendAdminNotification(;);
        NotificationType.ADMIN_ACTION_REQUIRED,
        mockLockout,
        adminRoles,
        details
      );
      expect(notificationIds).toHaveLength(2); // One per role
      for (const notificationId of notificationIds) {
        const status = service.getNotificationStatus(notificationId);
        expect(status.request!.type).toBe(NotificationType.ADMIN_ACTION_REQUIRED);
        expect(status.request!.priority).toBe(NotificationPriority.HIGH);
    });
  });
  describe('User Preferences', () => {
  test('should respect user notification preferences', async () => {
  const preferences: UserNotificationPreferences = {,
  userId: 'user123',
  channels: {
  email: true,
  sms: false,
  push: true,
},
  language: 'en',
        timezone: 'UTC',
        quietHours: {
  enabled: false,
  start: '22:00',
  end: '08:00',
},
  frequency: {
  immediate: true,
  digest: false,
  digestFrequency: 'daily',
},
  metadata: {}
      };
      service.updateUserPreferences('user123', preferences);
      const notificationId = await service.sendLockoutNotification(mockLockout);
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.channels).toContain(NotificationChannel.EMAIL);
      expect(status.request!.channels).toContain(NotificationChannel.PUSH);
      expect(status.request!.channels).not.toContain(NotificationChannel.SMS);
    });
    test('should emit preferences updated event', (done) => {
      const preferences = { channels: { email: false, sms: true, push: false } };
      service.on('preferencesUpdated', (data) => {
        expect(data.userId).toBe('user123');
        expect(data.preferences.channels.sms).toBe(true);
        done();
      });
      service.updateUserPreferences('user123', preferences);
    });
  });
  describe('Template Management', () => {
    test('should create custom notification template', () => {
      const template = {
        type: NotificationType.LOCKOUT_NOTIFICATION,
        channel: NotificationChannel.EMAIL,
        language: 'es',
        subject: 'Cuenta Bloqueada - {{appName}}',
        bodyText: 'Su cuenta ha sido bloqueada temporalmente.',
        variables: ['appName'],
        priority: NotificationPriority.MEDIUM,
        retryPolicy: {
  maxAttempts: 3,
  backoffMultiplier: 2,
  baseDelaySeconds: 30,
  maxDelaySeconds: 300,
  retryOn: ['timeout'],
},
  expiryMinutes: 60,
        metadata: { custom: true }
      };
      const templateId = service.createTemplate(template);
      expect(templateId).toBeTruthy();
      expect(templateId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    });
    test('should emit template created event', (done) => {
      service.on('templateCreated', (template) => {
        expect(template.language).toBe('fr');
        expect(template.custom).toBe(true);
        done();
      });
      service.createTemplate({)
  type: NotificationType.UNLOCK_NOTIFICATION,
  channel: NotificationChannel.EMAIL,
  language: 'fr',
  subject: 'Test',
  bodyText: 'Test body',
  variables: [],
  priority: NotificationPriority.LOW,
  retryPolicy: {
  maxAttempts: 1,
  backoffMultiplier: 1,
  baseDelaySeconds: 10,
  maxDelaySeconds: 10,
  retryOn: [],
},
  expiryMinutes: 30,
        metadata: { custom: true }
      });
    });
  });
  describe('Notification Delivery', () => {
    test('should track delivery status progression', async () => {
      const notificationId = await service.sendLockoutNotification(mockLockout);
      // Initial status should be queued
      const initialStatus = service.getNotificationStatus(notificationId);
      expect(initialStatus.deliveries.some(d => d.status === NotificationStatus.QUEUED)).toBe(true);
      // Wait for processing (simulated delivery)
      await new Promise(resolve => setTimeout(resolve, 500));
      const finalStatus = service.getNotificationStatus(notificationId);
      expect(finalStatus.deliveries.some(d => )
        d.status === NotificationStatus.SENT || 
        d.status === NotificationStatus.DELIVERED
      )).toBe(true);
    });
    test('should emit notification delivered events', (done) => {
      service.on('notificationDelivered', (delivery) => {
        expect(delivery.channel).toBeTruthy();
        expect(delivery.status).toBe(NotificationStatus.DELIVERED);
        done();
      });
      service.sendLockoutNotification(mockLockout);
    });
    test('should handle delivery failures', (done) => {
      service.on('notificationFailed', (delivery) => {
        expect(delivery.status).toBe(NotificationStatus.FAILED);
        expect(delivery.failureReason).toBeTruthy();
        done();
      });
      // Force a failure by using invalid template
      service.testNotification()
        'test@example.com',
        NotificationChannel.EMAIL,
        'non-existent-template',
        {} as any
      ).catch(() => {
        // Expected to fail
      });
    });
  });
  describe('Test Notifications', () => {
  test('should send test notification', async () => {
  const variables = {
  userName: 'Test User',
  userEmail: 'test@example.com',
  lockoutReason: 'testing',
  lockoutTime: mockDate.toISOString(),
  supportEmail: 'support@test.com',
  supportPhone: '+1-800-TEST',
  lockoutId: 'TEST-123',
  companyName: 'Test Corp',
  appName: 'Test App',
  securityTips: ['Tip 1', 'Tip 2'],
  nextSteps: ['Step 1', 'Step 2'],
};
      const notificationId = await service.testNotification(;);
        'test@example.com',
        NotificationChannel.EMAIL,
        'lockout_en',
        variables
      );
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.metadata.test).toBe(true);
      expect(status.request!.priority).toBe(NotificationPriority.LOW);
    });
  });
  describe('User Notification History', () => {
    test('should retrieve user notification history', async () => {
      // Send multiple notifications
      await service.sendLockoutNotification(mockLockout);
      await service.sendUnlockNotification(mockLockout);
      await service.sendSecurityAlert(mockLockout, {});
      const history = service.getUserNotificationHistory('user123', 10);
      expect(history).toHaveLength(3);
      expect(history[0].metadata.userId).toBe('user123');
    });
    test('should limit notification history results', async () => {
      // Send multiple notifications
      for (let i = 0; i < 5; i++) {
        await service.sendLockoutNotification(mockLockout);
      const history = service.getUserNotificationHistory('user123', 3);
      expect(history).toHaveLength(3);
    });
  });
  describe('Statistics and Reporting', () => {
    test('should provide comprehensive notification statistics', async () => {
      // Generate some notifications
      await service.sendLockoutNotification(mockLockout);
      await service.sendUnlockNotification(mockLockout);
      await service.sendSecurityAlert(mockLockout, {});
      const stats = service.getNotificationStatistics();
      expect(stats.totalNotifications).toBe(3);
      expect(stats.byType[NotificationType.LOCKOUT_NOTIFICATION]).toBe(1);
      expect(stats.byType[NotificationType.UNLOCK_NOTIFICATION]).toBe(1);
      expect(stats.byType[NotificationType.SECURITY_ALERT]).toBe(1);
      expect(stats.deliveryRate).toBeGreaterThanOrEqual(0);
    });
    test('should filter statistics by date range', async () => {
  await service.sendLockoutNotification(mockLockout);
  const stats = service.getNotificationStatistics({)
  start: new Date(mockDate.getTime() - 24 * 60 * 60 * 1000),
  end: new Date(mockDate.getTime() + 24 * 60 * 60 * 1000),
});
      expect(stats.totalNotifications).toBe(1);
    });
    test('should calculate delivery rate correctly', async () => {
      await service.sendLockoutNotification(mockLockout);
      // Wait for delivery processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      const stats = service.getNotificationStatistics();
      expect(stats.deliveryRate).toBeGreaterThan(0);
      expect(stats.deliveryRate).toBeLessThanOrEqual(100);
    });
  });
  describe('Event Emission', () => {
    test('should emit notification queued events', (done) => {
      service.on('notificationQueued', (request) => {
        expect(request.type).toBe(NotificationType.LOCKOUT_NOTIFICATION);
        expect(request.recipient).toBe('test@example.com');
        done();
      });
      service.sendLockoutNotification(mockLockout);
    });
  });
  describe('Error Handling', () => {
    test('should handle missing template gracefully', async () => {
      await expect(service.testNotification()
        'test@example.com',
        NotificationChannel.EMAIL,
        'non-existent-template',
        {} as any
      )).rejects.toThrow('Template not found: non-existent-template');
    });
    test('should handle invalid notification request gracefully', () => {
      const status = service.getNotificationStatus('non-existent-id');
      expect(status.request).toBeNull();
      expect(status.deliveries).toHaveLength(0);
      expect(status.summary.totalDeliveries).toBe(0);
    });
  });
  describe('Channel-Specific Behavior', () => {
    test('should handle different channels appropriately', async () => {
      const channels = [;
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.PUSH,
        NotificationChannel.ADMIN_CONSOLE
      ];
      const notificationId = await service.sendLockoutNotification(mockLockout, channels);
      const status = service.getNotificationStatus(notificationId);
      expect(status.deliveries).toHaveLength(4);
      const channelTypes = status.deliveries.map(d => d.channel);
      channels.forEach(channel => {)
  expect(channelTypes).toContain(channel);
      });
    });
  });
  describe('Priority Handling', () => {
  test('should process urgent notifications immediately', async () => {
  const urgentLockout = {
  ...mockLockout,
  reason: LockoutReason.SYSTEM_SECURITY_ALERT,
};
      const notificationId = await service.sendLockoutNotification(urgentLockout);
      // Urgent notifications should be processed immediately
      const status = service.getNotificationStatus(notificationId);
      expect(status.request!.priority).toBe(NotificationPriority.URGENT);
    });
  });
});