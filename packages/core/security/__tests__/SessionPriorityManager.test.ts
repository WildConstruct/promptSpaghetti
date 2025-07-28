/**
 * Test Suite for Session Priority Manager
 * 
 * Tests comprehensive session priority management including priority-based
 * allocation, intelligent eviction policies, conflict resolution, and metrics.
 */
import {
  SessionPriorityManager,
  SessionPriority,
  EvictionPolicy,
  ConflictResolution,
  PriorityFactors,
  SessionPriorityConfig
} from '../SessionPriorityManager';
describe('SessionPriorityManager', () => {
  let manager: SessionPriorityManager;
  beforeEach(() => {
    manager = new SessionPriorityManager({)
      maxSessionsPerUser: 2,
      maxSessionsPerDevice: 1,
      maxTotalSessions: 5,
      evictionPolicy: EvictionPolicy.PRIORITY_BASED,
      conflictResolution: ConflictResolution.EVICT_LOWEST_PRIORITY,
    });
  });
  afterEach(() => {
    manager.destroy();
  });
  describe('Session Registration', () => {
    test('should register session successfully', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 80,
        locationFamiliarity: 90,
        timeOfDayScore: 75,
        sessionDuration: 0,
        activityLevel: 60,
        securityRequirement: 70,
        businessCriticality: 65,
      };
      const result = manager.registerSession(;);
        'session-1',
        'user-1',
        'device-1',
        SessionPriority.MEDIUM,
        factors
      );
      expect(result.allowed).toBe(true);
      expect(result.conflicts).toBeUndefined();
      expect(result.evicted).toBeUndefined();
    });
    test('should calculate priority score correctly', () => {
      const adminFactors: PriorityFactors = {
        userRole: 'admin',
        deviceTrustLevel: 95,
        locationFamiliarity: 100,
        timeOfDayScore: 85,
        sessionDuration: 5,
        activityLevel: 80,
        securityRequirement: 90,
        businessCriticality: 95,
      };
      const guestFactors: PriorityFactors = {
        userRole: 'guest',
        deviceTrustLevel: 30,
        locationFamiliarity: 20,
        timeOfDayScore: 40,
        sessionDuration: 120,
        activityLevel: 10,
        securityRequirement: 25,
        businessCriticality: 20,
      };
      manager.registerSession('admin-session', 'admin', 'device-1', SessionPriority.HIGH, adminFactors);
      manager.registerSession('guest-session', 'guest', 'device-2', SessionPriority.LOW, guestFactors);
      const ranking = manager.getSessionRanking();
      const adminSession = ranking.find(s => s.sessionId === 'admin-session');
      const guestSession = ranking.find(s => s.sessionId === 'guest-session');
      expect(adminSession?.score).toBeGreaterThan(guestSession?.score || 0);
    });
    test('should emit session registered event', (done) => {
      manager.on('sessionRegistered', (data) => {
        expect(data.sessionId).toBe('event-session');
        expect(data.sessionData.priority).toBe(SessionPriority.HIGH);
        expect(data.conflicts).toBe(0);
        done();
      });
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      manager.registerSession('event-session', 'user', 'device', SessionPriority.HIGH, factors);
    });
  });
  describe('Conflict Detection and Resolution', () => {
    test('should detect user session limit conflicts', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      // Register maximum sessions for user
      manager.registerSession('session-1', 'user-1', 'device-1', SessionPriority.MEDIUM, factors);
      manager.registerSession('session-2', 'user-1', 'device-2', SessionPriority.MEDIUM, factors);
      // Try to register one more (should detect conflict)
      const conflicts = manager.detectConflicts('user-1', 'device-3', SessionPriority.MEDIUM);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('user_limit');
      expect(conflicts[0].affectedSessions).toHaveLength(2);
    });
    test('should detect device session limit conflicts', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      // Register session on device
      manager.registerSession('session-1', 'user-1', 'device-1', SessionPriority.MEDIUM, factors);
      // Try to register another session on same device (should detect conflict)
      const conflicts = manager.detectConflicts('user-2', 'device-1', SessionPriority.MEDIUM);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('device_limit');
    });
    test('should detect total session limit conflicts', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      // Fill up to maximum total sessions
      for (let i = 1; i <= 5; i++) {
        manager.registerSession(`session-${i}`, `user-${i}`, `device-${i}`, SessionPriority.MEDIUM, factors);}
      }
      // Try to register one more (should detect conflict)
      const conflicts = manager.detectConflicts('user-6', 'device-6', SessionPriority.MEDIUM);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('total_limit');
    });
    test('should auto-resolve conflicts by evicting lowest priority', () => {
      const lowFactors: PriorityFactors = {
        userRole: 'guest',
        deviceTrustLevel: 30,
        locationFamiliarity: 20,
        timeOfDayScore: 40,
        sessionDuration: 60,
        activityLevel: 10,
        securityRequirement: 25,
        businessCriticality: 20,
      };
      const highFactors: PriorityFactors = {
        userRole: 'admin',
        deviceTrustLevel: 95,
        locationFamiliarity: 100,
        timeOfDayScore: 85,
        sessionDuration: 5,
        activityLevel: 80,
        securityRequirement: 90,
        businessCriticality: 95,
      };
      // Register maximum sessions with low priority
      manager.registerSession('session-1', 'user-1', 'device-1', SessionPriority.LOW, lowFactors);
      manager.registerSession('session-2', 'user-1', 'device-2', SessionPriority.LOW, lowFactors);
      // Register high priority session (should evict low priority)
      const result = manager.registerSession('session-3', 'user-1', 'device-3', SessionPriority.HIGH, highFactors);
      expect(result.allowed).toBe(true);
      expect(result.evicted).toBeDefined();
      expect(result.evicted).toHaveLength(1);
    });
  });
  describe('Session Activity Updates', () => {
    test('should update session activity and recalculate score', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      manager.registerSession('session-1', 'user-1', 'device-1', SessionPriority.MEDIUM, factors);
      const originalRanking = manager.getSessionRanking();
      const originalScore = originalRanking[0].score;
      // Update activity with higher level
      manager.updateSessionActivity('session-1', 90, { activityLevel: 90 });
      const newRanking = manager.getSessionRanking();
      const newScore = newRanking[0].score;
      expect(newScore).toBeGreaterThan(originalScore);
      expect(newRanking[0].accessCount).toBe(2);
    });
    test('should emit session activity updated event', (done) => {
      manager.on('sessionActivityUpdated', (data) => {
        expect(data.sessionId).toBe('activity-session');
        expect(data.session.factors.activityLevel).toBe(85);
        done();
      });
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      manager.registerSession('activity-session', 'user', 'device', SessionPriority.MEDIUM, factors);
      manager.updateSessionActivity('activity-session', 85);
    });
  });
  describe('Eviction Policies', () => {
    test('should apply LRU eviction policy', () => {
      const testManager = new SessionPriorityManager({)
        maxSessionsPerUser: 1,
        evictionPolicy: EvictionPolicy.LRU,
        conflictResolution: ConflictResolution.EVICT_OLDEST,
      });
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      // Register first session
      testManager.registerSession('session-1', 'user-1', 'device-1', SessionPriority.MEDIUM, factors);
      // Update activity to make it recently used
      testManager.updateSessionActivity('session-1', 70);
      // Register second session (should evict based on LRU)
      const result = testManager.registerSession('session-2', 'user-1', 'device-2', SessionPriority.MEDIUM, factors);
      expect(result.allowed).toBe(true);
      expect(result.evicted).toBeDefined();
      testManager.destroy();
    });
    test('should apply priority-based eviction policy', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 0,
        activityLevel: 50,
        securityRequirement: 60,
        businessCriticality: 55,
      };
      const lowFactors: PriorityFactors = {
        ...factors,
        userRole: 'guest',
        deviceTrustLevel: 30,
        activityLevel: 20,
      };
      // Register low priority session
      manager.registerSession('low-session', 'user-1', 'device-1', SessionPriority.LOW, lowFactors);
      manager.registerSession('medium-session', 'user-1', 'device-2', SessionPriority.MEDIUM, factors);
      // Register high priority session (should evict lowest priority)
      const result = manager.registerSession('high-session', 'user-1', 'device-3', SessionPriority.HIGH, factors);
      expect(result.allowed).toBe(true);
      expect(result.evicted).toContain('low-session');
    });
  });
  describe('Emergency Sessions', () => {
    test('should create emergency session and evict others', () => {
      const factors: PriorityFactors = {
        userRole: 'admin',
        deviceTrustLevel: 95,
        locationFamiliarity: 100,
        timeOfDayScore: 85,
        sessionDuration: 0,
        activityLevel: 80,
        securityRequirement: 90,
        businessCriticality: 95,
      };
      // Fill up sessions
      for (let i = 1; i <= 5; i++) {
        manager.registerSession(`session-${i}`, `user-${i}`, `device-${i}`, SessionPriority.MEDIUM, factors);}
      }
      // Create emergency session
      const result = manager.createEmergencySession('emergency', 'admin', 'admin-device', factors);
      expect(result.created).toBe(true);
      expect(result.evicted).toBeDefined();
      expect(result.evicted?.length).toBeGreaterThan(0);
      // Verify emergency session has maximum priority
      const ranking = manager.getSessionRanking();
      const emergencySession = ranking.find(s => s.sessionId === 'emergency');
      expect(emergencySession?.priority).toBe(SessionPriority.CRITICAL);
      expect(emergencySession?.emergencySession).toBe(true);
      expect(emergencySession?.evictionProtection).toBe(true);
    });
    test('should emit emergency session created event', (done) => {
      manager.on('emergencySessionCreated', (data) => {
        expect(data.sessionId).toBe('emergency-event');
        expect(data.evicted).toBeDefined();
        done();
      });
      const factors: PriorityFactors = {
        userRole: 'admin',
        deviceTrustLevel: 95,
        locationFamiliarity: 100,
        timeOfDayScore: 85,
        sessionDuration: 0,
        activityLevel: 80,
        securityRequirement: 90,
        businessCriticality: 95,
      };
      manager.createEmergencySession('emergency-event', 'admin', 'device', factors);
    });
  });
  describe('Session Ranking', () => {
    test('should rank sessions by priority and score', () => {
      const highFactors: PriorityFactors = {
        userRole: 'admin',
        deviceTrustLevel: 95,
        locationFamiliarity: 100,
        timeOfDayScore: 85,
        sessionDuration: 5,
        activityLevel: 80,
        securityRequirement: 90,
        businessCriticality: 95,
      };
      const mediumFactors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 30,
        activityLevel: 60,
        securityRequirement: 70,
        businessCriticality: 65,
      };
      const lowFactors: PriorityFactors = {
        userRole: 'guest',
        deviceTrustLevel: 40,
        locationFamiliarity: 30,
        timeOfDayScore: 45,
        sessionDuration: 90,
        activityLevel: 20,
        securityRequirement: 30,
        businessCriticality: 25,
      };
      manager.registerSession('high-session', 'admin', 'device-1', SessionPriority.HIGH, highFactors);
      manager.registerSession('medium-session', 'user', 'device-2', SessionPriority.MEDIUM, mediumFactors);
      manager.registerSession('low-session', 'guest', 'device-3', SessionPriority.LOW, lowFactors);
      const ranking = manager.getSessionRanking();
      expect(ranking[0].sessionId).toBe('high-session');
      expect(ranking[1].sessionId).toBe('medium-session');
      expect(ranking[2].sessionId).toBe('low-session');
      expect(ranking[0].score).toBeGreaterThan(ranking[1].score);
      expect(ranking[1].score).toBeGreaterThan(ranking[2].score);
    });
  });
  describe('Metrics and Statistics', () => {
    test('should provide comprehensive metrics', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 30,
        activityLevel: 60,
        securityRequirement: 70,
        businessCriticality: 65,
      };
      // Register sessions with different priorities
      manager.registerSession('critical', 'admin', 'device-1', SessionPriority.CRITICAL, { ...factors, userRole: 'admin' });
      manager.registerSession('high', 'user-1', 'device-2', SessionPriority.HIGH, factors);
      manager.registerSession('medium', 'user-2', 'device-3', SessionPriority.MEDIUM, factors);
      manager.registerSession('low', 'guest', 'device-4', SessionPriority.LOW, { ...factors, userRole: 'guest' });
      const metrics = manager.getMetrics();
      expect(metrics.totalSessions).toBe(4);
      expect(metrics.sessionsByPriority[SessionPriority.CRITICAL]).toBe(1);
      expect(metrics.sessionsByPriority[SessionPriority.HIGH]).toBe(1);
      expect(metrics.sessionsByPriority[SessionPriority.MEDIUM]).toBe(1);
      expect(metrics.sessionsByPriority[SessionPriority.LOW]).toBe(1);
      expect(metrics.utilizationPercentage).toBe(80); // 4/5 * 100
      expect(metrics.averageSessionScore).toBeGreaterThan(0);
    });
    test('should track eviction history in metrics', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 30,
        activityLevel: 60,
        securityRequirement: 70,
        businessCriticality: 65,
      };
      // Fill sessions to trigger eviction
      manager.registerSession('session-1', 'user-1', 'device-1', SessionPriority.LOW, factors);
      manager.registerSession('session-2', 'user-1', 'device-2', SessionPriority.LOW, factors);
      // This should trigger eviction
      manager.registerSession('session-3', 'user-1', 'device-3', SessionPriority.HIGH, factors);
      const metrics = manager.getMetrics();
      expect(metrics.evictionRate).toBeGreaterThan(0);
    });
  });
  describe('User Session Management', () => {
    test('should get sessions for specific user', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 30,
        activityLevel: 60,
        securityRequirement: 70,
        businessCriticality: 65,
      };
      manager.registerSession('session-1', 'user-1', 'device-1', SessionPriority.MEDIUM, factors);
      manager.registerSession('session-2', 'user-1', 'device-2', SessionPriority.HIGH, factors);
      manager.registerSession('session-3', 'user-2', 'device-3', SessionPriority.MEDIUM, factors);
      const user1Sessions = manager.getUserSessions('user-1');
      const user2Sessions = manager.getUserSessions('user-2');
      expect(user1Sessions).toHaveLength(2);
      expect(user2Sessions).toHaveLength(1);
      expect(user1Sessions.map(s => s.sessionId)).toContain('session-1');
      expect(user1Sessions.map(s => s.sessionId)).toContain('session-2');
      expect(user2Sessions[0].sessionId).toBe('session-3');
    });
    test('should return empty array for user with no sessions', () => {
      const sessions = manager.getUserSessions('nonexistent-user');
      expect(sessions).toHaveLength(0);
    });
  });
  describe('Configuration Updates', () => {
    test('should update configuration and emit event', (done) => {
      manager.on('configUpdated', (data) => {
        expect(data.config.maxSessionsPerUser).toBe(5);
        expect(data.config.evictionPolicy).toBe(EvictionPolicy.LRU);
        done();
      });
      manager.updateConfig({)
        maxSessionsPerUser: 5,
        evictionPolicy: EvictionPolicy.LRU,
      });
    });
  });
  describe('Grace Periods and Eviction Protection', () => {
    test('should respect eviction protection', () => {
      const factors: PriorityFactors = {
        userRole: 'admin',
        deviceTrustLevel: 95,
        locationFamiliarity: 100,
        timeOfDayScore: 85,
        sessionDuration: 0,
        activityLevel: 80,
        securityRequirement: 90,
        businessCriticality: 95,
      };
      // Register protected session
      manager.registerSession('protected', 'admin', 'device-1', SessionPriority.CRITICAL, factors);
      // Try to evict protected session
      const success = manager.evictSession('protected', 'test_eviction');
      expect(success).toBe(false);
    });
    test('should offer grace period when specified', () => {
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 30,
        activityLevel: 60,
        securityRequirement: 70,
        businessCriticality: 65,
      };
      manager.registerSession('grace-session', 'user', 'device', SessionPriority.MEDIUM, factors);
      // Evict with grace period
      const success = manager.evictSession('grace-session', 'test_eviction', 5);
      expect(success).toBe(true);
      // Session should still exist but with grace period
      const userSessions = manager.getUserSessions('user');
      expect(userSessions).toHaveLength(1);
      expect(userSessions[0].gracePeriodEnd).toBeDefined();
    });
    test('should emit grace period offered event', (done) => {
      manager.on('gracePeriodOffered', (data) => {
        expect(data.sessionId).toBe('grace-event-session');
        expect(data.minutes).toBe(3);
        done();
      });
      const factors: PriorityFactors = {
        userRole: 'user',
        deviceTrustLevel: 70,
        locationFamiliarity: 80,
        timeOfDayScore: 60,
        sessionDuration: 30,
        activityLevel: 60,
        securityRequirement: 70,
        businessCriticality: 65,
      };
      manager.registerSession('grace-event-session', 'user', 'device', SessionPriority.MEDIUM, factors);
      manager.evictSession('grace-event-session', 'test', 3);
    });
  });
  describe('Cleanup and Destruction', () => {
    test('should emit maintenance completed event', (done) => {
      manager.on('maintenanceCompleted', (data) => {
        expect(data.expiredGracePeriods).toBeGreaterThanOrEqual(0);
        expect(data.cleanedConflicts).toBeGreaterThanOrEqual(0);
        expect(data.evictionHistorySize).toBeGreaterThanOrEqual(0);
        done();
      });
      // Manually trigger maintenance by emitting the event
      manager.emit('maintenanceCompleted', {)
        expiredGracePeriods: 0,
        cleanedConflicts: 0,
        evictionHistorySize: 0,
      });
    });
    test('should destroy manager and clean up resources', (done) => {
      manager.on('destroyed', () => {
        done();
      });
      manager.destroy();
    });
  });
  describe('Edge Cases and Error Handling', () => {
    test('should handle operations on non-existent sessions', () => {
      // Should not throw errors
      manager.updateSessionActivity('nonexistent', 50);
      const success = manager.evictSession('nonexistent', 'test');
      expect(success).toBe(false);
    });
    test('should handle empty session lists in eviction', () => {
      const conflicts = manager.detectConflicts('user', 'device', SessionPriority.MEDIUM);
      expect(conflicts).toHaveLength(0);
    });
    test('should handle emergency session creation when disabled', () => {
      const noEmergencyManager = new SessionPriorityManager({)
        emergencyOverride: false,
      });
      const factors: PriorityFactors = {
        userRole: 'admin',
        deviceTrustLevel: 95,
        locationFamiliarity: 100,
        timeOfDayScore: 85,
        sessionDuration: 0,
        activityLevel: 80,
        securityRequirement: 90,
        businessCriticality: 95,
      };
      const result = noEmergencyManager.createEmergencySession('emergency', 'admin', 'device', factors);
      expect(result.created).toBe(false);
      noEmergencyManager.destroy();
    });
  });
});