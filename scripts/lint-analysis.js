#!/usr/bin/env node

/**
 * Lint Analysis Script
 * Analyzes remaining linting issues and categorizes them
 */

const { execSync } = require('child_process');

async function analyzeLintIssues() {
  console.log('🔍 Comprehensive Lint Analysis');
  console.log('📊 Categorizing remaining linting issues...\n');
  
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
    console.log('✅ No linting issues found!');
    return;
  } catch (error) {
    const output = String(error.stdout || error.stderr || '');
    
    // Extract error patterns
    const errorPatterns = {
      'Unused Variables': (output.match(/(defined but never used|assigned a value but never used)/g) || []).length,
      'Undefined Variables': (output.match(/is not defined/g) || []).length,
      'Missing React Imports': (output.match(/React.*is not defined/g) || []).length,
      'JSX Issues': (output.match(/jsx-no-undef/g) || []).length,
      'TypeScript Any': (output.match(/Unexpected any/g) || []).length,
      'Line Length': (output.match(/max-len/g) || []).length,
      'Missing Semicolons': (output.match(/Missing semicolon/g) || []).length,
      'Quote Issues': (output.match(/quotes/g) || []).length,
      'Useless Escapes': (output.match(/no-useless-escape/g) || []).length,
      'Import/Export Issues': (output.match(/(import|export).*error/g) || []).length,
      'React Hook Issues': (output.match(/react-hooks/g) || []).length,
      'Constant Conditions': (output.match(/no-constant-condition/g) || []).length,
      'Console Statements': (output.match(/no-console/g) || []).length,
      'Debugger Statements': (output.match(/no-debugger/g) || []).length,
      'Parsing Errors': (output.match(/Parsing error/g) || []).length
    };
    
    // Get total counts
    const totalMatch = output.match(/(\d+) problems \((\d+) errors, (\d+) warnings\)/);
    const totalProblems = totalMatch ? parseInt(totalMatch[1]) : 0;
    const totalErrors = totalMatch ? parseInt(totalMatch[2]) : 0;
    const totalWarnings = totalMatch ? parseInt(totalMatch[3]) : 0;
    
    console.log('📈 OVERALL SUMMARY:');
    console.log(`   Total Problems: ${totalProblems.toLocaleString()}`);
    console.log(`   Errors: ${totalErrors.toLocaleString()}`);
    console.log(`   Warnings: ${totalWarnings.toLocaleString()}\n`);
    
    console.log('🏷️  ERROR CATEGORIES:');
    
    // Sort by count descending
    const sortedPatterns = Object.entries(errorPatterns)
      .sort(([,a], [,b]) => b - a)
      .filter(([,count]) => count > 0);
    
    let categorizedCount = 0;
    for (const [category, count] of sortedPatterns) {
      const percentage = ((count / totalProblems) * 100).toFixed(1);
      console.log(`   ${category.padEnd(25)} ${count.toString().padStart(6)} (${percentage}%)`);
      categorizedCount += count;
    }
    
    const uncategorized = totalProblems - categorizedCount;
    if (uncategorized > 0) {
      const percentage = ((uncategorized / totalProblems) * 100).toFixed(1);
      console.log(`   ${'Other/Complex Issues'.padEnd(25)} ${uncategorized.toString().padStart(6)} (${percentage}%)`);
    }
    
    console.log('\n🎯 RECOMMENDED ACTIONS:');
    
    // Provide recommendations based on top issues
    if (sortedPatterns.length > 0) {
      const [topCategory, topCount] = sortedPatterns[0];
      const topPercentage = ((topCount / totalProblems) * 100).toFixed(1);
      
      console.log(`\n1. 🔥 HIGH PRIORITY: ${topCategory}`);
      console.log(`   ${topCount} issues (${topPercentage}% of total)`);
      
      switch (topCategory) {
        case 'Unused Variables':
          console.log('   ✅ Already processed - may need manual review of remaining cases');
          break;
        case 'Line Length':
          console.log('   🔧 Run Prettier formatting or increase max-len limit');
          break;
        case 'TypeScript Any':
          console.log('   📝 Add proper type annotations or temporarily disable in config');
          break;
        case 'Undefined Variables':
          console.log('   📦 Add missing imports or fix variable declarations');
          break;
        case 'JSX Issues':
          console.log('   ⚛️  Fix React component imports and JSX syntax');
          break;
        default:
          console.log('   📋 Manual review required');
      }
    }
    
    // Progressive improvement strategy
    console.log('\n📋 PROGRESSIVE IMPROVEMENT STRATEGY:');
    console.log('   Phase 1: Fix auto-fixable issues (semicolons, quotes, formatting)');
    console.log('   Phase 2: Add missing imports and fix undefined variables');
    console.log('   Phase 3: Address TypeScript type issues');
    console.log('   Phase 4: Manual review of complex business logic errors');
    console.log('   Phase 5: Gradually re-enable strict rules');
    
    console.log('\n🎉 PROGRESS TRACKING:');
    console.log('   Started with: 37,466 problems');
    console.log(`   Current state: ${totalProblems.toLocaleString()} problems`);
    const improvement = 37466 - totalProblems;
    const improvementPercent = ((improvement / 37466) * 100).toFixed(1);
    console.log(`   Total improvement: ${improvement.toLocaleString()} (${improvementPercent}%)`);
    
    // Estimate remaining work
    const autoFixableCategories = ['Line Length', 'Missing Semicolons', 'Quote Issues', 'Useless Escapes'];
    const autoFixableCount = autoFixableCategories.reduce((sum, cat) => {
      return sum + (errorPatterns[cat] || 0);
    }, 0);
    
    if (autoFixableCount > 0) {
      console.log(`\n⚡ QUICK WINS AVAILABLE:`);
      console.log(`   ~${autoFixableCount} auto-fixable issues remaining`);
      console.log(`   Could reduce to ~${(totalProblems - autoFixableCount).toLocaleString()} problems`);
    }
  }
}

async function main() {
  await analyzeLintIssues();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeLintIssues };