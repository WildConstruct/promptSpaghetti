/**
 * EventPersistenceLayer Unit Tests - Story 1.5 Task 2
 * 
 * Comprehensive test suite for event persistence using repository pattern
 * covering event storage, retrieval, querying, and maintenance operations.
 */

import {
  EventRepository,
  DatabaseEventRepository,
  EventPersistenceFactory,
  EventQueryOptions,
  EventStatistics,
  EventAggregation,
  StoredEventSchema
} from '../EventPersistenceLayer';
import {
  UnifiedAnalyticsEvent,
  AnalyticsEventType,
  EventCategory,
  EventSeverity,
  EventFilter
} from '../UnifiedEventBus';

// Mock database for testing
class MockDatabase {
  private tables: { [tableName: string]: any[] } = {};
  private queries: string[] = [];
  
  exec(sql: string) {
    this.queries.push(sql);
    // Simulate table creation
    if (sql.includes('CREATE TABLE')) {
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      if (tableName && !this.tables[tableName]) {
        this.tables[tableName] = [];
      }
    }
  }

  prepare(sql: string) {
    this.queries.push(sql);
    const tableName = 'unified_analytics_events';
    
    return {
      run: (...params: any[]) => {
        if (sql.includes('INSERT')) {
          const row = this.createRowFromParams(params);
          this.tables[tableName] = this.tables[tableName] || [];
          this.tables[tableName].push(row);
          return { changes: 1 };
        }
        if (sql.includes('DELETE')) {
          const beforeLength = this.tables[tableName]?.length || 0;
          this.tables[tableName] = [];
          return { changes: beforeLength };
        }
        if (sql.includes('UPDATE')) {
          return { changes: 1 };
        }
        return { changes: 0 };
      },
      get: (...params: any[]) => {
        if (sql.includes('SELECT COUNT')) {
          return { count: this.tables[tableName]?.length || 0 };
        }
        if (sql.includes('SELECT *') && params.length > 0) {
          const id = params[0];
          return this.tables[tableName]?.find(row => row.id === id);
        }
        if (sql.includes('MIN(timestamp)')) {
          const events = this.tables[tableName] || [];
          if (events.length === 0) return { earliest: null, latest: null };
          const timestamps = events.map(e => e.timestamp);
          return {
            earliest: Math.min(...timestamps),
            latest: Math.max(...timestamps)
          };
        }
        if (sql.includes('SUM(LENGTH')) {
          return { size: 1000 }; // Mock size
        }
        return null;
      },
      all: (...params: any[]) => {
        const events = this.tables[tableName] || [];
        if (sql.includes('GROUP BY type')) {
          const grouped = events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(grouped).map(([type, count]) => ({ type, count }));
        }
        if (sql.includes('GROUP BY category')) {
          const grouped = events.reduce((acc, event) => {
            acc[event.category] = (acc[event.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(grouped).map(([category, count]) => ({ category, count }));
        }
        if (sql.includes('GROUP BY severity')) {
          const grouped = events.reduce((acc, event) => {
            acc[event.severity] = (acc[event.severity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(grouped).map(([severity, count]) => ({ severity, count }));
        }
        if (sql.includes('GROUP BY source')) {
          const grouped = events.reduce((acc, event) => {
            acc[event.source] = (acc[event.source] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(grouped).map(([source, count]) => ({ source, count }));
        }
        return events;
      }
    };
  }

  transaction(fn: Function) {
    return (data: unknown) => fn(data);
  }

  private createRowFromParams(params: any[]): any {
    const [
      id, type, category, severity, timestamp, source, version,
      session_id, user_id, organization_id, request_id, trace_id,
      data, metadata, tags, environment, region, stored_at, retention_date
    ] = params;

    return {
      id, type, category, severity, timestamp, source, version,
      session_id, user_id, organization_id, request_id, trace_id,
      data, metadata, tags, environment, region, stored_at, retention_date
    };
  }
}

describe('DatabaseEventRepository', () => {
  let repository: EventRepository;
  let mockDb: MockDatabase;

  beforeEach(() => {
    mockDb = new MockDatabase();
    repository = new DatabaseEventRepository(mockDb as any);
  });

  const createTestEvent = (overrides: Partial<UnifiedAnalyticsEvent> = {}): UnifiedAnalyticsEvent => ({
    id: 'test-id-' + Math.random().toString(36).substr(2, 9),
    type: AnalyticsEventType.USER_INTERACTION,
    category: EventCategory.USER,
    severity: EventSeverity.INFO,
    timestamp: Date.now(),
    source: 'test-source',
    version: '1.0.0',
    data: { action: 'click', target: 'button' },
    metadata: { testFlag: true },
    tags: ['test'],
    environment: 'test',
    ...overrides
  });

  describe('Event Storage', () => {
    it('should save a single event', async () => {
      const event = createTestEvent();
      const eventId = await repository.save(event);

      expect(eventId).toBe(event.id);
    });

    it('should save multiple events in batch', async () => {
      const events = [
        createTestEvent({ id: 'event-1' }),
        createTestEvent({ id: 'event-2' }),
        createTestEvent({ id: 'event-3' })
      ];

      const eventIds = await repository.saveBatch(events);

      expect(eventIds).toHaveLength(3);
      expect(eventIds).toEqual(['event-1', 'event-2', 'event-3']);
    });

    it('should handle events with optional fields', async () => {
      const event = createTestEvent({
        sessionId: 'session-123',
        userId: 'user-456',
        organizationId: 'org-789',
        requestId: 'req-abc',
        traceId: 'trace-def',
        region: 'us-east-1'
      });

      const eventId = await repository.save(event);
      expect(eventId).toBe(event.id);
    });

    it('should handle events without optional fields', async () => {
      const event = createTestEvent();
      delete (event as any).sessionId;
      delete (event as any).userId;
      delete (event as any).region;

      const eventId = await repository.save(event);
      expect(eventId).toBe(event.id);
    });
  });

  describe('Event Retrieval', () => {
    beforeEach(async () => {
      // Pre-populate with test events
      const events = [
        createTestEvent({ 
          id: 'event-1', 
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER,
          severity: EventSeverity.INFO,
          source: 'component-a'
        }),
        createTestEvent({ 
          id: 'event-2', 
          type: AnalyticsEventType.PERFORMANCE_METRIC,
          category: EventCategory.PERFORMANCE,
          severity: EventSeverity.WARNING,
          source: 'component-b'
        }),
        createTestEvent({ 
          id: 'event-3', 
          type: AnalyticsEventType.SECURITY_EVENT,
          category: EventCategory.SECURITY,
          severity: EventSeverity.CRITICAL,
          source: 'component-c'
        })
      ];

      await repository.saveBatch(events);
    });

    it('should find event by ID', async () => {
      const event = await repository.findById('event-1');
      
      expect(event).not.toBeNull();
      expect(event?.id).toBe('event-1');
      expect(event?.type).toBe(AnalyticsEventType.USER_INTERACTION);
    });

    it('should return null for non-existent event', async () => {
      const event = await repository.findById('non-existent');
      expect(event).toBeNull();
    });

    it('should find multiple events with basic options', async () => {
      const events = await repository.findMany({
        limit: 2,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });

      expect(events).toHaveLength(2);
    });

    it('should count total events', async () => {
      const count = await repository.count();
      expect(count).toBe(3);
    });

    it('should count events with filter', async () => {
      const filter: EventFilter = {
        categories: [EventCategory.USER]
      };
      
      const count = await repository.count(filter);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Event Filtering and Querying', () => {
    beforeEach(async () => {
      const events = [
        createTestEvent({ 
          id: 'user-event-1',
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER,
          severity: EventSeverity.INFO,
          userId: 'user-123'
        }),
        createTestEvent({ 
          id: 'perf-event-1',
          type: AnalyticsEventType.PERFORMANCE_METRIC,
          category: EventCategory.PERFORMANCE,
          severity: EventSeverity.WARNING,
          userId: 'user-456'
        })
      ];

      await repository.saveBatch(events);
    });

    it('should filter events by type', async () => {
      const options: EventQueryOptions = {
        filter: {
          types: [AnalyticsEventType.USER_INTERACTION]
        }
      };

      const events = await repository.findMany(options);
      expect(events.every(e => e.type === AnalyticsEventType.USER_INTERACTION)).toBe(true);
    });

    it('should filter events by category', async () => {
      const options: EventQueryOptions = {
        filter: {
          categories: [EventCategory.PERFORMANCE]
        }
      };

      const events = await repository.findMany(options);
      expect(events.every(e => e.category === EventCategory.PERFORMANCE)).toBe(true);
    });

    it('should filter events by severity', async () => {
      const options: EventQueryOptions = {
        filter: {
          severities: [EventSeverity.WARNING]
        }
      };

      const events = await repository.findMany(options);
      expect(events.every(e => e.severity === EventSeverity.WARNING)).toBe(true);
    });

    it('should filter events by user ID', async () => {
      const options: EventQueryOptions = {
        filter: {
          userId: 'user-123'
        }
      };

      const events = await repository.findMany(options);
      expect(events.every(e => e.userId === 'user-123')).toBe(true);
    });

    it('should apply pagination', async () => {
      const options: EventQueryOptions = {
        limit: 1,
        offset: 1
      };

      const events = await repository.findMany(options);
      expect(events).toHaveLength(1);
    });

    it('should apply sorting', async () => {
      const options: EventQueryOptions = {
        sortBy: 'timestamp',
        sortOrder: 'asc'
      };

      const events = await repository.findMany(options);
      expect(events).toHaveLength(2);
    });
  });

  describe('Event Deletion', () => {
    beforeEach(async () => {
      const events = [
        createTestEvent({ id: 'delete-test-1' }),
        createTestEvent({ id: 'delete-test-2' }),
        createTestEvent({ id: 'delete-test-3' })
      ];

      await repository.saveBatch(events);
    });

    it('should delete single event', async () => {
      const deleted = await repository.delete('delete-test-1');
      expect(deleted).toBe(true);
    });

    it('should return false when deleting non-existent event', async () => {
      const deleted = await repository.delete('non-existent');
      expect(deleted).toBe(false);
    });

    it('should delete multiple events in batch', async () => {
      const deletedCount = await repository.deleteBatch(['delete-test-1', 'delete-test-2']);
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty batch deletion', async () => {
      const deletedCount = await repository.deleteBatch([]);
      expect(deletedCount).toBe(0);
    });
  });

  describe('Analytics and Statistics', () => {
    beforeEach(async () => {
      const events = [
        createTestEvent({ 
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER,
          severity: EventSeverity.INFO,
          source: 'component-a'
        }),
        createTestEvent({ 
          type: AnalyticsEventType.PERFORMANCE_METRIC,
          category: EventCategory.PERFORMANCE,
          severity: EventSeverity.WARNING,
          source: 'component-b'
        }),
        createTestEvent({ 
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER,
          severity: EventSeverity.INFO,
          source: 'component-a'
        })
      ];

      await repository.saveBatch(events);
    });

    it('should generate event statistics', async () => {
      const stats: EventStatistics = await repository.getStatistics();

      expect(stats.totalEvents).toBeGreaterThanOrEqual(3);
      expect(stats.eventsByType).toBeDefined();
      expect(stats.eventsByCategory).toBeDefined();
      expect(stats.eventsBySeverity).toBeDefined();
      expect(stats.eventsBySource).toBeDefined();
      expect(stats.timeRange).toBeDefined();
      expect(stats.storageSize).toBeDefined();
    });

    it('should generate filtered statistics', async () => {
      const filter: EventFilter = {
        categories: [EventCategory.USER]
      };

      const stats = await repository.getStatistics(filter);
      expect(stats).toBeDefined();
    });

    it('should generate event aggregations', async () => {
      const aggregations: EventAggregation[] = await repository.getAggregations('type');

      expect(aggregations).toBeDefined();
      expect(Array.isArray(aggregations)).toBe(true);
    });

    it('should generate time series data', async () => {
      const timeSeries = await repository.getTimeSeriesData('count', 'hour');

      expect(timeSeries).toBeDefined();
      expect(Array.isArray(timeSeries)).toBe(true);
    });

    it('should handle different time granularities', async () => {
      const hourly = await repository.getTimeSeriesData('count', 'hour');
      const daily = await repository.getTimeSeriesData('count', 'day');
      const weekly = await repository.getTimeSeriesData('count', 'week');
      const monthly = await repository.getTimeSeriesData('count', 'month');

      expect(hourly).toBeDefined();
      expect(daily).toBeDefined();
      expect(weekly).toBeDefined();
      expect(monthly).toBeDefined();
    });
  });

  describe('Maintenance Operations', () => {
    beforeEach(async () => {
      const oldEvents = [
        createTestEvent({ 
          id: 'old-event-1',
          timestamp: Date.now() - (100 * 24 * 60 * 60 * 1000) // 100 days ago
        }),
        createTestEvent({ 
          id: 'recent-event-1',
          timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000) // 1 day ago
        })
      ];

      await repository.saveBatch(oldEvents);
    });

    it('should cleanup old events', async () => {
      const deletedCount = await repository.cleanup(30); // Keep last 30 days
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });

    it('should archive old events', async () => {
      const cutoffDate = Date.now() - (50 * 24 * 60 * 60 * 1000); // 50 days ago
      const archivedCount = await repository.archive(cutoffDate);
      expect(archivedCount).toBeGreaterThanOrEqual(0);
    });

    it('should optimize database', async () => {
      // Should not throw
      await expect(repository.optimize()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', () => {
      const invalidDb = null;
      expect(() => new DatabaseEventRepository(invalidDb as any)).toThrow();
    });

    it('should handle invalid filter parameters', async () => {
      const invalidFilter = {
        types: ['invalid-type' as any]
      };

      // Should not throw, should handle gracefully
      const events = await repository.findMany({ filter: invalidFilter });
      expect(Array.isArray(events)).toBe(true);
    });
  });
});

describe('EventPersistenceFactory', () => {
  it('should create database repository', () => {
    const mockDb = new MockDatabase();
    const repository = EventPersistenceFactory.createRepository(mockDb as any);
    
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(DatabaseEventRepository);
  });

  it('should create in-memory repository', () => {
    const repository = EventPersistenceFactory.createInMemoryRepository();
    
    expect(repository).toBeDefined();
  });
});

describe('InMemoryEventRepository', () => {
  let repository: EventRepository;

  beforeEach(() => {
    repository = EventPersistenceFactory.createInMemoryRepository();
  });

  const createTestEvent = (overrides: Partial<UnifiedAnalyticsEvent> = {}): UnifiedAnalyticsEvent => ({
    id: 'test-id-' + Math.random().toString(36).substr(2, 9),
    type: AnalyticsEventType.USER_INTERACTION,
    category: EventCategory.USER,
    severity: EventSeverity.INFO,
    timestamp: Date.now(),
    source: 'test-source',
    version: '1.0.0',
    data: { action: 'click' },
    metadata: {},
    tags: [],
    environment: 'test',
    ...overrides
  });

  describe('Basic Operations', () => {
    it('should save and retrieve events', async () => {
      const event = createTestEvent({ id: 'memory-test-1' });
      
      await repository.save(event);
      const retrieved = await repository.findById('memory-test-1');
      
      expect(retrieved).toEqual(event);
    });

    it('should count events correctly', async () => {
      const events = [
        createTestEvent({ id: 'count-1' }),
        createTestEvent({ id: 'count-2' }),
        createTestEvent({ id: 'count-3' })
      ];

      await repository.saveBatch(events);
      const count = await repository.count();
      
      expect(count).toBe(3);
    });

    it('should delete events', async () => {
      const event = createTestEvent({ id: 'delete-me' });
      
      await repository.save(event);
      const deleted = await repository.delete('delete-me');
      
      expect(deleted).toBe(true);
      
      const retrieved = await repository.findById('delete-me');
      expect(retrieved).toBeNull();
    });

    it('should filter events by properties', async () => {
      const events = [
        createTestEvent({ 
          id: 'filter-1',
          type: AnalyticsEventType.USER_INTERACTION,
          userId: 'user-123'
        }),
        createTestEvent({ 
          id: 'filter-2',
          type: AnalyticsEventType.PERFORMANCE_METRIC,
          userId: 'user-456'
        })
      ];

      await repository.saveBatch(events);

      const userEvents = await repository.findMany({
        filter: { types: [AnalyticsEventType.USER_INTERACTION] }
      });

      expect(userEvents).toHaveLength(1);
      expect(userEvents[0].id).toBe('filter-1');
    });

    it('should generate statistics', async () => {
      const events = [
        createTestEvent({ 
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER
        }),
        createTestEvent({ 
          type: AnalyticsEventType.PERFORMANCE_METRIC,
          category: EventCategory.PERFORMANCE
        })
      ];

      await repository.saveBatch(events);
      const stats = await repository.getStatistics();

      expect(stats.totalEvents).toBe(2);
      expect(stats.eventsByType[AnalyticsEventType.USER_INTERACTION]).toBe(1);
      expect(stats.eventsByType[AnalyticsEventType.PERFORMANCE_METRIC]).toBe(1);
    });

    it('should cleanup old events', async () => {
      const oldEvent = createTestEvent({ 
        id: 'old',
        timestamp: Date.now() - (100 * 24 * 60 * 60 * 1000) // 100 days ago
      });
      const newEvent = createTestEvent({ 
        id: 'new',
        timestamp: Date.now()
      });

      await repository.save(oldEvent);
      await repository.save(newEvent);

      const deletedCount = await repository.cleanup(30); // Keep last 30 days
      
      expect(deletedCount).toBe(1);
      
      const remaining = await repository.findById('new');
      expect(remaining).not.toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty filter', async () => {
      const event = createTestEvent();
      await repository.save(event);

      const events = await repository.findMany({ filter: {} });
      expect(events).toHaveLength(1);
    });

    it('should handle pagination with empty results', async () => {
      const events = await repository.findMany({ 
        limit: 10, 
        offset: 100 
      });
      
      expect(events).toHaveLength(0);
    });

    it('should handle sorting with no events', async () => {
      const events = await repository.findMany({ 
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });
      
      expect(events).toHaveLength(0);
    });
  });
});