/**
 * @fileoverview TestHelpers - Helper utilities for testing custom nodes
 * Provides utility functions and mocks for comprehensive testing
 */

import { CustomNodeBase, CustomNodeResult, CustomNodeRuntime, ValidationResult } from '../types';
import { z } from 'zod';

/**
 * Create a simple mock custom node for testing
 */
export function createMockNode(
  executeImpl: (runtime: CustomNodeRuntime) => Promise<CustomNodeResult>
): CustomNodeBase {
  class MockNode extends CustomNodeBase {
    async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
      return executeImpl(runtime);
    }
    
    validate(): ValidationResult {
      return { valid: true, errors: [], warnings: [] };
    }
  }
  
  const config = {
    metadata: {
      type: 'test-mock-node',
      displayName: 'Mock Node',
      description: 'Mock node for testing',
      category: 'test',
      version: '1.0.0',
      author: { name: 'Test' },
    },
    schema: {
      inputs: {},
      outputs: { result: { type: 'any' as const, required: true } },
    },
    deterministic: true,
    cacheable: false,
    stateful: false,
  };
  
  return new MockNode('mock-node', config);
}

/**
 * Create a stateful mock node
 */
export function createStatefulMockNode<TState = any>(
  initialState: TState,
  executeImpl: (runtime: CustomNodeRuntime, state: TState) => Promise<{
    result: CustomNodeResult;
    newState: TState;
  }>
): CustomNodeBase {
  class StatefulMockNode extends CustomNodeBase {
    async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
      const currentState = runtime.utils.getState<TState>() || initialState;
      const { result, newState } = await executeImpl(runtime, currentState);
      runtime.utils.setState(newState);
      return result;
    }
    
    validate(): ValidationResult {
      return { valid: true, errors: [], warnings: [] };
    }
  }
  
  const config = {
    metadata: {
      type: 'test-stateful-node',
      displayName: 'Stateful Mock Node',
      description: 'Stateful mock node for testing',
      category: 'test',
      version: '1.0.0',
      author: { name: 'Test' },
    },
    schema: {
      inputs: {},
      outputs: { result: { type: 'any' as const, required: true } },
    },
    deterministic: true,
    cacheable: false,
    stateful: true,
  };
  
  return new StatefulMockNode('stateful-mock-node', config);
}

/**
 * Create a mock node with lifecycle hooks
 */
export function createLifecycleMockNode(
  callbacks: {
    beforeExecute?: (runtime: CustomNodeRuntime) => Promise<void>;
    execute: (runtime: CustomNodeRuntime) => Promise<CustomNodeResult>;
    afterExecute?: (runtime: CustomNodeRuntime, result: CustomNodeResult) => Promise<void>;
    dispose?: () => Promise<void>;
  }
): CustomNodeBase {
  class LifecycleMockNode extends CustomNodeBase {
    async beforeExecute(runtime: CustomNodeRuntime): Promise<void> {
      if (callbacks.beforeExecute) {
        await callbacks.beforeExecute(runtime);
      }
    }
    
    async execute(runtime: CustomNodeRuntime): Promise<CustomNodeResult> {
      return callbacks.execute(runtime);
    }
    
    async afterExecute(runtime: CustomNodeRuntime, result: CustomNodeResult): Promise<void> {
      if (callbacks.afterExecute) {
        await callbacks.afterExecute(runtime, result);
      }
    }
    
    async dispose(): Promise<void> {
      if (callbacks.dispose) {
        await callbacks.dispose();
      }
    }
    
    validate(): ValidationResult {
      return { valid: true, errors: [], warnings: [] };
    }
  }
  
  const config = {
    metadata: {
      type: 'test-lifecycle-node',
      displayName: 'Lifecycle Mock Node',
      description: 'Mock node with lifecycle hooks for testing',
      category: 'test',
      version: '1.0.0',
      author: { name: 'Test' },
    },
    schema: {
      inputs: {},
      outputs: { result: { type: 'any' as const, required: true } },
    },
    deterministic: true,
    cacheable: false,
    stateful: false,
  };
  
  return new LifecycleMockNode('lifecycle-mock-node', config);
}

/**
 * Create mock inputs with various types
 */
export function createMockInputs(): Record<string, any> {
  return {
    text: 'test string',
    number: 42,
    boolean: true,
    array: [1, 2, 3],
    object: { key: 'value' },
    null: null,
    undefined: undefined,
  };
}

/**
 * Create a mock validation result
 */
export function createValidationResult(
  valid: boolean,
  errors: string[] = [],
  warnings: string[] = []
): ValidationResult {
  return { valid, errors, warnings };
}

