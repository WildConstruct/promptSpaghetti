/**
 * Activity History Service
 * 
 * Comprehensive user activity tracking system that records, indexes,
 * and provides access to user activities across the platform.
 * 
 * Features:
 * - Real-time activity recording with efficient batching
 * - Multi-dimensional activity filtering and search
 * - Activity aggregation and analytics
 * - Privacy controls and data retention
 * - Export capabilities for compliance
 */

import { Database } from '../database/DatabaseService';
import { AuditService } from './AuditService';

}
export interface ActivityRecord {
  id: string;
  userId: string;
  sessionId?: string;
  activityType: ActivityType;
  category: ActivityCategory;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details: ActivityDetails;
  metadata: ActivityMetadata;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: GeolocationData;
}
}

}
export interface ActivityDetails {
  // Core activity data
  title: string;
  description?: string;
  
  // Resource-specific data
  resourceName?: string;
  resourceData?: any;
  
  // Action-specific data
  previousValue?: any;
  newValue?: any;
  changeType?: 'create' | 'update' | 'delete' | 'execute' | 'view' | 'share';
  
  // Context data
  contextType?: string;
  contextId?: string;
  parentActivityId?: string;
  
  // Performance data
  duration?: number;
  success?: boolean;
  errorMessage?: string;
  
  // Privacy flags
  sensitive?: boolean;
  internal?: boolean;
}
}

}
export interface ActivityMetadata {
  // System metadata
  apiVersion?: string;
  clientType?: 'web' | 'mobile' | 'api' | 'desktop';
  clientVersion?: string;
  
  // User context
  organizationId?: string;
  teamId?: string;
  roleId?: string;
  
  // Feature flags
  featureFlags?: string[];
  
  // Custom tags
  tags?: string[];
  
  // Correlation data
  correlationId?: string;
  traceId?: string;
  
  // Privacy settings
  retentionPeriod?: number;
  anonymize?: boolean;
}
}

}
export interface GeolocationData {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
}
  };
  timezone?: string;
}

export enum ActivityType {
  // Authentication activities
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  
  // Account activities
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_UPDATED = 'account_updated',
  ACCOUNT_DELETED = 'account_deleted',
  PROFILE_UPDATED = 'profile_updated',
  
  // Graph activities
  GRAPH_CREATED = 'graph_created',
  GRAPH_UPDATED = 'graph_updated',
  GRAPH_DELETED = 'graph_deleted',
  GRAPH_EXECUTED = 'graph_executed',
  GRAPH_SHARED = 'graph_shared',
  GRAPH_CLONED = 'graph_cloned',
  
  // Node activities
  NODE_CREATED = 'node_created',
  NODE_UPDATED = 'node_updated',
  NODE_DELETED = 'node_deleted',
  NODE_CONNECTED = 'node_connected',
  NODE_DISCONNECTED = 'node_disconnected',
  
  // Collaboration activities
  COLLABORATION_JOINED = 'collaboration_joined',
  COLLABORATION_LEFT = 'collaboration_left',
  COMMENT_CREATED = 'comment_created',
  COMMENT_UPDATED = 'comment_updated',
  COMMENT_DELETED = 'comment_deleted',
  
  // API activities
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  API_REQUEST = 'api_request',
  
  // System activities
  SYSTEM_MAINTENANCE = 'system_maintenance',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  
  // Security activities
  SECURITY_VIOLATION = 'security_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_HIT = 'rate_limit_hit',
  
  // Custom activities
  CUSTOM = 'custom'
}

