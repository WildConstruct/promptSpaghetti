// src/agents/scrumMasterAgent-updated.ts
// Scrum Master agent - updated to focus on task creation and monitoring without phases

import { AgentRunner, Event, State, Story, Task } from './agentBase';

export class ScrumMasterAgent extends AgentRunner {
  constructor() {
    super('scrum_master_agent', 'scrum_master');
  }

  /**
   * Filter for SM-relevant events
   */
  filterRelevant(events: Event[]): Event[] {
    const relevantTypes = [
      'STORY_CREATED',
      'TASK_CREATED',
      'TASK_BLOCKED',
      'TASK_STUCK',
      'METRICS_PUBLISHED',
      'TASK_APPROVED' // New: Monitor approved tasks for GitHub automation
    ];

    return events.filter(ev => relevantTypes.includes(ev.type));
  }

  /**
   * Scrum Master decision logic - focused on task management without phases
   */
  async decide(ev: Event, state: State): Promise<Event | 'NOOP'> {
    switch (ev.type) {
      case 'STORY_CREATED': {
        // Create tasks for the new story
        const story = ev.payload.story;
        if (story && story.tasks.length === 0) {
          return this.createTaskForStory(story.id, story.title);
        }
        break;
      }

      case 'TASK_BLOCKED': {
        // Help unblock tasks
        const blockedTask = state.tasks[ev.payload.task_id];
        if (blockedTask) {
          return this.createEvent('TASK_NOTE_ADDED', {
            task_id: ev.payload.task_id,
            note: 'Scrum Master assisting with blocker resolution',
            blocker_type: ev.payload.blocker_type || 'dependency'
          });
        }
        break;
      }

      case 'TASK_STUCK': {
        // Task has been in same state too long
        const stuckTask = state.tasks[ev.payload.task_id];
        if (stuckTask) {
          return this.createEvent('TASK_NOTE_ADDED', {
            task_id: ev.payload.task_id,
            note: 'Scrum Master reviewing stuck task',
            stuck_duration: ev.payload.duration
          });
        }
        break;
      }

      case 'METRICS_PUBLISHED': {
        // Review metrics and adjust workflow
        const metrics = ev.payload;
        if (metrics.cycle_time > 7) {
          return this.createEvent('WORKFLOW_ADJUSTMENT', {
            reason: 'High cycle time detected',
            suggestion: 'Consider reducing WIP limits'
          });
        }
        break;
      }

      case 'TASK_APPROVED': {
        // Track approved tasks for GitHub automation
        return this.createEvent('GITHUB_SYNC', {
          task_id: ev.payload.task_id,
          action: 'track_for_pr',
          approved_by: ev.payload.approved_by
        });
      }
    }

    const taskCreationNeeded = this.checkStoriesNeedingTasks(state);
    if (taskCreationNeeded) {
      return taskCreationNeeded;
    }

    const healthCheck = this.checkProjectHealth(state);
    if (healthCheck) {
      return healthCheck;
    }

    return 'NOOP';
  }

  /**
   * Create tasks from a story
   */
  private createTaskForStory(storyId: string, storyTitle: string): Event {
    const taskTemplates = [
      { title: 'Implement backend API', est: 3, wip_class: 'FEAT' },
      { title: 'Create frontend components', est: 2, wip_class: 'FEAT' },
      { title: 'Write unit tests', est: 1, wip_class: 'CHORE' },
      { title: 'Update documentation', est: 1, wip_class: 'CHORE' }
    ];

    // Pick a random task template
    const template =
      taskTemplates[Math.floor(Math.random() * taskTemplates.length)];

    const task = {
      id: `T-${Date.now()}`,
      story_id: storyId,
      title: `${template.title} for ${storyTitle}`,
      state: 'UNASSIGNED', // Ready for developers to grab
      assignee: null,
      wip_class: template.wip_class,
      est: template.est,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      dependencies: [],
      notes: []
    };

    return this.createEvent('TASK_CREATED', { task });
  }

  /**
   * Check for stories that need tasks created
   */
  private checkStoriesNeedingTasks(state: State): Event | null {
    const storiesWithoutTasks = state.stories.filter(
      (s: Story) => s.status === 'READY' && (!s.tasks || s.tasks.length === 0)
    );

    if (storiesWithoutTasks.length > 0) {
      const story = storiesWithoutTasks[0];
      return this.createTaskForStory(story.id, story.title);
    }

    return null;
  }

  /**
   * Monitor overall project health
   */
  private checkProjectHealth(state: State): Event | null {
    const tasks = Object.values(state.tasks);

    // Check for too many blocked tasks
    const blockedTasks = tasks.filter((t: Task) => t.status === 'BLOCKED');
    if (blockedTasks.length > 3) {
      return this.createEvent('ALERT_RAISED', {
        type: 'high_blocked_count',
        message: `${blockedTasks.length} tasks are currently blocked. Team intervention may be needed.`,
        severity: 'warning'
      });
    }

    // Check for tasks stuck in review too long
    const reviewTasks = tasks.filter((t: Task) => t.status === 'REVIEW');
    const stuckInReview = reviewTasks.filter((t: Task) => {
      const reviewDuration = Date.now() - new Date(t.updated || '').getTime();
      return reviewDuration > 86400000; // 24 hours
    });

    if (stuckInReview.length > 0) {
      return this.createEvent('ALERT_RAISED', {
        type: 'review_bottleneck',
        message: `${stuckInReview.length} tasks have been in review for over 24 hours.`,
        severity: 'info'
      });
    }

    return null;
  }

  /**
   * Analyze project metrics
   */
  private analyzeProjectMetrics(state: State): Event {
    const tasks = Object.values(state.tasks);
    const completedTasks = tasks.filter((t: Task) => t.status === 'COMPLETED');
    const approvedTasks = tasks.filter((t: Task) => t.status === 'APPROVED');

    // Calculate velocity
    const velocity = completedTasks.length + approvedTasks.length;

    return this.createEvent('METRICS_ANALYZED', {
      total_tasks: tasks.length,
      completed: completedTasks.length,
      approved: approvedTasks.length,
      velocity: velocity,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Note: The Scrum Master now focuses on:
 * 1. Creating tasks from stories (no phase dependency)
 * 2. Monitoring blocked/stuck tasks
 * 3. Tracking project health metrics
 * 4. Observing approved tasks (GitHub PRs created automatically)
 *
 * Developers self-assign tasks using grab-tasks.js
 * QA approval triggers automatic GitHub integration
 *
 * See docs/ticket-system.md for database schema and automation details
 */
