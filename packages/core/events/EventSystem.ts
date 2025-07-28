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

// Base event interface that all events must extend

export interface BaseEvent {
  type: string;,
  timestamp: Date;
  id: string;,
  source: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  // Event priority levels for processing and filtering
}
export enum EventPriority {
  CRITICAL = 'critical',   // System errors, security issues
  HIGH = 'high',          // User actions, workflow changes
  MEDIUM = 'medium',      // Analytics, notifications
  LOW = 'low'            // Debug, trace events
  // Event categories for organization and filtering
  export enum EventCategory {
  COLLABORATION = 'collaboration',
  WORKFLOW = 'workflow',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  SYSTEM = 'system',
  UI = 'ui',
  PERFORMANCE = 'performance'
  // Domain-specific event schemas
  export const WorkflowEventSchema = z.object({)
  type: z.enum([),
  'task_created', 'task_assigned', 'task_started', 'task_completed', 'task_cancelled',
  'project_created', 'project_updated', 'project_deleted',
  'template_created', 'template_updated', 'template_used'
  ]),
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  templateId: z.string().optional(),
  assigneeId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export const AnalyticsEventSchema = z.object({)
  type: z.enum([),
  'user_action', 'page_view', 'feature_used', 'performance_metric',
  'conversion_event', 'error_tracked', 'engagement_metric'
  ]),
  action: z.string().optional(),
  feature: z.string().optional(),
  value: z.number().optional(),
  duration: z.number().optional(),
  data: z.record(z.unknown()).optional(),
});

export const SecurityEventSchema = z.object({)
  type: z.enum([),
  'auth_attempt', 'auth_success', 'auth_failure', 'permission_denied',
  'suspicious_activity', 'security_violation', 'audit_log'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  resource: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export const SystemEventSchema = z.object({)
  type: z.enum([),
  'service_started', 'service_stopped', 'health_check', 'resource_alert',
  'backup_completed', 'deployment_started', 'deployment_completed'
  ]),
  service: z.string().optional(),
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']).optional(),
  metrics: z.record(z.number()).optional(),
  data: z.record(z.unknown()).optional(),
});

export const UIEventSchema = z.object({)
  type: z.enum([),
  'component_mounted', 'component_unmounted', 'user_interaction',
  'state_change', 'navigation', 'modal_opened', 'modal_closed'
  ]),
  component: z.string().optional(),
  action: z.string().optional(),
  path: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

// Event filter interface for subscriptions

export interface EventFilter {
  types?: string;
  categories?: EventCategory;
  priorities?: EventPriority;
  sources?: string;
  userIds?: string;
  sessionIds?: string;
  timeWindow?: {,
  start?: Date;
  end?: Date;
};

// Event handler function type
}
export type EventHandler<T extends BaseEvent = BaseEvent> = (event: T) => void | Promise<void>;

// Event subscription interface

export interface EventSubscription {
  id: string;,
  filter: EventFilter;
  handler: EventHandler;,
  priority: EventPriority;
  once?: boolean;
  // Event middleware for processing events before handlers
}
export type EventMiddleware = (event: BaseEvent, next: () => void) => void | Promise<void>;

