/**
 * Direct Permission Service (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: Implements immediate permission assignment system.
 * Supports direct permission grants that bypass traditional role-based assignments.
 * 
 * Features:
 * - Direct permission assignment without roles
 * - Immediate effect permissions 
 * - Permanent and temporary grant options
 * - Fine-grained permission control
 * - Context-aware permission scoping
 * - Audit trail for all direct grants
 */

import { AuthConfig, Permission } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';

export interface DirectPermission {
  id: string;
  userId: string;
  resource: string;
  action: string;
  scope: 'global' | 'organization' | 'team' | 'own';
  conditions?: Record<string, any>;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date; // Optional expiration
  status: 'active' | 'expired' | 'revoked';
  revokedBy?: string;
  revokedAt?: Date;
  revokeReason?: string;
  scopeContext?: Record<string, any>;
  permanent: boolean;
}

export interface DirectPermissionGrant {
  userId: string;
  resource: string;
  action: string;
  scope: 'global' | 'organization' | 'team' | 'own';
  conditions?: Record<string, any>;
  expiresAt?: Date;
  scopeContext?: Record<string, any>;
  permanent?: boolean;
  reason: string;
}

export interface BulkPermissionGrant {
  userId: string;
  permissions: Omit<DirectPermissionGrant, 'userId'>[];
  reason: string;
}

export interface PermissionQuery {
  userId?: string;
  resource?: string;
  action?: string;
  scope?: 'global' | 'organization' | 'team' | 'own';
  status?: 'active' | 'expired' | 'revoked';
  permanent?: boolean;
  grantedBy?: string;
  expiringWithinHours?: number;
}

