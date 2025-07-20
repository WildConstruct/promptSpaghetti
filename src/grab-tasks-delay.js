#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get developer ID from command line argument
const devId = process.argv[2];
const taskCount = parseInt(process.argv[3]) || 2;

if (!devId) {
  console.error('Usage: node grab-tasks-delay.js <developer-id> [task-count]');
  console.error('Example: node grab-tasks-delay.js dev_A 2');
  process.exit(1);
}

// Random delay to reduce race conditions (0-3 seconds)
const delay = Math.random() * 3000;
console.log(`⏳ ${devId} waiting ${Math.round(delay)}ms to reduce conflicts...`);

setTimeout(() => {
  // File paths
  const statePath = path.join(__dirname, 'data', 'state.json');

  try {
    // Read with retry logic
    let state;
    let retries = 3;
    
    while (retries > 0) {
      try {
        const stateData = fs.readFileSync(statePath, 'utf8');
        state = JSON.parse(stateData);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`🔄 Retrying file read (${retries} attempts left)...`);
        // Short delay before retry
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
      }
    }
    
    // Convert tasks to array
    const tasks = Object.entries(state.tasks || {}).map(([id, task]) => ({...task, id}));
    
    // Find TRULY unassigned tasks with double verification
    const unassignedTasks = tasks
      .filter(task => 
        task.state === 'UNASSIGNED' && 
        (!task.assignee || task.assignee === null)
      )
      .slice(0, taskCount);
    
    if (unassignedTasks.length === 0) {
      console.log('No unassigned tasks available.');
      process.exit(0);
    }
    
    console.log(`\n🎯 Assigning ${unassignedTasks.length} task(s) to ${devId}:\n`);
    
    // Update tasks with verification
    const assignedTaskIds = [];
    const timestamp = new Date().toISOString();
    
    unassignedTasks.forEach(task => {
      // Final verification before assignment
      if (state.tasks[task.id] && 
          state.tasks[task.id].state === 'UNASSIGNED' && 
          !state.tasks[task.id].assignee) {
        
        state.tasks[task.id].state = 'IN_PROGRESS';
        state.tasks[task.id].assignee = devId;
        state.tasks[task.id].updated = timestamp;
        
        assignedTaskIds.push(task.id);
        
        console.log(`✓ ${task.id}: ${task.title}`);
        console.log(`  Story: ${task.story_id}, WIP Class: ${task.wip_class}, Est: ${task.est} hours`);
        console.log('  Status: UNASSIGNED → IN_PROGRESS');
        console.log();
      }
    });
    
    if (assignedTaskIds.length === 0) {
      console.log('❌ All tasks were taken by other agents');
      process.exit(0);
    }
    
    // Update assignments with format handling
    if (!state.assignments) {
      state.assignments = {};
    }
    
    let currentAssignments = [];
    if (state.assignments[devId]) {
      currentAssignments = Array.isArray(state.assignments[devId]) 
        ? state.assignments[devId]
        : state.assignments[devId].split(',').filter(id => id.length > 0);
    }
    
    const newAssignments = [...new Set([...currentAssignments, ...assignedTaskIds])];
    state.assignments[devId] = newAssignments;
    
    // Update metadata
    state.meta.updated = timestamp;
    
    // Atomic write with backup
    const backupPath = statePath + '.backup';
    fs.copyFileSync(statePath, backupPath);
    
    const tempPath = statePath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
    fs.renameSync(tempPath, statePath);
    
    console.log(`✅ Successfully assigned ${assignedTaskIds.length} task(s) to ${devId}`);
    console.log(`📋 Total assignments for ${devId}: ${newAssignments.length} tasks`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}, delay);