/**
 * @jest-environment node
 * 
 * Safe Math Context Tests
 * 
 * Comprehensive tests for the Math function restrictions that ensure
 * only safe mathematical functions are available in conditional expressions.
 * 
 * Tests P0 security requirements for Epic 18 - Conditional Node Security (DEBT-002):
 * - Limited Math function subset
 * - Input validation and range checking
 * - NaN and Infinity handling
 * - Security audit logging
 * - Prototype pollution prevention
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createSafeMathContext,
  createAuditedSafeMathContext,
  validateMathFunctionCall,
  MathFunctionAuditor,
  SAFE_MATH_FUNCTIONS,
  BLOCKED_MATH_FUNCTIONS,
  NUMERIC_LIMITS,
  isInSafeRange,
  safeNumberCoercion
} from '../runtime/safe-math-context';
describe('Safe Math Context', () => {
  beforeEach(() => {
    MathFunctionAuditor.clearAuditLog();
  });
  afterEach(() => {
    MathFunctionAuditor.clearAuditLog();
  });
  describe('createSafeMathContext', () => {
    it('should create Math object with only safe functions', () => {
      const safeMath = createSafeMathContext();
      // Check safe functions are present
      expect(typeof safeMath.min).toBe('function');
      expect(typeof safeMath.max).toBe('function');
      expect(typeof safeMath.floor).toBe('function');
      expect(typeof safeMath.ceil).toBe('function');
      expect(typeof safeMath.round).toBe('function');
      expect(typeof safeMath.abs).toBe('function');
      expect(typeof safeMath.sign).toBe('function');
      expect(typeof safeMath.trunc).toBe('function');
      // Check constants are present
      expect(safeMath.PI).toBe(Math.PI);
      expect(safeMath.E).toBe(Math.E);
      // Check dangerous functions are NOT present
      expect(safeMath.random).toBeUndefined();
      expect(safeMath.pow).toBeUndefined();
      expect(safeMath.exp).toBeUndefined();
      expect(safeMath.sqrt).toBeUndefined();
      expect(safeMath.log).toBeUndefined();
    });
    it('should create Math object without prototype', () => {
      const safeMath = createSafeMathContext();
      // Should not have prototype chain
      expect(Object.getPrototypeOf(safeMath)).toBeNull();
      // Should not have constructor
      expect(safeMath.constructor).toBeUndefined();
      expect(safeMath.__proto__).toBeUndefined();
    });
    it('should create sealed Math object', () => {
      const safeMath = createSafeMathContext();
      // Should be sealed
      expect(Object.isSealed(safeMath)).toBe(true);
      // Cannot add new properties
      expect(() => {
        (safeMath as any).newProp = 'value'
  }).toThrow();
      // Cannot delete existing properties
      expect(() => {
        delete (safeMath as any).min;
      }).toThrow();
    });
    it('should have read-only constants', () => {
      const safeMath = createSafeMathContext();
      // Try to modify constants
      expect(() => {
        (safeMath as any).PI = 3;
      }).toThrow();
      expect(() => {
        (safeMath as any).E = 2;
      }).toThrow();
      // Values should remain unchanged
      expect(safeMath.PI).toBe(Math.PI);
      expect(safeMath.E).toBe(Math.E);
    });
  });
  describe('Safe Math Functions', () => {
  let safeMath: any;
  beforeEach(() => {
  safeMath = createSafeMathContext();
});
    describe('Math.min', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.min(1, 2, 3)).toBe(1);
        expect(safeMath.min(-5, 0, 5)).toBe(-5);
        expect(safeMath.min(42)).toBe(42);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.min()).toThrow('requires at least one argument');
        expect(() => safeMath.min('string')).toThrow('expects a number');
        expect(() => safeMath.min(NaN)).toThrow('received NaN');
        expect(() => safeMath.min(Infinity)).toThrow('received Infinity');
      });
      it('should enforce range limits', () => {
        expect(() => safeMath.min(Number.MAX_VALUE)).toThrow('out of safe range');
        expect(() => safeMath.min(-Number.MAX_VALUE)).toThrow('out of safe range');
      });
    });
    describe('Math.max', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.max(1, 2, 3)).toBe(3);
        expect(safeMath.max(-5, 0, 5)).toBe(5);
        expect(safeMath.max(42)).toBe(42);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.max()).toThrow('requires at least one argument');
        expect(() => safeMath.max('string')).toThrow('expects a number');
        expect(() => safeMath.max(NaN)).toThrow('received NaN');
        expect(() => safeMath.max(Infinity)).toThrow('received Infinity');
      });
    });
    describe('Math.floor', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.floor(4.7)).toBe(4);
        expect(safeMath.floor(-4.7)).toBe(-5);
        expect(safeMath.floor(0)).toBe(0);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.floor('string')).toThrow('expects a number');
        expect(() => safeMath.floor(NaN)).toThrow('received NaN');
        expect(() => safeMath.floor(Infinity)).toThrow('received Infinity');
      });
    });
    describe('Math.ceil', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.ceil(4.3)).toBe(5);
        expect(safeMath.ceil(-4.3)).toBe(-4);
        expect(safeMath.ceil(0)).toBe(0);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.ceil('string')).toThrow('expects a number');
        expect(() => safeMath.ceil(NaN)).toThrow('received NaN');
        expect(() => safeMath.ceil(Infinity)).toThrow('received Infinity');
      });
    });
    describe('Math.round', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.round(4.5)).toBe(5);
        expect(safeMath.round(4.4)).toBe(4);
        expect(safeMath.round(-4.5)).toBe(-4);
        expect(safeMath.round(-4.6)).toBe(-5);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.round('string')).toThrow('expects a number');
        expect(() => safeMath.round(NaN)).toThrow('received NaN');
        expect(() => safeMath.round(Infinity)).toThrow('received Infinity');
      });
    });
    describe('Math.abs', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.abs(-5)).toBe(5);
        expect(safeMath.abs(5)).toBe(5);
        expect(safeMath.abs(0)).toBe(0);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.abs('string')).toThrow('expects a number');
        expect(() => safeMath.abs(NaN)).toThrow('received NaN');
        expect(() => safeMath.abs(Infinity)).toThrow('received Infinity');
      });
    });
    describe('Math.sign', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.sign(5)).toBe(1);
        expect(safeMath.sign(-5)).toBe(-1);
        expect(safeMath.sign(0)).toBe(0);
        expect(safeMath.sign(-0)).toBe(-0);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.sign('string')).toThrow('expects a number');
        expect(() => safeMath.sign(NaN)).toThrow('received NaN');
        expect(() => safeMath.sign(Infinity)).toThrow('received Infinity');
      });
    });
    describe('Math.trunc', () => {
      it('should work with valid numbers', () => {
        expect(safeMath.trunc(4.7)).toBe(4);
        expect(safeMath.trunc(-4.7)).toBe(-4);
        expect(safeMath.trunc(0.9)).toBe(0);
      });
      it('should validate inputs', () => {
        expect(() => safeMath.trunc('string')).toThrow('expects a number');
        expect(() => safeMath.trunc(NaN)).toThrow('received NaN');
        expect(() => safeMath.trunc(Infinity)).toThrow('received Infinity');
      });
    });
    it('should handle large argument counts within limits', () => {
      const args = Array(100).fill(1).map((_, i) => i);
      expect(safeMath.min(...args)).toBe(0);
      expect(safeMath.max(...args)).toBe(99);
    });
    it('should reject extremely large argument counts', () => {
      const args = Array(1001).fill(1);
      expect(() => safeMath.min(...args)).toThrow('too many arguments');
      expect(() => safeMath.max(...args)).toThrow('too many arguments');
    });
  });
  describe('createAuditedSafeMathContext', () => {
    it('should audit allowed function access', () => {
      const safeMath = createAuditedSafeMathContext('test');
      // Access allowed function
      const result = safeMath.min(1, 2);
      expect(result).toBe(1);
      const log = MathFunctionAuditor.getAuditLog();
      expect(log.length).toBe(1);
      expect(log[0].functionName).toBe('min');
      expect(log[0].allowed).toBe(true);
      expect(log[0].context).toBe('test');
    });
    it('should block and audit dangerous function access', () => {
      const safeMath = createAuditedSafeMathContext('test');
      expect(() => safeMath.random).toThrow('Math.random is not allowed');
      expect(() => safeMath.pow).toThrow('Math.pow is not allowed');
      expect(() => safeMath.eval).toThrow('Math.eval is not available');
      const log = MathFunctionAuditor.getAuditLog();
      expect(log.length).toBe(3);
      expect(log.every(entry => !entry.allowed)).toBe(true);
    });
    it('should prevent modification of Math object', () => {
      const safeMath = createAuditedSafeMathContext('test');
      expect(() => {
        safeMath.min = () => 0;
      }).toThrow('Cannot modify Math object');
      expect(() => {
        safeMath.newFunc = () => {};
      }).toThrow('Cannot modify Math object');
      expect(() => {
        delete safeMath.min;
      }).toThrow('Cannot delete Math properties');
    });
    it('should access constants without auditing', () => {
      const safeMath = createAuditedSafeMathContext('test');
      const pi = safeMath.PI;
      const e = safeMath.E;
      expect(pi).toBe(Math.PI);
      expect(e).toBe(Math.E);
      const log = MathFunctionAuditor.getAuditLog();
      expect(log.filter(entry => entry.functionName === 'PI').length).toBe(1);
      expect(log.filter(entry => entry.functionName === 'E').length).toBe(1);
    });
  });
  describe('validateMathFunctionCall', () => {
    it('should validate safe functions', () => {
      SAFE_MATH_FUNCTIONS.forEach(func => {)
  expect(validateMathFunctionCall(func)).toBe(true);
      });
    });
    it('should reject blocked functions', () => {
      BLOCKED_MATH_FUNCTIONS.forEach(func => {)
  expect(validateMathFunctionCall(func)).toBe(false);
      });
    });
    it('should reject unknown functions', () => {
      expect(validateMathFunctionCall('unknownFunc')).toBe(false);
      expect(validateMathFunctionCall('eval')).toBe(false);
      expect(validateMathFunctionCall('constructor')).toBe(false);
    });
  });
  describe('MathFunctionAuditor', () => {
    it('should track audit events', () => {
      MathFunctionAuditor.logAttempt('min', true, 'Allowed', 'test');
      MathFunctionAuditor.logAttempt('random', false, 'Blocked', 'test');
      MathFunctionAuditor.logAttempt('pow', false, 'Blocked', 'test');
      const log = MathFunctionAuditor.getAuditLog();
      expect(log.length).toBe(3);
      const blocked = MathFunctionAuditor.getBlockedAttempts();
      expect(blocked.length).toBe(2);
      expect(blocked.every(e => !e.allowed)).toBe(true);
    });
    it('should provide summary statistics', () => {
  MathFunctionAuditor.logAttempt('min', true, 'Allowed', 'test');
  MathFunctionAuditor.logAttempt('min', true, 'Allowed', 'test');
  MathFunctionAuditor.logAttempt('random', false, 'Blocked', 'test');
  MathFunctionAuditor.logAttempt('random', false, 'Blocked', 'test');
  MathFunctionAuditor.logAttempt('random', false, 'Blocked', 'test');
  const summary = MathFunctionAuditor.getSummary();
  expect(summary['min:allowed']).toBe(2);
  expect(summary['random:blocked']).toBe(3);
});
    it('should limit audit log size', () => {
      // Generate many events
      for (let i = 0; i < 1100; i++) {
        MathFunctionAuditor.logAttempt('test', true, 'Test', 'test');
      const log = MathFunctionAuditor.getAuditLog();
      expect(log.length).toBeLessThanOrEqual(1000);
    });
  });
  describe('Utility Functions', () => {
    describe('isInSafeRange', () => {
      it('should validate safe numbers', () => {
        expect(isInSafeRange(0)).toBe(true);
        expect(isInSafeRange(42)).toBe(true);
        expect(isInSafeRange(-42)).toBe(true);
        expect(isInSafeRange(Number.MAX_SAFE_INTEGER)).toBe(true);
        expect(isInSafeRange(Number.MIN_SAFE_INTEGER)).toBe(true);
      });
      it('should reject unsafe numbers', () => {
        expect(isInSafeRange(NaN)).toBe(false);
        expect(isInSafeRange(Infinity)).toBe(false);
        expect(isInSafeRange(-Infinity)).toBe(false);
        expect(isInSafeRange(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
        expect(isInSafeRange(Number.MIN_SAFE_INTEGER - 1)).toBe(false);
      });
      it('should reject non-numbers', () => {
        expect(isInSafeRange('42' as any)).toBe(false);
        expect(isInSafeRange(null as any)).toBe(false);
        expect(isInSafeRange(undefined as any)).toBe(false);
        expect(isInSafeRange({} as any)).toBe(false);
      });
    });
    describe('safeNumberCoercion', () => {
      it('should handle valid numbers', () => {
        expect(safeNumberCoercion(42)).toBe(42);
        expect(safeNumberCoercion(-42.5)).toBe(-42.5);
        expect(safeNumberCoercion(0)).toBe(0);
      });
      it('should coerce booleans', () => {
        expect(safeNumberCoercion(true)).toBe(1);
        expect(safeNumberCoercion(false)).toBe(0);
      });
      it('should parse valid strings', () => {
        expect(safeNumberCoercion('42')).toBe(42);
        expect(safeNumberCoercion('-42.5')).toBe(-42.5);
        expect(safeNumberCoercion('0')).toBe(0);
        expect(safeNumberCoercion('  123  ')).toBe(123);
      });
      it('should reject invalid values', () => {
        expect(() => safeNumberCoercion('')).toThrow('empty string');
        expect(() => safeNumberCoercion('abc')).toThrow('Cannot convert');
        expect(() => safeNumberCoercion(null)).toThrow('Cannot convert');
        expect(() => safeNumberCoercion(undefined)).toThrow('Cannot convert');
        expect(() => safeNumberCoercion({})).toThrow('Cannot convert');
        expect(() => safeNumberCoercion([])).toThrow('Cannot convert');
      });
      it('should reject unsafe numbers', () => {
        expect(() => safeNumberCoercion(NaN)).toThrow('received NaN');
        expect(() => safeNumberCoercion(Infinity)).toThrow('received Infinity');
        expect(() => safeNumberCoercion('Infinity')).toThrow('received Infinity');
        expect(() => safeNumberCoercion(Number.MAX_VALUE)).toThrow('out of safe range');
      });
    });
  });
  describe('Constants', () => {
    it('should define numeric limits', () => {
      expect(NUMERIC_LIMITS.MAX_SAFE_VALUE).toBe(Number.MAX_SAFE_INTEGER);
      expect(NUMERIC_LIMITS.MIN_SAFE_VALUE).toBe(Number.MIN_SAFE_INTEGER);
      expect(NUMERIC_LIMITS.MAX_ARRAY_LENGTH).toBe(1000);
      expect(NUMERIC_LIMITS.MAX_DECIMAL_PLACES).toBe(10);
    });
    it('should have complete function lists', () => {
      expect(SAFE_MATH_FUNCTIONS).toContain('min');
      expect(SAFE_MATH_FUNCTIONS).toContain('max');
      expect(SAFE_MATH_FUNCTIONS).toContain('abs');
      expect(SAFE_MATH_FUNCTIONS.length).toBe(8);
      expect(BLOCKED_MATH_FUNCTIONS).toContain('random');
      expect(BLOCKED_MATH_FUNCTIONS).toContain('pow');
      expect(BLOCKED_MATH_FUNCTIONS).toContain('eval');
      expect(BLOCKED_MATH_FUNCTIONS.length).toBeGreaterThan(20);
    });
  });
});