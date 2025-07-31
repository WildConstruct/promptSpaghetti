#!/usr/bin/env node

/**
 * Build Validation Script
 * Prevents malformed transpiled files and validates build integrity
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildValidator {
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
   * Check for malformed transpiled JS files
   */
  checkMalformedFiles() {
    this.log('Checking for malformed transpiled files...', 'info');

    const coreDir = path.join(process.cwd(), 'packages/core');
    if (!fs.existsSync(coreDir)) {
      this.warnings.push('Core package directory not found');
      return;
    }

    const malformedFiles = [];

    const checkDirectory = dir => {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory() && !['node_modules', 'dist', 'coverage'].includes(item.name)) {
          checkDirectory(fullPath);
        } else if (item.isFile() && item.name.endsWith('.js')) {
          const baseName = item.name.replace('.js', '');
          const tsFile = path.join(dir, `${baseName}.ts`);
          const tsxFile = path.join(dir, `${baseName}.tsx`);

          // Check if corresponding .ts/.tsx exists
          if (fs.existsSync(tsFile) || fs.existsSync(tsxFile)) {
            malformedFiles.push(path.relative(process.cwd(), fullPath));
            continue;
          }

          // Check file content for malformed patterns
          try {
            const content = fs.readFileSync(fullPath, 'utf8');

            // Check for orphaned return statements
            const lines = content.split('\n');
            let inFunction = false;
            let braceCount = 0;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();

              // Track if we're inside a function
              if (line.includes('function') || line.includes('=>') || (line.includes('const') && line.includes('='))) {
                inFunction = true;
              }

              // Track brace depth
              braceCount += (line.match(/{/g) || []).length;
              braceCount -= (line.match(/}/g) || []).length;

              // Reset function tracking when we exit all braces
              if (braceCount <= 0) {
                inFunction = false;
              }

              // Check for problematic patterns
              if (line.startsWith('return ') && !inFunction) {
                malformedFiles.push(`${path.relative(process.cwd(), fullPath)}:${i + 1} (orphaned return)`);
              }

              if ((line.includes('_jsx') || line.includes('_jsxs')) && !inFunction) {
                malformedFiles.push(`${path.relative(process.cwd(), fullPath)}:${i + 1} (orphaned JSX)`);
              }
            }
          } catch (error) {
            this.warnings.push(`Could not read file ${fullPath}: ${error.message}`);
          }
        }
      }
    };

    checkDirectory(coreDir);

    if (malformedFiles.length > 0) {
      this.errors.push(`Found ${malformedFiles.length} malformed files:`);
      malformedFiles.forEach(file => this.errors.push(`  - ${file}`));
    } else {
      this.log('No malformed files found', 'success');
    }
  }

  /**
   * Validate TypeScript compilation
   */
  validateTypeScript() {
    this.log('Validating TypeScript compilation...', 'info');

    try {
      const coreDir = path.join(process.cwd(), 'packages/core');
      if (fs.existsSync(coreDir)) {
        execSync('pnpm tsc --noEmit', {
          cwd: coreDir,
          stdio: 'pipe',
        });
        this.log('TypeScript compilation successful', 'success');
      }
    } catch (error) {
      this.errors.push('TypeScript compilation failed:');
      this.errors.push(error.stdout?.toString() || error.message);
    }
  }

  /**
   * Validate build configuration
   */
  validateBuildConfig() {
    this.log('Validating build configuration...', 'info');

    const configFiles = ['packages/core/tsconfig.json', 'client/vite.config.ts', 'netlify.toml'];

    for (const configFile of configFiles) {
      if (!fs.existsSync(configFile)) {
        this.warnings.push(`Config file missing: ${configFile}`);
      }
    }

    // Check for problematic build scripts
    const buildScripts = ['netlify-build-transform.sh', 'netlify-build-webpack.sh'];

    for (const script of buildScripts) {
      if (fs.existsSync(script)) {
        this.warnings.push(`Potentially problematic build script found: ${script}`);
        this.warnings.push('  Consider removing or updating this script to avoid transpilation issues');
      }
    }
  }

  /**
   * Validate package.json dependencies
   */
  validateDependencies() {
    this.log('Validating dependencies...', 'info');

    const packageJsonPaths = ['package.json', 'client/package.json', 'packages/core/package.json'];

    for (const pkgPath of packageJsonPaths) {
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

          // Check for conflicting build tools
          const conflictingDeps = ['babel', 'webpack', 'rollup'].filter(
            dep => pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]
          );

          if (conflictingDeps.length > 0) {
            this.warnings.push(
              `Potentially conflicting build dependencies in ${pkgPath}: ${conflictingDeps.join(', ')}`
            );
          }
        } catch (error) {
          this.warnings.push(`Could not parse ${pkgPath}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Run all validations
   */
  async run() {
    console.log('🚀 Starting build validation...\n');

    this.checkMalformedFiles();
    this.validateTypeScript();
    this.validateBuildConfig();
    this.validateDependencies();

    // Report results
    console.log('\n📊 Validation Results:');

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log('\n🔧 Recommendations:');
      console.log('  1. Remove malformed .js files that have .ts/.tsx counterparts');
      console.log('  2. Fix TypeScript compilation errors');
      console.log('  3. Update build scripts to avoid corrupting transpiled files');
      process.exit(1);
    } else {
      this.log('All validations passed!', 'success');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new BuildValidator();
  validator.run().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = BuildValidator;
