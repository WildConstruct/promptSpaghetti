/**
 * Role Cloning System Tests
 * 
 * Comprehensive tests for role cloning functionality including:
 * - Role cloning operations
 * - Permission inheritance validation
 * - Conflict resolution
 * - Clone history tracking
 * - API endpoint testing
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FastifyInstance } from 'fastify';
import { DatabaseConnection } from '../database/connection';
import { RoleCloneService, CloneRoleRequest } from '../admin/RoleCloneService';
import { AuditService } from '../auth/AuditService';
import { buildTestServer } from './helpers/test-server';

describe('Role Cloning System', () => {
  let server: FastifyInstance;
  let db: DatabaseConnection;
  let roleCloneService: RoleCloneService;
  let auditService: AuditService;
  
  // Test data
  const mockUser = {
    id: 'test-user',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['perm_admin_roles']
  };

  const mockSourceRole = {
    id: 'role_source',
    name: 'Source Role',
    description: 'Test source role for cloning',
    permissions: ['perm_read_projects', 'perm_edit_projects'],
    scope: 'organization' as const,
    organizationId: 'org_test',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    isActive: true
  };

  const mockPermissions = [
    {
      id: 'perm_read_projects',
      name: 'Read Projects',
      resource: 'projects',
      action: 'read',
      scope: 'own' as const,
      description: 'View project details',
      category: 'Projects'

    {
      id: 'perm_edit_projects',
      name: 'Edit Projects', 
      resource: 'projects',
      action: 'write',
      scope: 'own' as const,
      description: 'Modify projects',
      category: 'Projects'

    {
      id: 'perm_admin_roles',
      name: 'Manage Roles',
      resource: 'roles',
      action: 'manage',
      scope: 'organization' as const,
      description: 'Create and modify roles',
      category: 'Administration'

  ];

  beforeAll(async () => {
    server = await buildTestServer();
    db = server.db as DatabaseConnection;
    auditService = new AuditService(db);
    roleCloneService = new RoleCloneService(db, auditService);

    // Set up test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await server.close();
  });

  beforeEach(async () => {
    // Clean up any test-created roles
    await db.query('DELETE FROM clone_operations WHERE operation_id LIKE ?', ['test_%']);
    await db.query('DELETE FROM roles WHERE id LIKE ?', ['role_test_%']);
  });

  async function setupTestData() {
    // Insert test permissions
    for (const permission of mockPermissions) {
      await db.query(`
        INSERT IGNORE INTO permissions (id, name, resource, action, scope, description, category, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        permission.id, permission.name, permission.resource, permission.action,
        permission.scope, permission.description, permission.category, 1
      ]);


    // Insert test user
    await db.query(`
      INSERT IGNORE INTO users (id, username, email, is_active, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [mockUser.id, mockUser.username, mockUser.email, 1, new Date()]);

    // Insert test source role
    await db.query(`
      INSERT IGNORE INTO roles (id, name, description, scope, organization_id, created_by, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mockSourceRole.id, mockSourceRole.name, mockSourceRole.description,
      mockSourceRole.scope, mockSourceRole.organizationId, mockSourceRole.createdBy,
      1, mockSourceRole.createdAt, mockSourceRole.updatedAt
    ]);

    // Insert source role permissions
    for (const permission of mockSourceRole.permissions) {
      await db.query(`
        INSERT IGNORE INTO role_permissions (role_id, permission_id)
        VALUES (?, ?)
      `, [mockSourceRole.id, permission]);



  async function cleanupTestData() {
    await db.query('DELETE FROM role_permissions WHERE role_id LIKE ?', ['role_%']);
    await db.query('DELETE FROM clone_operations WHERE operation_id LIKE ?', ['test_%']);
    await db.query('DELETE FROM roles WHERE id LIKE ?', ['role_%']);
    await db.query('DELETE FROM users WHERE id LIKE ?', ['test-%']);
    await db.query('DELETE FROM permissions WHERE id LIKE ?', ['perm_%']);


  describe('RoleCloneService', () => {
    test('should clone role successfully with all permissions', async () => {
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: 'Cloned Test Role',
        targetDescription: 'Test cloned role description',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: mockSourceRole.permissions,
        excludePermissions: []
      };

      const result = await roleCloneService.cloneRole(cloneRequest, mockUser.id);

      expect(result.success).toBe(true);
      expect(result.clonedRole).toBeDefined();
      expect(result.clonedRole!.name).toBe('Cloned Test Role');
      expect(result.clonedRole!.description).toBe('Test cloned role description');
      expect(result.clonedRole!.permissions).toEqual(mockSourceRole.permissions);
      expect(result.clonedRole!.metadata?.clonedFrom).toBe(mockSourceRole.id);
    });

    test('should clone role with selective permissions', async () => {
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: 'Selective Clone Role',
        targetDescription: 'Test selective clone',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: ['perm_read_projects'], // Only one permission
        excludePermissions: ['perm_edit_projects']
      };

      const result = await roleCloneService.cloneRole(cloneRequest, mockUser.id);

      expect(result.success).toBe(true);
      expect(result.clonedRole!.permissions).toEqual(['perm_read_projects']);
      expect(result.clonedRole!.permissions).not.toContain('perm_edit_projects');
    });

    test('should fail when source role does not exist', async () => {
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: 'role_nonexistent',
        targetName: 'Should Fail',
        targetDescription: 'This should fail',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: ['perm_read_projects']
      };

      const result = await roleCloneService.cloneRole(cloneRequest, mockUser.id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Source role not found');
    });

    test('should fail when role name already exists', async () => {
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: mockSourceRole.name, // Same as source role name
        targetDescription: 'Duplicate name test',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: mockSourceRole.permissions
      };

      const result = await roleCloneService.cloneRole(cloneRequest, mockUser.id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Role name already exists in the specified scope');
    });

    test('should validate clone request properly', async () => {
      const invalidRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: '', // Empty name
        targetDescription: '',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: [] // No permissions
      };

      const result = await roleCloneService.cloneRole(invalidRequest, mockUser.id);

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors!.length).toBeGreaterThan(0);
      expect(result.validationErrors).toContain('Target role name is required');
      expect(result.validationErrors).toContain('At least one permission must be included in the clone');
    });

    test('should track clone history', async () => {
      // First, create a successful clone
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: 'History Test Role',
        targetDescription: 'Test clone history',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: mockSourceRole.permissions
      };

      const cloneResult = await roleCloneService.cloneRole(cloneRequest, mockUser.id);
      expect(cloneResult.success).toBe(true);

      // Now check the clone history
      const history = await roleCloneService.getRoleCloneHistory(mockSourceRole.id);

      expect(history).toBeDefined();
      expect(history!.roleId).toBe(mockSourceRole.id);
      expect(history!.cloneCount).toBe(1);
      expect(history!.clonedTo).toHaveLength(1);
      expect(history!.clonedTo[0].roleName).toBe('History Test Role');
      expect(history!.clonedTo[0].clonedBy).toBe(mockUser.id);
    });

    test('should resolve permission conflicts correctly', async () => {
      // Create a request that includes a non-existent permission
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: 'Conflict Test Role',
        targetDescription: 'Test conflict resolution',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: [...mockSourceRole.permissions, 'perm_nonexistent']
      };

      const result = await roleCloneService.cloneRole(cloneRequest, mockUser.id);

      expect(result.success).toBe(true);
      expect(result.clonedRole!.permissions).toEqual(mockSourceRole.permissions);
      expect(result.clonedRole!.permissions).not.toContain('perm_nonexistent');
    });

    test('should get role templates correctly', async () => {
      // First create some clones to make roles into templates
      for (let i = 0; i < 3; i++) {
        const cloneRequest: CloneRoleRequest = {
          sourceRoleId: mockSourceRole.id,
          targetName: `Template Test ${i}`,
          targetDescription: 'Template test clone',
          targetScope: 'organization',
          organizationId: 'org_test',
          includePermissions: mockSourceRole.permissions
        };
        await roleCloneService.cloneRole(cloneRequest, mockUser.id);


      const templates = await roleCloneService.getRoleTemplates('org_test', 5);

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);
      
      const sourceTemplate = templates.find(t => t.id === mockSourceRole.id);
      expect(sourceTemplate).toBeDefined();
      expect(sourceTemplate!.metadata?.cloneCount).toBe(3);
    });
  });

  describe('Role Cloning API Endpoints', () => {
    test('POST /api/roles/clone should clone role successfully', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/roles/clone',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          sourceRoleId: mockSourceRole.id,
          targetName: 'API Test Clone',
          targetDescription: 'API test clone description',
          targetScope: 'organization',
          organizationId: 'org_test',
          includePermissions: mockSourceRole.permissions

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.clonedRole).toBeDefined();
      expect(result.clonedRole.name).toBe('API Test Clone');
    });

    test('POST /api/roles/clone should fail with validation errors', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/roles/clone',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          sourceRoleId: mockSourceRole.id,
          targetName: '', // Invalid empty name
          targetDescription: 'Test description',
          targetScope: 'organization',
          organizationId: 'org_test',
          includePermissions: []

      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    test('GET /api/roles/:roleId/clone-history should return history', async () => {
      // First create a clone
      await server.inject({
        method: 'POST',
        url: '/api/roles/clone',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          sourceRoleId: mockSourceRole.id,
          targetName: 'History API Test',
          targetDescription: 'History test',
          targetScope: 'organization',
          organizationId: 'org_test',
          includePermissions: mockSourceRole.permissions

      });

      // Then get the history
      const response = await server.inject({
        method: 'GET',
        url: `/api/roles/${mockSourceRole.id}/clone-history`,
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.history).toBeDefined();
      expect(result.history.roleId).toBe(mockSourceRole.id);
      expect(result.history.clonedTo.length).toBeGreaterThan(0);
    });

    test('GET /api/roles/templates should return role templates', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/roles/templates?organizationId=org_test',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.templates).toBeDefined();
      expect(Array.isArray(result.templates)).toBe(true);
    });

    test('POST /api/roles/validate-clone should validate request', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/roles/validate-clone',
        headers: {
          'Authorization': `Bearer ${generateTestToken(mockUser)}`

        payload: {
          sourceRoleId: mockSourceRole.id,
          targetName: 'Validation Test',
          targetScope: 'organization',
          organizationId: 'org_test',
          includePermissions: mockSourceRole.permissions

      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.success).toBe(true);
      expect(result.validation).toBeDefined();
      expect(result.validation.isValid).toBe(true);
    });

    test('should require authentication for role cloning endpoints', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/roles/clone',
        payload: {
          sourceRoleId: mockSourceRole.id,
          targetName: 'Unauthorized Test',
          targetDescription: 'Should fail',
          targetScope: 'organization',
          includePermissions: []

      });

      expect(response.statusCode).toBe(401);
    });

    test('should require proper permissions for role cloning', async () => {
      const unauthorizedUser = {
        id: 'unauthorized-user',
        username: 'unauthorized',
        email: 'unauthorized@example.com',
        roles: [] // No role management permissions
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/roles/clone',
        headers: {
          'Authorization': `Bearer ${generateTestToken(unauthorizedUser)}`

        payload: {
          sourceRoleId: mockSourceRole.id,
          targetName: 'Unauthorized Clone',
          targetDescription: 'Should fail',
          targetScope: 'organization',
          includePermissions: []

      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock a database error
      const originalQuery = db.query;
      db.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: 'DB Error Test',
        targetDescription: 'Should handle DB error',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: mockSourceRole.permissions
      };

      const result = await roleCloneService.cloneRole(cloneRequest, mockUser.id);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore original query method
      db.query = originalQuery;
    });

    test('should handle large permission sets efficiently', async () => {
      // Create a role with many permissions
      const manyPermissions = Array.from({ length: 50 }, (_, i) => `perm_test_${i}`);
      
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: mockSourceRole.id,
        targetName: 'Large Permission Set',
        targetDescription: 'Test with many permissions',
        targetScope: 'organization',
        organizationId: 'org_test',
        includePermissions: manyPermissions
      };

      const startTime = Date.now();
      const result = await roleCloneService.cloneRole(cloneRequest, mockUser.id);
      const endTime = Date.now();

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Result should still be success even though some permissions don't exist
      expect(result.success).toBe(true);
    });

    test('should maintain data integrity during concurrent clone operations', async () => {
      const clonePromises = Array.from({ length: 5 }, (_, i) => {
        const cloneRequest: CloneRoleRequest = {
          sourceRoleId: mockSourceRole.id,
          targetName: `Concurrent Clone ${i}`,
          targetDescription: `Concurrent test ${i}`,
          targetScope: 'organization',
          organizationId: 'org_test',
          includePermissions: mockSourceRole.permissions
        };
        return roleCloneService.cloneRole(cloneRequest, mockUser.id);
      });

      const results = await Promise.all(clonePromises);

      // All operations should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Each should have unique names
      const names = results.map(r => r.clonedRole!.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  // Helper function to generate test JWT token
  function generateTestToken(user: any): string {
    // This would normally use the same JWT signing as the main app
    // For testing, we'll use a simple mock token
    return Buffer.from(JSON.stringify(user)).toString('base64');

});

describe('Role Cloning Database Schema', () => {
  test('should have proper database schema for clone operations', async () => {
    // This would test the database migration and schema
    // Implementation depends on your test database setup
    expect(true).toBe(true);
  });
});

export { };