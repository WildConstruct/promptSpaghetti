'use strict';
// src/agents/agentBase.ts
// Base class for all agents
Object.defineProperty(exports, '__esModule', { value: true });
exports.AgentRunner = void 0;
const events_1 = require('../core/events');
const state_1 = require('../core/state');
const validator_1 = require('../core/validator');
/**
 * Base agent runner class
 */
class AgentRunner {
  constructor(name, role) {
    this.lastEventId = 0;
    this.name = name;
    this.role = role;
  }
  /**
   * Initialize agent - get latest event ID
   */
  async init() {
    this.lastEventId = (0, events_1.getLatestEventId)();
    console.log(`🤖 ${this.name} initialized at event ${this.lastEventId}`);
  }
  /**
   * Process one tick - check for new events and respond
   */
  async tick() {
    const events = (0, events_1.fetchSince)(this.lastEventId, 100);
    if (!events.length) {
      await this.sleep(1500);
      return;
    }
    const state = (0, state_1.loadState)();
    const relevant = this.filterRelevant(events);
    for (const ev of relevant) {
      try {
        const response = await this.decide(ev, state);
        if (response && response !== 'NOOP') {
          // Validate before appending
          const payloadErrors = (0, validator_1.validatePayload)(response);
          if (payloadErrors.length > 0) {
            console.error(`${this.name} - Invalid event payload:`, payloadErrors);
            continue;
          }
          const errors = (0, validator_1.validate)(response, state);
          if (errors.length > 0) {
            console.error(`${this.name} - Event validation failed:`, errors);
            continue;
          }
          // Append the event
          const appended = (0, events_1.append)(response);
          console.log(`${this.name} emitted: ${appended.type} (ID: ${appended.id})`);
        }
      } catch (error) {
        console.error(`${this.name} - Error processing event ${ev.id}:`, error);
      }
    }
    // Update cursor
    this.lastEventId = events[events.length - 1].id;
  }
  /**
   * Run the agent forever
   */
  async runForever() {
    await this.init();
    console.log(`🚀 ${this.name} starting main loop...`);
    while (true) {
      try {
        await this.tick();
      } catch (error) {
        console.error(`${this.name} - Tick error:`, error);
        await this.sleep(5000); // Wait longer on error
      }
    }
  }
  /**
   * Filter events relevant to this agent
   * Override in subclasses for custom filtering
   */
  filterRelevant(events) {
    // Default: all events are relevant
    return events;
  }
  /**
   * Helper to create an event
   */
  createEvent(type, payload) {
    return {
      type,
      actor: this.name,
      payload,
      version: 1,
    };
  }
  /**
   * Sleep for a given number of milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * Check if agent should handle this phase
   */
  isPhase(state, ...phases) {
    return phases.includes(state.meta.phase);
  }
  /**
   * Count active tasks for a developer
   */
  getActiveTaskCount(state, developer) {
    const taskIds = state.assignments[developer] || [];
    return taskIds.filter(tid => {
      const task = state.tasks[tid];
      return task && ['IN_PROGRESS', 'REVIEW', 'STUCK'].includes(task.state);
    }).length;
  }
}
exports.AgentRunner = AgentRunner;
//# sourceMappingURL=agentBase.js.map
