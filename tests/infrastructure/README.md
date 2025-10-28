# PromptSpaghetti Testing Infrastructure

**Epic 18 - Technical Debt & Refactoring**  
**Task: E18-1753114562510-5E3421 - Implement testing infrastructure**

This comprehensive testing infrastructure provides a robust foundation for testing all aspects of the PromptSpaghetti application, from unit tests to performance benchmarks and security validation.

## 🏗️ Architecture Overview

The testing infrastructure consists of several interconnected components:

- **TestingFramework**: Core test execution engine with suite and case management
- **TestHarness**: Orchestration layer that coordinates all testing components
- **TestDataGenerators**: Deterministic data generation for repeatable tests
- **TestFixtures**: Pre-configured test data and scenarios
- **TestUtilities**: Helper functions and assertion libraries

## 📁 Components

### 1. TestingFramework.ts

Core testing framework providing:

- Test suite registration and management
- Individual test case execution
- Event-driven architecture
- Coverage reporting
- Timeout and retry handling
- Comprehensive assertion utilities

### 2. TestDataGenerators.ts

Deterministic data generators for:

- **GraphDataGenerator**: Creates realistic graph structures with nodes and edges
- **UserDataGenerator**: Generates user profiles, authentication data, and preferences
- **APIDataGenerator**: Creates request/response pairs for API testing
- **PerformanceDataGenerator**: Generates large datasets for performance testing

### 3. TestFixtures.ts

Pre-configured test data including:

- Standard graph patterns (linear, branching, circular)
- User archetypes (admin, regular, deactivated)
- API scenarios (success, failure, rate limits)
- Security test payloads (XSS, SQL injection)
- Performance benchmarks

### 4. TestHarness.ts

Comprehensive test orchestration providing:

- Multi-environment test execution
- Performance benchmarking
- Security testing
- Test environment management
- Database setup and cleanup
- Report generation

## 🚀 Quick Start

### Basic Usage

```typescript
import TestHarness from './tests/infrastructure/TestHarness';
import {
  TestEnvironment,
  TestCategory
} from './tests/infrastructure/TestingFramework';

// Initialize test harness
const harness = new TestHarness({
  environment: TestEnvironment.INTEGRATION,
  categories: [TestCategory.ENGINE, TestCategory.FRONTEND],
  parallel: false,
  coverage: true
});

// Initialize and run tests
await harness.initialize();
const report = await harness.runTests();

console.log(
  `Tests completed: ${report.summary.passed}/${report.summary.total} passed`
);

// Cleanup
await harness.cleanup();
```

### Running Specific Test Categories

```typescript
// Run only engine tests
const engineResults = await harness.runCategory(TestCategory.ENGINE);

// Run performance benchmarks
const benchmarks = await harness.runPerformanceBenchmarks();

// Run security tests
const securityResults = await harness.runSecurityTests();
```

### Using Data Generators

```typescript
import {
  GraphDataGenerator,
  UserDataGenerator
} from './tests/infrastructure/TestDataGenerators';

// Generate test graph
const graphGen = new GraphDataGenerator('my-seed-123');
const graph = graphGen.generateGraph({
  nodeCount: 10,
  edgeCount: 8,
  complexity: 'medium'
});

// Generate test users
const userGen = new UserDataGenerator();
const users = userGen.generateUsers(5, {
  includeAuth: true,
  roles: ['admin', 'user']
});
```

### Using Fixtures

```typescript
import TestFixtureManager from './tests/infrastructure/TestFixtures';

const fixtures = new TestFixtureManager();

// Get predefined fixtures
const simpleGraph = fixtures.get('graph-simple-linear');
const adminUser = fixtures.get('user-admin');
const apiSuccess = fixtures.get('api-auth-success');

// Register custom fixtures
fixtures.register('my-custom-graph', {
  category: 'graph',
  data: { nodes: [...], edges: [...] }
});
```

## 🎯 Test Categories

### Engine Tests (TestCategory.ENGINE)

- Graph validation and execution
- Node type functionality
- Variable management
- Expression evaluation
- Error handling

### Frontend Tests (TestCategory.FRONTEND)

- Component rendering
- User interactions
- State management
- UI responsiveness
- Accessibility

### Backend Tests (TestCategory.BACKEND)

- API endpoint functionality
- Authentication and authorization
- Database operations
- Error responses
- Rate limiting

### Integration Tests (TestCategory.WORKFLOW)

- End-to-end workflows
- Cross-component interactions
- Data flow validation
- User journey testing

### Performance Tests (TestCategory.PERFORMANCE)

- Load testing
- Stress testing
- Memory usage monitoring
- Execution time benchmarks
- Scalability validation

## 🔒 Security Testing

The infrastructure includes comprehensive security testing:

### XSS Protection Testing

```typescript
const securityResults = await harness.runSecurityTests();
console.log(
  `XSS Protection: ${securityResults.xssProtection.protectionRate}% blocked`
);
```

### SQL Injection Testing

```typescript
// Uses predefined SQL injection payloads
const sqlResults = securityResults.sqlInjectionProtection;
console.log(
  `SQL Injection blocked: ${sqlResults.blockedPayloads}/${sqlResults.totalPayloads}`
);
```

### Authentication Security

- Token validation
- Session security
- Password hashing verification
- Brute force protection
- Multi-factor authentication

## 📊 Performance Benchmarking

### Graph Execution Benchmarks

```typescript
const benchmarks = await harness.runPerformanceBenchmarks();

benchmarks.graphExecution.forEach(benchmark => {
  console.log(`${benchmark.nodeCount} nodes: ${benchmark.executionTime}ms`);
});
```

