#!/usr/bin/env node

/**
 * Refactoring CLI - Command Line Interface for Code Transformations
 * 
 * Unified interface for all refactoring and modernization tools
 * - Interactive refactoring sessions
 * - Batch transformations
 * - Safe refactoring with validation
 * - Integration with existing tooling
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const RefactoringFramework = require('./refactoring-framework');
const CodeModernizer = require('./code-modernizer');

class RefactoringCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.commands = {
      'analyze': this.analyzeCommand.bind(this),
      'migrate': this.migrateCommand.bind(this),
      'modernize': this.modernizeCommand.bind(this),
      'validate': this.validateCommand.bind(this),
      'plan': this.planCommand.bind(this),
      'interactive': this.interactiveCommand.bind(this),
      'help': this.helpCommand.bind(this),
      'status': this.statusCommand.bind(this)
    };
    
    this.session = {
      analysisResults: null,
      currentPlan: null,
      safeMode: true,
      dryRun: false
    };
  }

  async run(args = []) {
    const command = args[0] || 'help';
    const options = this.parseOptions(args.slice(1));
    
    this.session.dryRun = options.dryRun || false;
    this.session.safeMode = options.safeMode !== false;
    
    try {
      if (this.commands[command]) {
        await this.commands[command](options);
      } else {
        console.log(`❌ Unknown command: ${command}`);
        await this.helpCommand();
      }
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      if (options.verbose) {
        console.error(error.stack);
      }
    } finally {
      this.rl.close();
    }
  }

  async analyzeCommand(options) {
    console.log('🔍 Analyzing codebase for refactoring opportunities...\n');
    
    const framework = new RefactoringFramework();
    const modernizer = new CodeModernizer();
    
    // Run both analyzers
    console.log('📊 Running structural analysis...');
    const structuralAnalysis = await framework.analyzeLegacyCode();
    
    console.log('🚀 Running modernization analysis...');
    const modernizationAnalysis = await modernizer.analyzeCodebase();
    
    // Combine results
    this.session.analysisResults = {
      structural: structuralAnalysis,
      modernization: modernizationAnalysis,
      timestamp: new Date().toISOString(),
      summary: this.createAnalysisSummary(structuralAnalysis, modernizationAnalysis)
    };
    
    // Save detailed analysis
    await fs.writeFile(
      'refactoring-analysis.json',
      JSON.stringify(this.session.analysisResults, null, 2)
    );
    
    console.log('\n📋 Analysis Summary:');
    console.log('===================');
    this.printAnalysisSummary(this.session.analysisResults.summary);
    
    console.log('\n💾 Detailed results saved to refactoring-analysis.json');
    
    if (!options.skipSuggestions) {
      await this.suggestNextSteps();
    }
  }

  async migrateCommand(options) {
    console.log('🔄 Starting JavaScript to TypeScript migration...\n');
    
    if (options.interactive) {
      await this.interactiveMigration();
    } else {
      const framework = new RefactoringFramework();
      
      if (this.session.dryRun) {
        console.log('🔍 DRY RUN MODE - No files will be changed\n');
        // Show what would be migrated
        const analysisResults = await framework.analyzeLegacyCode();
        console.log(`📁 Would migrate ${analysisResults.jsFiles.length} JavaScript files:`);
        analysisResults.jsFiles.forEach(file => {
          console.log(`   • ${path.relative(process.cwd(), file)}`);
        });
      } else {
        await framework.migrateJavaScriptToTypeScript(
          this.session.analysisResults?.structural?.jsFiles || []
        );
      }
    }
  }

  async modernizeCommand(options) {
    console.log('🚀 Starting code modernization...\n');
    
    const modernizer = new CodeModernizer();
    
    if (options.patterns) {
      await this.modernizeSpecificPatterns(options.patterns.split(','));
    } else if (options.interactive) {
      await this.interactiveModernization();
    } else {
      if (this.session.dryRun) {
        console.log('🔍 DRY RUN MODE - Showing modernization opportunities\n');
        await modernizer.analyzeCodebase();
      } else {
        await modernizer.run();
      }
    }
  }

  async validateCommand(options) {
    console.log('✅ Validating refactoring results...\n');
    
    const validations = [
      this.validateTypeScript(),
      this.validateESLint(),
      this.validateTests(),
      this.validateBuild()
    ];
    
    const results = await Promise.allSettled(validations);
    
    console.log('📋 Validation Results:');
    console.log('=====================');
    
    const validationNames = ['TypeScript', 'ESLint', 'Tests', 'Build'];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ ${validationNames[index]}: ${result.value.passed ? 'PASSED' : 'FAILED'}`);
        if (!result.value.passed && result.value.errors) {
          result.value.errors.forEach(error => {
            console.log(`   ❌ ${error}`);
          });
        }
      } else {
        console.log(`❌ ${validationNames[index]}: ERROR - ${result.reason.message}`);
      }
    });
  }

  async planCommand(options) {
    console.log('📋 Creating refactoring plan...\n');
    
    if (!this.session.analysisResults) {
      console.log('⚠️  No analysis results found. Running analysis first...\n');
      await this.analyzeCommand({ skipSuggestions: true });
    }
    
    const plan = this.createRefactoringPlan(this.session.analysisResults);
    this.session.currentPlan = plan;
    
    await fs.writeFile('refactoring-plan.json', JSON.stringify(plan, null, 2));
    
    console.log('🎯 Refactoring Plan Generated:');
    console.log('==============================');
    this.printRefactoringPlan(plan);
    
    console.log('\n💾 Plan saved to refactoring-plan.json');
    
    if (options.execute) {
      await this.executePlan(plan);
    }
  }

  async interactiveCommand(options) {
    console.log('🎮 Interactive Refactoring Mode\n');
    console.log('Available commands:');
    console.log('  analyze    - Analyze codebase');
    console.log('  migrate    - Migrate JS to TS');  
    console.log('  modernize  - Modernize code patterns');
    console.log('  validate   - Validate changes');
    console.log('  plan       - Create refactoring plan');
    console.log('  status     - Show current status');
    console.log('  exit       - Exit interactive mode\n');
    
    while (true) {
      const command = await this.prompt('refactor> ');
      const [cmd, ...args] = command.trim().split(' ');
      
      if (cmd === 'exit') {
        console.log('👋 Goodbye!');
        break;
      }
      
      if (this.commands[cmd]) {
        try {
          await this.commands[cmd](this.parseOptions(args));
        } catch (error) {
          console.log(`❌ ${error.message}`);
        }
      } else {
        console.log(`❌ Unknown command: ${cmd}`);
        console.log('Type "help" for available commands.');
      }
      
      console.log(); // Add spacing
    }
  }

  async helpCommand() {
    console.log(`
🔧 Refactoring CLI - Code Transformation Tool

Usage: node refactoring-cli.js <command> [options]

Commands:
  analyze      Analyze codebase for refactoring opportunities
  migrate      Migrate JavaScript files to TypeScript  
  modernize    Apply modern code patterns and improvements
  validate     Validate refactoring results (types, lint, tests)
  plan         Create and optionally execute refactoring plan
  interactive  Enter interactive refactoring mode
  status       Show current refactoring session status
  help         Show this help message

Options:
  --dry-run         Show what would be changed without making changes
  --safe-mode       Only apply low-risk transformations (default: true)
  --no-safe-mode    Allow risky transformations
  --interactive     Interactive mode for command
  --patterns=...    Comma-separated list of patterns to modernize
  --execute         Execute the plan after creating it
  --skip-suggestions Skip automatic suggestions
  --verbose         Verbose output with stack traces

Examples:
  node refactoring-cli.js analyze
  node refactoring-cli.js migrate --dry-run
  node refactoring-cli.js modernize --patterns="async-await,destructuring"
  node refactoring-cli.js plan --execute
  node refactoring-cli.js interactive
    `);
  }

  async statusCommand(options) {
    console.log('📊 Refactoring Session Status\n');
    
    console.log(`Session Mode: ${this.session.safeMode ? '🔒 Safe' : '⚠️ Unrestricted'}`);
    console.log(`Dry Run: ${this.session.dryRun ? '🔍 Enabled' : '💾 Disabled'}`);
    
    if (this.session.analysisResults) {
      console.log('\n📈 Analysis Results Available:');
      console.log(`   Timestamp: ${this.session.analysisResults.timestamp}`);
      this.printAnalysisSummary(this.session.analysisResults.summary);
    } else {
      console.log('\n❌ No analysis results available');
      console.log('   Run "analyze" command first');
    }
    
    if (this.session.currentPlan) {
      console.log('\n📋 Active Refactoring Plan:');
      console.log(`   Phases: ${this.session.currentPlan.phases.length}`);
      console.log(`   Estimated Days: ${this.session.currentPlan.totalEstimatedDays}`);
    } else {
      console.log('\n❌ No refactoring plan available');
      console.log('   Run "plan" command to create one');
    }
    
    // Show recent activity
    try {
      const recentFiles = await this.getRecentlyModifiedFiles();
      if (recentFiles.length > 0) {
        console.log('\n📝 Recently Modified Files:');
        recentFiles.slice(0, 5).forEach(file => {
          console.log(`   • ${file.path} (${file.timeAgo})`);
        });
      }
    } catch (error) {
      // Ignore errors getting recent files
    }
  }

  // Helper methods
  createAnalysisSummary(structural, modernization) {
    return {
      totalFiles: (structural.jsFiles?.length || 0) + (modernization.fileAnalysis?.size || 0),
      jsFilesToMigrate: structural.jsFiles?.length || 0,
      duplicatesFound: structural.duplicates?.length || 0,
      securityIssues: structural.securityIssues?.length || 0,
      legacyPatterns: modernization.legacyPatterns?.length || 0,
      codeSmells: modernization.codeSmells?.length || 0,
      performanceIssues: modernization.performanceIssues?.length || 0,
      modernizationOpportunities: modernization.modernizationOpportunities?.length || 0
    };
  }

  printAnalysisSummary(summary) {
    console.log(`📁 Total Files Analyzed: ${summary.totalFiles}`);
    console.log(`🔄 JS Files to Migrate: ${summary.jsFilesToMigrate}`);
    console.log(`🔍 Duplicates Found: ${summary.duplicatesFound}`);
    console.log(`🔒 Security Issues: ${summary.securityIssues}`);
    console.log(`⚡ Legacy Patterns: ${summary.legacyPatterns}`);
    console.log(`💨 Code Smells: ${summary.codeSmells}`);
    console.log(`🚀 Performance Issues: ${summary.performanceIssues}`);
    console.log(`✨ Modernization Opportunities: ${summary.modernizationOpportunities}`);
  }

  async suggestNextSteps() {
    console.log('\n💡 Suggested Next Steps:');
    console.log('========================');
    
    if (this.session.analysisResults.summary.securityIssues > 0) {
      console.log('🔒 HIGH PRIORITY: Address security issues first');
    }
    
    if (this.session.analysisResults.summary.jsFilesToMigrate > 0) {
      console.log('🔄 Run migration: node refactoring-cli.js migrate');
    }
    
    if (this.session.analysisResults.summary.performanceIssues > 0) {
      console.log('🚀 Fix performance issues: node refactoring-cli.js modernize');
    }
    
    if (this.session.analysisResults.summary.codeSmells > 0) {
      console.log('💨 Address code quality: node refactoring-cli.js modernize');
    }
    
    console.log('📋 Create execution plan: node refactoring-cli.js plan --execute');
    console.log('✅ Validate results: node refactoring-cli.js validate');
  }

  createRefactoringPlan(analysisResults) {
    const plan = {
      timestamp: new Date().toISOString(),
      phases: [],
      totalEstimatedDays: 0,
      risks: [],
      prerequisites: []
    };

    // Phase 1: Security and Critical Issues
    if (analysisResults.summary.securityIssues > 0) {
      plan.phases.push({
        name: 'Security Fixes',
        priority: 1,
        estimatedDays: 1,
        tasks: [`Fix ${analysisResults.summary.securityIssues} security issues`],
        validation: ['Security scan', 'Manual review']
      });
    }

    // Phase 2: JavaScript to TypeScript Migration
    if (analysisResults.summary.jsFilesToMigrate > 0) {
      plan.phases.push({
        name: 'TypeScript Migration',
        priority: 2,
        estimatedDays: Math.ceil(analysisResults.summary.jsFilesToMigrate / 10),
        tasks: [`Migrate ${analysisResults.summary.jsFilesToMigrate} JS files to TS`],
        validation: ['Type checking', 'Build validation']
      });
    }

    // Phase 3: Performance and Modernization
    if (analysisResults.summary.performanceIssues > 0 || analysisResults.summary.modernizationOpportunities > 0) {
      plan.phases.push({
        name: 'Modernization',
        priority: 3,
        estimatedDays: 3,
        tasks: [
          `Address ${analysisResults.summary.performanceIssues} performance issues`,
          `Apply ${analysisResults.summary.modernizationOpportunities} modernization opportunities`
        ],
        validation: ['Performance tests', 'Code review']
      });
    }

    // Phase 4: Code Quality
    if (analysisResults.summary.codeSmells > 0 || analysisResults.summary.duplicatesFound > 0) {
      plan.phases.push({
        name: 'Code Quality',
        priority: 4,
        estimatedDays: 2,
        tasks: [
          `Fix ${analysisResults.summary.codeSmells} code smells`,
          `Remove ${analysisResults.summary.duplicatesFound} duplicate code blocks`
        ],
        validation: ['Code coverage', 'Lint checks']
      });
    }

    plan.totalEstimatedDays = plan.phases.reduce((sum, phase) => sum + phase.estimatedDays, 0);
    
    return plan;
  }

  printRefactoringPlan(plan) {
    plan.phases.forEach((phase, index) => {
      console.log(`\n📋 Phase ${index + 1}: ${phase.name}`);
      console.log(`   Priority: ${phase.priority}`);
      console.log(`   Estimated: ${phase.estimatedDays} days`);
      console.log('   Tasks:');
      phase.tasks.forEach(task => console.log(`     • ${task}`));
      console.log('   Validation:');
      phase.validation.forEach(validation => console.log(`     ✓ ${validation}`));
    });
    
    console.log(`\n⏱️  Total Estimated Time: ${plan.totalEstimatedDays} days`);
  }

  async executePlan(plan) {
    console.log('\n🚀 Executing Refactoring Plan...\n');
    
    for (const phase of plan.phases) {
      console.log(`📋 Starting Phase: ${phase.name}`);
      
      const proceed = await this.prompt(`Continue with ${phase.name}? (y/n): `);
      if (proceed.toLowerCase() !== 'y') {
        console.log('⏸️  Plan execution paused');
        return;
      }
      
      // Execute phase tasks (simplified)
      if (phase.name.includes('Migration')) {
        await this.migrateCommand({ interactive: false });
      } else if (phase.name.includes('Modernization')) {
        await this.modernizeCommand({ interactive: false });
      }
      
      // Run validation
      console.log('✅ Running validation...');
      await this.validateCommand({});
      
      console.log(`✅ Phase ${phase.name} completed\n`);
    }
    
    console.log('🎉 Refactoring plan execution completed!');
  }

  // Validation methods
  async validateTypeScript() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const result = await execAsync('npx tsc --noEmit');
      return { passed: true };
    } catch (error) {
      return { 
        passed: false, 
        errors: [error.stdout || error.message]
      };
    }
  }

  async validateESLint() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const result = await execAsync('npm run lint');
      return { passed: true };
    } catch (error) {
      return { 
        passed: false, 
        errors: [error.stdout || error.message]
      };
    }
  }

  async validateTests() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const result = await execAsync('npm test -- --passWithNoTests');
      return { passed: true };
    } catch (error) {
      return { 
        passed: false, 
        errors: [error.stdout || error.message]
      };
    }
  }

  async validateBuild() {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const result = await execAsync('npm run build');
      return { passed: true };
    } catch (error) {
      return { 
        passed: false, 
        errors: [error.stdout || error.message]
      };
    }
  }

  async getRecentlyModifiedFiles() {
    // Simplified implementation - in real usage might use git or filesystem
    return [];
  }

  parseOptions(args) {
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.substring(2);
        
        if (key.includes('=')) {
          const [optKey, optValue] = key.split('=');
          options[optKey] = optValue;
        } else {
          options[key] = true;
        }
      }
    }
    
    return options;
  }

  prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// CLI entry point
if (require.main === module) {
  const cli = new RefactoringCLI();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = RefactoringCLI;