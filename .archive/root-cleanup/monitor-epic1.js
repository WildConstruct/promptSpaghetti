#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'data', 'epic1-state.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('\n🚀 EPIC 1 TASK DASHBOARD\n');
console.log('📊 Task Summary:');
console.log(`   Total Tasks: ${db.metadata.totalTasks}`);
console.log(`   TODO: ${db.tasks.filter(t => t.status === 'TODO').length}`);
console.log(`   IN_PROGRESS: ${db.tasks.filter(t => t.status === 'IN_PROGRESS').length}`);
console.log(`   COMPLETED: ${db.tasks.filter(t => t.status === 'COMPLETED').length}`);
console.log(`   BLOCKED: ${db.tasks.filter(t => t.status === 'BLOCKED').length}`);

console.log('\n📋 Story Progress:');
const stories = [...new Set(db.tasks.map(t => t.storyId))];
stories.forEach(storyId => {
  const storyTasks = db.tasks.filter(t => t.storyId === storyId);
  const completed = storyTasks.filter(t => t.status === 'COMPLETED').length;
  const total = storyTasks.length;
  const progress = Math.round((completed / total) * 100);
  const story = storyTasks[0];
  console.log(`   Story ${storyId}: ${story.storyTitle}`);
  console.log(`     Progress: [${'█'.repeat(progress/10).padEnd(10, '░')}] ${progress}% (${completed}/${total})`);
});

console.log('\n🎯 Available Tasks (TODO):');
db.tasks.filter(t => t.status === 'TODO' && !t.assignedTo)
  .slice(0, 5)
  .forEach(task => {
    console.log(`   ${task.priority === 'CRITICAL' ? '🔥' : task.priority === 'HIGH' ? '⚡' : '📝'} ${task.id}: ${task.title}`);
    console.log(`      Story: ${task.storyId}, Est: ${task.estimatedHours}h`);
  });
