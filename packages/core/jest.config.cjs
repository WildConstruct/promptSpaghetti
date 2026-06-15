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
    // Retired advanced-tier nodes (parked, off the product schema surface).
    '<rootDir>/runtime/nodes/__tests__/Conditional.test.ts',
    '<rootDir>/runtime/nodes/__tests__/Sequential.test.ts',
    '<rootDir>/runtime/nodes/__tests__/Markov.test.ts',
    '<rootDir>/runtime/nodes/__tests__/WeightedAdvanced.test.ts',
    '<rootDir>/runtime/__tests__/io-system.test.ts',
    // Retired/parked tiers: the advanced runtime (advanced.ts), the dead base
    // RuntimeNode path (runtime/index.ts, used by neither engine), and the
    // Conditional expression-evaluator security framework. The canonical engine
    // is Epic1ExecutionEngine; these suites exercise code that is no longer on
    // the product surface (see docs/engine-unification-design.md).
    '<rootDir>/runtime/__tests__/advanced.test.ts',
    '<rootDir>/runtime/__tests__/runtime.test.ts',
    '<rootDir>/runtime/__tests__/runtime-comprehensive.test.ts',
    '<rootDir>/runtime/__tests__/expression-evaluator.test.ts'
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