export enum ActivityCategory {
  AUTHENTICATION = 'authentication',
  ACCOUNT_MANAGEMENT = 'account_management',
  CONTENT_CREATION = 'content_creation',
  CONTENT_MODIFICATION = 'content_modification',
  COLLABORATION = 'collaboration',
  SYSTEM_ADMINISTRATION = 'system_administration',
  API_USAGE = 'api_usage',
  SECURITY = 'security',
  ANALYTICS = 'analytics',
  CUSTOM = 'custom'
}

}
export interface ActivityQuery {
  userId?: string;
  sessionId?: string;
  activityTypes?: ActivityType[];
  categories?: ActivityCategory[];
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  tags?: string[];
  ipAddress?: string;
  location?: string;
  success?: boolean;
  sensitive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'activityType' | 'category';
  sortOrder?: 'asc' | 'desc';
}
}

}
export interface ActivitySummary {
  userId: string;
  dateRange: {
    start: Date;
    end: Date;
}
  };
  totalActivities: number;
  uniqueSessions: number;
  categories: Record<ActivityCategory, number>;
  types: Record<ActivityType, number>;
  resources: Record<string, number>;
  locations: Record<string, number>;
  trends: {
    dailyActivity: Array<{
      date: string;
      count: number;
      categories: Record<ActivityCategory, number>;
    }>;
    hourlyActivity: Array<{
      hour: number;
      count: number;
    }>;
  };
  topActivities: Array<{
    activityType: ActivityType;
    count: number;
    lastOccurrence: Date;
  }>;
}

}
export interface ActivityExport {
  userId: string;
  exportDate: Date;
  totalRecords: number;
  dateRange: {
    start: Date;
    end: Date;
}
  };
  format: 'json' | 'csv' | 'xml';
  activities: ActivityRecord[];
  summary: ActivitySummary;
  privacyInfo: {
    anonymized: boolean;
    fieldsRedacted: string[];
    retentionPolicy: string;
  };
}

