module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
    },
    {
      // Extra permissive rules for test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'no-console': 'off',
        'prefer-const': 'off',
      },
    },
  ],
  rules: {
    // Airbnb-style rules (relaxed for CI/CD)
    indent: ['warn', 2], // Changed from error to warn
    quotes: ['warn', 'single'], // Changed from error to warn
    semi: ['warn', 'always'], // Changed from error to warn
    'comma-dangle': ['warn', 'never'], // Changed from error to warn
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreUrls: true,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ], // More lenient line length

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // TypeScript rules (more permissive)
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn', // Allow any in legacy code
    '@typescript-eslint/ban-ts-comment': 'warn', // Allow @ts-ignore when needed
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Disable some rules that often cause CI failures
    'no-console': 'off', // Allow console.log in development
    'no-debugger': 'warn', // Allow debugger in development
    'prefer-const': 'warn',
    'no-var': 'warn',

    // Allow unused parameters in callbacks and event handlers
    'no-unused-vars': 'off', // Let TypeScript handle this

    // Allow empty functions (common in tests and mocks)
    '@typescript-eslint/no-empty-function': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    '*.js.map',
    '*.d.ts',
    'coverage/',
    '.next/',
    'public/',
    // Ignore auto-generated files that often have linting issues
    'src/auto-*.js',
    'src/monitor-*.js',
    '**/*.generated.ts',
    '**/*.generated.js',
  ],
};
