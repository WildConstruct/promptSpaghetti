/**
 * Session Activity Tracking Service - Epic 19 Implementation
 * Comprehensive tracking and analysis of user session activities
 */

import { EventEmitter } from 'events';
import { DatabaseService } from '../database/DatabaseService';
import { RedisService } from '../database/RedisService';

export interface SessionActivity {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  
  activity: {
    type: 'page_view' | 'api_call' | 'file_access' | 'data_export' | 
          'settings_change' | 'authentication' | 'error' | 'security_event';
    category: 'navigation' | 'interaction' | 'transaction' | 'security' | 'system';
    action: string;
    resource?: string;
    method?: string;
  };
  
  context: {
    ipAddress: string;
    userAgent: string;
    deviceId?: string;
    location?: {
      country: string;
      region: string;
      city: string;
      coordinates?: { lat: number; lon: number };
    };
    referrer?: string;
    sessionContext?: Record<string, any>;
  };
  
  performance: {
    responseTime?: number; // milliseconds
    processingTime?: number;
    queueTime?: number;
    dbTime?: number;
    cacheHit?: boolean;
    bytesTransferred?: number;
  };
  
  outcome: {
    success: boolean;
    statusCode?: number;
    errorType?: string;
    errorMessage?: string;
    warnings?: string[];
  };
  
  security: {
    riskScore: number;
    suspicious: boolean;
    violations?: string[];
    blocked: boolean;
    authLevel: 'none' | 'basic' | 'mfa' | 'elevated';
  };
  
  metadata: {
    tags: string[];
    custom: Record<string, any>;
    correlationId?: string;
    parentActivityId?: string;
    childActivities?: string[];
  };
}

export interface ActivityPattern {
  id: string;
  name: string;
  description: string;
  
  pattern: {
    type: 'sequence' | 'frequency' | 'timing' | 'anomaly' | 'threshold';
    activities?: string[]; // Activity types or actions
    timeWindow?: number; // seconds
    threshold?: number;
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in' | 'regex';
      value: any;
    }>;
  };
  
  detection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    cooldown: number; // seconds between detections
    lastDetected?: Date;
    detectionCount: number;
  };
  
  response: {
    action: 'log' | 'alert' | 'block' | 'challenge' | 'terminate';
    severity: 'info' | 'warning' | 'error' | 'critical';
    notification: {
      enabled: boolean;
      recipients: string[];
      channels: ('email' | 'sms' | 'webhook' | 'slack')[];
    };
  };
}

export interface ActivitySummary {
  sessionId: string;
  userId: string;
  period: {
    start: Date;
    end: Date;
    duration: number; // seconds
  };
  
  statistics: {
    totalActivities: number;
    uniqueResources: number;
    averageResponseTime: number;
    errorRate: number;
    peakActivityTime?: Date;
    idleTime: number; // seconds
  };
  
  breakdown: {
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byHour: Array<{ hour: number; count: number }>;
    byResource: Array<{ resource: string; count: number; avgTime: number }>;
  };
  
  security: {
    suspiciousActivities: number;
    blockedAttempts: number;
    riskEvents: Array<{
      timestamp: Date;
      activity: string;
      riskScore: number;
      reason: string;
    }>;
    overallRiskScore: number;
  };
  
  performance: {
    slowestOperations: Array<{
      activity: string;
      responseTime: number;
      timestamp: Date;
    }>;
    failedOperations: Array<{
      activity: string;
      error: string;
      timestamp: Date;
    }>;
    resourceUsage: {
      bandwidth: number; // bytes
      apiCalls: number;
      dbQueries: number;
    };
  };
}

export interface RealTimeActivityStream {
  sessionId: string;
  userId: string;
  startTime: Date;
  
  stream: {
    isActive: boolean;
    subscribers: number;
    bufferSize: number;
    latency: number; // milliseconds
  };
  
  filters: {
    activityTypes?: string[];
    minRiskScore?: number;
    includePerformance: boolean;
    includeSecurity: boolean;
  };
  
  metrics: {
    activitiesPerMinute: number;
    averageProcessingTime: number;
    droppedEvents: number;
    backpressure: boolean;
  };
}

