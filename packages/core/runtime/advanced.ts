// packages/core/runtime/advanced.ts
// Advanced runtime node base classes and enhanced execution context for Epic 7

import { RuntimeNode, ExecutionContext } from './index';
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
  data: Record<string, any>;
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
  nodeStates: Map<string, any>;
  /** Current evaluation depth (for cycle detection) */
  evaluationDepth: number;
  /** Performance cache for expensive operations (key -> result) */
  cache: Map<string, any>;
  /** Execution metadata and debugging info */
  executionMeta: {
    startTime: number;
    nodeExecutionOrder: string[];
    performanceMetrics: Map<string, number>;
  };
}

/**
 * Abstract base class for all advanced rule nodes in Epic 7
 * Extends the proven RuntimeNode architecture with enhanced capabilities
 */
export abstract class AdvancedRuntimeNode<TOutput = unknown> extends RuntimeNode<TOutput> {
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
  protected getState(ctx: AdvancedExecutionContext): any {
    return ctx.nodeStates.get(this.id);
  }

  /**
   * Set the current state for this node in the execution context
   */
  protected setState(ctx: AdvancedExecutionContext, state: any): void {
    ctx.nodeStates.set(this.id, state);
  }

  /**
   * Create a seeded random number generator for this node
   * Uses node ID and execution context for deterministic behavior
   */
  protected createSeededRNG(seed: string | number, nodeSpecificSeed?: string): () => number {
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
   * Record performance metrics for this node execution
   */
  protected recordPerformanceMetric(ctx: AdvancedExecutionContext, metric: string, value: number): void {
    const key = `${this.id}-${metric}`;
    ctx.executionMeta.performanceMetrics.set(key, value);
  }

  /**
   * Measure execution time of a function and record it
   */
  protected measureExecution<T>(
    ctx: AdvancedExecutionContext, 
    operation: string, 
    fn: () => T
  ): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.recordPerformanceMetric(ctx, `${operation}_duration_ms`, duration);
    return result;
  }

  /**
   * Get configuration for this node
   */
  getConfig(): AdvancedNodeConfig {
    return { ...this.config };
  }

  /**
   * Check if this node is compatible with basic execution context
   * Advanced nodes should gracefully degrade when possible
   */
  isCompatibleWithBasicContext(): boolean {
    return !this.config.stateful;
  }
}

/**
 * Utility functions for working with advanced execution contexts
 */
export class AdvancedExecutionUtils {
  /**
   * Create an enhanced execution context from a basic one
   */
  static enhanceContext(basicCtx: ExecutionContext): AdvancedExecutionContext {
    return {
      ...basicCtx,
      nodeStates: new Map(),
      evaluationDepth: 0,
      cache: new Map(),
      executionMeta: {
        startTime: performance.now(),
        nodeExecutionOrder: [],
        performanceMetrics: new Map()
      }
    };
  }

  /**
   * Clear stateful data from context (for cleanup between executions)
   */
  static clearExecutionState(ctx: AdvancedExecutionContext): void {
    ctx.nodeStates.clear();
    ctx.cache.clear();
    ctx.evaluationDepth = 0;
    ctx.executionMeta.nodeExecutionOrder.length = 0;
    ctx.executionMeta.performanceMetrics.clear();
    ctx.executionMeta.startTime = performance.now();
  }

  /**
   * Check for potential infinite loops in stateful node execution
   */
  static detectInfiniteLoop(ctx: AdvancedExecutionContext, nodeId: string): boolean {
    const MAX_DEPTH = 1000; // Configurable limit
    return ctx.evaluationDepth > MAX_DEPTH;
  }

  /**
   * Get execution statistics from the context
   */
  static getExecutionStats(ctx: AdvancedExecutionContext): {
    totalDuration: number;
    nodesExecuted: number;
    cacheHits: number;
    statefulness: number;
  } {
    const totalDuration = performance.now() - ctx.executionMeta.startTime;
    const nodesExecuted = ctx.executionMeta.nodeExecutionOrder.length;
    const cacheHits = ctx.cache.size;
    const statefulness = ctx.nodeStates.size;

    return {
      totalDuration,
      nodesExecuted,
      cacheHits,
      statefulness
    };
  }
}

