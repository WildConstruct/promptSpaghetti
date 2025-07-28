/**
 * Epic 16 Marketplace - Search Performance Monitor
 * 
 * Real-time monitoring system for search performance, alerts, and optimization
 * recommendations. Provides comprehensive monitoring of search infrastructure
 * health and user experience metrics.
 * 
 * Features:
 * - Real-time performance monitoring
 * - Automated alerting system
 * - Performance degradation detection
 * - Search infrastructure health checks
 * - Optimization recommendations
 */

import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { SearchAnalyticsService } from './SearchAnalyticsService';

}
interface PerformanceAlert {
  id: string;
  type: 'performance' | 'availability' | 'error_rate' | 'user_experience';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  actions: string[];
}
}

}
interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message: string;
  timestamp: Date;
  details?: any;
}
}

}
interface PerformanceMetrics {
  searchLatency: {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
}
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errorRate: {
    rate: number;
    count: number;
    total: number;
  };
  searchSuccess: {
    successRate: number;
    zeroResultsRate: number;
  };
  userExperience: {
    clickThroughRate: number;
    abandonmentRate: number;
    sessionDuration: number;
  };
  infrastructure: {
    elasticsearchHealth: string;
    postgresqlHealth: string;
    redisHealth: string;
    cacheHitRate: number;
  };
}

}
interface OptimizationRecommendation {
  category: 'index' | 'query' | 'cache' | 'infrastructure';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: string;
  actions: string[];
  estimatedImprovement: string;
}
}

