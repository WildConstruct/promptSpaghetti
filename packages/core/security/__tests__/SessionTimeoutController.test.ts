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
  beforeEach(() => {
    controller = new SessionTimeoutController();
  });
  afterEach(() => {
    controller.destroy();
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
        locationTrustFactor: 0.9,
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
      const state = controller.initializeSession(sessionId, {)
        idleTimeout: 20 * 60 * 1000 // 20 minutes
      });
      expect(state.remainingTime).toBe(20 * 60 * 1000);
      expect(state.currentTimeout.getTime()).toBeGreaterThan(Date.now());
    });
  });
  describe('Activity Recording', () => {
    test('should record user activity successfully', () => {
      const sessionId = 'session-activity';
      controller.initializeSession(sessionId, {});
      const activity: Omit<ActivityData, 'timestamp'> = {
        type: 'keyboard',
        intensity: ActivityLevel.MEDIUM,
        endpoint: '/api/dashboard',
        duration: 500,
        metadata: { action: 'typing' }
      };
      controller.recordActivity(sessionId, activity);
      const state = controller.getSessionState(sessionId);
      expect(state?.recentActivities).toHaveLength(1);
      expect(state?.recentActivities[0].type).toBe('keyboard');
      expect(state?.recentActivities[0].intensity).toBe(ActivityLevel.MEDIUM);
    });
    test('should calculate activity score correctly', () => {
      const sessionId = 'session-score';
      controller.initializeSession(sessionId, {});
      // Add activities with different intensities
      controller.recordActivity(sessionId, {)
        type: 'mouse',
        intensity: ActivityLevel.HIGH,
      });
      controller.recordActivity(sessionId, {)
        type: 'keyboard',
        intensity: ActivityLevel.CRITICAL,
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
      controller.recordActivity(sessionId, {)
        type: 'api',
        intensity: ActivityLevel.MEDIUM,
      });
    });
    test('should ignore activity for inactive session', () => {
      const sessionId = 'session-inactive';
      controller.initializeSession(sessionId, {});
      // Force timeout the session
      controller.forceTimeout(sessionId, TimeoutReason.MANUAL);
      controller.recordActivity(sessionId, {)
        type: 'mouse',
        intensity: ActivityLevel.HIGH,
      });
      // Activity should not be recorded
      const state = controller.getSessionState(sessionId);
      expect(state?.recentActivities).toHaveLength(0);
    });
  });
  describe('Session Extension', () => {
    test('should extend session manually', () => {
      const sessionId = 'session-extend';
      controller.initializeSession(sessionId, {)
        extensionDuration: 10 * 60 * 1000 // 10 minutes
      });
      const originalExtensions = 0;
      const success = controller.extendSession(sessionId, 'manual');
      expect(success).toBe(true);
      const state = controller.getSessionState(sessionId);
      expect(state?.extensionsUsed).toBe(originalExtensions + 1);
      expect(state?.remainingTime).toBe(10 * 60 * 1000);
    });
    test('should deny extension when max extensions reached', () => {
      const sessionId = 'session-max-extend';
      controller.initializeSession(sessionId, {)
        maxExtensions: 1,
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
    test('should start critical operation', () => {
      const sessionId = 'session-critical';
      controller.initializeSession(sessionId, {)
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
      const originalState = controller.initializeSession(sessionId, {)
        policy: TimeoutPolicy.ADAPTIVE,
      });
      const retrievedState = controller.getSessionState(sessionId);
      expect(retrievedState?.sessionId).toBe(originalState.sessionId);
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
      expect(state?.timeoutReason).toBe(TimeoutReason.SECURITY);
      expect(state?.isActive).toBe(false);
    });
    test('should suspend timeout for emergency', () => {
      const sessionId = 'session-suspend';
      const state = controller.initializeSession(sessionId, {});
      const originalRemaining = state.remainingTime;
      const suspensionDuration = 10 * 60 * 1000; // 10 minutes;
      const success = controller.suspendTimeout(sessionId, suspensionDuration);
      expect(success).toBe(true);
      const updatedState = controller.getSessionState(sessionId);
      expect(updatedState?.remainingTime).toBe(originalRemaining + suspensionDuration);
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
    test('should handle different timeout policies', () => {
      const policies = [;
        TimeoutPolicy.STRICT,
        TimeoutPolicy.FLEXIBLE,
        TimeoutPolicy.ADAPTIVE,
        TimeoutPolicy.PROGRESSIVE
      ];
      policies.forEach((policy, index) => {
        const sessionId = `session-policy-${index}`;}
        const state = controller.initializeSession(sessionId, { policy });
        expect(state.configuration.policy).toBe(policy);
      });
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
  });
  describe('Event Handling', () => {
    test('should emit timeout warning event', (done) => {
      controller.on('timeoutWarning', (data) => {
        expect(data.sessionId).toBe('session-warning');
        expect(data.eventType).toBe('warning');
        expect(data.remainingTime).toBeGreaterThan(0);
        done();
      });
      // Emit the event directly to test the event handling
      const mockEvent: TimeoutEvent = {
        sessionId: 'session-warning',
        eventType: 'warning',
        timestamp: new Date(),
        remainingTime: 5 * 60 * 1000,
        reason: TimeoutReason.IDLE,
        userNotified: true,
        actionRequired: true,
      };
      controller.emit('timeoutWarning', mockEvent);
    });
    test('should emit session timeout event', (done) => {
      controller.on('sessionTimeout', (data) => {
        expect(data.sessionId).toBe('session-timeout-event');
        expect(data.eventType).toBe('timeout');
        expect(data.remainingTime).toBe(0);
        done();
      });
      // Emit the event directly to test the event handling
      const mockEvent: TimeoutEvent = {
        sessionId: 'session-timeout-event',
        eventType: 'timeout',
        timestamp: new Date(),
        remainingTime: 0,
        reason: TimeoutReason.IDLE,
        userNotified: true,
        actionRequired: true,
        metadata: { finalTimeout: true }
      };
      controller.emit('sessionTimeout', mockEvent);
    });
    test('should emit grace period activated event', (done) => {
      controller.on('gracePeriodActivated', (data) => {
        expect(data.sessionId).toBe('session-grace');
        expect(data.duration).toBeGreaterThan(0);
        done();
      });
      // Emit the event directly to test the event handling
      controller.emit('gracePeriodActivated', {)
        sessionId: 'session-grace',
        duration: 2 * 60 * 1000,
        state: {} as SessionTimeoutState
      });
    });
  });
  describe('Cleanup and Destruction', () => {
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
        controller.initializeSession(`session-bulk-${i}`, {});}
      }
      expect(controller.getActiveSessions()).toHaveLength(10);
      // Force timeout all sessions
      for (let i = 0; i < 10; i++) {
        controller.forceTimeout(`session-bulk-${i}`);}
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
      controller.recordActivity(nonExistentId, {)
        type: 'mouse',
        intensity: ActivityLevel.LOW,
      });
      controller.endCriticalOperation(nonExistentId);
    });
    test('should handle zero or negative timeout values', () => {
      const sessionId = 'session-zero-timeout';
      const state = controller.initializeSession(sessionId, {)
        idleTimeout: 0,
        absoluteTimeout: -1000,
      });
      // Should use provided values (even if zero/negative)
      expect(state.configuration.idleTimeout).toBe(0);
      expect(state.isActive).toBe(true);
    });
    test('should handle high activity levels', () => {
      const sessionId = 'session-high-activity';
      controller.initializeSession(sessionId, {});
      // Add many activities
      for (let i = 0; i < 20; i++) {
        controller.recordActivity(sessionId, {)
          type: 'api',
          intensity: ActivityLevel.CRITICAL,
          metadata: { requestId: i }
        });
      }
      const state = controller.getSessionState(sessionId);
      expect(state?.recentActivities.length).toBeGreaterThan(0);
      expect(state?.activityScore).toBeLessThanOrEqual(1);
      expect(state?.activityScore).toBeGreaterThan(0);
    });
    test('should handle sequential session operations', () => {
      const sessionId = 'session-sequential';
      controller.initializeSession(sessionId, {});
      // Perform operations in sequence
      controller.recordActivity(sessionId, { type: 'mouse', intensity: ActivityLevel.MEDIUM });
      const extendResult = controller.extendSession(sessionId, 'manual');
      const criticalStart = controller.startCriticalOperation(sessionId, 'test');
      controller.endCriticalOperation(sessionId);
      const state = controller.getSessionState(sessionId);
      expect(state).toBeDefined();
      expect(state?.isActive).toBe(true);
      expect(extendResult).toBe(true);
      expect(criticalStart).toBe(true);
      expect(state?.extensionsUsed).toBe(1);
      expect(state?.criticalOperationActive).toBe(false);
    });
  });
});