/**
 * Comprehensive Security Test Suite
 * 
 * Tests all security features across the expression evaluation system
 * including AST filtering, Math restrictions, prototype pollution prevention,
 * and security audit logging.
 * 
 * Addresses P0 security requirements for Epic 18 - Conditional Node Security (DEBT-002)
 */
import { SafeExpressionEvaluator } from '../runtime/expression-evaluator';
import { createSafeMathContext, 
  createAuditedSafeMathContext,
  SAFE_MATH_FUNCTIONS,
  BLOCKED_MATH_FUNCTIONS,
  validateMathFunctionCall,
  MathFunctionAuditor,
  isInSafeRange }
  safeNumberCoercion
 from '../runtime/safe-math-context';
import { ASTNodeWhitelistFilter,
  createConditionalNodeFilter,
  createGeneralExpressionFilter }
  NodeSafetyLevel
 from '../runtime/ast-node-whitelist';
import { securityAudit,
  SecuritySeverity }
  SecurityEventCategory
 from '../runtime/security-audit-logger';
import { ConditionalNode, ConditionalBuilder } from '../runtime/nodes/Conditional';
import { AdvancedExecutionContext } from '../runtime/advanced';
import * as acorn from 'acorn';
describe('Comprehensive Security Test Suite', () => { beforeEach(() => {
    // Clear all audit logs
    securityAudit.clearEvents();
    MathFunctionAuditor.clearAuditLog() });
  afterEach(() => { // Clean up
    (securityAudit as any).stopPeriodicCleanup() });
  describe('Expression Sanitization', () => { const dangerousPatterns = [
      'eval("malicious code")',
      'Function("return this")()',
      'constructor.constructor("alert(1)")()',
      '__proto__.polluted = true',
      'Object.prototype.isAdmin = true',
      'window.location = "evil.com"',
      'document.cookie',
      'require("fs").readFileSync("/etc/passwd")',
      'import("evil-module")',
      'process.env.SECRET_KEY',
      'global.process.exit()' }
      'this.constructor.constructor("return process")().exit()'
    ];
    test.each(dangerousPatterns)('should block dangerous pattern: %s', (pattern) => {
      const context = SafeExpressionEvaluator.createSafeContext({ x: 5 });
      expect(() => { SafeExpressionEvaluator.evaluate(pattern, context) }).toThrow();
      // Verify security event was logged
      const events = securityAudit.getEvents({ blocked: true });
      expect(events.length).toBeGreaterThan(0);
    });
    it('should detect obfuscated eval attempts', () => { const obfuscatedPatterns = [
        'e\\u0076al("code")',  // Unicode escape
        'window["e" + "val"]("code")',  // String concatenation
        'this["\\x65\\x76\\x61\\x6c"]("code")',  // Hex escape
        'globalThis["eval"]("code")',
        '(0, eval)("code")',  // Indirect eval
        'new Function("code")()',
        'setTimeout("code", 0)' }
        'setInterval("code", 1000)'
      ];
      const context = SafeExpressionEvaluator.createSafeContext({});
      for (const pattern of obfuscatedPatterns) { expect(() => {
          SafeExpressionEvaluator.evaluate(pattern, context) }).toThrow();
    });
    it('should handle complex nested dangerous patterns', () => { const complexPatterns = [
        '(function() { return eval })()("code")',
        'Array.prototype.map.call([eval], x => x)[0]("code")',
        '[].constructor.constructor("return eval")()("code")',
        'Object.getPrototypeOf(Object).constructor("code")()',
        '(() => { const e = eval; return e("code") })()'
      ];
      const context = SafeExpressionEvaluator.createSafeContext({});
      for (const pattern of complexPatterns) { expect(() => {
          SafeExpressionEvaluator.evaluate(pattern, context) }).toThrow();
    });
  });
  describe('AST Node Security', () => {
    it('should enforce AST node whitelist', () => {
      const filter = createConditionalNodeFilter();
      // Safe nodes
      const safeNodes = [
        { type: 'Literal', value: 42 },
        { type: 'Identifier', name: 'x' },
        { type: 'BinaryExpression', operator: '+' },
        { type: 'UnaryExpression', operator: '!' },
        { type: 'LogicalExpression', operator: '&&' },
        { type: 'ConditionalExpression' },
        { type: 'MemberExpression' }
      ];
      for (const node of safeNodes) {
        const result = filter.filterAST(node as any);
        expect(result.allowed).toBe(true);
        expect(result.blockedNodes).toHaveLength(0);
      // Dangerous nodes
      const dangerousNodes = [
        { type: 'FunctionExpression' },
        { type: 'ArrowFunctionExpression' },
        { type: 'FunctionDeclaration' },
        { type: 'VariableDeclaration' },
        { type: 'AssignmentExpression' },
        { type: 'NewExpression' },
        { type: 'ThisExpression' },
        { type: 'YieldExpression' },
        { type: 'AwaitExpression' },
        { type: 'ImportDeclaration' },
        { type: 'WithStatement' }
      ];
      for (const node of dangerousNodes) { const result = filter.filterAST(node as any);
        expect(result.allowed).toBe(false);
        expect(result.blockedNodes).toHaveLength(1);
        expect(result.blockedNodes[0].safetyLevel).toBe(NodeSafetyLevel.DANGEROUS) });
    it('should enforce AST depth limits', () => {
      const filter = createConditionalNodeFilter();
      // Create deeply nested AST
      let deepNode: any = { type: 'Literal', value: 1 };
      for (let i = 0; i < 25; i++) { deepNode = {
          type: 'BinaryExpression',
          operator: '+',
          left: deepNode }
          right: { type: 'Literal', value: 1 }
        };
      const result = filter.filterAST(deepNode);
      expect(result.allowed).toBe(false);
      expect(result.blockedNodes.some(n => n.reason.includes('depth'))).toBe(true);
    });
    it('should enforce AST node count limits', () => { const filter = createConditionalNodeFilter();
  // Create AST with many nodes
  const manyNodes: any = {,
  type: 'Program',
  body: [] }
};
      for (let i = 0; i < 150; i++) { manyNodes.body.push({)
  type: 'ExpressionStatement',
          expression: {,
  type: 'BinaryExpression',
            operator: '+' }
            left: { type: 'Literal', value: i },
            right: { type: 'Identifier', name: `var${i}` }
        });
      const result = filter.filterAST(manyNodes);
      expect(result.allowed).toBe(false);
      expect(result.blockedNodes.some(n => n.reason.includes('node count'))).toBe(true);
    });
    it('should detect dangerous identifiers', () => { const filter = createConditionalNodeFilter();
  const dangerousIdentifiers = [
  'eval', 'Function', 'constructor', 'prototype', '__proto__',
  'window', 'global', 'globalThis', 'document', 'process',
  'require', 'import', 'export', 'arguments', 'caller'
  ];
  for (const name of dangerousIdentifiers) {
  const node = {
  type: 'Identifier' }
  name
};
        const result = filter.filterAST(node as any);
        expect(result.allowed).toBe(false);
        expect(result.blockedNodes[0].reason).toContain(`Dangerous identifier '${name}'`);}
    });
    it('should detect dangerous property access', () => { const filter = createConditionalNodeFilter();
      const dangerousProperties = [
        'constructor', 'prototype', '__proto__', 
        '__defineGetter__', '__defineSetter__',
        'valueOf', 'toString'
      ];
      for (const prop of dangerousProperties) {
        const node = {
          type: 'MemberExpression' }
          object: { type: 'Identifier', name: 'obj' },
          property: { type: 'Identifier', name: prop },
          computed: false;
  };
        const result = filter.filterAST(node as any);
        expect(result.allowed).toBe(false);
        expect(result.blockedNodes[0].reason).toContain(`dangerous property '${prop}'`);}
    });
  });
  describe('Math Function Security', () => { it('should only allow safe Math functions', () => {
      const safeMath = createSafeMathContext();
      // Test allowed functions
      expect(safeMath.min(5, 3)).toBe(3);
      expect(safeMath.max(5, 3)).toBe(5);
      expect(safeMath.floor(3.7)).toBe(3);
      expect(safeMath.ceil(3.2)).toBe(4);
      expect(safeMath.round(3.5)).toBe(4);
      expect(safeMath.abs(-5)).toBe(5);
      expect(safeMath.sign(-5)).toBe(-1);
      expect(safeMath.trunc(3.9)).toBe(3);
      // Test constants
      expect(safeMath.PI).toBeCloseTo(Math.PI);
      expect(safeMath.E).toBeCloseTo(Math.E);
      // Test that blocked functions don't exist
      expect(safeMath.random).toBeUndefined();
      expect(safeMath.pow).toBeUndefined();
      expect(safeMath.sqrt).toBeUndefined();
      expect(safeMath.log).toBeUndefined() });
    it('should validate Math function inputs', () => { const safeMath = createSafeMathContext();
      // Invalid inputs
      expect(() => safeMath.min('not a number')).toThrow(TypeError);
      expect(() => safeMath.max(NaN)).toThrow('received NaN');
      expect(() => safeMath.floor(Infinity)).toThrow('received Infinity');
      expect(() => safeMath.ceil(Number.MAX_VALUE * 2)).toThrow('out of safe range');
      // Edge cases
      expect(() => safeMath.min()).toThrow('requires at least one argument');
      expect(() => safeMath.max()).toThrow('requires at least one argument') });
    it('should audit Math function access', () => { const auditedMath = createAuditedSafeMathContext('test');
  // Access allowed function
  auditedMath.min(1, 2);
  // Try to access blocked function
  expect(() => auditedMath.random).toThrow();
  // Check audit log
  const auditLog = MathFunctionAuditor.getAuditLog();
  expect(auditLog).toHaveLength(2);
  expect(auditLog[0]).toMatchObject({)
  functionName: 'min',
  allowed: true,
  reason: 'Safe function accessed' }
});
      expect(auditLog[1]).toMatchObject({ )
  functionName: 'random',
  allowed: false,
  reason: 'Blocked function access attempted' }
});
    });
    it('should prevent Math object modification', () => {
      const safeMath = createSafeMathContext();
      // Try to modify
      expect(() => {
        (safeMath as any).newFunction = () => 'evil'
  }).toThrow();
      // Try to delete
      expect(() => { delete (safeMath as any).min }).toThrow();
      // Verify object is sealed
      expect(Object.isSealed(safeMath)).toBe(true);
    });
    it('should validate all safe Math functions comprehensively', () => { expect(SAFE_MATH_FUNCTIONS).toHaveLength(8);
      expect(SAFE_MATH_FUNCTIONS).toContain('min');
      expect(SAFE_MATH_FUNCTIONS).toContain('max');
      expect(SAFE_MATH_FUNCTIONS).toContain('floor');
      expect(SAFE_MATH_FUNCTIONS).toContain('ceil');
      expect(SAFE_MATH_FUNCTIONS).toContain('round');
      expect(SAFE_MATH_FUNCTIONS).toContain('abs');
      expect(SAFE_MATH_FUNCTIONS).toContain('sign');
      expect(SAFE_MATH_FUNCTIONS).toContain('trunc');
      // Verify validation function
      for (const func of SAFE_MATH_FUNCTIONS) {
        expect(validateMathFunctionCall(func)).toBe(true);
      for (const func of BLOCKED_MATH_FUNCTIONS) {
        expect(validateMathFunctionCall(func)).toBe(false) });
  });
  describe('Prototype Pollution Prevention', () => {
    it('should block direct prototype pollution attempts', () => {
      const context = SafeExpressionEvaluator.createSafeContext({ obj: {} });
      const pollutionAttempts = [
        'obj.__proto__.polluted = true',
        'obj.constructor.prototype.polluted = true',
        'Object.prototype.isAdmin = true',
        'Object.getPrototypeOf(obj).hacked = true',
        'obj["__proto__"]["polluted"] = true',
        'obj["constructor"]["prototype"]["polluted"] = true'
      ];
      for (const attempt of pollutionAttempts) { expect(() => {
          SafeExpressionEvaluator.evaluate(attempt, context) }).toThrow();
        // Verify critical event was logged
        const events = securityAudit.getEvents({ )
          category: SecurityEventCategory.PROTOTYPE_POLLUTION_ATTEMPT  });
        expect(events.length).toBeGreaterThan(0);
        expect(events[events.length - 1].severity).toBe(SecuritySeverity.CRITICAL);
    });
    it('should prevent indirect prototype access', () => { const context = SafeExpressionEvaluator.createSafeContext({ )
  arr: [1, 2, 3],
  str: 'hello' }
});
      // These should all fail
      const indirectAttempts = [
        'arr.constructor.prototype',
        'str.constructor.prototype',
        'arr.__lookupGetter__("length")',
        'str.__lookupSetter__("value")',
        'arr.__defineGetter__("0", () => "evil")',
        'str.__defineSetter__("0", () => {})'
      ];
      for (const attempt of indirectAttempts) { expect(() => {
          SafeExpressionEvaluator.evaluate(attempt, context) }).toThrow();
    });
  });
  describe('Safe Context Utilities', () => { it('should provide safe utility functions', () => {
  const context = SafeExpressionEvaluator.createSafeContext({)
  str: 'hello world',
  arr: [1, 2, 3, 4, 5],
  empty: '',
  nullVal: null }
});
      // Test utility functions
      expect(SafeExpressionEvaluator.evaluate('getType(str)', context)).toBe('string');
      expect(SafeExpressionEvaluator.evaluate('getType(arr)', context)).toBe('object');
      expect(SafeExpressionEvaluator.evaluate('length(str)', context)).toBe(11);
      expect(SafeExpressionEvaluator.evaluate('length(arr)', context)).toBe(5);
      expect(SafeExpressionEvaluator.evaluate('isEmpty(empty)', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('isEmpty(str)', context)).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('startsWith(str, "hello")', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('endsWith(str, "world")', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('includes(str, "lo wo")', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('includes(arr, 3)', context)).toBe(true);
    });
    it('should handle edge cases in utility functions', () => { const context = SafeExpressionEvaluator.createSafeContext({)
  num: 42,
        bool: true }
        obj: { key: 'value' }
      });
      // Edge cases
      expect(SafeExpressionEvaluator.evaluate('length(null)', context)).toBe(0);
      expect(SafeExpressionEvaluator.evaluate('length(undefined)', context)).toBe(0);
      expect(SafeExpressionEvaluator.evaluate('isEmpty(null)', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('isEmpty(0)', context)).toBe(true);
      expect(SafeExpressionEvaluator.evaluate('includes(num, "4")', context)).toBe(false);
      expect(SafeExpressionEvaluator.evaluate('startsWith(42, "4")', context)).toBe(true);
    });
  });
  describe('Conditional Node Security', () => { it('should safely evaluate conditional expressions', () => {
      const ctx = new AdvancedExecutionContext('test-seed');
      ctx.variables = {
        userRole: 'admin',
        score: 85,
        items: ['apple', 'banana', 'cherry'] }
        config: { enabled: true, threshold: 80 }
      };
      const conditional = new ConditionalNode(;);
        'secure-conditional',
        [
          { condition: 'userRole === "admin" && config.enabled', output: 'Admin access granted' },
          { condition: 'score >= config.threshold', output: 'Threshold met' },
          { condition: 'includes(items, "banana")', output: 'Has banana' },
          { condition: 'Math.min(score, 100) === score', output: 'Valid score' }
        ],
        'No match'
      );
      const result = conditional.run(ctx);
      expect(result).toBe('Admin access granted');
      // Verify safe execution
      const events = securityAudit.getEvents({ blocked: true });
      expect(events).toHaveLength(0);
    });
    it('should block dangerous conditional expressions', () => {
      const ctx = new AdvancedExecutionContext('test-seed');
      ctx.variables = { value: 10 };
      const dangerousConditional = new ConditionalNode(;);
        'dangerous-conditional',
        [
          { condition: 'eval("value > 5")', output: 'Eval used' },
          { condition: 'value.constructor === Number', output: 'Constructor accessed' },
          { condition: 'Object.prototype.toString', output: 'Prototype accessed' }
        ],
        'Safe fallback'
      );
      // Should throw on first dangerous condition
      expect(() => dangerousConditional.run(ctx)).toThrow();
      // Verify security events
      const events = securityAudit.getEvents({ blocked: true });
      expect(events.length).toBeGreaterThan(0);
    });
    it('should handle non-strict mode gracefully', () => {
      const ctx = new AdvancedExecutionContext('test-seed');
      ctx.variables = { x: 5 };
      const nonStrictConditional = new ConditionalNode(;);
        'non-strict',
        [
          { condition: 'undefinedVariable > 0', output: 'Should not match' },
          { condition: 'x > 0', output: 'Valid condition' }
        ],
        'Default',
        { strictMode: false }
      );
      const result = nonStrictConditional.run(ctx);
      expect(result).toBe('Valid condition');
      // Check that warning was logged
      const warnings = securityAudit.getEvents({ severity: SecuritySeverity.WARNING });
      expect(warnings.length).toBeGreaterThan(0);
    });
    it('should use ConditionalBuilder safely', () => {
      const ctx = new AdvancedExecutionContext('test-seed');
      ctx.variables = { temperature: 25 };
      const tempChecker = new ConditionalBuilder();
        .if('temperature < 0', 'Freezing')
        .elseIf('temperature < 10', 'Cold')
        .elseIf('temperature < 20', 'Cool')
        .elseIf('temperature < 30', 'Warm')
        .else('Hot')
        .build('temp-checker');
      const result = tempChecker.run(ctx);
      expect(result).toBe('Warm');
    });
  });
  describe('Numeric Safety', () => { it('should enforce safe numeric ranges', () => {
      expect(isInSafeRange(42)).toBe(true);
      expect(isInSafeRange(0)).toBe(true);
      expect(isInSafeRange(-1000)).toBe(true);
      expect(isInSafeRange(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isInSafeRange(Number.MIN_SAFE_INTEGER)).toBe(true);
      expect(isInSafeRange(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
      expect(isInSafeRange(Number.MIN_SAFE_INTEGER - 1)).toBe(false);
      expect(isInSafeRange(Infinity)).toBe(false);
      expect(isInSafeRange(-Infinity)).toBe(false);
      expect(isInSafeRange(NaN)).toBe(false) });
    it('should safely coerce values to numbers', () => {
      expect(safeNumberCoercion(42)).toBe(42);
      expect(safeNumberCoercion('42')).toBe(42);
      expect(safeNumberCoercion('  42  ')).toBe(42);
      expect(safeNumberCoercion(true)).toBe(1);
      expect(safeNumberCoercion(false)).toBe(0);
      expect(() => safeNumberCoercion('')).toThrow('Cannot convert empty string');
      expect(() => safeNumberCoercion('not a number')).toThrow('Cannot convert');
      expect(() => safeNumberCoercion({})).toThrow('Cannot convert object');
      expect(() => safeNumberCoercion([])).toThrow('Cannot convert object');
      expect(() => safeNumberCoercion(null)).toThrow('Cannot convert');
      expect(() => safeNumberCoercion(undefined)).toThrow('Cannot convert');
      expect(() => safeNumberCoercion('Infinity')).toThrow('received Infinity');
    });
  });
  describe('Security Audit Integration', () => {
    it('should provide comprehensive security statistics', () => {
      // Generate variety of security events
      const ctx = new AdvancedExecutionContext('test-seed');
      ctx.variables = { x: 10, y: 5 };
      // Safe operations
      const safeNode = new ConditionalNode('safe', [);
        { condition: 'x > y', output: 'greater' },
        { condition: 'Math.min(x, y) === y', output: 'min is y' }
      ], 'equal');
      safeNode.run(ctx);
      // Dangerous operations (will throw)
      const dangerousNode = new ConditionalNode('danger', [);
        { condition: 'eval(x)', output: 'eval' },
        { condition: 'x.__proto__', output: 'proto' }
      ], 'safe');
      try { dangerousNode.run(ctx) } catch (e) { // Expected
      // Get statistics
      const stats = securityAudit.getStatistics();
      expect(stats.totalEvents).toBeGreaterThan(2);
      expect(stats.blockedOperations).toBeGreaterThan(0);
      expect(stats.eventsBySeverity[SecuritySeverity.INFO]).toBeGreaterThan(0);
      expect(stats.eventsByCategory[SecurityEventCategory.EXPRESSION_VALIDATION]).toBeGreaterThan(0);
      // Check top blocked patterns
      if (stats.topBlockedPatterns.length > 0) {
        expect(stats.topBlockedPatterns[0]).toHaveProperty('pattern');
        expect(stats.topBlockedPatterns[0]).toHaveProperty('count') });
    it('should export security events for analysis', () => {
      // Generate some events
      securityAudit.logExpressionBlocked('eval()', 'Dangerous function');
      securityAudit.logPrototypePollutionAttempt('__proto__');
      securityAudit.logMathFunctionBlocked('random', 'Non-deterministic');
      // Test JSON export
      const jsonExport = securityAudit.exportEvents('json');
      const events = JSON.parse(jsonExport);
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThanOrEqual(3);
      // Test CSV export
      const csvExport = securityAudit.exportEvents('csv');
      const lines = csvExport.split('\n');
      expect(lines[0]).toContain('id');
      expect(lines[0]).toContain('severity');
      expect(lines[0]).toContain('category');
      expect(lines.length).toBe(events.length + 1); // +1 for header
    });
  });
  describe('OWASP Top 10 Coverage', () => { it('should prevent injection attacks (A03:2021)', () => {,
  const context = SafeExpressionEvaluator.createSafeContext({ )
  userInput: '; DROP TABLE users; --' }
});
      // SQL injection attempt in expression
      expect(() => { SafeExpressionEvaluator.evaluate('eval(userInput)', context) }).toThrow();
      // Command injection
      expect(() => { SafeExpressionEvaluator.evaluate('require("child_process").exec(userInput)', context) }).toThrow();
    });
    it('should prevent insecure design (A04:2021)', () => {
      // Ensure expressions cannot access sensitive APIs
      const context = SafeExpressionEvaluator.createSafeContext({});
      const insecureAPIs = [
        'process.env',
        'require("fs")',
        'import("http")',
        'globalThis.fetch',
        'XMLHttpRequest'
      ];
      for (const api of insecureAPIs) { expect(() => {
          SafeExpressionEvaluator.evaluate(api, context) }).toThrow();
    });
    it('should prevent security misconfiguration (A05:2021)', () => { // Verify secure defaults
      const filter = createConditionalNodeFilter();
      // Check that dangerous features are blocked by default
      const result = filter.filterAST({ )
        type: 'WithStatement' }
        object: { type: 'Identifier', name: 'obj' },
        body: { type: 'BlockStatement', body: [] }
 as any);
      expect(result.allowed).toBe(false);
      expect(result.blockedNodes[0].safetyLevel).toBe(NodeSafetyLevel.DANGEROUS);
    });
  });
  describe('Performance and Resource Limits', () => { it('should handle complex expressions within resource limits', () => {
  const context = SafeExpressionEvaluator.createSafeContext({)
  arr: Array(100).fill(0).map((_, i) => i) }
});
      // Complex but safe expression
      const complexExpr = 'Math.max(...arr.filter(x => x % 2 === 0).map(x => x * 2))';
      const start = Date.now();
      const result = SafeExpressionEvaluator.evaluate(complexExpr, context);
      const duration = Date.now() - start;
      expect(result).toBe(196); // max of even numbers * 2
      expect(duration).toBeLessThan(100); // Should be fast
    });
    it('should enforce expression complexity limits', () => {
      // Very deeply nested expression
      let deepExpr = 'x';
      for (let i = 0; i < 50; i++) {
        deepExpr = `(${deepExpr} + 1)`;}
      const context = SafeExpressionEvaluator.createSafeContext({ x: 1 });
      // Should eventually fail due to depth
      expect(() => { SafeExpressionEvaluator.evaluate(deepExpr, context) }).toThrow();
    });
  });
});