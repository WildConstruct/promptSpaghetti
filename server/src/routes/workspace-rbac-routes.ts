/**
 * Workspace RBAC API Routes for Epic 23
 * 
 * Role-based access control endpoints for workspace management,
 * user permissions, and multi-tenant isolation.
 */

import { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify';
import { WorkspaceService } from '../services/workspace-service';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../database/workspace-models';

// Request type definitions
interface WorkspaceParamsRequest {
  Params: { workspaceId: string };
}

interface UserPermissionsRequest extends WorkspaceParamsRequest {
  Params: { workspaceId: string; userId: string };
}

interface UpdateUserRoleRequest extends WorkspaceParamsRequest {
  Params: { workspaceId: string; userId: string };
  Body: { roleName: string };
}

interface ResourceQuotaRequest extends WorkspaceParamsRequest {
  Querystring: { 
    resourceType: 'projects' | 'resources' | 'storage';
    requestedAmount?: number;
  };
}

interface WorkspaceContextRequest {
  Params: { workspaceId: string };
}

// Route options for authentication
const authOptions: RouteShorthandOptions = {
  preHandler: async (request: FastifyRequest, reply: FastifyReply) => {
    // Authentication middleware would be implemented here
    // For now, we'll assume user is authenticated and available in request.user
    if (!request.headers.authorization) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }
  }
};

