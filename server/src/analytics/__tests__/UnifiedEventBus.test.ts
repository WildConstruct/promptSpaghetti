/**
 * UnifiedEventBus Unit Tests - Story 1.5 Task 2
 * 
 * Comprehensive test suite for the unified event bus pub/sub architecture
 * covering event publishing, subscription, filtering, and persistence.
 */

import { 
  UnifiedEventBus, 
  AnalyticsEventType, 
  EventCategory, 
  EventSeverity,
  EventBusFactory,
  UnifiedAnalyticsEvent,
  EventFilter,
  EventSubscriber
} from '../UnifiedEventBus';

describe('UnifiedEventBus', () => {
  let eventBus: UnifiedEventBus;

  beforeEach(() => {
    eventBus = new UnifiedEventBus({
      maxEventHistory: 100,
      enablePersistence: true,
      batchSize: 10,
      flushIntervalMs: 100,
      deadLetterQueue: true,
      metricsEnabled: true
    });
  });

  afterEach(async () => {
    await eventBus.shutdown();
  });

  describe('Event Publishing', () => {
    it('should publish a valid analytics event', async () => {
      const eventData = {
        type: AnalyticsEventType.USER_INTERACTION,
        category: EventCategory.USER,
        severity: EventSeverity.INFO,
        source: 'test-component',
        data: { action: 'click', target: 'button' },
        metadata: { testFlag: true }
      };

      const eventId = await eventBus.publishEvent(eventData);

      expect(eventId).toBeDefined();
      expect(typeof eventId).toBe('string');
      
      const metrics = eventBus.getMetrics();
      expect(metrics.eventsPublished).toBe(1);
    });

    it('should generate unique IDs and timestamps for events', async () => {
      const eventData = {
        type: AnalyticsEventType.GRAPH_EXECUTION,
        category: EventCategory.EXECUTION,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { nodeId: 'test-node' }
      };

      const id1 = await eventBus.publishEvent(eventData);
      const id2 = await eventBus.publishEvent(eventData);

      expect(id1).not.toBe(id2);
    });

    it('should reject invalid event data', async () => {
      const invalidEventData = {
        type: 'invalid-type',
        category: EventCategory.USER,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { test: true }
      };

      await expect(eventBus.publishEvent(invalidEventData as any)).rejects.toThrow();
    });

    it('should emit event:published when event is published', async () => {
      const publishedListener = jest.fn<unknown[], unknown>();
      eventBus.on('event:published', publishedListener);

      const eventData = {
        type: AnalyticsEventType.PERFORMANCE_METRIC,
        category: EventCategory.PERFORMANCE,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { metric: 'cpu', value: 45 }
      };

      await eventBus.publishEvent(eventData);

      expect(publishedListener).toHaveBeenCalledWith({
        eventId: expect.any(String),
        type: AnalyticsEventType.PERFORMANCE_METRIC,
        category: EventCategory.PERFORMANCE
      });
    });
  });

  describe('Event Subscription', () => {
    it('should allow subscribing to events', () => {
      const handler = jest.fn<unknown[], unknown>();
      const subscriptionId = eventBus.subscribe({
        name: 'test-subscriber',
        filter: {},
        handler,
        priority: 100
      });

      expect(subscriptionId).toBeDefined();
      expect(typeof subscriptionId).toBe('string');
      
      const metrics = eventBus.getMetrics();
      expect(metrics.subscribersActive).toBe(1);
    });

    it('should call subscriber handler when matching event is published', async () => {
      const handler = jest.fn<unknown[], unknown>();
      
      eventBus.subscribe({
        name: 'test-subscriber',
        filter: { types: [AnalyticsEventType.USER_INTERACTION] },
        handler,
        priority: 100
      });

      const eventData = {
        type: AnalyticsEventType.USER_INTERACTION,
        category: EventCategory.USER,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { action: 'click' }
      };

      await eventBus.publishEvent(eventData);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: AnalyticsEventType.USER_INTERACTION,
        category: EventCategory.USER,
        severity: EventSeverity.INFO,
        source: 'test'
      }));
    });

    it('should not call subscriber handler for non-matching events', async () => {
      const handler = jest.fn<unknown[], unknown>();
      
      eventBus.subscribe({
        name: 'test-subscriber',
        filter: { types: [AnalyticsEventType.SECURITY_EVENT] },
        handler,
        priority: 100
      });

      const eventData = {
        type: AnalyticsEventType.USER_INTERACTION,
        category: EventCategory.USER,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { action: 'click' }
      };

      await eventBus.publishEvent(eventData);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow unsubscribing from events', () => {
      const handler = jest.fn<unknown[], unknown>();
      const subscriptionId = eventBus.subscribe({
        name: 'test-subscriber',
        filter: {},
        handler,
        priority: 100
      });

      const unsubscribed = eventBus.unsubscribe(subscriptionId);
      expect(unsubscribed).toBe(true);
      
      const metrics = eventBus.getMetrics();
      expect(metrics.subscribersActive).toBe(0);
    });
  });

  describe('Event Filtering', () => {
    it('should filter events by type', async () => {
      const userHandler = jest.fn<unknown[], unknown>();
      const securityHandler = jest.fn<unknown[], unknown>();
      
      eventBus.subscribe({
        name: 'user-subscriber',
        filter: { types: [AnalyticsEventType.USER_INTERACTION] },
        handler: userHandler,
        priority: 100
      });

      eventBus.subscribe({
        name: 'security-subscriber',
        filter: { types: [AnalyticsEventType.SECURITY_EVENT] },
        handler: securityHandler,
        priority: 100
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.USER_INTERACTION,
        category: EventCategory.USER,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { action: 'click' }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(userHandler).toHaveBeenCalled();
      expect(securityHandler).not.toHaveBeenCalled();
    });

    it('should filter events by category', async () => {
      const performanceHandler = jest.fn<unknown[], unknown>();
      const userHandler = jest.fn<unknown[], unknown>();
      
      eventBus.subscribe({
        name: 'performance-subscriber',
        filter: { categories: [EventCategory.PERFORMANCE] },
        handler: performanceHandler,
        priority: 100
      });

      eventBus.subscribe({
        name: 'user-subscriber',
        filter: { categories: [EventCategory.USER] },
        handler: userHandler,
        priority: 100
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.PERFORMANCE_METRIC,
        category: EventCategory.PERFORMANCE,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { metric: 'cpu', value: 50 }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(performanceHandler).toHaveBeenCalled();
      expect(userHandler).not.toHaveBeenCalled();
    });

    it('should filter events by severity', async () => {
      const criticalHandler = jest.fn<unknown[], unknown>();
      const infoHandler = jest.fn<unknown[], unknown>();
      
      eventBus.subscribe({
        name: 'critical-subscriber',
        filter: { severities: [EventSeverity.CRITICAL] },
        handler: criticalHandler,
        priority: 100
      });

      eventBus.subscribe({
        name: 'info-subscriber',
        filter: { severities: [EventSeverity.INFO] },
        handler: infoHandler,
        priority: 100
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.ERROR_EVENT,
        category: EventCategory.SYSTEM,
        severity: EventSeverity.CRITICAL,
        source: 'test',
        data: { error: 'system failure' }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(criticalHandler).toHaveBeenCalled();
      expect(infoHandler).not.toHaveBeenCalled();
    });

    it('should filter events by source', async () => {
      const sourceAHandler = jest.fn<unknown[], unknown>();
      const sourceBHandler = jest.fn<unknown[], unknown>();
      
      eventBus.subscribe({
        name: 'source-a-subscriber',
        filter: { sources: ['source-a'] },
        handler: sourceAHandler,
        priority: 100
      });

      eventBus.subscribe({
        name: 'source-b-subscriber',
        filter: { sources: ['source-b'] },
        handler: sourceBHandler,
        priority: 100
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.INFO_EVENT,
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        source: 'source-a',
        data: { message: 'test' }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(sourceAHandler).toHaveBeenCalled();
      expect(sourceBHandler).not.toHaveBeenCalled();
    });
  });

  describe('Event Stream', () => {
    it('should create event stream for real-time updates', () => {
      const filter: EventFilter = {
        types: [AnalyticsEventType.USER_INTERACTION]
      };

      const stream = eventBus.getEventStream(filter);
      expect(stream).toBeDefined();
      expect(typeof stream.on).toBe('function');
      expect(typeof stream.emit).toBe('function');
    });

    it('should emit events on stream when matching events are published', async () => {
      const streamEvents: UnifiedAnalyticsEvent[] = [];
      const filter: EventFilter = {
        types: [AnalyticsEventType.PERFORMANCE_METRIC]
      };

      const stream = eventBus.getEventStream(filter);
      stream.on('event', (event: UnifiedAnalyticsEvent) => {
        streamEvents.push(event);
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.PERFORMANCE_METRIC,
        category: EventCategory.PERFORMANCE,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { cpu: 45 }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(streamEvents).toHaveLength(1);
      expect(streamEvents[0].type).toBe(AnalyticsEventType.PERFORMANCE_METRIC);
    });
  });

  describe('Metrics and Health', () => {
    it('should track event bus metrics', async () => {
      const initialMetrics = eventBus.getMetrics();
      expect(initialMetrics.eventsPublished).toBe(0);
      expect(initialMetrics.subscribersActive).toBe(0);

      eventBus.subscribe({
        name: 'test-subscriber',
        filter: {},
        handler: jest.fn<unknown[], unknown>(),
        priority: 100
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.INFO_EVENT,
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { message: 'test' }
      });

      const updatedMetrics = eventBus.getMetrics();
      expect(updatedMetrics.eventsPublished).toBe(1);
      expect(updatedMetrics.subscribersActive).toBe(1);
    });

    it('should report healthy status for normal operation', async () => {
      // Publish an event to establish a recent lastEventTime
      await eventBus.publishEvent({
        type: AnalyticsEventType.INFO_EVENT,
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { message: 'health test' }
      });

      const health = eventBus.getHealthStatus();
      expect(health.status).toBe('healthy');
      expect(health.issues).toHaveLength(0);
    });

    it('should detect high queue depth issues', async () => {
      // Publish many events to increase queue depth
      const promises = [];
      for (let i = 0; i < 1500; i++) {
        promises.push(eventBus.publishEvent({
          type: AnalyticsEventType.INFO_EVENT,
          category: EventCategory.SYSTEM,
          severity: EventSeverity.INFO,
          source: 'test',
          data: { message: `test-${i}` }
        }));
      }
      
      await Promise.all(promises);
      
      const health = eventBus.getHealthStatus();
      expect(health.status).toBe('degraded');
      expect(health.issues).toContain('High queue depth detected');
    });
  });

  describe('Data Migration', () => {
    it('should migrate data from legacy systems', async () => {
      const legacyEvents = [
        { id: 1, action: 'click', user: 'user1', timestamp: Date.now() },
        { id: 2, action: 'view', user: 'user2', timestamp: Date.now() }
      ];

      const transformer = (legacyEvent: unknown) => ({
        type: AnalyticsEventType.USER_INTERACTION,
        category: EventCategory.USER,
        severity: EventSeverity.INFO,
        data: {
          action: legacyEvent.action,
          userId: legacyEvent.user
  }
        metadata: {
          legacyId: legacyEvent.id,
          migrated: true
        }
      });

      const result = await eventBus.migrateFromLegacySystem(
        'legacy-system',
        legacyEvents,
        transformer
      );

      expect(result.migrated).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle migration errors gracefully', async () => {
      const legacyEvents = [
        { id: 1, action: 'click' }, // Will cause validation error
        { id: 2, action: 'view', user: 'user2' } // Valid event
      ];

      const transformer = (legacyEvent: unknown) => {
        if (!legacyEvent.user) {
          // Create invalid event that will fail validation (invalid enum value)
          return {
            type: 'INVALID_TYPE' as any, // Invalid enum value to cause validation error
            category: EventCategory.USER,
            severity: EventSeverity.INFO,
            data: { action: legacyEvent.action }
          };
        }
        return {
          type: AnalyticsEventType.USER_INTERACTION,
          category: EventCategory.USER,
          severity: EventSeverity.INFO,
          data: {
            action: legacyEvent.action,
            userId: legacyEvent.user
          }
        };
      };

      const result = await eventBus.migrateFromLegacySystem(
        'legacy-system',
        legacyEvents,
        transformer
      );

      expect(result.migrated).toBe(1); // Only valid event migrated
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle subscriber errors gracefully', async () => {
      const errorHandler = jest.fn<unknown[], unknown>().mockImplementation(() => {
        throw new Error('Subscriber error');
      });

      const errorListener = jest.fn<unknown[], unknown>();
      eventBus.on('subscriber:error', errorListener);

      eventBus.subscribe({
        name: 'error-subscriber',
        filter: {},
        handler: errorHandler,
        priority: 100
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.INFO_EVENT,
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { message: 'test' }
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(errorListener).toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should retry failed subscribers if retry config is provided', async () => {
      let callCount = 0;
      const retryHandler = jest.fn<unknown[], unknown>().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary error');
        }
        return 'success';
      });

      eventBus.subscribe({
        name: 'retry-subscriber',
        filter: {},
        handler: retryHandler,
        priority: 100,
        retryConfig: {
          maxRetries: 3,
          backoffMs: 10
        }
      });

      await eventBus.publishEvent({
        type: AnalyticsEventType.INFO_EVENT,
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { message: 'test' }
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(retryHandler).toHaveBeenCalledTimes(3);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration when none provided', () => {
      const defaultBus = new UnifiedEventBus();
      const metrics = defaultBus.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.eventsPublished).toBe('number');
    });

    it('should accept custom configuration', () => {
      const customConfig = {
        maxEventHistory: 50,
        enablePersistence: false,
        batchSize: 5,
        flushIntervalMs: 200
      };

      const customBus = new UnifiedEventBus(customConfig);
      expect(customBus).toBeDefined();
    });
  });

  describe('Cleanup and Shutdown', () => {
    it('should shutdown gracefully', async () => {
      const shutdownListener = jest.fn<unknown[], unknown>();
      eventBus.on('bus:shutdown', shutdownListener);

      await eventBus.shutdown();

      expect(shutdownListener).toHaveBeenCalled();
    });

    it('should process remaining events before shutdown', async () => {
      const handler = jest.fn<unknown[], unknown>();
      eventBus.subscribe({
        name: 'test-subscriber',
        filter: {},
        handler,
        priority: 100
      });

      // Publish event and shutdown immediately
      await eventBus.publishEvent({
        type: AnalyticsEventType.INFO_EVENT,
        category: EventCategory.SYSTEM,
        severity: EventSeverity.INFO,
        source: 'test',
        data: { message: 'test' }
      });

      await eventBus.shutdown();

      expect(handler).toHaveBeenCalled();
    });
  });
});

describe('EventBusFactory', () => {
  afterEach(async () => {
    await EventBusFactory.shutdown();
  });

  it('should create singleton instance', () => {
    const instance1 = EventBusFactory.getInstance();
    const instance2 = EventBusFactory.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should create new instances when requested', () => {
    const instance1 = EventBusFactory.createInstance();
    const instance2 = EventBusFactory.createInstance();
    
    expect(instance1).not.toBe(instance2);
  });

  it('should shutdown singleton instance', async () => {
    const instance = EventBusFactory.getInstance();
    expect(instance).toBeDefined();

    await EventBusFactory.shutdown();
    
    const newInstance = EventBusFactory.getInstance();
    expect(newInstance).not.toBe(instance);
  });
});