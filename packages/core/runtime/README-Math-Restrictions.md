# Math Function Restrictions - Security Enhancement

## Overview

The Math Function Restrictions system provides a secure, limited subset of mathematical functions for use in conditional expressions. This system prevents access to dangerous Math functions while providing essential mathematical operations needed for expression evaluation.

## Implementation

### Files Created/Modified

1. **`packages/core/runtime/safe-math-context.ts`** - Main implementation
   - Safe Math function implementations with input validation
   - Function whitelist/blocklist definitions
   - Security audit logging for Math function access
   - Numeric range validation and coercion utilities
   - Prototype pollution prevention

2. **`packages/core/runtime/expression-evaluator.ts`** - Enhanced with Math restrictions
   - Integrated safe Math context into `SafeExpressionEvaluator`
   - Added `createSafeContext()` method with audited Math functions
   - Math audit log access methods

3. **`packages/core/runtime/nodes/Conditional.ts`** - Updated to use safe Math
   - Modified `createEvaluationContext()` to use `SafeExpressionEvaluator.createSafeContext()`
   - Inherits all Math security features automatically

4. **`packages/core/__tests__/safe-math-context.test.ts`** - Comprehensive test suite
   - Tests for all safe Math functions
   - Input validation and range checking tests
   - Audit logging tests
   - Prototype pollution prevention tests

## Security Features

### Safe Math Functions

Only the following deterministic, side-effect-free Math functions are allowed:

- **`Math.min(...values)`** - Find minimum value
- **`Math.max(...values)`** - Find maximum value
- **`Math.floor(x)`** - Round down to integer
- **`Math.ceil(x)`** - Round up to integer
- **`Math.round(x)`** - Round to nearest integer
- **`Math.abs(x)`** - Absolute value
- **`Math.sign(x)`** - Sign of number (-1, 0, or 1)
- **`Math.trunc(x)`** - Truncate decimal part

### Safe Constants

- **`Math.PI`** - Pi constant (read-only)
- **`Math.E`** - Euler's number (read-only)

### Blocked Functions

The following Math functions are explicitly blocked for security reasons:

- **`Math.random()`** - Non-deterministic, breaks reproducibility
- **`Math.pow(x, y)`** - Can cause DoS with large exponents
- **`Math.exp(x)`** - Can cause numeric overflow
- **`Math.sqrt(x)`**, **`Math.log(x)`** - Can be used for timing attacks
- All trigonometric functions - Not needed for basic comparisons
- All hyperbolic functions - Not needed
- Bit manipulation functions - Not needed
- Advanced math functions - Not needed

### Input Validation

All Math functions validate inputs to ensure:

1. **Type Safety** - Only accepts numbers (with safe coercion for booleans/strings)
2. **NaN Rejection** - Throws error on NaN inputs
3. **Infinity Rejection** - Throws error on Infinity inputs
4. **Range Validation** - Values must be within `Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`
5. **Array Length Limits** - Max 1000 arguments for variadic functions

### Security Measures

1. **No Prototype Chain** - Math object created with `Object.create(null)`
2. **Sealed Object** - Cannot add/delete properties with `Object.seal()`
3. **Read-Only Constants** - PI and E defined with `writable: false`
4. **Audit Logging** - All Math function access is logged with security context
5. **Proxy Protection** - Audited context uses Proxy to intercept all access

## Usage

### Basic Usage

```typescript
import { SafeExpressionEvaluator } from './expression-evaluator';

// Create safe context with Math restrictions
const context = SafeExpressionEvaluator.createSafeContext({
  temperature: 25,
  threshold: 30
});

// Safe Math expressions
const result1 = SafeExpressionEvaluator.evaluate(
  'Math.min(temperature, threshold)',
  context
); // 25

const result2 = SafeExpressionEvaluator.evaluate(
  'Math.abs(temperature - threshold)',
  context
); // 5

// Blocked Math expressions throw errors
try {
  SafeExpressionEvaluator.evaluate('Math.random()', context);
} catch (e) {
  // Error: Math.random is not allowed for security reasons
}
```

### In Conditional Nodes

```typescript
const conditional = new ConditionalNode(
  'temp-check',
  [
    {
      condition: 'Math.abs(temperature - target) < 5',
      output: 'Temperature is within range'
    },
    {
      condition: 'temperature > Math.max(limit1, limit2)',
      output: 'Temperature exceeds limits'
    }
  ],
  'Temperature is normal'
);
```

### Audit Logging

```typescript
import { MathFunctionAuditor } from './safe-math-context';

// Check audit log after expression evaluation
const auditLog = MathFunctionAuditor.getAuditLog();
console.log('Math function calls:', auditLog);

// Get blocked attempts
const blocked = MathFunctionAuditor.getBlockedAttempts();
console.log('Blocked Math calls:', blocked);

// Get summary statistics
const summary = MathFunctionAuditor.getSummary();
console.log('Math usage summary:', summary);
```

## Numeric Limits

The system enforces the following numeric limits:

- **MAX_SAFE_VALUE**: `9007199254740991` (Number.MAX_SAFE_INTEGER)
- **MIN_SAFE_VALUE**: `-9007199254740991` (Number.MIN_SAFE_INTEGER)
- **MAX_ARRAY_LENGTH**: `1000` (for min/max arguments)
- **MAX_DECIMAL_PLACES**: `10` (for display/validation)

## P0 Security Requirements Addressed

This implementation addresses the P0 security requirements for Epic 18 - Conditional Node Security (DEBT-002):

- ✅ Limited Math functions exposed (only 8 safe functions)
- ✅ Input validation for all functions
- ✅ Range checking to prevent numeric overflow
- ✅ NaN and Infinity handling
- ✅ No access to Math constructor or prototype
- ✅ Security audit logging
- ✅ Deterministic operations only (no Math.random)
- ✅ DoS prevention (no Math.pow with large exponents)

## Testing

Run the test suites to verify the implementation:

```bash
# Unit tests
cd packages/core
npx jest __tests__/safe-math-context.test.ts

# Integration tests
npx jest __tests__/math-restrictions-integration.test.js
```

## Performance Considerations

The Math restrictions add minimal overhead:

1. **Input Validation** - Simple type/range checks, O(1) for single values
2. **Audit Logging** - Bounded memory usage (max 1000 events)
3. **Proxy Overhead** - Only for audited contexts, minimal impact
4. **No Complex Math** - Removed expensive operations like pow, exp, trig

## Best Practices

1. **Use Safe Functions** - Stick to the provided safe Math functions
2. **Validate Inputs** - The system validates, but pre-validate when possible
3. **Check Audit Logs** - Monitor for blocked attempts in production
4. **Handle Errors** - Math functions throw on invalid inputs
5. **Avoid Large Arrays** - Keep min/max arguments under 1000

This implementation provides a secure, performant subset of Math functionality suitable for conditional expressions while preventing all known Math-related security vulnerabilities.
