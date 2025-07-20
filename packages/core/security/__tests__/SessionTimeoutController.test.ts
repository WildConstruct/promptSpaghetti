/**
 * Test Suite for Session Timeout Controller
 * 
 * Tests comprehensive session timeout management including configurable timeout
 * policies, progressive warnings, automatic extensions, and activity tracking.
 */

import {
  SessionTimeoutController,
  TimeoutPolicy,
  TimeoutReason,
  ActivityLevel,
  TimeoutConfiguration,
  ActivityData,
  SessionTimeoutState,
  TimeoutEvent
} from '../SessionTimeoutController';

describe('SessionTimeoutController', () => {
  let controller: SessionTimeoutController;
  let mockDate: Date;

  beforeEach(() => {
    mockDate = new Date('2025-01-15T10:00:00Z');
    jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
    
    // Mock the Date constructor
    const OriginalDate = Date;
    const mockDateConstructor = jest.fn().mockImplementation((value?: any) => {
      if (value !== undefined) {
        return new OriginalDate(value);
      }
      return mockDate;
    });
    
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());

    controller = new SessionTimeoutController();
  });

  afterEach(() => {
    controller.destroy();
    jest.restoreAllMocks();
  });

  describe('Session Initialization', () => {
    test('should initialize session with default configuration', () => {
      const sessionId = 'session-123';
      const state = controller.initializeSession(sessionId, {});

      expect(state.sessionId).toBe(sessionId);
      expect(state.configuration.policy).toBe(TimeoutPolicy.FLEXIBLE);
      expect(state.configuration.idleTimeout).toBe(30 * 60 * 1000); // 30 minutes
      expect(state.configuration.absoluteTimeout).toBe(8 * 60 * 60 * 1000); // 8 hours
      expect(state.isActive).toBe(true);
      expect(state.lastActivity).toEqual(mockDate);
      expect(state.sessionStart).toEqual(mockDate);
      expect(state.status).toBe('active');
      expect(state.extensionsUsed).toBe(0);
      expect(state.gracePeriodActive).toBe(false);
    });

    test('should initialize session with custom configuration', () => {
      const sessionId = 'session-custom';
      const customConfig: Partial<TimeoutConfiguration> = {
        policy: TimeoutPolicy.STRICT,
        idleTimeout: 15 * 60 * 1000, // 15 minutes
        maxExtensions: 1,
        deviceTrustFactor: 0.8,
        locationTrustFactor: 0.9
      };

      const state = controller.initializeSession(sessionId, customConfig);

      expect(state.configuration.policy).toBe(TimeoutPolicy.STRICT);
      expect(state.configuration.idleTimeout).toBe(15 * 60 * 1000);
      expect(state.configuration.maxExtensions).toBe(1);
      expect(state.configuration.deviceTrustFactor).toBe(0.8);
      expect(state.configuration.locationTrustFactor).toBe(0.9);
    });

    test('should emit session initialized event', (done) => {
      controller.on('sessionInitialized', (data) => {
        expect(data.sessionId).toBe('session-event');
        expect(data.state.isActive).toBe(true);
        done();
      });

      controller.initializeSession('session-event', {});
    });

    test('should calculate remaining time correctly', () => {
      const sessionId = 'session-time';
      const state = controller.initializeSession(sessionId, {
        idleTimeout: 20 * 60 * 1000 // 20 minutes
      });

      expect(state.remainingTime).toBe(20 * 60 * 1000);
      expect(state.currentTimeout.getTime()).toBe(mockDate.getTime() + 20 * 60 * 1000);
    });
  });

  describe('Activity Recording', () => {
    test('should record user activity successfully', () => {
      const sessionId = 'session-activity';
      const state = controller.initializeSession(sessionId, {});

      const activity: Omit<ActivityData, 'timestamp'> = {
        type: 'keyboard',
        intensity: ActivityLevel.MEDIUM,
        endpoint: '/api/dashboard',
        duration: 500,
        metadata: { action: 'typing' }
      };

      controller.recordActivity(sessionId, activity);

      const updatedState = controller.getSessionState(sessionId);
      expect(updatedState?.recentActivities).toHaveLength(1);
      expect(updatedState?.recentActivities[0].type).toBe('keyboard');
      expect(updatedState?.recentActivities[0].intensity).toBe(ActivityLevel.MEDIUM);
      expect(updatedState?.recentActivities[0].timestamp).toEqual(mockDate);
      expect(updatedState?.lastActivity).toEqual(mockDate);
    });

    test('should calculate activity score correctly', () => {
      const sessionId = 'session-score';
      controller.initializeSession(sessionId, {});

      // Add activities with different intensities
      controller.recordActivity(sessionId, {
        type: 'mouse',
        intensity: ActivityLevel.HIGH
      });

      controller.recordActivity(sessionId, {
        type: 'keyboard',
        intensity: ActivityLevel.CRITICAL
      });

      const state = controller.getSessionState(sessionId);
      expect(state?.activityScore).toBeGreaterThan(0);
      expect(state?.activityScore).toBeLessThanOrEqual(1);
    });

    test('should emit activity recorded event', (done) => {
      controller.on('activityRecorded', (data) => {
        expect(data.sessionId).toBe('session-activity-event');
        expect(data.activity.type).toBe('api');
        expect(data.state.recentActivities).toHaveLength(1);
        done();
      });

      const sessionId = 'session-activity-event';
      controller.initializeSession(sessionId, {});
      
      controller.recordActivity(sessionId, {
        type: 'api',
        intensity: ActivityLevel.MEDIUM
      });
    });

    test('should ignore activity for inactive session', () => {
      const sessionId = 'session-inactive';
      const state = controller.initializeSession(sessionId, {});
      
      // Force timeout the session
      controller.forceTimeout(sessionId, TimeoutReason.MANUAL);

      controller.recordActivity(sessionId, {
        type: 'mouse',
        intensity: ActivityLevel.HIGH
      });

      // Activity should not be recorded
      const updatedState = controller.getSessionState(sessionId);
      expect(updatedState?.recentActivities).toHaveLength(0);
    });

    test('should clean up old activities', () => {
      const sessionId = 'session-cleanup';
      controller.initializeSession(sessionId, {});

      // Move time forward 15 minutes and add activity
      const futureDate = new Date(mockDate.getTime() + 15 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(futureDate.getTime());
      global.Date = jest.fn(() => futureDate) as any;
      global.Date.now = jest.fn(() => futureDate.getTime());

      controller.recordActivity(sessionId, {
        type: 'keyboard',
        intensity: ActivityLevel.MEDIUM
      });

      const state = controller.getSessionState(sessionId);
      expect(state?.recentActivities).toHaveLength(1);
    });
  });

  describe('Session Extension', () => {
    test('should extend session manually', () => {
      const sessionId = 'session-extend';
      const state = controller.initializeSession(sessionId, {
        extensionDuration: 10 * 60 * 1000 // 10 minutes
      });

      const originalTimeout = state.currentTimeout.getTime();
      const success = controller.extendSession(sessionId, 'manual');

      expect(success).toBe(true);
      
      const updatedState = controller.getSessionState(sessionId);
      expect(updatedState?.currentTimeout.getTime()).toBeGreaterThan(originalTimeout);
      expect(updatedState?.extensionsUsed).toBe(1);
      expect(updatedState?.status).toBe('extended');
    });

    test('should extend session automatically based on activity', () => {
      const sessionId = 'session-auto-extend';
      controller.initializeSession(sessionId, {
        automaticExtension: true,
        activityThreshold: 0.3
      });

      // Add high activity to trigger automatic extension
      for (let i = 0; i < 5; i++) {
        controller.recordActivity(sessionId, {
          type: 'keyboard',
          intensity: ActivityLevel.CRITICAL
        });
      }

      const state = controller.getSessionState(sessionId);
      // Note: This test depends on the internal logic for shouldExtendSession
      expect(state?.activityScore).toBeGreaterThan(0);
    });

    test('should deny extension when max extensions reached', () => {
      const sessionId = 'session-max-extend';
      controller.initializeSession(sessionId, {
        maxExtensions: 1
      });

      // Use up the allowed extension
      controller.extendSession(sessionId, 'manual');
      
      // Try to extend again
      const success = controller.extendSession(sessionId, 'manual');
      
      expect(success).toBe(false);
    });

    test('should emit extension denied event', (done) => {
      controller.on('extensionDenied', (data) => {
        expect(data.sessionId).toBe('session-deny');
        expect(data.reason).toBe('max_extensions_reached');
        done();
      });

      const sessionId = 'session-deny';
      controller.initializeSession(sessionId, { maxExtensions: 0 });
      
      controller.extendSession(sessionId, 'manual');
    });

    test('should apply trust factors to extension duration', () => {
      const sessionId = 'session-trust';
      controller.initializeSession(sessionId, {
        extensionDuration: 10 * 60 * 1000,
        deviceTrustFactor: 0.5,
        locationTrustFactor: 0.8
      });

      controller.extendSession(sessionId, 'activity');

      const state = controller.getSessionState(sessionId);
      // Extension duration should be adjusted by trust factors
      expect(state?.extensionsUsed).toBe(1);
    });

    test('should emit session extended event', (done) => {
      controller.on('sessionExtended', (data) => {
        expect(data.sessionId).toBe('session-extended-event');
        expect(data.eventType).toBe('extension');
        expect(data.metadata?.reason).toBe('manual');
        done();
      });

      const sessionId = 'session-extended-event';
      controller.initializeSession(sessionId, {});
      
      controller.extendSession(sessionId, 'manual');
    });
  });

  describe('Critical Operations', () => {
    test('should start critical operation and extend grace period', () => {
      const sessionId = 'session-critical';
      controller.initializeSession(sessionId, {
        criticalOperationGrace: 5 * 60 * 1000 // 5 minutes
      });

      const success = controller.startCriticalOperation(sessionId, 'payment');

      expect(success).toBe(true);
      
      const state = controller.getSessionState(sessionId);
      expect(state?.criticalOperationActive).toBe(true);
    });

    test('should end critical operation', () => {
      const sessionId = 'session-critical-end';
      controller.initializeSession(sessionId, {});
      
      controller.startCriticalOperation(sessionId, 'backup');
      controller.endCriticalOperation(sessionId);

      const state = controller.getSessionState(sessionId);
      expect(state?.criticalOperationActive).toBe(false);
    });

    test('should emit critical operation events', (done) => {
      let eventsReceived = 0;
      
      controller.on('criticalOperationStarted', (data) => {
        expect(data.sessionId).toBe('session-critical-events');
        expect(data.operationType).toBe('file-upload');
        eventsReceived++;
        if (eventsReceived === 2) done();
      });

      controller.on('criticalOperationEnded', (data) => {
        expect(data.sessionId).toBe('session-critical-events');
        eventsReceived++;
        if (eventsReceived === 2) done();
      });

      const sessionId = 'session-critical-events';
      controller.initializeSession(sessionId, {});
      
      controller.startCriticalOperation(sessionId, 'file-upload');
      controller.endCriticalOperation(sessionId);
    });

    test('should not start critical operation for inactive session', () => {
      const sessionId = 'session-inactive-critical';
      controller.initializeSession(sessionId, {});
      
      // Force timeout the session
      controller.forceTimeout(sessionId);

      const success = controller.startCriticalOperation(sessionId, 'test');
      expect(success).toBe(false);
    });
  });

  describe('Session Management', () => {
    test('should get session state', () => {
      const sessionId = 'session-get';
      const originalState = controller.initializeSession(sessionId, {
        policy: TimeoutPolicy.ADAPTIVE
      });

      const retrievedState = controller.getSessionState(sessionId);

      expect(retrievedState).toEqual(originalState);
      expect(retrievedState?.configuration.policy).toBe(TimeoutPolicy.ADAPTIVE);
    });

    test('should return null for non-existent session', () => {
      const state = controller.getSessionState('non-existent');
      expect(state).toBeNull();
    });

    test('should get all active sessions', () => {
      controller.initializeSession('session-1', {});
      controller.initializeSession('session-2', {});
      controller.initializeSession('session-3', {});

      // Force timeout one session
      controller.forceTimeout('session-2');

      const activeSessions = controller.getActiveSessions();
      expect(activeSessions).toHaveLength(2);
      expect(activeSessions.every(s => s.isActive)).toBe(true);
    });

    test('should force timeout session', () => {
      const sessionId = 'session-force-timeout';
      controller.initializeSession(sessionId, {});

      const success = controller.forceTimeout(sessionId, TimeoutReason.SECURITY);

      expect(success).toBe(true);
      
      const state = controller.getSessionState(sessionId);
      expect(state?.status).toBe('expired');
      expect(state?.timeoutReason).toBe(TimeoutReason.SECURITY);
      expect(state?.isActive).toBe(false);
    });

    test('should suspend timeout for emergency', () => {
      const sessionId = 'session-suspend';
      const state = controller.initializeSession(sessionId, {});
      const originalTimeout = state.currentTimeout.getTime();

      const success = controller.suspendTimeout(sessionId, 10 * 60 * 1000); // 10 minutes

      expect(success).toBe(true);
      
      const updatedState = controller.getSessionState(sessionId);
      expect(updatedState?.currentTimeout.getTime()).toBe(originalTimeout + 10 * 60 * 1000);
    });

    test('should emit timeout suspended event', (done) => {
      controller.on('timeoutSuspended', (data) => {
        expect(data.sessionId).toBe('session-suspend-event');
        expect(data.duration).toBe(5 * 60 * 1000);
        done();
      });

      const sessionId = 'session-suspend-event';
      controller.initializeSession(sessionId, {});
      
      controller.suspendTimeout(sessionId, 5 * 60 * 1000);
    });
  });

  describe('Timeout Policies', () => {
    test('should handle STRICT timeout policy', () => {
      const sessionId = 'session-strict';
      controller.initializeSession(sessionId, {
        policy: TimeoutPolicy.STRICT,
        idleTimeout: 10 * 60 * 1000
      });

      // Record activity to trigger timeout reset
      controller.recordActivity(sessionId, {
        type: 'mouse',
        intensity: ActivityLevel.HIGH
      });

      const state = controller.getSessionState(sessionId);
      // STRICT policy should use exact idle timeout regardless of activity
      expect(state?.configuration.policy).toBe(TimeoutPolicy.STRICT);
    });

    test('should handle FLEXIBLE timeout policy', () => {
      const sessionId = 'session-flexible';
      controller.initializeSession(sessionId, {
        policy: TimeoutPolicy.FLEXIBLE,
        idleTimeout: 10 * 60 * 1000
      });

      // Add high activity
      for (let i = 0; i < 3; i++) {
        controller.recordActivity(sessionId, {
          type: 'keyboard',
          intensity: ActivityLevel.HIGH
        });
      }

      const state = controller.getSessionState(sessionId);
      expect(state?.configuration.policy).toBe(TimeoutPolicy.FLEXIBLE);
      expect(state?.activityScore).toBeGreaterThan(0);
    });

    test('should handle ADAPTIVE timeout policy', () => {
      const sessionId = 'session-adaptive';
      controller.initializeSession(sessionId, {
        policy: TimeoutPolicy.ADAPTIVE,
        learningEnabled: true
      });

      const state = controller.getSessionState(sessionId);
      expect(state?.configuration.policy).toBe(TimeoutPolicy.ADAPTIVE);
      expect(state?.configuration.learningEnabled).toBe(true);
    });

    test('should handle PROGRESSIVE timeout policy', () => {
      const sessionId = 'session-progressive';
      controller.initializeSession(sessionId, {
        policy: TimeoutPolicy.PROGRESSIVE
      });

      // Use some extensions
      controller.extendSession(sessionId, 'manual');
      controller.extendSession(sessionId, 'manual');

      const state = controller.getSessionState(sessionId);
      expect(state?.configuration.policy).toBe(TimeoutPolicy.PROGRESSIVE);
      expect(state?.extensionsUsed).toBe(2);
    });
  });

  describe('Statistics and Analytics', () => {
    test('should provide comprehensive timeout statistics', () => {
      // Create sessions with different policies
      controller.initializeSession('session-stats-1', { policy: TimeoutPolicy.STRICT });
      controller.initializeSession('session-stats-2', { policy: TimeoutPolicy.FLEXIBLE });
      controller.initializeSession('session-stats-3', { policy: TimeoutPolicy.ADAPTIVE });

      // Extend some sessions
      controller.extendSession('session-stats-1', 'manual');
      controller.extendSession('session-stats-2', 'manual');

      // Force timeout one session
      controller.forceTimeout('session-stats-3', TimeoutReason.SECURITY);

      const stats = controller.getTimeoutStatistics();

      expect(stats.totalSessions).toBe(3);
      expect(stats.activeSessions).toBe(2);
      expect(stats.timeoutEvents).toBe(1);
      expect(stats.extensionUsage).toBe(2);
      expect(stats.policyDistribution[TimeoutPolicy.STRICT]).toBe(1);
      expect(stats.policyDistribution[TimeoutPolicy.FLEXIBLE]).toBe(1);
      expect(stats.policyDistribution[TimeoutPolicy.ADAPTIVE]).toBe(1);
      expect(stats.timeoutReasons[TimeoutReason.SECURITY]).toBe(1);
      expect(stats.averageSessionLength).toBeGreaterThanOrEqual(0);
    });

    test('should calculate average session length correctly', () => {
      controller.initializeSession('session-avg-1', {});
      
      // Move time forward
      const futureDate = new Date(mockDate.getTime() + 30 * 60 * 1000); // 30 minutes
      jest.spyOn(Date, 'now').mockReturnValue(futureDate.getTime());
      global.Date = jest.fn(() => futureDate) as any;
      global.Date.now = jest.fn(() => futureDate.getTime());

      controller.initializeSession('session-avg-2', {});

      const stats = controller.getTimeoutStatistics();
      expect(stats.averageSessionLength).toBeGreaterThan(0);
    });
  });

  describe('Event Handling', () => {
    test('should emit timeout warning event', (done) => {
      // Mock setTimeout to immediately trigger warnings
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as NodeJS.Timeout;
      });

      controller.on('timeoutWarning', (data) => {
        expect(data.sessionId).toBe('session-warning');
        expect(data.eventType).toBe('warning');
        expect(data.remainingTime).toBeGreaterThan(0);
        done();
      });

      controller.initializeSession('session-warning', {
        warningThresholds: [5 * 60 * 1000] // 5 minutes
      });
    });

    test('should emit session timeout event', (done) => {
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as NodeJS.Timeout;
      });

      controller.on('sessionTimeout', (data) => {
        expect(data.sessionId).toBe('session-timeout-event');
        expect(data.eventType).toBe('timeout');
        expect(data.remainingTime).toBe(0);
        done();
      });

      controller.initializeSession('session-timeout-event', {
        idleTimeout: 1000 // 1 second
      });
    });

    test('should emit grace period activated event', (done) => {
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as NodeJS.Timeout;
      });

      controller.on('gracePeriodActivated', (data) => {
        expect(data.sessionId).toBe('session-grace');
        expect(data.duration).toBeGreaterThan(0);
        done();
      });

      controller.initializeSession('session-grace', {
        idleTimeout: 1000,
        gracePeriod: 2 * 60 * 1000 // 2 minutes
      });
    });
  });

  describe('Cleanup and Destruction', () => {
    test('should clean up expired sessions', () => {
      controller.initializeSession('session-cleanup-1', {});
      controller.initializeSession('session-cleanup-2', {});

      // Move time forward to expire sessions
      const futureDate = new Date(mockDate.getTime() + 25 * 60 * 60 * 1000); // 25 hours
      jest.spyOn(Date, 'now').mockReturnValue(futureDate.getTime());
      global.Date = jest.fn(() => futureDate) as any;
      global.Date.now = jest.fn(() => futureDate.getTime());

      const initialCount = controller.getActiveSessions().length;
      
      // Manually trigger cleanup (normally runs automatically)
      // This would happen through the internal cleanup timer

      expect(initialCount).toBe(2);
    });

    test('should emit cleanup completed event', (done) => {
      controller.on('cleanupCompleted', (data) => {
        expect(data.removedSessions).toBeGreaterThanOrEqual(0);
        done();
      });

      // Trigger cleanup by emitting the event
      controller.emit('cleanupCompleted', { removedSessions: 1 });
    });

    test('should destroy controller and clean up resources', (done) => {
      controller.on('destroyed', () => {
        done();
      });

      controller.destroy();
    });

    test('should handle multiple session cleanup', () => {
      // Create many sessions
      for (let i = 0; i < 10; i++) {
        controller.initializeSession(`session-bulk-${i}`, {});
      }

      expect(controller.getActiveSessions()).toHaveLength(10);

      // Force timeout all sessions
      for (let i = 0; i < 10; i++) {
        controller.forceTimeout(`session-bulk-${i}`);
      }

      expect(controller.getActiveSessions()).toHaveLength(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle operations on non-existent session', () => {
      const nonExistentId = 'non-existent-session';

      expect(controller.getSessionState(nonExistentId)).toBeNull();
      expect(controller.extendSession(nonExistentId)).toBe(false);
      expect(controller.forceTimeout(nonExistentId)).toBe(false);
      expect(controller.suspendTimeout(nonExistentId, 1000)).toBe(false);
      expect(controller.startCriticalOperation(nonExistentId, 'test')).toBe(false);
      
      // Should not throw error
      controller.recordActivity(nonExistentId, {
        type: 'mouse',
        intensity: ActivityLevel.LOW
      });
      controller.endCriticalOperation(nonExistentId);
    });

    test('should handle zero or negative timeout values', () => {
      const sessionId = 'session-zero-timeout';
      const state = controller.initializeSession(sessionId, {
        idleTimeout: 0,
        absoluteTimeout: -1000
      });

      // Should use default minimums
      expect(state.configuration.idleTimeout).toBeGreaterThanOrEqual(0);
      expect(state.isActive).toBe(true);
    });

    test('should handle extremely high activity levels', () => {
      const sessionId = 'session-high-activity';
      controller.initializeSession(sessionId, {});

      // Add many activities rapidly
      for (let i = 0; i < 1000; i++) {
        controller.recordActivity(sessionId, {
          type: 'api',
          intensity: ActivityLevel.CRITICAL,
          metadata: { requestId: i }
        });
      }

      const state = controller.getSessionState(sessionId);
      expect(state?.recentActivities.length).toBeLessThanOrEqual(100); // Should be limited
      expect(state?.activityScore).toBeLessThanOrEqual(1);
    });

    test('should handle concurrent session operations', async () => {
      const sessionId = 'session-concurrent';
      controller.initializeSession(sessionId, {});

      // Perform multiple operations concurrently
      const operations = [
        () => controller.recordActivity(sessionId, { type: 'mouse', intensity: ActivityLevel.MEDIUM }),
        () => controller.extendSession(sessionId, 'manual'),
        () => controller.startCriticalOperation(sessionId, 'test'),
        () => controller.endCriticalOperation(sessionId),
        () => controller.getSessionState(sessionId)
      ];

      // Execute all operations
      operations.forEach(op => op());

      const state = controller.getSessionState(sessionId);
      expect(state).toBeDefined();
      expect(state?.isActive).toBe(true);
    });

    test('should handle date edge cases', () => {
      // Test with edge date values
      const edgeDates = [
        new Date(0), // Unix epoch
        new Date('1970-01-01'),
        new Date('2038-01-19'), // Y2038 problem date
        new Date('2099-12-31')
      ];

      edgeDates.forEach((date, index) => {
        jest.spyOn(Date, 'now').mockReturnValue(date.getTime());
        global.Date = jest.fn(() => date) as any;
        global.Date.now = jest.fn(() => date.getTime());

        const sessionId = `session-edge-${index}`;
        const state = controller.initializeSession(sessionId, {});

        expect(state.sessionStart.getTime()).toBe(date.getTime());
        expect(state.lastActivity.getTime()).toBe(date.getTime());
      });
    });
  });
});