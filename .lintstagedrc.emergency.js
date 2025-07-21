// Emergency lint-staged configuration - extremely permissive for critical commits
module.exports = {
  // TypeScript files - very high warning thresholds
  '*.{ts,tsx}': [
    'eslint --max-warnings 500 --no-eslintrc --config .eslintrc.emergency.js', // Allow 500 warnings
    'prettier --write --ignore-unknown'
  ],
  
  // JavaScript files - very permissive
  '*.{js,jsx}': [
    'eslint --max-warnings 200 --no-eslintrc --config .eslintrc.emergency.js',
    'prettier --write --ignore-unknown'
  ],
  
  // JSON files - just format, no linting
  '*.json': [
    'prettier --write --ignore-unknown'
  ],
  
  // Markdown files - just format
  '*.md': [
    'prettier --write --ignore-unknown'
  ],
  
  // YAML files - just format
  '*.{yml,yaml}': [
    'prettier --write --ignore-unknown'
  ],
  
  // CSS/SCSS files - just format
  '*.{css,scss}': [
    'prettier --write --ignore-unknown'
  ],
  
  // Test files - extremely permissive
  '*.{test,spec}.{ts,tsx,js,jsx}': [
    'eslint --max-warnings 1000 --no-eslintrc --config .eslintrc.emergency.js',
    'prettier --write --ignore-unknown'
  ]
};