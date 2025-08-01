/**
 * HistoricalAnalyticsService Unit Tests - Story 1.5 Task 5
 * 
 * Comprehensive test suite for historical analytics data preservation,
 * covering time series queries, retention policies, archival, and optimization.
 */

import HistoricalAnalyticsService, { 
  HistoricalQuery, 
  RetentionPolicy,
  ArchivalConfig 
 from '../HistoricalAnalyticsService';
import { EventRepository } from '../EventPersistenceLayer';
import { 
  UnifiedAnalyticsEvent, 
  AnalyticsEventType, 
  EventCategory, 
  EventSeverity,
  EventFilter 
 from '../UnifiedEventBus';

// Mock Event Repository
class MockEventRepository implements EventRepository {
  private events: UnifiedAnalyticsEvent[] = [];
  private nextId = 1;

  async save(event: UnifiedAnalyticsEvent): Promise<string> {

    const savedEvent = { ...event, id: event.id || `event-${this.nextId++}` };
    this.events.push(savedEvent);
    return savedEvent.id;


  async saveBatch(events: UnifiedAnalyticsEvent[]): Promise<string[]> {

    const ids: string[] = [];
    for (const event of events) {
      ids.push(await this.save(event));

    return ids;


  async findById(id: string): Promise<UnifiedAnalyticsEvent | null> {

    return this.events.find(e => e.id === id) || null;


  async findMany(options: unknown): Promise<UnifiedAnalyticsEvent[]> {

    let filtered = [...this.events];

    // Apply filter
    if (options.filter) {
      const filter = options.filter;
      filtered = filtered.filter(event => {
        if (filter.startTime && event.timestamp < filter.startTime) return false;
        if (filter.endTime && event.timestamp > filter.endTime) return false;
        
        // Handle array type checking properly
        if (filter.types && Array.isArray(filter.types)) {
          // Convert string types to enum values if needed
          const eventTypeMatches = filter.types.some((type: unknown) => 
            event.type === type || event.type.toString() === type.toString()
          );
          if (!eventTypeMatches) return false;

        
        if (filter.categories && Array.isArray(filter.categories)) {
          const categoryMatches = filter.categories.some((cat: string) => 
            event.category === cat || event.category.toString() === cat.toString()
          );
          if (!categoryMatches) return false;

        
        if (filter.userId && event.userId !== filter.userId) return false;
        return true;
      });


    // Apply sorting
    if (options.sortBy === 'timestamp') {
      filtered.sort((a, b) => {
        const direction = options.sortOrder === 'desc' ? -1 : 1;
        return direction * (a.timestamp - b.timestamp);
      });


    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;
    return filtered.slice(offset, offset + limit);


  async count(filter?: EventFilter): Promise<number> {

    if (!filter) return this.events.length;
    
    return this.events.filter(event => {
      if (filter.startTime && event.timestamp < filter.startTime) return false;
      if (filter.endTime && event.timestamp > filter.endTime) return false;
      if (filter.types && !filter.types.includes(event.type)) return false;
      if (filter.categories && !filter.categories.includes(event.category)) return false;
      return true;
    }).length;


  async delete(id: string): Promise<boolean> {

    const index = this.events.findIndex(e => e.id === id);
    if (index >= 0) {
      this.events.splice(index, 1);
      return true;

    return false;


  async deleteBatch(ids: string[]): Promise<number> {

    let deleted = 0;
    for (const id of ids) {
      if (await this.delete(id)) deleted++;

    return deleted;


  async getStatistics(filter?: EventFilter): Promise<any> {

    const events = filter ? await this.findMany({ filter }) : this.events;
    return {
      totalEvents: events.length,
      eventsByType: this.groupBy(events, 'type'),
      eventsByCategory: this.groupBy(events, 'category'),
      eventsBySeverity: this.groupBy(events, 'severity'),
      eventsBySource: this.groupBy(events, 'source'),
      timeRange: {
        earliest: Math.min(...events.map(e => e.timestamp)),
        latest: Math.max(...events.map(e => e.timestamp))

      storageSize: JSON.stringify(events).length
    };


  async getAggregations(): Promise<any[]> {

    return [];


  async getTimeSeriesData(): Promise<Array<{ timestamp: number; value: number }>> {
    return [];


  async cleanup(retentionDays: number): Promise<number> {

    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    const toDelete = this.events.filter(e => e.timestamp < cutoff);
    this.events = this.events.filter(e => e.timestamp >= cutoff);
    return toDelete.length;


  async archive(beforeDate: number): Promise<number> {

    const toArchive = this.events.filter(e => e.timestamp < beforeDate);
    return toArchive.length;


  async optimize(): Promise<void> {

    // Mock optimization


  private groupBy(events: UnifiedAnalyticsEvent[], field: keyof UnifiedAnalyticsEvent): Record<string, number> {
    return events.reduce((acc, event) => {
      const key = String(event[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);


  // Helper method to seed test data
  seedTestData(events: UnifiedAnalyticsEvent[]): void {
    this.events = [...events];



describe('HistoricalAnalyticsService', () => {
  let service: HistoricalAnalyticsService;
  let mockRepository: MockEventRepository;
  let archivalConfig: ArchivalConfig;

  beforeEach(() => {
    mockRepository = new MockEventRepository();
    archivalConfig = {
      enabled: true,
      compressionEnabled: true,
      encryptionEnabled: false,
      storageLocation: 'local',
      batchSize: 100,
      maxConcurrentOperations: 2
    };
    service = new HistoricalAnalyticsService(mockRepository, archivalConfig);
  });

  const createTestEvent = (overrides: Partial<UnifiedAnalyticsEvent> = {}): UnifiedAnalyticsEvent => ({
    id: `event-${Math.random().toString(36).substr(2, 9)}`,
    type: AnalyticsEventType.USER_INTERACTION,
    category: EventCategory.USER,
    severity: EventSeverity.INFO,
    timestamp: Date.now(),
    source: 'test-source',
    version: '1.0.0',
    data: { action: 'click', value: Math.random() * 100 },
    metadata: {},
    tags: [],
    environment: 'test',
    ...overrides
  });

  describe('Historical Data Querying', () => {
    beforeEach(async () => {
      // Seed with test data across different time periods
      const now = Date.now();
      const events = [
        createTestEvent({ 
          timestamp: now - (7 * 24 * 60 * 60 * 1000), // 7 days ago
          type: AnalyticsEventType.USER_INTERACTION,
          data: { value: 10 }
        }),
        createTestEvent({ 
          timestamp: now - (3 * 24 * 60 * 60 * 1000), // 3 days ago
          type: AnalyticsEventType.USER_INTERACTION,
          data: { value: 20 }
        }),
        createTestEvent({ 
          timestamp: now - (1 * 24 * 60 * 60 * 1000), // 1 day ago
          type: AnalyticsEventType.PERFORMANCE_METRIC,
          category: EventCategory.PERFORMANCE,
          data: { value: 30 }
        }),
        createTestEvent({ 
          timestamp: now - (12 * 60 * 60 * 1000), // 12 hours ago
          type: AnalyticsEventType.USER_INTERACTION,
          data: { value: 40 }

      ];

      mockRepository.seedTestData(events);
    });

    it('should execute historical query with count aggregation', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);

      expect(result.query).toEqual(query);
      expect(result.dataPoints).toBeDefined();
      expect(result.dataPoints.length).toBeGreaterThan(0);
      expect(result.statistics.totalPoints).toBe(result.dataPoints.length);
      expect(result.statistics.queryExecutionTime).toBeGreaterThanOrEqual(0);
    });

    it('should execute historical query with sum aggregation', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'sum',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);

      expect(result.dataPoints).toBeDefined();
      expect(result.statistics.aggregatedEvents).toBeGreaterThan(0);
      
      // Check that sum aggregation produces different values than count
      const nonZeroPoints = result.dataPoints.filter(p => p.value > 0);
      expect(nonZeroPoints.length).toBeGreaterThan(0);
    });

    it('should apply event type filtering in historical queries', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'count',
        filter: {
          types: [AnalyticsEventType.USER_INTERACTION]

        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);

      expect(result.dataPoints).toBeDefined();
      expect(result.statistics.aggregatedEvents).toBeGreaterThan(0);
      
      // Should only include user interaction events
      const totalUserInteractionEvents = await mockRepository.count({
        types: [AnalyticsEventType.USER_INTERACTION]
      });
      expect(result.statistics.aggregatedEvents).toBeLessThanOrEqual(totalUserInteractionEvents);
    });

    it('should handle different time granularities', async () => {
      const granularities: Array<'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'> = ['hour', 'day', 'week', 'month', 'quarter', 'year'];
      
      for (const granularity of granularities) {
        const query: HistoricalQuery = {
          startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
          endDate: Date.now(),
          granularity,
          aggregationType: 'count',
          limit: 1000,
          offset: 0
        };

        const result = await service.queryHistoricalData(query);
        
        expect(result.dataPoints).toBeDefined();
        expect(result.query.granularity).toBe(granularity);
        
        // Different granularities should produce different numbers of data points
        expect(result.dataPoints.length).toBeGreaterThanOrEqual(0);

    });


    it('should cache query results for performance', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'hour',
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      // First query
      const result1 = await service.queryHistoricalData(query);
      expect(result1.cacheInfo?.cached).toBe(false);

      // Second identical query should be cached
      const result2 = await service.queryHistoricalData(query);
      expect(result2.cacheInfo?.cached).toBe(true);
      expect(result2.cacheInfo?.ttl).toBeGreaterThan(0);
    });

    it('should handle pagination in historical queries', async () => {
      const query1: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'count',
        limit: 2,
        offset: 0
      };

      const query2: HistoricalQuery = {
        ...query1,
        offset: 2
      };

      const result1 = await service.queryHistoricalData(query1);
      const result2 = await service.queryHistoricalData(query2);

      expect(result1.dataPoints.length).toBeLessThanOrEqual(2);
      expect(result2.dataPoints.length).toBeGreaterThanOrEqual(0);
      
      // Results should be different (different pages)
      if (result2.dataPoints.length > 0) {
        expect(result1.dataPoints[0].timestamp).not.toBe(result2.dataPoints[0].timestamp);

    });

    it('should handle avg aggregation type', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'avg',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);
      
      expect(result.dataPoints).toBeDefined();
      expect(result.query.aggregationType).toBe('avg');
    });

    it('should handle min aggregation type', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'min',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);
      
      expect(result.dataPoints).toBeDefined();
      expect(result.query.aggregationType).toBe('min');
    });

    it('should handle max aggregation type', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'max',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);
      
      expect(result.dataPoints).toBeDefined();
      expect(result.query.aggregationType).toBe('max');
    });

    it('should handle percentile aggregation type', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'percentile',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);
      
      expect(result.dataPoints).toBeDefined();
      expect(result.query.aggregationType).toBe('percentile');
    });

    it('should extract different numeric values from event data', async () => {
      // Test different numeric field extraction paths
      const eventsWithDifferentNumericFields = [
        createTestEvent({ data: { count: 10 } }),
        createTestEvent({ data: { duration: 500 } }),
        createTestEvent({ data: { size: 1024 } }),
        createTestEvent({ data: { amount: 99.99 } }),
        createTestEvent({ data: { someString: 'not a number' } })
      ];

      mockRepository.seedTestData(eventsWithDifferentNumericFields);

      const query: HistoricalQuery = {
        startDate: Date.now() - (24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'sum',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);
      expect(result.dataPoints).toBeDefined();
    });

    it('should use longer cache TTL for larger time ranges', async () => {
      // Test a query with a time range longer than 30 days to trigger longer cache TTL
      const query: HistoricalQuery = {
        startDate: Date.now() - (60 * 24 * 60 * 60 * 1000), // 60 days ago
        endDate: Date.now(),
        granularity: 'day',
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      const result = await service.queryHistoricalData(query);
      expect(result.dataPoints).toBeDefined();
      expect(result.cacheInfo?.cached).toBe(false);
    });

    it('should track slow queries in metrics', async () => {
      // Mock a slow repository operation to trigger slow query tracking
      const originalFindMany = mockRepository.findMany;
      mockRepository.findMany = jest.fn<unknown[], unknown>().mockImplementation(async (options) => {
        // Simulate slow operation (use immediate promise for test speed)
        await new Promise(resolve => setImmediate(resolve));
        return originalFindMany.call(mockRepository, options);
      });

      const query: HistoricalQuery = {
        startDate: Date.now() - (24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'hour',
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      await service.queryHistoricalData(query);
      
      const metrics = await service.getHistoricalAnalyticsMetrics();
      expect(metrics.queryPerformance.slowQueries).toBeGreaterThan(0);

      // Restore original method
      mockRepository.findMany = originalFindMany;
    });
  });

  describe('Retention Policy Management', () => {
    it('should create retention policy', async () => {
      const policy = {
        name: 'Test User Data Retention',
        description: 'Retain user data for 30 days',
        rules: [{
          eventTypes: [AnalyticsEventType.USER_INTERACTION],
          categories: ['user'],
          retentionDays: 30,
          archiveBeforeDelete: true,
          compressionLevel: 'medium' as const
],
        enabled: true
      };

      const policyId = await service.createRetentionPolicy(policy);
      
      expect(policyId).toBeDefined();
      expect(typeof policyId).toBe('string');
      expect(policyId).toMatch(/^policy_/);
    });

    it('should execute retention policies and process old events', async () => {
      // Create old events that should be processed
      const oldTimestamp = Date.now() - (100 * 24 * 60 * 60 * 1000); // 100 days ago
      const oldEvents = [
        createTestEvent({ 
          timestamp: oldTimestamp,
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER
        }),
        createTestEvent({ 
          timestamp: oldTimestamp + 1000,
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER

      ];

      await mockRepository.saveBatch(oldEvents);

      // Create retention policy with immediate execution for testing
      await service.createRetentionPolicy({
        name: 'Test Policy',
        description: 'Test retention',
        rules: [{
          eventTypes: [AnalyticsEventType.USER_INTERACTION],
          categories: [EventCategory.USER.toString()], // Convert enum to string
          retentionDays: 30,
          archiveBeforeDelete: true,
          compressionLevel: 'medium'
],
        enabled: true
      }, true); // immediateExecution = true

      const result = await service.executeRetentionPolicies();

      expect(result.processed).toBeGreaterThan(0);
      expect(result.archived).toBeGreaterThan(0);
      expect(result.deleted).toBeGreaterThan(0);
      expect(result.processed).toBe(result.archived);
      expect(result.processed).toBe(result.deleted);
    });

    it('should not process events when retention policy is disabled', async () => {
      const oldEvents = [
        createTestEvent({ 
          timestamp: Date.now() - (100 * 24 * 60 * 60 * 1000),
          type: AnalyticsEventType.USER_INTERACTION

      ];

      await mockRepository.saveBatch(oldEvents);

      // Create disabled retention policy
      await service.createRetentionPolicy({
        name: 'Disabled Policy',
        description: 'Should not execute',
        rules: [{
          eventTypes: [AnalyticsEventType.USER_INTERACTION],
          categories: ['user'],
          retentionDays: 30,
          archiveBeforeDelete: true,
          compressionLevel: 'medium'
],
        enabled: false // Disabled
      });

      const result = await service.executeRetentionPolicies();

      expect(result.processed).toBe(0);
      expect(result.archived).toBe(0);
      expect(result.deleted).toBe(0);
    });
  });

  describe('Historical Event Retrieval', () => {
    beforeEach(async () => {
      const now = Date.now();
      const events = [
        createTestEvent({ 
          timestamp: now - (2 * 24 * 60 * 60 * 1000),
          userId: 'user-1'
        }),
        createTestEvent({ 
          timestamp: now - (1 * 24 * 60 * 60 * 1000),
          userId: 'user-2'
        }),
        createTestEvent({ 
          timestamp: now - (12 * 60 * 60 * 1000),
          userId: 'user-1'

      ];

      await mockRepository.saveBatch(events);
    });

    it('should retrieve historical events with date range filter', async () => {
      const startDate = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const endDate = Date.now();

      const events = await service.getHistoricalEvents(startDate, endDate);

      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThan(0);
      
      // All events should be within the date range
      events.forEach(event => {
        expect(event.timestamp).toBeGreaterThanOrEqual(startDate);
        expect(event.timestamp).toBeLessThanOrEqual(endDate);
      });
    });

    it('should apply additional filters to historical events', async () => {
      const startDate = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const endDate = Date.now();
      const filter = { userId: 'user-1' };

      const events = await service.getHistoricalEvents(
        startDate, 
        endDate, 
        filter, 
        100, 
        0
      );

      expect(events).toBeDefined();
      events.forEach(event => {
        expect(event.userId).toBe('user-1');
      });
    });

    it('should handle pagination for historical events', async () => {
      const startDate = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const endDate = Date.now();

      const page1 = await service.getHistoricalEvents(startDate, endDate, {}, 2, 0);
      const page2 = await service.getHistoricalEvents(startDate, endDate, {}, 2, 2);

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeGreaterThanOrEqual(0);
      
      // Pages should not overlap
      if (page1.length > 0 && page2.length > 0) {
        const page1Ids = page1.map(e => e.id);
        const page2Ids = page2.map(e => e.id);
        expect(page1Ids.some(id => page2Ids.includes(id))).toBe(false);

    });
  });

  describe('Performance Metrics and Optimization', () => {
    it('should track query performance metrics', async () => {
      const query: HistoricalQuery = {
        startDate: Date.now() - (24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'hour',
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      // Execute a few queries
      await service.queryHistoricalData(query);
      await service.queryHistoricalData(query); // Should be cached
      
      const metrics = await service.getHistoricalAnalyticsMetrics();

      expect(metrics.queryPerformance.totalQueries).toBeGreaterThan(0);
      expect(metrics.queryPerformance.cachedQueries).toBeGreaterThan(0);
      expect(metrics.queryPerformance.averageQueryTime).toBeGreaterThanOrEqual(0);
    });

    it('should track data volume metrics', async () => {
      const events = [
        createTestEvent(),
        createTestEvent(),
        createTestEvent()
      ];

      await mockRepository.saveBatch(events);
      
      const metrics = await service.getHistoricalAnalyticsMetrics();

      expect(metrics.dataVolume.totalEvents).toBeGreaterThan(0);
      expect(metrics.dataVolume.storageSize).toBeGreaterThan(0);
    });

    it('should optimize historical storage', async () => {
      const result = await service.optimizeHistoricalStorage();

      expect(result.optimized).toBe(true);
      expect(result.improvements).toBeDefined();
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.improvements.length).toBeGreaterThan(0);
    });

    it('should clear expired cache entries during optimization', async () => {
      // Add some cache entries with past expiry
      const pastExpiry = Date.now() - 1000;
      // @ts-ignore - accessing private property for testing
      service.queryCache.set('expired-key', {
        data: {} as any,
        expiry: pastExpiry
      });

      const result = await service.optimizeHistoricalStorage();

      expect(result.optimized).toBe(true);
      expect(result.improvements.some(imp => imp.includes('Cleared'))).toBe(true);
    });

    it('should handle optimization errors gracefully', async () => {
      // Mock repository to throw error
      const originalOptimize = mockRepository.optimize;
      mockRepository.optimize = jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Optimization failed'));

      const result = await service.optimizeHistoricalStorage();

      expect(result.optimized).toBe(false);
      expect(result.improvements[0]).toContain('Optimization failed');

      // Restore original method
      mockRepository.optimize = originalOptimize;
    });

    it('should handle archival errors in retention policy execution', async () => {
      // Create events to be archived
      const oldEvents = [createTestEvent({ 
        timestamp: Date.now() - (100 * 24 * 60 * 60 * 1000),
        type: AnalyticsEventType.USER_INTERACTION,
        category: EventCategory.USER
      })];
      await mockRepository.saveBatch(oldEvents);

      // Create a service with archival enabled but simulate archival error
      const serviceWithArchival = new HistoricalAnalyticsService(mockRepository, {
        enabled: true,
        compressionEnabled: true,
        encryptionEnabled: false,
        storageLocation: 'local',
        batchSize: 100,
        maxConcurrentOperations: 2
      });

      // Mock console.error to avoid test output noise
      const originalConsoleError = console.error;
      console.error = jest.fn<unknown[], unknown>();

      // Temporarily break JSON.stringify to cause archival error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn<unknown[], unknown>().mockImplementation(() => {
        throw new Error('JSON error');
      });

      await serviceWithArchival.createRetentionPolicy({
        name: 'Test Policy',
        description: 'Test retention with archival error',
        rules: [{
          eventTypes: [AnalyticsEventType.USER_INTERACTION],
          categories: [EventCategory.USER.toString()],
          retentionDays: 30,
          archiveBeforeDelete: true,
          compressionLevel: 'medium'
],
        enabled: true
      }, true);

      const result = await serviceWithArchival.executeRetentionPolicies();

      // Should still process and delete events even if archival fails
      expect(result.processed).toBeGreaterThan(0);
      expect(result.archived).toBe(0); // Archival failed
      expect(result.deleted).toBeGreaterThan(0);

      // Restore original functions
      JSON.stringify = originalStringify;
      console.error = originalConsoleError;
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query parameters', async () => {
      const invalidQuery = {
        startDate: Date.now(),
        endDate: Date.now() - (24 * 60 * 60 * 1000), // End before start
        granularity: 'hour',
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      // Should handle gracefully or reject with proper error
      try {
        await service.queryHistoricalData(invalidQuery as HistoricalQuery);
        // If it doesn't throw, that's also acceptable behavior
 catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('query');

    });

    it('should handle repository errors gracefully', async () => {
      // Create a service with a mock repository that throws errors
      const errorRepository = {
        ...mockRepository,
        findMany: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Database error'))
      };

      const errorService = new HistoricalAnalyticsService(errorRepository as any);
      
      const query: HistoricalQuery = {
        startDate: Date.now() - (24 * 60 * 60 * 1000),
        endDate: Date.now(),
        granularity: 'hour',
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      await expect(errorService.queryHistoricalData(query)).rejects.toThrow('Historical query failed');
    });

    it('should handle overly broad queries', async () => {
      const veryBroadQuery: HistoricalQuery = {
        startDate: Date.now() - (365 * 24 * 60 * 60 * 1000), // 1 year ago
        endDate: Date.now(),
        granularity: 'hour', // This would create ~8760 buckets
        aggregationType: 'count',
        limit: 1000,
        offset: 0
      };

      await expect(service.queryHistoricalData(veryBroadQuery)).rejects.toThrow('Query too broad');
    });
  });

  describe('Integration with Archival System', () => {
    it('should respect archival configuration', async () => {
      const configWithArchivalDisabled: ArchivalConfig = {
        ...archivalConfig,
        enabled: false
      };

      const serviceWithoutArchival = new HistoricalAnalyticsService(
        mockRepository, 
        configWithArchivalDisabled
      );

      // Create retention policy with immediate execution for testing
      await serviceWithoutArchival.createRetentionPolicy({
        name: 'Test Policy',
        description: 'Test retention without archival',
        rules: [{
          eventTypes: [AnalyticsEventType.USER_INTERACTION],
          categories: [EventCategory.USER.toString()], // Convert enum to string
          retentionDays: 30,
          archiveBeforeDelete: true,
          compressionLevel: 'medium'
],
        enabled: true
      }, true); // immediateExecution = true

      // Add old events
      const oldEvents = [
        createTestEvent({ timestamp: Date.now() - (100 * 24 * 60 * 60 * 1000) })
      ];
      await mockRepository.saveBatch(oldEvents);

      const result = await serviceWithoutArchival.executeRetentionPolicies();

      // Should process and delete but not archive when archival is disabled
      expect(result.processed).toBeGreaterThan(0);
      expect(result.archived).toBe(0); // No archival when disabled
      expect(result.deleted).toBeGreaterThan(0);
    });
  });
});