/**
 * Comprehensive Testing Framework for PromptSpaghetti
 * Epic 18 - Implement testing infrastructure
 * Task: E18-1753114562510-5E3421
 */

import { EventEmitter } from 'events';
import { fn } from 'jest-mock';
import type { MockedFunction } from 'jest-mock';

type AnyFn = (...args: unknown[]) => unknown;
type DataGenerationType = 'string' | 'number' | 'boolean' | 'array' | 'object';

interface GenerateDataOptions {
  length?: number;
  min?: number;
  max?: number;
  itemType?: DataGenerationType;
  itemOptions?: GenerateDataOptions;
  keys?: string[];
}

export enum TestEnvironment {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

export enum TestCategory {
  ENGINE = 'engine',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  API = 'api',
  UI = 'ui',
  WORKFLOW = 'workflow',
  ACCESSIBILITY = 'accessibility'
}

export interface TestResult {
  id: string;
  name: string;
  category: TestCategory;
  environment: TestEnvironment;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: Error;
  metadata?: Record<string, unknown>;
  assertions?: AssertionResult[];
  coverage?: CoverageData;
}

export interface AssertionResult {
  description: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  error?: string;
}

export interface CoverageData {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
  percentage: number;
}

export interface TestSuiteConfig {
  name: string;
  environment: TestEnvironment;
  category: TestCategory;
  timeout: number;
  retries: number;
  parallel: boolean;
  coverage: boolean;
  fixtures?: string[];
  setup?: string[];
  teardown?: string[];
}

export interface TestContext {
  fixtures: Map<string, unknown>;
  mocks: Map<string, MockedFunction<AnyFn>>;
  utilities: TestUtilities;
  environment: TestEnvironment;
  category: TestCategory;
}

/**
 * Core Testing Framework Class
 * Provides comprehensive testing infrastructure
 */
export class TestingFramework extends EventEmitter {
  private suites: Map<string, TestSuite> = new Map();
  private results: TestResult[] = [];
  private globalConfig: TestSuiteConfig;
  private context: TestContext;

  constructor(config?: Partial<TestSuiteConfig>) {
    super();

    this.globalConfig = {
      name: 'PromptSpaghetti Test Suite',
      environment: TestEnvironment.UNIT,
      category: TestCategory.ENGINE,
      timeout: 10000,
      retries: 0,
      parallel: false,
      coverage: true,
      ...config
    };

    this.context = {
      fixtures: new Map(),
      mocks: new Map(),
      utilities: new TestUtilities(),
      environment: this.globalConfig.environment,
      category: this.globalConfig.category
    };
  }

  /**
   * Register a new test suite
   */
  registerSuite(
    name: string,
    config: Partial<TestSuiteConfig> = {}
  ): TestSuite {
    const suiteConfig = { ...this.globalConfig, ...config, name };
    const suite = new TestSuite(suiteConfig, this.context);

    suite.on('testComplete', (result: TestResult) => {
      this.results.push(result);
      this.emit('testResult', result);
    });

    suite.on('suiteComplete', (results: TestResult[]) => {
      this.emit('suiteComplete', { name, results });
    });

    this.suites.set(name, suite);
    return suite;
  }

  /**
   * Run all registered test suites
   */
  async runAll(): Promise<TestResult[]> {
    this.results = [];
    const promises: Promise<TestResult[]>[] = [];

    for (const [, suite] of this.suites) {
      if (this.globalConfig.parallel) {
        promises.push(suite.run());
      } else {
        const results = await suite.run();
        this.results.push(...results);
      }
    }

    if (this.globalConfig.parallel) {
      const allResults = await Promise.all(promises);
      allResults.forEach(results => this.results.push(...results));
    }

    this.generateReport();
    return this.results;
  }