// Central event bus class
export class EventBus extends EventEmitter {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private middleware: EventMiddleware = [];
  private eventHistory: BaseEvent = [];
  private maxHistorySize: number = 10000;
  constructor(options?: {,)
  maxHistorySize?: number;
  enableHistory?: boolean;
}) {
  super();
  this.maxHistorySize = options?.maxHistorySize ?? 10000;
  if (options?.enableHistory !== false) {
  this.enableEventHistory();
  /**
  * Subscribe to events with filtering
  */
  subscribe<T extends BaseEvent = BaseEvent>(filter: EventFilter,)
  handler: EventHandler<T>,
  options?: {,
  priority?: EventPriority;
  once?: boolean;
  ): string {,
  const subscription: EventSubscription = {,
  id: crypto.randomUUID(),
  filter,
  handler: handler as EventHandler,
  priority: options?.priority ?? EventPriority.MEDIUM,
  once: options?.once ?? false,
};
    this.subscriptions.set(subscription.id, subscription);
    // Set up Node.js EventEmitter listeners for direct event types
    if (filter.types) {
  for (const type of filter.types) {
  const wrappedHandler = (event: BaseEvent) => {,
  if (this.matchesFilter(event, filter)) {
  handler(event as T);
  if (subscription.once) {
  this.unsubscribe(subscription.id);
};
        this.on(type, wrappedHandler);
    return subscription.id;
  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
  const subscription = this.subscriptions.get(subscriptionId);
  if (!subscription) return false;
  this.subscriptions.delete(subscriptionId);
  // Remove Node.js EventEmitter listeners
  if (subscription.filter.types) {
  for (const type of subscription.filter.types) {
  this.removeAllListeners(type);
  return true;
  /**
  * Publish an event through the event bus
  */
  async publish(event: BaseEvent): Promise<void> {,
  // Validate event has required fields
  if (!event.type || !event.timestamp || !event.id || !event.source) {
  throw new Error('Event missing required fields: type, timestamp, id, source');
  // Process through middleware
  await this.processMiddleware(event);
  // Add to history
  this.addToHistory(event);
  // Emit to Node.js EventEmitter for direct subscriptions
  this.emit(event.type, event);
  // Process manual subscriptions with filters
  const matchingSubscriptions = Array.from(this.subscriptions.values());
  .filter(sub => this.matchesFilter(event, sub.filter))
  .sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority));
  // Execute handlers in priority order
  for (const subscription of matchingSubscriptions) {
  try {
  await subscription.handler(event);
  if (subscription.once) {
  this.unsubscribe(subscription.id);
} catch (error) {
  // Emit error event for handler failures
  this.emit('handler_error', {)
  type: 'handler_error',
  timestamp: new Date(),
  id: crypto.randomUUID(),
  source: 'event-bus',
  originalEvent: event,
  subscriptionId: subscription.id,
  error: error instanceof Error ? error.message : 'Unknown error',
});
  /**
   * Add middleware to process events
   */
  use(middleware: EventMiddleware): void {
  this.middleware.push(middleware);
  /**
  * Get event history with optional filtering
  */
  getHistory(filter?: EventFilter, limit?: number): BaseEvent {,
  let filtered = this.eventHistory;
  if (filter) {
  filtered = filtered.filter(event => this.matchesFilter(event, filter));
  if (limit) {
  filtered = filtered.slice(-limit);
  return filtered;
  /**
  * Clear event history
  */
  clearHistory(): void {,
  this.eventHistory = [];
  /**
  * Get subscription statistics
  */
  getStats(): {,
  subscriptions: number;,
  middleware: number;
  historySize: number;,
  eventTypes: string;
  const eventTypes = [...new Set(this.eventHistory.map(e => e.type))];
  return {
  subscriptions: this.subscriptions.size,
  middleware: this.middleware.length,
  historySize: this.eventHistory.length,
  eventTypes
};
  private async processMiddleware(event: BaseEvent): Promise<void> {
    let index = 0;
    const next = async () => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++];
        await middleware(event, next);
    };
    await next();
  private matchesFilter(event: BaseEvent, filter: EventFilter): boolean {
  // Type filter
  if (filter.types && !filter.types.includes(event.type)) {
  return false;
  // Category filter (if event has category metadata)
  if (filter.categories && event.metadata?.category) {
  if (!filter.categories.includes(event.metadata.category as EventCategory)) {
  return false;
  // Priority filter (if event has priority metadata)
  if (filter.priorities && event.metadata?.priority) {
  if (!filter.priorities.includes(event.metadata.priority as EventPriority)) {
  return false;
  // Source filter
  if (filter.sources && !filter.sources.includes(event.source)) {
  return false;
  // User ID filter
  if (filter.userIds && event.userId && !filter.userIds.includes(event.userId)) {
  return false;
  // Session ID filter
  if (filter.sessionIds && event.sessionId && !filter.sessionIds.includes(event.sessionId)) {
  return false;
  // Time window filter
  if (filter.timeWindow) {
  const eventTime = event.timestamp.getTime();
  if (filter.timeWindow.start && eventTime < filter.timeWindow.start.getTime()) {
  return false;
  if (filter.timeWindow.end && eventTime > filter.timeWindow.end.getTime()) {
  return false;
  return true;
  private priorityOrder(priority: EventPriority): number {,
  switch (priority) {
  case EventPriority.CRITICAL: return 1;
  case EventPriority.HIGH: return 2;
  case EventPriority.MEDIUM: return 3;
  case EventPriority.LOW: return 4;,
  default: return 5;
  private addToHistory(event: BaseEvent): void {,
  this.eventHistory.push(event);
  // Trim history if it exceeds max size
  if (this.eventHistory.length > this.maxHistorySize) {
  this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
  private enableEventHistory(): void {,
  // Listen to all events for history tracking
  this.on('newListener', (eventType: string) => {,
  if (!this.listenerCount(eventType)) {
  this.on(eventType, (event: BaseEvent) => {,
  this.addToHistory(event);
});
    });

// Global event bus instance
export const globalEventBus = new EventBus();

// Event factory functions for common event types
export const createNodeEvent = (nodeId: string, eventType: string, data?: any) => ({)
  id: `${nodeId}-${Date.now()}`}
},
  type: eventType,
  nodeId,
  data,
  timestamp: Date.now();
  });

// Middleware functions
export const createLoggingMiddleware = () => (event: any, next: () => void) => {
  console.log(`Event: ${event.type}`, event);}
  next();
};

export const createValidationMiddleware = () => (event: any, next: () => void) => {
  if (!event.type || !event.id) {
    throw new Error('Event must have type and id');
  next();
};

export const createRateLimitMiddleware = (maxEvents: number = 100, timeWindow: number = 1000) => {
  const eventCounts = new Map<string, { count: number; resetTime: number }>();
  return (event, next) => {
    const now = Date.now();
    const key = `${event.source}-${event.type}`;}
    const current = eventCounts.get(key) || { count: 0, resetTime: now + 1000 };
    if (now > current.resetTime) {
      // Reset counter
      current.count = 0;
      current.resetTime = now + 1000;
    if (current.count >= maxEventsPerSecond) {
      throw new Error(`Rate limit exceeded for ${event.type} from ${event.source}`);}
    current.count++;
    eventCounts.set(key, current);
    next();
  };
};

// Export types for external use
export type {
  BaseEvent,
  EventFilter,
  EventHandler,
  EventSubscription,
  EventMiddleware
};