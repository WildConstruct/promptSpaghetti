/**
 * Event Persistence Layer - Story 1.5 Task 2
 *
 * Implements event persistence using repository pattern from Story 1.4
 * with comprehensive event storage, retrieval, and management capabilities.
 */
import { z } from 'zod';
import { UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
export declare const StoredEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    category: z.ZodString;
    severity: z.ZodString;
    timestamp: z.ZodNumber;
    source: z.ZodString;
    version: z.ZodString;
    sessionId: z.ZodNullable<z.ZodString>;
    userId: z.ZodNullable<z.ZodString>;
    organizationId: z.ZodNullable<z.ZodString>;
    requestId: z.ZodNullable<z.ZodString>;
    traceId: z.ZodNullable<z.ZodString>;
    data: z.ZodString;
    metadata: z.ZodString;
    tags: z.ZodString;
    environment: z.ZodString;
    region: z.ZodNullable<z.ZodString>;
    storedAt: z.ZodNumber;
    retentionDate: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    data?: string;
    type?: string;
    category?: string;
    tags?: string;
    version?: string;
    timestamp?: number;
    metadata?: string;
    source?: string;
    userId?: string;
    region?: string;
    environment?: string;
    sessionId?: string;
    requestId?: string;
    severity?: string;
    organizationId?: string;
    traceId?: string;
    storedAt?: number;
    retentionDate?: number;
}, {
    id?: string;
    data?: string;
    type?: string;
    category?: string;
    tags?: string;
    version?: string;
    timestamp?: number;
    metadata?: string;
    source?: string;
    userId?: string;
    region?: string;
    environment?: string;
    sessionId?: string;
    requestId?: string;
    severity?: string;
    organizationId?: string;
    traceId?: string;
    storedAt?: number;
    retentionDate?: number;
}>;
export type StoredEvent = z.infer<typeof StoredEventSchema>;
export interface EventQueryOptions {
    filter?: EventFilter;
    sortBy?: 'timestamp' | 'type' | 'severity' | 'source';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    includeMetadata?: boolean;
}
export interface EventStatistics {
    totalEvents: number;
    eventsByType: {
        [type: string]: number;
    };
    eventsByCategory: {
        [category: string]: number;
    };
    eventsBySeverity: {
        [severity: string]: number;
    };
    eventsBySource: {
        [source: string]: number;
    };
    timeRange: {
        earliest: number;
        latest: number;
    };
    storageSize: number;
}
export interface EventAggregation {
    groupBy: string;
    timeGranularity?: 'hour' | 'day' | 'week' | 'month';
    aggregates: {
        count: number;
        firstSeen: number;
        lastSeen: number;
        uniqueSources: number;
        uniqueUsers: number;
        uniqueSessions: number;
    };
}
/**
 * Event Repository Interface
 *
 * Following repository pattern from Story 1.4 for consistent data access
 */
export interface EventRepository {
    save(event: UnifiedAnalyticsEvent): Promise<string>;
    saveBatch(events: UnifiedAnalyticsEvent[]): Promise<string[]>;
    findById(id: string): Promise<UnifiedAnalyticsEvent | null>;
    findMany(options: EventQueryOptions): Promise<UnifiedAnalyticsEvent[]>;
    count(filter?: EventFilter): Promise<number>;
    delete(id: string): Promise<boolean>;
    deleteBatch(ids: string[]): Promise<number>;
    getStatistics(filter?: EventFilter): Promise<EventStatistics>;
    getAggregations(groupBy: string, filter?: EventFilter): Promise<EventAggregation[]>;
    getTimeSeriesData(metric: string, granularity: string, filter?: EventFilter): Promise<Array<{
        timestamp: number;
        value: number;
    }>>;
    cleanup(retentionDays: number): Promise<number>;
    archive(beforeDate: number): Promise<number>;
    optimize(): Promise<void>;
}
/**
 * Database Event Repository Implementation
 *
 * SQLite-based implementation for production use
 */
export declare class DatabaseEventRepository implements EventRepository {
    private db;
    private tableName;
    constructor(database: any);
    /**
     * Initialize database schema
     */
    private initializeSchema;
    /**
     * Save single event
     */
    save(event: UnifiedAnalyticsEvent): Promise<string>;
    /**
     * Save batch of events
     */
    saveBatch(events: UnifiedAnalyticsEvent[]): Promise<string[]>;
    /**
     * Find event by ID
     */
    findById(id: string): Promise<UnifiedAnalyticsEvent | null>;
    /**
     * Find multiple events with filtering and pagination
     */
    findMany(options: EventQueryOptions): Promise<UnifiedAnalyticsEvent[]>;
    /**
     * Count events matching filter
     */
    count(filter?: EventFilter): Promise<number>;
    /**
     * Delete single event
     */
    delete(id: string): Promise<boolean>;
    /**
     * Delete multiple events
     */
    deleteBatch(ids: string[]): Promise<number>;
    /**
     * Get event statistics
     */
    getStatistics(filter?: EventFilter): Promise<EventStatistics>;
    /**
     * Get event aggregations
     */
    getAggregations(groupBy: string, filter?: EventFilter): Promise<EventAggregation[]>;
    /**
     * Get time series data
     */
    getTimeSeriesData(metric: string, granularity: string, filter?: EventFilter): Promise<Array<{
        timestamp: number;
        value: number;
    }>>;
    /**
     * Cleanup old events
     */
    cleanup(retentionDays: number): Promise<number>;
    /**
     * Archive old events
     */
    archive(beforeDate: number): Promise<number>;
    /**
     * Optimize database
     */
    optimize(): Promise<void>;
    /**
     * Map database row to event object
     */
    private mapRowToEvent;
    /**
     * Build WHERE clause for filtering
     */
    private buildWhereClause;
    /**
     * Build ORDER clause
     */
    private buildOrderClause;
    /**
     * Build LIMIT clause
     */
    private buildLimitClause;
    /**
     * Calculate retention date for event
     */
    private calculateRetentionDate;
}
/**
 * Event Persistence Factory
 *
 * Factory for creating event repository instances
 */
export declare class EventPersistenceFactory {
    static createRepository(database: any): EventRepository;
    static createInMemoryRepository(): EventRepository;
}
export default EventPersistenceFactory;
//# sourceMappingURL=EventPersistenceLayer.d.ts.map