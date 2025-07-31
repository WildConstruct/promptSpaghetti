/**
 * Timeout Monitoring Service
 * 
 * Provides comprehensive monitoring, alerting, and metrics collection
 * for timeout events and circuit breaker states.
 */

import { EventEmitter } from 'events';
import { TimeoutManager, TimeoutMetrics } from './TimeoutManager';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';

}
}
export interface AlertConfig {
  timeoutThreshold: number;
  circuitBreakerThreshold: number;
  errorRateThreshold: number;
  alertCooldown: number;
  enableEmailAlerts: boolean;
  enableSlackAlerts: boolean;
  enableWebhookAlerts: boolean;
}
}
}

}
}
export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook';
  config: {
    [key: string]: unknown;
}
}
  };
}

}
}
export interface TimeoutAlert {
  id: string;
  type: 'timeout' | 'circuit_breaker' | 'error_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  operation: string;
  message: string;
  timestamp: Date;
  metrics: unknown;
  resolved: boolean;
  resolvedAt?: Date;
}
}
}

}
}
export interface PerformanceMetrics {
  operation: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  timeoutRate: number;
  circuitBreakerTrips: number;
  lastUpdated: Date;
}
}
}

export class TimeoutMonitoringService extends EventEmitter {
  private alertConfig: AlertConfig;
  private alertChannels: AlertChannel[] = [];
  private activeAlerts: Map<string, TimeoutAlert> = new Map();
  private alertCooldowns: Map<string, Date> = new Map();
  private performanceHistory: Map<string, number[]> = new Map();
  private analyticsCollector?: AnalyticsCollector;

