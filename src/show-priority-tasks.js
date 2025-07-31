#!/usr/bin/env node

/**
 * Show Priority Tasks Script
 *
 * Displays available priority tasks created for IMMEDIATE-PRIORITIES.md
 * Helps agents identify and grab the correct tasks for authentication and file browser features.
 */

const fs = require('fs').promises;
const path = require('path');

async function showPriorityTasks() {
  console.log('🎯 PRIORITY TASKS DASHBOARD\n');
  console.log('📋 Based on IMMEDIATE-PRIORITIES.md - Focus on business-critical features\n');

  try {
    // Load current state
    const stateFile = path.join(__dirname, 'data/state.json');
    const stateData = await fs.readFile(stateFile, 'utf8');
    const state = JSON.parse(stateData);

    if (!state.tasks) {
      console.log('❌ No tasks found in system');
      return;
    }

    // Filter priority tasks - Epic 8 (highest priority) plus existing automation
    const priorityTasks = Object.values(state.tasks).filter(
      task =>
        // PRIORITY 1: Epic 8 Demo-Ready Proof of Concept
        task.epic === 'Epic 8' ||
        task.tags?.includes('epic-8') ||
        task.tags?.includes('wild-construct') ||
        // PRIORITY 2+: Existing priority automation tasks
        task.metadata?.source === 'priority-automation'
    );

    if (priorityTasks.length === 0) {
      console.log('❌ No priority tasks found. Run: node src/create-priority-tickets.js');
      return;
    }

    // Group by story - Epic 8 first, then existing priorities
    const epic8Tasks = priorityTasks
      .filter(task => task.epic === 'Epic 8' || task.tags?.includes('epic-8') || task.tags?.includes('wild-construct'))
      .sort((a, b) => {
        // Sort by story order (8.1, 8.2, 8.3, etc)
        if (a.story && b.story) {
          const aStoryNum = parseFloat(a.story);
          const bStoryNum = parseFloat(b.story);
          if (!isNaN(aStoryNum) && !isNaN(bStoryNum)) {
            return aStoryNum - bStoryNum;
          }
        }
        return new Date(a.created) - new Date(b.created);
      });

    const authTasks = priorityTasks
      .filter(task => task.story && task.story.includes('20.1'))
      .sort((a, b) => {
        // Sort high priority first, then by creation time
        if (a.priority !== b.priority) {
          return a.priority === 'high' ? -1 : 1;
        }
        return new Date(a.created) - new Date(b.created);
      });

    const fileTasks = priorityTasks
      .filter(task => task.story && task.story.includes('20.2'))
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority === 'high' ? -1 : 1;
        }
        return new Date(a.created) - new Date(b.created);
      });

    // Display Epic 8 tasks first (PRIORITY 1)
    if (epic8Tasks.length > 0) {
      console.log('=' * 70);
      console.log('🎬 PRIORITY 1: EPIC 8 DEMO-READY PROOF OF CONCEPT');
      console.log('=' * 70);
      console.log('🎯 Business Value: $2.3B Film Industry - Wild Construct Ecosystem Demo');
      console.log('⏰ Timeline: 4-6 weeks to demo readiness');
      console.log('🏆 Success: Filmmaker creates professional prompts in <2 minutes\n');

      epic8Tasks.forEach((task, index) => {
        const statusIcon = getStatusIcon(task.state);
        const priorityIcon = getPriorityIcon(task.priority);
        const storyTitle = getEpic8StoryTitle(task.story);

        console.log(`${index + 1}. ${statusIcon} ${priorityIcon} ${task.id}: ${task.title}`);
        console.log(`   📊 Status: ${task.state} | ⏱️  Est: ${task.est} hours | 🏷️  Story: ${task.story}`);
        if (task.assignee) {
          console.log(`   👤 Assigned: ${task.assignee}`);
        }
        console.log(`   🎯 ${storyTitle}`);
        console.log(`   🏷️  Tags: ${task.tags?.join(', ') || 'none'}`);
        console.log('');
      });
    }

    console.log('=' * 70);
    console.log('🔐 PRIORITY 2: AUTHENTICATION TASKS (Story 20.1)');
    console.log('=' * 70);
    console.log('📈 Business Value: Users can log in and access personal accounts\n');

    if (authTasks.length === 0) {
      console.log('   ❌ No authentication tasks available\n');
    } else {
      authTasks.forEach((task, index) => {
        const statusIcon = getStatusIcon(task.state);
        const priorityIcon = task.priority === 'high' ? '🔥' : '⚡';
        const assigneeText = task.assignee === 'Unassigned' ? '🔓 Available' : `👤 ${task.assignee}`;

        console.log(`${index + 1}. ${statusIcon} ${priorityIcon} ${task.id}: ${task.title}`);
        console.log(`   📊 Status: ${task.state} | ⏱️  Est: ${task.estimate} | 🏷️  Class: ${task.wipClass}`);
        console.log(`   👤 ${assigneeText}`);
        console.log(`   🎯 Value: ${task.businessValue}`);
        console.log(`   🏷️  Tags: ${task.tags.join(', ')}`);

        if (task.dependencies && task.dependencies.length > 0) {
          console.log(`   🔗 Depends on: ${task.dependencies.join(', ')}`);
        }
        console.log('');
      });
    }

    console.log('=' * 70);
    console.log('📁 PRIORITY 2: FILE BROWSER TASKS (Story 20.2)');
    console.log('=' * 70);
    console.log('📈 Business Value: Users can save/load projects and not lose work\n');

    if (fileTasks.length === 0) {
      console.log('   ❌ No file browser tasks available\n');
    } else {
      fileTasks.forEach((task, index) => {
        const statusIcon = getStatusIcon(task.state);
        const priorityIcon = task.priority === 'high' ? '🔥' : '⚡';
        const assigneeText = task.assignee === 'Unassigned' ? '🔓 Available' : `👤 ${task.assignee}`;

        console.log(`${index + 1}. ${statusIcon} ${priorityIcon} ${task.id}: ${task.title}`);
        console.log(`   📊 Status: ${task.state} | ⏱️  Est: ${task.estimate} | 🏷️  Class: ${task.wipClass}`);
        console.log(`   👤 ${assigneeText}`);
        console.log(`   🎯 Value: ${task.businessValue}`);
        console.log(`   🏷️  Tags: ${task.tags.join(', ')}`);

        if (task.dependencies && task.dependencies.length > 0) {
          console.log(`   🔗 Depends on: ${task.dependencies.join(', ')}`);
        }
        console.log('');
      });
    }

    // Summary statistics
    const availableEpic8Tasks = epic8Tasks.filter(
      t => t.state === 'UNASSIGNED' && (!t.assignee || t.assignee === null)
    );
    const availableAuthTasks = authTasks.filter(t => t.state === 'TODO' && t.assignee === 'Unassigned');
    const availableFileTasks = fileTasks.filter(t => t.state === 'TODO' && t.assignee === 'Unassigned');
    const totalAvailable = availableEpic8Tasks.length + availableAuthTasks.length + availableFileTasks.length;

    console.log('📊 SUMMARY STATISTICS');
    console.log('=' * 70);
    console.log(
      `🔓 Available Tasks: ${totalAvailable} (${availableEpic8Tasks.length} epic8 + ${availableAuthTasks.length} auth + ${availableFileTasks.length} file)`
    );
    console.log(`🎬 Epic 8 Tasks: ${epic8Tasks.length} total (${availableEpic8Tasks.length} available)`);
    console.log(`🔐 Authentication Tasks: ${authTasks.length} total`);
    console.log(`📁 File Browser Tasks: ${fileTasks.length} total`);
    console.log(`⏱️  Total Estimated Time: ${calculateTotalTime(priorityTasks)}`);
    console.log('');

    // Instructions for agents
    console.log('🤖 AGENT INSTRUCTIONS');
    console.log('=' * 70);
    console.log('1. 🎯 FOCUS: Work on Epic 8 Demo-Ready Proof of Concept (HIGHEST PRIORITY)');
    console.log('2. 🎬 Epic 8 tasks are TOP PRIORITY for Wild Construct film industry demo');
    console.log('3. 🔐 Then Authentication tasks (Story 20.1) if no Epic 8 work available');
    console.log('4. 📁 Then File Browser tasks (Story 20.2) for user retention');
    console.log('5. 🚫 AVOID: Epic 19 privacy/compliance tasks (deprioritized per PM)');
    console.log('');
    console.log('🔧 TO GRAB EPIC 8 TASKS (RECOMMENDED):');
    console.log('   node src/grab-tasks.js <your-agent-id> 3 --epic=8');
    console.log('   node src/grab-tasks.js <your-agent-id> 2 --story=8.1  # Professional Interface');
    console.log('   node src/grab-tasks.js <your-agent-id> 2 --story=8.2  # Director Variables');
    console.log('');
    console.log('🔧 TO GRAB PRIORITY TASKS:');
    console.log('   node src/grab-tasks.js <your-agent-id> <count> --priority-only');
    console.log('   (Now includes Epic 8 tasks as highest priority)');
    console.log('');
    console.log('🔍 EPIC 8 IS PRIORITIZED BY:');
    console.log('   - task.epic === "Epic 8" (automatic highest priority)');
    console.log('   - task.tags.includes("epic-8") or task.tags.includes("wild-construct")');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to show priority tasks:', error);
    throw error;
  }
}

