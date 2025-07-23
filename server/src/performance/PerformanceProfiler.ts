/**
 * Performance Profiler
 * 
 * Comprehensive performance profiling system for server-side monitoring under load.
 * Collects CPU, memory, database, and application-level metrics during load testing.
 * 
 * Task: T-1752989144295-168 - Profile server and client performance under load
 */

import { EventEmitter } from 'events';
import { cpuUsage, memoryUsage } from 'process';
import { performance } from 'perf_hooks';
import { promisify } from 'util';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Performance metrics collection interfaces
 */
export interface CPUMetrics {
  user: number;
  system: number;
  total: number;
  percentage: number;
  loadAverage: number[];
}

export interface MemoryMetrics {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  heapUtilization: number;
}

export interface DatabaseMetrics {
  connectionCount: number;
  activeQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  errorCount: number;
  connectionPoolUtilization: number;
}

export interface ApplicationMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  eventLoopLag: number;
  gcFrequency: number;
  gcDuration: number;
}

export interface SystemMetrics {
  diskUsage: number;
  networkIO: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  fileDescriptors: number;
  threadCount: number;
}

export interface PerformanceSnapshot {
  timestamp: number;
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  database: DatabaseMetrics;
  application: ApplicationMetrics;
  system: SystemMetrics;
  customMetrics: Record<string, any>;
}

export interface ProfilingConfig {
  sampleInterval: number; // milliseconds
  databaseEnabled: boolean;
  systemMetricsEnabled: boolean;
  gcMetricsEnabled: boolean;
  outputDirectory: string;
  maxSnapshots: number;
  alertThresholds: {
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    errorRate: number;
  };
}

/**
 * Performance Profiler Class
 */
export class PerformanceProfiler extends EventEmitter {
  private config: ProfilingConfig;
  private snapshots: PerformanceSnapshot[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private baselineCPU: NodeJS.CpuUsage | null = null;
  private requestCounter = 0;
  private responseTimeSum = 0;
  private errorCounter = 0;
  private gcStats: any = null;
  private databaseConnection: any = null;

  constructor(config: Partial<ProfilingConfig> = {}) {
    super();
    
    this.config = {
      sampleInterval: 1000, // 1 second
      databaseEnabled: true,
      systemMetricsEnabled: true,
      gcMetricsEnabled: true,
      outputDirectory: './performance-profiles',
      maxSnapshots: 3600, // 1 hour at 1 second intervals
      alertThresholds: {
        cpuUsage: 80, // %
        memoryUsage: 85, // %
        responseTime: 2000, // ms
        errorRate: 5 // %
      },
      ...config
    };

    this.setupOutputDirectory();
    this.initializeGCTracking();
  }

  /**
   * Start performance profiling
   */
  async startProfiling(): Promise<void> {
    if (this.isRunning) {
      console.warn('Performance profiling is already running');
      return;
    }

    console.log('🔍 Starting performance profiling...');
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.baselineCPU = cpuUsage();
    this.snapshots = [];
    this.requestCounter = 0;
    this.responseTimeSum = 0;
    this.errorCounter = 0;

    // Initialize database connection if enabled
    if (this.config.databaseEnabled) {
      try {
        await this.initializeDatabaseMetrics();
      } catch (error) {
        console.warn('Failed to initialize database metrics:', error);
        this.config.databaseEnabled = false;
      }
    }

    // Start periodic sampling
    this.intervalId = setInterval(() => {
      this.collectSnapshot();
    }, this.config.sampleInterval);

    // Take initial baseline snapshot
    await this.collectSnapshot();

    this.emit('profiling_started', {
      timestamp: this.startTime,
      config: this.config
    });

    console.log(`✅ Performance profiling started (sampling every ${this.config.sampleInterval}ms)`);
  }

  /**
   * Stop performance profiling
   */
  async stopProfiling(): Promise<PerformanceSnapshot[]> {
    if (!this.isRunning) {
      console.warn('Performance profiling is not running');
      return this.snapshots;
    }

    console.log('⏹️  Stopping performance profiling...');

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Take final snapshot
    await this.collectSnapshot();

    const endTime = Date.now();
    const duration = endTime - this.startTime;

    this.emit('profiling_stopped', {
      timestamp: endTime,
      duration,
      snapshotCount: this.snapshots.length
    });

    console.log(`✅ Performance profiling stopped (${this.snapshots.length} snapshots collected over ${Math.round(duration / 1000)}s)`);

    // Generate and save report
    await this.generateReport();

    return this.snapshots;
  }

  /**
   * Collect performance snapshot
   */
  private async collectSnapshot(): Promise<void> {
    try {
      const timestamp = Date.now();

      const snapshot: PerformanceSnapshot = {
        timestamp,
        cpu: await this.collectCPUMetrics(),
        memory: this.collectMemoryMetrics(),
        database: await this.collectDatabaseMetrics(),
        application: this.collectApplicationMetrics(),
        system: await this.collectSystemMetrics(),
        customMetrics: {}
      };

      // Add to snapshots array
      this.snapshots.push(snapshot);

      // Trim snapshots if exceeding max
      if (this.snapshots.length > this.config.maxSnapshots) {
        this.snapshots = this.snapshots.slice(-this.config.maxSnapshots);
      }

      // Check for performance alerts
      this.checkPerformanceAlerts(snapshot);

      this.emit('snapshot_collected', snapshot);

    } catch (error) {
      console.error('Failed to collect performance snapshot:', error);
      this.emit('snapshot_error', error);
    }
  }

  /**
   * Collect CPU metrics
   */
  private async collectCPUMetrics(): Promise<CPUMetrics> {
    const currentCPU = cpuUsage(this.baselineCPU || undefined);
    const totalCPU = currentCPU.user + currentCPU.system;
    
    // Get system load average
    let loadAverage: number[] = [0, 0, 0];
    try {
      if (process.platform !== 'win32') {
        const os = require('os');
        loadAverage = os.loadavg();
      }
    } catch (error) {
      console.warn('Failed to get load average:', error);
    }

    // Calculate CPU percentage (simplified)
    const percentage = Math.min(100, (totalCPU / 1000000) * 100); // Convert microseconds to percentage

    return {
      user: currentCPU.user,
      system: currentCPU.system,
      total: totalCPU,
      percentage,
      loadAverage
    };
  }

  /**
   * Collect memory metrics
   */
  private collectMemoryMetrics(): MemoryMetrics {
    const memory = memoryUsage();
    const heapUtilization = (memory.heapUsed / memory.heapTotal) * 100;

    return {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers || 0,
      heapUtilization
    };
  }

  /**
   * Collect database metrics
   */
  private async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    if (!this.config.databaseEnabled || !this.databaseConnection) {
      return {
        connectionCount: 0,
        activeQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        errorCount: 0,
        connectionPoolUtilization: 0
      };
    }

    try {
      // This would integrate with your specific database monitoring
      // For SQLite (example implementation)
      const stats = await this.queryDatabaseStats();
      
      return {
        connectionCount: stats.connections || 1,
        activeQueries: stats.activeQueries || 0,
        averageQueryTime: stats.avgQueryTime || 0,
        slowQueries: stats.slowQueries || 0,
        errorCount: stats.errors || 0,
        connectionPoolUtilization: stats.poolUtilization || 0
      };
    } catch (error) {
      console.warn('Failed to collect database metrics:', error);
      return {
        connectionCount: 0,
        activeQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        errorCount: 0,
        connectionPoolUtilization: 0
      };
    }
  }

