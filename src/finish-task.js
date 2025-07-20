#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get task ID from command line argument
const taskId = process.argv[2];
const newState = process.argv[3] || 'REVIEW'; // Default to REVIEW

if (!taskId) {
  console.error('Usage: node finish-task.js <task-id> [new-state]');
  console.error('Example: node finish-task.js T-1752951043927-918 REVIEW');
  console.error('States: REVIEW, COMPLETED, BLOCKED');
  process.exit(1);
}

const validStates = ['REVIEW', 'COMPLETED', 'BLOCKED'];
if (!validStates.includes(newState)) {
  console.error(`Invalid state: ${newState}. Must be one of: ${validStates.join(', ')}`);
  process.exit(1);
}

// Read the state file
const statePath = path.join(__dirname, 'data', 'state.json');

try {
  const stateData = fs.readFileSync(statePath, 'utf8');
  const state = JSON.parse(stateData);
  
  // Check if task exists
  if (!state.tasks[taskId]) {
    console.error(`Task ${taskId} not found`);
    process.exit(1);
  }
  
  const task = state.tasks[taskId];
  const oldState = task.state;
  
  // Update task state
  task.state = newState;
  task.updated = new Date().toISOString();
  
  // If moving to COMPLETED, remove from assignments
  if (newState === 'COMPLETED' && task.assignee && state.assignments) {
    const assignments = state.assignments[task.assignee];
    if (assignments) {
      // Handle both array and comma-separated string formats
      const taskList = Array.isArray(assignments) 
        ? assignments.filter(id => id !== taskId)
        : assignments.split(',').filter(id => id !== taskId);
      
      if (taskList.length === 0) {
        delete state.assignments[task.assignee];
      } else {
        // Keep as array format
        state.assignments[task.assignee] = taskList;
      }
    }
  }
  
  // Update metadata
  state.meta.updated = new Date().toISOString();
  
  // Write back to file
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  
  console.log(`\n✓ Task ${taskId} updated successfully`);
  console.log(`  Title: ${task.title}`);
  console.log(`  State: ${oldState} → ${newState}`);
  console.log(`  Assignee: ${task.assignee}`);
  
  // Show next steps
  if (newState === 'REVIEW') {
    console.log('\n→ Task is now in review. A QA agent or reviewer should verify the work.');
  } else if (newState === 'COMPLETED') {
    console.log('\n→ Task is completed! Great work.');
  } else if (newState === 'BLOCKED') {
    console.log('\n→ Task is blocked. Please add notes about the blocker.');
  }
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}