#!/usr/bin/env node

/**
 * Switch between different linting modes
 * Usage: node scripts/switch-linting-mode.js [safe|active|strict|emergency]
 */

const fs = require('fs');
const path = require('path');

const modes = {
  safe: {
    preCommit: '.husky/pre-commit-safe',
    lintStaged: '.lintstagedrc.safe.js',
    description: 'Safe mode - checks only, no auto-fix',
  },
  active: {
    preCommit: '.husky/pre-commit',
    lintStaged: '.lintstagedrc.active.js',
    description: 'Active mode - moderate auto-fixing',
  },
  strict: {
    preCommit: '.husky/pre-commit',
    lintStaged: '.lintstagedrc.js',
    description: 'Strict mode - aggressive auto-fixing',
  },
  emergency: {
    preCommit: '.husky/pre-commit',
    lintStaged: '.lintstagedrc.emergency.js',
    description: 'Emergency mode - minimal checks',
  },
};

const mode = process.argv[2] || 'safe';

if (!modes[mode]) {
  console.error(`Unknown mode: ${mode}`);
  console.log('Available modes:', Object.keys(modes).join(', '));
  process.exit(1);
}

console.log(`🔄 Switching to ${mode} mode...`);
console.log(`📋 ${modes[mode].description}`);

// Copy the appropriate pre-commit hook
const preCommitSource = path.join(process.cwd(), modes[mode].preCommit);
const preCommitDest = path.join(process.cwd(), '.husky/pre-commit');

if (fs.existsSync(preCommitSource)) {
  fs.copyFileSync(preCommitSource, preCommitDest);
  console.log(`✅ Pre-commit hook updated`);
} else {
  console.warn(`⚠️  Pre-commit hook not found: ${preCommitSource}`);
}

// Update the lint-staged config symlink
const lintStagedSource = path.join(process.cwd(), modes[mode].lintStaged);
const lintStagedDest = path.join(process.cwd(), '.lintstagedrc.js');

if (fs.existsSync(lintStagedSource)) {
  // Remove existing file/symlink
  if (fs.existsSync(lintStagedDest)) {
    fs.unlinkSync(lintStagedDest);
  }
  // Copy the config
  fs.copyFileSync(lintStagedSource, lintStagedDest);
  console.log(`✅ Lint-staged config updated`);
} else {
  console.warn(`⚠️  Lint-staged config not found: ${lintStagedSource}`);
}

// Save current mode to a file
fs.writeFileSync('.linting-mode', mode);

console.log(`\n✅ Switched to ${mode} mode successfully!`);
console.log('\n💡 Tips:');
console.log(`  - Current mode: ${mode}`);
console.log('  - Use "git commit --no-verify" to skip all checks');
console.log('  - Run "npm run lint:fix" to manually fix issues');
console.log('  - Run "npm run format" to manually format files');