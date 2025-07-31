#!/usr/bin/env node
'use strict';
// src/scripts/migrateSnapshot.ts
// Rebuild state from event log
Object.defineProperty(exports, '__esModule', { value: true });
const events_1 = require('../core/events');
const reducer_1 = require('../core/reducer');
const state_1 = require('../core/state');
console.log('🔄 Starting snapshot migration...');
let state = (0, state_1.emptyState)();
let lastId = 0;
let totalEvents = 0;
const startTime = Date.now();
let hasMoreEvents = true;
while (hasMoreEvents) {
  const batch = (0, events_1.fetchSince)(lastId, 500);
  if (!batch.length) {
    hasMoreEvents = false;
    break;
  }
  batch.forEach(e => {
    try {
      state = (0, reducer_1.reduce)(state, e);
      lastId = e.id;
      totalEvents++;
    } catch (error) {
      console.error(`Error processing event ${e.id}:`, error);
      console.error('Event:', JSON.stringify(e, null, 2));
    }
  });
  console.log(`Processed ${totalEvents} events...`);
}
// Save the rebuilt state
(0, state_1.saveState)(state);
const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);
console.log(`✅ Snapshot rebuilt successfully`);
console.log(`   Total events: ${totalEvents}`);
console.log(`   Last event ID: ${lastId}`);
console.log(`   Duration: ${duration}s`);
console.log(`   State hash: ${(0, state_1.hashState)(state)}`);
console.log(`   Current phase: ${state.meta.phase}`);
console.log(`   Current cycle: ${state.meta.cycle}`);
//# sourceMappingURL=migrateSnapshot.js.map
