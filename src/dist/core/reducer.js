"use strict";
// src/core/reducer.ts
// Pure reducer for state transformations
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduce = reduce;
exports.replayEvents = replayEvents;
/**
 * Apply an event to the state, returning a new state
 * This is a pure function - it does not modify the input state
 */
function reduce(state, ev) {
    // Clone state to ensure immutability
    const newState = JSON.parse(JSON.stringify(state));
    switch (ev.type) {
        case "INIT_SNAPSHOT": {
            // Replace entire state with snapshot
            return ev.payload.state;
        }
        case "STORY_CREATED": {
            const story = ev.payload.story;
            newState.stories.push(story);
            break;
        }
        case "STORY_UPDATED": {
            const { story_id, updates } = ev.payload;
            const storyIndex = newState.stories.findIndex(s => s.id === story_id);
            if (storyIndex !== -1) {
                Object.assign(newState.stories[storyIndex], updates);
            }
            break;
        }
        case "TASK_CREATED": {
            const task = ev.payload.task;
            newState.tasks[task.id] = task;
            // Add task to story's task list
            const story = newState.stories.find(s => s.id === task.story_id);
            if (story && !story.tasks.includes(task.id)) {
                story.tasks.push(task.id);
            }
            break;
        }
        case "TASK_ASSIGNED": {
            const { task_id, assignee } = ev.payload;
            const task = newState.tasks[task_id];
            if (task) {
                // Remove from previous assignee if exists
                if (task.assignee && newState.assignments[task.assignee]) {
                    newState.assignments[task.assignee] = newState.assignments[task.assignee]
                        .filter(id => id !== task_id);
                }
                // Assign to new developer
                task.assignee = assignee;
                task.updated = ev.ts || new Date().toISOString();
                // Update assignments index
                if (!newState.assignments[assignee]) {
                    newState.assignments[assignee] = [];
                }
                if (!newState.assignments[assignee].includes(task_id)) {
                    newState.assignments[assignee].push(task_id);
                }
            }
            break;
        }
        case "TASK_STARTED": {
            const { task_id } = ev.payload;
            const task = newState.tasks[task_id];
            if (task) {
                task.state = "IN_PROGRESS";
                task.updated = ev.ts || new Date().toISOString();
            }
            break;
        }
        case "TASK_MOVED_TO_REVIEW": {
            const { task_id } = ev.payload;
            const task = newState.tasks[task_id];
            if (task) {
                task.state = "REVIEW";
                task.updated = ev.ts || new Date().toISOString();
            }
            break;
        }
        case "TASK_ACCEPTED": {
            const { task_id } = ev.payload;
            const task = newState.tasks[task_id];
            if (task) {
                task.state = "DONE";
                task.updated = ev.ts || new Date().toISOString();
                // Check if all tasks in story are done
                const story = newState.stories.find(s => s.id === task.story_id);
                if (story) {
                    const allTasksDone = story.tasks.every(tid => newState.tasks[tid]?.state === "DONE");
                    if (allTasksDone && story.status !== "DONE") {
                        story.status = "DONE";
                    }
                }
            }
            break;
        }
        case "TASK_REJECTED": {
            const { task_id, reason } = ev.payload;
            const task = newState.tasks[task_id];
            if (task) {
                task.state = "IN_PROGRESS"; // Back to in progress
                task.updated = ev.ts || new Date().toISOString();
                task.notes.push({
                    ts: ev.ts || new Date().toISOString(),
                    actor: ev.actor,
                    text: `Rejected: ${reason}`
                });
            }
            break;
        }
        case "TASK_STUCK": {
            const { task_id, reason } = ev.payload;
            const task = newState.tasks[task_id];
            if (task) {
                task.state = "STUCK";
                task.updated = ev.ts || new Date().toISOString();
                task.notes.push({
                    ts: ev.ts || new Date().toISOString(),
                    actor: ev.actor,
                    text: `Stuck: ${reason}`
                });
            }
            break;
        }
        case "TASK_UNBLOCKED": {
            const { task_id } = ev.payload;
            const task = newState.tasks[task_id];
            if (task && (task.state === "STUCK" || task.state === "BLOCKED")) {
                task.state = "IN_PROGRESS";
                task.updated = ev.ts || new Date().toISOString();
            }
            break;
        }
        case "TASK_NOTE_ADDED": {
            const { task_id, note } = ev.payload;
            const task = newState.tasks[task_id];
            if (task) {
                task.notes.push({
                    ts: ev.ts || new Date().toISOString(),
                    actor: ev.actor,
                    text: note
                });
                task.updated = ev.ts || new Date().toISOString();
            }
            break;
        }
        case "PHASE_CHANGED": {
            const { phase, cycle } = ev.payload;
            newState.meta.phase = phase;
            if (cycle !== undefined) {
                newState.meta.cycle = cycle;
            }
            // If moving to PLAN phase, increment cycle
            if (phase === "PLAN" && ev.payload.increment_cycle) {
                newState.meta.cycle++;
            }
            break;
        }
        case "METRICS_PUBLISHED": {
            const metric = ev.payload.metric;
            newState.metrics.cycle_history.push(metric);
            // Keep only last 10 cycles
            if (newState.metrics.cycle_history.length > 10) {
                newState.metrics.cycle_history = newState.metrics.cycle_history.slice(-10);
            }
            break;
        }
        case "ERROR_FLAGGED": {
            // Log error but don't change state structure
            console.error(`Error flagged by ${ev.actor}:`, ev.payload);
            break;
        }
        case "SYSTEM_HEARTBEAT": {
            // Update system timestamp but don't change other state
            break;
        }
        default:
            console.warn(`Unknown event type: ${ev.type}`);
    }
    // Always update meta timestamp
    newState.meta.updated = ev.ts || new Date().toISOString();
    return newState;
}
/**
 * Replay a series of events to build state from scratch
 */
function replayEvents(events, initialState) {
    let state = initialState || {
        meta: { cycle: 1, phase: "PLAN", updated: new Date().toISOString() },
        product_goals: [],
        stories: [],
        tasks: {},
        assignments: {},
        metrics: { cycle_history: [] },
        config: { wip_limit_per_dev: 2, timeout_sec: 600 }
    };
    for (const event of events) {
        state = reduce(state, event);
    }
    return state;
}
//# sourceMappingURL=reducer.js.map