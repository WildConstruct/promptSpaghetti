/**
 * SessionLimitMonitor - Real-time monitoring and alerting for session limits
 * 
 * Provides comprehensive monitoring capabilities including:
 * - Real-time violation detection
 * - Performance metrics collection
 * - Alert generation and notifications
 * - Trend analysis and reporting
 * - Integration with external monitoring systems
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { SessionLimitManager, SessionLimitMetrics } from './SessionLimitManager';
// import { SessionLimitViolation } from './SessionLimitManager';
import { ConnectionManager } from '../websocket/ConnectionManager';

}
}
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  cooldownMinutes: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
}
}

}
}
export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  threshold: number;
  timeWindow: number; // minutes
  aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count';
}
}
}

}
}
export interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'pagerduty' | 'websocket' | 'log';
  target: string;
  template?: string;
  enabled: boolean;
}
}
}

}
}
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  conditions: AlertCondition[];
  triggerValues: Record<string, number>;
  status: 'open' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  metadata: Record<string, any>;
}
}
}

}
}
export interface MonitoringDashboard {
  overview: {
    totalActiveSessions: number;
    violationsLast24h: number;
    averageResponseTime: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
}
}
  };
  realTimeMetrics: {
    sessionsPerMinute: number;
    violationsPerMinute: number;
    topViolationTypes: Array<{ type: string; count: number }>;
    topUsersByViolations: Array<{ userId: string; count: number }>;
  };
  trends: {
    sessionTrends: Array<{ timestamp: Date; count: number }>;
    violationTrends: Array<{ timestamp: Date; count: number; type: string }>;
    performanceTrends: Array<{ timestamp: Date; responseTime: number; errorRate: number }>;
  };
  alerts: {
    activeAlerts: Alert[];
    recentAlerts: Alert[];
  };
}

export class SessionLimitMonitor extends EventEmitter {
  private dbService: DatabaseService;
  private redisService: RedisService;
  private auditService: AuditService;
  private sessionLimitManager: SessionLimitManager;
  private connectionManager?: ConnectionManager;
  
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private metricsHistory: SessionLimitMetrics[] = [];
  
  private monitoringInterval?: NodeJS.Timeout;
  private alertProcessingInterval?: NodeJS.Timeout;
  private metricsCollectionInterval?: NodeJS.Timeout;
  
  private readonly METRICS_RETENTION_HOURS = 168; // 7 days
  private readonly ALERT_COOLDOWN_CACHE_PREFIX = 'alert_cooldown:';
  
  constructor(
    dbService: DatabaseService,
    redisService: RedisService,
    auditService: AuditService,
    sessionLimitManager: SessionLimitManager,
    connectionManager?: ConnectionManager
  ) {
    super();
    
    this.dbService = dbService;
    this.redisService = redisService;
    this.auditService = auditService;
    this.sessionLimitManager = sessionLimitManager;
    this.connectionManager = connectionManager;
  }
  
  /**
   * Initialize the monitoring system
   */
  async initialize(): Promise<void> {

    try {
      // Create database tables
      await this.createTables();
      
      // Load alert rules
      await this.loadAlertRules();
      
      // Start monitoring processes
      this.startMetricsCollection();
      this.startRealTimeMonitoring();
      this.startAlertProcessing();
      
      console.log('SessionLimitMonitor initialized successfully');
      this.emit('monitor_initialized');
      
    } catch (error) {
      console.error('Failed to initialize SessionLimitMonitor:', error);
      throw error;
    }
  }
  
  /**
   * Start real-time monitoring
   */
  startRealTimeMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performMonitoringCycle();
      } catch (error) {
        console.error('Error in monitoring cycle:', error);
      }
    }, 60000); // Every minute
  }
  
  /**
   * Start metrics collection
   */
  startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        await this.collectAndStoreMetrics();
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, 300000); // Every 5 minutes
  }
  
  /**
   * Start alert processing
   */
  startAlertProcessing(): void {
    this.alertProcessingInterval = setInterval(async () => {
      try {
        await this.processAlerts();
      } catch (error) {
        console.error('Error processing alerts:', error);
      }
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Create or update an alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {

    try {
      const ruleId = require('crypto').randomUUID();
      const now = new Date();
      
      const alertRule: AlertRule = {
        id: ruleId,
        ...rule,
        createdAt: now,
        updatedAt: now
      };
      
      // Save to database
      await this.dbService.query(`
        INSERT INTO session_limit_alert_rules (
          id, name, description, enabled, conditions, actions, 
          cooldown_minutes, severity, tags, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        ruleId,
        rule.name,
        rule.description,
        rule.enabled,
        JSON.stringify(rule.conditions),
        JSON.stringify(rule.actions),
        rule.cooldownMinutes,
        rule.severity,
        JSON.stringify(rule.tags),
        now,
        now
      ]);
      
      // Update memory cache
      this.alertRules.set(ruleId, alertRule);
      
      this.emit('alert_rule_created', alertRule);
      
      return ruleId;
      
    } catch (error) {
      console.error('Error creating alert rule:', error);
      throw error;
    }
  }
  
  /**
   * Get monitoring dashboard data
   */
  async getDashboard(): Promise<MonitoringDashboard> {

    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Get current metrics
      const currentMetrics = await this.sessionLimitManager.getMetrics();
      
      // Get violations in last 24 hours
      const violationsResult = await this.dbService.query(`
        SELECT COUNT(*) as count FROM session_limit_violations
        WHERE created_at > $1
      `, [last24h]);
      
      const violationsLast24h = parseInt(violationsResult.rows[0]?.count || '0');
      
      // Calculate system health
      const systemHealth = this.calculateSystemHealth(currentMetrics, violationsLast24h);
      
      // Get real-time metrics
      const realTimeMetrics = await this.getRealTimeMetrics();
      
      // Get trends
      const trends = await this.getTrends();
      
      // Get active alerts
      const activeAlerts = Array.from(this.activeAlerts.values())
        .filter(alert => alert.status === 'open')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Get recent alerts
      const recentAlertsResult = await this.dbService.query(`
        SELECT * FROM session_limit_alerts
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      const recentAlerts = recentAlertsResult.rows.map(this.mapDatabaseAlert);
      
      return {
        overview: {
          totalActiveSessions: currentMetrics.activeSessionsTotal,
          violationsLast24h,
          averageResponseTime: currentMetrics.performance.averageCheckTime,
          systemHealth
  }
        realTimeMetrics,
        trends,
        alerts: {
          activeAlerts,
          recentAlerts
        }
      };
      
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
  
  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {

    try {
      const now = new Date();
      
      await this.dbService.query(`
        UPDATE session_limit_alerts
        SET status = 'acknowledged', acknowledged_by = $1, acknowledged_at = $2
        WHERE id = $3
      `, [acknowledgedBy, now, alertId]);
      
      const alert = this.activeAlerts.get(alertId);
      if (alert) {
        alert.status = 'acknowledged';
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = now;
      }
      
      this.emit('alert_acknowledged', { alertId, acknowledgedBy });
      
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  }
  
  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {

    try {
      const now = new Date();
      
      await this.dbService.query(`
        UPDATE session_limit_alerts
        SET status = 'resolved', resolved_at = $1
        WHERE id = $2
      `, [now, alertId]);
      
      const alert = this.activeAlerts.get(alertId);
      if (alert) {
        alert.status = 'resolved';
        alert.resolvedAt = now;
        this.activeAlerts.delete(alertId);
      }
      
      this.emit('alert_resolved', { alertId, resolvedBy });
      
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }
  
  /**
   * Get alert rules
   */
  async getAlertRules(): Promise<AlertRule[]> {

    return Array.from(this.alertRules.values());
  }
  
  /**
   * Update alert rule
   */
  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {

    try {
      const rule = this.alertRules.get(ruleId);
      if (!rule) {
        throw new Error('Alert rule not found');
      }
      
      const updatedRule = { ...rule, ...updates, updatedAt: new Date() };
      
      await this.dbService.query(`
        UPDATE session_limit_alert_rules
        SET name = $1, description = $2, enabled = $3, conditions = $4,
            actions = $5, cooldown_minutes = $6, severity = $7, tags = $8,
            updated_at = $9
        WHERE id = $10
      `, [
        updatedRule.name,
        updatedRule.description,
        updatedRule.enabled,
        JSON.stringify(updatedRule.conditions),
        JSON.stringify(updatedRule.actions),
        updatedRule.cooldownMinutes,
        updatedRule.severity,
        JSON.stringify(updatedRule.tags),
        updatedRule.updatedAt,
        ruleId
      ]);
      
      this.alertRules.set(ruleId, updatedRule);
      
      this.emit('alert_rule_updated', updatedRule);
      
    } catch (error) {
      console.error('Error updating alert rule:', error);
      throw error;
    }
  }
  
  /**
   * Delete alert rule
   */
  async deleteAlertRule(ruleId: string): Promise<void> {

    try {
      await this.dbService.query('DELETE FROM session_limit_alert_rules WHERE id = $1', [ruleId]);
      this.alertRules.delete(ruleId);
      
      this.emit('alert_rule_deleted', ruleId);
      
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      throw error;
    }
  }
  
  /**
   * Manually trigger an alert for testing
   */
  async triggerTestAlert(ruleId: string): Promise<void> {

    try {
      const rule = this.alertRules.get(ruleId);
      if (!rule) {
        throw new Error('Alert rule not found');
      }
      
      const alert: Alert = {
        id: require('crypto').randomUUID(),
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        title: `[TEST] ${rule.name}`,
        description: `Test alert for rule: ${rule.description}`,
        conditions: rule.conditions,
        triggerValues: { test: 1 },
        status: 'open',
        createdAt: new Date(),
        metadata: { isTest: true }
      };
      
      await this.createAlert(alert);
      
    } catch (error) {
      console.error('Error triggering test alert:', error);
      throw error;
    }
  }
  
  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<unknown> {

    try {
      const result = await this.dbService.query(`
        SELECT 
          DATE_TRUNC('hour', created_at) as hour,
          AVG(response_time_ms) as avg_response_time,
          MAX(response_time_ms) as max_response_time,
          COUNT(*) as request_count,
          COUNT(CASE WHEN error = true THEN 1 END) as error_count
        FROM session_limit_performance_logs
        WHERE created_at BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY hour
      `, [timeRange.start, timeRange.end]);
      
      return result.rows.map(row => ({
        timestamp: row.hour,
        averageResponseTime: parseFloat(row.avg_response_time),
        maxResponseTime: parseFloat(row.max_response_time),
        requestCount: parseInt(row.request_count),
        errorCount: parseInt(row.error_count),
        errorRate: row.request_count > 0 ? parseInt(row.error_count) / parseInt(row.request_count) : 0
      }));
      
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return [];
    }
  }
  
  /**
   * Cleanup old data
   */
  async cleanup(): Promise<void> {

    try {
      const cutoffDate = new Date(Date.now() - this.METRICS_RETENTION_HOURS * 60 * 60 * 1000);
      
      // Clean up old metrics
      await this.dbService.query(`
        DELETE FROM session_limit_metrics
        WHERE created_at < $1
      `, [cutoffDate]);
      
      // Clean up old performance logs
      await this.dbService.query(`
        DELETE FROM session_limit_performance_logs
        WHERE created_at < $1
      `, [cutoffDate]);
      
      // Clean up resolved alerts older than 30 days
      const oldAlertCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await this.dbService.query(`
        DELETE FROM session_limit_alerts
        WHERE status = 'resolved' AND resolved_at < $1
      `, [oldAlertCutoff]);
      
      console.log('Monitor cleanup completed');
      
    } catch (error) {
      console.error('Error during monitor cleanup:', error);
    }
  }
  
  /**
   * Shutdown the monitor
   */
  async shutdown(): Promise<void> {

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.alertProcessingInterval) {
      clearInterval(this.alertProcessingInterval);
    }
    
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }
    
    this.emit('monitor_shutdown');
    console.log('SessionLimitMonitor shut down');
  }
  
  // Private methods
  
  private async createTables(): Promise<void> {

    // Alert rules table
    await this.dbService.query(`
      CREATE TABLE IF NOT EXISTS session_limit_alert_rules (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        enabled BOOLEAN NOT NULL DEFAULT true,
        conditions JSONB NOT NULL,
        actions JSONB NOT NULL,
        cooldown_minutes INTEGER NOT NULL DEFAULT 60,
        severity VARCHAR(20) NOT NULL,
        tags JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()

    `);
    
    // Alerts table
    await this.dbService.query(`
      CREATE TABLE IF NOT EXISTS session_limit_alerts (
        id VARCHAR(255) PRIMARY KEY,
        rule_id VARCHAR(255) NOT NULL,
        rule_name VARCHAR(255) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        conditions JSONB,
        trigger_values JSONB,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        acknowledged_by VARCHAR(255),
        acknowledged_at TIMESTAMP,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        metadata JSONB

    `);
    
    // Metrics storage table
    await this.dbService.query(`
      CREATE TABLE IF NOT EXISTS session_limit_metrics (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        active_sessions_total INTEGER NOT NULL,
        violations_total INTEGER NOT NULL,
        performance_data JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()

    `);
    
    // Performance logs table
    await this.dbService.query(`
      CREATE TABLE IF NOT EXISTS session_limit_performance_logs (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        operation VARCHAR(100) NOT NULL,
        response_time_ms INTEGER NOT NULL,
        error BOOLEAN NOT NULL DEFAULT false,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()

    `);
    
    // Create indexes
    await this.dbService.query(`
      CREATE INDEX IF NOT EXISTS idx_session_limit_alerts_status 
      ON session_limit_alerts(status, created_at)
    `);
    
    await this.dbService.query(`
      CREATE INDEX IF NOT EXISTS idx_session_limit_metrics_timestamp 
      ON session_limit_metrics(timestamp)
    `);
  }
  
  private async loadAlertRules(): Promise<void> {

    const result = await this.dbService.query('SELECT * FROM session_limit_alert_rules');
    
    for (const row of result.rows) {
      this.alertRules.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        enabled: row.enabled,
        conditions: row.conditions,
        actions: row.actions,
        cooldownMinutes: row.cooldown_minutes,
        severity: row.severity,
        tags: row.tags || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    }
  }
  
  private async performMonitoringCycle(): Promise<void> {

    // Get current metrics
    const metrics = await this.sessionLimitManager.getMetrics();
    
    // Check each alert rule
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;
      
      try {
        await this.evaluateAlertRule(rule, metrics);
      } catch (error) {
        console.error(`Error evaluating alert rule ${rule.name}:`, error);
      }
    }
  }
  
  private async evaluateAlertRule(rule: AlertRule, metrics: SessionLimitMetrics): Promise<void> {

    // Check cooldown
    const cooldownKey = `${this.ALERT_COOLDOWN_CACHE_PREFIX}${rule.id}`;
    const inCooldown = await this.redisService.exists(cooldownKey);
    
    if (inCooldown) {
      return;
    }
    
    // Evaluate conditions
    const triggered = await this.evaluateConditions(rule.conditions, metrics);
    
    if (triggered.isTriggered) {
      const alert: Alert = {
        id: require('crypto').randomUUID(),
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        title: `Session Limit Alert: ${rule.name}`,
        description: rule.description,
        conditions: rule.conditions,
        triggerValues: triggered.values,
        status: 'open',
        createdAt: new Date(),
        metadata: {}
      };
      
      await this.createAlert(alert);
      
      // Set cooldown
      await this.redisService.setex(cooldownKey, rule.cooldownMinutes * 60, '1');
    }
  }
  
  private async evaluateConditions(
    conditions: AlertCondition[], 
    metrics: SessionLimitMetrics
  ): Promise<{ isTriggered: boolean; values: Record<string, number> }> {
    const values: Record<string, number> = {};
    let allConditionsMet = true;
    
    for (const condition of conditions) {
      const value = await this.getMetricValue(condition, metrics);
      values[condition.metric] = value;
      
      const conditionMet = this.evaluateCondition(condition, value);
      if (!conditionMet) {
        allConditionsMet = false;
        break;
      }
    }
    
    return {
      isTriggered: allConditionsMet,
      values
    };
  }
  
  private async getMetricValue(condition: AlertCondition, metrics: SessionLimitMetrics): Promise<number> {

    switch (condition.metric) {
    case 'active_sessions_total':
      return metrics.activeSessionsTotal;
    case 'violations_total':
      return metrics.violations.total;
    case 'violations_pending':
      return metrics.violations.pending;
    case 'response_time':
      return metrics.performance.averageCheckTime;
    case 'error_rate':
      return metrics.performance.errorRate;
    default:
      return 0;
    }
  }
  
  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
    case 'gt':
      return value > condition.threshold;
    case 'gte':
      return value >= condition.threshold;
    case 'lt':
      return value < condition.threshold;
    case 'lte':
      return value <= condition.threshold;
    case 'eq':
      return value === condition.threshold;
    case 'neq':
      return value !== condition.threshold;
    default:
      return false;
    }
  }
  
  private async createAlert(alert: Alert): Promise<void> {

    // Save to database
    await this.dbService.query(`
      INSERT INTO session_limit_alerts (
        id, rule_id, rule_name, severity, title, description,
        conditions, trigger_values, status, created_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      alert.id,
      alert.ruleId,
      alert.ruleName,
      alert.severity,
      alert.title,
      alert.description,
      JSON.stringify(alert.conditions),
      JSON.stringify(alert.triggerValues),
      alert.status,
      alert.createdAt,
      JSON.stringify(alert.metadata)
    ]);
    
    // Add to active alerts
    this.activeAlerts.set(alert.id, alert);
    
    // Execute alert actions
    const rule = this.alertRules.get(alert.ruleId);
    if (rule) {
      await this.executeAlertActions(alert, rule.actions);
    }
    
    this.emit('alert_created', alert);
  }
  
  private async executeAlertActions(alert: Alert, actions: AlertAction[]): Promise<void> {

    for (const action of actions) {
      if (!action.enabled) continue;
      
      try {
        await this.executeAlertAction(alert, action);
      } catch (error) {
        console.error(`Error executing alert action ${action.type}:`, error);
      }
    }
  }
  
  private async executeAlertAction(alert: Alert, action: AlertAction): Promise<void> {

    switch (action.type) {
    case 'websocket':
      if (this.connectionManager) {
        // Broadcast to admin connections
        // Implementation would depend on connection manager API
        console.log('Broadcasting alert via WebSocket:', alert.title);
      }
      break;
        
    case 'log':
      console.log(`ALERT [${alert.severity.toUpperCase()}]: ${alert.title}`);
      break;
        
    case 'webhook':
      await this.sendWebhookAlert(action.target, alert);
      break;
        
    default:
      console.log(`Unsupported alert action type: ${action.type}`);
    }
  }
  
  private async sendWebhookAlert(webhookUrl: string, alert: Alert): Promise<void> {

    // Implementation for webhook alerts
    console.log(`Sending webhook alert to ${webhookUrl}:`, alert.title);
  }
  
  private async collectAndStoreMetrics(): Promise<void> {

    try {
      const metrics = await this.sessionLimitManager.getMetrics();
      
      await this.dbService.query(`
        INSERT INTO session_limit_metrics (
          timestamp, active_sessions_total, violations_total, performance_data
        ) VALUES ($1, $2, $3, $4)
      `, [
        metrics.timestamp,
        metrics.activeSessionsTotal,
        metrics.violations.total,
        JSON.stringify(metrics.performance)
      ]);
      
      // Keep in-memory history for quick access
      this.metricsHistory.push(metrics);
      
      // Keep only last 24 hours in memory
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metricsHistory = this.metricsHistory.filter(m => m.timestamp > cutoff);
      
    } catch (error) {
      console.error('Error collecting and storing metrics:', error);
    }
  }
  
  private async processAlerts(): Promise<void> {

    // Auto-resolve alerts that are no longer applicable
    // Implementation would check current conditions against active alerts
  }
  
  private calculateSystemHealth(
    metrics: SessionLimitMetrics, 
    violationsLast24h: number
  ): 'healthy' | 'warning' | 'critical' {
    if (metrics.performance.errorRate > 0.05 || violationsLast24h > 100) {
      return 'critical';
    }
    
    if (metrics.performance.errorRate > 0.01 || violationsLast24h > 50) {
      return 'warning';
    }
    
    return 'healthy';
  }
  
  private async getRealTimeMetrics(): Promise<unknown> {

    // Implementation for real-time metrics calculation
    return {
      sessionsPerMinute: 0,
      violationsPerMinute: 0,
      topViolationTypes: [],
      topUsersByViolations: []
    };
  }
  
  private async getTrends(): Promise<unknown> {

    // Implementation for trend calculation
    return {
      sessionTrends: [],
      violationTrends: [],
      performanceTrends: []
    };
  }
  
  private mapDatabaseAlert(row: unknown): Alert {
    return {
      id: row.id,
      ruleId: row.rule_id,
      ruleName: row.rule_name,
      severity: row.severity,
      title: row.title,
      description: row.description,
      conditions: row.conditions,
      triggerValues: row.trigger_values,
      status: row.status,
      acknowledgedBy: row.acknowledged_by,
      acknowledgedAt: row.acknowledged_at,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      metadata: row.metadata || {}
    };
  }
}