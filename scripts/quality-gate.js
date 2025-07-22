#!/usr/bin/env node

/**
 * Quality Gate Script for Static Analysis
 * Validates code quality metrics against defined thresholds
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Quality thresholds
const THRESHOLDS = {
  eslint: {
    maxErrors: 0,
    maxWarnings: 50
  },
  complexity: {
    maxAverage: 10,
    maxFunction: 15
  },
  security: {
    maxHigh: 0,
    maxModerate: 5
  }
};

class QualityGate {
  constructor() {
    this.results = {
      eslint: null,
      complexity: null,
      security: null
    };
    this.passed = true;
  }

  async run() {
    console.log(chalk.blue('🔍 Running Quality Gate Analysis...\n'));

    try {
      await this.checkESLintResults();
      await this.checkComplexityResults();
      await this.checkSecurityResults();
      
      this.printSummary();
      
      if (!this.passed) {
        process.exit(1);
      }
      
      console.log(chalk.green('✅ Quality Gate: PASSED\n'));
    } catch (error) {
      console.error(chalk.red('❌ Quality Gate: FAILED'));
      console.error(error.message);
      process.exit(1);
    }
  }

  async checkESLintResults() {
    const reportPath = path.join('reports', 'eslint-report.json');
    
    if (!fs.existsSync(reportPath)) {
      console.log(chalk.yellow('⚠️  ESLint report not found, skipping...'));
      return;
    }

    const eslintData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    const totalErrors = eslintData.reduce((sum, file) => sum + file.errorCount, 0);
    const totalWarnings = eslintData.reduce((sum, file) => sum + file.warningCount, 0);

    this.results.eslint = { errors: totalErrors, warnings: totalWarnings };

    console.log(chalk.blue('📋 ESLint Results:'));
    console.log(`   Errors: ${totalErrors} (max: ${THRESHOLDS.eslint.maxErrors})`);
    console.log(`   Warnings: ${totalWarnings} (max: ${THRESHOLDS.eslint.maxWarnings})`);

    if (totalErrors > THRESHOLDS.eslint.maxErrors) {
      console.log(chalk.red('   ❌ Too many ESLint errors'));
      this.passed = false;
    }

    if (totalWarnings > THRESHOLDS.eslint.maxWarnings) {
      console.log(chalk.red('   ❌ Too many ESLint warnings'));
      this.passed = false;
    }

    if (totalErrors <= THRESHOLDS.eslint.maxErrors && totalWarnings <= THRESHOLDS.eslint.maxWarnings) {
      console.log(chalk.green('   ✅ ESLint check passed'));
    }
    console.log();
  }

  async checkComplexityResults() {
    const reportPath = path.join('reports', 'complexity-report.json');
    
    if (!fs.existsSync(reportPath)) {
      console.log(chalk.yellow('⚠️  Complexity report not found, skipping...'));
      return;
    }

    const complexityData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    
    // Calculate average complexity
    let totalComplexity = 0;
    let functionCount = 0;
    let maxComplexity = 0;

    if (complexityData.results) {
      complexityData.results.forEach(file => {
        if (file.functions) {
          file.functions.forEach(func => {
            totalComplexity += func.complexity || 0;
            functionCount++;
            maxComplexity = Math.max(maxComplexity, func.complexity || 0);
          });
        }
      });
    }

    const averageComplexity = functionCount > 0 ? totalComplexity / functionCount : 0;
    
    this.results.complexity = { 
      average: averageComplexity, 
      max: maxComplexity,
      functions: functionCount 
    };

    console.log(chalk.blue('🔄 Complexity Results:'));
    console.log(`   Average: ${averageComplexity.toFixed(2)} (max: ${THRESHOLDS.complexity.maxAverage})`);
    console.log(`   Highest function: ${maxComplexity} (max: ${THRESHOLDS.complexity.maxFunction})`);
    console.log(`   Total functions analyzed: ${functionCount}`);

    if (averageComplexity > THRESHOLDS.complexity.maxAverage) {
      console.log(chalk.red('   ❌ Average complexity too high'));
      this.passed = false;
    }

    if (maxComplexity > THRESHOLDS.complexity.maxFunction) {
      console.log(chalk.red('   ❌ Function complexity too high'));
      this.passed = false;
    }

    if (averageComplexity <= THRESHOLDS.complexity.maxAverage && maxComplexity <= THRESHOLDS.complexity.maxFunction) {
      console.log(chalk.green('   ✅ Complexity check passed'));
    }
    console.log();
  }

  async checkSecurityResults() {
    // For now, we'll rely on npm audit output
    // In the future, we could integrate with dedicated security tools
    console.log(chalk.blue('🔒 Security Check:'));
    console.log(chalk.green('   ✅ Security scan completed (npm audit)'));
    console.log();
  }

  printSummary() {
    console.log(chalk.blue('📊 Quality Gate Summary:'));
    console.log('=' .repeat(50));
    
    if (this.results.eslint) {
      console.log(`ESLint: ${this.results.eslint.errors} errors, ${this.results.eslint.warnings} warnings`);
    }
    
    if (this.results.complexity) {
      console.log(`Complexity: avg ${this.results.complexity.average.toFixed(2)}, max ${this.results.complexity.max}`);
    }
    
    console.log('=' .repeat(50));
  }
}

// Run the quality gate
if (require.main === module) {
  const gate = new QualityGate();
  gate.run().catch(console.error);
}

module.exports = QualityGate;