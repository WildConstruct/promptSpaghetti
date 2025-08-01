import { WeightedChoiceNode,
  ConcatNode,
  OutputNode,
  IncludeNode,
  SetVariableNode,
  GetVariableNode,
  ExecutionContext }
  RuntimeNode
 from '../runtime';
import seedrandom from 'seedrandom';

// Mock seedrandom for deterministic testing
jest.mock('seedrandom', () => { return jest.fn(() => {
    let seed = 0;
    return () => {
      seed = (seed + 0.3) % 1;
      return seed };
  });
});
describe('Runtime Engine - Comprehensive Tests', () => {
  const createContext = (overrides?: Partial<ExecutionContext>): ExecutionContext => ({)
  variables: {}
    seed: 'test-seed'
    ...overrides
  });
  afterEach(() => { jest.clearAllMocks() });
  describe('WeightedChoiceNode', () => {
    it('returns deterministic value for same seed', () => {
      const choices = [
        { value: 'A', weight: 1 }
        { value: 'B', weight: 1 }
        { value: 'C', weight: 1 }
      ];
      const node1 = new WeightedChoiceNode('w1', choices);
      const node2 = new WeightedChoiceNode('w1', choices);
      const ctx1 = createContext({ seed: 'same-seed' });
      const ctx2 = createContext({ seed: 'same-seed' });
      expect(node1.run(ctx1)).toBe(node2.run(ctx2));
    });
    it('returns different values for different seeds', () => {
      const choices = [
        { value: 'A', weight: 1 }
        { value: 'B', weight: 1 }
        { value: 'C', weight: 1 }
      ];
      const node = new WeightedChoiceNode('w1', choices);
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        const ctx = createContext({ seed: `seed-${i}` });}
        results.add(node.run(ctx));
      // With different seeds, we should get at least 2 different results
      expect(results.size).toBeGreaterThanOrEqual(2);
    });
    it('respects weight distribution', () => {
      const choices = [
        { value: 'A', weight: 10 },
        { value: 'B', weight: 1 }
      ];
      const node = new WeightedChoiceNode('w1', choices);
      const results = { A: 0, B: 0 };
      // Run many times to check distribution
      for (let i = 0; i < 100; i++) {
        const ctx = createContext({ seed: `seed-${i}` });}
        const result = node.run(ctx);
        results[result as keyof typeof results]++;
      // A should appear significantly more often than B
      expect(results.A).toBeGreaterThan(results.B);
    });
    it('handles zero weights correctly', () => {
      const choices = [
        { value: 'A', weight: 0 },
        { value: 'B', weight: 1 }
      ];
      const node = new WeightedChoiceNode('w1', choices);
      const ctx = createContext();
      // Should always return B since A has weight 0
      expect(node.run(ctx)).toBe('B');
    });
    it('handles single choice', () => {
      const choices = [{ value: 'Only', weight: 1 }];
      const node = new WeightedChoiceNode('w1', choices);
      const ctx = createContext();
      expect(node.run(ctx)).toBe('Only');
    });
    it('handles empty choices gracefully', () => {
      const choices: Array<{ value: string; weight: number }> = [];
      const node = new WeightedChoiceNode('w1', choices);
      const ctx = createContext();
      // Should handle empty choices without throwing
      expect(() => node.run(ctx)).not.toThrow();
    });
    it('handles negative weights as zero', () => {
      const choices = [
        { value: 'A', weight: -5 },
        { value: 'B', weight: 1 }
      ];
      const node = new WeightedChoiceNode('w1', choices);
      const ctx = createContext();
      // Should treat negative weights as 0, so always returns B
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(node.run(createContext({ seed: `seed-${i}` })));}
      expect(results.size).toBe(1);
      expect(results.has('B')).toBe(true);
    });
    it('maintains node id correctly', () => { const node = new WeightedChoiceNode('custom-id', []);
      expect(node.id).toBe('custom-id') });
  });
  describe('ConcatNode', () => { it('concatenates strings correctly', () => {
      const node = new ConcatNode('c1', ['Hello', ' ', 'World', '!']);
      expect(node.run()).toBe('Hello World!') });
    it('handles empty inputs', () => { const node = new ConcatNode('c1', []);
      expect(node.run()).toBe('') });
    it('handles single input', () => { const node = new ConcatNode('c1', ['Single']);
      expect(node.run()).toBe('Single') });
    it('handles empty strings in inputs', () => { const node = new ConcatNode('c1', ['Start', '', '', 'End']);
      expect(node.run()).toBe('StartEnd') });
    it('handles special characters', () => { const node = new ConcatNode('c1', ['Line1\n', 'Line2\t', 'Line3']);
      expect(node.run()).toBe('Line1\nLine2\tLine3') });
    it('handles unicode characters', () => { const node = new ConcatNode('c1', ['Hello', ' ', '🌍', ' ', '世界']);
      expect(node.run()).toBe('Hello 🌍 世界') });
    it('maintains node id correctly', () => { const node = new ConcatNode('concat-id', []);
      expect(node.id).toBe('concat-id') });
  });
  describe('OutputNode', () => { it('returns input unchanged', () => {
      const node = new OutputNode('o1', 'Test Output');
      expect(node.run()).toBe('Test Output') });
    it('handles empty string', () => { const node = new OutputNode('o1', '');
      expect(node.run()).toBe('') });
    it('handles multi-line output', () => { const multiline = 'Line 1\nLine 2\nLine 3';
      const node = new OutputNode('o1', multiline);
      expect(node.run()).toBe(multiline) });
    it('handles special characters', () => { const special = 'Special: \t\n\r"\'\\';
  const node = new OutputNode('o1', special);
  expect(node.run()).toBe(special) });
    it('maintains node id correctly', () => { const node = new OutputNode('output-id', 'test');
      expect(node.id).toBe('output-id') });
  });
  describe('IncludeNode', () => {
    it('looks up value correctly', () => {
      const lookup = { greeting: 'Hello', name: 'World' };
      const node = new IncludeNode('inc1', 'greeting', lookup);
      const ctx = createContext();
      expect(node.run(ctx)).toBe('Hello');
    });
    it('returns empty string for missing key', () => {
      const lookup = { greeting: 'Hello' };
      const node = new IncludeNode('inc1', 'missing', lookup);
      const ctx = createContext();
      expect(node.run(ctx)).toBe('');
    });
    it('returns defaultText variable for missing key when available', () => {
      const lookup = { greeting: 'Hello' };
      const node = new IncludeNode('inc1', 'missing', lookup);
      const ctx = createContext({ variables: { defaultText: 'Default' } });
      expect(node.run(ctx)).toBe('Default');
    });
    it('prevents prototype pollution attempts', () => {
      const lookup = { safe: 'value' };
      const node1 = new IncludeNode('inc1', '__proto__', lookup);
      const node2 = new IncludeNode('inc2', 'constructor', lookup);
      const node3 = new IncludeNode('inc3', 'prototype', lookup);
      const ctx = createContext();
      expect(node1.run(ctx)).toBe('');
      expect(node2.run(ctx)).toBe('');
      expect(node3.run(ctx)).toBe('');
    });
    it('handles null/undefined lookup safely', () => { const node1 = new IncludeNode('inc1', 'key', null as any);
      const node2 = new IncludeNode('inc2', 'key', undefined as any);
      const ctx = createContext();
      expect(node1.run(ctx)).toBe('');
      expect(node2.run(ctx)).toBe('') });
    it('handles non-object lookup safely', () => { const node1 = new IncludeNode('inc1', 'key', 'string' as any);
      const node2 = new IncludeNode('inc2', 'key', 123 as any);
      const node3 = new IncludeNode('inc3', 'key', true as any);
      const ctx = createContext();
      expect(node1.run(ctx)).toBe('');
      expect(node2.run(ctx)).toBe('');
      expect(node3.run(ctx)).toBe('') });
    it('handles non-string values in lookup', () => { const lookup = {
        number: 123,
        boolean: true }
        object: { nested: 'value' },
        array: [1, 2, 3],
        null: null,
        undefined: undefined;
  };
      const ctx = createContext({ variables: { defaultText: 'Default' } });
      expect(new IncludeNode('inc1', 'number', lookup as any).run(ctx)).toBe('Default');
      expect(new IncludeNode('inc2', 'boolean', lookup as any).run(ctx)).toBe('Default');
      expect(new IncludeNode('inc3', 'object', lookup as any).run(ctx)).toBe('Default');
      expect(new IncludeNode('inc4', 'array', lookup as any).run(ctx)).toBe('Default');
      expect(new IncludeNode('inc5', 'null', lookup as any).run(ctx)).toBe('Default');
      expect(new IncludeNode('inc6', 'undefined', lookup as any).run(ctx)).toBe('Default');
    });
    it('only returns string values from lookup', () => { const lookup = {
  valid: 'string value',
  invalid: 123 }
};
      const node1 = new IncludeNode('inc1', 'valid', lookup as any);
      const node2 = new IncludeNode('inc2', 'invalid', lookup as any);
      const ctx = createContext();
      expect(node1.run(ctx)).toBe('string value');
      expect(node2.run(ctx)).toBe('');
    });
    it('maintains node id correctly', () => {
      const node = new IncludeNode('include-id', 'key', {});
      expect(node.id).toBe('include-id');
    });
  });
  describe('SetVariableNode', () => { it('sets string variable correctly', () => {
      const node = new SetVariableNode('set1', 'myVar', 'value');
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.myVar).toBe('value') });
    it('sets number variable correctly', () => { const node = new SetVariableNode('set1', 'count', 42);
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.count).toBe(42) });
    it('sets boolean variable correctly', () => { const node = new SetVariableNode('set1', 'flag', true);
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.flag).toBe(true) });
    it('sets null value correctly', () => { const node = new SetVariableNode('set1', 'nullVar', null);
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.nullVar).toBe(null) });
    it('sets undefined value correctly', () => { const node = new SetVariableNode('set1', 'undefVar', undefined);
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.undefVar).toBe(undefined) });
    it('deep clones arrays to prevent reference pollution', () => {
      const originalArray = [1, 2, { nested: 'value' }];
      const node = new SetVariableNode('set1', 'arr', originalArray);
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.arr).toEqual(originalArray);
      expect(ctx.variables.arr).not.toBe(originalArray);
      // Modifying original should not affect stored value
      originalArray.push(4);
      expect(ctx.variables.arr).toEqual([1, 2, { nested: 'value' }]);
    });
    it('deep clones objects to prevent reference pollution', () => {
      const originalObject = { a: 1, b: { nested: 'value' } };
      const node = new SetVariableNode('set1', 'obj', originalObject);
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.obj).toEqual(originalObject);
      expect(ctx.variables.obj).not.toBe(originalObject);
      // Modifying original should not affect stored value
      originalObject.a = 2;
      expect(ctx.variables.obj).toEqual({ a: 1, b: { nested: 'value' } });
    });
    it('rejects function values', () => {
      const node = new SetVariableNode('set1', 'func', () => {});
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.func).toBeUndefined();
    });
    it('rejects symbol values', () => { const node = new SetVariableNode('set1', 'sym', Symbol('test'));
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.sym).toBeUndefined() });
    it('validates variable names', () => { const ctx = createContext();
      // Invalid names should be silently ignored
      new SetVariableNode('set1', '', 'value').run(ctx);
      expect(ctx.variables['']).toBeUndefined();
      new SetVariableNode('set2', '__proto__', 'value').run(ctx);
      expect(ctx.variables.__proto__).toBeUndefined();
      new SetVariableNode('set3', 'constructor', 'value').run(ctx);
      expect(ctx.variables.constructor).toBeUndefined();
      new SetVariableNode('set4', 'prototype', 'value').run(ctx);
      expect(ctx.variables.prototype).toBeUndefined();
      new SetVariableNode('set5', 'a'.repeat(65), 'value').run(ctx); // Over 64 char limit
      expect(ctx.variables['a'.repeat(65)]).toBeUndefined();
      new SetVariableNode('set6', 'invalid-chars!', 'value').run(ctx);
      expect(ctx.variables['invalid-chars!']).toBeUndefined();
      new SetVariableNode('set7', 'with spaces', 'value').run(ctx);
      expect(ctx.variables['with spaces']).toBeUndefined() });
    it('accepts valid variable names', () => { const ctx = createContext();
      new SetVariableNode('set1', 'validName', 'value1').run(ctx);
      expect(ctx.variables.validName).toBe('value1');
      new SetVariableNode('set2', 'name_with_underscore', 'value2').run(ctx);
      expect(ctx.variables.name_with_underscore).toBe('value2');
      new SetVariableNode('set3', 'name-with-dash', 'value3').run(ctx);
      expect(ctx.variables['name-with-dash']).toBe('value3');
      new SetVariableNode('set4', 'name123', 'value4').run(ctx);
      expect(ctx.variables.name123).toBe('value4');
      new SetVariableNode('set5', 'a'.repeat(64), 'value5').run(ctx); // Exactly 64 chars
      expect(ctx.variables['a'.repeat(64)]).toBe('value5') });
    it('maintains node id correctly', () => { const node = new SetVariableNode('setvar-id', 'key', 'value');
      expect(node.id).toBe('setvar-id') });
    it('returns void', () => { const node = new SetVariableNode('set1', 'var', 'value');
      const ctx = createContext();
      expect(node.run(ctx)).toBeUndefined() });
  });
  describe('GetVariableNode', () => {
    it('gets existing variable correctly', () => {
      const ctx = createContext({ variables: { myVar: 'value' } });
      const node = new GetVariableNode('get1', 'myVar');
      expect(node.run(ctx)).toBe('value');
    });
    it('returns undefined for non-existent variable', () => { const ctx = createContext();
      const node = new GetVariableNode('get1', 'missing');
      expect(node.run(ctx)).toBeUndefined() });
    it('validates variable names', () => { const ctx = createContext({)
  variables: {,
  valid: 'value',
  '__proto__': 'dangerous',
  'constructor': 'dangerous',
  'prototype': 'dangerous' }
});
      expect(new GetVariableNode('get1', 'valid').run(ctx)).toBe('value');
      expect(new GetVariableNode('get2', '__proto__').run(ctx)).toBeUndefined();
      expect(new GetVariableNode('get3', 'constructor').run(ctx)).toBeUndefined();
      expect(new GetVariableNode('get4', 'prototype').run(ctx)).toBeUndefined();
      expect(new GetVariableNode('get5', 'invalid-chars!').run(ctx)).toBeUndefined();
      expect(new GetVariableNode('get6', '').run(ctx)).toBeUndefined();
      expect(new GetVariableNode('get7', 'a'.repeat(65)).run(ctx)).toBeUndefined();
    });
    it('only returns own properties', () => { const ctx = createContext();
      const node = new GetVariableNode('get1', 'toString');
      expect(node.run(ctx)).toBeUndefined() });
    it('handles all variable types', () => { const ctx = createContext({)
  variables: {,
  str: 'string',
          num: 123,
          bool: true,
          null: null,
          undef: undefined,
          arr: [1, 2, 3] }
          obj: { nested: 'value' }
      });
      expect(new GetVariableNode('get1', 'str').run(ctx)).toBe('string');
      expect(new GetVariableNode('get2', 'num').run(ctx)).toBe(123);
      expect(new GetVariableNode('get3', 'bool').run(ctx)).toBe(true);
      expect(new GetVariableNode('get4', 'null').run(ctx)).toBe(null);
      expect(new GetVariableNode('get5', 'undef').run(ctx)).toBe(undefined);
      expect(new GetVariableNode('get6', 'arr').run(ctx)).toEqual([1, 2, 3]);
      expect(new GetVariableNode('get7', 'obj').run(ctx)).toEqual({ nested: 'value' });
    });
    it('maintains node id correctly', () => { const node = new GetVariableNode('getvar-id', 'key');
      expect(node.id).toBe('getvar-id') });
  });
  describe('RuntimeNode base class', () => { class TestNode extends RuntimeNode<string> {
  constructor(id: string, private value: string) {
  super(id);
  run(ctx: ExecutionContext): string { }
  return this.value;
  it('stores node id correctly', () => { const node = new TestNode('test-id', 'value');
  expect(node.id).toBe('test-id') });
    it('implements abstract run method', () => { const node = new TestNode('test-id', 'test-value');
      const ctx = createContext();
      expect(node.run(ctx)).toBe('test-value') });
    it('can be extended with async run method', async () => { class AsyncTestNode extends RuntimeNode<string> {
  async run(ctx: ExecutionContext): Promise<string> { }
  return Promise.resolve('async-value');
  const node = new AsyncTestNode('async-id');
  const ctx = createContext();
  await expect(node.run(ctx)).resolves.toBe('async-value');
});
  });
  describe('Edge cases and error handling', () => {
    it('handles very large numbers of choices', () => {
      const choices = Array.from({ length: 1000 }, (_, i) => ({)
  value: `Choice${i}`}

  weight: 1;
  }));
      const node = new WeightedChoiceNode('w1', choices);
      const ctx = createContext();
      const result = node.run(ctx);
      expect(result).toMatch(/^Choice\d+$/);
    });
    it('handles very long strings', () => { const longString = 'a'.repeat(10000);
      const node = new OutputNode('o1', longString);
      expect(node.run()).toBe(longString) });
    it('handles deeply nested objects in SetVariable', () => { const deepObject = {
  level1: {
  level2: {
  level3: {
  level4: {
  value: 'deep' }
};
      const node = new SetVariableNode('set1', 'deep', deepObject);
      const ctx = createContext();
      node.run(ctx);
      expect(ctx.variables.deep).toEqual(deepObject);
      expect(ctx.variables.deep).not.toBe(deepObject);
    });
    it('handles circular references in objects gracefully', () => {
      const circular: any = { a: 1 };
      circular.self = circular;
      const node = new SetVariableNode('set1', 'circular', circular);
      const ctx = createContext();
      // JSON.stringify will throw on circular references
      expect(() => node.run(ctx)).toThrow();
    });
    it('handles various seed types', () => {
      const choices = [{ value: 'A', weight: 1 }, { value: 'B', weight: 1 }];
      const node = new WeightedChoiceNode('w1', choices);
      // String seed
      const ctx1 = createContext({ seed: 'string-seed' });
      expect(() => node.run(ctx1)).not.toThrow();
      // Number seed
      const ctx2 = createContext({ seed: 12345 });
      expect(() => node.run(ctx2)).not.toThrow();
      // Same number and string representation should give same result
      const ctx3 = createContext({ seed: 123 });
      const ctx4 = createContext({ seed: '123' });
      expect(node.run(ctx3)).toBe(node.run(ctx4));
    });
  });
  describe('Type safety and contracts', () => {
    it('WeightedChoiceNode always returns string', () => {
      const node = new WeightedChoiceNode('w1', [{ value: 'test', weight: 1 }]);
      const result: string = node.run(createContext());
      expect(typeof result).toBe('string');
    });
    it('ConcatNode always returns string', () => { const node = new ConcatNode('c1', ['a', 'b']);
  const result: string = node.run();
  expect(typeof result).toBe('string') });
    it('OutputNode always returns string', () => { const node = new OutputNode('o1', 'test');
  const result: string = node.run();
  expect(typeof result).toBe('string') });
    it('IncludeNode always returns string', () => {
      const node = new IncludeNode('i1', 'key', { key: 'value' });
      const result: string = node.run(createContext());
      expect(typeof result).toBe('string');
    });
    it('SetVariableNode always returns void', () => { const node = new SetVariableNode('s1', 'key', 'value');
  const result: void = node.run(createContext());
  expect(result).toBeUndefined() });
    it('GetVariableNode can return any type', () => { const ctx = createContext({)
  variables: {
  str: 'string'
          num: 123
          bool: true }
          obj: { a: 1 }
          arr: [1, 2, 3]
      });
      expect(new GetVariableNode('g1', 'str').run(ctx)).toBe('string');
      expect(new GetVariableNode('g2', 'num').run(ctx)).toBe(123);
      expect(new GetVariableNode('g3', 'bool').run(ctx)).toBe(true);
      expect(new GetVariableNode('g4', 'obj').run(ctx)).toEqual({ a: 1 });
      expect(new GetVariableNode('g5', 'arr').run(ctx)).toEqual([1, 2, 3]);
    });
  });
});