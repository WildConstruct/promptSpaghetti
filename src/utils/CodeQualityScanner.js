#!/usr/bin/env node

/**
 * Code Quality Scanner
 *
 * Comprehensive code quality analysis tool with pre-commit hooks, code smell detection,
 * performance optimization suggestions, and automated quality improvements.
 *
 * Key Features:
 * - Pre-commit hook integration for quality gates
 * - Code smell detection and classification
 * - Performance bottleneck identification
 * - Automated code formatting and fixes
 * - Technical debt tracking and prioritization
 * - Integration with CI/CD pipelines
 * - Customizable quality rules and thresholds
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

class CodeQualityScanner {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/quality');
    this.hooksDir = path.join(process.cwd(), '.git/hooks');
    this.configFile = path.join(this.dataDir, 'quality-config.json');
    this.resultsFile = path.join(this.dataDir, 'quality-results.json');
    this.debtFile = path.join(this.dataDir, 'technical-debt.json');
    this.trendsFile = path.join(this.dataDir, 'quality-trends.json');

    // Configuration for code quality rules
    this.config = {
      rules: {
        // Code smell rules
        codeSmells: {
          duplicateCode: { enabled: true, threshold: 10, severity: 'medium' },
          longMethods: { enabled: true, threshold: 50, severity: 'low' },
          largeClasses: { enabled: true, threshold: 500, severity: 'medium' },
          deepNesting: { enabled: true, threshold: 4, severity: 'medium' },
          complexConditions: { enabled: true, threshold: 3, severity: 'low' },
          magicNumbers: { enabled: true, severity: 'low' },
          deadCode: { enabled: true, severity: 'medium' },
          improperNaming: { enabled: true, severity: 'low' },
        },

        // Performance rules
        performance: {
          inefficientLoops: { enabled: true, severity: 'medium' },
          unnecessaryRerendering: { enabled: true, severity: 'high' },
          memoryLeaks: { enabled: true, severity: 'high' },
          slowRegex: { enabled: true, severity: 'medium' },
          largeBundle: { enabled: true, threshold: 1000000, severity: 'medium' },
          synchronousOperations: { enabled: true, severity: 'medium' },
        },

        // Security rules
        security: {
          xssVulnerabilities: { enabled: true, severity: 'high' },
          sqlInjection: { enabled: true, severity: 'high' },
          unsafeEval: { enabled: true, severity: 'high' },
          hardcodedSecrets: { enabled: true, severity: 'critical' },
          insecureRandomness: { enabled: true, severity: 'medium' },
          prototype污染: { enabled: true, severity: 'high' },
        },

        // Maintainability rules
        maintainability: {
          missingDocumentation: { enabled: true, severity: 'low' },
          inconsistentStyle: { enabled: true, severity: 'low' },
          tightCoupling: { enabled: true, severity: 'medium' },
          godObjects: { enabled: true, severity: 'high' },
          featureEnvy: { enabled: true, severity: 'medium' },
        },
      },

      hooks: {
        preCommit: {
          enabled: true,
          runLinter: true,
          runTests: false, // Can be slow
          checkQuality: true,
          blockOnFailure: true,
          allowOverride: true, // Allow --no-verify to skip
        },

        prePush: {
          enabled: true,
          runFullScan: true,
          runTests: true,
          blockOnFailure: false, // Warning only for pre-push
          generateReport: true,
        },
      },

      thresholds: {
        // Quality gate thresholds
        overallQuality: 7.0, // Out of 10
        codeSmellCount: 10, // Max allowed code smells
        securityIssues: 0, // No security issues allowed
        performanceIssues: 5, // Max performance issues
        duplicateCodePercent: 3, // Max 3% duplicate code
        testCoverage: 80, // Min 80% test coverage
        documentationCoverage: 60, // Min 60% documentation coverage
      },

      autoFix: {
        enabled: true,
        rules: {
          formatting: true, // Auto-format code
          imports: true, // Organize imports
          unusedVariables: true, // Remove unused variables
          semicolons: true, // Add missing semicolons
          quotes: true, // Normalize quote style
          trailingWhitespace: true, // Remove trailing whitespace
        },

        requireConfirmation: false, // Auto-apply without asking
        createBackup: true, // Backup files before fixing
        skipLargeFiles: true, // Skip files > 1000 lines
      },

      reporting: {
        format: 'html', // html, json, text, junit
        includeFixed: true, // Include auto-fixed issues in report
        includeTrends: true, // Include historical trends
        outputFile: 'quality-report.html',
        verboseOutput: false,
      },
    };

    this.qualityResults = {
      overallScore: 0,
      issues: [],
      metrics: {},
      trends: {},
      lastScan: null,
    };

    this.technicalDebt = {
      items: [],
      totalCost: 0,
      prioritized: [],
      lastUpdate: null,
    };
  }

  /**
   * Initialize the code quality scanner
   */
  async initialize() {
    try {
      await this.ensureDirectories();
      await this.loadConfiguration();
      await this.loadExistingResults();
      await this.setupGitHooks();

      console.log('✅ Code Quality Scanner initialized');
      console.log(`📊 Loaded ${this.qualityResults.issues.length} existing issues`);
      console.log(`💳 Technical debt: ${this.technicalDebt.items.length} items`);
    } catch (error) {
      console.error('❌ Failed to initialize Code Quality Scanner:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive code quality scan
   */
  async runFullScan(options = {}) {
    console.log('🔍 Running comprehensive code quality scan...\n');

    try {
      const startTime = Date.now();
      const { paths = ['.'], fix = false, report = true } = options;

      // Reset results
      this.qualityResults = {
        overallScore: 0,
        issues: [],
        metrics: {},
        trends: {},
        lastScan: new Date().toISOString(),
      };

      // Get list of files to scan
      const files = await this.getFilesToScan(paths);
      console.log(`📂 Scanning ${files.length} files...`);

      // Run different types of analysis
      const analyses = await Promise.all([
        this.analyzeCodeSmells(files),
        this.analyzePerformance(files),
        this.analyzeSecurity(files),
        this.analyzeMaintainability(files),
        this.analyzeTestCoverage(),
        this.analyzeDocumentation(files),
      ]);

      // Consolidate results
      for (const analysis of analyses) {
        this.qualityResults.issues.push(...analysis.issues);
        Object.assign(this.qualityResults.metrics, analysis.metrics);
      }

      // Calculate overall quality score
      this.qualityResults.overallScore = this.calculateOverallScore();

      // Apply auto-fixes if requested
      let fixedCount = 0;
      if (fix && this.config.autoFix.enabled) {
        fixedCount = await this.applyAutoFixes();
      }

      // Update technical debt
      await this.updateTechnicalDebt();

      // Generate report
      if (report) {
        await this.generateQualityReport();
      }

      // Save results
      await this.saveResults();

      const duration = Date.now() - startTime;
      console.log(`\n✅ Quality scan complete (${duration}ms):`);
      console.log(`📊 Overall Quality Score: ${this.qualityResults.overallScore.toFixed(1)}/10`);
      console.log(`🐛 Issues Found: ${this.qualityResults.issues.length}`);
      console.log(`🔧 Auto-Fixed: ${fixedCount} issues`);
      console.log(`💰 Technical Debt: $${this.technicalDebt.totalCost.toLocaleString()}`);

      return this.qualityResults;
    } catch (error) {
      console.error('❌ Quality scan failed:', error);
      throw error;
    }
  }

  /**
   * Analyze code smells
   */
  async analyzeCodeSmells(files) {
    console.log('🔍 Analyzing code smells...');

    const issues = [];
    const metrics = {
      duplicateCodePercent: 0,
      averageMethodLength: 0,
      averageClassSize: 0,
      maxNestingDepth: 0,
    };

    const duplicateBlocks = new Map();
    let totalMethods = 0;
    let totalMethodLines = 0;
    let totalClasses = 0;
    let totalClassLines = 0;
    let maxNesting = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        // Check for duplicate code
        const fileHashes = this.generateLineHashes(lines);
        for (const [hash, lineNumbers] of fileHashes.entries()) {
          if (lineNumbers.length > 1) {
            const existing = duplicateBlocks.get(hash);
            if (existing) {
              existing.push({ file, lines: lineNumbers });
            } else {
              duplicateBlocks.set(hash, [{ file, lines: lineNumbers }]);
            }
          }
        }

        // Analyze methods and functions
        const methods = this.extractMethods(content);
        totalMethods += methods.length;
        for (const method of methods) {
          totalMethodLines += method.length;

          // Check for long methods
          if (method.length > this.config.rules.codeSmells.longMethods.threshold) {
            issues.push({
              type: 'code_smell',
              subtype: 'long_method',
              severity: this.config.rules.codeSmells.longMethods.severity,
              file,
              line: method.startLine,
              message: `Method '${method.name}' is too long (${method.length} lines)`,
              suggestion: 'Consider breaking this method into smaller, more focused methods',
            });
          }

          // Check for complex conditions
          const complexConditions = this.findComplexConditions(method.content);
          for (const condition of complexConditions) {
            issues.push({
              type: 'code_smell',
              subtype: 'complex_condition',
              severity: this.config.rules.codeSmells.complexConditions.severity,
              file,
              line: condition.line,
              message: 'Complex conditional statement detected',
              suggestion: 'Consider extracting condition logic into well-named methods',
            });
          }
        }

        // Analyze classes
        const classes = this.extractClasses(content);
        totalClasses += classes.length;
        for (const cls of classes) {
          totalClassLines += cls.length;

          // Check for large classes
          if (cls.length > this.config.rules.codeSmells.largeClasses.threshold) {
            issues.push({
              type: 'code_smell',
              subtype: 'large_class',
              severity: this.config.rules.codeSmells.largeClasses.severity,
              file,
              line: cls.startLine,
              message: `Class '${cls.name}' is too large (${cls.length} lines)`,
              suggestion: 'Consider splitting this class based on responsibilities',
            });
          }
        }

        // Check nesting depth
        const nestingDepth = this.calculateMaxNestingDepth(content);
        maxNesting = Math.max(maxNesting, nestingDepth);

        if (nestingDepth > this.config.rules.codeSmells.deepNesting.threshold) {
          issues.push({
            type: 'code_smell',
            subtype: 'deep_nesting',
            severity: this.config.rules.codeSmells.deepNesting.severity,
            file,
            line: 1,
            message: `Maximum nesting depth of ${nestingDepth} exceeds threshold`,
            suggestion: 'Consider extracting nested logic into separate methods',
          });
        }

        // Check for magic numbers
        const magicNumbers = this.findMagicNumbers(content);
        for (const magicNumber of magicNumbers) {
          issues.push({
            type: 'code_smell',
            subtype: 'magic_number',
            severity: this.config.rules.codeSmells.magicNumbers.severity,
            file,
            line: magicNumber.line,
            message: `Magic number '${magicNumber.value}' should be a named constant`,
            suggestion: 'Replace magic numbers with named constants',
          });
        }

        // Check for dead code
        const deadCode = this.findDeadCode(content);
        for (const dead of deadCode) {
          issues.push({
            type: 'code_smell',
            subtype: 'dead_code',
            severity: this.config.rules.codeSmells.deadCode.severity,
            file,
            line: dead.line,
            message: 'Unreachable or unused code detected',
            suggestion: 'Remove dead code to improve maintainability',
          });
        }
      } catch (error) {
        console.warn(`Could not analyze ${file}:`, error.message);
      }
    }

    // Process duplicate code
    let duplicateLines = 0;
    let totalLines = 0;

    for (const [hash, locations] of duplicateBlocks.entries()) {
      if (locations.length > 1) {
        duplicateLines += locations.reduce((sum, loc) => sum + loc.lines.length, 0);

        // Create issue for each duplicate
        for (let i = 1; i < locations.length; i++) {
          issues.push({
            type: 'code_smell',
            subtype: 'duplicate_code',
            severity: this.config.rules.codeSmells.duplicateCode.severity,
            file: locations[i].file,
            line: locations[i].lines[0],
            message: `Duplicate code block found (${locations[i].lines.length} lines)`,
            suggestion: 'Extract duplicate code into a reusable function',
            originalLocation: {
              file: locations[0].file,
              line: locations[0].lines[0],
            },
          });
        }
      }
    }

    // Calculate metrics
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        totalLines += content.split('\n').length;
      } catch {
        // Skip files that can't be read
      }
    }

    metrics.duplicateCodePercent = totalLines > 0 ? (duplicateLines / totalLines) * 100 : 0;
    metrics.averageMethodLength = totalMethods > 0 ? totalMethodLines / totalMethods : 0;
    metrics.averageClassSize = totalClasses > 0 ? totalClassLines / totalClasses : 0;
    metrics.maxNestingDepth = maxNesting;

    console.log(`   Found ${issues.length} code smell issues`);
    return { issues, metrics };
  }

  /**
   * Analyze performance issues
   */
  async analyzePerformance(files) {
    console.log('🚀 Analyzing performance issues...');

    const issues = [];
    const metrics = {
      inefficientLoopsCount: 0,
      synchronousOperationsCount: 0,
      potentialMemoryLeaks: 0,
    };

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');

        // Check for inefficient loops
        const inefficientLoops = this.findInefficientLoops(content);
        metrics.inefficientLoopsCount += inefficientLoops.length;

        for (const loop of inefficientLoops) {
          issues.push({
            type: 'performance',
            subtype: 'inefficient_loop',
            severity: this.config.rules.performance.inefficientLoops.severity,
            file,
            line: loop.line,
            message: loop.message,
            suggestion: loop.suggestion,
          });
        }

        // Check for synchronous operations
        const syncOps = this.findSynchronousOperations(content);
        metrics.synchronousOperationsCount += syncOps.length;

        for (const op of syncOps) {
          issues.push({
            type: 'performance',
            subtype: 'synchronous_operation',
            severity: this.config.rules.performance.synchronousOperations.severity,
            file,
            line: op.line,
            message: `Synchronous operation: ${op.operation}`,
            suggestion: 'Consider using asynchronous alternatives',
          });
        }

        // Check for potential memory leaks
        const memoryLeaks = this.findPotentialMemoryLeaks(content);
        metrics.potentialMemoryLeaks += memoryLeaks.length;

        for (const leak of memoryLeaks) {
          issues.push({
            type: 'performance',
            subtype: 'memory_leak',
            severity: this.config.rules.performance.memoryLeaks.severity,
            file,
            line: leak.line,
            message: leak.message,
            suggestion: leak.suggestion,
          });
        }

        // Check for slow regex patterns
        const slowRegex = this.findSlowRegexPatterns(content);
        for (const regex of slowRegex) {
          issues.push({
            type: 'performance',
            subtype: 'slow_regex',
            severity: this.config.rules.performance.slowRegex.severity,
            file,
            line: regex.line,
            message: 'Potentially slow regex pattern detected',
            suggestion: 'Optimize regex pattern or consider alternatives',
          });
        }

        // React-specific performance checks
        if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
          const reactIssues = this.findReactPerformanceIssues(content);
          for (const issue of reactIssues) {
            issues.push({
              type: 'performance',
              subtype: 'react_performance',
              severity: this.config.rules.performance.unnecessaryRerendering.severity,
              file,
              line: issue.line,
              message: issue.message,
              suggestion: issue.suggestion,
            });
          }
        }
      } catch (error) {
        console.warn(`Could not analyze performance for ${file}:`, error.message);
      }
    }

    console.log(`   Found ${issues.length} performance issues`);
    return { issues, metrics };
  }

  /**
   * Analyze security vulnerabilities
   */
  async analyzeSecurity(files) {
    console.log('🔒 Analyzing security vulnerabilities...');

    const issues = [];
    const metrics = {
      xssVulnerabilities: 0,
      injectionRisks: 0,
      hardcodedSecrets: 0,
      insecurePatterns: 0,
    };

    // Security patterns to detect
    const securityPatterns = {
      xss: [
        { pattern: /innerHTML\s*=\s*[^;]+/g, message: 'Direct innerHTML assignment may lead to XSS' },
        { pattern: /outerHTML\s*=\s*[^;]+/g, message: 'Direct outerHTML assignment may lead to XSS' },
        { pattern: /document\.write\s*\(/g, message: 'document.write() can lead to XSS vulnerabilities' },
      ],

      injection: [
        { pattern: /eval\s*\(/g, message: 'eval() usage poses security risks' },
        { pattern: /Function\s*\(/g, message: 'Function constructor can be dangerous' },
        { pattern: /setTimeout\s*\(\s*["']/g, message: 'setTimeout with string argument is dangerous' },
        { pattern: /setInterval\s*\(\s*["']/g, message: 'setInterval with string argument is dangerous' },
      ],

      secrets: [
        { pattern: /(?:password|pwd|pass)\s*[:=]\s*["'][^"']{3,}/gi, message: 'Potential hardcoded password' },
        { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"']{10,}/gi, message: 'Potential hardcoded API key' },
        { pattern: /(?:secret|token|auth)\s*[:=]\s*["'][^"']{10,}/gi, message: 'Potential hardcoded secret' },
        { pattern: /sk_[a-zA-Z0-9]{24,}/g, message: 'Potential Stripe secret key' },
        { pattern: /AKIA[0-9A-Z]{16}/g, message: 'Potential AWS access key' },
      ],

      insecure: [
        { pattern: /Math\.random\(\)/g, message: 'Math.random() is not cryptographically secure' },
        { pattern: /http:\/\/[^'">\s]+/gi, message: 'HTTP URL detected - consider using HTTPS' },
        { pattern: /__proto__/g, message: 'Prototype pollution risk detected' },
        { pattern: /\.constructor\s*\(/g, message: 'Constructor access may be dangerous' },
      ],
    };

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const lines = content.split('\n');

        // Check each security pattern category
        for (const [category, patterns] of Object.entries(securityPatterns)) {
          for (const { pattern, message } of patterns) {
            const matches = [...content.matchAll(pattern)];

            for (const match of matches) {
              const lineNumber = this.getLineNumber(content, match.index);

              issues.push({
                type: 'security',
                subtype: category,
                severity: this.getSecuritySeverity(category),
                file,
                line: lineNumber,
                message,
                code: match[0],
                suggestion: this.getSecuritySuggestion(category),
              });

              // Update metrics
              switch (category) {
                case 'xss':
                  metrics.xssVulnerabilities++;
                  break;
                case 'injection':
                  metrics.injectionRisks++;
                  break;
                case 'secrets':
                  metrics.hardcodedSecrets++;
                  break;
                case 'insecure':
                  metrics.insecurePatterns++;
                  break;
              }
            }
          }
        }

        // Additional security checks
        const additionalIssues = this.performAdditionalSecurityChecks(content, file);
        issues.push(...additionalIssues);
      } catch (error) {
        console.warn(`Could not analyze security for ${file}:`, error.message);
      }
    }

    console.log(`   Found ${issues.length} security issues`);
    return { issues, metrics };
  }

  /**
   * Analyze maintainability issues
   */
  async analyzeMaintainability(files) {
    console.log('🔧 Analyzing maintainability issues...');

    const issues = [];
    const metrics = {
      documentationCoverage: 0,
      cyclomaticComplexity: 0,
      couplingScore: 0,
      cohesionScore: 0,
    };

    let totalFunctions = 0;
    let documentedFunctions = 0;
    let totalComplexity = 0;

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');

        // Check documentation coverage
        const functions = this.extractMethods(content);
        totalFunctions += functions.length;

        for (const func of functions) {
          const hasDoc = this.hasDocumentation(content, func.startLine);
          if (hasDoc) documentedFunctions++;

          // Calculate cyclomatic complexity
          const complexity = this.calculateCyclomaticComplexity(func.content);
          totalComplexity += complexity;

          if (!hasDoc) {
            issues.push({
              type: 'maintainability',
              subtype: 'missing_documentation',
              severity: this.config.rules.maintainability.missingDocumentation.severity,
              file,
              line: func.startLine,
              message: `Function '${func.name}' lacks documentation`,
              suggestion: 'Add JSDoc comments to improve code documentation',
            });
          }

          if (complexity > 10) {
            issues.push({
              type: 'maintainability',
              subtype: 'high_complexity',
              severity: 'medium',
              file,
              line: func.startLine,
              message: `Function '${func.name}' has high cyclomatic complexity (${complexity})`,
              suggestion: 'Consider breaking down this function into smaller parts',
            });
          }
        }

        // Check for inconsistent styling
        const styleIssues = this.findStyleInconsistencies(content);
        for (const issue of styleIssues) {
          issues.push({
            type: 'maintainability',
            subtype: 'inconsistent_style',
            severity: this.config.rules.maintainability.inconsistentStyle.severity,
            file,
            line: issue.line,
            message: issue.message,
            suggestion: 'Use consistent coding style throughout the project',
          });
        }

        // Check for tight coupling
        const couplingIssues = this.findTightCoupling(content, file);
        for (const issue of couplingIssues) {
          issues.push({
            type: 'maintainability',
            subtype: 'tight_coupling',
            severity: this.config.rules.maintainability.tightCoupling.severity,
            file,
            line: issue.line,
            message: issue.message,
            suggestion: 'Reduce coupling by using dependency injection or interfaces',
          });
        }
      } catch (error) {
        console.warn(`Could not analyze maintainability for ${file}:`, error.message);
      }
    }

    // Calculate metrics
    metrics.documentationCoverage = totalFunctions > 0 ? (documentedFunctions / totalFunctions) * 100 : 0;
    metrics.cyclomaticComplexity = totalFunctions > 0 ? totalComplexity / totalFunctions : 0;

    console.log(`   Found ${issues.length} maintainability issues`);
    return { issues, metrics };
  }

  /**
   * Analyze test coverage
   */
  async analyzeTestCoverage() {
    console.log('🧪 Analyzing test coverage...');

    const issues = [];
    const metrics = {
      statementCoverage: 0,
      branchCoverage: 0,
      functionCoverage: 0,
      lineCoverage: 0,
    };

    try {
      // Try to get coverage data from existing reports
      const coverageFiles = [
        'coverage/coverage-summary.json',
        'coverage/lcov.info',
        '.nyc_output/coverage-summary.json',
      ];

      let coverageData = null;
      for (const file of coverageFiles) {
        try {
          const data = await fs.readFile(file, 'utf8');
          if (file.endsWith('.json')) {
            coverageData = JSON.parse(data);
            break;
          }
        } catch {
          // Try next file
        }
      }

      if (coverageData) {
        // Extract coverage metrics
        const total = coverageData.total;
        if (total) {
          metrics.statementCoverage = total.statements?.pct || 0;
          metrics.branchCoverage = total.branches?.pct || 0;
          metrics.functionCoverage = total.functions?.pct || 0;
          metrics.lineCoverage = total.lines?.pct || 0;
        }

        // Check against thresholds
        if (metrics.statementCoverage < this.config.thresholds.testCoverage) {
          issues.push({
            type: 'test_coverage',
            subtype: 'low_coverage',
            severity: 'medium',
            file: 'project',
            line: 1,
            message: `Statement coverage (${metrics.statementCoverage}%) below threshold (${this.config.thresholds.testCoverage}%)`,
            suggestion: 'Add more unit tests to improve coverage',
          });
        }
      } else {
        // No coverage data found
        issues.push({
          type: 'test_coverage',
          subtype: 'no_coverage_data',
          severity: 'low',
          file: 'project',
          line: 1,
          message: 'No test coverage data found',
          suggestion: 'Set up test coverage reporting with Jest or similar tool',
        });
      }
    } catch (error) {
      console.warn('Could not analyze test coverage:', error.message);
    }

    console.log(`   Coverage: ${metrics.statementCoverage}% statements`);
    return { issues, metrics };
  }

  /**
   * Analyze documentation coverage
   */
  async analyzeDocumentation(files) {
    console.log('📚 Analyzing documentation coverage...');

    const issues = [];
    const metrics = {
      documentationCoverage: 0,
      apiDocumentation: 0,
      readmeQuality: 0,
    };

    // This analysis was partially covered in maintainability
    // Here we focus on project-level documentation

    try {
      // Check for README
      const readmeFiles = ['README.md', 'readme.md', 'Readme.md'];
      let hasReadme = false;

      for (const readme of readmeFiles) {
        try {
          await fs.access(readme);
          hasReadme = true;

          // Analyze README quality
          const content = await fs.readFile(readme, 'utf8');
          const quality = this.analyzeReadmeQuality(content);
          metrics.readmeQuality = quality.score;

          if (quality.score < 7) {
            issues.push({
              type: 'documentation',
              subtype: 'poor_readme',
              severity: 'low',
              file: readme,
              line: 1,
              message: `README quality score is low (${quality.score}/10)`,
              suggestion: quality.suggestions.join(', '),
            });
          }

          break;
        } catch {
          // Continue to next README variant
        }
      }

      if (!hasReadme) {
        issues.push({
          type: 'documentation',
          subtype: 'missing_readme',
          severity: 'medium',
          file: 'project',
          line: 1,
          message: 'No README file found',
          suggestion: 'Create a README.md file with project description and setup instructions',
        });
      }

      // Check for API documentation
      const apiDocFiles = ['docs/', 'api-docs/', 'documentation/'];
      let hasApiDocs = false;

      for (const docDir of apiDocFiles) {
        try {
          const stat = await fs.stat(docDir);
          if (stat.isDirectory()) {
            hasApiDocs = true;
            break;
          }
        } catch {
          // Continue
        }
      }

      if (!hasApiDocs) {
        issues.push({
          type: 'documentation',
          subtype: 'missing_api_docs',
          severity: 'low',
          file: 'project',
          line: 1,
          message: 'No API documentation directory found',
          suggestion: 'Create comprehensive API documentation',
        });
      }
    } catch (error) {
      console.warn('Could not analyze documentation:', error.message);
    }

    console.log(`   Documentation quality: ${metrics.readmeQuality}/10`);
    return { issues, metrics };
  }

  /**
   * Apply automatic fixes to code
   */
  async applyAutoFixes() {
    if (!this.config.autoFix.enabled) return 0;

    console.log('🔧 Applying automatic fixes...');

    let fixedCount = 0;
    const fixableIssues = this.qualityResults.issues.filter(issue => this.isAutoFixable(issue));

    // Group fixes by file
    const fileGroups = new Map();
    for (const issue of fixableIssues) {
      if (!fileGroups.has(issue.file)) {
        fileGroups.set(issue.file, []);
      }
      fileGroups.get(issue.file).push(issue);
    }

    for (const [file, issues] of fileGroups.entries()) {
      try {
        // Create backup if required
        if (this.config.autoFix.createBackup) {
          await this.createBackup(file);
        }

        // Apply fixes to this file
        const fileFixedCount = await this.applyFileFixes(file, issues);
        fixedCount += fileFixedCount;
      } catch (error) {
        console.warn(`Could not apply fixes to ${file}:`, error.message);
      }
    }

    console.log(`   Fixed ${fixedCount} issues automatically`);
    return fixedCount;
  }

  /**
   * Generate comprehensive quality report
   */
  async generateQualityReport() {
    console.log('📊 Generating quality report...');

    const reportData = {
      summary: {
        overallScore: this.qualityResults.overallScore,
        totalIssues: this.qualityResults.issues.length,
        criticalIssues: this.qualityResults.issues.filter(i => i.severity === 'critical').length,
        highIssues: this.qualityResults.issues.filter(i => i.severity === 'high').length,
        mediumIssues: this.qualityResults.issues.filter(i => i.severity === 'medium').length,
        lowIssues: this.qualityResults.issues.filter(i => i.severity === 'low').length,
        scanDate: this.qualityResults.lastScan,
      },

      metrics: this.qualityResults.metrics,

      issuesByType: this.groupIssuesByType(),

      issuesByFile: this.groupIssuesByFile(),

      technicalDebt: {
        totalCost: this.technicalDebt.totalCost,
        highPriorityItems: this.technicalDebt.prioritized.slice(0, 5),
      },

      recommendations: this.generateRecommendations(),

      trends: this.qualityResults.trends,
    };

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(reportData);
    const reportPath = path.join(this.dataDir, this.config.reporting.outputFile);
    await fs.writeFile(reportPath, htmlReport);

    console.log(`   Report saved to: ${reportPath}`);
    return reportPath;
  }

  // Helper methods for analysis

  getFilesToScan(paths) {
    // Implementation to get list of files to scan
    // This would recursively find all relevant files
    return Promise.resolve([
      'src/example.js',
      'src/example.ts',
      // ... more files would be found here
    ]);
  }

  generateLineHashes(lines) {
    // Generate hashes for duplicate code detection
    const hashes = new Map();

    for (let i = 0; i < lines.length - 3; i++) {
      const block = lines
        .slice(i, i + 4)
        .join('\n')
        .trim();
      if (block.length > 20) {
        // Ignore very short blocks
        const hash = this.simpleHash(block);
        if (!hashes.has(hash)) {
          hashes.set(hash, []);
        }
        hashes.get(hash).push(i + 1);
      }
    }

    return hashes;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  extractMethods(content) {
    // Extract methods/functions from code
    const methods = [];
    const lines = content.split('\n');

    const functionPattern = /(?:function\s+(\w+)|(\w+)\s*[:=]\s*(?:function|\([^)]*\)\s*=>))/g;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      const name = match[1] || match[2] || 'anonymous';
      const startLine = this.getLineNumber(content, match.index);
      const endLine = this.findFunctionEnd(lines, startLine - 1);

      methods.push({
        name,
        startLine,
        endLine,
        length: endLine - startLine + 1,
        content: lines.slice(startLine - 1, endLine).join('\n'),
      });
    }

    return methods;
  }

  extractClasses(content) {
    // Extract classes from code
    const classes = [];
    const lines = content.split('\n');

    const classPattern = /class\s+(\w+)/g;
    let match;

    while ((match = classPattern.exec(content)) !== null) {
      const name = match[1];
      const startLine = this.getLineNumber(content, match.index);
      const endLine = this.findClassEnd(lines, startLine - 1);

      classes.push({
        name,
        startLine,
        endLine,
        length: endLine - startLine + 1,
        content: lines.slice(startLine - 1, endLine).join('\n'),
      });
    }

    return classes;
  }

  findFunctionEnd(lines, startIndex) {
    let braceCount = 0;
    let inFunction = false;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];

      for (const char of line) {
        if (char === '{') {
          braceCount++;
          inFunction = true;
        } else if (char === '}') {
          braceCount--;
        }
      }

      if (inFunction && braceCount === 0) {
        return i + 1;
      }
    }

    return lines.length;
  }

  findClassEnd(lines, startIndex) {
    // Similar to findFunctionEnd but for classes
    return this.findFunctionEnd(lines, startIndex);
  }

  calculateMaxNestingDepth(content) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of content) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  findComplexConditions(methodContent) {
    // Find complex conditional statements
    const conditions = [];
    const lines = methodContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Count logical operators
      const andCount = (line.match(/&&/g) || []).length;
      const orCount = (line.match(/\|\|/g) || []).length;

      if (andCount + orCount > this.config.rules.codeSmells.complexConditions.threshold) {
        conditions.push({
          line: i + 1,
          complexity: andCount + orCount,
        });
      }
    }

    return conditions;
  }

  findMagicNumbers(content) {
    // Find magic numbers in code
    const magicNumbers = [];
    const lines = content.split('\n');

    // Pattern to find numbers that aren't 0, 1, or in common contexts
    const numberPattern = /(?<!\w)[2-9]\d*(?!\w)/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip certain contexts
      if (line.includes('//') || line.includes('const') || line.includes('=')) {
        continue;
      }

      const matches = [...line.matchAll(numberPattern)];
      for (const match of matches) {
        magicNumbers.push({
          line: i + 1,
          value: match[0],
        });
      }
    }

    return magicNumbers;
  }

  findDeadCode(content) {
    // Simple dead code detection
    const deadCode = [];
    const lines = content.split('\n');

    let unreachableMode = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for unreachable code after return/throw
      if (unreachableMode && line && !line.startsWith('}') && !line.startsWith('//')) {
        deadCode.push({
          line: i + 1,
          type: 'unreachable',
        });
      }

      if (line.includes('return') || line.includes('throw')) {
        unreachableMode = true;
      } else if (line.includes('}')) {
        unreachableMode = false;
      }
    }

    return deadCode;
  }

  findInefficientLoops(content) {
    // Find inefficient loop patterns
    const issues = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for nested loops
      if (line.includes('for') && i < lines.length - 10) {
        const nextLines = lines.slice(i, i + 10).join('\n');
        if (nextLines.match(/for.*for/s)) {
          issues.push({
            line: i + 1,
            message: 'Nested loops detected - consider optimization',
            suggestion: 'Consider using more efficient algorithms or data structures',
          });
        }
      }

      // Check for DOM queries in loops
      if (line.includes('for') || line.includes('while')) {
        const loopBody = this.extractLoopBody(lines, i);
        if (loopBody.includes('querySelector') || loopBody.includes('getElementById')) {
          issues.push({
            line: i + 1,
            message: 'DOM query inside loop',
            suggestion: 'Cache DOM queries outside the loop',
          });
        }
      }
    }

    return issues;
  }

  findSynchronousOperations(content) {
    // Find synchronous operations that could block
    const syncOps = [];
    const patterns = [
      { pattern: /fs\.readFileSync/g, operation: 'fs.readFileSync' },
      { pattern: /fs\.writeFileSync/g, operation: 'fs.writeFileSync' },
      { pattern: /execSync/g, operation: 'execSync' },
      { pattern: /XMLHttpRequest/g, operation: 'XMLHttpRequest (consider fetch)' },
    ];

    for (const { pattern, operation } of patterns) {
      const matches = [...content.matchAll(pattern)];
      for (const match of matches) {
        syncOps.push({
          line: this.getLineNumber(content, match.index),
          operation,
        });
      }
    }

    return syncOps;
  }

  findPotentialMemoryLeaks(content) {
    // Find potential memory leak patterns
    const leaks = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Event listeners without cleanup
      if (line.includes('addEventListener') && !this.hasCorrespondingRemoveListener(lines, i)) {
        leaks.push({
          line: i + 1,
          message: 'Event listener added without corresponding cleanup',
          suggestion: 'Add removeEventListener in cleanup/unmount',
        });
      }

      // Intervals/timeouts without cleanup
      if (line.includes('setInterval') && !this.hasCorrespondingClear(lines, i, 'clearInterval')) {
        leaks.push({
          line: i + 1,
          message: 'setInterval without clearInterval',
          suggestion: 'Clear interval in cleanup/unmount',
        });
      }

      if (line.includes('setTimeout') && !this.hasCorrespondingClear(lines, i, 'clearTimeout')) {
        leaks.push({
          line: i + 1,
          message: 'setTimeout without clearTimeout',
          suggestion: 'Clear timeout in cleanup/unmount',
        });
      }
    }

    return leaks;
  }

  findSlowRegexPatterns(content) {
    // Find potentially slow regex patterns
    const slowPatterns = [];
    const regexPattern = /\/([^\/]+)\/[gimuy]*/g;

    const matches = [...content.matchAll(regexPattern)];
    for (const match of matches) {
      const pattern = match[1];

      // Check for catastrophic backtracking patterns
      if (pattern.includes('.*.*') || pattern.includes('+.*+') || pattern.includes('(a+)+')) {
        slowPatterns.push({
          line: this.getLineNumber(content, match.index),
          pattern: match[0],
        });
      }
    }

    return slowPatterns;
  }

  findReactPerformanceIssues(content) {
    // Find React-specific performance issues
    const issues = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Anonymous functions in JSX
      if (line.includes('onClick={() =>') || line.includes('onChange={() =>')) {
        issues.push({
          line: i + 1,
          message: 'Anonymous function in JSX prop can cause unnecessary re-renders',
          suggestion: 'Extract to useCallback or define outside component',
        });
      }

      // Missing dependency in useEffect
      if (line.includes('useEffect') && !line.includes('[]') && !line.includes('[')) {
        issues.push({
          line: i + 1,
          message: 'useEffect without dependency array',
          suggestion: 'Add dependency array to prevent unnecessary re-runs',
        });
      }
    }

    return issues;
  }

  // Additional helper methods...

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  extractLoopBody(lines, startIndex) {
    // Extract the body of a loop for analysis
    let braceCount = 0;
    let body = '';

    for (let i = startIndex; i < lines.length && i < startIndex + 20; i++) {
      const line = lines[i];
      body += line + '\n';

      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }

      if (braceCount === 0 && i > startIndex) break;
    }

    return body;
  }

  hasCorrespondingRemoveListener(lines, startIndex) {
    // Check if there's a corresponding removeEventListener
    const context = lines.slice(Math.max(0, startIndex - 20), startIndex + 20).join('\n');
    return context.includes('removeEventListener');
  }

  hasCorrespondingClear(lines, startIndex, clearMethod) {
    // Check if there's a corresponding clear method
    const context = lines.slice(Math.max(0, startIndex - 20), startIndex + 20).join('\n');
    return context.includes(clearMethod);
  }

  getSecuritySeverity(category) {
    const severities = {
      xss: 'high',
      injection: 'high',
      secrets: 'critical',
      insecure: 'medium',
    };
    return severities[category] || 'medium';
  }

  getSecuritySuggestion(category) {
    const suggestions = {
      xss: 'Use textContent instead of innerHTML, or sanitize user input',
      injection: 'Avoid eval and Function constructor, use safe alternatives',
      secrets: 'Move secrets to environment variables or secure storage',
      insecure: 'Use secure alternatives and HTTPS where possible',
    };
    return suggestions[category] || 'Review and fix security issue';
  }

  performAdditionalSecurityChecks(content, file) {
    // Additional security checks beyond pattern matching
    const issues = [];

    // Check for console.log in production code
    if (content.includes('console.log') && !file.includes('test')) {
      issues.push({
        type: 'security',
        subtype: 'information_disclosure',
        severity: 'low',
        file,
        line: this.getLineNumber(content, content.indexOf('console.log')),
        message: 'console.log may leak sensitive information in production',
        suggestion: 'Remove console.log statements or use proper logging',
      });
    }

    return issues;
  }

  hasDocumentation(content, functionStartLine) {
    // Check if function has JSDoc or other documentation
    const lines = content.split('\n');
    const beforeFunction = lines.slice(Math.max(0, functionStartLine - 5), functionStartLine - 1);

    return beforeFunction.some(line => line.includes('/**') || line.includes('//') || line.includes('*'));
  }

  calculateCyclomaticComplexity(code) {
    // Calculate cyclomatic complexity
    const patterns = [
      /if\s*\(/g,
      /else/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
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

  findStyleInconsistencies(content) {
    // Find style inconsistencies
    const issues = [];
    const lines = content.split('\n');

    let indentationType = null;
    let quotationStyle = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check indentation consistency
      if (line.match(/^\s+/)) {
        const currentIndent = line.match(/^\s+/)[0];
        const hasSpaces = currentIndent.includes(' ');
        const hasTabs = currentIndent.includes('\t');

        if (indentationType === null) {
          indentationType = hasSpaces ? 'spaces' : 'tabs';
        } else if ((indentationType === 'spaces' && hasTabs) || (indentationType === 'tabs' && hasSpaces)) {
          issues.push({
            line: i + 1,
            message: 'Inconsistent indentation (mixing spaces and tabs)',
          });
        }
      }

      // Check quotation style consistency
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;

      if (singleQuotes > 0 || doubleQuotes > 0) {
        const currentStyle = singleQuotes > doubleQuotes ? 'single' : 'double';

        if (quotationStyle === null) {
          quotationStyle = currentStyle;
        } else if (quotationStyle !== currentStyle) {
          issues.push({
            line: i + 1,
            message: 'Inconsistent quotation style',
          });
        }
      }
    }

    return issues;
  }

  findTightCoupling(content, file) {
    // Find tight coupling issues
    const issues = [];
    const lines = content.split('\n');

    // Count imports from same module/package
    const imports = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('import') && line.includes('from')) {
        const match = line.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          const module = match[1];
          const baseModule = module.split('/')[0];

          if (!imports.has(baseModule)) {
            imports.set(baseModule, 0);
          }
          imports.set(baseModule, imports.get(baseModule) + 1);
        }
      }
    }

    // Flag modules with too many imports
    for (const [module, count] of imports.entries()) {
      if (count > 5 && !module.includes('node_modules')) {
        issues.push({
          line: 1,
          message: `High coupling detected: ${count} imports from ${module}`,
        });
      }
    }

    return issues;
  }

  analyzeReadmeQuality(content) {
    // Analyze README quality
    let score = 0;
    const suggestions = [];

    // Check for basic sections
    const sections = [
      { name: 'Installation', pattern: /install/i, points: 2 },
      { name: 'Usage', pattern: /usage|getting started/i, points: 2 },
      { name: 'API', pattern: /api|documentation/i, points: 1 },
      { name: 'Contributing', pattern: /contribut/i, points: 1 },
      { name: 'License', pattern: /license/i, points: 1 },
    ];

    for (const section of sections) {
      if (section.pattern.test(content)) {
        score += section.points;
      } else {
        suggestions.push(`Add ${section.name} section`);
      }
    }

    // Check for code examples
    if (content.includes('```')) {
      score += 2;
    } else {
      suggestions.push('Add code examples');
    }

    // Check for badges
    if (content.includes('![') || content.includes('https://img.shields.io')) {
      score += 1;
    } else {
      suggestions.push('Add status badges');
    }

    return { score: Math.min(10, score), suggestions };
  }

  calculateOverallScore() {
    // Calculate overall quality score based on issues and metrics
    let score = 10; // Start with perfect score

    // Deduct points for issues
    for (const issue of this.qualityResults.issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 2;
          break;
        case 'high':
          score -= 1;
          break;
        case 'medium':
          score -= 0.5;
          break;
        case 'low':
          score -= 0.1;
          break;
      }
    }

    // Bonus points for good metrics
    const metrics = this.qualityResults.metrics;
    if (metrics.testCoverage > 90) score += 0.5;
    if (metrics.documentationCoverage > 80) score += 0.5;
    if (metrics.duplicateCodePercent < 2) score += 0.5;

    return Math.max(0, Math.min(10, score));
  }

  updateTechnicalDebt() {
    // Update technical debt calculation
    this.technicalDebt.items = [];
    this.technicalDebt.totalCost = 0;

    // Convert issues to debt items
    for (const issue of this.qualityResults.issues) {
      const cost = this.calculateIssueCost(issue);

      this.technicalDebt.items.push({
        id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        issue: issue,
        estimatedCost: cost,
        priority: this.calculateDebtPriority(issue),
        category: issue.type,
        created: new Date().toISOString(),
      });

      this.technicalDebt.totalCost += cost;
    }

    // Sort by priority
    this.technicalDebt.prioritized = this.technicalDebt.items.sort((a, b) => b.priority - a.priority);

    this.technicalDebt.lastUpdate = new Date().toISOString();
  }

  calculateIssueCost(issue) {
    // Estimate cost to fix issue (in developer hours)
    const baseCosts = {
      code_smell: 2,
      performance: 4,
      security: 8,
      maintainability: 3,
      test_coverage: 1,
      documentation: 1,
    };

    const severityMultipliers = {
      critical: 3,
      high: 2,
      medium: 1.5,
      low: 1,
    };

    const baseCost = baseCosts[issue.type] || 2;
    const multiplier = severityMultipliers[issue.severity] || 1;

    return Math.round(baseCost * multiplier * 100); // Convert to dollars
  }

  calculateDebtPriority(issue) {
    // Calculate priority score for technical debt
    let priority = 0;

    // Severity weight
    const severityWeights = { critical: 10, high: 7, medium: 4, low: 1 };
    priority += severityWeights[issue.severity] || 1;

    // Type weight
    const typeWeights = { security: 5, performance: 4, maintainability: 3, code_smell: 2 };
    priority += typeWeights[issue.type] || 1;

    return priority;
  }

  isAutoFixable(issue) {
    // Determine if an issue can be automatically fixed
    const autoFixableTypes = [
      'inconsistent_style',
      'missing_semicolon',
      'unused_variable',
      'trailing_whitespace',
      'import_order',
    ];

    return autoFixableTypes.includes(issue.subtype);
  }

  async applyFileFixes(file, issues) {
    // Apply fixes to a specific file
    let content = await fs.readFile(file, 'utf8');
    let fixedCount = 0;

    for (const issue of issues) {
      try {
        const newContent = this.applyFix(content, issue);
        if (newContent !== content) {
          content = newContent;
          fixedCount++;
        }
      } catch (error) {
        console.warn(`Could not fix issue in ${file}:`, error.message);
      }
    }

    if (fixedCount > 0) {
      await fs.writeFile(file, content);
    }

    return fixedCount;
  }

  applyFix(content, issue) {
    // Apply a specific fix to content
    switch (issue.subtype) {
      case 'trailing_whitespace':
        return content.replace(/[ \t]+$/gm, '');

      case 'inconsistent_style':
        // Simple quote normalization
        if (issue.message.includes('quotation')) {
          return content.replace(/'/g, '"');
        }
        break;

      case 'missing_semicolon':
        // Add semicolons where missing (simplified)
        return content.replace(/([^;\s])\s*\n/g, '$1;\n');

      default:
        return content;
    }

    return content;
  }

  async createBackup(file) {
    // Create backup of file before modifying
    const backupDir = path.join(this.dataDir, 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${path.basename(file)}.${timestamp}.backup`);

    const content = await fs.readFile(file, 'utf8');
    await fs.writeFile(backupPath, content);
  }

  groupIssuesByType() {
    // Group issues by type for reporting
    const groups = {};

    for (const issue of this.qualityResults.issues) {
      if (!groups[issue.type]) {
        groups[issue.type] = [];
      }
      groups[issue.type].push(issue);
    }

    return groups;
  }

  groupIssuesByFile() {
    // Group issues by file for reporting
    const groups = {};

    for (const issue of this.qualityResults.issues) {
      if (!groups[issue.file]) {
        groups[issue.file] = [];
      }
      groups[issue.file].push(issue);
    }

    return groups;
  }

  generateRecommendations() {
    // Generate recommendations based on analysis
    const recommendations = [];

    // High-priority recommendations
    const criticalIssues = this.qualityResults.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Address Critical Security Issues',
        description: `Found ${criticalIssues.length} critical security issues that need immediate attention`,
        action: 'Review and fix all critical security vulnerabilities',
      });
    }

    // Coverage recommendations
    const coverage = this.qualityResults.metrics.testCoverage || 0;
    if (coverage < this.config.thresholds.testCoverage) {
      recommendations.push({
        priority: 'high',
        title: 'Improve Test Coverage',
        description: `Test coverage is ${coverage}%, below the ${this.config.thresholds.testCoverage}% threshold`,
        action: 'Add unit tests for uncovered code paths',
      });
    }

    // Debt recommendations
    if (this.technicalDebt.totalCost > 10000) {
      recommendations.push({
        priority: 'medium',
        title: 'Reduce Technical Debt',
        description: `Technical debt estimated at $${this.technicalDebt.totalCost.toLocaleString()}`,
        action: 'Prioritize refactoring high-impact debt items',
      });
    }

    return recommendations;
  }

  generateHTMLReport(reportData) {
    // Generate HTML report (simplified template)
    return `<!DOCTYPE html>
<html>
<head>
    <title>Code Quality Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .score { font-size: 3em; color: ${reportData.summary.overallScore >= 8 ? '#28a745' : reportData.summary.overallScore >= 6 ? '#ffc107' : '#dc3545'}; }
        .issues { display: flex; gap: 20px; margin: 20px 0; }
        .issue-card { padding: 15px; border-radius: 5px; flex: 1; }
        .critical { background: #ffebee; border-left: 4px solid #f44336; }
        .high { background: #fff3e0; border-left: 4px solid #ff9800; }
        .medium { background: #f3e5f5; border-left: 4px solid #9c27b0; }
        .low { background: #e8f5e8; border-left: 4px solid #4caf50; }
        .recommendations { margin: 20px 0; }
        .recommendation { padding: 10px; margin: 10px 0; border-radius: 5px; background: #f8f9fa; }
    </style>
</head>
<body>
    <h1>Code Quality Report</h1>
    
    <div class="summary">
        <div class="score">${reportData.summary.overallScore.toFixed(1)}/10</div>
        <h2>Overall Quality Score</h2>
        <p>Generated on ${new Date(reportData.summary.scanDate).toLocaleString()}</p>
    </div>
    
    <div class="issues">
        <div class="issue-card critical">
            <h3>Critical</h3>
            <div class="count">${reportData.summary.criticalIssues}</div>
        </div>
        <div class="issue-card high">
            <h3>High</h3>
            <div class="count">${reportData.summary.highIssues}</div>
        </div>
        <div class="issue-card medium">
            <h3>Medium</h3>
            <div class="count">${reportData.summary.mediumIssues}</div>
        </div>
        <div class="issue-card low">
            <h3>Low</h3>
            <div class="count">${reportData.summary.lowIssues}</div>
        </div>
    </div>
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        ${reportData.recommendations
          .map(
            rec => `
            <div class="recommendation ${rec.priority}">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <strong>Action:</strong> ${rec.action}
            </div>
        `
          )
          .join('')}
    </div>
    
    <div class="metrics">
        <h2>Metrics</h2>
        <ul>
            <li>Test Coverage: ${reportData.metrics.testCoverage || 0}%</li>
            <li>Documentation Coverage: ${reportData.metrics.documentationCoverage || 0}%</li>
            <li>Duplicate Code: ${reportData.metrics.duplicateCodePercent || 0}%</li>
            <li>Technical Debt: $${reportData.technicalDebt.totalCost.toLocaleString()}</li>
        </ul>
    </div>
</body>
</html>`;
  }

  async setupGitHooks() {
    // Set up Git hooks for quality checks
    try {
      await fs.access(this.hooksDir);

      // Pre-commit hook
      if (this.config.hooks.preCommit.enabled) {
        const preCommitHook = this.generatePreCommitHook();
        const hookPath = path.join(this.hooksDir, 'pre-commit');

        await fs.writeFile(hookPath, preCommitHook);
        await fs.chmod(hookPath, '755');

        console.log('✅ Pre-commit hook installed');
      }

      // Pre-push hook
      if (this.config.hooks.prePush.enabled) {
        const prePushHook = this.generatePrePushHook();
        const hookPath = path.join(this.hooksDir, 'pre-push');

        await fs.writeFile(hookPath, prePushHook);
        await fs.chmod(hookPath, '755');

        console.log('✅ Pre-push hook installed');
      }
    } catch (error) {
      console.warn('Could not set up Git hooks:', error.message);
    }
  }

  generatePreCommitHook() {
    return `#!/bin/sh
# Auto-generated pre-commit hook by Code Quality Scanner

echo "🔍 Running code quality checks..."

# Run quality scanner
node src/utils/CodeQualityScanner.js quick-scan --staged

RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "❌ Code quality checks failed!"
    ${this.config.hooks.preCommit.blockOnFailure ? 'exit 1' : 'echo "⚠️  Proceeding anyway..."'}
fi

echo "✅ Code quality checks passed"
exit 0
`;
  }

  generatePrePushHook() {
    return `#!/bin/sh
# Auto-generated pre-push hook by Code Quality Scanner

echo "🔍 Running full quality scan..."

# Run full quality scanner
node src/utils/CodeQualityScanner.js scan --report

RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "⚠️  Quality issues detected - see report for details"
    ${this.config.hooks.prePush.blockOnFailure ? 'exit 1' : 'echo "Proceeding with push..."'}
fi

exit 0
`;
  }

  // Utility methods

  async ensureDirectories() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async loadConfiguration() {
    try {
      const configData = await fs.readFile(this.configFile, 'utf8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch {
      await this.saveConfiguration();
    }
  }

  async saveConfiguration() {
    await fs.writeFile(this.configFile, JSON.stringify(this.config, null, 2));
  }

  async loadExistingResults() {
    try {
      const resultsData = await fs.readFile(this.resultsFile, 'utf8');
      this.qualityResults = JSON.parse(resultsData);
    } catch {
      // No existing results
    }

    try {
      const debtData = await fs.readFile(this.debtFile, 'utf8');
      this.technicalDebt = JSON.parse(debtData);
    } catch {
      // No existing debt data
    }
  }

  async saveResults() {
    await fs.writeFile(this.resultsFile, JSON.stringify(this.qualityResults, null, 2));
    await fs.writeFile(this.debtFile, JSON.stringify(this.technicalDebt, null, 2));
  }

  /**
   * Get quality statistics
   */
  async getStatistics() {
    return {
      overallScore: this.qualityResults.overallScore,
      totalIssues: this.qualityResults.issues.length,
      issuesBySeverity: {
        critical: this.qualityResults.issues.filter(i => i.severity === 'critical').length,
        high: this.qualityResults.issues.filter(i => i.severity === 'high').length,
        medium: this.qualityResults.issues.filter(i => i.severity === 'medium').length,
        low: this.qualityResults.issues.filter(i => i.severity === 'low').length,
      },
      technicalDebt: this.technicalDebt.totalCost,
      lastScan: this.qualityResults.lastScan,
      autoFixEnabled: this.config.autoFix.enabled,
      hooksInstalled: this.config.hooks.preCommit.enabled || this.config.hooks.prePush.enabled,
    };
  }
}

// CLI mode
if (require.main === module) {
  const scanner = new CodeQualityScanner();

  const args = process.argv.slice(2);
  const command = args[0];

  async function main() {
    try {
      await scanner.initialize();

      switch (command) {
        case 'scan':
          console.log('🔍 Running full quality scan...\n');
          const report = args.includes('--report');
          const fix = args.includes('--fix');

          const result = await scanner.runFullScan({ report, fix });

          console.log(`\n📊 Overall Quality Score: ${result.overallScore}/10`);
          if (result.overallScore < 7) {
            process.exit(1);
          }
          break;

        case 'quick-scan':
          console.log('⚡ Running quick quality scan...\n');
          // Quick scan implementation
          const quickResult = await scanner.runFullScan({
            paths: ['src/'],
            report: false,
          });

          if (quickResult.overallScore < 5) {
            process.exit(1);
          }
          break;

        case 'fix':
          console.log('🔧 Applying automatic fixes...\n');
          await scanner.runFullScan({ fix: true });
          break;

        case 'stats':
          const stats = await scanner.getStatistics();
          console.log('📊 Code Quality Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;

        case 'setup-hooks':
          await scanner.setupGitHooks();
          console.log('✅ Git hooks installed');
          break;

        case 'help':
        default:
          console.log(`
🔍 Code Quality Scanner

USAGE:
  node CodeQualityScanner.js <command> [options]

COMMANDS:
  scan [--report] [--fix]     Run full quality analysis
  quick-scan                  Run quick quality check (for hooks)
  fix                         Apply automatic fixes
  stats                       Display quality statistics
  setup-hooks                 Install Git hooks
  help                        Show this help

OPTIONS:
  --report                    Generate HTML report
  --fix                       Apply automatic fixes
  --staged                    Only scan staged files (for hooks)

EXAMPLES:
  node CodeQualityScanner.js scan --report
  node CodeQualityScanner.js fix
  node CodeQualityScanner.js setup-hooks
  node CodeQualityScanner.js quick-scan

EXIT CODES:
  0 = Quality checks passed
  1 = Quality issues found (severity depends on thresholds)
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

module.exports = CodeQualityScanner;
