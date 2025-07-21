# Testing Framework Documentation

## Overview

This document describes the comprehensive testing framework setup for the PromptGraph application. The framework provides a robust, scalable, and maintainable testing infrastructure supporting unit, integration, end-to-end, performance, and cross-browser testing.

## Architecture

### Testing Stack

**Core Frameworks:**
- **Jest**: Primary test runner with TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: End-to-end and cross-browser testing
- **Custom Test Infrastructure**: Advanced testing utilities and workflows

**Additional Tools:**
- **ts-jest**: TypeScript transformation
- **babel-jest**: JavaScript/JSX transformation
- **@testing-library/jest-dom**: Custom DOM matchers
- **@testing-library/user-event**: User interaction simulation

### Test Categories

#### 1. Unit Tests (`tests/unit/`)
- Individual component/function testing
- Isolated business logic validation
- Mock-heavy, fast execution
- Target: 90%+ coverage for core modules

#### 2. Integration Tests (`tests/integration/`)
- Multi-component interaction testing
- API endpoint validation
- Database integration testing
- Service-to-service communication

#### 3. End-to-End Tests (`tests/e2e/`)
- Complete user workflow testing
- Cross-browser compatibility
- Mobile responsiveness
- Real environment validation

#### 4. Performance Tests (`tests/performance/`)
- Load testing and benchmarking
- Memory usage monitoring
- Execution time validation
- Scalability assessment

#### 5. Security Tests (`tests/security/`)
- Authentication/authorization testing
- Input validation testing
- XSS/CSRF protection validation
- Data privacy compliance

## Configuration

### Jest Configuration (`jest.config.js`)

Enhanced configuration supporting:
- **TypeScript Integration**: Full ts-jest support with ESM
- **Coverage Thresholds**: 80% global, 90% core modules
- **Module Mapping**: Path aliases and mock mappings
- **Setup Files**: Global test environment configuration
- **Multi-environment Support**: JSDOM for frontend, Node for backend

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
    'packages/core/': { branches: 90, functions: 90, lines: 90, statements: 90 }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/utils/globalTestSetup.ts'],
  globalSetup: '<rootDir>/tests/utils/globalSetup.js',
  globalTeardown: '<rootDir>/tests/utils/globalTeardown.js'
};
```

### Directory Structure

```
tests/
├── unit/                 # Unit tests
├── integration/         # Integration tests  
├── e2e/                 # End-to-end tests
├── performance/         # Performance benchmarks
├── security/           # Security validation
├── cross-browser/      # Cross-browser tests
├── fixtures/           # Test data and fixtures
├── mocks/              # Mock implementations
└── utils/              # Testing utilities
    ├── testHelpers.ts      # Common test utilities
    ├── mockHelpers.ts      # Mock creation utilities
    ├── testFixtures.ts     # Sample data and fixtures
    ├── globalTestSetup.ts  # Global test environment
    ├── globalSetup.js      # Global setup (before all tests)
    └── globalTeardown.js   # Global cleanup (after all tests)
```

## Testing Utilities

### Test Helpers (`tests/utils/testHelpers.ts`)

Comprehensive utilities for consistent testing:

```typescript
// Enhanced render with providers
export const renderWithProviders = (ui: ReactElement, options?: RenderOptions) => {
  return render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });
};

// User event setup
export const setupUserEvent = () => {
  return userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
};

// Mock data generators
export const createMockGraph = (nodeCount = 3) => {
  // Returns realistic graph structure for testing
};

// Performance measurement
export const measurePerformance = async (fn: () => Promise<void> | void) => {
  const start = performance.now();
  await fn();
  return performance.now() - start;
};
```

### Mock Helpers (`tests/utils/mockHelpers.ts`)

Centralized mock utilities for consistent mocking:

```typescript
// React Flow mocks
export const createMockReactFlowNode = (overrides = {}) => ({
  id: 'mock-node-1',
  type: 'default',
  position: { x: 100, y: 100 },
  data: { label: 'Mock Node' },
  ...overrides,
});

// API response mocks
export const createMockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: jest.fn().mockResolvedValue(data),
});

// Local Storage mock
export const createMockLocalStorage = () => {
  // Returns fully functional localStorage mock
};

