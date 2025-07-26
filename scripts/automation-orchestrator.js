#!/usr/bin/env node

/**
 * Comprehensive Automation Orchestrator
 * 
 * Central command center that orchestrates all automation tools
 * and provides intelligent workflows for development teams.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

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

class AutomationOrchestrator {
  constructor() {
    this.workflows = new Map();
    this.runningProcesses = new Map();
    this.config = {
      maxConcurrentProcesses: 3,
      defaultTimeout: 300000, // 5 minutes
      retryAttempts: 2,
      healthCheckInterval: 30000 // 30 seconds
    };
    
    this.setupWorkflows();
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  logHeader(title) {
    const border = '='.repeat(60);
    this.log(`\n${border}`, 'cyan');
    this.log(`🎭 ${title}`, 'bold');
    this.log(border, 'cyan');
  }

  logStep(step, status = 'info') {
    const icons = { info: '📋', success: '✅', warning: '⚠️', error: '❌' };
    const colorMap = { info: 'blue', success: 'green', warning: 'yellow', error: 'red' };
    this.log(`${icons[status]} ${step}`, colorMap[status]);
  }

  setupWorkflows() {
    // Development workflow
    this.workflows.set('dev-setup', {
      name: 'Developer Environment Setup',
      description: 'Complete development environment setup',
      steps: [
        { name: 'setup-environment', script: 'setup-dev-environment.js', timeout: 120000 },
        { name: 'build-test-cache', script: 'smart-test-selector.js', args: ['--build-cache'] },
        { name: 'initial-quality-check', script: 'dev-quality-check.js' }
      ],
      parallel: false
    });

    // Quality assurance workflow
    this.workflows.set('qa-full', {
      name: 'Comprehensive Quality Assurance',
      description: 'Complete quality validation pipeline',
      steps: [
        { name: 'quality-tests', script: 'smart-test-selector.js' },
        { name: 'security-scan', script: 'security-scanner.js' },
        { name: 'dependency-analysis', script: 'intelligent-dependency-manager.js' },
        { name: 'performance-check', script: 'performance-regression-detector.js' },
        { name: 'quality-validation', script: 'dev-quality-check.js' }
      ],
      parallel: true,
      maxParallel: 3
    });

    // Pre-commit workflow
    this.workflows.set('pre-commit', {
      name: 'Pre-commit Quality Gates',
      description: 'Fast quality checks before commit',
      steps: [
        { name: 'smart-tests', script: 'smart-test-selector.js' },
        { name: 'security-critical', script: 'security-scanner.js', args: ['--security-only'] },
        { name: 'quality-quick', script: 'dev-quality-check.js', args: ['--quick-check'] }
      ],
      parallel: true,
      timeout: 60000 // 1 minute for pre-commit
    });

    // Continuous monitoring workflow
    this.workflows.set('monitoring', {
      name: 'Continuous Quality Monitoring',
      description: 'Real-time quality monitoring dashboard',
      steps: [
        { name: 'quality-dashboard', script: 'quality-monitoring-dashboard.js', persistent: true }
      ],
      parallel: false
    });

    // Maintenance workflow
    this.workflows.set('maintenance', {
      name: 'Automated Maintenance',
      description: 'Scheduled maintenance tasks',
      steps: [
        { name: 'dependency-updates', script: 'intelligent-dependency-manager.js', args: ['--auto-update'] },
        { name: 'performance-baseline', script: 'performance-regression-detector.js', args: ['--set-baseline'] },
        { name: 'cache-cleanup', script: 'smart-test-selector.js', args: ['--build-cache'] }
      ],
      parallel: false,
      schedule: 'weekly'
    });

    // CI/CD integration workflow
    this.workflows.set('ci-pipeline', {
      name: 'CI/CD Pipeline',
      description: 'Complete CI/CD quality pipeline',
      steps: [
        { name: 'smart-test-selection', script: 'smart-test-selector.js' },
        { name: 'parallel-quality-checks', workflow: 'qa-full' },
        { name: 'performance-regression', script: 'performance-regression-detector.js' },
        { name: 'final-validation', script: 'dev-quality-check.js' }
      ],
      parallel: false,
      timeout: 600000 // 10 minutes for CI
    });
  }

  async runWorkflow(workflowName, options = {}) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    this.logHeader(`Running Workflow: ${workflow.name}`);
    this.log(workflow.description, 'blue');

    const startTime = Date.now();
    const results = {
      workflow: workflowName,
      startTime: new Date().toISOString(),
      steps: [],
      success: false,
      duration: 0
    };

    try {
      if (workflow.parallel) {
        await this.runParallelSteps(workflow, results, options);
      } else {
        await this.runSequentialSteps(workflow, results, options);
      }

      results.success = results.steps.every(step => step.success);
      results.duration = Date.now() - startTime;

      this.logWorkflowSummary(workflow, results);
      return results;

    } catch (error) {
      results.success = false;
      results.duration = Date.now() - startTime;
      results.error = error.message;

      this.log(`❌ Workflow failed: ${error.message}`, 'red');
      throw error;
    }
  }

  async runSequentialSteps(workflow, results, options) {
    for (const step of workflow.steps) {
      this.logStep(`Running step: ${step.name}`, 'info');
      
      try {
        const stepResult = await this.executeStep(step, workflow, options);
        results.steps.push(stepResult);

        if (!stepResult.success && !options.continueOnError) {
          throw new Error(`Step '${step.name}' failed: ${stepResult.error}`);
        }

      } catch (error) {
        results.steps.push({
          name: step.name,
          success: false,
          error: error.message,
          duration: 0
        });

        if (!options.continueOnError) {
          throw error;
        }
      }
    }
  }

  async runParallelSteps(workflow, results, options) {
    const maxParallel = workflow.maxParallel || this.config.maxConcurrentProcesses;
    const stepPromises = [];

    for (let i = 0; i < workflow.steps.length; i += maxParallel) {
      const batch = workflow.steps.slice(i, i + maxParallel);
      
      const batchPromises = batch.map(async (step) => {
        this.logStep(`Starting parallel step: ${step.name}`, 'info');
        
        try {
          const stepResult = await this.executeStep(step, workflow, options);
          results.steps.push(stepResult);
          return stepResult;
        } catch (error) {
          const failedResult = {
            name: step.name,
            success: false,
            error: error.message,
            duration: 0
          };
          results.steps.push(failedResult);
          return failedResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      // Check if any critical steps failed
      const criticalFailures = batchResults.filter(r => !r.success && !options.continueOnError);
      if (criticalFailures.length > 0) {
        throw new Error(`Critical parallel steps failed: ${criticalFailures.map(f => f.name).join(', ')}`);
      }
    }
  }

  async executeStep(step, workflow, options) {
    const stepStartTime = Date.now();
    const timeout = step.timeout || workflow.timeout || this.config.defaultTimeout;

    try {
      let result;

      if (step.workflow) {
        // Execute nested workflow
        result = await this.runWorkflow(step.workflow, options);
      } else if (step.script) {
        // Execute script
        result = await this.executeScript(step, timeout, options);
      } else {
        throw new Error('Step must specify either script or workflow');
      }

      const duration = Date.now() - stepStartTime;
      
      this.logStep(`✅ Step '${step.name}' completed in ${duration}ms`, 'success');

      return {
        name: step.name,
        success: true,
        duration,
        result
      };

    } catch (error) {
      const duration = Date.now() - stepStartTime;
      
      this.logStep(`❌ Step '${step.name}' failed after ${duration}ms: ${error.message}`, 'error');

      return {
        name: step.name,
        success: false,
        duration,
        error: error.message
      };
    }
  }

  async executeScript(step, timeout, options) {
    const scriptPath = path.join(__dirname, step.script);
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script not found: ${step.script}`);
    }

    const args = step.args || [];
    const command = `node "${scriptPath}" ${args.join(' ')}`;

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const child = spawn('node', [scriptPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout
      });

      this.runningProcesses.set(step.name, child);

      child.stdout.on('data', (data) => {
        output += data.toString();
        if (options.verbose) {
          process.stdout.write(data);
        }
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        if (options.verbose) {
          process.stderr.write(data);
        }
      });

      child.on('close', (code) => {
        this.runningProcesses.delete(step.name);

        if (code === 0) {
          resolve({
            exitCode: code,
            stdout: output,
            stderr: errorOutput
          });
        } else {
          reject(new Error(`Script exited with code ${code}: ${errorOutput || output}`));
        }
      });

      child.on('error', (error) => {
        this.runningProcesses.delete(step.name);
        reject(error);
      });

      // Handle timeout
      setTimeout(() => {
        if (this.runningProcesses.has(step.name)) {
          child.kill('SIGTERM');
          this.runningProcesses.delete(step.name);
          reject(new Error(`Script timed out after ${timeout}ms`));
        }
      }, timeout);
    });
  }

  logWorkflowSummary(workflow, results) {
    this.logHeader(`Workflow Summary: ${workflow.name}`);

    const totalSteps = results.steps.length;
    const successfulSteps = results.steps.filter(s => s.success).length;
    const failedSteps = totalSteps - successfulSteps;

    this.log(`📊 Results:`, 'cyan');
    this.log(`   Total Steps: ${totalSteps}`, 'blue');
    this.log(`   Successful: ${successfulSteps}`, 'green');
    this.log(`   Failed: ${failedSteps}`, failedSteps > 0 ? 'red' : 'green');
    this.log(`   Duration: ${results.duration}ms`, 'blue');
    this.log(`   Overall: ${results.success ? 'SUCCESS' : 'FAILED'}`, results.success ? 'green' : 'red');

    if (failedSteps > 0) {
      this.log('\n❌ Failed Steps:', 'red');
      results.steps.filter(s => !s.success).forEach(step => {
        this.log(`   - ${step.name}: ${step.error}`, 'red');
      });
    }
  }

  async startHealthMonitoring() {
    this.logHeader('Starting Health Monitoring');
    
    const healthCheck = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.log(`Health check failed: ${error.message}`, 'warning');
      }
    }, this.config.healthCheckInterval);

    // Cleanup on exit
    process.on('SIGINT', () => {
      clearInterval(healthCheck);
      this.stopAllProcesses();
      process.exit(0);
    });

    this.log('Health monitoring started', 'green');
  }

  async performHealthCheck() {
    const checks = [
      { name: 'Git Repository', check: () => this.checkGitStatus() },
      { name: 'Node Modules', check: () => this.checkNodeModules() },
      { name: 'Test Cache', check: () => this.checkTestCache() },
      { name: 'Quality Infrastructure', check: () => this.checkQualityInfrastructure() }
    ];

    const results = [];
    
    for (const { name, check } of checks) {
      try {
        const result = await check();
        results.push({ name, status: 'healthy', details: result });
      } catch (error) {
        results.push({ name, status: 'unhealthy', error: error.message });
        this.log(`⚠️  Health issue: ${name} - ${error.message}`, 'warning');
      }
    }

    const healthyCount = results.filter(r => r.status === 'healthy').length;
    const overallHealth = Math.round((healthyCount / results.length) * 100);

    if (overallHealth < 80) {
      this.log(`🚨 System health degraded: ${overallHealth}%`, 'warning');
    }

    return { overallHealth, checks: results };
  }

  checkGitStatus() {
    execSync('git status --porcelain', { stdio: 'pipe' });
    return 'Git repository accessible';
  }

  checkNodeModules() {
    if (!fs.existsSync('node_modules')) {
      throw new Error('node_modules directory not found');
    }
    return 'Dependencies installed';
  }

  checkTestCache() {
    const cacheFile = '.test-selection-cache.json';
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      if (ageHours > 24) {
        return 'Test cache needs refresh (>24h old)';
      }
    }
    return 'Test cache current';
  }

  checkQualityInfrastructure() {
    const requiredFiles = [
      'client/src/utils/securityUtils.ts',
      'client/src/utils/performanceMonitor.ts',
      'client/src/utils/memoryOptimization.ts',
      'scripts/dev-quality-check.js'
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing quality files: ${missingFiles.join(', ')}`);
    }

    return 'Quality infrastructure complete';
  }

  stopAllProcesses() {
    this.log('Stopping all running processes...', 'yellow');
    
    for (const [name, process] of this.runningProcesses.entries()) {
      this.log(`Stopping ${name}...`, 'yellow');
      process.kill('SIGTERM');
    }
    
    this.runningProcesses.clear();
    this.log('All processes stopped', 'green');
  }

  async scheduleWorkflow(workflowName, schedule) {
    this.log(`Scheduling workflow '${workflowName}' with schedule: ${schedule}`, 'blue');
    
    // Simple scheduler implementation
    const scheduleIntervals = {
      'hourly': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000
    };

    const interval = scheduleIntervals[schedule];
    if (!interval) {
      throw new Error(`Invalid schedule: ${schedule}`);
    }

    setInterval(async () => {
      this.log(`Running scheduled workflow: ${workflowName}`, 'cyan');
      try {
        await this.runWorkflow(workflowName, { scheduled: true });
      } catch (error) {
        this.log(`Scheduled workflow failed: ${error.message}`, 'error');
      }
    }, interval);
  }

  listWorkflows() {
    this.logHeader('Available Workflows');
    
    for (const [name, workflow] of this.workflows.entries()) {
      this.log(`\n📋 ${name}`, 'cyan');
      this.log(`   ${workflow.description}`, 'blue');
      this.log(`   Steps: ${workflow.steps.length}`, 'blue');
      this.log(`   Parallel: ${workflow.parallel ? 'Yes' : 'No'}`, 'blue');
      if (workflow.schedule) {
        this.log(`   Schedule: ${workflow.schedule}`, 'blue');
      }
    }
  }

  async generateWorkflowReport() {
    const report = {
      timestamp: new Date().toISOString(),
      workflows: Array.from(this.workflows.entries()).map(([name, workflow]) => ({
        name,
        description: workflow.description,
        steps: workflow.steps.length,
        parallel: workflow.parallel,
        schedule: workflow.schedule
      })),
      runningProcesses: Array.from(this.runningProcesses.keys()),
      systemHealth: await this.performHealthCheck()
    };

    const reportFile = `automation-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`📊 Report generated: ${reportFile}`, 'success');
    return report;
  }
}

// CLI execution
if (require.main === module) {
  const orchestrator = new AutomationOrchestrator();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Comprehensive Automation Orchestrator

Usage: node scripts/automation-orchestrator.js [workflow] [options]

Available Workflows:
  dev-setup        Complete development environment setup
  qa-full          Comprehensive quality assurance pipeline
  pre-commit       Fast pre-commit quality gates
  monitoring       Real-time quality monitoring dashboard
  maintenance      Automated maintenance tasks
  ci-pipeline      Complete CI/CD quality pipeline

Options:
  --help, -h           Show this help message
  --list              List all available workflows
  --health-check      Perform system health check
  --monitor           Start continuous health monitoring
  --report            Generate workflow report
  --verbose           Show detailed output
  --continue-on-error Continue execution even if steps fail

Examples:
  node scripts/automation-orchestrator.js dev-setup
  node scripts/automation-orchestrator.js qa-full --verbose
  node scripts/automation-orchestrator.js --monitor
  node scripts/automation-orchestrator.js --health-check

The orchestrator provides intelligent workflow management with:
- Parallel and sequential execution
- Health monitoring
- Process management
- Scheduled workflows
- Comprehensive reporting
`);
    process.exit(0);
  }

  const workflowName = args[0];
  const options = {
    verbose: args.includes('--verbose'),
    continueOnError: args.includes('--continue-on-error')
  };

  if (args.includes('--list')) {
    orchestrator.listWorkflows();
  } else if (args.includes('--health-check')) {
    orchestrator.performHealthCheck()
      .then(health => {
        console.log('✅ Health check completed');
        console.log(JSON.stringify(health, null, 2));
      })
      .catch(error => {
        console.error('❌ Health check failed:', error);
        process.exit(1);
      });
  } else if (args.includes('--monitor')) {
    orchestrator.startHealthMonitoring()
      .then(() => {
        console.log('🔄 Health monitoring active - Press Ctrl+C to stop');
      });
  } else if (args.includes('--report')) {
    orchestrator.generateWorkflowReport()
      .then(() => {
        console.log('✅ Report generated');
      });
  } else if (workflowName) {
    orchestrator.runWorkflow(workflowName, options)
      .then(results => {
        console.log('✅ Workflow completed successfully');
        if (results.success) {
          process.exit(0);
        } else {
          process.exit(1);
        }
      })
      .catch(error => {
        console.error('❌ Workflow failed:', error.message);
        process.exit(1);
      });
  } else {
    console.log('❌ Please specify a workflow or option. Use --help for usage information.');
    process.exit(1);
  }
}

module.exports = { AutomationOrchestrator };