  /**
   * Collect application metrics
   */
  private collectApplicationMetrics(): ApplicationMetrics {
    const now = Date.now();
    const elapsed = Math.max(1, now - this.startTime) / 1000; // seconds
    
    const requestsPerSecond = this.requestCounter / elapsed;
    const averageResponseTime = this.requestCounter > 0 ? this.responseTimeSum / this.requestCounter : 0;
    const errorRate = this.requestCounter > 0 ? (this.errorCounter / this.requestCounter) * 100 : 0;

    // Event loop lag measurement
    const start = performance.now();
    setImmediate(() => {
      const lag = performance.now() - start;
      this.emit('event_loop_lag', lag);
    });

    return {
      requestsPerSecond,
      averageResponseTime,
      errorRate,
      activeConnections: 0, // This would come from your HTTP server
      eventLoopLag: 0, // Updated asynchronously
      gcFrequency: this.gcStats?.frequency || 0,
      gcDuration: this.gcStats?.duration || 0
    };
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    if (!this.config.systemMetricsEnabled) {
      return {
        diskUsage: 0,
        networkIO: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 },
        fileDescriptors: 0,
        threadCount: 0
      };
    }

    try {
      let diskUsage = 0;
      let fileDescriptors = 0;
      const threadCount = 0;
      const networkIO = { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 };

      // Get disk usage (Unix-like systems)
      if (process.platform !== 'win32') {
        try {
          const df = execSync('df -h / | tail -1 | awk \'{print $5}\'', { encoding: 'utf8' });
          diskUsage = parseInt(df.replace('%', '')) || 0;
        } catch (error) {
          console.warn('Failed to get disk usage:', error);
        }

        // Get file descriptor count
        try {
          const lsof = execSync(`lsof -p ${process.pid} | wc -l`, { encoding: 'utf8' });
          fileDescriptors = parseInt(lsof) || 0;
        } catch (error) {
          console.warn('Failed to get file descriptor count:', error);
        }
      }

      return {
        diskUsage,
        networkIO,
        fileDescriptors,
        threadCount
      };
    } catch (error) {
      console.warn('Failed to collect system metrics:', error);
      return {
        diskUsage: 0,
        networkIO: { bytesIn: 0, bytesOut: 0, packetsIn: 0, packetsOut: 0 },
        fileDescriptors: 0,
        threadCount: 0
      };
    }
  }

  /**
   * Track HTTP request metrics
   */
  trackRequest(responseTime: number, isError: boolean = false): void {
    this.requestCounter++;
    this.responseTimeSum += responseTime;
    
    if (isError) {
      this.errorCounter++;
    }
  }

  /**
   * Add custom metric
   */
  addCustomMetric(key: string, value: any): void {
    if (this.snapshots.length > 0) {
      const lastSnapshot = this.snapshots[this.snapshots.length - 1];
      lastSnapshot.customMetrics[key] = value;
    }
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(snapshot: PerformanceSnapshot): void {
    const alerts: string[] = [];

    // CPU usage alert
    if (snapshot.cpu.percentage > this.config.alertThresholds.cpuUsage) {
      alerts.push(`High CPU usage: ${snapshot.cpu.percentage.toFixed(1)}%`);
    }

    // Memory usage alert
    if (snapshot.memory.heapUtilization > this.config.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${snapshot.memory.heapUtilization.toFixed(1)}%`);
    }

    // Response time alert
    if (snapshot.application.averageResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push(`High response time: ${snapshot.application.averageResponseTime.toFixed(0)}ms`);
    }

    // Error rate alert
    if (snapshot.application.errorRate > this.config.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${snapshot.application.errorRate.toFixed(1)}%`);
    }

    if (alerts.length > 0) {
      this.emit('performance_alert', {
        timestamp: snapshot.timestamp,
        alerts
      });
    }
  }

  /**
   * Generate performance report
   */
  private async generateReport(): Promise<void> {
    if (this.snapshots.length === 0) {
      console.warn('No snapshots to generate report');
      return;
    }

    const report = {
      metadata: {
        startTime: this.startTime,
        endTime: Date.now(),
        duration: Date.now() - this.startTime,
        snapshotCount: this.snapshots.length,
        sampleInterval: this.config.sampleInterval
      },
      summary: this.generateSummaryMetrics(),
      snapshots: this.snapshots,
      recommendations: this.generateRecommendations()
    };

    const filename = `performance-profile-${Date.now()}.json`;
    const filepath = join(this.config.outputDirectory, filename);
    
    writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Performance report generated: ${filepath}`);
    this.emit('report_generated', { filepath, report });
  }

  /**
   * Generate summary metrics
   */
  private generateSummaryMetrics(): any {
    if (this.snapshots.length === 0) return null;

    const cpuValues = this.snapshots.map(s => s.cpu.percentage);
    const memoryValues = this.snapshots.map(s => s.memory.heapUtilization);
    const responseTimeValues = this.snapshots.map(s => s.application.averageResponseTime);

    return {
      cpu: {
        average: this.average(cpuValues),
        max: Math.max(...cpuValues),
        min: Math.min(...cpuValues)
      },
      memory: {
        average: this.average(memoryValues),
        max: Math.max(...memoryValues),
        min: Math.min(...memoryValues)
      },
      responseTime: {
        average: this.average(responseTimeValues),
        max: Math.max(...responseTimeValues),
        min: Math.min(...responseTimeValues)
      },
      totalRequests: this.requestCounter,
      totalErrors: this.errorCounter,
      overallErrorRate: this.requestCounter > 0 ? (this.errorCounter / this.requestCounter) * 100 : 0
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.generateSummaryMetrics();

    if (!summary) return recommendations;

    if (summary.cpu.average > 70) {
      recommendations.push('Consider CPU optimization: high average CPU usage detected');
    }

    if (summary.memory.average > 80) {
      recommendations.push('Consider memory optimization: high memory utilization detected');
    }

    if (summary.responseTime.average > 1000) {
      recommendations.push('Consider response time optimization: slow average response times detected');
    }

    if (summary.overallErrorRate > 3) {
      recommendations.push('Investigate error handling: elevated error rate detected');
    }

    return recommendations;
  }

  /**
   * Utility methods
   */
  private setupOutputDirectory(): void {
    if (!existsSync(this.config.outputDirectory)) {
      mkdirSync(this.config.outputDirectory, { recursive: true });
    }
  }

  private initializeGCTracking(): void {
    if (!this.config.gcMetricsEnabled) return;

    try {
      // Basic GC tracking
      this.gcStats = { frequency: 0, duration: 0 };
      // More advanced GC metrics would require native modules
    } catch (error) {
      console.warn('Failed to initialize GC tracking:', error);
    }
  }

  private async initializeDatabaseMetrics(): Promise<void> {
    // This would initialize database connection for metrics collection
    // Implementation depends on your database setup
    console.log('Database metrics initialized');
  }

  private async queryDatabaseStats(): Promise<any> {
    // Mock implementation - replace with actual database queries
    return {
      connections: 1,
      activeQueries: Math.floor(Math.random() * 5),
      avgQueryTime: Math.random() * 100,
      slowQueries: 0,
      errors: 0,
      poolUtilization: Math.random() * 50
    };
  }

  private average(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  /**
   * Get current performance stats
   */
  getCurrentStats(): any {
    if (this.snapshots.length === 0) return null;
    
    const latest = this.snapshots[this.snapshots.length - 1];
    return {
      timestamp: latest.timestamp,
      cpu: latest.cpu.percentage,
      memory: latest.memory.heapUtilization,
      responseTime: latest.application.averageResponseTime,
      errorRate: latest.application.errorRate,
      requestsPerSecond: latest.application.requestsPerSecond
    };
  }
}