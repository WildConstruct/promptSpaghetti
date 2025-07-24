/**
 * Performance Monitoring and Observability Platform - Story 1.5 Task 6
 * 
 * Implements comprehensive performance monitoring with unified observability platform,
 * metrics collection, alerting strategy, distributed tracing, and optimization recommendations.
 */

import { z } from 'zod';
import { EventRepository } from './EventPersistenceLayer';
import { UnifiedAnalyticsEvent, AnalyticsEventType, EventCategory, EventSeverity } from './UnifiedEventBus';

// System Metrics Interface (from target architecture)
export interface SystemMetrics {
  performance: {
    nodeExecutionTime: HistogramMetric;
    memoryUsage: GaugeMetric;
    cacheHitRate: CounterMetric;
    errorRate: CounterMetric;
  };
  
  business: {
    activeUsers: GaugeMetric;
    graphsCreated: CounterMetric;
    revenueGenerated: CounterMetric;
    featureUsage: HistogramMetric;
  };
  
  infrastructure: {
    cpuUtilization: GaugeMetric;
    memoryUtilization: GaugeMetric;
    diskIO: CounterMetric;
    networkLatency: HistogramMetric;
  };
}

// Metric Types
export interface BaseMetric {
  name: string;
  value: number;
  timestamp: number;
  labels: Record<string, string>;
  tags: string[];
}

export interface GaugeMetric extends BaseMetric {
  type: 'gauge';
}

export interface CounterMetric extends BaseMetric {
  type: 'counter';
  delta?: number;
}

export interface HistogramMetric extends BaseMetric {
  type: 'histogram';
  buckets: { upperBound: number; count: number }[];
  percentiles: { percentile: number; value: number }[];
  min: number;
  max: number;
  mean: number;
  stdDev: number;
}

// Alert Configuration
export const AlertConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  metric: z.string(),
  threshold: z.number(),
  condition: z.enum(['>', '<', '>=', '<=', '==']),
  severity: z.enum(['critical', 'warning', 'info']),
  enabled: z.boolean(),
  cooldown: z.number(), // minutes
  channels: z.array(z.enum(['email', 'slack', 'webhook', 'pagerduty'])),
  tags: z.array(z.string()).optional()
});

export type AlertConfig = z.infer<typeof AlertConfigSchema>;

export interface Alert {
  id: string;
  configId: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
  tags: string[];
}

// Trace Configuration
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage: Record<string, string>;
  flags: number;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, string>;
  logs: Array<{ timestamp: number; fields: Record<string, any> }>;
  status: 'ok' | 'error' | 'timeout';
  error?: string;
}

// Performance Analytics
export interface PerformanceReport {
  timeRange: { start: number; end: number };
  summary: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number; // requests per second
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  trends: {
    responseTimeTrend: 'improving' | 'degrading' | 'stable';
    errorRateTrend: 'improving' | 'degrading' | 'stable';
    throughputTrend: 'increasing' | 'decreasing' | 'stable';
  };
  recommendations: string[];
  bottlenecks: Array<{
    component: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    solution: string;
  }>;
}

/**
 * Performance Monitoring and Observability Service
 * 
 * Comprehensive performance monitoring with alerting, tracing, and analytics
 */
export class PerformanceMonitoringService {
  private eventRepository: EventRepository;
  private metrics: Map<string, BaseMetric[]> = new Map();
  private alertConfigs: Map<string, AlertConfig> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private spans: Map<string, Span> = new Map();
  private alertCooldowns: Map<string, number> = new Map();

  constructor(eventRepository: EventRepository) {
    this.eventRepository = eventRepository;
    this.initializeDefaultAlerts();
    this.startMetricsCollection();
  }

  /**
   * Record performance metric
   */
  async recordMetric(metric: BaseMetric): Promise<void> {
    const metricName = metric.name;
    
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    
    const metricsList = this.metrics.get(metricName)!;
    metricsList.push(metric);
    
    // Keep only last 1000 metrics per type
    if (metricsList.length > 1000) {
      metricsList.shift();
    }

    // Create analytics event for metric
    const analyticsEvent: UnifiedAnalyticsEvent = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: AnalyticsEventType.PERFORMANCE_METRIC,
      category: EventCategory.PERFORMANCE,
      severity: EventSeverity.INFO,
      timestamp: metric.timestamp,
      source: 'performance-monitoring',
      version: '1.0.0',
      data: {
        metricName: metric.name,
        value: metric.value,
        type: metric.type,
        labels: metric.labels,
        ...(metric.type === 'histogram' && {
          percentiles: (metric as HistogramMetric).percentiles,
          min: (metric as HistogramMetric).min,
          max: (metric as HistogramMetric).max,
          mean: (metric as HistogramMetric).mean
        })
      },
      metadata: {
        component: 'performance-monitoring',
        metricType: metric.type
      },
      tags: metric.tags,
      environment: process.env.NODE_ENV || 'development'
    };

