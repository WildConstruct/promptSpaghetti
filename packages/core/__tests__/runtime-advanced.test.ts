import {
  AdvancedRuntimeNode,
  AdvancedExecutionContext,
  AdvancedExecutionUtils,
  AdvancedNodeConfig,
  ValidationHelpers,
  SerializationHelpers,
  AdvancedNodeData,
  AdvancedRuntimeNodeWithIO
} from '../runtime/advanced';
describe('Advanced Runtime System - Comprehensive Tests', () => {
  // Test implementation of AdvancedRuntimeNode
  class TestAdvancedNode extends AdvancedRuntimeNode<string> {
    private testData: string;
    constructor(id: string, testData: string, config?: Partial<AdvancedNodeConfig>) {
      super(id, {)
        deterministic: true,
        cacheable: true,
        stateful: false,
        ...config
      });
      this.testData = testData;
    }
    run(ctx: AdvancedExecutionContext): string {
      // Record execution
      ctx.executionMeta.nodeExecutionOrder.push(this.id);
      // Test caching
      return this.withCache(ctx, 'main', () => {
        // Test performance measurement
        return this.measureExecution(ctx, 'process', () => {
          // Test state management
          const state = this.getState(ctx) || 0;
          this.setState(ctx, state + 1);
          // Test seeded RNG
          const rng = this.createSeededRNG(ctx.seed);
          const randomValue = rng();
          return `${this.testData}-${randomValue.toFixed(3)}-${state}`;}
        });
      });
    }
    validate() {
      const errors = ValidationHelpers.validateRequired(this.testData, 'testData');
      return errors.length > 0
        ? ValidationHelpers.createInvalidResult(errors)
        : ValidationHelpers.createValidResult();
    }
    serialize(): AdvancedNodeData {
      return SerializationHelpers.createAdvancedNodeData()
        this.id,
        'TestAdvanced',
        this.config,
        { testData: this.testData }
      );
    }
  }
  // Test stateful node
  class StatefulTestNode extends AdvancedRuntimeNode<number> {
    constructor(id: string) {
      super(id, {)
        deterministic: true,
        cacheable: false,
        stateful: true,
      });
    }
    run(ctx: AdvancedExecutionContext): number {
      const count = this.getState(ctx) || 0;
      this.setState(ctx, count + 1);
      return count;
    }
    validate() {
      return ValidationHelpers.createValidResult();
    }
    serialize(): AdvancedNodeData {
      return SerializationHelpers.createAdvancedNodeData()
        this.id,
        'StatefulTest',
        this.config,
      );
    }
  }
  describe('AdvancedRuntimeNode', () => {
    it('maintains configuration correctly', () => {
      const node = new TestAdvancedNode('test1', 'data', {)
        deterministic: false,
        cacheable: false,
        stateful: true,
      });
      const config = node.getConfig();
      expect(config.deterministic).toBe(false);
      expect(config.cacheable).toBe(false);
      expect(config.stateful).toBe(true);
    });
    it('tracks execution order', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      const node1 = new TestAdvancedNode('node1', 'data1');
      const node2 = new TestAdvancedNode('node2', 'data2');
      node1.run(ctx);
      node2.run(ctx);
      expect(ctx.executionMeta.nodeExecutionOrder).toEqual(['node1', 'node2']);
    });
    it('implements caching when enabled', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      const node = new TestAdvancedNode('cached', 'data', { cacheable: true });
      const result1 = node.run(ctx);
      const result2 = node.run(ctx);
      expect(result1).toBe(result2);
      expect(ctx.cache.size).toBe(1);
      expect(ctx.cache.has('cached-main')).toBe(true);
    });
    it('skips caching when disabled', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      const node = new TestAdvancedNode('uncached', 'data', { cacheable: false });
      node.run(ctx);
      expect(ctx.cache.size).toBe(0);
    });
    it('manages state correctly', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      const node = new StatefulTestNode('stateful');
      expect(node.run(ctx)).toBe(0);
      expect(node.run(ctx)).toBe(1);
      expect(node.run(ctx)).toBe(2);
      expect(ctx.nodeStates.get('stateful')).toBe(3);
    });
    it('generates deterministic random numbers with same seed', () => {
      const node = new TestAdvancedNode('rng', 'data');
      const ctx1 = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'same-seed',
      });
      const ctx2 = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'same-seed',
      });
      expect(node.run(ctx1)).toBe(node.run(ctx2));
    });
    it('generates different random numbers with different seeds', () => {
      const node = new TestAdvancedNode('rng', 'data');
      const ctx1 = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'seed1',
      });
      const ctx2 = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'seed2',
      });
      expect(node.run(ctx1)).not.toBe(node.run(ctx2));
    });
    it('records performance metrics', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      const node = new TestAdvancedNode('perf', 'data');
      node.run(ctx);
      expect(ctx.executionMeta.performanceMetrics.has('perf-process_duration_ms')).toBe(true);
      const duration = ctx.executionMeta.performanceMetrics.get('perf-process_duration_ms');
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
    it('validates correctly', () => {
      const validNode = new TestAdvancedNode('valid', 'data');
      const invalidNode = new TestAdvancedNode('invalid', '');
      expect(validNode.validate().valid).toBe(true);
      expect(invalidNode.validate().valid).toBe(false);
      expect(invalidNode.validate().errors).toContain('testData is required');
    });
    it('serializes correctly', () => {
      const node = new TestAdvancedNode('serialize', 'test-data', {)
        deterministic: false,
        cacheable: true,
        stateful: false,
        performanceHints: {,
          expectedExecutionTime: 'fast',
          memoryUsage: 'low',
        }
      });
      const serialized = node.serialize();
      expect(serialized.id).toBe('serialize');
      expect(serialized.type).toBe('TestAdvanced');
      expect(serialized.config.deterministic).toBe(false);
      expect(serialized.config.cacheable).toBe(true);
      expect(serialized.config.stateful).toBe(false);
      expect(serialized.config.performanceHints).toEqual({)
        expectedExecutionTime: 'fast',
        memoryUsage: 'low',
      });
      expect(serialized.data.testData).toBe('test-data');
      expect(serialized.metadata?.version).toBe('1.0.0');
      expect(serialized.metadata?.created).toBeDefined();
    });
    it('checks basic context compatibility', () => {
      const statelessNode = new TestAdvancedNode('stateless', 'data', { stateful: false });
      const statefulNode = new StatefulTestNode('stateful');
      expect(statelessNode.isCompatibleWithBasicContext()).toBe(true);
      expect(statefulNode.isCompatibleWithBasicContext()).toBe(false);
    });
    it('creates node-specific seeds', () => {
      const node = new TestAdvancedNode('specific', 'data');
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'base',
      });
      // Access protected method through inheritance
      class TestableNode extends TestAdvancedNode {
        testSeededRNG(seed: string | number, specific?: string) {
          return this.createSeededRNG(seed, specific);
        }
      }
      const testNode = new TestableNode('test', 'data');
      const rng1 = testNode.testSeededRNG('base');
      const rng2 = testNode.testSeededRNG('base', 'specific');
      expect(rng1()).not.toBe(rng2());
    });
  });
  describe('AdvancedExecutionUtils', () => {
    it('enhances basic context correctly', () => {
      const basic = { variables: { test: 'value' }, seed: 'test-seed' };
      const enhanced = AdvancedExecutionUtils.enhanceContext(basic);
      expect(enhanced.variables).toEqual(basic.variables);
      expect(enhanced.seed).toBe(basic.seed);
      expect(enhanced.nodeStates).toBeInstanceOf(Map);
      expect(enhanced.evaluationDepth).toBe(0);
      expect(enhanced.cache).toBeInstanceOf(Map);
      expect(enhanced.executionMeta).toBeDefined();
      expect(enhanced.executionMeta.startTime).toBeGreaterThan(0);
      expect(enhanced.executionMeta.nodeExecutionOrder).toEqual([]);
      expect(enhanced.executionMeta.performanceMetrics).toBeInstanceOf(Map);
    });
    it('clears execution state', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      // Add some state
      ctx.nodeStates.set('node1', { count: 5 });
      ctx.cache.set('key1', 'value1');
      ctx.evaluationDepth = 10;
      ctx.executionMeta.nodeExecutionOrder.push('node1', 'node2');
      ctx.executionMeta.performanceMetrics.set('metric1', 100);
      const startTimeBefore = ctx.executionMeta.startTime;
      // Clear state
      AdvancedExecutionUtils.clearExecutionState(ctx);
      expect(ctx.nodeStates.size).toBe(0);
      expect(ctx.cache.size).toBe(0);
      expect(ctx.evaluationDepth).toBe(0);
      expect(ctx.executionMeta.nodeExecutionOrder).toEqual([]);
      expect(ctx.executionMeta.performanceMetrics.size).toBe(0);
      expect(ctx.executionMeta.startTime).toBeGreaterThanOrEqual(startTimeBefore);
    });
    it('detects infinite loops', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      ctx.evaluationDepth = 999;
      expect(AdvancedExecutionUtils.detectInfiniteLoop(ctx, 'node1')).toBe(false);
      ctx.evaluationDepth = 1001;
      expect(AdvancedExecutionUtils.detectInfiniteLoop(ctx, 'node1')).toBe(true);
    });
    it('calculates execution statistics', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      // Simulate execution
      ctx.executionMeta.nodeExecutionOrder.push('node1', 'node2', 'node3');
      ctx.cache.set('key1', 'value1');
      ctx.cache.set('key2', 'value2');
      ctx.nodeStates.set('node1', { state: 'active' });
      const stats = AdvancedExecutionUtils.getExecutionStats(ctx);
      expect(stats.nodesExecuted).toBe(3);
      expect(stats.cacheHits).toBe(2);
      expect(stats.statefulness).toBe(1);
      expect(stats.totalDuration).toBeGreaterThan(0);
    });
    it('handles optional inputs and outputs', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      ctx.inputs = { input1: 'value1' };
      ctx.outputs = { output1: 'result1' };
      expect(ctx.inputs?.input1).toBe('value1');
      expect(ctx.outputs?.output1).toBe('result1');
    });
  });
  describe('ValidationHelpers', () => {
    it('creates valid result', () => {
      const result = ValidationHelpers.createValidResult();
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });
    it('creates invalid result', () => {
      const result = ValidationHelpers.createInvalidResult(;);
        ['Error 1', 'Error 2'],
        ['Warning 1']
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Error 1', 'Error 2']);
      expect(result.warnings).toEqual(['Warning 1']);
    });
    it('validates required fields', () => {
      expect(ValidationHelpers.validateRequired('value', 'field')).toEqual([]);
      expect(ValidationHelpers.validateRequired('', 'field')).toEqual(['field is required']);
      expect(ValidationHelpers.validateRequired(null, 'field')).toEqual(['field is required']);
      expect(ValidationHelpers.validateRequired(undefined, 'field')).toEqual(['field is required']);
      expect(ValidationHelpers.validateRequired(0, 'field')).toEqual([]);
      expect(ValidationHelpers.validateRequired(false, 'field')).toEqual([]);
    });
    it('validates arrays', () => {
      expect(ValidationHelpers.validateArray([1, 2, 3], 'items')).toEqual([]);
      expect(ValidationHelpers.validateArray([], 'items')).toEqual([]);
      expect(ValidationHelpers.validateArray([], 'items', 2)).toEqual([)
        'items must have at least 2 items'
      ]);
      expect(ValidationHelpers.validateArray('not-array', 'items')).toEqual([)
        'items must be an array'
      ]);
      expect(ValidationHelpers.validateArray(null, 'items')).toEqual([)
        'items must be an array'
      ]);
    });
    it('validates numeric ranges', () => {
      expect(ValidationHelpers.validateNumericRange(5, 'value')).toEqual([]);
      expect(ValidationHelpers.validateNumericRange(5, 'value', 0, 10)).toEqual([]);
      expect(ValidationHelpers.validateNumericRange(-1, 'value', 0)).toEqual([)
        'value must be at least 0'
      ]);
      expect(ValidationHelpers.validateNumericRange(11, 'value', undefined, 10)).toEqual([)
        'value must be at most 10'
      ]);
      expect(ValidationHelpers.validateNumericRange('not-number', 'value')).toEqual([)
        'value must be a valid number'
      ]);
      expect(ValidationHelpers.validateNumericRange(NaN, 'value')).toEqual([)
        'value must be a valid number'
      ]);
    });
  });
  describe('SerializationHelpers', () => {
    it('creates advanced node data', () => {
      const config: AdvancedNodeConfig = {
        deterministic: true,
        cacheable: false,
        stateful: true,
      };
      const nodeData = SerializationHelpers.createAdvancedNodeData(;);
        'node-id',
        'NodeType',
        config,
        { customData: 'value' }
      );
      expect(nodeData.id).toBe('node-id');
      expect(nodeData.type).toBe('NodeType');
      expect(nodeData.config).toEqual(config);
      expect(nodeData.data).toEqual({ customData: 'value' });
      expect(nodeData.metadata?.version).toBe('1.0.0');
      expect(nodeData.metadata?.created).toBeDefined();
    });
    it('validates serialized data', () => {
      const validData: AdvancedNodeData = {
        id: 'node-id',
        type: 'NodeType',
        config: {,
          deterministic: true,
          cacheable: false,
          stateful: true,
        },
        data: { key: 'value' }
      };
      expect(SerializationHelpers.validateSerializedData(validData).valid).toBe(true);
      // Missing fields
      expect();
        SerializationHelpers.validateSerializedData({)
          ...validData,
          id: '',
        } as any).valid
      ).toBe(false);
      expect();
        SerializationHelpers.validateSerializedData({)
          ...validData,
          type: undefined,
        } as any).valid
      ).toBe(false);
      expect();
        SerializationHelpers.validateSerializedData({)
          ...validData,
          config: null,
        } as any).valid
      ).toBe(false);
      expect();
        SerializationHelpers.validateSerializedData({)
          ...validData,
          data: undefined,
        } as any).valid
      ).toBe(false);
      // Invalid config types
      expect();
        SerializationHelpers.validateSerializedData({)
          ...validData,
          config: {,
            deterministic: 'yes',
            cacheable: false,
            stateful: true,
          }
        } as any).valid
      ).toBe(false);
    });
  });
  describe('AdvancedRuntimeNodeWithIO', () => {
    class TestNodeWithIO extends AdvancedRuntimeNodeWithIO<string> {
      constructor(id: string) {
        super();
          id,
          {
            deterministic: true,
            cacheable: false,
            stateful: false,
          },
          undefined // IO spec would be defined here
        );
      }
      run(ctx: AdvancedExecutionContext): string {
        return 'test-output';
      }
      serialize(): AdvancedNodeData {
        return SerializationHelpers.createAdvancedNodeData()
          this.id,
          'TestWithIO',
          this.config,
        );
      }
      protected validateNodeConfig() {
        return ValidationHelpers.createValidResult();
      }
    }
    it('extends AdvancedRuntimeNode correctly', () => {
      const node = new TestNodeWithIO('io-test');
      expect(node).toBeInstanceOf(AdvancedRuntimeNode);
      expect(node).toBeInstanceOf(AdvancedRuntimeNodeWithIO);
    });
    it('validates without IO handler', () => {
      const node = new TestNodeWithIO('io-test');
      const result = node.validate();
      expect(result.valid).toBe(true);
    });
    it('runs correctly', () => {
      const node = new TestNodeWithIO('io-test');
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      expect(node.run(ctx)).toBe('test-output');
    });
  });
  describe('Performance and edge cases', () => {
    it('handles high evaluation depth', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      for (let i = 0; i < 1000; i++) {
        ctx.evaluationDepth = i;
        expect(AdvancedExecutionUtils.detectInfiniteLoop(ctx, 'node')).toBe(false);
      }
      ctx.evaluationDepth = 1001;
      expect(AdvancedExecutionUtils.detectInfiniteLoop(ctx, 'node')).toBe(true);
    });
    it('handles large cache sizes', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      const node = new TestAdvancedNode('cache-test', 'data');
      // Simulate many cache entries
      for (let i = 0; i < 1000; i++) {
        ctx.cache.set(`key-${i}`, `value-${i}`);}
      }
      expect(ctx.cache.size).toBe(1000);
      // Clear should remove all
      AdvancedExecutionUtils.clearExecutionState(ctx);
      expect(ctx.cache.size).toBe(0);
    });
    it('handles concurrent state modifications', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      const node1 = new StatefulTestNode('node1');
      const node2 = new StatefulTestNode('node2');
      // Interleaved execution
      expect(node1.run(ctx)).toBe(0);
      expect(node2.run(ctx)).toBe(0);
      expect(node1.run(ctx)).toBe(1);
      expect(node2.run(ctx)).toBe(1);
      expect(ctx.nodeStates.get('node1')).toBe(2);
      expect(ctx.nodeStates.get('node2')).toBe(2);
    });
    it('measures very fast operations', () => {
      const ctx = AdvancedExecutionUtils.enhanceContext({)
        variables: {},
        seed: 'test',
      });
      class FastNode extends TestAdvancedNode {
        measureFast(ctx: AdvancedExecutionContext) {
          return this.measureExecution(ctx, 'fast-op', () => {
            return 1 + 1;
          });
        }
      }
      const node = new FastNode('fast', 'data');
      const result = node.measureFast(ctx);
      expect(result).toBe(2);
      expect(ctx.executionMeta.performanceMetrics.has('fast-fast-op_duration_ms')).toBe(true);
    });
  });
});