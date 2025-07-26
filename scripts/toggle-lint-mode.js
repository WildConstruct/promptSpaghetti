#!/usr/bin/env node
/**
 * Toggle between strict and permissive linting modes
 * Usage: node scripts/toggle-lint-mode.js [strict|permissive]
 */

const fs = require('fs');

const mode = process.argv[2] || 'auto';

console.log('🔧 Lint Mode Switcher\n');

function switchToMode(targetMode: string): void {
  const eslintConfig = targetMode === 'strict' ? '.eslintrc.js' : '.eslintrc.improved.js';
  const lintStagedConfig = targetMode === 'strict' ? '.lintstagedrc.js' : '.lintstagedrc.improved.js';
  const preCommitHook = targetMode === 'strict' ? '.husky/pre-commit' : '.husky/pre-commit.improved';

  console.log(`📝 Switching to ${targetMode} mode...\n`);

  // Backup current configs
  if (fs.existsSync('.eslintrc.active.js')) {
    fs.unlinkSync('.eslintrc.active.js');
  }
  if (fs.existsSync('.lintstagedrc.active.js')) {
    fs.unlinkSync('.lintstagedrc.active.js');
  }
  if (fs.existsSync('.husky/pre-commit.active')) {
    fs.unlinkSync('.husky/pre-commit.active');
  }

  // Copy preferred configs to active configs
  try {
    fs.copyFileSync(eslintConfig, '.eslintrc.active.js');
    fs.copyFileSync(lintStagedConfig, '.lintstagedrc.active.js');
    fs.copyFileSync(preCommitHook, '.husky/pre-commit.active');
    fs.chmodSync('.husky/pre-commit.active', 0o755);

    console.log(`✅ ESLint config: ${eslintConfig} → .eslintrc.active.js`);
    console.log(`✅ Lint-staged config: ${lintStagedConfig} → .lintstagedrc.active.js`);
    console.log(`✅ Pre-commit hook: ${preCommitHook} → .husky/pre-commit.active`);
    console.log(`\n🎯 Now using ${targetMode} linting mode`);
    
    if (targetMode === 'permissive') {
      console.log('\n💡 Permissive mode benefits:');
      console.log('   - Warnings instead of errors for style issues');
      console.log('   - More lenient line length limits');
      console.log('   - Allows console.log statements');
      console.log('   - Auto-fixes common issues before commit');
      console.log('   - Fallback mode if strict linting fails');
    } else {
      console.log('\n💡 Strict mode benefits:');
      console.log('   - Enforces consistent code style');
      console.log('   - Catches potential bugs early');
      console.log('   - Maintains high code quality standards');
    }

    console.log('\n📖 Usage:');
    console.log('   • Use .eslintrc.active.js in your IDE');
    console.log('   • Commits will use .lintstagedrc.active.js');
    console.log('   • Pre-commit hooks use .husky/pre-commit.active');
    
  } catch (error) {
    console.error(`❌ Error switching modes: ${error.message}`);
    process.exit(1);
  }
}

function getCurrentMode(): string {
  if (!fs.existsSync('.eslintrc.active.js')) {
    return 'none';
  }
  
  const activeContent = fs.readFileSync('.eslintrc.active.js', 'utf8');
  const strictContent = fs.readFileSync('.eslintrc.js', 'utf8');
  const permissiveContent = fs.readFileSync('.eslintrc.improved.js', 'utf8');
  
  if (activeContent === strictContent) {
    return 'strict';
  } else if (activeContent === permissiveContent) {
    return 'permissive';
  } else {
    return 'custom';
  }
}

function showStatus(): void {
  const current = getCurrentMode();
  console.log('📊 Current lint mode status:\n');
  
  console.log(`Current mode: ${current}`);
  
  if (current === 'none') {
    console.log('⚠️  No active configuration detected');
    console.log('💡 Run with "strict" or "permissive" to set up linting');
  } else {
    console.log('✅ Active configurations:');
    console.log('   - .eslintrc.active.js');
    console.log('   - .lintstagedrc.active.js'); 
    console.log('   - .husky/pre-commit.active');
  }
  
  console.log('\n📖 Available modes:');
  console.log('   strict      - Strict linting (errors fail commits)');
  console.log('   permissive  - Permissive linting (warnings allowed)');
  console.log('   status      - Show current mode');
}

// Main logic
if (mode === 'status' || mode === 'auto') {
  showStatus();
  
  if (mode === 'auto') {
    const current = getCurrentMode();
    if (current === 'none') {
      console.log('\n🔄 Auto-switching to permissive mode for easier development...');
      switchToMode('permissive');
    }
  }
} else if (mode === 'strict' || mode === 'permissive') {
  switchToMode(mode);
} else {
  console.log('❌ Invalid mode. Use: strict, permissive, or status');
  console.log('\nUsage: node scripts/toggle-lint-mode.js [strict|permissive|status]');
  process.exit(1);
}