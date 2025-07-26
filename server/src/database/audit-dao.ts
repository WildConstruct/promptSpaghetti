// Epic 17.1.6 - Audit Logging System DAO

import { Database } from 'sqlite3';
import crypto from 'crypto';
import {
  AuditEvent,
  AuditTrail,
  AuditSession,
  ComplianceReport,
  AuditConfiguration,
  AuditStatistics,
  AuditEventQuery,
  AuditEventResponse,
  CreateAuditEventRequest,
  CreateComplianceReportRequest,
  AuditEventType,
  AuditCategory,
  AuditSeverity,
  ComplianceStandard,
  AuditContext
} from './audit-models';

export class AuditDAO {
  constructor(private db: Database) {}

  async initializeTables(): Promise<void> {
    const tables = [
      // Audit events table
      `CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        actor_id TEXT,
        actor_type TEXT NOT NULL,
        actor_email TEXT,
        actor_name TEXT,
        actor_role TEXT,
        resource_type TEXT NOT NULL,
        resource_id TEXT,
        resource_name TEXT,
        action TEXT NOT NULL,
        description TEXT NOT NULL,
        outcome TEXT NOT NULL,
        before_value TEXT, -- JSON
        after_value TEXT, -- JSON
        changed_fields TEXT, -- JSON array
        session_id TEXT,
        request_id TEXT,
        correlation_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        location TEXT, -- JSON
        metadata TEXT NOT NULL, -- JSON
        tags TEXT, -- JSON array
        compliance_standards TEXT, -- JSON array
        retention_period INTEGER,
        checksum TEXT,
        signature TEXT,
        timestamp DATETIME NOT NULL,
        duration INTEGER,
        error TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Audit trails table
      `CREATE TABLE IF NOT EXISTS audit_trails (
        id TEXT PRIMARY KEY,
        resource_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        first_event DATETIME NOT NULL,
        last_event DATETIME NOT NULL,
        total_events INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(resource_type, resource_id)
      )`,

      // Audit sessions table
      `CREATE TABLE IF NOT EXISTS audit_sessions (
        id TEXT PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        user_id TEXT,
        actor_email TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration INTEGER,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        location TEXT, -- JSON
        event_count INTEGER DEFAULT 0,
        successful_actions INTEGER DEFAULT 0,
        failed_actions INTEGER DEFAULT 0,
        security_events INTEGER DEFAULT 0,
        metadata TEXT, -- JSON
        tags TEXT, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Compliance reports table
      `CREATE TABLE IF NOT EXISTS compliance_reports (
        id TEXT PRIMARY KEY,
        report_type TEXT NOT NULL,
        standard TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        scope TEXT, -- JSON
        summary TEXT NOT NULL, -- JSON
        violations TEXT, -- JSON array
        generated_by TEXT NOT NULL,
        generated_at DATETIME NOT NULL,
        format TEXT NOT NULL,
        file_size INTEGER,
        file_path TEXT,
        signature TEXT,
        checksum TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Audit configuration table
      `CREATE TABLE IF NOT EXISTS audit_configuration (
        id TEXT PRIMARY KEY,
        enabled_event_types TEXT NOT NULL, -- JSON array
        excluded_event_types TEXT, -- JSON array
        minimum_severity TEXT NOT NULL,
        default_retention_days INTEGER NOT NULL,
        retention_by_category TEXT, -- JSON
        archive_after_days INTEGER NOT NULL,
        delete_after_days INTEGER NOT NULL,
        enable_integrity_checking BOOLEAN DEFAULT 1,
        enable_digital_signatures BOOLEAN DEFAULT 0,
        enable_encryption BOOLEAN DEFAULT 0,
        encryption_algorithm TEXT,
        batch_size INTEGER DEFAULT 100,
        flush_interval INTEGER DEFAULT 30,
        max_memory_buffer INTEGER DEFAULT 10,
        required_standards TEXT, -- JSON array
        automatic_report_generation BOOLEAN DEFAULT 0,
        report_schedule TEXT, -- JSON
        alert_on_critical_events BOOLEAN DEFAULT 1,
        alert_on_security_events BOOLEAN DEFAULT 1,
        alert_recipients TEXT, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_event_type ON audit_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_category ON audit_events(category)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_severity ON audit_events(severity)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id ON audit_events(actor_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_actor_email ON audit_events(actor_email)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource_type, resource_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_session_id ON audit_events(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_correlation_id ON audit_events(correlation_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_events_outcome ON audit_events(outcome)',
      'CREATE INDEX IF NOT EXISTS idx_audit_trails_resource ON audit_trails(resource_type, resource_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_sessions_session_id ON audit_sessions(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_sessions_user_id ON audit_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_compliance_reports_standard ON compliance_reports(standard)',
      'CREATE INDEX IF NOT EXISTS idx_compliance_reports_generated_at ON compliance_reports(generated_at)'
    ];

    // Create tables
    for (const table of tables) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(table, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Create indexes
    for (const index of indexes) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(index, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  // Create audit event
  async createAuditEvent(request: CreateAuditEventRequest, context: AuditContext): Promise<AuditEvent> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();

    const event: AuditEvent = {
      id,
      eventType: request.eventType,
      category: request.category,
      severity: request.severity,
      actorId: context.actorId,
      actorType: context.actorType,
      actorEmail: context.actorEmail,
      actorName: context.actorName,
      actorRole: context.actorRole,
      resourceType: request.resourceType,
      resourceId: request.resourceId,
      resourceName: request.resourceName,
      action: request.action,
      description: request.description,
      outcome: request.outcome,
      beforeValue: request.beforeValue,
      afterValue: request.afterValue,
      changedFields: this.calculateChangedFields(request.beforeValue, request.afterValue),
      sessionId: context.sessionId,
      requestId: context.requestId,
      correlationId: context.correlationId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { ...request.metadata, ...context.metadata },
      tags: request.tags || [],
      complianceStandards: request.complianceStandards || [],
      timestamp,
      location: await this.enrichLocationData(context.ipAddress)
    };

    // Calculate checksum for integrity
    event.checksum = this.calculateChecksum(event);

    // Calculate retention period
    event.retentionPeriod = await this.calculateRetentionPeriod(event);

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `INSERT INTO audit_events (
          id, event_type, category, severity, actor_id, actor_type, actor_email,
          actor_name, actor_role, resource_type, resource_id, resource_name,
          action, description, outcome, before_value, after_value, changed_fields,
          session_id, request_id, correlation_id, ip_address, user_agent,
          location, metadata, tags, compliance_standards, retention_period,
          checksum, timestamp, duration, error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.id,
          event.eventType,
          event.category,
          event.severity,
          event.actorId,
          event.actorType,
          event.actorEmail,
          event.actorName,
          event.actorRole,
          event.resourceType,
          event.resourceId,
          event.resourceName,
          event.action,
          event.description,
          event.outcome,
          JSON.stringify(event.beforeValue),
          JSON.stringify(event.afterValue),
          JSON.stringify(event.changedFields),
          event.sessionId,
          event.requestId,
          event.correlationId,
          event.ipAddress,
          event.userAgent,
          JSON.stringify(event.location),
          JSON.stringify(event.metadata),
          JSON.stringify(event.tags),
          JSON.stringify(event.complianceStandards),
          event.retentionPeriod,
          event.checksum,
          event.timestamp.toISOString(),
          event.duration,
          JSON.stringify(event.error)
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update audit trail
    await this.updateAuditTrail(event);

    // Update session statistics
    if (event.sessionId) {
      await this.updateSessionStatistics(event);
    }

    return event;
  }

  // Query audit events
  async queryAuditEvents(query: AuditEventQuery): Promise<AuditEventResponse> {
    let sql = 'SELECT * FROM audit_events WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM audit_events WHERE 1=1';
    const params: unknown[] = [];

    // Build WHERE clause
    if (query.startDate) {
      sql += ' AND timestamp >= ?';
      countSql += ' AND timestamp >= ?';
      params.push(query.startDate);
    }

    if (query.endDate) {
      sql += ' AND timestamp <= ?';
      countSql += ' AND timestamp <= ?';
      params.push(query.endDate);
    }

    if (query.eventTypes && query.eventTypes.length > 0) {
      const placeholders = query.eventTypes.map(() => '?').join(',');
      sql += ` AND event_type IN (${placeholders})`;
      countSql += ` AND event_type IN (${placeholders})`;
      params.push(...query.eventTypes);
    }

    if (query.categories && query.categories.length > 0) {
      const placeholders = query.categories.map(() => '?').join(',');
      sql += ` AND category IN (${placeholders})`;
      countSql += ` AND category IN (${placeholders})`;
      params.push(...query.categories);
    }

    if (query.severities && query.severities.length > 0) {
      const placeholders = query.severities.map(() => '?').join(',');
      sql += ` AND severity IN (${placeholders})`;
      countSql += ` AND severity IN (${placeholders})`;
      params.push(...query.severities);
    }

    if (query.actorIds && query.actorIds.length > 0) {
      const placeholders = query.actorIds.map(() => '?').join(',');
      sql += ` AND actor_id IN (${placeholders})`;
      countSql += ` AND actor_id IN (${placeholders})`;
      params.push(...query.actorIds);
    }

    if (query.resourceTypes && query.resourceTypes.length > 0) {
      const placeholders = query.resourceTypes.map(() => '?').join(',');
      sql += ` AND resource_type IN (${placeholders})`;
      countSql += ` AND resource_type IN (${placeholders})`;
      params.push(...query.resourceTypes);
    }

    if (query.searchTerm) {
      sql += ' AND (description LIKE ? OR action LIKE ? OR actor_email LIKE ?)';
      countSql += ' AND (description LIKE ? OR action LIKE ? OR actor_email LIKE ?)';
      const searchPattern = `%${query.searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Add ORDER BY
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add LIMIT and OFFSET
    const limit = query.limit || 50;
    const offset = ((query.page || 1) - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    const finalParams = [...params, limit, offset];

    const [events, total] = await Promise.all([
      new Promise<AuditEvent[]>((resolve, reject) => {
        this.db.all(sql, finalParams, (err, rows: unknown[]) => {
          if (err) reject(err);
          else resolve((rows as unknown[]).map(row => this.mapRowToAuditEvent(row)));
        });
      }),
      new Promise<number>((resolve, reject) => {
        this.db.get(countSql, params, (err, row: unknown) => {
          if (err) reject(err);
          else resolve((row as { total: number }).total);
        });
      })
    ]);

    // Generate summary
    const summary = await this.generateQuerySummary(events, query);

    return {
      events,
      pagination: {
        page: query.page || 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary
    };
  }

  // Get audit statistics
  async getAuditStatistics(startDate?: Date, endDate?: Date): Promise<AuditStatistics> {
    const params: unknown[] = [];
    let timeFilter = '';

    if (startDate) {
      timeFilter += ' AND timestamp >= ?';
      params.push(startDate.toISOString());
    }
    if (endDate) {
      timeFilter += ' AND timestamp <= ?';
      params.push(endDate.toISOString());
    }

    const queries = [
      `SELECT COUNT(*) as total_events FROM audit_events WHERE 1=1${timeFilter}`,
      `SELECT event_type, COUNT(*) as count FROM audit_events WHERE 1=1${timeFilter} GROUP BY event_type`,
      `SELECT category, COUNT(*) as count FROM audit_events WHERE 1=1${timeFilter} GROUP BY category`,
      `SELECT severity, COUNT(*) as count FROM audit_events WHERE 1=1${timeFilter} GROUP BY severity`,
      `SELECT COUNT(DISTINCT actor_id) as unique_users FROM audit_events WHERE actor_id IS NOT NULL${timeFilter}`,
      `SELECT actor_id, actor_email, COUNT(*) as event_count 
       FROM audit_events 
       WHERE actor_id IS NOT NULL${timeFilter} 
       GROUP BY actor_id, actor_email 
       ORDER BY event_count DESC 
       LIMIT 10`
    ];

    const [
      totalResult,
      eventsByType,
      eventsByCategory,
      eventsBySeverity,
      uniqueUsersResult,
      topUsers
    ] = await Promise.all(
      queries.map(query => 
        new Promise<unknown>((resolve, reject) => {
          if (query.includes('GROUP BY')) {
            this.db.all(query, params, (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          } else {
            this.db.get(query, params, (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        })
      )
    );

    // Calculate time-based statistics
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [eventsToday, eventsThisWeek, eventsThisMonth] = await Promise.all([
      this.getEventCount(todayStart),
      this.getEventCount(weekStart),
      this.getEventCount(monthStart)
    ]);

    const statistics: AuditStatistics = {
      totalEvents: (totalResult as { total_events: number }).total_events || 0,
      eventsByType: this.arrayToRecord(eventsByType, 'event_type'),
      eventsByCategory: this.arrayToRecord(eventsByCategory, 'category'),
      eventsBySeverity: this.arrayToRecord(eventsBySeverity, 'severity'),
      eventsToday,
      eventsThisWeek,
      eventsThisMonth,
      uniqueUsers: (uniqueUsersResult as { unique_users: number }).unique_users || 0,
      topUsers: (topUsers as Array<Record<string, unknown>>).map((user: Record<string, unknown>) => ({
        userId: user.actor_id as string,
        userEmail: user.actor_email as string,
        eventCount: user.event_count as number
      })),
      topResources: [], // TODO: Implement resource statistics
      securityEvents: 0, // TODO: Calculate security events
      failedLogins: 0, // TODO: Calculate failed logins
      suspiciousActivities: 0, // TODO: Calculate suspicious activities
      averageEventSize: 0, // TODO: Calculate average event size
      totalStorageUsed: 0, // TODO: Calculate storage usage
      processingLatency: {
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0
      },
      generatedAt: now
    };

    return statistics;
  }

  // Create compliance report
  async createComplianceReport(request: CreateComplianceReportRequest, generatedBy: string): Promise<ComplianceReport> {
    const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedAt = new Date();

    // Query events for the report
    const query: AuditEventQuery = {
      startDate: request.startDate,
      endDate: request.endDate,
      complianceStandards: [request.standard],
      limit: 10000 // Large limit for reports
    };

    if (request.scope?.eventTypes) {
      query.eventTypes = request.scope.eventTypes;
    }
    if (request.scope?.resourceTypes) {
      query.resourceTypes = request.scope.resourceTypes;
    }

    const eventResponse = await this.queryAuditEvents(query);
    const events = eventResponse.events;

    // Generate summary
    const summary = {
      totalEvents: events.length,
      uniqueUsers: new Set(events.map(e => e.actorId).filter(Boolean)).size,
      criticalEvents: events.filter(e => e.severity === AuditSeverity.CRITICAL).length,
      securityIncidents: events.filter(e => e.category === AuditCategory.SECURITY).length,
      complianceViolations: 0 // TODO: Implement violation detection
    };

    // Detect violations based on compliance standard
    const violations = this.detectComplianceViolations(events, request.standard);

    const report: ComplianceReport = {
      id,
      reportType: request.reportType,
      standard: request.standard,
      startDate: new Date(request.startDate),
      endDate: new Date(request.endDate),
      scope: request.scope || {},
      summary,
      events,
      violations,
      generatedBy,
      generatedAt,
      format: request.format || 'json'
    };

    // Calculate checksum for integrity
    report.checksum = this.calculateReportChecksum(report);

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `INSERT INTO compliance_reports (
          id, report_type, standard, start_date, end_date, scope,
          summary, violations, generated_by, generated_at, format,
          checksum
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          report.id,
          report.reportType,
          report.standard,
          report.startDate.toISOString(),
          report.endDate.toISOString(),
          JSON.stringify(report.scope),
          JSON.stringify(report.summary),
          JSON.stringify(report.violations),
          report.generatedBy,
          report.generatedAt.toISOString(),
          report.format,
          report.checksum
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return report;
  }

  // Helper methods
  private calculateChangedFields(
    beforeValue?: Record<string,
    unknown>,
    afterValue?: Record<string,
    unknown>
  ): string[] {
    if (!beforeValue || !afterValue) return [];
    
    const changed: string[] = [];
    const allKeys = new Set([...Object.keys(beforeValue), ...Object.keys(afterValue)]);
    
    for (const key of allKeys) {
      if (JSON.stringify(beforeValue[key]) !== JSON.stringify(afterValue[key])) {
        changed.push(key);
      }
    }
    
    return changed;
  }

  private calculateChecksum(event: AuditEvent): string {
    const data = `${event.eventType}:${event.timestamp.toISOString()}:${event.actorId}:${event.resourceType}:${event.resourceId}:${event.action}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private calculateReportChecksum(report: ComplianceReport): string {
    const data = `${report.reportType}:${report.standard}:${report.startDate.toISOString()}:${report.endDate.toISOString()}:${report.events.length}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async calculateRetentionPeriod(event: AuditEvent): Promise<number> {
    // Get configuration from database or use defaults
    const config = await this.getAuditConfiguration();
    
    if (config?.retentionByCategory && config.retentionByCategory[event.category]) {
      return config.retentionByCategory[event.category];
    }
    
    return config?.defaultRetentionDays || 2555; // Default 7 years
  }

  private async enrichLocationData(ipAddress?: string): Promise<AuditEvent['location']> {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1') {
      return undefined;
    }
    
    // TODO: Implement IP geolocation lookup
    // For now, return undefined - in production, integrate with a geolocation service
    return undefined;
  }

  private async updateAuditTrail(event: AuditEvent): Promise<void> {
    if (!event.resourceId) return;

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO audit_trails (
          id, resource_type, resource_id, first_event, last_event, total_events
        ) VALUES (
          COALESCE((SELECT id FROM audit_trails WHERE resource_type = ? AND resource_id = ?), ?),
          ?, ?, 
          COALESCE((SELECT first_event FROM audit_trails WHERE resource_type = ? AND resource_id = ?), ?),
          ?,
          COALESCE((SELECT total_events FROM audit_trails WHERE resource_type = ? AND resource_id = ?), 0) + 1
        )`,
        [
          event.resourceType, event.resourceId, `trail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          event.resourceType, event.resourceId,
          event.resourceType, event.resourceId, event.timestamp.toISOString(),
          event.timestamp.toISOString(),
          event.resourceType, event.resourceId
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  private async updateSessionStatistics(event: AuditEvent): Promise<void> {
    if (!event.sessionId) return;

    const updateFields = [];
    const params = [];

    updateFields.push('event_count = event_count + 1');
    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());

    if (event.outcome === 'success') {
      updateFields.push('successful_actions = successful_actions + 1');
    } else {
      updateFields.push('failed_actions = failed_actions + 1');
    }

    if (event.category === AuditCategory.SECURITY) {
      updateFields.push('security_events = security_events + 1');
    }

    params.push(event.sessionId);

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `UPDATE audit_sessions SET ${updateFields.join(', ')} WHERE session_id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  private async getAuditConfiguration(): Promise<AuditConfiguration | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM audit_configuration ORDER BY created_at DESC LIMIT 1', (err, row: unknown) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(this.mapRowToConfiguration(row as Record<string, unknown>));
      });
    });
  }

  private async getEventCount(startDate: Date): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM audit_events WHERE timestamp >= ?',
        [startDate.toISOString()],
        (err, row: unknown) => {
          if (err) reject(err);
          else resolve((row as { count: number }).count || 0);
        }
      );
    });
  }

  private arrayToRecord(array: unknown[], keyField: string): Record<string, number> {
    const record: Record<string, number> = {};
    (array as Array<Record<string, unknown>>).forEach(item => {
      record[item[keyField] as string] = item.count as number;
    });
    return record;
  }

  private async generateQuerySummary(
    events: AuditEvent[],
    query: AuditEventQuery
  ): Promise<AuditEventResponse['summary']> {
    const eventsByCategory: Record<AuditCategory, number> = {} as Record<AuditCategory, number>;
    const eventsBySeverity: Record<AuditSeverity, number> = {} as Record<AuditSeverity, number>;
    const uniqueActors = new Set<string>();

    events.forEach(event => {
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      if (event.actorId) uniqueActors.add(event.actorId);
    });

    return {
      totalEvents: events.length,
      eventsByCategory,
      eventsBySeverity,
      uniqueActors: uniqueActors.size,
      timeRange: {
        start: query.startDate ? new Date(query.startDate) : new Date(0),
        end: query.endDate ? new Date(query.endDate) : new Date()
      }
    };
  }

  private detectComplianceViolations(
    _events: AuditEvent[],
    _standard: ComplianceStandard
  ): ComplianceReport['violations'] {
    const violations: ComplianceReport['violations'] = [];

    // TODO: Implement compliance-specific violation detection
    // This would include rules specific to each compliance standard

    return violations;
  }

  private mapRowToAuditEvent(row: unknown): AuditEvent {
    const auditRow = row as Record<string, unknown>;
    return {
      id: auditRow.id as string,
      eventType: auditRow.event_type as AuditEventType,
      category: auditRow.category as AuditCategory,
      severity: auditRow.severity as AuditSeverity,
      actorId: auditRow.actor_id as string,
      actorType: auditRow.actor_type as string,
      actorEmail: auditRow.actor_email as string,
      actorName: auditRow.actor_name as string,
      actorRole: auditRow.actor_role as string,
      resourceType: auditRow.resource_type as string,
      resourceId: auditRow.resource_id as string,
      resourceName: auditRow.resource_name as string,
      action: auditRow.action as string,
      description: auditRow.description as string,
      outcome: auditRow.outcome as string,
      beforeValue: auditRow.before_value ? JSON.parse(auditRow.before_value as string) : undefined,
      afterValue: auditRow.after_value ? JSON.parse(auditRow.after_value as string) : undefined,
      changedFields: auditRow.changed_fields ? JSON.parse(auditRow.changed_fields as string) : [],
      sessionId: auditRow.session_id as string,
      requestId: auditRow.request_id as string,
      correlationId: auditRow.correlation_id as string,
      ipAddress: auditRow.ip_address as string,
      userAgent: auditRow.user_agent as string,
      location: auditRow.location ? JSON.parse(auditRow.location as string) : undefined,
      metadata: JSON.parse((auditRow.metadata as string) || '{}'),
      tags: JSON.parse((auditRow.tags as string) || '[]'),
      complianceStandards: JSON.parse((auditRow.compliance_standards as string) || '[]'),
      retentionPeriod: auditRow.retention_period as number,
      checksum: auditRow.checksum as string,
      signature: auditRow.signature as string,
      timestamp: new Date(auditRow.timestamp as string),
      duration: auditRow.duration as number,
      error: auditRow.error ? JSON.parse(auditRow.error as string) : undefined
    };
  }

  private mapRowToConfiguration(row: Record<string, unknown>): AuditConfiguration {
    return {
      id: row.id as string,
      enabledEventTypes: JSON.parse(row.enabled_event_types as string),
      excludedEventTypes: JSON.parse((row.excluded_event_types as string) || '[]'),
      minimumSeverity: row.minimum_severity as AuditSeverity,
      defaultRetentionDays: row.default_retention_days as number,
      retentionByCategory: JSON.parse((row.retention_by_category as string) || '{}'),
      archiveAfterDays: row.archive_after_days as number,
      deleteAfterDays: row.delete_after_days as number,
      enableIntegrityChecking: Boolean(row.enable_integrity_checking),
      enableDigitalSignatures: Boolean(row.enable_digital_signatures),
      enableEncryption: Boolean(row.enable_encryption),
      encryptionAlgorithm: row.encryption_algorithm as string,
      batchSize: row.batch_size as number,
      flushInterval: row.flush_interval as number,
      maxMemoryBuffer: row.max_memory_buffer as number,
      requiredStandards: JSON.parse((row.required_standards as string) || '[]'),
      automaticReportGeneration: Boolean(row.automatic_report_generation),
      reportSchedule: row.report_schedule ? JSON.parse(row.report_schedule as string) : undefined,
      alertOnCriticalEvents: Boolean(row.alert_on_critical_events),
      alertOnSecurityEvents: Boolean(row.alert_on_security_events),
      alertRecipients: JSON.parse((row.alert_recipients as string) || '[]'),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string)
    };
  }
}