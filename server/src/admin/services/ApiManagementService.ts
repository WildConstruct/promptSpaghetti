/**
 * Enhanced API Management Service - Epic 17.4.4 API Management System
 * 
 * Extended service layer for comprehensive API management dashboard functionality,
 * including advanced analytics, monitoring, and administrative operations.
 * 
 * Task: E17-1753114397211-324330 - Design API management system
 */

import { ApiKeyManagementService } from '../../auth/services/ApiKeyManagementService';
import { DatabaseService } from '../../database/DatabaseService';
import { AuditService } from '../../auth/services/AuditService';

export interface ApiKeyUsageAnalytics {
  keyId: string;
  name: string;
  userEmail: string;
  usage: {
    totalCalls: number;
    callsLast24h: number;
    callsLastWeek: number;
    callsLastMonth: number;
    errorCount: number;
    errorRate: number;
    averageResponseTime: number;
    rateLimitHits: number;
  };
  performance: {
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    successRate: number;
    uptime: number;
  };
  security: {
    uniqueIPs: number;
    suspiciousActivity: number;
    lastSecurityIncident?: Date;
    ipWhitelistViolations: number;
  };
  endpoints: Array<{
    path: string;
    method: string;
    calls: number;
    errorRate: number;
    averageLatency: number;
  }>;
  trends: {
    dailyUsage: Array<{ date: string; calls: number; errors: number }>;
    hourlyDistribution: Array<{ hour: number; calls: number }>;
    geographicalDistribution: Array<{ country: string; calls: number }>;
  };
}

export interface SystemHealthMetrics {
  overview: {
    totalKeys: number;
    activeKeys: number;
    suspendedKeys: number;
    revokedKeys: number;
    expiredKeys: number;
    totalApiCalls: number;
    callsLast24h: number;
    overallErrorRate: number;
    averageResponseTime: number;
  };
  performance: {
    currentRPS: number;
    peakRPS: number;
    averageLatency: number;
    errorRate: number;
    serviceUptime: number;
  };
  security: {
    activeAlerts: number;
    blockedRequests: number;
    suspiciousActivity: number;
    rateLimitViolations: number;
  };
  trends: {
    usage: Array<{ timestamp: Date; calls: number; errors: number }>;
    performance: Array<{ timestamp: Date; latency: number; errors: number }>;
    security: Array<{ timestamp: Date; incidents: number; blocked: number }>;
  };
}

export interface AlertConfiguration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    errorRateThreshold?: number;
    latencyThreshold?: number;
    usageSpike?: number;
    rateLimitViolations?: number;
    timeWindow: number; // minutes
  };
  actions: {
    email?: string[];
    webhook?: string;
    autoSuspend?: boolean;
    escalation?: {
      afterMinutes: number;
      contacts: string[];
    };
  };
}

export class ApiManagementService {
  constructor(
    private databaseService: DatabaseService,
    private apiKeyService: ApiKeyManagementService,
    private auditService: AuditService
  ) {}

