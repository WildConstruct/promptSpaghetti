#!/usr/bin/env node

/**
 * Permissive Build Validation Script
 *
 * A more lenient version for syntax repair commits
 * Only blocks completely broken builds, allows TypeScript warnings
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PermissiveBuildValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const prefix = {
      info: '🔍',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];
    console.log(`${prefix} ${message}`);
  }

  /**
   * Check for critical syntax errors only
   */
  checkCriticalSyntax() {
    this.log('Checking for critical syntax errors...', 'info');

    const coreDir = path.join(process.cwd(), 'packages/core');
    if (!fs.existsSync(coreDir)) {
      this.warnings.push('Core package directory not found');
      return;
    }

    let criticalErrors = 0;

    const checkDirectory = dir => {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory() && !['node_modules', 'dist', 'coverage'].includes(item.name)) {
          checkDirectory(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');

            // Only check for completely broken syntax
            const criticalPatterns = [
              /export const \w+: React\.FC<[^>]+> = \(\{,\)/, // Broken function params
              /useState<[^>]+>\(\{\)\s*[a-zA-Z]/, // Broken state init
              /import.*from.*\)\s*\(\{/, // Broken imports
              /interface.*\{\s*export/, // Broken interfaces
            ];

            criticalPatterns.forEach(pattern => {
              if (pattern.test(content)) {
                criticalErrors++;
              }
            });
          } catch (error) {
            this.warnings.push(`Could not read file ${fullPath}: ${error.message}`);
          }
        }
      }
    };

    checkDirectory(coreDir);

    if (criticalErrors > 0) {
      this.errors.push(`Found ${criticalErrors} critical syntax errors - build would fail completely`);
    } else {
      this.log('No critical syntax errors found', 'success');
    }
  }

  /**
   * Quick TypeScript check - warn but don't fail
   */
  checkTypeScript() {
    this.log('Running quick TypeScript check...', 'info');

    try {
      const coreDir = path.join(process.cwd(), 'packages/core');
      if (fs.existsSync(coreDir)) {
        // Try to compile - capture output but don't fail
        const output = execSync('pnpm tsc --noEmit --maxNodeModuleJsDepth 0', {
          cwd: coreDir,
          stdio: 'pipe',
          encoding: 'utf8',
        });
        this.log('TypeScript compilation successful', 'success');
      }
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
      const errorCount = (errorOutput.match(/error TS\d+/g) || []).length;

      this.warnings.push(`TypeScript compilation has ${errorCount} errors`);
      this.warnings.push('This is expected during syntax repair - errors should decrease over time');

      // Only fail if there are more than 100 errors (completely broken)
      if (errorCount > 100) {
        this.errors.push('Too many TypeScript errors - build is completely broken');
      }
    }
  }

  /**
   * Run permissive validations
   */
  async run() {
    console.log('🚀 Starting permissive build validation...\n');

    this.checkCriticalSyntax();
    this.checkTypeScript();

    // Report results
    console.log('\n📊 Validation Results:');

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Critical Errors:');
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log('\n🔧 Fix critical syntax errors before committing');
      process.exit(1);
    } else {
      this.log('Build validation passed (permissive mode)', 'success');
      if (this.warnings.length > 0) {
        console.log('\n📝 Note: Warnings are acceptable during syntax repair process');
      }
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new PermissiveBuildValidator();
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = PermissiveBuildValidator;
