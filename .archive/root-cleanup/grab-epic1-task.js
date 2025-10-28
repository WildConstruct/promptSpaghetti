#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'data', 'epic1-state.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const agentId = process.argv[2] || 'dev-claude';
const count = parseInt(process.argv[3]) || 1;

console.log(`\n🎯 Grabbing ${count} Epic 1 task(s) for ${agentId}...\n`);

// Find available tasks (TODO and not assigned)
const availableTasks = db.tasks
  .filter(t => t.status === 'TODO' && !t.assignedTo)
  .sort((a, b) => {
    // Priority order: CRITICAL > HIGH > MEDIUM
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

if (availableTasks.length === 0) {
  console.log('❌ No available tasks to grab!');
  process.exit(0);
}

// Grab tasks
const tasksToGrab = availableTasks.slice(0, count);
tasksToGrab.forEach(task => {
  task.status = 'IN_PROGRESS';
  task.assignedTo = agentId;
  task.updatedAt = new Date().toISOString();

  console.log(`✓ ${task.id}: ${task.title}`);
  console.log(`  Story: ${task.storyId} - ${task.storyTitle}`);
  console.log(`  Priority: ${task.priority}, Est: ${task.estimatedHours}h`);
  console.log(`  Status: TODO → IN_PROGRESS\n`);
});

// Update metadata
db.metadata.todoTasks -= tasksToGrab.length;
db.metadata.inProgressTasks += tasksToGrab.length;
db.lastUpdated = new Date().toISOString();

// Save database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(
  `✅ Successfully assigned ${tasksToGrab.length} task(s) to ${agentId}`
);
console.log(
  `📋 Total assignments for ${agentId}: ${db.tasks.filter(t => t.assignedTo === agentId).length} tasks`
);

// Show story file for first task
if (tasksToGrab.length > 0) {
  const firstTask = tasksToGrab[0];
  console.log(
    `\n📄 Story file for your first task: docs/stories/${firstTask.storyFile}`
  );
  console.log(
    `   Use: code docs/stories/${firstTask.storyFile} to open the story`
  );
}
