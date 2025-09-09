#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load task data
const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const tasks = Object.values(state.tasks);

console.log('🔍 TICKET EPIC ASSIGNMENT AUDIT');
console.log('=================================\n');

// Check what tickets actually have proper epic assignments
let withStoryField = 0;
let withTagsField = 0;
let withSourceField = 0;
let completelyUntagged = 0;

const examples = {
  story: [],
  tags: [],
  source: [],
  untagged: []
};

tasks.forEach(task => {
  if (task.story) {
    withStoryField++;
    if (examples.story.length < 5) examples.story.push(task);
  }

  if (task.tags && task.tags.length > 0) {
    withTagsField++;
    if (examples.tags.length < 5) examples.tags.push(task);
  }

  if (task.metadata && task.metadata.source) {
    withSourceField++;
    if (examples.source.length < 5) examples.source.push(task);
  }

  if (
    !task.story &&
    (!task.tags || task.tags.length === 0) &&
    (!task.metadata || !task.metadata.source)
  ) {
    completelyUntagged++;
    if (examples.untagged.length < 10) examples.untagged.push(task);
  }
});

console.log('📊 EPIC ASSIGNMENT STATUS:');
console.log(
  `   📖 Tasks with story field: ${withStoryField} (${Math.round((withStoryField / tasks.length) * 100)}%)`
);
console.log(
  `   🏷️  Tasks with tags field: ${withTagsField} (${Math.round((withTagsField / tasks.length) * 100)}%)`
);
console.log(
  `   📋 Tasks with source field: ${withSourceField} (${Math.round((withSourceField / tasks.length) * 100)}%)`
);
console.log(
  `   ❌ Completely untagged: ${completelyUntagged} (${Math.round((completelyUntagged / tasks.length) * 100)}%)`
);

console.log('\n🔍 EXAMPLES OF EACH CATEGORY:\n');

if (examples.story.length > 0) {
  console.log(`📖 TASKS WITH STORY FIELD (${examples.story.length} shown):`);
  examples.story.forEach(task => {
    console.log(`   • ${task.id}: Story="${task.story}"`);
    console.log(`     Title: ${(task.title || '').substring(0, 50)}...`);
  });
  console.log('');
}

if (examples.tags.length > 0) {
  console.log(`🏷️  TASKS WITH TAGS FIELD (${examples.tags.length} shown):`);
  examples.tags.forEach(task => {
    console.log(`   • ${task.id}: Tags=[${task.tags.join(', ')}]`);
    console.log(`     Title: ${(task.title || '').substring(0, 50)}...`);
  });
  console.log('');
}

if (examples.source.length > 0) {
  console.log(`📋 TASKS WITH SOURCE FIELD (${examples.source.length} shown):`);
  examples.source.forEach(task => {
    console.log(`   • ${task.id}: Source="${task.metadata.source}"`);
    console.log(`     Title: ${(task.title || '').substring(0, 50)}...`);
  });
  console.log('');
}

console.log(
  `❌ UNTAGGED TASKS (${Math.min(examples.untagged.length, 10)} shown of ${completelyUntagged}):`
);
examples.untagged.forEach(task => {
  console.log(
    `   • ${task.id}: ${(task.title || 'No title').substring(0, 60)}...`
  );
});

console.log('\n🎯 DIAGNOSIS:');
if (completelyUntagged > tasks.length * 0.8) {
  console.log(
    `❌ MAJOR PROBLEM: ${Math.round((completelyUntagged / tasks.length) * 100)}% of tickets have no epic assignments!`
  );
  console.log(
    '   The tickets themselves are not properly tagged with their source epic.'
  );
  console.log(
    "   This means agents can't filter by epic and the dashboard can't show proper categories."
  );
} else if (completelyUntagged > tasks.length * 0.5) {
  console.log(
    `⚠️  MODERATE PROBLEM: ${Math.round((completelyUntagged / tasks.length) * 100)}% of tickets lack epic assignments.`
  );
} else {
  console.log('✅ GOOD: Most tickets have proper epic assignments.');
}

// Check if auth/file browser tasks exist with proper assignments
const authTasks = tasks.filter(task => {
  const title = (task.title || '').toLowerCase();
  return (
    title.includes('auth') ||
    title.includes('login') ||
    title.includes('password')
  );
});

const fileTasks = tasks.filter(task => {
  const title = (task.title || '').toLowerCase();
  return (
    title.includes('file') ||
    title.includes('project') ||
    title.includes('save')
  );
});

console.log('\n🔍 CONTENT ANALYSIS:');
console.log(`   🔐 Auth-related titles: ${authTasks.length} tasks`);
console.log(`   📁 File-related titles: ${fileTasks.length} tasks`);

const properlyTaggedAuth = authTasks.filter(
  t => t.story || (t.tags && t.tags.length > 0)
);
const properlyTaggedFile = fileTasks.filter(
  t => t.story || (t.tags && t.tags.length > 0)
);

console.log(
  `   ✅ Auth tasks with epic tags: ${properlyTaggedAuth.length}/${authTasks.length}`
);
console.log(
  `   ✅ File tasks with epic tags: ${properlyTaggedFile.length}/${fileTasks.length}`
);

if (properlyTaggedAuth.length === 0 && authTasks.length > 0) {
  console.log(
    `\n❌ AUTH ISSUE: Found ${authTasks.length} auth-related tasks but none have epic assignments!`
  );
}

if (properlyTaggedFile.length === 0 && fileTasks.length > 0) {
  console.log(
    `\n❌ FILE ISSUE: Found ${fileTasks.length} file-related tasks but none have epic assignments!`
  );
}
