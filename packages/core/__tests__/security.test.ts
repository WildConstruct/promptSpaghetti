/**
 * Security Tests for Epic 18.2 - Critical Security Fixes
 * Comprehensive testing of security vulnerabilities and fixes
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { SecurityValidation, SecurityTesting, SecureValidation } from '../validation/security';
import { SetVariableNodeSchema, ConditionalNodeSchema, IncludeNodeSchema, GraphSchema } from '../graphSchema';
import { SetVariableNode, GetVariableNode, IncludeNode, ExecutionContext } from '../runtime';

describe('Security Validation Framework', () => {
  describe('SecurityValidation.validateSafeString', () => {
    it('should block dangerous JavaScript patterns', () => {
      const dangerousInputs = [
        'eval("alert(1)")',
        'constructor.constructor("alert(1)")()',
        '__proto__.polluted = true',
        'prototype.polluted = true',
        'Function("alert(1)")()',
        'document.cookie',
        'window.location',
        'require("fs")',
        'process.exit()',
        'global.process'
      ];

      dangerousInputs.forEach(input => {
        expect(SecurityValidation.validateSafeString(input)).toBe(false);
      });
    });

    it('should allow safe strings', () => {
      const safeInputs = [
        'hello world',
        'user input text',
        'simple variable name',
        'text with numbers 123',
        'mixed-case Text',
        ''
      ];

      safeInputs.forEach(input => {
        expect(SecurityValidation.validateSafeString(input)).toBe(true);
      });
    });

    it('should reject non-string inputs', () => {
      expect(SecurityValidation.validateSafeString(123 as any)).toBe(false);
      expect(SecurityValidation.validateSafeString(null as any)).toBe(false);
      expect(SecurityValidation.validateSafeString(undefined as any)).toBe(false);
      expect(SecurityValidation.validateSafeString({} as any)).toBe(false);
    });
  });

  describe('SecurityValidation.validateSafeExpression', () => {
    it('should block dangerous expression patterns', () => {
      const dangerousExpressions = [
        'eval("alert(1)")',
        'this.constructor.constructor("alert(1)")()',
        'function() { alert(1); }',
        '() => { alert(1); }',
        'alert(1)',
        'setTimeout(function() { alert(1); }, 0)',
        'setInterval(() => {}, 1000)',
        'window.location = "http://evil.com"',
        'document.cookie'
      ];

      dangerousExpressions.forEach(expr => {
        expect(SecurityValidation.validateSafeExpression(expr)).toBe(false);
      });
    });

    it('should allow safe expressions', () => {
      const safeExpressions = [
        'variable === "value"',
        'number > 10',
        'text.startsWith("prefix")',
        'array.length < 5',
        'obj.property !== null',
        'value1 + value2',
        '(a && b) || c',
        '!isEmpty',
        ''
      ];

      safeExpressions.forEach(expr => {
        expect(SecurityValidation.validateSafeExpression(expr)).toBe(true);
      });
    });

    it('should reject overly long expressions', () => {
      const longExpression = 'a'.repeat(1000);
      expect(SecurityValidation.validateSafeExpression(longExpression)).toBe(false);
    });
  });

  describe('SecurityValidation.validateSafePropertyKey', () => {
    it('should block dangerous property keys', () => {
      const dangerousKeys = [
        '__proto__',
        'constructor',
        'prototype',
        '__defineGetter__',
        '__defineSetter__',
        'hasOwnProperty',
        'toString',
        'valueOf',
        'key__proto__',
        'constructor.prototype'
      ];

      dangerousKeys.forEach(key => {
        expect(SecurityValidation.validateSafePropertyKey(key)).toBe(false);
      });
    });

    it('should allow safe property keys', () => {
      const safeKeys = [
        'username',
        'user_id',
        'data-value',
        'item123',
        'valid_key',
        'normalProperty',
        'CamelCase',
        'kebab-case',
        'snake_case'
      ];

      safeKeys.forEach(key => {
        expect(SecurityValidation.validateSafePropertyKey(key)).toBe(true);
      });
    });

    it('should reject invalid key formats', () => {
      const invalidKeys = [
        '',
        'key with spaces',
        'key.with.dots',
        'key/with/slashes',
        'key$with$dollar',
        'key@with@at',
        'key#with#hash',
        'key!with!exclamation',
        'a'.repeat(200) // Too long
      ];

      invalidKeys.forEach(key => {
        expect(SecurityValidation.validateSafePropertyKey(key)).toBe(false);
      });
    });
  });

  describe('SecurityValidation.validateSafeValue', () => {
    it('should allow safe primitive values', () => {
      expect(SecurityValidation.validateSafeValue('string')).toBe(true);
      expect(SecurityValidation.validateSafeValue(123)).toBe(true);
      expect(SecurityValidation.validateSafeValue(true)).toBe(true);
      expect(SecurityValidation.validateSafeValue(null)).toBe(true);
      expect(SecurityValidation.validateSafeValue(undefined)).toBe(true);
    });

    it('should validate safe arrays', () => {
      expect(SecurityValidation.validateSafeValue(['a', 'b', 'c'])).toBe(true);
      expect(SecurityValidation.validateSafeValue([1, 2, 3])).toBe(true);
      expect(SecurityValidation.validateSafeValue([])).toBe(true);
    });

    it('should validate safe objects', () => {
      expect(SecurityValidation.validateSafeValue({ key: 'value' })).toBe(true);
      expect(SecurityValidation.validateSafeValue({ num: 123, bool: true })).toBe(true);
      expect(SecurityValidation.validateSafeValue({})).toBe(true);
    });

    it('should reject dangerous values', () => {
      expect(SecurityValidation.validateSafeValue(function() {})).toBe(false);
      expect(SecurityValidation.validateSafeValue(() => {})).toBe(false);
      expect(SecurityValidation.validateSafeValue(Symbol('test'))).toBe(false);
      expect(SecurityValidation.validateSafeValue(new Date())).toBe(false);
      expect(SecurityValidation.validateSafeValue(/regex/)).toBe(false);
    });

    it('should reject overly large data structures', () => {
      const largeArray = new Array(2000).fill('item');
      expect(SecurityValidation.validateSafeValue(largeArray)).toBe(false);
      
      const largeObject: Record<string, string> = {};
      for (let i = 0; i < 200; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }
      expect(SecurityValidation.validateSafeValue(largeObject)).toBe(false);
    });

    it('should reject infinite and NaN numbers', () => {
      expect(SecurityValidation.validateSafeValue(Infinity)).toBe(false);
      expect(SecurityValidation.validateSafeValue(-Infinity)).toBe(false);
      expect(SecurityValidation.validateSafeValue(NaN)).toBe(false);
    });
  });

  describe('SecurityValidation.safePropertyAccess', () => {
    it('should safely access valid properties', () => {
      const obj = { validKey: 'value', number: 123 };
      expect(SecurityValidation.safePropertyAccess(obj, 'validKey')).toBe('value');
      expect(SecurityValidation.safePropertyAccess(obj, 'number')).toBe(123);
    });

    it('should return fallback for dangerous keys', () => {
      const obj = { validKey: 'value' };
      expect(SecurityValidation.safePropertyAccess(obj, '__proto__', 'fallback')).toBe('fallback');
      expect(SecurityValidation.safePropertyAccess(obj, 'constructor', 'fallback')).toBe('fallback');
      expect(SecurityValidation.safePropertyAccess(obj, 'prototype', 'fallback')).toBe('fallback');
    });

    it('should return fallback for non-existent properties', () => {
      const obj = { validKey: 'value' };
      expect(SecurityValidation.safePropertyAccess(obj, 'nonExistent', 'fallback')).toBe('fallback');
    });

    it('should handle invalid objects safely', () => {
      expect(SecurityValidation.safePropertyAccess(null, 'key', 'fallback')).toBe('fallback');
      expect(SecurityValidation.safePropertyAccess(undefined, 'key', 'fallback')).toBe('fallback');
      expect(SecurityValidation.safePropertyAccess('string', 'key', 'fallback')).toBe('fallback');
    });
  });
});

describe('Zod Schema Security Tests', () => {
  describe('DEBT-001: SetVariableNodeSchema Security', () => {
    it('should reject dangerous values in SetVariable schema', () => {
      const dangerousGraphs = [
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: 'test',
            value: function() { return 'evil'; }
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: 'test',
            value: { __proto__: { polluted: true } }
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: '__proto__',
            value: 'any value'
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: 'constructor',
            value: 'any value'
          }]
        }
      ];

      dangerousGraphs.forEach(graph => {
        expect(() => GraphSchema.parse(graph)).toThrow();
      });
    });

    it('should accept safe values in SetVariable schema', () => {
      const safeGraphs = [
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: 'username',
            value: 'john_doe'
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: 'count',
            value: 42
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: 'enabled',
            value: true
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'SetVariable',
            key: 'data',
            value: { name: 'John', age: 30 }
          }]
        }
      ];

      safeGraphs.forEach(graph => {
        expect(() => GraphSchema.parse(graph)).not.toThrow();
      });
    });
  });

  describe('DEBT-002: ConditionalNodeSchema Security', () => {
    it('should reject dangerous expressions in Conditional schema', () => {
      const dangerousGraphs = [
        {
          nodes: [{
            id: 'test',
            type: 'Conditional',
            branches: [{
              condition: 'eval("alert(1)")',
              output: 'result'
            }]
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Conditional',
            branches: [{
              condition: 'constructor.constructor("alert(1)")()',
              output: 'result'
            }]
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Conditional',
            branches: [{
              condition: 'function() { alert(1); }',
              output: 'result'
            }]
          }]
        }
      ];

      dangerousGraphs.forEach(graph => {
        expect(() => GraphSchema.parse(graph)).toThrow();
      });
    });

    it('should accept safe expressions in Conditional schema', () => {
      const safeGraphs = [
        {
          nodes: [{
            id: 'test',
            type: 'Conditional',
            branches: [{
              condition: 'variable === "value"',
              output: 'result'
            }]
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Conditional',
            branches: [{
              condition: 'number > 10',
              output: 'result'
            }]
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Conditional',
            branches: [{
              condition: 'text.startsWith("prefix")',
              output: 'result'
            }]
          }]
        }
      ];

      safeGraphs.forEach(graph => {
        expect(() => GraphSchema.parse(graph)).not.toThrow();
      });
    });
  });

  describe('DEBT-003: IncludeNodeSchema Security', () => {
    it('should reject dangerous property keys in Include schema', () => {
      const dangerousGraphs = [
        {
          nodes: [{
            id: 'test',
            type: 'Include',
            name: '__proto__'
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Include',
            name: 'constructor'
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Include',
            name: 'prototype'
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Include',
            name: 'hasOwnProperty'
          }]
        }
      ];

      dangerousGraphs.forEach(graph => {
        expect(() => GraphSchema.parse(graph)).toThrow();
      });
    });

    it('should accept safe property keys in Include schema', () => {
      const safeGraphs = [
        {
          nodes: [{
            id: 'test',
            type: 'Include',
            name: 'template_name'
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Include',
            name: 'content123'
          }]
        },
        {
          nodes: [{
            id: 'test',
            type: 'Include',
            name: 'valid-key'
          }]
        }
      ];

      safeGraphs.forEach(graph => {
        expect(() => GraphSchema.parse(graph)).not.toThrow();
      });
    });
  });
});

describe('Runtime Security Tests', () => {
  let ctx: ExecutionContext;

  beforeEach(() => {
    ctx = {
      variables: {},
      seed: 'test-seed'
    };
  });

  describe('SetVariableNode Runtime Security', () => {
    it('should reject dangerous variable keys at runtime', () => {
      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
      
      dangerousKeys.forEach(key => {
        const node = new SetVariableNode('test', key, 'value');
        node.run(ctx);
        
        // Should not set the dangerous key
        expect(ctx.variables[key]).toBeUndefined();
        expect(ctx.variables.__proto__).toBeUndefined();
        expect(ctx.variables.constructor).toBeUndefined();
        expect(ctx.variables.prototype).toBeUndefined();
      });
    });

    it('should accept safe variable keys at runtime', () => {
      const safeKeys = ['username', 'user_id', 'data123'];
      
      safeKeys.forEach(key => {
        const node = new SetVariableNode('test', key, 'test-value');
        node.run(ctx);
        
        expect(ctx.variables[key]).toBe('test-value');
      });
    });

    it('should handle safe values correctly', () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'null', value: null },
        { key: 'undefined', value: undefined },
        { key: 'array', value: ['a', 'b', 'c'] },
        { key: 'object', value: { nested: 'value' } }
      ];

      testCases.forEach(({ key, value }) => {
        const node = new SetVariableNode('test', key, value);
        node.run(ctx);
        
        expect(ctx.variables[key]).toEqual(value);
      });
    });

    it('should reject dangerous value types at runtime', () => {
      const dangerousValues = [
        function() { return 'evil'; },
        () => 'evil',
        Symbol('evil'),
        new Date(),
        /regex/
      ];

      dangerousValues.forEach(value => {
        const node = new SetVariableNode('test', 'key', value);
        node.run(ctx);
        
        // Should not set the dangerous value
        expect(ctx.variables.key).toBeUndefined();
      });
    });
  });

  describe('GetVariableNode Runtime Security', () => {
    beforeEach(() => {
      ctx.variables = {
        safeKey: 'safe value',
        normalProperty: 'normal value'
      };
    });

    it('should reject dangerous variable keys at runtime', () => {
      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
      
      dangerousKeys.forEach(key => {
        const node = new GetVariableNode('test', key);
        const result = node.run(ctx);
        
        expect(result).toBeUndefined();
      });
    });

    it('should return safe variable values', () => {
      const node = new GetVariableNode('test', 'safeKey');
      const result = node.run(ctx);
      
      expect(result).toBe('safe value');
    });

    it('should return undefined for non-existent keys', () => {
      const node = new GetVariableNode('test', 'nonExistentKey');
      const result = node.run(ctx);
      
      expect(result).toBeUndefined();
    });
  });

  describe('IncludeNode Runtime Security', () => {
    it('should handle safe property access', () => {
      const lookup = {
        template1: 'Hello World',
        template2: 'Another template'
      };
      
      const node = new IncludeNode('test', 'template1', lookup);
      const result = node.run(ctx);
      
      expect(result).toBe('Hello World');
    });

    it('should reject dangerous property access', () => {
      const lookup = {
        template1: 'Hello World'
      };
      
      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
      
      dangerousKeys.forEach(key => {
        const node = new IncludeNode('test', key, lookup);
        const result = node.run(ctx);
        
        expect(result).toBe(''); // Should return empty string for dangerous keys
      });
    });

    it('should handle non-existent properties safely', () => {
      const lookup = {
        template1: 'Hello World'
      };
      
      const node = new IncludeNode('test', 'nonExistent', lookup);
      const result = node.run(ctx);
      
      expect(result).toBe(''); // Should return empty string for non-existent keys
    });

    it('should handle invalid lookup objects safely', () => {
      const invalidLookups = [null, undefined, 'string', 123, true];
      
      invalidLookups.forEach(lookup => {
        const node = new IncludeNode('test', 'key', lookup as any);
        const result = node.run(ctx);
        
        expect(result).toBe(''); // Should return empty string for invalid lookups
      });
    });

    it('should handle non-string results safely', () => {
      const lookup = {
        template1: 123 as any, // Non-string value
        template2: null as any,
        template3: undefined as any
      };
      
      ['template1', 'template2', 'template3'].forEach(key => {
        const node = new IncludeNode('test', key, lookup);
        const result = node.run(ctx);
        
        expect(result).toBe(''); // Should return empty string for non-string results
      });
    });
  });
});

describe('Comprehensive Security Test Suite', () => {
  it('should run all security tests and pass', () => {
    const testResults = SecurityTesting.runSecurityTests();
    expect(testResults).toBe(true);
  });

  it('should detect injection attempts in string validation', () => {
    const result = SecurityTesting.testInjectionProtection(
      SecurityValidation.validateSafeString,
      'String Validation'
    );
    
    expect(result.failed).toBe(0);
    expect(result.passed).toBeGreaterThan(0);
  });

  it('should detect injection attempts in expression validation', () => {
    const result = SecurityTesting.testInjectionProtection(
      SecurityValidation.validateSafeExpression,
      'Expression Validation'
    );
    
    expect(result.failed).toBe(0);
    expect(result.passed).toBeGreaterThan(0);
  });

  it('should detect injection attempts in property key validation', () => {
    const result = SecurityTesting.testInjectionProtection(
      SecurityValidation.validateSafePropertyKey,
      'Property Key Validation'
    );
    
    expect(result.failed).toBe(0);
    expect(result.passed).toBeGreaterThan(0);
  });
});

describe('Integration Security Tests', () => {
  it('should prevent prototype pollution through SetVariable', () => {
    const ctx: ExecutionContext = { variables: {}, seed: 'test' };
    
    // Attempt prototype pollution
    const node = new SetVariableNode('test', '__proto__', { polluted: true });
    node.run(ctx);
    
    // Verify pollution did not occur
    expect((ctx.variables as any).polluted).toBeUndefined();
    expect((Object.prototype as any).polluted).toBeUndefined();
  });

  it('should prevent constructor pollution through SetVariable', () => {
    const ctx: ExecutionContext = { variables: {}, seed: 'test' };
    
    // Attempt constructor pollution
    const node = new SetVariableNode('test', 'constructor', { polluted: true });
    node.run(ctx);
    
    // Verify pollution did not occur
    expect((ctx.variables.constructor as any)).toBeUndefined();
  });

  it('should prevent dangerous property access through IncludeNode', () => {
    const lookup = { template: 'safe content' };
    
    // Attempt to access dangerous properties
    const protoNode = new IncludeNode('test', '__proto__', lookup);
    const constructorNode = new IncludeNode('test', 'constructor', lookup);
    
    const ctx: ExecutionContext = { variables: {}, seed: 'test' };
    
    expect(protoNode.run(ctx)).toBe('');
    expect(constructorNode.run(ctx)).toBe('');
  });

  it('should handle edge cases safely', () => {
    const ctx: ExecutionContext = { variables: {}, seed: 'test' };
    
    // Test edge cases
    const edgeCases = [
      { key: '', value: 'test' },
      { key: 'a'.repeat(200), value: 'test' },
      { key: 'normal', value: 'x'.repeat(20000) }
    ];

    edgeCases.forEach(({ key, value }) => {
      const node = new SetVariableNode('test', key, value);
      node.run(ctx);
      
      // Should handle gracefully without throwing
      expect(ctx.variables[key]).toBeDefined();
    });
  });
});