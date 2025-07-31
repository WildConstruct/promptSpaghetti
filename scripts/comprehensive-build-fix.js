#!/usr/bin/env node

/**
 * Comprehensive Build Fix Script
 * Systematically repairs build issues in the correct order
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveBuildFixer {
  constructor() {
    this.verbose = process.argv.includes('--verbose');
    this.dryRun = process.argv.includes('--dry-run');
  }

  log(message, type = 'info') {
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      step: '📋',
    }[type];
    console.log(`${prefix} ${message}`);
  }

  /**
   * Run a command and return success status
   */
  runCommand(command, description) {
    this.log(`${description}...`, 'step');

    if (this.dryRun) {
      this.log(`Would run: ${command}`, 'warning');
      return true;
    }

    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: this.verbose ? 'inherit' : 'pipe',
      });

      if (this.verbose && output) {
        console.log(output);
      }

      this.log(`${description} completed`, 'success');
      return true;
    } catch (error) {
      this.log(`${description} failed: ${error.message}`, 'error');
      if (this.verbose) {
        console.error(error.stdout);
        console.error(error.stderr);
      }
      return false;
    }
  }

  /**
   * Step 1: Remove problematic build scripts
   */
  removeBadBuildScripts() {
    this.log('Step 1: Removing problematic build scripts', 'step');

    const badScripts = ['netlify-build-transform.sh', 'netlify-build-webpack.sh'];

    let removed = 0;
    for (const script of badScripts) {
      if (fs.existsSync(script)) {
        if (!this.dryRun) {
          fs.unlinkSync(script);
        }
        this.log(`Removed ${script}`, 'success');
        removed++;
      }
    }

    if (removed === 0) {
      this.log('No problematic build scripts found', 'success');
    }

    return true;
  }

  /**
   * Step 2: Clean malformed transpiled files
   */
  cleanMalformedFiles() {
    this.log('Step 2: Cleaning malformed transpiled files', 'step');
    return this.runCommand('node scripts/clean-malformed-files.js', 'Clean malformed files');
  }

  /**
   * Step 3: Fix corrupted source files
   */
  fixCorruptedSources() {
    this.log('Step 3: Fixing corrupted source files', 'step');
    return this.runCommand('node scripts/fix-corrupted-source-files.js', 'Fix corrupted source files');
  }

  /**
   * Step 4: Validate build
   */
  validateBuild() {
    this.log('Step 4: Validating build', 'step');
    return this.runCommand('node scripts/validate-build.js', 'Validate build');
  }

  /**
   * Step 5: Run TypeScript compilation test
   */
  testTypeScriptCompilation() {
    this.log('Step 5: Testing TypeScript compilation', 'step');
    return this.runCommand('cd packages/core && pnpm tsc --noEmit', 'TypeScript compilation test');
  }

  /**
   * Step 6: Run linting
   */
  runLinting() {
    this.log('Step 6: Running linting', 'step');
    return this.runCommand('pnpm lint --fix', 'ESLint with fixes');
  }

  /**
   * Main repair process
   */
  async run() {
    console.log('🚀 Starting comprehensive build fix...\n');

    if (this.dryRun) {
      this.log('DRY RUN MODE - No changes will be made', 'warning');
    }

    const steps = [
      () => this.removeBadBuildScripts(),
      () => this.cleanMalformedFiles(),
      () => this.fixCorruptedSources(),
      () => this.validateBuild(),
      () => this.testTypeScriptCompilation(),
      () => this.runLinting(),
    ];

    let completedSteps = 0;
    let failedSteps = 0;

    for (let i = 0; i < steps.length; i++) {
      try {
        const success = await steps[i]();
        if (success) {
          completedSteps++;
        } else {
          failedSteps++;
          this.log(`Step ${i + 1} failed, continuing with next step`, 'warning');
        }
      } catch (error) {
        this.log(`Step ${i + 1} threw error: ${error.message}`, 'error');
        failedSteps++;
      }
      console.log(''); // Add spacing between steps
    }

    // Final report
    console.log('📊 Build Fix Summary:');
    this.log(
      `Completed steps: ${completedSteps}/${steps.length}`,
      completedSteps === steps.length ? 'success' : 'warning'
    );

    if (failedSteps > 0) {
      this.log(`Failed steps: ${failedSteps}`, 'error');
    }

    if (completedSteps === steps.length) {
      console.log('\n🎉 All build fix steps completed successfully!');
      console.log('\n🔧 Next steps:');
      console.log('  1. Test the application: pnpm dev');
      console.log('  2. Run tests: pnpm test');
      console.log('  3. Build for production: pnpm build');
    } else {
      console.log('\n⚠️  Some steps failed. Manual intervention may be required.');
      console.log('\n🔧 Troubleshooting:');
      console.log('  1. Review error messages above');
      console.log('  2. Run individual fix scripts with --verbose');
      console.log('  3. Check specific files mentioned in error logs');
    }
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔧 Comprehensive Build Fixer

Usage:
  node scripts/comprehensive-build-fix.js [options]

Options:
  --dry-run    Show what would be done without making changes
  --verbose    Show detailed output from all commands
  --help, -h   Show this help message

This script runs a complete build repair process:
1. Remove problematic build scripts
2. Clean malformed transpiled files
3. Fix corrupted source files
4. Validate build configuration
5. Test TypeScript compilation
6. Run linting with fixes
`);
  process.exit(0);
}

// Run fixer if called directly
if (require.main === module) {
  const fixer = new ComprehensiveBuildFixer();
  fixer.run().catch(error => {
    console.error('❌ Build fix failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveBuildFixer;
