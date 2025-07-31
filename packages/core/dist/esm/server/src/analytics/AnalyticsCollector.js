import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
/**
 * Analytics event types for comprehensive tracking
 */
export var AnalyticsEventType;
(function (AnalyticsEventType) {
    // Execution events
    AnalyticsEventType["GRAPH_EXECUTION_START"] = "graph_execution_start";
    AnalyticsEventType["GRAPH_EXECUTION_COMPLETE"] = "graph_execution_complete";
    AnalyticsEventType["GRAPH_EXECUTION_ERROR"] = "graph_execution_error";
    AnalyticsEventType["NODE_EXECUTION_START"] = "node_execution_start";
    AnalyticsEventType["NODE_EXECUTION_COMPLETE"] = "node_execution_complete";
    AnalyticsEventType["NODE_EXECUTION_ERROR"] = "node_execution_error";
    // User interaction events
    AnalyticsEventType["USER_SESSION_START"] = "user_session_start";
    AnalyticsEventType["USER_SESSION_END"] = "user_session_end";
    AnalyticsEventType["NODE_CREATED"] = "node_created";
    AnalyticsEventType["NODE_UPDATED"] = "node_updated";
    AnalyticsEventType["NODE_DELETED"] = "node_deleted";
    AnalyticsEventType["CONNECTION_CREATED"] = "connection_created";
    AnalyticsEventType["CONNECTION_DELETED"] = "connection_deleted";
    AnalyticsEventType["CANVAS_INTERACTION"] = "canvas_interaction";
    // Performance events
    AnalyticsEventType["PERFORMANCE_METRIC"] = "performance_metric";
    AnalyticsEventType["MEMORY_USAGE"] = "memory_usage";
    AnalyticsEventType["TOKEN_USAGE"] = "token_usage";
    AnalyticsEventType["API_CALL"] = "api_call";
    // Business events
    AnalyticsEventType["FEATURE_USAGE"] = "feature_usage";
    AnalyticsEventType["ERROR_OCCURRENCE"] = "error_occurrence";
    AnalyticsEventType["CONVERSION_EVENT"] = "conversion_event";
})(AnalyticsEventType || (AnalyticsEventType = {}));
;
/**
 * Comprehensive analytics collector extending existing metrics infrastructure
 */
