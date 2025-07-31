#!/usr/bin/env node
'use strict';
// src/scripts/initSystem.ts
// Initialize the system with basic data
Object.defineProperty(exports, '__esModule', { value: true });
const events_1 = require('../core/events');
const state_1 = require('../core/state');
console.log('🚀 Initializing PromptScape coordination system...');
// Create initial state
const initialState = (0, state_1.emptyState)();
// Add some initial goals
const goals = [
  {
    id: 'G-1',
    title: 'Launch MVP',
    why: 'Get initial version to users for feedback',
    success_metrics: {
      users: 100,
      satisfaction: 4.0,
    },
    status: 'ACTIVE',
  },
  {
    id: 'G-2',
    title: 'Performance Optimization',
    why: 'Ensure smooth experience for large graphs',
    success_metrics: {
      load_time: '<2s',
      fps: 60,
    },
    status: 'ACTIVE',
  },
];
initialState.product_goals = goals;
// Create initial snapshot event
const snapshotEvent = (0, events_1.append)({
  type: 'INIT_SNAPSHOT',
  actor: 'system',
  payload: { state: initialState },
  version: 1,
});
console.log(`✅ Created initial snapshot event (ID: ${snapshotEvent.id})`);
// Start in PLAN phase
const phaseEvent = (0, events_1.append)({
  type: 'PHASE_CHANGED',
  actor: 'system',
  payload: { phase: 'PLAN' },
  version: 1,
});
console.log(`✅ Set initial phase to PLAN (ID: ${phaseEvent.id})`);
// Save initial state
(0, state_1.saveState)(initialState);
console.log('✅ System initialized successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Run the gateway: npm run gateway');
console.log('2. Run agents: npm run agent:po, npm run agent:sm, etc.');
console.log('3. Use Discord slash commands to interact');
console.log('');
console.log('Available slash commands:');
console.log('  /po-story-add - Create a new story');
console.log('  /sm-task-slice - Create tasks from a story');
console.log('  /sm-assign - Assign a task to a developer');
console.log('  /dev-start - Start working on a task');
console.log('  /dev-review - Submit task for review');
console.log('  /po-accept - Accept a reviewed task');
console.log('  /sm-phase - Change sprint phase');
//# sourceMappingURL=initSystem.js.map