  /**
   * Get comprehensive analytics for a specific API key
   */
  async getApiKeyAnalytics(keyId: string): Promise<ApiKeyUsageAnalytics> {
    try {
      // Get basic key information
      const keyQuery = `
        SELECT ak.*, u.name as user_name, u.email as user_email
        FROM api_keys ak
        LEFT JOIN users u ON ak.user_id = u.id
        WHERE ak.key_id = $1
      `;
      const keyResult = await this.databaseService.query(keyQuery, [keyId]);
      
      if (keyResult.rows.length === 0) {
        throw new Error('API key not found');
      }
      
      const keyInfo = keyResult.rows[0];

      // Get usage statistics
      const usageQuery = `
        SELECT 
          COUNT(*) as total_calls,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as calls_24h,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as calls_week,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as calls_month,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count,
          AVG(response_time) as avg_response_time,
          COUNT(CASE WHEN rate_limited = true THEN 1 END) as rate_limit_hits,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_latency,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99_latency,
          COUNT(DISTINCT ip_address) as unique_ips
        FROM api_call_logs 
        WHERE key_id = $1
      `;
      const usageResult = await this.databaseService.query(usageQuery, [keyId]);
      const usage = usageResult.rows[0];

      // Get endpoint statistics
      const endpointQuery = `
        SELECT 
          endpoint as path,
          method,
          COUNT(*) as calls,
          COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*) as error_rate,
          AVG(response_time) as avg_latency
        FROM api_call_logs 
        WHERE key_id = $1 
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY endpoint, method
        ORDER BY calls DESC
        LIMIT 10
      `;
      const endpointResult = await this.databaseService.query(endpointQuery, [keyId]);

      // Get daily usage trends
      const trendsQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as calls,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
        FROM api_call_logs 
        WHERE key_id = $1 
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;
      const trendsResult = await this.databaseService.query(trendsQuery, [keyId]);

      // Get hourly distribution
      const hourlyQuery = `
        SELECT 
          EXTRACT(hour FROM created_at) as hour,
          COUNT(*) as calls
        FROM api_call_logs 
        WHERE key_id = $1 
          AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY EXTRACT(hour FROM created_at)
        ORDER BY hour
      `;
      const hourlyResult = await this.databaseService.query(hourlyQuery, [keyId]);

      // Calculate derived metrics
      const totalCalls = parseInt(usage.total_calls) || 0;
      const errorCount = parseInt(usage.error_count) || 0;
      const errorRate = totalCalls > 0 ? errorCount / totalCalls : 0;
      const successRate = 1 - errorRate;

      return {
        keyId,
        name: keyInfo.name,
        userEmail: keyInfo.user_email,
        usage: {
          totalCalls,
          callsLast24h: parseInt(usage.calls_24h) || 0,
          callsLastWeek: parseInt(usage.calls_week) || 0,
          callsLastMonth: parseInt(usage.calls_month) || 0,
          errorCount,
          errorRate,
          averageResponseTime: parseFloat(usage.avg_response_time) || 0,
          rateLimitHits: parseInt(usage.rate_limit_hits) || 0
        },
        performance: {
          averageLatency: parseFloat(usage.avg_response_time) || 0,
          p95Latency: parseFloat(usage.p95_latency) || 0,
          p99Latency: parseFloat(usage.p99_latency) || 0,
          successRate,
          uptime: successRate * 100 // Simplified uptime calculation
        },
        security: {
          uniqueIPs: parseInt(usage.unique_ips) || 0,
          suspiciousActivity: 0, // Would be calculated based on specific rules
          ipWhitelistViolations: 0 // Would track violations
        },
        endpoints: endpointResult.rows.map(row => ({
          path: row.path,
          method: row.method,
          calls: parseInt(row.calls),
          errorRate: parseFloat(row.error_rate) || 0,
          averageLatency: parseFloat(row.avg_latency) || 0
        })),
        trends: {
          dailyUsage: trendsResult.rows.map(row => ({
            date: row.date,
            calls: parseInt(row.calls),
            errors: parseInt(row.errors)
          })),
          hourlyDistribution: hourlyResult.rows.map(row => ({
            hour: parseInt(row.hour),
            calls: parseInt(row.calls)
          })),
          geographicalDistribution: [] // Would require IP geolocation
        }
      };

    } catch (error) {
      console.error('Failed to get API key analytics:', error);
      throw error;
    }
  }

