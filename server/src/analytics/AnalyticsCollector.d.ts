import { EventEmitter } from 'events';
/**
 * Analytics event types for comprehensive tracking
 */
export declare enum AnalyticsEventType {
    GRAPH_EXECUTION_START = "graph_execution_start",
    GRAPH_EXECUTION_COMPLETE = "graph_execution_complete",
    GRAPH_EXECUTION_ERROR = "graph_execution_error",
    NODE_EXECUTION_START = "node_execution_start",
    NODE_EXECUTION_COMPLETE = "node_execution_complete",
    NODE_EXECUTION_ERROR = "node_execution_error",
    USER_SESSION_START = "user_session_start",
    USER_SESSION_END = "user_session_end",
    NODE_CREATED = "node_created",
    NODE_UPDATED = "node_updated",
    NODE_DELETED = "node_deleted",
    CONNECTION_CREATED = "connection_created",
    CONNECTION_DELETED = "connection_deleted",
    CANVAS_INTERACTION = "canvas_interaction",
    PERFORMANCE_METRIC = "performance_metric",
    MEMORY_USAGE = "memory_usage",
    TOKEN_USAGE = "token_usage",
    API_CALL = "api_call",
    FEATURE_USAGE = "feature_usage",
    ERROR_OCCURRENCE = "error_occurrence",
    CONVERSION_EVENT = "conversion_event"
}
/**
 * Base analytics event structure
 */
}
}
export interface AnalyticsEvent {
    id: string;
    type: AnalyticsEventType;
    timestamp: number;
    sessionId: string;
    userId?: string;
    organizationId?: string;
    metadata: Record<string, any>;
}
}
}
/**
 * Graph execution analytics event
 */
}
}
export interface GraphExecutionEvent extends AnalyticsEvent {
    type: AnalyticsEventType.GRAPH_EXECUTION_START | AnalyticsEventType.GRAPH_EXECUTION_COMPLETE | AnalyticsEventType.GRAPH_EXECUTION_ERROR;
    metadata: {
        graphId: string;
        nodeCount: number;
        connectionCount: number;
        executionTimeMs?: number;
        seed?: number;
        success: boolean;
        errorMessage?: string;
        outputLength?: number;
    };
}
/**
 * Node execution analytics event
 */
}
}
export interface NodeExecutionEvent extends AnalyticsEvent {
    type: AnalyticsEventType.NODE_EXECUTION_START | AnalyticsEventType.NODE_EXECUTION_COMPLETE | AnalyticsEventType.NODE_EXECUTION_ERROR;
    metadata: {
        nodeId: string;
        nodeType: string;
        graphId: string;
        executionTimeMs?: number;
        inputSize?: number;
        outputSize?: number;
        success: boolean;
        errorMessage?: string;
    };
}
/**
 * User interaction analytics event
 */
}
}
export interface UserInteractionEvent extends AnalyticsEvent {
    type: AnalyticsEventType.NODE_CREATED | AnalyticsEventType.NODE_UPDATED | AnalyticsEventType.NODE_DELETED | AnalyticsEventType.CONNECTION_CREATED | AnalyticsEventType.CONNECTION_DELETED | AnalyticsEventType.CANVAS_INTERACTION;
    metadata: {
        nodeId?: string;
        nodeType?: string;
        connectionId?: string;
        canvasPosition?: {
            x: number;
            y: number;
        };
        interactionType?: string;
        graphId: string;
    };
}
/**
 * Token usage analytics event
 */
}
}
export interface TokenUsageEvent extends AnalyticsEvent {
    type: AnalyticsEventType.TOKEN_USAGE;
    metadata: {
        provider: string;
        model: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        estimatedCost: number;
        nodeId: string;
        graphId: string;
    };
}
/**
 * Performance metrics event
 */
}
}
export interface PerformanceMetricEvent extends AnalyticsEvent {
    type: AnalyticsEventType.PERFORMANCE_METRIC;
    metadata: {
        metricName: string;
        metricValue: number;
        metricUnit: string;
        nodeId?: string;
        graphId?: string;
        component: string;
    };
}
/**
 * Analytics configuration
 */
}
}
export interface AnalyticsConfig {
    /** Enable/disable analytics collection */
    enabled: boolean;
    /** Sample rate (0-1) for non-critical events */
    sampleRate: number;
    /** Buffer size before flushing to storage */
    bufferSize: number;
    /** Buffer flush interval in milliseconds */
    flushInterval: number;
    /** Enable privacy mode (anonymize sensitive data) */
    privacyMode: boolean;
    /** Maximum events to retain in memory */
    maxEvents: number;
    /** Data retention period in milliseconds */
    retentionPeriod: number;
}
}
}
/**
 * Analytics data aggregation window
 */
}
}
export interface AnalyticsWindow {
    startTime: number;
    endTime: number;
    events: AnalyticsEvent[];
    metrics: {
        totalEvents: number;
        eventsByType: Map<AnalyticsEventType, number>;
        uniqueUsers: number;
        uniqueSessions: number;
        averageExecutionTime: number;
        totalTokenUsage: number;
        totalCost: number;
        errorRate: number;
}
}
    };
}
/**
 * Comprehensive analytics collector extending existing metrics infrastructure
 */
