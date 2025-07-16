// packages/core/runtime/__tests__/advanced.test.ts
// Tests for Epic 7 advanced node foundation classes

import {
  AdvancedRuntimeNode,
  AdvancedExecutionContext,
  AdvancedExecutionUtils,
  ValidationHelpers,
  SerializationHelpers,
  AdvancedNodeConfig,
  AdvancedNodeData,
  ValidationResult
} from '../advanced';
import { ExecutionContext } from '../index';

// Test implementation of AdvancedRuntimeNode
class TestAdvancedNode extends AdvancedRuntimeNode<string> {
  constructor(id: string, private value: string, config?: Partial<AdvancedNodeConfig>) {
    const defaultConfig: AdvancedNodeConfig = {
      deterministic: true,
      cacheable: true,
      stateful: false,
      ...config
    };
    super(id, defaultConfig);
  }

  run(ctx: AdvancedExecutionContext): string {
    // Record execution in metadata
    ctx.executionMeta.nodeExecutionOrder.push(this.id);
    
    return this.measureExecution(ctx, 'getValue', () => {
      return this.withCache(ctx, 'value', () => {
        return `${this.value}-executed`;
      });
    });
  }

  validate(): ValidationResult {
    const errors = ValidationHelpers.validateRequired(this.value, 'value');
    return errors.length > 0 
      ? ValidationHelpers.createInvalidResult(errors)
      : ValidationHelpers.createValidResult();
  }

  serialize(): AdvancedNodeData {
    return SerializationHelpers.createAdvancedNodeData(
      this.id,
      'TestAdvanced',
      this.config,
      { value: this.value }
    );
  }
}

// Test implementation of stateful node
class TestStatefulNode extends AdvancedRuntimeNode<number> {
  constructor(id: string, private increment: number = 1) {
    super(id, { deterministic: true, cacheable: false, stateful: true });
  }

  run(ctx: AdvancedExecutionContext): number {
    const currentState = this.getState(ctx) || { counter: 0 };
    const newCounter = currentState.counter + this.increment;
    
    this.setState(ctx, { counter: newCounter });
    return newCounter;
  }

  validate(): ValidationResult {
    return ValidationHelpers.createValidResult();
  }

  serialize(): AdvancedNodeData {
    return SerializationHelpers.createAdvancedNodeData(
      this.id,
      'TestStateful',
      this.config,
      { increment: this.increment }
    );
  }
}

