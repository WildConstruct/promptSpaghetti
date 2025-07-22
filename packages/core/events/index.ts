/**
 * Event System Main Export
 * 
 * Centralized export for all event system components, utilities, and integrations.
 * This provides a single import point for the entire event system functionality.
 */

// Core Event System
export {
  EventBus,
  globalEventBus,
  BaseEvent,
  EventPriority,
  EventCategory,
  EventFactory,
  EventFilter,
  EventHandler,
  EventSubscription,
  EventMiddleware,
  LoggingMiddleware,
  ValidationMiddleware,
  RateLimitMiddleware,
  // Schema exports
  WorkflowEventSchema,
  AnalyticsEventSchema,
  SecurityEventSchema,
  SystemEventSchema,
  UIEventSchema
} from './EventSystem';

// Adapters
export {
  WebSocketEventAdapter,
  webSocketEventAdapter,
  WebSocketEventUtils
} from './adapters/WebSocketEventAdapter';

export {
  ZustandEventAdapter,
  createZustandEventAdapter,
  createEventAwareStore,
  ZustandEventUtils,
  GraphStoreEventAdapter,
  CollaborativeGraphStoreEventAdapter,
  UISettingsStoreEventAdapter,
  EventableStore,
  StateChangeEvent
} from './adapters/ZustandEventAdapter';

// React Hooks
export {
  useEventSubscription,
  useEventPublisher,
  useWorkflowEvents,
  useAnalyticsEvents,
  useUIEvents,
  useEventHistory,
  useEventStats,
  useDebouncedEventPublisher,
  useBatchedEventPublisher,
  useConditionalEventSubscription,
  useEventState,
  useEventPerformanceMonitor
} from './hooks/useEventBus';

// Middleware
export {
  createLoggingMiddleware,
  createValidationMiddleware,
  createRateLimitMiddleware,
  createTransformMiddleware,
  createSecurityMiddleware,
  createPerformanceMiddleware,
  createDeduplicationMiddleware,
  createCircuitBreakerMiddleware,
  ProductionMiddleware,
  DevelopmentMiddleware,
  TestingMiddleware
} from './middleware/EventMiddleware';

// Re-export types for external use
export type { 
  EventFilter,
  EventHandler,
  EventSubscription,
  EventMiddleware,
  BaseEvent
} from './EventSystem';

export type {
  EventableStore,
  StateChangeEvent,
  ZustandEventConfig
} from './adapters/ZustandEventAdapter';

/**
 * Event System Configuration and Setup Utilities
 */

// Environment-specific configurations
export const EventSystemConfigs = {
  production: {
    middleware: [
      createValidationMiddleware({ strictMode: false }),
      createSecurityMiddleware(),
      createRateLimitMiddleware({
        maxEventsPerSecond: 100,
        maxEventsPerMinute: 2000,
        strategy: 'drop'
      }),
      createPerformanceMiddleware({
        sampleRate: 0.1,
        slowEventThreshold: 500
      }),
      createLoggingMiddleware({
        logLevel: 'warn',
        filterPriorities: [EventPriority.HIGH, EventPriority.CRITICAL]
      })
    ],
    eventBusOptions: {
      maxHistorySize: 5000,
      enableHistory: true
    }
  },

  development: {
    middleware: [
      createValidationMiddleware({ strictMode: true }),
      createPerformanceMiddleware({
        sampleRate: 1.0,
        slowEventThreshold: 100,
        trackMemoryUsage: true
      }),
      createLoggingMiddleware({
        logLevel: 'debug',
        includeMetadata: true
      })
    ],
    eventBusOptions: {
      maxHistorySize: 1000,
      enableHistory: true
    }
  },

  testing: {
    middleware: [
      createValidationMiddleware({ strictMode: true }),
      createLoggingMiddleware({ logLevel: 'error' })
    ],
    eventBusOptions: {
      maxHistorySize: 100,
      enableHistory: false
    }
  }
};

/**
 * Initialize event system with environment-specific configuration
 */
