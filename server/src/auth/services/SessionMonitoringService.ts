// Session Monitoring Service
// Real-time monitoring and analytics for user sessions

import { AuthConfig } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { SessionService, ActiveSession } from './SessionService';
import { AuditService } from './AuditService';
import { RedisService } from '../database/RedisService';

export interface SessionMetrics {
  totalActiveSessions: number;
  sessionsByDevice: Record<string, number>;
  sessionsByLocation: Record<string, number>;
  averageSessionDuration: number;
  suspiciousActivities: number;
  concurrentSessionsPerUser: Record<string, number>;
}

export interface SessionAlert {
  id: string;
  type: 'concurrent_limit' | 'suspicious_location' | 'unusual_device' | 'rapid_location_change' | 'session_hijack_attempt';
  userId: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  createdAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface MonitoringRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  threshold?: number;
  parameters: Record<string, any>;
  action: 'alert' | 'block' | 'require_2fa' | 'notify_user';
}

export interface SessionAnalytics {
  userId?: string;
  timeRange: { start: Date; end: Date };
  metrics: {
    totalSessions: number;
    uniqueDevices: number;
    uniqueLocations: number;
    averageDuration: number;
    peakConcurrentSessions: number;
    failedAttempts: number;
    successfulLogins: number;
  };
  patterns: {
    mostActiveHours: number[];
    commonDevices: Array<{ device: string; count: number }>;
    commonLocations: Array<{ location: string; count: number }>;
  };
  anomalies: SessionAlert[];
}

export class SessionMonitoringService {
  private config: AuthConfig;
  private dbService: DatabaseService;
  private sessionService: SessionService;
  private auditService: AuditService;
  private redisService: RedisService;
  private monitoringInterval?: NodeJS.Timer;
  private alertThresholds: Record<string, number>;

  constructor(
    config: AuthConfig,
    dbService: DatabaseService,
    sessionService: SessionService,
    auditService: AuditService,
    redisService: RedisService
  ) {
    this.config = config;
    this.dbService = dbService;
    this.sessionService = sessionService;
    this.auditService = auditService;
    this.redisService = redisService;

    // Default alert thresholds
    this.alertThresholds = {
      maxConcurrentSessions: 5,
      rapidLocationChangeMinutes: 5,
      rapidLocationChangeDistanceKm: 500,
      suspiciousDeviceScore: 0.7
    };
  }