  constructor(
    private timeoutManager: TimeoutManager,
    alertConfig?: Partial<AlertConfig>,
    analyticsCollector?: AnalyticsCollector
  ) {
    super();
    
    this.alertConfig = {
      timeoutThreshold: 5, // Alert after 5 timeouts
      circuitBreakerThreshold: 1, // Alert immediately when circuit breaker opens
      errorRateThreshold: 0.1, // Alert when error rate > 10%
      alertCooldown: 300000, // 5 minutes cooldown
      enableEmailAlerts: process.env.ENABLE_EMAIL_ALERTS === 'true',
      enableSlackAlerts: process.env.ENABLE_SLACK_ALERTS === 'true',
      enableWebhookAlerts: process.env.ENABLE_WEBHOOK_ALERTS === 'true',
      ...alertConfig
    };

    this.analyticsCollector = analyticsCollector;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for timeout manager
   */
  private setupEventListeners(): void {
    this.timeoutManager.on('timeout', (event) => {
      this.handleTimeoutEvent(event);
    });

    this.timeoutManager.on('circuit_breaker_opened', (event) => {
      this.handleCircuitBreakerEvent(event);
    });

    this.timeoutManager.on('circuit_breaker_reset', (event) => {
      this.resolveCircuitBreakerAlert(event.metricKey);
    });

    this.timeoutManager.on('fallback_used', (event) => {
      this.handleFallbackEvent(event);
    });
  }

  /**
   * Handle timeout events
   */
  private async handleTimeoutEvent(event: unknown): Promise<void> {

    const { metricKey, executionTime, totalTimeouts } = event;
    
    // Record performance metrics
    this.recordPerformanceMetric(metricKey, executionTime, false);
    
    // Track analytics
    if (this.analyticsCollector) {
      this.analyticsCollector.trackEvent('timeout_occurred', {
        operation: metricKey,
        executionTime,
        totalTimeouts
      });
    }

    // Check if alert threshold is reached
    if (totalTimeouts >= this.alertConfig.timeoutThreshold) {
      await this.createAlert({
        type: 'timeout',
        severity: this.getSeverityForTimeouts(totalTimeouts),
        operation: metricKey,
        message: `Operation ${metricKey} has timed out ${totalTimeouts} times`,
        metrics: { executionTime, totalTimeouts }
      });
    }

    this.emit('timeout_recorded', event);
  }

  /**
   * Handle circuit breaker events
   */
  private async handleCircuitBreakerEvent(event: unknown): Promise<void> {

    const { metricKey, failureCount } = event;
    
    // Track analytics
    if (this.analyticsCollector) {
      this.analyticsCollector.trackEvent('circuit_breaker_opened', {
        operation: metricKey,
        failureCount
      });
    }

    // Create critical alert for circuit breaker
    await this.createAlert({
      type: 'circuit_breaker',
      severity: 'critical',
      operation: metricKey,
      message: `Circuit breaker opened for ${metricKey} after ${failureCount} failures`,
      metrics: { failureCount }
    });

    this.emit('circuit_breaker_opened', event);
  }

  /**
   * Handle fallback events
   */
  private async handleFallbackEvent(event: unknown): Promise<void> {

    const { operationType, operationSubtype, fallbackSuccess } = event;
    
    // Track analytics
    if (this.analyticsCollector) {
      this.analyticsCollector.trackEvent('fallback_used', {
        operation: `${operationType}.${operationSubtype}`,
        fallbackSuccess
      });
    }

    this.emit('fallback_used', event);
  }

  /**
   * Record performance metric
   */
  private recordPerformanceMetric(operation: string, responseTime: number, _____success: boolean): void {
    if (!this.performanceHistory.has(operation)) {
      this.performanceHistory.set(operation, []);
    }

    const history = this.performanceHistory.get(operation)!;
    history.push(responseTime);

    // Keep only last 1000 measurements
    if (history.length > 1000) {
      history.shift();
    }
  }

  /**
   * Create alert
   */
  private async createAlert(alertData: Omit<TimeoutAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {

    const alertKey = `${alertData.type}_${alertData.operation}`;
    
    // Check cooldown
    const lastAlert = this.alertCooldowns.get(alertKey);
    if (lastAlert && Date.now() - lastAlert.getTime() < this.alertConfig.alertCooldown) {
      return;
    }

    const alert: TimeoutAlert = {
      id: `${alertKey}_${Date.now()}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    };

    this.activeAlerts.set(alert.id, alert);
    this.alertCooldowns.set(alertKey, new Date());

    // Send alert through configured channels
    await this.sendAlert(alert);

    // Track analytics
    if (this.analyticsCollector) {
      this.analyticsCollector.trackEvent('alert_created', {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
        operation: alert.operation
      });
    }

    this.emit('alert_created', alert);
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alert: TimeoutAlert): Promise<void> {

    const promises = this.alertChannels.map(async (channel) => {
      try {
        switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(alert, channel.config);
          break;
        case 'slack':
          await this.sendSlackAlert(alert, channel.config);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert, channel.config);
          break;
        }
      } catch (error) {
        console.error(`Failed to send alert via ${channel.type}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: TimeoutAlert, _____config: unknown): Promise<void> {

    // Implementation would depend on email service
    console.log(`Email alert: ${alert.message}`);
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: TimeoutAlert, config: unknown): Promise<void> {

    const webhook = config.webhookUrl;
    if (!webhook) return;

    const payload = {
      text: `🚨 ${alert.severity.toUpperCase()} Alert`,
      attachments: [{
        color: this.getSlackColorForSeverity(alert.severity),
        fields: [
          { title: 'Operation', value: alert.operation, short: true },
          { title: 'Type', value: alert.type, short: true },
          { title: 'Message', value: alert.message, short: false },
          { title: 'Timestamp', value: alert.timestamp.toISOString(), short: true }
        ]
      }]
    };

    const fetch = (await import('node-fetch')).default;
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: TimeoutAlert, config: unknown): Promise<void> {

    const webhook = config.url;
    if (!webhook) return;

    const fetch = (await import('node-fetch')).default;
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  }

  /**
   * Resolve circuit breaker alert
   */
  private resolveCircuitBreakerAlert(operation: string): void {
    for (const [_____alertId, alert] of this.activeAlerts.entries()) {
      if (alert.type === 'circuit_breaker' && alert.operation === operation && !alert.resolved) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        
        this.emit('alert_resolved', alert);
        
        // Track analytics
        if (this.analyticsCollector) {
          this.analyticsCollector.trackEvent('alert_resolved', {
            alertId: alert.id,
            operation: alert.operation,
            duration: alert.resolvedAt.getTime() - alert.timestamp.getTime()
          });
        }
      }
    }
  }

  /**
   * Get severity for timeout count
   */
  private getSeverityForTimeouts(timeouts: number): 'low' | 'medium' | 'high' | 'critical' {
    if (timeouts >= 50) return 'critical';
    if (timeouts >= 20) return 'high';
    if (timeouts >= 10) return 'medium';
    return 'low';
  }

  /**
   * Get Slack color for severity
   */
  private getSlackColorForSeverity(severity: string): string {
    switch (severity) {
    case 'critical': return 'danger';
    case 'high': return 'warning';
    case 'medium': return '#ffeb3b';
    case 'low': return 'good';
    default: return '#cccccc';
    }
  }

  /**
   * Add alert channel
   */
  addAlertChannel(channel: AlertChannel): void {
    this.alertChannels.push(channel);
  }

  /**
   * Remove alert channel
   */
  removeAlertChannel(type: string): void {
    this.alertChannels = this.alertChannels.filter(channel => channel.type !== type);
  }

  /**
   * Get performance metrics for operation
   */
  getPerformanceMetrics(operation: string): PerformanceMetrics | null {
    const timeoutMetrics = this.timeoutManager.getMetrics(operation) as TimeoutMetrics;
    if (!timeoutMetrics) return null;

    const history = this.performanceHistory.get(operation) || [];
    
    if (history.length === 0) {
      return {
        operation,
        totalRequests: timeoutMetrics.totalOperations,
        successRate: 1 - (timeoutMetrics.timeouts / Math.max(timeoutMetrics.totalOperations, 1)),
        averageResponseTime: timeoutMetrics.averageExecutionTime,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        timeoutRate: timeoutMetrics.timeouts / Math.max(timeoutMetrics.totalOperations, 1),
        circuitBreakerTrips: timeoutMetrics.circuitBreakerTrips,
        lastUpdated: new Date()
      };
    }

    const sortedHistory = [...history].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedHistory.length * 0.95);
    const p99Index = Math.floor(sortedHistory.length * 0.99);

    return {
      operation,
      totalRequests: timeoutMetrics.totalOperations,
      successRate: 1 - (timeoutMetrics.timeouts / Math.max(timeoutMetrics.totalOperations, 1)),
      averageResponseTime: timeoutMetrics.averageExecutionTime,
      p95ResponseTime: sortedHistory[p95Index] || 0,
      p99ResponseTime: sortedHistory[p99Index] || 0,
      timeoutRate: timeoutMetrics.timeouts / Math.max(timeoutMetrics.totalOperations, 1),
      circuitBreakerTrips: timeoutMetrics.circuitBreakerTrips,
      lastUpdated: new Date(};
  }

  /**
   * Get all performance metrics
   */
  getAllPerformanceMetrics(): PerformanceMetrics[] {
    const allMetrics = this.timeoutManager.getMetrics() as Map<string, TimeoutMetrics>;
    const results: PerformanceMetrics[] = [];

    for (const operation of allMetrics.keys()) {
      const metrics = this.getPerformanceMetrics(operation);
      if (metrics) {
        results.push(metrics);
      }
    }

    return results;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): TimeoutAlert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): TimeoutAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): {
    overview: {
      totalOperations: number;
      totalTimeouts: number;
      activeCircuitBreakers: number;
      activeAlerts: number;
    };
    performanceMetrics: PerformanceMetrics[];
    recentAlerts: TimeoutAlert[];
    circuitBreakerStates: unknown;
    healthStatus: unknown;
    } {
    const allMetrics = this.timeoutManager.getMetrics() as Map<string, TimeoutMetrics>;
    const totalOperations = Array.from(allMetrics.values())
      .reduce((sum, metrics) => sum + metrics.totalOperations, 0);
    const totalTimeouts = Array.from(allMetrics.values())
      .reduce((sum, metrics) => sum + metrics.timeouts, 0);

    const circuitBreakerStates = this.timeoutManager.getCircuitBreakerStates();
    const activeCircuitBreakers = Array.from(circuitBreakerStates.values())
      .filter(cb => cb.state === 'open').length;

    const activeAlerts = this.getActiveAlerts();
    const recentAlerts = Array.from(this.activeAlerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      overview: {
        totalOperations,
        totalTimeouts,
        activeCircuitBreakers,
        activeAlerts: activeAlerts.length
  }
      performanceMetrics: this.getAllPerformanceMetrics(),
      recentAlerts,
      circuitBreakerStates: Object.fromEntries(circuitBreakerStates),
      healthStatus: this.timeoutManager.getHealthStatus(};
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(updates: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...updates };
    this.emit('config_updated', this.alertConfig);
  }

  /**
   * Manually resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alert_resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Clear old alerts and performance history
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    
    // Remove old alerts
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.timestamp < cutoff) {
        this.activeAlerts.delete(alertId);
      }
    }

    // Remove old cooldowns
    for (const [key, date] of this.alertCooldowns.entries()) {
      if (date < cutoff) {
        this.alertCooldowns.delete(key);
      }
    }

    this.emit('cleanup_completed', { maxAge, cutoff });
  }
}

// Factory function
export function createTimeoutMonitoringService(
  timeoutManager: TimeoutManager,
  alertConfig?: Partial<AlertConfig>,
  analyticsCollector?: AnalyticsCollector
): TimeoutMonitoringService {
  return new TimeoutMonitoringService(timeoutManager, alertConfig, analyticsCollector);
}