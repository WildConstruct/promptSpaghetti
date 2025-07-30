/**
 * Enhanced Health Monitoring Service with Dependency Scoring
 */

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { circuitBreakerService } from './CircuitBreakerService';
import { retryService } from './RetryService';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

export enum DependencyType {
  DATABASE = 'database',
  CACHE = 'cache',
  EXTERNAL_API = 'external-api',
  FILE_SYSTEM = 'filesystem',
  MESSAGE_QUEUE = 'message-queue',
  AUTHENTICATION = 'authentication',
  CUSTOM = 'custom'
}

export interface HealthCheckResult {
  status: HealthStatus;
  responseTimeMs: number;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: number;
  error?: string;
}
}

}
export interface DependencyHealthCheck {
  name: string;
  type: DependencyType;
  weight: number; // 0-1, importance for overall system health
  timeoutMs: number;
  healthCheck: () => Promise<HealthCheckResult>;
  criticalThresholdMs?: number; // Response time threshold for critical status
  degradedThresholdMs?: number; // Response time threshold for degraded status
}
}

}
export interface SystemHealthSummary {
  overall: HealthStatus;
  score: number; // 0-100, weighted health score
  timestamp: number;
}
  dependencies: Record<string, HealthCheckResult & { weight: number; type: DependencyType }>;
  issues: string[];
  recommendations: string[];
  uptime: number;
  lastStatusChange?: {
    from: HealthStatus;
    to: HealthStatus;
    timestamp: number;
  };
}

}
export interface HealthMetrics {
  checksPerformed: number;
  averageHealthScore: number;
  statusDistribution: Record<HealthStatus, number>;
  slowestDependencies: Array<{
    name: string;
    averageResponseTime: number;
    type: DependencyType;
}
  }>;
  recentDowntime: Array<{
    dependency: string;
    status: HealthStatus;
    duration: number;
    timestamp: number;
  }>;
}

class HealthMonitoringService extends EventEmitter {
  private dependencies: Map<string, DependencyHealthCheck> = new Map();
  private lastHealthCheck: Map<string, HealthCheckResult> = new Map();
  private healthHistory: Map<string, HealthCheckResult[]> = new Map();
  private currentOverallStatus: HealthStatus = HealthStatus.UNKNOWN;
  private lastStatusChange?: { from: HealthStatus; to: HealthStatus; timestamp: number };
  private startTime: number = Date.now();
  private checkInterval?: NodeJS.Timeout;
  private isRunning: boolean = false;
  private metrics: {
    checksPerformed: number;
    statusCounts: Record<HealthStatus, number>;
    totalHealthScore: number;
    responseTimeSums: Map<string, { total: number; count: number }>;
  };

  private static instance: HealthMonitoringService;