export class AnalyticsCollector extends EventEmitter {
    events = [];
    config;
    flushTimer = null;
    currentSessionId = uuidv4();
    sessionStartTime = Date.now();
    constructor(config = {}) {
        super();
        this.config = {
            enabled: true,
            sampleRate: 1.0,
            bufferSize: 100,
            flushInterval: 10000, // 10 seconds
            privacyMode: false,
            maxEvents: 10000,
            retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
            ...config
        };
        if (this.config.enabled) {
            this.startCollection();
        }
    }
    /**
     * Start analytics collection
     */
    startCollection() {
        if (!this.config.enabled)
            return;
        console.log('Starting analytics collection');
        // Record session start
        this.recordEvent({
            id: uuidv4(),
            type: AnalyticsEventType.USER_SESSION_START,
            timestamp: this.sessionStartTime,
            sessionId: this.currentSessionId,
            metadata: {
                userAgent: process.env.USER_AGENT || 'server',
                platform: process.platform,
                nodeVersion: process.version
            }
        });
        // Start periodic flush
        this.flushTimer = setInterval(() => {
            this.flushEvents();
        }, this.config.flushInterval);
        // Start cleanup routine
        setInterval(() => {
            this.cleanupOldEvents();
        }, 60000); // cleanup every minute
    }
    /**
     * Stop analytics collection
     */
    stopCollection() {
        if (!this.config.enabled)
            return;
        console.log('Stopping analytics collection');
        // Record session end
        this.recordEvent({
            id: uuidv4(),
            type: AnalyticsEventType.USER_SESSION_END,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                sessionDuration: Date.now() - this.sessionStartTime,
                eventsRecorded: this.events.length
            }
        });
        // Flush remaining events
        this.flushEvents();
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
    /**
     * Record a graph execution start event
     */
    recordGraphExecutionStart(graphId, nodeCount, connectionCount, seed) {
        const event = {
            id: uuidv4(),
            type: AnalyticsEventType.GRAPH_EXECUTION_START,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                graphId,
                nodeCount,
                connectionCount,
                seed,
                success: false
            }
        };
        this.recordEvent(event);
    }
    /**
     * Record a graph execution completion event
     */
    recordGraphExecutionComplete(graphId, executionTimeMs, outputLength, nodeCount, connectionCount) {
        const event = {
            id: uuidv4(),
            type: AnalyticsEventType.GRAPH_EXECUTION_COMPLETE,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                graphId,
                nodeCount,
                connectionCount,
                executionTimeMs,
                outputLength,
                success: true
            }
        };
        this.recordEvent(event);
    }
    /**
     * Record a graph execution error event
     */
    recordGraphExecutionError(graphId, errorMessage, nodeCount, connectionCount, executionTimeMs) {
        const event = {
            id: uuidv4(),
            type: AnalyticsEventType.GRAPH_EXECUTION_ERROR,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                graphId,
                nodeCount,
                connectionCount,
                executionTimeMs,
                errorMessage,
                success: false
            }
        };
        this.recordEvent(event);
    }
    /**
     * Record a node execution event
     */
    recordNodeExecution(nodeId, nodeType, graphId, executionTimeMs, success, inputSize, outputSize, errorMessage) {
        const eventType = success
            ? AnalyticsEventType.NODE_EXECUTION_COMPLETE
            : AnalyticsEventType.NODE_EXECUTION_ERROR;
        const event = {
            id: uuidv4(),
            type: eventType,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                nodeId,
                nodeType,
                graphId,
                executionTimeMs,
                inputSize,
                outputSize,
                success,
                errorMessage
            }
        };
        this.recordEvent(event);
    }
    /**
     * Record token usage event
     */
    recordTokenUsage(provider, model, promptTokens, completionTokens, estimatedCost, nodeId, graphId) {
        const event = {
            id: uuidv4(),
            type: AnalyticsEventType.TOKEN_USAGE,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                provider,
                model,
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens,
                estimatedCost,
                nodeId,
                graphId
            }
        };
        this.recordEvent(event);
    }
    /**
     * Record user interaction event
     */
    recordUserInteraction(interactionType, graphId, metadata = {}) {
        const event = {
            id: uuidv4(),
            type: interactionType,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                graphId,
                ...metadata
            }
        };
        this.recordEvent(event);
    }
    /**
     * Record performance metric
     */
    recordPerformanceMetric(metricName, metricValue, metricUnit, component, nodeId, graphId) {
        const event = {
            id: uuidv4(),
            type: AnalyticsEventType.PERFORMANCE_METRIC,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            metadata: {
                metricName,
                metricValue,
                metricUnit,
                component,
                nodeId,
                graphId
            }
        };
        this.recordEvent(event);
    }
    /**
     * Get analytics data for a time window
     */
    getAnalyticsWindow(startTime, endTime) {
        const windowEvents = this.events.filter(event => event.timestamp >= startTime && event.timestamp <= endTime);
        const eventsByType = new Map();
        const uniqueUsers = new Set();
        const uniqueSessions = new Set();
        let totalExecutionTime = 0;
        let executionEventCount = 0;
        let totalTokens = 0;
        let totalCost = 0;
        let errorCount = 0;
        windowEvents.forEach(event => {
            // Count events by type
            eventsByType.set(event.type, (eventsByType.get(event.type) || 0) + 1);
            // Track unique users and sessions
            if (event.userId)
                uniqueUsers.add(event.userId);
            uniqueSessions.add(event.sessionId);
            // Calculate metrics
            if (event.type === AnalyticsEventType.GRAPH_EXECUTION_COMPLETE) {
                const graphEvent = event;
                if (graphEvent.metadata.executionTimeMs) {
                    totalExecutionTime += graphEvent.metadata.executionTimeMs;
                    executionEventCount++;
                }
            }
            if (event.type === AnalyticsEventType.TOKEN_USAGE) {
                const tokenEvent = event;
                totalTokens += tokenEvent.metadata.totalTokens;
                totalCost += tokenEvent.metadata.estimatedCost;
            }
            if (event.type.includes('error')) {
                errorCount++;
            }
        });
        return {
            startTime,
            endTime,
            events: windowEvents,
            metrics: {
                totalEvents: windowEvents.length,
                eventsByType,
                uniqueUsers: uniqueUsers.size,
                uniqueSessions: uniqueSessions.size,
                averageExecutionTime: executionEventCount > 0 ? totalExecutionTime / executionEventCount : 0,
                totalTokenUsage: totalTokens,
                totalCost,
                errorRate: windowEvents.length > 0 ? (errorCount / windowEvents.length) * 100 : 0
            }
        };
    }
    /**
     * Get current analytics summary
     */
    getCurrentSummary() {
        const oneHourAgo = Date.now() - 3600000;
        const window = this.getAnalyticsWindow(oneHourAgo, Date.now());
        return {
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            sessionDuration: Date.now() - this.sessionStartTime,
            totalEventsRecorded: this.events.length,
            lastHour: window.metrics,
            bufferSize: this.events.length,
            isCollectionActive: this.config.enabled && this.flushTimer !== null
        };
    }
    /**
     * Record an analytics event
     */
    recordEvent(event) {
        if (!this.config.enabled)
            return;
        // Apply sampling for non-critical events
        if (!this.isCriticalEvent(event.type) && Math.random() > this.config.sampleRate) {
            return;
        }
        // Apply privacy mode if enabled
        if (this.config.privacyMode) {
            event = this.anonymizeEvent(event);
        }
        this.events.push(event);
        this.emit('event_recorded', event);
        // Check if buffer is full
        if (this.events.length >= this.config.bufferSize) {
            this.flushEvents();
        }
        // Prevent memory overflow
        if (this.events.length > this.config.maxEvents) {
            this.events = this.events.slice(-this.config.maxEvents);
        }
    }
    /**
     * Check if an event type is critical (always recorded)
     */
    isCriticalEvent(eventType) {
        const criticalEvents = [
            AnalyticsEventType.GRAPH_EXECUTION_ERROR,
            AnalyticsEventType.NODE_EXECUTION_ERROR,
            AnalyticsEventType.ERROR_OCCURRENCE,
            AnalyticsEventType.USER_SESSION_START,
            AnalyticsEventType.USER_SESSION_END
        ];
        return criticalEvents.includes(eventType);
    }
    /**
     * Anonymize sensitive data in events
     */
    anonymizeEvent(event) {
        const anonymized = { ...event };
        // Remove or hash sensitive fields
        if (anonymized.userId) {
            anonymized.userId = this.hashString(anonymized.userId);
        }
        // Remove sensitive metadata
        if (anonymized.metadata) {
            const { userAgent, ...cleanMetadata } = anonymized.metadata;
            anonymized.metadata = cleanMetadata;
        }
        return anonymized;
    }
    /**
     * Simple hash function for anonymization
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16);
    }
    /**
     * Flush events to persistent storage
     */
    flushEvents() {
        if (this.events.length === 0)
            return;
        const eventsToFlush = [...this.events];
        this.events = [];
        // Emit flush event for storage handlers
        this.emit('events_flushed', eventsToFlush);
        console.log(`Flushed ${eventsToFlush.length} analytics events`);
    }
    /**
     * Clean up old events beyond retention period
     */
    cleanupOldEvents() {
        const cutoffTime = Date.now() - this.config.retentionPeriod;
        const originalLength = this.events.length;
        this.events = this.events.filter(event => event.timestamp > cutoffTime);
        const removedCount = originalLength - this.events.length;
        if (removedCount > 0) {
            console.log(`Cleaned up ${removedCount} old analytics events`);
        }
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (!this.config.enabled && this.flushTimer) {
            this.stopCollection();
        }
        else if (this.config.enabled && !this.flushTimer) {
            this.startCollection();
        }
    }
    /**
     * Export analytics data
     */
    exportData(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                exportTime: Date.now(),
                sessionId: this.currentSessionId,
                config: this.config,
                events: this.events
            }, null, 2);
        }
        // CSV export (simplified)
        const headers = ['id', 'type', 'timestamp', 'sessionId', 'userId', 'metadata'];
        const rows = this.events.map(event => [
            event.id,
            event.type,
            event.timestamp,
            event.sessionId,
            event.userId || '',
            JSON.stringify(event.metadata)
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}
