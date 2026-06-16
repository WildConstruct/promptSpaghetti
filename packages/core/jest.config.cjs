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
  // The advanced-node tier (advanced.ts, io-system.ts, Conditional/Sequential/
  // Markov/WeightedAdvanced) is intentionally parked off the product schema
  // surface (see graphSchema.ts and docs/engine-unification-design.md). Its
  // broken, never-run test suites were removed in the forensic cleanup; the
  // parked source modules remain. Re-add testPathIgnorePatterns here only if
  // those suites are revived.
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
    ],
    // Down-level the ESM-only .js deps allowlisted below (react-dnd ships
    // `export ...` that jest would otherwise choke on with "Unexpected token
    // 'export'"). allowJs lets ts-jest transpile them to CJS.
    '^.+\\.js$': [
      'ts-jest',
      {
        diagnostics: false,
        babelConfig: false,
        tsconfig: {
          allowJs: true,
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
