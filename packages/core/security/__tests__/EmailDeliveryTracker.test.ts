/**
 * Test Suite for Email Delivery Tracker
 * 
 * Tests comprehensive email delivery tracking including status updates,
 * webhook handling, analytics, and bounce processing.
 */
import {
  EmailDeliveryTracker,
  DeliveryStatus,
  EmailType,
  EmailProvider,
  BounceType,
  BounceSubType,
  EmailSendRequest
} from '../services/EmailDeliveryTracker';
describe('EmailDeliveryTracker', () => {
  let tracker: EmailDeliveryTracker;
  beforeEach(() => {
  jest.useFakeTimers();
  tracker = new EmailDeliveryTracker({)
  defaultProvider: EmailProvider.SENDGRID,
  trackingEnabled: true,
  enableAnalytics: true,
});
  });
  afterEach(() => {
    jest.useRealTimers();
    tracker.removeAllListeners();
  });
  describe('Email Sending and Basic Tracking', () => {
  test('should send email and create delivery record', async () => {
  const request: EmailSendRequest = {,
  type: EmailType.ACCOUNT_VERIFICATION,
  recipient: 'test@example.com',
  subject: 'Verify your account',
  content: {
  html: '<p>Please verify your account</p>',
  text: 'Please verify your account',
},
  metadata: {
  userId: 'user-123',
  sessionId: 'session-456',
};
      const emailId = await tracker.sendEmail(request);
      expect(emailId).toBeDefined();
      expect(typeof emailId).toBe('string');
      const record = tracker.getDeliveryRecord(emailId);
      expect(record).not.toBeNull();
      expect(record?.type).toBe(EmailType.ACCOUNT_VERIFICATION);
      expect(record?.recipient).toBe('test@example.com');
      expect(record?.subject).toBe('Verify your account');
      expect(record?.metadata.userId).toBe('user-123');
      expect(record?.status).toBe(DeliveryStatus.QUEUED);
    });
    test('should handle email sending failure', async () => {
  // Mock a failing email service
  const failingTracker = new EmailDeliveryTracker({)
  defaultProvider: EmailProvider.SMTP,
});
      // Override the sendEmailViaProvider method to simulate failure
      (failingTracker as any).sendEmailViaProvider = jest.fn<unknown, unknown>().mockRejectedValue()
        new Error('SMTP connection failed')
      );
      const request: EmailSendRequest = {,
  type: EmailType.PASSWORD_RESET,
  recipient: 'fail@example.com',
  subject: 'Reset your password',
  content: {
  text: 'Reset link here',
},
  metadata: {
  userId: 'user-fail',
};
      const emailId = await failingTracker.sendEmail(request);
      const record = failingTracker.getDeliveryRecord(emailId);
      expect(record?.status).toBe(DeliveryStatus.FAILED);
      expect(record?.attempts).toHaveLength(1);
      expect(record?.attempts[0].error).toContain('SMTP connection failed');
      failingTracker.removeAllListeners();
    });
    test('should progress through delivery statuses', async () => {
  const statusChanges: DeliveryStatus = [];
  tracker.on('statusChanged', (data) => {
  statusChanges.push(data.newStatus);
});
      const request: EmailSendRequest = {,
  type: EmailType.MFA_CODE,
  recipient: 'mfa@example.com',
  subject: 'Your MFA code',
  content: {
  text: 'Your code is: 123456',
},
  metadata: {
  userId: 'user-mfa',
};
      const emailId = await tracker.sendEmail(request);
      // Fast forward timers to simulate delivery progression
      jest.advanceTimersByTime(500); // Sending delay
      jest.advanceTimersByTime(3000); // Delivery delay
      expect(statusChanges).toContain(DeliveryStatus.QUEUED);
      expect(statusChanges).toContain(DeliveryStatus.SENT);
      expect(statusChanges).toContain(DeliveryStatus.DELIVERED);
      const record = tracker.getDeliveryRecord(emailId);
      expect(record?.status).toBe(DeliveryStatus.DELIVERED);
      expect(record?.sentAt).toBeInstanceOf(Date);
      expect(record?.deliveredAt).toBeInstanceOf(Date);
    });
  });
  describe('Status Updates', () => {
    test('should update email status correctly', () => {
      const mockEmailId = 'test-email-id';
      // Manually create a record for testing
      const mockRecord = {
        id: mockEmailId,
        messageId: 'msg-123',
        provider: EmailProvider.SENDGRID,
        type: EmailType.SECURITY_ALERT,
        status: DeliveryStatus.SENT,
        recipient: 'alert@example.com',
        sender: 'security@example.com',
        subject: 'Security Alert',
        createdAt: new Date(),
        sentAt: new Date(),
        metadata: { userId: 'user-alert' },
        attempts: [],
        tracking: { opens: [], clicks: [], unsubscribes: [] },
        providerData: {}
      };
      (tracker as any).deliveryRecords.set(mockEmailId, mockRecord);
      // Update status to delivered
      tracker.updateStatus(mockEmailId, DeliveryStatus.DELIVERED);
      const updatedRecord = tracker.getDeliveryRecord(mockEmailId);
      expect(updatedRecord?.status).toBe(DeliveryStatus.DELIVERED);
      expect(updatedRecord?.deliveredAt).toBeInstanceOf(Date);
    });
    test('should emit status change events', (done) => {
      const mockEmailId = 'test-email-status';
      tracker.on('statusChanged', (data) => {
        expect(data.emailId).toBe(mockEmailId);
        expect(data.previousStatus).toBe(DeliveryStatus.SENT);
        expect(data.newStatus).toBe(DeliveryStatus.OPENED);
        done();
      });
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.SENT,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      tracker.updateStatus(mockEmailId, DeliveryStatus.OPENED);
    });
    test('should handle bounce status with bounce info', () => {
      const mockEmailId = 'test-email-bounce';
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.SENT,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      const bounceInfo = {
  type: BounceType.HARD,
  subType: BounceSubType.NO_EMAIL,
  reason: 'Email address does not exist',
  diagnosticCode: '550 5.1.1 User unknown',
};
      tracker.updateStatus(mockEmailId, DeliveryStatus.BOUNCED, { bounceInfo });
      const record = tracker.getDeliveryRecord(mockEmailId);
      expect(record?.status).toBe(DeliveryStatus.BOUNCED);
      expect(record?.bouncedAt).toBeInstanceOf(Date);
      expect(record?.bounceInfo).toEqual(bounceInfo);
    });
  });
  describe('Tracking Events', () => {
    test('should add email open tracking event', () => {
      const mockEmailId = 'test-email-open';
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.DELIVERED,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      const openEvent = {
  timestamp: new Date(),
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0',
  location: 'San Francisco, CA',
  deviceType: 'desktop',
};
      tracker.addTrackingEvent(mockEmailId, 'open', openEvent);
      const record = tracker.getDeliveryRecord(mockEmailId);
      expect(record?.tracking.opens).toHaveLength(1);
      expect(record?.tracking.opens[0]).toEqual(openEvent);
      expect(record?.status).toBe(DeliveryStatus.OPENED);
    });
    test('should add email click tracking event', () => {
      const mockEmailId = 'test-email-click';
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.OPENED,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      const clickEvent = {
  timestamp: new Date(),
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0',
  url: 'https://example.com/verify',
  linkId: 'verify-link',
};
      tracker.addTrackingEvent(mockEmailId, 'click', clickEvent);
      const record = tracker.getDeliveryRecord(mockEmailId);
      expect(record?.tracking.clicks).toHaveLength(1);
      expect(record?.tracking.clicks[0]).toEqual(clickEvent);
      expect(record?.status).toBe(DeliveryStatus.CLICKED);
    });
    test('should add unsubscribe tracking event', () => {
      const mockEmailId = 'test-email-unsub';
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.DELIVERED,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      const unsubEvent = {
  timestamp: new Date(),
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0',
  reason: 'Too many emails',
};
      tracker.addTrackingEvent(mockEmailId, 'unsubscribe', unsubEvent);
      const record = tracker.getDeliveryRecord(mockEmailId);
      expect(record?.tracking.unsubscribes).toHaveLength(1);
      expect(record?.tracking.unsubscribes[0]).toEqual(unsubEvent);
      expect(record?.status).toBe(DeliveryStatus.UNSUBSCRIBED);
    });
    test('should emit tracking events', (done) => {
      const mockEmailId = 'test-tracking-event';
      tracker.on('trackingEvent', (data) => {
        expect(data.emailId).toBe(mockEmailId);
        expect(data.eventType).toBe('open');
        expect(data.eventData.ipAddress).toBe('192.168.1.100');
        done();
      });
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.DELIVERED,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      tracker.addTrackingEvent(mockEmailId, 'open', {)
  timestamp: new Date(),
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0',
});
    });
  });
  describe('Webhook Handling', () => {
  test('should handle webhook payload', async () => {
  const mockPayload = {
  messageId: 'msg-webhook-123',
  status: DeliveryStatus.DELIVERED,
  timestamp: Date.now(),
};
      // Create mock record with matching message ID
      const mockEmailId = 'webhook-email-id';
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        messageId: 'msg-webhook-123',
        status: DeliveryStatus.SENT,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      await tracker.handleWebhook(EmailProvider.SENDGRID, mockPayload);
      const record = tracker.getDeliveryRecord(mockEmailId);
      expect(record?.status).toBe(DeliveryStatus.DELIVERED);
    });
    test('should handle webhook errors', async () => {
  const errorHandler = jest.fn<unknown, unknown>();
  tracker.on('webhookError', errorHandler);
  const invalidPayload = null;
  await tracker.handleWebhook(EmailProvider.MAILGUN, invalidPayload);
  expect(errorHandler).toHaveBeenCalledWith()
  expect.objectContaining({)
  provider: EmailProvider.MAILGUN,
  error: expect.any(String),
}
      );
    });
  });
  describe('Statistics and Analytics', () => {
    test('should provide initial statistics', () => {
      const stats = tracker.getStatistics();
      expect(stats.totalEmails).toBe(0);
      expect(stats.deliveredEmails).toBe(0);
      expect(stats.deliveryRate).toBe(0);
      expect(stats.statisticsByType).toHaveProperty(EmailType.ACCOUNT_VERIFICATION);
      expect(stats.statisticsByProvider).toHaveProperty(EmailProvider.SENDGRID);
    });
    test('should update statistics when emails are processed', async () => {
      const request: EmailSendRequest = {,
  type: EmailType.DEVICE_VERIFICATION,
        recipient: 'device@example.com',
        subject: 'Device verification',
        content: { text: 'Verify your device' },
        metadata: { userId: 'user-device' }
      };
      const emailId = await tracker.sendEmail(request);
      // Fast forward to get the email delivered
      jest.advanceTimersByTime(6000);
      const stats = tracker.getStatistics();
      expect(stats.totalEmails).toBe(1);
      expect(stats.deliveredEmails).toBe(1);
      expect(stats.deliveryRate).toBe(100);
    });
    test('should calculate bounce rate correctly', () => {
      // Manually update statistics to test calculation
      const tracker = new EmailDeliveryTracker();
      (tracker as any).statistics.totalEmails = 10;
      (tracker as any).statistics.bouncedEmails = 2;
      (tracker as any).recalculateStatistics();
      const stats = tracker.getStatistics();
      expect(stats.bounceRate).toBe(20);
      tracker.removeAllListeners();
    });
  });
  describe('Email Record Retrieval', () => {
    test('should get user delivery records', async () => {
      const userId = 'user-multi-emails';
      // Send multiple emails for the user
      for (let i = 0; i < 3; i++) {
        await tracker.sendEmail({)
  type: EmailType.LOGIN_NOTIFICATION,
          recipient: `test${i}@example.com`}
},
  subject: `Notification ${i}`}
},
  content: { text: `Message ${i}` }
},
  metadata: { userId }
        });
      const userRecords = tracker.getUserDeliveryRecords(userId);
      expect(userRecords).toHaveLength(3);
      expect(userRecords.every(record => record.metadata.userId === userId)).toBe(true);
    });
    test('should get email status by ID', async () => {
      const request: EmailSendRequest = {,
  type: EmailType.BACKUP_CODE_DELIVERY,
        recipient: 'backup@example.com',
        subject: 'Your backup codes',
        content: { text: 'Backup codes attached' },
        metadata: { userId: 'user-backup' }
      };
      const emailId = await tracker.sendEmail(request);
      const status = tracker.getEmailStatus(emailId);
      expect(status).toBe(DeliveryStatus.QUEUED);
    });
    test('should return null for non-existent email', () => {
      const record = tracker.getDeliveryRecord('non-existent-id');
      const status = tracker.getEmailStatus('non-existent-id');
      expect(record).toBeNull();
      expect(status).toBeNull();
    });
  });
  describe('Email Retry Functionality', () => {
    test('should retry failed email delivery', async () => {
      const mockEmailId = 'retry-email-id';
      // Create a failed email record
      const failedRecord = {
        id: mockEmailId,
        messageId: 'msg-retry-123',
        provider: EmailProvider.SENDGRID,
        type: EmailType.PASSWORD_RESET,
        status: DeliveryStatus.FAILED,
        recipient: 'retry@example.com',
        sender: 'auth@example.com',
        subject: 'Password reset retry',
        createdAt: new Date(),
        metadata: { userId: 'user-retry' },
        attempts: [{,
  attemptNumber: 1,
  timestamp: new Date(),
  status: DeliveryStatus.FAILED,
  error: 'Network timeout',
}],
        tracking: { opens: [], clicks: [], unsubscribes: [] },
        providerData: {
  htmlContent: '<p>Reset your password</p>',
  textContent: 'Reset your password',
};
      (tracker as any).deliveryRecords.set(mockEmailId, failedRecord);
      const retrySuccess = await tracker.retryDelivery(mockEmailId);
      expect(retrySuccess).toBe(true);
      const record = tracker.getDeliveryRecord(mockEmailId);
      expect(record?.status).toBe(DeliveryStatus.QUEUED);
      expect(record?.attempts.length).toBeGreaterThan(1);
    });
    test('should not retry if max attempts reached', async () => {
  const tracker = new EmailDeliveryTracker({)
  retryAttempts: 2,
});
      const mockEmailId = 'max-retry-email-id';
      // Create a failed email record with max attempts
      const failedRecord = {
        id: mockEmailId,
        status: DeliveryStatus.FAILED,
        attempts: [,
          { attemptNumber: 1, timestamp: new Date(), status: DeliveryStatus.FAILED },
          { attemptNumber: 2, timestamp: new Date(), status: DeliveryStatus.FAILED }
        ]
      };
      (tracker as any).deliveryRecords.set(mockEmailId, failedRecord);
      const retrySuccess = await tracker.retryDelivery(mockEmailId);
      expect(retrySuccess).toBe(false);
      tracker.removeAllListeners();
    });
    test('should not retry non-failed emails', async () => {
  const mockEmailId = 'delivered-email-id';
  // Create a delivered email record
  const deliveredRecord = {
  id: mockEmailId,
  status: DeliveryStatus.DELIVERED,
  attempts: [],
};
      (tracker as any).deliveryRecords.set(mockEmailId, deliveredRecord);
      const retrySuccess = await tracker.retryDelivery(mockEmailId);
      expect(retrySuccess).toBe(false);
    });
  });
  describe('Bounce and Spam Handling', () => {
    test('should emit bounce events', (done) => {
      const mockEmailId = 'bounce-email-id';
      tracker.on('emailBounced', (data) => {
        expect(data.emailId).toBe(mockEmailId);
        expect(data.bounceInfo?.type).toBe(BounceType.HARD);
        done();
      });
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.SENT,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      tracker.updateStatus(mockEmailId, DeliveryStatus.BOUNCED, {)
  bounceInfo: {
  type: BounceType.HARD,
  subType: BounceSubType.NO_EMAIL,
  reason: 'Invalid email address',
});
    });
    test('should emit hard bounce events for suppression', (done) => {
      const mockEmailId = 'hard-bounce-email-id';
      tracker.on('hardBounce', (data) => {
        expect(data.emailAddress).toBe('invalid@example.com');
        expect(data.reason).toBe('Invalid email address');
        done();
      });
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        recipient: 'invalid@example.com',
        status: DeliveryStatus.SENT,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      tracker.updateStatus(mockEmailId, DeliveryStatus.BOUNCED, {)
  bounceInfo: {
  type: BounceType.HARD,
  subType: BounceSubType.NO_EMAIL,
  reason: 'Invalid email address',
});
    });
    test('should emit spam report events', (done) => {
      const mockEmailId = 'spam-email-id';
      tracker.on('spamReport', (data) => {
        expect(data.emailId).toBe(mockEmailId);
        done();
      });
      // Create mock record
      (tracker as any).deliveryRecords.set(mockEmailId, {)
  id: mockEmailId,
        status: DeliveryStatus.DELIVERED,
        tracking: { opens: [], clicks: [], unsubscribes: [] }
      });
      tracker.updateStatus(mockEmailId, DeliveryStatus.SPAM);
    });
  });
  describe('Configuration Management', () => {
  test('should update configuration', () => {
  const configHandler = jest.fn<unknown, unknown>();
  tracker.on('configUpdated', configHandler);
  tracker.updateConfig({)
  retryAttempts: 5,
  trackingEnabled: false,
});
      expect(configHandler).toHaveBeenCalledWith()
        expect.objectContaining({)
  config: expect.objectContaining({,)
  retryAttempts: 5,
  trackingEnabled: false,
}
  }
      );
    });
    test('should use custom provider configuration', () => {
  const customTracker = new EmailDeliveryTracker({)
  defaultProvider: EmailProvider.AWS_SES,
  providerConfigs: {
  [EmailProvider.AWS_SES]: {
  apiKey: 'aws-key-123',
  endpoint: 'https://email.us-east-1.amazonaws.com',
});
      expect(customTracker).toBeDefined();
      customTracker.removeAllListeners();
    });
  });
  describe('Edge Cases', () => {
  test('should handle tracking events for non-existent emails', () => {
  // Should not throw error
  tracker.addTrackingEvent('non-existent-id', 'open', {)
  timestamp: new Date(),
  ipAddress: '192.168.1.1',
  userAgent: 'Test',
});
      // Should not crash or throw
      expect(true).toBe(true);
    });
    test('should handle status updates for non-existent emails', () => {
      // Should not throw error
      tracker.updateStatus('non-existent-id', DeliveryStatus.DELIVERED);
      // Should not crash or throw
      expect(true).toBe(true);
    });
    test('should handle empty webhook payload', async () => {
      const errorHandler = jest.fn<unknown, unknown>();
      tracker.on('webhookError', errorHandler);
      await tracker.handleWebhook(EmailProvider.POSTMARK, {});
      // Should handle gracefully without crashing
      expect(true).toBe(true);
    });
  });
});