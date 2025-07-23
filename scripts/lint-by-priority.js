#!/usr/bin/env node

/**
 * Priority-Based Linting Script
 * Fixes linting issues by directory priority
 */

const { execSync } = require('child_process');

const directories = [
  // HIGH PRIORITY - Core business logic
  { path: 'packages/core/runtime/', priority: 'HIGH', description: 'Core runtime engine' },
  { path: 'packages/core/components/', priority: 'HIGH', description: 'Core UI components' },
  { path: 'server/src/services/', priority: 'HIGH', description: 'Core services' },
  
  // MEDIUM PRIORITY - Supporting infrastructure  
  { path: 'client/src/components/', priority: 'MEDIUM', description: 'Client components' },
  { path: 'server/src/database/', priority: 'MEDIUM', description: 'Database layer' },
  { path: 'packages/core/__tests__/', priority: 'MEDIUM', description: 'Core tests' },
  
  // LOW PRIORITY - Utilities and tools
  { path: 'tools/', priority: 'LOW', description: 'Development tools' },
  { path: 'scripts/', priority: 'LOW', description: 'Build scripts' },
  { path: 'api/', priority: 'LOW', description: 'API endpoints' }
];

async function lintDirectory(dir) {
  console.log(`\n🎯 [${dir.priority}] Linting: ${dir.path}`);
  console.log(`📝 ${dir.description}`);
  
  try {
    // Get current error count for this directory
    const beforeResult = execSync(
      `npx eslint "${dir.path}" --ext .ts,.tsx,.js,.jsx`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    console.log(`✅ ${dir.path} - No errors found`);
    return { before: 0, after: 0 };
  } catch (beforeError) {
    const beforeOutput = String(beforeError.stdout || beforeError.stderr || '');
    const beforeErrors = beforeOutput.match(/(\d+) problems?/);
    const beforeCount = beforeErrors ? parseInt(beforeErrors[1]) : 0;
    
    console.log(`📊 Before: ${beforeCount} problems`);
    
    try {
      // Apply fixes
      execSync(
        `npx eslint "${dir.path}" --ext .ts,.tsx,.js,.jsx --fix`,
        { stdio: 'pipe' }
      );
      console.log(`✅ ${dir.path} - All problems fixed`);
      return { before: beforeCount, after: 0 };
    } catch (afterError) {
      const afterOutput = String(afterError.stdout || afterError.stderr || '');
      const afterErrors = afterOutput.match(/(\d+) problems?/);
      const afterCount = afterErrors ? parseInt(afterErrors[1]) : 0;
      
      console.log(`📈 After: ${afterCount} problems (${beforeCount - afterCount} fixed)`);
      return { before: beforeCount, after: afterCount };
    }
  }
}

async function main() {
  console.log('🚀 Priority-Based Linting Cleanup');
  console.log('📋 Processing directories by business priority\n');
  
  const results = {
    high: { totalBefore: 0, totalAfter: 0, fixed: 0 },
    medium: { totalBefore: 0, totalAfter: 0, fixed: 0 },
    low: { totalBefore: 0, totalAfter: 0, fixed: 0 }
  };
  
  for (const dir of directories) {
    const result = await lintDirectory(dir);
    const priorityKey = dir.priority.toLowerCase();
    
    results[priorityKey].totalBefore += result.before;
    results[priorityKey].totalAfter += result.after;
    results[priorityKey].fixed += (result.before - result.after);
    
    // Brief pause between directories
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 SUMMARY BY PRIORITY:');
  console.log(`🔴 HIGH:   ${results.high.fixed} fixed   (${results.high.totalAfter} remaining)`);
  console.log(`🟡 MEDIUM: ${results.medium.fixed} fixed (${results.medium.totalAfter} remaining)`);
  console.log(`🟢 LOW:    ${results.low.fixed} fixed    (${results.low.totalAfter} remaining)`);
  
  const totalFixed = results.high.fixed + results.medium.fixed + results.low.fixed;
  const totalRemaining = results.high.totalAfter + results.medium.totalAfter + results.low.totalAfter;
  
  console.log(`\n🎉 TOTAL: ${totalFixed} issues fixed, ${totalRemaining} remaining`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { directories, lintDirectory };