    try {
      await this.eventRepository.save(analyticsEvent);
    } catch (error) {
      console.error('Failed to save analytics event:', error);
      // Continue processing - don't let repository errors stop metric recording
    }

    // Check for alert conditions
    await this.evaluateAlerts(metric);
  }

  /**
   * Start distributed trace
   */
  startTrace(operationName: string, parentContext?: TraceContext): TraceContext {
    const traceId = parentContext?.traceId || this.generateTraceId();
    const spanId = this.generateSpanId();
    
    const span: Span = {
      traceId,
      spanId,
      parentSpanId: parentContext?.spanId,
      operationName,
      startTime: Date.now(),
      tags: {},
      logs: [],
      status: 'ok'
    };

    this.spans.set(spanId, span);

    return {
      traceId,
      spanId,
      parentSpanId: parentContext?.spanId,
      baggage: parentContext?.baggage || {},
      flags: 0
    };
  }

  /**
   * Finish distributed trace span
   */
  async finishSpan(spanId: string, tags?: Record<string, string>, error?: string): Promise<void> {
    const span = this.spans.get(spanId);
    if (!span) return;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = error ? 'error' : 'ok';
    span.error = error;
    
    if (tags) {
      span.tags = { ...span.tags, ...tags };
    }

    // Create analytics event for span
    const analyticsEvent: UnifiedAnalyticsEvent = {
      id: `span_${spanId}`,
      type: AnalyticsEventType.PERFORMANCE_METRIC,
      category: EventCategory.PERFORMANCE,
      severity: error ? EventSeverity.ERROR : EventSeverity.INFO,
      timestamp: span.startTime,
      source: 'distributed-tracing',
      version: '1.0.0',
      traceId: span.traceId,
      data: {
        operation: span.operationName,
        duration: span.duration,
        status: span.status,
        error: span.error
      },
      metadata: {
        traceId: span.traceId,
        spanId: span.spanId,
        parentSpanId: span.parentSpanId,
        component: 'distributed-tracing'
      },
      tags: Object.keys(span.tags),
      environment: process.env.NODE_ENV || 'development'
    };

    await this.eventRepository.save(analyticsEvent);

    // Record duration metric
    await this.recordMetric({
      name: `span.duration.${span.operationName}`,
      type: 'histogram',
      value: span.duration,
      timestamp: span.endTime,
      labels: { operation: span.operationName, status: span.status },
      tags: ['tracing', 'duration'],
      buckets: this.calculateHistogramBuckets([span.duration]),
      percentiles: [{ percentile: 95, value: span.duration }],
      min: span.duration,
      max: span.duration,
      mean: span.duration,
      stdDev: 0
    } as HistogramMetric);
  }

  /**
   * Create alert configuration
   */
  async createAlert(config: Omit<AlertConfig, 'id'>): Promise<string> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullConfig: AlertConfig = {
      id: alertId,
      ...config
    };

    this.alertConfigs.set(alertId, fullConfig);
    return alertId;
  }

  /**
   * Get system metrics following target architecture
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Get recent performance metrics
    const performanceMetrics = await this.getMetricsByTimeRange('performance', oneHourAgo, now);
    const businessMetrics = await this.getMetricsByTimeRange('business', oneHourAgo, now);
    const infrastructureMetrics = await this.getMetricsByTimeRange('infrastructure', oneHourAgo, now);

    return {
      performance: {
        nodeExecutionTime: this.getHistogramMetric(performanceMetrics, 'node.execution.time'),
        memoryUsage: this.getGaugeMetric(performanceMetrics, 'memory.usage'),
        cacheHitRate: this.getCounterMetric(performanceMetrics, 'cache.hit.rate'),
        errorRate: this.getCounterMetric(performanceMetrics, 'error.rate')
      },
      business: {
        activeUsers: this.getGaugeMetric(businessMetrics, 'active.users'),
        graphsCreated: this.getCounterMetric(businessMetrics, 'graphs.created'),
        revenueGenerated: this.getCounterMetric(businessMetrics, 'revenue.generated'),
        featureUsage: this.getHistogramMetric(businessMetrics, 'feature.usage')
      },
      infrastructure: {
        cpuUtilization: this.getGaugeMetric(infrastructureMetrics, 'cpu.utilization'),
        memoryUtilization: this.getGaugeMetric(infrastructureMetrics, 'memory.utilization'),
        diskIO: this.getCounterMetric(infrastructureMetrics, 'disk.io'),
        networkLatency: this.getHistogramMetric(infrastructureMetrics, 'network.latency')
      }
    };
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(startTime: number, endTime: number): Promise<PerformanceReport> {
    const metrics = await this.getMetricsByTimeRange('performance', startTime, endTime);
    const responseTimeMetrics = metrics.filter(m => m.name.includes('response.time'));
    const errorMetrics = metrics.filter(m => m.name.includes('error'));
    const requestMetrics = metrics.filter(m => m.name.includes('request'));

    const totalRequests = requestMetrics.reduce((sum, m) => sum + m.value, 0);
    const averageResponseTime = responseTimeMetrics.length > 0 
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length 
      : 0;
    
    const errorCount = errorMetrics.reduce((sum, m) => sum + m.value, 0);
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    
    const timeRangeSeconds = (endTime - startTime) / 1000;
    const throughput = timeRangeSeconds > 0 ? totalRequests / timeRangeSeconds : 0;

    // Calculate percentiles from histogram metrics
    const histogramMetrics = responseTimeMetrics.filter(m => m.type === 'histogram') as HistogramMetric[];
    const p95ResponseTime = this.calculatePercentile(histogramMetrics, 95);
    const p99ResponseTime = this.calculatePercentile(histogramMetrics, 99);

    // Analyze trends (simplified)
    const responseTrend = this.analyzeTrend(responseTimeMetrics);
    const errorTrend = this.analyzeTrend(errorMetrics);
    const throughputTrend = this.analyzeTrend(requestMetrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      averageResponseTime,
      errorRate,
      throughput,
      p95ResponseTime
    });

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(metrics);

    return {
      timeRange: { start: startTime, end: endTime },
      summary: {
        totalRequests,
        averageResponseTime,
        errorRate,
        throughput,
        p95ResponseTime,
        p99ResponseTime
      },
      trends: {
        responseTimeTrend: responseTrend,
        errorRateTrend: errorTrend,
        throughputTrend: throughputTrend
      },
      recommendations,
      bottlenecks
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get performance metrics for observability dashboard
   */
  async getObservabilityMetrics(): Promise<{
    uptime: number;
    responseTime: { avg: number; p95: number; p99: number };
    errorRate: number;
    throughput: number;
    alertsActive: number;
    tracesActive: number;
  }> {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const metrics = await this.getMetricsByTimeRange('performance', oneHourAgo, now);
    const responseTimeMetrics = metrics.filter(m => m.name.includes('response.time'));
    const errorMetrics = metrics.filter(m => m.name.includes('error'));
    
    const avgResponseTime = responseTimeMetrics.length > 0 
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length 
      : 0;
    
    const errorRate = errorMetrics.reduce((sum, m) => sum + m.value, 0);
    const throughput = metrics.filter(m => m.name.includes('request')).reduce((sum, m) => sum + m.value, 0);
    
    return {
      uptime: this.calculateUptime(),
      responseTime: {
        avg: avgResponseTime,
        p95: this.calculatePercentile(responseTimeMetrics.filter(m => m.type === 'histogram') as HistogramMetric[], 95),
        p99: this.calculatePercentile(responseTimeMetrics.filter(m => m.type === 'histogram') as HistogramMetric[], 99)
      },
      errorRate,
      throughput,
      alertsActive: this.activeAlerts.size,
      tracesActive: this.spans.size
    };
  }

  // Private helper methods
  private async evaluateAlerts(metric: BaseMetric): Promise<void> {
    for (const config of this.alertConfigs.values()) {
      if (!config.enabled || !metric.name.includes(config.metric)) continue;

      // Check cooldown
      const lastAlert = this.alertCooldowns.get(config.id);
      if (lastAlert && (Date.now() - lastAlert) < (config.cooldown * 60 * 1000)) {
        continue;
      }

      const shouldAlert = this.evaluateCondition(metric.value, config.threshold, config.condition);
      
      if (shouldAlert) {
        const alert: Alert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          configId: config.id,
          metric: config.metric,
          value: metric.value,
          threshold: config.threshold,
          severity: config.severity,
          message: `${config.name}: ${metric.name} ${config.condition} ${config.threshold} (current: ${metric.value})`,
          timestamp: Date.now(),
          resolved: false,
          tags: config.tags || []
        };

        this.activeAlerts.set(alert.id, alert);
        this.alertCooldowns.set(config.id, Date.now());

        // Create analytics event for alert
        const analyticsEvent: UnifiedAnalyticsEvent = {
          id: alert.id,
          type: AnalyticsEventType.SYSTEM_ALERT,
          category: EventCategory.SYSTEM,
          severity: config.severity === 'critical' ? EventSeverity.CRITICAL : 
                  config.severity === 'warning' ? EventSeverity.WARNING : EventSeverity.INFO,
          timestamp: alert.timestamp,
          source: 'performance-monitoring',
          version: '1.0.0',
          data: {
            alertConfig: config.name,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
            condition: config.condition,
            message: alert.message
          },
          metadata: {
            alertId: alert.id,
            configId: config.id,
            component: 'alerting'
          },
          tags: alert.tags,
          environment: process.env.NODE_ENV || 'development'
        };

        await this.eventRepository.save(analyticsEvent);
      }
    }
  }

  private evaluateCondition(value: number, threshold: number, condition: string): boolean {
    switch (condition) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      default: return false;
    }
  }

  private async getMetricsByTimeRange(category: string, startTime: number, endTime: number): Promise<BaseMetric[]> {
    const allMetrics: BaseMetric[] = [];
    
    for (const metricsList of this.metrics.values()) {
      const filteredMetrics = metricsList.filter(m => 
        m.timestamp >= startTime && 
        m.timestamp <= endTime &&
        (m.labels.category === category || m.tags.includes(category))
      );
      allMetrics.push(...filteredMetrics);
    }
    
    return allMetrics;
  }

  private getGaugeMetric(metrics: BaseMetric[], name: string): GaugeMetric {
    const matching = metrics.find(m => m.name.includes(name) && m.type === 'gauge') as GaugeMetric;
    return matching || {
      name,
      type: 'gauge',
      value: 0,
      timestamp: Date.now(),
      labels: {},
      tags: []
    };
  }

  private getCounterMetric(metrics: BaseMetric[], name: string): CounterMetric {
    const matching = metrics.find(m => m.name.includes(name) && m.type === 'counter') as CounterMetric;
    return matching || {
      name,
      type: 'counter',
      value: 0,
      timestamp: Date.now(),
      labels: {},
      tags: []
    };
  }

  private getHistogramMetric(metrics: BaseMetric[], name: string): HistogramMetric {
    const matching = metrics.find(m => m.name.includes(name) && m.type === 'histogram') as HistogramMetric;
    return matching || {
      name,
      type: 'histogram',
      value: 0,
      timestamp: Date.now(),
      labels: {},
      tags: [],
      buckets: [],
      percentiles: [],
      min: 0,
      max: 0,
      mean: 0,
      stdDev: 0
    };
  }

  private calculateHistogramBuckets(values: number[]): { upperBound: number; count: number }[] {
    const buckets = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    return buckets.map(upperBound => ({
      upperBound,
      count: values.filter(v => v <= upperBound).length
    }));
  }

  private calculatePercentile(histogramMetrics: HistogramMetric[], percentile: number): number {
    if (histogramMetrics.length === 0) return 0;
    
    // Use the most recent histogram metric's percentile data
    const latestMetric = histogramMetrics[histogramMetrics.length - 1];
    const percentileData = latestMetric.percentiles.find(p => p.percentile === percentile);
    return percentileData?.value || 0;
  }

  private analyzeTrend(metrics: BaseMetric[]): 'improving' | 'degrading' | 'stable' {
    if (metrics.length < 2) return 'stable';
    
    const sorted = metrics.sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < 0.05) return 'stable';
    return change < 0 ? 'improving' : 'degrading';
  }

  private generateRecommendations(summary: {
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    p95ResponseTime: number;
  }): string[] {
    const recommendations: string[] = [];
    
    if (summary.averageResponseTime > 1000) {
      recommendations.push('Average response time is high. Consider implementing caching or optimizing database queries.');
    }
    
    if (summary.errorRate > 5) {
      recommendations.push('Error rate is elevated. Review recent deployments and error logs.');
    }
    
    if (summary.throughput < 10) {
      recommendations.push('Low throughput detected. Consider scaling horizontally or optimizing application performance.');
    }
    
    if (summary.p95ResponseTime > 2000) {
      recommendations.push('95th percentile response time is high. Investigate performance bottlenecks in critical paths.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System performance is within acceptable ranges. Continue monitoring.');
    }
    
    return recommendations;
  }

  private identifyBottlenecks(metrics: BaseMetric[]): Array<{
    component: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    solution: string;
  }> {
    const bottlenecks = [];
    
    const dbMetrics = metrics.filter(m => m.name.includes('database'));
    const cacheMetrics = metrics.filter(m => m.name.includes('cache'));
    const memoryMetrics = metrics.filter(m => m.name.includes('memory'));
    
    if (dbMetrics.some(m => m.value > 500)) {
      bottlenecks.push({
        component: 'Database',
        severity: 'high' as const,
        description: 'Database queries are taking longer than 500ms',
        solution: 'Optimize slow queries, add database indexes, or consider read replicas'
      });
    }
    
    if (cacheMetrics.some(m => m.name.includes('hit.rate') && m.value < 80)) {
      bottlenecks.push({
        component: 'Cache',
        severity: 'medium' as const,
        description: 'Cache hit rate is below 80%',
        solution: 'Review caching strategy, increase cache TTL, or expand cache capacity'
      });
    }
    
    if (memoryMetrics.some(m => m.value > 85)) {
      bottlenecks.push({
        component: 'Memory',
        severity: 'high' as const,
        description: 'Memory utilization is above 85%',
        solution: 'Investigate memory leaks, optimize data structures, or scale memory capacity'
      });
    }
    
    return bottlenecks;
  }

  private calculateUptime(): number {
    // Simplified uptime calculation (in hours)
    // In production, this would be based on system start time
    return 24; // Mock 24 hours uptime
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateSpanId(): string {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private initializeDefaultAlerts(): void {
    // High response time alert
    this.alertConfigs.set('high_response_time', {
      id: 'high_response_time',
      name: 'High Response Time',
      description: 'Alert when average response time exceeds 2 seconds',
      metric: 'response.time',
      threshold: 2000,
      condition: '>',
      severity: 'warning',
      enabled: true,
      cooldown: 5,
      channels: ['email']
    });

    // High error rate alert
    this.alertConfigs.set('high_error_rate', {
      id: 'high_error_rate',
      name: 'High Error Rate',
      description: 'Alert when error rate exceeds 5%',
      metric: 'error.rate',
      threshold: 5,
      condition: '>',
      severity: 'critical',
      enabled: true,
      cooldown: 2,
      channels: ['email', 'slack']
    });

    // Low memory alert
    this.alertConfigs.set('low_memory', {
      id: 'low_memory',
      name: 'Low Memory',
      description: 'Alert when available memory falls below 100MB',
      metric: 'memory.available',
      threshold: 100,
      condition: '<',
      severity: 'warning',
      enabled: true,
      cooldown: 10,
      channels: ['email']
    });
  }

  private startMetricsCollection(): void {
    // Start periodic metrics collection
    setInterval(async () => {
      await this.collectSystemMetrics();
    }, 60000); // Every minute
  }

  private async collectSystemMetrics(): Promise<void> {
    const now = Date.now();
    
    // Collect basic system metrics
    const memoryUsage = process.memoryUsage();
    
    await this.recordMetric({
      name: 'system.memory.used',
      type: 'gauge',
      value: memoryUsage.heapUsed,
      timestamp: now,
      labels: { component: 'system', unit: 'bytes' },
      tags: ['infrastructure', 'memory']
    } as GaugeMetric);
    
    await this.recordMetric({
      name: 'system.memory.total',
      type: 'gauge',
      value: memoryUsage.heapTotal,
      timestamp: now,
      labels: { component: 'system', unit: 'bytes' },
      tags: ['infrastructure', 'memory']
    } as GaugeMetric);
  }
}

export default PerformanceMonitoringService;