/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: [
    '<rootDir>/tests',
    '<rootDir>/components',
    '<rootDir>/runtime',
    '<rootDir>/fileFormats',
    '<rootDir>/hooks'
  ],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: [
    '<rootDir>/runtime/nodes/__tests__/Conditional.test.ts',
    '<rootDir>/runtime/nodes/__tests__/Sequential.test.ts',
    '<rootDir>/runtime/__tests__/io-system.test.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        diagnostics: false,
        babelConfig: false,
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          target: 'ES2020',
          isolatedModules: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    ]
  },
  transformIgnorePatterns: [
    // Keep the ESM allowlist narrow; current core tests still need react-dnd.
    '/node_modules/(?!.*(react-dnd|react-dnd-html5-backend|dnd-core))'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1',
    '^@prompt/asset-browser$': '<rootDir>/tests/mocks/promptAssetBrowser.tsx',
    '^react-markdown$': '<rootDir>/tests/mocks/reactMarkdown.tsx'
  },
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts']
};