export class SessionActivityTrackingService extends EventEmitter {
  private db: DatabaseService;
  private redis: RedisService;
  private activityBuffer: Map<string, SessionActivity[]> = new Map();
  private patterns: Map<string, ActivityPattern> = new Map();
  private realTimeStreams: Map<string, RealTimeActivityStream> = new Map();
  private summaryCache: Map<string, ActivitySummary> = new Map();
  private config: {
    bufferSize: number;
    flushInterval: number; // milliseconds
    retentionDays: number;
    realTimeEnabled: boolean;
    compressionEnabled: boolean;
    anonymizePII: boolean;
    samplingRate: number; // 0-1
  };
  private flushTimer: NodeJS.Timeout;

  constructor(
    db: DatabaseService,
    redis: RedisService,
    config?: Partial<SessionActivityTrackingService['config']>
  ) {
    super();
    this.db = db;
    this.redis = redis;
    this.config = {
      bufferSize: 1000,
      flushInterval: 5000, // 5 seconds
      retentionDays: 90,
      realTimeEnabled: true,
      compressionEnabled: true,
      anonymizePII: false,
      samplingRate: 1.0,
      ...config
    };
    this.initializeDefaultPatterns();
    this.startFlushTimer();
  }

  /**
   * Track a session activity
   */
  async trackActivity(
    sessionId: string,
    userId: string,
    activity: Omit<SessionActivity, 'id' | 'sessionId' | 'userId' | 'timestamp'>
  ): Promise<{
    tracked: boolean;
    activityId?: string;
    warnings?: string[];
    blocked?: boolean;
  }> {
    try {
      // Apply sampling
      if (this.config.samplingRate < 1 && Math.random() > this.config.samplingRate) {
        return { tracked: false };
      }

      // Create activity record
      const activityRecord: SessionActivity = {
        id: this.generateActivityId(),
        sessionId,
        userId,
        timestamp: new Date(),
        ...activity
      };

      // Anonymize PII if configured
      if (this.config.anonymizePII) {
        activityRecord.context.ipAddress = this.anonymizeIP(activityRecord.context.ipAddress);
        delete activityRecord.context.location?.coordinates;
      }

      // Check security patterns
      const securityCheck = await this.checkSecurityPatterns(activityRecord);
      if (securityCheck.blocked) {
        activityRecord.security.blocked = true;
        activityRecord.outcome.success = false;
        activityRecord.outcome.errorType = 'security_blocked';
      }

      // Buffer activity
      this.bufferActivity(activityRecord);

      // Stream real-time if enabled
      if (this.config.realTimeEnabled) {
        await this.streamActivity(activityRecord);
      }

      // Check for patterns
      const patternMatches = await this.detectPatterns(activityRecord);
      if (patternMatches.length > 0) {
        await this.handlePatternMatches(activityRecord, patternMatches);
      }

      // Update session metrics in Redis
      await this.updateSessionMetrics(sessionId, activityRecord);

      // Emit activity event
      this.emit('activityTracked', {
        activityId: activityRecord.id,
        sessionId,
        userId,
        type: activityRecord.activity.type,
        risk: activityRecord.security.riskScore
      });

      return {
        tracked: true,
        activityId: activityRecord.id,
        warnings: securityCheck.warnings,
        blocked: securityCheck.blocked
      };

    } catch (error) {
      console.error('Error tracking activity:', error);
      return {
        tracked: false,
        warnings: ['Failed to track activity']
      };
    }
  }

