// Epic 11.3 RBAC Routes
// HTTP routes for role and permission management

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthenticationService } from '../AuthenticationService';
import { RBACService } from '../services/RBACService';

// Role creation schema
const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  scope: z.enum(['global', 'organization', 'team']),
  organizationId: z.string().uuid().optional(),
  permissions: z.array(z.object({
    resource: z.string().min(1),
    action: z.string().min(1),
    scope: z.enum(['global', 'organization', 'team', 'own']),
    conditions: z.record(z.any()).optional()
  }))
});

// Role update schema
const updateRoleSchema = createRoleSchema.partial();

// Role assignment schema
const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  expiresAt: z.string().datetime().optional(),
  scopeContext: z.record(z.any()).optional()
});

// Role removal schema
const removeRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid()
});

// Permission check schema
const checkPermissionSchema = z.object({
  userId: z.string().uuid(),
  resource: z.string(),
  action: z.string(),
  context: z.object({
    organizationId: z.string().uuid().optional(),
    teamId: z.string().uuid().optional(),
    resourceId: z.string().uuid().optional()
  }).optional()
});



interface RBACRouteContext {
  authService: AuthenticationService;
  rbacService: RBACService;





export async function rbacRoutes(fastify: FastifyInstance, context: RBACRouteContext) {
  const { authService, rbacService } = context;

  // Get all roles with pagination and filtering
  fastify.get('/rbac/roles', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'roles', action: 'read' })
    ],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['global', 'organization', 'team'] },
          organizationId: { type: 'string', format: 'uuid' },
          search: { type: 'string' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'number', minimum: 0, default: 0 }


      response: {
        200: {
          type: 'object',
          properties: {
            roles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  scope: { type: 'string' },
                  organizationId: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' }



            total: { type: 'number' },
            pagination: {
              type: 'object',
              properties: {
                limit: { type: 'number' },
                offset: { type: 'number' },
                hasMore: { type: 'boolean' }






  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { scope, organizationId, search, limit = 50, offset = 0 } = request.query as any;

      const result = await rbacService.getRoles(
        { scope, organizationId, search },
        { limit, offset }
      );

      return reply.send({
        roles: result.roles,
        total: result.total,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < result.total

      });
 catch (error) {
      fastify.log.error('Get roles error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve roles'
      });

  });

  // Get role by ID with permissions
  fastify.get('/rbac/roles/:roleId', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'roles', action: 'read' })
    ],
    schema: {
      params: {
        type: 'object',
        properties: {
          roleId: { type: 'string', format: 'uuid' }

        required: ['roleId']

      response: {
        200: {
          type: 'object',
          properties: {
            role: { type: 'object' },
            permissions: { type: 'array' },
            assignedUsers: { type: 'array' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roleId } = request.params as { roleId: string };

      const [role, permissions, assignedUsers] = await Promise.all([
        rbacService.getRoleById(roleId),
        rbacService.getRolePermissions(roleId),
        rbacService.getUsersWithRole(roleId)
      ]);

      if (!role) {
        return reply.status(404).send({
          error: 'Role Not Found',
          message: 'Role not found'
        });


      return reply.send({
        role,
        permissions,
        assignedUsers
      });
 catch (error) {
      fastify.log.error('Get role error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve role'
      });

  });

  // Create new role
  fastify.post<{
    Body: z.infer<typeof createRoleSchema>;
>('/rbac/roles', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'roles', action: 'write' })
    ],
    schema: {
      body: createRoleSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            role: { type: 'object' },
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const roleData = request.body as z.infer<typeof createRoleSchema>;
      const userId = (request.user as any)?.id;

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        createdBy: userId
      };

      const role = await rbacService.createRole(roleData, context);

      return reply.status(201).send({
        role,
        message: 'Role created successfully'
      });
 catch (error) {
      fastify.log.error('Create role error:', error);
      return reply.status(400).send({
        error: 'Role Creation Failed',
        message: error.message || 'Failed to create role'
      });

  });

  // Update role
  fastify.put<{
    Body: z.infer<typeof updateRoleSchema>;
    Params: { roleId: string };
>('/rbac/roles/:roleId', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'roles', action: 'write' })
    ],
    schema: {
      params: {
        type: 'object',
        properties: {
          roleId: { type: 'string', format: 'uuid' }

        required: ['roleId']

      body: updateRoleSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            role: { type: 'object' },
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roleId } = request.params as { roleId: string };
      const updates = request.body as z.infer<typeof updateRoleSchema>;
      const userId = (request.user as any)?.id;

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        updatedBy: userId
      };

      const role = await rbacService.updateRole(roleId, updates, context);

      return reply.send({
        role,
        message: 'Role updated successfully'
      });
 catch (error) {
      fastify.log.error('Update role error:', error);
      return reply.status(400).send({
        error: 'Role Update Failed',
        message: error.message || 'Failed to update role'
      });

  });

  // Delete role
  fastify.delete('/rbac/roles/:roleId', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'roles', action: 'delete' })
    ],
    schema: {
      params: {
        type: 'object',
        properties: {
          roleId: { type: 'string', format: 'uuid' }

        required: ['roleId']

      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roleId } = request.params as { roleId: string };
      const userId = (request.user as any)?.id;

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        deletedBy: userId
      };

      await rbacService.deleteRole(roleId, context);

      return reply.send({
        message: 'Role deleted successfully'
      });
 catch (error) {
      fastify.log.error('Delete role error:', error);
      return reply.status(400).send({
        error: 'Role Deletion Failed',
        message: error.message || 'Failed to delete role'
      });

  });

  // Assign role to user
  fastify.post<{
    Body: z.infer<typeof assignRoleSchema>;
>('/rbac/assign-role', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'users', action: 'write' })
    ],
    schema: {
      body: assignRoleSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            assignment: { type: 'object' },
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const assignmentData = request.body as z.infer<typeof assignRoleSchema>;
      const grantedBy = (request.user as any)?.id;

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      };

      const assignment = await rbacService.assignRole(
        {
          ...assignmentData,
          grantedBy,
          expiresAt: assignmentData.expiresAt ? new Date(assignmentData.expiresAt) : undefined

        context
      );

      return reply.send({
        assignment,
        message: 'Role assigned successfully'
      });
 catch (error) {
      fastify.log.error('Assign role error:', error);
      return reply.status(400).send({
        error: 'Role Assignment Failed',
        message: error.message || 'Failed to assign role'
      });

  });

  // Remove role from user
  fastify.post<{
    Body: z.infer<typeof removeRoleSchema>;
>('/rbac/remove-role', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'users', action: 'write' })
    ],
    schema: {
      body: removeRoleSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId, roleId } = request.body as z.infer<typeof removeRoleSchema>;
      const removedBy = (request.user as any)?.id;

      const context = {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        removedBy
      };

      await rbacService.removeRole(userId, roleId, context);

      return reply.send({
        message: 'Role removed successfully'
      });
 catch (error) {
      fastify.log.error('Remove role error:', error);
      return reply.status(400).send({
        error: 'Role Removal Failed',
        message: error.message || 'Failed to remove role'
      });

  });

  // Get user roles and permissions
  fastify.get('/rbac/users/:userId/roles', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'users', action: 'read' })
    ],
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }

        required: ['userId']

      response: {
        200: {
          type: 'object',
          properties: {
            roles: { type: 'array' },
            permissions: { type: 'array' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as { userId: string };

      const [roles, permissions] = await Promise.all([
        rbacService.getUserRoles(userId),
        rbacService.getUserPermissions(userId)
      ]);

      return reply.send({
        roles,
        permissions
      });
 catch (error) {
      fastify.log.error('Get user roles error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user roles'
      });

  });

  // Check permission
  fastify.post<{
    Body: z.infer<typeof checkPermissionSchema>;
>('/rbac/check-permission', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'users', action: 'read' })
    ],
    schema: {
      body: checkPermissionSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            allowed: { type: 'boolean' },
            reason: { type: 'string' },
            matchingPermissions: { type: 'array' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId, resource, action, context: permContext } = request.body as z.infer<typeof checkPermissionSchema>;

      const result = await rbacService.checkPermission(
        userId,
        { resource, action },
        { userId, ...permContext }
      );

      return reply.send(result);
 catch (error) {
      fastify.log.error('Check permission error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to check permission'
      });

  });

  // Get RBAC statistics
  fastify.get('/rbac/stats', {
    preHandler: [
      fastify.authenticate,
      fastify.requirePermission({ resource: 'system', action: 'read' })
    ],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            totalRoles: { type: 'number' },
            rolesByScope: { type: 'object' },
            totalAssignments: { type: 'number' },
            recentAssignments: { type: 'number' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await rbacService.getRoleStats();
      return reply.send(stats);
 catch (error) {
      fastify.log.error('Get RBAC stats error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve RBAC statistics'
      });

  });

  // Get current user's permissions (for UI state management)
  fastify.get('/rbac/my-permissions', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            roles: { type: 'array' },
            permissions: { type: 'array' },
            permissionMap: { type: 'object' }




  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request.user as any)?.id;

      const [roles, permissions] = await Promise.all([
        rbacService.getUserRoles(userId),
        rbacService.getUserPermissions(userId)
      ]);

      // Create permission map for easier frontend checking
      const permissionMap: Record<string, boolean> = {};
      permissions.forEach(perm => {
        const key = `${perm.resource}:${perm.action}`;
        permissionMap[key] = true;
      });

      return reply.send({
        roles,
        permissions,
        permissionMap
      });
 catch (error) {
      fastify.log.error('Get my permissions error:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to retrieve permissions'
      });

  });
