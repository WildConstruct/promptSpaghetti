"use strict";
// src/agents/productOwnerAgent.ts
// Product Owner agent - manages stories and acceptance
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductOwnerAgent = void 0;
const agentBase_1 = require("./agentBase");
class ProductOwnerAgent extends agentBase_1.AgentRunner {
    constructor() {
        super('product_owner_agent', 'product_owner');
    }
    /**
     * Filter for PO-relevant events
     */
    filterRelevant(events) {
        const relevantTypes = [
            'PHASE_CHANGED',
            'TASK_MOVED_TO_REVIEW',
            'STORY_CREATED',
            'METRICS_PUBLISHED'
        ];
        return events.filter(ev => relevantTypes.includes(ev.type));
    }
    /**
     * Product Owner decision logic
     */
    async decide(ev, state) {
        switch (ev.type) {
            case 'PHASE_CHANGED':
                if (ev.payload.phase === 'PLAN') {
                    // Check if we need more stories
                    const readyStories = state.stories.filter(s => s.status === 'READY');
                    if (readyStories.length < 3) {
                        // Create a new story based on goals
                        const activeGoal = state.product_goals.find(g => g.status === 'ACTIVE');
                        if (activeGoal) {
                            return this.createStory(activeGoal.id);
                        }
                    }
                }
                break;
            case 'TASK_MOVED_TO_REVIEW':
                // PO should review tasks in REVIEW phase
                if (this.isPhase(state, 'REVIEW')) {
                    const task = state.tasks[ev.payload.task_id];
                    if (task && task.state === 'REVIEW') {
                        // Simple acceptance logic - accept most tasks
                        const shouldAccept = Math.random() > 0.2; // 80% acceptance rate
                        if (shouldAccept) {
                            return this.createEvent('TASK_ACCEPTED', {
                                task_id: ev.payload.task_id
                            });
                        }
                        else {
                            return this.createEvent('TASK_REJECTED', {
                                task_id: ev.payload.task_id,
                                reason: 'Does not meet acceptance criteria'
                            });
                        }
                    }
                }
                break;
        }
        return 'NOOP';
    }
    /**
     * Create a new story
     */
    createStory(goalId) {
        const storyTemplates = [
            {
                title: "User authentication system",
                acceptance: [
                    "Users can register with email",
                    "Users can login with credentials",
                    "Sessions persist across browser restarts"
                ]
            },
            {
                title: "Dashboard analytics view",
                acceptance: [
                    "Shows key metrics prominently",
                    "Updates in real-time",
                    "Mobile responsive design"
                ]
            },
            {
                title: "Export functionality",
                acceptance: [
                    "Can export data as CSV",
                    "Can export data as JSON",
                    "Includes date range selection"
                ]
            }
        ];
        const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
        const storyId = `S-${Date.now()}`;
        const story = {
            id: storyId,
            goal_id: goalId,
            title: template.title,
            acceptance: template.acceptance,
            priority: Math.floor(Math.random() * 5) + 1,
            status: 'READY',
            tasks: []
        };
        return this.createEvent('STORY_CREATED', { story });
    }
}
exports.ProductOwnerAgent = ProductOwnerAgent;
//# sourceMappingURL=productOwnerAgent.js.map