export class DirectPermissionService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private auditService: AuditService;

  constructor(config: AuthConfig, dbService: DatabaseService, auditService: AuditService) {
    this.config = config;
    this.dbService = dbService;
    this.auditService = auditService;
  }

  /**
   * Grant a direct permission to a user immediately
   */
  async grantDirectPermission(
    grant: DirectPermissionGrant,
    grantedBy: string,
    context: { ipAddress?: string; userAgent?: string; sessionId?: string } = {}
  ): Promise<DirectPermission> {
    const permissionId = require('crypto').randomUUID();
    const now = new Date();

    try {
      // Insert direct permission
      const result = await this.dbService.query(`
        INSERT INTO user_direct_permissions (
          id, user_id, resource, action, scope, conditions, granted_by, reason,
          granted_at, expires_at, status, scope_context, permanent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        permissionId,
        grant.userId,
        grant.resource,
        grant.action,
        grant.scope,
        grant.conditions ? JSON.stringify(grant.conditions) : null,
        grantedBy,
        grant.reason,
        now,
        grant.expiresAt,
        'active',
        grant.scopeContext ? JSON.stringify(grant.scopeContext) : null,
        grant.permanent !== false // Default to permanent if not specified
      ]);

      const directPermission = this.mapDirectPermission(result.rows[0]);

      // Log audit event
      await this.auditService.logAction({
        action: 'direct_permission_granted',
        userId: grantedBy,
        resourceType: 'user_permissions',
        resourceId: grant.userId,
        details: {
          permissionId,
          permission: `${grant.resource}:${grant.action}`,
          scope: grant.scope,
          permanent: grant.permanent !== false,
          reason: grant.reason,
          expiresAt: grant.expiresAt?.toISOString(),
          conditions: grant.conditions
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'info'
      });

      return directPermission;

    } catch (error) {
      await this.auditService.logAction({
        action: 'direct_permission_grant_failed',
        userId: grantedBy,
        resourceType: 'user_permissions',
        resourceId: grant.userId,
        details: {
          permission: `${grant.resource}:${grant.action}`,
          reason: grant.reason,
          error: error instanceof Error ? error.message : String(error)
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });
      
      throw error;
    }
  }

  /**
   * Grant multiple direct permissions in a single transaction
   */
  async grantBulkPermissions(
    bulkGrant: BulkPermissionGrant,
    grantedBy: string,
    context: { ipAddress?: string; userAgent?: string; sessionId?: string } = {}
  ): Promise<DirectPermission[]> {
    const now = new Date();
    const permissions: DirectPermission[] = [];

    const transaction = await this.dbService.beginTransaction();

    try {
      for (const permissionGrant of bulkGrant.permissions) {
        const permissionId = require('crypto').randomUUID();

        const result = await transaction.query(`
          INSERT INTO user_direct_permissions (
            id, user_id, resource, action, scope, conditions, granted_by, reason,
            granted_at, expires_at, status, scope_context, permanent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *
        `, [
          permissionId,
          bulkGrant.userId,
          permissionGrant.resource,
          permissionGrant.action,
          permissionGrant.scope,
          permissionGrant.conditions ? JSON.stringify(permissionGrant.conditions) : null,
          grantedBy,
          bulkGrant.reason,
          now,
          permissionGrant.expiresAt,
          'active',
          permissionGrant.scopeContext ? JSON.stringify(permissionGrant.scopeContext) : null,
          permissionGrant.permanent !== false
        ]);

        permissions.push(this.mapDirectPermission(result.rows[0]));
      }

      await transaction.commit();

      // Log audit event
      await this.auditService.logAction({
        action: 'bulk_direct_permissions_granted',
        userId: grantedBy,
        resourceType: 'user_permissions',
        resourceId: bulkGrant.userId,
        details: {
          permissionCount: bulkGrant.permissions.length,
          permissions: bulkGrant.permissions.map(p => `${p.resource}:${p.action}`),
          reason: bulkGrant.reason,
          permanentGrants: bulkGrant.permissions.filter(p => p.permanent !== false).length
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'info'
      });

      return permissions;

    } catch (error) {
      await transaction.rollback();
      
      await this.auditService.logAction({
        action: 'bulk_direct_permissions_grant_failed',
        userId: grantedBy,
        resourceType: 'user_permissions',
        resourceId: bulkGrant.userId,
        details: {
          permissionCount: bulkGrant.permissions.length,
          reason: bulkGrant.reason,
          error: error instanceof Error ? error.message : String(error)
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });
      
      throw error;
    }
  }

  /**
   * Revoke a direct permission
   */
  async revokeDirectPermission(
    permissionId: string,
    revokedBy: string,
    reason: string,
    context: { ipAddress?: string; userAgent?: string; sessionId?: string } = {}
  ): Promise<void> {
    const now = new Date();

    try {
      const result = await this.dbService.query(`
        UPDATE user_direct_permissions 
        SET status = 'revoked', revoked_by = $1, revoked_at = $2, revoke_reason = $3
        WHERE id = $4 AND status = 'active'
        RETURNING user_id, resource, action, permanent
      `, [revokedBy, now, reason, permissionId]);

      if (result.rows.length === 0) {
        throw new Error(`Direct permission ${permissionId} not found or already revoked`);
      }

      const { user_id: userId, resource, action, permanent } = result.rows[0];

      await this.auditService.logAction({
        action: 'direct_permission_revoked',
        userId: revokedBy,
        resourceType: 'user_permissions',
        resourceId: userId,
        details: {
          permissionId,
          permission: `${resource}:${action}`,
          reason,
          permanent,
          revokedAt: now.toISOString()
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'warning'
      });

    } catch (error) {
      await this.auditService.logAction({
        action: 'direct_permission_revocation_failed',
        userId: revokedBy,
        resourceType: 'user_permissions',
        resourceId: permissionId,
        details: {
          reason,
          error: error instanceof Error ? error.message : String(error)
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });
      
      throw error;
    }
  }

  /**
   * Get user's direct permissions
   */
  async getUserDirectPermissions(userId: string, activeOnly: boolean = true): Promise<DirectPermission[]> {
    let query = `
      SELECT * FROM user_direct_permissions 
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    if (activeOnly) {
      query += ` AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW())`;
    }

    query += ` ORDER BY granted_at DESC`;

    const result = await this.dbService.query(query, params);
    return result.rows.map(this.mapDirectPermission);
  }

  /**
   * Check if user has a specific direct permission
   */
  async hasDirectPermission(
    userId: string,
    resource: string,
    action: string,
    scopeContext?: Record<string, any>
  ): Promise<boolean> {
    let query = `
      SELECT id FROM user_direct_permissions 
      WHERE user_id = $1 AND resource = $2 AND action = $3 
        AND status = 'active' 
        AND (expires_at IS NULL OR expires_at > NOW())
    `;
    const params = [userId, resource, action];

    // Add scope context filtering if provided
    if (scopeContext) {
      query += ` AND (scope_context IS NULL OR scope_context @> $4::jsonb)`;
      params.push(JSON.stringify(scopeContext));
    }

    const result = await this.dbService.query(query, params);
    return result.rows.length > 0;
  }

  /**
   * Search and filter direct permissions
   */
  async queryDirectPermissions(
    query: PermissionQuery,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ permissions: DirectPermission[]; totalCount: number }> {
    let sqlQuery = 'SELECT * FROM user_direct_permissions WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM user_direct_permissions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE clauses
    const conditions: string[] = [];

    if (query.userId) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(query.userId);
      paramIndex++;
    }

    if (query.resource) {
      conditions.push(`resource = $${paramIndex}`);
      params.push(query.resource);
      paramIndex++;
    }

    if (query.action) {
      conditions.push(`action = $${paramIndex}`);
      params.push(query.action);
      paramIndex++;
    }

    if (query.scope) {
      conditions.push(`scope = $${paramIndex}`);
      params.push(query.scope);
      paramIndex++;
    }

    if (query.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(query.status);
      paramIndex++;
    }

    if (query.permanent !== undefined) {
      conditions.push(`permanent = $${paramIndex}`);
      params.push(query.permanent);
      paramIndex++;
    }

    if (query.grantedBy) {
      conditions.push(`granted_by = $${paramIndex}`);
      params.push(query.grantedBy);
      paramIndex++;
    }

    if (query.expiringWithinHours) {
      conditions.push(`expires_at IS NOT NULL AND expires_at <= $${paramIndex}`);
      const expirationThreshold = new Date(Date.now() + (query.expiringWithinHours * 60 * 60 * 1000));
      params.push(expirationThreshold);
      paramIndex++;
    }

    // Apply conditions
    if (conditions.length > 0) {
      const whereClause = ' AND ' + conditions.join(' AND ');
      sqlQuery += whereClause;
      countQuery += whereClause;
    }

    // Get total count
    const countResult = await this.dbService.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add ordering and pagination
    sqlQuery += ` ORDER BY granted_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.dbService.query(sqlQuery, params);
    const permissions = result.rows.map(this.mapDirectPermission);

    return { permissions, totalCount };
  }

  /**
   * Get permissions expiring soon
   */
  async getExpiringPermissions(withinHours: number = 24): Promise<DirectPermission[]> {
    const expirationThreshold = new Date(Date.now() + (withinHours * 60 * 60 * 1000));

    const result = await this.dbService.query(`
      SELECT * FROM user_direct_permissions 
      WHERE status = 'active' 
        AND expires_at IS NOT NULL 
        AND expires_at <= $1 
        AND expires_at > NOW()
      ORDER BY expires_at ASC
    `, [expirationThreshold]);

    return result.rows.map(this.mapDirectPermission);
  }

  /**
   * Clean up expired permissions
   */
  async cleanupExpiredPermissions(): Promise<number> {
    const result = await this.dbService.query(`
      UPDATE user_direct_permissions 
      SET status = 'expired' 
      WHERE status = 'active' 
        AND expires_at IS NOT NULL 
        AND expires_at <= NOW()
      RETURNING id
    `);

    const expiredCount = result.rows.length;

    if (expiredCount > 0) {
      await this.auditService.logAction({
        action: 'direct_permissions_expired',
        details: {
          expiredCount,
          cleanupAt: new Date().toISOString()
        },
        severity: 'info'
      });
    }

    return expiredCount;
  }

  /**
   * Get permission statistics
   */
  async getPermissionStatistics(): Promise<{
    totalActive: number;
    totalPermanent: number;
    totalTemporary: number;
    expiringWithin24Hours: number;
    byResource: Record<string, number>;
    byScope: Record<string, number>;
  }> {
    const [statsResult, resourceResult, scopeResult] = await Promise.all([
      this.dbService.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())) as total_active,
          COUNT(*) FILTER (WHERE status = 'active' AND permanent = true) as total_permanent,
          COUNT(*) FILTER (WHERE status = 'active' AND permanent = false AND expires_at > NOW()) as total_temporary,
          COUNT(*) FILTER (WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at <= NOW() + INTERVAL '24 hours' AND expires_at > NOW()) as expiring_24h
        FROM user_direct_permissions
      `),
      
      this.dbService.query(`
        SELECT resource, COUNT(*) as count
        FROM user_direct_permissions
        WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
        GROUP BY resource
        ORDER BY count DESC
      `),
      
      this.dbService.query(`
        SELECT scope, COUNT(*) as count
        FROM user_direct_permissions
        WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
        GROUP BY scope
        ORDER BY count DESC
      `)
    ]);

    const stats = statsResult.rows[0];
    const byResource: Record<string, number> = {};
    const byScope: Record<string, number> = {};

    resourceResult.rows.forEach(row => {
      byResource[row.resource] = parseInt(row.count);
    });

    scopeResult.rows.forEach(row => {
      byScope[row.scope] = parseInt(row.count);
    });

    return {
      totalActive: parseInt(stats.total_active),
      totalPermanent: parseInt(stats.total_permanent),
      totalTemporary: parseInt(stats.total_temporary),
      expiringWithin24Hours: parseInt(stats.expiring_24h),
      byResource,
      byScope
    };
  }

  /**
   * Map database row to DirectPermission object
   */
  private mapDirectPermission(row: any): DirectPermission {
    return {
      id: row.id,
      userId: row.user_id,
      resource: row.resource,
      action: row.action,
      scope: row.scope,
      conditions: row.conditions ? JSON.parse(row.conditions) : undefined,
      grantedBy: row.granted_by,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      status: row.status,
      revokedBy: row.revoked_by,
      revokedAt: row.revoked_at,
      revokeReason: row.revoke_reason,
      scopeContext: row.scope_context ? JSON.parse(row.scope_context) : undefined,
      permanent: row.permanent
    };
  }
}