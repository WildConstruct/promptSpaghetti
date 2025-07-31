module.exports = {
  // TypeScript and TSX files - more permissive linting
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings 10', // Allow up to 10 warnings without failing
    'prettier --write --ignore-unknown',
  ],

  // JavaScript and JSX files - more permissive linting
  '*.{js,jsx}': [
    'eslint --fix --max-warnings 5', // Allow up to 5 warnings without failing
    'prettier --write --ignore-unknown',
  ],

  // JSON files
  '*.json': ['prettier --write --ignore-unknown'],

  // Markdown files
  '*.md': ['prettier --write --ignore-unknown'],

  // YAML files
  '*.{yml,yaml}': ['prettier --write --ignore-unknown'],

  // CSS and SCSS files
  '*.{css,scss}': ['prettier --write --ignore-unknown'],

  // Special handling for test files - auto-fixed by pre-commit
  '*.{test,spec}.{ts,tsx,js,jsx}': [
    'eslint --fix --max-warnings 20', // Should be clean after auto-fixing
    'prettier --write --ignore-unknown',
  ],

  // Auto-generated files - only format, no linting
  'src/auto-*.js': ['prettier --write --ignore-unknown'],

  'src/monitor-*.js': ['prettier --write --ignore-unknown'],

  // Security-critical files need validation but allow warnings
  '**/runtime/expression-evaluator.ts': ['eslint --fix --max-warnings 5', 'prettier --write --ignore-unknown'],

  '**/runtime/ast-node-whitelist.ts': ['eslint --fix --max-warnings 5', 'prettier --write --ignore-unknown'],

  '**/validation.ts': ['eslint --fix --max-warnings 5', 'prettier --write --ignore-unknown'],
};