### API Latency Testing

```typescript
benchmarks.apiLatency.forEach(result => {
  console.log(`${result.endpoint}: ${result.avgLatency}ms average`);
});
```

### Memory Usage Monitoring

```typescript
const memory = benchmarks.memoryUsage;
console.log(`Memory: ${memory.baseline}MB baseline, ${memory.peak}MB peak`);
```

## 🔧 Configuration Options

### TestHarnessConfig

```typescript
interface TestHarnessConfig {
  environment: TestEnvironment; // Test environment type
  categories: TestCategory[]; // Categories to test
  parallel: boolean; // Run tests in parallel
  coverage: boolean; // Collect coverage data
  timeout: number; // Test timeout (ms)
  retries: number; // Retry failed tests
  setupDatabase: boolean; // Setup test database
  setupEnvironment: boolean; // Setup test environment
  generateReports: boolean; // Generate test reports
  outputDir: string; // Output directory
}
```

### Environment Types

- `TestEnvironment.UNIT`: Unit testing
- `TestEnvironment.INTEGRATION`: Integration testing
- `TestEnvironment.E2E`: End-to-end testing
- `TestEnvironment.PERFORMANCE`: Performance testing
- `TestEnvironment.SECURITY`: Security testing

## 📈 Reporting

### Test Reports

The infrastructure generates comprehensive reports including:

- Test summary (pass/fail counts, duration)
- Individual test results with timing
- Coverage information
- Performance metrics
- Error details and stack traces

### Example Report Structure

```typescript
{
  summary: {
    total: 45,
    passed: 42,
    failed: 3,
    skipped: 0,
    duration: 15420,
    passRate: 93.33
  },
  results: [...],
  coverage: {
    lines: 87,
    statements: 89,
    functions: 92,
    branches: 84,
    percentage: 88
  },
  timestamp: "2024-01-01T12:00:00Z"
}
```

## 🔄 Event System

The testing infrastructure uses an event-driven architecture:

### Available Events

- `testRunStarted`: Test execution begins
- `testResult`: Individual test completes
- `suiteComplete`: Test suite completes
- `reportGenerated`: Test report created
- `performanceBenchmarksCompleted`: Benchmarks finished
- `securityTestsCompleted`: Security tests finished

### Event Handling Example

```typescript
harness.on('testResult', result => {
  if (result.status === 'failed') {
    console.error(`Test failed: ${result.name}`, result.error);
  }
});

harness.on('reportGenerated', report => {
  console.log(`Tests completed with ${report.summary.passRate}% pass rate`);
});
```

## 🧪 Best Practices

### 1. Use Deterministic Data

Always use seeded generators for reproducible tests:

```typescript
const generator = new GraphDataGenerator('consistent-seed-123');
```

### 2. Isolate Test Data

Use fresh fixtures for each test to avoid interference:

```typescript
beforeEach(async () => {
  await fixtures.reset();
});
```

### 3. Test Categorization

Organize tests by category for better maintainability:

```typescript
// Engine tests focus on core functionality
suite.test('Node Execution', async context => {
  /* ... */
});

// Frontend tests focus on UI behavior
suite.test('Component Rendering', async context => {
  /* ... */
});
```

### 4. Performance Monitoring

Always include performance assertions in critical tests:

```typescript
const startTime = Date.now();
await executeGraph(largeGraph);
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(5000); // Max 5 seconds
```

### 5. Security First

Include security validation in all user-input tests:

```typescript
const xssPayload = '<script>alert("xss")</script>';
const result = await processInput(xssPayload);
expect(result).not.toContain('<script>');
```

## 🛠️ Extending the Framework

### Adding New Generators

```typescript
export class CustomDataGenerator extends BaseTestDataGenerator {
  generateCustomData(options: CustomOptions): CustomData {
    // Implementation
  }
}
```

### Adding New Test Categories

```typescript
export enum TestCategory {
  // ... existing categories
  CUSTOM = 'custom'
}
```

### Adding New Fixtures

```typescript
fixtures.register('custom-scenario', {
  category: 'custom',
  data: {
    /* custom test data */
  },
  metadata: { description: 'Custom test scenario' }
});
```

## 🔍 Integration with Existing Tests

The testing infrastructure is designed to work alongside Jest and existing test files:

```typescript
// In your existing Jest tests
import TestHarness from '../tests/infrastructure/TestHarness';

describe('My Component', () => {
  let harness: TestHarness;

  beforeAll(async () => {
    harness = new TestHarness({ environment: TestEnvironment.UNIT });
    await harness.initialize();
  });

  it('should use test infrastructure', async () => {
    const fixtures = harness['fixtureManager'];
    const testData = fixtures.get('graph-simple-linear');

    // Your test logic using the fixture
    expect(testData).toBeDefined();
  });
});
```

## 📋 Example Test Implementation

See `integration-example.test.ts` for a comprehensive example of how to use all components of the testing infrastructure together.

## 🤝 Contributing

When adding new tests or extending the infrastructure:

1. Follow the established patterns for test organization
2. Use appropriate test categories
3. Include both positive and negative test cases
4. Add performance and security considerations
5. Update documentation for new features
6. Ensure backward compatibility

## 📚 Related Documentation

- [Epic 18 Implementation Plan](../../docs/epic18plan.md)
- [Testing Best Practices](../../docs/testing-guidelines.md)
- [Performance Testing Guide](../../docs/performance-testing.md)
- [Security Testing Framework](../../docs/security-testing.md)

---

This testing infrastructure provides a solid foundation for comprehensive testing across all aspects of the PromptSpaghetti application, ensuring quality, performance, and security standards are maintained as the codebase evolves.
