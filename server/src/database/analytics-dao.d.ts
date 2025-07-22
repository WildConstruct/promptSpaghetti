import Database from 'better-sqlite3';
import { AnalyticsEvent, AnalyticsEventType } from '../analytics/AnalyticsCollector';
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
/**
 * Project execution statistics for health monitoring
 */
export interface ProjectExecutionStats {
    projectId: string;
    total: number;
    successful: number;
    failed: number;
    averageExecutionTime: number;
    lastExecution?: number;
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
    topGraphTypes: Array<{
        type: string;
        count: number;
    }>;
    topNodeTypes: Array<{
        type: string;
        count: number;
        avgTime: number;
    }>;
    providerUsage: Array<{
        provider: string;
        tokens: number;
        cost: number;
    }>;
    errorBreakdown: Array<{
        type: string;
        count: number;
    }>;
}
/**
 * Data Access Object for analytics data
 */
export declare class AnalyticsDAO {
    private db;
    constructor(database: Database.Database);
    /**
     * Initialize analytics database schema
     */
    initializeSchema(): void;
    /**
     * Create or update analytics session
     */
    upsertSession(session: Partial<AnalyticsSession>): AnalyticsSession;
    /**
     * Store analytics event
     */
    storeEvent(event: AnalyticsEvent): void;
    /**
     * Store graph execution record
     */
    storeGraphExecution(execution: Partial<GraphExecution>): GraphExecution;
    /**
     * Store node execution record
     */
    storeNodeExecution(execution: Partial<NodeExecution>): NodeExecution;
    /**
     * Store token usage record
     */
    storeTokenUsage(usage: Partial<TokenUsage>): TokenUsage;
    /**
     * Store user interaction record
     */
    storeUserInteraction(interaction: Partial<UserInteraction>): UserInteraction;
    /**
     * Get analytics summary for a time period
     */
    getAnalyticsSummary(filters: AnalyticsFilters): AnalyticsSummary;
    /**
     * Get time-series data for analytics dashboard
     */
    getTimeSeriesData(metric: string, granularity: 'hour' | 'day', filters: AnalyticsFilters): Array<{
        timestamp: number;
        value: number;
    }>;
    /**
     * Get heat map data for canvas interactions
     */
    getHeatMapData(filters: AnalyticsFilters): Array<{
        x: number;
        y: number;
        intensity: number;
    }>;
    /**
     * Update aggregation tables (should be run periodically)
     */
    updateAggregations(): void;
    /**
     * Get events by filter criteria
     */
    getEvents(filters: AnalyticsFilters): AnalyticsEvent[];
    /**
     * Delete old analytics data beyond retention period
     */
    cleanupOldData(retentionDays?: number): number;
    /**
     * Build WHERE clause for filtering
     */
    private buildWhereClause;
    /**
     * Build parameters array for WHERE clause
     */
    private buildWhereParams;
    /**
     * Get event category from event type
     */
    private getEventCategory;
    /**
     * Get event severity from event type
     */
    private getEventSeverity;
    /**
     * Get project execution statistics for health monitoring
     */
    getProjectExecutions(projectId: string, days?: number): ProjectExecutionStats;
    /**
     * Get user activity statistics for a project
     */
    getProjectUserActivity(projectId: string, days?: number): Array<{
        userId: number;
        activityCount: number;
        lastActivity: number;
        errorRate: number;
    }>;
    /**
     * Get activity timeline for a project
     */
    getProjectActivityTimeline(projectId: string, days?: number): Array<{
        date: string;
        activityCount: number;
        uniqueUsers: number;
        errorCount: number;
    }>;
    /**
     * Get collaboration patterns for a project
     */
    getProjectCollaborationStats(projectId: string, days?: number): {
        totalCollaborativeSessions: number;
        averageSessionParticipants: number;
        collaborationRate: number;
        topCollaborators: Array<{
            userId: number;
            collaborationCount: number;
        }>;
    };
    /**
     * Get project health score based on multiple metrics
     */
    getProjectHealthScore(projectId: string): {
        score: number;
        factors: {
            activityLevel: number;
            errorRate: number;
            collaborationLevel: number;
            userEngagement: number;
        };
        recommendation: string;
    };
}
//# sourceMappingURL=analytics-dao.d.ts.map