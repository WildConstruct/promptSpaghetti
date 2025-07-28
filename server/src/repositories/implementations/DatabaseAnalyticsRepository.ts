import Database from 'better-sqlite3';
import { 
  AnalyticsRepository, 
  AnalyticsEvent, 
  AnalyticsEventType, 
  PerformanceMetric, 
  QueryOptions, 
  PerformanceQueryOptions, 
  TimeRange, 
  UsageStats, 
  SystemStats 
} from '../interfaces/AnalyticsRepository';
import { UserId, GraphId } from '../../types';

/**
 * Database implementation of AnalyticsRepository with time-series data optimization
 */
export class DatabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private db: Database.Database) {}

  async recordEvent(event: AnalyticsEvent): Promise<string> {

    const eventId = this.generateEventId();
    const stmt = this.db.prepare(`
      INSERT INTO analytics_events (id, type, user_id, graph_id, timestamp, data, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      eventId,
      event.type,
      event.userId || null,
      event.graphId || null,
      event.timestamp.getTime(),
      JSON.stringify(event.data),
      JSON.stringify(event.metadata || {})
    );
    
    return eventId;
  }

  async getEventsByUser(userId: UserId, options?: QueryOptions): Promise<AnalyticsEvent[]> {

    const { query, params } = this.buildQuery('user_id = ?', [userId], options);
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(this.mapRowToEvent);
  }

  async getEventsByGraph(graphId: GraphId, options?: QueryOptions): Promise<AnalyticsEvent[]> {

    const { query, params } = this.buildQuery('graph_id = ?', [graphId], options);
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(this.mapRowToEvent);
  }

  async getEventsByType(eventType: AnalyticsEventType, options?: QueryOptions): Promise<AnalyticsEvent[]> {

    const { query, params } = this.buildQuery('type = ?', [eventType], options);
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(this.mapRowToEvent);
  }

  async getPerformanceMetrics(options?: PerformanceQueryOptions): Promise<PerformanceMetric[]> {

    let whereClause = 'type = ?';
    const params: any[] = [AnalyticsEventType.PERFORMANCE_METRIC];
    
    if (options?.nodeType) {
      whereClause += ' AND JSON_EXTRACT(data, "$.nodeType") = ?';
      params.push(options.nodeType);
    }
    
    if (options?.minExecutionTime) {
      whereClause += ' AND JSON_EXTRACT(data, "$.executionTime") >= ?';
      params.push(options.minExecutionTime);
    }
    
    if (options?.maxExecutionTime) {
      whereClause += ' AND JSON_EXTRACT(data, "$.executionTime") <= ?';
      params.push(options.maxExecutionTime);
    }
    
    const { query } = this.buildQuery(whereClause, params, options);
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(row => {
      const data = JSON.parse(row.data);
      return {
        id: row.id,
        nodeType: data.nodeType,
        executionTime: data.executionTime,
        memoryUsage: data.memoryUsage,
        timestamp: new Date(row.timestamp),
        graphId: row.graph_id,
        userId: row.user_id
      };
    });
  }

  async getUserUsageStats(userId: UserId, timeRange?: TimeRange): Promise<UsageStats> {

    const timeClause = timeRange ? 
      'AND timestamp BETWEEN ? AND ?' : '';
    const timeParams = timeRange ? 
      [timeRange.startDate.getTime(), timeRange.endDate.getTime()] : [];
    
    // Get total graphs
    const graphsStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT graph_id) as count 
      FROM analytics_events 
      WHERE user_id = ? AND type = ? ${timeClause}
    `);
    const graphsResult = graphsStmt.get(userId, AnalyticsEventType.GRAPH_EXECUTION, ...timeParams) as any;
    
    // Get total executions
    const executionsStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM analytics_events 
      WHERE user_id = ? AND type = ? ${timeClause}
    `);
    const executionsResult = executionsStmt.get(userId, AnalyticsEventType.GRAPH_EXECUTION, ...timeParams) as any;
    
    // Get average execution time
    const avgTimeStmt = this.db.prepare(`
      SELECT AVG(JSON_EXTRACT(data, '$.executionTime')) as avg_time
      FROM analytics_events 
      WHERE user_id = ? AND type = ? ${timeClause}
    `);
    const avgTimeResult = avgTimeStmt.get(userId, AnalyticsEventType.PERFORMANCE_METRIC, ...timeParams) as any;
    
    // Get most used node types
    const nodeTypesStmt = this.db.prepare(`
      SELECT JSON_EXTRACT(data, '$.nodeType') as node_type, COUNT(*) as count
      FROM analytics_events 
      WHERE user_id = ? AND type = ? ${timeClause}
      GROUP BY JSON_EXTRACT(data, '$.nodeType')
      ORDER BY count DESC
      LIMIT 10
    `);
    const nodeTypesResult = nodeTypesStmt.all(userId, AnalyticsEventType.NODE_EXECUTION, ...timeParams) as any[];
    
    return {
      totalGraphs: graphsResult?.count || 0,
      totalExecutions: executionsResult?.count || 0,
      averageExecutionTime: avgTimeResult?.avg_time || 0,
      mostUsedNodeTypes: nodeTypesResult.map(row => ({
        nodeType: row.node_type,
        count: row.count
      })),
      timeRange: timeRange || {
        startDate: new Date(0),
        endDate: new Date(}
    };
  }

  async getSystemStats(timeRange?: TimeRange): Promise<SystemStats> {

    const timeClause = timeRange ? 
      'WHERE timestamp BETWEEN ? AND ?' : '';
    const timeParams = timeRange ? 
      [timeRange.startDate.getTime(), timeRange.endDate.getTime()] : [];
    
    // Get total users
    const usersStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM analytics_events 
      ${timeClause}
    `);
    const usersResult = usersStmt.get(...timeParams) as any;
    
    // Get total graphs
    const graphsStmt = this.db.prepare(`
      SELECT COUNT(DISTINCT graph_id) as count 
      FROM analytics_events 
      ${timeClause}
    `);
    const graphsResult = graphsStmt.get(...timeParams) as any;
    
    // Get total executions
    const executionsStmt = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM analytics_events 
      WHERE type = ? ${timeRange ? 'AND timestamp BETWEEN ? AND ?' : ''}
    `);
    const executionsParams = [AnalyticsEventType.GRAPH_EXECUTION, ...timeParams];
    const executionsResult = executionsStmt.get(...executionsParams) as any;
    
    // Get average execution time
    const avgTimeStmt = this.db.prepare(`
      SELECT AVG(JSON_EXTRACT(data, '$.executionTime')) as avg_time
      FROM analytics_events 
      WHERE type = ? ${timeRange ? 'AND timestamp BETWEEN ? AND ?' : ''}
    `);
    const avgTimeParams = [AnalyticsEventType.PERFORMANCE_METRIC, ...timeParams];
    const avgTimeResult = avgTimeStmt.get(...avgTimeParams) as any;
    
    // Get top node types
    const nodeTypesStmt = this.db.prepare(`
      SELECT JSON_EXTRACT(data, '$.nodeType') as node_type, COUNT(*) as count
      FROM analytics_events 
      WHERE type = ? ${timeRange ? 'AND timestamp BETWEEN ? AND ?' : ''}
      GROUP BY JSON_EXTRACT(data, '$.nodeType')
      ORDER BY count DESC
      LIMIT 10
    `);
    const nodeTypesParams = [AnalyticsEventType.NODE_EXECUTION, ...timeParams];
    const nodeTypesResult = nodeTypesStmt.all(...nodeTypesParams) as any[];
    
    return {
      totalUsers: usersResult?.count || 0,
      totalGraphs: graphsResult?.count || 0,
      totalExecutions: executionsResult?.count || 0,
      averageExecutionTime: avgTimeResult?.avg_time || 0,
      topNodeTypes: nodeTypesResult.map(row => ({
        nodeType: row.node_type,
        count: row.count
      })),
      timeRange: timeRange || {
        startDate: new Date(0),
        endDate: new Date(}
    };
  }

  async deleteOldEvents(olderThanDays: number): Promise<number> {

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const stmt = this.db.prepare('DELETE FROM analytics_events WHERE timestamp < ?');
    const result = stmt.run(cutoffTime);
    return result.changes;
  }

  private buildQuery(
    whereClause: string,
    whereParams: any[],
    options?: QueryOptions
  ): { query: string; params: any[] } {
    let query = `
      SELECT id, type, user_id, graph_id, timestamp, data, metadata
      FROM analytics_events
      WHERE ${whereClause}
    `;
    
    const params = [...whereParams];
    
    if (options?.startDate) {
      query += ' AND timestamp >= ?';
      params.push(options.startDate.getTime());
    }
    
    if (options?.endDate) {
      query += ' AND timestamp <= ?';
      params.push(options.endDate.getTime());
    }
    
    const orderBy = options?.orderBy || 'timestamp';
    const orderDirection = options?.orderDirection || 'desc';
    query += ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`;
    
    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
    
    return { query, params };
  }

  private mapRowToEvent(row: any): AnalyticsEvent {
    return {
      id: row.id,
      type: row.type as AnalyticsEventType,
      userId: row.user_id,
      graphId: row.graph_id,
      timestamp: new Date(row.timestamp),
      data: JSON.parse(row.data),
      metadata: JSON.parse(row.metadata)
    };
  }

  private generateEventId(): string {
    return 'event_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}