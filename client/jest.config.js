/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^reactflow$': '<rootDir>/__mocks__/reactflow.tsx',
    '@pkgr/core': '<rootDir>/__mocks__/@pkgr/core.js',
    'synckit': '<rootDir>/__mocks__/synckit.js'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }],
    '^.+\\.jsx?$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react'
      ],
      plugins: ['@babel/plugin-transform-runtime']
    }]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(spec|test).[tj]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(reactflow|@reactflow|@pkgr|synckit)/)',
  ],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
