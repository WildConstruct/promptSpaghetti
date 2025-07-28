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
export declare export interface EventSubscription {
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
    constructor(options?: {)
        maxHistorySize?: number;
        enableHistory?: boolean;
    });
    /**
     * Subscribe to events with filtering
     */
    subscribe<T extends BaseEvent = BaseEvent>(filter: EventFilter, handler: EventHandler<T>, options?: {)
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
export declare     type: string;
    nodeId: string;
    data: any;
    timestamp: number;
};
export declare export declare export declare export type { BaseEvent, EventFilter, EventHandler, EventSubscription, EventMiddleware };
//# sourceMappingURL=EventSystem.d.ts.map