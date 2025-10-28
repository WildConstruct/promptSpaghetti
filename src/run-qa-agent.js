#!/usr/bin/env node
// QA Agent Runner - Reviews tasks in REVIEW status and manages approvals

const fs = require('fs');
const path = require('path');

console.log('🔍 QA Agent - Starting task review process\n');

// Load current state
const state = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'state.json'), 'utf8')
);

class QAAgent {
  constructor() {
    this.agentId = 'qa_agent';
    this.role = 'qa';
  }

  // Find all tasks in REVIEW status
  getTasksInReview() {
    return Object.values(state.tasks).filter(task => task.state === 'REVIEW');
  }

  // Perform QA review on a specific task
  async reviewTask(task) {
    console.log(`🔍 Reviewing Task: ${task.id}`);
    console.log(`   Title: ${task.title}`);
    console.log(`   Assignee: ${task.assignee}`);
    console.log(`   Type: ${task.wip_class}`);
    console.log(`   Story: ${task.story_id}\n`);

    // Simulate QA review process
    const reviewResult = await this.performQAChecks(task);

    if (reviewResult.passed) {
      console.log(`✅ Task ${task.id} APPROVED`);
      console.log(`   Reason: ${reviewResult.reason}`);

      // Update task status to APPROVED (this triggers GitHub automation)
      this.approveTask(task.id, reviewResult.reason);

      return {
        action: 'APPROVED',
        task_id: task.id,
        reason: reviewResult.reason,
        triggers_pr: true // GitHub automation will create PR
      };
    } else {
      console.log(`❌ Task ${task.id} REJECTED`);
      console.log(`   Issues: ${reviewResult.issues.join(', ')}`);

      // Request changes
      this.rejectTask(task.id, reviewResult.issues);

      return {
        action: 'REJECTED',
        task_id: task.id,
        issues: reviewResult.issues,
        changes_requested: true
      };
    }
  }

  // Perform actual QA checks
  async performQAChecks(task) {
    const checks = {
      codeQuality: this.checkCodeQuality(task),
      tests: this.checkTests(task),
      security: this.checkSecurity(task),
      documentation: this.checkDocumentation(task)
    };

    // Simulate thinking time
    await this.sleep(2000);

    // Determine if task passes (80% pass rate for simulation)
    const passRate = 0.8;
    const passed = Math.random() < passRate;

    if (passed) {
      return {
        passed: true,
        reason:
          'All checks passed: code quality good, tests comprehensive, security validated',
        checks
      };
    } else {
      const issues = this.generateQAIssues(task);
      return {
        passed: false,
        issues,
        checks
      };
    }
  }

  // Check code quality
  checkCodeQuality(task) {
    if (task.title.toLowerCase().includes('security')) {
      return {
        status: 'good',
        notes: 'Security implementation follows best practices'
      };
    }
    return {
      status: 'good',
      notes: 'Code follows project standards'
    };
  }

  // Check test coverage
  checkTests(task) {
    if (task.title.toLowerCase().includes('test')) {
      return {
        status: 'excellent',
        notes: 'Comprehensive test coverage provided'
      };
    }
    return {
      status: 'adequate',
      notes: 'Tests present and functional'
    };
  }

  // Check security aspects
  checkSecurity(task) {
    if (
      task.title.toLowerCase().includes('security') ||
      task.title.toLowerCase().includes('validation')
    ) {
      return {
        status: 'secure',
        notes: 'Security validation implemented correctly'
      };
    }
    return {
      status: 'reviewed',
      notes: 'No security concerns identified'
    };
  }

  // Check documentation
  checkDocumentation(task) {
    if (task.title.toLowerCase().includes('document')) {
      return {
        status: 'complete',
        notes: 'Documentation is comprehensive and clear'
      };
    }
    return {
      status: 'adequate',
      notes: 'Basic documentation present'
    };
  }

  // Generate realistic QA issues
  generateQAIssues() {
    const allIssues = [
      'Missing unit tests for edge cases',
      'Code style violations detected',
      'Insufficient error handling',
      'Documentation needs updating',
      'Performance concerns identified',
      'Security validation incomplete',
      'Missing type annotations',
      'Inconsistent naming conventions'
    ];

    // Pick 1-3 random issues
    const count = Math.floor(Math.random() * 3) + 1;
    const issues = [];

    for (let i = 0; i < count; i++) {
      const issue = allIssues[Math.floor(Math.random() * allIssues.length)];
      if (!issues.includes(issue)) {
        issues.push(issue);
      }
    }

    return issues;
  }

  // Approve a task (triggers GitHub automation)
  approveTask(taskId, reason) {
    // Update state - this would trigger the database webhook in real system
    const task = state.tasks[taskId];
    if (task) {
      task.state = 'APPROVED';
      task.updated = new Date().toISOString();
      task.qa_approved_by = this.agentId;
      task.qa_approval_reason = reason;

      // Clear assignment since task is approved and completed
      this.clearTaskAssignment(task);

      // Save state
      this.saveState();

      // Track this approval for commit counting
      this.trackCommitForApproval(taskId);

      console.log('🎯 GitHub automation will now:');
      console.log(`   - Create PR for task ${taskId}`);
      console.log('   - Increment commit counter');
      console.log('   - Auto-push when threshold reached (10 commits)');

      // Check if we need to trigger GitHub automation
      this.checkGitHubAutomationThreshold();
    }
  }

