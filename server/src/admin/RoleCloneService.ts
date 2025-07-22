/**
 * RoleCloneService - Backend service for role cloning operations
 * 
 * Provides secure role duplication with:
 * - Permission inheritance validation
 * - Scope compatibility checking
 * - Clone history tracking
 * - Audit trail integration
 * - Conflict resolution
 */

import { DatabaseConnection } from '../database/connection';
import { AuditService } from '../auth/AuditService';
import { Role, Permission, User } from '../auth/types';

export interface CloneRoleRequest {
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
}

export interface CloneRoleResponse {
  success: boolean;
  clonedRole?: Role;
  error?: string;
  validationErrors?: string[];
  warnings?: string[];
}

export interface CloneOperationResult {
  operationId: string;
  sourceRoleId: string;
  clonedRoleId: string;
  timestamp: Date;
  clonedBy: string;
  permissionsCloned: number;
  permissionsSkipped: string[];
  conflicts: CloneConflict[];
}

export interface CloneConflict {
  type: 'permission_scope_mismatch' | 'permission_not_found' | 'scope_incompatible' | 'organization_mismatch';
  permissionId?: string;
  description: string;
  resolution: 'skip' | 'adjust' | 'manual_review';
}

export interface RoleCloneHistory {
  roleId: string;
  cloneCount: number;
  clonedFrom?: string;
  clonedTo: Array<{
    roleId: string;
    roleName: string;
    clonedAt: Date;
    clonedBy: string;
  }>;
  templateUsage?: {
    timesUsedAsTemplate: number;
    lastUsedAsTemplate: Date;
  };
}

export class RoleCloneService {
  constructor(
    private db: DatabaseConnection,
    private auditService: AuditService
  ) {}

