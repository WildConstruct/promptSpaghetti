/**
 * State Middleware System
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * 
 * Middleware pipeline for state transformations and validations
 */
import { StateChange, StateMiddleware, ValidationResult, ValidationError } from '../containers/BaseStateContainer';

// Enhanced middleware types
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

// Validation middleware
export class ValidationMiddleware<T> implements StateMiddleware<T> {
  name = 'validation';
  order = 100;
  constructor()
    private validators: Array<(state: T) => ValidationResult>,
    private options: {
      failOnError?: boolean;
      failOnWarning?: boolean;
      logValidation?: boolean;
    } = {}
  ) {}
  async beforeUpdate(state: T, change: StateChange<T>): Promise<T> {
    const validationResults = this.validators.map(validator => validator(state));
    const allErrors: ValidationError[] = [];
    const allWarnings: any[] = [];
    validationResults.forEach(result => {)
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });
    if (this.options.logValidation) {
      console.log(`Validation for ${change.type}:`, {)}
        errors: allErrors.length,
        warnings: allWarnings.length,
      });
    }
    if (allErrors.length > 0 && this.options.failOnError !== false) {
      throw new ValidationError('State validation failed', allErrors);
    }
    if (allWarnings.length > 0 && this.options.failOnWarning) {
      throw new ValidationError('State validation warnings', allWarnings);
    }
    return state;
  }
}

// Audit logging middleware
export class AuditMiddleware<T> implements StateMiddleware<T> {
  name = 'audit';
  order = 50;
  constructor()
    private auditLogger: (entry: AuditEntry) => Promise<void>,
    private options: {
      includeStateSnapshot?: boolean;
      sensitiveFields?: string[];
      maxPayloadSize?: number;
    } = {}
  ) {}
  async afterUpdate(state: T, prevState: T, change: StateChange<T>): Promise<void> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: Date.now(),
      changeId: change.id,
      changeType: change.type,
      userId: change.userId,
      source: change.source,
      payload: this.sanitizePayload(change.payload),
      metadata: {,
        hasStateSnapshot: !!this.options.includeStateSnapshot,
        payloadSize: JSON.stringify(change.payload).length,
      }
    };
    if (this.options.includeStateSnapshot) {
      auditEntry.stateSnapshot = this.sanitizeState(state);
      auditEntry.prevStateSnapshot = this.sanitizeState(prevState);
    }
    await this.auditLogger(auditEntry);
  }
  private sanitizePayload(payload: any): any {
    if (!this.options.sensitiveFields) return payload;
    const sanitized = { ...payload };
    this.options.sensitiveFields.forEach(field => {)
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }
  private sanitizeState(state: T): T {
    // Remove sensitive fields from state snapshot
    return state; // Simplified implementation
  }
  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  }
}

// Performance monitoring middleware
export class PerformanceMiddleware<T> implements StateMiddleware<T> {
  name = 'performance';
  order = 10;
  private performanceMetrics = new Map<string, PerformanceMetric>();
  private maxMetricsHistory = 1000;
  async beforeUpdate(state: T, change: StateChange<T>): Promise<T> {
    // Record start time for this change
    const metric: PerformanceMetric = {
      changeId: change.id,
      changeType: change.type,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      memoryBefore: this.getMemoryUsage(),
      memoryAfter: 0,
      metadata: {,
        stateSize: JSON.stringify(state).length,
        payloadSize: JSON.stringify(change.payload).length,
      }
    };
    this.performanceMetrics.set(change.id, metric);
    return state;
  }
  async afterUpdate(state: T, prevState: T, change: StateChange<T>): Promise<void> {
    const metric = this.performanceMetrics.get(change.id);
    if (!metric) return;
    // Complete performance measurement
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.memoryAfter = this.getMemoryUsage();
    // Log performance if slow
    if (metric.duration > 100) { // 100ms threshold
      console.warn(`Slow state update detected:`, {)
        changeType: change.type,
        duration: metric.duration,
        memoryDelta: metric.memoryAfter - metric.memoryBefore
      });
    }
    // Cleanup old metrics
    this.cleanupMetrics();
  }
  getPerformanceMetrics(): PerformanceMetric[] {
    return Array.from(this.performanceMetrics.values())
      .sort((a, b) => b.startTime - a.startTime);
  }
  getAveragePerformance(): PerformanceStats {
    const metrics = this.getPerformanceMetrics();
    if (metrics.length === 0) {
      return {
        averageDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        totalOperations: 0,
        operationsPerSecond: 0,
      };
    }
    const durations = metrics.map(m => m.duration);
    const timeSpan = metrics[0].startTime - metrics[metrics.length - 1].startTime;
    return {
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      totalOperations: metrics.length,
      operationsPerSecond: timeSpan > 0 ? (metrics.length / timeSpan) * 1000 : 0
    };
  }
  private getMemoryUsage(): number {
    // Simplified memory usage tracking
    return (performance as any).memory?.usedJSHeapSize || 0;
  }
  private cleanupMetrics(): void {
    const metrics = Array.from(this.performanceMetrics.entries());
      .sort(([, a], [, b]) => b.startTime - a.startTime);
    if (metrics.length > this.maxMetricsHistory) {
      const toRemove = metrics.slice(this.maxMetricsHistory);
      toRemove.forEach(([id]) => this.performanceMetrics.delete(id));
    }
  }
}

