#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the state file
const statePath = path.join(__dirname, 'data', 'state.json');

try {
  const stateData = fs.readFileSync(statePath, 'utf8');
  const state = JSON.parse(stateData);
  
  console.log('=== Task Monitoring Dashboard ===\n');
  
  // Convert tasks object to array
  const tasks = Object.values(state.tasks || {});
  
  // Count tasks by state
  const stateCounts = {};
  tasks.forEach(task => {
    stateCounts[task.state] = (stateCounts[task.state] || 0) + 1;
  });
  
  console.log('Task State Summary:');
  Object.entries(stateCounts).forEach(([state, count]) => {
    console.log(`  ${state}: ${count}`);
  });
  console.log();
  
  // Show available tasks (UNASSIGNED)
  const unassignedTasks = tasks.filter(t => t.state === 'UNASSIGNED');
  if (unassignedTasks.length > 0) {
    console.log('Available Tasks (UNASSIGNED):');
    unassignedTasks.forEach(task => {
      console.log(`  - ${task.id}: ${task.title}`);
      console.log(`    Story: ${task.story_id}, WIP Class: ${task.wip_class}, Est: ${task.est}`);
    });
    console.log();
  }
  
  // Show in-progress tasks
  const inProgressTasks = tasks.filter(t => t.state === 'IN_PROGRESS');
  if (inProgressTasks.length > 0) {
    console.log('In Progress Tasks:');
    inProgressTasks.forEach(task => {
      console.log(`  - ${task.id}: ${task.title}`);
      console.log(`    Assigned to: ${task.assignee}, WIP Class: ${task.wip_class}`);
    });
    console.log();
  }
  
  // Show completed tasks
  const completedTasks = tasks.filter(t => t.state === 'COMPLETED');
  if (completedTasks.length > 0) {
    console.log(`Completed Tasks: ${completedTasks.length}`);
  }
  
  // Show current agent status
  console.log('\nAgent Assignments:');
  Object.entries(state.assignments || {}).forEach(([agentId, taskId]) => {
    console.log(`  ${agentId}: Working on ${taskId}`);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      console.log(`    Task: ${task.description}`);
    }
  });
  
} catch (error) {
  console.error('Error reading state file:', error.message);
  process.exit(1);
}