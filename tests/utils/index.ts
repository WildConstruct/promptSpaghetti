/**
 * Testing Utilities Index
 * Central exports for all Epic 18 testing utilities
 */

// Core testing utilities
export * from './TestingUtilities';
export * from './RefactoringTestUtils';
export * from './CustomMatchers';

// Global setup (imported by Jest config)
export * from './globalTestSetup';

// Re-export main classes for convenience
export {
  TestEnvironmentManager,
  ComponentTestingUtils,
  AsyncTestingUtils,
  MockDataUtils,
  PerformanceTestingUtils
} from './TestingUtilities';

export {
  MigrationTestHelper,
  LegacySystemMock,
  RefactoringValidator
} from './RefactoringTestUtils';

export { registerCustomMatchers } from './CustomMatchers';

// Testing framework info
export const TESTING_UTILITIES_VERSION = '1.0.0';
export const EPIC_TASK_ID = 'E18-1753114562451-62A0CC';