/**
 * Standard validation helpers for advanced nodes
 */
export class ValidationHelpers {
  static createValidResult(): ValidationResult {
    return { valid: true, errors: [], warnings: [] };
  }

  static createInvalidResult(errors: string[], warnings: string[] = []): ValidationResult {
    return { valid: false, errors, warnings };
  }

  static validateRequired(value: any, fieldName: string): string[] {
    return value === undefined || value === null || value === '' 
      ? [`${fieldName} is required`] 
      : [];
  }

  static validateArray(value: any, fieldName: string, minLength: number = 0): string[] {
    const errors: string[] = [];
    
    if (!Array.isArray(value)) {
      errors.push(`${fieldName} must be an array`);
    } else if (value.length < minLength) {
      errors.push(`${fieldName} must have at least ${minLength} items`);
    }
    
    return errors;
  }

  static validateNumericRange(
    value: any, 
    fieldName: string, 
    min?: number, 
    max?: number
  ): string[] {
    const errors: string[] = [];
    
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${fieldName} must be a valid number`);
    } else {
      if (min !== undefined && value < min) {
        errors.push(`${fieldName} must be at least ${min}`);
      }
      if (max !== undefined && value > max) {
        errors.push(`${fieldName} must be at most ${max}`);
      }
    }
    
    return errors;
  }
}

/**
 * Enhanced AdvancedRuntimeNode with I/O system integration
 */
export abstract class AdvancedRuntimeNodeWithIO<TOutput = unknown> extends AdvancedRuntimeNode<TOutput> {
  protected ioHandler: any; // Will be imported from io-system

  constructor(id: string, config: AdvancedNodeConfig, ioSpec?: any) {
    super(id, config);
    if (ioSpec) {
      // Dynamic import to avoid circular dependency
      import('./io-system').then(({ AdvancedIOHandler }) => {
        this.ioHandler = new AdvancedIOHandler(ioSpec);
      });
    }
  }

  /**
   * Validate node configuration including I/O specification
   */
  validate(): ValidationResult {
    const baseValidation = this.validateNodeConfig();
    if (!this.ioHandler) {
      return baseValidation;
    }

    // Additional I/O validation would go here
    return baseValidation;
  }

  /**
   * Base node configuration validation
   */
  protected validateNodeConfig(): ValidationResult {
    // Override in subclasses for node-specific validation
    return ValidationHelpers.createValidResult();
  }
}

/**
 * Standard node data serialization helpers
 */
export class SerializationHelpers {
  static createAdvancedNodeData(
    id: string,
    type: string,
    config: AdvancedNodeConfig,
    data: Record<string, any>
  ): AdvancedNodeData {
    return {
      id,
      type,
      config,
      data,
      metadata: {
        version: '1.0.0',
        created: new Date().toISOString()
      }
    };
  }

  static validateSerializedData(data: AdvancedNodeData): ValidationResult {
    const errors: string[] = [];

    if (!data.id) errors.push('Node ID is required');
    if (!data.type) errors.push('Node type is required');
    if (!data.config) errors.push('Node config is required');
    if (!data.data) errors.push('Node data is required');

    if (data.config) {
      if (typeof data.config.deterministic !== 'boolean') {
        errors.push('Config.deterministic must be a boolean');
      }
      if (typeof data.config.cacheable !== 'boolean') {
        errors.push('Config.cacheable must be a boolean');
      }
      if (typeof data.config.stateful !== 'boolean') {
        errors.push('Config.stateful must be a boolean');
      }
    }

    return errors.length > 0 
      ? ValidationHelpers.createInvalidResult(errors)
      : ValidationHelpers.createValidResult();
  }
}