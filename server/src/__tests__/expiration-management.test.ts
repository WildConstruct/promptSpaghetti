/**
 * Expiration Management System Tests
 * 
 * Comprehensive tests for authentication resource expiration management:
 * - Policy creation and validation
 * - Expiration rule management
 * - Resource renewal and revocation
 * - Cleanup operations
 * - API endpoint testing
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { DatabaseConnection } from '../database/connection';
import { ExpirationManagementService, ExpirationPolicy, RenewalRequest } from '../auth/services/ExpirationManagementService';
import { AuditService } from '../auth/services/AuditService';
import { buildTestServer } from './helpers/test-server';

describe('Expiration Management System', () => {
  let server: FastifyInstance;
  let db: DatabaseConnection;
  let expirationService: ExpirationManagementService;
  let auditService: AuditService;

  const mockUser = {
    id: 'test-user',
    username: 'testuser',
    email: 'test@example.com',
    organizationId: 'test-org',
    roles: ['perm_manage_expiration']
  };

  const mockPolicy: Omit<ExpirationPolicy, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Test JWT Policy',
    resourceType: 'jwt_token',
    defaultTtl: 3600, // 1 hour
    maxTtl: 86400, // 24 hours
    minTtl: 300, // 5 minutes
    gracePeriod: 300, // 5 minutes
    warningThreshold: 600, // 10 minutes
    autoRenewal: true,
    renewalWindow: 1800, // 30 minutes
    organizationId: 'test-org',
    isActive: true
  };

  beforeAll(async () => {
    server = await buildTestServer();
    db = server.db as DatabaseConnection;
    auditService = new AuditService(db);
    expirationService = ExpirationManagementService.getInstance(db, auditService);

    await setupTestData();
    await expirationService.initialize();
  });

  afterAll(async () => {
    await cleanupTestData();
    await expirationService.shutdown();
    await server.close();
  });

  beforeEach(async () => {
    // Clean up test-created resources
    await db.query('DELETE FROM expiration_events WHERE rule_id LIKE ?', ['test_%']);
    await db.query('DELETE FROM expiration_rules WHERE id LIKE ?', ['test_%']);
    await db.query('DELETE FROM expiration_policies WHERE id LIKE ?', ['test_%']);
  });

  async function setupTestData() {
    // Insert test user
    await db.query(`
      INSERT IGNORE INTO users (id, username, email, is_active, organization_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [mockUser.id, mockUser.username, mockUser.email, 1, mockUser.organizationId, new Date()]);

    // Insert test permissions
    await db.query(`
      INSERT IGNORE INTO permissions (id, name, resource, action, scope, description, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['perm_manage_expiration', 'Manage Expiration', 'expiration', 'manage', 'organization', 'Test permission', 'Test', 1]);


  async function cleanupTestData() {
    await db.query('DELETE FROM expiration_events WHERE rule_id LIKE ?', ['test_%']);
    await db.query('DELETE FROM expiration_rules WHERE id LIKE ?', ['test_%']);
    await db.query('DELETE FROM expiration_policies WHERE id LIKE ?', ['test_%']);
    await db.query('DELETE FROM users WHERE id LIKE ?', ['test-%']);
    await db.query('DELETE FROM permissions WHERE id LIKE ?', ['perm_%']);


  describe('ExpirationManagementService', () => {
    test('should create expiration policy successfully', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);

      expect(policy).toBeDefined();
      expect(policy.name).toBe(mockPolicy.name);
      expect(policy.resourceType).toBe(mockPolicy.resourceType);
      expect(policy.defaultTtl).toBe(mockPolicy.defaultTtl);
      expect(policy.isActive).toBe(true);
      expect(policy.id).toMatch(/^policy_/);
    });

    test('should create expiration rule successfully', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);
      
      const rule = await expirationService.createExpirationRule(
        'test-resource-1',
        'jwt_token',
        policy.id,
        undefined, // use default TTL
        mockUser.id,
        { test: 'metadata' }
      );

      expect(rule).toBeDefined();
      expect(rule.resourceId).toBe('test-resource-1');
      expect(rule.resourceType).toBe('jwt_token');
      expect(rule.policyId).toBe(policy.id);
      expect(rule.status).toBe('active');
      expect(rule.metadata).toEqual({ test: 'metadata' });
      expect(rule.expiresAt).toBeInstanceOf(Date);
      expect(rule.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    test('should validate TTL limits when creating rule', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);
      
      // Test exceeding max TTL
      await expect(
        expirationService.createExpirationRule(
          'test-resource-2',
          'jwt_token', 
          policy.id,
          100000, // exceeds maxTtl of 86400
          mockUser.id

      ).rejects.toThrow('exceeds maximum allowed TTL');

      // Test below min TTL
      await expect(
        expirationService.createExpirationRule(
          'test-resource-3',
          'jwt_token',
          policy.id,
          200, // below minTtl of 300
          mockUser.id

      ).rejects.toThrow('below minimum allowed TTL');
    });

    test('should check expiration status correctly', async () => {
      const policy = await expirationService.createPolicy({
        ...mockPolicy,
        defaultTtl: 1 // 1 second for quick expiration
      });

      // Create rule that expires quickly
      await expirationService.createExpirationRule(
        'test-resource-expire',
        'jwt_token',
        policy.id,
        1,
        mockUser.id
      );

      // Should not be expired immediately
      const initialStatus = await expirationService.isExpired('test-resource-expire', 'jwt_token');
      expect(initialStatus).toBe(false);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be expired now
      const expiredStatus = await expirationService.isExpired('test-resource-expire', 'jwt_token');
      expect(expiredStatus).toBe(true);
    });

    test('should get expiration info correctly', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);
      
      await expirationService.createExpirationRule(
        'test-resource-info',
        'jwt_token',
        policy.id,
        3600,
        mockUser.id
      );

      const info = await expirationService.getExpirationInfo('test-resource-info', 'jwt_token');

      expect(info.isExpired).toBe(false);
      expect(info.expiresAt).toBeInstanceOf(Date);
      expect(info.timeRemaining).toBeGreaterThan(3500); // approximately 1 hour
      expect(info.timeRemaining).toBeLessThan(3600);
      expect(info.status).toBe('active');
      expect(info.canRenew).toBe(false); // not in renewal window yet
    });

    test('should renew resource successfully', async () => {
      const policy = await expirationService.createPolicy({
        ...mockPolicy,
        renewalWindow: 3600 // 1 hour renewal window
      });

      const rule = await expirationService.createExpirationRule(
        'test-resource-renew',
        'jwt_token',
        policy.id,
        1800, // 30 minutes
        mockUser.id
      );

      const originalExpiresAt = rule.expiresAt;

      // Should be able to renew since we're within renewal window
      const renewalRequest: RenewalRequest = {
        resourceId: 'test-resource-renew',
        resourceType: 'jwt_token',
        requestedTtl: 7200, // 2 hours
        reason: 'Test renewal',
        requestedBy: mockUser.id,
        organizationId: mockUser.organizationId
      };

      const result = await expirationService.renewResource(renewalRequest);

      expect(result.success).toBe(true);
      expect(result.newExpiresAt).toBeDefined();
      expect(result.newExpiresAt!.getTime()).toBeGreaterThan(originalExpiresAt.getTime());
      expect(result.newTtl).toBe(7200);
      expect(result.renewalCount).toBe(1);
    });

    test('should fail renewal outside of renewal window', async () => {
      const policy = await expirationService.createPolicy({
        ...mockPolicy,
        renewalWindow: 300 // 5 minutes renewal window
      });

      await expirationService.createExpirationRule(
        'test-resource-no-renew',
        'jwt_token',
        policy.id,
        3600, // 1 hour (well outside renewal window)
        mockUser.id
      );

      const renewalRequest: RenewalRequest = {
        resourceId: 'test-resource-no-renew',
        resourceType: 'jwt_token',
        requestedBy: mockUser.id,
        organizationId: mockUser.organizationId
      };

      const result = await expirationService.renewResource(renewalRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not within renewal window');
    });

    test('should revoke resource successfully', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);
      
      await expirationService.createExpirationRule(
        'test-resource-revoke',
        'jwt_token',
        policy.id,
        3600,
        mockUser.id
      );

      const success = await expirationService.revokeResource(
        'test-resource-revoke',
        'jwt_token',
        mockUser.id,
        'Test revocation'
      );

      expect(success).toBe(true);

      // Should be expired after revocation
      const isExpired = await expirationService.isExpired('test-resource-revoke', 'jwt_token');
      expect(isExpired).toBe(true);
    });

    test('should get expiration statistics', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);

      // Create some test rules
      await expirationService.createExpirationRule('stats-1', 'jwt_token', policy.id, 3600, mockUser.id);
      await expirationService.createExpirationRule('stats-2', 'jwt_token', policy.id, 7200, mockUser.id);
      await expirationService.createExpirationRule('stats-3', 'jwt_token', policy.id, 600, mockUser.id); // expires soon

      const stats = await expirationService.getExpirationStats(mockUser.organizationId);

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.active).toBeGreaterThanOrEqual(3);
      expect(stats.byResourceType).toBeDefined();
      expect(stats.byResourceType['jwt_token']).toBeGreaterThanOrEqual(3);
      expect(stats.upcomingExpirations).toBeDefined();
    });

    test('should get upcoming warnings', async () => {
      const policy = await expirationService.createPolicy({
        ...mockPolicy,
        warningThreshold: 3000 // 50 minutes warning
      });

      // Create rule that will trigger warning
      await expirationService.createExpirationRule(
        'warning-test',
        'jwt_token',
        policy.id,
        1800, // 30 minutes (within warning threshold)
        mockUser.id
      );

      const warnings = await expirationService.getUpcomingWarnings(mockUser.organizationId, 10);

      expect(warnings).toBeDefined();
      expect(Array.isArray(warnings)).toBe(true);
      
      const testWarning = warnings.find(w => w.resourceId === 'warning-test');
      expect(testWarning).toBeDefined();
      if (testWarning) {
        expect(testWarning.resourceType).toBe('jwt_token');
        expect(testWarning.timeRemaining).toBeLessThan(1800);
        expect(testWarning.warningLevel).toMatch(/info|warning|critical/);

    });

    test('should cleanup expired resources', async () => {
      const policy = await expirationService.createPolicy({
        ...mockPolicy,
        defaultTtl: 1, // 1 second for quick expiration
        gracePeriod: undefined // no grace period
      });

      // Create rule that expires quickly
      await expirationService.createExpirationRule(
        'cleanup-test',
        'jwt_token',
        policy.id,
        1,
        mockUser.id
      );

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      const result = await expirationService.cleanupExpiredResources();

      expect(result.cleaned).toBeGreaterThanOrEqual(1);
      expect(result.errors).toBe(0);
    });
  });

  describe('Expiration Management API', () => {
    test('POST /api/expiration/policies should create policy', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/policies',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: mockPolicy
      });

      expect(response.statusCode).toBe(201);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.policy).toBeDefined();
      expect(result.policy.name).toBe(mockPolicy.name);
    });

    test('POST /api/expiration/rules should create expiration rule', async () => {
      // First create a policy
      const policy = await expirationService.createPolicy(mockPolicy);

      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/rules',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          resourceId: 'api-test-resource',
          resourceType: 'jwt_token',
          policyId: policy.id,
          metadata: { source: 'api-test' }

      });

      expect(response.statusCode).toBe(201);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.rule).toBeDefined();
      expect(result.rule.resourceId).toBe('api-test-resource');
    });

    test('GET /api/expiration/status/:resourceType/:resourceId should return status', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);
      await expirationService.createExpirationRule(
        'status-test-resource',
        'jwt_token',
        policy.id,
        3600,
        mockUser.id
      );

      const response = await server.inject({
        method: 'GET',
        url: '/api/expiration/status/jwt_token/status-test-resource',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.status).toBeDefined();
      expect(result.status.isExpired).toBe(false);
      expect(result.status.expiresAt).toBeDefined();
      expect(result.status.timeRemaining).toBeGreaterThan(0);
    });

    test('POST /api/expiration/renew/:resourceType/:resourceId should renew resource', async () => {
      const policy = await expirationService.createPolicy({
        ...mockPolicy,
        renewalWindow: 3600 // 1 hour renewal window
      });

      await expirationService.createExpirationRule(
        'renew-test-resource',
        'jwt_token',
        policy.id,
        1800, // 30 minutes (within renewal window)
        mockUser.id
      );

      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/renew/jwt_token/renew-test-resource',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          requestedTtl: 7200,
          reason: 'API test renewal'

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.result.newExpiresAt).toBeDefined();
      expect(result.result.newTtl).toBe(7200);
    });

    test('POST /api/expiration/revoke/:resourceType/:resourceId should revoke resource', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);
      await expirationService.createExpirationRule(
        'revoke-test-resource',
        'jwt_token',
        policy.id,
        3600,
        mockUser.id
      );

      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/revoke/jwt_token/revoke-test-resource',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          reason: 'API test revocation'

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
    });

    test('GET /api/expiration/stats should return statistics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/expiration/stats',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(typeof result.stats.total).toBe('number');
      expect(result.stats.byResourceType).toBeDefined();
      expect(result.stats.upcomingExpirations).toBeDefined();
    });

    test('GET /api/expiration/warnings should return warnings', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/expiration/warnings?limit=10',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    test('POST /api/expiration/cleanup should trigger cleanup', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/cleanup',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(typeof result.result.cleaned).toBe('number');
      expect(typeof result.result.errors).toBe('number');
    });

    test('GET /api/expiration/health should return health status', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/expiration/health'
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.healthy).toBe(true);
      expect(result.stats).toBeDefined();
    });

    test('should require authentication for protected endpoints', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/policies',
        payload: mockPolicy
      });

      expect(response.statusCode).toBe(401);
    });

    test('should require proper permissions', async () => {
      const unauthorizedUser = {
        id: 'unauthorized-user',
        username: 'unauthorized',
        email: 'unauthorized@example.com',
        roles: [] // No expiration management permissions
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/policies',
        headers: {
          'Authorization': `Bearer ${generateTestToken(unauthorizedUser)}`

        payload: mockPolicy
      });

      expect(response.statusCode).toBe(403);
    });

    test('should validate request payloads', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/expiration/policies',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          name: '', // Invalid empty name
          resourceType: 'invalid_type', // Invalid resource type
          defaultTtl: -1, // Invalid negative TTL
          warningThreshold: 0, // Invalid zero threshold
          autoRenewal: 'not-boolean', // Invalid boolean
          renewalWindow: 0 // Invalid zero window

      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle concurrent rule creation for same resource', async () => {
      const policy = await expirationService.createPolicy(mockPolicy);

      // Try to create two rules for the same resource concurrently
      const promises = [
        expirationService.createExpirationRule(
          'concurrent-test',
          'jwt_token',
          policy.id,
          3600,
          mockUser.id
        ),
        expirationService.createExpirationRule(
          'concurrent-test',
          'jwt_token',
          policy.id,
          3600,
          mockUser.id

      ];

      const results = await Promise.allSettled(promises);

      // One should succeed, one should fail
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful.length).toBe(1);
      expect(failed.length).toBe(1);
    });

    test('should handle database errors gracefully', async () => {
      // Mock a database error
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(
        expirationService.createPolicy(mockPolicy)
      ).rejects.toThrow('Database connection failed');

      // Restore original query method
      db.query = originalQuery;
    });

    test('should handle invalid policy references', async () => {
      await expect(
        expirationService.createExpirationRule(
          'invalid-policy-test',
          'jwt_token',
          'nonexistent-policy',
          3600,
          mockUser.id

      ).rejects.toThrow('not found');
    });

    test('should handle renewal of non-existent resources', async () => {
      const renewalRequest: RenewalRequest = {
        resourceId: 'nonexistent-resource',
        resourceType: 'jwt_token',
        requestedBy: mockUser.id
      };

      const result = await expirationService.renewResource(renewalRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Expiration rule not found');
    });

    test('should handle revocation of non-existent resources', async () => {
      const success = await expirationService.revokeResource(
        'nonexistent-resource',
        'jwt_token',
        mockUser.id
      );

      expect(success).toBe(false);
    });
  });

  // Helper function to generate test JWT token
  function generateTestToken(user: any): string {
    // This would normally use the same JWT signing as the main app
    // For testing, we'll use a simple mock token
    return Buffer.from(JSON.stringify(user)).toString('base64');

});

export { };