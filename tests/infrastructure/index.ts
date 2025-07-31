/**
 * PromptSpaghetti Testing Infrastructure
 * Epic 18 - Implement testing infrastructure
 * Task: E18-1753114562510-5E3421
 *
 * Comprehensive testing infrastructure providing frameworks, utilities,
 * data generators, fixtures, and test orchestration.
 */

// Core Testing Framework
export {
  default as TestingFramework,
  TestEnvironment,
  TestCategory,
  TestSuite,
  TestCase,
  TestUtilities,
  TestReporter,
} from './TestingFramework';

export type {
  TestResult,
  AssertionResult,
  CoverageData,
  TestSuiteConfig,
  TestContext,
  TestReport,
} from './TestingFramework';

// Test Data Generators
export {
  BaseTestDataGenerator,
  GraphDataGenerator,
  UserDataGenerator,
  APIDataGenerator,
  PerformanceDataGenerator,
} from './TestDataGenerators';

export type {
  GeneratorOptions,
  GraphGeneratorOptions,
  UserGeneratorOptions,
  APIGeneratorOptions,
} from './TestDataGenerators';

// Test Fixtures and Management
export { default as TestFixtureManager, TestDatabaseManager, TestEnvironmentManager } from './TestFixtures';

export type { TestFixture, FixtureOptions } from './TestFixtures';

// Test Harness (Main Orchestrator)
export { default as TestHarness } from './TestHarness';

export type { TestHarnessConfig, TestExecutionPlan, TestSuiteDefinition, TestDefinition } from './TestHarness';

// Version and Metadata
export const TESTING_INFRASTRUCTURE_VERSION = '1.0.0';
export const EPIC_TASK_ID = 'E18-1753114562510-5E3421';

/**
 * Quick setup helper for common testing scenarios
 */
export const createTestHarness = (config?: Partial<Record<string, unknown>>) => {
  const TestHarness = require('./TestHarness').default;
  return new TestHarness(config);
};

/**
 * Quick setup helper for test data generation
 */
export const createTestGenerators = (seed?: string) => {
  const {
    GraphDataGenerator,
    UserDataGenerator,
    APIDataGenerator,
    PerformanceDataGenerator,
  } = require('./TestDataGenerators');

  return {
    graph: new GraphDataGenerator(seed),
    user: new UserDataGenerator(seed),
    api: new APIDataGenerator(seed),
    performance: new PerformanceDataGenerator(seed),
  };
};

/**
 * Quick setup helper for test fixtures
 */
export const createTestFixtures = (seed?: string) => {
  const TestFixtureManager = require('./TestFixtures').default;
  return new TestFixtureManager(seed);
};

/**
 * Comprehensive testing infrastructure summary
 */
export const INFRASTRUCTURE_INFO = {
  version: TESTING_INFRASTRUCTURE_VERSION,
  taskId: EPIC_TASK_ID,
  components: {
    framework: 'Core test execution engine with suite management',
    generators: 'Deterministic data generation for repeatable tests',
    fixtures: 'Pre-configured test data and scenarios',
    harness: 'Comprehensive test orchestration and management',
  },
  features: {
    environments: ['unit', 'integration', 'e2e', 'performance', 'security'],
    categories: ['engine', 'frontend', 'backend', 'api', 'ui', 'workflow', 'accessibility'],
    dataTypes: ['graph', 'user', 'api', 'performance', 'security'],
    reporting: ['coverage', 'performance', 'security', 'comprehensive'],
  },
  capabilities: {
    deterministicTesting: 'Seeded generators ensure reproducible results',
    performanceBenchmarking: 'Built-in performance testing and monitoring',
    securityTesting: 'Comprehensive security validation framework',
    eventDriven: 'Event-based architecture for extensibility',
    multiEnvironment: 'Support for different testing environments',
    comprehensiveReporting: 'Detailed reports with coverage and metrics',
  },
} as const;

export default {
  TestingFramework,
  TestHarness,
  TestFixtureManager,
  createTestHarness,
  createTestGenerators,
  createTestFixtures,
  INFRASTRUCTURE_INFO,
};
