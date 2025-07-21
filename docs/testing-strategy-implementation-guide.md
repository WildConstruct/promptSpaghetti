# Testing Strategy Implementation Guide

## Overview

This guide provides specific implementation instructions for the comprehensive testing approach outlined in `testing-approach.md`. It includes practical examples, code templates, and step-by-step procedures for implementing each aspect of the testing strategy.

## 1. Test Infrastructure Setup

### Jest Configuration Enhancement

```javascript
// jest.config.js - Enhanced configuration
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Test discovery patterns
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}',
    '**/tests/**/*.{test,spec}.{ts,tsx}'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    'server/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],
  
  // Enhanced coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Critical components require higher coverage
    'packages/core/runtime/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'server/src/engine.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    'packages/core/validation/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/setupCustomMatchers.ts'
  ],
  
  // Module mapping for aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/packages/core/src/$1',
    '^@utils/(.*)$': '<rootDir>/tests/utils/$1'
  },
  
  // Test timeout configuration
  testTimeout: 10000, // 10 seconds default
  
  // Reporters configuration
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Results',
      outputPath: 'coverage/test-results.html',
      includeFailureMsg: true
    }],
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml'
    }]
  ],
  
  // Performance monitoring
  maxWorkers: '50%',
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html']
};
```

### Custom Test Harness Setup

```typescript
// tests/harness/TestHarness.ts
import { TestEnvironmentManager, TestDataUtils } from '../utils/TestingUtilities';
import { registerCustomMatchers } from '../utils/CustomMatchers';

export class TestHarness {
  private static initialized = false;
  private static environments: Map<string, any> = new Map();
  
  /**
   * Initialize test harness
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Register custom matchers
    registerCustomMatchers();
    
    // Setup test environments
    await this.setupTestEnvironments();
    
    // Initialize performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup cleanup handlers
    this.setupCleanupHandlers();
    
    this.initialized = true;
  }
  
  /**
   * Setup test environments
   */
  private static async setupTestEnvironments(): Promise<void> {
    // Development environment
    await TestEnvironmentManager.setupEnvironment('development', {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      REDIS_URL: 'redis://localhost:6379/1',
      LOG_LEVEL: 'error'
    });
    
    // CI environment
    await TestEnvironmentManager.setupEnvironment('ci', {
      NODE_ENV: 'test',
      CI: 'true',
      DATABASE_URL: process.env.TEST_DATABASE_URL,
      REDIS_URL: process.env.TEST_REDIS_URL,
      LOG_LEVEL: 'silent'
    });
  }
  
  /**
   * Setup performance monitoring
   */
  private static setupPerformanceMonitoring(): void {
    // Track test execution times
    const originalIt = global.it;
    global.it = function(name: string, fn?: jest.ProvidesCallback, timeout?: number) {
      return originalIt(name, async function(this: any, ...args: any[]) {
        const startTime = process.hrtime.bigint();
        const result = await fn?.apply(this, args);
        const endTime = process.hrtime.bigint();
        
        const executionTime = Number(endTime - startTime) / 1000000; // ms
        
        // Log slow tests
        if (executionTime > 1000) { // > 1 second
          console.warn(`⚠️  Slow test detected: "${name}" took ${executionTime.toFixed(2)}ms`);
        }
        
        return result;
      }, timeout);
    };
  }
  
  /**
   * Setup cleanup handlers
   */
  private static setupCleanupHandlers(): void {
    // Cleanup after all tests
    afterAll(async () => {
      await TestEnvironmentManager.cleanupAll();
    });
    
    // Reset between test suites
    afterEach(async () => {
      // Reset mocks
      jest.clearAllMocks();
      
      // Clear timers
      jest.clearAllTimers();
      
      // Restore original implementations
      jest.restoreAllMocks();
    });
  }
  
  /**
   * Create test suite with standardized setup
   */
  static createTestSuite(name: string, setup: TestSuiteSetup): void {
    describe(name, () => {
      let testData: TestDataUtils;
      
      beforeAll(async () => {
        await this.initialize();
        
        if (setup.environment) {
          await TestEnvironmentManager.setupEnvironment(`${name}-env`, setup.environment);
        }
        
        testData = new TestDataUtils(setup.seed || `${name}-seed`);
      });
      
      beforeEach(async () => {
        if (setup.beforeEach) {
          await setup.beforeEach(testData);
        }
      });
      
      afterEach(async () => {
        if (setup.afterEach) {
          await setup.afterEach(testData);
        }
      });
      
      afterAll(async () => {
        if (setup.environment) {
          await TestEnvironmentManager.cleanupEnvironment(`${name}-env`);
        }
      });
      
      // Execute test definitions
      setup.tests(testData);
    });
  }
}

export interface TestSuiteSetup {
  seed?: string;
  environment?: Record<string, any>;
  beforeEach?: (testData: TestDataUtils) => Promise<void>;
  afterEach?: (testData: TestDataUtils) => Promise<void>;
  tests: (testData: TestDataUtils) => void;
}
```

