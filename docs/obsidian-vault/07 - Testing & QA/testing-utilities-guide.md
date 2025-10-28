# Testing Utilities Guide for Epic 18

## Overview

The Epic 18 Testing Utilities provide a comprehensive suite of tools for testing code refactoring, migrations, performance, and modernization efforts. These utilities are specifically designed to support Epic 18's goals of technical debt assessment, core engine refactoring, and frontend modernization.

## Core Components

### 1. TestEnvironmentManager

Manages test environments with automatic setup and cleanup.

```typescript
import { TestEnvironmentManager } from '../tests/utils';

// Create a test environment
const env = await TestEnvironmentManager.createEnvironment('integration-test', {
  seed: 'test-seed-123',
  mockReactFlow: true,
  mockWebSocket: true,
  mockLocalStorage: true,
  timeout: 10000
});

// Use the environment
const fixtures = env.fixtures;
const reactFlowMocks = env.mocks.get('reactFlow');

// Cleanup is automatic, but you can also manually cleanup
await TestEnvironmentManager.cleanupEnvironment('integration-test');
```

**Features:**

- Automatic ReactFlow mocking
- WebSocket mock setup
- LocalStorage mocking
- Fixture management integration
- Automatic cleanup on test completion

### 2. ComponentTestingUtils

Specialized utilities for React component testing.

#### Responsive Testing

```typescript
import { ComponentTestingUtils } from '../tests/utils';

// Test component across different viewport sizes
const results = ComponentTestingUtils.testResponsive(
  <MyComponent />,
  ['mobile', 'tablet', 'desktop']
);

results.forEach(result => {
  console.log(`Viewport: ${result.viewport}`);
  console.log(`Dimensions: ${result.dimensions.width}x${result.dimensions.height}`);
  // Access render result for assertions
  expect(result.renderResult.getByTestId('responsive-element')).toBeInTheDocument();
});
```

#### Performance Testing

```typescript
// Measure component performance
const performanceResult = await ComponentTestingUtils.testPerformance(
  <ExpensiveComponent data={largeDataSet} />,
  {
    iterations: 10,
    measureMemory: true,
    measureRender: true
  }
);

console.log(`Average render time: ${performanceResult.averageRenderTime}ms`);
console.log(`Memory delta: ${performanceResult.memoryDelta}MB`);
```

### 3. AsyncTestingUtils

Utilities for handling async operations in tests.

```typescript
import { AsyncTestingUtils } from '../tests/utils';

// Wait for a condition to be met
await AsyncTestingUtils.waitForCondition(
  () => document.querySelector('.loaded') !== null,
  {
    timeout: 5000,
    interval: 100
  }
);

// Wait for element to appear
const element = await AsyncTestingUtils.waitForElement(
  () => document.getElementById('dynamic-element'),
  {
    timeout: 3000
  }
);

// Test async hooks
await AsyncTestingUtils.testAsyncHook(
  () => useAsyncData(apiUrl),
  async result => {
    await act(async () => {
      result.current.refetch();
    });
    expect(result.current.data).toBeDefined();
  }
);

// Add delays in tests
await AsyncTestingUtils.delay(500);

// Test with timeout protection
const result = await AsyncTestingUtils.withTimeout(
  longRunningOperation(),
  10000,
  'Operation took too long'
);
```

### 4. MockDataUtils

Utilities for creating and managing mock data.

```typescript
import { MockDataUtils } from '../tests/utils';

// Create mock user
const user = MockDataUtils.createMockUser({
  name: 'Test Admin',
  role: 'admin',
  preferences: { theme: 'dark' }
});

// Create mock graph
const graph = MockDataUtils.createMockGraph({
  nodes: [{ id: 'custom-node', type: 'WeightedChoice', data: { choices: [] } }]
});

// Create mock API responses
const response = MockDataUtils.createMockApiResponse(
  { users: [user] },
  { status: 200, delay: 100 }
);

// Create batches of data
const users = MockDataUtils.createBatch(
  index => MockDataUtils.createMockUser({ name: `User ${index}` }),
  10
);
```

### 5. PerformanceTestingUtils

Tools for measuring and benchmarking performance.

```typescript
import { PerformanceTestingUtils } from '../tests/utils';

// Measure function execution
const measurement = await PerformanceTestingUtils.measureExecution(
  async () => {
    return await processLargeDataset(data);
  },
  5 // iterations
);

console.log(`Average execution time: ${measurement.averageTime}ms`);
console.log(`Min/Max: ${measurement.minTime}ms / ${measurement.maxTime}ms`);

// Create performance benchmarks
const benchmark = PerformanceTestingUtils.createBenchmark('data-processing');

const timer1 = benchmark.start('parse-data');
parseData(rawData);
timer1.end();

const timer2 = benchmark.start('transform-data');
transformData(parsedData);
timer2.end();

const results = benchmark.getResults();
console.log('Parse time:', results['parse-data'].average);
console.log('Transform time:', results['transform-data'].average);

// Measure memory usage
const memoryResult = await PerformanceTestingUtils.measureMemoryUsage(() => {
  return createLargeObject();
});

console.log(`Memory used: ${memoryResult.memoryDelta} bytes`);
```

