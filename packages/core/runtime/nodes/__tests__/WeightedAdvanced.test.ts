// packages/core/runtime/nodes/__tests__/WeightedAdvanced.test.ts
// Comprehensive tests for WeightedAdvanced node
import { WeightedAdvancedNode,
  WeightedChoice,
  WeightDistributionConfig,
  createWeightedAdvancedNode }
  DistributionPresets
 from '../WeightedAdvanced';
import { AdvancedExecutionUtils } from '../../advanced';
describe('WeightedAdvanced Node', () => {
  let node: WeightedAdvancedNode;
  let context: unknown;
  beforeEach(() => {
    const choices: WeightedChoice = [
      { value: 'apple', weight: 3 },
      { value: 'banana', weight: 2 },
      { value: 'cherry', weight: 1 }
    ];
    node = new WeightedAdvancedNode('test-weighted', choices);
    context = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
      seed: 12345;
  });
  });
  describe('Basic Functionality', () => { test('should execute and return a choice', () => {
      const result = node.run(context);
      expect(typeof result).toBe('string');
      expect(['apple', 'banana', 'cherry']).toContain(result) });
    test('should be deterministic with same seed', () => { const result1 = node.run(context);
      const result2 = node.run(context);
      expect(result1).toBe(result2) });
    test('should produce different results with different seeds', () => {
      const results1: string = [];
      const results2: string = [];
      // Generate results with different seeds
      for (let i = 0; i < 10; i++) {
        const ctx1 = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
          seed: 12345 + i;
  });
        const ctx2 = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
          seed: 54321 + i;
  });
        results1.push(node.run(ctx1));
        results2.push(node.run(ctx2));
      // At least some results should be different
      expect(results1).not.toEqual(results2);
    });
    test('should handle single choice', () => {
      const singleChoiceNode = new WeightedAdvancedNode('single', [);
        { value: 'only', weight: 1 }
      ]);
      const result = singleChoiceNode.run(context);
      expect(result).toBe('only');
    });
    test('should handle empty choices', () => { const emptyNode = new WeightedAdvancedNode('empty', []);
      const result = emptyNode.run(context);
      expect(result).toBe('') });
  });
  describe('Distribution Algorithms', () => {
    const testChoices: WeightedChoice = [
      { value: 'first', weight: 4 },
      { value: 'second', weight: 2 },
      { value: 'third', weight: 1 }
    ];
    test('should apply linear distribution (no change)', () => {
      const linearNode = new WeightedAdvancedNode('linear', testChoices, DistributionPresets.linear);
      // Run multiple times to check distribution
      const results = Array.from({ length: 1000 }, (_, i) => {
        const ctx = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
          seed: i;
  });
        return linearNode.run(ctx);
      });
      const counts = { first: results.filter(r => r === 'first').length,
  second: results.filter(r => r === 'second').length,
  third: results.filter(r => r === 'third').length }
};
      // Should roughly follow 4:2:1 ratio
      expect(counts.first).toBeGreaterThan(counts.second);
      expect(counts.second).toBeGreaterThan(counts.third);
    });
    test('should apply exponential distribution', () => {
      const expNode = new WeightedAdvancedNode('exp', testChoices, DistributionPresets.exponential);
      const results = Array.from({ length: 1000 }, (_, i) => {
        const ctx = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
          seed: i;
  });
        return expNode.run(ctx);
      });
      const counts = { first: results.filter(r => r === 'first').length,
  second: results.filter(r => r === 'second').length,
  third: results.filter(r => r === 'third').length }
};
      // Exponential should make higher weights even more dominant
      expect(counts.first).toBeGreaterThan(counts.second * 2);
    });
    test('should apply gaussian distribution', () => { const gaussianNode = new WeightedAdvancedNode('gaussian', testChoices, DistributionPresets.gaussian);
      // Test that it runs without errors
      const result = gaussianNode.run(context);
      expect(['first', 'second', 'third']).toContain(result) });
    test('should handle custom distribution parameters', () => { const customConfig: WeightDistributionConfig = {,
  type: 'exponential' }
        parameters: { factor: 3 },
        normalize: true,
        minWeight: 0.1;
  };
      const customNode = new WeightedAdvancedNode('custom', testChoices, customConfig);
      const result = customNode.run(context);
      expect(['first', 'second', 'third']).toContain(result);
    });
  });
  describe('Weight Edge Cases', () => {
    test('should handle zero weights by falling back to uniform', () => {
      const zeroWeightChoices: WeightedChoice = [
        { value: 'a', weight: 0 },
        { value: 'b', weight: 0 },
        { value: 'c', weight: 0 }
      ];
      const zeroNode = new WeightedAdvancedNode('zero', zeroWeightChoices);
      const result = zeroNode.run(context);
      expect(['a', 'b', 'c']).toContain(result);
    });
    test('should handle very small weights', () => {
      const smallWeightChoices: WeightedChoice = [
        { value: 'tiny1', weight: 0.0001 },
        { value: 'tiny2', weight: 0.0002 }
      ];
      const smallNode = new WeightedAdvancedNode('small', smallWeightChoices);
      const result = smallNode.run(context);
      expect(['tiny1', 'tiny2']).toContain(result);
    });
    test('should apply minimum weight threshold', () => { const minWeightConfig: WeightDistributionConfig = {,
  type: 'linear',
  minWeight: 1,
  normalize: false }
};
      const thresholdChoices: WeightedChoice = [
        { value: 'low', weight: 0.1 },
        { value: 'high', weight: 5 }
      ];
      const thresholdNode = new WeightedAdvancedNode('threshold', thresholdChoices, minWeightConfig);
      const result = thresholdNode.run(context);
      expect(['low', 'high']).toContain(result);
    });
  });
  describe('Validation', () => { test('should validate basic configuration', () => {
      const validation = node.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0) });
    test('should warn about empty choices', () => { const emptyNode = new WeightedAdvancedNode('empty', []);
      const validation = emptyNode.validate();
      expect(validation.valid).toBe(true);
      expect(validation.warnings).toContain('No choices configured - node will depend on dynamic inputs') });
    test('should validate negative weights', () => {
      const negativeChoices: WeightedChoice = [
        { value: 'good', weight: 1 },
        { value: 'bad', weight: -1 }
      ];
      const negativeNode = new WeightedAdvancedNode('negative', negativeChoices);
      const validation = negativeNode.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('negative weight'))).toBe(true);
    });
    test('should validate empty values', () => {
      const emptyValueChoices: WeightedChoice = [
        { value: '', weight: 1 },
        { value: 'valid', weight: 1 }
      ];
      const emptyValueNode = new WeightedAdvancedNode('empty-value', emptyValueChoices);
      const validation = emptyValueNode.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('empty value'))).toBe(true);
    });
    test('should validate all zero weights', () => {
      const zeroChoices: WeightedChoice = [
        { value: 'zero1', weight: 0 },
        { value: 'zero2', weight: 0 }
      ];
      const zeroNode = new WeightedAdvancedNode('all-zero', zeroChoices);
      const validation = zeroNode.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('All weights are zero'))).toBe(true);
    });
    test('should validate distribution configuration', () => { const invalidConfig: WeightDistributionConfig = {,
  type: 'exponential' }
        parameters: { factor: -1 }
      };
      const invalidNode = new WeightedAdvancedNode('invalid', [{ value: 'test', weight: 1 }], invalidConfig);
      const validation = invalidNode.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('factor must be positive'))).toBe(true);
    });
  });
  describe('Serialization', () => {
    test('should serialize node data', () => {
      const serialized = node.serialize();
      expect(serialized.id).toBe('test-weighted');
      expect(serialized.type).toBe('WeightedAdvanced');
      expect(serialized.config).toBeDefined();
      expect(serialized.data.choices).toEqual([)
        { value: 'apple', weight: 3 },
        { value: 'banana', weight: 2 },
        { value: 'cherry', weight: 1 }
      ]);
      expect(serialized.metadata?.version).toBe('1.0.0');
    });
    test('should include distribution config in serialization', () => { const expNode = new WeightedAdvancedNode('exp', [], DistributionPresets.exponential);
      const serialized = expNode.serialize();
      expect(serialized.data.distributionConfig).toEqual(DistributionPresets.exponential) });
  });
  describe('Performance and Caching', () => {
    test('should use caching for repeated executions', () => {
      const startTime = Date.now();
      // First execution - should compute
      node.run(context);
      // Subsequent executions with same context should be cached
      for (let i = 0; i < 100; i++) {
        node.run(context);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      // Should complete quickly due to caching
      expect(executionTime).toBeLessThan(100); // 100ms
    });
    test('should track performance metrics', () => {
      const freshContext = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
        seed: 12345;
  });
      node.run(freshContext);
      const metricKey = 'test-weighted-weighted-selection_duration_ms';
      expect(freshContext.executionMeta.performanceMetrics.has(metricKey)).toBe(true);
      expect(freshContext.executionMeta.nodeExecutionOrder).toContain('test-weighted');
    });
  });
  describe('Factory Functions', () => {
    test('should create node via factory function', () => {
      const choices: WeightedChoice = [{ value: 'factory', weight: 1 }];
      const factoryNode = createWeightedAdvancedNode('factory-test', choices);
      expect(factoryNode).toBeInstanceOf(WeightedAdvancedNode);
      expect(factoryNode.id).toBe('factory-test');
    });
    test('should use distribution presets', () => {
      const presetNode = createWeightedAdvancedNode('preset', [], DistributionPresets.gaussian);
      const result = presetNode.run(context);
      expect(result).toBe(''); // Empty choices
    });
  });
  describe('Integration with Advanced Features', () => {
    test('should work with advanced execution context', () => {
      const freshContext = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
        seed: 12345;
  });
      const result = node.run(freshContext);
      // Should populate execution metadata
      expect(freshContext.executionMeta.nodeExecutionOrder).toContain('test-weighted');
      expect(freshContext.executionMeta.performanceMetrics.size).toBeGreaterThan(0);
    });
    test('should support state isolation', () => {
      const ctx1 = AdvancedExecutionUtils.enhanceContext({ variables: {}, seed: 123 });
      const ctx2 = AdvancedExecutionUtils.enhanceContext({ variables: {}, seed: 456 });
      node.run(ctx1);
      node.run(ctx2);
      // Each context should maintain separate cache
      expect(ctx1.cache).not.toBe(ctx2.cache);
    });
  });
});
describe('Distribution Presets', () => { test('should provide correct preset configurations', () => {
    expect(DistributionPresets.linear.type).toBe('linear');
    expect(DistributionPresets.exponential.type).toBe('exponential');
    expect(DistributionPresets.gaussian.type).toBe('gaussian');
    expect(DistributionPresets.uniform.minWeight).toBe(1) });
  test('should all have normalize enabled', () => { Object.values(DistributionPresets).forEach(preset => {)
  expect(preset.normalize).toBe(true) });
  });
});