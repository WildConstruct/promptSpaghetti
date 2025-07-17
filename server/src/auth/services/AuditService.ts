// Epic 11 Audit Service
// Security audit logging and compliance tracking

import { IAuditService, AuditLog, AuthConfig, SecurityEvent } from '../types';
import { DatabaseService } from '../database/DatabaseService';

export class AuditService implements IAuditService {
  private db: DatabaseService;
  private config: AuthConfig;

  constructor(config: AuthConfig, db: DatabaseService) {
    this.config = config;
    this.db = db;
  }

  async logEvent(event: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO audit_logs (
          user_id, action, resource_type, resource_id, 
          details, ip_address, user_agent, session_id, severity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        event.userId || null,
        event.action,
        event.resourceType || null,
        event.resourceId || null,
        event.details ? JSON.stringify(event.details) : null,
        event.ipAddress || null,
        event.userAgent || null,
        event.sessionId || null,
        event.severity || 'info',
      ]);

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`AUDIT [${event.severity?.toUpperCase()}]: ${event.action}`, {
          userId: event.userId,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          details: event.details,
        });
      }

      // Send alerts for critical events
      if (event.severity === 'critical' || event.severity === 'error') {
        await this.sendAlert(event);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error, event);
      // Don't throw - audit logging should not break the main flow
    }
  }

  // Enhanced security event logging for password reset and other security actions
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    return this.logEvent({
      userId: event.userId || undefined,
      action: event.type,
      resourceType: 'authentication',
      details: {
        securityEventType: event.type,
        success: event.success,
        email: event.email,
        ...event.metadata,
      },
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      severity: event.success ? 'info' : 'warning',
    });
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
    severity?: string;
    resourceType?: string;
  }): Promise<AuditLog[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(filters.userId);
      paramIndex++;
    }

    if (filters.action) {
      conditions.push(`action = $${paramIndex}`);
      params.push(filters.action);
      paramIndex++;
    }

    if (filters.severity) {
      conditions.push(`severity = $${paramIndex}`);
      params.push(filters.severity);
      paramIndex++;
    }

    if (filters.resourceType) {
      conditions.push(`resource_type = $${paramIndex}`);
      params.push(filters.resourceType);
      paramIndex++;
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(filters.endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    const query = `
      SELECT * FROM audit_logs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    try {
      const result = await this.db.query(query, params);
      return result.rows.map(this.mapDatabaseAuditLog);
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  async getAuditStats(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topUsers: Array<{ userId: string; count: number }>;
  }> {
    const timeframes = {
      hour: '1 hour',
      day: '1 day',
      week: '1 week',
      month: '1 month',
    };

    try {
      // Total events
      const totalResult = await this.db.query(`
        SELECT COUNT(*) as total 
        FROM audit_logs 
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
      `);

      // Events by action
      const actionResult = await this.db.query(`
        SELECT action, COUNT(*) as count 
        FROM audit_logs 
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY action 
        ORDER BY count DESC
      `);

      // Events by severity
      const severityResult = await this.db.query(`
        SELECT severity, COUNT(*) as count 
        FROM audit_logs 
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
        GROUP BY severity 
        ORDER BY count DESC
      `);

      // Top users
      const usersResult = await this.db.query(`
        SELECT user_id, COUNT(*) as count 
        FROM audit_logs 
        WHERE created_at >= NOW() - INTERVAL '${timeframes[timeframe]}'
          AND user_id IS NOT NULL
        GROUP BY user_id 
        ORDER BY count DESC 
        LIMIT 10
      `);

      return {
        totalEvents: parseInt(totalResult.rows[0]?.total || '0'),
        eventsByAction: actionResult.rows.reduce((acc, row) => {
          acc[row.action] = parseInt(row.count);
          return acc;
        }, {}),
        eventsBySeverity: severityResult.rows.reduce((acc, row) => {
          acc[row.severity] = parseInt(row.count);
          return acc;
        }, {}),
        topUsers: usersResult.rows.map(row => ({
          userId: row.user_id,
          count: parseInt(row.count),
        })),
      };
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      throw error;
    }
  }

  async exportAuditLogs(filters: {
    startDate: Date;
    endDate: Date;
    format?: 'json' | 'csv';
  }): Promise<string> {
    const logs = await this.getAuditLogs({
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: 10000, // Large limit for export
    });

    if (filters.format === 'csv') {
      return this.exportToCSV(logs);
    } else {
      return JSON.stringify(logs, null, 2);
    }
  }

  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const result = await this.db.query(`
        DELETE FROM audit_logs 
        WHERE created_at < NOW() - INTERVAL '${retentionDays} days'
      `);

      const deletedCount = result.rowCount || 0;
      
      if (deletedCount > 0) {
        await this.logEvent({
          action: 'audit_logs_cleanup',
          details: { 
            deletedCount, 
            retentionDays,
            cleanupDate: new Date().toISOString(),
          },
          severity: 'info',
        });
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup audit logs:', error);
      throw error;
    }
  }

  private async sendAlert(event: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    // In production, this would integrate with alerting systems like:
    // - PagerDuty
    // - Slack webhooks
    // - Email notifications
    // - SIEM systems

    console.error(`SECURITY ALERT [${event.severity}]: ${event.action}`, {
      userId: event.userId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual alerting integrations
    // Example: Send to webhook, email, or monitoring system
  }

  private mapDatabaseAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details: row.details ? JSON.parse(row.details) : undefined,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      sessionId: row.session_id,
      severity: row.severity,
      createdAt: row.created_at,
    };
  }

  private exportToCSV(logs: AuditLog[]): string {
    const headers = [
      'ID', 'User ID', 'Action', 'Resource Type', 'Resource ID',
      'IP Address', 'User Agent', 'Severity', 'Created At', 'Details'
    ];

    const rows = logs.map(log => [
      log.id,
      log.userId || '',
      log.action,
      log.resourceType || '',
      log.resourceId || '',
      log.ipAddress || '',
      log.userAgent || '',
      log.severity,
      log.createdAt.toISOString(),
      log.details ? JSON.stringify(log.details) : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}