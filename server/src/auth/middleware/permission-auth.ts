// Epic 11.3 Permission-Based Authorization Middleware
// Fastify middleware for RBAC permission checking

import { FastifyRequest, FastifyReply } from 'fastify';
import { RBACService } from '../services/RBACService';
import { PermissionCheck, PermissionContext } from '../types';

}
}
export interface PermissionAuthOptions {
  resource: string;
  action: string;
  scope?: 'global' | 'organization' | 'team' | 'own';
  requireAll?: boolean; // If multiple permissions, require all or any
  allowSuperAdmin?: boolean; // Allow super_admin to bypass checks
  extractContext?: (request: FastifyRequest) => PermissionContext | Promise<PermissionContext>;
}
}
}

export function createPermissionAuthMiddleware(rbacService: RBACService) {
  return function permissionAuth(options: PermissionAuthOptions | PermissionAuthOptions[]) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const user = (request.user as any);
        
        if (!user || !user.id) {
          return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Authentication required'
          });
        }

        const userId = user.id;
        const permissions = Array.isArray(options) ? options : [options];

        // Check for super admin bypass
        if (permissions.some(p => p.allowSuperAdmin !== false)) {
          const userRoles = await rbacService.getUserRoles(userId);
          if (userRoles.some(role => role.name === 'super_admin')) {
            // Allow super admin to bypass permission checks
            return;
          }
        }

        // Extract context from request
        let context: PermissionContext = { userId };
        
        if (permissions[0].extractContext) {
          context = await permissions[0].extractContext(request);
        } else {
          // Default context extraction
          context = await extractDefaultContext(request, userId);
        }

        // Check permissions
        const permissionChecks: PermissionCheck[] = permissions.map(p => ({
          resource: p.resource,
          action: p.action,
          context
        }));

        const requireAll = permissions[0].requireAll ?? false;
        const results = await Promise.all(
          permissionChecks.map(check => rbacService.checkPermission(userId, check, context))
        );

        let allowed: boolean;
        if (requireAll) {
          allowed = results.every(result => result.allowed);
        } else {
          allowed = results.some(result => result.allowed);
        }

        if (!allowed) {
          const deniedPermissions = permissionChecks.filter((_, index) => !results[index].allowed);
          const reasons = results.filter(r => !r.allowed).map(r => r.reason).join(', ');

          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Insufficient permissions',
            details: {
              required: deniedPermissions.map(p => `${p.resource}:${p.action}`),
              reasons
            }
          });
        }

        // Add permission info to request for later use
        (request as any).permissions = {
          checked: permissionChecks,
          results,
          context
        };

        // Continue to next handler
      } catch (error) {
        console.error('Permission check error:', error);
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Permission check failed'
        });
      }
    };
  };
}

async function extractDefaultContext(
  request: FastifyRequest,
  userId: string
): Promise<PermissionContext> {

  const context: PermissionContext = { userId };

  // Extract from URL parameters
  const params = request.params as any;
  if (params.organizationId) {
    context.organizationId = params.organizationId;
  }
  if (params.teamId) {
    context.teamId = params.teamId;
  }
  if (params.id || params.resourceId) {
    context.resourceId = params.id || params.resourceId;
  }

  // Extract from query parameters
  const query = request.query as any;
  if (query.organizationId) {
    context.organizationId = query.organizationId;
  }
  if (query.teamId) {
    context.teamId = query.teamId;
  }

  // Extract from request headers
  const headers = request.headers;
  if (headers['x-organization-id']) {
    context.organizationId = headers['x-organization-id'] as string;
  }
  if (headers['x-team-id']) {
    context.teamId = headers['x-team-id'] as string;
  }

  return context;
}

