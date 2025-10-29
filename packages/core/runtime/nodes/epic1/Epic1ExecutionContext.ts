/**
 * Epic 1 Execution Context
 * Manages deterministic execution state including seeded PRNG and variables
 */

import seedrandom from 'seedrandom';
import type { ExecutionContext } from '../../types';

/**
 * Variable value types supported by the execution context
 */
export type VariableValue =
  | string
  | number
  | boolean
  | any[]
  | Record<string, any>;

/**
 * Execution statistics
 */
export interface ExecutionStats {
  startTime: number;
  endTime?: number;
  nodesExecuted: number;
  errors: Array<{ nodeId: string; error: Error }>;
  warnings: Array<{ nodeId: string; message: string }>;
}

/**
 * Epic 1 Execution Context
 * Provides deterministic random number generation and variable management
 */
export class Epic1ExecutionContext {
  private readonly seed: string;
  private readonly prng: ReturnType<typeof seedrandom>;
  private readonly variables: Map<string, VariableValue>;
  private readonly variableProxy: Record<string, VariableValue>;
  private readonly contextView: ExecutionContext;
  private readonly nodeSeeds: Map<string, string>;
  private readonly stats: ExecutionStats;
  private depth: number = 0;
  private readonly maxDepth: number = 100;

  constructor(seed: string | number = Date.now()) {
    this.seed = String(seed);
    this.prng = seedrandom(this.seed);
    this.variables = new Map();
    this.variableProxy = new Proxy<Record<string, VariableValue>>(
      {},
      {
        get: (_target, prop) =>
          typeof prop === 'string' ? this.getVariable(prop) : undefined,
        set: (_target, prop, value) => {
          if (typeof prop === 'string') {
            this.setVariable(prop, value as VariableValue);
            return true;
          }
          return false;
        },
        has: (_target, prop) =>
          typeof prop === 'string' ? this.hasVariable(prop) : false,
        deleteProperty: (_target, prop) =>
          typeof prop === 'string' ? this.variables.delete(prop) : false,
        ownKeys: () => Array.from(this.variables.keys()),
        getOwnPropertyDescriptor: (_target, prop) => {
          if (typeof prop === 'string' && this.variables.has(prop)) {
            return {
              enumerable: true,
              configurable: true,
              value: this.getVariable(prop)
            };
          }
          return undefined;
        }
      }
    );
    this.contextView = {
      seed: this.seed,
      variables: this.variableProxy
    };
    this.nodeSeeds = new Map();
    this.stats = {
      startTime: Date.now(),
      nodesExecuted: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Get the main seed used for this execution
   */
  getSeed(): string {
    return this.seed;
  }

  /**
   * Generate a deterministic seed for a specific node
   * This ensures each node gets its own predictable seed based on the main seed
   */
  getNodeSeed(nodeId: string): string {
    if (!this.nodeSeeds.has(nodeId)) {
      // Create a node-specific seed by combining main seed with node ID
      const nodeSeed = `${this.seed}-${nodeId}`;
      this.nodeSeeds.set(nodeId, nodeSeed);
    }
    return this.nodeSeeds.get(nodeId)!;
  }

  /**
   * Get a seeded PRNG for a specific node
   */
  getNodePRNG(nodeId: string): ReturnType<typeof seedrandom> {
    const nodeSeed = this.getNodeSeed(nodeId);
    return seedrandom(nodeSeed);
  }

  /**
   * Get a random number between 0 and 1 using the main PRNG
   */
  random(): number {
    return this.prng();
  }

  /**
   * Set a variable value
   */
  setVariable(name: string, value: VariableValue): void {
    // Validate variable name
    if (!this.isValidVariableName(name)) {
      throw new Error(`Invalid variable name: ${name}`);
    }

    // Deep clone objects and arrays to prevent mutation
    const clonedValue = this.cloneValue(value);
    this.variables.set(name, clonedValue);
  }

  /**
   * Get a variable value
   */
  getVariable(name: string): VariableValue | undefined {
    return this.variables.get(name);
  }

  /**
   * Check if a variable exists
   */
  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }

  /**
   * Get all variables (read-only copy)
   */
  getAllVariables(): Record<string, VariableValue> {
    const result: Record<string, VariableValue> = {};
    this.variables.forEach((value, key) => {
      result[key] = this.cloneValue(value);
    });
    return result;
  }

  /**
   * Clear all variables
   */
  clearVariables(): void {
    this.variables.clear();
  }

  getExecutionContext(): ExecutionContext {
    return this.contextView;
  }

  /**
   * Substitute variables in a text string
   * Replaces {{variableName}} with the variable value
   */
  substituteVariables(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = this.getVariable(varName);
      if (value === undefined) {
        this.addWarning('unknown', `Unknown variable: ${varName}`);
        return match; // Keep original if variable not found
      }

      // Convert value to string representation
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch {
          return '[Object]';
        }
      }

      return String(value);
    });
  }

  /**
   * Increment execution depth (for cycle detection)
   */
  incrementDepth(): void {
    this.depth++;
    if (this.depth > this.maxDepth) {
      throw new Error(`Maximum execution depth (${this.maxDepth}) exceeded`);
    }
  }

  /**
   * Decrement execution depth
   */
  decrementDepth(): void {
    this.depth = Math.max(0, this.depth - 1);
  }

  /**
   * Get current execution depth
   */
  getDepth(): number {
    return this.depth;
  }

  /**
   * Record that a node was executed
   */
  recordNodeExecution(nodeId: string): void {
    this.stats.nodesExecuted++;
  }

  /**
   * Add an error to the execution stats
   */
  addError(nodeId: string, error: Error): void {
    this.stats.errors.push({ nodeId, error });
  }

  /**
   * Add a warning to the execution stats
   */
  addWarning(nodeId: string, message: string): void {
    this.stats.warnings.push({ nodeId, message });
  }

  /**
   * Finalize execution and return stats
   */
  finalize(): ExecutionStats {
    this.stats.endTime = Date.now();
    return { ...this.stats };
  }

  /**
   * Get execution duration in milliseconds
   */
  getDuration(): number {
    const endTime = this.stats.endTime || Date.now();
    return endTime - this.stats.startTime;
  }

  /**
   * Clone the context for isolated execution
   * Useful for preview or testing
   */
  clone(): Epic1ExecutionContext {
    const cloned = new Epic1ExecutionContext(this.seed);

    // Copy variables
    this.variables.forEach((value, key) => {
      cloned.variables.set(key, this.cloneValue(value));
    });

    // Copy node seeds
    this.nodeSeeds.forEach((seed, nodeId) => {
      cloned.nodeSeeds.set(nodeId, seed);
    });

    return cloned;
  }

  /**
   * Validate variable name
   */
  private isValidVariableName(name: string): boolean {
    // Must be alphanumeric + underscore, start with letter or underscore
    // Max 64 characters (as per validation.ts)
    const pattern = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
    return pattern.test(name);
  }

  /**
   * Deep clone a value to prevent mutation
   */
  private cloneValue(value: VariableValue): VariableValue {
    if (value === null || value === undefined) {
      return value;
    }

    const type = typeof value;

    // Primitives are immutable
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return value;
    }

    // Clone arrays and objects
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      // If JSON serialization fails, return the original
      // This shouldn't happen with valid variable values
      return value;
    }
  }
}