## Migration and Refactoring Utilities

### 1. MigrationTestHelper

Tools for testing migration paths and ensuring successful upgrades.

```typescript
import { MigrationTestHelper, MigrationStep } from '../tests/utils';

// Define migration steps
const migrationSteps: MigrationStep[] = [
  {
    id: 'add-version-field',
    name: 'Add version field to schema',
    execute: async state => ({
      ...state,
      version: '2.0.0'
    }),
    rollback: async state => {
      const { version, ...rolledBack } = state;
      return rolledBack;
    }
  },
  {
    id: 'migrate-node-types',
    name: 'Update node type structure',
    execute: async state => ({
      ...state,
      nodes: state.nodes.map(node => ({
        ...node,
        nodeType: node.type // Rename field
      }))
    })
  }
];

// Test complete migration path
const result = await MigrationTestHelper.testMigrationPath(
  'v1-to-v2-migration',
  migrationSteps,
  initialState
);

if (result.success) {
  console.log('Migration completed successfully');
  console.log(`Final state:`, result.finalState);
} else {
  console.log(`Migration failed at step ${result.failedAtStep}`);
  result.stepResults.forEach(step => {
    if (!step.success) {
      console.log(`Failed step: ${step.stepName}`, step.error);
    }
  });
}

// Test backward compatibility
const compatibilityResult = MigrationTestHelper.testBackwardCompatibility(
  oldAPI,
  newAPI,
  [
    { name: 'test-method', methodName: 'processGraph', args: [graph] },
    { name: 'test-property', propertyName: 'version' }
  ]
);
```

### 2. LegacySystemMock

Create mocks of legacy systems for testing migrations.

```typescript
import { LegacySystemMock } from '../tests/utils';

// Create version-specific mocks
const v1System = LegacySystemMock.forVersion('1.5.0');
const v2System = LegacySystemMock.forVersion('2.1.0');

// Test feature support
expect(v1System.supportsFeature('variables')).toBe(false);
expect(v2System.supportsFeature('variables')).toBe(true);

// Execute graphs in different versions
const v1Result = v1System.executeGraph(testGraph);
const v2Result = v2System.executeGraph(testGraph);

// Compare results
expect(v1Result.variables).toEqual({}); // V1 doesn't support variables
expect(v2Result.variables).toBeDefined(); // V2 supports variables

// Set internal state for testing
v2System.setState({ debugMode: true });
const result = v2System.executeGraph(graph, { verbose: true });
```

### 3. RefactoringValidator

Validate that refactored code maintains expected behavior.

```typescript
import { RefactoringValidator } from '../tests/utils';

// Compare function implementations
const comparisonResult = await RefactoringValidator.compareFunctionBehavior(
  oldFunction,
  newFunction,
  [
    { name: 'basic test', args: [1, 2], expectedResult: 3 },
    { name: 'edge case', args: [0, 0], expectedResult: 0 },
    {
      name: 'custom validation',
      args: ['input'],
      validator: (oldResult, newResult) => {
        // Custom logic to determine if results are equivalent
        return {
          valid: oldResult?.length === newResult?.length,
          message: 'Results should have same length'
        };
      }
    }
  ]
);

if (!comparisonResult.success) {
  comparisonResult.results.forEach(test => {
    if (!test.success) {
      console.log(`Failed: ${test.testCase.name}`, test.error);
    }
  });
}

// Validate interface compatibility
const interfaceResult = RefactoringValidator.validateInterfaceCompatibility(
  oldObject,
  newObject,
  ['executeGraph', 'validateGraph'], // required methods
  ['version', 'config'] // required properties
);

if (!interfaceResult.compatible) {
  console.log('Compatibility issues:', interfaceResult.issues);
  console.log('Warnings:', interfaceResult.warnings);
}
```

## Custom Jest Matchers

Epic 18 provides custom Jest matchers for quality and architecture testing.

### Performance Matchers

```typescript
// Test performance budgets
expect(performanceMetrics).toMeetPerformanceBudget({
  loadTime: 2000,
  renderTime: 100,
  bundleSize: 1024,
  memoryUsage: 50
});

// Test response times
expect(apiResponse).toBeWithinResponseTime(500);

// Test memory usage
expect(memoryTest).toHaveMemoryUsageBelowLimit(100);
```

### Code Quality Matchers

```typescript
// Test code quality standards
expect(codeMetrics).toMeetCodeQualityStandards({
  minCoverage: 80,
  maxComplexity: 10,
  maxDuplication: 5,
  maxViolations: 0
});

// Test complexity
expect(functionMetrics).toHaveComplexityBelow(15);

// Test coverage
expect(testResults).toHaveCoverageAbove(85);
```

### Architecture Matchers

