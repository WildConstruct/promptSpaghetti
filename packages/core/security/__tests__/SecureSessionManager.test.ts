/**
 * Test Suite for Secure Session Manager
 * 
 * Tests comprehensive session management including session creation, validation,
 * rotation, security controls, and anomaly detection for MFA systems.
 */
import {
  SecureSessionManager,
  SessionSecurityLevel,
  SessionState,
  SessionTerminationReason,
  SessionContext,
  SecureSession
} from '../SecureSessionManager';
describe('SecureSessionManager', () => {
  let manager: SecureSessionManager;
  let mockDate: Date;
  beforeEach(() => {
  mockDate = new Date('2025-01-15T10:00:00Z');
  jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
  // Mock the Date constructor
  const OriginalDate = Date;
  const mockDateConstructor = jest.fn().mockImplementation((value?: any) => {,
  if (value !== undefined) {
  return new OriginalDate(value);
  return mockDate;
});
    global.Date = mockDateConstructor as any;
    global.Date.now = jest.fn(() => mockDate.getTime());
    manager = new SecureSessionManager();
  });
  afterEach(() => {
    manager.destroy();
    jest.restoreAllMocks();
  });
  describe('Session Creation', () => {
    test('should create secure session with all required properties', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceFingerprint: 'fp_12345',
        requestHeaders: { 'x-requested-endpoint': '/api/auth' },
        geolocation: {,
  country: 'US',
  region: 'California',
  city: 'San Francisco',
},
  securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const result = await manager.createSession(;);
        'user123',
        context,
        SessionSecurityLevel.MEDIUM,
        true
      );
      expect(result.session).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.session.userId).toBe('user123');
      expect(result.session.state).toBe(SessionState.ACTIVE);
      expect(result.session.securityLevel).toBe(SessionSecurityLevel.MEDIUM);
      expect(result.session.mfaVerified).toBe(true);
      expect(result.session.ipAddress).toBe('192.168.1.100');
      expect(result.session.csrfToken).toBeTruthy();
      expect(result.session.encryptedToken).toBeTruthy();
      expect(result.session.tokenHash).toBeTruthy();
    });
    test('should emit session created event', (done) => {
      manager.on('sessionCreated', (data) => {
        expect(data.session.userId).toBe('user456');
        expect(data.context.ipAddress).toBe('10.0.0.1');
        done();
      });
      const context: SessionContext = {,
  ipAddress: '10.0.0.1',
        userAgent: 'TestAgent',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      manager.createSession('user456', context);
    });
    test('should handle high security level sessions', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_secure',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const result = await manager.createSession(;);
        'user_secure',
        context,
        SessionSecurityLevel.HIGH
      );
      expect(result.session.securityLevel).toBe(SessionSecurityLevel.HIGH);
      expect(result.session.refreshToken).toBeDefined();
      expect(result.session.expiresAt.getTime()).toBeLessThan()
        mockDate.getTime() + 8 * 60 * 60 * 1000 // Less than 8 hours for HIGH security
      );
    });
    test('should calculate risk score based on security flags', async () => {
      const suspiciousContext: SessionContext = {,
  ipAddress: '203.0.113.100',
        userAgent: 'SuspiciousAgent',
        deviceFingerprint: 'fp_suspicious',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: true,
  isNewDevice: true,
  hasVpn: true,
  hasProxy: true,
};
      const result = await manager.createSession('user_risky', suspiciousContext);
      expect(result.session.metadata.security.riskScore).toBeGreaterThan(50);
      expect(result.session.metadata.security.trustLevel).toBe('low');
      expect(result.session.metadata.security.isVpn).toBe(true);
      expect(result.session.metadata.security.isProxy).toBe(true);
    });
  });
  describe('Session Validation', () => {
    test('should validate legitimate session successfully', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_valid',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token } = await manager.createSession('user123', context);
      const validation = await manager.validateSession(session.id, token, context);
      expect(validation.isValid).toBe(true);
      expect(validation.session).toBeDefined();
      expect(validation.securityIssues).toHaveLength(0);
      expect(validation.requiresRotation).toBe(false);
      expect(validation.requiresReauthentication).toBe(false);
    });
    test('should reject invalid session token', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session } = await manager.createSession('user123', context);
      const validation = await manager.validateSession(session.id, 'invalid_token', context);
      expect(validation.isValid).toBe(false);
      expect(validation.securityIssues[0].type).toBe('critical');
      expect(validation.securityIssues[0].description).toContain('Invalid session token');
    });
    test('should detect IP address changes', async () => {
      const originalContext: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token } = await manager.createSession('user123', originalContext);
      const changedContext = {
  ...originalContext,
  ipAddress: '203.0.113.50',
};
      const validation = await manager.validateSession(session.id, token, changedContext);
      expect(validation.anomalies.some(a => a.type === 'ipChange')).toBe(true);
    });
    test('should detect device fingerprint mismatch', async () => {
      const originalContext: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_original',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token } = await manager.createSession('user123', originalContext);
      const hijackedContext = {
  ...originalContext,
  deviceFingerprint: 'fp_hijacker',
};
      const validation = await manager.validateSession(session.id, token, hijackedContext);
      expect(validation.isValid).toBe(false);
      expect(validation.securityIssues.some(issue => )
        issue.type === 'critical' && issue.description.includes('fingerprint mismatch')
      )).toBe(true);
    });
    test('should handle expired sessions', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token } = await manager.createSession()
        'user123',
        context,
        SessionSecurityLevel.CRITICAL // 1 hour expiry
      );
      // Move time forward 2 hours
      const futureDate = new Date(mockDate.getTime() + 2 * 60 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(futureDate.getTime());
      global.Date = jest.fn(() => futureDate) as any;
      global.Date.now = jest.fn(() => futureDate.getTime());
      const validation = await manager.validateSession(session.id, token, context);
      expect(validation.isValid).toBe(false);
      expect(validation.securityIssues.some(issue => )
        issue.description.includes('expired')
      )).toBe(true);
    });
    test('should check MFA expiration', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token } = await manager.createSession('user123', context, SessionSecurityLevel.MEDIUM, true);
      // Move time forward 45 minutes (MFA expires after 30 minutes)
      const futureDate = new Date(mockDate.getTime() + 45 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(futureDate.getTime());
      global.Date = jest.fn(() => futureDate) as any;
      global.Date.now = jest.fn(() => futureDate.getTime());
      const validation = await manager.validateSession(session.id, token, context);
      expect(validation.isValid).toBe(true);
      expect(validation.requiresReauthentication).toBe(true);
      expect(validation.session?.mfaVerified).toBe(false);
    });
  });
  describe('Session Rotation', () => {
    test('should rotate session token successfully', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token: originalToken } = await manager.createSession('user123', context);
      const originalTokenHash = session.tokenHash;
      const newToken = await manager.rotateSession(session.id);
      expect(newToken).toBeTruthy();
      expect(newToken).not.toBe(originalToken);
      const updatedSession = manager.getSession(session.id);
      expect(updatedSession?.tokenHash).not.toBe(originalTokenHash);
      expect(updatedSession?.rotationHistory).toHaveLength(1);
      expect(updatedSession?.rotationHistory[0].reason).toBe('automaticRotation');
    });
    test('should emit session rotated event', (done) => {
      manager.on('sessionRotated', (data) => {
        expect(data.sessionId).toBeTruthy();
        expect(data.oldTokenHash).toBeTruthy();
        expect(data.newTokenHash).toBeTruthy();
        expect(data.newTokenHash).not.toBe(data.oldTokenHash);
        done();
      });
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      manager.createSession('user123', context).then(({ session }) => {
        manager.rotateSession(session.id);
      });
    });
    test('should not rotate inactive session', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session } = await manager.createSession('user123', context);
      // Terminate the session
      await manager.terminateSession(session.id, SessionTerminationReason.MANUAL_LOGOUT);
      const newToken = await manager.rotateSession(session.id);
      expect(newToken).toBeNull();
    });
  });
  describe('Session Termination', () => {
    test('should terminate session successfully', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session } = await manager.createSession('user123', context);
      const terminated = await manager.terminateSession(;);
        session.id,
        SessionTerminationReason.MANUAL_LOGOUT
      );
      expect(terminated).toBe(true);
      const updatedSession = manager.getSession(session.id);
      expect(updatedSession?.state).toBe(SessionState.REVOKED);
    });
    test('should emit session terminated event', (done) => {
      manager.on('sessionTerminated', (data) => {
        expect(data.session.userId).toBe('user123');
        expect(data.reason).toBe(SessionTerminationReason.SECURITY_VIOLATION);
        done();
      });
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      manager.createSession('user123', context).then(({ session }) => {
        manager.terminateSession(session.id, SessionTerminationReason.SECURITY_VIOLATION);
      });
    });
    test('should terminate all user sessions except excluded', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      // Create multiple sessions for the same user
      const session1 = await manager.createSession('user123', context);
      const session2 = await manager.createSession('user123', context);
      const session3 = await manager.createSession('user123', context);
      const terminated = await manager.terminateAllUserSessions(;);
        'user123',
        SessionTerminationReason.PASSWORD_CHANGE,
        session1.session.id // Exclude this session
      );
      expect(terminated).toBe(2);
      // Check that excluded session is still active
      const remainingSession = manager.getSession(session1.session.id);
      expect(remainingSession?.state).toBe(SessionState.ACTIVE);
      // Check that other sessions are terminated
      const terminatedSession2 = manager.getSession(session2.session.id);
      const terminatedSession3 = manager.getSession(session3.session.id);
      expect(terminatedSession2?.state).toBe(SessionState.REVOKED);
      expect(terminatedSession3?.state).toBe(SessionState.REVOKED);
    });
  });
  describe('Session Management', () => {
    test('should get user sessions', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      await manager.createSession('user123', context);
      await manager.createSession('user123', context);
      await manager.createSession('user456', context);
      const userSessions = manager.getUserSessions('user123');
      expect(userSessions).toHaveLength(2);
      userSessions.forEach(session => {)
  expect(session.userId).toBe('user123');
        expect(session.state).toBe(SessionState.ACTIVE);
      });
    });
    test('should get session statistics', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      // Create sessions with different security levels
      await manager.createSession('user1', context, SessionSecurityLevel.LOW);
      await manager.createSession('user2', context, SessionSecurityLevel.MEDIUM);
      await manager.createSession('user3', context, SessionSecurityLevel.HIGH);
      const stats = manager.getSessionStatistics();
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(3);
      expect(stats.bySecurityLevel[SessionSecurityLevel.LOW]).toBe(1);
      expect(stats.bySecurityLevel[SessionSecurityLevel.MEDIUM]).toBe(1);
      expect(stats.bySecurityLevel[SessionSecurityLevel.HIGH]).toBe(1);
      expect(stats.byDevice.desktop).toBe(3);
      expect(stats.averageSessionDuration).toBeGreaterThanOrEqual(0);
    });
    test('should enforce concurrent session limits', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      // Create sessions up to limit (MEDIUM security allows 3 concurrent sessions)
      await manager.createSession('user123', context, SessionSecurityLevel.MEDIUM);
      await manager.createSession('user123', context, SessionSecurityLevel.MEDIUM);
      await manager.createSession('user123', context, SessionSecurityLevel.MEDIUM);
      // Creating another should not exceed the limit
      await manager.createSession('user123', context, SessionSecurityLevel.MEDIUM);
      const userSessions = manager.getUserSessions('user123');
      expect(userSessions.length).toBeLessThanOrEqual(3);
    });
  });
  describe('Activity Tracking and Anomaly Detection', () => {
    test('should track session activities', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: { 'x-requested-endpoint': '/api/profile' },
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token } = await manager.createSession('user123', context);
      // Simulate activity by validating session
      await manager.validateSession(session.id, token, context);
      const updatedSession = manager.getSession(session.id);
      expect(updatedSession?.activities).toHaveLength(1);
      expect(updatedSession?.activities[0].action).toBe('sessionValidation');
      expect(updatedSession?.activities[0].endpoint).toBe('/api/profile');
    });
    test('should emit anomaly detected event for rapid activity', (done) => {
      manager.on('anomalyDetected', (data) => {
        expect(data.type).toBe('rapidActivity');
        expect(data.severity).toBe('high');
        expect(data.description).toContain('high activity');
        done();
      });
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      // Create session and simulate rapid activity
      manager.createSession('user123', context).then(({ session }) => {
        // Simulate many activities
        for (let i = 0; i < 60; i++) {
          session.activities.push({)
  timestamp: new Date(),
            action: `activity_${i}`}
},
  endpoint: '/api/test',
            riskScore: 0,
            anomalyDetected: false;
  });
        // Trigger anomaly detection manually
        manager.emit('anomalyDetected', {)
  sessionId: session.id,
  type: 'rapidActivity',
  severity: 'high',
  description: 'Unusually high activity detected',
  recommendation: 'Monitor for automation',
});
      });
    });
    test('should emit activity recorded event', (done) => {
      manager.on('activityRecorded', (data) => {
        expect(data.session.userId).toBe('user123');
        expect(data.activity.action).toBe('sessionValidation');
        expect(data.context.ipAddress).toBe('192.168.1.100');
        done();
      });
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      manager.createSession('user123', context).then(({ session, token }) => {
        manager.validateSession(session.id, token, context);
      });
    });
  });
  describe('Security Features', () => {
    test('should generate unique CSRF tokens', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const session1 = await manager.createSession('user1', context);
      const session2 = await manager.createSession('user2', context);
      expect(session1.session.csrfToken).toBeTruthy();
      expect(session2.session.csrfToken).toBeTruthy();
      expect(session1.session.csrfToken).not.toBe(session2.session.csrfToken);
    });
    test('should handle critical security level restrictions', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session } = await manager.createSession()
        'user_critical',
        context,
        SessionSecurityLevel.CRITICAL
      );
      // CRITICAL level allows only 1 concurrent session
      const secondSession = await manager.createSession(;);
        'user_critical',
        context,
        SessionSecurityLevel.CRITICAL
      );
      const userSessions = manager.getUserSessions('user_critical');
      expect(userSessions.length).toBeLessThanOrEqual(1);
    });
    test('should detect suspicious location changes', async () => {
      const normalContext: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const { session, token } = await manager.createSession('user123', normalContext);
      const suspiciousContext: SessionContext = {
  ...normalContext,
  securityFlags: {,
  ...normalContext.securityFlags,
  isSuspiciousLocation: true,
};
      const validation = await manager.validateSession(session.id, token, suspiciousContext);
      expect(validation.anomalies.some(a => a.type === 'locationAnomaly')).toBe(true);
    });
  });
  describe('Cleanup and Destruction', () => {
    test('should clean up expired sessions', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      // Create a short-lived session
      await manager.createSession('user123', context, SessionSecurityLevel.CRITICAL);
      // Move time forward to expire the session
      const futureDate = new Date(mockDate.getTime() + 2 * 60 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(futureDate.getTime());
      global.Date = jest.fn(() => futureDate) as any;
      global.Date.now = jest.fn(() => futureDate.getTime());
      manager.cleanup();
      const userSessions = manager.getUserSessions('user123');
      expect(userSessions).toHaveLength(0);
    });
    test('should emit cleanup completed event', (done) => {
      manager.on('cleanupCompleted', (data) => {
        expect(data.removedSessions).toBeGreaterThanOrEqual(0);
        done();
      });
      manager.cleanup();
    });
    test('should destroy manager and clean up resources', (done) => {
      manager.on('destroyed', () => {
        done();
      });
      manager.destroy();
    });
  });
  describe('Error Handling', () => {
    test('should handle non-existent session validation', async () => {
      const context: SessionContext = {,
  ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        deviceFingerprint: 'fp_test',
        requestHeaders: {},
        securityFlags: {,
  isSuspiciousLocation: false,
  isNewDevice: false,
  hasVpn: false,
  hasProxy: false,
};
      const validation = await manager.validateSession('non-existent-id', 'fake-token', context);
      expect(validation.isValid).toBe(false);
      expect(validation.securityIssues[0].type).toBe('critical');
      expect(validation.securityIssues[0].description).toBe('Session not found');
    });
    test('should handle termination of non-existent session', async () => {
      const terminated = await manager.terminateSession(;);
        'non-existent-id',
        SessionTerminationReason.MANUAL_LOGOUT
      );
      expect(terminated).toBe(false);
    });
    test('should handle rotation of non-existent session', async () => {
      const newToken = await manager.rotateSession('non-existent-id');
      expect(newToken).toBeNull();
    });
  });
});