@Injectable()
export class SearchPerformanceMonitor {
  private redis: Redis;
  private alertCallbacks: Map<string, Function> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    private pool: Pool,
    private searchAnalytics: SearchAnalyticsService
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });

    this.startMonitoring();
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
      await this.checkPerformanceAlerts();
      await this.updateMetrics();
    }, 30000);

    console.log('Search performance monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Search performance monitoring stopped');
  }

  /**
   * Get current performance metrics
   */
  async getCurrentMetrics(): Promise<PerformanceMetrics> {

    try {
      const [
        latencyMetrics,
        throughputMetrics,
        errorMetrics,
        successMetrics,
        userExperienceMetrics,
        infrastructureHealth
      ] = await Promise.all([
        this.getLatencyMetrics(),
        this.getThroughputMetrics(),
        this.getErrorMetrics(),
        this.getSuccessMetrics(),
        this.getUserExperienceMetrics(),
        this.getInfrastructureHealth()
      ]);

      return {
        searchLatency: latencyMetrics,
        throughput: throughputMetrics,
        errorRate: errorMetrics,
        searchSuccess: successMetrics,
        userExperience: userExperienceMetrics,
        infrastructure: infrastructureHealth
      };
    } catch (error) {
      console.error('Failed to get current metrics:', error);
      throw error;
    }
  }

  /**
   * Get active performance alerts
   */
  async getActiveAlerts(): Promise<PerformanceAlert[]> {

    try {
      const query = `
        SELECT 
          id, type, severity, title, description, metric,
          current_value, threshold, timestamp, resolved, actions
        FROM marketplace_search_alerts
        WHERE resolved = false
        ORDER BY severity DESC, timestamp DESC
      `;

      const result = await this.pool.query(query);
      return result.rows.map(row => ({
        id: row.id,
        type: row.type,
        severity: row.severity,
        title: row.title,
        description: row.description,
        metric: row.metric,
        currentValue: parseFloat(row.current_value),
        threshold: parseFloat(row.threshold),
        timestamp: new Date(row.timestamp),
        resolved: row.resolved,
        actions: row.actions || []
      }));
    } catch (error) {
      console.error('Failed to get active alerts:', error);
      return [];
    }
  }

  /**
   * Get optimization recommendations
   */
  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {

    try {
      const metrics = await this.getCurrentMetrics();
      const recommendations: OptimizationRecommendation[] = [];

      // Analyze latency issues
      if (metrics.searchLatency.p95 > 500) {
        recommendations.push({
          category: 'index',
          priority: 'high',
          title: 'High Search Latency Detected',
          description: `95th percentile latency is ${metrics.searchLatency.p95}ms, above 500ms threshold`,
          impact: 'User experience degradation, potential search abandonment',
          effort: 'Medium - requires index optimization',
          actions: [
            'Analyze slow queries and optimize Elasticsearch mappings',
            'Consider adding more search replicas',
            'Implement query result caching for frequent searches'
          ],
          estimatedImprovement: '30-50% latency reduction'
        });
      }

      // Analyze error rate issues
      if (metrics.errorRate.rate > 0.05) {
        recommendations.push({
          category: 'infrastructure',
          priority: 'critical',
          title: 'High Error Rate Detected',
          description: `Error rate is ${(metrics.errorRate.rate * 100).toFixed(2)}%, above 5% threshold`,
          impact: 'Service availability issues, user frustration',
          effort: 'High - requires infrastructure investigation',
          actions: [
            'Investigate Elasticsearch cluster health',
            'Check PostgreSQL connection pools',
            'Review application error logs',
            'Consider implementing circuit breakers'
          ],
          estimatedImprovement: 'Reduce error rate to <1%'
        });
      }

      // Analyze cache performance
      if (metrics.infrastructure.cacheHitRate < 0.7) {
        recommendations.push({
          category: 'cache',
          priority: 'medium',
          title: 'Low Cache Hit Rate',
          description: `Cache hit rate is ${(metrics.infrastructure.cacheHitRate * 100).toFixed(1)}%, below 70% target`,
          impact: 'Increased latency and database load',
          effort: 'Low - cache configuration adjustments',
          actions: [
            'Analyze cache key patterns and optimize TTL',
            'Implement cache warming for popular searches',
            'Consider increasing cache memory allocation'
          ],
          estimatedImprovement: '20-30% latency improvement'
        });
      }

      // Analyze user experience
      if (metrics.userExperience.clickThroughRate < 0.3) {
        recommendations.push({
          category: 'query',
          priority: 'medium',
          title: 'Low Click-Through Rate',
          description: `CTR is ${(metrics.userExperience.clickThroughRate * 100).toFixed(1)}%, below 30% target`,
          impact: 'Poor search relevance, user dissatisfaction',
          effort: 'Medium - requires search relevance tuning',
          actions: [
            'Analyze search result ranking algorithms',
            'A/B test different relevance scoring',
            'Implement personalized search results',
            'Review and optimize search result presentation'
          ],
          estimatedImprovement: 'Increase CTR to 35-40%'
        });
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Failed to get optimization recommendations:', error);
      return [];
    }
  }

  /**
   * Perform comprehensive health checks
   */
  async performHealthChecks(): Promise<HealthCheck[]> {

    const healthChecks: HealthCheck[] = [];

    // Elasticsearch health check
    try {
      const start = Date.now();
      // This would be an actual Elasticsearch health check
      const elasticsearchHealth = await this.checkElasticsearchHealth();
      const responseTime = Date.now() - start;

      healthChecks.push({
        service: 'elasticsearch',
        status: elasticsearchHealth.status,
        responseTime,
        message: elasticsearchHealth.message,
        timestamp: new Date(),
        details: elasticsearchHealth.details
      });
    } catch (error) {
      healthChecks.push({
        service: 'elasticsearch',
        status: 'unhealthy',
        responseTime: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }

    // PostgreSQL health check
    try {
      const start = Date.now();
      await this.pool.query('SELECT 1');
      const responseTime = Date.now() - start;

      healthChecks.push({
        service: 'postgresql',
        status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
        responseTime,
        message: `Database responding in ${responseTime}ms`,
        timestamp: new Date()
      });
    } catch (error) {
      healthChecks.push({
        service: 'postgresql',
        status: 'unhealthy',
        responseTime: 0,
        message: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date()
      });
    }

    // Redis health check
    try {
      const start = Date.now();
      await this.redis.ping();
      const responseTime = Date.now() - start;

      healthChecks.push({
        service: 'redis',
        status: responseTime < 50 ? 'healthy' : responseTime < 200 ? 'degraded' : 'unhealthy',
        responseTime,
        message: `Redis responding in ${responseTime}ms`,
        timestamp: new Date()
      });
    } catch (error) {
      healthChecks.push({
        service: 'redis',
        status: 'unhealthy',
        responseTime: 0,
        message: error instanceof Error ? error.message : 'Redis connection failed',
        timestamp: new Date()
      });
    }

    return healthChecks;
  }

  /**
   * Register alert callback
   */
  registerAlertCallback(type: string, callback: Function): void {
    this.alertCallbacks.set(type, callback);
  }

  /**
   * Trigger alert
   */
  private async triggerAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {

    try {
      // Store alert in database
      const query = `
        INSERT INTO marketplace_search_alerts (
          type, severity, title, description, metric,
          current_value, threshold, resolved, actions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8)
        RETURNING id
      `;

      const result = await this.pool.query(query, [
        alert.type,
        alert.severity,
        alert.title,
        alert.description,
        alert.metric,
        alert.currentValue,
        alert.threshold,
        JSON.stringify(alert.actions)
      ]);

      const alertId = result.rows[0].id;

      // Call registered callbacks
      const callback = this.alertCallbacks.get(alert.type) || this.alertCallbacks.get('*');
      if (callback) {
        await callback({
          ...alert,
          id: alertId,
          timestamp: new Date(),
          resolved: false
        });
      }

      console.warn(`Alert triggered: ${alert.title} (${alert.severity})`);
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }

  // Private helper methods

  private async getLatencyMetrics(): Promise<PerformanceMetrics['searchLatency']> {

    try {
      const result = await this.pool.query(`
        SELECT 
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as p50,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99,
          AVG(response_time_ms) as avg
        FROM marketplace_search_events
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
      `);

      const row = result.rows[0];
      return {
        p50: parseFloat(row.p50 || '0'),
        p95: parseFloat(row.p95 || '0'),
        p99: parseFloat(row.p99 || '0'),
        avg: parseFloat(row.avg || '0')
      };
    } catch (error) {
      console.error('Failed to get latency metrics:', error);
      return { p50: 0, p95: 0, p99: 0, avg: 0 };
    }
  }

  private async getThroughputMetrics(): Promise<PerformanceMetrics['throughput']> {

    try {
      const result = await this.pool.query(`
        SELECT 
          COUNT(*)::float / 3600 as requests_per_second,
          COUNT(*) as requests_per_minute
        FROM marketplace_search_events
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
      `);

      const row = result.rows[0];
      return {
        requestsPerSecond: parseFloat(row.requests_per_second || '0'),
        requestsPerMinute: parseInt(row.requests_per_minute || '0')
      };
    } catch (error) {
      console.error('Failed to get throughput metrics:', error);
      return { requestsPerSecond: 0, requestsPerMinute: 0 };
    }
  }

  private async getErrorMetrics(): Promise<PerformanceMetrics['errorRate']> {

    // This would track actual errors - for now return mock data
    return {
      rate: 0.02,
      count: 5,
      total: 250
    };
  }

  private async getSuccessMetrics(): Promise<PerformanceMetrics['searchSuccess']> {

    try {
      const result = await this.pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE result_count > 0)::float / COUNT(*) as success_rate,
          COUNT(*) FILTER (WHERE result_count = 0)::float / COUNT(*) as zero_results_rate
        FROM marketplace_search_events
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
      `);

      const row = result.rows[0];
      return {
        successRate: parseFloat(row.success_rate || '0'),
        zeroResultsRate: parseFloat(row.zero_results_rate || '0')
      };
    } catch (error) {
      console.error('Failed to get success metrics:', error);
      return { successRate: 0, zeroResultsRate: 0 };
    }
  }

  private async getUserExperienceMetrics(): Promise<PerformanceMetrics['userExperience']> {

    try {
      const ctrResult = await this.pool.query(`
        SELECT 
          COUNT(DISTINCT c.session_id)::float / COUNT(DISTINCT s.session_id) as ctr
        FROM marketplace_search_events s
        LEFT JOIN marketplace_search_clicks c ON s.session_id = c.session_id
        WHERE s.timestamp >= NOW() - INTERVAL '1 hour'
      `);

      const abandonmentResult = await this.pool.query(`
        SELECT 
          COUNT(*)::float / (
            SELECT COUNT(DISTINCT session_id) 
            FROM marketplace_search_events 
            WHERE timestamp >= NOW() - INTERVAL '1 hour'
          ) as abandonment_rate
        FROM marketplace_search_abandonments
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
      `);

      return {
        clickThroughRate: parseFloat(ctrResult.rows[0]?.ctr || '0'),
        abandonmentRate: parseFloat(abandonmentResult.rows[0]?.abandonment_rate || '0'),
        sessionDuration: 180 // Mock data - would calculate from actual session data
      };
    } catch (error) {
      console.error('Failed to get user experience metrics:', error);
      return { clickThroughRate: 0, abandonmentRate: 0, sessionDuration: 0 };
    }
  }

  private async getInfrastructureHealth(): Promise<PerformanceMetrics['infrastructure']> {

    try {
      // Get cache hit rate from Redis
      const cacheStats = await this.redis.info('stats');
      const hitRate = this.parseCacheHitRate(cacheStats);

      return {
        elasticsearchHealth: 'green', // Would get from actual Elasticsearch
        postgresqlHealth: 'green',
        redisHealth: 'green',
        cacheHitRate: hitRate
      };
    } catch (error) {
      console.error('Failed to get infrastructure health:', error);
      return {
        elasticsearchHealth: 'unknown',
        postgresqlHealth: 'unknown',
        redisHealth: 'unknown',
        cacheHitRate: 0
      };
    }
  }

  private async checkElasticsearchHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; message: string; details?: any }> {

    // Mock implementation - would use actual Elasticsearch client
    return {
      status: 'healthy',
      message: 'Elasticsearch cluster is healthy',
      details: {
        cluster_name: 'marketplace',
        status: 'green',
        number_of_nodes: 3,
        active_primary_shards: 5,
        active_shards: 15
      }
    };
  }

  private async checkPerformanceAlerts(): Promise<void> {

    const metrics = await this.getCurrentMetrics();

    // Check latency alerts
    if (metrics.searchLatency.p95 > 1000) {
      await this.triggerAlert({
        type: 'performance',
        severity: 'critical',
        title: 'High Search Latency',
        description: `95th percentile latency is ${metrics.searchLatency.p95}ms`,
        metric: 'search_latency_p95',
        currentValue: metrics.searchLatency.p95,
        threshold: 1000,
        actions: ['Check Elasticsearch cluster', 'Optimize slow queries', 'Scale search infrastructure']
      });
    } else if (metrics.searchLatency.p95 > 500) {
      await this.triggerAlert({
        type: 'performance',
        severity: 'warning',
        title: 'Elevated Search Latency',
        description: `95th percentile latency is ${metrics.searchLatency.p95}ms`,
        metric: 'search_latency_p95',
        currentValue: metrics.searchLatency.p95,
        threshold: 500,
        actions: ['Monitor search performance', 'Review recent queries']
      });
    }

    // Check error rate alerts
    if (metrics.errorRate.rate > 0.1) {
      await this.triggerAlert({
        type: 'availability',
        severity: 'critical',
        title: 'High Error Rate',
        description: `Error rate is ${(metrics.errorRate.rate * 100).toFixed(1)}%`,
        metric: 'error_rate',
        currentValue: metrics.errorRate.rate,
        threshold: 0.1,
        actions: ['Check service health', 'Review error logs', 'Scale infrastructure']
      });
    }

    // Check user experience alerts
    if (metrics.userExperience.clickThroughRate < 0.2) {
      await this.triggerAlert({
        type: 'user_experience',
        severity: 'warning',
        title: 'Low Click-Through Rate',
        description: `CTR is ${(metrics.userExperience.clickThroughRate * 100).toFixed(1)}%`,
        metric: 'click_through_rate',
        currentValue: metrics.userExperience.clickThroughRate,
        threshold: 0.2,
        actions: ['Analyze search relevance', 'Review result ranking', 'A/B test improvements']
      });
    }
  }

  private async updateMetrics(): Promise<void> {

    try {
      const metrics = await this.getCurrentMetrics();
      
      // Store metrics in Redis for real-time dashboard
      const metricsKey = `search:metrics:${Math.floor(Date.now() / 60000)}`; // Per minute
      await this.redis.hmset(metricsKey, {
        latency_p95: metrics.searchLatency.p95,
        latency_avg: metrics.searchLatency.avg,
        throughput_rps: metrics.throughput.requestsPerSecond,
        error_rate: metrics.errorRate.rate,
        success_rate: metrics.searchSuccess.successRate,
        ctr: metrics.userExperience.clickThroughRate,
        cache_hit_rate: metrics.infrastructure.cacheHitRate
      });
      
      await this.redis.expire(metricsKey, 3600); // Keep for 1 hour
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  private parseCacheHitRate(infoString: string): number {
    // Parse Redis INFO stats to calculate hit rate
    // This is a simplified implementation
    try {
      const lines = infoString.split('\r\n');
      let hits = 0;
      let misses = 0;

      for (const line of lines) {
        if (line.startsWith('keyspace_hits:')) {
          hits = parseInt(line.split(':')[1]);
        } else if (line.startsWith('keyspace_misses:')) {
          misses = parseInt(line.split(':')[1]);
        }
      }

      const total = hits + misses;
      return total > 0 ? hits / total : 0;
    } catch (error) {
      return 0;
    }
  }
}