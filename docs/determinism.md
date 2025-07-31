# Determinism Test Matrix

This document explains the deterministic testing strategy implemented for PromptSpaghetti graph execution.

**Last Updated: July 14, 2025**

**Maintained by: Quinn (QA Engineer)**

## Overview

The determinism test matrix ensures that our graph executor produces consistent and predictable outputs when given the same input graph and seed. This is critical for:

1. **Reproducibility**: Users expect the same results when rerunning with a specific seed
2. **Regression Detection**: Changes to the execution engine should not alter existing seed-based outputs
3. **Cross-Platform Consistency**: Results should be identical across different environments

## Implementation

The implementation consists of three key components:

### 1. Parameterized Testing

The test suite generates 50 separate test cases, one for each seed value from 1-50:

```typescript
const seeds = Array.from({ length: 50 }, (_, i) => i + 1);

test.each(seeds)('Seed %i produces deterministic output', async seed => {
  // Test with this specific seed
  // ...
  expect(outputs[0]).toMatchSnapshot(`seed-${seed}`);
});
```

This creates a matrix of tests that cover a wide range of seed values.

### 2. Snapshot Testing

For each seed, we capture the output as a Jest snapshot. These snapshots serve as "golden files" - the canonical correct output for each seed value:

- Snapshots are stored in `__snapshots__/determinism.test.ts.snap`
- Future test runs compare current outputs against these snapshots
- Any discrepancy fails the test and alerts developers

### 3. CI Integration

The test matrix is designed to run in CI environments to catch regressions:

- Snapshot differences will fail the CI pipeline
- Coverage thresholds enforce quality standards
- The test acts as a safety net for the execution engine

## Test Graph

The test utilizes a carefully designed graph with:

- Multiple weighted choice nodes to ensure variety across seeds
- Variable usage to test variable context handling
- Concatenation to test complex node combinations

This graph has enough complexity and randomness to be an effective test case while still being small enough for quick execution.

### Extended Coverage Tests

In addition to the main determinism test matrix, we've implemented specialized test suites to achieve comprehensive coverage:

1. **engine-coverage.test.ts**: Targets specific node types and their interactions
   - Include nodes with template lookup behavior
   - Variable nodes (SetVariable and GetVariable)
   - Error handling for unsupported node types
   - Complex graph traversal scenarios

2. **engine-branch-coverage.test.ts**: Focuses on edge cases and branch coverage
   - Missing node references
   - Nodes without input arrays
   - Various seed types (numeric, string, undefined)
   - Graph memory and memoization testing
   - Multiple output handling

## Coverage Requirements

The Jest configuration has been updated with coverage thresholds:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  // Critical files have higher requirements
  'server/src/engine.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  },
  'packages/core/runtime/index.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

This ensures that:

1. The overall codebase maintains at least 80% coverage
2. Critical execution components maintain at least 90% coverage

### Current Coverage Status

As of the last update, our coverage metrics stand at:

| File                           | Statements | Branches | Functions | Lines  |
| ------------------------------ | ---------- | -------- | --------- | ------ |
| engine.ts                      | 97.43%     | 92.3%    | 100%      | 97.14% |
| packages/core/runtime/index.ts | 83.78%     | 100%     | 80%       | 84.84% |

The `engine.ts` file now meets all coverage thresholds, but `runtime/index.ts` still requires additional tests to achieve the required 90% coverage threshold.

## Maintaining the Tests

When making changes to the execution engine:

1. Run tests with `npm test -- server/src/__tests__/determinism.test.ts` to verify that outputs are still deterministic
2. If you've intentionally changed behavior in a way that affects outputs:
   - Review the differences carefully
   - Update snapshots with `npm test -- -u server/src/__tests__/determinism.test.ts` if changes are expected

## Important Notes

- **NEVER** update snapshots blindly without verifying the differences
- Any changes to deterministic output is a potential breaking change for users
- If deterministic behavior must change, consider it a major version update
- The test matrix acts as a "contract" that our system must maintain with users

## Running All Determinism Tests

To run the complete suite of determinism tests and get full coverage metrics:

```bash
npm test -- server/src/__tests__/determinism.test.ts server/src/__tests__/engine-coverage.test.ts server/src/__tests__/engine-branch-coverage.test.ts
```

For checking specific implementations:

1. Main determinism matrix (50 seeds):

   ```bash
   npm test -- server/src/__tests__/determinism.test.ts
   ```

2. Node type coverage tests:

   ```bash
   npm test -- server/src/__tests__/engine-coverage.test.ts
   ```

3. Edge case and branch coverage:
   ```bash
   npm test -- server/src/__tests__/engine-branch-coverage.test.ts
   ```

## Future Enhancements

- Additional coverage for the runtime module
- Integration with end-to-end tests
- Performance benchmarking across seeds
- Testing environment variability
