#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const lockfile = require('proper-lockfile');

// Get developer ID from command line argument
const devId = process.argv[2];
const taskCount = parseInt(process.argv[3]) || 2;

// Parse optional filters
const args = process.argv.slice(2);
const storyFilter = args.find(arg => arg.startsWith('--story='))?.split('=')[1];
const epicFilter = args.find(arg => arg.startsWith('--epic='))?.split('=')[1];
const priorityOnly = args.includes('--priority-only');

if (!devId) {
  console.error('Usage: node src/grab-tasks.js <developer-id> [task-count] [options]');
  console.error('Example: node src/grab-tasks.js dev_A 2');
  console.error('Options:');
  console.error('  --story=20.1     Only grab tasks from story 20.1 (authentication)');
  console.error('  --story=20.2     Only grab tasks from story 20.2 (file browser)');
  console.error('  --epic=19        Only grab tasks from specific epic');
  console.error('  --priority-only  Only grab high-priority business-critical tasks');
  console.error('');
  console.error('💡 TIP: Run "node src/show-priority-tasks.js" first to see what you should work on');
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
    
    // Find available tasks - priority tasks use 'TODO' state, regular tasks use 'UNASSIGNED'
    let unassignedTasks = tasks
      .filter(task => 
        (task.state === 'UNASSIGNED' && !task.assignee) || 
        (task.state === 'TODO' && task.metadata?.source === 'priority-automation' && 
         (!task.assignee || task.assignee === 'Unassigned'))
      );
    
    // Apply filters
    if (storyFilter) {
      unassignedTasks = unassignedTasks.filter(task => {
        // Check both story field AND task tags for priority tasks
        const hasStoryField = task.story && task.story.includes(storyFilter);
        const hasStoryTag = (
          (storyFilter === '20.1' && task.tags?.includes('auth')) ||
          (storyFilter === '20.2' && task.tags?.includes('file-browser'))
        );
        return hasStoryField || hasStoryTag;
      });
      console.log(`📋 Filtering by story: ${storyFilter}`);
    }
    
    if (epicFilter) {
      unassignedTasks = unassignedTasks.filter(task => 
        task.epic && task.epic.includes(epicFilter)
      );
      console.log(`📋 Filtering by epic: ${epicFilter}`);
    }
    
    if (priorityOnly) {
      unassignedTasks = unassignedTasks.filter(task => 
        task.priority === 'high' || 
        task.metadata?.source === 'priority-automation' ||
        (task.story && (task.story.includes('20.1') || task.story.includes('20.2'))) ||
        task.tags?.includes('auth') ||
        task.tags?.includes('file-browser')
      );
      console.log(`🎯 Filtering to priority tasks only`);
    }
    
    // Sort by business priority (authentication > file-browser > other)
    unassignedTasks = unassignedTasks.sort((a, b) => {
      const getPriority = (task) => {
        // Highest priority: Authentication tasks (Story 20.1 OR auth tag)
        if (task.story?.includes('20.1') || task.tags?.includes('auth')) return 1;
        // Second priority: File browser tasks (Story 20.2 OR file-browser tag) 
        if (task.story?.includes('20.2') || task.tags?.includes('file-browser')) return 2;
        // Third priority: Other priority automation tasks
        if (task.metadata?.source === 'priority-automation') return 3;
        // Fourth priority: High priority tasks
        if (task.priority === 'high') return 4;
        // Lower priority: Everything else
        return 5;
      };
      
      const priorityDiff = getPriority(a) - getPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by creation date (newest first)
      return new Date(b.created || 0) - new Date(a.created || 0);
    });
    
    // Optional debug output (uncomment for troubleshooting)
    // if (unassignedTasks.length > 0) {
    //   console.log(`\n🔍 DEBUG: Found ${unassignedTasks.length} matching tasks:`);
    //   unassignedTasks.slice(0, 3).forEach(task => {
    //     console.log(`  - ${task.id}: state=${task.state}, tags=${JSON.stringify(task.tags)}, story=${task.story}`);
    //   });
    //   if (unassignedTasks.length > 3) {
    //     console.log(`  ... and ${unassignedTasks.length - 3} more`);
    //   }
    //   console.log('');
    // }
    
    // Take only the requested count
    unassignedTasks = unassignedTasks.slice(0, taskCount);
    
    if (unassignedTasks.length === 0) {
      console.log('❌ No unassigned tasks available matching your criteria.');
      console.log('');
      console.log('💡 NEXT STEPS:');
      console.log('   1. Check what tasks are available: node src/show-priority-tasks.js');
      console.log('   2. Remove filters and try again: node src/grab-tasks.js ' + devId + ' ' + taskCount);
      if (storyFilter || epicFilter || priorityOnly) {
        console.log('   3. You used filters - try without them for more options');
      }
      console.log('   4. Create new priority tasks: node src/create-priority-tickets.js');
      console.log('   5. Check IMMEDIATE-PRIORITIES.md for current business focus');
      return;
    }
    
    console.log(`\n🎯 Assigning ${unassignedTasks.length} task(s) to ${devId}:\n`);
    
    // Update tasks atomically
    const assignedTaskIds = [];
    const timestamp = new Date().toISOString();
    
    unassignedTasks.forEach(task => {
      // Verify task is still available (paranoid check)
      const currentTask = state.tasks[task.id];
      const isStillAvailable = 
        (currentTask.state === 'UNASSIGNED' && !currentTask.assignee) ||
        (currentTask.state === 'TODO' && (!currentTask.assignee || currentTask.assignee === 'Unassigned'));
        
      if (isStillAvailable) {
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
      console.log('');
      console.log('💡 SUGGESTED ACTIONS:');
      console.log('   1. Try again immediately: node src/grab-tasks.js ' + devId + ' ' + taskCount);
      console.log('   2. Check what\'s available: node src/monitor-available-tasks.js');
      console.log('   3. Try grabbing different task types with filters');
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