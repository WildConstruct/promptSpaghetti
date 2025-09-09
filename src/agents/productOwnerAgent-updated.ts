// src/agents/productOwnerAgent-updated.ts
// Product Owner agent - focuses on story creation and prioritization

import { AgentRunner } from './agentBase';

export class ProductOwnerAgent extends AgentRunner {
  constructor() {
    super('product_owner_agent', 'product_owner');
  }

  /**
   * Filter for PO-relevant events
   */
  filterRelevant(events: any[]): any[] {
    const relevantTypes = [
      'GOAL_CREATED',
      'STORY_REQUESTED',
      'METRICS_ANALYZED',
      'TASK_COMPLETED',
      'TASK_APPROVED',
      'PR_MERGED' // New: Track completed work via merged PRs
    ];

    return events.filter(ev => relevantTypes.includes(ev.type));
  }

  /**
   * Product Owner decision logic
   */
  async decide(ev: any, state: any): Promise<any> {
    switch (ev.type) {
      case 'GOAL_CREATED':
        // Create stories for new goals
        const goal = ev.payload.goal;
        if (goal && this.getStoriesForGoal(state, goal.id).length === 0) {
          return this.createStoryForGoal(goal);
        }
        break;

      case 'METRICS_ANALYZED':
        // Review metrics and adjust priorities
        const metrics = ev.payload;
        if (metrics.velocity < 5) {
          return this.createEvent('PRIORITY_ADJUSTED', {
            reason: 'Low velocity detected, simplifying upcoming stories',
            velocity: metrics.velocity
          });
        }
        break;

      case 'PR_MERGED':
        // Track feature completion
        return this.createEvent('FEATURE_COMPLETED', {
          task_id: ev.payload.task_id,
          pr_number: ev.payload.pr_number,
          completed_at: new Date().toISOString()
        });
    }

    // Check if we need more stories
    const storyCheck = this.checkStoryBacklog(state);
    if (storyCheck) {
      return storyCheck;
    }

    // Review goal progress
    const goalProgress = this.checkGoalProgress(state);
    if (goalProgress) {
      return goalProgress;
    }

    return 'NOOP';
  }

  /**
   * Create a story for a goal
   */
  private createStoryForGoal(goal: any): any {
    const storyTemplates = [
      {
        title: 'User authentication system',
        acceptance: [
          'Users can register with email',
          'Users can login securely',
          'Password reset functionality',
          'Session management'
        ],
        priority: 1
      },
      {
        title: 'Data visualization dashboard',
        acceptance: [
          'Display key metrics',
          'Interactive charts',
          'Export functionality',
          'Real-time updates'
        ],
        priority: 2
      },
      {
        title: 'API rate limiting',
        acceptance: [
          'Implement token bucket algorithm',
          'Per-user rate limits',
          'Admin override capability',
          'Rate limit headers in responses'
        ],
        priority: 3
      }
    ];

    // Select a template
    const template =
      storyTemplates[Math.floor(Math.random() * storyTemplates.length)];

    const story = {
      id: `S-${Date.now()}`,
      goal_id: goal.id,
      title: `${template.title} for ${goal.title}`,
      acceptance: template.acceptance,
      priority: template.priority,
      status: 'READY',
      tasks: [] // Scrum Master will create tasks
    };

    return this.createEvent('STORY_CREATED', { story });
  }

  /**
   * Check if we need more stories in the backlog
   */
  private checkStoryBacklog(state: any): any {
    const readyStories = state.stories.filter((s: any) => s.status === 'READY');
    const totalTasks = Object.keys(state.tasks).length;
    const unassignedTasks = Object.values(state.tasks).filter(
      (t: any) => t.state === 'UNASSIGNED'
    ).length;

    // If we have few ready stories and most tasks are assigned, create more
    if (readyStories.length < 3 && unassignedTasks < 5) {
      const activeGoals = state.product_goals.filter(
        (g: any) => g.status === 'ACTIVE'
      );
      if (activeGoals.length > 0) {
        // Pick a goal that needs more stories
        for (const goal of activeGoals) {
          const goalStories = this.getStoriesForGoal(state, goal.id);
          if (goalStories.length < 5) {
            return this.createStoryForGoal(goal);
          }
        }
      }
    }

    return null;
  }

  /**
   * Check progress toward goals
   */
  private checkGoalProgress(state: any): any {
    for (const goal of state.product_goals) {
      if (goal.status !== 'ACTIVE') continue;

      const stories = this.getStoriesForGoal(state, goal.id);
      const completedStories = stories.filter((s: any) => {
        // Story is complete if all its tasks are completed or approved
        const storyTasks = Object.values(state.tasks).filter(
          (t: any) => t.story_id === s.id
        );
        return (
          storyTasks.length > 0 &&
          storyTasks.every((t: any) =>
            ['COMPLETED', 'APPROVED'].includes(t.state)
          )
        );
      });

      const progress =
        stories.length > 0
          ? (completedStories.length / stories.length) * 100
          : 0;

      if (progress >= 80) {
        return this.createEvent('GOAL_NEARING_COMPLETION', {
          goal_id: goal.id,
          progress: progress,
          completed_stories: completedStories.length,
          total_stories: stories.length
        });
      }
    }

    return null;
  }

  /**
   * Get all stories for a specific goal
   */
  private getStoriesForGoal(state: any, goalId: string): any[] {
    return state.stories.filter((s: any) => s.goal_id === goalId);
  }
}

/**
 * Note: Product Owner focuses on:
 * 1. Creating stories for active goals
 * 2. Monitoring story backlog levels
 * 3. Tracking feature completion via PR merges
 * 4. Adjusting priorities based on metrics
 *
 * Stories are automatically converted to tasks by Scrum Master
 * Developers self-assign tasks using grab-tasks.js
 * Completed work tracked through GitHub PR merges
 *
 * See docs/ticket-system.md for GitHub automation details
 */