// Common permission configurations
export const PermissionConfigs = {
  // Graph permissions
  GRAPHS_READ: {
    resource: 'graphs',
    action: 'read',
    allowSuperAdmin: true
  }
  GRAPHS_WRITE: {
    resource: 'graphs',
    action: 'write',
    allowSuperAdmin: true
  }
  GRAPHS_DELETE: {
    resource: 'graphs',
    action: 'delete',
    allowSuperAdmin: true
  }
  GRAPHS_EXECUTE: {
    resource: 'graphs',
    action: 'execute',
    allowSuperAdmin: true
  }
  // User permissions
  USERS_READ: {
    resource: 'users',
    action: 'read',
    allowSuperAdmin: true
  }
  USERS_WRITE: {
    resource: 'users',
    action: 'write',
    allowSuperAdmin: true
  }
  USERS_DELETE: {
    resource: 'users',
    action: 'delete',
    allowSuperAdmin: true
  }
  // Organization permissions
  ORGANIZATIONS_READ: {
    resource: 'organizations',
    action: 'read',
    allowSuperAdmin: true
  }
  ORGANIZATIONS_WRITE: {
    resource: 'organizations',
    action: 'write',
    allowSuperAdmin: true
  }
  ORGANIZATIONS_DELETE: {
    resource: 'organizations',
    action: 'delete',
    allowSuperAdmin: true
  }
  // Team permissions
  TEAMS_READ: {
    resource: 'teams',
    action: 'read',
    allowSuperAdmin: true
  }
  TEAMS_WRITE: {
    resource: 'teams',
    action: 'write',
    allowSuperAdmin: true
  }
  TEAMS_DELETE: {
    resource: 'teams',
    action: 'delete',
    allowSuperAdmin: true
  }
  // Role permissions
  ROLES_READ: {
    resource: 'roles',
    action: 'read',
    allowSuperAdmin: true
  }
  ROLES_WRITE: {
    resource: 'roles',
    action: 'write',
    allowSuperAdmin: true
  }
  ROLES_DELETE: {
    resource: 'roles',
    action: 'delete',
    allowSuperAdmin: true
  }
  // System administration
  SYSTEM_ADMIN: {
    resource: 'system',
    action: 'admin',
    allowSuperAdmin: true
  }
} as const;

// Helper function to create permission auth plugin for Fastify
export function createPermissionAuthPlugin(rbacService: RBACService) {
  return function permissionAuthPlugin(fastify: any, options: any, done: any) {
    const permissionAuth = createPermissionAuthMiddleware(rbacService);
    
    fastify.decorate('requirePermission', permissionAuth);
    
    // Add helper methods
    fastify.decorate('hasPermission', async function(
      userId: string,
      resource: string,
      action: string,
      context?: PermissionContext
    ) {
      const result = await rbacService.checkPermission(userId, { resource, action }, context);
      return result.allowed;
    });

    fastify.decorate('getUserPermissions', async function(userId: string) {
      return await rbacService.getUserPermissions(userId);
    });

    fastify.decorate('getUserRoles', async function(userId: string) {
      return await rbacService.getUserRoles(userId);
    });
    
    done();
  };
}

// Context extractors for common scenarios
export const ContextExtractors = {
  // Extract organization context from user's primary organization
  userOrganization: async (request: FastifyRequest): Promise<PermissionContext> => {
    const user = (request.user as any);
    const context: PermissionContext = { userId: user.id };
    
    // Get user's primary organization (this would need to be implemented)
    // For now, we'll extract from request parameters
    const params = request.params as any;
    if (params.organizationId) {
      context.organizationId = params.organizationId;
    }
    
    return context;
  }
  // Extract team context
  teamContext: async (request: FastifyRequest): Promise<PermissionContext> => {
    const user = (request.user as any);
    const params = request.params as any;
    
    return {
      userId: user.id,
      teamId: params.teamId,
      organizationId: params.organizationId
    };
  }
  // Extract resource ownership context
  resourceOwnership: async (request: FastifyRequest): Promise<PermissionContext> => {
    const user = (request.user as any);
    const params = request.params as any;
    
    return {
      userId: user.id,
      resourceId: params.id || params.resourceId
    };
  }
};

// Type augmentation for Fastify to include permission methods
declare module 'fastify' {
  interface FastifyInstance {
    requirePermission: ReturnType<typeof createPermissionAuthMiddleware>;
    hasPermission: (userId: string, resource: string, action: string, context?: PermissionContext) => Promise<boolean>;
    getUserPermissions: (userId: string) => Promise<any[]>;
    getUserRoles: (userId: string) => Promise<any[]>;
}
}
  }
}