export const initializeEventSystem = (
  environment: 'production' | 'development' | 'testing' = 'development'
) => {
  const config = EventSystemConfigs[environment];
  
  // Clear existing middleware
  globalEventBus.removeAllListeners();
  
  // Apply middleware
  config.middleware.forEach(middleware => {
    globalEventBus.use(middleware);
  });
  
  // Set up global error handling
  globalEventBus.on('handler_error', (error: any) => {
    if (environment === 'production') {
      console.error('Event handler error:', error.error);
    } else {
      console.error('Event handler error:', error);
    }
  });

  return globalEventBus;
};

/**
 * Event system health check utility
 */
export const performEventSystemHealthCheck = () => {
  const stats = globalEventBus.getStats();
  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    stats,
    issues: [] as string[]
  };

  // Check for excessive subscriptions
  if (stats.subscriptions > 1000) {
    health.issues.push('High subscription count may impact performance');
    health.status = 'degraded';
  }

  // Check history size
  if (stats.historySize > 8000) {
    health.issues.push('Event history is near capacity limit');
    health.status = 'degraded';
  }

  // Check event type diversity
  if (stats.eventTypes.length > 200) {
    health.issues.push('Large number of event types may indicate schema issues');
    health.status = 'degraded';
  }

  return health;
};

/**
 * Event system metrics collection utility
 */
export const collectEventSystemMetrics = () => {
  const stats = globalEventBus.getStats();
  const history = globalEventBus.getHistory(undefined, 100);
  
  // Calculate metrics
  const eventsByType = history.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventsByCategory = history.reduce((acc, event) => {
    const category = event.metadata?.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventsByPriority = history.reduce((acc, event) => {
    const priority = event.metadata?.priority || 'unknown';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgEventsPerMinute = history.length > 0 ? 
    (history.length / ((Date.now() - history[0].timestamp.getTime()) / 60000)) : 0;

  return {
    ...stats,
    metrics: {
      avgEventsPerMinute,
      topEventTypes: Object.entries(eventsByType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      eventsByCategory,
      eventsByPriority
    }
  };
};

/**
 * Predefined event system setups for common use cases
 */
export const EventSystemPresets = {
  /**
   * Minimal setup for simple applications
   */
  minimal: () => {
    globalEventBus.use(createValidationMiddleware());
    globalEventBus.use(createLoggingMiddleware({ logLevel: 'error' }));
  },

  /**
   * Analytics-focused setup
   */
  analytics: () => {
    globalEventBus.use(createValidationMiddleware());
    globalEventBus.use(createPerformanceMiddleware({ sampleRate: 1.0 }));
    globalEventBus.use(createLoggingMiddleware({
      logLevel: 'info',
      filterCategories: [EventCategory.ANALYTICS]
    }));
    globalEventBus.use(createRateLimitMiddleware({
      maxEventsPerSecond: 200,
      strategy: 'drop'
    }));
  },

  /**
   * High-security setup
   */
  security: () => {
    globalEventBus.use(createValidationMiddleware({ strictMode: true }));
    globalEventBus.use(createSecurityMiddleware({
      sensitiveFields: ['password', 'token', 'secret', 'key', 'ssn', 'creditCard', 'auth'],
      logSensitiveAccess: true
    }));
    globalEventBus.use(createRateLimitMiddleware({
      maxEventsPerSecond: 50,
      strategy: 'error'
    }));
    globalEventBus.use(createLoggingMiddleware({
      logLevel: 'info',
      includeMetadata: false
    }));
  },

  /**
   * High-performance setup
   */
  performance: () => {
    globalEventBus.use(createValidationMiddleware({ strictMode: false }));
    globalEventBus.use(createDeduplicationMiddleware({
      keyGenerator: (event) => `${event.source}-${event.type}`,
      windowMs: 100,
      strategy: 'drop'
    }));
    globalEventBus.use(createRateLimitMiddleware({
      maxEventsPerSecond: 500,
      strategy: 'drop'
    }));
    globalEventBus.use(createPerformanceMiddleware({
      sampleRate: 0.05,
      slowEventThreshold: 1000
    }));
  }
};

// Auto-initialize with development settings if no explicit initialization
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  initializeEventSystem(environment);
}

export default {
  EventBus,
  globalEventBus,
  EventFactory,
  initializeEventSystem,
  EventSystemPresets,
  performEventSystemHealthCheck,
  collectEventSystemMetrics
};