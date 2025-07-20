#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const lockfile = require('proper-lockfile');

// Get developer ID from command line argument
const devId = process.argv[2];
const taskCount = parseInt(process.argv[3]) || 2;

if (!devId) {
  console.error('Usage: node grab-tasks-safe.js <developer-id> [task-count]');
  console.error('Example: node grab-tasks-safe.js dev_A 2');
  process.exit(1);
}

// File paths
const statePath = path.join(__dirname, 'data', 'state.json');
const lockPath = statePath + '.lock';

async function grabTasksSafely() {
  let release;
  
  try {
    // Acquire exclusive lock with timeout
    console.log(`🔒 Acquiring lock for ${devId}...`);
    release = await lockfile.lock(statePath, {
      retries: {
        retries: 10,
        minTimeout: 100,
        maxTimeout: 1000
      },
      stale: 30000 // Lock expires after 30 seconds
    });
    
    console.log(`✅ Lock acquired for ${devId}`);
    
    // Read state file
    const stateData = fs.readFileSync(statePath, 'utf8');
    const state = JSON.parse(stateData);
    
    // Convert tasks to array
    const tasks = Object.entries(state.tasks || {}).map(([id, task]) => ({...task, id}));
    
    // Find TRULY unassigned tasks (double-check assignee is null)
    const unassignedTasks = tasks
      .filter(task => task.state === 'UNASSIGNED' && !task.assignee)
      .slice(0, taskCount);
    
    if (unassignedTasks.length === 0) {
      console.log('No unassigned tasks available.');
      return;
    }
    
    console.log(`\n🎯 Assigning ${unassignedTasks.length} task(s) to ${devId}:\n`);
    
    // Update tasks atomically
    const assignedTaskIds = [];
    const timestamp = new Date().toISOString();
    
    unassignedTasks.forEach(task => {
      // Verify task is still unassigned (paranoid check)
      if (state.tasks[task.id].state === 'UNASSIGNED' && !state.tasks[task.id].assignee) {
        state.tasks[task.id].state = 'IN_PROGRESS';
        state.tasks[task.id].assignee = devId;
        state.tasks[task.id].updated = timestamp;
        
        assignedTaskIds.push(task.id);
        
        console.log(`✓ ${task.id}: ${task.title}`);
        console.log(`  Story: ${task.story_id}, WIP Class: ${task.wip_class}, Est: ${task.est} hours`);
        console.log('  Status: UNASSIGNED → IN_PROGRESS');
        console.log();
      } else {
        console.log(`⚠️ Task ${task.id} was already assigned by another agent`);
      }
    });
    
    if (assignedTaskIds.length === 0) {
      console.log('❌ All tasks were taken by other agents during lock acquisition');
      return;
    }
    
    // Update assignments
    if (!state.assignments) {
      state.assignments = {};
    }
    
    // Handle both string and array formats for assignments
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
    
    // Write state atomically
    const tempPath = statePath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
    fs.renameSync(tempPath, statePath);
    
    console.log(`✅ Successfully assigned ${assignedTaskIds.length} task(s) to ${devId}`);
    console.log(`📋 Total assignments for ${devId}: ${newAssignments.length} tasks`);
    
    // Show current tasks
    const devTasks = tasks.filter(t => t.assignee === devId && t.state === 'IN_PROGRESS');
    if (devTasks.length > 0) {
      console.log('\n📝 Your IN_PROGRESS tasks:');
      devTasks.forEach(task => {
        console.log(`  - ${task.id}: ${task.title}`);
      });
    }
    
  } catch (error) {
    if (error.code === 'ELOCKED') {
      console.error('🔒 Another agent is currently assigning tasks. Please try again in a few seconds.');
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
        console.log(`🔓 Lock released for ${devId}`);
      } catch (releaseError) {
        console.error('⚠️ Error releasing lock:', releaseError.message);
      }
    }
  }
}

// Run the safe task grabbing
grabTasksSafely().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});