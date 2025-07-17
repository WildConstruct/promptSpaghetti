// Epic 17.1.5 - Feature Toggle Scheduling System DAO

import { Database } from 'sqlite3';
import {
  FeatureToggleSchedule,
  ScheduleExecution,
  ScheduleConflict,
  ScheduleNotification,
  TimezoneSettings,
  ScheduleTemplate,
  BulkScheduleOperation,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleQuery,
  ScheduleAnalytics,
  ScheduleType,
  ScheduleStatus,
  ExecutionStatus,
  ScheduleAction
} from './scheduling-models';

export class SchedulingDAO {
  constructor(private db: Database) {}

  async initializeTables(): Promise<void> {
    const tables = [
      // Feature toggle schedules
      `CREATE TABLE IF NOT EXISTS feature_toggle_schedules (
        id TEXT PRIMARY KEY,
        toggle_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        timezone TEXT NOT NULL,
        recurrence TEXT, -- JSON
        action_config TEXT NOT NULL, -- JSON
        status TEXT NOT NULL DEFAULT 'pending',
        enabled BOOLEAN NOT NULL DEFAULT 1,
        created_by TEXT NOT NULL,
        updated_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        next_execution DATETIME,
        last_execution DATETIME,
        execution_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 0,
        conflict_resolution TEXT DEFAULT 'skip',
        FOREIGN KEY (toggle_id) REFERENCES feature_toggles(id)
      )`,

      // Schedule executions
      `CREATE TABLE IF NOT EXISTS schedule_executions (
        id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL,
        toggle_id TEXT NOT NULL,
        execution_time DATETIME NOT NULL,
        status TEXT NOT NULL,
        triggered_by TEXT NOT NULL,
        execution_context TEXT NOT NULL, -- JSON
        before_value TEXT, -- JSON
        after_value TEXT, -- JSON
        affected_users INTEGER,
        error TEXT, -- JSON
        duration INTEGER DEFAULT 0,
        metadata TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (schedule_id) REFERENCES feature_toggle_schedules(id),
        FOREIGN KEY (toggle_id) REFERENCES feature_toggles(id)
      )`,

      // Schedule conflicts
      `CREATE TABLE IF NOT EXISTS schedule_conflicts (
        id TEXT PRIMARY KEY,
        toggle_id TEXT NOT NULL,
        conflicting_schedules TEXT NOT NULL, -- JSON array
        conflict_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        description TEXT NOT NULL,
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        resolution TEXT,
        auto_resolvable BOOLEAN DEFAULT 0,
        suggested_resolution TEXT, -- JSON
        FOREIGN KEY (toggle_id) REFERENCES feature_toggles(id)
      )`,

      // Schedule notifications
      `CREATE TABLE IF NOT EXISTS schedule_notifications (
        id TEXT PRIMARY KEY,
        schedule_id TEXT NOT NULL,
        type TEXT NOT NULL,
        recipients TEXT NOT NULL, -- JSON array
        channels TEXT NOT NULL, -- JSON array
        conditions TEXT NOT NULL, -- JSON
        template TEXT NOT NULL, -- JSON
        enabled BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (schedule_id) REFERENCES feature_toggle_schedules(id)
      )`,

      // Timezone settings
      `CREATE TABLE IF NOT EXISTS timezone_settings (
        id TEXT PRIMARY KEY,
        org_id TEXT,
        default_timezone TEXT NOT NULL,
        allowed_timezones TEXT NOT NULL, -- JSON array
        handle_dst BOOLEAN DEFAULT 1,
        dst_transition_behavior TEXT DEFAULT 'shift',
        display_format TEXT DEFAULT '24h',
        date_format TEXT DEFAULT 'YYYY-MM-DD',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Schedule templates
      `CREATE TABLE IF NOT EXISTS schedule_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        template TEXT NOT NULL, -- JSON
        usage_count INTEGER DEFAULT 0,
        last_used DATETIME,
        public BOOLEAN DEFAULT 0,
        created_by TEXT NOT NULL,
        org_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Bulk schedule operations
      `CREATE TABLE IF NOT EXISTS bulk_schedule_operations (
        id TEXT PRIMARY KEY,
        operation_type TEXT NOT NULL,
        schedule_ids TEXT NOT NULL, -- JSON array
        changes TEXT NOT NULL, -- JSON
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        total_count INTEGER NOT NULL,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        results TEXT, -- JSON array
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )`
    ];

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_schedules_toggle_id ON feature_toggle_schedules(toggle_id)',
      'CREATE INDEX IF NOT EXISTS idx_schedules_status ON feature_toggle_schedules(status)',
      'CREATE INDEX IF NOT EXISTS idx_schedules_next_execution ON feature_toggle_schedules(next_execution)',
      'CREATE INDEX IF NOT EXISTS idx_schedules_priority ON feature_toggle_schedules(priority)',
      'CREATE INDEX IF NOT EXISTS idx_executions_schedule_id ON schedule_executions(schedule_id)',
      'CREATE INDEX IF NOT EXISTS idx_executions_execution_time ON schedule_executions(execution_time)',
      'CREATE INDEX IF NOT EXISTS idx_executions_status ON schedule_executions(status)',
      'CREATE INDEX IF NOT EXISTS idx_conflicts_toggle_id ON schedule_conflicts(toggle_id)',
      'CREATE INDEX IF NOT EXISTS idx_conflicts_resolved ON schedule_conflicts(resolved_at)'
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

  // Schedule CRUD operations
  async createSchedule(request: CreateScheduleRequest, createdBy: string): Promise<FeatureToggleSchedule> {
    const id = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const schedule: FeatureToggleSchedule = {
      id,
      toggleId: request.toggleId,
      name: request.name,
      description: request.description,
      type: request.type,
      action: request.action,
      startTime: new Date(request.startTime),
      endTime: request.endTime ? new Date(request.endTime) : undefined,
      timezone: request.timezone,
      recurrence: request.recurrence,
      actionConfig: request.actionConfig,
      status: ScheduleStatus.PENDING,
      enabled: true,
      createdBy,
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
      failureCount: 0,
      priority: request.priority || 0,
      conflictResolution: request.conflictResolution || 'skip'
    };

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `INSERT INTO feature_toggle_schedules (
          id, toggle_id, name, description, type, action, start_time, end_time,
          timezone, recurrence, action_config, status, enabled, created_by,
          created_at, updated_at, execution_count, failure_count, priority,
          conflict_resolution
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          schedule.id,
          schedule.toggleId,
          schedule.name,
          schedule.description,
          schedule.type,
          schedule.action,
          schedule.startTime.toISOString(),
          schedule.endTime?.toISOString(),
          schedule.timezone,
          JSON.stringify(schedule.recurrence),
          JSON.stringify(schedule.actionConfig),
          schedule.status,
          schedule.enabled ? 1 : 0,
          schedule.createdBy,
          schedule.createdAt.toISOString(),
          schedule.updatedAt.toISOString(),
          schedule.executionCount,
          schedule.failureCount,
          schedule.priority,
          schedule.conflictResolution
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return schedule;
  }

  async getSchedule(id: string): Promise<FeatureToggleSchedule | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM feature_toggle_schedules WHERE id = ?',
        [id],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve(this.mapRowToSchedule(row));
          }
        }
      );
    });
  }

  async getSchedulesByToggle(toggleId: string): Promise<FeatureToggleSchedule[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM feature_toggle_schedules WHERE toggle_id = ? ORDER BY priority DESC, start_time ASC',
        [toggleId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => this.mapRowToSchedule(row)));
          }
        }
      );
    });
  }

  async querySchedules(query: ScheduleQuery): Promise<{ schedules: FeatureToggleSchedule[]; total: number }> {
    let sql = 'SELECT * FROM feature_toggle_schedules WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM feature_toggle_schedules WHERE 1=1';
    const params: any[] = [];

    // Build WHERE clause
    if (query.toggleId) {
      sql += ' AND toggle_id = ?';
      countSql += ' AND toggle_id = ?';
      params.push(query.toggleId);
    }

    if (query.status) {
      sql += ' AND status = ?';
      countSql += ' AND status = ?';
      params.push(query.status);
    }

    if (query.type) {
      sql += ' AND type = ?';
      countSql += ' AND type = ?';
      params.push(query.type);
    }

    if (query.startDate) {
      sql += ' AND start_time >= ?';
      countSql += ' AND start_time >= ?';
      params.push(query.startDate);
    }

    if (query.endDate) {
      sql += ' AND start_time <= ?';
      countSql += ' AND start_time <= ?';
      params.push(query.endDate);
    }

    if (query.createdBy) {
      sql += ' AND created_by = ?';
      countSql += ' AND created_by = ?';
      params.push(query.createdBy);
    }

    // Add ORDER BY
    const sortBy = query.sortBy || 'start_time';
    const sortOrder = query.sortOrder || 'asc';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    // Add LIMIT and OFFSET
    const limit = query.limit || 50;
    const offset = ((query.page || 1) - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    const finalParams = [...params, limit, offset];

    const [schedules, total] = await Promise.all([
      new Promise<FeatureToggleSchedule[]>((resolve, reject) => {
        this.db.all(sql, finalParams, (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => this.mapRowToSchedule(row)));
        });
      }),
      new Promise<number>((resolve, reject) => {
        this.db.get(countSql, params, (err, row: any) => {
          if (err) reject(err);
          else resolve(row.total);
        });
      })
    ]);

    return { schedules, total };
  }

  async updateSchedule(request: UpdateScheduleRequest, updatedBy: string): Promise<FeatureToggleSchedule | null> {
    const existing = await this.getSchedule(request.id);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(request).forEach(([key, value]) => {
      if (key === 'id' || value === undefined) return;

      switch (key) {
        case 'startTime':
          updates.push('start_time = ?');
          params.push(new Date(value).toISOString());
          break;
        case 'endTime':
          updates.push('end_time = ?');
          params.push(value ? new Date(value).toISOString() : null);
          break;
        case 'recurrence':
        case 'actionConfig':
          updates.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
          params.push(JSON.stringify(value));
          break;
        default:
          updates.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`);
          params.push(value);
      }
    });

    if (updates.length === 0) return existing;

    updates.push('updated_by = ?', 'updated_at = ?');
    params.push(updatedBy, new Date().toISOString());
    params.push(request.id);

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `UPDATE feature_toggle_schedules SET ${updates.join(', ')} WHERE id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return this.getSchedule(request.id);
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM feature_toggle_schedules WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  // Schedule execution operations
  async createExecution(execution: Omit<ScheduleExecution, 'id' | 'createdAt'>): Promise<ScheduleExecution> {
    const id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const fullExecution: ScheduleExecution = {
      id,
      ...execution,
      createdAt: now
    };

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `INSERT INTO schedule_executions (
          id, schedule_id, toggle_id, execution_time, status, triggered_by,
          execution_context, before_value, after_value, affected_users,
          error, duration, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullExecution.id,
          fullExecution.scheduleId,
          fullExecution.toggleId,
          fullExecution.executionTime.toISOString(),
          fullExecution.status,
          fullExecution.triggeredBy,
          JSON.stringify(fullExecution.executionContext),
          JSON.stringify(fullExecution.beforeValue),
          JSON.stringify(fullExecution.afterValue),
          fullExecution.affectedUsers,
          JSON.stringify(fullExecution.error),
          fullExecution.duration,
          JSON.stringify(fullExecution.metadata),
          fullExecution.createdAt.toISOString()
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return fullExecution;
  }

  async getExecutionsBySchedule(scheduleId: string, limit = 100): Promise<ScheduleExecution[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM schedule_executions WHERE schedule_id = ? ORDER BY execution_time DESC LIMIT ?',
        [scheduleId, limit],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => this.mapRowToExecution(row)));
        }
      );
    });
  }

  // Schedule conflict operations
  async createConflict(conflict: Omit<ScheduleConflict, 'id' | 'detectedAt'>): Promise<ScheduleConflict> {
    const id = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const fullConflict: ScheduleConflict = {
      id,
      ...conflict,
      detectedAt: now
    };

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `INSERT INTO schedule_conflicts (
          id, toggle_id, conflicting_schedules, conflict_type, severity,
          description, detected_at, auto_resolvable, suggested_resolution
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullConflict.id,
          fullConflict.toggleId,
          JSON.stringify(fullConflict.conflictingSchedules),
          fullConflict.conflictType,
          fullConflict.severity,
          fullConflict.description,
          fullConflict.detectedAt.toISOString(),
          fullConflict.autoResolvable ? 1 : 0,
          JSON.stringify(fullConflict.suggestedResolution)
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return fullConflict;
  }

  async getUnresolvedConflicts(): Promise<ScheduleConflict[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM schedule_conflicts WHERE resolved_at IS NULL ORDER BY severity DESC, detected_at ASC',
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => this.mapRowToConflict(row)));
        }
      );
    });
  }

  // Analytics
  async getScheduleAnalytics(startDate?: Date, endDate?: Date): Promise<ScheduleAnalytics> {
    const params: any[] = [];
    let timeFilter = '';

    if (startDate) {
      timeFilter += ' AND created_at >= ?';
      params.push(startDate.toISOString());
    }
    if (endDate) {
      timeFilter += ' AND created_at <= ?';
      params.push(endDate.toISOString());
    }

    const queries = [
      `SELECT 
        COUNT(*) as total_schedules,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_schedules,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_schedules,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_schedules
       FROM feature_toggle_schedules WHERE 1=1${timeFilter}`,

      `SELECT 
        COUNT(*) as total_executions,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_executions,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_executions,
        AVG(duration) as average_execution_time
       FROM schedule_executions WHERE 1=1${timeFilter}`,

      `SELECT action, COUNT(*) as count 
       FROM feature_toggle_schedules 
       WHERE 1=1${timeFilter} 
       GROUP BY action 
       ORDER BY count DESC 
       LIMIT 10`
    ];

    const [scheduleStats, executionStats, actionStats] = await Promise.all(
      queries.map(query => 
        new Promise<any>((resolve, reject) => {
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

    return {
      totalSchedules: scheduleStats.total_schedules || 0,
      activeSchedules: scheduleStats.active_schedules || 0,
      completedSchedules: scheduleStats.completed_schedules || 0,
      failedSchedules: scheduleStats.failed_schedules || 0,
      totalExecutions: executionStats.total_executions || 0,
      successfulExecutions: executionStats.successful_executions || 0,
      failedExecutions: executionStats.failed_executions || 0,
      averageExecutionTime: executionStats.average_execution_time || 0,
      onTimeExecutions: 0, // TODO: Calculate based on execution delays
      delayedExecutions: 0,
      averageDelay: 0,
      conflictsDetected: 0, // TODO: Query conflicts table
      conflictsResolved: 0,
      autoResolvedConflicts: 0,
      mostUsedActions: actionStats.map((stat: any) => ({
        action: stat.action as ScheduleAction,
        count: stat.count
      })),
      timeDistribution: [], // TODO: Calculate time distribution
      timezoneDistribution: [] // TODO: Calculate timezone distribution
    };
  }

  // Helper methods
  private mapRowToSchedule(row: any): FeatureToggleSchedule {
    return {
      id: row.id,
      toggleId: row.toggle_id,
      name: row.name,
      description: row.description,
      type: row.type as ScheduleType,
      action: row.action as ScheduleAction,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      timezone: row.timezone,
      recurrence: row.recurrence ? JSON.parse(row.recurrence) : undefined,
      actionConfig: JSON.parse(row.action_config),
      status: row.status as ScheduleStatus,
      enabled: Boolean(row.enabled),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      nextExecution: row.next_execution ? new Date(row.next_execution) : undefined,
      lastExecution: row.last_execution ? new Date(row.last_execution) : undefined,
      executionCount: row.execution_count,
      failureCount: row.failure_count,
      priority: row.priority,
      conflictResolution: row.conflict_resolution
    };
  }

  private mapRowToExecution(row: any): ScheduleExecution {
    return {
      id: row.id,
      scheduleId: row.schedule_id,
      toggleId: row.toggle_id,
      executionTime: new Date(row.execution_time),
      status: row.status as ExecutionStatus,
      triggeredBy: row.triggered_by,
      executionContext: JSON.parse(row.execution_context),
      beforeValue: row.before_value ? JSON.parse(row.before_value) : undefined,
      afterValue: row.after_value ? JSON.parse(row.after_value) : undefined,
      affectedUsers: row.affected_users,
      error: row.error ? JSON.parse(row.error) : undefined,
      duration: row.duration,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: new Date(row.created_at)
    };
  }

  private mapRowToConflict(row: any): ScheduleConflict {
    return {
      id: row.id,
      toggleId: row.toggle_id,
      conflictingSchedules: JSON.parse(row.conflicting_schedules),
      conflictType: row.conflict_type,
      severity: row.severity,
      description: row.description,
      detectedAt: new Date(row.detected_at),
      resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
      resolution: row.resolution,
      autoResolvable: Boolean(row.auto_resolvable),
      suggestedResolution: row.suggested_resolution ? JSON.parse(row.suggested_resolution) : undefined
    };
  }
}