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
export declare const createLoggingMiddleware: (options?: {
    logLevel?: "debug" | "info" | "warn" | "error";
    includeMetadata?: boolean;
    filterCategories?: EventCategory[];
    filterPriorities?: EventPriority[];
}) => EventMiddleware;
/**
 * Advanced validation middleware
 */
export declare const createValidationMiddleware: (options?: {
    strictMode?: boolean;
    requiredFields?: string[];
    customValidators?: Array<(event: BaseEvent) => string | null>;
}) => EventMiddleware;
/**
 * Rate limiting middleware with different strategies
 */
export declare const createRateLimitMiddleware: (options: {
    maxEventsPerSecond?: number;
    maxEventsPerMinute?: number;
    maxEventsPerHour?: number;
    strategy?: "drop" | "delay" | "error";
    keyGenerator?: (event: BaseEvent) => string;
    whitelist?: string[];
}) => EventMiddleware;
/**
 * Event transformation middleware
 */
export declare const createTransformMiddleware: (options: {
    transforms: Array<{
        condition: (event: BaseEvent) => boolean;
        transform: (event: BaseEvent) => BaseEvent;
    }>;
}) => EventMiddleware;
/**
 * Security middleware for sensitive data filtering
 */
export declare const createSecurityMiddleware: (options?: {
    sensitiveFields?: string[];
    maskPattern?: string;
    logSensitiveAccess?: boolean;
    allowedSources?: string[];
}) => EventMiddleware;
/**
 * Performance monitoring middleware
 */
export declare const createPerformanceMiddleware: (options?: {
    sampleRate?: number;
    slowEventThreshold?: number;
    trackMemoryUsage?: boolean;
}) => EventMiddleware;
//# sourceMappingURL=EventMiddleware.d.ts.map