#!/usr/bin/env node

/**
 * Targeted Syntax Fix
 * 
 * This script fixes only specific syntax corruption patterns that are causing
 * TypeScript compilation failures. It's much more conservative and precise.
 */

const fs = require('fs');
const path = require('path');

// Very specific patterns to target syntax corruption
const TARGETED_FIXES = [
  // Fix function parameter destructuring with wrong parentheses
  {
    pattern: /export const (\w+): React\.FC<([^>]+)> = \(\{,\)/g,
    replacement: 'export const $1: React.FC<$2> = ({',
    description: 'Fix function parameter destructuring opening'
  },
  
  // Fix useState type annotations with wrong array syntax
  {
    pattern: /useState<([^>]+)>\(\[\]\)/g,
    replacement: 'useState<$1[]>([])',
    description: 'Fix useState array type annotation'
  },
  
  // Fix object literal syntax with wrong parentheses
  {
    pattern: /useState<([^>]+)>\(\{\)/g,
    replacement: 'useState<$1>({})',
    description: 'Fix useState object type initialization'
  },
  
  // Fix JSX conditional rendering with wrong parentheses
  {
    pattern: /&& \(/g,
    replacement: '&& (',
    description: 'Fix JSX conditional rendering'
  },
  
  // Fix object destructuring in function parameters
  {
    pattern: /= \(\{ ([^}]+) \}\)/g,
    replacement: '= ({ $1 })',
    description: 'Fix object destructuring spacing'
  },
  
  // Fix interface property syntax with trailing semicolons and commas
  {
    pattern: /(\w+): ([^;,\n]+);,\s*$/gm,
    replacement: '$1: $2;',
    description: 'Fix interface property trailing semicolon-comma'
  },
  
  // Fix closing function parameter with wrong syntax
  {
    pattern: /}\)\s*=>\s*\{/g,
    replacement: '}) => {',
    description: 'Fix function parameter closing'
  },
  
  // Fix array syntax in test files
  {
    pattern: /const (\w+) = \[;/g,
    replacement: 'const $1 = [',
    description: 'Fix array initialization'
  },
  
  // Fix object property ending with wrong punctuation
  {
    pattern: /created_by: '([^']+)';/g,
    replacement: "created_by: '$1',",
    description: 'Fix object property punctuation'
  },
  
  // Fix mock function calls with wrong parentheses
  {
    pattern: /jest\.mock\([^)]+\),\s*\(\{\)/g,
    replacement: (match) => match.replace('),', ') =>').replace('({)', '({'),
    description: 'Fix jest.mock syntax'
  }
];

function fixSpecificFile(filePath, content) {
  let fixedContent = content;
  let appliedFixes = [];
  
  TARGETED_FIXES.forEach((fix, index) => {
    const before = fixedContent;
    if (typeof fix.replacement === 'function') {
      fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    } else {
      fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    }
    
    if (before !== fixedContent) {
      appliedFixes.push({
        index: index + 1,
        description: fix.description,
        matches: (before.match(fix.pattern) || []).length
      });
    }
  });
  
  return { content: fixedContent, fixes: appliedFixes };
}

function fixSpecificFiles() {
  const filesToFix = [
    'packages/core/components/activity/ActivityFeed.tsx',
    'packages/core/components/activity/ActivityFilters.tsx',
    'packages/core/__tests__/AdvancedExportTemplateManager.test.tsx',
    'packages/core/__tests__/ast-node-whitelist.test.ts',
    'packages/core/__tests__/collaboration/collaborativeFlow.test.ts',
    'packages/core/usePreviewSeeds.ts'
  ];
  
  const stats = {
    filesProcessed: 0,
    totalFixes: 0,
    fixedFiles: []
  };
  
  filesToFix.forEach(relativePath => {
    const fullPath = path.join(process.cwd(), relativePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${relativePath}`);
      return;
    }
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const result = fixSpecificFile(fullPath, content);
      
      if (result.fixes.length > 0) {
        fs.writeFileSync(fullPath, result.content, 'utf8');
        stats.filesProcessed++;
        stats.totalFixes += result.fixes.length;
        stats.fixedFiles.push({
          file: relativePath,
          fixes: result.fixes
        });
        
        console.log(`✅ Fixed ${relativePath}: ${result.fixes.length} issues`);
        result.fixes.forEach(fix => {
          console.log(`   - ${fix.description} (${fix.matches} matches)`);
        });
      } else {
        console.log(`ℹ️  No issues found in ${relativePath}`);
      }
    } catch (error) {
      console.error(`❌ Failed to process ${relativePath}: ${error.message}`);
    }
  });
  
  return stats;
}

function main() {
  console.log('🎯 Targeted Syntax Fix');
  console.log('======================');
  
  const stats = fixSpecificFiles();
  
  console.log('\n📊 Summary:');
  console.log(`   📄 Files processed: ${stats.filesProcessed}`);
  console.log(`   🔧 Total fixes applied: ${stats.totalFixes}`);
  
  if (stats.fixedFiles.length > 0) {
    console.log('\n🔧 Fixed files:');
    stats.fixedFiles.forEach(file => {
      console.log(`   ${file.file}: ${file.fixes.length} fixes`);
    });
    
    console.log('\n✨ Targeted fixes completed!');
    console.log('   Run: node scripts/validate-build.js');
  } else {
    console.log('\n✅ No syntax issues found in target files.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixSpecificFile, fixSpecificFiles };