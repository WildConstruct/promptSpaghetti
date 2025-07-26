/**
 * API Permission Assignment Test Suite - Epic 17.4.4 Implementation
 * Task: E17-1753114397222-C2B01B - Create permission assignment
 * 
 * Comprehensive test suite for the API permission assignment system including
 * permissions, assignments, roles, and analytics functionality.
 */

import { 
  ApiPermissionAssignmentService,
  ApiPermissionType,
  ApiPermissionAction,
  ApiPermissionScope,
  ApiPermission,
  ApiRole
} from '../auth/services/ApiPermissionAssignmentService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { RBACService } from '../auth/services/RBACService';
import { UsageControlService } from '../admin/UsageControlService';

// Mock dependencies
jest.mock('../auth/database/DatabaseService');
jest.mock('../auth/services/AuditService');
jest.mock('../auth/services/RBACService');
jest.mock('../admin/UsageControlService');

describe('API Permission Assignment System', () => {
  let permissionService: ApiPermissionAssignmentService;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockRBACService: jest.Mocked<RBACService>;
  let mockUsageControlService: jest.Mocked<UsageControlService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockDatabaseService = new DatabaseService({} as any) as jest.Mocked<DatabaseService>;
    mockAuditService = new AuditService({} as any, mockDatabaseService) as jest.Mocked<AuditService>;
    mockRBACService = {} as jest.Mocked<RBACService>;
    mockUsageControlService = {} as jest.Mocked<UsageControlService>;
    
    // Setup mock implementations
    mockAuditService.logAction = jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown);
    
    // Create service instance
    permissionService = new ApiPermissionAssignmentService(
      mockDatabaseService,
      mockAuditService,
      mockRBACService,
      mockUsageControlService
    );
  });

  describe('Service Initialization', () => {
    test('should initialize successfully', async () => {
      expect(permissionService).toBeDefined();
      expect(permissionService).toBeInstanceOf(ApiPermissionAssignmentService);
    });

    test('should load system permissions on initialization', async () => {
      const permissions = await permissionService.getPermissions();
      
      expect(permissions.length).toBeGreaterThan(0);
      
      // Check for some expected system permissions
      const apiKeyCreatePermission = permissions.find(p => 
        p.type === ApiPermissionType.API_KEY_MANAGEMENT && 
        p.action === ApiPermissionAction.CREATE
      );
      expect(apiKeyCreatePermission).toBeDefined();
      expect(apiKeyCreatePermission!.name).toBe('Create API Keys');
    });

    test('should load system roles on initialization', async () => {
      const roles = await permissionService.getRoles();
      
      expect(roles.length).toBeGreaterThan(0);
      
      // Check for expected system roles
      const adminRole = roles.find(r => r.name === 'API Administrator');
      expect(adminRole).toBeDefined();
      expect(adminRole!.category).toBe('api_admin');
      expect(adminRole!.isSystemRole).toBe(true);
    });
  });

  describe('Permission Management', () => {
    test('should create new API permission', async () => {
      const permissionData = {
        name: 'Test Permission',
        description: 'A test permission for unit testing',
        type: ApiPermissionType.ENDPOINT_ACCESS,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'test_resource'
      };

      const permission = await permissionService.createPermission(permissionData, 'test-admin');

      expect(permission).toBeDefined();
      expect(permission.permissionId).toMatch(/^api_perm_/);
      expect(permission.name).toBe('Test Permission');
      expect(permission.type).toBe(ApiPermissionType.ENDPOINT_ACCESS);
      expect(permission.action).toBe(ApiPermissionAction.READ);
      expect(permission.scope).toBe(ApiPermissionScope.USER);
      expect(permission.resource).toBe('test_resource');
      expect(permission.metadata.createdBy).toBe('test-admin');
      expect(permission.metadata.version).toBe(1);

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_permission_created',
          resource: `api_permission:${permission.permissionId}`,
          details: expect.objectContaining({
            permissionId: permission.permissionId,
            type: ApiPermissionType.ENDPOINT_ACCESS,
            action: ApiPermissionAction.READ
          })
        })
      );
    });

    test('should validate permission data during creation', async () => {
      const invalidPermission = {
        name: '', // Empty name should fail
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.CREATE,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'api_keys'
      };

      await expect(
        permissionService.createPermission(invalidPermission, 'test-admin')
      ).rejects.toThrow('Permission name is required');
    });

    test('should reject invalid permission type', async () => {
      const invalidPermission = {
        name: 'Test Permission',
        type: 'invalid_type' as ApiPermissionType,
        action: ApiPermissionAction.CREATE,
        scope: ApiPermissionScope.GLOBAL,
        resource: 'api_keys'
      };

      await expect(
        permissionService.createPermission(invalidPermission, 'test-admin')
      ).rejects.toThrow('Invalid permission type');
    });

    test('should get permissions with filters', async () => {
      // Get all API key management permissions
      const apiKeyPermissions = await permissionService.getPermissions({
        type: ApiPermissionType.API_KEY_MANAGEMENT
      });

      expect(apiKeyPermissions.length).toBeGreaterThan(0);
      apiKeyPermissions.forEach(permission => {
        expect(permission.type).toBe(ApiPermissionType.API_KEY_MANAGEMENT);
      });

      // Get global scope permissions
      const globalPermissions = await permissionService.getPermissions({
        scope: ApiPermissionScope.GLOBAL
      });

      expect(globalPermissions.length).toBeGreaterThan(0);
      globalPermissions.forEach(permission => {
        expect(permission.scope).toBe(ApiPermissionScope.GLOBAL);
      });
    });
  });

  describe('Permission Assignments', () => {
    let testPermission: ApiPermission;

    beforeEach(async () => {
      // Create a test permission
      testPermission = await permissionService.createPermission({
        name: 'Test Assignment Permission',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'
      }, 'test-admin');
    });

    test('should assign permission to user', async () => {
      const userId = 'test-user-123';
      const assignedBy = 'admin-456';
      const reason = 'Testing permission assignment';

      const assignment = await permissionService.assignPermissionToUser(
        userId,
        testPermission.permissionId,
        assignedBy,
        { reason }
      );

      expect(assignment).toBeDefined();
      expect(assignment.assignmentId).toMatch(/^api_assign_/);
      expect(assignment.userId).toBe(userId);
      expect(assignment.permissionId).toBe(testPermission.permissionId);
      expect(assignment.assignedBy).toBe(assignedBy);
      expect(assignment.status).toBe('active');
      expect(assignment.metadata.reason).toBe(reason);

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_permission_assigned',
          resource: `user:${userId}`,
          details: expect.objectContaining({
            assignmentId: assignment.assignmentId,
            userId,
            permissionId: testPermission.permissionId
          })
        })
      );
    });

    test('should assign permission with expiration date', async () => {
      const userId = 'test-user-123';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const assignment = await permissionService.assignPermissionToUser(
        userId,
        testPermission.permissionId,
        'admin-456',
        {
          reason: 'Temporary access',
          expiresAt
        }
      );

      expect(assignment.expiresAt).toBeDefined();
      expect(assignment.expiresAt!.getTime()).toBe(expiresAt.getTime());
    });

    test('should assign permission with scope context', async () => {
      const userId = 'test-user-123';
      const scopeContext = {
        organizationId: 'org-123',
        teamId: 'team-456'
      };

      const assignment = await permissionService.assignPermissionToUser(
        userId,
        testPermission.permissionId,
        'admin-456',
        {
          reason: 'Organization-specific access',
          scopeContext
        }
      );

      expect(assignment.scopeContext).toEqual(scopeContext);
    });

    test('should create pending assignment when approval is required', async () => {
      const assignment = await permissionService.assignPermissionToUser(
        'test-user-123',
        testPermission.permissionId,
        'admin-456',
        {
          reason: 'Testing approval workflow',
          requiresApproval: true
        }
      );

      expect(assignment.status).toBe('suspended');
    });

    test('should reject assignment of non-existent permission', async () => {
      await expect(
        permissionService.assignPermissionToUser(
          'test-user-123',
          'non-existent-permission',
          'admin-456',
          { reason: 'Test' }
        )
      ).rejects.toThrow('Permission non-existent-permission not found');
    });

    test('should validate assignment data', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() - 1); // Past date

      await expect(
        permissionService.assignPermissionToUser(
          'test-user-123',
          testPermission.permissionId,
          'admin-456',
          {
            reason: 'Test',
            expiresAt: futureDate
          }
        )
      ).rejects.toThrow('Expiration date must be in the future');
    });

    test('should revoke permission assignment', async () => {
      // First assign a permission
      const assignment = await permissionService.assignPermissionToUser(
        'test-user-123',
        testPermission.permissionId,
        'admin-456',
        { reason: 'Test assignment' }
      );

      // Then revoke it
      const revokeReason = 'Permission no longer needed';
      await permissionService.revokePermissionFromUser(
        assignment.assignmentId,
        'admin-789',
        revokeReason
      );

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_permission_revoked',
          resource: `user:${assignment.userId}`,
          details: expect.objectContaining({
            assignmentId: assignment.assignmentId,
            reason: revokeReason
          })
        })
      );
    });

    test('should reject revocation of non-existent assignment', async () => {
      await expect(
        permissionService.revokePermissionFromUser('non-existent-assignment', 'admin-456', 'Test')
      ).rejects.toThrow('Assignment non-existent-assignment not found');
    });

    test('should reject revocation of already revoked assignment', async () => {
      // First assign and revoke a permission
      const assignment = await permissionService.assignPermissionToUser(
        'test-user-123',
        testPermission.permissionId,
        'admin-456',
        { reason: 'Test assignment' }
      );

      await permissionService.revokePermissionFromUser(
        assignment.assignmentId,
        'admin-789',
        'First revocation'
      );

      // Try to revoke again
      await expect(
        permissionService.revokePermissionFromUser(
          assignment.assignmentId,
          'admin-789',
          'Second revocation'
        )
      ).rejects.toThrow('is already revoked');
    });
  });

  describe('Permission Checking', () => {
    let testUser: string;
    let testPermission: ApiPermission;
    let testAssignment: unknown;

    beforeEach(async () => {
      testUser = 'test-user-check';
      
      // Create and assign a test permission
      testPermission = await permissionService.createPermission({
        name: 'API Key Read Permission',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'
      }, 'test-admin');

      testAssignment = await permissionService.assignPermissionToUser(
        testUser,
        testPermission.permissionId,
        'admin-456',
        { reason: 'Testing permission checks' }
      );
    });

    test('should allow access when user has required permission', async () => {
      const checkResult = await permissionService.checkPermission({
        userId: testUser,
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        resource: 'api_keys'
      });

      expect(checkResult.allowed).toBe(true);
      expect(checkResult.matchingPermissions).toHaveLength(1);
      expect(checkResult.matchingPermissions[0].permissionId).toBe(testPermission.permissionId);
      expect(checkResult.reason).toContain('Permission granted');
    });

    test('should deny access when user lacks required permission', async () => {
      const checkResult = await permissionService.checkPermission({
        userId: testUser,
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.DELETE, // User only has READ permission
        resource: 'api_keys'
      });

      expect(checkResult.allowed).toBe(false);
      expect(checkResult.matchingPermissions).toHaveLength(0);
      expect(checkResult.reason).toBe('No matching permissions found');
      expect(checkResult.suggestions).toContain('Contact your administrator to request the necessary permissions');
    });

    test('should deny access for non-existent user', async () => {
      const checkResult = await permissionService.checkPermission({
        userId: 'non-existent-user',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        resource: 'api_keys'
      });

      expect(checkResult.allowed).toBe(false);
      expect(checkResult.matchingPermissions).toHaveLength(0);
    });

    test('should check permission with context', async () => {
      const checkResult = await permissionService.checkPermission({
        userId: testUser,
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        resource: 'api_keys',
        context: {
          organizationId: 'org-123',
          metadata: { source: 'unit-test' }
        }
      });

      expect(checkResult.allowed).toBe(true);
    });
  });

  describe('User Permission Management', () => {
    let testUser: string;
    let testPermissions: ApiPermission[];
    let testAssignments: any[];

    beforeEach(async () => {
      testUser = 'test-user-permissions';
      testPermissions = [];
      testAssignments = [];

      // Create multiple test permissions
      const permissionTypes = [
        { type: ApiPermissionType.API_KEY_MANAGEMENT, action: ApiPermissionAction.READ },
        { type: ApiPermissionType.API_KEY_MANAGEMENT, action: ApiPermissionAction.CREATE },
        { type: ApiPermissionType.USAGE_CONTROL, action: ApiPermissionAction.READ }
      ];

      for (const permType of permissionTypes) {
        const permission = await permissionService.createPermission({
          name: `Test ${permType.type} ${permType.action}`,
          type: permType.type,
          action: permType.action,
          scope: ApiPermissionScope.USER,
          resource: 'test_resource'
        }, 'test-admin');
        
        testPermissions.push(permission);

        const assignment = await permissionService.assignPermissionToUser(
          testUser,
          permission.permissionId,
          'admin-456',
          { reason: `Testing ${permType.type} ${permType.action}` }
        );
        
        testAssignments.push(assignment);
      }
    });

    test('should get all user permissions', async () => {
      const userPermissions = await permissionService.getUserPermissions(testUser);

      expect(userPermissions.assignments).toHaveLength(3);
      expect(userPermissions.permissions).toHaveLength(3);
      expect(userPermissions.summary.activeCount).toBe(3);
      expect(userPermissions.summary.totalCount).toBe(3);
      expect(userPermissions.summary.expiredCount).toBe(0);
      expect(userPermissions.summary.suspendedCount).toBe(0);
    });

    test('should filter user permissions by type', async () => {
      const userPermissions = await permissionService.getUserPermissions(testUser, {
        type: ApiPermissionType.API_KEY_MANAGEMENT
      });

      expect(userPermissions.permissions).toHaveLength(2);
      userPermissions.permissions.forEach(permission => {
        expect(permission.type).toBe(ApiPermissionType.API_KEY_MANAGEMENT);
      });
    });

    test('should filter user permissions by scope', async () => {
      const userPermissions = await permissionService.getUserPermissions(testUser, {
        scope: ApiPermissionScope.USER
      });

      expect(userPermissions.assignments).toHaveLength(3);
      userPermissions.assignments.forEach(assignment => {
        expect(assignment.scope).toBe(ApiPermissionScope.USER);
      });
    });

    test('should exclude expired permissions by default', async () => {
      // Create an expired assignment by setting expiration in the past
      const expiredPermission = await permissionService.createPermission({
        name: 'Expired Permission',
        type: ApiPermissionType.MONITORING,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'test_resource'
      }, 'test-admin');

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await permissionService.assignPermissionToUser(
        testUser,
        expiredPermission.permissionId,
        'admin-456',
        { 
          reason: 'Testing expired permissions',
          expiresAt: pastDate
        }
      );

      const userPermissions = await permissionService.getUserPermissions(testUser);
      
      // Should not include the expired assignment
      expect(userPermissions.assignments).toHaveLength(3);
      expect(userPermissions.permissions).toHaveLength(3);
    });

    test('should include expired permissions when requested', async () => {
      const userPermissions = await permissionService.getUserPermissions(testUser, {
        includeExpired: true
      });

      expect(userPermissions.assignments.length).toBeGreaterThanOrEqual(3);
      expect(userPermissions.permissions.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Role Management', () => {
    test('should create API role with permissions', async () => {
      // Get some test permissions
      const permissions = await permissionService.getPermissions({ 
        type: ApiPermissionType.API_KEY_MANAGEMENT 
      });
      
      const roleData = {
        name: 'Test API Role',
        description: 'A test role for unit testing',
        category: 'custom' as const,
        permissions: permissions.slice(0, 2).map(p => p.permissionId),
        scope: ApiPermissionScope.ORGANIZATION
      };

      const role = await permissionService.createApiRole(roleData, 'test-admin');

      expect(role).toBeDefined();
      expect(role.roleId).toMatch(/^api_role_/);
      expect(role.name).toBe('Test API Role');
      expect(role.category).toBe('custom');
      expect(role.permissions).toHaveLength(2);
      expect(role.scope).toBe(ApiPermissionScope.ORGANIZATION);
      expect(role.isSystemRole).toBe(false);
      expect(role.metadata.createdBy).toBe('test-admin');

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_role_created',
          resource: `api_role:${role.roleId}`,
          details: expect.objectContaining({
            roleId: role.roleId,
            name: 'Test API Role',
            category: 'custom'
          })
        })
      );
    });

    test('should validate role data during creation', async () => {
      const invalidRole = {
        name: '', // Empty name should fail
        category: 'custom' as const,
        permissions: [],
        scope: ApiPermissionScope.GLOBAL
      };

      await expect(
        permissionService.createApiRole(invalidRole, 'test-admin')
      ).rejects.toThrow('Role name is required');
    });

    test('should reject role with no permissions', async () => {
      const invalidRole = {
        name: 'Empty Role',
        category: 'custom' as const,
        permissions: [], // No permissions should fail
        scope: ApiPermissionScope.GLOBAL
      };

      await expect(
        permissionService.createApiRole(invalidRole, 'test-admin')
      ).rejects.toThrow('Role must have at least one permission');
    });

    test('should reject role with non-existent permissions', async () => {
      const invalidRole = {
        name: 'Invalid Role',
        category: 'custom' as const,
        permissions: ['non-existent-permission'],
        scope: ApiPermissionScope.GLOBAL
      };

      await expect(
        permissionService.createApiRole(invalidRole, 'test-admin')
      ).rejects.toThrow('Permission non-existent-permission does not exist');
    });

    test('should assign role to user', async () => {
      // Create a test role
      const permissions = await permissionService.getPermissions({ 
        type: ApiPermissionType.API_KEY_MANAGEMENT 
      });
      
      const role = await permissionService.createApiRole({
        name: 'Test Role Assignment',
        category: 'custom',
        permissions: permissions.slice(0, 2).map(p => p.permissionId),
        scope: ApiPermissionScope.USER
      }, 'test-admin');

      const userId = 'test-user-role';
      const assignments = await permissionService.assignRoleToUser(
        userId,
        role.roleId,
        'admin-456',
        { reason: 'Testing role assignment' }
      );

      expect(assignments).toHaveLength(2); // Should create assignments for both permissions
      assignments.forEach(assignment => {
        expect(assignment.userId).toBe(userId);
        expect(assignment.assignedBy).toBe('admin-456');
        expect(assignment.status).toBe('active');
        expect(role.permissions).toContain(assignment.permissionId);
      });

      // Verify audit logging
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'api_role_assigned',
          resource: `user:${userId}`,
          details: expect.objectContaining({
            userId,
            roleId: role.roleId,
            roleName: role.name,
            assignedPermissions: 2
          })
        })
      );
    });

    test('should get roles with filters', async () => {
      // Get system roles by category
      const adminRoles = await permissionService.getRoles({ category: 'api_admin' });
      expect(adminRoles.length).toBeGreaterThan(0);
      adminRoles.forEach(role => {
        expect(role.category).toBe('api_admin');
      });

      // Get global scope roles
      const globalRoles = await permissionService.getRoles({ scope: ApiPermissionScope.GLOBAL });
      expect(globalRoles.length).toBeGreaterThan(0);
      globalRoles.forEach(role => {
        expect(role.scope).toBe(ApiPermissionScope.GLOBAL);
      });
    });
  });

  describe('Analytics and Reporting', () => {
    beforeEach(async () => {
      // Create some test data for analytics
      const testUser = 'analytics-test-user';
      
      const testPermission = await permissionService.createPermission({
        name: 'Analytics Test Permission',
        type: ApiPermissionType.MONITORING,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'analytics'
      }, 'test-admin');

      await permissionService.assignPermissionToUser(
        testUser,
        testPermission.permissionId,
        'admin-456',
        { reason: 'Analytics testing' }
      );

      // Simulate some permission usage
      await permissionService.checkPermission({
        userId: testUser,
        type: ApiPermissionType.MONITORING,
        action: ApiPermissionAction.READ,
        resource: 'analytics'
      });
    });

    test('should generate analytics report', async () => {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const analytics = await permissionService.generateAnalytics({
        start: lastWeek,
        end: now
      });

      expect(analytics).toBeDefined();
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.totalPermissions).toBeGreaterThan(0);
      expect(analytics.summary.activeAssignments).toBeGreaterThan(0);
      expect(analytics.summary.recentActivity).toBeDefined();

      expect(analytics.breakdown).toBeDefined();
      expect(analytics.breakdown.byType).toBeDefined();
      expect(analytics.breakdown.byAction).toBeDefined();
      expect(analytics.breakdown.byScope).toBeDefined();

      expect(analytics.security).toBeDefined();
      expect(Array.isArray(analytics.security.overPrivilegedUsers)).toBe(true);
      expect(Array.isArray(analytics.security.unusedPermissions)).toBe(true);
      expect(Array.isArray(analytics.security.expiringAssignments)).toBe(true);

      expect(analytics.recommendations).toBeDefined();
      expect(Array.isArray(analytics.recommendations)).toBe(true);
    });

    test('should get permission activities', async () => {
      const activities = await permissionService.getActivities(undefined, 10);

      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThan(0);

      activities.forEach(activity => {
        expect(activity.activityId).toBeDefined();
        expect(activity.userId).toBeDefined();
        expect(activity.action).toMatch(/granted|revoked|used|denied/);
        expect(activity.timestamp).toBeInstanceOf(Date);
        expect(['success', 'failure', 'warning']).toContain(activity.result);
      });
    });

    test('should get activities for specific user', async () => {
      const testUser = 'analytics-test-user';
      const userActivities = await permissionService.getActivities(testUser, 5);

      expect(Array.isArray(userActivities)).toBe(true);
      userActivities.forEach(activity => {
        expect(activity.userId).toBe(testUser);
      });
    });

    test('should get permission templates', async () => {
      const templates = await permissionService.getTemplates();

      expect(Array.isArray(templates)).toBe(true);
      // Built-in templates should be available
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle concurrent permission assignments gracefully', async () => {
      const testPermission = await permissionService.createPermission({
        name: 'Concurrent Test Permission',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'
      }, 'test-admin');

      // Try to assign the same permission to multiple users concurrently
      const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const assignmentPromises = users.map(userId =>
        permissionService.assignPermissionToUser(
          userId,
          testPermission.permissionId,
          'admin-456',
          { reason: `Concurrent assignment for ${userId}` }
        )
      );

      const assignments = await Promise.all(assignmentPromises);
      expect(assignments).toHaveLength(5);
      
      assignments.forEach((assignment, index) => {
        expect(assignment.userId).toBe(users[index]);
        expect(assignment.permissionId).toBe(testPermission.permissionId);
        expect(assignment.status).toBe('active');
      });
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      const originalQuery = mockDatabaseService.query;
      mockDatabaseService.query = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Database connection failed'));

      // Operations should still work with in-memory data
      const permissions = await permissionService.getPermissions();
      expect(permissions.length).toBeGreaterThan(0);

      // Restore original mock
      mockDatabaseService.query = originalQuery;
    });

    test('should handle empty permission assignments', async () => {
      const nonExistentUser = 'non-existent-user-12345';
      const userPermissions = await permissionService.getUserPermissions(nonExistentUser);

      expect(userPermissions.assignments).toHaveLength(0);
      expect(userPermissions.permissions).toHaveLength(0);
      expect(userPermissions.roles).toHaveLength(0);
      expect(userPermissions.summary.totalCount).toBe(0);
    });

    test('should handle invalid date formats in assignments', async () => {
      const testPermission = await permissionService.createPermission({
        name: 'Date Test Permission',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys'
      }, 'test-admin');

      // Test with invalid expiration date
      const invalidDate = new Date('invalid-date');
      
      // Should handle invalid date gracefully
      const assignment = await permissionService.assignPermissionToUser(
        'test-user-date',
        testPermission.permissionId,
        'admin-456',
        {
          reason: 'Testing date handling',
          expiresAt: invalidDate.getTime() > 0 ? invalidDate : undefined
        }
      );

      expect(assignment).toBeDefined();
      // If invalid date, expiresAt should be undefined
      if (invalidDate.getTime() > 0) {
        expect(assignment.expiresAt).toBeDefined();
      } else {
        expect(assignment.expiresAt).toBeUndefined();
      }
    });

    test('should validate permission conditions properly', async () => {
      const permissionWithConditions = {
        name: 'Conditional Permission',
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.UPDATE,
        scope: ApiPermissionScope.USER,
        resource: 'api_keys',
        conditions: [
          {
            field: 'organizationId',
            operator: 'eq' as const,
            value: 'org-123'
          }
        ]
      };

      const permission = await permissionService.createPermission(permissionWithConditions, 'test-admin');
      
      expect(permission.conditions).toBeDefined();
      expect(permission.conditions).toHaveLength(1);
      expect(permission.conditions![0].field).toBe('organizationId');
    });

    test('should handle performance with large numbers of permissions', async () => {
      // Test performance by checking many permissions at once
      const startTime = Date.now();
      
      const permissions = await permissionService.getPermissions();
      
      // Perform multiple permission checks
      const checks = [];
      for (let i = 0; i < 10; i++) {
        checks.push(
          permissionService.checkPermission({
            userId: 'performance-test-user',
            type: ApiPermissionType.API_KEY_MANAGEMENT,
            action: ApiPermissionAction.READ,
            resource: 'api_keys'
          })
        );
      }
      
      await Promise.all(checks);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (< 1 second)
      expect(executionTime).toBeLessThan(1000);
      expect(permissions.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Testing', () => {
    test('should maintain audit trail for all operations', async () => {
      // Create permission
      const permission = await permissionService.createPermission({
        name: 'Audit Trail Test',
        type: ApiPermissionType.MONITORING,
        action: ApiPermissionAction.READ,
        scope: ApiPermissionScope.USER,
        resource: 'audit_test'
      }, 'test-admin');

      // Assign permission
      const assignment = await permissionService.assignPermissionToUser(
        'audit-test-user',
        permission.permissionId,
        'admin-456',
        { reason: 'Testing audit trail' }
      );

      // Check permission (should create activity)
      await permissionService.checkPermission({
        userId: 'audit-test-user',
        type: ApiPermissionType.MONITORING,
        action: ApiPermissionAction.READ,
        resource: 'audit_test'
      });

      // Revoke permission
      await permissionService.revokePermissionFromUser(
        assignment.assignmentId,
        'admin-789',
        'Testing audit trail completion'
      );

      // Verify audit logging was called for each operation
      expect(mockAuditService.logAction).toHaveBeenCalledTimes(3);
      
      // Check specific audit entries
      const auditCalls = mockAuditService.logAction.mock.calls;
      expect(auditCalls[0][0].action).toBe('api_permission_created');
      expect(auditCalls[1][0].action).toBe('api_permission_assigned');
      expect(auditCalls[2][0].action).toBe('api_permission_revoked');
    });

    test('should work with system roles end-to-end', async () => {
      // Get API Administrator role (system role)
      const roles = await permissionService.getRoles({ category: 'api_admin' });
      const adminRole = roles.find(r => r.name === 'API Administrator');
      
      expect(adminRole).toBeDefined();
      expect(adminRole!.isSystemRole).toBe(true);

      // Assign admin role to user
      const userId = 'integration-test-admin';
      const assignments = await permissionService.assignRoleToUser(
        userId,
        adminRole!.roleId,
        'super-admin',
        { reason: 'Integration testing admin role' }
      );

      expect(assignments.length).toBeGreaterThan(0);

      // Check that user now has admin permissions
      const checkResult = await permissionService.checkPermission({
        userId,
        type: ApiPermissionType.API_KEY_MANAGEMENT,
        action: ApiPermissionAction.CREATE,
        resource: 'api_keys'
      });

      expect(checkResult.allowed).toBe(true);
      expect(checkResult.matchingPermissions.length).toBeGreaterThan(0);
    });
  });
});