  // Start real-time monitoring
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performMonitoringCycle();
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    }, intervalMs);

    // Perform initial monitoring
    this.performMonitoringCycle();
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  // Perform a monitoring cycle
  private async performMonitoringCycle(): Promise<void> {
    const metrics = await this.collectMetrics();
    await this.checkForAnomalies(metrics);
    await this.updateMetricsCache(metrics);
  }

  // Collect current session metrics
  async collectMetrics(): Promise<SessionMetrics> {
    const activeSessionsResult = await this.dbService.query(`
      SELECT 
        COUNT(*) as total,
        user_id,
        device_info,
        ip_address,
        user_agent,
        created_at,
        last_accessed_at
      FROM user_sessions
      WHERE NOT revoked AND expires_at > NOW()
      GROUP BY user_id, device_info, ip_address, user_agent, created_at, last_accessed_at
    `);

    const sessions = activeSessionsResult.rows;
    const totalActiveSessions = sessions.length;

    // Count sessions by device type
    const sessionsByDevice: Record<string, number> = {};
    sessions.forEach(session => {
      const deviceInfo = session.device_info || {};
      const deviceType = deviceInfo.platform || 'Unknown';
      sessionsByDevice[deviceType] = (sessionsByDevice[deviceType] || 0) + 1;
    });

    // Count sessions by location (country)
    const sessionsByLocation: Record<string, number> = {};
    for (const session of sessions) {
      const location = await this.getLocationFromIP(session.ip_address);
      const country = location?.country || 'Unknown';
      sessionsByLocation[country] = (sessionsByLocation[country] || 0) + 1;
    }

    // Calculate average session duration
    const durations = sessions.map(s => {
      const created = new Date(s.created_at);
      const lastAccessed = new Date(s.last_accessed_at);
      return lastAccessed.getTime() - created.getTime();
    });
    const averageSessionDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    // Count concurrent sessions per user
    const concurrentSessionsPerUser: Record<string, number> = {};
    sessions.forEach(session => {
      concurrentSessionsPerUser[session.user_id] = (concurrentSessionsPerUser[session.user_id] || 0) + 1;
    });

    // Count suspicious activities in the last hour
    const suspiciousResult = await this.dbService.query(`
      SELECT COUNT(*) as count
      FROM session_alerts
      WHERE created_at > NOW() - INTERVAL '1 hour' AND NOT resolved
    `);
    const suspiciousActivities = parseInt(suspiciousResult.rows[0]?.count || '0');

    return {
      totalActiveSessions,
      sessionsByDevice,
      sessionsByLocation,
      averageSessionDuration,
      suspiciousActivities,
      concurrentSessionsPerUser
    };
  }

  // Check for anomalies and generate alerts
  private async checkForAnomalies(metrics: SessionMetrics): Promise<void> {
    // Check concurrent session limits
    for (const [userId, count] of Object.entries(metrics.concurrentSessionsPerUser)) {
      if (count > this.alertThresholds.maxConcurrentSessions) {
        await this.createAlert({
          type: 'concurrent_limit',
          userId,
          severity: 'medium',
          details: {
            sessionCount: count,
            threshold: this.alertThresholds.maxConcurrentSessions
          }
        });
      }
    }

    // Check for rapid location changes
    await this.checkRapidLocationChanges();

    // Check for suspicious devices
    await this.checkSuspiciousDevices();

    // Check for potential session hijacking
    await this.checkSessionHijacking();
  }

  // Check for rapid location changes
  private async checkRapidLocationChanges(): Promise<void> {
    const result = await this.dbService.query(`
      WITH session_locations AS (
        SELECT 
          user_id,
          session_token,
          ip_address,
          created_at,
          LAG(ip_address) OVER (PARTITION BY user_id ORDER BY created_at) as prev_ip,
          LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) as prev_created
        FROM user_sessions
        WHERE created_at > NOW() - INTERVAL '24 hours'
      )
      SELECT *
      FROM session_locations
      WHERE prev_ip IS NOT NULL 
        AND ip_address != prev_ip
        AND created_at - prev_created < INTERVAL '${this.alertThresholds.rapidLocationChangeMinutes} minutes'
    `);

    for (const row of result.rows) {
      const currentLocation = await this.getLocationFromIP(row.ip_address);
      const prevLocation = await this.getLocationFromIP(row.prev_ip);

      if (currentLocation && prevLocation) {
        const distance = this.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          prevLocation.latitude,
          prevLocation.longitude
        );

        if (distance > this.alertThresholds.rapidLocationChangeDistanceKm) {
          await this.createAlert({
            type: 'rapid_location_change',
            userId: row.user_id,
            sessionId: row.session_token,
            severity: 'high',
            details: {
              fromLocation: prevLocation,
              toLocation: currentLocation,
              distanceKm: distance,
              timeMinutes: this.alertThresholds.rapidLocationChangeMinutes
            }
          });
        }
      }
    }
  }

  // Check for suspicious devices
  private async checkSuspiciousDevices(): Promise<void> {
    const result = await this.dbService.query(`
      SELECT DISTINCT
        s.user_id,
        s.id as session_id,
        s.device_info,
        s.user_agent
      FROM user_sessions s
      WHERE s.created_at > NOW() - INTERVAL '24 hours'
        AND NOT s.revoked
    `);

    for (const session of result.rows) {
      const suspiciousScore = await this.calculateDeviceSuspiciousScore(
        session.user_id,
        session.device_info,
        session.user_agent
      );

      if (suspiciousScore > this.alertThresholds.suspiciousDeviceScore) {
        await this.createAlert({
          type: 'unusual_device',
          userId: session.user_id,
          sessionId: session.session_id,
          severity: 'medium',
          details: {
            deviceInfo: session.device_info,
            userAgent: session.user_agent,
            suspiciousScore
          }
        });
      }
    }
  }

  // Check for potential session hijacking
  private async checkSessionHijacking(): Promise<void> {
    const result = await this.dbService.query(`
      SELECT 
        session_token,
        user_id,
        array_agg(DISTINCT ip_address) as ips,
        array_agg(DISTINCT user_agent) as user_agents,
        COUNT(DISTINCT ip_address) as ip_count,
        COUNT(DISTINCT user_agent) as ua_count
      FROM audit_logs
      WHERE action LIKE 'session_%' 
        AND created_at > NOW() - INTERVAL '1 hour'
        AND session_id IS NOT NULL
      GROUP BY session_token, user_id
      HAVING COUNT(DISTINCT ip_address) > 1 OR COUNT(DISTINCT user_agent) > 1
    `);

    for (const suspicious of result.rows) {
      if (suspicious.ip_count > 1 || suspicious.ua_count > 1) {
        await this.createAlert({
          type: 'session_hijack_attempt',
          userId: suspicious.user_id,
          sessionId: suspicious.session_token,
          severity: 'critical',
          details: {
            ipAddresses: suspicious.ips,
            userAgents: suspicious.user_agents,
            ipCount: suspicious.ip_count,
            userAgentCount: suspicious.ua_count
          }
        });

        // Immediately revoke the potentially compromised session
        await this.sessionService.revokeSession(
          suspicious.session_token,
          'Potential session hijacking detected'
        );
      }
    }
  }

  // Create an alert
  async createAlert(alertData: Omit<SessionAlert, 'id' | 'createdAt' | 'resolved'>): Promise<SessionAlert> {
    const id = require('crypto').randomUUID();
    const now = new Date();

    const alert: SessionAlert = {
      id,
      ...alertData,
      createdAt: now,
      resolved: false
    };

    await this.dbService.query(`
      INSERT INTO session_alerts (
        id, type, user_id, session_id, severity, details, created_at, resolved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      alert.id,
      alert.type,
      alert.userId,
      alert.sessionId,
      alert.severity,
      JSON.stringify(alert.details),
      alert.createdAt,
      false
    ]);

    // Log the alert
    await this.auditService.logEvent({
      userId: alert.userId,
      action: 'session_alert_created',
      details: {
        alertType: alert.type,
        severity: alert.severity,
        details: alert.details
      },
      sessionId: alert.sessionId,
      severity: alert.severity as any
    });

    // Take automatic action based on alert severity
    if (alert.severity === 'critical') {
      await this.handleCriticalAlert(alert);
    }

    return alert;
  }

  // Handle critical alerts
  private async handleCriticalAlert(alert: SessionAlert): Promise<void> {
    // Notify user immediately
    await this.notifyUserOfSecurityAlert(alert);

    // For session hijacking, revoke all sessions
    if (alert.type === 'session_hijack_attempt') {
      await this.sessionService.revokeAllUserSessions(alert.userId);
    }
  }

  // Resolve an alert
  async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    const now = new Date();

    await this.dbService.query(`
      UPDATE session_alerts
      SET resolved = true, resolved_at = $1, resolved_by = $2
      WHERE id = $3
    `, [now, resolvedBy, alertId]);

    await this.auditService.logEvent({
      userId: resolvedBy,
      action: 'session_alert_resolved',
      details: { alertId },
      severity: 'info'
    });
  }

  // Get active alerts
  async getActiveAlerts(filters?: {
    userId?: string;
    type?: string;
    severity?: string;
  }): Promise<SessionAlert[]> {
    let query = 'SELECT * FROM session_alerts WHERE NOT resolved';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters?.type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(filters.type);
    }

    if (filters?.severity) {
      query += ` AND severity = $${paramIndex++}`;
      params.push(filters.severity);
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.dbService.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      userId: row.user_id,
      sessionId: row.session_id,
      severity: row.severity,
      details: row.details,
      createdAt: row.created_at,
      resolved: row.resolved,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by
    }));
  }

  // Get session analytics
  async getSessionAnalytics(
    userId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<SessionAnalytics> {
    const range = timeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    let whereClause = 'WHERE created_at BETWEEN $1 AND $2';
    const params: any[] = [range.start, range.end];

    if (userId) {
      whereClause += ' AND user_id = $3';
      params.push(userId);
    }

    // Get session metrics
    const metricsResult = await this.dbService.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(DISTINCT device_info->>'fingerprint') as unique_devices,
        COUNT(DISTINCT ip_address) as unique_locations,
        AVG(EXTRACT(EPOCH FROM (last_accessed_at - created_at))) as avg_duration,
        MAX(concurrent_count) as peak_concurrent
      FROM (
        SELECT 
          *,
          COUNT(*) OVER (PARTITION BY user_id ORDER BY created_at) as concurrent_count
        FROM user_sessions
        ${whereClause}
      ) s
    `, params);

    const metrics = {
      totalSessions: parseInt(metricsResult.rows[0].total_sessions),
      uniqueDevices: parseInt(metricsResult.rows[0].unique_devices),
      uniqueLocations: parseInt(metricsResult.rows[0].unique_locations),
      averageDuration: parseFloat(metricsResult.rows[0].avg_duration) || 0,
      peakConcurrentSessions: parseInt(metricsResult.rows[0].peak_concurrent) || 0,
      failedAttempts: 0, // Will be populated from audit logs
      successfulLogins: 0 // Will be populated from audit logs
    };

    // Get login attempts from audit logs
    const loginAttemptsResult = await this.dbService.query(`
      SELECT 
        COUNT(CASE WHEN action = 'login_failed' THEN 1 END) as failed_attempts,
        COUNT(CASE WHEN action = 'login_success' THEN 1 END) as successful_logins
      FROM audit_logs
      ${whereClause} AND action IN ('login_failed', 'login_success')
    `, params);

    metrics.failedAttempts = parseInt(loginAttemptsResult.rows[0].failed_attempts);
    metrics.successfulLogins = parseInt(loginAttemptsResult.rows[0].successful_logins);

    // Get activity patterns
    const patternsResult = await this.dbService.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM user_sessions
      ${whereClause}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hour
    `, params);

    const mostActiveHours = new Array(24).fill(0);
    patternsResult.rows.forEach(row => {
      mostActiveHours[parseInt(row.hour)] = parseInt(row.count);
    });

    // Get common devices
    const devicesResult = await this.dbService.query(`
      SELECT 
        device_info->>'platform' as device,
        COUNT(*) as count
      FROM user_sessions
      ${whereClause} AND device_info IS NOT NULL
      GROUP BY device_info->>'platform'
      ORDER BY count DESC
      LIMIT 10
    `, params);

    const commonDevices = devicesResult.rows.map(row => ({
      device: row.device || 'Unknown',
      count: parseInt(row.count)
    }));

    // Get common locations
    const locationsResult = await this.dbService.query(`
      SELECT 
        ip_address,
        COUNT(*) as count
      FROM user_sessions
      ${whereClause}
      GROUP BY ip_address
      ORDER BY count DESC
      LIMIT 10
    `, params);

    const commonLocations = [];
    for (const row of locationsResult.rows) {
      const location = await this.getLocationFromIP(row.ip_address);
      commonLocations.push({
        location: location?.city || location?.country || row.ip_address,
        count: parseInt(row.count)
      });
    }

    // Get anomalies
    const anomalies = await this.getActiveAlerts({ userId });

    return {
      userId,
      timeRange: range,
      metrics,
      patterns: {
        mostActiveHours,
        commonDevices,
        commonLocations
      },
      anomalies
    };
  }

  // Update metrics cache
  private async updateMetricsCache(metrics: SessionMetrics): Promise<void> {
    const cacheKey = 'session_metrics:current';
    await this.redisService.setex(
      cacheKey,
      300, // 5 minutes TTL
      JSON.stringify({
        metrics,
        timestamp: new Date()
      })
    );
  }

  // Get cached metrics
  async getCachedMetrics(): Promise<SessionMetrics | null> {
    const cacheKey = 'session_metrics:current';
    const cached = await this.redisService.get(cacheKey);
    
    if (!cached) {
      return null;
    }

    try {
      const data = JSON.parse(cached);
      return data.metrics;
    } catch (error) {
      console.error('Error parsing cached metrics:', error);
      return null;
    }
  }

  // Helper: Get location from IP address
  private async getLocationFromIP(ipAddress: string): Promise<any> {
    // In production, use a real IP geolocation service
    // For now, return mock data
    return {
      country: 'US',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060
    };
  }

  // Helper: Calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Helper: Calculate device suspicious score
  private async calculateDeviceSuspiciousScore(
    userId: string,
    deviceInfo: any,
    userAgent: string
  ): Promise<number> {
    // Get user's device history
    const historyResult = await this.dbService.query(`
      SELECT device_info, user_agent, COUNT(*) as usage_count
      FROM user_sessions
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '90 days'
      GROUP BY device_info, user_agent
    `, [userId]);

    const knownDevices = historyResult.rows;
    
    // Simple scoring algorithm
    let score = 1.0; // Start with max suspicious score

    // Check if device has been seen before
    const matchingDevice = knownDevices.find(d => 
      JSON.stringify(d.device_info) === JSON.stringify(deviceInfo)
    );

    if (matchingDevice) {
      // Reduce score based on usage frequency
      score -= Math.min(0.5, matchingDevice.usage_count * 0.1);
    }

    // Check user agent familiarity
    const matchingUA = knownDevices.find(d => d.user_agent === userAgent);
    if (matchingUA) {
      score -= 0.3;
    }

    // Check for common suspicious patterns
    if (deviceInfo?.platform && ['Bot', 'Crawler'].includes(deviceInfo.platform)) {
      score = Math.max(score, 0.9);
    }

    return Math.max(0, Math.min(1, score));
  }

  // Helper: Notify user of security alert
  private async notifyUserOfSecurityAlert(alert: SessionAlert): Promise<void> {
    // Get user email
    const userResult = await this.dbService.query(
      'SELECT email FROM users WHERE id = $1',
      [alert.userId]
    );

    if (userResult.rows.length === 0) {
      return;
    }

    const email = userResult.rows[0].email;

    // Create notification
    await this.dbService.query(`
      INSERT INTO notifications (
        id, user_id, type, subject, body, metadata, created_at, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      require('crypto').randomUUID(),
      alert.userId,
      'security_alert',
      `Security Alert: ${alert.type.replace(/_/g, ' ').toUpperCase()}`,
      this.generateAlertNotificationBody(alert),
      JSON.stringify(alert),
      new Date(),
      'high'
    ]);
  }

  private generateAlertNotificationBody(alert: SessionAlert): string {
    const alertDescriptions = {
      concurrent_limit: 'Too many active sessions detected',
      suspicious_location: 'Login from an unusual location',
      unusual_device: 'Login from an unrecognized device',
      rapid_location_change: 'Impossible travel detected between login locations',
      session_hijack_attempt: 'Potential unauthorized access to your session'
    };

    return `
Security Alert: ${alertDescriptions[alert.type] || 'Unusual activity detected'}

We detected potentially suspicious activity on your account:
- Alert Type: ${alert.type.replace(/_/g, ' ')}
- Severity: ${alert.severity.toUpperCase()}
- Time: ${alert.createdAt.toISOString()}

Details: ${JSON.stringify(alert.details, null, 2)}

If this was you, you can safely ignore this message. If you don't recognize this activity, 
please change your password immediately and review your active sessions.

For your security, we may have automatically taken protective actions on your account.

Best regards,
Security Team
    `.trim();
  }

  // Get monitoring rules
  async getMonitoringRules(): Promise<MonitoringRule[]> {
    const result = await this.dbService.query(
      'SELECT * FROM session_monitoring_rules WHERE enabled = true ORDER BY name'
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      enabled: row.enabled,
      threshold: row.threshold,
      parameters: row.parameters,
      action: row.action
    }));
  }

  // Update monitoring rule
  async updateMonitoringRule(ruleId: string, updates: Partial<MonitoringRule>): Promise<void> {
    const allowedFields = ['name', 'enabled', 'threshold', 'parameters', 'action'];
    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return;
    }

    const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [ruleId, ...updateFields.map(field => 
      field === 'parameters' ? JSON.stringify(updates[field]) : updates[field]
    )];

    await this.dbService.query(
      `UPDATE session_monitoring_rules SET ${setClause}, updated_at = NOW() WHERE id = $1`,
      values
    );
  }
}