#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'data', 'epic1-state.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const taskId = process.argv[2];
const status = process.argv[3] || 'COMPLETED';
const actualHours = parseFloat(process.argv[4]) || null;

if (!taskId) {
  console.error(
    'Usage: node update-epic1-task.js <task-id> [status] [actual-hours]'
  );
  process.exit(1);
}

// Find the task
const task = db.tasks.find(t => t.id === taskId);

if (!task) {
  console.error(`Task ${taskId} not found`);
  process.exit(1);
}

// Update task
const oldStatus = task.status;
task.status = status;
task.updatedAt = new Date().toISOString();

if (actualHours !== null) {
  task.actualHours = actualHours;
}

// Update metadata counts
if (oldStatus !== status) {
  // Decrement old status
if (oldStatus === 'TODO') {
  db.metadata.todoTasks--;
} else if (oldStatus === 'IN_PROGRESS') {
  db.metadata.inProgressTasks--;
} else if (oldStatus === 'COMPLETED') {
  db.metadata.completedTasks--;
} else if (oldStatus === 'BLOCKED') {
  db.metadata.blockedTasks--;
}

// Increment new status
if (status === 'TODO') {
  db.metadata.todoTasks++;
} else if (status === 'IN_PROGRESS') {
  db.metadata.inProgressTasks++;
} else if (status === 'COMPLETED') {
  db.metadata.completedTasks++;
} else if (status === 'BLOCKED') {
  db.metadata.blockedTasks++;
}
}

// Update story progress
const storyTasks = db.tasks.filter(t => t.storyId === task.storyId);
const completedCount = storyTasks.filter(t => t.status === 'COMPLETED').length;
const progress = Math.round((completedCount / storyTasks.length) * 100);

storyTasks.forEach(t => {
  t.metadata.storyProgress = progress;
});

// Save database
db.lastUpdated = new Date().toISOString();
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`\n✅ Task updated successfully`);
console.log(`   Task: ${task.title}`);
console.log(`   Status: ${oldStatus} → ${status}`);
if (actualHours !== null) {
  console.log(
    `   Actual Hours: ${actualHours} (Estimated: ${task.estimatedHours})`
  );
}
console.log(`   Story Progress: ${progress}%`);

// Show next available task
const nextTask = db.tasks.find(
  t => t.status === 'TODO' && t.priority === 'CRITICAL'
);
if (nextTask) {
  console.log(`\n📋 Next available CRITICAL task:`);
  console.log(`   ${nextTask.id}: ${nextTask.title}`);
  console.log(
    `   Story: ${nextTask.storyId}, Est: ${nextTask.estimatedHours}h`
  );
}