/**
 * Create a mock custom node result
 */
export function createMockResult(
  outputs: Record<string, any>,
  metadata?: {
    executionTime?: number;
    memoryUsed?: number;
    metrics?: Record<string, any>;
  }
): CustomNodeResult {
  return {
    outputs,
    metadata: metadata || {},
  };
}

/**
 * Assert that two objects are deeply equal
 */
export function assertDeepEqual(actual: any, expected: any, path: string = ''): void {
  if (actual === expected) return;
  
  if (typeof actual !== typeof expected) {
    throw new Error(
      `Type mismatch at ${path || 'root'}: expected ${typeof expected}, got ${typeof actual}`
    );
  }
  
  if (actual === null || expected === null) {
    if (actual !== expected) {
      throw new Error(
        `Value mismatch at ${path || 'root'}: expected ${expected}, got ${actual}`
      );
    }
    return;
  }
  
  if (typeof actual === 'object') {
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    
    if (actualKeys.length !== expectedKeys.length) {
      throw new Error(
        `Key count mismatch at ${path || 'root'}: expected ${expectedKeys.length} keys, got ${actualKeys.length}`
      );
    }
    
    for (const key of actualKeys) {
      if (!expectedKeys.includes(key)) {
        throw new Error(`Unexpected key at ${path || 'root'}: ${key}`);
      }
      assertDeepEqual(
        actual[key],
        expected[key],
        path ? `${path}.${key}` : key
      );
    }
  } else if (actual !== expected) {
    throw new Error(
      `Value mismatch at ${path || 'root'}: expected ${expected}, got ${actual}`
    );
  }
}

/**
 * Create a delay for async testing
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock logger for testing logging behavior
 */
export class MockLogger {
  private logs: Array<{
    level: string;
    message: string;
    data?: any;
    timestamp: Date;
  }> = [];

  log(level: string, message: string, data?: any): void {
    this.logs.push({
      level,
      message,
      data,
      timestamp: new Date(),
    });
  }

  getLogs(): typeof this.logs {
    return this.logs;
  }

  getLogsByLevel(level: string): typeof this.logs {
    return this.logs.filter(log => log.level === level);
  }

  clear(): void {
    this.logs = [];
  }

  hasLog(level: string, message: string): boolean {
    return this.logs.some(
      log => log.level === level && log.message.includes(message)
    );
  }
}

/**
 * Create a Zod schema for testing validation
 */
export function createTestSchema() {
  return {
    string: z.string(),
    number: z.number(),
    boolean: z.boolean(),
    optional: z.string().optional(),
    withDefault: z.string().default('default'),
    withConstraints: z.string().min(1).max(100),
    enum: z.enum(['option1', 'option2', 'option3']),
    array: z.array(z.number()),
    object: z.object({
      nested: z.string(),
    }),
  };
}

/**
 * Generate random test data
 */
export function generateTestData(seed: number = 0): Record<string, any> {
  const random = (max: number) => Math.floor((seed * 9973) % max);
  
  return {
    id: `id-${seed}`,
    name: `name-${seed}`,
    value: random(1000),
    active: seed % 2 === 0,
    tags: Array.from({ length: random(5) + 1 }, (_, i) => `tag-${i}`),
    metadata: {
      created: new Date(2024, 0, 1 + random(365)).toISOString(),
      updated: new Date(2024, 6, 1 + random(180)).toISOString(),
      version: `${random(3)}.${random(10)}.${random(100)}`,
    },
  };
}

/**
 * Spy on a function to track calls
 */
export class FunctionSpy<T extends (...args: any[]) => any> {
  private calls: Array<{
    args: Parameters<T>;
    result?: ReturnType<T>;
    error?: Error;
  }> = [];
  
  constructor(
    private originalFn?: T,
    private mockImplementation?: T
  ) {}

  get fn(): T {
    return ((...args: Parameters<T>) => {
      const call: typeof this.calls[0] = { args };
      
      try {
        const impl = this.mockImplementation || this.originalFn;
        if (impl) {
          call.result = impl(...args);
          this.calls.push(call);
          return call.result;
        }
        this.calls.push(call);
      } catch (error) {
        call.error = error as Error;
        this.calls.push(call);
        throw error;
      }
    }) as T;
  }

  getCalls(): typeof this.calls {
    return this.calls;
  }

  getCallCount(): number {
    return this.calls.length;
  }

  wasCalledWith(...args: Parameters<T>): boolean {
    return this.calls.some(call => 
      JSON.stringify(call.args) === JSON.stringify(args)
    );
  }

  reset(): void {
    this.calls = [];
  }
}