## 2. Performance Testing Implementation

### Performance Test Framework

```typescript
// tests/performance/PerformanceTestSuite.ts
import { TestHarness } from '../harness/TestHarness';
import { PerformanceTestUtils } from '../utils/TestingUtilities';

export class PerformanceTestSuite {
  /**
   * Create performance test suite
   */
  static createSuite(name: string, config: PerformanceTestConfig): void {
    TestHarness.createTestSuite(`Performance: ${name}`, {
      seed: config.seed,
      environment: config.environment,
      tests: (testData) => {
        describe('Load Testing', () => {
          config.loadTests?.forEach(test => {
            it(test.name, async () => {
              const { result, executionTime, memoryUsage } = await PerformanceTestUtils.measureExecution(
                async () => {
                  const promises = Array(test.concurrency).fill(0).map(() => 
                    test.testFunction(testData)
                  );
                  return await Promise.all(promises);
                }
              );
              
              // Assert performance thresholds
              expect(executionTime).toBeLessThanOrEqual(test.maxExecutionTime);
              expect(memoryUsage.peak).toBeLessThanOrEqual(test.maxMemoryUsage);
              expect(result).toHaveLength(test.concurrency);
            });
          });
        });
        
        describe('Stress Testing', () => {
          config.stressTests?.forEach(test => {
            it(test.name, async () => {
              let failures = 0;
              const results = [];
              
              for (let i = 0; i < test.iterations; i++) {
                try {
                  const { result, executionTime } = await PerformanceTestUtils.measureExecution(
                    () => test.testFunction(testData)
                  );
                  results.push({ result, executionTime, iteration: i });
                } catch (error) {
                  failures++;
                  if (failures > test.maxFailures) {
                    throw new Error(`Too many failures: ${failures}/${i + 1}`);
                  }
                }
              }
              
              // Validate results
              const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
              expect(avgExecutionTime).toBeLessThanOrEqual(test.maxAvgExecutionTime);
              expect(failures).toBeLessThanOrEqual(test.maxFailures);
            });
          });
        });
      }
    });
  }
}

export interface PerformanceTestConfig {
  seed?: string;
  environment?: Record<string, any>;
  loadTests?: LoadTestCase[];
  stressTests?: StressTestCase[];
}

export interface LoadTestCase {
  name: string;
  concurrency: number;
  maxExecutionTime: number; // ms
  maxMemoryUsage: number; // bytes
  testFunction: (testData: any) => Promise<any>;
}

export interface StressTestCase {
  name: string;
  iterations: number;
  maxFailures: number;
  maxAvgExecutionTime: number; // ms
  testFunction: (testData: any) => Promise<any>;
}
```

### Graph Execution Performance Tests

```typescript
// packages/core/__tests__/performance/GraphExecutionPerformance.test.ts
import { PerformanceTestSuite } from '../../../../tests/performance/PerformanceTestSuite';
import { executeGraph } from '../../runtime';
import { Graph } from '../../types';

PerformanceTestSuite.createSuite('Graph Execution', {
  seed: 'graph-perf-42',
  loadTests: [
    {
      name: 'should handle concurrent small graph executions',
      concurrency: 50,
      maxExecutionTime: 1000, // 1 second for 50 concurrent
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      testFunction: async (testData) => {
        const graph: Graph = testData.createMockGraph({
          nodes: [
            { id: 'wc1', type: 'WeightedChoice', choices: [{ value: 'Option A', weight: 1 }] }
          ]
        });
        return await executeGraph(graph);
      }
    },
    {
      name: 'should handle large graph execution under load',
      concurrency: 10,
      maxExecutionTime: 5000, // 5 seconds for 10 concurrent large graphs
      maxMemoryUsage: 500 * 1024 * 1024, // 500MB
      testFunction: async (testData) => {
        const nodes = Array(100).fill(0).map((_, i) => ({
          id: `wc${i}`,
          type: 'WeightedChoice',
          choices: [
            { value: `Option ${i}A`, weight: 1 },
            { value: `Option ${i}B`, weight: 2 }
          ]
        }));
        
        const graph: Graph = testData.createMockGraph({ nodes });
        return await executeGraph(graph);
      }
    }
  ],
  stressTests: [
    {
      name: 'should maintain performance over extended execution',
      iterations: 1000,
      maxFailures: 5, // 0.5% failure rate
      maxAvgExecutionTime: 100, // 100ms average
      testFunction: async (testData) => {
        const graph: Graph = testData.createMockGraph({
          nodes: [
            { id: 'wc1', type: 'WeightedChoice', choices: [{ value: 'Test', weight: 1 }] }
          ]
        });
        return await executeGraph(graph);
      }
    }
  ]
});
```