  /**
   * Get activity history for a session
   */
  async getSessionActivities(
    sessionId: string,
    options: {
      startTime?: Date;
      endTime?: Date;
      activityTypes?: string[];
      limit?: number;
      offset?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<{
    activities: SessionActivity[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const query = this.buildActivityQuery(sessionId, options);
      
      // Get from database
      const result = await this.db.query(query.sql, query.params);
      
      // Get total count
      const countResult = await this.db.query(query.countSql, query.countParams);
      const total = parseInt(countResult.rows[0]?.count || '0');
      
      // Transform results
      const activities = result.rows.map(row => this.transformActivityRecord(row));
      
      return {
        activities,
        total,
        hasMore: activities.length === (options.limit || 100)
      };

    } catch (error) {
      console.error('Error getting session activities:', error);
      return {
        activities: [],
        total: 0,
        hasMore: false
      };
    }
  }

  /**
   * Generate activity summary for a session
   */
  async generateActivitySummary(
    sessionId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<ActivitySummary> {
    try {
      // Check cache first
      const cacheKey = `${sessionId}-${timeRange?.start?.getTime()}-${timeRange?.end?.getTime()}`;
      const cached = this.summaryCache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached;
      }

      // Get all activities for the session
      const activities = await this.getAllSessionActivities(sessionId, timeRange);
      
      if (activities.length === 0) {
        return this.createEmptySummary(sessionId, '', timeRange);
      }

      const userId = activities[0].userId;
      const summary = this.calculateActivitySummary(sessionId, userId, activities, timeRange);
      
      // Cache the summary
      this.summaryCache.set(cacheKey, summary);
      
      return summary;

    } catch (error) {
      console.error('Error generating activity summary:', error);
      throw new Error('Failed to generate activity summary');
    }
  }

  /**
   * Stream real-time activities for a session
   */
  async startRealTimeStream(
    sessionId: string,
    userId: string,
    filters?: RealTimeActivityStream['filters']
  ): Promise<{
    streamId: string;
    stream: RealTimeActivityStream;
  }> {
    if (!this.config.realTimeEnabled) {
      throw new Error('Real-time streaming is disabled');
    }

    const streamId = this.generateStreamId();
    const stream: RealTimeActivityStream = {
      sessionId,
      userId,
      startTime: new Date(),
      stream: {
        isActive: true,
        subscribers: 1,
        bufferSize: 100,
        latency: 0
      },
      filters: filters || {
        includePerformance: true,
        includeSecurity: true
      },
      metrics: {
        activitiesPerMinute: 0,
        averageProcessingTime: 0,
        droppedEvents: 0,
        backpressure: false
      }
    };

    this.realTimeStreams.set(streamId, stream);

    // Subscribe to Redis pub/sub for real-time updates
    await this.subscribeToActivityStream(sessionId, streamId);

    this.emit('streamStarted', {
      streamId,
      sessionId,
      userId
    });

    return { streamId, stream };
  }

  /**
   * Search activities across sessions
   */
  async searchActivities(
    criteria: {
      userId?: string;
      activityTypes?: string[];
      searchTerm?: string;
      dateRange?: { start: Date; end: Date };
      minRiskScore?: number;
      outcome?: 'success' | 'failure';
      resource?: string;
    },
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'timestamp' | 'risk' | 'responseTime';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    activities: SessionActivity[];
    total: number;
    aggregations: {
      byType: Record<string, number>;
      byOutcome: Record<string, number>;
      avgResponseTime: number;
      totalRiskEvents: number;
    };
  }> {
    try {
      const searchQuery = this.buildSearchQuery(criteria, options);
      
      // Execute search
      const searchResult = await this.db.query(searchQuery.sql, searchQuery.params);
      
      // Get aggregations
      const aggResult = await this.db.query(searchQuery.aggSql, searchQuery.aggParams);
      
      // Transform results
      const activities = searchResult.rows.map(row => this.transformActivityRecord(row));
      
      return {
        activities,
        total: parseInt(aggResult.rows[0]?.total_count || '0'),
        aggregations: {
          byType: this.parseAggregation(aggResult.rows[0]?.by_type),
          byOutcome: this.parseAggregation(aggResult.rows[0]?.by_outcome),
          avgResponseTime: parseFloat(aggResult.rows[0]?.avg_response_time || '0'),
          totalRiskEvents: parseInt(aggResult.rows[0]?.risk_events || '0')
        }
      };

    } catch (error) {
      console.error('Error searching activities:', error);
      throw new Error('Failed to search activities');
    }
  }

  /**
   * Detect anomalous activity patterns
   */
  async detectAnomalies(
    sessionId: string,
    lookbackMinutes: number = 30
  ): Promise<{
    anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      timestamp: Date;
      relatedActivities: string[];
      recommendation: string;
    }>;
    riskScore: number;
    requiresAction: boolean;
  }> {
    try {
      const activities = await this.getRecentActivities(sessionId, lookbackMinutes);
      const anomalies = [];
      
      // Rapid activity detection
      const rapidActivity = this.detectRapidActivity(activities);
      if (rapidActivity) anomalies.push(rapidActivity);
      
      // Unusual access patterns
      const unusualAccess = this.detectUnusualAccess(activities);
      if (unusualAccess) anomalies.push(unusualAccess);
      
      // Failed operation sequences
      const failureSequences = this.detectFailureSequences(activities);
      if (failureSequences) anomalies.push(failureSequences);
      
      // Geographic anomalies
      const geoAnomalies = await this.detectGeographicAnomalies(activities);
      if (geoAnomalies) anomalies.push(geoAnomalies);
      
      // Time-based anomalies
      const timeAnomalies = this.detectTimeAnomalies(activities);
      if (timeAnomalies) anomalies.push(timeAnomalies);
      
      // Calculate overall risk score
      const riskScore = this.calculateAnomalyRiskScore(anomalies);
      
      return {
        anomalies,
        riskScore,
        requiresAction: riskScore > 70 || anomalies.some(a => a.severity === 'high')
      };

    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return {
        anomalies: [],
        riskScore: 0,
        requiresAction: false
      };
    }
  }

  /**
   * Export activity data
   */
  async exportActivities(
    criteria: {
      sessionId?: string;
      userId?: string;
      dateRange: { start: Date; end: Date };
    },
    format: 'json' | 'csv' | 'parquet' = 'json',
    options: {
      includeMetadata?: boolean;
      anonymize?: boolean;
      compress?: boolean;
    } = {}
  ): Promise<{
    data: Buffer;
    filename: string;
    mimeType: string;
    recordCount: number;
  }> {
    try {
      // Get activities based on criteria
      const activities = await this.getActivitiesForExport(criteria);
      
      // Apply anonymization if requested
      if (options.anonymize) {
        activities.forEach(activity => this.anonymizeActivity(activity));
      }
      
      // Convert to requested format
      let data: Buffer;
      let mimeType: string;
      
      switch (format) {
        case 'csv':
          data = await this.convertToCSV(activities, options.includeMetadata);
          mimeType = 'text/csv';
          break;
          
        case 'parquet':
          data = await this.convertToParquet(activities);
          mimeType = 'application/octet-stream';
          break;
          
        default:
          data = Buffer.from(JSON.stringify(activities, null, 2));
          mimeType = 'application/json';
      }
      
      // Compress if requested
      if (options.compress) {
        data = await this.compressData(data);
      }
      
      const filename = `activities_${Date.now()}.${format}${options.compress ? '.gz' : ''}`;
      
      // Log export event
      await this.logExportEvent(criteria, format, activities.length);
      
      return {
        data,
        filename,
        mimeType,
        recordCount: activities.length
      };

    } catch (error) {
      console.error('Error exporting activities:', error);
      throw new Error('Failed to export activities');
    }
  }

  // Private helper methods

  private bufferActivity(activity: SessionActivity): void {
    const sessionBuffer = this.activityBuffer.get(activity.sessionId) || [];
    sessionBuffer.push(activity);
    
    // Maintain buffer size limit
    if (sessionBuffer.length > this.config.bufferSize) {
      sessionBuffer.splice(0, sessionBuffer.length - this.config.bufferSize);
    }
    
    this.activityBuffer.set(activity.sessionId, sessionBuffer);
  }

  private async flushBuffer(): Promise<void> {
    const bufferSnapshot = new Map(this.activityBuffer);
    this.activityBuffer.clear();
    
    for (const [sessionId, activities] of bufferSnapshot) {
      if (activities.length === 0) continue;
      
      try {
        await this.batchInsertActivities(activities);
      } catch (error) {
        console.error(`Error flushing buffer for session ${sessionId}:`, error);
        // Re-add to buffer for retry
        const currentBuffer = this.activityBuffer.get(sessionId) || [];
        this.activityBuffer.set(sessionId, [...activities, ...currentBuffer]);
      }
    }
  }

  private async batchInsertActivities(activities: SessionActivity[]): Promise<void> {
    const values = activities.map(activity => [
      activity.id,
      activity.sessionId,
      activity.userId,
      activity.timestamp,
      JSON.stringify(activity.activity),
      JSON.stringify(activity.context),
      JSON.stringify(activity.performance),
      JSON.stringify(activity.outcome),
      JSON.stringify(activity.security),
      JSON.stringify(activity.metadata)
    ]);
    
    const query = `
      INSERT INTO session_activities (
        id, session_id, user_id, timestamp,
        activity, context, performance, outcome,
        security, metadata
      ) VALUES ${values.map((_, i) => 
        `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, 
          $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, 
          $${i * 10 + 9}, $${i * 10 + 10})`
      ).join(', ')}
    `;
    
    await this.db.query(query, values.flat());
  }

