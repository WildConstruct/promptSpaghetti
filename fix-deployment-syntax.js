#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that have syntax errors
const filesToFix = [
  'client/src/App.tsx',
  'packages/core/components/MenuBar/ProfessionalMenuBar.tsx',
  'packages/core/components/CommandPalette/CommandPalette.tsx',
  'packages/core/components/epic1/onboarding/OnboardingIntegration.tsx',
  'packages/core/components/epic1/onboarding/__tests__/KeyboardShortcuts.test.tsx',
  'packages/core/components/epic1/examples/KeyboardShortcutExample.tsx'
];

function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix arrow function syntax errors introduced by linter
    // Fix patterns like: () => ()  to  () => (
    content = content.replace(/\(\) => \(\)/g, '() => (');
    
    // Fix patterns like: => {,  to  => {
    content = content.replace(/=> \{,/g, '=> {');
    
    // Fix patterns like: = {,  to  = {
    content = content.replace(/= \{,/g, '= {');
    
    // Fix patterns like: ) => {,  to  ) => {
    content = content.replace(/\) => \{,/g, ') => {');
    
    // Fix patterns like: });)  to  });
    content = content.replace(/\}\);\)/g, '});');
    
    // Fix patterns like: };)  to  };
    content = content.replace(/\};\)/g, '};');
    
    // Fix patterns like: }))  to  })
    content = content.replace(/\}\)\)/g, '})');
    
    // Fix patterns like: => ;)  to  =>
    content = content.replace(/=> ;\)/g, '=>');
    
    // Fix patterns like: { )  to  {
    content = content.replace(/\{ \)/g, '{');
    
    // Fix patterns like: ({)  to  ({
    content = content.replace(/\(\{\)/g, '({');
    
    // Fix extra closing parens
    content = content.replace(/\)\s*\n\s*\)/g, ')');
    
    // Fix missing commas in objects
    content = content.replace(/(\w+):\s*(['"][\w\s-]+['"]|\d+|true|false)\s*\n\s*(\w+):/g, '$1: $2,\n  $3:');
    
    // Fix return statements with JSX
    content = content.replace(/return \(\)\s*\n\s*</g, 'return (\n    <');
    
    // Fix callback patterns
    content = content.replace(/useCallback\(;?\)/g, 'useCallback(');
    
    // Fix test patterns
    content = content.replace(/test\('([^']+)',\s*\(\)\s*=>\s*\{/g, "test('$1', () => {");
    content = content.replace(/describe\('([^']+)',\s*\(\)\s*=>\s*\{/g, "describe('$1', () => {");
    
    // Fix render patterns
    content = content.replace(/render\(\)\s*\n\s*</g, 'render(\n    <');
    
    // Fix expect patterns
    content = content.replace(/expect\(([^)]+)\)\.([^(]+)\(\);?\)/g, 'expect($1).$2()');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing deployment syntax errors...\n');

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.warn(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✨ Done!');