// WebSocket mock
export const createMockWebSocket = () => {
  // Returns WebSocket mock with event simulation
};
```

### Test Fixtures (`tests/utils/testFixtures.ts`)

Pre-configured test data for consistent scenarios:

```typescript
// Graph fixtures
export const simpleLinearGraph: TestGraph = {
  nodes: [
    { id: 'start', type: 'WeightedChoice', position: { x: 100, y: 100 }, data: {...} },
    { id: 'end', type: 'Output', position: { x: 300, y: 100 }, data: {...} }
  ],
  edges: [
    { id: 'edge-1', source: 'start', target: 'end' }
  ]
};

// User fixtures
export const testUsers: TestUser[] = [
  {
    id: 'user-1',
    username: 'testuser1', 
    role: 'admin',
    permissions: ['create', 'read', 'update', 'delete']
  }
];

// Performance test data
export const performanceTestData = {
  seeds: [1234, 5678, 9101],
  expectedExecutionTime: {
    small: 50,   // < 10 nodes
    medium: 150, // 10-50 nodes
    large: 500   // 50-200 nodes
  }
};
```

## Test Execution

### NPM Scripts

```json
{
  "test": "jest --coverage",
  "test:unit": "jest --testPathIgnorePatterns=\"tests/(integration|e2e|performance)/\"", 
  "test:integration": "jest tests/integration/",
  "test:e2e": "npm run test:cross-browser",
  "test:performance": "npm run test:performance-only",
  "test:watch": "jest --watch",
  "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
  "test:ci": "jest --ci --coverage --watchAll=false",
  "test:all": "node scripts/run-all-tests.js"
}
```

### Test Runner Scripts

#### Comprehensive Test Runner (`scripts/run-all-tests.js`)

Orchestrates execution of all test suites:

```javascript
class TestRunner {
  async runAll() {
    const suites = [
      ['unit', 'npm run test:unit'],
      ['integration', 'npm run test:integration'], 
      ['e2e', 'npm run test:cross-browser'],
      ['performance', 'npm run test:performance-only']
    ];
    
    for (const [type, command] of suites) {
      await this.runTestSuite(type, command);
    }
    
    this.generateReport();
  }
}
```

#### Setup Script (`scripts/setup-testing-framework.js`)

Automated testing framework initialization:

- Validates dependencies
- Creates directory structure
- Generates utilities and configurations
- Validates setup integrity

### Cross-Browser Testing

Integration with Playwright for comprehensive browser testing:

```typescript
// Browser projects configuration
projects: [
  { name: 'chromium', use: devices['Desktop Chrome'] },
  { name: 'firefox', use: devices['Desktop Firefox'] },
  { name: 'webkit', use: devices['Desktop Safari'] },
  { name: 'mobile-chrome', use: devices['Pixel 5'] },
  { name: 'mobile-safari', use: devices['iPhone 12'] }
]
```

## Testing Patterns

### Unit Testing Pattern

```typescript
describe('GraphValidator', () => {
  let validator: GraphValidator;
  
  beforeEach(() => {
    validator = new GraphValidator();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('validateGraph', () => {
    it('should validate a simple linear graph', () => {
      const graph = fixtures.graphs.simple;
      const result = validator.validateGraph(graph);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect cycles in graph', () => {
      const cyclicGraph = fixtures.graphs.edgeCases.cyclicGraph;
      const result = validator.validateGraph(cyclicGraph);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'CYCLE_DETECTED',
          message: expect.stringContaining('cycle')
        })
      );
    });
  });
});
```

### Component Testing Pattern

```typescript
describe('GraphEditor', () => {
  const mockGraph = fixtures.graphs.simple;
  
  it('should render nodes and edges', () => {
    renderWithProviders(<GraphEditor initialGraph={mockGraph} />);
    
    expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^node-/)).toHaveLength(mockGraph.nodes.length);
  });
  
  it('should handle node creation', async () => {
    const user = setupUserEvent();
    renderWithProviders(<GraphEditor />);
    
    await user.click(screen.getByTestId('palette-WeightedChoice'));
    await user.click(screen.getByTestId('react-flow-canvas'));
    
    expect(screen.getByTestId(/^node-/)).toBeInTheDocument();
  });
});
```

### Integration Testing Pattern

```typescript
describe('Graph Execution API', () => {
  let server: TestServer;
  
  beforeAll(async () => {
    server = new TestServer();
    await server.start();
  });
  
  afterAll(async () => {
    await server.stop();
  });
  
  it('should execute graph and return results', async () => {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        graph: fixtures.graphs.simple,
        seeds: [1234, 5678]
      })
    });
    
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.results).toHaveLength(2);
    expect(data.executionTime).toBeGreaterThan(0);
  });
});
```

### Performance Testing Pattern

```typescript
describe('Large Graph Performance', () => {
  const performanceThresholds = fixtures.performance.expectedExecutionTime;
  
  it('should execute large graphs within time limits', async () => {
    const largeGraph = fixtures.graphs.large(200);
    
    const executionTime = await measurePerformance(async () => {
      await executeGraph(largeGraph, 1234);
    });
    
    expect(executionTime).toBeLessThan(performanceThresholds.large);
  });
  
  it('should not exceed memory thresholds', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    await executeGraph(fixtures.graphs.large(500), 1234);
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(fixtures.performance.memoryThresholds.xlarge);
  });
});
```

## Best Practices

### Test Organization

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Focus on single behavior
3. **Descriptive Test Names**: Clear intent and expectations
4. **Setup/Teardown**: Consistent test isolation
5. **Data-Driven Tests**: Use fixtures and parameterized tests

### Mock Strategy

1. **Mock External Dependencies**: APIs, file system, network
2. **Stub Browser APIs**: localStorage, ResizeObserver, etc.
3. **Mock Time-Dependent Code**: Dates, timers, animations
4. **Avoid Over-Mocking**: Test real implementations where possible
5. **Reset Mocks**: Clean state between tests

### Performance Considerations

1. **Parallel Execution**: Run tests concurrently where safe
2. **Test Isolation**: Prevent test interdependencies
3. **Resource Cleanup**: Properly dispose of test resources
4. **Selective Testing**: Run relevant tests based on changes
5. **CI Optimization**: Efficient test execution in pipelines

## Debugging and Troubleshooting

### Debug Configuration

```json
{
  "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand --no-cache"
}
```

### Common Issues

#### 1. Test Timeouts
```javascript
// Increase timeout for slow operations
jest.setTimeout(30000);

