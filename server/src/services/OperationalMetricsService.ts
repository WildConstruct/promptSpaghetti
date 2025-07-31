/**
 * Operational Metrics Collection Service for Error Rates and System Monitoring
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { ErrorCategory, ErrorSeverity, BaseError } from '../types/errors';
import { healthMonitoringService, HealthStatus } from './HealthMonitoringService';
import { circuitBreakerService } from './CircuitBreakerService';
// import { retryService } from './RetryService'; // Unused import removed

}
}
export interface SystemMetrics {
  timestamp: number;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  errorRate: {
    total: number;
    perMinute: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
}
}
  };
  requestMetrics: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
  };
  circuitBreakerMetrics: Record<string, {
    state: string;
    failures: number;
    requests: number;
    failureRate: number;
  }>;
  healthScore: number;
  dependencyHealth: Record<string, {
    status: HealthStatus;
    responseTime: number;
  }>;
}

}
}
export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: SystemMetrics) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  enabled: boolean;
  cooldownMs: number; // Minimum time between alerts
  lastTriggered?: number;
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
  message: string;
  timestamp: number;
  metrics: SystemMetrics;
  resolved: boolean;
  resolvedAt?: number;
}
}
}

class OperationalMetricsService extends EventEmitter {
  private startTime: number = Date.now();
  private errorCounts: Map<string, number> = new Map(); // key: category:severity:minute
  private requestTimes: number[] = [];
  private requestCounts = {
    total: 0,
    successful: 0,
    failed: 0,
    lastMinute: 0,
    lastMinuteTimestamp: 0
  };
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private metricsHistory: SystemMetrics[] = [];
  private maxHistorySize = 1000; // Keep last 1000 metric snapshots
  private static instance: OperationalMetricsService;

  constructor() {
    super();
    this.setupDefaultAlertRules();
    this.startMetricsCollection();
  }

  static getInstance(): OperationalMetricsService {
    if (!OperationalMetricsService.instance) {
      OperationalMetricsService.instance = new OperationalMetricsService();
    }
    return OperationalMetricsService.instance;
  }

  private setupDefaultAlertRules(): void {
    // High error rate alert
    this.addAlertRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: (metrics) => metrics.errorRate.perMinute > 50,
      severity: 'high',
      description: 'Error rate exceeds 50 errors per minute',
      enabled: true,
      cooldownMs: 5 * 60 * 1000 // 5 minutes
    });

    // Critical error alert
    this.addAlertRule({
      id: 'critical-errors',
      name: 'Critical Errors Detected',
      condition: (metrics) => metrics.errorRate.bySeverity.critical > 0,
      severity: 'critical',
      description: 'Critical severity errors detected',
      enabled: true,
      cooldownMs: 1 * 60 * 1000 // 1 minute
    });

    // Low health score alert
    this.addAlertRule({
      id: 'low-health-score',
      name: 'Low System Health Score',
      condition: (metrics) => metrics.healthScore < 70,
      severity: 'medium',
      description: 'System health score is below 70%',
      enabled: true,
      cooldownMs: 10 * 60 * 1000 // 10 minutes
    });

    // High response time alert
    this.addAlertRule({
      id: 'high-response-time',
      name: 'High Response Time',
      condition: (metrics) => metrics.requestMetrics.p95ResponseTime > 5000,
      severity: 'medium',
      description: 'P95 response time exceeds 5 seconds',
      enabled: true,
      cooldownMs: 5 * 60 * 1000 // 5 minutes
    });

    // Circuit breaker alert
    this.addAlertRule({
      id: 'circuit-breaker-open',
      name: 'Circuit Breaker Open',
      condition: (metrics) => {
        return Object.values(metrics.circuitBreakerMetrics).some(
          breaker => breaker.state === 'open'
        );
  }
      severity: 'high',
      description: 'One or more circuit breakers are open',
      enabled: true,
      cooldownMs: 2 * 60 * 1000 // 2 minutes
    });

    // Memory usage alert
    this.addAlertRule({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      condition: (metrics) => {
        const usedMemoryMB = metrics.memoryUsage.heapUsed / 1024 / 1024;
        return usedMemoryMB > 512; // 512 MB threshold
  }
      severity: 'medium',
      description: 'Memory usage exceeds 512MB',
      enabled: true,
      cooldownMs: 15 * 60 * 1000 // 15 minutes
    });
  }

  public recordError(error: BaseError): void {
    const minute = Math.floor(Date.now() / 60000); // Current minute
    const key = `${error.category}:${error.severity}:${minute}`;
    
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    this.requestCounts.failed++;

    // Clean old error counts (keep last 60 minutes)
    const cutoff = minute - 60;
    Array.from(this.errorCounts.keys()).forEach(key => {
      const keyMinute = parseInt(key.split(':')[2]);
      if (keyMinute < cutoff) {
        this.errorCounts.delete(key);
      }
    });
  }

  public recordRequest(responseTimeMs: number, successful: boolean): void {
    this.requestTimes.push(responseTimeMs);
    this.requestCounts.total++;

    if (successful) {
      this.requestCounts.successful++;
    } else {
      this.requestCounts.failed++;
    }

    // Keep only last 1000 request times for percentile calculations
    if (this.requestTimes.length > 1000) {
      this.requestTimes.shift();
    }

    // Update requests per second calculation
    const now = Date.now();
    if (now - this.requestCounts.lastMinuteTimestamp > 60000) {
      this.requestCounts.lastMinute = 0;
      this.requestCounts.lastMinuteTimestamp = now;
    }
    this.requestCounts.lastMinute++;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private async getCpuUsage(): Promise<number> {

    // Simple CPU usage approximation
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    
    const totalUsage = endUsage.user + endUsage.system;
    const percentage = (totalUsage / 1000 / 100) * 100; // Convert to percentage
    
    return Math.min(100, Math.max(0, percentage)); // Clamp between 0-100
  }

  public async collectMetrics(): Promise<SystemMetrics> {

    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);

    // Calculate error rates
    const errorsByCategory: Record<ErrorCategory, number> = 
      Object.values(ErrorCategory).reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<ErrorCategory, number>);
    const errorsBySeverity: Record<ErrorSeverity, number> = 
      Object.values(ErrorSeverity).reduce((acc, sev) => ({ ...acc, [sev]: 0 }), {} as Record<ErrorSeverity, number>);

    let totalErrorsThisMinute = 0;

    this.errorCounts.forEach((count, key) => {
      const [category, severity, minute] = key.split(':');
      if (parseInt(minute) === currentMinute) {
        errorsByCategory[category as ErrorCategory] += count;
        errorsBySeverity[severity as ErrorSeverity] += count;
        totalErrorsThisMinute += count;
      }
    });

    // Calculate request metrics
    const averageResponseTime = this.requestTimes.length > 0
      ? this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length
      : 0;

    const p95ResponseTime = this.calculatePercentile(this.requestTimes, 95);
    const p99ResponseTime = this.calculatePercentile(this.requestTimes, 99);
    
    const requestsPerSecond = now - this.requestCounts.lastMinuteTimestamp < 60000
      ? this.requestCounts.lastMinute / ((now - this.requestCounts.lastMinuteTimestamp) / 1000)
      : 0;

    // Get circuit breaker metrics
    const circuitBreakerMetrics: Record<string, any> = {};
    const allBreakerMetrics = circuitBreakerService.getAllMetrics();
    Object.entries(allBreakerMetrics).forEach(([name, metrics]) => {
      circuitBreakerMetrics[name] = {
        state: metrics.state,
        failures: metrics.failures,
        requests: metrics.requests,
        failureRate: metrics.failureRate
      };
    });

    // Get health metrics
    let healthScore = 0;
    const dependencyHealth: Record<string, { status: HealthStatus; responseTime: number }> = {};
    
    try {
      const healthSummary = await healthMonitoringService.checkHealth();
      healthScore = healthSummary.score;
      
      Object.entries(healthSummary.dependencies).forEach(([name, dep]) => {
        dependencyHealth[name] = {
          status: dep.status,
          responseTime: dep.responseTimeMs
        };
      });
    } catch (error) {
      logger.error(
        'Error collecting health metrics',
        { error: error instanceof Error ? error.message : String(error
        ) });
    }

    const metrics: SystemMetrics = {
      timestamp: now,
      uptime: now - this.startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: await this.getCpuUsage(),
      errorRate: {
        total: this.requestCounts.failed,
        perMinute: totalErrorsThisMinute,
        byCategory: errorsByCategory,
        bySeverity: errorsBySeverity
  }
      requestMetrics: {
        total: this.requestCounts.total,
        successful: this.requestCounts.successful,
        failed: this.requestCounts.failed,
        averageResponseTime: Math.round(averageResponseTime * 100) / 100,
        p95ResponseTime: Math.round(p95ResponseTime * 100) / 100,
        p99ResponseTime: Math.round(p99ResponseTime * 100) / 100,
        requestsPerSecond: Math.round(requestsPerSecond * 100) / 100
  }
      circuitBreakerMetrics,
      healthScore,
      dependencyHealth
    };

    // Store in history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Check alert rules
    this.checkAlertRules(metrics);

    return metrics;
  }

  public addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    logger.info(`Added alert rule: ${rule.name}`, { id: rule.id, severity: rule.severity });
  }

  public removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
    logger.info(`Removed alert rule: ${ruleId}`);
  }

  public getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  public getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  public getAllAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  private checkAlertRules(metrics: SystemMetrics): void {
    this.alertRules.forEach((rule) => {
      if (!rule.enabled) return;

      // Check cooldown
      if (rule.lastTriggered && (Date.now() - rule.lastTriggered) < rule.cooldownMs) {
        return;
      }

      try {
        const shouldAlert = rule.condition(metrics);
        const existingAlert = this.activeAlerts.get(rule.id);

        if (shouldAlert && (!existingAlert || existingAlert.resolved)) {
          // Trigger new alert
          const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            message: rule.description,
            timestamp: Date.now(),
            metrics: { ...metrics },
            resolved: false
          };

          this.activeAlerts.set(rule.id, alert);
          rule.lastTriggered = Date.now();

          logger.error(`ALERT TRIGGERED: ${rule.name}`, {
            alertId: alert.id,
            severity: rule.severity,
            description: rule.description,
            metrics: {
              errorRate: metrics.errorRate.perMinute,
              healthScore: metrics.healthScore,
              responseTime: metrics.requestMetrics.p95ResponseTime
            }
          });

          this.emit('alertTriggered', alert);
        } else if (!shouldAlert && existingAlert && !existingAlert.resolved) {
          // Resolve existing alert
          existingAlert.resolved = true;
          existingAlert.resolvedAt = Date.now();

          logger.info(`ALERT RESOLVED: ${rule.name}`, {
            alertId: existingAlert.id,
            duration: existingAlert.resolvedAt - existingAlert.timestamp
          });

          this.emit('alertResolved', existingAlert);
        }
      } catch (error) {
        logger.error(`Error checking alert rule '${rule.name}'`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  public getMetricsHistory(limit?: number): SystemMetrics[] {
    const history = limit ? this.metricsHistory.slice(-limit) : this.metricsHistory;
    return [...history]; // Return copy to prevent modification
  }

  public getMetricsSummary(minutes: number = 60): {
    averageHealthScore: number;
    totalErrors: number;
    averageResponseTime: number;
    peakMemoryUsage: number;
    alertCount: number;
  } {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metricsHistory.filter(m => m.timestamp >= cutoff);

    if (recentMetrics.length === 0) {
      return {
        averageHealthScore: 0,
        totalErrors: 0,
        averageResponseTime: 0,
        peakMemoryUsage: 0,
        alertCount: 0
      };
    }

    const averageHealthScore = recentMetrics.reduce((sum, m) => sum + m.healthScore, 0) / recentMetrics.length;
    const totalErrors = recentMetrics.reduce((sum, m) => sum + m.errorRate.perMinute, 0);
    const averageResponseTime = recentMetrics.reduce(
      (sum,
        m
      ) => sum + m.requestMetrics.averageResponseTime, 0) / recentMetrics.length;
    const peakMemoryUsage = Math.max(...recentMetrics.map(m => m.memoryUsage.heapUsed));
    const alertCount = this.getActiveAlerts().filter(a => a.timestamp >= cutoff).length;

    return {
      averageHealthScore: Math.round(averageHealthScore * 100) / 100,
      totalErrors,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      peakMemoryUsage,
      alertCount
    };
  }

  private startMetricsCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        logger.error('Error collecting operational metrics', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, 30000);

    logger.info('Operational metrics collection started');
  }
}

// Export singleton instance
export const operationalMetricsService = new OperationalMetricsService();
export default OperationalMetricsService;