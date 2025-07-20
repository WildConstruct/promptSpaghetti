"use strict";
// src/watchers/metricsCollector.ts
// Collect and publish cycle metrics
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMetricsCollector = startMetricsCollector;
const events_1 = require("../core/events");
const state_1 = require("../core/state");
let lastEventId = 0;
/**
 * Start the metrics collector
 */
function startMetricsCollector() {
    console.log("📊 Starting metrics collector...");
    lastEventId = (0, events_1.getLatestEventId)();
    setInterval(checkForMetrics, 30000); // Check every 30 seconds
}
/**
 * Check if we need to publish metrics
 */
async function checkForMetrics() {
    try {
        const events = (0, events_1.fetchSince)(lastEventId, 100);
        if (events.length === 0)
            return;
        const state = (0, state_1.loadState)();
        // Look for phase changes to INTEGRATE
        const phaseChanges = events.filter(e => e.type === 'PHASE_CHANGED' && e.payload.phase === 'INTEGRATE');
        if (phaseChanges.length > 0) {
            // Calculate metrics for the current cycle
            const metrics = calculateCycleMetrics(events, state);
            // Publish metrics
            (0, events_1.append)({
                type: 'METRICS_PUBLISHED',
                actor: 'metrics_collector',
                payload: { metric: metrics },
                version: 1
            });
            console.log(`📊 Published metrics for cycle ${metrics.cycle}`);
        }
        // Update cursor
        lastEventId = events[events.length - 1].id;
    }
    catch (error) {
        console.error("Error in metrics collector:", error);
    }
}
/**
 * Calculate metrics for the current cycle
 */
function calculateCycleMetrics(recentEvents, state) {
    const cycle = state.meta.cycle;
    // Get all tasks in this cycle
    const cycleTasks = Object.values(state.tasks);
    // Calculate lead times for completed tasks
    const completedTasks = cycleTasks.filter(t => t.state === 'DONE');
    const leadTimes = completedTasks.map(t => {
        const created = new Date(t.created).getTime();
        const updated = new Date(t.updated).getTime();
        return (updated - created) / (1000 * 60 * 60); // Convert to hours
    });
    const avgLeadTime = leadTimes.length > 0
        ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
        : 0;
    // Count blockers and rejections
    const blockers = recentEvents.filter(e => e.type === 'TASK_STUCK').length;
    const rejected = recentEvents.filter(e => e.type === 'TASK_REJECTED').length;
    return {
        cycle,
        lead_time_avg: Math.round(avgLeadTime * 10) / 10,
        throughput: completedTasks.length,
        blockers,
        rejected
    };
}
// Allow running as standalone script
if (require.main === module) {
    startMetricsCollector();
}
//# sourceMappingURL=metricsCollector.js.map