// Security middleware
export class SecurityMiddleware<T> implements StateMiddleware<T> {
  name = 'security';
  order = 200; // High priority
  constructor()
    private securityRules: SecurityRule[],
    private options: {
      blockOnViolation?: boolean;
      logViolations?: boolean;
      alertOnCritical?: boolean;
    } = {}
  ) {}
  async beforeUpdate(state: T, change: StateChange<T>): Promise<T> {
    // Check security rules
    const violations = this.checkSecurityRules(state, change);
    if (violations.length > 0) {
      if (this.options.logViolations) {
        console.warn('Security violations detected:', violations);
      }
      const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
      if (criticalViolations.length > 0) {
        if (this.options.alertOnCritical) {
          this.alertCriticalViolation(criticalViolations);
        }
        if (this.options.blockOnViolation) {
          throw new SecurityViolationError('Critical security violation', criticalViolations);
        }
      }
    }
    return state;
  }
  private checkSecurityRules(state: T, change: StateChange<T>): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    for (const rule of this.securityRules) {
      if (rule.condition(state, change)) {
        violations.push({)
          rule: rule.name,
          severity: rule.severity,
          message: rule.message,
          change: change.id,
          timestamp: Date.now(),
        });
      }
    }
    return violations;
  }
  private alertCriticalViolation(violations: SecurityViolation[]): void {
    // Send security alert (integration with monitoring system)
    console.error('CRITICAL SECURITY VIOLATION:', violations);
  }
}

// Transformation middleware
export class TransformationMiddleware<T> implements StateMiddleware<T> {
  name = 'transformation';
  order = 75;
  constructor()
    private transformers: Array<(state: T, change: StateChange<T>) => T>,
    private options: {
      skipOnError?: boolean;
      logTransformations?: boolean;
    } = {}
  ) {}
  async beforeUpdate(state: T, change: StateChange<T>): Promise<T> {
    let transformedState = state;
    for (const transformer of this.transformers) {
      try {
        const newState = transformer(transformedState, change);
        if (this.options.logTransformations) {
          console.log('State transformation applied:', {)
            transformer: transformer.name,
            hasChanges: newState !== transformedState
          });
        }
        transformedState = newState;
      } catch (error) {
        if (this.options.skipOnError) {
          console.warn('Transformation failed, skipping:', error);
          continue;
        }
        throw error;
      }
    }
    return transformedState;
  }
}

// Caching middleware
export class CachingMiddleware<T> implements StateMiddleware<T> {
  name = 'caching';
  order = 25;
  private cache = new Map<string, CacheEntry<T>>();
  private maxCacheSize = 100;
  private ttl = 5 * 60 * 1000; // 5 minutes
  async beforeUpdate(state: T, change: StateChange<T>): Promise<T> {
    // Check if we have a cached result for this change
    const cacheKey = this.generateCacheKey(state, change);
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.state;
    }
    return state;
  }
  async afterUpdate(state: T, prevState: T, change: StateChange<T>): Promise<void> {
    // Cache the result
    const cacheKey = this.generateCacheKey(prevState, change);
    this.cache.set(cacheKey, {)
      state,
      timestamp: Date.now(),
      change: change.id,
    });
    // Cleanup old cache entries
    this.cleanupCache();
  }
  private generateCacheKey(state: T, change: StateChange<T>): string {
    // Generate deterministic cache key
    const stateHash = this.hashObject(state);
    const changeHash = this.hashObject(change.payload);
    return `${change.type}_${stateHash}_${changeHash}`;}
  }
  private hashObject(obj: any): string {
    return JSON.stringify(obj).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString(36);
  }
  private isCacheValid(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < this.ttl;
  }
  private cleanupCache(): void {
    if (this.cache.size <= this.maxCacheSize) return;
    // Remove oldest entries
    const entries = Array.from(this.cache.entries());
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }
}

// Middleware factory
export class MiddlewareFactory {
  static createValidationMiddleware<T>()
    validators: Array<(state: T) => ValidationResult>,
    options?: any
  ): ValidationMiddleware<T> {
    return new ValidationMiddleware(validators, options);
  }
  static createAuditMiddleware<T>()
    auditLogger: (entry: AuditEntry) => Promise<void>,
    options?: any
  ): AuditMiddleware<T> {
    return new AuditMiddleware(auditLogger, options);
  }
  static createPerformanceMiddleware<T>(): PerformanceMiddleware<T> {
    return new PerformanceMiddleware();
  }
  static createSecurityMiddleware<T>()
    rules: SecurityRule[],
    options?: any
  ): SecurityMiddleware<T> {
    return new SecurityMiddleware(rules, options);
  }
  static createTransformationMiddleware<T>()
    transformers: Array<(state: T, change: StateChange<T>) => T>,
    options?: any
  ): TransformationMiddleware<T> {
    return new TransformationMiddleware(transformers, options);
  }
  static createCachingMiddleware<T>(): CachingMiddleware<T> {
    return new CachingMiddleware();
  }
}

// Supporting types and interfaces
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

// Error classes
export class ValidationError extends Error {
  constructor(message: string, public violations: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SecurityViolationError extends Error {
  constructor(message: string, public violations: SecurityViolation[]) {
    super(message);
    this.name = 'SecurityViolationError';
  }
}

// Default middleware configurations
export const createDefaultMiddleware = <T>() => [
  MiddlewareFactory.createSecurityMiddleware<T>([)
    {
      name: 'no-script-injection',
      severity: 'CRITICAL',
      message: 'Script injection detected',
      condition: (state, change) => {
        const payload = JSON.stringify(change.payload);
        return /<script|javascript:|data:text\/html/.test(payload);
      }
    },
    {
      name: 'sensitive-data-protection',
      severity: 'HIGH',
      message: 'Sensitive data detected in payload',
      condition: (state, change) => {
        const payload = JSON.stringify(change.payload).toLowerCase();
        return /password|secret|token|key|credential/.test(payload);
      }
    }
  ], { blockOnViolation: true, logViolations: true }),
  MiddlewareFactory.createPerformanceMiddleware<T>(),
  MiddlewareFactory.createCachingMiddleware<T>()
];