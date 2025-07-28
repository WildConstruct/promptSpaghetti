/**
 * Temporary Permissions Service (Epic 17)
 * 
 * DEPLOYMENT BLOCKER FIX: Implements time-limited permission grants with automatic expiration.
 * Supports temporary role assignments, direct permission grants, and automated cleanup.
 * 
 * Features:
 * - Time-limited role assignments
 * - Direct temporary permissions (bypassing roles)
 * - Automatic expiration handling
 * - Emergency access grants
 * - Escalation workflows
 * - Audit trail for all temporary permissions
 */

import { AuthConfig, Role, Permission, UserRole } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from './AuditService';
import { RBACService } from './RBACService';

}
export interface TemporaryRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  grantedBy: string;
  reason: string;
  grantedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'revoked';
  revokedBy?: string;
  revokedAt?: Date;
  revokeReason?: string;
  scopeContext?: Record<string, any>;
  autoRevoke: boolean;
  notificationSent: boolean;
}
}

}
export interface DirectPermissionGrant {
  id: string;
  userId: string;
  resource: string;
  action: string;
  scope: 'global' | 'organization' | 'team' | 'own';
  conditions?: Record<string, any>;
  grantedBy: string;
  reason: string;
  grantedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'revoked';
  revokedBy?: string;
  revokedAt?: Date;
  revokeReason?: string;
  scopeContext?: Record<string, any>;
  autoRevoke: boolean;
  notificationSent: boolean;
}
}

}
export interface TemporaryPermissionRequest {
  userId: string;
  roleId?: string;
  directPermissions?: {
    resource: string;
    action: string;
    scope: 'global' | 'organization' | 'team' | 'own';
    conditions?: Record<string, any>;
}
  }[];
  reason: string;
  duration: number; // Duration in hours
  requestedBy: string;
  emergencyAccess?: boolean;
  approvalRequired?: boolean;
  scopeContext?: Record<string, any>;
}

}
export interface EmergencyAccessGrant {
  id: string;
  userId: string;
  grantedBy: string;
  reason: string;
  permissions: string[]; // Array of "resource:action" strings
  grantedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'revoked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  incidentId?: string;
  reviewRequired: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
}
}

}
export interface PermissionEscalation {
  id: string;
  userId: string;
  fromRoleId?: string;
  toRoleId: string;
  escalatedBy: string;
  reason: string;
  escalatedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'revoked' | 'downgraded';
  originalExpiresAt?: Date;
  autoDowngrade: boolean;
  notificationsSent: string[];
}
}

