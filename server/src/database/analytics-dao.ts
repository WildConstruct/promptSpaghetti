import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { 
  AnalyticsEvent, 
  AnalyticsEventType, 
  GraphExecutionEvent,
  NodeExecutionEvent,
  TokenUsageEvent,
  UserInteractionEvent,
  PerformanceMetricEvent,
  AnalyticsWindow 
} from '../analytics/AnalyticsCollector';

/**
 * Database models for analytics data
 */
export interface AnalyticsSession {
  id: number;
  sessionId: string;
  userId?: number;
  organizationId?: number;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  userAgent?: string;
  platform?: string;
  totalEvents: number;
  graphsExecuted: number;
  nodesCreated: number;
  errorsEncountered: number;
  createdAt: number;
  updatedAt: number;
}

export interface GraphExecution {
  id: number;
  executionId: string;
  graphId: string;
  sessionId: string;
  userId?: number;
  startTime: number;
  endTime?: number;
  executionTimeMs?: number;
  nodeCount: number;
  connectionCount: number;
  graphComplexityScore: number;
  success: boolean;
  errorMessage?: string;
  outputLength?: number;
  seedValue?: number;
  memoryUsageMb?: number;
  cpuTimeMs?: number;
  createdAt: number;
}

export interface NodeExecution {
  id: number;
  executionId: string;
  nodeId: string;
  nodeType: string;
  graphExecutionId: number;
  startTime: number;
  endTime?: number;
  executionTimeMs?: number;
  inputSizeBytes?: number;
  outputSizeBytes?: number;
  success: boolean;
  errorMessage?: string;
  memoryDeltaMb?: number;
  createdAt: number;
}

export interface TokenUsage {
  id: number;
  usageId: string;
  sessionId: string;
  userId?: number;
  organizationId?: number;
  provider: string;
  model: string;
  apiEndpoint?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  costPerToken?: number;
  nodeId?: string;
  graphId?: string;
  executionId?: string;
  requestStart: number;
  requestEnd?: number;
  latencyMs?: number;
  createdAt: number;
}

export interface UserInteraction {
  id: number;
  interactionId: string;
  sessionId: string;
  userId?: number;
  interactionType: string;
  timestamp: number;
  component?: string;
  elementId?: string;
  graphId?: string;
  nodeId?: string;
  canvasX?: number;
  canvasY?: number;
  viewportX?: number;
  viewportY?: number;
  metadata: string;
  createdAt: number;
}

export interface AnalyticsAggregation {
  id: number;
  timeBucket: number;
  userId?: number;
  organizationId?: number;
  totalEvents: number;
  uniqueSessions: number;
  graphsExecuted: number;
  nodesExecuted: number;
  avgExecutionTimeMs: number;
  p95ExecutionTimeMs: number;
  totalTokenUsage: number;
  totalCostUsd: number;
  successRate: number;
  errorCount: number;
  createdAt: number;
}

/**
 * Analytics query filters
 */
export interface AnalyticsFilters {
  startTime?: number;
  endTime?: number;
  userId?: number;
  organizationId?: number;
  sessionId?: string;
  eventTypes?: AnalyticsEventType[];
  graphId?: string;
  nodeType?: string;
  provider?: string;
  successOnly?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Analytics summary data
 */
export interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  totalGraphExecutions: number;
  totalNodeExecutions: number;
  totalTokenUsage: number;
  totalCost: number;
  averageExecutionTime: number;
  successRate: number;
  topGraphTypes: Array<{ type: string; count: number }>;
  topNodeTypes: Array<{ type: string; count: number; avgTime: number }>;
  providerUsage: Array<{ provider: string; tokens: number; cost: number }>;
  errorBreakdown: Array<{ type: string; count: number }>;
}

/**
 * Data Access Object for analytics data
 */
