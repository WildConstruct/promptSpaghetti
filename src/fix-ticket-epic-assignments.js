#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fix Epic Assignments for All Tickets
 * This script analyzes existing tickets and assigns proper epic metadata
 */

const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

console.log('🔧 FIXING TICKET EPIC ASSIGNMENTS');
console.log('==================================\n');

let updatedCount = 0;
let authCount = 0;
let fileCount = 0;
let epic19Count = 0;
let otherCount = 0;

// Epic assignment rules based on title analysis
function assignEpicMetadata(task) {
  const title = (task.title || '').toLowerCase();
  const description = (task.description || '').toLowerCase();
  const content = title + ' ' + description;
  
  let updates = {};
  
  // Authentication (Story 20.1) detection
  const authKeywords = ['auth', 'login', 'register', 'password', 'jwt', 'token', 'session', 
                       'signin', 'signup', 'oauth', 'totp', 'mfa', 'authentication', 
                       'user management', 'account', 'credential'];
  
  if (authKeywords.some(keyword => content.includes(keyword))) {
    updates.story = '20.1';
    updates.tags = ['auth'];
    if (!updates.metadata) updates.metadata = {};
    updates.metadata.epic = 'Authentication System';
    updates.metadata.priority = 'critical';
    authCount++;
    return updates;
  }
  
  // File Browser (Story 20.2) detection  
  const fileKeywords = ['file browser', 'project', 'save', 'load', 'import', 'export',
                       'file management', 'project management', 'recent files', 
                       'file preview', 'drag drop', 'upload', 'download'];
  
  if (fileKeywords.some(keyword => content.includes(keyword)) && 
      !content.includes('privacy') && !content.includes('policy')) {
    updates.story = '20.2';
    updates.tags = ['file-browser'];
    if (!updates.metadata) updates.metadata = {};
    updates.metadata.epic = 'File Browser System';
    updates.metadata.priority = 'critical';
    fileCount++;
    return updates;
  }
  
  // Epic 19 (Privacy/Compliance) detection
  const privacyKeywords = ['privacy', 'compliance', 'gdpr', 'policy', 'audit', 
                          'iso 27001', 'security policy', 'data protection',
                          'privacy policy', 'compliance framework', 'regulatory'];
  
  if (privacyKeywords.some(keyword => content.includes(keyword))) {
    updates.story = '19';
    updates.tags = ['privacy', 'compliance'];
    if (!updates.metadata) updates.metadata = {};
    updates.metadata.epic = 'Privacy & Compliance Framework';
    updates.metadata.priority = 'low'; // Deprioritized per IMMEDIATE-PRIORITIES.md
    epic19Count++;
    return updates;
  }
  
  // Epic 7 (Advanced Nodes) detection
  const advancedKeywords = ['weighted', 'conditional', 'sequential', 'markov', 
                           'advanced node', 'runtime node', 'node type'];
  
  if (advancedKeywords.some(keyword => content.includes(keyword))) {
    updates.story = '7';
    updates.tags = ['advanced-nodes'];
    if (!updates.metadata) updates.metadata = {};
    updates.metadata.epic = 'Advanced Node Capabilities';
    updates.metadata.priority = 'medium';
    otherCount++;
    return updates;
  }
  
  // Epic 3 (Export System) detection
  const exportKeywords = ['export', 'generator bundle', 'png', 'pdf', 'yaml', 'xml'];
  
  if (exportKeywords.some(keyword => content.includes(keyword)) && 
      !content.includes('privacy')) {
    updates.story = '3';
    updates.tags = ['export'];
    if (!updates.metadata) updates.metadata = {};
    updates.metadata.epic = 'Export System';
    updates.metadata.priority = 'medium';
    otherCount++;
    return updates;
  }
  
  // Default for unclassified tasks
  if (!updates.metadata) updates.metadata = {};
  updates.metadata.epic = 'Other';
  updates.metadata.priority = 'normal';
  otherCount++;
  
  return updates;
}

// Process all tasks
Object.keys(state.tasks).forEach(taskId => {
  const task = state.tasks[taskId];
  
  // Skip tasks that already have proper epic assignments
  if (task.story && task.tags && task.tags.length > 0) {
    console.log(`✅ Skipping already assigned: ${taskId} (Story: ${task.story})`);
    return;
  }
  
  const updates = assignEpicMetadata(task);
  
  if (Object.keys(updates).length > 0) {
    // Apply updates to the task
    Object.assign(state.tasks[taskId], updates);
    updatedCount++;
    
    const story = updates.story || 'N/A';
    const epic = updates.metadata?.epic || 'Unknown';
    console.log(`🔄 Updated ${taskId}: Story=${story}, Epic="${epic}"`);
  }
});

// Save updated state
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

console.log(`\n📊 EPIC ASSIGNMENT RESULTS:`);
console.log(`================================`);
console.log(`✅ Total tasks updated: ${updatedCount}`);
console.log(`🔐 Authentication (20.1): ${authCount} tasks`);
console.log(`📁 File Browser (20.2): ${fileCount} tasks`);
console.log(`🚫 Epic 19 (Privacy): ${epic19Count} tasks`);
console.log(`📋 Other Epics: ${otherCount} tasks`);

console.log(`\n🎯 PRIORITY DISTRIBUTION:`);
const totalTasks = Object.keys(state.tasks).length;
console.log(`   🔐 Auth Focus: ${authCount} (${Math.round(authCount/totalTasks*100)}%)`);
console.log(`   📁 File Focus: ${fileCount} (${Math.round(fileCount/totalTasks*100)}%)`);
console.log(`   🚫 Epic 19: ${epic19Count} (${Math.round(epic19Count/totalTasks*100)}%) - should be <20%`);
console.log(`   📋 Other: ${otherCount} (${Math.round(otherCount/totalTasks*100)}%)`);

if ((authCount + fileCount) > epic19Count) {
  console.log(`\n✅ SUCCESS: Priority epics (${authCount + fileCount}) > Epic 19 (${epic19Count})`);
} else {
  console.log(`\n⚠️  WARNING: Epic 19 still dominates priority epics`);
}

console.log(`\n🔄 Epic assignments have been saved to ${statePath}`);
console.log(`🎯 Dashboard should now show proper epic categorization!`);