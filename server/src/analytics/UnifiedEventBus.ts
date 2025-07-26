/**
 * Unified Event Bus Architecture - Story 1.5 Task 2
 * 
 * Consolidates 12+ analytics systems into a unified pub/sub event bus
 * with comprehensive event routing, filtering, and persistence.
 */

import { EventEmitter } from 'events';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Event Type Definitions from audit findings
export enum AnalyticsEventType {
  // Core Analytics Events
  GRAPH_EXECUTION = 'graph_execution',
  NODE_EXECUTION = 'node_execution',
  TOKEN_USAGE = 'token_usage',
  USER_INTERACTION = 'user_interaction',
  PERFORMANCE_METRIC = 'performance_metric',
  
  // Integration Analytics Events  
  INTEGRATION_EVENT = 'integration_event',
  INTEGRATION_HEALTH = 'integration_health',
  INTEGRATION_COST = 'integration_cost',
  
  // Behavior Analytics Events
  USER_BEHAVIOR = 'user_behavior',
  SESSION_EVENT = 'session_event',
  CANVAS_INTERACTION = 'canvas_interaction',
  
  // Security and Monitoring Events
  SECURITY_EVENT = 'security_event',
  FRAUD_DETECTION = 'fraud_detection',
  TRANSACTION_EVENT = 'transaction_event',
  SYSTEM_HEALTH = 'system_health',
  
  // Business Analytics Events
  REVENUE_EVENT = 'revenue_event',
  SEARCH_EVENT = 'search_event',
  FILE_BROWSER_EVENT = 'file_browser_event',
  
  // System Events
  ERROR_EVENT = 'error_event',
  WARNING_EVENT = 'warning_event',
  INFO_EVENT = 'info_event'
}

export enum EventSeverity {
  CRITICAL = 'critical',
  ERROR = 'error', 
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug'
}

export enum EventCategory {
  EXECUTION = 'execution',
  USER = 'user',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  BUSINESS = 'business',
  SYSTEM = 'system',
  INTEGRATION = 'integration'
}

// Base Event Schema with Zod validation
export const BaseEventSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(AnalyticsEventType),
  category: z.nativeEnum(EventCategory),
  severity: z.nativeEnum(EventSeverity),
  timestamp: z.number(),
  source: z.string(),
  version: z.string().default('1.0.0'),
  
  // Context Information
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  requestId: z.string().optional(),
  traceId: z.string().optional(),
  
  // Event Data
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).default({}),
  
  // Analytics Enrichment
  tags: z.array(z.string()).default([]),
  environment: z.string().default('development'),
  region: z.string().optional()
});

export type UnifiedAnalyticsEvent = z.infer<typeof BaseEventSchema>;

