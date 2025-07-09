/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.(spec|test).[tj]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['packages/**/*.{ts,tsx}', 'client/src/**/*.{ts,tsx}', '!**/node_modules/**'],
};
