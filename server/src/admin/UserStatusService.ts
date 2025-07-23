/**
 * User Status Service
 * Epic 17.3.1 - User Management Dashboard
 * Task: E17-1753114397016-18BAC3
 * 
 * Backend service for managing user account lifecycle states.
 * Provides status change operations, audit logging, and compliance features.
 */

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';

// User Status Types
export type UserStatus = 'active' | 'suspended' | 'deleted' | 'locked' | 'pending_activation';

export interface UserStatusInfo {
  userId: string;
  email: string;
  name: string;
  currentStatus: UserStatus;
  lastStatusChange?: string;
  statusChangedBy?: string;
  statusReason?: string;
  lockedUntil?: string;
  suspendedUntil?: string;
  loginAttempts?: number;
  lastLogin?: string;
  createdAt: string;
  roles: string[];
}

export interface StatusChangeRequest {
  userId: string;
  newStatus: UserStatus;
  reason: string;
  changedBy: string;
  changedByRole: string;
  expiresAt?: string;
  notifyUser?: boolean;
  bulkOperation?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface StatusChangeResult {
  success: boolean;
  userId: string;
  oldStatus: UserStatus;
  newStatus: UserStatus;
  effectiveAt: string;
  expiresAt?: string;
  auditLogId?: string;
  error?: string;
}

export interface StatusChangeAuditLog {
  id: string;
  userId: string;
  oldStatus: UserStatus;
  newStatus: UserStatus;
  reason: string;
  changedBy: string;
  changedByRole: string;
  timestamp: string;
  expiresAt?: string;
  ipAddress?: string;
  userAgent?: string;
  bulkOperationId?: string;
}

export interface StatusStatistics {
  totalUsers: number;
  byStatus: Record<UserStatus, number>;
  recentChanges: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  topChangeReasons: Array<{
    reason: string;
    count: number;
  }>;
  automatedVsManual: {
    automated: number;
    manual: number;
  };
}

export class UserStatusService {
  private database: DatabaseService;
  private auditService: AuditService;

  constructor(database: DatabaseService, auditService: AuditService) {
    this.database = database;
    this.auditService = auditService;
  }

  // Get user status information
  async getUserStatus(userId: string): Promise<UserStatusInfo | null> {
    try {
      const query = `
        SELECT 
          u.id as userId,
          u.email,
          COALESCE(u.first_name || ' ' || u.last_name, u.email) as name,
          u.status as currentStatus,
          u.status_changed_at as lastStatusChange,
          u.status_changed_by as statusChangedBy,
          u.status_reason as statusReason,
          u.locked_until as lockedUntil,
          u.suspended_until as suspendedUntil,
          u.failed_login_attempts as loginAttempts,
          u.last_login as lastLogin,
          u.created_at as createdAt,
          COALESCE(
            (SELECT jsonb_agg(ur.role_name) 
             FROM user_roles ur 
             WHERE ur.user_id = u.id), 
            '[]'::jsonb
          ) as roles
        FROM users u
        WHERE u.id = $1
      `;

      const result = await this.database.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        userId: row.userid,
        email: row.email,
        name: row.name,
        currentStatus: row.currentstatus,
        lastStatusChange: row.laststatuschange,
        statusChangedBy: row.statuschangedby,
        statusReason: row.statusreason,
        lockedUntil: row.lockeduntil,
        suspendedUntil: row.suspendeduntil,
        loginAttempts: row.loginattempts || 0,
        lastLogin: row.lastlogin,
        createdAt: row.createdat,
        roles: row.roles || []
      };
    } catch (error) {
      console.error('Error getting user status:', error);
      throw new Error('Failed to retrieve user status');
    }
  }

