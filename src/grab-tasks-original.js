#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get developer ID from command line argument
const devId = process.argv[2];
const taskCount = parseInt(process.argv[3]) || 2; // Default to 2 tasks

if (!devId) {
  console.error('Usage: node grab-tasks.js <developer-id> [task-count]');
  console.error('Example: node grab-tasks.js dev_A 2');
  process.exit(1);
}

// Read the state file
const statePath = path.join(__dirname, 'data', 'state.json');

try {
  const stateData = fs.readFileSync(statePath, 'utf8');
  const state = JSON.parse(stateData);

  // Remove phase restrictions - allow direct task assignment
  delete state.meta.phase;

  // Convert tasks object to array with IDs
  const tasks = Object.entries(state.tasks || {}).map(([id, task]) => ({
    ...task,
    id
  }));

  // Find unassigned tasks
  const unassignedTasks = tasks
    .filter(task => task.state === 'UNASSIGNED')
    .slice(0, taskCount);

  if (unassignedTasks.length === 0) {
    console.log('No unassigned tasks available.');
    process.exit(0);
  }

  console.log(`\nAssigning ${unassignedTasks.length} task(s) to ${devId}:\n`);

  // Update tasks
  const assignedTaskIds = [];
  unassignedTasks.forEach(task => {
    // Update task state
    state.tasks[task.id].state = 'IN_PROGRESS';
    state.tasks[task.id].assignee = devId;
    state.tasks[task.id].updated = new Date().toISOString();

    assignedTaskIds.push(task.id);

    console.log(`✓ ${task.id}: ${task.title}`);
    console.log(
      `  Story: ${task.story_id}, WIP Class: ${task.wip_class}, Est: ${task.est} hours`
    );
    console.log('  Status: UNASSIGNED → IN_PROGRESS');
    console.log();
  });

  // Update assignments
  if (!state.assignments) {
    state.assignments = {};
  }

  // Add new task IDs to developer's assignment list
  const currentAssignments = state.assignments[devId]
    ? state.assignments[devId].split(',')
    : [];
  const newAssignments = [
    ...new Set([...currentAssignments, ...assignedTaskIds])
  ];
  state.assignments[devId] = newAssignments.join(',');

  // Update metadata
  state.meta.updated = new Date().toISOString();

  // Write back to file
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

  console.log(
    `Successfully assigned ${unassignedTasks.length} task(s) to ${devId}`
  );
  console.log(
    '\nCurrent assignments for',
    devId + ':',
    newAssignments.length,
    'total tasks'
  );

  // Show summary of developer's current tasks
  const devTasks = tasks.filter(
    t => t.assignee === devId && t.state === 'IN_PROGRESS'
  );
  if (devTasks.length > 0) {
    console.log('\nYour IN_PROGRESS tasks:');
    devTasks.forEach(task => {
      console.log(`  - ${task.id}: ${task.title}`);
    });
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
