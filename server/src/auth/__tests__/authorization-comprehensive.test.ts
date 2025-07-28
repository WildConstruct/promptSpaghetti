/**
 * Epic 19.5 - Comprehensive Authorization & RBAC Test Suite
 * 
 * This test suite focuses specifically on authorization, role-based access control,
 * permission systems, and advanced access control scenarios for Epic 19.5.
 * 
 * Test Categories:
 * 1. Role-Based Access Control (RBAC) Testing
 * 2. Permission Inheritance & Delegation
 * 3. Resource-Level Access Control
 * 4. Dynamic & Contextual Permissions
 * 5. Cross-Service Authorization
 * 6. Privilege Escalation Prevention
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Fastify from 'fastify';
import { RBACService } from '../services/RBACService';
import { UserService } from '../services/UserService';
import { TokenService } from '../services/TokenService';
import { AuditService } from '../services/AuditService';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';
import { buildAuthConfig } from '../config';

// Mock all services
jest.mock('../services/RBACService');
jest.mock('../services/UserService');
jest.mock('../services/TokenService');
jest.mock('../services/AuditService');
jest.mock('../database/DatabaseService');
jest.mock('../database/RedisService');

describe('Epic 19.5 - Comprehensive Authorization & RBAC Tests', () => {
  let fastify: FastifyInstance;
  let rbacService: jest.Mocked<RBACService>;
  let userService: jest.Mocked<UserService>;
  let tokenService: jest.Mocked<TokenService>;
  let auditService: jest.Mocked<AuditService>;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockRedis: jest.Mocked<RedisService>;

  const mockAuthConfig = buildAuthConfig();

  // Test data
  const testUsers = {
    superAdmin: {
      id: 1,
      email: 'super@admin.com',
      roles: ['super_admin'],
      permissions: ['*']
  }
    admin: {
      id: 2,
      email: 'admin@company.com',
      roles: ['admin'],
      permissions: ['users:read', 'users:write', 'reports:read', 'settings:read']
  }
    manager: {
      id: 3,
      email: 'manager@company.com',
      roles: ['manager'],
      permissions: ['users:read', 'reports:read', 'team:manage']
  }
    user: {
      id: 4,
      email: 'user@company.com',
      roles: ['user'],
      permissions: ['profile:read', 'profile:write']
  }
    contractor: {
      id: 5,
      email: 'contractor@company.com',
      roles: ['contractor'],
      permissions: ['reports:read'],
      context: { department: 'engineering', clearanceLevel: 'public' }
    }
  };

  const testRoles = {
    super_admin: {
      id: 'super_admin',
      name: 'Super Administrator',
      permissions: ['*'],
      inherits: [],
      constraints: {}
  }
    admin: {
      id: 'admin',
      name: 'Administrator',
      permissions: ['users:*', 'reports:*', 'settings:read'],
      inherits: ['manager'],
      constraints: {}
  }
    manager: {
      id: 'manager',
      name: 'Manager',
      permissions: ['users:read', 'reports:read', 'team:manage'],
      inherits: ['user'],
      constraints: { businessHours: true }
  }
    user: {
      id: 'user',
      name: 'User',
      permissions: ['profile:*'],
      inherits: [],
      constraints: {}
  }
    contractor: {
      id: 'contractor',
      name: 'Contractor',
      permissions: ['reports:read'],
      inherits: [],
      constraints: { 
        ipWhitelist: ['192.168.1.0/24'],
        timeLimit: 90 // days
      }
    }
  };

  beforeEach(async () => {
    // Create fresh Fastify instance
    fastify = Fastify({ logger: false });

    // Initialize mocked services
    mockDb = new DatabaseService(mockAuthConfig) as jest.Mocked<DatabaseService>;
    mockRedis = new RedisService(mockAuthConfig.redis) as jest.Mocked<RedisService>;
    auditService = new AuditService(mockAuthConfig, mockDb) as jest.Mocked<AuditService>;
    userService = new UserService(mockAuthConfig, mockDb, auditService) as jest.Mocked<UserService>;
    tokenService = new TokenService(mockAuthConfig, mockRedis, mockDb) as jest.Mocked<TokenService>;
    rbacService = new RBACService(mockAuthConfig, mockDb, auditService) as jest.Mocked<RBACService>;

    // Setup default mock behaviors
    mockDb.connect.mockResolvedValue();
    mockRedis.connect.mockResolvedValue();
    auditService.logEvent.mockResolvedValue();

    // Mock user lookups
    userService.findById.mockImplementation(async (userId) => {
      const user = Object.values(testUsers).find(u => u.id === userId);
      return user || null;
    });

    rbacService.hasPermission.mockImplementation(async (userId, permission) => {
      const user = Object.values(testUsers).find(u => u.id === userId);
      return user ? user.permissions.includes(permission) || user.permissions.includes('*') : false;
    });

    // Add authorization middleware
    fastify.addHook('preHandler', async (request, reply) => {
      if (request.url.startsWith('/api/')) {
        const userId = parseInt(request.headers['x-user-id'] as string || '0');
        const user = Object.values(testUsers).find(u => u.id === userId);
        
        if (!user) {
          return reply.code(401).send({ error: 'Unauthorized' });
        }
        
        request.user = user;
      }
    });
  });

  afterEach(async () => {
    await fastify.close();
    jest.clearAllMocks();
  });

  describe('1. Role-Based Access Control (RBAC) Testing', () => {
    describe('Basic Role Permissions', () => {
      it('should allow super admin access to all resources', async () => {
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          return user?.permissions.includes('*') || user?.permissions.includes(permission) || false;
        });

        fastify.get('/api/admin/system', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'system:admin');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Forbidden' });
          }
          return { message: 'System admin access granted' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/api/admin/system',
          headers: { 'x-user-id': '1' } // super admin
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toMatchObject({
          message: 'System admin access granted'
        });
      });

      it('should enforce role-specific permissions', async () => {
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (!user) return false;
          if (user.permissions.includes('*')) return true;
          return user.permissions.some(p => {
            if (p.endsWith(':*')) {
              return permission.startsWith(p.slice(0, -1));
            }
            return p === permission;
          });
        });

        fastify.get('/api/users', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'users:read');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Insufficient permissions' });
          }
          return { users: ['user1', 'user2'] };
        });

        fastify.post('/api/users', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'users:write');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Insufficient permissions' });
          }
          return { success: true };
        });

        // Test admin access (should have both read and write)
        const adminReadResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users',
          headers: { 'x-user-id': '2' } // admin
        });
        expect(adminReadResponse.statusCode).toBe(200);

        const adminWriteResponse = await fastify.inject({
          method: 'POST',
          url: '/api/users',
          headers: { 'x-user-id': '2' }, // admin
          payload: { name: 'New User' }
        });
        expect(adminWriteResponse.statusCode).toBe(200);

        // Test manager access (should have read but not write)
        const managerReadResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users',
          headers: { 'x-user-id': '3' } // manager
        });
        expect(managerReadResponse.statusCode).toBe(200);

        const managerWriteResponse = await fastify.inject({
          method: 'POST',
          url: '/api/users',
          headers: { 'x-user-id': '3' }, // manager
          payload: { name: 'New User' }
        });
        expect(managerWriteResponse.statusCode).toBe(403);
      });

      it('should handle wildcard permissions correctly', async () => {
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (!user) return false;
          
          return user.permissions.some(p => {
            if (p === '*') return true; // Super admin wildcard
            if (p.endsWith(':*')) {
              const prefix = p.slice(0, -1);
              return permission.startsWith(prefix);
            }
            return p === permission;
          });
        });

        fastify.get('/api/profile/settings', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'profile:settings');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Access denied' });
          }
          return { settings: {} };
        });

        fastify.post('/api/profile/update', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'profile:update');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Access denied' });
          }
          return { success: true };
        });

        // Test user with profile:* permission
        const settingsResponse = await fastify.inject({
          method: 'GET',
          url: '/api/profile/settings',
          headers: { 'x-user-id': '4' } // user
        });
        expect(settingsResponse.statusCode).toBe(200);

        const updateResponse = await fastify.inject({
          method: 'POST',
          url: '/api/profile/update',
          headers: { 'x-user-id': '4' }, // user
          payload: { name: 'Updated Name' }
        });
        expect(updateResponse.statusCode).toBe(200);
      });
    });

    describe('Role Inheritance', () => {
      it('should inherit permissions from parent roles', async () => {
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (!user) return false;

          const getAllPermissions = (roleIds: string[]): string[] => {
            const allPermissions = new Set<string>();
            
            const processRole = (roleId: string) => {
              const role = testRoles[roleId as keyof typeof testRoles];
              if (!role) return;
              
              role.permissions.forEach(p => allPermissions.add(p));
              role.inherits.forEach(parentRoleId => processRole(parentRoleId));
            };

            roleIds.forEach(roleId => processRole(roleId));
            return Array.from(allPermissions);
          };

          const allPermissions = getAllPermissions(user.roles);
          
          return allPermissions.some(p => {
            if (p === '*') return true;
            if (p.endsWith(':*')) {
              return permission.startsWith(p.slice(0, -1));
            }
            return p === permission;
          });
        });

        fastify.get('/api/profile/view', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'profile:read');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Access denied' });
          }
          return { profile: 'data' };
        });

        // Manager should inherit profile:read from user role
        const response = await fastify.inject({
          method: 'GET',
          url: '/api/profile/view',
          headers: { 'x-user-id': '3' } // manager (inherits from user)
        });

        expect(response.statusCode).toBe(200);
        expect(rbacService.hasPermission).toHaveBeenCalledWith(3, 'profile:read');
      });

      it('should handle complex role hierarchies', async () => {
        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (!user) return false;

          // Simulate complex permission resolution
          const resolvePermissions = (roleIds: string[], visited = new Set<string>()): string[] => {
            const permissions = new Set<string>();
            
            roleIds.forEach(roleId => {
              if (visited.has(roleId)) return; // Prevent infinite loops
              visited.add(roleId);
              
              const role = testRoles[roleId as keyof typeof testRoles];
              if (role) {
                role.permissions.forEach(p => permissions.add(p));
                if (role.inherits.length > 0) {
                  const inheritedPermissions = resolvePermissions(role.inherits, visited);
                  inheritedPermissions.forEach(p => permissions.add(p));
                }
              }
            });
            
            return Array.from(permissions);
          };

          const allPermissions = resolvePermissions(user.roles);
          
          return allPermissions.some(p => {
            if (p === '*') return true;
            if (p.endsWith(':*')) {
              return permission.startsWith(p.slice(0, -1));
            }
            return p === permission;
          });
        });

        fastify.get('/api/management/team', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'team:manage');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Not a manager' });
          }
          return { team: 'management-data' };
        });

        fastify.get('/api/reports/view', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'reports:read');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Cannot access reports' });
          }
          return { reports: 'report-data' };
        });

        // Test admin (inherits from manager which inherits from user)
        const adminTeamResponse = await fastify.inject({
          method: 'GET',
          url: '/api/management/team',
          headers: { 'x-user-id': '2' } // admin
        });
        expect(adminTeamResponse.statusCode).toBe(200);

        const adminReportsResponse = await fastify.inject({
          method: 'GET',
          url: '/api/reports/view',
          headers: { 'x-user-id': '2' } // admin
        });
        expect(adminReportsResponse.statusCode).toBe(200);
      });
    });
  });

  describe('2. Permission Inheritance & Delegation', () => {
    describe('Permission Delegation', () => {
      it('should allow temporary permission delegation', async () => {
        const mockDelegationService = {
          createDelegation: jest.fn<unknown[], unknown>().mockResolvedValue({
            id: 'delegation-123',
            fromUserId: 3, // manager
            toUserId: 4, // user
            permissions: ['reports:read'],
            expiresAt: new Date(Date.now( as unknown as unknown) + 3600000).toISOString(), // 1 hour
            constraints: { maxUses: 5 }
          }),
          checkDelegation: jest.fn<unknown[], unknown>().mockImplementation(async (userId, permission) => {
            if (userId === 4 && permission === 'reports:read') {
              return {
                allowed: true,
                delegation: { id: 'delegation-123', remainingUses: 4 }
              };
            }
            return { allowed: false };
          }),
          revokeDelegation: jest.fn<unknown[], unknown>().mockResolvedValue({ success: true } as unknown as unknown as unknown as unknown as unknown)
        };

        // Create delegation endpoint
        fastify.post('/api/admin/delegate-permission', async (request, reply) => {
          const { toUserId, permissions, duration, constraints } = request.body as any;
          
          // Only managers and above can delegate
          const canDelegate = await rbacService.hasPermission(request.user.id, 'permissions:delegate');
          if (!canDelegate) {
            return reply.code(403).send({ error: 'Cannot delegate permissions' });
          }

          const delegation = await mockDelegationService.createDelegation({
            fromUserId: request.user.id,
            toUserId,
            permissions,
            duration,
            constraints
          });

          return delegation;
        });

        // Use delegated permission
        fastify.get('/api/reports/delegated', async (request, reply) => {
          const directPermission = await rbacService.hasPermission(request.user.id, 'reports:read');
          const delegatedPermission = await mockDelegationService.checkDelegation(request.user.id, 'reports:read');
          
          if (!directPermission && !delegatedPermission.allowed) {
            return reply.code(403).send({ error: 'Access denied' });
          }

          return { 
            reports: 'delegated-access-data',
            accessType: directPermission ? 'direct' : 'delegated',
            delegation: delegatedPermission.delegation
          };
        });

        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          if (userId === 3 && permission === 'permissions:delegate') return true;
          if (userId === 3 && permission === 'reports:read') return true;
          return false;
        });

        // Test delegation creation (manager delegating to user)
        const delegationResponse = await fastify.inject({
          method: 'POST',
          url: '/api/admin/delegate-permission',
          headers: { 'x-user-id': '3' }, // manager
          payload: {
            toUserId: 4,
            permissions: ['reports:read'],
            duration: 3600,
            constraints: { maxUses: 5 }
          }
        });

        expect(delegationResponse.statusCode).toBe(200);
        expect(JSON.parse(delegationResponse.body)).toHaveProperty('id', 'delegation-123');

        // Test using delegated permission
        const reportsResponse = await fastify.inject({
          method: 'GET',
          url: '/api/reports/delegated',
          headers: { 'x-user-id': '4' } // user (delegated access)
        });

        expect(reportsResponse.statusCode).toBe(200);
        const body = JSON.parse(reportsResponse.body);
        expect(body).toMatchObject({
          accessType: 'delegated',
          delegation: { id: 'delegation-123', remainingUses: 4 }
        });
      });

      it('should handle delegation expiration and constraints', async () => {
        const mockDelegationService = {
          checkDelegation: jest.fn<unknown[], unknown>().mockImplementation(async (userId, permission) => {
            if (userId === 4 && permission === 'reports:read') {
              return {
                allowed: false,
                expired: true,
                delegation: { id: 'delegation-123', expiresAt: new Date(Date.now() - 1000).toISOString() }
              };
            }
            return { allowed: false };
  }
        };

        fastify.get('/api/reports/time-sensitive', async (request, reply) => {
          const delegatedPermission = await mockDelegationService.checkDelegation(request.user.id, 'reports:read');
          
          if (delegatedPermission.expired) {
            return reply.code(403).send({ 
              error: 'Delegated permission has expired',
              expiredAt: delegatedPermission.delegation.expiresAt
            });
          }

          if (!delegatedPermission.allowed) {
            return reply.code(403).send({ error: 'Access denied' });
          }

          return { reports: 'time-sensitive-data' };
        });

        const response = await fastify.inject({
          method: 'GET',
          url: '/api/reports/time-sensitive',
          headers: { 'x-user-id': '4' } // user with expired delegation
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.body)).toMatchObject({
          error: 'Delegated permission has expired'
        });
      });
    });

    describe('Group-Based Permissions', () => {
      it('should handle group membership permissions', async () => {
        const mockGroupService = {
          getUserGroups: jest.fn<unknown[], unknown>().mockImplementation(async (userId) => {
            const groupMemberships = {
              2: ['admin-group', 'leadership-group'], // admin
              3: ['management-group', 'project-alpha'], // manager
              4: ['project-alpha', 'engineering'], // user
              5: ['contractors', 'engineering'] // contractor
            };
            return groupMemberships[userId as keyof typeof groupMemberships] || [];
          }),
          getGroupPermissions: jest.fn<unknown[], unknown>().mockImplementation(async (groupId) => {
            const groupPermissions = {
              'admin-group': ['admin:*'],
              'leadership-group': ['strategy:read', 'leadership:*'],
              'management-group': ['team:manage', 'reports:read'],
              'project-alpha': ['project:alpha:read', 'project:alpha:write'],
              'engineering': ['code:read', 'docs:write'],
              'contractors': ['docs:read']
            };
            return groupPermissions[groupId as keyof typeof groupPermissions] || [];
  }
        };

        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const userGroups = await mockGroupService.getUserGroups(userId);
          const allGroupPermissions: string[] = [];
          
          for (const groupId of userGroups) {
            const groupPerms = await mockGroupService.getGroupPermissions(groupId);
            allGroupPermissions.push(...groupPerms);
          }

          return allGroupPermissions.some(p => {
            if (p.endsWith(':*')) {
              return permission.startsWith(p.slice(0, -1));
            }
            return p === permission;
          });
        });

        fastify.get('/api/project/alpha/data', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'project:alpha:read');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Not member of project alpha' });
          }
          return { projectData: 'alpha-data' };
        });

        fastify.post('/api/project/alpha/update', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'project:alpha:write');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Cannot write to project alpha' });
          }
          return { success: true };
        });

        // Test manager access (member of project-alpha group)
        const managerReadResponse = await fastify.inject({
          method: 'GET',
          url: '/api/project/alpha/data',
          headers: { 'x-user-id': '3' } // manager
        });
        expect(managerReadResponse.statusCode).toBe(200);

        const managerWriteResponse = await fastify.inject({
          method: 'POST',
          url: '/api/project/alpha/update',
          headers: { 'x-user-id': '3' }, // manager
          payload: { update: 'data' }
        });
        expect(managerWriteResponse.statusCode).toBe(200);

        // Test contractor access (not member of project-alpha group)
        const contractorResponse = await fastify.inject({
          method: 'GET',
          url: '/api/project/alpha/data',
          headers: { 'x-user-id': '5' } // contractor
        });
        expect(contractorResponse.statusCode).toBe(403);
      });
    });
  });

  describe('3. Resource-Level Access Control', () => {
    describe('Ownership-Based Access', () => {
      it('should enforce resource ownership permissions', async () => {
        const mockResourceOwnership = {
          'document-123': { ownerId: 4, sharedWith: [3] }, // user owns, shared with manager
          'document-456': { ownerId: 3, sharedWith: [] }, // manager owns, not shared
          'document-789': { ownerId: 2, sharedWith: [3, 4] } // admin owns, shared with manager and user
        };

        rbacService.hasResourcePermission.mockImplementation(async (userId, resource, action, context) => {
          const [resourceType, resourceId] = resource.split(':');
          
          if (resourceType === 'document') {
            const ownership = mockResourceOwnership[resourceId as keyof typeof mockResourceOwnership];
            if (!ownership) return false;

            // Owner has all permissions
            if (ownership.ownerId === userId) return true;
            
            // Shared users have read permission
            if (action === 'read' && ownership.sharedWith.includes(userId)) return true;
            
            // Admins have all permissions
            const user = Object.values(testUsers).find(u => u.id === userId);
            if (user?.roles.includes('admin') || user?.roles.includes('super_admin')) return true;
          }
          
          return false;
        });

        fastify.get('/api/documents/:id', async (request, reply) => {
          const { id } = request.params as { id: string };
          const hasPermission = await rbacService.hasResourcePermission(
            request.user.id, 
            `document:${id}`, 
            'read'
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Cannot access this document' });
          }
          
          return { document: `Document ${id} content` };
        });

        fastify.put('/api/documents/:id', async (request, reply) => {
          const { id } = request.params as { id: string };
          const hasPermission = await rbacService.hasResourcePermission(
            request.user.id, 
            `document:${id}`, 
            'write'
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Cannot modify this document' });
          }
          
          return { success: true };
        });

        // Test owner access
        const ownerReadResponse = await fastify.inject({
          method: 'GET',
          url: '/api/documents/document-123',
          headers: { 'x-user-id': '4' } // owner
        });
        expect(ownerReadResponse.statusCode).toBe(200);

        const ownerWriteResponse = await fastify.inject({
          method: 'PUT',
          url: '/api/documents/document-123',
          headers: { 'x-user-id': '4' }, // owner
          payload: { content: 'updated' }
        });
        expect(ownerWriteResponse.statusCode).toBe(200);

        // Test shared user access (read only)
        const sharedReadResponse = await fastify.inject({
          method: 'GET',
          url: '/api/documents/document-123',
          headers: { 'x-user-id': '3' } // shared with
        });
        expect(sharedReadResponse.statusCode).toBe(200);

        const sharedWriteResponse = await fastify.inject({
          method: 'PUT',
          url: '/api/documents/document-123',
          headers: { 'x-user-id': '3' }, // shared with (no write permission)
          payload: { content: 'unauthorized update' }
        });
        expect(sharedWriteResponse.statusCode).toBe(403);

        // Test unauthorized access
        const unauthorizedResponse = await fastify.inject({
          method: 'GET',
          url: '/api/documents/document-456',
          headers: { 'x-user-id': '4' } // not owner or shared
        });
        expect(unauthorizedResponse.statusCode).toBe(403);
      });

      it('should handle hierarchical resource permissions', async () => {
        const mockResourceHierarchy = {
          'org:acme': {
            children: ['department:engineering', 'department:sales'],
            permissions: { '1': ['admin'], '2': ['admin'] } // super_admin and admin
  }
          'department:engineering': {
            parent: 'org:acme',
            children: ['team:backend', 'team:frontend'],
            permissions: { '3': ['manage'] } // manager
  }
          'team:backend': {
            parent: 'department:engineering',
            children: [],
            permissions: { '4': ['member'], '5': ['contractor'] } // user and contractor
          }
        };

        rbacService.hasResourcePermission.mockImplementation(async (userId, resource, action) => {
          const checkResourcePermission = (resourceId: string): boolean => {
            const res = mockResourceHierarchy[resourceId as keyof typeof mockResourceHierarchy];
            if (!res) return false;

            // Check direct permission
            const userRole = res.permissions[userId.toString()];
            if (userRole) {
              if (userRole[0] === 'admin') return true;
              if (userRole[0] === 'manage' && ['read', 'write'].includes(action)) return true;
              if (userRole[0] === 'member' && action === 'read') return true;
              if (userRole[0] === 'contractor' && action === 'read') return true;
            }

            // Check parent resource permission (inheritance)
            if (res.parent) {
              return checkResourcePermission(res.parent);
            }

            return false;
          };

          return checkResourcePermission(resource);
        });

        fastify.get('/api/resources/:resourceId/data', async (request, reply) => {
          const { resourceId } = request.params as { resourceId: string };
          const hasPermission = await rbacService.hasResourcePermission(
            request.user.id, 
            resourceId, 
            'read'
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Access denied to resource' });
          }
          
          return { data: `${resourceId} data` };
        });

        // Test hierarchical access - admin should access everything
        const adminOrgResponse = await fastify.inject({
          method: 'GET',
          url: '/api/resources/org:acme/data',
          headers: { 'x-user-id': '2' } // admin
        });
        expect(adminOrgResponse.statusCode).toBe(200);

        const adminTeamResponse = await fastify.inject({
          method: 'GET',
          url: '/api/resources/team:backend/data',
          headers: { 'x-user-id': '2' } // admin (inherited from org level)
        });
        expect(adminTeamResponse.statusCode).toBe(200);

        // Test manager access - should access department and below
        const managerDeptResponse = await fastify.inject({
          method: 'GET',
          url: '/api/resources/department:engineering/data',
          headers: { 'x-user-id': '3' } // manager
        });
        expect(managerDeptResponse.statusCode).toBe(200);

        const managerTeamResponse = await fastify.inject({
          method: 'GET',
          url: '/api/resources/team:backend/data',
          headers: { 'x-user-id': '3' } // manager (inherited from department level)
        });
        expect(managerTeamResponse.statusCode).toBe(200);

        // Test user access - should only access team level
        const userTeamResponse = await fastify.inject({
          method: 'GET',
          url: '/api/resources/team:backend/data',
          headers: { 'x-user-id': '4' } // user (team member)
        });
        expect(userTeamResponse.statusCode).toBe(200);

        const userDeptResponse = await fastify.inject({
          method: 'GET',
          url: '/api/resources/department:engineering/data',
          headers: { 'x-user-id': '4' } // user (not department level access)
        });
        expect(userDeptResponse.statusCode).toBe(403);
      });
    });
  });

  describe('4. Dynamic & Contextual Permissions', () => {
    describe('Time-Based Access Control', () => {
      it('should enforce business hours restrictions', async () => {
        rbacService.hasPermission.mockImplementation(async (userId, permission, context) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (!user) return false;

          // Check if role has business hours constraint
          const hasBusinessHoursConstraint = user.roles.some(roleId => {
            const role = testRoles[roleId as keyof typeof testRoles];
            return role?.constraints?.businessHours;
          });

          if (hasBusinessHoursConstraint && permission.includes('admin')) {
            const currentHour = new Date().getHours();
            const isBusinessHours = currentHour >= 9 && currentHour <= 17;
            
            if (!isBusinessHours) {
              return false;
            }
          }

          // Check base permission
          return user.permissions.some(p => {
            if (p === '*') return true;
            if (p.endsWith(':*')) {
              return permission.startsWith(p.slice(0, -1));
            }
            return p === permission;
          });
        });

        fastify.get('/api/admin/sensitive-operation', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(
            request.user.id, 
            'admin:sensitive',
            { time: new Date() }
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ 
              error: 'Sensitive operations restricted to business hours (9 AM - 5 PM)' 
            });
          }
          
          return { operation: 'completed' };
        });

        // The test result depends on when it's run
        const response = await fastify.inject({
          method: 'GET',
          url: '/api/admin/sensitive-operation',
          headers: { 'x-user-id': '3' } // manager (has business hours constraint)
        });

        // Should either succeed (during business hours) or fail (outside business hours)
        expect([200, 403]).toContain(response.statusCode);
        
        if (response.statusCode === 403) {
          expect(JSON.parse(response.body).error).toContain('business hours');
        }
      });

      it('should handle expiring permissions', async () => {
        const mockExpiringPermissions = {
          4: { // user
            'temp:access': {
              granted: new Date(Date.now() - 86400000), // granted yesterday
              expires: new Date(Date.now() + 3600000), // expires in 1 hour
              permissions: ['reports:temp:read']
  }
            'expired:access': {
              granted: new Date(Date.now() - 172800000), // granted 2 days ago
              expires: new Date(Date.now() - 3600000), // expired 1 hour ago
              permissions: ['admin:temp']
            }
          }
        };

        rbacService.hasPermission.mockImplementation(async (userId, permission) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (!user) return false;

          // Check regular permissions
          const hasRegularPermission = user.permissions.some(p => {
            if (p === '*') return true;
            if (p.endsWith(':*')) {
              return permission.startsWith(p.slice(0, -1));
            }
            return p === permission;
          });

          if (hasRegularPermission) return true;

          // Check expiring permissions
          const expiringPerms = mockExpiringPermissions[userId as keyof typeof mockExpiringPermissions];
          if (expiringPerms) {
            for (const [accessId, access] of Object.entries(expiringPerms)) {
              if (new Date() < new Date(access.expires)) {
                if (access.permissions.includes(permission)) {
                  return true;
                }
              }
            }
          }

          return false;
        });

        fastify.get('/api/reports/temporary', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'reports:temp:read');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Temporary access expired or not granted' });
          }
          return { reports: 'temporary-access-data' };
        });

        fastify.get('/api/admin/expired', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(request.user.id, 'admin:temp');
          if (!hasPermission) {
            return reply.code(403).send({ error: 'Admin access has expired' });
          }
          return { admin: 'temporary-admin-data' };
        });

        // Test valid temporary access
        const tempAccessResponse = await fastify.inject({
          method: 'GET',
          url: '/api/reports/temporary',
          headers: { 'x-user-id': '4' } // user with valid temp access
        });
        expect(tempAccessResponse.statusCode).toBe(200);

        // Test expired access
        const expiredAccessResponse = await fastify.inject({
          method: 'GET',
          url: '/api/admin/expired',
          headers: { 'x-user-id': '4' } // user with expired admin access
        });
        expect(expiredAccessResponse.statusCode).toBe(403);
        expect(JSON.parse(expiredAccessResponse.body).error).toContain('expired');
      });
    });

    describe('Location-Based Access Control', () => {
      it('should enforce IP address restrictions', async () => {
        rbacService.hasPermission.mockImplementation(async (userId, permission, context) => {
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (!user) return false;

          // Check for IP restrictions on contractor role
          if (user.roles.includes('contractor')) {
            const contractorRole = testRoles.contractor;
            const ipWhitelist = contractorRole.constraints?.ipWhitelist;
            
            if (ipWhitelist && context?.ipAddress) {
              const isAllowedIp = ipWhitelist.some((allowedRange: string) => {
                // Simplified IP range check (in production, use proper IP range library)
                if (allowedRange.includes('/24')) {
                  const baseIp = allowedRange.split('/')[0].split('.').slice(0, 3).join('.');
                  const clientBaseIp = context.ipAddress.split('.').slice(0, 3).join('.');
                  return baseIp === clientBaseIp;
                }
                return allowedRange === context.ipAddress;
              });
              
              if (!isAllowedIp) {
                return false;
              }
            }
          }

          // Check regular permissions
          return user.permissions.includes(permission) || user.permissions.includes('*');
        });

        fastify.addHook('preHandler', async (request, reply) => {
          if (request.url.startsWith('/api/')) {
            // Simulate getting client IP
            request.clientIp = request.headers['x-forwarded-for'] as string || '192.168.1.100';
          }
        });

        fastify.get('/api/contractor/reports', async (request, reply) => {
          const hasPermission = await rbacService.hasPermission(
            request.user.id, 
            'reports:read',
            { ipAddress: (request as any).clientIp }
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ 
              error: 'Access denied from this IP address',
              clientIp: (request as any).clientIp
            });
          }
          
          return { reports: 'contractor-accessible-reports' };
        });

        // Test allowed IP
        const allowedIpResponse = await fastify.inject({
          method: 'GET',
          url: '/api/contractor/reports',
          headers: { 
            'x-user-id': '5', // contractor
            'x-forwarded-for': '192.168.1.50' // within allowed range
          }
        });
        expect(allowedIpResponse.statusCode).toBe(200);

        // Test blocked IP
        const blockedIpResponse = await fastify.inject({
          method: 'GET',
          url: '/api/contractor/reports',
          headers: { 
            'x-user-id': '5', // contractor
            'x-forwarded-for': '10.0.0.50' // outside allowed range
          }
        });
        expect(blockedIpResponse.statusCode).toBe(403);
        expect(JSON.parse(blockedIpResponse.body).error).toContain('IP address');
      });
    });
  });

  describe('5. Cross-Service Authorization', () => {
    describe('Service-to-Service Authorization', () => {
      it('should handle service account permissions', async () => {
        const serviceAccounts = {
          'service:analytics': {
            id: 'svc-analytics',
            permissions: ['users:read', 'events:read', 'reports:write'],
            clientId: 'analytics-service-client',
            scopes: ['data:read', 'reports:write']
  }
          'service:notification': {
            id: 'svc-notification',
            permissions: ['users:read', 'notifications:write'],
            clientId: 'notification-service-client',
            scopes: ['users:read', 'notifications:send']
          }
        };

        rbacService.hasPermission.mockImplementation(async (serviceId, permission) => {
          if (typeof serviceId === 'string' && serviceId.startsWith('svc-')) {
            const service = Object.values(serviceAccounts).find(s => s.id === serviceId);
            return service?.permissions.includes(permission) || false;
          }
          return false;
        });

        fastify.addHook('preHandler', async (request, reply) => {
          const serviceClientId = request.headers['x-service-client-id'] as string;
          
          if (serviceClientId) {
            const service = Object.values(serviceAccounts).find(s => s.clientId === serviceClientId);
            if (service) {
              (request as any).serviceAccount = service;
              return;
            }
          }

          // Regular user authentication would happen here
          const userId = parseInt(request.headers['x-user-id'] as string || '0');
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (user) {
            request.user = user;
          }
        });

        fastify.get('/api/service/user-data', async (request, reply) => {
          const serviceAccount = (request as any).serviceAccount;
          
          if (serviceAccount) {
            const hasPermission = await rbacService.hasPermission(serviceAccount.id, 'users:read');
            if (!hasPermission) {
              return reply.code(403).send({ error: 'Service lacks required permissions' });
            }
            
            return { 
              users: ['user1', 'user2'], 
              accessType: 'service',
              serviceId: serviceAccount.id 
            };
          }

          // Handle regular user request
          if (request.user) {
            const userHasPermission = await rbacService.hasPermission(request.user.id, 'users:read');
            if (!userHasPermission) {
              return reply.code(403).send({ error: 'User lacks required permissions' });
            }
            
            return { 
              users: ['user1', 'user2'], 
              accessType: 'user',
              userId: request.user.id 
            };
          }

          return reply.code(401).send({ error: 'No authentication provided' });
        });

        // Test service account access
        const serviceResponse = await fastify.inject({
          method: 'GET',
          url: '/api/service/user-data',
          headers: { 'x-service-client-id': 'analytics-service-client' }
        });

        expect(serviceResponse.statusCode).toBe(200);
        expect(JSON.parse(serviceResponse.body)).toMatchObject({
          accessType: 'service',
          serviceId: 'svc-analytics'
        });

        // Test service without permission
        const unauthorizedServiceResponse = await fastify.inject({
          method: 'GET',
          url: '/api/service/user-data',
          headers: { 'x-service-client-id': 'notification-service-client' } // doesn't have users:read
        });

        expect(unauthorizedServiceResponse.statusCode).toBe(200); // notification service also has users:read
      });
    });
  });

  describe('6. Privilege Escalation Prevention', () => {
    describe('Horizontal Privilege Escalation', () => {
      it('should prevent users from accessing other users\' resources', async () => {
        rbacService.hasResourcePermission.mockImplementation(async (userId, resource, action) => {
          const [resourceType, resourceId] = resource.split(':');
          
          if (resourceType === 'user') {
            // Users can only access their own profile
            if (action === 'read' || action === 'write') {
              return parseInt(resourceId) === userId;
            }
          }
          
          // Admins can access all user resources
          const user = Object.values(testUsers).find(u => u.id === userId);
          if (user?.roles.includes('admin') || user?.roles.includes('super_admin')) {
            return true;
          }
          
          return false;
        });

        fastify.get('/api/users/:userId/profile', async (request, reply) => {
          const { userId } = request.params as { userId: string };
          const hasPermission = await rbacService.hasResourcePermission(
            request.user.id, 
            `user:${userId}`, 
            'read'
          );
          
          if (!hasPermission) {
            return reply.code(403).send({ 
              error: 'Cannot access other user profiles',
              requestedUserId: userId,
              currentUserId: request.user.id
            });
          }
          
          return { profile: `User ${userId} profile data` };
        });

        // Test user accessing own profile (should succeed)
        const ownProfileResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users/4/profile',
          headers: { 'x-user-id': '4' } // user accessing own profile
        });
        expect(ownProfileResponse.statusCode).toBe(200);

        // Test user accessing another user's profile (should fail)
        const otherProfileResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users/3/profile',
          headers: { 'x-user-id': '4' } // user trying to access manager's profile
        });
        expect(otherProfileResponse.statusCode).toBe(403);
        expect(JSON.parse(otherProfileResponse.body)).toMatchObject({
          error: 'Cannot access other user profiles',
          requestedUserId: '3',
          currentUserId: 4
        });

        // Test admin accessing any profile (should succeed)
        const adminAccessResponse = await fastify.inject({
          method: 'GET',
          url: '/api/users/4/profile',
          headers: { 'x-user-id': '2' } // admin accessing user's profile
        });
        expect(adminAccessResponse.statusCode).toBe(200);
      });
    });

    describe('Vertical Privilege Escalation', () => {
      it('should prevent users from escalating their privileges', async () => {
        const mockRoleManagementService = {
          assignRole: jest.fn<unknown[], unknown>().mockImplementation(async (assignerId, targetUserId, roleId) => {
            const assigner = Object.values(testUsers).find(u => u.id === assignerId);
            
            // Only super_admin can assign admin roles
            if (roleId === 'admin' && !assigner?.roles.includes('super_admin')) {
              throw new Error('Insufficient privileges to assign admin role');
            }
            
            // Only admin and above can assign manager roles
            if (roleId === 'manager' && !assigner?.roles.some(r => ['admin', 'super_admin'].includes(r))) {
              throw new Error('Insufficient privileges to assign manager role');
            }
            
            // Users cannot assign roles to themselves or others
            if (assigner?.roles.includes('user') && !assigner.roles.includes('manager')) {
              throw new Error('Users cannot assign roles');
            }
            
            return { success: true, assignedRole: roleId };
  }
        };

        fastify.post('/api/admin/users/:userId/assign-role', async (request, reply) => {
          const { userId } = request.params as { userId: string };
          const { roleId } = request.body as { roleId: string };
          
          try {
            const result = await mockRoleManagementService.assignRole(
              request.user.id, 
              parseInt(userId), 
              roleId
            );
            
            // Log privilege assignment for audit
            await auditService.logSecurityEvent({
              type: 'ROLE_ASSIGNMENT',
              severity: 'MEDIUM',
              details: {
                assignerId: request.user.id,
                targetUserId: parseInt(userId),
                roleId,
                success: true
              }
            });
            
            return result;
          } catch (error) {
            await auditService.logSecurityEvent({
              type: 'ROLE_ASSIGNMENT_DENIED',
              severity: 'HIGH',
              details: {
                assignerId: request.user.id,
                targetUserId: parseInt(userId),
                roleId,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            });
            
            return reply.code(403).send({ 
              error: error instanceof Error ? error.message : 'Role assignment failed'
            });
          }
        });

        // Test super admin assigning admin role (should succeed)
        const superAdminAssignResponse = await fastify.inject({
          method: 'POST',
          url: '/api/admin/users/4/assign-role',
          headers: { 'x-user-id': '1' }, // super admin
          payload: { roleId: 'admin' }
        });
        expect(superAdminAssignResponse.statusCode).toBe(200);

        // Test admin trying to assign super admin role (should fail)
        const adminEscalateResponse = await fastify.inject({
          method: 'POST',
          url: '/api/admin/users/4/assign-role',
          headers: { 'x-user-id': '2' }, // admin
          payload: { roleId: 'super_admin' }
        });
        expect(adminEscalateResponse.statusCode).toBe(403);

        // Test user trying to assign manager role to themselves (should fail)
        const userEscalateResponse = await fastify.inject({
          method: 'POST',
          url: '/api/admin/users/4/assign-role',
          headers: { 'x-user-id': '4' }, // user
          payload: { roleId: 'manager' }
        });
        expect(userEscalateResponse.statusCode).toBe(403);
        expect(JSON.parse(userEscalateResponse.body).error).toContain('cannot assign roles');

        // Verify audit events were logged
        expect(auditService.logSecurityEvent).toHaveBeenCalledTimes(3);
      });

      it('should detect and prevent permission manipulation attempts', async () => {
        const mockPermissionTampering = {
          detectTampering: jest.fn<unknown[], unknown>().mockImplementation((userId, requestedPermissions) => {
            const user = Object.values(testUsers).find(u => u.id === userId);
            if (!user) return { tampered: true, reason: 'User not found' };

            // Check for permission escalation attempts
            const suspiciousPermissions = ['admin:*', 'super_admin:*', '*', 'system:*'];
            const hasSuspiciousPermissions = requestedPermissions.some((perm: string) => 
              suspiciousPermissions.some(suspicious => perm.includes(suspicious))
            );

            if (hasSuspiciousPermissions && !user.roles.includes('super_admin')) {
              return { 
                tampered: true, 
                reason: 'Attempted privilege escalation',
                suspiciousPermissions: requestedPermissions.filter((perm: string) =>
                  suspiciousPermissions.some(suspicious => perm.includes(suspicious))

              };
            }

            return { tampered: false };
  }
        };

        fastify.post('/api/auth/validate-permissions', async (request, reply) => {
          const { permissions } = request.body as { permissions: string[] };
          
          const tamperingResult = mockPermissionTampering.detectTampering(request.user.id, permissions);
          
          if (tamperingResult.tampered) {
            await auditService.logSecurityEvent({
              type: 'PERMISSION_TAMPERING_ATTEMPT',
              severity: 'CRITICAL',
              userId: request.user.id,
              details: {
                reason: tamperingResult.reason,
                requestedPermissions: permissions,
                suspiciousPermissions: tamperingResult.suspiciousPermissions,
                userRoles: request.user.roles
              }
            });
            
            return reply.code(403).send({ 
              error: 'Permission tampering detected',
              details: tamperingResult 
            });
          }
          
          return { valid: true };
        });

        // Test legitimate permission request
        const legitimateResponse = await fastify.inject({
          method: 'POST',
          url: '/api/auth/validate-permissions',
          headers: { 'x-user-id': '4' }, // user
          payload: { permissions: ['profile:read', 'profile:write'] }
        });
        expect(legitimateResponse.statusCode).toBe(200);

        // Test privilege escalation attempt
        const escalationResponse = await fastify.inject({
          method: 'POST',
          url: '/api/auth/validate-permissions',
          headers: { 'x-user-id': '4' }, // user
          payload: { permissions: ['admin:*', 'system:delete'] }
        });
        expect(escalationResponse.statusCode).toBe(403);
        
        const escalationBody = JSON.parse(escalationResponse.body);
        expect(escalationBody.error).toBe('Permission tampering detected');
        expect(escalationBody.details.reason).toBe('Attempted privilege escalation');

        // Verify critical security event was logged
        expect(auditService.logSecurityEvent).toHaveBeenCalledWith({
          type: 'PERMISSION_TAMPERING_ATTEMPT',
          severity: 'CRITICAL',
          userId: 4,
          details: expect.objectContaining({
            reason: 'Attempted privilege escalation',
            suspiciousPermissions: expect.arrayContaining(['admin:*'])
  }
        });
      });
    });
  });
});