```typescript
// Test architectural rules
expect(codebase).toFollowArchitecturalRules([
  {
    name: 'no-direct-db-access',
    description: 'UI components should not directly access database',
    validate: code => !code.includes('SELECT * FROM')
  }
]);

// Test layer boundaries
expect(dependencyGraph).toMaintainLayerBoundaries([
  { from: 'UI', to: 'Database', layer: 'presentation', allowed: false },
  { from: 'UI', to: 'Service', layer: 'presentation', allowed: true }
]);
```

### Migration Matchers

```typescript
// Test backward compatibility
expect(newImplementation).toBeBackwardCompatible(oldImplementation);

// Test API compatibility
expect(newAPI).toMaintainApiCompatibility(oldAPI, [
  { method: 'processGraph', args: [testGraph] },
  { method: 'validateSchema', args: [testSchema] }
]);
```

### Accessibility Matchers

```typescript
// Test accessibility standards
expect(component).toMeetAccessibilityStandards('AA');

// Test ARIA attributes
expect(component).toHaveProperAriaAttributes();
```

### Collaboration Matchers

```typescript
// Test collaborative features
expect(collaborativeComponent).toSupportCollaborativeEditing();

// Test conflict resolution
expect(conflictResolver).toHandleConflictsCorrectly([
  {
    name: 'simultaneous edit',
    operations: [
      { user: 'user1', operation: 'update', data: { value: 'A' } },
      { user: 'user2', operation: 'update', data: { value: 'B' } }
    ],
    expectedResolution: { value: 'B' } // Later timestamp wins
  }
]);
```

## Integration with Existing Testing Infrastructure

The testing utilities integrate seamlessly with the existing Epic 18 testing infrastructure:

### With Test Fixtures

```typescript
import { TestEnvironmentManager } from '../tests/utils';
import { TestFixtureManager } from '../tests/infrastructure';

const env = await TestEnvironmentManager.createEnvironment('integration-test', {
  seed: 'test-seed-123'
});

// Fixtures are automatically available in environment
const presenceData = env.fixtures.get('collaboration-multi-user-presence');
const conflictScenarios = env.fixtures.get('collaboration-conflict-scenarios');
```

### With Testing Framework

```typescript
import {
  TestEnvironmentManager,
  PerformanceTestingUtils
} from '../tests/utils';
import { TestingFramework } from '../tests/infrastructure';

const framework = new TestingFramework({
  environment: 'integration',
  categories: ['performance', 'migration']
});

// Use utilities within framework tests
framework.addTest('performance-benchmark', async () => {
  const measurement = await PerformanceTestingUtils.measureExecution(
    () => framework.executeTest('core-functionality'),
    5
  );

  expect(measurement.averageTime).toBeLessThan(1000);
});
```

## Best Practices

### 1. Environment Management

```typescript
// Always use proper cleanup
afterEach(async () => {
  await TestEnvironmentManager.cleanupAll();
});

// Use descriptive environment names
const env = await TestEnvironmentManager.createEnvironment(
  'user-authentication-integration-test',
  config
);
```

### 2. Performance Testing

```typescript
// Use appropriate iteration counts
const lightTest = await PerformanceTestingUtils.measureExecution(func, 3);
const thoroughTest = await PerformanceTestingUtils.measureExecution(func, 20);

// Set realistic performance budgets
expect(metrics).toMeetPerformanceBudget({
  loadTime: 3000, // 3 seconds is reasonable for complex operations
  renderTime: 16, // 60fps = ~16ms per frame
  memoryUsage: 50 // 50MB limit
});
```

### 3. Migration Testing

```typescript
// Test both forward and backward migrations
const forwardResult = await MigrationTestHelper.testMigrationPath(
  'forward-migration',
  forwardSteps,
  initialState
);

const backwardResult = await MigrationTestHelper.testMigrationPath(
  'backward-migration',
  backwardSteps,
  forwardResult.finalState
);

expect(backwardResult.finalState).toEqual(initialState);
```

### 4. Mock Data

```typescript
// Use deterministic data for reproducible tests
const fixtures = new TestFixtureManager('deterministic-seed');

// Create realistic but minimal data
const minimalUser = MockDataUtils.createMockUser({
  name: 'Test User',
  role: 'user'
  // Only include fields needed for test
});
```

## Troubleshooting

### Common Issues

1. **Environment cleanup errors**: Ensure `TestEnvironmentManager.cleanupAll()` is called in `afterEach`
2. **Performance test variability**: Use multiple iterations and reasonable thresholds
3. **Mock data inconsistency**: Use consistent seeds for deterministic results
4. **Migration test failures**: Verify rollback functions properly restore state

### Debugging

```typescript
// Enable verbose logging
const env = await TestEnvironmentManager.createEnvironment('debug-env', {
  seed: 'debug-seed',
  timeout: 30000 // Longer timeout for debugging
});

// Use performance benchmarks for detailed timing
const benchmark = PerformanceTestingUtils.createBenchmark('debug-benchmark');
const timer = benchmark.start('problematic-operation');
problematiOperation();
const duration = timer.end();

console.log(`Operation took ${duration}ms`);
```

This comprehensive testing utility suite provides everything needed to thoroughly test Epic 18's refactoring and modernization efforts while maintaining high quality and reliability standards.
