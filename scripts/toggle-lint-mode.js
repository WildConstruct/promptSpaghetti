#!/usr/bin/env node
/**
 * Toggle between strict and permissive linting modes.
 * Usage: node scripts/toggle-lint-mode.js [strict|permissive|status|auto]
 */

const fs = require('fs');

const mode = process.argv[2] || 'auto';

const MODE_CONFIG = {
  strict: {
    eslint: '.eslintrc.js',
    lintStaged: '.lintstagedrc.js',
    preCommit: '.husky/pre-commit'
  },
  permissive: {
    eslint: '.eslintrc.improved.js',
    lintStaged: '.lintstagedrc.improved.js',
    preCommit: '.husky/pre-commit.improved'
  }
};

function fileText(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : null;
}

function getCurrentMode() {
  const active = fileText('.eslintrc.active.js');
  if (!active) {
    return 'none';
  }

  const strict = fileText(MODE_CONFIG.strict.eslint);
  const permissive = fileText(MODE_CONFIG.permissive.eslint);
  if (active === strict) {
    return 'strict';
  }
  if (active === permissive) {
    return 'permissive';
  }
  return 'custom';
}

function removeIfExists(path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

function switchToMode(targetMode) {
  const config = MODE_CONFIG[targetMode];
  if (!config) {
    throw new Error(`Unsupported mode: ${targetMode}`);
  }

  removeIfExists('.eslintrc.active.js');
  removeIfExists('.lintstagedrc.active.js');
  removeIfExists('.husky/pre-commit.active');

  fs.copyFileSync(config.eslint, '.eslintrc.active.js');
  fs.copyFileSync(config.lintStaged, '.lintstagedrc.active.js');
  fs.copyFileSync(config.preCommit, '.husky/pre-commit.active');
  fs.chmodSync('.husky/pre-commit.active', 0o755);

  console.log(`Switched lint mode to "${targetMode}".`);
}

function showStatus() {
  const current = getCurrentMode();
  console.log(`Current lint mode: ${current}`);
  console.log('Available modes: strict, permissive, status, auto');
}

try {
  if (mode === 'status') {
    showStatus();
    process.exit(0);
  }

  if (mode === 'auto') {
    const current = getCurrentMode();
    if (current === 'none') {
      switchToMode('permissive');
    } else {
      showStatus();
    }
    process.exit(0);
  }

  if (mode === 'strict' || mode === 'permissive') {
    switchToMode(mode);
    process.exit(0);
  }

  console.error('Invalid mode. Use: strict, permissive, status, or auto');
  process.exit(1);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to switch lint mode: ${message}`);
  process.exit(1);
}
