// packages/core/runtime/advanced.ts
// Advanced runtime node base classes and enhanced execution context for Epic 7
import { RuntimeNode, ExecutionContext } from './types';
import seedrandom from 'seedrandom';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AdvancedNodeConfig {
  /** Whether this node uses deterministic (seeded) random behavior */
  deterministic: boolean;
  /** Whether results can be cached for performance optimization */
  cacheable: boolean;
  /** Whether this node maintains state between executions */
  stateful: boolean;
  /** Optional performance hints */
  performanceHints?: {
    expectedExecutionTime?: 'fast' | 'medium' | 'slow';
    memoryUsage?: 'low' | 'medium' | 'high';
  };
}

export interface AdvancedNodeData {
  id: string;
  type: string;
  config: AdvancedNodeConfig;
  data: Record<string, unknown>;
  metadata?: {
    version: string;
    created: string;
    lastModified?: string;
  };
}

/**
 * Enhanced execution context for advanced nodes with state management and caching
 */
export interface AdvancedExecutionContext extends ExecutionContext {
  /** State storage for stateful nodes (nodeId -> state) */
  nodeStates: Map<string, unknown>;
  /** Current evaluation depth (for cycle detection) */
  evaluationDepth: number;
  /** Performance cache for expensive operations (key -> result) */
  cache: Map<string, unknown>;
  /** Pseudorandom number generator function for deterministic execution */
  prng?: () => number;
  /** Current graph for dependency resolution */
  graph?: Record<string, unknown>;
  /** Current platform (web, mobile, desktop) */
  platform?: string;
  /** Current locale for internationalization */
  locale?: string;
  /** Performance tracking metrics */
  performanceMetrics?: Map<string, { startTime: number; endTime?: number }>;
  /** Optional inputs storage */
  inputs?: Record<string, unknown>;
  /** Optional outputs storage */
  outputs?: Record<string, unknown>;
}

/**
 * Abstract base class for all advanced rule nodes in Epic 7
 * Extends the proven RuntimeNode architecture with enhanced capabilities
 */
export abstract class AdvancedRuntimeNode<
  TOutput = unknown
> extends RuntimeNode<TOutput> {
  protected config: AdvancedNodeConfig;

  constructor(id: string, config: AdvancedNodeConfig) {
    super(id);
    this.config = config;
  }

  /**
   * Enhanced run method with advanced execution context
   * Maintains backward compatibility with basic ExecutionContext
   */
  abstract run(ctx: AdvancedExecutionContext): Promise<TOutput> | TOutput;

  /**
   * Validate the node's configuration and state
   * Called before execution to ensure node is properly configured
   */
  abstract validate(): ValidationResult;

  /**
   * Serialize the node's complete state for persistence/export
   * Includes configuration, data, and any persistent state
   */
  abstract serialize(): AdvancedNodeData;

  /**
   * Get the current state for this node from the execution context
   */
  protected getState(ctx: AdvancedExecutionContext): unknown {
    return ctx.nodeStates.get(this.id);
  }

  /**
   * Set the current state for this node in the execution context
   */
  protected setState(ctx: AdvancedExecutionContext, state: unknown): void {
    ctx.nodeStates.set(this.id, state);
  }

  /**
   * Create a seeded random number generator for this node
   * Uses node ID and execution context for deterministic behavior
   */
  protected createSeededRNG(
    seed: string | number,
    nodeSpecificSeed?: string
  ): () => number {
    const combinedSeed = nodeSpecificSeed
      ? `${seed}-${this.id}-${nodeSpecificSeed}`
      : `${seed}-${this.id}`;
    return seedrandom(combinedSeed);
  }

  /**
   * Check if a result is cached and return it, or cache a new result
   */
  protected withCache<T>(
    ctx: AdvancedExecutionContext,
    key: string,
    computation: () => T
  ): T {
    if (!this.config.cacheable) {
      return computation();
    }

    const cacheKey = `${this.id}-${key}`;
    if (ctx.cache.has(cacheKey)) {
      return ctx.cache.get(cacheKey) as T;
    }

    const result = computation();
    ctx.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Track performance metrics for this node
   */
  protected startPerformanceTracking(ctx: AdvancedExecutionContext): void {
    if (ctx.performanceMetrics) {
      ctx.performanceMetrics.set(this.id, { startTime: Date.now() });
    }
  }

  /**
   * Complete performance tracking for this node
   */
  protected endPerformanceTracking(ctx: AdvancedExecutionContext): void {
    if (ctx.performanceMetrics) {
      const metrics = ctx.performanceMetrics.get(this.id);
      if (metrics) {
        metrics.endTime = Date.now();
      }
    }
  }

  /**
   * Get execution time for this node (in milliseconds)
   */
  protected getExecutionTime(ctx: AdvancedExecutionContext): number | null {
    if (!ctx.performanceMetrics) return null;

    const metrics = ctx.performanceMetrics.get(this.id);
    if (!metrics || !metrics.endTime) return null;

    return metrics.endTime - metrics.startTime;
  }

  /**
   * Check if execution depth exceeds maximum (cycle detection)
   */
  protected checkExecutionDepth(
    ctx: AdvancedExecutionContext,
    maxDepth = 100
  ): void {
    if (ctx.evaluationDepth > maxDepth) {
      throw new Error(
        `Maximum execution depth (${maxDepth}) exceeded - possible cycle detected`
      );
    }
  }
}

/**
 * Helper utilities for validation
 */
export class ValidationHelpers {
  /**
   * Validate that a value is within a numeric range
   */
  static validateRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value < min) {
      errors.push(`${fieldName} must be at least ${min} (got ${value})`);
    }
    if (value > max) {
      errors.push(`${fieldName} must be at most ${max} (got ${value})`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate that a string matches a pattern
   */
  static validatePattern(
    value: string,
    pattern: RegExp,
    fieldName: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!pattern.test(value)) {
      errors.push(`${fieldName} does not match required pattern ${pattern}`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate that required fields are present
   */
  static validateRequired(
    data: Record<string, unknown>,
    requiredFields: string[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const field of requiredFields) {
      if (
        !(field in data) ||
        data[field] === null ||
        data[field] === undefined
      ) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Combine multiple validation results
   */
  static combineResults(...results: ValidationResult[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const result of results) {
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}

/**
 * Helper utilities for serialization
 */
export class SerializationHelpers {
  /**
   * Safely serialize a value for storage
   */
  static serialize(value: unknown): string {
    return JSON.stringify(value, (key, val) => {
      // Handle special types
      if (val instanceof Map) {
        return { __type: 'Map', entries: Array.from(val.entries()) };
      }
      if (val instanceof Set) {
        return { __type: 'Set', values: Array.from(val.values()) };
      }
      if (val instanceof Date) {
        return { __type: 'Date', value: val.toISOString() };
      }
      if (val instanceof RegExp) {
        return { __type: 'RegExp', source: val.source, flags: val.flags };
      }
      return val;
    });
  }

  /**
   * Deserialize a value from storage
   */
  static deserialize(serialized: string): unknown {
    return JSON.parse(serialized, (key, val) => {
      if (val && typeof val === 'object' && '__type' in val) {
        switch (val.__type) {
          case 'Map':
            return new Map(val.entries);
          case 'Set':
            return new Set(val.values);
          case 'Date':
            return new Date(val.value);
          case 'RegExp':
            return new RegExp(val.source, val.flags);
        }
      }
      return val;
    });
  }

  /**
   * Create a deep clone of a value
   */
  static deepClone<T>(value: T): T {
    return this.deserialize(this.serialize(value)) as T;
  }
}
