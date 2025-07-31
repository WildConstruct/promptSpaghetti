#!/usr/bin/env node
'use strict';
// src/scripts/status.ts
// Check current system status
Object.defineProperty(exports, '__esModule', { value: true });
const state_1 = require('../core/state');
const events_1 = require('../core/events');
console.log(`
╔════════════════════════════════════════════╗
║       PromptScape System Status            ║
╚════════════════════════════════════════════╝
`);
// Load current state
const state = (0, state_1.loadState)();
const stats = (0, state_1.getStateStats)(state);
const eventCount = (0, events_1.getEventCount)();
// Basic info
console.log('📊 **System Overview**');
console.log(`   Current Phase: ${state.meta.phase}`);
console.log(`   Current Cycle: ${state.meta.cycle}`);
console.log(`   Last Updated: ${new Date(state.meta.updated).toLocaleString()}`);
console.log(`   Total Events: ${eventCount}`);
console.log('');
// Work items
console.log('📋 **Work Items**');
console.log(
  `   Goals: ${state.product_goals.length} (${state.product_goals.filter(g => g.status === 'ACTIVE').length} active)`
);
console.log(`   Stories: ${state.stories.length}`);
console.log(`   Tasks: ${stats.totalTasks}`);
console.log('');
// Task breakdown
console.log('📈 **Task Status**');
Object.entries(stats.tasksByState).forEach(([state, count]) => {
  const emoji =
    {
      UNASSIGNED: '⚪',
      IN_PROGRESS: '🔵',
      REVIEW: '🟡',
      DONE: '🟢',
      BLOCKED: '🔴',
      STUCK: '🟠',
    }[state] || '⚫';
  console.log(`   ${emoji} ${state}: ${count}`);
});
console.log('');
// Developer assignments
console.log('👥 **Developer Assignments**');
Object.entries(stats.assignmentsByDev).forEach(([dev, count]) => {
  console.log(`   ${dev}: ${count} tasks`);
});
console.log('');
// Recent events
console.log('📅 **Recent Events**');
const recentEvents = (0, events_1.fetchLatest)(5);
recentEvents.forEach(event => {
  const time = new Date(event.ts).toLocaleTimeString();
  console.log(`   [${time}] ${event.type} by ${event.actor}`);
});
console.log('');
// Configuration
console.log('⚙️  **Configuration**');
console.log(`   WIP Limit: ${state.config.wip_limit_per_dev} tasks/dev`);
console.log(`   Timeout: ${state.config.timeout_sec}s`);
console.log('');
// Metrics
if (state.metrics.cycle_history.length > 0) {
  console.log('📊 **Cycle Metrics**');
  const latest = state.metrics.cycle_history[state.metrics.cycle_history.length - 1];
  console.log(`   Last Cycle: #${latest.cycle}`);
  console.log(`   Lead Time: ${latest.lead_time_avg}h avg`);
  console.log(`   Throughput: ${latest.throughput} tasks`);
  console.log(`   Blockers: ${latest.blockers}`);
  console.log(`   Rejected: ${latest.rejected}`);
}
//# sourceMappingURL=status.js.map