describe('AdvancedRuntimeNode Foundation', () => {
  let basicCtx: ExecutionContext;
  let advancedCtx: AdvancedExecutionContext;

  beforeEach(() => {
    basicCtx = {
      variables: { testVar: 'testValue' },
      seed: 12345
    };
    advancedCtx = AdvancedExecutionUtils.enhanceContext(basicCtx);
  });

  describe('AdvancedExecutionUtils', () => {
    it('should enhance basic execution context', () => {
      const enhanced = AdvancedExecutionUtils.enhanceContext(basicCtx);
      
      expect(enhanced.variables).toEqual(basicCtx.variables);
      expect(enhanced.seed).toEqual(basicCtx.seed);
      expect(enhanced.nodeStates).toBeInstanceOf(Map);
      expect(enhanced.cache).toBeInstanceOf(Map);
      expect(enhanced.evaluationDepth).toBe(0);
      expect(enhanced.executionMeta).toMatchObject({
        startTime: expect.any(Number),
        nodeExecutionOrder: [],
        performanceMetrics: expect.any(Map)
      });
    });

    it('should clear execution state', () => {
      advancedCtx.nodeStates.set('test', 'state');
      advancedCtx.cache.set('test', 'cache');
      advancedCtx.evaluationDepth = 5;
      advancedCtx.executionMeta.nodeExecutionOrder.push('node1');

      AdvancedExecutionUtils.clearExecutionState(advancedCtx);

      expect(advancedCtx.nodeStates.size).toBe(0);
      expect(advancedCtx.cache.size).toBe(0);
      expect(advancedCtx.evaluationDepth).toBe(0);
      expect(advancedCtx.executionMeta.nodeExecutionOrder).toHaveLength(0);
    });

    it('should detect infinite loops', () => {
      advancedCtx.evaluationDepth = 1001;
      expect(AdvancedExecutionUtils.detectInfiniteLoop(advancedCtx, 'test')).toBe(true);
      
      advancedCtx.evaluationDepth = 500;
      expect(AdvancedExecutionUtils.detectInfiniteLoop(advancedCtx, 'test')).toBe(false);
    });

    it('should provide execution statistics', () => {
      // Simulate some execution
      advancedCtx.executionMeta.nodeExecutionOrder.push('node1', 'node2');
      advancedCtx.cache.set('key1', 'value1');
      advancedCtx.nodeStates.set('node1', { state: 'test' });
      
      const stats = AdvancedExecutionUtils.getExecutionStats(advancedCtx);
      
      expect(stats.totalDuration).toBeGreaterThan(0);
      expect(stats.nodesExecuted).toBe(2);
      expect(stats.cacheHits).toBe(1);
      expect(stats.statefulness).toBe(1);
    });
  });

  describe('TestAdvancedNode (Basic Advanced Node)', () => {
    let node: TestAdvancedNode;

    beforeEach(() => {
      node = new TestAdvancedNode('test-node', 'test-value');
    });

    it('should create with correct configuration', () => {
      const config = node.getConfig();
      expect(config.deterministic).toBe(true);
      expect(config.cacheable).toBe(true);
      expect(config.stateful).toBe(false);
    });

    it('should execute and return processed value', () => {
      const result = node.run(advancedCtx);
      expect(result).toBe('test-value-executed');
      expect(advancedCtx.executionMeta.nodeExecutionOrder).toContain('test-node');
    });

    it('should use caching for repeated executions', () => {
      const result1 = node.run(advancedCtx);
      const result2 = node.run(advancedCtx);
      
      expect(result1).toBe(result2);
      expect(advancedCtx.cache.size).toBeGreaterThan(0);
    });

    it('should record performance metrics', () => {
      node.run(advancedCtx);
      
      const metrics = advancedCtx.executionMeta.performanceMetrics;
      expect(metrics.has('test-node-getValue_duration_ms')).toBe(true);
      expect(metrics.get('test-node-getValue_duration_ms')).toBeGreaterThanOrEqual(0);
    });

    it('should validate correctly', () => {
      const result = node.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should serialize correctly', () => {
      const serialized = node.serialize();
      
      expect(serialized.id).toBe('test-node');
      expect(serialized.type).toBe('TestAdvanced');
      expect(serialized.config).toEqual(node.getConfig());
      expect(serialized.data.value).toBe('test-value');
      expect(serialized.metadata?.version).toBe('1.0.0');
      expect(serialized.metadata?.created).toBeDefined();
    });

    it('should check compatibility with basic context', () => {
      expect(node.isCompatibleWithBasicContext()).toBe(true);
    });
  });

  describe('TestStatefulNode (Stateful Advanced Node)', () => {
    let node: TestStatefulNode;

    beforeEach(() => {
      node = new TestStatefulNode('stateful-node', 2);
    });

    it('should maintain state between executions', () => {
      const result1 = node.run(advancedCtx);
      const result2 = node.run(advancedCtx);
      const result3 = node.run(advancedCtx);
      
      expect(result1).toBe(2);
      expect(result2).toBe(4);
      expect(result3).toBe(6);
    });

    it('should not be compatible with basic context', () => {
      expect(node.isCompatibleWithBasicContext()).toBe(false);
    });

    it('should handle state isolation between contexts', () => {
      const ctx1 = AdvancedExecutionUtils.enhanceContext(basicCtx);
      const ctx2 = AdvancedExecutionUtils.enhanceContext(basicCtx);
      
      const result1 = node.run(ctx1);
      const result2 = node.run(ctx2);
      const result3 = node.run(ctx1);
      
      expect(result1).toBe(2); // First execution in ctx1
      expect(result2).toBe(2); // First execution in ctx2 (isolated)
      expect(result3).toBe(4); // Second execution in ctx1
    });
  });

  describe('ValidationHelpers', () => {
    it('should create valid result', () => {
      const result = ValidationHelpers.createValidResult();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should create invalid result with errors', () => {
      const errors = ['Error 1', 'Error 2'];
      const warnings = ['Warning 1'];
      const result = ValidationHelpers.createInvalidResult(errors, warnings);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(errors);
      expect(result.warnings).toEqual(warnings);
    });

    it('should validate required fields', () => {
      expect(ValidationHelpers.validateRequired('value', 'field')).toHaveLength(0);
      expect(ValidationHelpers.validateRequired('', 'field')).toHaveLength(1);
      expect(ValidationHelpers.validateRequired(null, 'field')).toHaveLength(1);
      expect(ValidationHelpers.validateRequired(undefined, 'field')).toHaveLength(1);
    });

    it('should validate arrays', () => {
      expect(ValidationHelpers.validateArray([1, 2, 3], 'field')).toHaveLength(0);
      expect(ValidationHelpers.validateArray([], 'field', 1)).toHaveLength(1);
      expect(ValidationHelpers.validateArray('not-array', 'field')).toHaveLength(1);
    });

    it('should validate numeric ranges', () => {
      expect(ValidationHelpers.validateNumericRange(5, 'field', 0, 10)).toHaveLength(0);
      expect(ValidationHelpers.validateNumericRange(-1, 'field', 0, 10)).toHaveLength(1);
      expect(ValidationHelpers.validateNumericRange(15, 'field', 0, 10)).toHaveLength(1);
      expect(ValidationHelpers.validateNumericRange('not-number', 'field')).toHaveLength(1);
    });
  });

  describe('SerializationHelpers', () => {
    it('should create advanced node data', () => {
      const config: AdvancedNodeConfig = {
        deterministic: true,
        cacheable: false,
        stateful: true
      };
      
      const data = SerializationHelpers.createAdvancedNodeData(
        'test-id',
        'TestType',
        config,
        { key: 'value' }
      );
      
      expect(data.id).toBe('test-id');
      expect(data.type).toBe('TestType');
      expect(data.config).toEqual(config);
      expect(data.data).toEqual({ key: 'value' });
      expect(data.metadata?.version).toBe('1.0.0');
      expect(data.metadata?.created).toBeDefined();
    });

    it('should validate serialized data', () => {
      const validData: AdvancedNodeData = {
        id: 'test',
        type: 'TestType',
        config: { deterministic: true, cacheable: true, stateful: false },
        data: { test: 'value' }
      };
      
      const result = SerializationHelpers.validateSerializedData(validData);
      expect(result.valid).toBe(true);
    });

    it('should detect invalid serialized data', () => {
      const invalidData = {
        // Missing required fields
        type: 'TestType',
        config: { deterministic: 'not-boolean' }, // Invalid type
        data: { test: 'value' }
      } as any;
      
      const result = SerializationHelpers.validateSerializedData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Seeded Random Number Generation', () => {
    it('should create deterministic RNG', () => {
      const node = new TestAdvancedNode('test', 'value');
      
      // Access the protected method through type assertion for testing
      const rng1 = (node as any).createSeededRNG(12345);
      const rng2 = (node as any).createSeededRNG(12345);
      
      // Should produce identical sequences
      expect(rng1()).toBe(rng2());
      expect(rng1()).toBe(rng2());
    });

    it('should create different sequences for different seeds', () => {
      const node = new TestAdvancedNode('test', 'value');
      
      const rng1 = (node as any).createSeededRNG(12345);
      const rng2 = (node as any).createSeededRNG(54321);
      
      // Should produce different sequences
      expect(rng1()).not.toBe(rng2());
    });

    it('should create node-specific sequences', () => {
      const node1 = new TestAdvancedNode('node1', 'value');
      const node2 = new TestAdvancedNode('node2', 'value');
      
      const rng1 = (node1 as any).createSeededRNG(12345);
      const rng2 = (node2 as any).createSeededRNG(12345);
      
      // Same seed but different nodes should produce different sequences
      expect(rng1()).not.toBe(rng2());
    });
  });
});