  constructor() {
    super();
    this.metrics = {
      checksPerformed: 0,
      statusCounts: Object.values(HealthStatus).reduce(
        (acc, status) => ({ ...acc, [status]: 0 }), 
        {} as Record<HealthStatus, number>
      ),
      totalHealthScore: 0,
      responseTimeSums: new Map(};
  }

  static getInstance(): HealthMonitoringService {
    if (!HealthMonitoringService.instance) {
      HealthMonitoringService.instance = new HealthMonitoringService();
    }
    return HealthMonitoringService.instance;
  }

  public registerDependency(check: DependencyHealthCheck): void {
    this.dependencies.set(check.name, check);
    this.healthHistory.set(check.name, []);
    
    logger.info(`Registered health check for dependency '${check.name}'`, {
      type: check.type,
      weight: check.weight,
      timeoutMs: check.timeoutMs
    });
  }

  public unregisterDependency(name: string): void {
    this.dependencies.delete(name);
    this.lastHealthCheck.delete(name);
    this.healthHistory.delete(name);
    this.metrics.responseTimeSums.delete(name);
    
    logger.info(`Unregistered health check for dependency '${name}'`);
  }

  private async performHealthCheck(dependency: DependencyHealthCheck): Promise<HealthCheckResult> {

    const startTime = Date.now();

    try {
      // Execute health check with timeout
      const result = await Promise.race([
        dependency.healthCheck(),
        this.createTimeoutPromise(dependency.timeoutMs, dependency.name)
      ]);

      const responseTime = Date.now() - startTime;
      result.responseTimeMs = responseTime;
      result.timestamp = startTime;

      // Adjust status based on response time thresholds
      if (result.status === HealthStatus.HEALTHY) {
        if (dependency.criticalThresholdMs && responseTime > dependency.criticalThresholdMs) {
          result.status = HealthStatus.CRITICAL;
          result.message = `Response time ${responseTime}ms exceeds critical threshold ${dependency.criticalThresholdMs}ms`;
        } else if (dependency.degradedThresholdMs && responseTime > dependency.degradedThresholdMs) {
          result.status = HealthStatus.DEGRADED;
          result.message = `Response time ${responseTime}ms exceeds degraded threshold ${dependency.degradedThresholdMs}ms`;
        }
      }

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: HealthStatus.UNHEALTHY,
        responseTimeMs: responseTime,
        timestamp: startTime,
        error: error instanceof Error ? error.message : String(error),
        message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private createTimeoutPromise(timeoutMs: number, dependencyName: string): Promise<HealthCheckResult> {

    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Health check for '${dependencyName}' timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private updateMetrics(dependencyName: string, result: HealthCheckResult): void {
    this.metrics.checksPerformed++;
    this.metrics.statusCounts[result.status]++;

    // Track response times
    const responseTimeData = this.metrics.responseTimeSums.get(dependencyName) || { total: 0, count: 0 };
    responseTimeData.total += result.responseTimeMs;
    responseTimeData.count++;
    this.metrics.responseTimeSums.set(dependencyName, responseTimeData);

    // Store in history (keep last 50 checks per dependency)
    const history = this.healthHistory.get(dependencyName) || [];
    history.push(result);
    if (history.length > 50) {
      history.shift();
    }
    this.healthHistory.set(dependencyName, history);
  }

  private calculateOverallHealthScore(): { score: number; status: HealthStatus; issues: string[]; recommendations: string[] } {
    let totalWeight = 0;
    let weightedScore = 0;
    const issues: string[] = [];
    const recommendations: string[] = [];

    this.dependencies.forEach((dependency, name) => {
      const result = this.lastHealthCheck.get(name);
      if (!result) return;

      const weight = dependency.weight;
      totalWeight += weight;

      // Convert status to score (0-100)
      let statusScore: number;
      switch (result.status) {
      case HealthStatus.HEALTHY:
        statusScore = 100;
        break;
      case HealthStatus.DEGRADED:
        statusScore = 70;
        issues.push(`${name} is degraded: ${result.message || 'Performance issues detected'}`);
        recommendations.push(`Monitor ${name} closely and investigate performance issues`);
        break;
      case HealthStatus.UNHEALTHY:
        statusScore = 30;
        issues.push(`${name} is unhealthy: ${result.message || result.error || 'Health check failed'}`);
        recommendations.push(`Investigate and fix issues with ${name}`);
        break;
      case HealthStatus.CRITICAL:
        statusScore = 10;
        issues.push(`${name} is in critical state: ${result.message || result.error || 'Critical failure detected'}`);
        recommendations.push(`URGENT: Address critical issues with ${name} immediately`);
        break;
      case HealthStatus.UNKNOWN:
        statusScore = 50; // Neutral score for unknown status
        issues.push(`${name} status is unknown`);
        recommendations.push(`Check ${name} health monitoring configuration`);
        break;
      }

      weightedScore += statusScore * weight;
    });

    const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    let overallStatus: HealthStatus;

    // Determine overall status based on score and critical dependencies
    const hasCriticalIssues = Array.from(this.lastHealthCheck.values()).some(
      result => result.status === HealthStatus.CRITICAL
    );

    if (hasCriticalIssues) {
      overallStatus = HealthStatus.CRITICAL;
    } else if (finalScore >= 90) {
      overallStatus = HealthStatus.HEALTHY;
    } else if (finalScore >= 70) {
      overallStatus = HealthStatus.DEGRADED;
    } else if (finalScore >= 30) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else {
      overallStatus = HealthStatus.CRITICAL;
    }

    return { score: finalScore, status: overallStatus, issues, recommendations };
  }

  public async checkHealth(): Promise<SystemHealthSummary> {

    const healthChecks = Array.from(this.dependencies.entries()).map(
      async ([name, dependency]) => {
        const result = await this.performHealthCheck(dependency);
        this.lastHealthCheck.set(name, result);
        this.updateMetrics(name, result);
        return { name, dependency, result };
      }
    );

    await Promise.allSettled(healthChecks);

    const { score, status, issues, recommendations } = this.calculateOverallHealthScore();
    this.metrics.totalHealthScore += score;

    // Track status changes
    if (this.currentOverallStatus !== status) {
      this.lastStatusChange = {
        from: this.currentOverallStatus,
        to: status,
        timestamp: Date.now()
      };

      this.currentOverallStatus = status;

      this.emit('statusChange', {
        from: this.lastStatusChange.from,
        to: status,
        timestamp: this.lastStatusChange.timestamp,
        score
      });

      logger.warn('System health status changed', this.lastStatusChange);
    }

    // Build summary
    const dependencies: Record<string, HealthCheckResult & { weight: number; type: DependencyType }> = {};
    this.dependencies.forEach((dependency, name) => {
      const result = this.lastHealthCheck.get(name);
      if (result) {
        dependencies[name] = {
          ...result,
          weight: dependency.weight,
          type: dependency.type
        };
      }
    });

    return {
      overall: status,
      score,
      timestamp: Date.now(),
      dependencies,
      issues,
      recommendations,
      uptime: Date.now() - this.startTime,
      lastStatusChange: this.lastStatusChange
    };
  }

  public getMetrics(): HealthMetrics {
    const averageHealthScore = this.metrics.checksPerformed > 0 
      ? Math.round((this.metrics.totalHealthScore / this.metrics.checksPerformed) * 100) / 100
      : 0;

    // Calculate slowest dependencies
    const slowestDependencies = Array.from(this.metrics.responseTimeSums.entries())
      .map(([name, data]) => ({
        name,
        averageResponseTime: Math.round((data.total / data.count) * 100) / 100,
        type: this.dependencies.get(name)?.type || DependencyType.CUSTOM
      }))
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, 5);

    // Calculate recent downtime from history
    const recentDowntime: Array<{
      dependency: string;
      status: HealthStatus;
      duration: number;
      timestamp: number;
    }> = [];

    this.healthHistory.forEach((history, dependencyName) => {
      const recentHistory = history.slice(-10); // Last 10 checks
      let downtimeStart: number | null = null;

      recentHistory.forEach((check) => {
        const isDown = check.status === HealthStatus.UNHEALTHY || check.status === HealthStatus.CRITICAL;
        
        if (isDown && !downtimeStart) {
          downtimeStart = check.timestamp;
        } else if (!isDown && downtimeStart) {
          recentDowntime.push({
            dependency: dependencyName,
            status: check.status,
            duration: check.timestamp - downtimeStart,
            timestamp: downtimeStart
          });
          downtimeStart = null;
        }
      });
    });

    return {
      checksPerformed: this.metrics.checksPerformed,
      averageHealthScore,
      statusDistribution: this.metrics.statusCounts,
      slowestDependencies,
      recentDowntime: recentDowntime.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
    };
  }

  public startMonitoring(intervalMs: number = 30000): void {
    if (this.isRunning) {
      logger.warn('Health monitoring is already running');
      return;
    }

    this.isRunning = true;
    
    // Initial health check
    this.checkHealth().catch(error => {
      logger.error('Error in initial health check', { error: error.message });
    });

    // Set up periodic checks
    this.checkInterval = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        logger.error(
          'Error in periodic health check',
          { error: error instanceof Error ? error.message : String(error
          ) });
      }
    }, intervalMs);

    logger.info(`Health monitoring started with ${intervalMs}ms interval`);
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    this.isRunning = false;
    logger.info('Health monitoring stopped');
  }

