#!/usr/bin/env node
// QA Agent helper - Find files related to task IDs

const fs = require('fs');
const path = require('path');

console.log('🔍 QA Task Finder - Helping locate task-related changes\n');

// Read current state
const state = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'state.json'), 'utf8'));

function findTaskById(taskId) {
  return state.tasks[taskId];
}

function findTasksByPattern(pattern) {
  return Object.values(state.tasks).filter(
    task => task.title.toLowerCase().includes(pattern.toLowerCase()) || task.id.includes(pattern)
  );
}

function getQAGuidanceForTask(taskId) {
  const task = findTaskById(taskId);
  if (!task) {
    console.log(`❌ Task ${taskId} not found`);
    return;
  }

  console.log(`📋 Task: ${task.title}`);
  console.log(`   ID: ${task.id}`);
  console.log(`   Story: ${task.story_id}`);
  console.log(`   Type: ${task.wip_class}`);
  console.log(`   Status: ${task.state}`);
  console.log(`   Assignee: ${task.assignee || 'Unassigned'}`);

  if (task.qa_metadata) {
    console.log('\n🔍 QA Guidance:');
    console.log(`   Files to check: ${task.qa_metadata.target_files.join(', ')}`);
    console.log(`   Testing approach: ${task.qa_metadata.qa_guidance}`);
    console.log(`   Requirements: ${task.qa_metadata.testing_requirements.join('; ')}`);
  } else {
    console.log('\n⚠️ Legacy task - no QA metadata available');
    console.log('   💡 Look for files related to:');

    // Suggest files based on task content
    if (task.title.toLowerCase().includes('security')) {
      console.log('   📁 packages/core/validation/security.ts');
      console.log('   📁 **/__tests__/**/*security*.test.*');
    }
    if (task.title.toLowerCase().includes('setvariable')) {
      console.log('   📁 packages/core/components/Inspector/editors/SetVariableEditor.tsx');
      console.log('   📁 packages/core/runtime/index.ts');
    }
    if (task.title.toLowerCase().includes('conditional')) {
      console.log('   📁 packages/core/runtime/nodes/Conditional.ts');
      console.log('   📁 packages/core/components/Inspector/editors/ConditionalEditor.tsx');
    }
    if (task.title.toLowerCase().includes('test')) {
      console.log('   📁 **/__tests__/**/*.test.*');
      console.log('   📁 packages/core/__tests__/');
    }
  }

  console.log('');
}

function suggestFilesForSecurityTasks() {
  console.log('🔒 Security Task File Suggestions:');
  console.log('   📁 packages/core/validation/security.ts - Main security validation');
  console.log('   📁 packages/core/graphSchema.ts - Schema validation');
  console.log('   📁 packages/core/runtime/index.ts - Runtime execution');
  console.log('   📁 packages/core/__tests__/ - Test files');
  console.log('   📁 server/src/engine.ts - Server-side execution');
  console.log('');
}

function findRecentSecurityChanges() {
  console.log('🔍 Looking for recent security-related changes...\n');

  const securityTasks = Object.values(state.tasks).filter(
    task =>
      task.title.toLowerCase().includes('security') ||
      task.title.toLowerCase().includes('setvariable') ||
      task.title.toLowerCase().includes('conditional') ||
      task.title.toLowerCase().includes('validation')
  );

  console.log(`Found ${securityTasks.length} security-related tasks:\n`);

  securityTasks.forEach(task => {
    console.log(`📋 ${task.id}: ${task.title}`);
    console.log(`   Status: ${task.state} | Assignee: ${task.assignee || 'Unassigned'}`);
    console.log(`   Updated: ${task.updated}`);
    console.log('');
  });
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
  case 'task':
    if (param) {
      getQAGuidanceForTask(param);
    } else {
      console.log('Usage: node qa-task-finder.js task <TASK_ID>');
    }
    break;

  case 'search':
    if (param) {
      const results = findTasksByPattern(param);
      console.log(`🔍 Found ${results.length} tasks matching "${param}":\n`);
      results.forEach(task => {
        console.log(`📋 ${task.id}: ${task.title}`);
        console.log(`   Status: ${task.state} | Type: ${task.wip_class}`);
        console.log('');
      });
    } else {
      console.log('Usage: node qa-task-finder.js search <pattern>');
    }
    break;

  case 'security':
    findRecentSecurityChanges();
    suggestFilesForSecurityTasks();
    break;

  default:
    console.log('🔍 QA Task Finder Commands:');
    console.log('');
    console.log('   node qa-task-finder.js task <TASK_ID>');
    console.log('   node qa-task-finder.js search <pattern>');
    console.log('   node qa-task-finder.js security');
    console.log('');
    console.log('Examples:');
    console.log('   node qa-task-finder.js task T-1752951043101-753');
    console.log('   node qa-task-finder.js search security');
    console.log('   node qa-task-finder.js security');
    console.log('');
    break;
}

// Auto-suggest for security tasks if no command given
if (!command) {
  findRecentSecurityChanges();
}