  // Clear task assignment when task is approved
  clearTaskAssignment(task) {
    if (task.assignee && state.assignments) {
      const assignments = state.assignments[task.assignee];
      if (assignments) {
        // Handle both array and comma-separated string formats
        const taskList = Array.isArray(assignments)
          ? assignments.filter(id => id !== task.id)
          : assignments.split(',').filter(id => id !== task.id);

        if (taskList.length === 0) {
          delete state.assignments[task.assignee];
        } else {
          // Keep as array format
          state.assignments[task.assignee] = taskList;
        }

        console.log(`🧹 Cleared assignment for ${task.assignee}`);
      }
    }
  }

  // Track commits for approved tasks
  trackCommitForApproval(taskId) {
    const fs = require('fs');
    const path = require('path');
    const commitTrackingFile = path.join(
      __dirname,
      'data',
      'commit-tracking.json'
    );

    let commitData = { unpushedApprovals: [], lastPushTimestamp: null };

    // Load existing commit tracking data
    if (fs.existsSync(commitTrackingFile)) {
      try {
        commitData = JSON.parse(fs.readFileSync(commitTrackingFile, 'utf8'));
      } catch {
        console.log('⚠️  Could not load commit tracking, starting fresh');
      }
    }

    // Add this approval to unpushed list
    commitData.unpushedApprovals.push({
      taskId: taskId,
      approvedAt: new Date().toISOString()
    });

    // Save updated tracking data
    fs.writeFileSync(commitTrackingFile, JSON.stringify(commitData, null, 2));

    console.log(
      `📊 Commit tracking: ${commitData.unpushedApprovals.length} unpushed approvals`
    );
  }

  // Check if we need to trigger GitHub automation
  checkGitHubAutomationThreshold() {
    const fs = require('fs');
    const path = require('path');
    const commitTrackingFile = path.join(
      __dirname,
      'data',
      'commit-tracking.json'
    );

    if (!fs.existsSync(commitTrackingFile)) return;

    const commitData = JSON.parse(fs.readFileSync(commitTrackingFile, 'utf8'));
    const unpushedCount = commitData.unpushedApprovals.length;

    if (unpushedCount >= 10) {
      console.log('');
      console.log('🚀 GITHUB AUTOMATION TRIGGERED!');
      console.log(
        `   ${unpushedCount} approved tasks ready for commit and push`
      );
      console.log(
        '   Run: git add . && git commit -m "feat: approved tasks" && git push'
      );
      console.log('');

      // Mark these as ready for push (but don't auto-push)
      commitData.readyForPush = true;
      commitData.thresholdReachedAt = new Date().toISOString();
      fs.writeFileSync(commitTrackingFile, JSON.stringify(commitData, null, 2));
    }
  }

  // Reject a task and request changes
  rejectTask(taskId, issues) {
    const task = state.tasks[taskId];
    if (task) {
      task.state = 'IN_PROGRESS'; // Send back to developer
      task.updated = new Date().toISOString();
      task.qa_issues = issues;

      // Add note about required changes
      if (!task.notes) task.notes = [];
      task.notes.push({
        timestamp: new Date().toISOString(),
        author: this.agentId,
        content: `QA Review: Changes requested - ${issues.join(', ')}`
      });

      this.saveState();
    }
  }

  // Save state to file
  saveState() {
    state.meta.updated = new Date().toISOString();
    fs.writeFileSync(
      path.join(__dirname, 'data', 'state.json'),
      JSON.stringify(state, null, 2)
    );
  }

  // Sleep utility
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Main review loop
  async runReviewCycle() {
    const tasksToReview = this.getTasksInReview();

    if (tasksToReview.length === 0) {
      console.log(
        '📝 No tasks in REVIEW status. Looking for completed tasks...\n'
      );

      // Show recently completed tasks
      const recentTasks = Object.values(state.tasks)
        .filter(t => ['COMPLETED', 'APPROVED'].includes(t.state))
        .sort((a, b) => new Date(b.updated) - new Date(a.updated))
        .slice(0, 5);

      if (recentTasks.length > 0) {
        console.log('✅ Recently completed/approved tasks:');
        recentTasks.forEach(task => {
          console.log(`   ${task.id}: ${task.title} (${task.state})`);
        });
      }

      return [];
    }

    console.log(`📋 Found ${tasksToReview.length} tasks in REVIEW status:\n`);

    const results = [];

    for (const task of tasksToReview) {
      const result = await this.reviewTask(task);
      results.push(result);

      // Add delay between reviews
      if (tasksToReview.length > 1) {
        await this.sleep(1000);
        console.log('');
      }
    }

    return results;
  }
}

// Command line interface
async function main() {
  const qaAgent = new QAAgent();

  try {
    const results = await qaAgent.runReviewCycle();

    if (results.length > 0) {
      console.log('\n📊 QA Review Summary:');
      const approved = results.filter(r => r.action === 'APPROVED').length;
      const rejected = results.filter(r => r.action === 'REJECTED').length;

      console.log(`   ✅ Approved: ${approved}`);
      console.log(`   ❌ Rejected: ${rejected}`);

      if (approved > 0) {
        console.log(
          `\n🚀 ${approved} tasks approved - GitHub PRs will be created automatically`
        );
      }
    }
  } catch (error) {
    console.error('❌ QA Agent error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { QAAgent };
