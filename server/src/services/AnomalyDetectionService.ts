// Security Anomaly Detection Service
// Detects and responds to security threats and unusual patterns

import { EventEmitter } from 'events';
import { AuditService } from '../auth/services/AuditService';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';

export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  threshold: number;
  windowSizeMinutes: number;
  conditions: {
    events: string[];
    fieldMatches?: Record<string, string | RegExp>;
    aggregateType: 'count' | 'rate' | 'distinct_count' | 'average';
    comparisonOperator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  };
  actions: AnomalyAction[];
}

export interface AnomalyAction {
  type: 'notify' | 'block_ip' | 'disable_account' | 'require_2fa' | 'create_incident';
  config: Record<string, unknown>;
  delay?: number; // Delay in seconds before executing
}

export interface AnomalyEvent {
  id: string;
  patternId: string;
  patternName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  triggerValue: number;
  threshold: number;
  affectedEntities: {
    userId?: string;
    ipAddress?: string;
    sessionId?: string;
    resource?: string;
  };
  eventData: unknown[];
  description: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  falsePositive: boolean;
}

export interface AnomalyDetectionConfig {
  enabled: boolean;
  checkIntervalSeconds: number;
  retentionDays: number;
  patterns: AnomalyPattern[];
  notification: {
    webhook?: string;
    email?: string[];
    slack?: string;
  };
  responseConfig: {
    autoBlock: boolean;
    autoDisable: boolean;
    requireManualReview: boolean;
  };
}

