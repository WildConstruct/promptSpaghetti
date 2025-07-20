// Epic 11.3 RBAC Service
// Role-Based Access Control system with comprehensive permission management

import { AuthConfig, Role, Permission, UserRole, PermissionCheck, PermissionContext } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';

export interface CreateRoleData {
  name: string;
  description?: string;
  scope: 'global' | 'organization' | 'team';
  organizationId?: string;
  permissions: CreatePermissionData[];
}

export interface CreatePermissionData {
  resource: string;
  action: string;
  scope: 'global' | 'organization' | 'team' | 'own';
  conditions?: Record<string, any>;
}

export interface AssignRoleData {
  userId: string;
  roleId: string;
  grantedBy: string;
  expiresAt?: Date;
  scopeContext?: Record<string, any>;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  matchingPermissions?: Permission[];
}

export class RBACService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private auditService: AuditService;

  // Permission cache to improve performance
  private permissionCache: Map<string, { permissions: Permission[]; expiresAt: Date }> = new Map();
  private cacheTimeoutMs = 5 * 60 * 1000; // 5 minutes

  constructor(config: AuthConfig, dbService: DatabaseService, auditService: AuditService) {
    this.config = config;
    this.dbService = dbService;
    this.auditService = auditService;

    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), this.cacheTimeoutMs);
  }

  // Role Management
  async createRole(
    data: CreateRoleData,
    context: { ipAddress?: string; userAgent?: string; createdBy?: string } = {}
  ): Promise<Role> {
    const transaction = await this.dbService.beginTransaction();
    
    try {
      const roleId = require('crypto').randomUUID();
      const now = new Date();

      // Create role
      await transaction.query(`
        INSERT INTO roles (id, name, description, scope, organization_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [roleId, data.name, data.description, data.scope, data.organizationId, now, now]);

      // Create permissions
      for (const permData of data.permissions) {
        const permissionId = require('crypto').randomUUID();
        await transaction.query(`
          INSERT INTO permissions (id, role_id, resource, action, scope, conditions, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          permissionId,
          roleId,
          permData.resource,
          permData.action,
          permData.scope,
          permData.conditions ? JSON.stringify(permData.conditions) : null,
          now
        ]);
      }

      await transaction.commit();

      // Log role creation
      await this.auditService.logEvent({
        userId: context.createdBy,
        action: 'role_created',
        resourceType: 'role',
        resourceId: roleId,
        details: {
          roleName: data.name,
          scope: data.scope,
          organizationId: data.organizationId,
          permissionsCount: data.permissions.length
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      const role: Role = {
        id: roleId,
        name: data.name,
        description: data.description,
        scope: data.scope,
        organizationId: data.organizationId,
        createdAt: now,
        updatedAt: now
      };

      return role;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateRole(
    roleId: string,
    updates: Partial<CreateRoleData>,
    context: { ipAddress?: string; userAgent?: string; updatedBy?: string } = {}
  ): Promise<Role> {
    const transaction = await this.dbService.beginTransaction();
    
    try {
      const now = new Date();

      // Get existing role
      const existingResult = await transaction.query('SELECT * FROM roles WHERE id = $1', [roleId]);
      if (existingResult.rows.length === 0) {
        throw new Error('Role not found');
      }

      const existingRole = existingResult.rows[0];

      // Update role
      await transaction.query(`
        UPDATE roles 
        SET name = $1, description = $2, updated_at = $3
        WHERE id = $4
      `, [
        updates.name ?? existingRole.name,
        updates.description ?? existingRole.description,
        now,
        roleId
      ]);

      // Update permissions if provided
      if (updates.permissions) {
        // Delete existing permissions
        await transaction.query('DELETE FROM permissions WHERE role_id = $1', [roleId]);

        // Create new permissions
        for (const permData of updates.permissions) {
          const permissionId = require('crypto').randomUUID();
          await transaction.query(`
            INSERT INTO permissions (id, role_id, resource, action, scope, conditions, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            permissionId,
            roleId,
            permData.resource,
            permData.action,
            permData.scope,
            permData.conditions ? JSON.stringify(permData.conditions) : null,
            now
          ]);
        }
      }

      await transaction.commit();

      // Clear permission cache for affected users
      await this.clearUserPermissionCache(roleId);

      // Log role update
      await this.auditService.logEvent({
        userId: context.updatedBy,
        action: 'role_updated',
        resourceType: 'role',
        resourceId: roleId,
        details: {
          changes: updates,
          previousName: existingRole.name
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'info'
      });

      const updatedRole: Role = {
        id: roleId,
        name: updates.name ?? existingRole.name,
        description: updates.description ?? existingRole.description,
        scope: existingRole.scope,
        organizationId: existingRole.organization_id,
        createdAt: existingRole.created_at,
        updatedAt: now
      };

      return updatedRole;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteRole(
    roleId: string,
    context: { ipAddress?: string; userAgent?: string; deletedBy?: string } = {}
  ): Promise<void> {
    const transaction = await this.dbService.beginTransaction();
    
    try {
      // Get role info for audit
      const roleResult = await transaction.query('SELECT * FROM roles WHERE id = $1', [roleId]);
      if (roleResult.rows.length === 0) {
        throw new Error('Role not found');
      }

      const role = roleResult.rows[0];

      // Check if role is in use
      const userRoleResult = await transaction.query(
        'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
        [roleId]
      );
      
      const userCount = parseInt(userRoleResult.rows[0].count);
      if (userCount > 0) {
        throw new Error(`Cannot delete role. It is assigned to ${userCount} user(s).`);
      }

      // Delete permissions first
      await transaction.query('DELETE FROM permissions WHERE role_id = $1', [roleId]);

      // Delete role
      await transaction.query('DELETE FROM roles WHERE id = $1', [roleId]);

      await transaction.commit();

      // Log role deletion
      await this.auditService.logEvent({
        userId: context.deletedBy,
        action: 'role_deleted',
        resourceType: 'role',
        resourceId: roleId,
        details: {
          roleName: role.name,
          scope: role.scope
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        severity: 'warning'
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getRoles(
    filters: {
      scope?: 'global' | 'organization' | 'team';
      organizationId?: string;
      search?: string;
    } = {},
    pagination: { limit?: number; offset?: number } = {}
  ): Promise<{ roles: Role[]; total: number }> {
    const { limit = 50, offset = 0 } = pagination;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.scope) {
      whereClause += ` AND scope = $${paramIndex}`;
      params.push(filters.scope);
      paramIndex++;
    }

    if (filters.organizationId) {
      whereClause += ` AND organization_id = $${paramIndex}`;
      params.push(filters.organizationId);
      paramIndex++;
    }

    if (filters.search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await this.dbService.query(
      `SELECT COUNT(*) as total FROM roles ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get roles with pagination
    const rolesResult = await this.dbService.query(
      `SELECT * FROM roles ${whereClause} ORDER BY name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const roles = rolesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      organizationId: row.organization_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { roles, total };
  }

  async getRoleById(roleId: string): Promise<Role | null> {
    const result = await this.dbService.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      organizationId: row.organization_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const result = await this.dbService.query(
      'SELECT * FROM permissions WHERE role_id = $1 ORDER BY resource, action',
      [roleId]
    );

    return result.rows.map(row => ({
      id: row.id,
      roleId: row.role_id,
      resource: row.resource,
      action: row.action,
      scope: row.scope,
      conditions: row.conditions ? JSON.parse(row.conditions) : undefined,
      createdAt: row.created_at
    }));
  }

  // User Role Assignment
  async assignRole(
    data: AssignRoleData,
    context: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<UserRole> {
    const userRoleId = require('crypto').randomUUID();
    const now = new Date();

    await this.dbService.query(`
      INSERT INTO user_roles (id, user_id, role_id, granted_by, granted_at, expires_at, scope_context)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      userRoleId,
      data.userId,
      data.roleId,
      data.grantedBy,
      now,
      data.expiresAt,
      data.scopeContext ? JSON.stringify(data.scopeContext) : null
    ]);

    // Clear user permission cache
    this.clearUserPermissionCacheByUserId(data.userId);

    // Get role info for audit
    const role = await this.getRoleById(data.roleId);

    // Log role assignment
    await this.auditService.logEvent({
      userId: data.grantedBy,
      action: 'role_assigned',
      resourceType: 'user_role',
      resourceId: userRoleId,
      details: {
        targetUserId: data.userId,
        roleId: data.roleId,
        roleName: role?.name,
        expiresAt: data.expiresAt,
        scopeContext: data.scopeContext
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });

    return {
      id: userRoleId,
      userId: data.userId,
      roleId: data.roleId,
      grantedBy: data.grantedBy,
      grantedAt: now,
      expiresAt: data.expiresAt,
      scopeContext: data.scopeContext
    };
  }

  async removeRole(
    userId: string,
    roleId: string,
    context: { ipAddress?: string; userAgent?: string; removedBy?: string } = {}
  ): Promise<void> {
    const result = await this.dbService.query(`
      DELETE FROM user_roles 
      WHERE user_id = $1 AND role_id = $2
      RETURNING id
    `, [userId, roleId]);

    if (result.rows.length === 0) {
      throw new Error('User role assignment not found');
    }

    // Clear user permission cache
    this.clearUserPermissionCacheByUserId(userId);

    // Get role info for audit
    const role = await this.getRoleById(roleId);

    // Log role removal
    await this.auditService.logEvent({
      userId: context.removedBy,
      action: 'role_removed',
      resourceType: 'user_role',
      resourceId: result.rows[0].id,
      details: {
        targetUserId: userId,
        roleId,
        roleName: role?.name
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      severity: 'info'
    });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const result = await this.dbService.query(`
      SELECT r.* FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      ORDER BY r.name
    `, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      organizationId: row.organization_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // Permission Checking
  async checkPermission(
    userId: string,
    permission: PermissionCheck,
    context?: PermissionContext
  ): Promise<PermissionCheckResult> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      
      const matchingPermissions = userPermissions.filter(perm => 
        this.matchesPermission(perm, permission, context)
      );

      if (matchingPermissions.length === 0) {
        return {
          allowed: false,
          reason: `No permission found for ${permission.resource}:${permission.action}`
        };
      }

      // Check conditions for matching permissions
      for (const perm of matchingPermissions) {
        if (await this.evaluateConditions(perm, context)) {
          return {
            allowed: true,
            matchingPermissions: [perm]
          };
        }
      }

      return {
        allowed: false,
        reason: 'Permission conditions not met',
        matchingPermissions
      };
    } catch (error) {
      console.error('Permission check error:', error);
      return {
        allowed: false,
        reason: 'Permission check failed'
      };
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Check cache first
    const cacheKey = `user_permissions_${userId}`;
    const cached = this.permissionCache.get(cacheKey);
    
    if (cached && cached.expiresAt > new Date()) {
      return cached.permissions;
    }

    // Fetch from database
    const result = await this.dbService.query(`
      SELECT DISTINCT p.* FROM permissions p
      INNER JOIN roles r ON p.role_id = r.id
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      ORDER BY p.resource, p.action
    `, [userId]);

    const permissions = result.rows.map(row => ({
      id: row.id,
      roleId: row.role_id,
      resource: row.resource,
      action: row.action,
      scope: row.scope,
      conditions: row.conditions ? JSON.parse(row.conditions) : undefined,
      createdAt: row.created_at
    }));

    // Cache the result
    this.permissionCache.set(cacheKey, {
      permissions,
      expiresAt: new Date(Date.now() + this.cacheTimeoutMs)
    });

    return permissions;
  }

  // Helper Methods
  private matchesPermission(
    permission: Permission,
    check: PermissionCheck,
    context?: PermissionContext
  ): boolean {
    // Check resource match (exact or wildcard)
    if (permission.resource !== '*' && permission.resource !== check.resource) {
      return false;
    }

    // Check action match (exact or wildcard)
    if (permission.action !== '*' && permission.action !== check.action) {
      return false;
    }

    // Check scope
    if (!this.checkScope(permission, context)) {
      return false;
    }

    return true;
  }

  private checkScope(permission: Permission, context?: PermissionContext): boolean {
    switch (permission.scope) {
    case 'global':
      return true;
      
    case 'organization':
      return context?.organizationId !== undefined;
      
    case 'team':
      return context?.teamId !== undefined;
      
    case 'own':
      return context?.userId !== undefined && context?.resourceId !== undefined;
      
    default:
      return false;
    }
  }

  private async evaluateConditions(
    permission: Permission,
    context?: PermissionContext
  ): Promise<boolean> {
    if (!permission.conditions || Object.keys(permission.conditions).length === 0) {
      return true;
    }

    // Implement condition evaluation logic
    for (const [key, value] of Object.entries(permission.conditions)) {
      switch (key) {
      case 'ownResource':
        if (value && (!context?.userId || !context?.resourceId)) {
          return false;
        }
        break;
        
      case 'organizationMember':
        if (value && !context?.organizationId) {
          return false;
        }
        break;
        
      case 'teamMember':
        if (value && !context?.teamId) {
          return false;
        }
        break;
        
      default:
        // Custom condition evaluation can be added here
        break;
      }
    }

    return true;
  }

  private clearUserPermissionCacheByUserId(userId: string): void {
    const cacheKey = `user_permissions_${userId}`;
    this.permissionCache.delete(cacheKey);
  }

  private async clearUserPermissionCache(roleId: string): Promise<void> {
    // Get all users with this role
    const result = await this.dbService.query(
      'SELECT DISTINCT user_id FROM user_roles WHERE role_id = $1',
      [roleId]
    );

    // Clear cache for each user
    for (const row of result.rows) {
      this.clearUserPermissionCacheByUserId(row.user_id);
    }
  }

  private cleanupCache(): void {
    const now = new Date();
    for (const [key, value] of this.permissionCache.entries()) {
      if (value.expiresAt <= now) {
        this.permissionCache.delete(key);
      }
    }
  }

  // Utility Methods
  async getRoleStats(): Promise<{
    totalRoles: number;
    rolesByScope: Record<string, number>;
    totalAssignments: number;
    recentAssignments: number;
  }> {
    const [totalRolesResult, scopeStatsResult, totalAssignmentsResult, recentAssignmentsResult] = 
      await Promise.all([
        this.dbService.query('SELECT COUNT(*) as count FROM roles'),
        this.dbService.query('SELECT scope, COUNT(*) as count FROM roles GROUP BY scope'),
        this.dbService.query('SELECT COUNT(*) as count FROM user_roles WHERE expires_at IS NULL OR expires_at > NOW()'),
        this.dbService.query('SELECT COUNT(*) as count FROM user_roles WHERE granted_at > NOW() - INTERVAL \'7 days\'')
      ]);

    const rolesByScope: Record<string, number> = {};
    scopeStatsResult.rows.forEach(row => {
      rolesByScope[row.scope] = parseInt(row.count);
    });

    return {
      totalRoles: parseInt(totalRolesResult.rows[0].count),
      rolesByScope,
      totalAssignments: parseInt(totalAssignmentsResult.rows[0].count),
      recentAssignments: parseInt(recentAssignmentsResult.rows[0].count)
    };
  }

  async getUsersWithRole(roleId: string): Promise<any[]> {
    const result = await this.dbService.query(`
      SELECT u.id, u.email, ur.granted_at, ur.expires_at, ur.granted_by,
             up.display_name, up.first_name, up.last_name
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ur.role_id = $1 AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      ORDER BY ur.granted_at DESC
    `, [roleId]);

    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      firstName: row.first_name,
      lastName: row.last_name,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      grantedBy: row.granted_by
    }));
  }
}