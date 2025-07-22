/**
 * Performance Monitor
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 * 
 * Comprehensive performance monitoring system for node execution tracking and optimization
 */

import { EventEmitter } from 'events';
import { AdvancedExecutionContext } from '../runtime/advanced';

export interface PerformanceMetrics {
  nodeId: string;
  nodeType: string;
  executionId: string;
  
  // Timing metrics
  startTime: number;
  endTime: number;
  duration: number;
  
  // Resource usage
  memoryUsage: {
    before: number;
    after: number;
    peak: number;
    delta: number;
  };
  
  // Context metrics
  contextSize: {
    variableCount: number;
    stateCount: number;
    cacheSize: number;
    evaluationDepth: number;
  };
  
  // Performance indicators
  cacheHit: boolean;
  errors: string[];
  warnings: string[];
  
  // Custom metrics
  customMetrics: Map<string, number | string | boolean>;
}

export interface AggregatedMetrics {
  nodeType: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  
  // Timing statistics
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  medianDuration: number;
  p95Duration: number;
  p99Duration: number;
  
  // Resource statistics
  averageMemoryDelta: number;
  peakMemoryUsage: number;
  
  // Context statistics
  averageContextSize: number;
  cacheHitRate: number;
  
  // Trend analysis
  performanceTrend: 'improving' | 'stable' | 'degrading';
  lastUpdated: number;
  
  // Recommendations
  optimizationRecommendations: string[];
}

export interface PerformanceAlert {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'duration' | 'memory' | 'error_rate' | 'context_size' | 'custom';
  nodeType?: string;
  nodeId?: string;
  message: string;
  details: Record<string, any>;
  resolved: boolean;
}

export interface PerformanceMonitorConfig {
  enableMemoryTracking: boolean;
  enableContextTracking: boolean;
  enableAggregation: boolean;
  enableAlerting: boolean;
  
  // Thresholds
  slowExecutionThreshold: number; // milliseconds
  memoryThreshold: number; // bytes
  contextSizeThreshold: number;
  errorRateThreshold: number; // percentage
  
  // Storage settings
  maxMetricsHistory: number;
  aggregationInterval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  
  // Alert settings
  alertCooldown: number; // milliseconds
  maxAlerts: number;
}

/**
 * Comprehensive performance monitoring system
 */
export class PerformanceMonitor extends EventEmitter {
  private config: PerformanceMonitorConfig;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private aggregatedMetrics: Map<string, AggregatedMetrics> = new Map();
  private activeExecutions: Map<string, {
    startTime: number;
    initialMemory: number;
    nodeId: string;
    nodeType: string;
    executionId: string;
  }> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private aggregationInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    super();

    this.config = {
      enableMemoryTracking: true,
      enableContextTracking: true,
      enableAggregation: true,
      enableAlerting: true,
      
      slowExecutionThreshold: 1000, // 1 second
      memoryThreshold: 50 * 1024 * 1024, // 50MB
      contextSizeThreshold: 1000,
      errorRateThreshold: 5, // 5%
      
      maxMetricsHistory: 10000,
      aggregationInterval: 30000, // 30 seconds
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      
      alertCooldown: 300000, // 5 minutes
      maxAlerts: 100,
      
      ...config
    };

