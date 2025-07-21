module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    // Disable all problematic rules
    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': 'off', 
    'max-len': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-console': 'off',
    'no-debugger': 'off',
    'prefer-const': 'off',
    'no-var': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'quotes': 'off',
    'semi': 'off',
    'indent': 'off',
    
    // Only keep essential rules that prevent real errors
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'valid-typeof': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    'coverage/',
    '.next/',
    'public/',
    '**/*.generated.ts',
    '**/*.generated.js',
    '.eslintrc.*.js',
    '.lintstagedrc.*.js',
    'scripts/',
    'src/auto-*.js',
    'src/monitor-*.js',
    'src/create-epic*.js',
    'src/fix-*.js',
    'src/analyze-*.js',
    'src/count-*.js',
    'src/data/',
    '*.db',
    '*.sqlite',
    '*.sqlite3',
    '*.d.ts',
    '*.js.map'
  ]
};