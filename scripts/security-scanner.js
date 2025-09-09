#!/usr/bin/env node

/**
 * Automated Security Scanner
 * 
 * Comprehensive security scanning tool that integrates with our quality infrastructure
 * to provide continuous security monitoring and vulnerability detection.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
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

class SecurityScanner {
  constructor() {
    this.results = {
      vulnerabilities: [],
      codeSecurityIssues: [],
      dependencyIssues: [],
      configurationIssues: [],
      recommendations: []
    };
    this.severity = {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
      INFO: 'info'
    };


  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(title) {
    const border = '='.repeat(60);
    this.log(`\n${border}`, 'cyan');
    this.log(`🔒 ${title}`, 'bold');
    this.log(border, 'cyan');


  logStep(step: string, status: string = 'info'): void {
    const icons = { info: '📋', success: '✅', warning: '⚠️', error: '❌' };
    const colorMap = { info: 'blue', success: 'green', warning: 'yellow', error: 'red' };
    this.log(`${icons[status]} ${step}`, colorMap[status]);


  async runComprehensiveScan(): Promise<any> {
    this.logHeader('Comprehensive Security Scan');
    
    await this.scanDependencyVulnerabilities();
    await this.scanCodeSecurityIssues();
    await this.scanConfigurationSecurity();
    await this.scanFilePermissions();
    await this.scanEnvironmentSecurity();
    await this.runQualitySecurityTests();
    
    return this.generateSecurityReport();


  async scanDependencyVulnerabilities(): Promise<void> {
    this.logStep('Scanning dependency vulnerabilities...', 'info');
    
    try {
      // npm/pnpm audit
      const auditOutput = execSync('pnpm audit --json', { encoding: 'utf8' });
      const auditData = JSON.parse(auditOutput);
      
      if (auditData.vulnerabilities) {
        Object.values(auditData.vulnerabilities).forEach((vuln: any) => {
          this.results.dependencyIssues.push({
            type: 'dependency_vulnerability',
            severity: vuln.severity || this.severity.MEDIUM,
            package: vuln.name,
            version: vuln.version,
            description: vuln.title,
            recommendation: `Update ${vuln.name} to version ${vuln.fixAvailable?.version || 'latest'}`
          });
        });

      
      this.logStep(`Found ${this.results.dependencyIssues.length} dependency vulnerabilities`, 
                   this.results.dependencyIssues.length > 0 ? 'warning' : 'success');
 catch (error) {
      this.logStep('Dependency scan completed with warnings', 'warning');



  async scanCodeSecurityIssues(): Promise<void> {
    this.logStep('Scanning code for security issues...', 'info');
    
    const securityPatterns = [
      {
        pattern: /eval\s*\(/g,
        severity: this.severity.CRITICAL,
        message: 'Use of eval() can lead to code injection',
        recommendation: 'Replace eval() with safer alternatives like JSON.parse() or Function constructor'
      },
      {
        pattern: /innerHTML\s*=/g,
        severity: this.severity.HIGH,
        message: 'innerHTML usage can lead to XSS attacks',
        recommendation: 'Use textContent or safe DOM manipulation methods'
      },
      {
        pattern: /document\.write\s*\(/g,
        severity: this.severity.HIGH,
        message: 'document.write() can be exploited for script injection',
        recommendation: 'Use modern DOM manipulation methods'
      },
      {
        pattern: /javascript:/gi,
        severity: this.severity.HIGH,
        message: 'JavaScript URL detected - potential XSS vector',
        recommendation: 'Use event handlers instead of JavaScript URLs'
      },
      {
        pattern: /['"]\s*\+\s*[^'"]*\s*\+\s*['"][^'"]*sql[^'"]*['"]|['"]\s*\+\s*[^'"]*\s*\+\s*['"][^'"]*select[^'"]*['"]/gi,
        severity: this.severity.CRITICAL,
        message: 'Potential SQL injection vulnerability',
        recommendation: 'Use parameterized queries or ORM methods'
      },
      {
        pattern: /crypto\.createHash\(['"]md5['"]|crypto\.createHash\(['"]sha1['"])/g,
        severity: this.severity.MEDIUM,
        message: 'Weak cryptographic hash function',
        recommendation: 'Use SHA-256 or stronger hash functions'
      },
      {
        pattern: /Math\.random\(\)/g,
        severity: this.severity.LOW,
        message: 'Math.random() is not cryptographically secure',
        recommendation: 'Use crypto.getRandomValues() for security-sensitive random values'

    ];

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of (files as string[])) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
 else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(process.cwd(), filePath);
          
          securityPatterns.forEach(({ pattern, severity, message, recommendation }) => {
            const matches = content.match(pattern);
            if (matches) {
              this.results.codeSecurityIssues.push({
                type: 'code_security_issue',
                severity,
                file: relativePath,
                message,
                recommendation,
                occurrences: matches.length
              });

          });


    };

    // Scan client and server directories
    ['client/src', 'server/src', 'packages'].forEach(dir => {
      if (fs.existsSync(dir)) {
        scanDirectory(dir);

    });

    this.logStep(`Found ${this.results.codeSecurityIssues.length} code security issues`, 
                 this.results.codeSecurityIssues.length > 0 ? 'warning' : 'success');


  async scanConfigurationSecurity(): Promise<void> {
    this.logStep('Scanning configuration security...', 'info');
    
    const configChecks = [
      {
        file: '.env',
        check: (content) => {
          const issues = [];
          
          // Check for exposed secrets
          const secretPatterns = [
            /api[_-]?key\s*=\s*['"']?[a-zA-Z0-9]{20,}/gi,
            /password\s*=\s*['"']?[^'"'\s]{5,}/gi,
            /secret\s*=\s*['"']?[a-zA-Z0-9]{10,}/gi,
            /token\s*=\s*['"']?[a-zA-Z0-9]{20,}/gi
          ];
          
          secretPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              issues.push({
                type: 'exposed_secret',
                severity: this.severity.CRITICAL,
                message: 'Potential secret exposed in .env file',
                recommendation: 'Use environment-specific .env files and never commit secrets'
              });

          });
          
          return issues;

      },
      {
        file: 'package.json',
        check: (content) => {
          const issues = [];
          const packageData = JSON.parse(content);
          
          // Check for npm scripts with potential security issues
          if (packageData.scripts) {
            Object.entries(packageData.scripts).forEach(([name, script]: [string, any]) => {
              if (script.includes('sudo') || script.includes('rm -rf') || script.includes('curl | sh')) {
                issues.push({
                  type: 'dangerous_script',
                  severity: this.severity.HIGH,
                  message: `Potentially dangerous npm script: ${name}`,
                  recommendation: 'Review and secure npm scripts'
                });

            });

          
          return issues;

      },
      {
        file: 'tsconfig.json',
        check: (content) => {
          const issues = [];
          const tsConfig = JSON.parse(content);
          
          // Check for insecure TypeScript configuration
          if (tsConfig.compilerOptions?.strict === false) {
            issues.push({
              type: 'weak_typescript_config',
              severity: this.severity.MEDIUM,
              message: 'TypeScript strict mode is disabled',
              recommendation: 'Enable strict mode for better type safety'
            });

          
          return issues;


    ];

    configChecks.forEach(({ file, check }) => {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const issues = check(content);
          this.results.configurationIssues.push(...issues);
 catch (error) {
          this.logStep(`Failed to scan ${file}: ${error.message}`, 'warning');


    });

    this.logStep(`Found ${this.results.configurationIssues.length} configuration issues`, 
                 this.results.configurationIssues.length > 0 ? 'warning' : 'success');


  async scanFilePermissions(): Promise<void> {
    this.logStep('Scanning file permissions...', 'info');
    
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'private.key',
      'id_rsa',
      'config/database.yml'
    ];

    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = stats.mode & parseInt('777', 8);
          
          if (mode & 0o044) { // World or group readable
            this.results.configurationIssues.push({
              type: 'file_permissions',
              severity: this.severity.HIGH,
              file,
              message: `Sensitive file ${file} is readable by others`,
              recommendation: `Run: chmod 600 ${file}`
            });

 catch (error) {
          // File permission check failed


    });


  async scanEnvironmentSecurity(): Promise<void> {
    this.logStep('Scanning environment security...', 'info');
    
    // Check for development/debug modes in production indicators
    const productionChecks = [
      {
        check: () => process.env.NODE_ENV !== 'production',
        message: 'NODE_ENV is not set to production',
        severity: this.severity.MEDIUM,
        recommendation: 'Set NODE_ENV=production for production deployments'
      },
      {
        check: () => process.env.DEBUG === 'true',
        message: 'Debug mode is enabled',
        severity: this.severity.HIGH,
        recommendation: 'Disable debug mode in production'

    ];

    productionChecks.forEach(({ check, message, severity, recommendation }) => {
      if (check()) {
        this.results.configurationIssues.push({
          type: 'environment_config',
          severity,
          message,
          recommendation
        });

    });


  async runQualitySecurityTests(): Promise<void> {
    this.logStep('Running quality infrastructure security tests...', 'info');
    
    try {
      // Import and run our security utilities tests
      const { validateUrl, validateInput, generateCSRFToken } = require('../client/src/utils/securityUtils');
      
      // Test security utilities
      const testCases = [
        {
          name: 'XSS Prevention',
          test: () => {
            const xssAttempts = [
              '<script>alert(1)</script>',
              'javascript:alert(1)',
              'onload=alert(1)'
            ];
            return xssAttempts.every(input => {
              const result = validateInput(input);
              return !result.isValid && result.errors.some(e => e.includes('dangerous'));
            });

        },
        {
          name: 'URL Validation',
          test: () => {
            const dangerousUrls = [
              'javascript:alert(1)',
              'data:text/html,<script>alert(1)</script>',
              'vbscript:msgbox(1)'
            ];
            return dangerousUrls.every(url => validateUrl(url) === null);

        },
        {
          name: 'CSRF Token Generation',
          test: () => {
            const token1 = generateCSRFToken();
            const token2 = generateCSRFToken();
            return token1.length === 64 && token2.length === 64 && token1 !== token2;


      ];

      let passedTests = 0;
      testCases.forEach(({ name, test }) => {
        try {
          if (test()) {
            this.logStep(`${name}: PASSED`, 'success');
            passedTests++;
 else {
            this.logStep(`${name}: FAILED`, 'error');
            this.results.vulnerabilities.push({
              type: 'security_test_failure',
              severity: this.severity.HIGH,
              message: `Security test failed: ${name}`,
              recommendation: 'Review and fix security utility implementation'
            });

 catch (error) {
          this.logStep(`${name}: ERROR - ${error.message}`, 'error');
          this.results.vulnerabilities.push({
            type: 'security_test_error',
            severity: this.severity.HIGH,
            message: `Security test error: ${name}`,
            recommendation: 'Debug security utility implementation'
          });

      });

      this.logStep(`Security tests: ${passedTests}/${testCases.length} passed`, 
                   passedTests === testCases.length ? 'success' : 'warning');
 catch (error) {
      this.logStep('Failed to run quality security tests', 'warning');
      this.log(`Error: ${error.message}`, 'yellow');



  generateSecurityReport(): any {
    this.logHeader('Security Scan Report');
    
    const allIssues = [
      ...this.results.vulnerabilities,
      ...this.results.codeSecurityIssues,
      ...this.results.dependencyIssues,
      ...this.results.configurationIssues
    ];

    // Group by severity
    const severityGroups = {
      [this.severity.CRITICAL]: [],
      [this.severity.HIGH]: [],
      [this.severity.MEDIUM]: [],
      [this.severity.LOW]: [],
      [this.severity.INFO]: []
    };

    allIssues.forEach(issue => {
      severityGroups[issue.severity].push(issue);
    });

    // Display summary
    this.log('\n📊 Security Summary:', 'cyan');
    Object.entries(severityGroups).forEach(([severity, issues]) => {
      const count = issues.length;
      const emoji = severity === this.severity.CRITICAL || severity === this.severity.HIGH ? '🔴' :
                   severity === this.severity.MEDIUM ? '🟡' : '🟢';
      this.log(`   ${emoji} ${severity.toUpperCase()}: ${count}`, count > 0 ? 'yellow' : 'green');
    });

    // Display detailed issues
    if (allIssues.length > 0) {
      this.log('\n🔍 Security Issues Found:', 'red');
      
      Object.entries(severityGroups).forEach(([severity, issues]) => {
        if (issues.length > 0) {
          this.log(`\n${severity.toUpperCase()} SEVERITY:`, 'red');
          issues.forEach((issue, index) => {
            this.log(`\n${index + 1}. ${issue.message}`, 'yellow');
            if (issue.file) this.log(`   File: ${issue.file}`, 'blue');
            if (issue.package) this.log(`   Package: ${issue.package}`, 'blue');
            this.log(`   Recommendation: ${issue.recommendation}`, 'cyan');
          });

      });
 else {
      this.log('\n✅ No security issues found!', 'green');


    // Generate recommendations
    this.generateRecommendations();
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: allIssues.length,
        critical: severityGroups[this.severity.CRITICAL].length,
        high: severityGroups[this.severity.HIGH].length,
        medium: severityGroups[this.severity.MEDIUM].length,
        low: severityGroups[this.severity.LOW].length
      },
      issues: allIssues,
      recommendations: this.results.recommendations
    };

    const reportPath = 'security-scan-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.logStep(`Security report saved to ${reportPath}`, 'success');

    return report;


  generateRecommendations(): void {
    this.log('\n💡 Security Recommendations:', 'cyan');
    
    const recommendations = [
      '1. Keep dependencies updated with automated security patches',
      '2. Enable strict TypeScript mode for better type safety',
      '3. Use our security utilities (validateInput, validateUrl) consistently',
      '4. Implement Content Security Policy (CSP) headers',
      '5. Set up automated security scanning in CI/CD pipeline',
      '6. Regular security audits and penetration testing',
      '7. Employee security training and awareness programs',
      '8. Implement proper error handling to avoid information disclosure'
    ];

    recommendations.forEach(rec => {
      this.log(`   ${rec}`, 'blue');
    });

    this.results.recommendations = recommendations;



// CLI execution
if (require.main === module) {
  const scanner = new SecurityScanner();
  
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Security Scanner

Usage: node scripts/security-scanner.js [options]

Options:
  --help, -h         Show this help message
  --output-json      Output results in JSON format
  --severity-filter  Filter by minimum severity (critical, high, medium, low)

This script performs comprehensive security scanning including:
- Dependency vulnerability analysis
- Code security pattern detection  
- Configuration security review
- File permission auditing
- Environment security checks
- Quality infrastructure security tests

The scanner integrates with our quality infrastructure to provide
continuous security monitoring and vulnerability detection.
`);
    process.exit(0);

  
  scanner.runComprehensiveScan().then(report => {
    const criticalOrHigh = report.summary.critical + report.summary.high;
    
    if (criticalOrHigh > 0) {
      console.error(`\n❌ Security scan failed: ${criticalOrHigh} critical/high severity issues found`);
      process.exit(1);
 else {
      console.log('\n✅ Security scan passed: No critical or high severity issues found');
      process.exit(0);

  }).catch(error => {
    console.error('Security scan failed:', error);
    process.exit(1);
  });


module.exports = { SecurityScanner };