export class TemporaryPermissionsService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private auditService: AuditService;
  private rbacService: RBACService;

  // Cleanup interval for expired permissions
  private cleanupInterval?: NodeJS.Timeout;

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

    // Start automatic cleanup process
    this.startAutomaticCleanup();
  }

  /**
   * Grant temporary role assignment to a user
   */
  async grantTemporaryRole(
    request: TemporaryPermissionRequest,
    context: { ipAddress?: string; userAgent?: string; sessionId?: string } = {}
  ): Promise<TemporaryRoleAssignment> {

    if (!request.roleId) {
      throw new Error('Role ID is required for temporary role assignment');
    }

    const assignmentId = require('crypto').randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (request.duration * 60 * 60 * 1000));

    try {
      // Verify role exists
      const roleExists = await this.dbService.query(
        'SELECT id FROM roles WHERE id = $1',
        [request.roleId]
      );
      
      if (roleExists.rows.length === 0) {
        throw new Error(`Role ${request.roleId} not found`);
      }

      // Create temporary role assignment record
      await this.dbService.query(`
        INSERT INTO temporary_role_assignments (
          id, user_id, role_id, granted_by, reason, granted_at, expires_at,
          status, scope_context, auto_revoke, notification_sent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        assignmentId,
        request.userId,
        request.roleId,
        request.requestedBy,
        request.reason,
        now,
        expiresAt,
        'active',
        request.scopeContext ? JSON.stringify(request.scopeContext) : null,
        true,
        false
      ]);

      // Use RBACService to assign the actual role
      await this.rbacService.assignRole({
        userId: request.userId,
        roleId: request.roleId,
        grantedBy: request.requestedBy,
        expiresAt: expiresAt,
        scopeContext: request.scopeContext
      }, context);

      // Log audit event
      await this.auditService.logAction({
        action: 'temporary_role_granted',
        userId: request.requestedBy,
        resourceType: 'user_roles',
        resourceId: request.userId,
        details: {
          roleId: request.roleId,
          duration: request.duration,
          reason: request.reason,
          expiresAt: expiresAt.toISOString(),
          emergencyAccess: request.emergencyAccess || false
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: request.emergencyAccess ? 'warning' : 'info'
      });

      return {
        id: assignmentId,
        userId: request.userId,
        roleId: request.roleId,
        grantedBy: request.requestedBy,
        reason: request.reason,
        grantedAt: now,
        expiresAt: expiresAt,
        status: 'active',
        scopeContext: request.scopeContext,
        autoRevoke: true,
        notificationSent: false
      };

    } catch (error) {
      await this.auditService.logAction({
        action: 'temporary_role_grant_failed',
        userId: request.requestedBy,
        resourceType: 'user_roles',
        resourceId: request.userId,
        details: {
          roleId: request.roleId,
          reason: request.reason,
          error: error instanceof Error ? error.message : String(error)
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });
      throw error;
    }
  }

  /**
   * Grant direct temporary permissions without role assignment
   */
  async grantDirectPermissions(
    request: TemporaryPermissionRequest,
    context: { ipAddress?: string; userAgent?: string; sessionId?: string } = {}
  ): Promise<DirectPermissionGrant[]> {

    if (!request.directPermissions || request.directPermissions.length === 0) {
      throw new Error('Direct permissions are required for direct permission grant');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (request.duration * 60 * 60 * 1000));
    const grants: DirectPermissionGrant[] = [];

    const transaction = await this.dbService.beginTransaction();

    try {
      for (const permission of request.directPermissions) {
        const grantId = require('crypto').randomUUID();

        // Insert direct permission grant
        await transaction.query(`
          INSERT INTO direct_permission_grants (
            id, user_id, resource, action, scope, conditions, granted_by, reason,
            granted_at, expires_at, status, scope_context, auto_revoke, notification_sent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          grantId,
          request.userId,
          permission.resource,
          permission.action,
          permission.scope,
          permission.conditions ? JSON.stringify(permission.conditions) : null,
          request.requestedBy,
          request.reason,
          now,
          expiresAt,
          'active',
          request.scopeContext ? JSON.stringify(request.scopeContext) : null,
          true,
          false
        ]);

        grants.push({
          id: grantId,
          userId: request.userId,
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
          conditions: permission.conditions,
          grantedBy: request.requestedBy,
          reason: request.reason,
          grantedAt: now,
          expiresAt: expiresAt,
          status: 'active',
          scopeContext: request.scopeContext,
          autoRevoke: true,
          notificationSent: false
        });
      }

      await transaction.commit();

      // Log audit event
      await this.auditService.logAction({
        action: 'direct_permissions_granted',
        userId: request.requestedBy,
        resourceType: 'user_permissions',
        resourceId: request.userId,
        details: {
          permissions: request.directPermissions.map(p => `${p.resource}:${p.action}`),
          duration: request.duration,
          reason: request.reason,
          expiresAt: expiresAt.toISOString(),
          emergencyAccess: request.emergencyAccess || false
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: request.emergencyAccess ? 'warning' : 'info'
      });

      return grants;

    } catch (error) {
      await transaction.rollback();
      
      await this.auditService.logAction({
        action: 'direct_permissions_grant_failed',
        userId: request.requestedBy,
        resourceType: 'user_permissions',
        resourceId: request.userId,
        details: {
          permissions: request.directPermissions?.map(p => `${p.resource}:${p.action}`),
          reason: request.reason,
          error: error instanceof Error ? error.message : String(error)
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });
      
      throw error;
    }
  }

  /**
   * Grant emergency access with elevated permissions
   */
  async grantEmergencyAccess(
    userId: string,
    permissions: string[],
    reason: string,
    grantedBy: string,
    options: {
      duration?: number; // hours, default 4
      severity?: 'low' | 'medium' | 'high' | 'critical';
      incidentId?: string;
      reviewRequired?: boolean;
    } = {},
    context: { ipAddress?: string; userAgent?: string; sessionId?: string } = {}
  ): Promise<EmergencyAccessGrant> {

    const duration = options.duration || 4; // Default 4 hours for emergency access
    const severity = options.severity || 'high';
    const reviewRequired = options.reviewRequired !== false; // Default to true
    
    const grantId = require('crypto').randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (duration * 60 * 60 * 1000));

    try {
      // Create emergency access grant record
      await this.dbService.query(`
        INSERT INTO emergency_access_grants (
          id, user_id, granted_by, reason, permissions, granted_at, expires_at,
          status, severity, incident_id, review_required
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        grantId,
        userId,
        grantedBy,
        reason,
        JSON.stringify(permissions),
        now,
        expiresAt,
        'active',
        severity,
        options.incidentId,
        reviewRequired
      ]);

      // Log critical audit event
      await this.auditService.logAction({
        action: 'emergency_access_granted',
        userId: grantedBy,
        resourceType: 'emergency_access',
        resourceId: userId,
        details: {
          permissions,
          duration,
          reason,
          severity,
          incidentId: options.incidentId,
          reviewRequired,
          expiresAt: expiresAt.toISOString()
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'critical'
      });

      return {
        id: grantId,
        userId,
        grantedBy,
        reason,
        permissions,
        grantedAt: now,
        expiresAt,
        status: 'active',
        severity,
        incidentId: options.incidentId,
        reviewRequired
      };

    } catch (error) {
      await this.auditService.logAction({
        action: 'emergency_access_grant_failed',
        userId: grantedBy,
        resourceType: 'emergency_access',
        resourceId: userId,
        details: {
          permissions,
          reason,
          error: error instanceof Error ? error.message : String(error)
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'critical'
      });
      
      throw error;
    }
  }

  /**
   * Revoke temporary permissions before expiration
   */
  async revokeTemporaryPermissions(
    grantId: string,
    revokedBy: string,
    reason: string,
    context: { ipAddress?: string; userAgent?: string; sessionId?: string } = {}
  ): Promise<void> {

    const now = new Date();

    try {
      // Try to revoke temporary role assignment
      const roleResult = await this.dbService.query(`
        UPDATE temporary_role_assignments 
        SET status = 'revoked', revoked_by = $1, revoked_at = $2, revoke_reason = $3
        WHERE id = $4 AND status = 'active'
        RETURNING user_id, role_id
      `, [revokedBy, now, reason, grantId]);

      if (roleResult.rows.length > 0) {
        const { user_id: userId, role_id: roleId } = roleResult.rows[0];
        
        // Revoke the actual role assignment
        await this.dbService.query(`
          UPDATE user_roles 
          SET expires_at = $1 
          WHERE user_id = $2 AND role_id = $3 AND (expires_at IS NULL OR expires_at > $1)
        `, [now, userId, roleId]);

        await this.auditService.logAction({
          action: 'temporary_role_revoked',
          userId: revokedBy,
          resourceType: 'user_roles',
          resourceId: userId,
          details: {
            grantId,
            roleId,
            reason,
            revokedAt: now.toISOString()
  }
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          severity: 'warning'
        });
        return;
      }

      // Try to revoke direct permission grants
      const permResult = await this.dbService.query(`
        UPDATE direct_permission_grants 
        SET status = 'revoked', revoked_by = $1, revoked_at = $2, revoke_reason = $3
        WHERE id = $4 AND status = 'active'
        RETURNING user_id, resource, action
      `, [revokedBy, now, reason, grantId]);

      if (permResult.rows.length > 0) {
        const { user_id: userId, resource, action } = permResult.rows[0];

        await this.auditService.logAction({
          action: 'direct_permission_revoked',
          userId: revokedBy,
          resourceType: 'user_permissions',
          resourceId: userId,
          details: {
            grantId,
            permission: `${resource}:${action}`,
            reason,
            revokedAt: now.toISOString()
  }
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          severity: 'warning'
        });
        return;
      }

      // Try to revoke emergency access
      const emergencyResult = await this.dbService.query(`
        UPDATE emergency_access_grants 
        SET status = 'revoked'
        WHERE id = $1 AND status = 'active'
        RETURNING user_id, permissions
      `, [grantId]);

      if (emergencyResult.rows.length > 0) {
        const { user_id: userId, permissions } = emergencyResult.rows[0];

        await this.auditService.logAction({
          action: 'emergency_access_revoked',
          userId: revokedBy,
          resourceType: 'emergency_access',
          resourceId: userId,
          details: {
            grantId,
            permissions: JSON.parse(permissions),
            reason,
            revokedAt: now.toISOString()
  }
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          severity: 'critical'
        });
        return;
      }

      throw new Error(`Permission grant ${grantId} not found or already revoked`);

    } catch (error) {
      await this.auditService.logAction({
        action: 'permission_revocation_failed',
        userId: revokedBy,
        resourceType: 'permissions',
        resourceId: grantId,
        details: {
          reason,
          error: error instanceof Error ? error.message : String(error)
  }
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        severity: 'error'
      });
      
      throw error;
    }
  }

  /**
   * Get all active temporary permissions for a user
   */
  async getUserTemporaryPermissions(userId: string): Promise<{
    roleAssignments: TemporaryRoleAssignment[];
    directGrants: DirectPermissionGrant[];
    emergencyAccess: EmergencyAccessGrant[];
  }> {

    const [roleResults, permResults, emergencyResults] = await Promise.all([
      this.dbService.query(`
        SELECT * FROM temporary_role_assignments 
        WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
        ORDER BY granted_at DESC
      `, [userId]),
      
      this.dbService.query(`
        SELECT * FROM direct_permission_grants 
        WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
        ORDER BY granted_at DESC
      `, [userId]),
      
      this.dbService.query(`
        SELECT * FROM emergency_access_grants 
        WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
        ORDER BY granted_at DESC
      `, [userId])
    ]);

    return {
      roleAssignments: roleResults.rows.map(this.mapTemporaryRoleAssignment),
      directGrants: permResults.rows.map(this.mapDirectPermissionGrant),
      emergencyAccess: emergencyResults.rows.map(this.mapEmergencyAccessGrant)
    };
  }

  /**
   * Start automatic cleanup process for expired permissions
   */
  private startAutomaticCleanup(): void {
    // Run cleanup every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredPermissions().catch(error => {
        console.error('Failed to cleanup expired permissions:', error);
      });
    }, 15 * 60 * 1000);

    // Run initial cleanup
    this.cleanupExpiredPermissions().catch(error => {
      console.error('Failed to run initial permission cleanup:', error);
    });
  }

  /**
   * Clean up expired permissions
   */
  private async cleanupExpiredPermissions(): Promise<void> {

    const now = new Date();

    try {
      // Mark expired temporary role assignments
      const expiredRoles = await this.dbService.query(`
        UPDATE temporary_role_assignments 
        SET status = 'expired' 
        WHERE status = 'active' AND expires_at <= $1
        RETURNING id, user_id, role_id
      `, [now]);

      // Mark expired direct permission grants  
      const expiredPerms = await this.dbService.query(`
        UPDATE direct_permission_grants 
        SET status = 'expired' 
        WHERE status = 'active' AND expires_at <= $1
        RETURNING id, user_id, resource, action
      `, [now]);

      // Mark expired emergency access grants
      const expiredEmergency = await this.dbService.query(`
        UPDATE emergency_access_grants 
        SET status = 'expired' 
        WHERE status = 'active' AND expires_at <= $1
        RETURNING id, user_id, permissions
      `, [now]);

      // Log cleanup activity
      if (expiredRoles.rows.length > 0 || expiredPerms.rows.length > 0 || expiredEmergency.rows.length > 0) {
        await this.auditService.logAction({
          action: 'temporary_permissions_cleanup',
          details: {
            expiredRoleAssignments: expiredRoles.rows.length,
            expiredDirectGrants: expiredPerms.rows.length,
            expiredEmergencyAccess: expiredEmergency.rows.length,
            cleanupAt: now.toISOString()
  }
          severity: 'info'
        });
      }

    } catch (error) {
      console.error('Error during permission cleanup:', error);
      
      await this.auditService.logAction({
        action: 'permission_cleanup_failed',
        details: {
          error: error instanceof Error ? error.message : String(error),
          cleanupAt: now.toISOString()
  }
        severity: 'error'
      });
    }
  }

  /**
   * Stop automatic cleanup process
   */
  stopAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  // Database mapping helpers
  private mapTemporaryRoleAssignment(row: any): TemporaryRoleAssignment {
    return {
      id: row.id,
      userId: row.user_id,
      roleId: row.role_id,
      grantedBy: row.granted_by,
      reason: row.reason,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      status: row.status,
      revokedBy: row.revoked_by,
      revokedAt: row.revoked_at,
      revokeReason: row.revoke_reason,
      scopeContext: row.scope_context ? JSON.parse(row.scope_context) : undefined,
      autoRevoke: row.auto_revoke,
      notificationSent: row.notification_sent
    };
  }

  private mapDirectPermissionGrant(row: any): DirectPermissionGrant {
    return {
      id: row.id,
      userId: row.user_id,
      resource: row.resource,
      action: row.action,
      scope: row.scope,
      conditions: row.conditions ? JSON.parse(row.conditions) : undefined,
      grantedBy: row.granted_by,
      reason: row.reason,
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      status: row.status,
      revokedBy: row.revoked_by,
      revokedAt: row.revoked_at,
      revokeReason: row.revoke_reason,
      scopeContext: row.scope_context ? JSON.parse(row.scope_context) : undefined,
      autoRevoke: row.auto_revoke,
      notificationSent: row.notification_sent
    };
  }

  private mapEmergencyAccessGrant(row: any): EmergencyAccessGrant {
    return {
      id: row.id,
      userId: row.user_id,
      grantedBy: row.granted_by,
      reason: row.reason,
      permissions: JSON.parse(row.permissions),
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
      status: row.status,
      severity: row.severity,
      incidentId: row.incident_id,
      reviewRequired: row.review_required,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at
    };
  }
}