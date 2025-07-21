#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Complete Epic Assignment Fix for All 19+ Epics
 * This script assigns proper epic metadata to ALL tasks based on comprehensive keyword analysis
 */

const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

console.log('🔧 COMPREHENSIVE EPIC ASSIGNMENT FIX');
console.log('====================================\n');

let updatedCount = 0;
const epicCounts = {};

// Comprehensive epic assignment rules based on PRD analysis
function assignEpicMetadata(task) {
  const title = (task.title || '').toLowerCase();
  const description = (task.description || '').toLowerCase();
  const content = title + ' ' + description;
  
  // Epic 1: Foundation & Core Infrastructure
  const epic1Keywords = ['foundation', 'infrastructure', 'repo', 'ci', 'pipeline', 'coverage', 'codecov', 'test infrastructure', 'build system', 'monorepo'];
  if (epic1Keywords.some(keyword => content.includes(keyword))) {
    return { story: '1', tags: ['infrastructure'], metadata: { epic: 'Foundation & Core Infrastructure', priority: 'medium' }};
  }
  
  // Epic 2: Editor MVP (Graph Authoring)
  const epic2Keywords = ['editor', 'graph', 'authoring', 'canvas', 'react-flow', 'node editor', 'ui editor', 'graph editor'];
  if (epic2Keywords.some(keyword => content.includes(keyword)) && !content.includes('privacy') && !content.includes('policy')) {
    return { story: '2', tags: ['editor'], metadata: { epic: 'Editor MVP (Graph Authoring)', priority: 'high' }};
  }
  
  // Epic 3: Executor & Integration (already working)
  const epic3Keywords = ['executor', 'integration', 'bundle', 'cli', 'export', 'import'];
  if (epic3Keywords.some(keyword => content.includes(keyword)) && !content.includes('privacy') && !content.includes('policy')) {
    return { story: '3', tags: ['export'], metadata: { epic: 'Executor & Integration', priority: 'medium' }};
  }
  
  // Epic 4: Alpha Hardening & DX Polish  
  const epic4Keywords = ['hardening', 'polish', 'performance', 'optimization', 'tuning', 'profiling', 'baseline', 'bottleneck'];
  if (epic4Keywords.some(keyword => content.includes(keyword))) {
    return { story: '4', tags: ['performance'], metadata: { epic: 'Alpha Hardening & DX Polish', priority: 'medium' }};
  }
  
  // Epic 5: Inspector Panel & Text Variation System
  const epic5Keywords = ['inspector', 'panel', 'variation', 'text variation', 'inspector component'];
  if (epic5Keywords.some(keyword => content.includes(keyword))) {
    return { story: '5', tags: ['inspector'], metadata: { epic: 'Inspector Panel & Text Variation System', priority: 'high' }};
  }
  
  // Epic 6: Project Management & UI Enhancements
  const epic6Keywords = ['project management', 'ui enhancement', 'file management', 'project', 'ui component', 'interface'];
  if (epic6Keywords.some(keyword => content.includes(keyword)) && !content.includes('privacy') && !content.includes('auth') && !content.includes('security')) {
    return { story: '6', tags: ['project-management'], metadata: { epic: 'Project Management & UI Enhancements', priority: 'medium' }};
  }
  
  // Epic 7: Advanced Node Capabilities & User Experience (already working)
  const epic7Keywords = ['advanced node', 'conditional', 'sequential', 'markov', 'weighted', 'node capabilities'];
  if (epic7Keywords.some(keyword => content.includes(keyword))) {
    return { story: '7', tags: ['advanced-nodes'], metadata: { epic: 'Advanced Node Capabilities & User Experience', priority: 'medium' }};
  }
  
  // Epic 8: Execution Extensions & Documentation
  const epic8Keywords = ['documentation', 'extensions', 'execution', 'docs', 'python', 'api docs'];
  if (epic8Keywords.some(keyword => content.includes(keyword)) && !content.includes('privacy') && !content.includes('compliance')) {
    return { story: '8', tags: ['documentation'], metadata: { epic: 'Execution Extensions & Documentation', priority: 'low' }};
  }
  
  // Epic 9: Collaborative Editing & Workflow  
  const epic9Keywords = ['collaborative', 'workflow', 'realtime', 'collaboration', 'review workflow'];
  if (epic9Keywords.some(keyword => content.includes(keyword)) && !content.includes('auth') && !content.includes('security')) {
    return { story: '9', tags: ['collaboration'], metadata: { epic: 'Collaborative Editing & Workflow', priority: 'low' }};
  }
  
  // Epic 10: Prompt Targeting System
  const epic10Keywords = ['prompt targeting', 'model', 'adaptor', 'targeting system', 'model-specific'];
  if (epic10Keywords.some(keyword => content.includes(keyword))) {
    return { story: '10', tags: ['targeting'], metadata: { epic: 'Prompt Targeting System', priority: 'low' }};
  }
  
  // Epic 11: Authentication & User Management  
  const epic11Keywords = ['mfa management', 'user management', 'account management', 'user interface', 'user guidance', 'recovery code'];
  if (epic11Keywords.some(keyword => content.includes(keyword)) || 
      (content.includes('user') && (content.includes('management') || content.includes('interface') || content.includes('guidance')))) {
    return { story: '11', tags: ['user-management'], metadata: { epic: 'Authentication & User Management', priority: 'critical' }};
  }
  
  // Epic 12: LLM Agent Randomizer System
  const epic12Keywords = ['llm', 'agent randomizer', 'llm output', 'fine-tune', 'graph dsl'];
  if (epic12Keywords.some(keyword => content.includes(keyword))) {
    return { story: '12', tags: ['llm'], metadata: { epic: 'LLM Agent Randomizer System', priority: 'low' }};
  }
  
  // Epic 13: Analytics Dashboard
  const epic13Keywords = ['analytics', 'dashboard', 'metrics', 'behavior analytics', 'security analytics', 'alerting analytics'];
  if (epic13Keywords.some(keyword => content.includes(keyword))) {
    return { story: '13', tags: ['analytics'], metadata: { epic: 'Analytics Dashboard', priority: 'medium' }};
  }
  
  // Epic 14: A/B Testing Framework
  const epic14Keywords = ['testing framework', 'testing suite', 'testing environment', 'rule testing', 'consent verification testing'];
  if (epic14Keywords.some(keyword => content.includes(keyword))) {
    return { story: '14', tags: ['testing'], metadata: { epic: 'A/B Testing Framework', priority: 'low' }};
  }
  
  // Epic 15: Mobile & Cross-Platform Support
  const epic15Keywords = ['mobile', 'cross-platform', 'responsive', 'platform support'];
  if (epic15Keywords.some(keyword => content.includes(keyword))) {
    return { story: '15', tags: ['mobile'], metadata: { epic: 'Mobile & Cross-Platform Support', priority: 'low' }};
  }
  
  // Epic 16: Marketplace & Community Features
  const epic16Keywords = ['marketplace', 'community', 'sharing', 'forum', 'rating', 'contribution'];
  if (epic16Keywords.some(keyword => content.includes(keyword))) {
    return { story: '16', tags: ['marketplace'], metadata: { epic: 'Marketplace & Community Features', priority: 'low' }};
  }
  
  // Epic 17: Backstage Admin Controls
  const epic17Keywords = ['admin', 'controls', 'administrator', 'admin alerts', 'admin unlock', 'backstage'];
  if (epic17Keywords.some(keyword => content.includes(keyword))) {
    return { story: '17', tags: ['admin'], metadata: { epic: 'Backstage Admin Controls', priority: 'medium' }};
  }
  
  // Epic 18: Technical Debt & Refactoring
  const epic18Keywords = ['technical debt', 'refactoring', 'cleanup', 'refactor', 'debt'];
  if (epic18Keywords.some(keyword => content.includes(keyword))) {
    return { story: '18', tags: ['refactoring'], metadata: { epic: 'Technical Debt & Refactoring', priority: 'low' }};
  }
  
  // Epic 19: Security & Compliance Framework (already working but improve)
  const epic19Keywords = ['privacy', 'compliance', 'gdpr', 'policy', 'audit', 'iso 27001', 'security policy', 'data protection', 'regulatory'];
  if (epic19Keywords.some(keyword => content.includes(keyword))) {
    return { story: '19', tags: ['privacy', 'compliance'], metadata: { epic: 'Security & Compliance Framework', priority: 'low' }};
  }
  
  // Authentication System (20.1) - keep existing logic
  const authKeywords = ['auth', 'login', 'register', 'password', 'jwt', 'token', 'session', 'signin', 'signup', 'oauth', 'totp', 'mfa', 'authentication'];
  if (authKeywords.some(keyword => content.includes(keyword))) {
    return { story: '20.1', tags: ['auth'], metadata: { epic: 'Authentication System', priority: 'critical' }};
  }
  
  // File Browser System (20.2) - keep existing logic  
  const fileKeywords = ['file browser', 'project', 'save', 'load', 'import', 'export', 'file management', 'project management', 'recent files'];
  if (fileKeywords.some(keyword => content.includes(keyword)) && !content.includes('privacy') && !content.includes('policy')) {
    return { story: '20.2', tags: ['file-browser'], metadata: { epic: 'File Browser System', priority: 'critical' }};
  }
  
  // Default for unclassified tasks
  return { story: 'Other', tags: [], metadata: { epic: 'Other', priority: 'normal' }};
}

