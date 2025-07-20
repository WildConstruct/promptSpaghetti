#!/usr/bin/env node
// Monitor agents to ensure they follow the workflow and call finish-task.js

const fs = require('fs');
const path = require('path');

console.log('👁️  Monitoring agent workflow compliance...\n');

// Load current state
const statePath = path.join(__dirname, 'data', 'state.json');

if (!fs.existsSync(statePath)) {
  console.error('❌ State file not found');
  process.exit(1);
}

let state;
try {
  const stateData = fs.readFileSync(statePath, 'utf8');
  state = JSON.parse(stateData);
} catch (error) {
  console.error('❌ Error reading state file:', error.message);
  process.exit(1);
}

// Get all tasks by assignee
const tasksByAssignee = {};
const allTasks = Object.values(state.tasks);

allTasks.forEach(task => {
  if (task.assignee && task.assignee !== 'Unassigned') {
    if (!tasksByAssignee[task.assignee]) {
      tasksByAssignee[task.assignee] = {
        IN_PROGRESS: [],
        REVIEW: [],
        APPROVED: [],
        COMPLETED: [],
        BLOCKED: [],
        total: 0
      };
    }
    tasksByAssignee[task.assignee][task.state].push(task);
    tasksByAssignee[task.assignee].total++;
  }
});

console.log('📊 Agent Workflow Compliance Report:\n');

// Load the auto-detection results to identify problematic tasks
const detectionScript = path.join(__dirname, 'auto-detect-completed-tasks.js');
let detectedCompletedTasks = [];
try {
  const { detectedCompletedTasks: detected } = require(detectionScript);
  detectedCompletedTasks = detected;
} catch {
  console.log('⚠️  Could not load auto-detection results');
}

// Create map of detected completed tasks by assignee
const detectedByAssignee = {};
detectedCompletedTasks.forEach(detection => {
  const assignee = detection.task.assignee;
  if (!detectedByAssignee[assignee]) {
    detectedByAssignee[assignee] = [];
  }
  detectedByAssignee[assignee].push(detection);
});

// Analyze each assignee
Object.keys(tasksByAssignee).forEach(assignee => {
  const tasks = tasksByAssignee[assignee];
  const detectedForAgent = detectedByAssignee[assignee] || [];
  
  console.log(`👤 ${assignee}:`);
  console.log(`   Total tasks: ${tasks.total}`);
  console.log(`   IN_PROGRESS: ${tasks.IN_PROGRESS.length}`);
  console.log(`   REVIEW: ${tasks.REVIEW.length}`);
  console.log(`   APPROVED: ${tasks.APPROVED.length}`);
  console.log(`   COMPLETED: ${tasks.COMPLETED.length}`);
  console.log(`   BLOCKED: ${tasks.BLOCKED.length}`);
  
  // Check for workflow violations
  const violations = [];
  
  // Check 1: Too many IN_PROGRESS tasks (agent might be taking on too much)
  if (tasks.IN_PROGRESS.length > 5) {
    violations.push(
      `⚠️  High IN_PROGRESS count (${tasks.IN_PROGRESS.length}) - may indicate overcommitment`
    );
  }
  
  // Check 2: Detected completed tasks stuck in IN_PROGRESS
  if (detectedForAgent.length > 0) {
    violations.push(
      `🚨 ${detectedForAgent.length} completed tasks stuck in IN_PROGRESS - agent not calling finish-task.js`
    );
    detectedForAgent.forEach(detection => {
      violations.push(`    → ${detection.task.id}: "${detection.task.title}" (${detection.confidence} confidence)`);
    });
  }
  
  // Check 3: Ratio analysis - too many IN_PROGRESS vs COMPLETED
  const completionRatio = tasks.total > 0 ? (tasks.COMPLETED.length / tasks.total) : 0;
  if (tasks.total > 3 && completionRatio < 0.2) {
    violations.push(
      `📉 Low completion ratio (${Math.round(completionRatio * 100)}%) - many tasks started but few finished`
    );
  }
  
  // Check 4: Stale IN_PROGRESS tasks (check if we can determine age)
  const oldInProgressTasks = tasks.IN_PROGRESS.filter(task => {
    // Check if task has been IN_PROGRESS for a while by looking at implementation files
    const totpServicePath = path.join(__dirname, '..', 'server/src/auth/services/TOTPService.ts');
    if (task.title.toLowerCase().includes('totp') && fs.existsSync(totpServicePath)) {
      const stats = fs.statSync(totpServicePath);
      const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceModified > 1; // File exists and was modified more than 1 day ago
    }
    return false;
  });
  
  if (oldInProgressTasks.length > 0) {
    violations.push(`⏰ ${oldInProgressTasks.length} potentially stale IN_PROGRESS tasks with existing implementations`);
  }
  
  if (violations.length > 0) {
    console.log('   🚨 WORKFLOW VIOLATIONS:');
    violations.forEach(violation => console.log(`   ${violation}`));
  } else {
    console.log('   ✅ No workflow violations detected');
  }
  
  console.log('');
});

// Overall recommendations
console.log('🎯 Recommendations:');

const totalDetected = detectedCompletedTasks.length;
if (totalDetected > 0) {
  console.log(`\n🔧 IMMEDIATE ACTION NEEDED:`);
  console.log(`   ${totalDetected} tasks have implementations but are stuck in IN_PROGRESS`);
  console.log(`   Run: node src/auto-fix-completed-tasks.js`);
  console.log(`   This will move completed tasks to REVIEW status`);
}

const agentsWithViolations = Object.keys(tasksByAssignee).filter(assignee => {
  const detectedForAgent = detectedByAssignee[assignee] || [];
  return detectedForAgent.length > 0;
});

if (agentsWithViolations.length > 0) {
  console.log(`\n📚 AGENT TRAINING NEEDED:`);
  console.log(`   Agents with workflow violations: ${agentsWithViolations.join(', ')}`);
  console.log(`   Ensure all agents understand they MUST call finish-task.js when work is complete`);
  console.log(`   Documentation updated in:`);
  console.log(`   - CLAUDE-TICKETS.md`);
  console.log(`   - src/agents/README.md`);
  console.log(`   - .bmad-core/agents/qa.md`);
}

console.log(`\n🔄 PROCESS IMPROVEMENTS:`);
console.log(`   1. Add finish-task.js calls to agent templates`);
console.log(`   2. Create automated reminders for long-running IN_PROGRESS tasks`);
console.log(`   3. Implement auto-detection as part of CI/CD pipeline`);
console.log(`   4. Add workflow compliance metrics to agent dashboards`);

// Summary statistics
const totalInProgress = allTasks.filter(t => t.state === 'IN_PROGRESS').length;
const totalWithAssignees = allTasks.filter(t => t.assignee && t.assignee !== 'Unassigned').length;

console.log(`\n📈 Summary Statistics:`);
console.log(`   Total tasks with assignees: ${totalWithAssignees}`);
console.log(`   Total IN_PROGRESS: ${totalInProgress}`);
console.log(`   Detected completed but stuck: ${totalDetected}`);
console.log(`   Workflow compliance rate: ${Math.round(((totalInProgress - totalDetected) / totalInProgress) * 100)}%`);

if (totalDetected === 0) {
  console.log(`\n🎉 Excellent! All agents are following the workflow correctly.`);
} else {
  console.log(`\n⚠️  Workflow issues detected. Run the recommended fixes above.`);
}