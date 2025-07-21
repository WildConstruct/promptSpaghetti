#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load task data
const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const tasks = Object.values(state.tasks);

console.log('📊 EPIC REPRESENTATION ANALYSIS');
console.log('===============================\n');

// Group tasks by story field (epic identifier)
const epicCounts = {};
const epicDetails = {};

tasks.forEach(task => {
  if (task.story && task.story !== 'N/A' && task.story !== 'Other') {
    const story = task.story;
    epicCounts[story] = (epicCounts[story] || 0) + 1;
    
    if (!epicDetails[story]) {
      epicDetails[story] = {
        count: 0,
        name: task.metadata?.epic || 'Unknown Epic',
        examples: []
      };
    }
    epicDetails[story].count++;
    if (epicDetails[story].examples.length < 3) {
      epicDetails[story].examples.push({
        id: task.id,
        title: (task.title || '').substring(0, 50) + '...',
        tags: task.tags
      });
    }
  }
});

console.log(`🎯 TOTAL EPICS REPRESENTED: ${Object.keys(epicCounts).length}`);
console.log('');

// Sort by count descending
const sortedEpics = Object.entries(epicCounts).sort(([,a], [,b]) => b - a);

sortedEpics.forEach(([story, count]) => {
  const details = epicDetails[story];
  const percentage = Math.round((count / tasks.length) * 100);
  
  console.log(`📈 Epic ${story}: ${count} tasks (${percentage}%)`);
  console.log(`   Name: ${details.name}`);
  console.log(`   Examples:`);
  details.examples.forEach(ex => {
    console.log(`     • ${ex.id}: ${ex.title}`);
    if (ex.tags && ex.tags.length > 0) {
      console.log(`       Tags: ${ex.tags.join(', ')}`);
    }
  });
  console.log('');
});

// Summary by business priority
console.log('🎯 BUSINESS PRIORITY BREAKDOWN:');
console.log('===============================');

const authCount = epicCounts['20.1'] || 0;
const fileCount = epicCounts['20.2'] || 0; 
const epic19Count = epicCounts['19'] || 0;
const epic7Count = epicCounts['7'] || 0;
const epic3Count = epicCounts['3'] || 0;

// Count any other epics not in the main categories
const knownEpics = ['20.1', '20.2', '19', '7', '3'];
const otherEpicCount = Object.entries(epicCounts)
  .filter(([story]) => !knownEpics.includes(story))
  .reduce((sum, [, count]) => sum + count, 0);

console.log(`🔐 PRIORITY 1 - Authentication (20.1): ${authCount} tasks`);
console.log(`📁 PRIORITY 2 - File Browser (20.2): ${fileCount} tasks`);
console.log(`📋 Advanced Nodes (7): ${epic7Count} tasks`);
console.log(`📤 Export System (3): ${epic3Count} tasks`);
console.log(`🚫 Privacy/Compliance (19): ${epic19Count} tasks (deprioritized)`);
console.log(`📝 Other Epics: ${otherEpicCount} tasks`);

const totalWithEpics = Object.values(epicCounts).reduce((sum, count) => sum + count, 0);
const unassignedTasks = tasks.length - totalWithEpics;
console.log(`❌ Unassigned: ${unassignedTasks} tasks (${Math.round(unassignedTasks/tasks.length*100)}%)`);

console.log(`\n📊 EPIC COVERAGE: ${Math.round(totalWithEpics/tasks.length*100)}% of tasks have epic assignments`);

// List all unique epics found
if (Object.keys(epicCounts).length > 0) {
  console.log('\n🗂️  ALL EPICS FOUND:');
  Object.keys(epicCounts).sort().forEach(story => {
    const epicName = epicDetails[story]?.name || 'Unknown Epic';
    console.log(`   ${story}: ${epicName}`);
  });
}