export async function registerWorkspaceRBACRoutes(
  fastify: any,
  workspaceService: WorkspaceService
) {
  
  // Get workspace members with their roles and permissions
  fastify.get<WorkspaceParamsRequest>(
    '/api/workspaces/:workspaceId/members',
    authOptions,
    async (request: FastifyRequest<WorkspaceParamsRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId } = request.params;
        const userId = (request as any).user?.id; // Assuming auth middleware sets this
        
        if (!userId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        const members = await workspaceService.getWorkspaceMembers(workspaceId, userId);
        
        return reply.send({
          success: true,
          data: members.map(member => ({
            userId: member.user_id,
            membership: {
              status: member.membership.status,
              joinedAt: member.membership.joined_at,
              lastActiveAt: member.membership.last_active_at
  }
            roles: member.roles.map(role => ({
              id: role.id,
              name: role.name,
              description: role.description,
              isSystemRole: role.is_system_role
            })),
            permissions: member.permissions,
            permissionNames: getPermissionNames(member.permissions)
          }))
        });
        
      } catch (error) {
        return reply.code(403).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get workspace members'
        });
      }
    }
  );

  // Get specific user's permissions in workspace
  fastify.get<UserPermissionsRequest>(
    '/api/workspaces/:workspaceId/users/:userId/permissions',
    authOptions,
    async (request: FastifyRequest<UserPermissionsRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId, userId: targetUserId } = request.params;
        const requestingUserId = (request as any).user?.id;
        
        if (!requestingUserId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        const permissions = await workspaceService.getUserPermissions(
          workspaceId,
          targetUserId,
          requestingUserId
        );
        
        if (!permissions) {
          return reply.code(404).send({
            success: false,
            error: 'User not found or no permissions in workspace'
          });
        }

        return reply.send({
          success: true,
          data: {
            userId: targetUserId,
            permissions: permissions.permissions,
            permissionNames: getPermissionNames(permissions.permissions),
            roles: permissions.roles.map(role => ({
              id: role.id,
              name: role.name,
              description: role.description,
              permissions: role.permissions,
              isSystemRole: role.is_system_role
            }))
          }
        });
        
      } catch (error) {
        return reply.code(403).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get user permissions'
        });
      }
    }
  );

  // Update user role in workspace
  fastify.put<UpdateUserRoleRequest>(
    '/api/workspaces/:workspaceId/users/:userId/role',
    authOptions,
    async (request: FastifyRequest<UpdateUserRoleRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId, userId: targetUserId } = request.params;
        const { roleName } = request.body;
        const requestingUserId = (request as any).user?.id;
        
        if (!requestingUserId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        if (!roleName || !['admin', 'editor', 'viewer', 'commenter'].includes(roleName)) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid role name. Must be one of: admin, editor, viewer, commenter'
          });
        }

        const success = await workspaceService.updateUserRole(
          workspaceId,
          targetUserId,
          roleName,
          requestingUserId
        );
        
        if (!success) {
          return reply.code(400).send({
            success: false,
            error: 'Failed to update user role'
          });
        }

        return reply.send({
          success: true,
          message: `User role updated to ${roleName}`,
          data: {
            userId: targetUserId,
            newRole: roleName
          }
        });
        
      } catch (error) {
        return reply.code(403).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update user role'
        });
      }
    }
  );

  // Remove user from workspace
  fastify.delete<UserPermissionsRequest>(
    '/api/workspaces/:workspaceId/users/:userId',
    authOptions,
    async (request: FastifyRequest<UserPermissionsRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId, userId: targetUserId } = request.params;
        const requestingUserId = (request as any).user?.id;
        
        if (!requestingUserId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        const success = await workspaceService.removeUserFromWorkspace(
          workspaceId,
          targetUserId,
          requestingUserId
        );
        
        if (!success) {
          return reply.code(400).send({
            success: false,
            error: 'Failed to remove user from workspace'
          });
        }

        return reply.send({
          success: true,
          message: 'User removed from workspace',
          data: {
            userId: targetUserId,
            workspaceId: workspaceId
          }
        });
        
      } catch (error) {
        return reply.code(403).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to remove user from workspace'
        });
      }
    }
  );

  // Switch workspace context
  fastify.post<WorkspaceContextRequest>(
    '/api/workspaces/:workspaceId/switch-context',
    authOptions,
    async (request: FastifyRequest<WorkspaceContextRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId } = request.params;
        const userId = (request as any).user?.id;
        
        if (!userId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        const result = await workspaceService.switchWorkspaceContext(userId, workspaceId);
        
        if (!result.success) {
          return reply.code(403).send({
            success: false,
            error: 'Cannot switch to workspace: access denied or workspace not found'
          });
        }

        return reply.send({
          success: true,
          message: 'Workspace context switched successfully',
          data: {
            workspace: result.workspaceInfo,
            userPermissions: result.permissions,
            permissionNames: getPermissionNames(result.permissions || 0)
          }
        });
        
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to switch workspace context'
        });
      }
    }
  );

  // Check resource quotas
  fastify.get<ResourceQuotaRequest>(
    '/api/workspaces/:workspaceId/quotas',
    authOptions,
    async (request: FastifyRequest<ResourceQuotaRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId } = request.params;
        const { resourceType, requestedAmount = 1 } = request.query;
        const userId = (request as any).user?.id;
        
        if (!userId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        // Verify user has workspace access
        await workspaceService.enforceWorkspaceIsolation(userId, workspaceId, PERMISSIONS.WORKSPACE_READ);

        const quotaCheck = await workspaceService.checkResourceQuotas(
          workspaceId,
          resourceType,
          requestedAmount
        );
        
        return reply.send({
          success: true,
          data: {
            resourceType,
            requestedAmount,
            allowed: quotaCheck.allowed,
            currentUsage: quotaCheck.current,
            limit: quotaCheck.limit,
            remaining: quotaCheck.limit - quotaCheck.current,
            reason: quotaCheck.reason
          }
        });
        
      } catch (error) {
        return reply.code(403).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to check resource quotas'
        });
      }
    }
  );

  // Get available roles and permissions
  fastify.get<WorkspaceParamsRequest>(
    '/api/workspaces/:workspaceId/roles',
    authOptions,
    async (request: FastifyRequest<WorkspaceParamsRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId } = request.params;
        const userId = (request as any).user?.id;
        
        if (!userId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        // Verify user has workspace access
        await workspaceService.enforceWorkspaceIsolation(userId, workspaceId, PERMISSIONS.WORKSPACE_READ);

        const availableRoles = [
          {
            name: 'admin',
            description: 'Full workspace access and management',
            permissions: ROLE_PERMISSIONS.ADMIN,
            permissionNames: getPermissionNames(ROLE_PERMISSIONS.ADMIN)
  }
          {
            name: 'editor',
            description: 'Can create and edit content',
            permissions: ROLE_PERMISSIONS.EDITOR,
            permissionNames: getPermissionNames(ROLE_PERMISSIONS.EDITOR)
  }
          {
            name: 'viewer',
            description: 'Read-only access to workspace',
            permissions: ROLE_PERMISSIONS.VIEWER,
            permissionNames: getPermissionNames(ROLE_PERMISSIONS.VIEWER)
  }
          {
            name: 'commenter',
            description: 'Can view content and add comments',
            permissions: ROLE_PERMISSIONS.COMMENTER,
            permissionNames: getPermissionNames(ROLE_PERMISSIONS.COMMENTER)
          }
        ];
        
        return reply.send({
          success: true,
          data: availableRoles
        });
        
      } catch (error) {
        return reply.code(403).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get available roles'
        });
      }
    }
  );

  // Enforce multi-tenant isolation (utility endpoint for testing)
  fastify.post<WorkspaceParamsRequest>(
    '/api/workspaces/:workspaceId/validate-access',
    authOptions,
    async (request: FastifyRequest<WorkspaceParamsRequest>, reply: FastifyReply) => {
      try {
        const { workspaceId } = request.params;
        const userId = (request as any).user?.id;
        
        if (!userId) {
          return reply.code(401).send({ error: 'User not authenticated' });
        }

        await workspaceService.enforceWorkspaceIsolation(userId, workspaceId);
        
        return reply.send({
          success: true,
          message: 'User has valid access to workspace',
          data: {
            userId,
            workspaceId,
            validated: true
          }
        });
        
      } catch (error) {
        return reply.code(403).send({
          success: false,
          error: error instanceof Error ? error.message : 'Access validation failed'
        });
      }
    }
  );
}

