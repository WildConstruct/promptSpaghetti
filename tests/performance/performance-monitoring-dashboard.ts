/**
 * Performance Monitoring Dashboard and Metrics Collection
 * Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114562178-E4CD83 - Implement performance tests
 *
 * Comprehensive performance monitoring system that collects, analyzes,
 * and visualizes performance metrics from all test suites.
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';

interface PerformanceMetric {
  timestamp: number;
  testSuite: string;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  metadata?: any;
}

interface PerformanceThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  value: number;
  severity: 'warning' | 'error' | 'critical';
  description: string;
}

interface PerformanceAlert {
  id: string;
  timestamp: number;
  threshold: PerformanceThreshold;
  actualValue: number;
  testSuite: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  resolved: boolean;
  resolvedAt?: number;
}

interface DashboardConfig {
  metricsRetentionDays: number;
  alertRetentionDays: number;
  outputDir: string;
  enableRealTimeUpdates: boolean;
  updateIntervalMs: number;
  enableNotifications: boolean;
  notificationWebhook?: string;
}

interface PerformanceSummary {
  testSuite: string;
  executionTime: number;
  memoryUsage: number;
  throughput: number;
  successRate: number;
  averageResponseTime: number;
  errors: number;
  timestamp: number;
}

interface TrendAnalysis {
  metric: string;
  trend: 'improving' | 'degrading' | 'stable';
  changePercent: number;
  confidence: number;
  dataPoints: number;
  recommendation?: string;
}

class PerformanceMonitoringDashboard extends EventEmitter {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThreshold[] = [];
  private config: DashboardConfig;
  private updateTimer?: NodeJS.Timeout;

  constructor(config: Partial<DashboardConfig> = {}) {
    super();

    this.config = {
      metricsRetentionDays: 30,
      alertRetentionDays: 90,
      outputDir: './performance-monitoring',
      enableRealTimeUpdates: true,
      updateIntervalMs: 5000,
      enableNotifications: false,
      ...config
    };

    this.setupDefaultThresholds();
    this.setupOutputDirectory();

    if (this.config.enableRealTimeUpdates) {
      this.startRealTimeUpdates();
    }
  }

  /**
   * Setup default performance thresholds
   */
  private setupDefaultThresholds(): void {
    this.thresholds = [
      // Core Engine Performance Thresholds
      {
        metric: 'engine.execution_time',
        operator: 'gt',
        value: 1000,
        severity: 'warning',
        description: 'Engine execution time exceeds 1 second'
      },
      {
        metric: 'engine.execution_time',
        operator: 'gt',
        value: 2000,
        severity: 'error',
        description: 'Engine execution time exceeds 2 seconds'
      },
      {
        metric: 'engine.memory_usage',
        operator: 'gt',
        value: 100,
        severity: 'warning',
        description: 'Engine memory usage exceeds 100MB'
      },
      {
        metric: 'engine.memory_usage',
        operator: 'gt',
        value: 200,
        severity: 'error',
        description: 'Engine memory usage exceeds 200MB'
      },
      {
        metric: 'engine.operations_per_second',
        operator: 'lt',
        value: 100,
        severity: 'warning',
        description: 'Engine throughput below 100 ops/sec'
      },

      // API Performance Thresholds
      {
        metric: 'api.response_time',
        operator: 'gt',
        value: 2000,
        severity: 'warning',
        description: 'API response time exceeds 2 seconds'
      },
      {
        metric: 'api.response_time',
        operator: 'gt',
        value: 5000,
        severity: 'error',
        description: 'API response time exceeds 5 seconds'
      },
      {
        metric: 'api.success_rate',
        operator: 'lt',
        value: 95,
        severity: 'warning',
        description: 'API success rate below 95%'
      },
      {
        metric: 'api.success_rate',
        operator: 'lt',
        value: 90,
        severity: 'error',
        description: 'API success rate below 90%'
      },
      {
        metric: 'api.requests_per_second',
        operator: 'lt',
        value: 10,
        severity: 'warning',
        description: 'API throughput below 10 RPS'
      },

      // Memory Performance Thresholds
      {
        metric: 'memory.leak_detected',
        operator: 'eq',
        value: 1,
        severity: 'critical',
        description: 'Memory leak detected'
      },
      {
        metric: 'memory.gc_efficiency',
        operator: 'lt',
        value: 0.3,
        severity: 'warning',
        description: 'Garbage collection efficiency below 30%'
      },
      {
        metric: 'memory.peak_usage',
        operator: 'gt',
        value: 500,
        severity: 'error',
        description: 'Peak memory usage exceeds 500MB'
      }
    ];
  }

  /**
   * Setup output directory
   */
  private async setupOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputDir, { recursive: true });
      await fs.mkdir(path.join(this.config.outputDir, 'reports'), {
        recursive: true
      });
      await fs.mkdir(path.join(this.config.outputDir, 'metrics'), {
        recursive: true
      });
      await fs.mkdir(path.join(this.config.outputDir, 'alerts'), {
        recursive: true
      });
    } catch (error) {
      console.error('Failed to setup output directory:', error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    testSuite: string,
    metric: string,
    value: number,
    unit: string,
    tags?: Record<string, string>,
    metadata?: any
  ): void {
    const performanceMetric: PerformanceMetric = {
      timestamp: Date.now(),
      testSuite,
      metric,
      value,
      unit,
      tags,
      metadata
    };

    this.metrics.push(performanceMetric);
    this.checkThresholds(performanceMetric);
    this.emit('metric_recorded', performanceMetric);

    // Cleanup old metrics
    this.cleanupOldMetrics();
  }

  /**
   * Record performance summary from test results
   */
  recordPerformanceSummary(summary: PerformanceSummary): void {
    this.recordMetric(
      summary.testSuite,
      'execution_time',
      summary.executionTime,
      'ms'
    );
    this.recordMetric(
      summary.testSuite,
      'memory_usage',
      summary.memoryUsage,
      'MB'
    );
    this.recordMetric(
      summary.testSuite,
      'throughput',
      summary.throughput,
      'ops/sec'
    );
    this.recordMetric(
      summary.testSuite,
      'success_rate',
      summary.successRate,
      '%'
    );
    this.recordMetric(
      summary.testSuite,
      'avg_response_time',
      summary.averageResponseTime,
      'ms'
    );
    this.recordMetric(
      summary.testSuite,
      'error_count',
      summary.errors,
      'count'
    );
  }

  /**
   * Check thresholds and generate alerts
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const relevantThresholds = this.thresholds.filter(
      t =>
        metric.metric.includes(t.metric.split('.')[1]) ||
        `${metric.testSuite}.${metric.metric}`.includes(t.metric)
    );

    for (const threshold of relevantThresholds) {
      const violated = this.evaluateThreshold(metric.value, threshold);

      if (violated) {
        const alert: PerformanceAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          threshold,
          actualValue: metric.value,
          testSuite: metric.testSuite,
          severity: threshold.severity,
          message: `${threshold.description}. Actual: ${metric.value}${metric.unit}, Threshold: ${threshold.value}`,
          resolved: false
        };

        this.alerts.push(alert);
        this.emit('alert_triggered', alert);

        if (this.config.enableNotifications) {
          this.sendNotification(alert);
        }
      }
    }
  }

  /**
   * Evaluate if a threshold is violated
   */
  private evaluateThreshold(
    value: number,
    threshold: PerformanceThreshold
  ): boolean {
    switch (threshold.operator) {
      case 'gt':
        return value > threshold.value;
      case 'lt':
        return value < threshold.value;
      case 'gte':
        return value >= threshold.value;
      case 'lte':
        return value <= threshold.value;
      case 'eq':
        return value === threshold.value;
      case 'neq':
        return value !== threshold.value;
      default:
        return false;
    }
  }

  /**
   * Send notification for alert
   */
  private async sendNotification(alert: PerformanceAlert): Promise<void> {
    if (!this.config.notificationWebhook) return;

    try {
      const payload = {
        text: `Performance Alert: ${alert.message}`,
        severity: alert.severity,
        testSuite: alert.testSuite,
        timestamp: new Date(alert.timestamp).toISOString(),
        metric: alert.threshold.metric,
        actualValue: alert.actualValue,
        thresholdValue: alert.threshold.value
      };

      // In a real implementation, you'd send this to Slack, Discord, etc.
      console.log(
        '📧 Notification would be sent:',
        JSON.stringify(payload, null, 2)
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Get metrics for a specific time range
   */
  getMetrics(
    testSuite?: string,
    metric?: string,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric[] {
    return this.metrics.filter(m => {
      if (testSuite && m.testSuite !== testSuite) return false;
      if (metric && m.metric !== metric) return false;
      if (startTime && m.timestamp < startTime) return false;
      if (endTime && m.timestamp > endTime) return false;
      return true;
    });
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(
    severity?: 'warning' | 'error' | 'critical'
  ): PerformanceAlert[] {
    return this.alerts.filter(a => {
      if (a.resolved) return false;
      if (severity && a.severity !== severity) return false;
      return true;
    });
  }

  /**
   * Analyze performance trends
   */
  analyzeTrends(
    metric: string,
    testSuite?: string,
    windowHours: number = 24
  ): TrendAnalysis[] {
    const cutoffTime = Date.now() - windowHours * 60 * 60 * 1000;
    const relevantMetrics = this.getMetrics(testSuite, metric, cutoffTime).sort(
      (a, b) => a.timestamp - b.timestamp
    );

    if (relevantMetrics.length < 3) {
      return [];
    }

    // Group metrics by hour for trend analysis
    const hourlyData = new Map<number, number[]>();
    relevantMetrics.forEach(m => {
      const hour = Math.floor(m.timestamp / (60 * 60 * 1000));
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, []);
      }
      hourlyData.get(hour)!.push(m.value);
    });

    // Calculate hourly averages
    const hourlyAverages = Array.from(hourlyData.entries())
      .map(([hour, values]) => ({
        hour,
        average: values.reduce((sum, val) => sum + val, 0) / values.length
      }))
      .sort((a, b) => a.hour - b.hour);

    if (hourlyAverages.length < 2) {
      return [];
    }

    // Calculate trend
    const firstHalf = hourlyAverages.slice(
      0,
      Math.floor(hourlyAverages.length / 2)
    );
    const secondHalf = hourlyAverages.slice(
      Math.floor(hourlyAverages.length / 2)
    );

    const firstHalfAvg =
      firstHalf.reduce((sum, h) => sum + h.average, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, h) => sum + h.average, 0) / secondHalf.length;

    const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    const absChangePercent = Math.abs(changePercent);

    let trend: 'improving' | 'degrading' | 'stable';
    let recommendation: string | undefined;

    // For metrics where lower is better (response time, memory usage)
    const lowerIsBetter = [
      'response_time',
      'execution_time',
      'memory_usage',
      'error_count'
    ].some(m => metric.includes(m));

    if (absChangePercent < 5) {
      trend = 'stable';
    } else if (changePercent < 0) {
      trend = lowerIsBetter ? 'improving' : 'degrading';
      recommendation = lowerIsBetter
        ? 'Performance is improving'
        : 'Performance is degrading - investigate recent changes';
    } else {
      trend = lowerIsBetter ? 'degrading' : 'improving';
      recommendation = lowerIsBetter
        ? 'Performance is degrading - investigate recent changes'
        : 'Performance is improving';
    }

    return [
      {
        metric,
        trend,
        changePercent,
        confidence: Math.min(100, hourlyAverages.length * 10), // Simple confidence calculation
        dataPoints: relevantMetrics.length,
        recommendation
      }
    ];
  }

  /**
   * Generate performance report
   */
  async generateReport(
    format: 'json' | 'html' | 'markdown' = 'json'
  ): Promise<string> {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;

    // Get recent metrics
    const recentMetrics = this.getMetrics(undefined, undefined, last24Hours);
    const weeklyMetrics = this.getMetrics(undefined, undefined, last7Days);

    // Get active alerts
    const activeAlerts = this.getActiveAlerts();

    // Analyze trends
    const trendAnalysis = [
      ...this.analyzeTrends('execution_time', undefined, 24),
      ...this.analyzeTrends('memory_usage', undefined, 24),
      ...this.analyzeTrends('response_time', undefined, 24),
      ...this.analyzeTrends('success_rate', undefined, 24)
    ];

    // Calculate summary statistics
    const testSuites = [...new Set(recentMetrics.map(m => m.testSuite))];
    const summaryStats = testSuites.map(suite => {
      const suiteMetrics = recentMetrics.filter(m => m.testSuite === suite);
      const executionTimes = suiteMetrics
        .filter(m => m.metric.includes('execution_time'))
        .map(m => m.value);
      const memoryUsages = suiteMetrics
        .filter(m => m.metric.includes('memory'))
        .map(m => m.value);
      const successRates = suiteMetrics
        .filter(m => m.metric.includes('success_rate'))
        .map(m => m.value);

      return {
        testSuite: suite,
        avgExecutionTime:
          executionTimes.length > 0
            ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
            : 0,
        avgMemoryUsage:
          memoryUsages.length > 0
            ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length
            : 0,
        avgSuccessRate:
          successRates.length > 0
            ? successRates.reduce((a, b) => a + b, 0) / successRates.length
            : 0,
        metricCount: suiteMetrics.length
      };
    });

    const report = {
      timestamp: new Date().toISOString(),
      period: {
        last24Hours: {
          start: new Date(last24Hours).toISOString(),
          end: new Date(now).toISOString(),
          metricCount: recentMetrics.length
        },
        last7Days: {
          start: new Date(last7Days).toISOString(),
          end: new Date(now).toISOString(),
          metricCount: weeklyMetrics.length
        }
      },
      activeAlerts: {
        total: activeAlerts.length,
        critical: activeAlerts.filter(a => a.severity === 'critical').length,
        error: activeAlerts.filter(a => a.severity === 'error').length,
        warning: activeAlerts.filter(a => a.severity === 'warning').length,
        alerts: activeAlerts.slice(0, 10) // Top 10 most recent
      },
      trends: trendAnalysis,
      testSuiteSummary: summaryStats,
      overallHealth: this.calculateOverallHealth(summaryStats, activeAlerts),
      recommendations: this.generateRecommendations(trendAnalysis, activeAlerts)
    };

    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-report-${timestamp}.${format}`;
    const filepath = path.join(this.config.outputDir, 'reports', filename);

    if (format === 'json') {
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    } else if (format === 'html') {
      const html = this.generateHTMLReport(report);
      await fs.writeFile(filepath, html);
    } else if (format === 'markdown') {
      const markdown = this.generateMarkdownReport(report);
      await fs.writeFile(filepath, markdown);
    }

    console.log(`📊 Performance report generated: ${filepath}`);
    return filepath;
  }

  /**
   * Calculate overall system health score
   */
  private calculateOverallHealth(
    summaryStats: any[],
    alerts: PerformanceAlert[]
  ): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: string[];
  } {
    let score = 100;
    const factors: string[] = [];

    // Deduct points for alerts
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const errorAlerts = alerts.filter(a => a.severity === 'error').length;
    const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

    score -= criticalAlerts * 30;
    score -= errorAlerts * 15;
    score -= warningAlerts * 5;

    if (criticalAlerts > 0) factors.push(`${criticalAlerts} critical alerts`);
    if (errorAlerts > 0) factors.push(`${errorAlerts} error alerts`);
    if (warningAlerts > 0) factors.push(`${warningAlerts} warning alerts`);

    // Evaluate test suite performance
    summaryStats.forEach(stat => {
      if (stat.avgSuccessRate < 90) {
        score -= 10;
        factors.push(`${stat.testSuite} success rate below 90%`);
      }
      if (stat.avgExecutionTime > 2000) {
        score -= 5;
        factors.push(`${stat.testSuite} slow execution time`);
      }
      if (stat.avgMemoryUsage > 200) {
        score -= 5;
        factors.push(`${stat.testSuite} high memory usage`);
      }
    });

    score = Math.max(0, Math.min(100, score));

    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 95) status = 'excellent';
    else if (score >= 85) status = 'good';
    else if (score >= 70) status = 'fair';
    else if (score >= 50) status = 'poor';
    else status = 'critical';

    return { score, status, factors };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    trends: TrendAnalysis[],
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];

    // Trend-based recommendations
    trends.forEach(trend => {
      if (trend.recommendation) {
        recommendations.push(trend.recommendation);
      }
    });

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const errorAlerts = alerts.filter(a => a.severity === 'error');

    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical performance issues immediately');
    }

    if (errorAlerts.length > 2) {
      recommendations.push(
        'Review system capacity and optimize resource allocation'
      );
    }

    // Memory-specific recommendations
    const memoryAlerts = alerts.filter(a =>
      a.threshold.metric.includes('memory')
    );
    if (memoryAlerts.length > 0) {
      recommendations.push(
        'Investigate memory leaks and optimize garbage collection'
      );
    }

    // API-specific recommendations
    const apiAlerts = alerts.filter(a => a.threshold.metric.includes('api'));
    if (apiAlerts.length > 0) {
      recommendations.push('Optimize API response times and implement caching');
    }

    // Default recommendations if no specific issues
    if (recommendations.length === 0) {
      recommendations.push(
        'Performance is stable - maintain current monitoring practices'
      );
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(report: any): string {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Performance Monitoring Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .health-excellent { color: #27ae60; font-weight: bold; }
        .health-good { color: #2ecc71; font-weight: bold; }
        .health-fair { color: #f39c12; font-weight: bold; }
        .health-poor { color: #e74c3c; font-weight: bold; }
        .health-critical { color: #c0392b; font-weight: bold; background: #ffebee; padding: 4px 8px; border-radius: 4px; }
        .alert-critical { background: #ffebee; border-left: 4px solid #c0392b; padding: 10px; margin: 5px 0; }
        .alert-error { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 5px 0; }
        .alert-warning { background: #f3e5f5; border-left: 4px solid #9c27b0; padding: 10px; margin: 5px 0; }
        .trend-improving { color: #27ae60; }
        .trend-degrading { color: #e74c3c; }
        .trend-stable { color: #7f8c8d; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .metric { font-family: monospace; background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Monitoring Report</h1>
            <p>Generated: ${report.timestamp}</p>
        </div>
        
        <div class="section">
            <h2>Overall System Health</h2>
            <h3 class="health-${report.overallHealth.status}">
                Score: ${report.overallHealth.score}/100 (${report.overallHealth.status.toUpperCase()})
            </h3>
            ${
              report.overallHealth.factors.length > 0
                ? '<p><strong>Contributing Factors:</strong></p><ul>' +
                  report.overallHealth.factors
                    .map(f => `<li>${f}</li>`)
                    .join('') +
                  '</ul>'
                : ''
            }
        </div>

        <div class="section">
            <h2>Active Alerts (${report.activeAlerts.total})</h2>
            ${report.activeAlerts.alerts
              .map(
                alert =>
                  `<div class="alert-${alert.severity}">
                    <strong>${alert.severity.toUpperCase()}:</strong> ${alert.message}
                    <br><small>Test Suite: ${alert.testSuite} | ${new Date(alert.timestamp).toLocaleString()}</small>
                </div>`
              )
              .join('')}
        </div>

        <div class="section">
            <h2>Performance Trends</h2>
            <table>
                <tr><th>Metric</th><th>Trend</th><th>Change</th><th>Confidence</th><th>Recommendation</th></tr>
                ${report.trends
                  .map(
                    trend =>
                      `<tr>
                        <td><span class="metric">${trend.metric}</span></td>
                        <td class="trend-${trend.trend}">${trend.trend.toUpperCase()}</td>
                        <td>${trend.changePercent.toFixed(1)}%</td>
                        <td>${trend.confidence.toFixed(0)}%</td>
                        <td>${trend.recommendation || 'No action needed'}</td>
                    </tr>`
                  )
                  .join('')}
            </table>
        </div>

        <div class="section">
            <h2>Test Suite Summary</h2>
            <table>
                <tr><th>Test Suite</th><th>Avg Execution Time</th><th>Avg Memory Usage</th><th>Avg Success Rate</th><th>Metrics</th></tr>
                ${report.testSuiteSummary
                  .map(
                    suite =>
                      `<tr>
                        <td><strong>${suite.testSuite}</strong></td>
                        <td>${suite.avgExecutionTime.toFixed(0)}ms</td>
                        <td>${suite.avgMemoryUsage.toFixed(1)}MB</td>
                        <td>${suite.avgSuccessRate.toFixed(1)}%</td>
                        <td>${suite.metricCount}</td>
                    </tr>`
                  )
                  .join('')}
            </table>
        </div>

        <div class="section">
            <h2>Recommendations</h2>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(report: any): string {
    return `# Performance Monitoring Report

**Generated:** ${report.timestamp}

## Overall System Health

**Score:** ${report.overallHealth.score}/100 (${report.overallHealth.status.toUpperCase()})

${
  report.overallHealth.factors.length > 0
    ? '**Contributing Factors:**\n' +
      report.overallHealth.factors.map(f => `- ${f}`).join('\n') +
      '\n'
    : ''
}

## Active Alerts (${report.activeAlerts.total})

${report.activeAlerts.alerts
  .map(
    alert =>
      `### ${alert.severity.toUpperCase()}: ${alert.message}
**Test Suite:** ${alert.testSuite} | **Time:** ${new Date(alert.timestamp).toLocaleString()}
`
  )
  .join('\n')}

## Performance Trends

| Metric | Trend | Change | Confidence | Recommendation |
|--------|-------|--------|------------|----------------|
${report.trends
  .map(
    trend =>
      `| \`${trend.metric}\` | ${trend.trend.toUpperCase()} | ${trend.changePercent.toFixed(1)}% | ${trend.confidence.toFixed(0)}% | ${trend.recommendation || 'No action needed'} |`
  )
  .join('\n')}

## Test Suite Summary

| Test Suite | Avg Execution Time | Avg Memory Usage | Avg Success Rate | Metrics |
|------------|-------------------|------------------|------------------|---------|
${report.testSuiteSummary
  .map(
    suite =>
      `| **${suite.testSuite}** | ${suite.avgExecutionTime.toFixed(0)}ms | ${suite.avgMemoryUsage.toFixed(1)}MB | ${suite.avgSuccessRate.toFixed(1)}% | ${suite.metricCount} |`
  )
  .join('\n')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
  }

  /**
   * Start real-time updates
   */
  private startRealTimeUpdates(): void {
    this.updateTimer = setInterval(() => {
      this.emit('dashboard_update', {
        timestamp: Date.now(),
        activeAlerts: this.getActiveAlerts().length,
        recentMetrics: this.getMetrics(undefined, undefined, Date.now() - 60000)
          .length
      });
    }, this.config.updateIntervalMs);
  }

  /**
   * Cleanup old metrics and alerts
   */
  private cleanupOldMetrics(): void {
    const metricsRetentionCutoff =
      Date.now() - this.config.metricsRetentionDays * 24 * 60 * 60 * 1000;
    const alertsRetentionCutoff =
      Date.now() - this.config.alertRetentionDays * 24 * 60 * 60 * 1000;

    this.metrics = this.metrics.filter(
      m => m.timestamp >= metricsRetentionCutoff
    );
    this.alerts = this.alerts.filter(a => a.timestamp >= alertsRetentionCutoff);
  }

  /**
   * Stop monitoring and cleanup
   */
  stop(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }

    this.emit('dashboard_stopped');
  }

  /**
   * Export current state for persistence
   */
  async exportState(): Promise<string> {
    const state = {
      metrics: this.metrics,
      alerts: this.alerts,
      thresholds: this.thresholds,
      config: this.config,
      exportedAt: new Date().toISOString()
    };

    const filename = `dashboard-state-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    await fs.writeFile(filepath, JSON.stringify(state, null, 2));

    return filepath;
  }

  /**
   * Import state from file
   */
  async importState(filepath: string): Promise<void> {
    try {
      const data = await fs.readFile(filepath, 'utf8');
      const state = JSON.parse(data);

      this.metrics = state.metrics || [];
      this.alerts = state.alerts || [];
      this.thresholds = state.thresholds || this.thresholds;

      console.log(`📊 Dashboard state imported from ${filepath}`);
    } catch (error) {
      console.error('Failed to import dashboard state:', error);
    }
  }
}

export {
  PerformanceMonitoringDashboard,
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceAlert,
  PerformanceSummary,
  TrendAnalysis,
  DashboardConfig
};
