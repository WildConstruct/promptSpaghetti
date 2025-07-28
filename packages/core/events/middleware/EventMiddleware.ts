/**
 * Event Middleware Collection
 * 
 * Provides various middleware functions for processing events before they reach handlers.
 * Includes logging, validation, rate limiting, transformation, and security features.
 */
import { BaseEvent, EventMiddleware, EventPriority, EventCategory } from '../EventSystem';
/**
 * Enhanced logging middleware with different log levels
 */
export const createLoggingMiddleware = (options?: {)
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  includeMetadata?: boolean;
  filterCategories?: EventCategory[];
  filterPriorities?: EventPriority[];
}): EventMiddleware => {
  const {
    logLevel = 'info',
    includeMetadata = false,
    filterCategories,
    filterPriorities
  } = options || {};
  return (event: BaseEvent, next: () => void) => {
    // Apply filters
    if (filterCategories && event.metadata?.category && )
        !filterCategories.includes(event.metadata.category as EventCategory)) {
      next();
      return;
    }
    if (filterPriorities && event.metadata?.priority && )
        !filterPriorities.includes(event.metadata.priority as EventPriority)) {
      next();
      return;
    }
    // Create log message
    const baseMessage = `[EVENT] ${event.type} from ${event.source}`;}
    const timestamp = event.timestamp.toISOString();
    const userInfo = event.userId ? ` user:${event.userId}` : '';}
    const sessionInfo = event.sessionId ? ` session:${event.sessionId}` : '';}
    let logMessage = `${baseMessage} at ${timestamp}${userInfo}${sessionInfo}`;}
    if (includeMetadata && event.metadata) {
      logMessage += `\n  Metadata: ${JSON.stringify(event.metadata, null, 2)}`;}
    }
    // Log at appropriate level
    switch (logLevel) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }
    next();
  };
};
/**
 * Advanced validation middleware
 */
export const createValidationMiddleware = (options?: {)
  strictMode?: boolean;
  requiredFields?: string[];
  customValidators?: Array<(event: BaseEvent) => string | null>;
}): EventMiddleware => {
  const {
    strictMode = false,
    requiredFields = ['type', 'timestamp', 'id', 'source'],
    customValidators = []
  } = options || {};
  return (event: BaseEvent, next: () => void) => {
    const errors: string[] = [];
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in event) || event[field as keyof BaseEvent] == null) {
        errors.push(`Missing required field: ${field}`);}
      }
    }
    // Type validation
    if (typeof event.type !== 'string' || event.type.trim() === '') {
      errors.push('Event type must be a non-empty string');
    }
    if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
      errors.push('Event timestamp must be a valid Date');
    }
    if (typeof event.id !== 'string' || event.id.trim() === '') {
      errors.push('Event id must be a non-empty string');
    }
    if (typeof event.source !== 'string' || event.source.trim() === '') {
      errors.push('Event source must be a non-empty string');
    }
    // User ID validation (if present)
    if (event.userId && typeof event.userId !== 'string') {
      errors.push('Event userId must be a string');
    }
    // Session ID validation (if present)
    if (event.sessionId && typeof event.sessionId !== 'string') {
      errors.push('Event sessionId must be a string');
    }
    // Metadata validation
    if (event.metadata && typeof event.metadata !== 'object') {
      errors.push('Event metadata must be an object');
    }
    // Custom validators
    for (const validator of customValidators) {
      const error = validator(event);
      if (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) {
      const errorMessage = `Event validation failed: ${errors.join(', ')}`;}
      if (strictMode) {
        throw new Error(errorMessage);
      } else {
        console.warn(errorMessage);
        // Add validation errors to event metadata
        event.metadata = {
          ...event.metadata,
          validationErrors: errors,
        };
      }
    }
    next();
  };
};
/**
 * Rate limiting middleware with different strategies
 */
