#!/usr/bin/env node

/**
 * Targeted TypeScript Any Cleanup Script
 * Focuses on high-density any type files for maximum impact
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Targeted TypeScript Any Cleanup Script');
console.log('🔧 Focusing on high-density any type files for maximum impact\n');

// Get files with any type violations and their counts
function getAnyTypeFiles() {
  try {
    const output = execSync('pnpm lint 2>&1 | grep "no-explicit-any"', { encoding: 'utf8' });
    const lines = output.split('\n').filter(line => line.trim());

    // Extract file paths from full lint output
    const fullLintOutput = execSync('pnpm lint', { encoding: 'utf8' });
    const lintLines = fullLintOutput.split('\n');

    const fileViolations = new Map();
    let currentFile = '';

    for (const line of lintLines) {
      if (line.startsWith('/')) {
        currentFile = line.trim();
      } else if (line.includes('no-explicit-any') && currentFile) {
        fileViolations.set(currentFile, (fileViolations.get(currentFile) || 0) + 1);
      }
    }

    // Convert to array and sort by violation count
    return Array.from(fileViolations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 files
  } catch (error) {
    console.log('Using fallback method to find files...');
    return [];
  }
}

// Convert any types to safer alternatives
function fixAnyTypes(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Pattern 1: Function parameters - any → unknown
  fixed = fixed.replace(/\(([^)]*?):\s*any([^)]*?)\)/g, (match, before, after) => {
    changes++;
    return `(${before}: unknown${after})`;
  });

  // Pattern 2: Variable declarations - any → unknown
  fixed = fixed.replace(/:\s*any\s*=/g, ': unknown =');

  // Pattern 3: Array types - any[] → unknown[]
  fixed = fixed.replace(/:\s*any\[\]/g, ': unknown[]');

  // Pattern 4: Generic types - <any> → <unknown>
  fixed = fixed.replace(/<any>/g, '<unknown>');

  // Pattern 5: Object properties - any → unknown (safe default)
  fixed = fixed.replace(/:\s*any\s*;/g, ': unknown;');
  fixed = fixed.replace(/:\s*any\s*,/g, ': unknown,');

  // Pattern 6: Return types - any → unknown
  fixed = fixed.replace(/\):\s*any\s*\{/g, '): unknown {');
  fixed = fixed.replace(/\):\s*any\s*=>/g, '): unknown =>');

  // Count actual changes by comparing
  const originalMatches = (content.match(/:\s*any[\s\[\],;=\{]/g) || []).length;
  const newMatches = (fixed.match(/:\s*any[\s\[\],;=\{]/g) || []).length;
  changes = originalMatches - newMatches;

  return { content: fixed, changes };
}

// Process a single file
async function processFile(filePath, expectedCount) {
  try {
    if (!fs.existsSync(filePath)) return 0;

    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, changes } = fixAnyTypes(content, filePath);

    if (changes > 0) {
      fs.writeFileSync(filePath, newContent);
      console.log(`   ✅ Fixed ${changes}/${expectedCount} any types in: ${path.basename(filePath)}`);
      return changes;
    } else {
      console.log(`   ℹ️  No fixable any types found in: ${path.basename(filePath)}`);
      return 0;
    }
  } catch (error) {
    console.log(`   ❌ Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

// Main execution
async function main() {
  console.log('📊 Finding files with highest any type density...');
  const topFiles = getAnyTypeFiles();

  if (topFiles.length === 0) {
    console.log('✅ No files found or using manual list...');
    // Fallback to known problematic directories
    const fallbackDirs = ['packages/core/components', 'client/src/components/admin', 'server/src/database'];

    console.log('🎯 Processing fallback directories for any types...\n');

    for (const dir of fallbackDirs) {
      console.log(`\n🚀 Processing directory: ${dir}`);

      if (!fs.existsSync(dir)) {
        console.log(`   ⚠️  Directory not found: ${dir}`);
        continue;
      }

      // Find TypeScript files in directory
      const files = execSync(`find ${dir} -name "*.ts" -o -name "*.tsx" | head -5`, { encoding: 'utf8' })
        .split('\n')
        .filter(f => f.trim());

      let dirFixed = 0;
      for (const file of files) {
        if (file.trim()) {
          console.log(`🔧 Processing: ${path.basename(file)}`);
          const fixed = await processFile(file, 'unknown');
          dirFixed += fixed;
        }
      }

      console.log(`   🎉 Directory summary: ${dirFixed} any types fixed`);
    }
    return;
  }

  console.log(`📈 Found ${topFiles.length} files with any type violations\n`);
  console.log('Top violators:');
  topFiles.slice(0, 5).forEach(([file, count], i) => {
    console.log(`   ${i + 1}. ${path.basename(file)}: ${count} any types`);
  });
  console.log('');

  let totalFixed = 0;

  // Process top 10 files to avoid timeout
  for (const [filePath, count] of topFiles.slice(0, 10)) {
    console.log(`🔧 Processing: ${path.basename(filePath)} (${count} any types)`);
    const fixed = await processFile(filePath, count);
    totalFixed += fixed;
  }

  console.log(`\n📊 TARGETED ANY CLEANUP SUMMARY:`);
  console.log(`🎉 Total any types fixed: ${totalFixed}`);
  console.log(`📝 Files processed: ${Math.min(10, topFiles.length)}`);

  // Check impact
  console.log('\n🔄 Checking impact...');
  const currentCount = execSync('pnpm lint 2>&1 | grep "no-explicit-any" | wc -l', { encoding: 'utf8' }).trim();
  console.log(`📉 Current any type violations: ${currentCount}`);
}

main().catch(console.error);
