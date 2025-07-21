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

export {
  registerCustomMatchers
} from './CustomMatchers';

// Testing framework info
export export 
export } as const;