/**
 * Convert permission bitmask to human-readable permission names
 */
function getPermissionNames(permissions: number): string[] {
  const permissionNames: string[] = [];
  
  const permissionMap: Record<number, string> = {
    [PERMISSIONS.WORKSPACE_READ]: 'workspace.read',
    [PERMISSIONS.WORKSPACE_WRITE]: 'workspace.write',
    [PERMISSIONS.WORKSPACE_ADMIN]: 'workspace.admin',
    [PERMISSIONS.WORKSPACE_DELETE]: 'workspace.delete',
    [PERMISSIONS.PROJECT_READ]: 'project.read',
    [PERMISSIONS.PROJECT_WRITE]: 'project.write',
    [PERMISSIONS.PROJECT_CREATE]: 'project.create',
    [PERMISSIONS.PROJECT_DELETE]: 'project.delete',
    [PERMISSIONS.RESOURCE_READ]: 'resource.read',
    [PERMISSIONS.RESOURCE_WRITE]: 'resource.write',
    [PERMISSIONS.RESOURCE_CREATE]: 'resource.create',
    [PERMISSIONS.RESOURCE_DELETE]: 'resource.delete',
    [PERMISSIONS.COMMENT_READ]: 'comment.read',
    [PERMISSIONS.COMMENT_WRITE]: 'comment.write',
    [PERMISSIONS.COMMENT_DELETE]: 'comment.delete',
    [PERMISSIONS.USER_INVITE]: 'user.invite',
    [PERMISSIONS.USER_REMOVE]: 'user.remove',
    [PERMISSIONS.USER_ASSIGN_ROLES]: 'user.assign_roles',
    [PERMISSIONS.ACTIVITY_READ]: 'activity.read',
    [PERMISSIONS.NOTIFICATION_MANAGE]: 'notification.manage',
    [PERMISSIONS.EXPORT_DATA]: 'export.data'
  };

  for (const [permissionBit, name] of Object.entries(permissionMap)) {
    if ((permissions & parseInt(permissionBit)) === parseInt(permissionBit)) {
      permissionNames.push(name);
    }
  }

  return permissionNames;
}