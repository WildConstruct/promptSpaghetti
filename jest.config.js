/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.(spec|test).ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
    '**/tests/documentation/**/*.(spec|test).ts?(x)',
    '**/tests/infrastructure/**/*.(spec|test).ts?(x)',
    '**/tests/**/*.(spec|test).ts?(x)'
  ],
  testPathIgnorePatterns: ['/node_modules/', 'tests/performance/', '.*\\.spec\\.jsx$', '.*\\.js$'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    'server/src/**/*.{ts,tsx}',
    'tests/infrastructure/**/*.{ts,tsx}',
    'tests/documentation/**/*.{ts,tsx}',
    'tests/utils/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!tests/documentation/**/*.test.ts',
    '!tests/infrastructure/**/*.test.ts'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^reactflow$': '<rootDir>/client/__mocks__/reactflow.tsx',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@client/(.*)$': '<rootDir>/client/$1',
    '^@server/(.*)$': '<rootDir>/server/$1'
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/globalTestSetup.ts',
    // '<rootDir>/tests/utils/mswSetup.ts', // Temporarily disabled
    '<rootDir>/tests/utils/axeSetup.ts',
    '@testing-library/jest-dom'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.jsx$': 'babel-jest'
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './tests/infrastructure/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testTimeout: 15000,
  verbose: true,
  collectCoverage: true
};
