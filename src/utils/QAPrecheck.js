#!/usr/bin/env node

/**
 * Automated QA Pre-check Utility
 *
 * Validates code quality before submission to QA agent to prevent failed QA cycles
 * and reduce back-and-forth. Checks syntax, TypeScript errors, test coverage,
 * security patterns, and code quality metrics.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

class QAPrecheck {
  constructor() {
    this.projectRoot = process.cwd();
    this.configFile = path.join(
      this.projectRoot,
      'src/data/qa-precheck-config.json'
    );
    this.resultsFile = path.join(
      this.projectRoot,
      'src/data/qa-precheck-results.json'
    );

    // Default configuration
    this.config = {
      checks: {
        syntax: true,
        typescript: true,
        eslint: true,
        tests: true,
        testCoverage: true,
        security: true,
        dependencies: true,
        fileSize: true,
        codeComplexity: true
      },

      thresholds: {
        testCoverage: 80, // Minimum test coverage percentage
        maxFileSize: 1000, // Maximum lines per file
        maxCyclomaticComplexity: 10,
        maxFunctionLength: 50,
        maxParameterCount: 5
      },

      security: {
        // Dangerous patterns to detect
        dangerousPatterns: [
          'eval\\(',
          'Function\\(',
          'innerHTML\\s*=',
          'outerHTML\\s*=',
          'document\\.write',
          'setTimeout\\s*\\(\\s*["\']',
          'setInterval\\s*\\(\\s*["\']',
          'process\\.env\\.',
          'localStorage\\.',
          'sessionStorage\\.',
          'btoa\\(',
          'atob\\('
        ],

        // Secrets patterns
        secretPatterns: [
          'password\\s*[:=]\\s*["\']\\w+',
          'api[_-]?key\\s*[:=]\\s*["\']\\w+',
          'secret\\s*[:=]\\s*["\']\\w+',
          'token\\s*[:=]\\s*["\']\\w+',
          'auth\\s*[:=]\\s*["\']\\w+'
        ]
      },

      ignorePaths: [
        'node_modules',
        '.git',
        'dist',
        'build',
        '.next',
        'coverage',
        '.turbo'
      ],

      strictMode: false // When true, any failure fails the entire check
    };

    this.results = {
      overall: 'unknown',
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0,
        total: 0
      },
      blockers: [],
      warnings: [],
      recommendations: []
    };
  }

  /**
   * Initialize the QA precheck utility
   */
  async initialize() {
    try {
      await this.loadConfig();
      console.log('✅ QA Precheck utility initialized');
    } catch (error) {
      console.error('❌ Failed to initialize QA Precheck:', error);
      throw error;
    }
  }

  /**
   * Run all configured checks
   */
  async runAllChecks(options = {}) {
    const { files = [], taskId = null } = options;

    console.log('🔍 Starting QA Pre-check validation...\n');

    try {
      this.results.timestamp = new Date().toISOString();
      this.results.taskId = taskId;

      const checksToRun = Object.entries(this.config.checks)
        .filter(([, enabled]) => enabled)
        .map(([checkName]) => checkName);

      console.log(
        `Running ${checksToRun.length} checks: ${checksToRun.join(', ')}`
      );

      // Run each check
      for (const checkName of checksToRun) {
        await this.runCheck(checkName, files);
      }

      // Calculate overall result
      this.calculateOverallResult();

      // Generate recommendations
      this.generateRecommendations();

      // Save results
      await this.saveResults();

      // Display summary
      this.displaySummary();

      return this.results;
    } catch (error) {
      console.error('❌ QA Precheck failed:', error);
      this.results.overall = 'error';
      this.results.error = error.message;
      return this.results;
    }
  }

  /**
   * Run a specific check
   */
  async runCheck(checkName, files = []) {
    console.log(`\n🔎 Running ${checkName} check...`);

    try {
      let result;

      switch (checkName) {
        case 'syntax':
          result = await this.checkSyntax(files);
          break;
        case 'typescript':
          result = await this.checkTypeScript();
          break;
        case 'eslint':
          result = await this.checkESLint(files);
          break;
        case 'tests':
          result = await this.checkTests();
          break;
        case 'testCoverage':
          result = await this.checkTestCoverage();
          break;
        case 'security':
          result = await this.checkSecurity(files);
          break;
        case 'dependencies':
          result = await this.checkDependencies();
          break;
        case 'fileSize':
          result = await this.checkFileSize(files);
          break;
        case 'codeComplexity':
          result = await this.checkComplexity(files);
          break;
        default:
          result = {
            status: 'skipped',
            message: `Unknown check: ${checkName}`
          };
      }

      this.results.checks[checkName] = result;
      this.updateSummary(result);

      const statusIcon =
        result.status === 'passed'
          ? '✅'
          : result.status === 'failed'
            ? '❌'
            : '⚠️';
      console.log(`${statusIcon} ${checkName}: ${result.message}`);
    } catch (error) {
      const failureResult = {
        status: 'failed',
        message: `Check failed: ${error.message}`,
        error: error.message
      };

      this.results.checks[checkName] = failureResult;
      this.updateSummary(failureResult);
      console.log(`❌ ${checkName}: ${failureResult.message}`);
    }
  }

  /**
   * Check JavaScript/TypeScript syntax
   */
  async checkSyntax(files = []) {
    const filesToCheck =
      files.length > 0 ? files : await this.findSourceFiles();
    const errors = [];

    for (const file of filesToCheck) {
      try {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          // Use TypeScript compiler for syntax check
          execSync(`npx tsc --noEmit --skipLibCheck "${file}"`, {
            stdio: 'pipe'
          });
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
          // Use Node.js syntax check
          execSync(`node --check "${file}"`, { stdio: 'pipe' });
        }
      } catch (error) {
        errors.push({
          file,
          error: error.stderr ? error.stderr.toString() : error.message
        });
      }
    }

    return {
      status: errors.length === 0 ? 'passed' : 'failed',
      message:
        errors.length === 0
          ? `Syntax check passed for ${filesToCheck.length} files`
          : `Syntax errors found in ${errors.length} files`,
      details: { errors, filesChecked: filesToCheck.length }
    };
  }

  /**
   * Check TypeScript compilation
   */
  async checkTypeScript() {
    try {
      // Check if TypeScript is configured
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
      await fs.access(tsconfigPath);

      // Run TypeScript compiler
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: this.projectRoot });

      return {
        status: 'passed',
        message: 'TypeScript compilation successful'
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'TypeScript compilation errors found',
        details: {
          error: error.stderr ? error.stderr.toString() : error.message
        }
      };
    }
  }

  /**
   * Check ESLint violations
   */
  async checkESLint(files = []) {
    try {
      const eslintCmd =
        files.length > 0
          ? `npx eslint ${files.join(' ')}`
          : 'npx eslint src --ext .js,.jsx,.ts,.tsx';

      const output = execSync(eslintCmd, {
        stdio: 'pipe',
        cwd: this.projectRoot
      });

      return {
        status: 'passed',
        message: 'ESLint check passed - no violations found'
      };
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const errorCount = (output.match(/error/gi) || []).length;
      const warningCount = (output.match(/warning/gi) || []).length;

      return {
        status: errorCount > 0 ? 'failed' : 'warning',
        message: `ESLint found ${errorCount} errors and ${warningCount} warnings`,
        details: { errors: errorCount, warnings: warningCount, output }
      };
    }
  }

  /**
   * Check test existence and execution
   */
  async checkTests() {
    try {
      // Check if jest is configured
      const jestConfig = await this.findFile([
        'jest.config.js',
        'jest.config.ts',
        'package.json'
      ]);
      if (!jestConfig) {
        return {
          status: 'warning',
          message: 'No Jest configuration found'
        };
      }

      // Run tests
      const testOutput = execSync('npm test -- --passWithNoTests', {
        stdio: 'pipe',
        cwd: this.projectRoot
      }).toString();

      const testResults = this.parseJestOutput(testOutput);

      return {
        status: testResults.failed === 0 ? 'passed' : 'failed',
        message: `Tests: ${testResults.passed} passed, ${testResults.failed} failed`,
        details: testResults
      };
    } catch (error) {
      return {
        status: 'failed',
        message: 'Test execution failed',
        details: { error: error.message }
      };
    }
  }

  /**
   * Check test coverage
   */
  async checkTestCoverage() {
    try {
      const coverageOutput = execSync(
        'npm test -- --coverage --passWithNoTests',
        {
          stdio: 'pipe',
          cwd: this.projectRoot
        }
      ).toString();

      const coverage = this.parseCoverageOutput(coverageOutput);
      const threshold = this.config.thresholds.testCoverage;

      return {
        status: coverage.total >= threshold ? 'passed' : 'failed',
        message: `Test coverage: ${coverage.total}% (threshold: ${threshold}%)`,
        details: coverage
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Could not determine test coverage',
        details: { error: error.message }
      };
    }
  }

  /**
   * Check for security issues
   */
  async checkSecurity(files = []) {
    const filesToCheck =
      files.length > 0 ? files : await this.findSourceFiles();
    const issues = [];

    for (const file of filesToCheck) {
      try {
        const content = await fs.readFile(file, 'utf8');

        // Check for dangerous patterns
        for (const pattern of this.config.security.dangerousPatterns) {
          const regex = new RegExp(pattern, 'gi');
          const matches = content.match(regex);
          if (matches) {
            issues.push({
              file,
              type: 'dangerous_pattern',
              pattern,
              matches: matches.length
            });
          }
        }

        // Check for potential secrets
        for (const pattern of this.config.security.secretPatterns) {
          const regex = new RegExp(pattern, 'gi');
          const matches = content.match(regex);
          if (matches) {
            issues.push({
              file,
              type: 'potential_secret',
              pattern,
              matches: matches.length
            });
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      status: issues.length === 0 ? 'passed' : 'failed',
      message:
        issues.length === 0
          ? 'No security issues detected'
          : `Found ${issues.length} potential security issues`,
      details: { issues, filesChecked: filesToCheck.length }
    };
  }

  /**
   * Check dependencies for known vulnerabilities
   */
  async checkDependencies() {
    try {
      // Check if package.json exists
      await fs.access(path.join(this.projectRoot, 'package.json'));

      // Run npm audit
      const auditOutput = execSync('npm audit --audit-level=moderate', {
        stdio: 'pipe',
        cwd: this.projectRoot
      }).toString();

      return {
        status: 'passed',
        message: 'No dependency vulnerabilities found'
      };
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : '';
      const vulnerabilities = this.parseAuditOutput(output);

      return {
        status:
          vulnerabilities.high > 0 || vulnerabilities.critical > 0
            ? 'failed'
            : 'warning',
        message: `Dependencies: ${vulnerabilities.total} vulnerabilities found`,
        details: vulnerabilities
      };
    }
  }

  /**
   * Check file sizes
   */
  async checkFileSize(files = []) {
    const filesToCheck =
      files.length > 0 ? files : await this.findSourceFiles();
    const threshold = this.config.thresholds.maxFileSize;
    const largeFiles = [];

    for (const file of filesToCheck) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lineCount = content.split('\n').length;

        if (lineCount > threshold) {
          largeFiles.push({ file, lines: lineCount });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      status: largeFiles.length === 0 ? 'passed' : 'warning',
      message:
        largeFiles.length === 0
          ? `All files under ${threshold} lines`
          : `${largeFiles.length} files exceed ${threshold} line limit`,
      details: { largeFiles, threshold }
    };
  }

  /**
   * Check code complexity
   */
  async checkComplexity(files = []) {
    const filesToCheck =
      files.length > 0 ? files : await this.findSourceFiles();
    const complexFunctions = [];

    for (const file of filesToCheck) {
      try {
        if (
          !file.endsWith('.js') &&
          !file.endsWith('.ts') &&
          !file.endsWith('.jsx') &&
          !file.endsWith('.tsx')
        ) {
          continue;
        }

        const content = await fs.readFile(file, 'utf8');
        const functions = this.extractFunctions(content);

        for (const func of functions) {
          if (
            func.complexity > this.config.thresholds.maxCyclomaticComplexity ||
            func.lines > this.config.thresholds.maxFunctionLength ||
            func.parameters > this.config.thresholds.maxParameterCount
          ) {
            complexFunctions.push({ file, ...func });
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      status: complexFunctions.length === 0 ? 'passed' : 'warning',
      message:
        complexFunctions.length === 0
          ? 'Code complexity within acceptable limits'
          : `${complexFunctions.length} functions exceed complexity thresholds`,
      details: { complexFunctions }
    };
  }

  // Helper methods

  async findSourceFiles() {
    const sourceFiles = [];
    const srcDir = path.join(this.projectRoot, 'src');

    try {
      await fs.access(srcDir);
      const files = await this.getAllFiles(srcDir);
      return files.filter(
        file =>
          /\.(js|jsx|ts|tsx)$/.test(file) &&
          !this.config.ignorePaths.some(ignore => file.includes(ignore))
      );
    } catch {
      // Fallback to current directory
      const files = await this.getAllFiles(this.projectRoot);
      return files.filter(
        file =>
          /\.(js|jsx|ts|tsx)$/.test(file) &&
          !this.config.ignorePaths.some(ignore => file.includes(ignore))
      );
    }
  }

  async getAllFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory() && !this.config.ignorePaths.includes(item)) {
        files.push(...(await this.getAllFiles(fullPath)));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  async findFile(candidates) {
    for (const candidate of candidates) {
      try {
        await fs.access(path.join(this.projectRoot, candidate));
        return candidate;
      } catch {
        continue;
      }
    }
    return null;
  }

  parseJestOutput(output) {
    const passed = (output.match(/✓/g) || []).length;
    const failed = (output.match(/✕/g) || []).length;
    return { passed, failed, total: passed + failed };
  }

  parseCoverageOutput(output) {
    // Simple regex to extract coverage percentage
    const match = output.match(/All files[^|]*\|\s*([0-9.]+)/);
    const total = match ? parseFloat(match[1]) : 0;
    return { total };
  }

  parseAuditOutput(output) {
    const lines = output.split('\n');
    let vulnerabilities = {
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      total: 0
    };

    for (const line of lines) {
      if (line.includes('vulnerabilities')) {
        const match = line.match(/(\d+)\s+(\w+)/g);
        if (match) {
          for (const m of match) {
            const [count, severity] = m.split(' ');
            vulnerabilities[severity.toLowerCase()] = parseInt(count);
            vulnerabilities.total += parseInt(count);
          }
        }
      }
    }

    return vulnerabilities;
  }

  extractFunctions(content) {
    // Simplified function extraction - could be enhanced with AST parsing
    const functionRegex =
      /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:function|\([^)]*\)\s*=>))/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2];
      const startIndex = match.index;

      // Simple complexity and length calculation
      const functionBody = this.extractFunctionBody(content, startIndex);
      const lines = functionBody.split('\n').length;
      const complexity = this.calculateCyclomaticComplexity(functionBody);
      const parameters = this.countParameters(match[0]);

      functions.push({ name, lines, complexity, parameters });
    }

    return functions;
  }

  extractFunctionBody(content, startIndex) {
    // Find the function body between braces
    let braceCount = 0;
    let inFunction = false;
    let body = '';

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];

      if (char === '{') {
        braceCount++;
        inFunction = true;
      } else if (char === '}') {
        braceCount--;
      }

      if (inFunction) {
        body += char;
      }

      if (inFunction && braceCount === 0) {
        break;
      }
    }

    return body;
  }

  calculateCyclomaticComplexity(code) {
    // Count decision points (simplified)
    const patterns = [
      /if\s*\(/g,
      /else/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g
    ];
    let complexity = 1; // Base complexity

    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  countParameters(functionDeclaration) {
    const match = functionDeclaration.match(/\(([^)]*)\)/);
    if (!match || !match[1].trim()) return 0;

    return match[1].split(',').filter(param => param.trim()).length;
  }

  updateSummary(result) {
    this.results.summary.total++;

    switch (result.status) {
      case 'passed':
        this.results.summary.passed++;
        break;
      case 'failed':
        this.results.summary.failed++;
        if (result.message) {
          this.results.blockers.push(result.message);
        }
        break;
      case 'warning':
        this.results.summary.warnings++;
        if (result.message) {
          this.results.warnings.push(result.message);
        }
        break;
    }
  }

  calculateOverallResult() {
    if (this.results.summary.failed > 0) {
      this.results.overall = 'failed';
    } else if (this.results.summary.warnings > 0) {
      this.results.overall = 'warning';
    } else if (this.results.summary.passed > 0) {
      this.results.overall = 'passed';
    } else {
      this.results.overall = 'unknown';
    }
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze results and generate specific recommendations
    if (this.results.checks.testCoverage?.status === 'failed') {
      recommendations.push(
        'Increase test coverage by adding tests for uncovered code paths'
      );
    }

    if (this.results.checks.security?.status === 'failed') {
      recommendations.push(
        'Review and fix security issues before submitting to QA'
      );
    }

    if (this.results.checks.eslint?.status === 'failed') {
      recommendations.push(
        'Fix ESLint errors to maintain code quality standards'
      );
    }

    if (this.results.checks.typescript?.status === 'failed') {
      recommendations.push('Resolve TypeScript compilation errors');
    }

    this.results.recommendations = recommendations;
  }

  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 QA PRE-CHECK SUMMARY');
    console.log('='.repeat(60));

    const statusIcon =
      this.results.overall === 'passed'
        ? '✅'
        : this.results.overall === 'failed'
          ? '❌'
          : '⚠️';

    console.log(
      `Overall Status: ${statusIcon} ${this.results.overall.toUpperCase()}`
    );
    console.log(`Checks Run: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);

    if (this.results.blockers.length > 0) {
      console.log('\n🚫 BLOCKERS:');
      this.results.blockers.forEach(blocker => console.log(`  • ${blocker}`));
    }

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    console.log('='.repeat(60));

    if (this.results.overall === 'passed') {
      console.log('🎉 Ready for QA submission!');
    } else if (this.results.overall === 'failed') {
      console.log('🔧 Please fix the issues above before submitting to QA');
    } else {
      console.log('⚠️  Consider addressing warnings before QA submission');
    }
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch {
      // Use defaults, save initial config
      await this.saveConfig();
    }
  }

  async saveConfig() {
    await fs.mkdir(path.dirname(this.configFile), { recursive: true });
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  async saveResults() {
    await fs.mkdir(path.dirname(this.resultsFile), { recursive: true });
    await fs.writeFile(this.resultsFile, JSON.stringify(this.results, null, 2));
  }
}

// CLI mode
if (require.main === module) {
  const precheck = new QAPrecheck();

  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      await precheck.initialize();

      switch (command) {
        case 'check':
        case 'run':
          const files = args.slice(1);
          const results = await precheck.runAllChecks({ files });
          process.exit(results.overall === 'failed' ? 1 : 0);
          break;
        case 'syntax':
          await precheck.runCheck('syntax');
          break;
        case 'typescript':
          await precheck.runCheck('typescript');
          break;
        case 'eslint':
          await precheck.runCheck('eslint');
          break;
        case 'tests':
          await precheck.runCheck('tests');
          break;
        case 'security':
          await precheck.runCheck('security');
          break;
        case 'config':
          console.log('Current configuration:');
          console.log(JSON.stringify(precheck.config, null, 2));
          break;
        case 'help':
        default:
          console.log(`
🔍 QA Pre-check Utility

USAGE:
  node QAPrecheck.js <command> [files...]

COMMANDS:
  check/run [files]    Run all checks (optionally on specific files)
  syntax              Run syntax check only
  typescript          Run TypeScript check only
  eslint              Run ESLint check only
  tests               Run test check only
  security            Run security check only
  config              Show current configuration
  help                Show this help

EXAMPLES:
  node QAPrecheck.js check                    # Check entire project
  node QAPrecheck.js check src/utils/*.js     # Check specific files
  node QAPrecheck.js typescript               # TypeScript check only
  node QAPrecheck.js security                 # Security scan only

EXIT CODES:
  0 = All checks passed (or warnings only)
  1 = One or more checks failed

CONFIGURATION:
  Edit src/data/qa-precheck-config.json to customize checks and thresholds
`);
          break;
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = QAPrecheck;
