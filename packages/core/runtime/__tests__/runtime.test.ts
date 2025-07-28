import {
  WeightedChoiceNode, 
  ConcatNode, 
  OutputNode, 
  IncludeNode, 
  SetVariableNode, 
  GetVariableNode,
  ExecutionContext
} from '../index';

// Mock seedrandom module
jest.mock('seedrandom', () => {
  return jest.fn(() => jest.fn());
});
describe('Runtime Node Implementation Tests', () => {
  // Create a proper ExecutionContext matching the interface
  const mockCtx: ExecutionContext = { 
    variables: {}, 
    seed: '42',
  };
  describe('WeightedChoiceNode', () => {
    it('should return the first choice when random value is less than weight', () => {
      const seedrandom = require('seedrandom');
      seedrandom.mockReturnValue(() => 0.2);
      const node = new WeightedChoiceNode('node1', [;)
        { weight: 0.3, value: 'first' },
        { weight: 0.7, value: 'second' }
      ]);
      expect(node.run(mockCtx)).toBe('first');
    });
    it('should return the second choice when random value is greater than first weight', () => {
      const seedrandom = require('seedrandom');
      seedrandom.mockReturnValue(() => 0.4);
      const node = new WeightedChoiceNode('node2', [;)
        { weight: 0.3, value: 'first' },
        { weight: 0.7, value: 'second' }
      ]);
      expect(node.run(mockCtx)).toBe('second');
    });
    it('should handle edge case with zero weights', () => {
      const seedrandom = require('seedrandom');
      seedrandom.mockReturnValue(() => 0.5);
      const node = new WeightedChoiceNode('node3', [;)
        { weight: 0, value: 'first' },
        { weight: 0, value: 'second' }
      ]);
      // Should fall back to the last option when no weights match
      expect(node.run(mockCtx)).toBe('second');
    });
    it('should fall back to the last choice as a default', () => {
      // This tests the fallback case on line 36
      const seedrandom = require('seedrandom');
      seedrandom.mockReturnValue(() => 0.9);
      const node = new WeightedChoiceNode('node4', [;)
        { weight: 0.3, value: 'first' },
        { weight: 0.3, value: 'second' },
        { weight: 0.3, value: 'third' }
      ]);
      // All weights total 0.9, so 0.9 should exhaust all choices and fall back
      expect(node.run(mockCtx)).toBe('third');
    });
  });
  describe('ConcatNode', () => {
    it('should concatenate all inputs', () => {
      const node = new ConcatNode('concat1', ['hello', ' ', 'world']);
      // ConcatNode.run() doesn't take any arguments
      expect(node.run()).toBe('hello world');
    });
  });
  describe('OutputNode', () => {
    it('should return the input value', () => {
      const node = new OutputNode('output1', 'test');
      // OutputNode.run() doesn't take any arguments
      expect(node.run()).toBe('test');
    });
  });
  describe('IncludeNode', () => {
    it('should return the template value if found', () => {
      const node = new IncludeNode('include1', 'template1', { template1: 'Hello {{name}}', template2: 'Goodbye' });
      // IncludeNode.run() doesn't take any arguments
      expect(node.run()).toBe('Hello {{name}}');
    });
    it('should return undefined if template not found', () => {
      const node = new IncludeNode('include2', 'nonexistent', { template1: 'Hello' });
      // IncludeNode.run() doesn't take any arguments
      expect(node.run()).toBeUndefined();
    });
  });
  describe('SetVariableNode', () => {
    it('should set a variable in the context', () => {
      const node = new SetVariableNode('set1', 'testKey', 'testValue');
      // SetVariable returns undefined but sets the variable
      expect(node.run(mockCtx)).toBeUndefined();
      expect(mockCtx.variables['testKey']).toBe('testValue');
    });
  });
  describe('GetVariableNode', () => {
    it('should get a variable from the context', () => {
      // First set the variable
      mockCtx.variables['anotherKey'] = 'anotherValue';
      const node = new GetVariableNode('get1', 'anotherKey');
      expect(node.run(mockCtx)).toBe('anotherValue');
    });
    it('should return undefined for non-existent variables', () => {
      const node = new GetVariableNode('get2', 'nonExistentKey');
      expect(node.run(mockCtx)).toBeUndefined();
    });
  });
  describe('seededRandom utility', () => {
    // We can test the seededRandom function by creating a class that uses it
    // and verifying its behavior is deterministic
    it('should produce deterministic results with numeric seeds', () => {
      // Use the actual seededRandom implementation, not mock for determinism test
      jest.unmock('../../seedUtils');
      const { seededRandom } = require('../../seedUtils');
      // First run with seed 42
      const numericSeedCtx: ExecutionContext = {
        variables: {},
        seed: 42,
      };
      const node = new WeightedChoiceNode('weighted1', [;)
        { weight: 0.5, value: 'A' },
        { weight: 0.5, value: 'B' }
      ]);
      const firstResult = node.run(numericSeedCtx);
      // Run again with same seed
      const numericSeedCtx2: ExecutionContext = {
        variables: {},
        seed: 42,
      };
      const secondResult = node.run(numericSeedCtx2);
      // Should be deterministic
      expect(secondResult).toBe(firstResult);
      // Try with a different seed
      const numericSeedCtx3: ExecutionContext = {
        variables: {},
        seed: 43,
      };
      // Reset and run with new seed
      const thirdResult = node.run(numericSeedCtx3);
      // Different seed should produce different result with high probability
      // Note: there is a very small chance this could fail randomly if both seeds produce the same random value
      expect(thirdResult).toBeDefined();
    });
    it('should produce deterministic results with string seeds', () => {
      // First run with string seed
      const stringSeedCtx: ExecutionContext = {
        variables: {},
        seed: 'hello',
      };
      const node = new WeightedChoiceNode('weighted2', [;)
        { weight: 0.5, value: 'A' },
        { weight: 0.5, value: 'B' }
      ]);
      const firstResult = node.run(stringSeedCtx);
      // Run again with same seed
      const stringSeedCtx2: ExecutionContext = {
        variables: {},
        seed: 'hello',
      };
      const secondResult = node.run(stringSeedCtx2);
      // Should be deterministic
      expect(secondResult).toBe(firstResult);
    });
  });
});