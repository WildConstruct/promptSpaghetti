'use strict';
// src/watchers/stuckWatcher.ts
// Monitor for stuck tasks and emit alerts
Object.defineProperty(exports, '__esModule', { value: true });
exports.startStuckWatcher = startStuckWatcher;
const state_1 = require('../core/state');
const events_1 = require('../core/events');
const CHECK_INTERVAL_MS = 60000; // Check every minute
/**
 * Start the stuck task watcher
 */
function startStuckWatcher() {
  console.log('👀 Starting stuck task watcher...');
  setInterval(checkForStuckTasks, CHECK_INTERVAL_MS);
  // Run initial check
  checkForStuckTasks();
}
/**
 * Check for tasks that have been idle too long
 */
function checkForStuckTasks() {
  try {
    const state = (0, state_1.loadState)();
    const now = Date.now();
    Object.values(state.tasks).forEach(task => {
      if (task.state === 'IN_PROGRESS') {
        const lastUpdate = new Date(task.updated).getTime();
        const idleTime = now - lastUpdate;
        // Check against configured timeout
        if (idleTime > state.config.timeout_sec * 1000) {
          console.log(`⚠️ Task ${task.id} stuck - idle for ${Math.floor(idleTime / 1000)}s`);
          // Emit stuck event
          (0, events_1.append)({
            type: 'TASK_STUCK',
            actor: 'system_watcher',
            payload: {
              task_id: task.id,
              reason: `Idle for ${Math.floor(idleTime / 1000)} seconds (timeout: ${state.config.timeout_sec}s)`,
            },
            version: 1,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error in stuck watcher:', error);
  }
}
// Allow running as standalone script
if (require.main === module) {
  startStuckWatcher();
}
//# sourceMappingURL=stuckWatcher.js.map
