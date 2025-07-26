#!/usr/bin/env node

/**
 * Epic 16 Prerequisites CLI Script
 * 
 * Command-line interface for running Epic 16 prerequisite checks with
 * various options for output formatting, auto-fixing, and reporting.
 */

const { createEpic16PrerequisiteRunner, checkEpic16Health } = require('../packages/core/services/Epic16PrerequisiteRunner');
const path = require('path');
const fs = require('fs');

// =============================================================================
// CLI Argument Parsing
// =============================================================================

function parseArguments(): any {
  const args = process.argv.slice(2);
  const options = {
    categories: [],
    skipChecks: [],
    onlyChecks: [],
    autoFix: false,
    timeout: 30000,
    concurrency: 5,
    format: 'console',
    outputFile: null,
    verbose: false,
    colors: true,
    configFile: null,
    environment: 'development',
    help: false,
    healthCheck: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
    case '--help':
    case '-h':
      options.help = true;
      break;

    case '--health':
    case '--health-check':
      options.healthCheck = true;
      break;

    case '--categories':
    case '-c':
      if (nextArg && !nextArg.startsWith('--')) {
        options.categories = nextArg.split(',').map(c => c.trim());
        i++;
      }
      break;

    case '--skip':
    case '-s':
      if (nextArg && !nextArg.startsWith('--')) {
        options.skipChecks = nextArg.split(',').map(c => c.trim());
        i++;
      }
      break;

    case '--only':
    case '-o':
      if (nextArg && !nextArg.startsWith('--')) {
        options.onlyChecks = nextArg.split(',').map(c => c.trim());
        i++;
      }
      break;

    case '--auto-fix':
    case '--fix':
      options.autoFix = true;
      break;

    case '--timeout':
    case '-t':
      if (nextArg && !nextArg.startsWith('--')) {
        options.timeout = parseInt(nextArg, 10) * 1000; // Convert to milliseconds
        i++;
      }
      break;

    case '--concurrency':
      if (nextArg && !nextArg.startsWith('--')) {
        options.concurrency = parseInt(nextArg, 10);
        i++;
      }
      break;

    case '--format':
    case '-f':
      if (nextArg && !nextArg.startsWith('--')) {
        options.format = nextArg;
        i++;
      }
      break;

    case '--output':
    case '--out':
      if (nextArg && !nextArg.startsWith('--')) {
        options.outputFile = nextArg;
        i++;
      }
      break;

    case '--verbose':
    case '-v':
      options.verbose = true;
      break;

    case '--no-colors':
      options.colors = false;
      break;

    case '--config':
      if (nextArg && !nextArg.startsWith('--')) {
        options.configFile = nextArg;
        i++;
      }
      break;

    case '--env':
    case '--environment':
      if (nextArg && !nextArg.startsWith('--')) {
        options.environment = nextArg;
        i++;
      }
      break;

    default:
      if (arg.startsWith('--')) {
        console.warn(`⚠️  Unknown option: ${arg}`);
      }
      break;
    }
  }

  return options;
}

// =============================================================================
// Help Documentation
// =============================================================================

function displayHelp(): void {
  const helpText = `
🔍 Epic 16 Prerequisites Checker

USAGE:
  node scripts/epic16-prerequisites.js [OPTIONS]

OPTIONS:
  -h, --help                 Show this help message
      --health               Quick health check (exit code 0=healthy, 1=degraded, 2=critical)
  
  CHECK SELECTION:
  -c, --categories LIST      Run only specified categories (comma-separated)
                             Available: epic_dependency, infrastructure, service, configuration, security
  -s, --skip LIST           Skip specified checks (comma-separated)
  -o, --only LIST           Run only specified checks (comma-separated)
  
  EXECUTION:
      --auto-fix             Attempt to automatically fix failed checks
  -t, --timeout SECONDS     Timeout for individual checks (default: 30)
      --concurrency NUMBER   Number of concurrent checks (default: 5)
  
  OUTPUT:
  -f, --format FORMAT       Output format: console, json, html, markdown (default: console)
      --output FILE          Save report to specific file
  -v, --verbose             Show detailed progress information
      --no-colors           Disable colored output
  
  CONFIGURATION:
      --config FILE          Load configuration from JSON file
      --env ENVIRONMENT      Environment: development, staging, production (default: development)

EXAMPLES:
  # Basic prerequisite check
  node scripts/epic16-prerequisites.js
  
  # Check only critical infrastructure
  node scripts/epic16-prerequisites.js --categories infrastructure,service
  
  # Auto-fix with detailed output
  node scripts/epic16-prerequisites.js --auto-fix --verbose
  
  # Generate HTML report
  node scripts/epic16-prerequisites.js --format html --output epic16-report.html
  
  # Quick health check for monitoring
  node scripts/epic16-prerequisites.js --health
  
  # Production environment check
  node scripts/epic16-prerequisites.js --env production --categories epic_dependency,infrastructure

ENVIRONMENT VARIABLES:
  EPIC11_AUTH_SERVICE_URL       Epic 11 authentication service endpoint
  EPIC13_ANALYTICS_SERVICE_URL  Epic 13 analytics service endpoint
  DATABASE_URL                  PostgreSQL connection string
  REDIS_URL                     Redis connection string
  ELASTICSEARCH_URL             Elasticsearch cluster endpoint
  STRIPE_SECRET_KEY             Stripe API secret key
  CLAUDE_API_KEY               Claude API key (or ANTHROPIC_API_KEY)
  CLOUDFRONT_DISTRIBUTION_URL   CloudFront distribution URL
  MARKETPLACE_DOMAIN            Marketplace domain for SSL checks
  API_DOMAIN                    API domain for SSL checks

EXIT CODES:
  0   All checks passed
  1   Some checks failed (non-critical)
  2   Critical checks failed
  3   Error during execution

For more information, see: docs/epic16details.md
`;
  
  console.log(helpText);
}

