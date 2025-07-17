import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as os from 'os';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * System resource metrics
 */
export interface SystemMetrics {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  networkStats: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  };
  diskUsage: {
    reads: number;
    writes: number;
  };
  processMetrics: {
    pid: number;
    uptime: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
  };
}

/**
 * WebSocket performance metrics
 */
export interface WebSocketMetrics {
  timestamp: number;
  connectionCount: number;
  messageRate: number;
  messageLatency: number;
  disconnectionRate: number;
  errorRate: number;
  bytesTransferred: number;
  activeDocuments: number;
  averageUsersPerDocument: number;
}

/**
 * Collaboration-specific metrics
 */
export interface CollaborationMetrics {
  timestamp: number;
  conflictRate: number;
  conflictResolutionTime: number;
  synchronizationLatency: number;
  operationRate: number;
  stateUpdateLatency: number;
  presenceUpdateRate: number;
  documentSizeBytes: number;
  operationQueueLength: number;
  conflictQueueLength: number;
}

/**
 * Performance thresholds for alerting
 */
export interface PerformanceThresholds {
  maxCpuUsage: number;
  maxMemoryUsage: number;
  maxMessageLatency: number;
  maxConflictResolutionTime: number;
  maxSynchronizationLatency: number;
  minSuccessRate: number;
  maxErrorRate: number;
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  id: string;
  timestamp: number;
  severity: 'warning' | 'critical';
  metric: string;
  currentValue: number;
  threshold: number;
  description: string;
  resolved: boolean;
}

/**
 * Metrics aggregation window
 */
export interface MetricsWindow {
  windowStart: number;
  windowEnd: number;
  duration: number;
  systemMetrics: SystemMetrics[];
  webSocketMetrics: WebSocketMetrics[];
  collaborationMetrics: CollaborationMetrics[];
}

/**
 * Comprehensive metrics collector for performance monitoring
 */
export class MetricsCollector extends EventEmitter {
  private systemMetrics: SystemMetrics[] = [];
  private webSocketMetrics: WebSocketMetrics[] = [];
  private collaborationMetrics: CollaborationMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  
  private isCollecting: boolean = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private retentionPeriod: number = 24 * 60 * 60 * 1000; // 24 hours
  private collectionFrequency: number = 5000; // 5 seconds
  
  private thresholds: PerformanceThresholds = {
    maxCpuUsage: 80,
    maxMemoryUsage: 85,
    maxMessageLatency: 1000,
    maxConflictResolutionTime: 5000,
    maxSynchronizationLatency: 2000,
    minSuccessRate: 95,
    maxErrorRate: 5
  };

  private networkBaseline: any = null;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    super();
    
