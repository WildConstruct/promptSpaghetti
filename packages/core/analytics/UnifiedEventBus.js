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
export var AnalyticsEventType;
(function (AnalyticsEventType) {
    // Core Analytics Events
    AnalyticsEventType["GRAPH_EXECUTION"] = "graph_execution";
    AnalyticsEventType["NODE_EXECUTION"] = "node_execution";
    AnalyticsEventType["TOKEN_USAGE"] = "token_usage";
    AnalyticsEventType["USER_INTERACTION"] = "user_interaction";
    AnalyticsEventType["PERFORMANCE_METRIC"] = "performance_metric";
    // Integration Analytics Events  
    AnalyticsEventType["INTEGRATION_EVENT"] = "integration_event";
    AnalyticsEventType["INTEGRATION_HEALTH"] = "integration_health";
    AnalyticsEventType["INTEGRATION_COST"] = "integration_cost";
    // Behavior Analytics Events
    AnalyticsEventType["USER_BEHAVIOR"] = "user_behavior";
    AnalyticsEventType["SESSION_EVENT"] = "session_event";
    AnalyticsEventType["CANVAS_INTERACTION"] = "canvas_interaction";
    // Security and Monitoring Events
    AnalyticsEventType["SECURITY_EVENT"] = "security_event";
    AnalyticsEventType["FRAUD_DETECTION"] = "fraud_detection";
    AnalyticsEventType["TRANSACTION_EVENT"] = "transaction_event";
    AnalyticsEventType["SYSTEM_HEALTH"] = "system_health";
    // Business Analytics Events
    AnalyticsEventType["REVENUE_EVENT"] = "revenue_event";
    AnalyticsEventType["SEARCH_EVENT"] = "search_event";
    AnalyticsEventType["FILE_BROWSER_EVENT"] = "file_browser_event";
    // System Events
    AnalyticsEventType["ERROR_EVENT"] = "error_event";
    AnalyticsEventType["WARNING_EVENT"] = "warning_event";
    AnalyticsEventType["INFO_EVENT"] = "info_event";
})(AnalyticsEventType || (AnalyticsEventType = {}));
export var EventSeverity;
(function (EventSeverity) {
    EventSeverity["CRITICAL"] = "critical";
    EventSeverity["ERROR"] = "error";
    EventSeverity["WARNING"] = "warning";
    EventSeverity["INFO"] = "info";
    EventSeverity["DEBUG"] = "debug";
})(EventSeverity || (EventSeverity = {}));
export var EventCategory;
(function (EventCategory) {
    EventCategory["EXECUTION"] = "execution";
    EventCategory["USER"] = "user";
    EventCategory["PERFORMANCE"] = "performance";
    EventCategory["SECURITY"] = "security";
    EventCategory["BUSINESS"] = "business";
    EventCategory["SYSTEM"] = "system";
    EventCategory["INTEGRATION"] = "integration";
})(EventCategory || (EventCategory = {}));
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
    data: z.record(z.any()),
    metadata: z.record(z.any()).default({}),
    // Analytics Enrichment
    tags: z.array(z.string()).default([]),
    environment: z.string().default('development'),
    region: z.string().optional()
});
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
/**
 * Unified Event Bus Implementation
 *
 * Consolidates analytics from 12+ systems into a single event-driven architecture
 * with pub/sub patterns, filtering, routing, and persistence capabilities.
 */
export class UnifiedEventBus extends EventEmitter {
    subscribers = new Map();
    eventHistory = [];
    metrics;
    config;
    eventQueue = [];
    processingQueue = false;
    flushTimer = null;
    constructor(config = {}) {
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
    async publishEvent(eventData) {
        try {
            // Create unified event with ID and timestamp
            const event = {
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
        }
        catch (error) {
            this.metrics.eventsFailed++;
            this.emit('event:error', { error, eventData });
            throw new Error(`Failed to publish event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Subscribe to analytics events with filtering
     */
    subscribe(subscriber) {
        const subscriberId = uuidv4();
        const fullSubscriber = {
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
    unsubscribe(subscriberId) {
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
    getEvents(filter, limit = 100, offset = 0) {
        const filteredEvents = this.eventHistory.filter(event => this.matchesFilter(event, filter));
        return filteredEvents.slice(offset, offset + limit);
    }
    /**
     * Get real-time event stream for dashboards
     */
    getEventStream(filter) {
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
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get event bus health status
     */
    getHealthStatus() {
        const issues = [];
        let status = 'healthy';
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
    async migrateFromLegacySystem(systemName, events, transformer) {
        const results = { migrated: 0, failed: 0, errors: [] };
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
            }
            catch (error) {
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
    async processEventQueue() {
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
        }
        catch (error) {
            this.emit('queue:error', { error, queueLength: this.eventQueue.length });
        }
        finally {
            this.processingQueue = false;
        }
    }
    /**
     * Process individual event through subscribers
     */
    async processEvent(event) {
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
            }
            catch (error) {
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
    async processSubscriber(event, subscriber) {
        const result = subscriber.handler(event);
        if (result instanceof Promise) {
            await result;
        }
    }
    /**
     * Retry failed subscriber processing
     */
    async retrySubscriber(event, subscriber, originalError) {
        if (!subscriber.retryConfig)
            return;
        for (let attempt = 1; attempt <= subscriber.retryConfig.maxRetries; attempt++) {
            try {
                await new Promise(resolve => setTimeout(resolve, subscriber.retryConfig.backoffMs * attempt));
                await this.processSubscriber(event, subscriber);
                return; // Success
            }
            catch (retryError) {
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
    matchesFilter(event, filter) {
        if (filter.types && !filter.types.includes(event.type))
            return false;
        if (filter.categories && !filter.categories.includes(event.category))
            return false;
        if (filter.severities && !filter.severities.includes(event.severity))
            return false;
        if (filter.sources && !filter.sources.includes(event.source))
            return false;
        if (filter.userId && event.userId !== filter.userId)
            return false;
        if (filter.organizationId && event.organizationId !== filter.organizationId)
            return false;
        if (filter.sessionId && event.sessionId !== filter.sessionId)
            return false;
        if (filter.environment && event.environment !== filter.environment)
            return false;
        if (filter.startTime && event.timestamp < filter.startTime)
            return false;
        if (filter.endTime && event.timestamp > filter.endTime)
            return false;
        // Tag matching (event must have all specified tags)
        if (filter.tags && filter.tags.length > 0) {
            const hasAllTags = filter.tags.every(tag => event.tags.includes(tag));
            if (!hasAllTags)
                return false;
        }
        return true;
    }
    /**
     * Start flush timer for batch processing
     */
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            if (this.eventQueue.length > 0) {
                this.processEventQueue();
            }
        }, this.config.flushIntervalMs);
    }
    /**
     * Cleanup and shutdown
     */
    async shutdown() {
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
    static instance = null;
    static getInstance(config) {
        if (!this.instance) {
            this.instance = new UnifiedEventBus(config);
        }
        return this.instance;
    }
    static createInstance(config) {
        return new UnifiedEventBus(config);
    }
    static async shutdown() {
        if (this.instance) {
            await this.instance.shutdown();
            this.instance = null;
        }
    }
}
export default UnifiedEventBus;
