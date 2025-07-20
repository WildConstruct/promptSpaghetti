"use strict";
// src/agents/devAgentTemplate-updated.ts
// Developer agent template - updated for direct task assignment without phases
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
            'TASK_NOTE_ADDED',
            'TASK_BLOCKED',
            'TASK_UNBLOCKED',
            'TASK_REVIEW_REQUESTED'
        ];
        return events.filter(ev => {
            // Only interested in tasks assigned to this developer
            if (ev.payload?.task_id) {
                const task = this.getTaskFromState(ev.payload.task_id);
                if (task?.assignee === this.devId) {
                    return true;
                }
            }
            return relevantTypes.includes(ev.type);
        });
    }
    /**
     * Developer decision logic - simplified without phases
     */
    async decide(ev, state) {
        switch (ev.type) {
            case 'TASK_BLOCKED':
                // Help unblock tasks if we can
                const blockedTask = state.tasks[ev.payload.task_id];
                if (blockedTask?.assignee === this.devId) {
                    // Add a note about working on the blocker
                    await this.sleep(2000); // Simulate investigation
                    return this.createEvent('TASK_NOTE_ADDED', {
                        task_id: ev.payload.task_id,
                        note: `Investigating blocker: ${ev.payload.reason || 'dependency issue'}`
                    });
                }
                break;
            case 'TASK_REVIEW_REQUESTED':
                // Respond to review feedback
                const reviewTask = state.tasks[ev.payload.task_id];
                if (reviewTask?.assignee === this.devId && ev.payload.changes_requested) {
                    await this.sleep(1000);
                    return this.createEvent('TASK_NOTE_ADDED', {
                        task_id: ev.payload.task_id,
                        note: 'Addressing review feedback'
                    });
                }
                break;
        }
        // Check if we should update any of our tasks
        const updateNeeded = this.checkTasksNeedingUpdate(state);
        if (updateNeeded) {
            return updateNeeded;
        }
        return 'NOOP';
    }
    /**
     * Check if any assigned tasks need status updates
     */
    checkTasksNeedingUpdate(state) {
        // Get all tasks assigned to this developer
        const myTasks = Object.values(state.tasks).filter((t) => t.assignee === this.devId);
        // Check for tasks that might need attention
        for (const task of myTasks) {
            const timeSinceUpdate = Date.now() - new Date(task.updated).getTime();
            // If task has been in progress for a while, add a progress note
            if (task.state === 'IN_PROGRESS' && timeSinceUpdate > 300000) { // 5 minutes
                return this.createEvent('TASK_NOTE_ADDED', {
                    task_id: task.id,
                    note: 'Still working on implementation, making good progress'
                });
            }
        }
        return null;
    }
    getTaskFromState(taskId) {
        // This would be implemented to fetch task from state
        // For now, returning null as placeholder
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
/**
 * Note: Developers now use the following workflow:
 * 1. Run `node grab-tasks.js <dev-id>` to self-assign tasks
 * 2. Work on tasks (automatically set to IN_PROGRESS)
 * 3. Run `node finish-task.js <task-id> REVIEW` when done
 * 4. QA approval triggers automatic GitHub PR creation
 *
 * See docs/ticket-system.md for database schema and automation details
 */ 
