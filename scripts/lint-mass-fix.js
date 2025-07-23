#!/usr/bin/env node

/**
 * Mass Linting Fix Script
 * Systematically fixes linting issues in phases
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const phases = [
  {
    name: 'Phase 1: Unused Variable Cleanup',
    command: `npx eslint --config .eslintrc.relaxed.js --fix --ext .ts,.tsx,.js,.jsx . --rule '{"@typescript-eslint/no-unused-vars": "error"}' --rule '{"no-unused-vars": "error"}'`,
    description: 'Remove or rename unused variables with _ prefix'
  },
  {
    name: 'Phase 2: Line Length Fixes',
    command: `npx eslint --config .eslintrc.relaxed.js --fix --ext .ts,.tsx,.js,.jsx . --rule '{"max-len": ["error", {"code": 120}]}'`,
    description: 'Format long lines where possible'
  },
  {
    name: 'Phase 3: Import/Export Fixes', 
    command: `npx eslint --config .eslintrc.relaxed.js --fix --ext .js,.mjs . --rule '{"import/no-unresolved": "off"}'`,
    description: 'Fix module import/export issues'
  }
];

async function runPhase(phase) {
  console.log(`\n🚀 ${phase.name}`);
  console.log(`📝 ${phase.description}`);
  
  try {
    console.log(`⚡ Running: ${phase.command.substring(0, 60)}...`);
    
    const result = execSync(phase.command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(`✅ ${phase.name} completed successfully`);
    return true;
  } catch (error) {
    console.log(`⚠️  ${phase.name} completed with issues (expected)`);
    console.log(`📊 Error count: ${(error.stdout || error.stderr || '').split('\n').filter(line => line.includes('error')).length}`);
    return false;
  }
}

async function main() {
  console.log('🎯 Starting Mass Linting Fix Process');
  console.log('📋 This will systematically fix linting issues in phases\n');

  // Get initial error count
  try {
    execSync('pnpm lint --config .eslintrc.relaxed.js', { stdio: 'pipe' });
  } catch (error) {
    const initialErrors = (error.stdout || error.stderr || '').match(/(\d+) errors?/);
    console.log(`📈 Initial error count: ${initialErrors ? initialErrors[1] : 'Unknown'}`);
  }

  for (const phase of phases) {
    await runPhase(phase);
    
    // Get updated count after each phase
    try {
      execSync('pnpm lint --config .eslintrc.relaxed.js', { stdio: 'pipe' });
    } catch (error) {
      const currentErrors = (error.stdout || error.stderr || '').match(/(\d+) errors?/);
      console.log(`📊 Current error count: ${currentErrors ? currentErrors[1] : 'Unknown'}`);
    }
    
    // Small delay between phases
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 Mass fix process completed!');
  console.log('📝 Next steps:');
  console.log('   1. Review changes with git diff');
  console.log('   2. Run tests to ensure nothing broke');
  console.log('   3. Gradually tighten linting rules');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runPhase, phases };