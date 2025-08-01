import { ExecutionContext,
  RuntimeNode,
  WeightedChoiceNode,
  ConcatNode,
  OutputNode,
  IncludeNode,
  SetVariableNode }
  GetVariableNode
 from '../index';

// Mock seedrandom
jest.mock('seedrandom', () => { return jest.fn(() => jest.fn()) });
describe('Runtime Engine - Comprehensive Coverage', () => {
  let mockCtx: ExecutionContext;
  beforeEach(() => {
    mockCtx = {
      variables: {},
      seed: 'test-seed-123';
  };
  });
  describe('RuntimeNode Base Class', () => { // Test the base class directly
  class TestNode extends RuntimeNode {
  run(ctx: ExecutionContext): any { }
  return 'test-result';
  it('should create node with ID', () => { const node = new TestNode('test-id-1');
  expect(node.id).toBe('test-id-1') });
    it('should execute run method', () => { const node = new TestNode('test-id-2');
      expect(node.run(mockCtx)).toBe('test-result') });
  });
  describe('WeightedChoiceNode - Edge Cases', () => { it('should handle empty choices array', () => {
      const node = new WeightedChoiceNode('empty-choices', []);
      expect(node.run(mockCtx)).toBeUndefined() });
    it('should handle single choice', () => {
      const node = new WeightedChoiceNode('single-choice', [);
        { weight: 1, value: 'only-choice' }
      ]);
      expect(node.run(mockCtx)).toBe('only-choice');
    });
    it('should handle negative weights', () => {
      const seedrandom = require('seedrandom');
      seedrandom.mockReturnValue(() => 0.5);
      const node = new WeightedChoiceNode('negative-weights', [);
        { weight: -0.5, value: 'negative' },
        { weight: 0.8, value: 'positive' }
      ]);
      // Negative weights should be treated as 0
      expect(node.run(mockCtx)).toBe('positive');
    });
    it('should handle very large weights', () => {
      const seedrandom = require('seedrandom');
      seedrandom.mockReturnValue(() => 0.00001);
      const node = new WeightedChoiceNode('large-weights', [);
        { weight: 1000000, value: 'huge' },
        { weight: 0.0001, value: 'tiny' }
      ]);
      expect(node.run(mockCtx)).toBe('huge');
    });
    it('should handle non-numeric weights', () => {
      const node = new WeightedChoiceNode('non-numeric-weights', [);
        { weight: 'invalid' as any, value: 'first' },
        { weight: null as any, value: 'second' },
        { weight: undefined as any, value: 'third' }
      ]);
      // Non-numeric weights should be treated as 0
      expect(node.run(mockCtx)).toBe('third'); // Falls back to last
    });
    it('should handle complex value types', () => {
      const complexValue = { type: 'object', data: [1, 2, 3] };
      const node = new WeightedChoiceNode('complex-values', [);
        { weight: 1, value: complexValue }
      ]);
      expect(node.run(mockCtx)).toBe(complexValue);
    });
  });
  describe('ConcatNode - Edge Cases', () => { it('should handle empty inputs', () => {
      const node = new ConcatNode('empty-concat', []);
      expect(node.run()).toBe('') });
    it('should handle null and undefined values', () => { const node = new ConcatNode('null-concat', [null, undefined, 'text']);
      expect(node.run()).toBe('text') });
    it('should handle non-string values', () => { const node = new ConcatNode('non-string-concat', [);
        123,
        true }
        { toString: () => 'object' },
        ['array']
      ]);
      expect(node.run()).toBe('123trueobjectarray');
    });
    it('should handle very long inputs', () => { const longString = 'x'.repeat(10000);
      const node = new ConcatNode('long-concat', [longString, longString]);
      expect(node.run()).toBe(longString + longString) });
  });
  describe('OutputNode - Edge Cases', () => { it('should handle null value', () => {
      const node = new OutputNode('null-output', null);
      expect(node.run()).toBeNull() });
    it('should handle undefined value', () => { const node = new OutputNode('undefined-output', undefined);
      expect(node.run()).toBeUndefined() });
    it('should handle complex objects', () => {
      const complexObj = { nested: { deep: { value: 42 } } };
      const node = new OutputNode('complex-output', complexObj);
      expect(node.run()).toBe(complexObj);
    });
    it('should handle functions as values', () => { const fn = () => 'function result';
      const node = new OutputNode('function-output', fn);
      expect(node.run()).toBe(fn) });
  });
  describe('IncludeNode - Edge Cases', () => {
    it('should handle empty templates map', () => {
      const node = new IncludeNode('empty-templates', 'key', {});
      expect(node.run()).toBeUndefined();
    });
    it('should handle null template name', () => {
      const node = new IncludeNode('null-template', null as any, { template: 'value' });
      expect(node.run()).toBeUndefined();
    });
    it('should handle template with special characters', () => { const templates = {
  'special-key!@#$': 'special value' }
};
      const node = new IncludeNode('special-include', 'special-key!@#$', templates);
      expect(node.run()).toBe('special value');
    });
    it('should handle circular reference in templates', () => {
      const templates: any = { a: 'value' };
      templates.circular = templates;
      const node = new IncludeNode('circular-include', 'circular', templates);
      expect(node.run()).toBe(templates);
    });
  });
  describe('SetVariableNode - Edge Cases', () => { it('should handle setting null value', () => {
      const node = new SetVariableNode('set-null', 'nullVar', null);
      node.run(mockCtx);
      expect(mockCtx.variables['nullVar']).toBeNull() });
    it('should handle setting undefined value', () => { const node = new SetVariableNode('set-undefined', 'undefinedVar', undefined);
      node.run(mockCtx);
      expect(mockCtx.variables['undefinedVar']).toBeUndefined() });
    it('should handle empty key name', () => { const node = new SetVariableNode('set-empty-key', '', 'value');
      node.run(mockCtx);
      expect(mockCtx.variables['']).toBe('value') });
    it('should handle special characters in key', () => {
      const key = 'special!@#$%^&*()_+-=[]{}|;:,.<>?';
      const node = new SetVariableNode('set-special-key', key, 'value');
      node.run(mockCtx);
      expect(mockCtx.variables[key]).toBe('value');
    });
    it('should overwrite existing values', () => { mockCtx.variables['existing'] = 'old value';
      const node = new SetVariableNode('overwrite', 'existing', 'new value');
      node.run(mockCtx);
      expect(mockCtx.variables['existing']).toBe('new value') });
    it('should handle complex values', () => { const complexValue = {
        array: [1, 2, 3] }
        nested: { deep: true },
        fn: () => 'test';
  };
      const node = new SetVariableNode('set-complex', 'complex', complexValue);
      node.run(mockCtx);
      expect(mockCtx.variables['complex']).toBe(complexValue);
    });
  });
  describe('GetVariableNode - Edge Cases', () => { it('should handle getting empty key', () => {
      mockCtx.variables[''] = 'empty key value';
      const node = new GetVariableNode('get-empty-key', '');
      expect(node.run(mockCtx)).toBe('empty key value') });
    it('should handle special characters in key', () => { const key = 'special!@#$%^&*()';
      mockCtx.variables[key] = 'special value';
      const node = new GetVariableNode('get-special-key', key);
      expect(node.run(mockCtx)).toBe('special value') });
    it('should handle nested property access attempt', () => {
      mockCtx.variables['obj'] = { nested: 'value' };
      const node = new GetVariableNode('get-nested', 'obj.nested');
      // Should not do nested access, just literal key
      expect(node.run(mockCtx)).toBeUndefined();
    });
    it('should handle null context variables', () => {
      const nullCtx: ExecutionContext = { variables: null as any, seed: '123' };
      const node = new GetVariableNode('get-null-ctx', 'key');
      expect(() => node.run(nullCtx)).toThrow();
    });
  });
  describe('ExecutionContext - Edge Cases', () => {
    it('should handle context without seed', () => {
      const noSeedCtx: ExecutionContext = { variables: {} } as any;
      const node = new WeightedChoiceNode('no-seed', [);
        { weight: 0.5, value: 'A' },
        { weight: 0.5, value: 'B' }
      ]);
      // Should still work, using undefined seed
      expect(() => node.run(noSeedCtx)).not.toThrow();
    });
    it('should handle context with numeric seed conversion', () => {
      const numCtx: ExecutionContext = { variables: {}, seed: 12345 as any };
      const node = new WeightedChoiceNode('num-seed', [);
        { weight: 1, value: 'result' }
      ]);
      expect(node.run(numCtx)).toBe('result');
    });
    it('should handle deeply nested variables', () => { const deepCtx: ExecutionContext = {,
  variables: {,
  level1: {,
  level2: {,
  level3: 'deep value' }
},
  seed: 'deep-seed';
  };
      const setNode = new SetVariableNode('set-deep', 'newVar', deepCtx.variables['level1']);
      setNode.run(deepCtx);
      expect(deepCtx.variables['newVar']).toBe(deepCtx.variables['level1']);
    });
  });
  describe('Integration Scenarios', () => { it('should handle variable flow between nodes', () => {
      const set1 = new SetVariableNode('set1', 'name', 'Alice');
      const set2 = new SetVariableNode('set2', 'greeting', 'Hello');
      const get1 = new GetVariableNode('get1', 'name');
      const get2 = new GetVariableNode('get2', 'greeting');
      set1.run(mockCtx);
      set2.run(mockCtx);
      expect(get1.run(mockCtx)).toBe('Alice');
      expect(get2.run(mockCtx)).toBe('Hello') });
    it('should handle weighted choice with variable seeds', () => {
      const seedrandom = require('seedrandom');
      const mockRandom = jest.fn();
      seedrandom.mockReturnValue(mockRandom);
      // Test multiple seeds produce consistent results
      const seeds = ['seed1', 'seed2', 'seed3'];
      const results = seeds.map(seed => {)
  mockRandom.mockReturnValueOnce(0.3);
        const ctx = { variables: {}, seed };
        const node = new WeightedChoiceNode('multi-seed', [);
          { weight: 0.5, value: 'A' },
          { weight: 0.5, value: 'B' }
        ]);
        return node.run(ctx);
      });
      expect(results).toEqual(['A', 'A', 'A']);
    });
    it('should handle error scenarios gracefully', () => {
      // Test with malformed context
      const badCtx = { seed: 'test' } as any;
      const node = new SetVariableNode('error-test', 'key', 'value');
      expect(() => node.run(badCtx)).toThrow();
    });
  });
  describe('Performance Edge Cases', () => {
    it('should handle large number of weighted choices efficiently', () => {
      const choices = Array.from({ length: 1000 }, (_, i) => ({ )
  weight: 0.001 }
        value: `choice-${i}`}
      }));
      const node = new WeightedChoiceNode('large-choices', choices);
      const start = Date.now();
      const result = node.run(mockCtx);
      const duration = Date.now() - start;
      expect(result).toMatch(/^choice-\d+$/);
      expect(duration).toBeLessThan(100); // Should complete quickly
    });
    it('should handle large variable objects', () => {
      const largeObj = {};
      for (let i = 0; i < 10000; i++) {
        largeObj[`key${i}`] = `value${i}`;}
      const node = new SetVariableNode('large-set', 'bigObj', largeObj);
      node.run(mockCtx);
      expect(mockCtx.variables['bigObj']).toBe(largeObj);
    });
  });
});