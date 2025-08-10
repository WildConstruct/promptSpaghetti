/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.(test|spec).ts?(x)'],
  setupFilesAfterEnv: [
    '<rootDir>/../../../../jest.setup.js',
    '<rootDir>/../../../../tests/utils/globalTestSetup.ts',
    '<rootDir>/../../../../tests/utils/axeSetup.ts',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^reactflow$': '<rootDir>/../../../../client/__mocks__/reactflow.tsx',
    '^@packages/(.*)$': '<rootDir>/../../../$1',
    '^@client/(.*)$': '<rootDir>/../../../../client/$1',
    '^@server/(.*)$': '<rootDir>/../../../../server/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  clearMocks: true,
};
