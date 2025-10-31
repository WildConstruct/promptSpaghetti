// src/agents/qaAgent-updated.ts
// QA agent - updated to work with ticket system and GitHub automation

import { AgentRunner, Event, State, Task } from './agentBase';

export class QAAgent extends AgentRunner {
  constructor() {
    super('qa_agent', 'qa');
  }

  /**
   * Filter for QA-relevant events
   */
  filterRelevant(events: Event[]): Event[] {
    const relevantTypes = [
      'TASK_MOVED_TO_REVIEW',
      'TASK_REVIEW_REQUESTED',
      'TASK_UPDATED',
      'PR_CREATED', // New: Monitor automated PR creation
      'PR_MERGED', // New: Track PR merges
      'AUTO_PUSH_TRIGGERED' // New: Track auto-push events
    ];

    return events.filter(ev => relevantTypes.includes(ev.type));
  }

  /**
   * QA decision logic - includes GitHub automation awareness
   */
  async decide(ev: Event, state: State): Promise<Event | 'NOOP'> {
    switch (ev.type) {
      case 'TASK_REVIEW_REQUESTED': {
        // Perform QA review on the task
        const task = state.tasks[ev.payload.task_id];
        if (task && task.state === 'REVIEW') {
          return this.performQAReview(task);
        }
        break;
      }

      case 'PR_CREATED': {
        // Review the created PR
        return this.createEvent('PR_REVIEW_STARTED', {
          task_id: ev.payload.task_id,
          pr_number: ev.payload.pr_number,
          review_type: 'automated'
        });
      }

      case 'AUTO_PUSH_TRIGGERED': {
        // Monitor auto-push events for quality
        if (ev.payload.failed) {
          return this.createEvent('QUALITY_ALERT', {
            task_id: ev.payload.task_id,
            issue: 'Auto-push failed',
            details: ev.payload.error
          });
        }
        break;
      }
    }

    // Check for tasks that have been in review too long
    const reviewCheck = this.checkReviewQueue(state);
    if (reviewCheck) {
      return reviewCheck;
    }

    return 'NOOP';
  }

  /**
   * Perform QA review on a task
   */
  private performQAReview(task: Task): Event {
    // Simulate QA decision process
    const passRate = 0.8; // 80% pass rate
    const passed = Math.random() < passRate;

    if (passed) {
      // IMPORTANT: Setting status to APPROVED triggers GitHub PR creation
      return this.createEvent('TASK_APPROVED', {
        task_id: task.id,
        approved_by: 'qa_agent',
        notes: 'All tests passed, code quality good'
        // The database webhook will automatically:
        // 1. Create a GitHub PR if enabled
        // 2. Increment commit counter
        // 3. Trigger auto-push if threshold reached
      });
    } else {
      // Request changes
      const issues = this.generateQAIssues();
      return this.createEvent('TASK_REJECTED', {
        task_id: task.id,
        reason: issues.join(', '),
        changes_requested: true
      });
    }
  }

  /**
   * Check review queue for tasks needing attention
   */
  private checkReviewQueue(state: State): Event | null {
    const reviewTasks = Object.values(state.tasks).filter(
      (t: Task) => t.status === 'REVIEW'
    );

    // Find oldest unreviewed task
    const unreviewed = reviewTasks.filter((t: Task) => {
      const waitTime = Date.now() - new Date(t.updated || '').getTime();
      return waitTime > 60000; // Tasks waiting more than 1 minute
    });

    if (unreviewed.length > 0) {
      // Sort by age and review the oldest
      unreviewed.sort(
        (a: Task, b: Task) =>
          new Date(a.updated || '').getTime() - new Date(b.updated || '').getTime()
      );

      return this.performQAReview(unreviewed[0]);
    }

    return null;
  }

  /**
   * Generate realistic QA issues for rejected tasks
   */
  private generateQAIssues(): string[] {
    const issues = [
      'Missing unit tests',
      'Code style violations',
      'Insufficient error handling',
      'Performance concerns',
      'Documentation needs updating',
      'Edge case not handled'
    ];

    // Pick 1-3 random issues
    const count = Math.floor(Math.random() * 3) + 1;
    const selected: string[] = [];

    for (let i = 0; i < count; i++) {
      const issue = issues[Math.floor(Math.random() * issues.length)];
      if (!selected.includes(issue)) {
        selected.push(issue);
      }
    }

    return selected;
  }
}

/**
 * Note: QA Agent integration with GitHub automation:
 *
 * When QA approves a task (sets status to APPROVED):
 * 1. Database webhook triggers automatically
 * 2. GitHub PR is created if auto_create_pr is enabled
 * 3. Commit counter is incremented
 * 4. Auto-push triggers when threshold is reached (default: 10 commits)
 *
 * Configuration stored in github_automation_config table
 * See docs/ticket-system.md for full automation details
 */