  /**
   * Clone an existing role with specified permissions and configuration
   */
  async cloneRole(request: CloneRoleRequest, clonedBy: string): Promise<CloneRoleResponse> {
    const operationId = `clone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Start transaction for atomic operation
      await this.db.beginTransaction();

      // Validate source role exists
      const sourceRole = await this.getRole(request.sourceRoleId);
      if (!sourceRole) {
        return {
          success: false,
          error: 'Source role not found'
        };
      }

      // Validate clone request
      const validation = await this.validateCloneRequest(request, sourceRole);
      if (!validation.isValid) {
        return {
          success: false,
          validationErrors: validation.errors,
          warnings: validation.warnings
        };
      }

      // Check for name conflicts
      const nameExists = await this.checkRoleNameExists(request.targetName, request.organizationId);
      if (nameExists) {
        return {
          success: false,
          error: 'Role name already exists in the specified scope'
        };
      }

      // Resolve permission conflicts
      const permissionResolution = await this.resolvePermissionConflicts(
        request.includePermissions,
        request.targetScope,
        request.organizationId
      );

      // Create the cloned role
      const clonedRole = await this.createClonedRole(
        sourceRole,
        request,
        permissionResolution.resolvedPermissions,
        clonedBy
      );

      // Update clone metadata for source role
      await this.updateCloneMetadata(sourceRole.id, clonedRole.id, clonedBy);

      // Create clone operation record
      const operationResult: CloneOperationResult = {
        operationId,
        sourceRoleId: sourceRole.id,
        clonedRoleId: clonedRole.id,
        timestamp: new Date(),
        clonedBy,
        permissionsCloned: permissionResolution.resolvedPermissions.length,
        permissionsSkipped: permissionResolution.skippedPermissions,
        conflicts: permissionResolution.conflicts
      };

      await this.recordCloneOperation(operationResult);

      // Audit the clone operation
      await this.auditService.logRoleClone({
        sourceRoleId: sourceRole.id,
        sourceRoleName: sourceRole.name,
        clonedRoleId: clonedRole.id,
        clonedRoleName: clonedRole.name,
        operationId,
        clonedBy,
        permissionsIncluded: permissionResolution.resolvedPermissions.length,
        permissionsSkipped: permissionResolution.skippedPermissions.length,
        organizationId: request.organizationId
      });

      await this.db.commitTransaction();

      return {
        success: true,
        clonedRole,
        warnings: validation.warnings
      };

    } catch (error) {
      await this.db.rollbackTransaction();
      
      await this.auditService.logError({
        operation: 'role_clone',
        operationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        context: {
          sourceRoleId: request.sourceRoleId,
          targetName: request.targetName,
          clonedBy
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clone role'
      };
    }
  }

  /**
   * Get clone history for a specific role
   */
  async getRoleCloneHistory(roleId: string): Promise<RoleCloneHistory | null> {
    try {
      const query = `
        SELECT 
          r.id,
          r.name,
          r.clone_count,
          r.cloned_from,
          co.cloned_role_id,
          co.timestamp,
          co.cloned_by,
          cr.name as cloned_role_name
        FROM roles r
        LEFT JOIN clone_operations co ON r.id = co.source_role_id
        LEFT JOIN roles cr ON co.cloned_role_id = cr.id
        WHERE r.id = ? OR r.cloned_from = ?
        ORDER BY co.timestamp DESC
      `;

      const results = await this.db.query(query, [roleId, roleId]);
      
      if (results.length === 0) {
        return null;
      }

      const role = results[0];
      const clonedTo = results
        .filter(r => r.cloned_role_id)
        .map(r => ({
          roleId: r.cloned_role_id,
          roleName: r.cloned_role_name,
          clonedAt: r.timestamp,
          clonedBy: r.cloned_by
        }));

      return {
        roleId: role.id,
        cloneCount: role.clone_count || 0,
        clonedFrom: role.cloned_from,
        clonedTo,
        templateUsage: {
          timesUsedAsTemplate: clonedTo.length,
          lastUsedAsTemplate: clonedTo.length > 0 ? clonedTo[0].clonedAt : new Date()
        }
      };

    } catch (error) {
      throw new Error(`Failed to get clone history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all roles that can be used as templates (commonly cloned roles)
   */
  async getRoleTemplates(organizationId?: string, limit: number = 10): Promise<Role[]> {
    try {
      const query = `
        SELECT r.*, 
               COALESCE(r.clone_count, 0) as template_usage_count
        FROM roles r
        WHERE (r.organization_id = ? OR r.scope = 'global')
          AND r.is_active = 1
          AND COALESCE(r.clone_count, 0) > 0
        ORDER BY r.clone_count DESC, r.created_at DESC
        LIMIT ?
      `;

      const results = await this.db.query(query, [organizationId, limit]);
      return results.map(this.mapDatabaseRowToRole);

    } catch (error) {
      throw new Error(`Failed to get role templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate clone request before processing
   */
  private async validateCloneRequest(
    request: CloneRoleRequest, 
    sourceRole: Role
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate target name
    if (!request.targetName.trim()) {
      errors.push('Target role name is required');
    } else if (request.targetName.length < 3) {
      errors.push('Target role name must be at least 3 characters');
    } else if (request.targetName.length > 100) {
      errors.push('Target role name must be less than 100 characters');
    }

    // Validate description
    if (!request.targetDescription.trim()) {
      warnings.push('Role description is empty - consider adding a description');
    }

    // Validate scope compatibility
    if (request.targetScope === 'global' && sourceRole.scope !== 'global') {
      warnings.push('Cloning non-global role to global scope - ensure permissions are appropriate');
    }

    // Validate organization context
    if (request.targetScope === 'organization' && !request.organizationId) {
      errors.push('Organization ID is required for organization-scoped roles');
    }

    // Validate permissions exist
    if (request.includePermissions.length === 0) {
      errors.push('At least one permission must be included in the clone');
    }

    // Check permission compatibility with target scope
    for (const permissionId of request.includePermissions) {
      const permission = await this.getPermission(permissionId);
      if (!permission) {
        errors.push(`Permission ${permissionId} not found`);
        continue;
      }

      // Check scope compatibility
      if (this.isPermissionScopeIncompatible(permission.scope, request.targetScope)) {
        warnings.push(
          `Permission "${permission.name}" has scope "${permission.scope}" which may be incompatible with target scope "${request.targetScope}"`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Resolve permission conflicts and scope issues
   */
  private async resolvePermissionConflicts(
    requestedPermissions: string[],
    targetScope: string,
    organizationId?: string
  ): Promise<{
    resolvedPermissions: string[];
    skippedPermissions: string[];
    conflicts: CloneConflict[];
  }> {
    const resolvedPermissions: string[] = [];
    const skippedPermissions: string[] = [];
    const conflicts: CloneConflict[] = [];

    for (const permissionId of requestedPermissions) {
      const permission = await this.getPermission(permissionId);
      
      if (!permission) {
        skippedPermissions.push(permissionId);
        conflicts.push({
          type: 'permission_not_found',
          permissionId,
          description: `Permission ${permissionId} not found`,
          resolution: 'skip'
        });
        continue;
      }

      // Check scope compatibility
      if (this.isPermissionScopeIncompatible(permission.scope, targetScope)) {
        // For now, skip incompatible permissions
        skippedPermissions.push(permissionId);
        conflicts.push({
          type: 'permission_scope_mismatch',
          permissionId,
          description: `Permission scope "${permission.scope}" incompatible with target scope "${targetScope}"`,
          resolution: 'skip'
        });
        continue;
      }

      // Check organization context for organization-scoped permissions
      if (permission.scope === 'organization' && !organizationId) {
        skippedPermissions.push(permissionId);
        conflicts.push({
          type: 'organization_mismatch',
          permissionId,
          description: 'Organization-scoped permission requires organization context',
          resolution: 'skip'
        });
        continue;
      }

      resolvedPermissions.push(permissionId);
    }

    return {
      resolvedPermissions,
      skippedPermissions,
      conflicts
    };
  }

  /**
   * Create the cloned role in the database
   */
  private async createClonedRole(
    sourceRole: Role,
    request: CloneRoleRequest,
    resolvedPermissions: string[],
    clonedBy: string
  ): Promise<Role> {
    const roleId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const clonedRole: Role = {
      id: roleId,
      name: request.targetName,
      description: request.targetDescription,
      permissions: resolvedPermissions,
      scope: request.targetScope,
      organizationId: request.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: clonedBy,
      isActive: true,
      metadata: {
        clonedFrom: sourceRole.id,
        cloneCount: 0,
        templateVersion: request.cloneMetadata?.templateVersion,
        customProperties: request.cloneMetadata?.customProperties
      }
    };

    // Insert role
    const insertRoleQuery = `
      INSERT INTO roles (
        id, name, description, scope, organization_id, created_by, is_active,
        cloned_from, clone_count, template_version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.query(insertRoleQuery, [
      roleId,
      request.targetName,
      request.targetDescription,
      request.targetScope,
      request.organizationId,
      clonedBy,
      1, // is_active
      sourceRole.id,
      0, // initial clone_count
      request.cloneMetadata?.templateVersion,
      new Date(),
      new Date()
    ]);

    // Insert role permissions
    if (resolvedPermissions.length > 0) {
      const permissionValues = resolvedPermissions.map(permId => `('${roleId}', '${permId}')`).join(', ');
      const insertPermissionsQuery = `
        INSERT INTO role_permissions (role_id, permission_id) VALUES ${permissionValues}
      `;
      await this.db.query(insertPermissionsQuery);
    }

    return clonedRole;
  }

  /**
   * Update clone metadata for the source role
   */
  private async updateCloneMetadata(sourceRoleId: string, clonedRoleId: string, clonedBy: string): Promise<void> {
    // Increment clone count for source role
    await this.db.query(
      'UPDATE roles SET clone_count = COALESCE(clone_count, 0) + 1 WHERE id = ?',
      [sourceRoleId]
    );
  }

  /**
   * Record the clone operation for auditing and history
   */
  private async recordCloneOperation(operation: CloneOperationResult): Promise<void> {
    const insertQuery = `
      INSERT INTO clone_operations (
        operation_id, source_role_id, cloned_role_id, timestamp, cloned_by,
        permissions_cloned, permissions_skipped, conflicts_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.query(insertQuery, [
      operation.operationId,
      operation.sourceRoleId,
      operation.clonedRoleId,
      operation.timestamp,
      operation.clonedBy,
      operation.permissionsCloned,
      operation.permissionsSkipped.length,
      JSON.stringify(operation.conflicts)
    ]);
  }

  /**
   * Helper method to check if permission scope is compatible with target role scope
   */
  private isPermissionScopeIncompatible(permissionScope: string, targetRoleScope: string): boolean {
    const scopeHierarchy = { 'global': 3, 'organization': 2, 'team': 1, 'own': 0 };
    
    const permLevel = scopeHierarchy[permissionScope] || 0;
    const roleLevel = scopeHierarchy[targetRoleScope] || 0;
    
    // Permission scope should not be higher than role scope
    return permLevel > roleLevel;
  }

  /**
   * Check if role name already exists
   */
  private async checkRoleNameExists(name: string, organizationId?: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM roles 
      WHERE name = ? AND (organization_id = ? OR scope = 'global') AND is_active = 1
    `;
    
    const result = await this.db.query(query, [name, organizationId]);
    return result[0].count > 0;
  }

  /**
   * Get role by ID
   */
  private async getRole(roleId: string): Promise<Role | null> {
    const query = `
      SELECT r.*, 
             GROUP_CONCAT(rp.permission_id) as permission_ids
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE r.id = ? AND r.is_active = 1
      GROUP BY r.id
    `;
    
    const results = await this.db.query(query, [roleId]);
    
    if (results.length === 0) {
      return null;
    }
    
    return this.mapDatabaseRowToRole(results[0]);
  }

  /**
   * Get permission by ID
   */
  private async getPermission(permissionId: string): Promise<Permission | null> {
    const query = `
      SELECT * FROM permissions WHERE id = ? AND is_active = 1
    `;
    
    const results = await this.db.query(query, [permissionId]);
    
    if (results.length === 0) {
      return null;
    }
    
    return this.mapDatabaseRowToPermission(results[0]);
  }

  /**
   * Map database row to Role object
   */
  private mapDatabaseRowToRole(row: any): Role {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: row.permission_ids ? row.permission_ids.split(',') : [],
      scope: row.scope,
      organizationId: row.organization_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      isActive: Boolean(row.is_active),
      metadata: {
        clonedFrom: row.cloned_from,
        cloneCount: row.clone_count || 0,
        templateVersion: row.template_version
      }
    };
  }

  /**
   * Map database row to Permission object
   */
  private mapDatabaseRowToPermission(row: any): Permission {
    return {
      id: row.id,
      name: row.name,
      resource: row.resource,
      action: row.action,
      scope: row.scope,
      description: row.description,
      category: row.category
    };
  }
}

export default RoleCloneService;