  // Get multiple users' status information
  async getUsersStatus(userIds?: string[], limit = 100, offset = 0): Promise<{
    users: UserStatusInfo[];
    totalCount: number;
  }> {
    try {
      let whereClause = '';
      const queryParams: any[] = [limit, offset];
      
      if (userIds && userIds.length > 0) {
        whereClause = 'WHERE u.id = ANY($3)';
        queryParams.push(userIds);
      }

      const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
      `;

      const dataQuery = `
        SELECT 
          u.id as userId,
          u.email,
          COALESCE(u.first_name || ' ' || u.last_name, u.email) as name,
          u.status as currentStatus,
          u.status_changed_at as lastStatusChange,
          u.status_changed_by as statusChangedBy,
          u.status_reason as statusReason,
          u.locked_until as lockedUntil,
          u.suspended_until as suspendedUntil,
          u.failed_login_attempts as loginAttempts,
          u.last_login as lastLogin,
          u.created_at as createdAt,
          COALESCE(
            (SELECT jsonb_agg(ur.role_name) 
             FROM user_roles ur 
             WHERE ur.user_id = u.id), 
            '[]'::jsonb
          ) as roles
        FROM users u
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const [countResult, dataResult] = await Promise.all([
        this.database.query(countQuery, userIds ? [userIds] : []),
        this.database.query(dataQuery, queryParams)
      ]);

      const users = dataResult.rows.map(row => ({
        userId: row.userid,
        email: row.email,
        name: row.name,
        currentStatus: row.currentstatus,
        lastStatusChange: row.laststatuschange,
        statusChangedBy: row.statuschangedby,
        statusReason: row.statusreason,
        lockedUntil: row.lockeduntil,
        suspendedUntil: row.suspendeduntil,
        loginAttempts: row.loginattempts || 0,
        lastLogin: row.lastlogin,
        createdAt: row.createdat,
        roles: row.roles || []
      }));

      return {
        users,
        totalCount: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error getting users status:', error);
      throw new Error('Failed to retrieve users status');
    }
  }

  // Change user status
  async changeUserStatus(request: StatusChangeRequest): Promise<StatusChangeResult> {
    const client = await this.database.getClient();
    
    try {
      await client.query('BEGIN');

      // Get current user status
      const currentStatusQuery = 'SELECT status FROM users WHERE id = $1';
      const currentStatusResult = await client.query(currentStatusQuery, [request.userId]);
      
      if (currentStatusResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const oldStatus = currentStatusResult.rows[0].status;
      
      // Validate status transition
      await this.validateStatusChange(oldStatus, request.newStatus, request.changedByRole);

      // Generate bulk operation ID for tracking
      const bulkOperationId = request.bulkOperation 
        ? `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        : undefined;

      // Update user status
      const updateQuery = `
        UPDATE users 
        SET 
          status = $1,
          status_changed_at = NOW(),
          status_changed_by = $2,
          status_reason = $3,
          locked_until = $4,
          suspended_until = $5
        WHERE id = $6
        RETURNING status_changed_at
      `;

      const updateParams = [
        request.newStatus,
        request.changedBy,
        request.reason,
        request.newStatus === 'locked' ? request.expiresAt : null,
        request.newStatus === 'suspended' ? request.expiresAt : null,
        request.userId
      ];

      const updateResult = await client.query(updateQuery, updateParams);
      const effectiveAt = updateResult.rows[0].status_changed_at;

      // Create audit log entry
      const auditLogId = await this.createStatusChangeAuditLog({
        userId: request.userId,
        oldStatus,
        newStatus: request.newStatus,
        reason: request.reason,
        changedBy: request.changedBy,
        changedByRole: request.changedByRole,
        timestamp: effectiveAt,
        expiresAt: request.expiresAt,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        bulkOperationId
      });

      // Log system audit event
      await this.auditService.logEvent({
        userId: request.changedBy,
        action: 'user_status_change',
        resourceType: 'user',
        resourceId: request.userId,
        details: {
          oldStatus,
          newStatus: request.newStatus,
          reason: request.reason,
          expiresAt: request.expiresAt,
          bulkOperation: request.bulkOperation,
          auditLogId
        },
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        severity: this.getStatusChangeSeverity(oldStatus, request.newStatus)
      });

      // Handle notification if requested
      if (request.notifyUser) {
        await this.scheduleUserNotification(request.userId, {
          type: 'status_change',
          oldStatus,
          newStatus: request.newStatus,
          reason: request.reason,
          expiresAt: request.expiresAt,
          changedBy: request.changedBy
        });
      }

      await client.query('COMMIT');

      return {
        success: true,
        userId: request.userId,
        oldStatus,
        newStatus: request.newStatus,
        effectiveAt,
        expiresAt: request.expiresAt,
        auditLogId
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error changing user status:', error);
      
      return {
        success: false,
        userId: request.userId,
        oldStatus: 'unknown' as UserStatus,
        newStatus: request.newStatus,
        effectiveAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      client.release();
    }
  }

  // Bulk status change
  async bulkChangeUserStatus(requests: StatusChangeRequest[]): Promise<StatusChangeResult[]> {
    const results: StatusChangeResult[] = [];
    const bulkOperationId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Process each request with bulk operation ID
    for (const request of requests) {
      const bulkRequest = {
        ...request,
        bulkOperation: true
      };

      const result = await this.changeUserStatus(bulkRequest);
      results.push(result);
    }

    // Log bulk operation summary
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    await this.auditService.logEvent({
      userId: requests[0]?.changedBy,
      action: 'bulk_user_status_change',
      resourceType: 'user_bulk',
      resourceId: bulkOperationId,
      details: {
        totalRequests: requests.length,
        successful: successCount,
        failed: failureCount,
        operations: results.map(r => ({
          userId: r.userId,
          success: r.success,
          oldStatus: r.oldStatus,
          newStatus: r.newStatus,
          error: r.error
        }))
      },
      severity: failureCount > 0 ? 'warning' : 'info'
    });

    return results;
  }

  // Get status change history for a user
  async getUserStatusHistory(userId: string, limit = 50): Promise<StatusChangeAuditLog[]> {
    try {
      const query = `
        SELECT 
          id,
          user_id as userId,
          old_status as oldStatus,
          new_status as newStatus,
          reason,
          changed_by as changedBy,
          changed_by_role as changedByRole,
          timestamp,
          expires_at as expiresAt,
          ip_address as ipAddress,
          user_agent as userAgent,
          bulk_operation_id as bulkOperationId
        FROM user_status_audit_log
        WHERE user_id = $1
        ORDER BY timestamp DESC
        LIMIT $2
      `;

      const result = await this.database.query(query, [userId, limit]);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.userid,
        oldStatus: row.oldstatus,
        newStatus: row.newstatus,
        reason: row.reason,
        changedBy: row.changedby,
        changedByRole: row.changedbyrole,
        timestamp: row.timestamp,
        expiresAt: row.expiresat,
        ipAddress: row.ipaddress,
        userAgent: row.useragent,
        bulkOperationId: row.bulkoperationid
      }));
    } catch (error) {
      console.error('Error getting user status history:', error);
      throw new Error('Failed to retrieve status history');
    }
  }

  // Get status statistics
  async getStatusStatistics(): Promise<StatusStatistics> {
    try {
      const queries = {
        statusCounts: `
          SELECT status, COUNT(*) as count 
          FROM users 
          GROUP BY status
        `,
        recentChanges: `
          SELECT 
            COUNT(*) FILTER (WHERE status_changed_at > NOW() - INTERVAL '24 hours') as last24Hours,
            COUNT(*) FILTER (WHERE status_changed_at > NOW() - INTERVAL '7 days') as last7Days,
            COUNT(*) FILTER (WHERE status_changed_at > NOW() - INTERVAL '30 days') as last30Days
          FROM users 
          WHERE status_changed_at IS NOT NULL
        `,
        topReasons: `
          SELECT reason, COUNT(*) as count
          FROM user_status_audit_log
          WHERE timestamp > NOW() - INTERVAL '30 days'
          GROUP BY reason
          ORDER BY count DESC
          LIMIT 10
        `,
        automatedVsManual: `
          SELECT 
            COUNT(*) FILTER (WHERE changed_by LIKE 'system_%') as automated,
            COUNT(*) FILTER (WHERE changed_by NOT LIKE 'system_%') as manual
          FROM user_status_audit_log
          WHERE timestamp > NOW() - INTERVAL '30 days'
        `
      };

      const [statusResult, changesResult, reasonsResult, automationResult] = await Promise.all([
        this.database.query(queries.statusCounts),
        this.database.query(queries.recentChanges),
        this.database.query(queries.topReasons),
        this.database.query(queries.automatedVsManual)
      ]);

      // Process status counts
      const byStatus: Record<UserStatus, number> = {
        active: 0,
        suspended: 0,
        deleted: 0,
        locked: 0,
        pending_activation: 0
      };

      let totalUsers = 0;
      statusResult.rows.forEach(row => {
        byStatus[row.status as UserStatus] = parseInt(row.count);
        totalUsers += parseInt(row.count);
      });

      // Process recent changes
      const recentChanges = changesResult.rows[0] || { last24hours: 0, last7days: 0, last30days: 0 };

      // Process top reasons
      const topChangeReasons = reasonsResult.rows.map(row => ({
        reason: row.reason,
        count: parseInt(row.count)
      }));

      // Process automation stats
      const automation = automationResult.rows[0] || { automated: 0, manual: 0 };

      return {
        totalUsers,
        byStatus,
        recentChanges: {
          last24Hours: parseInt(recentChanges.last24hours),
          last7Days: parseInt(recentChanges.last7days),
          last30Days: parseInt(recentChanges.last30days)
        },
        topChangeReasons,
        automatedVsManual: {
          automated: parseInt(automation.automated),
          manual: parseInt(automation.manual)
        }
      };
    } catch (error) {
      console.error('Error getting status statistics:', error);
      throw new Error('Failed to retrieve status statistics');
    }
  }

  // Process expired status locks/suspensions
  async processExpiredStatuses(): Promise<{ processed: number; errors: number }> {
    const client = await this.database.getClient();
    let processed = 0;
    let errors = 0;

    try {
      await client.query('BEGIN');

      // Find users with expired locks or suspensions
      const expiredQuery = `
        SELECT id, status, locked_until, suspended_until
        FROM users
        WHERE 
          (status = 'locked' AND locked_until < NOW()) OR
          (status = 'suspended' AND suspended_until < NOW())
      `;

      const expiredResult = await client.query(expiredQuery);

      for (const user of expiredResult.rows) {
        try {
          const statusChangeResult = await this.changeUserStatus({
            userId: user.id,
            newStatus: 'active',
            reason: `Automatic status restoration after ${user.status} period expired`,
            changedBy: 'system_status_processor',
            changedByRole: 'system',
            notifyUser: true
          });

          if (statusChangeResult.success) {
            processed++;
          } else {
            errors++;
            console.error(`Failed to restore user ${user.id}:`, statusChangeResult.error);
          }
        } catch (error) {
          errors++;
          console.error(`Error processing expired status for user ${user.id}:`, error);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing expired statuses:', error);
      throw error;
    } finally {
      client.release();
    }

    return { processed, errors };
  }

  // Private helper methods
  private async validateStatusChange(
    oldStatus: UserStatus, 
    newStatus: UserStatus, 
    changedByRole: string
  ): Promise<void> {
    // Super admins can make any status change
    if (changedByRole === 'super_admin') {
      return;
    }

    // Regular admins have restrictions
    if (changedByRole === 'admin') {
      if (newStatus === 'deleted') {
        throw new Error('Admins cannot permanently delete users');
      }
      if (oldStatus === 'deleted') {
        throw new Error('Admins cannot restore deleted users');
      }
      return;
    }

    // Other roles cannot make status changes
    throw new Error('Insufficient permissions for status change');
  }

  private async createStatusChangeAuditLog(log: Omit<StatusChangeAuditLog, 'id'>): Promise<string> {
    const query = `
      INSERT INTO user_status_audit_log (
        user_id, old_status, new_status, reason, changed_by, changed_by_role,
        timestamp, expires_at, ip_address, user_agent, bulk_operation_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const params = [
      log.userId, log.oldStatus, log.newStatus, log.reason, log.changedBy,
      log.changedByRole, log.timestamp, log.expiresAt, log.ipAddress,
      log.userAgent, log.bulkOperationId
    ];

    const result = await this.database.query(query, params);
    return result.rows[0].id;
  }

  private getStatusChangeSeverity(oldStatus: UserStatus, newStatus: UserStatus): 'info' | 'warning' | 'critical' {
    if (newStatus === 'deleted') return 'critical';
    if (newStatus === 'locked' || newStatus === 'suspended') return 'warning';
    if (oldStatus === 'locked' || oldStatus === 'suspended') return 'info';
    return 'info';
  }

  private async scheduleUserNotification(userId: string, notification: any): Promise<void> {
    // Implementation would integrate with notification service
    // For now, just log the notification intent
    console.log(`Scheduled notification for user ${userId}:`, notification);
  }
}

export default UserStatusService;