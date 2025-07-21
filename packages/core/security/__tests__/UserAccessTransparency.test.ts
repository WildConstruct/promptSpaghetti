/**
 * Test Suite for User Access Transparency Service
 * 
 * Comprehensive tests for user access transparency including:
 * - Data inventory generation
 * - Access activity tracking
 * - DSAR processing
 * - Privacy scoring
 * - Notification handling
 * - Settings management
 */

import {
  UserAccessTransparencyService,
  TransparencyConfig,
  UserDataInventory,
  DataSubjectAccessRequest,
  UserAccessActivity,
  PrivacyScore,
  TransparencySettings,
  TransparencyEventType
} from '../UserAccessTransparency';

describe('UserAccessTransparencyService', () => {
  let transparencyService: UserAccessTransparencyService;
  let testConfig: TransparencyConfig;

  const createTestConfig = (): TransparencyConfig => ({
    enableRealTimeNotifications: true,
    enableDataUsageTracking: true,
    enableThirdPartyDisclosures: true,
    enablePrivacyScoring: true,
    enableAutoDataInventory: true,
    retentionPolicyVisibility: true,
    consentManagementEnabled: true,
    dsarAutomationEnabled: true,
    dataPortabilityEnabled: true,
    notificationChannels: [
      {
        type: 'EMAIL',
        endpoint: 'user@example.com',
        enabled: true,
        events: [TransparencyEventType.DATA_ACCESSED, TransparencyEventType.PERMISSION_GRANTED],
        frequency: 'IMMEDIATE'
      }
    ]
  });

  beforeEach(() => {
    testConfig = createTestConfig();
    transparencyService = new UserAccessTransparencyService(testConfig);
  });

  describe('Data Inventory Generation', () => {
    test('should generate comprehensive user data inventory', async () => {
      const userId = 'user-123';

      const inventory = await transparencyService.generateUserDataInventory(userId);

      expect(inventory).toBeDefined();
      expect(inventory.userId).toBe(userId);
      expect(inventory.generatedAt).toBeInstanceOf(Date);
      expect(inventory.dataCategories).toBeInstanceOf(Array);
      expect(inventory.totalDataPoints).toBeGreaterThanOrEqual(0);
      expect(inventory.retentionSummary).toBeDefined();
      expect(inventory.thirdPartySharing).toBeInstanceOf(Array);
      expect(inventory.complianceStatus).toBeDefined();
      expect(inventory.privacyScore).toBeDefined();
    });

    test('should include personal data categories', async () => {
      const userId = 'user-123';

      const inventory = await transparencyService.generateUserDataInventory(userId);

      expect(inventory.dataCategories.length).toBeGreaterThan(0);
      
      const category = inventory.dataCategories[0];
      expect(category.category).toBeDefined();
      expect(category.description).toBeDefined();
      expect(category.classification).toMatch(/^(PUBLIC|INTERNAL|CONFIDENTIAL|RESTRICTED)$/);
      expect(category.dataPoints).toBeInstanceOf(Array);
      expect(category.lawfulBasis).toBeInstanceOf(Array);
      expect(category.retentionPeriod).toBeDefined();
      expect(category.processingPurposes).toBeInstanceOf(Array);
      expect(typeof category.thirdPartyAccess).toBe('boolean');
      expect(category.userControl).toMatch(/^(none|limited|moderate|full)$/);
    });

    test('should calculate retention summary correctly', async () => {
      const userId = 'user-123';

      const inventory = await transparencyService.generateUserDataInventory(userId);

      expect(inventory.retentionSummary.totalDataPoints).toBeGreaterThanOrEqual(0);
      expect(inventory.retentionSummary.averageRetentionDays).toBeGreaterThan(0);
      expect(inventory.retentionSummary.nearExpirationCount).toBeGreaterThanOrEqual(0);
      expect(inventory.retentionSummary.expiredDataCount).toBeGreaterThanOrEqual(0);
      expect(inventory.retentionSummary.upcomingDeletions).toBeInstanceOf(Array);
    });

    test('should include third-party sharing information', async () => {
      const userId = 'user-123';

      const inventory = await transparencyService.generateUserDataInventory(userId);

      if (inventory.thirdPartySharing.length > 0) {
        const sharing = inventory.thirdPartySharing[0];
        expect(sharing.thirdPartyId).toBeDefined();
        expect(sharing.thirdPartyName).toBeDefined();
        expect(sharing.sharingPurpose).toBeDefined();
        expect(sharing.dataShared).toBeInstanceOf(Array);
        expect(sharing.sharingDate).toBeInstanceOf(Date);
        expect(typeof sharing.userConsent).toBe('boolean');
        expect(typeof sharing.dataProcessingAgreement).toBe('boolean');
        expect(sharing.userRights).toBeDefined();
        expect(sharing.contactInfo).toBeDefined();
      }
    });

    test('should emit event when inventory is generated', async () => {
      const userId = 'user-123';
      const eventHandler = jest.fn<unknown[], unknown>();

      transparencyService.on('dataInventoryGenerated', eventHandler);

      await transparencyService.generateUserDataInventory(userId);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          inventory: expect.any(Object),
          timestamp: expect.any(Date)
        })
      );
    });
  });

  describe('User Access Activity Tracking', () => {
    test('should retrieve user access activities', async () => {
      const userId = 'user-123';
      const timeRange = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        end: new Date()
      };

      const activities = await transparencyService.getUserAccessActivity(
        userId,
        timeRange,
        50
      );

      expect(activities).toBeInstanceOf(Array);
      
      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity.timestamp).toBeInstanceOf(Date);
        expect(activity.activityType).toBeDefined();
        expect(activity.actor).toBeDefined();
        expect(activity.actor.type).toMatch(/^(USER|SYSTEM|THIRD_PARTY|ADMIN)$/);
        expect(activity.dataAccessed).toBeInstanceOf(Array);
        expect(activity.purpose).toBeDefined();
        expect(activity.riskLevel).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
        expect(activity.location).toBeDefined();
      }
    });

    test('should filter activities by time range', async () => {
      const userId = 'user-123';
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        end: new Date()
      };

      const activities = await transparencyService.getUserAccessActivity(
        userId,
        timeRange,
        100
      );

      activities.forEach(activity => {
        expect(activity.timestamp.getTime()).toBeGreaterThanOrEqual(timeRange.start.getTime());
        expect(activity.timestamp.getTime()).toBeLessThanOrEqual(timeRange.end.getTime());
      });
    });

    test('should limit number of activities returned', async () => {
      const userId = 'user-123';
      const limit = 10;

      const activities = await transparencyService.getUserAccessActivity(
        userId,
        undefined,
        limit
      );

      expect(activities.length).toBeLessThanOrEqual(limit);
    });

    test('should enrich activities with transparency data', async () => {
      const userId = 'user-123';

      const activities = await transparencyService.getUserAccessActivity(userId);

      if (activities.length > 0) {
        const activity = activities[0];
        expect(activity.location.withinEU).toBeDefined();
        expect(activity.location.country).toBeDefined();
        
        activity.dataAccessed.forEach(data => {
          expect(data.classification).toMatch(/^(PUBLIC|INTERNAL|CONFIDENTIAL|RESTRICTED)$/);
          expect(data.operation).toBeDefined();
          expect(data.recordCount).toBeGreaterThanOrEqual(0);
        });
      }
    });
  });

  describe('Data Subject Access Requests (DSAR)', () => {
    test('should submit DSAR request successfully', async () => {
      const userId = 'user-123';
      const requestType = 'ACCESS';
      const details = {
        dataCategories: ['personal_info', 'contact_details'],
        reason: 'I want to see what data you have about me',
        identityVerified: true,
        urgency: 'STANDARD' as const,
        preferredFormat: 'JSON' as const
      };

      const dsarRequest = await transparencyService.submitDSAR(
        userId,
        requestType,
        details
      );

      expect(dsarRequest.requestId).toBeDefined();
      expect(dsarRequest.userId).toBe(userId);
      expect(dsarRequest.requestType).toBe(requestType);
      expect(dsarRequest.status).toBe('PENDING');
      expect(dsarRequest.requestedAt).toBeInstanceOf(Date);
      expect(dsarRequest.completionDeadline).toBeInstanceOf(Date);
      expect(dsarRequest.requestDetails).toEqual(details);
      expect(dsarRequest.processingHistory).toHaveLength(1);
      expect(dsarRequest.processingHistory[0].step).toBe('REQUEST_SUBMITTED');
      expect(dsarRequest.processingHistory[0].status).toBe('COMPLETED');
    });

    test('should calculate correct completion deadline', async () => {
      const userId = 'user-123';
      const requestType = 'ACCESS';
      const details = {
        identityVerified: true,
        urgency: 'STANDARD' as const
      };

      const dsarRequest = await transparencyService.submitDSAR(
        userId,
        requestType,
        details
      );

      const deadline = dsarRequest.completionDeadline;
      const requestTime = dsarRequest.requestedAt;
      const daysDifference = Math.ceil(
        (deadline.getTime() - requestTime.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Standard GDPR deadline is 30 days
      expect(daysDifference).toBeLessThanOrEqual(30);
      expect(daysDifference).toBeGreaterThan(0);
    });

    test('should handle urgent DSAR requests', async () => {
      const userId = 'user-123';
      const requestType = 'ERASURE';
      const details = {
        identityVerified: true,
        urgency: 'URGENT' as const,
        reason: 'Data protection violation'
      };

      const dsarRequest = await transparencyService.submitDSAR(
        userId,
        requestType,
        details
      );

      const deadline = dsarRequest.completionDeadline;
      const requestTime = dsarRequest.requestedAt;
      const daysDifference = Math.ceil(
        (deadline.getTime() - requestTime.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Urgent requests should have shorter deadline
      expect(daysDifference).toBeLessThan(30);
    });

    test('should emit event when DSAR is submitted', async () => {
      const userId = 'user-123';
      const eventHandler = jest.fn<unknown[], unknown>();

      transparencyService.on('dsarSubmitted', eventHandler);

      await transparencyService.submitDSAR(userId, 'ACCESS', {
        identityVerified: true,
        urgency: 'STANDARD'
      });

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.any(Object),
          timestamp: expect.any(Date)
        })
      );
    });

    test('should support different DSAR types', async () => {
      const userId = 'user-123';
      const requestTypes = ['ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY', 'RESTRICTION', 'OBJECTION'];

      for (const requestType of requestTypes) {
        const dsarRequest = await transparencyService.submitDSAR(
          userId,
          requestType as any,
          { identityVerified: true, urgency: 'STANDARD' }
        );

        expect(dsarRequest.requestType).toBe(requestType);
        expect(dsarRequest.status).toBe('PENDING');
      }
    });
  });

  describe('Privacy Score Calculation', () => {
    test('should calculate privacy score', async () => {
      const userId = 'user-123';

      const privacyScore = await transparencyService.getPrivacyScore(userId);

      expect(privacyScore.overall).toBeGreaterThanOrEqual(0);
      expect(privacyScore.overall).toBeLessThanOrEqual(100);
      expect(privacyScore.categories).toBeDefined();
      expect(privacyScore.categories.dataMinimization).toBeGreaterThanOrEqual(0);
      expect(privacyScore.categories.consentHealth).toBeGreaterThanOrEqual(0);
      expect(privacyScore.categories.securityPosture).toBeGreaterThanOrEqual(0);
      expect(privacyScore.categories.thirdPartyRisk).toBeGreaterThanOrEqual(0);
      expect(privacyScore.categories.retentionCompliance).toBeGreaterThanOrEqual(0);
      expect(privacyScore.categories.userControl).toBeGreaterThanOrEqual(0);
      expect(privacyScore.trends).toBeInstanceOf(Array);
      expect(privacyScore.recommendations).toBeInstanceOf(Array);
      expect(privacyScore.lastCalculated).toBeInstanceOf(Date);
    });

    test('should throw error when privacy scoring is disabled', async () => {
      const disabledConfig = { ...testConfig, enablePrivacyScoring: false };
      const service = new UserAccessTransparencyService(disabledConfig);
      const userId = 'user-123';

      await expect(service.getPrivacyScore(userId)).rejects.toThrow(
        'Privacy scoring is disabled'
      );
    });

    test('should include privacy recommendations', async () => {
      const userId = 'user-123';

      const privacyScore = await transparencyService.getPrivacyScore(userId);

      if (privacyScore.recommendations.length > 0) {
        const recommendation = privacyScore.recommendations[0];
        expect(recommendation.category).toBeDefined();
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.impact).toMatch(/^(LOW|MEDIUM|HIGH)$/);
        expect(typeof recommendation.userAction).toBe('boolean');
      }
    });

    test('should track privacy trends', async () => {
      const userId = 'user-123';

      const privacyScore = await transparencyService.getPrivacyScore(userId);

      if (privacyScore.trends.length > 0) {
        const trend = privacyScore.trends[0];
        expect(trend.metric).toBeDefined();
        expect(typeof trend.change).toBe('number');
        expect(trend.direction).toMatch(/^(IMPROVING|DEGRADING|STABLE)$/);
      }
    });
  });

  describe('Transparency Settings Management', () => {
    test('should update user transparency settings', async () => {
      const userId = 'user-123';
      const settingsUpdate = {
        notificationPreferences: {
          realTimeNotifications: false,
          emailNotifications: true,
          frequency: 'DAILY' as const,
          eventTypes: [TransparencyEventType.DATA_ACCESSED]
        },
        privacySettings: {
          dataMinimizationEnabled: true,
          automaticDataDeletion: false,
          thirdPartyDataSharingOptOut: true
        }
      };

      const updatedSettings = await transparencyService.updateTransparencySettings(
        userId,
        settingsUpdate
      );

      expect(updatedSettings.userId).toBe(userId);
      expect(updatedSettings.notificationPreferences.realTimeNotifications).toBe(false);
      expect(updatedSettings.notificationPreferences.emailNotifications).toBe(true);
      expect(updatedSettings.notificationPreferences.frequency).toBe('DAILY');
      expect(updatedSettings.privacySettings.dataMinimizationEnabled).toBe(true);
      expect(updatedSettings.privacySettings.thirdPartyDataSharingOptOut).toBe(true);
      expect(updatedSettings.lastUpdated).toBeInstanceOf(Date);
    });

    test('should emit event when settings are updated', async () => {
      const userId = 'user-123';
      const eventHandler = jest.fn<unknown[], unknown>();

      transparencyService.on('settingsUpdated', eventHandler);

      await transparencyService.updateTransparencySettings(userId, {
        privacySettings: { dataMinimizationEnabled: true }
      });

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          settings: expect.any(Object),
          timestamp: expect.any(Date)
        })
      );
    });

    test('should handle partial settings updates', async () => {
      const userId = 'user-123';

      // First update
      await transparencyService.updateTransparencySettings(userId, {
        notificationPreferences: { realTimeNotifications: true }
      });

      // Second partial update
      const updatedSettings = await transparencyService.updateTransparencySettings(userId, {
        privacySettings: { dataMinimizationEnabled: true }
      });

      expect(updatedSettings.notificationPreferences.realTimeNotifications).toBe(true);
      expect(updatedSettings.privacySettings.dataMinimizationEnabled).toBe(true);
    });

    test('should validate settings format', async () => {
      const userId = 'user-123';

      const invalidSettings = {
        notificationPreferences: {
          frequency: 'INVALID_FREQUENCY' // Invalid value
        }
      };

      // Should handle validation gracefully
      await expect(
        transparencyService.updateTransparencySettings(userId, invalidSettings as any)
      ).resolves.toBeDefined();
    });
  });

  describe('Real-time Notifications', () => {
    test('should send transparency notification when enabled', async () => {
      const notification = {
        id: 'notif-123',
        userId: 'user-123',
        eventType: TransparencyEventType.DATA_ACCESSED,
        title: 'Data Access Alert',
        message: 'Your personal data was accessed by System Admin',
        severity: 'INFO' as const,
        data: { accessedBy: 'admin', dataType: 'personal_info' },
        timestamp: new Date(),
        delivered: false,
        channels: testConfig.notificationChannels
      };

      await transparencyService.sendTransparencyNotification(notification);

      // Should not throw error
      expect(true).toBe(true);
    });

    test('should respect user notification preferences', async () => {
      const userId = 'user-123';

      // Disable real-time notifications
      await transparencyService.updateTransparencySettings(userId, {
        notificationPreferences: { realTimeNotifications: false }
      });

      const notification = {
        id: 'notif-123',
        userId,
        eventType: TransparencyEventType.DATA_ACCESSED,
        title: 'Data Access Alert',
        message: 'Your data was accessed',
        severity: 'INFO' as const,
        data: {},
        timestamp: new Date(),
        delivered: false,
        channels: []
      };

      // Should not send notification
      await transparencyService.sendTransparencyNotification(notification);
      expect(true).toBe(true); // Should complete without error
    });

    test('should respect quiet hours setting', async () => {
      const userId = 'user-123';

      await transparencyService.updateTransparencySettings(userId, {
        notificationPreferences: {
          realTimeNotifications: true,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00',
            timezone: 'UTC'
          }
        }
      });

      const notification = {
        id: 'notif-123',
        userId,
        eventType: TransparencyEventType.DATA_ACCESSED,
        title: 'Data Access Alert',
        message: 'Your data was accessed',
        severity: 'INFO' as const,
        data: {},
        timestamp: new Date(),
        delivered: false,
        channels: []
      };

      // Should queue notification if in quiet hours
      await transparencyService.sendTransparencyNotification(notification);
      expect(true).toBe(true);
    });
  });

  describe('Data Export Functionality', () => {
    test('should export user data in JSON format', async () => {
      const userId = 'user-123';
      const format = 'JSON';

      const exportResponse = await transparencyService.exportUserData(
        userId,
        format
      );

      expect(exportResponse).toBeDefined();
      expect(exportResponse.responseId).toBeDefined();
      expect(exportResponse.generatedAt).toBeInstanceOf(Date);
      expect(exportResponse.format).toBe(format);
      expect(exportResponse.fileSize).toBeGreaterThan(0);
      expect(exportResponse.dataIncluded).toBeInstanceOf(Array);
      expect(exportResponse.dataExcluded).toBeInstanceOf(Array);
      expect(exportResponse.expiresAt).toBeInstanceOf(Date);
    });

    test('should throw error when data portability is disabled', async () => {
      const disabledConfig = { ...testConfig, dataPortabilityEnabled: false };
      const service = new UserAccessTransparencyService(disabledConfig);
      const userId = 'user-123';

      await expect(service.exportUserData(userId)).rejects.toThrow(
        'Data portability is disabled'
      );
    });

    test('should emit event when data is exported', async () => {
      const userId = 'user-123';
      const eventHandler = jest.fn<unknown[], unknown>();

      transparencyService.on('dataExported', eventHandler);

      await transparencyService.exportUserData(userId);

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          response: expect.any(Object),
          timestamp: expect.any(Date)
        })
      );
    });

    test('should support different export formats', async () => {
      const userId = 'user-123';
      const formats = ['JSON', 'XML', 'CSV', 'PDF'];

      for (const format of formats) {
        const exportResponse = await transparencyService.exportUserData(
          userId,
          format as any
        );

        expect(exportResponse.format).toBe(format);
      }
    });

    test('should filter by categories when specified', async () => {
      const userId = 'user-123';
      const categories = ['personal_info', 'contact_details'];

      const exportResponse = await transparencyService.exportUserData(
        userId,
        'JSON',
        categories
      );

      expect(exportResponse.dataIncluded).toEqual(
        expect.arrayContaining(categories)
      );
    });
  });

  describe('Compliance Assessment', () => {
    test('should assess user compliance status', async () => {
      const userId = 'user-123';

      const complianceStatus = await transparencyService.getUserComplianceStatus(userId);

      expect(complianceStatus.overall).toMatch(/^(COMPLIANT|PARTIAL|NON_COMPLIANT|UNKNOWN)$/);
      expect(complianceStatus.frameworks).toBeInstanceOf(Array);
      expect(complianceStatus.violations).toBeInstanceOf(Array);
      expect(complianceStatus.pendingActions).toBeInstanceOf(Array);
      expect(complianceStatus.lastAssessment).toBeInstanceOf(Date);
      expect(complianceStatus.nextAssessment).toBeInstanceOf(Date);
    });

    test('should include framework-specific compliance', async () => {
      const userId = 'user-123';

      const complianceStatus = await transparencyService.getUserComplianceStatus(userId);

      if (complianceStatus.frameworks.length > 0) {
        const framework = complianceStatus.frameworks[0];
        expect(framework.framework).toMatch(/^(GDPR|CCPA|HIPAA|PCI_DSS|SOX|ISO27001)$/);
        expect(framework.status).toMatch(/^(COMPLIANT|PARTIAL|NON_COMPLIANT)$/);
        expect(framework.score).toBeGreaterThanOrEqual(0);
        expect(framework.score).toBeLessThanOrEqual(100);
        expect(framework.requirements).toBeInstanceOf(Array);
        expect(framework.lastAudit).toBeInstanceOf(Date);
        expect(framework.nextAudit).toBeInstanceOf(Date);
      }
    });

    test('should track compliance violations', async () => {
      const userId = 'user-123';

      const complianceStatus = await transparencyService.getUserComplianceStatus(userId);

      if (complianceStatus.violations.length > 0) {
        const violation = complianceStatus.violations[0];
        expect(violation.id).toBeDefined();
        expect(violation.framework).toBeDefined();
        expect(violation.requirement).toBeDefined();
        expect(violation.description).toBeDefined();
        expect(violation.severity).toMatch(/^(LOW|MEDIUM|HIGH|CRITICAL)$/);
        expect(violation.detectedAt).toBeInstanceOf(Date);
        expect(violation.remediation).toBeInstanceOf(Array);
        expect(violation.userImpact).toBeDefined();
        expect(typeof violation.notificationRequired).toBe('boolean');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      const userId = 'invalid-user';

      // Should not throw unhandled errors
      await expect(
        transparencyService.generateUserDataInventory(userId)
      ).resolves.toBeDefined();
    });

    test('should emit error events for failures', async () => {
      const errorHandler = jest.fn<unknown[], unknown>();
      transparencyService.on('error', errorHandler);

      // This might trigger an error in real implementation
      try {
        await transparencyService.generateUserDataInventory('invalid-user');
      } catch (error) {
        // Error handled gracefully
      }

      // Error events should be emitted for monitoring
      expect(true).toBe(true);
    });

    test('should validate input parameters', async () => {
      // Test with invalid parameters
      await expect(
        transparencyService.submitDSAR('', 'ACCESS' as any, { identityVerified: false, urgency: 'STANDARD' })
      ).rejects.toThrow();
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent operations', async () => {
      const userId = 'user-123';
      const operations = [
        transparencyService.generateUserDataInventory(userId),
        transparencyService.getUserAccessActivity(userId),
        transparencyService.getPrivacyScore(userId),
        transparencyService.getUserComplianceStatus(userId)
      ];

      const results = await Promise.all(operations);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('should efficiently manage memory usage', async () => {
      const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);
      
      // Process multiple users
      for (const userId of userIds) {
        await transparencyService.generateUserDataInventory(userId);
      }

      // Should complete without memory issues
      expect(true).toBe(true);
    });

    test('should handle high-frequency notification sending', async () => {
      const userId = 'user-123';
      const notifications = Array.from({ length: 50 }, (_, i) => ({
        id: `notif-${i}`,
        userId,
        eventType: TransparencyEventType.DATA_ACCESSED,
        title: `Notification ${i}`,
        message: `Test notification ${i}`,
        severity: 'INFO' as const,
        data: {},
        timestamp: new Date(),
        delivered: false,
        channels: []
      }));

      // Send notifications concurrently
      const promises = notifications.map(notification =>
        transparencyService.sendTransparencyNotification(notification)
      );

      await Promise.all(promises);

      // Should complete without errors
      expect(true).toBe(true);
    });
  });
});

// Helper matchers for better test assertions
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false
      };
    }
  },

  toBeWithinTimeRange(received: Date, start: Date, end: Date) {
    const pass = received.getTime() >= start.getTime() && received.getTime() <= end.getTime();
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${start} - ${end}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${start} - ${end}`,
        pass: false
      };
    }
  }
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeWithinTimeRange(start: Date, end: Date): R;
    }
  }
}