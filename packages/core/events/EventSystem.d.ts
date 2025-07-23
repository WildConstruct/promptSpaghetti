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
export interface BaseEvent {
    type: string;
    timestamp: Date;
    id: string;
    source: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
}
export declare enum EventPriority {
    CRITICAL = "critical",// System errors, security issues
    HIGH = "high",// User actions, workflow changes
    MEDIUM = "medium",// Analytics, notifications
    LOW = "low"
}
export declare enum EventCategory {
    COLLABORATION = "collaboration",
    WORKFLOW = "workflow",
    ANALYTICS = "analytics",
    SECURITY = "security",
    SYSTEM = "system",
    UI = "ui",
    PERFORMANCE = "performance"
}
export declare const WorkflowEventSchema: z.ZodObject<{
    type: z.ZodEnum<["task_created", "task_assigned", "task_started", "task_completed", "task_cancelled", "project_created", "project_updated", "project_deleted", "template_created", "template_updated", "template_used"]>;
    taskId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    assigneeId: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "task_created" | "task_assigned" | "task_started" | "task_completed" | "task_cancelled" | "project_created" | "project_updated" | "project_deleted" | "template_created" | "template_updated" | "template_used";
    data?: Record<string, unknown> | undefined;
    projectId?: string | undefined;
    taskId?: string | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
}, {
    type: "task_created" | "task_assigned" | "task_started" | "task_completed" | "task_cancelled" | "project_created" | "project_updated" | "project_deleted" | "template_created" | "template_updated" | "template_used";
    data?: Record<string, unknown> | undefined;
    projectId?: string | undefined;
    taskId?: string | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
}>;
export declare const AnalyticsEventSchema: z.ZodObject<{
    type: z.ZodEnum<["user_action", "page_view", "feature_used", "performance_metric", "conversion_event", "error_tracked", "engagement_metric"]>;
    action: z.ZodOptional<z.ZodString>;
    feature: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodNumber>;
    duration: z.ZodOptional<z.ZodNumber>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "user_action" | "page_view" | "feature_used" | "performance_metric" | "conversion_event" | "error_tracked" | "engagement_metric";
    value?: number | undefined;
    action?: string | undefined;
    data?: Record<string, unknown> | undefined;
    duration?: number | undefined;
    feature?: string | undefined;
}, {
    type: "user_action" | "page_view" | "feature_used" | "performance_metric" | "conversion_event" | "error_tracked" | "engagement_metric";
    value?: number | undefined;
    action?: string | undefined;
    data?: Record<string, unknown> | undefined;
    duration?: number | undefined;
    feature?: string | undefined;
}>;
export declare const SecurityEventSchema: z.ZodObject<{
    type: z.ZodEnum<["auth_attempt", "auth_success", "auth_failure", "permission_denied", "suspicious_activity", "security_violation", "audit_log"]>;
    severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "suspicious_activity" | "auth_attempt" | "auth_success" | "auth_failure" | "permission_denied" | "security_violation" | "audit_log";
    severity: "low" | "medium" | "high" | "critical";
    data?: Record<string, unknown> | undefined;
    resource?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    type: "suspicious_activity" | "auth_attempt" | "auth_success" | "auth_failure" | "permission_denied" | "security_violation" | "audit_log";
    severity: "low" | "medium" | "high" | "critical";
    data?: Record<string, unknown> | undefined;
    resource?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export declare const SystemEventSchema: z.ZodObject<{
    type: z.ZodEnum<["service_started", "service_stopped", "health_check", "resource_alert", "backup_completed", "deployment_started", "deployment_completed"]>;
    service: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["healthy", "degraded", "unhealthy", "unknown"]>>;
    metrics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "service_started" | "service_stopped" | "health_check" | "resource_alert" | "backup_completed" | "deployment_started" | "deployment_completed";
    status?: "unknown" | "healthy" | "degraded" | "unhealthy" | undefined;
    data?: Record<string, unknown> | undefined;
    metrics?: Record<string, number> | undefined;
    service?: string | undefined;
}, {
    type: "service_started" | "service_stopped" | "health_check" | "resource_alert" | "backup_completed" | "deployment_started" | "deployment_completed";
    status?: "unknown" | "healthy" | "degraded" | "unhealthy" | undefined;
    data?: Record<string, unknown> | undefined;
    metrics?: Record<string, number> | undefined;
    service?: string | undefined;
}>;
export declare const UIEventSchema: z.ZodObject<{
    type: z.ZodEnum<["component_mounted", "component_unmounted", "user_interaction", "state_change", "navigation", "modal_opened", "modal_closed"]>;
    component: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "navigation" | "state_change" | "component_mounted" | "component_unmounted" | "user_interaction" | "modal_opened" | "modal_closed";
    path?: string | undefined;
    component?: string | undefined;
    action?: string | undefined;
    data?: Record<string, unknown> | undefined;
}, {
    type: "navigation" | "state_change" | "component_mounted" | "component_unmounted" | "user_interaction" | "modal_opened" | "modal_closed";
    path?: string | undefined;
    component?: string | undefined;
    action?: string | undefined;
    data?: Record<string, unknown> | undefined;
}>;
export interface EventFilter {
    types?: string[];
    categories?: EventCategory[];
    priorities?: EventPriority[];
    sources?: string[];
    userIds?: string[];
    sessionIds?: string[];
    timeWindow?: {
        start?: Date;
        end?: Date;
    };
}
export type EventHandler<T extends BaseEvent = BaseEvent> = (event: T) => void | Promise<void>;
export interface EventSubscription {
    id: string;
    filter: EventFilter;
    handler: EventHandler;
    priority: EventPriority;
    once?: boolean;
}
export type EventMiddleware = (event: BaseEvent, next: () => void) => void | Promise<void>;
export declare class EventBus extends EventEmitter {
    private subscriptions;
    private middleware;
    private eventHistory;
    private maxHistorySize;
    constructor(options?: {
        maxHistorySize?: number;
        enableHistory?: boolean;
    });
    /**
     * Subscribe to events with filtering
     */
    subscribe<T extends BaseEvent = BaseEvent>(filter: EventFilter, handler: EventHandler<T>, options?: {
        priority?: EventPriority;
        once?: boolean;
    }): string;
    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId: string): boolean;
    /**
     * Publish an event through the event bus
     */
    publish(event: BaseEvent): Promise<void>;
    /**
     * Add middleware to process events
     */
    use(middleware: EventMiddleware): void;
    /**
     * Get event history with optional filtering
     */
    getHistory(filter?: EventFilter, limit?: number): BaseEvent[];
    /**
     * Clear event history
     */
    clearHistory(): void;
    /**
     * Get subscription statistics
     */
    getStats(): {
        subscriptions: number;
        middleware: number;
        historySize: number;
        eventTypes: string[];
    };
    private processMiddleware;
    private matchesFilter;
    private priorityOrder;
    private addToHistory;
    private enableEventHistory;
}
export declare const globalEventBus: EventBus;
export declare const createNodeEvent: (nodeId: string, eventType: string, data?: any) => {
    id: string;
    type: string;
    nodeId: string;
    data: any;
    timestamp: number;
};
export declare const createLoggingMiddleware: () => (event: any, next: () => void) => void;
export declare const createValidationMiddleware: () => (event: any, next: () => void) => void;
export declare const createRateLimitMiddleware: (maxEvents?: number, timeWindow?: number) => (event: any, next: any) => void;
export type { BaseEvent, EventFilter, EventHandler, EventSubscription, EventMiddleware };
//# sourceMappingURL=EventSystem.d.ts.map