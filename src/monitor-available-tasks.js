#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the state file
const statePath = path.join(__dirname, 'data', 'state.json');

try {
  const stateData = fs.readFileSync(statePath, 'utf8');
  const state = JSON.parse(stateData);
  
  console.log('🎯 AGENT COORDINATION DASHBOARD');
  console.log('📊 Real-time task allocation and priority overview\n');
  
  // Convert tasks object to array
  const tasks = Object.values(state.tasks || {});
  
  // Count tasks by state and priority
  const stateCounts = {};
  const priorityBreakdown = { high: 0, medium: 0, low: 0, unset: 0 };
  const storyBreakdown = {};
  
  tasks.forEach(task => {
    stateCounts[task.state] = (stateCounts[task.state] || 0) + 1;
    
    // Track priority distribution
    const priority = task.priority || 'unset';
    priorityBreakdown[priority] = (priorityBreakdown[priority] || 0) + 1;
    
    // Track story distribution
    const story = task.story || 'no-story';
    storyBreakdown[story] = (storyBreakdown[story] || 0) + 1;
  });
  
  console.log('📈 TASK STATE SUMMARY:');
  Object.entries(stateCounts).forEach(([state, count]) => {
    const emoji = {
      'UNASSIGNED': '⏳',
      'IN_PROGRESS': '🔄', 
      'REVIEW': '👁️',
      'COMPLETED': '✅',
      'BLOCKED': '🚫'
    }[state] || '❓';
    console.log(`  ${emoji} ${state}: ${count}`);
  });
  
  console.log('\n🎯 PRIORITY BREAKDOWN:');
  Object.entries(priorityBreakdown).forEach(([priority, count]) => {
    if (count > 0) {
      const emoji = {
        'high': '🔥',
        'medium': '⚡', 
        'low': '📝',
        'unset': '❓'
      }[priority];
      console.log(`  ${emoji} ${priority.toUpperCase()}: ${count}`);
    }
  });
  
  console.log('\n📚 STORY BREAKDOWN:');
  Object.entries(storyBreakdown).forEach(([story, count]) => {
    if (count > 0 && story !== 'no-story') {
      const emoji = story.includes('20.1') ? '🔐' : story.includes('20.2') ? '📁' : '📄';
      const label = story.includes('20.1') ? 'Authentication' : story.includes('20.2') ? 'File Browser' : story;
      console.log(`  ${emoji} ${label}: ${count}`);
    }
  });
  console.log();
  
  // Show available tasks (UNASSIGNED) - prioritized
  const unassignedTasks = tasks.filter(t => t.state === 'UNASSIGNED');
  
  if (unassignedTasks.length > 0) {
    // Sort by business priority
    const sortedTasks = unassignedTasks.sort((a, b) => {
      const getPriority = (task) => {
        if (task.story?.includes('20.1')) return 1; // Auth highest
        if (task.story?.includes('20.2')) return 2; // File browser second
        if (task.metadata?.source === 'priority-automation') return 3;
        if (task.priority === 'high') return 4;
        return 5;
      };
      return getPriority(a) - getPriority(b);
    });
    
    console.log('🚀 AVAILABLE TASKS (Priority Order):');
    console.log('💡 TIP: Run "node src/grab-tasks.js <your-id> 2" to grab top tasks\n');
    
    sortedTasks.slice(0, 10).forEach((task, index) => {
      const priorityEmoji = task.story?.includes('20.1') ? '🔐' : 
                           task.story?.includes('20.2') ? '📁' : 
                           task.priority === 'high' ? '🔥' : '📝';
      const storyLabel = task.story?.includes('20.1') ? '[AUTH]' :
                        task.story?.includes('20.2') ? '[FILE]' : '';
      
      console.log(`  ${index + 1}. ${priorityEmoji} ${task.id}: ${task.title} ${storyLabel}`);
      console.log(`     Story: ${task.story || 'N/A'}, Est: ${task.est || 'N/A'} hrs`);
    });
    
    if (sortedTasks.length > 10) {
      console.log(`     ... and ${sortedTasks.length - 10} more tasks`);
    }
    console.log();
  } else {
    console.log('❌ NO AVAILABLE TASKS');
    console.log('💡 Create priority tasks: node src/create-priority-tickets.js\n');
  }
  
  // Show in-progress tasks with agent coordination
  const inProgressTasks = tasks.filter(t => t.state === 'IN_PROGRESS');
  
  if (inProgressTasks.length > 0) {
    console.log('🔄 ACTIVE WORK (Agent Coordination):');
    
    // Group by assignee for better coordination view
    const byAssignee = {};
    inProgressTasks.forEach(task => {
      const assignee = task.assignee || 'unassigned';
      if (!byAssignee[assignee]) byAssignee[assignee] = [];
      byAssignee[assignee].push(task);
    });
    
    Object.entries(byAssignee).forEach(([assignee, agentTasks]) => {
      console.log(`\n  👤 ${assignee} (${agentTasks.length} tasks):`);
      agentTasks.forEach(task => {
        const storyEmoji = task.story?.includes('20.1') ? '🔐' : 
                          task.story?.includes('20.2') ? '📁' : '📄';
        const timeAgo = task.updated ? 
          `${Math.round((Date.now() - new Date(task.updated)) / 60000)}m ago` : 'unknown';
        
        console.log(`    ${storyEmoji} ${task.id}: ${task.title}`);
        console.log(`       Last update: ${timeAgo}, Est: ${task.est || 'N/A'} hrs`);
      });
    });
    console.log();
  }
  
  // Show recent completions and blocked tasks
  const completedTasks = tasks.filter(t => t.state === 'COMPLETED');
  const blockedTasks = tasks.filter(t => t.state === 'BLOCKED');
  const reviewTasks = tasks.filter(t => t.state === 'REVIEW');
  
  if (completedTasks.length > 0) {
    console.log(`✅ COMPLETED: ${completedTasks.length} tasks`);
  }
  
  if (reviewTasks.length > 0) {
    console.log('\n👁️ TASKS NEEDING REVIEW:');
    reviewTasks.forEach(task => {
      console.log(`  - ${task.id}: ${task.title} (by ${task.assignee})`);
    });
    console.log('💡 QA agents: Run "node src/run-qa-agent.js" to review these\n');
  }
  
  if (blockedTasks.length > 0) {
    console.log('🚫 BLOCKED TASKS NEEDING ATTENTION:');
    blockedTasks.forEach(task => {
      console.log(`  - ${task.id}: ${task.title}`);
      console.log(`    Blocked by: ${task.block_reason || 'unspecified'}, Assignee: ${task.assignee}`);
    });
    console.log();
  }
  
  // Show business priority recommendations
  console.log('\n🎯 BUSINESS PRIORITY GUIDANCE:');
  console.log('Based on IMMEDIATE-PRIORITIES.md:');
  
  const authTasks = tasks.filter(t => t.story?.includes('20.1') && t.state === 'UNASSIGNED');
  const fileTasks = tasks.filter(t => t.story?.includes('20.2') && t.state === 'UNASSIGNED');
  
  if (authTasks.length > 0) {
    console.log(`  🔥 PRIORITY 1: ${authTasks.length} authentication tasks available`);
    console.log('     Command: node src/grab-tasks.js <your-id> 2 --story=20.1');
  }
  
  if (fileTasks.length > 0) {
    console.log(`  ⚡ PRIORITY 2: ${fileTasks.length} file browser tasks available`);
    console.log('     Command: node src/grab-tasks.js <your-id> 2 --story=20.2');
  }
  
  const epicTasks = tasks.filter(t => t.story?.includes('19') && t.state === 'UNASSIGNED');
  if (epicTasks.length > 0) {
    console.log(`  📝 DEPRIORITIZED: ${epicTasks.length} Epic 19 privacy tasks (avoid unless critical)`);
  }
  
  console.log('\n📋 QUICK COMMANDS:');
  console.log('  🔍 Check priorities: node src/show-priority-tasks.js');
  console.log('  📥 Grab priority tasks: node src/grab-tasks.js <your-id> 2 --priority-only');
  console.log('  📊 This dashboard: node src/monitor-available-tasks.js');
  
} catch (error) {
  console.error('Error reading state file:', error.message);
  process.exit(1);
}