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
    '/node_modules/(?!.*(react-dnd|dnd-core|react-markdown|remark|rehype|unist|mdast|hast|micromark|mdurl|vfile|is-plain-obj|bail|devlop|trough|space-separated-tokens|comma-separated-tokens|property-information|decode-named-character-reference|character-entities|estree-util|html-url-attributes|trim-lines|unified))'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1'
  },
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  watchman: false,
  coverageProvider: 'v8'
};
