/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.(test|spec).ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/../../../../../tests/utils/sharedTestSetup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  clearMocks: true
};