## 3. Security Testing Implementation

### Security Test Framework

```typescript
// tests/security/SecurityTestSuite.ts
export class SecurityTestSuite {
  /**
   * Create security test suite
   */
  static createSuite(name: string, config: SecurityTestConfig): void {
    TestHarness.createTestSuite(`Security: ${name}`, {
      seed: config.seed,
      environment: config.environment,
      tests: (testData) => {
        describe('Input Validation', () => {
          config.inputValidationTests?.forEach(test => {
            it(`should prevent ${test.name}`, async () => {
              for (const maliciousInput of test.maliciousInputs) {
                await expect(async () => {
                  return test.testFunction(maliciousInput, testData);
                }).rejects.toThrow(test.expectedError);
              }
            });
          });
        });
        
        describe('Authentication & Authorization', () => {
          config.authTests?.forEach(test => {
            it(test.name, async () => {
              const result = await test.testFunction(testData);
              expect(result).toHaveSecurityCompliance();
            });
          });
        });
      }
    });
  }
}

export interface SecurityTestConfig {
  seed?: string;
  environment?: Record<string, any>;
  inputValidationTests?: InputValidationTest[];
  authTests?: AuthSecurityTest[];
}

export interface InputValidationTest {
  name: string;
  maliciousInputs: any[];
  expectedError: string | RegExp;
  testFunction: (input: any, testData: any) => Promise<any>;
}

export interface AuthSecurityTest {
  name: string;
  testFunction: (testData: any) => Promise<any>;
}
```

## 4. Test Data Management

### Comprehensive Test Data Generator

```typescript
// tests/fixtures/TestDataGenerator.ts
export class ComprehensiveTestDataGenerator extends TestDataUtils {
  /**
   * Generate graph test scenarios
   */
  generateGraphScenarios(): Record<TestScenario, Graph> {
    return {
      [TestScenario.SIMPLE_LINEAR]: this.generateSimpleLinearGraph(),
      [TestScenario.COMPLEX_BRANCHING]: this.generateComplexBranchingGraph(),
      [TestScenario.CIRCULAR_DEPENDENCY]: this.generateCircularDependencyGraph(),
      [TestScenario.DEEP_NESTING]: this.generateDeepNestingGraph(),
      [TestScenario.MEMORY_INTENSIVE]: this.generateMemoryIntensiveGraph()
    };
  }
  
  private generateSimpleLinearGraph(): Graph {
    return {
      id: this.generateId('simple-linear'),
      nodes: [
        {
          id: 'start',
          type: 'WeightedChoice',
          choices: [{ value: 'Hello', weight: 1 }]
        },
        {
          id: 'middle',
          type: 'WeightedChoice', 
          choices: [{ value: 'World', weight: 1 }]
        },
        {
          id: 'end',
          type: 'Output',
          template: '{{start}} {{middle}}'
        }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'middle' },
        { id: 'e2', source: 'middle', target: 'end' }
      ]
    };
  }
  
  private generateComplexBranchingGraph(): Graph {
    const nodes = [];
    const edges = [];
    
    // Create branching structure with multiple paths
    for (let i = 0; i < 20; i++) {
      nodes.push({
        id: `branch-${i}`,
        type: 'WeightedChoice',
        choices: [
          { value: `Branch ${i}A`, weight: 1 },
          { value: `Branch ${i}B`, weight: 2 },
          { value: `Branch ${i}C`, weight: 1 }
        ]
      });
      
      if (i > 0) {
        // Connect to previous nodes with branching
        const sourceCount = Math.min(3, i);
        for (let j = 0; j < sourceCount; j++) {
          edges.push({
            id: `e-${i}-${j}`,
            source: `branch-${i - j - 1}`,
            target: `branch-${i}`
          });
        }
      }
    }
    
    nodes.push({
      id: 'output',
      type: 'Output',
      template: 'Result: {{branch-19}}'
    });
    
    edges.push({
      id: 'final-edge',
      source: 'branch-19',
      target: 'output'
    });
    
    return {
      id: this.generateId('complex-branching'),
      nodes,
      edges
    };
  }
  
  private generateMemoryIntensiveGraph(): Graph {
    const nodes = [];
    const edges = [];
    
    // Create a graph with large data structures
    for (let i = 0; i < 500; i++) {
      const largeChoices = Array(100).fill(0).map((_, j) => ({
        value: `Large choice ${i}-${j} with substantial text content that will consume memory`,
        weight: Math.random()
      }));
      
      nodes.push({
        id: `memory-${i}`,
        type: 'WeightedChoice',
        choices: largeChoices
      });
      
      if (i > 0) {
        edges.push({
          id: `mem-edge-${i}`,
          source: `memory-${i - 1}`,
          target: `memory-${i}`
        });
      }
    }
    
    return {
      id: this.generateId('memory-intensive'),
      nodes,
      edges
    };
  }
  
  /**
   * Generate user test data with various roles and permissions
   */
  generateUserScenarios(): Record<string, User> {
    return {
      admin: this.generateUser('admin', ['create', 'read', 'update', 'delete', 'admin']),
      editor: this.generateUser('editor', ['create', 'read', 'update']),
      viewer: this.generateUser('viewer', ['read']),
      guest: this.generateUser('guest', []),
      suspended: this.generateUser('suspended', [], { isActive: false })
    };
  }
  
  private generateUser(role: string, permissions: string[], overrides: any = {}): User {
    return {
      id: this.generateId(role),
      email: this.generateEmail(),
      name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role,
      permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...overrides
    };
  }
}

export enum TestScenario {
  SIMPLE_LINEAR = 'simple-linear',
  COMPLEX_BRANCHING = 'complex-branching',
  CIRCULAR_DEPENDENCY = 'circular-dependency',
  DEEP_NESTING = 'deep-nesting',
  MEMORY_INTENSIVE = 'memory-intensive'
}
```