// Or per test
it('slow test', async () => {
  // test implementation
}, 30000);
```

#### 2. Async Testing
```javascript
// Proper async/await usage
it('should handle async operations', async () => {
  await waitFor(() => {
    expect(screen.getByText('Loading complete')).toBeInTheDocument();
  });
});
```

#### 3. Mock Issues
```javascript
// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
```

### Test Debugging Tools

1. **Jest CLI Options**: `--verbose`, `--detectOpenHandles`, `--forceExit`
2. **Debug Mode**: Node inspector integration
3. **Coverage Analysis**: Identify untested code paths
4. **Test Reports**: HTML reports for detailed analysis

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Unit Tests
        run: npm run test:unit
      
      - name: Run Integration Tests  
        run: npm run test:integration
      
      - name: Run E2E Tests
        run: npm run test:cross-browser
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Quality Gates

- **Minimum Coverage**: 80% global, 90% core modules
- **Test Success Rate**: 100% passing tests required
- **Performance Regression**: No degradation beyond 10%
- **Security Tests**: All security tests must pass

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep testing frameworks current
2. **Review Coverage**: Analyze and improve coverage gaps
3. **Performance Monitoring**: Track test execution trends
4. **Flaky Test Detection**: Identify and fix unreliable tests
5. **Documentation Updates**: Keep testing docs current

### Metrics and Monitoring

- **Test Execution Time**: Track and optimize slow tests
- **Coverage Trends**: Monitor coverage improvements/regressions
- **Flakiness Rate**: Identify unstable tests
- **CI/CD Success Rate**: Pipeline reliability metrics

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**: Automated screenshot comparison
2. **Accessibility Testing**: Automated a11y validation
3. **API Contract Testing**: Schema validation and versioning
4. **Chaos Testing**: Resilience validation under failure conditions

### Technology Roadmap

1. **Advanced Mocking**: More sophisticated mock generation
2. **AI-Powered Testing**: Intelligent test case generation
3. **Real Device Testing**: Physical device test lab
4. **Performance Profiling**: Deep performance analysis tools

## Resources

### Documentation Links
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Testing](https://playwright.dev/docs/intro)

### Internal Resources
- [Cross-Browser Testing Guide](./cross-browser-testing.md)
- [Performance Testing Guide](./performance-testing.md)
- [API Testing Standards](./api-testing.md)

### Support
- **Testing Infrastructure**: DevOps Team
- **Framework Issues**: Frontend/Backend Teams
- **Performance Issues**: Performance Team
- **CI/CD Issues**: Platform Team