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
    LOW = "low",// Debug, trace events
    export,
    enum,
    EventCategory
}
export declare const AnalyticsEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SecurityEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SystemEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UIEventSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export interface EventFilter {
    types?: string;
    categories?: EventCategory;
    priorities?: EventPriority;
    sources?: string;
    userIds?: string;
    sessionIds?: string;
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
    constructor(options?: {});
    maxHistorySize?: number;
    enableHistory?: boolean;
}
//# sourceMappingURL=EventSystem.d.ts.map