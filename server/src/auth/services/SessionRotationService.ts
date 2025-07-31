// Session Rotation Service
// Handles session rotation on privilege changes for enhanced security

import { AuthConfig } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { SessionService } from './SessionService';
import { AuditService } from './AuditService';
import { RBACService } from './RBACService';
import { TokenService } from './TokenService';

}
}
export interface PrivilegeChangeEvent {
  userId: string;
  changeType: 'role_added' | 'role_removed' | 'permission_added' | 'permission_removed' | 'organization_change' | 'status_change';
  oldValue?: string | string[];
  newValue?: string | string[];
  reason?: string;
  performedBy?: string;
}
}
}

}
}
export interface SessionRotationResult {
  success: boolean;
  rotatedSessions: number;
  newSessionId?: string;
  errors?: string[];
}
}
}

}
}
export interface SessionRotationPolicy {
  rotateOnRoleChange: boolean;
  rotateOnPermissionChange: boolean;
  rotateOnOrganizationChange: boolean;
  rotateOnStatusChange: boolean;
  preserveCurrentSession: boolean;
  notifyUser: boolean;
  graceWindowMinutes: number;
}
}
}

export class SessionRotationService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private sessionService: SessionService;
  private auditService: AuditService;
  private rbacService: RBACService;
  private tokenService: TokenService;
  private defaultPolicy: SessionRotationPolicy;

  constructor(
    config: AuthConfig,
    dbService: DatabaseService,
    sessionService: SessionService,
    auditService: AuditService,
    rbacService: RBACService,
    tokenService: TokenService
  ) {
    this.config = config;
    this.dbService = dbService;
    this.sessionService = sessionService;
    this.auditService = auditService;
    this.rbacService = rbacService;
    this.tokenService = tokenService;

    // Default rotation policy
    this.defaultPolicy = {
      rotateOnRoleChange: true,
      rotateOnPermissionChange: true,
      rotateOnOrganizationChange: true,
      rotateOnStatusChange: true,
      preserveCurrentSession: false,
      notifyUser: true,
      graceWindowMinutes: 5
    };
  }

  async handlePrivilegeChange(
    event: PrivilegeChangeEvent,
    currentSessionId?: string,
    customPolicy?: Partial<SessionRotationPolicy>
  ): Promise<SessionRotationResult> {

    const policy = { ...this.defaultPolicy, ...customPolicy };
    const errors: string[] = [];

    try {
      // Check if rotation is required based on policy
      if (!this.shouldRotateSessions(event, policy)) {
        return {
          success: true,
          rotatedSessions: 0
        };
      }

      // Log the privilege change event
      await this.auditService.logEvent({
        userId: event.userId,
        action: 'privilege_change',
        details: {
          changeType: event.changeType,
          oldValue: event.oldValue,
          newValue: event.newValue,
          reason: event.reason,
          performedBy: event.performedBy,
          sessionRotationRequired: true
  }
        severity: 'warning'
      });

      // Get all active sessions for the user
      const activeSessions = await this.sessionService.getUserActiveSessions(event.userId);
      
      if (activeSessions.length === 0) {
        return {
          success: true,
          rotatedSessions: 0
        };
      }

      // Determine which sessions to rotate
      const sessionsToRotate = policy.preserveCurrentSession && currentSessionId
        ? activeSessions.filter(s => s.id !== currentSessionId)
        : activeSessions;

      // Create grace window entries for sessions being rotated
      if (policy.graceWindowMinutes > 0) {
        await this.createGraceWindows(sessionsToRotate.map(s => s.id), policy.graceWindowMinutes);
      }

      // Rotate sessions
      let rotatedCount = 0;
      for (const session of sessionsToRotate) {
        try {
          await this.rotateSession(session.id, event);
          rotatedCount++;
        } catch (error) {
          errors.push(`Failed to rotate session ${session.id}: ${error.message}`);
        }
      }

      // Create new session for current user if needed
      let newSessionId: string | undefined;
      if (!policy.preserveCurrentSession && currentSessionId) {
        const newSession = await this.createReplacementSession(event.userId, currentSessionId);
        newSessionId = newSession?.id;
      }

      // Send notification if enabled
      if (policy.notifyUser) {
        await this.notifyUserOfSessionRotation(event.userId, event, rotatedCount);
      }

      // Log rotation completion
      await this.auditService.logEvent({
        userId: event.userId,
        action: 'session_rotation_completed',
        details: {
          rotatedSessions: rotatedCount,
          preservedCurrentSession: policy.preserveCurrentSession,
          graceWindowMinutes: policy.graceWindowMinutes,
          newSessionId,
          errors
  }
        sessionId: currentSessionId,
        severity: 'info'
      });

      return {
        success: errors.length === 0,
        rotatedSessions: rotatedCount,
        newSessionId,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      await this.auditService.logEvent({
        userId: event.userId,
        action: 'session_rotation_failed',
        details: {
          error: error.message,
          event
  }
        sessionId: currentSessionId,
        severity: 'error'
      });

      throw error;
    }
  }

  private shouldRotateSessions(event: PrivilegeChangeEvent, policy: SessionRotationPolicy): boolean {
    switch (event.changeType) {
    case 'role_added':
    case 'role_removed':
      return policy.rotateOnRoleChange;
      
    case 'permission_added':
    case 'permission_removed':
      return policy.rotateOnPermissionChange;
      
    case 'organization_change':
      return policy.rotateOnOrganizationChange;
      
    case 'status_change':
      return policy.rotateOnStatusChange;
      
    default:
      return true; // Default to rotating for unknown change types
    }
  }

  private async rotateSession(sessionId: string, event: PrivilegeChangeEvent): Promise<void> {

    // Get session details before rotation
    const sessionResult = await this.dbService.query(
      'SELECT session_token FROM user_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return;
    }

    const sessionToken = sessionResult.rows[0].session_token;

    // Revoke the session
    await this.sessionService.revokeSession(sessionToken, `privilege_change:${event.changeType}`);

    // Store rotation metadata
    await this.dbService.query(`
      INSERT INTO session_rotation_history (
        id, session_id, user_id, change_type, old_value, new_value,
        reason, performed_by, rotated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      require('crypto').randomUUID(),
      sessionId,
      event.userId,
      event.changeType,
      JSON.stringify(event.oldValue),
      JSON.stringify(event.newValue),
      event.reason,
      event.performedBy,
      new Date()
    ]);
  }

  private async createGraceWindows(sessionIds: string[], graceMinutes: number): Promise<void> {

    const expiresAt = new Date(Date.now() + graceMinutes * 60 * 1000);
    
    for (const sessionId of sessionIds) {
      await this.dbService.query(`
        INSERT INTO session_grace_windows (
          id, session_id, expires_at, created_at
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (session_id) DO UPDATE SET
          expires_at = $3,
          created_at = $4
      `, [
        require('crypto').randomUUID(),
        sessionId,
        expiresAt,
        new Date()
      ]);
    }
  }

  private async createReplacementSession(userId: string, oldSessionId: string): Promise<any> {

    // Get old session details for device info
    const oldSessionResult = await this.dbService.query(
      'SELECT device_info, ip_address FROM user_sessions WHERE id = $1',
      [oldSessionId]
    );

    if (oldSessionResult.rows.length === 0) {
      return null;
    }

    const oldSession = oldSessionResult.rows[0];

    // Create new session with same device info
    return await this.sessionService.createSession({
      userId,
      deviceInfo: oldSession.device_info,
      location: {
        ipAddress: oldSession.ip_address
      }
    });
  }

  private async notifyUserOfSessionRotation(
    userId: string,
    event: PrivilegeChangeEvent,
    rotatedCount: number
  ): Promise<void> {

    // Get user email
    const userResult = await this.dbService.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return;
    }

    const email = userResult.rows[0].email;

    // Create notification
    await this.dbService.query(`
      INSERT INTO notifications (
        id, user_id, type, subject, body, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      require('crypto').randomUUID(),
      userId,
      'session_rotation',
      'Security: Sessions Rotated Due to Privilege Change',
      this.generateNotificationBody(event, rotatedCount),
      JSON.stringify({
        event,
        rotatedCount,
        timestamp: new Date()
      }),
      new Date()
    ]);

    // Log notification
    await this.auditService.logEvent({
      userId,
      action: 'session_rotation_notification_sent',
      details: {
        email,
        changeType: event.changeType,
        rotatedCount
  }
      severity: 'info'
    });
  }

  private generateNotificationBody(event: PrivilegeChangeEvent, rotatedCount: number): string {
    const changeDescriptions = {
      role_added: 'New role(s) were added to your account',
      role_removed: 'Role(s) were removed from your account',
      permission_added: 'New permission(s) were granted to your account',
      permission_removed: 'Permission(s) were revoked from your account',
      organization_change: 'Your organization membership was modified',
      status_change: 'Your account status was changed'
    };

    const description = changeDescriptions[event.changeType] || 'Your account privileges were modified';

    return `
Hello,

${description}. As a security measure, ${rotatedCount} of your active sessions have been terminated.

Change Details:
- Type: ${event.changeType.replace(/_/g, ' ')}
${event.oldValue ? `- Previous: ${Array.isArray(event.oldValue) ? event.oldValue.join(', ') : event.oldValue}` : ''}
${event.newValue ? `- New: ${Array.isArray(event.newValue) ? event.newValue.join(', ') : event.newValue}` : ''}
${event.reason ? `- Reason: ${event.reason}` : ''}

You may need to sign in again on your devices. If you did not authorize this change, please contact support immediately.

Best regards,
Security Team
    `.trim();
  }

  // Check if a session is in grace period
  async isSessionInGracePeriod(sessionId: string): Promise<boolean> {

    const result = await this.dbService.query(`
      SELECT expires_at FROM session_grace_windows
      WHERE session_id = $1 AND expires_at > NOW()
    `, [sessionId]);

    return result.rows.length > 0;
  }

  // Clean up expired grace windows
  async cleanupExpiredGraceWindows(): Promise<number> {

    const result = await this.dbService.query(`
      DELETE FROM session_grace_windows
      WHERE expires_at < NOW()
      RETURNING id
    `);

    const cleanedCount = result.rows.length;

    if (cleanedCount > 0) {
      await this.auditService.logEvent({
        action: 'grace_windows_cleanup',
        details: {
          cleanedCount
  }
        severity: 'info'
      });
    }

    return cleanedCount;
  }

  // Get session rotation history for a user
  async getRotationHistory(userId: string, limit: number = 50): Promise<any[]> {

    const result = await this.dbService.query(`
      SELECT * FROM session_rotation_history
      WHERE user_id = $1
      ORDER BY rotated_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      ...row,
      old_value: JSON.parse(row.old_value || 'null'),
      new_value: JSON.parse(row.new_value || 'null')
    }));
  }

  // Get rotation statistics
  async getRotationStats(startDate?: Date, endDate?: Date): Promise<{
    totalRotations: number;
    byChangeType: Record<string, number>;
    topUsers: Array<{ userId: string; rotationCount: number }>;
  }> {
    const dateFilter = startDate && endDate
      ? 'WHERE rotated_at BETWEEN $1 AND $2'
      : '';
    const params = startDate && endDate ? [startDate, endDate] : [];

    // Total rotations
    const totalResult = await this.dbService.query(
      `SELECT COUNT(*) as count FROM session_rotation_history ${dateFilter}`,
      params
    );

    // By change type
    const typeResult = await this.dbService.query(`
      SELECT change_type, COUNT(*) as count
      FROM session_rotation_history
      ${dateFilter}
      GROUP BY change_type
    `, params);

    // Top users
    const userResult = await this.dbService.query(`
      SELECT user_id, COUNT(*) as rotation_count
      FROM session_rotation_history
      ${dateFilter}
      GROUP BY user_id
      ORDER BY rotation_count DESC
      LIMIT 10
    `, params);

    const byChangeType: Record<string, number> = {};
    typeResult.rows.forEach(row => {
      byChangeType[row.change_type] = parseInt(row.count);
    });

    return {
      totalRotations: parseInt(totalResult.rows[0].count),
      byChangeType,
      topUsers: userResult.rows.map(row => ({
        userId: row.user_id,
        rotationCount: parseInt(row.rotation_count)
      }))
    };
  }
}