  private async checkSecurityPatterns(activity: SessionActivity): Promise<{
    blocked: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    let shouldBlock = false;
    
    // Check for SQL injection patterns
    if (this.containsSQLInjection(activity)) {
      warnings.push('Potential SQL injection detected');
      activity.security.violations = [...(activity.security.violations || []), 'sql_injection'];
      activity.security.riskScore = Math.max(activity.security.riskScore, 90);
      shouldBlock = true;
    }
    
    // Check for XSS patterns
    if (this.containsXSS(activity)) {
      warnings.push('Potential XSS detected');
      activity.security.violations = [...(activity.security.violations || []), 'xss_attempt'];
      activity.security.riskScore = Math.max(activity.security.riskScore, 85);
      shouldBlock = true;
    }
    
    // Check for path traversal
    if (this.containsPathTraversal(activity)) {
      warnings.push('Path traversal attempt detected');
      activity.security.violations = [...(activity.security.violations || []), 'path_traversal'];
      activity.security.riskScore = Math.max(activity.security.riskScore, 80);
      shouldBlock = true;
    }
    
    return {
      blocked: shouldBlock,
      warnings
    };
  }

  private containsSQLInjection(activity: SessionActivity): boolean {
    const patterns = [
      /(\b(union|select|insert|update|delete|drop|create)\b.*\b(from|where|table)\b)/i,
      /('|")\s*;\s*-{2}/,
      /\b(or|and)\b\s*'?\d+'\s*=\s*'?\d+'/i
    ];
    
    const checkString = JSON.stringify(activity.activity);
    return patterns.some(pattern => pattern.test(checkString));
  }

  private containsXSS(activity: SessionActivity): boolean {
    const patterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    const checkString = JSON.stringify(activity.activity);
    return patterns.some(pattern => pattern.test(checkString));
  }

  private containsPathTraversal(activity: SessionActivity): boolean {
    const patterns = [
      /\.\.[\/\\]/g,
      /%2e%2e[%2f%5c]/gi
    ];
    
    const resource = activity.activity.resource || '';
    return patterns.some(pattern => pattern.test(resource));
  }

  private async streamActivity(activity: SessionActivity): Promise<void> {
    // Publish to Redis for real-time subscribers
    const channel = `activity:${activity.sessionId}`;
    await this.redis.publish(channel, JSON.stringify(activity));
    
    // Update stream metrics
    for (const [streamId, stream] of this.realTimeStreams) {
      if (stream.sessionId === activity.sessionId) {
        this.updateStreamMetrics(streamId, activity);
      }
    }
  }

  private async detectPatterns(activity: SessionActivity): Promise<ActivityPattern[]> {
    const matches: ActivityPattern[] = [];
    
    for (const pattern of this.patterns.values()) {
      if (!pattern.detection.enabled) continue;
      
      // Check cooldown
      if (pattern.detection.lastDetected) {
        const cooldownEnd = new Date(pattern.detection.lastDetected.getTime() + pattern.detection.cooldown * 1000);
        if (cooldownEnd > new Date()) continue;
      }
      
      // Check pattern match
      if (await this.matchesPattern(activity, pattern)) {
        matches.push(pattern);
        pattern.detection.lastDetected = new Date();
        pattern.detection.detectionCount++;
      }
    }
    
    return matches;
  }

  private async matchesPattern(activity: SessionActivity, pattern: ActivityPattern): boolean {
    // Check conditions
    for (const condition of pattern.pattern.conditions) {
      const fieldValue = this.getFieldValue(activity, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'contains':
          if (!String(fieldValue).includes(condition.value)) return false;
          break;
        case 'gt':
          if (!(fieldValue > condition.value)) return false;
          break;
        case 'lt':
          if (!(fieldValue < condition.value)) return false;
          break;
        case 'in':
          if (!condition.value.includes(fieldValue)) return false;
          break;
        case 'regex':
          if (!new RegExp(condition.value).test(String(fieldValue))) return false;
          break;
      }
    }
    
    return true;
  }

  private getFieldValue(activity: SessionActivity, field: string): any {
    const parts = field.split('.');
    let value: any = activity;
    
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    
    return value;
  }

  private async handlePatternMatches(activity: SessionActivity, patterns: ActivityPattern[]): Promise<void> {
    for (const pattern of patterns) {
      switch (pattern.response.action) {
        case 'log':
          console.log(`Pattern detected: ${pattern.name} for activity ${activity.id}`);
          break;
          
        case 'alert':
          await this.sendPatternAlert(pattern, activity);
          break;
          
        case 'block':
          activity.security.blocked = true;
          activity.outcome.success = false;
          break;
          
        case 'terminate':
          await this.requestSessionTermination(activity.sessionId, pattern);
          break;
      }
      
      this.emit('patternDetected', {
        pattern: pattern.name,
        activity: activity.id,
        sessionId: activity.sessionId,
        severity: pattern.response.severity
      });
    }
  }

  private async updateSessionMetrics(sessionId: string, activity: SessionActivity): Promise<void> {
    const metricsKey = `session:metrics:${sessionId}`;
    
    // Update counters
    await this.redis.hincrby(metricsKey, 'total_activities', 1);
    await this.redis.hincrby(metricsKey, `type:${activity.activity.type}`, 1);
    
    if (!activity.outcome.success) {
      await this.redis.hincrby(metricsKey, 'errors', 1);
    }
    
    if (activity.security.suspicious) {
      await this.redis.hincrby(metricsKey, 'suspicious_activities', 1);
    }
    
    // Update response time average
    if (activity.performance.responseTime) {
      await this.redis.hincrbyfloat(metricsKey, 'total_response_time', activity.performance.responseTime);
    }
    
    // Set expiry
    await this.redis.expire(metricsKey, 86400); // 24 hours
  }

  private calculateActivitySummary(
    sessionId: string,
    userId: string,
    activities: SessionActivity[],
    timeRange?: { start: Date; end: Date }
  ): ActivitySummary {
    const start = timeRange?.start || activities[0].timestamp;
    const end = timeRange?.end || activities[activities.length - 1].timestamp;
    
    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      uniqueResources: new Set(activities.map(a => a.activity.resource).filter(Boolean)).size,
      averageResponseTime: this.calculateAverageResponseTime(activities),
      errorRate: activities.filter(a => !a.outcome.success).length / activities.length,
      idleTime: this.calculateIdleTime(activities)
    };
    
    // Calculate breakdowns
    const breakdown = {
      byType: this.groupByProperty(activities, a => a.activity.type),
      byCategory: this.groupByProperty(activities, a => a.activity.category),
      byHour: this.calculateHourlyDistribution(activities),
      byResource: this.calculateResourceStats(activities)
    };
    
    // Security analysis
    const security = {
      suspiciousActivities: activities.filter(a => a.security.suspicious).length,
      blockedAttempts: activities.filter(a => a.security.blocked).length,
      riskEvents: this.extractRiskEvents(activities),
      overallRiskScore: this.calculateOverallRiskScore(activities)
    };
    
    // Performance analysis
    const performance = {
      slowestOperations: this.findSlowestOperations(activities, 5),
      failedOperations: this.findFailedOperations(activities, 5),
      resourceUsage: this.calculateResourceUsage(activities)
    };
    
    return {
      sessionId,
      userId,
      period: {
        start,
        end,
        duration: (end.getTime() - start.getTime()) / 1000
      },
      statistics: stats,
      breakdown,
      security,
      performance
    };
  }

