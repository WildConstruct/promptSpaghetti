// packages/core/runtime/__tests__/expression-evaluator.test.ts
// Tests for the secure AST-based expression evaluator
import { SafeExpressionEvaluator } from '../expression-evaluator';
import { createConditionalNodeFilter, NodeSafetyLevel } from '../ast-node-whitelist';
describe('SafeExpressionEvaluator', () => {
  const createSafeContext = () => ({)
    x: 10,
    y: 5,
    name: 'test',
    active: true,
    user: {,
      id: 123,
      status: 'active',
    },
    Math: {,
      min: Math.min,
      max: Math.max,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      abs: Math.abs,
    },
    startsWith: (str: string, prefix: string) => str.startsWith(prefix),
    endsWith: (str: string, suffix: string) => str.endsWith(suffix),
    includes: (str: string, substring: string) => str.includes(substring),
    length: (value: any) => value.length,
    getType: (value: any) => typeof value
  });
  describe('Basic Expression Evaluation', () => {
    it('should evaluate numeric literals', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('42', context)).toBe(42);
      expect(SafeExpressionEvaluator.evaluate('3.14', context)).toBe(3.14);
      expect(SafeExpressionEvaluator.evaluate('-5', context)).toBe(-5);
    });
    it('should evaluate string literals', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('\"hello\"', context)).toBe('hello');
      expect(SafeExpressionEvaluator.evaluate('\'world\'', context)).toBe('world');
    });
    it('should evaluate boolean literals', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('true', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('false', context)).toBe(false);
    });
    it('should evaluate identifiers from context', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('x', context)).toBe(10);
      expect(SafeExpressionEvaluator.evaluate('y', context)).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('name', context)).toBe('test');
      expect(SafeExpressionEvaluator.evaluate('active', context)).toBe(true);
    });
  });
  describe('Arithmetic Operations', () => {
    it('should evaluate binary arithmetic expressions', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('x + y', context)).toBe(15);
      expect(SafeExpressionEvaluator.evaluate('x - y', context)).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('x * y', context)).toBe(50);
      expect(SafeExpressionEvaluator.evaluate('x / y', context)).toBe(2);
      expect(SafeExpressionEvaluator.evaluate('x % 3', context)).toBe(1);
    });
    it('should respect operator precedence', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('x + y * 2', context)).toBe(20);
      expect(SafeExpressionEvaluator.evaluate('(x + y) * 2', context)).toBe(30);
    });
    it('should evaluate unary expressions', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('-x', context)).toBe(-10);
      expect(SafeExpressionEvaluator.evaluate('+x', context)).toBe(10);
      expect(SafeExpressionEvaluator.evaluate('!active', context)).toBe(false);
    });
  });
  describe('Comparison Operations', () => {
    it('should evaluate comparison expressions', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('x > y', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('x < y', context)).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('x >= 10', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('y <= 5', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('x == 10', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('x === 10', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('x != y', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('x !== y', context)).toBe(true);
    });
  });
  describe('Logical Operations', () => {
    it('should evaluate logical expressions', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('x > 5 && y < 10', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('x < 5 || y > 10', context)).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('x > 5 || y > 10', context)).toBe(true);
    });
    it('should short-circuit logical operators', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('false && x', context)).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('true || y', context)).toBe(true);
    });
  });
  describe('Conditional (Ternary) Operations', () => {
    it('should evaluate ternary expressions', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('x > y ? \"greater\" : \"not greater\"', context)).toBe('greater');
      expect(SafeExpressionEvaluator.evaluate('x < y ? x : y', context)).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('active ? 1 : 0', context)).toBe(1);
    });
  });
  describe('Member Access', () => {
    it('should evaluate dot notation member access', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('user.id', context)).toBe(123);
      expect(SafeExpressionEvaluator.evaluate('user.status', context)).toBe('active');
    });
    it('should evaluate computed member access', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('user[\"id\"]', context)).toBe(123);
      expect(SafeExpressionEvaluator.evaluate('user[\"status\"]', context)).toBe('active');
    });
  });
  describe('Function Calls', () => {
    it('should evaluate safe function calls', () => {
      const context = createSafeContext();
      expect(SafeExpressionEvaluator.evaluate('Math.min(x, y)', context)).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('Math.max(x, y)', context)).toBe(10);
      expect(SafeExpressionEvaluator.evaluate('Math.abs(-5)', context)).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('startsWith(name, \"te\")', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('includes(name, \"es\")', context)).toBe(true);
    });
  });
  describe('Security Tests', () => {
    it('should block dangerous identifiers', () => {
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('eval', context))
        .toThrow(/Dangerous identifier 'eval' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('Function', context))
        .toThrow(/Dangerous identifier 'Function' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('constructor', context))
        .toThrow(/Dangerous identifier 'constructor' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('__proto__', context))
        .toThrow(/Dangerous identifier '__proto__' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('window', context))
        .toThrow(/Dangerous identifier 'window' is not allowed/);
    });
    it('should block dangerous property access', () => {
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('user.constructor', context))
        .toThrow(/Access to dangerous property 'constructor' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('user.__proto__', context))
        .toThrow(/Access to dangerous property '__proto__' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('user.prototype', context))
        .toThrow(/Access to dangerous property 'prototype' is not allowed/);
    });
    it('should block dangerous function calls', () => {
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('eval(\"x + y\")', context))
        .toThrow(/Call to dangerous function 'eval' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('Function(\"return x + y\")', context))
        .toThrow(/Call to dangerous function 'Function' is not allowed/);
      expect(() => SafeExpressionEvaluator.evaluate('setTimeout(\"alert(1)\", 100)', context))
        .toThrow(/Call to dangerous function 'setTimeout' is not allowed/);
    });
    it('should block dangerous string literals', () => {
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('\"eval(alert)\"', context))
        .toThrow(/String literal contains dangerous pattern/);
      expect(() => SafeExpressionEvaluator.evaluate('\"Function(constructor)\"', context))
        .toThrow(/String literal contains dangerous pattern/);
      expect(() => SafeExpressionEvaluator.evaluate('\"<script>alert(1)</script>\"', context))
        .toThrow(/String literal contains dangerous pattern/);
    });
    it('should block dangerous node types', () => {
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('function() { return 1; }', context))
        .toThrow(/Expression syntax error/);
      expect(() => SafeExpressionEvaluator.evaluate('() => 1', context))
        .toThrow(/Expression syntax error/);
      expect(() => SafeExpressionEvaluator.evaluate('new Date()', context))
        .toThrow(/Unsafe AST node detected: NewExpression/);
    });
    it('should handle syntax errors gracefully', () => {
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('x +', context))
        .toThrow(/Expression syntax error/);
      expect(() => SafeExpressionEvaluator.evaluate('x y', context))
        .toThrow(/Expression syntax error/);
      expect(() => SafeExpressionEvaluator.evaluate('(x + y', context))
        .toThrow(/Expression syntax error/);
    });
    it('should prevent property access on null/undefined', () => {
      const context = { nullValue: null, undefinedValue: undefined };
      expect(() => SafeExpressionEvaluator.evaluate('nullValue.property', context))
        .toThrow(/Cannot access property of null or undefined/);
      expect(() => SafeExpressionEvaluator.evaluate('undefinedValue.property', context))
        .toThrow(/Cannot access property of null or undefined/);
    });
    it('should prevent calling non-functions', () => {
      const context = { notAFunction: 'string' };
      expect(() => SafeExpressionEvaluator.evaluate('notAFunction()', context))
        .toThrow(/Attempted to call a non-function/);
    });
    it('should only allow whitelisted functions', () => {
      const context = { 
        ...createSafeContext(),
        unauthorizedFunction: () => 'should not be callable'
      };
      // Functions not explicitly in the context should not be callable
      expect(() => SafeExpressionEvaluator.evaluate('unauthorizedFunction()', context))
        .toThrow(/Function call not allowed/);
    });
  });
  describe('Complex Expressions', () => {
    it('should evaluate complex nested expressions', () => {
      const context = createSafeContext();
      const expression = 'x > 5 && (user.status === \"active\" ? Math.max(x, y) : 0) > 8';
      expect(SafeExpressionEvaluator.evaluate(expression, context)).toBe(true);
    });
    it('should handle multiple levels of member access', () => {
      const context = {
        data: {,
          user: {,
            profile: {,
              settings: {,
                theme: 'dark',
              }
            }
          }
        }
      };
      expect(SafeExpressionEvaluator.evaluate('data.user.profile.settings.theme', context)).toBe('dark');
    });
  });
  describe('Error Cases', () => {
    it('should throw error for undefined variables', () => {
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('undefinedVariable', context))
        .toThrow(/Undefined variable: undefinedVariable/);
    });
    it('should throw error for unknown operators', () => {
      // This would be caught by the parser, but let's test anyway
      const context = createSafeContext();
      expect(() => SafeExpressionEvaluator.evaluate('x ** y', context))
        .toThrow(/Expression syntax error/);
    });
  });
});
describe('ASTNodeWhitelistFilter', () => {
  it('should create conditional node filter with correct configuration', () => {
    const filter = createConditionalNodeFilter();
    expect(filter).toBeDefined();
  });
  it('should block dangerous nodes', () => {
    const filter = createConditionalNodeFilter();
    // This would normally require parsing, but we can test the concept
    const dangerousAST = {
      type: 'FunctionExpression',
      loc: { start: { line: 1, column: 0 } }
    } as any;
    const result = filter.filterAST(dangerousAST);
    expect(result.allowed).toBe(false);
    expect(result.blockedNodes).toHaveLength(1);
    expect(result.blockedNodes[0].nodeType).toBe('FunctionExpression');
    expect(result.blockedNodes[0].safetyLevel).toBe(NodeSafetyLevel.DANGEROUS);
  });
});