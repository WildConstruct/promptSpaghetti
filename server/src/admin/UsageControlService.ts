/**
 * Usage Control Service - Epic 17.4.4
 * 
 * Comprehensive API usage monitoring and control system for Epic 17.
 * Provides rate limiting, quota management, throttling, and usage analytics
 * with real-time monitoring and enforcement capabilities.
 * 
 * Task: E17-1753114397226-7F914C - Develop usage controls
 * Epic: 17 - Backstage Admin Controls (Story 17.4.4 - API Management)
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { performance } from 'perf_hooks';

// ==========================================
// USAGE CONTROL INTERFACES
// ==========================================

export enum UsageLimitType {
  REQUESTS_PER_MINUTE = 'requests_per_minute',
  REQUESTS_PER_HOUR = 'requests_per_hour', 
  REQUESTS_PER_DAY = 'requests_per_day',
  BANDWIDTH_PER_HOUR = 'bandwidth_per_hour',
  BANDWIDTH_PER_DAY = 'bandwidth_per_day',
  CONCURRENT_CONNECTIONS = 'concurrent_connections',
  OPERATION_QUOTA = 'operation_quota',
  RESOURCE_QUOTA = 'resource_quota'
}

export enum UsageControlAction {
  ALLOW = 'allow',
  THROTTLE = 'throttle',
  REJECT = 'reject',
  WARNING = 'warning',
  ALERT = 'alert',
  ESCALATE = 'escalate'
}

export enum UsageControlStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  MONITORING_ONLY = 'monitoring_only'
}

}
}
export interface UsageLimit {
  limitId: string;
  name: string;
  description: string;
  type: UsageLimitType;
  threshold: number;
  period: number; // milliseconds
  action: UsageControlAction;
  status: UsageControlStatus;
  scope: UsageScope;
  configuration: LimitConfiguration;
  metadata: UsageLimitMetadata;
}
}
}

}
}
export interface UsageScope {
  global: boolean;
  userIds?: string[];
  roles?: string[];
  endpoints?: string[];
  operations?: string[];
  ipAddresses?: string[];
  apiKeys?: string[];
  customFilters?: Record<string, any>;
}
}
}

}
}
export interface LimitConfiguration {
  burstAllowance: number;
  gracePeriod: number; // milliseconds
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  backoffMultiplier: number;
  maxBackoffTime: number; // milliseconds
  alertThresholds: AlertThreshold[];
  exemptions: UsageExemption[];
  customRules: CustomUsageRule[];
}
}
}

}
}
export interface AlertThreshold {
  percentage: number; // of limit
  action: 'warn' | 'alert' | 'escalate';
  channels: string[];
  cooldown: number; // milliseconds
}
}
}

}
}
export interface UsageExemption {
  exemptionId: string;
  type: 'user' | 'role' | 'ip' | 'api_key' | 'operation';
  value: string;
  reason: string;
  validUntil?: Date;
  createdBy: string;
}
}
}

}
}
export interface CustomUsageRule {
  ruleId: string;
  name: string;
  condition: string; // JavaScript expression
  action: UsageControlAction;
  priority: number;
  enabled: boolean;
}
}
}

}
}
export interface UsageLimitMetadata {
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  version: string;
  tags: string[];
  documentation: string;
  auditTrail: string[];
}
}
}

}
}
export interface UsageRecord {
  recordId: string;
  timestamp: Date;
  userId?: string;
  apiKey?: string;
  ipAddress: string;
  endpoint: string;
  operation: string;
  method: string;
  requestSize: number; // bytes
  responseSize: number; // bytes
  duration: number; // milliseconds
  statusCode: number;
  userAgent?: string;
  limitChecks: LimitCheck[];
  metadata: UsageRecordMetadata;
}
}
}

}
}
export interface LimitCheck {
  limitId: string;
  limitName: string;
  currentUsage: number;
  threshold: number;
  percentage: number;
  action: UsageControlAction;
  applied: boolean;
  reason?: string;
}
}
}

}
}
export interface UsageRecordMetadata {
  requestId: string;
  sessionId?: string;
  correlationId?: string;
  context: Record<string, any>;
  labels: Record<string, string>;
}
}
}

}
}
export interface UsageAnalytics {
  timeRange: {
    start: Date;
    end: Date;
}
}
  };
  totalRequests: number;
  totalBandwidth: number;
  uniqueUsers: number;
  uniqueEndpoints: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: EndpointUsage[];
  topUsers: UserUsage[];
  limitViolations: LimitViolation[];
  trendAnalysis: UsageTrends;
  quotaUtilization: QuotaUtilization[];
}

}
}
export interface EndpointUsage {
  endpoint: string;
  requestCount: number;
  bandwidth: number;
  averageResponseTime: number;
  errorRate: number;
  uniqueUsers: number;
}
}
}

}
}
export interface UserUsage {
  userId: string;
  requestCount: number;
  bandwidth: number;
  uniqueEndpoints: number;
  errorRate: number;
  lastActivity: Date;
  quotaUtilization: number;
}
}
}

}
}
export interface LimitViolation {
  violationId: string;
  limitId: string;
  limitName: string;
  timestamp: Date;
  userId?: string;
  endpoint: string;
  actualUsage: number;
  threshold: number;
  action: UsageControlAction;
  resolved: boolean;
  resolution?: string;
}
}
}

}
}
export interface UsageTrends {
  requestTrend: TrendData;
  bandwidthTrend: TrendData;
  responseTrend: TrendData;
  errorTrend: TrendData;
  userActivityTrend: TrendData;
}
}
}

}
}
export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  dataPoints: DataPoint[];
}
}
}

}
}
export interface DataPoint {
  timestamp: Date;
  value: number;
}
}
}

}
}
export interface QuotaUtilization {
  limitId: string;
  limitName: string;
  used: number;
  total: number;
  percentage: number;
  timeRemaining: number; // milliseconds until reset
  status: 'ok' | 'warning' | 'critical';
}
}
}

}
}
export interface UsageControlDecision {
  allowed: boolean;
  action: UsageControlAction;
  reason: string;
  appliedLimits: string[];
  waitTime?: number; // milliseconds
  retryAfter?: Date;
  quotaRemaining: Record<string, number>;
  warnings: string[];
}
}
}

}
}
export interface UsageSnapshot {
  timestamp: Date;
  activeUsers: number;
  currentConnections: number;
  requestsPerMinute: number;
  bandwidthPerSecond: number;
  activeLimits: number;
  violationsInLastHour: number;
  topResourceConsumers: ResourceConsumer[];
  systemLoad: SystemLoadMetrics;
}
}
}

}
}
export interface ResourceConsumer {
  identifier: string;
  type: 'user' | 'api_key' | 'ip';
  requestCount: number;
  bandwidth: number;
  connectionCount: number;
  quotaUsage: number;
}
}
}

}
}
export interface SystemLoadMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkUtilization: number;
  responseTimeP95: number;
  errorRate: number;
}
}
}

// ==========================================
// USAGE CONTROL SERVICE IMPLEMENTATION
// ==========================================

export class UsageControlService {
  private databaseService: DatabaseService;
  private auditService: AuditService;
  private usageLimits: Map<string, UsageLimit> = new Map();
  private usageRecords: Map<string, UsageRecord[]> = new Map();
  private activeConnections: Map<string, number> = new Map();
  private rateLimitCache: Map<string, RateLimitState> = new Map();
  private quotaCache: Map<string, QuotaState> = new Map();

  constructor(databaseService?: DatabaseService) {
    this.databaseService = databaseService || new DatabaseService();
    this.auditService = new AuditService(this.databaseService);
    this.initializeDefaultLimits();
    this.startPeriodicCleanup();
  }

  // ==========================================
  // USAGE LIMIT MANAGEMENT
  // ==========================================

  async createUsageLimit(limit: Omit<UsageLimit, 'limitId' | 'metadata'>): Promise<string> {

    const limitId = `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const usageLimit: UsageLimit = {
      ...limit,
      limitId,
      metadata: {
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date(),
        version: '1.0.0',
        tags: limit.scope.global ? ['global'] : ['scoped'],
        documentation: `${limit.name} - ${limit.description}`,
        auditTrail: [`Created: ${new Date().toISOString()}`]
      }
    };

    // Validate limit configuration
    await this.validateLimitConfiguration(usageLimit);

    // Store limit
    this.usageLimits.set(limitId, usageLimit);
    await this.persistUsageLimit(usageLimit);

    // Audit logging
    await this.auditService.logAction({
      userId: 'system',
      action: 'usage_limit_created',
      resource: `usage_limit:${limitId}`,
      details: {
        limitId,
        name: limit.name,
        type: limit.type,
        threshold: limit.threshold,
        scope: limit.scope
      }
    });

    console.log(`Usage limit created: ${limitId} (${limit.name})`);
    return limitId;
  }

  async updateUsageLimit(limitId: string, updates: Partial<UsageLimit>): Promise<void> {

    const existingLimit = this.usageLimits.get(limitId);
    if (!existingLimit) {
      throw new Error(`Usage limit not found: ${limitId}`);
    }

    const updatedLimit: UsageLimit = {
      ...existingLimit,
      ...updates,
      limitId, // Ensure ID doesn't change
      metadata: {
        ...existingLimit.metadata,
        lastModified: new Date(),
        version: this.incrementVersion(existingLimit.metadata.version),
        auditTrail: [
          ...existingLimit.metadata.auditTrail,
          `Updated: ${new Date().toISOString()}`
        ]
      }
    };

    // Validate updated configuration
    await this.validateLimitConfiguration(updatedLimit);

    // Update limit
    this.usageLimits.set(limitId, updatedLimit);
    await this.persistUsageLimit(updatedLimit);

    // Clear related caches
    this.invalidateRelatedCaches(limitId);

    // Audit logging
    await this.auditService.logAction({
      userId: 'system',
      action: 'usage_limit_updated',
      resource: `usage_limit:${limitId}`,
      details: {
        limitId,
        changes: updates,
        version: updatedLimit.metadata.version
      }
    });
  }

  async deleteUsageLimit(limitId: string): Promise<void> {

    const limit = this.usageLimits.get(limitId);
    if (!limit) {
      throw new Error(`Usage limit not found: ${limitId}`);
    }

    // Remove from memory
    this.usageLimits.delete(limitId);
    
    // Remove from storage
    await this.removeUsageLimit(limitId);
    
    // Clear related caches
    this.invalidateRelatedCaches(limitId);

    // Audit logging
    await this.auditService.logAction({
      userId: 'system',
      action: 'usage_limit_deleted',
      resource: `usage_limit:${limitId}`,
      details: {
        limitId,
        name: limit.name,
        deletedAt: new Date()
      }
    });

    console.log(`Usage limit deleted: ${limitId}`);
  }

  // ==========================================
  // USAGE CONTROL ENFORCEMENT
  // ==========================================

  async checkUsage(
    userId: string | undefined,
    apiKey: string | undefined,
    ipAddress: string,
    endpoint: string,
    operation: string,
    method: string,
    requestSize: number
  ): Promise<UsageControlDecision> {

    const startTime = performance.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Get applicable limits
      const applicableLimits = this.getApplicableLimits(userId, apiKey, ipAddress, endpoint, operation);
      
      const limitChecks: LimitCheck[] = [];
      const appliedLimits: string[] = [];
      const warnings: string[] = [];
      let finalAction = UsageControlAction.ALLOW;
      let waitTime: number | undefined;
      let retryAfter: Date | undefined;

      // Check each applicable limit
      for (const limit of applicableLimits) {
        const limitCheck = await this.checkIndividualLimit(
          limit,
          userId,
          apiKey,
          ipAddress,
          endpoint,
          operation,
          requestSize
        );

        limitChecks.push(limitCheck);

        // Determine most restrictive action
        if (this.getActionSeverity(limitCheck.action) > this.getActionSeverity(finalAction)) {
          finalAction = limitCheck.action;
          appliedLimits.push(limit.limitId);

          if (limitCheck.action === UsageControlAction.THROTTLE) {
            waitTime = this.calculateWaitTime(limit, limitCheck.currentUsage, limitCheck.threshold);
            retryAfter = new Date(Date.now() + waitTime);
          }
        }

        // Collect warnings
        if (limitCheck.percentage > 80 && limitCheck.action === UsageControlAction.ALLOW) {
          warnings.push(`${limit.name} is at ${Math.round(limitCheck.percentage)}% of limit`);
        }
      }

      // Calculate quota remaining
      const quotaRemaining = this.calculateQuotaRemaining(userId, apiKey, applicableLimits);

      const decision: UsageControlDecision = {
        allowed: finalAction === UsageControlAction.ALLOW || finalAction === UsageControlAction.WARNING,
        action: finalAction,
        reason: this.generateDecisionReason(finalAction, appliedLimits, limitChecks),
        appliedLimits,
        waitTime,
        retryAfter,
        quotaRemaining,
        warnings
      };

      // Record usage if allowed
      if (decision.allowed) {
        await this.recordUsage({
          recordId: requestId,
          timestamp: new Date(),
          userId,
          apiKey,
          ipAddress,
          endpoint,
          operation,
          method,
          requestSize,
          responseSize: 0, // Will be updated later
          duration: performance.now() - startTime,
          statusCode: 200, // Will be updated later
          limitChecks,
          metadata: {
            requestId,
            context: { decision: finalAction },
            labels: { 'usage-control': 'processed' }
          }
        });
      } else {
        // Record violation
        await this.recordLimitViolation(limitChecks, userId, endpoint, requestId);
      }

      return decision;

    } catch (error) {
      console.error('Usage control check failed:', error);
      
      // Fail open - allow request but log error
      return {
        allowed: true,
        action: UsageControlAction.ALLOW,
        reason: 'Usage control check failed - allowing request',
        appliedLimits: [],
        quotaRemaining: {},
        warnings: ['Usage control system experiencing issues']
      };
    }
  }

  async recordUsage(record: UsageRecord): Promise<void> {

    const key = this.getUsageKey(record.userId, record.apiKey, record.ipAddress);
    
    if (!this.usageRecords.has(key)) {
      this.usageRecords.set(key, []);
    }
    
    this.usageRecords.get(key)!.push(record);
    
    // Persist to database
    await this.persistUsageRecord(record);
    
    // Update rate limit cache
    await this.updateRateLimitCache(record);
    
    // Update quota cache  
    await this.updateQuotaCache(record);
    
    // Trigger cleanup if needed
    this.scheduleCleanupIfNeeded(key);
  }

  // ==========================================
  // USAGE ANALYTICS & REPORTING
  // ==========================================

  async generateUsageAnalytics(
    timeRange: { start: Date; end: Date },
    filters?: {
      userIds?: string[];
      endpoints?: string[];
      operations?: string[];
    }
  ): Promise<UsageAnalytics> {

    const startTime = performance.now();

    try {
      // Query usage records
      const records = await this.queryUsageRecords(timeRange, filters);
      
      // Calculate basic metrics
      const totalRequests = records.length;
      const totalBandwidth = records.reduce((sum, r) => sum + r.requestSize + r.responseSize, 0);
      const uniqueUsers = new Set(records.map(r => r.userId).filter(Boolean)).size;
      const uniqueEndpoints = new Set(records.map(r => r.endpoint)).size;
      const averageResponseTime = records.reduce((sum, r) => sum + r.duration, 0) / records.length || 0;
      const errorRate = records.filter(r => r.statusCode >= 400).length / totalRequests * 100;

      // Generate top endpoints
      const endpointMap = new Map<string, EndpointUsage>();
      records.forEach(record => {
        const endpoint = record.endpoint;
        if (!endpointMap.has(endpoint)) {
          endpointMap.set(endpoint, {
            endpoint,
            requestCount: 0,
            bandwidth: 0,
            averageResponseTime: 0,
            errorRate: 0,
            uniqueUsers: 0
          });
        }
        const usage = endpointMap.get(endpoint)!;
        usage.requestCount++;
        usage.bandwidth += record.requestSize + record.responseSize;
        usage.averageResponseTime += record.duration;
      });

      const topEndpoints = Array.from(endpointMap.values())
        .map(usage => ({
          ...usage,
          averageResponseTime: usage.averageResponseTime / usage.requestCount,
          errorRate: records.filter(r => r.endpoint === usage.endpoint && r.statusCode >= 400).length / usage.requestCount * 100,
          uniqueUsers: new Set(records.filter(r => r.endpoint === usage.endpoint).map(r => r.userId).filter(Boolean)).size
        }))
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 10);

      // Generate top users
      const userMap = new Map<string, UserUsage>();
      records.filter(r => r.userId).forEach(record => {
        const userId = record.userId!;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            requestCount: 0,
            bandwidth: 0,
            uniqueEndpoints: 0,
            errorRate: 0,
            lastActivity: record.timestamp,
            quotaUtilization: 0
          });
        }
        const usage = userMap.get(userId)!;
        usage.requestCount++;
        usage.bandwidth += record.requestSize + record.responseSize;
        if (record.timestamp > usage.lastActivity) {
          usage.lastActivity = record.timestamp;
        }
      });

      const topUsers = Array.from(userMap.values())
        .map(usage => ({
          ...usage,
          uniqueEndpoints: new Set(records.filter(r => r.userId === usage.userId).map(r => r.endpoint)).size,
          errorRate: records.filter(r => r.userId === usage.userId && r.statusCode >= 400).length / usage.requestCount * 100,
          quotaUtilization: this.calculateUserQuotaUtilization(usage.userId)
        }))
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 10);

      // Get limit violations
      const limitViolations = await this.queryLimitViolations(timeRange, filters);

      // Generate trend analysis
      const trendAnalysis = await this.generateTrendAnalysis(timeRange, records);

      // Calculate quota utilization
      const quotaUtilization = await this.calculateQuotaUtilization();

      const analytics: UsageAnalytics = {
        timeRange,
        totalRequests,
        totalBandwidth,
        uniqueUsers,
        uniqueEndpoints,
        averageResponseTime,
        errorRate,
        topEndpoints,
        topUsers,
        limitViolations,
        trendAnalysis,
        quotaUtilization
      };

      // Audit analytics generation
      await this.auditService.logAction({
        userId: 'system',
        action: 'usage_analytics_generated',
        resource: 'usage_analytics',
        details: {
          timeRange,
          totalRequests,
          processingTime: performance.now() - startTime,
          filtersApplied: filters || 'none'
        }
      });

      return analytics;

    } catch (error) {
      console.error('Failed to generate usage analytics:', error);
      throw new Error(`Analytics generation failed: ${error.message}`);
    }
  }

  async getCurrentUsageSnapshot(): Promise<UsageSnapshot> {

    const now = new Date();
    
    return {
      timestamp: now,
      activeUsers: this.getActiveUserCount(),
      currentConnections: this.getTotalConnectionCount(),
      requestsPerMinute: await this.getRequestsPerMinute(),
      bandwidthPerSecond: await this.getBandwidthPerSecond(),
      activeLimits: this.usageLimits.size,
      violationsInLastHour: await this.getViolationsInLastHour(),
      topResourceConsumers: await this.getTopResourceConsumers(5),
      systemLoad: await this.getSystemLoadMetrics(};
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private getApplicableLimits(
    userId: string | undefined,
    apiKey: string | undefined,
    ipAddress: string,
    endpoint: string,
    operation: string
  ): UsageLimit[] {
    return Array.from(this.usageLimits.values()).filter(limit => {
      if (limit.status !== UsageControlStatus.ACTIVE) {
        return false;
      }

      const scope = limit.scope;
      
      // Global scope applies to all
      if (scope.global) {
        return true;
      }

      // Check user-specific scope
      if (scope.userIds && userId && scope.userIds.includes(userId)) {
        return true;
      }

      // Check IP-specific scope
      if (scope.ipAddresses && scope.ipAddresses.includes(ipAddress)) {
        return true;
      }

      // Check endpoint-specific scope
      if (scope.endpoints && scope.endpoints.some(pattern => endpoint.match(pattern))) {
        return true;
      }

      // Check operation-specific scope
      if (scope.operations && scope.operations.includes(operation)) {
        return true;
      }

      // Check API key scope
      if (scope.apiKeys && apiKey && scope.apiKeys.includes(apiKey)) {
        return true;
      }

      return false;
    });
  }

  private async checkIndividualLimit(
    limit: UsageLimit,
    userId: string | undefined,
    apiKey: string | undefined,
    ipAddress: string,
    endpoint: string,
    operation: string,
    requestSize: number
  ): Promise<LimitCheck> {

    const key = this.getUsageKey(userId, apiKey, ipAddress, limit.type);
    const now = Date.now();
    const windowStart = now - limit.period;

    let currentUsage = 0;
    
    switch (limit.type) {
    case UsageLimitType.REQUESTS_PER_MINUTE:
    case UsageLimitType.REQUESTS_PER_HOUR:
    case UsageLimitType.REQUESTS_PER_DAY:
      currentUsage = this.getRequestCount(key, windowStart, now);
      break;
        
    case UsageLimitType.BANDWIDTH_PER_HOUR:
    case UsageLimitType.BANDWIDTH_PER_DAY:
      currentUsage = this.getBandwidthUsage(key, windowStart, now);
      break;
        
    case UsageLimitType.CONCURRENT_CONNECTIONS:
      currentUsage = this.activeConnections.get(key) || 0;
      break;
        
    default:
      currentUsage = 0;
    }

    const percentage = (currentUsage / limit.threshold) * 100;
    let action = UsageControlAction.ALLOW;

    if (currentUsage >= limit.threshold) {
      action = limit.action;
    } else if (percentage > 90) {
      action = UsageControlAction.WARNING;
    }

    return {
      limitId: limit.limitId,
      limitName: limit.name,
      currentUsage,
      threshold: limit.threshold,
      percentage,
      action,
      applied: action !== UsageControlAction.ALLOW
    };
  }

  private getActionSeverity(action: UsageControlAction): number {
    const severities = {
      [UsageControlAction.ALLOW]: 0,
      [UsageControlAction.WARNING]: 1,
      [UsageControlAction.THROTTLE]: 2,
      [UsageControlAction.ALERT]: 3,
      [UsageControlAction.REJECT]: 4,
      [UsageControlAction.ESCALATE]: 5
    };
    return severities[action] || 0;
  }

  private calculateWaitTime(limit: UsageLimit, currentUsage: number, threshold: number): number {
    const excessUsage = currentUsage - threshold;
    const baseWaitTime = 1000; // 1 second

    switch (limit.configuration.backoffStrategy) {
    case 'linear':
      return Math.min(baseWaitTime * excessUsage, limit.configuration.maxBackoffTime);
    case 'exponential':
      return Math.min(baseWaitTime * Math.pow(2, excessUsage), limit.configuration.maxBackoffTime);
    case 'fixed':
    default:
      return baseWaitTime;
    }
  }

  private calculateQuotaRemaining(
    userId: string | undefined,
    apiKey: string | undefined,
    limits: UsageLimit[]
  ): Record<string, number> {
    const quotaRemaining: Record<string, number> = {};
    
    limits.forEach(limit => {
      const key = this.getUsageKey(userId, apiKey, undefined, limit.type);
      const currentUsage = this.getCurrentUsage(key, limit);
      quotaRemaining[limit.limitId] = Math.max(0, limit.threshold - currentUsage);
    });

    return quotaRemaining;
  }

  private getCurrentUsage(key: string, limit: UsageLimit): number {
    const now = Date.now();
    const windowStart = now - limit.period;
    
    switch (limit.type) {
    case UsageLimitType.REQUESTS_PER_MINUTE:
    case UsageLimitType.REQUESTS_PER_HOUR:
    case UsageLimitType.REQUESTS_PER_DAY:
      return this.getRequestCount(key, windowStart, now);
    case UsageLimitType.BANDWIDTH_PER_HOUR:
    case UsageLimitType.BANDWIDTH_PER_DAY:
      return this.getBandwidthUsage(key, windowStart, now);
    case UsageLimitType.CONCURRENT_CONNECTIONS:
      return this.activeConnections.get(key) || 0;
    default:
      return 0;
    }
  }

  private generateDecisionReason(
    action: UsageControlAction,
    appliedLimits: string[],
    limitChecks: LimitCheck[]
  ): string {
    if (action === UsageControlAction.ALLOW) {
      return 'Request allowed - within all usage limits';
    }

    const violatedLimits = limitChecks.filter(check => check.applied);
    if (violatedLimits.length === 0) {
      return 'Request processed';
    }

    const limitNames = violatedLimits.map(check => check.limitName).join(', ');
    return `${action.toUpperCase()} - exceeded limits: ${limitNames}`;
  }

  private getUsageKey(
    userId: string | undefined,
    apiKey: string | undefined,
    ipAddress: string | undefined,
    limitType?: UsageLimitType
  ): string {
    const parts = [
      userId || 'anonymous',
      apiKey || 'no-key',
      ipAddress || 'no-ip',
      limitType || 'general'
    ];
    return parts.join(':');
  }

  private getRequestCount(key: string, windowStart: number, windowEnd: number): number {
    // Implementation would query actual usage records
    // For now, return mock data
    return Math.floor(Math.random() * 100);
  }

  private getBandwidthUsage(key: string, windowStart: number, windowEnd: number): number {
    // Implementation would query actual bandwidth usage
    // For now, return mock data
    return Math.floor(Math.random() * 1024 * 1024); // Random MB usage
  }

  // Additional helper methods would be implemented here...
  private async validateLimitConfiguration(limit: UsageLimit): Promise<void> {

    if (limit.threshold <= 0) {
      throw new Error('Threshold must be positive');
    }
    if (limit.period <= 0) {
      throw new Error('Period must be positive');
    }
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private invalidateRelatedCaches(limitId: string): void {
    // Clear rate limit and quota caches related to this limit
    this.rateLimitCache.clear();
    this.quotaCache.clear();
  }

  private initializeDefaultLimits(): void {
    console.log('Usage Control Service initialized with default limits');
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.performCleanup();
    }, 300000); // 5 minutes
  }

  private performCleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean old usage records from memory
    this.usageRecords.forEach((records, key) => {
      const filtered = records.filter(record => now - record.timestamp.getTime() < maxAge);
      this.usageRecords.set(key, filtered);
    });

    // Clean old rate limit cache entries
    this.rateLimitCache.forEach((state, key) => {
      if (now - state.lastUpdated > maxAge) {
        this.rateLimitCache.delete(key);
      }
    });
  }

  // Placeholder methods for persistence and analysis
  private async persistUsageLimit(limit: UsageLimit): Promise<void> {

    console.log(`Persisting usage limit: ${limit.limitId}`);
  }

  private async removeUsageLimit(limitId: string): Promise<void> {

    console.log(`Removing usage limit: ${limitId}`);
  }

  private async persistUsageRecord(record: UsageRecord): Promise<void> {

    console.log(`Persisting usage record: ${record.recordId}`);
  }

  private async updateRateLimitCache(record: UsageRecord): Promise<void> {

    // Update rate limiting cache based on usage record
  }

  private async updateQuotaCache(record: UsageRecord): Promise<void> {

    // Update quota cache based on usage record
  }

  private scheduleCleanupIfNeeded(key: string): void {
    const records = this.usageRecords.get(key);
    if (records && records.length > 1000) {
      // Trigger immediate cleanup for this key
      const maxAge = 60 * 60 * 1000; // 1 hour
      const cutoff = Date.now() - maxAge;
      this.usageRecords.set(key, records.filter(r => r.timestamp.getTime() > cutoff));
    }
  }

  private async recordLimitViolation(
    limitChecks: LimitCheck[],
    userId: string | undefined,
    endpoint: string,
    requestId: string
  ): Promise<void> {

    const violations = limitChecks.filter(check => check.applied);
    
    for (const violation of violations) {
      console.log(`Limit violation recorded: ${violation.limitId} for ${userId || 'anonymous'}`);
    }
  }

  // Analytics helper methods
  private async queryUsageRecords(
    timeRange: { start: Date; end: Date },
    filters?: any
  ): Promise<UsageRecord[]> {

    // Mock data for now - would query database in production
    return [];
  }

  private async queryLimitViolations(
    timeRange: { start: Date; end: Date },
    filters?: any
  ): Promise<LimitViolation[]> {

    // Mock data for now - would query database in production
    return [];
  }

  private async generateTrendAnalysis(
    timeRange: { start: Date; end: Date },
    records: UsageRecord[]
  ): Promise<UsageTrends> {

    // Mock trend analysis - would implement actual trend calculation
    return {
      requestTrend: {
        current: 1000,
        previous: 950,
        change: 50,
        changePercentage: 5.26,
        trend: 'increasing',
        dataPoints: []
  }
      bandwidthTrend: {
        current: 5242880, // 5MB
        previous: 4194304, // 4MB
        change: 1048576, // 1MB
        changePercentage: 25,
        trend: 'increasing',
        dataPoints: []
  }
      responseTrend: {
        current: 250,
        previous: 275,
        change: -25,
        changePercentage: -9.09,
        trend: 'decreasing',
        dataPoints: []
  }
      errorTrend: {
        current: 2.5,
        previous: 3.2,
        change: -0.7,
        changePercentage: -21.88,
        trend: 'decreasing',
        dataPoints: []
  }
      userActivityTrend: {
        current: 150,
        previous: 140,
        change: 10,
        changePercentage: 7.14,
        trend: 'increasing',
        dataPoints: []
      }
    };
  }

  private async calculateQuotaUtilization(): Promise<QuotaUtilization[]> {

    const utilization: QuotaUtilization[] = [];
    
    this.usageLimits.forEach(limit => {
      const used = Math.floor(Math.random() * limit.threshold);
      const percentage = (used / limit.threshold) * 100;
      let status: 'ok' | 'warning' | 'critical' = 'ok';
      
      if (percentage > 90) status = 'critical';
      else if (percentage > 75) status = 'warning';

      utilization.push({
        limitId: limit.limitId,
        limitName: limit.name,
        used,
        total: limit.threshold,
        percentage,
        timeRemaining: limit.period - (Date.now() % limit.period),
        status
      });
    });

    return utilization;
  }

  private calculateUserQuotaUtilization(userId: string): number {
    // Mock calculation - would implement actual quota utilization
    return Math.floor(Math.random() * 100);
  }

  // System metrics helper methods
  private getActiveUserCount(): number {
    return new Set(
      Array.from(this.usageRecords.values())
        .flat()
        .filter(r => Date.now() - r.timestamp.getTime() < 300000) // 5 minutes
        .map(r => r.userId)
        .filter(Boolean)
    ).size;
  }

  private getTotalConnectionCount(): number {
    return Array.from(this.activeConnections.values()).reduce((sum, count) => sum + count, 0);
  }

  private async getRequestsPerMinute(): Promise<number> {

    const oneMinuteAgo = Date.now() - 60000;
    let count = 0;
    
    this.usageRecords.forEach(records => {
      count += records.filter(r => r.timestamp.getTime() > oneMinuteAgo).length;
    });

    return count;
  }

  private async getBandwidthPerSecond(): Promise<number> {

    const oneSecondAgo = Date.now() - 1000;
    let bandwidth = 0;
    
    this.usageRecords.forEach(records => {
      bandwidth += records
        .filter(r => r.timestamp.getTime() > oneSecondAgo)
        .reduce((sum, r) => sum + r.requestSize + r.responseSize, 0);
    });

    return bandwidth;
  }

  private async getViolationsInLastHour(): Promise<number> {

    // Mock data - would query actual violations
    return Math.floor(Math.random() * 10);
  }

  private async getTopResourceConsumers(limit: number): Promise<ResourceConsumer[]> {

    // Mock data - would analyze actual usage patterns
    const consumers: ResourceConsumer[] = [];
    
    for (let i = 0; i < limit; i++) {
      consumers.push({
        identifier: `user_${i + 1}`,
        type: 'user',
        requestCount: Math.floor(Math.random() * 1000),
        bandwidth: Math.floor(Math.random() * 10 * 1024 * 1024), // Random MB
        connectionCount: Math.floor(Math.random() * 50),
        quotaUsage: Math.floor(Math.random() * 100)
      });
    }

    return consumers.sort((a, b) => b.requestCount - a.requestCount);
  }

  private async getSystemLoadMetrics(): Promise<SystemLoadMetrics> {

    const memUsage = process.memoryUsage();
    
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      networkUtilization: Math.random() * 100,
      responseTimeP95: 250 + Math.random() * 500,
      errorRate: Math.random() * 5
    };
  }

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  async getUsageLimits(filters?: { status?: UsageControlStatus; type?: UsageLimitType }): Promise<UsageLimit[]> {

    let limits = Array.from(this.usageLimits.values());
    
    if (filters?.status) {
      limits = limits.filter(limit => limit.status === filters.status);
    }
    
    if (filters?.type) {
      limits = limits.filter(limit => limit.type === filters.type);
    }
    
    return limits;
  }

  async getUsageLimit(limitId: string): Promise<UsageLimit | null> {

    return this.usageLimits.get(limitId) || null;
  }

  async activateUsageLimit(limitId: string): Promise<void> {

    await this.updateUsageLimit(limitId, { status: UsageControlStatus.ACTIVE });
  }

  async deactivateUsageLimit(limitId: string): Promise<void> {

    await this.updateUsageLimit(limitId, { status: UsageControlStatus.INACTIVE });
  }

  async getUsageStats(
    userId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<{ requestCount: number; bandwidth: number; quotaUtilization: number }> {

    // Mock implementation
    return {
      requestCount: Math.floor(Math.random() * 1000),
      bandwidth: Math.floor(Math.random() * 10 * 1024 * 1024),
      quotaUtilization: Math.floor(Math.random() * 100)
    };
  }
}

// ==========================================
// RATE LIMITING HELPER INTERFACES
// ==========================================

}
}
interface RateLimitState {
  requests: number;
  bandwidth: number;
  windowStart: number;
  lastUpdated: number;
}
}
}

}
}
interface QuotaState {
  used: number;
  resetTime: number;
  lastUpdated: number;
}
}
}