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
    INFO_EVENT = "info_event",
    export,
    enum,
    EventSeverity
}
export type UnifiedAnalyticsEvent = z.infer<typeof BaseEventSchema>;
export declare const EventFilterSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
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
    subscriber: EventSubscriber;
    originalError: unknown;
    Promise(): any;
}
//# sourceMappingURL=UnifiedEventBus.d.ts.map