// Event Filter Schema
export const EventFilterSchema = z.object({
  types: z.array(z.nativeEnum(AnalyticsEventType)).optional(),
  categories: z.array(z.nativeEnum(EventCategory)).optional(),
  severities: z.array(z.nativeEnum(EventSeverity)).optional(),
  sources: z.array(z.string()).optional(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  sessionId: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  tags: z.array(z.string()).optional(),
  environment: z.string().optional()
});

export type EventFilter = z.infer<typeof EventFilterSchema>;

// Subscriber Interface
export interface EventSubscriber {
  id: string;
  name: string;
  filter: EventFilter;
  handler: (event: UnifiedAnalyticsEvent) => Promise<void> | void;
  priority: number;
  enabled: boolean;
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
}

// Event Bus Configuration
export interface EventBusConfig {
  maxEventHistory: number;
  enablePersistence: boolean;
  batchSize: number;
  flushIntervalMs: number;
  deadLetterQueue: boolean;
  metricsEnabled: boolean;
}

// Event Bus Metrics
export interface EventBusMetrics {
  eventsPublished: number;
  eventsProcessed: number;
  eventsFailed: number;
  subscribersActive: number;
  averageProcessingTime: number;
  queueDepth: number;
  lastEventTime: number;
}

/**
 * Unified Event Bus Implementation
 * 
 * Consolidates analytics from 12+ systems into a single event-driven architecture
 * with pub/sub patterns, filtering, routing, and persistence capabilities.
 */
export class UnifiedEventBus extends EventEmitter {
  private subscribers: Map<string, EventSubscriber> = new Map();
  private eventHistory: UnifiedAnalyticsEvent[] = [];
  private metrics: EventBusMetrics;
  private config: EventBusConfig;
  private eventQueue: UnifiedAnalyticsEvent[] = [];
  private processingQueue: boolean = false;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<EventBusConfig> = {}) {
    super();
    
    this.config = {
      maxEventHistory: 10000,
      enablePersistence: true,
      batchSize: 100,
      flushIntervalMs: 1000,
      deadLetterQueue: true,
      metricsEnabled: true,
      ...config
    };

    this.metrics = {
      eventsPublished: 0,
      eventsProcessed: 0,
      eventsFailed: 0,
      subscribersActive: 0,
      averageProcessingTime: 0,
      queueDepth: 0,
      lastEventTime: 0
    };

    this.startFlushTimer();
    this.emit('bus:initialized', { config: this.config });
  }

  /**
   * Publish an analytics event to the unified bus
   */
  async publishEvent(eventData: Omit<UnifiedAnalyticsEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      // Create unified event with ID and timestamp
      const event: UnifiedAnalyticsEvent = {
        id: uuidv4(),
        timestamp: Date.now(),
        ...eventData
      };

      // Validate event schema
      const validatedEvent = BaseEventSchema.parse(event);

      // Add to processing queue
      this.eventQueue.push(validatedEvent);
      this.metrics.eventsPublished++;
      this.metrics.queueDepth = this.eventQueue.length;
      this.metrics.lastEventTime = Date.now();

      // Emit event for immediate processing if queue is small
      if (this.eventQueue.length <= 10) {
        this.processEventQueue();
      }

      this.emit('event:published', { eventId: event.id, type: event.type, category: event.category });
      
      return event.id;
    } catch (error) {
      this.metrics.eventsFailed++;
      this.emit('event:error', { error, eventData });
      throw new Error(`Failed to publish event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Subscribe to analytics events with filtering
   */
  subscribe(subscriber: Omit<EventSubscriber, 'id'>): string {
    const subscriberId = uuidv4();
    const fullSubscriber: EventSubscriber = {
      id: subscriberId,
      priority: 100,
      enabled: true,
      ...subscriber
    };

    this.subscribers.set(subscriberId, fullSubscriber);
    this.metrics.subscribersActive = this.subscribers.size;

    this.emit('subscriber:added', { subscriberId, name: subscriber.name, filter: subscriber.filter });
    
    return subscriberId;
  }

  /**
   * Unsubscribe from analytics events
   */
  unsubscribe(subscriberId: string): boolean {
    const removed = this.subscribers.delete(subscriberId);
    this.metrics.subscribersActive = this.subscribers.size;

    if (removed) {
      this.emit('subscriber:removed', { subscriberId });
    }

    return removed;
  }

  /**
   * Get filtered events from history
   */
  getEvents(filter: EventFilter, limit: number = 100, offset: number = 0): UnifiedAnalyticsEvent[] {
    const filteredEvents = this.eventHistory.filter(event => this.matchesFilter(event, filter));
    return filteredEvents.slice(offset, offset + limit);
  }

  /**
   * Get real-time event stream for dashboards
   */
  getEventStream(filter: EventFilter): EventEmitter {
    const stream = new EventEmitter();
    
    const subscriberId = this.subscribe({
      name: `stream_${Date.now()}`,
      filter,
      handler: (event) => {
        stream.emit('event', event);
      },
      priority: 1000 // High priority for streams
    });

    // Clean up subscription when stream is closed
    stream.on('close', () => {
      this.unsubscribe(subscriberId);
    });

    return stream;
  }

  /**
   * Get event bus metrics
   */
  getMetrics(): EventBusMetrics {
    return { ...this.metrics };
  }

  /**
   * Get event bus health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: EventBusMetrics;
    issues: string[];
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check queue depth
    if (this.metrics.queueDepth > 1000) {
      issues.push('High queue depth detected');
      status = 'degraded';
    }

    // Check error rate
    const errorRate = this.metrics.eventsPublished > 0 
      ? (this.metrics.eventsFailed / this.metrics.eventsPublished) * 100 
      : 0;
    
    if (errorRate > 5) {
      issues.push('High error rate detected');
      status = errorRate > 20 ? 'unhealthy' : 'degraded';
    }

    // Check processing lag
    const processingLag = Date.now() - this.metrics.lastEventTime;
    if (processingLag > 30000) { // 30 seconds
      issues.push('Processing lag detected');
      status = 'degraded';
    }

    return { status, metrics: this.metrics, issues };
  }

  /**
   * Migrate analytics data from existing systems
   */
  async migrateFromLegacySystem(
    systemName: string, 
    events: Record<string, unknown>[], 
    transformer: (legacyEvent: Record<string, unknown>) => Partial<UnifiedAnalyticsEvent>
  ): Promise<{ migrated: number; failed: number; errors: string[] }> {
    const results = { migrated: 0, failed: 0, errors: [] as string[] };

    for (const legacyEvent of events) {
      try {
        const transformedEvent = transformer(legacyEvent);
        await this.publishEvent({
          source: systemName,
          category: EventCategory.SYSTEM,
          severity: EventSeverity.INFO,
          type: AnalyticsEventType.INFO_EVENT,
          data: transformedEvent.data || legacyEvent,
          metadata: {
            ...transformedEvent.metadata,
            migrated: true,
            originalSystem: systemName,
            migrationTime: Date.now()
          },
          ...transformedEvent
        });
        results.migrated++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to migrate event: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    this.emit('migration:completed', { systemName, results });
    return results;
  }

  /**
   * Process event queue in batches
   */
  private async processEventQueue(): Promise<void> {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.processingQueue = true;
    const startTime = Date.now();

    try {
      const batchSize = Math.min(this.config.batchSize, this.eventQueue.length);
      const batch = this.eventQueue.splice(0, batchSize);

      // Process each event in the batch
      for (const event of batch) {
        await this.processEvent(event);
      }

      // Update metrics
      const processingTime = Date.now() - startTime;
      this.metrics.averageProcessingTime = 
        (this.metrics.averageProcessingTime + processingTime) / 2;
      this.metrics.queueDepth = this.eventQueue.length;

    } catch (error) {
      this.emit('queue:error', { error, queueLength: this.eventQueue.length });
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Process individual event through subscribers
   */
  private async processEvent(event: UnifiedAnalyticsEvent): Promise<void> {
    // Add to history
    if (this.config.enablePersistence) {
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.config.maxEventHistory) {
        this.eventHistory.shift();
      }
    }

    // Get matching subscribers sorted by priority
    const matchingSubscribers = Array.from(this.subscribers.values())
      .filter(sub => sub.enabled && this.matchesFilter(event, sub.filter))
      .sort((a, b) => b.priority - a.priority);

    // Process through subscribers
    for (const subscriber of matchingSubscribers) {
      try {
        await this.processSubscriber(event, subscriber);
        this.metrics.eventsProcessed++;
      } catch (error) {
        this.metrics.eventsFailed++;
        this.emit('subscriber:error', { 
          subscriberId: subscriber.id, 
          eventId: event.id, 
          error 
        });

        // Handle retry logic if configured
        if (subscriber.retryConfig) {
          await this.retrySubscriber(event, subscriber, error);
        }
      }
    }

    this.emit('event:processed', { eventId: event.id, subscriberCount: matchingSubscribers.length });
  }

  /**
   * Process event through individual subscriber
   */
  private async processSubscriber(event: UnifiedAnalyticsEvent, subscriber: EventSubscriber): Promise<void> {
    const result = subscriber.handler(event);
    if (result instanceof Promise) {
      await result;
    }
  }

  /**
   * Retry failed subscriber processing
   */
  private async retrySubscriber(
    event: UnifiedAnalyticsEvent, 
    subscriber: EventSubscriber, 
    originalError: Error
  ): Promise<void> {
    if (!subscriber.retryConfig) return;

    for (let attempt = 1; attempt <= subscriber.retryConfig.maxRetries; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, subscriber.retryConfig!.backoffMs * attempt));
        await this.processSubscriber(event, subscriber);
        return; // Success
      } catch (retryError) {
        if (attempt === subscriber.retryConfig.maxRetries) {
          this.emit('subscriber:retry_exhausted', {
            subscriberId: subscriber.id,
            eventId: event.id,
            attempts: attempt,
            originalError,
            finalError: retryError
          });
        }
      }
    }
  }

  /**
   * Check if event matches filter criteria
   */
  private matchesFilter(event: UnifiedAnalyticsEvent, filter: EventFilter): boolean {
    if (filter.types && !filter.types.includes(event.type)) return false;
    if (filter.categories && !filter.categories.includes(event.category)) return false;
    if (filter.severities && !filter.severities.includes(event.severity)) return false;
    if (filter.sources && !filter.sources.includes(event.source)) return false;
    if (filter.userId && event.userId !== filter.userId) return false;
    if (filter.organizationId && event.organizationId !== filter.organizationId) return false;
    if (filter.sessionId && event.sessionId !== filter.sessionId) return false;
    if (filter.environment && event.environment !== filter.environment) return false;
    if (filter.startTime && event.timestamp < filter.startTime) return false;
    if (filter.endTime && event.timestamp > filter.endTime) return false;
    
    // Tag matching (event must have all specified tags)
    if (filter.tags && filter.tags.length > 0) {
      const hasAllTags = filter.tags.every(tag => event.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  }

  /**
   * Start flush timer for batch processing
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.processEventQueue();
      }
    }, this.config.flushIntervalMs);
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Process remaining events
    while (this.eventQueue.length > 0) {
      await this.processEventQueue();
    }

    this.subscribers.clear();
    this.eventHistory = [];
    
    this.emit('bus:shutdown');
  }
}

/**
 * Event Bus Factory for dependency injection
 */
export class EventBusFactory {
  private static instance: UnifiedEventBus | null = null;

  static getInstance(config?: Partial<EventBusConfig>): UnifiedEventBus {
    if (!this.instance) {
      this.instance = new UnifiedEventBus(config);
    }
    return this.instance;
  }

  static createInstance(config?: Partial<EventBusConfig>): UnifiedEventBus {
    return new UnifiedEventBus(config);
  }

  static async shutdown(): Promise<void> {
    if (this.instance) {
      await this.instance.shutdown();
      this.instance = null;
    }
  }
}

export default UnifiedEventBus;