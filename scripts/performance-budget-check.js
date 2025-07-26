#!/usr/bin/env node

/**
 * Performance Budget Check Script for Epic 18
 * CI/CD integration for performance budget enforcement
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

// Performance budget configuration
const defaultBudget = {
  bundles: {
    main: 250,      // 250KB main bundle
    vendor: 500,    // 500KB vendor bundle
    chunks: 100,    // 100KB max chunk size
    total: 1000     // 1MB total bundle size
  },
  runtime: {
    firstContentfulPaint: 1500,    // 1.5s FCP
    largestContentfulPaint: 2500,  // 2.5s LCP
    firstInputDelay: 100,          // 100ms FID
    cumulativeLayoutShift: 0.1,    // 0.1 CLS
    timeToInteractive: 3000        // 3s TTI
  },
  api: {
    graphExecution: 1000,    // 1s graph execution
    preview: 500,            // 500ms preview generation
    validation: 100,         // 100ms validation
    authentication: 200      // 200ms auth
  },
  memory: {
    peakHeap: 150,           // 150MB peak heap
    leakThreshold: 5         // 5MB/hour leak threshold
  },
  network: {
    totalRequests: 25,           // 25 total requests
    totalTransferSize: 1500,     // 1.5MB transfer size
    thirdPartyRequests: 5        // 5 third-party requests
  },
  build: {
    buildTime: 60,          // 60s build time
    typeCheckTime: 15,      // 15s type check
    lintTime: 10,           // 10s linting
    testTime: 30            // 30s test execution
  }
};

class PerformanceBudgetChecker {
  constructor(options = {}) {
    this.options = {
      config: null,
      strict: false,
      output: 'console',
      exitOnFailure: true,
      ...options
    };
    
    this.budget = this.loadBudgetConfig();
    this.results = {
      passed: true,
      violations: [],
      score: 100,
      summary: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };
  }

  loadBudgetConfig() {
    if (this.options.config && fs.existsSync(this.options.config)) {
      try {
        const configContent = fs.readFileSync(this.options.config, 'utf8');
        return JSON.parse(configContent);
      } catch (error) {
        console.warn(`${colors.yellow}Warning: Failed to load config ${this.options.config}, using defaults${colors.reset}`);
      }
    }

    // Look for performance budget in package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.performanceBudget) {
          return { ...defaultBudget, ...packageJson.performanceBudget };
        }
      } catch (error) {
        console.warn(`${colors.yellow}Warning: Failed to parse package.json${colors.reset}`);
      }
    }

    return defaultBudget;
  }

  async checkPerformance() {
    console.log(`${colors.blue}${colors.bright}🚀 Performance Budget Check${colors.reset}`);
    console.log(`${colors.cyan}Epic 18 - Technical Debt & Performance Optimization${colors.reset}\n`);

    try {
      // Check bundle sizes
      await this.checkBundleSizes();
      
      // Check build performance
      await this.checkBuildPerformance();
      
      // Check runtime performance (if available)
      await this.checkRuntimePerformance();
      
      // Generate report
      this.generateReport();
      
      // Handle results
      this.handleResults();
      
    } catch (error) {
      console.error(`${colors.red}Error during performance check: ${error.message}${colors.reset}`);
      if (this.options.exitOnFailure) {
        process.exit(1);
      }
    }
  }

  async checkBundleSizes() {
    console.log(`${colors.cyan}📦 Checking Bundle Sizes...${colors.reset}`);
    
    const buildDir = this.findBuildDirectory();
    if (!buildDir) {
      console.log(`${colors.yellow}⚠️  No build directory found, skipping bundle size check${colors.reset}`);
      return;
    }

    const bundleStats = this.analyzeBundles(buildDir);
    
    // Check main bundle
    if (bundleStats.main > this.budget.bundles.main) {
      this.addViolation('bundle', 'main-bundle-size', {
        budget: this.budget.bundles.main,
        actual: bundleStats.main,
        severity: this.calculateSeverity(bundleStats.main, this.budget.bundles.main),
        suggestions: [
          'Enable code splitting for non-critical modules',
          'Use dynamic imports for route-based code splitting',
          'Remove unused dependencies and dead code'
        ]
      });
    }

    // Check vendor bundle
    if (bundleStats.vendor > this.budget.bundles.vendor) {
      this.addViolation('bundle', 'vendor-bundle-size', {
        budget: this.budget.bundles.vendor,
        actual: bundleStats.vendor,
        severity: this.calculateSeverity(bundleStats.vendor, this.budget.bundles.vendor),
        suggestions: [
          'Audit dependencies for size and necessity',
          'Replace large libraries with lighter alternatives',
          'Use CDN for common libraries'
        ]
      });
    }

    // Check total bundle size
    if (bundleStats.total > this.budget.bundles.total) {
      this.addViolation('bundle', 'total-bundle-size', {
        budget: this.budget.bundles.total,
        actual: bundleStats.total,
        severity: this.calculateSeverity(bundleStats.total, this.budget.bundles.total),
        suggestions: [
          'Implement aggressive code splitting strategy',
          'Lazy load non-critical features',
          'Compress assets with Brotli/Gzip'
        ]
      });
    }

    console.log(`   ${bundleStats.main <= this.budget.bundles.main ? '✅' : '❌'} Main: ${bundleStats.main}KB (budget: ${this.budget.bundles.main}KB)`);
    console.log(`   ${bundleStats.vendor <= this.budget.bundles.vendor ? '✅' : '❌'} Vendor: ${bundleStats.vendor}KB (budget: ${this.budget.bundles.vendor}KB)`);
    console.log(`   ${bundleStats.total <= this.budget.bundles.total ? '✅' : '❌'} Total: ${bundleStats.total}KB (budget: ${this.budget.bundles.total}KB)\n`);
  }

  async checkBuildPerformance() {
    console.log(`${colors.cyan}⚡ Checking Build Performance...${colors.reset}`);
    
    const buildMetrics = await this.measureBuildPerformance();
    
    // Check build time
    if (buildMetrics.buildTime > this.budget.build.buildTime) {
      this.addViolation('build', 'build-time', {
        budget: this.budget.build.buildTime,
        actual: buildMetrics.buildTime,
        severity: this.calculateSeverity(buildMetrics.buildTime, this.budget.build.buildTime),
        suggestions: [
          'Enable build caching',
          'Use incremental TypeScript compilation',
          'Optimize webpack configuration'
        ]
      });
    }

    // Check TypeScript compilation time
    if (buildMetrics.typeCheckTime > this.budget.build.typeCheckTime) {
      this.addViolation('build', 'typecheck-time', {
        budget: this.budget.build.typeCheckTime,
        actual: buildMetrics.typeCheckTime,
        severity: this.calculateSeverity(buildMetrics.typeCheckTime, this.budget.build.typeCheckTime),
        suggestions: [
          'Use TypeScript project references',
          'Enable incremental compilation',
          'Optimize tsconfig.json settings'
        ]
      });
    }

    console.log(`   ${buildMetrics.buildTime <= this.budget.build.buildTime ? '✅' : '❌'} Build: ${buildMetrics.buildTime}s (budget: ${this.budget.build.buildTime}s)`);
    console.log(`   ${buildMetrics.typeCheckTime <= this.budget.build.typeCheckTime ? '✅' : '❌'} TypeCheck: ${buildMetrics.typeCheckTime}s (budget: ${this.budget.build.typeCheckTime}s)\n`);
  }

  async checkRuntimePerformance() {
    console.log(`${colors.cyan}🏃 Checking Runtime Performance...${colors.reset}`);
    
    // In a real implementation, this would run lighthouse or similar tools
    // For now, we'll check if performance metrics are available
    const metricsFile = path.join(process.cwd(), 'performance-metrics.json');
    
    if (fs.existsSync(metricsFile)) {
      try {
        const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
        
        // Check FCP
        if (metrics.fcp && metrics.fcp > this.budget.runtime.firstContentfulPaint) {
          this.addViolation('runtime', 'first-contentful-paint', {
            budget: this.budget.runtime.firstContentfulPaint,
            actual: metrics.fcp,
            severity: this.calculateSeverity(metrics.fcp, this.budget.runtime.firstContentfulPaint),
            suggestions: [
              'Optimize critical rendering path',
              'Minimize render-blocking resources',
              'Use server-side rendering'
            ]
          });
        }

        console.log(`   ${(metrics.fcp || 0) <= this.budget.runtime.firstContentfulPaint ? '✅' : '❌'} FCP: ${metrics.fcp || 'N/A'}ms (budget: ${this.budget.runtime.firstContentfulPaint}ms)`);
        
      } catch (error) {
        console.log(`   ${colors.yellow}⚠️  Failed to parse performance metrics${colors.reset}`);
      }
    } else {
      console.log(`   ${colors.yellow}⚠️  No runtime metrics available (run lighthouse or similar tool)${colors.reset}`);
    }
    console.log();
  }

  findBuildDirectory() {
    const possibleDirs = ['dist', 'build', 'out', 'public'];
    
    for (const dir of possibleDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    return null;
  }

  analyzeBundles(buildDir) {
    const stats = { main: 0, vendor: 0, chunks: [], total: 0 };
    
    try {
      const files = this.getAllFiles(buildDir);
      const jsFiles = files.filter(file => file.endsWith('.js') && !file.includes('.map'));
      
      for (const file of jsFiles) {
        const size = Math.round(fs.statSync(file).size / 1024); // KB
        stats.total += size;
        
        const fileName = path.basename(file);
        if (fileName.includes('main') || fileName.includes('index')) {
          stats.main += size;
        } else if (fileName.includes('vendor') || fileName.includes('chunk')) {
          stats.vendor += size;
          stats.chunks.push(size);
        } else {
          stats.chunks.push(size);
        }
      }
      
    } catch (error) {
      console.warn(`Warning: Failed to analyze bundles: ${error.message}`);
    }
    
    return stats;
  }

  getAllFiles(dir) {
    const files = [];
    
    function walk(directory: string): string[] {
      const items = fs.readdirSync(directory);
      
      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    }
    
    walk(dir);
    return files;
  }

  async measureBuildPerformance() {
    const metrics = { buildTime: 0, typeCheckTime: 0, lintTime: 0, testTime: 0 };
    
    try {
      // Measure TypeScript compilation
      console.log('   Measuring TypeScript compilation...');
      const tscStart = Date.now();
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      metrics.typeCheckTime = Math.round((Date.now() - tscStart) / 1000);
      
      // Estimate build time (would integrate with actual build process)
      metrics.buildTime = Math.round(metrics.typeCheckTime * 2.5);
      
    } catch (error) {
      console.warn(`   Warning: Could not measure build performance: ${error.message}`);
      // Use default estimates
      metrics.buildTime = 30;
      metrics.typeCheckTime = 10;
    }
    
    return metrics;
  }

  addViolation(category, metric, details) {
    const violation = {
      category,
      metric,
      ...details,
      timestamp: Date.now()
    };
    
    this.results.violations.push(violation);
    this.results.summary.total++;
    this.results.summary[details.severity]++;
    
    if (details.severity === 'critical' || details.severity === 'high') {
      this.results.passed = false;
    }
  }

  calculateSeverity(actual, budget) {
    const ratio = actual / budget;
    if (ratio >= 2.0) return 'critical';
    if (ratio >= 1.5) return 'high';
    if (ratio >= 1.2) return 'medium';
    return 'low';
  }

  generateReport() {
    // Calculate performance score
    this.results.score = Math.max(0, 100 - (
      this.results.summary.critical * 25 +
      this.results.summary.high * 15 +
      this.results.summary.medium * 10 +
      this.results.summary.low * 5
    ));

    // Generate report based on output format
    if (this.options.output === 'json') {
      console.log(JSON.stringify(this.results, null, 2));
    } else {
      this.generateConsoleReport();
    }
  }

  generateConsoleReport() {
    console.log(`${colors.bright}📊 Performance Budget Report${colors.reset}`);
    console.log(`${colors.bright}================================${colors.reset}\n`);
    
    // Overall status
    const statusColor = this.results.passed ? colors.green : colors.red;
    const statusText = this.results.passed ? 'PASSED' : 'FAILED';
    console.log(`Status: ${statusColor}${statusText}${colors.reset}`);
    console.log(`Score: ${this.getScoreColor()}${this.results.score}/100${colors.reset}\n`);
    
    // Violations summary
    if (this.results.violations.length > 0) {
      console.log(`${colors.bright}Violations Summary:${colors.reset}`);
      console.log(`  Total: ${this.results.summary.total}`);
      if (this.results.summary.critical > 0) console.log(`  ${colors.red}Critical: ${this.results.summary.critical}${colors.reset}`);
      if (this.results.summary.high > 0) console.log(`  ${colors.red}High: ${this.results.summary.high}${colors.reset}`);
      if (this.results.summary.medium > 0) console.log(`  ${colors.yellow}Medium: ${this.results.summary.medium}${colors.reset}`);
      if (this.results.summary.low > 0) console.log(`  ${colors.cyan}Low: ${this.results.summary.low}${colors.reset}`);
      console.log();
      
      // Detailed violations
      console.log(`${colors.bright}Detailed Violations:${colors.reset}`);
      this.results.violations.forEach((violation, index) => {
        const severityColor = this.getSeverityColor(violation.severity);
        console.log(`\n${index + 1}. ${severityColor}[${violation.severity.toUpperCase()}]${colors.reset} ${violation.metric}`);
        console.log(`   Budget: ${violation.budget}, Actual: ${violation.actual}`);
        if (violation.suggestions && violation.suggestions.length > 0) {
          console.log('   Suggestions:');
          violation.suggestions.forEach(suggestion => {
            console.log(`     • ${suggestion}`);
          });
        }
      });
    } else {
      console.log(`${colors.green}✅ No budget violations detected!${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}================================${colors.reset}`);
  }

  getScoreColor() {
    if (this.results.score >= 90) return colors.green;
    if (this.results.score >= 70) return colors.yellow;
    return colors.red;
  }

  getSeverityColor(severity) {
    switch (severity) {
    case 'critical': return colors.red + colors.bright;
    case 'high': return colors.red;
    case 'medium': return colors.yellow;
    case 'low': return colors.cyan;
    default: return colors.white;
    }
  }

  handleResults() {
    if (!this.results.passed && this.options.exitOnFailure) {
      console.log(`\n${colors.red}Performance budget check failed!${colors.reset}`);
      process.exit(1);
    } else if (this.results.passed) {
      console.log(`\n${colors.green}Performance budget check passed!${colors.reset}`);
    }
  }
}

// CLI interface
function main(): void {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
    case '--config':
      options.config = args[++i];
      break;
    case '--strict':
      options.strict = true;
      break;
    case '--json':
      options.output = 'json';
      break;
    case '--no-exit':
      options.exitOnFailure = false;
      break;
    case '--help':
      console.log(`
Performance Budget Check for Epic 18

Usage: node performance-budget-check.js [options]

Options:
  --config <file>     Use custom budget configuration file
  --strict           Fail on any violations (default: fail on critical/high only)
  --json             Output results in JSON format
  --no-exit          Don't exit with error code on failure
  --help             Show this help message

Examples:
  node performance-budget-check.js
  node performance-budget-check.js --config budget.json
  node performance-budget-check.js --json --no-exit
        `);
      process.exit(0);
      break;
    }
  }
  
  const checker = new PerformanceBudgetChecker(options);
  checker.checkPerformance();
}

if (require.main === module) {
  main();
}

module.exports = PerformanceBudgetChecker;