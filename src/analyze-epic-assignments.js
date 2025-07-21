#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load task data
const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const tasks = Object.values(state.tasks);

console.log('📊 EPIC ASSIGNMENT VERIFICATION');
console.log('================================\n');

// Group tasks by their epic indicators
const epicGroups = {
  'Authentication (20.1)': [],
  'File Browser (20.2)': [],
  'Epic 19 (Privacy)': [],
  'Other/Unassigned': []
};

tasks.forEach(task => {
  const title = (task.title || '').toLowerCase();
  const story = (task.story || '').toLowerCase();
  const tags = task.tags || [];
  
  const hasAuth = tags.includes('auth') || 
                  story.includes('20.1') || 
                  title.includes('auth') || 
                  title.includes('login') ||
                  title.includes('register') ||
                  title.includes('password') ||
                  title.includes('jwt') ||
                  title.includes('token');
                  
  const hasFileBrowser = tags.includes('file-browser') || 
                         story.includes('20.2') || 
                         title.includes('file browser') ||
                         title.includes('project') ||
                         title.includes('save') ||
                         title.includes('load') ||
                         (title.includes('export') && !story.includes('19')) ||
                         (title.includes('import') && !story.includes('19'));
                         
  const hasEpic19 = story.includes('19') || 
                    title.includes('privacy') || 
                    title.includes('compliance') || 
                    title.includes('gdpr') || 
                    title.includes('policy') ||
                    title.includes('audit') ||
                    title.includes('iso 27001');
  
  if (hasAuth && !hasEpic19) {
    epicGroups['Authentication (20.1)'].push(task);
  } else if (hasFileBrowser && !hasEpic19) {
    epicGroups['File Browser (20.2)'].push(task);
  } else if (hasEpic19) {
    epicGroups['Epic 19 (Privacy)'].push(task);
  } else {
    epicGroups['Other/Unassigned'].push(task);
  }
});

// Display results
Object.entries(epicGroups).forEach(([epic, tasks]) => {
  console.log(`🎯 ${epic}: ${tasks.length} tasks`);
  
  if (tasks.length > 0) {
    // Show state distribution
    const states = {};
    tasks.forEach(task => {
      const state = task.state || 'UNKNOWN';
      states[state] = (states[state] || 0) + 1;
    });
    
    console.log('   States:', Object.entries(states).map(([s, c]) => `${s}:${c}`).join(', '));
    
    // Show a few example tasks
    const examples = tasks.slice(0, 3);
    examples.forEach(task => {
      console.log(`   • ${task.id}: ${(task.title || '').substring(0, 50)}...`);
      if (task.story) console.log(`     Story: ${task.story}`);
      if (task.tags && task.tags.length > 0) console.log(`     Tags: ${task.tags.join(', ')}`);
      console.log(`     State: ${task.state}, Assignee: ${task.assignee || 'Unassigned'}`);
    });
    
    if (tasks.length > 3) {
      console.log(`   ... and ${tasks.length - 3} more tasks`);
    }
  }
  console.log('');
});

// Priority analysis
console.log('🔍 PRIORITY ANALYSIS:');
console.log('=====================\n');

const priorityTasks = tasks.filter(task => {
  const title = (task.title || '').toLowerCase();
  const story = (task.story || '').toLowerCase(); 
  const tags = task.tags || [];
  
  // Authentication priority
  if (tags.includes('auth') || story.includes('20.1') || 
      title.includes('auth') || title.includes('login')) {
    return !story.includes('19'); // Exclude Epic 19
  }
  
  // File browser priority  
  if (tags.includes('file-browser') || story.includes('20.2') ||
      title.includes('file browser') || title.includes('project')) {
    return !story.includes('19'); // Exclude Epic 19
  }
  
  return false;
});

console.log(`📈 PRIORITY TASKS: ${priorityTasks.length} out of ${tasks.length} total`);
console.log(`   Available (UNASSIGNED/TODO): ${priorityTasks.filter(t => t.state === 'UNASSIGNED' || (t.state === 'TODO' && (!t.assignee || t.assignee === 'Unassigned'))).length}`);
console.log(`   In Progress: ${priorityTasks.filter(t => t.state === 'IN_PROGRESS').length}`);
console.log(`   Completed: ${priorityTasks.filter(t => t.state === 'COMPLETED').length}`);

// Check Epic 19 dominance
const epic19Tasks = tasks.filter(task => {
  const title = (task.title || '').toLowerCase();
  const story = (task.story || '').toLowerCase();
  return story.includes('19') || title.includes('privacy') || title.includes('compliance') || title.includes('policy');
});

console.log(`\n⚠️  EPIC 19 TASKS: ${epic19Tasks.length} (should be minimal per priorities)`);
if (epic19Tasks.length > 50) {
  console.log('   ❌ WARNING: Too many Epic 19 tasks - agents may be grabbing these instead of priorities');
}

console.log('\n✅ EPIC ASSIGNMENT STATUS:');
const authCount = epicGroups['Authentication (20.1)'].length;
const fileCount = epicGroups['File Browser (20.2)'].length;
const epic19Count = epicGroups['Epic 19 (Privacy)'].length;
const otherCount = epicGroups['Other/Unassigned'].length;

console.log(`   🔐 Auth Focus: ${authCount} tasks (${Math.round(authCount/tasks.length*100)}%)`);
console.log(`   📁 File Focus: ${fileCount} tasks (${Math.round(fileCount/tasks.length*100)}%)`);
console.log(`   🚫 Epic 19: ${epic19Count} tasks (${Math.round(epic19Count/tasks.length*100)}%) - should be <20%`);
console.log(`   📋 Other: ${otherCount} tasks (${Math.round(otherCount/tasks.length*100)}%)`);

if (epic19Count > (authCount + fileCount)) {
  console.log('\n❌ PROBLEM: Epic 19 has more tasks than priority epics combined!');
  console.log('   Agents should use --priority-only flag to avoid Epic 19 tasks');
} else {
  console.log('\n✅ Good: Priority epics have more focus than Epic 19');
}