// =============================================================================
// Configuration Management
// =============================================================================

function loadEnvironmentDefaults(): any {
  // Load common defaults from environment
  const defaults = {};
  
  // Auto-detect environment based on NODE_ENV
  if (process.env.NODE_ENV) {
    defaults.environment = process.env.NODE_ENV;
  }
  
  // Auto-detect verbose mode in CI
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    defaults.verbose = true;
    defaults.colors = false;
  }
  
  return defaults;
}

function validateOptions(options: any): void {
  const errors = [];
  
  // Validate format
  const validFormats = ['console', 'json', 'html', 'markdown'];
  if (!validFormats.includes(options.format)) {
    errors.push(`Invalid format: ${options.format}. Must be one of: ${validFormats.join(', ')}`);
  }
  
  // Validate environment
  const validEnvironments = ['development', 'staging', 'production'];
  if (!validEnvironments.includes(options.environment)) {
    errors.push(`Invalid environment: ${options.environment}. Must be one of: ${validEnvironments.join(', ')}`);
  }
  
  // Validate timeout
  if (options.timeout < 1000 || options.timeout > 300000) {
    errors.push('Timeout must be between 1 and 300 seconds');
  }
  
  // Validate concurrency
  if (options.concurrency < 1 || options.concurrency > 20) {
    errors.push('Concurrency must be between 1 and 20');
  }
  
  // Validate config file exists
  if (options.configFile && !fs.existsSync(options.configFile)) {
    errors.push(`Configuration file not found: ${options.configFile}`);
  }
  
  // Validate output file directory exists
  if (options.outputFile) {
    const outputDir = path.dirname(options.outputFile);
    if (!fs.existsSync(outputDir)) {
      errors.push(`Output directory does not exist: ${outputDir}`);
    }
  }
  
  return errors;
}

// =============================================================================
// Main Execution
// =============================================================================

async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const rawOptions = parseArguments();
    
    // Show help if requested
    if (rawOptions.help) {
      displayHelp();
      process.exit(0);
    }
    
    // Handle health check
    if (rawOptions.healthCheck) {
      const exitCode = await checkEpic16Health();
      process.exit(exitCode);
    }
    
    // Load environment defaults
    const envDefaults = loadEnvironmentDefaults();
    const options = { ...envDefaults, ...rawOptions };
    
    // Validate options
    const validationErrors = validateOptions(options);
    if (validationErrors.length > 0) {
      console.error('❌ Configuration errors:');
      validationErrors.forEach(error => console.error(`   ${error}`));
      process.exit(1);
    }
    
    // Create and run prerequisite runner
    console.log('🚀 Starting Epic 16 prerequisite checks...');
    console.log(`📋 Environment: ${options.environment}`);
    
    if (options.verbose) {
      console.log('⚙️  Configuration:');
      console.log(`   Format: ${options.format}`);
      console.log(`   Timeout: ${options.timeout / 1000}s`);
      console.log(`   Concurrency: ${options.concurrency}`);
      console.log(`   Auto-fix: ${options.autoFix ? 'enabled' : 'disabled'}`);
      
      if (options.categories.length > 0) {
        console.log(`   Categories: ${options.categories.join(', ')}`);
      }
      
      if (options.skipChecks.length > 0) {
        console.log(`   Skipping: ${options.skipChecks.join(', ')}`);
      }
      
      if (options.onlyChecks.length > 0) {
        console.log(`   Only: ${options.onlyChecks.join(', ')}`);
      }
    }
    
    const runner = createEpic16PrerequisiteRunner(options);
    const result = await runner.run();
    
    // Set exit code based on results
    if (result.success) {
      console.log('\n🎉 All Epic 16 prerequisites satisfied!');
      process.exit(0);
    } else {
      const criticalFailures = result.report.overall.criticalFailures;
      if (criticalFailures > 0) {
        console.log(`\n❌ ${criticalFailures} critical prerequisite(s) failed. Epic 16 deployment is blocked.`);
        process.exit(2);
      } else {
        console.log('\n⚠️  Some prerequisites failed, but no critical issues detected.');
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error(`\n💥 Unexpected error: ${error.message}`);
    
    if (process.env.DEBUG || rawOptions?.verbose) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(3);
  }
}

// =============================================================================
// Package.json Integration Helper
// =============================================================================

/**
 * Export functions for use in other scripts or package.json
 */
if (require.main === module) {
  // Direct execution
  main().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(3);
  });
} else {
  // Required as module
  module.exports = {
    runPrerequisiteCheck: main,
    parseArguments,
    displayHelp,
    validateOptions
  };
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Prerequisites check interrupted by user');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Prerequisites check terminated');
  process.exit(143);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});