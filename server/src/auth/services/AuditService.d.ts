import { IAuditService, AuditLog, AuthConfig, SecurityEvent } from '../types';
import { DatabaseService } from '../database/DatabaseService';
export declare class AuditService implements IAuditService {
  private db;
  private config;
  constructor(config: AuthConfig, db: DatabaseService);
  logEvent(event: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void>;
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  getAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
    severity?: string;
    resourceType?: string;
  }): Promise<AuditLog[]>;
  getAuditStats(timeframe?: 'hour' | 'day' | 'week' | 'month'): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topUsers: Array<{
      userId: string;
      count: number;
    }>;
  }>;
  exportAuditLogs(filters: { startDate: Date; endDate: Date; format?: 'json' | 'csv' }): Promise<string>;
  cleanupOldLogs(retentionDays?: number): Promise<number>;
  private sendAlert;
  private mapDatabaseAuditLog;
  private exportToCSV;
  /**
   * Legacy compatibility method - alias for logEvent
   * DEPLOYMENT BLOCKER FIX: Provides logAction method expected by calling code
   */
  logAction(params: {
    action: string;
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
  }): Promise<void>;
}
//# sourceMappingURL=AuditService.d.ts.map