export const createRateLimitMiddleware = (options: {)
  maxEventsPerSecond?: number;
  maxEventsPerMinute?: number;
  maxEventsPerHour?: number;
  strategy?: 'drop' | 'delay' | 'error';
  keyGenerator?: (event: BaseEvent) => string;
  whitelist?: string[];
}): EventMiddleware => {
  const {
    maxEventsPerSecond = 100,
    maxEventsPerMinute = 1000,
    maxEventsPerHour = 10000,
    strategy = 'error',
    keyGenerator = (event) => `${event.source}-${event.type}`,}
    whitelist = []
  } = options;
  const eventCounts = new Map<string, {
    secondCount: number;
    minuteCount: number;
    hourCount: number;
    secondReset: number;
    minuteReset: number;
    hourReset: number;
  }>();
  return (event: BaseEvent, next: () => void) => {
    const key = keyGenerator(event);
    const now = Date.now();
    // Skip rate limiting for whitelisted keys
    if (whitelist.includes(key)) {
      next();
      return;
    }
    const counts = eventCounts.get(key) || {
      secondCount: 0,
      minuteCount: 0,
      hourCount: 0,
      secondReset: now + 1000,
      minuteReset: now + 60000,
      hourReset: now + 3600000,
    };
    // Reset counters if time windows have passed
    if (now >= counts.secondReset) {
      counts.secondCount = 0;
      counts.secondReset = now + 1000;
    }
    if (now >= counts.minuteReset) {
      counts.minuteCount = 0;
      counts.minuteReset = now + 60000;
    }
    if (now >= counts.hourReset) {
      counts.hourCount = 0;
      counts.hourReset = now + 3600000;
    }
    // Check rate limits
    const exceeded = ;
      counts.secondCount >= maxEventsPerSecond ||
      counts.minuteCount >= maxEventsPerMinute ||
      counts.hourCount >= maxEventsPerHour;
    if (exceeded) {
      const errorMessage = `Rate limit exceeded for ${key}`;}
      switch (strategy) {
        case 'drop':
          console.warn(`${errorMessage} - event dropped`);}
          return; // Don't call next()
        case 'delay':
          // Simple delay strategy - could be improved with proper queuing
          setTimeout(() => next(), 1000);
          return;
        case 'error':
        default:
          throw new Error(errorMessage);
      }
    }
    // Increment counters
    counts.secondCount++;
    counts.minuteCount++;
    counts.hourCount++;
    eventCounts.set(key, counts);
    next();
  };
};
/**
 * Event transformation middleware
 */
export const createTransformMiddleware = (options: {)
  transforms: Array<{,
    condition: (event: BaseEvent) => boolean;
    transform: (event: BaseEvent) => BaseEvent;
  }>;
}): EventMiddleware => {
  return (event: BaseEvent, next: () => void) => {
    let transformedEvent = event;
    for (const { condition, transform } of options.transforms) {
      if (condition(transformedEvent)) {
        transformedEvent = transform(transformedEvent);
      }
    }
    // Update the original event object
    Object.assign(event, transformedEvent);
    next();
  };
};
/**
 * Security middleware for sensitive data filtering
 */
export const createSecurityMiddleware = (options?: {)
  sensitiveFields?: string[];
  maskPattern?: string;
  logSensitiveAccess?: boolean;
  allowedSources?: string[];
}): EventMiddleware => {
  const {
    sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'],
    maskPattern = '***',
    logSensitiveAccess = true,
    allowedSources = []
  } = options || {};
  const maskSensitiveData = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(maskSensitiveData);
    }
    const masked: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = sensitiveFields.some(field => ;);
        key.toLowerCase().includes(field.toLowerCase())
      );
      if (isSensitive) {
        masked[key] = maskPattern;
        if (logSensitiveAccess) {
          console.warn(`Sensitive field '${key}' accessed in event ${event.id}`);}
        }
      } else if (typeof value === 'object') {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  };
  return (event: BaseEvent, next: () => void) => {
    // Check if source is allowed for sensitive data
    if (allowedSources.length > 0 && !allowedSources.includes(event.source)) {
      // Mask sensitive data in metadata
      if (event.metadata) {
        event.metadata = maskSensitiveData(event.metadata);
      }
    }
    next();
  };
};
/**
 * Performance monitoring middleware
 */