export class ActivityHistoryService {
  private db: Database;
  private auditService: AuditService;
  private batchQueue: ActivityRecord[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds

  constructor(db: Database, auditService: AuditService) {
    this.db = db;
    this.auditService = auditService;
    
    // Setup cleanup interval
    this.setupCleanupInterval();
  }

  /**
   * Record a single activity
   */
  async recordActivity(
    userId: string,
    activityType: ActivityType,
    details: Omit<ActivityDetails, 'title'>,
    metadata: ActivityMetadata = {},
    context: {
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      location?: GeolocationData;
    } = {}
  ): Promise<void> {

    const activity: Omit<ActivityRecord, 'id'> = {
      userId,
      sessionId: context.sessionId,
      activityType,
      category: this.getCategoryForActivityType(activityType),
      action: this.getActionForActivityType(activityType),
      resourceType: details.resourceName ? this.inferResourceType(details.resourceName) : undefined,
      resourceId: metadata.correlationId,
      details: {
        title: this.generateActivityTitle(activityType, details),
        ...details
  }
      metadata,
      timestamp: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      location: context.location
    };

    // Add to batch queue
    this.batchQueue.push(activity as ActivityRecord);
    
    // Process batch if it reaches the size limit
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      await this.processBatch();
    } else {
      // Set timeout for batch processing if not already set
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.BATCH_TIMEOUT);
      }
    }
  }

  /**
   * Record multiple activities in batch
   */
  async recordActivities(activities: Array<{
    userId: string;
    activityType: ActivityType;
    details: Omit<ActivityDetails, 'title'>;
    metadata?: ActivityMetadata;
    context?: {
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      location?: GeolocationData;
    };
  }>): Promise<void> {

    const activityRecords = activities.map(activity => ({
      id: this.generateActivityId(),
      userId: activity.userId,
      sessionId: activity.context?.sessionId,
      activityType: activity.activityType,
      category: this.getCategoryForActivityType(activity.activityType),
      action: this.getActionForActivityType(activity.activityType),
      resourceType: activity.details.resourceName ? 
        this.inferResourceType(activity.details.resourceName) : undefined,
      resourceId: activity.metadata?.correlationId,
      details: {
        title: this.generateActivityTitle(activity.activityType, activity.details),
        ...activity.details
  }
      metadata: activity.metadata || {},
      timestamp: new Date(),
      ipAddress: activity.context?.ipAddress,
      userAgent: activity.context?.userAgent,
      location: activity.context?.location
    }));

    // Add to batch queue
    this.batchQueue.push(...activityRecords);
    
    // Process immediately if batch is large enough
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      await this.processBatch();
    }
  }

  /**
   * Query activities with filtering and pagination
   */
  async queryActivities(query: ActivityQuery): Promise<{
    activities: ActivityRecord[];
    totalCount: number;
    hasMore: boolean;
  }> {

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (query.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(query.userId);
    }

    if (query.sessionId) {
      conditions.push(`session_id = $${paramIndex++}`);
      values.push(query.sessionId);
    }

    if (query.activityTypes && query.activityTypes.length > 0) {
      conditions.push(`activity_type = ANY($${paramIndex++})`);
      values.push(query.activityTypes);
    }

    if (query.categories && query.categories.length > 0) {
      conditions.push(`category = ANY($${paramIndex++})`);
      values.push(query.categories);
    }

    if (query.resourceType) {
      conditions.push(`resource_type = $${paramIndex++}`);
      values.push(query.resourceType);
    }

    if (query.resourceId) {
      conditions.push(`resource_id = $${paramIndex++}`);
      values.push(query.resourceId);
    }

    if (query.startDate) {
      conditions.push(`timestamp >= $${paramIndex++}`);
      values.push(query.startDate);
    }

    if (query.endDate) {
      conditions.push(`timestamp <= $${paramIndex++}`);
      values.push(query.endDate);
    }

    if (query.search) {
      conditions.push(`(
        details->>'title' ILIKE $${paramIndex} OR 
        details->>'description' ILIKE $${paramIndex}
      )`);
      values.push(`%${query.search}%`);
      paramIndex++;
    }

    if (query.tags && query.tags.length > 0) {
      conditions.push(`metadata->'tags' ?| $${paramIndex++}`);
      values.push(query.tags);
    }

    if (query.ipAddress) {
      conditions.push(`ip_address = $${paramIndex++}`);
      values.push(query.ipAddress);
    }

    if (query.success !== undefined) {
      conditions.push(`(details->>'success')::boolean = $${paramIndex++}`);
      values.push(query.success);
    }

    if (query.sensitive !== undefined) {
      conditions.push(`(details->>'sensitive')::boolean = $${paramIndex++}`);
      values.push(query.sensitive);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM activity_history ${whereClause}`;
    const countResult = await this.db.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get activities with pagination
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    const limit = Math.min(query.limit || 50, 1000); // Max 1000 per query
    const offset = query.offset || 0;

    const dataQuery = `
      SELECT * FROM activity_history 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    values.push(limit, offset);
    const dataResult = await this.db.query(dataQuery, values);

    const activities = dataResult.rows.map(row => this.mapActivityRow(row));

    return {
      activities,
      totalCount,
      hasMore: offset + activities.length < totalCount
    };
  }

  /**
   * Get activity summary for a user
   */
  async getActivitySummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ActivitySummary> {

    const baseQuery = `
      SELECT 
        activity_type,
        category,
        resource_type,
        location->>'country' as country,
        DATE(timestamp) as activity_date,
        EXTRACT(hour FROM timestamp) as activity_hour,
        timestamp
      FROM activity_history 
      WHERE user_id = $1 AND timestamp >= $2 AND timestamp <= $3
    `;

    const result = await this.db.query(baseQuery, [userId, startDate, endDate]);
    const activities = result.rows;

    // Calculate summary statistics
    const totalActivities = activities.length;
    const uniqueSessions = new Set(
      activities.map(a => a.session_id).filter(Boolean)
    ).size;

    // Category distribution
    const categories: Record<ActivityCategory, number> = {} as any;
    activities.forEach(a => {
      categories[a.category as ActivityCategory] = (categories[a.category as ActivityCategory] || 0) + 1;
    });

    // Type distribution
    const types: Record<ActivityType, number> = {} as any;
    activities.forEach(a => {
      types[a.activity_type as ActivityType] = (types[a.activity_type as ActivityType] || 0) + 1;
    });

    // Resource distribution
    const resources: Record<string, number> = {};
    activities.forEach(a => {
      if (a.resource_type) {
        resources[a.resource_type] = (resources[a.resource_type] || 0) + 1;
      }
    });

    // Location distribution
    const locations: Record<string, number> = {};
    activities.forEach(a => {
      if (a.country) {
        locations[a.country] = (locations[a.country] || 0) + 1;
      }
    });

    // Daily trends
    const dailyActivity = this.calculateDailyTrends(activities, startDate, endDate);
    
    // Hourly trends
    const hourlyActivity = this.calculateHourlyTrends(activities);

    // Top activities
    const topActivities = Object.entries(types)
      .map(([type, count]) => ({
        activityType: type as ActivityType,
        count,
        lastOccurrence: new Date(Math.max(...activities
          .filter(a => a.activity_type === type)
          .map(a => new Date(a.timestamp).getTime())
        ))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      userId,
      dateRange: { start: startDate, end: endDate },
      totalActivities,
      uniqueSessions,
      categories,
      types,
      resources,
      locations,
      trends: {
        dailyActivity,
        hourlyActivity
  }
      topActivities
    };
  }

  /**
   * Export user activity data
   */
  async exportActivities(
    userId: string,
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' | 'xml' = 'json',
    options: {
      includeDetails?: boolean;
      anonymize?: boolean;
      includeSummary?: boolean;
    } = {}
  ): Promise<ActivityExport> {

    const query: ActivityQuery = {
      userId,
      startDate,
      endDate,
      limit: 10000 // Large export limit
    };

    const { activities, totalCount } = await this.queryActivities(query);
    
    let processedActivities = activities;
    
    // Apply anonymization if requested
    if (options.anonymize) {
      processedActivities = this.anonymizeActivities(activities);
    }

    // Generate summary if requested
    let summary: ActivitySummary | undefined;
    if (options.includeSummary) {
      summary = await this.getActivitySummary(userId, startDate, endDate);
    }

    const exportData: ActivityExport = {
      userId: options.anonymize ? 'anonymized' : userId,
      exportDate: new Date(),
      totalRecords: totalCount,
      dateRange: { start: startDate, end: endDate },
      format,
      activities: processedActivities,
      summary: summary!,
      privacyInfo: {
        anonymized: options.anonymize || false,
        fieldsRedacted: options.anonymize ? ['userId', 'ipAddress', 'location'] : [],
        retentionPolicy: 'standard_retention'
      }
    };

    // Log the export for audit purposes
    await this.auditService.logAction(userId, 'activity_export', 'data_exported', {
      format,
      recordCount: totalCount,
      dateRange: { start: startDate, end: endDate },
      anonymized: options.anonymize
    });

    return exportData;
  }

  /**
   * Process the batch queue
   */
  private async processBatch(): Promise<void> {

    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      await this.insertActivities(batch);
    } catch (error) {
      console.error('Failed to process activity batch:', error);
      // Could implement retry logic here
    }
  }

  /**
   * Insert activities into database
   */
  private async insertActivities(activities: ActivityRecord[]): Promise<void> {

    if (activities.length === 0) return;

    const query = `
      INSERT INTO activity_history (
        id, user_id, session_id, activity_type, category, action,
        resource_type, resource_id, details, metadata, timestamp,
        ip_address, user_agent, location
      ) VALUES ${activities.map((_, i) => 
    `($${i * 14 + 1}, $${i * 14 + 2}, $${i * 14 + 3}, $${i * 14 + 4}, $${i * 14 + 5}, $${i * 14 + 6}, $${i * 14 + 7}, $${i * 14 + 8}, $${i * 14 + 9}, $${i * 14 + 10}, $${i * 14 + 11}, $${i * 14 + 12}, $${i * 14 + 13}, $${i * 14 + 14})`
  ).join(', ')}
    `;

    const values = activities.flatMap(activity => [
      activity.id,
      activity.userId,
      activity.sessionId,
      activity.activityType,
      activity.category,
      activity.action,
      activity.resourceType,
      activity.resourceId,
      JSON.stringify(activity.details),
      JSON.stringify(activity.metadata),
      activity.timestamp,
      activity.ipAddress,
      activity.userAgent,
      activity.location ? JSON.stringify(activity.location) : null
    ]);

    await this.db.query(query, values);
  }

  /**
   * Helper methods for activity processing
   */
  private generateActivityId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCategoryForActivityType(type: ActivityType): ActivityCategory {
    const categoryMap: Record<ActivityType, ActivityCategory> = {
      [ActivityType.LOGIN]: ActivityCategory.AUTHENTICATION,
      [ActivityType.LOGOUT]: ActivityCategory.AUTHENTICATION,
      [ActivityType.LOGIN_FAILED]: ActivityCategory.AUTHENTICATION,
      [ActivityType.PASSWORD_CHANGE]: ActivityCategory.ACCOUNT_MANAGEMENT,
      [ActivityType.PASSWORD_RESET]: ActivityCategory.ACCOUNT_MANAGEMENT,
      [ActivityType.ACCOUNT_CREATED]: ActivityCategory.ACCOUNT_MANAGEMENT,
      [ActivityType.ACCOUNT_UPDATED]: ActivityCategory.ACCOUNT_MANAGEMENT,
      [ActivityType.ACCOUNT_DELETED]: ActivityCategory.ACCOUNT_MANAGEMENT,
      [ActivityType.PROFILE_UPDATED]: ActivityCategory.ACCOUNT_MANAGEMENT,
      [ActivityType.GRAPH_CREATED]: ActivityCategory.CONTENT_CREATION,
      [ActivityType.GRAPH_UPDATED]: ActivityCategory.CONTENT_MODIFICATION,
      [ActivityType.GRAPH_DELETED]: ActivityCategory.CONTENT_MODIFICATION,
      [ActivityType.GRAPH_EXECUTED]: ActivityCategory.CONTENT_CREATION,
      [ActivityType.GRAPH_SHARED]: ActivityCategory.COLLABORATION,
      [ActivityType.GRAPH_CLONED]: ActivityCategory.CONTENT_CREATION,
      [ActivityType.NODE_CREATED]: ActivityCategory.CONTENT_CREATION,
      [ActivityType.NODE_UPDATED]: ActivityCategory.CONTENT_MODIFICATION,
      [ActivityType.NODE_DELETED]: ActivityCategory.CONTENT_MODIFICATION,
      [ActivityType.NODE_CONNECTED]: ActivityCategory.CONTENT_MODIFICATION,
      [ActivityType.NODE_DISCONNECTED]: ActivityCategory.CONTENT_MODIFICATION,
      [ActivityType.COLLABORATION_JOINED]: ActivityCategory.COLLABORATION,
      [ActivityType.COLLABORATION_LEFT]: ActivityCategory.COLLABORATION,
      [ActivityType.COMMENT_CREATED]: ActivityCategory.COLLABORATION,
      [ActivityType.COMMENT_UPDATED]: ActivityCategory.COLLABORATION,
      [ActivityType.COMMENT_DELETED]: ActivityCategory.COLLABORATION,
      [ActivityType.API_KEY_CREATED]: ActivityCategory.API_USAGE,
      [ActivityType.API_KEY_REVOKED]: ActivityCategory.API_USAGE,
      [ActivityType.API_REQUEST]: ActivityCategory.API_USAGE,
      [ActivityType.SYSTEM_MAINTENANCE]: ActivityCategory.SYSTEM_ADMINISTRATION,
      [ActivityType.DATA_EXPORT]: ActivityCategory.SYSTEM_ADMINISTRATION,
      [ActivityType.DATA_IMPORT]: ActivityCategory.SYSTEM_ADMINISTRATION,
      [ActivityType.SECURITY_VIOLATION]: ActivityCategory.SECURITY,
      [ActivityType.SUSPICIOUS_ACTIVITY]: ActivityCategory.SECURITY,
      [ActivityType.RATE_LIMIT_HIT]: ActivityCategory.SECURITY,
      [ActivityType.CUSTOM]: ActivityCategory.CUSTOM
    };

    return categoryMap[type] || ActivityCategory.CUSTOM;
  }

  private getActionForActivityType(type: ActivityType): string {
    return type.replace(/_/g, ' ');
  }

  private generateActivityTitle(type: ActivityType, details: Omit<ActivityDetails, 'title'>): string {
    const resourceName = details.resourceName || 'item';
    
    switch (type) {
    case ActivityType.LOGIN:
      return 'User logged in';
    case ActivityType.LOGOUT:
      return 'User logged out';
    case ActivityType.GRAPH_CREATED:
      return `Created graph "${resourceName}"`;
    case ActivityType.GRAPH_UPDATED:
      return `Updated graph "${resourceName}"`;
    case ActivityType.GRAPH_DELETED:
      return `Deleted graph "${resourceName}"`;
    case ActivityType.GRAPH_EXECUTED:
      return `Executed graph "${resourceName}"`;
    case ActivityType.NODE_CREATED:
      return 'Added node to graph';
    case ActivityType.NODE_UPDATED:
      return 'Modified node in graph';
    case ActivityType.NODE_DELETED:
      return 'Removed node from graph';
    default:
      return this.getActionForActivityType(type);
    }
  }

  private inferResourceType(resourceName: string): string {
    if (resourceName.toLowerCase().includes('graph')) return 'graph';
    if (resourceName.toLowerCase().includes('node')) return 'node';
    if (resourceName.toLowerCase().includes('user')) return 'user';
    if (resourceName.toLowerCase().includes('api')) return 'api';
    return 'unknown';
  }

  private mapActivityRow(row: any): ActivityRecord {
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      activityType: row.activity_type,
      category: row.category,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      details: JSON.parse(row.details),
      metadata: JSON.parse(row.metadata),
      timestamp: row.timestamp,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      location: row.location ? JSON.parse(row.location) : undefined
    };
  }

  private calculateDailyTrends(activities: any[], startDate: Date, endDate: Date) {
    const dailyMap = new Map();
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { date: dateStr, count: 0, categories: {} });
    }

    // Count activities per day
    activities.forEach(activity => {
      const dateStr = activity.activity_date;
      const dayData = dailyMap.get(dateStr);
      if (dayData) {
        dayData.count++;
        dayData.categories[activity.category] = (dayData.categories[activity.category] || 0) + 1;
      }
    });

    return Array.from(dailyMap.values());
  }

  private calculateHourlyTrends(activities: any[]) {
    const hourlyMap = new Map();
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { hour: i, count: 0 });
    }

    // Count activities per hour
    activities.forEach(activity => {
      const hour = parseInt(activity.activity_hour);
      const hourData = hourlyMap.get(hour);
      if (hourData) {
        hourData.count++;
      }
    });

    return Array.from(hourlyMap.values());
  }

  private anonymizeActivities(activities: ActivityRecord[]): ActivityRecord[] {
    return activities.map(activity => ({
      ...activity,
      userId: 'anonymized',
      ipAddress: undefined,
      location: undefined,
      details: {
        ...activity.details,
        sensitive: undefined
  }
      metadata: {
        ...activity.metadata,
        organizationId: undefined,
        teamId: undefined
      }
    }));
  }

  private setupCleanupInterval(): void {
    // Run cleanup every hour
    setInterval(async () => {
      try {
        await this.cleanupOldActivities();
      } catch (error) {
        console.error('Activity cleanup failed:', error);
      }
    }, 60 * 60 * 1000);
  }

  private async cleanupOldActivities(): Promise<void> {

    // This would implement retention policy cleanup
    // For now, just log that cleanup was attempted
    console.log('Activity cleanup check completed');
  }
}

export default ActivityHistoryService;