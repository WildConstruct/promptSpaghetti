// src/agents/agentBase-updated.ts
// Base agent runner - updated without phase system

export interface Event {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
  agent_id: string;
}

interface ProductGoal {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignee?: string;
  storyId?: string;
}

interface Metrics {
  cycle_time?: number;
  throughput?: number;
  wip?: number;
  [key: string]: unknown;
}

export interface State {
  meta: {
    cycle: number;
    updated: string;
  };
  product_goals: ProductGoal[];
  stories: Story[];
  tasks: Record<string, Task>;
  assignments: Record<string, string[]>;
  metrics: Metrics;
  config: {
    wip_limit_per_dev: number;
    timeout_sec: number;
  };
}

export abstract class AgentRunner {
  protected agentId: string;
  protected role: string;

  constructor(agentId: string, role: string) {
    this.agentId = agentId;
    this.role = role;
  }

  /**
   * Main run loop
   */
  async run(events: Event[], state: State): Promise<Event | 'NOOP'> {
    // Filter to relevant events
    const relevant = this.filterRelevant(events);

    // Process each event
    for (const ev of relevant) {
      const decision = await this.decide(ev, state);
      if (decision !== 'NOOP') {
        return decision;
      }
    }

    return 'NOOP';
  }

  /**
   * Filter events to those relevant to this agent
   */
  abstract filterRelevant(events: Event[]): Event[];

  /**
   * Make a decision based on an event and current state
   */
  abstract decide(event: Event, state: State): Promise<Event | 'NOOP'>;

  /**
   * Helper to create an event
   */
  protected createEvent(type: string, payload: Record<string, unknown>): Event {
    return {
      id: `E-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
      agent_id: this.agentId
    };
  }

  /**
   * Get count of active tasks for a developer
   */
  protected getActiveTaskCount(state: State, devId: string): number {
    return Object.values(state.tasks).filter(
      t => t.assignee === devId && ['IN_PROGRESS', 'REVIEW'].includes(t.state)
    ).length;
  }

  /**
   * Sleep utility for simulating work
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if a task exists and get it
   */
  protected getTask(state: State, taskId: string): Task | null {
    return state.tasks[taskId] || null;
  }

  /**
   * Get all tasks for a specific story
   */
  protected getTasksForStory(state: State, storyId: string): Task[] {
    return Object.values(state.tasks).filter(task => task.storyId === storyId);
  }

  /**
   * Get all unassigned tasks
   */
  protected getUnassignedTasks(state: State): Task[] {
    return Object.values(state.tasks).filter(task => !task.assignee);
  }

  /**
   * Get tasks by state
   */
  protected getTasksByState(state: State, taskState: string): Task[] {
    return Object.values(state.tasks).filter(task => task.status === taskState);
  }

  /**
   * Get tasks assigned to a specific developer
   */
  protected getTasksForDeveloper(state: State, devId: string): Task[] {
    return Object.values(state.tasks).filter(task => task.assignee === devId);
  }

  /**
   * Calculate task metrics
   */
  protected calculateTaskMetrics(state: State): {
    total: number;
    unassigned: number;
    in_progress: number;
    review: number;
    approved: number;
    completed: number;
    blocked: number;
  } {
    const tasks = Object.values(state.tasks);
    return {
      total: tasks.length,
      unassigned: tasks.filter(t => t.state === 'UNASSIGNED').length,
      in_progress: tasks.filter(t => t.state === 'IN_PROGRESS').length,
      review: tasks.filter(t => t.state === 'REVIEW').length,
      approved: tasks.filter(t => t.state === 'APPROVED').length,
      completed: tasks.filter(t => t.state === 'COMPLETED').length,
      blocked: tasks.filter(t => t.state === 'BLOCKED').length
    };
  }
}

/**
 * Note: Phase system has been removed. Agents now work with:
 * - Direct task states: UNASSIGNED → IN_PROGRESS → REVIEW → APPROVED → COMPLETED
 * - Developers self-assign using grab-tasks.js
 * - QA approval triggers automatic GitHub PR creation
 * - Database handles GitHub automation and commit tracking
 *
 * See docs/ticket-system.md for complete system documentation
 */