    if (thresholds) {
      this.thresholds = { ...this.thresholds, ...thresholds };
    }
  }

  /**
   * Start collecting metrics
   */
  startCollection(): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;
    console.log('Starting performance metrics collection');

    // Initialize network baseline
    this.initializeNetworkBaseline();

    // Start periodic collection
    this.collectionInterval = setInterval(() => {
      this.collectAllMetrics();
    }, this.collectionFrequency);

    // Start cleanup routine
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60000); // cleanup every minute
  }

  /**
   * Stop collecting metrics
   */
  stopCollection(): void {
    if (!this.isCollecting) {
      return;
    }

    this.isCollecting = false;
    console.log('Stopping performance metrics collection');

    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
  }

  /**
   * Record WebSocket metrics
   */
  recordWebSocketMetrics(metrics: Partial<WebSocketMetrics>): void {
    const fullMetrics: WebSocketMetrics = {
      timestamp: Date.now(),
      connectionCount: metrics.connectionCount || 0,
      messageRate: metrics.messageRate || 0,
      messageLatency: metrics.messageLatency || 0,
      disconnectionRate: metrics.disconnectionRate || 0,
      errorRate: metrics.errorRate || 0,
      bytesTransferred: metrics.bytesTransferred || 0,
      activeDocuments: metrics.activeDocuments || 0,
      averageUsersPerDocument: metrics.averageUsersPerDocument || 0
    };

    this.webSocketMetrics.push(fullMetrics);
    this.checkWebSocketThresholds(fullMetrics);
    this.emit('websocket_metrics', fullMetrics);
  }

  /**
   * Record collaboration metrics
   */
  recordCollaborationMetrics(metrics: Partial<CollaborationMetrics>): void {
    const fullMetrics: CollaborationMetrics = {
      timestamp: Date.now(),
      conflictRate: metrics.conflictRate || 0,
      conflictResolutionTime: metrics.conflictResolutionTime || 0,
      synchronizationLatency: metrics.synchronizationLatency || 0,
      operationRate: metrics.operationRate || 0,
      stateUpdateLatency: metrics.stateUpdateLatency || 0,
      presenceUpdateRate: metrics.presenceUpdateRate || 0,
      documentSizeBytes: metrics.documentSizeBytes || 0,
      operationQueueLength: metrics.operationQueueLength || 0,
      conflictQueueLength: metrics.conflictQueueLength || 0
    };

    this.collaborationMetrics.push(fullMetrics);
    this.checkCollaborationThresholds(fullMetrics);
    this.emit('collaboration_metrics', fullMetrics);
  }

  /**
   * Get current metrics snapshot
   */
  getCurrentMetrics(): {
    system: SystemMetrics | null;
    webSocket: WebSocketMetrics | null;
    collaboration: CollaborationMetrics | null;
  } {
    return {
      system: this.systemMetrics[this.systemMetrics.length - 1] || null,
      webSocket: this.webSocketMetrics[this.webSocketMetrics.length - 1] || null,
      collaboration: this.collaborationMetrics[this.collaborationMetrics.length - 1] || null
    };
  }

  /**
   * Get metrics for a time window
   */
  getMetricsWindow(startTime: number, endTime: number): MetricsWindow {
    return {
      windowStart: startTime,
      windowEnd: endTime,
      duration: endTime - startTime,
      systemMetrics: this.systemMetrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime),
      webSocketMetrics: this.webSocketMetrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime),
      collaborationMetrics: this.collaborationMetrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime)
    };
  }

  /**
   * Get aggregated metrics for a time period
   */
  getAggregatedMetrics(startTime: number, endTime: number): any {
    const window = this.getMetricsWindow(startTime, endTime);
    
    return {
      period: {
        start: startTime,
        end: endTime,
        duration: endTime - startTime
      },
      system: this.aggregateSystemMetrics(window.systemMetrics),
      webSocket: this.aggregateWebSocketMetrics(window.webSocketMetrics),
      collaboration: this.aggregateCollaborationMetrics(window.collaborationMetrics),
      alerts: this.alerts.filter(a => a.timestamp >= startTime && a.timestamp <= endTime)
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(duration: number = 60000): any {
    const endTime = Date.now();
    const startTime = endTime - duration;
    
    const aggregated = this.getAggregatedMetrics(startTime, endTime);
    const alerts = this.getActiveAlerts();
    
    return {
      timestamp: endTime,
      period: duration,
      health: this.calculateOverallHealth(aggregated),
      alerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      metrics: aggregated,
      recommendations: this.generateRecommendations(aggregated, alerts)
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.emit('alert_resolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Export metrics to file
   */
  async exportMetrics(filePath: string, format: 'json' | 'csv' = 'json'): Promise<void> {
    const data = {
      exportTime: Date.now(),
      systemMetrics: this.systemMetrics,
      webSocketMetrics: this.webSocketMetrics,
      collaborationMetrics: this.collaborationMetrics,
      alerts: this.alerts
    };

    if (format === 'json') {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } else {
      const csv = this.convertToCSV(data);
      await fs.writeFile(filePath, csv);
    }
  }

  /**
   * Collect all current metrics
   */
  private async collectAllMetrics(): Promise<void> {
    try {
      const systemMetrics = await this.collectSystemMetrics();
      this.systemMetrics.push(systemMetrics);
      this.checkSystemThresholds(systemMetrics);
      this.emit('system_metrics', systemMetrics);
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const memInfo = process.memoryUsage();
    const cpuUsage = await this.getCPUUsage();
    const networkStats = await this.getNetworkStats();
    
    return {
      timestamp: Date.now(),
      cpuUsage,
      memoryUsage: {
        used: memInfo.heapUsed,
        total: memInfo.heapTotal,
        percentage: (memInfo.heapUsed / memInfo.heapTotal) * 100
      },
      networkStats,
      diskUsage: {
        reads: 0, // Would need platform-specific implementation
        writes: 0
      },
      processMetrics: {
        pid: process.pid,
        uptime: process.uptime(),
        heapUsed: memInfo.heapUsed,
        heapTotal: memInfo.heapTotal,
        external: memInfo.external,
        arrayBuffers: memInfo.arrayBuffers
      }
    };
  }

  /**
   * Get CPU usage percentage
   */
  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = process.hrtime();
      const startUsage = process.cpuUsage();

      setTimeout(() => {
        const endTime = process.hrtime(startTime);
        const endUsage = process.cpuUsage(startUsage);

        const totalTime = endTime[0] * 1000000 + endTime[1] / 1000; // microseconds
        const cpuTime = (endUsage.user + endUsage.system); // microseconds

        const cpuPercent = (cpuTime / totalTime) * 100;
        resolve(Math.min(cpuPercent, 100));
      }, 100);
    });
  }

  /**
   * Get network statistics
   */
  private async getNetworkStats(): Promise<any> {
    try {
      const networkInterfaces = os.networkInterfaces();
      let totalReceived = 0;
      let totalSent = 0;
      
      // This is a simplified implementation
      // In a real scenario, you'd track deltas from baseline
      return {
        bytesReceived: totalReceived,
        bytesSent: totalSent,
        packetsReceived: 0,
        packetsSent: 0
      };
    } catch (error) {
      return {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0
      };
    }
  }

  /**
   * Initialize network baseline for delta calculations
   */
  private async initializeNetworkBaseline(): Promise<void> {
    this.networkBaseline = await this.getNetworkStats();
  }

  /**
   * Check system metric thresholds
   */
  private checkSystemThresholds(metrics: SystemMetrics): void {
    if (metrics.cpuUsage > this.thresholds.maxCpuUsage) {
      this.createAlert('cpu_usage', metrics.cpuUsage, this.thresholds.maxCpuUsage, 
        `CPU usage is ${metrics.cpuUsage.toFixed(1)}%`, 'warning');
    }

    if (metrics.memoryUsage.percentage > this.thresholds.maxMemoryUsage) {
      this.createAlert('memory_usage', metrics.memoryUsage.percentage, this.thresholds.maxMemoryUsage,
        `Memory usage is ${metrics.memoryUsage.percentage.toFixed(1)}%`, 'critical');
    }
  }

  /**
   * Check WebSocket metric thresholds
   */
  private checkWebSocketThresholds(metrics: WebSocketMetrics): void {
    if (metrics.messageLatency > this.thresholds.maxMessageLatency) {
      this.createAlert('message_latency', metrics.messageLatency, this.thresholds.maxMessageLatency,
        `Message latency is ${metrics.messageLatency}ms`, 'warning');
    }

    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      this.createAlert('error_rate', metrics.errorRate, this.thresholds.maxErrorRate,
        `Error rate is ${metrics.errorRate.toFixed(1)}%`, 'critical');
    }
  }

  /**
   * Check collaboration metric thresholds
   */
  private checkCollaborationThresholds(metrics: CollaborationMetrics): void {
    if (metrics.conflictResolutionTime > this.thresholds.maxConflictResolutionTime) {
      this.createAlert('conflict_resolution_time', metrics.conflictResolutionTime, 
        this.thresholds.maxConflictResolutionTime,
        `Conflict resolution time is ${metrics.conflictResolutionTime}ms`, 'warning');
    }

    if (metrics.synchronizationLatency > this.thresholds.maxSynchronizationLatency) {
      this.createAlert('sync_latency', metrics.synchronizationLatency, 
        this.thresholds.maxSynchronizationLatency,
        `Synchronization latency is ${metrics.synchronizationLatency}ms`, 'warning');
    }
  }

  /**
   * Create a performance alert
   */
  private createAlert(metric: string, currentValue: number, threshold: number, 
                     description: string, severity: 'warning' | 'critical'): void {
    const alertId = `${metric}_${Date.now()}`;
    const alert: PerformanceAlert = {
      id: alertId,
      timestamp: Date.now(),
      severity,
      metric,
      currentValue,
      threshold,
      description,
      resolved: false
    };

    this.alerts.push(alert);
    this.emit('alert_created', alert);
  }

  /**
   * Aggregate system metrics
   */
  private aggregateSystemMetrics(metrics: SystemMetrics[]): any {
    if (metrics.length === 0) return null;

    const cpuValues = metrics.map(m => m.cpuUsage);
    const memoryValues = metrics.map(m => m.memoryUsage.percentage);

    return {
      cpu: this.calculateStatistics(cpuValues),
      memory: this.calculateStatistics(memoryValues),
      sampleCount: metrics.length
    };
  }

  /**
   * Aggregate WebSocket metrics
   */
  private aggregateWebSocketMetrics(metrics: WebSocketMetrics[]): any {
    if (metrics.length === 0) return null;

    return {
      connectionCount: this.calculateStatistics(metrics.map(m => m.connectionCount)),
      messageLatency: this.calculateStatistics(metrics.map(m => m.messageLatency)),
      messageRate: this.calculateStatistics(metrics.map(m => m.messageRate)),
      errorRate: this.calculateStatistics(metrics.map(m => m.errorRate)),
      sampleCount: metrics.length
    };
  }

  /**
   * Aggregate collaboration metrics
   */
  private aggregateCollaborationMetrics(metrics: CollaborationMetrics[]): any {
    if (metrics.length === 0) return null;

    return {
      conflictRate: this.calculateStatistics(metrics.map(m => m.conflictRate)),
      conflictResolutionTime: this.calculateStatistics(metrics.map(m => m.conflictResolutionTime)),
      synchronizationLatency: this.calculateStatistics(metrics.map(m => m.synchronizationLatency)),
      operationRate: this.calculateStatistics(metrics.map(m => m.operationRate)),
      sampleCount: metrics.length
    };
  }

  /**
   * Calculate statistical measures
   */
  private calculateStatistics(values: number[]): any {
    if (values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, p95: 0, p99: 0 };
    }

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1],
      p99: sorted[Math.floor(sorted.length * 0.99)] || sorted[sorted.length - 1]
    };
  }

  /**
   * Calculate overall system health score
   */
  private calculateOverallHealth(aggregated: any): number {
    let healthScore = 100;
    const activeAlerts = this.getActiveAlerts();

    // Deduct points for active alerts
    healthScore -= activeAlerts.filter(a => a.severity === 'warning').length * 10;
    healthScore -= activeAlerts.filter(a => a.severity === 'critical').length * 25;

    // Factor in performance metrics
    if (aggregated.system) {
      if (aggregated.system.cpu.mean > this.thresholds.maxCpuUsage) {
        healthScore -= 15;
      }
      if (aggregated.system.memory.mean > this.thresholds.maxMemoryUsage) {
        healthScore -= 20;
      }
    }

    if (aggregated.webSocket) {
      if (aggregated.webSocket.errorRate.mean > this.thresholds.maxErrorRate) {
        healthScore -= 25;
      }
      if (aggregated.webSocket.messageLatency.mean > this.thresholds.maxMessageLatency) {
        healthScore -= 10;
      }
    }

    return Math.max(0, Math.min(100, healthScore));
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(aggregated: any, alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    // CPU recommendations
    if (aggregated.system?.cpu.mean > this.thresholds.maxCpuUsage) {
      recommendations.push('Consider scaling horizontally or optimizing CPU-intensive operations');
    }

    // Memory recommendations
    if (aggregated.system?.memory.mean > this.thresholds.maxMemoryUsage) {
      recommendations.push('Implement garbage collection optimizations or increase available memory');
    }

    // WebSocket recommendations
    if (aggregated.webSocket?.messageLatency.mean > this.thresholds.maxMessageLatency) {
      recommendations.push('Optimize message processing or implement message batching');
    }

    if (aggregated.webSocket?.errorRate.mean > this.thresholds.maxErrorRate) {
      recommendations.push('Investigate and fix sources of WebSocket errors');
    }

    // Collaboration recommendations
    if (aggregated.collaboration?.conflictResolutionTime.mean > this.thresholds.maxConflictResolutionTime) {
      recommendations.push('Optimize conflict resolution algorithms or implement better conflict prevention');
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is within acceptable thresholds');
    }

    return recommendations;
  }

  /**
   * Clean up old metrics beyond retention period
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.retentionPeriod;

    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoffTime);
    this.webSocketMetrics = this.webSocketMetrics.filter(m => m.timestamp > cutoffTime);
    this.collaborationMetrics = this.collaborationMetrics.filter(m => m.timestamp > cutoffTime);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffTime);
  }

  /**
   * Convert metrics to CSV format
   */
  private convertToCSV(data: any): string {
    // Simplified CSV conversion - would be more sophisticated in real implementation
    const lines: string[] = [];
    
    // System metrics CSV
    lines.push('Type,Timestamp,CPUUsage,MemoryUsage,HeapUsed,HeapTotal');
    data.systemMetrics.forEach((m: SystemMetrics) => {
      lines.push(`system,${m.timestamp},${m.cpuUsage},${m.memoryUsage.percentage},${m.processMetrics.heapUsed},${m.processMetrics.heapTotal}`);
    });

    return lines.join('\n');
  }
}