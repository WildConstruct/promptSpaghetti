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
export declare /**
 * Advanced validation middleware
 */
export declare }) => EventMiddleware;
/**
 * Rate limiting middleware with different strategies
 */
export declare     whitelist?: string[];
}) => EventMiddleware;
/**
 * Event transformation middleware
 */
export declare         transform: (event: BaseEvent) => BaseEvent;
    }>;
}) => EventMiddleware;
/**
 * Security middleware for sensitive data filtering
 */
export declare /**
 * Performance monitoring middleware
 */
export declare /**
 * Event deduplication middleware
 */
export declare     windowMs: number;
    strategy?: "drop" | "merge" | "latest";
}) => EventMiddleware;
/**
 * Circuit breaker middleware
 */
export declare /**
 * Pre-configured middleware collections
 */
export declare const developmentMiddleware: EventMiddleware[];
export declare const productionMiddleware: any[];
export declare const testingMiddleware: EventMiddleware[];
//# sourceMappingURL=EventMiddleware.d.ts.map