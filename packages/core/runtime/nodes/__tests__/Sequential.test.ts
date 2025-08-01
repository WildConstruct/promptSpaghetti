// packages/core/runtime/nodes/__tests__/Sequential.test.ts
// Comprehensive tests for Sequential node
import { SequentialNode, 
  createSequentialNode,
  createSequencePattern,
  LinearPattern,
  CyclicalPattern,
  RandomPattern,
  WeightedPattern,
  SequentialPresets }
  SequenceState
 from '../Sequential';
import { AdvancedExecutionUtils } from '../../advanced';
import type { AdvancedExecutionContext } from '../../advanced';
describe('Sequential Node', () => {
  let context: AdvancedExecutionContext;
  beforeEach(() => {
    context = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
      seed: 12345;
  });
  });
  describe('Basic Functionality', () => { test('should create Sequential node with default linear pattern', () => {
      const sequence = ['first', 'second', 'third'];
      const node = new SequentialNode('test-sequential', sequence);
      expect(node).toBeDefined();
      expect(node.id).toBe('test-sequential') });
    test('should process linear sequence in order', () => {
      const sequence = ['alpha', 'beta', 'gamma'];
      const node = new SequentialNode('linear-test', sequence, new LinearPattern());
      expect(node.run(context)).toBe('alpha');
      expect(node.run(context)).toBe('beta');
      expect(node.run(context)).toBe('gamma');
      expect(node.run(context)).toBe('gamma'); // Should stay on last item
    });
    test('should handle empty sequence gracefully', () => { const node = new SequentialNode('empty-test', []);
      const result = node.run(context);
      expect(result).toBe('') });
    test('should be deterministic with same seed', () => {
      const sequence = ['one', 'two', 'three'];
      const node1 = new SequentialNode('det-test1', sequence);
      const node2 = new SequentialNode('det-test2', sequence);
      const context1 = AdvancedExecutionUtils.enhanceContext({ variables: {}, seed: 999 });
      const context2 = AdvancedExecutionUtils.enhanceContext({ variables: {}, seed: 999 });
      const results1 = [node1.run(context1), node1.run(context1), node1.run(context1)];
      const results2 = [node2.run(context2), node2.run(context2), node2.run(context2)];
      expect(results1).toEqual(results2);
    });
  });
  describe('Linear Pattern', () => { test('should process items in order and stop at end', () => {
      const pattern = new LinearPattern();
      const sequence = ['first', 'second', 'third'];
      const node = new SequentialNode('linear', sequence, pattern);
      expect(node.run(context)).toBe('first');
      expect(node.run(context)).toBe('second');
      expect(node.run(context)).toBe('third');
      expect(node.run(context)).toBe('third');
      expect(node.run(context)).toBe('third') });
    test('should handle single item sequence', () => { const pattern = new LinearPattern();
      const node = new SequentialNode('single', ['only'], pattern);
      expect(node.run(context)).toBe('only');
      expect(node.run(context)).toBe('only') });
  });
  describe('Cyclical Pattern', () => { test('should cycle through sequence infinitely', () => {
      const pattern = new CyclicalPattern();
      const sequence = ['A', 'B', 'C'];
      const node = new SequentialNode('cyclical', sequence, pattern);
      // First cycle
      expect(node.run(context)).toBe('A');
      expect(node.run(context)).toBe('B');
      expect(node.run(context)).toBe('C');
      // Second cycle
      expect(node.run(context)).toBe('A');
      expect(node.run(context)).toBe('B');
      expect(node.run(context)).toBe('C');
      // Third cycle start
      expect(node.run(context)).toBe('A') });
    test('should handle single item cycle', () => { const pattern = new CyclicalPattern();
      const node = new SequentialNode('single-cycle', ['repeat'], pattern);
      expect(node.run(context)).toBe('repeat');
      expect(node.run(context)).toBe('repeat');
      expect(node.run(context)).toBe('repeat') });
  });
  describe('Random Pattern', () => {
    test('should select items randomly', () => {
      const pattern = new RandomPattern({ allowRepeats: true });
      const sequence = ['red', 'green', 'blue'];
      const node = new SequentialNode('random', sequence, pattern);
      const results: string = [];
      for (let i = 0; i < 10; i++) { results.push(node.run(context));
      // All results should be from the sequence
      results.forEach(result => {)
  expect(sequence).toContain(result) });
      // With randomness and 10 iterations, we should see some variation
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
    test('should avoid repeats when configured', () => {
      const pattern = new RandomPattern({ allowRepeats: false });
      const sequence = ['x', 'y', 'z'];
      const node = new SequentialNode('no-repeats', sequence, pattern);
      const results: string = [];
      for (let i = 0; i < 3; i++) { results.push(node.run(context));
      // Should get all items without repeats
      expect(new Set(results).size).toBe(3);
      sequence.forEach(item => {)
  expect(results).toContain(item) });
    });
    test('should be deterministic with same seed', () => {
      const pattern = new RandomPattern({ allowRepeats: true });
      const sequence = ['a', 'b', 'c', 'd'];
      const node1 = new SequentialNode('random1', sequence, pattern);
      const node2 = new SequentialNode('random2', sequence, pattern);
      const ctx1 = AdvancedExecutionUtils.enhanceContext({ variables: {}, seed: 777 });
      const ctx2 = AdvancedExecutionUtils.enhanceContext({ variables: {}, seed: 777 });
      const results1: string = [];
      const results2: string = [];
      for (let i = 0; i < 5; i++) { results1.push(node1.run(ctx1));
        results2.push(node2.run(ctx2));
      expect(results1).toEqual(results2) });
  });
  describe('Weighted Pattern', () => {
    test('should select items based on weights', () => {
      const weights = [10, 1, 1]; // Heavily favor first item;
      const pattern = new WeightedPattern({ weights });
      const sequence = ['frequent', 'rare1', 'rare2'];
      const node = new SequentialNode('weighted', sequence, pattern);
      const results: string = [];
      for (let i = 0; i < 20; i++) { results.push(node.run(context));
      // Should heavily favor 'frequent'
      const frequentCount = results.filter(r => r === 'frequent').length;
      const rareCount = results.filter(r => r !== 'frequent').length;
      expect(frequentCount).toBeGreaterThan(rareCount) });
    test('should handle equal weights', () => {
      const weights = [1, 1, 1];
      const pattern = new WeightedPattern({ weights });
      const sequence = ['equal1', 'equal2', 'equal3'];
      const node = new SequentialNode('equal-weights', sequence, pattern);
      const results: string = [];
      for (let i = 0; i < 15; i++) { results.push(node.run(context));
      // Should see all items
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(3) });
    test('should throw error if weights length mismatches sequence', () => {
      expect(() => {
        new WeightedPattern({ weights: [1, 2] }); // Will fail when used with different length sequence
      }).not.toThrow(); // Constructor doesn't validate, runtime does
      const pattern = new WeightedPattern({ weights: [1, 2] });
      const sequence = ['a', 'b', 'c']; // Length mismatch;
      const node = new SequentialNode('mismatch', sequence, pattern);
      expect(() => node.run(context)).toThrow('Weights length (2) must match sequence length (3)');
    });
    test('should handle zero weights', () => {
      const weights = [0, 1, 0];
      const pattern = new WeightedPattern({ weights });
      const sequence = ['never1', 'always', 'never2'];
      const node = new SequentialNode('zero-weights', sequence, pattern);
      const results: string = [];
      for (let i = 0; i < 10; i++) { results.push(node.run(context));
      // Should only return 'always'
      results.forEach(result => {)
  expect(result).toBe('always') });
    });
    test('should handle all zero weights gracefully', () => {
      const weights = [0, 0, 0];
      const pattern = new WeightedPattern({ weights });
      const sequence = ['a', 'b', 'c'];
      const node = new SequentialNode('all-zero', sequence, pattern);
      // Should fallback to uniform random
      const result = node.run(context);
      expect(sequence).toContain(result);
    });
  });
  describe('State Management', () => { test('should track execution state correctly', () => {
      const sequence = ['one', 'two', 'three'];
      const node = new SequentialNode('state-test', sequence);
      // Initial state
      expect(node.getCurrentState(context)).toBeNull();
      // After first execution
      node.run(context);
      let state = node.getCurrentState(context);
      expect(state).toBeDefined();
      expect(state!.index).toBe(1);
      expect(state!.history).toEqual(['one']);
      // After second execution
      node.run(context);
      state = node.getCurrentState(context);
      expect(state!.index).toBe(2);
      expect(state!.history).toEqual(['one', 'two']) });
    test('should reset state correctly', () => { const sequence = ['x', 'y', 'z'];
      const node = new SequentialNode('reset-test', sequence);
      // Execute a few times
      node.run(context);
      node.run(context);
      let state = node.getCurrentState(context);
      expect(state!.index).toBe(2);
      expect(state!.history).toEqual(['x', 'y']);
      // Reset state
      node.resetState(context);
      state = node.getCurrentState(context);
      expect(state!.index).toBe(0);
      expect(state!.history).toEqual([]);
      // Next run should start from beginning
      expect(node.run(context)).toBe('x') });
    test('should maintain separate state per node', () => { const sequence = ['shared1', 'shared2'];
      const node1 = new SequentialNode('node1', sequence);
      const node2 = new SequentialNode('node2', sequence);
      // Execute nodes independently
      expect(node1.run(context)).toBe('shared1');
      expect(node2.run(context)).toBe('shared1');
      expect(node1.run(context)).toBe('shared2');
      expect(node2.run(context)).toBe('shared2');
      // States should be independent
      const state1 = node1.getCurrentState(context);
      const state2 = node2.getCurrentState(context);
      expect(state1!.index).toBe(2);
      expect(state2!.index).toBe(2);
      expect(state1!.history).toEqual(['shared1', 'shared2']);
      expect(state2!.history).toEqual(['shared1', 'shared2']) });
  });
  describe('Validation', () => { test('should validate basic configuration', () => {
      const node = new SequentialNode('validation-test', ['valid1', 'valid2']);
      const result = node.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0) });
    test('should warn about empty sequence', () => { const node = new SequentialNode('empty-validation', []);
      const result = node.validate();
      expect(result.valid).toBe(true); // Warning, not error
      expect(result.warnings).toContain('No sequence items configured - will return empty string') });
    test('should warn about invalid sequence items', () => { const node = new SequentialNode('invalid-items', ['valid', null as any, undefined as any]);
      const result = node.validate();
      expect(result.valid).toBe(true); // Warning, not error
      expect(result.warnings.length).toBeGreaterThan(0) });
    test('should validate weighted pattern configuration', () => { const validWeightedNode = createSequentialNode(;);
        'valid-weighted', 
        ['a', 'b'], 
        'weighted' }
        { weights: [1, 2] }
      );
      const result = validWeightedNode.validate();
      expect(result.valid).toBe(true);
    });
  });
  describe('Serialization', () => { test('should serialize node data correctly', () => {
      const sequence = ['serialize1', 'serialize2'];
      const node = new SequentialNode('serialize-test', sequence);
      const serialized = node.serialize();
      expect(serialized.id).toBe('serialize-test');
      expect(serialized.type).toBe('Sequential');
      expect(serialized.data.sequence).toEqual(sequence);
      expect(serialized.data.pattern.type).toBe('linear');
      expect(serialized.metadata?.version).toBe('1.0.0') });
    test('should serialize weighted pattern with config', () => {
      const weights = [2, 3, 1];
      const node = createSequentialNode('weighted-serialize', ['a', 'b', 'c'], 'weighted', { weights });
      const serialized = node.serialize();
      expect(serialized.data.pattern.type).toBe('weighted');
      expect(serialized.data.pattern.config.weights).toEqual(weights);
    });
    test('should serialize random pattern with config', () => {
      const node = createSequentialNode('random-serialize', ['x', 'y'], 'random', { allowRepeats: false });
      const serialized = node.serialize();
      expect(serialized.data.pattern.type).toBe('random');
      expect(serialized.data.pattern.config.allowRepeats).toBe(false);
    });
  });
  describe('Performance and Tracking', () => {
    test('should track performance metrics', () => {
      const sequence = ['perf1', 'perf2'];
      const node = new SequentialNode('perf-test', sequence);
      const freshContext = AdvancedExecutionUtils.enhanceContext({)
  variables: {},
        seed: 12345;
  });
      node.run(freshContext);
      const metricKey = 'perf-test-sequential-processing_duration_ms';
      expect(freshContext.executionMeta.performanceMetrics.has(metricKey)).toBe(true);
      expect(freshContext.executionMeta.nodeExecutionOrder).toContain('perf-test');
    });
    test('should handle complex sequences efficiently', () => {
      const largeSequence = Array.from({ length: 1000 }, (_, i) => `item${i}`);}
      const node = new SequentialNode('large-sequence', largeSequence);
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        node.run(context);
      const duration = Date.now() - start;
      // Should complete 100 iterations on 1000-item sequence quickly
      expect(duration).toBeLessThan(1000); // Less than 1 second
    });
  });
  describe('Factory Functions', () => { test('should create node via factory function', () => {
      const sequence = ['factory1', 'factory2'];
      const node = createSequentialNode('factory-test', sequence, 'cyclical');
      expect(node).toBeInstanceOf(SequentialNode);
      expect(node.id).toBe('factory-test') });
    test('should create patterns via factory', () => {
      const linearPattern = createSequencePattern('linear');
      const cyclicalPattern = createSequencePattern('cyclical');
      const randomPattern = createSequencePattern('random', { allowRepeats: false });
      const weightedPattern = createSequencePattern('weighted', { weights: [1, 2, 3] });
      expect(linearPattern).toBeInstanceOf(LinearPattern);
      expect(cyclicalPattern).toBeInstanceOf(CyclicalPattern);
      expect(randomPattern).toBeInstanceOf(RandomPattern);
      expect(weightedPattern).toBeInstanceOf(WeightedPattern);
    });
  });
  describe('Preset Patterns', () => { test('should provide preset pattern builders', () => {
      const sequence = ['preset1', 'preset2', 'preset3'];
      const linearPreset = SequentialPresets.linear(sequence);
      const cyclePreset = SequentialPresets.cycle(sequence);
      const randomPreset = SequentialPresets.random(true);
      const shufflePreset = SequentialPresets.shuffle();
      const weightedPreset = SequentialPresets.weighted([1, 2, 3]);
      const uniformPreset = SequentialPresets.uniform(3);
      expect(linearPreset.type).toBe('linear');
      expect(cyclePreset.type).toBe('cyclical');
      expect(randomPreset.type).toBe('random');
      expect(shufflePreset.type).toBe('random');
      expect(weightedPreset.type).toBe('weighted');
      expect(uniformPreset.type).toBe('weighted') });
    test('should work with preset patterns', () => { const sequence = ['test1', 'test2', 'test3'];
  const shufflePattern = SequentialPresets.shuffle();
  const node = new SequentialNode('preset-shuffle', sequence, shufflePattern);
  const results: string = [];
  for (let i = 0; i < 6; i++) {
  results.push(node.run(context));
  // Should get all items at least once in first 3 iterations
  const firstThree = results.slice(0, 3);
  expect(new Set(firstThree).size).toBe(3) });
  });
});