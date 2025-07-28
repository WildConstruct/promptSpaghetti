// packages/core/__tests__/expression-evaluator.test.ts
// Direct tests for the safe expression evaluator
import { SafeExpressionEvaluator } from '../runtime/expression-evaluator';
describe('SafeExpressionEvaluator', () => {
  describe('Basic Expressions', () => {
    it('should evaluate arithmetic expressions', () => {
      expect(SafeExpressionEvaluator.evaluate('2 + 3', {})).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('10 - 4', {})).toBe(6);
      expect(SafeExpressionEvaluator.evaluate('3 * 4', {})).toBe(12);
      expect(SafeExpressionEvaluator.evaluate('15 / 3', {})).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('17 % 5', {})).toBe(2);
    });
    it('should evaluate comparison expressions', () => {
      expect(SafeExpressionEvaluator.evaluate('5 > 3', {})).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('5 < 3', {})).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('5 >= 5', {})).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('5 <= 4', {})).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('5 === 5', {})).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('5 !== 4', {})).toBe(true);
    });
    it('should evaluate logical expressions', () => {
      expect(SafeExpressionEvaluator.evaluate('true && true', {})).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('true && false', {})).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('true || false', {})).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('false || false', {})).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('!true', {})).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('!false', {})).toBe(true);
    });
    it('should evaluate ternary expressions', () => {
      expect(SafeExpressionEvaluator.evaluate('true ? 1 : 2', {})).toBe(1);
      expect(SafeExpressionEvaluator.evaluate('false ? 1 : 2', {})).toBe(2);
      expect(SafeExpressionEvaluator.evaluate('5 > 3 ? "yes" : "no"', {})).toBe('yes');
    });
  });
  describe('Variable Access', () => {
    it('should access variables from context', () => {
      const context = { x: 5, y: 3, name: 'test' };
      expect(SafeExpressionEvaluator.evaluate('x', context)).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('x + y', context)).toBe(8);
      expect(SafeExpressionEvaluator.evaluate('name', context)).toBe('test');
    });
    it('should access nested properties', () => {
      const context = { 
        user: { name: 'John', age: 30 },
        items: ['a', 'b', 'c']
      };
      expect(SafeExpressionEvaluator.evaluate('user.name', context)).toBe('John');
      expect(SafeExpressionEvaluator.evaluate('user.age', context)).toBe(30);
      expect(SafeExpressionEvaluator.evaluate('items[0]', context)).toBe('a');
      expect(SafeExpressionEvaluator.evaluate('items[1]', context)).toBe('b');
    });
    it('should throw on undefined variables', () => {
      expect(() => SafeExpressionEvaluator.evaluate('undefinedVar', {}))
        .toThrow('Undefined variable: undefinedVar');
    });
  });
  describe('Function Calls', () => {
    it('should allow safe function calls from context', () => {
      const context = {
        double: (x: number) => x * 2,
        add: (a: number, b: number) => a + b,
        len: (arr: unknown[]) => arr.length
      };
      expect(SafeExpressionEvaluator.evaluate('double(5)', context)).toBe(10);
      expect(SafeExpressionEvaluator.evaluate('add(3, 4)', context)).toBe(7);
      // Array literals not supported - would need to pass array as variable
      const arr = [1, 2, 3];
      expect(SafeExpressionEvaluator.evaluate('len(arr)', { ...context, arr })).toBe(3);
    });
    it('should reject function calls not in context', () => {
      // Functions not explicitly passed in context should be rejected
      expect(() => SafeExpressionEvaluator.evaluate('Math.random()', {}))
        .toThrow('Undefined variable: Math');
    });
  });
  describe('Security Tests', () => {
    it('should reject access to dangerous properties', () => {
      const context = { obj: {} };
      expect(() => SafeExpressionEvaluator.evaluate('obj.constructor', context))
        .toThrow('Access to property \'constructor\' is not allowed');
      expect(() => SafeExpressionEvaluator.evaluate('obj.prototype', context))
        .toThrow('Access to property \'prototype\' is not allowed');
      expect(() => SafeExpressionEvaluator.evaluate('obj.__proto__', context))
        .toThrow('Access to property \'__proto__\' is not allowed');
      expect(() => SafeExpressionEvaluator.evaluate('obj["constructor"]', context))
        .toThrow('Access to property \'constructor\' is not allowed');
    });
    it('should handle null/undefined safely', () => {
      const context = { nullVal: null, undefinedVal: undefined };
      expect(() => SafeExpressionEvaluator.evaluate('nullVal.property', context))
        .toThrow('Cannot access property of null or undefined');
      expect(() => SafeExpressionEvaluator.evaluate('undefinedVal.property', context))
        .toThrow('Cannot access property of null or undefined');
    });
  });
  describe('Complex Expressions', () => {
    it('should handle complex nested expressions', () => {
      const context = {
        users: [,
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 },
          { name: 'Charlie', age: 35 }
        ],
        minAge: 28,
      };
      // Complex expression with nested operations
      const expr = 'users[1].age > minAge && users[1].name === "Bob"';
      expect(SafeExpressionEvaluator.evaluate(expr, context)).toBe(true);
    });
    it('should handle string operations', () => {
      const context = { str: 'hello world' };
      // String concatenation
      expect(SafeExpressionEvaluator.evaluate('"Hello " + "World"', {})).toBe('Hello World');
      // String comparison
      expect(SafeExpressionEvaluator.evaluate('str === "hello world"', context)).toBe(true);
    });
  });
  describe('Error Handling', () => {
    it('should provide meaningful error messages', () => {
      expect(() => SafeExpressionEvaluator.evaluate('x +', {}))
        .toThrow(/Unexpected token|Expected/);
      expect(() => SafeExpressionEvaluator.evaluate('(x + 5', { x: 1 }))
        .toThrow(/Expected RPAREN/);
      expect(() => SafeExpressionEvaluator.evaluate('x..y', { x: {}, y: 1 }))
        .toThrow(/Unexpected token/);
    });
  });
});