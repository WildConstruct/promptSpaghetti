#!/usr/bin/env node

/**
 * Script to fix jest.fn<unknown[], unknown>() pattern in test files
 * Simplifies to jest.fn() which is cleaner and more idiomatic
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting Jest function type cleanup...');

// Find all test files with the problematic pattern
const testFiles = execSync(
  `find . -name "*.test.ts" -o -name "*.test.tsx" | xargs grep -l "jest\\.fn<unknown\\[\\], unknown>()"`
)
  .toString()
  .trim()
  .split('\n')
  .filter(file => file && !file.includes('node_modules'));

console.log(`📁 Found ${testFiles.length} files with jest.fn<unknown[], unknown>() pattern`);

let totalReplacements = 0;
let filesProcessed = 0;

testFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Count occurrences before replacement
    const beforeCount = (content.match(/jest\.fn<unknown\[\], unknown>\(\)/g) || []).length;

    if (beforeCount === 0) return;

    // Replace the pattern
    const updatedContent = content.replace(/jest\.fn<unknown\[\], unknown>\(\)/g, 'jest.fn()');

    // Count occurrences after replacement (should be 0)
    const afterCount = (updatedContent.match(/jest\.fn<unknown\[\], unknown>\(\)/g) || []).length;

    if (beforeCount > afterCount) {
      fs.writeFileSync(filePath, updatedContent);
      const replacements = beforeCount - afterCount;
      totalReplacements += replacements;
      filesProcessed++;

      console.log(`✅ ${path.relative('.', filePath)}: ${replacements} replacements`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Jest function type cleanup complete!`);
console.log(`📊 Summary:`);
console.log(`   • Files processed: ${filesProcessed}`);
console.log(`   • Total replacements: ${totalReplacements}`);
console.log(`   • Pattern simplified: jest.fn<unknown[], unknown>() → jest.fn()`);

if (totalReplacements > 0) {
  console.log(`\n💡 This cleanup improves code readability and removes unnecessary TypeScript complexity.`);
}
