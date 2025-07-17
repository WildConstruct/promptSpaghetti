// Epic 11.4 Organization Service Tests
// Comprehensive test suite for organization and team management functionality

import { OrganizationService, CreateOrganizationData, UpdateOrganizationData, CreateTeamData, UpdateTeamData, TeamMemberData } from '../OrganizationService';
import { DatabaseService } from '../../database/DatabaseService';
import { AuditService } from '../AuditService';
import { RBACService } from '../RBACService';
import { AuthConfig } from '../../types';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing-very-long-and-secure';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test_promptscape';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';

describe('OrganizationService', () => {
  let organizationService: OrganizationService;
  let mockDbService: jest.Mocked<DatabaseService>;
  let mockAuditService: jest.Mocked<AuditService>;
  let mockRbacService: jest.Mocked<RBACService>;
  let mockConfig: AuthConfig;

  beforeEach(() => {
    // Mock database service
    mockDbService = {
      query: jest.fn(),
      transaction: jest.fn(),
      healthCheck: jest.fn(),
    } as any;

    // Mock audit service
    mockAuditService = {
      logEvent: jest.fn(),
    } as any;

    // Mock RBAC service
    mockRbacService = {
      createRole: jest.fn(),
      assignRole: jest.fn(),
    } as any;

    // Mock config
    mockConfig = {
      jwt: {
        secret: 'test-secret',
        issuer: 'test-issuer',
        audience: 'test-audience',
        accessTokenExpiry: '15m',
        refreshTokenExpiry: '7d',
      },
      database: {
        host: 'localhost',
        port: 5432,
        name: 'test_db',
        user: 'test_user',
        password: 'test_password',
      },
      redis: {
        host: 'localhost',
        port: 6379,
      },
    } as any;

    organizationService = new OrganizationService(
      mockConfig,
      mockDbService,
      mockAuditService,
      mockRbacService
    );

    // Mock crypto.randomUUID
    jest.spyOn(require('crypto'), 'randomUUID').mockReturnValue('test-uuid-123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Organization Management', () => {
    describe('createOrganization', () => {
      it('should create a new organization successfully', async () => {
        const mockTransaction = {
          query: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        mockDbService.transaction.mockImplementation((callback) => 
          callback(mockTransaction as any)
        );

        // Mock slug availability check (no existing org)
        mockTransaction.query
          .mockResolvedValueOnce({ rows: [] }) // Check slug availability
          .mockResolvedValueOnce({ rows: [] }); // Insert organization

        // Mock role creation
        mockRbacService.createRole.mockResolvedValueOnce({
          id: 'owner-role-123',
          name: 'test-org_owner',
          description: 'Owner role for Test Organization',
          scope: 'organization',
          organizationId: 'test-uuid-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockRbacService.createRole.mockResolvedValueOnce({
          id: 'admin-role-123',
          name: 'test-org_admin',
          description: 'Admin role for Test Organization',
          scope: 'organization',
          organizationId: 'test-uuid-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockRbacService.createRole.mockResolvedValueOnce({
          id: 'member-role-123',
          name: 'test-org_member',
          description: 'Member role for Test Organization',
          scope: 'organization',
          organizationId: 'test-uuid-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockRbacService.assignRole.mockResolvedValue({} as any);
        mockAuditService.logEvent.mockResolvedValue();

        const data: CreateOrganizationData = {
          name: 'Test Organization',
          description: 'A test organization',
          plan: 'pro',
          maxUsers: 50,
        };

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        const result = await organizationService.createOrganization(data, 'user-123', context);

        expect(result).toMatchObject({
          id: 'test-uuid-123',
          name: 'Test Organization',
          slug: 'test-organization',
          description: 'A test organization',
          plan: 'pro',
          maxUsers: 50,
        });

        expect(mockTransaction.query).toHaveBeenCalledTimes(2);
        expect(mockRbacService.createRole).toHaveBeenCalledTimes(3);
        expect(mockRbacService.assignRole).toHaveBeenCalledTimes(1);
        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'organization_created',
          resourceType: 'organization',
          resourceId: 'test-uuid-123',
          details: {
            organizationName: 'Test Organization',
            slug: 'test-organization',
            plan: 'pro',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          severity: 'info',
        });
        expect(mockTransaction.commit).toHaveBeenCalled();
      });

      it('should throw error if organization slug already exists', async () => {
        const mockTransaction = {
          query: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        mockDbService.transaction.mockImplementation((callback) => 
          callback(mockTransaction as any)
        );

        // Mock existing organization with same slug
        mockTransaction.query.mockResolvedValueOnce({
          rows: [{ id: 'existing-org-123' }],
        });

        const data: CreateOrganizationData = {
          name: 'Test Organization',
          slug: 'existing-slug',
        };

        await expect(
          organizationService.createOrganization(data, 'user-123')
        ).rejects.toThrow('Organization slug already exists');

        expect(mockTransaction.rollback).toHaveBeenCalled();
      });

      it('should generate slug from name if not provided', async () => {
        const mockTransaction = {
          query: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        mockDbService.transaction.mockImplementation((callback) => 
          callback(mockTransaction as any)
        );
        mockTransaction.query
          .mockResolvedValueOnce({ rows: [] }) // Check slug availability
          .mockResolvedValueOnce({ rows: [] }); // Insert organization

        mockRbacService.createRole.mockResolvedValue({
          id: 'role-123',
          name: 'test-role',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        mockRbacService.assignRole.mockResolvedValue({} as any);
        mockAuditService.logEvent.mockResolvedValue();

        const data: CreateOrganizationData = {
          name: 'Test Organization 123!',
        };

        const result = await organizationService.createOrganization(data, 'user-123');

        expect(result.slug).toBe('test-organization-123');
      });
    });

    describe('updateOrganization', () => {
      it('should update organization successfully', async () => {
        const mockOrganization = {
          id: 'org-123',
          name: 'Original Name',
          slug: 'original-name',
          description: 'Original description',
          plan: 'free',
          maxUsers: 10,
          settings: {},
          branding: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Mock getOrganizationById
        jest.spyOn(organizationService, 'getOrganizationById').mockResolvedValue(mockOrganization as any);

        mockDbService.query.mockResolvedValue({ rows: [] } as any);
        mockAuditService.logEvent.mockResolvedValue();

        const updates: UpdateOrganizationData = {
          name: 'Updated Name',
          description: 'Updated description',
          plan: 'pro',
        };

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        const result = await organizationService.updateOrganization('org-123', updates, 'user-123', context);

        expect(result).toMatchObject({
          id: 'org-123',
          name: 'Updated Name',
          description: 'Updated description',
          plan: 'pro',
        });

        expect(mockDbService.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE organizations'),
          expect.arrayContaining(['Updated Name', 'Updated description'])
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'organization_updated',
          resourceType: 'organization',
          resourceId: 'org-123',
          details: {
            changes: updates,
            previousValues: {
              name: 'Original Name',
              description: 'Original description',
              plan: 'free',
            },
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          severity: 'info',
        });
      });

      it('should throw error if organization not found', async () => {
        jest.spyOn(organizationService, 'getOrganizationById').mockResolvedValue(null);

        const updates: UpdateOrganizationData = {
          name: 'Updated Name',
        };

        await expect(
          organizationService.updateOrganization('nonexistent-org', updates, 'user-123')
        ).rejects.toThrow('Organization not found');
      });
    });

    describe('deleteOrganization', () => {
      it('should delete organization and cleanup related data', async () => {
        const mockTransaction = {
          query: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        const mockOrganization = {
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-org',
        };

        mockDbService.transaction.mockResolvedValue(mockTransaction as any);
        jest.spyOn(organizationService, 'getOrganizationById').mockResolvedValue(mockOrganization as any);

        mockTransaction.query.mockResolvedValue({ rows: [] });
        mockAuditService.logEvent.mockResolvedValue();

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        await organizationService.deleteOrganization('org-123', 'user-123', context);

        expect(mockTransaction.query).toHaveBeenCalledTimes(6); // Soft delete org, teams, members, roles, permissions, roles
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'organization_deleted',
          resourceType: 'organization',
          resourceId: 'org-123',
          details: {
            organizationName: 'Test Organization',
            slug: 'test-org',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          severity: 'warning',
        });
      });

      it('should throw error if organization not found', async () => {
        const mockTransaction = {
          query: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        mockDbService.transaction.mockImplementation((callback) => 
          callback(mockTransaction as any)
        );
        jest.spyOn(organizationService, 'getOrganizationById').mockResolvedValue(null);

        await expect(
          organizationService.deleteOrganization('nonexistent-org', 'user-123')
        ).rejects.toThrow('Organization not found');

        expect(mockTransaction.rollback).toHaveBeenCalled();
      });
    });

    describe('getOrganizationById', () => {
      it('should return organization if found', async () => {
        const mockRow = {
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-org',
          description: 'Test description',
          website: 'https://test.com',
          logo_url: null,
          branding: {},
          settings: {},
          plan: 'free',
          max_users: 10,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        };

        mockDbService.query.mockResolvedValue({ rows: [mockRow] } as any);

        const result = await organizationService.getOrganizationById('org-123');

        expect(result).toMatchObject({
          id: 'org-123',
          name: 'Test Organization',
          slug: 'test-org',
          plan: 'free',
          maxUsers: 10,
        });

        expect(mockDbService.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM organizations'),
          ['org-123']
        );
      });

      it('should return null if organization not found', async () => {
        mockDbService.query.mockResolvedValue({ rows: [] } as any);

        const result = await organizationService.getOrganizationById('nonexistent-org');

        expect(result).toBeNull();
      });
    });
  });

  describe('Team Management', () => {
    describe('createTeam', () => {
      it('should create a new team successfully', async () => {
        mockDbService.query.mockResolvedValue({ rows: [] } as any);
        
        // Mock addTeamMember
        jest.spyOn(organizationService, 'addTeamMember').mockResolvedValue({
          id: 'member-123',
          teamId: 'test-uuid-123',
          userId: 'user-123',
          role: 'owner',
          joinedAt: new Date(),
          invitedBy: 'user-123',
        });

        mockAuditService.logEvent.mockResolvedValue();

        const data: CreateTeamData = {
          organizationId: 'org-123',
          name: 'Development Team',
          description: 'Main development team',
          parentTeamId: 'parent-team-123',
        };

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        const result = await organizationService.createTeam(data, 'user-123', context);

        expect(result).toMatchObject({
          id: 'test-uuid-123',
          organizationId: 'org-123',
          name: 'Development Team',
          description: 'Main development team',
          parentTeamId: 'parent-team-123',
        });

        expect(mockDbService.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO teams'),
          expect.arrayContaining(['test-uuid-123', 'org-123', 'parent-team-123', 'Development Team'])
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'team_created',
          resourceType: 'team',
          resourceId: 'test-uuid-123',
          details: {
            teamName: 'Development Team',
            organizationId: 'org-123',
            parentTeamId: 'parent-team-123',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          severity: 'info',
        });
      });
    });

    describe('updateTeam', () => {
      it('should update team successfully', async () => {
        const mockTeam = {
          id: 'team-123',
          organizationId: 'org-123',
          name: 'Original Team',
          description: 'Original description',
          parentTeamId: null,
          settings: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        jest.spyOn(organizationService, 'getTeamById').mockResolvedValue(mockTeam as any);
        mockDbService.query.mockResolvedValue({ rows: [] } as any);
        mockAuditService.logEvent.mockResolvedValue();

        const updates: UpdateTeamData = {
          name: 'Updated Team',
          description: 'Updated description',
        };

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        const result = await organizationService.updateTeam('team-123', updates, 'user-123', context);

        expect(result).toMatchObject({
          id: 'team-123',
          name: 'Updated Team',
          description: 'Updated description',
        });

        expect(mockDbService.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE teams'),
          expect.arrayContaining(['Updated Team', 'Updated description'])
        );
      });

      it('should throw error if team not found', async () => {
        jest.spyOn(organizationService, 'getTeamById').mockResolvedValue(null);

        const updates: UpdateTeamData = {
          name: 'Updated Team',
        };

        await expect(
          organizationService.updateTeam('nonexistent-team', updates, 'user-123')
        ).rejects.toThrow('Team not found');
      });
    });

    describe('deleteTeam', () => {
      it('should delete team successfully when no child teams exist', async () => {
        const mockTransaction = {
          query: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        const mockTeam = {
          id: 'team-123',
          organizationId: 'org-123',
          name: 'Test Team',
        };

        mockDbService.transaction.mockResolvedValue(mockTransaction as any);
        jest.spyOn(organizationService, 'getTeamById').mockResolvedValue(mockTeam as any);

        // Mock no child teams
        mockTransaction.query
          .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // Child teams check
          .mockResolvedValueOnce({ rows: [] }) // Soft delete team
          .mockResolvedValueOnce({ rows: [] }); // Remove team members

        mockAuditService.logEvent.mockResolvedValue();

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        await organizationService.deleteTeam('team-123', 'user-123', context);

        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'team_deleted',
          resourceType: 'team',
          resourceId: 'team-123',
          details: {
            teamName: 'Test Team',
            organizationId: 'org-123',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          severity: 'warning',
        });
      });

      it('should throw error when team has child teams', async () => {
        const mockTransaction = {
          query: jest.fn(),
          commit: jest.fn(),
          rollback: jest.fn(),
        };

        const mockTeam = {
          id: 'team-123',
          name: 'Test Team',
        };

        mockDbService.transaction.mockResolvedValue(mockTransaction as any);
        jest.spyOn(organizationService, 'getTeamById').mockResolvedValue(mockTeam as any);

        // Mock existing child teams
        mockTransaction.query.mockResolvedValueOnce({ rows: [{ count: '2' }] });

        await expect(
          organizationService.deleteTeam('team-123', 'user-123')
        ).rejects.toThrow('Cannot delete team with child teams. Please delete or move child teams first.');

        expect(mockTransaction.rollback).toHaveBeenCalled();
      });
    });
  });

  describe('Team Membership Management', () => {
    describe('addTeamMember', () => {
      it('should add team member successfully', async () => {
        // Mock no existing membership
        mockDbService.query
          .mockResolvedValueOnce({ rows: [] } as any) // Check existing membership
          .mockResolvedValueOnce({ rows: [] } as any); // Insert new member

        mockAuditService.logEvent.mockResolvedValue();

        const data: TeamMemberData = {
          teamId: 'team-123',
          userId: 'user-456',
          role: 'member',
          invitedBy: 'user-123',
        };

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        const result = await organizationService.addTeamMember(data, context);

        expect(result).toMatchObject({
          id: 'test-uuid-123',
          teamId: 'team-123',
          userId: 'user-456',
          role: 'member',
          invitedBy: 'user-123',
        });

        expect(mockDbService.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO team_members'),
          expect.arrayContaining(['test-uuid-123', 'team-123', 'user-456', 'member'])
        );
      });

      it('should throw error if user is already a team member', async () => {
        // Mock existing membership
        mockDbService.query.mockResolvedValueOnce({ rows: [{ id: 'existing-member' }] } as any);

        const data: TeamMemberData = {
          teamId: 'team-123',
          userId: 'user-456',
          role: 'member',
          invitedBy: 'user-123',
        };

        await expect(organizationService.addTeamMember(data)).rejects.toThrow(
          'User is already a member of this team'
        );
      });
    });

    describe('removeTeamMember', () => {
      it('should remove team member successfully', async () => {
        mockDbService.query.mockResolvedValue({
          rows: [{ id: 'member-123', role: 'member' }],
        } as any);
        mockAuditService.logEvent.mockResolvedValue();

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        await organizationService.removeTeamMember('team-123', 'user-456', 'user-123', context);

        expect(mockDbService.query).toHaveBeenCalledWith(
          expect.stringContaining('DELETE FROM team_members'),
          ['team-123', 'user-456']
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'team_member_removed',
          resourceType: 'team_member',
          resourceId: 'member-123',
          details: {
            teamId: 'team-123',
            removedUserId: 'user-456',
            previousRole: 'member',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          severity: 'info',
        });
      });

      it('should throw error if team member not found', async () => {
        mockDbService.query.mockResolvedValue({ rows: [] } as any);

        await expect(
          organizationService.removeTeamMember('team-123', 'nonexistent-user', 'user-123')
        ).rejects.toThrow('Team member not found');
      });
    });

    describe('updateTeamMemberRole', () => {
      it('should update team member role successfully', async () => {
        mockDbService.query.mockResolvedValue({
          rows: [{ id: 'member-123', role: 'member' }],
        } as any);
        mockAuditService.logEvent.mockResolvedValue();

        const context = {
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        };

        await organizationService.updateTeamMemberRole('team-123', 'user-456', 'admin', 'user-123', context);

        expect(mockDbService.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE team_members'),
          ['admin', 'team-123', 'user-456']
        );

        expect(mockAuditService.logEvent).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'team_member_role_updated',
          resourceType: 'team_member',
          resourceId: 'member-123',
          details: {
            teamId: 'team-123',
            targetUserId: 'user-456',
            newRole: 'admin',
            previousRole: 'member',
          },
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
          severity: 'info',
        });
      });
    });
  });

  describe('Statistics and Analytics', () => {
    describe('getOrganizationStats', () => {
      it('should return organization statistics', async () => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [{ total_members: '15' }] } as any) // Members count
          .mockResolvedValueOnce({ rows: [{ total_teams: '8', recent_activity: '3' }] } as any) // Teams count
          .mockResolvedValueOnce({ rows: [{ plan: 'pro', max_users: 100 }] } as any); // Plan info

        const result = await organizationService.getOrganizationStats('org-123');

        expect(result).toEqual({
          totalMembers: 15,
          totalTeams: 8,
          activeTeams: 8,
          recentActivity: 3,
          planLimits: {
            maxUsers: 100,
            maxTeams: 50,
            maxStorage: 10240,
          },
          usage: {
            users: 15,
            teams: 8,
            storage: 0,
          },
        });
      });
    });
  });

  describe('Helper Methods', () => {
    it('should generate valid slugs from organization names', async () => {
      const organizationService = new OrganizationService(
        mockConfig,
        mockDbService,
        mockAuditService,
        mockRbacService
      );

      // Access private method through any cast for testing
      const generateSlug = (organizationService as any).generateSlug;

      expect(generateSlug('Test Organization')).toBe('test-organization');
      expect(generateSlug('My Company Inc.!')).toBe('my-company-inc');
      expect(generateSlug('Spaces   And   Multiple')).toBe('spaces-and-multiple');
      expect(generateSlug('Special@#$%Characters')).toBe('specialcharacters');
    });

    it('should return correct default max users for plans', async () => {
      const organizationService = new OrganizationService(
        mockConfig,
        mockDbService,
        mockAuditService,
        mockRbacService
      );

      const getDefaultMaxUsers = (organizationService as any).getDefaultMaxUsers;

      expect(getDefaultMaxUsers('free')).toBe(10);
      expect(getDefaultMaxUsers('pro')).toBe(100);
      expect(getDefaultMaxUsers('enterprise')).toBe(1000);
      expect(getDefaultMaxUsers('unknown')).toBe(10);
    });

    it('should return correct plan limits', async () => {
      const organizationService = new OrganizationService(
        mockConfig,
        mockDbService,
        mockAuditService,
        mockRbacService
      );

      const getPlanLimits = (organizationService as any).getPlanLimits;

      expect(getPlanLimits('free')).toEqual({
        maxUsers: 10,
        maxTeams: 5,
        maxStorage: 1024,
      });

      expect(getPlanLimits('pro')).toEqual({
        maxUsers: 100,
        maxTeams: 50,
        maxStorage: 10240,
      });

      expect(getPlanLimits('enterprise')).toEqual({
        maxUsers: 1000,
        maxTeams: 500,
        maxStorage: 102400,
      });
    });
  });
});

// Mock crypto.randomUUID for consistent testing
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => 'test-uuid-123'),
}));