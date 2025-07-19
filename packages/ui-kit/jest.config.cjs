/**
 * Jest configuration for UI Kit package
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    '**/?(*.)+(spec|test).(ts|tsx)'
  ],
  
  // Module resolution
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@prompt-spaghetti/graph-core$': '<rootDir>/../graph-core/src'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json'
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  
  // Test environment setup
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  
  // Globals for testing
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Module resolution for CSS and other assets
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  
  // Timer handling
  timers: 'fake',
  
  // Verbose output
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Cache directory
  cacheDirectory: '<rootDir>/node_modules/.cache/jest'
};