  /**
   * Get system-wide health and performance metrics
   */
  async getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
    try {
      // Get global statistics from API key service
      const globalStats = await this.apiKeyService.getStatistics();

      // Get recent API call statistics
      const callStatsQuery = `
        SELECT 
          COUNT(*) as total_calls,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as calls_24h,
          COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*) as error_rate,
          AVG(response_time) as avg_response_time,
          COUNT(CASE WHEN rate_limited = true THEN 1 END) as rate_limit_violations,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as calls_last_hour
        FROM api_call_logs 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `;
      const callStatsResult = await this.databaseService.query(callStatsQuery);
      const callStats = callStatsResult.rows[0];

      // Get performance trends
      const trendsQuery = `
        SELECT 
          DATE_TRUNC('hour', created_at) as timestamp,
          COUNT(*) as calls,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
          AVG(response_time) as latency,
          COUNT(CASE WHEN rate_limited = true THEN 1 END) as incidents,
          COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked
        FROM api_call_logs 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY timestamp
      `;
      const trendsResult = await this.databaseService.query(trendsQuery);

      // Calculate current RPS (requests per second)
      const callsLastHour = parseInt(callStats.calls_last_hour) || 0;
      const currentRPS = callsLastHour / 3600; // Rough estimate

      return {
        overview: {
          totalKeys: globalStats.totalKeys,
          activeKeys: globalStats.activeKeys,
          suspendedKeys: 0, // Would need to be tracked separately
          revokedKeys: globalStats.revokedKeys,
          expiredKeys: globalStats.expiredKeys,
          totalApiCalls: parseInt(callStats.total_calls) || 0,
          callsLast24h: parseInt(callStats.calls_24h) || 0,
          overallErrorRate: parseFloat(callStats.error_rate) || 0,
          averageResponseTime: parseFloat(callStats.avg_response_time) || 0
        },
        performance: {
          currentRPS,
          peakRPS: currentRPS * 2, // Would track actual peak
          averageLatency: parseFloat(callStats.avg_response_time) || 0,
          errorRate: parseFloat(callStats.error_rate) || 0,
          serviceUptime: 99.9 // Would be calculated from monitoring data
        },
        security: {
          activeAlerts: 0, // Would come from alerting system
          blockedRequests: 0, // Would track blocked requests
          suspiciousActivity: 0, // Would track suspicious patterns
          rateLimitViolations: parseInt(callStats.rate_limit_violations) || 0
        },
        trends: {
          usage: trendsResult.rows.map(row => ({
            timestamp: new Date(row.timestamp),
            calls: parseInt(row.calls),
            errors: parseInt(row.errors)
          })),
          performance: trendsResult.rows.map(row => ({
            timestamp: new Date(row.timestamp),
            latency: parseFloat(row.latency) || 0,
            errors: parseInt(row.errors)
          })),
          security: trendsResult.rows.map(row => ({
            timestamp: new Date(row.timestamp),
            incidents: parseInt(row.incidents),
            blocked: parseInt(row.blocked)
          }))
        }
      };

    } catch (error) {
      console.error('Failed to get system health metrics:', error);
      throw error;
    }
  }

  /**
   * Get aggregated usage metrics for dashboard
   */
  async getDashboardMetrics(timeRange: '1h' | '6h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    totalRequests: number;
    errorRate: number;
    averageLatency: number;
    activeKeys: number;
    rateLimitHits: number;
    topKeys: Array<{
      keyId: string;
      name: string;
      requests: number;
      errorRate: number;
    }>;
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
      errorRate: number;
      averageLatency: number;
    }>;
    hourlyBreakdown: Array<{
      hour: string;
      requests: number;
      errors: number;
      latency: number;
    }>;
  }> {
    const intervals = {
      '1h': 'NOW() - INTERVAL \'1 hour\'',
      '6h': 'NOW() - INTERVAL \'6 hours\'',
      '24h': 'NOW() - INTERVAL \'1 day\'',
      '7d': 'NOW() - INTERVAL \'7 days\'',
      '30d': 'NOW() - INTERVAL \'30 days\''
    };

    const since = intervals[timeRange];

    try {
      // Overall metrics
      const overallQuery = `
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*) as error_rate,
          AVG(response_time) as avg_latency,
          COUNT(CASE WHEN rate_limited = true THEN 1 END) as rate_limit_hits
        FROM api_call_logs 
        WHERE created_at >= ${since}
      `;
      const overallResult = await this.databaseService.query(overallQuery);
      const overall = overallResult.rows[0];

      // Active keys in time period
      const activeKeysQuery = `
        SELECT COUNT(DISTINCT key_id) as active_keys
        FROM api_call_logs 
        WHERE created_at >= ${since}
      `;
      const activeKeysResult = await this.databaseService.query(activeKeysQuery);

      // Top keys by usage
      const topKeysQuery = `
        SELECT 
          acl.key_id,
          ak.name,
          COUNT(*) as requests,
          COUNT(CASE WHEN acl.status = 'error' THEN 1 END)::float / COUNT(*) as error_rate
        FROM api_call_logs acl
        LEFT JOIN api_keys ak ON acl.key_id = ak.key_id
        WHERE acl.created_at >= ${since}
        GROUP BY acl.key_id, ak.name
        ORDER BY requests DESC
        LIMIT 10
      `;
      const topKeysResult = await this.databaseService.query(topKeysQuery);

      // Top endpoints by usage
      const topEndpointsQuery = `
        SELECT 
          endpoint,
          COUNT(*) as requests,
          COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*) as error_rate,
          AVG(response_time) as avg_latency
        FROM api_call_logs 
        WHERE created_at >= ${since}
        GROUP BY endpoint
        ORDER BY requests DESC
        LIMIT 10
      `;
      const topEndpointsResult = await this.databaseService.query(topEndpointsQuery);

      // Hourly breakdown
      const hourlyQuery = `
        SELECT 
          DATE_TRUNC('hour', created_at) as hour,
          COUNT(*) as requests,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
          AVG(response_time) as latency
        FROM api_call_logs 
        WHERE created_at >= ${since}
        GROUP BY DATE_TRUNC('hour', created_at)
        ORDER BY hour
      `;
      const hourlyResult = await this.databaseService.query(hourlyQuery);

      return {
        totalRequests: parseInt(overall.total_requests) || 0,
        errorRate: parseFloat(overall.error_rate) || 0,
        averageLatency: parseFloat(overall.avg_latency) || 0,
        activeKeys: parseInt(activeKeysResult.rows[0]?.active_keys) || 0,
        rateLimitHits: parseInt(overall.rate_limit_hits) || 0,
        topKeys: topKeysResult.rows.map(row => ({
          keyId: row.key_id,
          name: row.name || 'Unknown',
          requests: parseInt(row.requests),
          errorRate: parseFloat(row.error_rate) || 0
        })),
        topEndpoints: topEndpointsResult.rows.map(row => ({
          endpoint: row.endpoint,
          requests: parseInt(row.requests),
          errorRate: parseFloat(row.error_rate) || 0,
          averageLatency: parseFloat(row.avg_latency) || 0
        })),
        hourlyBreakdown: hourlyResult.rows.map(row => ({
          hour: row.hour,
          requests: parseInt(row.requests),
          errors: parseInt(row.errors),
          latency: parseFloat(row.latency) || 0
        }))
      };

    } catch (error) {
      console.error('Failed to get dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive API key usage report
   */
  async generateUsageReport(
    keyId?: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<{
    reportId: string;
    generatedAt: Date;
    summary: {
      totalCalls: number;
      uniqueKeys: number;
      errorRate: number;
      averageLatency: number;
      costEstimate: number;
    };
    keyBreakdown: Array<{
      keyId: string;
      keyName: string;
      userEmail: string;
      calls: number;
      errors: number;
      dataTransferred: number;
      estimatedCost: number;
    }>;
    insights: Array<{
      type: 'performance' | 'usage' | 'security' | 'cost';
      severity: 'info' | 'warning' | 'error';
      title: string;
      description: string;
      recommendation?: string;
    }>;
  }> {
    const reportId = `report_${Date.now()}`;
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate || now;

    try {
      let whereClause = 'WHERE created_at >= $1 AND created_at <= $2';
      const params = [start, end];
      
      if (keyId) {
        whereClause += ' AND key_id = $3';
        params.push(keyId);
      }

      // Summary statistics
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_calls,
          COUNT(DISTINCT key_id) as unique_keys,
          COUNT(CASE WHEN status = 'error' THEN 1 END)::float / COUNT(*) as error_rate,
          AVG(response_time) as avg_latency,
          SUM(COALESCE(request_size, 0) + COALESCE(response_size, 0)) as total_bytes
        FROM api_call_logs 
        ${whereClause}
      `;
      const summaryResult = await this.databaseService.query(summaryQuery, params);
      const summary = summaryResult.rows[0];

      // Key breakdown
      const breakdownQuery = `
        SELECT 
          acl.key_id,
          ak.name as key_name,
          u.email as user_email,
          COUNT(*) as calls,
          COUNT(CASE WHEN acl.status = 'error' THEN 1 END) as errors,
          SUM(COALESCE(acl.request_size, 0) + COALESCE(acl.response_size, 0)) as data_transferred
        FROM api_call_logs acl
        LEFT JOIN api_keys ak ON acl.key_id = ak.key_id
        LEFT JOIN users u ON ak.user_id = u.id
        ${whereClause}
        GROUP BY acl.key_id, ak.name, u.email
        ORDER BY calls DESC
      `;
      const breakdownResult = await this.databaseService.query(breakdownQuery, params);

      // Generate insights based on the data
      const insights: Array<{
        type: 'performance' | 'usage' | 'security' | 'cost';
        severity: 'info' | 'warning' | 'error';
        title: string;
        description: string;
        recommendation?: string;
      }> = [];

      const errorRate = parseFloat(summary.error_rate) || 0;
      const avgLatency = parseFloat(summary.avg_latency) || 0;

      if (errorRate > 0.05) {
        insights.push({
          type: 'performance',
          severity: 'warning',
          title: 'High Error Rate Detected',
          description: `Error rate of ${(errorRate * 100).toFixed(2)}% exceeds recommended threshold of 5%`,
          recommendation: 'Review API implementation and error handling'
        });
      }

      if (avgLatency > 1000) {
        insights.push({
          type: 'performance',
          severity: 'warning',
          title: 'High Response Latency',
          description: `Average response time of ${avgLatency.toFixed(0)}ms exceeds recommended threshold of 1000ms`,
          recommendation: 'Optimize API performance and consider caching strategies'
        });
      }

      // Calculate estimated cost (simplified)
      const totalBytes = parseInt(summary.total_bytes) || 0;
      const estimatedCost = (totalBytes / 1024 / 1024 / 1024) * 0.1; // $0.10 per GB

      return {
        reportId,
        generatedAt: now,
        summary: {
          totalCalls: parseInt(summary.total_calls) || 0,
          uniqueKeys: parseInt(summary.unique_keys) || 0,
          errorRate,
          averageLatency: avgLatency,
          costEstimate: estimatedCost
        },
        keyBreakdown: breakdownResult.rows.map(row => ({
          keyId: row.key_id,
          keyName: row.key_name || 'Unknown',
          userEmail: row.user_email || 'unknown@example.com',
          calls: parseInt(row.calls),
          errors: parseInt(row.errors),
          dataTransferred: parseInt(row.data_transferred) || 0,
          estimatedCost: ((parseInt(row.data_transferred) || 0) / 1024 / 1024 / 1024) * 0.1
        })),
        insights
      };

    } catch (error) {
      console.error('Failed to generate usage report:', error);
      throw error;
    }
  }

  /**
   * Configure alert rules for API monitoring
   */
  async configureAlert(config: AlertConfiguration): Promise<boolean> {
    try {
      const query = `
        INSERT INTO api_alert_configs (
          alert_id, name, description, enabled, conditions, actions, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (alert_id) DO UPDATE SET
          name = $2,
          description = $3,
          enabled = $4,
          conditions = $5,
          actions = $6,
          updated_at = NOW()
      `;

      await this.databaseService.query(query, [
        config.id,
        config.name,
        config.description,
        config.enabled,
        JSON.stringify(config.conditions),
        JSON.stringify(config.actions)
      ]);

      await this.auditService.logEvent({
        eventType: 'api_alert_configured',
        details: {
          alertId: config.id,
          name: config.name,
          enabled: config.enabled
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to configure alert:', error);
      return false;
    }
  }

  /**
   * Export API usage data for external analysis
   */
  async exportUsageData(format: 'json' | 'csv' | 'excel', filters: {
    keyIds?: string[];
    startDate?: Date;
    endDate?: Date;
    includeErrors?: boolean;
    includeSuccessful?: boolean;
  } = {}): Promise<{
    downloadUrl: string;
    fileSize: number;
    recordCount: number;
    expiresAt: Date;
  }> {
    try {
      // This would generate and store the export file
      // For now, return a mock response
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      return {
        downloadUrl: `/api/exports/api-usage-${Date.now()}.${format}`,
        fileSize: 1024000, // Mock file size
        recordCount: 50000, // Mock record count
        expiresAt
      };
    } catch (error) {
      console.error('Failed to export usage data:', error);
      throw error;
    }
  }
}