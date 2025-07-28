import { UserId, GraphId } from '../../types';

/**
 * Repository interface for event and metrics storage
 */
}
export interface AnalyticsRepository {
  /**
   * Record an analytics event
   */
  recordEvent(event: AnalyticsEvent): Promise<string>;

  /**
   * Get events for a specific user
   */
  getEventsByUser(userId: UserId, options?: QueryOptions): Promise<AnalyticsEvent[]>;

  /**
   * Get events for a specific graph
   */
  getEventsByGraph(graphId: GraphId, options?: QueryOptions): Promise<AnalyticsEvent[]>;

  /**
   * Get events by type
   */
  getEventsByType(eventType: AnalyticsEventType, options?: QueryOptions): Promise<AnalyticsEvent[]>;

  /**
   * Get performance metrics for time-series analysis
   */
  getPerformanceMetrics(options?: PerformanceQueryOptions): Promise<PerformanceMetric[]>;

  /**
   * Get usage statistics for a user
   */
  getUserUsageStats(userId: UserId, timeRange?: TimeRange): Promise<UsageStats>;

  /**
   * Get system-wide analytics summary
   */
  getSystemStats(timeRange?: TimeRange): Promise<SystemStats>;

  /**
   * Delete old events (data retention)
   */
  deleteOldEvents(olderThanDays: number): Promise<number>;
}
}

/**
 * Analytics event types
 */
export enum AnalyticsEventType {
  GRAPH_EXECUTION = 'graph_execution',
  NODE_EXECUTION = 'node_execution',
  USER_INTERACTION = 'user_interaction',
  PERFORMANCE_METRIC = 'performance_metric',
  ERROR = 'error'
}

/**
 * Base analytics event
 */
}
export interface AnalyticsEvent {
  id?: string;
  type: AnalyticsEventType;
  userId?: UserId;
  graphId?: GraphId;
  timestamp: Date;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}
}

/**
 * Performance metric for monitoring
 */
}
export interface PerformanceMetric {
  id: string;
  nodeType: string;
  executionTime: number;
  memoryUsage: number;
  timestamp: Date;
  graphId?: GraphId;
  userId?: UserId;
}
}

/**
 * Query options for filtering events
 */
}
export interface QueryOptions {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  orderBy?: 'timestamp' | 'type';
  orderDirection?: 'asc' | 'desc';
}
}

/**
 * Performance query options
 */
}
export interface PerformanceQueryOptions extends QueryOptions {
  nodeType?: string;
  minExecutionTime?: number;
  maxExecutionTime?: number;
}

/**
 * Time range for statistics
 */
}
export interface TimeRange {
  startDate: Date;
  endDate: Date;
}
}

/**
 * Usage statistics for a user
 */
}
export interface UsageStats {
  totalGraphs: number;
  totalExecutions: number;
  averageExecutionTime: number;
}
  mostUsedNodeTypes: Array<{ nodeType: string; count: number }>;
  timeRange: TimeRange;
}

/**
 * System-wide statistics
 */
}
export interface SystemStats {
  totalUsers: number;
  totalGraphs: number;
  totalExecutions: number;
  averageExecutionTime: number;
}
  topNodeTypes: Array<{ nodeType: string; count: number }>;
  timeRange: TimeRange;
}