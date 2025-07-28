/**
 * Event Persistence Layer - Story 1.5 Task 2
 *
 * Implements event persistence using repository pattern from Story 1.4
 * with comprehensive event storage, retrieval, and management capabilities.
 */
import { z } from 'zod';
import { UnifiedAnalyticsEvent, EventFilter } from './UnifiedEventBus';
export declare const StoredEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
export interface EventRepository {
    save(event: UnifiedAnalyticsEvent): Promise<string>;
    saveBatch(events: UnifiedAnalyticsEvent): Promise<string>;
    findById(id: string): Promise<UnifiedAnalyticsEvent | null>;
    findMany(options: EventQueryOptions): Promise<UnifiedAnalyticsEvent>;
    count(filter?: EventFilter): Promise<number>;
    delete(id: string): Promise<boolean>;
    deleteBatch(ids: string): Promise<number>;
    getStatistics(filter?: EventFilter): Promise<EventStatistics>;
    getAggregations(groupBy: string, filter?: EventFilter): Promise<EventAggregation>;
    getTimeSeriesData(): any;
    metric: string;
    granularity: string;
    filter?: EventFilter;
    Promise<Array>(): any;
    (): any;
}
export declare class DatabaseEventRepository implements EventRepository {
    private db;
    private tableName;
    constructor(database: any);
    /**
     * Initialize database schema
     */
    private initializeSchema;
}
//# sourceMappingURL=EventPersistenceLayer.d.ts.map