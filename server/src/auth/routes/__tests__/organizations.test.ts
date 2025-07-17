// Epic 11.4 Organization Routes Tests
// Comprehensive test suite for organization and team management API endpoints

import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import { organizationRoutes, OrganizationRequest } from '../organizations';
import { OrganizationService } from '../../services/OrganizationService';
import { RBACService } from '../../services/RBACService';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing-very-long-and-secure';

describe('Organization Routes', () => {
  let app: FastifyInstance;
  let mockOrgService: jest.Mocked<OrganizationService>;
  let mockRbacService: jest.Mocked<RBACService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    roles: ['user'],
  };

  const mockOrganization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-org',
    description: 'Test description',
    website: 'https://test.com',
    logoUrl: null,
    branding: {},
    settings: {},
    plan: 'free' as const,
    maxUsers: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTeam = {
    id: 'team-123',
    organizationId: 'org-123',
    parentTeamId: null,
    name: 'Development Team',
    description: 'Main development team',
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    app = fastify();

    // Mock organization service
    mockOrgService = {
      createOrganization: jest.fn(),
      updateOrganization: jest.fn(),
      deleteOrganization: jest.fn(),
      getOrganizationById: jest.fn(),
      getOrganizationBySlug: jest.fn(),
      getUserOrganizations: jest.fn(),
      getOrganizationStats: jest.fn(),
      createTeam: jest.fn(),
      updateTeam: jest.fn(),
      deleteTeam: jest.fn(),
      getTeamById: jest.fn(),
      getOrganizationTeams: jest.fn(),
      getTeamHierarchy: jest.fn(),
      addTeamMember: jest.fn(),
      removeTeamMember: jest.fn(),
      updateTeamMemberRole: jest.fn(),
      getTeamMembers: jest.fn(),
      getUserTeams: jest.fn(),
    } as any;

    // Mock RBAC service
    mockRbacService = {
      checkPermission: jest.fn(),
    } as any;

    // Add services to fastify instance
    app.decorate('organizationService', mockOrgService);
    app.decorate('rbacService', mockRbacService);

    // Mock authentication middleware
    app.addHook('preHandler', async (request: OrganizationRequest) => {
      if (request.url.includes('/organizations') || request.url.includes('/teams') || request.url.includes('/users')) {
        request.user = mockUser;
      }
    });

    // Register routes
    await app.register(organizationRoutes);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('Organization Management', () => {
    describe('POST /organizations', () => {
      it('should create organization successfully', async () => {
        mockOrgService.createOrganization.mockResolvedValue(mockOrganization);

        const response = await app.inject({
          method: 'POST',
          url: '/organizations',
          payload: {
            name: 'Test Organization',
            description: 'Test description',
            plan: 'free',
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockOrganization);
        expect(mockOrgService.createOrganization).toHaveBeenCalledWith(
          {
            name: 'Test Organization',
            description: 'Test description',
            plan: 'free',
          },
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });

      it('should handle organization creation failure', async () => {
        mockOrgService.createOrganization.mockRejectedValue(new Error('Organization slug already exists'));

        const response = await app.inject({
          method: 'POST',
          url: '/organizations',
          payload: {
            name: 'Test Organization',
          },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Organization slug already exists');
      });

      it('should validate required fields', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/organizations',
          payload: {
            description: 'Missing name',
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('GET /organizations/my', () => {
      it('should return user organizations', async () => {
        const organizations = [mockOrganization];
        mockOrgService.getUserOrganizations.mockResolvedValue(organizations);

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/my',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(organizations);
        expect(mockOrgService.getUserOrganizations).toHaveBeenCalledWith('user-123');
      });

      it('should handle service errors', async () => {
        mockOrgService.getUserOrganizations.mockRejectedValue(new Error('Database error'));

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/my',
        });

        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Failed to fetch organizations');
      });
    });

    describe('GET /organizations/:organizationId', () => {
      it('should return organization when user has permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has read permission',
        });
        mockOrgService.getOrganizationById.mockResolvedValue(mockOrganization);

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/org-123',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockOrganization);
        expect(mockRbacService.checkPermission).toHaveBeenCalledWith(
          'user-123',
          { resource: 'organizations', action: 'read' },
          { organizationId: 'org-123' }
        );
      });

      it('should return 403 when user lacks permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: false,
          reason: 'Insufficient permissions',
        });

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/org-123',
        });

        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Insufficient permissions to view organization');
      });

      it('should return 404 when organization not found', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has read permission',
        });
        mockOrgService.getOrganizationById.mockResolvedValue(null);

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/nonexistent',
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Organization not found');
      });
    });

    describe('PUT /organizations/:organizationId', () => {
      it('should update organization when user has permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has write permission',
        });
        const updatedOrg = { ...mockOrganization, name: 'Updated Organization' };
        mockOrgService.updateOrganization.mockResolvedValue(updatedOrg);

        const response = await app.inject({
          method: 'PUT',
          url: '/organizations/org-123',
          payload: {
            name: 'Updated Organization',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(updatedOrg);
        expect(mockOrgService.updateOrganization).toHaveBeenCalledWith(
          'org-123',
          { name: 'Updated Organization' },
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });

      it('should return 403 when user lacks permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: false,
          reason: 'Insufficient permissions',
        });

        const response = await app.inject({
          method: 'PUT',
          url: '/organizations/org-123',
          payload: {
            name: 'Updated Organization',
          },
        });

        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Insufficient permissions to update organization');
      });
    });

    describe('DELETE /organizations/:organizationId', () => {
      it('should delete organization when user has permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has delete permission',
        });
        mockOrgService.deleteOrganization.mockResolvedValue();

        const response = await app.inject({
          method: 'DELETE',
          url: '/organizations/org-123',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Organization deleted successfully');
        expect(mockOrgService.deleteOrganization).toHaveBeenCalledWith(
          'org-123',
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });

      it('should return 403 when user lacks permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: false,
          reason: 'Insufficient permissions',
        });

        const response = await app.inject({
          method: 'DELETE',
          url: '/organizations/org-123',
        });

        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Insufficient permissions to delete organization');
      });
    });

    describe('GET /organizations/:organizationId/stats', () => {
      it('should return organization statistics when user has permission', async () => {
        const mockStats = {
          totalMembers: 15,
          totalTeams: 8,
          activeTeams: 8,
          recentActivity: 3,
          planLimits: { maxUsers: 10, maxTeams: 5, maxStorage: 1024 },
          usage: { users: 15, teams: 8, storage: 0 },
        };

        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has read permission',
        });
        mockOrgService.getOrganizationStats.mockResolvedValue(mockStats);

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/org-123/stats',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockStats);
        expect(mockOrgService.getOrganizationStats).toHaveBeenCalledWith('org-123');
      });
    });
  });

  describe('Team Management', () => {
    describe('POST /organizations/:organizationId/teams', () => {
      it('should create team when user has permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has write permission',
        });
        mockOrgService.createTeam.mockResolvedValue(mockTeam);

        const response = await app.inject({
          method: 'POST',
          url: '/organizations/org-123/teams',
          payload: {
            name: 'Development Team',
            description: 'Main development team',
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockTeam);
        expect(mockOrgService.createTeam).toHaveBeenCalledWith(
          {
            organizationId: 'org-123',
            name: 'Development Team',
            description: 'Main development team',
          },
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });

      it('should return 403 when user lacks permission', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: false,
          reason: 'Insufficient permissions',
        });

        const response = await app.inject({
          method: 'POST',
          url: '/organizations/org-123/teams',
          payload: {
            name: 'Development Team',
          },
        });

        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Insufficient permissions to create teams');
      });
    });

    describe('GET /organizations/:organizationId/teams', () => {
      it('should return organization teams when user has permission', async () => {
        const teams = [mockTeam];
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has read permission',
        });
        mockOrgService.getOrganizationTeams.mockResolvedValue(teams);

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/org-123/teams',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(teams);
        expect(mockOrgService.getOrganizationTeams).toHaveBeenCalledWith('org-123');
      });
    });

    describe('GET /organizations/:organizationId/teams/hierarchy', () => {
      it('should return team hierarchy when user has permission', async () => {
        const hierarchy = [{ ...mockTeam, level: 0, path: ['Development Team'] }];
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has read permission',
        });
        mockOrgService.getTeamHierarchy.mockResolvedValue(hierarchy);

        const response = await app.inject({
          method: 'GET',
          url: '/organizations/org-123/teams/hierarchy',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(hierarchy);
        expect(mockOrgService.getTeamHierarchy).toHaveBeenCalledWith('org-123');
      });
    });

    describe('GET /teams/:teamId', () => {
      it('should return team when user has permission', async () => {
        mockOrgService.getTeamById.mockResolvedValue(mockTeam);
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has read permission',
        });

        const response = await app.inject({
          method: 'GET',
          url: '/teams/team-123',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockTeam);
        expect(mockRbacService.checkPermission).toHaveBeenCalledWith(
          'user-123',
          { resource: 'teams', action: 'read' },
          { organizationId: 'org-123', teamId: 'team-123' }
        );
      });

      it('should return 404 when team not found', async () => {
        mockOrgService.getTeamById.mockResolvedValue(null);

        const response = await app.inject({
          method: 'GET',
          url: '/teams/nonexistent',
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Team not found');
      });
    });

    describe('PUT /teams/:teamId', () => {
      it('should update team when user has permission', async () => {
        mockOrgService.getTeamById.mockResolvedValue(mockTeam);
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has write permission',
        });
        const updatedTeam = { ...mockTeam, name: 'Updated Team' };
        mockOrgService.updateTeam.mockResolvedValue(updatedTeam);

        const response = await app.inject({
          method: 'PUT',
          url: '/teams/team-123',
          payload: {
            name: 'Updated Team',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(updatedTeam);
        expect(mockOrgService.updateTeam).toHaveBeenCalledWith(
          'team-123',
          { name: 'Updated Team' },
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });
    });

    describe('DELETE /teams/:teamId', () => {
      it('should delete team when user has permission', async () => {
        mockOrgService.getTeamById.mockResolvedValue(mockTeam);
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has delete permission',
        });
        mockOrgService.deleteTeam.mockResolvedValue();

        const response = await app.inject({
          method: 'DELETE',
          url: '/teams/team-123',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Team deleted successfully');
        expect(mockOrgService.deleteTeam).toHaveBeenCalledWith(
          'team-123',
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });
    });
  });

  describe('Team Membership Management', () => {
    describe('POST /teams/:teamId/members', () => {
      it('should add team member when user has permission', async () => {
        const mockMember = {
          id: 'member-123',
          teamId: 'team-123',
          userId: 'user-456',
          role: 'member' as const,
          joinedAt: new Date(),
          invitedBy: 'user-123',
        };

        mockOrgService.getTeamById.mockResolvedValue(mockTeam);
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has write permission',
        });
        mockOrgService.addTeamMember.mockResolvedValue(mockMember);

        const response = await app.inject({
          method: 'POST',
          url: '/teams/team-123/members',
          payload: {
            userId: 'user-456',
            role: 'member',
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockMember);
        expect(mockOrgService.addTeamMember).toHaveBeenCalledWith(
          {
            teamId: 'team-123',
            userId: 'user-456',
            role: 'member',
            invitedBy: 'user-123',
          },
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });
    });

    describe('GET /teams/:teamId/members', () => {
      it('should return team members when user has permission', async () => {
        const mockMembers = [
          {
            id: 'member-123',
            userId: 'user-456',
            role: 'member',
            joinedAt: new Date(),
            invitedBy: 'user-123',
            user: {
              id: 'user-456',
              email: 'member@example.com',
              displayName: 'Member User',
              firstName: 'Member',
              lastName: 'User',
              avatarUrl: null,
            },
          },
        ];

        mockOrgService.getTeamById.mockResolvedValue(mockTeam);
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has read permission',
        });
        mockOrgService.getTeamMembers.mockResolvedValue(mockMembers);

        const response = await app.inject({
          method: 'GET',
          url: '/teams/team-123/members',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(mockMembers);
        expect(mockOrgService.getTeamMembers).toHaveBeenCalledWith('team-123');
      });
    });

    describe('PUT /teams/:teamId/members/:userId', () => {
      it('should update team member role when user has permission', async () => {
        mockOrgService.getTeamById.mockResolvedValue(mockTeam);
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has write permission',
        });
        mockOrgService.updateTeamMemberRole.mockResolvedValue();

        const response = await app.inject({
          method: 'PUT',
          url: '/teams/team-123/members/user-456',
          payload: {
            role: 'admin',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Team member role updated successfully');
        expect(mockOrgService.updateTeamMemberRole).toHaveBeenCalledWith(
          'team-123',
          'user-456',
          'admin',
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });
    });

    describe('DELETE /teams/:teamId/members/:userId', () => {
      it('should remove team member when user has permission', async () => {
        mockOrgService.getTeamById.mockResolvedValue(mockTeam);
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has write permission',
        });
        mockOrgService.removeTeamMember.mockResolvedValue();

        const response = await app.inject({
          method: 'DELETE',
          url: '/teams/team-123/members/user-456',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Team member removed successfully');
        expect(mockOrgService.removeTeamMember).toHaveBeenCalledWith(
          'team-123',
          'user-456',
          'user-123',
          {
            ipAddress: '127.0.0.1',
            userAgent: undefined,
          }
        );
      });
    });

    describe('GET /users/:userId/teams', () => {
      it('should allow users to view their own teams', async () => {
        const userTeams = [mockTeam];
        mockOrgService.getUserTeams.mockResolvedValue(userTeams);

        const response = await app.inject({
          method: 'GET',
          url: '/users/user-123/teams',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(userTeams);
        expect(mockOrgService.getUserTeams).toHaveBeenCalledWith('user-123', undefined);
      });

      it('should check permissions when viewing other users teams', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: true,
          reason: 'User has admin permission',
        });
        const userTeams = [mockTeam];
        mockOrgService.getUserTeams.mockResolvedValue(userTeams);

        const response = await app.inject({
          method: 'GET',
          url: '/users/other-user/teams?organizationId=org-123',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toEqual(userTeams);
        expect(mockRbacService.checkPermission).toHaveBeenCalledWith(
          'user-123',
          { resource: 'users', action: 'read' },
          { organizationId: 'org-123' }
        );
      });

      it('should return 403 when user lacks permission to view other users teams', async () => {
        mockRbacService.checkPermission.mockResolvedValue({
          allowed: false,
          reason: 'Insufficient permissions',
        });

        const response = await app.inject({
          method: 'GET',
          url: '/users/other-user/teams',
        });

        expect(response.statusCode).toBe(403);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(false);
        expect(body.error).toBe('Insufficient permissions to view user teams');
      });
    });
  });
});