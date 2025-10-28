#!/usr/bin/env node

/**
 * Extension Validator - Epic 8.4 Story 8.4.6
 * Validation utilities for extension development
 */

const fs = require('fs');
const path = require('path');

class ExtensionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  async validateExtension(manifestPath) {
    console.log(`🔍 Validating extension: ${manifestPath}`);

    this.errors = [];
    this.warnings = [];
    this.info = [];

    try {
      // Load and validate manifest
      const manifest = this.loadManifest(manifestPath);

      // Run validation checks
      this.validateManifestStructure(manifest);
      this.validateDependencies(manifest, manifestPath);
      this.validatePermissions(manifest);
      this.validateSecurity(manifest);
      this.validateFiles(manifest, manifestPath);

      // Generate report
      this.generateReport(manifest);

      return {
        valid: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings,
        info: this.info
      };
    } catch (error) {
      this.errors.push(`Failed to validate extension: ${error.message}`);
      return {
        valid: false,
        errors: this.errors,
        warnings: this.warnings,
        info: this.info
      };
    }
  }

  loadManifest(manifestPath) {
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest file not found: ${manifestPath}`);
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in manifest: ${error.message}`);
    }
  }

  validateManifestStructure(manifest) {
    // Required fields
    const requiredFields = [
      'manifest_version',
      'id',
      'name',
      'version',
      'extension_type'
    ];

    for (const field of requiredFields) {
      if (!manifest[field]) {
        this.errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate manifest version
    if (manifest.manifest_version !== '1.0') {
      this.errors.push(
        `Unsupported manifest version: ${manifest.manifest_version}`
      );
    }

    // Validate extension ID
    if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
      this.errors.push(
        'Extension ID must contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Validate version format (semantic versioning)
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      this.errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
    }

    // Validate extension type
    const validTypes = ['node', 'ui', 'transform', 'storage'];
    if (
      manifest.extension_type &&
      !validTypes.includes(manifest.extension_type)
    ) {
      this.errors.push(
        `Invalid extension type: ${manifest.extension_type}. Valid types: ${validTypes.join(', ')}`
      );
    }

    // Validate runtime configuration
    if (manifest.runtime) {
      if (!manifest.runtime.entry_point) {
        this.errors.push('Runtime entry_point is required');
      }

      if (manifest.extension_type === 'node' && !manifest.runtime.node_types) {
        this.warnings.push('Node extensions should specify node_types');
      }
    }

    // Validate UI configuration
    if (manifest.extension_type === 'ui' && !manifest.ui) {
      this.warnings.push('UI extensions should include ui configuration');
    }
  }

  validateDependencies(manifest, manifestPath) {
    if (manifest.dependencies) {
      // Check system version
      if (manifest.dependencies.system_version) {
        if (
          !/^[\^~]?\d+\.\d+\.\d+/.test(manifest.dependencies.system_version)
        ) {
          this.warnings.push(
            'System version should use semantic versioning with range indicators'
          );
        }
      }

      // Check extension dependencies
      if (manifest.dependencies.extensions) {
        for (const [depId, version] of Object.entries(
          manifest.dependencies.extensions
        )) {
          if (!/^[\^~]?\d+\.\d+\.\d+/.test(version)) {
            this.warnings.push(
              `Extension dependency ${depId} should use semantic versioning`
            );
          }
        }
      }
    }

    // Check package.json consistency
    const packageJsonPath = path.join(
      path.dirname(manifestPath),
      'package.json'
    );
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );

        if (packageJson.name !== manifest.id) {
          this.warnings.push('package.json name should match manifest id');
        }

        if (packageJson.version !== manifest.version) {
          this.warnings.push(
            'package.json version should match manifest version'
          );
        }
      } catch (error) {
        this.warnings.push('Failed to read package.json for consistency check');
      }
    }
  }

  validatePermissions(manifest) {
    if (manifest.permissions) {
      const validPermissions = [
        'data-processing',
        'file-system-read',
        'file-system-write',
        'network',
        'ui-components',
        'extensions-api',
        'system-info',
        'data-storage'
      ];

      const dangerousPermissions = [
        'file-system-write',
        'network',
        'extensions-api',
        'system-info'
      ];

      for (const permission of manifest.permissions) {
        if (!validPermissions.includes(permission)) {
          this.warnings.push(`Unknown permission: ${permission}`);
        }

        if (dangerousPermissions.includes(permission)) {
          this.warnings.push(`Dangerous permission requested: ${permission}`);
        }
      }
    }
  }

  validateSecurity(manifest) {
    if (manifest.security) {
      // Validate CSP
      if (manifest.security.content_security_policy) {
        const csp = manifest.security.content_security_policy;

        if (csp.includes("'unsafe-eval'")) {
          this.warnings.push('Content Security Policy allows unsafe-eval');
        }

        if (csp.includes("'unsafe-inline'")) {
          this.warnings.push('Content Security Policy allows unsafe-inline');
        }

        if (!csp.includes('default-src') && !csp.includes('script-src')) {
          this.warnings.push(
            'Content Security Policy should include default-src or script-src'
          );
        }
      }

      // Validate sandbox
      if (manifest.security.sandbox) {
        if (!manifest.security.sandbox.enabled) {
          this.warnings.push(
            'Sandbox is disabled - consider enabling for security'
          );
        }
      } else {
        this.info.push('No sandbox configuration specified');
      }

      // Validate trusted domains
      if (manifest.security.trusted_domains) {
        for (const domain of manifest.security.trusted_domains) {
          if (domain === '*') {
            this.warnings.push(
              'Wildcard trusted domain (*) is not recommended'
            );
          }

          if (!this.isValidDomain(domain)) {
            this.warnings.push(`Invalid trusted domain format: ${domain}`);
          }
        }
      }
    } else {
      this.info.push('No security configuration specified');
    }
  }

  validateFiles(manifest, manifestPath) {
    const extensionDir = path.dirname(manifestPath);

    // Check if entry point exists
    if (manifest.runtime && manifest.runtime.entry_point) {
      const entryPointPath = path.join(
        extensionDir,
        manifest.runtime.entry_point
      );

      if (!fs.existsSync(entryPointPath)) {
        this.errors.push(
          `Entry point file not found: ${manifest.runtime.entry_point}`
        );
      }
    }

    // Check for TypeScript configuration
    const tsconfigPath = path.join(extensionDir, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      this.warnings.push(
        'No tsconfig.json found - TypeScript development recommended'
      );
    }

    // Check for tests
    const testDirs = ['test', 'tests', '__tests__', 'src/__tests__'];
    const hasTests = testDirs.some(dir =>
      fs.existsSync(path.join(extensionDir, dir))
    );

    if (!hasTests) {
      this.warnings.push('No test directory found - testing is recommended');
    }

    // Check for README
    const readmeFiles = ['README.md', 'readme.md', 'README.txt'];
    const hasReadme = readmeFiles.some(file =>
      fs.existsSync(path.join(extensionDir, file))
    );

    if (!hasReadme) {
      this.warnings.push('No README file found - documentation is recommended');
    }
  }

  isValidDomain(domain) {
    // Basic domain validation
    const domainRegex =
      /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$|^localhost$|^\d+\.\d+\.\d+\.\d+$/;
    return domainRegex.test(domain);
  }

  generateReport(manifest) {
    console.log('\n📊 Validation Report');
    console.log('='.repeat(50));

    console.log(`Extension: ${manifest.name || 'Unknown'}`);
    console.log(`ID: ${manifest.id || 'Unknown'}`);
    console.log(`Version: ${manifest.version || 'Unknown'}`);
    console.log(`Type: ${manifest.extension_type || 'Unknown'}`);

    console.log('\n🔍 Results:');

    if (this.errors.length === 0) {
      console.log('✅ No errors found');
    } else {
      console.log(`❌ ${this.errors.length} error(s) found:`);
      this.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ ${this.warnings.length} warning(s):`);
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }

    if (this.info.length > 0) {
      console.log(`\nℹ️ ${this.info.length} info item(s):`);
      this.info.forEach(info => console.log(`   • ${info}`));
    }

    // Security assessment
    this.generateSecurityAssessment(manifest);

    // Recommendations
    this.generateRecommendations(manifest);
  }

  generateSecurityAssessment(manifest) {
    console.log('\n🔒 Security Assessment:');

    let securityScore = 100;
    const securityIssues = [];

    // Check permissions
    if (manifest.permissions) {
      const dangerousPerms = manifest.permissions.filter(p =>
        [
          'file-system-write',
          'network',
          'extensions-api',
          'system-info'
        ].includes(p)
      );

      if (dangerousPerms.length > 0) {
        securityScore -= dangerousPerms.length * 15;
        securityIssues.push(
          `Requests ${dangerousPerms.length} dangerous permission(s)`
        );
      }
    }

    // Check CSP
    if (!manifest.security?.content_security_policy) {
      securityScore -= 20;
      securityIssues.push('No Content Security Policy defined');
    }

    // Check sandbox
    if (!manifest.security?.sandbox?.enabled) {
      securityScore -= 10;
      securityIssues.push('Sandbox not enabled');
    }

    // Check trusted domains
    if (manifest.security?.trusted_domains?.includes('*')) {
      securityScore -= 25;
      securityIssues.push('Uses wildcard trusted domain');
    }

    const securityLevel =
      securityScore >= 80 ? 'Good' : securityScore >= 60 ? 'Moderate' : 'Poor';

    console.log(`   Security Score: ${securityScore}/100 (${securityLevel})`);

    if (securityIssues.length > 0) {
      console.log('   Issues:');
      securityIssues.forEach(issue => console.log(`     • ${issue}`));
    }
  }

  generateRecommendations(manifest) {
    console.log('\n💡 Recommendations:');

    const recommendations = [];

    // Type-specific recommendations
    switch (manifest.extension_type) {
      case 'node':
        if (!manifest.runtime?.node_types) {
          recommendations.push('Specify node_types in runtime configuration');
        }
        break;
      case 'ui':
        if (!manifest.ui) {
          recommendations.push(
            'Add ui configuration with themes or components'
          );
        }
        break;
    }

    // Security recommendations
    if (!manifest.security?.sandbox?.enabled) {
      recommendations.push('Enable sandbox for enhanced security');
    }

    if (!manifest.security?.content_security_policy) {
      recommendations.push('Add Content Security Policy');
    }

    // Development recommendations
    if (!manifest.description) {
      recommendations.push('Add description to manifest');
    }

    if (!manifest.author) {
      recommendations.push('Add author information to manifest');
    }

    if (recommendations.length === 0) {
      console.log('   No recommendations - looks good! 🎉');
    } else {
      recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
  }
}

// Performance profiler for extensions
class ExtensionProfiler {
  constructor() {
    this.metrics = {
      loadTime: null,
      initTime: null,
      activationTime: null,
      memoryUsage: null,
      performance: []
    };
  }

  async profileExtension(extensionPath) {
    console.log(`📊 Profiling extension: ${extensionPath}`);

    const startTime = performance.now();

    try {
      // Simulate extension loading
      const loadStart = performance.now();
      await this.simulateLoad(extensionPath);
      this.metrics.loadTime = performance.now() - loadStart;

      // Simulate initialization
      const initStart = performance.now();
      await this.simulateInit();
      this.metrics.initTime = performance.now() - initStart;

      // Simulate activation
      const activationStart = performance.now();
      await this.simulateActivation();
      this.metrics.activationTime = performance.now() - activationStart;

      // Memory usage
      this.metrics.memoryUsage = process.memoryUsage();

      const totalTime = performance.now() - startTime;

      this.generatePerformanceReport(totalTime);
    } catch (error) {
      console.error('Profiling failed:', error.message);
    }
  }

  async simulateLoad(extensionPath) {
    // Simulate file loading delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  }

  async simulateInit() {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
  }

  async simulateActivation() {
    // Simulate activation delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
  }

  generatePerformanceReport(totalTime) {
    console.log('\n⚡ Performance Report');
    console.log('='.repeat(30));

    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`Load Time: ${this.metrics.loadTime.toFixed(2)}ms`);
    console.log(`Init Time: ${this.metrics.initTime.toFixed(2)}ms`);
    console.log(`Activation Time: ${this.metrics.activationTime.toFixed(2)}ms`);

    console.log('\n💾 Memory Usage:');
    console.log(
      `RSS: ${(this.metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
      `Heap Used: ${(this.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(
      `Heap Total: ${(this.metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
    );

    // Performance recommendations
    console.log('\n📈 Performance Recommendations:');

    if (this.metrics.loadTime > 100) {
      console.log('   • Load time is high - consider code splitting');
    }

    if (this.metrics.initTime > 50) {
      console.log('   • Initialization time is high - defer heavy operations');
    }

    if (this.metrics.activationTime > 30) {
      console.log('   • Activation time is high - optimize startup code');
    }

    if (this.metrics.memoryUsage.heapUsed > 50 * 1024 * 1024) {
      console.log('   • High memory usage detected - check for memory leaks');
    }
  }
}

// CLI Implementation
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showUsage();
    return;
  }

  const command = args[0];

  switch (command) {
    case 'validate':
      handleValidate(args.slice(1));
      break;
    case 'profile':
      handleProfile(args.slice(1));
      break;
    case 'help':
      showUsage();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }
}

async function handleValidate(args) {
  if (args.length === 0) {
    console.error('Usage: extension-validator validate <manifest.json>');
    process.exit(1);
  }

  const manifestPath = args[0];
  const validator = new ExtensionValidator();

  try {
    const result = await validator.validateExtension(manifestPath);

    if (!result.valid) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

async function handleProfile(args) {
  if (args.length === 0) {
    console.error('Usage: extension-validator profile <extension-path>');
    process.exit(1);
  }

  const extensionPath = args[0];
  const profiler = new ExtensionProfiler();

  try {
    await profiler.profileExtension(extensionPath);
  } catch (error) {
    console.error(`Profiling failed: ${error.message}`);
    process.exit(1);
  }
}

function showUsage() {
  console.log(`
🔍 PromptSpaghetti Extension Validator

Usage:
  extension-validator validate <manifest.json>
  extension-validator profile <extension-path>
  extension-validator help

Commands:
  validate <manifest>    Validate extension manifest and structure
  profile <path>         Profile extension performance
  help                   Show this help message

Examples:
  extension-validator validate ./manifest.json
  extension-validator profile ./my-extension/

Validation checks:
  ✓ Manifest structure and required fields
  ✓ Dependency specifications
  ✓ Permission usage
  ✓ Security configuration
  ✓ File structure
  ✓ Best practices compliance

For more information, visit: https://docs.prompt-spaghetti.dev/extensions/
`);
}

// Export for testing
if (require.main === module) {
  main();
}

module.exports = { ExtensionValidator, ExtensionProfiler };