export const createPerformanceMiddleware = (options?: {)
  sampleRate?: number;
  slowEventThreshold?: number;
  trackMemoryUsage?: boolean;
}): EventMiddleware => {
  const {
    sampleRate = 1.0, // Sample 100% of events by default
    slowEventThreshold = 100, // 100ms threshold
    trackMemoryUsage = false
  } = options || {};
  return (event: BaseEvent, next: () => void) => {
    // Skip if not in sample
    if (Math.random() > sampleRate) {
      next();
      return;
    }
    const startTime = Date.now();
    const startMemory = trackMemoryUsage && typeof process !== 'undefined' ;
      ? process.memoryUsage() 
      : null;
    // Execute next middleware/handlers
    next();
    const endTime = Date.now();
    const duration = endTime - startTime;
    // Log slow events
    if (duration > slowEventThreshold) {
      console.warn(`Slow event processing: ${event.type} took ${duration}ms`);}
    }
    // Add performance metadata
    event.metadata = {
      ...event.metadata,
      performance: {,
        processingTime: duration,
        timestamp: endTime,
        ...(startMemory && trackMemoryUsage && {)
          memoryUsage: {,
            before: startMemory,
            after: typeof process !== 'undefined' ? process.memoryUsage() : null,
          }
        })
      }
    };
  };
};
/**
 * Event deduplication middleware
 */
export const createDeduplicationMiddleware = (options: {)
  keyGenerator: (event: BaseEvent) => string;
  windowMs: number;
  strategy?: 'drop' | 'merge' | 'latest';
}): EventMiddleware => {
  const {
    keyGenerator,
    windowMs,
    strategy = 'drop'
  } = options;
  const recentEvents = new Map<string, {
    event: BaseEvent;
    timestamp: number;
  }>();
  return (event: BaseEvent, next: () => void) => {
    const key = keyGenerator(event);
    const now = Date.now();
    const existing = recentEvents.get(key);
    // Clean up expired entries
    if (existing && now - existing.timestamp > windowMs) {
      recentEvents.delete(key);
    }
    const current = recentEvents.get(key);
    if (current) {
      switch (strategy) {
        case 'drop':
          console.debug(`Duplicate event dropped: ${event.type} with key ${key}`);}
          return; // Don't call next()
        case 'merge':
          // Merge metadata
          current.event.metadata = {
            ...current.event.metadata,
            ...event.metadata,
            duplicateCount: (current.event.metadata?.duplicateCount || 0) + 1,
          };
          return; // Don't call next(), use existing event
        case 'latest':
          // Replace with latest event
          recentEvents.set(key, { event, timestamp: now });
          break;
      }
    } else {
      recentEvents.set(key, { event, timestamp: now });
    }
    next();
  };
};
/**
 * Circuit breaker middleware
 */
export const createCircuitBreakerMiddleware = (options: {)
  failureThreshold: number;
  resetTimeoutMs: number;
  monitorWindowMs: number;
}): EventMiddleware => {
  const { failureThreshold, resetTimeoutMs, monitorWindowMs } = options;
  let state: 'closed' | 'open' | 'half-open' = 'closed';
  let failureCount = 0;
  let lastFailureTime = 0;
  let windowStart = Date.now();
  return (event: BaseEvent, next: () => void) => {
    const now = Date.now();
    // Reset window if expired
    if (now - windowStart > monitorWindowMs) {
      failureCount = 0;
      windowStart = now;
      if (state === 'open' && now - lastFailureTime > resetTimeoutMs) {
        state = 'half-open';
      }
    }
    switch (state) {
      case 'open':
        throw new Error('Circuit breaker is OPEN - rejecting events');
      case 'half-open':
        try {
          next();
          // Success - reset to closed
          state = 'closed';
          failureCount = 0;
        } catch (error) {
          // Failure - back to open
          state = 'open';
          lastFailureTime = now;
          throw error;
        }
        break;
      case 'closed':
      default:
        try {
          next();
        } catch (error) {
          failureCount++;
          lastFailureTime = now;
          if (failureCount >= failureThreshold) {
            state = 'open';
            console.error(`Circuit breaker opened after ${failureCount} failures`);}
          }
          throw error;
        }
        break;
    }
  };
};
/**
 * Pre-configured middleware collections
 */
export const developmentMiddleware = [
  createLoggingMiddleware({ level: 'info' }),
  createPerformanceMiddleware({ trackMemoryUsage: true })
];

export const productionMiddleware = [
  createRateLimitingMiddleware({ maxRequests: 1000, windowMs: 60000 }),
  createCircuitBreakerMiddleware({ failureThreshold: 10, resetTimeoutMs: 30000, monitorWindowMs: 60000 })
];

export const testingMiddleware = [
  createDeduplicationMiddleware({ )
    keyGenerator: (event) => `${event.type}_${event.timestamp}`, }
    windowMs: 1000 ,
  })
];