    this.initialize();
  }

  /**
   * Start monitoring a node execution
   */
  startExecution(nodeId: string, nodeType: string, context: AdvancedExecutionContext): string {
    const executionId = context.executionMeta?.executionId || this.generateExecutionId();
    const trackingId = `${nodeId}-${executionId}-${Date.now()}`;
    
    this.activeExecutions.set(trackingId, {
      startTime: performance.now(),
      initialMemory: this.getMemoryUsage(),
      nodeId,
      nodeType,
      executionId
    });

    this.emit('execution_started', {
      trackingId,
      nodeId,
      nodeType,
      executionId
    });

    return trackingId;
  }

  /**
   * End monitoring a node execution
   */
  endExecution(
    trackingId: string, 
    context: AdvancedExecutionContext, 
    result?: any, 
    error?: Error
  ): PerformanceMetrics | null {
    const execution = this.activeExecutions.get(trackingId);
    if (!execution) {
      console.warn(`Performance Monitor: No active execution found for tracking ID ${trackingId}`);
      return null;
    }

    const endTime = performance.now();
    const currentMemory = this.getMemoryUsage();
    const duration = endTime - execution.startTime;

    // Build performance metrics
    const metrics: PerformanceMetrics = {
      nodeId: execution.nodeId,
      nodeType: execution.nodeType,
      executionId: execution.executionId,
      
      startTime: execution.startTime,
      endTime,
      duration,
      
      memoryUsage: {
        before: execution.initialMemory,
        after: currentMemory,
        peak: Math.max(execution.initialMemory, currentMemory),
        delta: currentMemory - execution.initialMemory
      },
      
      contextSize: this.analyzeContextSize(context),
      
      cacheHit: this.determineCacheHit(context, result),
      errors: error ? [error.message] : [],
      warnings: [],
      
      customMetrics: new Map()
    };

    // Analyze performance and add warnings
    this.analyzePerformance(metrics);

    // Store metrics
    this.storeMetrics(metrics);

    // Check for alerts
    if (this.config.enableAlerting) {
      this.checkAlerts(metrics);
    }

    // Clean up
    this.activeExecutions.delete(trackingId);

    this.emit('execution_completed', {
      trackingId,
      metrics,
      success: !error
    });

    return metrics;
  }

  /**
   * Get metrics for a specific node
   */
  getNodeMetrics(nodeId: string): PerformanceMetrics[] {
    return Array.from(this.metrics.values()).filter(m => m.nodeId === nodeId);
  }

  /**
   * Get aggregated metrics for a node type
   */
  getAggregatedMetrics(nodeType: string): AggregatedMetrics | null {
    return this.aggregatedMetrics.get(nodeType) || null;
  }

  /**
   * Get all active alerts
   */
  getAlerts(resolved = false): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.resolved === resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alert_resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Get performance statistics summary
   */
  getStatisticsSummary(): {
    totalExecutions: number;
    activeExecutions: number;
    averageExecutionTime: number;
    slowExecutions: number;
    errorRate: number;
    memoryPressure: number;
    activeAlerts: number;
    topPerformingTypes: string[];
    underperformingTypes: string[];
  } {
    const allMetrics = Array.from(this.metrics.values());
    const totalExecutions = allMetrics.length;
    const activeExecutions = this.activeExecutions.size;
    
    if (totalExecutions === 0) {
      return {
        totalExecutions: 0,
        activeExecutions,
        averageExecutionTime: 0,
        slowExecutions: 0,
        errorRate: 0,
        memoryPressure: 0,
        activeAlerts: this.getAlerts(false).length,
        topPerformingTypes: [],
        underperformingTypes: []
      };
    }

    const totalDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageExecutionTime = totalDuration / totalExecutions;
    
    const slowExecutions = allMetrics.filter(m => 
      m.duration > this.config.slowExecutionThreshold
    ).length;
    
    const errorCount = allMetrics.filter(m => m.errors.length > 0).length;
    const errorRate = (errorCount / totalExecutions) * 100;
    
    const avgMemoryDelta = allMetrics.reduce((sum, m) => 
      sum + Math.abs(m.memoryUsage.delta), 0
    ) / totalExecutions;
    const memoryPressure = (avgMemoryDelta / this.config.memoryThreshold) * 100;
    
    // Analyze type performance
    const typePerformance = new Map<string, number>();
    const typeCounts = new Map<string, number>();
    
    allMetrics.forEach(m => {
      const currentAvg = typePerformance.get(m.nodeType) || 0;
      const currentCount = typeCounts.get(m.nodeType) || 0;
      
      typePerformance.set(m.nodeType, currentAvg + m.duration);
      typeCounts.set(m.nodeType, currentCount + 1);
    });
    
    // Calculate averages and sort
    const typeAverages = Array.from(typePerformance.entries()).map(([type, total]) => ({
      type,
      avgDuration: total / (typeCounts.get(type) || 1)
    }));
    
    typeAverages.sort((a, b) => a.avgDuration - b.avgDuration);
    
    return {
      totalExecutions,
      activeExecutions,
      averageExecutionTime,
      slowExecutions,
      errorRate,
      memoryPressure,
      activeAlerts: this.getAlerts(false).length,
      topPerformingTypes: typeAverages.slice(0, 3).map(t => t.type),
      underperformingTypes: typeAverages.slice(-3).map(t => t.type)
    };
  }

  /**
   * Clear all metrics and reset the monitor
   */
  clear(): void {
    this.metrics.clear();
    this.aggregatedMetrics.clear();
    this.activeExecutions.clear();
    this.alerts.clear();
    
    this.emit('monitor_cleared');
  }

  /**
   * Shutdown the performance monitor
   */
  shutdown(): void {
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.clear();
    this.emit('monitor_shutdown');
  }

  // Private helper methods

  private initialize(): void {
    if (this.config.enableAggregation) {
      this.aggregationInterval = setInterval(() => {
        this.updateAggregatedMetrics();
      }, this.config.aggregationInterval);
    }

    // Setup cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.retentionPeriod / 10); // Clean up every 1/10 of retention period
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    
    // Fallback for browser environments
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    
    return 0;
  }

  private analyzeContextSize(context: AdvancedExecutionContext): PerformanceMetrics['contextSize'] {
    if (!this.config.enableContextTracking) {
      return {
        variableCount: 0,
        stateCount: 0,
        cacheSize: 0,
        evaluationDepth: 0
      };
    }

    return {
      variableCount: context.variables.size,
      stateCount: context.nodeStates.size,
      cacheSize: context.cache.size,
      evaluationDepth: context.evaluationDepth
    };
  }

  private determineCacheHit(context: AdvancedExecutionContext, result: any): boolean {
    // Simple heuristic: if cache has entries and result contains cached data
    if (context.cache.size === 0) return false;
    
    // This is a simplified cache hit detection
    // In real implementation, you'd track cache access patterns
    return context.cache.size > 0 && result && typeof result === 'object';
  }

  private analyzePerformance(metrics: PerformanceMetrics): void {
    // Check for slow execution
    if (metrics.duration > this.config.slowExecutionThreshold) {
      metrics.warnings.push(
        `Slow execution: ${metrics.duration.toFixed(2)}ms (threshold: ${this.config.slowExecutionThreshold}ms)`
      );
    }

    // Check for high memory usage
    if (Math.abs(metrics.memoryUsage.delta) > this.config.memoryThreshold) {
      metrics.warnings.push(
        `High memory usage: ${(metrics.memoryUsage.delta / (1024 * 1024)).toFixed(2)}MB delta`
      );
    }

    // Check for large context
    const totalContextSize = 
      metrics.contextSize.variableCount + 
      metrics.contextSize.stateCount + 
      metrics.contextSize.cacheSize;
      
    if (totalContextSize > this.config.contextSizeThreshold) {
      metrics.warnings.push(
        `Large context size: ${totalContextSize} items (threshold: ${this.config.contextSizeThreshold})`
      );
    }

    // Check for deep evaluation
    if (metrics.contextSize.evaluationDepth > 10) { // Arbitrary threshold
      metrics.warnings.push(
        `Deep evaluation depth: ${metrics.contextSize.evaluationDepth} levels`
      );
    }
  }

  private storeMetrics(metrics: PerformanceMetrics): void {
    const key = `${metrics.nodeId}-${metrics.executionId}-${metrics.startTime}`;
    this.metrics.set(key, metrics);

    // Enforce size limit
    if (this.metrics.size > this.config.maxMetricsHistory) {
      const oldestKey = this.metrics.keys().next().value;
      this.metrics.delete(oldestKey);
    }
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];

    // Duration alert
    if (metrics.duration > this.config.slowExecutionThreshold * 2) {
      alerts.push({
        id: this.generateAlertId(),
        timestamp: Date.now(),
        severity: 'high',
        type: 'duration',
        nodeType: metrics.nodeType,
        nodeId: metrics.nodeId,
        message: `Very slow execution: ${metrics.duration.toFixed(2)}ms`,
        details: { duration: metrics.duration, threshold: this.config.slowExecutionThreshold },
        resolved: false
      });
    }

    // Memory alert
    if (Math.abs(metrics.memoryUsage.delta) > this.config.memoryThreshold * 2) {
      alerts.push({
        id: this.generateAlertId(),
        timestamp: Date.now(),
        severity: 'medium',
        type: 'memory',
        nodeType: metrics.nodeType,
        nodeId: metrics.nodeId,
        message: `High memory usage: ${(metrics.memoryUsage.delta / (1024 * 1024)).toFixed(2)}MB`,
        details: { memoryDelta: metrics.memoryUsage.delta, threshold: this.config.memoryThreshold },
        resolved: false
      });
    }

    // Error alert
    if (metrics.errors.length > 0) {
      alerts.push({
        id: this.generateAlertId(),
        timestamp: Date.now(),
        severity: 'critical',
        type: 'error_rate',
        nodeType: metrics.nodeType,
        nodeId: metrics.nodeId,
        message: `Node execution error: ${metrics.errors[0]}`,
        details: { errors: metrics.errors },
        resolved: false
      });
    }

    // Store alerts
    alerts.forEach(alert => {
      if (this.alerts.size < this.config.maxAlerts) {
        this.alerts.set(alert.id, alert);
        this.emit('alert_created', alert);
      }
    });
  }

  private updateAggregatedMetrics(): void {
    const typeMetrics = new Map<string, PerformanceMetrics[]>();
    
    // Group metrics by type
    for (const metrics of this.metrics.values()) {
      const existing = typeMetrics.get(metrics.nodeType) || [];
      existing.push(metrics);
      typeMetrics.set(metrics.nodeType, existing);
    }

    // Calculate aggregations
    for (const [nodeType, metricsArray] of typeMetrics) {
      const aggregated = this.calculateAggregation(nodeType, metricsArray);
      this.aggregatedMetrics.set(nodeType, aggregated);
    }

    this.emit('aggregation_updated', {
      types: Array.from(typeMetrics.keys()),
      timestamp: Date.now()
    });
  }

  private calculateAggregation(nodeType: string, metrics: PerformanceMetrics[]): AggregatedMetrics {
    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const successfulExecutions = metrics.filter(m => m.errors.length === 0).length;
    const failedExecutions = metrics.length - successfulExecutions;
    
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const averageDuration = totalDuration / durations.length;
    
    // Percentile calculations
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);
    const medianIndex = Math.floor(durations.length * 0.5);
    
    // Memory calculations
    const memoryDeltas = metrics.map(m => Math.abs(m.memoryUsage.delta));
    const averageMemoryDelta = memoryDeltas.reduce((sum, d) => sum + d, 0) / memoryDeltas.length;
    const peakMemoryUsage = Math.max(...metrics.map(m => m.memoryUsage.peak));
    
    // Context size calculations
    const contextSizes = metrics.map(m => 
      m.contextSize.variableCount + m.contextSize.stateCount + m.contextSize.cacheSize
    );
    const averageContextSize = contextSizes.reduce((sum, s) => sum + s, 0) / contextSizes.length;
    
    // Cache hit rate
    const cacheHits = metrics.filter(m => m.cacheHit).length;
    const cacheHitRate = (cacheHits / metrics.length) * 100;
    
    // Performance trend analysis
    const recentMetrics = metrics.slice(-10); // Last 10 executions
    const olderMetrics = metrics.slice(0, -10);
    
    let performanceTrend: AggregatedMetrics['performanceTrend'] = 'stable';
    if (recentMetrics.length >= 5 && olderMetrics.length >= 5) {
      const recentAvg = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
      const olderAvg = olderMetrics.reduce((sum, m) => sum + m.duration, 0) / olderMetrics.length;
      
      const improvement = (olderAvg - recentAvg) / olderAvg;
      
      if (improvement > 0.1) {
        performanceTrend = 'improving';
      } else if (improvement < -0.1) {
        performanceTrend = 'degrading';
      }
    }

    // Generate optimization recommendations
    const optimizationRecommendations: string[] = [];
    
    if (averageDuration > this.config.slowExecutionThreshold) {
      optimizationRecommendations.push('Consider optimizing node execution logic');
    }
    
    if (cacheHitRate < 50 && averageContextSize > 100) {
      optimizationRecommendations.push('Enable caching to improve performance');
    }
    
    if (averageMemoryDelta > this.config.memoryThreshold * 0.5) {
      optimizationRecommendations.push('Review memory usage patterns');
    }
    
    if (performanceTrend === 'degrading') {
      optimizationRecommendations.push('Performance is degrading - investigate recent changes');
    }

    return {
      nodeType,
      totalExecutions: metrics.length,
      successfulExecutions,
      failedExecutions,
      
      averageDuration,
      minDuration: durations[0] || 0,
      maxDuration: durations[durations.length - 1] || 0,
      medianDuration: durations[medianIndex] || 0,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      
      averageMemoryDelta,
      peakMemoryUsage,
      
      averageContextSize,
      cacheHitRate,
      
      performanceTrend,
      lastUpdated: Date.now(),
      
      optimizationRecommendations
    };
  }

  private cleanup(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    
    // Clean old metrics
    for (const [key, metrics] of this.metrics) {
      if (metrics.endTime < cutoffTime) {
        this.metrics.delete(key);
      }
    }
    
    // Clean resolved alerts older than retention period
    for (const [key, alert] of this.alerts) {
      if (alert.resolved && alert.timestamp < cutoffTime) {
        this.alerts.delete(key);
      }
    }

    this.emit('cleanup_completed', {
      metricsCount: this.metrics.size,
      alertsCount: this.alerts.size
    });
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default PerformanceMonitor;