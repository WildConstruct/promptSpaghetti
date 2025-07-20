module.exports = {
  // TypeScript and TSX files
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'pnpm typecheck'
  ],
  
  // JavaScript and JSX files
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  
  // JSON files
  '*.json': [
    'prettier --write'
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write'
  ],
  
  // YAML files
  '*.{yml,yaml}': [
    'prettier --write'
  ],
  
  // CSS and SCSS files
  '*.{css,scss}': [
    'prettier --write'
  ],
  
  // Special handling for test files
  '*.{test,spec}.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    (filenames) => `pnpm test -- --findRelatedTests ${filenames.join(' ')} --passWithNoTests`
  ],
  
  // Security-critical files need extra validation
  '**/runtime/expression-evaluator.ts': [
    'eslint --fix',
    'prettier --write',
    () => 'pnpm test -- --testPathPattern="expression-evaluator" --coverage'
  ],
  
  '**/runtime/ast-node-whitelist.ts': [
    'eslint --fix',
    'prettier --write',
    () => 'pnpm test -- --testPathPattern="ast-node-whitelist" --coverage'
  ],
  
  '**/validation.ts': [
    'eslint --fix',
    'prettier --write',
    () => 'pnpm test -- --testPathPattern="validation" --coverage'
  ]
};