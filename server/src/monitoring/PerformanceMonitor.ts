/**
 * Performance Monitor Service
 * 
 * Comprehensive performance monitoring system for tracking system performance,
 * identifying bottlenecks, and measuring improvement progress during Epic 18
 * technical debt refactoring.
 * 
 * Part of Epic 18 - Technical Debt & Refactoring
 * Task: E18-1753114561914-F036F8 - Set up performance monitoring
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import os from 'os';
import process from 'process';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';

export interface PerformanceMetric {
  metricId: string;
  metricType: MetricType;
  name: string;
  description: string;
  value: number;
  unit: MetricUnit;
  timestamp: Date;
  
  // Context Information
  context: PerformanceContext;
  
  // Statistical Data
  statistics?: MetricStatistics;
  
  // Threshold Information
  thresholds: PerformanceThreshold[];
  status: ThresholdStatus;
  
  // Tags and Metadata
  tags: Record<string, string>;
  metadata: Record<string, any>;
}

export interface PerformanceContext {
  // System Context
  nodeVersion: string;
  platform: string;
  architecture: string;
  
  // Application Context
  component: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  
  // Environment Context
  environment: 'development' | 'staging' | 'production';
  buildVersion?: string;
  deploymentId?: string;
  
  // Resource Context
  cpuCores: number;
  totalMemory: number;
  availableMemory: number;
  loadAverage: number[];
}

export interface MetricStatistics {
  count: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  percentiles: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  standardDeviation: number;
  variance: number;
}

export interface PerformanceThreshold {
  level: 'info' | 'warning' | 'critical' | 'emergency';
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'ne';
  value: number;
  description: string;
}

export interface PerformanceBenchmark {
  benchmarkId: string;
  name: string;
  description: string;
  category: BenchmarkCategory;
  
  // Baseline Measurements
  baseline: {
    value: number;
    timestamp: Date;
    context: PerformanceContext;
    version: string;
  };
  
  // Current Measurements
  current: {
    value: number;
    timestamp: Date;
    context: PerformanceContext;
    version: string;
  };
  
  // Improvement Tracking
  improvement: {
    absolute: number;
    percentage: number;
    trend: 'improving' | 'stable' | 'degrading';
    significance: 'none' | 'minor' | 'moderate' | 'major';
  };
  
  // Target Information
  target?: {
    value: number;
    deadline: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface PerformanceAlert {
  alertId: string;
  metricId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  
  // Alert Details
  title: string;
  description: string;
  recommendation: string;
  
  // Trigger Information
  triggeredAt: Date;
  triggerValue: number;
  threshold: PerformanceThreshold;
  
  // Status Tracking
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Escalation
  escalationLevel: number;
  notificationsSent: number;
  lastNotificationAt?: Date;
}

export type MetricType = 
  | 'counter' 
  | 'gauge' 
  | 'histogram' 
  | 'timer' 
  | 'rate'
  | 'memory'
  | 'cpu'
  | 'network'
  | 'database'
  | 'application';

export type MetricUnit =
  | 'milliseconds'
  | 'seconds'
  | 'bytes'
  | 'kilobytes' 
  | 'megabytes'
  | 'gigabytes'
  | 'percent'
  | 'count'
  | 'rate_per_second'
  | 'rate_per_minute';

export type BenchmarkCategory =
  | 'runtime_performance'
  | 'database_performance'
  | 'api_performance'
  | 'ui_performance'
  | 'build_performance'
  | 'memory_usage'
  | 'cpu_usage'
  | 'network_performance';

export type AlertType =
  | 'threshold_exceeded'
  | 'threshold_below'
  | 'rate_limit_exceeded'
  | 'error_rate_high'
  | 'resource_exhaustion'
  | 'performance_degradation'
  | 'availability_issue';

export type AlertSeverity =
  | 'info'
  | 'warning' 
  | 'critical'
  | 'emergency';

export type ThresholdStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'emergency';

export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private activeTimers: Map<string, number> = new Map();
  
  // Configuration
  private config: PerformanceMonitorConfig;
  
  // Services
  private databaseService: DatabaseService;
  private redisService: RedisService;
  private auditService: AuditService;
  
  // State
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private metricsBuffer: PerformanceMetric[] = [];
  private bufferFlushInterval?: NodeJS.Timeout;

  constructor(
    config: PerformanceMonitorConfig,
    dependencies: {
      databaseService: DatabaseService;
      redisService: RedisService;
      auditService: AuditService;
    }
  ) {
    super();
    this.config = config;
    this.databaseService = dependencies.databaseService;
    this.redisService = dependencies.redisService;
    this.auditService = dependencies.auditService;
  }

  /**
   * Initialize performance monitoring system
   */
  public async initialize(): Promise<void> {
    console.log('📊 Initializing Performance Monitor...');
    
    // Initialize default benchmarks
    await this.initializeDefaultBenchmarks();
    
    // Start system monitoring
    if (this.config.systemMonitoring.enabled) {
      this.startSystemMonitoring();
    }
    
    // Start metrics buffer flushing
    this.startMetricsBuffering();
    
    // Load historical data
    await this.loadHistoricalData();
    
    this.isMonitoring = true;
    
    await this.auditService.logEvent({
      type: 'PERFORMANCE_MONITORING_STARTED',
      userId: 'system',
      details: {
        config: this.config,
        timestamp: new Date()
      }
    });
    
    console.log('✅ Performance Monitor initialized successfully');
  }

  /**
   * Record a performance metric
   */
  public recordMetric(
    name: string,
    value: number,
    type: MetricType = 'gauge',
    unit: MetricUnit = 'milliseconds',
    context: Partial<PerformanceContext> = {},
    tags: Record<string, string> = {}
  ): void {
    const metric: PerformanceMetric = {
      metricId: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metricType: type,
      name,
      description: `Performance metric: ${name}`,
      value,
      unit,
      timestamp: new Date(),
      context: this.enrichContext(context),
      thresholds: this.getThresholdsForMetric(name),
      status: this.evaluateThresholds(value, this.getThresholdsForMetric(name)),
      tags: { ...this.config.defaultTags, ...tags },
      metadata: {}
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(metric);

    // Add to buffer for batch processing
    this.metricsBuffer.push(metric);

    // Check thresholds and generate alerts
    this.checkThresholds(metric);

    // Update statistics
    this.updateStatistics(name);

    // Emit metric recorded event
    this.emit('metric_recorded', metric);

    // Log high-severity metrics immediately
    if (metric.status === 'critical' || metric.status === 'emergency') {
      console.warn(`⚠️ Performance Alert: ${name} = ${value} ${unit} (${metric.status})`);
    }
  }

  /**
   * Start timing an operation
   */
  public startTimer(operationName: string, context?: Partial<PerformanceContext>): string {
    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    this.activeTimers.set(timerId, startTime);
    
    // Store context for later use
    if (context) {
      this.activeTimers.set(`${timerId}_context`, context as any);
    }
    
    return timerId;
  }

  /**
   * End timing and record the metric
   */
  public endTimer(
    timerId: string, 
    operationName: string,
    tags: Record<string, string> = {}
  ): number {
    const startTime = this.activeTimers.get(timerId);
    if (!startTime) {
      console.warn(`Timer not found: ${timerId}`);
      return 0;
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Get stored context
    const context = this.activeTimers.get(`${timerId}_context`) as Partial<PerformanceContext> || {};
    
    // Clean up timer
    this.activeTimers.delete(timerId);
    this.activeTimers.delete(`${timerId}_context`);
    
    // Record the timing metric
    this.recordMetric(
      operationName,
      duration,
      'timer',
      'milliseconds',
      context,
      { ...tags, timerId }
    );
    
    return duration;
  }

  /**
   * Record a benchmark measurement
   */
  public async recordBenchmark(
    benchmarkId: string,
    value: number,
    version: string = 'current',
    context: Partial<PerformanceContext> = {}
  ): Promise<void> {
    let benchmark = this.benchmarks.get(benchmarkId);
    
    if (!benchmark) {
      // Create new benchmark
      benchmark = {
        benchmarkId,
        name: benchmarkId,
        description: `Performance benchmark: ${benchmarkId}`,
        category: 'runtime_performance',
        baseline: {
          value,
          timestamp: new Date(),
          context: this.enrichContext(context),
          version
        },
        current: {
          value,
          timestamp: new Date(),
          context: this.enrichContext(context),
          version
        },
        improvement: {
          absolute: 0,
          percentage: 0,
          trend: 'stable',
          significance: 'none'
        }
      };
    } else {
      // Update existing benchmark
      const oldValue = benchmark.current.value;
      benchmark.current = {
        value,
        timestamp: new Date(),
        context: this.enrichContext(context),
        version
      };
      
      // Calculate improvement
      const absolute = oldValue - value; // Positive means improvement (lower is better for most metrics)
      const percentage = oldValue !== 0 ? (absolute / oldValue) * 100 : 0;
      
      benchmark.improvement = {
        absolute,
        percentage,
        trend: this.calculateTrend(percentage),
        significance: this.calculateSignificance(Math.abs(percentage))
      };
    }
    
    this.benchmarks.set(benchmarkId, benchmark);
    
    // Persist benchmark
    await this.persistBenchmark(benchmark);
    
    // Emit benchmark event
    this.emit('benchmark_recorded', benchmark);
    
    console.log(`📈 Benchmark recorded: ${benchmarkId} = ${value} (${benchmark.improvement.trend})`);
  }

  /**
   * Get performance dashboard data
   */
  public getPerformanceDashboard(): PerformanceDashboard {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // System Overview
    const systemOverview = {
      totalMetrics: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
      activeBenchmarks: this.benchmarks.size,
      activeAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'active').length,
      monitoringUptime: this.isMonitoring ? now.getTime() - (this.config.startTime?.getTime() || now.getTime()) : 0
    };
    
    // Recent Metrics (last hour)
    const recentMetrics = Array.from(this.metrics.entries()).map(([name, metrics]) => {
      const recentValues = metrics
        .filter(m => m.timestamp >= oneHourAgo)
        .map(m => m.value);
      
      if (recentValues.length === 0) return null;
      
      return {
        name,
        count: recentValues.length,
        latest: recentValues[recentValues.length - 1],
        average: recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length,
        trend: this.calculateMetricTrend(metrics.slice(-10))
      };
    }).filter(m => m !== null);
    
    // Performance Benchmarks
    const benchmarkSummary = Array.from(this.benchmarks.values()).map(benchmark => ({
      id: benchmark.benchmarkId,
      name: benchmark.name,
      category: benchmark.category,
      currentValue: benchmark.current.value,
      improvement: benchmark.improvement,
      target: benchmark.target,
      status: this.getBenchmarkStatus(benchmark)
    }));
    
    // Active Alerts
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.status === 'active')
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
      .slice(0, 10);
    
    // System Health
    const systemHealth = this.calculateSystemHealth();
    
    return {
      systemOverview,
      recentMetrics: recentMetrics as any[],
      benchmarkSummary,
      activeAlerts,
      systemHealth,
      timestamp: now
    };
  }

  /**
   * Get detailed performance report
   */
  public async generatePerformanceReport(
    startDate: Date,
    endDate: Date,
    categories: BenchmarkCategory[] = []
  ): Promise<PerformanceReport> {
    console.log(`📊 Generating performance report: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Filter metrics by date range
    const filteredMetrics = Array.from(this.metrics.entries()).reduce((acc, [name, metrics]) => {
      const filtered = metrics.filter(m => 
        m.timestamp >= startDate && 
        m.timestamp <= endDate
      );
      if (filtered.length > 0) {
        acc[name] = filtered;
      }
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);
    
    // Filter benchmarks by category
    const relevantBenchmarks = Array.from(this.benchmarks.values()).filter(benchmark =>
      categories.length === 0 || categories.includes(benchmark.category)
    );
    
    // Calculate aggregate statistics
    const aggregateStats = this.calculateAggregateStatistics(filteredMetrics);
    
    // Generate trend analysis
    const trendAnalysis = this.generateTrendAnalysis(filteredMetrics, relevantBenchmarks);
    
    // Performance insights and recommendations
    const insights = this.generatePerformanceInsights(aggregateStats, trendAnalysis);
    
    const report: PerformanceReport = {
      reportId: `report_${Date.now()}`,
      generatedAt: new Date(),
      period: { startDate, endDate },
      categories: categories.length > 0 ? categories : ['runtime_performance'],
      
      summary: {
        totalMetrics: Object.keys(filteredMetrics).length,
        totalMeasurements: Object.values(filteredMetrics).reduce((sum, metrics) => sum + metrics.length, 0),
        benchmarksAnalyzed: relevantBenchmarks.length,
        alertsGenerated: Array.from(this.alerts.values()).filter(a => 
          a.triggeredAt >= startDate && a.triggeredAt <= endDate
        ).length
      },
      
      aggregateStats,
      trendAnalysis,
      benchmarkAnalysis: this.analyzeBenchmarks(relevantBenchmarks),
      insights,
      recommendations: this.generateRecommendations(insights)
    };
    
    // Persist report
    await this.persistReport(report);
    
    console.log(`✅ Performance report generated: ${report.reportId}`);
    return report;
  }

  /**
   * Initialize default performance benchmarks
   */
  private async initializeDefaultBenchmarks(): Promise<void> {
    const defaultBenchmarks: Array<{
      id: string;
      name: string;
      category: BenchmarkCategory;
      description: string;
      target?: { value: number; priority: 'low' | 'medium' | 'high' | 'critical' };
    }> = [
      // Runtime Performance
      {
        id: 'graph_execution_time',
        name: 'Graph Execution Time',
        category: 'runtime_performance',
        description: 'Time to execute a standard test graph',
        target: { value: 1000, priority: 'high' } // 1 second
      },
      {
        id: 'node_processing_time',
        name: 'Node Processing Time',
        category: 'runtime_performance', 
        description: 'Average time to process a single node',
        target: { value: 50, priority: 'medium' } // 50ms
      },
      
      // API Performance
      {
        id: 'api_response_time',
        name: 'API Response Time',
        category: 'api_performance',
        description: 'Average API endpoint response time',
        target: { value: 200, priority: 'high' } // 200ms
      },
      {
        id: 'preview_generation_time',
        name: 'Preview Generation Time',
        category: 'api_performance',
        description: 'Time to generate graph preview',
        target: { value: 500, priority: 'medium' } // 500ms
      },
      
      // Database Performance
      {
        id: 'database_query_time',
        name: 'Database Query Time',
        category: 'database_performance',
        description: 'Average database query execution time',
        target: { value: 100, priority: 'high' } // 100ms
      },
      
      // UI Performance
      {
        id: 'ui_render_time',
        name: 'UI Render Time',
        category: 'ui_performance',
        description: 'Time to render component updates',
        target: { value: 16, priority: 'critical' } // 16ms for 60fps
      },
      {
        id: 'graph_editor_load_time',
        name: 'Graph Editor Load Time',
        category: 'ui_performance',
        description: 'Time to load and render graph editor',
        target: { value: 2000, priority: 'high' } // 2 seconds
      },
      
      // Memory Usage
      {
        id: 'memory_usage_peak',
        name: 'Peak Memory Usage',
        category: 'memory_usage',
        description: 'Peak memory usage during operation',
        target: { value: 512, priority: 'medium' } // 512MB
      },
      
      // Build Performance
      {
        id: 'build_time',
        name: 'Build Time',
        category: 'build_performance',
        description: 'Time to complete full build',
        target: { value: 120, priority: 'high' } // 2 minutes
      }
    ];
    
    for (const benchmarkDef of defaultBenchmarks) {
      if (!this.benchmarks.has(benchmarkDef.id)) {
        const benchmark: PerformanceBenchmark = {
          benchmarkId: benchmarkDef.id,
          name: benchmarkDef.name,
          description: benchmarkDef.description,
          category: benchmarkDef.category,
          baseline: {
            value: 0,
            timestamp: new Date(),
            context: this.enrichContext({}),
            version: 'baseline'
          },
          current: {
            value: 0,
            timestamp: new Date(),
            context: this.enrichContext({}),
            version: 'current'
          },
          improvement: {
            absolute: 0,
            percentage: 0,
            trend: 'stable',
            significance: 'none'
          },
          target: benchmarkDef.target ? {
            ...benchmarkDef.target,
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
          } : undefined
        };
        
        this.benchmarks.set(benchmarkDef.id, benchmark);
      }
    }
  }

  /**
   * Start system resource monitoring
   */
  private startSystemMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.systemMonitoring.interval);
  }

  /**
   * Collect system resource metrics
   */
  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAverage = os.loadavg();
    
    // Memory metrics
    this.recordMetric('system_memory_heap_used', memoryUsage.heapUsed, 'gauge', 'bytes', {
      component: 'system',
      operation: 'memory_monitoring'
    });
    
    this.recordMetric('system_memory_heap_total', memoryUsage.heapTotal, 'gauge', 'bytes', {
      component: 'system', 
      operation: 'memory_monitoring'
    });
    
    this.recordMetric('system_memory_external', memoryUsage.external, 'gauge', 'bytes', {
      component: 'system',
      operation: 'memory_monitoring'
    });
    
    // CPU metrics (convert microseconds to milliseconds)
    this.recordMetric('system_cpu_user', cpuUsage.user / 1000, 'gauge', 'milliseconds', {
      component: 'system',
      operation: 'cpu_monitoring'
    });
    
    this.recordMetric('system_cpu_system', cpuUsage.system / 1000, 'gauge', 'milliseconds', {
      component: 'system',
      operation: 'cpu_monitoring'
    });
    
    // Load average metrics
    this.recordMetric('system_load_1min', loadAverage[0], 'gauge', 'count', {
      component: 'system',
      operation: 'load_monitoring'
    });
    
    this.recordMetric('system_load_5min', loadAverage[1], 'gauge', 'count', {
      component: 'system',
      operation: 'load_monitoring'
    });
    
    this.recordMetric('system_load_15min', loadAverage[2], 'gauge', 'count', {
      component: 'system',
      operation: 'load_monitoring'
    });
  }

  /**
   * Start metrics buffering and periodic flushing
   */
  private startMetricsBuffering(): void {
    this.bufferFlushInterval = setInterval(async () => {
      if (this.metricsBuffer.length > 0) {
        await this.flushMetricsBuffer();
      }
    }, this.config.bufferFlushInterval);
  }

  /**
   * Flush metrics buffer to persistent storage
   */
  private async flushMetricsBuffer(): Promise<void> {
    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];
    
    try {
      // Store in database
      await this.persistMetrics(metricsToFlush);
      
      // Store in Redis for real-time access
      await this.cacheMetrics(metricsToFlush);
      
    } catch (error) {
      console.error('Failed to flush metrics buffer:', error);
      // Return metrics to buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Enrich context with system information
   */
  private enrichContext(context: Partial<PerformanceContext>): PerformanceContext {
    return {
      // System Context
      nodeVersion: process.version,
      platform: os.platform(),
      architecture: os.arch(),
      
      // Application Context
      component: context.component || 'unknown',
      operation: context.operation || 'unknown',
      userId: context.userId,
      sessionId: context.sessionId,
      requestId: context.requestId,
      
      // Environment Context
      environment: (process.env.NODE_ENV as any) || 'development',
      buildVersion: process.env.BUILD_VERSION,
      deploymentId: process.env.DEPLOYMENT_ID,
      
      // Resource Context
      cpuCores: os.cpus().length,
      totalMemory: os.totalmem(),
      availableMemory: os.freemem(),
      loadAverage: os.loadavg(),
      
      ...context
    };
  }

  /**
   * Get performance thresholds for a metric
   */
  private getThresholdsForMetric(metricName: string): PerformanceThreshold[] {
    // Default thresholds - would be configurable in production
    const defaultThresholds: Record<string, PerformanceThreshold[]> = {
      'api_response_time': [
        { level: 'warning', operator: 'gt', value: 200, description: 'API response time > 200ms' },
        { level: 'critical', operator: 'gt', value: 1000, description: 'API response time > 1s' }
      ],
      'graph_execution_time': [
        { level: 'warning', operator: 'gt', value: 1000, description: 'Graph execution > 1s' },
        { level: 'critical', operator: 'gt', value: 5000, description: 'Graph execution > 5s' }
      ],
      'system_memory_heap_used': [
        { level: 'warning', operator: 'gt', value: 512 * 1024 * 1024, description: 'Memory usage > 512MB' },
        { level: 'critical', operator: 'gt', value: 1024 * 1024 * 1024, description: 'Memory usage > 1GB' }
      ]
    };
    
    return defaultThresholds[metricName] || [];
  }

  /**
   * Evaluate thresholds for a metric value
   */
  private evaluateThresholds(value: number, thresholds: PerformanceThreshold[]): ThresholdStatus {
    let status: ThresholdStatus = 'normal';
    
    for (const threshold of thresholds) {
      const exceeded = this.evaluateThreshold(value, threshold);
      if (exceeded) {
        switch (threshold.level) {
          case 'warning':
            if (status === 'normal') status = 'warning';
            break;
          case 'critical':
            if (status !== 'emergency') status = 'critical';
            break;
          case 'emergency':
            status = 'emergency';
            break;
        }
      }
    }
    
    return status;
  }

  /**
   * Evaluate single threshold
   */
  private evaluateThreshold(value: number, threshold: PerformanceThreshold): boolean {
    switch (threshold.operator) {
      case 'lt': return value < threshold.value;
      case 'lte': return value <= threshold.value;
      case 'gt': return value > threshold.value;
      case 'gte': return value >= threshold.value;
      case 'eq': return value === threshold.value;
      case 'ne': return value !== threshold.value;
      default: return false;
    }
  }

  /**
   * Check thresholds and generate alerts
   */
  private checkThresholds(metric: PerformanceMetric): void {
    if (metric.status === 'normal') return;
    
    const existingAlert = Array.from(this.alerts.values()).find(
      alert => alert.metricId === metric.metricId && alert.status === 'active'
    );
    
    if (existingAlert) return; // Alert already exists
    
    // Find exceeded threshold
    const exceededThreshold = metric.thresholds.find(threshold =>
      this.evaluateThreshold(metric.value, threshold)
    );
    
    if (!exceededThreshold) return;
    
    // Create alert
    const alert: PerformanceAlert = {
      alertId: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metricId: metric.metricId,
      alertType: 'threshold_exceeded',
      severity: exceededThreshold.level as AlertSeverity,
      title: `Performance Alert: ${metric.name}`,
      description: `${metric.name} exceeded threshold: ${metric.value} ${metric.unit}`,
      recommendation: this.getRecommendationForMetric(metric.name, metric.value),
      triggeredAt: new Date(),
      triggerValue: metric.value,
      threshold: exceededThreshold,
      status: 'active',
      escalationLevel: 0,
      notificationsSent: 0
    };
    
    this.alerts.set(alert.alertId, alert);
    
    // Emit alert event
    this.emit('alert_triggered', alert);
    
    console.warn(`🚨 Performance Alert: ${alert.title} - ${alert.description}`);
  }

  /**
   * Get performance recommendation for metric
   */
  private getRecommendationForMetric(metricName: string, value: number): string {
    const recommendations: Record<string, string> = {
      'api_response_time': 'Consider optimizing database queries, adding caching, or implementing pagination',
      'graph_execution_time': 'Optimize node processing logic, implement parallel execution, or add caching',
      'system_memory_heap_used': 'Check for memory leaks, optimize data structures, or increase available memory',
      'ui_render_time': 'Optimize React components, implement virtualization, or reduce DOM complexity'
    };
    
    return recommendations[metricName] || 'Review performance characteristics and optimize bottlenecks';
  }

  /**
   * Calculate trend based on percentage change
   */
  private calculateTrend(percentage: number): 'improving' | 'stable' | 'degrading' {
    if (percentage > 5) return 'improving';
    if (percentage < -5) return 'degrading';
    return 'stable';
  }

  /**
   * Calculate significance of change
   */
  private calculateSignificance(percentage: number): 'none' | 'minor' | 'moderate' | 'major' {
    if (percentage < 2) return 'none';
    if (percentage < 10) return 'minor';
    if (percentage < 25) return 'moderate';
    return 'major';
  }

  /**
   * Calculate metric trend from recent values
   */
  private calculateMetricTrend(recentMetrics: PerformanceMetric[]): 'improving' | 'stable' | 'degrading' {
    if (recentMetrics.length < 3) return 'stable';
    
    const values = recentMetrics.map(m => m.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    const change = ((firstAvg - secondAvg) / firstAvg) * 100; // Positive means improvement
    
    return this.calculateTrend(change);
  }

  /**
   * Calculate system health score
   */
  private calculateSystemHealth(): SystemHealth {
    const activeAlertsCount = Array.from(this.alerts.values()).filter(a => a.status === 'active').length;
    const criticalAlertsCount = Array.from(this.alerts.values()).filter(
      a => a.status === 'active' && a.severity === 'critical'
    ).length;
    
    // Base health score
    let healthScore = 100;
    
    // Deduct points for alerts
    healthScore -= activeAlertsCount * 5;
    healthScore -= criticalAlertsCount * 10;
    
    // Ensure minimum of 0
    healthScore = Math.max(0, healthScore);
    
    const status = healthScore >= 90 ? 'healthy' : 
                  healthScore >= 70 ? 'warning' : 
                  healthScore >= 50 ? 'degraded' : 'critical';
    
    return {
      score: healthScore,
      status,
      activeAlerts: activeAlertsCount,
      criticalAlerts: criticalAlertsCount,
      timestamp: new Date()
    };
  }

  /**
   * Persist metrics to database
   */
  private async persistMetrics(metrics: PerformanceMetric[]): Promise<void> {
    try {
      const query = `
        INSERT INTO performance_metrics (
          metric_id, metric_type, name, value, unit, timestamp,
          context, tags, metadata, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      for (const metric of metrics) {
        await this.databaseService.execute(query, [
          metric.metricId,
          metric.metricType,
          metric.name,
          metric.value,
          metric.unit,
          metric.timestamp,
          JSON.stringify(metric.context),
          JSON.stringify(metric.tags),
          JSON.stringify(metric.metadata),
          metric.status
        ]);
      }
    } catch (error) {
      console.error('Failed to persist metrics:', error);
    }
  }

  /**
   * Cache metrics in Redis
   */
  private async cacheMetrics(metrics: PerformanceMetric[]): Promise<void> {
    try {
      for (const metric of metrics) {
        const key = `performance:metric:${metric.name}:latest`;
        await this.redisService.setWithExpiry(key, JSON.stringify(metric), 3600); // 1 hour
      }
    } catch (error) {
      console.error('Failed to cache metrics:', error);
    }
  }

  /**
   * Persist benchmark to storage
   */
  private async persistBenchmark(benchmark: PerformanceBenchmark): Promise<void> {
    try {
      const query = `
        INSERT OR REPLACE INTO performance_benchmarks (
          benchmark_id, name, description, category,
          baseline_value, baseline_timestamp, baseline_version,
          current_value, current_timestamp, current_version,
          improvement_data, target_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await this.databaseService.execute(query, [
        benchmark.benchmarkId,
        benchmark.name,
        benchmark.description,
        benchmark.category,
        benchmark.baseline.value,
        benchmark.baseline.timestamp,
        benchmark.baseline.version,
        benchmark.current.value,
        benchmark.current.timestamp,
        benchmark.current.version,
        JSON.stringify(benchmark.improvement),
        JSON.stringify(benchmark.target)
      ]);
    } catch (error) {
      console.error('Failed to persist benchmark:', error);
    }
  }

  /**
   * Load historical performance data
   */
  private async loadHistoricalData(): Promise<void> {
    try {
      // Load benchmarks from database
      const benchmarks = await this.databaseService.query(`
        SELECT * FROM performance_benchmarks 
        ORDER BY current_timestamp DESC
      `);
      
      for (const row of benchmarks) {
        const benchmark: PerformanceBenchmark = {
          benchmarkId: row.benchmark_id,
          name: row.name,
          description: row.description,
          category: row.category,
          baseline: {
            value: row.baseline_value,
            timestamp: new Date(row.baseline_timestamp),
            version: row.baseline_version,
            context: this.enrichContext({})
          },
          current: {
            value: row.current_value,
            timestamp: new Date(row.current_timestamp),
            version: row.current_version,
            context: this.enrichContext({})
          },
          improvement: JSON.parse(row.improvement_data),
          target: row.target_data ? JSON.parse(row.target_data) : undefined
        };
        
        this.benchmarks.set(benchmark.benchmarkId, benchmark);
      }
      
      console.log(`📈 Loaded ${benchmarks.length} historical benchmarks`);
    } catch (error) {
      console.warn('Could not load historical data:', error);
    }
  }

  /**
   * Get benchmark status
   */
  private getBenchmarkStatus(benchmark: PerformanceBenchmark): 'on_track' | 'needs_attention' | 'critical' {
    if (!benchmark.target) return 'on_track';
    
    const progress = benchmark.current.value <= benchmark.target.value ? 'achieved' : 'pending';
    
    if (progress === 'achieved') return 'on_track';
    
    const daysUntilDeadline = (benchmark.target.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    
    if (daysUntilDeadline < 7) return 'critical';
    if (daysUntilDeadline < 30) return 'needs_attention';
    
    return 'on_track';
  }

  /**
   * Calculate aggregate statistics for metrics
   */
  private calculateAggregateStatistics(metrics: Record<string, PerformanceMetric[]>): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name, metricList] of Object.entries(metrics)) {
      const values = metricList.map(m => m.value);
      
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        
        stats[name] = {
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          mean: values.reduce((sum, v) => sum + v, 0) / values.length,
          median: values[Math.floor(values.length / 2)],
          percentiles: {
            p50: values[Math.floor(values.length * 0.5)],
            p75: values[Math.floor(values.length * 0.75)],
            p90: values[Math.floor(values.length * 0.9)],
            p95: values[Math.floor(values.length * 0.95)],
            p99: values[Math.floor(values.length * 0.99)]
          }
        };
      }
    }
    
    return stats;
  }

  /**
   * Generate trend analysis
   */
  private generateTrendAnalysis(
    metrics: Record<string, PerformanceMetric[]>, 
    benchmarks: PerformanceBenchmark[]
  ): any {
    return {
      metricTrends: Object.entries(metrics).map(([name, metricList]) => ({
        name,
        trend: this.calculateMetricTrend(metricList.slice(-10)),
        dataPoints: metricList.length
      })),
      benchmarkTrends: benchmarks.map(benchmark => ({
        id: benchmark.benchmarkId,
        name: benchmark.name,
        trend: benchmark.improvement.trend,
        improvement: benchmark.improvement.percentage
      }))
    };
  }

  /**
   * Analyze benchmarks for report
   */
  private analyzeBenchmarks(benchmarks: PerformanceBenchmark[]): any {
    return {
      totalBenchmarks: benchmarks.length,
      improving: benchmarks.filter(b => b.improvement.trend === 'improving').length,
      stable: benchmarks.filter(b => b.improvement.trend === 'stable').length,
      degrading: benchmarks.filter(b => b.improvement.trend === 'degrading').length,
      targetsAchieved: benchmarks.filter(b => 
        b.target && b.current.value <= b.target.value
      ).length,
      significantChanges: benchmarks.filter(b => 
        b.improvement.significance === 'major' || b.improvement.significance === 'moderate'
      ).length
    };
  }

  /**
   * Generate performance insights
   */
  private generatePerformanceInsights(stats: any, trends: any): string[] {
    const insights: string[] = [];
    
    // Add insights based on trends
    const improvingTrends = trends.benchmarkTrends.filter((t: any) => t.trend === 'improving').length;
    const degradingTrends = trends.benchmarkTrends.filter((t: any) => t.trend === 'degrading').length;
    
    if (improvingTrends > degradingTrends) {
      insights.push(`Performance is generally improving with ${improvingTrends} metrics showing positive trends`);
    } else if (degradingTrends > improvingTrends) {
      insights.push(`${degradingTrends} metrics are degrading and require attention`);
    }
    
    // Add more insights based on specific metrics
    Object.entries(stats).forEach(([name, stat]: [string, any]) => {
      if (stat.percentiles.p95 > stat.mean * 2) {
        insights.push(`${name} shows high variability with P95 significantly above average`);
      }
    });
    
    return insights;
  }

  /**
   * Generate recommendations based on insights
   */
  private generateRecommendations(insights: string[]): string[] {
    const recommendations: string[] = [
      'Continue monitoring critical performance metrics daily',
      'Set up automated alerts for performance regressions',
      'Implement performance budgets for key user journeys',
      'Schedule regular performance reviews and optimization sprints'
    ];
    
    return recommendations;
  }

  /**
   * Persist performance report
   */
  private async persistReport(report: PerformanceReport): Promise<void> {
    try {
      const query = `
        INSERT INTO performance_reports (
          report_id, generated_at, period_start, period_end,
          categories, summary, report_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await this.databaseService.execute(query, [
        report.reportId,
        report.generatedAt,
        report.period.startDate,
        report.period.endDate,
        JSON.stringify(report.categories),
        JSON.stringify(report.summary),
        JSON.stringify({
          aggregateStats: report.aggregateStats,
          trendAnalysis: report.trendAnalysis,
          benchmarkAnalysis: report.benchmarkAnalysis,
          insights: report.insights,
          recommendations: report.recommendations
        })
      ]);
    } catch (error) {
      console.error('Failed to persist performance report:', error);
    }
  }

  /**
   * Stop performance monitoring
   */
  public async stop(): Promise<void> {
    console.log('⏹️ Stopping Performance Monitor...');
    
    this.isMonitoring = false;
    
    // Clear intervals
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
    }
    
    // Flush remaining metrics
    if (this.metricsBuffer.length > 0) {
      await this.flushMetricsBuffer();
    }
    
    await this.auditService.logEvent({
      type: 'PERFORMANCE_MONITORING_STOPPED',
      userId: 'system',
      details: {
        totalMetrics: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
        totalBenchmarks: this.benchmarks.size,
        totalAlerts: this.alerts.size,
        timestamp: new Date()
      }
    });
    
    console.log('✅ Performance Monitor stopped successfully');
  }

  /**
   * Update statistics for a metric
   */
  private updateStatistics(metricName: string): void {
    const metrics = this.metrics.get(metricName) || [];
    if (metrics.length === 0) return;
    
    const latestMetric = metrics[metrics.length - 1];
    const recentMetrics = metrics.slice(-100); // Last 100 measurements
    const values = recentMetrics.map(m => m.value).sort((a, b) => a - b);
    
    const statistics: MetricStatistics = {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((sum, v) => sum + v, 0) / values.length,
      median: values[Math.floor(values.length / 2)],
      percentiles: {
        p50: values[Math.floor(values.length * 0.5)],
        p75: values[Math.floor(values.length * 0.75)],
        p90: values[Math.floor(values.length * 0.9)],
        p95: values[Math.floor(values.length * 0.95)],
        p99: values[Math.floor(values.length * 0.99)]
      },
      standardDeviation: this.calculateStandardDeviation(values),
      variance: this.calculateVariance(values)
    };
    
    latestMetric.statistics = statistics;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}

// Supporting interfaces
export interface PerformanceMonitorConfig {
  // System Monitoring
  systemMonitoring: {
    enabled: boolean;
    interval: number; // milliseconds
  };
  
  // Buffer Configuration
  bufferFlushInterval: number; // milliseconds
  maxBufferSize: number;
  
  // Default Tags
  defaultTags: Record<string, string>;
  
  // Start Time
  startTime?: Date;
  
  // Alert Configuration
  alerting: {
    enabled: boolean;
    webhookUrl?: string;
    emailRecipients: string[];
  };
}

export interface PerformanceDashboard {
  systemOverview: {
    totalMetrics: number;
    activeBenchmarks: number;
    activeAlerts: number;
    monitoringUptime: number;
  };
  recentMetrics: Array<{
    name: string;
    count: number;
    latest: number;
    average: number;
    trend: 'improving' | 'stable' | 'degrading';
  }>;
  benchmarkSummary: Array<{
    id: string;
    name: string;
    category: BenchmarkCategory;
    currentValue: number;
    improvement: any;
    target?: any;
    status: 'on_track' | 'needs_attention' | 'critical';
  }>;
  activeAlerts: PerformanceAlert[];
  systemHealth: SystemHealth;
  timestamp: Date;
}

export interface SystemHealth {
  score: number; // 0-100
  status: 'healthy' | 'warning' | 'degraded' | 'critical';
  activeAlerts: number;
  criticalAlerts: number;
  timestamp: Date;
}

export interface PerformanceReport {
  reportId: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  categories: BenchmarkCategory[];
  summary: {
    totalMetrics: number;
    totalMeasurements: number;
    benchmarksAnalyzed: number;
    alertsGenerated: number;
  };
  aggregateStats: Record<string, any>;
  trendAnalysis: any;
  benchmarkAnalysis: any;
  insights: string[];
  recommendations: string[];
}