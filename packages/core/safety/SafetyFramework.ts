/**
 * Epic 1 Safety Framework
 * Provides risk mitigation and safety controls for brownfield rebuild
 */

import { z } from 'zod';

export interface SafetyCheckResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
  metadata?: Record<string, any>;
}

export interface RollbackPoint {
  id: string;
  timestamp: Date;
  description: string;
  data: Record<string, any>;
  canRollback: boolean;
}

/**
 * Core safety framework for Epic 1 rebuild
 */
export class SafetyFramework {
  private static instance: SafetyFramework;
  private rollbackPoints: Map<string, RollbackPoint> = new Map();
  private healthChecks: Map<string, () => Promise<SafetyCheckResult>> = new Map();
  
  static getInstance(): SafetyFramework {
    if (!this.instance) {
      this.instance = new SafetyFramework();
    }
    return this.instance;
  }
  
  /**
   * Register a health check
   */
  registerHealthCheck(name: string, check: () => Promise<SafetyCheckResult>): void {
    this.healthChecks.set(name, check);
  }
  
  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<Record<string, SafetyCheckResult>> {
    const results: Record<string, SafetyCheckResult> = {};
    
    for (const [name, check] of this.healthChecks) {
      try {
        results[name] = await check();
      } catch (error) {
        results[name] = {
          passed: false,
          warnings: [],
          errors: [`Health check failed: ${error.message}`],
        };
      }
    }
    
    return results;
  }
  
  /**
   * Create a rollback point
   */
  createRollbackPoint(
    id: string,
    description: string,
    data: Record<string, any>
  ): RollbackPoint {
    const point: RollbackPoint = {
      id,
      timestamp: new Date(),
      description,
      data,
      canRollback: true,
    };
    
    this.rollbackPoints.set(id, point);
    return point;
  }
  
  /**
   * Execute rollback to a specific point
   */
  async rollback(pointId: string): Promise<SafetyCheckResult> {
    const point = this.rollbackPoints.get(pointId);
    
    if (!point) {
      return {
        passed: false,
        warnings: [],
        errors: [`Rollback point ${pointId} not found`],
      };
    }
    
    if (!point.canRollback) {
      return {
        passed: false,
        warnings: [],
        errors: [`Rollback point ${pointId} is no longer valid`],
      };
    }
    
    // Implementation would restore system state from point.data
    // This is a placeholder for the actual rollback logic
    
    return {
      passed: true,
      warnings: [],
      errors: [],
      metadata: {
        rolledBackTo: pointId,
        timestamp: point.timestamp,
      },
    };
  }
}

/**
 * Feature flag management for safe feature rollout
 */
export class FeatureFlags {
  private static instance: FeatureFlags;
  private flags: Map<string, boolean> = new Map();
  private rolloutPercentages: Map<string, number> = new Map();
  
  static getInstance(): FeatureFlags {
    if (!this.instance) {
      this.instance = new FeatureFlags();
    }
    return this.instance;
  }
  
  /**
   * Check if a feature is enabled
   */
  isEnabled(flagKey: string, userId?: string): boolean {
    const baseEnabled = this.flags.get(flagKey) ?? false;
    
    if (!baseEnabled) {
      return false;
    }
    
    // Check rollout percentage if set
    const rolloutPercentage = this.rolloutPercentages.get(flagKey);
    if (rolloutPercentage !== undefined && userId) {
      // Simple hash-based rollout
      const hash = this.hashUserId(userId);
      return (hash % 100) < rolloutPercentage;
    }
    
    return baseEnabled;
  }
  
  /**
   * Set a feature flag
   */
  setFlag(flagKey: string, enabled: boolean, rolloutPercentage?: number): void {
    this.flags.set(flagKey, enabled);
    
    if (rolloutPercentage !== undefined) {
      this.rolloutPercentages.set(flagKey, rolloutPercentage);
    }
  }
  
  /**
   * Get all feature flags
   */
  getAllFlags(): Record<string, { enabled: boolean; rolloutPercentage?: number }> {
    const result: Record<string, { enabled: boolean; rolloutPercentage?: number }> = {};
    
    for (const [key, enabled] of this.flags) {
      result[key] = {
        enabled,
        rolloutPercentage: this.rolloutPercentages.get(key),
      };
    }
    
    return result;
  }
  
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Performance monitoring for detecting degradation
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private thresholds: Map<string, number> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  /**
   * Record a metric
   */
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }
  
  /**
   * Set a performance threshold
   */
  setThreshold(name: string, threshold: number): void {
    this.thresholds.set(name, threshold);
  }
  
  /**
   * Check if performance is within thresholds
   */
  checkPerformance(): SafetyCheckResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    for (const [name, threshold] of this.thresholds) {
      const values = this.metrics.get(name);
      if (!values || values.length === 0) {
        continue;
      }
      
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      
      if (average > threshold) {
        errors.push(`${name} average (${average.toFixed(2)}) exceeds threshold (${threshold})`);
      } else if (max > threshold * 1.5) {
        warnings.push(`${name} max value (${max.toFixed(2)}) is high`);
      }
    }
    
    return {
      passed: errors.length === 0,
      warnings,
      errors,
    };
  }
}

/**
 * Data validation for preventing corruption
 */
export const DataValidation = {
  /**
   * Validate graph data structure
   */
  validateGraph: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string(),
      data: z.record(z.any()),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    })),
    edges: z.array(z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
      targetHandle: z.string().optional(),
    })),
  }),
  
  /**
   * Validate user data
   */
  validateUserData: z.object({
    id: z.string(),
    email: z.string().email(),
    createdAt: z.string().datetime(),
    preferences: z.record(z.any()).optional(),
  }),
  
  /**
   * Validate API requests
   */
  validateApiRequest: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    path: z.string(),
    headers: z.record(z.string()),
    body: z.any().optional(),
  }),
};

/**
 * Error recovery mechanisms
 */
export class ErrorRecovery {
  private static instance: ErrorRecovery;
  private errorCounts: Map<string, number> = new Map();
  private circuitBreakers: Map<string, boolean> = new Map();
  
  static getInstance(): ErrorRecovery {
    if (!this.instance) {
      this.instance = new ErrorRecovery();
    }
    return this.instance;
  }
  
  /**
   * Record an error
   */
  recordError(category: string): void {
    const count = (this.errorCounts.get(category) || 0) + 1;
    this.errorCounts.set(category, count);
    
    // Trip circuit breaker if too many errors
    if (count > 10) {
      this.circuitBreakers.set(category, true);
    }
  }
  
  /**
   * Check if circuit breaker is tripped
   */
  isCircuitBreakerTripped(category: string): boolean {
    return this.circuitBreakers.get(category) || false;
  }
  
  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(category: string): void {
    this.circuitBreakers.set(category, false);
    this.errorCounts.set(category, 0);
  }
  
  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, { count: number; circuitBreakerTripped: boolean }> {
    const stats: Record<string, { count: number; circuitBreakerTripped: boolean }> = {};
    
    for (const [category, count] of this.errorCounts) {
      stats[category] = {
        count,
        circuitBreakerTripped: this.circuitBreakers.get(category) || false,
      };
    }
    
    return stats;
  }
}

// Export singleton instances
export const safety = SafetyFramework.getInstance();
export const featureFlags = FeatureFlags.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();
export const errorRecovery = ErrorRecovery.getInstance();