  /**
   * Run specific test suite
   */
  async runSuite(name: string): Promise<TestResult[]> {
    const suite = this.suites.get(name);
    if (!suite) {
      throw new Error(`Test suite '${name}' not found`);
    }

    const results = await suite.run();
    this.generateReport(results);
    return results;
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(results?: TestResult[]): void {
    const testResults = results || this.results;
    const report = new TestReporter().generate(testResults, this.globalConfig);
    this.emit('reportGenerated', report);
  }

  /**
   * Get test results by category or environment
   */
  getResults(filter?: {
    category?: TestCategory;
    environment?: TestEnvironment;
    status?: 'passed' | 'failed' | 'skipped' | 'pending';
  }): TestResult[] {
    let results = this.results;

    if (filter?.category) {
      results = results.filter(r => r.category === filter.category);
    }
    if (filter?.environment) {
      results = results.filter(r => r.environment === filter.environment);
    }
    if (filter?.status) {
      results = results.filter(r => r.status === filter.status);
    }

    return results;
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.results = [];
    this.emit('resultsCleared');
  }
}

/**
 * Test Suite Implementation
 */
export class TestSuite extends EventEmitter {
  private tests: Map<string, TestCase> = new Map();
  private config: TestSuiteConfig;
  private context: TestContext;
  private setupFunctions: (() => void | Promise<void>)[] = [];
  private teardownFunctions: (() => void | Promise<void>)[] = [];

  constructor(config: TestSuiteConfig, context: TestContext) {
    super();
    this.config = config;
    this.context = context;
  }

  /**
   * Add setup function
   */
  beforeAll(fn: () => void | Promise<void>): void {
    this.setupFunctions.push(fn);
  }

  /**
   * Add teardown function
   */
  afterAll(fn: () => void | Promise<void>): void {
    this.teardownFunctions.push(fn);
  }

  /**
   * Register a test case
   */
  test(
    name: string,
    testFn: (context: TestContext) => void | Promise<void>,
    config?: Partial<TestSuiteConfig>
  ): void {
    const testCase = new TestCase(
      name,
      testFn,
      { ...this.config, ...config },
      this.context
    );

    testCase.on('complete', (result: TestResult) => {
      this.emit('testComplete', result);
    });

    this.tests.set(name, testCase);
  }

  /**
   * Run all tests in this suite
   */
  async run(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    // Run setup
    for (const setup of this.setupFunctions) {
      await setup();
    }

    // Run tests
    for (const testCase of this.tests.values()) {
      const result = await testCase.run();
      results.push(result);
    }

    // Run teardown
    for (const teardown of this.teardownFunctions) {
      await teardown();
    }

    this.emit('suiteComplete', results);
    return results;
  }
}

/**
 * Individual Test Case
 */
export class TestCase extends EventEmitter {
  private name: string;
  private testFn: (context: TestContext) => void | Promise<void>;
  private config: TestSuiteConfig;
  private context: TestContext;

  constructor(
    name: string,
    testFn: (context: TestContext) => void | Promise<void>,
    config: TestSuiteConfig,
    context: TestContext
  ) {
    super();
    this.name = name;
    this.testFn = testFn;
    this.config = config;
    this.context = context;
  }

  /**
   * Run the test case
   */
  async run(): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      id: `${this.config.name}-${this.name}-${Date.now()}`,
      name: this.name,
      category: this.config.category,
      environment: this.config.environment,
      status: 'pending',
      duration: 0,
      assertions: []
    };

    try {
      // Create isolated context for this test
      const testContext: TestContext = {
        ...this.context,
        fixtures: new Map(this.context.fixtures),
        mocks: new Map(this.context.mocks)
      };

      // Run the test with timeout
      await this.runWithTimeout(this.testFn(testContext), this.config.timeout);

      result.status = 'passed';
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error : new Error(String(error));
    } finally {
      result.duration = Date.now() - startTime;
    }

    this.emit('complete', result);
    return result;
  }

