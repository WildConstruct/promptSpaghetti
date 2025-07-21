/**
 * Tests for Classification Monitoring Service
 * 
 * Comprehensive test suite covering event monitoring,
 * threshold detection, and dashboard functionality.
 */

import ClassificationMonitoringService, {
  MonitoringEvent,
  MonitoringAlert,
  MonitoringThreshold,
  UserActivity,
  ClassificationStats
} from '../ClassificationMonitoringService';
import { 
  DataClassificationLevel, 
  OperationContext
} from '../../types/DataClassification';

describe('ClassificationMonitoringService', () => {
  let service: ClassificationMonitoringService;
  let mockContext: OperationContext;

  beforeEach(() => {
    service = new ClassificationMonitoringService();
    
    mockContext = {
      operation: 'read',
      userId: 'user123',
      sessionId: 'session123',
      purpose: 'data analysis',
      environment: 'production',
      timestamp: new Date(),
      source: '192.168.1.100',
      requestId: 'req123'
    };
  });

  describe('Event Recording', () => {
    it('should record monitoring events', async () => {
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'INTERNAL',
        userId: 'user123',
        dataId: 'data123',
        operation: 'read',
        result: 'SUCCESS',
        details: { fileSize: 1024 },
        context: mockContext,
        metrics: {
          processingTimeMs: 50,
          dataSize: 1024
        }
      });

      const events = service.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].classification).toBe('INTERNAL');
      expect(events[0].result).toBe('SUCCESS');
    });

    it('should update classification statistics when recording events', async () => {
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'CONFIDENTIAL',
        userId: 'user123',
        dataId: 'data123',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext,
        metrics: {
          processingTimeMs: 100
        }
      });

      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'VIOLATION',
        classification: 'CONFIDENTIAL',
        userId: 'user456',
        dataId: 'data456',
        operation: 'write',
        result: 'FAILURE',
        details: { reason: 'Insufficient permissions' },
        context: mockContext,
        metrics: {
          processingTimeMs: 50
        }
      });

      const stats = service.getClassificationStats('CONFIDENTIAL');
      expect(stats).toHaveLength(1);
      expect(stats[0].totalEvents).toBe(2);
      expect(stats[0].successCount).toBe(1);
      expect(stats[0].failureCount).toBe(1);
      expect(stats[0].averageProcessingTime).toBe(75); // (100 + 50) / 2
    });

    it('should track user activity across events', async () => {
      const userId = 'user123';

      // Record multiple events for the same user
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'PUBLIC',
        userId,
        dataId: 'data1',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext
      });

      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'RESTRICTED',
        userId,
        dataId: 'data2',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext
      });

      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'VIOLATION',
        classification: 'CONFIDENTIAL',
        userId,
        dataId: 'data3',
        operation: 'write',
        result: 'FAILURE',
        details: {},
        context: mockContext
      });

      const userActivity = service.getUserActivity(userId);
      expect(userActivity).toBeDefined();
      expect(userActivity?.totalEvents).toBe(3);
      expect(userActivity?.classificationCounts.PUBLIC).toBe(1);
      expect(userActivity?.classificationCounts.RESTRICTED).toBe(1);
      expect(userActivity?.classificationCounts.CONFIDENTIAL).toBe(1);
      expect(userActivity?.violationCount).toBe(1);
    });

    it('should handle real-time event notifications', async () => {
      const receivedEvents: MonitoringEvent[] = [];
      
      service.onEvent((event) => {
        receivedEvents.push(event);
      });

      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'INTERNAL',
        userId: 'user123',
        dataId: 'data123',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext
      });

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0].eventType).toBe('ACCESS');
    });
  });

  describe('Threshold Monitoring', () => {
    it('should trigger alerts when thresholds are exceeded', async () => {
      const receivedAlerts: MonitoringAlert[] = [];
      
      service.onAlert((alert) => {
        receivedAlerts.push(alert);
      });

      // Generate events that should trigger violation rate threshold
      for (let i = 0; i < 10; i++) {
        await service.recordEvent({
          timestamp: new Date(),
          eventType: i < 8 ? 'ACCESS' : 'VIOLATION',
          classification: 'INTERNAL',
          userId: `user${i}`,
          dataId: `data${i}`,
          operation: 'read',
          result: i < 8 ? 'SUCCESS' : 'FAILURE',
          details: {},
          context: mockContext
        });
      }

      // Should trigger high violation rate alert (20% > 10% threshold)
      expect(receivedAlerts.length).toBeGreaterThan(0);
      const violationAlert = receivedAlerts.find(a => a.type === 'THRESHOLD_EXCEEDED');
      expect(violationAlert).toBeDefined();
      expect(violationAlert?.severity).toBe('HIGH');
    });

    it('should respect threshold cooldown periods', async () => {
      const receivedAlerts: MonitoringAlert[] = [];
      
      service.onAlert((alert) => {
        receivedAlerts.push(alert);
      });

      // First event should trigger alert
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'COMPLIANCE_CHECK',
        classification: 'CONFIDENTIAL',
        userId: 'user123',
        dataId: 'data123',
        operation: 'validate',
        result: 'WARNING',
        details: {},
        context: mockContext,
        metrics: {
          processingTimeMs: 100,
          complianceScore: 70 // Below 80 threshold
        }
      });

      const initialAlertCount = receivedAlerts.length;

      // Second event should not trigger due to cooldown
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'COMPLIANCE_CHECK',
        classification: 'CONFIDENTIAL',
        userId: 'user456',
        dataId: 'data456',
        operation: 'validate',
        result: 'WARNING',
        details: {},
        context: mockContext,
        metrics: {
          processingTimeMs: 120,
          complianceScore: 60
        }
      });

      expect(receivedAlerts.length).toBe(initialAlertCount);
    });

    it('should allow threshold configuration updates', () => {
      const threshold = service.getThreshold('high-violation-rate');
      expect(threshold).toBeDefined();
      expect(threshold?.value).toBe(0.1);

      service.updateThreshold('high-violation-rate', {
        value: 0.2,
        enabled: false
      });

      const updatedThreshold = service.getThreshold('high-violation-rate');
      expect(updatedThreshold?.value).toBe(0.2);
      expect(updatedThreshold?.enabled).toBe(false);
    });
  });

  describe('Suspicious Activity Detection', () => {
    it('should detect rapid access to restricted data', async () => {
      const userId = 'suspicious-user';

      // Generate many restricted data access events
      for (let i = 0; i < 15; i++) {
        await service.recordEvent({
          timestamp: new Date(),
          eventType: 'ACCESS',
          classification: 'RESTRICTED',
          userId,
          dataId: `data${i}`,
          operation: 'read',
          result: 'SUCCESS',
          details: {},
          context: mockContext
        });
      }

      const userActivity = service.getUserActivity(userId);
      expect(userActivity?.suspiciousActivities).toContain('Rapid access to restricted data');
    });

    it('should detect multiple violations in short time', async () => {
      const userId = 'violating-user';

      // Generate multiple violation events
      for (let i = 0; i < 5; i++) {
        await service.recordEvent({
          timestamp: new Date(),
          eventType: 'VIOLATION',
          classification: 'CONFIDENTIAL',
          userId,
          dataId: `data${i}`,
          operation: 'write',
          result: 'FAILURE',
          details: { reason: 'Access denied' },
          context: mockContext
        });
      }

      const userActivity = service.getUserActivity(userId);
      expect(userActivity?.suspiciousActivities).toContain('Multiple access violations');
    });

    it('should detect unusual access times', async () => {
      const userId = 'night-user';
      
      // Mock date to simulate night time access
      const nightTime = new Date();
      nightTime.setHours(3, 0, 0, 0); // 3 AM

      const originalDate = Date;
      global.Date = jest.fn(() => nightTime) as any;
      global.Date.now = originalDate.now;

      await service.recordEvent({
        timestamp: nightTime,
        eventType: 'VIOLATION',
        classification: 'RESTRICTED',
        userId,
        dataId: 'data123',
        operation: 'read',
        result: 'FAILURE',
        details: {},
        context: mockContext
      });

      global.Date = originalDate;

      const userActivity = service.getUserActivity(userId);
      expect(userActivity?.suspiciousActivities).toContain('Unusual access time');
    });

    it('should calculate user risk scores based on activities', async () => {
      const userId = 'risky-user';

      // Generate various events that contribute to risk
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'VIOLATION',
        classification: 'RESTRICTED',
        userId,
        dataId: 'data1',
        operation: 'read',
        result: 'FAILURE',
        details: {},
        context: mockContext
      });

      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'RESTRICTED',
        userId,
        dataId: 'data2',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext
      });

      const userActivity = service.getUserActivity(userId);
      expect(userActivity?.riskScore).toBeGreaterThan(0);
      expect(userActivity?.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Dashboard and Reporting', () => {
    it('should generate comprehensive dashboard data', async () => {
      // Generate various events
      const classifications: DataClassificationLevel[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
      const results = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILURE', 'WARNING'] as const;

      for (let i = 0; i < 20; i++) {
        await service.recordEvent({
          timestamp: new Date(),
          eventType: i % 5 === 0 ? 'VIOLATION' : 'ACCESS',
          classification: classifications[i % 4],
          userId: `user${i % 3}`,
          dataId: `data${i}`,
          operation: 'read',
          result: results[i % 5],
          details: {},
          context: mockContext,
          metrics: {
            processingTimeMs: 50 + (i * 10),
            complianceScore: 80 + (i % 20)
          }
        });
      }

      const dashboard = service.getDashboard();

      expect(dashboard.overallStats).toBeDefined();
      expect(dashboard.overallStats.totalEvents).toBeGreaterThan(0);
      expect(dashboard.overallStats.activeUsers).toBeGreaterThan(0);
      expect(dashboard.overallStats.successRate).toBeGreaterThan(0);

      expect(dashboard.classificationBreakdown).toHaveLength(4);
      expect(dashboard.topUsers.length).toBeGreaterThan(0);
      expect(dashboard.trendData.length).toBeGreaterThan(0);
    });

    it('should filter events by various criteria', async () => {
      // Generate test events
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'INTERNAL',
        userId: 'user123',
        dataId: 'data1',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext
      });

      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'VIOLATION',
        classification: 'CONFIDENTIAL',
        userId: 'user456',
        dataId: 'data2',
        operation: 'write',
        result: 'FAILURE',
        details: {},
        context: mockContext
      });

      // Test filtering by classification
      const internalEvents = service.getEvents({ classification: 'INTERNAL' });
      expect(internalEvents).toHaveLength(1);
      expect(internalEvents[0].classification).toBe('INTERNAL');

      // Test filtering by user
      const userEvents = service.getEvents({ userId: 'user123' });
      expect(userEvents).toHaveLength(1);
      expect(userEvents[0].userId).toBe('user123');

      // Test filtering by result
      const failureEvents = service.getEvents({ result: 'FAILURE' });
      expect(failureEvents).toHaveLength(1);
      expect(failureEvents[0].result).toBe('FAILURE');
    });

    it('should export monitoring data in different formats', async () => {
      // Generate some test data
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'INTERNAL',
        userId: 'user123',
        dataId: 'data123',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext
      });

      // Test JSON export
      const jsonExport = service.exportData('json');
      const parsedJson = JSON.parse(jsonExport);
      expect(parsedJson.events).toHaveLength(1);
      expect(parsedJson.statistics).toBeDefined();
      expect(parsedJson.exportDate).toBeDefined();

      // Test CSV export
      const csvExport = service.exportData('csv');
      const csvLines = csvExport.split('\n');
      expect(csvLines[0]).toContain('timestamp,eventType,classification');
      expect(csvLines).toHaveLength(2); // Header + 1 data row
    });
  });

  describe('Alert Management', () => {
    it('should create and manage alerts', async () => {
      const receivedAlerts: MonitoringAlert[] = [];
      
      service.onAlert((alert) => {
        receivedAlerts.push(alert);
      });

      // Trigger an alert
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'COMPLIANCE_CHECK',
        classification: 'RESTRICTED',
        userId: 'user123',
        dataId: 'data123',
        operation: 'validate',
        result: 'FAILURE',
        details: {},
        context: mockContext,
        metrics: {
          processingTimeMs: 150,
          complianceScore: 50 // Very low compliance
        }
      });

      expect(receivedAlerts.length).toBeGreaterThan(0);
      
      const alerts = service.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      
      const unresolvedAlerts = service.getAlerts(true);
      expect(unresolvedAlerts.length).toBe(alerts.length);
    });

    it('should allow alert resolution', async () => {
      // Trigger an alert
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'COMPLIANCE_CHECK',
        classification: 'CONFIDENTIAL',
        userId: 'user123',
        dataId: 'data123',
        operation: 'validate',
        result: 'FAILURE',
        details: {},
        context: mockContext,
        metrics: {
          processingTimeMs: 180,
          complianceScore: 60
        }
      });

      const alerts = service.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);

      const alertId = alerts[0].id;
      service.resolveAlert(alertId, 'admin-user');

      const resolvedAlert = service.getAlerts().find(a => a.id === alertId);
      expect(resolvedAlert?.resolved).toBe(true);
      expect(resolvedAlert?.resolvedBy).toBe('admin-user');
      expect(resolvedAlert?.resolvedAt).toBeDefined();

      const unresolvedAlerts = service.getAlerts(true);
      expect(unresolvedAlerts).not.toContain(resolvedAlert);
    });
  });

  describe('Data Management', () => {
    it('should limit stored events to prevent memory issues', async () => {
      // Generate more than 10000 events
      for (let i = 0; i < 10005; i++) {
        await service.recordEvent({
          timestamp: new Date(),
          eventType: 'ACCESS',
          classification: 'PUBLIC',
          userId: `user${i}`,
          dataId: `data${i}`,
          operation: 'read',
          result: 'SUCCESS',
          details: {},
          context: mockContext
        });
      }

      const events = service.getEvents();
      expect(events.length).toBeLessThanOrEqual(10000);
    });

    it('should clear all monitoring data when requested', async () => {
      // Generate some data
      await service.recordEvent({
        timestamp: new Date(),
        eventType: 'ACCESS',
        classification: 'INTERNAL',
        userId: 'user123',
        dataId: 'data123',
        operation: 'read',
        result: 'SUCCESS',
        details: {},
        context: mockContext
      });

      expect(service.getEvents()).toHaveLength(1);
      expect(service.getUserActivity('user123')).toBeDefined();

      // Clear all data
      service.clearData();

      expect(service.getEvents()).toHaveLength(0);
      expect(service.getUserActivity('user123')).toBeUndefined();
      expect(service.getAlerts()).toHaveLength(0);
      
      // Stats should be reinitialized
      const stats = service.getClassificationStats();
      expect(stats).toHaveLength(4);
      stats.forEach(stat => {
        expect(stat.totalEvents).toBe(0);
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should track processing time metrics accurately', async () => {
      const times = [100, 200, 150, 175];
      
      for (const time of times) {
        await service.recordEvent({
          timestamp: new Date(),
          eventType: 'ACCESS',
          classification: 'INTERNAL',
          userId: 'user123',
          dataId: 'data123',
          operation: 'read',
          result: 'SUCCESS',
          details: {},
          context: mockContext,
          metrics: {
            processingTimeMs: time
          }
        });
      }

      const stats = service.getClassificationStats('INTERNAL');
      expect(stats[0].averageProcessingTime).toBe(156.25); // (100+200+150+175)/4
    });

    it('should calculate compliance rates correctly', async () => {
      const scores = [100, 80, 90, 70, 85];
      
      for (const score of scores) {
        await service.recordEvent({
          timestamp: new Date(),
          eventType: 'COMPLIANCE_CHECK',
          classification: 'CONFIDENTIAL',
          userId: 'user123',
          dataId: 'data123',
          operation: 'validate',
          result: 'SUCCESS',
          details: {},
          context: mockContext,
          metrics: {
            processingTimeMs: 100,
            complianceScore: score
          }
        });
      }

      const stats = service.getClassificationStats('CONFIDENTIAL');
      expect(stats[0].complianceRate).toBe(85); // (100+80+90+70+85)/5
    });
  });
});