'use strict';
// src/core/validator.ts
// Event validation and business rule enforcement
Object.defineProperty(exports, '__esModule', { value: true });
exports.validate = validate;
exports.validatePayload = validatePayload;
/**
 * Validate an event against the current state
 * Returns an array of error messages (empty if valid)
 */
function validate(ev, state) {
  const errors = [];
  const phase = state.meta.phase;
  const actor = ev.actor;
  // Phase-based validation
  switch (ev.type) {
    case 'STORY_CREATED':
      if (phase !== 'PLAN') {
        errors.push(`Cannot create story outside PLAN phase (current: ${phase})`);
      }
      if (!isProductOwner(actor) && !isSystem(actor)) {
        errors.push(`Only product owner can create stories (actor: ${actor})`);
      }
      break;
    case 'TASK_CREATED':
      if (phase !== 'ASSIGN') {
        errors.push(`Cannot create task outside ASSIGN phase (current: ${phase})`);
      }
      if (!isScrumMaster(actor) && !isSystem(actor)) {
        errors.push(`Only scrum master can create tasks (actor: ${actor})`);
      }
      break;
    case 'TASK_ASSIGNED':
      if (phase !== 'ASSIGN' && phase !== 'BUILD') {
        errors.push(`Cannot assign tasks in ${phase} phase`);
      }
      // WIP limit check
      const assignee = ev.payload.assignee;
      const activeTaskCount = getActiveTaskCount(state, assignee);
      if (activeTaskCount >= state.config.wip_limit_per_dev) {
        errors.push(`WIP limit exceeded for ${assignee} (${activeTaskCount}/${state.config.wip_limit_per_dev})`);
      }
      // Check task exists
      if (!state.tasks[ev.payload.task_id]) {
        errors.push(`Task ${ev.payload.task_id} does not exist`);
      }
      break;
    case 'TASK_STARTED':
      if (phase !== 'BUILD') {
        errors.push(`Cannot start tasks outside BUILD phase (current: ${phase})`);
      }
      const taskToStart = state.tasks[ev.payload.task_id];
      if (!taskToStart) {
        errors.push(`Task ${ev.payload.task_id} does not exist`);
      } else if (taskToStart.assignee !== extractDevName(actor)) {
        errors.push(`Only assigned developer can start task (assigned: ${taskToStart.assignee}, actor: ${actor})`);
      }
      break;
    case 'TASK_MOVED_TO_REVIEW':
      if (phase !== 'BUILD' && phase !== 'REVIEW') {
        errors.push(`Cannot move tasks to review in ${phase} phase`);
      }
      const taskToReview = state.tasks[ev.payload.task_id];
      if (!taskToReview) {
        errors.push(`Task ${ev.payload.task_id} does not exist`);
      } else if (taskToReview.state !== 'IN_PROGRESS') {
        errors.push(`Can only move IN_PROGRESS tasks to review (current: ${taskToReview.state})`);
      }
      break;
    case 'TASK_ACCEPTED':
      if (phase !== 'REVIEW' && phase !== 'INTEGRATE') {
        errors.push(`Cannot accept tasks outside REVIEW/INTEGRATE phase (current: ${phase})`);
      }
      if (!isProductOwner(actor) && !isScrumMaster(actor)) {
        errors.push(`Only PO or SM can accept tasks (actor: ${actor})`);
      }
      const taskToAccept = state.tasks[ev.payload.task_id];
      if (!taskToAccept) {
        errors.push(`Task ${ev.payload.task_id} does not exist`);
      } else if (taskToAccept.state !== 'REVIEW') {
        errors.push(`Can only accept tasks in REVIEW state (current: ${taskToAccept.state})`);
      }
      break;
    case 'PHASE_CHANGED':
      if (!isScrumMaster(actor) && !isSystem(actor)) {
        errors.push(`Only scrum master or system can change phase (actor: ${actor})`);
      }
      // Validate phase transitions
      const validTransition = isValidPhaseTransition(phase, ev.payload.phase);
      if (!validTransition) {
        errors.push(`Invalid phase transition: ${phase} -> ${ev.payload.phase}`);
      }
      // Additional phase-specific checks
      if (ev.payload.phase === 'BUILD' && phase === 'ASSIGN') {
        // Check that all stories have at least one task
        const storiesWithoutTasks = state.stories.filter(s => s.status === 'READY' && s.tasks.length === 0);
        if (storiesWithoutTasks.length > 0) {
          errors.push(`Cannot move to BUILD: ${storiesWithoutTasks.length} stories have no tasks`);
        }
      }
      break;
  }
  // Common validations
  if (!ev.actor || ev.actor.trim() === '') {
    errors.push('Event must have an actor');
  }
  if (!ev.version || ev.version !== 1) {
    errors.push('Event version must be 1');
  }
  return errors;
}
/**
 * Check if a phase transition is valid
 */
function isValidPhaseTransition(from, to) {
  const transitions = {
    PLAN: ['ASSIGN'],
    ASSIGN: ['BUILD', 'PLAN'], // Can go back to PLAN if needed
    BUILD: ['REVIEW'],
    REVIEW: ['INTEGRATE', 'BUILD'], // Can go back to BUILD if many rejections
    INTEGRATE: ['PLAN'],
  };
  return transitions[from]?.includes(to) || false;
}
/**
 * Get count of active tasks for a developer
 */
function getActiveTaskCount(state, developer) {
  const taskIds = state.assignments[developer] || [];
  return taskIds.filter(tid => {
    const task = state.tasks[tid];
    return task && ['UNASSIGNED', 'IN_PROGRESS', 'REVIEW', 'STUCK', 'BLOCKED'].includes(task.state);
  }).length;
}
/**
 * Role checking helpers
 */
function isProductOwner(actor) {
  return actor.includes('product_owner') || actor === 'po_agent';
}
function isScrumMaster(actor) {
  return actor.includes('scrum_master') || actor === 'sm_agent';
}
function isDeveloper(actor) {
  return actor.startsWith('dev_') || actor.includes('developer');
}
function isSystem(actor) {
  return actor.startsWith('system') || actor === 'watcher';
}
function extractDevName(actor) {
  // Extract developer identifier from actor string
  // e.g., "dev_A_agent" -> "dev_A"
  const match = actor.match(/^(dev_[A-Z])/);
  return match ? match[1] : actor;
}
/**
 * Validate that required fields are present in event payload
 */
function validatePayload(ev) {
  const errors = [];
  switch (ev.type) {
    case 'STORY_CREATED':
      if (!ev.payload.story) {
        errors.push('STORY_CREATED requires story in payload');
      } else {
        const story = ev.payload.story;
        if (!story.id || !story.title || !story.goal_id) {
          errors.push('Story must have id, title, and goal_id');
        }
      }
      break;
    case 'TASK_CREATED':
      if (!ev.payload.task) {
        errors.push('TASK_CREATED requires task in payload');
      } else {
        const task = ev.payload.task;
        if (!task.id || !task.title || !task.story_id) {
          errors.push('Task must have id, title, and story_id');
        }
      }
      break;
    case 'TASK_ASSIGNED':
      if (!ev.payload.task_id || !ev.payload.assignee) {
        errors.push('TASK_ASSIGNED requires task_id and assignee');
      }
      break;
    case 'PHASE_CHANGED':
      if (!ev.payload.phase) {
        errors.push('PHASE_CHANGED requires phase in payload');
      }
      break;
  }
  return errors;
}
//# sourceMappingURL=validator.js.map
