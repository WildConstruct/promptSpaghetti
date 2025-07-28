/**
 * Unified Event Bus Architecture - Story 1.5 Task 2
 *
 * Consolidates 12+ analytics systems into a unified pub/sub event bus
 * with comprehensive event routing, filtering, and persistence.
 */
import { EventEmitter } from 'events';
import { z } from 'zod';
export declare enum AnalyticsEventType {
    GRAPH_EXECUTION = "graph_execution",
    GRAPH_CREATED = "graph_created",
    NODE_EXECUTION = "node_execution",
    TOKEN_USAGE = "token_usage",
    USER_INTERACTION = "user_interaction",
    PERFORMANCE_METRIC = "performance_metric",
    INTEGRATION_EVENT = "integration_event",
    INTEGRATION_HEALTH = "integration_health",
    INTEGRATION_COST = "integration_cost",
    USER_BEHAVIOR = "user_behavior",
    SESSION_EVENT = "session_event",
    CANVAS_INTERACTION = "canvas_interaction",
    SECURITY_EVENT = "security_event",
    FRAUD_DETECTION = "fraud_detection",
    TRANSACTION_EVENT = "transaction_event",
    SYSTEM_HEALTH = "system_health",
    AUTH_EVENT = "auth_event",
    REVENUE_EVENT = "revenue_event",
    SEARCH_EVENT = "search_event",
    FILE_BROWSER_EVENT = "file_browser_event",
    ERROR_EVENT = "error_event",
    WARNING_EVENT = "warning_event",
    INFO_EVENT = "info_event"
}
export declare enum EventSeverity {
    CRITICAL = "critical",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    DEBUG = "debug"
}
export declare enum EventCategory {
    EXECUTION = "execution",
    USER = "user",
    PERFORMANCE = "performance",
    SECURITY = "security",
    BUSINESS = "business",
    SYSTEM = "system",
    INTEGRATION = "integration"
}
export declare const BaseEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodNativeEnum<typeof AnalyticsEventType>;
    category: z.ZodNativeEnum<typeof EventCategory>;
    severity: z.ZodNativeEnum<typeof EventSeverity>;
    timestamp: z.ZodNumber;
    source: z.ZodString;
    version: z.ZodDefault<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    requestId: z.ZodOptional<z.ZodString>;
    traceId: z.ZodOptional<z.ZodString>;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    environment: z.ZodDefault<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    data: Record<string, unknown>;
    type: AnalyticsEventType;
    category: EventCategory;
    tags: string[];
    version: string;
    timestamp: number;
    metadata: Record<string, unknown>;
    source: string;
    environment: string;
    severity: EventSeverity;
    userId?: string | undefined;
    region?: string | undefined;
    sessionId?: string | undefined;
    requestId?: string | undefined;
    organizationId?: string | undefined;
    traceId?: string | undefined;
}, {
    id: string;
    data: Record<string, unknown>;
    type: AnalyticsEventType;
    category: EventCategory;
    timestamp: number;
    source: string;
    severity: EventSeverity;
    tags?: string[] | undefined;
    version?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    userId?: string | undefined;
    region?: string | undefined;
    environment?: string | undefined;
    sessionId?: string | undefined;
    requestId?: string | undefined;
    organizationId?: string | undefined;
    traceId?: string | undefined;
}>;
export type UnifiedAnalyticsEvent = z.infer<typeof BaseEventSchema>;
export declare const EventFilterSchema: z.ZodObject<{
    types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AnalyticsEventType>, "many">>;
    categories: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof EventCategory>, "many">>;
    severities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof EventSeverity>, "many">>;
    sources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    userId: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodNumber>;
    endTime: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    environment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tags?: string[] | undefined;
    userId?: string | undefined;
    environment?: string | undefined;
    categories?: EventCategory[] | undefined;
    sessionId?: string | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    organizationId?: string | undefined;
    types?: AnalyticsEventType[] | undefined;
    severities?: EventSeverity[] | undefined;
    sources?: string[] | undefined;
}, {
    tags?: string[] | undefined;
    userId?: string | undefined;
    environment?: string | undefined;
    categories?: EventCategory[] | undefined;
    sessionId?: string | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    organizationId?: string | undefined;
    types?: AnalyticsEventType[] | undefined;
    severities?: EventSeverity[] | undefined;
    sources?: string[] | undefined;
}>;
export type EventFilter = z.infer<typeof EventFilterSchema>;
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
export interface EventBusConfig {
    maxEventHistory: number;
    enablePersistence: boolean;
    batchSize: number;
    flushIntervalMs: number;
    deadLetterQueue: boolean;
    metricsEnabled: boolean;
}
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
export declare class UnifiedEventBus extends EventEmitter {
    private subscribers;
    private eventHistory;
    private metrics;
    private config;
    private eventQueue;
    private processingQueue;
    private flushTimer;
    constructor(config?: Partial<EventBusConfig>);
    /**
     * Publish an analytics event to the unified bus
     */
    publishEvent(eventData: Omit<UnifiedAnalyticsEvent, 'id' | 'timestamp'>): Promise<string>;
    /**
     * Subscribe to analytics events with filtering
     */
    subscribe(subscriber: Omit<EventSubscriber, 'id'>): string;
    /**
     * Unsubscribe from analytics events
     */
    unsubscribe(subscriberId: string): boolean;
    /**
     * Get filtered events from history
     */
    getEvents(filter: EventFilter, limit?: number, offset?: number): UnifiedAnalyticsEvent[];
    /**
     * Get real-time event stream for dashboards
     */
    getEventStream(filter: EventFilter): EventEmitter;
    /**
     * Get event bus metrics
     */
    getMetrics(): EventBusMetrics;
    /**
     * Get event bus health status
     */
    getHealthStatus(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: EventBusMetrics;
        issues: string[];
    };
    /**
     * Migrate analytics data from existing systems
     */
    migrateFromLegacySystem()
      systemName: string,
      events: unknown[],
      transformer: (legacyEvent: unknown)
    ) => Partial<UnifiedAnalyticsEvent>): Promise<{
        migrated: number;
        failed: number;
        errors: string[];
    }>;
    /**
     * Process event queue in batches
     */
    private processEventQueue;
    /**
     * Process individual event through subscribers
     */
    private processEvent;
    /**
     * Process event through individual subscriber
     */
    private processSubscriber;
    /**
     * Retry failed subscriber processing
     */
    private retrySubscriber;
    /**
     * Check if event matches filter criteria
     */
    private matchesFilter;
    /**
     * Start flush timer for batch processing
     */
    private startFlushTimer;
    /**
     * Cleanup and shutdown
     */
    shutdown(): Promise<void>;
}
/**
 * Event Bus Factory for dependency injection
 */
export declare class EventBusFactory {
    private static instance;
    static getInstance(config?: Partial<EventBusConfig>): UnifiedEventBus;
    static createInstance(config?: Partial<EventBusConfig>): UnifiedEventBus;
    static shutdown(): Promise<void>;
}
export default UnifiedEventBus;
//# sourceMappingURL=UnifiedEventBus.d.ts.map