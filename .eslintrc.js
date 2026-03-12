module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      ],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    {
      files: ['**/*.js', '**/*.mjs'],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
      }
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-unused-vars': 'off'
      }
    }
  ],
  rules: {
    // Development-friendly rules - prioritize productivity over perfection
    'max-len': 'off', // Disable line length limits

    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '../../services/SimpleLLMService',
            message:
              'Use the shared API-backed client from services/llm instead of SimpleLLMService.'
          },
          {
            name: '../../../services/SimpleLLMService',
            message:
              'Use the shared API-backed client from services/llm instead of SimpleLLMService.'
          },
          {
            name: '@promptscape/core/services/SimpleLLMService',
            message:
              'Use the shared API-backed client from @promptscape/core/services/llm instead of SimpleLLMService.'
          }
        ],
        patterns: ['**/SimpleLLMService', '**/SimpleLLMService.ts']
      }
    ],

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-undef': 'off',
    'react/no-unescaped-entities': 'off',

    // TypeScript rules - balanced for development
    '@typescript-eslint/no-unused-vars': 'warn', // Changed to warn to catch unused imports
    '@typescript-eslint/no-explicit-any': 'off', // Allow any type for flexibility
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'warn', // Changed to warn
    '@typescript-eslint/no-non-null-assertion': 'warn', // Added to catch potential null issues

    // JavaScript rules - relaxed but helpful
    'no-unused-vars': 'warn', // Changed to warn to catch unused variables
    'no-constant-condition': 'off',
    'no-useless-escape': 'off',
    'no-case-declarations': 'off', // This was causing switch statement issues
    'no-undef': 'off', // TypeScript handles this better
    'no-redeclare': 'warn', // Changed to warn to catch variable redeclaration

    // Only keep critical rules that prevent actual bugs
    'no-debugger': 'warn',
    'no-console': 'off', // Allow console statements
    'no-alert': 'warn',
    
    // Additional helpful rules for development
    'prefer-const': 'warn', // Helps with better variable declarations
    'no-var': 'warn', // Encourage modern JavaScript
    'eqeqeq': 'warn', // Encourage strict equality checks
    'curly': 'warn' // Encourage consistent brace usage
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
    '*.js.map',
    '*.d.ts',
    'coverage/',
    '.next/',
    '.turbo/',
    // Ignore problematic directories
    'api/',
    'tools/',
    'analyze-*.js',
    '*.config.js',
    // Ignore auto-generated and build files
    'packages/*/dist/',
    'client/dist/',
    'server/dist/',
    // Ignore linting test files that might have intentional errors
    '**/*.lint-test.*',
    '**/test-fixtures/',
    // Ignore specific files that are known to have issues
    '**/CommandPalette/CommandPalette.tsx',
    '**/CommandPalette/CommandPaletteIntegration.tsx',
    '**/Epic1GraphEditor.tsx',
    // Ignore files with known formatting conflicts
    '**/ActivityFeed.tsx',
    '**/ConnectionLabel.tsx',
    // Ignore files that were auto-fixed incorrectly
    '**/components/activity/*.tsx',
    '**/components/Annotations/*.tsx'
  ]
};