  private async runWithTimeout<T>(
    operation: Promise<T> | T,
    timeout: number
  ): Promise<T> {
    const execution = Promise.resolve(operation);
    return Promise.race([
      execution,
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Test timeout after ${timeout}ms`)),
          timeout
        );
      })
    ]);
  }
}

/**
 * Test Utilities Class
 */
export class TestUtilities {
  /**
   * Create a mock function with Jest-like interface
   */
  createMock<T extends AnyFn>(implementation?: T): MockedFunction<T> {
    return fn(implementation) as MockedFunction<T>;
  }

  /**
   * Wait for a specified amount of time
   */
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for a condition to be true
   */
  async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout = 5000,
    interval = 100
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.wait(interval);
    }

    throw new Error(`Timeout: Condition not met within ${timeout}ms`);
  }

  /**
   * Generate random test data
   */
  generateData(
    type: DataGenerationType,
    options: GenerateDataOptions = {}
  ): unknown {
    switch (type) {
      case 'string':
        return this.generateRandomString(options.length ?? 10);
      case 'number':
        return this.generateRandomNumber(options);
      case 'boolean':
        return Math.random() > 0.5;
      case 'array':
        return this.generateArray(options);
      case 'object':
        return this.generateObject(options);
      default:
        return null;
    }
  }

  private generateRandomString(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateRandomNumber(options: GenerateDataOptions): number {
    const min = options.min ?? 0;
    const max = options.max ?? 1000;
    if (max <= min) {
      return min;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateArray(options: GenerateDataOptions): unknown[] {
    const length = options.length ?? 5;
    const itemType = options.itemType ?? 'string';
    const itemOptions: GenerateDataOptions = options.itemOptions ?? {};
    return Array.from({ length }, () =>
      this.generateData(itemType, itemOptions)
    );
  }

  private generateObject(
    options: GenerateDataOptions
  ): Record<string, unknown> {
    const keys = options.keys ?? ['id', 'name', 'value'];
    const obj: Record<string, unknown> = {};
    keys.forEach(key => {
      obj[key] = this.generateData('string');
    });
    return obj;
  }

  /**
   * Assert helper functions
   */
  assert = {
    equal: <T>(actual: T, expected: T, message?: string): AssertionResult => {
      const passed = actual === expected;
      return {
        description: message || `Expected ${actual} to equal ${expected}`,
        passed,
        expected,
        actual,
        error: passed ? undefined : `Expected: ${expected}, Actual: ${actual}`
      };
    },

    deepEqual: (
      actual: unknown,
      expected: unknown,
      message?: string
    ): AssertionResult => {
      const passed = JSON.stringify(actual) === JSON.stringify(expected);
      return {
        description: message || 'Expected deep equality',
        passed,
        expected,
        actual,
        error: passed ? undefined : 'Objects are not deeply equal'
      };
    },

    truthy: (value: unknown, message?: string): AssertionResult => {
      const passed = !!value;
      return {
        description: message || 'Expected value to be truthy',
        passed,
        expected: true,
        actual: value,
        error: passed ? undefined : `Expected truthy value, got: ${value}`
      };
    },

    falsy: (value: unknown, message?: string): AssertionResult => {
      const passed = !value;
      return {
        description: message || 'Expected value to be falsy',
        passed,
        expected: false,
        actual: value,
        error: passed ? undefined : `Expected falsy value, got: ${value}`
      };
    }
  };
}

/**
 * Test Reporter Class
 */
export class TestReporter {
  generate(results: TestResult[], config: TestSuiteConfig): TestReport {
    const totalTests = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    const report: TestReport = {
      summary: {
        total: totalTests,
        passed,
        failed,
        skipped,
        duration: totalDuration,
        passRate: totalTests > 0 ? (passed / totalTests) * 100 : 0
      },
      results,
      config,
      timestamp: new Date(),
      coverage: this.calculateCoverage(results)
    };

    return report;
  }

  private calculateCoverage(results: TestResult[]): CoverageData {
    const coverageResults = results
      .map(r => r.coverage)
      .filter(c => c !== undefined) as CoverageData[];

    if (coverageResults.length === 0) {
      return {
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0,
        percentage: 0
      };
    }

    const totalCoverage = coverageResults.reduce(
      (acc, coverage) => ({
        lines: acc.lines + coverage.lines,
        statements: acc.statements + coverage.statements,
        functions: acc.functions + coverage.functions,
        branches: acc.branches + coverage.branches,
        percentage: acc.percentage + coverage.percentage
      }),
      { lines: 0, statements: 0, functions: 0, branches: 0, percentage: 0 }
    );

    return {
      lines: Math.round(totalCoverage.lines / coverageResults.length),
      statements: Math.round(totalCoverage.statements / coverageResults.length),
      functions: Math.round(totalCoverage.functions / coverageResults.length),
      branches: Math.round(totalCoverage.branches / coverageResults.length),
      percentage: Math.round(totalCoverage.percentage / coverageResults.length)
    };
  }
}

export interface TestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    passRate: number;
  };
  results: TestResult[];
  config: TestSuiteConfig;
  timestamp: Date;
  coverage: CoverageData;
}

export default TestingFramework;
