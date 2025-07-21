# Testing Best Practices Guide

## Overview

This document establishes testing best practices for the PromptSpaghetti project, providing guidelines, patterns, and examples for writing effective, maintainable tests across all components and layers of the system.

## 1. General Testing Principles

### The Testing Pyramid

```
    🔺 E2E Tests (5%)
   /                \
  🔹 Integration (20%)
 /                   \
🔷 Unit Tests (75%)
```

**Unit Tests (75%)**
- Test individual functions, methods, and components in isolation
- Fast execution (< 100ms per test)
- No external dependencies
- High coverage of edge cases and error conditions

**Integration Tests (20%)**
- Test component interactions and data flow
- Include database, API, and service integrations
- Moderate execution time (< 1s per test)
- Focus on critical user flows

**E2E Tests (5%)**
- Test complete user journeys
- Include UI, API, and database interactions
- Slower execution (< 10s per test)
- Focus on smoke tests and critical paths

### Testing Mindset

**Write Tests First (TDD)**
```typescript
// 1. Write failing test
describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    const result = calculateTotal(100, 0.08);
    expect(result).toBe(108);
  });
});

// 2. Write minimal implementation
export function calculateTotal(amount: number, taxRate: number): number {
  return amount + (amount * taxRate);
}

// 3. Refactor while keeping tests green
```

**Test Behavior, Not Implementation**
```typescript
// ❌ Testing implementation details
it('should call setLoading with true', () => {
  const setLoading = jest.fn();
  render(<Component setLoading={setLoading} />);
  expect(setLoading).toHaveBeenCalledWith(true);
});

// ✅ Testing behavior
it('should show loading indicator while fetching data', async () => {
  render(<Component />);
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});
```

## 2. Unit Testing Best Practices

### Test Structure (AAA Pattern)

```typescript
describe('Graph Validation', () => {
  it('should validate graph with connected nodes', () => {
    // Arrange
    const graph: Graph = {
      nodes: [
        { id: 'node1', type: 'WeightedChoice', choices: [{ value: 'A', weight: 1 }] },
        { id: 'node2', type: 'Output', template: '{{node1}}' }
      ],
      edges: [
        { id: 'edge1', source: 'node1', target: 'node2' }
      ]
    };
    
    // Act
    const result = validateGraph(graph);
    
    // Assert
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Descriptive Test Names

```typescript
// ❌ Vague test names
it('should work', () => {});
it('should handle error', () => {});
it('should validate input', () => {});

// ✅ Descriptive test names
it('should return sum when given positive numbers', () => {});
it('should throw error when division by zero', () => {});
it('should validate email format and reject invalid addresses', () => {});
```

### Test Data Management

```typescript
// ❌ Inline test data
it('should execute graph correctly', () => {
  const graph = {
    nodes: [
      { id: 'n1', type: 'WeightedChoice', choices: [{ value: 'Hello', weight: 1 }] },
      { id: 'n2', type: 'WeightedChoice', choices: [{ value: 'World', weight: 1 }] },
      { id: 'output', type: 'Output', template: '{{n1}} {{n2}}' }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'output' }
    ]
  };
  // ... test continues
});

// ✅ Reusable test data builders
const GraphBuilder = {
  simple: () => ({
    nodes: [
      TestNodeBuilder.weightedChoice('n1', [{ value: 'Hello', weight: 1 }]),
      TestNodeBuilder.output('output', '{{n1}}')
    ],
    edges: [
      TestEdgeBuilder.connect('n1', 'output')
    ]
  }),
  
  complex: () => ({
    nodes: [
      TestNodeBuilder.weightedChoice('choice1', [
        { value: 'Option A', weight: 2 },
        { value: 'Option B', weight: 1 }
      ]),
      TestNodeBuilder.variable('var1', 'testValue'),
      TestNodeBuilder.output('output', '{{choice1}} - {{var1}}')
    ],
    edges: [
      TestEdgeBuilder.connect('choice1', 'output'),
      TestEdgeBuilder.connect('var1', 'output')
    ]
  })
};

it('should execute simple graph correctly', () => {
  const graph = GraphBuilder.simple();
  // ... test continues
});
```

### Mock and Stub Best Practices

```typescript
// ✅ Mock external dependencies
describe('GraphExecutionService', () => {
  let mockDatabase: jest.Mocked<DatabaseService>;
  let mockLogger: jest.Mocked<Logger>;
  let service: GraphExecutionService;
  
  beforeEach(() => {
    mockDatabase = createMockDatabase();
    mockLogger = createMockLogger();
    service = new GraphExecutionService(mockDatabase, mockLogger);
  });
  
  it('should log execution time', async () => {
    // Arrange
    const graph = GraphBuilder.simple();
    mockDatabase.saveExecution.mockResolvedValue({ id: 'exec123' });
    
    // Act
    await service.executeGraph(graph);
    
    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Graph execution completed'),
      expect.objectContaining({
        executionTime: expect.any(Number)
      })
    );
  });
});