## 5. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/comprehensive-testing.yml
name: Comprehensive Testing Pipeline

on:
  push:
    branches: [ main, develop, epic-* ]
  pull_request:
    branches: [ main, develop ]

jobs:
  # Pre-flight checks
  preflight:
    runs-on: ubuntu-latest
    outputs:
      should-run-performance: ${{ steps.changes.outputs.performance }}
      should-run-security: ${{ steps.changes.outputs.security }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Detect changes
        id: changes
        run: |
          if git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep -E "(performance|engine|runtime)"; then
            echo "performance=true" >> $GITHUB_OUTPUT
          fi
          if git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep -E "(auth|security|validation)"; then
            echo "security=true" >> $GITHUB_OUTPUT
          fi

  # Unit and Integration Tests
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run static analysis
        run: |
          pnpm lint
          pnpm typecheck
      
      - name: Run unit tests
        run: pnpm test:unit-only
      
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379/1
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-${{ matrix.node-version }}

  # Performance Testing
  performance:
    needs: [preflight, test]
    if: needs.preflight.outputs.should-run-performance == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run performance tests
        run: pnpm test:performance-only
        env:
          PERFORMANCE_THRESHOLD_MULTIPLIER: 1.2 # Allow 20% variance in CI
      
      - name: Analyze performance results
        run: |
          node scripts/analyze-performance-results.js
          cat performance-analysis.json

  # Security Testing
  security:
    needs: [preflight, test]
    if: needs.preflight.outputs.should-run-security == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run security tests
        run: pnpm test:security-scan
      
      - name: Run vulnerability scan
        run: pnpm audit --audit-level high

  # E2E Testing
  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-results
          path: test-results/

  # Quality Gates
  quality-gate:
    needs: [test, performance, security, e2e]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Check test results
        run: |
          if [[ "${{ needs.test.result }}" != "success" ]]; then
            echo "Unit/Integration tests failed"
            exit 1
          fi
          if [[ "${{ needs.performance.result }}" == "failure" ]]; then
            echo "Performance tests failed"
            exit 1
          fi
          if [[ "${{ needs.security.result }}" == "failure" ]]; then
            echo "Security tests failed"
            exit 1
          fi
          if [[ "${{ needs.e2e.result }}" != "success" ]]; then
            echo "E2E tests failed"
            exit 1
          fi
          echo "All quality gates passed ✅"
```

## 6. Test Maintenance and Monitoring

### Test Health Monitoring

```typescript
// scripts/test-health-monitor.ts
export class TestHealthMonitor {
  /**
   * Analyze test execution patterns
   */
  static analyzeTestHealth(testResults: TestResult[]): TestHealthReport {
    const report: TestHealthReport = {
      totalTests: testResults.length,
      passedTests: testResults.filter(r => r.passed).length,
      failedTests: testResults.filter(r => !r.passed).length,
      flakyTests: this.identifyFlakyTests(testResults),
      slowTests: this.identifySlowTests(testResults),
      recommendations: []
    };
    
    // Generate recommendations
    if (report.flakyTests.length > 0) {
      report.recommendations.push(`${report.flakyTests.length} flaky tests detected - investigate and fix`);
    }
    
    if (report.slowTests.length > 0) {
      report.recommendations.push(`${report.slowTests.length} slow tests detected - consider optimization`);
    }
    
    const failureRate = report.failedTests / report.totalTests;
    if (failureRate > 0.05) { // 5% failure rate threshold
      report.recommendations.push(`High failure rate (${(failureRate * 100).toFixed(1)}%) - review test stability`);
    }
    
    return report;
  }
  
  /**
   * Generate test maintenance tasks
   */
  static generateMaintenanceTasks(healthReport: TestHealthReport): MaintenanceTask[] {
    const tasks: MaintenanceTask[] = [];
    
    // Flaky test fixes
    for (const flakyTest of healthReport.flakyTests) {
      tasks.push({
        type: 'fix-flaky-test',
        priority: 'high',
        description: `Fix flaky test: ${flakyTest.name}`,
        test: flakyTest
      });
    }
    
    // Performance optimization
    for (const slowTest of healthReport.slowTests) {
      tasks.push({
        type: 'optimize-test',
        priority: 'medium',
        description: `Optimize slow test: ${slowTest.name} (${slowTest.avgExecutionTime}ms)`,
        test: slowTest
      });
    }
    
    return tasks;
  }
  
  private static identifyFlakyTests(results: TestResult[]): FlakyTest[] {
    const testGroups = new Map<string, TestResult[]>();
    
    // Group results by test name
    for (const result of results) {
      if (!testGroups.has(result.testName)) {
        testGroups.set(result.testName, []);
      }
      testGroups.get(result.testName)!.push(result);
    }
    
    const flakyTests: FlakyTest[] = [];
    
    // Identify tests with inconsistent results
    for (const [testName, testResults] of testGroups) {
      if (testResults.length < 5) continue; // Need multiple runs to detect flakiness
      
      const successRate = testResults.filter(r => r.passed).length / testResults.length;
      
      // Test is flaky if success rate is between 20% and 80%
      if (successRate > 0.2 && successRate < 0.8) {
        flakyTests.push({
          name: testName,
          successRate,
          totalRuns: testResults.length,
          failures: testResults.filter(r => !r.passed).length
        });
      }
    }
    
    return flakyTests;
  }
  
  private static identifySlowTests(results: TestResult[]): SlowTest[] {
    const SLOW_TEST_THRESHOLD = 5000; // 5 seconds
    
    const testGroups = new Map<string, number[]>();
    
    // Group execution times by test name
    for (const result of results) {
      if (!testGroups.has(result.testName)) {
        testGroups.set(result.testName, []);
      }
      testGroups.get(result.testName)!.push(result.executionTime);
    }
    
    const slowTests: SlowTest[] = [];
    
    for (const [testName, executionTimes] of testGroups) {
      const avgExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      
      if (avgExecutionTime > SLOW_TEST_THRESHOLD) {
        slowTests.push({
          name: testName,
          avgExecutionTime,
          maxExecutionTime: Math.max(...executionTimes),
          runCount: executionTimes.length
        });
      }
    }
    
    return slowTests.sort((a, b) => b.avgExecutionTime - a.avgExecutionTime);
  }
}
```

## 7. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Update Jest configuration with enhanced thresholds
- [ ] Implement TestHarness framework
- [ ] Setup custom matchers and utilities
- [ ] Create comprehensive test data generator
- [ ] Establish performance testing baseline

### Phase 2: Advanced Testing (Week 2)
- [ ] Implement security test framework
- [ ] Create load testing infrastructure
- [ ] Setup CI/CD pipeline integration
- [ ] Implement test health monitoring
- [ ] Create test maintenance automation

### Phase 3: Optimization (Week 3)
- [ ] Fine-tune performance thresholds
- [ ] Optimize test execution speed
- [ ] Implement flaky test detection
- [ ] Setup automated reporting
- [ ] Documentation completion

## Success Metrics

- **Coverage**: 85%+ overall, 95%+ critical components
- **Performance**: All tests execute within defined budgets
- **Reliability**: <2% flaky test rate
- **Speed**: Full test suite completes in <10 minutes
- **Maintainability**: Automated test health monitoring active

This implementation guide provides the practical foundation for executing the comprehensive testing approach defined in the main testing strategy document.