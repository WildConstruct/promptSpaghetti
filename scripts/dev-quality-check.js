#!/usr/bin/env node

/**
 * Development Quality Check Script
 * 
 * Automated quality validation tool for developers to run before commits.
 * Integrates all quality improvements into a single workflow.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class QualityChecker {
  constructor() {
    this.results = {
      security: { passed: 0, failed: 0, issues: [] },
      performance: { passed: 0, failed: 0, issues: [] },
      accessibility: { passed: 0, failed: 0, issues: [] },
      testing: { passed: 0, failed: 0, issues: [] },
      linting: { passed: 0, failed: 0, issues: [] }
    };
    this.startTime = Date.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(title) {
    const border = '='.repeat(60);
    this.log(`\n${border}`, 'cyan');
    this.log(`🔍 ${title}`, 'bold');
    this.log(border, 'cyan');
  }

  logStep(step, status = 'info') {
    const icons = { info: '📋', success: '✅', warning: '⚠️', error: '❌' };
    const colorMap = { info: 'blue', success: 'green', warning: 'yellow', error: 'red' };
    this.log(`${icons[status]} ${step}`, colorMap[status]);
  }

  async runSecurityChecks() {
    this.logHeader('Security Validation');
    
    const checks = [
      {
        name: 'Check for dangerous patterns',
        run: () => this.scanForDangerousPatterns()
      },
      {
        name: 'Validate security utilities',
        run: () => this.validateSecurityUtils()
      },
      {
        name: 'Check for hardcoded secrets',
        run: () => this.scanForSecrets()
      },
      {
        name: 'Validate input sanitization',
        run: () => this.checkInputSanitization()
      }
    ];

    for (const check of checks) {
      try {
        const result = await check.run();
        if (result.passed) {
          this.logStep(`${check.name}: PASSED`, 'success');
          this.results.security.passed++;
        } else {
          this.logStep(`${check.name}: FAILED`, 'error');
          this.results.security.failed++;
          this.results.security.issues.push(...result.issues);
        }
      } catch (error) {
        this.logStep(`${check.name}: ERROR - ${error.message}`, 'error');
        this.results.security.failed++;
        this.results.security.issues.push(`${check.name}: ${error.message}`);
      }
    }
  }

  scanForDangerousPatterns() {
    const dangerousPatterns = [
      { pattern: /eval\s*\(/g, message: 'Use of eval() detected' },
      { pattern: /innerHTML\s*=/g, message: 'Use of innerHTML detected - use textContent instead' },
      { pattern: /document\.write\s*\(/g, message: 'Use of document.write detected' },
      { pattern: /javascript:/gi, message: 'JavaScript URL detected' },
      { pattern: /vbscript:/gi, message: 'VBScript URL detected' },
      { pattern: /on\w+\s*=\s*['"]/g, message: 'Inline event handler detected' }
    ];

    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          dangerousPatterns.forEach(({ pattern, message }) => {
            const matches = content.match(pattern);
            if (matches) {
              issues.push(`${relativePath}: ${message} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`);
            }
          });
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  validateSecurityUtils() {
    const securityUtilsPath = path.join(process.cwd(), 'client/src/utils/securityUtils.ts');
    
    if (!fs.existsSync(securityUtilsPath)) {
      return { passed: false, issues: ['Security utilities not found'] };
    }

    const content = fs.readFileSync(securityUtilsPath, 'utf8');
    const requiredFunctions = [
      'sanitizeText',
      'validateUrl',
      'validateInput',
      'generateCSRFToken',
      'validateCSRFToken'
    ];

    const issues = [];
    requiredFunctions.forEach(func => {
      if (!content.includes(`export function ${func}`) && !content.includes(`${func}:`)) {
        issues.push(`Missing security function: ${func}`);
      }
    });

    return { passed: issues.length === 0, issues };
  }

  scanForSecrets() {
    const secretPatterns = [
      { pattern: /api[_-]?key\s*[=:]\s*['"][^'"]{10,}/gi, message: 'Potential API key' },
      { pattern: /password\s*[=:]\s*['"][^'"]{5,}/gi, message: 'Hardcoded password' },
      { pattern: /secret\s*[=:]\s*['"][^'"]{10,}/gi, message: 'Hardcoded secret' },
      { pattern: /token\s*[=:]\s*['"][^'"]{20,}/gi, message: 'Hardcoded token' },
      { pattern: /sk_[a-zA-Z0-9]{20,}/g, message: 'Stripe secret key' },
      { pattern: /pk_[a-zA-Z0-9]{20,}/g, message: 'Stripe publishable key' }
    ];

    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          secretPatterns.forEach(({ pattern, message }) => {
            const matches = content.match(pattern);
            if (matches) {
              // Filter out common false positives
              const filtered = matches.filter(match => 
                !match.includes('process.env') &&
                !match.includes('import.meta.env') &&
                !match.includes('example') &&
                !match.includes('placeholder') &&
                !match.includes('YOUR_') &&
                !match.includes('xxx')
              );
              
              if (filtered.length > 0) {
                issues.push(`${relativePath}: ${message} detected`);
              }
            }
          });
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  checkInputSanitization() {
    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(ts|tsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          // Check for form inputs without validation
          const formInputPattern = /<input[^>]*type\s*=\s*["'](?:text|email|url|search)[^>]*>/gi;
          const matches = content.match(formInputPattern);
          
          if (matches) {
            // Check if validation is present nearby
            const hasValidation = content.includes('validateInput') || 
                                 content.includes('validation') ||
                                 content.includes('sanitize') ||
                                 content.includes('Zod') ||
                                 content.includes('yup');
            
            if (!hasValidation) {
              issues.push(`${relativePath}: Form inputs found without apparent validation`);
            }
          }
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  async runPerformanceChecks() {
    this.logHeader('Performance Validation');
    
    const checks = [
      {
        name: 'Check for performance monitoring',
        run: () => this.checkPerformanceMonitoring()
      },
      {
        name: 'Validate memory optimization',
        run: () => this.checkMemoryOptimization()
      },
      {
        name: 'Check for React performance patterns',
        run: () => this.checkReactPerformance()
      },
      {
        name: 'Validate image optimization',
        run: () => this.checkImageOptimization()
      }
    ];

    for (const check of checks) {
      try {
        const result = await check.run();
        if (result.passed) {
          this.logStep(`${check.name}: PASSED`, 'success');
          this.results.performance.passed++;
        } else {
          this.logStep(`${check.name}: FAILED`, 'error');
          this.results.performance.failed++;
          this.results.performance.issues.push(...result.issues);
        }
      } catch (error) {
        this.logStep(`${check.name}: ERROR - ${error.message}`, 'error');
        this.results.performance.failed++;
        this.results.performance.issues.push(`${check.name}: ${error.message}`);
      }
    }
  }

  checkPerformanceMonitoring() {
    const performanceMonitorPath = path.join(process.cwd(), 'client/src/utils/performanceMonitor.ts');
    
    if (!fs.existsSync(performanceMonitorPath)) {
      return { passed: false, issues: ['Performance monitor not found'] };
    }

    const content = fs.readFileSync(performanceMonitorPath, 'utf8');
    const requiredFeatures = [
      'measureExecution',
      'trackApiCall',
      'trackInteraction',
      'getStats',
      'flush'
    ];

    const issues = [];
    requiredFeatures.forEach(feature => {
      if (!content.includes(feature)) {
        issues.push(`Missing performance feature: ${feature}`);
      }
    });

    return { passed: issues.length === 0, issues };
  }

  checkMemoryOptimization() {
    const memoryUtilsPath = path.join(process.cwd(), 'client/src/utils/memoryOptimization.ts');
    
    if (!fs.existsSync(memoryUtilsPath)) {
      return { passed: false, issues: ['Memory optimization utilities not found'] };
    }

    const content = fs.readFileSync(memoryUtilsPath, 'utf8');
    const requiredFeatures = [
      'WeakCache',
      'useResourceManager',
      'useVirtualScrolling',
      'useLazyLoading',
      'useMemoryMonitoring'
    ];

    const issues = [];
    requiredFeatures.forEach(feature => {
      if (!content.includes(feature)) {
        issues.push(`Missing memory optimization feature: ${feature}`);
      }
    });

    return { passed: issues.length === 0, issues };
  }

  checkReactPerformance() {
    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(tsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          // Check for missing React.memo on large components
          if (content.length > 5000 && !content.includes('React.memo') && !content.includes('memo(')) {
            issues.push(`${relativePath}: Large component without React.memo optimization`);
          }
          
          // Check for inline object creation in JSX
          const inlineObjectPattern = /\w+\s*=\s*\{\{[^}]+\}\}/g;
          if (inlineObjectPattern.test(content)) {
            issues.push(`${relativePath}: Inline object creation detected - consider useMemo`);
          }
          
          // Check for inline function creation in JSX
          const inlineFunctionPattern = /\w+\s*=\s*\(\s*\)\s*=>/g;
          if (inlineFunctionPattern.test(content)) {
            issues.push(`${relativePath}: Inline function creation detected - consider useCallback`);
          }
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  checkImageOptimization() {
    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(tsx|ts)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          // Check for img tags without lazy loading
          const imgPattern = /<img[^>]*src\s*=/gi;
          const lazyPattern = /loading\s*=\s*["']lazy["']/gi;
          
          const imgMatches = content.match(imgPattern);
          const lazyMatches = content.match(lazyPattern);
          
          if (imgMatches && (!lazyMatches || lazyMatches.length < imgMatches.length)) {
            issues.push(`${relativePath}: Images without lazy loading detected`);
          }
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  async runAccessibilityChecks() {
    this.logHeader('Accessibility Validation');
    
    const checks = [
      {
        name: 'Check for ARIA attributes',
        run: () => this.checkAriaAttributes()
      },
      {
        name: 'Validate semantic HTML',
        run: () => this.checkSemanticHTML()
      },
      {
        name: 'Check for form accessibility',
        run: () => this.checkFormAccessibility()
      },
      {
        name: 'Validate color contrast',
        run: () => this.checkColorContrast()
      }
    ];

    for (const check of checks) {
      try {
        const result = await check.run();
        if (result.passed) {
          this.logStep(`${check.name}: PASSED`, 'success');
          this.results.accessibility.passed++;
        } else {
          this.logStep(`${check.name}: FAILED`, 'error');
          this.results.accessibility.failed++;
          this.results.accessibility.issues.push(...result.issues);
        }
      } catch (error) {
        this.logStep(`${check.name}: ERROR - ${error.message}`, 'error');
        this.results.accessibility.failed++;
        this.results.accessibility.issues.push(`${check.name}: ${error.message}`);
      }
    }
  }

  checkAriaAttributes() {
    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(tsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          // Check for buttons without ARIA labels
          const buttonPattern = /<button[^>]*>/gi;
          const buttons = content.match(buttonPattern) || [];
          
          buttons.forEach(button => {
            if (!button.includes('aria-label') && !button.includes('aria-labelledby')) {
              // Check if button has text content or is icon-only
              if (button.includes('Icon') || button.includes('<svg')) {
                issues.push(`${relativePath}: Icon button without aria-label detected`);
              }
            }
          });
          
          // Check for interactive elements without proper roles
          const interactivePattern = /<div[^>]*onClick[^>]*>/gi;
          const interactiveElements = content.match(interactivePattern) || [];
          
          interactiveElements.forEach(element => {
            if (!element.includes('role=') && !element.includes('tabIndex')) {
              issues.push(`${relativePath}: Interactive div without proper role/tabIndex`);
            }
          });
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  checkSemanticHTML() {
    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(tsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          // Check for div usage where semantic elements would be better
          const semanticOpportunities = [
            { pattern: /<div[^>]*className\s*=\s*["'][^"']*header/gi, suggestion: 'header' },
            { pattern: /<div[^>]*className\s*=\s*["'][^"']*nav/gi, suggestion: 'nav' },
            { pattern: /<div[^>]*className\s*=\s*["'][^"']*main/gi, suggestion: 'main' },
            { pattern: /<div[^>]*className\s*=\s*["'][^"']*footer/gi, suggestion: 'footer' },
            { pattern: /<div[^>]*className\s*=\s*["'][^"']*sidebar/gi, suggestion: 'aside' }
          ];
          
          semanticOpportunities.forEach(({ pattern, suggestion }) => {
            if (pattern.test(content)) {
              issues.push(`${relativePath}: Consider using <${suggestion}> instead of div`);
            }
          });
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  checkFormAccessibility() {
    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(tsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          // Check for inputs without labels
          const inputPattern = /<input[^>]*type\s*=\s*["'](?:text|email|password|number)[^>]*>/gi;
          const inputs = content.match(inputPattern) || [];
          
          inputs.forEach(input => {
            if (!input.includes('aria-label') && !input.includes('aria-labelledby')) {
              // Check for nearby label elements
              const hasNearbyLabel = content.includes('<label') && content.includes('htmlFor');
              if (!hasNearbyLabel) {
                issues.push(`${relativePath}: Input without proper label association`);
              }
            }
          });
          
          // Check for forms without fieldsets for grouped inputs
          if (content.includes('<input') && content.includes('type="radio"') && !content.includes('<fieldset')) {
            issues.push(`${relativePath}: Radio buttons without fieldset grouping`);
          }
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  checkColorContrast() {
    const issues = [];
    const clientDir = path.join(process.cwd(), 'client/src');
    
    // This is a basic check for CSS color patterns that might have contrast issues
    const lowContrastPatterns = [
      /color:\s*#[89a-f][89a-f][89a-f]/gi, // Light gray text
      /background:\s*#[0-3][0-3][0-3]/gi,   // Very dark backgrounds with potential light text
      /color:\s*#[fde][fde][fde].*background:\s*#[fde][fde][fde]/gi // Light on light
    ];
    
    if (!fs.existsSync(clientDir)) {
      return { passed: true, issues: [] };
    }

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.match(/\.(css|scss|tsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          lowContrastPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              issues.push(`${relativePath}: Potential color contrast issue detected`);
            }
          });
        }
      }
    };

    scanDirectory(clientDir);
    return { passed: issues.length === 0, issues };
  }

  async runTestingChecks() {
    this.logHeader('Testing Infrastructure Validation');
    
    const checks = [
      {
        name: 'Check test coverage',
        run: () => this.checkTestCoverage()
      },
      {
        name: 'Validate test runner',
        run: () => this.validateTestRunner()
      },
      {
        name: 'Check test file structure',
        run: () => this.checkTestStructure()
      }
    ];

    for (const check of checks) {
      try {
        const result = await check.run();
        if (result.passed) {
          this.logStep(`${check.name}: PASSED`, 'success');
          this.results.testing.passed++;
        } else {
          this.logStep(`${check.name}: FAILED`, 'error');
          this.results.testing.failed++;
          this.results.testing.issues.push(...result.issues);
        }
      } catch (error) {
        this.logStep(`${check.name}: ERROR - ${error.message}`, 'error');
        this.results.testing.failed++;
        this.results.testing.issues.push(`${check.name}: ${error.message}`);
      }
    }
  }

  checkTestCoverage() {
    const testFiles = [
      'client/src/utils/__tests__/securityUtils.test.ts',
      'client/src/utils/__tests__/performanceMonitor.test.ts',
      'client/src/utils/__tests__/memoryOptimization.test.ts',
      'client/src/services/__tests__/fileService.integration.test.ts',
      'client/src/utils/__tests__/testRunner.ts'
    ];

    const issues = [];
    testFiles.forEach(testFile => {
      const fullPath = path.join(process.cwd(), testFile);
      if (!fs.existsSync(fullPath)) {
        issues.push(`Missing test file: ${testFile}`);
      }
    });

    return { passed: issues.length === 0, issues };
  }

  validateTestRunner() {
    const testRunnerPath = path.join(process.cwd(), 'client/src/utils/__tests__/testRunner.ts');
    
    if (!fs.existsSync(testRunnerPath)) {
      return { passed: false, issues: ['Test runner not found'] };
    }

    const content = fs.readFileSync(testRunnerPath, 'utf8');
    const requiredFeatures = [
      'runAllTests',
      'runSecurityTests',
      'runPerformanceTests',
      'runMemoryTests',
      'runIntegrationTests'
    ];

    const issues = [];
    requiredFeatures.forEach(feature => {
      if (!content.includes(feature)) {
        issues.push(`Missing test runner feature: ${feature}`);
      }
    });

    return { passed: issues.length === 0, issues };
  }

  checkTestStructure() {
    const testDirs = [
      'client/src/utils/__tests__',
      'client/src/services/__tests__'
    ];

    const issues = [];
    testDirs.forEach(testDir => {
      const fullPath = path.join(process.cwd(), testDir);
      if (!fs.existsSync(fullPath)) {
        issues.push(`Missing test directory: ${testDir}`);
      }
    });

    return { passed: issues.length === 0, issues };
  }

  async runLintingChecks() {
    this.logHeader('Code Quality & Linting');
    
    try {
      // Run TypeScript compilation check
      this.logStep('Running TypeScript compilation check...', 'info');
      try {
        execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        this.logStep('TypeScript compilation: PASSED', 'success');
        this.results.linting.passed++;
      } catch (error) {
        this.logStep('TypeScript compilation: FAILED', 'error');
        this.results.linting.failed++;
        this.results.linting.issues.push('TypeScript compilation errors');
      }

      // Run ESLint if available
      this.logStep('Running ESLint check...', 'info');
      try {
        execSync('npx eslint client/src --ext .ts,.tsx --quiet', { stdio: 'pipe' });
        this.logStep('ESLint: PASSED', 'success');
        this.results.linting.passed++;
      } catch (error) {
        this.logStep('ESLint: ISSUES FOUND', 'warning');
        this.results.linting.issues.push('ESLint issues detected');
      }

    } catch (error) {
      this.logStep(`Linting check failed: ${error.message}`, 'error');
      this.results.linting.failed++;
    }
  }

  generateReport() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    this.logHeader('Quality Check Report');
    
    const categories = Object.keys(this.results);
    let totalPassed = 0;
    let totalFailed = 0;
    
    categories.forEach(category => {
      const { passed, failed } = this.results[category];
      totalPassed += passed;
      totalFailed += failed;
      
      const total = passed + failed;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 100;
      const status = percentage >= 90 ? 'success' : percentage >= 75 ? 'warning' : 'error';
      
      this.logStep(`${category.padEnd(15)}: ${passed}/${total} (${percentage}%)`, status);
    });
    
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log(`📊 Overall: ${totalPassed}/${totalPassed + totalFailed} checks passed`, 
             totalFailed === 0 ? 'green' : 'yellow');
    this.log(`⏱️  Duration: ${totalDuration}ms`, 'blue');
    
    if (totalFailed > 0) {
      this.log('\n❌ Issues Found:', 'red');
      categories.forEach(category => {
        if (this.results[category].issues.length > 0) {
          this.log(`\n${category.toUpperCase()}:`, 'red');
          this.results[category].issues.forEach(issue => {
            this.log(`  • ${issue}`, 'red');
          });
        }
      });
    } else {
      this.log('\n✅ All quality checks passed! 🎉', 'green');
    }
    
    return totalFailed === 0;
  }

  async run() {
    this.log('🚀 Starting comprehensive quality validation...', 'bold');
    
    await this.runSecurityChecks();
    await this.runPerformanceChecks();
    await this.runAccessibilityChecks();
    await this.runTestingChecks();
    await this.runLintingChecks();
    
    const success = this.generateReport();
    
    if (success) {
      this.log('\n🎯 Quality validation completed successfully!', 'green');
      process.exit(0);
    } else {
      this.log('\n🚨 Quality validation failed. Please address the issues above.', 'red');
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const checker = new QualityChecker();
  checker.run().catch(error => {
    console.error('Quality check failed:', error);
    process.exit(1);
  });
}

module.exports = { QualityChecker };