'use strict';
// src/agents/scrumMasterAgent.ts
// Scrum Master agent - manages tasks, assignments, and phase transitions
Object.defineProperty(exports, '__esModule', { value: true });
exports.ScrumMasterAgent = void 0;
const agentBase_1 = require('./agentBase');
class ScrumMasterAgent extends agentBase_1.AgentRunner {
  constructor() {
    super('scrum_master_agent', 'scrum_master');
  }
  /**
   * Filter for SM-relevant events
   */
  filterRelevant(events) {
    const relevantTypes = [
      'PHASE_CHANGED',
      'STORY_CREATED',
      'TASK_CREATED',
      'TASK_ACCEPTED',
      'TASK_STUCK',
      'METRICS_PUBLISHED',
    ];
    return events.filter(ev => relevantTypes.includes(ev.type));
  }
  /**
   * Scrum Master decision logic
   */
  async decide(ev, state) {
    switch (ev.type) {
      case 'PHASE_CHANGED':
        if (ev.payload.phase === 'ASSIGN') {
          // Slice stories into tasks
          const readyStories = state.stories.filter(s => s.status === 'READY' && s.tasks.length === 0);
          if (readyStories.length > 0) {
            // Create tasks for the first story
            const story = readyStories[0];
            return this.createTaskForStory(story.id, story.title);
          }
        }
        break;
      case 'STORY_CREATED':
        // If we're in ASSIGN phase, immediately slice new stories
        if (this.isPhase(state, 'ASSIGN')) {
          const story = ev.payload.story;
          return this.createTaskForStory(story.id, story.title);
        }
        break;
      case 'TASK_CREATED':
        // Auto-assign tasks if in ASSIGN phase
        if (this.isPhase(state, 'ASSIGN')) {
          const task = ev.payload.task;
          const assignee = this.findBestAssignee(state);
          if (assignee) {
            return this.createEvent('TASK_ASSIGNED', {
              task_id: task.id,
              assignee,
            });
          }
        }
        break;
      case 'TASK_ACCEPTED':
        // Check if all tasks are done and we should change phase
        if (this.isPhase(state, 'REVIEW', 'INTEGRATE')) {
          const allTasksDone = Object.values(state.tasks).every(t => t.state === 'DONE');
          if (allTasksDone) {
            // Move to next phase
            const nextPhase = this.getNextPhase(state.meta.phase);
            if (nextPhase) {
              return this.createEvent('PHASE_CHANGED', {
                phase: nextPhase,
                increment_cycle: nextPhase === 'PLAN',
              });
            }
          }
        }
        break;
      case 'TASK_STUCK':
        // Try to unblock or reassign stuck tasks
        const stuckTask = state.tasks[ev.payload.task_id];
        if (stuckTask && stuckTask.assignee) {
          // Find alternative assignee
          const newAssignee = this.findBestAssignee(state, stuckTask.assignee);
          if (newAssignee) {
            return this.createEvent('TASK_ASSIGNED', {
              task_id: stuckTask.id,
              assignee: newAssignee,
            });
          }
        }
        break;
    }
    // Check for phase transition timeouts
    const phaseTransition = this.checkPhaseTransition(state);
    if (phaseTransition) {
      return phaseTransition;
    }
    return 'NOOP';
  }
  /**
   * Create a task from a story
   */
  createTaskForStory(storyId, storyTitle) {
    const taskTemplates = [
      { title: 'Implement backend API', est: 3, wip_class: 'FEAT' },
      { title: 'Create frontend components', est: 2, wip_class: 'FEAT' },
      { title: 'Write unit tests', est: 1, wip_class: 'CHORE' },
      { title: 'Update documentation', est: 1, wip_class: 'CHORE' },
    ];
    // Pick a random task template
    const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
    const task = {
      id: `T-${Date.now()}`,
      story_id: storyId,
      title: `${template.title} for ${storyTitle}`,
      state: 'UNASSIGNED',
      assignee: null,
      wip_class: template.wip_class,
      est: template.est,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      dependencies: [],
      notes: [],
    };
    return this.createEvent('TASK_CREATED', { task });
  }
  /**
   * Find the best developer to assign a task to
   */
  findBestAssignee(state, exclude) {
    const developers = ['dev_A', 'dev_B', 'dev_C'];
    // Filter out excluded developer
    const available = developers.filter(dev => dev !== exclude);
    // Find developer with lowest WIP
    let bestDev = null;
    let lowestWIP = Infinity;
    for (const dev of available) {
      const wip = this.getActiveTaskCount(state, dev);
      if (wip < state.config.wip_limit_per_dev && wip < lowestWIP) {
        lowestWIP = wip;
        bestDev = dev;
      }
    }
    return bestDev;
  }
  /**
   * Check if we should transition phases based on state
   */
  checkPhaseTransition(state) {
    const phase = state.meta.phase;
    switch (phase) {
      case 'ASSIGN':
        // Check if all stories have tasks
        const unslicedStories = state.stories.filter(s => s.status === 'READY' && s.tasks.length === 0);
        if (unslicedStories.length === 0) {
          // All stories sliced, check if tasks assigned
          const unassignedTasks = Object.values(state.tasks).filter(t => t.state === 'UNASSIGNED');
          if (unassignedTasks.length === 0) {
            return this.createEvent('PHASE_CHANGED', { phase: 'BUILD' });
          }
        }
        break;
      case 'BUILD':
        // Check if all tasks are in review or done
        const inProgressTasks = Object.values(state.tasks).filter(t => t.state === 'IN_PROGRESS');
        if (inProgressTasks.length === 0) {
          const reviewTasks = Object.values(state.tasks).filter(t => t.state === 'REVIEW');
          if (reviewTasks.length > 0) {
            return this.createEvent('PHASE_CHANGED', { phase: 'REVIEW' });
          }
        }
        break;
      case 'INTEGRATE':
        // Auto-transition to PLAN after metrics
        const hasRecentMetrics = state.metrics.cycle_history.some(m => m.cycle === state.meta.cycle);
        if (hasRecentMetrics) {
          return this.createEvent('PHASE_CHANGED', {
            phase: 'PLAN',
            increment_cycle: true,
          });
        }
        break;
    }
    return null;
  }
  /**
   * Get the next phase in sequence
   */
  getNextPhase(current) {
    const sequence = {
      PLAN: 'ASSIGN',
      ASSIGN: 'BUILD',
      BUILD: 'REVIEW',
      REVIEW: 'INTEGRATE',
      INTEGRATE: 'PLAN',
    };
    return sequence[current] || null;
  }
}
exports.ScrumMasterAgent = ScrumMasterAgent;
//# sourceMappingURL=scrumMasterAgent.js.map
