/**
 * Centralized Event System for PromptScape
 *
 * Provides unified event handling, routing, and coordination across:
 * - WebSocket collaboration events
 * - UI component events
 * - Workflow and task events
 * - Analytics and performance events
 * - Security and audit events
 * - System health and monitoring events
 */
import { EventEmitter } from 'events';
import { z } from 'zod';
// Event priority levels for processing and filtering
export var EventPriority;
(function (EventPriority) {
    EventPriority["CRITICAL"] = "critical";
    EventPriority["HIGH"] = "high";
    EventPriority["MEDIUM"] = "medium";
    EventPriority["LOW"] = "low"; // Debug, trace events
})(EventPriority || (EventPriority = {}));
// Event categories for organization and filtering
export var EventCategory;
(function (EventCategory) {
    EventCategory["COLLABORATION"] = "collaboration";
    EventCategory["WORKFLOW"] = "workflow";
    EventCategory["ANALYTICS"] = "analytics";
    EventCategory["SECURITY"] = "security";
    EventCategory["SYSTEM"] = "system";
    EventCategory["UI"] = "ui";
    EventCategory["PERFORMANCE"] = "performance";
})(EventCategory || (EventCategory = {}));
// Domain-specific event schemas
export const WorkflowEventSchema = z.object({
    type: z.enum([
        'task_created', 'task_assigned', 'task_started', 'task_completed', 'task_cancelled',
        'project_created', 'project_updated', 'project_deleted',
        'template_created', 'template_updated', 'template_used'
    ]),
    taskId: z.string().optional(),
    projectId: z.string().optional(),
    templateId: z.string().optional(),
    assigneeId: z.string().optional(),
    data: z.record(z.unknown()).optional()
});
export const AnalyticsEventSchema = z.object({
    type: z.enum([
        'user_action', 'page_view', 'feature_used', 'performance_metric',
        'conversion_event', 'error_tracked', 'engagement_metric'
    ]),
    action: z.string().optional(),
    feature: z.string().optional(),
    value: z.number().optional(),
    duration: z.number().optional(),
    data: z.record(z.unknown()).optional()
});
export const SecurityEventSchema = z.object({
    type: z.enum([
        'auth_attempt', 'auth_success', 'auth_failure', 'permission_denied',
        'suspicious_activity', 'security_violation', 'audit_log'
    ]),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    resource: z.string().optional(),
    data: z.record(z.unknown()).optional()
});
export const SystemEventSchema = z.object({
    type: z.enum([
        'service_started', 'service_stopped', 'health_check', 'resource_alert',
        'backup_completed', 'deployment_started', 'deployment_completed'
    ]),
    service: z.string().optional(),
    status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']).optional(),
    metrics: z.record(z.number()).optional(),
    data: z.record(z.unknown()).optional()
});
export const UIEventSchema = z.object({
    type: z.enum([
        'component_mounted', 'component_unmounted', 'user_interaction',
        'state_change', 'navigation', 'modal_opened', 'modal_closed'
    ]),
    component: z.string().optional(),
    action: z.string().optional(),
    path: z.string().optional(),
    data: z.record(z.unknown()).optional()
});
// Central event bus class
export class EventBus extends EventEmitter {
    subscriptions = new Map();
    middleware = [];
    eventHistory = [];
    maxHistorySize = 10000;
    constructor(options) {
        super();
        this.maxHistorySize = options?.maxHistorySize ?? 10000;
        if (options?.enableHistory !== false) {
            this.enableEventHistory();
        }
    }
    /**
     * Subscribe to events with filtering
     */
    subscribe(filter, handler, options) {
        const subscription = {
            id: crypto.randomUUID(),
            filter,
            handler: handler,
            priority: options?.priority ?? EventPriority.MEDIUM,
            once: options?.once ?? false
        };
        this.subscriptions.set(subscription.id, subscription);
        // Set up Node.js EventEmitter listeners for direct event types
        if (filter.types) {
            for (const type of filter.types) {
                const wrappedHandler = (event) => {
                    if (this.matchesFilter(event, filter)) {
                        handler(event);
                        if (subscription.once) {
                            this.unsubscribe(subscription.id);
                        }
                    }
                };
                this.on(type, wrappedHandler);
            }
        }
        return subscription.id;
    }
    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription)
            return false;
        this.subscriptions.delete(subscriptionId);
        // Remove Node.js EventEmitter listeners
        if (subscription.filter.types) {
            for (const type of subscription.filter.types) {
                this.removeAllListeners(type);
            }
        }
        return true;
    }
    /**
     * Publish an event through the event bus
     */
    async publish(event) {
        // Validate event has required fields
        if (!event.type || !event.timestamp || !event.id || !event.source) {
            throw new Error('Event missing required fields: type, timestamp, id, source');
        }
        // Process through middleware
        await this.processMiddleware(event);
        // Add to history
        this.addToHistory(event);
        // Emit to Node.js EventEmitter for direct subscriptions
        this.emit(event.type, event);
        // Process manual subscriptions with filters
        const matchingSubscriptions = Array.from(this.subscriptions.values())
            .filter(sub => this.matchesFilter(event, sub.filter))
            .sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority));
        // Execute handlers in priority order
        for (const subscription of matchingSubscriptions) {
            try {
                await subscription.handler(event);
                if (subscription.once) {
                    this.unsubscribe(subscription.id);
                }
            }
            catch (error) {
                // Emit error event for handler failures
                this.emit('handler_error', {
                    type: 'handler_error',
                    timestamp: new Date(),
                    id: crypto.randomUUID(),
                    source: 'event-bus',
                    originalEvent: event,
                    subscriptionId: subscription.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    }
    /**
     * Add middleware to process events
     */
    use(middleware) {
        this.middleware.push(middleware);
    }
    /**
     * Get event history with optional filtering
     */
    getHistory(filter, limit) {
        let filtered = this.eventHistory;
        if (filter) {
            filtered = filtered.filter(event => this.matchesFilter(event, filter));
        }
        if (limit) {
            filtered = filtered.slice(-limit);
        }
        return filtered;
    }
    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }
    /**
     * Get subscription statistics
     */
    getStats() {
        const eventTypes = [...new Set(this.eventHistory.map(e => e.type))];
        return {
            subscriptions: this.subscriptions.size,
            middleware: this.middleware.length,
            historySize: this.eventHistory.length,
            eventTypes
        };
    }
    async processMiddleware(event) {
        let index = 0;
        const next = async () => {
            if (index < this.middleware.length) {
                const middleware = this.middleware[index++];
                await middleware(event, next);
            }
        };
        await next();
    }
    matchesFilter(event, filter) {
        // Type filter
        if (filter.types && !filter.types.includes(event.type)) {
            return false;
        }
        // Category filter (if event has category metadata)
        if (filter.categories && event.metadata?.category) {
            if (!filter.categories.includes(event.metadata.category)) {
                return false;
            }
        }
        // Priority filter (if event has priority metadata)
        if (filter.priorities && event.metadata?.priority) {
            if (!filter.priorities.includes(event.metadata.priority)) {
                return false;
            }
        }
        // Source filter
        if (filter.sources && !filter.sources.includes(event.source)) {
            return false;
        }
        // User ID filter
        if (filter.userIds && event.userId && !filter.userIds.includes(event.userId)) {
            return false;
        }
        // Session ID filter
        if (filter.sessionIds && event.sessionId && !filter.sessionIds.includes(event.sessionId)) {
            return false;
        }
        // Time window filter
        if (filter.timeWindow) {
            const eventTime = event.timestamp.getTime();
            if (filter.timeWindow.start && eventTime < filter.timeWindow.start.getTime()) {
                return false;
            }
            if (filter.timeWindow.end && eventTime > filter.timeWindow.end.getTime()) {
                return false;
            }
        }
        return true;
    }
    priorityOrder(priority) {
        switch (priority) {
            case EventPriority.CRITICAL: return 1;
            case EventPriority.HIGH: return 2;
            case EventPriority.MEDIUM: return 3;
            case EventPriority.LOW: return 4;
            default: return 5;
        }
    }
    addToHistory(event) {
        this.eventHistory.push(event);
        // Trim history if it exceeds max size
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }
    enableEventHistory() {
        // Listen to all events for history tracking
        this.on('newListener', (eventType) => {
            if (!this.listenerCount(eventType)) {
                this.on(eventType, (event) => {
                    this.addToHistory(event);
                });
            }
        });
    }
}
next();
;
next();
;
export const eventCounts = new Map();
return (event, next) => {
    const now = Date.now();
    const key = `${event.source}-${event.type}`;
    const current = eventCounts.get(key) || { count: 0, resetTime: now + 1000 };
    if (now > current.resetTime) {
        // Reset counter
        current.count = 0;
        current.resetTime = now + 1000;
    }
    if (current.count >= maxEventsPerSecond) {
        throw new Error(`Rate limit exceeded for ${event.type} from ${event.source}`);
    }
    current.count++;
    eventCounts.set(key, current);
    next();
};
;
