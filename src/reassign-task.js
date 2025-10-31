#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const lockfile = require('proper-lockfile');

// Get task ID and new assignee from command line arguments
const taskId = process.argv[2];
const newAssignee = process.argv[3];

if (!taskId || !newAssignee) {
  console.error('Usage: node src/reassign-task.js <task-id> <new-assignee>');
  console.error(
    'Example: node src/reassign-task.js AUTH-985113-EC3E claude_dev_auth'
  );
  process.exit(1);
}

// File paths
const statePath = path.join(__dirname, 'data', 'state.json');

async function reassignTaskSafely() {
  let release;

  try {
    // Acquire exclusive lock with timeout
    console.log('🔒 Acquiring lock for task reassignment...');
    release = await lockfile.lock(statePath, {
      retries: {
        retries: 10,
        minTimeout: 100,
        maxTimeout: 1000
      },
      stale: 30000 // Lock expires after 30 seconds
    });

    console.log('✅ Lock acquired');

    // Read state file
    const stateData = fs.readFileSync(statePath, 'utf8');
    const state = JSON.parse(stateData);

    // Check if task exists
    if (!state.tasks[taskId]) {
      console.error(`❌ Task ${taskId} not found`);
      return;
    }

    const task = state.tasks[taskId];
    const oldAssignee = task.assignee;

    console.log(`\n📋 Task: ${taskId} - ${task.title}`);
    console.log(`   Current Status: ${task.state}`);
    console.log(`   Current Assignee: ${oldAssignee || 'Unassigned'}`);
    console.log(`   New Assignee: ${newAssignee}`);

    // Update task assignment
    const timestamp = new Date().toISOString();
    state.tasks[taskId].assignee = newAssignee;
    state.tasks[taskId].state = 'IN_PROGRESS';
    state.tasks[taskId].updated = timestamp;

    // Update assignments
    if (!state.assignments) {
      state.assignments = {};
    }

    // Remove from old assignee's list if exists
    if (oldAssignee && state.assignments[oldAssignee]) {
      let currentAssignments = Array.isArray(state.assignments[oldAssignee])
        ? state.assignments[oldAssignee]
        : state.assignments[oldAssignee].split(',').filter(id => id.length > 0);

      currentAssignments = currentAssignments.filter(id => id !== taskId);
      state.assignments[oldAssignee] = currentAssignments;
    }

    // Add to new assignee's list
    let newAssignments = [];
    if (state.assignments[newAssignee]) {
      newAssignments = Array.isArray(state.assignments[newAssignee])
        ? state.assignments[newAssignee]
        : state.assignments[newAssignee].split(',').filter(id => id.length > 0);
    }

    if (!newAssignments.includes(taskId)) {
      newAssignments.push(taskId);
    }
    state.assignments[newAssignee] = newAssignments;

    // Update metadata
    state.meta.updated = timestamp;

    // Write state atomically
    const tempPath = statePath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
    fs.renameSync(tempPath, statePath);

    console.log(`\n✅ Successfully reassigned task ${taskId}`);
    console.log(`   Status: ${task.state} → IN_PROGRESS`);
    console.log(`   Assignee: ${oldAssignee || 'Unassigned'} → ${newAssignee}`);

    // Show task details
    console.log('\n📝 Task Details:');
    console.log(`   Description: ${task.description}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Estimate: ${task.estimate}`);
    console.log(`   Tags: ${task.tags ? task.tags.join(', ') : 'none'}`);

    if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
      console.log('\n✅ Acceptance Criteria:');
      task.acceptanceCriteria.forEach((criteria, index) => {
        console.log(`   ${index + 1}. ${criteria}`);
      });
    }

    if (task.dependencies && task.dependencies.length > 0) {
      console.log(`\n🔗 Dependencies: ${task.dependencies.join(', ')}`);
    }
  } catch (error) {
    if (error.code === 'ELOCKED') {
      console.error(
        '🔒 Another process is currently accessing the state file. Please try again in a few seconds.'
      );
      process.exit(1);
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    // Always release the lock
    if (release) {
      try {
        await release();
        console.log('\n🔓 Lock released');
      } catch (releaseError) {
        console.error('⚠️ Error releasing lock:', releaseError.message);
      }
    }
  }
}

// Run the safe task reassignment
reassignTaskSafely().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});