export class AnomalyDetectionService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private config: AnomalyDetectionConfig;
  private checkInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    auditService: AuditService,
    config: AnomalyDetectionConfig
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.auditService = auditService;
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Initialize database tables
    await this.initializeTables();
    
    // Load pattern configurations
    await this.loadPatterns();
    
    // Start periodic anomaly detection
    this.checkInterval = setInterval(
      () => this.performAnomalyCheck(),
      this.config.checkIntervalSeconds * 1000
    );

    console.log('Anomaly Detection Service started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }

    console.log('Anomaly Detection Service stopped');
  }

  private async initializeTables(): Promise<void> {
    // Create anomaly patterns table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS anomaly_patterns (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        enabled BOOLEAN DEFAULT true,
        threshold DECIMAL(10,2) NOT NULL,
        window_size_minutes INTEGER NOT NULL,
        conditions JSONB NOT NULL,
        actions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create anomaly events table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS anomaly_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pattern_id VARCHAR(255) NOT NULL REFERENCES anomaly_patterns(id),
        pattern_name VARCHAR(255) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        trigger_value DECIMAL(10,2) NOT NULL,
        threshold DECIMAL(10,2) NOT NULL,
        affected_entities JSONB,
        event_data JSONB,
        description TEXT,
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        resolved_by VARCHAR(255),
        false_positive BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create anomaly actions log table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS anomaly_actions_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        anomaly_event_id UUID NOT NULL REFERENCES anomaly_events(id),
        action_type VARCHAR(50) NOT NULL,
        action_config JSONB,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
        executed_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_anomaly_events_timestamp ON anomaly_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_anomaly_events_pattern_id ON anomaly_events(pattern_id);
      CREATE INDEX IF NOT EXISTS idx_anomaly_events_severity ON anomaly_events(severity);
      CREATE INDEX IF NOT EXISTS idx_anomaly_events_resolved ON anomaly_events(resolved);
    `);
  }

  private async loadPatterns(): Promise<void> {
    // Insert default patterns if they don't exist
    const defaultPatterns = this.getDefaultPatterns();
    
    for (const pattern of defaultPatterns) {
      await this.db.query(`
        INSERT INTO anomaly_patterns (
          id, name, description, severity, enabled, threshold, 
          window_size_minutes, conditions, actions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = $2,
          description = $3,
          severity = $4,
          enabled = $5,
          threshold = $6,
          window_size_minutes = $7,
          conditions = $8,
          actions = $9,
          updated_at = NOW()
      `, [
        pattern.id,
        pattern.name,
        pattern.description,
        pattern.severity,
        pattern.enabled,
        pattern.threshold,
        pattern.windowSizeMinutes,
        JSON.stringify(pattern.conditions),
        JSON.stringify(pattern.actions)
      ]);
    }
  }

  private getDefaultPatterns(): AnomalyPattern[] {
    return [
      {
        id: 'brute-force-login',
        name: 'Brute Force Login Detection',
        description: 'Detects multiple failed login attempts from the same IP',
        severity: 'high',
        enabled: true,
        threshold: 10,
        windowSizeMinutes: 5,
        conditions: {
          events: ['login_failed'],
          aggregateType: 'count',
          comparisonOperator: '>='
        },
        actions: [
          {
            type: 'block_ip',
            config: { duration: 3600 } // 1 hour
          },
          {
            type: 'notify',
            config: { 
              message: 'Brute force attack detected',
              channels: ['security', 'ops']
            }
          }
        ]
      },
      {
        id: 'credential-stuffing',
        name: 'Credential Stuffing Detection',
        description: 'Detects login attempts across multiple accounts from same IP',
        severity: 'high',
        enabled: true,
        threshold: 15,
        windowSizeMinutes: 10,
        conditions: {
          events: ['login_failed'],
          aggregateType: 'distinct_count',
          comparisonOperator: '>='
        },
        actions: [
          {
            type: 'block_ip',
            config: { duration: 7200 } // 2 hours
          },
          {
            type: 'create_incident',
            config: { 
              priority: 'high',
              category: 'credential_stuffing'
            }
          }
        ]
      },
      {
        id: 'suspicious-privilege-escalation',
        name: 'Suspicious Privilege Escalation',
        description: 'Detects rapid role changes or permission escalations',
        severity: 'critical',
        enabled: true,
        threshold: 3,
        windowSizeMinutes: 15,
        conditions: {
          events: ['role_changed', 'permission_granted'],
          aggregateType: 'count',
          comparisonOperator: '>='
        },
        actions: [
          {
            type: 'disable_account',
            config: { reason: 'Suspicious privilege escalation detected' }
          },
          {
            type: 'require_2fa',
            config: { enforceImmediate: true }
          },
          {
            type: 'notify',
            config: { 
              urgency: 'critical',
              escalate: true
            }
          }
        ]
      },
      {
        id: 'anomalous-data-access',
        name: 'Anomalous Data Access Pattern',
        description: 'Detects unusual data access patterns or bulk data retrieval',
        severity: 'medium',
        enabled: true,
        threshold: 100,
        windowSizeMinutes: 5,
        conditions: {
          events: ['data_access', 'export_requested'],
          aggregateType: 'count',
          comparisonOperator: '>='
        },
        actions: [
          {
            type: 'notify',
            config: { 
              message: 'Unusual data access pattern detected',
              requireReview: true
            }
          }
        ]
      },
      {
        id: 'geographic-anomaly',
        name: 'Geographic Location Anomaly',
        description: 'Detects login from unusual geographic locations',
        severity: 'medium',
        enabled: true,
        threshold: 1,
        windowSizeMinutes: 60,
        conditions: {
          events: ['login_success'],
          fieldMatches: { 'details.newLocation': 'true' },
          aggregateType: 'count',
          comparisonOperator: '>='
        },
        actions: [
          {
            type: 'require_2fa',
            config: { temporary: true, duration: 86400 } // 24 hours
          },
          {
            type: 'notify',
            config: { 
              user: true,
              message: 'Login from new location detected'
            }
          }
        ]
      }
    ];
  }

  private async performAnomalyCheck(): Promise<void> {
    try {
      // Get all enabled patterns
      const patterns = await this.getEnabledPatterns();
      
      for (const pattern of patterns) {
        await this.checkPattern(pattern);
      }
    } catch (error) {
      console.error('Error during anomaly check:', error);
      this.emit('error', error);
    }
  }

  private async getEnabledPatterns(): Promise<AnomalyPattern[]> {
    const result = await this.db.query(`
      SELECT * FROM anomaly_patterns 
      WHERE enabled = true
      ORDER BY severity DESC, name
    `);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      severity: row.severity,
      enabled: row.enabled,
      threshold: parseFloat(row.threshold),
      windowSizeMinutes: row.window_size_minutes,
      conditions: row.conditions,
      actions: row.actions
    }));
  }

  private async checkPattern(pattern: AnomalyPattern): Promise<void> {
    try {
      const windowStart = new Date(Date.now() - pattern.windowSizeMinutes * 60 * 1000);
      
      // Build query based on pattern conditions
      const query = this.buildAnomalyQuery(pattern, windowStart);
      const result = await this.db.query(query.sql, query.params);
      
      // Check if threshold is exceeded
      for (const row of result.rows) {
        const triggerValue = this.extractTriggerValue(row, pattern.conditions.aggregateType);
        
        if (this.evaluateThreshold(triggerValue, pattern.threshold, pattern.conditions.comparisonOperator)) {
          await this.createAnomalyEvent(pattern, triggerValue, row);
        }
      }
    } catch (error) {
      console.error(`Error checking pattern ${pattern.id}:`, error);
    }
  }

  private buildAnomalyQuery(pattern: AnomalyPattern, windowStart: Date): { sql: string; params: unknown[] } {
    const events = pattern.conditions.events.map(e => `'${e}'`).join(', ');
    let sql = `
      SELECT 
        ip_address,
        user_id,
        session_id,
        details,
        COUNT(*) as event_count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips,
        MIN(created_at) as first_event,
        MAX(created_at) as last_event,
        array_agg(details) as event_details
      FROM audit_logs 
      WHERE action IN (${events})
        AND created_at >= $1
    `;

    const params: unknown[] = [windowStart];

    // Add field matches if specified
    if (pattern.conditions.fieldMatches) {
      let paramIndex = 2;
      for (const [field, value] of Object.entries(pattern.conditions.fieldMatches)) {
        if (value instanceof RegExp) {
          sql += ` AND details->>'${field}' ~ $${paramIndex}`;
          params.push(value.source);
        } else {
          sql += ` AND details->>'${field}' = $${paramIndex}`;
          params.push(value);
        }
        paramIndex++;
      }
    }

    // Group by appropriate fields based on aggregate type
    if (pattern.conditions.aggregateType === 'distinct_count') {
      sql += ' GROUP BY ip_address';
    } else {
      sql += ' GROUP BY ip_address, user_id, session_id';
    }

    return { sql, params };
  }

  private extractTriggerValue(row: unknown, aggregateType: string): number {
    const record = row as Record<string, unknown>;
    
    switch (aggregateType) {
      case 'count':
        return parseInt(record.event_count as string);
      case 'distinct_count':
        return parseInt(record.unique_users as string);
      case 'rate':
        const duration = (new Date(record.last_event as string).getTime() - 
                         new Date(record.first_event as string).getTime()) / 1000;
        return duration > 0 ? parseInt(record.event_count as string) / duration : 0;
      case 'average':
        return parseFloat(record.event_count as string); // Simplified
      default:
        return 0;
    }
  }

  private evaluateThreshold(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  private async createAnomalyEvent(
    pattern: AnomalyPattern, 
    triggerValue: number, 
    eventData: unknown
  ): Promise<string> {
    const record = eventData as Record<string, unknown>;
    
    // Check if similar anomaly was already detected recently
    const recentSimilar = await this.db.query(`
      SELECT id FROM anomaly_events 
      WHERE pattern_id = $1 
        AND affected_entities->>'ipAddress' = $2
        AND timestamp >= NOW() - INTERVAL '10 minutes'
        AND resolved = false
      LIMIT 1
    `, [pattern.id, record.ip_address]);

    if (recentSimilar.rows.length > 0) {
      return recentSimilar.rows[0].id; // Don't create duplicate
    }

    const affectedEntities = {
      userId: record.user_id as string,
      ipAddress: record.ip_address as string,
      sessionId: record.session_id as string
    };

    const description = `${pattern.name}: Threshold ${pattern.threshold} exceeded with value ${triggerValue}`;

    const result = await this.db.query(`
      INSERT INTO anomaly_events (
        pattern_id, pattern_name, severity, trigger_value, threshold,
        affected_entities, event_data, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      pattern.id,
      pattern.name,
      pattern.severity,
      triggerValue,
      pattern.threshold,
      JSON.stringify(affectedEntities),
      JSON.stringify(eventData),
      description
    ]);

    const anomalyEventId = result.rows[0].id;

    // Execute actions
    await this.executeActions(pattern.actions, anomalyEventId, affectedEntities);

    // Emit event for real-time notifications
    this.emit('anomaly_detected', {
      id: anomalyEventId,
      patternId: pattern.id,
      severity: pattern.severity,
      description,
      affectedEntities
    });

    return anomalyEventId;
  }

  private async executeActions(
    actions: AnomalyAction[], 
    anomalyEventId: string, 
    affectedEntities: Record<string, unknown>
  ): Promise<void> {
    for (const action of actions) {
      try {
        // Log action attempt
        const actionLogResult = await this.db.query(`
          INSERT INTO anomaly_actions_log (
            anomaly_event_id, action_type, action_config, status
          ) VALUES ($1, $2, $3, 'pending')
          RETURNING id
        `, [anomalyEventId, action.type, JSON.stringify(action.config)]);

        const actionLogId = actionLogResult.rows[0].id;

        // Execute action with optional delay
        if (action.delay) {
          setTimeout(() => this.performAction(action, affectedEntities, actionLogId), action.delay * 1000);
        } else {
          await this.performAction(action, affectedEntities, actionLogId);
        }
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  private async performAction(
    action: AnomalyAction, 
    affectedEntities: Record<string, unknown>,
    actionLogId: string
  ): Promise<void> {
    try {
      switch (action.type) {
        case 'block_ip':
          await this.blockIP(affectedEntities.ipAddress as string, action.config);
          break;
        case 'disable_account':
          await this.disableAccount(affectedEntities.userId as string, action.config);
          break;
        case 'require_2fa':
          await this.requireTwoFactor(affectedEntities.userId as string, action.config);
          break;
        case 'notify':
          await this.sendNotification(action.config, affectedEntities);
          break;
        case 'create_incident':
          await this.createIncident(action.config, affectedEntities);
          break;
      }

      // Mark action as executed
      await this.db.query(`
        UPDATE anomaly_actions_log 
        SET status = 'executed', executed_at = NOW()
        WHERE id = $1
      `, [actionLogId]);

    } catch (error) {
      // Mark action as failed
      await this.db.query(`
        UPDATE anomaly_actions_log 
        SET status = 'failed', error_message = $2
        WHERE id = $1
      `, [actionLogId, error.message]);
      
      throw error;
    }
  }

  private async blockIP(ipAddress: string, config: Record<string, unknown>): Promise<void> {
    const duration = config.duration as number || 3600;
    const expiresAt = new Date(Date.now() + duration * 1000);
    
    await this.redis.setex(`blocked_ip:${ipAddress}`, duration, JSON.stringify({
      blockedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      reason: 'Anomaly detection auto-block',
      config
    }));

    console.log(`Blocked IP ${ipAddress} for ${duration} seconds`);
  }

  private async disableAccount(userId: string, config: Record<string, unknown>): Promise<void> {
    const reason = config.reason as string || 'Account disabled due to security anomaly';
    
    await this.db.query(`
      UPDATE users 
      SET account_locked = true, locked_until = NOW() + INTERVAL '24 hours', lock_reason = $2
      WHERE id = $1
    `, [userId, reason]);

    console.log(`Disabled account ${userId}: ${reason}`);
  }

  private async requireTwoFactor(userId: string, config: Record<string, unknown>): Promise<void> {
    const temporary = config.temporary as boolean || false;
    const duration = config.duration as number || 86400;
    
    if (temporary) {
      await this.redis.setex(`require_2fa:${userId}`, duration, JSON.stringify({
        requiredAt: new Date().toISOString(),
        reason: 'Security anomaly detected',
        config
      }));
    } else {
      await this.db.query(`
        UPDATE users 
        SET two_factor_required = true 
        WHERE id = $1
      `, [userId]);
    }

    console.log(`Required 2FA for user ${userId}`);
  }

  private async sendNotification(config: Record<string, unknown>, affectedEntities: Record<string, unknown>): Promise<void> {
    // Emit notification event for external handlers
    this.emit('notification_required', {
      config,
      affectedEntities,
      timestamp: new Date()
    });

    console.log('Notification sent:', config);
  }

  private async createIncident(config: Record<string, unknown>, affectedEntities: Record<string, unknown>): Promise<void> {
    // Create incident record
    await this.db.query(`
      INSERT INTO security_incidents (
        title, description, priority, category, affected_entities, 
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'open', NOW())
    `, [
      `Security Anomaly: ${config.category || 'Unknown'}`,
      `Automated incident created due to anomaly detection`,
      config.priority || 'medium',
      config.category || 'anomaly',
      JSON.stringify(affectedEntities)
    ]);

    console.log('Security incident created:', config);
  }

  async getAnomalyEvents(filters: {
    severity?: string;
    resolved?: boolean;
    patternId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AnomalyEvent[]> {
    let sql = 'SELECT * FROM anomaly_events WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.severity) {
      sql += ` AND severity = $${paramIndex}`;
      params.push(filters.severity);
      paramIndex++;
    }

    if (filters.resolved !== undefined) {
      sql += ` AND resolved = $${paramIndex}`;
      params.push(filters.resolved);
      paramIndex++;
    }

    if (filters.patternId) {
      sql += ` AND pattern_id = $${paramIndex}`;
      params.push(filters.patternId);
      paramIndex++;
    }

    sql += ' ORDER BY timestamp DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const result = await this.db.query(sql, params);
    
    return result.rows.map(row => ({
      id: row.id,
      patternId: row.pattern_id,
      patternName: row.pattern_name,
      severity: row.severity,
      timestamp: row.timestamp,
      triggerValue: parseFloat(row.trigger_value),
      threshold: parseFloat(row.threshold),
      affectedEntities: row.affected_entities,
      eventData: row.event_data,
      description: row.description,
      resolved: row.resolved,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by,
      falsePositive: row.false_positive
    }));
  }

  async resolveAnomaly(
    anomalyId: string, 
    resolvedBy: string, 
    falsePositive = false
  ): Promise<void> {
    await this.db.query(`
      UPDATE anomaly_events 
      SET resolved = true, resolved_at = NOW(), resolved_by = $2, false_positive = $3
      WHERE id = $1
    `, [anomalyId, resolvedBy, falsePositive]);
  }

  async getAnomalyStatistics(): Promise<Record<string, unknown>> {
    const stats = await this.db.query(`
      SELECT 
        COUNT(*) as total_anomalies,
        COUNT(*) FILTER (WHERE resolved = true) as resolved_anomalies,
        COUNT(*) FILTER (WHERE false_positive = true) as false_positives,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical_anomalies,
        COUNT(*) FILTER (WHERE severity = 'high') as high_anomalies,
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '24 hours') as anomalies_24h,
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days') as anomalies_7d
      FROM anomaly_events
    `);

    return stats.rows[0];
  }
}