// ✅ Restore mocks after tests
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
```

## 3. Integration Testing Best Practices

### Database Integration Tests

```typescript
describe('Graph Storage Integration', () => {
  let testDb: Database;
  let repository: GraphRepository;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
    repository = new GraphRepository(testDb);
  });
  
  afterAll(async () => {
    await testDb.close();
  });
  
  beforeEach(async () => {
    await testDb.clear(); // Clean slate for each test
  });
  
  it('should persist and retrieve graph with all relationships', async () => {
    // Arrange
    const graph = GraphBuilder.complex();
    
    // Act
    const savedGraph = await repository.save(graph);
    const retrievedGraph = await repository.findById(savedGraph.id);
    
    // Assert
    expect(retrievedGraph).toMatchObject(graph);
    expect(retrievedGraph.nodes).toHaveLength(graph.nodes.length);
    expect(retrievedGraph.edges).toHaveLength(graph.edges.length);
  });
});
```

### API Integration Tests

```typescript
describe('Graph API Integration', () => {
  let app: Application;
  let request: supertest.SuperTest<supertest.Test>;
  
  beforeAll(async () => {
    app = await createTestApp();
    request = supertest(app);
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('POST /graphs/execute', () => {
    it('should execute valid graph and return results', async () => {
      // Arrange
      const graph = GraphBuilder.simple();
      
      // Act
      const response = await request
        .post('/graphs/execute')
        .send({ graph })
        .expect(200);
      
      // Assert
      expect(response.body).toMatchObject({
        success: true,
        results: expect.arrayContaining([
          expect.stringMatching(/Hello/)
        ]),
        metadata: expect.objectContaining({
          executionTime: expect.any(Number),
          nodeCount: graph.nodes.length
        })
      });
    });
    
    it('should reject invalid graph with validation errors', async () => {
      // Arrange
      const invalidGraph = { nodes: [], edges: [] };
      
      // Act & Assert
      const response = await request
        .post('/graphs/execute')
        .send({ graph: invalidGraph })
        .expect(400);
      
      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('validation'),
        details: expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            path: expect.any(String)
          })
        ])
      });
    });
  });
});
```

## 4. Component Testing Best Practices

### React Component Tests

```typescript
describe('GraphEditor Component', () => {
  const defaultProps = {
    initialGraph: GraphBuilder.simple(),
    onSave: jest.fn(),
    onExecute: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render graph nodes and connections', () => {
    // Arrange & Act
    render(<GraphEditor {...defaultProps} />);
    
    // Assert
    expect(screen.getByText('n1')).toBeInTheDocument();
    expect(screen.getByText('output')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-wrapper')).toBeInTheDocument();
  });
  
  it('should save graph when save button is clicked', async () => {
    // Arrange
    const onSave = jest.fn();
    render(<GraphEditor {...defaultProps} onSave={onSave} />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Assert
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: expect.any(Array),
          edges: expect.any(Array)
        })
      );
    });
  });
  
  it('should show validation errors for invalid graph', async () => {
    // Arrange
    const invalidGraph = { nodes: [], edges: [] };
    render(<GraphEditor {...defaultProps} initialGraph={invalidGraph} />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: /validate/i }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText(/validation error/i)).toBeInTheDocument();
    });
  });
});
```

### Custom Hook Tests

```typescript
describe('useGraphExecution Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GraphProvider>
      {children}
    </GraphProvider>
  );
  
  it('should execute graph and return results', async () => {
    // Arrange
    const graph = GraphBuilder.simple();
    const { result } = renderHook(() => useGraphExecution(), { wrapper });
    
    // Act
    act(() => {
      result.current.executeGraph(graph);
    });
    
    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.results).toHaveLength(1);
      expect(result.current.error).toBeNull();
    });
  });
  
  it('should handle execution errors gracefully', async () => {
    // Arrange
    const invalidGraph = { nodes: null, edges: null };
    const { result } = renderHook(() => useGraphExecution(), { wrapper });
    
    // Act
    act(() => {
      result.current.executeGraph(invalidGraph);
    });
    
    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.results).toHaveLength(0);
    });
  });
});
```

## 5. Performance Testing Best Practices

### Benchmarking Tests

```typescript
describe('Graph Execution Performance', () => {
  const PERFORMANCE_THRESHOLDS = {
    SMALL_GRAPH: 50,   // ms
    MEDIUM_GRAPH: 200, // ms
    LARGE_GRAPH: 1000  // ms
  };
  
  it('should execute small graph within performance threshold', async () => {
    // Arrange
    const graph = GraphBuilder.small(); // 5 nodes
    
    // Act & Assert
    const { executionTime, result } = await measureExecution(async () => {
      return await executeGraph(graph);
    });
    
    expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SMALL_GRAPH);
    expect(result).toBeDefined();
  });
  
  it('should maintain performance under concurrent load', async () => {
    // Arrange
    const graph = GraphBuilder.medium(); // 20 nodes
    const concurrentExecutions = 10;
    
    // Act
    const promises = Array(concurrentExecutions).fill(0).map(async () => {
      return measureExecution(() => executeGraph(graph));
    });
    
    const results = await Promise.all(promises);
    
    // Assert
    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    expect(avgExecutionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MEDIUM_GRAPH);
    
    // No execution should be more than 2x the average
    const maxExecutionTime = Math.max(...results.map(r => r.executionTime));
    expect(maxExecutionTime).toBeLessThan(avgExecutionTime * 2);
  });
});
```

### Memory Usage Tests

```typescript
describe('Memory Usage', () => {
  it('should not leak memory during repeated executions', async () => {
    // Arrange
    const graph = GraphBuilder.medium();
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Act
    for (let i = 0; i < 100; i++) {
      await executeGraph(graph);
      
      // Force garbage collection every 10 iterations
      if (i % 10 === 0 && global.gc) {
        global.gc();
      }
    }
    
    // Assert
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = finalMemory - initialMemory;
    const acceptableGrowth = 50 * 1024 * 1024; // 50MB
    
    expect(memoryGrowth).toBeLessThan(acceptableGrowth);
  });
});
```

## 6. Error Testing and Edge Cases

### Error Handling Tests

```typescript
describe('Error Handling', () => {
  it('should handle malformed graph gracefully', async () => {
    // Arrange
    const malformedInputs = [
      null,
      undefined,
      {},
      { nodes: null },
      { nodes: [], edges: null },
      { nodes: [{ invalid: 'node' }], edges: [] }
    ];
    
    // Act & Assert
    for (const input of malformedInputs) {
      await expect(executeGraph(input as any))
        .rejects
        .toThrow(/validation|invalid|malformed/i);
    }
  });
  
  it('should handle circular dependencies', () => {
    // Arrange
    const circularGraph = {
      nodes: [
        { id: 'a', type: 'WeightedChoice', choices: [{ value: 'A', weight: 1 }] },
        { id: 'b', type: 'WeightedChoice', choices: [{ value: 'B', weight: 1 }] }
      ],
      edges: [
        { id: 'ab', source: 'a', target: 'b' },
        { id: 'ba', source: 'b', target: 'a' } // Creates cycle
      ]
    };
    
    // Act & Assert
    expect(() => validateGraph(circularGraph))
      .toThrow(/circular|cycle/i);
  });
});
```

### Boundary Value Tests

```typescript
describe('Boundary Values', () => {
  it('should handle empty inputs', () => {
    expect(calculateTotal(0, 0)).toBe(0);
    expect(validateGraph({ nodes: [], edges: [] })).toMatchObject({
      isValid: false,
      errors: expect.arrayContaining([
        expect.stringContaining('empty')
      ])
    });
  });
  
  it('should handle maximum values', () => {
    const largeGraph = GraphBuilder.withNodeCount(1000);
    expect(() => validateGraph(largeGraph)).not.toThrow();
    
    const result = calculateTotal(Number.MAX_SAFE_INTEGER, 0);
    expect(result).toBe(Number.MAX_SAFE_INTEGER);
  });
  
  it('should handle negative values', () => {
    expect(() => calculateTotal(-100, 0.1)).not.toThrow();
    expect(calculateTotal(-100, 0.1)).toBe(-90);
  });
});
```

## 7. Security Testing Best Practices

### Input Sanitization Tests

```typescript
describe('Security - Input Sanitization', () => {
  const maliciousInputs = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '${process.exit(1)}',
    'eval("1+1")',
    '__proto__.polluted = true'
  ];
  
  it('should sanitize malicious input in node templates', () => {
    for (const maliciousInput of maliciousInputs) {
      const node = TestNodeBuilder.output('test', maliciousInput);
      
      expect(() => validateNode(node)).not.toThrow();
      
      const sanitized = sanitizeTemplate(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
    }
  });
  
  it('should prevent code injection in expressions', () => {
    const dangerousExpressions = [
      'eval("process.exit(1)")',
      'this.constructor.constructor("return process")().exit(1)',
      'require("child_process").exec("rm -rf /")'
    ];
    
    for (const expression of dangerousExpressions) {
      expect(() => evaluateExpression(expression, {}))
        .toThrow(/unsafe|forbidden|blocked/i);
    }
  });
});
```

### Authentication Tests

```typescript
describe('Security - Authentication', () => {
  it('should require valid authentication token', async () => {
    const response = await request
      .post('/graphs/execute')
      .send({ graph: GraphBuilder.simple() })
      .expect(401);
    
    expect(response.body.error).toMatch(/authentication|unauthorized/i);
  });
  
  it('should validate token expiration', async () => {
    const expiredToken = createTestToken({ exp: Date.now() / 1000 - 3600 }); // 1 hour ago
    
    const response = await request
      .post('/graphs/execute')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send({ graph: GraphBuilder.simple() })
      .expect(401);
    
    expect(response.body.error).toMatch(/expired|invalid/i);
  });
});
```

## 8. Test Organization and Maintenance

### File Structure

```
tests/
├── unit/                    # Unit tests
│   ├── runtime/            # Runtime engine tests
│   ├── validation/         # Validation tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── api/               # API integration tests
│   ├── database/          # Database integration tests
│   └── services/          # Service integration tests
├── e2e/                   # End-to-end tests
│   ├── user-flows/        # Complete user journey tests
│   └── performance/       # Performance tests
├── fixtures/              # Test data and fixtures
│   ├── graphs/           # Sample graph data
│   ├── users/            # Sample user data
│   └── responses/        # Sample API responses
└── utils/                # Test utilities and helpers
    ├── builders/         # Test data builders
    ├── matchers/         # Custom Jest matchers
    └── helpers/          # Test helper functions
