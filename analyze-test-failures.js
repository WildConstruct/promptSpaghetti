#!/usr/bin/env node

/**
 * Script to systematically analyze test failures and categorize them
 * Focus: Understanding failure patterns to prioritize systematic fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Analyzing test failure patterns...');

// Run tests and capture output
let testOutput = '';
try {
  testOutput = execSync('pnpm --filter core test --verbose 2>&1', { 
    maxBuffer: 1024 * 1024 * 10,
    timeout: 120000
  }).toString();
} catch (error) {
  testOutput = error.stdout?.toString() || error.message;
}

// Analyze failure patterns
const failurePatterns = {
  'Missing elements': 0,
  'toBeInTheDocument': 0,
  'Timeout errors': 0,
  'Import/module errors': 0,
  'Mock function errors': 0,
  'TypeScript errors': 0,
  'React errors': 0,
  'Jest configuration': 0,
  'Other': 0
};

const failureDetails = [];

// Split into test blocks
const testBlocks = testOutput.split(/FAIL|PASS/).filter(block => block.trim().length > 0);

testBlocks.forEach(block => {
  if (block.includes('Unable to find an element')) {
    failurePatterns['Missing elements']++;
    failureDetails.push({ type: 'Missing elements', detail: block.substring(0, 200) });
  } else if (block.includes('toBeInTheDocument')) {
    failurePatterns['toBeInTheDocument']++;
    failureDetails.push({ type: 'toBeInTheDocument', detail: block.substring(0, 200) });
  } else if (block.includes('Timeout') || block.includes('timeout')) {
    failurePatterns['Timeout errors']++;
    failureDetails.push({ type: 'Timeout errors', detail: block.substring(0, 200) });
  } else if (block.includes('Cannot find module') || block.includes('import')) {
    failurePatterns['Import/module errors']++;
    failureDetails.push({ type: 'Import/module errors', detail: block.substring(0, 200) });
  } else if (block.includes('jest.fn') || block.includes('mock')) {
    failurePatterns['Mock function errors']++;
    failureDetails.push({ type: 'Mock function errors', detail: block.substring(0, 200) });
  } else if (block.includes('TS') || block.includes('TypeScript')) {
    failurePatterns['TypeScript errors']++;
    failureDetails.push({ type: 'TypeScript errors', detail: block.substring(0, 200) });
  } else if (block.includes('React') || block.includes('Component')) {
    failurePatterns['React errors']++;
    failureDetails.push({ type: 'React errors', detail: block.substring(0, 200) });
  } else if (block.includes('Jest') || block.includes('config')) {
    failurePatterns['Jest configuration']++;
    failureDetails.push({ type: 'Jest configuration', detail: block.substring(0, 200) });
  } else if (block.includes('✕') || block.includes('Error') || block.includes('FAIL')) {
    failurePatterns['Other']++;
    failureDetails.push({ type: 'Other', detail: block.substring(0, 200) });
  }
});

console.log(`\n📈 Test Failure Pattern Analysis:`);
Object.entries(failurePatterns).forEach(([pattern, count]) => {
  if (count > 0) {
    console.log(`   • ${pattern}: ${count} occurrences`);
  }
});

// Show top 3 most common failure types with examples
const sortedPatterns = Object.entries(failurePatterns)
  .filter(([, count]) => count > 0)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3);

console.log(`\n🔍 Top 3 Failure Types:`);
sortedPatterns.forEach(([pattern, count]) => {
  console.log(`\n   ${pattern} (${count} occurrences):`);
  const examples = failureDetails.filter(f => f.type === pattern).slice(0, 2);
  examples.forEach(example => {
    console.log(`     - ${example.detail.replace(/\n/g, ' ').trim()}...`);
  });
});

// Extract specific test file failures
const failedFiles = [];
const lines = testOutput.split('\n');
lines.forEach(line => {
  if (line.includes('FAIL') && line.includes('.test.')) {
    const match = line.match(/FAIL (.+\.test\.[tj]sx?)/);
    if (match) {
      failedFiles.push(match[1]);
    }
  }
});

console.log(`\n📁 Failed Test Files (${failedFiles.length}):`);
failedFiles.slice(0, 10).forEach(file => {
  console.log(`   • ${file}`);
});

if (failedFiles.length > 10) {
  console.log(`   ... and ${failedFiles.length - 10} more`);
}

console.log(`\n💡 Next systematic fix recommendations:`);
if (failurePatterns['Missing elements'] > 0) {
  console.log(`   1. Fix DOM query selectors and test data setup`);
}
if (failurePatterns['Mock function errors'] > 0) {
  console.log(`   2. Standardize mock function implementations`);
}
if (failurePatterns['toBeInTheDocument'] > 0) {
  console.log(`   3. Fix jest-dom matcher imports and setup`);
}
if (failurePatterns['Import/module errors'] > 0) {
  console.log(`   4. Resolve module path and import issues`);
}

console.log(`\n✅ Analysis complete. Focus on fixing the highest count patterns first.`);