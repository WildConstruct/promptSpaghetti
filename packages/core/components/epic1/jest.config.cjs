/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.(test|spec).ts?(x)'],
  setupFilesAfterEnv: [
    '<rootDir>/../../../../jest.setup.js',
    '<rootDir>/../../../../tests/utils/sharedTestSetup.ts',
    '<rootDir>/../../../../tests/utils/axeSetup.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.(js|jsx|mjs)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*(react-dnd|react-dnd-html5-backend|dnd-core|@react-dnd))'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^reactflow$': '<rootDir>/../../../../client/__mocks__/reactflow.tsx',
    '^react-markdown$': '<rootDir>/../../tests/mocks/reactMarkdown.tsx',
    '^react-dnd$': '<rootDir>/../../tests/mocks/reactDnd.tsx',
    '^react-dnd-html5-backend$': '<rootDir>/../../tests/mocks/reactDndHtml5Backend.ts',
    '^@/(.*)$': '<rootDir>/../../$1',
    '^@packages/(.*)$': '<rootDir>/../../../$1',
    '^@client/(.*)$': '<rootDir>/../../../../client/$1',
    '^@server/(.*)$': '<rootDir>/../../../../server/$1'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  clearMocks: true
};
