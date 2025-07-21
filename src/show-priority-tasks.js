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
    
    // Filter priority tasks created by our automation
    const priorityTasks = Object.values(state.tasks).filter(task => 
      task.metadata?.source === 'priority-automation'
    );
    
    if (priorityTasks.length === 0) {
      console.log('❌ No priority tasks found. Run: node src/create-priority-tickets.js');
      return;
    }
    
    // Group by story
    const authTasks = priorityTasks.filter(task => 
      task.story && task.story.includes('20.1')
    ).sort((a, b) => {
      // Sort high priority first, then by creation time
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }
      return new Date(a.created) - new Date(b.created);
    });
    
    const fileTasks = priorityTasks.filter(task => 
      task.story && task.story.includes('20.2')
    ).sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1;
      }
      return new Date(a.created) - new Date(b.created);
    });
    
    console.log('=' * 70);
    console.log('🔐 PRIORITY 1: AUTHENTICATION TASKS (Story 20.1)');
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
    const availableAuthTasks = authTasks.filter(t => t.state === 'TODO' && t.assignee === 'Unassigned');
    const availableFileTasks = fileTasks.filter(t => t.state === 'TODO' && t.assignee === 'Unassigned');
    const totalAvailable = availableAuthTasks.length + availableFileTasks.length;
    
    console.log('📊 SUMMARY STATISTICS');
    console.log('=' * 70);
    console.log(`🔓 Available Tasks: ${totalAvailable} (${availableAuthTasks.length} auth + ${availableFileTasks.length} file)`);
    console.log(`🔐 Authentication Tasks: ${authTasks.length} total`);
    console.log(`📁 File Browser Tasks: ${fileTasks.length} total`);
    console.log(`⏱️  Total Estimated Time: ${calculateTotalTime(priorityTasks)}`);
    console.log('');
    
    // Instructions for agents
    console.log('🤖 AGENT INSTRUCTIONS');
    console.log('=' * 70);
    console.log('1. 🎯 FOCUS: Only work on these priority tasks (NOT Epic 19 privacy tasks)');
    console.log('2. 🔐 Start with Authentication tasks (Story 20.1) - highest business impact');
    console.log('3. 📁 Then move to File Browser tasks (Story 20.2) - user retention');
    console.log('4. 🚫 AVOID: Epic 19 privacy/compliance tasks (deprioritized per PM)');
    console.log('');
    console.log('🔧 TO GRAB TASKS:');
    console.log('   node src/grab-tasks.js <your-agent-id> <number-of-tasks>');
    console.log('   Note: May need script modification to prioritize these tasks');
    console.log('');
    console.log('🔍 TO GRAB SPECIFIC TASK:');
    console.log('   Modify grab-tasks.js to filter by:');
    console.log('   - task.metadata?.source === "priority-automation"');
    console.log('   - task.tags.includes("auth") or task.tags.includes("file-browser")');
    console.log('');
    
  } catch (error) {
    console.error('❌ Failed to show priority tasks:', error);
    throw error;
  }
}

function getStatusIcon(status) {
  const icons = {
    'TODO': '📋',
    'IN_PROGRESS': '⚠️',
    'REVIEW': '👁️',
    'DONE': '✅',
    'BLOCKED': '🚫'
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