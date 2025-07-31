// Epic 11.4 Organization Service
// Multi-tenant organization management with settings, branding, and team hierarchies

import { AuthConfig, Organization, Team, TeamMember } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';
import { RBACService } from './RBACService';

}
}
export interface CreateOrganizationData {
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  maxUsers?: number;
  settings?: Record<string, any>;
  branding?: Record<string, any>;
}
}
}

}
}
export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  website?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  maxUsers?: number;
  settings?: Record<string, any>;
  branding?: Record<string, any>;
}
}
}

}
}
export interface CreateTeamData {
  organizationId: string;
  parentTeamId?: string;
  name: string;
  description?: string;
  settings?: Record<string, any>;
}
}
}

}
}
export interface UpdateTeamData {
  name?: string;
  description?: string;
  parentTeamId?: string;
  settings?: Record<string, any>;
}
}
}

}
}
export interface TeamMemberData {
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invitedBy?: string;
}
}
}

}
}
export interface OrganizationStats {
  totalMembers: number;
  totalTeams: number;
  activeTeams: number;
  recentActivity: number;
  planLimits: {
    maxUsers: number;
    maxTeams: number;
    maxStorage: number;
}
}
  };
  usage: {
    users: number;
    teams: number;
    storage: number;
  };
}

export class OrganizationService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private auditService: AuditService;
  private rbacService: RBACService;

  constructor(
    config: AuthConfig,
    dbService: DatabaseService,
    auditService: AuditService,
    rbacService: RBACService
  ) {
    this.config = config;
    this.dbService = dbService;
    this.auditService = auditService;
    this.rbacService = rbacService;
  }

  // Organization Management
  async createOrganization(
    data: CreateOrganizationData,
    createdBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<Organization> {

    const transaction = await this.dbService.transaction();
    
    try {
      const organizationId = require('crypto').randomUUID();
      const slug = data.slug || this.generateSlug(data.name);
      const now = new Date();

      // Check if slug is available
      const existingOrg = await transaction.query(
        'SELECT id FROM organizations WHERE slug = $1 AND deleted_at IS NULL',
        [slug]
      );

      if (existingOrg.rows.length > 0) {
        throw new Error('Organization slug already exists');
      }

      // Create organization
      await transaction.query(`
        INSERT INTO organizations (
          id, name, slug, description, website, plan, max_users, 
          settings, branding, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        organizationId,
        data.name,
        slug,
        data.description,
        data.website,
        data.plan || 'free',
        data.maxUsers || this.getDefaultMaxUsers(data.plan || 'free'),
        JSON.stringify(data.settings || {}),
        JSON.stringify(data.branding || {}),
        now,
        now
      ]);

      // Create default organization owner role
      const ownerRole = await this.rbacService.createRole({
        name: `${slug}_owner`,
        description: `Owner role for ${data.name}`,
        scope: 'organization',
        organizationId,
        permissions: [
          { resource: 'organizations', action: '*', scope: 'organization' },
          { resource: 'teams', action: '*', scope: 'organization' },
          { resource: 'users', action: '*', scope: 'organization' },
          { resource: 'roles', action: '*', scope: 'organization' }
        ]
      }, context);

      // Assign creator as organization owner
      await this.rbacService.assignRole({
        userId: createdBy,
        roleId: ownerRole.id,
        grantedBy: createdBy,
        scopeContext: { organizationId }
      }, context);

      // Create default admin role
      await this.rbacService.createRole({
        name: `${slug}_admin`,
        description: `Admin role for ${data.name}`,
        scope: 'organization',
        organizationId,
        permissions: [
          { resource: 'teams', action: '*', scope: 'organization' },
          { resource: 'users', action: 'read', scope: 'organization' },
          { resource: 'users', action: 'write', scope: 'organization' }
        ]
      }, context);

      // Create default member role
      await this.rbacService.createRole({
        name: `${slug}_member`,
        description: `Member role for ${data.name}`,
        scope: 'organization',
        organizationId,
        permissions: [
          { resource: 'teams', action: 'read', scope: 'organization' },
          { resource: 'graphs', action: '*', scope: 'organization' }
        ]
      }, context);

      await transaction.commit();

      // Log organization creation
      await this.auditService.logEvent({
        userId: createdBy,
        action: 'organization_created',
        resourceType: 'organization',
        resourceId: organizationId,
        details: {
          organizationName: data.name,
          slug,
          plan: data.plan || 'free'
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      const organization: Organization = {
        id: organizationId,
        name: data.name,
        slug,
        description: data.description,
        website: data.website,
        logoUrl: undefined,
        branding: data.branding || {},
        settings: data.settings || {},
        plan: data.plan || 'free',
        maxUsers: data.maxUsers || this.getDefaultMaxUsers(data.plan || 'free'),
        createdAt: now,
        updatedAt: now
      };

      return organization;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateOrganization(
    organizationId: string,
    updates: UpdateOrganizationData,
    updatedBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<Organization> {

    const now = new Date();

    // Get existing organization
    const existing = await this.getOrganizationById(organizationId);
    if (!existing) {
      throw new Error('Organization not found');
    }

    await this.dbService.query(`
      UPDATE organizations 
      SET name = $1, description = $2, website = $3, plan = $4, max_users = $5,
          settings = $6, branding = $7, updated_at = $8
      WHERE id = $9
    `, [
      updates.name ?? existing.name,
      updates.description ?? existing.description,
      updates.website ?? existing.website,
      updates.plan ?? existing.plan,
      updates.maxUsers ?? existing.maxUsers,
      JSON.stringify(updates.settings ?? existing.settings),
      JSON.stringify(updates.branding ?? existing.branding),
      now,
      organizationId
    ]);

    // Log organization update
    await this.auditService.logEvent({
      userId: updatedBy,
      action: 'organization_updated',
      resourceType: 'organization',
      resourceId: organizationId,
      details: {
        changes: updates,
        previousValues: {
          name: existing.name,
          description: existing.description,
          plan: existing.plan
        }
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });

    const updated: Organization = {
      ...existing,
      name: updates.name ?? existing.name,
      description: updates.description ?? existing.description,
      website: updates.website ?? existing.website,
      plan: updates.plan ?? existing.plan,
      maxUsers: updates.maxUsers ?? existing.maxUsers,
      settings: updates.settings ?? existing.settings,
      branding: updates.branding ?? existing.branding,
      updatedAt: now
    };

    return updated;
  }

  async deleteOrganization(
    organizationId: string,
    deletedBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    const transaction = await this.dbService.transaction();
    
    try {
      const organization = await this.getOrganizationById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      const now = new Date();

      // Soft delete organization
      await transaction.query(`
        UPDATE organizations 
        SET deleted_at = $1, updated_at = $2
        WHERE id = $3
      `, [now, now, organizationId]);

      // Soft delete all teams in organization
      await transaction.query(`
        UPDATE teams 
        SET deleted_at = $1, updated_at = $2
        WHERE organization_id = $3 AND deleted_at IS NULL
      `, [now, now, organizationId]);

      // Remove all team memberships
      await transaction.query(`
        DELETE FROM team_members 
        WHERE team_id IN (
          SELECT id FROM teams WHERE organization_id = $1

      `, [organizationId]);

      // Remove organization-specific roles
      await transaction.query(`
        DELETE FROM user_roles 
        WHERE role_id IN (
          SELECT id FROM roles WHERE organization_id = $1

      `, [organizationId]);

      await transaction.query(`
        DELETE FROM permissions 
        WHERE role_id IN (
          SELECT id FROM roles WHERE organization_id = $1

      `, [organizationId]);

      await transaction.query(`
        DELETE FROM roles 
        WHERE organization_id = $1
      `, [organizationId]);

      await transaction.commit();

      // Log organization deletion
      await this.auditService.logEvent({
        userId: deletedBy,
        action: 'organization_deleted',
        resourceType: 'organization',
        resourceId: organizationId,
        details: {
          organizationName: organization.name,
          slug: organization.slug
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getOrganizationById(organizationId: string): Promise<Organization | null> {

    const result = await this.dbService.query(`
      SELECT * FROM organizations 
      WHERE id = $1 AND deleted_at IS NULL
    `, [organizationId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDatabaseToOrganization(result.rows[0]);
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {

    const result = await this.dbService.query(`
      SELECT * FROM organizations 
      WHERE slug = $1 AND deleted_at IS NULL
    `, [slug]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDatabaseToOrganization(result.rows[0]);
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {

    const result = await this.dbService.query(`
      SELECT DISTINCT o.* FROM organizations o
      INNER JOIN roles r ON o.id = r.organization_id
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND o.deleted_at IS NULL
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      ORDER BY o.name
    `, [userId]);

    return result.rows.map(row => this.mapDatabaseToOrganization(row));
  }

  // Team Management
  async createTeam(
    data: CreateTeamData,
    createdBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<Team> {

    const teamId = require('crypto').randomUUID();
    const now = new Date();

    await this.dbService.query(`
      INSERT INTO teams (
        id, organization_id, parent_team_id, name, description, settings, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      teamId,
      data.organizationId,
      data.parentTeamId,
      data.name,
      data.description,
      JSON.stringify(data.settings || {}),
      now,
      now
    ]);

    // Add creator as team owner
    await this.addTeamMember({
      teamId,
      userId: createdBy,
      role: 'owner',
      invitedBy: createdBy
    }, context);

    // Log team creation
    await this.auditService.logEvent({
      userId: createdBy,
      action: 'team_created',
      resourceType: 'team',
      resourceId: teamId,
      details: {
        teamName: data.name,
        organizationId: data.organizationId,
        parentTeamId: data.parentTeamId
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });

    const team: Team = {
      id: teamId,
      organizationId: data.organizationId,
      parentTeamId: data.parentTeamId,
      name: data.name,
      description: data.description,
      settings: data.settings || {},
      createdAt: now,
      updatedAt: now
    };

    return team;
  }

  async updateTeam(
    teamId: string,
    updates: UpdateTeamData,
    updatedBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<Team> {

    const now = new Date();

    const existing = await this.getTeamById(teamId);
    if (!existing) {
      throw new Error('Team not found');
    }

    await this.dbService.query(`
      UPDATE teams 
      SET name = $1, description = $2, parent_team_id = $3, settings = $4, updated_at = $5
      WHERE id = $6
    `, [
      updates.name ?? existing.name,
      updates.description ?? existing.description,
      updates.parentTeamId ?? existing.parentTeamId,
      JSON.stringify(updates.settings ?? existing.settings),
      now,
      teamId
    ]);

    // Log team update
    await this.auditService.logEvent({
      userId: updatedBy,
      action: 'team_updated',
      resourceType: 'team',
      resourceId: teamId,
      details: {
        changes: updates,
        previousValues: {
          name: existing.name,
          description: existing.description,
          parentTeamId: existing.parentTeamId
        }
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });

    const updated: Team = {
      ...existing,
      name: updates.name ?? existing.name,
      description: updates.description ?? existing.description,
      parentTeamId: updates.parentTeamId ?? existing.parentTeamId,
      settings: updates.settings ?? existing.settings,
      updatedAt: now
    };

    return updated;
  }

  async deleteTeam(
    teamId: string,
    deletedBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    const transaction = await this.dbService.transaction();
    
    try {
      const team = await this.getTeamById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // Check for child teams
      const childTeams = await transaction.query(
        'SELECT COUNT(*) as count FROM teams WHERE parent_team_id = $1 AND deleted_at IS NULL',
        [teamId]
      );

      if (parseInt(childTeams.rows[0].count) > 0) {
        throw new Error('Cannot delete team with child teams. Please delete or move child teams first.');
      }

      const now = new Date();

      // Soft delete team
      await transaction.query(`
        UPDATE teams 
        SET deleted_at = $1, updated_at = $2
        WHERE id = $3
      `, [now, now, teamId]);

      // Remove all team memberships
      await transaction.query(`
        DELETE FROM team_members WHERE team_id = $1
      `, [teamId]);

      await transaction.commit();

      // Log team deletion
      await this.auditService.logEvent({
        userId: deletedBy,
        action: 'team_deleted',
        resourceType: 'team',
        resourceId: teamId,
        details: {
          teamName: team.name,
          organizationId: team.organizationId
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getTeamById(teamId: string): Promise<Team | null> {

    const result = await this.dbService.query(`
      SELECT * FROM teams 
      WHERE id = $1 AND deleted_at IS NULL
    `, [teamId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDatabaseToTeam(result.rows[0]);
  }

  async getOrganizationTeams(organizationId: string): Promise<Team[]> {

    const result = await this.dbService.query(`
      SELECT * FROM teams 
      WHERE organization_id = $1 AND deleted_at IS NULL
      ORDER BY name
    `, [organizationId]);

    return result.rows.map(row => this.mapDatabaseToTeam(row));
  }

  async getTeamHierarchy(organizationId: string): Promise<Team[]> {

    const result = await this.dbService.query(`
      WITH RECURSIVE team_hierarchy AS (
        SELECT *, 0 as level, ARRAY[name] as path
        FROM teams 
        WHERE organization_id = $1 AND parent_team_id IS NULL AND deleted_at IS NULL
        
        UNION ALL
        
        SELECT t.*, th.level + 1, th.path || t.name
        FROM teams t
        INNER JOIN team_hierarchy th ON t.parent_team_id = th.id
        WHERE t.deleted_at IS NULL

      SELECT * FROM team_hierarchy ORDER BY path
    `, [organizationId]);

    return result.rows.map(row => ({
      ...this.mapDatabaseToTeam(row),
      level: row.level,
      path: row.path
    }));
  }

  // Team Membership Management
  async addTeamMember(
    data: TeamMemberData,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<TeamMember> {

    const memberId = require('crypto').randomUUID();
    const now = new Date();

    // Check if user is already a member
    const existing = await this.dbService.query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [data.teamId, data.userId]
    );

    if (existing.rows.length > 0) {
      throw new Error('User is already a member of this team');
    }

    await this.dbService.query(`
      INSERT INTO team_members (id, team_id, user_id, role, joined_at, invited_by)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [memberId, data.teamId, data.userId, data.role, now, data.invitedBy]);

    // Log team member addition
    await this.auditService.logEvent({
      userId: data.invitedBy,
      action: 'team_member_added',
      resourceType: 'team_member',
      resourceId: memberId,
      details: {
        teamId: data.teamId,
        addedUserId: data.userId,
        role: data.role
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });

    const teamMember: TeamMember = {
      id: memberId,
      teamId: data.teamId,
      userId: data.userId,
      role: data.role,
      joinedAt: now,
      invitedBy: data.invitedBy
    };

    return teamMember;
  }

  async removeTeamMember(
    teamId: string,
    userId: string,
    removedBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    const result = await this.dbService.query(`
      DELETE FROM team_members 
      WHERE team_id = $1 AND user_id = $2
      RETURNING id, role
    `, [teamId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Team member not found');
    }

    // Log team member removal
    await this.auditService.logEvent({
      userId: removedBy,
      action: 'team_member_removed',
      resourceType: 'team_member',
      resourceId: result.rows[0].id,
      details: {
        teamId,
        removedUserId: userId,
        previousRole: result.rows[0].role
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });
  }

  async updateTeamMemberRole(
    teamId: string,
    userId: string,
    newRole: 'owner' | 'admin' | 'member' | 'viewer',
    updatedBy: string,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<void> {

    const result = await this.dbService.query(`
      UPDATE team_members 
      SET role = $1
      WHERE team_id = $2 AND user_id = $3
      RETURNING id, role
    `, [newRole, teamId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Team member not found');
    }

    // Log role update
    await this.auditService.logEvent({
      userId: updatedBy,
      action: 'team_member_role_updated',
      resourceType: 'team_member',
      resourceId: result.rows[0].id,
      details: {
        teamId,
        targetUserId: userId,
        newRole,
        previousRole: result.rows[0].role
  }
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });
  }

  async getTeamMembers(teamId: string): Promise<any[]> {

    const result = await this.dbService.query(`
      SELECT tm.*, u.email, up.display_name, up.first_name, up.last_name, up.avatar_url
      FROM team_members tm
      INNER JOIN users u ON tm.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE tm.team_id = $1
      ORDER BY tm.joined_at
    `, [teamId]);

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      role: row.role,
      joinedAt: row.joined_at,
      invitedBy: row.invited_by,
      user: {
        id: row.user_id,
        email: row.email,
        displayName: row.display_name,
        firstName: row.first_name,
        lastName: row.last_name,
        avatarUrl: row.avatar_url
      }
    }));
  }

  async getUserTeams(userId: string, organizationId?: string): Promise<Team[]> {

    let query = `
      SELECT t.* FROM teams t
      INNER JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = $1 AND t.deleted_at IS NULL
    `;
    const params = [userId];

    if (organizationId) {
      query += ' AND t.organization_id = $2';
      params.push(organizationId);
    }

    query += ' ORDER BY t.name';

    const result = await this.dbService.query(query, params);
    return result.rows.map(row => this.mapDatabaseToTeam(row));
  }

  // Statistics and Analytics
  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {

    const [membersResult, teamsResult, planResult] = await Promise.all([
      this.dbService.query(`
        SELECT COUNT(DISTINCT ur.user_id) as total_members
        FROM user_roles ur
        INNER JOIN roles r ON ur.role_id = r.id
        WHERE r.organization_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      `, [organizationId]),
      
      this.dbService.query(`
        SELECT 
          COUNT(*) as total_teams,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_activity
        FROM teams
        WHERE organization_id = $1 AND deleted_at IS NULL
      `, [organizationId]),
      
      this.dbService.query(`
        SELECT plan, max_users FROM organizations WHERE id = $1
      `, [organizationId])
    ]);

    const organization = planResult.rows[0];
    const planLimits = this.getPlanLimits(organization.plan);

    return {
      totalMembers: parseInt(membersResult.rows[0].total_members) || 0,
      totalTeams: parseInt(teamsResult.rows[0].total_teams) || 0,
      activeTeams: parseInt(teamsResult.rows[0].total_teams) || 0, // All non-deleted teams are considered active
      recentActivity: parseInt(teamsResult.rows[0].recent_activity) || 0,
      planLimits,
      usage: {
        users: parseInt(membersResult.rows[0].total_members) || 0,
        teams: parseInt(teamsResult.rows[0].total_teams) || 0,
        storage: 0 // TODO: Implement storage calculation
      }
    };
  }

  // Helper Methods
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  }

  private getDefaultMaxUsers(plan: string): number {
    switch (plan) {
    case 'free': return 10;
    case 'pro': return 100;
    case 'enterprise': return 1000;
    default: return 10;
    }
  }

  private getPlanLimits(plan: string) {
    switch (plan) {
    case 'free':
      return { maxUsers: 10, maxTeams: 5, maxStorage: 1024 }; // 1GB
    case 'pro':
      return { maxUsers: 100, maxTeams: 50, maxStorage: 10240 }; // 10GB
    case 'enterprise':
      return { maxUsers: 1000, maxTeams: 500, maxStorage: 102400 }; // 100GB
    default:
      return { maxUsers: 10, maxTeams: 5, maxStorage: 1024 };
    }
  }

  private mapDatabaseToOrganization(row: any): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      website: row.website,
      logoUrl: row.logo_url,
      branding: row.branding || {},
      settings: row.settings || {},
      plan: row.plan,
      maxUsers: row.max_users,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at
    };
  }

  private mapDatabaseToTeam(row: any): Team {
    return {
      id: row.id,
      organizationId: row.organization_id,
      parentTeamId: row.parent_team_id,
      name: row.name,
      description: row.description,
      settings: row.settings || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at
    };
  }
}