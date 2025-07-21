#!/usr/bin/env node
/**
 * Code Quality Analysis Script
 * 
 * Provides actionable improvement suggestions based on static analysis results
 * Integrates with ESLint, TypeScript, and SonarJS for comprehensive analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class CodeQualityAnalyzer {
  constructor() {
    this.config = this.loadConfig();
    this.results = {
      eslint: null,
      typescript: null,
      sonar: null,
      summary: {
        errors: 0,
        warnings: 0,
        suggestions: []
      }
    };
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../code-quality-config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Code quality config not found, using defaults'));
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      qualityGates: {
        complexity: { cyclomaticComplexity: 15, cognitiveComplexity: 15 },
        coverage: { global: 80, core: 90 },
        duplication: { maxDuplicateLines: 10 }
      }
    };
  }

  async runAnalysis() {
    console.log(chalk.blue('🔍 Starting comprehensive code quality analysis...\n'));

    try {
      // Run ESLint analysis
      await this.runESLintAnalysis();
      
      // Run TypeScript analysis  
      await this.runTypeScriptAnalysis();
      
      // Run SonarJS analysis
      await this.runSonarAnalysis();
      
      // Generate actionable suggestions
      this.generateSuggestions();
      
      // Display results
      this.displayResults();
      
    } catch (error) {
      console.error(chalk.red('❌ Analysis failed:'), error.message);
      process.exit(1);
    }
  }

  async runESLintAnalysis() {
    console.log(chalk.cyan('📋 Running ESLint analysis...'));
    
    try {
      const result = execSync(
        'npx eslint . --ext .ts,.tsx,.js,.jsx --format json --quiet',
        { encoding: 'utf8' }
      );
      
      this.results.eslint = JSON.parse(result);
      this.results.summary.errors += this.results.eslint.reduce((sum, file) => 
        sum + file.errorCount, 0);
      this.results.summary.warnings += this.results.eslint.reduce((sum, file) => 
        sum + file.warningCount, 0);
        
    } catch (error) {
      // ESLint returns non-zero exit code when issues found
      if (error.stdout) {
        this.results.eslint = JSON.parse(error.stdout);
        this.results.summary.errors += this.results.eslint.reduce((sum, file) => 
          sum + file.errorCount, 0);
        this.results.summary.warnings += this.results.eslint.reduce((sum, file) => 
          sum + file.warningCount, 0);
      } else {
        console.warn(chalk.yellow('⚠️  ESLint analysis failed'));
      }
    }
  }

  async runTypeScriptAnalysis() {
    console.log(chalk.cyan('🔧 Running TypeScript analysis...'));
    
    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
      this.results.typescript = { errors: [], status: 'success' };
    } catch (error) {
      this.results.typescript = {
        errors: error.stdout.split('\n').filter(line => line.trim()),
        status: 'failed'
      };
      
      // Count TypeScript errors
      const tsErrors = this.results.typescript.errors.filter(line => 
        line.includes('error TS'));
      this.results.summary.errors += tsErrors.length;
    }
  }

  async runSonarAnalysis() {
    console.log(chalk.cyan('🧪 Running SonarJS analysis...'));
    
    try {
      const sonarConfigPath = path.join(__dirname, '../.eslintrc.sonar.json');
      if (fs.existsSync(sonarConfigPath)) {
        const result = execSync(
          `npx eslint . --config ${sonarConfigPath} --ext .ts,.tsx,.js,.jsx --format json --quiet`,
          { encoding: 'utf8' }
        );
        
        this.results.sonar = JSON.parse(result);
      } else {
        this.results.sonar = { warning: 'SonarJS config not found' };
      }
    } catch (error) {
      if (error.stdout) {
        this.results.sonar = JSON.parse(error.stdout);
      } else {
        console.warn(chalk.yellow('⚠️  SonarJS analysis failed'));
        this.results.sonar = { error: 'Analysis failed' };
      }
    }
  }

  generateSuggestions() {
    const suggestions = [];
    
    // ESLint suggestions
    if (this.results.eslint && this.results.eslint.length > 0) {
      const complexityIssues = this.findComplexityIssues();
      const securityIssues = this.findSecurityIssues();
      const performanceIssues = this.findPerformanceIssues();
      
      suggestions.push(...complexityIssues);
      suggestions.push(...securityIssues);
      suggestions.push(...performanceIssues);
    }
    
    // TypeScript suggestions
    if (this.results.typescript && this.results.typescript.status === 'failed') {
      suggestions.push({
        category: 'TypeScript',
        severity: 'error',
        message: 'Fix TypeScript compilation errors',
        action: 'Run `npx tsc --noEmit` and fix reported type errors',
        impact: 'high'
      });
    }
    
    // Coverage suggestions
    suggestions.push(...this.generateCoverageSuggestions());
    
    this.results.summary.suggestions = suggestions;
  }

  findComplexityIssues() {
    if (!this.results.eslint) return [];
    
    const complexityIssues = [];
    const complexityThreshold = this.config.qualityGates.complexity.cyclomaticComplexity;
    
    this.results.eslint.forEach(file => {
      file.messages.forEach(message => {
        if (message.ruleId === 'complexity' && message.severity === 1) {
          complexityIssues.push({
            category: 'Complexity',
            severity: 'warning',
            file: file.filePath,
            line: message.line,
            message: `Function complexity (${message.message}) exceeds threshold (${complexityThreshold})`,
            action: 'Consider breaking this function into smaller, more focused functions',
            impact: 'medium'
          });
        }
      });
    });
    
    return complexityIssues;
  }

  findSecurityIssues() {
    if (!this.results.eslint) return [];
    
    const securityIssues = [];
    const securityRules = [
      'no-eval', 'no-implied-eval', 'no-new-func', 'no-script-url'
    ];
    
    this.results.eslint.forEach(file => {
      file.messages.forEach(message => {
        if (securityRules.includes(message.ruleId)) {
          securityIssues.push({
            category: 'Security',
            severity: 'error',
            file: file.filePath,
            line: message.line,
            message: `Security vulnerability: ${message.message}`,
            action: 'Replace with safer alternatives or validate input thoroughly',
            impact: 'high'
          });
        }
      });
    });
    
    return securityIssues;
  }

  findPerformanceIssues() {
    if (!this.results.eslint) return [];
    
    const performanceIssues = [];
    const performanceRules = [
      'no-loop-func', 'prefer-const', 'no-await-in-loop'
    ];
    
    this.results.eslint.forEach(file => {
      file.messages.forEach(message => {
        if (performanceRules.includes(message.ruleId)) {
          performanceIssues.push({
            category: 'Performance',
            severity: 'warning',
            file: file.filePath,
            line: message.line,
            message: `Performance issue: ${message.message}`,
            action: 'Optimize code pattern for better performance',
            impact: 'medium'
          });
        }
      });
    });
    
    return performanceIssues;
  }

  generateCoverageSuggestions() {
    const suggestions = [];
    
    try {
      const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        const globalThreshold = this.config.qualityGates.coverage.global;
        
        if (coverage.total.lines.pct < globalThreshold) {
          suggestions.push({
            category: 'Coverage',
            severity: 'warning',
            message: `Test coverage (${coverage.total.lines.pct}%) is below threshold (${globalThreshold}%)`,
            action: 'Add tests for uncovered code paths, especially in core modules',
            impact: 'high'
          });
        }
      }
    } catch (error) {
      // Coverage data not available
    }
    
    return suggestions;
  }

  displayResults() {
    console.log(chalk.blue('\n📊 Code Quality Analysis Results\n'));
    console.log('═'.repeat(60));
    
    // Summary
    console.log(chalk.bold('\n📈 Summary'));
    console.log(`${chalk.red('Errors:')} ${this.results.summary.errors}`);
    console.log(`${chalk.yellow('Warnings:')} ${this.results.summary.warnings}`);
    console.log(`${chalk.blue('Suggestions:')} ${this.results.summary.suggestions.length}`);
    
    // Detailed suggestions
    if (this.results.summary.suggestions.length > 0) {
      console.log(chalk.bold('\n💡 Actionable Improvements'));
      console.log('─'.repeat(40));
      
      this.results.summary.suggestions
        .sort((a, b) => this.getImpactWeight(b.impact) - this.getImpactWeight(a.impact))
        .slice(0, 10) // Show top 10 suggestions
        .forEach((suggestion, index) => {
          const icon = this.getImpactIcon(suggestion.impact);
          const color = this.getSeverityColor(suggestion.severity);
          
          console.log(`\n${index + 1}. ${icon} ${chalk.bold(suggestion.category)}`);
          console.log(`   ${color(suggestion.message)}`);
          console.log(`   ${chalk.green('→')} ${suggestion.action}`);
          
          if (suggestion.file) {
            const relativePath = path.relative(process.cwd(), suggestion.file);
            console.log(`   ${chalk.gray('📁')} ${relativePath}:${suggestion.line || '?'}`);
          }
        });
    }
    
    // Recommendations
    console.log(chalk.bold('\n🎯 Next Steps'));
    console.log('─'.repeat(20));
    
    if (this.results.summary.errors > 0) {
      console.log(`${chalk.red('1.')} Fix ${this.results.summary.errors} error(s) - blocking issues`);
    }
    
    if (this.results.summary.warnings > 5) {
      console.log(`${chalk.yellow('2.')} Address high-priority warnings (${Math.min(this.results.summary.warnings, 5)} items)`);
    }
    
    console.log(`${chalk.blue('3.')} Run tests and ensure coverage meets thresholds`);
    console.log(`${chalk.green('4.')} Consider refactoring complex functions for maintainability`);
    
    console.log(chalk.bold('\n🔧 Commands'));
    console.log('─'.repeat(15));
    console.log(`${chalk.cyan('Fix auto-fixable issues:')} npm run lint:fix`);
    console.log(`${chalk.cyan('Run tests with coverage:')} npm run test:coverage`);
    console.log(`${chalk.cyan('TypeScript check:')} npx tsc --noEmit`);
    
    console.log('\n' + '═'.repeat(60));
    console.log(chalk.green('✨ Analysis complete! Focus on high-impact improvements first.'));
  }

  getImpactWeight(impact) {
    const weights = { high: 3, medium: 2, low: 1 };
    return weights[impact] || 1;
  }

  getImpactIcon(impact) {
    const icons = { high: '🔥', medium: '⚡', low: '💡' };
    return icons[impact] || '💡';
  }

  getSeverityColor(severity) {
    const colors = {
      error: chalk.red,
      warning: chalk.yellow,
      info: chalk.blue
    };
    return colors[severity] || chalk.gray;
  }
}

// CLI execution
if (require.main === module) {
  const analyzer = new CodeQualityAnalyzer();
  analyzer.runAnalysis().catch(error => {
    console.error(chalk.red('❌ Analysis failed:'), error);
    process.exit(1);
  });
}

module.exports = CodeQualityAnalyzer;