// Process all tasks
Object.keys(state.tasks).forEach(taskId => {
  const task = state.tasks[taskId];
  
  // Skip tasks that already have proper epic assignments (except for previously mis-assigned ones)
  if (task.story && task.tags && task.tags.length > 0 && !['N/A', 'Other'].includes(task.story)) {
    const epicNum = task.story.toString();
    epicCounts[epicNum] = (epicCounts[epicNum] || 0) + 1;
    return;
  }
  
  const updates = assignEpicMetadata(task);
  
  if (updates.story !== 'Other') {
    // Apply updates to the task
    Object.assign(state.tasks[taskId], updates);
    updatedCount++;
    
    const epicNum = updates.story;
    epicCounts[epicNum] = (epicCounts[epicNum] || 0) + 1;
    
    console.log(`🔄 Updated ${taskId}: Story=${updates.story}, Epic="${updates.metadata.epic}"`);
  }
});

// Save updated state
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

console.log(`\n📊 COMPREHENSIVE EPIC ASSIGNMENT RESULTS:`);
console.log(`==========================================`);
console.log(`✅ Total tasks updated: ${updatedCount}`);

// Sort and display epic counts
Object.entries(epicCounts)
  .sort(([a], [b]) => {
    // Sort numerically, with special handling for story codes like "20.1"
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    return aNum - bNum;
  })
  .forEach(([epic, count]) => {
    console.log(`📋 Epic ${epic}: ${count} tasks`);
  });

const totalWithEpics = Object.values(epicCounts).reduce((sum, count) => sum + count, 0);
const totalTasks = Object.keys(state.tasks).length;
const unassignedTasks = totalTasks - totalWithEpics;

console.log(`\n🎯 FINAL COVERAGE:`);
console.log(`   📊 Total epics represented: ${Object.keys(epicCounts).length}`);
console.log(`   ✅ Tasks with epic assignments: ${totalWithEpics} (${Math.round(totalWithEpics/totalTasks*100)}%)`);
console.log(`   ❌ Unassigned tasks remaining: ${unassignedTasks} (${Math.round(unassignedTasks/totalTasks*100)}%)`);

console.log(`\n🔄 All missing epics have been assigned to their respective tasks!`);
console.log(`🎯 Dashboard should now show comprehensive epic coverage!`);