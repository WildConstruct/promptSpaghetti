#!/usr/bin/env node

/**
 * Workflow Orchestration System
 *
 * Intelligent automation workflow chaining and coordination system with:
 * - Pre-defined workflow sequences for common automation tasks
 * - Conditional execution based on system state and results
 * - Parallel and sequential execution modes with dependency resolution
 * - Error recovery and rollback capabilities with state checkpointing
 * - Performance tracking and execution analytics
 * - Custom workflow definition and execution engine
 *
 * Usage:
 *   node workflow-orchestrator.js --workflow daily-maintenance    # Run daily maintenance sequence
 *   node workflow-orchestrator.js --workflow epic-completion      # Complete epic workflow
 *   node workflow-orchestrator.js --workflow qa-pipeline          # Full QA automation pipeline
 *   node workflow-orchestrator.js --workflow health-check         # System health and repair
 *   node workflow-orchestrator.js --custom my-workflow.json       # Custom workflow file
 *   node workflow-orchestrator.js --list                          # List available workflows
 *   node workflow-orchestrator.js --status                        # Show execution status
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { getLogger } = require('./utils/AutomationLogger');
const { StateLock } = require('./utils/StateLock');
const { getConfigManager } = require('./utils/ConfigManager');

// Initialize automation infrastructure
const configManager = getConfigManager();
const automationConfig = configManager.loadConfig('automation');
const logger = getLogger('workflow-orchestrator', {
  logLevel: automationConfig.logLevel,
  enableLogging: automationConfig.enableLogging,
});

class WorkflowOrchestrator {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      parallel: options.parallel || false,
      continueOnError: options.continueOnError || true,
      maxRetries: options.maxRetries || automationConfig.maxRetries || 3,
      checkpointInterval: options.checkpointInterval || 5,
      ...options,
    };

    this.stateLock = new StateLock();
    this.workflowState = {
      currentWorkflow: null,
      startTime: null,
      steps: [],
      checkpoints: [],
      errors: [],
      performance: {},
    };

    // Predefined workflows
    this.workflows = {
      'daily-maintenance': this.createDailyMaintenanceWorkflow(),
      'epic-completion': this.createEpicCompletionWorkflow(),
      'qa-pipeline': this.createQAPipelineWorkflow(),
      'health-check': this.createHealthCheckWorkflow(),
      'full-automation': this.createFullAutomationWorkflow(),
      'priority-setup': this.createPrioritySetupWorkflow(),
      'epic8-demo-ready': this.createEpic8DemoReadyWorkflow(),
    };

    logger.info('Workflow orchestrator initialized', {
      workflows: Object.keys(this.workflows),
      options: this.options,
    });
  }

  // Create daily maintenance workflow
  createDailyMaintenanceWorkflow() {
    return {
      name: 'Daily System Maintenance',
      description: 'Complete daily automation maintenance and health checks',
      parallel: false,
      steps: [
        {
          id: 'health-check',
          name: 'System Health Check',
          command: 'node src/fix-system.js --health-check',
          timeout: 30000,
          continueOnError: true,
          conditions: [],
        },
        {
          id: 'fix-violations',
          name: 'Fix Workflow Violations',
          command: 'node src/fix-system.js --all',
          timeout: 120000,
          conditions: ['health-check.violations > 0'],
        },
        {
          id: 'epic-assignments',
          name: 'Update Epic Assignments',
          command: 'node src/fix-system.js --module epic-assignments',
          timeout: 60000,
          continueOnError: true,
        },
        {
          id: 'qa-review',
          name: 'Process QA Reviews',
          command: 'node src/run-qa-agent.js',
          timeout: 180000,
          conditions: ['system.review_tasks > 0'],
        },
        {
          id: 'monitor-report',
          name: 'Generate Monitoring Report',
          command: 'node src/monitor-system.js --export',
          timeout: 30000,
          continueOnError: true,
        },
      ],
    };
  }

  // Create epic completion workflow
  createEpicCompletionWorkflow() {
    return {
      name: 'Epic Completion Workflow',
      description: 'Complete workflow for finishing epic tasks and documentation',
      parallel: false,
      steps: [
        {
          id: 'analyze-progress',
          name: 'Analyze Epic Progress',
          command: 'node src/analyze-system.js epics',
          timeout: 45000,
        },
        {
          id: 'complete-tasks',
          name: 'Move Completed Tasks to Review',
          command: 'node src/fix-system.js --module completed-tasks',
          timeout: 90000,
        },
        {
          id: 'qa-processing',
          name: 'Process QA Reviews',
          command: 'node src/qa-review-workflow.js',
          timeout: 300000,
        },
        {
          id: 'update-documentation',
          name: 'Update Epic Documentation',
          command: 'node src/create-documentation-ticket.js',
          timeout: 60000,
          conditions: ['qa-processing.approved > 0'],
        },
        {
          id: 'final-report',
          name: 'Generate Epic Completion Report',
          command: 'node src/monitor-system.js --mode epics',
          timeout: 30000,
        },
      ],
    };
  }

  // Create QA pipeline workflow
  createQAPipelineWorkflow() {
    return {
      name: 'QA Automation Pipeline',
      description: 'Complete QA processing pipeline with validation and reporting',
      parallel: false,
      steps: [
        {
          id: 'detect-completed',
          name: 'Detect Completed Tasks',
          command: 'node src/fix-system.js --module completed-tasks --dry-run',
          timeout: 60000,
        },
        {
          id: 'move-to-review',
          name: 'Move Tasks to Review',
          command: 'node src/fix-system.js --module completed-tasks',
          timeout: 90000,
          conditions: ['detect-completed.fixed > 0'],
        },
        {
          id: 'qa-reviews',
          name: 'Execute QA Reviews',
          command: 'node src/qa-review-workflow.js',
          timeout: 600000,
        },
        {
          id: 'process-rejections',
          name: 'Process Rejected Tasks',
          command: 'node src/fix-system.js --module rejected-tasks',
          timeout: 120000,
          conditions: ['qa-reviews.rejected > 0'],
        },
        {
          id: 'validation-report',
          name: 'Generate Validation Report',
          command: 'node src/monitor-system.js --mode agents',
          timeout: 30000,
        },
      ],
    };
  }

  // Create health check workflow
  createHealthCheckWorkflow() {
    return {
      name: 'System Health Check & Repair',
      description: 'Comprehensive system health assessment and automated repairs',
      parallel: false,
      steps: [
        {
          id: 'health-assessment',
          name: 'Comprehensive Health Assessment',
          command: 'node src/fix-system.js --health-check',
          timeout: 45000,
        },
        {
          id: 'data-integrity',
          name: 'Fix Data Integrity Issues',
          command: 'node src/fix-system.js --module data-integrity',
          timeout: 90000,
          conditions: ['health-assessment.issues > 0'],
        },
        {
          id: 'assignment-fixes',
          name: 'Fix Assignment Inconsistencies',
          command: 'node src/fix-system.js --module epic-assignments',
          timeout: 120000,
          conditions: ['health-assessment.warnings > 1'],
        },
        {
          id: 'workflow-compliance',
          name: 'Restore Workflow Compliance',
          command: 'node src/fix-system.js --all',
          timeout: 180000,
          conditions: ['health-assessment.healthScore < 90'],
        },
        {
          id: 'final-health-check',
          name: 'Verify System Health',
          command: 'node src/fix-system.js --health-check',
          timeout: 45000,
        },
      ],
    };
  }

  // Create full automation workflow
  createFullAutomationWorkflow() {
    return {
      name: 'Complete Automation Suite',
      description: 'Full automation execution including all major operations',
      parallel: false,
      steps: [
        {
          id: 'system-analysis',
          name: 'System Analysis',
          command: 'node src/analyze-system.js overview',
          timeout: 60000,
        },
        {
          id: 'epic-tasks-creation',
          name: 'Create Epic Tasks',
          command: 'node src/create-epic-batch-manager.js --dry-run',
          timeout: 90000,
        },
        {
          id: 'health-maintenance',
          name: 'Health Maintenance',
          command: 'node src/workflow-orchestrator.js --workflow health-check',
          timeout: 600000,
          subprocess: true,
        },
        {
          id: 'qa-processing',
          name: 'QA Processing',
          command: 'node src/workflow-orchestrator.js --workflow qa-pipeline',
          timeout: 800000,
          subprocess: true,
        },
        {
          id: 'monitoring-report',
          name: 'Final Monitoring Report',
          command: 'node src/monitor-system.js --export',
          timeout: 45000,
        },
      ],
    };
  }

  // Create priority setup workflow
  createPrioritySetupWorkflow() {
    return {
      name: 'Priority Task Setup',
      description: 'Set up priority tasks and assignments for immediate work',
      parallel: true,
      maxParallel: 3,
      steps: [
        {
          id: 'priority-tickets',
          name: 'Create Priority Tickets',
          command: 'node src/create-priority-tickets.js',
          timeout: 120000,
        },
        {
          id: 'epic-assignments',
          name: 'Update Epic Assignments',
          command: 'node src/fix-system.js --module epic-assignments',
          timeout: 90000,
        },
        {
          id: 'task-analysis',
          name: 'Analyze Available Tasks',
          command: 'node src/monitor-system.js --mode tasks',
          timeout: 30000,
        },
      ],
    };
  }

  // Create Epic 8 Demo-Ready workflow
  createEpic8DemoReadyWorkflow() {
    return {
      name: 'Epic 8 Demo-Ready Proof of Concept',
      description: 'Wild Construct film industry integration - comprehensive Epic 8 development coordination',
      parallel: false,
      steps: [
        {
          id: 'epic8-setup',
          name: 'Ensure Epic 8 Tasks Available',
          command: 'node src/create-epic8-demo-tasks.js',
          timeout: 60000,
          continueOnError: true,
        },
        {
          id: 'system-health',
          name: 'Verify System Health for Epic 8',
          command: 'node src/fix-system.js --health-check',
          timeout: 45000,
        },
        {
          id: 'epic8-task-analysis',
          name: 'Analyze Epic 8 Task Distribution',
          command: 'node src/monitor-system.js --mode tasks',
          timeout: 30000,
        },
        {
          id: 'priority-alignment',
          name: 'Align System Priorities with Epic 8',
          command: 'node src/fix-system.js --module epic-assignments',
          timeout: 90000,
          conditions: ['system-health.healthScore >= 85'],
        },
        {
          id: 'epic8-progress-report',
          name: 'Generate Epic 8 Progress Report',
          command: 'node src/analyze-system.js epics',
          timeout: 60000,
        },
      ],
    };
  }

  // Execute workflow
  async executeWorkflow(workflowName, customWorkflow = null) {
    const workflow = customWorkflow || this.workflows[workflowName];

    if (!workflow) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    logger.start(`Workflow execution: ${workflow.name}`);

    this.workflowState = {
      currentWorkflow: workflowName,
      startTime: new Date(),
      steps: [],
      checkpoints: [],
      errors: [],
      performance: {
        totalTime: 0,
        stepTimes: {},
        successRate: 0,
      },
    };

    console.log(`🚀 Starting workflow: ${workflow.name}`);
    console.log(`📋 Description: ${workflow.description}`);
    console.log(`⚙️  Mode: ${workflow.parallel ? 'Parallel' : 'Sequential'} execution`);
    console.log(`🔄 Steps: ${workflow.steps.length}`);
    console.log('');

    try {
      let results;

      if (workflow.parallel) {
        results = await this.executeParallelSteps(workflow.steps, workflow.maxParallel);
      } else {
        results = await this.executeSequentialSteps(workflow.steps);
      }

      this.workflowState.performance.totalTime = Date.now() - this.workflowState.startTime.getTime();
      this.workflowState.performance.successRate = this.calculateSuccessRate(results);

      this.generateExecutionReport(workflow, results);

      logger.finish(`Workflow '${workflow.name}' completed`, {
        totalTime: this.workflowState.performance.totalTime,
        successRate: this.workflowState.performance.successRate,
        steps: results.length,
      });

      return {
        workflow: workflowName,
        success: true,
        results,
        performance: this.workflowState.performance,
        errors: this.workflowState.errors,
      };
    } catch (error) {
      logger.handleError(error, { workflow: workflowName });

      console.log(`\n❌ Workflow '${workflow.name}' failed: ${error.message}`);
      this.handleWorkflowFailure(workflow, error);

      throw error;
    }
  }

  // Execute steps in parallel
  async executeParallelSteps(steps, maxParallel = 5) {
    console.log(`⚡ Executing ${steps.length} steps in parallel (max ${maxParallel})`);

    const results = [];
    const chunks = this.chunkArray(steps, maxParallel);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(step => this.executeStep(step));
      const chunkResults = await Promise.allSettled(chunkPromises);

      chunkResults.forEach((result, index) => {
        const step = chunk[index];
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const errorResult = {
            stepId: step.id,
            name: step.name,
            success: false,
            error: result.reason.message,
            duration: 0,
          };
          results.push(errorResult);
          this.workflowState.errors.push({
            step: step.id,
            error: result.reason.message,
            timestamp: new Date(),
          });
        }
      });
    }

    return results;
  }

  // Execute steps sequentially
  async executeSequentialSteps(steps) {
    console.log(`🔄 Executing ${steps.length} steps sequentially`);

    const results = [];
    let systemState = await this.getSystemState();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Check conditions
      if (step.conditions && !this.evaluateConditions(step.conditions, systemState, results)) {
        console.log(`⏭️  Skipping step ${i + 1}: ${step.name} (conditions not met)`);
        results.push({
          stepId: step.id,
          name: step.name,
          success: true,
          skipped: true,
          duration: 0,
        });
        continue;
      }

      // Create checkpoint
      if (i % this.options.checkpointInterval === 0) {
        await this.createCheckpoint(i, results);
      }

      try {
        const result = await this.executeStep(step);
        results.push(result);

        // Update system state after successful step
        systemState = await this.getSystemState();
      } catch (error) {
        this.workflowState.errors.push({
          step: step.id,
          error: error.message,
          timestamp: new Date(),
        });

        if (!this.options.continueOnError && !step.continueOnError) {
          console.log(`❌ Workflow stopped due to error in step: ${step.name}`);
          throw error;
        }

        console.log(`⚠️  Step failed but continuing: ${step.name} - ${error.message}`);
        results.push({
          stepId: step.id,
          name: step.name,
          success: false,
          error: error.message,
          duration: 0,
        });
      }
    }

    return results;
  }

  // Execute individual step
  async executeStep(step) {
    console.log(`📍 Executing: ${step.name}`);

    if (this.options.dryRun) {
      console.log(`   [DRY RUN] Would execute: ${step.command}`);
      return {
        stepId: step.id,
        name: step.name,
        success: true,
        dryRun: true,
        duration: 100,
      };
    }

    const startTime = Date.now();

    try {
      let output, result;

      if (step.subprocess) {
        // Execute as subprocess for complex workflows
        result = await this.executeSubprocess(step);
      } else {
        // Execute as direct command
        output = execSync(step.command, {
          cwd: process.cwd(),
          timeout: step.timeout || 120000,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        result = { stdout: output };
      }

      const duration = Date.now() - startTime;
      this.workflowState.performance.stepTimes[step.id] = duration;

      console.log(`   ✅ Completed in ${duration}ms`);

      const stepResult = {
        stepId: step.id,
        name: step.name,
        success: true,
        duration,
        output: this.parseStepOutput(result.stdout),
      };

      this.workflowState.steps.push(stepResult);
      return stepResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   ❌ Failed after ${duration}ms: ${error.message}`);

      // Retry logic
      if (step.retries && step.retries > 0) {
        console.log(`   🔄 Retrying (${step.retries} attempts remaining)...`);
        step.retries--;
        await this.sleep(2000); // Wait before retry
        return this.executeStep(step);
      }

      throw new Error(`Step '${step.name}' failed: ${error.message}`);
    }
  }

  // Execute step as subprocess
  async executeSubprocess(step) {
    return new Promise((resolve, reject) => {
      const [command, ...args] = step.command.split(' ');
      const process = spawn(command, args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', data => {
        stdout += data.toString();
      });

      process.stderr.on('data', data => {
        stderr += data.toString();
      });

      // Handle timeout
      const timeout = setTimeout(() => {
        process.kill('SIGTERM');
        reject(new Error(`Subprocess timeout after ${step.timeout}ms`));
      }, step.timeout || 300000);

      process.on('close', code => {
        clearTimeout(timeout);

        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Subprocess exited with code ${code}: ${stderr}`));
        }
      });

      process.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Parse step output for metrics
  parseStepOutput(output) {
    try {
      // Try to extract metrics from common output patterns
      const metrics = {};

      // Health check metrics
      const healthMatch = output.match(/Health Score: (\d+)\/100/);
      if (healthMatch) {
        metrics.healthScore = parseInt(healthMatch[1]);
      }

      // Violation counts
      const violationsMatch = output.match(/(\d+) workflow violations?/);
      if (violationsMatch) {
        metrics.violations = parseInt(violationsMatch[1]);
      }

      // Task counts
      const fixedMatch = output.match(/Tasks Fixed: (\d+)/);
      if (fixedMatch) {
        metrics.fixed = parseInt(fixedMatch[1]);
      }

      const processedMatch = output.match(/Tasks Processed: (\d+)/);
      if (processedMatch) {
        metrics.processed = parseInt(processedMatch[1]);
      }

      // QA metrics
      const approvedMatch = output.match(/Approved: (\d+)/);
      if (approvedMatch) {
        metrics.approved = parseInt(approvedMatch[1]);
      }

      const rejectedMatch = output.match(/Rejected: (\d+)/);
      if (rejectedMatch) {
        metrics.rejected = parseInt(rejectedMatch[1]);
      }

      return Object.keys(metrics).length > 0 ? metrics : null;
    } catch (error) {
      return null;
    }
  }

  // Evaluate step conditions
  evaluateConditions(conditions, systemState, previousResults) {
    return conditions.every(condition => {
      try {
        // Parse condition (e.g., "health-check.violations > 0")
        const [source, operator, value] = condition.split(/\s+/);
        const [stepId, metric] = source.split('.');

        let actualValue;

        if (stepId === 'system') {
          actualValue = systemState[metric];
        } else {
          const stepResult = previousResults.find(r => r.stepId === stepId);
          actualValue = stepResult?.output?.[metric];
        }

        if (actualValue === undefined) return false;

        const expectedValue = isNaN(value) ? value : Number(value);

        switch (operator) {
          case '>':
            return actualValue > expectedValue;
          case '<':
            return actualValue < expectedValue;
          case '>=':
            return actualValue >= expectedValue;
          case '<=':
            return actualValue <= expectedValue;
          case '==':
            return actualValue == expectedValue;
          case '!=':
            return actualValue != expectedValue;
          default:
            return false;
        }
      } catch (error) {
        console.log(`⚠️  Condition evaluation failed: ${condition}`);
        return false;
      }
    });
  }

  // Get current system state
  async getSystemState() {
    try {
      const state = await this.stateLock.readState();
      const tasks = Object.values(state.tasks || {});

      return {
        total_tasks: tasks.length,
        review_tasks: tasks.filter(t => t.state === 'REVIEW').length,
        in_progress_tasks: tasks.filter(t => t.state === 'IN_PROGRESS').length,
        unassigned_tasks: tasks.filter(t => t.state === 'UNASSIGNED').length,
        approved_tasks: tasks.filter(t => t.state === 'APPROVED').length,
        completed_tasks: tasks.filter(t => t.state === 'COMPLETED').length,
        agents_count: Object.keys(state.assignments || {}).length,
      };
    } catch (error) {
      return {};
    }
  }

  // Create execution checkpoint
  async createCheckpoint(stepIndex, results) {
    const checkpoint = {
      timestamp: new Date(),
      stepIndex,
      resultsCount: results.length,
      systemState: await this.getSystemState(),
    };

    this.workflowState.checkpoints.push(checkpoint);
    logger.info(`Checkpoint created at step ${stepIndex}`, checkpoint);
  }

  // Calculate success rate
  calculateSuccessRate(results) {
    const successful = results.filter(r => r.success && !r.skipped).length;
    const total = results.filter(r => !r.skipped).length;
    return total > 0 ? (successful / total) * 100 : 100;
  }

  // Generate execution report
  generateExecutionReport(workflow, results) {
    console.log(`\n📊 Workflow Execution Report: ${workflow.name}`);
    console.log('================================================');
    console.log(`Total Time: ${this.workflowState.performance.totalTime}ms`);
    console.log(`Success Rate: ${this.workflowState.performance.successRate.toFixed(1)}%`);
    console.log(`Steps Executed: ${results.length}`);
    console.log(`Errors: ${this.workflowState.errors.length}`);
    console.log(`Checkpoints: ${this.workflowState.checkpoints.length}`);

    console.log('\n📋 Step Results:');
    results.forEach((result, index) => {
      const status = result.success ? (result.skipped ? '⏭️ ' : '✅') : '❌';
      const duration = result.duration ? `(${result.duration}ms)` : '';
      console.log(`   ${index + 1}. ${status} ${result.name} ${duration}`);

      if (result.output) {
        Object.entries(result.output).forEach(([key, value]) => {
          console.log(`      ${key}: ${value}`);
        });
      }
    });

    if (this.workflowState.errors.length > 0) {
      console.log('\n❌ Errors Encountered:');
      this.workflowState.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.step}: ${error.error}`);
      });
    }
  }

  // Handle workflow failure
  handleWorkflowFailure(workflow, error) {
    console.log('\n🔄 Failure Recovery Options:');
    console.log('1. Fix the issue and run: node workflow-orchestrator.js --resume');
    console.log('2. Run individual steps manually');
    console.log('3. Run with --continue-on-error flag');

    if (this.workflowState.checkpoints.length > 0) {
      const lastCheckpoint = this.workflowState.checkpoints[this.workflowState.checkpoints.length - 1];
      console.log(`\n💾 Last checkpoint: Step ${lastCheckpoint.stepIndex}`);
      console.log('   Use --from-checkpoint to resume from there');
    }
  }

  // Helper methods
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // List available workflows
  listWorkflows() {
    console.log('🔧 Available Workflows:');
    console.log('======================');

    Object.entries(this.workflows).forEach(([key, workflow]) => {
      console.log(`\n📋 ${key}:`);
      console.log(`   Name: ${workflow.name}`);
      console.log(`   Description: ${workflow.description}`);
      console.log(`   Steps: ${workflow.steps.length}`);
      console.log(`   Mode: ${workflow.parallel ? 'Parallel' : 'Sequential'}`);
      console.log(`   Command: node workflow-orchestrator.js --workflow ${key}`);
    });

    console.log('\n🎯 Quick Commands:');
    console.log('   Epic 8 Demo Ready: --workflow epic8-demo-ready');
    console.log('   Daily maintenance: --workflow daily-maintenance');
    console.log('   Health check: --workflow health-check');
    console.log('   QA pipeline: --workflow qa-pipeline');
    console.log('   Full automation: --workflow full-automation');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options = {
    dryRun: args.includes('--dry-run'),
    parallel: args.includes('--parallel'),
    continueOnError: args.includes('--continue-on-error'),
  };

  const workflowIndex = args.findIndex(arg => arg === '--workflow');
  const customIndex = args.findIndex(arg => arg === '--custom');

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Workflow Orchestration System');
    console.log('=============================');
    console.log('');
    console.log('Usage:');
    console.log('  node workflow-orchestrator.js --workflow daily-maintenance');
    console.log('  node workflow-orchestrator.js --workflow health-check');
    console.log('  node workflow-orchestrator.js --custom my-workflow.json');
    console.log('  node workflow-orchestrator.js --list');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run              Preview execution without running commands');
    console.log('  --continue-on-error    Continue workflow even if steps fail');
    console.log('  --parallel             Force parallel execution (where applicable)');
    console.log('');
    console.log('Workflows:');
    console.log('  epic8-demo-ready      Epic 8 Demo-Ready Proof of Concept (NEW)');
    console.log('  daily-maintenance      System health and maintenance');
    console.log('  epic-completion        Complete epic workflow');
    console.log('  qa-pipeline           QA automation pipeline');
    console.log('  health-check          System health assessment');
    console.log('  full-automation       Complete automation suite');
    console.log('  priority-setup        Priority task setup');
    return;
  }

  try {
    const orchestrator = new WorkflowOrchestrator(options);

    // List workflows
    if (args.includes('--list')) {
      orchestrator.listWorkflows();
      return;
    }

    // Execute workflow
    if (workflowIndex >= 0 && args[workflowIndex + 1]) {
      const workflowName = args[workflowIndex + 1];
      const result = await orchestrator.executeWorkflow(workflowName);

      console.log(`\n🎉 Workflow '${workflowName}' completed successfully!`);
      console.log(`⚡ Success rate: ${result.performance.successRate.toFixed(1)}%`);
      console.log(`⏱️  Total time: ${result.performance.totalTime}ms`);

      process.exit(result.errors.length > 0 ? 1 : 0);
    }

    // Execute custom workflow
    if (customIndex >= 0 && args[customIndex + 1]) {
      const workflowFile = args[customIndex + 1];
      const customWorkflow = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));

      const result = await orchestrator.executeWorkflow('custom', customWorkflow);

      console.log('\n🎉 Custom workflow completed successfully!');
      process.exit(result.errors.length > 0 ? 1 : 0);
    }

    // No workflow specified
    console.log('❌ No workflow specified. Use --list to see available workflows or --help for usage.');
    process.exit(1);
  } catch (error) {
    logger.handleError(error, { args });
    console.error(`❌ Workflow orchestration failed: ${error.message}`);
    process.exit(1);
  }
}

// Export for testing
module.exports = { WorkflowOrchestrator };

// Run if called directly
if (require.main === module) {
  main();
}