  private detectRapidActivity(activities: SessionActivity[]): any {
    const timeWindow = 60000; // 1 minute
    const threshold = 100; // activities per minute
    
    for (let i = 0; i < activities.length - threshold; i++) {
      const windowEnd = activities[i].timestamp.getTime() + timeWindow;
      let count = 1;
      
      for (let j = i + 1; j < activities.length && activities[j].timestamp.getTime() <= windowEnd; j++) {
        count++;
      }
      
      if (count >= threshold) {
        return {
          type: 'rapid_activity',
          severity: 'high',
          description: `${count} activities in 1 minute exceeds threshold of ${threshold}`,
          timestamp: activities[i].timestamp,
          relatedActivities: activities.slice(i, i + count).map(a => a.id),
          recommendation: 'Review for automated/bot activity'
        };
      }
    }
    
    return null;
  }

  private calculateAverageResponseTime(activities: SessionActivity[]): number {
    const times = activities
      .map(a => a.performance.responseTime)
      .filter(t => t !== undefined) as number[];
    
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  private calculateIdleTime(activities: SessionActivity[]): number {
    if (activities.length < 2) return 0;
    
    let totalIdleTime = 0;
    const idleThreshold = 300000; // 5 minutes
    
    for (let i = 1; i < activities.length; i++) {
      const gap = activities[i].timestamp.getTime() - activities[i - 1].timestamp.getTime();
      if (gap > idleThreshold) {
        totalIdleTime += gap;
      }
    }
    
    return totalIdleTime / 1000; // Convert to seconds
  }

  private groupByProperty<T>(items: T[], getProperty: (item: T) => string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = getProperty(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateHourlyDistribution(activities: SessionActivity[]): Array<{ hour: number; count: number }> {
    const hourCounts: Record<number, number> = {};
    
    activities.forEach(activity => {
      const hour = activity.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }

  private anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }

  private anonymizeActivity(activity: SessionActivity): void {
    activity.context.ipAddress = this.anonymizeIP(activity.context.ipAddress);
    delete activity.context.location?.coordinates;
    activity.userId = this.hashUserId(activity.userId);
  }

  private hashUserId(userId: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(userId).digest('hex').substr(0, 16);
  }

  private initializeDefaultPatterns(): void {
    const defaultPatterns: Array<Omit<ActivityPattern, 'id'>> = [
      {
        name: 'Brute Force Detection',
        description: 'Detect multiple failed login attempts',
        pattern: {
          type: 'frequency',
          activities: ['authentication'],
          timeWindow: 300, // 5 minutes
          threshold: 5,
          conditions: [
            { field: 'outcome.success', operator: 'equals', value: false },
            { field: 'activity.type', operator: 'equals', value: 'authentication' }
          ]
        },
        detection: {
          enabled: true,
          sensitivity: 'high',
          cooldown: 600,
          detectionCount: 0
        },
        response: {
          action: 'alert',
          severity: 'warning',
          notification: {
            enabled: true,
            recipients: ['security@example.com'],
            channels: ['email', 'slack']
          }
        }
      },
      {
        name: 'Data Exfiltration',
        description: 'Detect unusual data export patterns',
        pattern: {
          type: 'threshold',
          threshold: 1000000, // 1MB
          conditions: [
            { field: 'activity.type', operator: 'equals', value: 'data_export' },
            { field: 'performance.bytesTransferred', operator: 'gt', value: 1000000 }
          ]
        },
        detection: {
          enabled: true,
          sensitivity: 'medium',
          cooldown: 3600,
          detectionCount: 0
        },
        response: {
          action: 'block',
          severity: 'critical',
          notification: {
            enabled: true,
            recipients: ['security@example.com'],
            channels: ['email', 'sms']
          }
        }
      }
    ];
    
    defaultPatterns.forEach(pattern => {
      const id = this.generatePatternId();
      this.patterns.set(id, { ...pattern, id });
    });
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.config.flushInterval);
  }

  private generateActivityId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStreamId(): string {
    return `STR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternId(): string {
    return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushBuffer(); // Final flush
    this.activityBuffer.clear();
    this.patterns.clear();
    this.realTimeStreams.clear();
    this.summaryCache.clear();
  }
}