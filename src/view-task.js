#!/usr/bin/env node
// Task Detail Viewer - Display comprehensive task information

const fs = require('fs');
const path = require('path');

console.log('📋 Task Detail Viewer\n');

function findTaskById(taskId) {
  const statePath = path.join(__dirname, 'data', 'state.json');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  return state.tasks[taskId];
}

function findStoryById(storyId) {
  const statePath = path.join(__dirname, 'data', 'state.json');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  return state.stories[storyId];
}

function displayTaskDetails(taskId) {
  const task = findTaskById(taskId);

  if (!task) {
    console.log(`❌ Task ${taskId} not found`);
    return;
  }

  console.log('═'.repeat(80));
  console.log('📋 TASK DETAILS');
  console.log('═'.repeat(80));
  console.log(`ID: ${task.id}`);
  console.log(`Title: ${task.title}`);
  console.log(`Story: ${task.story_id}`);
  console.log(`Type: ${task.wip_class}`);
  console.log(`Status: ${task.state}`);
  console.log(`Assignee: ${task.assignee || 'Unassigned'}`);
  console.log(`Estimate: ${task.est} hours`);
  console.log(`Created: ${task.created}`);
  console.log(`Updated: ${task.updated}`);

  if (task.dependencies && task.dependencies.length > 0) {
    console.log(`Dependencies: ${task.dependencies.join(', ')}`);
  }

  if (task.notes && task.notes.length > 0) {
    console.log('\n📝 Notes:');
    task.notes.forEach((note, i) => {
      console.log(`   ${i + 1}. ${note.content || note}`);
    });
  }

  // Get story context
  if (task.story_id) {
    const story = findStoryById(task.story_id);
    if (story) {
      console.log('\n' + '─'.repeat(80));
      console.log(`📖 STORY CONTEXT: ${story.title}`);
      console.log('─'.repeat(80));
      console.log(`Goal: ${story.goal_id}`);
      console.log(`Priority: ${story.priority}`);
      console.log(`Status: ${story.status}`);

      if (story.acceptance && story.acceptance.length > 0) {
        console.log('\n✅ Acceptance Criteria:');
        story.acceptance.forEach((criteria, i) => {
          console.log(`   ${i + 1}. ${criteria}`);
        });
      }
    }
  }

  // Get Epic context for this specific task
  console.log('\n' + '─'.repeat(80));
  console.log('🎯 EPIC 19 CONTEXT: Data Protection & Privacy Controls');
  console.log('─'.repeat(80));
  console.log('This task is part of Epic 19 - Security & Compliance Framework');
  console.log('Story 19.2 - Data Protection & Privacy Controls');
  console.log('Sub-story 19.2.6 - Data Retention Automation');
  console.log('\nFrom Epic 19 Plan (line 289):');
  console.log('   - Create deletion workflow');
  console.log('\nContext: This task implements automated data deletion as part of');
  console.log('the comprehensive data lifecycle management system, ensuring');
  console.log('compliance with data retention policies and regulations like GDPR.');

  console.log('\n' + '─'.repeat(80));
  console.log('📚 IMPLEMENTATION GUIDANCE');
  console.log('─'.repeat(80));
  console.log('Based on Epic 19 plan, this deletion workflow should include:');
  console.log('   • Automated deletion triggers based on retention policies');
  console.log('   • Safe deletion with proper verification steps');
  console.log('   • Audit logging for all deletion operations');
  console.log('   • Exception handling for retention holds');
  console.log('   • Integration with the data classification system');
  console.log('   • Compliance reporting for deletion activities');

  console.log('\n🔗 Related Epic 19.2.6 tasks from the plan:');
  console.log('   • Implement data aging tracking');
  console.log('   • Build archiving automation');
  console.log('   • Add retention hold mechanism');
  console.log('   • Implement deletion verification');
  console.log('   • Build retention compliance reports');

  console.log('\n' + '═'.repeat(80));
}

// Command line interface
const taskId = process.argv[2];

if (!taskId) {
  console.log('Usage: node view-task.js <TASK_ID>');
  console.log('Example: node view-task.js T-1752989143998-511');
  process.exit(1);
}

displayTaskDetails(taskId);
