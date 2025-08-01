/**
 * Role Cloning API Routes
 * 
 * Provides REST endpoints for role cloning operations:
 * - Clone existing roles with permission customization
 * - Get clone history and templates
 * - Validate clone requests
 * - Manage clone operations
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RoleCloneService, CloneRoleRequest } from '../admin/RoleCloneService';
import { DatabaseConnection } from '../database/connection';
import { AuditService } from '../auth/AuditService';
import { requirePermission } from '../middleware/auth';



interface CloneRoleBody {
  sourceRoleId: string;
  targetName: string;
  targetDescription: string;
  targetScope: 'global' | 'organization' | 'team';
  organizationId?: string;
  includePermissions: string[];
  excludePermissions?: string[];
  cloneMetadata?: {
    templateVersion?: string;
    customProperties?: Record<string, unknown>;



  };




interface RoleCloneHistoryParams {
  roleId: string;







interface RoleTemplatesQuery {
  organizationId?: string;
  limit?: string;







interface ValidateCloneBody {
  sourceRoleId: string;
  targetName: string;
  targetScope: string;
  organizationId?: string;
  includePermissions: string[];





export async function roleCloneRoutes(fastify: FastifyInstance) {
  const db = fastify.db as DatabaseConnection;
  const auditService = new AuditService(db);
  const roleCloneService = new RoleCloneService(db, auditService);

  /**
   * POST /api/roles/clone
   * Clone an existing role with specified configuration
   */
  fastify.post<{
    Body: CloneRoleBody;
>('/clone', {
    preHandler: requirePermission('perm_admin_roles'),
    schema: {
      body: {
        type: 'object',
        required: ['sourceRoleId', 'targetName', 'targetDescription', 'targetScope', 'includePermissions'],
        properties: {
          sourceRoleId: { type: 'string' },
          targetName: { type: 'string', minLength: 3, maxLength: 100 },
          targetDescription: { type: 'string', maxLength: 500 },
          targetScope: { type: 'string', enum: ['global', 'organization', 'team'] },
          organizationId: { type: 'string' },
          includePermissions: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1

          excludePermissions: {
            type: 'array',
            items: { type: 'string' }

          cloneMetadata: {
            type: 'object',
            properties: {
              templateVersion: { type: 'string' },
              customProperties: { type: 'object' }




      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            clonedRole: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                scope: { type: 'string' },
                permissions: {
                  type: 'array',
                  items: { type: 'string' }

                createdAt: { type: 'string' },
                metadata: { type: 'object' }


            warnings: {
              type: 'array',
              items: { type: 'string' }



        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            validationErrors: {
              type: 'array',
              items: { type: 'string' }





  }, async (request: FastifyRequest<{ Body: CloneRoleBody }>, reply: FastifyReply) => {
    try {
      const user = request.user;
      if (!user) {
        return reply.code(401).send({ success: false, error: 'User not authenticated' });


      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: request.body.sourceRoleId,
        targetName: request.body.targetName.trim(),
        targetDescription: request.body.targetDescription.trim(),
        targetScope: request.body.targetScope,
        organizationId: request.body.organizationId,
        includePermissions: request.body.includePermissions,
        excludePermissions: request.body.excludePermissions || [],
        cloneMetadata: request.body.cloneMetadata
      };

      const result = await roleCloneService.cloneRole(cloneRequest, user.id);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          clonedRole: result.clonedRole,
          warnings: result.warnings
        });
 else {
        return reply.code(400).send({
          success: false,
          error: result.error,
          validationErrors: result.validationErrors
        });

 catch (error) {
      request.log.error({ error }, 'Role clone operation failed');
      return reply.code(500).send({
        success: false,
        error: 'Internal server error during role cloning'
      });

  });

  /**
   * GET /api/roles/:roleId/clone-history
   * Get clone history for a specific role
   */
  fastify.get<{
    Params: RoleCloneHistoryParams;
>('/:roleId/clone-history', {
    preHandler: requirePermission('perm_admin_roles'),
    schema: {
      params: {
        type: 'object',
        required: ['roleId'],
        properties: {
          roleId: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            history: {
              type: 'object',
              properties: {
                roleId: { type: 'string' },
                cloneCount: { type: 'number' },
                clonedFrom: { type: 'string' },
                clonedTo: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      roleId: { type: 'string' },
                      roleName: { type: 'string' },
                      clonedAt: { type: 'string' },
                      clonedBy: { type: 'string' }



                templateUsage: {
                  type: 'object',
                  properties: {
                    timesUsedAsTemplate: { type: 'number' },
                    lastUsedAsTemplate: { type: 'string' }






        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }




  }, async (request: FastifyRequest<{ Params: RoleCloneHistoryParams }>, reply: FastifyReply) => {
    try {
      const { roleId } = request.params;
      const history = await roleCloneService.getRoleCloneHistory(roleId);

      if (!history) {
        return reply.code(404).send({
          success: false,
          error: 'Role not found or no clone history available'
        });


      return reply.code(200).send({
        success: true,
        history
      });
 catch (error) {
      request.log.error({ error }, 'Failed to get clone history');
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve clone history'
      });

  });

  /**
   * GET /api/roles/templates
   * Get roles that are commonly used as templates
   */
  fastify.get<{
    Querystring: RoleTemplatesQuery;
>('/templates', {
    preHandler: requirePermission('perm_admin_roles'),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          organizationId: { type: 'string' },
          limit: { type: 'string', pattern: '^[0-9]+$' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            templates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  scope: { type: 'string' },
                  permissions: {
                    type: 'array',
                    items: { type: 'string' }

                  metadata: {
                    type: 'object',
                    properties: {
                      cloneCount: { type: 'number' },
                      templateUsage: { type: 'object' }









  }, async (request: FastifyRequest<{ Querystring: RoleTemplatesQuery }>, reply: FastifyReply) => {
    try {
      const { organizationId, limit } = request.query;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      const templates = await roleCloneService.getRoleTemplates(organizationId, limitNum);

      return reply.code(200).send({
        success: true,
        templates
      });
 catch (error) {
      request.log.error({ error }, 'Failed to get role templates');
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve role templates'
      });

  });

  /**
   * POST /api/roles/validate-clone
   * Validate a clone request without actually performing the clone
   */
  fastify.post<{
    Body: ValidateCloneBody;
>('/validate-clone', {
    preHandler: requirePermission('perm_admin_roles'),
    schema: {
      body: {
        type: 'object',
        required: ['sourceRoleId', 'targetName', 'targetScope', 'includePermissions'],
        properties: {
          sourceRoleId: { type: 'string' },
          targetName: { type: 'string' },
          targetScope: { type: 'string', enum: ['global', 'organization', 'team'] },
          organizationId: { type: 'string' },
          includePermissions: {
            type: 'array',
            items: { type: 'string' }



      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            validation: {
              type: 'object',
              properties: {
                isValid: { type: 'boolean' },
                errors: {
                  type: 'array',
                  items: { type: 'string' }

                warnings: {
                  type: 'array',
                  items: { type: 'string' }

                conflicts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      permissionId: { type: 'string' },
                      description: { type: 'string' },
                      resolution: { type: 'string' }









  }, async (request: FastifyRequest<{ Body: ValidateCloneBody }>, reply: FastifyReply) => {
    try {
      const validateRequest = request.body;
      
      // Create a temporary clone request for validation
      const cloneRequest: CloneRoleRequest = {
        sourceRoleId: validateRequest.sourceRoleId,
        targetName: validateRequest.targetName,
        targetDescription: '', // Not needed for validation
        targetScope: validateRequest.targetScope as any,
        organizationId: validateRequest.organizationId,
        includePermissions: validateRequest.includePermissions,
        excludePermissions: []
      };

      // Get source role for validation
      const sourceRole = await roleCloneService['getRole'](validateRequest.sourceRoleId);
      if (!sourceRole) {
        return reply.code(400).send({
          success: false,
          validation: {
            isValid: false,
            errors: ['Source role not found'],
            warnings: [],
            conflicts: []

        });


      // Validate the request
      const validation = await roleCloneService['validateCloneRequest'](cloneRequest, sourceRole);
      
      // Check for permission conflicts
      const permissionResolution = await roleCloneService['resolvePermissionConflicts'](
        validateRequest.includePermissions,
        validateRequest.targetScope,
        validateRequest.organizationId
      );

      return reply.code(200).send({
        success: true,
        validation: {
          isValid: validation.isValid && permissionResolution.conflicts.length === 0,
          errors: validation.errors,
          warnings: validation.warnings,
          conflicts: permissionResolution.conflicts

      });
 catch (error) {
      request.log.error({ error }, 'Failed to validate clone request');
      return reply.code(500).send({
        success: false,
        error: 'Failed to validate clone request'
      });

  });

  /**
   * GET /api/roles/clone-operations
   * Get recent clone operations for monitoring and auditing
   */
  fastify.get('/clone-operations', {
    preHandler: requirePermission('perm_admin_roles'),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string', pattern: '^[0-9]+$' },
          offset: { type: 'string', pattern: '^[0-9]+$' },
          organizationId: { type: 'string' }


      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            operations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  operationId: { type: 'string' },
                  sourceRoleId: { type: 'string' },
                  sourceRoleName: { type: 'string' },
                  clonedRoleId: { type: 'string' },
                  clonedRoleName: { type: 'string' },
                  timestamp: { type: 'string' },
                  clonedBy: { type: 'string' },
                  permissionsCloned: { type: 'number' },
                  permissionsSkipped: { type: 'number' }



            total: { type: 'number' }




  }, async (request: FastifyRequest<{ 
    Querystring: { limit?: string; offset?: string; organizationId?: string } 
>, reply: FastifyReply) => {
    try {
      const { limit = '20', offset = '0', organizationId } = request.query;
      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      const query = `
        SELECT 
          co.operation_id,
          co.source_role_id,
          sr.name as source_role_name,
          co.cloned_role_id,
          cr.name as cloned_role_name,
          co.timestamp,
          co.cloned_by,
          co.permissions_cloned,
          co.permissions_skipped
        FROM clone_operations co
        JOIN roles sr ON co.source_role_id = sr.id
        JOIN roles cr ON co.cloned_role_id = cr.id
        WHERE (? IS NULL OR sr.organization_id = ? OR cr.organization_id = ?)
        ORDER BY co.timestamp DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM clone_operations co
        JOIN roles sr ON co.source_role_id = sr.id
        JOIN roles cr ON co.cloned_role_id = cr.id
        WHERE (? IS NULL OR sr.organization_id = ? OR cr.organization_id = ?)
      `;

      const [operations, countResult] = await Promise.all([
        db.query(query, [organizationId, organizationId, organizationId, limitNum, offsetNum]),
        db.query(countQuery, [organizationId, organizationId, organizationId])
      ]);

      return reply.code(200).send({
        success: true,
        operations: operations.map(op => ({
          operationId: op.operation_id,
          sourceRoleId: op.source_role_id,
          sourceRoleName: op.source_role_name,
          clonedRoleId: op.cloned_role_id,
          clonedRoleName: op.cloned_role_name,
          timestamp: op.timestamp.toISOString(),
          clonedBy: op.cloned_by,
          permissionsCloned: op.permissions_cloned,
          permissionsSkipped: op.permissions_skipped
        })),
        total: countResult[0].total
      });
 catch (error) {
      request.log.error({ error }, 'Failed to get clone operations');
      return reply.code(500).send({
        success: false,
        error: 'Failed to retrieve clone operations'
      });

  });


export default roleCloneRoutes;