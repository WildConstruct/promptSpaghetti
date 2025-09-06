/**
 * @fileoverview TestHarness - Testing utilities for custom nodes
 * Provides a complete test environment for custom node development
 */

import { AdvancedExecutionContext } from '@promptscape/core';
import { CustomNodeBase, CustomNodeResult, CustomNodeRuntime } from '../types';
import { CustomNodeAdapter } from '../runtime/CustomNodeAdapter';
import { MockContext } from './MockContext';

/**
 * Test harness for running custom nodes in isolation
 */
export class TestHarness {
  private mockContext: MockContext;
  
  constructor(seed?: string | number) {
    this.mockContext = new MockContext(seed);
  }

  /**
   * Run a custom node with test inputs
   */
  async runNode(
    node: CustomNodeBase,
    inputs: Record<string, any>,
    config?: {
      variables?: Record<string, any>;
      state?: unknown;
      cache?: Map<string, unknown>;
    }
  ): Promise<{
    output: unknown;
    context: AdvancedExecutionContext;
    result: CustomNodeResult;
  }> {
    // Set up context with inputs
    const ctx = this.mockContext.getContext();
    
    if (config?.variables) {
      Object.assign(ctx.variables, config.variables);
    }
    
    if (config?.state) {
      ctx.nodeStates.set('test-node', config.state);
    }
    
    if (config?.cache) {
      ctx.cache = config.cache;
    }
    
    // Store inputs in context variables
    Object.assign(ctx.variables, inputs);
    
    // Create adapter and run node
    const adapter = new CustomNodeAdapter(
      'test-node',
      node,
      {
        metadata: {
          type: 'test-node',
          version: '1.0.0',
          displayName: 'Test Node',
          description: 'Test node for harness',
          category: 'test',
          author: { name: 'Test' },
        },
        schema: {
          inputs: Object.fromEntries(
            Object.keys(inputs).map(key => [
              key,
              { type: 'any', required: false }
            ])
          ),
          outputs: {
            result: { type: 'any' }
          },
        },
        deterministic: true,
        cacheable: false,
        stateful: false,
      }
    );
    
    const output = await adapter.run(ctx);
    
    // Create a mock runtime to get the result
    const runtime: CustomNodeRuntime = {
      context: ctx,
      inputs,
      utils: {
        random: () => ctx.prng ? ctx.prng() : Math.random(),
        log: (level, message, data) => {
          console[level](`[test-node] ${message}`, data || '');
        },
        validate: () => ({ valid: true, errors: [], warnings: [] }),
        getState: <T = unknown>() => ctx.nodeStates.get('test-node') as T | undefined,
        setState: (state) => ctx.nodeStates.set('test-node', state),
      },
    };
    
    const result = await node.execute(runtime);
    
    return {
      output,
      context: ctx,
      result,
    };
  }

  /**
   * Run a node multiple times with different seeds
   */
  async runMultiple(
    node: CustomNodeBase,
    inputs: Record<string, any>,
    seeds: Array<string | number>,
    config?: {
      variables?: Record<string, any>;
    }
  ): Promise<Array<{
    seed: string | number;
    output: unknown;
  }>> {
    const results = [];
    
    for (const seed of seeds) {
      this.mockContext = new MockContext(seed);
      const { output } = await this.runNode(node, inputs, config);
      results.push({ seed, output });
    }
    
    return results;
  }

  /**
   * Test deterministic behavior
   */
  async testDeterminism(
    node: CustomNodeBase,
    inputs: Record<string, any>,
    seed: string | number = 'test-seed',
    runs: number = 5
  ): Promise<{
    isDeterministic: boolean;
    outputs: unknown[];
  }> {
    const outputs = [];
    
    for (let i = 0; i < runs; i++) {
      this.mockContext = new MockContext(seed);
      const { output } = await this.runNode(node, inputs);
      outputs.push(output);
    }
    
    // Check if all outputs are identical
    const firstOutput = JSON.stringify(outputs[0]);
    const isDeterministic = outputs.every(
      output => JSON.stringify(output) === firstOutput
    );
    
    return { isDeterministic, outputs };
  }

  /**
   * Test state persistence
   */
  async testStatePersistence(
    node: CustomNodeBase,
    inputs: Record<string, any>,
    iterations: number = 3
  ): Promise<{
    states: unknown[];
    outputs: unknown[];
  }> {
    const states: unknown[] = [];
    const outputs: unknown[] = [];
    const ctx = this.mockContext.getContext();
    
    for (let i = 0; i < iterations; i++) {
      const { output, context } = await this.runNode(node, inputs, {
        state: i > 0 ? states[i - 1] : undefined,
      });
      
      const newState = context.nodeStates.get('test-node');
      states.push(newState);
      outputs.push(output);
    }
    
    return { states, outputs };
  }

  /**
   * Benchmark node performance
   */
  async benchmark(
    node: CustomNodeBase,
    inputs: Record<string, any>,
    iterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  }> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await this.runNode(node, inputs);
      const elapsed = Date.now() - start;
      times.push(elapsed);
    }
    
    const totalTime = times.reduce((sum, t) => sum + t, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
      averageTime,
      minTime,
      maxTime,
      totalTime,
    };
  }

  /**
   * Get the current context for inspection
   */
  getContext(): AdvancedExecutionContext {
    return this.mockContext.getContext();
  }

  /**
   * Reset the test harness
   */
  reset(seed?: string | number): void {
    this.mockContext = new MockContext(seed);
  }
}