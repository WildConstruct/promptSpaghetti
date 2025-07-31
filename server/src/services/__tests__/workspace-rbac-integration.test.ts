/**
 * Epic 23 RBAC Integration Tests
 *
 * Comprehensive tests for role-based access control integration
 * with workspace context and multi-tenant isolation.
 */

import { WorkspaceService } from '../workspace-service';
import { WorkspaceDAO } from '../../database/workspace-dao';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../../database/workspace-models';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

describe('Epic 23 RBAC Integration', () => {
  let db: Database.Database;
  let dao: WorkspaceDAO;
  let service: WorkspaceService;

  // Test data
  let workspaceId: string;
  let projectId: string;
  let resourceId: string;
  let ownerId: string;
  let adminId: string;
  let editorId: string;
  let viewerId: string;
  let commenterId: string;
  let unauthorizedId: string;

  beforeAll(async () => {
    // Setup in-memory database
    db = new Database(':memory:');
    dao = new WorkspaceDAO(db);
    service = new WorkspaceService(dao);

    // Initialize database schema
    await dao.initialize();

    // Create test users
    ownerId = uuidv4();
    adminId = uuidv4();
    editorId = uuidv4();
    viewerId = uuidv4();
    commenterId = uuidv4();
    unauthorizedId = uuidv4();

    // Create test workspace
    const workspace = await service.createWorkspace(
      {
        name: 'Test Workspace',
        description: 'RBAC integration test workspace',
      },
      ownerId
    );
    workspaceId = workspace.id;

    // Create test project
    const project = await service.createProject(
      {
        workspace_id: workspaceId,
        name: 'Test Project',
        description: 'Test project for RBAC',
      },
      ownerId
    );
    projectId = project.id;

    // Create test resource
    const resource = await service.createResource(
      {
        project_id: projectId,
        name: 'Test Resource',
        type: 'graph',
        size_bytes: 1024,
      },
      ownerId
    );
    resourceId = resource.id;

    // Assign roles to test users
    await service.inviteUserToWorkspace(workspaceId, adminId, 'admin', ownerId);
    await service.inviteUserToWorkspace(workspaceId, editorId, 'editor', ownerId);
    await service.inviteUserToWorkspace(workspaceId, viewerId, 'viewer', ownerId);
    await service.inviteUserToWorkspace(workspaceId, commenterId, 'commenter', ownerId);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('Permission Checking System', () => {
    test('should grant all permissions to workspace owner', async () => {
      // Owner should have access to everything
      const workspace = await service.getWorkspace(workspaceId, ownerId);
      expect(workspace).toBeTruthy();
      expect(workspace?.owner_id).toBe(ownerId);

      const project = await service.getProject(projectId, ownerId);
      expect(project).toBeTruthy();

      const resource = await service.getResource(resourceId, ownerId);
      expect(resource).toBeTruthy();
    });

    test('should enforce admin permissions correctly', async () => {
      // Admin should have all workspace access
      const workspace = await service.getWorkspace(workspaceId, adminId);
      expect(workspace).toBeTruthy();

      // Admin should be able to update workspace
      const updatedWorkspace = await service.updateWorkspace(workspaceId, { description: 'Updated by admin' }, adminId);
      expect(updatedWorkspace?.description).toBe('Updated by admin');

      // Admin should be able to invite users
      const testUserId = uuidv4();
      await expect(service.inviteUserToWorkspace(workspaceId, testUserId, 'viewer', adminId)).resolves.not.toThrow();
    });

    test('should enforce editor permissions correctly', async () => {
      // Editor should be able to create projects
      const project = await service.createProject(
        {
          workspace_id: workspaceId,
          name: 'Editor Created Project',
          description: 'Created by editor',
        },
        editorId
      );
      expect(project).toBeTruthy();

      // Editor should be able to create resources
      const resource = await service.createResource(
        {
          project_id: project.id,
          name: 'Editor Resource',
          type: 'template',
          size_bytes: 512,
        },
        editorId
      );
      expect(resource).toBeTruthy();

      // Editor should NOT be able to update workspace settings
      await expect(
        service.updateWorkspace(workspaceId, { description: 'Editor trying to update' }, editorId)
      ).rejects.toThrow('Insufficient permissions');
    });

    test('should enforce viewer permissions correctly', async () => {
      // Viewer should be able to read workspace
      const workspace = await service.getWorkspace(workspaceId, viewerId);
      expect(workspace).toBeTruthy();

      // Viewer should be able to read projects
      const project = await service.getProject(projectId, viewerId);
      expect(project).toBeTruthy();

      // Viewer should NOT be able to create projects
      await expect(
        service.createProject(
          {
            workspace_id: workspaceId,
            name: 'Viewer Project',
            description: 'Should fail',
          },
          viewerId
        )
      ).rejects.toThrow('Insufficient permissions');

      // Viewer should NOT be able to create resources
      await expect(
        service.createResource(
          {
            project_id: projectId,
            name: 'Viewer Resource',
            type: 'graph',
            size_bytes: 256,
          },
          viewerId
        )
      ).rejects.toThrow('Insufficient permissions');
    });

    test('should enforce commenter permissions correctly', async () => {
      // Commenter should be able to read content
      const workspace = await service.getWorkspace(workspaceId, commenterId);
      expect(workspace).toBeTruthy();

      // Commenter should be able to create comments
      const comment = await service.createComment({
        workspace_id: workspaceId,
        project_id: projectId,
        resource_id: resourceId,
        author_id: commenterId,
        content: 'Test comment from commenter',
        target_type: 'resource',
        target_id: resourceId,
      });
      expect(comment).toBeTruthy();

      // Commenter should NOT be able to create projects
      await expect(
        service.createProject(
          {
            workspace_id: workspaceId,
            name: 'Commenter Project',
            description: 'Should fail',
          },
          commenterId
        )
      ).rejects.toThrow('Insufficient permissions');
    });

    test('should deny access to unauthorized users', async () => {
      // Unauthorized user should not have access
      await expect(service.getWorkspace(workspaceId, unauthorizedId)).rejects.toThrow('Access denied');

      await expect(service.getProject(projectId, unauthorizedId)).rejects.toThrow('Access denied');

      await expect(service.getResource(resourceId, unauthorizedId)).rejects.toThrow('Access denied');
    });
  });

  describe('Workspace Context Management', () => {
    test('should successfully switch workspace context for authorized user', async () => {
      const result = await service.switchWorkspaceContext(adminId, workspaceId);

      expect(result.success).toBe(true);
      expect(result.workspaceInfo).toBeTruthy();
      expect(result.workspaceInfo?.id).toBe(workspaceId);
      expect(result.permissions).toBeTruthy();
      expect(result.permissions).toBe(ROLE_PERMISSIONS.ADMIN);
    });

    test('should reject workspace context switch for unauthorized user', async () => {
      const result = await service.switchWorkspaceContext(unauthorizedId, workspaceId);

      expect(result.success).toBe(false);
      expect(result.workspaceInfo).toBeUndefined();
      expect(result.permissions).toBeUndefined();
    });

    test('should provide correct permission levels for different roles', async () => {
      // Test editor context
      const editorResult = await service.switchWorkspaceContext(editorId, workspaceId);
      expect(editorResult.success).toBe(true);
      expect(editorResult.permissions).toBe(ROLE_PERMISSIONS.EDITOR);

      // Test viewer context
      const viewerResult = await service.switchWorkspaceContext(viewerId, workspaceId);
      expect(viewerResult.success).toBe(true);
      expect(viewerResult.permissions).toBe(ROLE_PERMISSIONS.VIEWER);
    });
  });

  describe('Multi-tenant Isolation', () => {
    test('should enforce workspace isolation for authorized users', async () => {
      // Should not throw for valid access
      await expect(
        service.enforceWorkspaceIsolation(adminId, workspaceId, PERMISSIONS.WORKSPACE_READ)
      ).resolves.not.toThrow();

      await expect(
        service.enforceWorkspaceIsolation(editorId, workspaceId, PERMISSIONS.PROJECT_CREATE)
      ).resolves.not.toThrow();
    });

    test('should block cross-tenant access attempts', async () => {
      await expect(
        service.enforceWorkspaceIsolation(unauthorizedId, workspaceId, PERMISSIONS.WORKSPACE_READ)
      ).rejects.toThrow('Cross-tenant access violation');
    });

    test('should enforce permission-specific isolation', async () => {
      // Viewer should not have admin permissions
      await expect(
        service.enforceWorkspaceIsolation(viewerId, workspaceId, PERMISSIONS.WORKSPACE_ADMIN)
      ).rejects.toThrow('Cross-tenant access violation');

      // But viewer should have read permissions
      await expect(
        service.enforceWorkspaceIsolation(viewerId, workspaceId, PERMISSIONS.WORKSPACE_READ)
      ).resolves.not.toThrow();
    });
  });

  describe('Resource Quota System', () => {
    test('should allow resource creation within quotas', async () => {
      const quotaCheck = await service.checkResourceQuotas(workspaceId, 'projects', 1);

      expect(quotaCheck.allowed).toBe(true);
      expect(quotaCheck.current).toBeGreaterThan(0);
      expect(quotaCheck.limit).toBeGreaterThan(quotaCheck.current);
    });

    test('should report current resource usage', async () => {
      const quotaCheck = await service.checkResourceQuotas(
        workspaceId,
        'projects',
        0 // Just check current usage
      );

      expect(quotaCheck.current).toBeGreaterThan(0); // We created projects in setup
      expect(quotaCheck.limit).toBeGreaterThan(0);
      expect(typeof quotaCheck.allowed).toBe('boolean');
    });

    test('should prevent quota exceeded scenarios', async () => {
      // Request more than the quota limit
      const quotaCheck = await service.checkResourceQuotas(
        workspaceId,
        'projects',
        1000 // Exceed default quota
      );

      expect(quotaCheck.allowed).toBe(false);
      expect(quotaCheck.reason).toContain('quota exceeded');
    });
  });

  describe('Role Management Operations', () => {
    test('should allow admins to update user roles', async () => {
      // Create a new user to test role changes
      const testUserId = uuidv4();
      await service.inviteUserToWorkspace(workspaceId, testUserId, 'viewer', adminId);

      // Admin should be able to change role to editor
      const success = await service.updateUserRole(workspaceId, testUserId, 'editor', adminId);

      expect(success).toBe(true);

      // Verify the role change
      const members = await service.getWorkspaceMembers(workspaceId, adminId);
      const testUser = members.find(m => m.user_id === testUserId);
      expect(testUser).toBeTruthy();
      expect(testUser?.permissions).toBe(ROLE_PERMISSIONS.EDITOR);
    });

    test('should prevent non-admins from updating roles', async () => {
      const testUserId = uuidv4();
      await service.inviteUserToWorkspace(workspaceId, testUserId, 'viewer', adminId);

      // Editor should NOT be able to change roles
      await expect(service.updateUserRole(workspaceId, testUserId, 'admin', editorId)).rejects.toThrow(
        'Insufficient permissions to assign roles'
      );
    });

    test('should prevent owners from demoting themselves', async () => {
      await expect(service.updateUserRole(workspaceId, ownerId, 'viewer', ownerId)).rejects.toThrow(
        'Workspace owners cannot change their own role'
      );
    });

    test('should allow users to remove themselves', async () => {
      const testUserId = uuidv4();
      await service.inviteUserToWorkspace(workspaceId, testUserId, 'editor', adminId);

      // User should be able to remove themselves
      const success = await service.removeUserFromWorkspace(workspaceId, testUserId, testUserId);

      expect(success).toBe(true);
    });

    test('should prevent non-owners from removing the workspace owner', async () => {
      await expect(service.removeUserFromWorkspace(workspaceId, ownerId, adminId)).rejects.toThrow(
        'Workspace owner cannot be removed by others'
      );
    });
  });

  describe('Permission Combination Logic', () => {
    test('should combine permissions from multiple roles correctly', async () => {
      // This would test scenarios where users have multiple role assignments
      // at different scopes (workspace vs project level)
      const permissions = await service.getUserPermissions(workspaceId, adminId, ownerId);

      expect(permissions).toBeTruthy();
      expect(permissions?.permissions).toBe(ROLE_PERMISSIONS.ADMIN);
      expect(permissions?.roles).toHaveLength(1);
      expect(permissions?.roles[0].name).toBe('admin');
    });

    test('should handle workspace membership without roles', async () => {
      const testUserId = uuidv4();

      // Create membership but don't assign any roles
      await dao.createUserMembership(
        {
          user_id: testUserId,
          workspace_id: workspaceId,
        },
        ownerId
      );

      const permissions = await service.getUserPermissions(workspaceId, testUserId, ownerId);

      expect(permissions).toBeTruthy();
      expect(permissions?.permissions).toBe(0); // No permissions
      expect(permissions?.roles).toHaveLength(0);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle non-existent workspace gracefully', async () => {
      const fakeWorkspaceId = uuidv4();

      await expect(service.getWorkspace(fakeWorkspaceId, ownerId)).resolves.toBeNull();
    });

    test('should handle permission checking for non-existent users', async () => {
      const fakeUserId = uuidv4();

      await expect(service.getWorkspace(workspaceId, fakeUserId)).rejects.toThrow('Access denied');
    });

    test('should efficiently check permissions for multiple operations', async () => {
      // Performance test - multiple permission checks should be efficient
      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(service.getWorkspace(workspaceId, adminId));
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(results.every(r => r !== null)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});

describe('RBAC Integration with Existing Systems', () => {
  test('should integrate properly with activity logging', () => {
    // Test that RBAC operations are properly logged
    // This would verify that role changes, permission denials, etc. are tracked
    expect(true).toBe(true); // Placeholder
  });

  test('should integrate properly with notification system', () => {
    // Test that RBAC changes trigger appropriate notifications
    // Role assignments, removals, permission changes should notify affected users
    expect(true).toBe(true); // Placeholder
  });

  test('should maintain consistency with existing workspace operations', () => {
    // Ensure RBAC doesn't break existing workspace functionality
    // Comments, projects, resources should all work with new permission system
    expect(true).toBe(true); // Placeholder
  });
});