export class AnalyticsDAO {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
  }

  /**
   * Initialize analytics database schema
   */
  initializeSchema(): void {
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, 'analytics-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute schema SQL
    this.db.exec(schema);
    
    console.log('Analytics database schema initialized');
  }

  /**
   * Create or update analytics session
   */
  upsertSession(session: Partial<AnalyticsSession>): AnalyticsSession {
    const stmt = this.db.prepare(`
      INSERT INTO analytics_sessions (
        session_id, user_id, organization_id, start_time, end_time, duration_ms,
        user_agent, platform, total_events, graphs_executed, nodes_created, 
        errors_encountered, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (session_id) DO UPDATE SET
        end_time = excluded.end_time,
        duration_ms = excluded.duration_ms,
        total_events = excluded.total_events,
        graphs_executed = excluded.graphs_executed,
        nodes_created = excluded.nodes_created,
        errors_encountered = excluded.errors_encountered,
        updated_at = excluded.updated_at
      RETURNING *
    `);

    const now = Date.now();
    const result = stmt.get(
      session.sessionId,
      session.userId,
      session.organizationId,
      session.startTime,
      session.endTime,
      session.durationMs,
      session.userAgent,
      session.platform,
      session.totalEvents || 0,
      session.graphsExecuted || 0,
      session.nodesCreated || 0,
      session.errorsEncountered || 0,
      now
    );

    return result as AnalyticsSession;
  }

  /**
   * Store analytics event
   */
  storeEvent(event: AnalyticsEvent): void {
    const stmt = this.db.prepare(`
      INSERT INTO analytics_events (
        event_id, event_type, timestamp, session_id, user_id, organization_id,
        metadata, category, severity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Determine category and severity from event type
    const category = this.getEventCategory(event.type);
    const severity = this.getEventSeverity(event.type);

    stmt.run(
      event.id,
      event.type,
      event.timestamp,
      event.sessionId,
      event.userId,
      event.organizationId,
      JSON.stringify(event.metadata),
      category,
      severity
    );
  }

  /**
   * Store graph execution record
   */
  storeGraphExecution(execution: Partial<GraphExecution>): GraphExecution {
    const stmt = this.db.prepare(`
      INSERT INTO graph_executions (
        execution_id, graph_id, session_id, user_id, start_time, end_time,
        execution_time_ms, node_count, connection_count, graph_complexity_score,
        success, error_message, output_length, seed_value, memory_usage_mb, cpu_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);

    const result = stmt.get(
      execution.executionId || uuidv4(),
      execution.graphId,
      execution.sessionId,
      execution.userId,
      execution.startTime,
      execution.endTime,
      execution.executionTimeMs,
      execution.nodeCount,
      execution.connectionCount,
      execution.graphComplexityScore || 1.0,
      execution.success,
      execution.errorMessage,
      execution.outputLength,
      execution.seedValue,
      execution.memoryUsageMb,
      execution.cpuTimeMs
    );

    return result as GraphExecution;
  }

  /**
   * Store node execution record
   */
  storeNodeExecution(execution: Partial<NodeExecution>): NodeExecution {
    const stmt = this.db.prepare(`
      INSERT INTO node_executions (
        execution_id, node_id, node_type, graph_execution_id, start_time, end_time,
        execution_time_ms, input_size_bytes, output_size_bytes, success, 
        error_message, memory_delta_mb
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);

    const result = stmt.get(
      execution.executionId || uuidv4(),
      execution.nodeId,
      execution.nodeType,
      execution.graphExecutionId,
      execution.startTime,
      execution.endTime,
      execution.executionTimeMs,
      execution.inputSizeBytes,
      execution.outputSizeBytes,
      execution.success,
      execution.errorMessage,
      execution.memoryDeltaMb
    );

    return result as NodeExecution;
  }

  /**
   * Store token usage record
   */
  storeTokenUsage(usage: Partial<TokenUsage>): TokenUsage {
    const stmt = this.db.prepare(`
      INSERT INTO token_usage (
        usage_id, session_id, user_id, organization_id, provider, model,
        api_endpoint, prompt_tokens, completion_tokens, total_tokens,
        estimated_cost_usd, cost_per_token, node_id, graph_id, execution_id,
        request_start, request_end, latency_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);

    const result = stmt.get(
      usage.usageId || uuidv4(),
      usage.sessionId,
      usage.userId,
      usage.organizationId,
      usage.provider,
      usage.model,
      usage.apiEndpoint,
      usage.promptTokens,
      usage.completionTokens,
      usage.totalTokens,
      usage.estimatedCostUsd,
      usage.costPerToken,
      usage.nodeId,
      usage.graphId,
      usage.executionId,
      usage.requestStart,
      usage.requestEnd,
      usage.latencyMs
    );

    return result as TokenUsage;
  }

  /**
   * Store user interaction record
   */
  storeUserInteraction(interaction: Partial<UserInteraction>): UserInteraction {
    const stmt = this.db.prepare(`
      INSERT INTO user_interactions (
        interaction_id, session_id, user_id, interaction_type, timestamp,
        component, element_id, graph_id, node_id, canvas_x, canvas_y,
        viewport_x, viewport_y, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `);

    const result = stmt.get(
      interaction.interactionId || uuidv4(),
      interaction.sessionId,
      interaction.userId,
      interaction.interactionType,
      interaction.timestamp,
      interaction.component,
      interaction.elementId,
      interaction.graphId,
      interaction.nodeId,
      interaction.canvasX,
      interaction.canvasY,
      interaction.viewportX,
      interaction.viewportY,
      interaction.metadata || '{}'
    );

    return result as UserInteraction;
  }

  /**
   * Get analytics summary for a time period
   */
  getAnalyticsSummary(filters: AnalyticsFilters): AnalyticsSummary {
    const whereClause = this.buildWhereClause(filters);
    
    // Get basic metrics
    const basicMetrics = this.db.prepare(`
      SELECT 
        COUNT(*) as totalEvents,
        COUNT(DISTINCT user_id) as uniqueUsers,
        COUNT(DISTINCT session_id) as uniqueSessions
      FROM analytics_events 
      ${whereClause}
    `).get(this.buildWhereParams(filters));

    // Get execution metrics
    const execMetrics = this.db.prepare(`
      SELECT 
        COUNT(*) as totalGraphExecutions,
        AVG(execution_time_ms) as averageExecutionTime,
        (SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as successRate
      FROM graph_executions 
      WHERE start_time >= ? AND start_time <= ?
    `).get(filters.startTime || 0, filters.endTime || Date.now());

    // Get node execution count
    const nodeMetrics = this.db.prepare(`
      SELECT COUNT(*) as totalNodeExecutions
      FROM node_executions 
      WHERE start_time >= ? AND start_time <= ?
    `).get(filters.startTime || 0, filters.endTime || Date.now());

    // Get token usage metrics
    const tokenMetrics = this.db.prepare(`
      SELECT 
        COALESCE(SUM(total_tokens), 0) as totalTokenUsage,
        COALESCE(SUM(estimated_cost_usd), 0) as totalCost
      FROM token_usage 
      WHERE request_start >= ? AND request_start <= ?
    `).get(filters.startTime || 0, filters.endTime || Date.now());

    // Get top node types
    const topNodeTypes = this.db.prepare(`
      SELECT 
        node_type as type, 
        COUNT(*) as count,
        AVG(execution_time_ms) as avgTime
      FROM node_executions 
      WHERE start_time >= ? AND start_time <= ?
      GROUP BY node_type 
      ORDER BY count DESC 
      LIMIT 10
    `).all(filters.startTime || 0, filters.endTime || Date.now());

    // Get provider usage
    const providerUsage = this.db.prepare(`
      SELECT 
        provider,
        SUM(total_tokens) as tokens,
        SUM(estimated_cost_usd) as cost
      FROM token_usage 
      WHERE request_start >= ? AND request_start <= ?
      GROUP BY provider 
      ORDER BY cost DESC
    `).all(filters.startTime || 0, filters.endTime || Date.now());

    // Get error breakdown
    const errorBreakdown = this.db.prepare(`
      SELECT 
        event_type as type,
        COUNT(*) as count
      FROM analytics_events 
      WHERE event_type LIKE '%error%' 
        AND timestamp >= ? AND timestamp <= ?
      GROUP BY event_type 
      ORDER BY count DESC
    `).all(filters.startTime || 0, filters.endTime || Date.now());

    return {
      totalEvents: basicMetrics.totalEvents || 0,
      uniqueUsers: basicMetrics.uniqueUsers || 0,
      uniqueSessions: basicMetrics.uniqueSessions || 0,
      totalGraphExecutions: execMetrics.totalGraphExecutions || 0,
      totalNodeExecutions: nodeMetrics.totalNodeExecutions || 0,
      totalTokenUsage: tokenMetrics.totalTokenUsage || 0,
      totalCost: tokenMetrics.totalCost || 0,
      averageExecutionTime: execMetrics.averageExecutionTime || 0,
      successRate: execMetrics.successRate || 100,
      topGraphTypes: [], // Would need graph type tracking
      topNodeTypes: topNodeTypes || [],
      providerUsage: providerUsage || [],
      errorBreakdown: errorBreakdown || []
    };
  }

  /**
   * Get time-series data for analytics dashboard
   */
  getTimeSeriesData(
    metric: string, 
    granularity: 'hour' | 'day', 
    filters: AnalyticsFilters
  ): Array<{ timestamp: number; value: number }> {
    let query: string;
    const timeField = granularity === 'hour' ? 'hour_bucket' : 'date_bucket';
    const table = granularity === 'hour' ? 'analytics_hourly' : 'analytics_daily';
    
    switch (metric) {
    case 'executions':
      query = `
          SELECT ${timeField} as timestamp, graphs_executed as value
          FROM ${table}
          WHERE ${timeField} >= ? AND ${timeField} <= ?
          ORDER BY ${timeField}
        `;
      break;
        
    case 'tokens':
      query = `
          SELECT ${timeField} as timestamp, total_token_usage as value
          FROM ${table}
          WHERE ${timeField} >= ? AND ${timeField} <= ?
          ORDER BY ${timeField}
        `;
      break;
        
    case 'cost':
      query = `
          SELECT ${timeField} as timestamp, total_cost_usd as value
          FROM ${table}
          WHERE ${timeField} >= ? AND ${timeField} <= ?
          ORDER BY ${timeField}
        `;
      break;
        
    case 'errors':
      query = `
          SELECT ${timeField} as timestamp, error_count as value
          FROM ${table}
          WHERE ${timeField} >= ? AND ${timeField} <= ?
          ORDER BY ${timeField}
        `;
      break;
        
    default:
      throw new Error(`Unknown metric: ${metric}`);
    }

    return this.db.prepare(query).all(
      filters.startTime || 0, 
      filters.endTime || Date.now()
    );
  }

  /**
   * Get heat map data for canvas interactions
   */
  getHeatMapData(filters: AnalyticsFilters): Array<{ x: number; y: number; intensity: number }> {
    const whereClause = this.buildWhereClause(filters, 'user_interactions');
    
    const heatMapData = this.db.prepare(`
      SELECT 
        ROUND(canvas_x / 50) * 50 as x,
        ROUND(canvas_y / 50) * 50 as y,
        COUNT(*) as intensity
      FROM user_interactions 
      ${whereClause}
        AND canvas_x IS NOT NULL 
        AND canvas_y IS NOT NULL
      GROUP BY x, y
      HAVING intensity > 1
      ORDER BY intensity DESC
      LIMIT 1000
    `).all(this.buildWhereParams(filters));

    return heatMapData;
  }

  /**
   * Update aggregation tables (should be run periodically)
   */
  updateAggregations(): void {
    // Update hourly aggregations
    this.db.prepare(`
      INSERT OR REPLACE INTO analytics_hourly (
        hour_bucket, user_id, organization_id, total_events, unique_sessions,
        graphs_executed, nodes_executed, avg_execution_time_ms, p95_execution_time_ms,
        total_token_usage, total_cost_usd, success_rate, error_count
      )
      SELECT 
        datetime(timestamp / 1000, 'unixepoch', 'start of hour') as hour_bucket,
        user_id,
        organization_id,
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as unique_sessions,
        0 as graphs_executed,
        0 as nodes_executed,
        0 as avg_execution_time_ms,
        0 as p95_execution_time_ms,
        0 as total_token_usage,
        0 as total_cost_usd,
        100.0 as success_rate,
        SUM(CASE WHEN event_type LIKE '%error%' THEN 1 ELSE 0 END) as error_count
      FROM analytics_events
      WHERE timestamp >= (strftime('%s', 'now', '-24 hours') * 1000)
      GROUP BY hour_bucket, user_id, organization_id
    `).run();

    // Update daily aggregations
    this.db.prepare(`
      INSERT OR REPLACE INTO analytics_daily (
        date_bucket, user_id, organization_id, total_events, unique_sessions,
        active_users, graphs_executed, nodes_executed, avg_execution_time_ms,
        p95_execution_time_ms, total_token_usage, total_cost_usd, success_rate, error_count
      )
      SELECT 
        date(timestamp / 1000, 'unixepoch') as date_bucket,
        user_id,
        organization_id,
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT user_id) as active_users,
        0 as graphs_executed,
        0 as nodes_executed,
        0 as avg_execution_time_ms,
        0 as p95_execution_time_ms,
        0 as total_token_usage,
        0 as total_cost_usd,
        100.0 as success_rate,
        SUM(CASE WHEN event_type LIKE '%error%' THEN 1 ELSE 0 END) as error_count
      FROM analytics_events
      WHERE timestamp >= (strftime('%s', 'now', '-30 days') * 1000)
      GROUP BY date_bucket, user_id, organization_id
    `).run();

    console.log('Analytics aggregations updated');
  }

  /**
   * Get events by filter criteria
   */
  getEvents(filters: AnalyticsFilters): AnalyticsEvent[] {
    const whereClause = this.buildWhereClause(filters);
    const params = this.buildWhereParams(filters);
    
    let limitClause = '';
    if (filters.limit) {
      limitClause = `LIMIT ${filters.limit}`;
      if (filters.offset) {
        limitClause += ` OFFSET ${filters.offset}`;
      }
    }

    const events = this.db.prepare(`
      SELECT * FROM analytics_events 
      ${whereClause}
      ORDER BY timestamp DESC
      ${limitClause}
    `).all(params);

    return events.map(row => ({
      id: row.event_id,
      type: row.event_type,
      timestamp: row.timestamp,
      sessionId: row.session_id,
      userId: row.user_id,
      organizationId: row.organization_id,
      metadata: JSON.parse(row.metadata)
    }));
  }

  /**
   * Delete old analytics data beyond retention period
   */
  cleanupOldData(retentionDays: number = 30): number {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    const tables = [
      'analytics_events',
      'graph_executions', 
      'node_executions',
      'token_usage',
      'user_interactions',
      'performance_metrics',
      'error_analytics'
    ];

    let totalDeleted = 0;
    
    tables.forEach(table => {
      const timeField = table === 'analytics_events' ? 'timestamp' : 
        table.includes('executions') ? 'start_time' :
          table === 'token_usage' ? 'request_start' :
            table === 'user_interactions' ? 'timestamp' :
              table === 'performance_metrics' ? 'timestamp' :
                'timestamp';

      const result = this.db.prepare(`
        DELETE FROM ${table} WHERE ${timeField} < ?
      `).run(cutoffTime);
      
      totalDeleted += result.changes;
    });

    console.log(`Cleaned up ${totalDeleted} old analytics records`);
    return totalDeleted;
  }

  /**
   * Build WHERE clause for filtering
   */
  private buildWhereClause(filters: AnalyticsFilters, tableName = 'analytics_events'): string {
    const conditions: string[] = [];
    
    if (filters.startTime !== undefined) {
      const timeField = tableName === 'user_interactions' ? 'timestamp' : 
        tableName.includes('executions') ? 'start_time' :
          tableName === 'token_usage' ? 'request_start' :
            'timestamp';
      conditions.push(`${timeField} >= ?`);
    }
    
    if (filters.endTime !== undefined) {
      const timeField = tableName === 'user_interactions' ? 'timestamp' : 
        tableName.includes('executions') ? 'start_time' :
          tableName === 'token_usage' ? 'request_start' :
            'timestamp';
      conditions.push(`${timeField} <= ?`);
    }
    
    if (filters.userId !== undefined) {
      conditions.push('user_id = ?');
    }
    
    if (filters.sessionId !== undefined) {
      conditions.push('session_id = ?');
    }
    
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      const placeholders = filters.eventTypes.map(() => '?').join(', ');
      conditions.push(`event_type IN (${placeholders})`);
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  /**
   * Build parameters array for WHERE clause
   */
  private buildWhereParams(filters: AnalyticsFilters): any[] {
    const params: any[] = [];
    
    if (filters.startTime !== undefined) params.push(filters.startTime);
    if (filters.endTime !== undefined) params.push(filters.endTime);
    if (filters.userId !== undefined) params.push(filters.userId);
    if (filters.sessionId !== undefined) params.push(filters.sessionId);
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      params.push(...filters.eventTypes);
    }
    
    return params;
  }

  /**
   * Get event category from event type
   */
  private getEventCategory(eventType: AnalyticsEventType): string {
    if (eventType.includes('execution')) return 'execution';
    if (eventType.includes('user') || eventType.includes('interaction')) return 'user';
    if (eventType.includes('performance') || eventType.includes('token')) return 'performance';
    if (eventType.includes('error')) return 'error';
    return 'general';
  }

  /**
   * Get event severity from event type
   */
  private getEventSeverity(eventType: AnalyticsEventType): string {
    if (eventType.includes('error')) return 'error';
    if (eventType.includes('warning')) return 'warning';
    return 'info';
  }
}