```

### Test Naming Conventions

```typescript
// File naming
ComponentName.test.tsx      // React component tests
ServiceName.test.ts         // Service tests
utils.test.ts              // Utility function tests
ComponentName.integration.test.ts  // Integration tests
UserFlow.e2e.test.ts       // E2E tests

// Test suite naming
describe('ComponentName', () => {           // Component or class
describe('functionName()', () => {         // Function
describe('API: POST /endpoint', () => {    // API endpoint
describe('Integration: Service + DB', () => { // Integration

// Test case naming patterns
it('should [expected behavior] when [condition]', () => {});
it('should [expected behavior] given [input]', () => {});
it('should throw [error] when [invalid condition]', () => {});
```

### Test Documentation

```typescript
/**
 * Tests for the Graph Execution Engine
 * 
 * This test suite covers:
 * - Basic graph execution scenarios
 * - Error handling and edge cases
 * - Performance characteristics
 * - Integration with external services
 * 
 * Performance expectations:
 * - Small graphs (< 10 nodes): < 50ms
 * - Medium graphs (10-50 nodes): < 200ms
 * - Large graphs (50+ nodes): < 1000ms
 * 
 * @see packages/core/runtime/index.ts
 */
describe('Graph Execution Engine', () => {
  /**
   * Test basic execution scenarios with simple graphs
   * Validates that the engine can handle standard use cases
   */
  describe('Basic Execution', () => {
    // Tests here
  });
});
```

## 9. Continuous Improvement

### Test Metrics Tracking

```typescript
// Track test metrics over time
const testMetrics = {
  executionTime: Date.now(),
  testCount: results.numTotalTests,
  passedTests: results.numPassedTests,
  failedTests: results.numFailedTests,
  coverage: {
    statements: results.coverageMap.getCoverageSummary().statements.pct,
    branches: results.coverageMap.getCoverageSummary().branches.pct,
    functions: results.coverageMap.getCoverageSummary().functions.pct,
    lines: results.coverageMap.getCoverageSummary().lines.pct
  },
  slowTests: results.testResults
    .flatMap(r => r.testResults)
    .filter(t => t.duration > 1000)
    .map(t => ({ name: t.fullName, duration: t.duration }))
};

// Store metrics for trend analysis
await storeTestMetrics(testMetrics);
```

### Test Review Checklist

- [ ] Test names clearly describe behavior being tested
- [ ] Tests are independent and can run in any order
- [ ] Test data is representative of real-world scenarios
- [ ] Edge cases and error conditions are covered
- [ ] Performance expectations are documented and validated
- [ ] Security considerations are tested
- [ ] Tests are maintainable and easy to understand
- [ ] Mock usage is appropriate and not over-mocking
- [ ] Test execution is fast and reliable

This comprehensive guide provides the foundation for writing effective tests that ensure code quality, prevent regressions, and support confident deployment of the PromptSpaghetti application.