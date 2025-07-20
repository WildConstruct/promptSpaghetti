"use strict";
// src/agents/devAgentTemplate.ts
// Developer agent template - can be instantiated for multiple developers
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevAgent = void 0;
exports.createDevAgent = createDevAgent;
const agentBase_1 = require("./agentBase");
class DevAgent extends agentBase_1.AgentRunner {
    constructor(devId) {
        super(`${devId}_agent`, 'developer');
        this.devId = devId;
    }
    /**
     * Filter for developer-relevant events
     */
    filterRelevant(events) {
        const relevantTypes = [
            'TASK_ASSIGNED',
            'TASK_REJECTED',
            'PHASE_CHANGED'
        ];
        return events.filter(ev => {
            // Always interested in phase changes
            if (ev.type === 'PHASE_CHANGED')
                return true;
            // Only interested in tasks assigned to this developer
            if (ev.type === 'TASK_ASSIGNED') {
                return ev.payload.assignee === this.devId;
            }
            // Interested in rejections of our tasks
            if (ev.type === 'TASK_REJECTED') {
                const task = ev.payload.task_id;
                // Would need to check state to see if this is our task
                return true;
            }
            return relevantTypes.includes(ev.type);
        });
    }
    /**
     * Developer decision logic
     */
    async decide(ev, state) {
        switch (ev.type) {
            case 'TASK_ASSIGNED':
                // Start working on newly assigned tasks in BUILD phase
                if (ev.payload.assignee === this.devId && this.isPhase(state, 'BUILD')) {
                    const task = state.tasks[ev.payload.task_id];
                    if (task && task.state === 'UNASSIGNED') {
                        // Start the task
                        return this.createEvent('TASK_STARTED', {
                            task_id: ev.payload.task_id
                        });
                    }
                }
                break;
            case 'TASK_REJECTED':
                // Fix rejected tasks
                const rejectedTask = state.tasks[ev.payload.task_id];
                if (rejectedTask && rejectedTask.assignee === this.devId) {
                    // Add a note about fixing the issue
                    await this.sleep(2000); // Simulate work
                    return this.createEvent('TASK_NOTE_ADDED', {
                        task_id: ev.payload.task_id,
                        note: `Fixed issue: ${ev.payload.reason}`
                    });
                }
                break;
            case 'PHASE_CHANGED':
                if (ev.payload.phase === 'BUILD') {
                    // Check for any assigned but not started tasks
                    const myTasks = Object.values(state.tasks).filter(t => t.assignee === this.devId && t.state === 'UNASSIGNED');
                    if (myTasks.length > 0) {
                        return this.createEvent('TASK_STARTED', {
                            task_id: myTasks[0].id
                        });
                    }
                }
                break;
        }
        // Check if we should move any in-progress tasks to review
        const readyForReview = this.checkTasksReadyForReview(state);
        if (readyForReview) {
            return readyForReview;
        }
        return 'NOOP';
    }
    /**
     * Check if any tasks are ready to move to review
     */
    checkTasksReadyForReview(state) {
        if (!this.isPhase(state, 'BUILD', 'REVIEW')) {
            return null;
        }
        const myInProgressTasks = Object.values(state.tasks).filter(t => t.assignee === this.devId && t.state === 'IN_PROGRESS');
        if (myInProgressTasks.length > 0) {
            // Simulate work completion (would be more sophisticated in real system)
            const task = myInProgressTasks[0];
            const workDuration = Date.now() - new Date(task.updated).getTime();
            // Move to review after "working" for at least 10 seconds
            if (workDuration > 10000) {
                return this.createEvent('TASK_MOVED_TO_REVIEW', {
                    task_id: task.id
                });
            }
        }
        return null;
    }
}
exports.DevAgent = DevAgent;
/**
 * Factory function to create developer agents
 */
function createDevAgent(devId) {
    return new DevAgent(devId);
}
//# sourceMappingURL=devAgentTemplate.js.map