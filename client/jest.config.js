/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^lz-string$': '<rootDir>/__mocks__/lz-string.cjs',
    '^reactflow$': '<rootDir>/__mocks__/reactflow.tsx',
    '@pkgr/core': '<rootDir>/__mocks__/@pkgr/core.js',
    '^@prompt/asset-browser$': '<rootDir>/__mocks__/promptAssetBrowser.tsx',
    synckit: '<rootDir>/__mocks__/synckit.js',
    '^@promptscape/core$': '<rootDir>/../packages/core/public.ts',
    '^@promptscape/core/(.*)$': '<rootDir>/../packages/core/$1',
    '^@promptscape/core/services/llm$':
      '<rootDir>/../packages/core/services/llm/index.ts',
    '^@promptscape/core/services/psg$':
      '<rootDir>/../packages/core/services/psg/index.ts'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react',
          moduleResolution: 'bundler',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    ],
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-react'
        ],
        plugins: ['@babel/plugin-transform-runtime']
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(spec|test).[tj]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(reactflow|@reactflow|@pkgr|synckit)/)'
  ]
};