export declare class AnalyticsCollector extends EventEmitter {
    private events;
    private config;
    private flushTimer;
    private currentSessionId;
    private sessionStartTime;
    constructor(config?: Partial<AnalyticsConfig>);
    /**
     * Start analytics collection
     */
    startCollection(): void;
    /**
     * Stop analytics collection
     */
    stopCollection(): void;
    /**
     * Record a graph execution start event
     */
    recordGraphExecutionStart(graphId: string, nodeCount: number, connectionCount: number, seed?: number): void;
    /**
     * Record a graph execution completion event
     */
    recordGraphExecutionComplete(
      graphId: string,
      executionTimeMs: number,
      outputLength: number,
      nodeCount: number,
      connectionCount: number
    ): void;
    /**
     * Record a graph execution error event
     */
    recordGraphExecutionError(
      graphId: string,
      errorMessage: string,
      nodeCount: number,
      connectionCount: number,
      executionTimeMs?: number
    ): void;
    /**
     * Record a node execution event
     */
    recordNodeExecution(
      nodeId: string,
      nodeType: string,
      graphId: string,
      executionTimeMs: number,
      success: boolean,
      inputSize?: number,
      outputSize?: number,
      errorMessage?: string
    ): void;
    /**
     * Record token usage event
     */
    recordTokenUsage(
      provider: string,
      model: string,
      promptTokens: number,
      completionTokens: number,
      estimatedCost: number,
      nodeId: string,
      graphId: string
    ): void;
    /**
     * Record user interaction event
     */
    recordUserInteraction(interactionType: AnalyticsEventType, graphId: string, metadata?: Record<string, any>): void;
    /**
     * Record performance metric
     */
    recordPerformanceMetric(
      metricName: string,
      metricValue: number,
      metricUnit: string,
      component: string,
      nodeId?: string,
      graphId?: string
    ): void;
    /**
     * Get analytics data for a time window
     */
    getAnalyticsWindow(startTime: number, endTime: number): AnalyticsWindow;
    /**
     * Get current analytics summary
     */
    getCurrentSummary(): any;
    /**
     * Record an analytics event
     */
    private recordEvent;
    /**
     * Check if an event type is critical (always recorded)
     */
    private isCriticalEvent;
    /**
     * Anonymize sensitive data in events
     */
    private anonymizeEvent;
    /**
     * Simple hash function for anonymization
     */
    private hashString;
    /**
     * Flush events to persistent storage
     */
    private flushEvents;
    /**
     * Clean up old events beyond retention period
     */
    private cleanupOldEvents;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<AnalyticsConfig>): void;
    /**
     * Export analytics data
     */
    exportData(format?: 'json' | 'csv'): string;
}
//# sourceMappingURL=AnalyticsCollector.d.ts.map