function getEpic8StoryTitle(story) {
  const storyTitles = {
    8.1: 'Professional Interface Polish - Cinema 4D/Substance Designer quality UI',
    8.2: 'Director-Friendly Variable System - Natural language templates with {variable} syntax',
    8.3: 'Visual Weight Controls - Intuitive randomization without numerical complexity',
    8.4: 'Progressive Disclosure Architecture - Basic/Advanced/Debug complexity layers',
    8.5: 'Real-Time Multi-Seed Preview - Sub-second generation with variance analysis',
    8.6: 'Structured Pipeline Export - VFX-ready JSON with ControlNet compatibility',
    8.7: 'Collaboration & Documentation Tools - Team workflow and template library',
    8.8: 'Historical Data Integration Foundation - UTDG integration for authentic settings',
  };
  return storyTitles[story] || `Epic 8 Story ${story}`;
}

function getPriorityIcon(priority) {
  switch (priority) {
    case 'high':
      return '🔥';
    case 'medium':
      return '⚡';
    case 'low':
      return '💡';
    default:
      return '❓';
  }
}

function getStatusIcon(status) {
  const icons = {
    TODO: '📋',
    IN_PROGRESS: '⚠️',
    REVIEW: '👁️',
    DONE: '✅',
    BLOCKED: '🚫',
  };
  return icons[status] || '❓';
}

function calculateTotalTime(tasks) {
  let totalHours = 0;

  tasks.forEach(task => {
    const estimate = task.estimate;
    if (estimate && typeof estimate === 'string') {
      const hours = parseFloat(estimate.replace(/[^\d.]/g, ''));
      if (!isNaN(hours)) {
        totalHours += hours;
      }
    }
  });

  const days = Math.ceil(totalHours / 8); // Assuming 8-hour days
  return `${totalHours} hours (~${days} working days)`;
}

// Run if called directly
if (require.main === module) {
  showPriorityTasks().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { showPriorityTasks };
