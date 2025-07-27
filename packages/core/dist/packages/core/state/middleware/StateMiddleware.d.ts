/**
 * State Middleware System
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Middleware pipeline for state transformations and validations
 */
import { StateChange, StateMiddleware, ValidationResult } from '../containers/BaseStateContainer';
export interface MiddlewareContext<T> {
    state: T;
    prevState: T;
    change: StateChange<T>;
    domain: string;
    userId?: string;
    metadata: Record<string, any>;
}
export interface MiddlewareResult<T> {
    state: T;
    skipNext?: boolean;
    metadata?: Record<string, any>;
    warnings?: string[];
}
export interface AsyncMiddleware<T> {
    name: string;
    order: number;
    beforeUpdate?: (context: MiddlewareContext<T>) => Promise<MiddlewareResult<T>>;
    afterUpdate?: (context: MiddlewareContext<T>) => Promise<void>;
    onError?: (error: Error, context: MiddlewareContext<T>) => Promise<void>;
}
export declare class ValidationMiddleware<T> implements StateMiddleware<T> {
    private validators;
    private options;
    name: string;
    order: number;
    constructor(validators: Array<(state: T) => ValidationResult>, options?: {
        failOnError?: boolean;
        failOnWarning?: boolean;
        logValidation?: boolean;
    });
    beforeUpdate(state: T, change: StateChange<T>): Promise<T>;
}
export declare class AuditMiddleware<T> implements StateMiddleware<T> {
    private auditLogger;
    private options;
    name: string;
    order: number;
    constructor(auditLogger: (entry: AuditEntry) => Promise<void>, options?: {
        includeStateSnapshot?: boolean;
        sensitiveFields?: string[];
        maxPayloadSize?: number;
    });
    afterUpdate(state: T, prevState: T, change: StateChange<T>): Promise<void>;
    private sanitizePayload;
    private sanitizeState;
    private generateAuditId;
}
export declare class PerformanceMiddleware<T> implements StateMiddleware<T> {
    name: string;
    order: number;
    private performanceMetrics;
    private maxMetricsHistory;
    beforeUpdate(state: T, change: StateChange<T>): Promise<T>;
    afterUpdate(state: T, prevState: T, change: StateChange<T>): Promise<void>;
    getPerformanceMetrics(): PerformanceMetric[];
    getAveragePerformance(): PerformanceStats;
    private getMemoryUsage;
    private cleanupMetrics;
}
export declare class SecurityMiddleware<T> implements StateMiddleware<T> {
    private securityRules;
    private options;
    name: string;
    order: number;
    constructor(securityRules: SecurityRule[], options?: {
        blockOnViolation?: boolean;
        logViolations?: boolean;
        alertOnCritical?: boolean;
    });
    beforeUpdate(state: T, change: StateChange<T>): Promise<T>;
    private checkSecurityRules;
    private alertCriticalViolation;
}
export declare class TransformationMiddleware<T> implements StateMiddleware<T> {
    private transformers;
    private options;
    name: string;
    order: number;
    constructor(transformers: Array<(state: T, change: StateChange<T>) => T>, options?: {
        skipOnError?: boolean;
        logTransformations?: boolean;
    });
    beforeUpdate(state: T, change: StateChange<T>): Promise<T>;
}
export declare class CachingMiddleware<T> implements StateMiddleware<T> {
    name: string;
    order: number;
    private cache;
    private maxCacheSize;
    private ttl;
    beforeUpdate(state: T, change: StateChange<T>): Promise<T>;
    afterUpdate(state: T, prevState: T, change: StateChange<T>): Promise<void>;
    private generateCacheKey;
    private hashObject;
    private isCacheValid;
    private cleanupCache;
}
export declare class MiddlewareFactory {
    static createValidationMiddleware<T>(validators: Array<(state: T) => ValidationResult>, options?: any): ValidationMiddleware<T>;
    static createAuditMiddleware<T>(auditLogger: (entry: AuditEntry) => Promise<void>, options?: any): AuditMiddleware<T>;
    static createPerformanceMiddleware<T>(): PerformanceMiddleware<T>;
    static createSecurityMiddleware<T>(rules: SecurityRule[], options?: any): SecurityMiddleware<T>;
    static createTransformationMiddleware<T>(transformers: Array<(state: T, change: StateChange<T>) => T>, options?: any): TransformationMiddleware<T>;
    static createCachingMiddleware<T>(): CachingMiddleware<T>;
}
export interface AuditEntry {
    id: string;
    timestamp: number;
    changeId: string;
    changeType: string;
    userId?: string;
    source: string;
    payload: any;
    stateSnapshot?: any;
    prevStateSnapshot?: any;
    metadata: Record<string, any>;
}
export interface PerformanceMetric {
    changeId: string;
    changeType: string;
    startTime: number;
    endTime: number;
    duration: number;
    memoryBefore: number;
    memoryAfter: number;
    metadata: Record<string, any>;
}
export interface PerformanceStats {
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
    totalOperations: number;
    operationsPerSecond: number;
}
export interface SecurityRule {
    name: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    condition: (state: any, change: StateChange<any>) => boolean;
}
export interface SecurityViolation {
    rule: string;
    severity: string;
    message: string;
    change: string;
    timestamp: number;
}
export interface CacheEntry<T> {
    state: T;
    timestamp: number;
    change: string;
}
export declare class ValidationError extends Error {
    violations: any[];
    constructor(message: string, violations: any[]);
}
export declare class SecurityViolationError extends Error {
    violations: SecurityViolation[];
    constructor(message: string, violations: SecurityViolation[]);
}
export declare const createDefaultMiddleware: <T>() => (SecurityMiddleware<T> | PerformanceMiddleware<T> | CachingMiddleware<T>)[];
//# sourceMappingURL=StateMiddleware.d.ts.map