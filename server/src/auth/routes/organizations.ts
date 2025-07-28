// Epic 11.4 Organization Management Routes
// RESTful API endpoints for organization and team management with RBAC integration

import { FastifyInstance, FastifyRequest } from 'fastify';
import { OrganizationService, CreateOrganizationData, UpdateOrganizationData } from '../services/OrganizationService';
import { RBACService } from '../services/RBACService';
import { requireAuth } from '../middleware/requireAuth';

export interface OrganizationRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export async function organizationRoutes(fastify: FastifyInstance) {
  const orgService = fastify.organizationService as OrganizationService;
  const rbacService = fastify.rbacService as RBACService;

  // Organization Management Routes

  // Create organization
  fastify.post('/organizations', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          slug: { type: 'string', pattern: '^[a-z0-9-]+$', maxLength: 50 },
          description: { type: 'string', maxLength: 500 },
          website: { type: 'string', format: 'uri' },
          plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
          maxUsers: { type: 'number', minimum: 1 },
          settings: { type: 'object' },
          branding: { type: 'object' }
        }
      }
    }
  }, async (request: OrganizationRequest, reply) => {
    try {
      const createData: CreateOrganizationData = request.body as CreateOrganizationData;
      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const organization = await orgService.createOrganization(
        createData,
        request.user.id,
        context
      );

      reply.code(201).send({
        success: true,
        data: organization
      });
    } catch (error) {
      fastify.log.error('Organization creation failed:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Organization creation failed'
      });
    }
  });

  // Get user's organizations
  fastify.get('/organizations/my', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const organizations = await orgService.getUserOrganizations(request.user.id);

      reply.send({
        success: true,
        data: organizations
      });
    } catch (error) {
      fastify.log.error('Failed to fetch user organizations:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch organizations'
      });
    }
  });

  // Get organization by ID
  fastify.get('/organizations/:organizationId', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };

      // Check permission to view organization
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'organizations', action: 'read' },
        { organizationId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view organization'
        });
      }

      const organization = await orgService.getOrganizationById(organizationId);
      if (!organization) {
        return reply.code(404).send({
          success: false,
          error: 'Organization not found'
        });
      }

      reply.send({
        success: true,
        data: organization
      });
    } catch (error) {
      fastify.log.error('Failed to fetch organization:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch organization'
      });
    }
  });

  // Update organization
  fastify.put('/organizations/:organizationId', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          website: { type: 'string', format: 'uri' },
          plan: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
          maxUsers: { type: 'number', minimum: 1 },
          settings: { type: 'object' },
          branding: { type: 'object' }
        }
      }
    }
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };
      const updateData: UpdateOrganizationData = request.body as UpdateOrganizationData;

      // Check permission to update organization
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'organizations', action: 'write' },
        { organizationId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to update organization'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const organization = await orgService.updateOrganization(
        organizationId,
        updateData,
        request.user.id,
        context
      );

      reply.send({
        success: true,
        data: organization
      });
    } catch (error) {
      fastify.log.error('Organization update failed:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Organization update failed'
      });
    }
  });

  // Delete organization
  fastify.delete('/organizations/:organizationId', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };

      // Check permission to delete organization (owner only)
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'organizations', action: 'delete' },
        { organizationId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to delete organization'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await orgService.deleteOrganization(organizationId, request.user.id, context);

      reply.send({
        success: true,
        message: 'Organization deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Organization deletion failed:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Organization deletion failed'
      });
    }
  });

  // Get organization statistics
  fastify.get('/organizations/:organizationId/stats', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };

      // Check permission to view organization stats
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'organizations', action: 'read' },
        { organizationId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view organization statistics'
        });
      }

      const stats = await orgService.getOrganizationStats(organizationId);

      reply.send({
        success: true,
        data: stats
      });
    } catch (error) {
      fastify.log.error('Failed to fetch organization stats:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch organization statistics'
      });
    }
  });

  // Team Management Routes

  // Create team
  fastify.post('/organizations/:organizationId/teams', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          parentTeamId: { type: 'string', format: 'uuid' },
          settings: { type: 'object' }
        }
      }
    }
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };
      const teamData = request.body as {
        name: string;
        description?: string;
        parentTeamId?: string;
        settings?: Record<string, any>;
      };

      // Check permission to create teams
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'write' },
        { organizationId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to create teams'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const team = await orgService.createTeam(
        { organizationId, ...teamData },
        request.user.id,
        context
      );

      reply.code(201).send({
        success: true,
        data: team
      });
    } catch (error) {
      fastify.log.error('Team creation failed:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Team creation failed'
      });
    }
  });

  // Get organization teams
  fastify.get('/organizations/:organizationId/teams', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };

      // Check permission to view teams
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'read' },
        { organizationId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view teams'
        });
      }

      const teams = await orgService.getOrganizationTeams(organizationId);

      reply.send({
        success: true,
        data: teams
      });
    } catch (error) {
      fastify.log.error('Failed to fetch teams:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch teams'
      });
    }
  });

  // Get team hierarchy
  fastify.get('/organizations/:organizationId/teams/hierarchy', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };

      // Check permission to view teams
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'read' },
        { organizationId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view team hierarchy'
        });
      }

      const hierarchy = await orgService.getTeamHierarchy(organizationId);

      reply.send({
        success: true,
        data: hierarchy
      });
    } catch (error) {
      fastify.log.error('Failed to fetch team hierarchy:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch team hierarchy'
      });
    }
  });

  // Get team by ID
  fastify.get('/teams/:teamId', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { teamId } = request.params as { teamId: string };

      const team = await orgService.getTeamById(teamId);
      if (!team) {
        return reply.code(404).send({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permission to view team
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'read' },
        { organizationId: team.organizationId, teamId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view team'
        });
      }

      reply.send({
        success: true,
        data: team
      });
    } catch (error) {
      fastify.log.error('Failed to fetch team:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch team'
      });
    }
  });

  // Update team
  fastify.put('/teams/:teamId', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          parentTeamId: { type: 'string', format: 'uuid' },
          settings: { type: 'object' }
        }
      }
    }
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { teamId } = request.params as { teamId: string };
      const updateData = request.body as {
        name?: string;
        description?: string;
        parentTeamId?: string;
        settings?: Record<string, any>;
      };

      const team = await orgService.getTeamById(teamId);
      if (!team) {
        return reply.code(404).send({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permission to update team
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'write' },
        { organizationId: team.organizationId, teamId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to update team'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const updatedTeam = await orgService.updateTeam(
        teamId,
        updateData,
        request.user.id,
        context
      );

      reply.send({
        success: true,
        data: updatedTeam
      });
    } catch (error) {
      fastify.log.error('Team update failed:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Team update failed'
      });
    }
  });

  // Delete team
  fastify.delete('/teams/:teamId', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { teamId } = request.params as { teamId: string };

      const team = await orgService.getTeamById(teamId);
      if (!team) {
        return reply.code(404).send({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permission to delete team
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'delete' },
        { organizationId: team.organizationId, teamId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to delete team'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await orgService.deleteTeam(teamId, request.user.id, context);

      reply.send({
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      fastify.log.error('Team deletion failed:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Team deletion failed'
      });
    }
  });

  // Team Membership Routes

  // Add team member
  fastify.post('/teams/:teamId/members', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'role'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['owner', 'admin', 'member', 'viewer'] }
        }
      }
    }
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { teamId } = request.params as { teamId: string };
      const { userId, role } = request.body as { userId: string; role: string };

      const team = await orgService.getTeamById(teamId);
      if (!team) {
        return reply.code(404).send({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permission to manage team members
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'write' },
        { organizationId: team.organizationId, teamId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to manage team members'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const member = await orgService.addTeamMember(
        {
          teamId,
          userId,
          role: role as 'owner' | 'admin' | 'member' | 'viewer',
          invitedBy: request.user.id
  }
        context
      );

      reply.code(201).send({
        success: true,
        data: member
      });
    } catch (error) {
      fastify.log.error('Failed to add team member:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add team member'
      });
    }
  });

  // Get team members
  fastify.get('/teams/:teamId/members', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { teamId } = request.params as { teamId: string };

      const team = await orgService.getTeamById(teamId);
      if (!team) {
        return reply.code(404).send({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permission to view team members
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'read' },
        { organizationId: team.organizationId, teamId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to view team members'
        });
      }

      const members = await orgService.getTeamMembers(teamId);

      reply.send({
        success: true,
        data: members
      });
    } catch (error) {
      fastify.log.error('Failed to fetch team members:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch team members'
      });
    }
  });

  // Update team member role
  fastify.put('/teams/:teamId/members/:userId', {
    preHandler: [requireAuth],
    schema: {
      body: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['owner', 'admin', 'member', 'viewer'] }
        }
      }
    }
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { teamId, userId } = request.params as { teamId: string; userId: string };
      const { role } = request.body as { role: string };

      const team = await orgService.getTeamById(teamId);
      if (!team) {
        return reply.code(404).send({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permission to manage team members
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'write' },
        { organizationId: team.organizationId, teamId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to manage team members'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await orgService.updateTeamMemberRole(
        teamId,
        userId,
        role as 'owner' | 'admin' | 'member' | 'viewer',
        request.user.id,
        context
      );

      reply.send({
        success: true,
        message: 'Team member role updated successfully'
      });
    } catch (error) {
      fastify.log.error('Failed to update team member role:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update team member role'
      });
    }
  });

  // Remove team member
  fastify.delete('/teams/:teamId/members/:userId', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { teamId, userId } = request.params as { teamId: string; userId: string };

      const team = await orgService.getTeamById(teamId);
      if (!team) {
        return reply.code(404).send({
          success: false,
          error: 'Team not found'
        });
      }

      // Check permission to manage team members
      const hasPermission = await rbacService.checkPermission(
        request.user.id,
        { resource: 'teams', action: 'write' },
        { organizationId: team.organizationId, teamId }
      );

      if (!hasPermission.allowed) {
        return reply.code(403).send({
          success: false,
          error: 'Insufficient permissions to manage team members'
        });
      }

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      await orgService.removeTeamMember(teamId, userId, request.user.id, context);

      reply.send({
        success: true,
        message: 'Team member removed successfully'
      });
    } catch (error) {
      fastify.log.error('Failed to remove team member:', error);
      reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove team member'
      });
    }
  });

  // Get user teams
  fastify.get('/users/:userId/teams', {
    preHandler: [requireAuth]
  }, async (request: OrganizationRequest, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const { organizationId } = request.query as { organizationId?: string };

      // Users can only view their own teams unless they have admin permissions
      if (userId !== request.user.id) {
        const hasPermission = await rbacService.checkPermission(
          request.user.id,
          { resource: 'users', action: 'read' },
          organizationId ? { organizationId } : undefined
        );

        if (!hasPermission.allowed) {
          return reply.code(403).send({
            success: false,
            error: 'Insufficient permissions to view user teams'
          });
        }
      }

      const teams = await orgService.getUserTeams(userId, organizationId);

      reply.send({
        success: true,
        data: teams
      });
    } catch (error) {
      fastify.log.error('Failed to fetch user teams:', error);
      reply.code(500).send({
        success: false,
        error: 'Failed to fetch user teams'
      });
    }
  });
}