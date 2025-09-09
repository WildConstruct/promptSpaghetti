/**
 * Jest Configuration for Epic 18 Error Scenario Tests
 * Specialized configuration for comprehensive error testing
 */

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  // Test environment and setup
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    '<rootDir>/tests/utils/globalTestSetup.ts',
    '<rootDir>/tests/integration/errorTestSetup.js'
  ],

  // Test discovery
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.ts',
    '<rootDir>/tests/integration/**/*.test.js'
  ],

  // TypeScript support
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: false,
        isolatedModules: true,
        tsconfig: {
          compilerOptions: {
            module: 'commonjs',
            target: 'es2020',
            lib: ['es2020', 'dom'],
            allowJs: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            noEmit: true,
            resolveJsonModule: true,
            isolatedModules: true,
            declaration: false
          }
        }
      }
    ]
  },

  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1'
  },

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage/integration',
  collectCoverageFrom: [
    'server/src/**/*.{ts,js}',
    'packages/*/src/**/*.{ts,js}',
    'client/src/**/*.{ts,js}',
    '!**/*.test.{ts,js}',
    '!**/*.spec.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Higher thresholds for critical error handling code
    './server/src/websocket/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './packages/core/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Test execution
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: '50%', // Use half the available CPU cores
  bail: false, // Continue testing even if some tests fail
  verbose: true,

  // Error handling and reporting
  errorOnDeprecated: true,
  detectLeaks: true, // Detect memory leaks
  detectOpenHandles: true, // Detect open handles that prevent Jest from exiting

  // Reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: '<rootDir>/coverage/integration/html-report',
        filename: 'integration-test-report.html',
        pageTitle: 'Epic 18 Integration Test Report',
        logoImgPath: undefined,
        hideIcon: true,
        expand: true,
        openReport: false,
        includeFailureMsg: true,
        includeSuiteFailure: true
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/coverage/integration',
        outputName: 'junit-integration.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: false,
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        includeConsoleOutput: true
      }
    ]
  ],

  // Global variables for tests
  globals: {
    'ts-jest': {
      useESM: false,
      isolatedModules: true
    },
    __INTEGRATION_TEST_MODE__: true,
    __ERROR_REPORTING_ENABLED__: true
  },

  // Test patterns and ignores
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/coverage/'],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/tests', '<rootDir>'],

  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Snapshot serializer
  snapshotSerializers: [],

  // Watch mode configuration (for development)
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Performance monitoring
  slowTestThreshold: 10, // Warn about tests taking longer than 10 seconds

  // Environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },

  // Custom result processor
  testResultsProcessor: '<rootDir>/tests/integration/testResultProcessor.js'
};
