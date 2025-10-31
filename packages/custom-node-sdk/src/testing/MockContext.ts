/**
 * @fileoverview MockContext - Provides mock execution contexts for testing custom nodes
 * Creates realistic test environments without requiring full PromptScape runtime
 */

import { AdvancedExecutionContext } from '@promptscape/core';
import seedrandom from 'seedrandom';

/**
 * Configuration for creating mock execution contexts
 */
export interface MockContextConfig {
  /** Seed for deterministic random generation */
  seed?: string;
  /** Initial variables */
  variables?: Record<string, unknown>;
  /** Node states for stateful testing */
  nodeStates?: Record<string, unknown>;
  /** Enable performance tracking */
  trackPerformance?: boolean;
}

/**
 * Creates mock execution contexts for testing custom nodes
 */
export class MockContext {
  private config: MockContextConfig;

  constructor(seed?: string | number) {
    this.config = {
      seed: String(seed || 'test-seed'),
      variables: {},
      nodeStates: {},
      trackPerformance: true
    };
  }

  getContext(): AdvancedExecutionContext {
    return MockContextFactory.create(this.config);
  }
}

export class MockContextFactory {
  /**
   * Create a mock AdvancedExecutionContext for testing
   */
  static create(config: MockContextConfig = {}): AdvancedExecutionContext {
    const {
      seed = 'test-seed',
      variables = {},
      nodeStates = {},
      trackPerformance = true
    } = config;

    const prng = seedrandom(seed);
    const stateMap = new Map(Object.entries(nodeStates));

    return {
      // Basic execution context (from ExecutionContext)
      variables,
      seed,

      // Advanced context features (from AdvancedExecutionContext)
      nodeStates: stateMap,
      evaluationDepth: 0,
      cache: new Map(),
      prng,
      performanceMetrics: trackPerformance ? new Map() : undefined
    };
  }

  /**
   * Create a minimal context with just the essentials
   */
  static createMinimal(
    variables: Record<string, unknown> = {}
  ): AdvancedExecutionContext {
    return this.create({
      variables,
      trackPerformance: false
    });
  }

  /**
   * Create a context for testing stateful nodes
   */
  static createStateful(
    variables: Record<string, unknown> = {},
    initialStates: Record<string, unknown> = {}
  ): AdvancedExecutionContext {
    return this.create({
      variables,
      nodeStates: initialStates,
      trackPerformance: true
    });
  }

  /**
   * Create a context with pre-loaded cache for testing performance scenarios
   */
  static createWithCache(
    variables: Record<string, unknown> = {},
    cacheEntries: Record<string, unknown> = {}
  ): AdvancedExecutionContext {
    const context = this.create({ variables, trackPerformance: true });

    // Pre-populate cache
    for (const [key, value] of Object.entries(cacheEntries)) {
      context.cache.set(key, value);
    }

    return context;
  }
}

/**
 * Helper to create deterministic test scenarios
 */
export class TestScenarios {
  /**
   * Create a scenario for testing string processing nodes
   */
  static stringProcessing(input: string): AdvancedExecutionContext {
    return MockContextFactory.create({
      variables: {
        input,
        text: input,
        content: input
      },
      seed: 'string-test'
    });
  }

  /**
   * Create a scenario for testing numeric computation nodes
   */
  static numericComputation(numbers: number[]): AdvancedExecutionContext {
    return MockContextFactory.create({
      variables: {
        numbers,
        values: numbers,
        data: numbers,
        input: numbers[0] || 0
      },
      seed: 'numeric-test'
    });
  }

  /**
   * Create a scenario for testing conditional logic nodes
   */
  static conditionalLogic(
    condition: boolean,
    trueValue: unknown,
    falseValue: unknown
  ): AdvancedExecutionContext {
    return MockContextFactory.create({
      variables: {
        condition,
        trueValue,
        falseValue,
        input: condition
      },
      seed: 'conditional-test'
    });
  }

  /**
   * Create a scenario for testing array processing nodes
   */
  static arrayProcessing(items: unknown[]): AdvancedExecutionContext {
    return MockContextFactory.create({
      variables: {
        items,
        array: items,
        list: items,
        input: items
      },
      seed: 'array-test'
    });
  }

  /**
   * Create a scenario for testing object manipulation nodes
   */
  static objectManipulation(
    object: Record<string, unknown>
  ): AdvancedExecutionContext {
    return MockContextFactory.create({
      variables: {
        object,
        data: object,
        input: object
      },
      seed: 'object-test'
    });
  }

  /**
   * Create a scenario for testing error handling
   */
  static errorHandling(shouldError: boolean = true): AdvancedExecutionContext {
    return MockContextFactory.create({
      variables: {
        shouldError,
        throwError: shouldError,
        simulateError: shouldError
      },
      seed: 'error-test'
    });
  }
}