  public isMonitoringActive(): boolean {
    return this.isRunning;
  }

  // Pre-configured health checks for common dependencies
  public registerDatabaseHealthCheck(connectionTest: () => Promise<boolean>): void {
    this.registerDependency({
      name: 'database',
      type: DependencyType.DATABASE,
      weight: 0.9, // Very important
      timeoutMs: 5000,
      criticalThresholdMs: 3000,
      degradedThresholdMs: 1000,
      healthCheck: async () => {
        const isConnected = await connectionTest();
        return {
          status: isConnected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          responseTimeMs: 0, // Will be set by performHealthCheck
          timestamp: Date.now(),
          message: isConnected ? 'Database connection is healthy' : 'Database connection failed'
        };
      }
    });
  }

  public registerRedisHealthCheck(pingTest: () => Promise<boolean>): void {
    this.registerDependency({
      name: 'redis',
      type: DependencyType.CACHE,
      weight: 0.6, // Important but not critical
      timeoutMs: 2000,
      criticalThresholdMs: 1000,
      degradedThresholdMs: 500,
      healthCheck: async () => {
        const isConnected = await pingTest();
        return {
          status: isConnected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          responseTimeMs: 0,
          timestamp: Date.now(),
          message: isConnected ? 'Redis connection is healthy' : 'Redis connection failed'
        };
      }
    });
  }

  public registerExternalAPIHealthCheck(
    serviceName: string,
    healthEndpoint: (
  ) => Promise<{ ok: boolean; status?: number }>): void {
    this.registerDependency({
      name: `external-api-${serviceName}`,
      type: DependencyType.EXTERNAL_API,
      weight: 0.5, // Medium importance
      timeoutMs: 10000,
      criticalThresholdMs: 8000,
      degradedThresholdMs: 5000,
      healthCheck: async () => {
        const response = await healthEndpoint();
        return {
          status: response.ok ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
          responseTimeMs: 0,
          timestamp: Date.now(),
          message: response.ok ? `${serviceName} API is healthy` : `${serviceName} API is not responding`,
          details: { statusCode: response.status }
        };
      }
    });
  }
}

// Export singleton instance
export const healthMonitoringService = new HealthMonitoringService();
export default HealthMonitoringService;