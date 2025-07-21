/**
 * Classification Monitoring Service
 * 
 * Monitors data classification activities in real-time, tracks patterns,
 * and provides insights into data classification usage and compliance.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import { 
  DataClassificationLevel, 
  OperationContext,
  ValidationResult
} from '../types/DataClassification';

export interface MonitoringEvent {
  id: string;
  timestamp: Date;
  eventType: 'CLASSIFICATION' | 'ACCESS' | 'VALIDATION' | 'POLICY_CHANGE' | 'VIOLATION' | 'COMPLIANCE_CHECK';
  classification: DataClassificationLevel;
  userId: string;
  dataId: string;
  operation: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details: Record<string, any>;
  context: OperationContext;
  metrics?: MonitoringMetrics;
}

export interface MonitoringMetrics {
  processingTimeMs: number;
  dataSize?: number;
  violationCount?: number;
  complianceScore?: number;
  riskScore?: number;
}

export interface ClassificationStats {
  classification: DataClassificationLevel;
  totalEvents: number;
  successCount: number;
  failureCount: number;
  warningCount: number;
  averageProcessingTime: number;
  violationRate: number;
  complianceRate: number;
  lastUpdated: Date;
}

export interface UserActivity {
  userId: string;
  totalEvents: number;
  classificationCounts: Record<DataClassificationLevel, number>;
  violationCount: number;
  lastActivity: Date;
  riskScore: number;
  suspiciousActivities: string[];
}

export interface MonitoringAlert {
  id: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'THRESHOLD_EXCEEDED' | 'UNUSUAL_PATTERN' | 'COMPLIANCE_VIOLATION' | 'SECURITY_RISK';
  message: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface MonitoringThreshold {
  name: string;
  description: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
}

export interface MonitoringDashboard {
  overallStats: {
    totalEvents: number;
    successRate: number;
    averageProcessingTime: number;
    activeUsers: number;
    violationCount: number;
    complianceScore: number;
  };
  classificationBreakdown: ClassificationStats[];
  topUsers: UserActivity[];
  recentAlerts: MonitoringAlert[];
  trendData: {
    timestamp: Date;
    eventCount: number;
    violationCount: number;
    complianceScore: number;
  }[];
}

export class ClassificationMonitoringService {
  private events: MonitoringEvent[] = [];
  private alerts: MonitoringAlert[] = [];
  private thresholds: Map<string, MonitoringThreshold> = new Map();
  private userActivities: Map<string, UserActivity> = new Map();
  private classificationStats: Map<DataClassificationLevel, ClassificationStats> = new Map();
  private realTimeHandlers: ((event: MonitoringEvent) => void)[] = [];
  private alertHandlers: ((alert: MonitoringAlert) => void)[] = [];

  constructor() {
    this.initializeDefaultThresholds();
    this.initializeClassificationStats();
  }

  /**
   * Initialize default monitoring thresholds
   */
  private initializeDefaultThresholds(): void {
    const defaultThresholds: MonitoringThreshold[] = [
      {
        name: 'high-violation-rate',
        description: 'High rate of access violations',
        metric: 'violationRate',
        operator: '>',
        value: 0.1, // 10% violation rate
        severity: 'HIGH',
        enabled: true,
        cooldownMinutes: 30
      },
      {
        name: 'low-compliance-score',
        description: 'Compliance score below threshold',
        metric: 'complianceScore',
        operator: '<',
        value: 80,
        severity: 'MEDIUM',
        enabled: true,
        cooldownMinutes: 60
      },
      {
        name: 'restricted-data-surge',
        description: 'Unusual spike in restricted data access',
        metric: 'restrictedAccessRate',
        operator: '>',
        value: 50, // 50 accesses per hour
        severity: 'CRITICAL',
        enabled: true,
        cooldownMinutes: 15
      },
      {
        name: 'processing-time-exceeded',
        description: 'Average processing time too high',
        metric: 'averageProcessingTime',
        operator: '>',
        value: 1000, // 1 second
        severity: 'LOW',
        enabled: true,
        cooldownMinutes: 120
      },
      {
        name: 'user-violation-threshold',
        description: 'User exceeded violation threshold',
        metric: 'userViolationCount',
        operator: '>',
        value: 5,
        severity: 'HIGH',
        enabled: true,
        cooldownMinutes: 60
      }
    ];

    defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.name, threshold);
    });
  }

  /**
   * Initialize classification statistics
   */
  private initializeClassificationStats(): void {
    const classifications: DataClassificationLevel[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
    
    classifications.forEach(classification => {
      this.classificationStats.set(classification, {
        classification,
        totalEvents: 0,
        successCount: 0,
        failureCount: 0,
        warningCount: 0,
        averageProcessingTime: 0,
        violationRate: 0,
        complianceRate: 100,
        lastUpdated: new Date()
      });
    });
  }

  /**
   * Record a monitoring event
   */
  async recordEvent(event: Omit<MonitoringEvent, 'id'>): Promise<void> {
    const monitoringEvent: MonitoringEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...event
    };

    // Store event
    this.events.push(monitoringEvent);

    // Update statistics
    this.updateStatistics(monitoringEvent);

    // Update user activity
    this.updateUserActivity(monitoringEvent);

    // Check thresholds
    await this.checkThresholds(monitoringEvent);

    // Notify real-time handlers
    this.notifyRealTimeHandlers(monitoringEvent);

    // Cleanup old events (keep last 10000)
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }

  /**
   * Update classification statistics
   */
  private updateStatistics(event: MonitoringEvent): void {
    const stats = this.classificationStats.get(event.classification);
    if (!stats) return;

    stats.totalEvents++;
    
    switch (event.result) {
      case 'SUCCESS':
        stats.successCount++;
        break;
      case 'FAILURE':
        stats.failureCount++;
        break;
      case 'WARNING':
        stats.warningCount++;
        break;
    }

    // Update processing time (moving average)
    if (event.metrics?.processingTimeMs) {
      stats.averageProcessingTime = 
        (stats.averageProcessingTime * (stats.totalEvents - 1) + event.metrics.processingTimeMs) / 
        stats.totalEvents;
    }

    // Update violation rate
    if (event.eventType === 'VIOLATION') {
      stats.violationRate = stats.failureCount / stats.totalEvents;
    }

    // Update compliance rate
    if (event.eventType === 'COMPLIANCE_CHECK' && event.metrics?.complianceScore !== undefined) {
      stats.complianceRate = 
        (stats.complianceRate * (stats.totalEvents - 1) + event.metrics.complianceScore) / 
        stats.totalEvents;
    }

    stats.lastUpdated = new Date();
  }

  /**
   * Update user activity tracking
   */
  private updateUserActivity(event: MonitoringEvent): void {
    let activity = this.userActivities.get(event.userId);
    
    if (!activity) {
      activity = {
        userId: event.userId,
        totalEvents: 0,
        classificationCounts: {
          PUBLIC: 0,
          INTERNAL: 0,
          CONFIDENTIAL: 0,
          RESTRICTED: 0
        },
        violationCount: 0,
        lastActivity: new Date(),
        riskScore: 0,
        suspiciousActivities: []
      };
      this.userActivities.set(event.userId, activity);
    }

    activity.totalEvents++;
    activity.classificationCounts[event.classification]++;
    activity.lastActivity = new Date();

    if (event.result === 'FAILURE' && event.eventType === 'VIOLATION') {
      activity.violationCount++;
      
      // Check for suspicious patterns
      this.detectSuspiciousActivity(activity, event);
    }

    // Update risk score
    activity.riskScore = this.calculateUserRiskScore(activity);
  }

  /**
   * Detect suspicious activity patterns
   */
  private detectSuspiciousActivity(activity: UserActivity, event: MonitoringEvent): void {
    // Rapid access to restricted data
    const recentRestrictedAccess = this.events.filter(e => 
      e.userId === event.userId &&
      e.classification === 'RESTRICTED' &&
      e.timestamp.getTime() > Date.now() - 3600000 // Last hour
    ).length;

    if (recentRestrictedAccess > 10) {
      activity.suspiciousActivities.push('Rapid access to restricted data');
    }

    // Multiple violations in short time
    const recentViolations = this.events.filter(e => 
      e.userId === event.userId &&
      e.result === 'FAILURE' &&
      e.timestamp.getTime() > Date.now() - 900000 // Last 15 minutes
    ).length;

    if (recentViolations > 3) {
      activity.suspiciousActivities.push('Multiple access violations');
    }

    // Access pattern anomaly
    const hourOfDay = new Date().getHours();
    if (hourOfDay < 6 || hourOfDay > 22) {
      activity.suspiciousActivities.push('Unusual access time');
    }

    // Keep only unique suspicious activities
    activity.suspiciousActivities = [...new Set(activity.suspiciousActivities)];
  }

  /**
   * Calculate user risk score
   */
  private calculateUserRiskScore(activity: UserActivity): number {
    let riskScore = 0;

    // Violation rate contribution (0-30 points)
    const violationRate = activity.violationCount / activity.totalEvents;
    riskScore += Math.min(violationRate * 100, 30);

    // Restricted data access contribution (0-30 points)
    const restrictedRate = activity.classificationCounts.RESTRICTED / activity.totalEvents;
    riskScore += Math.min(restrictedRate * 60, 30);

    // Suspicious activities contribution (0-20 points)
    riskScore += Math.min(activity.suspiciousActivities.length * 5, 20);

    // Recent activity contribution (0-20 points)
    const minutesSinceLastActivity = (Date.now() - activity.lastActivity.getTime()) / 60000;
    if (minutesSinceLastActivity < 5) {
      riskScore += 20; // Very recent activity
    } else if (minutesSinceLastActivity < 60) {
      riskScore += 10; // Recent activity
    }

    return Math.min(Math.round(riskScore), 100);
  }

  /**
   * Check monitoring thresholds
   */
  private async checkThresholds(event: MonitoringEvent): Promise<void> {
    for (const [name, threshold] of this.thresholds) {
      if (!threshold.enabled) continue;

      // Check cooldown
      if (threshold.lastTriggered && 
          Date.now() - threshold.lastTriggered.getTime() < threshold.cooldownMinutes * 60000) {
        continue;
      }

      const metricValue = this.getMetricValue(threshold.metric, event);
      if (metricValue === null) continue;

      if (this.evaluateThreshold(metricValue, threshold.operator, threshold.value)) {
        await this.createAlert({
          severity: threshold.severity,
          type: 'THRESHOLD_EXCEEDED',
          message: `${threshold.description}: ${threshold.metric} ${threshold.operator} ${threshold.value}`,
          details: {
            threshold: name,
            metric: threshold.metric,
            actualValue: metricValue,
            expectedValue: threshold.value,
            event: event
          }
        });

        threshold.lastTriggered = new Date();
      }
    }
  }

  /**
   * Get metric value for threshold checking
   */
  private getMetricValue(metric: string, event: MonitoringEvent): number | null {
    switch (metric) {
      case 'violationRate':
        const stats = this.classificationStats.get(event.classification);
        return stats ? stats.violationRate : null;
      
      case 'complianceScore':
        return event.metrics?.complianceScore ?? null;
      
      case 'restrictedAccessRate':
        const recentRestrictedEvents = this.events.filter(e => 
          e.classification === 'RESTRICTED' &&
          e.timestamp.getTime() > Date.now() - 3600000 // Last hour
        ).length;
        return recentRestrictedEvents;
      
      case 'averageProcessingTime':
        const classStats = this.classificationStats.get(event.classification);
        return classStats ? classStats.averageProcessingTime : null;
      
      case 'userViolationCount':
        const userActivity = this.userActivities.get(event.userId);
        return userActivity ? userActivity.violationCount : null;
      
      default:
        return null;
    }
  }

  /**
   * Evaluate threshold condition
   */
  private evaluateThreshold(value: number, operator: string, threshold: number): boolean {
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

  /**
   * Create monitoring alert
   */
  private async createAlert(alert: Omit<MonitoringAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const monitoringAlert: MonitoringAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alert
    };

    this.alerts.push(monitoringAlert);

    // Notify alert handlers
    this.notifyAlertHandlers(monitoringAlert);

    // Cleanup old alerts (keep last 1000)
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  /**
   * Notify real-time handlers
   */
  private notifyRealTimeHandlers(event: MonitoringEvent): void {
    this.realTimeHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in real-time handler:', error);
      }
    });
  }

  /**
   * Notify alert handlers
   */
  private notifyAlertHandlers(alert: MonitoringAlert): void {
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        console.error('Error in alert handler:', error);
      }
    });
  }

  /**
   * Register real-time event handler
   */
  onEvent(handler: (event: MonitoringEvent) => void): void {
    this.realTimeHandlers.push(handler);
  }

  /**
   * Register alert handler
   */
  onAlert(handler: (alert: MonitoringAlert) => void): void {
    this.alertHandlers.push(handler);
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboard(): MonitoringDashboard {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // Calculate overall stats
    const recentEvents = this.events.filter(e => e.timestamp.getTime() > oneHourAgo);
    const successEvents = recentEvents.filter(e => e.result === 'SUCCESS');
    const activeUsers = new Set(recentEvents.map(e => e.userId)).size;
    const violationCount = recentEvents.filter(e => e.eventType === 'VIOLATION').length;

    // Calculate average compliance score
    const complianceScores = recentEvents
      .filter(e => e.metrics?.complianceScore !== undefined)
      .map(e => e.metrics!.complianceScore!);
    const avgComplianceScore = complianceScores.length > 0
      ? complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length
      : 100;

    // Get top users by activity
    const topUsers = Array.from(this.userActivities.values())
      .sort((a, b) => b.totalEvents - a.totalEvents)
      .slice(0, 10);

    // Get recent alerts
    const recentAlerts = this.alerts
      .filter(a => !a.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Generate trend data (last 24 hours, hourly)
    const trendData = [];
    for (let i = 23; i >= 0; i--) {
      const hourStart = now - (i + 1) * 3600000;
      const hourEnd = now - i * 3600000;
      
      const hourEvents = this.events.filter(e => 
        e.timestamp.getTime() >= hourStart && 
        e.timestamp.getTime() < hourEnd
      );

      const hourViolations = hourEvents.filter(e => e.eventType === 'VIOLATION').length;
      const hourComplianceScores = hourEvents
        .filter(e => e.metrics?.complianceScore !== undefined)
        .map(e => e.metrics!.complianceScore!);

      trendData.push({
        timestamp: new Date(hourEnd),
        eventCount: hourEvents.length,
        violationCount: hourViolations,
        complianceScore: hourComplianceScores.length > 0
          ? hourComplianceScores.reduce((a, b) => a + b, 0) / hourComplianceScores.length
          : 100
      });
    }

    return {
      overallStats: {
        totalEvents: recentEvents.length,
        successRate: recentEvents.length > 0 ? (successEvents.length / recentEvents.length) * 100 : 100,
        averageProcessingTime: this.calculateAverageProcessingTime(recentEvents),
        activeUsers,
        violationCount,
        complianceScore: avgComplianceScore
      },
      classificationBreakdown: Array.from(this.classificationStats.values()),
      topUsers,
      recentAlerts,
      trendData
    };
  }

  /**
   * Calculate average processing time
   */
  private calculateAverageProcessingTime(events: MonitoringEvent[]): number {
    const times = events
      .filter(e => e.metrics?.processingTimeMs !== undefined)
      .map(e => e.metrics!.processingTimeMs!);
    
    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }

  /**
   * Get events by criteria
   */
  getEvents(criteria?: {
    classification?: DataClassificationLevel;
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    result?: 'SUCCESS' | 'FAILURE' | 'WARNING';
  }): MonitoringEvent[] {
    let filteredEvents = this.events;

    if (criteria) {
      if (criteria.classification) {
        filteredEvents = filteredEvents.filter(e => e.classification === criteria.classification);
      }
      if (criteria.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === criteria.userId);
      }
      if (criteria.eventType) {
        filteredEvents = filteredEvents.filter(e => e.eventType === criteria.eventType);
      }
      if (criteria.startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= criteria.startDate!);
      }
      if (criteria.endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= criteria.endDate!);
      }
      if (criteria.result) {
        filteredEvents = filteredEvents.filter(e => e.result === criteria.result);
      }
    }

    return filteredEvents;
  }

  /**
   * Get alerts
   */
  getAlerts(unresolved?: boolean): MonitoringAlert[] {
    if (unresolved) {
      return this.alerts.filter(a => !a.resolved);
    }
    return this.alerts;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy;
    }
  }

  /**
   * Get or update threshold
   */
  getThreshold(name: string): MonitoringThreshold | undefined {
    return this.thresholds.get(name);
  }

  updateThreshold(name: string, updates: Partial<MonitoringThreshold>): void {
    const threshold = this.thresholds.get(name);
    if (threshold) {
      Object.assign(threshold, updates);
    }
  }

  /**
   * Get user activity
   */
  getUserActivity(userId: string): UserActivity | undefined {
    return this.userActivities.get(userId);
  }

  /**
   * Get classification statistics
   */
  getClassificationStats(classification?: DataClassificationLevel): ClassificationStats[] {
    if (classification) {
      const stats = this.classificationStats.get(classification);
      return stats ? [stats] : [];
    }
    return Array.from(this.classificationStats.values());
  }

  /**
   * Export monitoring data
   */
  exportData(format: 'json' | 'csv'): string {
    const data = {
      events: this.events,
      alerts: this.alerts,
      statistics: Array.from(this.classificationStats.values()),
      userActivities: Array.from(this.userActivities.values()),
      exportDate: new Date()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Simple CSV export of events
      const headers = ['timestamp', 'eventType', 'classification', 'userId', 'result', 'operation'];
      const rows = this.events.map(e => [
        e.timestamp.toISOString(),
        e.eventType,
        e.classification,
        e.userId,
        e.result,
        e.operation
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }

  /**
   * Clear monitoring data
   */
  clearData(): void {
    this.events = [];
    this.alerts = [];
    this.userActivities.clear();
    this.initializeClassificationStats();
  }
}

export default ClassificationMonitoringService;