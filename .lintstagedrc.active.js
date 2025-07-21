module.exports = {
  // TypeScript and TSX files - very permissive linting, no auto-fix to prevent corruption
  '*.{ts,tsx}': [
    'eslint --max-warnings 200', // Extremely permissive - allow up to 200 warnings
    'prettier --write --ignore-unknown'
  ],
  
  // JavaScript and JSX files - more permissive linting
  '*.{js,jsx}': [
    'eslint --fix --max-warnings 100', // Allow up to 100 warnings without failing
    'prettier --write --ignore-unknown'
  ],
  
  // JSON files
  '*.json': [
    'prettier --write --ignore-unknown'
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write --ignore-unknown'
  ],
  
  // YAML files
  '*.{yml,yaml}': [
    'prettier --write --ignore-unknown'
  ],
  
  // CSS and SCSS files
  '*.{css,scss}': [
    'prettier --write --ignore-unknown'
  ],
  
  // Special handling for test files - no auto-fix to prevent corruption
  '*.{test,spec}.{ts,tsx,js,jsx}': [
    'eslint --max-warnings 500', // Extremely permissive for test files
    'prettier --write --ignore-unknown'
  ],
  
  // Auto-generated files - only format, no linting
  'src/auto-*.js': [
    'prettier --write --ignore-unknown'
  ],
  
  'src/monitor-*.js': [
    'prettier --write --ignore-unknown'
  ],
  
  // Security-critical files need validation but allow warnings
  '**/runtime/expression-evaluator.ts': [
    'eslint --fix --max-warnings 5',
    'prettier --write --ignore-unknown'
  ],
  
  '**/runtime/ast-node-whitelist.ts': [
    'eslint --fix --max-warnings 5',
    'prettier --write --ignore-unknown'
  ],
  
  '**/validation.ts': [
    'eslint --fix --max-warnings 5',
    'prettier --write --ignore-unknown'
  ]
};