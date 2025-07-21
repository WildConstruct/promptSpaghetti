#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 MISSING EPIC ANALYSIS');
console.log('=========================\n');

// Expected epics from PRD
const expectedEpics = [
  { number: '1', name: 'Foundation & Core Infrastructure', keywords: ['foundation', 'infrastructure', 'repo', 'ci', 'pipeline'] },
  { number: '2', name: 'Editor MVP (Graph Authoring)', keywords: ['editor', 'graph', 'authoring', 'canvas', 'react-flow'] },
  { number: '3', name: 'Executor & Integration', keywords: ['executor', 'integration', 'bundle', 'cli'] },
  { number: '4', name: 'Alpha Hardening & DX Polish', keywords: ['hardening', 'polish', 'performance', 'docs'] },
  { number: '5', name: 'Inspector Panel & Text Variation System', keywords: ['inspector', 'panel', 'variation', 'text'] },
  { number: '6', name: 'Project Management & UI Enhancements', keywords: ['project', 'management', 'ui', 'file'] },
  { number: '7', name: 'Advanced Node Capabilities & User Experience', keywords: ['advanced', 'node', 'capabilities', 'conditional', 'sequential', 'markov', 'weighted'] },
  { number: '8', name: 'Execution Extensions & Documentation', keywords: ['execution', 'extensions', 'documentation', 'python'] },
  { number: '9', name: 'Collaborative Editing & Workflow', keywords: ['collaborative', 'editing', 'workflow', 'realtime'] },
  { number: '10', name: 'Prompt Targeting System', keywords: ['prompt', 'targeting', 'model', 'adaptor'] },
  { number: '11', name: 'Authentication & User Management', keywords: ['authentication', 'user', 'management', 'login', 'register', 'oauth'] },
  { number: '12', name: 'LLM Agent Randomizer System', keywords: ['llm', 'agent', 'randomizer'] },
  { number: '13', name: 'Analytics Dashboard', keywords: ['analytics', 'dashboard', 'metrics'] },
  { number: '14', name: 'A/B Testing Framework', keywords: ['ab testing', 'testing', 'experiment'] },
  { number: '15', name: 'Mobile & Cross-Platform Support', keywords: ['mobile', 'cross-platform', 'responsive'] },
  { number: '16', name: 'Marketplace & Community Features', keywords: ['marketplace', 'community', 'sharing'] },
  { number: '17', name: 'Backstage Admin Controls', keywords: ['backstage', 'admin', 'controls'] },
  { number: '18', name: 'Technical Debt & Refactoring', keywords: ['technical debt', 'refactoring', 'cleanup'] },
  { number: '19', name: 'Security & Compliance Framework', keywords: ['security', 'compliance', 'gdpr', 'audit', 'privacy', 'policy', 'iso 27001'] }
];

// Load task data
const statePath = path.join(__dirname, 'data', 'state.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const tasks = Object.values(state.tasks);

console.log(`📋 Expected Epics from PRD: ${expectedEpics.length}`);
console.log(`🎯 Current tasks in system: ${tasks.length}\n`);

// Check which epics have tasks assigned
const foundEpics = new Set();
const epicMatches = {};

tasks.forEach(task => {
  if (task.story && task.story !== 'N/A' && task.story !== 'Other') {
    foundEpics.add(task.story);
  }
  
  // Check title and description against expected epic keywords
  const content = ((task.title || '') + ' ' + (task.description || '')).toLowerCase();
  
  expectedEpics.forEach(epic => {
    const matches = epic.keywords.filter(keyword => content.includes(keyword));
    if (matches.length > 0) {
      if (!epicMatches[epic.number]) {
        epicMatches[epic.number] = {
          epic: epic.name,
          tasks: [],
          matchedKeywords: new Set()
        };
      }
      epicMatches[epic.number].tasks.push({
        id: task.id,
        title: (task.title || '').substring(0, 50) + '...',
        matches: matches,
        currentStory: task.story
      });
      matches.forEach(match => epicMatches[epic.number].matchedKeywords.add(match));
    }
  });
});

console.log('📊 EPIC COVERAGE ANALYSIS:\n');

expectedEpics.forEach(epic => {
  const hasStoryAssignments = Array.from(foundEpics).includes(epic.number);
  const hasContentMatches = epicMatches[epic.number];
  const matchCount = hasContentMatches ? epicMatches[epic.number].tasks.length : 0;
  
  console.log(`Epic ${epic.number}: ${epic.name}`);
  console.log(`   📋 Story assignments: ${hasStoryAssignments ? '✅ YES' : '❌ NO'}`);
  console.log(`   🔍 Content matches: ${matchCount} tasks`);
  
  if (hasContentMatches && matchCount > 0) {
    console.log(`   🎯 Keywords found: ${Array.from(epicMatches[epic.number].matchedKeywords).join(', ')}`);
    console.log(`   📄 Sample tasks:`);
    epicMatches[epic.number].tasks.slice(0, 3).forEach(task => {
      console.log(`      • ${task.id}: ${task.title} (story: ${task.currentStory || 'none'})`);
    });
  }
  console.log('');
});

// Find epics with content but no story assignments
console.log('🚨 EPICS WITH UNASSIGNED TASKS:\n');

let unassignedCount = 0;
expectedEpics.forEach(epic => {
  const hasStoryAssignments = Array.from(foundEpics).includes(epic.number);
  const hasContentMatches = epicMatches[epic.number];
  
  if (!hasStoryAssignments && hasContentMatches) {
    console.log(`❌ Epic ${epic.number} (${epic.name}):`);
    console.log(`   ${hasContentMatches.tasks.length} tasks found but not assigned to story ${epic.number}`);
    hasContentMatches.tasks.slice(0, 5).forEach(task => {
      console.log(`   • ${task.id}: ${task.title}`);
    });
    console.log('');
    unassignedCount++;
  }
});

console.log('📈 SUMMARY:');
console.log(`   Expected epics: ${expectedEpics.length}`);
console.log(`   Epics with story assignments: ${foundEpics.size}`);
console.log(`   Epics with content matches: ${Object.keys(epicMatches).length}`);
console.log(`   Epics missing assignments: ${unassignedCount}`);

if (unassignedCount > 0) {
  console.log(`\n🔧 RECOMMENDATION:`);
  console.log(`   Run the epic assignment fix again with expanded keyword matching`);
  console.log(`   to properly assign these ${unassignedCount} missing epics.`);
}