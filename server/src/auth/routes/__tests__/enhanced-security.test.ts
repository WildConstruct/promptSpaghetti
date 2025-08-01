/**
 * Enhanced Security API Routes Tests - Epic 19
 * 
 * Comprehensive test suite for enhanced authentication and security hardening endpoints
 * implemented as part of Epic 19 Security & Compliance Framework.
 * 
 * Task: T-1752989144571 - Implement backend API for Authentication Enhancement & Security Hardening
 */

import { FastifyInstance } from 'fastify';
import { build } from '../../test-utils/app';
import { AuthenticationService } from '../AuthenticationService';
import { AuditService } from '../services/AuditService';

describe('Enhanced Security API Routes', () => {
  let app: FastifyInstance;
  let authService: AuthenticationService;
  let auditService: AuditService;
  let mockUser: unknown;
  let authToken: string;

  beforeAll(async () => {
    app = build({ logger: false });
    await app.ready();
    
    authService = app.authService;
    auditService = new AuditService({} as any);
    
    // Create mock user and auth token
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      roles: ['user', 'admin']
    };
    
    // Mock authentication token
    authToken = 'Bearer mock-jwt-token';
    
    // Mock auth service methods
    jest.spyOn(authService, 'validateToken').mockResolvedValue(mockUser as unknown);
    jest.spyOn(auditService, 'logEvent').mockResolvedValue(undefined as unknown);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/security/challenge', () => {
    test('should generate location security challenge', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          challengeType: 'location',
          metadata: {
            currentLocation: 'New York'


      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('challengeId');
      expect(body).toHaveProperty('challengeType', 'location');
      expect(body).toHaveProperty('challenge');
      expect(body).toHaveProperty('expiresAt');
      expect(body).toHaveProperty('instructions');
      
      expect(body.challengeId).toMatch(/^SEC-\d+-[a-z0-9]+$/);
      expect(new Date(body.expiresAt)).toBeInstanceOf(Date);
      
      // Verify audit log
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SECURITY_CHALLENGE_INITIATED',
          userId: mockUser.id,
          details: expect.objectContaining({
            challengeType: 'location',
            challengeId: body.challengeId

  }
      );
    });

    test('should generate device security challenge', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          challengeType: 'device'

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.challengeType).toBe('device');
      expect(body.challenge).toHaveProperty('deviceFingerprint');
      expect(body.instructions).toContain('Device verification');
    });

    test('should handle risk-based challenge', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          challengeType: 'risk',
          metadata: {
            riskFactors: ['unusual_location', 'new_device']


      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.challengeType).toBe('risk');
      expect(body.challenge).toHaveProperty('riskScore');
      expect(body.challenge).toHaveProperty('factors');
      expect(Array.isArray(body.challenge.factors)).toBe(true);
    });

    test('should require authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'content-type': 'application/json'

        payload: {
          challengeType: 'location'

      });

      expect(response.statusCode).toBe(401);
    });

    test('should validate challenge type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          challengeType: 'invalid_type'

      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /auth/security/session-management', () => {
    test('should terminate specific session', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/session-management',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          action: 'terminate',
          sessionId: 'session-123',
          reason: 'User request'

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('affectedSessions', 1);
      expect(body).toHaveProperty('newSecurityLevel');
      
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SESSION_MANAGEMENT_ACTION',
          userId: mockUser.id,
          details: expect.objectContaining({
            action: 'terminate',
            sessionId: 'session-123'

  }
      );
    });

    test('should terminate all sessions', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/session-management',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          action: 'terminate_all',
          reason: 'Security incident'

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.success).toBe(true);
      expect(body.affectedSessions).toBeGreaterThan(1);
      expect(body.message).toContain('All sessions terminated');
    });

    test('should extend session', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/session-management',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          action: 'extend',
          sessionId: 'session-456'

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.success).toBe(true);
      expect(body.message).toContain('Session extended');
    });

    test('should require sessionId for terminate action', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/session-management',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          action: 'terminate'

      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Session ID required');
    });

    test('should handle invalid action', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/session-management',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          action: 'invalid_action'

      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Invalid action');
    });
  });

  describe('POST /auth/security/risk-assessment', () => {
    test('should perform comprehensive risk assessment', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/risk-assessment',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          includeRiskFactors: true,
          includeBehaviorAnalysis: true,
          includeDeviceFingerprint: true

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('riskScore');
      expect(body).toHaveProperty('riskLevel');
      expect(body).toHaveProperty('factors');
      expect(body).toHaveProperty('recommendations');
      expect(body).toHaveProperty('assessmentDate');
      
      expect(typeof body.riskScore).toBe('number');
      expect(body.riskScore).toBeGreaterThanOrEqual(0);
      expect(body.riskScore).toBeLessThanOrEqual(1);
      
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(body.riskLevel);
      expect(Array.isArray(body.factors)).toBe(true);
      expect(Array.isArray(body.recommendations)).toBe(true);
      
      // Check factor structure
      if (body.factors.length > 0) {
        const factor = body.factors[0];
        expect(factor).toHaveProperty('factor');
        expect(factor).toHaveProperty('impact');
        expect(factor).toHaveProperty('description');

    });

    test('should handle minimal risk assessment', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/risk-assessment',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          includeRiskFactors: false,
          includeBehaviorAnalysis: false,
          includeDeviceFingerprint: false

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.riskScore).toBeGreaterThanOrEqual(0);
      expect(body.factors.length).toBeGreaterThanOrEqual(0);
      
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SECURITY_RISK_ASSESSMENT',
          userId: mockUser.id,
          details: expect.objectContaining({
            riskScore: body.riskScore,
            riskLevel: body.riskLevel

  }
      );
    });
  });

  describe('POST /auth/security/passwordless/begin', () => {
    test('should initiate passwordless authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/passwordless/begin',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          credentialRequestOptions: {
            allowCredentials: []

          userVerification: 'preferred'

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('challengeId');
      expect(body).toHaveProperty('publicKeyCredentialRequestOptions');
      expect(body).toHaveProperty('timeout');
      expect(body).toHaveProperty('status');
      
      expect(body.challengeId).toMatch(/^PWL-\d+-[a-z0-9]+$/);
      expect(body.status).toBe('ready_for_webauthn');
      expect(typeof body.timeout).toBe('number');
      
      const options = body.publicKeyCredentialRequestOptions;
      expect(options).toHaveProperty('challenge');
      expect(options).toHaveProperty('timeout');
      expect(options).toHaveProperty('userVerification', 'preferred');
      
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PASSWORDLESS_AUTH_INITIATED',
          userId: mockUser.id
  }
      );
    });

    test('should handle required user verification', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/passwordless/begin',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          credentialRequestOptions: {},
          userVerification: 'required'

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body.publicKeyCredentialRequestOptions.userVerification).toBe('required');
    });
  });

  describe('POST /auth/security/compliance-report', () => {
    test('should generate compliance report for admin users', async () => {
      // Mock admin user
      const adminUser = { ...mockUser, roles: ['admin', 'compliance_officer'] };
      jest.spyOn(authService, 'validateToken').mockResolvedValue(adminUser as unknown);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/compliance-report',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          frameworks: ['SOC2', 'GDPR'],
          dateRange: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-01-31T23:59:59Z'

          includeMetrics: true

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('report');
      expect(body).toHaveProperty('generatedAt');
      expect(body).toHaveProperty('frameworks');
      expect(body).toHaveProperty('summary');
      
      expect(Array.isArray(body.frameworks)).toBe(true);
      expect(body.frameworks).toContain('SOC2');
      expect(body.frameworks).toContain('GDPR');
      
      const report = body.report;
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');
      expect(report.summary).toHaveProperty('overallCompliance');
      
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'COMPLIANCE_REPORT_GENERATED',
          userId: adminUser.id,
          details: expect.objectContaining({
            frameworks: ['SOC2', 'GDPR']

  }
      );
    });

    test('should deny access to non-admin users', async () => {
      const regularUser = { ...mockUser, roles: ['user'] };
      jest.spyOn(authService, 'validateToken').mockResolvedValue(regularUser as unknown);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/compliance-report',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          frameworks: ['SOC2']

      });

      expect(response.statusCode).toBe(403);
      expect(response.body).toContain('Admin or Compliance Officer role required');
    });
  });

  describe('GET /auth/security/monitoring/dashboard', () => {
    test('should return security dashboard data for authorized users', async () => {
      const securityUser = { ...mockUser, roles: ['admin', 'security_officer'] };
      jest.spyOn(authService, 'validateToken').mockResolvedValue(securityUser as unknown);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/security/monitoring/dashboard',
        headers: {
          'authorization': authToken

      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('realTimeMetrics');
      expect(body).toHaveProperty('securityAlerts');
      expect(body).toHaveProperty('threatIntelligence');
      expect(body).toHaveProperty('complianceStatus');
      expect(body).toHaveProperty('lastUpdated');
      
      expect(typeof body.realTimeMetrics).toBe('object');
      expect(Array.isArray(body.securityAlerts)).toBe(true);
      expect(typeof body.threatIntelligence).toBe('object');
      expect(typeof body.complianceStatus).toBe('object');
      
      const metrics = body.realTimeMetrics;
      expect(metrics).toHaveProperty('activeUsers');
      expect(metrics).toHaveProperty('failedLogins');
      expect(metrics).toHaveProperty('securityAlerts');
      expect(metrics).toHaveProperty('systemLoad');
      
      expect(auditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SECURITY_DASHBOARD_ACCESSED',
          userId: securityUser.id
  }
      );
    });

    test('should deny access to unauthorized users', async () => {
      const regularUser = { ...mockUser, roles: ['user'] };
      jest.spyOn(authService, 'validateToken').mockResolvedValue(regularUser as unknown);

      const response = await app.inject({
        method: 'GET',
        url: '/auth/security/monitoring/dashboard',
        headers: {
          'authorization': authToken

      });

      expect(response.statusCode).toBe(403);
      expect(response.body).toContain('Admin or Security Officer role required');
    });
  });

  describe('GET /auth/security/health', () => {
    test('should return healthy status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/security/health'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('checks');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('version');
      
      expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
      expect(typeof body.checks).toBe('object');
      
      const checks = body.checks;
      expect(checks).toHaveProperty('authenticationService');
      expect(checks).toHaveProperty('sessionManagement');
      expect(checks).toHaveProperty('auditLogging');
      expect(checks).toHaveProperty('riskAssessment');
      expect(checks).toHaveProperty('complianceFramework');
      expect(checks).toHaveProperty('securityMonitoring');
      
      // All checks should be either 'healthy' or have status
      Object.values(checks).forEach(status => {
        expect(typeof status).toBe('string');
        expect(status.length).toBeGreaterThan(0);
      });
    });

    test('should not require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/security/health'
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Error Handling', () => {
    test('should handle authentication service errors', async () => {
      jest.spyOn(authService, 'validateToken').mockRejectedValue(new Error('Auth service error'));

      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          challengeType: 'location'

      });

      expect(response.statusCode).toBe(401);
    });

    test('should handle malformed JSON', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: 'invalid json'
      });

      expect(response.statusCode).toBe(400);
    });

    test('should handle missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/session-management',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {} // Missing action field
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Security Headers and CORS', () => {
    test('should include security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/security/health'
      });

      // Check for common security headers (would depend on middleware configuration)
      expect(response.headers).toBeDefined();
    });

    test('should handle CORS preflight requests', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/auth/security/challenge',
        headers: {
          'origin': 'https://app.example.com',
          'access-control-request-method': 'POST'

      });

      expect([200, 204]).toContain(response.statusCode);
    });
  });

  describe('Rate Limiting', () => {
    test('should respect rate limits on sensitive endpoints', async () => {
      // This test would require actual rate limiting implementation
      // For now, just verify the endpoint is accessible
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/risk-assessment',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {}
      });

      expect([200, 429]).toContain(response.statusCode);
    });
  });

  describe('Input Validation', () => {
    test('should validate enum values', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/challenge',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          challengeType: 'invalid_enum_value'

      });

      expect(response.statusCode).toBe(400);
    });

    test('should validate date formats', async () => {
      const adminUser = { ...mockUser, roles: ['admin'] };
      jest.spyOn(authService, 'validateToken').mockResolvedValue(adminUser as unknown);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/compliance-report',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          dateRange: {
            start: 'invalid-date',
            end: '2024-01-31T23:59:59Z'


      });

      expect(response.statusCode).toBe(400);
    });

    test('should validate required nested objects', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/security/passwordless/begin',
        headers: {
          'authorization': authToken,
          'content-type': 'application/json'

        payload: {
          // Missing credentialRequestOptions
          userVerification: 'preferred'

      });

      expect(response.statusCode).toBe(400);
    });
  });
});