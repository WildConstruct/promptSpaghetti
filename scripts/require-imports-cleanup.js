#!/usr/bin/env node

/**
 * Require Imports Cleanup Script
 * Converts require() imports to ES6 imports automatically
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎯 Require Imports Cleanup Script');
console.log('🔧 Converting require() to ES6 imports\n');

// Get current require import violations
function getRequireViolations() {
  try {
    const output = execSync('pnpm lint 2>&1 | grep "no-require-imports"', { encoding: 'utf8' });
    return output.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

// Extract file path from lint output
function extractFilePathFromLint(lintLine) {
  // Format: /path/to/file.ts:line:col  error  message
  const match = lintLine.match(/^(.+?):\d+:\d+/);
  return match ? match[1].trim() : null;
}

// Convert require imports to ES6 imports
function fixRequireImports(content, filePath) {
  let fixed = content;
  let changes = 0;

  // Pattern 1: const module = require('module')
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*require\(['"`]([^'"`]+)['"`]\)/g, (match, varName, modulePath) => {
    changes++;
    return `import ${varName} from '${modulePath}'`;
  });

  // Pattern 2: const { destructured } = require('module')
  fixed = fixed.replace(/const\s*\{\s*([^}]+)\s*\}\s*=\s*require\(['"`]([^'"`]+)['"`]\)/g, (match, destructured, modulePath) => {
    changes++;
    return `import { ${destructured.trim()} } from '${modulePath}'`;
  });

  // Pattern 3: import = require() (TypeScript style)
  fixed = fixed.replace(/import\s+(\w+)\s*=\s*require\(['"`]([^'"`]+)['"`]\)/g, (match, varName, modulePath) => {
    changes++;
    return `import ${varName} from '${modulePath}'`;
  });

  // Pattern 4: require() used directly (more complex, skip for now)
  // This would need more sophisticated parsing

  return { content: fixed, changes };
}

// Process a single file
async function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return 0;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, changes } = fixRequireImports(content, filePath);
    
    if (changes > 0) {
      fs.writeFileSync(filePath, newContent);
      console.log(`   ✅ Fixed ${changes} require imports in: ${path.basename(filePath)}`);
      return changes;
    } else {
      console.log(`   ℹ️  No fixable require imports found in: ${path.basename(filePath)}`);
      return 0;
    }
  } catch (error) {
    console.log(`   ❌ Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

// Main execution
async function main() {
  console.log('📊 Getting baseline require import violations...');
  const initialViolations = getRequireViolations();
  console.log(`📈 Found ${initialViolations.length} require import violations\n`);

  if (initialViolations.length === 0) {
    console.log('✅ No require import violations found!');
    return;
  }

  // Extract unique file paths
  const filePaths = [...new Set(initialViolations.map(extractFilePathFromLint).filter(Boolean))];
  console.log(`🎯 Processing ${filePaths.length} files with require imports...\n`);

  let totalFixed = 0;

  for (const filePath of filePaths) {
    console.log(`🔧 Processing: ${path.basename(filePath)}`);
    const fixed = await processFile(filePath);
    totalFixed += fixed;
  }

  console.log(`\n📊 REQUIRE IMPORTS CLEANUP SUMMARY:`);
  console.log(`🎉 Total require imports fixed: ${totalFixed}`);
  console.log(`📝 Files processed: ${filePaths.length}`);

  // Check impact
  console.log('\n🔄 Checking impact...');
  const finalViolations = getRequireViolations();
  console.log(`📉 Require import violations: ${finalViolations.length} (was ${initialViolations.length})`);
  
  const improvement = initialViolations.length - finalViolations.length;
  if (improvement > 0) {
    console.log(`✅ Reduced require import violations by ${improvement} (${Math.round(improvement/initialViolations.length*100)}%)`);
  }
}

main().catch(console.error);